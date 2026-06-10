import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  linkUrl: {
    type: String,
    default: '#',
  },
  placement: {
    type: String,
    enum: ['Homepage Top', 'Homepage Mid Section', 'Sidebar'],
    default: 'Homepage Top',
  },
  startDate: {
    type: String,
  },
  endDate: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const Ad = mongoose.model('Ad', adSchema);
export default Ad;
