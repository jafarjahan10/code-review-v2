'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Lock, Clock, Code, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface Stack {
    id: string;
    name: string;
}

interface ProblemStack {
    id: string;
    stack: Stack;
}

interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    stacks: ProblemStack[];
}

interface Candidate {
    id: string;
    name: string;
    email: string;
    scheduledTime: string;
    startTime: string | null;
    submissionTime: string | null;
    problem: Problem;
    department: { name: string };
    position: { name: string };
}

export default function CandidatePortal() {
    const queryClient = useQueryClient();
    const { theme } = useTheme();
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);

    // Map stack names to Monaco Editor languages
    const getLanguage = (stackName: string): string => {
        const name = stackName.toLowerCase();
        if (name.includes('javascript') || name.includes('js'))
            return 'javascript';
        if (name.includes('typescript') || name.includes('ts'))
            return 'typescript';
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
        if (name.includes('xml')) return 'xml';
        if (name.includes('markdown') || name.includes('md')) return 'markdown';
        if (name.includes('yaml') || name.includes('yml')) return 'yaml';
        if (name.includes('shell') || name.includes('bash')) return 'shell';
        if (name.includes('react') || name.includes('jsx')) return 'javascript';
        if (name.includes('vue')) return 'javascript';
        if (name.includes('angular')) return 'typescript';
        if (name.includes('node')) return 'javascript';
        return 'javascript'; // Default to JavaScript
    };

    // Fetch candidate data
    const { data: candidate, isLoading } = useQuery<Candidate>({
        queryKey: ['candidate-me'],
        queryFn: async () => {
            const response = await fetch('/api/candidate/me');
            if (!response.ok) throw new Error('Failed to fetch candidate data');
            return response.json();
        },
        refetchInterval: query => {
            // Refetch every 10 seconds if test not started and before scheduled time
            const data = query.state.data;
            if (
                data &&
                !data.startTime &&
                new Date() < new Date(data.scheduledTime)
            ) {
                return 10000;
            }
            return false;
        },
    });

    // Initialize code answers from problem stacks
    const [codeAnswers, setCodeAnswers] = useState<Record<string, string>>(
        () => {
            if (candidate?.problem?.stacks) {
                const initialAnswers: Record<string, string> = {};
                candidate.problem.stacks.forEach(ps => {
                    initialAnswers[ps.stack.id] = '';
                });
                return initialAnswers;
            }
            return {};
        }
    );

    // Start test mutation
    const startTestMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/candidate/start-test', {
                method: 'POST',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to start test');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidate-me'] });
            toast.success('Test started successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Submit test mutation
    const submitTestMutation = useMutation({
        mutationFn: async (
            answers: Array<{ stackId: string; stackName: string; code: string }>
        ) => {
            const response = await fetch('/api/candidate/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to submit test');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidate-me'] });
            toast.success('Test submitted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Calculate time remaining
    useEffect(() => {
        if (!candidate || candidate.startTime) return;

        const calculateTimeRemaining = () => {
            const now = new Date();
            const scheduled = new Date(candidate.scheduledTime);
            const diff = scheduled.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining('Available now');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            const parts = [];
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0) parts.push(`${minutes}m`);

            setTimeRemaining(parts.join(' ') || 'Less than a minute');
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000); // Update every second

        return () => clearInterval(interval);
    }, [candidate]);

    const handleCodeChange = (stackId: string, code: string) => {
        setCodeAnswers(prev => ({ ...prev, [stackId]: code }));
    };

    const handleSubmitClick = () => {
        setShowSubmitDialog(true);
    };

    const handleSubmit = () => {
        if (!candidate) return;

        const answers = candidate.problem.stacks.map(ps => ({
            stackId: ps.stack.id,
            stackName: ps.stack.name,
            code: codeAnswers[ps.stack.id] || '',
        }));

        submitTestMutation.mutate(answers);
        setShowSubmitDialog(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Alert className="max-w-md">
                    <AlertDescription>
                        Candidate data not found. Please contact administrator.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Check if already submitted
    if (candidate.submissionTime) {
        // Calculate total time taken
        const startTime = new Date(candidate.startTime!).getTime();
        const endTime = new Date(candidate.submissionTime).getTime();
        const totalTime = endTime - startTime;
        
        const hours = Math.floor(totalTime / (1000 * 60 * 60));
        const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((totalTime % (1000 * 60)) / 1000);
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        return (
            <div className="flex items-center justify-center h-full">
                <Card className="max-w-2xl w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
                        </div>
                        <CardTitle className="text-2xl">
                            Test Completed Successfully!
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            Thank you for completing the coding challenge
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-lg bg-muted p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-1">
                                    Submitted on
                                </p>
                                <p className="text-lg font-semibold">
                                    {new Date(
                                        candidate.submissionTime
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <div className="rounded-lg bg-muted p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-1">
                                    Total Time Taken
                                </p>
                                <p className="text-lg font-semibold font-mono tabular-nums">
                                    {formattedTime}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-2">
                            <div className="flex items-start gap-3 text-sm">
                                <p className="text-muted-foreground">
                                    - Your submission has been recorded and will
                                    be reviewed by our interview panel.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <p className="text-muted-foreground">
                                    - Our team will carefully assess your code
                                    quality, problem-solving approach, and
                                    implementation.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <p className="text-muted-foreground">
                                    - You will be notified about the next steps
                                    within the coming days if you pass the
                                    initial review.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t text-center">
                            <p className="text-sm text-muted-foreground">
                                If you have any questions, please contact our HR
                                team.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if test is locked (before scheduled time)
    const isLocked = new Date() < new Date(candidate.scheduledTime);

    if (isLocked && !candidate.startTime) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
                <Card className="max-w-xl w-full text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Lock className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Test Locked</CardTitle>
                        <CardDescription>
                            This test will unlock at your scheduled time
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-muted p-6">
                            <p className="text-sm text-muted-foreground mb-2">
                                Scheduled Time
                            </p>
                            <p className="text-xl font-semibold">
                                {new Date(
                                    candidate.scheduledTime
                                ).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Clock className="h-5 w-5" />
                            <p className="text-base">
                                Time remaining:{' '}
                                <span className="font-semibold text-foreground">
                                    {timeRemaining}
                                </span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show start test screen (if not started yet)
    if (!candidate.startTime) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
                <Card className="max-w-lg w-full">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            {candidate.problem.title}
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            {candidate.position.name} •{' '}
                            {candidate.department.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <Badge variant="outline" className="text-sm">
                                {candidate.problem.stacks.length} Stack
                                {candidate.problem.stacks.length !== 1
                                    ? 's'
                                    : ''}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Click the button below to start your test. The timer
                            will begin once you start.
                        </p>
                        <Button
                            className="w-full text-muted"
                            size="lg"
                            onClick={() => startTestMutation.mutate()}
                            disabled={startTestMutation.isPending}
                        >
                            {startTestMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Starting
                                </>
                            ) : (
                                <>
                                    <Code className="mr-2 h-4 w-4" />
                                    Start Test
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show test interface (after test started)
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Column - Problem Description */}
            <div className="flex flex-col">
                <Card className="flex-1 flex flex-col">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-2xl">
                                    {candidate.problem.title}
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    {candidate.position.name} •{' '}
                                    {candidate.department.name}
                                </CardDescription>
                            </div>
                            {/* <Badge variant={
                                candidate.problem.difficulty === 'EASY' ? 'default' :
                                candidate.problem.difficulty === 'MEDIUM' ? 'secondary' : 'destructive'
                            }>
                                {candidate.problem.difficulty}
                            </Badge> */}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {candidate.problem.description}
                            </ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Code Editor */}
            <div className="flex flex-col">
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Your Solution</CardTitle>
                                <CardDescription>
                                    Write your code for each stack
                                </CardDescription>
                            </div>
                            <Button
                                size="default"
                                className="text-muted"
                                onClick={handleSubmitClick}
                                disabled={submitTestMutation.isPending}
                            >
                                {submitTestMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Submit Test
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col overflow-hidden pt-0">
                        <Tabs
                            defaultValue={candidate.problem.stacks[0]?.stack.id}
                            className="flex-1 flex flex-col"
                        >
                            <TabsList className="w-full justify-start mb-3">
                                {candidate.problem.stacks.map(ps => (
                                    <TabsTrigger
                                        key={ps.stack.id}
                                        value={ps.stack.id}
                                    >
                                        {ps.stack.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {candidate.problem.stacks.map(ps => (
                                <TabsContent
                                    key={ps.stack.id}
                                    value={ps.stack.id}
                                    className="flex-1 mt-0 data-[state=active]:flex data-[state=active]:flex-col"
                                >
                                    <div className="flex-1 border rounded-md overflow-hidden">
                                        <Editor
                                            height="100%"
                                            language={getLanguage(
                                                ps.stack.name
                                            )}
                                            value={
                                                codeAnswers[ps.stack.id] || ''
                                            }
                                            onChange={value =>
                                                handleCodeChange(
                                                    ps.stack.id,
                                                    value || ''
                                                )
                                            }
                                            theme={
                                                theme === 'dark'
                                                    ? 'vs-dark'
                                                    : 'light'
                                            }
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                lineNumbers: 'on',
                                                roundedSelection: true,
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                                tabSize: 2,
                                                wordWrap: 'on',
                                                suggestOnTriggerCharacters:
                                                    true,
                                                quickSuggestions: true,
                                                acceptSuggestionOnEnter: 'on',
                                                parameterHints: {
                                                    enabled: true,
                                                },
                                            }}
                                            loading={
                                                <div className="flex items-center justify-center h-full">
                                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                </div>
                                            }
                                        />
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Submit Confirmation Dialog */}
            <AlertDialog
                open={showSubmitDialog}
                onOpenChange={setShowSubmitDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Your Test?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to submit your test? This
                            action cannot be undone. You can only submit once,
                            so please make sure you have completed all your
                            answers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={submitTestMutation.isPending}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className='text-muted'
                            onClick={handleSubmit}
                            disabled={submitTestMutation.isPending}
                        >
                            {submitTestMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Submit Test
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
