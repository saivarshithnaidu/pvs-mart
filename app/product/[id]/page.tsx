'use client';

import { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import { ShoppingCart, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    category: string;
    subcategory?: string;
    price: string;
    image_url?: string;
    description?: string;
    stock: number;
    weight?: string;
    sku?: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); // Next.js 15 async params
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToCart, items, updateQuantity } = useCart();

    // Check if item is in cart to show Quantity Controls
    const cartItem = items.find(item => item.id === product?.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    useEffect(() => {
        // Fetch product list and find by ID (Since we don't have single product public API yet? 
        // Or we can use GET /api/products?active=true and find.
        // Optimization: Create GET /api/products/[id] which we don't strictly have for public.
        // Using List for now.
        fetch('/api/products?active=true')
            .then(res => res.json())
            .then(data => {
                const found = data.find((p: any) => p.id === Number(id));
                setProduct(found || null);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex justify-center items-center h-96 font-bold text-slate-400">Loading...</div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex flex-col justify-center items-center h-96 font-bold text-slate-500">
                <p>Product not found.</p>
                <Link href="/" className="mt-4 text-blue-600 hover:underline">Back to Shop</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Navbar />

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-slate-500">
                <Link href="/" className="hover:text-blue-600">Home</Link> /
                <Link href={`/category/${encodeURIComponent(product.category)}`} className="hover:text-blue-600 mx-1">{product.category}</Link> /
                <span className="text-slate-800 font-semibold mx-1">{product.name}</span>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">

                        {/* Image Section */}
                        <div className="bg-slate-100 flex items-center justify-center p-8 h-[400px] md:h-[500px]">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <div className="text-slate-400 font-bold text-xl flex flex-col items-center">
                                    <span>No Image Available</span>
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="p-8 md:p-12 flex flex-col">
                            <div className="mb-4">
                                <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">{product.subcategory || product.category}</span>
                                <h1 className="text-3xl font-black text-slate-900 mt-1 mb-2 leading-tight">{product.name}</h1>
                                {product.weight && (
                                    <span className="inline-block bg-slate-100 text-slate-700 text-sm font-bold px-2 py-1 rounded">
                                        {product.weight}
                                    </span>
                                )}
                            </div>

                            <p className="text-slate-600 mb-8 leading-relaxed">
                                {product.description || 'Fresh and high quality product from PVS Mart.'}
                            </p>

                            <div className="mt-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Price</p>
                                        <p className="text-4xl font-black text-slate-900">₹{product.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 font-medium">Status</p>
                                        <p className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                {product.stock > 0 ? (
                                    quantityInCart > 0 ? (
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                                                    className="px-4 py-3 bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold"
                                                >-</button>
                                                <span className="px-4 py-3 font-black text-slate-900 min-w-[3rem] text-center">{quantityInCart}</span>
                                                <button
                                                    onClick={() => updateQuantity(product.id, quantityInCart + 1)}
                                                    className="px-4 py-3 bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold"
                                                >+</button>
                                            </div>
                                            <span className="text-sm font-bold text-slate-500">Added to Cart</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="w-full py-4 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform active:scale-95"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            <span>Add to Cart</span>
                                        </button>
                                    )
                                ) : (
                                    <button disabled className="w-full py-4 bg-slate-200 text-slate-500 font-bold rounded-xl cursor-not-allowed">
                                        Currently Unavailable
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
