import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CartModal from '../components/CartModal'; // adjust import path if needed

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const token = localStorage.getItem('token'); // replace with your auth token

  // Fetch all items in user's cart
  const fetchCart = async () => {
    try {
      const res = await axios.get('http://localhost:5000/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // Update cart item quantity
  const updateQuantity = async (cartId, variantId, change) => {
    try {
      const currentItem = cartItems.find(item => item.CartID === cartId && item.VariantID === variantId);
      if (!currentItem) return;

      const newQuantity = Math.max(0, currentItem.Quantity + change);
      
      await axios.put(
        'http://localhost:5000/cart/update',
        { variantId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart(); // refresh after updating
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert(error.response?.data?.error || 'Failed to update cart');
    }
  };

  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.UnitPrice * item.Quantity, 0);

  const handleCheckout = () => {
    alert('Checkout clicked!');
  };

  useEffect(() => {
    if (showCart) fetchCart();
  }, [showCart]);

  return (
    <div className="p-6">
      <button
        onClick={() => setShowCart(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        🛒 View Cart
      </button>

      {showCart && (
        <CartModal
          cartItems={cartItems}
          setShowCart={setShowCart}
          updateQuantity={updateQuantity}
          getTotalPrice={getTotalPrice}
          handleCheckout={handleCheckout}
          currentUser={true} // or replace with your user context
        />
      )}
    </div>
  );
};

export default CartPage;
