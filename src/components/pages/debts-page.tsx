"use client";

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { debts as initialDebts } from '@/lib/data';
import type { Debt } from '@/types';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>(initialDebts);

  const payables = debts.filter((d) => d.type === 'payable');
  const receivables = debts.filter((d) => d.type === 'receivable');

  const DebtTable = ({
    list,
    title,
  }: {
    list: Debt[];
    title: 'Payable' | 'Receivable';
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}s</span>
          <Button size="sm" variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add {title}
          </Button>
        </CardTitle>
        <CardDescription>
          {title === 'Payable'
            ? 'Money you owe to others.'
            : 'Money others owe to you.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {title === 'Payable' ? 'Creditor' : 'Debtor'}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell className="font-medium">{debt.person}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        debt.status === 'paid'
                          ? 'default'
                          : debt.status === 'partial'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className={cn(
                        debt.status === 'paid' && 'bg-green-500',
                        debt.status === 'partial' && 'bg-yellow-500'
                      )}
                    >
                      {debt.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(debt.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold">
                      ${debt.amount.toFixed(2)}
                    </div>
                    {debt.status !== 'unpaid' && (
                      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                        <span>
                          Paid: ${debt.paidAmount.toFixed(2)}
                        </span>
                        <Progress
                          value={(debt.paidAmount / debt.amount) * 100}
                          className="w-20 h-1"
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-8 h-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                        <DropdownMenuItem>Add Payment</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="payables" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="payables">Payables</TabsTrigger>
        <TabsTrigger value="receivables">Receivables</TabsTrigger>
      </TabsList>
      <TabsContent value="payables">
        <DebtTable list={payables} title="Payable" />
      </TabsContent>
      <TabsContent value="receivables">
        <DebtTable list={receivables} title="Receivable" />
      </TabsContent>
    </Tabs>
  );
}
