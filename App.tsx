import React, { useState, useMemo, useCallback } from 'react';
import { Category, Expense, Goal, Income, TransactionSource } from './types';
import { INITIAL_CATEGORIES, INITIAL_GOALS, INITIAL_SOURCES } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './contexts/ToastContext';
import IncomeInput from './components/IncomeInput';
import CategoryManager from './components/CategoryManager';
import ExpenseLogger from './components/ExpenseLogger';
import Dashboard from './components/Dashboard';
import { Summary } from './components/Summary';
import GoalManager from './components/GoalManager';
import CategoryEditor from './components/CategoryEditor';
import MobileNav from './components/MobileNav';
import { LogoIcon } from './components/icons';
import SourceManager from './components/SourceManager';
import MobileContent from './components/MobileContent';

function App() {
  const [income, setIncome] = useLocalStorage<number>('monthlyIncome', 0);
  const [categories, setCategories] = useLocalStorage<Category[]>('budgetCategories', INITIAL_CATEGORIES);
  const [goals, setGoals] = useLocalStorage<Goal[]>('savingGoals', INITIAL_GOALS);
  const [transactionSources, setTransactionSources] = useLocalStorage<TransactionSource[]>('transactionSources', INITIAL_SOURCES);
  const { addToast } = useToast();
  
  const [mobileView, setMobileView] = useState('dashboard');
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddIncome = useCallback((newIncome: Omit<Income, 'id'>) => {
    setIncome(prev => prev + newIncome.amount);
    addToast({ message: 'Income logged successfully!', type: 'success' });
  }, [setIncome, addToast]);

  const handleAddTransactionSource = (name: string) => {
    const newSource: TransactionSource = {
      id: `src-${new Date().getTime()}`,
      name,
    };
    setTransactionSources(prevSources => [...prevSources, newSource]);
    addToast({ message: 'Transaction source added!', type: 'success' });
  };

  const handleDeleteTransactionSource = (id: string) => {
    setTransactionSources(prevSources => prevSources.filter(source => source.id !== id));
    addToast({ message: 'Transaction source removed.', type: 'info' });
  };

  const handleAllocationChange = useCallback((categoryId: string, newAllocation: number) => {
    setCategories(prevCategories =>
      prevCategories.map(cat =>
        cat.id === categoryId ? { ...cat, allocation: Math.max(0, newAllocation) } : cat
      )
    );
  }, [setCategories]);

  const handleAddExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${new Date().getTime()}`,
    };
    setCategories(prevCategories =>
      prevCategories.map(cat =>
        cat.id === expense.categoryId
          ? { ...cat, expenses: [...cat.expenses, newExpense] }
          : cat
      )
    );
    addToast({ message: 'Expense logged successfully!', type: 'success' });
  }, [setCategories, addToast]);
  
  const handleAddGoal = useCallback((goal: Omit<Goal, 'id' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${new Date().getTime()}`,
      currentAmount: 0,
    };
    setGoals((prevGoals: Goal[]) => [...prevGoals, newGoal]);
    addToast({ message: 'New goal created!', type: 'success' });
  }, [setGoals, addToast]);

  const handleAllocateToGoal = useCallback((goalId: string, amount: number) => {
    setGoals((prevGoals: Goal[]) =>
      prevGoals.map((g: Goal) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );
    addToast({ message: `Funds added to goal!`, type: 'success' });
  }, [setGoals, addToast]);
  
  const handleDeleteGoal = useCallback((goalId: string) => {
     setGoals((prevGoals: Goal[]) => prevGoals.filter((g: Goal) => g.id !== goalId));
     addToast({ message: 'Goal removed.', type: 'info' });
  }, [setGoals, addToast]);

  const handleResetData = useCallback(() => {
    if(window.confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
        setIncome(0);
        setCategories(INITIAL_CATEGORIES);
        setGoals(INITIAL_GOALS);
        setTransactionSources(INITIAL_SOURCES);
        addToast({ message: 'All data has been reset.', type: 'info' });
    }
  }, [setIncome, setCategories, setGoals, setTransactionSources, addToast]);
  
  const handleClearExpenses = useCallback((categoryId: string) => {
     setCategories((prevCategories: Category[]) =>
      prevCategories.map((cat: Category) =>
        cat.id === categoryId
          ? { ...cat, expenses: [] }
          : cat
      )
    );
    addToast({ message: 'Expenses cleared for category.', type: 'info' });
  }, [setCategories, addToast]);

  const handleDeleteExpense = useCallback((categoryId: string, expenseId: string) => {
    setCategories((prevCategories: Category[]) =>
      prevCategories.map((cat: Category) =>
        cat.id === categoryId
          ? { ...cat, expenses: cat.expenses.filter(exp => exp.id !== expenseId) }
          : cat
      )
    );
    addToast({ message: 'Expense deleted successfully.', type: 'success' });
  }, [setCategories, addToast]);

  // Fungsi auto-adjust alokasi kategori
  const handleAutoAdjustAllocation = useCallback(() => {
    setCategories((prevCategories) => {
      if (prevCategories.length === 0) return prevCategories;
      const total = prevCategories.reduce((sum, cat) => sum + cat.allocation, 0);
      if (total === 100) return prevCategories;
      const diff = 100 - total;
      // Adjust the last category to make total 100%
      return prevCategories.map((cat, idx) =>
        idx === prevCategories.length - 1
          ? { ...cat, allocation: Math.max(0, cat.allocation + diff) }
          : cat
      );
    });
    addToast({ message: 'Budget allocations automatically adjusted to total 100%.', type: 'info' });
  }, [setCategories, addToast]);

  // Fungsi backup data
  const handleExportData = () => {
    const data = {
      income,
      categories,
      goals,
    };
    const date = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fileName = `finance-backup-${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast({ message: 'Data berhasil diekspor!', type: 'success' });
  };

  // Fungsi restore data
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (typeof imported !== 'object' || !imported) throw new Error('Format file tidak valid');
        if (!('income' in imported) || !('categories' in imported) || !('goals' in imported)) throw new Error('File tidak sesuai format aplikasi');
        localStorage.setItem('monthlyIncome', JSON.stringify(imported.income));
        localStorage.setItem('budgetCategories', JSON.stringify(imported.categories));
        localStorage.setItem('savingGoals', JSON.stringify(imported.goals));
        addToast({ message: 'Data berhasil diimpor! Aplikasi akan dimuat ulang.', type: 'success' });
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        addToast({ message: 'Gagal mengimpor data. Pastikan file benar.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  // --- Category CRUD ---
  const handleOpenCategoryModal = (category: Category | null) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };
  
  const handleCloseCategoryModal = () => {
    setEditingCategory(null);
    setCategoryModalOpen(false);
  };

  const handleSaveCategory = useCallback((categoryData: Omit<Category, 'id' | 'expenses'> & { id?: string }) => {
    if (categoryData.id) { // Update existing
      setCategories(prev => prev.map(cat => cat.id === categoryData.id ? { ...cat, ...categoryData } : cat));
      addToast({ message: `Category "${categoryData.name}" updated.`, type: 'success' });
    } else { // Add new
      const newCategory: Category = {
        ...categoryData,
        id: `cat-${new Date().getTime()}`,
        expenses: [],
      };
      setCategories(prev => [...prev, newCategory]);
      addToast({ message: `Category "${categoryData.name}" created.`, type: 'success' });
    }
    handleCloseCategoryModal();
  }, [setCategories, addToast, handleCloseCategoryModal]);
  
  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categories.find((c: Category) => c.id === categoryId);
    if (!categoryToDelete) return;

    if (categoryToDelete.expenses.length > 0) {
        addToast({ message: 'Cannot delete category with existing expenses. Please clear them first.', type: 'error'});
        return;
    }
    if (window.confirm(`Are you sure you want to delete the "${categoryToDelete.name}" category?`)) {
        setCategories((prev: Category[]) => prev.filter((c: Category) => c.id !== categoryId));
        addToast({ message: `Category "${categoryToDelete.name}" deleted.`, type: 'info' });
    }
  };

  const { totalSpent, totalAllocation, totalAllocatedToGoals } = useMemo(() => {
    const spent = categories.reduce((sum, cat) => {
      return sum + cat.expenses.reduce((catSum, exp) => catSum + exp.amount, 0);
    }, 0);
    const allocation = categories.reduce((sum, cat) => sum + cat.allocation, 0);
    const allocatedToGoals = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    return { totalSpent: spent, totalAllocation: allocation, totalAllocatedToGoals: allocatedToGoals };
  }, [categories, goals]);

  const totalBudget = income;
  const totalRemaining = totalBudget - totalSpent - totalAllocatedToGoals;
  const isBudgetValid = totalAllocation === 100;
  const availableToSave = totalBudget - totalSpent;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <LogoIcon className="w-10 h-10 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl text-slate-800 tracking-tight">Finance Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportData}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ekspor Data
            </button>
            <label className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
              Impor Data
              <input type="file" accept="application/json" onChange={handleImportData} className="hidden" />
            </label>
            <button
              onClick={handleResetData}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-indigo-500"
            >
              Reset All Data
            </button>
          </div>
        </header>

        <main className="relative">
            {/* Desktop View */}
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-1 space-y-6">
                  <Summary
                    totalBudget={totalBudget}
                    totalSpent={totalSpent}
                    totalRemaining={totalRemaining}
                    totalAllocatedToGoals={totalAllocatedToGoals}
                    categories={categories}
                    onDeleteExpense={handleDeleteExpense}
                  />
                  <IncomeInput onAddIncome={handleAddIncome} transactionSources={transactionSources} />
                  <ExpenseLogger
                    categories={categories}
                    onAddExpense={handleAddExpense}
                    isAddDisabled={!isBudgetValid}
                    transactionSources={transactionSources}
                  />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <SourceManager sources={transactionSources} onAddSource={handleAddTransactionSource} onDeleteSource={handleDeleteTransactionSource} />
                <CategoryManager
                  categories={categories}
                  onAllocationChange={handleAllocationChange}
                  totalAllocation={totalAllocation}
                  onOpenModal={handleOpenCategoryModal}
                  onDeleteCategory={handleDeleteCategory}
                  onAutoAdjustAllocation={handleAutoAdjustAllocation}
                />
                <GoalManager
                  goals={goals}
                  onAddGoal={handleAddGoal}
                  onAllocateToGoal={handleAllocateToGoal}
                  onDeleteGoal={handleDeleteGoal}
                  availableFunds={availableToSave}
                />
                <Dashboard 
                  income={income} 
                  categories={categories} 
                  onClearExpenses={handleClearExpenses}
                  onDeleteExpense={handleDeleteExpense}
                />
              </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden pb-24 space-y-6">
                <MobileContent
                    mobileView={mobileView}
                    totalBudget={totalBudget}
                    totalSpent={totalSpent}
                    totalRemaining={totalRemaining}
                    totalAllocatedToGoals={totalAllocatedToGoals}
                    categories={categories}
                    income={income}
                    onClearExpenses={handleClearExpenses}
                    onDeleteExpense={handleDeleteExpense}
                    onAddExpense={handleAddExpense}
                    isBudgetValid={isBudgetValid}
                    onAddIncome={handleAddIncome}
                    transactionSources={transactionSources}
                    onAllocationChange={handleAllocationChange}
                    totalAllocation={totalAllocation}
                    onOpenModal={handleOpenCategoryModal}
                    onDeleteCategory={handleDeleteCategory}
                    onAutoAdjustAllocation={handleAutoAdjustAllocation}
                    goals={goals}
                    onAddGoal={handleAddGoal}
                    onAllocateToGoal={handleAllocateToGoal}
                    onDeleteGoal={handleDeleteGoal}
                    availableToSave={availableToSave}
                />
            </div>
            
            <MobileNav activeView={mobileView} setActiveView={setMobileView} />
        </main>
      </div>
      
      {isCategoryModalOpen && (
        <CategoryEditor 
            onClose={handleCloseCategoryModal}
            onSave={handleSaveCategory}
            categoryToEdit={editingCategory}
        />
      )}
    </div>
  );
}

export default App;