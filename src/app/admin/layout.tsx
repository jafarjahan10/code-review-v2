'use client';
import type { ReactNode } from 'react';
import AdminNav from '@/components/admin-nav';
import MobileAdminNav from '@/components/mobile-admin-nav';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64" suppressHydrationWarning>
                <AdminNav />
            </aside>

            {/* Mobile Header with Menu */}
            <div
                className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
                suppressHydrationWarning
            >
                <div className="flex items-center justify-between p-4">
                    <MobileAdminNav />
                    <Link href="/admin">
                        <h2 className="text-xl font-bold font-space cursor-pointer hover:opacity-80 transition-opacity">
                            CodeReview
                        </h2>
                    </Link>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-6 pt-20 lg:pt-6">
                {children}
            </main>
            <Toaster />
        </div>
    );
}
