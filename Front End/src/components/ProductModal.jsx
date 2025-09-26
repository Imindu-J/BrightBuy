import React from 'react';

const ProductModal = ({ selectedProduct, setSelectedProduct, addToCart, selectedVariant, setSelectedVariant, productVariants, currentPrice }) => {
  if (!selectedProduct) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Product Details</h2>
            <button
              onClick={() => setSelectedProduct(null)}
              className="text-white hover:bg-white/20 p-2 rounded-full"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.ProductName}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedProduct.Brand}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span>★</span>
                    <span className="font-medium">{selectedProduct.rating}</span>
                    <span className="text-gray-500">({selectedProduct.reviews} reviews)</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedProduct.ProductName}
                </h1>
                <p className="text-gray-600 text-lg mb-6">
                  {selectedProduct.Description}
                </p>
              </div>
              {/* Variant Selection */}
              {productVariants.length > 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(productVariants.map(v => v.colour))].map(colour => (
                        <button
                          key={colour}
                          onClick={() => setSelectedVariant({
                            ...selectedVariant,
                            [selectedProduct.ProductID]: {
                              ...selectedVariant[selectedProduct.ProductID],
                              colour: colour
                            }
                          })}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            (selectedVariant[selectedProduct.ProductID]?.colour || productVariants[0].colour) === colour
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {colour}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Storage/Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(productVariants.map(v => v.size))].map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedVariant({
                            ...selectedVariant,
                            [selectedProduct.ProductID]: {
                              ...selectedVariant[selectedProduct.ProductID],
                              size: size
                            }
                          })}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            (selectedVariant[selectedProduct.ProductID]?.size || productVariants[0].size) === size
                              ? 'bg-purple-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-green-600">
                      ${currentPrice.toLocaleString()}
                    </span>
                    {currentPrice !== selectedProduct.Base_price && (
                      <span className="text-xl text-gray-400 line-through ml-3">
                        ${selectedProduct.Base_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="text-green-600 font-medium">
                    ✓ In Stock
                  </div>
                </div>
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span style={{fontSize: 24}} role="img" aria-label="cart">🛒</span>
                  <span className="text-lg">Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
