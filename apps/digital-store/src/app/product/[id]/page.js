import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import AddToCartButton from './AddToCartButton';

async function getProduct(id) {
  try {
    const res = await fetch(`http://localhost:5000/api/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    return null;
  }
}

export default async function ProductDetail({ params }) {
  const { id } = await params; // Next.js 15: params is a promise
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <Link href="/" className="text-blue-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-600 flex items-center">
          <ArrowLeft size={16} className="mr-1" /> Home
        </Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-900 font-medium">Product Details</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Product Image Area */}
          <div className="bg-gradient-to-tr from-blue-50 to-indigo-50 p-12 flex items-center justify-center min-h-[400px]">
            {product.product_images && product.product_images.length > 0 ? (
              <img src={`http://localhost:5000${product.product_images[0].image_url}`} alt={product.name} className="max-w-full max-h-full object-contain rounded-xl shadow-lg" />
            ) : (
              <span className="text-8xl">📦</span>
            )}
          </div>

          {/* Product Info Area */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold tracking-wide uppercase">
                Digital Product
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {product.description || 'This is a premium digital product offering exceptional quality and value.'}
            </p>
            
            <div className="text-4xl font-extrabold text-gray-900 mb-8">
              {product.price?.toLocaleString()} ₫
            </div>

            <AddToCartButton product={product} />

            <div className="mt-8 pt-8 border-t border-gray-100 text-sm text-gray-500">
              <p>Instant digital delivery upon purchase.</p>
              <p className="mt-2">Secure payment via standard gateways.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
