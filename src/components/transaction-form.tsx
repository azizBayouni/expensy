
"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Download, Paperclip, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import { categories, wallets, events, updateWallets } from '@/lib/data';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import * as React from 'react';
import { Textarea } from './ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useTravelMode } from '@/hooks/use-travel-mode';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  currency: z.string().min(1, { message: 'Please select a currency.'}),
  wallet: z.string().min(1, { message: 'Please select a wallet.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  date: z.date(),
  description: z.string().optional(),
  event: z.string().optional(),
  attachments: z.array(z.any()).optional(),
  excludeFromReports: z.boolean().optional(),
});

type TransactionFormProps = {
  onSubmit: (data: Transaction) => void;
  transaction?: Transaction | null;
  onDelete: (id: string) => void;
  onCancel: () => void;
};

const top100Currencies = [
  'SAR', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD', 'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL', 'TWD', 'DKK', 'PLN', 'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'MYR', 'RON', 'UAH', 'VND', 'ARS', 'NGN', 'EGP', 'IQD', 'DZD', 'MAD', 'KZT', 'QAR', 'KWD', 'OMR', 'BHD', 'JOD', 'LBP', 'SYP', 'YER', 'IRR', 'PKR', 'BDT', 'LKR', 'NPR', 'AFN', 'MMK', 'KHR', 'LAK', 'MNT', 'UZS', 'TJS', 'KGS', 'TMT', 'GEL', 'AZN', 'AMD', 'BYN', 'MDL', 'RSD', 'BAM', 'MKD', 'ALL', 'ISK', 'GHS', 'KES', 'UGX', 'TZS', 'ZMW', 'ZWL', 'GMD', 'SLL', 'LRD', 'CVE', 'GNF', 'XOF', 'XAF', 'CDF', 'BIF', 'RWF', 'SOS', 'SDG', 'LYD', 'TND'
];

export function TransactionForm({
  onSubmit,
  transaction,
  onDelete,
  onCancel,
}: TransactionFormProps) {
  const { isActive, eventId, currency, isLoaded } = useTravelMode();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: transaction?.type || 'expense',
      amount: transaction?.amount || ('' as any),
      currency: transaction?.currency || (isActive && currency ? currency : 'SAR'),
      wallet: transaction?.wallet || wallets.find((w) => w.isDefault)?.name || '',
      category: transaction?.category || '',
      date: transaction ? new Date(transaction.date) : new Date(),
      description: transaction?.description || '',
      event: transaction?.event || (isActive && eventId ? eventId : 'null'),
      attachments: transaction?.attachments || [],
      excludeFromReports: transaction?.excludeFromReports || false,
    },
  });

  const attachments = form.watch('attachments') || [];
  const transactionType = form.watch('type');

  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    let finalAmount = values.amount;
    let convertedAmount: number | undefined;
    let originalAmount: number | undefined;

    if (values.currency !== 'SAR') {
        const apiKey = localStorage.getItem('exchangeRateApiKey');
        if (!apiKey) {
            toast({
                variant: 'destructive',
                title: 'API Key Required',
                description: 'Please set your ExchangeRate-API key in settings to convert currencies.',
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${values.currency}/SAR/${values.amount}`);
            const data = await response.json();
            if (data.result === 'success') {
                originalAmount = values.amount;
                convertedAmount = data.conversion_result;
                finalAmount = convertedAmount;
                 toast({
                    title: 'Currency Converted',
                    description: `${originalAmount} ${values.currency} = ${finalAmount.toFixed(2)} SAR`,
                });
            } else {
                throw new Error(data['error-type'] || 'Failed to fetch exchange rate.');
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Conversion Failed',
                description: error.message,
            });
            setIsSubmitting(false);
            return;
        }
    }

    const fullTransaction: Transaction = {
      id: transaction?.id || `trx-${Date.now()}`,
      ...values,
      amount: finalAmount,
      date: format(values.date, 'yyyy-MM-dd'),
      attachments: values.attachments?.map(f => {
        if (f instanceof File) {
            return { name: f.name, path: URL.createObjectURL(f) };
        }
        return f;
      }),
      event: values.event === 'null' ? undefined : values.event,
      originalAmount: originalAmount,
      convertedAmountSAR: convertedAmount,
      currency: 'SAR',
    };
    
    const wallet = wallets.find(w => w.name === values.wallet);
    if (wallet) {
      const newBalance = values.type === 'income' 
        ? wallet.balance + finalAmount 
        : wallet.balance - finalAmount;
      const updatedWallets = wallets.map(w => w.id === wallet.id ? { ...w, balance: newBalance } : w);
      updateWallets(updatedWallets);
    }

    onSubmit(fullTransaction);
    setIsSubmitting(false);
  }

  const handleDelete = () => {
    if (transaction) {
      onDelete(transaction.id);
    }
  };
  
  const handleFileDisplay = (file: any) => {
    if (file instanceof File) {
        return { name: file.name, url: URL.createObjectURL(file) };
    }
    return { name: file.name, url: file.path };
  }
  
  const handleFileRemove = (indexToRemove: number) => {
    const currentAttachments = form.getValues('attachments') || [];
    const updatedAttachments = currentAttachments.filter((_, index) => index !== indexToRemove);
    form.setValue('attachments', updatedAttachments);
  };
  
  const filteredCategories = categories.filter(c => c.type === transactionType);

  if (!isLoaded) {
    return (
        <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
        </div>
    );
  }

  return (
    <>
      <AlertDialog>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col h-[calc(100vh-6rem)]"
          >
            <ScrollArea className="flex-1 pr-6 -mr-6">
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('category', '');
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Currency</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value || "Select currency"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search currency..." />
                            <CommandList>
                              <CommandEmpty>No currency found.</CommandEmpty>
                              <CommandGroup>
                                {top100Currencies.map((currency) => (
                                  <CommandItem
                                    value={currency}
                                    key={currency}
                                    onSelect={() => {
                                      form.setValue("currency", currency)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        currency === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {currency}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="wallet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a wallet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wallets.map((wallet) => (
                              <SelectItem key={wallet.id} value={wallet.name}>
                                {wallet.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Category</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? filteredCategories.find(
                                      (cat) => cat.name === field.value
                                    )?.name
                                  : "Select a category"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Search category..." />
                              <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                  {filteredCategories.map((cat) => (
                                    <CommandItem
                                      value={cat.name}
                                      key={cat.id}
                                      onSelect={() => {
                                        form.setValue("category", cat.name);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          cat.name === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {cat.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
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
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g. Coffee with friends" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'null'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to an event (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">None</SelectItem>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                    control={form.control}
                    name="attachments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attachments</FormLabel>
                        <FormControl>
                           <div className="flex items-center gap-2">
                             <Input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                multiple
                                onChange={(e) => {
                                   const currentFiles = field.value || [];
                                   const newFiles = Array.from(e.target.files || []);
                                   field.onChange([...currentFiles, ...newFiles]);
                                }}
                             />
                             <label htmlFor="file-upload" className={cn(
                               "flex items-center gap-2 cursor-pointer",
                                "h-10 px-4 py-2 text-sm font-medium",
                               "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
                             )}>
                               <Paperclip className="h-4 w-4" />
                               Add Receipt
                             </label>
                           </div>
                        </FormControl>
                        { attachments.length > 0 && (
                            <div className="space-y-2 pt-2">
                             {attachments.map((file, index) => {
                               const { name, url } = handleFileDisplay(file);
                               return (
                                  <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                    <span className="text-sm truncate">{name}</span>
                                    <div className="flex items-center gap-2">
                                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(url, '_blank')}>
                                        <Download className="h-4 w-4" />
                                      </Button>
                                      <Button
                                       type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleFileRemove(index)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                               )
                             })}
                            </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                />
                
                <FormField
                  control={form.control}
                  name="excludeFromReports"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Exclude from Reports
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

              </div>
            </ScrollArea>
            <div className="flex justify-between items-center pt-4 border-t">
                {transaction ? (
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="justify-start">
                        Delete
                    </Button>
                  </AlertDialogTrigger>
                ) : <div />}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (transaction ? 'Save Changes' : 'Create Transaction')}
                </Button>
              </div>
            </div>
          </form>
        </Form>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
