
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
import { categories as allCategories } from '@/lib/data';

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

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor={textAnchor}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};


export function CategoriesDonutChart({
  transactions,
  categories,
  className,
}: CategoriesDonutChartProps) {
  const { chartData, totalExpenses } = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
    
    const categoryMap = new Map(allCategories.map(c => [c.name, c.id]));
    const categoryIdMap = new Map(allCategories.map(c => [c.id, c]));

    const getRootParent = (categoryId: string): Category | undefined => {
        let current = categoryIdMap.get(categoryId);
        if (!current) return undefined;
        while (current?.parentId) {
            const parent = categoryIdMap.get(current.parentId);
            if (!parent) return current;
            current = parent;
        }
        return current;
    };
    
    const spendingByCategory = new Map<string, number>();

    for (const transaction of expenseTransactions) {
        const categoryId = categoryMap.get(transaction.category);
        if (!categoryId) continue;

        // Use the passed `categories` prop to determine which level to aggregate at.
        // This is the key change. We check if the transaction's category is one of the `categories`
        // passed to the component. If so, we aggregate under it. If not, we find its root parent.
        const relevantCategory = categories.find(c => c.id === categoryId);

        if (relevantCategory) {
            spendingByCategory.set(
              relevantCategory.name,
              (spendingByCategory.get(relevantCategory.name) || 0) + transaction.amount
            );
        } else {
             const rootParent = getRootParent(categoryId);
             if (rootParent && categories.some(c => c.id === rootParent.id)) {
                 spendingByCategory.set(
                  rootParent.name,
                  (spendingByCategory.get(rootParent.name) || 0) + transaction.amount
                );
             }
        }
    }
    
    const chartData = categories
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
          <CardDescription>Spending by category.</CardDescription>
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
        <CardDescription>Spending by category.</CardDescription>
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
                content={<ChartTooltipContent hideLabel hideIndicator />}
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
                label={renderCustomizedLabel}
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
