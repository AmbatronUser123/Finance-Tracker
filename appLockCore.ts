export const CONFIG_KEY = 'ft.applock.v1';
export const GUARD_KEY = 'ft.applock.guard.v1';
export const LOCK_EVENT = 'ft:lock';
export const CONFIG_EVENT = 'ft:lockconfig';
export const PBKDF2_ROUNDS = 150000;

export type LockConfig = { salt: string; hash: string; biometricId?: string; idleMinutes: number };
export type Guard = { fails: number; lockedUntil: number };

const enc = new TextEncoder();
export const b64 = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b)));
export const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer;

export const loadConfig = (): LockConfig | null => { try { const r = localStorage.getItem(CONFIG_KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
export const saveConfig = (c: LockConfig) => { localStorage.setItem(CONFIG_KEY, JSON.stringify(c)); window.dispatchEvent(new Event(CONFIG_EVENT)); };
export const clearConfig = () => { localStorage.removeItem(CONFIG_KEY); window.dispatchEvent(new Event(CONFIG_EVENT)); };

export const loadGuard = (): Guard => { try { const r = localStorage.getItem(GUARD_KEY); return r ? JSON.parse(r) : { fails: 0, lockedUntil: 0 }; } catch { return { fails: 0, lockedUntil: 0 }; } };
export const saveGuard = (g: Guard) => localStorage.setItem(GUARD_KEY, JSON.stringify(g));
export const clearGuard = () => saveGuard({ fails: 0, lockedUntil: 0 });
export const recordFail = (): Guard => { const g = loadGuard(); g.fails += 1; if (g.fails >= 5) g.lockedUntil = Date.now() + 30000 * Math.pow(2, g.fails - 5); saveGuard(g); return g; };
export const remainingSeconds = (g: Guard) => Math.max(0, Math.ceil((g.lockedUntil - Date.now()) / 1000));

export async function hashPin(pin: string, salt: string) {
  const km = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new Uint8Array(unb64(salt)), iterations: PBKDF2_ROUNDS, hash: 'SHA-256' }, km, 256);
  return b64(bits);
}
export const newSalt = () => b64(crypto.getRandomValues(new Uint8Array(16)).buffer);
export const verifyPin = async (pin: string, c: LockConfig) => (await hashPin(pin, c.salt)) === c.hash;

export const wipeAllAppData = () => { try { localStorage.clear(); sessionStorage.clear(); } catch {} };
export const isLockKey = (k: string) => k.startsWith('ft.applock.');

export async function bioAvailable() { try { return !!window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); } catch { return false; } }
export async function bioRegister() {
  const cred = await navigator.credentials.create({ publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)), rp: { name: 'Finance Tracker' },
    user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'local', displayName: 'Finance Tracker' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
    timeout: 60000, attestation: 'none' } }) as PublicKeyCredential | null;
  if (!cred) throw new Error('cancelled');
  return b64(cred.rawId);
}
export async function bioVerify(id: string) {
  const a = await navigator.credentials.get({ publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    allowCredentials: [{ type: 'public-key', id: new Uint8Array(unb64(id)) }],
    userVerification: 'required', timeout: 60000 } });
  return !!a;
}