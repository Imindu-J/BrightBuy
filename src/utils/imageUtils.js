// Utility function to generate cache-busting parameter for images
// This helps prevent browser caching issues when images are updated
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.warn('getImageUrl called with empty imagePath');
    return '';
  }
  
  // Use a stable cache-busting parameter based on the current hour
  // This changes once per hour instead of on every render
  const cacheBuster = Math.floor(Date.now() / (1000 * 60 * 60));
  const fullUrl = `http://localhost:5000/${imagePath}?t=${cacheBuster}`;
  
  console.log('Generated image URL:', fullUrl, 'from path:', imagePath);
  return fullUrl;
};

// Fallback image for when images fail to load
export const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';

// Image error handler
export const handleImageError = (e, imagePath) => {
  console.error('Image failed to load:', e.target.src);
  console.error('Original image path:', imagePath);
  console.error('Constructed URL:', getImageUrl(imagePath));
  e.target.src = FALLBACK_IMAGE;
};

// Image load handler
export const handleImageLoad = (imagePath) => {
  console.log('Image loaded successfully:', imagePath);
};
