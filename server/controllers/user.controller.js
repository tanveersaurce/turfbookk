import User from '../models/User.js';
import Turf from '../models/Turf.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import bcrypt from 'bcryptjs';

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone, city } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (city) user.city = city;

    const updatedUser = await user.save();
    
    // Convert to object and strip passwordHash
    const responseUser = updatedUser.toObject();
    delete responseUser.passwordHash;

    res.status(200).json({ success: true, data: responseUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload/Update User Avatar
// @route   PUT /api/users/profile/avatar
// @access  Private
export const updateUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Upload image buffer to Cloudinary (folder: turfbook/avatars)
    const folder = `turfbook/avatars/${user._id}`;
    const result = await uploadToCloudinary(req.file.buffer, folder);

    user.avatar = result.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully.',
      data: { avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change User Password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current password, new password, and confirm password.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirm password do not match.' });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from current password.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check password match
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password.' });
    }

    // Hash new password with bcrypt
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add Turf to Favorites
// @route   POST /api/users/favorites/:turfId
// @access  Private
export const addToFavorites = async (req, res, next) => {
  try {
    const { turfId } = req.params;

    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ success: false, message: 'Turf not found.' });
    }

    const user = await User.findById(req.user.id);
    if (user.favorites.includes(turfId)) {
      return res.status(400).json({ success: false, message: 'Turf already added to favorites.' });
    }

    user.favorites.push(turfId);
    await user.save();

    res.status(200).json({ success: true, message: 'Turf added to favorites.', data: user.favorites });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove Turf from Favorites
// @route   DELETE /api/users/favorites/:turfId
// @access  Private
export const removeFromFavorites = async (req, res, next) => {
  try {
    const { turfId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user.favorites.includes(turfId)) {
      return res.status(400).json({ success: false, message: 'Turf not found in favorites.' });
    }

    user.favorites = user.favorites.filter(id => id.toString() !== turfId);
    await user.save();

    res.status(200).json({ success: true, message: 'Turf removed from favorites.', data: user.favorites });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Favorited Turfs (Populated)
// @route   GET /api/users/favorites
// @access  Private
export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      select: 'name city area pricePerHour rating images sports',
    });

    res.status(200).json({ success: true, data: user.favorites });
  } catch (error) {
    next(error);
  }
};
