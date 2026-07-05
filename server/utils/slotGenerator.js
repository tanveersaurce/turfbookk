import Turf from '../models/Turf.js';

/**
 * Helper to parse time string "HH:MM" to minutes since midnight
 * @param {String} timeStr - "HH:MM"
 * @returns {Number}
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Helper to format minutes since midnight to "HH:MM" time string
 * @param {Number} totalMinutes
 * @returns {String}
 */
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const hStr = hours.toString().padStart(2, '0');
  const mStr = minutes.toString().padStart(2, '0');
  return `${hStr}:${mStr}`;
};

/**
 * Generates daily slots based on operating hours and duration
 * @param {String} openTime - e.g. "06:00"
 * @param {String} closeTime - e.g. "23:00"
 * @param {Number} slotDuration - Duration in minutes (default 60)
 * @returns {Array} - Array of slots
 */
export const generateDailySlots = (openTime = '06:00', closeTime = '23:00', slotDuration = 60) => {
  const slots = [];
  const startMin = timeToMinutes(openTime);
  let endMin = timeToMinutes(closeTime);

  // If closing time is on the next day (crosses midnight)
  if (endMin <= startMin) {
    endMin += 1440; // Add 24 hours in minutes
  }

  let currentMin = startMin;
  while (currentMin + slotDuration <= endMin) {
    const startTime = minutesToTime(currentMin);
    const endTime = minutesToTime(currentMin + slotDuration);
    slots.push({
      startTime,
      endTime,
      isBooked: false,
      bookedBy: null,
    });
    currentMin += slotDuration;
  }

  return slots;
};

/**
 * Generates slots for a rolling window of next X days for a Turf
 * @param {Object} turf - Turf Mongoose document
 * @param {Date} startDate - Starting date
 * @param {Number} days - Number of days to generate (default 7)
 */
export const generateWeekSlots = async (turf, startDate = new Date(), days = 7, session = null) => {
  const updatedSlots = [...(turf.slots || [])];
  
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Check if slots already exist for this date
    const hasSlots = updatedSlots.some(slot => slot.date === dateStr);
    if (!hasSlots) {
      // Generate slots for this day using operating hours
      const dailySlots = generateDailySlots(
        turf.operatingHours.open,
        turf.operatingHours.close,
        60
      );

      // Map day value to each slot object
      const slotsWithDate = dailySlots.map(slot => ({
        ...slot,
        date: dateStr,
      }));

      updatedSlots.push(...slotsWithDate);
    }
  }

  // Update in DB
  const updateOptions = session ? { session } : {};
  await Turf.updateOne(
    { _id: turf._id },
    { $set: { slots: updatedSlots } },
    updateOptions
  );

  return updatedSlots;
};

/**
 * Query turf slots for specific date and return format
 * @param {String} turfId
 * @param {String} dateStr - YYYY-MM-DD
 * @returns {Promise<Array>}
 */
export const getAvailableSlots = async (turfId, dateStr) => {
  const turf = await Turf.findById(turfId);
  if (!turf) throw new Error('Turf not found.');

  // Check if date slots already exist, if not generate them on demand
  let matchingSlots = turf.slots.filter(slot => slot.date === dateStr);

  if (matchingSlots.length === 0) {
    const targetDate = new Date(dateStr);
    // Generate slots rolling from this target date
    const allSlots = await generateWeekSlots(turf, targetDate, 1);
    matchingSlots = allSlots.filter(slot => slot.date === dateStr);
  }

  return matchingSlots;
};
