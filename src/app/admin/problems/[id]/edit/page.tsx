'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const problemFormSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    departmentId: z.string().min(1, 'Department is required'),
    positionId: z.string().min(1, 'Position is required'),
    stackIds: z.array(z.string()).min(1, 'At least one stack is required'),
});

type ProblemFormValues = z.infer<typeof problemFormSchema>;

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

export default function EditProblemPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id } = use(params);

    const form = useForm<ProblemFormValues>({
        resolver: zodResolver(problemFormSchema),
        defaultValues: {
            title: '',
            description: '',
            difficulty: undefined,
            departmentId: '',
            positionId: '',
            stackIds: [],
        },
    });

    // Fetch problem
    const { data: problem, isLoading: problemLoading } = useQuery<Problem>({
        queryKey: ['problem', id],
        queryFn: async () => {
            const response = await fetch(`/api/admin/problems/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch problem');
            }
            return response.json();
        },
    });

    // Fetch departments
    const { data: departmentsData } = useQuery<{ departments: Department[] }>({
        queryKey: ['departments-list'],
        queryFn: async () => {
            const response = await fetch('/api/admin/departments?limit=100');
            if (!response.ok) throw new Error('Failed to fetch departments');
            return response.json();
        },
    });

    // Fetch positions
    const { data: positionsData } = useQuery<{ positions: Position[] }>({
        queryKey: ['positions-list'],
        queryFn: async () => {
            const response = await fetch('/api/admin/positions?limit=100');
            if (!response.ok) throw new Error('Failed to fetch positions');
            return response.json();
        },
    });

    // Fetch stacks
    const { data: stacksData } = useQuery<{ stacks: Stack[] }>({
        queryKey: ['stacks-list'],
        queryFn: async () => {
            const response = await fetch('/api/admin/stacks?limit=100');
            if (!response.ok) throw new Error('Failed to fetch stacks');
            return response.json();
        },
    });

    // Update problem mutation
    const updateProblemMutation = useMutation({
        mutationFn: async (data: ProblemFormValues) => {
            const response = await fetch(`/api/admin/problems/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update problem');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['problems'] });
            queryClient.invalidateQueries({ queryKey: ['problem', id] });
            toast.success('Problem updated successfully');
            router.push('/admin/problems');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Update form when problem data is loaded
    useEffect(() => {
        if (problem && departmentsData && positionsData && stacksData) {
            form.reset({
                title: problem.title,
                description: problem.description,
                difficulty: problem.difficulty,
                departmentId: problem.departmentId,
                positionId: problem.positionId,
                stackIds: problem.stacks.map(s => s.stack.id),
            });
        }
    }, [problem, departmentsData, positionsData, stacksData, form]);

    const onSubmit = (data: ProblemFormValues) => {
        updateProblemMutation.mutate(data);
    };

    // Filter positions based on selected department
    const getFilteredPositions = (departmentId: string) => {
        return (
            positionsData?.positions.filter(
                pos => pos.departmentId === departmentId
            ) || []
        );
    };

    if (problemLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-destructive">Problem not found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
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
                        Edit Problem
                    </h1>
                    <p className="text-muted-foreground">
                        Update problem information
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Problem Details</CardTitle>
                    <CardDescription>
                        Modify the problem information below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Two Sum"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="difficulty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Difficulty</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={
                                                    field.value ||
                                                    problem.difficulty
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select difficulty" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="EASY">
                                                        Easy
                                                    </SelectItem>
                                                    <SelectItem value="MEDIUM">
                                                        Medium
                                                    </SelectItem>
                                                    <SelectItem value="HARD">
                                                        Hard
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="departmentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <Select
                                                onValueChange={value => {
                                                    field.onChange(value);
                                                    form.setValue(
                                                        'positionId',
                                                        ''
                                                    );
                                                }}
                                                value={
                                                    field.value ||
                                                    problem.departmentId
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select department" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {departmentsData?.departments.map(
                                                        dept => (
                                                            <SelectItem
                                                                key={dept.id}
                                                                value={dept.id}
                                                            >
                                                                {dept.name}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="positionId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Position</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={
                                                    field.value ||
                                                    problem.positionId
                                                }
                                                disabled={
                                                    !form.watch(
                                                        'departmentId'
                                                    ) && !problem.departmentId
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select position" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {getFilteredPositions(
                                                        form.watch(
                                                            'departmentId'
                                                        ) ||
                                                            problem.departmentId
                                                    ).map(pos => (
                                                        <SelectItem
                                                            key={pos.id}
                                                            value={pos.id}
                                                        >
                                                            {pos.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="stackIds"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Technology Stacks</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                options={
                                                    stacksData?.stacks.map(
                                                        stack => ({
                                                            label: stack.name,
                                                            value: stack.id,
                                                        })
                                                    ) || []
                                                }
                                                selected={field.value || []}
                                                onChange={field.onChange}
                                                placeholder="Select stacks"
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Description (Markdown)
                                        </FormLabel>
                                        <Tabs
                                            defaultValue="write"
                                            className="w-full"
                                        >
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="write">
                                                    Write
                                                </TabsTrigger>
                                                <TabsTrigger value="preview">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Preview
                                                </TabsTrigger>
                                            </TabsList>
                                            <TabsContent
                                                value="write"
                                                className="mt-2"
                                            >
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Enter problem description in markdown..."
                                                        className="min-h-[400px] font-mono text-sm"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </TabsContent>
                                            <TabsContent
                                                value="preview"
                                                className="mt-2 border rounded-md p-4 min-h-[300px] bg-muted/30 overflow-auto prose prose-sm dark:prose-invert max-w-none"
                                            >
                                                {field.value ? (
                                                    <ReactMarkdown
                                                        remarkPlugins={[
                                                            remarkGfm,
                                                        ]}
                                                        rehypePlugins={[
                                                            rehypeRaw,
                                                        ]}
                                                    >
                                                        {field.value}
                                                    </ReactMarkdown>
                                                ) : (
                                                    <p className="text-muted-foreground text-center py-12">
                                                        Nothing to preview
                                                    </p>
                                                )}
                                            </TabsContent>
                                        </Tabs>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="text-muted"
                                    type="submit"
                                    disabled={updateProblemMutation.isPending}
                                >
                                    {updateProblemMutation.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Update Problem
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
