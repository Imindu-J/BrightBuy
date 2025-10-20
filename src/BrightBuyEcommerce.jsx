import React, { useState, useEffect } from 'react';
import HeaderComponent from './components/HeaderComponent';
import CategoryNav from './components/CategoryNav';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import LoginModal from './components/LoginModal';
import ProductModal from './components/ProductModal';
import ProfilePage from './components/ProfilePage';
import HomePage from './components/HomePage';
import SignupModalClean from './components/SignupModalClean';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import { getCart, addToCart as addToCartAPI, updateCartQuantity, removeFromCart } from './services/cart';
import { placeOrder, getMyOrders } from './services/order';

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
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [showSignup, setShowSignup] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Debounced search function
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `http://localhost:5000/products/search?q=${encodeURIComponent(searchTerm)}&category=${selectedCategory}`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search by 300ms
    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

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
          // Load user's cart if they're a customer
          if (data.user.Role === 'customer') {
            loadUserCart(token);
          }
        }
      })
      .catch(err => {
        console.error('Session verification failed:', err);
        localStorage.removeItem('token');
      });
    }
  }, []);

  // Load user's cart from backend
  const loadUserCart = async (token) => {
    try {
      const cartData = await getCart(token);
      setCartItems(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  // Helper functions
  const getProductVariants = (productId) => variants.filter(v => v.ProductID === productId);

  const getSelectedVariantPrice = (productId) => {
    const productVariants = getProductVariants(productId);
    const product = products.find(p => p.ProductID === productId);
    const selected = selectedVariant[productId];
    
    
    if (selected && productVariants.length > 0) {
      const variant = productVariants.find(v =>
        v.Colour === selected.Colour &&
        v.Size === selected.Size &&
        v.Model === selected.Model
      );
      return variant ? variant.Variant_Price : productVariants[0].Variant_Price;
    }
    
    // Fallback to first variant price or product base price
    if (productVariants.length > 0) {
      return productVariants[0].Variant_Price;
    }
    
    // Final fallback to product base price
    return product?.Base_price || 0;
  };

  // Enhanced search function with fuzzy matching
  const fuzzySearch = (text, searchTerm) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const textLower = text.toLowerCase();
    
    // Exact match
    if (textLower.includes(searchLower)) return true;
    
    // Word boundary match (e.g., "lapt" matches "laptop")
    const words = textLower.split(/\s+/);
    for (const word of words) {
      if (word.startsWith(searchLower)) return true;
    }
    
    // Fuzzy match - check if search term characters appear in order
    let searchIndex = 0;
    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
      if (textLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
    }
    
    // If we found all characters in order, it's a match
    return searchIndex === searchLower.length;
  };

  // Use search results if available, otherwise use local filtering
  const filteredProducts = searchTerm.trim() 
    ? searchResults.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.CategoryID === parseInt(selectedCategory);
        return matchesCategory;
      })
    : products.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.CategoryID === parseInt(selectedCategory);
        return matchesCategory;
      });

  // Determine if any filters are active
  const isFiltered = searchTerm.trim() !== '' || selectedCategory !== 'all';

  // Scroll to top when filters are applied
  useEffect(() => {
    if (isFiltered) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isFiltered]);

  const addToCart = async (product) => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }

    const productVariants = getProductVariants(product.ProductID);
    const selectedVar = selectedVariant[product.ProductID] || productVariants[0];
    const variant = productVariants.find(v =>
      v.Colour === selectedVar.Colour &&
      v.Size === selectedVar.Size &&
      v.Model === selectedVar.Model
    ) || productVariants[0];

    if (!variant) {
      alert('Please select a variant');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Present' : 'Missing');
      console.log('Token value:', token);
      console.log('Adding to cart:', { variantId: variant.VariantID, quantity: 1 });
      
      if (!token) {
        alert('Please login again - your session has expired');
        setShowLogin(true);
        setCurrentUser(null);
        return;
      }
      
      await addToCartAPI(variant.VariantID, 1, token);
      
      // Reload cart from backend
      const cartData = await getCart(token);
      setCartItems(cartData);
      
      alert('Item added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error response:', error.response?.data);
      
      // If token is invalid, ask user to login again
      if (error.response?.status === 403 || error.response?.status === 401) {
        localStorage.removeItem('token');
        setCurrentUser(null);
        setShowLogin(true);
        alert('Your session has expired. Please login again.');
      } else {
        alert(error.response?.data?.error || 'Failed to add item to cart');
      }
    }
  };

  const updateQuantity = async (cartId, variantId, change) => {
    if (!currentUser) return;

    const currentItem = cartItems.find(item => item.CartID === cartId && item.VariantID === variantId);
    if (!currentItem) return;

    const newQuantity = Math.max(0, currentItem.Quantity + change);

    try {
      const token = localStorage.getItem('token');
      await updateCartQuantity(variantId, newQuantity, token);
      
      // Reload cart from backend
      const cartData = await getCart(token);
      setCartItems(cartData);
    } catch (error) {
      console.error('Error updating cart:', error);
      alert(error.response?.data?.error || 'Failed to update cart');
    }
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
        
        // Load user's cart if they're a customer
        if (data.user.Role === 'customer') {
          loadUserCart(data.token);
        }
        
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


  const handleCheckout = async (orderData) => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Place order
      const result = await placeOrder(orderData, token);
      
      // Clear cart and show success
      setCartItems([]);
      setShowCart(false);
      setShowCheckout(false);
      
      // Load updated order history
      const orders = await getMyOrders(token);
      setOrderHistory(orders);
      
      alert(`Order placed successfully! Order ID: ${result.orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.error || 'Failed to place order');
      throw error; // Re-throw to handle in CheckoutModal
    }
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
        isSearching={isSearching}
      />

      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {currentPage === 'home' && (
        <div>
          {isFiltered && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-blue-400">🔍</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      {isSearching ? (
                        'Searching...'
                      ) : searchTerm.trim() ? (
                        `Found ${filteredProducts.length} result${filteredProducts.length !== 1 ? 's' : ''} for "${searchTerm}"`
                      ) : (
                        `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} in selected category`
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
          <HomePage
            categories={categories}
            setSelectedCategory={setSelectedCategory}
            filteredProducts={filteredProducts}
            ProductCard={ProductCard}
            productCardProps={productCardProps}
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
            isFiltered={isFiltered}
          />
        </div>
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          currentUser={currentUser}
          orderHistory={orderHistory}
          setCurrentPage={setCurrentPage}
          setCurrentUser={setCurrentUser}
          loadOrderHistory={async () => {
            if (currentUser && currentUser.Role === 'customer') {
              try {
                const token = localStorage.getItem('token');
                const orders = await getMyOrders(token);
                setOrderHistory(orders);
              } catch (error) {
                console.error('Error loading order history:', error);
              }
            }
          }}
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
          setShowCheckout={setShowCheckout}
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

      {showCheckout && (
        <CheckoutModal
          cartItems={cartItems}
          setShowCheckout={setShowCheckout}
          handlePlaceOrder={handleCheckout}
          currentUser={currentUser}
          getTotalPrice={getTotalPrice}
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
