import { Category, Goal, TransactionSource } from './types';

export const INITIAL_SOURCES: TransactionSource[] = [
  { id: 'src-1', name: 'Salary', balance: 0 },
  { id: 'src-2', name: 'Freelance', balance: 0 },
  { id: 'src-3', name: 'Other', balance: 0 }
];

export const CATEGORY_COLORS = ['indigo', 'sky', 'rose', 'amber', 'emerald', 'violet', 'lime', 'cyan', 'slate'];

export const TAILWIND_COLORS: { [key: string]: string } = {
  indigo: '#6366f1',
  sky: '#0ea5e9',
  rose: '#f43f5e',
  amber: '#f59e0b',
  emerald: '#10b981',
  violet: '#8b5cf6',
  lime: '#84cc16',
  cyan: '#06b6d4',
  slate: '#64748b',
};


export const CATEGORY_ICONS = ['food', 'coffee', 'car', 'plane', 'home', 'bolt', 'phone', 'shopping-bag', 'heart', 'health', 'fitness', 'users', 'pet', 'film', 'musical-note', 'book', 'academic-cap', 'gift', 'receipt', 'briefcase', 'banknotes', 'currency-dollar', 'savings', 'wrench'];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1', name: 'Transportation', allocation: 3, expenses: [],
    color: 'indigo', icon: 'car', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-2', name: 'Phone/Internet', allocation: 1, expenses: [],
    color: 'sky', icon: 'phone', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-3', name: 'Personal Care', allocation: 1, expenses: [],
    color: 'emerald', icon: 'heart', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-4', name: 'Medical', allocation: 1, expenses: [],
    color: 'rose', icon: 'health', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-5', name: 'Small Purchases', allocation: 1, expenses: [],
    color: 'amber', icon: 'shopping-bag', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-6', name: 'Emergency Fund', allocation: 1, expenses: [],
    color: 'slate', icon: 'savings', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-7', name: 'Food & Drinks', allocation: 10, expenses: [],
    color: 'lime', icon: 'food', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-8', name: 'Entertainment/Leisure', allocation: 5, expenses: [],
    color: 'violet', icon: 'film', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-9', name: 'Shopping', allocation: 6, expenses: [],
    color: 'cyan', icon: 'shopping-bag', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-10', name: 'Dating', allocation: 15, expenses: [],
    color: 'rose', icon: 'heart', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-11', name: 'Home Allowance', allocation: 18, expenses: [],
    color: 'amber', icon: 'home', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-12', name: "Sister's Snacks", allocation: 8, expenses: [],
    color: 'emerald', icon: 'users', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-13', name: 'Monthly Bills', allocation: 11, expenses: [],
    color: 'sky', icon: 'receipt', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-14', name: 'Long-term Savings', allocation: 10, expenses: [],
    color: 'indigo', icon: 'banknotes', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-15', name: 'Short-term Savings', allocation: 9, expenses: [],
    color: 'violet', icon: 'currency-dollar', spent: 0, planned: 0, budget: 0
  },
];

export const INITIAL_GOALS: Goal[] = [];