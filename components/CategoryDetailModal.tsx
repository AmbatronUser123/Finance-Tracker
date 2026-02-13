import React from 'react';
import { FiX } from 'react-icons/fi';
import { Category } from '../types';

interface CategoryDetailModalProps {
  category: Category | null;
  onClose: () => void;
}

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ category, onClose }) => {
  if (!category) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{category.name} Expenses</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100">
            <FiX size={24} />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {category.expenses.length > 0 ? (
            <ul className="space-y-3">
              {category.expenses.map(expense => (
                <li key={expense.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{expense.description}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold text-red-500">-${expense.amount.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 dark:text-slate-300 text-center py-8">No expenses recorded for this category yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailModal;
