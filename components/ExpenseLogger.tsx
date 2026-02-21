import React, { useState, useEffect, useCallback } from 'react';
import { Category, Expense, TransactionSource } from '../types';
import { ReceiptPlusIcon } from './icons';
import { parseRupiah, formatRupiah } from '@/src/utils/currency';

interface ExpenseLoggerProps {
  categories: Category[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  isAddDisabled: boolean;
  transactionSources: TransactionSource[];
}

const ExpenseLogger: React.FC<ExpenseLoggerProps> = ({ categories, onAddExpense, isAddDisabled, transactionSources }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sourceId, setSourceId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
        setCategoryId(categories[0].id);
    }
    if (transactionSources.length > 0 && !sourceId) {
      setSourceId(transactionSources[0].id);
    }
  }, [categories, categoryId, transactionSources, sourceId]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numValue = value ? parseInt(value, 10) : 0;
    setAmount(numValue.toString());
    setFormattedAmount(numValue > 0 ? formatRupiah(numValue) : '');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Deskripsi tidak boleh kosong.');
      return;
    }
    const amountValue = parseRupiah(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Nominal harus lebih dari 0.');
      return;
    }
    if (!sourceId) {
      setError('Sumber transaksi tidak boleh kosong.');
      return;
    }
    setError(null);
    onAddExpense({
      categoryId,
      description,
      amount: amountValue,
      date,
      sourceId,
    });
    setDescription('');
    setAmount('');
    setFormattedAmount('');
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30">
      <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-white mb-4">
        <ReceiptPlusIcon className="w-7 h-7 text-indigo-500" />
        Log New Expense
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            required
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Source</label>
          <select
            id="source"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            required
          >
            {transactionSources.map(source => (
              <option key={source.id} value={source.id}>{source.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Coffee with friend"
            className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            required
          />
        </div>
        <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Date</label>
            <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
            />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Amount</label>
          <input
            id="amount"
            type="text"
            value={formattedAmount}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isAddDisabled}
          className="w-full px-4 py-2.5 text-base font-semibold text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors duration-200 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isAddDisabled ? 'Fix Allocations First' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseLogger;