
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '../ui/badge';
import * as XLSX from 'xlsx';
import { Label } from '../ui/label';

const assetSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  value: z.coerce.number().min(0, 'Value must be a non-negative number.'),
  type: z.string().min(1, 'Type is required.'),
});

type AssetFormData = z.infer<typeof assetSchema>;


export function OtherAssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      value: 0,
      type: '',
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
    form.reset({ name: '', value: 0, type: '' });
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    form.reset({
      name: asset.name,
      value: asset.value,
      type: asset.type,
    });
    setIsFormDialogOpen(true);
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
      setIsFormDialogOpen(false);
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
    setIsFormDialogOpen(false);
  };

  const handleDownloadTemplate = () => {
    const dataToExport = otherAssets.map(asset => ({
        'Asset Name': asset.name,
        'Type': asset.type,
        'Value': asset.value,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Other Assets");
    XLSX.writeFile(workbook, "other_assets_template.xlsx");
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

            const importedAssets = json.map((row: any): Asset => ({
                name: row['Asset Name'],
                type: row['Type'],
                value: Number(row['Value']) || 0,
            })).filter(asset => asset.name && asset.type);
            
            const bankAndInvestmentAssets = assets.filter(a => a.type === 'Bank Account' || a.type === 'Investment');
            saveAssets([...bankAndInvestmentAssets, ...importedAssets]);

            toast({ title: 'Success', description: 'Other assets updated successfully from file.' });
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
                <h2 className="text-2xl font-bold tracking-tight">Other Assets</h2>
                <p className="text-muted-foreground">
                    A detailed view of your other assets.
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
                        <DialogTitle>Bulk Update Other Assets</DialogTitle>
                        <DialogDescription>
                            Download the template, update it, and re-upload to bulk update your assets.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Button onClick={handleDownloadTemplate} className="w-full">
                            Download Template (.xlsx)
                        </Button>
                        <div className="space-y-2">
                          <Label htmlFor="file-upload">Upload Template</Label>
                          <Input id="file-upload" type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} />
                          <p className="text-xs text-muted-foreground">Upload the edited Excel file to update your assets.</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Button onClick={openAddDialog}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Asset
            </Button>
        </div>
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
                    {otherAssets.map((asset, index) => (
                    <TableRow key={`${asset.name}-${index}`} onClick={() => openEditDialog(asset)} className="cursor-pointer">
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

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
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
                <Button type="button" variant="outline" onClick={() => setIsFormDialogOpen(false)}>Cancel</Button>
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

    