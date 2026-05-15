import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../lib/api';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().optional(),
  price: z.preprocess((a) => Number(a), z.number().min(0, "Price must be >= 0")),
  cost_price: z.preprocess((a) => Number(a) || 0, z.number().min(0).optional()),
  original_cost: z.preprocess((a) => Number(a) || 0, z.number().min(0).optional()),
  category_id: z.string().optional(),
  type: z.enum(['ebook', 'software', 'course', 'service', 'other']).default('ebook'),
  download_url: z.string().url("Invalid URL").optional().or(z.literal('')),
  version: z.string().optional(),
  file_size: z.preprocess((a) => Number(a) || 0, z.number().min(0).optional()),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  is_active: z.boolean().default(true),
  description: z.string().optional()
});

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 5;
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: 'ebook',
      status: 'draft',
      is_active: true,
      version: '1.0.0'
    }
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/products');
      setProducts(data.data || data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.get('/categories');
      setCategories(data.data || data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      reset({
        name: product.name || '', 
        sku: product.sku || '',
        price: product.price || 0, 
        cost_price: product.cost_price || 0,
        original_cost: product.original_cost || 0,
        category_id: product.category_id ? String(product.category_id) : '',
        type: product.type || 'ebook',
        download_url: product.download_url || '',
        version: product.version || '1.0.0',
        file_size: product.file_size || 0,
        status: product.status || 'draft',
        is_active: product.is_active !== undefined ? product.is_active : true,
        description: product.description || '' 
      });
    } else {
      setEditingProduct(null);
      reset({ 
        name: '', sku: '', price: 0, cost_price: 0, original_cost: 0,
        category_id: categories.length > 0 ? String(categories[0].id) : '', 
        type: 'ebook', download_url: '', version: '1.0.0', 
        file_size: 0, status: 'draft', is_active: true, description: '' 
      });
    }
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        category_id: data.category_id ? Number(data.category_id) : null
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success("Product updated successfully");
      } else {
        await api.post('/products', payload);
        toast.success("Product created successfully");
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      // api interceptor already shows toast.error
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  // Filter & Pagination
  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentData = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Products Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="py-3 px-6 font-semibold">SKU / ID</th>
                <th className="py-3 px-6 font-semibold">Product Name</th>
                <th className="py-3 px-6 font-semibold">Category</th>
                <th className="py-3 px-6 font-semibold">Price</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading Skeletons
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 px-6"><div className="h-4 bg-slate-200 rounded animate-pulse w-16"></div></td>
                    <td className="py-3 px-6"><div className="h-4 bg-slate-200 rounded animate-pulse w-48"></div></td>
                    <td className="py-3 px-6"><div className="h-4 bg-slate-200 rounded animate-pulse w-24"></div></td>
                    <td className="py-3 px-6"><div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div></td>
                    <td className="py-3 px-6"><div className="h-5 bg-slate-200 rounded-full animate-pulse w-16"></div></td>
                    <td className="py-3 px-6 text-right flex justify-end gap-2"><div className="h-6 w-6 bg-slate-200 rounded animate-pulse"></div><div className="h-6 w-6 bg-slate-200 rounded animate-pulse"></div></td>
                  </tr>
                ))
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No products found.</td>
                </tr>
              ) : (
                currentData.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-6 text-sm text-slate-500 font-medium">{product.sku || `#${product.id}`}</td>
                    <td className="py-3 px-6 font-medium text-slate-800">{product.name}</td>
                    <td className="py-3 px-6 text-sm text-slate-500">{getCategoryName(product.category_id)}</td>
                    <td className="py-3 px-6 text-slate-600">{parseFloat(product.price || 0).toLocaleString()} ₫</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button onClick={() => handleOpenModal(product)} className="text-slate-400 hover:text-blue-600 p-1 mr-2"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product.id)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </div>

      {/* Full Fields Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
              <h2 className="text-lg font-semibold text-slate-800">{editingProduct ? 'Edit Product details' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                    <input type="text" {...register('name')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                    <input type="text" {...register('sku')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price <span className="text-red-500">*</span></label>
                      <input type="number" min="0" {...register('price')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price</label>
                      <input type="number" min="0" {...register('cost_price')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select {...register('category_id')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">-- Select Category --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Type</label>
                    <select {...register('type')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="ebook">eBook</option>
                      <option value="software">Software</option>
                      <option value="course">Course</option>
                      <option value="service">Service</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Download URL</label>
                    <input type="text" {...register('download_url')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
                    {errors.download_url && <p className="text-red-500 text-xs mt-1">{errors.download_url.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Version</label>
                      <input type="text" {...register('version')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">File Size (bytes)</label>
                      <input type="number" min="0" {...register('file_size')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select {...register('status')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" {...register('is_active')} className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-slate-700 font-medium">Is Active</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea rows="4" {...register('description')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors border border-slate-200">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center">
                  {isSubmitting ? 'Saving...' : 'Save Product Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
