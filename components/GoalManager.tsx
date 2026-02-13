import React, { useState } from 'react';
import { Goal } from '../types';
import { formatRupiah } from '../src/utils/currency';
import { GoalIcon } from './icons';
import GoalCard from './GoalCard';

interface GoalManagerProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  onUpdateGoal: (updatedGoal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  availableFunds: number;
}

const GoalManager: React.FC<GoalManagerProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, availableFunds }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [error, setError] = useState<string | null>(null);
    // Ambil semua goals dari props
    const allGoals = goals;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validasi nama unik
        const nameExists = allGoals.some(goal => goal.name.toLowerCase() === name.trim().toLowerCase());
        if (nameExists) {
            setError('Nama goal sudah digunakan.');
            return;
        }
        if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
            setError('Target harus lebih dari 0.');
            return;
        }
        setError(null);
        onAddGoal({
            name,
            targetAmount: Number(targetAmount),
        });
        setName('');
        setTargetAmount('');
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                <GoalIcon className="w-7 h-7 text-indigo-500" />
                Savings Goals
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Create New Goal</h3>
                    <div>
                        <label htmlFor="goal-name" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Goal Name</label>
                        <input
                            id="goal-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., New Laptop"
                            className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="goal-target" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Target Amount (Rp)</label>
                        <input
                            id="goal-target" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
                            placeholder="e.g., 15000000"
                            className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            required min="1"
                        />
                    </div>
                    <button type="submit" className="w-full px-4 py-2.5 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-indigo-500">
                        Add Goal
                    </button>
                </form>

                <div className="space-y-4">
                    <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-center border border-transparent dark:border-sky-500/20">
                        <p className="text-sm font-medium text-sky-800 dark:text-sky-200">Available to Save</p>
                        <p className="text-xl font-bold text-sky-600 dark:text-sky-200">{formatRupiah(availableFunds)}</p>
                    </div>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                        {goals.length > 0 ? goals.map(goal => (
                            <GoalCard 
                                key={goal.id} 
                                goal={goal} 
                                onAllocateToGoal={(amount) => onUpdateGoal({
                                    ...goal,
                                    currentAmount: (goal.currentAmount || 0) + amount
                                })}
                                onDeleteGoal={() => onDeleteGoal(goal.id)}
                                availableFunds={availableFunds}
                            />
                        )) : (
                             <p className="text-sm text-center text-slate-500 dark:text-slate-300 py-8">No savings goals yet. Create one to get started!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalManager;
