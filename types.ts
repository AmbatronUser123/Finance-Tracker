
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
  month: string;
  cycleStart?: string; // Tambahin ini
  cycleEnd?: string;   // Tambahin ini juga
  carriedIn: number;
  income: number;
  categories: CategoryWithBudget[];
  goals: Goal[];
  sources: TransactionSource[];
  incomes: Income[];
}

export interface CategoryWithBudget extends Category {
  planned: number;
  spent: number;
}

export interface RecurringRule {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  type: 'expense' | 'income';
  dayOfCycle: number; // Misal: hari ke-2 setelah tanggal gajian mulai
  lastGeneratedMonth?: string; // Format: "YYYY-MM" buat ngehindari double entry
}