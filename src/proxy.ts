import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function proxy(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const isPublicRoute = pathname === '/login' || pathname === '/admin/login';
    const isApiAuthRoute = pathname.startsWith('/api/auth');

    // Allow API auth routes and public routes
    if (isApiAuthRoute || isPublicRoute) {
        return NextResponse.next();
    }

    // Check if accessing admin routes
    const isAdminRoute = pathname.startsWith('/admin');

    if (isAdminRoute) {
        // Admin routes require authentication and ADMIN user type
        if (!session || session.user.userType !== 'ADMIN') {
            const url = new URL('/admin/login', request.url);
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }
    } else {
        // Candidate routes (root path) require authentication and CANDIDATE user type
        if (pathname === '/' || pathname.startsWith('/submit')) {
            if (!session) {
                const url = new URL('/login', request.url);
                url.searchParams.set('callbackUrl', pathname);
                return NextResponse.redirect(url);
            }

            // Redirect admins trying to access candidate routes to admin dashboard
            if (session.user.userType === 'ADMIN') {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
