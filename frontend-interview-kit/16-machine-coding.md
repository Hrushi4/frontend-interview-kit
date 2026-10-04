# 16 — Machine Coding (60–90 minute UI builds)

**How you're graded:** working core feature first → sensible component/state design → edge cases (loading, empty, error) → accessibility → code quality → styling last. Talk while you code.

Levels: **🧭 Approach → 🟢 Basic builds → 🟡 Intermediate builds → 🔴 Advanced builds → 🎯 Resume-inspired builds → ✅ Review checklist**

---

## 🧭 Approach (first 5 minutes)

1. Restate requirements. Ask: data source (mock or API)? keyboard/a11y expected? mobile? persistence?
2. List must-haves (3–4) and nice-to-haves (2).
3. Sketch component tree and state shape.
4. Build the happy path end to end, then edge cases, then polish.
5. Leave 5 minutes to walk through trade-offs and what you'd add.

**Common reusable hooks to write quickly**
```tsx
export function useDebounce<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
export function useFetch<T>(url: string | null) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: !!url });
  useEffect(() => {
    if (!url) return;
    const ctrl = new AbortController();
    setState({ loading: true });
    fetch(url, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => setState({ data, loading: false }))
      .catch(e => { if (e.name !== 'AbortError') setState({ error: e.message, loading: false }); });
    return () => ctrl.abort();
  }, [url]);
  return state;
}
```

---

## 🟢 Basic builds (30–45 min)

### 1. Counter with step, min/max and reset
State `count`, `step`; disable buttons at bounds; input validation for step; `aria-live` for value.

### 2. Accordion
```tsx
function Accordion({ items, multiple = false }: { items: { id: string; title: string; body: ReactNode }[]; multiple?: boolean }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setOpen(prev => {
    const next = new Set(multiple ? prev : []);
    prev.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  return (
    <div>
      {items.map(it => (
        <div key={it.id}>
          <h3>
            <button aria-expanded={open.has(it.id)} aria-controls={`panel-${it.id}`} id={`btn-${it.id}`} onClick={() => toggle(it.id)}>{it.title}</button>
          </h3>
          <div id={`panel-${it.id}`} role="region" aria-labelledby={`btn-${it.id}`} hidden={!open.has(it.id)}>{it.body}</div>
        </div>
      ))}
    </div>
  );
}
```
Note: for `multiple=false`, opening one closes others; clicking an open one closes it.

### 3. Tabs (accessible, keyboard)
Roles `tablist`/`tab`/`tabpanel`, `aria-selected`, roving tabindex, ArrowLeft/Right/Home/End, panels linked by id.

### 4. Star rating
Radio-group semantics (`role="radiogroup"`, each star `role="radio"` + `aria-checked`) or real radio inputs visually styled; hover preview; keyboard arrows; read-only mode; half stars optional.

### 5. Todo list
Add (trim, ignore empty), toggle, edit inline (Enter save/Escape cancel), delete, filter all/active/done (filter in URL), clear completed, counts, persist to localStorage, stable ids (`crypto.randomUUID()`).

### 6. Progress bar
`role="progressbar"` with `aria-valuenow/min/max`; animate width via `transform: scaleX()`; multiple bars started sequentially or with a concurrency limit (common follow-up).

### 7. Toggle / switch component
`<button role="switch" aria-checked>` with label; controlled & uncontrolled versions.

### 8. Modal dialog
Portal or `<dialog>`; open/close; Escape and backdrop click; focus first element and trap focus; restore focus to trigger; body scroll lock; `aria-modal`, `aria-labelledby`.

### 9. Countdown timer / stopwatch
Store `startAt` and `elapsedBeforePause`; compute display from `performance.now()` on each rAF/interval tick (avoids drift); pause/resume/reset; format `mm:ss.ms`; clean up on unmount.

### 10. Character counter textarea
Max length, remaining count, warning colour near limit, `aria-describedby` linking count.

---

## 🟡 Intermediate builds (45–75 min)

### 11. Typeahead / autocomplete with API
Requirements: debounce, loading/empty/error, keyboard navigation, highlight matches, cancel stale requests, cache.
```tsx
function Autocomplete({ fetcher }: { fetcher: (q: string, signal: AbortSignal) => Promise<string[]> }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const cache = useRef(new Map<string, string[]>());
  const q = useDebounce(query.trim(), 250);
  const listId = useId();

  useEffect(() => {
    if (q.length < 2) { setItems([]); return; }
    if (cache.current.has(q)) { setItems(cache.current.get(q)!); return; }
    const ctrl = new AbortController();
    setStatus('loading');
    fetcher(q, ctrl.signal)
      .then(r => { cache.current.set(q, r); setItems(r); setStatus('idle'); setActive(-1); })
      .catch(e => { if (e.name !== 'AbortError') setStatus('error'); });
    return () => ctrl.abort();
  }, [q, fetcher]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && active >= 0) setQuery(items[active]);
    if (e.key === 'Escape') setItems([]);
  };

  return (
    <div>
      <input role="combobox" aria-expanded={items.length > 0} aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKeyDown} />
      {status === 'loading' && <span role="status">Loading…</span>}
      {status === 'error' && <span role="alert">Something went wrong</span>}
      <ul id={listId} role="listbox">
        {items.map((it, i) => (
          <li key={it} id={`${listId}-${i}`} role="option" aria-selected={i === active} onMouseDown={() => setQuery(it)}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 12. Infinite scroll list
IntersectionObserver sentinel with `rootMargin: '300px'`; in-flight guard; `hasMore`; error with retry; dedupe by id; virtualization if very long.

### 13. Paginated data table
Server or client pagination; page window with ellipsis; page size select; sorting by column (`aria-sort`); filters synced to URL; loading skeleton rows; keep previous data while fetching next page.

### 14. Nested comments / threaded replies
Tree from flat list (parentId), recursive `<Comment>` component, reply form per comment, collapse/expand, optimistic add, depth limit with "continue thread".

### 15. File explorer tree
Recursive folders, expand/collapse, select, keyboard navigation (tree pattern: `role="tree"`, `treeitem`, `aria-expanded`, arrow keys), lazy-load children, add/rename/delete.

### 16. Multi-step form (wizard)
Steps config array; per-step Zod validation; Back/Next; progress indicator; summary review; preserve data across steps; focus heading on step change; submit with pending state.

### 17. OTP input
N boxes, auto-advance, backspace moves back, paste full code, numeric only (`inputMode="numeric"`, `autoComplete="one-time-code"`), submit when complete, error shake + clear.
```tsx
function OTP({ length = 6, onComplete }: { length?: number; onComplete: (code: string) => void }) {
  const [vals, setVals] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const update = (i: number, v: string) => {
    const digits = v.replace(/\D/g, '');
    if (!digits) return;
    const next = [...vals];
    digits.split('').slice(0, length - i).forEach((d, k) => (next[i + k] = d));
    setVals(next);
    const focusIdx = Math.min(i + digits.length, length - 1);
    refs.current[focusIdx]?.focus();
    if (next.every(Boolean)) onComplete(next.join(''));
  };
  return (
    <div role="group" aria-label="One-time code">
      {vals.map((v, i) => (
        <input key={i} ref={el => { refs.current[i] = el; }} value={v} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`} maxLength={length}
          onChange={e => update(i, e.target.value)}
          onKeyDown={e => { if (e.key === 'Backspace' && !vals[i] && i > 0) { refs.current[i - 1]?.focus(); } if (e.key === 'Backspace' && vals[i]) { const n = [...vals]; n[i] = ''; setVals(n); } }} />
      ))}
    </div>
  );
}
```

### 18. Toast notification system
Context with `toast({ title, variant, duration })`; queue with max visible; auto-dismiss with pause on hover/focus; portal; `role="status"` (or `alert` for errors); dismiss button; animations respecting reduced motion.

### 19. Image carousel
Prev/next, dots, autoplay with pause on hover/focus and a pause button, swipe (pointer events), infinite loop, lazy-load neighbours, `aria-roledescription="carousel"`, slide labels "3 of 8".

### 20. Kanban board
Columns and cards normalized; drag-and-drop (dnd-kit for keyboard support) or HTML5 DnD; move between columns; reorder; optimistic update with rollback; persist.

### 21. Polling with backoff and visibility awareness
Poll every N seconds; pause when `document.visibilityState === 'hidden'`; exponential backoff on errors; manual refresh; stop when job completes.

### 22. Like button with optimistic update
Toggle immediately, revert on error with toast, prevent double-click races (track latest intent, debounce server sync).

---

## 🔴 Advanced builds (senior rounds)

### 23. Virtualized list from scratch (fixed row height)
```tsx
function VirtualList<T>({ items, rowHeight, height, render }: { items: T[]; rowHeight: number; height: number; render: (t: T, i: number) => ReactNode }) {
  const [scrollTop, setScrollTop] = useState(0);
  const overscan = 5;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(items.length, Math.ceil((scrollTop + height) / rowHeight) + overscan);
  return (
    <div style={{ height, overflowY: 'auto' }} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
      <div style={{ height: items.length * rowHeight, position: 'relative' }}>
        {items.slice(start, end).map((it, k) => (
          <div key={start + k} style={{ position: 'absolute', top: (start + k) * rowHeight, height: rowHeight, left: 0, right: 0 }}>{render(it, start + k)}</div>
        ))}
      </div>
    </div>
  );
}
```
Follow-ups: dynamic heights (measure with ResizeObserver, cache offsets), scroll-to-index, sticky headers.

### 24. Undo/redo editor
Two stacks (past, future) or an array + pointer; commands with `do/undo`; keyboard shortcuts (Ctrl/Cmd+Z, Shift+Z); coalesce rapid typing into one history entry.
```ts
function useHistory<T>(initial: T) {
  const [state, setState] = useState({ past: [] as T[], present: initial, future: [] as T[] });
  const set = (v: T) => setState(s => ({ past: [...s.past, s.present], present: v, future: [] }));
  const undo = () => setState(s => s.past.length ? { past: s.past.slice(0, -1), present: s.past.at(-1)!, future: [s.present, ...s.future] } : s);
  const redo = () => setState(s => s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s);
  return { value: state.present, set, undo, redo, canUndo: state.past.length > 0, canRedo: state.future.length > 0 };
}
```

### 25. Spreadsheet mini (formulas)
Grid of cells, `=A1+B2` parsing, dependency graph, recompute dependents in topological order, cycle detection (`#CYCLE`), virtualized rendering for big sheets.

### 26. Drag-to-select grid (calendar slot picker)
Pointer events (down/move/up), compute rectangle selection, keyboard alternative, accessible announcements.

### 27. Calendar month view
Compute weeks for a month (start on Monday/Sunday), events placed per day, overflow "+3 more", keyboard navigation between days, time zone handling.

### 28. Chat UI with streaming responses
Message list (reverse virtualized), input with Enter to send/Shift+Enter newline, streaming tokens via fetch stream, stop button (AbortController), retry, auto-scroll only near bottom, markdown sanitized, copy button, error state per message.

### 29. Rich typeahead with grouped results & recent searches
Sections (people, calls, reports), keyboard across groups, recent searches in localStorage (non-sensitive), highlight matches, analytics on selection.

### 30. Feature-flagged component with remote config
Fetch flags at boot, context provider, `useFlag('newScorecard')`, fallback defaults, override via query param in dev.

---

## 🎯 Resume-inspired builds (practise these — they double as talking points)

### 31. Video call control bar
Buttons: mic, camera, screen share, layout, leave. `aria-pressed` on toggles; labels change with state ("Unmute microphone"); keyboard shortcuts M/V with `aria-keyshortcuts`; device picker (`enumerateDevices`, `devicechange`); leave confirmation; disabled states while toggling; reconnecting banner driven by a connection-state machine.

### 32. Pre-join device check screen
Request permissions on click; live camera preview; mic level meter (Web Audio `AnalyserNode` on a rAF loop, rendered via CSS variable, not React state per frame); device selectors; handle `NotAllowedError`/`NotFoundError`; "Join" disabled until ready.

### 33. QA scorecard form
Sections and questions from JSON config; weighted scoring (compute total live); required comment when a score is below threshold; autosave draft (debounced); submit with optimistic status; RBAC — agents view read-only, QA edits, admin can override; Zod validation.
```ts
const total = sections.reduce((sum, s) => sum + s.questions.reduce((q, item) => q + (answers[item.id] ?? 0) * item.weight, 0), 0);
```

### 34. Transcript viewer synced to audio
Click line → seek; highlight active line on `timeupdate` (binary search); auto-scroll active line into view unless user is scrolling; search within transcript with match navigation; jump to AI-flagged compliance moments; speaker labels.
```tsx
function useActiveLine(audio: HTMLAudioElement | null, lines: { start: number }[]) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!audio) return;
    const onTime = () => {
      const t = audio.currentTime; let lo = 0, hi = lines.length - 1, ans = 0;
      while (lo <= hi) { const m = (lo + hi) >> 1; if (lines[m].start <= t) { ans = m; lo = m + 1; } else hi = m - 1; }
      setIdx(prev => (prev === ans ? prev : ans));
    };
    audio.addEventListener('timeupdate', onTime);
    return () => audio.removeEventListener('timeupdate', onTime);
  }, [audio, lines]);
  return idx;
}
```

### 35. Multi-tenant theme switcher
Load tenant config → set CSS variables → components using semantic tokens update instantly; contrast check warning for low-contrast palettes.

### 36. Role-based navigation
Permission map → filtered nav items → route guards → "403" page; test with each role.

---

## ✅ Self-review checklist (say these out loud at the end)

- Loading, empty, error and success states handled.
- Keyboard works; focus visible; semantic elements; ARIA only where needed.
- No memory leaks: timers, listeners, observers, requests cleaned up.
- Stale request handling (abort / latest-only).
- Stable keys; no index keys for dynamic lists.
- Derived state computed, not duplicated.
- Components small and named well; logic extracted into hooks.
- Edge cases: very long text, zero items, many items, slow network, double clicks.
- What I'd add with more time: tests (RTL), virtualization, persistence, i18n.
