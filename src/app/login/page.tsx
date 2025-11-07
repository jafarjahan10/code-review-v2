'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
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

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const [error, setError] = useState('');

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

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
                router.push(callbackUrl);
                router.refresh();
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
                    Candidate Login
                </h1>
                <p
                    style={{
                        marginBottom: 24,
                        color: 'var(--muted-foreground)',
                    }}
                >
                    Sign in to view and submit your coding challenges
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
                                            placeholder="candidate@example.com"
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
                            className='text-muted'
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
