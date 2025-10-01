import React, { useState } from 'react';

const LoginModal = ({ setShowLogin, handleLogin, setShowSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Login</h2>
            <button
              onClick={() => setShowLogin(false)}
              className="text-white hover:bg-white/20 p-2 rounded-full"
            >
              ×
            </button>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin(email, password);
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Login
          </button>
        </form>
        <div className="px-6 pb-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              className="text-blue-500 hover:text-blue-600 font-medium"
              type="button"
              onClick={() => {
                setShowLogin(false);
                setShowSignup(true);
              }}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
