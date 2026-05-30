import HeroBanner from '../components/HeroBanner';
import ProductSection from '../components/ProductSection';
import PromotionalAds from '../components/PromotionalAds';
import LatestReviews from '../components/LatestReviews';
import api from '../lib/api';

// Fetch products from Backend-core
async function getProducts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/products`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    // The backend uses ResponseHelper which returns { success: true, data: { products: [], total: X, ... } }
    // Or sometimes just data array. We need to handle this.
    if (json.success && json.data) {
      return Array.isArray(json.data.products) ? json.data.products : (Array.isArray(json.data) ? json.data : []);
    }
    return Array.isArray(json) ? json : [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="pb-0">
      <HeroBanner />
      <PromotionalAds />
      <ProductSection products={products} />

      <LatestReviews />
    </div>
  );
}
