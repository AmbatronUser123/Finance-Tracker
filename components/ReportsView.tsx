import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { CategoryWithBudget, MonthlyArchive, Income } from '../types';
import { formatRupiah } from '../src/utils/currency';
import { formatCycleRange } from '../src/utils/payCycle';

// A report "period" is one finished pay cycle (or an old calendar-month archive), plus the current cycle.
interface Period {
  key: string;     // sorts from oldest to newest
  label: string;   // what you see in the dropdowns and exports
  archive?: MonthlyArchive;
}

// Extracted Reports view into its own component to use Hooks safely
const ReportsView: React.FC<{
  categories: CategoryWithBudget[];
  monthlyArchives: MonthlyArchive[];
  incomes: Income[];
  currentCycle: { start: string; end: string } | null;
}> = ({ categories, monthlyArchives, incomes, currentCycle }) => {
  const periods: Period[] = React.useMemo(() => {
    const archived: Period[] = monthlyArchives.map(a => ({
      key: a.month,
      label: a.cycleStart && a.cycleEnd ? formatCycleRange(a.cycleStart, a.cycleEnd, true) : a.month,
      archive: a,
    }));
    const current: Period = {
      key: currentCycle ? currentCycle.start : '9999-current',
      label: currentCycle ? `${formatCycleRange(currentCycle.start, currentCycle.end, true)} (current)` : 'Current period',
    };
    return [...archived.filter(p => p.key !== current.key), current].sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  }, [monthlyArchives, currentCycle]);

  // Start on the current cycle
  const lastKey = periods[periods.length - 1].key;
  const [startKey, setStartKey] = React.useState(lastKey);
  const [endKey, setEndKey] = React.useState(lastKey);

  const selectedPeriods = periods.filter(p => p.key >= startKey && p.key <= endKey);
  const labelOf = (key: string) => periods.find(p => p.key === key)?.label ?? key;

  // Aggregate Data
  const aggregatedData = React.useMemo(() => {
    let totalIncome = 0;
    const incomeList: Income[] = [];
    const categoryTotals: Record<string, { name: string; total: number; byPeriod: Record<string, number> }> = {};

    selectedPeriods.forEach(period => {
      const archive = period.archive;
      const isOldMonthlyArchive = !!archive && !archive.cycleStart;
      const periodIncomes: Income[] = archive ? (archive.incomes || []) : incomes;
      const periodCategories = (archive ? archive.categories : categories) as CategoryWithBudget[];

      // Very old archives may only have a total income number and no list of incomes.
      if (isOldMonthlyArchive && archive && periodIncomes.length === 0 && archive.income > 0) {
        totalIncome += archive.income;
      }
      periodIncomes.forEach(i => {
        incomeList.push(i);
        totalIncome += (i.amount || 0);
      });

      periodCategories.forEach(cat => {
        if (!categoryTotals[cat.id]) {
          categoryTotals[cat.id] = { name: cat.name, total: 0, byPeriod: {} };
        }
        // Old monthly archives could hold stray dates, so they are still filtered by month.
        // A pay-cycle archive (and the current cycle) already holds exactly one cycle.
        const periodExpenses = isOldMonthlyArchive ? cat.expenses.filter(e => e.date?.startsWith(period.key)) : cat.expenses;
        const periodSum = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

        categoryTotals[cat.id].total += periodSum;
        categoryTotals[cat.id].byPeriod[period.key] = (categoryTotals[cat.id].byPeriod[period.key] || 0) + periodSum;
      });
    });

    return {
      totalIncome,
      incomeList: incomeList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      categories: Object.values(categoryTotals).filter(c => c.total > 0).sort((a, b) => b.total - a.total)
    };
  }, [selectedPeriods, categories, incomes]);

  const exportReport = (format: 'pdf' | 'csv') => {
    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(`Finance Report (${labelOf(startKey)} to ${labelOf(endKey)})`, 20, 10);
      
      // Income
      doc.text(`Total Income: ${formatRupiah(aggregatedData.totalIncome)}`, 20, 20);
      
      // Spending
      const head = [['Category', 'Total', ...selectedPeriods.map(p => p.label)]];
      const body = aggregatedData.categories.map(c => [
        c.name,
        formatRupiah(c.total),
        ...selectedPeriods.map(p => formatRupiah(c.byPeriod[p.key] || 0))
      ]);
      
      (doc as any).autoTable({ head, body, startY: 30 });
      doc.save('finance-report.pdf');
    } else {
      const header = ['Category', 'Total', ...selectedPeriods.map(p => p.label)];
      const data = aggregatedData.categories.map(c => {
        const row: any = { Category: c.name, Total: c.total };
        selectedPeriods.forEach(p => row[p.label] = c.byPeriod[p.key] || 0);
        return row;
      });
      const csv = Papa.unparse({ fields: header, data: data.map(d => header.map(h => d[h])) });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'finance-report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Reports</h2>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-700 dark:text-slate-300">From:</label>
          <select
            value={startKey}
            onChange={(e) => {
              setStartKey(e.target.value);
              if (e.target.value > endKey) setEndKey(e.target.value);
            }}
            className="p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
          >
            {periods.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-700 dark:text-slate-300">To:</label>
          <select
            value={endKey}
            onChange={(e) => {
              if (e.target.value < startKey) return;
              setEndKey(e.target.value);
            }}
            className="p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
          >
            {periods.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        
        <div className="ml-auto flex gap-2">
          <button onClick={() => exportReport('pdf')} className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">PDF</button>
          <button onClick={() => exportReport('csv')} className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm">CSV</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-sm text-slate-500">Total Income</div>
          <div className="text-xl font-bold">{formatRupiah(aggregatedData.totalIncome)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-sm text-slate-500">Total Spending</div>
          <div className="text-xl font-bold">{formatRupiah(aggregatedData.categories.reduce((a, b) => a + b.total, 0))}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-sm text-slate-500">Net Savings</div>
          <div className="text-xl font-bold">{formatRupiah(aggregatedData.totalIncome - aggregatedData.categories.reduce((a, b) => a + b.total, 0))}</div>
        </div>
      </div>

      {/* Income Details */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
        <h3 className="font-semibold mb-4">Income History</h3>
        {aggregatedData.incomeList.length > 0 ? (
          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                <tr>
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-right py-2 px-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedData.incomeList.map((inc, idx) => (
                  <tr key={inc.id || idx} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="py-2 px-3">{inc.date?.split('T')[0]}</td>
                    <td className="py-2 px-3">{inc.description}</td>
                    <td className="py-2 px-3 text-right">{formatRupiah(inc.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No income records found for this period.</p>
        )}
      </div>

      {/* Expense Categories */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Spending by Category</h3>
        {aggregatedData.categories.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center text-slate-500">
            No spending data for this period.
          </div>
        ) : (
          aggregatedData.categories.map((cat, idx) => (
            <details key={idx} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 group">
              <summary className="cursor-pointer flex items-center justify-between list-none">
                <div className="flex items-center gap-2">
                   <span className={`transform transition-transform group-open:rotate-90`}>▶</span>
                   <span className="font-semibold">{cat.name}</span>
                </div>
                <span className="font-bold">{formatRupiah(cat.total)}</span>
              </summary>
              <div className="mt-4 pl-6">
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                   {selectedPeriods.map(period => (
                     <div key={period.key} className="p-2 border border-slate-100 dark:border-slate-700 rounded">
                       <div className="text-xs text-slate-500">{period.label}</div>
                       <div className="font-medium">{formatRupiah(cat.byPeriod[period.key] || 0)}</div>
                     </div>
                   ))}
                 </div>
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportsView;
