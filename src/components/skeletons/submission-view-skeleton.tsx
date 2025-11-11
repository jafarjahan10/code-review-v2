import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function SubmissionViewSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" disabled>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <Skeleton className="h-9 w-60 mb-2" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>

            {/* Top Section - Candidate and Problem Details */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Candidate Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-4 w-56" />
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Skeleton className="h-4 w-16 mb-1" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <div>
                                    <Skeleton className="h-4 w-20 mb-1" />
                                    <Skeleton className="h-5 w-36" />
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <Skeleton className="h-4 w-48 mb-2" />
                                <Skeleton className="h-10 w-60 rounded-md" />
                            </div>
                        </div>

                        <Separator className="md:hidden" />

                        {/* Problem Details */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-9 w-full" />
                            </div>
                            <Separator />
                            <div>
                                <Skeleton className="h-4 w-32 mb-2" />
                                <div className="flex flex-wrap gap-2">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                            </div>
                            <div>
                                <Skeleton className="h-4 w-24 mb-1" />
                                <Skeleton className="h-5 w-44" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Two Column Layout - Code and Remarks */}
            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                {/* Left Column - Submitted Code */}
                <Card>
                    <CardHeader>
                        <CardTitle>Submitted Code</CardTitle>
                        <CardDescription>
                            Solutions for each stack
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="tab1">
                            <TabsList className="w-full justify-start">
                                <TabsTrigger value="tab1" disabled>
                                    <Skeleton className="h-4 w-16" />
                                </TabsTrigger>
                                <TabsTrigger value="tab2" disabled>
                                    <Skeleton className="h-4 w-20" />
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="tab1" className="mt-4">
                                <Skeleton className="w-full h-[500px] rounded-md" />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Right Column - Interviewer Remarks */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interviewer Remarks</CardTitle>
                            <CardDescription>
                                Feedback from the interview panel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Remark Item 1 */}
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-40" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-16 w-full rounded-md" />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Remark Item 2 */}
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Skeleton className="h-4 w-28" />
                                                    <Skeleton className="h-3 w-36" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-20 w-full rounded-md" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Remark Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Remark</CardTitle>
                            <CardDescription>
                                Provide feedback for this submission
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-24 w-full rounded-md" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-sm" />
                                    <Skeleton className="h-4 w-52" />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Skeleton className="h-9 w-20" />
                                    <Skeleton className="h-9 w-28" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
