
"use client";

import { useMemo } from 'react';
import type { Transaction, Category } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface CategoriesDonutChartProps {
  transactions: Transaction[];
  categories: Category[];
  className?: string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function CategoriesDonutChart({
  transactions,
  categories,
  className,
}: CategoriesDonutChartProps) {
  const { chartData, totalExpenses } = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

    const categoryMap = new Map(categories.map(c => [c.name, c]));
    const parentCategories = categories.filter(c => !c.parentId && c.type === 'expense');

    const getParentCategory = (categoryName: string): Category | undefined => {
      let current = categoryMap.get(categoryName);
      while (current?.parentId) {
        const parent = categories.find(c => c.id === current.parentId);
        if (!parent) return current;
        current = parent;
      }
      return current;
    };

    const spendingByCategory = new Map<string, number>();

    for (const transaction of expenseTransactions) {
      const parent = getParentCategory(transaction.category);
      if (parent) {
        spendingByCategory.set(
          parent.name,
          (spendingByCategory.get(parent.name) || 0) + transaction.amount
        );
      }
    }

    const chartData = parentCategories
      .map(category => ({
        name: category.name,
        value: spendingByCategory.get(category.name) || 0,
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return { chartData, totalExpenses };
  }, [transactions, categories]);

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Spending by parent category.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-60 items-center justify-center">
          <p className="text-muted-foreground">No expense data for this period.</p>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = Object.fromEntries(
    chartData.map((item, index) => [
        item.name,
        {
          label: item.name,
          color: COLORS[index % COLORS.length],
        },
    ])
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Spending by parent category.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full relative"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={5}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold">
              {totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </p>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
