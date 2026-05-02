import { useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AdminLayout from './layouts/AdminLayout';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import Posts from './pages/Posts';
import Settings from './pages/Settings';
import AuthGuard from './components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';

import api from './lib/api';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        window.location.href = '/';
      } else {
        alert('Login failed: ' + response.message);
      }
    } catch (error) {
      alert('Login error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-700">CRM<span className="text-slate-800">System</span></h1>
          <p className="text-slate-500 mt-2">Welcome back! Please login to your account.</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input name="email" type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" defaultValue="admin@example.com" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-10" 
                defaultValue="password123" 
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

const Placeholder = ({ title }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center h-64">
    <h2 className="text-xl text-slate-500 font-medium">{title} Module - Coming Soon</h2>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <AuthGuard allowedRoles={['admin', 'editor', 'sale']}>
            <ErrorBoundary>
              <AdminLayout />
            </ErrorBoundary>
          </AuthGuard>
        }>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="posts" element={<Posts />} />
          <Route path="categories" element={<Categories />} />
          <Route path="customers" element={<AuthGuard allowedRoles={['admin', 'sale']}><Customers /></AuthGuard>} />
          <Route path="reports" element={<AuthGuard allowedRoles={['admin']}><Reports /></AuthGuard>} />
          <Route path="settings" element={<AuthGuard allowedRoles={['admin']}><Settings /></AuthGuard>} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
