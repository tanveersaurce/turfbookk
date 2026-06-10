import multer from 'multer';

// Use memory storage to keep files as buffers before streaming to Cloudinary
const storage = multer.memoryStorage();

// File filter: Accept only specific formats (jpeg, jpg, png, webp)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP formats are allowed!'), false);
  }
};

// Size limit: 5MB (5 * 1024 * 1024 bytes)
const limits = {
  fileSize: 5 * 1024 * 1024,
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

/**
 * Middleware for single image upload.
 * @param {String} fieldName - Form field name (default: 'image')
 */
export const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File is too large. Maximum size allowed is 5MB.' });
        }
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  };
};

/**
 * Middleware for multiple image upload.
 * @param {String} fieldName - Form field name (default: 'images')
 * @param {Number} maxCount - Maximum number of files allowed (default: 5)
 */
export const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'One of the files is too large. Maximum size allowed is 5MB.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ success: false, message: `Too many files. Maximum allowed is ${maxCount}.` });
        }
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  };
};

export default upload;
