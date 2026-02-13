import React, { useMemo, useRef, useCallback } from 'react';
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

interface CategoryItemProps {
  category: CategoryWithBudget;
  onView: (category: CategoryWithBudget) => void;
  onAllocationChange: (categoryId: string, newAllocation: number) => void;
  onEdit: (category: CategoryWithBudget) => void;
  onDelete: (categoryId: string) => void;
}

const CategoryItem = React.memo(({ category, onView, onAllocationChange, onEdit, onDelete }: CategoryItemProps) => {
  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/40">
      <div className="flex-grow">
          <button onClick={() => onView(category)} className="text-left w-full">
            <span className="text-slate-700 dark:text-slate-100 truncate text-sm font-medium cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-300">{category.name}</span>
          </button>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-300 mb-1">
              <span>{`Rp${(category.spent || 0).toLocaleString()}`}</span>
              <span>{`Max Rp${(category.planned || 0).toLocaleString()}`}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${category.planned > 0 ? Math.min((category.spent / category.planned) * 100, 100) : 0}%` }}
              ></div>
            </div>
            <div className="mt-1 text-[11px] leading-tight text-slate-500 dark:text-slate-300">
              {`Max berasal dari ${category.allocation}% alokasi kategori terhadap income bulanan`}
            </div>
          </div>
          <div className="relative w-full mt-1">
            <input
              id={`alloc-${category.id}`}
              type="number"
              value={category.allocation}
              onChange={(e) => onAllocationChange(category.id, Number(e.target.value))}
              className="w-full pr-7 pl-2 py-1 text-right font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500 dark:text-slate-300">%</span>
          </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-1.5 flex-shrink-0">
          <button onClick={() => onEdit(category)} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md shadow-sm border border-slate-200 dark:border-slate-600">
              <PencilIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(category.id)} className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md shadow-sm border border-slate-200 dark:border-slate-600">
              <TrashIcon className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
});

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

  const renderPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (!percent) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="currentColor"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Refs for stable handlers to prevent re-renders when parent passes new functions
  const onViewCategoryRef = useRef(onViewCategory);
  const onAllocationChangeRef = useRef(onAllocationChange);
  const onOpenModalRef = useRef(onOpenModal);
  const onDeleteCategoryRef = useRef(onDeleteCategory);

  // Update refs on render
  onViewCategoryRef.current = onViewCategory;
  onAllocationChangeRef.current = onAllocationChange;
  onOpenModalRef.current = onOpenModal;
  onDeleteCategoryRef.current = onDeleteCategory;

  const handleView = useCallback((cat: CategoryWithBudget) => onViewCategoryRef.current(cat), []);
  const handleAllocChange = useCallback((id: string, val: number) => onAllocationChangeRef.current(id, val), []);
  const handleEdit = useCallback((cat: CategoryWithBudget) => onOpenModalRef.current(cat), []);
  const handleDelete = useCallback((id: string) => onDeleteCategoryRef.current(id), []);

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
        <div className="w-full md:w-1/2 text-slate-600 dark:text-slate-300">
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
                    label={renderPieLabel} 
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
                        backgroundColor: 'var(--chart-tooltip-bg)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid var(--chart-tooltip-border)',
                        borderRadius: '0.75rem',
                        color: 'var(--chart-tooltip-text)',
                      }}
                    labelStyle={{ color: 'var(--chart-tooltip-muted)' }}
                    itemStyle={{ color: 'var(--chart-tooltip-text)' }}
                    cursor={{ fill: 'var(--chart-tooltip-cursor)' }}
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
              <CategoryItem
                key={cat.id}
                category={cat}
                onView={handleView}
                onAllocationChange={handleAllocChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
         </div>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold text-lg">
              <span className="text-slate-900 dark:text-slate-100">Total Allocation: </span>
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
