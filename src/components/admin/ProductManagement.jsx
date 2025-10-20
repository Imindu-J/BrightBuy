import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle, X, Upload } from 'lucide-react';
import { getImageUrl, handleImageError, handleImageLoad } from '../../utils/imageUtils';

const ProductManagement = ({ products, categories, fetchProducts, fetchCategories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    ProductName: '',
    Brand: '',
    Description: '',
    CategoryID: '',
    Base_price: '',
    Stock: '',
    ImageURL: ''
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', parentId: '' });

  const handleAddProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      // Backend expects name, description, brand, price, categoryId, sku, imageURL at /products (POST)
      const payload = {
        name: formData.ProductName,
        description: formData.Description,
        brand: formData.Brand,
        price: Number(formData.Base_price),
        categoryId: formData.CategoryID,
        sku: formData.SKU || '',
        imageURL: formData.ImageURL
      };
      const res = await fetch('http://localhost:5000/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Product added successfully!');
        fetchProducts();
        setShowModal(false);
        resetForm();
      }
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product');
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      // Assuming a PUT endpoint exists; if not, this can be adjusted later
      const payload = {
        name: formData.ProductName,
        description: formData.Description,
        brand: formData.Brand,
        price: Number(formData.Base_price),
        categoryId: formData.CategoryID,
        sku: formData.SKU || '',
        imageURL: formData.ImageURL
      };
      const res = await fetch(`http://localhost:5000/admin/products/${selectedProduct.ProductID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Product updated successfully!');
        fetchProducts();
        setShowModal(false);
        resetForm();
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Product deleted successfully!');
        fetchProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      ProductName: '',
      Brand: '',
      Description: '',
      CategoryID: '',
      Base_price: '',
      Stock: '',
      ImageURL: '',
      SKU: ''
    });
    setSelectedProduct(null);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      ProductName: product.ProductName,
      Brand: product.Brand,
      Description: product.Description,
      CategoryID: product.CategoryID,
      Base_price: product.Base_price,
      Stock: product.Stock || 0,
      ImageURL: product.ImageURL,
      SKU: product.SKU || ''
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          parentId: newCategory.parentId || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert('Category added successfully!');
        setShowCategoryModal(false);
        setNewCategory({ name: '', description: '', parentId: '' });
        if (fetchCategories) fetchCategories();
        // preselect newly created category if returned
        if (data?.id) setFormData({ ...formData, CategoryID: String(data.id) });
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add category');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Failed to add category');
    }
  };

  const filteredProducts = products.filter(p =>
    p.ProductName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.Brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => (p.Stock || 0) < 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setModalType('add');
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="text-yellow-600 mr-3" size={24} />
            <div>
              <h3 className="font-semibold text-yellow-800">Low Stock Alert</h3>
              <p className="text-yellow-700">{lowStockProducts.length} products have low stock (less than 10 units)</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.ProductID} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getImageUrl(product.ImageURL)}
                        alt={product.ProductName}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => handleImageError(e, product.ImageURL)}
                        onLoad={() => handleImageLoad(product.ImageURL)}
                      />
                      <span className="font-medium text-gray-800">{product.ProductName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.Brand}</td>
                  <td className="px-6 py-4 text-gray-600">{product.CategoryID}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">LKR {product.Base_price?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (product.Stock || 0) < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {product.Stock || 0} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.ProductID)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {modalType === 'add' ? 'Add New Product' : 'Edit Product'}
                </h2>
                <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-2 rounded-full">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.ProductName}
                onChange={(e) => setFormData({...formData, ProductName: e.target.value})}
              />
              <input
                type="text"
                placeholder="Brand"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.Brand}
                onChange={(e) => setFormData({...formData, Brand: e.target.value})}
              />
              <textarea
                placeholder="Description"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={formData.Description}
                onChange={(e) => setFormData({...formData, Description: e.target.value})}
              />
              <div className="grid grid-cols-3 gap-3 items-start">
                <select
                  className="col-span-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.CategoryID}
                  onChange={(e) => setFormData({...formData, CategoryID: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                >
                  + Add new category
                </button>
              </div>
              <input
                type="number"
                placeholder="Base Price (LKR)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.Base_price}
                onChange={(e) => setFormData({...formData, Base_price: e.target.value})}
              />
              <input
                type="text"
                placeholder="SKU (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.SKU || ''}
                onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.Stock}
                onChange={(e) => setFormData({...formData, Stock: e.target.value})}
              />
              <div>
                <label className="block text-gray-700 font-medium mb-2">Product Image URL</label>
                <input
                  type="text"
                  placeholder="/uploads/product.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.ImageURL}
                  onChange={(e) => setFormData({...formData, ImageURL: e.target.value})}
                />
              </div>
              <button
                onClick={modalType === 'add' ? handleAddProduct : handleUpdateProduct}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition"
              >
                {modalType === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Add New Category</h2>
                <button onClick={() => setShowCategoryModal(false)} className="hover:bg-white/20 p-2 rounded-full">
                  <X size={24} />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Parent Category (optional)</label>
                <select
                  value={newCategory.parentId}
                  onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {categories.map(cat => (
                    <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition"
              >
                Add Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;