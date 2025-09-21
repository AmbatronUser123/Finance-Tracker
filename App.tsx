import React, { useState, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import { Category, Goal, Expense, TransactionSource } from './types';
import { INITIAL_CATEGORIES, INITIAL_SOURCES } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './contexts/ToastContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithBudget | null>(null);
  const [viewingCategory, setViewingCategory] = useState<CategoryWithBudget | null>(null);
  const [lastDeletedExpense, setLastDeletedExpense] = useState<{ expense: Expense; categoryId: string } | null>(null);

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

  const handleAddSource = useCallback((name: string) => {
    const newSource: TransactionSource = { id: `src-${Date.now()}`, name };
    setSources(prev => [...prev, newSource]);
    addToast({ type: 'success', message: 'Source added!' });
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
    const data = { categories, goals, income, sources };

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

    if (importedData.sources) {
      setSources(importedData.sources);
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
        const derived = Array.from(sourceIds).map((id) => ({ id, name: `Source ${id.slice(-4)}` }));
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
          />
        );
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Reports</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Reports feature coming soon!</p>
            </div>
          </div>
        );
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
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;