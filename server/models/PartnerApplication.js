import mongoose from 'mongoose';
import crypto from 'crypto';

const partnerApplicationSchema = new mongoose.Schema({
  applicantName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  gstNumber: {
    type: String,
    default: '',
  },
  hasGst: {
    type: Boolean,
    default: false,
  },
  businessAddress: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  turfName: {
    type: String,
    required: true,
  },
  turfAddress: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  mapsLink: {
    type: String,
    default: '',
  },
  operatingHours: {
    open: {
      type: String,
      required: true,
    },
    close: {
      type: String,
      required: true,
    },
  },
  pricePerHour: {
    type: Number,
    required: true,
  },
  sports: [{
    type: String,
    enum: ['football', 'cricket', 'basketball', 'badminton', 'tennis', 'kabaddi'],
  }],
  amenities: [{
    type: String,
  }],
  rules: {
    type: String,
    default: '',
  },
  cancellationPolicy: {
    type: String,
    enum: ['no-refund', '50-percent', 'full-refund'],
    required: true,
  },
  turfImages: [{
    type: String,
  }],
  coverImageIndex: {
    type: Number,
    default: 0,
  },
  gstCertificateUrl: {
    type: String,
    default: '',
  },
  idProofUrl: {
    type: String,
    default: '',
  },
  agreedToTerms: {
    type: Boolean,
    required: true,
  },
  applicationId: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'more_info_needed'],
    default: 'pending',
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  additionalInfoRequest: {
    type: String,
    default: null,
  },
  createdOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdTurfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    default: null,
  },
}, { timestamps: true });

// Pre-save hook to generate applicationId in format TB-2024-XXXX
partnerApplicationSchema.pre('save', function (next) {
  if (!this.applicationId) {
    const random = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 chars
    this.applicationId = `TB-2024-${random}`;
  }
  next();
});

const PartnerApplication = mongoose.model('PartnerApplication', partnerApplicationSchema);
export default PartnerApplication;
