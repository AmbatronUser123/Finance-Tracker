import React, { useState, useEffect } from 'react';
import { Income, TransactionSource } from '../types';

interface IncomeInputProps {
  onAddIncome: (income: Omit<Income, 'id'>) => void;
  transactionSources: TransactionSource[];
}

const IncomeInput: React.FC<IncomeInputProps> = ({ onAddIncome, transactionSources }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));

  useEffect(() => {
    if (transactionSources.length > 0 && !sourceId) {
      setSourceId(transactionSources[0].id);
    }
  }, [transactionSources, sourceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !sourceId) {
      alert('Please fill all fields');
      return;
    }
    onAddIncome({
      description,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      sourceId,
    });
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().slice(0,10));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold">Log Income</h3>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <select
        value={sourceId}
        onChange={(e) => setSourceId(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="" disabled>Select Source</option>
        {transactionSources.map(source => (
          <option key={source.id} value={source.id}>{source.name}</option>
        ))}
      </select>
      <button type="submit" className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600">
        Add Income
      </button>
    </form>
  );
};

export default IncomeInput;