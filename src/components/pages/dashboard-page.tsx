"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, DollarSign } from 'lucide-react';
import { transactions } from '@/lib/data';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { month: 'Jan', income: 4000, expense: 2400 },
  { month: 'Feb', income: 3000, expense: 1398 },
  { month: 'Mar', income: 5000, expense: 9800 },
  { month: 'Apr', income: 2780, expense: 3908 },
  { month: 'May', income: 1890, expense: 4800 },
  { month: 'Jun', income: 2390, expense: 3800 },
  { month: 'Jul', income: 5250, expense: 1950 },
];

export function DashboardPage() {
  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
    
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBalance.toLocaleString()} SAR
            </div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <ArrowUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{totalIncome.toLocaleString()} SAR
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <ArrowDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              -{totalExpense.toLocaleString()} SAR
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income vs. Expense</CardTitle>
            <CardDescription>
              A look at your financial flow over the past months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                income: { label: 'Income', color: 'hsl(var(--chart-2))' },
                expense: { label: 'Expense', color: 'hsl(var(--chart-1))' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest financial activities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {transaction.amount.toFixed(2)} SAR
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
