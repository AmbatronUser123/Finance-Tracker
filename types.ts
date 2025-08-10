
export interface TransactionSource {
  id: string;
  name: string;
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
}

export interface Category {
  id:string;
  name: string;
  allocation: number; // Percentage
  expenses: Expense[];
  color: string;
  icon: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}
