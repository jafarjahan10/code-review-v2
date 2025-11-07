'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Eye, EyeOff, Pencil, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ViewCandidatePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const copyPassword = () => {
        if (candidate?.password) {
            navigator.clipboard.writeText(candidate.password);
            toast.success('Password copied to clipboard');
        }
    };

    const { data: candidate, isLoading } = useQuery({
        queryKey: ['candidate', id],
        queryFn: async () => {
            const response = await fetch(`/api/admin/candidates/${id}`);
            if (!response.ok) throw new Error('Failed to fetch candidate');
            return response.json();
        },
    });

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-lg text-muted-foreground">
                    Candidate not found
                </p>
                <Button onClick={() => router.push('/admin/candidates')}>
                    Back to Candidates
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/admin/candidates')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{candidate.name}</h1>
                        <p className="text-muted-foreground">
                            {candidate.email}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {candidate.submissionTime ? (
                        <Badge className='h-6' variant="default">Submitted</Badge>
                    ) : (
                        <Badge className='h-6' variant="destructive">Pending</Badge>
                    )}
                    <Button
                        className='text-muted'
                        onClick={() =>
                            router.push(`/admin/candidates/${id}/edit`)
                        }
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Basic details of the candidate
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Name
                            </p>
                            <p className="text-lg">{candidate.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Email
                            </p>
                            <p className="text-lg">{candidate.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Access Code
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-mono">
                                    {candidate.password}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={copyPassword}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Organization Details</CardTitle>
                        <CardDescription>
                            Department and position information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Department
                            </p>
                            <p className="text-lg">
                                {candidate.department.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Position
                            </p>
                            <p className="text-lg">{candidate.position.name}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Assessment Details</CardTitle>
                        <CardDescription>
                            Problem assignment and schedule information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Assigned Problem
                            </p>
                            <p className="text-lg">{candidate.problem.title}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Scheduled Time
                                </p>
                                <p className="text-lg">
                                    {formatDate(candidate.scheduledTime)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Submission Time
                                </p>
                                <p className="text-lg">
                                    {candidate.submissionTime
                                        ? formatDate(candidate.submissionTime)
                                        : 'Not submitted yet'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
