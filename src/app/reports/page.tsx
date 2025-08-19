import * as React from 'react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportsPage } from '@/components/pages/reports-page';

function ReportsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-1/4" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <Suspense fallback={<ReportsLoading />}>
      <ReportsPage />
    </Suspense>
  );
}
