import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PartnerApplication from '../models/PartnerApplication.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { welcomeEmail, resetPasswordEmail } from '../utils/emailTemplates.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_tb_123';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, city, role } = req.body;

    if (role && role !== 'user') {
      return res.status(400).json({ success: false, message: 'Direct registration of roles other than user is restricted. Owners must submit partner applications.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: password,
      phone,
      city,
      role: role || 'user',
    });

    // Generate token and set in cookie
    const token = generateToken(res, user._id, user.role);

    // Respond first to ensure fast successful registration response
    res.status(201).json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        isVerified: user.isVerified,
      },
    });

    // Send Welcome Email in the background
    sendEmail({
      to: user.email,
      subject: 'Welcome to TurfBook!',
      html: welcomeEmail(user),
    }).catch((emailErr) => {
      console.error('Welcome email failed to send in background:', emailErr.message);
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token cookie
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password are provided
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Check if there is a PartnerApplication pending, under review, or rejected with this email
      const pendingApp = await PartnerApplication.findOne({ email: email.toLowerCase() });
      if (pendingApp) {
        if (pendingApp.status === 'pending' || pendingApp.status === 'under_review' || pendingApp.status === 'more_info_needed') {
          return res.status(403).json({ success: false, message: 'Your account is pending Admin approval. Please wait.' });
        } else if (pendingApp.status === 'rejected') {
          return res.status(403).json({ success: false, message: `Your partner application was rejected. Reason: ${pendingApp.rejectionReason || 'Not specified'}` });
        }
      }
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
    }

    if (user.role === 'owner' && user.isApproved === false) {
      return res.status(403).json({ success: false, message: 'Your account is pending Admin approval. Please wait.' });
    }

    // Generate token and set in cookie
    const token = generateToken(res, user._id, user.role);

    const responseData = {
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        isVerified: user.isVerified,
      },
    };

    if (user.mustChangePassword === true) {
      responseData.mustChangePassword = true;
      responseData.redirectTo = '/change-password';
    }

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out & clear token cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      httpOnly: true,
      expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ success: true, message: 'Successfully logged out.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - request reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user registered with that email.' });
    }

    // Generate a reset token (JWT expiring in 15 minutes)
    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Send password reset email
    try {
      await sendEmail({
        to: user.email,
        subject: 'TurfBook Password Reset Request',
        html: resetPasswordEmail(user, resetUrl),
      });

      res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (emailErr) {
      console.error('Password reset email failed to send:', emailErr.message);
      res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a new password.' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
    }

    // Find user by id
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User no longer exists.' });
    }

    // Update password (triggers hashing pre-save hook)
    user.passwordHash = password;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a partner/owner application
// @route   POST /api/auth/owner-apply
// @access  Public
export const ownerApply = async (req, res, next) => {
  try {
    const { name, email, phone, businessName, turfAddress, password } = req.body;

    if (!name || !email || !phone || !businessName || !turfAddress || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all details.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Account already exists with this email.' });
    }

    // Check if pending application exists
    const pendingApp = await PartnerApplication.findOne({ email: email.toLowerCase(), status: 'pending' });
    if (pendingApp) {
      return res.status(400).json({ success: false, message: 'An application is already pending for this email.' });
    }

    // Create partner application
    const application = await PartnerApplication.create({
      applicantName: name,
      email: email.toLowerCase(),
      phone,
      businessName,
      businessAddress: turfAddress,
      experience: '1 Year',
      turfName: businessName,
      turfAddress,
      area: 'Bhopal',
      city: 'Bhopal',
      pricePerHour: 1000,
      agreedToTerms: true,
      operatingHours: { open: '06:00', close: '22:00' },
      cancellationPolicy: 'full-refund'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. It is under review.',
      data: {
        _id: application._id,
        name: application.applicantName,
        email: application.email,
        businessName: application.businessName,
        status: application.status
      }
    });
  } catch (error) {
    next(error);
  }
};

