'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
    Eye,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowUpDown,
    X,
} from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { SubmissionsSkeleton } from '@/components/skeletons';

interface Submission {
    id: string;
    candidateId: string;
    problemId: string;
    positionId: string;
    submissionTime: string;
    answers: unknown;
    remarks: unknown;
    recommendedForNextStep: boolean;
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

function getStatusIcon(submission: Submission) {
    const remarksCount = Array.isArray(submission.remarks)
        ? submission.remarks.length
        : 0;

    // No remarks - show pending icon
    if (remarksCount === 0) {
        return <Clock className="h-5 w-5 text-yellow-600 mx-auto" />;
    }

    // Remarks given but not recommended - show cross icon
    if (remarksCount > 0 && !submission.recommendedForNextStep) {
        return <XCircle className="h-5 w-5 text-red-600 mx-auto" />;
    }

    // Recommended - show check icon
    if (submission.recommendedForNextStep) {
        return <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />;
    }

    return null;
}

function SubmissionsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [searchInput, setSearchInput] = useState(
        searchParams.get('search') || ''
    );
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [limit, setLimit] = useState(
        parseInt(searchParams.get('limit') || '5')
    );
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [recommendationFilter, setRecommendationFilter] = useState(
        searchParams.get('recommendation') || ''
    );
    const [difficultyFilter, setDifficultyFilter] = useState(
        searchParams.get('difficulty') || ''
    );
    const [sortBy, setSortBy] = useState(
        searchParams.get('sortBy') || 'submissionTime'
    );
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    );

    // Update URL when state changes
    useEffect(() => {
        const params = new URLSearchParams();

        if (page !== 1) params.set('page', page.toString());
        if (limit !== 5) params.set('limit', limit.toString());
        if (search) params.set('search', search);
        if (recommendationFilter)
            params.set('recommendation', recommendationFilter);
        if (difficultyFilter) params.set('difficulty', difficultyFilter);
        if (sortBy !== 'submissionTime') params.set('sortBy', sortBy);
        if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

        const queryString = params.toString();
        const newUrl = queryString
            ? `/admin/submissions?${queryString}`
            : '/admin/submissions';

        router.replace(newUrl, { scroll: false });
    }, [
        page,
        search,
        recommendationFilter,
        difficultyFilter,
        sortBy,
        sortOrder,
        limit,
        router,
    ]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data, isLoading, refetch } = useQuery<SubmissionsResponse>({
        queryKey: [
            'submissions',
            page,
            search,
            recommendationFilter,
            difficultyFilter,
            sortBy,
            sortOrder,
            limit,
        ],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
                ...(recommendationFilter && {
                    recommendation: recommendationFilter,
                }),
                ...(difficultyFilter && { difficulty: difficultyFilter }),
                sortBy,
                sortOrder,
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

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
        setPage(1);
    };

    const clearFilters = () => {
        setSearchInput('');
        setSearch('');
        setRecommendationFilter('');
        setDifficultyFilter('');
        setSortBy('submissionTime');
        setSortOrder('desc');
        setPage(1);
    };

    const hasActiveFilters =
        search ||
        recommendationFilter ||
        difficultyFilter ||
        sortBy !== 'submissionTime' ||
        sortOrder !== 'desc';

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
            {isLoading ? (
                <SubmissionsSkeleton />
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Submissions</h1>
                            <p className="text-muted-foreground">
                                View and manage candidate submissions
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Input
                            placeholder="Search by candidate name or email..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="max-w-sm"
                        />

                        <Select
                            value={recommendationFilter}
                            onValueChange={value => {
                                setRecommendationFilter(
                                    value === 'all' ? '' : value
                                );
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="not-recommended">
                                    Not Recommended
                                </SelectItem>
                                <SelectItem value="recommended">
                                    Recommended
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={difficultyFilter}
                            onValueChange={value => {
                                setDifficultyFilter(
                                    value === 'all' ? '' : value
                                );
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="All Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Difficulty
                                </SelectItem>
                                <SelectItem value="EASY">Easy</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HARD">Hard</SelectItem>
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="gap-2"
                            >
                                <X className="h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() =>
                                                handleSort('candidateName')
                                            }
                                            className="h-8 p-0 hover:bg-transparent"
                                        >
                                            Candidate
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Problem</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() =>
                                                handleSort('submissionTime')
                                            }
                                            className="h-8 p-0 hover:bg-transparent"
                                        >
                                            Submission Time
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead className="text-center">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.submissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center"
                                        >
                                            No submissions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.submissions.map(submission => (
                                        <TableRow
                                            key={submission.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() =>
                                                router.push(
                                                    `/admin/submissions/${submission.id}`
                                                )
                                            }
                                        >
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
                                            <TableCell className="text-center">
                                                {getStatusIcon(submission)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            router.push(
                                                                `/admin/submissions/${submission.id}`
                                                            );
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setDeleteId(
                                                                submission.id
                                                            );
                                                        }}
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

                    {data && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(page - 1) * limit + 1} to{' '}
                                    {Math.min(
                                        page * limit,
                                        data.pagination.total
                                    )}{' '}
                                    of {data.pagination.total} submissions
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        Rows per page:
                                    </span>
                                    <Select
                                        value={limit.toString()}
                                        onValueChange={value => {
                                            setLimit(parseInt(value));
                                            setPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-[70px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="10">
                                                10
                                            </SelectItem>
                                            <SelectItem value="20">
                                                20
                                            </SelectItem>
                                            <SelectItem value="50">
                                                50
                                            </SelectItem>
                                            <SelectItem value="100">
                                                100
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {data.pagination.totalPages > 1 && (
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
                            )}
                        </div>
                    )}

                    <AlertDialog
                        open={deleteId !== null}
                        onOpenChange={() => setDeleteId(null)}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the submission.
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
                </>
            )}
        </div>
    );
}

export default function SubmissionsPage() {
    return (
        <Suspense fallback={<SubmissionsSkeleton />}>
            <SubmissionsPageContent />
        </Suspense>
    );
}
