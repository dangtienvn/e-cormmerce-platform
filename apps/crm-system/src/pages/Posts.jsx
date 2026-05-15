import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { SkeletonTable } from '../components/Skeleton';

export default function Posts() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 5;

  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { status: 'DRAFT' }
  });

  const { data: allPosts = [], isLoading: loading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await api.get('/posts');
      return response.data || response;
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editingPost ? api.put(`/posts/${editingPost.id}`, data) : api.post('/posts', data),
    onSuccess: () => {
      toast.success(`Post ${editingPost ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries(['posts']);
      setShowModal(false);
    },
    onError: (error) => {
      toast.error("Failed to save post");
      console.error(error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries(['posts']);
    },
    onError: (error) => {
      toast.error("Failed to delete post");
      console.error(error);
    }
  });

  const handleOpenModal = (post = null) => {
    setEditingPost(post);
    if (post) {
      reset({ title: post.title, slug: post.slug, content: post.content, status: post.status });
    } else {
      reset({ title: '', slug: '', content: '', status: 'DRAFT' });
    }
    setShowModal(true);
  };

  const filteredPosts = allPosts.filter(p => p.title?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const currentData = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Blog Posts</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Write Post
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search posts..." 
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
                <th className="py-3 px-6 font-semibold">ID</th>
                <th className="py-3 px-6 font-semibold">Title</th>
                <th className="py-3 px-6 font-semibold">Slug</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-0"><SkeletonTable rows={5} columns={5} /></td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-500">No posts found.</td></tr>
              ) : (
                currentData.map((post) => (
                  <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-6 text-sm text-slate-500 font-medium">#{post.id}</td>
                    <td className="py-3 px-6 font-medium text-slate-800">{post.title}</td>
                    <td className="py-3 px-6 text-slate-500 text-sm">{post.slug}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {post.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(post)} className="text-slate-400 hover:text-blue-600 p-1"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => { if(window.confirm('Delete this post?')) deleteMutation.mutate(post.id); }} className="text-slate-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">{editingPost ? 'Edit Post' : 'New Post'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input type="text" {...register('title', {required: true})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                  <input type="text" {...register('slug', {required: true})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content (Markdown/HTML)</label>
                  <textarea rows="6" {...register('content')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select {...register('status')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-slate-600 border border-slate-200 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting || saveMutation.isPending} className="px-5 py-2 bg-blue-600 text-white rounded-lg">{saveMutation.isPending ? 'Saving...' : 'Save Post'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
