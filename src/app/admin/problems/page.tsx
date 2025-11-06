'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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

interface PaginationData {
    problems: Problem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const difficultyColors = {
    EASY: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HARD: 'bg-red-500',
};

export default function ProblemsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [deletingProblemId, setDeletingProblemId] = useState<string | null>(
        null
    );

    const isAdmin = session?.user?.userType === 'ADMIN';

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch problems
    const { data, isLoading, error } = useQuery<PaginationData>({
        queryKey: ['problems', page, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '5',
                ...(search && { search }),
            });
            const response = await fetch(`/api/admin/problems?${params}`);
            if (!response.ok) throw new Error('Failed to fetch problems');
            return response.json();
        },
    });

    // Delete problem mutation
    const deleteProblemMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/admin/problems/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete problem');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['problems'] });
            setDeletingProblemId(null);
            toast.success('Problem deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const handleDeleteProblem = () => {
        if (deletingProblemId) {
            deleteProblemMutation.mutate(deletingProblemId);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
                <p className="text-muted-foreground mt-2">
                    Manage coding problems for interviews
                </p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                    <Input
                        placeholder="Search problems..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                    />
                </div>

                {isAdmin && (
                    <Button onClick={() => router.push('/admin/problems/new')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Problem
                    </Button>
                )}
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Stacks</TableHead>
                            <TableHead>Created At</TableHead>
                            {isAdmin && (
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={isAdmin ? 7 : 6}
                                    className="text-center py-8"
                                >
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={isAdmin ? 7 : 6}
                                    className="text-center py-8 text-destructive"
                                >
                                    Error loading problems
                                </TableCell>
                            </TableRow>
                        ) : data?.problems.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={isAdmin ? 7 : 6}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    No problems found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.problems.map(problem => (
                                <TableRow key={problem.id}>
                                    <TableCell className="font-medium">
                                        {problem.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`${
                                                difficultyColors[
                                                    problem.difficulty
                                                ]
                                            } text-white`}
                                        >
                                            {problem.difficulty}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {problem.department.name}
                                    </TableCell>
                                    <TableCell>
                                        {problem.position.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {problem.stacks.map(s => (
                                                <Badge
                                                    key={s.id}
                                                    variant="secondary"
                                                >
                                                    {s.stack.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            problem.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/problems/${problem.id}`
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/problems/${problem.id}/edit`
                                                        )
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeletingProblemId(
                                                            problem.id
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * 5 + 1} to{' '}
                        {Math.min(page * 5, data.total)} of {data.total}{' '}
                        problems
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page === data.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deletingProblemId !== null}
                onOpenChange={open => !open && setDeletingProblemId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the problem.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProblem}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteProblemMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
