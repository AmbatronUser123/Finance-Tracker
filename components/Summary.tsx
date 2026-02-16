import React, { useState, useMemo } from 'react';
import { Category } from '../types';
import { CalendarDaysIcon, EmptyStateIcon, TrashIcon } from './icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


interface SummaryProps {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  totalAllocatedToGoals: number;
  categories: Category[];
  onDeleteExpense?: (categoryId: string, expenseId: string) => void;
}

export const Summary: React.FC<SummaryProps> = ({ totalBudget, totalSpent, totalRemaining, totalAllocatedToGoals, categories, onDeleteExpense }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [expenseToDelete, setExpenseToDelete] = useState<{ categoryId: string; expenseId: string; description: string } | null>(null);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };
  
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  const expensesForSelectedDate = useMemo(() => {
    const allExpenses = categories.flatMap(cat => 
      cat.expenses.map(exp => ({ ...exp, categoryName: cat.name, categoryId: cat.id }))
    );
    
    return allExpenses
      .filter(exp => exp.date.slice(0, 10) === selectedDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [categories, selectedDate]);
  
    const dailySpendingData = useMemo(() => {
    const allExpenses = categories.flatMap(cat => cat.expenses);
    const spendingByDate: { [date: string]: number } = {};
    allExpenses.forEach(exp => {
        const date = exp.date.slice(0, 10);
        spendingByDate[date] = (spendingByDate[date] || 0) + exp.amount;
    });

    const data = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().slice(0, 10);
        data.push({
            date: dateString.slice(5).replace('-', '/'), // "MM/DD"
            amount: spendingByDate[dateString] || 0,
        });
    }
    return data;
  }, [categories]);

  const handleDeleteClick = (categoryId: string, expenseId: string, description: string) => {
    setExpenseToDelete({ categoryId, expenseId, description });
  };

  const confirmDelete = () => {
    if (expenseToDelete && onDeleteExpense) {
      onDeleteExpense(expenseToDelete.categoryId, expenseToDelete.expenseId);
      setExpenseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setExpenseToDelete(null);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Monthly Overview</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600 dark:text-slate-300">Income</span>
            <span className="font-bold text-lg text-green-600">{formatCurrency(totalBudget)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600 dark:text-slate-300">Spent</span>
            <span className="font-bold text-lg text-red-600">{formatCurrency(totalSpent)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600 dark:text-slate-300">Saved to Goals</span>
            <span className="font-bold text-lg text-sky-500">{formatCurrency(totalAllocatedToGoals)}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 my-1">
              <div
                  className="bg-gradient-to-r from-indigo-500 to-sky-400 h-2 rounded-full"
                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              ></div>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-300 font-semibold">Remaining</span>
            <span className={`font-bold text-lg ${totalRemaining >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-red-600'}`}>
              {formatCurrency(totalRemaining)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">30-Day Spending Trend</h2>
        <div className="text-slate-600 dark:text-slate-300" style={{ width: '100%', height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySpendingData} margin={{ top: 5, right: 20, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="currentColor" />
                <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    stroke="currentColor"
                    tickFormatter={(value: number) => `${value / 1000}k`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--chart-tooltip-bg)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid var(--chart-tooltip-border)',
                        borderRadius: '0.75rem',
                        color: 'var(--chart-tooltip-text)',
                    }}
                    labelStyle={{ color: 'var(--chart-tooltip-muted)' }}
                    itemStyle={{ color: 'var(--chart-tooltip-text)' }}
                    cursor={{ fill: 'var(--chart-tooltip-cursor)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Spent']}
                />
                <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3, fill: '#4f46e5' }} activeDot={{ r: 6, stroke: '#4f46e5', fill: '#fff', strokeWidth: 2 }} />
            </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30">
        <div className="flex items-center gap-3 mb-4">
            <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Daily History</h2>
        </div>
        <div>
            <label htmlFor="history-date" className="sr-only">Select a date</label>
            <input
                id="history-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
        </div>
        <div className="mt-4">
          {expensesForSelectedDate.length > 0 ? (
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {expensesForSelectedDate.map(exp => (
                <li key={exp.id} className="flex justify-between items-center text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/40 p-2 rounded-md">
                  <div>
                    <p className="font-medium truncate">{exp.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">{exp.categoryName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold flex-shrink-0">{formatCurrency(exp.amount)}</span>
                    {onDeleteExpense && (
                      <button 
                        onClick={() => handleDeleteClick(exp.categoryId, exp.id, exp.description)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4">
                <EmptyStateIcon className="mx-auto h-20 w-20" />
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-300">No expenses on this day.</p>
                <p className="text-xs text-slate-400 dark:text-slate-400">Your records are squeaky clean!</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Confirm Deletion</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Are you sure you want to delete the expense "<strong>{expenseToDelete.description}</strong>"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
