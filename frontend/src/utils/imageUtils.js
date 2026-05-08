/**
 * Optimizes Cloudinary URLs by adding auto-format and auto-quality parameters.
 * If the URL is not from Cloudinary, it returns the original URL.
 */
export const getOptimizedImage = (url, width = '') => {
  if (!url) return '';
  
  if (url.includes('res.cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      const transform = `f_auto,q_auto${width ? `,w_${width}` : ''}`;
      return `${parts[0]}/upload/${transform}/${parts[1]}`;
    }
  }
  
  return url;
};
