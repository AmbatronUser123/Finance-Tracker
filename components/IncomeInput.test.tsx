import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IncomeInput from './IncomeInput';
import { TransactionSource } from '../types';
import React from 'react';

describe('IncomeInput', () => {
  const mockOnAddIncome = vi.fn();
  const mockSources: TransactionSource[] = [
    { id: '1', name: 'Bank Account', balance: 1000 },
    { id: '2', name: 'Cash', balance: 500 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all input fields correctly', () => {
    render(<IncomeInput onAddIncome={mockOnAddIncome} transactionSources={mockSources} />);

    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // Source select
    expect(screen.getByRole('button', { name: /add income/i })).toBeInTheDocument();
  });

  it('updates input fields correctly', () => {
    render(<IncomeInput onAddIncome={mockOnAddIncome} transactionSources={mockSources} />);

    const descInput = screen.getByPlaceholderText('Description');
    const amountInput = screen.getByPlaceholderText('Amount');
    const sourceSelect = screen.getByRole('combobox');

    fireEvent.change(descInput, { target: { value: 'Freelance Work' } });
    fireEvent.change(amountInput, { target: { value: '5000' } });
    fireEvent.change(sourceSelect, { target: { value: '2' } });

    expect(descInput).toHaveValue('Freelance Work');
    expect(amountInput).toHaveValue(5000); // numeric input value
    expect(sourceSelect).toHaveValue('2');
  });

  it('selects the first source by default', () => {
    render(<IncomeInput onAddIncome={mockOnAddIncome} transactionSources={mockSources} />);
    expect(screen.getByRole('combobox')).toHaveValue('1');
  });

  it('submits the form with valid data', () => {
    render(<IncomeInput onAddIncome={mockOnAddIncome} transactionSources={mockSources} />);

    const descInput = screen.getByPlaceholderText('Description');
    const amountInput = screen.getByPlaceholderText('Amount');
    const submitButton = screen.getByRole('button', { name: /add income/i });

    fireEvent.change(descInput, { target: { value: 'Salary' } });
    fireEvent.change(amountInput, { target: { value: '10000' } });

    fireEvent.click(submitButton);

    expect(mockOnAddIncome).toHaveBeenCalledTimes(1);
    expect(mockOnAddIncome).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Salary',
      amount: 10000,
      sourceId: '1',
    }));
    // Date check is tricky due to timezone, check it's a string at least or roughly correct
    const callArg = mockOnAddIncome.mock.calls[0][0];
    expect(callArg.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('resets the form after submission', () => {
    render(<IncomeInput onAddIncome={mockOnAddIncome} transactionSources={mockSources} />);

    const descInput = screen.getByPlaceholderText('Description');
    const amountInput = screen.getByPlaceholderText('Amount');
    const submitButton = screen.getByRole('button', { name: /add income/i });

    fireEvent.change(descInput, { target: { value: 'Gift' } });
    fireEvent.change(amountInput, { target: { value: '500' } });
    fireEvent.click(submitButton);

    expect(descInput).toHaveValue('');
    expect(amountInput).toHaveValue(null);
  });

  it('does not submit if fields are empty', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<IncomeInput onAddIncome={mockOnAddIncome} transactionSources={mockSources} />);

    const submitButton = screen.getByRole('button', { name: /add income/i });

    fireEvent.click(submitButton);

    expect(alertMock).toHaveBeenCalledWith('Please fill all fields');
    expect(mockOnAddIncome).not.toHaveBeenCalled();

    alertMock.mockRestore();
  });
});
