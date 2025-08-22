
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { assets as initialAssets, updateAssets } from '@/lib/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Asset } from '@/types';
import { useToast } from '@/hooks/use-toast';
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

const assetSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  bankName: z.string().min(2, 'Bank name is required.'),
  value: z.coerce.number().min(0, 'Balance must be a non-negative number.'),
});

type AssetFormData = z.infer<typeof assetSchema>;

export function BankAccountsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { toast } = useToast();

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
  });

  const { bankAccounts, totalBalance } = useMemo(() => {
    const accounts = assets.filter((a) => a.type === 'Bank Account');
    const total = accounts.reduce((acc, a) => acc + a.value, 0);
    return { bankAccounts: accounts, totalBalance: total };
  }, [assets]);
  
  const saveAssets = (newAssets: Asset[]) => {
    setAssets(newAssets);
    updateAssets(newAssets);
  };

  const openAddDialog = () => {
    setSelectedAsset(null);
    form.reset({ name: '', bankName: '', value: 0 });
    setIsDialogOpen(true);
  };

  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    form.reset({
      name: asset.name,
      bankName: asset.bankName || '',
      value: asset.value,
    });
    setIsDialogOpen(true);
  };

  const openDeleteAlert = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedAsset) {
      saveAssets(assets.filter((a) => a.name !== selectedAsset.name));
      toast({ title: 'Success', description: 'Bank account deleted successfully.' });
      setIsDeleteAlertOpen(false);
      setSelectedAsset(null);
      setIsDialogOpen(false);
    }
  };

  const handleFormSubmit = (data: AssetFormData) => {
    if (selectedAsset) {
      const updatedAsset: Asset = { ...selectedAsset, ...data, type: 'Bank Account' };
      saveAssets(assets.map((a) => (a.name === selectedAsset.name ? updatedAsset : a)));
      toast({ title: 'Success', description: 'Account updated successfully.' });
    } else {
      const newAsset: Asset = { ...data, type: 'Bank Account' };
      saveAssets([...assets, newAsset]);
      toast({ title: 'Success', description: 'Account created successfully.' });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Bank Accounts</h2>
                <p className="text-muted-foreground">
                    A detailed view of your bank account balances.
                </p>
            </div>
        </div>
        <Button onClick={openAddDialog}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Bank Account
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
          <CardDescription>The sum of all your bank accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {totalBalance.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>A list of your individual bank accounts.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Bank Name</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bankAccounts.map((account) => (
                    <TableRow key={account.name} onClick={() => openEditDialog(account)} className="cursor-pointer">
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>{account.bankName}</TableCell>
                        <TableCell className="text-right">
                        {account.value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                        })}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
           </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAsset ? 'Edit Account' : 'Add New Account'}</DialogTitle>
            <DialogDescription>
              {selectedAsset ? 'Update your bank account details.' : 'Create a new bank account.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Checking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ABC Bank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Balance</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1000.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                {selectedAsset && (
                    <Button type="button" variant="destructive" className="mr-auto" onClick={() => openDeleteAlert(selectedAsset)}>Delete</Button>
                )}
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{selectedAsset ? 'Save Changes' : 'Create Account'}</Button>
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
              This action cannot be undone. This will permanently delete this bank account.
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
