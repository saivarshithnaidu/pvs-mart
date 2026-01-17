'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateUPILinks, createPaymentRecord } from '@/app/actions/payment';

function UPIPaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount') ? parseFloat(searchParams.get('amount')!) : 0;

    const [qrCode, setQrCode] = useState<string | null>(null);
    const [links, setLinks] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId && amount > 0) {
            // Generate Links & QR
            generateUPILinks(Number(orderId), amount).then(res => {
                if (res.success) {
                    setQrCode(res.qrCodeDataUrl || null);
                    setLinks(res.links || null);
                }
                setLoading(false);
            });
            // Create Transaction Record (Async, don't block)
            createPaymentRecord(Number(orderId), amount);
        }
    }, [orderId, amount]);

    if (!orderId) return <div className="p-10 text-center">Invalid Order</div>;

    const handleAppClick = (url: string) => {
        window.location.href = url;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">

                <h1 className="text-2xl font-bold text-gray-800 border-b pb-4">Pay via UPI</h1>

                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">Total Payable Amount</p>
                    <div className="text-3xl font-bold text-blue-900">₹{amount.toFixed(2)}</div>
                </div>

                <div className="flex flex-col items-center space-y-2">
                    <p className="text-sm font-semibold text-gray-600">Scan QR Code</p>
                    {loading ? (
                        <div className="animate-spin rounded-full h-48 w-48 border-b-2 border-blue-600"></div>
                    ) : qrCode ? (
                        <div className="bg-white p-2 border-2 border-dashed border-gray-300 rounded-lg">
                            <img src={qrCode} alt="UPI QR Code" className="w-48 h-48" />
                        </div>
                    ) : (
                        <div className="text-red-500">Failed to load QR Code</div>
                    )}
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-600">Or Pay with UPI App</p>

                    <div className="grid grid-cols-2 gap-3">
                        {links?.googlePay && (
                            <button
                                onClick={() => handleAppClick(links.googlePay)}
                                className="flex items-center justify-center py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 shadow-sm"
                            >
                                Google Pay
                            </button>
                        )}
                        {links?.phonePe && (
                            <button
                                onClick={() => handleAppClick(links.phonePe)}
                                className="flex items-center justify-center py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 shadow-sm"
                            >
                                PhonePe
                            </button>
                        )}
                        {links?.paytm && (
                            <button
                                onClick={() => handleAppClick(links.paytm)}
                                className="flex items-center justify-center py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 shadow-sm"
                            >
                                Paytm
                            </button>
                        )}
                        {links?.generic && (
                            <button
                                onClick={() => handleAppClick(links.generic)}
                                className="flex items-center justify-center py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 shadow-sm"
                            >
                                Other / Navi
                            </button>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <p className="text-xs text-slate-500 mb-3">
                        After completing the payment in your UPI app, please confirm below.
                    </p>
                    <button
                        onClick={() => router.push('/checkout/success')}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
                    >
                        I have made the payment
                    </button>
                </div>
            </div>

            <p className="mt-6 text-xs text-gray-400">Secure Payments via UPI • PVS Mart</p>
        </div>
    );
}

export default function UPIPaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UPIPaymentContent />
        </Suspense>
    );
}
