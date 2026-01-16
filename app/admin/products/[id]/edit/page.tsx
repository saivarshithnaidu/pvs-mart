'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams(); // { id: string }
    const productId = params?.id;

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
        image_url: '',
        sku: '' // Read-only mostly
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            // We can reuse the main items API if we filter client side or add specific endpoint.
            // For now, let's fetch list and find (simple) or ideally GET /api/products/[id]
            // IMPORTANT: We need a GET by ID. 
            // Let's rely on the list API for now to save creating a new route file if possible, 
            // OR create the internal helper. 
            // ACTUALLY, usually /api/products returns all. Let's just fetch all and find.
            const res = await fetch('/api/products?active=all');
            const data = await res.json();
            if (Array.isArray(data)) {
                const product = data.find(p => p.id === Number(productId));
                if (product) {
                    setFormData({
                        name: product.name,
                        category: product.category,
                        price: product.price,
                        stock: product.stock,
                        description: product.description || '',
                        image_url: product.image_url || '',
                        sku: product.sku || ''
                    });
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        let file = null;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                file = items[i].getAsFile();
                break;
            }
        }

        if (file) {
            e.preventDefault();
            const data = new FormData();
            data.append('file', file);

            try {
                const res = await fetch('/api/upload', { method: 'POST', body: data });
                const json = await res.json();
                if (json.url) {
                    setFormData(prev => ({ ...prev, image_url: json.url }));
                }
            } catch (err) {
                console.error('Paste upload failed', err);
                alert('Failed to upload pasted image');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Since we don't have a specific PATCH /api/products/[id] yet, we can use the main route with method PUT if we implemented it?
        // Wait, looking at previous logs, we only implemented GET and POST on /api/products.
        // We need to implement PUT/PATCH on /api/products or /api/products/[id].

        // Let's IMPLEMENT PUT in /api/products/route.ts first (or assume it handles it).
        // I will add the PUT handler in the next step.

        const res = await fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, id: productId }),
        });

        if (res.ok) {
            router.push('/admin/products');
            router.refresh();
        } else {
            alert('Failed to update product');
        }
    };

    if (loading) return <div className="p-10 font-bold text-blue-900">Loading Product...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 text-slate-900" onPaste={handlePaste}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/products" className="text-slate-600 hover:text-slate-900">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-900">
                        Edit Product: {formData.sku}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Product Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:ring-0 text-slate-900 font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Category</label>
                        <input
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:ring-0 text-slate-900 font-medium"
                        />
                        {/* Could be a select, but text input is flexible for now */}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:ring-0 text-slate-900 font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Stock Quantity</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:ring-0 text-slate-900 font-medium"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:ring-0 text-slate-900 font-medium"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Product Image</label>
                    <div className="flex items-start space-x-4 mb-4">
                        {formData.image_url && (
                            <img src={formData.image_url} alt="Preview" className="w-20 h-20 object-cover rounded border border-slate-200" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const data = new FormData();
                                data.append('file', file);

                                try {
                                    const res = await fetch('/api/upload', { method: 'POST', body: data });
                                    const json = await res.json();
                                    if (json.url) {
                                        setFormData(prev => ({ ...prev, image_url: json.url }));
                                    }
                                } catch (err) {
                                    console.error('Upload failed', err);
                                }
                            }}
                            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    <label className="block text-xs font-bold text-slate-500 mb-1">Or Image URL</label>
                    <input
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:ring-0 text-slate-900 font-medium"
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="flex items-center px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-md"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
