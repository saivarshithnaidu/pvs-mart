'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash, Minus, Plus, ArrowRight, ShoppingCart } from 'lucide-react';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    const handleClearCart = () => {
        if (window.confirm('Are you sure you want to remove all items from your cart?')) {
            clearCart();
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50/30 p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 max-w-sm w-full">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <ShoppingCart className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Your Cart is Empty</h1>
                    <p className="text-gray-500 mb-6 font-medium">Looks like you haven't added anything yet.</p>
                    <Link
                        href="/"
                        className="block w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg transform active:scale-95"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-50/30 py-8 px-4 sm:px-6 lg:px-8 pb-32">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-black text-gray-900">Shopping Cart ({items.length})</h1>
                    <button
                        onClick={handleClearCart}
                        className="text-sm text-red-600 hover:text-red-800 font-bold flex items-center px-3 py-1 bg-red-50 rounded-full hover:bg-red-100 transition"
                    >
                        <Trash className="w-4 h-4 mr-1" /> Clear
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden mb-6">
                    <ul className="divide-y divide-gray-100">
                        {items.map((item) => (
                            <li key={item.id} className="p-4 sm:p-6 flex items-start sm:items-center justify-between hover:bg-blue-50/30 transition-colors">
                                <div className="flex items-center flex-1">
                                    {/* Image Placeholder */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl flex-shrink-0 overflow-hidden border border-gray-200 shadow-sm">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold bg-gray-50">No Img</div>
                                        )}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">{item.name}</h3>
                                        <p className="text-blue-700 font-bold mt-1">₹{item.price}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 ml-4">
                                    <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="p-2 hover:bg-gray-50 text-gray-800 active:bg-gray-100 transition"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="px-3 font-bold text-sm min-w-[2rem] text-center text-gray-900">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-2 hover:bg-gray-50 text-gray-800 active:bg-gray-100 transition"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sticky Total Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-blue-100 p-4 shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.1)] z-40">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Total Amount</span>
                            <span className="text-3xl font-black text-gray-900">₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <Link
                            href="/checkout"
                            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-full hover:bg-blue-700 transition shadow-lg hover:shadow-blue-300 hover:-translate-y-0.5 transform active:scale-95"
                        >
                            Checkout <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
