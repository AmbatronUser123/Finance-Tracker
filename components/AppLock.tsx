import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiLock, FiDelete, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { loadConfig, saveConfig, loadGuard, clearGuard, recordFail, remainingSeconds, verifyPin, wipeAllAppData, bioAvailable, bioRegister, bioVerify, LOCK_EVENT, CONFIG_EVENT, LockConfig } from '../appLockCore';

const PinPad: React.FC<{ value: string; onChange: (v: string) => void; onSubmit: () => void; disabled?: boolean }> = ({ value, onChange, onSubmit, disabled }) => {
  const press = (d: string) => { if (!disabled && value.length < 8) onChange(value + d); };
  const back = () => { if (!disabled) onChange(value.slice(0, -1)); };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (disabled) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') back();
      else if (e.key === 'Enter' && value.length >= 4) onSubmit();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [value, onSubmit, disabled]);
  const key = 'h-14 rounded-xl text-xl font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition disabled:opacity-40';
  return (
    <div className="w-full">
      <div className="flex justify-center gap-3 h-8 mb-6" aria-live="polite">
        {value.length === 0
          ? [0, 1, 2, 3].map(i => <span key={i} className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />)
          : value.split('').map((_, i) => <span key={i} className="w-3 h-3 rounded-full bg-accent-600" />)}
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
        {['1','2','3','4','5','6','7','8','9'].map(d => <button key={d} type="button" disabled={disabled} onClick={() => press(d)} className={key}>{d}</button>)}
        <span />
        <button type="button" disabled={disabled} onClick={() => press('0')} className={key}>0</button>
        <button type="button" disabled={disabled} onClick={back} aria-label="Delete" className={key + ' flex items-center justify-center'}><FiDelete className="w-5 h-5" /></button>
      </div>
      <button type="button" disabled={disabled || value.length < 4} onClick={onSubmit}
        className="mt-6 w-full max-w-[260px] mx-auto block h-12 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 disabled:opacity-40 transition">
        Unlock
      </button>
    </div>
  );
};

const AppLock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<LockConfig | null>(loadConfig);
  const [locked, setLocked] = useState(() => !!loadConfig());
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [bio, setBio] = useState(false);
  const [remaining, setRemaining] = useState(() => remainingSeconds(loadGuard()));
  const [showReset, setShowReset] = useState(false);
  const [erase, setErase] = useState('');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => { bioAvailable().then(setBio); }, []);

  useEffect(() => {
    const onConfig = () => { const c = loadConfig(); setConfig(c); if (!c) { setLocked(false); setShowReset(false); } };
    const onLock = () => { if (loadConfig()) { setLocked(true); setPin(''); setErr(''); setShowReset(false); setRemaining(remainingSeconds(loadGuard())); } };
    window.addEventListener(CONFIG_EVENT, onConfig);
    window.addEventListener(LOCK_EVENT, onLock);
    return () => { window.removeEventListener(CONFIG_EVENT, onConfig); window.removeEventListener(LOCK_EVENT, onLock); };
  }, []);

  useEffect(() => {
    if (!locked) return;
    const t = window.setInterval(() => setRemaining(remainingSeconds(loadGuard())), 250);
    return () => window.clearInterval(t);
  }, [locked]);

  const lock = useCallback(() => { if (loadConfig()) { setLocked(true); setPin(''); setErr(''); setRemaining(remainingSeconds(loadGuard())); } }, []);
  useEffect(() => {
    if (locked || !config) return;
    const reset = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(lock, config.idleMinutes * 60000); };
    const evs: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    evs.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => { evs.forEach(e => window.removeEventListener(e, reset)); window.clearTimeout(timer.current); };
  }, [locked, config, lock]);

  const submit = async () => {
    if (!config || remaining > 0) return;
    setErr(''); setBusy(true);
    try {
      if (await verifyPin(pin, config)) { clearGuard(); setRemaining(0); setLocked(false); setPin(''); }
      else { const g = recordFail(); setRemaining(remainingSeconds(g)); setPin(''); setErr(remainingSeconds(g) > 0 ? '' : 'Wrong PIN.'); }
    } catch { setErr('Something went wrong. Try again.'); }
    setBusy(false);
  };

  const useBio = async () => {
    if (!config?.biometricId) return;
    setBusy(true); setErr('');
    try { if (await bioVerify(config.biometricId)) { clearGuard(); setRemaining(0); setLocked(false); setPin(''); } else setErr('Biometric check failed.'); }
    catch { setErr('Biometric unavailable. Use your PIN.'); }
    setBusy(false);
  };

  const enableBio = async () => {
    if (!config) return;
    try { const id = await bioRegister(); saveConfig({ ...config, biometricId: id }); } catch {}
  };

  const doWipe = () => { if (erase === 'ERASE') { wipeAllAppData(); window.location.reload(); } };

  if (!locked) return <>{children}</>;

  const cooling = remaining > 0;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 overflow-y-auto">
      <div className="w-full max-w-sm text-center py-8">
        <div className="mx-auto mb-5 w-12 h-12 rounded-2xl bg-accent-600/10 text-accent-600 flex items-center justify-center"><FiLock className="w-6 h-6" /></div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Enter your PIN</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500 dark:text-slate-400">Your data stays on this device.</p>

        {cooling && (
          <div role="alert" className="mb-5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            Too many attempts. Try again in <span className="font-semibold tabular-nums">{remaining}s</span>
          </div>
        )}

        <PinPad value={pin} onChange={v => { setPin(v); setErr(''); }} onSubmit={submit} disabled={cooling || busy} />
        {err && <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">{err}</p>}

        {config?.biometricId && bio && !cooling && (
          <button type="button" disabled={busy} onClick={useBio} className="mt-4 inline-flex items-center gap-2 text-sm text-accent-600 hover:underline"><FiShield /> Unlock with biometrics</button>
        )}
        {bio && !config?.biometricId && !cooling && (
          <button type="button" onClick={enableBio} className="mt-4 block mx-auto text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Enable biometrics for next time</button>
        )}

        {!showReset ? (
          <button type="button" onClick={() => setShowReset(true)} className="mt-6 block mx-auto text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Forgot PIN? Reset lock</button>
        ) : (
          <div className="mt-6 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-left">
            <div className="flex items-start gap-2 text-red-700 dark:text-red-300 text-sm font-medium"><FiAlertTriangle className="mt-0.5 shrink-0" /> This permanently deletes ALL financial data on this device (transactions, budgets, categories, sources, goals, debts). It cannot be undone.</div>
            <label className="mt-3 block text-xs text-red-700 dark:text-red-300" htmlFor="erase-confirm">Type ERASE to confirm</label>
            <input id="erase-confirm" value={erase} onChange={e => setErase(e.target.value)} autoComplete="off"
              className="mt-1 w-full h-10 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100" placeholder="ERASE" />
            <div className="mt-3 flex gap-2">
              <button type="button" disabled={erase !== 'ERASE'} onClick={doWipe}
                className="flex-1 h-10 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-40">Erase everything</button>
              <button type="button" onClick={() => { setShowReset(false); setErase(''); }}
                className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AppLock;