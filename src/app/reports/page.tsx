
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TimeRangePicker, type TimeRange } from '@/components/ui/time-range-picker';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { wallets as allWallets, transactions as allTransactions, categories as allCategories } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  add,
  sub,
  format,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  parseISO,
} from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Progress } from '@/components/ui/progress';
import { CategoriesDonutChart } from '@/components/charts/categories-donut-chart';
import { CategorySpendingList } from '@/components/charts/category-spending-list';


export function ReportsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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
        } else {
            setTimeRange('month');
        }

        if (range === 'custom' && from && to) {
            setCustomDateRange({ from: new Date(from), to: new Date(to) });
        }
        
        if (offset) {
            setDateOffset(parseInt(offset, 10));
        }
    }, [searchParams]);

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
        const params = new URLSearchParams();

        if (selectedWallets.length > 0 && selectedWallets.length < allWallets.length) {
            params.set('wallets', selectedWallets.join(','));
        }
        
        params.set('timeRange', timeRange);
        
        if (startDate && endDate && timeRange !== 'all') {
            params.set('from', startDate.toISOString());
            params.set('to', endDate.toISOString());
        }

        if (dateOffset !== 0 && timeRange !== 'all' && timeRange !== 'custom') {
            params.set('offset', dateOffset.toString());
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [selectedWallets, timeRange, startDate, endDate, dateOffset, pathname, router]);
    
    const financialSummary = useMemo(() => {
        const selectedWalletNames = allWallets.filter(w => selectedWallets.includes(w.id)).map(w => w.name);

        const transactionsInPeriod = allTransactions.filter(t => {
            const transactionDate = parseISO(t.date);
            const inDateRange = startDate && endDate ? (transactionDate >= startDate && transactionDate <= endDate) : true;
            return selectedWalletNames.includes(t.wallet) && inDateRange;
        });

        const transactionsBeforePeriod = allTransactions.filter(t => {
            if (!startDate) return false;
            const transactionDate = parseISO(t.date);
            return selectedWalletNames.includes(t.wallet) && transactionDate < startDate;
        });
        
        const openingBalance = transactionsBeforePeriod.reduce((acc, t) => {
            return t.type === 'income' ? acc + t.amount : acc - t.amount;
        }, 0);

        const totalIncome = transactionsInPeriod
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const totalExpense = transactionsInPeriod
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        const netIncome = totalIncome - totalExpense;
        const endingBalance = openingBalance + netIncome;
        
        return {
            totalIncome,
            totalExpense,
            netIncome,
            openingBalance,
            endingBalance,
            transactionsInPeriod,
        };
    }, [selectedWallets, startDate, endDate]);

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
    
    const handleDateOffsetChange = (direction: 'prev' | 'next') => {
        setDateOffset(prev => direction === 'next' ? prev + 1 : prev - 1);
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
    
    const expensePercentage = financialSummary.totalIncome > 0 ? (financialSummary.totalExpense / financialSummary.totalIncome) * 100 : 0;
    const topLevelCategories = allCategories.filter(c => !c.parentId && c.type === 'expense');


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <p className="text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold">{financialSummary.endingBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</p>
             <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className="w-full md:w-[200px] justify-between mt-2"
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
                                {allWallets.map((wallet) => (
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
                                        <span>{wallet.name}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
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
       
       <Card>
        <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm mb-4">
                 <Button variant="ghost" size="icon" onClick={() => handleDateOffsetChange('prev')} disabled={timeRange === 'custom' || timeRange === 'all'}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <p className="text-center font-semibold">{dateRangeDisplay}</p>
                 <Button variant="ghost" size="icon" onClick={() => handleDateOffsetChange('next')} disabled={timeRange === 'custom' || timeRange === 'all'}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            {timeRange !== 'all' && (
              <>
                <div className="flex justify-between text-sm">
                    <p className="text-muted-foreground">Opening balance</p>
                    <p>{financialSummary.openingBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</p>
                </div>
                <div className="flex justify-between text-sm font-medium">
                    <p>Ending balance</p>
                    <p>{financialSummary.endingBalance.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</p>
                </div>
              </>
            )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Net Income</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`text-3xl font-bold`}>
              {financialSummary.netIncome.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                 <div className="flex items-center text-muted-foreground">
                    <span>Income</span>
                 </div>
                 <span className="text-green-400 font-medium">{financialSummary.totalIncome.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center text-muted-foreground">
                  <span>Expense</span>
                </div>
                 <span className="text-red-400 font-medium">{financialSummary.totalExpense.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
              </div>
            </div>
            <Progress value={expensePercentage} className="h-2 [&>div]:bg-chart-1" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoriesDonutChart 
            transactions={financialSummary.transactionsInPeriod} 
            categories={topLevelCategories}
        />
        <CategorySpendingList 
            transactions={financialSummary.transactionsInPeriod} 
            categories={topLevelCategories}
        />
      </div>
    </div>
  );
}
