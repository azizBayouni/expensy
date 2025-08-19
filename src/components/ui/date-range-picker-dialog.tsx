"use client";

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

interface DateRangePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (range: DateRange) => void;
  initialDateRange?: DateRange;
}

export function DateRangePickerDialog({
  open,
  onOpenChange,
  onSave,
  initialDateRange,
}: DateRangePickerDialogProps) {
  const [date, setDate] = useState<DateRange | undefined>(initialDateRange);

  const handleSave = () => {
    if (date) {
      onSave(date);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Custom Date Range</DialogTitle>
          <DialogDescription>
            Choose a start and end date for your report.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!date?.from || !date?.to}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
