import React, { useState } from 'react';
import { getImageUrl, handleImageError, handleImageLoad } from '../utils/imageUtils';

const ImageTest = () => {
  const [testResults, setTestResults] = useState([]);

  const testImages = [
    'images/products/MOB001.jpg',
    'images/products/MOB002.jpeg',
    'images/products/LAP001.jpeg',
    'images/products/TAB001.jpeg'
  ];

  const addTestResult = (imagePath, status, error = null) => {
    setTestResults(prev => [...prev, { imagePath, status, error, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testImage = (imagePath) => {
    const img = new Image();
    const url = getImageUrl(imagePath);
    
    img.onload = () => {
      addTestResult(imagePath, 'success');
    };
    
    img.onerror = () => {
      addTestResult(imagePath, 'error', url);
    };
    
    img.src = url;
  };

  const runAllTests = () => {
    setTestResults([]);
    testImages.forEach(testImage);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Image Loading Test</h2>
      
      <button 
        onClick={runAllTests}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test All Images
      </button>

      <div className="space-y-4">
        {testImages.map((imagePath, index) => (
          <div key={index} className="border rounded p-4">
            <div className="flex items-center space-x-4">
              <img
                src={getImageUrl(imagePath)}
                alt={`Test ${index + 1}`}
                className="w-16 h-16 object-cover border rounded"
                onLoad={() => handleImageLoad(imagePath)}
                onError={(e) => handleImageError(e, imagePath)}
              />
              <div>
                <p className="font-medium">{imagePath}</p>
                <p className="text-sm text-gray-600">{getImageUrl(imagePath)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className={`p-2 rounded ${
                result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <span className="font-medium">{result.status.toUpperCase()}</span> - {result.imagePath} ({result.timestamp})
                {result.error && <div className="text-xs mt-1">Error URL: {result.error}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageTest;
