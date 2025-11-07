import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function LoginLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Card className="w-full max-w-[420px] rounded-lg border border-border bg-card p-8">
                <CardHeader className="text-center space-y-2 px-0">
                    <Skeleton className="h-8 w-32 mx-auto" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                </CardHeader>
                <CardContent className="px-0">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full mt-6" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
