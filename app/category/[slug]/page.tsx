'use client';

import { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Product {
    id: number;
    name: string;
    category: string;
    subcategory?: string;
    price: string;
    image_url?: string;
    weight?: string;
}

// Map slugs to DB categories if needed, or just use direct
// Since we used exact names in links, we can decode URI component
// e.g. "Rice & Grains" -> "Rice & Grains"

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const categoryName = decodeURIComponent(slug);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [selectedSub, setSelectedSub] = useState<string>('');
    const [sort, setSort] = useState<string>('');
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
    }, [categoryName, selectedSub, sort]);

    const fetchProducts = async () => {
        setLoading(true);
        let url = `/api/products?active=true&category=${encodeURIComponent(categoryName)}`;

        if (selectedSub) url += `&subcategory=${encodeURIComponent(selectedSub)}`;
        if (sort) url += `&sort=${sort}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);

                // Extract unique subcategories from the FIRST fetch (without filters) 
                // However, if we filter, we might lose them.
                // Better strategy: fetch all for cat once to get subcats, or just deduce from current data if simpler.
                // For now, let's just extract from the data we get, but ideally we want all subcats visible always.
                // We'll rely on the data. If selectedSub is set, we only see that subcat's products.
                // So we should capture subcats from a separate call or just once.
                // Let's doing it lazily: If subcategories state is empty, fill it.
                if (subcategories.length === 0 && data.length > 0) {
                    const subs = Array.from(new Set(data.map((p: any) => p.subcategory).filter(Boolean))) as string[];
                    setSubcategories(subs);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">{categoryName}</h1>
                        <p className="text-slate-500 mt-1">{products.length} Items</p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
                        {/* Subcategory Filter */}
                        {subcategories.length > 0 && (
                            <select
                                className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedSub}
                                onChange={(e) => setSelectedSub(e.target.value)}
                            >
                                <option value="">All Subcategories</option>
                                {subcategories.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        )}

                        {/* Sort */}
                        <select
                            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                        >
                            <option value="">Sort by: Relevance</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 text-slate-500 font-bold">Loading...</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {products.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-slate-500">
                                No products found in this category.
                            </div>
                        ) : (
                            products.map((product) => (
                                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
                                    <div className="relative h-48 bg-slate-100 overflow-hidden rounded-t-lg">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-300">
                                                <span className="text-xs font-bold">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider truncate">{product.subcategory || product.category}</p>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1 line-clamp-2" title={product.name}>{product.name}</h4>

                                        {product.weight && (
                                            <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded mr-auto mb-2">
                                                {product.weight}
                                            </span>
                                        )}

                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-lg font-black text-slate-900">₹{product.price}</span>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded hover:bg-blue-600 hover:text-white transition-colors"
                                            >
                                                ADD
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
