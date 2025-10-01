import React from 'react';

const CategoryNav = ({ categories, selectedCategory, setSelectedCategory }) => (
  <nav className="bg-white shadow-lg border-t-4 border-gradient-to-r from-blue-500 to-purple-500">
    <div className="container mx-auto px-4">
      <div className="flex items-center space-x-8 py-4 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-all duration-300 ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Products
        </button>
        {categories.map(category => (
          <button
            key={category.CategoryID}
            onClick={() => setSelectedCategory(category.CategoryID.toString())}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === category.CategoryID.toString()
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {category.CategoryName}
          </button>
        ))}
      </div>
    </div>
  </nav>
);

export default CategoryNav;
