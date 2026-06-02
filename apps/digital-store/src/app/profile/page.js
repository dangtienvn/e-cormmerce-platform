'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/useAuthStore';
import api from '../../lib/api';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        // Fetch user orders from the correct endpoint
        const res = await api.get('/orders/my/orders');
        if (res.success) {
          setOrders(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, router]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                  {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.full_name || user.username}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
              
              <div className="border-t border-gray-100 pt-6">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order History</h3>
              
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-100 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{Number(order.final_amount).toLocaleString()} ₫</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
