'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, User } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';

export default function Header() {
  // Use Zustand store hooks
  const cartCount = useCartStore((state) => state.getCartCount());
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-3 group"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
            <Image src="/img/avatar.png" alt="Kernel Avatar" fill className="object-cover" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Kernel
          </span>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-md py-1.5 pl-4 pr-10 text-sm focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors placeholder:text-gray-400"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            <Search size={16} />
          </button>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-6">
          {mounted && user ? (
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Browse
            </Link>
          ) : (
            mounted && (
              <Link href="/register" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Register
              </Link>
            )
          )}
          
          <Link href="/cart" className="relative text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center">
            <ShoppingCart size={20} strokeWidth={1.5} />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-black text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {mounted && user ? (
            <Link href="/profile" className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-200">
              <User size={16} />
            </Link>
          ) : (
            mounted && (
              <Link href="/login" className="text-sm font-medium text-white bg-black px-4 py-1.5 rounded-md hover:bg-gray-800 transition-colors">
                Log in
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
