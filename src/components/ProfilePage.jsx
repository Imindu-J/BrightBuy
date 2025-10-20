import React, { useState } from 'react';
import PasswordResetModal from './PasswordResetModal';

const ProfilePage = ({ currentUser, orderHistory, setCurrentPage, setCurrentUser, loadOrderHistory }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Load order history when component mounts
  React.useEffect(() => {
    if (loadOrderHistory) {
      loadOrderHistory();
    }
  }, [loadOrderHistory]);

  // Debug: Log currentUser to see what data we have
  React.useEffect(() => {
    console.log('ProfilePage currentUser:', currentUser);
    console.log('CreatedAt value:', currentUser?.CreatedAt);
  }, [currentUser]);

  // Initialize edit form when user data changes
  React.useEffect(() => {
    if (currentUser) {
      setEditForm({
        username: currentUser.UserName || '',
        email: currentUser.Email || '',
        phoneNumber: currentUser.PhoneNumber || '',
        address: currentUser.User_Address || ''
      });
    }
  }, [currentUser]);

  // Helper function to format date to "Month Year" format
  const formatDateToMonthYear = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.log('Invalid date string:', dateString);
      return 'Unknown';
    }
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Helper function to capitalize role
  const capitalizeRole = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setCurrentUser(data.user);
        setIsEditing(false);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditForm({
      username: currentUser.UserName || '',
      email: currentUser.Email || '',
      phoneNumber: currentUser.PhoneNumber || '',
      address: currentUser.User_Address || ''
    });
    setError('');
    setSuccess('');
    setIsEditing(false);
  };

  // Handle password change success
  const handlePasswordChangeSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 5000);
  };

  return (
  <div className="container mx-auto px-4 py-8">
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <span style={{fontSize: 40}} role="img" aria-label="user">👤</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{currentUser?.UserName}</h1>
              <p className="text-blue-100">{currentUser?.Email}</p>
              <p className="text-sm text-blue-200">
                {capitalizeRole(currentUser?.Role)} since {formatDateToMonthYear(currentUser?.CreatedAt)}
              </p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Account Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      isEditing ? '' : 'bg-gray-50'
                    }`}
                    readOnly={!isEditing}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      isEditing ? '' : 'bg-gray-50'
                    }`}
                    readOnly={!isEditing}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      isEditing ? '' : 'bg-gray-50'
                    }`}
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Address</label>
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      isEditing ? '' : 'bg-gray-50'
                    }`}
                    rows="3"
                    readOnly={!isEditing}
                  />
                </div>
              </form>

              <div className="mt-6">
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order History</h2>
              {orderHistory.length === 0 ? (
                <div className="text-center py-8">
                  <span style={{fontSize: 48}} role="img" aria-label="package">📦</span>
                  <p className="text-gray-500">No orders yet</p>
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map(order => (
                    <div key={order.OrderID} className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">Order #{order.OrderID}</h3>
                          <p className="text-sm text-gray-600">{new Date(order.OrderDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.Status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.Status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.Status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.Status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.Status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-gray-600">{order.items ? order.items.length : 0} item(s)</p>
                        <p className="text-lg font-bold text-green-600">LKR {order.TotalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center mt-8 pt-8 border-t">
            <button
              onClick={() => setCurrentPage('home')}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Shopping
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                setCurrentUser(null);
                setCurrentPage('home');
              }}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <PasswordResetModal
      isOpen={isPasswordModalOpen}
      onClose={() => setIsPasswordModalOpen(false)}
      onSuccess={handlePasswordChangeSuccess}
    />
  </div>
  );
};

export default ProfilePage;
