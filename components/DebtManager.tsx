import React, { useEffect, useMemo, useState } from 'react';
import { Debt, TransactionSource } from '../types';
import { formatRupiah } from '../src/utils/currency';
import { todayKey, formatShortDate } from '../src/utils/payCycle';

interface DebtManagerProps {
  debts: Debt[];
  sources: TransactionSource[];
  onAddDebt: (input: { person: string; amount: number; date: string; sourceId: string; note?: string; dueDate?: string }) => boolean;
  onAddPayment: (debtId: string, payment: { amount: number; date: string; sourceId: string }) => boolean;
  onDeletePayment: (debtId: string, paymentId: string) => void;
  onDeleteDebt: (debtId: string) => void;
}

type Filter = 'outstanding' | 'paid' | 'all';

const paidOf = (d: Debt) => d.payments.reduce((t, p) => t + p.amount, 0);
const remainingOf = (d: Debt) => d.amount - paidOf(d);
const isPaid = (d: Debt) => remainingOf(d) <= 0.005;

const fieldClass =
  'w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none';
const labelClass = 'block mb-1 text-sm text-slate-600 dark:text-slate-300';
const cardClass = 'bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30';

const DebtManager: React.FC<DebtManagerProps> = ({ debts, sources, onAddDebt, onAddPayment, onDeletePayment, onDeleteDebt }) => {
  // add form
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayKey());
  const [sourceId, setSourceId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  // list
  const [filter, setFilter] = useState<Filter>('outstanding');

  // "record payment" form (one debt at a time)
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(todayKey());
  const [paySourceId, setPaySourceId] = useState('');

  useEffect(() => {
    if (sources.length > 0 && !sources.some(s => s.id === sourceId)) {
      setSourceId(sources[0].id);
    }
  }, [sources, sourceId]);

  const sourceName = useMemo(() => Object.fromEntries(sources.map(s => [s.id, s.name])), [sources]);
  const today = todayKey();

  const summary = useMemo(() => {
    const open = debts.filter(d => !isPaid(d));
    const total = open.reduce((t, d) => t + remainingOf(d), 0);
    const overdue = open.filter(d => d.dueDate && d.dueDate < todayKey()).length;
    const people = new Map<string, { name: string; owed: number }>();
    open.forEach(d => {
      const key = d.person.trim().toLowerCase();
      const entry = people.get(key) || { name: d.person.trim(), owed: 0 };
      entry.owed += remainingOf(d);
      people.set(key, entry);
    });
    return { total, overdue, count: open.length, byPerson: Array.from(people.values()).sort((a, b) => b.owed - a.owed) };
  }, [debts]);

  const knownPeople = useMemo(
    () => Array.from(new Set(debts.map(d => d.person.trim()))).sort((a, b) => a.localeCompare(b)),
    [debts]
  );

  const visible = debts.filter(d => (filter === 'outstanding' ? !isPaid(d) : filter === 'paid' ? isPaid(d) : true));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const done = onAddDebt({
      person,
      amount: parseFloat(amount),
      date,
      sourceId,
      note,
      dueDate: dueDate || undefined,
    });
    if (done) {
      setPerson('');
      setAmount('');
      setDate(todayKey());
      setDueDate('');
      setNote('');
    }
  };

  const openPaymentForm = (d: Debt) => {
    setPayingId(d.id);
    setPayAmount(String(remainingOf(d)));
    setPayDate(todayKey());
    setPaySourceId(sources.some(s => s.id === d.sourceId) ? d.sourceId : sources[0]?.id ?? '');
  };

  const handlePay = (d: Debt) => {
    const done = onAddPayment(d.id, { amount: parseFloat(payAmount), date: payDate, sourceId: paySourceId });
    if (done) setPayingId(null);
  };

  const filterButton = (value: Filter, label: string) => (
    <button
      key={value}
      onClick={() => setFilter(value)}
      className={`px-3 py-1.5 text-sm rounded-lg ${
        filter === value
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className={`${cardClass} p-5`}>
        <p className="text-sm text-slate-500 dark:text-slate-300">Total owed to you</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatRupiah(summary.total)}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {summary.count === 0 ? 'Nobody owes you anything right now.' : `${summary.count} open utang from ${summary.byPerson.length} ${summary.byPerson.length === 1 ? 'person' : 'people'}`}
          {summary.overdue > 0 && <span className="ml-2 font-medium text-red-600 dark:text-red-300">{summary.overdue} overdue</span>}
        </p>
        {summary.byPerson.length > 0 && (
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {summary.byPerson.map(p => (
              <li key={p.name} className="flex justify-between rounded-lg bg-slate-50 dark:bg-slate-700/50 px-3 py-2">
                <span className="text-slate-700 dark:text-slate-200">{p.name}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{formatRupiah(p.owed)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className={`${cardClass} p-5 space-y-4`}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add Utang</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="utang-person">Who owes you</label>
            <input id="utang-person" list="utang-people" value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Name" className={fieldClass} />
            <datalist id="utang-people">
              {knownPeople.map(name => (<option key={name} value={name} />))}
            </datalist>
          </div>
          <div>
            <label className={labelClass} htmlFor="utang-amount">Amount</label>
            <input id="utang-amount" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="utang-source">Paid from (source)</label>
            <select id="utang-source" value={sourceId} onChange={(e) => setSourceId(e.target.value)} className={fieldClass}>
              {sources.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="utang-date">Date</label>
            <input id="utang-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="utang-due">Due date (optional)</label>
            <input id="utang-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="utang-note">Note (optional)</label>
            <input id="utang-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Makan siang" className={fieldClass} />
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This lowers the balance of the source you pick. When they pay you back, the money is added to a source again.
        </p>
        <button type="submit" className="w-full p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
          Add Utang
        </button>
      </form>

      {/* List */}
      <div className={`${cardClass} p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Utang List</h3>
          <div className="flex gap-2">
            {filterButton('outstanding', 'Outstanding')}
            {filterButton('paid', 'Paid')}
            {filterButton('all', 'All')}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="py-6 text-center text-slate-500 dark:text-slate-300">
            {debts.length === 0 ? 'No utang yet. When someone owes you money, add it above.' : 'Nothing in this view.'}
          </p>
        ) : (
          <div className="space-y-4">
            {visible.map(d => {
              const paid = paidOf(d);
              const remaining = remainingOf(d);
              const done = isPaid(d);
              const overdue = !done && !!d.dueDate && d.dueDate < today;
              const percent = Math.min(100, Math.round((paid / d.amount) * 100));
              const paying = payingId === d.id;
              return (
                <div key={d.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{d.person}</p>
                      {d.note && <p className="text-sm text-slate-600 dark:text-slate-300">{d.note}</p>}
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Lent {formatShortDate(d.date, true)} from {sourceName[d.sourceId] ?? 'a deleted source'}
                      </p>
                    </div>
                    <div className="text-right">
                      {done ? (
                        <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">Paid</span>
                      ) : overdue ? (
                        <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                          Overdue since {formatShortDate(d.dueDate as string)}
                        </span>
                      ) : d.dueDate ? (
                        <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                          Due {formatShortDate(d.dueDate)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Lent</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{formatRupiah(d.amount)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Paid</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{formatRupiah(paid)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Remaining</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(Math.max(0, remaining))}</p>
                    </div>
                  </div>

                  <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-2 rounded-full bg-green-500" style={{ width: `${percent}%` }} />
                  </div>

                  {d.payments.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm">
                      {d.payments.map(p => (
                        <li key={p.id} className="flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
                          <span>
                            {formatShortDate(p.date, true)} · {formatRupiah(p.amount)} into {sourceName[p.sourceId] ?? 'a deleted source'}
                          </span>
                          <button onClick={() => onDeletePayment(d.id, p.id)} className="text-xs text-red-600 dark:text-red-300 hover:underline">
                            Undo
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {paying && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 p-3">
                      <div>
                        <label className={labelClass} htmlFor={`pay-amount-${d.id}`}>Amount paid</label>
                        <input id={`pay-amount-${d.id}`} type="number" min="0" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className={fieldClass} />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor={`pay-date-${d.id}`}>Date</label>
                        <input id={`pay-date-${d.id}`} type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className={fieldClass} />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor={`pay-source-${d.id}`}>Money went into</label>
                        <select id={`pay-source-${d.id}`} value={paySourceId} onChange={(e) => setPaySourceId(e.target.value)} className={fieldClass}>
                          {sources.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                        </select>
                      </div>
                      <div className="sm:col-span-3 flex gap-2 justify-end">
                        <button onClick={() => setPayingId(null)} className="px-3 py-1.5 text-sm bg-slate-400 hover:bg-slate-500 text-white rounded">Cancel</button>
                        <button onClick={() => handlePay(d)} className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded">Save payment</button>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex justify-end gap-2">
                    {!done && !paying && (
                      <button onClick={() => openPaymentForm(d)} className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded">
                        Record payment
                      </button>
                    )}
                    <button onClick={() => onDeleteDebt(d.id)} className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtManager;
