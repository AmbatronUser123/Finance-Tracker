import React from 'react';
import { Category } from '../types';
import CategoryCard from './CategoryCard';
import { LayoutGridIcon } from './icons';

interface DashboardProps {
  income: number;
  categories: Category[];
  onClearExpenses: (categoryId: string) => void;
  onDeleteExpense: (categoryId: string, expenseId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ income, categories, onClearExpenses, onDeleteExpense }) => {
  return (
    <div className="space-y-6">
       <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800">
         <LayoutGridIcon className="w-7 h-7 text-indigo-500" />
         Your Monthly Dashboard
        </h2>
      <div className="md:columns-2 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="break-inside-avoid mb-6">
            <CategoryCard 
              category={category} 
              income={income}
              onClearExpenses={onClearExpenses}
              onDeleteExpense={onDeleteExpense}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;