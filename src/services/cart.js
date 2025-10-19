import axios from 'axios';

const API_URL = 'http://localhost:5000/cart';

export const getCart = async (token) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addToCart = async (variantId, quantity, token) => {
  const res = await axios.post(
    `${API_URL}/add`,
    { variantId, quantity },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const updateCartQuantity = async (cartId, variantId, quantityChange, token) => {
  const res = await axios.post(
    `${API_URL}/update`,
    { cartId, variantId, quantityChange },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
