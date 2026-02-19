import { performance } from 'perf_hooks';

// Mock types locally to avoid import issues if running with node
interface Expense {
  id: string;
  categoryId: string;
  sourceId: string;
  description: string;
  amount: number;
  date: string;
}

interface CategoryWithBudget {
  id: string;
  name: string;
  expenses: Expense[];
  planned: number;
  spent: number;
  allocation: number;
  budget: number;
  color: string;
  icon: string;
}

interface MonthlyArchive {
  month: string;
}

// Generate data
const NUM_CATEGORIES = 20;
const EXPENSES_PER_CATEGORY = 500;
const NUM_ARCHIVES = 24; // 2 years of history

const categories: CategoryWithBudget[] = Array.from({ length: NUM_CATEGORIES }, (_, i) => ({
  id: `cat-${i}`,
  name: `Category ${i}`,
  expenses: Array.from({ length: EXPENSES_PER_CATEGORY }, (_, j) => ({
    id: `exp-${i}-${j}`,
    categoryId: `cat-${i}`,
    sourceId: 'src-1',
    description: 'Expense',
    amount: 100,
    date: new Date(2023, j % 12, (j % 28) + 1).toISOString(), // Spread across months
  })),
  planned: 1000,
  spent: 0,
  allocation: 5,
  budget: 1000,
  color: '#000',
  icon: 'star',
}));

const monthlyArchives: MonthlyArchive[] = Array.from({ length: NUM_ARCHIVES }, (_, i) => ({
  month: `202${2 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`,
}));

// Function to measure
function calculateUniqueMonths(categories: CategoryWithBudget[], monthlyArchives: MonthlyArchive[]) {
  const currentAllExpenses = categories.flatMap(c => c.expenses.map(e => ({ ...e, categoryName: c.name })));
  const archiveMonths = monthlyArchives.map(a => a.month);
  const uniqueMonths = Array.from(new Set([
    ...currentAllExpenses.map(e => e.date?.slice(0, 7)).filter(Boolean) as string[],
    ...archiveMonths,
  ])).sort();
  return uniqueMonths;
}

// Benchmark
const iterations = 1000;
const start = performance.now();

for (let i = 0; i < iterations; i++) {
  calculateUniqueMonths(categories, monthlyArchives);
}

const end = performance.now();
const totalTime = end - start;
const avgTime = totalTime / iterations;

console.log(`Total time for ${iterations} iterations: ${totalTime.toFixed(2)}ms`);
console.log(`Average time per calculation: ${avgTime.toFixed(4)}ms`);
