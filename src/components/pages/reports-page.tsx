
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Analyze your financial data with detailed reports.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Content</CardTitle>
          <CardDescription>
            This is the main content area for the reports. More features will be added here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Placeholder content for the reports page.</p>
        </CardContent>
      </Card>
    </div>
  );
}
