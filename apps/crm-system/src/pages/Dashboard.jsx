import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp, Download, Eye } from 'lucide-react';
import api from '../lib/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/reports');
      setData(response.data || response);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-500 font-medium">Loading Dashboard Data...</div>
      </div>
    );
  }

  const { stats, revenueByDay, orderStatus, recentActivities } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <div className="flex space-x-2">
          <select className="glass border-white/40 text-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
          <button className="bg-gradient-to-r from-primary to-primary-hover hover:scale-105 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center shadow-lg shadow-primary/30">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${parseFloat(stats?.totalRevenue || 0).toLocaleString()}`} 
          icon={<DollarSign className="w-6 h-6 text-blue-600" />} 
          trend="+12.5%" 
          trendUp={true} 
          bg="bg-blue-50" 
        />
        <StatCard 
          title="Total Orders" 
          value={(stats?.totalOrders || 0).toLocaleString()} 
          icon={<ShoppingBag className="w-6 h-6 text-indigo-600" />} 
          trend="+5.2%" 
          trendUp={true} 
          bg="bg-indigo-50" 
        />
        <StatCard 
          title="Total Customers" 
          value={(stats?.totalCustomers || 0).toLocaleString()} 
          icon={<Users className="w-6 h-6 text-purple-600" />} 
          trend="+2.1%" 
          trendUp={true} 
          bg="bg-purple-50" 
        />
        <StatCard 
          title="Avg. Order Value" 
          value={`$${parseFloat(stats?.averageOrderValue || 0).toFixed(2)}`} 
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />} 
          trend="-1.4%" 
          trendUp={false} 
          bg="bg-emerald-50" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Revenue Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByDay || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(val) => `$${val}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Orders by Status</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatus || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Recent Activities</h2>
        <div className="space-y-4">
          {(recentActivities || []).map((activity, i) => (
            <div key={i} className="flex items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 mr-4"></div>
              <div>
                <p className="text-sm font-medium text-slate-800">{activity.description}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {(!recentActivities || recentActivities.length === 0) && (
            <p className="text-sm text-slate-500">No recent activities.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp, bg }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-white/50">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        <div className="flex items-center mt-2">
          <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
          <span className="text-xs text-slate-400 ml-2">vs last month</span>
        </div>
      </div>
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  );
}
