import cron from 'node-cron';
import Turf from '../models/Turf.js';
import SlotLock from '../models/SlotLock.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Analytics from '../models/Analytics.js';
import sendEmail from './sendEmail.js';
import { generateWeekSlots } from './slotGenerator.js';

// Setup scheduled tasks
export const initCronJobs = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('⏰ Initializing scheduled cron jobs...');
  }

  // Job 1 — Daily Slot Generation (runs at 00:01 AM every day)
  // Generates slots for the 7th rolling day ahead to maintain a 7-day booking window
  cron.schedule('1 0 * * *', async () => {
    try {
      const activeTurfs = await Turf.find({ isActive: true, isApproved: true });
      let counter = 0;

      for (const turf of activeTurfs) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 6); // 7th day (0-indexed + 6)
        
        // Generates slots for that specific day if they don't exist
        await generateWeekSlots(turf, targetDate, 1);
        counter++;
      }

      console.log(`⏰ [Cron] Daily slot generation completed. Slots generated for ${counter} turfs.`);
    } catch (error) {
      console.error('💥 [Cron] Error in daily slot generation job:', error.message);
    }
  });

  // Job 2 — Expired Lock Cleanup (runs every 5 minutes)
  // Cleans up slot locks that are past their expiresAt date
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const expiredLocks = await SlotLock.find({ expiresAt: { $lt: now } });
      const deletedCount = expiredLocks.length;

      if (deletedCount > 0) {
        await SlotLock.deleteMany({ expiresAt: { $lt: now } });

        // Emit socket updates for unlocked slots to live clients
        if (global.io) {
          expiredLocks.forEach(lock => {
            global.io.to(`${lock.turfId}_${lock.date}`).emit('slot-unlocked', {
              turfId: lock.turfId,
              date: lock.date,
              slotId: lock.slotId,
            });
          });
        }
      }

      if (process.env.NODE_ENV !== 'production' && deletedCount > 0) {
        console.log(`🔓 [Cron] Cleared ${deletedCount} expired slot locks.`);
      }
    } catch (error) {
      console.error('💥 [Cron] Error in expired lock cleanup job:', error.message);
    }
  });

  // Job 3 — Booking Reminder Emails (runs every hour)
  // Finds bookings for tomorrow and sends reminder emails
  cron.schedule('0 * * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Find confirmed, unpaid/paid bookings for tomorrow that haven't received reminder
      const bookings = await Booking.find({
        date: tomorrowStr,
        status: 'confirmed',
        reminderSent: false,
      }).populate('user').populate('turf');

      let sentCount = 0;
      for (const booking of bookings) {
        if (booking.user && booking.user.email) {
          const reminderHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: 'Inter', sans-serif; background-color: #f8f9fa; color: #191c1d; margin: 0; padding: 20px; }
                  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                  .header { background-color: #1A1A1A; padding: 25px; text-align: center; }
                  .header h1 { color: #AAEE00; margin: 0; font-size: 24px; font-weight: 800; }
                  .content { padding: 35px 25px; }
                  .content h2 { font-size: 20px; color: #1A1A1A; margin-top: 0; }
                  .content p { font-size: 15px; line-height: 22px; color: #5f5e5e; }
                  .details-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #AAEE00; }
                  .details-box p { margin: 6px 0; font-size: 14px; color: #191c1d; }
                  .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #edeeef; }
                  .footer p { font-size: 12px; color: #c8c6c5; margin: 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>TurfBook Reminder</h1>
                  </div>
                  <div class="content">
                    <h2>Don't forget your match tomorrow, ${booking.user.name}!</h2>
                    <p>This is a quick reminder that you have a confirmed turf reservation tomorrow at <strong>${booking.turf.name}</strong>.</p>
                    <div class="details-box">
                      <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                      <p><strong>Date:</strong> ${booking.date}</p>
                      <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime} (${booking.duration} hr)</p>
                      <p><strong>Sport:</strong> ${booking.sport.toUpperCase()}</p>
                    </div>
                    <p>Please arrive at the venue 10 minutes prior to your slot time. Have a great game!</p>
                  </div>
                  <div class="footer">
                    <p>© ${new Date().getFullYear()} TurfBook. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `;

          await sendEmail({
            to: booking.user.email,
            subject: `Match Reminder: Booking ${booking.bookingId} Tomorrow`,
            html: reminderHtml,
          });

          booking.reminderSent = true;
          await booking.save();
          sentCount++;
        }
      }

      if (sentCount > 0) {
        console.log(`📧 [Cron] Sent ${sentCount} booking reminder emails.`);
      }
    } catch (error) {
      console.error('💥 [Cron] Error in booking reminder job:', error.message);
    }
  });

  // Job 4 — Auto-Complete Bookings (runs at 11:59 PM every day)
  // Auto-completes bookings where the date is in the past
  cron.schedule('59 23 * * *', async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // Find all confirmed bookings with date in the past
      const bookingsToComplete = await Booking.find({
        date: { $lt: todayStr },
        status: 'confirmed',
      });

      let completedCount = 0;
      for (const booking of bookingsToComplete) {
        booking.status = 'completed';
        await booking.save();

        // Create review prompt notification for user
        await Notification.create({
          user: booking.user,
          type: 'system',
          title: 'Review Your Match!',
          message: `Your match at booking ${booking.bookingId} is complete! Let others know about your experience.`,
          link: `/turf/${booking.turf}?review=true`,
        });

        completedCount++;
      }

      console.log(`✅ [Cron] Auto-completed ${completedCount} bookings.`);
    } catch (error) {
      console.error('💥 [Cron] Error in auto-completion job:', error.message);
    }
  });

  // Job 5 — Weekly Analytics Snapshot (runs every Monday at 6:00 AM)
  // Calculates previous week's performance stats and saves to DB
  cron.schedule('0 6 * * 1', async () => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Calculate totals
      const totalBookings = await Booking.countDocuments({
        createdAt: { $gte: oneWeekAgo },
        status: 'confirmed',
      });

      const revenueResults = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: oneWeekAgo },
            status: 'confirmed',
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
          },
        },
      ]);
      const totalRevenue = revenueResults[0]?.totalRevenue || 0;

      const newUsers = await User.countDocuments({
        createdAt: { $gte: oneWeekAgo },
        role: 'user',
      });

      const newTurfs = await Turf.countDocuments({
        createdAt: { $gte: oneWeekAgo },
      });

      // Get week number string
      const date = new Date();
      const currentYear = date.getFullYear();
      const firstDayOfYear = new Date(currentYear, 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      const weekStr = `${currentYear}-W${weekNumber.toString().padStart(2, '0')}`;

      // Save analytics snapshot
      await Analytics.create({
        week: weekStr,
        totalBookings,
        totalRevenue,
        newUsers,
        newTurfs,
      });

      console.log(`📊 [Cron] Saved weekly snapshot for week ${weekStr}.`);
    } catch (error) {
      console.error('💥 [Cron] Error in weekly analytics job:', error.message);
    }
  });
};
