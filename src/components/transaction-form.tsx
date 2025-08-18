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
import { CalendarIcon, Download, Paperclip, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import { categories, wallets, events } from '@/lib/data';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import * as React from 'react';
import { Textarea } from './ui/textarea';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  currency: z.string().min(1, { message: 'Please select a currency.'}),
  wallet: z.string().min(1, { message: 'Please select a wallet.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  date: z.date(),
  description: z.string().optional(),
  event: z.string().optional(),
  attachments: z.array(z.instanceof(File)).optional(),
  excludeFromReports: z.boolean().optional(),
});

type TransactionFormProps = {
  onSubmit: (data: Transaction) => void;
  transaction?: Transaction | null;
  onDelete: (id: string) => void;
};

export function TransactionForm({
  onSubmit,
  transaction,
  onDelete,
}: TransactionFormProps) {
  const defaultWallet = wallets.find((w) => w.isDefault)?.name;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: transaction?.type || 'expense',
      amount: transaction?.amount || '',
      currency: transaction?.currency || 'SAR',
      wallet: transaction?.wallet || defaultWallet || '',
      category: transaction?.category || '',
      date: transaction ? new Date(transaction.date) : new Date(),
      description: transaction?.description || '',
      event: transaction?.event || 'null',
      attachments: [],
      excludeFromReports: transaction?.excludeFromReports || false,
    },
  });

  const transactionType = form.watch('type');
  const attachments = form.watch('attachments') || [];

  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType
  );

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    const fullTransaction: Transaction = {
      id: transaction?.id || `trx-${Date.now()}`,
      ...values,
      date: format(values.date, 'yyyy-MM-dd'),
      attachments: values.attachments?.map(f => ({ name: f.name, path: URL.createObjectURL(f) })),
      event: values.event === 'null' ? undefined : values.event,
    };
    onSubmit(fullTransaction);
  }

  const handleDelete = () => {
    if (transaction) {
      onDelete(transaction.id);
    }
  };

  return (
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
                  onValueChange={field.onChange}
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
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Select currency"/>
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       <SelectItem value="SAR">SAR</SelectItem>
                       <SelectItem value="USD">USD</SelectItem>
                       <SelectItem value="EUR">EUR</SelectItem>
                     </SelectContent>
                   </Select>
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
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        <SelectItem key={event.id} value={event.name}>
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
                         {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                            <span className="text-sm truncate">{file.name}</span>
                            <div className="flex items-center gap-2">
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(URL.createObjectURL(file), '_blank')}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                               type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => field.onChange(attachments.filter((_, i) => i !== index))}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                         ))}
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
            <Button type="button" variant="outline" onClick={() => form.reset()}>Cancel</Button>
            <Button type="submit">
              {transaction ? 'Save Changes' : 'Create Transaction'}
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
  );
}
