import React, { useMemo, useState } from 'react';
import { Income, TransactionSource } from '../types';
import { formatRupiah } from '@/src/utils/currency';

interface IncomeHistoryProps {
  incomes: Income[];
  sources: TransactionSource[];
  onEditIncome: (income: Income) => void;
  onDeleteIncome: (id: string) => void;
}

const IncomeHistory: React.FC<IncomeHistoryProps> = ({ incomes, sources, onEditIncome, onDeleteIncome }) => {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editSourceId, setEditSourceId] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');

  const sourceMap = useMemo(() => Object.fromEntries(sources.map(s => [s.id, s.name])), [sources]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = incomes.filter(i => {
      if (sourceFilter !== 'all' && i.sourceId !== sourceFilter) return false;
      if (q && !(`${i.description}`.toLowerCase().includes(q) || `${sourceMap[i.sourceId] || ''}`.toLowerCase().includes(q))) return false;
      return true;
    });
    return arr.sort((a,b) => {
      return dateSort === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
    });
  }, [incomes, query, sourceFilter, dateSort, sourceMap]);

  const beginEdit = (inc: Income) => {
    setEditingId(inc.id);
    setEditDesc(inc.description);
    setEditAmount(String(inc.amount));
    setEditSourceId(inc.sourceId);
    setEditDate(new Date(inc.date).toISOString().slice(0,10));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDesc('');
    setEditAmount('');
    setEditSourceId('');
    setEditDate('');
  };

  const saveEdit = (inc: Income) => {
    const amt = Number(editAmount);
    if (!(amt > 0)) return;
    onEditIncome({ ...inc, description: editDesc, amount: amt, sourceId: editSourceId, date: new Date(editDate).toISOString() });
    cancelEdit();
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Income History</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search description/source"
          className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="all">All Sources</option>
          {sources.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
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
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Source</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Amount</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-slate-500 dark:text-slate-300" colSpan={5}>No income found.</td>
              </tr>
            )}
            {filtered.map(inc => {
              const isEditing = editingId === inc.id;
              return (
                <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {isEditing ? (
                      <input type="date" value={editDate} onChange={(e)=>setEditDate(e.target.value)} className="p-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded" />
                    ) : (
                      new Date(inc.date).toLocaleDateString('en-CA')
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                    {isEditing ? (
                      <input value={editDesc} onChange={(e)=>setEditDesc(e.target.value)} className="w-full p-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded" />
                    ) : (
                      inc.description
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {isEditing ? (
                      <select value={editSourceId} onChange={(e)=>setEditSourceId(e.target.value)} className="p-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded">
                        {sources.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                      </select>
                    ) : (
                      sourceMap[inc.sourceId] || 'Unknown'
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap">
                    {isEditing ? (
                      <input type="number" value={editAmount} onChange={(e)=>setEditAmount(e.target.value)} className="w-28 p-1 text-right bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded" />
                    ) : (
                      formatRupiah(inc.amount)
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={()=>saveEdit(inc)} className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded">Save</button>
                        <button onClick={cancelEdit} className="px-3 py-1.5 text-sm bg-slate-400 hover:bg-slate-500 text-white rounded">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={()=>beginEdit(inc)} className="px-3 py-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded">Edit</button>
                        <button onClick={()=>onDeleteIncome(inc.id)} className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded">Delete</button>
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

export default IncomeHistory;


