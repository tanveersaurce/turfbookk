import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import PartnerApplication from '../models/PartnerApplication.js';
import User from '../models/User.js';
import Turf from '../models/Turf.js';
import Notification from '../models/Notification.js';
import { generateWeekSlots } from '../utils/slotGenerator.js';
import sendEmail from '../utils/sendEmail.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import {
  applicationReceivedEmail,
  applicationApprovedEmail,
  applicationRejectedEmail,
  applicationMoreInfoEmail
} from '../utils/emailTemplates.js';

// @desc    Submit a partner application
// @route   POST /api/applications
// @access  Public
export const submitApplication = async (req, res, next) => {
  try {
    const {
      applicantName, email, phone, city,
      businessName, gstNumber, hasGst, businessAddress, experience,
      turfName, turfAddress, area, mapsLink,
      operatingHours, pricePerHour, sports, amenities, rules,
      cancellationPolicy, agreedToTerms, coverImageIndex
    } = req.body;

    // Check if email already registered
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'A user account with this email already exists.' });
    }

    // Parse structures
    let parsedSports = [];
    if (sports) {
      if (Array.isArray(sports)) parsedSports = sports;
      else {
        try { parsedSports = JSON.parse(sports); }
        catch (e) { parsedSports = sports.split(',').map(s => s.trim()); }
      }
    }

    let parsedAmenities = [];
    if (amenities) {
      if (Array.isArray(amenities)) parsedAmenities = amenities;
      else {
        try { parsedAmenities = JSON.parse(amenities); }
        catch (e) { parsedAmenities = amenities.split(',').map(a => a.trim()); }
      }
    }

    let parsedHours = { open: '06:00', close: '22:00' };
    if (operatingHours) {
      if (typeof operatingHours === 'object') parsedHours = operatingHours;
      else {
        try { parsedHours = JSON.parse(operatingHours); }
        catch (e) { /* fallback */ }
      }
    }

    // Upload Files to Cloudinary
    let turfImages = [];
    if (req.files && req.files['turfImages']) {
      const uploadPromises = req.files['turfImages'].map(file =>
        uploadToCloudinary(file.buffer, 'turfbook/turfs')
      );
      const results = await Promise.all(uploadPromises);
      turfImages = results.map(r => r.secure_url);
    }

    let gstCertificateUrl = '';
    if (req.files && req.files['gstCertificate'] && req.files['gstCertificate'][0]) {
      const result = await uploadToCloudinary(req.files['gstCertificate'][0].buffer, 'turfbook/docs');
      gstCertificateUrl = result.secure_url;
    }

    let idProofUrl = '';
    if (req.files && req.files['idProof'] && req.files['idProof'][0]) {
      const result = await uploadToCloudinary(req.files['idProof'][0].buffer, 'turfbook/docs');
      idProofUrl = result.secure_url;
    }

    // Create Application
    const application = await PartnerApplication.create({
      applicantName,
      email: email.toLowerCase(),
      phone,
      city,
      businessName,
      gstNumber: gstNumber || '',
      hasGst: hasGst === 'true' || hasGst === true,
      businessAddress,
      experience,
      turfName,
      turfAddress,
      area,
      mapsLink: mapsLink || '',
      operatingHours: parsedHours,
      pricePerHour: Number(pricePerHour),
      sports: parsedSports,
      amenities: parsedAmenities,
      rules: rules || '',
      cancellationPolicy,
      turfImages,
      coverImageIndex: Number(coverImageIndex || 0),
      gstCertificateUrl,
      idProofUrl,
      agreedToTerms: agreedToTerms === 'true' || agreedToTerms === true,
    });

    // Send Confirmation Email
    sendEmail({
      to: application.email,
      subject: 'Application Received - TurfBook',
      html: applicationReceivedEmail(application.applicantName, application.applicationId, application.turfName)
    }).catch(err => console.error('Error sending application received email:', err));

    res.status(201).json({
      success: true,
      applicationId: application.applicationId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check application status
// @route   GET /api/applications/status/:applicationId
// @access  Public
export const checkStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = await PartnerApplication.findOne({ applicationId: applicationId.toUpperCase() });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.status(200).json({
      success: true,
      data: {
        applicationId: application.applicationId,
        applicantName: application.applicantName,
        turfName: application.turfName,
        status: application.status,
        submittedAt: application.createdAt,
        rejectionReason: application.rejectionReason,
        additionalInfoRequest: application.additionalInfoRequest
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private (Admin only)
export const getAllApplications = async (req, res, next) => {
  try {
    const { status, city, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (city) filter.city = city;

    const skip = (Number(page) - 1) * Number(limit);
    const applications = await PartnerApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await PartnerApplication.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: applications.length,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application details
// @route   GET /api/applications/:id
// @access  Private (Admin only)
export const getApplicationDetail = async (req, res, next) => {
  try {
    const application = await PartnerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve partner application
// @route   PUT /api/applications/:id/approve
// @access  Private (Admin only)
export const approveApplication = async (req, res, next) => {
  const { id } = req.params;

  const executeApproval = async (session) => {
    const queryOptions = session ? { session } : {};

    const application = await PartnerApplication.findById(id).session(session || null);
    if (!application) {
      throw new Error('Application not found.');
    }

    if (application.status === 'approved') {
      throw new Error('Application is already approved.');
    }

    // A) Generate Password
    const raw = crypto.randomBytes(8)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 8);
    const password = 'TurfBook@' + raw;

    // B) Resolve or Create User
    let newUser;
    const userExists = await User.findOne({ email: application.email }).session(session || null);
    if (userExists) {
      if (userExists.role !== 'owner') {
        throw new Error('A user account with this email already exists.');
      }
      // Idempotent recovery: Update password to the new generated one
      const hashedPassword = await bcrypt.hash(password, 12);
      userExists.passwordHash = hashedPassword;
      userExists.mustChangePassword = true;
      userExists.isApproved = true;
      userExists.isActive = true;
      await userExists.save(queryOptions);
      newUser = userExists;
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      const userArray = await User.create([{
        name: application.applicantName,
        email: application.email,
        passwordHash: hashedPassword,
        phone: application.phone,
        city: application.city,
        role: 'owner',
        isVerified: true,
        isActive: true,
        isApproved: true,
        mustChangePassword: true
      }], queryOptions);
      newUser = userArray[0];
    }

    // C) Resolve or Create Turf
    let newTurf;
    const turfExists = await Turf.findOne({ owner: newUser._id }).session(session || null);
    if (turfExists) {
      newTurf = turfExists;
    } else {
      const turfArray = await Turf.create([{
        owner: newUser._id,
        name: application.turfName,
        description: `Welcome to ${application.turfName}. We offer premium turf facilities for your favorite sports.`,
        address: application.turfAddress,
        city: application.city,
        area: application.area,
        location: {
          lat: 28.6139,
          lng: 77.2090
        },
        sports: application.sports,
        pricePerHour: application.pricePerHour,
        images: application.turfImages,
        amenities: application.amenities,
        rules: application.rules,
        operatingHours: application.operatingHours,
        cancellationPolicy: application.cancellationPolicy,
        isApproved: true,
        isActive: true,
        rating: 0,
        totalReviews: 0
      }], queryOptions);
      newTurf = turfArray[0];
    }

    // D) Generate Slots
    await generateWeekSlots(newTurf, new Date(), 7, session);

    // E) Update application
    application.status = 'approved';
    application.createdOwnerId = newUser._id;
    application.createdTurfId = newTurf._id;
    await application.save(queryOptions);

    // F) Send approval email
    const ownerPanelUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/owner/dashboard`;
    await sendEmail({
      to: application.email,
      subject: "Congratulations! You're a Partner",
      html: applicationApprovedEmail(
        application.applicantName,
        application.turfName,
        application.email,
        password,
        ownerPanelUrl
      )
    });

    // G) Create Notification
    await Notification.create([{
      user: newUser._id,
      type: 'system',
      title: 'Welcome to TurfBook!',
      message: 'Your turf is now live.',
      isRead: false
    }], queryOptions);

    return { newUser, newTurf, application };
  };

  const useTransaction = global.supportsTransactions !== false;
  const session = useTransaction ? await mongoose.startSession() : null;
  try {
    if (useTransaction && session) {
      session.startTransaction();
    }
    const result = await executeApproval(session);
    if (useTransaction && session) {
      await session.commitTransaction();
      session.endSession();
    }

    return res.status(200).json({
      success: true,
      message: 'Application approved successfully.',
      data: {
        applicationId: result.application.applicationId,
        ownerId: result.newUser._id,
        turfId: result.newTurf._id
      }
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    const isValidationError = 
      error.message === 'Application not found.' ||
      error.message === 'Application is already approved.' ||
      error.message === 'A user account with this email already exists.';

    if (isValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const isTransactionError = 
      error.codeName === 'IllegalOperation' || 
      error.code === 20 ||
      (error.message && error.message.includes('replica set'));

    if (isTransactionError) {
      console.warn('⚠️ MongoDB Transaction not supported (Standalone DB). Falling back to non-transaction approval.');
      try {
        const result = await executeApproval(null);
        return res.status(200).json({
          success: true,
          message: 'Application approved successfully (non-transaction fallback).',
          data: {
            applicationId: result.application.applicationId,
            ownerId: result.newUser._id,
            turfId: result.newTurf._id
          }
        });
      } catch (fallbackError) {
        return res.status(400).json({ success: false, message: fallbackError.message });
      }
    }

    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Reject partner application
// @route   PUT /api/applications/:id/reject
// @access  Private (Admin only)
export const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Please provide a rejection reason.' });
    }

    const application = await PartnerApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = 'rejected';
    application.rejectionReason = rejectionReason;
    await application.save();

    // Send Rejection Email
    sendEmail({
      to: application.email,
      subject: 'Application Update - TurfBook',
      html: applicationRejectedEmail(application.applicantName, application.turfName, rejectionReason)
    }).catch(err => console.error('Error sending rejection email:', err));

    res.status(200).json({
      success: true,
      message: 'Application rejected successfully.',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request more info for application
// @route   PUT /api/applications/:id/request-info
// @access  Private (Admin only)
export const requestMoreInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { infoNeeded } = req.body;

    if (!infoNeeded) {
      return res.status(400).json({ success: false, message: 'Please specify the information needed.' });
    }

    const application = await PartnerApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = 'more_info_needed';
    application.additionalInfoRequest = infoNeeded;
    await application.save();

    // Send Request Info Email
    sendEmail({
      to: application.email,
      subject: 'Additional Info Required - TurfBook',
      html: applicationMoreInfoEmail(application.applicantName, application.turfName, infoNeeded)
    }).catch(err => console.error('Error sending more info email:', err));

    res.status(200).json({
      success: true,
      message: 'Information requested successfully.',
      data: application
    });
  } catch (error) {
    next(error);
  }
};
