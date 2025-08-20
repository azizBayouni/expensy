
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
  'hsl(var(--chart-2))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill } = props;
  const RADIAN = Math.PI / 180;
  // Increase the radius multiplier to push labels further out
  const radius = innerRadius + (outerRadius - innerRadius) * 1.6; 
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
      {`${(percent * 100).toFixed(0)}%`}
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
    
    const categoryIdMap = new Map(allCategories.map(c => [c.id, c]));

    const getDescendantIds = (categoryId: string): Set<string> => {
        const ids = new Set<string>();
        const queue = [categoryId];
        while(queue.length > 0) {
            const currentId = queue.shift()!;
            ids.add(currentId);
            const children = allCategories.filter(c => c.parentId === currentId);
            children.forEach(child => queue.push(child.id));
        }
        return ids;
    };
    
    const spendingByCategory = new Map<string, number>();
    
    // We only want to display top-level categories
    const topLevelCategories = categories.filter(c => !c.parentId);

    for (const category of topLevelCategories) {
      const descendantIds = getDescendantIds(category.id);
      const descendantNames = Array.from(descendantIds)
          .map(id => categoryIdMap.get(id)?.name)
          .filter((name): name is string => !!name);

      const categoryTotal = expenseTransactions
          .filter(t => descendantNames.includes(t.category))
          .reduce((acc, t) => acc + t.amount, 0);
      
      if (categoryTotal > 0) {
        spendingByCategory.set(category.name, categoryTotal);
      }
    }
    
    const chartData = Array.from(spendingByCategory.entries())
      .map(([name, value]) => ({ name, value }))
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
                label={chartData.length > 1 ? renderCustomizedLabel : false}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold">
              {totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </p>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
