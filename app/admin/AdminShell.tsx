'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 relative">
            {/* Mobile Header - Sticky */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b px-4 py-3 flex items-center justify-between z-30 shadow-sm h-16">
                <h1 className="text-xl font-bold text-gray-800">PVS Mart Admin</h1>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    aria-label="Open sidebar"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-xl lg:shadow-sm 
                    transform transition-transform duration-300 ease-in-out 
                    lg:relative lg:translate-x-0 flex flex-col
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="flex items-center justify-between p-6 border-b shrink-0 h-20 lg:h-auto">
                    <h1 className="text-xl font-bold text-gray-800">PVS Mart Admin</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-md"
                        aria-label="Close sidebar"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <Sidebar onItemClick={() => setSidebarOpen(false)} />
            </aside>

            {/* Backdrop Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto w-full pt-16 lg:pt-0">
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
