
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
  type LucideIcon,
  Search,
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
import * as LucideIcons from 'lucide-react';
import React from 'react';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  type: z.enum(['income', 'expense']),
  icon: z.string(),
  parentId: z.string().nullable(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const expenseEmojis: { emoji: string; name: string }[] = [
    { emoji: '🛒', name: 'shopping cart' }, { emoji: '🍔', name: 'hamburger' }, { emoji: '🍕', name: 'pizza' }, { emoji: '🚗', name: 'car' }, { emoji: '🚌', name: 'bus' },
    { emoji: '✈️', name: 'airplane' }, { emoji: '🏠', name: 'house' }, { emoji: '💡', name: 'light bulb' }, { emoji: '💧', name: 'water drop' }, { emoji: '📱', name: 'mobile phone' },
    { emoji: '💻', name: 'laptop' }, { emoji: '👕', name: 't-shirt' }, { emoji: '👠', name: 'high-heeled shoe' }, { emoji: '💊', name: 'pill' }, { emoji: '🏥', name: 'hospital' },
    { emoji: '🎬', name: 'clapper board' }, { emoji: '🎵', name: 'musical note' }, { emoji: '📚', name: 'books' }, { emoji: '🎓', name: 'graduation cap' }, { emoji: '🎁', name: 'gift' },
    { emoji: '🏨', name: 'hotel' }, { emoji: '🏖️', name: 'beach' }, { emoji: '⛰️', name: 'mountain' }, { emoji: '🎉', name: 'party popper' }, { emoji: '☕️', name: 'coffee' },
    { emoji: '🍹', name: 'tropical drink' }, { emoji: '💅', name: 'nail polish' }, { emoji: '💇‍♀️', name: 'haircut' }, { emoji: '🏋️‍♂️', name: 'weight lifter' }, { emoji: '⚽️', name: 'soccer ball' },
    { emoji: '🏀', name: 'basketball' }, { emoji: '🎮', name: 'video game' }, { emoji: '🐶', name: 'dog' }, { emoji: '🐱', name: 'cat' }, { emoji: '🐾', name: 'paw prints' },
    { emoji: '🥕', name: 'carrot' }, { emoji: '🍎', name: 'apple' }, { emoji: '🥦', name: 'broccoli' }, { emoji: '🍞', name: 'bread' }, { emoji: '🍷', name: 'wine glass' },
    { emoji: '🍺', name: 'beer mug' }, { emoji: '🍸', name: 'cocktail glass' }, { emoji: '🍿', name: 'popcorn' }, { emoji: '🍦', name: 'ice cream' }, { emoji: '🍩', name: 'doughnut' },
    { emoji: '🍪', name: 'cookie' }, { emoji: '🎂', name: 'birthday cake' }, { emoji: '🍓', name: 'strawberry' }, { emoji: '🥑', name: 'avocado' }, { emoji: '🌮', name: 'taco' },
    { emoji: '🍣', name: 'sushi' }, { emoji: '🍜', name: 'ramen' }, { emoji: '🍝', name: 'spaghetti' }, { emoji: '🍟', name: 'french fries' }, { emoji: '🥗', name: 'salad' },
    { emoji: '🥪', name: 'sandwich' }, { emoji: '🥐', name: 'croissant' }, { emoji: '🥨', name: 'pretzel' }, { emoji: '🧀', name: 'cheese' }, { emoji: '🥚', name: 'egg' },
    { emoji: '🥛', name: 'milk' }, { emoji: '🍵', name: 'tea' }, { emoji: '🧃', name: 'juice' }, { emoji: '🥤', name: 'cup with straw' }, { emoji: '🍶', name: 'sake' },
    { emoji: '🥂', name: 'clinking glasses' }, { emoji: '🍻', name: 'clinking beer mugs' }, { emoji: '🥃', name: 'tumbler glass' }, { emoji: '🚧', name: 'construction' }, { emoji: '⛽️', name: 'fuel pump' },
    { emoji: '🚃', name: 'railway car' }, { emoji: '🚇', name: 'metro' }, { emoji: '🚊', name: 'tram' }, { emoji: '🚕', name: 'taxi' }, { emoji: '🚓', name: 'police car' },
    { emoji: '🚑', name: 'ambulance' }, { emoji: '🚚', name: 'delivery truck' }, { emoji: '🚢', name: 'ship' }, { emoji: '🚲', name: 'bicycle' }, { emoji: '🛴', name: 'scooter' },
    { emoji: '🗺️', name: 'map' }, { emoji: '🎫', name: 'ticket' }, { emoji: '🎭', name: 'performing arts' }, { emoji: '🎤', name: 'microphone' }, { emoji: '🎧', name: 'headphone' },
    { emoji: '🎸', name: 'guitar' }, { emoji: '🎹', name: 'musical keyboard' }, { emoji: '🎺', name: 'trumpet' }, { emoji: '🎻', name: 'violin' }, { emoji: '🥁', name: 'drum' },
    { emoji: '🎨', name: 'artist palette' }, { emoji: '🎟️', name: 'admission tickets' }, { emoji: '🎪', name: 'circus tent' }, { emoji: '🏟️', name: 'stadium' }, { emoji: '🏛️', name: 'classical building' },
    { emoji: '🏢', name: 'office building' }, { emoji: '🏬', name: 'department store' }, { emoji: '🏦', name: 'bank' }, { emoji: '🏪', name: 'convenience store' }, { emoji: '🏫', name: 'school' },
    { emoji: '🏭', name: 'factory' }, { emoji: '🏰', name: 'castle' }, { emoji: '💒', name: 'wedding' }, { emoji: '🗼', name: 'Tokyo tower' }, { emoji: '🗽', name: 'Statue of Liberty' },
    { emoji: '🗿', name: 'moai' }, { emoji: '🛠️', name: 'hammer and wrench' }, { emoji: '🔩', name: 'nut and bolt' }, { emoji: '🔨', name: 'hammer' }, { emoji: '🧱', name: 'brick' },
    { emoji: '🪜', name: 'ladder' }, { emoji: '🧹', name: 'broom' }, { emoji: '🧺', name: 'basket' }, { emoji: '🧻', name: 'toilet paper' }, { emoji: '🧼', name: 'soap' },
    { emoji: '🧽', name: 'sponge' }, { emoji: '🛋️', name: 'couch' }, { emoji: '🛏️', name: 'bed' }, { emoji: '🚽', name: 'toilet' }, { emoji: '🚿', name: 'shower' },
    { emoji: '🛁', name: 'bathtub' }, { emoji: '🔌', name: 'electric plug' }, { emoji: '🔋', name: 'battery' }, { emoji: '🖥️', name: 'desktop computer' }, { emoji: '⌨️', name: 'keyboard' },
    { emoji: '🖱️', name: 'computer mouse' }, { emoji: '🖨️', name: 'printer' }, { emoji: '☎️', name: 'telephone' }, { emoji: '📠', name: 'fax machine' }, { emoji: '📺', name: 'television' },
    { emoji: '📷', name: 'camera' }, { emoji: '📹', name: 'video camera' }, { emoji: '⌚️', name: 'watch' }, { emoji: '👚', name: 'womans clothes' }, { emoji: '👖', name: 'jeans' },
    { emoji: '👔', name: 'necktie' }, { emoji: '👗', name: 'dress' }, { emoji: '👙', name: 'bikini' }, { emoji: '👘', name: 'kimono' }, { emoji: '👡', name: 'sandal' },
    { emoji: '👢', name: 'boot' }, { emoji: '👞', name: 'mans shoe' }, { emoji: '👟', name: 'sneaker' }, { emoji: '🧢', name: 'cap' }, { emoji: '👒', name: 'hat' },
    { emoji: '👓', name: 'glasses' }, { emoji: '🕶️', name: 'sunglasses' }, { emoji: '💍', name: 'ring' }, { emoji: '💼', name: 'briefcase' }, { emoji: '👜', name: 'handbag' },
    { emoji: '👝', name: 'pouch' }, { emoji: '👛', name: 'purse' }, { emoji: '🎒', name: 'backpack' }, { emoji: '⛑️', name: 'rescue workers helmet' }, { emoji: '💉', name: 'syringe' },
    { emoji: '🌡️', name: 'thermometer' }, { emoji: '🩺', name: 'stethoscope' }, { emoji: '❤️‍🩹', name: 'mending heart' }, { emoji: '🩹', name: 'adhesive bandage' }, { emoji: '🪥', name: 'toothbrush' },
    { emoji: '💈', name: 'barber pole' }, { emoji: '✂️', name: 'scissors' }, { emoji: '💪', name: 'flexed biceps' }, { emoji: '🧠', name: 'brain' }, { emoji: '👀', name: 'eyes' },
    { emoji: '🦷', name: 'tooth' }, { emoji: '🗣️', name: 'speaking head' }, { emoji: '👨‍⚕️', name: 'man health worker' }, { emoji: '👩‍⚕️', name: 'woman health worker' }, { emoji: '👨‍🎓', name: 'man student' },
    { emoji: '👩‍🎓', name: 'woman student' }, { emoji: '👨‍🏫', name: 'man teacher' }, { emoji: '👩‍🏫', name: 'woman teacher' }, { emoji: '👶', name: 'baby' }, { emoji: '🧒', name: 'child' },
    { emoji: '🧑', name: 'person' }, { emoji: '🧑‍🤝‍🧑', name: 'people holding hands' }, { emoji: '🧑‍💻', name: 'technologist' }, { emoji: '🧑‍🎨', name: 'artist' }, { emoji: '🧑‍🔬', name: 'scientist' },
    { emoji: '🧑‍🚀', name: 'astronaut' }, { emoji: '🧑‍🚒', name: 'firefighter' }, { emoji: '🧑‍✈️', name: 'pilot' }, { emoji: '🧑‍⚖️', name: 'judge' }, { emoji: '👑', name: 'crown' },
    { emoji: '🎩', name: 'top hat' }, { emoji: '💄', name: 'lipstick' }, { emoji: '💎', name: 'gem stone' }, { emoji: '⚽', name: 'soccer' }, { emoji: '⚾', name: 'baseball' },
    { emoji: '🥎', name: 'softball' }, { emoji: '🏐', name: 'volleyball' }, { emoji: '🏈', name: 'american football' }, { emoji: '🏉', name: 'rugby football' }, { emoji: '🎾', name: 'tennis' },
    { emoji: '🎳', name: 'bowling' }, { emoji: '🏏', name: 'cricket game' }, { emoji: '🏑', name: 'field hockey' }, { emoji: '🏒', name: 'ice hockey' }, { emoji: '🥍', name: 'lacrosse' },
    { emoji: '🏓', name: 'ping pong' }, { emoji: '🏸', name: 'badminton' }, { emoji: '🥊', name: 'boxing glove' }, { emoji: '🥋', name: 'martial arts uniform' }, { emoji: '🥅', name: 'goal net' },
    { emoji: '⛳', name: 'golf' }
];

function isLucideIcon(icon: string | LucideIcon): icon is LucideIcon {
  return typeof icon === 'function';
}

function getIconComponent(iconName: string | undefined): LucideIcon {
  if (!iconName) return Smile;
  if (expenseEmojis.some(e => e.emoji === iconName)) return Smile; // Emojis are handled differently
  const Icon = LucideIcons[iconName as keyof typeof LucideIcons] || Smile;
  if (typeof Icon === 'function') {
      return Icon;
  }
  return Smile;
}

function getIconName(IconComponent: LucideIcon | string): keyof typeof LucideIcons | string {
    if (typeof IconComponent !== 'function') {
        return IconComponent;
    }
    for (const name in LucideIcons) {
        if (Object.prototype.hasOwnProperty.call(LucideIcons, name)) {
            if (LucideIcons[name as keyof typeof LucideIcons] === IconComponent) {
                return name as keyof typeof LucideIcons;
            }
        }
    }
    return 'Smile'; // Default fallback
}

function buildHierarchy(categories: Category[]): (Category & { children: Category[] })[] {
  const cats = JSON.parse(JSON.stringify(categories));
  const categoryMap = new Map(cats.map((c: any) => [c.id, { ...c, children: [] }]));
  const hierarchy: (Category & { children: Category[] })[] = [];

  for (const category of categoryMap.values()) {
    if (category.parentId && categoryMap.has(category.parentId)) {
      const parent = categoryMap.get(category.parentId)!;
      parent.children.push(category);
    } else {
      hierarchy.push(category);
    }
  }

  return hierarchy;
}

type DisplayCategory = Category & {
    children: DisplayCategory[];
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [emojiSearch, setEmojiSearch] = useState('');
  const { toast } = useToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
        name: '',
        type: 'expense',
        icon: '🛒',
        parentId: null,
    }
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
      icon: '🛒',
      parentId: null,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    const iconName = getIconName(category.icon);

    form.reset({
      name: category.name,
      type: category.type,
      icon: iconName,
      parentId: category.parentId || null,
    });
    setIsDialogOpen(true);
  };

  const openDeleteAlert = (category: Category) => {
    const descendantIds = getDescendantIds(category.id);
    const allIdsToDelete = [category.id, ...descendantIds];
    
    const hasTransactions = transactions.some((t) => {
      const cat = categories.find(c => c.name === t.category && c.type === t.type);
      return cat && allIdsToDelete.includes(cat.id);
    });

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
    
    const isEmoji = expenseEmojis.some(e => e.emoji === data.icon);
    const iconValue = isEmoji ? data.icon : getIconComponent(data.icon);
    
    const categoryData = {
        name: data.name,
        type: data.type,
        icon: iconValue,
        parentId: data.parentId || null,
    };
    
    if (selectedCategory) {
      const updatedCategory = { ...selectedCategory, ...categoryData };
      if (typeof categoryData.icon === 'string' && !isEmoji) {
        updatedCategory.icon = getIconComponent(categoryData.icon);
      }
        setCategories(
            categories.map((c) =>
                c.id === selectedCategory.id ? updatedCategory : c
            )
        );
        toast({ title: 'Success', description: 'Category updated successfully.' });
    } else {
        const newCategory: Category = {
            id: `cat-${Date.now()}`,
            ...categoryData,
        };
        if (typeof newCategory.icon === 'string' && !isEmoji) {
            newCategory.icon = getIconComponent(newCategory.icon);
        }
        setCategories([...categories, newCategory]);
        toast({ title: 'Success', description: 'Category created successfully.' });
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
      toast({ title: 'Success', description: 'Category deleted successfully.' });
    }
  };

  const getCategoryOptions = (currentCategory: Category | null): { label: string; value: string; disabled: boolean }[] => {
    const hierarchy = buildHierarchy(categories);
    const options: { label: string; value: string; disabled: boolean }[] = [];
  
    function traverse(nodes: (Category & { children: Category[] })[], currentLevel: number, prefix = '') {
      nodes.forEach(node => {
        let disabled = false;
        if (currentCategory) {
          const descendantIds = getDescendantIds(currentCategory.id);
          if (node.id === currentCategory.id || descendantIds.includes(node.id)) {
            disabled = true;
          }
        }
        if (currentLevel >= 2) {
          disabled = true;
        }
  
        options.push({
          label: `${prefix}${node.name}`,
          value: node.id,
          disabled: disabled,
        });
  
        if (node.children && node.children.length > 0) {
          traverse(node.children, currentLevel + 1, `${prefix}  `);
        }
      });
    }

    traverse(hierarchy, 0);
    return options;
  };
  
  const watchedType = form.watch('type');

  const hierarchicalCategories: DisplayCategory[] = buildHierarchy(categories) as DisplayCategory[];
  
  const CategoryRow = ({ category, level = 0 }: { category: DisplayCategory, level: number }) => {
    const parentName = category.parentId ? categories.find(c => c.id === category.parentId)?.name : '—';
    const icon = category.icon;
    let IconComponent: React.ReactNode;
    
    const isEmoji = typeof icon === 'string' && expenseEmojis.some(e => e.emoji === icon);

    if (isEmoji) {
        IconComponent = <span className="text-2xl">{icon}</span>
    } else if (isLucideIcon(icon)) {
        const LucideComp = icon;
        IconComponent = <LucideComp className="w-5 h-5 text-muted-foreground" />
    } else {
        const LucideComp = Smile;
        IconComponent = <LucideComp className="w-5 h-5 text-muted-foreground" />
    }
    
    return (
      <>
        <TableRow>
          <TableCell style={{ paddingLeft: `${1 + level * 2}rem` }}>
            <div className="flex items-center gap-3">
              {IconComponent}
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
        {category.children && category.children.map(child => (
          <CategoryRow key={child.id} category={child as DisplayCategory} level={level + 1} />
        ))}
      </>
    );
  };
  
  const allCategoryOptions = getCategoryOptions(selectedCategory);
  
  const filteredCategoryOptions = allCategoryOptions?.filter(opt => {
    const cat = categories.find(c => c.id === opt.value);
    return cat?.type === watchedType;
  }) || [];

  const filteredEmojis = expenseEmojis.filter(item => 
    item.name.toLowerCase().includes(emojiSearch.toLowerCase())
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
                        disabled={!!selectedCategory}
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
                            <Button variant="outline" className="w-full justify-start text-2xl">
                              {field.value ? field.value : 'Select Icon'}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 h-96 p-2">
                            <div className="relative mb-2">
                               <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input 
                                 placeholder="Search emoji..."
                                 className="pl-8"
                                 value={emojiSearch}
                                 onChange={(e) => setEmojiSearch(e.target.value)}
                               />
                            </div>
                          <div className="grid grid-cols-8 gap-2 overflow-y-auto h-[calc(100%-40px)]">
                            {filteredEmojis.map((item) => {
                              return (
                                <Button
                                  key={item.emoji}
                                  variant="ghost"
                                  className="text-2xl"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    form.setValue("icon", item.emoji, { shouldValidate: true });
                                  }}
                                >
                                  {item.emoji}
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
                      <Select
                        onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                        value={field.value || 'null'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="No parent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">No parent</SelectItem>
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

    