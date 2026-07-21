import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PartnerApplication from '../models/PartnerApplication.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { welcomeEmail, resetPasswordEmail, resetPasswordOTPEmail } from '../utils/emailTemplates.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_tb_123';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, city, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields (name, email, password).' });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid format for email or password.' });
    }

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

// @desc    Forgot Password - request reset OTP code
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user registered with that email.' });
    }

    // Generate a 6-digit verification code (OTP)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and expiry (15 minutes) on the user document
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Dev fallback: Print verification OTP code directly to server console
    console.log(`\n🔑 [DEV ONLY] Password reset code for ${user.email} is: ${otp}\n`);

    // Send password reset OTP email
    try {
      await sendEmail({
        to: user.email,
        subject: 'TurfBook Password Reset Code',
        html: resetPasswordOTPEmail(user, otp),
      });

      res.status(200).json({ success: true, message: '6-digit verification code sent to your email.' });
    } catch (emailErr) {
      console.error('Password reset OTP email failed to send:', emailErr.message);
      res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password using OTP code
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email, verification code (OTP), and new password.' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify OTP code
    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp || !user.resetPasswordOTPExpires || user.resetPasswordOTPExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code (OTP).' });
    }

    // Update password (triggers hashing pre-save hook)
    user.passwordHash = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
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

// @desc    Google SSO Authentication / Auto Registration
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res, next) => {
  try {
    let { credential, email, name } = req.body;

    // Decode Google ID Token (JWT) if passed
    if (credential && credential !== 'mock_credential') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          if (payload.email) email = payload.email;
          if (payload.name) name = payload.name;
        }
      } catch (err) {
        console.warn('Could not parse Google credential token:', err.message);
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Google email address.',
      });
    }

    const userEmail = email.toLowerCase().trim();
    const rawName = name || userEmail.split('@')[0];
    // Capitalize name neatly
    const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    // Find existing user or create a new user account
    let user = await User.findOne({ email: userEmail });

    if (!user) {
      user = await User.create({
        name: userName,
        email: userEmail,
        passwordHash: Math.random().toString(36).substring(2) + Date.now().toString(36),
        role: 'user',
        isVerified: true,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
    }

    // Generate JWT Token
    const token = generateToken(res, user._id, user.role);

    res.status(200).json({
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
  } catch (error) {
    next(error);
  }
};

