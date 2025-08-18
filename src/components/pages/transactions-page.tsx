
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
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { TransactionForm } from '@/components/transaction-form';
import { transactions as initialTransactions, categories, wallets, updateTransactions, events as eventData } from '@/lib/data';
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useTravelMode } from '@/hooks/use-travel-mode';

export function TransactionsPage() {
  const [transactions, setTransactions] =
    React.useState<Transaction[]>(initialTransactions);
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string[]>([]);
  const [walletFilter, setWalletFilter] = React.useState('all');
  const [dateFilter, setDateFilter] = React.useState<DateRange | undefined>();

  const [isSheetOpen, setSheetOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaction | null>(null);

  const { isLoaded: isTravelModeLoaded } = useTravelMode();

  React.useEffect(() => {
    // This is a mock to simulate data fetching and updates.
    setTransactions(initialTransactions);
  }, [initialTransactions]);


  const saveTransactions = (newTransactions: Transaction[]) => {
    updateTransactions(newTransactions);
    setTransactions(newTransactions);
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setSheetOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSheetOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    const transactionToDelete = transactions.find(t => t.id === id);
    if (transactionToDelete) {
        const wallet = wallets.find(w => w.name === transactionToDelete.wallet);
        if (wallet) {
            const newBalance = transactionToDelete.type === 'income'
                ? wallet.balance - transactionToDelete.amount
                : wallet.balance + transactionToDelete.amount;
            // This part is tricky without a proper backend. We're assuming direct mutation for prototype purposes.
            wallet.balance = newBalance;
        }
    }

    const newTransactions = transactions.filter((t) => t.id !== id);
    saveTransactions(newTransactions);
    setSheetOpen(false);
  };

  const handleFormSubmit = (data: Transaction) => {
    let newTransactions: Transaction[];
    if (selectedTransaction) {
      newTransactions = transactions.map((t) =>
        t.id === selectedTransaction.id ? { ...t, ...data } : t
      );
    } else {
      newTransactions = [...transactions, { ...data, id: `trx-${Date.now()}` }];
    }
    saveTransactions(newTransactions);
    setSheetOpen(false);
  };
  
  const handleCategoryFilterChange = (categoryName: string) => {
    setCategoryFilter(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const filteredTransactions = transactions
    .filter((t) => {
      const searchTerm = search.toLowerCase();
      return (
        t.description.toLowerCase().includes(searchTerm) ||
        t.category.toLowerCase().includes(searchTerm)
      );
    })
    .filter((t) => categoryFilter.length === 0 || categoryFilter.includes(t.category))
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
           <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full md:w-[200px] justify-between"
                >
                    <span>
                        {categoryFilter.length === 0 
                            ? "All Categories" 
                            : categoryFilter.length === 1
                            ? categoryFilter[0]
                            : `${categoryFilter.length} selected`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full md:w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                            {categories.map((cat) => (
                                <CommandItem
                                    key={cat.id}
                                    onSelect={() => handleCategoryFilterChange(cat.name)}
                                    className="cursor-pointer"
                                >
                                    <div className={cn(
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        categoryFilter.includes(cat.name)
                                            ? "bg-primary text-primary-foreground"
                                            : "opacity-50 [&_svg]:invisible"
                                    )}>
                                       <Check className={cn("h-4 w-4")} />
                                    </div>
                                    <span>{cat.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
           </Popover>
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
        <Button onClick={handleAddTransaction} className="w-full md:w-auto" disabled={!isTravelModeLoaded}>
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
            {filteredTransactions.map((transaction) => {
              const event = eventData.find(e => e.id === transaction.event);
              return (
              <TableRow key={transaction.id} onClick={() => handleEditTransaction(transaction)} className="cursor-pointer">
                <TableCell>{format(new Date(transaction.date), 'dd MMM yyyy')}</TableCell>
                <TableCell className="font-medium">
                  {transaction.description}
                  {transaction.originalAmount && (
                    <p className="text-xs text-muted-foreground">
                        Original: {transaction.originalAmount.toFixed(2)} {transaction.currency}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.category}</Badge>
                </TableCell>
                <TableCell>{transaction.wallet}</TableCell>
                <TableCell>{event?.name || '—'}</TableCell>
                <TableCell
                  className={cn(
                    'text-right font-semibold',
                    transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
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
            )})}
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
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
