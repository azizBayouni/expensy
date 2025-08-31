
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { notFound, useRouter, useSearchParams, useParams, usePathname } from 'next/navigation';
import { transactions as allTransactions, categories as allCategories, updateTransactions, wallets as allWallets } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronsUpDown, Check, CalendarIcon, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { differenceInDays, parseISO, format, startOfDay, endOfDay, add, sub, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { CategoriesDonutChart } from '@/components/charts/categories-donut-chart';
import { CategorySpendingList } from '@/components/charts/category-spending-list';
import type { Transaction, Category } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn, getIconComponent, getWalletIcon } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { TransactionForm } from '@/components/transaction-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { TimeRangePicker, type TimeRange } from '@/components/ui/time-range-picker';
import { DateRange } from 'react-day-picker';
import Link from 'next/link';

export default function CategoryReportPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('breakdown');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(allTransactions);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [dateOffset, setDateOffset] = useState(0);

  // Effect to set state from URL search params on initial load
  useEffect(() => {
    const wallets = searchParams.get('wallets');
    const range = searchParams.get('timeRange') as TimeRange;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const offset = searchParams.get('offset');

    if (wallets) {
      setSelectedWallets(wallets.split(','));
    } else {
      setSelectedWallets(allWallets.map(w => w.id));
    }

    if (range) {
      setTimeRange(range);
    }

    if (range === 'custom' && from && to) {
      setCustomDateRange({ from: new Date(from), to: new Date(to) });
    }
    
    if (offset) {
      setDateOffset(parseInt(offset, 10));
    }
  }, [searchParams]);

  const { category, breadcrumbs } = useMemo(() => {
    const cat = allCategories.find(c => c.id === id);
    if (!cat) return { category: null, breadcrumbs: [] };

    const crumbs = [];
    let current: Category | undefined = cat;
    while(current) {
        crumbs.unshift(current);
        current = current.parentId ? allCategories.find(c => c.id === current.parentId) : undefined;
    }
    return { category: cat, breadcrumbs: crumbs };
  }, [id]);
  
  const { startDate, endDate } = useMemo(() => {
      let start: Date, end: Date;
      const now = new Date();

      if (timeRange === 'custom' && customDateRange?.from && customDateRange?.to) {
          start = startOfDay(customDateRange.from);
          end = endOfDay(customDateRange.to);
      } else {
            const unit = timeRange === 'day' ? 'days' : timeRange === 'week' ? 'weeks' : timeRange === 'month' ? 'months' : 'years';
          const dateWithOffset = dateOffset !== 0 ? (dateOffset > 0 ? add(now, { [unit]: dateOffset }) : sub(now, { [unit]: Math.abs(dateOffset) })) : now;
          
          switch (timeRange) {
              case 'day':
                  start = startOfDay(dateWithOffset);
                  end = endOfDay(dateWithOffset);
                  break;
              case 'week':
                  start = startOfWeek(dateWithOffset);
                  end = endOfWeek(dateWithOffset);
                  break;
              case 'month':
                  start = startOfMonth(dateWithOffset);
                  end = endOfMonth(dateWithOffset);
                  break;
              case 'year':
                  start = startOfYear(dateWithOffset);
                  end = endOfYear(dateWithOffset);
                  break;
              case 'all':
              default:
                  start = new Date(0);
                  end = new Date();
                  break;
          }
      }
      return { startDate: start, endDate: end };
  }, [timeRange, customDateRange, dateOffset]);

  // Effect to update URL when state changes
  useEffect(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (selectedWallets.length > 0 && selectedWallets.length < allWallets.length) {
          params.set('wallets', selectedWallets.join(','));
      } else {
        params.delete('wallets');
      }
      
      params.set('timeRange', timeRange);
      
      if (startDate && endDate && timeRange !== 'all') {
          params.set('from', startDate.toISOString());
          params.set('to', endDate.toISOString());
      } else {
          params.delete('from');
          params.delete('to');
      }

      if (dateOffset !== 0 && timeRange !== 'all' && timeRange !== 'custom') {
          params.set('offset', dateOffset.toString());
      } else {
          params.delete('offset');
      }

      // We only want to persist the main ID in the URL path, not the drill-down state.
      // So we use router.replace with the current path, but only update query params.
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedWallets, timeRange, startDate, endDate, dateOffset, pathname, router, searchParams]);

  const { totalExpenses, dailyAverage, subCategories, filteredTransactions } = useMemo(() => {
    if (!category) return { totalExpenses: 0, dailyAverage: 0, subCategories: [], filteredTransactions: [] };

    const selectedWalletNames = allWallets.filter(w => selectedWallets.includes(w.id)).map(w => w.name);

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

    const allRelatedTransactions = transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      const categoryName = t.category;
      
      return selectedWalletNames.includes(t.wallet) &&
             descendantCategoryNames.includes(categoryName) &&
             transactionDate >= startDate &&
             transactionDate <= endDate &&
             t.type === 'expense';
    });

    const total = allRelatedTransactions.reduce((acc, t) => acc + t.amount, 0);

    const days = differenceInDays(endDate, startDate) + 1;
    const average = days > 0 ? total / days : 0;
    
    const directChildren = allCategories.filter(c => c.parentId === category.id);
    
    return { 
        totalExpenses: total, 
        dailyAverage: average, 
        subCategories: directChildren,
        filteredTransactions: allRelatedTransactions,
    };
  }, [category, startDate, endDate, transactions, selectedWallets]);

  const tableTransactions = useMemo(() => {
      if (selectedSubCategory) {
          const subCatAndDescendantsIds = new Set<string>();
          const getSubCatDescendants = (catName: string) => {
              const cat = allCategories.find(c => c.name === catName);
              if (!cat) return;
              subCatAndDescendantsIds.add(cat.id);
              const children = allCategories.filter(c => c.parentId === cat.id);
              children.forEach(child => getSubCatDescendants(child.name));
          };
          getSubCatDescendants(selectedSubCategory);

          const subCatAndDescendantsNames = Array.from(subCatAndDescendantsIds)
              .map(id => allCategories.find(c => c.id === id)?.name)
              .filter((name): name is string => !!name);

          return filteredTransactions.filter(t => subCatAndDescendantsNames.includes(t.category));
      }
      return filteredTransactions;
  }, [filteredTransactions, selectedSubCategory]);
  
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

  const handleSubCategoryClick = (categoryName: string) => {
      const clickedCat = allCategories.find(c => c.name === categoryName);
      if (!clickedCat) return;

      const hasChildren = allCategories.some(c => c.parentId === clickedCat.id);
      
      const newPath = `/reports/category/${clickedCat.id}`;
      const currentQuery = searchParams.toString();
      
      if (hasChildren) {
          router.push(`${newPath}?${currentQuery}`);
      } else {
          setSelectedSubCategory(categoryName);
          setActiveTab('transactions');
      }
  };

  const handleWalletToggle = (walletId: string) => {
      setSelectedWallets(prev => 
          prev.includes(walletId)
              ? prev.filter(id => id !== walletId)
              : [...prev, walletId]
      );
  };
  
  const handleTimeRangeChange = (newTimeRange: TimeRange, dateRange?: DateRange) => {
      setTimeRange(newTimeRange);
      setDateOffset(0);
      if (newTimeRange === 'custom' && dateRange) {
          setCustomDateRange(dateRange);
      } else {
          setCustomDateRange(undefined);
      }
  };

  const dateRangeDisplay = useMemo(() => {
      if (timeRange === 'all') return 'All Time';
      if (timeRange === 'custom') {
          if (customDateRange?.from && customDateRange.to) {
              return `${format(customDateRange.from, 'LLL d, y')} - ${format(customDateRange.to, 'LLL d, y')}`;
          }
          return 'Custom Range';
      }
      if (startDate && endDate) {
            switch (timeRange) {
              case 'day': return format(startDate, 'MMM d, yyyy');
              case 'week': return `Week of ${format(startOfWeek(startDate), 'MMM d')} - ${format(endOfWeek(startDate), 'MMM d, yyyy')}`;
              case 'month': return format(startDate, 'MMMM yyyy');
              case 'year': 
                  if (dateOffset === 0) return 'This Year';
                  if (dateOffset === -1) return 'Last Year';
                  return format(startDate, 'yyyy');
              default: return 'Select Range';
          }
      }
      return 'Loading...';
  }, [timeRange, customDateRange, startDate, endDate, dateOffset]);


  if (!category) {
    notFound();
  }
  
  const breakdownCategories = subCategories.length > 0 ? subCategories : [];
  const IconComponent = getIconComponent(category.icon);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/reports')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.id}>
                        {index > 0 && <ChevronRight className="h-4 w-4" />}
                        <Link 
                            href={`/reports/category/${crumb.id}?${searchParams.toString()}`}
                            className={cn(
                                "hover:text-foreground",
                                index === breadcrumbs.length - 1 && "text-foreground font-semibold"
                            )}
                        >
                            {crumb.name}
                        </Link>
                    </React.Fragment>
                ))}
            </div>
        </div>
         {selectedSubCategory && (
            <Button variant="outline" onClick={() => setSelectedSubCategory(null)}>
                Show All Transactions
            </Button>
        )}
      </div>

       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full md:w-[200px] justify-between"
                >
                    <span>
                        {selectedWallets.length === allWallets.length
                            ? "All Wallets"
                            : `${selectedWallets.length} wallets selected`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full md:w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search wallets..." />
                    <CommandList>
                        <CommandEmpty>No wallets found.</CommandEmpty>
                        <CommandGroup>
                            {allWallets.map((wallet) => {
                                const Icon = getWalletIcon(wallet.icon);
                                return (
                                <CommandItem
                                    key={wallet.id}
                                    onSelect={() => handleWalletToggle(wallet.id)}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedWallets.includes(wallet.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className='flex items-center gap-2'>
                                      <Icon className="h-4 w-4" />
                                      <span>{wallet.name}</span>
                                    </div>
                                </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
         <div className="flex items-center gap-2">
            <TimeRangePicker 
                timeRange={timeRange}
                customDateRange={customDateRange}
                onTimeRangeChange={handleTimeRangeChange}
                displayValue={dateRangeDisplay}
                trigger={
                   <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal md:w-[240px]',
                        !timeRange && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRangeDisplay}
                    </Button>
                }
            />
         </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
                {totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily average</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-3xl font-bold text-red-500">
                {dailyAverage.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
             </p>
          </CardContent>
        </Card>
      </div>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="breakdown">
            {breakdownCategories.length > 0 ? (
             <div className="grid gap-6 mt-6 md:grid-cols-2">
                <CategoriesDonutChart 
                    transactions={filteredTransactions} 
                    categories={breakdownCategories}
                />
                <CategorySpendingList
                    transactions={filteredTransactions}
                    categories={breakdownCategories}
                    onCategoryClick={handleSubCategoryClick}
                />
             </div>
            ) : (
                <Card className="mt-6">
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">This category has no sub-categories to break down.</p>
                    </CardContent>
                </Card>
            )}
          </TabsContent>
          <TabsContent value="transactions">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Transactions {selectedSubCategory ? `in '${selectedSubCategory}'` : ''}
                    </CardTitle>
                    <CardDescription>
                        A list of all transactions in this category for the period.
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
                                {tableTransactions.map((transaction) => {
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
                         {tableTransactions.length === 0 && (
                            <div className="text-center p-8 text-muted-foreground">
                                No transactions found for this selection.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
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

    