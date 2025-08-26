
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
import { Badge } from '../ui/badge';

const assetSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  value: z.coerce.number().min(0, 'Value must be a non-negative number.'),
  type: z.string().min(1, 'Type is required.'),
});

type AssetFormData = z.infer<typeof assetSchema>;


export function OtherAssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { toast } = useToast();

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      value: 0,
      type: 'Other',
    }
  });

  const { otherAssets, totalValue } = useMemo(() => {
    const accounts = assets.filter((a) => a.type !== 'Bank Account' && a.type !== 'Investment');
    const total = accounts.reduce((acc, a) => acc + a.value, 0);
    return { otherAssets: accounts, totalValue: total };
  }, [assets]);

  const saveAssets = (newAssets: Asset[]) => {
    setAssets(newAssets);
    updateAssets(newAssets);
  };

  const openAddDialog = () => {
    setSelectedAsset(null);
    form.reset({ name: '', value: 0, type: 'Other' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    form.reset({
      name: asset.name,
      value: asset.value,
      type: asset.type,
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
      toast({ title: 'Success', description: 'Asset deleted successfully.' });
      setIsDeleteAlertOpen(false);
      setSelectedAsset(null);
      setIsDialogOpen(false);
    }
  };

  const handleFormSubmit = (data: AssetFormData) => {
    if (selectedAsset) {
      const updatedAsset: Asset = { ...selectedAsset, ...data };
      saveAssets(assets.map((a) => (a.name === selectedAsset.name ? updatedAsset : a)));
      toast({ title: 'Success', description: 'Asset updated successfully.' });
    } else {
      const newAsset: Asset = { ...data };
      saveAssets([...assets, newAsset]);
      toast({ title: 'Success', description: 'Asset created successfully.' });
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
                <h2 className="text-2xl font-bold tracking-tight">Other Assets</h2>
                <p className="text-muted-foreground">
                    A detailed view of your other assets.
                </p>
            </div>
        </div>
        <Button onClick={openAddDialog}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Asset
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Value of Other Assets</CardTitle>
          <CardDescription>The sum of all your other assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {totalValue.toLocaleString('en-US', {
              style: 'currency',
              currency: 'SAR',
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>A list of your individual other assets.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {otherAssets.map((asset) => (
                    <TableRow key={asset.name} onClick={() => openEditDialog(asset)} className="cursor-pointer">
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{asset.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        {asset.value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'SAR',
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
            <DialogTitle>{selectedAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {selectedAsset ? 'Update your asset details.' : 'Create a new asset.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Primary Residence" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Type</FormLabel>
                     <FormControl>
                      <Input placeholder="e.g., Real Estate, Vehicle" {...field} />
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
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="450000.00" {...field} />
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
                <Button type="submit">{selectedAsset ? 'Save Changes' : 'Create Asset'}</Button>
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
              This action cannot be undone. This will permanently delete this asset.
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
