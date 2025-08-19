
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
import Link from 'next/link';
import { Button } from '../ui/button';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface CategorySpendingListProps {
  transactions: Transaction[];
  categories: Category[];
  className?: string;
  isInteractive?: boolean;
  onCategoryClick?: (categoryName: string) => void;
}

const getIconComponent = (icon: string | LucideIcon): LucideIcon => {
    if (typeof icon === 'function') return icon;
    return (LucideIcons[icon as keyof typeof LucideIcons] as LucideIcon) || LucideIcons.HelpCircle;
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
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    
    const getParentCategory = (categoryId: string): Category | undefined => {
      let current = categoryMap.get(categoryId);
      if (!current) return undefined;
      while (current?.parentId && categoryMap.has(current.parentId)) {
        const parent = categoryMap.get(current.parentId);
        if (!parent) break;
        current = parent;
      }
      return current;
    };
    
    const spendingByParentCategory = new Map<string, number>();

    for (const transaction of expenseTransactions) {
      const category = categories.find(c => c.name === transaction.category);
      if (category) {
        const parent = getParentCategory(category.id);
        if (parent) {
          spendingByParentCategory.set(
            parent.id,
            (spendingByParentCategory.get(parent.id) || 0) + transaction.amount
          );
        }
      }
    }

    if (isInteractive) {
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
    }

    return Array.from(spendingByParentCategory.entries())
        .map(([id, total]) => {
          const category = categoryMap.get(id);
          return {
            id,
            name: category?.name || 'Unknown',
            total,
          };
        })
        .sort((a, b) => b.total - a.total);

  }, [transactions, categories, isInteractive]);

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
