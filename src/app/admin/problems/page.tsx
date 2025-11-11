'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Pencil, Trash2, Loader2, Eye, ArrowUpDown, X } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    
    // Initialize state from URL params
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get('difficulty') || '');
    const [departmentFilter, setDepartmentFilter] = useState(searchParams.get('departmentId') || '');
    const [positionFilter, setPositionFilter] = useState(searchParams.get('positionId') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc');
    const [deletingProblemId, setDeletingProblemId] = useState<string | null>(
        null
    );

    const isAdmin = session?.user?.userType === 'ADMIN';

    // Update URL when state changes
    useEffect(() => {
        const params = new URLSearchParams();
        
        if (page !== 1) params.set('page', page.toString());
        if (search) params.set('search', search);
        if (difficultyFilter) params.set('difficulty', difficultyFilter);
        if (departmentFilter) params.set('departmentId', departmentFilter);
        if (positionFilter) params.set('positionId', positionFilter);
        if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
        if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

        const queryString = params.toString();
        const newUrl = queryString ? `/admin/problems?${queryString}` : '/admin/problems';
        
        router.replace(newUrl, { scroll: false });
    }, [page, search, difficultyFilter, departmentFilter, positionFilter, sortBy, sortOrder, router]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch departments for filter
    const { data: departmentsData } = useQuery({
        queryKey: ['departments-list'],
        queryFn: async () => {
            const response = await fetch('/api/admin/departments?limit=100');
            if (!response.ok) throw new Error('Failed to fetch departments');
            return response.json();
        },
    });

    // Fetch positions for filter
    const { data: positionsData } = useQuery({
        queryKey: ['positions-list'],
        queryFn: async () => {
            const response = await fetch('/api/admin/positions?limit=100');
            if (!response.ok) throw new Error('Failed to fetch positions');
            return response.json();
        },
    });

    // Fetch problems
    const { data, isLoading, error } = useQuery<PaginationData>({
        queryKey: ['problems', page, search, difficultyFilter, departmentFilter, positionFilter, sortBy, sortOrder],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '5',
                ...(search && { search }),
                ...(difficultyFilter && { difficulty: difficultyFilter }),
                ...(departmentFilter && { departmentId: departmentFilter }),
                ...(positionFilter && { positionId: positionFilter }),
                sortBy,
                sortOrder,
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
        setDifficultyFilter('');
        setDepartmentFilter('');
        setPositionFilter('');
        setSortBy('createdAt');
        setSortOrder('desc');
        setPage(1);
    };

    const hasActiveFilters = search || difficultyFilter || departmentFilter || positionFilter || sortBy !== 'createdAt' || sortOrder !== 'desc';

    return (
        <div className="space-y-4 md:space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Problems</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
                    Manage coding problems for interviews
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                    <Input
                        placeholder="Search problems..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="w-full sm:max-w-sm"
                    />
                    
                    <Select
                        value={difficultyFilter}
                        onValueChange={(value) => {
                            setDifficultyFilter(value === 'all' ? '' : value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="All Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Difficulty</SelectItem>
                            <SelectItem value="EASY">Easy</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HARD">Hard</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={departmentFilter}
                        onValueChange={(value) => {
                            setDepartmentFilter(value === 'all' ? '' : value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departmentsData?.departments?.map((dept: { id: string; name: string }) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={positionFilter}
                        onValueChange={(value) => {
                            setPositionFilter(value === 'all' ? '' : value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="All Positions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Positions</SelectItem>
                            {positionsData?.positions?.map((pos: { id: string; name: string }) => (
                                <SelectItem key={pos.id} value={pos.id}>
                                    {pos.name}
                                </SelectItem>
                            ))}
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

                {isAdmin && (
                    <Button 
                        className="text-muted w-full sm:w-auto" 
                        onClick={() => router.push('/admin/problems/new')}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Problem
                    </Button>
                )}
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[200px]">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('title')}
                                        className="h-8 p-0 hover:bg-transparent"
                                    >
                                        Title
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="min-w-[100px]">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('difficulty')}
                                        className="h-8 p-0 hover:bg-transparent"
                                    >
                                        Difficulty
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="min-w-[150px]">Department</TableHead>
                                <TableHead className="min-w-[150px]">Position</TableHead>
                                <TableHead className="min-w-[150px]">Stacks</TableHead>
                                <TableHead className="min-w-[120px]">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('createdAt')}
                                        className="h-8 p-0 hover:bg-transparent"
                                    >
                                        Created At
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                {isAdmin && (
                                    <TableHead className="text-right min-w-[120px]">
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
                                <TableRow 
                                    key={problem.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/admin/problems/${problem.id}`)}
                                >
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(
                                                            `/admin/problems/${problem.id}`
                                                        );
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(
                                                            `/admin/problems/${problem.id}/edit`
                                                        );
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeletingProblemId(
                                                            problem.id
                                                        );
                                                    }}
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
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs md:text-sm text-muted-foreground">
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
                <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the problem.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProblem}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
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
