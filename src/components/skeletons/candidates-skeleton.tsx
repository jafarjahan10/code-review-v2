import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function CandidatesSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-9 w-[200px]" />
                    <Skeleton className="h-4 w-[300px] mt-2" />
                </div>
                <Skeleton className="h-10 w-[140px]" />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Skeleton className="h-9 w-full sm:max-w-sm" />
                <Skeleton className="h-9 w-full sm:w-[200px]" />
                <Skeleton className="h-9 w-full sm:w-[200px]" />
                <Skeleton className="h-9 w-full sm:w-[180px]" />
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
                                <Skeleton className="h-4 w-24" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-24" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-20" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-20" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-20" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-20" />
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
                                    <div className="flex items-center gap-3 h-11">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                </TableCell>
                                {/* Access Code */}
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </TableCell>
                                {/* Department */}
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                {/* Position */}
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                {/* Problem */}
                                <TableCell>
                                    <Skeleton className="h-4 w-28" />
                                </TableCell>
                                {/* Scheduled */}
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                {/* End Time */}
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                {/* Status */}
                                <TableCell>
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </TableCell>
                                {/* Actions */}
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
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
