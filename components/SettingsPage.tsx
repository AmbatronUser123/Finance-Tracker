import React from 'react';
import { AppSettings, DashboardSections, TextSize } from '../src/utils/settings';
import { ACCENT_PALETTES, AccentName } from '../src/utils/accentPalettes';
import { CURRENCIES, CurrencyCode, DateStyle, NumberStyle, formatDate, formatMoney } from '../src/utils/currency';

interface SettingsPageProps {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
  onSectionChange: (key: keyof DashboardSections, value: boolean) => void;
  onReset: () => void;
}

const cardClass = 'bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30 p-5 space-y-4';
const titleClass = 'text-xl font-bold text-slate-900 dark:text-slate-100';
const labelClass = 'block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200';
const fieldClass =
  'w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none';
const hintClass = 'text-xs text-slate-500 dark:text-slate-400';

const ACCENT_LABELS: Record<AccentName, string> = {
  indigo: 'Indigo',
  blue: 'Blue',
  emerald: 'Emerald',
  rose: 'Rose',
  amber: 'Amber',
  violet: 'Violet',
};

const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const SECTION_LABELS: { key: keyof DashboardSections; label: string }[] = [
  { key: 'cycle', label: 'Pay cycle card' },
  { key: 'summary', label: 'Income, expenses and savings cards' },
  { key: 'categories', label: 'Top categories' },
  { key: 'goals', label: 'Saving goals' },
  { key: 'sources', label: 'Sources breakdown' },
  { key: 'recent', label: 'Recent transactions' },
];

const DATE_STYLES: { value: DateStyle; label: string }[] = [
  { value: 'iso', label: '2026-11-09' },
  { value: 'dmy', label: '09/11/2026' },
  { value: 'mdy', label: '11/09/2026' },
  { value: 'long', label: '9 Nov 2026' },
];

const NUMBER_STYLES: { value: NumberStyle; label: string }[] = [
  { value: 'id', label: '1.234.567,89 (Indonesian)' },
  { value: 'en', label: '1,234,567.89 (English)' },
];

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onChange, onSectionChange, onReset }) => {
  const segmentClass = (active: boolean) =>
    `px-3 py-1.5 text-sm rounded-lg ${
      active
        ? 'bg-accent-600 text-white'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
    }`;

  const checkboxClass = 'h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Look */}
      <div className={cardClass}>
        <h3 className={titleClass}>Look</h3>

        <div>
          <p className={labelClass}>Accent color</p>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(ACCENT_PALETTES) as AccentName[]).map(name => (
              <button
                key={name}
                type="button"
                onClick={() => onChange({ accent: name })}
                aria-label={`${ACCENT_LABELS[name]} accent`}
                aria-pressed={settings.accent === name}
                title={ACCENT_LABELS[name]}
                className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ${
                  settings.accent === name ? 'ring-slate-900 dark:ring-white' : 'ring-transparent'
                }`}
                style={{ backgroundColor: `rgb(${ACCENT_PALETTES[name][500]})` }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className={labelClass}>Text size</p>
          <div className="flex gap-2">
            {TEXT_SIZES.map(size => (
              <button key={size.value} type="button" onClick={() => onChange({ textSize: size.value })} className={segmentClass(settings.textSize === size.value)}>
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
          <input type="checkbox" checked={settings.compact} onChange={(e) => onChange({ compact: e.target.checked })} className={checkboxClass} />
          Compact layout (tighter spacing, fits more on screen)
        </label>
      </div>

      {/* You */}
      <div className={cardClass}>
        <h3 className={titleClass}>You</h3>
        <div>
          <label className={labelClass} htmlFor="settings-name">Your name</label>
          <input
            id="settings-name"
            value={settings.userName}
            maxLength={30}
            onChange={(e) => onChange({ userName: e.target.value })}
            placeholder="e.g. Dawsan"
            className={fieldClass}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
          <input type="checkbox" checked={settings.showGreeting} onChange={(e) => onChange({ showGreeting: e.target.checked })} className={checkboxClass} />
          Show a greeting on the Dashboard
        </label>
      </div>

      {/* Dashboard */}
      <div className={cardClass}>
        <h3 className={titleClass}>Dashboard</h3>
        <p className={hintClass}>Choose which parts of the Dashboard are shown.</p>
        <div className="space-y-2">
          {SECTION_LABELS.map(section => (
            <label key={section.key} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dashboardSections[section.key]}
                onChange={(e) => onSectionChange(section.key, e.target.checked)}
                className={checkboxClass}
              />
              {section.label}
            </label>
          ))}
        </div>
      </div>

      {/* Formats */}
      <div className={cardClass}>
        <h3 className={titleClass}>Formats</h3>

        <div>
          <label className={labelClass} htmlFor="settings-currency">Currency</label>
          <select id="settings-currency" value={settings.currency} onChange={(e) => onChange({ currency: e.target.value as CurrencyCode })} className={fieldClass}>
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map(code => (
              <option key={code} value={code}>{CURRENCIES[code].label}</option>
            ))}
          </select>
          <p className={`${hintClass} mt-1`}>Only the way amounts are shown changes. Your numbers are never converted between currencies.</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="settings-number">Number style</label>
          <select id="settings-number" value={settings.numberStyle} onChange={(e) => onChange({ numberStyle: e.target.value as NumberStyle })} className={fieldClass}>
            {NUMBER_STYLES.map(style => (
              <option key={style.value} value={style.value}>{style.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="settings-date">Date style</label>
          <select id="settings-date" value={settings.dateStyle} onChange={(e) => onChange({ dateStyle: e.target.value as DateStyle })} className={fieldClass}>
            {DATE_STYLES.map(style => (
              <option key={style.value} value={style.value}>{style.label}</option>
            ))}
          </select>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-3 text-sm text-slate-700 dark:text-slate-200">
          Preview: <span className="font-semibold">{formatMoney(1234567.89)}</span> · <span className="font-semibold">{formatDate('2026-11-09')}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={hintClass}>Settings are saved on this device only, so your phone and laptop can look different.</p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all settings to their defaults?')) onReset();
          }}
          className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 rounded-lg"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
