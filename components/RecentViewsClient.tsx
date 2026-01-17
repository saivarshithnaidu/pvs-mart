'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentViews } from '@/app/actions/history';

interface Product {
    id: number;
    name: string;
    category: string;
    price: string;
    image_url?: string;
    weight?: string;
}

export default function RecentViewsClient({ excludeIds = [] }: { excludeIds?: number[] }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRecentViews(10).then(data => {
            setProducts(data);
            setLoading(false);
        });
    }, []);

    const filtered = products.filter(p => !excludeIds.includes(p.id)).slice(0, 5);

    if (!loading && filtered.length === 0) return null;

    return (
        <section className="mt-12">
            <h3 className="text-xl font-black text-slate-900 mb-4">Recently Viewed</h3>
            {loading ? (
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-48 h-64 bg-slate-100 animate-pulse rounded-lg"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filtered.map((product) => (
                        <Link key={product.id} href={`/product/${product.id}`} className="group">
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow h-full">
                                <div className="relative h-32 bg-slate-100 overflow-hidden rounded-t-lg">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-300">
                                            <span className="text-xs font-bold">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 flex-1 flex flex-col">
                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1 truncate">{product.category}</p>
                                    <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1 line-clamp-2" title={product.name}>{product.name}</h4>
                                    <div className="mt-auto">
                                        <span className="text-lg font-black text-slate-900">₹{product.price}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
