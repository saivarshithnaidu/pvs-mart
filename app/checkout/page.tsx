'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [address, setAddress] = useState('');
    const [isSuccess, setIsSuccess] = useState(false); // Track success state

    // Prevent redirect if success state is active
    useEffect(() => {
        if (!isSuccess && items.length === 0) {
            router.push('/cart');
        }
    }, [items, router, isSuccess]);

    if (items.length === 0 && !isSuccess) {
        return null;
    }

    const handlePlaceOrder = async () => {
        if (!address) {
            alert('Please enter a delivery address');
            return;
        }

        setLoading(true);

        try {
            // 1. Create Order
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
                    amount: cartTotal,
                    paymentMethod,
                    address
                }),
            });

            if (res.ok) {
                const data = await res.json();

                // 2. Set Success Flag FIRST to prevent redirect loop
                setIsSuccess(true);

                // 3. Clear Cart ONLY after success
                clearCart();

                // 4. Redirect based on Payment Method
                if (paymentMethod === 'UPI') {
                    router.push(`/payment/${data.orderId}`);
                } else {
                    // Cash on Delivery
                    router.push('/checkout/success');
                }
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to place order');
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred during checkout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

                <div className="space-y-6">
                    {/* Order Summary */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Order Summary</h2>
                        <div className="bg-gray-50 p-4 rounded-md">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between py-1 text-sm">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                            <div className="border-t mt-3 pt-2 flex justify-between font-bold text-gray-900">
                                <span>Total</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Details */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Delivery Address</h2>
                        <textarea
                            rows={3}
                            className="w-full border p-2 rounded-md"
                            placeholder="Enter full address..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Payment Method</h2>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="UPI"
                                    checked={paymentMethod === 'UPI'}
                                    onChange={() => setPaymentMethod('UPI')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-medium text-gray-900">UPI / QR Code</span>
                            </label>
                            <label className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="Cash"
                                    checked={paymentMethod === 'Cash'}
                                    onChange={() => setPaymentMethod('Cash')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-medium text-gray-900">Pay on Delivery</span>
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="w-full py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : `Pay ₹${cartTotal.toFixed(2)}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
