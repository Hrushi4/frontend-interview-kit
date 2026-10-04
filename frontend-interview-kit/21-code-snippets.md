# 21 — Everyday Code Snippets (copy-paste reference)

The code you forget mid-project. Grouped by job, TypeScript where useful.

## Fetch & data

**Typed fetch wrapper with timeout + error handling**
```ts
export class HttpError extends Error { constructor(public status: number, public body: unknown) { super(`HTTP ${status}`); } }

export async function api<T>(url: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), init.timeoutMs ?? 15000);
  try {
    const res = await fetch(url, { credentials: 'include', ...init, signal: init.signal ?? ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...init.headers } });
    const body = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) throw new HttpError(res.status, body);
    return body as T;
  } finally { clearTimeout(timer); }
}
```

**Zod-validated response**
```ts
const User = z.object({ id: z.string(), name: z.string(), role: z.enum(['admin', 'qa', 'agent']) });
type User = z.infer<typeof User>;
const user = User.parse(await api<unknown>('/api/me'));
```

**Ignore out-of-order responses (no AbortController available)**
```ts
let latest = 0;
async function search(q: string) {
  const id = ++latest;
  const data = await api<Result[]>(`/search?q=${encodeURIComponent(q)}`);
  if (id === latest) setResults(data);
}
```

## React hooks

**useDebounce / useThrottle**
```ts
export function useDebounce<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
```

**useLatest (avoid stale closures)**
```ts
export function useLatest<T>(value: T) { const r = useRef(value); r.current = value; return r; }
```

**useInterval (Dan Abramov pattern)**
```ts
export function useInterval(cb: () => void, ms: number | null) {
  const saved = useLatest(cb);
  useEffect(() => { if (ms === null) return; const id = setInterval(() => saved.current(), ms); return () => clearInterval(id); }, [ms]);
}
```

**usePrevious**
```ts
export function usePrevious<T>(v: T) { const r = useRef<T>(); useEffect(() => { r.current = v; }); return r.current; }
```

**useLocalStorage (non-sensitive UI prefs only)**
```ts
export function useLocalStorage<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV] as const;
}
```

**useMediaQuery**
```ts
export function useMediaQuery(q: string) {
  return useSyncExternalStore(
    cb => { const m = matchMedia(q); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); },
    () => matchMedia(q).matches, () => false);
}
```

**useOnClickOutside**
```ts
export function useOnClickOutside(ref: RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const on = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) handler(); };
    document.addEventListener('pointerdown', on);
    return () => document.removeEventListener('pointerdown', on);
  }, [ref, handler]);
}
```

**useEventSource (SSE with cookie auth)**
```ts
export function useEventSource(url: string | null, onMessage: (d: string) => void) {
  const cb = useLatest(onMessage);
  useEffect(() => {
    if (!url) return;
    const es = new EventSource(url, { withCredentials: true });
    es.onmessage = e => cb.current(e.data);
    return () => es.close();
  }, [url]);
}
```

**useMediaDevices**
```ts
export function useMediaDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  useEffect(() => {
    const load = () => navigator.mediaDevices.enumerateDevices().then(setDevices);
    load(); navigator.mediaDevices.addEventListener('devicechange', load);
    return () => navigator.mediaDevices.removeEventListener('devicechange', load);
  }, []);
  return devices;
}
```

## Patterns

**Error boundary (react-error-boundary)**
```tsx
<ErrorBoundary FallbackComponent={({ resetErrorBoundary }) => <button onClick={resetErrorBoundary}>Retry</button>}
  onError={(e) => Sentry.captureException(e)}>
  <CallRoom />
</ErrorBoundary>
```

**Context + hook with guard**
```tsx
const AuthCtx = createContext<Auth | null>(null);
export const useAuth = () => { const c = useContext(AuthCtx); if (!c) throw new Error('useAuth outside AuthProvider'); return c; };
```

**`cn` helper (Tailwind)**
```ts
import { clsx, type ClassValue } from 'clsx'; import { twMerge } from 'tailwind-merge';
export const cn = (...i: ClassValue[]) => twMerge(clsx(i));
```

**Cross-tab logout**
```ts
const ch = new BroadcastChannel('auth');
export const broadcastLogout = () => ch.postMessage('logout');
ch.onmessage = e => { if (e.data === 'logout') { queryClient.clear(); location.assign('/login'); } };
```

**Idle logout**
```ts
export function useIdleLogout(ms: number, logout: () => void) {
  useEffect(() => {
    let t = setTimeout(logout, ms);
    const reset = () => { clearTimeout(t); t = setTimeout(logout, ms); };
    const evs = ['pointerdown', 'keydown', 'scroll'];
    evs.forEach(e => addEventListener(e, reset, { passive: true }));
    return () => { clearTimeout(t); evs.forEach(e => removeEventListener(e, reset)); };
  }, [ms, logout]);
}
```

**Sentry PHI scrubbing**
```ts
Sentry.init({
  dsn, sendDefaultPii: false,
  beforeBreadcrumb: b => (b.category === 'console' || b.category === 'ui.input' ? null : b),
  beforeSend: e => { delete e.request?.data; delete e.user?.email; return e; },
});
```

## Testing

**RTL + userEvent + MSW**
```tsx
const server = setupServer(http.get('/api/calls', () => HttpResponse.json([{ id: '1', agent: 'A' }])));
beforeAll(() => server.listen()); afterEach(() => server.resetHandlers()); afterAll(() => server.close());

test('shows calls and opens one', async () => {
  const user = userEvent.setup();
  render(<CallList />);
  await user.click(await screen.findByRole('link', { name: /agent a/i }));
  expect(screen.getByRole('heading', { name: /call details/i })).toBeInTheDocument();
});
```

**Testing a hook**
```ts
const { result } = renderHook(() => useDebounce('a', 200));
```

**Playwright with fake camera/mic**
```ts
// playwright.config.ts
use: { launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] } }
```

## Utilities

```ts
export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
export const groupBy = <T, K extends PropertyKey>(xs: T[], f: (x: T) => K) =>
  xs.reduce((m, x) => ((m[f(x)] ??= []).push(x), m), {} as Record<K, T[]>);
export const uniqBy = <T>(xs: T[], f: (x: T) => unknown) => [...new Map(xs.map(x => [f(x), x])).values()];
export const formatDuration = (s: number) => new Date(s * 1000).toISOString().slice(s >= 3600 ? 11 : 14, 19);
export const copy = (text: string) => navigator.clipboard.writeText(text);
export const download = (blob: Blob, name: string) => {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
  a.click(); URL.revokeObjectURL(a.href);
};
```

**URL search params as state**
```ts
const [params, setParams] = useSearchParams();
const page = Number(params.get('page') ?? 1);
const setPage = (p: number) => setParams(prev => { prev.set('page', String(p)); return prev; });
```

## CSS one-liners
```css
.center { display: grid; place-items: center; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.grid-auto { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
.video-tile { aspect-ratio: 16 / 9; object-fit: cover; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.full-height { min-height: 100dvh; }
```

## Git commands you'll actually need
```bash
git switch -c feat/x                 # new branch
git commit --amend --no-edit         # add to last commit
git rebase -i origin/main            # clean up before PR
git push --force-with-lease          # safe force push (own branch only)
git stash push -u -m "wip"           # stash incl. untracked
git log --oneline --graph -20        # quick history
git restore --staged file            # unstage
git reflog                           # find lost commits
```
