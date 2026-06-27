import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Force node to resolve DNS using Google/Cloudflare DNS to bypass local ISP DNS SRV lookup issues
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('⚠️ Failed to configure DNS servers:', dnsErr.message);
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/turfbook';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    });
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);

    // Check if the MongoDB deployment supports replica set transactions
    try {
      const helloStatus = await conn.connection.db.admin().command({ hello: 1 });
      global.supportsTransactions = !!(helloStatus.setName || helloStatus.isreplicaset || helloStatus.msg === 'isdbgrid');
      console.log(`🔒 MongoDB Transaction Support: ${global.supportsTransactions ? 'ENABLED (Replica Set / Sharded)' : 'DISABLED (Standalone DB Fallback active)'}`);
    } catch (cmdErr) {
      // Fallback check
      global.supportsTransactions = false;
      console.log('🔒 MongoDB Transaction Support: DISABLED (Metadata check failed)');
    }
  } catch (error) {
    global.supportsTransactions = false;
    console.warn(`⚠️  MongoDB Connection Warning: ${error.message}`);
    console.log('💡 Tip: Start local MongoDB or configure MONGO_URI in .env to enable database operations.');
  }
};

export default connectDB;
