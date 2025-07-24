import { Category, Goal } from './types';

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


export const CATEGORY_ICONS = ['briefcase', 'receipt', 'heart', 'shopping-bag', 'home', 'bolt', 'film', 'gift', 'plane', 'currency-dollar', 'users', 'banknotes', 'wrench', 'musical-note', 'academic-cap'];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1', name: 'Transportation', allocation: 3, expenses: [],
    color: 'indigo', icon: 'plane'
  },
  {
    id: 'cat-2', name: 'Phone/Internet', allocation: 1, expenses: [],
    color: 'sky', icon: 'receipt'
  },
  {
    id: 'cat-3', name: 'Personal Care', allocation: 1, expenses: [],
    color: 'emerald', icon: 'heart'
  },
  {
    id: 'cat-4', name: 'Medical', allocation: 1, expenses: [],
    color: 'rose', icon: 'bolt'
  },
  {
    id: 'cat-5', name: 'Small Purchases', allocation: 1, expenses: [],
    color: 'amber', icon: 'shopping-bag'
  },
  {
    id: 'cat-6', name: 'Emergency Fund', allocation: 1, expenses: [],
    color: 'slate', icon: 'briefcase'
  },
  {
    id: 'cat-7', name: 'Food & Drinks', allocation: 10, expenses: [],
    color: 'lime', icon: 'gift'
  },
  {
    id: 'cat-8', name: 'Entertainment/Leisure', allocation: 5, expenses: [],
    color: 'violet', icon: 'film'
  },
  {
    id: 'cat-9', name: 'Shopping', allocation: 6, expenses: [],
    color: 'cyan', icon: 'shopping-bag'
  },
  {
    id: 'cat-10', name: 'Dating', allocation: 15, expenses: [],
    color: 'rose', icon: 'heart'
  },
  {
    id: 'cat-11', name: 'Home Allowance', allocation: 18, expenses: [],
    color: 'amber', icon: 'home'
  },
  {
    id: 'cat-12', name: "Sister's Snacks", allocation: 8, expenses: [],
    color: 'emerald', icon: 'users'
  },
  {
    id: 'cat-13', name: 'Monthly Bills', allocation: 11, expenses: [],
    color: 'sky', icon: 'receipt'
  },
  {
    id: 'cat-14', name: 'Long-term Savings', allocation: 10, expenses: [],
    color: 'indigo', icon: 'banknotes'
  },
  {
    id: 'cat-15', name: 'Short-term Savings', allocation: 9, expenses: [],
    color: 'violet', icon: 'currency-dollar'
  },
];

export const INITIAL_GOALS: Goal[] = [];