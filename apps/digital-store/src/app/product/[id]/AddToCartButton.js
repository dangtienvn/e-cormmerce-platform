'use client';

import { ShoppingCart } from 'lucide-react';
import useCartStore from '../../../store/useCartStore';

export default function AddToCartButton({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <button 
      onClick={() => addToCart(product)}
      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center transition-all hover:shadow-lg hover:shadow-blue-600/30 active:scale-95"
    >
      <ShoppingCart className="mr-3" size={24} />
      Add to Cart
    </button>
  );
}
