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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string | null;
    email: string;
    adminRole: 'ADMIN' | 'USER' | null;
    createdAt: string;
}

interface PaginationData {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Generate random gradient color based on user ID
const getGradientColor = (id: string) => {
    const gradients = [
        'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)', // Hot Pink to Purple
        'linear-gradient(135deg, #00D4FF 0%, #090979 100%)', // Cyan to Deep Blue
        'linear-gradient(135deg, #FF3CAC 0%, #784BA0 100%)', // Bright Pink to Purple
        'linear-gradient(135deg, #2AF598 0%, #009EFD 100%)', // Mint to Blue
        'linear-gradient(135deg, #FFE000 0%, #799F0C 100%)', // Yellow to Green
        'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 100%)', // Pink to Cyan
        'linear-gradient(135deg, #FF006E 0%, #FFBE0B 100%)', // Magenta to Gold
        'linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%)', // Light Blue to Lavender
        'linear-gradient(135deg, #FD1D1D 0%, #FCB045 100%)', // Red to Orange
        'linear-gradient(135deg, #C471F5 0%, #FA71CD 100%)', // Purple to Pink
        'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)', // Blue to Turquoise
        'linear-gradient(135deg, #F83600 0%, #FE8C00 100%)', // Dark Orange to Orange
        'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)', // Purple to Blue
        'linear-gradient(135deg, #FF0844 0%, #FFB199 100%)', // Red to Peach
        'linear-gradient(135deg, #00F260 0%, #0575E6 100%)', // Green to Blue
    ];
    
    // Use the ID to consistently pick the same gradient for the same user
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
};

// Get user initials for avatar
const getInitials = (name: string | null, email: string) => {
    if (name) {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }
    return email[0].toUpperCase();
};

export default function InterviewPanelPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
    });

    const isAdmin = session?.user?.adminRole === 'ADMIN';

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch users
    const { data, isLoading, error } = useQuery<PaginationData>({
        queryKey: ['interview-panel', page, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '5',
                ...(search && { search }),
            });
            const response = await fetch(
                `/api/admin/interview-panel?${params}`
            );
            if (!response.ok) throw new Error('Failed to fetch users');
            return response.json();
        },
    });

    // Create user mutation
    const createUserMutation = useMutation({
        mutationFn: async (userData: typeof newUser) => {
            const response = await fetch('/api/admin/interview-panel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create user');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interview-panel'] });
            setIsAddModalOpen(false);
            setNewUser({ name: '', email: '', password: '' });
            toast.success('User added successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Update user role mutation
    const updateUserMutation = useMutation({
        mutationFn: async ({
            id,
            adminRole,
        }: {
            id: string;
            adminRole: 'ADMIN' | 'USER';
        }) => {
            const response = await fetch(`/api/admin/interview-panel/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminRole }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update user');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interview-panel'] });
            setEditingUser(null);
            toast.success('User role updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/admin/interview-panel/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete user');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interview-panel'] });
            setDeletingUserId(null);
            toast.success('User deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const handleAddUser = () => {
        createUserMutation.mutate(newUser);
    };

    const handleUpdateRole = (adminRole: 'ADMIN' | 'USER') => {
        if (editingUser) {
            updateUserMutation.mutate({ id: editingUser.id, adminRole });
        }
    };

    const handleDeleteUser = () => {
        if (deletingUserId) {
            deleteUserMutation.mutate(deletingUserId);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Interview Panel
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage interview panel members and their roles
                </p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                    <Input
                        placeholder="Search by name or email..."
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
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                                <DialogDescription>
                                    Create a new interview panel member with
                                    USER role by default
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newUser.name}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="Enter name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder="Enter email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                password: e.target.value,
                                            })
                                        }
                                        placeholder="Enter password"
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
                                    onClick={handleAddUser}
                                    disabled={createUserMutation.isPending}
                                >
                                    {createUserMutation.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Add User
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
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
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
                                    Error loading users
                                </TableCell>
                            </TableRow>
                        ) : data?.users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={isAdmin ? 5 : 4}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback
                                                    style={{
                                                        background: getGradientColor(user.id),
                                                    }}
                                                    className="text-white text-xs font-semibold"
                                                >
                                                    {getInitials(user.name, user.email)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{user.name || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                user.adminRole === 'ADMIN'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {user.adminRole}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setEditingUser(user)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeletingUserId(
                                                            user.id
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
                        {Math.min(page * 5, data.total)} of {data.total} users
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

            {/* Edit Role Dialog */}
            <Dialog
                open={editingUser !== null}
                onOpenChange={(open) => !open && setEditingUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update User Role</DialogTitle>
                        <DialogDescription>
                            Change the role for {editingUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                                value={editingUser?.adminRole || undefined}
                                onValueChange={(value) =>
                                    handleUpdateRole(value as 'ADMIN' | 'USER')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">USER</SelectItem>
                                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditingUser(null)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deletingUserId !== null}
                onOpenChange={(open) => !open && setDeletingUserId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the user account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteUserMutation.isPending && (
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
