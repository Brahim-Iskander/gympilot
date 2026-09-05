import { api } from './api';

/**
 * Upload a single image to Cloudinary via the backend.
 * @param {string} imageBase64 - base64 encoded image (data URI or raw)
 * @param {string} folder - Cloudinary folder (default: 'gympilot/products')
 * @returns {Promise<string>} The Cloudinary secure URL
 */
export const uploadImage = async (imageBase64, folder = 'gympilot/products') => {
  const response = await api.post('/upload/image', { imageBase64, folder });
  return response.data.url;
};

/**
 * Upload multiple images to Cloudinary via the backend.
 * @param {string[]} images - array of base64 encoded images
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<string[]>} Array of Cloudinary secure URLs
 */
export const uploadImages = async (images, folder = 'gympilot/products') => {
  const response = await api.post('/upload/images', { images, folder });
  return response.data.urls;
};
