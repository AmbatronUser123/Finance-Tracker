
export interface TransactionSource {
  id: string;
  name: string;
  balance: number;
}

// A payment someone made towards money they owe you (utang).
export interface DebtPayment {
  id: string;
  amount: number;
  date: string;      // 'YYYY-MM-DD'
  sourceId: string;  // the source the money went into
}

// Money you lent to someone (utang).
export interface Debt {
  id: string;
  person: string;
  amount: number;    // total you lent
  date: string;      // 'YYYY-MM-DD'
  sourceId: string;  // the source the money came from
  note?: string;
  dueDate?: string;  // 'YYYY-MM-DD', optional
  payments: DebtPayment[];
}

// Part of an income that is set aside for one specific category.
export interface IncomeAllocation {
  categoryId: string;
  amount: number;
}

export interface Income {
  id: string;
  sourceId: string;
  description: string;
  amount: number;
  date: string;
  allocations?: IncomeAllocation[]; // optional: parts of this income assigned to specific categories
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
  month: string; // unique key: 'YYYY-MM' for old monthly archives, or the cycle's start date ('YYYY-MM-DD') for pay cycles
  cycleStart?: string;  // pay-cycle archives only: first day of the cycle
  cycleEnd?: string;    // pay-cycle archives only: last day of the cycle
  carriedIn?: number;   // pay-cycle archives only: leftover carried in from the previous cycle
  income: number;
  categories: Category[];
  goals: Goal[];
  sources: TransactionSource[];
  incomes?: Income[];
}

export interface CategoryWithBudget extends Category {
  planned: number;
  spent: number;
}