'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User, Lock, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const profileFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    image: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

const passwordFormSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    userType: string;
    adminRole: string | null;
    createdAt: string;
}

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const queryClient = useQueryClient();

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: '',
            image: '',
        },
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    // Fetch user profile
    const { data: userProfile } = useQuery<UserProfile>({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const response = await fetch('/api/admin/settings');
            if (!response.ok) throw new Error('Failed to fetch profile');
            return response.json();
        },
    });

    // Set form values when data is loaded
    useEffect(() => {
        if (userProfile) {
            profileForm.reset({
                name: userProfile.name || '',
                image: userProfile.image || '',
            });
        }
    }, [userProfile, profileForm]);

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (data: ProfileFormValues) => {
            const response = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update profile');
            }
            return response.json();
        },
        onSuccess: async data => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            // Update session with new data
            await updateSession({
                ...session,
                user: {
                    ...session?.user,
                    name: data.user.name,
                    image: data.user.image,
                },
            });
            toast.success('Profile updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Update password mutation
    const updatePasswordMutation = useMutation({
        mutationFn: async (data: PasswordFormValues) => {
            const response = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update password');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            passwordForm.reset();
            toast.success('Password updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const onProfileSubmit = (data: ProfileFormValues) => {
        updateProfileMutation.mutate(data);
    };

    const onPasswordSubmit = (data: PasswordFormValues) => {
        updatePasswordMutation.mutate(data);
    };

    const getInitials = (name: string | null) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Watch form values for avatar preview
    const watchedImage = useWatch({
        control: profileForm.control,
        name: 'image',
    });
    const watchedName = useWatch({
        control: profileForm.control,
        name: 'name',
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="grid gap-6">
                {/* Profile Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>
                            Update your personal information and profile picture
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Avatar Preview */}
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage
                                    src={watchedImage || undefined}
                                    alt={watchedName || 'User'}
                                />
                                <AvatarFallback className="text-lg">
                                    {getInitials(watchedName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium">
                                    Profile Picture
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Enter an image URL below to update your
                                    avatar
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <Form {...profileForm}>
                            <form
                                onSubmit={profileForm.handleSubmit(
                                    onProfileSubmit
                                )}
                                className="space-y-4"
                            >
                                <FormField
                                    control={profileForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            value={userProfile?.email || ''}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Email cannot be changed
                                    </FormDescription>
                                </FormItem>

                                <FormField
                                    control={profileForm.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <ImageIcon className="h-4 w-4" />
                                                Avatar URL
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://example.com/avatar.jpg"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter a valid image URL
                                                (optional)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                                    <div>
                                        <span className="text-muted-foreground">
                                            User Type:
                                        </span>{' '}
                                        <span className="font-medium">
                                            {userProfile?.userType}
                                        </span>
                                    </div>
                                    {userProfile?.adminRole && (
                                        <div>
                                            <span className="text-muted-foreground">
                                                Role:
                                            </span>{' '}
                                            <span className="font-medium">
                                                {userProfile.adminRole}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                >
                                    {updateProfileMutation.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Save Changes
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Password Change Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Change Password
                        </CardTitle>
                        <CardDescription>
                            Update your password to keep your account secure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...passwordForm}>
                            <form
                                onSubmit={passwordForm.handleSubmit(
                                    onPasswordSubmit
                                )}
                                className="space-y-4"
                            >
                                <FormField
                                    control={passwordForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Current Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter current password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter new password (min 6 characters)"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Confirm New Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={updatePasswordMutation.isPending}
                                >
                                    {updatePasswordMutation.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Update Password
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
