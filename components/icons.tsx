import React from 'react';

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

export const EmptyStateIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" {...props}>
        <g opacity="0.6">
            <path d="M100 135.5c-44.18 0-80-17.91-80-40s35.82-40 80-40 80 17.91 80 40-35.82 40-80 40z" fill="currentColor" className="text-slate-300"/>
            <path d="M129.5 76.5c-4.42 0-8-1.57-8-3.5s3.58-3.5 8-3.5 8 1.57 8 3.5-3.58 3.5-8 3.5zM70.5 76.5c-4.42 0-8-1.57-8-3.5s3.58-3.5 8-3.5 8 1.57 8 3.5-3.58 3.5-8 3.5z" fill="currentColor" className="text-slate-400"/>
            <path d="M100 87.5a16 16 0 00-15.84 13.13c-2.43-.8-4.59-2.14-6.3-3.88-1.2-1.2-2.07-2.67-2.5-4.25h49.28c-.43 1.58-1.3 3.05-2.5 4.25-1.71 1.74-3.87 3.08-6.3 3.88A16 16 0 00100 87.5z" fill="currentColor" className="text-slate-400"/>
            <path d="M158.5,49.5 C158.5,49.5 167,31 146.5,23 C126,15 130.5,33 130.5,33 C130.5,33 138,15 117.5,7 C97, -1 101.5,17 101.5,17 C101.5,17 109, -1 88.5,7 C68,15 72.5,33 72.5,33 C72.5,33 80,15 59.5,23 C39,31 47.5,49.5 47.5,49.5" fill="none" stroke="currentColor" className="text-slate-300" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
    </svg>
);

export const GoalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.82m5.84-2.56a12.022 12.022 0 0 0-5.84 0m5.84 0a12.023 12.023 0 0 1 3.822 5.84M12 2.25a8.963 8.963 0 0 0-8.963 8.963c0 4.953 4.01 8.963 8.963 8.963s8.963-4.01 8.963-8.963A8.963 8.963 0 0 0 12 2.25Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
    </svg>
);

export const PiggyBankIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-3.75v3.75m3-2.25v2.25m3-3.75v3.75M3 13.5v-3c0-.921.728-1.664 1.638-1.72 1.258-.087 2.378-.45 3.362-1.023.984-.572 1.638-1.579 1.638-2.73C9.638 3.34 8.246 2.25 6.75 2.25H4.5c-1.24 0-2.25.989-2.25 2.25v2.25M12 15V9.75m0 5.25c.456.456.994.824 1.57.143.576.68.994 1.57.994 2.507C14.56 20.66 12.24 22.5 9.75 22.5 7.26 22.5 5 20.66 5 18.157c0-.937.418-1.827.994-2.507.576-.68.994-1.57.994-2.507C7 9.994 7.418 9.104 8.006 8.56c.588-.543 1.34-1.01 2.14-1.393M21 13.5v-3c0-.921-.728-1.664-1.638-1.72-1.258-.087-2.378-.45-3.362-1.023-.984-.572-1.638-1.579-1.638-2.73 0-1.493 1.392-2.58 2.88-2.58H19.5c1.24 0 2.25.989 2.25 2.25v2.25" />
  </svg>
);

export const ReceiptPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h1.5v.75h-1.5v-.75Z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18.75c0-1.036.84-1.875 1.875-1.875h1.5c1.036 0 1.875.84 1.875 1.875v.75H6v-.75Z" />
  </svg>
);

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

// Generic Icons for Categories
const iconPaths: { [key: string]: string } = {
  'briefcase': "M13.5 16.5V15a1.5 1.5 0 0 0-3 0v1.5m0 0v1.5a1.5 1.5 0 0 0 3 0V16.5m0 0h.008v.008h-.008V16.5Zm-6.75-1.125a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm1.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
  'receipt': "M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-1.5m3 0h.75m-4.5 0v.75m0-3v.75m0-3v.75m0-3v.75m3 6v-1.5m0 1.5v-1.5m0 0v-1.5m0 0V6m6 12v-1.5m0 1.5v-1.5m0 0v-1.5m0 0V6",
  'heart': "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z",
  'shopping-bag': "M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z",
  'home': "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  'bolt': "m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z",
  'film': "M9.812 6.188c.355-.133.72-.25 1.088-.344l1.838-.275a2.25 2.25 0 0 1 2.22 1.993l.276 1.84a2.25 2.25 0 0 0 1.992 2.22l1.84.275a2.25 2.25 0 0 1 .343 1.088c-.133.355-.25.72-.344 1.088l-.275 1.838a2.25 2.25 0 0 1-1.993 2.22l-1.839.276a2.25 2.25 0 0 0-2.22 1.992l-.276 1.84a2.25 2.25 0 0 1-1.088.343c-.355.133-.72.25-1.088.344l-1.838.275a2.25 2.25 0 0 1-2.22-1.993l-.276-1.84a2.25 2.25 0 0 0-1.992-2.22l-1.84-.275a2.25 2.25 0 0 1-.343-1.088c.133-.355.25-.72.344-1.088l.275-1.838a2.25 2.25 0 0 1 1.993-2.22l1.839-.276a2.25 2.25 0 0 0 2.22-1.992l.276-1.84a2.25 2.25 0 0 1 1.088-.343Z",
  'gift': "M12.75 3.375v4.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-4.5h3Zm-3.75 0v4.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75v-4.5h3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-3.75v1.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75v-1.5h3A2.25 2.25 0 0 0 21 9.375v-1.5A2.25 2.25 0 0 0 18.75 6h-3.75V3.375c0-1.036-.84-1.875-1.875-1.875h-1.5c-1.036 0-1.875.84-1.875 1.875ZM9 3.375v4.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75v-4.5H9Zm-3.75 0v4.5a.75.75 0 0 0 .75.75H7.5a.75.75 0 0 0 .75-.75v-4.5H4.5v1.5A2.25 2.25 0 0 0 6.75 9h3.75v1.5a.75.75 0 0 1-.75.75H8.25a.75.75 0 0 1-.75-.75v-1.5H3.75A2.25 2.25 0 0 1 1.5 9.375v-1.5A2.25 2.25 0 0 1 3.75 6H9V3.375c0-1.036.84-1.875 1.875-1.875h1.5C13.16 1.5 14 .34 14 1.875v1.5h3.75Z",
  'plane': "M12.75 15.5V17.25a.75.75 0 0 1-1.5 0V15.5m0 0V11.25m0 4.25h-3.375c-.621 0-1.125-.504-1.125-1.125V11.25m1.5 0h.008v.008H9.875m1.5 0h.008v.008h-.008m1.5 0h.008v.008h-.008m1.5 0h.008v.008h-.008M12.75 11.25h3.375c.621 0 1.125.504 1.125 1.125V14.25m-1.5 0h-.008v-.008h.008m-1.5 0h-.008v-.008h.008m-1.5 0h-.008v-.008h.008m-1.5 0h-.008v-.008h.008m6.375-3.375-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5",
  'currency-dollar': "M12 6v12m0 0c-2.485 0-4.5-1.343-4.5-3s2.015-3 4.5-3 4.5 1.343 4.5 3-2.015 3-4.5 3Zm-3-1.5h6",
  'users': "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.063l.162-.162a3.75 3.75 0 0 0-5.303-5.304l-.162.162a9.337 9.337 0 0 0-2.063 4.121v1.737Z M8.379 16.121a3.75 3.75 0 0 0 5.303-5.303l-1.62-1.62a9.337 9.337 0 0 0-4.121 2.063l-.162.162a3.75 3.75 0 0 0 5.303 5.304l1.62-1.62Z M3.75 9.75a3.75 3.75 0 0 1 3.75-3.75h1.5a3.75 3.75 0 0 1 3.75 3.75v1.5a3.75 3.75 0 0 1-3.75 3.75h-1.5a3.75 3.75 0 0 1-3.75-3.75v-1.5Z",
  'banknotes': "M13.5 16.5V15a1.5 1.5 0 0 0-3 0v1.5m0 0v1.5a1.5 1.5 0 0 0 3 0V16.5m0 0h.008v.008h-.008V16.5Zm-3.375-3.375a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM6.75 13.125a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6.375-3.375a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z",
  'wrench': "M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-6-6v-1.5a6 6 0 0 1 6-6h1.5a6 6 0 0 1 6 6m-4.5-3a1.5 1.5 0 0 0-1.5-1.5h-1.5a1.5 1.5 0 0 0-1.5 1.5v1.5a1.5 1.5 0 0 0 1.5 1.5h1.5a1.5 1.5 0 0 0 1.5-1.5v-1.5Z",
  'musical-note': "m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-3.75a2.25 2.25 0 0 1 2.25-2.25H19.5ZM9 9v10.5",
  'academic-cap': "M6.75 15.75L3 12m0 0 3.75-3.75M3 12h18"
};

export const CategoryIcon = ({ name, ...props }: { name: string } & React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        {iconPaths[name] && <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[name]} />}
    </svg>
);