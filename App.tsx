import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Category, Goal, Expense, TransactionSource, MonthlyArchive, Income } from './types';
import { INITIAL_CATEGORIES, INITIAL_SOURCES } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './contexts/ToastContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { formatRupiah } from './src/utils/currency';
import { 
  FiHome, 
  FiPieChart, 
  FiDollarSign, 
  FiTag, 
  FiTarget, 
  FiX, 
  FiMenu,
  FiDatabase,
  FiCreditCard
} from 'react-icons/fi';

// Components
import Dashboard from './components/Dashboard';
import ExpenseLogger from './components/ExpenseLogger';
import CategoryManager from './components/CategoryManager';
import GoalManager from './components/GoalManager';
import CategoryEditor from './components/CategoryEditor';
import DataManager from './components/DataManager';
import CategoryDetailModal from './components/CategoryDetailModal';
import SourceManager from './components/SourceManager';
import ExpenseHistory from './components/ExpenseHistory';
import { useDarkMode } from './hooks/useDarkMode';
import { SunIcon, MoonIcon } from './components/icons';
import NewMonthModal from './components/NewMonthModal';
import IncomeInput from './components/IncomeInput';
import IncomeHistory from './components/IncomeHistory';

// Navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
  { id: 'expenses', label: 'Expenses', icon: <FiDollarSign size={20} /> },
  { id: 'income', label: 'Income', icon: <FiDollarSign size={20} /> },
  { id: 'sources', label: 'Sources', icon: <FiCreditCard size={20} /> },
  { id: 'categories', label: 'Categories', icon: <FiTag size={20} /> },
  { id: 'goals', label: 'Goals', icon: <FiTarget size={20} /> },
  { id: 'reports', label: 'Reports', icon: <FiPieChart size={20} /> },
  { id: 'data', label: 'Data', icon: <FiDatabase size={20} /> },
];

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Update the Category type to include planned and spent
export interface CategoryWithBudget extends Category {
  planned: number;
  spent: number;
  isActive?: boolean;
}

// Extracted Reports view into its own component to use Hooks safely
const ReportsView: React.FC<{
  categories: CategoryWithBudget[];
  monthlyArchives: MonthlyArchive[];
  incomes: Income[];
}> = ({ categories, monthlyArchives, incomes }) => {
  const currentAllExpenses = categories.flatMap(c => c.expenses.map(e => ({ ...e, categoryName: c.name })));
  const archiveMonths = monthlyArchives.map(a => a.month);
  const uniqueMonths = Array.from(new Set([
    ...currentAllExpenses.map(e => e.date?.slice(0, 7)).filter(Boolean) as string[],
    ...archiveMonths,
  ])).sort();
  
  const currentMonth = getCurrentMonth();
  
  // Default to current month or last available
  const initialMonth = uniqueMonths.includes(currentMonth) ? currentMonth : (uniqueMonths[uniqueMonths.length - 1] || currentMonth);
  
  const [startMonth, setStartMonth] = React.useState(initialMonth);
  const [endMonth, setEndMonth] = React.useState(initialMonth);

  // Ensure uniqueMonths is populated for dropdowns
  const monthOptions = uniqueMonths.length ? uniqueMonths : [currentMonth];

  // Helper to get months in range
  const getMonthsInRange = (start: string, end: string) => {
    if (start > end) return [start];
    return monthOptions.filter(m => m >= start && m <= end);
  };

  const selectedMonths = getMonthsInRange(startMonth, endMonth);

  // Aggregate Data
  const aggregatedData = React.useMemo(() => {
    let totalIncome = 0;
    const incomeList: Income[] = [];
    const categoryTotals: Record<string, { name: string; total: number; monthly: Record<string, number> }> = {};

    selectedMonths.forEach(month => {
      // Determine source of data for this month
      let monthIncomes: Income[] = [];
      let monthCategories: CategoryWithBudget[] = [];

      // Check archive first
      const archive = monthlyArchives.find(a => a.month === month);
      if (archive) {
        monthIncomes = archive.incomes || [];
        // If income is just a number in archive and no list, we might miss details. 
        // But older archives might only have 'income' number.
        // If incomes array is empty but income number > 0, we can't show details but can add to total.
        if (monthIncomes.length === 0 && archive.income > 0) {
           totalIncome += archive.income;
        }
        monthCategories = archive.categories as CategoryWithBudget[];
      } else {
        // It's the current/active data (assuming it matches the month)
        // We need to filter current data by month
        monthIncomes = incomes.filter(i => i.date?.startsWith(month));
        monthCategories = categories; // We'll filter expenses inside
      }

      // Add incomes
      monthIncomes.forEach(i => {
        incomeList.push(i);
        totalIncome += (i.amount || 0);
      });

      // Process Categories
      monthCategories.forEach(cat => {
        const catId = (cat as any).id; // Archive categories might not match current IDs exactly if deleted, but name should be consistent? 
        // Better to group by Name if IDs might change or be re-generated, but ID is safer if persistent.
        // Let's use ID but fallback to name grouping if needed. For now, ID.
        
        if (!categoryTotals[catId]) {
          categoryTotals[catId] = { name: (cat as any).name, total: 0, monthly: {} };
        }

        const monthExpenses = cat.expenses.filter(e => e.date?.startsWith(month));
        const monthSum = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

        categoryTotals[catId].total += monthSum;
        categoryTotals[catId].monthly[month] = (categoryTotals[catId].monthly[month] || 0) + monthSum;
      });
    });

    return {
      totalIncome,
      incomeList: incomeList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      categories: Object.values(categoryTotals).filter(c => c.total > 0).sort((a, b) => b.total - a.total)
    };
  }, [selectedMonths, monthlyArchives, categories, incomes]);

  const exportReport = (format: 'pdf' | 'csv') => {
    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(`Finance Report (${startMonth} to ${endMonth})`, 20, 10);
      
      // Income
      doc.text(`Total Income: ${formatRupiah(aggregatedData.totalIncome)}`, 20, 20);
      
      // Spending
      const head = [['Category', 'Total', ...selectedMonths]];
      const body = aggregatedData.categories.map(c => [
        c.name,
        formatRupiah(c.total),
        ...selectedMonths.map(m => formatRupiah(c.monthly[m] || 0))
      ]);
      
      (doc as any).autoTable({ head, body, startY: 30 });
      doc.save(`report-${startMonth}-${endMonth}.pdf`);
    } else {
      const header = ['Category', 'Total', ...selectedMonths];
      const data = aggregatedData.categories.map(c => {
        const row: any = { Category: c.name, Total: c.total };
        selectedMonths.forEach(m => row[m] = c.monthly[m] || 0);
        return row;
      });
      const csv = Papa.unparse({ fields: header, data: data.map(d => header.map(h => d[h])) });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `report-${startMonth}-${endMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Reports</h2>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-700 dark:text-slate-300">From:</label>
          <select
            value={startMonth}
            onChange={(e) => {
              setStartMonth(e.target.value);
              if (e.target.value > endMonth) setEndMonth(e.target.value);
            }}
            className="p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
          >
            {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-700 dark:text-slate-300">To:</label>
          <select
            value={endMonth}
            onChange={(e) => {
              if (e.target.value < startMonth) return;
              setEndMonth(e.target.value);
            }}
            className="p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
          >
            {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        
        <div className="ml-auto flex gap-2">
          <button onClick={() => exportReport('pdf')} className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">PDF</button>
          <button onClick={() => exportReport('csv')} className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm">CSV</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-sm text-slate-500">Total Income</div>
          <div className="text-xl font-bold">{formatRupiah(aggregatedData.totalIncome)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-sm text-slate-500">Total Spending</div>
          <div className="text-xl font-bold">{formatRupiah(aggregatedData.categories.reduce((a, b) => a + b.total, 0))}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-sm text-slate-500">Net Savings</div>
          <div className="text-xl font-bold">{formatRupiah(aggregatedData.totalIncome - aggregatedData.categories.reduce((a, b) => a + b.total, 0))}</div>
        </div>
      </div>

      {/* Income Details */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
        <h3 className="font-semibold mb-4">Income History</h3>
        {aggregatedData.incomeList.length > 0 ? (
          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                <tr>
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-right py-2 px-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedData.incomeList.map((inc, idx) => (
                  <tr key={inc.id || idx} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="py-2 px-3">{inc.date?.split('T')[0]}</td>
                    <td className="py-2 px-3">{inc.description}</td>
                    <td className="py-2 px-3 text-right">{formatRupiah(inc.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No income records found for this period.</p>
        )}
      </div>

      {/* Expense Categories */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Spending by Category</h3>
        {aggregatedData.categories.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center text-slate-500">
            No spending data for this period.
          </div>
        ) : (
          aggregatedData.categories.map((cat, idx) => (
            <details key={idx} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 group">
              <summary className="cursor-pointer flex items-center justify-between list-none">
                <div className="flex items-center gap-2">
                   <span className={`transform transition-transform group-open:rotate-90`}>▶</span>
                   <span className="font-semibold">{cat.name}</span>
                </div>
                <span className="font-bold">{formatRupiah(cat.total)}</span>
              </summary>
              <div className="mt-4 pl-6">
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                   {selectedMonths.map(month => (
                     <div key={month} className="p-2 border border-slate-100 dark:border-slate-700 rounded">
                       <div className="text-xs text-slate-500">{month}</div>
                       <div className="font-medium">{formatRupiah(cat.monthly[month] || 0)}</div>
                     </div>
                   ))}
                 </div>
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  // State and hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [theme, toggleTheme] = useDarkMode();
  const currentView = location.pathname.replace('/', '') || 'dashboard';
  const [income, setIncome] = useLocalStorage<number>('monthlyIncome', 0);
  const [categories, setCategories] = useLocalStorage<CategoryWithBudget[]>('categories', INITIAL_CATEGORIES as CategoryWithBudget[]);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [sources, setSources] = useLocalStorage<TransactionSource[]>('sources', INITIAL_SOURCES);
  const [incomes, setIncomes] = useLocalStorage<Income[]>('incomes', []);
  const [lastActiveMonth, setLastActiveMonth] = useLocalStorage<string>('lastActiveMonth', '');
  const [monthlyArchives, setMonthlyArchives] = useLocalStorage<MonthlyArchive[]>('monthlyArchives', []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithBudget | null>(null);
  const [viewingCategory, setViewingCategory] = useState<CategoryWithBudget | null>(null);
  const [showNewMonthModal, setShowNewMonthModal] = useState(false);

  const totalLoggedIncome = useMemo(() => {
    return incomes.reduce((acc, inc) => acc + (inc.amount || 0), 0);
  }, [incomes]);

  const effectiveIncome = totalLoggedIncome > 0 ? totalLoggedIncome : income;

  // Keep `income` as user-controlled monthly income.
  // If you want to display total balances across sources, compute it separately (do not persist into `income`).
  const totalSourceBalance = useMemo(() => {
    return sources.reduce((acc, s) => acc + (s.balance || 0), 0);
  }, [sources]);

  // Recompute category planned/budget when income or allocations change
  React.useEffect(() => {
    setCategories(prev => {
      let changed = false;
      const updated = prev.map(cat => {
        const planned = (effectiveIncome || 0) * (cat.allocation / 100);
        if (cat.planned !== planned || cat.budget !== planned) {
          changed = true;
          return { ...cat, planned, budget: planned } as CategoryWithBudget;
        }
        return cat;
      });
      return changed ? updated : prev;
    });
  }, [effectiveIncome, categories, setCategories]);

  // Calculate totals
  const totalExpenses = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.spent || 0), 0);
  }, [categories]);

  const totalSavings = useMemo(() => {
    return effectiveIncome - totalExpenses;
  }, [effectiveIncome, totalExpenses]);

  // Navigation handler
  const handleNavigation = useCallback((view: string) => {
    navigate(`/${view}`);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [navigate, mobileMenuOpen]);

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const category = categories.find(c => c.id === expense.categoryId);
    if (category) {
      const newExpense = { ...expense, id: Date.now().toString() };
      const updatedCategory = {
        ...category,
        spent: category.spent + newExpense.amount,
        expenses: [...category.expenses, newExpense],
      };
      setCategories(categories.map(c => c.id === expense.categoryId ? updatedCategory : c));
      addToast({ type: 'success', message: 'Expense added!' });
    }
  };

  const handleEditExpense = useCallback((updated: Expense) => {
    setCategories(prev => {
      // Locate the original expense and category
      let originalCategoryId: string | null = null;
      let originalExpense: Expense | null = null;
      prev.forEach(cat => {
        const exp = cat.expenses.find(e => e.id === updated.id);
        if (exp) {
          originalCategoryId = cat.id;
          originalExpense = exp;
        }
      });

      if (!originalExpense || !originalCategoryId) {
        addToast({ type: 'error', message: 'Original expense not found.' });
        return prev;
      }

      // If category changed, move expense
      if (originalCategoryId !== updated.categoryId) {
        return prev.map(cat => {
          if (cat.id === originalCategoryId) {
            // remove from old category and adjust spent
            const newExpenses = cat.expenses.filter(e => e.id !== updated.id);
            const newSpent = Math.max(0, cat.spent - originalExpense!.amount);
            return { ...cat, expenses: newExpenses, spent: newSpent };
          }
          if (cat.id === updated.categoryId) {
            // add to new category and adjust spent
            const newExpenses = [...cat.expenses, { ...updated }];
            const newSpent = cat.spent + updated.amount;
            return { ...cat, expenses: newExpenses, spent: newSpent };
          }
          return cat;
        });
      }

      // Same category: update in place and adjust spent delta
      return prev.map(cat => {
        if (cat.id !== originalCategoryId) return cat;
        const newExpenses = cat.expenses.map(e => (e.id === updated.id ? { ...e, ...updated } : e));
        const delta = (updated.amount || 0) - (originalExpense!.amount || 0);
        const newSpent = Math.max(0, cat.spent + delta);
        return { ...cat, expenses: newExpenses, spent: newSpent };
      });
    });
    addToast({ type: 'success', message: 'Expense updated!' });
  }, [setCategories, addToast]);

  const handleDeleteExpense = useCallback((expenseId: string) => {
    let found = false;
    let deleted: { expense: Expense; categoryId: string } | null = null;
    const updated = categories.map(cat => {
      const exp = cat.expenses.find(e => e.id === expenseId);
      if (exp) {
        found = true;
        const newExpenses = cat.expenses.filter(e => e.id !== expenseId);
        const newSpent = Math.max(0, cat.spent - exp.amount);
        // Track for undo
        deleted = { expense: exp, categoryId: cat.id };
        return { ...cat, expenses: newExpenses, spent: newSpent };
      }
      return cat;
    });
    if (found) {
      setCategories(updated);
      addToast({ 
        type: 'info', 
        message: 'Expense removed.',
        action: {
          text: 'Undo',
          onClick: () => {
            setCategories(prev => prev.map(cat => {
              if (deleted && cat.id === deleted.categoryId) {
                return {
                  ...cat,
                  expenses: [...cat.expenses, deleted.expense],
                  spent: cat.spent + deleted.expense.amount,
                };
              }
              return cat;
            }));
          }
        }
      });
    } else {
      addToast({ type: 'error', message: 'Expense not found.' });
    }
  }, [categories, setCategories, addToast]);

  const handleAddSource = useCallback((name: string, balance: number = 0) => {
    const newSource: TransactionSource = { id: `src-${Date.now()}`, name, balance };
    setSources(prev => [...prev, newSource]);
    addToast({ type: 'success', message: 'Source added!' });
  }, [setSources, addToast]);

  const handleEditSource = useCallback((id: string, name: string, balance: number) => {
    setSources(prev => prev.map(s => (s.id === id ? { ...s, name, balance } : s)));
    addToast({ type: 'success', message: 'Source updated!' });
  }, [setSources, addToast]);

  const handleDeleteSource = useCallback((id: string) => {
    // Prevent deletion if any expense is using this source
    const isUsed = categories.some(cat => cat.expenses.some(e => e.sourceId === id));
    if (isUsed) {
      addToast({ type: 'error', message: 'Cannot delete source: it is used by some expenses.' });
      return;
    }
    setSources(prev => prev.filter(s => s.id !== id));
    addToast({ type: 'info', message: 'Source deleted.' });
  }, [categories, setSources, addToast]);

  const handleTransferSources = useCallback((fromId: string, toId: string, amount: number) => {
    if (!fromId || !toId || fromId === toId) {
      addToast({ type: 'error', message: 'Pilih sumber berbeda.' });
      return;
    }
    if (!(amount > 0)) {
      addToast({ type: 'error', message: 'Nominal transfer harus > 0.' });
      return;
    }
    setSources(prev => {
      const from = prev.find(s => s.id === fromId);
      const to = prev.find(s => s.id === toId);
      if (!from || !to) return prev;
      if ((from.balance || 0) < amount) {
        addToast({ type: 'error', message: 'Saldo sumber tidak mencukupi.' });
        return prev;
      }
      return prev.map(s => {
        if (s.id === fromId) return { ...s, balance: (s.balance || 0) - amount };
        if (s.id === toId) return { ...s, balance: (s.balance || 0) + amount };
        return s;
      });
    });
    addToast({ type: 'success', message: 'Transfer berhasil.' });
  }, [setSources, addToast]);

  // Income handlers
  const handleAddIncome = useCallback((incomeItem: Omit<Income, 'id' | 'date'> & { date?: string }) => {
    const newIncome: Income = {
      id: `inc-${Date.now()}`,
      description: incomeItem.description,
      amount: incomeItem.amount,
      sourceId: incomeItem.sourceId,
      date: incomeItem.date || new Date().toISOString(),
    };
    setIncomes(prev => [newIncome, ...prev]);
    // Update source balance
    setSources(prev => prev.map(s => s.id === newIncome.sourceId ? { ...s, balance: (s.balance || 0) + newIncome.amount } : s));
    addToast({ type: 'success', message: 'Income added!' });
  }, [setIncomes, setSources, addToast]);

  const handleEditIncome = useCallback((updated: Income) => {
    setIncomes(prev => prev.map(i => i.id === updated.id ? { ...updated } : i));
    // Adjust source balances by delta and source change
    setSources(prev => {
      // find original
      let original: Income | undefined = incomes.find(i => i.id === updated.id);
      if (!original) return prev;
      const arr = prev.map(s => {
        if (s.id === original!.sourceId && original!.sourceId !== updated.sourceId) {
          return { ...s, balance: (s.balance || 0) - original!.amount };
        }
        if (s.id === updated.sourceId && original!.sourceId !== updated.sourceId) {
          return { ...s, balance: (s.balance || 0) + updated.amount };
        }
        return s;
      });
      // if same source, apply delta
      if (original.sourceId === updated.sourceId) {
        const delta = updated.amount - original.amount;
        return arr.map(s => s.id === updated.sourceId ? { ...s, balance: (s.balance || 0) + delta } : s);
      }
      return arr;
    });
    addToast({ type: 'success', message: 'Income updated!' });
  }, [incomes, setIncomes, setSources, addToast]);

  const handleDeleteIncome = useCallback((incomeId: string) => {
    let removed: Income | undefined;
    setIncomes(prev => {
      removed = prev.find(i => i.id === incomeId);
      return prev.filter(i => i.id !== incomeId);
    });
    if (removed) {
      setSources(prev => prev.map(s => s.id === removed!.sourceId ? { ...s, balance: Math.max(0, (s.balance || 0) - removed!.amount) } : s));
      addToast({ type: 'info', message: 'Income deleted.' });
    }
  }, [setIncomes, setSources, addToast]);

  // Detect new month and prompt user
  React.useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (!lastActiveMonth) {
      setLastActiveMonth(currentMonth);
      return;
    }
    if (lastActiveMonth !== currentMonth) {
      setShowNewMonthModal(true);
    }
  }, [lastActiveMonth, setLastActiveMonth]);

  const handleNewMonthConfirm = useCallback((options: { resetExpenses: boolean; newIncome?: number | null }) => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (typeof options.newIncome === 'number' && !Number.isNaN(options.newIncome)) {
      setIncome(options.newIncome);
      addToast({ type: 'success', message: 'Income updated for the new month.' });
    } else if (options.resetExpenses) {
      // If resetting without specifying a new income, default to 0
      setIncome(0);
    }
    if (options.resetExpenses) {
      // Arsipkan bulan sebelumnya agar tetap tersedia di Reports
      if (lastActiveMonth) {
        const archive: MonthlyArchive = {
          month: lastActiveMonth,
          income: effectiveIncome,
          // simpan snapshot lengkap untuk laporan terperinci mingguan
          categories: categories.map(c => ({ ...c })),
          goals: goals.map(g => ({ ...g })),
          sources: sources.map(s => ({ ...s })),
          incomes: incomes.map(i => ({ ...i })),
        };
        setMonthlyArchives(prev => {
          const withoutDup = prev.filter(a => a.month !== archive.month);
          return [...withoutDup, archive];
        });
      }
      // Reset data berjalan
      setCategories(prev => prev.map(c => ({ ...c, spent: 0, expenses: [] })));
      setIncomes([]);
      setSources([]);
      addToast({ type: 'info', message: 'Expenses reset for the new month.' });
    }
    setLastActiveMonth(currentMonth);
    setShowNewMonthModal(false);
  }, [income, effectiveIncome, categories, goals, sources, incomes, lastActiveMonth, setIncome, setCategories, setLastActiveMonth, setMonthlyArchives, addToast]);

  const handleArchiveAndResetCurrentMonth = useCallback(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    // Arsipkan snapshot bulan berjalan
    const archive: MonthlyArchive = {
      month: currentMonth,
      income: effectiveIncome,
      categories: categories.map(c => ({ ...c })),
      goals: goals.map(g => ({ ...g })),
      sources: sources.map(s => ({ ...s })),
      incomes: incomes.map(i => ({ ...i })),
    };
    setMonthlyArchives(prev => {
      const withoutDup = prev.filter(a => a.month !== archive.month);
      return [...withoutDup, archive];
    });
    // Reset data bulan berjalan
    setCategories(prev => prev.map(c => ({ ...c, spent: 0, expenses: [] })));
    setIncomes([]);
    setSources([]);
    // Also reset monthly income value when archiving via Data page
    setIncome(0);
    setLastActiveMonth(currentMonth);
    addToast({ type: 'info', message: 'Current month archived and expenses reset.' });
  }, [income, effectiveIncome, categories, goals, sources, incomes, setIncome, setMonthlyArchives, setCategories, setLastActiveMonth, addToast]);

  const handleNewMonthSkip = useCallback(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setLastActiveMonth(currentMonth);
    setShowNewMonthModal(false);
  }, [setLastActiveMonth]);

  const handleSaveCategory = useCallback((categoryData: Omit<Category, 'id' | 'expenses'> & { id?: string }) => {
    if (categoryData.id) {
      setCategories(prev => prev.map(cat => cat.id === categoryData.id ? { ...cat, ...categoryData, planned: cat.planned, spent: cat.spent, expenses: cat.expenses } : cat));
      addToast({ type: 'success', message: 'Category updated!' });
    } else {
      const newCategory: CategoryWithBudget = {
        ...categoryData,
        id: `cat-${Date.now()}`,
        expenses: [],
        spent: 0,
        planned: 0,
        budget: 0,
        isActive: true
      };
      setCategories(prev => [...prev, newCategory]);
      addToast({ type: 'success', message: 'Category added!' });
    }
    setCategoryModalOpen(false);
    setEditingCategory(null);
  }, [setCategories, addToast]);

  const handleDeleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    addToast({ type: 'info', message: 'Category deleted.' });
  }, [setCategories, addToast]);

  const handleOpenModal = useCallback((category: Category | null = null) => {
    setEditingCategory(category as CategoryWithBudget | null);
    setCategoryModalOpen(true);
  }, []);

  const handleAllocationChange = (categoryId: string, newAllocation: number) => {
    const normalizedAllocation = Number.isFinite(newAllocation) ? Math.max(0, newAllocation) : 0;
    setCategories(prev =>
      prev.map(c => (c.id === categoryId ? { ...c, allocation: normalizedAllocation } : c))
    );
  };

  const handleAutoAdjustAllocation = () => {
    setCategories(prev => {
      if (prev.length === 0) return prev;

      const totalAlloc = prev.reduce((sum, cat) => sum + (cat.allocation || 0), 0);

      if (totalAlloc === 100) {
        const base = Math.floor(100 / prev.length);
        let remainder = 100 - base * prev.length;
        return prev.map((cat) => {
          const allocation = base + (remainder > 0 ? 1 : 0);
          if (remainder > 0) remainder -= 1;
          return { ...cat, allocation };
        });
      }

      const adjustableIndices = prev
        .map((cat, idx) => ({ idx, allocation: cat.allocation || 0 }))
        .filter(x => x.allocation > 0)
        .map(x => x.idx);

      if (adjustableIndices.length === 0) {
        const base = Math.floor(100 / prev.length);
        let remainder = 100 - base * prev.length;
        return prev.map((cat) => {
          const allocation = base + (remainder > 0 ? 1 : 0);
          if (remainder > 0) remainder -= 1;
          return { ...cat, allocation };
        });
      }

      const adjustableTotal = adjustableIndices.reduce((sum, idx) => sum + (prev[idx].allocation || 0), 0);
      if (adjustableTotal === 0) return prev;

      const raw = adjustableIndices.map((idx) => {
        const exact = ((prev[idx].allocation || 0) / adjustableTotal) * 100;
        const floored = Math.floor(exact);
        return { idx, exact, floored, frac: exact - floored };
      });

      let remaining = 100 - raw.reduce((sum, r) => sum + r.floored, 0);
      const withRemainder = [...raw].sort((a, b) => b.frac - a.frac);
      for (let i = 0; i < withRemainder.length && remaining > 0; i += 1) {
        withRemainder[i] = { ...withRemainder[i], floored: withRemainder[i].floored + 1 };
        remaining -= 1;
      }

      const nextAllocations = new Map<number, number>(
        withRemainder.map(r => [r.idx, r.floored])
      );

      return prev.map((cat, idx) => {
        if (!nextAllocations.has(idx)) return { ...cat, allocation: 0 };
        return { ...cat, allocation: nextAllocations.get(idx)! };
      });
    });

    const currentTotal = categories.reduce((sum, cat) => sum + (cat.allocation || 0), 0);
    if (currentTotal === 100) {
      addToast({ type: 'success', message: 'Allocations equalized.' });
    } else {
      addToast({ type: 'success', message: 'Allocations fixed to 100%.' });
    }
  };

  const handleViewCategory = (category: Category) => {
    setViewingCategory(category as CategoryWithBudget);
  };

  const handleExportData = (format: 'json' | 'pdf' | 'csv') => {
    const data = { categories, goals, income: effectiveIncome, sources, incomes, monthlyArchives };

    if (format === 'json') {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = 'finance-data.json';
      link.click();
    }

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('Finance Report', 20, 10);
      
      // Categories
      (doc as any).autoTable({
        head: [['Category', 'Planned', 'Spent']],
        body: categories.map(c => [c.name, c.planned, c.spent]),
        startY: 20,
      });

      // Goals
      (doc as any).autoTable({
        head: [['Goal', 'Target', 'Current']],
        body: goals.map(g => [g.name, g.targetAmount, g.currentAmount]),
        startY: (doc as any).lastAutoTable.finalY + 10,
      });

      doc.save('finance-report.pdf');
    }

    if (format === 'csv') {
      const csv = Papa.unparse(categories.map(c => ({ Category: c.name, Planned: c.planned, Spent: c.spent })))
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'finance-data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImportData = (importedData: any) => {
    const newIncome = importedData.income || income;
    if (importedData.income) {
      setIncome(newIncome);
    }

    if (importedData.categories) {
      const updatedCategories = importedData.categories.map((cat: any) => {
        const spent = cat.expenses ? cat.expenses.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0) : 0;
        const planned = newIncome * (cat.allocation / 100);
        return { ...cat, spent, planned, budget: planned };
      });
      setCategories(updatedCategories);
    }

    if (importedData.goals) {
      setGoals(importedData.goals);
    }

    if (importedData.monthlyArchives) {
      setMonthlyArchives(importedData.monthlyArchives);
    }

    if (importedData.incomes && Array.isArray(importedData.incomes)) {
      setIncomes(importedData.incomes);
    }

    if (importedData.sources) {
      const normalized = importedData.sources.map((s: any) => ({
        id: s.id,
        name: s.name,
        balance: typeof s.balance === 'number' ? s.balance : 0
      }));
      setSources(normalized);
    } else {
      // Derive sources from expenses if present
      const sourceIds = new Set<string>();
      if (importedData.categories) {
        importedData.categories.forEach((cat: any) => {
          (cat.expenses || []).forEach((exp: any) => {
            if (exp.sourceId) sourceIds.add(exp.sourceId);
          });
        });
      }
      if (sourceIds.size > 0) {
        const derived = Array.from(sourceIds).map((id) => ({ id, name: `Source ${id.slice(-4)}`, balance: 0 }));
        setSources(derived);
      } else if (sources.length === 0) {
        // keep existing or initialize empty
        setSources(prev => (prev && prev.length > 0 ? prev : INITIAL_SOURCES));
      }
    }

    addToast({ type: 'success', message: 'Data imported successfully!' });
  };

  // Render the appropriate view based on the current route
  const renderView = (): React.ReactNode => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            income={effectiveIncome}
            totalExpenses={totalExpenses}
            totalSavings={totalSavings}
            categories={categories}
            goals={goals}
            sources={sources}
          />
        );
      case 'expenses':
        return (
          <div className="space-y-6">
            <ExpenseLogger
              categories={categories}
              onAddExpense={handleAddExpense}
              isAddDisabled={false}
              transactionSources={sources}
            />
            <ExpenseHistory
              categories={categories}
              sources={sources}
            onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          </div>
        );
      case 'sources': {
        const totalsBySource: Record<string, number> = {};
        const usedCountBySource: Record<string, number> = {};
        categories.forEach(cat => {
          cat.expenses.forEach(exp => {
            totalsBySource[exp.sourceId] = (totalsBySource[exp.sourceId] || 0) + exp.amount;
            usedCountBySource[exp.sourceId] = (usedCountBySource[exp.sourceId] || 0) + 1;
          });
        });
        return (
          <SourceManager
            sources={sources}
            onAddSource={handleAddSource}
            onDeleteSource={handleDeleteSource}
            onEditSource={handleEditSource}
            onTransfer={handleTransferSources}
            totalsBySource={totalsBySource}
            usedCountBySource={usedCountBySource}
          />
        );
      }
      case 'income':
        return (
          <div className="space-y-6">
            <IncomeInput onAddIncome={(payload) => handleAddIncome({ ...payload })} transactionSources={sources} />
            <IncomeHistory incomes={incomes} sources={sources} onEditIncome={handleEditIncome} onDeleteIncome={handleDeleteIncome} />
          </div>
        );
      case 'categories':
        return (
          <CategoryManager
            categories={categories}
            onAllocationChange={handleAllocationChange}
            totalAllocation={categories.reduce((sum, cat) => sum + cat.allocation, 0)}
            onOpenModal={handleOpenModal}
            onDeleteCategory={handleDeleteCategory}
            onAutoAdjustAllocation={handleAutoAdjustAllocation}
            onViewCategory={handleViewCategory}
          />
        );
      case 'goals':
        return (
          <GoalManager
            goals={goals}
            onAddGoal={(goal) => {
              setGoals(prev => [...prev, { ...goal, id: Date.now().toString(), currentAmount: 0 }]);
              addToast({ type: 'success', message: 'Goal added!' });
            }}
            onUpdateGoal={(updatedGoal) => {
              setGoals(prev => prev.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal));
              addToast({ type: 'success', message: 'Goal updated!' });
            }}
            onDeleteGoal={(goalId) => {
              setGoals(prev => prev.filter(g => g.id !== goalId));
              addToast({ type: 'info', message: 'Goal deleted.' });
            }}
            availableFunds={totalSavings}
          />
        );
      case 'data':
        return (
          <DataManager
            onImport={handleImportData}
            onExport={handleExportData}
            onResetCurrentMonth={handleArchiveAndResetCurrentMonth}
          />
        );
      case 'reports': {
        // Kumpulkan bulan dari transaksi aktif + arsip
        return <ReportsView categories={categories} monthlyArchives={monthlyArchives} incomes={incomes} />;
      }
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">404</h2>
              <p className="text-slate-600 dark:text-slate-300">Page not found</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg"
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform duration-200 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">Finance Tracker</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-slate-300">
              <p>Total Income: {formatRupiah(effectiveIncome)}</p>
              <p>Total Expenses: {formatRupiah(totalExpenses)}</p>
              <p className="font-medium">Balance: {formatRupiah(totalSavings)}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Total Source Balance: {formatRupiah(totalSourceBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <header className="bg-white dark:bg-slate-800 shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
              {navItems.find(item => item.id === currentView)?.label || 'Dashboard'}
            </h1>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600"
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
          {renderView()}
        </main>
      </div>

      {isCategoryModalOpen && (
        <CategoryEditor
          categoryToEdit={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => setCategoryModalOpen(false)}
        />
      )}

      <CategoryDetailModal 
        category={viewingCategory}
        onClose={() => setViewingCategory(null)}
      />
      {/* New Month Modal */}
      {showNewMonthModal && (
        <NewMonthModal
          currentIncome={effectiveIncome}
          onConfirm={handleNewMonthConfirm}
          onSkip={handleNewMonthSkip}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppContent />
  );
};

export default App;
