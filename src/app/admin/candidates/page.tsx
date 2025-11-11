'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Pencil, Plus, Trash2, Copy, ArrowUpDown, X } from 'lucide-react';
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

interface Candidate {
    id: string;
    name: string;
    email: string;
    password: string;
    scheduledTime: string;
    endTime: string;
    submissionTime: string | null;
    department: { name: string };
    position: { name: string };
    problem: { title: string };
}

export default function AdminCandidates() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    
    // Initialize state from URL params
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [departmentFilter, setDepartmentFilter] = useState(searchParams.get('departmentId') || '');
    const [positionFilter, setPositionFilter] = useState(searchParams.get('positionId') || '');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc');
    const [candidateToDelete, setCandidateToDelete] = useState<string | null>(
        null
    );

    // Update URL when state changes
    useEffect(() => {
        const params = new URLSearchParams();
        
        if (page !== 1) params.set('page', page.toString());
        if (search) params.set('search', search);
        if (departmentFilter) params.set('departmentId', departmentFilter);
        if (positionFilter) params.set('positionId', positionFilter);
        if (statusFilter) params.set('status', statusFilter);
        if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
        if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

        const queryString = params.toString();
        const newUrl = queryString ? `/admin/candidates?${queryString}` : '/admin/candidates';
        
        router.replace(newUrl, { scroll: false });
    }, [page, search, departmentFilter, positionFilter, statusFilter, sortBy, sortOrder, router]);

    // Generate avatar gradient based on name
    const getAvatarGradient = (name: string) => {
        const gradients = [
            'bg-gradient-to-br from-purple-400 to-pink-600',
            'bg-gradient-to-br from-blue-400 to-cyan-600',
            'bg-gradient-to-br from-green-400 to-emerald-600',
            'bg-gradient-to-br from-orange-400 to-red-600',
            'bg-gradient-to-br from-yellow-400 to-amber-600',
            'bg-gradient-to-br from-indigo-400 to-purple-600',
            'bg-gradient-to-br from-pink-400 to-rose-600',
            'bg-gradient-to-br from-teal-400 to-green-600',
        ];
        const index = name.charCodeAt(0) % gradients.length;
        return gradients[index];
    };

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Copy password to clipboard
    const copyPassword = (password: string) => {
        navigator.clipboard.writeText(password);
        toast.success('Password copied to clipboard');
    };

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

    const { data, isLoading } = useQuery({
        queryKey: ['candidates', page, search, departmentFilter, positionFilter, statusFilter, sortBy, sortOrder],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '5',
                ...(search && { search }),
                ...(departmentFilter && { departmentId: departmentFilter }),
                ...(positionFilter && { positionId: positionFilter }),
                ...(statusFilter && { status: statusFilter }),
                sortBy,
                sortOrder,
            });
            const response = await fetch(`/api/admin/candidates?${params}`);
            if (!response.ok) throw new Error('Failed to fetch candidates');
            return response.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/admin/candidates/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete candidate');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            toast.success('Candidate deleted successfully');
            setCandidateToDelete(null);
        },
        onError: () => {
            toast.error('Failed to delete candidate');
        },
    });

    const handleDelete = () => {
        if (candidateToDelete) {
            deleteMutation.mutate(candidateToDelete);
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
        setDepartmentFilter('');
        setPositionFilter('');
        setStatusFilter('');
        setSortBy('createdAt');
        setSortOrder('desc');
        setPage(1);
    };

    const hasActiveFilters = search || departmentFilter || positionFilter || statusFilter || sortBy !== 'createdAt' || sortOrder !== 'desc';

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
                    <h1 className="text-3xl font-bold">Candidates</h1>
                    <p className="text-muted-foreground">
                        Manage candidates for technical assessments
                    </p>
                </div>
                <Button
                    className="text-muted"
                    onClick={() => router.push('/admin/candidates/new')}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Candidate
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Input
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="max-w-sm"
                />
                
                <Select
                    value={departmentFilter}
                    onValueChange={(value) => {
                        setDepartmentFilter(value === 'all' ? '' : value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
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
                    <SelectTrigger className="w-full sm:w-[200px]">
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

                <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                        setStatusFilter(value === 'all' ? '' : value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
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
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('name')}
                                            className="hover:bg-transparent p-0 h-auto font-semibold"
                                        >
                                            Candidate
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Access Code</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Problem</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('scheduledTime')}
                                            className="hover:bg-transparent p-0 h-auto font-semibold"
                                        >
                                            Scheduled
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('endTime')}
                                            className="hover:bg-transparent p-0 h-auto font-semibold"
                                        >
                                            End Time
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.candidates.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="text-center"
                                        >
                                            No candidates found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.candidates.map(
                                        (candidate: Candidate) => (
                                            <TableRow 
                                                key={candidate.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => router.push(`/admin/candidates/${candidate.id}`)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback
                                                                className={getAvatarGradient(
                                                                    candidate.name
                                                                )}
                                                            >
                                                                <span className="text-white font-semibold">
                                                                    {getInitials(
                                                                        candidate.name
                                                                    )}
                                                                </span>
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">
                                                                {candidate.name}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <span>{candidate.email}</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigator.clipboard.writeText(candidate.email);
                                                                        toast.success('Email copied to clipboard');
                                                                    }}
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm">
                                                            {candidate.password}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyPassword(
                                                                    candidate.password
                                                                );
                                                            }}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {candidate.department.name}
                                                </TableCell>
                                                <TableCell>
                                                    {candidate.position.name}
                                                </TableCell>
                                                <TableCell>
                                                    {candidate.problem.title}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(
                                                        candidate.scheduledTime
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(
                                                        candidate.endTime
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {candidate.submissionTime ? (
                                                        <Badge variant="default">
                                                            Submitted
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(
                                                                    `/admin/candidates/${candidate.id}`
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
                                                                    `/admin/candidates/${candidate.id}/edit`
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
                                                                setCandidateToDelete(
                                                                    candidate.id
                                                                );
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {(page - 1) * 5 + 1} to{' '}
                                {Math.min(page * 5, data.total)} of {data.total}{' '}
                                candidates
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
                </>
            )}

            <AlertDialog
                open={candidateToDelete !== null}
                onOpenChange={() => setCandidateToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the candidate and all associated data.
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
