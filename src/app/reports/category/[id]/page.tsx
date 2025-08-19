
"use client";

import { useMemo } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { transactions as allTransactions, categories as allCategories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { differenceInDays, parseISO } from 'date-fns';

export default function CategoryReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = useMemo(() => 
    allCategories.find(c => c.id === params.id),
    [params.id]
  );

  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const { totalExpenses, dailyAverage } = useMemo(() => {
    if (!category) return { totalExpenses: 0, dailyAverage: 0 };

    const startDate = from ? parseISO(from) : new Date(0);
    const endDate = to ? parseISO(to) : new Date();

    const filteredTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.category === category.name &&
             transactionDate >= startDate &&
             transactionDate <= endDate;
    });

    const total = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

    const days = differenceInDays(endDate, startDate) + 1;
    const average = days > 0 ? total / days : 0;

    return { totalExpenses: total, dailyAverage: average };
  }, [category, from, to]);


  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-2xl font-bold">Category Report: {category.name}</h1>
            <p className="text-muted-foreground">
                Detailed view of your spending for this category.
            </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
            <CardDescription>
                Total amount spent in the '{category.name}' category for the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
                {totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily Average</CardTitle>
             <CardDescription>
                Average daily spending for this category over the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-3xl font-bold">
                {dailyAverage.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
             </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for transaction list or further charts */}
       <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>A list of all transactions in this category for the period.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Transaction list will be implemented here.</p>
        </CardContent>
      </Card>

    </div>
  );
}
