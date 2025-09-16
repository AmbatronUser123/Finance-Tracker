import React, { useState, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import { Category, Goal, Expense } from './types';
import { INITIAL_CATEGORIES } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './contexts/ToastContext';
import { 
  FiHome, 
  FiPieChart, 
  FiDollarSign, 
  FiTag, 
  FiTarget, 
  FiX, 
  FiMenu
} from 'react-icons/fi';

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
  const currentView = location.pathname.replace('/', '') || 'dashboard';
  const [income] = useLocalStorage<number>('monthlyIncome', 0);
  const [categories, setCategories] = useLocalStorage<CategoryWithBudget[]>('categories', INITIAL_CATEGORIES as CategoryWithBudget[]);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithBudget | null>(null);

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
          />
        );
      case 'expenses':
        return (
          <ExpenseLogger
            categories={categories}
            onAddExpense={handleAddExpense}
            isAddDisabled={false}
            transactionSources={[]}
          />
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
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg"
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-gray-800">Finance Tracker</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="text-sm text-gray-500">
              <p>Total Income: ${income.toFixed(2)}</p>
              <p>Total Expenses: ${totalExpenses.toFixed(2)}</p>
              <p className="font-medium">Balance: ${totalSavings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              {navItems.find(item => item.id === currentView)?.label || 'Dashboard'}
            </h1>
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