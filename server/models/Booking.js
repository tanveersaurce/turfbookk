import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  turf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  startTime: {
    type: String, // Format: HH:MM
    required: true,
  },
  endTime: {
    type: String, // Format: HH:MM
    required: true,
  },
  duration: {
    type: Number, // Duration in hours or minutes
    required: true,
  },
  sport: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
  bookingId: {
    type: String,
    unique: true,
    required: true,
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
}, { timestamps: true });

// Pre-validate hook to generate a unique booking ID before saving
bookingSchema.pre('validate', function(next) {
  if (!this.bookingId) {
    // Generate a unique 8-character uppercase booking ID (e.g. TBK4A89D)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'TBK';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.bookingId = result;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
