'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Eye, Trash2 } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Submission {
    id: string;
    candidateId: string;
    problemId: string;
    positionId: string;
    submissionTime: string;
    answers: unknown;
    remarks: unknown;
    candidate: {
        name: string;
        email: string;
        problem: {
            title: string;
            difficulty: string;
        };
        position: {
            name: string;
        };
        department: {
            name: string;
        };
    };
}

interface SubmissionsResponse {
    submissions: Submission[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

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

export default function SubmissionsPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const limit = 5;

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data, isLoading, refetch } = useQuery<SubmissionsResponse>({
        queryKey: ['submissions', page, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
            });
            const response = await fetch(
                `/api/admin/submissions?${params.toString()}`
            );
            if (!response.ok) throw new Error('Failed to fetch submissions');
            return response.json();
        },
    });

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await fetch(`/api/admin/submissions/${deleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete submission');

            toast.success('Submission deleted successfully');
            refetch();
            setDeleteId(null);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete submission'
            );
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Submissions</h1>
                    <p className="text-muted-foreground">
                        View and manage candidate submissions
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search by candidate name or email..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Problem</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Submission Time</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.submissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center"
                                        >
                                            No submissions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.submissions.map(submission => (
                                        <TableRow key={submission.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback
                                                            className={getAvatarGradient(
                                                                submission
                                                                    .candidate
                                                                    .name
                                                            )}
                                                        >
                                                            <span className="text-white font-semibold">
                                                                {getInitials(
                                                                    submission
                                                                        .candidate
                                                                        .name
                                                                )}
                                                            </span>
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">
                                                            {
                                                                submission
                                                                    .candidate
                                                                    .name
                                                            }
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {
                                                                submission
                                                                    .candidate
                                                                    .email
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {
                                                            submission.candidate
                                                                .problem.title
                                                        }
                                                    </div>
                                                    <Badge
                                                        className={getDifficultyColor(
                                                            submission.candidate
                                                                .problem
                                                                .difficulty
                                                        )}
                                                        variant="secondary"
                                                    >
                                                        {
                                                            submission.candidate
                                                                .problem
                                                                .difficulty
                                                        }
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {
                                                    submission.candidate
                                                        .position.name
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {
                                                    submission.candidate
                                                        .department.name
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    submission.submissionTime
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {Array.isArray(
                                                        submission.remarks
                                                    )
                                                        ? submission.remarks
                                                              .length
                                                        : 0}{' '}
                                                    Remarks
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            router.push(
                                                                `/admin/submissions/${submission.id}`
                                                            )
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            setDeleteId(
                                                                submission.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {data && data.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {(page - 1) * limit + 1} to{' '}
                                {Math.min(page * limit, data.pagination.total)}{' '}
                                of {data.pagination.total} submissions
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
                                    disabled={
                                        page === data.pagination.totalPages
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <AlertDialog
                open={deleteId !== null}
                onOpenChange={() => setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the submission.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
