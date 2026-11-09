import { CURRENCIES, CurrencyCode, DateStyle, NumberStyle } from './currency';
import { ACCENT_PALETTES, AccentName } from './accentPalettes';

export type TextSize = 'small' | 'medium' | 'large';

export interface DashboardSections {
  cycle: boolean;       // the pay cycle card
  summary: boolean;     // income / expenses / savings cards
  categories: boolean;  // top categories
  goals: boolean;       // saving goals
  sources: boolean;     // sources breakdown
  recent: boolean;      // recent transactions
}

export interface AppSettings {
  accent: AccentName;
  textSize: TextSize;
  compact: boolean;
  userName: string;
  showGreeting: boolean;
  dashboardSections: DashboardSections;
  currency: CurrencyCode;
  numberStyle: NumberStyle;
  dateStyle: DateStyle;
}

export const DEFAULT_SETTINGS: AppSettings = {
  accent: 'indigo',
  textSize: 'medium',
  compact: false,
  userName: '',
  showGreeting: true,
  dashboardSections: { cycle: true, summary: true, categories: true, goals: true, sources: true, recent: true },
  currency: 'IDR',
  numberStyle: 'id',
  dateStyle: 'iso',
};

const TEXT_SIZE_PERCENT: Record<TextSize, string> = { small: '87.5%', medium: '100%', large: '112.5%' };

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

/** Fills in anything missing (older saves, new options) and ignores values that are not valid. */
export const mergeSettings = (stored: Partial<AppSettings> | null | undefined): AppSettings => {
  const s = (stored && typeof stored === 'object' ? stored : {}) as Partial<AppSettings>;
  const savedSections = (s.dashboardSections && typeof s.dashboardSections === 'object' ? s.dashboardSections : {}) as Partial<DashboardSections>;
  const d = DEFAULT_SETTINGS;

  const dashboardSections: DashboardSections = { ...d.dashboardSections };
  (Object.keys(dashboardSections) as (keyof DashboardSections)[]).forEach(key => {
    if (typeof savedSections[key] === 'boolean') dashboardSections[key] = savedSections[key] as boolean;
  });

  return {
    accent: pick(s.accent, Object.keys(ACCENT_PALETTES) as AccentName[], d.accent),
    textSize: pick(s.textSize, ['small', 'medium', 'large'] as const, d.textSize),
    compact: typeof s.compact === 'boolean' ? s.compact : d.compact,
    userName: typeof s.userName === 'string' ? s.userName.slice(0, 30) : d.userName,
    showGreeting: typeof s.showGreeting === 'boolean' ? s.showGreeting : d.showGreeting,
    dashboardSections,
    currency: pick(s.currency, Object.keys(CURRENCIES) as CurrencyCode[], d.currency),
    numberStyle: pick(s.numberStyle, ['id', 'en'] as const, d.numberStyle),
    dateStyle: pick(s.dateStyle, ['iso', 'dmy', 'mdy', 'long'] as const, d.dateStyle),
  };
};

/** Applies the look-and-feel settings to the whole page. */
export const applyAppearance = (s: AppSettings) => {
  const root = document.documentElement;
  Object.entries(ACCENT_PALETTES[s.accent]).forEach(([shade, rgb]) => root.style.setProperty(`--accent-${shade}`, rgb));
  root.style.fontSize = TEXT_SIZE_PERCENT[s.textSize];
  root.classList.toggle('compact', s.compact);
};
