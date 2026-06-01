import React, { useState } from 'react';

interface ArchiveModalProps {
  onConfirm: (options: { 
    name: string; 
    startDate: string; 
    endDate: string; 
    resetExpenses: boolean; 
    newIncome?: number | null 
  }) => void;
  onCancel: () => void;
  currentIncome: number;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({ 
  onConfirm, 
  onCancel, 
  currentIncome 
}) => {
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(
    new Date().getFullYear(), 
    new Date().getMonth(), 
    1
  ).toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [resetExpenses, setResetExpenses] = useState(true);
  const [updateIncome, setUpdateIncome] = useState(false);
  const [newIncome, setNewIncome] = useState<number | ''>('');

  const handleConfirm = () => {
    onConfirm({ 
      name: name || `Report ${today}`, 
      startDate, 
      endDate, 
      resetExpenses, 
      newIncome: updateIncome ? Number(newIncome) : null 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 shadow-xl">
        <div className="border-b border-slate-200 dark:border-slate-700 p-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Archive Report</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Create a new archived report with custom date range.
          </p>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Report Name
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600"
              placeholder="e.g., Mid-Month Report"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Start Date
              </label>
              <input
                type="date"
                className="w-full p-2 border rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-100">
                End Date
              </label>
              <input
                type="date"
                className="w-full p-2 border rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <details className="bg-slate-50 dark:bg-slate-700/40 rounded-md p-3">
            <summary className="cursor-pointer font-medium text-slate-800 dark:text-slate-100">Additional Options</summary>
            <div className="mt-3 space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={resetExpenses}
                  onChange={(e) => setResetExpenses(e.target.checked)}
                />
                <span className="text-slate-800 dark:text-slate-100">Reset all expenses after archiving</span>
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={updateIncome}
                    onChange={(e) => setUpdateIncome(e.target.checked)}
                  />
                  <span className="text-slate-800 dark:text-slate-100">Update monthly income</span>
                </label>
                {updateIncome && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="flex-grow p-2 border rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600"
                      placeholder={`Current: ${currentIncome}`}
                      value={newIncome}
                      onChange={(e) => setNewIncome(e.target.value === '' ? '' : Number(e.target.value))}
                      min={0}
                      step={1000}
                    />
                  </div>
                )}
              </div>
            </div>
          </details>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700 p-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Archive Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;
