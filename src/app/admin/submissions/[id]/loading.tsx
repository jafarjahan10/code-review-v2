import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function SubmissionDetailLoading() {
    return (
        <div className="space-y-6">
            {/* Back Button and Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-20" />
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
            </div>

            {/* Top Section - Candidate and Problem Details */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Candidate Info */}
                        <div className="space-y-4">
                            <Skeleton className="h-5 w-32 mb-4" />
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        </div>

                        {/* Problem Info */}
                        <div className="space-y-4">
                            <Skeleton className="h-5 w-32 mb-4" />
                            <div className="flex items-start justify-between">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                            <div className="flex gap-2 pt-2">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Section - Code and Remarks */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Submitted Code */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-40 mb-2" />
                        <Skeleton className="h-4 w-56" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-24" />
                                <Skeleton className="h-9 w-24" />
                            </div>
                            <Skeleton className="h-[500px] w-full rounded-md" />
                        </div>
                    </CardContent>
                </Card>

                {/* Remarks Column */}
                <div className="space-y-6">
                    {/* Existing Remarks */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="space-y-3 pb-4 border-b last:border-0">
                                        <div className="flex items-start gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-40" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-16 w-full" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Remark Form */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
