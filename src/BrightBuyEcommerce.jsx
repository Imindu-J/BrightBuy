import React, { useState, useEffect } from 'react';
import HeaderComponent from './components/HeaderComponent';
import CategoryNav from './components/CategoryNav';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import LoginModal from './components/LoginModal';
import ProductModal from './components/ProductModal';
import ProfilePage from './components/ProfilePage';
import HomePage from './components/HomePage';
import SignupModalClean from './components/SignupModalClean';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';

const BrightBuyEcommerce = () => {
  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [showSignup, setShowSignup] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  // Fetch categories
  useEffect(() => {
    fetch('http://localhost:5000/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to fetch categories', err));
  }, []);

  // Fetch products
  useEffect(() => {
    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch products', err));
  }, []);

  // Fetch variants
  useEffect(() => {
    fetch('http://localhost:5000/products/variants')
      .then(res => res.json())
      .then(data => setVariants(data))
      .catch(err => console.error('Failed to fetch variants', err));
  }, []);

  // Check for existing session on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          // Set appropriate page based on role
          if (data.user.Role === 'admin') {
            setCurrentPage('admin');
          } else if (data.user.Role === 'staff') {
            setCurrentPage('staff');
          }
        }
      })
      .catch(err => {
        console.error('Session verification failed:', err);
        localStorage.removeItem('token');
      });
    }
  }, []);

  // Helper functions
  const getProductVariants = (productId) => variants.filter(v => v.ProductID === productId);

  const getSelectedVariantPrice = (productId) => {
    const productVariants = getProductVariants(productId);
    const selected = selectedVariant[productId];
    if (selected && productVariants.length > 0) {
      const variant = productVariants.find(v =>
        v.Colour === selected.colour &&
        v.Size === selected.size &&
        v.Model === selected.Model
      );
      return variant ? variant.Variant_Price : productVariants[0].Variant_Price;
    }
    return productVariants[0]?.Variant_Price || 0;
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.CategoryID === parseInt(selectedCategory);
    const matchesSearch = product.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.Brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    const productVariants = getProductVariants(product.ProductID);
    const selectedVar = selectedVariant[product.ProductID] || productVariants[0];
    const variant = productVariants.find(v =>
      v.Colour === selectedVar.colour &&
      v.Size === selectedVar.size &&
      v.Model === selectedVar.Model
    ) || productVariants[0];

    const existingItem = cartItems.find(item =>
      item.ProductID === product.ProductID &&
      item.VariantID === variant.VariantID
    );

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.ProductID === product.ProductID && item.VariantID === variant.VariantID
          ? { ...item, Quantity: item.Quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        CartID: Date.now(),
        ProductID: product.ProductID,
        VariantID: variant.VariantID,
        ProductName: product.ProductName,
        Brand: product.Brand,
        image: product.ImageURL,
        Quantity: 1,
        UnitPrice: variant.Variant_Price,
        colour: variant.Colour,
        size: variant.Size,
        Model: variant.Model
      }]);
    }
  };

  const updateQuantity = (cartId, variantId, change) => {
    setCartItems(cartItems.map(item => {
      if (item.CartID === cartId && item.VariantID === variantId) {
        const newQuantity = Math.max(0, item.Quantity + change);
        return newQuantity === 0 ? null : { ...item, Quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const getTotalPrice = () => cartItems.reduce((total, item) => total + (item.UnitPrice * item.Quantity), 0);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        setShowLogin(false);
        
        // Role-based navigation after login
        if (data.user.Role === 'admin') {
          setCurrentPage('admin');
        } else if (data.user.Role === 'staff') {
          setCurrentPage('staff');
        } else {
          setCurrentPage('home');
        }
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong. Please try again.');
    }
  };


  const handleCheckout = () => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    const newOrder = {
      OrderID: Date.now(),
      OrderDate: new Date().toISOString(),
      Status: 'Processing',
      TotalAmount: getTotalPrice(),
      UserID: currentUser.UserID,
      items: cartItems
    };
    setOrderHistory([...orderHistory, newOrder]);
    setCartItems([]);
    setShowCart(false);
    alert('Order placed successfully!');
  };

  const productCardProps = (product) => ({
    product,
    onView: setSelectedProduct,
    onAddToCart: addToCart,
    selectedVariant,
    setSelectedVariant,
    productVariants: getProductVariants(product.ProductID),
    currentPrice: getSelectedVariantPrice(product.ProductID)
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderComponent
        cartItems={cartItems}
        setShowCart={setShowCart}
        currentUser={currentUser}
        setCurrentPage={setCurrentPage}
        setShowLogin={setShowLogin}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {currentPage === 'home' && (
        <HomePage
          categories={categories}
          setSelectedCategory={setSelectedCategory}
          filteredProducts={filteredProducts}
          ProductCard={ProductCard}
          productCardProps={productCardProps}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          currentUser={currentUser}
          orderHistory={orderHistory}
          setCurrentPage={setCurrentPage}
          setCurrentUser={setCurrentUser}
        />
      )}

      {currentPage === 'admin' && currentUser?.Role === 'admin' && (
        <AdminDashboard
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'staff' && currentUser?.Role === 'staff' && (
        <StaffDashboard
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          setCurrentPage={setCurrentPage}
        />
      )}

      {showCart && (
        <CartModal
          cartItems={cartItems}
          setShowCart={setShowCart}
          updateQuantity={updateQuantity}
          getTotalPrice={getTotalPrice}
          handleCheckout={handleCheckout}
          currentUser={currentUser}
        />
      )}

      {showLogin && (
        <LoginModal
          setShowLogin={setShowLogin}
          handleLogin={handleLogin}
          setShowSignup={setShowSignup}
        />
      )}

      {selectedProduct && (
        <ProductModal
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          addToCart={addToCart}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          productVariants={getProductVariants(selectedProduct.ProductID)}
          currentPrice={getSelectedVariantPrice(selectedProduct.ProductID)}
        />
      )}

      {showSignup && (
        <SignupModalClean
          onClose={() => setShowSignup(false)}
          onSignup={(userData) => {
            setCurrentUser(userData);
            setShowSignup(false);
            setCurrentPage('home');
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                BrightBuy
              </h3>
              <p className="text-gray-300">
                Your trusted electronics retailer in Texas. Quality products, great prices, exceptional service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><button className="hover:text-white transition-colors">About Us</button></li>
                <li><button className="hover:text-white transition-colors">Contact</button></li>
                <li><button className="hover:text-white transition-colors">Store Locations</button></li>
                <li><button className="hover:text-white transition-colors">Careers</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-300">
                <li><button className="hover:text-white transition-colors">Help Center</button></li>
                <li><button className="hover:text-white transition-colors">Returns</button></li>
                <li><button className="hover:text-white transition-colors">Shipping Info</button></li>
                <li><button className="hover:text-white transition-colors">Warranty</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">f</button>
                <button className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">t</button>
                <button className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">i</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BrightBuy Electronics. All rights reserved. | Texas, USA</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BrightBuyEcommerce;
