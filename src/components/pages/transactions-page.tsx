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
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { TransactionForm } from '@/components/transaction-form';
import { transactions as initialTransactions, categories, wallets } from '@/lib/data';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

export function TransactionsPage() {
  const [transactions, setTransactions] =
    React.useState<Transaction[]>(initialTransactions);
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [walletFilter, setWalletFilter] = React.useState('all');
  const [dateFilter, setDateFilter] = React.useState<DateRange | undefined>();

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
          t.id === selectedTransaction.id ? { ...data } : t
        )
      );
    } else {
      setTransactions([...transactions, { ...data, id: `trx-${Date.now()}` }]);
    }
    setSheetOpen(false);
  };

  const filteredTransactions = transactions
    .filter((t) => {
      const searchTerm = search.toLowerCase();
      return (
        t.description.toLowerCase().includes(searchTerm) ||
        t.category.toLowerCase().includes(searchTerm)
      );
    })
    .filter((t) => categoryFilter === 'all' || t.category === categoryFilter)
    .filter((t) => walletFilter === 'all' || t.wallet === walletFilter)
    .filter((t) => {
      if (!dateFilter?.from) return true;
      const transactionDate = new Date(t.date);
      if (dateFilter.to) {
        return transactionDate >= dateFilter.from && transactionDate <= dateFilter.to;
      }
      return format(transactionDate, 'yyyy-MM-dd') === format(dateFilter.from, 'yyyy-MM-dd');
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
        <p className="text-muted-foreground">
          Here's a list of all your transactions.
        </p>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:flex-1">
           <Input
            placeholder="Search by description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
           <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={walletFilter} onValueChange={setWalletFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Wallets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wallets</SelectItem>
              {wallets.map((w) => (
                <SelectItem key={w.id} value={w.name}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full md:w-[240px] justify-start text-left font-normal',
                  !dateFilter && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter?.from ? (
                  dateFilter.to ? (
                    <>
                      {format(dateFilter.from, 'LLL dd, y')} -{' '}
                      {format(dateFilter.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateFilter.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={handleAddTransaction} className="w-full md:w-auto">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead>Event</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id} onClick={() => handleEditTransaction(transaction)} className="cursor-pointer">
                <TableCell>{format(new Date(transaction.date), 'dd MMM yyyy')}</TableCell>
                <TableCell className="font-medium">
                  {transaction.description}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.category}</Badge>
                </TableCell>
                <TableCell>{transaction.wallet}</TableCell>
                <TableCell>{transaction.event || '—'}</TableCell>
                <TableCell
                  className={cn(
                    'text-right font-semibold',
                    transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}
                >
                  {transaction.type === 'income' ? '+' : ''}
                  {transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-8 h-8 p-0" onClick={(e) => e.stopPropagation()}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); handleEditTransaction(transaction); }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(transaction.id); }}
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
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
