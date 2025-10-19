import React, { useState } from 'react';
import { Search, AlertTriangle, X } from 'lucide-react';

const StaffInventory = ({ products, fetchProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockUpdate, setStockUpdate] = useState({ quantity: '', action: 'add', reason: '' });
  const [lowStockReport, setLowStockReport] = useState('');

  const handleStockUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const newStock = stockUpdate.action === 'add' 
        ? selectedProduct.StockQuantity + parseInt(stockUpdate.quantity)
        : selectedProduct.StockQuantity - parseInt(stockUpdate.quantity);

      const res = await fetch(`http://localhost:5000/staff/inventory/${selectedProduct.VariantID}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          stockQuantity: newStock
        })
      });
      
      if (res.ok) {
        alert('Stock updated successfully!');
        fetchProducts();
        setShowModal(false);
        setStockUpdate({ quantity: '', action: 'add', reason: '' });
      }
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock');
    }
  };

  const handleReportLowStock = async () => {
    try {
      const token = localStorage.getItem('token');
      const lowStockItems = products.filter(p => p.StockQuantity <= p.RecorderLevel);
      
      const res = await fetch('http://localhost:5000/staff/report-low-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          variants: lowStockItems.map(p => p.VariantID),
          note: lowStockReport
        })
      });
      
      if (res.ok) {
        alert('Low stock report sent to admin successfully!');
        setLowStockReport('');
      }
    } catch (err) {
      console.error('Error reporting low stock:', err);
      alert('Failed to send report');
    }
  };

  const filteredProducts = products.filter(p =>
    p.ProductName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.Brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.StockQuantity <= p.RecorderLevel);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/staff/inventory/debug', {
                  headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                alert(`Database Counts:\nProducts: ${data.totalProducts}\nVariants: ${data.totalVariants}\nInventory Items: ${data.inventoryItems}\nFrontend Showing: ${products.length}`);
              } catch (err) {
                console.error('Error getting debug info:', err);
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition whitespace-nowrap"
          >
            Debug Counts
          </button>
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/staff/inventory/test-low-stock', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                  alert('Test low stock data created! Refresh to see low stock items.');
                  fetchProducts();
                }
              } catch (err) {
                console.error('Error creating test data:', err);
              }
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition whitespace-nowrap"
          >
            Create Test Low Stock
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <AlertTriangle className="text-yellow-600 mr-3" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-800">Low Stock Alert</h3>
                <p className="text-yellow-700">{lowStockProducts.length} products have low stock (less than 10 units)</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Send low stock report to admin?')) {
                  handleReportLowStock();
                }
              }}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition whitespace-nowrap"
            >
              Report to Admin
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map(variant => (
                <tr key={variant.VariantID} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">📦</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">{variant.ProductName}</span>
                        <p className="text-sm text-gray-500">ID: {variant.ProductID}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{variant.Brand}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      {variant.Colour && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{variant.Colour}</span>}
                      {variant.Size && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{variant.Size}</span>}
                      {variant.Model && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{variant.Model}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      variant.StockQuantity <= variant.RecorderLevel ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {variant.StockQuantity} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{variant.RecorderLevel}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedProduct(variant);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      Update Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Stock Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Update Stock</h2>
                <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-2 rounded-full">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">{selectedProduct.ProductName}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedProduct.Brand}</p>
                <div className="flex space-x-2 mb-2">
                  {selectedProduct.Colour && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{selectedProduct.Colour}</span>}
                  {selectedProduct.Size && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{selectedProduct.Size}</span>}
                  {selectedProduct.Model && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{selectedProduct.Model}</span>}
                </div>
                <p className="text-sm text-gray-600">Current Stock: <span className="font-semibold">{selectedProduct.StockQuantity} units</span></p>
                <p className="text-sm text-gray-600">Reorder Level: <span className="font-semibold">{selectedProduct.RecorderLevel} units</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <select
                  value={stockUpdate.action}
                  onChange={(e) => setStockUpdate({...stockUpdate, action: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="add">Add Stock (Restock)</option>
                  <option value="subtract">Subtract Stock (Shipment)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  placeholder="Enter quantity"
                  min="1"
                  value={stockUpdate.quantity}
                  onChange={(e) => setStockUpdate({...stockUpdate, quantity: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  placeholder="Enter reason for stock update"
                  value={stockUpdate.reason}
                  onChange={(e) => setStockUpdate({...stockUpdate, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              {stockUpdate.quantity && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    New Stock: <span className="font-semibold">
                      {stockUpdate.action === 'add' 
                        ? selectedProduct.StockQuantity + parseInt(stockUpdate.quantity)
                        : selectedProduct.StockQuantity - parseInt(stockUpdate.quantity)
                      } units
                    </span>
                  </p>
                </div>
              )}

              <button
                onClick={handleStockUpdate}
                disabled={!stockUpdate.quantity}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffInventory;