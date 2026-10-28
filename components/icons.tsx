import React from 'react';
import type { IconBaseProps } from 'react-icons';
import type { IconType } from 'react-icons';
import {
  LuTarget, LuPiggyBank, LuReceiptText, LuBriefcase, LuReceipt, LuHeart, LuShoppingBag,
  LuHouse, LuZap, LuFilm, LuGift, LuPlane, LuCircleDollarSign, LuUsers, LuBanknote,
  LuWrench, LuMusic, LuGraduationCap, LuUtensils, LuCar, LuHeartPulse, LuSmartphone,
  LuBookOpen, LuDumbbell, LuPawPrint, LuCoffee, LuTag,
} from 'react-icons/lu';

type SvgProps = React.SVGProps<SVGSVGElement>;

// Wraps a Lucide icon so it accepts the same props as our hand-written SVG icons.
const fromLucide = (Icon: IconType) => (props: SvgProps) => (
  <Icon strokeWidth={1.75} {...(props as IconBaseProps)} />
);


// Main application icon - A stylized wallet
export const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M21 12a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 12m18 0v6.25A2.25 2.25 0 0 1 18.75 20.5H5.25A2.25 2.25 0 0 1 3 18.25V12m18 0V9.75A2.25 2.25 0 0 0 18.75 7.5H5.25A2.25 2.25 0 0 0 3 9.75v2.25" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M15.75 9.75a1.5 1.5 0 0 1 1.5-1.5h.008a1.5 1.5 0 0 1 1.5 1.5v.008a1.5 1.5 0 0 1-1.5 1.5h-.008a1.5 1.5 0 0 1-1.5-1.5v-.008Z" 
      clipRule="evenodd" 
    />
  </svg>
);

// Icon for info toggles - A friendly question mark
export const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);

// Icon for AI tips - Fun sparkles
export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

// Icon for deleting items - A simple, clean trash bin
export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

// Icon for calendar features - A soft, rounded calendar
export const CalendarDaysIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
  </svg>
);

export const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);
export const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25c0 5.385 4.365 9.75 9.75 9.75 2.572 0 4.92-.99 6.697-2.648Z" />
    </svg>
);


// Empty state illustration - an empty receipt with placeholder lines and a "+" badge
export const EmptyStateIcon = (props: SvgProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" fill="none" {...props}>
    <ellipse cx="100" cy="132" rx="52" ry="8" fill="currentColor" className="text-slate-200 dark:text-slate-700" />
    <path
      d="M70 22H130A8 8 0 0 1 138 30V106L131.67 101L125.33 106L119 101L112.67 106L106.33 101L100 106L93.67 101L87.33 106L81 101L74.67 106L68.33 101L62 106V30A8 8 0 0 1 70 22Z"
      stroke="currentColor" strokeWidth="3" strokeLinejoin="round"
      className="text-slate-300 dark:text-slate-600"
    />
    <path d="M76 46H124M76 62H108M76 78H96" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-slate-300 dark:text-slate-600" />
    <circle cx="136" cy="96" r="16" fill="currentColor" className="text-indigo-500" />
    <path d="M136 89V103M129 96H143" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Goals - a target
export const GoalIcon = fromLucide(LuTarget);

// Savings - a piggy bank
export const PiggyBankIcon = fromLucide(LuPiggyBank);

// Log an expense - a receipt
export const ReceiptPlusIcon = fromLucide(LuReceiptText);

export const ChartPieIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
  </svg>
);

export const LayoutGridIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
);

export const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

export const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);


// Icons for categories. Keys are the names saved in each category, so the
// original names are kept (existing categories keep working) and new ones are added.
const CATEGORY_ICON_MAP: Record<string, IconType> = {
  // original names
  'briefcase': LuBriefcase,
  'receipt': LuReceipt,
  'heart': LuHeart,
  'shopping-bag': LuShoppingBag,
  'home': LuHouse,
  'bolt': LuZap,
  'film': LuFilm,
  'gift': LuGift,
  'plane': LuPlane,
  'currency-dollar': LuCircleDollarSign,
  'users': LuUsers,
  'banknotes': LuBanknote,
  'wrench': LuWrench,
  'musical-note': LuMusic,
  'academic-cap': LuGraduationCap,
  // new names
  'food': LuUtensils,
  'coffee': LuCoffee,
  'car': LuCar,
  'health': LuHeartPulse,
  'phone': LuSmartphone,
  'book': LuBookOpen,
  'fitness': LuDumbbell,
  'pet': LuPawPrint,
  'savings': LuPiggyBank,
};

export const CategoryIcon = ({ name, ...props }: { name: string } & SvgProps) => {
  const Icon = CATEGORY_ICON_MAP[name] ?? LuTag; // unknown names fall back to a tag
  return <Icon strokeWidth={1.75} {...(props as IconBaseProps)} />;
};
