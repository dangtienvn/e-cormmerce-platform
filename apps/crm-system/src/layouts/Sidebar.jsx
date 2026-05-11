import { LayoutDashboard, Users, ShoppingCart, Box, Tag, FileText, Settings, Ticket, LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Orders', icon: ShoppingCart, path: '/orders' },
  { name: 'Products', icon: Box, path: '/products' },
  { name: 'Posts', icon: FileText, path: '/posts' },
  { name: 'Categories', icon: Tag, path: '/categories' },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Reports', icon: FileText, path: '/reports' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`glass border-r border-white/20 h-screen fixed md:sticky top-0 z-30 flex flex-col transition-all duration-300 ${isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}`}>
        <div className={`h-16 flex items-center ${isOpen ? 'justify-between px-6' : 'justify-center'} border-b border-slate-200/50`}>
          {isOpen ? (
            <>
              <h1 className="text-xl font-bold text-blue-700">CRM<span className="text-slate-800">System</span></h1>
              <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <h1 className="text-xl font-bold text-blue-700">C<span className="text-slate-800">S</span></h1>
          )}
        </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={!isOpen ? item.name : ''}
                className={({ isActive }) =>
                  `flex items-center ${isOpen ? 'px-3 py-2.5' : 'justify-center py-3'} text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-primary/90 to-primary text-white shadow-md shadow-primary/20 scale-[1.02]' 
                      : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className={`w-5 h-5 ${isOpen ? 'mr-3' : ''}`} />
                {isOpen && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200/50">
        <button 
          title={!isOpen ? 'Logout' : ''}
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className={`flex items-center ${isOpen ? 'w-full px-3 py-2.5' : 'justify-center py-3 w-full'} text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors`}
        >
          <LogOut className={`w-5 h-5 ${isOpen ? 'mr-3' : ''}`} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
