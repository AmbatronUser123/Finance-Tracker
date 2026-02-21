import React from 'react';
import { Goal, TransactionSource, Expense } from '../types';
import Dashboard from './Dashboard';
import ExpenseLogger from './ExpenseLogger';
import CategoryManager from './CategoryManager';
import GoalManager from './GoalManager';
import { CategoryWithBudget } from '../App';

interface MobileContentProps {
    mobileView: string;
    income: number;
    totalExpenses: number;
    totalSavings: number;
    categories: CategoryWithBudget[];
    goals: Goal[];
    sources: TransactionSource[];
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    onAllocationChange: (categoryId: string, newAllocation: number) => void;
    onOpenModal: (category: CategoryWithBudget | null) => void;
    onDeleteCategory: (categoryId: string) => void;
    onAutoAdjustAllocation: () => void;
    onViewCategory: (category: CategoryWithBudget) => void;
    onUpdateGoal: (goal: Goal) => void;
    onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
    onDeleteGoal: (goalId: string) => void;
}

const MobileContent: React.FC<MobileContentProps> = ({
    mobileView,
    income,
    totalExpenses,
    totalSavings,
    categories,
    goals,
    sources,
    onAddExpense,
    onAllocationChange,
    onOpenModal,
    onDeleteCategory,
    onAutoAdjustAllocation,
    onViewCategory,
    onUpdateGoal,
    onAddGoal,
    onDeleteGoal,
}) => {
    if (mobileView === 'dashboard') {
        return (
            <Dashboard 
                income={income}
                totalExpenses={totalExpenses}
                totalSavings={totalSavings}
                categories={categories}
                goals={goals}
                sources={sources}
            />
        );
    }

    if (mobileView === 'log') {
        return (
            <ExpenseLogger
                categories={categories}
                onAddExpense={onAddExpense}
                isAddDisabled={false}
                transactionSources={sources}
            />
        );
    }

    if (mobileView === 'budgets') {
        return (
            <CategoryManager
                categories={categories}
                onAllocationChange={onAllocationChange}
                totalAllocation={categories.reduce((sum, cat) => sum + cat.allocation, 0)}
                onOpenModal={onOpenModal}
                onDeleteCategory={onDeleteCategory}
                onAutoAdjustAllocation={onAutoAdjustAllocation}
                onViewCategory={onViewCategory}
            />
        );
    }

    if (mobileView === 'goals') {
        return (
            <GoalManager
                goals={goals}
                onAddGoal={onAddGoal}
                onUpdateGoal={onUpdateGoal}
                onDeleteGoal={onDeleteGoal}
                availableFunds={totalSavings}
            />
        );
    }

    return null;
};

export default MobileContent;