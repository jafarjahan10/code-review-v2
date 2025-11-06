'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Department {
    id: string;
    name: string;
}

interface Position {
    id: string;
    name: string;
    description: string | null;
    departmentId: string;
    department: Department;
    createdAt: string;
    updatedAt: string;
}

interface PaginationData {
    positions: Position[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function PositionsPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);
    const [deletingPositionId, setDeletingPositionId] = useState<string | null>(null);

    const [newPosition, setNewPosition] = useState({
        name: '',
        description: '',
        departmentId: '',
    });

    const [editPosition, setEditPosition] = useState({
        name: '',
        description: '',
        departmentId: '',
    });

    const isAdmin = session?.user?.userType === 'ADMIN';

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

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
    const { data, isLoading, error } = useQuery<PaginationData>({
        queryKey: ['positions', page, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '5',
                ...(search && { search }),
            });
            const response = await fetch(`/api/admin/positions?${params}`);
            if (!response.ok) throw new Error('Failed to fetch positions');
            return response.json();
        },
    });

    // Create position mutation
    const createPositionMutation = useMutation({
        mutationFn: async (positionData: typeof newPosition) => {
            const response = await fetch('/api/admin/positions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(positionData),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create position');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['positions'] });
            setIsAddModalOpen(false);
            setNewPosition({ name: '', description: '', departmentId: '' });
            toast.success('Position added successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Update position mutation
    const updatePositionMutation = useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: string;
            data: typeof editPosition;
        }) => {
            const response = await fetch(`/api/admin/positions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update position');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['positions'] });
            setEditingPosition(null);
            toast.success('Position updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Delete position mutation
    const deletePositionMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/admin/positions/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete position');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['positions'] });
            setDeletingPositionId(null);
            toast.success('Position deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const handleAddPosition = () => {
        createPositionMutation.mutate(newPosition);
    };

    const handleUpdatePosition = () => {
        if (editingPosition) {
            updatePositionMutation.mutate({ id: editingPosition.id, data: editPosition });
        }
    };

    const handleDeletePosition = () => {
        if (deletingPositionId) {
            deletePositionMutation.mutate(deletingPositionId);
        }
    };

    const openEditModal = (position: Position) => {
        setEditingPosition(position);
        setEditPosition({
            name: position.name,
            description: position.description || '',
            departmentId: position.departmentId,
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Positions
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage positions across departments
                </p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                    <Input
                        placeholder="Search positions..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>

                {isAdmin && (
                    <Dialog
                        open={isAddModalOpen}
                        onOpenChange={setIsAddModalOpen}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Position
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Position</DialogTitle>
                                <DialogDescription>
                                    Create a new position under a department
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        value={newPosition.departmentId}
                                        onValueChange={(value) =>
                                            setNewPosition({
                                                ...newPosition,
                                                departmentId: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departmentsData?.departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newPosition.name}
                                        onChange={(e) =>
                                            setNewPosition({
                                                ...newPosition,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., Senior Developer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Description (Optional)
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={newPosition.description}
                                        onChange={(e) =>
                                            setNewPosition({
                                                ...newPosition,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Enter description"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddPosition}
                                    disabled={createPositionMutation.isPending}
                                >
                                    {createPositionMutation.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Add Position
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Description</TableHead>
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
                                    colSpan={isAdmin ? 5 : 4}
                                    className="text-center py-8"
                                >
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={isAdmin ? 5 : 4}
                                    className="text-center py-8 text-destructive"
                                >
                                    Error loading positions
                                </TableCell>
                            </TableRow>
                        ) : data?.positions.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={isAdmin ? 5 : 4}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    No positions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.positions.map((position) => (
                                <TableRow key={position.id}>
                                    <TableCell className="font-medium">
                                        {position.name}
                                    </TableCell>
                                    <TableCell>
                                        {position.department.name}
                                    </TableCell>
                                    <TableCell>
                                        {position.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            position.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        openEditModal(position)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeletingPositionId(
                                                            position.id
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
                        {Math.min(page * 5, data.total)} of {data.total} positions
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

            {/* Edit Position Dialog */}
            <Dialog
                open={editingPosition !== null}
                onOpenChange={(open) => !open && setEditingPosition(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Position</DialogTitle>
                        <DialogDescription>
                            Update position information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-department">Department</Label>
                            <Select
                                value={editPosition.departmentId}
                                onValueChange={(value) =>
                                    setEditPosition({
                                        ...editPosition,
                                        departmentId: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departmentsData?.departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editPosition.name}
                                onChange={(e) =>
                                    setEditPosition({
                                        ...editPosition,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="e.g., Senior Developer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">
                                Description (Optional)
                            </Label>
                            <Textarea
                                id="edit-description"
                                value={editPosition.description}
                                onChange={(e) =>
                                    setEditPosition({
                                        ...editPosition,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Enter description"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditingPosition(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdatePosition}
                            disabled={updatePositionMutation.isPending}
                        >
                            {updatePositionMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Update Position
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deletingPositionId !== null}
                onOpenChange={(open) => !open && setDeletingPositionId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the position.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePosition}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deletePositionMutation.isPending && (
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
