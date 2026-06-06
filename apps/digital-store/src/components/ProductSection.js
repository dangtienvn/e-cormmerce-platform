'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';

export default function ProductSection({ products }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'ebook', label: 'Ebooks' },
    { id: 'template', label: 'Templates' },
    { id: 'course', label: 'Courses' },
    { id: 'tool', label: 'Tools' },
  ];

  // Filter logic: assume backend returns type as 'ebook', 'template', etc.
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.type?.toLowerCase() === activeCategory || p.category_name?.toLowerCase() === activeCategory);

  const setCategory = (catId) => {
    setActiveCategory(catId);
  };

  return (
    <div className="container mx-auto px-6 mt-20">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Featured Products</h2>
          <p className="text-gray-500 mt-2 text-lg">Discover our top-rated digital assets.</p>
        </div>
        
        {/* Category Filters (Toggle style) */}
        <div className="flex overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 hide-scrollbar w-full md:w-auto space-x-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === cat.id
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500">No products available in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
