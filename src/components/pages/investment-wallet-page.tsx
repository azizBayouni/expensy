
"use client";

import { useState, useMemo, useRef } from 'react';
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
import { ChevronLeft, PlusCircle, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parse, isValid } from 'date-fns';
import type { Asset } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import * as XLSX from 'xlsx';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export function InvestmentWalletPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { investmentAssets, totalBalance } = useMemo(() => {
    const accounts = assets.filter((a) => a.type === 'Investment' && a.status === 'active');
    const total = accounts.reduce((acc, a) => acc + a.value, 0);
    return { investmentAssets: accounts, totalBalance: total };
  }, [assets]);
  
  const saveAssets = (newAssets: Asset[]) => {
    setAssets(newAssets);
    updateAssets(newAssets);
  };
  
  const openAddDialog = () => {
    setSelectedAsset(null);
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsFormDialogOpen(true);
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
      setIsFormDialogOpen(false);
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
    setIsFormDialogOpen(false);
  };
  
  const handleDownloadTemplate = () => {
    const dataToExport = investmentAssets.map(asset => ({
        'Platform': asset.platform,
        'Asset Name': asset.name,
        'Asset Type': asset.assetType,
        'Units': asset.units,
        'Price/Unit': asset.pricePerUnit,
        'Total Value': asset.value,
        'Growth (%)': asset.growth,
        'Maturity Date': asset.maturityDate ? format(new Date(asset.maturityDate), 'yyyy-MM-dd') : '',
        'Est. Return Value': asset.estimatedReturnValue,
        'Status': asset.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Investments");
    XLSX.writeFile(workbook, "investments_template.xlsx");
    toast({ title: 'Success', description: 'Template downloaded successfully.' });
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({ variant: 'destructive', title: 'Error', description: 'No file selected.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet) as any[];

            const importedAssets = json.map((row: any): Asset => {
                const maturityDate = row['Maturity Date'];
                let formattedMaturityDate: string | undefined = undefined;

                if (maturityDate) {
                  if (typeof maturityDate === 'number') {
                    // Handle Excel serial date number
                    const excelEpoch = new Date(1899, 11, 30);
                    const date = new Date(excelEpoch.getTime() + maturityDate * 86400000);
                    if (isValid(date)) {
                        formattedMaturityDate = format(date, 'yyyy-MM-dd');
                    }
                  } else if (typeof maturityDate === 'string' && isValid(new Date(maturityDate))) {
                    // Handle date string `dd/mm/yyyy` and other standard formats
                    const parsedDate = new Date(maturityDate);
                    formattedMaturityDate = format(parsedDate, 'yyyy-MM-dd');
                  }
                }

                return {
                    platform: row['Platform'],
                    name: row['Asset Name'],
                    assetType: row['Asset Type'],
                    units: Number(row['Units']) || undefined,
                    pricePerUnit: Number(row['Price/Unit']) || undefined,
                    value: Number(row['Total Value']) || 0,
                    growth: Number(row['Growth (%)']) || undefined,
                    maturityDate: formattedMaturityDate,
                    estimatedReturnValue: Number(row['Est. Return Value']) || undefined,
                    status: row['Status'] || 'active',
                    type: 'Investment', // Ensure type is set
                };
            }).filter(asset => asset.name); // Filter out any rows that might be missing an asset name
            
            // Overwrite existing assets with the imported assets
            saveAssets(importedAssets);
            toast({ title: 'Success', description: 'Investments updated successfully from file.' });
            setIsBulkUpdateDialogOpen(false);
        } catch (error) {
            console.error("Failed to parse uploaded file", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to process the uploaded file. Please check the format.' });
        } finally {
             if (fileInputRef.current) {
                fileInputRef.current.value = "";
             }
        }
    };
    reader.readAsArrayBuffer(file);
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
                    A detailed view of your active investment assets.
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Dialog open={isBulkUpdateDialogOpen} onOpenChange={setIsBulkUpdateDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Upload className="w-4 h-4" />
                        <span className="sr-only">Bulk Update</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Update Investments</DialogTitle>
                        <DialogDescription>
                            Download the template, update it, and re-upload to bulk update your investments.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Button onClick={handleDownloadTemplate} className="w-full">
                            Download Template (.xlsx)
                        </Button>
                        <div className="space-y-2">
                          <Label htmlFor="file-upload">Upload Template</Label>
                          <Input id="file-upload" type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} />
                          <p className="text-xs text-muted-foreground">Upload the edited Excel file to update your investments.</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Button onClick={openAddDialog}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Investment
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Investment Value</CardTitle>
          <CardDescription>The sum of all your active investment assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {totalBalance.toLocaleString('en-US', {
              style: 'currency',
              currency: 'SAR',
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
                    {investmentAssets.map((asset, index) => (
                    <TableRow key={`${asset.name}-${index}`} onClick={() => openEditDialog(asset)} className="cursor-pointer">
                        <TableCell className="font-medium">{asset.platform || 'N/A'}</TableCell>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{asset.assetType || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{asset.units?.toLocaleString() || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                            {asset.pricePerUnit?.toLocaleString('en-US', { style: 'currency', currency: 'SAR' }) || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                            {asset.value.toLocaleString('en-US', { style: 'currency', currency: 'SAR' })}
                        </TableCell>
                        <TableCell className={cn("text-right", asset.growth && asset.growth > 0 ? 'text-green-500' : 'text-red-500')}>
                            {asset.growth?.toFixed(2) || 'N/A'}%
                        </TableCell>
                        <TableCell>
                            {asset.maturityDate ? format(new Date(asset.maturityDate), 'dd MMM yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                             {asset.estimatedReturnValue?.toLocaleString('en-US', { style: 'currency', currency: 'SAR' }) || 'N/A'}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
           </div>
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
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
                onCancel={() => setIsFormDialogOpen(false)}
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
