import React from 'react';
import { TrendingUp, ShoppingCart, Package, AlertTriangle } from 'lucide-react';

const Reports = ({ products, orders }) => {
  const totalSales = orders.reduce((sum, o) => sum + (o.TotalAmount || 0), 0);
  const lowStockProducts = products.filter(p => (p.Stock || 0) < 10);
  
  // Get best selling products (top 5)
  const bestSelling = [...products]
    .sort((a, b) => (b.Stock || 0) - (a.Stock || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Sales</p>
              <p className="text-3xl font-bold">LKR {totalSales.toLocaleString()}</p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Orders</p>
              <p className="text-3xl font-bold">{orders.length}</p>
            </div>
            <ShoppingCart size={40} className="opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Products</p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
            <Package size={40} className="opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Low Stock Items</p>
              <p className="text-3xl font-bold">{lowStockProducts.length}</p>
            </div>
            <AlertTriangle size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Best Selling Products</h3>
          <div className="space-y-3">
            {bestSelling.length > 0 ? (
              bestSelling.map((product, idx) => (
                <div key={product.ProductID} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-400">#{idx + 1}</span>
                    <img
                      src={`http://localhost:5000${product.ImageURL}`}
                      alt={product.ProductName}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{product.ProductName}</p>
                      <p className="text-sm text-gray-500">{product.Brand}</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold">LKR {product.Base_price?.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No products available</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Low Stock Alerts</h3>
          <div className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, 5).map(product => (
                <div key={product.ProductID} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="text-red-600" size={20} />
                    <div>
                      <p className="font-medium text-gray-800">{product.ProductName}</p>
                      <p className="text-sm text-gray-500">{product.Brand}</p>
                    </div>
                  </div>
                  <span className="text-red-600 font-semibold">{product.Stock || 0} units</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">All products are well stocked!</p>
            )}
          </div>
        </div>
      </div>

      {/* Sales by Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Orders by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['pending', 'processing', 'shipped', 'delivered'].map(status => {
            const count = orders.filter(o => o.Status?.toLowerCase() === status).length;
            return (
              <div key={status} className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">{count}</p>
                <p className="text-sm text-gray-600 capitalize">{status}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;