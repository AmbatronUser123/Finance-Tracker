import React, { useMemo } from 'react';
import { Category, Goal, TransactionSource } from '../types';
import { FiDollarSign, FiTrendingUp, FiPieChart, FiArrowRight } from 'react-icons/fi';
import { formatRupiah } from '@/src/utils/currency';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  income: number;
  categories: Category[];
  goals: Goal[];
  totalExpenses: number;
  totalSavings: number;
  sources: TransactionSource[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  income, 
  categories, 
  goals, 
  totalExpenses, 
  totalSavings,
  sources,
}) => {
  // Calculate category totals and percentages with type-safe fallbacks
  const categoryTotals = categories.map(category => {
    const spent = (category.spent ?? category.expenses.reduce((sum, exp) => sum + exp.amount, 0));
    const budget = (category.budget ?? (income * (category.allocation / 100)));
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    return {
      ...category,
      spent,
      budget,
      percentage,
    };
  });

  // Calculate goals progress
  const goalsProgress = goals.map(goal => ({
    ...goal,
    progress: (goal.currentAmount / goal.targetAmount) * 100,
  }));

  const navigate = useNavigate();

  // Per-source totals
  const { totalsBySource, countsBySource } = useMemo(() => {
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      cat.expenses.forEach(exp => {
        totals[exp.sourceId] = (totals[exp.sourceId] || 0) + exp.amount;
        counts[exp.sourceId] = (counts[exp.sourceId] || 0) + 1;
      });
    });
    return { totalsBySource: totals, countsBySource: counts };
  }, [categories]);

  // Get top 3 categories by spending (filter out categories with no spending)
  const topCategories = [...categoryTotals]
    .filter(cat => cat.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  const handleViewAll = (section: string) => {
    navigate(`/${section}`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-300">Monthly Income</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {formatRupiah(income)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-200">
              <FiDollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-300">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {formatRupiah(totalExpenses)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-200">
              <FiTrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Savings Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-300">Total Savings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {formatRupiah(totalSavings)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-200">
              <FiPieChart size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Categories Overview */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Categories</h3>
            <button 
              onClick={() => handleViewAll('categories')}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200 font-medium transition-colors"
            >
              View All <FiArrowRight className="ml-1" size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {topCategories.map((category) => (
              <div key={category.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{category.name}</span>
                  <span>{formatRupiah(category.spent)} dari {formatRupiah(category.budget)}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-primary-600" 
                    style={{ 
                      width: `${Math.min(category.percentage, 100)}%`,
                      backgroundColor: category.color || '#3b82f6'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Overview */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Saving Goals</h3>
            <button 
              onClick={() => handleViewAll('goals')}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200 font-medium transition-colors"
            >
              View All <FiArrowRight className="ml-1" size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {goalsProgress.slice(0, 3).map((goal) => (
              <div key={goal.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{goal.name}</span>
                  <span>{formatRupiah(goal.currentAmount)} dari {formatRupiah(goal.targetAmount)}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-green-500" 
                    style={{ 
                      width: `${Math.min(goal.progress, 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-300">Target: {formatRupiah(goal.targetAmount)}</p>
              </div>
            ))}
            {goals.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-slate-300 text-center py-4">
                No saving goals yet. Create one to get started!
              </p>
            )}
          </div>
        </div>

        {/* Sources Overview */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sources Breakdown</h3>
            <button 
              onClick={() => handleViewAll('sources')}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200 font-medium transition-colors"
            >
              Manage <FiArrowRight className="ml-1" size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {sources.map(src => {
              const total = totalsBySource[src.id] || 0;
              const count = countsBySource[src.id] || 0;
              return (
                <div key={src.id} className="flex justify-between text-sm">
                  <span className="font-medium">{src.name}</span>
                  <span>{formatRupiah(total)} • {count} tx</span>
                </div>
              );
            })}
            {sources.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-slate-300 text-center py-4">No sources yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <button 
            onClick={() => handleViewAll('expenses')}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200 font-medium transition-colors"
          >
            View All <FiArrowRight className="ml-1" size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {
                (() => {
                  const recent = categories
                    .flatMap(cat => (cat.expenses || []).map(exp => ({
                      ...exp,
                      categoryName: cat.name,
                    })))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5);
                  if (recent.length === 0) {
                    return (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-300">No recent transactions</td>
                      </tr>
                    );
                  }
                  return recent.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-3 whitespace-nowrap">{new Date(item.date).toLocaleDateString('en-CA')}</td>
                      <td className="px-6 py-3">{item.description}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{item.categoryName}</td>
                      <td className="px-6 py-3 text-right font-medium">{formatRupiah(item.amount)}</td>
                    </tr>
                  ));
                })()
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
