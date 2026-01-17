'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSearchParams } from 'next/navigation';
import RecentViewsClient from '@/components/RecentViewsClient';

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image_url?: string;
  weight?: string;
}

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    fetchProducts(searchQuery || '');
  }, [searchQuery]);

  const fetchProducts = async (query = '') => {
    setLoading(true);
    let url = '/api/products?active=true';
    if (query) {
      url = `/api/search?q=${encodeURIComponent(query)}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const CATEGORY_CARDS = [
    { name: 'Groceries', slug: 'Groceries', img: '/categories/grocery.png', desc: 'Dals, Spices, Oils & more' },
    { name: 'Rice & Grains', slug: 'Rice & Grains', img: '/categories/rice.png', desc: 'Basmati, Wheat, Sona Masuri' },
    { name: 'Beverages', slug: 'Beverages', img: '/categories/beverages.png', desc: 'Soft Drinks, Juices & Water' },
    { name: 'Dairy & Milk', slug: 'Dairy Products', img: '/categories/dairy.png', desc: 'Fresh Milk, Curd, Butter' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {!searchQuery && (
        <>
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Your Daily Needs, Delivered.</h2>
              <p className="text-lg md:text-2xl opacity-90 font-medium max-w-2xl mx-auto">Shop fresh groceries, beverages, and household staples at the best prices.</p>
            </div>
          </div>

          {/* Shop by Category */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Shop by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {CATEGORY_CARDS.map((cat) => (
                <Link key={cat.slug} href={`/category/${encodeURIComponent(cat.slug)}`} className="group block">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 h-full flex flex-col">
                    <div className="h-40 bg-slate-100 relative overflow-hidden">
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-5 flex-grow">
                      <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-700 transition-colors">{cat.name}</h4>
                      <p className="text-sm text-slate-500 mt-2 font-medium">{cat.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Product Feed (Featured or Search) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-2xl font-black text-slate-900 mb-6">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Products'}
        </h3>

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-bold">Loading products...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-500">
                No products found.
              </div>
            ) : (
              products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group h-full">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-lg transition-all duration-300 h-full relative overflow-hidden group-hover:border-blue-200">

                    {/* Stock Badge */}
                    <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-full z-10">
                      In Stock
                    </div>

                    <div className="relative h-48 bg-slate-50 overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-300">
                          <span className="text-xs font-bold">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1 truncate">{product.category}</p>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors" title={product.name}>{product.name}</h4>

                      {product.weight && (
                        <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded mr-auto mb-3">
                          {product.weight}
                        </span>
                      )}

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 font-medium line-through">₹{(Number(product.price) * 1.2).toFixed(0)}</span>
                          <span className="text-xl font-black text-slate-900">₹{product.price}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault(); // Prevent navigation when clicking Add
                            addToCart(product);
                          }}
                          className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-700 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Recently Viewed (Home) */}
        {!searchQuery && <RecentViewsClient />}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-slate-500 font-bold">Loading...</div></div>}>
      <HomeContent />
    </Suspense>
  );
}
