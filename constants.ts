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

export const CATEGORY_COLOR_MAP: { [key: string]: { border: string; text: string; progress: string } } = {
  indigo: { border: 'border-indigo-500', text: 'text-indigo-600', progress: 'bg-indigo-500' },
  sky: { border: 'border-sky-500', text: 'text-sky-600', progress: 'bg-sky-500' },
  rose: { border: 'border-rose-500', text: 'text-rose-600', progress: 'bg-rose-500' },
  amber: { border: 'border-amber-500', text: 'text-amber-600', progress: 'bg-amber-500' },
  emerald: { border: 'border-emerald-500', text: 'text-emerald-600', progress: 'bg-emerald-500' },
  violet: { border: 'border-violet-500', text: 'text-violet-600', progress: 'bg-violet-500' },
  lime: { border: 'border-lime-500', text: 'text-lime-600', progress: 'bg-lime-500' },
  cyan: { border: 'border-cyan-500', text: 'text-cyan-600', progress: 'bg-cyan-500' },
  slate: { border: 'border-slate-500', text: 'text-slate-600', progress: 'bg-slate-500' },
};

export const CATEGORY_ICONS = ['briefcase', 'receipt', 'heart', 'shopping-bag', 'home', 'bolt', 'film', 'gift', 'plane', 'currency-dollar', 'users', 'banknotes', 'wrench', 'musical-note', 'academic-cap'];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1', name: 'Transportation', allocation: 3, expenses: [],
    color: 'indigo', icon: 'plane', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-2', name: 'Phone/Internet', allocation: 1, expenses: [],
    color: 'sky', icon: 'receipt', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-3', name: 'Personal Care', allocation: 1, expenses: [],
    color: 'emerald', icon: 'heart', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-4', name: 'Medical', allocation: 1, expenses: [],
    color: 'rose', icon: 'bolt', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-5', name: 'Small Purchases', allocation: 1, expenses: [],
    color: 'amber', icon: 'shopping-bag', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-6', name: 'Emergency Fund', allocation: 1, expenses: [],
    color: 'slate', icon: 'briefcase', spent: 0, planned: 0, budget: 0
  },
  {
    id: 'cat-7', name: 'Food & Drinks', allocation: 10, expenses: [],
    color: 'lime', icon: 'gift', spent: 0, planned: 0, budget: 0
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