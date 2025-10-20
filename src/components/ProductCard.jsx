import React from 'react';
import { getImageUrl, handleImageError, handleImageLoad } from '../utils/imageUtils';

const ProductCard = ({ product, onView, onAddToCart, selectedVariant, setSelectedVariant, productVariants, currentPrice }) => (
  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden group h-full flex flex-col">
    <div className="relative overflow-hidden">
      <img
        src={getImageUrl(product.ImageURL)}
        alt={product.ProductName}
        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => handleImageError(e, product.ImageURL)}
        onLoad={() => handleImageLoad(product.ImageURL)}
      />
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50">
          {/* Heart icon here if needed */}
          <span>♥</span>
        </button>
      </div>
      <div className="absolute top-4 left-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          productVariants.length === 0
            ? 'bg-gradient-to-r from-red-400 to-red-500 text-white'
            : 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
        }`}>
          {productVariants.length === 0 ? 'Out of Stock' : 'In Stock'}
        </span>
      </div>
    </div>
    <div className="p-3 flex flex-col h-full">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {product.Brand}
        </span>
        <div className="flex items-center space-x-1">
          {/* Star icon here if needed */}
          <span>★</span>
          <span className="text-sm text-gray-600">{product.rating}</span>
          <span className="text-sm text-gray-400">({product.reviews})</span>
        </div>
      </div>
      <h3 className="font-bold text-base mb-0.5 text-gray-800 group-hover:text-blue-600 transition-colors">
        {product.ProductName}
      </h3>
      <p className="text-gray-600 text-xs mb-2 line-clamp-1">
        {product.Description}
      </p>
      {/* Variant Selection */}
      {productVariants.length > 0 && (
        <div className="mb-2 space-y-1">
          {/* Color Selection */}
          {[...new Set(productVariants.map(v => v.Colour))].length > 1 && (
            <div className="flex flex-wrap gap-1">
              {[...new Set(productVariants.map(v => v.Colour))].map(colour => (
                <button
                  key={colour}
                  onClick={() => {
                    const currentSelected = selectedVariant[product.ProductID] || {};
                    setSelectedVariant({
                      ...selectedVariant,
                      [product.ProductID]: {
                        ...currentSelected,
                        Colour: colour,
                        // Reset Size and Model when color changes to ensure valid combination
                        Size: currentSelected.Size || productVariants.find(v => v.Colour === colour)?.Size,
                        Model: currentSelected.Model || productVariants.find(v => v.Colour === colour)?.Model
                      }
                    });
                  }}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                    (selectedVariant[product.ProductID]?.Colour || productVariants[0].Colour) === colour
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {colour}
                </button>
              ))}
            </div>
          )}
          
          {/* Size Selection */}
          {[...new Set(productVariants.map(v => v.Size))].length > 1 && (
            <div className="flex flex-wrap gap-1">
              {[...new Set(productVariants.map(v => v.Size))].map(size => (
                <button
                  key={size}
                  onClick={() => {
                    const currentSelected = selectedVariant[product.ProductID] || {};
                    setSelectedVariant({
                      ...selectedVariant,
                      [product.ProductID]: {
                        ...currentSelected,
                        Size: size,
                        // Reset Model when size changes to ensure valid combination
                        Model: currentSelected.Model || productVariants.find(v => v.Size === size)?.Model
                      }
                    });
                  }}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                    (selectedVariant[product.ProductID]?.Size || productVariants[0].Size) === size
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
          
          {/* Model Selection - only show if there are multiple models */}
          {[...new Set(productVariants.map(v => v.Model))].length > 1 && (
            <div className="flex flex-wrap gap-1">
              {[...new Set(productVariants.map(v => v.Model))].map(model => (
                <button
                  key={model}
                  onClick={() => {
                    const currentSelected = selectedVariant[product.ProductID] || {};
                    setSelectedVariant({
                      ...selectedVariant,
                      [product.ProductID]: {
                        ...currentSelected,
                        Model: model
                      }
                    });
                  }}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                    (selectedVariant[product.ProductID]?.Model || productVariants[0].Model) === model
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col mb-2">
          <span className="text-2xl font-bold text-green-600">
            LKR {currentPrice.toLocaleString()}
          </span>
          {parseFloat(currentPrice) !== parseFloat(product.Base_price) && (
            <span className="text-sm text-gray-400 line-through">
              LKR {parseFloat(product.Base_price).toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => onView(product)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-200 hover:border-gray-300"
          >
            <span className="text-lg">👁</span>
            <span className="text-sm font-medium">View Details</span>
          </button>
          <button
            onClick={() => onAddToCart(product)}
            disabled={productVariants.length === 0}
            className={`w-full px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 font-medium ${
              productVariants.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transform hover:scale-105'
            }`}
          >
            <span className="text-lg">{productVariants.length === 0 ? '❌' : '➕'}</span>
            <span>{productVariants.length === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ProductCard;
