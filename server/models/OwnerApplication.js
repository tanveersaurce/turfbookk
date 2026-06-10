import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ownerApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  turfAddress: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: {
    type: String,
  },
}, { timestamps: true });

// Pre-save password hashing for application
ownerApplicationSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const OwnerApplication = mongoose.model('OwnerApplication', ownerApplicationSchema);
export default OwnerApplication;
