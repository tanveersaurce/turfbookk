import Booking from '../models/Booking.js';
import Turf from '../models/Turf.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

// @desc    Initiate a Booking (Status: Pending)
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  const useTransaction = global.supportsTransactions !== false;
  const session = useTransaction ? await mongoose.startSession() : null;
  if (useTransaction && session) {
    session.startTransaction();
  }

  try {
    const { turfId, date, startTime, endTime, sport } = req.body;

    if (!turfId || !date || !startTime || !endTime || !sport) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ success: false, message: 'Please provide all booking fields.' });
    }

    const turf = useTransaction
      ? await Turf.findById(turfId).session(session)
      : await Turf.findById(turfId);
      
    if (!turf) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({ success: false, message: 'Turf not found.' });
    }

    // 1. Calculate duration and amount
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const duration = (endH * 60 + endM - (startH * 60 + startM)) / 60; // Duration in hours

    if (duration <= 0) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ success: false, message: 'Invalid start and end times.' });
    }

    // Concurrency / past slot safeguard: prevent booking slots that are in the past today
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (date === todayStr) {
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (startTime < currentTimeStr) {
        if (useTransaction && session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({ success: false, message: 'Cannot book a slot that has already passed.' });
      }
    }

    const totalAmount = (turf.pricePerHour + (turf.lightingFees || 0)) * duration;

    // 2. Double-booking check: Ensure slots are available in Turf model
    const turfSlots = turf.slots.filter(
      (slot) =>
        slot.date === date &&
        slot.startTime >= startTime &&
        slot.endTime <= endTime
    );

    if (turfSlots.length === 0) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ success: false, message: 'Selected slots are not open or not generated yet.' });
    }

    const isAnyUnavailable = turfSlots.some(slot => slot.isBooked || slot.isBlocked);
    if (isAnyUnavailable) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ success: false, message: 'One or more of the selected slots are already booked or blocked.' });
    }

    // 3. Create Booking in Pending status (awaiting Razorpay Payment validation)
    const booking = await Booking.create([{
      user: req.user.id,
      turf: turfId,
      owner: turf.owner,
      date,
      startTime,
      endTime,
      duration,
      sport,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
    }], useTransaction ? { session } : {});

    if (useTransaction && session) {
      await session.commitTransaction();
      session.endSession();
    }

    res.status(201).json({
      success: true,
      message: 'Booking initiated. Proceed to payment.',
      data: booking[0],
    });
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
      session.endSession();
    }
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('turf', 'name city area images address pricePerHour')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('user', 'name email phone')
      .populate('turf', 'name city area images address location pricePerHour')
      .populate('owner', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Check authorization: User, Owner, or Admin
    if (
      booking.user._id.toString() !== req.user.id &&
      booking.owner._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking.' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking (marks slot available)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  const useTransaction = global.supportsTransactions !== false;
  const session = useTransaction ? await mongoose.startSession() : null;
  if (useTransaction && session) {
    session.startTransaction();
  }

  try {
    const { id } = req.params;

    const booking = useTransaction
      ? await Booking.findById(id).session(session)
      : await Booking.findById(id);
      
    if (!booking) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Authorization check
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin' && booking.owner.toString() !== req.user.id) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking.' });
    }

    if (booking.status === 'cancelled') {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    // Update status
    booking.status = 'cancelled';
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded'; // Mock refund tag
    }
    await booking.save(useTransaction ? { session } : {});

    // Release Turf Slots
    const turf = useTransaction
      ? await Turf.findById(booking.turf).session(session)
      : await Turf.findById(booking.turf);
      
    if (turf) {
      for (const slot of turf.slots) {
        if (
          slot.date === booking.date &&
          slot.startTime >= booking.startTime &&
          slot.endTime <= booking.endTime
        ) {
          slot.isBooked = false;
          slot.bookedBy = null;
        }
      }
      await turf.save(useTransaction ? { session } : {});
    }

    // Send notifications
    await Notification.create([{
      user: booking.user,
      type: 'booking',
      title: 'Booking Cancelled',
      message: `Your booking at ${turf.name} for ${booking.date} is cancelled.`,
      link: '/bookings',
    }], useTransaction ? { session } : {});

    await Notification.create([{
      user: booking.owner,
      type: 'booking',
      title: 'Booking Cancelled',
      message: `Booking ${booking.bookingId} at ${turf.name} was cancelled by the client.`,
      link: '/owner/bookings',
    }], useTransaction ? { session } : {});

    if (useTransaction && session) {
      await session.commitTransaction();
      session.endSession();
    }

    // Emit live slot updates if Socket.io is running
    if (global.io) {
      global.io.to(`${booking.turf}_${booking.date}`).emit('slot-cancelled', {
        turfId: booking.turf,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
      });
    }

    res.status(200).json({ success: true, message: 'Booking cancelled successfully.', data: booking });
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
      session.endSession();
    }
    next(error);
  }
};

// @desc    Get Owner's bookings
// @route   GET /api/bookings/owner/all
// @access  Private (Owner only)
export const getOwnerBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ owner: req.user.id })
      .populate('turf', 'name city area images address pricePerHour')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};
