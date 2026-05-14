import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Search, Edit, Trash2 } from 'lucide-react';
import Pagination from '../components/Pagination';
import { SkeletonTable } from '../components/Skeleton';
import toast from 'react-hot-toast';

export default function Orders() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 5;

  const { data: allOrders = [], isLoading: loading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/orders');
      return response.data || response;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/orders/${id}`),
    onSuccess: () => {
      toast.success("Order deleted successfully");
      queryClient.invalidateQueries(['orders']);
    },
    onError: (error) => {
      toast.error("Failed to delete order");
      console.error(error);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/orders/${id}`, { status }),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries(['orders']);
    },
    onError: (error) => {
      toast.error("Failed to update status");
      console.error(error);
    }
  });

  const filteredOrders = allOrders.filter(order => 
    order.id.toString().includes(searchTerm) ||
    (order.users && order.users.full_name && order.users.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const currentData = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Create Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="py-3 px-6 font-semibold">Order ID</th>
                <th className="py-3 px-6 font-semibold">Customer</th>
                <th className="py-3 px-6 font-semibold">Total Amount</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold">Date</th>
                <th className="py-3 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-0">
                    <SkeletonTable rows={5} columns={6} />
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No orders found.</td>
                </tr>
              ) : (
                currentData.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-6 text-sm text-slate-500 font-medium">#{order.id}</td>
                    <td className="py-3 px-6 text-sm text-slate-800">
                      {order.users ? order.users.full_name : 'Unknown Customer'}
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-800 font-medium">
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-6">
                      <select
                        className={`px-2 py-1 rounded border text-xs font-medium capitalize ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                          order.status === 'paid' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          order.status === 'revoked' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        value={order.status || 'pending'}
                        onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="revoked">Revoked</option>
                      </select>
                    </td>
                    <td className="py-3 px-6 text-slate-500 text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button onClick={() => {
                        if (window.confirm("Are you sure you want to delete this order?")) {
                          deleteMutation.mutate(order.id);
                        }
                      }} className="text-slate-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </div>
    </div>
  );
}
