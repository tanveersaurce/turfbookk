import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './models/User.js';
import Turf from './models/Turf.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';
import Notification from './models/Notification.js';
import SlotLock from './models/SlotLock.js';
import Analytics from './models/Analytics.js';
import { generateDailySlots } from './utils/slotGenerator.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/turfbook';

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding process...');
    
    // Configure DNS to bypass local ISP lookup issues for MongoDB Atlas
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (dnsErr) {
      console.warn('⚠️ Failed to configure DNS servers:', dnsErr.message);
    }

    await mongoose.connect(MONGO_URI);
    console.log('📡 Connected to MongoDB Database.');

    // 1. Clear existing collections
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Turf.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await SlotLock.deleteMany({});
    await Analytics.deleteMany({});
    console.log('🧹 Cleaned database collections.');

    // 2. Seed Admin User
    console.log('👤 Seeding Admin User...');
    const admin = await User.create({
      name: 'TurfBook Admin',
      email: 'admin@turfbook.com',
      passwordHash: 'Admin@123', // Will be hashed by pre-save hook
      phone: '9999988888',
      city: 'Delhi',
      role: 'admin',
      isVerified: true,
      isActive: true,
    });

    // 3. Seed Owner Users
    console.log('👥 Seeding Owner Users...');
    const owner1 = await User.create({ name: 'Rahul Sharma', email: 'rahul@owner.com', passwordHash: 'Owner@123', phone: '9876543201', city: 'Bhopal', role: 'owner', isVerified: true, isActive: true });
    const owner2 = await User.create({ name: 'Priya Singh', email: 'priya@owner.com', passwordHash: 'Owner@123', phone: '9876543202', city: 'Mumbai', role: 'owner', isVerified: true, isActive: true });
    const owner3 = await User.create({ name: 'Arjun Verma', email: 'arjun@owner.com', passwordHash: 'Owner@123', phone: '9876543203', city: 'Delhi', role: 'owner', isVerified: true, isActive: true });

    // 4. Seed Regular Users
    console.log('👥 Seeding Regular Users...');
    const user1 = await User.create({ name: 'Kabir Sharma', email: 'kabir@gmail.com', passwordHash: 'User@123', phone: '9876543210', city: 'Bhopal', role: 'user', isVerified: true, isActive: true });
    const user2 = await User.create({ name: 'Rohit Verma', email: 'rohit@gmail.com', passwordHash: 'User@123', phone: '9876543211', city: 'Mumbai', role: 'user', isVerified: true, isActive: true });
    const user3 = await User.create({ name: 'Nisha Gupta', email: 'nisha@gmail.com', passwordHash: 'User@123', phone: '9876543212', city: 'Delhi', role: 'user', isVerified: true, isActive: true });
    const user4 = await User.create({ name: 'Amit Patel', email: 'amit@gmail.com', passwordHash: 'User@123', phone: '9876543213', city: 'Bhopal', role: 'user', isVerified: true, isActive: true });
    const user5 = await User.create({ name: 'Sneha Rao', email: 'sneha@gmail.com', passwordHash: 'User@123', phone: '9876543214', city: 'Mumbai', role: 'user', isVerified: true, isActive: true });

    // 5. Seed Turfs (6 turfs, 2 per owner)
    console.log('🏟️ Seeding Turfs & Generating Availability Slots...');
    
    // Generate dates for next 7 days
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      next7Days.push(d.toISOString().split('T')[0]);
    }

    const generateSlotsForTurf = (open, close) => {
      const slots = [];
      for (const date of next7Days) {
        const daily = generateDailySlots(open, close, 60);
        slots.push(...daily.map(s => ({ ...s, date })));
      }
      return slots;
    };

    const turf1 = await Turf.create({
      owner: owner1._id,
      name: 'The Apex Arena - Professional Turf',
      description: 'Apex Arena offers a premium 7-a-side football and cricket experience with our FIFA-certified high-density synthetic grass. Designed for professionals and enthusiasts alike, the facility features advanced shock-absorption technology to reduce impact and high-performance floodlights for night games.',
      address: 'Downtown Sports Hub',
      city: 'Manchester',
      area: 'Downtown Sports Hub',
      location: { lat: 53.4808, lng: -2.2426 },
      sports: ['football', 'cricket'],
      pricePerHour: 45,
      lightingFees: 5,
      amenities: ['Free WiFi', 'Valet Parking', 'Showers', 'Cafeteria', 'First Aid', 'Lockers'],
      rules: 'Sports shoes required. Rubber studs only. Please report 15 mins early.',
      rating: 4.9,
      totalReviews: 124,
      isApproved: true,
      isActive: true,
      operatingHours: { open: '08:00', close: '23:00' },
      slots: generateSlotsForTurf('06:00', '23:00'),
      images: [
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1570498839593-e565b39455fc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80'
      ],
    });

    const turf2 = await Turf.create({
      owner: owner1._id,
      name: 'Blueline Arena',
      description: 'Clean and professional indoor multi-sport court. Fully ventilated, synthetic flooring. Highly popular for corporate badminton events.',
      address: '12, MP Nagar Zone 2, Behind Sargam Talkies',
      city: 'Bhopal',
      area: 'MP Nagar',
      location: { lat: 23.232, lng: 77.425 },
      sports: ['football', 'badminton'],
      pricePerHour: 600,
      lightingFees: 100,
      amenities: ['Parking', 'Washroom', 'Water cooler'],
      rules: 'Non-marking shoes only. Bookings cannot be cancelled within 12 hours.',
      rating: 4.5,
      totalReviews: 2,
      isApproved: true,
      isActive: true,
      operatingHours: { open: '07:00', close: '22:00' },
      slots: generateSlotsForTurf('07:00', '22:00'),
      images: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'
      ],
    });

    const turf3 = await Turf.create({
      owner: owner2._id,
      name: 'The New Indoor Center',
      description: 'Gigantic indoor wooden floor sports complex. Caters to basketball shootouts and box cricket. Lockers and shower facilities available.',
      address: 'Plot 42, Bandra Kurla Complex',
      city: 'Mumbai',
      area: 'Bandra',
      location: { lat: 19.076, lng: 72.877 },
      sports: ['cricket', 'basketball'],
      pricePerHour: 1000,
      lightingFees: 200,
      amenities: ['Parking', 'Changing Room', 'Lockers', 'Showers'],
      rules: 'Please maintain clean environment. Respect other players.',
      rating: 4.8,
      totalReviews: 2,
      isApproved: true,
      isActive: true,
      operatingHours: { open: '06:00', close: '23:00' },
      slots: generateSlotsForTurf('06:00', '23:00'),
      images: [
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80'
      ],
    });

    const turf4 = await Turf.create({
      owner: owner2._id,
      name: 'Ground Sound Arena',
      description: 'Fenced outdoor football turf with high grade artificial grass. Located near the sea breeze. Top choice for local clubs.',
      address: 'Carter Road, Bandra West',
      city: 'Mumbai',
      area: 'Bandra West',
      location: { lat: 19.068, lng: 72.822 },
      sports: ['football'],
      pricePerHour: 700,
      lightingFees: 100,
      amenities: ['Parking', 'Washroom', 'Floodlights'],
      rules: 'Proper football kit recommended. No sharp objects permitted.',
      rating: 0,
      totalReviews: 0,
      isApproved: true,
      isActive: true,
      operatingHours: { open: '06:00', close: '22:00' },
      slots: generateSlotsForTurf('06:00', '22:00'),
      images: [
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
      ],
    });

    const turf5 = await Turf.create({
      owner: owner3._id,
      name: 'Delhi Sports Hub',
      description: 'Premium sprawling sports destination. Features high quality lawn tennis courts, cricket pitches and football turfs. International standards.',
      address: 'Sector 10, Dwarka, Near Metro Station',
      city: 'Delhi',
      area: 'Dwarka',
      location: { lat: 28.582, lng: 77.062 },
      sports: ['football', 'cricket', 'tennis'],
      pricePerHour: 900,
      lightingFees: 150,
      amenities: ['Parking', 'Washroom', 'Floodlights', 'Changing Room', 'First Aid'],
      rules: 'Arrive 10 mins before slot. Bring booking receipt. Follow coach guidelines.',
      rating: 0,
      totalReviews: 0,
      isApproved: true,
      isActive: true,
      operatingHours: { open: '05:00', close: '23:00' },
      slots: generateSlotsForTurf('05:00', '23:00'),
      images: [
        'https://images.unsplash.com/photo-1595150543414-f584e03f56e1?auto=format&fit=crop&w=800&q=80'
      ],
    });

    const turf6 = await Turf.create({
      owner: owner3._id,
      name: 'Pro Kick Arena',
      description: 'Pending approval turf for testing the admin queue functionality. Excellent facility with state-of-the-art courts.',
      address: 'Vasant Kunj, Sector B',
      city: 'Delhi',
      area: 'Vasant Kunj',
      location: { lat: 28.530, lng: 77.159 },
      sports: ['football', 'badminton'],
      pricePerHour: 500,
      lightingFees: 80,
      amenities: ['Washroom', 'Water cooler'],
      rules: 'Non marking shoes mandatory for badminton.',
      rating: 0,
      totalReviews: 0,
      isApproved: false, // Pending listing
      isActive: true,
      operatingHours: { open: '06:00', close: '22:00' },
      slots: generateSlotsForTurf('06:00', '22:00'),
      images: [
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80'
      ],
    });

    // 6. Seed Bookings (10 bookings, past & future)
    console.log('📅 Seeding Bookings & Committing Slot States...');
    
    // Helper to calculate totalAmount
    const calculateAmount = (price, hr) => price * hr;

    const bookingData = [
      // Completed Booking 1
      {
        user: user1._id,
        turf: turf1._id,
        owner: owner1._id,
        date: next7Days[0],
        startTime: '17:00',
        endTime: '19:00',
        duration: 2,
        sport: 'football',
        totalAmount: calculateAmount(turf1.pricePerHour, 2),
        status: 'completed',
        paymentStatus: 'paid',
        bookingId: 'TBK59A1E0',
      },
      // Completed Booking 2
      {
        user: user1._id,
        turf: turf1._id,
        owner: owner1._id,
        date: next7Days[0],
        startTime: '10:00',
        endTime: '11:00',
        duration: 1,
        sport: 'cricket',
        totalAmount: calculateAmount(turf1.pricePerHour, 1),
        status: 'completed',
        paymentStatus: 'paid',
        bookingId: 'TBK3A7F21',
      },
      // Confirmed Future Booking 1
      {
        user: user2._id,
        turf: turf1._id,
        owner: owner1._id,
        date: next7Days[1],
        startTime: '18:00',
        endTime: '20:00',
        duration: 2,
        sport: 'football',
        totalAmount: calculateAmount(turf1.pricePerHour, 2),
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingId: 'TBK8E4C02',
      },
      // Confirmed Future Booking 2
      {
        user: user3._id,
        turf: turf3._id,
        owner: owner2._id,
        date: next7Days[2],
        startTime: '08:00',
        endTime: '10:00',
        duration: 2,
        sport: 'basketball',
        totalAmount: calculateAmount(turf3.pricePerHour, 2),
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingId: 'TBK7A1F92',
      },
      // Cancelled Booking
      {
        user: user4._id,
        turf: turf1._id,
        owner: owner1._id,
        date: next7Days[1],
        startTime: '12:00',
        endTime: '13:00',
        duration: 1,
        sport: 'football',
        totalAmount: calculateAmount(turf1.pricePerHour, 1),
        status: 'cancelled',
        paymentStatus: 'refunded',
        bookingId: 'TBK9F4D09',
      },
      // Pending Booking (not paid yet)
      {
        user: user5._id,
        turf: turf2._id,
        owner: owner1._id,
        date: next7Days[2],
        startTime: '16:00',
        endTime: '18:00',
        duration: 2,
        sport: 'badminton',
        totalAmount: calculateAmount(turf2.pricePerHour, 2),
        status: 'pending',
        paymentStatus: 'pending',
        bookingId: 'TBK4F2A10',
      },
      // User 2 Completed
      {
        user: user2._id,
        turf: turf2._id,
        owner: owner1._id,
        date: next7Days[0],
        startTime: '19:00',
        endTime: '21:00',
        duration: 2,
        sport: 'badminton',
        totalAmount: calculateAmount(turf2.pricePerHour, 2),
        status: 'completed',
        paymentStatus: 'paid',
        bookingId: 'TBK99C4B2',
      },
      // User 3 Completed
      {
        user: user3._id,
        turf: turf3._id,
        owner: owner2._id,
        date: next7Days[0],
        startTime: '14:00',
        endTime: '15:00',
        duration: 1,
        sport: 'cricket',
        totalAmount: calculateAmount(turf3.pricePerHour, 1),
        status: 'completed',
        paymentStatus: 'paid',
        bookingId: 'TBK33F9C1',
      }
    ];

    const bookings = await Booking.create(bookingData);

    // Update the corresponding slot objects in Turf documents to isBooked: true for confirmed/completed bookings
    for (const b of bookings) {
      if (b.status === 'confirmed' || b.status === 'completed') {
        const turfDoc = await Turf.findById(b.turf);
        if (turfDoc) {
          turfDoc.slots = turfDoc.slots.map(s => {
            if (s.date === b.date && s.startTime >= b.startTime && s.endTime <= b.endTime) {
              return { ...s, isBooked: true, bookedBy: b.user };
            }
            return s;
          });
          await turfDoc.save();
        }
      }
    }

    // 7. Seed Reviews (8 reviews - only for completed bookings)
    console.log('⭐ Seeding Reviews...');
    
    // Find completed bookings
    const completedBookings = bookings.filter(b => b.status === 'completed');

    const reviews = [
      { user: user1._id, turf: turf1._id, booking: completedBookings[0]._id, rating: 5, comment: 'Exceptional football turf! The grass condition is top notch and the lighting is very professional. Had a great league match here.' },
      { user: user1._id, turf: turf1._id, booking: completedBookings[1]._id, rating: 5, comment: 'Great box cricket experience. The pitch bounce is perfect and the dugout has plenty of room.' },
      { user: user2._id, turf: turf2._id, booking: completedBookings[2]._id, rating: 4, comment: 'Very nice ventilated badminton courts. Clean mats and good lighting. Recommended!' },
      { user: user3._id, turf: turf3._id, booking: completedBookings[3]._id, rating: 5, comment: 'Huge wooden court for basketball. Very clean showers and changing rooms. Worth the price.' }
    ];

    await Review.create(reviews);

    // Re-verify rating calculations
    await Turf.findByIdAndUpdate(turf1._id, { rating: 5.0, totalReviews: 2 });
    await Turf.findByIdAndUpdate(turf2._id, { rating: 4.0, totalReviews: 1 });
    await Turf.findByIdAndUpdate(turf3._id, { rating: 5.0, totalReviews: 1 });

    // 8. Seed Notifications (5 per user)
    console.log('🔔 Seeding Notifications...');
    const users = [user1, user2, user3, user4, user5];
    for (const u of users) {
      await Notification.create([
        { user: u._id, type: 'system', title: 'Welcome to TurfBook!', message: 'Thank you for registering. Explore and book matches near you.', isRead: true },
        { user: u._id, type: 'booking', title: 'Profile Updated', message: 'You have successfully initialized your profile details.', isRead: true },
        { user: u._id, type: 'tournament', title: 'Bhopal Soccer Cup 2026', message: 'Registrations are now open for the summer tournament. Check it out!', isRead: false },
        { user: u._id, type: 'booking', title: 'Payment verified', message: 'Your booking transaction was verified successfully.', isRead: false },
        { user: u._id, type: 'system', title: 'App Updates', message: 'We have added support for real-time slot locking and autocomplete suggestions.', isRead: false }
      ]);
    }

    console.log('\n=============================================');
    console.log('✅ Database seeded successfully');
    console.log('Admin: admin@turfbook.com / Admin@123');
    console.log('Regular User: kabir@gmail.com / User@123');
    console.log('Owner User: rahul@owner.com / Owner@123');
    console.log('Run: npm run seed (to reseed anytime)');
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('💥 Database seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
