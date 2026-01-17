'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { generateUPILinks } from '@/app/actions/payment';
import Link from 'next/link';

function PaymentPageContent() {
    const params = useParams();
    const router = useRouter();
    const orderId = Number(params.orderId);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentData, setPaymentData] = useState<{
        qrCode: string | null;
        links: any;
        amount: number;
    } | null>(null);

    useEffect(() => {
        if (!orderId) return;

        // Fetch Order Details and Generate UPI Links
        // We need the amount to generate the link. 
        // ideally we fetch the order from DB to get the amount securely, but for now we will rely on a separate server action or passing it.
        // Actually, generateUPILinks takes amount. we need to KNOW the amount.
        // Let's create a server action to Get Order details securely.
        // For now, I will assume we fetch it via an API or Server Action. 
        // Let's use a quick fetch to /api/orders/[id] if it existed, or just a new action.

        async function loadPaymentDetails() {
            try {
                // Fetch order details via secure API
                const res = await fetch(`/api/orders/${orderId}`);

                if (!res.ok) {
                    throw new Error('Failed to load order details');
                }

                const orderData = await res.json();

                // Use the fetched amount to generate UPI links
                // Note: We might want to move UPI generation to server entirely if not already
                // For now, we use the client-side helper with the fetched amount
                const upiRes = await generateUPILinks(orderId, Number(orderData.total_amount || orderData.amount));

                if (upiRes.success) {
                    setPaymentData({
                        qrCode: upiRes.qrCodeDataUrl || null,
                        links: upiRes.links,
                        amount: Number(orderData.total_amount || orderData.amount)
                    });
                } else {
                    setError('Failed to generate payment links.');
                }
            } catch (err) {
                console.error(err);
                setError('Error loading order.');
            } finally {
                setLoading(false);
            }
        }

        loadPaymentDetails();
    }, [orderId]);

    const handlePaymentConfirmed = async () => {
        try {
            setLoading(true); // Re-use loading state or add a new one if needed
            const res = await fetch(`/api/orders/${orderId}/payment-submitted`, {
                method: 'POST',
            });

            if (res.ok) {
                router.push('/checkout/success');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update payment status');
            }
        } catch (error) {
            console.error('Payment confirmation error', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Payment Details...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!paymentData) return <div className="min-h-screen flex items-center justify-center">Order not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Complete Payment</h2>
                    <p className="mt-2 text-sm text-gray-600">Order #{orderId}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                    <p className="text-sm text-blue-800 font-medium uppercase tracking-wide">Total Amount</p>
                    <div className="text-4xl font-bold text-blue-900 mt-1">₹{paymentData.amount.toFixed(2)}</div>
                </div>

                <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white p-4 border-2 border-dashed border-gray-300 rounded-xl shadow-sm">
                        {paymentData.qrCode ? (
                            <img src={paymentData.qrCode} alt="UPI QR Code" className="w-56 h-56 object-contain" />
                        ) : (
                            <div className="w-56 h-56 bg-gray-100 flex items-center justify-center text-gray-400">No QR</div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Scan with any UPI App</p>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 bg-white text-sm text-gray-500">Or pay with an app</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <a href={paymentData.links.googlePay} className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Google Pay
                        </a>
                        <a href={paymentData.links.phonePe} className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            PhonePe
                        </a>
                        <a href={paymentData.links.paytm} className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Paytm
                        </a>
                        <a href={paymentData.links.generic} className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Navi / Other
                        </a>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handlePaymentConfirmed}
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'I have made the payment'}
                    </button>
                    <p className="mt-3 text-center text-xs text-gray-400">
                        Clicking this will explicitly notify the admin to verify your payment.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <PaymentPageContent />
        </Suspense>
    );
}
