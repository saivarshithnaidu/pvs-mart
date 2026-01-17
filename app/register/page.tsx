'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic phone validation (India: 10 digits)
        if (!/^\d{10}$/.test(phone)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            router.push('/login');
        } else {
            setError(data.error || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-slate-200">
                <h1 className="text-2xl font-black text-center text-slate-900">Create an Account</h1>
                {error && <p className="text-red-600 font-bold text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Phone Number (+91)</label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 text-sm text-slate-900 bg-slate-200 border border-r-0 border-slate-300 rounded-l-md font-bold">
                                +91
                            </span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="w-full px-3 py-2 border-2 border-slate-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                                placeholder="9876543210"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Email (Optional)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-700 font-bold rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                        Register
                    </button>
                </form>
                <p className="text-sm text-center text-slate-700 font-medium">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-700 font-bold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
