'use client';

import Link from 'next/link';
import { ShoppingCart, Search, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [searchTerm, setSearchTerm] = useState('');
    const { cartCount } = useCart();
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/?search=${encodeURIComponent(searchTerm)}`); // Simple search redirect for now
        }
    };

    const CATEGORIES = [
        { name: 'Groceries', slug: 'Groceries' },
        { name: 'Beverages', slug: 'Beverages' },
        { name: 'Rice & Grains', slug: 'Rice & Grains' },
        { name: 'Dairy', slug: 'Dairy Products' },
    ];

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            {/* Top Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <span className="text-2xl font-black text-blue-700 tracking-tight">PVS Mart</span>
                </Link>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8 relative">
                    <input
                        type="text"
                        placeholder="Search daily essentials, rice, milk..."
                        className="w-full pl-10 pr-4 py-2 bg-blue-50 border border-blue-100 rounded-full focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 placeholder-gray-400 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                </form>

                {/* Icons */}
                <div className="flex items-center space-x-6">
                    <Link href="/account/orders" className="text-gray-700 hover:text-blue-700 flex flex-col items-center group">
                        <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold hidden sm:block mt-0.5">Orders</span>
                    </Link>
                    <Link href="/cart" className="relative text-gray-700 hover:text-blue-700 flex flex-col items-center group">
                        <div className="relative">
                            <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold hidden sm:block mt-0.5">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Category Bar */}
            <div className="bg-blue-600 text-white overflow-x-auto shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 py-3 text-sm font-bold whitespace-nowrap">
                        {CATEGORIES.map(cat => (
                            <Link
                                key={cat.slug}
                                href={`/category/${encodeURIComponent(cat.slug)}`}
                                className="hover:text-blue-300 transition-colors uppercase tracking-wide"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}
