import React, { useEffect, useState } from 'react';
import { FiLock, FiShield, FiKey, FiPower } from 'react-icons/fi';
import { loadConfig, saveConfig, clearConfig, verifyPin, newSalt, hashPin, bioAvailable, bioRegister, LOCK_EVENT, LockConfig } from '../appLockCore';

type Flow = null | 'enable' | 'disable' | 'change';
const input = 'w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100';
const btn = 'h-10 px-4 rounded-lg text-sm font-medium transition disabled:opacity-40';
const primary = btn + ' bg-accent-600 text-white hover:bg-accent-700';
const ghost = btn + ' border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';

const AppLockSettings: React.FC = () => {
  const [config, setConfig] = useState<LockConfig | null>(loadConfig);
  const [flow, setFlow] = useState<Flow>(null);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [bio, setBio] = useState(false);

  useEffect(() => { bioAvailable().then(setBio); }, []);
  const refresh = () => setConfig(loadConfig());
  const reset = () => { setFlow(null); setCur(''); setNext(''); setConfirm(''); setErr(''); };

  const validNew = next.length >= 4 && next.length <= 8 && /^\d+$/.test(next) && next === confirm;

  const enable = async () => {
    if (!validNew) { setErr('PIN must be 4–8 digits and match.'); return; }
    setBusy(true);
    try { const salt = newSalt(); saveConfig({ salt, hash: await hashPin(next, salt), idleMinutes: 5 }); refresh(); reset(); }
    catch { setErr('Could not save PIN.'); }
    setBusy(false);
  };
  const disable = async () => {
    if (!config) return;
    setBusy(true);
    try { if (await verifyPin(cur, config)) { clearConfig(); refresh(); reset(); } else setErr('Wrong PIN.'); }
    catch { setErr('Could not verify.'); }
    setBusy(false);
  };
  const change = async () => {
    if (!config) return;
    if (!validNew) { setErr('New PIN must be 4–8 digits and match.'); return; }
    setBusy(true);
    try {
      if (!(await verifyPin(cur, config))) { setErr('Wrong current PIN.'); setBusy(false); return; }
      const salt = newSalt(); saveConfig({ ...config, salt, hash: await hashPin(next, salt) }); refresh(); reset();
    } catch { setErr('Could not change PIN.'); }
    setBusy(false);
  };
  const addBio = async () => { if (!config) return; try { const id = await bioRegister(); saveConfig({ ...config, biometricId: id }); refresh(); } catch {} };

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FiLock className="text-accent-600" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">App Lock</h2>
        </div>
        <span className={'text-xs px-2 py-1 rounded-full ' + (config ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400')}>
          {config ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Optional PIN / biometric gate. Auto-locks after 5 minutes idle.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {!config && <button type="button" className={primary} onClick={() => { reset(); setFlow('enable'); }}>Enable App Lock</button>}
        {config && <button type="button" className={ghost} onClick={() => { reset(); setFlow('disable'); }}>Disable</button>}
        {config && <button type="button" className={ghost} onClick={() => { reset(); setFlow('change'); }}><span className="inline-flex items-center gap-1"><FiKey /> Change PIN</span></button>}
        {config && <button type="button" className={ghost} onClick={() => window.dispatchEvent(new Event(LOCK_EVENT))}><span className="inline-flex items-center gap-1"><FiPower /> Lock Now</span></button>}
        {config && bio && !config.biometricId && <button type="button" className={ghost} onClick={addBio}><span className="inline-flex items-center gap-1"><FiShield /> Add biometrics</span></button>}
      </div>

      {flow === 'enable' && (
        <div className="mt-4 space-y-2">
          <input className={input} type="password" inputMode="numeric" placeholder="New PIN (4–8 digits)" value={next} onChange={e => setNext(e.target.value.replace(/\D/g, '').slice(0, 8))} />
          <input className={input} type="password" inputMode="numeric" placeholder="Confirm PIN" value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 8))} />
          <div className="flex gap-2"><button type="button" className={primary} disabled={busy || !validNew} onClick={enable}>Save PIN</button><button type="button" className={ghost} onClick={reset}>Cancel</button></div>
        </div>
      )}
      {flow === 'disable' && (
        <div className="mt-4 space-y-2">
          <input className={input} type="password" inputMode="numeric" placeholder="Current PIN" value={cur} onChange={e => setCur(e.target.value.replace(/\D/g, '').slice(0, 8))} />
          <div className="flex gap-2"><button type="button" className={primary} disabled={busy || cur.length < 4} onClick={disable}>Disable lock</button><button type="button" className={ghost} onClick={reset}>Cancel</button></div>
        </div>
      )}
      {flow === 'change' && (
        <div className="mt-4 space-y-2">
          <input className={input} type="password" inputMode="numeric" placeholder="Current PIN" value={cur} onChange={e => setCur(e.target.value.replace(/\D/g, '').slice(0, 8))} />
          <input className={input} type="password" inputMode="numeric" placeholder="New PIN (4–8 digits)" value={next} onChange={e => setNext(e.target.value.replace(/\D/g, '').slice(0, 8))} />
          <input className={input} type="password" inputMode="numeric" placeholder="Confirm new PIN" value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 8))} />
          <div className="flex gap-2"><button type="button" className={primary} disabled={busy || cur.length < 4 || !validNew} onClick={change}>Change PIN</button><button type="button" className={ghost} onClick={reset}>Cancel</button></div>
        </div>
      )}
      {err && <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">{err}</p>}
    </section>
  );
};
export default AppLockSettings;