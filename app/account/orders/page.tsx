'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface Order {
    id: number;
    total_amount: string;
    status: string;
    created_at: string;
    invoice_number?: string;
}

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOrders(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const router = useRouter(); // Import this

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <Link href="/" className="mr-4 text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition"
                    >
                        Sign Out
                    </button>
                </div>

                {loading ? (
                    <p>Loading orders...</p>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                        <p className="text-gray-500 mb-4">You have no past orders.</p>
                        <Link href="/" className="text-blue-600 font-medium hover:underline">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Invoice: {order.invoice_number || 'N/A'}</p>
                                    <p className="font-bold text-gray-900">Order #{order.id}</p>
                                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full 
                                                ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                            {order.status}
                                        </span>
                                        <p className="text-lg font-bold">₹{order.total_amount}</p>
                                    </div>
                                    <Link href={`/account/orders/${order.id}`} className="text-blue-600 font-bold hover:underline text-sm">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
