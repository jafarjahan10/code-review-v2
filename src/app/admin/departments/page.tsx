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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Department {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

interface PaginationData {
    departments: Department[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function DepartmentsPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);

    const [newDepartment, setNewDepartment] = useState({
        name: '',
        description: '',
    });

    const [editDepartment, setEditDepartment] = useState({
        name: '',
        description: '',
    });

    const isAdmin = session?.user?.adminRole === 'ADMIN';

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch departments
    const { data, isLoading, error } = useQuery<PaginationData>({
        queryKey: ['departments', page, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '5',
                ...(search && { search }),
            });
            const response = await fetch(`/api/admin/departments?${params}`);
            if (!response.ok) throw new Error('Failed to fetch departments');
            return response.json();
        },
    });

    // Create department mutation
    const createDepartmentMutation = useMutation({
        mutationFn: async (departmentData: typeof newDepartment) => {
            const response = await fetch('/api/admin/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(departmentData),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create department');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            setIsAddModalOpen(false);
            setNewDepartment({ name: '', description: '' });
            toast.success('Department added successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Update department mutation
    const updateDepartmentMutation = useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: string;
            data: typeof editDepartment;
        }) => {
            const response = await fetch(`/api/admin/departments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update department');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            setEditingDepartment(null);
            toast.success('Department updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Delete department mutation
    const deleteDepartmentMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/admin/departments/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete department');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            setDeletingDepartmentId(null);
            toast.success('Department deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const handleAddDepartment = () => {
        createDepartmentMutation.mutate(newDepartment);
    };

    const handleUpdateDepartment = () => {
        if (editingDepartment) {
            updateDepartmentMutation.mutate({ id: editingDepartment.id, data: editDepartment });
        }
    };

    const handleDeleteDepartment = () => {
        if (deletingDepartmentId) {
            deleteDepartmentMutation.mutate(deletingDepartmentId);
        }
    };

    const openEditModal = (department: Department) => {
        setEditingDepartment(department);
        setEditDepartment({
            name: department.name,
            description: department.description || '',
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Departments
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage organizational departments and units
                </p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                    <Input
                        placeholder="Search departments..."
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
                                Add Department
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Department</DialogTitle>
                                <DialogDescription>
                                    Create a new department
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newDepartment.name}
                                        onChange={(e) =>
                                            setNewDepartment({
                                                ...newDepartment,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., Engineering, Sales"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Description (Optional)
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={newDepartment.description}
                                        onChange={(e) =>
                                            setNewDepartment({
                                                ...newDepartment,
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
                                    onClick={handleAddDepartment}
                                    disabled={createDepartmentMutation.isPending}
                                >
                                    {createDepartmentMutation.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Add Department
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
                                    colSpan={isAdmin ? 4 : 3}
                                    className="text-center py-8"
                                >
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={isAdmin ? 4 : 3}
                                    className="text-center py-8 text-destructive"
                                >
                                    Error loading departments
                                </TableCell>
                            </TableRow>
                        ) : data?.departments.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={isAdmin ? 4 : 3}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    No departments found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.departments.map((department) => (
                                <TableRow key={department.id}>
                                    <TableCell className="font-medium">
                                        {department.name}
                                    </TableCell>
                                    <TableCell>
                                        {department.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            department.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        openEditModal(department)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeletingDepartmentId(
                                                            department.id
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
                        {Math.min(page * 5, data.total)} of {data.total} departments
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

            {/* Edit Department Dialog */}
            <Dialog
                open={editingDepartment !== null}
                onOpenChange={(open) => !open && setEditingDepartment(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>
                            Update department information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editDepartment.name}
                                onChange={(e) =>
                                    setEditDepartment({
                                        ...editDepartment,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="e.g., Engineering, Sales"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">
                                Description (Optional)
                            </Label>
                            <Textarea
                                id="edit-description"
                                value={editDepartment.description}
                                onChange={(e) =>
                                    setEditDepartment({
                                        ...editDepartment,
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
                            onClick={() => setEditingDepartment(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateDepartment}
                            disabled={updateDepartmentMutation.isPending}
                        >
                            {updateDepartmentMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Update Department
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deletingDepartmentId !== null}
                onOpenChange={(open) => !open && setDeletingDepartmentId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the department.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteDepartment}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteDepartmentMutation.isPending && (
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
