import React, { useState } from 'react';

const CheckoutModal = ({ 
  cartItems, 
  setShowCheckout, 
  handlePlaceOrder, 
  currentUser,
  getTotalPrice 
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState('standard_delivery');
  const [paymentMethod, setPaymentMethod] = useState('card_payment');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await handlePlaceOrder({
        items: cartItems.map(item => ({
          variantId: item.VariantID,
          quantity: item.Quantity
        })),
        specialInstructions,
        deliveryMethod,
        paymentMethod
      });
      setShowCheckout(false);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Checkout</h2>
            <button
              onClick={() => setShowCheckout(false)}
              className="text-white hover:bg-white/20 p-2 rounded-full"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cartItems.map(item => (
                <div key={`${item.CartID}-${item.VariantID}`} className="flex justify-between text-sm">
                  <span>{item.ProductName} ({item.Colour}, {item.Size})</span>
                  <span>${(item.UnitPrice * item.Quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div>
            <label className="block text-gray-700 font-medium mb-3">Delivery Method</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="standard_delivery"
                  checked={deliveryMethod === 'standard_delivery'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Standard Delivery</span>
                  <p className="text-sm text-gray-600">5-7 business days</p>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="store_pickup"
                  checked={deliveryMethod === 'store_pickup'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Store Pickup</span>
                  <p className="text-sm text-gray-600">Ready in 1-2 business days</p>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-gray-700 font-medium mb-3">Payment Method</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="card_payment"
                  checked={paymentMethod === 'card_payment'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>Credit/Debit Card</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cash_on_delivery"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Special Instructions (Optional)</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Any special delivery instructions..."
            />
          </div>

          {/* Customer Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Delivery Address</h3>
            <p className="text-sm text-gray-600">
              {currentUser?.User_Address || 'No address provided'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {currentUser?.UserName} • {currentUser?.PhoneNumber}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Placing Order..." : `Place Order - $${getTotalPrice().toLocaleString()}`}
          </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
