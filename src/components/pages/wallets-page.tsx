
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MoreHorizontal,
  PlusCircle,
  Landmark,
  CreditCard,
  PiggyBank,
  Wallet as WalletIcon,
  CircleDollarSign,
  HelpCircle,
  Star,
} from 'lucide-react';
import { wallets as initialWallets, transactions, updateWallets } from '@/lib/data';
import type { Wallet } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { LucideIcon } from 'lucide-react';

const walletIcons: { name: string; icon: LucideIcon }[] = [
  { name: 'Landmark', icon: Landmark },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'PiggyBank', icon: PiggyBank },
  { name: 'Wallet', icon: WalletIcon },
  { name: 'CircleDollarSign', icon: CircleDollarSign },
];

const walletSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  icon: z.string().min(1, 'Please select an icon.'),
});

type WalletFormData = z.infer<typeof walletSchema>;

function getIconComponent(iconName: string | undefined): LucideIcon {
  if (!iconName) return HelpCircle;
  const iconItem = walletIcons.find((item) => item.name === iconName);
  return iconItem ? iconItem.icon : HelpCircle;
}

function getIconName(IconComponent: LucideIcon): string {
    const iconItem = walletIcons.find(item => item.icon === IconComponent);
    return iconItem ? item.name : 'HelpCircle';
}

export function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  const { toast } = useToast();

  const form = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: '',
      icon: 'Wallet',
    },
  });

  const updateAndSaveWallets = (newWallets: Wallet[]) => {
    setWallets(newWallets);
    updateWallets(newWallets);
  };

  const openAddDialog = () => {
    setSelectedWallet(null);
    form.reset({
      name: '',
      icon: 'Wallet',
    });
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    form.reset({
      name: wallet.name,
      icon: getIconName(wallet.icon),
    });
    setIsDialogOpen(true);
  };

  const openDeleteAlert = (wallet: Wallet) => {
    if (wallet.isDefault) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Cannot delete the default wallet.',
      });
      return;
    }
    if (transactions.some(t => t.wallet === wallet.name)) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Cannot delete wallet as it is associated with transactions.',
      });
      return;
    }
    setWalletToDelete(wallet);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (walletToDelete) {
      const newWallets = wallets.filter((w) => w.id !== walletToDelete.id);
      updateAndSaveWallets(newWallets);
      toast({ title: 'Success', description: 'Wallet deleted successfully.' });
      setIsDeleteAlertOpen(false);
      setWalletToDelete(null);
    }
  };

  const handleFormSubmit = (data: WalletFormData) => {
    if (selectedWallet) {
      const updatedWallet: Wallet = {
        ...selectedWallet,
        name: data.name,
        icon: getIconComponent(data.icon),
      };
      const newWallets = wallets.map((w) => (w.id === selectedWallet.id ? updatedWallet : w));
      updateAndSaveWallets(newWallets);
      toast({ title: 'Success', description: 'Wallet updated successfully.' });
    } else {
      const newWallet: Wallet = {
        id: `wallet-${Date.now()}`,
        name: data.name,
        icon: getIconComponent(data.icon),
        currency: 'SAR',
        balance: 0,
        isDefault: false,
      };
      const newWallets = [...wallets, newWallet];
      updateAndSaveWallets(newWallets);
      toast({ title: 'Success', description: 'Wallet created successfully.' });
    }
    setIsDialogOpen(false);
  };

  const handleSetDefault = (walletId: string) => {
    const newWallets = wallets.map((w) => ({
        ...w,
        isDefault: w.id === walletId,
    }));
    updateAndSaveWallets(newWallets);
    toast({ title: 'Success', description: 'Default wallet updated.' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wallets</h2>
          <p className="text-muted-foreground">
            Manage your accounts and wallets.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Wallet
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wallets.map((wallet) => {
          const Icon = wallet.icon;
          return (
            <Card key={wallet.id} className={cn("flex flex-col", wallet.isDefault && "border-primary")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                    <CardTitle className="text-xl">{wallet.name}</CardTitle>
                    {wallet.isDefault && (
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem
                        onClick={() => handleSetDefault(wallet.id)}
                        disabled={wallet.isDefault}
                      >
                        Set as default
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(wallet)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => openDeleteAlert(wallet)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  <Badge variant="outline">{wallet.currency}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p
                  className={cn(
                    'text-3xl font-bold',
                    wallet.balance < 0 ? 'text-red-500' : 'text-foreground'
                  )}
                >
                  {wallet.balance < 0 ? '-' : ''}
                  {Math.abs(wallet.balance).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} SAR
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedWallet ? 'Edit Wallet' : 'Add New Wallet'}
            </DialogTitle>
            <DialogDescription>
              {selectedWallet
                ? 'Update the details of your wallet.'
                : 'Create a new wallet to track your finances.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Savings Account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {walletIcons.map(({ name, icon: Icon }) => (
                          <SelectItem key={name} value={name}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedWallet ? 'Save Changes' : 'Create Wallet'}
                </Button>
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
              This action cannot be undone. This will permanently delete the
              wallet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
