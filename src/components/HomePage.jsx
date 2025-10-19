import React from 'react';

const HomePage = ({ categories, setSelectedCategory, filteredProducts, ProductCard, productCardProps, selectedCategory, searchTerm, isFiltered }) => (
  <div>
    {/* Hero Section - Only show when no filters are active */}
    {!isFiltered && (
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            Welcome to BrightBuy
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Your one-stop shop for the latest electronics and gadgets
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setSelectedCategory('1')}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Shop Smartphones
            </button>
            <button 
              onClick={() => setSelectedCategory('2')}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Explore Laptops
            </button>
          </div>
        </div>
      </section>
    )}
    
    {/* Featured Categories - Only show when no filters are active */}
    {!isFiltered && (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categories.slice(0, 10).map(category => (
              <button
                key={category.CategoryID}
                onClick={() => setSelectedCategory(category.CategoryID.toString())}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span style={{fontSize: 32}} role="img" aria-label="package">📦</span>
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {category.CategoryName}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>
    )}
    {/* Products Grid */}
    <section className={`${isFiltered ? 'pt-8' : 'py-16'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800">
            {isFiltered ? (
              searchTerm.trim() ? (
                `Search Results for "${searchTerm}"`
              ) : (
                `Products in ${categories.find(c => c.CategoryID === parseInt(selectedCategory))?.CategoryName || 'Selected Category'}`
              )
            ) : (
              'All Products'
            )}
          </h2>
        </div>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <span style={{fontSize: 64}} role="img" aria-label="search">🔍</span>
            <p className="text-xl text-gray-500">No products found</p>
            <p className="text-gray-400">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.ProductID} product={product} {...productCardProps(product)} />
            ))}
          </div>
        )}
      </div>
    </section>
  </div>
);

export default HomePage;
