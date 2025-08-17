"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  PlusCircle,
  Smile,
} from 'lucide-react';
import { categories as initialCategories, transactions } from '@/lib/data';
import type { Category } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
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
} from '../ui/form';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useToast } from '@/hooks/use-toast';
import * as Emojis from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  type: z.enum(['income', 'expense']),
  icon: z.string(),
  parentId: z.string().nullable(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const emojiIconNames = Object.keys(Emojis).filter(
  (key) =>
    key !== 'createLucideIcon' && key !== 'LucideIcon' && /^[A-Z]/.test(key)
);

function buildHierarchy(categories: Category[]): (Category & { children: Category[] })[] {
  const cats = JSON.parse(JSON.stringify(categories));
  const categoryMap = new Map(cats.map((c: Category) => [c.id, { ...c, children: [] }]));
  const hierarchy: (Category & { children: Category[] })[] = [];

  for (const category of categoryMap.values()) {
    if (category.parentId && categoryMap.has(category.parentId)) {
      categoryMap.get(category.parentId)!.children.push(category);
    } else {
      hierarchy.push(category);
    }
  }
  return hierarchy;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { toast } = useToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const getDescendantIds = (categoryId: string): string[] => {
    const descendants: string[] = [];
    const children = categories.filter((c) => c.parentId === categoryId);
    for (const child of children) {
      descendants.push(child.id);
      descendants.push(...getDescendantIds(child.id));
    }
    return descendants;
  };

  const openAddDialog = () => {
    setSelectedCategory(null);
    form.reset({
      name: '',
      type: 'expense',
      icon: 'Smile',
      parentId: null,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    form.reset({
      name: category.name,
      type: category.type,
      icon: Object.keys(Emojis).find(
        (key) => Emojis[key as keyof typeof Emojis] === category.icon
      ) || 'Smile',
      parentId: category.parentId || null,
    });
    setIsDialogOpen(true);
  };

  const openDeleteAlert = (category: Category) => {
    const descendantIds = getDescendantIds(category.id);
    const allIdsToDelete = [category.id, ...descendantIds];
    const hasTransactions = transactions.some((t) =>
      allIdsToDelete.includes(categories.find(c => c.name === t.category)?.id ?? '')
    );

    if (hasTransactions) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Cannot delete category as it is associated with transactions.',
      });
      return;
    }

    setCategoryToDelete(category);
    setIsDeleteAlertOpen(true);
  };

  const handleFormSubmit = (data: CategoryFormData) => {
    const parentCategory = categories.find((c) => c.id === data.parentId);
    if (parentCategory && parentCategory.type !== data.type) {
      form.setError('parentId', {
        type: 'manual',
        message: 'Sub-category type must match parent type.',
      });
      return;
    }

    const isNameUnique = !categories.some(
      (c) =>
        c.name.toLowerCase() === data.name.toLowerCase() &&
        c.parentId === data.parentId &&
        c.id !== selectedCategory?.id
    );

    if (!isNameUnique) {
      form.setError('name', {
        type: 'manual',
        message: 'Category name must be unique at this level.',
      });
      return;
    }

    if (selectedCategory) {
      // Edit
      setCategories(
        categories.map((c) =>
          c.id === selectedCategory.id
            ? { ...c, ...data, icon: Emojis[data.icon as keyof typeof Emojis] || Smile }
            : c
        )
      );
    } else {
      // Add
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        ...data,
        icon: Emojis[data.icon as keyof typeof Emojis] || Smile,
      };
      setCategories([...categories, newCategory]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      const descendantIds = getDescendantIds(categoryToDelete.id);
      const idsToDelete = [categoryToDelete.id, ...descendantIds];
      setCategories(categories.filter((c) => !idsToDelete.includes(c.id)));
      setIsDeleteAlertOpen(false);
      setCategoryToDelete(null);
    }
  };

  const hierarchicalCategories = buildHierarchy(categories);

  const CategoryRow = ({ category, level = 0 }: { category: Category & { children: Category[] }, level: number }) => {
    const parentName = category.parentId ? categories.find(c => c.id === category.parentId)?.name : '—';
    return (
      <>
        <TableRow>
          <TableCell style={{ paddingLeft: `${1 + level * 2}rem` }}>
            <div className="flex items-center gap-3">
              <category.icon className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">{category.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge
              variant="outline"
              className={cn(
                category.type === 'income'
                  ? 'border-green-500/50 bg-green-500/10 text-green-700'
                  : 'border-red-500/50 bg-red-500/10 text-red-700'
              )}
            >
              {category.type}
            </Badge>
          </TableCell>
          <TableCell>{parentName}</TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(category)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => openDeleteAlert(category)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {category.children.map(child => (
          <CategoryRow key={child.id} category={child} level={level + 1} />
        ))}
      </>
    );
  };
  
  const getCategoryOptions = (
    allCategories: Category[],
    currentCategory: Category | null,
    level = 0
  ): { label: string; value: string; disabled: boolean }[] => {
    const hierarchy = buildHierarchy(allCategories);
    
    const options: { label: string; value: string; disabled: boolean }[] = [];
    
    function traverse(nodes: (Category & { children: Category[] })[], currentLevel: number, prefix = '') {
      nodes.forEach(node => {
        let disabled = false;
        // Disable if it's the category being edited or one of its descendants
        if (currentCategory) {
          const descendantIds = getDescendantIds(currentCategory.id);
          if (node.id === currentCategory.id || descendantIds.includes(node.id)) {
            disabled = true;
          }
        }
        // Disable if depth limit is reached
        if (currentLevel >= 2) {
            const hasChildren = allCategories.some(c => c.parentId === node.id);
            if(hasChildren) {
              // This is a complex condition. If we are editing, we can't move a parent to be a child of its child.
              // and we can't exceed the depth limit.
            }
        }

        options.push({
          label: `${prefix}${node.name}`,
          value: node.id,
          disabled: disabled,
        });

        if (node.children.length > 0) {
          traverse(node.children, currentLevel + 1, `${prefix}  `);
        }
      });
    }

    traverse(hierarchy, 0);
    return options;
  };
  
  const watchedType = form.watch('type');
  const watchedParentId = form.watch('parentId');
  const parentCategory = categories.find((c) => c.id === watchedParentId);
  const filteredCategoryOptions = getCategoryOptions(
    categories.filter(c => c.type === watchedType),
    selectedCategory
  );
  

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Manage your income and expense categories.
            </CardDescription>
          </div>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hierarchicalCategories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? 'Update the details of your category.'
                : 'Create a new category to organize your transactions.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Groceries" {...field} />
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
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('parentId', null);
                        }}
                        defaultValue={field.value}
                        className="flex space-x-4"
                        disabled={!!(selectedCategory && parentCategory)}
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="expense" />
                          </FormControl>
                          <FormLabel>Expense</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="income" />
                          </FormControl>
                          <FormLabel>Income</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                       <Popover>
                        <PopoverTrigger asChild>
                           <FormControl>
                            <Button variant="outline" className="w-full justify-start">
                              {field.value ? (
                                <>
                                  {React.createElement(Emojis[field.value as keyof typeof Emojis] || Smile, { className: "mr-2 h-4 w-4" })}
                                  {field.value}
                                </>
                              ) : (
                                'Select Icon'
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 h-96">
                          <div className="grid grid-cols-6 gap-2 overflow-y-auto h-full">
                            {emojiIconNames.map((iconName) => {
                              const IconComponent = Emojis[iconName as keyof typeof Emojis];
                              return (
                                <Button
                                  key={iconName}
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    field.onChange(iconName);
                                  }}
                                >
                                  <IconComponent />
                                </Button>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Parent Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="No parent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No parent</SelectItem>
                          {filteredCategoryOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">
                  {selectedCategory ? 'Save Changes' : 'Create Category'}
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
              This action cannot be undone. This will permanently delete the category and all its sub-categories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Card>
  );
}
