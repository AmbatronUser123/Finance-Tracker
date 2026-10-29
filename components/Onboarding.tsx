import React, { useEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import {
  LuSparkles,
  LuCalendarDays,
  LuWallet,
  LuBanknote,
  LuTags,
  LuReceiptText,
  LuChartPie,
  LuDatabase,
} from 'react-icons/lu';

interface Step {
  icon: React.ReactNode;
  title: string;
  body: string;
  goTo?: { view: string; label: string };
}

const STEPS: Step[] = [
  {
    icon: <LuSparkles size={26} />,
    title: 'Welcome to Finance Tracker',
    body: 'Track where your money goes, one pay cycle at a time. This quick tour takes about a minute. Everything stays on this device: there is no account and nothing is uploaded.',
  },
  {
    icon: <LuCalendarDays size={26} />,
    title: 'Set your payday',
    body: 'On the Dashboard, enter the day of the month you usually get paid. Your budget runs from payday until the day before the next one, then starts fresh and carries over whatever is left.',
    goTo: { view: 'dashboard', label: 'Open Dashboard' },
  },
  {
    icon: <LuWallet size={26} />,
    title: 'Add where your money is',
    body: 'In Sources, add your bank accounts, e-wallets and cash. Every expense you log is tagged with the source it was paid from.',
    goTo: { view: 'sources', label: 'Open Sources' },
  },
  {
    icon: <LuBanknote size={26} />,
    title: 'Log your income',
    body: 'Add your salary when you get paid. Side jobs and any other income you receive during the same cycle are added together into that cycle\'s total.',
    goTo: { view: 'income', label: 'Open Income' },
  },
  {
    icon: <LuTags size={26} />,
    title: 'Split your budget into categories',
    body: 'Each category gets a percentage of your income, and the percentages should add up to 100%. You can add, edit or remove categories to fit your life.',
    goTo: { view: 'categories', label: 'Open Categories' },
  },
  {
    icon: <LuReceiptText size={26} />,
    title: 'Record your expenses',
    body: 'Pick a category and a source, enter the amount, and save. Log expenses as they happen so you always know what is left in each category.',
    goTo: { view: 'expenses', label: 'Open Expenses' },
  },
  {
    icon: <LuChartPie size={26} />,
    title: 'Set goals and check reports',
    body: 'Use Goals for things you are saving towards. Reports lets you compare your spending across pay cycles and export it as PDF or CSV.',
    goTo: { view: 'reports', label: 'Open Reports' },
  },
  {
    icon: <LuDatabase size={26} />,
    title: 'Back up your data',
    body: 'Because your data lives only on this device, export a backup from the Data page now and then. Clearing your browser data, or opening the app on another device, starts empty. You can reopen this guide any time with the Guide button at the top.',
    goTo: { view: 'data', label: 'Open Data' },
  },
];

interface OnboardingProps {
  onClose: () => void;
  onGoTo: (view: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onClose, onGoTo }) => {
  const [index, setIndex] = useState(0);
  const primaryRef = useRef<HTMLButtonElement>(null);

  const step = STEPS[index];
  const isFirst = index === 0;
  const isLast = index === STEPS.length - 1;

  const next = () => (isLast ? onClose() : setIndex(i => i + 1));
  const back = () => setIndex(i => Math.max(0, i - 1));

  // Keep keyboard focus on the main button when the step changes
  useEffect(() => {
    primaryRef.current?.focus();
  }, [index]);

  // Keyboard: Esc closes, arrow keys move between steps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex(i => Math.min(STEPS.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 shadow-xl p-6"
      >
        <button
          onClick={onClose}
          aria-label="Close guide"
          className="absolute top-4 right-4 p-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
        >
          <FiX size={20} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
          {step.icon}
        </div>

        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Step {index + 1} of {STEPS.length}
        </p>
        <h2 id="onboarding-title" className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step.body}</p>

        {step.goTo && (
          <button
            onClick={() => {
              onGoTo(step.goTo!.view);
              onClose();
            }}
            className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:underline"
          >
            {step.goTo.label} →
          </button>
        )}

        <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-indigo-600' : 'w-1.5 bg-slate-300 dark:bg-slate-600'}`}
            />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          {isLast ? (
            <button
              onClick={back}
              className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:underline"
            >
              Back
            </button>
          ) : isFirst ? (
            <button onClick={onClose} className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:underline">
              Skip tour
            </button>
          ) : (
            <button onClick={back} className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:underline">
              Back
            </button>
          )}
          <button
            ref={primaryRef}
            onClick={next}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {isLast ? 'Get started' : isFirst ? 'Start tour' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
