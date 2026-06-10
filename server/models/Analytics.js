import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  week: {
    type: String, // Format: YYYY-Www (e.g. 2026-W24)
    required: true,
    unique: true,
  },
  totalBookings: {
    type: Number,
    required: true,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    required: true,
    default: 0,
  },
  newUsers: {
    type: Number,
    required: true,
    default: 0,
  },
  newTurfs: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
