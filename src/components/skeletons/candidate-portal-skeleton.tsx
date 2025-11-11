import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CandidatePortalSkeleton() {
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* Header Card */}
            <Card>
                <CardHeader className="space-y-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                    <div className="flex flex-wrap gap-4">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                </CardHeader>
            </Card>

            {/* Timer Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                </CardHeader>
            </Card>

            {/* Main Content Card with Tabs */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Tabs Skeleton */}
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-24" />
                    </div>

                    {/* Content Area */}
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-2/3" />
                    </div>

                    {/* Code Editor Skeleton */}
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button Skeleton */}
            <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    );
}
