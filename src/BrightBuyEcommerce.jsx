import React, { useState } from 'react';
import HeaderComponent from './components/HeaderComponent';
import CategoryNav from './components/CategoryNav';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import LoginModal from './components/LoginModal';
import ProductModal from './components/ProductModal';
import ProfilePage from './components/ProfilePage';
import HomePage from './components/HomePage';
import SignupModalClean from './components/SignupModalClean';

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

  // Data
  const categories = [
    { CategoryID: 1, CategoryName: 'Smartphones', Description: 'Latest mobile phones and accessories', ParentCategoryID: null },
    { CategoryID: 2, CategoryName: 'Audio Devices', Description: 'Headphones, speakers, and audio equipment', ParentCategoryID: null },
    { CategoryID: 3, CategoryName: 'Laptops', Description: 'Gaming and business laptops', ParentCategoryID: null },
    { CategoryID: 4, CategoryName: 'Gaming', Description: 'Gaming consoles and accessories', ParentCategoryID: null },
    { CategoryID: 5, CategoryName: 'Smart Home', Description: 'IoT and smart home devices', ParentCategoryID: null },
    { CategoryID: 6, CategoryName: 'Wearables', Description: 'Smartwatches and fitness trackers', ParentCategoryID: null },
    { CategoryID: 7, CategoryName: 'Tablets', Description: 'iPads and Android tablets', ParentCategoryID: null },
    { CategoryID: 8, CategoryName: 'Cameras', Description: 'Digital cameras and accessories', ParentCategoryID: null },
    { CategoryID: 9, CategoryName: 'Accessories', Description: 'Phone cases, cables, and more', ParentCategoryID: null },
    { CategoryID: 10, CategoryName: 'TV & Entertainment', Description: 'Smart TVs and streaming devices', ParentCategoryID: null }
  ];

  const products = [
    {
      ProductID: 1,
      ProductName: 'iPhone 15 Pro',
      Description: 'Latest iPhone with titanium design',
      Brand: 'Apple',
      Base_price: 999,
      CategoryID: 1,
      Availability: true,
      SKU: 'IP15P001',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      rating: 4.8,
      reviews: 2341
    },
    {
      ProductID: 2,
      ProductName: 'Samsung Galaxy S24',
      Description: 'AI-powered Android flagship',
      Brand: 'Samsung',
      Base_price: 899,
      CategoryID: 1,
      Availability: true,
      SKU: 'SGS24001',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
      rating: 4.6,
      reviews: 1876
    },
    {
      ProductID: 3,
      ProductName: 'MacBook Air M3',
      Description: '13-inch laptop with M3 chip',
      Brand: 'Apple',
      Base_price: 1299,
      CategoryID: 3,
      Availability: true,
      SKU: 'MBA13M3',
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
      rating: 4.9,
      reviews: 987
    },
    {
      ProductID: 4,
      ProductName: 'Sony WH-1000XM5',
      Description: 'Premium noise-canceling headphones',
      Brand: 'Sony',
      Base_price: 399,
      CategoryID: 2,
      Availability: true,
      SKU: 'SWXM5001',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
      rating: 4.7,
      reviews: 3421
    },
    {
      ProductID: 5,
      ProductName: 'PlayStation 5',
      Description: 'Next-gen gaming console',
      Brand: 'Sony',
      Base_price: 499,
      CategoryID: 4,
      Availability: true,
      SKU: 'PS5CONS',
      image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400',
      rating: 4.8,
      reviews: 5632
    },
    {
      ProductID: 6,
      ProductName: 'iPad Pro 12.9"',
      Description: 'Professional tablet with M2 chip',
      Brand: 'Apple',
      Base_price: 1099,
      CategoryID: 7,
      Availability: true,
      SKU: 'IPADP129',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
      rating: 4.6,
      reviews: 1234
    },
    {
      ProductID: 7,
      ProductName: 'Apple Watch Series 9',
      Description: 'Advanced fitness and health tracking',
      Brand: 'Apple',
      Base_price: 399,
      CategoryID: 6,
      Availability: true,
      SKU: 'AWS9001',
      image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400',
      rating: 4.5,
      reviews: 2987
    },
    {
      ProductID: 8,
      ProductName: 'Samsung 65" QLED TV',
      Description: '4K Smart TV with Quantum Dot technology',
      Brand: 'Samsung',
      Base_price: 1299,
      CategoryID: 10,
      Availability: true,
      SKU: 'SQ65TV01',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
      rating: 4.4,
      reviews: 876
    }
  ];

  const variants = [
    { VariantID: 1, ProductID: 1, colour: 'Natural Titanium', size: '128GB', Model: 'Standard', Varient_Price: 999, StockQuantity: 25 },
    { VariantID: 2, ProductID: 1, colour: 'Blue Titanium', size: '256GB', Model: 'Standard', Varient_Price: 1099, StockQuantity: 18 },
    { VariantID: 3, ProductID: 1, colour: 'White Titanium', size: '512GB', Model: 'Standard', Varient_Price: 1299, StockQuantity: 12 },
    { VariantID: 4, ProductID: 2, colour: 'Phantom Black', size: '128GB', Model: 'Standard', Varient_Price: 899, StockQuantity: 30 },
    { VariantID: 5, ProductID: 2, colour: 'Cream', size: '256GB', Model: 'Standard', Varient_Price: 999, StockQuantity: 22 },
    { VariantID: 6, ProductID: 3, colour: 'Silver', size: '256GB', Model: '8GB RAM', Varient_Price: 1299, StockQuantity: 15 },
    { VariantID: 7, ProductID: 3, colour: 'Space Gray', size: '512GB', Model: '16GB RAM', Varient_Price: 1599, StockQuantity: 8 },
    { VariantID: 8, ProductID: 4, colour: 'Black', size: 'Standard', Model: 'XM5', Varient_Price: 399, StockQuantity: 45 },
    { VariantID: 9, ProductID: 5, colour: 'White', size: 'Standard', Model: 'Standard', Varient_Price: 499, StockQuantity: 20 },
    { VariantID: 10, ProductID: 6, colour: 'Silver', size: '128GB', Model: 'Wi-Fi', Varient_Price: 1099, StockQuantity: 12 },
    { VariantID: 11, ProductID: 7, colour: 'Midnight', size: '45mm', Model: 'GPS', Varient_Price: 399, StockQuantity: 35 },
    { VariantID: 12, ProductID: 8, colour: 'Black', size: '65"', Model: 'QLED 4K', Varient_Price: 1299, StockQuantity: 8 }
  ];

  // Helper functions
  const getProductVariants = (productId) => variants.filter(v => v.ProductID === productId);
  const getSelectedVariantPrice = (productId) => {
    const productVariants = getProductVariants(productId);
    const selected = selectedVariant[productId];
    if (selected && productVariants.length > 0) {
      const variant = productVariants.find(v =>
        v.colour === selected.colour &&
        v.size === selected.size &&
        v.Model === selected.Model
      );
      return variant ? variant.Varient_Price : productVariants[0].Varient_Price;
    }
    return productVariants[0]?.Varient_Price || 0;
  };
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.CategoryID === parseInt(selectedCategory);
    const matchesSearch = product.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) || product.Brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const addToCart = (product) => {
    const productVariants = getProductVariants(product.ProductID);
    const selectedVar = selectedVariant[product.ProductID] || productVariants[0];
    const variant = productVariants.find(v =>
      v.colour === selectedVar.colour &&
      v.size === selectedVar.size &&
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
        image: product.image,
        Quantity: 1,
        UnitPrice: variant.Varient_Price,
        colour: variant.colour,
        size: variant.size,
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
  const handleLogin = (email, password) => {
    setCurrentUser({
      UserID: 1,
      UserName: 'John Doe',
      Email: email,
      Role: 'Customer'
    });
    setShowLogin(false);
  };
  const handleSignup = (userData) => {
    setCurrentUser({
      UserID: Date.now(),
      ...userData,
      Role: 'Customer'
    });
    setShowSignup(false);
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

  // Props for ProductCard
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
          onSignup={handleSignup}
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
