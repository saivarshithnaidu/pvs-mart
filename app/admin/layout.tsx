import Link from 'next/link';
import { Headers } from 'next/dist/compiled/@edge-runtime/primitives'; // Internal type fix or just ignore
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Sidebar from './Sidebar'; // Renamed to Sidebar to fix resolution

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Server-side Route Protection
    const session = await getSession();

    if (!session || session.role !== 'OWNER') {
        redirect('/login');
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-800">PVS Mart Admin</h1>
                </div>

                <Sidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    );
}
