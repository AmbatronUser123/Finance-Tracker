import React, { useState } from 'react';
import { CalendarDaysIcon } from './icons';
import { formatRupiah } from '../src/utils/currency';
import { todayKey, daysLeftInCycle, formatCycleRange, ordinal } from '../src/utils/payCycle';

interface PayCycleCardProps {
  paydayDay: number;                                   // 0 = not set yet
  currentCycle: { start: string; end: string } | null;
  cycleIncome: number;                                 // income received in this cycle
  carryOver: number;                                   // leftover brought in from the last cycle
  onSetPayday: (day: number) => void;
}

const PayCycleCard: React.FC<PayCycleCardProps> = ({ paydayDay, currentCycle, cycleIncome, carryOver, onSetPayday }) => {
  const [editing, setEditing] = useState(false);
  const [dayInput, setDayInput] = useState(paydayDay ? String(paydayDay) : '');

  const save = () => {
    const day = parseInt(dayInput, 10);
    onSetPayday(day);
    if (day >= 1 && day <= 31) setEditing(false);
  };

  const cardClass = 'bg-white dark:bg-slate-800 rounded-xl shadow p-5';
  const inputClass =
    'w-24 p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100';
  const primaryButton = 'px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold';

  const form = (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm text-slate-700 dark:text-slate-300" htmlFor="payday-input">Day of the month:</label>
      <input
        id="payday-input"
        type="number"
        min={1}
        max={31}
        inputMode="numeric"
        value={dayInput}
        onChange={(e) => setDayInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
        placeholder="25"
        className={inputClass}
      />
      <button onClick={save} className={primaryButton}>Save payday</button>
      {paydayDay > 0 && (
        <button onClick={() => { setEditing(false); setDayInput(String(paydayDay)); }} className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:underline">
          Cancel
        </button>
      )}
    </div>
  );

  // First time: ask for the payday
  if (!paydayDay || !currentCycle) {
    return (
      <div className={`${cardClass} border-l-4 border-indigo-500`}>
        <div className="flex items-start gap-3">
          <CalendarDaysIcon className="w-6 h-6 mt-0.5 text-indigo-500 flex-shrink-0" />
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Set your payday</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Your budget follows your pay cycle: from payday until the day before your next one.
                Any extra income you add during the cycle (side jobs and so on) adds to it, and leftover money carries over.
              </p>
            </div>
            {form}
          </div>
        </div>
      </div>
    );
  }

  const daysLeft = daysLeftInCycle(todayKey(), currentCycle.end);

  return (
    <div className={cardClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <CalendarDaysIcon className="w-6 h-6 mt-0.5 text-indigo-500 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-300">Current pay cycle · payday on the {ordinal(paydayDay)}</p>
            <p className="font-semibold text-lg text-slate-900 dark:text-slate-100">
              {formatCycleRange(currentCycle.start, currentCycle.end)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {daysLeft === 1 ? 'Last day of this cycle' : `${daysLeft} days left`}
            </p>
          </div>
        </div>
        {!editing && (
          <button onClick={() => { setDayInput(String(paydayDay)); setEditing(true); }} className="text-sm text-indigo-600 dark:text-indigo-300 hover:underline">
            Change payday
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-slate-500 dark:text-slate-300">Income this cycle</p>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(cycleIncome)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-slate-500 dark:text-slate-300">{carryOver < 0 ? 'Overspent last cycle' : 'Carried over from last cycle'}</p>
          <p className={`font-semibold ${carryOver < 0 ? 'text-red-600 dark:text-red-300' : 'text-slate-900 dark:text-slate-100'}`}>
            {formatRupiah(Math.abs(carryOver))}
          </p>
        </div>
      </div>

      {editing && (
        <div className="mt-4 space-y-2">
          {form}
          <p className="text-xs text-slate-500 dark:text-slate-400">Changing your payday doesn't reset or delete anything.</p>
        </div>
      )}
    </div>
  );
};

export default PayCycleCard;
