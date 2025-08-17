"use client";

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  MoreHorizontal,
  PlusCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { TransactionForm } from '@/components/transaction-form';
import { transactions as initialTransactions } from '@/lib/data';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

export function TransactionsPage() {
  const [transactions, setTransactions] =
    React.useState<Transaction[]>(initialTransactions);
  const [search, setSearch] = React.useState('');
  const [isSheetOpen, setSheetOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaction | null>(null);

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setSheetOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSheetOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleFormSubmit = (data: Transaction) => {
    if (selectedTransaction) {
      setTransactions(
        transactions.map((t) =>
          t.id === selectedTransaction.id ? { ...t, ...data } : t
        )
      );
    } else {
      setTransactions([...transactions, { ...data, id: Date.now().toString() }]);
    }
    setSheetOpen(false);
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleAddTransaction}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {transaction.type === 'income' ? (
                      <ArrowUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowDown className="w-5 h-5 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.wallet}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold',
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {transaction.type === 'income' ? '+' : '-'}$
                    {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-8 h-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
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
          />
        </SheetContent>
      </Sheet>
    </Card>
  );
}
