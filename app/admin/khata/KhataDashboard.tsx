'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { addKhataEntry } from '@/app/actions/khata';

export default function KhataDashboard({ transactions, balances, customers }: { transactions: any[], balances: any[], customers: any[] }) {
    const [activeTab, setActiveTab] = useState<'transactions' | 'balances'>('balances');
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTransactions = transactions.filter(t =>
        t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer_phone?.includes(searchTerm)
    );

    const filteredBalances = balances.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.phone?.includes(searchTerm)
    );

    async function handleAddEntry(formData: FormData) {
        setIsSubmitting(true);
        await addKhataEntry(formData);
        setIsSubmitting(false);
        setShowModal(false);
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex bg-slate-200 rounded-lg p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('balances')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'balances' ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Customer Balances
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'transactions' ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        All Transactions
                    </button>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search customer..."
                        className="px-3 py-2 border rounded-md"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold"
                    >
                        + Add Entry
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                {activeTab === 'balances' && (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Debit (Given)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Credit (Received)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Pending</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredBalances.map(b => {
                                const net = Number(b.total_debit) - Number(b.total_credit);
                                return (
                                    <tr key={b.id}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{b.name}</div>
                                            <div className="text-gray-500 text-sm">{b.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-red-600 font-medium">₹{Number(b.total_debit).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-green-600 font-medium">₹{Number(b.total_credit).toFixed(2)}</td>
                                        <td className={`px-6 py-4 font-bold ${net > 0 ? 'text-red-700' : 'text-green-700'}`}>
                                            {net > 0 ? `To Collect: ₹${net.toFixed(2)}` : `Advance: ₹${Math.abs(net).toFixed(2)}`}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredBalances.length === 0 && (
                                <tr><td colSpan={4} className="p-6 text-center text-gray-500">No active balances found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === 'transactions' && (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTransactions.map(t => (
                                <tr key={t.id}>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {format(new Date(t.created_at), 'MMM d, yyyy HH:mm')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{t.customer_name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${t.entry_type === 'DEBIT' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {t.entry_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        ₹{Number(t.amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 w-1/3">
                                        {t.note || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Entry Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Add Khata Entry</h3>
                        <form action={handleAddEntry}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Customer</label>
                                    <select name="userId" required className="w-full mt-1 p-2 border rounded">
                                        <option value="">Select Customer</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Entry Type</label>
                                    <select name="type" required className="w-full mt-1 p-2 border rounded">
                                        <option value="DEBIT">DEBIT (Customer took item/unpaid)</option>
                                        <option value="CREDIT">CREDIT (Customer paid money)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Amount (₹)</label>
                                    <input type="number" step="0.01" name="amount" required className="w-full mt-1 p-2 border rounded" min="1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Note</label>
                                    <textarea name="note" className="w-full mt-1 p-2 border rounded" placeholder="Item details or payment reference"></textarea>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">
                                        {isSubmitting ? 'Saving...' : 'Save Entry'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
// End of KhataDashboard component
