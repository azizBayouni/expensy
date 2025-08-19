
"use client";

import { useMemo } from 'react';
import type { Transaction, Category } from '@/types';
import { categories as allCategories } from '@/lib/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useSearchParams } from 'next/navigation';

interface CategorySpendingListProps {
  transactions: Transaction[];
  categories: Category[];
  className?: string;
  isInteractive?: boolean;
  onCategoryClick?: (categoryName: string) => void;
}

const COLORS = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
];

export function CategorySpendingList({
  transactions,
  categories,
  className,
  isInteractive = false,
  onCategoryClick,
}: CategorySpendingListProps) {
  const searchParams = useSearchParams();

  const sortedCategories = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryNameMap = new Map(allCategories.map(c => [c.name, c]));

    const spendingByCategory = new Map<string, number>();

    for (const transaction of expenseTransactions) {
      const transactionCategory = categoryNameMap.get(transaction.category);
      if (!transactionCategory) continue;

      // Find which category from the `categories` prop this transaction belongs to.
      let relevantParent = categories.find(c => c.id === transactionCategory.id);
      
      if (!relevantParent) {
         let current: Category | undefined = transactionCategory;
         while(current && current.parentId) {
             const parent = allCategories.find(c => c.id === current?.parentId);
             if (parent && categories.some(c => c.id === parent.id)) {
                 relevantParent = parent;
                 break;
             }
             current = parent;
         }
      }

      if (relevantParent) {
          spendingByCategory.set(
            relevantParent.id,
            (spendingByCategory.get(relevantParent.id) || 0) + transaction.amount
          );
      }
    }

    return categories
        .map(category => ({
          ...category,
          total: spendingByCategory.get(category.id) || 0,
        }))
        .filter(c => c.total > 0)
        .sort((a, b) => b.total - a.total);

  }, [transactions, categories]);

  if (sortedCategories.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
           <CardDescription>A detailed list of your spending.</CardDescription>
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">No spending data available.</p>
        </CardContent>
      </Card>
    );
  }

  const renderItem = (category: any, index: number) => {
    const linkHref = `/reports/category/${category.id}?${searchParams.toString()}`;

    const content = (
       <div className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-accent w-full text-left h-auto">
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-2 h-2 rounded-full ${COLORS[index % COLORS.length]}`}></div>
            <p className="font-medium flex-1 truncate">{category.name}</p>
          </div>
          <div className="flex items-center gap-2">
              <p className="font-semibold text-right">
                  {category.total.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
              </p>
          </div>
      </div>
    );

    if (isInteractive) {
      return (
        <Button
          key={category.id}
          variant="ghost"
          className="w-full h-auto justify-start p-0"
          onClick={() => onCategoryClick?.(category.name)}
        >
          {content}
        </Button>
      );
    }

    return (
      <Link href={linkHref} key={category.id} className="block">
        {content}
      </Link>
    );
  };


  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>A detailed list of your spending.</CardDescription>
      </CardHeader>
      <CardContent>
          <div className="space-y-1">
            {sortedCategories.map((cat, i) => renderItem(cat, i))}
          </div>
      </CardContent>
    </Card>
  );
}
