import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Redirect if trying to access auth pages while logged in (Basic check)
    // We can't check role here without DB, so we'll just redirect to dashboard or home based on assumption or let page handle it.
    // Actually, cleaner to let the page redirect if logged in.
    // But for now, if token exists, avoid login/register? 
    // Let's rely on the pages to redirect if already authenticated to avoid "flash".
    if (token && (pathname === '/login' || pathname === '/register')) {
        // return NextResponse.redirect(new URL('/', request.url));
        // We'll let the page handle the redirect to correct dashboard to avoid wrong redirects (e.g. admin to home).
    }

    // 2. Protect Admin Routes (Basic Presence Check)
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        // Role check must happen in Admin Layout
    }

    // 3. Protect Cart/Account (Basic Presence Check)
    if (pathname.startsWith('/account') || pathname.startsWith('/cart') || pathname.startsWith('/checkout')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
