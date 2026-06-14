import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String, // Cloudinary secure URL
  },
  role: {
    type: String,
    enum: ['user', 'owner', 'admin'],
    default: 'user',
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: true,
  },
  mustChangePassword: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Pre-save password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  if (this.passwordHash.startsWith('$2a$') || this.passwordHash.startsWith('$2b$')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
