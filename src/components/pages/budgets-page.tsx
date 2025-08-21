
"use client";

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
  format,
} from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import {
  budgets as initialBudgets,
  categories,
  transactions,
  updateBudgets,
} from '@/lib/data';
import type { Budget } from '@/types';
import { cn, getIconComponent } from '@/lib/utils';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

const budgetSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  categoryId: z.string().min(1, 'Please select a category.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  period: z.enum(['monthly', 'yearly']),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const { toast } = useToast();

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      amount: 0,
      period: 'monthly',
    },
  });

  const saveBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    updateBudgets(newBudgets);
  };

  const openAddDialog = () => {
    setSelectedBudget(null);
    form.reset({ name: '', categoryId: '', amount: 0, period: 'monthly' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    form.reset({
      name: budget.name,
      categoryId: budget.categoryId,
      amount: budget.amount,
      period: budget.period,
    });
    setIsDialogOpen(true);
  };

  const openDeleteAlert = (budget: Budget) => {
    setBudgetToDelete(budget);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (budgetToDelete) {
      saveBudgets(budgets.filter((b) => b.id !== budgetToDelete.id));
      toast({ title: 'Success', description: 'Budget deleted successfully.' });
      setIsDeleteAlertOpen(false);
      setBudgetToDelete(null);
    }
  };

  const handleFormSubmit = (data: BudgetFormData) => {
    if (selectedBudget) {
      const updatedBudget = { ...selectedBudget, ...data };
      saveBudgets(budgets.map((b) => (b.id === selectedBudget.id ? updatedBudget : b)));
      toast({ title: 'Success', description: 'Budget updated successfully.' });
    } else {
      const newBudget: Budget = {
        id: `budget-${Date.now()}`,
        startDate: new Date().toISOString(),
        ...data,
      };
      saveBudgets([...budgets, newBudget]);
      toast({ title: 'Success', description: 'Budget created successfully.' });
    }
    setIsDialogOpen(false);
  };

  const getSpendingForBudget = (budget: Budget) => {
    const today = new Date();
    let startDate, endDate;

    if (budget.period === 'monthly') {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
    } else {
      startDate = startOfYear(today);
      endDate = endOfYear(today);
    }

    const category = categories.find(c => c.id === budget.categoryId);
    if (!category) return 0;
    
    const descendantIds = new Set<string>();
    const getDescendants = (catId: string) => {
        descendantIds.add(catId);
        const children = categories.filter(c => c.parentId === catId);
        children.forEach(child => getDescendants(child.id));
    };
    getDescendants(category.id);
    
    const descendantCategoryNames = Array.from(descendantIds)
        .map(id => categories.find(c => c.id === id)?.name)
        .filter((name): name is string => !!name);

    return transactions
      .filter((t) => {
        const transactionDate = parseISO(t.date);
        return (
          t.type === 'expense' &&
          descendantCategoryNames.includes(t.category) &&
          transactionDate >= startDate &&
          transactionDate <= endDate
        );
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground">
            Set and track your spending goals.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Budget
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const category = categories.find((c) => c.id === budget.categoryId);
          if (!category) return null;

          const spent = getSpendingForBudget(budget);
          const remaining = budget.amount - spent;
          const progress = (spent / budget.amount) * 100;
          const Icon = getIconComponent(category.icon);

          return (
            <Card key={budget.id}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <CardTitle>{budget.name}</CardTitle>
                      <CardDescription>
                        {category.name} ({budget.period})
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0" onClick={() => openEditDialog(budget)}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span>{spent.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className={cn(remaining < 0 && "text-red-500")}>
                        {remaining.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                 <p className="text-xs text-muted-foreground">
                    Budget: {budget.amount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                 </p>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBudget ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
            <DialogDescription>
              {selectedBudget
                ? 'Update your budget details.'
                : 'Create a new budget to track spending.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monthly Groceries" {...field} />
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
                    <FormControl>
                      <Input type="number" placeholder="500.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .filter((c) => c.type === 'expense')
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
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
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                     <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="monthly" />
                            </FormControl>
                            <FormLabel>Monthly</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="yearly" />
                            </FormControl>
                            <FormLabel>Yearly</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                {selectedBudget && (
                    <Button type="button" variant="destructive" className="mr-auto" onClick={() => openDeleteAlert(selectedBudget)}>Delete</Button>
                )}
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{selectedBudget ? 'Save Changes' : 'Create Budget'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this budget.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
