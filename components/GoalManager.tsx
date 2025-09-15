import React, { useState } from 'react';
import { Goal } from '../types';
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

    const formatCurrency = (value: number) => {
        return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4">
                <GoalIcon className="w-7 h-7 text-indigo-500" />
                Savings Goals
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-dashed border-slate-300 rounded-lg">
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <h3 className="font-bold text-lg text-slate-700">Create New Goal</h3>
                    <div>
                        <label htmlFor="goal-name" className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
                        <input
                            id="goal-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., New Laptop"
                            className="w-full p-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="goal-target" className="block text-sm font-medium text-slate-700 mb-1">Target Amount (Rp)</label>
                        <input
                            id="goal-target" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
                            placeholder="e.g., 15000000"
                            className="w-full p-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            required min="1"
                        />
                    </div>
                    <button type="submit" className="w-full px-4 py-2.5 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500">
                        Add Goal
                    </button>
                </form>

                <div className="space-y-4">
                    <div className="p-4 bg-sky-50 rounded-lg text-center">
                        <p className="text-sm font-medium text-sky-800">Available to Save</p>
                        <p className="text-xl font-bold text-sky-600">{formatCurrency(availableFunds)}</p>
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
                             <p className="text-sm text-center text-slate-400 py-8">No savings goals yet. Create one to get started!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalManager;