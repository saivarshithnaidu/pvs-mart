'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { verifyPayment } from '@/app/actions/admin';

interface Order {
    id: number;
    user_id: number;
    total_amount: string;
    status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
    user_name?: string; // If we join
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (Array.isArray(data)) setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId: number, newStatus: string) => {
        if (!confirm(`Update status to ${newStatus}?`)) return;

        try {
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });
            if (res.ok) {
                fetchOrders();
                if (newStatus === 'Ready') {
                    // In a real app, this would trigger notification logic (server-side usually)
                    // alert('Customer would be notified now.');
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
                <button onClick={fetchOrders} className="flex items-center text-blue-600 hover:text-blue-800">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No orders found.</td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">User #{order.user_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{order.total_amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{order.payment_status}</div>
                                            <div className="text-xs text-gray-400">{order.payment_method}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900 font-bold underline">View</Link>

                                            {/* Payment Verification for UPI & CASH */}
                                            {(order.payment_method === 'UPI' || order.payment_method === 'CASH') && order.payment_status === 'PENDING' && (
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Confirm payment received in bank?')) return;
                                                        await verifyPayment(order.id);
                                                        fetchOrders();
                                                    }}
                                                    className="text-purple-600 hover:text-purple-900 font-bold border border-purple-200 px-2 py-1 rounded"
                                                >
                                                    Verify Pay
                                                </button>
                                            )}

                                            {order.status === 'Pending' && (
                                                <button onClick={() => updateStatus(order.id, 'Preparing')} className="text-blue-600 hover:text-blue-900">Prepare</button>
                                            )}
                                            {order.status === 'Preparing' && (
                                                <button onClick={() => updateStatus(order.id, 'Ready')} className="text-green-600 hover:text-green-900">Mark Ready</button>
                                            )}
                                            {order.status === 'Ready' && (
                                                <button onClick={() => updateStatus(order.id, 'Completed')} className="text-gray-600 hover:text-gray-900">Complete</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
