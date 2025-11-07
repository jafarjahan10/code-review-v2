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
import { Loader2 } from 'lucide-react';

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
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-[420px] rounded-lg border border-border bg-card p-8">
                <h1 className="mb-2 text-2xl font-semibold">
                    Admin Login
                </h1>
                <p className="mb-6 text-muted-foreground">
                    Sign in to access the admin dashboard
                </p>

                {error && (
                    <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
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
                                            disabled={
                                                form.formState.isSubmitting
                                            }
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
                                            disabled={
                                                form.formState.isSubmitting
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full text-muted"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting && (
                                <Loader2 className="animate-spin" />
                            )}{' '}
                            Sign In
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
