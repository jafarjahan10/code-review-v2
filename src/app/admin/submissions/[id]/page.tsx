'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

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

function formatDate(date: string): string {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Map stack names to Monaco Editor languages
function getLanguage(stackName: string): string {
    const name = stackName.toLowerCase();
    if (name.includes('javascript') || name.includes('js')) return 'javascript';
    if (name.includes('typescript') || name.includes('ts')) return 'typescript';
    if (name.includes('python')) return 'python';
    if (name.includes('java')) return 'java';
    if (name.includes('c++') || name.includes('cpp')) return 'cpp';
    if (name.includes('c#') || name.includes('csharp')) return 'csharp';
    if (name.includes('go') || name.includes('golang')) return 'go';
    if (name.includes('rust')) return 'rust';
    if (name.includes('php')) return 'php';
    if (name.includes('ruby')) return 'ruby';
    if (name.includes('sql')) return 'sql';
    if (name.includes('html')) return 'html';
    if (name.includes('css')) return 'css';
    if (name.includes('json')) return 'json';
    if (name.includes('react') || name.includes('jsx')) return 'javascript';
    if (name.includes('vue')) return 'javascript';
    if (name.includes('angular')) return 'typescript';
    if (name.includes('node')) return 'javascript';
    return 'javascript'; // Default to JavaScript
}

export default function SubmissionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();
    const { theme } = useTheme();
    const { data: session } = useSession();
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

            {/* Top Section - Candidate and Problem Details */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Candidate Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback
                                        className={getAvatarGradient(
                                            submission.candidate.name
                                        )}
                                    >
                                        <span className="text-white font-semibold text-lg">
                                            {getInitials(submission.candidate.name)}
                                        </span>
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        {submission.candidate.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {submission.candidate.email}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Position</p>
                                    <p className="font-medium">{submission.candidate.position.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Department</p>
                                    <p className="font-medium">{submission.candidate.department.name}</p>
                                </div>
                            </div>
                        </div>

                        <Separator className="md:hidden" />

                        {/* Problem Details */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-semibold">
                                        {submission.candidate.problem.title}
                                    </h3>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        submission.candidate.problem.difficulty === 'EASY' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : submission.candidate.problem.difficulty === 'MEDIUM'
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                        {submission.candidate.problem.difficulty}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/admin/problems/${submission.problemId}`)}
                                    className="w-full"
                                >
                                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" x2="21" y1="14" y2="3" />
                                    </svg>
                                    View Problem Details
                                </Button>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Required Stacks</p>
                                <div className="flex flex-wrap gap-2">
                                    {submission.candidate.problem.stacks.map(({ stack }) => (
                                        <span
                                            key={stack.id}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                        >
                                            {stack.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Submitted on</p>
                                <p className="font-medium">{formatDate(submission.submissionTime)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Two Column Layout - Code and Remarks */}
            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                {/* Left Column - Submitted Code */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Submitted Code</CardTitle>
                        <CardDescription>
                            Solutions for each stack
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                        <Tabs defaultValue={submission.answers[0]?.stackName || ''} className="flex-1 flex flex-col">
                            <TabsList className="w-full justify-start">
                                {submission.answers.map((answer, index) => (
                                    <TabsTrigger key={index} value={answer.stackName}>
                                        {answer.stackName}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {submission.answers.map((answer, index) => (
                                <TabsContent 
                                    key={index} 
                                    value={answer.stackName}
                                    className="flex-1 mt-4 data-[state=active]:flex data-[state=active]:flex-col"
                                >
                                    <div className="flex-1 border rounded-md overflow-hidden">
                                        <Editor
                                            height="500px"
                                            language={getLanguage(answer.stackName)}
                                            value={answer.code}
                                            theme={theme === 'dark' ? 'vs-dark' : 'light'}
                                            options={{
                                                readOnly: true,
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                lineNumbers: 'on',
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                                tabSize: 2,
                                                wordWrap: 'on',
                                            }}
                                        />
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Right Column - Interviewer Remarks */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interviewer Remarks</CardTitle>
                            <CardDescription>
                                Feedback from the interview panel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.isArray(submission.remarks) &&
                                submission.remarks.length > 0 ? (
                                    submission.remarks.map(remark => (
                                        <div
                                            key={remark.id}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback
                                                        className={getAvatarGradient(
                                                            remark.adminName
                                                        )}
                                                    >
                                                        <span className="text-white font-semibold text-sm">
                                                            {getInitials(remark.adminName)}
                                                        </span>
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold text-sm">
                                                            {remark.adminName}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDate(remark.createdAt)}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm whitespace-pre-wrap">
                                                        {remark.text}
                                                    </p>
                                                </div>
                                            </div>
                                            <Separator />
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

                    {session?.user?.email && 
                     submission.remarks.some(remark => remark.adminEmail === session.user.email) ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                    Remark Submitted
                                </CardTitle>
                                <CardDescription>
                                    You have already provided feedback for this submission.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
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
                                            className="w-full text-muted"
                                            disabled={isSubmitting}
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            Add Remark
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
