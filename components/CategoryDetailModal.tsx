import React from 'react';
import { FiX } from 'react-icons/fi';
import { CategoryWithBudget } from '../App';

interface CategoryDetailModalProps {
  category: CategoryWithBudget | null;
  onClose: () => void;
}

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ category, onClose }) => {
  if (!category) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{category.name} Expenses</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {category.expenses.length > 0 ? (
            <ul className="space-y-3">
              {category.expenses.map(expense => (
                <li key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold text-red-500">-${expense.amount.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No expenses recorded for this category yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailModal;
