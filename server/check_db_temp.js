import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Turf from './models/Turf.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/turfbook';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    const t = await Turf.findOne({ name: 'happyArena' }).populate('owner');
    console.log(JSON.stringify(t, null, 2));
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

check();
