import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* About Section */}
                <div>
                    <h3 className="text-white text-lg font-bold mb-4">About PVS Mart</h3>
                    <p className="text-sm leading-relaxed">
                        Your trusted local grocery store. We deliver fresh produce, daily essentials, and quality households items right to your doorstep.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
                        <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                        <li><Link href="/refund" className="hover:text-white transition">Refund Policy</Link></li>
                    </ul>
                </div>

                {/* Contact / Copyright */}
                <div>
                    <h3 className="text-white text-lg font-bold mb-4">Contact</h3>
                    <p className="text-sm">Email: pvsmart@gmail.com</p>
                    <p className="text-sm mt-1">Phone: +91 8185958336</p>

                    <div className="mt-8 text-xs text-slate-500">
                        &copy; 2026 PVS Mart. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
