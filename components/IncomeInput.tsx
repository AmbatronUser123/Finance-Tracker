import React from 'react';
import { PiggyBankIcon } from './icons';

interface IncomeInputProps {
  income: number;
  onIncomeChange: (newIncome: number) => void;
}

const IncomeInput: React.FC<IncomeInputProps> = ({ income, onIncomeChange }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50">
      <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4">
        <PiggyBankIcon className="w-7 h-7 text-indigo-500" />
        Your Monthly Income
      </h2>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-500">Rp</span>
        <input
          type="number"
          value={income}
          onChange={(e) => onIncomeChange(Number(e.target.value))}
          placeholder="e.g., 4000000"
          className="w-full pl-9 pr-4 py-2 font-medium text-slate-900 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
    </div>
  );
};

export default IncomeInput;