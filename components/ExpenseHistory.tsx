import React, { useMemo, useState } from 'react';
import { Category, TransactionSource } from '../types';
import { formatRupiah } from '@/src/utils/currency';

interface ExpenseHistoryProps {
  categories: Category[];
  sources: TransactionSource[];
  onDeleteExpense: (expenseId: string) => void;
  onEditExpense?: (expense: any) => void;
}

const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({ categories, sources, onDeleteExpense, onEditExpense }) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc');
  const [monthFilter, setMonthFilter] = useState<string>('all'); // '01'..'12' or 'all'
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editSourceId, setEditSourceId] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');

  const sourceMap = useMemo(() => Object.fromEntries(sources.map(s => [s.id, s.name])), [sources]);
  const categoryMap = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c.name])), [categories]);

  const allExpenses = useMemo(() => {
    return categories.flatMap(cat =>
      (cat.expenses || []).map(exp => ({
        ...exp,
        categoryName: categoryMap[exp.categoryId] || 'Unknown',
        sourceName: sourceMap[exp.sourceId] || 'Unknown',
      }))
    );
  }, [categories, categoryMap, sourceMap]);

  const yearsAvailable = useMemo(() => {
    const set = new Set<string>();
    categories.forEach(cat => cat.expenses.forEach(exp => {
      const y = new Date(exp.date).getFullYear();
      if (!isNaN(y)) set.add(String(y));
    }));
    return Array.from(set).sort((a,b)=> Number(b)-Number(a));
  }, [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = allExpenses.filter(exp => {
      if (categoryFilter !== 'all' && exp.categoryId !== categoryFilter) return false;
      if (sourceFilter !== 'all' && exp.sourceId !== sourceFilter) return false;
      const d = new Date(exp.date);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = String(d.getFullYear());
      if (monthFilter !== 'all' && mm !== monthFilter) return false;
      if (yearFilter !== 'all' && yy !== yearFilter) return false;
      if (q && !(`${exp.description}`.toLowerCase().includes(q) || `${exp.categoryName}`.toLowerCase().includes(q) || `${exp.sourceName}`.toLowerCase().includes(q))) return false;
      return true;
    });
    return arr.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return dateSort === 'desc' ? db - da : da - db;
    });
  }, [allExpenses, query, categoryFilter, sourceFilter, monthFilter, yearFilter, dateSort]);

  const beginEdit = (exp: any) => {
    setEditingId(exp.id);
    setEditDesc(exp.description);
    setEditAmount(String(exp.amount));
    setEditCategoryId(exp.categoryId);
    setEditSourceId(exp.sourceId);
    setEditDate(new Date(exp.date).toISOString().slice(0,10));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDesc('');
    setEditAmount('');
    setEditCategoryId('');
    setEditSourceId('');
    setEditDate('');
  };

  const saveEdit = (exp: any) => {
    if (!onEditExpense) return;
    const amt = Number(editAmount);
    if (!(amt > 0)) return;
    onEditExpense({
      ...exp,
      description: editDesc,
      amount: amt,
      categoryId: editCategoryId,
      sourceId: editSourceId,
      date: new Date(editDate).toISOString(),
    });
    cancelEdit();
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Expense History</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search description/category/source"
          className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="all">All Sources</option>
          {sources.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="all">All Months</option>
          <option value="01">Jan</option>
          <option value="02">Feb</option>
          <option value="03">Mar</option>
          <option value="04">Apr</option>
          <option value="05">May</option>
          <option value="06">Jun</option>
          <option value="07">Jul</option>
          <option value="08">Aug</option>
          <option value="09">Sep</option>
          <option value="10">Oct</option>
          <option value="11">Nov</option>
          <option value="12">Dec</option>
        </select>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="all">All Years</option>
          {yearsAvailable.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={dateSort}
          onChange={(e) => setDateSort(e.target.value as 'desc' | 'asc')}
          className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Category</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Source</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Amount</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-slate-500 dark:text-slate-300" colSpan={6}>No expenses found.</td>
              </tr>
            )}
            {filtered.map(exp => {
              const isEditing = editingId === exp.id;
              return (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {isEditing ? (
                      <input type="date" value={editDate} onChange={(e)=>setEditDate(e.target.value)} className="p-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded" />
                    ) : (
                      new Date(exp.date).toLocaleDateString('en-CA')
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                    {isEditing ? (
                      <input value={editDesc} onChange={(e)=>setEditDesc(e.target.value)} className="w-full p-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded" />
                    ) : (
                      exp.description
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {isEditing ? (
                      <select value={editCategoryId} onChange={(e)=>setEditCategoryId(e.target.value)} className="p-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded">
                        {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      </select>
                    ) : (
                      exp.categoryName
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {isEditing ? (
                      <select value={editSourceId} onChange={(e)=>setEditSourceId(e.target.value)} className="p-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded">
                        {sources.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                      </select>
                    ) : (
                      exp.sourceName
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap">
                    {isEditing ? (
                      <input type="number" value={editAmount} onChange={(e)=>setEditAmount(e.target.value)} className="w-28 p-1 text-right bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded" />
                    ) : (
                      formatRupiah(exp.amount)
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={()=>saveEdit(exp)} className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded">Save</button>
                        <button onClick={cancelEdit} className="px-3 py-1.5 text-sm bg-slate-400 hover:bg-slate-500 text-white rounded">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        {onEditExpense && (
                          <button onClick={()=>beginEdit(exp)} className="px-3 py-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded">Edit</button>
                        )}
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseHistory;
