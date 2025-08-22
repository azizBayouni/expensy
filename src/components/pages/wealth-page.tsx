
"use client";

import { useMemo } from 'react';
import { assets } from '@/lib/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import Link from 'next/link';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export function WealthPage() {
  const {
    totalBankBalance,
    totalInvestments,
    totalOtherAssets,
    totalLiabilities,
    netWorth,
    chartData,
  } = useMemo(() => {
    const totalBankBalance = assets
      .filter((a) => a.type === 'Bank Account')
      .reduce((acc, a) => acc + a.value, 0);
    const totalInvestments = assets
      .filter((a) => a.type === 'Investment' && a.status === 'active')
      .reduce((acc, a) => acc + a.value, 0);
    const totalOtherAssets = assets
      .filter((a) => a.type === 'Other')
      .reduce((acc, a) => acc + a.value, 0);
    const totalLiabilities = 0; // Assuming no liabilities for now
    const totalAssets = totalBankBalance + totalInvestments + totalOtherAssets;
    const netWorth = totalAssets - totalLiabilities;

    const chartData = [
      { name: 'Bank Accounts', value: totalBankBalance, fill: 'hsl(var(--chart-1))' },
      { name: 'Investments', value: totalInvestments, fill: 'hsl(var(--chart-2))' },
      { name: 'Other Assets', value: totalOtherAssets, fill: 'hsl(var(--chart-3))' },
    ].filter(d => d.value > 0);

    return {
      totalBankBalance,
      totalInvestments,
      totalOtherAssets,
      totalLiabilities,
      netWorth,
      chartData,
    };
  }, []);

  const summaryData = [
    { metric: 'Total Bank Balance', value: totalBankBalance, href: '/wealth/bank-accounts' },
    { metric: 'Total Investments', value: totalInvestments, href: '/wealth/investment-wallet' },
    { metric: 'Total Other Assets', value: totalOtherAssets, href: '/wealth/other-assets' },
    { metric: 'Total Liabilities', value: totalLiabilities },
  ];
  
  const chartConfig = {
      value: {
        label: "Value",
      },
      ...Object.fromEntries(
        chartData.map((item) => [
          item.name,
          {
            label: item.name,
            color: item.fill,
          },
        ])
      )
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wealth Overview</h2>
          <p className="text-muted-foreground">
            Your personal wealth statement.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Net Worth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {netWorth.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'SAR',
                })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {summaryData.map((item) => (
                    <TableRow key={item.metric}>
                      <TableCell className="font-medium">
                        {item.href ? (
                          <Link href={item.href} className="hover:underline">
                            {item.metric}
                          </Link>
                        ) : (
                          item.metric
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.value.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'SAR',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                        content={<ChartTooltipContent nameKey="name" hideLabel />}
                    />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      innerRadius="60%"
                      labelLine={false}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                        index,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 1.2;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="hsl(var(--foreground))"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="text-xs"
                          >
                            {`${chartData[index].name} (${(percent * 100).toFixed(1)}%)`}
                          </text>
                        );
                      }}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
