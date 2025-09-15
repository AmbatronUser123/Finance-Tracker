import React, { useState, useMemo, useCallback, ReactNode } from 'react';
import { Category, Goal, Expense } from './types';
import { INITIAL_CATEGORIES, INITIAL_GOALS } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './contexts/ToastContext';
import { FiHome, FiPieChart, FiDollarSign, FiTag, FiTarget, FiSettings } from 'react-icons/fi';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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

  // Toggle sidebar on desktop
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  // Handle adding a new expense
  const handleAddExpense = useCallback((expenseData: Omit<Expense, 'id' | 'date' | 'type'>) => {
    // Update category spent amount
    setCategories(prev => 
      prev.map(cat => 
        cat.id === expenseData.categoryId
          ? { ...cat, spent: (cat.spent || 0) + expenseData.amount }
          : cat
      )
    );
    
    addToast({ message: 'Expense added successfully!', type: 'success' });
  }, [setCategories, addToast]);

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
        return (
          <ExpenseLogger
            categories={categories}
            onAddExpense={handleAddExpense}
            isAddDisabled={false}
            transactionSources={transactionSources}
          />
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
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 md:hidden"
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

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform 
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static transition-transform duration-200 ease-in-out`}
      >
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-primary-600">Finance Tracker</h1>
        </div>
        <nav className="p-4 space-y-1">
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
        
        {/* Sidebar Toggle */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button 
            onClick={toggleSidebar}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <FiSettings size={20} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pt-16 pb-20 px-4 md:py-6 md:px-6 transition-all duration-200 w-full">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl text-slate-800 tracking-tight">
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
              <button
                onClick={handleExportData}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Export Data
              </button>
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