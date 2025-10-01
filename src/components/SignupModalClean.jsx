import React, { useState } from 'react';
import axios from 'axios';

const SignupModalClean = ({ onClose }) => {
  const [userData, setUserData] = useState({
    UserName: '',
    Email: '',
    Password: '',
    PhoneNumber: '',
    User_Address: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // match backend expected keys
      const payload = {
        username: userData.UserName,
        email: userData.Email,
        password: userData.Password,
        phone: userData.PhoneNumber,
        address: userData.User_Address,
      };

      const res = await axios.post('http://localhost:5000/auth/register', payload);

      alert(res.data.message || 'User registered successfully');
      onClose(); // close modal after success
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Create Account</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full"
            >
              ×
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="text"
            name="UserName"
            placeholder="Full Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
            onChange={handleChange}
          />
          <input
            type="email"
            name="Email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
            onChange={handleChange}
          />
          <input
            type="password"
            name="Password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
            onChange={handleChange}
          />
          <input
            type="text"
            name="PhoneNumber"
            placeholder="Phone Number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            onChange={handleChange}
          />
          <textarea
            name="User_Address"
            placeholder="Address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows="3"
            onChange={handleChange}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupModalClean;
