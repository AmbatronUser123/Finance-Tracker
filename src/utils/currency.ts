// Money and date formatting, shared by the whole app.
// The choices (currency, number style, date style) come from the Settings page.

export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'SGD' | 'MYR' | 'THB';
export type NumberStyle = 'id' | 'en';
export type DateStyle = 'iso' | 'dmy' | 'mdy' | 'long';

// Only the way amounts are shown changes: values are never converted between currencies.
export const CURRENCIES: Record<CurrencyCode, { label: string; symbol: string; decimals: number }> = {
  IDR: { label: 'Indonesian Rupiah (Rp)', symbol: 'Rp', decimals: 0 },
  USD: { label: 'US Dollar ($)', symbol: '$', decimals: 2 },
  EUR: { label: 'Euro (€)', symbol: '€', decimals: 2 },
  SGD: { label: 'Singapore Dollar (S$)', symbol: 'S$', decimals: 2 },
  MYR: { label: 'Malaysian Ringgit (RM)', symbol: 'RM', decimals: 2 },
  THB: { label: 'Thai Baht (฿)', symbol: '฿', decimals: 2 },
};

interface FormatConfig {
  currency: CurrencyCode;
  numberStyle: NumberStyle;
  dateStyle: DateStyle;
}

let config: FormatConfig = { currency: 'IDR', numberStyle: 'id', dateStyle: 'iso' };

export const configureFormat = (next: Partial<FormatConfig>) => {
  config = { ...config, ...next };
};

/** 1234567.5 -> '1.234.567' (Indonesian) or '1,234,567' (English) */
export const formatNumber = (value: number, decimals = 0): string =>
  new Intl.NumberFormat(config.numberStyle === 'id' ? 'id-ID' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

/** Shows an amount in the chosen currency, e.g. 'Rp1.234.567' or '$1,234.50'. */
export const formatMoney = (amount: number): string => {
  const { symbol, decimals } = CURRENCIES[config.currency];
  const safe = Number.isFinite(amount) ? amount : 0;
  const negative = safe < 0 && Math.round(Math.abs(safe) * 10 ** decimals) > 0;
  return `${negative ? '-' : ''}${symbol}${formatNumber(Math.abs(safe), decimals)}`;
};

// The original name, still used all over the app.
export const formatRupiah = (amount: number): string => formatMoney(amount);

/** Shows a date in the chosen style. Accepts 'YYYY-MM-DD', an ISO timestamp, or a Date. */
const toLocalDate = (value: string | Date): Date => {
  if (value instanceof Date) return value;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
};

export const formatDate = (value: string | Date): string => {
  const d = toLocalDate(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  switch (config.dateStyle) {
    case 'dmy':
      return `${dd}/${mm}/${yyyy}`;
    case 'mdy':
      return `${mm}/${dd}/${yyyy}`;
    case 'long':
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
};

// Parse Rupiah string back to number
export const parseRupiah = (value: string): number => {
  if (!value) return 0;
  const number = value.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(number) || 0;
};
