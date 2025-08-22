
"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { assets } from '@/lib/data';
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
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export function BankAccountsPage() {
  const router = useRouter();
  const { bankAccounts, totalBalance } = useMemo(() => {
    const accounts = assets.filter((a) => a.type === 'Bank Account');
    const total = accounts.reduce((acc, a) => acc + a.value, 0);
    return { bankAccounts: accounts, totalBalance: total };
  }, []);

  return (
    <div className="space-y-6">
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
                    <TableRow key={account.name}>
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
    </div>
  );
}
