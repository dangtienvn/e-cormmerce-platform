import { useState } from 'react';
import { Save, Shield, Bell, Globe, CreditCard } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = (e) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your system preferences and configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <nav className="flex flex-col">
              <button 
                onClick={() => setActiveTab('general')}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Globe className="w-4 h-4 mr-3" /> General
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Shield className="w-4 h-4 mr-3" /> Security
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Bell className="w-4 h-4 mr-3" /> Notifications
              </button>
              <button 
                onClick={() => setActiveTab('billing')}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'billing' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <CreditCard className="w-4 h-4 mr-3" /> Billing
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            
            {activeTab === 'general' && (
              <form onSubmit={handleSave}>
                <h2 className="text-lg font-bold text-slate-800 mb-6">General Settings</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Store Name</label>
                      <input type="text" defaultValue="Digital Store CRM" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Support Email</label>
                      <input type="email" defaultValue="support@digitalstore.com" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Store Description</label>
                    <textarea rows="4" defaultValue="Premium digital products and resources for developers and designers." className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                      <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>VND (₫)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                      <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>(GMT+07:00) Indochina Time</option>
                        <option>(GMT+00:00) UTC</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-800">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                    </div>
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                      Enable
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">Change Password</p>
                      <p className="text-sm text-slate-500 mt-1">Update your account password regularly.</p>
                    </div>
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'notifications' || activeTab === 'billing') && (
              <div className="py-12 text-center">
                <p className="text-slate-500 font-medium">This module is under development.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
