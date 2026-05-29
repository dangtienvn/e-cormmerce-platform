'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import api from '../../lib/api';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { cartItems, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(!!sessionId);
  const [formData, setFormData] = useState({
    billing_name: '',
    billing_email: '',
    payment_method: 'credit_card'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    if (!user) {
      alert("Please login to checkout.");
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // 1. Prepare order payload
      const orderPayload = {
        ...formData,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      // 2. Call backend-core API to create order
      const orderResponse = await api.post('/orders/checkout', orderPayload);
      const orderId = orderResponse.data?.id || orderResponse.id; // Depending on ResponseHelper format
      
      if (!orderId) throw new Error("Order creation failed.");

      if (formData.payment_method === 'credit_card') {
        // 3. Call Stripe API
        const origin = window.location.origin;
        const stripeRes = await api.post('/payment/stripe/create-checkout-session', {
          orderId,
          successUrl: `${origin}/checkout`,
          cancelUrl: `${origin}/checkout`
        });

        if (stripeRes.data?.url) {
          window.location.href = stripeRes.data.url;
          return;
        }
      }
      
      // If VNPay or other methods were implemented, we would handle them here.
      // 4. Clear cart and show success (Fallback if no redirect)
      clearCart();
      setSuccess(true);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(error.response?.data?.message || error.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-gray-500 mb-8">
            Thank you for your purchase. Your digital products have been sent to your email and are available in your account.
          </p>
          <Link href="/profile" className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
            View My Products
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="billing_name"
                  required
                  value={formData.billing_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="billing_email"
                  required
                  value={formData.billing_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">Your digital products will be sent here.</p>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-blue-500 bg-blue-50/50 rounded-xl cursor-pointer">
                    <input type="radio" name="payment_method" value="credit_card" checked className="text-blue-600 focus:ring-blue-500 h-4 w-4" readOnly />
                    <CreditCard className="ml-3 mr-2 text-blue-600" size={20} />
                    <span className="font-medium text-blue-900">Credit Card</span>
                  </label>
                  
                  {/* Stripe Payment is selected */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                    <p className="text-sm text-gray-600">
                      You will be redirected to the secure Stripe checkout page to complete your payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-8 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? 'Processing...' : `Pay ${getCartTotal().toLocaleString()} ₫`}
            </button>
          </form>
        </div>

        {/* Order Summary sidebar */}
        <div>
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Order</h2>
            
            <ul className="space-y-4 mb-6 divide-y divide-gray-200">
              {cartItems.map(item => (
                <li key={item.id} className="pt-4 first:pt-0 flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">{(item.price * item.quantity).toLocaleString()} ₫</p>
                </li>
              ))}
            </ul>
            
            <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
              <span className="text-gray-900 font-bold">Total to Pay</span>
              <span className="text-3xl font-extrabold text-blue-600">{getCartTotal().toLocaleString()} ₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
