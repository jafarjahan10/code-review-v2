/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Copy, Check, CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { generatePassword, cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    departmentId: z.string().min(1, 'Department is required'),
    positionId: z.string().min(1, 'Position is required'),
    problemId: z.string().min(1, 'Problem is required'),
    scheduledTime: z.date(),
    endTime: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewCandidatePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [copiedPassword, setCopiedPassword] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            departmentId: '',
            positionId: '',
            problemId: '',
            scheduledTime: undefined,
            endTime: undefined,
        },
    });

    // Generate password on component mount
    useEffect(() => {
        setGeneratedPassword(generatePassword(5));
    }, []);

    // Watch scheduledTime and auto-set endTime to 4 hours later
    const scheduledTime = form.watch('scheduledTime');
    useEffect(() => {
        if (scheduledTime) {
            const endTime = new Date(scheduledTime);
            endTime.setHours(endTime.getHours() + 4);
            form.setValue('endTime', endTime);
        }
    }, [scheduledTime, form]);

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

    const createMutation = useMutation({
        mutationFn: async (data: FormValues) => {
            const response = await fetch('/api/admin/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    password: generatedPassword,
                    scheduledTime: data.scheduledTime.toISOString(),
                    endTime: data.endTime.toISOString(),
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create candidate');
            }
            return response.json();
        },
        onSuccess: data => {
            // Invalidate candidates query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            toast.success('Candidate created successfully');
            // Show the generated password from the response
            if (data.generatedPassword) {
                setGeneratedPassword(data.generatedPassword);
            }
            router.push('/admin/candidates');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const onSubmit = (data: FormValues) => {
        createMutation.mutate(data);
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(generatedPassword);
        setCopiedPassword(true);
        toast.success('Password copied to clipboard');
        setTimeout(() => setCopiedPassword(false), 2000);
    };

    const handleRegeneratePassword = () => {
        setGeneratedPassword(generatePassword(5));
        toast.success('New password generated');
    };

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
                    <h1 className="text-3xl font-bold">Add New Candidate</h1>
                    <p className="text-muted-foreground">
                        Create a new candidate for technical assessment
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Candidate Information</CardTitle>
                    <CardDescription>
                        Fill in the details for the new candidate
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
                                                <Input
                                                    placeholder="John Doe"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                                                        <SelectValue placeholder="Select department" />
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
                                                        <SelectValue placeholder="Select position" />
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
                                                        <SelectValue placeholder="Select problem" />
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

                                <FormField
                                    control={form.control}
                                    name="endTime"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>
                                                End Time
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
                                                    <div className="p-3 border-l">
                                                        <div className="space-y-2">
                                                            <div className="text-sm font-medium">
                                                                Time
                                                            </div>
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

                            <div className="space-y-2">
                                <FormLabel>Generated Access Code</FormLabel>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={generatedPassword}
                                        readOnly
                                        className="font-mono text-lg"
                                    />
                                    <Button
                                        type="button"
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
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleRegeneratePassword}
                                    >
                                        Regenerate
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    This access code will be shared with the
                                    candidate to access their test
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
                                    className="text-muted"
                                    type="submit"
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending && <Loader2 className='animate-spin' />} Create Candidate 
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
