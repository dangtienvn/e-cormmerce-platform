import { useState, useEffect } from 'react';
import api from '../lib/api';
import { User, Mail, Phone, MapPin, Shield, Edit } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // In a real app, you would have a /users/me endpoint.
      // Since it's an admin, we'll fetch the first admin user or based on token.
      // Here we assume the backend has an endpoint for me, or we decode the JWT.
      const data = await api.get('/auth/me').catch(() => null);
      if (data && data.user) {
        setProfile(data.user);
      } else {
        // Fallback: fetch users and find admin
        const users = await api.get('/users');
        const admin = (users.data || users).find(u => u.email === 'admin@example.com' || u.role_name === 'admin');
        setProfile(admin || { full_name: 'Admin User', email: 'admin@example.com', role_name: 'admin' });
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Profile</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-md">
              <div className="w-full h-full bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-3xl">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
            <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{profile?.full_name || 'Admin User'}</h2>
              <p className="text-slate-500 mb-6">{profile?.role_name === 'admin' ? 'System Administrator' : 'User'}</p>

              <div className="space-y-4">
                <div className="flex items-center text-slate-600 text-sm">
                  <Mail className="w-5 h-5 text-slate-400 mr-3" />
                  {profile?.email || 'admin@example.com'}
                </div>
                <div className="flex items-center text-slate-600 text-sm">
                  <Phone className="w-5 h-5 text-slate-400 mr-3" />
                  {profile?.phone || '+84 123 456 789'}
                </div>
                <div className="flex items-center text-slate-600 text-sm">
                  <MapPin className="w-5 h-5 text-slate-400 mr-3" />
                  {profile?.address || 'Hanoi, Vietnam'}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Password</p>
                    <p className="text-xs text-slate-500">Last changed 30 days ago</p>
                  </div>
                  <button className="text-sm text-blue-600 font-medium hover:underline">Update</button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Two-Factor Auth</p>
                    <p className="text-xs text-slate-500">Not enabled</p>
                  </div>
                  <button className="text-sm text-blue-600 font-medium hover:underline">Enable</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
