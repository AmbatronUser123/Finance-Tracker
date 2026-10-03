import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { CategoryWithBudget, MonthlyArchive, Income } from '../types';
import { formatRupiah } from '../src/utils/currency';

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Extracted Reports view into its own component to use Hooks safely
const ReportsView: React.FC<{
  categories: CategoryWithBudget[];
  monthlyArchives: MonthlyArchive[];
  incomes: Income[];
}> = ({ categories, monthlyArchives, incomes }) => {
  const currentAllExpenses = categories.flatMap(c => c.expenses.map(e => ({ ...e, categoryName: c.name })));
  const archiveMonths = monthlyArchives.map(a => a.month);
  const uniqueMonths = Array.from(new Set([
    ...currentAllExpenses.map(e => e.date?.slice(0, 7)).filter(Boolean) as string[],
    ...archiveMonths,
  ])).sort();
  
  const currentMonth = getCurrentMonth();
  
  // Default to current month or last available
  const initialMonth = uniqueMonths.includes(currentMonth) ? currentMonth : (uniqueMonths[uniqueMonths.length - 1] || currentMonth);
  
  const [startMonth, setStartMonth] = React.useState(initialMonth);
  const [endMonth, setEndMonth] = React.useState(initialMonth);

  // Ensure uniqueMonths is populated for dropdowns
  const monthOptions = uniqueMonths.length ? uniqueMonths : [currentMonth];

  // Helper to get months in range
  const getMonthsInRange = (start: string, end: string) => {
    if (start > end) return [start];
    return monthOptions.filter(m => m >= start && m <= end);
  };

  const selectedMonths = getMonthsInRange(startMonth, endMonth);

  // Aggregate Data
  const aggregatedData = React.useMemo(() => {
    let totalIncome = 0;
    const incomeList: Income[] = [];
    const categoryTotals: Record<string, { name: string; total: number; monthly: Record<string, number> }> = {};

    selectedMonths.forEach(month => {
      // Determine source of data for this month
      let monthIncomes: Income[] = [];
      let monthCategories: CategoryWithBudget[] = [];

      // Check archive first
      const archive = monthlyArchives.find(a => a.month === month);
      if (archive) {
        monthIncomes = archive.incomes || [];
        // If income is just a number in archive and no list, we might miss details. 
        // But older archives might only have 'income' number.
        // If incomes array is empty but income number > 0, we can't show details but can add to total.
        if (monthIncomes.length === 0 && archive.income > 0) {
           totalIncome += archive.income;
        }
        monthCategories = archive.categories as CategoryWithBudget[];
      } else {
        // It's the current/active data (assuming it matches the month)
        // We need to filter current data by month
        monthIncomes = incomes.filter(i => i.date?.startsWith(month));
        monthCategories = categories; // We'll filter expenses inside
      }

      // Add incomes
      monthIncomes.forEach(i => {
        incomeList.push(i);
        totalIncome += (i.amount || 0);
      });

      // Process Categories
      monthCategories.forEach(cat => {
        const catId = (cat as any).id; // Archive categories might not match current IDs exactly if deleted, but name should be consistent? 
        // Better to group by Name if IDs might change or be re-generated, but ID is safer if persistent.
        // Let's use ID but fallback to name grouping if needed. For now, ID.
        
        if (!categoryTotals[catId]) {
          categoryTotals[catId] = { name: (cat as any).name, total: 0, monthly: {} };
        }

        const monthExpenses = cat.expenses.filter(e => e.date?.startsWith(month));
        const monthSum = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

        categoryTotals[catId].total += monthSum;
        categoryTotals[catId].monthly[month] = (categoryTotals[catId].monthly[month] || 0) + monthSum;
      });
    });

    return {
      totalIncome,
      incomeList: incomeList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      categories: Object.values(categoryTotals).filter(c => c.total > 0).sort((a, b) => b.total - a.total)
    };
  }, [selectedMonths, monthlyArchives, categories, incomes]);

  const exportReport = (format: 'pdf' | 'csv') => {
    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(`Finance Report (${startMonth} to ${endMonth})`, 20, 10);
      
      // Income
      doc.text(`Total Income: ${formatRupiah(aggregatedData.totalIncome)}`, 20, 20);
      
      // Spending
      const head = [['Category', 'Total', ...selectedMonths]];
      const body = aggregatedData.categories.map(c => [
        c.name,
        formatRupiah(c.total),
        ...selectedMonths.map(m => formatRupiah(c.monthly[m] || 0))
      ]);
      
      (doc as any).autoTable({ head, body, startY: 30 });
      doc.save(`report-${startMonth}-${endMonth}.pdf`);
    } else {
      const header = ['Category', 'Total', ...selectedMonths];
      const data = aggregatedData.categories.map(c => {
        const row: any = { Category: c.name, Total: c.total };
        selectedMonths.forEach(m => row[m] = c.monthly[m] || 0);
        return row;
      });
      const csv = Papa.unparse({ fields: header, data: data.map(d => header.map(h => d[h])) });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `report-${startMonth}-${endMonth}.csv`);
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
            value={startMonth}
            onChange={(e) => {
              setStartMonth(e.target.value);
              if (e.target.value > endMonth) setEndMonth(e.target.value);
            }}
            className="p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
          >
            {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-700 dark:text-slate-300">To:</label>
          <select
            value={endMonth}
            onChange={(e) => {
              if (e.target.value < startMonth) return;
              setEndMonth(e.target.value);
            }}
            className="p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
          >
            {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
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
                   {selectedMonths.map(month => (
                     <div key={month} className="p-2 border border-slate-100 dark:border-slate-700 rounded">
                       <div className="text-xs text-slate-500">{month}</div>
                       <div className="font-medium">{formatRupiah(cat.monthly[month] || 0)}</div>
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
