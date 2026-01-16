import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Redirect if trying to access auth pages while logged in
    if (token && (pathname === '/login' || pathname === '/register')) {
        const payload = await verifyToken(token);
        if (payload) {
            if (payload.role === 'OWNER') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            } else {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }
    }

    // 2. Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'OWNER') {
            // If logged in but not owner, redirect to home
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // 3. Protect Customer Account Routes (optional/future)
    if (pathname.startsWith('/account') || pathname.startsWith('/checkout')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
