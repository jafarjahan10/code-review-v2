/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Copy, Check, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    departmentId: z.string().min(1, 'Department is required'),
    positionId: z.string().min(1, 'Position is required'),
    problemId: z.string().min(1, 'Problem is required'),
    scheduledTime: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditCandidatePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();
    const [regeneratePassword, setRegeneratePassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [copiedPassword, setCopiedPassword] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            departmentId: '',
            positionId: '',
            problemId: '',
            scheduledTime: undefined,
        },
    });

    // Fetch candidate data
    const { data: candidate, isLoading } = useQuery({
        queryKey: ['candidate', id],
        queryFn: async () => {
            const response = await fetch(`/api/admin/candidates/${id}`);
            if (!response.ok) throw new Error('Failed to fetch candidate');
            return response.json();
        },
    });

    // Fetch departments
    const { data: departments } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const response = await fetch('/api/admin/departments');
            if (!response.ok) throw new Error('Failed to fetch departments');
            return response.json();
        },
    });

    // Fetch positions filtered by department
    const selectedDepartmentId = form.watch('departmentId');
    const { data: positions } = useQuery({
        queryKey: ['positions', selectedDepartmentId],
        queryFn: async () => {
            if (!selectedDepartmentId) return [];
            const response = await fetch(
                `/api/admin/positions?departmentId=${selectedDepartmentId}`
            );
            if (!response.ok) throw new Error('Failed to fetch positions');
            return response.json();
        },
        enabled: !!selectedDepartmentId,
    });

    // Fetch problems filtered by position
    const selectedPositionId = form.watch('positionId');
    const { data: problems } = useQuery({
        queryKey: ['problems', selectedPositionId],
        queryFn: async () => {
            if (!selectedPositionId) return [];
            const response = await fetch(
                `/api/admin/problems?positionId=${selectedPositionId}`
            );
            if (!response.ok) throw new Error('Failed to fetch problems');
            return response.json();
        },
        enabled: !!selectedPositionId,
    });

    // Populate form when candidate data loads
    useEffect(() => {
        if (candidate) {
            const scheduledTime = new Date(candidate.scheduledTime);

            form.reset({
                name: candidate.name,
                departmentId: candidate.departmentId,
                positionId: candidate.positionId,
                problemId: candidate.problemId,
                scheduledTime: scheduledTime,
            });
        }
    }, [candidate, form]);

    const updateMutation = useMutation({
        mutationFn: async (
            data: FormValues & { regeneratePassword?: boolean }
        ) => {
            const response = await fetch(`/api/admin/candidates/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    scheduledTime: data.scheduledTime.toISOString(),
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update candidate');
            }
            return response.json();
        },
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: ['candidate', id] });
            queryClient.invalidateQueries({ queryKey: ['candidates'] });

            if (data.generatedPassword) {
                setNewPassword(data.generatedPassword);
                toast.success('Candidate updated and new password generated');
            } else {
                toast.success('Candidate updated successfully');
                router.push('/admin/candidates');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const onSubmit = (data: FormValues) => {
        updateMutation.mutate({
            ...data,
            regeneratePassword,
        });
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(newPassword);
        setCopiedPassword(true);
        toast.success('Password copied to clipboard');
        setTimeout(() => setCopiedPassword(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-lg text-muted-foreground">
                    Candidate not found
                </p>
                <Button onClick={() => router.push('/admin/candidates')}>
                    Back to Candidates
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/admin/candidates')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Candidate</h1>
                    <p className="text-muted-foreground">
                        Update candidate information
                    </p>
                </div>
            </div>

            {newPassword && (
                <Card className="border-primary">
                    <CardHeader>
                        <CardTitle>New Access Code Generated</CardTitle>
                        <CardDescription>
                            Share this access code with the candidate. It will not
                            be shown again.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Input
                                value={newPassword}
                                readOnly
                                className="font-mono text-lg"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopyPassword}
                            >
                                {copiedPassword ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Candidate Information</CardTitle>
                    <CardDescription>
                        Update the candidate details
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
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel>
                                        Email (Cannot be changed)
                                    </FormLabel>
                                    <Input value={candidate.email} disabled />
                                </div>

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
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a department" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {departments?.departments?.map(
                                                        (dept: any) => (
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
                                                onValueChange={value => {
                                                    field.onChange(value);
                                                    form.setValue(
                                                        'problemId',
                                                        ''
                                                    );
                                                }}
                                                value={field.value}
                                                disabled={!selectedDepartmentId}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a position" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {positions?.positions?.map(
                                                        (pos: any) => (
                                                            <SelectItem
                                                                key={pos.id}
                                                                value={pos.id}
                                                            >
                                                                {pos.name}
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
                                    name="problemId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Assigned Problem
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!selectedPositionId}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a problem" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {problems?.problems?.map(
                                                        (problem: any) => (
                                                            <SelectItem
                                                                key={problem.id}
                                                                value={
                                                                    problem.id
                                                                }
                                                            >
                                                                {problem.title}
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
                                    name="scheduledTime"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>
                                                Scheduled Time
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={'outline'}
                                                            className={cn(
                                                                'w-full pl-3 text-left font-normal',
                                                                !field.value &&
                                                                    'text-muted-foreground'
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(
                                                                    field.value,
                                                                    'PPP p'
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Pick a date
                                                                    and time
                                                                </span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0 max-h-[480px] overflow-y-auto flex"
                                                    align="start"
                                                    side="bottom"
                                                    sideOffset={4}
                                                >
                                                    <div className="max-h-[380px] overflow-y-auto">
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                field.value
                                                            }
                                                            onSelect={date => {
                                                                if (date) {
                                                                    const currentTime =
                                                                        field.value ||
                                                                        new Date();
                                                                    date.setHours(
                                                                        currentTime.getHours()
                                                                    );
                                                                    date.setMinutes(
                                                                        currentTime.getMinutes()
                                                                    );
                                                                    field.onChange(
                                                                        date
                                                                    );
                                                                }
                                                            }}
                                                            disabled={date =>
                                                                date <
                                                                new Date(
                                                                    new Date().setHours(
                                                                        0,
                                                                        0,
                                                                        0,
                                                                        0
                                                                    )
                                                                )
                                                            }
                                                            initialFocus
                                                        />
                                                    </div>
                                                    <div className="border-l p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="time"
                                                                value={
                                                                    field.value
                                                                        ? format(
                                                                              field.value,
                                                                              'HH:mm'
                                                                          )
                                                                        : ''
                                                                }
                                                                onChange={e => {
                                                                    const [
                                                                        hours,
                                                                        minutes,
                                                                    ] =
                                                                        e.target.value.split(
                                                                            ':'
                                                                        );
                                                                    const newDate =
                                                                        field.value ||
                                                                        new Date();
                                                                    newDate.setHours(
                                                                        parseInt(
                                                                            hours
                                                                        )
                                                                    );
                                                                    newDate.setMinutes(
                                                                        parseInt(
                                                                            minutes
                                                                        )
                                                                    );
                                                                    field.onChange(
                                                                        newDate
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {candidate.submissionTime && (
                                <div className="space-y-2">
                                    <FormLabel>
                                        Submission Time (Read-only)
                                    </FormLabel>
                                    <Input
                                        value={new Date(
                                            candidate.submissionTime
                                        ).toLocaleString()}
                                        disabled
                                    />
                                </div>
                            )}

                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="regeneratePassword"
                                        checked={regeneratePassword}
                                        onCheckedChange={checked =>
                                            setRegeneratePassword(
                                                checked === true
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="regeneratePassword"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Regenerate access code (5 random letters)
                                    </label>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Check this box if you want to generate a new
                                    access code for the candidate
                                </p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.push('/admin/candidates')
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending
                                        ? 'Updating...'
                                        : 'Update Candidate'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
