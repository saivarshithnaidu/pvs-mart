import Link from 'next/link';
import { Headers } from 'next/dist/compiled/@edge-runtime/primitives'; // Internal type fix or just ignore
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Sidebar from './Sidebar'; // Renamed to Sidebar to fix resolution
import AdminShell from './AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Server-side Route Protection
    const session = await getSession();

    if (!session || session.role !== 'OWNER') {
        redirect('/login');
    }

    return (
        <AdminShell>
            {children}
        </AdminShell>
    );
}
