import mongoose from 'mongoose';

const slotLockSchema = new mongoose.Schema({
  turfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  slotId: {
    type: String, // Format: "HH:MM-HH:MM"
    required: true,
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index: document will expire at the expiresAt date
  },
}, { timestamps: true });

// Ensure a slot can only be locked once for a given turf, date, and slot ID
slotLockSchema.index({ turfId: 1, date: 1, slotId: 1 }, { unique: true });

const SlotLock = mongoose.model('SlotLock', slotLockSchema);
export default SlotLock;
