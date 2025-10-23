import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryWithBudget } from '../App';
import { ChartPieIcon, PlusIcon, PencilIcon, TrashIcon } from './icons';
import { TAILWIND_COLORS } from '../constants';
// Toast notifications are handled by the parent component

interface CategoryManagerProps {
  categories: CategoryWithBudget[];
  onAllocationChange: (categoryId: string, newAllocation: number) => void;
  totalAllocation: number;
  onOpenModal: (category: CategoryWithBudget | null) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAutoAdjustAllocation: () => void;
  onViewCategory: (category: CategoryWithBudget) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, 
  onAllocationChange, 
  totalAllocation, 
  onOpenModal, 
  onDeleteCategory, 
  onAutoAdjustAllocation,
  onViewCategory
}) => {
  // Using the onAutoAdjustAllocation prop from parent
  const isInvalid = totalAllocation !== 100;

  const chartData = useMemo(() => {
    return categories
      .filter(cat => cat.allocation > 0)
      .map(cat => ({ name: cat.name, value: cat.allocation, color: cat.color }));
  }, [categories]);

  // Auto adjust allocation is handled by the parent component

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30">
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-100">
          <ChartPieIcon className="w-7 h-7 text-indigo-500" />
          Category Allocations
        </h2>
        <button 
          onClick={() => onOpenModal(null)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-indigo-500"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Add Category</span>
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Chart Container */}
        <div className="w-full md:w-1/2">
         <div style={{ width: '100%', minHeight: '300px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={chartData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    fill="#8884d8" 
                    label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''} 
                    labelLine={false} 
                    fontSize={12}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TAILWIND_COLORS[entry.color] || TAILWIND_COLORS.slate} className="focus:outline-none"/>
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name]} 
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem',
                        color: '#334155',
                      }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                    <p>Add a category to get started.</p>
                </div>
            )}
         </div>
        </div>
        
        {/* Categories List */}
        <div className="w-full md:w-1/2 space-y-3 max-h-96 overflow-y-auto pr-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50">
                <div className="flex-grow">
                    <button onClick={() => onViewCategory(cat)} className="text-left w-full">
                      <span className="text-slate-600 truncate text-sm font-medium cursor-pointer hover:text-indigo-600">{cat.name}</span>
                    </button>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{`Rp${(cat.spent || 0).toLocaleString()}`}</span>
                        <span>{`Max Rp${(cat.planned || 0).toLocaleString()}`}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${cat.planned > 0 ? Math.min((cat.spent / cat.planned) * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-[11px] leading-tight text-slate-500">
                        {`Max berasal dari ${cat.allocation}% alokasi kategori terhadap income bulanan`}
                      </div>
                    </div>
                    <div className="relative w-full mt-1">
                      <input
                        id={`alloc-${cat.id}`}
                        type="number"
                        value={cat.allocation}
                        onChange={(e) => onAllocationChange(cat.id, Number(e.target.value))}
                        className="w-full pr-7 pl-2 py-1 text-right font-medium text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500">%</span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-1.5 flex-shrink-0">
                    <button onClick={() => onOpenModal(cat)} className="p-2 text-slate-500 hover:text-indigo-600 bg-white hover:bg-slate-100 rounded-md shadow-sm border border-slate-200">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteCategory(cat.id)} className="p-2 text-slate-500 hover:text-red-600 bg-white hover:bg-slate-100 rounded-md shadow-sm border border-slate-200">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
         </div>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold text-lg">
              <span className="text-slate-800">Total Allocation: </span>
              <span className={isInvalid ? 'text-red-500' : 'text-green-600'}>
                {totalAllocation}%
              </span>
            </div>
            {isInvalid && (
              <p className="text-sm text-red-500 mt-1">
                Total allocation must be exactly 100%
              </p>
            )}
          </div>
          <button
            onClick={onAutoAdjustAllocation}
            disabled={categories.length === 0}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isInvalid 
                ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            } ${
              categories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isInvalid ? 'Perbaiki Otomatis' : 'Equalize Allocations'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;