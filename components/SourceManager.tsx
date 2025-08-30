import React, { useState } from 'react';
import { TransactionSource } from '../types';

interface SourceManagerProps {
  sources: TransactionSource[];
  onAddSource: (name: string) => void;
  onDeleteSource: (id: string) => void;
}

const SourceManager: React.FC<SourceManagerProps> = ({ sources, onAddSource, onDeleteSource }) => {
  const [newSourceName, setNewSourceName] = useState('');

  const handleAddSource = () => {
    if (newSourceName.trim() !== '') {
      onAddSource(newSourceName.trim());
      setNewSourceName('');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Manage Transaction Sources</h3>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newSourceName}
          onChange={(e) => setNewSourceName(e.target.value)}
          placeholder="e.g., BCA, GoPay"
          className="flex-grow p-2 border rounded"
        />
        <button onClick={handleAddSource} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add Source
        </button>
      </div>
      <ul>
        {sources.map(source => (
          <li key={source.id} className="flex justify-between items-center p-2 border-b">
            <span>{source.name}</span>
            <button onClick={() => onDeleteSource(source.id)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SourceManager;