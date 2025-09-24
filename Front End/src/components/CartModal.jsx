import React from 'react';

const CartModal = ({ cartItems, setShowCart, updateQuantity, getTotalPrice, handleCheckout, currentUser }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Shopping Cart</h2>
          <button
            onClick={() => setShowCart(false)}
            className="text-white hover:bg-white/20 p-2 rounded-full"
          >
            ×
          </button>
        </div>
      </div>
      <div className="p-6 max-h-96 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <span style={{fontSize: 64}} role="img" aria-label="cart">🛒</span>
            <p className="text-gray-500 text-lg">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={`${item.CartID}-${item.VariantID}`} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl">
                <img
                  src={item.image}
                  alt={item.ProductName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.ProductName}</h3>
                  <p className="text-sm text-gray-600">{item.Brand}</p>
                  <p className="text-xs text-gray-500">{item.colour} • {item.size} • {item.Model}</p>
                  <p className="text-lg font-bold text-green-600">${item.UnitPrice.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.CartID, item.VariantID, -1)}
                    className="p-1 bg-gray-200 hover:bg-gray-300 rounded-full"
                  >
                    −
                  </button>
                  <span className="font-semibold text-lg w-8 text-center">{item.Quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.CartID, item.VariantID, 1)}
                    className="p-1 bg-gray-200 hover:bg-gray-300 rounded-full"
                  >
                    ＋
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {cartItems.length > 0 && (
        <div className="border-t bg-gray-50 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold">Total:</span>
            <span className="text-2xl font-bold text-green-600">${getTotalPrice().toLocaleString()}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            {currentUser ? 'Place Order' : 'Login to Checkout'}
          </button>
        </div>
      )}
    </div>
  </div>
);

export default CartModal;
