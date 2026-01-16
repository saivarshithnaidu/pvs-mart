'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
    totalSalesToday: number;
    totalOrders: number;
    totalProducts: number;
    lowStock: number;
    chartData: { date: string, sales: number }[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setStats(data);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 font-bold text-slate-900">Loading Dashboard...</div>;
    if (!stats) return <div className="p-8 text-red-700 font-bold">Failed to load stats.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-900">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-white rounded-lg shadow-md border border-slate-200 border-l-8 border-l-blue-600">
                    <h3 className="text-sm font-bold text-slate-600 uppercase">Total Sales (Today)</h3>
                    <p className="mt-2 text-3xl font-black text-slate-900">₹{stats.totalSalesToday.toFixed(2)}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md border border-slate-200 border-l-8 border-l-green-600">
                    <h3 className="text-sm font-bold text-slate-600 uppercase">Total Orders</h3>
                    <p className="mt-2 text-3xl font-black text-slate-900">{stats.totalOrders}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md border border-slate-200 border-l-8 border-l-purple-600">
                    <h3 className="text-sm font-bold text-slate-600 uppercase">Products</h3>
                    <p className="mt-2 text-3xl font-black text-slate-900">{stats.totalProducts}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md border border-slate-200 border-l-8 border-l-red-600">
                    <h3 className="text-sm font-bold text-slate-600 uppercase">Low Stock Alerts</h3>
                    <p className="mt-2 text-3xl font-black text-red-700">{stats.lowStock}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Sales Chart */}
                <div className="p-6 bg-white rounded-lg shadow-md border border-slate-200">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Weekly Sales Performance</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#1e293b" fontWeight="bold" />
                                <YAxis stroke="#1e293b" fontWeight="bold" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
