import React, { useState } from 'react';
import { Goal } from '../types';
import { TrashIcon } from './icons';
import ProgressBar from './ProgressBar';
import { useToast } from '../contexts/ToastContext';
import { formatRupiah } from '../src/utils/currency';

interface GoalCardProps {
  goal: Goal;
  onAllocateToGoal: (amount: number) => void;
  onDeleteGoal: () => void;
  availableFunds: number;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onAllocateToGoal, onDeleteGoal, availableFunds }) => {
  const [amount, setAmount] = useState('');
  const { addToast } = useToast();

  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (numAmount > availableFunds) {
      addToast({ message: "Amount exceeds available funds to save.", type: 'error'});
      return;
    }
    if (numAmount > 0) {
      onAllocateToGoal(numAmount);
      setAmount('');
    } else {
      addToast({ message: "Please enter a positive amount to save.", type: 'error'});
    }
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-lg border border-transparent dark:border-slate-600">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100">{goal.name}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Saved {formatRupiah(goal.currentAmount)} of {formatRupiah(goal.targetAmount)}
          </p>
        </div>
        <button onClick={onDeleteGoal} className="text-slate-400 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-300">
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      <ProgressBar percentage={progress} colorClass="bg-sky-500" />
      <form onSubmit={handleAllocate} className="mt-3 flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (Rp)"
          className="w-full text-sm p-1.5 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <button type="submit" className="px-3 py-1 text-sm font-semibold text-white bg-sky-500 rounded-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 focus:ring-sky-500">
          Save
        </button>
      </form>
    </div>
  );
};

export default GoalCard;
