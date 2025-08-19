
"use client";

import { useMemo, useState } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { transactions as allTransactions, categories as allCategories, updateTransactions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { differenceInDays, parseISO, format } from 'date-fns';
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
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { TransactionForm } from '@/components/transaction-form';


export default function CategoryReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('breakdown');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(allTransactions);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);


  const category = useMemo(() => 
    allCategories.find(c => c.id === params.id),
    [params.id]
  );
  
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const { totalExpenses, dailyAverage, subCategories, chartTransactions, filteredTransactionsForTable } = useMemo(() => {
    if (!category) return { totalExpenses: 0, dailyAverage: 0, subCategories: [], chartTransactions: [], filteredTransactionsForTable: [] };

    const startDate = from ? parseISO(from) : new Date(0);
    const endDate = to ? parseISO(to) : new Date();

    const childrenCategories = allCategories.filter(c => c.parentId === category.id);
    const descendantIds = new Set([category.id]);
    const getDescendants = (catId: string) => {
        const children = allCategories.filter(c => c.parentId === catId);
        children.forEach(child => {
            descendantIds.add(child.id);
            getDescendants(child.id);
        });
    };
    getDescendants(category.id);
    const descendantCategoryNames = allCategories
        .filter(c => descendantIds.has(c.id))
        .map(c => c.name);

    const allRelatedTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return descendantCategoryNames.includes(t.category) &&
             transactionDate >= startDate &&
             transactionDate <= endDate;
    });
    
    const tableTransactions = selectedSubCategory 
        ? allRelatedTransactions.filter(t => t.category === selectedSubCategory)
        : allRelatedTransactions;

    const total = allRelatedTransactions.reduce((acc, t) => acc + t.amount, 0);

    const days = differenceInDays(endDate, startDate) + 1;
    const average = days > 0 ? total / days : 0;
    
    const relevantCategories = childrenCategories.length > 0 ? childrenCategories : [category];
    const donutChartTransactions = childrenCategories.length > 0 
        ? allRelatedTransactions.filter(t => t.category !== category.name)
        : allRelatedTransactions;


    return { 
        transactions: allRelatedTransactions,
        chartTransactions: donutChartTransactions, 
        totalExpenses: total, 
        dailyAverage: average, 
        subCategories: relevantCategories,
        filteredTransactionsForTable: tableTransactions,
    };
  }, [category, from, to, selectedSubCategory, transactions]);
  
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
    setSelectedSubCategory(categoryName);
    setActiveTab('transactions');
  }

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold">Category Report: {category.name}</h1>
                <p className="text-muted-foreground">
                    Detailed view of your spending for this category.
                </p>
            </div>
        </div>
         {selectedSubCategory && (
            <Button variant="outline" onClick={() => setSelectedSubCategory(null)}>
                Show All Transactions
            </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
            <CardDescription>
                Total amount spent in the '{category.name}' category and its sub-categories for the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
                {totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily Average</CardTitle>
             <CardDescription>
                Average daily spending for this category over the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-3xl font-bold">
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
             <div className="grid gap-6 mt-6 md:grid-cols-2">
                <CategoriesDonutChart 
                    transactions={chartTransactions} 
                    categories={subCategories}
                />
                <CategorySpendingList
                    transactions={chartTransactions}
                    categories={subCategories}
                    onCategoryClick={handleSubCategoryClick}
                    isInteractive
                />
             </div>
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
                                {filteredTransactionsForTable.map((transaction) => (
                                    <TableRow key={transaction.id} onClick={() => handleEditTransaction(transaction)} className="cursor-pointer">
                                        <TableCell>{format(new Date(transaction.date), 'dd MMM yyyy')}</TableCell>
                                        <TableCell className="font-medium">{transaction.description}</TableCell>
                                        <TableCell>
                                        <Badge variant="outline">{transaction.category}</Badge>
                                        </TableCell>
                                        <TableCell className={cn("text-right font-semibold", 'text-red-600')}>
                                            -{transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {filteredTransactionsForTable.length === 0 && (
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
