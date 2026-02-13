
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
  allocation: number;
  color: string;
  icon: string;
  budget?: number; // Tambahin ? biar opsional
  spent?: number;  // Tambahin ? biar opsional
  planned?: number; // Tambahin ? biar opsional
  expenses: Expense[];
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
