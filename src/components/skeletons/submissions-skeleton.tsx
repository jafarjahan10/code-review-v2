import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function SubmissionsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-9 w-[200px]" />
                    <Skeleton className="h-4 w-[300px] mt-2" />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Skeleton className="h-10 w-full sm:max-w-sm" />
                <Skeleton className="h-10 w-full sm:w-[200px]" />
                <Skeleton className="h-10 w-full sm:w-[180px]" />
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Skeleton className="h-4 w-20" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-16" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-16" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-20" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-28" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-16" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-16" />
                            </TableHead>
                            <TableHead className="text-right">
                                <Skeleton className="h-4 w-16 ml-auto" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                {/* Candidate with avatar */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                </TableCell>
                                {/* Problem */}
                                <TableCell className='space-y-2.5'>
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                {/* Position */}
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                {/* Department */}
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                {/* Submission Time */}
                                <TableCell>
                                    <Skeleton className="h-4 w-32" />
                                </TableCell>
                                {/* Remarks */}
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                {/* Status */}
                                <TableCell>
                                    <div className="flex justify-center">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                    </div>
                                </TableCell>
                                {/* Actions */}
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Skeleton className="h-9 w-9" />
                                        <Skeleton className="h-9 w-9" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-[200px]" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-[70px]" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                </div>
            </div>
        </div>
    );
}
