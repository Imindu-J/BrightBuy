import React from 'react';
import { TrendingUp, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { getImageUrl, handleImageError, handleImageLoad } from '../../utils/imageUtils';

const Reports = ({ products, orders, categories }) => {
  const getOrderAmount = (o) => {
    const raw = o?.TotalAmount ?? o?.Total_Amount ?? o?.totalAmount ?? o?.total ?? 0;
    const num = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
    return Number.isFinite(num) ? num : 0;
  };
  const totalSales = (orders || []).reduce((sum, o) => sum + getOrderAmount(o), 0);
  const lowStockProducts = products.filter(p => (p.Stock || 0) < 10);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);

  // Inventory metrics
  const totalInventoryUnits = products.reduce((sum, p) => sum + (p.Stock || 0), 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.Base_price || 0) * (p.Stock || 0), 0);

  // Category-wise stock and value
  const categoryById = categories.reduce((acc, c) => { acc[c.CategoryID] = c; return acc; }, {});
  const stockByCategory = products.reduce((acc, p) => {
    const catId = p.CategoryID;
    const name = categoryById[catId]?.CategoryName || 'Uncategorized';
    const units = p.Stock || 0;
    const value = (p.Base_price || 0) * units;
    if (!acc[name]) acc[name] = { units: 0, value: 0 };
    acc[name].units += units;
    acc[name].value += value;
    return acc;
  }, {});

  const topStocked = [...products]
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
              <p className="text-3xl font-bold">{formatCurrency(totalSales)}</p>
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
              <p className="text-purple-100">Inventory Units</p>
              <p className="text-3xl font-bold">{totalInventoryUnits.toLocaleString()}</p>
            </div>
            <Package size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Inventory Value</p>
              <p className="text-3xl font-bold">LKR {totalInventoryValue.toLocaleString()}</p>
            </div>
            <AlertTriangle size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Stocked Products */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Top Stocked Products</h3>
          <div className="space-y-3">
            {topStocked.length > 0 ? (
              topStocked.map((product, idx) => (
                <div key={product.ProductID} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-400">#{idx + 1}</span>
                    <img
                      src={getImageUrl(product.ImageURL)}
                      alt={product.ProductName}
                      className="w-10 h-10 object-cover rounded"
                      onError={(e) => handleImageError(e, product.ImageURL)}
                      onLoad={() => handleImageLoad(product.ImageURL)}
                    />
                    <div>
                      <p className="font-medium text-gray-800">{product.ProductName}</p>
                      <p className="text-sm text-gray-500">{product.Brand}</p>
                    </div>
                  </div>
                  <span className="text-gray-700 font-semibold">{product.Stock || 0} units</span>
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

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Inventory by Category</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(stockByCategory).map(([name, { units, value }]) => (
            <div key={name} className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-800">{name}</p>
              <p className="text-sm text-gray-600">Units: {units.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Value: LKR {value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Orders by Status */}
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