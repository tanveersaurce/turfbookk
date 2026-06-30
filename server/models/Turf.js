import mongoose from 'mongoose';

const turfSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  area: {
    type: String,
    required: true,
    trim: true,
  },
  mapsLink: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  sports: [{
    type: String,
    enum: ['football', 'cricket', 'basketball', 'badminton', 'tennis', 'kabaddi'],
    required: true,
  }],
  pricePerHour: {
    type: Number,
    required: true,
    min: 0,
  },
  lightingFees: {
    type: Number,
    default: 0,
    min: 0,
  },
  images: [{
    type: String, // Cloudinary URLs
  }],
  amenities: [{
    type: String, // e.g. ['Parking', 'Floodlights', 'Changing Room', 'Washroom']
  }],
  rules: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  operatingHours: {
    open: {
      type: String,
      required: true,
      default: '06:00', // Format: HH:MM
    },
    close: {
      type: String,
      required: true,
      default: '23:00', // Format: HH:MM
    },
  },
  weeklySchedule: {
    mon: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' }, isOpen: { type: Boolean, default: true } },
    tue: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' }, isOpen: { type: Boolean, default: true } },
    wed: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' }, isOpen: { type: Boolean, default: true } },
    thu: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' }, isOpen: { type: Boolean, default: true } },
    fri: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' }, isOpen: { type: Boolean, default: true } },
    sat: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' }, isOpen: { type: Boolean, default: true } },
    sun: { open: { type: String, default: '06:00' }, close: { type: String, default: '22:00' }, isOpen: { type: Boolean, default: true } }
  },
  slots: [{
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    startTime: { type: String, required: true }, // Format: HH:MM
    endTime: { type: String, required: true }, // Format: HH:MM
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  }],
  blockedSlots: [{
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    startTime: { type: String, required: true }, // Format: HH:MM
    endTime: { type: String, required: true }, // Format: HH:MM
    reason: { type: String },
  }],
}, { timestamps: true });

// Create indexes for efficient slot queries & geo searching
turfSchema.index({ city: 1, isApproved: 1, isActive: 1 });
turfSchema.index({ 'slots.date': 1 });

const Turf = mongoose.model('Turf', turfSchema);
export default Turf;
