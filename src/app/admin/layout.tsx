'use client';
import type { ReactNode } from 'react';
import AdminNav from '@/components/admin-nav';
import MobileAdminNav from '@/components/mobile-admin-nav';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';
    const [isScrolled, setIsScrolled] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (mainRef.current) {
                setIsScrolled(mainRef.current.scrollTop > 20);
            }
        };

        const mainElement = mainRef.current;
        if (mainElement) {
            mainElement.addEventListener('scroll', handleScroll);
            return () => mainElement.removeEventListener('scroll', handleScroll);
        }
    }, []);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen max-h-screen overflow-hidden overscroll-none">
            {/* SVG Filter for Lens Effect */}
            <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
                <filter id="lensFilter" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
                    <feComponentTransfer in="SourceAlpha" result="alpha">
                        <feFuncA type="identity" />
                    </feComponentTransfer>
                    <feGaussianBlur in="alpha" stdDeviation="50" result="blur" />
                    <feDisplacementMap in="SourceGraphic" in2="blur" scale="50" xChannelSelector="A" yChannelSelector="A" />
                </filter>
            </svg>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64">
                <AdminNav />
            </aside>
            
            {/* Mobile Header with Menu - iOS 16+ Liquid Glass */}
            <div className={cn(
                "lg:hidden fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,2.2)]",
                isScrolled 
                    ? "top-3 left-3 right-3" 
                    : "top-0 left-0 right-0"
            )}>
                <div className={cn(
                    "relative overflow-hidden transition-all duration-500",
                    isScrolled 
                        ? "rounded-[3rem] shadow-[0_6px_6px_rgba(0,0,0,0.2),0_0_20px_rgba(0,0,0,0.1)]" 
                        : "rounded-none border-b bg-background"
                )}>
                    {/* Glass Filter Layer - Only when scrolled */}
                    {isScrolled && (
                        <div 
                            className="absolute inset-0 backdrop-blur-[2px]"
                            style={{ 
                                zIndex: 0,
                                filter: 'url(#lensFilter) saturate(120%) brightness(115%)'
                            }}
                        />
                    )}
                    
                    {/* Glass Overlay Layer - Only when scrolled */}
                    {isScrolled && (
                        <div 
                            className="absolute inset-0 bg-white/25 dark:bg-black/25"
                            style={{ zIndex: 1 }}
                        />
                    )}
                    
                    {/* Glass Specular Layer (highlights) - Only when scrolled */}
                    {isScrolled && (
                        <div 
                            className="absolute inset-0 shadow-[inset_1px_1px_0_rgba(255,255,255,0.75),inset_0_0_5px_rgba(255,255,255,0.75)] dark:shadow-[inset_1px_1px_0_rgba(255,255,255,0.3),inset_0_0_5px_rgba(255,255,255,0.3)]"
                            style={{ zIndex: 2 }}
                        />
                    )}
                    
                    {/* Content Layer */}
                    <div 
                        className={cn(
                            "relative flex items-center justify-between transition-all duration-500",
                            isScrolled ? "px-7 py-3" : "px-4 py-4"
                        )}
                        style={{ zIndex: 3 }}
                    >
                        <MobileAdminNav />
                        <Link href="/admin">
                            <h2 className={cn(
                                "font-bold font-space cursor-pointer transition-all duration-300",
                                "text-foreground hover:opacity-80",
                                isScrolled && "drop-shadow-[0_0_3px_rgba(255,255,255,0.25)]",
                                isScrolled ? "text-lg" : "text-xl"
                            )}>CodeReview</h2>
                        </Link>
                        <div className="w-10" /> {/* Spacer for centering */}
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <main ref={mainRef} className="flex-1 overflow-y-auto p-4 lg:p-6 pt-20 lg:pt-6">
                {children}
            </main>
            <Toaster />
        </div>
    );
}
