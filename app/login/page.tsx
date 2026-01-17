'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
        });

        const data = await res.json();

        if (res.ok) {
            if (data.role === 'OWNER') {
                router.push('/admin/dashboard');
            } else {
                router.push('/');
            }
            router.refresh();
        } else {
            setError(data.error || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-slate-200">
                <h1 className="text-2xl font-black text-center text-slate-900">Sign in to PVS Mart</h1>
                {error && <p className="text-red-600 font-bold text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Phone Number or Email</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                            required
                            placeholder="Enter phone or email"
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
                        Sign In
                    </button>
                </form>
                <p className="text-sm text-center text-slate-700 font-medium">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-blue-700 font-bold hover:underline">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
