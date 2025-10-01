import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Category, Goal, Expense, TransactionSource, MonthlyArchive } from './types';
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
  FiDatabase
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
import ExpenseHistory from '@/components/ExpenseHistory';
import { useDarkMode } from './hooks/useDarkMode';
import { SunIcon, MoonIcon } from './components/icons';
import NewMonthModal from './components/NewMonthModal.tsx';

// Navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
  { id: 'expenses', label: 'Expenses', icon: <FiDollarSign size={20} /> },
  { id: 'categories', label: 'Categories', icon: <FiTag size={20} /> },
  { id: 'goals', label: 'Goals', icon: <FiTarget size={20} /> },
  { id: 'reports', label: 'Reports', icon: <FiPieChart size={20} /> },
  { id: 'data', label: 'Data', icon: <FiDatabase size={20} /> },
];

// Update the Category type to include planned and spent
export interface CategoryWithBudget extends Category {
  planned: number;
  spent: number;
}

// Extracted Reports view into its own component to use Hooks safely
const ReportsView: React.FC<{
  categories: CategoryWithBudget[];
  monthlyArchives: MonthlyArchive[];
}> = ({ categories, monthlyArchives }) => {
  const currentAllExpenses = categories.flatMap(c => c.expenses.map(e => ({ ...e, categoryName: c.name })));
  const archiveMonths = monthlyArchives.map(a => a.month);
  const uniqueMonths = Array.from(new Set([
    ...currentAllExpenses.map(e => e.date?.slice(0, 7)).filter(Boolean) as string[],
    ...archiveMonths,
  ])).sort();
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = React.useState(uniqueMonths.includes(currentMonth) ? currentMonth : (uniqueMonths[0] || currentMonth));
  const [useISOWeek, setUseISOWeek] = React.useState(false);

  React.useEffect(() => {
    const months = Array.from(new Set(
      categories.flatMap(c => c.expenses.map(e => e.date?.slice(0, 7)).filter(Boolean))
    ));
    if (months.length > 0 && !months.includes(selectedMonth)) {
      setSelectedMonth(months[0]);
    }
  }, [categories]);

  const getISOWeekLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) as any;
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1)) as any;
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    return `ISO W${weekNo}`;
  };

  const getWeekLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    if (day <= 7) return 'Week 1 (1-7)';
    if (day <= 14) return 'Week 2 (8-14)';
    if (day <= 21) return 'Week 3 (15-21)';
    return 'Week 4 (22-end)';
  };

  const isArchive = !categories.some(c => c.expenses.some(e => e.date?.startsWith(selectedMonth))) && monthlyArchives.some(a => a.month === selectedMonth);
  const sourceCategories = isArchive ? monthlyArchives.find(a => a.month === selectedMonth)!.categories as CategoryWithBudget[] : categories;

  const filteredByMonth = sourceCategories.map(cat => {
    const expenses = cat.expenses.filter(e => e.date?.startsWith(selectedMonth));
    const weekly: Record<string, number> = {};
    expenses.forEach(e => {
      const label = useISOWeek ? getISOWeekLabel(e.date) : getWeekLabel(e.date);
      weekly[label] = (weekly[label] || 0) + e.amount;
    });
    const total = Object.values(weekly).reduce((a, b) => a + b, 0);
    return {
      categoryId: (cat as any).id,
      categoryName: (cat as any).name,
      weekly,
      total
    };
  }).filter(c => c.total > 0);

  filteredByMonth.sort((a, b) => b.total - a.total);
  const monthOptions = uniqueMonths.length ? uniqueMonths : [currentMonth];

  const orderedWeekLabels = () => {
    if (!useISOWeek) return ['Week 1 (1-7)', 'Week 2 (8-14)', 'Week 3 (15-21)', 'Week 4 (22-end)'];
    const set = new Set<string>();
    filteredByMonth.forEach(c => Object.keys(c.weekly).forEach(l => set.add(l)));
    return Array.from(set).sort();
  };

  const exportReport = (format: 'pdf' | 'csv') => {
    const weekLabels = orderedWeekLabels();
    const rows = filteredByMonth.map(cat => {
      const row: Record<string, any> = { Category: cat.categoryName };
      weekLabels.forEach(w => { row[w] = cat.weekly[w] || 0; });
      row.Total = cat.total;
      return row;
    });

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(`Finance Report ${selectedMonth}${useISOWeek ? ' (ISO Weeks)' : ''}`, 20, 10);
      const head = [['Category', ...weekLabels, 'Total']];
      const body = rows.map(r => [
        r.Category,
        ...weekLabels.map(w => r[w]),
        r.Total,
      ]);
      (doc as any).autoTable({ head, body, startY: 20 });
      doc.save(`finance-report-${selectedMonth}.pdf`);
    } else {
      const header = ['Category', ...weekLabels, 'Total'];
      const data = rows.map(r => {
        const obj: any = { Category: r.Category };
        weekLabels.forEach(w => obj[w] = r[w]);
        obj.Total = r.Total;
        return obj;
      });
      const csv = Papa.unparse({ fields: header, data: data.map(d => header.map(h => d[h])) });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `finance-report-${selectedMonth}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Reports</h2>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex items-center gap-3 flex-wrap">
        <label className="text-sm text-slate-700 dark:text-slate-300">Bulan:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded"
        >
          {monthOptions.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <label className="ml-2 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" checked={useISOWeek} onChange={(e) => setUseISOWeek(e.target.checked)} />
          ISO Week
        </label>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => exportReport('pdf')} className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Export PDF</button>
          <button onClick={() => exportReport('csv')} className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Export CSV</button>
        </div>
      </div>

      {filteredByMonth.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-slate-300">Belum ada pengeluaran pada bulan ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredByMonth.map(cat => (
            <details key={cat.categoryId} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
              <summary className="cursor-pointer flex items-center justify-between">
                <span className="font-semibold">{cat.categoryName}</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">Total: {formatRupiah(cat.total)}</span>
              </summary>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {['Week 1 (1-7)', 'Week 2 (8-14)', 'Week 3 (15-21)', 'Week 4 (22-end)'].map(week => (
                  <div key={week} className="p-3 rounded border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{week}</div>
                    <div className="text-base font-medium">{formatRupiah(cat.weekly[week] || 0)}</div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
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
  const [lastActiveMonth, setLastActiveMonth] = useLocalStorage<string>('lastActiveMonth', '');
  const [monthlyArchives, setMonthlyArchives] = useLocalStorage<MonthlyArchive[]>('monthlyArchives', []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithBudget | null>(null);
  const [viewingCategory, setViewingCategory] = useState<CategoryWithBudget | null>(null);
  const [lastDeletedExpense, setLastDeletedExpense] = useState<{ expense: Expense; categoryId: string } | null>(null);
  const [showNewMonthModal, setShowNewMonthModal] = useState(false);

  // Calculate totals
  const totalExpenses = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.spent || 0), 0);
  }, [categories]);

  const totalSavings = useMemo(() => {
    return income - totalExpenses;
  }, [income, totalExpenses]);

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

  const handleDeleteExpense = useCallback((expenseId: string) => {
    let found = false;
    const updated = categories.map(cat => {
      const exp = cat.expenses.find(e => e.id === expenseId);
      if (exp) {
        found = true;
        const newExpenses = cat.expenses.filter(e => e.id !== expenseId);
        const newSpent = Math.max(0, cat.spent - exp.amount);
        // Track for undo
        setLastDeletedExpense({ expense: exp, categoryId: cat.id });
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
              if (lastDeletedExpense && cat.id === lastDeletedExpense.categoryId) {
                return {
                  ...cat,
                  expenses: [...cat.expenses, lastDeletedExpense.expense],
                  spent: cat.spent + lastDeletedExpense.expense.amount,
                };
              }
              return cat;
            }));
            setLastDeletedExpense(null);
          }
        }
      });
    } else {
      addToast({ type: 'error', message: 'Expense not found.' });
    }
  }, [categories, setCategories, addToast, lastDeletedExpense]);

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
    }
    if (options.resetExpenses) {
      // Arsipkan bulan sebelumnya agar tetap tersedia di Reports
      if (lastActiveMonth) {
        const archive: MonthlyArchive = {
          month: lastActiveMonth,
          income,
          // simpan snapshot lengkap untuk laporan terperinci mingguan
          categories: categories.map(c => ({ ...c })),
          goals: goals.map(g => ({ ...g })),
          sources: sources.map(s => ({ ...s })),
        };
        setMonthlyArchives(prev => {
          const withoutDup = prev.filter(a => a.month !== archive.month);
          return [...withoutDup, archive];
        });
      }
      setCategories(prev => prev.map(c => ({ ...c, spent: 0, expenses: [] })));
      addToast({ type: 'info', message: 'Expenses reset for the new month.' });
    }
    setLastActiveMonth(currentMonth);
    setShowNewMonthModal(false);
  }, [income, categories, goals, sources, lastActiveMonth, setIncome, setCategories, setLastActiveMonth, setMonthlyArchives, addToast]);

  const handleArchiveAndResetCurrentMonth = useCallback(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    // Arsipkan snapshot bulan berjalan
    const archive: MonthlyArchive = {
      month: currentMonth,
      income,
      categories: categories.map(c => ({ ...c })),
      goals: goals.map(g => ({ ...g })),
      sources: sources.map(s => ({ ...s })),
    };
    setMonthlyArchives(prev => {
      const withoutDup = prev.filter(a => a.month !== archive.month);
      return [...withoutDup, archive];
    });
    // Reset pengeluaran bulan berjalan
    setCategories(prev => prev.map(c => ({ ...c, spent: 0, expenses: [] })));
    setLastActiveMonth(currentMonth);
    addToast({ type: 'info', message: 'Current month archived and expenses reset.' });
  }, [income, categories, goals, sources, setMonthlyArchives, setCategories, setLastActiveMonth, addToast]);

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
    setCategories(categories.map(c => c.id === categoryId ? { ...c, allocation: newAllocation } : c));
  };

  const handleAutoAdjustAllocation = () => {
    const totalAlloc = categories.reduce((sum, cat) => sum + cat.allocation, 0);
    if (totalAlloc !== 100) {
      addToast({ type: 'error', message: 'Total allocation must be 100%' });
    }
  };

  const handleViewCategory = (category: Category) => {
    setViewingCategory(category as CategoryWithBudget);
  };

  const handleExportData = (format: 'json' | 'pdf' | 'csv') => {
    const data = { categories, goals, income, sources, monthlyArchives };

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
            income={income}
            totalExpenses={totalExpenses}
            totalSavings={totalSavings}
            categories={categories}
            goals={goals}
            sources={sources}
          />
        );
      case 'expenses':
        // Compute totals and usage per source
        const totalsBySource: Record<string, number> = {};
        const usedCountBySource: Record<string, number> = {};
        categories.forEach(cat => {
          cat.expenses.forEach(exp => {
            totalsBySource[exp.sourceId] = (totalsBySource[exp.sourceId] || 0) + exp.amount;
            usedCountBySource[exp.sourceId] = (usedCountBySource[exp.sourceId] || 0) + 1;
          });
        });
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
              onDeleteExpense={handleDeleteExpense}
            />
            <SourceManager
              sources={sources}
              onAddSource={handleAddSource}
              onDeleteSource={handleDeleteSource}
              onEditSource={handleEditSource}
              totalsBySource={totalsBySource}
              usedCountBySource={usedCountBySource}
            />
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
        const currentAllExpenses = categories.flatMap(c => c.expenses.map(e => ({ ...e, categoryName: c.name })));
        const archiveMonths = monthlyArchives.map(a => a.month);
        const uniqueMonths = Array.from(new Set([
          ...currentAllExpenses.map(e => e.date?.slice(0, 7)).filter(Boolean) as string[],
          ...archiveMonths,
        ])).sort();
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return <ReportsView categories={categories} monthlyArchives={monthlyArchives} />;
      }
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">404</h2>
              <p className="text-gray-600">Page not found</p>
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
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
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
              <p>Total Income: ${income.toFixed(2)}</p>
              <p>Total Expenses: ${totalExpenses.toFixed(2)}</p>
              <p className="font-medium">Balance: ${totalSavings.toFixed(2)}</p>
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
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
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
          currentIncome={income}
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