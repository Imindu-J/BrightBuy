import axios from 'axios';

const API_URL = 'http://localhost:5000/order';

export const placeOrder = async (orderData, token) => {
  try {
    const res = await axios.post(
      API_URL,
      orderData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

export const getMyOrders = async (token) => {
  try {
    const res = await axios.get(
      `${API_URL}/my-orders`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderDetails = async (orderId, token) => {
  try {
    const res = await axios.get(
      `${API_URL}/${orderId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status, token) => {
  try {
    const res = await axios.put(
      `${API_URL}/${orderId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
