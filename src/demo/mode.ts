// Decides whether requests go to the live API or the offline demo engine.
//   live → always the real API
//   demo → always the offline snapshot (use this at events with no/unstable internet)
//   auto → checked on each full page load: real API if reachable within 3s, otherwise demo
//          (instant when the device reports it is offline)
// Priority: ?mode= in the URL (remembered) → saved choice → NEXT_PUBLIC_DATA_MODE → auto.
// The resolved mode never changes on its own while the page is open, so live and demo data never mix.
import { STUDENT_API_BASE_URL } from '@/shared/constants/api-endpoints';

export type DataMode = 'live' | 'demo' | 'auto';
export type ResolvedMode = 'live' | 'demo';

const MODE_KEY = 'big-data-mode';
const PROBE_TIMEOUT_MS = 3000;
export const MODE_EVENT = 'big:data-mode';
export const CONNECTION_LOST_EVENT = 'big:connection-lost';

const isMode = (value: unknown): value is DataMode => value === 'live' || value === 'demo' || value === 'auto';
const isBrowser = () => typeof window !== 'undefined';

function read(storage: () => Storage, key: string) {
  try { return storage().getItem(key); } catch { return null; }
}
function write(storage: () => Storage, key: string, value: string | null) {
  try { if (value === null) storage().removeItem(key); else storage().setItem(key, value); } catch { /* storage unavailable */ }
}

export function getPreferredMode(): DataMode {
  if (!isBrowser()) return 'auto';
  const fromUrl = new URLSearchParams(window.location.search).get('mode');
  if (isMode(fromUrl)) {
    if (read(() => localStorage, MODE_KEY) !== fromUrl) write(() => localStorage, MODE_KEY, fromUrl);
    return fromUrl;
  }
  const saved = read(() => localStorage, MODE_KEY);
  if (isMode(saved)) return saved;
  const fromEnv = process.env.NEXT_PUBLIC_DATA_MODE;
  return isMode(fromEnv) ? fromEnv : 'auto';
}

async function apiReachable() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
  try {
    const response = await fetch(`${STUDENT_API_BASE_URL}/students/subjects`, { cache: 'no-store', signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });
    return response.ok;
  } catch {
    return false;
  }
}

let resolving: Promise<ResolvedMode> | null = null;
let current: ResolvedMode | null = null;

function settle(mode: ResolvedMode) {
  current = mode;
  window.dispatchEvent(new Event(MODE_EVENT));
  return mode;
}

export function resolveDataMode(): Promise<ResolvedMode> {
  if (!isBrowser()) return Promise.resolve('live');
  if (resolving) return resolving;
  resolving = (async () => {
    const preferred = getPreferredMode();
    if (preferred !== 'auto') return settle(preferred);
    // Re-checked on every full page load (a reload is a fresh start), kept for in-app navigation.
    const mode: ResolvedMode = (await apiReachable()) ? 'live' : 'demo';
    return settle(mode);
  })();
  return resolving;
}

/** The mode in use right now, or null while the auto check is still running. */
export const getResolvedMode = () => current;

/** Switches mode explicitly and reloads so every screen refetches from the new source. */
export function setDataMode(mode: DataMode) {
  write(() => localStorage, MODE_KEY, mode);
  const url = new URL(window.location.href);
  url.searchParams.delete('mode');
  window.location.replace(url.toString());
}

export function subscribeToMode(callback: () => void) {
  window.addEventListener(MODE_EVENT, callback);
  return () => window.removeEventListener(MODE_EVENT, callback);
}

export function notifyConnectionLost() {
  if (isBrowser()) window.dispatchEvent(new Event(CONNECTION_LOST_EVENT));
}
