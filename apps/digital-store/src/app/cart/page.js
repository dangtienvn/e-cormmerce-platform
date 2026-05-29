'use client';

import Link from 'next/link';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import useCartStore from '../../store/useCartStore';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCartStore();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven't added any digital products to your cart yet.</p>
          <Link href="/" className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 hidden sm:grid grid-cols-12 gap-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            <ul className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <li key={item.id} className="p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                  <div className="col-span-6 flex items-center w-full">
                    <div className="h-16 w-16 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.product_images && item.product_images.length > 0 ? (
                        <img src={`http://localhost:5000${item.product_images[0].image_url}`} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 mt-1 flex items-center"
                      >
                        <Trash2 size={14} className="mr-1" /> Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center text-gray-700 font-medium w-full sm:w-auto flex justify-between sm:block mt-4 sm:mt-0">
                    <span className="sm:hidden text-gray-500">Price: </span>
                    {item.price?.toLocaleString()} ₫
                  </div>
                  
                  <div className="col-span-2 flex justify-center w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium"
                      >-</button>
                      <span className="px-3 py-1 text-sm font-medium w-10 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium"
                      >+</button>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-right font-bold text-gray-900 w-full sm:w-auto flex justify-between sm:block mt-4 sm:mt-0">
                    <span className="sm:hidden text-gray-500 font-normal">Total: </span>
                    {(item.price * item.quantity).toLocaleString()} ₫
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button 
                onClick={clearCart}
                className="text-sm text-gray-500 hover:text-red-600 font-medium"
              >
                Clear Cart
              </button>
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{getCartTotal().toLocaleString()} ₫</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (0%)</span>
                <span>0 ₫</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 mb-8 flex justify-between items-end">
              <span className="text-gray-900 font-bold">Total</span>
              <span className="text-2xl font-extrabold text-blue-600">{getCartTotal().toLocaleString()} ₫</span>
            </div>
            
            <Link 
              href="/checkout"
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg shadow-blue-600/20"
            >
              Proceed to Checkout <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
