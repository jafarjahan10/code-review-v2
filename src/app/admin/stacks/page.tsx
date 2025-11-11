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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { StacksSkeleton } from '@/components/skeletons';

interface Stack {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

interface PaginationData {
    stacks: Stack[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function StacksPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingStack, setEditingStack] = useState<Stack | null>(null);
    const [deletingStackId, setDeletingStackId] = useState<string | null>(null);

    const [newStack, setNewStack] = useState({
        name: '',
        description: '',
    });

    const [editStack, setEditStack] = useState({
        name: '',
        description: '',
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

    // Fetch stacks
    const { data, isLoading, error } = useQuery<PaginationData>({
        queryKey: ['stacks', page, search, limit],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
            });
            const response = await fetch(`/api/admin/stacks?${params}`);
            if (!response.ok) throw new Error('Failed to fetch stacks');
            return response.json();
        },
    });

    // Create stack mutation
    const createStackMutation = useMutation({
        mutationFn: async (stackData: typeof newStack) => {
            const response = await fetch('/api/admin/stacks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stackData),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create stack');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stacks'] });
            setIsAddModalOpen(false);
            setNewStack({ name: '', description: '' });
            toast.success('Stack added successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Update stack mutation
    const updateStackMutation = useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: string;
            data: typeof editStack;
        }) => {
            const response = await fetch(`/api/admin/stacks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update stack');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stacks'] });
            setEditingStack(null);
            toast.success('Stack updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Delete stack mutation
    const deleteStackMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/admin/stacks/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete stack');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stacks'] });
            setDeletingStackId(null);
            toast.success('Stack deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const handleAddStack = () => {
        createStackMutation.mutate(newStack);
    };

    const handleUpdateStack = () => {
        if (editingStack) {
            updateStackMutation.mutate({
                id: editingStack.id,
                data: editStack,
            });
        }
    };

    const handleDeleteStack = () => {
        if (deletingStackId) {
            deleteStackMutation.mutate(deletingStackId);
        }
    };

    const openEditModal = (stack: Stack) => {
        setEditingStack(stack);
        setEditStack({
            name: stack.name,
            description: stack.description || '',
        });
    };

    return (
        <div className="space-y-6">
            {isLoading ? (
                <StacksSkeleton />
            ) : (
                <>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Technology Stacks
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage technology stacks and frameworks
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                            <Input
                                placeholder="Search stacks..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                            />
                        </div>

                        {isAdmin && (
                            <Dialog
                                open={isAddModalOpen}
                                onOpenChange={setIsAddModalOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button className="text-muted">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Stack
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Stack</DialogTitle>
                                        <DialogDescription>
                                            Create a new technology stack
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                value={newStack.name}
                                                onChange={e =>
                                                    setNewStack({
                                                        ...newStack,
                                                        name: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., React, Node.js"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">
                                                Description (Optional)
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={newStack.description}
                                                onChange={e =>
                                                    setNewStack({
                                                        ...newStack,
                                                        description:
                                                            e.target.value,
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
                                            onClick={() =>
                                                setIsAddModalOpen(false)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="text-muted"
                                            onClick={handleAddStack}
                                            disabled={
                                                createStackMutation.isPending
                                            }
                                        >
                                            {createStackMutation.isPending && (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            )}
                                            Add Stack
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
                                {error ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={isAdmin ? 4 : 3}
                                            className="text-center py-8 text-destructive"
                                        >
                                            Error loading stacks
                                        </TableCell>
                                    </TableRow>
                                ) : data?.stacks.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={isAdmin ? 4 : 3}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            No stacks found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.stacks.map(stack => (
                                        <TableRow key={stack.id}>
                                            <TableCell className="font-medium">
                                                {stack.name}
                                            </TableCell>
                                            <TableCell>
                                                {stack.description || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    stack.createdAt
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    stack
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                setDeletingStackId(
                                                                    stack.id
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
                    {data && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(page - 1) * limit + 1} to{' '}
                                    {Math.min(page * limit, data.total)} of{' '}
                                    {data.total} stacks
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
                            {data.totalPages > 1 && (
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
                            )}
                        </div>
                    )}

                    {/* Edit Stack Dialog */}
                    <Dialog
                        open={editingStack !== null}
                        onOpenChange={open => !open && setEditingStack(null)}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Stack</DialogTitle>
                                <DialogDescription>
                                    Update stack information
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={editStack.name}
                                        onChange={e =>
                                            setEditStack({
                                                ...editStack,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., React, Node.js"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-description">
                                        Description (Optional)
                                    </Label>
                                    <Textarea
                                        id="edit-description"
                                        value={editStack.description}
                                        onChange={e =>
                                            setEditStack({
                                                ...editStack,
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
                                    onClick={() => setEditingStack(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateStack}
                                    disabled={updateStackMutation.isPending}
                                >
                                    {updateStackMutation.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Update Stack
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog
                        open={deletingStackId !== null}
                        onOpenChange={open => !open && setDeletingStackId(null)}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the stack.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteStack}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {deleteStackMutation.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
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
