'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

interface Bill {
    id: number;
    invoice_number: string;
    customer_name: string;
    total_amount: string;
    payment_method: string;
    created_at: string;
}

export default function BillingHistoryPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/billing/history')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setBills(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/billing" className="text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Billing History</h1>
                </div>
                <Link href="/admin/billing" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    New Bill
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                        ) : bills.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No billing history found.</td></tr>
                        ) : (
                            bills.map((bill) => (
                                <tr key={bill.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 font-mono">
                                        <div className="flex items-center">
                                            <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                            {bill.invoice_number || `ID-${bill.id}`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(bill.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {bill.customer_name || 'Walk-in'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {bill.payment_method}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                        ₹{bill.total_amount}
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
