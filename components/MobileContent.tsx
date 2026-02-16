import React from 'react';
import { Goal, Income, TransactionSource, Expense } from '../types';
import { Summary } from './Summary';
import Dashboard from './Dashboard';
import ExpenseLogger from './ExpenseLogger';
import IncomeInput from './IncomeInput';
import CategoryManager from './CategoryManager';
import GoalManager from './GoalManager';
import { CategoryWithBudget } from '../App';

interface MobileContentProps {
    mobileView: string;
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    totalAllocatedToGoals: number;
    categories: CategoryWithBudget[];
    income: number;
    onDeleteExpense: (categoryId: string, expenseId: string) => void;
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    isBudgetValid: boolean;
    onAddIncome: (income: Omit<Income, 'id'>) => void;
    transactionSources: TransactionSource[];
    onAllocationChange: (categoryId: string, newAllocation: number) => void;
    totalAllocation: number;
    onOpenModal: (category: CategoryWithBudget | null) => void;
    onDeleteCategory: (categoryId: string) => void;
    onAutoAdjustAllocation: () => void;
    goals: Goal[];
    onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
    onUpdateGoal: (updatedGoal: Goal) => void;
    onDeleteGoal: (goalId: string) => void;
    availableToSave: number;
    onViewCategory: (category: CategoryWithBudget) => void;
}

const MobileContent: React.FC<MobileContentProps> = ({
    mobileView,
    totalBudget,
    totalSpent,
    totalRemaining,
    totalAllocatedToGoals,
    categories,
    income,
    onDeleteExpense,
    onAddExpense,
    isBudgetValid,
    onAddIncome,
    transactionSources,
    onAllocationChange,
    totalAllocation,
    onOpenModal,
    onDeleteCategory,
    onAutoAdjustAllocation,
    goals,
    onAddGoal,
    onUpdateGoal,
    onDeleteGoal,
    availableToSave,
    onViewCategory,
}) => {
    if (mobileView === 'dashboard') {
        return (
            <>
                <Summary
                    totalBudget={totalBudget}
                    totalSpent={totalSpent}
                    totalRemaining={totalRemaining}
                    totalAllocatedToGoals={totalAllocatedToGoals}
                    categories={categories}
                    onDeleteExpense={onDeleteExpense}
                />
                <Dashboard 
                  income={income} 
                  categories={categories}
                  goals={goals}
                  totalExpenses={totalSpent}
                  totalSavings={totalRemaining}
                  sources={transactionSources}
                  onDeleteExpense={onDeleteExpense}
                />
            </>
        );
    }

    if (mobileView === 'log') {
        return (
            <ExpenseLogger
                categories={categories}
                onAddExpense={onAddExpense}
                isAddDisabled={!isBudgetValid}
                transactionSources={transactionSources}
            />
        );
    }

    if (mobileView === 'budgets') {
        return (
            <>
                <IncomeInput 
                    onAddIncome={onAddIncome} 
                    transactionSources={transactionSources} 
                />
                {/* Category management */}
                <CategoryManager
                  categories={categories}
                  onAllocationChange={onAllocationChange}
                  totalAllocation={totalAllocation}
                  onOpenModal={onOpenModal}
                  onDeleteCategory={onDeleteCategory}
                  onAutoAdjustAllocation={onAutoAdjustAllocation}
                  onViewCategory={onViewCategory}
                />
            </>
        );
    }

    if (mobileView === 'goals') {
        return (
            <GoalManager
                goals={goals}
                onAddGoal={onAddGoal}
                onUpdateGoal={onUpdateGoal}
                onDeleteGoal={onDeleteGoal}
                availableFunds={availableToSave}
            />
        );
    }

    return null;
};

export default MobileContent;
