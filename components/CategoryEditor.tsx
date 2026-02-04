import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS, TAILWIND_COLORS } from '../constants';
import { XMarkIcon, CategoryIcon } from './icons';

interface CategoryEditorProps {
    onClose: () => void;
    onSave: (categoryData: Omit<Category, 'id' | 'expenses'> & { id?: string }) => void;
    categoryToEdit: Category | null;
}

const CategoryEditor: React.FC<CategoryEditorProps> = ({ onClose, onSave, categoryToEdit }) => {
    const [name, setName] = useState('');
    const [allocation, setAllocation] = useState(0);
    const [color, setColor] = useState('indigo');
    const [icon, setIcon] = useState('briefcase');
    const [error, setError] = useState<string | null>(null);
    // Ambil semua kategori dari localStorage
    const allCategories: Category[] = JSON.parse(localStorage.getItem('budgetCategories') || '[]');

    useEffect(() => {
        if (categoryToEdit) {
            setName(categoryToEdit.name);
            setAllocation(categoryToEdit.allocation);
            setColor(categoryToEdit.color);
            setIcon(categoryToEdit.icon);
        } else {
            setName('');
            setAllocation(0);
            setColor('indigo');
            setIcon('briefcase');
        }
    }, [categoryToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validasi nama unik
        const nameExists = allCategories.some(cat => cat.name.toLowerCase() === name.trim().toLowerCase() && cat.id !== categoryToEdit?.id);
        if (nameExists) {
            setError('Nama kategori sudah digunakan.');
            return;
        }
        if (allocation <= 0) {
            setError('Alokasi harus lebih dari 0%.');
            return;
        }
        setError(null);
        onSave({
            id: categoryToEdit?.id,
            name,
            allocation,
            color,
            icon,
        });
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            aria-labelledby="category-editor-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md m-4 transform transition-all border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 id="category-editor-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {categoryToEdit ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <div>
                        <label htmlFor="cat-name" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Category Name</label>
                        <input id="cat-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Groceries" className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="cat-allocation" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Allocation (%)</label>
                        <input id="cat-allocation" type="number" value={allocation} onChange={(e) => setAllocation(Number(e.target.value))} required min="0" placeholder="e.g., 10" className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Color</label>
                      <div className="grid grid-cols-8 gap-2">
                        {CATEGORY_COLORS.map(c => (
                            <button 
                                key={c} 
                                type="button" 
                                onClick={() => setColor(c)}
                                style={{ backgroundColor: TAILWIND_COLORS[c] || '#ccc' }}
                                className={`w-full h-8 rounded-full focus:outline-none ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ${color === c ? 'ring-indigo-500' : 'ring-transparent'}`}>
                            </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Icon</label>
                      <div className="grid grid-cols-8 gap-2">
                        {CATEGORY_ICONS.map(i => (
                            <button key={i} type="button" onClick={() => setIcon(i)} className={`p-2 rounded-lg border-2 ${icon === i ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/30' : 'border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700'}`}>
                                <CategoryIcon name={i} className="w-full h-full text-slate-600 dark:text-slate-200" />
                            </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-indigo-500">Save Category</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryEditor;
