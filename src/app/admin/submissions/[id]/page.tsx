'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface Answer {
    stackName: string;
    code: string;
}

interface Remark {
    id: string;
    text: string;
    adminName: string;
    adminEmail: string;
    createdAt: string;
}

interface Submission {
    id: string;
    candidateId: string;
    problemId: string;
    positionId: string;
    submissionTime: string;
    answers: Answer[];
    remarks: Remark[];
    candidate: {
        name: string;
        email: string;
        problem: {
            title: string;
            description: string;
            difficulty: string;
            stacks: {
                stack: {
                    id: string;
                    name: string;
                    description: string | null;
                };
            }[];
        };
        position: {
            name: string;
        };
        department: {
            name: string;
        };
    };
}

const remarkSchema = z.object({
    text: z.string().min(1, 'Remark is required'),
});

type RemarkFormValues = z.infer<typeof remarkSchema>;

function getAvatarGradient(name: string): string {
    const gradients = [
        'bg-gradient-to-br from-purple-400 to-pink-600',
        'bg-gradient-to-br from-blue-400 to-cyan-600',
        'bg-gradient-to-br from-green-400 to-emerald-600',
        'bg-gradient-to-br from-yellow-400 to-orange-600',
        'bg-gradient-to-br from-red-400 to-rose-600',
        'bg-gradient-to-br from-indigo-400 to-purple-600',
        'bg-gradient-to-br from-teal-400 to-green-600',
        'bg-gradient-to-br from-orange-400 to-red-600',
    ];

    const firstChar = name.charAt(0).toUpperCase();
    const index = firstChar.charCodeAt(0) % gradients.length;
    return gradients[index];
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
        case 'EASY':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'MEDIUM':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'HARD':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
}

function formatDate(date: string): string {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function SubmissionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<RemarkFormValues>({
        resolver: zodResolver(remarkSchema),
        defaultValues: {
            text: '',
        },
    });

    const { data: submission, isLoading } = useQuery<Submission>({
        queryKey: ['submission', id],
        queryFn: async () => {
            const response = await fetch(`/api/admin/submissions/${id}`);
            if (!response.ok) throw new Error('Failed to fetch submission');
            return response.json();
        },
    });

    const addRemarkMutation = useMutation({
        mutationFn: async (data: RemarkFormValues) => {
            const response = await fetch(`/api/admin/submissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ remark: data }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add remark');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submission', id] });
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
            toast.success('Remark added successfully');
            form.reset();
            setIsSubmitting(false);
        },
        onError: (error: Error) => {
            toast.error(error.message);
            setIsSubmitting(false);
        },
    });

    const onSubmit = (data: RemarkFormValues) => {
        setIsSubmitting(true);
        addRemarkMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Submission not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push('/admin/submissions')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Submissions
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/admin/submissions')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Submission Details
                    </h1>
                    <p className="text-muted-foreground">
                        View submission and add feedback
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Candidate Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback
                                        className={getAvatarGradient(
                                            submission.candidate.name
                                        )}
                                    >
                                        <span className="text-white font-semibold">
                                            {getInitials(
                                                submission.candidate.name
                                            )}
                                        </span>
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold">
                                        {submission.candidate.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {submission.candidate.email}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline">
                                            {
                                                submission.candidate.department
                                                    .name
                                            }
                                        </Badge>
                                        <Badge variant="outline">
                                            {submission.candidate.position.name}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>
                                    {submission.candidate.problem.title}
                                </CardTitle>
                                <Badge
                                    className={getDifficultyColor(
                                        submission.candidate.problem.difficulty
                                    )}
                                    variant="secondary"
                                >
                                    {submission.candidate.problem.difficulty}
                                </Badge>
                            </div>
                            <CardDescription>
                                Submitted on{' '}
                                {formatDate(submission.submissionTime)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">
                                        Problem Description
                                    </h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {
                                            submission.candidate.problem
                                                .description
                                        }
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-semibold mb-2">
                                        Required Stacks
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {submission.candidate.problem.stacks.map(
                                            ({ stack }) => (
                                                <Badge
                                                    key={stack.id}
                                                    variant="secondary"
                                                >
                                                    {stack.name}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Submitted Code</CardTitle>
                            <CardDescription>
                                Solutions for each stack
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {Array.isArray(submission.answers) &&
                                submission.answers.length > 0 ? (
                                    submission.answers.map((answer, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge>
                                                    {answer.stackName}
                                                </Badge>
                                            </div>
                                            <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                                                <code className="text-sm">
                                                    {answer.code}
                                                </code>
                                            </pre>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No code submitted yet
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Remark</CardTitle>
                            <CardDescription>
                                Provide feedback for this submission
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="text"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Remark</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Enter your feedback..."
                                                        rows={5}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Add Remark
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Remarks</CardTitle>
                            <CardDescription>
                                {Array.isArray(submission.remarks)
                                    ? submission.remarks.length
                                    : 0}{' '}
                                remark(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.isArray(submission.remarks) &&
                                submission.remarks.length > 0 ? (
                                    submission.remarks.map(remark => (
                                        <div
                                            key={remark.id}
                                            className="p-4 bg-muted rounded-lg space-y-2"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold text-sm">
                                                        {remark.adminName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {remark.adminEmail}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(
                                                        remark.createdAt
                                                    )}
                                                </p>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">
                                                {remark.text}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No remarks yet
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
