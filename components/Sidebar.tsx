import React from 'react';
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
import { formatRupiah } from '../src/utils/currency';

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
  { id: 'expenses', label: 'Expenses', icon: <FiDollarSign size={20} /> },
  { id: 'income', label: 'Income', icon: <FiDollarSign size={20} /> },
  { id: 'sources', label: 'Sources', icon: <FiCreditCard size={20} /> },
  { id: 'categories', label: 'Categories', icon: <FiTag size={20} /> },
  { id: 'goals', label: 'Goals', icon: <FiTarget size={20} /> },
  { id: 'reports', label: 'Reports', icon: <FiPieChart size={20} /> },
  { id: 'data', label: 'Data', icon: <FiDatabase size={20} /> },
];

interface SidebarProps {
  currentView: string;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onNavigate: (view: string) => void;
  effectiveIncome: number;
  totalExpenses: number;
  totalSavings: number;
  totalSourceBalance: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  mobileMenuOpen,
  onToggleMobileMenu,
  onNavigate,
  effectiveIncome,
  totalExpenses,
  totalSavings,
  totalSourceBalance,
}) => {
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggleMobileMenu}
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
                onClick={() => onNavigate(item.id)}
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
    </>
  );
};

export default Sidebar;
