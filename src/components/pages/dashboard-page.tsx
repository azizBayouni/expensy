
"use client";

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
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
import { ArrowDown, ArrowUp, DollarSign, PlusCircle } from 'lucide-react';
import { transactions as initialTransactions, budgets, categories as allCategories, updateTransactions } from '@/lib/data';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, format, subMonths } from 'date-fns';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { TransactionForm } from '../transaction-form';

export function DashboardPage() {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const { totalBalance, totalIncome, totalExpense, recentTransactions } = useMemo(() => {
        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const endOfCurrentMonth = endOfMonth(now);

        const currentMonthTransactions = transactions.filter(t => {
            const transactionDate = parseISO(t.date);
            return transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth;
        });

        const totalBalance = transactions.reduce((acc, t) => {
            return t.type === 'income' ? acc + t.amount : acc - t.amount;
        }, 0);

        const totalIncome = currentMonthTransactions
            .filter((t) => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const totalExpense = currentMonthTransactions
            .filter((t) => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        const recentTransactions = [...transactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
        
        return { totalBalance, totalIncome, totalExpense, recentTransactions };
    }, [transactions]);

    const budgetChartData = useMemo(() => {
        return budgets.map(budget => {
            const today = new Date();
            let startDate, endDate;

            if (budget.period === 'monthly') {
                startDate = startOfMonth(today);
                endDate = endOfMonth(today);
            } else {
                startDate = startOfYear(today);
                endDate = endOfYear(today);
            }

            const category = allCategories.find(c => c.id === budget.categoryId);
            if (!category) return { name: budget.name, budgeted: budget.amount, spent: 0 };

            const descendantIds = new Set<string>();
            const getDescendants = (catId: string) => {
                descendantIds.add(catId);
                const children = allCategories.filter(c => c.parentId === catId);
                children.forEach(child => getDescendants(child.id));
            };
            getDescendants(category.id);
            
            const descendantCategoryNames = Array.from(descendantIds)
                .map(id => allCategories.find(c => c.id === id)?.name)
                .filter((name): name is string => !!name);

            const spent = transactions
                .filter((t) => {
                    const transactionDate = parseISO(t.date);
                    return (
                        t.type === 'expense' &&
                        descendantCategoryNames.includes(t.category) &&
                        transactionDate >= startDate &&
                        transactionDate <= endDate
                    );
                })
                .reduce((acc, t) => acc + t.amount, 0);
            
            return {
                name: budget.name,
                budgeted: budget.amount,
                spent: spent,
            };
        });
    }, [budgets, transactions, allCategories]);
    
    const saveTransactions = (newTransactions: Transaction[]) => {
      updateTransactions(newTransactions);
      setTransactions(newTransactions);
    };

    const handleAddTransaction = () => {
        setSelectedTransaction(null);
        setSheetOpen(true);
    };

    const handleFormSubmit = (data: Transaction) => {
        let newTransactions: Transaction[];
        if (selectedTransaction) {
        newTransactions = transactions.map((t) =>
            t.id === selectedTransaction.id ? { ...t, ...data } : t
        );
        } else {
        newTransactions = [{ ...data, id: `trx-${Date.now()}` }, ...transactions];
        }
        saveTransactions(newTransactions);
        setSheetOpen(false);
    };

    const handleDeleteTransaction = (id: string) => {
        const newTransactions = transactions.filter((t) => t.id !== id);
        saveTransactions(newTransactions);
        setSheetOpen(false);
    };


  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            A quick overview of your financial status.
          </p>
        </div>
        <Button onClick={handleAddTransaction}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">Across all wallets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <ArrowUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{totalIncome.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
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
              -{totalExpense.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budgets vs. Actuals</CardTitle>
            <CardDescription>
              How your spending compares to your budgets this period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                budgeted: { label: 'Budgeted', color: 'hsl(var(--chart-2))' },
                spent: { label: 'Spent', color: 'hsl(var(--chart-1))' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={budgetChartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={80} tickFormatter={(value) => value.toLocaleString()} />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Legend />
                <Bar dataKey="budgeted" fill="var(--color-budgeted)" radius={4} />
                <Bar dataKey="spent" radius={4}>
                  {budgetChartData.map((entry, index) => {
                    const percentage = entry.budgeted > 0 ? (entry.spent / entry.budgeted) * 100 : 0;
                    let color = 'hsl(var(--chart-1))'; // Default color
                    if (percentage > 100) {
                      color = 'hsl(var(--destructive))'; // Red for over budget
                    } else if (percentage >= 90) {
                      color = 'hsl(var(--chart-4))'; // Orange for nearing budget
                    }
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
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
                      {transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>
              {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </SheetTitle>
            <SheetDescription>
              {selectedTransaction
                ? 'Update the details of your transaction.'
                : 'Add a new transaction to your records.'}
            </SheetDescription>
          </SheetHeader>
          <TransactionForm
            onSubmit={handleFormSubmit}
            transaction={selectedTransaction}
            onDelete={handleDeleteTransaction}
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
