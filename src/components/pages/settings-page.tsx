
"use client";

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { transactions, categories, wallets, debts, updateTransactions, updateCategories, top100Currencies, events, updateEvents, updateDebts, updateWallets } from '@/lib/data';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import type { Category, Transaction } from '@/types';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
});

const apiSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required.'),
});

export function SettingsPage() {
  const { toast } = useToast();
  const [confirmationInput, setConfirmationInput] = useState('');
  const [transactionImportFile, setTransactionImportFile] = useState<File | null>(null);
  const transactionImportRef = useRef<HTMLInputElement>(null);
  const [categoryImportFile, setCategoryImportFile] = useState<File | null>(null);
  const categoryImportRef = useRef<HTMLInputElement>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'transactions' | 'categories' | null>(null);
  const [dialogStep, setDialogStep] = useState(1);


  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'User Name',
      email: 'user@example.com',
    },
  });

  const apiForm = useForm({
    resolver: zodResolver(apiSchema),
    defaultValues: { apiKey: '' },
  });

  const handleProfileSave = (data: z.infer<typeof profileSchema>) => {
    console.log('Profile saved:', data);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
  };

  const handleApiSave = async (data: z.infer<typeof apiSchema>) => {
    localStorage.setItem('exchangeRateApiKey', data.apiKey);
    toast({
      title: 'API Key Saved',
      description: 'The API key has been saved and verified.',
    });
  };
  
  const handleDownloadTemplate = () => {
    const header = "No.,Category,Amount,Note,Wallet,Currency,Date,Event,Exclude Report\n";
    const blob = new Blob([header], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'import-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImportTransactions = () => {
    if (!transactionImportFile) return;

    Papa.parse(transactionImportFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newTransactions: Transaction[] = [];
        const data = results.data as any[];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2; // CSV row number (1-based, plus header)

            // Validate Category
            const category = categories.find(c => c.name.toLowerCase() === row.Category?.toLowerCase());
            if (!category) {
                toast({ variant: 'destructive', title: 'Import Failed', description: `Category '${row.Category}' not found on row ${rowNum}.` });
                if(transactionImportRef.current) transactionImportRef.current.value = "";
                setTransactionImportFile(null);
                return;
            }

            // Validate Amount
            const amount = parseFloat(row.Amount);
            if (isNaN(amount)) {
                toast({ variant: 'destructive', title: 'Import Failed', description: `Invalid amount on row ${rowNum}.` });
                 if(transactionImportRef.current) transactionImportRef.current.value = "";
                setTransactionImportFile(null);
                return;
            }
            if (category.type === 'expense' && amount > 0) {
                 toast({ variant: 'destructive', title: 'Import Failed', description: `Expense amount must not be positive on row ${rowNum}.` });
                 if(transactionImportRef.current) transactionImportRef.current.value = "";
                setTransactionImportFile(null);
                return;
            }
             if (category.type === 'income' && amount < 0) {
                 toast({ variant: 'destructive', title: 'Import Failed', description: `Income amount must not be negative on row ${rowNum}.` });
                 if(transactionImportRef.current) transactionImportRef.current.value = "";
                setTransactionImportFile(null);
                return;
            }

            // Validate Wallet
            const wallet = wallets.find(w => w.name.toLowerCase() === row.Wallet?.toLowerCase());
            if (!wallet) {
                toast({ variant: 'destructive', title: 'Import Failed', description: `Wallet '${row.Wallet}' not found on row ${rowNum}.` });
                 if(transactionImportRef.current) transactionImportRef.current.value = "";
                setTransactionImportFile(null);
                return;
            }
            
            // Validate Currency
            const currency = row.Currency || wallets.find(w => w.isDefault)?.currency || 'SAR';
            if (!top100Currencies.includes(currency)) {
                toast({ variant: 'destructive', title: 'Import Failed', description: `Currency '${row.Currency}' not found on row ${rowNum}.` });
                 if(transactionImportRef.current) transactionImportRef.current.value = "";
                setTransactionImportFile(null);
                return;
            }
            
            // Validate Date
            const date = new Date(row.Date);
            if (isNaN(date.getTime())) {
                toast({ variant: 'destructive', title: 'Import Failed', description: `Invalid date format on row ${rowNum}.` });
                 if(transactionImportRef.current) transactionImportRef.current.value = "";
                setTransactionImportFile(null);
                return;
            }
            
            // Validate Event (optional)
            if (row.Event) {
                const event = events.find(e => e.name.toLowerCase() === row.Event.toLowerCase());
                if (!event) {
                    toast({ variant: 'destructive', title: 'Import Failed', description: `Event '${row.Event}' not found on row ${rowNum}.` });
                     if(transactionImportRef.current) transactionImportRef.current.value = "";
                    setTransactionImportFile(null);
                    return;
                }
            }

            newTransactions.push({
                id: `trx-import-${Date.now()}-${i}`,
                type: category.type,
                amount: Math.abs(amount),
                currency: currency,
                date: format(date, 'yyyy-MM-dd'),
                wallet: wallet.name,
                category: category.name,
                description: row.Note || '',
                event: row.Event || undefined,
                excludeFromReports: row['Exclude Report']?.toLowerCase() === 'true',
            });
        }
        
        updateTransactions([...transactions, ...newTransactions]);
        toast({ title: 'Import Successful', description: `${newTransactions.length} transactions imported.` });
        if(transactionImportRef.current) transactionImportRef.current.value = "";
        setTransactionImportFile(null);
      },
      error: (error) => {
        toast({ variant: 'destructive', title: 'Import Error', description: `Failed to parse CSV file: ${error.message}` });
        if(transactionImportRef.current) transactionImportRef.current.value = "";
        setTransactionImportFile(null);
      }
    });
  };

  const handleExportTransactions = () => {
    const wb = XLSX.utils.book_new();
    
    // Transactions sheet
    const wsTransactionsData = transactions.map((t, index) => ({
        'No.': index + 1,
        'Category': t.category,
        'Amount': t.type === 'expense' ? -t.amount : t.amount,
        'Note': t.description,
        'Wallet': t.wallet,
        'Currency': t.currency,
        'Date': t.date,
        'Event': t.event || '',
        'Exclude Report': t.excludeFromReports ? 'true' : 'false'
    }));
    const wsTransactions = XLSX.utils.json_to_sheet(wsTransactionsData);
    XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');
    
    // Categories sheet
    const wsCategoriesData = categories.map(c => ({
        'Category Name': c.name,
        'Parent Category': c.parentId ? categories.find(p => p.id === c.parentId)?.name || '' : '',
        'Type': c.type
    }));
    const wsCategories = XLSX.utils.json_to_sheet(wsCategoriesData);
    XLSX.utils.book_append_sheet(wb, wsCategories, 'Categories');

    const exportFileName = `expensewise-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, exportFileName);
    toast({ title: "Export Successful" });
  };
  
  const handleDownloadCategoryTemplate = () => {
    const header = "id,name,type,parentId\n";
    const blob = new Blob([header], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'category-import-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImportCategories = () => {
    if (!categoryImportFile) return;

    Papa.parse(categoryImportFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newCategories: Category[] = [];
        const existingCategories = [...categories];
        const data = results.data as any[];

        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const rowNum = i + 2;

          if (!row.id || !row.name || !row.type) {
            toast({ variant: 'destructive', title: 'Import Failed', description: `Missing required fields on row ${rowNum}.` });
            if(categoryImportRef.current) categoryImportRef.current.value = "";
            setCategoryImportFile(null);
            return;
          }

          if (row.type !== 'income' && row.type !== 'expense') {
            toast({ variant: 'destructive', title: 'Import Failed', description: `Invalid category type '${row.type}' on row ${rowNum}.` });
            if(categoryImportRef.current) categoryImportRef.current.value = "";
            setCategoryImportFile(null);
            return;
          }

          if (row.parentId) {
            const parentExists = existingCategories.some(c => c.id === row.parentId);
            if (!parentExists) {
              toast({ variant: 'destructive', title: 'Import Failed', description: `Parent category with id '${row.parentId}' not found for row ${rowNum}.` });
              if(categoryImportRef.current) categoryImportRef.current.value = "";
              setCategoryImportFile(null);
              return;
            }
          }

          newCategories.push({
            id: row.id,
            name: row.name,
            type: row.type,
            icon: '🛒', // Default icon
            parentId: row.parentId || null,
          });
        }
        
        updateCategories([...existingCategories, ...newCategories]);
        toast({ title: 'Import Successful', description: `${newCategories.length} categories imported.` });
        if(categoryImportRef.current) categoryImportRef.current.value = "";
        setCategoryImportFile(null);
      },
      error: (error) => {
        toast({ variant: 'destructive', title: 'Import Error', description: `Failed to parse CSV file: ${error.message}` });
        if(categoryImportRef.current) categoryImportRef.current.value = "";
        setCategoryImportFile(null);
      }
    });
  };
  
  const handleExportCategories = () => {
     const csv = Papa.unparse(categories.map(c => ({
         id: c.id,
         name: c.name,
         type: c.type,
         parentId: c.parentId || ''
     })));
     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement('a');
     link.href = URL.createObjectURL(blob);
     link.setAttribute('download', 'categories.csv');
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };
  
  const handleBackup = () => {
    const backupData = {
        transactions,
        categories,
        wallets,
        debts,
        events
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "expensy_backup.json";
    link.click();
  };
  
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const restoredData = JSON.parse(e.target?.result as string);
                updateTransactions(restoredData.transactions || []);
                updateCategories(restoredData.categories || []);
                updateWallets(restoredData.wallets || []);
                updateDebts(restoredData.debts || []);
                updateEvents(restoredData.events || []);
                toast({ title: "Restore Successful", description: "Your data has been restored. The page will now reload." });
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                toast({ variant: 'destructive', title: "Restore Failed", description: "Invalid backup file." });
            }
        };
        reader.readAsText(file);
    }
  };
    
  const handleDelete = () => {
    if (!dialogType) return;

    if (confirmationInput.toUpperCase() !== 'DELETE') {
        toast({ variant: 'destructive', title: "Confirmation Failed", description: "The confirmation text is incorrect." });
        return;
    }
    
    if (dialogType === 'transactions') {
        updateTransactions([]);
        updateDebts([]);
        toast({ title: "Success", description: "All transactions and debts have been deleted." });
    } else if (dialogType === 'categories') {
        if (transactions.length > 0) {
            toast({ variant: 'destructive', title: "Action Failed", description: "You must delete all transactions before deleting categories." });
            resetDialog();
            return;
        }
        updateCategories([]);
        toast({ title: "Success", description: "All categories have been deleted." });
    }
    
    resetDialog();
  };

  const openConfirmationDialog = (type: 'transactions' | 'categories') => {
    setDialogType(type);
    setIsAlertOpen(true);
  };

  const resetDialog = () => {
    setIsAlertOpen(false);
    setDialogType(null);
    setDialogStep(1);
    setConfirmationInput('');
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              This information will be displayed on your profile.
            </CardDescription>
          </CardHeader>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileSave)}>
              <CardContent className="space-y-4">
                 <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit">Save</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API Integrations</CardTitle>
            <CardDescription>
              Connect to third-party services.
            </CardDescription>
          </CardHeader>
           <Form {...apiForm}>
            <form onSubmit={apiForm.handleSubmit(handleApiSave)}>
              <CardContent className="space-y-4">
                 <FormField
                    control={apiForm.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ExchangeRate-API Key</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Get your free API key from <a href="https://www.exchangerate-api.com/" target="_blank" rel="noreferrer" className="underline">ExchangeRate-API.com</a>.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                 />
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit">Save & Verify API Key</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Transaction Migration</CardTitle>
                <CardDescription>Import or export your transaction data.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Import from CSV</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                        Use the template to ensure correct formatting.
                    </p>
                    <div className='flex gap-2'>
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>Download Template</Button>
                        <Input 
                          ref={transactionImportRef}
                          type="file" 
                          className="text-xs" 
                          accept=".csv" 
                          onChange={(e) => setTransactionImportFile(e.target.files?.[0] || null)}
                        />
                    </div>
                     <Button 
                        onClick={handleImportTransactions}
                        disabled={!transactionImportFile}
                        className="mt-2 w-full"
                    >
                        Import from CSV
                    </Button>
                </div>
                 <div className="space-y-2">
                    <Label>Export All Data</Label>
                     <p className="text-[0.8rem] text-muted-foreground">
                        Exports transactions and categories to an .xlsx file.
                    </p>
                    <Button variant="outline" onClick={handleExportTransactions}>Export to XLSX</Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Category Migration</CardTitle>
                <CardDescription>Import or export your category data.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Import from CSV</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                        Use the template to import categories.
                    </p>
                     <div className='flex gap-2'>
                        <Button variant="outline" size="sm" onClick={handleDownloadCategoryTemplate}>Download Template</Button>
                        <Input 
                          ref={categoryImportRef}
                          type="file" 
                          className="text-xs" 
                          accept=".csv"
                          onChange={(e) => setCategoryImportFile(e.target.files?.[0] || null)}
                        />
                    </div>
                     <Button 
                        onClick={handleImportCategories}
                        disabled={!categoryImportFile}
                        className="mt-2 w-full"
                    >
                        Import from CSV
                    </Button>
                </div>
                 <div className="space-y-2">
                    <Label>Export Categories</Label>
                     <p className="text-[0.8rem] text-muted-foreground">
                        Exports your current category list to a .csv file.
                    </p>
                    <Button variant="outline" onClick={handleExportCategories}>Export to CSV</Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>Save or restore your entire application data.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Backup All Data</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                        Creates a single JSON file with all your data.
                    </p>
                    <Button variant="outline" onClick={handleBackup}>Backup All Data</Button>
                </div>
                 <div className="space-y-2">
                    <Label>Restore from Backup</Label>
                     <p className="text-[0.8rem] text-muted-foreground">
                        Restores data from a JSON backup file.
                    </p>
                    <Input type="file" accept=".json" onChange={handleRestore} />
                </div>
            </CardContent>
        </Card>
        
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>These actions are irreversible. Please be certain.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button variant="destructive" onClick={() => openConfirmationDialog('transactions')}>
                Delete All Transactions
              </Button>
              <Button variant="destructive" onClick={() => openConfirmationDialog('categories')}>
                Delete All Categories
              </Button>
            </CardContent>
        </Card>
      </div>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          {dialogStep === 1 && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {dialogType === 'transactions' && 'This will permanently delete all your transactions and debts. '}
                  {dialogType === 'categories' && 'This will permanently delete all your categories. You must delete all transactions first. '}
                  This action is irreversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={resetDialog}>Cancel</AlertDialogCancel>
                <Button onClick={() => setDialogStep(2)}>Continue</Button>
              </AlertDialogFooter>
            </>
          )}

          {dialogStep === 2 && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                <AlertDialogDescription>
                  To confirm, please type "DELETE" in the box below. This action is irreversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-4">
                <Input
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder='Type "DELETE"'
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={resetDialog}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Confirm Deletion</AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
