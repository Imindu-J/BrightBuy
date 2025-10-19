import React, { useState } from 'react';
import { X } from 'lucide-react';

const StaffOrderHandling = ({ assignedOrders, fetchAssignedOrders }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/staff/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        alert('Order status updated successfully!');
        fetchAssignedOrders();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const handleMarkCompleted = async (orderId) => {
    if (!window.confirm('Mark this order as completed?')) return;
    await handleStatusUpdate(orderId, 'delivered');
  };

  const handleMarkReturned = async (orderId) => {
    if (!window.confirm('Mark this order as returned?')) return;
    await handleStatusUpdate(orderId, 'returned');
  };

  const filteredOrders = statusFilter === 'all' 
    ? assignedOrders 
    : assignedOrders.filter(o => o.Status?.toLowerCase() === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'returned'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              statusFilter === status
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No assigned orders found</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.OrderID} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Order #{order.OrderID}</h3>
                  <p className="text-gray-600">Customer: {order.UserName || `User #${order.UserID}`}</p>
                  <p className="text-sm text-gray-500">{new Date(order.OrderDate).toLocaleString()}</p>
                  {order.DeliveryAddress && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Delivery:</span> {order.DeliveryAddress}
                    </p>
                  )}
                </div>
                <div className="text-right mt-4 md:mt-0">
                  <p className="text-2xl font-bold text-green-600">LKR {order.TotalAmount?.toLocaleString()}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    order.Status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.Status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.Status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    order.Status === 'returned' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.Status}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 items-stretch md:items-center">
                <select
                  value={order.Status}
                  onChange={(e) => handleStatusUpdate(order.OrderID, e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="returned">Returned</option>
                </select>

                <button
                  onClick={() => handleMarkCompleted(order.OrderID)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Mark Completed
                </button>

                <button
                  onClick={() => handleMarkReturned(order.OrderID)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Mark Returned
                </button>

                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowModal(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Order Details #{selectedOrder.OrderID}</h2>
                <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-2 rounded-full">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <p className="text-gray-900">{selectedOrder.UserName || `User #${selectedOrder.UserID}`}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                  <p className="text-gray-900">{new Date(selectedOrder.OrderDate).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <p className="text-gray-900">{selectedOrder.Status}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <p className="text-2xl font-bold text-green-600">LKR {selectedOrder.TotalAmount?.toLocaleString()}</p>
                </div>
              </div>

              {selectedOrder.DeliveryAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <p className="text-gray-900">{selectedOrder.DeliveryAddress}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">Order items details will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOrderHandling;