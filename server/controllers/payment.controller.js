import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Turf from '../models/Turf.js';
import Notification from '../models/Notification.js';
import sendEmail from '../utils/sendEmail.js';
import { bookingConfirmationEmail } from '../utils/emailTemplates.js';
import mongoose from 'mongoose';

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_default',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_default',
  });
};

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('turf');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const razorpay = getRazorpayInstance();
    const options = {
      amount: booking.totalAmount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: booking.bookingId,
    };

    const order = await razorpay.orders.create(options);

    // Save Razorpay order ID to booking
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId: booking.bookingId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature & Complete Booking
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  // Use a session for transaction to ensure atomic double-booking prevention
  const useTransaction = global.supportsTransactions !== false;
  const session = useTransaction ? await mongoose.startSession() : null;
  if (useTransaction && session) {
    session.startTransaction();
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_default';
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
    }

    // Find booking
    const booking = useTransaction
      ? await Booking.findOne({ razorpayOrderId: razorpay_order_id }).session(session)
      : await Booking.findOne({ razorpayOrderId: razorpay_order_id });
      
    if (!booking) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({ success: false, message: 'Booking record not found for this payment order.' });
    }

    if (booking.status === 'confirmed') {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ success: false, message: 'Booking is already confirmed.' });
    }

    // Update booking state
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.razorpayPaymentId = razorpay_payment_id;
    await booking.save(useTransaction ? { session } : {});

    // Check if slots are already booked by someone else (Double-booking prevention check)
    const turf = useTransaction
      ? await Turf.findById(booking.turf).session(session)
      : await Turf.findById(booking.turf);
      
    if (!turf) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({ success: false, message: 'Turf venue not found.' });
    }

    // Find slots in turf matching booking details and check if they are already booked
    const bookingSlots = turf.slots.filter(
      (slot) =>
        slot.date === booking.date &&
        slot.startTime >= booking.startTime &&
        slot.endTime <= booking.endTime
    );

    const alreadyBooked = bookingSlots.some((slot) => slot.isBooked);
    if (alreadyBooked) {
      // Refund would be initiated in a real-world app, here we cancel and fail transaction
      booking.status = 'cancelled';
      booking.paymentStatus = 'refunded';
      await booking.save(useTransaction ? { session } : {});

      if (useTransaction && session) {
        await session.commitTransaction();
        session.endSession();
      }
      return res.status(400).json({ success: false, message: 'Slot already booked by another user. Refund will be initiated.' });
    }

    // Update turf slots to isBooked: true
    for (const slot of turf.slots) {
      if (
        slot.date === booking.date &&
        slot.startTime >= booking.startTime &&
        slot.endTime <= booking.endTime
      ) {
        slot.isBooked = true;
        slot.bookedBy = booking.user;
      }
    }
    await turf.save(useTransaction ? { session } : {});

    // Create notification for user
    await Notification.create([{
      user: booking.user,
      type: 'booking',
      title: 'Booking Confirmed!',
      message: `Your booking at ${turf.name} for ${booking.date} at ${booking.startTime} - ${booking.endTime} is confirmed.`,
      link: `/booking-confirmed?id=${booking._id}`,
    }], useTransaction ? { session } : {});

    // Create notification for owner
    await Notification.create([{
      user: turf.owner,
      type: 'booking',
      title: 'New Turf Booking',
      message: `${turf.name} has been booked on ${booking.date} at ${booking.startTime} - ${booking.endTime}.`,
      link: `/owner/bookings`,
    }], useTransaction ? { session } : {});

    // Commit Transaction
    if (useTransaction && session) {
      await session.commitTransaction();
      session.endSession();
    }

    // Fetch user email details to send confirmation (outside transaction to avoid external network locks)
    const user = await mongoose.model('User').findById(booking.user);
    if (user && user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: `Booking Confirmed: ${booking.bookingId}`,
          html: bookingConfirmationEmail(booking, user, turf),
        });
      } catch (emailErr) {
        console.error('Nodemailer booking confirmation failed:', emailErr.message);
      }
    }

    // Emit live slot updates if Socket.io is running (will be triggered in router wrapper or handled globally)
    if (global.io) {
      global.io.to(`${booking.turf}_${booking.date}`).emit('slot-booked', {
        turfId: booking.turf,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully.',
      data: booking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Get Payment Receipt Details
// @route   GET /api/payment/receipt/:bookingId
// @access  Private
export const getReceipt = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId })
      .populate('user', 'name email phone')
      .populate('turf', 'name address city area');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
