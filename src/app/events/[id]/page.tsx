
"use client";

import { useMemo, useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { transactions as allTransactions, events as allEvents, updateTransactions, categories as allCategories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { differenceInDays, parseISO, format } from 'date-fns';
import type { Transaction, Event as EventType } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn, getIconComponent } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { TransactionForm } from '@/components/transaction-form';

export default function EventReportPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(allTransactions);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const event = useMemo(() => 
    allEvents.find(e => e.id === id),
    [id]
  );

  const { totalExpenses, filteredTransactions, startDate, endDate } = useMemo(() => {
    if (!event) return { totalExpenses: 0, filteredTransactions: [], startDate: null, endDate: null };

    const eventTransactions = transactions.filter(t => t.event === event.id && t.type === 'expense');

    if (eventTransactions.length === 0) {
      return { totalExpenses: 0, filteredTransactions: [], startDate: null, endDate: null };
    }

    const total = eventTransactions.reduce((acc, t) => acc + t.amount, 0);

    const dates = eventTransactions.map(t => parseISO(t.date));
    const start = dates.reduce((a, b) => a < b ? a : b);
    const end = dates.reduce((a, b) => a > b ? a : b);
    
    return { 
      totalExpenses: total, 
      filteredTransactions: eventTransactions,
      startDate: start,
      endDate: end,
    };
  }, [event, transactions]);

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSheetOpen(true);
  };
  
  const handleFormSubmit = (data: Transaction) => {
    const newTransactions = transactions.map((t) => (t.id === data.id ? data : t));
    updateTransactions(newTransactions);
    setTransactions(newTransactions);
    setSheetOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    const newTransactions = transactions.filter((t) => t.id !== id);
    updateTransactions(newTransactions);
    setTransactions(newTransactions);
    setSheetOpen(false);
  };

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{event.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <p className="text-muted-foreground">{event.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
              {totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Event Duration</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-xl font-bold">
              {startDate && endDate ? `${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}` : 'N/A'}
             </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            A list of all transactions for this event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const transactionCategory = allCategories.find(c => c.name === transaction.category);
                  const TransactionIcon = transactionCategory ? getIconComponent(transactionCategory.icon) : null;
                  return (
                    <TableRow key={transaction.id} onClick={() => handleEditTransaction(transaction)} className="cursor-pointer">
                      <TableCell>{format(parseISO(transaction.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-2">
                          {TransactionIcon && <TransactionIcon className="h-4 w-4" />}
                          <span>{transaction.category}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className={cn("text-right font-semibold", 'text-red-500')}>
                        -{transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredTransactions.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                No transactions found for this event.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Edit Transaction</SheetTitle>
            <SheetDescription>Update the details of your transaction.</SheetDescription>
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
