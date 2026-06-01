import React, { useState } from 'react';
import { TransactionSource, TransferHistory } from '../types';
import { formatRupiah } from '@/src/utils/currency';

interface SourceManagerProps {
  sources: TransactionSource[];
  onAddSource: (name: string, balance: number) => void;
  onDeleteSource: (id: string) => void;
  onEditSource: (id: string, name: string, balance: number) => void;
  onTransfer?: (fromId: string, toId: string, amount: number) => void;
  totalsBySource?: Record<string, number>;
  usedCountBySource?: Record<string, number>;
  transferHistory?: TransferHistory[];
}

const SourceManager: React.FC<SourceManagerProps> = ({ sources, onAddSource, onDeleteSource, onEditSource, onTransfer, totalsBySource = {}, usedCountBySource = {}, transferHistory = [] }) => {
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceBalance, setNewSourceBalance] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingBalance, setEditingBalance] = useState<string>('');
  const [transferFromId, setTransferFromId] = useState<string>('');
  const [transferToId, setTransferToId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sources' | 'history'>('sources');

  const handleAddSource = () => {
    if (newSourceName.trim() !== '') {
      const bal = Math.max(0, parseInt(newSourceBalance.replace(/[^0-9]/g, '') || '0', 10));
      onAddSource(newSourceName.trim(), bal);
      setNewSourceName('');
      setNewSourceBalance('');
    }
  };

  const startEdit = (id: string, currentName: string, currentBalance: number) => {
    setEditingId(id);
    setEditingName(currentName);
    setEditingBalance(String(currentBalance || 0));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingBalance('');
  };

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      const bal = Math.max(0, parseInt(editingBalance.replace(/[^0-9]/g, '') || '0', 10));
      onEditSource(editingId, editingName.trim(), bal);
      cancelEdit();
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-slate-900/30">
      <h3 className="text-xl font-bold mb-4">Manage Transaction Sources</h3>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button 
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 rounded-t font-semibold transition-colors ${activeTab === 'sources' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Sources
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-t font-semibold transition-colors ${activeTab === 'history' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Transfer History
        </button>
      </div>

      {activeTab === 'sources' ? (
        <>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              placeholder="e.g., BCA, GoPay"
              className="flex-grow p-2 border rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600"
            />
            <input
              type="text"
              value={newSourceBalance}
              onChange={(e) => setNewSourceBalance(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Saldo (IDR)"
              className="w-40 p-2 border rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600"
            />
            <button onClick={handleAddSource} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Add Source
            </button>
          </div>
          {/* Transfer Section */}
          <div className="mt-6 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-semibold mb-2">Transfer antar sumber</div>
            <div className="flex flex-wrap gap-2 items-center">
              <select value={transferFromId} onChange={(e)=>setTransferFromId(e.target.value)} className="p-2 border rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600">
                <option value="">Dari</option>
                {sources.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
              <span className="text-slate-500">→</span>
              <select value={transferToId} onChange={(e)=>setTransferToId(e.target.value)} className="p-2 border rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600">
                <option value="">Ke</option>
                {sources.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
              <input
                type="text"
                value={transferAmount}
                onChange={(e)=>setTransferAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Nominal (IDR)"
                className="w-44 p-2 border rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600"
              />
              <button
                onClick={() => onTransfer && onTransfer(transferFromId, transferToId, Math.max(0, parseInt(transferAmount || '0', 10)))}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
              >
                Transfer
              </button>
            </div>
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
                        <input
                          type="text"
                          value={editingBalance}
                          onChange={(e) => setEditingBalance(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-40 p-2 border rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600"
                          placeholder="Saldo (IDR)"
                        />
                        <button onClick={saveEdit} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                        <button onClick={cancelEdit} className="px-3 py-1 bg-slate-400 text-white rounded hover:bg-slate-500">Cancel</button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{source.name}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">Saldo: {formatRupiah(source.balance || 0)} • Total: {formatRupiah(total)} • Sisa: {formatRupiah(Math.max(0, (source.balance || 0) - total))} • {usedCount} tx</span>
                      </>
                    )}
                  </div>
                  {editingId !== source.id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(source.id, source.name, source.balance || 0)}
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
        </>
      ) : (
        <div>
          <h4 className="font-semibold mb-3">Transfer History</h4>
          {transferHistory.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">No transfers yet</p>
          ) : (
            <div className="space-y-2">
              {transferHistory.map(transfer => {
                const fromSource = sources.find(s => s.id === transfer.fromSourceId);
                const toSource = sources.find(s => s.id === transfer.toSourceId);
                const transferDate = new Date(transfer.date);
                return (
                  <div key={transfer.id} className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium">
                        {fromSource?.name || 'Unknown'} → {toSource?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-slate-500">
                        {transferDate.toLocaleDateString()} {transferDate.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatRupiah(transfer.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SourceManager;