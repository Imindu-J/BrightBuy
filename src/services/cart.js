import axios from 'axios';

const API_URL = 'http://localhost:5000/cart';

export const getCart = async (token) => {
  try {
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (variantId, quantity, token) => {
  try {
    const res = await axios.post(
      `${API_URL}/add`,
      { variantId, quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartQuantity = async (variantId, quantity, token) => {
  try {
    const res = await axios.put(
      `${API_URL}/update`,
      { variantId, quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
};

export const removeFromCart = async (variantId, token) => {
  try {
    const res = await axios.delete(
      `${API_URL}/remove/${variantId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async (token) => {
  try {
    const res = await axios.delete(
      `${API_URL}/clear`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};
