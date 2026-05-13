import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../lib/api';
import { Search, Edit, UserPlus, Mail, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const customerSchema = z.object({
  username: z.string().optional(),
  full_name: z.string().optional(),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
  is_locked: z.boolean().default(false)
});

export default function Customers() {
  const [allCustomers, setAllCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 5;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      is_locked: false
    }
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      const filtered = (response.data || response).filter(u => u.role_name === 'customer' || u.role_id === 2);
      setAllCustomers(filtered);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      reset({ 
        username: customer.username || '',
        full_name: customer.full_name || '', 
        email: customer.email || '', 
        phone: customer.phone || '',
        password: '', // never show hash
        is_locked: customer.is_locked || false
      });
    } else {
      setEditingCustomer(null);
      reset({ username: '', full_name: '', email: '', phone: '', password: '', is_locked: false });
    }
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, role_id: 2 }; // Assumes role_id 2 is customer
      if (editingCustomer) {
        if (!payload.password) delete payload.password; // don't update password if empty
        await api.put(`/users/${editingCustomer.id}`, payload);
        toast.success("Customer updated successfully");
      } else {
        // Enforce password for new users
        if (!payload.password) {
          toast.error("Password is required for new customers");
          return;
        }
        await api.post('/users', payload);
        toast.success("Customer created successfully");
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await api.delete(`/users/${id}`);
        toast.success("Customer deleted successfully");
        fetchCustomers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredCustomers = allCustomers.filter(customer => 
    (customer.full_name && customer.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.username && customer.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const currentData = filteredCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Customers Management</h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="py-3 px-6 font-semibold">ID</th>
                <th className="py-3 px-6 font-semibold">Customer</th>
                <th className="py-3 px-6 font-semibold">Contact</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading Skeletons
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 px-6"><div className="h-4 bg-slate-200 rounded animate-pulse w-10"></div></td>
                    <td className="py-3 px-6 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse mr-3"></div>
                      <div className="flex flex-col gap-1">
                        <div className="h-4 bg-slate-200 rounded animate-pulse w-32"></div>
                        <div className="h-3 bg-slate-200 rounded animate-pulse w-24"></div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-40 mb-1"></div>
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-24"></div>
                    </td>
                    <td className="py-3 px-6"><div className="h-5 bg-slate-200 rounded-full animate-pulse w-16"></div></td>
                    <td className="py-3 px-6 text-right flex justify-end gap-2"><div className="h-6 w-6 bg-slate-200 rounded animate-pulse"></div><div className="h-6 w-6 bg-slate-200 rounded animate-pulse"></div></td>
                  </tr>
                ))
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">No customers found.</td>
                </tr>
              ) : (
                currentData.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-6 text-sm text-slate-500 font-medium">#{customer.id}</td>
                    <td className="py-3 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3">
                          {customer.full_name ? customer.full_name.charAt(0).toUpperCase() : (customer.username ? customer.username.charAt(0).toUpperCase() : 'U')}
                        </div>
                        <div>
                          <p className="text-slate-800 font-medium text-sm">{customer.full_name || customer.username || 'Unknown'}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{customer.username ? `@${customer.username}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <p className="text-slate-600 text-sm flex items-center mb-1">
                        <Mail className="w-3 h-3 mr-1.5 text-slate-400" /> {customer.email}
                      </p>
                      <p className="text-slate-500 text-xs">
                        Phone: {customer.phone || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.is_locked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {customer.is_locked ? 'Locked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button onClick={() => handleOpenModal(customer)} className="text-slate-400 hover:text-blue-600 p-1 mr-2"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(customer.id)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
              <h2 className="text-lg font-semibold text-slate-800">{editingCustomer ? 'Edit Customer Account' : 'Add New Customer Account'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                    <input type="text" {...register('username')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" {...register('full_name')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input type="email" {...register('email')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="text" {...register('phone')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password {editingCustomer && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}</label>
                    <input type="password" {...register('password')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                  <div className="pt-6">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" {...register('is_locked')} className="w-5 h-5 text-red-600 border-slate-300 rounded focus:ring-red-500" />
                      <span className="ml-2 text-sm text-slate-700 font-medium">Lock Account</span>
                    </label>
                    <p className="text-xs text-slate-500 mt-1 ml-7">Prevent this user from logging in</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors border border-slate-200">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Customer Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
