import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ProblemFormSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div>
                    <Skeleton className="h-9 w-60" />
                    <Skeleton className="h-4 w-[300px] mt-2" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-40" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-[260px]" />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Grid of form fields - 2 columns */}
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>

                        {/* Stacks multi-select */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-4 w-56" />
                        </div>

                        {/* Tabs for description */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-9 w-20" />
                                <Skeleton className="h-9 w-24" />
                            </div>
                            <Skeleton className="h-[400px] w-full" />
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-4">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
