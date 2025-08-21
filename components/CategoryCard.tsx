import React, { useMemo, useState, useEffect } from 'react';
import { Category } from '../types';
import ProgressBar from './ProgressBar';
import { fetchSpendingTip } from '../services/geminiService';
import { InfoIcon, SparklesIcon, TrashIcon } from './icons';

interface CategoryCardProps {
  category: Category;
  income: number;
  onClearExpenses: (categoryId: string) => void;
  onDeleteExpense: (categoryId: string, expenseId: string) => void;
}

const colorMap: { [key: string]: { border: string; text: string; progress: string } } = {
  indigo: { border: 'border-indigo-500', text: 'text-indigo-600', progress: 'bg-indigo-500' },
  sky: { border: 'border-sky-500', text: 'text-sky-600', progress: 'bg-sky-500' },
  rose: { border: 'border-rose-500', text: 'text-rose-600', progress: 'bg-rose-500' },
  amber: { border: 'border-amber-500', text: 'text-amber-600', progress: 'bg-amber-500' },
  emerald: { border: 'border-emerald-500', text: 'text-emerald-600', progress: 'bg-emerald-500' },
  violet: { border: 'border-violet-500', text: 'text-violet-600', progress: 'bg-violet-500' },
  lime: { border: 'border-lime-500', text: 'text-lime-600', progress: 'bg-lime-500' },
  cyan: { border: 'border-cyan-500', text: 'text-cyan-600', progress: 'bg-cyan-500' },
  slate: { border: 'border-slate-500', text: 'text-slate-600', progress: 'bg-slate-500' },
};
const defaultColor = colorMap.slate;

const CategoryCard: React.FC<CategoryCardProps> = ({ category, income, onClearExpenses, onDeleteExpense }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tip, setTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<{ categoryId: string; expenseId: string; description: string } | null>(null);

  const { border, text, progress: progressColor } = colorMap[category.color] || defaultColor;

  const { budget, spent, remaining, spentPercentage } = useMemo(() => {
    const calculatedBudget = (income * category.allocation) / 100;
    const calculatedSpent = category.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const calculatedRemaining = calculatedBudget - calculatedSpent;
    const calculatedSpentPercentage = calculatedBudget > 0 ? (calculatedSpent / calculatedBudget) * 100 : 0;
    return {
      budget: calculatedBudget,
      spent: calculatedSpent,
      remaining: calculatedRemaining,
      spentPercentage: calculatedSpentPercentage,
    };
  }, [category, income]);

  useEffect(() => {
    const fetchTipIfNeeded = async () => {
      if (spentPercentage >= 85 && !tip && !isLoadingTip) {
        setIsLoadingTip(true);
        try {
          const fetchedTip = await fetchSpendingTip(category.name, budget, spent);
          setTip(fetchedTip);
        } catch (error) {
          console.error("Failed to fetch spending tip:", error);
          setTip("Could not fetch a tip right now. Please try again later.");
        } finally {
          setIsLoadingTip(false);
        }
      }
    };

    fetchTipIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spentPercentage, category.name, budget, spent]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handleDeleteExpenseClick = (categoryId: string, expenseId: string, description: string) => {
    setExpenseToDelete({ categoryId, expenseId, description });
  };

  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      onDeleteExpense(expenseToDelete.categoryId, expenseToDelete.expenseId);
      setExpenseToDelete(null);
    }
  };

  const cancelDeleteExpense = () => {
    setExpenseToDelete(null);
  };

  return (
    <div className={`p-6 rounded-2xl shadow-lg flex flex-col justify-between bg-white shadow-slate-200/50 border-t-4 ${border}`}>
      <div>
        <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-slate-800">{category.name} ({category.allocation}%)</h3>
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-400 hover:text-slate-600">
                <InfoIcon className="w-6 h-6"/>
            </button>
        </div>
        <p className={`text-sm mb-4 font-medium ${text}`}>Budget: {formatCurrency(budget)}</p>
        
        <ProgressBar percentage={spentPercentage} colorClass={progressColor} />

        <div className="flex justify-between text-sm mt-2 text-slate-600 font-medium">
          <span>Spent: {formatCurrency(spent)}</span>
          <span className={remaining < 0 ? 'font-bold text-red-600' : ''}>
            Remaining: {formatCurrency(remaining)}
          </span>
        </div>
        
        {tip && (
          <div className={`mt-4 p-3 border-l-4 rounded-r-lg ${
            tip.includes('API Key is not configured') || tip.includes('Could not fetch a tip')
              ? 'bg-red-50 border-red-400'
              : 'bg-sky-50 border-sky-300'
          }`}>
              <div className="flex items-start">
                  <SparklesIcon className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
                    tip.includes('API Key is not configured') || tip.includes('Could not fetch a tip')
                      ? 'text-red-500'
                      : 'text-sky-500'
                  }`} />
                  <div>
                    <p className={`text-sm font-semibold ${
                      tip.includes('API Key is not configured') || tip.includes('Could not fetch a tip')
                        ? 'text-red-800'
                        : 'text-sky-800'
                    }`}>
                      {tip.includes('API Key is not configured') || tip.includes('Could not fetch a tip') ? 'AI Error' : 'Spending Tip'}
                    </p>
                    <p className={`text-sm ${
                      tip.includes('API Key is not configured') || tip.includes('Could not fetch a tip')
                        ? 'text-red-700'
                        : 'text-sky-700'
                    }`}>
                      {isLoadingTip ? 'Getting a fresh tip for you...' : tip}
                    </p>
                  </div>
              </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-slate-700">Expense History</h4>
            {category.expenses.length > 0 && (
                <button onClick={() => onClearExpenses(category.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold">
                    <TrashIcon className="w-3 h-3"/> Clear
                </button>
            )}
          </div>
          {category.expenses.length > 0 ? (
            <ul className="space-y-1 max-h-32 overflow-y-auto pr-2">
              {category.expenses.slice().reverse().map(exp => (
                <li key={exp.id} className="flex justify-between items-center text-sm text-slate-600 bg-white/50 p-1.5 rounded group">
                  <span className="truncate pr-2">{exp.description}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(exp.amount)}</span>
                    <button 
                      onClick={() => handleDeleteExpenseClick(category.id, exp.id, exp.description)}
                      className="text-red-400 hover:text-red-600 transition-opacity"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-center text-slate-400 py-4">No expenses logged in this category yet.</p>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Confirm Deletion</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete the expense "<strong>{expenseToDelete.description}</strong>"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeleteExpense}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExpense}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCard;