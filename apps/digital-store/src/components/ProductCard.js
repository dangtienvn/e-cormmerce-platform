'use client';

import Link from 'next/link';
import { ShoppingCart, Package } from 'lucide-react';
import useCartStore from '../store/useCartStore';

export default function ProductCard({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 overflow-hidden flex flex-col h-full relative">
      <Link href={`/product/${product.id}`} className="block relative aspect-[16/10] bg-gray-50 border-b border-gray-100 overflow-hidden">
        {product.product_images && product.product_images.length > 0 ? (
          <img 
            src={product.product_images.find(img => img.is_primary)?.image_url || product.product_images[0].image_url} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <Package size={48} strokeWidth={1} />
          </div>
        )}
      </Link>
      
      <div className="p-5 flex flex-col flex-grow relative z-10 bg-white">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-semibold text-base text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 pr-2">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed flex-grow">
          {product.description || 'High quality digital product with lifetime updates and premium support included.'}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-lg font-semibold text-gray-900 tracking-tight">
            {product.price?.toLocaleString()} ₫
          </span>
          <button 
            onClick={() => addToCart(product)}
            className="flex items-center justify-center h-8 w-8 rounded-md bg-gray-50 border border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-colors"
            title="Add to Cart"
          >
            <ShoppingCart size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
