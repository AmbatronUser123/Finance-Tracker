import React, { useState } from 'react';
import { TransactionSource } from '../types';
import { formatRupiah } from '../src/utils/currency';

interface SourceManagerProps {
  sources: TransactionSource[];
  onAddSource: (name: string) => void;
  onDeleteSource: (id: string) => void;
  onEditSource: (id: string, name: string) => void;
  totalsBySource?: Record<string, number>;
  usedCountBySource?: Record<string, number>;
}

const SourceManager: React.FC<SourceManagerProps> = ({ sources, onAddSource, onDeleteSource, onEditSource, totalsBySource = {}, usedCountBySource = {} }) => {
  const [newSourceName, setNewSourceName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddSource = () => {
    if (newSourceName.trim() !== '') {
      onAddSource(newSourceName.trim());
      setNewSourceName('');
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      onEditSource(editingId, editingName.trim());
      cancelEdit();
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-slate-900/30">
      <h3 className="text-xl font-bold mb-4">Manage Transaction Sources</h3>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newSourceName}
          onChange={(e) => setNewSourceName(e.target.value)}
          placeholder="e.g., BCA, GoPay"
          className="flex-grow p-2 border rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600"
        />
        <button onClick={handleAddSource} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add Source
        </button>
      </div>
      <ul>
        {sources.map(source => {
          const total = totalsBySource[source.id] || 0;
          const usedCount = usedCountBySource[source.id] || 0;
          const isDisabled = usedCount > 0;
          return (
            <li key={source.id} className="flex justify-between items-center p-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col flex-1 mr-4">
                {editingId === source.id ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-grow p-2 border rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600"
                    />
                    <button onClick={saveEdit} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                    <button onClick={cancelEdit} className="px-3 py-1 bg-slate-400 text-white rounded hover:bg-slate-500">Cancel</button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">{source.name}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Total: {formatRupiah(total)} • {usedCount} tx</span>
                  </>
                )}
              </div>
              {editingId !== source.id && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(source.id, source.name)}
                    className="px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => !isDisabled && onDeleteSource(source.id)}
                    disabled={isDisabled}
                    className={`px-2 py-1 rounded text-white ${isDisabled ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    Remove
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SourceManager;