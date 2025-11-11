import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    showHeader?: boolean;
    showActions?: boolean;
}

export function TableSkeleton({ 
    rows = 5, 
    columns = 5, 
    showHeader = true,
    showActions = true 
}: TableSkeletonProps) {
    return (
        <div className="space-y-4">
            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        {showHeader && (
                            <TableHeader>
                                <TableRow>
                                    {[...Array(columns)].map((_, i) => (
                                        <TableHead key={i}>
                                            <Skeleton className="h-4 w-20" />
                                        </TableHead>
                                    ))}
                                    {showActions && (
                                        <TableHead>
                                            <Skeleton className="h-4 w-16" />
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                        )}
                        <TableBody>
                            {[...Array(rows)].map((_, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {[...Array(columns)].map((_, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                    {showActions && (
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Skeleton className="h-8 w-8" />
                                                <Skeleton className="h-8 w-8" />
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>
        </div>
    );
}
