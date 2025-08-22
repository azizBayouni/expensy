
import type { LucideIcon } from 'lucide-react';

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  date: string;
  wallet: string;
  category: string;
  description: string;
  event?: string;
  attachments?: { name: string, path: string }[];
  excludeFromReports?: boolean;
  originalAmount?: number;
  convertedAmountSAR?: number;
};

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: LucideIcon | string;
  parentId?: string | null;
};

export type Payment = {
  date: string;
  amount: number;
};

export type Debt = {
  id:string;
  type: 'payable' | 'receivable';
  person: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'partial';
  paidAmount: number;
  note?: string;
  attachments?: { name: string, path: string }[];
  paymentHistory?: Payment[];
};

export type Event = {
  id: string;
  name: string;
  date: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive';
};

export type Wallet = {
  id: string;
  name: string;
  icon: string;
  currency: string;
  balance: number;
  isDefault?: boolean;
};

export type Budget = {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
};

export type Asset = {
  name: string;
  value: number;
  type: string;
  bankName?: string;
  // Investment specific fields
  status?: 'active' | 'inactive';
  platform?: string;
  assetType?: string;
  units?: number;
  pricePerUnit?: number;
  growth?: number;
  maturityDate?: string;
  estimatedReturnValue?: number;
};
