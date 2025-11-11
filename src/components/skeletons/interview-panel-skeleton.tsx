import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function InterviewPanelSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Skeleton className="h-9 w-[200px]" />
                <Skeleton className="h-4 w-[340px] mt-2" />
            </div>

            {/* Search and Button */}
            <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-full max-w-md" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Skeleton className="h-4 w-16" />
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
                                {/* User with avatar */}
                                <TableCell>
                                    <div className="flex items-center gap-3 h-8">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="">
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                </TableCell>
                                {/* Email */}
                                <TableCell>
                                    <Skeleton className="h-4 w-40" />
                                </TableCell>
                                {/* Role */}
                                <TableCell>
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </TableCell>
                                {/* Created At */}
                                <TableCell>
                                    <Skeleton className="h-4 w-28" />
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
