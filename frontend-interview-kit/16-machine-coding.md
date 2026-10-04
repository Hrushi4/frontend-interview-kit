# 16 — Machine Coding (60–90 Minute UI Builds)

**How you're graded:** a working core feature first → sensible component and state design → edge cases (loading, empty, error) → accessibility → code quality → styling last. Talk while you code.

**How this file is organised**

- **Part A — Understand the topic:** what a machine coding round is, how it's scored, and a step-by-step approach.
- **Part B — Builds with explanations and code:** Basic → Intermediate → Advanced → Resume-inspired → Self-review checklist.

Each build has a **Short answer** (the approach in one breath), an **Explanation** (requirements and key points), an **Example** (the code or a code sketch) and **Say it like this** (what to say while you build).

---

## Part A — Understand the Topic

### What is a machine coding round?

You're asked to build a small but complete UI feature *live*, usually in React, in 60–90 minutes. Typical prompts: "Build an autocomplete", "Build a todo app", "Build a star rating", "Build an OTP input". The interviewer watches how you:

- break the problem down
- design components and state
- handle real-world states (loading, empty, error)
- make it accessible and keyboard-friendly
- write clean, readable code
- communicate trade-offs

**Working beats pretty.** A plain but fully working, accessible component scores far higher than a beautiful one that's half-finished.

### The 5-step approach (the first 5 minutes matter most)

1. **Restate the requirements** and ask questions: Is there a mock or a real API? Is keyboard and accessibility support expected? Mobile? Should it persist?
2. **List the must-haves** (3–4) and the nice-to-haves (2). Confirm them with the interviewer.
3. **Sketch the component tree and state shape** in a comment or on the whiteboard.
4. **Build the happy path end to end**, then the edge cases, then polish.
5. **Leave 5 minutes** to walk through trade-offs and what you'd add with more time.

**Say it like this (opening):** "Let me restate what we're building and confirm the scope. I'll get the core flow working end to end first, then handle loading, empty and error states, then keyboard and accessibility, and finally styling if there's time."

### State design rules that impress interviewers

- **Keep minimal state.** Derive everything else: `remaining = todos.filter(t => !t.done).length` is computed, not stored.
- **Use a union type for status:** `'idle' | 'loading' | 'error' | 'success'` instead of several booleans.
- **Use stable IDs:** `crypto.randomUUID()`, never the array index, for dynamic lists.
- **Lift state only as high as needed.**
- **Always clean up:** timers, listeners, observers and requests.

### Reusable hooks worth writing quickly from memory

```tsx
export function useDebounce<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export function useFetch<T>(url: string | null) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: !!url });
  useEffect(() => {
    if (!url) return;
    const ctrl = new AbortController();
    setState({ loading: true });
    fetch(url, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => setState({ data, loading: false }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ error: e.message, loading: false }); });
    return () => ctrl.abort();
  }, [url]);
  return state;
}
```

**Why these matter:** `useDebounce` shows you understand closures and cleanup. `useFetch` shows you handle loading and error states and race conditions (via abort).

---

## Part B — Builds with Explanations and Code

## 🟢 Basic Builds (30–45 Minutes)

### Q1. Counter with step, min/max and reset

**Short answer:** Two pieces of state (`count`, `step`), functional updates, clamping to min/max, disabled buttons at the bounds, and a polite live region.

**Explanation:**

**Requirements:** increment and decrement by a configurable step, stay within min and max, reset, and announce the value.

**Approach:** State is `count` and `step`. Disable the buttons at the bounds, clamp values, and validate the step input.

**Example:**

```tsx
function Counter({ min = 0, max = 10 }: { min?: number; max?: number }) {
  const [count, setCount] = useState(min);
  const [step, setStep] = useState(1);
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div>
      <p aria-live="polite">Count: {count}</p>
      <button onClick={() => setCount((c) => clamp(c - step))} disabled={count <= min}>−</button>
      <button onClick={() => setCount((c) => clamp(c + step))} disabled={count >= max}>+</button>
      <button onClick={() => setCount(min)}>Reset</button>
      <label>
        Step
        <input type="number" min={1} value={step}
               onChange={(e) => setStep(Math.max(1, Number(e.target.value) || 1))} />
      </label>
    </div>
  );
}
```

**Say it like this:** "I use functional updates so rapid clicks never read stale state. I clamp the value instead of trusting the step, and a polite live region announces changes to screen-reader users."

---

### Q2. Accordion

**Short answer:** A `Set` of open IDs; real `<button>`s inside headings with `aria-expanded` and `aria-controls`; `hidden` on closed panels.

**Explanation:**

**Requirements:** expand and collapse sections, optionally allow several open at once, and full accessibility.

**Approach:** Store the open IDs in a `Set`. In single-open mode, opening one section closes the others. Each header is a real `<button>` with `aria-expanded`.

**Example:**

```tsx
type Item = { id: string; title: string; body: React.ReactNode };

function Accordion({ items, multiple = false }: { items: Item[]; multiple?: boolean }) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      prev.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div>
      {items.map((it) => (
        <div key={it.id}>
          <h3>
            <button
              id={`btn-${it.id}`}
              aria-expanded={open.has(it.id)}
              aria-controls={`panel-${it.id}`}
              onClick={() => toggle(it.id)}
            >
              {it.title}
            </button>
          </h3>
          <div id={`panel-${it.id}`} role="region" aria-labelledby={`btn-${it.id}`} hidden={!open.has(it.id)}>
            {it.body}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Say it like this:** "Headers are real buttons inside headings, so they work with the keyboard and show up in the screen reader's headings list. `aria-expanded` announces the state, and `hidden` removes closed panels from the accessibility tree."

---

### Q3. Tabs (accessible, with keyboard support)

**Short answer:** The `tablist`/`tab`/`tabpanel` roles with a roving tabindex, so only the active tab is tabbable and arrow keys, Home and End move between tabs.

**Explanation:**

**Requirements:** switch panels, use the correct ARIA roles, and support arrow keys, Home and End.

**Approach:** Use the `tablist`, `tab` and `tabpanel` roles with a **roving tabindex**: only the active tab is in the Tab order, and the arrow keys move between tabs.

**Example:**

```tsx
function Tabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (i: number) => {
    const idx = (i + tabs.length) % tabs.length;     // wrap around
    setActive(idx);
    refs.current[idx]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') focusTab(active + 1);
    if (e.key === 'ArrowLeft') focusTab(active - 1);
    if (e.key === 'Home') focusTab(0);
    if (e.key === 'End') focusTab(tabs.length - 1);
  };

  return (
    <div>
      <div role="tablist" aria-label="Call details" onKeyDown={onKeyDown}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={i === active}
            aria-controls={`panel-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={i !== active} tabIndex={0}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
```

**Say it like this:** "Only the active tab is in the Tab order. That's the roving tabindex, so Tab moves into the panel and arrow keys move between tabs. The roles and `aria-selected` make screen readers announce 'tab, 2 of 4, selected'. I used the same pattern for the call details view."

---

### Q4. Star rating

**Short answer:** A radio group styled as stars: visually hidden radio inputs give keyboard support and announcements for free, with hover state for the preview.

**Explanation:**

**Requirements:** click to rate, preview on hover, keyboard support, and a read-only mode.

**Approach:** Semantically this is a radio group, since you choose exactly one value. Using real radio inputs styled as stars gives you keyboard support for free.

**Example:**

```tsx
function StarRating({ value, onChange, max = 5, readOnly = false }:
  { value: number; onChange?: (v: number) => void; max?: number; readOnly?: boolean }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const name = useId();

  return (
    <fieldset className="stars" onMouseLeave={() => setHover(0)} disabled={readOnly}>
      <legend className="sr-only">Rating</legend>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <label key={n} onMouseEnter={() => !readOnly && setHover(n)}>
          <input type="radio" name={name} value={n} checked={value === n}
                 onChange={() => onChange?.(n)} className="sr-only" />
          <span aria-hidden="true">{n <= shown ? '★' : '☆'}</span>
          <span className="sr-only">{n} star{n > 1 ? 's' : ''}</span>
        </label>
      ))}
    </fieldset>
  );
}
```

**Say it like this:** "Instead of divs with click handlers, I use visually hidden radio inputs. The arrow keys, focus and screen-reader announcements like '3 stars, radio button, 3 of 5' all come from the browser."

---

### Q5. Todo list

**Short answer:** State is just the todos and the filter; visible items and counts are derived; stable IDs from `crypto.randomUUID()`; persist to localStorage in an effect.

**Explanation:**

**Requirements:** add (trimmed, ignoring empty input), toggle, edit inline (Enter saves, Escape cancels), delete, filter all/active/done, clear completed, show counts, and persist to localStorage.

**Approach:** Store the todos and the filter. Derive the visible list and the counts. Persist in an effect.

**Example:**

```tsx
type Todo = { id: string; text: string; done: boolean };
type Filter = 'all' | 'active' | 'done';

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try { return JSON.parse(localStorage.getItem('todos') ?? '[]'); } catch { return []; }
  });
  const [filter, setFilter] = useState<Filter>('all');
  const [text, setText] = useState('');

  useEffect(() => { localStorage.setItem('todos', JSON.stringify(todos)); }, [todos]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text: t, done: false }]);
    setText('');
  };
  const toggle = (id: string) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTodos((p) => p.filter((t) => t.id !== id));
  const rename = (id: string, text: string) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, text } : t)));

  const visible = todos.filter((t) => (filter === 'all' ? true : filter === 'done' ? t.done : !t.done));
  const remaining = todos.filter((t) => !t.done).length;          // derived, not stored

  return (
    <section>
      <form onSubmit={add}>
        <label htmlFor="new-todo">New task</label>
        <input id="new-todo" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <ul>
        {visible.map((t) => <TodoItem key={t.id} todo={t} onToggle={toggle} onRemove={remove} onRename={rename} />)}
      </ul>

      <p>{remaining} item{remaining === 1 ? '' : 's'} left</p>
      {(['all', 'active', 'done'] as Filter[]).map((f) => (
        <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>
      ))}
      <button onClick={() => setTodos((p) => p.filter((t) => !t.done))}>Clear completed</button>
    </section>
  );
}

function TodoItem({ todo, onToggle, onRemove, onRename }: {
  todo: Todo; onToggle: (id: string) => void; onRemove: (id: string) => void; onRename: (id: string, t: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  return (
    <li>
      <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} aria-label={`Complete ${todo.text}`} />
      {editing ? (
        <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) { onRename(todo.id, draft.trim()); setEditing(false); }
            if (e.key === 'Escape') { setDraft(todo.text); setEditing(false); }
          }} />
      ) : (
        <span onDoubleClick={() => setEditing(true)}>{todo.text}</span>
      )}
      <button onClick={() => setEditing(true)} aria-label={`Edit ${todo.text}`}>Edit</button>
      <button onClick={() => onRemove(todo.id)} aria-label={`Delete ${todo.text}`}>Delete</button>
    </li>
  );
}
```

**Say it like this:** "The only state is the todos and the filter. The visible list and the counts are derived on each render, so they can never go out of sync. IDs come from `crypto.randomUUID()`, never the index, so editing and deleting don't mix up rows."

---

### Q6. Progress bar

**Short answer:** `role="progressbar"` with `aria-valuenow`, animated with `transform: scaleX()`; for the follow-up, a queue with a concurrency limit.

**Explanation:**

**Requirements:** show percentage progress accessibly. A common follow-up: "Start 5 bars one after another", or "with at most 3 running at a time".

**Performance:** Animate with `transform: scaleX()` (with `transform-origin: left`), not `width`, because transform runs on the GPU and avoids layout work. For the follow-up, keep a queue and start the next bar when one finishes, using a concurrency counter.

**Example:**

```tsx
function ProgressBar({ value }: { value: number }) {
  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}
         aria-label="Upload progress" className="track">
      <div className="fill" style={{ transform: `scaleX(${value / 100})` }} />
    </div>
  );
}
```

**Say it like this:** "I use `role="progressbar"` with the value attributes so screen readers can read it, and animate `transform` instead of `width` so it stays on the compositor. For the 'three at a time' follow-up, it's a queue plus a running counter, the same as a promise pool."

---

### Q7. Toggle switch

**Short answer:** A `<button role="switch">` with `aria-checked`, controlled through `checked` and `onChange` props.

**Explanation:**

Requirements: an on/off control that is keyboard operable and announces its state. A `<button>` gives focus and Enter/Space handling; `role="switch"` with `aria-checked` makes screen readers say "on" or "off".

**Example:**

```tsx
function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
      <span className="sr-only">{label}</span>
      <span className="thumb" aria-hidden="true" />
    </button>
  );
}
```

**Say it like this:** "`role="switch"` with `aria-checked` announces 'on' or 'off'. I'd also offer an uncontrolled version with a `defaultChecked` prop for simple forms."

---

### Q8. Modal dialog

**Short answer:** The native `<dialog>` with `showModal()`, which gives focus trapping, Escape, an inert background and focus restoration.

**Explanation:**

**Requirements:** open and close it; Escape and backdrop clicks close it; focus moves inside and is trapped; focus returns to the trigger on close; background scroll is locked.

**Approach:** The native `<dialog>` element with `showModal()` gives you focus trapping, Escape handling and an inert background for free.

**Example:**

```tsx
function Modal({ open, onClose, title, children }:
  { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();   // traps focus, Escape, inert background
    if (!open && dialog.open) dialog.close();       // browser restores focus to the trigger
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}                                         // Escape key
      onClick={(e) => { if (e.target === ref.current) onClose(); }} // backdrop click
    >
      <h2 id={titleId}>{title}</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </dialog>
  );
}
```

**Say it like this:** "I use the native `dialog` element: `showModal()` gives me a focus trap, Escape to close, an inert background and focus restoration, all accessibility work I'd otherwise hand-roll. If I had to build it manually, I'd use a portal, trap Tab and Shift+Tab, lock body scroll, and save and restore `document.activeElement`."

---

### Q9. Countdown timer / stopwatch

**Short answer:** Don't count ticks: store the time banked before the current run plus when it started, and derive elapsed time from `performance.now()`.

**Explanation:**

**Requirements:** start, pause, resume and reset, with accurate time that doesn't drift.

**Approach:** Don't count ticks, because `setInterval` drifts. Store when it started and how much time had passed before the last pause, and calculate the display from the real clock.

**Example:**

```tsx
function Stopwatch() {
  // base = time accumulated before the current run; startedAt = null when paused
  const [clock, setClock] = useState<{ base: number; startedAt: number | null }>({ base: 0, startedAt: null });
  const [now, setNow] = useState(() => performance.now());
  const running = clock.startedAt !== null;

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = () => { setNow(performance.now()); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);           // stop re-rendering when paused
  }, [running]);

  const start = () => setClock((c) => ({ ...c, startedAt: performance.now() }));
  const pause = () => setClock((c) => ({ base: c.base + performance.now() - (c.startedAt ?? 0), startedAt: null }));
  const reset = () => setClock({ base: 0, startedAt: null });

  const elapsed = clock.base + (running ? now - clock.startedAt! : 0);   // derived, never drifts
  const mm = String(Math.floor(elapsed / 60000)).padStart(2, '0');
  const ss = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
  const ms = String(Math.floor(elapsed % 1000)).padStart(3, '0');

  return (
    <div>
      <time aria-live="off">{mm}:{ss}.{ms}</time>
      <button onClick={running ? pause : start}>{running ? 'Pause' : 'Start'}</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

**Say it like this:** "Counting interval ticks drifts, especially in background tabs. I store only two numbers: the time banked before the current run, and when the current run started. The displayed time is derived from `performance.now()`, so it's always accurate. The rAF loop only exists to trigger re-renders while running."

---

### Q10. Textarea with a character counter

**Short answer:** A controlled textarea with a live count linked by `aria-describedby`, a warning near the limit, and announcements only at thresholds.

**Explanation:**

Requirements: show how many characters remain, warn near the limit, and make the count available to screen readers without announcing every keystroke.

**Example:**

```tsx
function LimitedTextarea({ max = 280 }: { max?: number }) {
  const [text, setText] = useState('');
  const remaining = max - text.length;
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>Comment</label>
      <textarea id={id} value={text} maxLength={max} aria-describedby={`${id}-count`}
                onChange={(e) => setText(e.target.value)} />
      <p id={`${id}-count`} className={remaining < 20 ? 'warn' : ''}>
        {remaining} characters remaining
      </p>
    </div>
  );
}
```

**Say it like this:** "The count is linked to the textarea with `aria-describedby`, so screen readers read it with the field. I only announce at thresholds like 20 characters left, because announcing every keystroke would be noisy."

---

## 🟡 Intermediate Builds (45–75 Minutes)

### Q11. Typeahead / autocomplete with an API

**Short answer:** Debounce the input, check a cache, fetch with an AbortController aborted in cleanup, and use the ARIA combobox pattern with `aria-activedescendant`.

**Explanation:**

**Requirements:** debounced search, loading, empty and error states, keyboard navigation, cancelling stale requests, and caching.

**Approach:**

1. Debounce the input.
2. Check the cache.
3. Fetch with an AbortController, aborting in the effect cleanup.
4. Use the ARIA combobox pattern for accessibility.

**Example:**

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
      .then((r) => { cache.current.set(q, r); setItems(r); setStatus('idle'); setActive(-1); })
      .catch((e) => { if (e.name !== 'AbortError') setStatus('error'); });
    return () => ctrl.abort();                 // cancel stale request when q changes
  }, [q, fetcher]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && active >= 0) { setQuery(items[active]); setItems([]); }
    if (e.key === 'Escape') setItems([]);
  };

  return (
    <div>
      <label htmlFor={`${listId}-input`}>Search agents</label>
      <input
        id={`${listId}-input`}
        role="combobox"
        aria-expanded={items.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {status === 'loading' && <span role="status">Loading…</span>}
      {status === 'error' && <span role="alert">Something went wrong. Try again.</span>}
      {status === 'idle' && q.length >= 2 && items.length === 0 && <span role="status">No results</span>}
      <ul id={listId} role="listbox">
        {items.map((it, i) => (
          <li key={it} id={`${listId}-${i}`} role="option" aria-selected={i === active}
              onMouseDown={() => { setQuery(it); setItems([]); }}>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Say it like this:** "Three things make this production-quality. Debouncing reduces requests. Aborting in the effect cleanup means an old response can never overwrite a newer one. The cache makes going back to a previous query instant. I use `onMouseDown` on options because `onClick` would fire after the input's blur. Focus stays in the input, and `aria-activedescendant` tells screen readers which option is highlighted."

---

### Q12. Infinite-scroll list

**Short answer:** An IntersectionObserver on a sentinel near the bottom, a ref guarding against duplicate loads, deduplication by ID, plus error/retry and end states.

**Explanation:**

**Requirements:** load more as the user nears the bottom, and handle loading, errors with a retry, and the end of the list.

**Example:**

```tsx
function InfiniteList<T extends { id: string }>({ fetchPage, render }:
  { fetchPage: (cursor?: string) => Promise<{ items: T[]; next?: string }>; render: (t: T) => React.ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const sentinel = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);                       // in-flight guard

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setStatus('loading');
    try {
      const page = await fetchPage(cursor);
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));       // dedupe across pages
        return [...prev, ...page.items.filter((i) => !seen.has(i.id))];
      });
      setCursor(page.next);
      setHasMore(Boolean(page.next));
      setStatus('idle');
    } catch {
      setStatus('error');
    } finally {
      loadingRef.current = false;
    }
  }, [cursor, hasMore, fetchPage]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && loadMore(), { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  return (
    <div>
      <ul>{items.map((i) => <li key={i.id}>{render(i)}</li>)}</ul>
      {status === 'loading' && <p role="status">Loading more…</p>}
      {status === 'error' && <button onClick={loadMore}>Couldn't load more. Retry</button>}
      {!hasMore && <p>You've reached the end.</p>}
      <div ref={sentinel} aria-hidden="true" />
    </div>
  );
}
```

**Say it like this:** "An IntersectionObserver on a sentinel element with a 300px `rootMargin` starts loading before the user hits the bottom. A ref guards against duplicate requests, I deduplicate by ID in case pages overlap, and for very long lists I'd add virtualisation."

---

### Q13. Paginated data table

**Short answer:** Keep page, size, sort and filters in the URL; fetch with `keepPreviousData`; sortable header buttons with `aria-sort`; the ellipsis page window from DSA Q59.

**Explanation:**

**Requirements:** pages with an ellipsis window, a page-size selector, column sorting, filters synced to the URL, skeleton rows while loading, and keeping the previous data visible while the next page loads.

**Approach and key points:**

- Keep `page`, `pageSize`, `sort` and `filters` in the URL (`useSearchParams`), so views can be shared and survive a refresh.
- Fetch with a query library and `placeholderData: keepPreviousData`, so the table doesn't flash empty between pages.
- Sortable headers are buttons inside `<th>` with `aria-sort="ascending"` or `"descending"`.
- The page buttons use the `pageWindow()` function from DSA Q59.

**Example:**

```tsx
<th aria-sort={sort.key === 'score' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
  <button onClick={() => toggleSort('score')}>Score</button>
</th>
```

**Say it like this:** "Putting the table state in the URL makes views shareable and survives a refresh. `keepPreviousData` stops the table flashing empty between pages, and the sort headers expose `aria-sort` so screen readers know the order."

---

### Q14. Nested comments / threaded replies

**Short answer:** Convert the flat list to a tree (DSA Q54) and render it with a recursive component, capping visual depth.

**Explanation:**

**Approach:** Convert the flat API list into a tree (DSA Q54), then render it with a **recursive component**.

**Example:**

```tsx
type CommentNode = { id: string; author: string; text: string; children: CommentNode[] };

function Comment({ node, depth = 0 }: { node: CommentNode; depth?: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  return (
    <li>
      <p><strong>{node.author}</strong> {node.text}</p>
      <button onClick={() => setReplying((r) => !r)}>Reply</button>
      {node.children.length > 0 && (
        <button aria-expanded={!collapsed} onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? `Show ${node.children.length} replies` : 'Hide replies'}
        </button>
      )}
      {replying && <ReplyForm parentId={node.id} onDone={() => setReplying(false)} />}
      {!collapsed && node.children.length > 0 && (
        depth < 5
          ? <ul>{node.children.map((c) => <Comment key={c.id} node={c} depth={depth + 1} />)}</ul>
          : <a href={`/thread/${node.id}`}>Continue this thread →</a>
      )}
    </li>
  );
}
```

**Say it like this:** "The recursion mirrors the data. I cap the visual depth at 5 with a 'continue thread' link, so deep threads stay readable on mobile, and new replies are added optimistically."

---

### Q15. File explorer tree

**Short answer:** The ARIA tree pattern with a `Set` of expanded IDs, a normalised `byId` map, lazily loaded children, and arrow-key navigation.

**Explanation:**

**Requirements:** recursive folders, expand and collapse, select, keyboard navigation, lazily loaded children, and add, rename and delete.

**Key points:**

- Use the ARIA tree pattern: `role="tree"`, `role="treeitem"`, `aria-expanded`, and `role="group"` for children.
- Keyboard: Up and Down move between visible items, Right expands or moves to the first child, Left collapses or moves to the parent, and Enter selects.
- Store the expanded IDs in a `Set`. Fetch children on first expand and cache them.
- Use a normalised `byId` map, so rename and delete are O(1) updates.

**Example:**

```tsx
function TreeNode({ id, depth }: { id: string; depth: number }) {
  const node = useTree((s) => s.byId[id]);
  const expanded = useTree((s) => s.expanded.has(id));
  return (
    <li role="treeitem" aria-expanded={node.isFolder ? expanded : undefined} aria-level={depth}>
      <span onClick={() => toggle(id)}>{node.name}</span>
      {expanded && node.childIds && (
        <ul role="group">{node.childIds.map((c) => <TreeNode key={c} id={c} depth={depth + 1} />)}</ul>
      )}
    </li>
  );
}
```

**Say it like this:** "It's the ARIA tree pattern: arrow keys move through visible items, Right and Left expand and collapse. Children load on first expand and are cached, and a normalised map makes rename and delete simple updates."

---

### Q16. Multi-step form (wizard)

**Short answer:** A config array of steps, each with fields and a Zod schema; validate on Next, keep one data object, and move focus to the step heading.

**Explanation:**

**Approach:** A config array of steps, each with its fields and a Zod schema. Validate the current step on Next, keep all the data in one state object, show a summary at the end, and move focus to the step heading when the step changes.

**Example:**

```tsx
const steps = [
  { title: 'Patient details', schema: z.object({ name: z.string().min(1), dob: z.string() }) },
  { title: 'Language', schema: z.object({ language: z.string().min(1) }) },
  { title: 'Review', schema: z.object({}) },
];

function Wizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus(); }, [step]);

  const next = () => {
    const result = steps[step].schema.safeParse(data);
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(data); }}>
      <p>Step {step + 1} of {steps.length}</p>
      <h2 ref={headingRef} tabIndex={-1}>{steps[step].title}</h2>
      {/* render fields for this step, showing errors[field] with aria-describedby */}
      {step > 0 && <button type="button" onClick={() => setStep((s) => s - 1)}>Back</button>}
      {step < steps.length - 1
        ? <button type="button" onClick={next}>Next</button>
        : <button type="submit">Submit</button>}
    </form>
  );
}
```

**Say it like this:** "Each step has its own schema, so Next only validates what's on screen. All answers live in one object, so Back never loses data. When the step changes I move focus to the new heading, so screen-reader users know where they are."

---

### Q17. OTP input

**Short answer:** N single-character inputs with refs: auto-advance, Backspace goes back, paste fills all boxes, numeric keyboard and `autocomplete="one-time-code"`.

**Explanation:**

**Requirements:** N boxes, auto-advance, Backspace moves back, pasting the full code works, numbers only, and submit when complete.

**Example:**

```tsx
function OTP({ length = 6, onComplete }: { length?: number; onComplete: (code: string) => void }) {
  const [vals, setVals] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');            // numbers only
    if (!digits) return;
    const next = [...vals];
    digits.split('').slice(0, length - i).forEach((d, k) => (next[i + k] = d)); // supports paste
    setVals(next);
    refs.current[Math.min(i + digits.length, length - 1)]?.focus();
    if (next.every(Boolean)) onComplete(next.join(''));
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return;
    if (vals[i]) {
      const n = [...vals]; n[i] = ''; setVals(n);      // clear current box
    } else if (i > 0) {
      refs.current[i - 1]?.focus();                     // move back
    }
  };

  return (
    <div role="group" aria-label="One-time code">
      {vals.map((v, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={v}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1} of ${length}`}
          maxLength={length}
          onChange={(e) => update(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
        />
      ))}
    </div>
  );
}
```

**Say it like this:** "`maxLength` equals the full length, so pasting a 6-digit code into any box fills all of them. `inputMode="numeric"` shows the number pad, and `autocomplete="one-time-code"` lets iOS and Android autofill from SMS."

---

### Q18. Toast notification system

**Short answer:** A small store with a `toast()` function callable anywhere, a provider rendering a capped list in a live region, and timers that pause on hover.

**Explanation:**

**Requirements:** a `toast()` function callable from anywhere, a queue with a maximum number visible, auto-dismiss that pauses on hover, accessible announcements.

**Note:** For screen readers to reliably announce toasts, render the live-region container on page load and add the toast text into it afterwards (see HTML Q80).

**Example:**

```tsx
type Toast = { id: string; title: string; variant: 'info' | 'error'; duration: number };
const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((t: Omit<Toast, 'id'>) =>
    setToasts((prev) => [...prev, { ...t, id: crypto.randomUUID() }].slice(-3)), []);   // max 3 visible

  return (
    <ToastCtx value={toast}>
      {children}
      {createPortal(
        <div className="toast-region">
          {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
        </div>,
        document.body,
      )}
    </ToastCtx>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(t);
  }, [paused, toast, onDismiss]);
  return (
    <div role={toast.variant === 'error' ? 'alert' : 'status'}
         onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
         onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      {toast.title}
      <button aria-label="Dismiss" onClick={() => onDismiss(toast.id)}>×</button>
    </div>
  );
}
```

**Say it like this:** "Anyone can call `toast()` without prop drilling. The live region is rendered on page load so announcements are reliable. Errors use `role="alert"`, the rest are polite, and timers pause on hover so users can read them."

---

### Q19. Image carousel

**Short answer:** Index state with wrap-around, prev/next and dot buttons, autoplay with a visible pause button, swipe or `scroll-snap`, and lazy-loaded neighbours.

**Explanation:**

**Key points:**

- Previous and next buttons, plus dots, which are buttons labelled "Go to slide 3".
- Autoplay that pauses on hover and focus, *and* a visible pause button (WCAG 2.2.2).
- Swipe with pointer events, or simply CSS `scroll-snap`.
- An infinite loop using `(index + 1) % length`.
- Lazy-load the neighbouring slides only.
- `aria-roledescription="carousel"` on the container, and each slide labelled "3 of 8".

**Example:**

```tsx
const next = () => setIndex((i) => (i + 1) % slides.length);
const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

<section aria-roledescription="carousel" aria-label="Product images">
  <button onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Play'}</button>
  <div aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}>
    <img src={slides[index].src} alt={slides[index].alt} />
  </div>
  <button onClick={prev} aria-label="Previous slide">‹</button>
  <button onClick={next} aria-label="Next slide">›</button>
</section>
```

**Say it like this:** "Autoplay needs a visible pause button for WCAG, and it pauses on hover and focus. Dots are real labelled buttons, and only neighbouring images load, so it's light on mobile."

---

### Q20. Kanban board

**Short answer:** Normalised columns and cards, dnd-kit for accessible drag and drop, optimistic moves with rollback, and fractional indexes for ordering.

**Explanation:**

**Key points:** Normalise columns (holding card IDs) and cards. Use dnd-kit for drag and drop, because it supports the keyboard, unlike basic HTML5 drag and drop. Moves are optimistic, with a rollback on failure, and ordering uses fractional indexes (see System Design, Design 10).

**Example:**

```ts
type Board = {
  columns: Record<string, { id: string; title: string; cardIds: string[] }>;
  cards: Record<string, { id: string; title: string; rank: string }>;
};

function moveCard(b: Board, cardId: string, from: string, to: string, index: number): Board {
  const src = b.columns[from].cardIds.filter((id) => id !== cardId);
  const dst = from === to ? src : [...b.columns[to].cardIds];
  dst.splice(index, 0, cardId);
  return { ...b, columns: { ...b.columns, [from]: { ...b.columns[from], cardIds: src }, [to]: { ...b.columns[to], cardIds: dst } } };
}
```

**Say it like this:** "I'd normalise columns and cards so a move is just changing two ID arrays. dnd-kit gives keyboard drag and drop, which native drag and drop doesn't. Moves are optimistic with rollback, and fractional indexes mean only the moved card is updated on the server."

---

### Q21. Polling with backoff that pauses in hidden tabs

**Short answer:** A `setTimeout` chain (not `setInterval`) that pauses in hidden tabs, backs off exponentially on errors, and stops when the job is done.

**Explanation:**

Requirements: poll a job status endpoint until it finishes, without overlapping requests, without wasting requests in background tabs, and slowing down when the server errors.

**Example:**

```tsx
function usePolling<T>(fn: () => Promise<T>, { interval = 5000, until }: { interval?: number; until?: (d: T) => boolean } = {}) {
  const [data, setData] = useState<T>();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let failures = 0;
    let stopped = false;

    const run = async () => {
      if (document.visibilityState === 'hidden') { timer = setTimeout(run, interval); return; }
      try {
        const d = await fn();
        if (stopped) return;
        setData(d);
        failures = 0;
        if (until?.(d)) return;                                    // job finished: stop polling
      } catch {
        failures++;
      }
      const delay = failures ? Math.min(60_000, interval * 2 ** failures) : interval; // backoff
      timer = setTimeout(run, delay);
    };
    run();
    return () => { stopped = true; clearTimeout(timer); };
  }, [fn, interval, until]);
  return data;
}

// usage: const job = usePolling(() => getScoringJob(id), { until: (j) => j.status === 'done' });
```

**Say it like this:** "I use a `setTimeout` chain rather than `setInterval`, so requests never overlap. Polling pauses in hidden tabs, backs off on errors, and stops when the job is done."

---

### Q22. Like button with an optimistic update

**Short answer:** Update the UI immediately, send the request, roll back on failure, and use a `latest` ref so an old failure can't undo a newer click.

**Explanation:**

Requirements: the like count and icon change instantly, the server is updated in the background, and a failure rolls the UI back without breaking rapid clicks.

**Example:**

```tsx
function LikeButton({ postId, initialLiked }: { postId: string; initialLiked: boolean }) {
  const [liked, setLiked] = useState(initialLiked);
  const latest = useRef(initialLiked);                     // latest user intent

  const toggle = async () => {
    const next = !liked;
    setLiked(next);                                        // optimistic
    latest.current = next;
    try {
      await api.setLike(postId, next);
    } catch {
      if (latest.current === next) {                       // only roll back if no newer click
        setLiked(!next);
        latest.current = !next;
        toast({ title: 'Could not update like', variant: 'error', duration: 4000 });
      }
    }
  };

  return <button aria-pressed={liked} onClick={toggle}>{liked ? '♥ Liked' : '♡ Like'}</button>;
}
```

**Say it like this:** "The UI updates immediately. The `latest` ref handles rapid double-clicks: an old failing request won't roll back a newer click. In production I'd also debounce the server call, so five quick toggles become one request."

---

## 🔴 Advanced Builds (Senior Rounds)

### Q23. Virtualised list from scratch (fixed row height)

**Short answer:** Render only rows in the visible window plus overscan, positioned inside a full-height spacer, using `scrollTop / rowHeight`.

**Explanation:**

**Idea:** Only render the rows inside the visible scroll window, plus a few extra ("overscan"). A tall inner spacer element keeps the scrollbar the correct size.

**Follow-ups:** Dynamic row heights (measure each row with ResizeObserver, cache the offsets, and binary-search the first visible row), scroll-to-index, and sticky headers.

**Example:**

```tsx
function VirtualList<T>({ items, rowHeight, height, render }:
  { items: T[]; rowHeight: number; height: number; render: (t: T, i: number) => React.ReactNode }) {
  const [scrollTop, setScrollTop] = useState(0);
  const overscan = 5;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(items.length, Math.ceil((scrollTop + height) / rowHeight) + overscan);

  return (
    <div style={{ height, overflowY: 'auto' }} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
      <div style={{ height: items.length * rowHeight, position: 'relative' }}>
        {items.slice(start, end).map((item, k) => (
          <div key={start + k}
               style={{ position: 'absolute', top: (start + k) * rowHeight, height: rowHeight, left: 0, right: 0 }}>
            {render(item, start + k)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Say it like this:** "With 100,000 rows, we render only about 30 DOM nodes. The maths is just `scrollTop / rowHeight` for the first visible index. A spacer div gives the scrollbar its true length."

---

### Q24. Undo/redo editor

**Short answer:** Keep `past`, `present` and `future` in a reducer; undo moves present into future and pops past; any new edit clears future.

**Explanation:**

Requirements: undo and redo text edits with keyboard shortcuts.

**Key points:** Bind Ctrl/Cmd+Z for undo and Ctrl/Cmd+Shift+Z for redo. Merge rapid typing into one history entry with a debounce. Cap the history length. For large documents, store *commands* (do and undo functions) instead of full snapshots.

**Example:**

```ts
function useHistory<T>(initial: T) {
  const [state, setState] = useState({ past: [] as T[], present: initial, future: [] as T[] });

  const set = (value: T) =>
    setState((s) => ({ past: [...s.past, s.present], present: value, future: [] }));   // new edit clears redo

  const undo = () =>
    setState((s) => s.past.length
      ? { past: s.past.slice(0, -1), present: s.past.at(-1)!, future: [s.present, ...s.future] }
      : s);

  const redo = () =>
    setState((s) => s.future.length
      ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) }
      : s);

  return { value: state.present, set, undo, redo, canUndo: state.past.length > 0, canRedo: state.future.length > 0 };
}
```

**Say it like this:** "Undo/redo is three stacks: past, present and future. A new edit clears the future. I group rapid typing into one entry and cap the history; for large documents I'd store commands instead of snapshots."

---

### Q25. Mini spreadsheet with formulas

**Short answer:** Parse formulas for references, build a dependency graph, recompute dependents in topological order, and show `#CYCLE` on cycles.

**Explanation:**

**Key points:** A grid of cells with formulas like `=A1+B2`. Parse each formula to find its references and build a dependency graph. When a cell changes, recompute its dependents in topological order, and show `#CYCLE` when you detect a cycle (DSA Q64). Virtualise rows and columns for large sheets.

**Example:**

```ts
const refs = (formula: string) => formula.match(/[A-Z]+\d+/g) ?? [];   // "=A1+B2" → ["A1", "B2"]

// dependents: A1 → [C1] means C1 must be recomputed when A1 changes
function onCellChange(id: string) {
  const order = topoSort(dependentsOf(id));      // throws on a cycle
  for (const cell of order) values[cell] = evaluate(cells[cell].formula);
}
```

**Say it like this:** "Every cell's formula gives its dependencies, so the sheet is a graph. When a cell changes I recompute its dependents in topological order, and a cycle shows `#CYCLE` instead of looping forever."

---

### Q26. Drag-to-select grid (calendar slot picker)

**Short answer:** Track start and current cells with pointer events and `setPointerCapture`; the selection is the rectangle between them; add a keyboard alternative.

**Explanation:**

**Key points:** Track the start cell on `pointerdown` and the current cell on `pointermove`. The selection is the rectangle between them, finalised on `pointerup`. Use `setPointerCapture` so dragging outside the grid still works. Provide a keyboard alternative (Shift+Arrow keys) and announce "3 slots selected".

**Example:**

```tsx
const onPointerDown = (e: React.PointerEvent, cell: Cell) => {
  e.currentTarget.setPointerCapture(e.pointerId);
  setDrag({ start: cell, end: cell });
};
const onPointerMove = (cell: Cell) => drag && setDrag({ ...drag, end: cell });
const inSelection = (c: Cell) =>
  drag && between(c.row, drag.start.row, drag.end.row) && between(c.col, drag.start.col, drag.end.col);
```

**Say it like this:** "Pointer capture keeps the drag working outside the grid, the selection is just the rectangle between two cells, and there's a Shift+Arrow alternative with an announcement for keyboard users."

---

### Q27. Calendar month view

**Short answer:** Build a 6×7 grid of dates starting from the week containing the 1st, group events by day key, and use the grid keyboard pattern.

**Explanation:**

**Key points:** Group events by day key. Show "+3 more" when a day overflows. Use arrow-key navigation between days (the grid pattern). Be explicit about time zones.

**Example:**

```ts
function monthGrid(year: number, month: number, weekStartsOn = 1 /* Monday */) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) =>                     // 6 weeks × 7 days
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}
```

**Say it like this:** "The grid always has six weeks, starting on the week containing the 1st. Events are grouped by a day key once, so each cell looks up in O(1), and I'm explicit about the user's time zone."

---

### Q28. Chat UI with streaming responses

**Short answer:** A message list with streamed tokens through `fetch` and a reader, a Stop button wired to an AbortController, and smart auto-scroll.

**Explanation:**

**Key points:**

- A message list (reverse virtualised for long histories).
- Enter sends and Shift+Enter adds a newline.
- Stream tokens through `fetch` (JavaScript Q143), with a Stop button wired to an AbortController.
- Retry for failed messages.
- Auto-scroll only when the user is near the bottom.
- Sanitised markdown, a copy button, and an error state per message.

**Example:**

```ts
const nearBottom = (el: HTMLElement) => el.scrollHeight - el.scrollTop - el.clientHeight < 80;
```

**Say it like this:** "Tokens stream in through a reader, the Stop button aborts the request, and I only auto-scroll when the user is near the bottom so I don't yank them away from what they're reading. Markdown is sanitised before rendering."

---

### Q29. Rich typeahead with grouped results and recent searches

**Short answer:** A combobox with grouped sections (`role="group"` plus labels), arrow keys across groups, recent searches in localStorage, and highlighted matches.

**Explanation:**

**Key points:** Sections (people, calls, reports) with group headings (`role="group"` plus a label). Arrow keys move across groups. Recent searches live in localStorage, and only if they're non-sensitive. Highlight matches with DSA Q58, and send analytics on selection.

**Example:**

```tsx
<ul role="listbox" id="search-results">
  {groups.map((g) => (
    <li key={g.id} role="presentation">
      <div id={`grp-${g.id}`}>{g.label}</div>
      <ul role="group" aria-labelledby={`grp-${g.id}`}>
        {g.items.map((item) => (
          <li key={item.id} role="option" id={item.id} aria-selected={item.id === activeId}>
            {highlight(item.label, query).map((p, i) => (p.match ? <mark key={i}>{p.text}</mark> : p.text))}
          </li>
        ))}
      </ul>
    </li>
  ))}
</ul>
```

**Say it like this:** "It's still one combobox, just with grouped options. Arrow keys move through every result across groups. Recent searches are stored locally only if they aren't sensitive, and matches are highlighted without `innerHTML`."

---

### Q30. Feature-flagged component with remote config

**Short answer:** Fetch flags at boot (or on the server), provide them through context, fall back to safe defaults, and allow dev overrides.

**Explanation:**

**Key points:** Fetch flags at boot (or on the server for SSR, to avoid flicker), use safe defaults if the fetch fails, and allow overrides in development.

**Example:**

```tsx
const FlagsCtx = createContext<Record<string, boolean>>({});
export const useFlag = (name: string, fallback = false) => useContext(FlagsCtx)[name] ?? fallback;

// Dev override: ?flag:newScorecard=true
function readOverrides() {
  const params = new URLSearchParams(location.search);
  return Object.fromEntries([...params].filter(([k]) => k.startsWith('flag:')).map(([k, v]) => [k.slice(5), v === 'true']));
}
```

**Say it like this:** "Flags load once at boot, or on the server to avoid a flicker, and every flag has a safe default if the fetch fails. Components just ask `useFlag('newScorecard')`."

---

## 🎯 Resume-Inspired Builds (Practise These; They Double as Talking Points)

### Q31. Video call control bar

**Short answer:** Toggle buttons with `aria-pressed` and state-based labels, keyboard shortcuts, a device picker, leave confirmation, and a reconnecting banner.

**Explanation:**

**Requirements:** mic, camera, screen share, layout and leave buttons.

**Key points:**

- Toggles use `aria-pressed`, and the labels change with state ("Mute microphone" or "Unmute microphone").
- Keyboard shortcuts (M, V), declared with `aria-keyshortcuts`.
- A device picker built on `enumerateDevices`, listening for the `devicechange` event.
- Confirmation before leaving.
- Buttons are disabled while a toggle is in progress.
- A "Reconnecting…" banner driven by the connection state machine.

**Example:**

```tsx
<button aria-pressed={muted} aria-keyshortcuts="M" onClick={toggleMic} disabled={pending}>
  {muted ? <MicOffIcon aria-hidden /> : <MicIcon aria-hidden />}
  <span className="sr-only">{muted ? 'Unmute microphone' : 'Mute microphone'}</span>
</button>
```

**Say it like this:** "This mirrors the InterpretIQ call bar. Toggles use `aria-pressed` and their labels change with state, shortcuts are declared with `aria-keyshortcuts`, and a reconnecting banner comes from the LiveKit connection state."

---

### Q32. Pre-join device check screen

**Short answer:** Ask for permissions on click, show a live preview, drive a mic meter from an `AnalyserNode` in rAF via a CSS variable, and handle permission errors.

**Explanation:**

**Key points:** Request permissions on a click, not on page load. Show a live camera preview, and a microphone level meter that uses a Web Audio `AnalyserNode` in a rAF loop, writing to a CSS variable rather than React state on every frame. Add device selectors, and handle `NotAllowedError` and `NotFoundError`. Join stays disabled until the devices are ready.

**Example:**

```ts
const ctx = new AudioContext();
const analyser = ctx.createAnalyser();
ctx.createMediaStreamSource(stream).connect(analyser);
const data = new Uint8Array(analyser.frequencyBinCount);
const loop = () => {
  analyser.getByteFrequencyData(data);
  const level = data.reduce((a, b) => a + b, 0) / data.length / 255;
  meterRef.current?.style.setProperty('--level', level.toFixed(2));
  raf = requestAnimationFrame(loop);
};
```

**Say it like this:** "Permissions are requested on a click, not on load, so the browser prompt makes sense. The mic meter writes to a CSS variable in rAF instead of setting React state 60 times a second, and each permission error gets a clear message."

---

### Q33. QA scorecard form

**Short answer:** A config-driven form with live derived weighted scores, conditional required comments, debounced draft autosave, Zod validation and role-based access.

**Explanation:**

**Key points:**

- Sections and questions come from a JSON config.
- The weighted total is computed live, as derived state.
- A comment is required when a score is below a threshold.
- Drafts autosave with a debounce.
- Submission shows an optimistic status.
- Role-based access: agents get read-only, QA reviewers edit, admins can override.
- Zod validation.

**Example:**

```ts
const total = sections.reduce(
  (sum, s) => sum + s.questions.reduce((q, item) => q + (answers[item.id] ?? 0) * item.weight, 0),
  0,
);
```

**Say it like this:** "This is close to the BpoBox scorecard. The total is derived, never stored, so it can't go out of sync. Drafts autosave with a debounce, and roles decide who can edit and override."

---

### Q34. Transcript viewer synced to audio

**Short answer:** Click a line to seek; on `timeupdate`, binary-search the active line, highlight it, and auto-scroll unless the user is scrolling.

**Explanation:**

**Key points:** Clicking a line seeks the audio. The active line is highlighted on `timeupdate` using binary search. The active line auto-scrolls into view unless the user is scrolling. Search within the transcript supports next and previous match navigation. You can jump to AI-flagged compliance moments, and lines show speaker labels.

**Example:**

```tsx
function useActiveLine(audio: HTMLAudioElement | null, lines: { start: number }[]) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!audio) return;
    const onTime = () => {
      const t = audio.currentTime;
      let lo = 0, hi = lines.length - 1, ans = 0;
      while (lo <= hi) {
        const m = (lo + hi) >> 1;
        if (lines[m].start <= t) { ans = m; lo = m + 1; } else hi = m - 1;
      }
      setIdx((prev) => (prev === ans ? prev : ans));      // avoid useless re-renders
    };
    audio.addEventListener('timeupdate', onTime);
    return () => audio.removeEventListener('timeupdate', onTime);
  }, [audio, lines]);
  return idx;
}
```

**Say it like this:** "`timeupdate` fires several times a second, so I binary-search the active line. The view follows playback unless the user is scrolling, and you can jump straight to AI-flagged compliance moments."

---

### Q35. Multi-tenant theme switcher

**Short answer:** Load the tenant config and set CSS variables on the root, so semantic-token components restyle instantly; warn on poor contrast.

**Explanation:**

**Key points:** Load the tenant config and set the CSS variables. Components using semantic tokens update instantly. Warn when a palette fails a contrast check:

**Example:**

```ts
function applyTheme(theme: Record<string, string>) {
  for (const [token, value] of Object.entries(theme)) {
    document.documentElement.style.setProperty(`--${token}`, value);
  }
}
```

**Say it like this:** "Each tenant's config just sets CSS variables, so every component using semantic tokens updates instantly with no re-render. I check contrast so a tenant's brand colour can't break accessibility."

---

### Q36. Role-based navigation

**Short answer:** A permission map filters nav items, route guards protect pages, and a 403 page handles direct access; test each role.

**Explanation:**

**Key points:** A permission map filters the nav items, route guards protect pages, and there's a "403 – You don't have access" page. Test each role.

**Example:**

```tsx
const nav = [
  { to: '/calls', label: 'Calls', perm: 'calls:read' },
  { to: '/scoring', label: 'Scoring', perm: 'calls:score' },
  { to: '/admin', label: 'Admin', perm: 'users:manage' },
] as const;

function Nav({ role }: { role: Role }) {
  return <nav>{nav.filter((n) => can(role, n.perm)).map((n) => <Link key={n.to} to={n.to}>{n.label}</Link>)}</nav>;
}
```

**Say it like this:** "Permissions live in one map, so the nav and the route guards can't disagree. Hiding a link isn't security, so the API checks roles too, and I test each role's view. In BpoBox, agents, QA reviewers and admins each saw a different navigation."

---

## ✅ Self-Review Checklist (Say These Out Loud at the End)

- Loading, empty, error and success states are all handled.
- The keyboard works, focus is visible, elements are semantic, and ARIA is used only where needed.
- No memory leaks: timers, listeners, observers and requests are cleaned up.
- Stale requests are handled (abort, or latest-only).
- Keys are stable, with no index keys for dynamic lists.
- Derived state is computed, not duplicated.
- Components are small and well named, with logic extracted into hooks.
- Edge cases are covered: very long text, zero items, many items, a slow network, double clicks.
- With more time I'd add tests (RTL), virtualisation, persistence and i18n.

**Say it like this (closing):** "To summarise, the core flow works end to end, and loading, empty and error states are handled. It's keyboard accessible, and everything is cleaned up on unmount. With more time I'd add RTL tests for the main interactions, virtualisation if the list could get large, and extract the data fetching into a query library."
