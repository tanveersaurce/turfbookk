import Review from '../models/Review.js';
import Turf from '../models/Turf.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

/**
 * Helper to recalculate average rating and total reviews for a Turf
 * @param {String} turfId 
 */
const updateTurfRating = async (turfId) => {
  const reviews = await Review.find({ turf: turfId });
  const totalReviews = reviews.length;
  const rating = totalReviews > 0
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  await Turf.findByIdAndUpdate(turfId, { rating, totalReviews });
};

// @desc    Add a review for a turf
// @route   POST /api/reviews/:turfId
// @access  Private
export const addReview = async (req, res, next) => {
  try {
    const { turfId } = req.params;
    const { rating, comment, bookingId } = req.body;

    if (!rating || !comment || !bookingId) {
      return res.status(400).json({ success: false, message: 'Please provide rating, comment, and bookingId.' });
    }

    // 1. Verify that user has completed booking at this turf
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.id,
      turf: turfId,
      status: 'completed',
    });

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: 'Only users who completed a booking at this turf can write a review.',
      });
    }

    // 2. Check if a review already exists for this booking
    const reviewExists = await Review.findOne({ user: req.user.id, booking: bookingId });
    if (reviewExists) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking.' });
    }

    // 3. Create review
    const review = await Review.create({
      user: req.user.id,
      turf: turfId,
      booking: bookingId,
      rating: parseInt(rating, 10),
      comment,
    });

    // 4. Update Turf rating and review count
    await updateTurfRating(turfId);

    // 5. Notify the owner
    const turf = await Turf.findById(turfId);
    if (turf) {
      await Notification.create({
        user: turf.owner,
        type: 'system',
        title: 'New Review Received',
        message: `Your turf ${turf.name} received a ${rating}-star review from ${req.user.name}.`,
        link: `/turf/${turfId}`,
      });
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a turf (Paginated)
// @route   GET /api/reviews/:turfId
// @access  Public
export const getTurfReviews = async (req, res, next) => {
  try {
    const { turfId } = req.params;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const sortOption = req.query.sort || 'latest';
    let sortQuery = { createdAt: -1 }; // latest default
    if (sortOption === 'highest') {
      sortQuery = { rating: -1, createdAt: -1 };
    } else if (sortOption === 'lowest') {
      sortQuery = { rating: 1, createdAt: -1 };
    }

    const reviews = await Review.find({ turf: turfId })
      .populate('user', 'name avatar')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ turf: turfId });

    res.status(200).json({
      success: true,
      count: reviews.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Only owner of the review or admin can delete it
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review.' });
    }

    const turfId = review.turf;
    await review.deleteOne();

    // Recalculate ratings
    await updateTurfRating(turfId);

    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
