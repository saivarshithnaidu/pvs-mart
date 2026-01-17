'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Receipt, LogOut, FileText, Users, Book } from 'lucide-react';

interface SidebarProps {
    onItemClick?: () => void;
}

export default function Sidebar({ onItemClick }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
        if (onItemClick) onItemClick();
    };

    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/customers', label: 'Customers', icon: Users },
        { href: '/admin/khata', label: 'Khata Book', icon: Book },
        { href: '/admin/products', label: 'Products', icon: Package },
        { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/admin/billing', label: 'Offline Billing', icon: Receipt },
        { href: '/admin/billing/history', label: 'History', icon: FileText },
    ];

    return (
        <>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onItemClick}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                </button>
            </div>
        </>
    );
}
