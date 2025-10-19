import React from 'react';

const ProfilePage = ({ currentUser, orderHistory, setCurrentPage, setCurrentUser }) => (
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
              <p className="text-sm text-blue-200">Customer since January 2024</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={currentUser?.UserName || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={currentUser?.Email || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={currentUser?.PhoneNumber || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Address</label>
                  <textarea
                    value={currentUser?.User_Address || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
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
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{order.Status}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                        <p className="text-lg font-bold text-green-600">${order.TotalAmount.toLocaleString()}</p>
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
  </div>
);

export default ProfilePage;
