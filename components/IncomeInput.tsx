import React, { useState, useEffect } from 'react';
import { Category, Income, IncomeAllocation, TransactionSource } from '../types';
import { formatRupiah } from '../src/utils/currency';

interface IncomeInputProps {
  onAddIncome: (income: Omit<Income, 'id'>) => void;
  transactionSources: TransactionSource[];
  categories: Category[];
}

interface AssignRow {
  categoryId: string;
  amount: string;
}

const emptyRow = (): AssignRow => ({ categoryId: '', amount: '' });

const fieldClass =
  'w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none';

const IncomeInput: React.FC<IncomeInputProps> = ({ onAddIncome, transactionSources, categories }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [assignOn, setAssignOn] = useState(false);
  const [rows, setRows] = useState<AssignRow[]>([emptyRow()]);

  useEffect(() => {
    if (transactionSources.length > 0 && !sourceId) {
      setSourceId(transactionSources[0].id);
    }
  }, [transactionSources, sourceId]);

  const total = parseFloat(amount) || 0;
  const assignedSum = assignOn
    ? rows.reduce((sum, r) => sum + (r.categoryId ? (parseFloat(r.amount) || 0) : 0), 0)
    : 0;
  const left = total - assignedSum;
  const usedIds = new Set(rows.map(r => r.categoryId).filter(Boolean));

  const updateRow = (index: number, patch: Partial<AssignRow>) =>
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const removeRow = (index: number) =>
    setRows(prev => (prev.length === 1 ? [emptyRow()] : prev.filter((_, i) => i !== index)));
  const addRow = () => setRows(prev => [...prev, emptyRow()]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !sourceId) {
      alert('Please fill all fields');
      return;
    }

    let allocations: IncomeAllocation[] = [];
    if (assignOn) {
      if (rows.some(r => !r.categoryId && (parseFloat(r.amount) || 0) > 0)) {
        alert('Pick a category for each amount, or clear the amount.');
        return;
      }
      allocations = rows
        .filter(r => r.categoryId && (parseFloat(r.amount) || 0) > 0)
        .map(r => ({ categoryId: r.categoryId, amount: parseFloat(r.amount) }));
      if (assignedSum > total) {
        alert('The amounts assigned to categories add up to more than this income.');
        return;
      }
    }

    onAddIncome({
      description,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      sourceId,
      ...(allocations.length > 0 ? { allocations } : {}),
    });
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().slice(0,10));
    setAssignOn(false);
    setRows([emptyRow()]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Log Income</h3>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={fieldClass}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className={fieldClass}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className={fieldClass}
      />
      <select
        value={sourceId}
        onChange={(e) => setSourceId(e.target.value)}
        className={fieldClass}
      >
        <option value="" disabled>Select Source</option>
        {transactionSources.map(source => (
          <option key={source.id} value={source.id}>{source.name}</option>
        ))}
      </select>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={assignOn}
            onChange={(e) => setAssignOn(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Assign part of this income to specific categories
        </label>

        {assignOn && (
          <div className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-600 p-3">
            {rows.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={row.categoryId}
                  onChange={(e) => updateRow(index, { categoryId: e.target.value })}
                  className={`${fieldClass} flex-1 min-w-0`}
                >
                  <option value="">Select category</option>
                  {categories
                    .filter(c => c.id === row.categoryId || !usedIds.has(c.id))
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <input
                  type="number"
                  min="0"
                  placeholder="Amount"
                  value={row.amount}
                  onChange={(e) => updateRow(index, { amount: e.target.value })}
                  className={`${fieldClass} w-32`}
                />
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  aria-label="Remove this category"
                  className="p-2 text-slate-500 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addRow}
              disabled={usedIds.size >= categories.length}
              className="text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:underline disabled:opacity-40 disabled:no-underline"
            >
              + Add another category
            </button>

            <div className="text-sm space-y-0.5">
              <p className="text-slate-600 dark:text-slate-300">Assigned: {formatRupiah(assignedSum)}</p>
              {total <= 0 ? (
                <p className="text-slate-500 dark:text-slate-400">Enter the income amount above first.</p>
              ) : left >= 0 ? (
                <p className="text-slate-600 dark:text-slate-300">
                  Left for the usual percentage split: {formatRupiah(left)}
                </p>
              ) : (
                <p className="text-red-600 dark:text-red-300">
                  Over by {formatRupiah(-left)}: the assigned amounts are more than the income.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <button type="submit" className="w-full p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-green-500">
        Add Income
      </button>
    </form>
  );
};

export default IncomeInput;
