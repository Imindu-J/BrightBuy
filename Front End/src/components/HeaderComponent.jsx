import React from 'react';

const HeaderComponent = ({ cartItems, setShowCart, currentUser, setCurrentPage, setShowLogin, searchTerm, setSearchTerm, isMenuOpen, setIsMenuOpen }) => (
  <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white shadow-2xl">
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {/* Menu icon here if needed */}
            <span>☰</span>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            BrightBuy
          </h1>
        </div>
        <div className="hidden lg:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            {/* Search icon here if needed */}
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowCart(true)}
            className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-300"
          >
            {/* ShoppingCart icon here if needed */}
            <span>🛒</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {cartItems.reduce((sum, item) => sum + item.Quantity, 0)}
              </span>
            )}
          </button>
          <button 
            onClick={() => currentUser ? setCurrentPage('profile') : setShowLogin(true)}
            className="flex items-center space-x-2 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-300"
          >
            {/* User icon here if needed */}
            <span>👤</span>
            <span className="hidden sm:block">
              {currentUser ? currentUser.UserName : 'Login'}
            </span>
          </button>
        </div>
      </div>
      {/* Mobile search */}
      <div className="lg:hidden mt-4">
        <div className="relative">
          {/* Search icon here if needed */}
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </div>
  </header>
);

export default HeaderComponent;
