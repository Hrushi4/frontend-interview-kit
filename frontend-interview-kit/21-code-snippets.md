# 21 — Everyday Code Snippets (Copy-Paste Reference)

**How this file is organised**

- **Part A — Understand the topic:** why keeping a personal snippet library helps in projects and machine-coding rounds.
- **Part B — Snippets:** grouped by job (fetching, React hooks, patterns, testing, utilities, CSS, Git). Each one has a short explanation of **what it does**, **when to use it**, and a line you can **say in an interview** to explain it.

---

## Part A — Understand the Topic

### Why a snippet library?

In a machine-coding round or on a real project, you don't want to rediscover how to write a correct `useDebounce`, or how to abort a stale fetch. These snippets are the code that's easy to get *almost* right. Each one already handles the edge cases: cleanup on unmount, stale closures, timeouts, SSR safety, and sensitive data.

### How to use this file

1. **Before machine-coding rounds:** type out `useDebounce`, `api()` and `useOnClickOutside` from memory once. If you can't, re-read them.
2. **In interviews:** when you use a snippet, say *why* it's written that way. The "Say it like this" lines show you how.
3. **In projects:** copy them into a `src/lib` folder and adapt them.

---

## Part B — Snippets

## Fetching and Data

### Typed fetch wrapper with a timeout and error handling

**What it does:** Wraps `fetch` with a timeout, JSON handling, cookie credentials, and a typed error for non-2xx responses (`fetch` doesn't reject on 404 or 500 by itself).

**When to use it:** As the base API client of any app.

```ts
export class HttpError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`HTTP ${status}`);
  }
}

export async function api<T>(url: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), init.timeoutMs ?? 15000);
  try {
    const res = await fetch(url, {
      credentials: 'include',
      ...init,
      signal: init.signal ?? ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    });
    const body = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) throw new HttpError(res.status, body);
    return body as T;
  } finally {
    clearTimeout(timer);
  }
}
```

**Say it like this:** "`fetch` only rejects on network failures, so I check `res.ok` and throw a typed `HttpError` that the UI can branch on, for example 401 versus 500. The AbortController gives every request a timeout, and `finally` always clears the timer."

---

### Zod-validated response

**What it does:** Checks at runtime that the API returned the shape you expect, and derives the TypeScript type from the same schema.

```ts
const User = z.object({ id: z.string(), name: z.string(), role: z.enum(['admin', 'qa', 'agent']) });
type User = z.infer<typeof User>;

const user = User.parse(await api<unknown>('/api/me'));   // throws a clear error if the shape is wrong
```

**Say it like this:** "TypeScript types vanish at runtime, so at the API boundary I validate with Zod. One schema gives me both the runtime check and the type."

---

### Ignore out-of-order responses (when you can't use AbortController)

**What it does:** Prevents a slow, older response from overwriting a newer one, which is the classic search race condition.

```ts
let latest = 0;
async function search(q: string) {
  const id = ++latest;                              // tag this request
  const data = await api<Result[]>(`/search?q=${encodeURIComponent(q)}`);
  if (id === latest) setResults(data);              // only the newest request may update the UI
}
```

---

## React Hooks

### `useDebounce`

**What it does:** Returns a value that updates only after it has stopped changing for `ms` milliseconds.

**When to use it:** Search inputs, autosave and filter fields.

```ts
export function useDebounce<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);     // a new keystroke cancels the previous timer
  }, [value, ms]);
  return v;
}
```

**Say it like this:** "Each change schedules an update, and the effect cleanup cancels the previous one, so only the last value survives the quiet period."

---

### `useLatest` (avoid stale closures)

**What it does:** Keeps a ref that always holds the latest value. Long-lived callbacks (intervals, event listeners) can read fresh data without re-subscribing.

```ts
export function useLatest<T>(value: T) {
  const r = useRef(value);
  r.current = value;
  return r;
}
```

---

### `useInterval` (Dan Abramov's pattern)

**What it does:** A declarative `setInterval` that always calls the latest callback. Passing `null` pauses it.

```ts
export function useInterval(cb: () => void, ms: number | null) {
  const saved = useLatest(cb);
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}
```

**Say it like this:** "A plain `setInterval` inside `useEffect` captures stale state. Storing the callback in a ref means the interval always calls the newest version, without restarting it on every render."

---

### `usePrevious`

**What it does:** Gives you the value from the previous render, which is useful for comparing ("did the status just change from live to ended?").

```ts
export function usePrevious<T>(v: T) {
  const r = useRef<T>();
  useEffect(() => { r.current = v; });
  return r.current;
}
```

---

### `useLocalStorage` (for non-sensitive UI preferences only)

**What it does:** State that persists across reloads. It's wrapped in try/catch because storage can throw in private mode or when full.

```ts
export function useLocalStorage<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV] as const;
}
```

**Warning:** Never store tokens, PHI or tenant data with this. It's for things like the layout or theme only.

---

### `useMediaQuery`

**What it does:** Subscribes to a CSS media query (`(max-width: 768px)`, `(prefers-reduced-motion: reduce)`), and stays safe during server rendering.

```ts
export function useMediaQuery(q: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia(q);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => matchMedia(q).matches,   // client value
    () => false,                    // server value
  );
}
```

**Say it like this:** "I use `useSyncExternalStore` because a media query is an external source. It's concurrent-safe and has a server snapshot for SSR."

---

### `useOnClickOutside`

**What it does:** Calls a handler when the user clicks or taps outside an element. Use it to close dropdowns and popovers.

```ts
export function useOnClickOutside(ref: RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const on = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener('pointerdown', on);
    return () => document.removeEventListener('pointerdown', on);
  }, [ref, handler]);
}
```

---

### `useEventSource` (SSE with cookie auth)

**What it does:** Opens a Server-Sent Events stream, calls `onMessage` for each event, and closes it on unmount or when the URL changes.

```ts
export function useEventSource(url: string | null, onMessage: (d: string) => void) {
  const cb = useLatest(onMessage);
  useEffect(() => {
    if (!url) return;
    const es = new EventSource(url, { withCredentials: true });
    es.onmessage = (e) => cb.current(e.data);
    return () => es.close();
  }, [url]);
}
```

**Note:** `EventSource` can't send an Authorization header, which is why this uses cookies. For header-based auth, use `fetch` streaming (JavaScript Q143).

---

### `useMediaDevices`

**What it does:** Lists the cameras and microphones, and updates when a device is plugged in or removed.

```ts
export function useMediaDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  useEffect(() => {
    const load = () => navigator.mediaDevices.enumerateDevices().then(setDevices);
    load();
    navigator.mediaDevices.addEventListener('devicechange', load);
    return () => navigator.mediaDevices.removeEventListener('devicechange', load);
  }, []);
  return devices;
}
```

---

## Patterns

### Error boundary (`react-error-boundary`)

**What it does:** Catches rendering errors in a subtree and shows a fallback with a retry button, instead of a blank screen, and reports the error to Sentry.

```tsx
<ErrorBoundary
  FallbackComponent={({ resetErrorBoundary }) => <button onClick={resetErrorBoundary}>Retry</button>}
  onError={(e) => Sentry.captureException(e)}
>
  <CallRoom />
</ErrorBoundary>
```

---

### Context and a hook with a guard

**What it does:** Consumers never get `null`, and misuse outside the provider fails loudly with a clear message.

```tsx
const AuthCtx = createContext<Auth | null>(null);
export const useAuth = () => {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth must be used inside <AuthProvider>');
  return c;
};
```

---

### `cn` helper (Tailwind)

**What it does:** Combines conditional classes (`clsx`) and resolves Tailwind conflicts (`tailwind-merge`), so `p-4` passed by a parent overrides the component's `p-2`.

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...i: ClassValue[]) => twMerge(clsx(i));
```

---

### Cross-tab logout

**What it does:** Logging out in one tab logs out every open tab, so no stale sessions show data on a shared computer.

```ts
const ch = new BroadcastChannel('auth');
export const broadcastLogout = () => ch.postMessage('logout');
ch.onmessage = (e) => {
  if (e.data === 'logout') {
    queryClient.clear();
    location.assign('/login');
  }
};
```

---

### Idle logout

**What it does:** Logs the user out after a period without activity. Healthcare apps often require this, for example on clinic tablets.

```ts
export function useIdleLogout(ms: number, logout: () => void) {
  useEffect(() => {
    let t = setTimeout(logout, ms);
    const reset = () => { clearTimeout(t); t = setTimeout(logout, ms); };
    const events = ['pointerdown', 'keydown', 'scroll'];
    events.forEach((e) => addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(t);
      events.forEach((e) => removeEventListener(e, reset));
    };
  }, [ms, logout]);
}
```

---

### Sentry PHI scrubbing

**What it does:** Stops personal and health data from being sent to error tracking.

```ts
Sentry.init({
  dsn,
  sendDefaultPii: false,
  beforeBreadcrumb: (b) => (b.category === 'console' || b.category === 'ui.input' ? null : b),
  beforeSend: (e) => {
    delete e.request?.data;
    delete e.user?.email;
    return e;
  },
});
```

**Say it like this:** "Error tracking is a common place for PHI to leak, so we disabled default PII, dropped console and input breadcrumbs, and stripped request bodies and emails before sending."

---

## Testing

### React Testing Library + `userEvent` + MSW

**What it does:** Tests a component the way a user uses it, with the network mocked realistically.

```tsx
const server = setupServer(http.get('/api/calls', () => HttpResponse.json([{ id: '1', agent: 'A' }])));
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('shows calls and opens one', async () => {
  const user = userEvent.setup();
  render(<CallList />);
  await user.click(await screen.findByRole('link', { name: /agent a/i }));
  expect(screen.getByRole('heading', { name: /call details/i })).toBeInTheDocument();
});
```

---

### Testing a hook

```ts
const { result } = renderHook(() => useDebounce('a', 200));
expect(result.current).toBe('a');
```

---

### Playwright with a fake camera and microphone

**What it does:** Lets end-to-end tests join video calls in CI without real hardware.

```ts
// playwright.config.ts
use: {
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
},
```

---

## Utilities

**What they do:** Small helpers you'd otherwise rewrite in every project.

```ts
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const groupBy = <T, K extends PropertyKey>(xs: T[], f: (x: T) => K) =>
  xs.reduce((m, x) => ((m[f(x)] ??= []).push(x), m), {} as Record<K, T[]>);

export const uniqBy = <T>(xs: T[], f: (x: T) => unknown) => [...new Map(xs.map((x) => [f(x), x])).values()];

// 75 → "01:15", 3725 → "01:02:05"
export const formatDuration = (s: number) => new Date(s * 1000).toISOString().slice(s >= 3600 ? 11 : 14, 19);

export const copy = (text: string) => navigator.clipboard.writeText(text);

export const download = (blob: Blob, name: string) => {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
  a.click();
  URL.revokeObjectURL(a.href);    // free memory
};
```

---

### URL search params as state

**What it does:** Keeps filters and pagination in the URL, so views can be shared and survive a refresh.

```ts
const [params, setParams] = useSearchParams();
const page = Number(params.get('page') ?? 1);
const setPage = (p: number) =>
  setParams((prev) => { prev.set('page', String(p)); return prev; });
```

---

## CSS One-Liners

**What they do:** The CSS patterns you reach for most often.

```css
.center      { display: grid; place-items: center; }                      /* centre anything */
.truncate    { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }   /* one line with … */
.clamp-2     { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.grid-auto   { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
.video-tile  { aspect-ratio: 16 / 9; object-fit: cover; }
.sr-only     { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden;
               clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }       /* screen-reader only */
.full-height { min-height: 100dvh; }                                         /* mobile-safe full height */
```

---

## Git Commands You'll Actually Need

```bash
git switch -c feat/x                 # create and switch to a new branch
git commit --amend --no-edit         # add staged changes to the last commit
git rebase -i origin/main            # clean up commits before a PR
git push --force-with-lease          # safe force push (your own branch only)
git stash push -u -m "wip"           # stash, including untracked files
git log --oneline --graph -20        # quick visual history
git restore --staged file            # unstage a file
git reflog                           # find "lost" commits
```

See **02 — Git and GitHub** for full explanations of each command.
