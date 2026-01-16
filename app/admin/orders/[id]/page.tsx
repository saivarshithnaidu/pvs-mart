'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface OrderItem {
    id: number;
    product_id: number;
    quantity: number;
    price: string;
    name: string;
    image_url?: string;
    sku?: string;
}

interface Customer {
    name: string;
    email: string;
}

interface OrderDetail {
    id: number;
    status: string;
    total_amount: string;
    created_at: string;
    payment_status: string;
    items: OrderItem[];
    customer?: Customer;
    invoice_number?: string;
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) setOrder(data);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-8 font-bold text-slate-600">Loading details...</div>;
    if (!order) return <div className="p-8 text-red-600 font-bold">Order not found.</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Link href="/admin/orders" className="flex items-center text-slate-600 hover:text-blue-700 font-bold mb-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Orders
            </Link>

            <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black text-slate-900">Order #{order.invoice_number || order.id}</h1>
                        <p className="text-sm text-slate-500 font-medium">Placed on {new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold 
                            ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                            }`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-sm uppercase tracking-wide font-bold text-slate-500 mb-2">Customer Details</h3>
                    <div className="flex flex-col sm:flex-row sm:gap-10">
                        <div>
                            <span className="block text-xs text-slate-400 font-bold">Name</span>
                            <span className="font-bold text-slate-800">{order.customer?.name || 'Guest'}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400 font-bold">Email</span>
                            <span className="font-bold text-slate-800">{order.customer?.email || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400 font-bold">Payment</span>
                            <span className="font-bold text-slate-800">{order.payment_status}</span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="p-6">
                    <h3 className="text-sm uppercase tracking-wide font-bold text-slate-500 mb-4">Ordered Items</h3>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead>
                            <tr>
                                <th className="text-left text-xs font-bold text-slate-500 uppercase pb-2">Product</th>
                                <th className="text-center text-xs font-bold text-slate-500 uppercase pb-2">Qty</th>
                                <th className="text-right text-xs font-bold text-slate-500 uppercase pb-2">Price</th>
                                <th className="text-right text-xs font-bold text-slate-500 uppercase pb-2">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-3 pr-4">
                                        <div className="flex items-center">
                                            {item.image_url && (
                                                <img src={item.image_url} alt="" className="w-10 h-10 object-cover rounded mr-3 bg-slate-100" />
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                                                <p className="text-xs text-slate-500 font-mono">{item.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 text-center text-sm font-bold text-slate-700">{item.quantity}</td>
                                    <td className="py-3 text-right text-sm font-medium text-slate-600">₹{item.price}</td>
                                    <td className="py-3 text-right text-sm font-bold text-slate-900">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="pt-4 text-right text-sm font-bold text-slate-600">Grand Total:</td>
                                <td className="pt-4 text-right text-xl font-black text-slate-900">₹{order.total_amount}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
