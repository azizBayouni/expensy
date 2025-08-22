
import type { Transaction, Category, Debt, Event, Wallet, Budget, Asset } from '@/types';
import {
  Briefcase,
  Car,
  Cat,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Pizza,
  Plane,
  Receipt,
  Shirt,
  ShoppingBag,
  Ticket,
  PiggyBank,
  HandCoins,
  Landmark,
  CircleDollarSign,
  Bus,
  Train,
  CreditCard,
  Banknote,
  Wallet as WalletIcon,
  Settings,
} from 'lucide-react';

export let transactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 5000,
    currency: 'SAR',
    date: '2024-07-01',
    wallet: 'Main Bank Account',
    category: 'Salary',
    description: 'Monthly Salary',
  },
  {
    id: '2',
    type: 'expense',
    amount: 75.5,
    currency: 'SAR',
    date: '2024-07-02',
    wallet: 'Credit Card',
    category: 'Groceries',
    description: 'Grocery shopping at Whole Foods',
    event: 'Weekly Groceries',
  },
  {
    id: '3',
    type: 'expense',
    amount: 1200,
    currency: 'SAR',
    date: '2024-07-01',
    wallet: 'Main Bank Account',
    category: 'Rent',
    description: 'Rent Payment',
  },
  {
    id: '4',
    type: 'expense',
    amount: 45.0,
    currency: 'SAR',
    date: '2024-07-03',
    wallet: 'Credit Card',
    category: 'Gas',
    description: 'Gasoline for car',
  },
  {
    id: '5',
    type: 'expense',
    amount: 30.0,
    currency: 'SAR',
    date: '2024-07-05',
    wallet: 'Debit Card',
    category: 'Movies',
    description: 'Movie tickets for two',
    event: "Friend's Wedding",
  },
  {
    id: '6',
    type: 'income',
    amount: 250,
    currency: 'SAR',
    date: '2024-07-06',
    wallet: 'PayPal',
    category: 'Freelance',
    description: 'Freelance graphic design work',
  },
  {
    id: '7',
    type: 'expense',
    amount: 25.2,
    currency: 'SAR',
    date: '2024-06-15',
    wallet: 'Credit Card',
    category: 'Dining Out',
    description: 'Dinner with friends',
    event: 'Summer Vacation to Italy',
  },
  {
    id: '8',
    type: 'expense',
    amount: 120.0,
    currency: 'SAR',
    date: '2024-06-20',
    wallet: 'Credit Card',
    category: 'Clothing',
    description: 'New shoes',
  },
];

export function updateTransactions(newTransactions: Transaction[]) {
  transactions = newTransactions;
}


export let categories: Category[] = [
  // Income
  { id: 'cat-inc-1', name: 'Salary', type: 'income', icon: "Briefcase", parentId: null },
  { id: 'cat-inc-2', name: 'Freelance', type: 'income', icon: "HandCoins", parentId: null },
  { id: 'cat-inc-3', name: 'Investments', type: 'income', icon: "Landmark", parentId: null },
  { id: 'cat-inc-4', name: 'Gifts', type: 'income', icon: "Gift", parentId: null },
  { id: 'cat-inc-5', name: 'Other', type: 'income', icon: "CircleDollarSign", parentId: null },

  // Expense
  { id: 'cat-exp-1', name: 'Food & Drink', type: 'expense', icon: "Pizza", parentId: null },
  { id: 'cat-exp-2', name: 'Groceries', type: 'expense', icon: "ShoppingBag", parentId: 'cat-exp-1' },
  { id: 'cat-exp-3', name: 'Dining Out', type: 'expense', icon: "Ticket", parentId: 'cat-exp-1' },
  { id: 'cat-exp-4', name: 'Housing', type: 'expense', icon: "Home", parentId: null },
  { id: 'cat-exp-5', name: 'Rent', type: 'expense', icon: "Receipt", parentId: 'cat-exp-4' },
  { id: 'cat-exp-6', name: 'Utilities', type: 'expense', icon: "Receipt", parentId: 'cat-exp-4' },
  { id: 'cat-exp-7', name: 'Transportation', type: 'expense', icon: "Car", parentId: null },
  { id: 'cat-exp-8', name: 'Gas', type: 'expense', icon: "Car", parentId: 'cat-exp-7' },
  { id: 'cat-exp-9', name: 'Public Transit', type: 'expense', icon: "Bus", parentId: 'cat-exp-7' },
  { id: 'cat-exp-10', name: 'Train Ticket', type: 'expense', icon: "Train", parentId: 'cat-exp-9' },
  { id: 'cat-exp-11', name: 'Shopping', type: 'expense', icon: "ShoppingBag", parentId: null },
  { id: 'cat-exp-12', name: 'Clothing', type: 'expense', icon: "Shirt", parentId: 'cat-exp-11' },
  { id: 'cat-exp-13', name: 'Health', type: 'expense', icon: "HeartPulse", parentId: null },
  { id: 'cat-exp-14', name: 'Fitness', type: 'expense', icon: "Dumbbell", parentId: 'cat-exp-13' },
  { id: 'cat-exp-15', name: 'Education', type: 'expense', icon: "GraduationCap", parentId: null },
  { id: 'cat-exp-16', name: 'Travel', type: 'expense', icon: "Plane", parentId: null },
  { id: 'cat-exp-17', name: 'Pets', type: 'expense', icon: "Cat", parentId: null },
  { id: 'cat-exp-18', name: 'Movies', type: 'expense', icon: "Ticket", parentId: null },
];

export function updateCategories(newCategories: Category[]) {
  categories = newCategories.map(c => ({...c, icon: typeof c.icon === 'function' ? (c.icon as any).displayName : c.icon }));
}

export let debts: Debt[] = [
  {
    id: 'debt-1',
    type: 'payable',
    person: 'John Doe',
    amount: 150,
    dueDate: '2024-08-01',
    status: 'unpaid',
    paidAmount: 0,
    note: 'For concert tickets',
    paymentHistory: [],
  },
  {
    id: 'debt-2',
    type: 'receivable',
    person: 'Jane Smith',
    amount: 200,
    dueDate: '2024-07-25',
    status: 'partial',
    paidAmount: 100,
    paymentHistory: [
        { date: '2024-07-10', amount: 100 }
    ],
  },
  {
    id: 'debt-3',
    type: 'receivable',
    person: 'Mike Johnson',
    amount: 50,
    dueDate: '2024-06-30',
    status: 'paid',
    paidAmount: 50,
    note: 'Lunch reimbursement',
    paymentHistory: [
      { date: '2024-06-28', amount: 50 }
    ],
  },
];

export function updateDebts(newDebts: Debt[]) {
    debts = newDebts;
}

export let events: Event[] = [
  {
    id: 'event-1',
    name: 'Summer Vacation to Italy',
    date: '2024-08-10',
    description: 'A 10-day trip exploring Rome, Florence, and Venice.',
    icon: '✈️',
    status: 'active',
  },
  {
    id: 'event-2',
    name: "Friend's Wedding",
    date: '2024-09-05',
    description: 'Attending and celebrating the wedding of a close friend.',
    icon: '💒',
    status: 'active',
  },
   {
    id: 'event-3',
    name: 'Weekly Groceries',
    date: '2024-07-02',
    description: 'Weekly grocery shopping',
    icon: '🛒',
    status: 'active',
  },
];

export function updateEvents(newEvents: Event[]) {
  events = newEvents;
}

export let wallets: Wallet[] = [
  {
    id: 'wallet-1',
    name: 'Main Bank Account',
    icon: 'Landmark',
    currency: 'SAR',
    balance: 1159.50,
    isDefault: true,
  },
  {
    id: 'wallet-2',
    name: 'Credit Card',
    icon: 'CreditCard',
    currency: 'SAR',
    balance: -920.00,
    isDefault: false,
  },
  {
    id: 'wallet-3',
    name: 'Savings',
    icon: 'PiggyBank',
    currency: 'SAR',
    balance: 15800.00,
    isDefault: false,
  },
  {
    id: 'wallet-4',
    name: 'PayPal',
    icon: 'Wallet',
    currency: 'SAR',
    balance: 550.00,
    isDefault: false,
  },
    {
    id: 'wallet-5',
    name: 'Debit Card',
    icon: 'Banknote',
    currency: 'SAR',
    balance: 1200.00,
    isDefault: false,
  },
];

// This is a workaround to "save" data changes in the prototype.
// In a real app, this would be handled by a backend API.
export function updateWallets(newWallets: Wallet[]) {
  wallets = newWallets;
}

export const top100Currencies = [
  'SAR', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD', 'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL', 'TWD', 'DKK', 'PLN', 'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'MYR', 'RON', 'UAH', 'VND', 'ARS', 'NGN', 'EGP', 'IQD', 'DZD', 'MAD', 'KZT', 'QAR', 'KWD', 'OMR', 'BHD', 'JOD', 'LBP', 'SYP', 'YER', 'IRR', 'PKR', 'BDT', 'LKR', 'NPR', 'AFN', 'MMK', 'KHR', 'LAK', 'MNT', 'UZS', 'TJS', 'KGS', 'TMT', 'GEL', 'AZN', 'AMD', 'BYN', 'MDL', 'RSD', 'BAM', 'MKD', 'ALL', 'ISK', 'GHS', 'KES', 'UGX', 'TZS', 'ZMW', 'ZWL', 'GMD', 'SLL', 'LRD', 'CVE', 'GNF', 'XOF', 'XAF', 'CDF', 'BIF', 'RWF', 'SOS', 'SDG', 'LYD', 'TND'
];

export let budgets: Budget[] = [
    { id: 'budget-1', name: 'Monthly Food', categoryId: 'cat-exp-1', amount: 800, period: 'monthly', startDate: '2024-07-01' },
    { id: 'budget-2', name: 'Transportation', categoryId: 'cat-exp-7', amount: 200, period: 'monthly', startDate: '2024-07-01' },
    { id: 'budget-3', name: 'Annual Travel', categoryId: 'cat-exp-16', amount: 3000, period: 'yearly', startDate: '2024-01-01' },
];

export function updateBudgets(newBudgets: Budget[]) {
    budgets = newBudgets;
}

export let assets: Asset[] = [
  { name: 'Total Bank Balance', value: 30500, type: 'Bank Account' },
  { name: 'Total Investments', value: 1224707.03, type: 'Investment' },
  { name: 'Total Other Assets', value: 170000, type: 'Other' },
];
