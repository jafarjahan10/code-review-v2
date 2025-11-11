import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CandidateFormSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div>
                    <Skeleton className="h-9 w-[280px]" />
                    <Skeleton className="h-4 w-[340px] mt-2" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-[200px]" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-[280px]" />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Grid of form fields - 2 columns */}
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>

                        {/* Full width fields */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-full" />
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-4 pt-4">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-40" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
