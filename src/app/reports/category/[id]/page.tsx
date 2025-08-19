
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { differenceInDays, parseISO } from 'date-fns';
import { CategoriesDonutChart } from '@/components/charts/categories-donut-chart';
import { CategorySpendingList } from '@/components/charts/category-spending-list';
import type { Transaction } from '@/types';

export default function CategoryReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = useMemo(() => 
    allCategories.find(c => c.id === params.id),
    [params.id]
  );
  
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const { transactions, totalExpenses, dailyAverage, subCategories } = useMemo(() => {
    if (!category) return { transactions: [], totalExpenses: 0, dailyAverage: 0, subCategories: [] };

    const startDate = from ? parseISO(from) : new Date(0);
    const endDate = to ? parseISO(to) : new Date();

    const childrenCategories = allCategories.filter(c => c.parentId === category.id);
    const categoryNames = [category.name, ...childrenCategories.map(c => c.name)];

    const filteredTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return categoryNames.includes(t.category) &&
             transactionDate >= startDate &&
             transactionDate <= endDate;
    });

    const total = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

    const days = differenceInDays(endDate, startDate) + 1;
    const average = days > 0 ? total / days : 0;
    
    // For the charts, we only want to show the sub-categories, or the main category if it has no children
    const relevantCategories = childrenCategories.length > 0 ? childrenCategories : [category];
    const relevantTransactions = childrenCategories.length > 0 
        ? filteredTransactions.filter(t => t.category !== category.name)
        : filteredTransactions;


    return { 
        transactions: relevantTransactions, 
        totalExpenses: total, 
        dailyAverage: average, 
        subCategories: relevantCategories 
    };
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
                Total amount spent in the '{category.name}' category and its sub-categories for the selected period.
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

       <Tabs defaultValue="breakdown">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="breakdown">
             <div className="grid gap-6 mt-6 md:grid-cols-2">
                <CategoriesDonutChart 
                    transactions={transactions} 
                    categories={subCategories}
                />
                <CategorySpendingList
                    transactions={transactions}
                    categories={subCategories}
                />
             </div>
          </TabsContent>
          <TabsContent value="transactions">
            <Card>
                <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>A list of all transactions in this category for the period.</CardDescription>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground">Transaction list will be implemented here.</p>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
