# Loading Skeleton Implementation Guide

All `loading.tsx` files have been removed from the application. Instead, we now use React Query's `isLoading` state with custom skeleton components.

## Available Skeleton Components

Located in `src/components/skeletons/`:

1. **DashboardSkeleton** - For the admin dashboard page
2. **TableSkeleton** - For list/table pages (candidates, submissions, problems, etc.)
3. **FormSkeleton** - For form pages (new/edit pages)

## Usage Pattern

### For Table/List Pages:

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { TableSkeleton } from '@/components/skeletons';

export default function YourPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['your-key'],
        queryFn: async () => {
            const response = await fetch('/api/your-endpoint');
            if (!response.ok) throw new Error('Failed to fetch');
            return response.json();
        },
    });

    if (isLoading) {
        return <TableSkeleton rows={10} columns={6} />;
    }

    if (!data) {
        return <div>No data found</div>;
    }

    // Render your content
    return <div>{/* Your content */}</div>;
}
```

### For Form Pages:

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { FormSkeleton } from '@/components/skeletons';

export default function EditPage({ params }: { params: { id: string } }) {
    const { data, isLoading } = useQuery({
        queryKey: ['item', params.id],
        queryFn: async () => {
            const response = await fetch(`/api/items/${params.id}`);
            if (!response.ok) throw new Error('Failed to fetch');
            return response.json();
        },
    });

    if (isLoading) {
        return <FormSkeleton />;
    }

    // Render your form
    return <div>{/* Your form */}</div>;
}
```

## Pages That Need Updates

The following pages need to be updated to use skeleton components:

### Admin Section:
- ✅ `/admin` - Already using DashboardSkeleton
- `/admin/candidates` - Use TableSkeleton
- `/admin/candidates/[id]` - Use FormSkeleton
- `/admin/candidates/[id]/edit` - Use FormSkeleton
- `/admin/candidates/new` - Use FormSkeleton
- `/admin/problems` - Use TableSkeleton
- `/admin/problems/[id]` - Use FormSkeleton
- `/admin/problems/[id]/edit` - Use FormSkeleton
- `/admin/problems/new` - Use FormSkeleton
- `/admin/submissions` - Use TableSkeleton
- `/admin/submissions/[id]` - Use FormSkeleton
- `/admin/departments` - Use TableSkeleton
- `/admin/positions` - Use TableSkeleton
- `/admin/stacks` - Use TableSkeleton
- `/admin/interview-panel` - Use TableSkeleton
- `/admin/settings` - Use FormSkeleton

### Candidate Section:
- `/login` - Custom loading (usually simple spinner)
- `/` - Custom dashboard-like skeleton

## Creating Custom Skeletons

If you need a custom skeleton for a specific page:

```typescript
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CustomSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}
```

## Benefits

1. **Consistent UX**: All pages now have proper loading states
2. **Better Performance Perception**: Skeletons show content structure while loading
3. **No More Route Loading Issues**: React Query handles loading state correctly
4. **Reusable Components**: Skeleton components can be shared across pages
5. **Type-Safe**: Works perfectly with TypeScript and React Query

## Implementation Checklist

When updating a page:
- [ ] Import appropriate skeleton component
- [ ] Replace loading spinner with skeleton in `if (isLoading)` block
- [ ] Test loading state (you can slow down network in DevTools)
- [ ] Verify skeleton matches the actual page layout
