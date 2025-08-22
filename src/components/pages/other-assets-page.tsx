
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

export function OtherAssetsPage() {
  const router = useRouter();
  const { otherAssets, totalValue } = useMemo(() => {
    const accounts = assets.filter((a) => a.type === 'Other');
    const total = accounts.reduce((acc, a) => acc + a.value, 0);
    return { otherAssets: accounts, totalValue: total };
  }, []);

  return (
    <div className="space-y-6">
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
      
      <Card>
        <CardHeader>
          <CardTitle>Total Value of Other Assets</CardTitle>
          <CardDescription>The sum of all your other assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {totalValue.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
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
                    <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {otherAssets.map((asset) => (
                    <TableRow key={asset.name}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell className="text-right">
                        {asset.value.toLocaleString('en-US', {
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
