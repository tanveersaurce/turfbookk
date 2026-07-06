import mongoose from 'mongoose';
import Turf from '../models/Turf.js';
import User from '../models/User.js';
import { generateWeekSlots } from '../utils/slotGenerator.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import NodeCache from 'node-cache';

// Escapes special characters for use in regular expressions
const escapeRegExp = (string) => string ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';

// Initialize cache with 5 minutes TTL (300 seconds)
const suggestionCache = new NodeCache({ stdTTL: 300 });

// @desc    Get all active turfs (with filters)
// @route   GET /api/turfs
// @access  Public
export const getTurfs = async (req, res, next) => {
  try {
    const { city, sport, price, rating, search } = req.query;
    const query = { isActive: true, isApproved: true };

    if (city) {
      query.city = new RegExp(escapeRegExp(city), 'i');
    }

    if (sport) {
      query.sports = sport.toLowerCase();
    }

    if (price) {
      query.pricePerHour = { $lte: parseFloat(price) };
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    if (search) {
      const escapedSearch = escapeRegExp(search);
      query.$or = [
        { name: new RegExp(escapedSearch, 'i') },
        { area: new RegExp(escapedSearch, 'i') },
        { city: new RegExp(escapedSearch, 'i') },
      ];
    }

    const turfs = await Turf.find(query).populate('owner', 'name email phone');
    res.status(200).json({ success: true, count: turfs.length, data: turfs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single turf by ID
// @route   GET /api/turfs/:id
// @access  Public
export const getTurfById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const turf = await Turf.findById(id).populate('owner', 'name email phone');

    if (!turf) {
      return res.status(404).json({ success: false, message: 'Turf not found.' });
    }

    res.status(200).json({ success: true, data: turf });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new turf listing
// @route   POST /api/turfs
// @access  Private (Owner only)
export const createTurf = async (req, res, next) => {
  try {
    const { name, description, address, city, area, location, sports, pricePerHour, amenities, rules, operatingHours, images } = req.body;

    const turf = await Turf.create({
      owner: req.user.id,
      name,
      description,
      address,
      city,
      area,
      location,
      sports,
      pricePerHour,
      amenities,
      rules,
      operatingHours,
      images,
    });

    // Automatically generate slots for the next 7 days upon creation
    await generateWeekSlots(turf, new Date(), 7);

    // Fetch turf again to return populated slots
    const populatedTurf = await Turf.findById(turf._id);

    res.status(201).json({ success: true, data: populatedTurf });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a turf listing
// @route   PUT /api/turfs/:id
// @access  Private (Owner only)
export const updateTurf = async (req, res, next) => {
  try {
    const { id } = req.params;

    let turf = await Turf.findById(id);
    if (!turf) {
      return res.status(404).json({ success: false, message: 'Turf not found.' });
    }

    // Ensure user owns this turf or is admin
    if (turf.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this turf.' });
    }

    // Update fields
    turf = await Turf.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: turf });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a turf listing
// @route   DELETE /api/turfs/:id
// @access  Private (Owner only)
export const deleteTurf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const turf = await Turf.findById(id);
    if (!turf) {
      return res.status(404).json({ success: false, message: 'Turf not found.' });
    }

    // Ensure user owns this turf or is admin
    if (turf.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this turf.' });
    }

    await turf.deleteOne();

    res.status(200).json({ success: true, message: 'Turf deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Owner's Own Turfs
// @route   GET /api/turfs/owner/my-turfs
// @access  Private (Owner only)
export const getMyTurfs = async (req, res, next) => {
  try {
    const turfs = await Turf.find({ owner: req.user.id });
    res.status(200).json({ success: true, count: turfs.length, data: turfs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distinct cities where active turfs are listed
// @route   GET /api/turfs/cities/list
// @access  Public
export const getDistinctCities = async (req, res, next) => {
  try {
    const dbCities = await Turf.distinct('city', { isActive: true, isApproved: true });
    
    // Filter out null, undefined, non-string, or empty values from DB distinct query
    const cleanDbCities = dbCities.filter(c => typeof c === 'string' && c.trim() !== '');
    
    // Fallback/standard cities list to merge with DB cities
    const fallbackCities = ['Bhopal', 'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Indore', 'London', 'Madrid', 'Dubai', 'Singapore'];
    
    // Unique list, sorted alphabetically
    const uniqueCities = [...new Set([...cleanDbCities, ...fallbackCities])].sort((a, b) => a.localeCompare(b));
    
    res.status(200).json({ success: true, data: uniqueCities });
  } catch (error) {
    next(error);
  }
};

// @desc    Search Autocomplete Suggestions
// @route   GET /api/turfs/search/suggestions
// @access  Public
export const searchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, data: { cities: [], areas: [], turfs: [] } });
    }

    const searchQuery = q.trim();

    // Check Cache first
    const cachedResponse = suggestionCache.get(searchQuery);
    if (cachedResponse) {
      return res.status(200).json({ success: true, data: cachedResponse, cached: true });
    }

    const regex = new RegExp(escapeRegExp(searchQuery), 'i');

    // Perform queries
    const turfsPromise = Turf.find({ name: regex, isActive: true, isApproved: true }, 'name city').limit(8);
    const citiesPromise = Turf.distinct('city', { city: regex, isActive: true, isApproved: true });
    const areasPromise = Turf.find({ area: regex, isActive: true, isApproved: true }, 'area city').limit(8);

    const [turfsData, citiesData, areasData] = await Promise.all([
      turfsPromise,
      citiesPromise,
      areasPromise,
    ]);

    // Format output
    const suggestions = {
      cities: citiesData.slice(0, 8),
      areas: [...new Set(areasData.map(t => `${t.area}, ${t.city}`))].slice(0, 8),
      turfs: turfsData.map(t => `${t.name} - ${t.city}`).slice(0, 8),
    };

    // Store in cache
    suggestionCache.set(searchQuery, suggestions);

    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
};

// @desc    Check Slots Availability for a Date
// @route   GET /api/turfs/:id/slots/:date
// @access  Public
export const checkSlotsAvailability = async (req, res, next) => {
  try {
    const { id, date } = req.params;

    // Validate Turf ID format to prevent CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Turf ID format.' });
    }

    // Validate date format to prevent RangeError: Invalid time value
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Please use YYYY-MM-DD.' });
    }

    const turf = await Turf.findById(id);
    if (!turf) {
      return res.status(404).json({ success: false, message: 'Turf not found.' });
    }

    // Filter slots for this date
    let dateSlots = turf.slots.filter(slot => slot.date === date);

    // If slots are not yet generated for this date, generate on demand
    if (dateSlots.length === 0) {
      const allSlots = await generateWeekSlots(turf, dateObj, 1);
      dateSlots = allSlots.filter(slot => slot.date === date);
    }

    res.status(200).json({ success: true, data: dateSlots });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload Turf Images
// @route   POST /api/turfs/:id/images
// @access  Private (Owner only)
export const uploadTurfImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    const turf = await Turf.findById(id);
    if (!turf) {
      return res.status(404).json({ success: false, message: 'Turf not found.' });
    }

    if (turf.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to upload images for this turf.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image file.' });
    }

    const uploadPromises = req.files.map(file => {
      const folder = `turfbook/turfs/${turf._id}`;
      return uploadToCloudinary(file.buffer, folder);
    });

    const results = await Promise.all(uploadPromises);
    const urls = results.map(r => r.secure_url);

    turf.images.push(...urls);
    await turf.save();

    res.status(200).json({ success: true, message: 'Images uploaded successfully.', data: turf.images });
  } catch (error) {
    next(error);
  }
};

// @desc    Block turf slots for maintenance/offline play
// @route   POST /api/turfs/:id/block-slot
// @access  Private (Owner/Admin)
export const blockSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, reason } = req.body;

    const turf = await Turf.findById(id);
    if (!turf) {
      return res.status(404).json({ success: false, message: 'Turf not found.' });
    }

    // Ensure user owns this turf or is admin
    if (turf.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to block slots.' });
    }

    // Add to blockedSlots array
    turf.blockedSlots.push({ date, startTime, endTime, reason });

    // Mark matched slots as blocked in the slots array
    for (const slot of turf.slots) {
      if (
        slot.date === date &&
        slot.startTime >= startTime &&
        slot.endTime <= endTime
      ) {
        if (!slot.isBooked) {
          slot.isBlocked = true;
          slot.blockedReason = reason || 'Blocked by Owner';
        }
      }
    }

    await turf.save();

    res.status(200).json({ success: true, message: 'Slots blocked successfully.', data: turf });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk Update Slots Status (Block/Unblock)
// @route   POST /api/turfs/:id/slots/bulk-update
// @access  Private (Owner/Admin)
export const updateSlotsStatus = async (req, res, next) => {
  const useTransaction = global.supportsTransactions !== false;
  const session = useTransaction ? await mongoose.startSession() : null;
  if (useTransaction && session) {
    session.startTransaction();
  }

  try {
    const { id } = req.params;
    const { date, slots, action, reason } = req.body; // slots: ["09:00-10:00", "10:00-11:00"]

    if (!date || !slots || !action) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ success: false, message: 'Please provide date, slots, and action.' });
    }

    const turf = useTransaction
      ? await Turf.findById(id).session(session)
      : await Turf.findById(id);

    if (!turf) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({ success: false, message: 'Turf not found.' });
    }

    // Ensure user owns this turf or is admin
    if (turf.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(403).json({ success: false, message: 'Not authorized to manage slots.' });
    }

    // Process each target slot time range
    for (const slotRange of slots) {
      const [start, end] = slotRange.split('-');
      
      const matchedSlot = turf.slots.find(
        (s) => s.date === date && s.startTime === start && s.endTime === end
      );

      if (matchedSlot) {
        if (action === 'block') {
          // Concurrency safety check
          if (matchedSlot.isBooked) {
            continue;
          }
          matchedSlot.isBlocked = true;
          matchedSlot.blockedReason = reason || 'Blocked by Owner';

          // Add to blockedSlots array
          const alreadyInBlockedList = turf.blockedSlots.some(
            (bs) => bs.date === date && bs.startTime === start && bs.endTime === end
          );
          if (!alreadyInBlockedList) {
            turf.blockedSlots.push({ date, startTime: start, endTime: end, reason: reason || 'Blocked by Owner' });
          }
        } else if (action === 'unblock') {
          matchedSlot.isBlocked = false;
          matchedSlot.blockedReason = '';

          // Remove from blockedSlots
          turf.blockedSlots = turf.blockedSlots.filter(
            (bs) => !(bs.date === date && bs.startTime === start && bs.endTime === end)
          );
        }
      }
    }

    await turf.save(useTransaction ? { session } : {});

    if (useTransaction && session) {
      await session.commitTransaction();
      session.endSession();
    }

    res.status(200).json({ success: true, message: `Slots ${action}ed successfully.`, data: turf });
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
      session.endSession();
    }
    next(error);
  }
};

// @desc    Copy Day Schedule
// @route   POST /api/turfs/:id/slots/copy-day
// @access  Private (Owner/Admin)
export const copyDaySchedule = async (req, res, next) => {
  const useTransaction = global.supportsTransactions !== false;
  const session = useTransaction ? await mongoose.startSession() : null;
  if (useTransaction && session) {
    session.startTransaction();
  }

  try {
    const { id } = req.params;
    const { sourceDate, targetDate } = req.body;

    if (!sourceDate || !targetDate) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ success: false, message: 'Please provide sourceDate and targetDate.' });
    }

    const turf = useTransaction
      ? await Turf.findById(id).session(session)
      : await Turf.findById(id);

    if (!turf) {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({ success: false, message: 'Turf not found.' });
    }

    // Ensure user owns this turf or is admin
    if (turf.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      if (useTransaction && session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(403).json({ success: false, message: 'Not authorized to copy schedule.' });
    }

    // Ensure source slots exist
    let sourceSlots = turf.slots.filter((s) => s.date === sourceDate);
    if (sourceSlots.length === 0) {
      const allSlots = await generateWeekSlots(turf, new Date(sourceDate), 1, session);
      sourceSlots = allSlots.filter((s) => s.date === sourceDate);
    }

    // Ensure target slots exist
    let targetSlots = turf.slots.filter((s) => s.date === targetDate);
    if (targetSlots.length === 0) {
      const allSlots = await generateWeekSlots(turf, new Date(targetDate), 1, session);
      targetSlots = allSlots.filter((s) => s.date === targetDate);
    }

    // Copy schedule
    for (const sourceSlot of sourceSlots) {
      const targetSlot = turf.slots.find(
        (s) => s.date === targetDate && s.startTime === sourceSlot.startTime && s.endTime === sourceSlot.endTime
      );

      if (targetSlot) {
        if (targetSlot.isBooked) {
          continue; // Concurrency check: Skip already-booked slots
        }

        targetSlot.isBlocked = sourceSlot.isBlocked;
        targetSlot.blockedReason = sourceSlot.blockedReason || '';

        if (sourceSlot.isBlocked) {
          const alreadyInBlockedList = turf.blockedSlots.some(
            (bs) => bs.date === targetDate && bs.startTime === sourceSlot.startTime && bs.endTime === sourceSlot.endTime
          );
          if (!alreadyInBlockedList) {
            turf.blockedSlots.push({
              date: targetDate,
              startTime: sourceSlot.startTime,
              endTime: sourceSlot.endTime,
              reason: sourceSlot.blockedReason || 'Blocked (Copied)'
            });
          }
        } else {
          turf.blockedSlots = turf.blockedSlots.filter(
            (bs) => !(bs.date === targetDate && bs.startTime === sourceSlot.startTime && bs.endTime === sourceSlot.endTime)
          );
        }
      }
    }

    await turf.save(useTransaction ? { session } : {});

    if (useTransaction && session) {
      await session.commitTransaction();
      session.endSession();
    }

    res.status(200).json({ success: true, message: 'Schedule copied successfully.', data: turf });
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
      session.endSession();
    }
    next(error);
  }
};

