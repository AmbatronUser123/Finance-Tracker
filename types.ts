
export interface TransactionSource {
  id: string;
  name: string;
  balance: number;
}

export interface Income {
  id: string;
  sourceId: string;
  description: string;
  amount: number;
  date: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  sourceId: string;
  description: string;
  amount: number;
  date: string;
  type?: 'expense' | 'income';
  categoryName?: string;
  sourceName?: string;
}

export interface Category {
  id: string;
  name: string;
  allocation: number; // Percentage
  budget: number;     // Monthly budget amount
  spent: number;      // Total spent in this category
  planned: number;    // Total planned for this category
  expenses: Expense[];
  color: string;
  icon: string;
  limit?: number;     // Optional spending limit
  isActive?: boolean; // Whether the category is active
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface TransferHistory {
  id: string;
  fromSourceId: string;
  toSourceId: string;
  amount: number;
  date: string; // ISO date string
}

export interface MonthlyArchive {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  month: string; // YYYY-MM (for grouping by month)
  income: number;
  categories: Category[];
  goals: Goal[];
  sources: TransactionSource[];
  incomes?: Income[];
}

export type CategoryFormData = Pick<Category, 'name' | 'allocation' | 'color' | 'icon'> & { id?: string };
