'use client';
import { cn } from '@/lib/utils';
import {
    Briefcase,
    Building2,
    Contrast,
    FileCheck,
    FileCode,
    Layers,
    LayoutDashboard,
    LogOut,
    LucideIcon,
    Settings,
    UserCircle,
    Users,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from './ui/accordion';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { signOutFn } from '@/lib/signOut';

interface NavLink {
    href: string;
    label: string;
    icon: LucideIcon;
}

const mainNavLinks: NavLink[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/problems', label: 'Problems', icon: FileCode },
    { href: '/admin/candidates', label: 'Candidates', icon: Users },
    { href: '/admin/submissions', label: 'Submissions', icon: FileCheck },
];

const adminManagementLinks: NavLink[] = [
    {
        href: '/admin/interview-panel',
        label: 'Interview Panel',
        icon: UserCircle,
    },
    { href: '/admin/stacks', label: 'Stacks', icon: Layers },
    { href: '/admin/positions', label: 'Positions', icon: Briefcase },
    { href: '/admin/departments', label: 'Departments', icon: Building2 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminNav() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    const isActive = (path: string) => {
        // Exact match for admin dashboard
        if (path === '/admin') {
            return pathname === path;
        }
        // For other routes, check if pathname starts with the path
        return pathname.startsWith(path);
    };

    // Check if any admin management route is active
    const isAdminManagementActive = adminManagementLinks.some(link =>
        pathname.startsWith(link.href)
    );

    return (
        <nav className="flex flex-col h-full border-r bg-background">
            <div className="p-5">
                <h2 className="text-2xl font-bold font-space text-center">
                    CodeReview
                </h2>
            </div>

            <Separator />

            <div className="flex-1 overflow-y-auto p-3">
                <ul className="space-y-2">
                    {mainNavLinks.map(link => {
                        const Icon = link.icon;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                                        isActive(link.href)
                                            ? 'bg-primary text-accent'
                                            : 'text-foreground hover:bg-primary/30 hover:text-accent-foreground'
                                    )}
                                >
                                    <Icon size={18} />
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}

                    <li className="">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                            defaultValue={
                                isAdminManagementActive
                                    ? 'admin-management'
                                    : undefined
                            }
                        >
                            <AccordionItem
                                value="admin-management"
                                className="border-none"
                            >
                                <AccordionTrigger className="flex  items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium hover:no-underline hover:bg-primary/30 text-foreground mb-2 hover:text-accent-foreground">
                                    <Settings size={18} />
                                    <span className="flex-1">
                                        Admin Management
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-1">
                                    <ul className="space-y-2">
                                        {adminManagementLinks.map(link => {
                                            const Icon = link.icon;
                                            return (
                                                <li key={link.href}>
                                                    <Link
                                                        href={link.href}
                                                        className={cn(
                                                            'flex items-center gap-3 px-3 py-2 ml-8 rounded-md text-sm transition-colors',
                                                            isActive(link.href)
                                                                ? 'bg-primary text-accent font-medium'
                                                                : 'text-foreground hover:bg-primary/30 hover:text-accent-foreground'
                                                        )}
                                                    >
                                                        <Icon size={16} />
                                                        {link.label}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </li>
                </ul>
            </div>

            <Separator />

            <div className="p-3 space-y-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-3"
                    onClick={() =>
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                    }
                    suppressHydrationWarning
                >
                    <span
                        className="flex items-center gap-3"
                        suppressHydrationWarning
                    >
                        {theme === 'dark' ? (
                            <>
                                <Contrast size={16} />
                                Light Mode
                            </>
                        ) : (
                            <>
                                <Contrast size={16} />
                                Dark Mode
                            </>
                        )}
                    </span>
                </Button>

                <Separator />

                <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3"
                    onClick={() => signOutFn()}
                >
                    <LogOut size={16} />
                    Sign Out
                </Button>
            </div>
        </nav>
    );
}
