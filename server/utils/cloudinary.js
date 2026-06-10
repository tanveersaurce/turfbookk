import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'default_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'default_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'default_secret',
});

/**
 * Uploads a file buffer to a specific Cloudinary folder.
 * Useful when working with Multer Memory Storage.
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder path
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Stream Upload Error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an image from Cloudinary using its public ID.
 * @param {String} publicId - Cloudinary public asset ID
 * @returns {Promise<Object>} - Cloudinary destroy result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary Asset Delete Error:', error);
    throw error;
  }
};

export default cloudinary;
