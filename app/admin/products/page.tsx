'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

// Types (should eventually be in a shared types file)
interface Product {
    id: number;
    name: string;
    category: string;
    price: string;
    stock: number;
    is_active: boolean;
    sku?: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch products
    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products?admin=true');
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-slate-900">Products</h1>
                <Link
                    href="/admin/products/new"
                    className="flex items-center px-4 py-2 text-white bg-blue-700 rounded-md hover:bg-blue-800 shadow-md font-bold"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Product
                </Link>
            </div>

            {/* Search and Filter */}
            <div className="flex space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 font-medium placeholder-slate-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-800 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-slate-700 font-medium">
                                    No products found. Start by adding one.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700 font-bold font-mono">{product.sku || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{product.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">₹{product.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">{product.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold space-x-2">
                                        <Link href={`/admin/products/${product.id}/edit`} className="text-blue-700 hover:text-blue-900 hover:underline">Edit</Link>
                                        <button className="text-red-600 hover:text-red-900 hover:underline ml-4">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
