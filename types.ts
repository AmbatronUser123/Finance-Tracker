
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

export interface MonthlyArchive {
  month: string; // YYYY-MM
  income: number;
  categories: Category[];
  goals: Goal[];
  sources: TransactionSource[];
  incomes?: Income[];
}
