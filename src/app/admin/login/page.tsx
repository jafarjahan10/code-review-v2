'use client';
import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/admin';
    const { data: session, status } = useSession();

    const [error, setError] = useState('');

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Redirect if already logged in and is an admin
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            if (session.user.userType === 'ADMIN') {
                router.push(callbackUrl);
            } else if (session.user.userType === 'CANDIDATE') {
                router.push('/');
            }
        }
    }, [status, session, router, callbackUrl]);

    const onSubmit = async (data: LoginFormValues) => {
        setError('');

        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else {
                // Wait a moment for session to update, then check user type
                setTimeout(async () => {
                    const response = await fetch('/api/auth/session');
                    const sessionData = await response.json();

                    if (sessionData?.user?.userType === 'CANDIDATE') {
                        // Candidate logged in on admin page - redirect to candidate home
                        router.push('/');
                    } else if (sessionData?.user?.userType === 'ADMIN') {
                        // Admin user - proceed to admin area
                        router.push(callbackUrl);
                    }
                    router.refresh();
                }, 100);
            }
        } catch {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                minHeight: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--background)',
            }}
        >
            <div
                style={{
                    maxWidth: 420,
                    width: '100%',
                    padding: '32px 24px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    backgroundColor: 'var(--card)',
                }}
            >
                <h1 style={{ marginBottom: 8, fontSize: 24, fontWeight: 600 }}>
                    Admin Login
                </h1>
                <p
                    style={{
                        marginBottom: 24,
                        color: 'var(--muted-foreground)',
                    }}
                >
                    Sign in to access the admin dashboard
                </p>

                {error && (
                    <div
                        style={{
                            padding: 12,
                            marginBottom: 16,
                            backgroundColor: 'hsl(0 84.2% 60.2% / 0.1)',
                            color: 'hsl(0 84.2% 60.2%)',
                            borderRadius: 6,
                            fontSize: 14,
                        }}
                    >
                        {error}
                    </div>
                )}

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="admin@example.com"
                                            {...field}
                                            disabled={form.formState.isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            {...field}
                                            disabled={form.formState.isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            style={{ width: '100%' }}
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting
                                ? 'Signing in...'
                                : 'Sign In'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
