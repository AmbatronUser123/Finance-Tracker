import React, { useState, useMemo, useCallback, ReactNode, useEffect } from 'react';
import { Category, Goal, Expense } from './types';
import { INITIAL_CATEGORIES, INITIAL_GOALS } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './contexts/ToastContext';
import { FiHome, FiPieChart, FiDollarSign, FiTag, FiTarget, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Components
import Dashboard from './components/Dashboard';
import ExpenseLogger from './components/ExpenseLogger';
import CategoryManager from './components/CategoryManager';
import GoalManager from './components/GoalManager';
import CategoryEditor from './components/CategoryEditor';

// Navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
  { id: 'expenses', label: 'Expenses', icon: <FiDollarSign size={20} /> },
  { id: 'categories', label: 'Categories', icon: <FiTag size={20} /> },
  { id: 'goals', label: 'Goals', icon: <FiTarget size={20} /> },
  { id: 'reports', label: 'Reports', icon: <FiPieChart size={20} /> },
];

const App: React.FC = () => {
  const [income] = useLocalStorage<number>('monthlyIncome', 0);
  const [transactionSources] = useLocalStorage<Array<{id: string; name: string}>>('transactionSources', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('budgetCategories', INITIAL_CATEGORIES);
  const [goals, setGoals] = useLocalStorage<Goal[]>('savingGoals', INITIAL_GOALS);
  const { addToast } = useToast();
  
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const expensesPerPage = 5;

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return categories.reduce((sum, category) => sum + (category.spent || 0), 0);
  }, [categories]);

  // Calculate total savings
  const totalSavings = useMemo(() => {
    return income - totalExpenses;
  }, [income, totalExpenses]);

  // Handle navigation
  const handleNavigation = (view: string) => {
    setActiveView(view);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  // Load expenses from categories on mount
  useEffect(() => {
    // Flatten all expenses from all categories
    const allExpenses = categories.flatMap(cat => 
      cat.expenses.map(expense => ({
        ...expense,
        categoryName: cat.name,
        sourceName: transactionSources.find(s => s.id === expense.sourceId)?.name || 'Unknown Source'
      }))
    );
    setExpenses(allExpenses);
  }, [categories, transactionSources]);

  // Handle adding a new expense
  const handleAddExpense = useCallback((expenseData: Omit<Expense, 'id' | 'date' | 'type'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      categoryName: categories.find(c => c.id === expenseData.categoryId)?.name || 'Uncategorized',
      sourceName: transactionSources.find(s => s.id === expenseData.sourceId)?.name || 'Unknown Source'
    };

    // Update category spent amount and add expense
    setCategories(prev => 
      prev.map(cat => 
        cat.id === expenseData.categoryId
          ? { 
              ...cat, 
              spent: (cat.spent || 0) + expenseData.amount,
              expenses: [...cat.expenses, newExpense]
            }
          : cat
      )
    );
    
    // Update expenses list
    setExpenses(prev => [newExpense, ...prev]);
    addToast({ message: 'Expense added successfully!', type: 'success' });
  }, [setCategories, addToast, categories, transactionSources]);

  // Handle category allocation change
  const handleAllocationChange = useCallback((categoryId: string, newAllocation: number) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, allocation: newAllocation, budget: income * (newAllocation / 100) }
          : cat
      )
    );
  }, [income, setCategories]);

  // Handle opening the category modal
  const handleOpenModal = useCallback((category: Category | null) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  }, []);

  // Handle auto-adjusting allocations
  const handleAutoAdjustAllocation = useCallback(() => {
    const activeCategories = categories.filter(cat => cat.isActive);
    if (activeCategories.length === 0) return;
    
    const equalAllocation = 100 / activeCategories.length;
    setCategories(prev => 
      prev.map(cat => 
        cat.isActive 
          ? { ...cat, allocation: equalAllocation, budget: income * (equalAllocation / 100) }
          : cat
      )
    );
    addToast({ message: 'Allocations equalized across active categories', type: 'success' });
  }, [categories, income, setCategories, addToast]);

  // Handle saving a category
  const handleSaveCategory = useCallback((categoryData: Omit<Category, 'id' | 'expenses'> & { id?: string }) => {
    if (editingCategory) {
      // Update existing category
      setCategories(prev => 
        prev.map(cat => 
          cat.id === editingCategory.id 
            ? { 
                ...cat, 
                ...categoryData, 
                expenses: cat.expenses,
                spent: cat.spent,
                budget: cat.budget || 0
              } 
            : cat
        )
      );
      addToast({ message: 'Category updated!', type: 'success' });
    } else {
      // Add new category
      const newCategory: Category = {
        ...categoryData,
        id: `cat-${Date.now()}`,
        expenses: [],
        spent: 0,
        budget: income * (categoryData.allocation / 100),
        isActive: true
      };
      setCategories(prev => [...prev, newCategory]);
      addToast({ message: 'Category added!', type: 'success' });
    }
    setCategoryModalOpen(false);
    setEditingCategory(null);
  }, [editingCategory, income, setCategories, addToast]);

  // Handle deleting a category
  const handleDeleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    addToast({ message: 'Category deleted.', type: 'info' });
  }, [setCategories, addToast]);

  // Handle adding a new goal
  const handleAddGoal = useCallback((goal: Omit<Goal, 'id' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
      currentAmount: 0,
    };
    setGoals(prev => [...prev, newGoal]);
    addToast({ message: 'Goal added!', type: 'success' });
  }, [setGoals, addToast]);

  // Handle deleting a goal
  const handleDeleteGoal = useCallback((goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    addToast({ message: 'Goal deleted.', type: 'info' });
  }, [setGoals, addToast]);

  // Handle importing data
  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Basic validation
        if (!importedData || typeof importedData !== 'object') {
          throw new Error('Invalid file format');
        }

        // Update state with imported data
        if (importedData.categories) setCategories(importedData.categories);
        if (importedData.goals) setGoals(importedData.goals);
        if (importedData.transactionSources) {
          // Update transaction sources if needed
        }
        
        addToast({ message: 'Data imported successfully!', type: 'success' });
      } catch (error) {
        console.error('Error importing data:', error);
        addToast({
          message: 'Failed to import data. Please check the file format.',
          type: 'error'
        });
      }
    };
    
    reader.onerror = () => {
      addToast({
        message: 'Error reading the file.',
        type: 'error'
      });
    };
    
    reader.readAsText(file);
    
    // Reset the input to allow importing the same file again
    event.target.value = '';
  }, [setCategories, setGoals, addToast]);

  // Handle exporting data
  const handleExportData = useCallback(() => {
    const data = {
      income,
      categories,
      goals,
      transactionSources,
      lastUpdated: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addToast({ message: 'Data exported successfully!', type: 'success' });
  }, [income, categories, goals, transactionSources, addToast]);

  // Render the active view
  const renderView = (): ReactNode => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            income={income}
            categories={categories}
            goals={goals}
            totalExpenses={totalExpenses}
            totalSavings={totalSavings}
          />
        );
      case 'expenses':
        // Sort and paginate expenses
        const sortedExpenses = [...expenses].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // Pagination for expenses
        const indexOfLastExpense = currentPage * expensesPerPage;
        const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
        // Only show the current page's expenses
        const currentExpenses = sortedExpenses.slice(indexOfFirstExpense, indexOfLastExpense);
        
        const totalPages = Math.ceil(expenses.length / expensesPerPage);

        return (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Add New Expense</h2>
              <ExpenseLogger
                categories={categories}
                onAddExpense={handleAddExpense}
                isAddDisabled={false}
                transactionSources={transactionSources}
              />
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  {showAllExpenses ? 'All Expenses' : 'Recent Expenses'}
                </h2>
                <div className="flex items-center gap-3">
                  {showAllExpenses && expenses.length > expensesPerPage && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                      >
                        <FiChevronLeft size={20} />
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                      >
                        <FiChevronRight size={20} />
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      setShowAllExpenses(!showAllExpenses);
                      setCurrentPage(1);
                    }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                  >
                    {showAllExpenses ? 'Show Less' : 'View All'}
                  </button>
                </div>
              </div>
              
              {currentExpenses.length > 0 ? (
                <div className="space-y-3">
                  {currentExpenses.map(expense => (
                    <div key={expense.id} className="p-3 sm:p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex justify-between items-start sm:items-center">
                        <div>
                          <p className="font-medium text-slate-800">{expense.description}</p>
                          <p className="text-xs sm:text-sm text-slate-500">
                            {expense.categoryName} • {expense.sourceName} • {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-semibold text-red-600 whitespace-nowrap ml-4">
                          -{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(expense.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No expenses found. Add one above!</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'categories':
        return (
          <CategoryManager
            categories={categories}
            onAllocationChange={handleAllocationChange}
            totalAllocation={categories.reduce((sum, cat) => sum + (cat.isActive ? cat.allocation : 0), 0)}
            onOpenModal={handleOpenModal}
            onDeleteCategory={handleDeleteCategory}
            onAutoAdjustAllocation={handleAutoAdjustAllocation}
          />
        );
      case 'goals':
        return (
          <GoalManager
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={(updatedGoal) => {
              setGoals(prev => 
                prev.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal)
              );
              addToast({ message: 'Goal updated!', type: 'success' });
            }}
            onDeleteGoal={handleDeleteGoal}
            availableFunds={0} // You should replace 0 with the actual available funds
          />
        );
      case 'reports':
        return (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Reports</h2>
            <p className="text-gray-500">Reports are coming soon!</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50 md:hidden px-4">
        <div className="h-full flex items-center justify-between">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <h1 className="text-xl font-bold text-primary-600">Finance Tracker</h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform 
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static transition-transform duration-200 ease-in-out`}
      >
        <div className="p-6 border-b border-gray-100 hidden md:block">
          <h1 className="text-2xl font-bold text-primary-600">Finance Tracker</h1>
        </div>
        <nav className="p-4 space-y-1">
          <button
            type="button"
            onClick={() => handleNavigation('dashboard')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-600 hover:bg-gray-50 mb-4"
          >
            <FiHome size={20} />
            <span>Home</span>
          </button>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeView === item.id 
                  ? 'bg-primary-50 text-primary-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pt-20 pb-20 px-4 md:pt-6 md:pb-6 md:px-6 transition-all duration-200 w-full overflow-auto">
        <div className="max-w-7xl mx-auto">
          {activeView !== 'dashboard' && (
            <button 
              onClick={() => handleNavigation('dashboard')}
              className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          )}
          <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl text-slate-800 font-semibold">
                {navItems.find(item => item.id === activeView)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {activeView === 'expenses' && (
                <button 
                  onClick={() => {}}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  + Add Expense
                </button>
              )}
              <div className="flex items-center gap-2">
                <label className="relative">
                  <span className="sr-only">Import Data</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    id="import-file"
                  />
                  <span className="cursor-pointer px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Import Data
                  </span>
                </label>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Export Data
                </button>
              </div>
            </div>
          </header>

          {/* View Content */}
          {renderView()}
        </div>
      </main>

      {/* Modals */}
      {isCategoryModalOpen && (
        <CategoryEditor
          categoryToEdit={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => setCategoryModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;