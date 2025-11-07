'use client';
import type { ReactNode } from 'react';
import AdminNav from '@/components/admin-nav';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className='flex h-screen max-h-screen overflow-hidden overscroll-none'>
            <aside className='w-64'>
                <AdminNav />
            </aside>
            <main className='flex-1 p-6 overflow-y-auto'>{children}</main>
            <Toaster />
        </div>
    );
}
