import { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, Menu, X, Check, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Header({ sidebarOpen, toggleSidebar }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications/unread');
      setNotifications(data.data || data || []);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all read");
    }
  };

  return (
    <header className="h-16 glass border-b border-white/20 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="mr-4 text-slate-500 hover:text-slate-700 block focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-white/50 border border-slate-200/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white w-64 transition-all shadow-inner"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl py-2 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                {notifications.length > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">Mark all as read</button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500 text-center">No new notifications</p>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer flex justify-between group">
                      <div>
                        <p className="text-sm text-slate-800">{notif.title || notif.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }} className="text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 hover:bg-slate-50 rounded-lg p-1 pr-2 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              AD
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin User</span>
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl overflow-hidden z-50 transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
              <div className="p-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800">Admin User</p>
                <p className="text-xs text-slate-500">admin@example.com</p>
              </div>
              <div className="p-1">
                <button onClick={() => { setShowProfileMenu(false); navigate('/profile'); }} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center">
                  <User className="w-4 h-4 mr-2" /> Profile
                </button>
                <button onClick={() => { setShowProfileMenu(false); navigate('/settings'); }} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </button>
              </div>
              <div className="p-1 border-t border-slate-100">
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
