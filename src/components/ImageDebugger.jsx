import React, { useState } from 'react';
import { getImageUrl } from '../utils/imageUtils';

const ImageDebugger = ({ product }) => {
  const [imageStatus, setImageStatus] = useState('loading');
  const [error, setError] = useState(null);

  const handleImageLoad = () => {
    setImageStatus('loaded');
    setError(null);
  };

  const handleImageError = (e) => {
    setImageStatus('error');
    setError(e.target.src);
  };

  if (!product) return null;

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">Image Debug Info</h3>
      <div className="space-y-2 text-sm">
        <div><strong>Product:</strong> {product.ProductName}</div>
        <div><strong>Image URL:</strong> {product.ImageURL}</div>
        <div><strong>Full URL:</strong> {getImageUrl(product.ImageURL)}</div>
        <div><strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            imageStatus === 'loaded' ? 'bg-green-100 text-green-800' :
            imageStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {imageStatus}
          </span>
        </div>
        {error && <div><strong>Error URL:</strong> {error}</div>}
      </div>
      <div className="mt-4">
        <img
          src={getImageUrl(product.ImageURL)}
          alt={product.ProductName}
          className="w-32 h-32 object-cover border rounded"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    </div>
  );
};

export default ImageDebugger;


