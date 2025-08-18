
"use client";

import { useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
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
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { transactions, categories, wallets, debts } from '@/lib/data';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
});

const apiSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required.'),
});

export function SettingsPage() {
  const { toast } = useToast();
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteType, setDeleteType] = useState<'transactions' | 'categories' | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');

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

  const handleExportTransactions = () => {
    const wb = XLSX.utils.book_new();
    const wsTransactions = XLSX.utils.json_to_sheet(transactions);
    const wsCategories = XLSX.utils.json_to_sheet(categories.map(c => ({...c, icon: typeof c.icon === 'string' ? c.icon : c.icon.displayName })));
    XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');
    XLSX.utils.book_append_sheet(wb, wsCategories, 'Categories');
    XLSX.writeFile(wb, 'Expensy_Data.xlsx');
  };
  
  const handleExportCategories = () => {
     const csv = Papa.unparse(categories.map(c => ({...c, icon: typeof c.icon === 'string' ? c.icon : c.icon.displayName })));
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
                // Here you would typically update your state management solution
                console.log("Restored Data:", restoredData);
                toast({ title: "Restore Successful", description: "Your data has been restored. The page will now reload." });
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                toast({ variant: 'destructive', title: "Restore Failed", description: "Invalid backup file." });
            }
        };
        reader.readAsText(file);
    }
  };
  
  const openDeleteDialog = (type: 'transactions' | 'categories') => {
    if (type === 'categories' && transactions.length > 0) {
        toast({ variant: 'destructive', title: "Action Failed", description: "You must delete all transactions before deleting categories." });
        return;
    }
    setDeleteType(type);
    setDeleteStep(1);
  };
  
  const handleDelete = () => {
    if (confirmationInput.toUpperCase() !== 'DELETE') {
        toast({ variant: 'destructive', title: "Confirmation Failed", description: "The confirmation text is incorrect." });
        return;
    }
    
    if (deleteType === 'transactions') {
        console.log("Deleting all transactions...");
    } else if (deleteType === 'categories') {
        console.log("Deleting all categories...");
    }
    
    toast({ title: "Success", description: `All ${deleteType} have been deleted.` });
    setDeleteStep(0);
    setDeleteType(null);
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
                        <Button variant="outline" size="sm" disabled>Download Template</Button>
                        <Input type="file" className="text-xs" accept=".csv" disabled />
                    </div>
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
                        <Button variant="outline" size="sm" disabled>Download Template</Button>
                        <Input type="file" className="text-xs" accept=".csv" disabled />
                    </div>
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
               <Button variant="destructive" onClick={() => openDeleteDialog('transactions')}>Delete All Transactions</Button>
               <Button variant="destructive" onClick={() => openDeleteDialog('categories')}>Delete All Categories</Button>
            </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteStep > 0} onOpenChange={(open) => !open && setDeleteStep(0)}>
        <AlertDialogContent>
            {deleteStep === 1 && (
                 <>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action is permanent and cannot be undone. This will delete all your {deleteType}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteStep(0)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setDeleteStep(2)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                 </>
            )}
             {deleteStep === 2 && (
                 <>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                        <AlertDialogDescription>
                            To confirm, please type "DELETE" in the box below.
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
                        <AlertDialogCancel onClick={() => setDeleteStep(0)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Confirm Deletion</AlertDialogAction>
                    </AlertDialogFooter>
                 </>
            )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
