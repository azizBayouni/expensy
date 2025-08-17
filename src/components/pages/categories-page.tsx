"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { categories as initialCategories } from '@/lib/data';
import type { Category } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleDelete = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const CategoryList = ({
    list,
    title,
  }: {
    list: Category[];
    title: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title} Categories</span>
          <Button size="sm" variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add {title}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {list.map((category) => (
            <li
              key={category.id}
              className="flex items-center p-2 transition-colors rounded-md hover:bg-muted/50"
            >
              <category.icon className="w-5 h-5 mr-3 text-muted-foreground" />
              <span className="flex-1 font-medium">{category.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-8 h-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(category.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="expense" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="expense">Expense</TabsTrigger>
        <TabsTrigger value="income">Income</TabsTrigger>
      </TabsList>
      <TabsContent value="expense">
        <CategoryList list={expenseCategories} title="Expense" />
      </TabsContent>
      <TabsContent value="income">
        <CategoryList list={incomeCategories} title="Income" />
      </TabsContent>
    </Tabs>
  );
}
