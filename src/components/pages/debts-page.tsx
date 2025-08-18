
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Calendar as CalendarIcon, Paperclip, Download, Trash2 } from 'lucide-react';
import { debts as initialDebts, updateDebts } from '@/lib/data';
import type { Debt } from '@/types';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const debtSchema = z.object({
  type: z.enum(['payable', 'receivable']),
  person: z.string().min(2, 'Person/Entity is required.'),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
  dueDate: z.date(),
  note: z.string().optional(),
  attachments: z.array(z.any()).optional(),
});

type DebtFormData = z.infer<typeof debtSchema>;

export function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>(initialDebts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const { toast } = useToast();

  const form = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      amount: '',
    },
  });
  
  const attachments = form.watch('attachments') || [];

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

  const saveDebts = (newDebts: Debt[]) => {
    setDebts(newDebts);
    updateDebts(newDebts);
  };

  const openAddDialog = (type: 'payable' | 'receivable') => {
    setSelectedDebt(null);
    form.reset({
      type,
      person: '',
      amount: '',
      dueDate: new Date(),
      note: '',
      attachments: [],
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (debt: Debt) => {
    setSelectedDebt(debt);
    form.reset({
      type: debt.type,
      person: debt.person,
      amount: debt.amount,
      dueDate: new Date(debt.dueDate),
      note: debt.note || '',
      attachments: debt.attachments || [],
    });
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (data: DebtFormData) => {
    if (selectedDebt) {
      const updatedDebt: Debt = {
        ...selectedDebt,
        ...data,
        dueDate: format(data.dueDate, 'yyyy-MM-dd'),
        attachments: data.attachments?.map(f => {
            if (f instanceof File) {
                return { name: f.name, path: URL.createObjectURL(f) };
            }
            return f;
        }),
      };
      saveDebts(debts.map((d) => (d.id === selectedDebt.id ? updatedDebt : d)));
      toast({ title: 'Success', description: 'Debt updated successfully.' });
    } else {
      const newDebt: Debt = {
        id: `debt-${Date.now()}`,
        status: 'unpaid',
        paidAmount: 0,
        ...data,
        dueDate: format(data.dueDate, 'yyyy-MM-dd'),
         attachments: data.attachments?.map(f => {
            if (f instanceof File) {
                return { name: f.name, path: URL.createObjectURL(f) };
            }
            return f;
        }),
      };
      saveDebts([...debts, newDebt]);
      toast({ title: 'Success', description: 'Debt added successfully.' });
    }
    setIsDialogOpen(false);
  };

  const payables = debts.filter((d) => d.type === 'payable');
  const receivables = debts.filter((d) => d.type === 'receivable');

  const DebtTable = ({
    list,
    title,
  }: {
    list: Debt[];
    title: 'Payable' | 'Receivable';
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}s</span>
          <Button size="sm" variant="outline" onClick={() => openAddDialog(title.toLowerCase() as 'payable' | 'receivable')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add {title}
          </Button>
        </CardTitle>
        <CardDescription>
          {title === 'Payable'
            ? 'Money you owe to others.'
            : 'Money others owe to you.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {title === 'Payable' ? 'Creditor' : 'Debtor'}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((debt) => (
                <TableRow key={debt.id} onClick={() => openEditDialog(debt)} className="cursor-pointer">
                  <TableCell className="font-medium">{debt.person}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        debt.status === 'paid'
                          ? 'default'
                          : debt.status === 'partial'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className={cn(
                        debt.status === 'paid' && 'bg-green-500',
                        debt.status === 'partial' && 'bg-yellow-500'
                      )}
                    >
                      {debt.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(debt.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold">
                      {debt.amount.toFixed(2)} SAR
                    </div>
                    {debt.status !== 'unpaid' && (
                      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                        <span>
                          Paid: {debt.paidAmount.toFixed(2)} SAR
                        </span>
                        <Progress
                          value={(debt.paidAmount / debt.amount) * 100}
                          className="w-20 h-1"
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-8 h-8 p-0" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); openEditDialog(debt)}}>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                        <DropdownMenuItem>Add Payment</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
    <Tabs defaultValue="payables" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="payables">Payables</TabsTrigger>
        <TabsTrigger value="receivables">Receivables</TabsTrigger>
      </TabsList>
      <TabsContent value="payables">
        <DebtTable list={payables} title="Payable" />
      </TabsContent>
      <TabsContent value="receivables">
        <DebtTable list={receivables} title="Receivable" />
      </TabsContent>
    </Tabs>

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDebt ? 'Edit Debt' : 'Add New Debt'}</DialogTitle>
            <DialogDescription>
              Record a new payable or receivable debt.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="payable" />
                          </FormControl>
                          <FormLabel>Payable (I owe)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="receivable" />
                          </FormControl>
                          <FormLabel>Receivable (I am owed)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Person / Entity</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe, Car Loan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                        <div className="relative">
                           <FormControl>
                             <Input type="number" placeholder="100.00" {...field} className="pr-16" />
                           </FormControl>
                           <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                            SAR
                           </div>
                        </div>
                      <FormMessage />
                    </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
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
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g. For concert tickets" {...field} />
                    </FormControl>
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
                            id="file-upload-debt"
                            className="hidden"
                            multiple
                            onChange={(e) => {
                               const currentFiles = field.value || [];
                               const newFiles = Array.from(e.target.files || []);
                               field.onChange([...currentFiles, ...newFiles]);
                            }}
                         />
                         <label htmlFor="file-upload-debt" className={cn(
                           "flex items-center gap-2 cursor-pointer",
                            "h-10 px-4 py-2 text-sm font-medium",
                           "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
                         )}>
                           <Paperclip className="h-4 w-4" />
                           Add Attachment
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
                                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" asChild>
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                      <Download className="h-4 w-4" />
                                    </a>
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{selectedDebt ? 'Save Changes' : 'Save Debt'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
