import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProblemViewSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <div>
                        <Skeleton className="h-9 w-[280px]" />
                        <Skeleton className="h-4 w-40 mt-2" />
                    </div>
                </div>
                <Skeleton className="h-10 w-[140px]" />
            </div>

            <div className="grid gap-6">
                {/* Problem Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="h-6 w-[200px]" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Skeleton className="h-4 w-16 mb-2" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <div>
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                            <div>
                                <Skeleton className="h-4 w-16 mb-2" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                            <div>
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </div>
                        <div>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Problem Description Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="h-6 w-[180px]" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
