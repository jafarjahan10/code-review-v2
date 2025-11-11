import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CandidateViewSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <div>
                        <Skeleton className="h-9 w-[200px]" />
                        <Skeleton className="h-4 w-60 mt-2" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="h-6 w-[180px]" />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className="h-4 w-[200px]" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-4 w-16 mb-2" />
                                <Skeleton className="h-6 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Organization Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="h-6 w-[180px]" />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className="h-4 w-60" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-6 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Assessment Details Card - Full Width */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="h-6 w-[180px]" />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className="h-4 w-[280px]" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Skeleton className="h-4 w-28 mb-2" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i}>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-6 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
