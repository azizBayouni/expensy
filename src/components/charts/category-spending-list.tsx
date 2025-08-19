
"use client";

import { useMemo } from 'react';
import type { Transaction, Category } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CategorySpendingListProps {
  transactions: Transaction[];
  categories: Category[];
  className?: string;
}

const getIconComponent = (icon: string | LucideIcon): LucideIcon => {
    if (typeof icon === 'function') return icon;
    return (LucideIcons[icon as keyof typeof LucideIcons] as LucideIcon) || LucideIcons.HelpCircle;
}

export function CategorySpendingList({
  transactions,
  categories,
  className,
}: CategorySpendingListProps) {
  const sortedCategories = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const spendingByCategory = new Map<string, number>();

    for (const transaction of expenseTransactions) {
      spendingByCategory.set(
        transaction.category,
        (spendingByCategory.get(transaction.category) || 0) + transaction.amount
      );
    }

    return categories
      .filter(c => c.type === 'expense' && spendingByCategory.has(c.name))
      .map(category => ({
        ...category,
        total: spendingByCategory.get(category.name) || 0,
      }))
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>A detailed list of your spending.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          <div className="space-y-4">
            {sortedCategories.map(category => {
                const Icon = getIconComponent(category.icon);
                const parent = categories.find(p => p.id === category.parentId);
                return (
                    <div key={category.id} className="flex items-center gap-4">
                        <div className="p-2 bg-muted/50 rounded-md">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">{category.name}</p>
                             {parent && (
                                <p className="text-xs text-muted-foreground">
                                    {parent.name}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                           <p className="font-semibold text-red-600">
                             -{category.total.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                           </p>
                        </div>
                    </div>
                );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
