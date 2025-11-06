'use client';
import type { ReactNode } from 'react';
import AdminNav from '@/components/admin-nav';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div style={{ display: 'flex', height: '100vh', maxHeight: '100vh' }}>
            <aside style={{ width: 250 }}>
                <AdminNav />
            </aside>
            <main style={{ flex: 1, padding: 24 }}>{children}</main>
        </div>
    );
}
