'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface OrderItem {
    id: number;
    product_id: number;
    quantity: number;
    price: string;
    name: string;
    image_url?: string;
    sku?: string;
}

interface OrderDetail {
    id: number;
    status: string;
    total_amount: string;
    created_at: string;
    payment_status: string;
    items: OrderItem[];
    invoice_number?: string;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) setError(data.error);
                else setOrder(data);
            })
            .catch(() => setError('Failed to load order'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-3xl mx-auto py-12 px-4 text-center font-bold text-slate-500">Loading details...</div>
        </div>
    );

    if (error || !order) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-3xl mx-auto py-12 px-4 text-center text-red-500 font-bold">{error || 'Order not found'}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Link href="/account/orders" className="flex items-center text-slate-600 hover:text-blue-700 font-bold mb-6">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to My Orders
                </Link>

                <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="mb-2 sm:mb-0">
                            <h1 className="text-xl font-black text-slate-900">Order #{order.invoice_number || order.id}</h1>
                            <p className="text-sm text-slate-500 font-medium">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold 
                            ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                            }`}>
                            {order.status}
                        </span>
                    </div>

                    {/* Items */}
                    <div className="p-6">
                        <h3 className="text-sm uppercase tracking-wide font-bold text-slate-500 mb-4">Items in your order</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0">
                                    <div className="flex items-center">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="" className="w-16 h-16 object-cover rounded bg-slate-100 mr-4" />
                                        ) : (
                                            <div className="w-16 h-16 bg-slate-100 rounded mr-4 flex items-center justify-center text-xs font-bold text-slate-400">No Img</div>
                                        )}
                                        <div>
                                            <p className="font-bold text-slate-900">{item.name}</p>
                                            <p className="text-sm text-slate-500">Qty: {item.quantity} x ₹{item.price}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-slate-900">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Total */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-slate-600 font-bold">Total Amount</span>
                        <span className="text-xl font-black text-slate-900">₹{order.total_amount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
