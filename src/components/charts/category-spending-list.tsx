
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
import { ChevronRight } from 'lucide-react';
import { cn, getIconComponent } from '@/lib/utils';

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
    const categoryIdMap = new Map(allCategories.map(c => [c.id, c]));

    const getDescendantIds = (categoryId: string): Set<string> => {
        const ids = new Set<string>([categoryId]);
        const queue = [categoryId];
        while(queue.length > 0) {
            const currentId = queue.shift()!;
            const children = allCategories.filter(c => c.parentId === currentId);
            children.forEach(child => {
              ids.add(child.id);
              queue.push(child.id);
            });
        }
        return ids;
    };
    
    const spendingByCategory = new Map<string, number>();

    for (const category of categories) {
        const descendantIds = getDescendantIds(category.id);
        const descendantNames = Array.from(descendantIds)
            .map(id => categoryIdMap.get(id)?.name)
            .filter((name): name is string => !!name);
        
        const total = expenseTransactions
            .filter(t => descendantNames.includes(t.category))
            .reduce((acc, t) => acc + t.amount, 0);

        if (total > 0) {
            spendingByCategory.set(category.id, total);
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
    const IconComponent = getIconComponent(category.icon);

    const content = (
       <div className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-accent w-full text-left h-auto">
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-2 h-2 rounded-full ${COLORS[index % COLORS.length]}`}></div>
            <IconComponent className="w-5 h-5 text-muted-foreground" />
            <p className="font-medium flex-1 truncate">{category.name}</p>
          </div>
          <div className="flex items-center gap-2">
              <p className={cn("font-semibold text-right", isInteractive && "text-red-500")}>
                  {category.total.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
              </p>
              {!isInteractive && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              {isInteractive && <ChevronRight className="h-4 w-4 text-red-500" />}
          </div>
      </div>
    );

    if (isInteractive) {
      const hasChildren = allCategories.some(c => c.parentId === category.id);
      if (hasChildren) {
        // This is a sub-category on the detail page, which can be drilled down further.
        return (
          <Link href={linkHref} key={category.id} className="block">
            {content}
          </Link>
        )
      }
      // This is a sub-category with no more children, or a category on the main page with no drilldown behavior defined here.
      // It becomes a button to filter transactions.
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

    // Default behavior for main reports page: always a link.
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
