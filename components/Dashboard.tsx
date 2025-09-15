import React from 'react';
import { Category, Goal } from '../types';
import { FiDollarSign, FiTrendingUp, FiPieChart } from 'react-icons/fi';

interface DashboardProps {
  income: number;
  categories: Category[];
  goals: Goal[];
  totalExpenses: number;
  totalSavings: number;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  income, 
  categories, 
  goals, 
  totalExpenses, 
  totalSavings 
}) => {
  // Calculate category totals and percentages
  const categoryTotals = categories.map(category => ({
    ...category,
    percentage: category.budget > 0 ? (category.spent / category.budget) * 100 : 0,
    // Calculate spent from expenses if not set
    spent: category.spent || category.expenses.reduce((sum, exp) => sum + exp.amount, 0),
    // Set budget based on allocation if not set
    budget: category.budget || (income * (category.allocation / 100))
  }));

  // Calculate goals progress
  const goalsProgress = goals.map(goal => ({
    ...goal,
    progress: (goal.currentAmount / goal.targetAmount) * 100,
  }));

  // Get top 3 categories by spending (filter out categories with no spending)
  const topCategories = [...categoryTotals]
    .filter(cat => cat.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Income</p>
              <p className="text-2xl font-bold text-gray-900">
                ${income.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <FiDollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-50 text-red-600">
              <FiTrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Savings Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Savings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalSavings.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <FiPieChart size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Overview */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Categories</h3>
            <span className="text-sm text-primary-600 font-medium">
              View All
            </span>
          </div>
          <div className="space-y-4">
            {topCategories.map((category) => (
              <div key={category.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{category.name}</span>
                  <span>${category.spent} / ${category.budget}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
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
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Saving Goals</h3>
            <span className="text-sm text-primary-600 font-medium">
              View All
            </span>
          </div>
          <div className="space-y-4">
            {goalsProgress.slice(0, 3).map((goal) => (
              <div key={goal.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{goal.name}</span>
                  <span>${goal.currentAmount} / ${goal.targetAmount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-green-500" 
                    style={{ 
                      width: `${Math.min(goal.progress, 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
            {goals.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No saving goals yet. Create one to get started!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <span className="text-sm text-primary-600 font-medium">
            View All
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No recent transactions
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;