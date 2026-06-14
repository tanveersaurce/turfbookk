import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import {
  submitApplication,
  checkStatus,
  getAllApplications,
  getApplicationDetail,
  approveApplication,
  rejectApplication,
  requestMoreInfo
} from '../controllers/application.controller.js';

const router = express.Router();

// Custom multer setup for Partner Applications supporting Images and PDF documents
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, WEBP, and PDF documents are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadAppFields = upload.fields([
  { name: 'turfImages', maxCount: 5 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]);

// Helper to handle Multer validation errors gracefully
const multerUploadMiddleware = (req, res, next) => {
  uploadAppFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'One of the uploaded files exceeds the 10MB size limit.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: 'Too many files uploaded for a field.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// -------------------------------------------------------------
// 1. PUBLIC ROUTES
// -------------------------------------------------------------
router.post('/', multerUploadMiddleware, submitApplication);
router.get('/status/:applicationId', checkStatus);

// -------------------------------------------------------------
// 2. ADMIN ONLY ROUTES (protect + authorizeRoles('admin'))
// -------------------------------------------------------------
router.get('/', protect, authorizeRoles('admin'), getAllApplications);
router.get('/:id', protect, authorizeRoles('admin'), getApplicationDetail);
router.put('/:id/approve', protect, authorizeRoles('admin'), approveApplication);
router.put('/:id/reject', protect, authorizeRoles('admin'), rejectApplication);
router.put('/:id/request-info', protect, authorizeRoles('admin'), requestMoreInfo);

export default router;
