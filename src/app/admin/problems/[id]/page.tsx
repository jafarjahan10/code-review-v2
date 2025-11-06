'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Department {
    id: string;
    name: string;
}

interface Position {
    id: string;
    name: string;
    departmentId: string;
}

interface Stack {
    id: string;
    name: string;
}

interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    departmentId: string;
    positionId: string;
    department: Department;
    position: Position;
    stacks: Array<{
        id: string;
        stack: Stack;
    }>;
    createdAt: string;
    updatedAt: string;
}

const difficultyColors = {
    EASY: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HARD: 'bg-red-500',
};

export default function ViewProblemPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const { data: problem, isLoading, error } = useQuery<Problem>({
        queryKey: ['problem', id],
        queryFn: async () => {
            const response = await fetch(`/api/admin/problems/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch problem');
            }
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || !problem) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-destructive">
                    Error loading problem. Please try again.
                </p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {problem.title}
                        </h1>
                        <p className="text-muted-foreground">
                            Problem Details
                        </p>
                    </div>
                </div>
                <Button onClick={() => router.push(`/admin/problems/${problem.id}/edit`)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Problem
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Problem Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    Difficulty
                                </p>
                                <Badge
                                    className={`${
                                        difficultyColors[problem.difficulty]
                                    } text-white`}
                                >
                                    {problem.difficulty}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    Department
                                </p>
                                <p className="text-base">
                                    {problem.department.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    Position
                                </p>
                                <p className="text-base">
                                    {problem.position.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    Created At
                                </p>
                                <p className="text-base">
                                    {new Date(
                                        problem.createdAt
                                    ).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                Technology Stacks
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {problem.stacks.map(s => (
                                    <Badge key={s.id} variant="secondary">
                                        {s.stack.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                        <CardDescription>
                            Problem description and requirements
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                            >
                                {problem.description}
                            </ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
