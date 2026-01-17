'use client';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="flex justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-600 mb-6">Thank you for shopping with PVS Mart. Your order has been received.</p>
                <div className="space-y-3">
                    <Link href="/account/orders" className="block w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                        View My Orders
                    </Link>
                    <Link href="/" className="block w-full py-2 px-4 border border-gray-300 rounded hover:bg-gray-50 transition">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
