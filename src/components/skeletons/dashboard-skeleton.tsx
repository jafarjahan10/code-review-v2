import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
    return (
        <div className="space-y-4 pb-6 px-4 lg:px-8">
            <div>
                <Skeleton className="h-9 w-48 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="grid gap-3 lg:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-12 auto-rows-auto lg:auto-rows-[140px]">
                {/* Stats Cards Skeleton */}
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="md:col-span-1 lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}

                {/* Chart Skeletons */}
                {[...Array(2)].map((_, i) => (
                    <Card key={`chart-${i}`} className="md:col-span-2 lg:col-span-6 lg:row-span-2">
                        <CardHeader>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-full w-full" />
                        </CardContent>
                    </Card>
                ))}

                {/* List Skeletons */}
                {[...Array(3)].map((_, i) => (
                    <Card key={`list-${i}`} className="md:col-span-2 lg:col-span-4 lg:row-span-2">
                        <CardHeader>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="flex items-center gap-2">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="flex-1">
                                            <Skeleton className="h-4 w-3/4 mb-1" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                        <Skeleton className="h-5 w-12" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
