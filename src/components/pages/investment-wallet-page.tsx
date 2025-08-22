
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Asset } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { InvestmentForm } from '../investment-form';

export function InvestmentWalletPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { toast } = useToast();

  const { investmentAssets, totalBalance } = useMemo(() => {
    const accounts = assets.filter((a) => a.type === 'Investment');
    const total = accounts.reduce((acc, a) => acc + a.value, 0);
    return { investmentAssets: accounts, totalBalance: total };
  }, [assets]);
  
  const saveAssets = (newAssets: Asset[]) => {
    setAssets(newAssets);
    updateAssets(newAssets);
  };
  
  const openAddDialog = () => {
    setSelectedAsset(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDialogOpen(true);
  };
  
  const openDeleteAlert = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedAsset) {
      saveAssets(assets.filter((a) => a.name !== selectedAsset.name));
      toast({ title: 'Success', description: 'Investment deleted successfully.' });
      setIsDeleteAlertOpen(false);
      setSelectedAsset(null);
      setIsDialogOpen(false);
    }
  };

  const handleFormSubmit = (data: Asset) => {
    if (selectedAsset) {
      saveAssets(assets.map((a) => (a.name === selectedAsset.name ? data : a)));
      toast({ title: 'Success', description: 'Investment updated successfully.' });
    } else {
      saveAssets([...assets, data]);
      toast({ title: 'Success', description: 'Investment created successfully.' });
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
                <h2 className="text-2xl font-bold tracking-tight">Investment Wallet</h2>
                <p className="text-muted-foreground">
                    A detailed view of your investment assets.
                </p>
            </div>
        </div>
        <Button onClick={openAddDialog}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Investment
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Investment Value</CardTitle>
          <CardDescription>The sum of all your investment assets.</CardDescription>
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
          <CardTitle>Investments</CardTitle>
          <CardDescription>A list of your individual investment assets.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Units</TableHead>
                        <TableHead className="text-right">Price/Unit</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                        <TableHead className="text-right">Growth (%)</TableHead>
                        <TableHead>Maturity Date</TableHead>
                        <TableHead className="text-right">Est. Return</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {investmentAssets.map((asset) => (
                    <TableRow key={asset.name} onClick={() => openEditDialog(asset)} className="cursor-pointer">
                        <TableCell className="font-medium">{asset.platform || 'N/A'}</TableCell>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{asset.assetType || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{asset.units?.toLocaleString() || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                            {asset.pricePerUnit?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                            {asset.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </TableCell>
                        <TableCell className={cn("text-right", asset.growth && asset.growth > 0 ? 'text-green-500' : 'text-red-500')}>
                            {asset.growth?.toFixed(2) || 'N/A'}%
                        </TableCell>
                        <TableCell>
                            {asset.maturityDate ? format(new Date(asset.maturityDate), 'dd MMM yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                             {asset.estimatedReturnValue?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'N/A'}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
           </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedAsset ? 'Edit Investment' : 'Add New Investment'}</DialogTitle>
              <DialogDescription>
                {selectedAsset ? 'Update your investment details.' : 'Create a new investment asset.'}
              </DialogDescription>
            </DialogHeader>
            <InvestmentForm
                asset={selectedAsset}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsDialogOpen(false)}
                onDelete={() => selectedAsset && openDeleteAlert(selectedAsset)}
            />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this investment.
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
