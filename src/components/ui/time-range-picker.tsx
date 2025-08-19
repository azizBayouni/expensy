
"use client";

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { DateRangePickerDialog } from './date-range-picker-dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all' | 'custom';

interface TimeRangePickerProps {
  timeRange: TimeRange;
  customDateRange?: DateRange;
  onTimeRangeChange: (timeRange: TimeRange, customDateRange?: DateRange) => void;
  className?: string;
  displayValue: string;
  trigger: React.ReactNode;
}

const timeRangeOptions: { label: string; value: TimeRange }[] = [
  { label: 'This Day', value: 'day' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
  { label: 'Custom', value: 'custom' },
];

export function TimeRangePicker({
  timeRange,
  customDateRange,
  onTimeRangeChange,
  className,
  displayValue,
  trigger,
}: TimeRangePickerProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);

  const handleCustomDateSave = (range: DateRange) => {
    onTimeRangeChange('custom', range);
  };
  
  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
        <SheetContent side="bottom" className={cn("sm:max-w-none w-full md:w-auto", className)}>
          <SheetHeader>
            <SheetTitle>Select Time Range</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 py-4">
            {timeRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? 'default' : 'outline'}
                onClick={() => {
                  if (option.value === 'custom') {
                    setIsSheetOpen(false);
                    setIsCustomDialogOpen(true);
                  } else {
                    onTimeRangeChange(option.value);
                    setIsSheetOpen(false);
                  }
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <DateRangePickerDialog
        open={isCustomDialogOpen}
        onOpenChange={setIsCustomDialogOpen}
        onSave={handleCustomDateSave}
        initialDateRange={customDateRange}
      />
    </>
  );
}
