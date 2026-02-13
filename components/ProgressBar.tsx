import React from 'react';

interface ProgressBarProps {
  percentage: number;
  colorClass: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, colorClass }) => {
  const safePercentage = Math.max(0, Math.min(100, percentage));

  const getBarColor = () => {
    if (percentage > 95) return 'bg-rose-500';
    if (percentage > 75) return 'bg-amber-400';
    return colorClass;
  };

  return (
    <div className="w-full rounded-full h-2.5 bg-slate-200 dark:bg-slate-700">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getBarColor()}`}
        style={{ width: `${safePercentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
