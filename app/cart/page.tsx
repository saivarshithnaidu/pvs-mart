'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash, Minus, Plus, ArrowRight } from 'lucide-react';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-8">Looks like you haven't added anything yet.</p>
                <Link
                    href="/"
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {items.map((item) => (
                            <li key={item.id} className="p-6 flex items-center justify-between">
                                <div className="flex items-center">
                                    {/* Image Placeholder */}
                                    <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                        <p className="text-blue-600 font-bold">₹{item.price}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center border rounded-md">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="p-2 hover:bg-gray-100 text-gray-600"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="px-4 font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-2 hover:bg-gray-100 text-gray-600"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash className="w-5 h-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center bg-gray-50">
                        <button
                            onClick={clearCart}
                            className="text-sm text-gray-500 hover:text-gray-700 underline mb-4 sm:mb-0"
                        >
                            Clear Cart
                        </button>

                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="text-xl font-bold text-gray-900">
                                Total: <span className="text-blue-600">₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <Link
                                href="/checkout"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Proceed to Checkout
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
