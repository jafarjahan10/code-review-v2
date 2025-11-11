import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function ProblemsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-9 w-[180px]" />
                    <Skeleton className="h-4 w-[280px] mt-2" />
                </div>
                <Skeleton className="h-10 w-full sm:w-[140px]" />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Skeleton className="h-10 w-full sm:max-w-sm" />
                <Skeleton className="h-10 w-full sm:w-[150px]" />
                <Skeleton className="h-10 w-full sm:w-[180px]" />
                <Skeleton className="h-10 w-full sm:w-[180px]" />
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-24" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-16" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-24" />
                                </TableHead>
                                <TableHead className="text-right">
                                    <Skeleton className="h-4 w-16 ml-auto" />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {/* Title */}
                                    <TableCell>
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </TableCell>
                                    {/* Difficulty */}
                                    <TableCell>
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </TableCell>
                                    {/* Department */}
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    {/* Position */}
                                    <TableCell>
                                        <Skeleton className="h-4 w-28" />
                                    </TableCell>
                                    {/* Stacks */}
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            <Skeleton className="h-5 w-12 rounded-full" />
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </div>
                                    </TableCell>
                                    {/* Created At */}
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    {/* Actions */}
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Skeleton className="h-9 w-9" />
                                            <Skeleton className="h-9 w-9" />
                                            <Skeleton className="h-9 w-9" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-[180px]" />
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
