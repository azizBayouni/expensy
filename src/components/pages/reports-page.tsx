
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TimeRangePicker, type TimeRange } from '@/components/ui/time-range-picker';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { wallets as allWallets } from '@/lib/data';
import { cn } from '@/lib/utils';
import { add, sub, format } from 'date-fns';
import { DateRange } from 'react-day-picker';


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
        }

        if (range === 'custom' && from && to) {
            setCustomDateRange({ from: new Date(from), to: new Date(to) });
        }
        
        if (offset) {
            setDateOffset(parseInt(offset, 10));
        }
    }, [searchParams]);

    // Effect to update URL when state changes
    useEffect(() => {
        const params = new URLSearchParams();

        if (selectedWallets.length > 0 && selectedWallets.length < allWallets.length) {
            params.set('wallets', selectedWallets.join(','));
        }
        params.set('timeRange', timeRange);
        if (timeRange === 'custom' && customDateRange?.from && customDateRange?.to) {
            params.set('from', customDateRange.from.toISOString());
            params.set('to', customDateRange.to.toISOString());
        }
        if (dateOffset !== 0) {
            params.set('offset', dateOffset.toString());
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [selectedWallets, timeRange, customDateRange, dateOffset, pathname, router]);

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
        if (timeRange === 'custom' && customDateRange?.from && customDateRange?.to) {
            return `${format(customDateRange.from, 'LLL d, y')} - ${format(customDateRange.to, 'LLL d, y')}`;
        }
        
        let date = new Date();
        const unit = timeRange === 'day' ? 'days' : timeRange === 'week' ? 'weeks' : timeRange === 'month' ? 'months' : 'years';
        
        if (dateOffset !== 0) {
            date = dateOffset > 0 ? add(date, { [unit]: dateOffset }) : sub(date, { [unit]: Math.abs(dateOffset) });
        }

        switch (timeRange) {
            case 'day': return format(date, 'LLL d, y');
            case 'week': return `Week of ${format(date, 'LLL d, y')}`;
            case 'month': return format(date, 'LLLL yyyy');
            case 'year': return format(date, 'yyyy');
            default: return 'Select Range';
        }
    }, [timeRange, customDateRange, dateOffset]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
            <p className="text-muted-foreground">
              Analyze your financial data with detailed reports.
            </p>
        </div>
         <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleDateOffsetChange('prev')}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center font-medium min-w-[180px]">{dateRangeDisplay}</div>
            <Button variant="outline" size="icon" onClick={() => handleDateOffsetChange('next')}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
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
                            : `${selectedWallets.length} selected`}
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

        <TimeRangePicker 
            timeRange={timeRange}
            customDateRange={customDateRange}
            onTimeRangeChange={handleTimeRangeChange}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Content</CardTitle>
          <CardDescription>
            This is the main content area for the reports. More features will be added here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Placeholder content for the reports page.</p>
        </CardContent>
      </Card>
    </div>
  );
}
