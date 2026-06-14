import User from '../models/User.js';
import Turf from '../models/Turf.js';
import Booking from '../models/Booking.js';
import Analytics from '../models/Analytics.js';

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }

    if (role) {
      query.role = role;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle User Status (Ban/Unban)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent admin from banning themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Admins cannot deactivate their own accounts.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { _id: user._id, name: user.name, isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all turfs (Admin only)
// @route   GET /api/admin/turfs
// @access  Private (Admin only)
export const getAllTurfs = async (req, res, next) => {
  try {
    const turfs = await Turf.find({})
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: turfs.length, data: turfs });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject Turf Listing
// @route   PUT /api/admin/turfs/:id/approve
// @access  Private (Admin only)
export const approveTurf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body; // Expect boolean in body

    if (isApproved === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide isApproved status (true/false).' });
    }

    const turf = await Turf.findById(id);
    if (!turf) {
      return res.status(404).json({ success: false, message: 'Turf listing not found.' });
    }

    turf.isApproved = isApproved;
    await turf.save();

    res.status(200).json({
      success: true,
      message: `Turf listing has been ${isApproved ? 'approved' : 'rejected'} successfully.`,
      data: turf,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalTurfs = await Turf.countDocuments({});
    const totalBookings = await Booking.countDocuments({ status: 'confirmed' });

    // Aggregate total revenue
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'confirmed', paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Fetch weekly analytics snapshots (historical data)
    const history = await Analytics.find().sort({ createdAt: -1 }).limit(10);

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('turf', 'name city')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalOwners,
          totalTurfs,
          totalBookings,
          totalRevenue,
        },
        recentBookings,
        history: history.reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings across the platform
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email phone')
      .populate('turf', 'name city area pricePerHour')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};



