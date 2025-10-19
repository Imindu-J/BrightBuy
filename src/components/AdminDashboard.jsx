import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, Clock, LogOut } from 'lucide-react';
import ProductManagement from './admin/ProductManagement';
import UserManagement from './admin/UserManagement';
import OrderManagement from './admin/OrderManagement';
import Reports from './admin/Reports';

const AdminDashboard = ({ currentUser, setCurrentUser, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchOrders();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'from-green-500 to-green-600' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'from-purple-500 to-purple-600' },
    { label: 'Pending Orders', value: orders.filter(o => o.Status === 'pending').length, icon: Clock, color: 'from-orange-500 to-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Package size={32} />
              <div>
                <h1 className="text-2xl font-bold">BrightBuy Admin</h1>
                <p className="text-sm text-blue-100">Welcome, {currentUser?.UserName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`bg-gradient-to-br ${stat.color} text-white rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <Icon size={40} className="opacity-80" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b">
            {['products', 'users', 'orders', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'products' && (
            <ProductManagement 
              products={products}
              categories={categories}
              fetchProducts={fetchProducts}
            />
          )}
          {activeTab === 'users' && (
            <UserManagement 
              users={users}
              fetchUsers={fetchUsers}
            />
          )}
          {activeTab === 'orders' && (
            <OrderManagement 
              orders={orders}
              users={users}
              fetchOrders={fetchOrders}
            />
          )}
          {activeTab === 'reports' && (
            <Reports 
              products={products}
              orders={orders}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;