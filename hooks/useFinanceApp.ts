import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import {
  Category,
  CategoryWithBudget,
  Goal,
  Expense,
  TransactionSource,
  MonthlyArchive,
  Income,
} from '../types';
import { INITIAL_CATEGORIES, INITIAL_SOURCES } from '../constants';
import { useLocalStorage } from './useLocalStorage';
import { useToast } from '../contexts/ToastContext';
import { useDarkMode } from './useDarkMode';
import { formatRupiah } from '../src/utils/currency';
import {
  todayKey,
  getCycleStart,
  getNextCycleStart,
  getCycleEnd,
  getDayBefore,
  formatCycleRange,
  ordinal,
} from '../src/utils/payCycle';

// All app-wide state and the handlers that mutate it, kept out of App.tsx
// so the component tree stays focused on rendering.
export function useFinanceApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [theme, toggleTheme] = useDarkMode();
  const currentView = location.pathname.replace('/', '') || 'dashboard';

  const [income, setIncome] = useLocalStorage<number>('monthlyIncome', 0);
  const [categories, setCategories] = useLocalStorage<CategoryWithBudget[]>('categories', INITIAL_CATEGORIES as CategoryWithBudget[]);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [sources, setSources] = useLocalStorage<TransactionSource[]>('sources', INITIAL_SOURCES);
  const [incomes, setIncomes] = useLocalStorage<Income[]>('incomes', []);
  // Pay cycle: payday (day of month, 0 = not set yet), the date the current cycle started,
  // and the leftover money carried over from the previous cycle.
  const [paydayDay, setPaydayDay] = useLocalStorage<number>('paydayDay', 0);
  const [cycleStart, setCycleStart] = useLocalStorage<string>('cycleStart', '');
  const [carryOver, setCarryOver] = useLocalStorage<number>('carryOver', 0);
  const [monthlyArchives, setMonthlyArchives] = useLocalStorage<MonthlyArchive[]>('monthlyArchives', []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithBudget | null>(null);
  const [viewingCategory, setViewingCategory] = useState<CategoryWithBudget | null>(null);

  const totalLoggedIncome = useMemo(() => {
    return incomes.reduce((acc, inc) => acc + (inc.amount || 0), 0);
  }, [incomes]);

  // Everything received in this cycle (salary, side jobs, ...) adds up; leftover from the last cycle is on top.
  const cycleIncome = totalLoggedIncome > 0 ? totalLoggedIncome : income;
  const effectiveIncome = cycleIncome + carryOver;

  const totalSourceBalance = useMemo(() => {
    return sources.reduce((acc, s) => acc + (s.balance || 0), 0);
  }, [sources]);

  // Recompute category planned/budget when income or allocations change
  React.useEffect(() => {
    setCategories(prev => {
      let changed = false;
      const updated = prev.map(cat => {
        const planned = (effectiveIncome || 0) * (cat.allocation / 100);
        if (cat.planned !== planned || cat.budget !== planned) {
          changed = true;
          return { ...cat, planned, budget: planned } as CategoryWithBudget;
        }
        return cat;
      });
      return changed ? updated : prev;
    });
  }, [effectiveIncome, categories, setCategories]);

  const totalExpenses = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.spent || 0), 0);
  }, [categories]);

  const totalSavings = useMemo(() => {
    return effectiveIncome - totalExpenses;
  }, [effectiveIncome, totalExpenses]);

  const handleNavigation = useCallback((view: string) => {
    navigate(`/${view}`);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [navigate, mobileMenuOpen]);

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const category = categories.find(c => c.id === expense.categoryId);
    if (category) {
      const newExpense = { ...expense, id: Date.now().toString() };
      const updatedCategory = {
        ...category,
        spent: category.spent + newExpense.amount,
        expenses: [...category.expenses, newExpense],
      };
      setCategories(categories.map(c => c.id === expense.categoryId ? updatedCategory : c));
      addToast({ type: 'success', message: 'Expense added!' });
    }
  };

  const handleEditExpense = useCallback((updated: Expense) => {
    setCategories(prev => {
      let originalCategoryId: string | null = null;
      let originalExpense: Expense | null = null;
      prev.forEach(cat => {
        const exp = cat.expenses.find(e => e.id === updated.id);
        if (exp) {
          originalCategoryId = cat.id;
          originalExpense = exp;
        }
      });

      if (!originalExpense || !originalCategoryId) {
        addToast({ type: 'error', message: 'Original expense not found.' });
        return prev;
      }

      if (originalCategoryId !== updated.categoryId) {
        return prev.map(cat => {
          if (cat.id === originalCategoryId) {
            const newExpenses = cat.expenses.filter(e => e.id !== updated.id);
            const newSpent = Math.max(0, cat.spent - originalExpense!.amount);
            return { ...cat, expenses: newExpenses, spent: newSpent };
          }
          if (cat.id === updated.categoryId) {
            const newExpenses = [...cat.expenses, { ...updated }];
            const newSpent = cat.spent + updated.amount;
            return { ...cat, expenses: newExpenses, spent: newSpent };
          }
          return cat;
        });
      }

      return prev.map(cat => {
        if (cat.id !== originalCategoryId) return cat;
        const newExpenses = cat.expenses.map(e => (e.id === updated.id ? { ...e, ...updated } : e));
        const delta = (updated.amount || 0) - (originalExpense!.amount || 0);
        const newSpent = Math.max(0, cat.spent + delta);
        return { ...cat, expenses: newExpenses, spent: newSpent };
      });
    });
    addToast({ type: 'success', message: 'Expense updated!' });
  }, [setCategories, addToast]);

  const handleDeleteExpense = useCallback((expenseId: string) => {
    let found = false;
    let deleted: { expense: Expense; categoryId: string } | null = null;
    const updated = categories.map(cat => {
      const exp = cat.expenses.find(e => e.id === expenseId);
      if (exp) {
        found = true;
        const newExpenses = cat.expenses.filter(e => e.id !== expenseId);
        const newSpent = Math.max(0, cat.spent - exp.amount);
        deleted = { expense: exp, categoryId: cat.id };
        return { ...cat, expenses: newExpenses, spent: newSpent };
      }
      return cat;
    });
    if (found) {
      setCategories(updated);
      addToast({
        type: 'info',
        message: 'Expense removed.',
        action: {
          text: 'Undo',
          onClick: () => {
            setCategories(prev => prev.map(cat => {
              if (deleted && cat.id === deleted.categoryId) {
                return {
                  ...cat,
                  expenses: [...cat.expenses, deleted.expense],
                  spent: cat.spent + deleted.expense.amount,
                };
              }
              return cat;
            }));
          }
        }
      });
    } else {
      addToast({ type: 'error', message: 'Expense not found.' });
    }
  }, [categories, setCategories, addToast]);

  const handleAddSource = useCallback((name: string, balance: number = 0) => {
    const newSource: TransactionSource = { id: `src-${Date.now()}`, name, balance };
    setSources(prev => [...prev, newSource]);
    addToast({ type: 'success', message: 'Source added!' });
  }, [setSources, addToast]);

  const handleEditSource = useCallback((id: string, name: string, balance: number) => {
    setSources(prev => prev.map(s => (s.id === id ? { ...s, name, balance } : s)));
    addToast({ type: 'success', message: 'Source updated!' });
  }, [setSources, addToast]);

  const handleDeleteSource = useCallback((id: string) => {
    const isUsed = categories.some(cat => cat.expenses.some(e => e.sourceId === id));
    if (isUsed) {
      addToast({ type: 'error', message: 'Cannot delete source: it is used by some expenses.' });
      return;
    }
    setSources(prev => prev.filter(s => s.id !== id));
    addToast({ type: 'info', message: 'Source deleted.' });
  }, [categories, setSources, addToast]);

  const handleTransferSources = useCallback((fromId: string, toId: string, amount: number) => {
    if (!fromId || !toId || fromId === toId) {
      addToast({ type: 'error', message: 'Pilih sumber berbeda.' });
      return;
    }
    if (!(amount > 0)) {
      addToast({ type: 'error', message: 'Nominal transfer harus > 0.' });
      return;
    }
    setSources(prev => {
      const from = prev.find(s => s.id === fromId);
      const to = prev.find(s => s.id === toId);
      if (!from || !to) return prev;
      if ((from.balance || 0) < amount) {
        addToast({ type: 'error', message: 'Saldo sumber tidak mencukupi.' });
        return prev;
      }
      return prev.map(s => {
        if (s.id === fromId) return { ...s, balance: (s.balance || 0) - amount };
        if (s.id === toId) return { ...s, balance: (s.balance || 0) + amount };
        return s;
      });
    });
    addToast({ type: 'success', message: 'Transfer berhasil.' });
  }, [setSources, addToast]);

  const handleAddIncome = useCallback((incomeItem: Omit<Income, 'id' | 'date'> & { date?: string }) => {
    const newIncome: Income = {
      id: `inc-${Date.now()}`,
      description: incomeItem.description,
      amount: incomeItem.amount,
      sourceId: incomeItem.sourceId,
      date: incomeItem.date || new Date().toISOString(),
    };
    setIncomes(prev => [newIncome, ...prev]);
    setSources(prev => prev.map(s => s.id === newIncome.sourceId ? { ...s, balance: (s.balance || 0) + newIncome.amount } : s));
    addToast({ type: 'success', message: 'Income added!' });
  }, [setIncomes, setSources, addToast]);

  const handleEditIncome = useCallback((updated: Income) => {
    setIncomes(prev => prev.map(i => i.id === updated.id ? { ...updated } : i));
    setSources(prev => {
      let original: Income | undefined = incomes.find(i => i.id === updated.id);
      if (!original) return prev;
      const arr = prev.map(s => {
        if (s.id === original!.sourceId && original!.sourceId !== updated.sourceId) {
          return { ...s, balance: (s.balance || 0) - original!.amount };
        }
        if (s.id === updated.sourceId && original!.sourceId !== updated.sourceId) {
          return { ...s, balance: (s.balance || 0) + updated.amount };
        }
        return s;
      });
      if (original.sourceId === updated.sourceId) {
        const delta = updated.amount - original.amount;
        return arr.map(s => s.id === updated.sourceId ? { ...s, balance: (s.balance || 0) + delta } : s);
      }
      return arr;
    });
    addToast({ type: 'success', message: 'Income updated!' });
  }, [incomes, setIncomes, setSources, addToast]);

  const handleDeleteIncome = useCallback((incomeId: string) => {
    let removed: Income | undefined;
    setIncomes(prev => {
      removed = prev.find(i => i.id === incomeId);
      return prev.filter(i => i.id !== incomeId);
    });
    if (removed) {
      setSources(prev => prev.map(s => s.id === removed!.sourceId ? { ...s, balance: Math.max(0, (s.balance || 0) - removed!.amount) } : s));
      addToast({ type: 'info', message: 'Income deleted.' });
    }
  }, [setIncomes, setSources, addToast]);

  // ---- Pay cycle -----------------------------------------------------------
  // A cycle runs from payday until the day before the next payday. When a new cycle
  // starts, the old one is archived (it stays available in Reports) and whatever money
  // is left over is carried into the new cycle. Sources and goals are left untouched.

  const currentCycle = useMemo(() => {
    if (!paydayDay || !cycleStart) return null;
    return { start: cycleStart, end: getCycleEnd(cycleStart, paydayDay) };
  }, [paydayDay, cycleStart]);

  const archiveCycleAndStartNew = useCallback((newStart: string) => {
    if (!cycleStart) return;
    const leftover = effectiveIncome - totalExpenses;
    const archive: MonthlyArchive = {
      month: cycleStart, // unique key for this cycle (its start date)
      cycleStart,
      cycleEnd: getDayBefore(newStart),
      carriedIn: carryOver,
      income: effectiveIncome,
      categories: categories.map(c => ({ ...c })),
      goals: goals.map(g => ({ ...g })),
      sources: sources.map(s => ({ ...s })),
      incomes: incomes.map(i => ({ ...i })),
    };
    setMonthlyArchives(prev => [...prev.filter(a => a.month !== archive.month), archive]);
    setCategories(prev => prev.map(c => ({ ...c, spent: 0, expenses: [] })));
    setIncomes([]);
    setIncome(0);
    setCarryOver(leftover);
    setCycleStart(newStart);
    const range = paydayDay ? formatCycleRange(newStart, getCycleEnd(newStart, paydayDay)) : '';
    addToast({
      type: 'info',
      message: leftover === 0
        ? `New pay cycle started (${range}).`
        : `New pay cycle started (${range}). ${formatRupiah(Math.abs(leftover))} ${leftover > 0 ? 'carried over' : 'overspent was deducted'}.`,
    });
  }, [cycleStart, effectiveIncome, totalExpenses, carryOver, categories, goals, sources, incomes, paydayDay,
      setMonthlyArchives, setCategories, setIncomes, setIncome, setCarryOver, setCycleStart, addToast]);

  // Remembers the last cycle we rolled into, so the same rollover can never run twice.
  const lastRolledTo = React.useRef('');

  // Check on load, and again whenever the app regains focus (e.g. you open it the morning after payday).
  React.useEffect(() => {
    if (!paydayDay) return;
    const check = () => {
      const current = getCycleStart(todayKey(), paydayDay);
      if (!cycleStart) {
        setCycleStart(current);
        return;
      }
      if (cycleStart < current && lastRolledTo.current !== current) {
        lastRolledTo.current = current;
        archiveCycleAndStartNew(current);
      }
    };
    check();
    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, [paydayDay, cycleStart, archiveCycleAndStartNew, setCycleStart]);

  const handleSetPayday = useCallback((day: number) => {
    const d = Math.round(day);
    if (!Number.isFinite(d) || d < 1 || d > 31) {
      addToast({ type: 'error', message: 'Enter a day between 1 and 31.' });
      return;
    }
    const start = getCycleStart(todayKey(), d);
    setPaydayDay(d);
    setCycleStart(start);
    addToast({ type: 'success', message: `Payday set to the ${ordinal(d)}. Current cycle: ${formatCycleRange(start, getCycleEnd(start, d))}.` });
  }, [setPaydayDay, setCycleStart, addToast]);

  // For when your salary arrives before the usual payday.
  const handleStartNextCycleNow = useCallback(() => {
    if (!paydayDay || !cycleStart) {
      addToast({ type: 'error', message: 'Set your payday first.' });
      return;
    }
    const today = todayKey();
    const next = getNextCycleStart(cycleStart, paydayDay);
    const target = next > today ? next : getCycleStart(today, paydayDay);
    if (target <= cycleStart) {
      addToast({ type: 'info', message: 'You are already in the latest pay cycle.' });
      return;
    }
    const ok = window.confirm('Start the next pay cycle now?\n\nThe current cycle will be archived and any leftover money will carry over.');
    if (!ok) return;
    lastRolledTo.current = target;
    archiveCycleAndStartNew(target);
  }, [paydayDay, cycleStart, archiveCycleAndStartNew, addToast]);


  const handleSaveCategory = useCallback((categoryData: Pick<Category, 'name' | 'allocation' | 'color' | 'icon'> & { id?: string }) => {
    if (categoryData.id) {
      setCategories(prev => prev.map(cat => cat.id === categoryData.id ? { ...cat, ...categoryData, planned: cat.planned, spent: cat.spent, expenses: cat.expenses } : cat));
      addToast({ type: 'success', message: 'Category updated!' });
    } else {
      const newCategory: CategoryWithBudget = {
        ...categoryData,
        id: `cat-${Date.now()}`,
        expenses: [],
        spent: 0,
        planned: 0,
        budget: 0,
        isActive: true
      };
      setCategories(prev => [...prev, newCategory]);
      addToast({ type: 'success', message: 'Category added!' });
    }
    setCategoryModalOpen(false);
    setEditingCategory(null);
  }, [setCategories, addToast]);

  const handleAddGoal = useCallback((goal: Omit<Goal, 'id' | 'currentAmount'>) => {
    setGoals(prev => [...prev, { ...goal, id: Date.now().toString(), currentAmount: 0 }]);
    addToast({ type: 'success', message: 'Goal added!' });
  }, [setGoals, addToast]);

  const handleUpdateGoal = useCallback((updatedGoal: Goal) => {
    setGoals(prev => prev.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal));
    addToast({ type: 'success', message: 'Goal updated!' });
  }, [setGoals, addToast]);

  const handleDeleteGoal = useCallback((goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    addToast({ type: 'info', message: 'Goal deleted.' });
  }, [setGoals, addToast]);

  const handleDeleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    addToast({ type: 'info', message: 'Category deleted.' });
  }, [setCategories, addToast]);

  const handleOpenModal = useCallback((category: Category | null = null) => {
    setEditingCategory(category as CategoryWithBudget | null);
    setCategoryModalOpen(true);
  }, []);

  const handleAllocationChange = (categoryId: string, newAllocation: number) => {
    const normalizedAllocation = Number.isFinite(newAllocation) ? Math.max(0, newAllocation) : 0;
    setCategories(prev =>
      prev.map(c => (c.id === categoryId ? { ...c, allocation: normalizedAllocation } : c))
    );
  };

  const handleAutoAdjustAllocation = () => {
    setCategories(prev => {
      if (prev.length === 0) return prev;

      const totalAlloc = prev.reduce((sum, cat) => sum + (cat.allocation || 0), 0);

      if (totalAlloc === 100) {
        const base = Math.floor(100 / prev.length);
        let remainder = 100 - base * prev.length;
        return prev.map((cat) => {
          const allocation = base + (remainder > 0 ? 1 : 0);
          if (remainder > 0) remainder -= 1;
          return { ...cat, allocation };
        });
      }

      const adjustableIndices = prev
        .map((cat, idx) => ({ idx, allocation: cat.allocation || 0 }))
        .filter(x => x.allocation > 0)
        .map(x => x.idx);

      if (adjustableIndices.length === 0) {
        const base = Math.floor(100 / prev.length);
        let remainder = 100 - base * prev.length;
        return prev.map((cat) => {
          const allocation = base + (remainder > 0 ? 1 : 0);
          if (remainder > 0) remainder -= 1;
          return { ...cat, allocation };
        });
      }

      const adjustableTotal = adjustableIndices.reduce((sum, idx) => sum + (prev[idx].allocation || 0), 0);
      if (adjustableTotal === 0) return prev;

      const raw = adjustableIndices.map((idx) => {
        const exact = ((prev[idx].allocation || 0) / adjustableTotal) * 100;
        const floored = Math.floor(exact);
        return { idx, exact, floored, frac: exact - floored };
      });

      let remaining = 100 - raw.reduce((sum, r) => sum + r.floored, 0);
      const withRemainder = [...raw].sort((a, b) => b.frac - a.frac);
      for (let i = 0; i < withRemainder.length && remaining > 0; i += 1) {
        withRemainder[i] = { ...withRemainder[i], floored: withRemainder[i].floored + 1 };
        remaining -= 1;
      }

      const nextAllocations = new Map<number, number>(
        withRemainder.map(r => [r.idx, r.floored])
      );

      return prev.map((cat, idx) => {
        if (!nextAllocations.has(idx)) return { ...cat, allocation: 0 };
        return { ...cat, allocation: nextAllocations.get(idx)! };
      });
    });

    const currentTotal = categories.reduce((sum, cat) => sum + (cat.allocation || 0), 0);
    if (currentTotal === 100) {
      addToast({ type: 'success', message: 'Allocations equalized.' });
    } else {
      addToast({ type: 'success', message: 'Allocations fixed to 100%.' });
    }
  };

  const handleViewCategory = (category: Category) => {
    setViewingCategory(category as CategoryWithBudget);
  };

  const handleExportData = (format: 'json' | 'pdf' | 'csv') => {
    const data = { categories, goals, income: cycleIncome, sources, incomes, monthlyArchives, payCycle: { paydayDay, cycleStart, carryOver } };

    if (format === 'json') {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = 'finance-data.json';
      link.click();
    }

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('Finance Report', 20, 10);

      (doc as any).autoTable({
        head: [['Category', 'Planned', 'Spent']],
        body: categories.map(c => [c.name, c.planned, c.spent]),
        startY: 20,
      });

      (doc as any).autoTable({
        head: [['Goal', 'Target', 'Current']],
        body: goals.map(g => [g.name, g.targetAmount, g.currentAmount]),
        startY: (doc as any).lastAutoTable.finalY + 10,
      });

      doc.save('finance-report.pdf');
    }

    if (format === 'csv') {
      const csv = Papa.unparse(categories.map(c => ({ Category: c.name, Planned: c.planned, Spent: c.spent })))
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'finance-data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImportData = (importedData: any) => {
    const newIncome = importedData.income || income;
    if (importedData.income) {
      setIncome(newIncome);
    }

    if (importedData.categories) {
      const updatedCategories = importedData.categories.map((cat: any) => {
        const spent = cat.expenses ? cat.expenses.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0) : 0;
        const planned = newIncome * (cat.allocation / 100);
        return { ...cat, spent, planned, budget: planned };
      });
      setCategories(updatedCategories);
    }

    if (importedData.goals) {
      setGoals(importedData.goals);
    }

    if (importedData.monthlyArchives) {
      setMonthlyArchives(importedData.monthlyArchives);
    }

    const pc = importedData.payCycle;
    setCarryOver(pc && typeof pc.carryOver === 'number' ? pc.carryOver : 0);
    if (pc && typeof pc.paydayDay === 'number' && pc.paydayDay >= 1 && pc.paydayDay <= 31) {
      setPaydayDay(pc.paydayDay);
      setCycleStart(typeof pc.cycleStart === 'string' ? pc.cycleStart : '');
    }

    if (importedData.incomes && Array.isArray(importedData.incomes)) {
      setIncomes(importedData.incomes);
    }

    if (importedData.sources) {
      const normalized = importedData.sources.map((s: any) => ({
        id: s.id,
        name: s.name,
        balance: typeof s.balance === 'number' ? s.balance : 0
      }));
      setSources(normalized);
    } else {
      const sourceIds = new Set<string>();
      if (importedData.categories) {
        importedData.categories.forEach((cat: any) => {
          (cat.expenses || []).forEach((exp: any) => {
            if (exp.sourceId) sourceIds.add(exp.sourceId);
          });
        });
      }
      if (sourceIds.size > 0) {
        const derived = Array.from(sourceIds).map((id) => ({ id, name: `Source ${id.slice(-4)}`, balance: 0 }));
        setSources(derived);
      } else if (sources.length === 0) {
        setSources(prev => (prev && prev.length > 0 ? prev : INITIAL_SOURCES));
      }
    }

    addToast({ type: 'success', message: 'Data imported successfully!' });
  };

  return {
    // state
    theme, toggleTheme,
    currentView,
    income, categories, goals, sources, incomes, monthlyArchives,
    mobileMenuOpen, setMobileMenuOpen,
    isCategoryModalOpen, setCategoryModalOpen,
    editingCategory, viewingCategory, setViewingCategory,
    paydayDay, currentCycle, carryOver, cycleIncome,
    effectiveIncome, totalExpenses, totalSavings, totalSourceBalance,
    // handlers
    handleNavigation,
    handleAddExpense, handleEditExpense, handleDeleteExpense,
    handleAddSource, handleEditSource, handleDeleteSource, handleTransferSources,
    handleAddIncome, handleEditIncome, handleDeleteIncome,
    handleAddGoal, handleUpdateGoal, handleDeleteGoal,
    handleSetPayday, handleStartNextCycleNow,
    handleSaveCategory, handleDeleteCategory, handleOpenModal,
    handleAllocationChange, handleAutoAdjustAllocation, handleViewCategory,
    handleExportData, handleImportData,
  };
}
