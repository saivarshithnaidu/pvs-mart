'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash, Receipt } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: string; // comes as string from DB numeric
    stock: number;
}

interface BillItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
}

export default function OfflineBillingPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [billItems, setBillItems] = useState<BillItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/products?active=true')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setProducts(data);
            });
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stock > 0
    );

    const addToBill = (product: Product) => {
        setBillItems(prev => {
            const existing = prev.find(i => i.productId === product.id);
            if (existing) {
                return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { productId: product.id, name: product.name, price: parseFloat(product.price), quantity: 1 }];
        });
    };

    const removeFromBill = (productId: number) => {
        setBillItems(prev => prev.filter(i => i.productId !== productId));
    };

    const updateQuantity = (productId: number, delta: number) => {
        setBillItems(prev => prev.map(i => {
            if (i.productId === productId) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const totalAmount = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCreateBill = async () => {
        if (billItems.length === 0) return;
        setLoading(true);
        try {
            const res = await fetch('/api/billing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerName, items: billItems, paymentMethod }),
            });
            if (res.ok) {
                alert('Bill created successfully!');
                setBillItems([]);
                setCustomerName('');
                // Refresh products to show updated stock
                fetch('/api/products?active=true')
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data)) setProducts(data);
                    });
            } else {
                alert('Failed to create bill');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] space-x-6">
            {/* Product Selection */}
            <div className="flex-1 flex flex-col space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm border p-4 grid grid-cols-2 md:grid-cols-3 gap-4 content-start">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="border p-3 rounded-md flex flex-col justify-between hover:border-blue-500 cursor-pointer" onClick={() => addToBill(product)}>
                            <div>
                                <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                                <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                            </div>
                            <p className="text-blue-600 font-bold mt-2">₹{product.price}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bill Summary */}
            <div className="w-96 bg-white rounded-lg shadow-lg border flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold flex items-center">
                        <Receipt className="w-5 h-5 mr-2" />
                        New Bill
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {billItems.length === 0 ? (
                        <p className="text-center text-gray-500 mt-10">No items added</p>
                    ) : (
                        billItems.map(item => (
                            <div key={item.productId} className="flex justify-between items-center">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{item.name}</p>
                                    <p className="text-sm text-gray-500">₹{item.price} x {item.quantity}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 px-2 bg-gray-200 rounded text-sm">-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 px-2 bg-gray-200 rounded text-sm">+</button>
                                    <button onClick={() => removeFromBill(item.productId)} className="text-red-500 ml-2">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Customer Name (Optional)</label>
                        <input
                            type="text"
                            className="w-full mt-1 px-2 py-1 border rounded"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <select
                            className="w-full mt-1 px-2 py-1 border rounded"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                        </select>
                    </div>

                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleCreateBill}
                        disabled={loading || billItems.length === 0}
                        className="w-full py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Generate Bill'}
                    </button>
                </div>
            </div>
        </div>
    );
}
