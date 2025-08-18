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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { wallets as initialWallets } from '@/lib/data';
import type { Wallet } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wallets</h2>
          <p className="text-muted-foreground">
            Manage your accounts and wallets.
          </p>
        </div>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Wallet
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wallets.map((wallet) => {
          const Icon = wallet.icon;
          return (
            <Card key={wallet.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                    <CardTitle className="text-xl">{wallet.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  <Badge variant="outline">{wallet.currency}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p 
                  className={cn("text-3xl font-bold", wallet.balance < 0 ? 'text-red-500' : 'text-foreground')}
                >
                  {wallet.balance < 0 ? '-' : ''}${Math.abs(wallet.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
