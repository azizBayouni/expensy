
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Asset } from '@/types';
import { DialogFooter } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const assetSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  value: z.coerce.number().min(0, 'Value must be a non-negative number.'),
  type: z.literal('Investment'),
  status: z.enum(['active', 'inactive']).optional(),
  platform: z.string().optional(),
  assetType: z.string().optional(),
  units: z.coerce.number().optional(),
  pricePerUnit: z.coerce.number().optional(),
  growth: z.coerce.number().optional(),
  maturityDate: z.date().optional().nullable(),
  estimatedReturnValue: z.coerce.number().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

interface InvestmentFormProps {
  asset: Asset | null;
  onSubmit: (data: Asset) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function InvestmentForm({ asset, onSubmit, onCancel, onDelete }: InvestmentFormProps) {
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: asset?.name || '',
      value: asset?.value || 0,
      type: 'Investment',
      status: asset?.status || 'active',
      platform: asset?.platform || '',
      assetType: asset?.assetType || '',
      units: asset?.units || undefined,
      pricePerUnit: asset?.pricePerUnit || undefined,
      growth: asset?.growth || undefined,
      maturityDate: asset?.maturityDate ? parseISO(asset.maturityDate) : undefined,
      estimatedReturnValue: asset?.estimatedReturnValue || undefined,
    },
  });

  const handleFormSubmit = (data: AssetFormData) => {
    const finalData: Asset = {
        ...data,
        maturityDate: data.maturityDate ? format(data.maturityDate, 'yyyy-MM-dd') : undefined,
    };
    onSubmit(finalData);
  };
  
  return (
    <Form {...form}>
       <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <ScrollArea className="h-96 pr-6 -mr-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., S&P 500 ETF" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fidelity" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Stock, Bond" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="units"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Units</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="100" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="pricePerUnit"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price / Unit</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="1500.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Total Value</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="150000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="growth"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Growth (%)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="12.5" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="maturityDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Maturity Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={'outline'}
                                className={cn(
                                    'pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                )}
                                >
                                {field.value ? (
                                    format(field.value, 'PPP')
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="estimatedReturnValue"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Est. Return Value</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="168750.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                        >
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                            <RadioGroupItem value="active" />
                            </FormControl>
                            <FormLabel>Active</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                            <RadioGroupItem value="inactive" />
                            </FormControl>
                            <FormLabel>Inactive</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
          </div>
        </ScrollArea>
        <DialogFooter>
            {asset && (
                <Button type="button" variant="destructive" className="mr-auto" onClick={onDelete}>Delete</Button>
            )}
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{asset ? 'Save Changes' : 'Create Investment'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
