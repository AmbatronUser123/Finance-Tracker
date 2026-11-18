import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiLock, FiDelete, FiShield } from 'react-icons/fi';

type LockConfig = { salt: string; hash: string; biometricId?: string; idleMinutes: number };
const KEY = 'ft.applock.v1';
const enc = new TextEncoder();
const b64 = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer;

const load = (): LockConfig | null => { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
const save = (c: LockConfig) => localStorage.setItem(KEY, JSON.stringify(c));
const clear = () => localStorage.removeItem(KEY);

async function hashPin(pin: string, salt: string) {
  const km = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new Uint8Array(unb64(salt)), iterations: 150000, hash: 'SHA-256' }, km, 256);
  return b64(bits);
}
const newSalt = () => b64(crypto.getRandomValues(new Uint8Array(16)).buffer);

async function bioAvailable() {
  try { return !!window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); } catch { return false; }
}
async function bioRegister() {
  const cred = await navigator.credentials.create({ publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    rp: { name: 'Finance Tracker' },
    user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'local', displayName: 'Finance Tracker' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
    timeout: 60000, attestation: 'none',
  }}) as PublicKeyCredential | null;
  if (!cred) throw new Error('cancelled');
  return b64(cred.rawId);
}
async function bioVerify(id: string) {
  const a = await navigator.credentials.get({ publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    allowCredentials: [{ type: 'public-key', id: new Uint8Array(unb64(id)) }],
    userVerification: 'required', timeout: 60000,
  }});
  return !!a;
}

const PinPad: React.FC<{ value: string; onChange: (v: string) => void; onSubmit: () => void; busy?: boolean }> = ({ value, onChange, onSubmit, busy }) => {
  const press = (d: string) => { if (value.length < 8) onChange(value + d); };
  const back = () => onChange(value.slice(0, -1));
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') back();
      else if (e.key === 'Enter' && value.length >= 4) onSubmit();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [value, onSubmit]);
  return (
    <div className="w-full">
      <div className="flex justify-center gap-3 h-8 mb-6" aria-live="polite">
        {value.length === 0
          ? [0, 1, 2, 3].map(i => <span key={i} className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />)
          : value.split('').map((_, i) => <span key={i} className="w-3 h-3 rounded-full bg-accent-600" />)}
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
        {['1','2','3','4','5','6','7','8','9'].map(d => (
          <button key={d} type="button" disabled={busy} onClick={() => press(d)}
            className="h-14 rounded-xl text-xl font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition disabled:opacity-50">{d}</button>
        ))}
        <span />
        <button type="button" disabled={busy} onClick={() => press('0')}
          className="h-14 rounded-xl text-xl font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition disabled:opacity-50">0</button>
        <button type="button" disabled={busy} onClick={back} aria-label="Delete"
          className="h-14 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition disabled:opacity-50"><FiDelete className="w-5 h-5" /></button>
      </div>
      <button type="button" disabled={busy || value.length < 4} onClick={onSubmit}
        className="mt-6 w-full max-w-[260px] mx-auto block h-12 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 disabled:opacity-40 transition">
        {busy ? 'Please wait…' : 'Continue'}
      </button>
    </div>
  );
};

const AppLock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<LockConfig | null>(load);
  const [locked, setLocked] = useState(true);
  const [mode, setMode] = useState<'setup' | 'confirm' | 'biometric' | 'unlock'>(config ? 'unlock' : 'setup');
  const [pin, setPin] = useState('');
  const [pending, setPending] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [bio, setBio] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => { bioAvailable().then(setBio); }, []);

  const lock = useCallback(() => { if (load()) { setLocked(true); setMode('unlock'); setPin(''); setErr(''); } }, []);
  useEffect(() => {
    const h = () => lock();
    window.addEventListener('ft:lock', h);
    return () => window.removeEventListener('ft:lock', h);
  }, [lock]);

  useEffect(() => {
    if (locked || !config) return;
    const reset = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(lock, config.idleMinutes * 60000); };
    const evs: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    evs.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => { evs.forEach(e => window.removeEventListener(e, reset)); window.clearTimeout(timer.current); };
  }, [locked, config, lock]);

    const submit = async () => {
    setErr(''); setBusy(true);
    try {
      if (mode === 'setup') { setPending(pin); setPin(''); setMode('confirm'); }
      else if (mode === 'confirm') {
        if (pin !== pending) { setErr('PINs don’t match. Try again.'); setPin(''); setMode('setup'); setPending(''); }
        else {
          const salt = newSalt(); const hash = await hashPin(pin, salt);
          const c: LockConfig = { salt, hash, idleMinutes: 5 }; save(c); setConfig(c); setPin('');
          const supported = await bioAvailable(); setBio(supported);
          if (supported) setMode('biometric'); else setLocked(false);
        }
      }
      else if (mode === 'unlock' && config) {
        const h = await hashPin(pin, config.salt);
        if (h === config.hash) {
          setPin('');
          const supported = await bioAvailable(); setBio(supported);
          if (supported && !config.biometricId) setMode('biometric'); else setLocked(false);
        } else { setErr('Wrong PIN.'); setPin(''); }
      }
    } catch { setErr('Something went wrong. Try again.'); }
    setBusy(false);
  };

  const enableBio = async () => {
    if (!config) return; setBusy(true);
    try { const id = await bioRegister(); const c = { ...config, biometricId: id }; save(c); setConfig(c); setLocked(false); }
    catch { setLocked(false); }
    setBusy(false);
  };
  const useBio = async () => {
    if (!config?.biometricId) return; setBusy(true); setErr('');
    try { if (await bioVerify(config.biometricId)) { setLocked(false); setPin(''); } else setErr('Biometric check failed.'); }
    catch { setErr('Biometric unavailable. Use your PIN.'); }
    setBusy(false);
  };
  const resetLock = () => {
    if (window.confirm('Reset the app lock? Your finance data stays, but the PIN is removed.')) { clear(); setConfig(null); setMode('setup'); setPin(''); setErr(''); setLocked(true); }
  };

  if (!locked) return <>{children}</>;

  const title = mode === 'setup' ? 'Create a PIN' : mode === 'confirm' ? 'Confirm your PIN' : mode === 'biometric' ? 'Add biometric unlock' : 'Enter your PIN';
  const sub = mode === 'setup' ? '4–8 digits. Keeps your finances private on this device.' : mode === 'confirm' ? 'Type it once more to be sure.' : mode === 'biometric' ? 'Use fingerprint or face instead of typing.' : 'Your data stays on this device.';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 w-12 h-12 rounded-2xl bg-accent-600/10 text-accent-600 flex items-center justify-center"><FiLock className="w-6 h-6" /></div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500 dark:text-slate-400">{sub}</p>

        {mode === 'biometric' ? (
          <div className="space-y-3">
            <button type="button" disabled={busy} onClick={enableBio} className="w-full h-12 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 disabled:opacity-40 flex items-center justify-center gap-2"><FiShield /> Enable biometrics</button>
            <button type="button" disabled={busy} onClick={() => setLocked(false)} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Skip for now</button>
          </div>
        ) : (
          <>
            <PinPad value={pin} onChange={v => { setPin(v); setErr(''); }} onSubmit={submit} busy={busy} />
            {err && <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">{err}</p>}
            {mode === 'unlock' && config?.biometricId && bio && (
              <button type="button" disabled={busy} onClick={useBio} className="mt-4 inline-flex items-center gap-2 text-sm text-accent-600 hover:underline"><FiShield /> Unlock with biometrics</button>
            )}
            {mode === 'unlock' && (
              <button type="button" onClick={resetLock} className="mt-6 block mx-auto text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Forgot PIN? Reset lock</button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default AppLock;