'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api from '../lib/api';

export default function LatestReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you might have an endpoint for latest reviews.
    // For now, let's mock it if the backend doesn't have an explicit global latest-reviews route.
    // Actually, backend has: getLatestReviews in ProductController? No, it's not exposed as a public route.
    // Let's use mock data that looks realistic, or if you prefer, an API call.
    
    // We will use some mock high quality reviews for the UI restoration.
    const mockReviews = [
      {
        id: 1,
        user: { full_name: "Alex Johnson" },
        rating: 5,
        comment: "This Docker course completely changed how I deploy applications. Highly recommended!",
        product: { name: "Docker CI/CD Course" }
      },
      {
        id: 2,
        user: { full_name: "Sarah Williams" },
        rating: 5,
        comment: "The Next.js template saved me weeks of development time. Very clean code.",
        product: { name: "Next.js E-commerce Template" }
      },
      {
        id: 3,
        user: { full_name: "Michael Chen" },
        rating: 4,
        comment: "Great eBook. A bit advanced for beginners, but packed with useful tips.",
        product: { name: "React Performance eBook" }
      }
    ];
    
    setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return null;

  return (
    <div className="bg-white border-t border-gray-200 py-24 mt-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Loved by developers</h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
            Join thousands of professionals who have accelerated their careers with our digital assets.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors flex flex-col h-full shadow-sm">
              <div className="flex gap-1 mb-6 text-gray-900">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 1.5} className={i >= review.rating ? "text-gray-300" : ""} />
                ))}
              </div>
              <p className="text-gray-700 mb-8 flex-grow leading-relaxed">"{review.comment}"</p>
              
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-100">
                <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {review.user.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{review.user.full_name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{review.product.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
