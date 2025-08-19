
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

export function CategorySpendingList({
  transactions,
  categories,
  className,
  isInteractive = false,
  onCategoryClick,
}: CategorySpendingListProps) {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const sortedCategories = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const spendingByCategory = new Map<string, number>();

    for (const transaction of expenseTransactions) {
      spendingByCategory.set(
        transaction.category,
        (spendingByCategory.get(transaction.category) || 0) + transaction.amount
      );
    }
    
    const relevantCategories = categories.filter(c => 
        c.type === 'expense' && (spendingByCategory.has(c.name) || c.parentId)
    );

    const getParentCategory = (categoryName: string): Category | undefined => {
      let current = categories.find(c => c.name === categoryName);
      while (current?.parentId) {
        const parent = categories.find(c => c.id === current.parentId);
        if (!parent) return current;
        current = parent;
      }
      return current;
    };
    
    const spendingByParentCategory = new Map<string, { total: number; children: Set<string> }>();

    for (const transaction of expenseTransactions) {
      const parent = getParentCategory(transaction.category);
      if (parent) {
        const current = spendingByParentCategory.get(parent.name) || { total: 0, children: new Set() };
        current.total += transaction.amount;
        if(transaction.category !== parent.name) {
            current.children.add(transaction.category);
        }
        spendingByParentCategory.set(parent.name, current);
      }
    }
    
    if (isInteractive) {
       return categories
        .filter(c => c.type === 'expense' && spendingByCategory.has(c.name))
        .map(category => ({
          ...category,
          total: spendingByCategory.get(category.name) || 0,
        }))
        .sort((a, b) => b.total - a.total);
    }

    return Array.from(spendingByParentCategory.entries())
        .map(([name, data]) => ({
            name,
            total: data.total,
            id: categories.find(c => c.name === name)?.id || name,
        }))
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

  const renderItem = (category: any) => {
    const Icon = getIconComponent(category.icon || 'HelpCircle');
    const parent = categories.find(p => p.id === category.parentId);
    const linkHref = `/reports/category/${category.id}?from=${from || ''}&to=${to || ''}`;

    const content = (
      <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 w-full text-left h-auto">
        <div className="p-2 bg-muted/50 rounded-md">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{category.name}</p>
          {parent && (
            <p className="text-xs text-muted-foreground">{parent.name}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-semibold text-red-600">
            -{category.total.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
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
        <ScrollArea className="h-[350px]">
          <div className="space-y-1">
            {sortedCategories.map(renderItem)}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
