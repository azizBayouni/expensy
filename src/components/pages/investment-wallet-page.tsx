
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function InvestmentWalletPage() {
  const router = useRouter();
  const { investmentAssets, totalBalance } = useMemo(() => {
    const accounts = assets.filter((a) => a.type === 'Investment');
    const total = accounts.reduce((acc, a) => acc + a.value, 0);
    return { investmentAssets: accounts, totalBalance: total };
  }, []);

  return (
    <div className="space-y-6">
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
                    <TableRow key={asset.name}>
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
    </div>
  );
}
