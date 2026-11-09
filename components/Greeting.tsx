import React from 'react';
import { formatDate } from '../src/utils/currency';
import { todayKey } from '../src/utils/payCycle';

interface GreetingProps {
  name: string;
}

const greetingForHour = (hour: number) => {
  if (hour < 11) return 'Good morning';
  if (hour < 15) return 'Good afternoon';
  if (hour < 19) return 'Good evening';
  return 'Good night';
};

const Greeting: React.FC<GreetingProps> = ({ name }) => {
  const text = greetingForHour(new Date().getHours());
  const trimmed = name.trim();
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {trimmed ? `${text}, ${trimmed}` : text}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-300">{formatDate(todayKey())}</p>
    </div>
  );
};

export default Greeting;
