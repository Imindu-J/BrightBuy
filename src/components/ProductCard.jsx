import React from 'react';

const ProductCard = ({ product, onView, onAddToCart, selectedVariant, setSelectedVariant, productVariants, currentPrice }) => (
  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden group">
    <div className="relative overflow-hidden">
      <img
        src={`http://localhost:5000${product.ImageURL}`}
        alt={product.ProductName}
        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50">
          {/* Heart icon here if needed */}
          <span>♥</span>
        </button>
      </div>
      <div className="absolute top-4 left-4">
        <span className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          In Stock
        </span>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
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
      <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
        {product.ProductName}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {product.Description}
      </p>
      {/* Variant Selection */}
      {productVariants.length > 1 && (
        <div className="mb-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            {[...new Set(productVariants.map(v => v.colour))].map(colour => (
              <button
                key={colour}
                onClick={() => setSelectedVariant({
                  ...selectedVariant,
                  [product.ProductID]: {
                    ...selectedVariant[product.ProductID],
                    colour: colour
                  }
                })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  (selectedVariant[product.ProductID]?.colour || productVariants[0].colour) === colour
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {colour}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[...new Set(productVariants.map(v => v.size))].map(size => (
              <button
                key={size}
                onClick={() => setSelectedVariant({
                  ...selectedVariant,
                  [product.ProductID]: {
                    ...selectedVariant[product.ProductID],
                    size: size
                  }
                })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  (selectedVariant[product.ProductID]?.size || productVariants[0].size) === size
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-green-600">
            LKR {currentPrice.toLocaleString()}
          </span>
          {currentPrice !== product.Base_price && (
            <span className="text-sm text-gray-400 line-through">
              LKR {product.Base_price.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onView(product)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            {/* Eye icon here if needed */}
            <span>👁</span>
          </button>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            {/* Plus icon here if needed */}
            <span>＋</span>
            <span className="font-medium">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ProductCard;
