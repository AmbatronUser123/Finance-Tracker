import React, { useState, useMemo } from 'react';
import { Category } from '../types';
import { CalendarDaysIcon, EmptyStateIcon } from './icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


interface SummaryProps {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  totalAllocatedToGoals: number;
  categories: Category[];
}

export const Summary: React.FC<SummaryProps> = ({ totalBudget, totalSpent, totalRemaining, totalAllocatedToGoals, categories }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const formatCurrency = (value: number) => {
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };
  
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  const expensesForSelectedDate = useMemo(() => {
    const allExpenses = categories.flatMap(cat => 
      cat.expenses.map(exp => ({ ...exp, categoryName: cat.name }))
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


  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Monthly Overview</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600">Income</span>
            <span className="font-bold text-lg text-green-600">{formatCurrency(totalBudget)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600">Spent</span>
            <span className="font-bold text-lg text-red-600">{formatCurrency(totalSpent)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600">Saved to Goals</span>
            <span className="font-bold text-lg text-sky-500">{formatCurrency(totalAllocatedToGoals)}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 my-1">
              <div
                  className="bg-gradient-to-r from-indigo-500 to-sky-400 h-2 rounded-full"
                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              ></div>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
            <span className="text-slate-600 font-semibold">Remaining</span>
            <span className={`font-bold text-lg ${totalRemaining >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
              {formatCurrency(totalRemaining)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50">
        <h2 className="text-xl font-bold text-slate-800 mb-4">30-Day Spending Trend</h2>
        <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySpendingData} margin={{ top: 5, right: 20, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="currentColor" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="currentColor" tickFormatter={(value) => `${(value as number) / 1000}k`} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem',
                        color: '#334155',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Spent']}
                />
                <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3, fill: '#4f46e5' }} activeDot={{ r: 6, stroke: '#4f46e5', fill: '#fff', strokeWidth: 2 }} />
            </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50">
        <div className="flex items-center gap-3 mb-4">
            <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Daily History</h2>
        </div>
        <div>
            <label htmlFor="history-date" className="sr-only">Select a date</label>
            <input
                id="history-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
        </div>
        <div className="mt-4">
          {expensesForSelectedDate.length > 0 ? (
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {expensesForSelectedDate.map(exp => (
                <li key={exp.id} className="flex justify-between items-center text-sm text-slate-700 bg-slate-50 p-2 rounded-md">
                  <div>
                    <p className="font-medium truncate">{exp.description}</p>
                    <p className="text-xs text-slate-500">{exp.categoryName}</p>
                  </div>
                  <span className="font-semibold flex-shrink-0">{formatCurrency(exp.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4">
                <EmptyStateIcon className="mx-auto h-20 w-20" />
                <p className="mt-2 text-sm font-medium text-slate-500">No expenses on this day.</p>
                <p className="text-xs text-slate-400">Your records are squeaky clean!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};