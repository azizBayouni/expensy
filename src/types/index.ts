import type { LucideIcon } from 'lucide-react';

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: 'USD';
  date: string;
  wallet: string;
  category: string;
  description: string;
  event?: string;
};

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: LucideIcon | string;
  parentId?: string | null;
};

export type Debt = {
  id:string;
  type: 'payable' | 'receivable';
  person: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'partial';
  paidAmount: number;
};

export type Event = {
  id: string;
  name: string;
  date: string;
  description: string;
};

export type Wallet = {
  id: string;
  name: string;
  icon: LucideIcon;
  currency: string;
  balance: number;
};
