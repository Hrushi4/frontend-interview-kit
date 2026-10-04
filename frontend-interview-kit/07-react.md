# 07 — React (18 / 19)

**How this file is organised**

- **Part A — Understand the topic:** what React is, how components, state, rendering and hooks work, and what's new in React 18 and 19, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → React 19 → Testing → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is React?

React is a JavaScript library for building user interfaces out of **components**: small, reusable pieces like `<Button>`, `<VideoTile>` or `<CallList>`. Its core idea is simple:

> **UI = f(state)**. You describe what the screen should look like for the current data, and React updates the real DOM to match.

You don't write "find this element and change its text". You write "if muted, show the muted icon", and React handles the DOM updates.

```tsx
function MuteButton({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
  return (
    <button aria-pressed={isMuted} onClick={onToggle}>
      {isMuted ? 'Unmute' : 'Mute'}
    </button>
  );
}
```

### Components, props and state

- A **component** is a function that returns JSX, which describes the UI.
- **Props** are inputs passed from a parent. They're read-only, like function arguments.
- **State** is data a component owns that changes over time. Changing state makes React re-run the component (re-render) and update the screen.

```text
<CallPage>             state: participants
   ├── <VideoGrid participants={participants} />     ← props flow DOWN
   └── <Controls onLeave={handleLeave} />            ← events flow UP via callbacks
```

### How rendering works

1. **Trigger:** state changes (or the parent re-renders, or a context value changes).
2. **Render phase:** React calls your component functions to get the new JSX. This must be **pure**: no side effects.
3. **Reconciliation:** React compares the new tree with the previous one (the "diff") to find what changed.
4. **Commit phase:** React applies only the necessary DOM changes.
5. **Effects:** after the screen updates, React runs `useEffect` callbacks.

A **re-render doesn't mean the DOM changes**. React re-runs your function, but touches the DOM only where the output actually differs.

### Hooks

Hooks are functions starting with `use` that let function components use React features:

| Hook | Purpose |
|---|---|
| `useState` | local state |
| `useEffect` | synchronise with outside systems (subscriptions, timers, network) |
| `useRef` | a mutable box that survives re-renders without causing them; DOM access |
| `useMemo` / `useCallback` | cache a computed value or function between renders |
| `useReducer` | state with complex transitions |
| `useContext` | read shared data without passing props through every level |
| `useTransition` / `useDeferredValue` | keep the UI responsive during heavy updates |

**Rules of Hooks:** call them only at the top level (never inside conditions or loops), and only from components or custom hooks. React relies on the *call order* to know which state belongs to which hook.

### What changed in React 18 and 19

- **React 18:** concurrent rendering (React can pause and prioritise work), automatic batching of state updates, `useTransition`, `useDeferredValue`, streaming server rendering and Suspense improvements.
- **React 19:** Actions (async functions for forms and mutations), `useActionState`, `useFormStatus`, `useOptimistic`, the `use()` hook, `ref` as a normal prop, `<Context>` used directly as the provider, and document metadata (`<title>`) inside components. React Server Components became stable for frameworks like Next.js.

### Why interviewers ask about React

React is the core of most frontend interviews. For a senior candidate they go beyond "what is useState" to:

- **why** something re-renders, and how to fix performance problems
- correct use of effects (and when you *don't* need one)
- state architecture: local vs context vs store vs server cache
- concurrent features and Server Components
- testing strategy
- real-world integrations like your LiveKit video and SSE streaming chat

---

## Part B — Interview Questions and Answers

Every answer below has four parts: **Short answer** (say this first), **Explanation** (add if asked for more), **Example** (code or a real situation) and **Say it like this** (a sample spoken answer).

## 🟢 Level 1 — Basics

**Q1. What is React?**

**Short answer:** A JavaScript library for building UIs from components, where the UI is a function of state and React updates the DOM to match.

**Explanation:** You describe what the screen should look like for the current data; React works out the minimal DOM changes. One-way data flow and components make large UIs predictable.

**Example:**

```tsx
function MuteButton({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
  return <button aria-pressed={isMuted} onClick={onToggle}>{isMuted ? 'Unmute' : 'Mute'}</button>;
}
```

**Say it like this:** "React lets me describe what the UI should look like for any state, and it figures out the DOM changes. Thinking in components and one-way data flow keeps large apps predictable."

---

**Q2. Declarative vs imperative?**

**Short answer:** Declarative describes *what* the UI should be for a state; imperative describes step by step *how* to change the DOM.

**Explanation:** Declarative code doesn't need to track what the DOM currently looks like, which removes a whole class of out-of-sync bugs.

**Example:**

```tsx
{isMuted ? <MicOffIcon /> : <MicIcon />}                        // declarative
if (isMuted) { icon.src = 'mic-off.svg'; btn.setAttribute('aria-pressed', 'true'); } // imperative
```

**Say it like this:** "With declarative UI I describe the end state and React handles the transitions, so the DOM can't drift from the data."

---

**Q3. What is JSX?**

**Short answer:** HTML-like syntax that compiles to JavaScript calls (`jsx()` or `React.createElement`) producing plain objects that describe the UI.

**Explanation:** Differences from HTML: `className`, `htmlFor`, camelCase events, expressions in `{}`, and every element must close. JSX escapes text by default, which protects against XSS.

**Example:**

```tsx
<button className="btn" onClick={join}>Join</button>
// ≈ jsx('button', { className: 'btn', onClick: join, children: 'Join' })
```

**Say it like this:** "JSX is syntax sugar for function calls that create element objects. It looks like HTML but it's JavaScript, and it escapes text by default."

---

**Q4. Element vs component vs instance?**

**Short answer:** An element is a plain object describing UI, a component is a function returning elements, and an instance (fiber) is React's internal record of a mounted component holding its state.

**Explanation:** Elements are cheap and recreated every render; the fiber persists between renders, which is where hooks store state.

**Example:** `<CallRow call={c} />` creates an element `{ type: CallRow, props: { call: c } }`; React keeps one fiber per mounted `CallRow` with its state.

**Say it like this:** "Elements are descriptions, components are functions producing them, and fibers are React's persistent bookkeeping where state lives."

---

**Q5. Function components vs class components?**

**Short answer:** Function components with hooks are the standard; classes remain only in legacy code and for error boundaries.

**Explanation:** Hooks share logic more easily than HOCs or render props, and avoid `this` binding problems. Error boundaries still need a class or a library.

**Example:**

```tsx
function Timer() { const [s, setS] = useState(0); useInterval(() => setS((x) => x + 1), 1000); return <span>{s}</span>; }
```

**Say it like this:** "I write function components with hooks; the only class I use is an error boundary, usually via `react-error-boundary`."

---

**Q6. Props vs state?**

**Short answer:** Props are read-only inputs from the parent; state is data the component owns that changes over time and triggers re-renders.

**Explanation:** If two components need the same state, lift it to their common parent and pass it down as props.

**Example:**

```tsx
function Counter({ step }: { step: number }) {         // step = prop
  const [count, setCount] = useState(0);                // count = state
  return <button onClick={() => setCount((c) => c + step)}>{count}</button>;
}
```

**Say it like this:** "Props are like function arguments the parent controls; state is the component's own memory."

---

**Q7. Why must props be treated as immutable?**

**Short answer:** React and memoization compare props by reference, so mutating a prop keeps the same reference and React may skip the update.

**Explanation:** Mutation is also a side effect on the parent's data, making bugs hard to trace.

**Example:**

```tsx
props.call.score = 90;                       // ❌ parent's data silently changed
onScoreChange({ ...props.call, score: 90 }); // ✅ ask the parent to update
```

**Say it like this:** "Children request changes through callbacks; they never mutate props, or memoization and rendering break."

---

**Q8. What are the basics of `useState`?**

**Short answer:** It returns the current value and a setter; use the functional form when the new value depends on the previous one.

**Explanation:** Within a render, state is a snapshot, so two `setCount(count + 1)` calls only add 1. Functional updates read the latest value.

**Example:**

```tsx
setCount(count + 1); setCount(count + 1);        // +1
setCount((c) => c + 1); setCount((c) => c + 1);  // +2
```

**Say it like this:** "Whenever the next value depends on the previous one, I use the functional updater, so batching can't make me read stale state."

---

**Q9. What is lazy initial state?**

**Short answer:** Passing a function to `useState` so the expensive initial computation runs only on the first render.

**Explanation:** Without the function, the expression is evaluated on every render and the result thrown away.

**Example:**

```tsx
const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('settings') ?? '{}'));
```

**Say it like this:** "For expensive initial values like parsing storage, I pass an initializer function so it runs once."

---

**Q10. What are the conditional rendering patterns?**

**Short answer:** `&&`, the ternary operator, early returns, and object maps from keys to components.

**Explanation:** Watch out for `{count && …}` rendering "0". Early returns keep loading and error states readable.

**Example:**

```tsx
if (!user) return <Login />;
{isLoading && <Spinner />}
{error ? <ErrorMessage /> : <CallList />}
const View = { grid: GridView, list: ListView }[mode]; return <View />;
```

**Say it like this:** "I use early returns for loading and error states and compare explicitly with `> 0` to avoid rendering a stray zero."

---

**Q11. How do you render lists, and why do keys matter?**

**Short answer:** Map over the data and give each item a stable, unique key, usually its ID.

**Explanation:** Keys tell React which item is which between renders. Index keys break when the list reorders, inserts or deletes, attaching state like input text to the wrong row.

**Example:**

```tsx
{calls.map((call) => <CallRow key={call.id} call={call} />)}
```

**Say it like this:** "Keys are identity. With a stable ID, React moves an item's DOM and state with it; with an index, deleting one row shifts state onto the wrong rows."

---

**Q12. How does React handle events?**

**Short answer:** You pass functions as props like `onClick`; React uses synthetic events and attaches listeners at the root.

**Explanation:** Synthetic events smooth over browser differences. `e.preventDefault()` stops default actions like form submission.

**Example:**

```tsx
<form onSubmit={(e) => { e.preventDefault(); save(); }}>…</form>
<button onClick={() => join(roomId)}>Join</button>
```

**Say it like this:** "Handlers are just props; React delegates at the root, and I call `preventDefault` to control forms."

---

**Q13. What are controlled inputs?**

**Short answer:** Inputs whose value comes from React state and updates through `onChange`.

**Explanation:** State is the single source of truth, which makes instant validation and formatting easy, at the cost of a re-render per keystroke.

**Example:**

```tsx
const [email, setEmail] = useState('');
<input value={email} onChange={(e) => setEmail(e.target.value)} />
```

**Say it like this:** "Controlled inputs are great when I need to react to every change, like live validation or formatting."

---

**Q14. What are uncontrolled inputs?**

**Short answer:** Inputs where the DOM holds the value and you read it on submit with `FormData` or a ref.

**Explanation:** Fewer re-renders, which is why React Hook Form uses this approach for big forms.

**Example:**

```tsx
function Form() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
  };
  return <form onSubmit={onSubmit}><input name="email" defaultValue="" /></form>;
}
```

**Say it like this:** "For large forms, uncontrolled inputs avoid re-rendering the form on every keystroke."

---

**Q15. What are fragments?**

**Short answer:** `<>…</>` groups children without adding an extra DOM element; `<Fragment key>` when a key is needed.

**Explanation:** Extra wrapper divs break table structure and flex or grid layouts.

**Example:**

```tsx
{rows.map((r) => (<Fragment key={r.id}><tr>…</tr><tr className="details">…</tr></Fragment>))}
```

**Say it like this:** "Fragments return multiple elements without a wrapper div, which matters inside tables and grids."

---

**Q16. What is the `children` prop?**

**Short answer:** Whatever is placed between a component's opening and closing tags.

**Explanation:** It enables composition: wrappers like cards, layouts and providers don't need to know their content.

**Example:**

```tsx
function Card({ children }: { children: React.ReactNode }) { return <div className="card">{children}</div>; }
<Card><CallSummary /></Card>
```

**Say it like this:** "`children` is how components compose; it's also my first tool against prop drilling."

---

**Q17. What is lifting state up?**

**Short answer:** Moving shared state to the closest common parent and passing it down, with callbacks passed down to change it.

**Explanation:** It keeps one source of truth for data two siblings need.

**Example:**

```tsx
function CallPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (<><CallList onSelect={setSelectedId} selectedId={selectedId} /><CallDetail id={selectedId} /></>);
}
```

**Say it like this:** "When siblings need the same data, I lift it to their parent so there's one source of truth."

---

**Q18. What is prop drilling, and how do you solve it?**

**Short answer:** Passing props through layers that don't use them. Solve it with composition, context for rarely changing values, or a store for frequently updated shared state.

**Explanation:** Composition often removes drilling entirely, because the middle layers just render `children`.

**Example:** Instead of passing `user` through `Layout → Sidebar → Avatar`, render `<Layout sidebar={<Avatar user={user} />} />`.

**Say it like this:** "Before reaching for context, I try composition; often the middle components can just accept `children`."

---

**Q19. What are the basics of `useEffect`?**

**Short answer:** It synchronises a component with something outside React, running after paint, with an optional cleanup.

**Explanation:** The cleanup runs before the next effect run and on unmount. If nothing external is involved, you probably don't need an effect.

**Example:**

```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, [tick]);
```

**Say it like this:** "An effect keeps an external thing, like a timer or a socket, in sync with my props and state, and cleans up after itself."

---

**Q20. What do the dependency array options mean?**

**Short answer:** No array: after every render. `[]`: once after mount. `[a, b]`: after mount and whenever `a` or `b` changes by `Object.is`.

**Explanation:** Objects and functions created during render are new every time, so they make effects re-run unless memoised.

**Example:**

```tsx
useEffect(() => { document.title = title; }, [title]);
```

**Say it like this:** "Dependencies list every reactive value the effect reads; the lint rule enforces it, and I fix unstable objects rather than silencing it."

---

**Q21. What are the basics of `useRef`?**

**Short answer:** A mutable box (`.current`) that survives re-renders and doesn't trigger a re-render when changed.

**Explanation:** Use it for DOM access and for values like timer IDs, previous values or SDK instances.

**Example:**

```tsx
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />
inputRef.current?.focus();
```

**Say it like this:** "Refs hold things React shouldn't re-render for, like DOM nodes or the LiveKit Room instance."

---

**Q22. What are the styling options in React?**

**Short answer:** CSS files, CSS Modules, Tailwind, CSS-in-JS, and inline style objects.

**Explanation:** For new apps, Tailwind or CSS Modules with design tokens have no runtime cost and work with Server Components.

**Example:**

```tsx
import styles from './Card.module.css';
<div className={styles.card} />
<div className="rounded-lg p-4 shadow" />
<div style={{ marginTop: 8 }} />
```

**Say it like this:** "I default to Tailwind or CSS Modules with CSS-variable tokens: zero runtime cost and easy theming."

---

**Q23. What are React DevTools used for?**

**Short answer:** Inspecting the component tree with props, state and hooks; highlighting re-renders; and profiling with the Profiler.

**Explanation:** The Profiler shows which components rendered, how long each took, and why.

**Example:** Turning on "Highlight updates" showed the whole call grid flashing on every audio-level change, which led to moving levels out of state.

**Say it like this:** "DevTools and the Profiler are my first stop for any 'why is this slow or re-rendering' question."

---

## 🟡 Level 2 — Intermediate

**Q24. What triggers a re-render?**

**Short answer:** The component's own state changes, its parent re-renders, or a context it reads changes.

**Explanation:** "Props changed" isn't a separate trigger; props only change because the parent re-rendered. By default all children re-render with the parent unless memoised.

**Example:** Typing in a search box held in `App` re-renders every child of `App`, even ones that don't use the query.

**Say it like this:** "State, parent, or context. People often think only prop changes re-render a child, but a parent re-render re-renders all children unless they're memoised."

---

**Q25. What's the difference between rendering and committing?**

**Short answer:** Rendering calls components to compute what changed (must be pure); committing applies DOM changes and then runs effects.

**Explanation:** React may pause, restart or discard renders in concurrent mode, so side effects in render can run multiple times.

**Example:** Logging analytics inside the component body may fire twice in StrictMode; firing it in an effect or handler doesn't.

**Say it like this:** "Render is a pure calculation; commit is where the DOM changes and effects run. Side effects belong after commit."

---

**Q26. What are the reconciliation rules?**

**Short answer:** A different element type at the same position remounts the subtree and loses state; the same type updates props; keys identify list children.

**Explanation:** Defining a component inside another creates a new type every render, so it remounts every time.

**Example:**

```tsx
function Parent() {
  const Row = () => <input />;   // ❌ new type each render — input loses focus
  return <Row />;
}
```

**Say it like this:** "React compares element types and keys; change either and the subtree remounts with fresh state."

---

**Q27. How do you use `key` to reset state?**

**Short answer:** Change the `key` to make React unmount the old component and mount a fresh one.

**Explanation:** It's cleaner than an effect that resets state when a prop changes.

**Example:**

```tsx
<ProfileForm key={userId} userId={userId} />
```

**Say it like this:** "When a form should start fresh for a different user, I key it by user ID instead of syncing state in an effect."

---

**Q28. What is batching?**

**Short answer:** React 18+ groups all state updates in the same tick into one re-render, including in promises and timeouts.

**Explanation:** It reduces renders. `flushSync` forces an immediate render when you truly need the DOM updated synchronously.

**Example:**

```tsx
async function onSave() { await save(); setSaving(false); setToast('Saved'); } // one render
```

**Say it like this:** "Automatic batching means several state updates cost one render, wherever they happen."

---

**Q29. Why doesn't state update immediately after calling `setState`?**

**Short answer:** `setState` schedules an update; within the current render the state variable is a fixed snapshot.

**Explanation:** The new value appears on the next render. If you need it now, compute it locally.

**Example:**

```tsx
function onClick() {
  const next = count + 1;
  setCount(next);
  console.log(next);   // use the local value, not `count`
}
```

**Say it like this:** "State is a snapshot per render, so I compute the next value locally when I need it immediately."

---

**Q30. What is the stale closure bug?**

**Short answer:** A callback closes over values from an old render and keeps seeing them.

**Explanation:** Fix it with functional updates, correct dependencies, or a ref holding the latest value.

**Example:**

```tsx
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000); // count is always 0
  return () => clearInterval(id);
}, []);
// fix: setCount((c) => c + 1)
```

**Say it like this:** "Each render has its own values, and callbacks capture the render they were created in. Functional updates or refs avoid stale reads."

---

**Q31. `useEffect` vs `useLayoutEffect` vs `useInsertionEffect`?**

**Short answer:** `useEffect` runs after paint; `useLayoutEffect` runs after DOM updates but before paint; `useInsertionEffect` runs before layout effects for CSS-in-JS.

**Explanation:** Use `useLayoutEffect` only to measure and adjust layout without a visible flicker, because it blocks painting.

**Example:**

```tsx
useLayoutEffect(() => {
  const rect = anchorRef.current!.getBoundingClientRect();
  setTooltipPos({ top: rect.bottom, left: rect.left });
}, []);
```

**Say it like this:** "`useEffect` by default; `useLayoutEffect` only for measuring layout before paint, like positioning a tooltip."

---

**Q32. "You might not need an effect": what are the common cases?**

**Short answer:** Derive data in render, reset state with `key`, respond to actions in handlers, fetch with a query library, and subscribe with `useSyncExternalStore`.

**Explanation:** Unnecessary effects cause extra renders and sync bugs.

**Example:**

```tsx
// ❌ effect + extra render
useEffect(() => setFullName(`${first} ${last}`), [first, last]);
// ✅ derive
const fullName = `${first} ${last}`;
```

**Say it like this:** "If there's no external system involved, there's usually no need for an effect; I derive values during render."

---

**Q33. Why do effects run twice in development?**

**Short answer:** StrictMode mounts, unmounts and remounts components in development to expose missing cleanup.

**Explanation:** Production runs effects once. The fix is correct cleanup, not removing StrictMode.

**Example:** A socket that connects twice and never disconnects shows up as two connections in dev; adding `return () => socket.close()` fixes it.

**Say it like this:** "The double run is a dev-only test of my cleanup. If it causes a bug, the bug was already there."

---

**Q34. How do you fetch data in an effect correctly?**

**Short answer:** Set loading state, fetch with an AbortController, check `res.ok`, and abort in the cleanup.

**Explanation:** Without abort, switching tenants quickly lets an old response overwrite new data. In real apps, a query library handles this plus caching and retries.

**Example:**

```tsx
useEffect(() => {
  const ctrl = new AbortController();
  setStatus('loading');
  fetch(`/api/calls?tenant=${tenantId}`, { signal: ctrl.signal })
    .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then((data) => { setCalls(data); setStatus('success'); })
    .catch((e) => { if (e.name !== 'AbortError') setStatus('error'); });
  return () => ctrl.abort();
}, [tenantId]);
```

**Say it like this:** "Abort in cleanup prevents races; but in production I'd use TanStack Query or RTK Query instead of hand-written effects."

---

**Q35. `useMemo` vs `useCallback` vs `React.memo`?**

**Short answer:** `useMemo` caches a value, `useCallback` caches a function reference, and `memo` skips re-rendering a component when its props are shallowly equal.

**Explanation:** They work together: a memoised child only skips renders if the parent passes stable props.

**Example:**

```tsx
const VideoTile = memo(function VideoTile({ participant, onPin }: Props) { /* … */ });
function Grid({ participants }) {
  const onPin = useCallback((id: string) => setPinned(id), []);
  return participants.map((p) => <VideoTile key={p.sid} participant={p} onPin={onPin} />);
}
```

**Say it like this:** "`memo` is useless if the parent passes a new callback each render, so I pair it with `useCallback`, and only where the Profiler shows waste."

---

**Q36. When is `useMemo` worth it?**

**Short answer:** For expensive computations, for keeping references stable for memoised children or hook dependencies, and for context values.

**Explanation:** For cheap calculations the bookkeeping can cost more than it saves.

**Example:**

```tsx
const visible = useMemo(() => calls.filter(matches(filters)).sort(byDate), [calls, filters]);
```

**Say it like this:** "I memoise filtering thousands of rows or context values, not simple string concatenations."

---

**Q37. What is the React Compiler?**

**Short answer:** A build-time tool that automatically memoises components and hooks.

**Explanation:** It reduces manual `useMemo`, `useCallback` and `memo`, but requires code that follows the Rules of React: pure render and no mutation.

**Example:** With the compiler, a component that passes an inline callback to a child gets the same benefit as wrapping it in `useCallback` by hand.

**Say it like this:** "The compiler makes memoisation automatic, which rewards writing pure, rule-following components."

---

**Q38. When do you use `useReducer` instead of `useState`?**

**Short answer:** When several values change together or transitions are complex, like a call lifecycle or a wizard.

**Explanation:** The reducer is a pure function, so it's easy to test, and all transition logic lives in one place.

**Example:**

```tsx
type State = { status: 'idle' | 'joining' | 'live' | 'error'; error?: string };
type Action = { type: 'JOIN' } | { type: 'JOINED' } | { type: 'FAIL'; error: string };
function reducer(s: State, a: Action): State {
  switch (a.type) { case 'JOIN': return { status: 'joining' }; case 'JOINED': return { status: 'live' }; case 'FAIL': return { status: 'error', error: a.error }; }
}
```

**Say it like this:** "When state transitions matter more than individual values, a reducer keeps them explicit and testable."

---

**Q39. How does the Context API work, and what are its pitfalls?**

**Short answer:** Context passes data deeply without prop drilling, but every consumer re-renders when the value changes by reference.

**Explanation:** Pitfalls: a new object each render, and fast-changing data in context. Fixes: memoise the value, split contexts, or use a store with selectors.

**Example:**

```tsx
const value = useMemo(() => ({ tenant, setTenant }), [tenant]);
return <TenantContext value={value}>{children}</TenantContext>;
```

**Say it like this:** "Context is for rarely changing values like theme or tenant; for fast-changing shared state I use a store with selectors."

---

**Q40. What are custom hooks?**

**Short answer:** Functions starting with `use` that call other hooks to share logic, not state.

**Explanation:** Each component using a custom hook gets its own state. They're how you package reusable behaviour.

**Example:**

```tsx
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return debounced;
}
```

**Say it like this:** "Custom hooks package behaviour, like `useParticipants` or `usePermission`, so components stay focused on rendering."

---

**Q41. What are the Rules of Hooks, and why do they exist?**

**Short answer:** Call hooks only at the top level of components or custom hooks, never conditionally or in loops.

**Explanation:** React identifies hooks by call order; skipping one shifts every hook after it onto the wrong state. React 19's `use()` is the exception. The ESLint plugin enforces the rules.

**Example:**

```tsx
if (isAdmin) { const [x] = useState(0); } // ❌ order changes between renders
```

**Say it like this:** "Hooks are stored by position, so their order must be identical every render."

---

**Q42. How do you use refs for the DOM and for imperative APIs?**

**Short answer:** Refs give direct DOM access; `useImperativeHandle` exposes a small, controlled API from a child.

**Explanation:** Use it for focus, scrolling and media playback, not for things props can express. In React 19, `ref` is a normal prop.

**Example:**

```tsx
function ChatLog({ ref }: { ref: React.Ref<{ scrollToBottom(): void }> }) {
  const listRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ scrollToBottom: () => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }) }));
  return <div ref={listRef}>…</div>;
}
```

**Say it like this:** "I expose narrow imperative methods like `scrollToBottom` instead of handing out the raw DOM node."

---

**Q43. What are portals?**

**Short answer:** `createPortal(children, node)` renders into a different DOM node while keeping the React tree.

**Explanation:** It avoids `overflow: hidden` clipping and z-index problems for modals, toasts and tooltips; events still bubble through the React tree.

**Example:**

```tsx
return createPortal(<div className="modal">…</div>, document.body);
```

**Say it like this:** "Portals move overlays to the body in the DOM, escaping stacking contexts, while context and events still work."

---

**Q44. What are error boundaries?**

**Short answer:** Components that catch rendering errors in their children and show a fallback UI instead of a blank screen.

**Explanation:** They must be classes or use `react-error-boundary`. They don't catch errors in event handlers, async code, or the boundary itself.

**Example:**

```tsx
<ErrorBoundary fallback={<p>Video failed to load. <button onClick={retry}>Retry</button></p>}>
  <VideoGrid />
</ErrorBoundary>
```

**Say it like this:** "I place boundaries at the route level and around risky widgets, so a crashing chart doesn't take down the dashboard."

---

**Q45. How do you code-split with `lazy` and `Suspense`?**

**Short answer:** `lazy(() => import(...))` loads a component's code on first render; `Suspense` shows a fallback while it loads.

**Explanation:** Split by route and by heavy features like the video SDK, charts and editors.

**Example:**

```tsx
const CallRoom = lazy(() => import('./CallRoom'));
<Suspense fallback={<Spinner label="Loading call…" />}><CallRoom /></Suspense>
```

**Say it like this:** "The call room and its SDK only load when someone joins a call, which keeps the dashboard bundle small."

---

**Q46. How do you handle forms at scale?**

**Short answer:** React Hook Form with uncontrolled inputs plus a Zod schema, field arrays for dynamic lists, and accessible errors.

**Explanation:** It keeps re-renders minimal even with dozens of fields, and the schema doubles as the TypeScript type.

**Example:**

```tsx
const { register, handleSubmit, formState: { errors } } = useForm<ScoreForm>({ resolver: zodResolver(Schema) });
<input {...register('score', { valueAsNumber: true })} aria-invalid={!!errors.score} />
```

**Say it like this:** "React Hook Form plus Zod handled our dynamic scorecards without re-rendering the whole form on each keystroke."

---

**Q47. What are the routing basics with React Router?**

**Short answer:** Nested routes with layouts rendering `<Outlet>`, loaders and actions, hooks like `useParams` and `useSearchParams`, route-level code splitting and protected routes.

**Explanation:** Layouts persist across child navigation; search params hold shareable filter state.

**Example:**

```tsx
<Route path="/calls" element={<CallsLayout />}>
  <Route index element={<CallList />} />
  <Route path=":id" element={<RequirePermission perm="calls:read"><CallDetail /></RequirePermission>} />
</Route>
```

**Say it like this:** "Nested layouts, URL-driven filters and permission-guarded routes are the core of how I structure routing."

---

**Q48. What is the compound components pattern?**

**Short answer:** A parent holds shared state in context and child components read it, giving a flexible, readable API.

**Explanation:** Consumers control markup and order while the logic stays inside. Radix uses this pattern.

**Example:**

```tsx
<Tabs defaultValue="calls">
  <Tabs.List><Tabs.Trigger value="calls">Calls</Tabs.Trigger></Tabs.List>
  <Tabs.Content value="calls"><CallList /></Tabs.Content>
</Tabs>
```

**Say it like this:** "Compound components let consumers arrange the pieces freely while the parent coordinates state."

---

**Q49. Render props vs HOCs vs hooks?**

**Short answer:** Render props pass a function as a child, HOCs wrap a component to inject behaviour, and hooks replaced most uses of both.

**Explanation:** Hooks avoid "wrapper hell" and naming collisions. HOCs are still handy for cross-cutting wrappers like permission gates.

**Example:**

```tsx
const AdminPage = withPermission('users:manage')(UsersPage); // HOC
const can = usePermission('users:manage');                  // hook
```

**Say it like this:** "I use hooks for shared logic, and occasionally an HOC for wrapping whole pages, like permission checks."

---

**Q50. What is the container/presentational split?**

**Short answer:** Containers fetch data and handle logic; presentational components just render props.

**Explanation:** Hooks blur the line, but presentational components are still easier to test and show in Storybook in every state.

**Example:** `CallListContainer` uses `useCallsQuery()` and passes `calls`, `isLoading` and `error` to a pure `CallList`.

**Say it like this:** "Keeping rendering components pure makes them trivial to test and document in every state."

---

**Q51. What is "headless UI"?**

**Short answer:** Components that provide behaviour and accessibility without styles, like Radix, React Aria and TanStack Table.

**Explanation:** You get keyboard handling, focus management and ARIA for free, and full control of visuals.

**Example:** On BpoBox, Radix Dialog and Select gave correct focus trapping and keyboard support, styled with each tenant's tokens.

**Say it like this:** "Headless libraries give me tested accessibility, and I own the design, which is ideal for multi-tenant theming."

---

## 🔴 Level 3 — Advanced

**Q52. What is the Fiber architecture?**

**Short answer:** Every element becomes a fiber, a unit of work linked to its child, sibling and parent, so React can pause, resume, prioritise or discard rendering.

**Explanation:** React keeps a current tree and a work-in-progress tree and swaps them at commit. This is the foundation of concurrent rendering.

**Example:** While a large table re-renders, a keypress can interrupt the work, get handled, and then React resumes the table.

**Say it like this:** "Before Fiber, rendering was one uninterruptible recursion. Fiber splits it into small units so React can stop for a keystroke and continue."

---

**Q53. What are lanes and priorities?**

**Short answer:** Each update gets a priority lane: discrete input highest, then continuous input, default, transitions and idle.

**Explanation:** Higher-priority updates can interrupt a transition that's rendering.

**Example:** Typing (discrete) interrupts a filter re-render marked with `startTransition`.

**Say it like this:** "Lanes let React treat a keypress as more urgent than re-rendering a big list."

---

**Q54. What does concurrent rendering change for you as a developer?**

**Short answer:** Renders can be interrupted and restarted, so render functions must be pure.

**Explanation:** API calls, subscriptions or mutations in render can run several times. Side effects belong in effects or handlers.

**Example:** A component that pushes to a global array during render ends up with duplicate entries under concurrent rendering.

**Say it like this:** "Purity in render isn't a style rule anymore; concurrent features depend on it."

---

**Q55. What does `useTransition` do?**

**Short answer:** It marks an update as non-urgent so urgent updates like typing stay responsive.

**Explanation:** React renders the transition in the background and can restart it if the user types again. `isPending` lets you show a subtle indicator.

**Example:**

```tsx
const [isPending, startTransition] = useTransition();
function onChange(e: React.ChangeEvent<HTMLInputElement>) {
  setQuery(e.target.value);
  startTransition(() => setFilter(e.target.value));
}
```

**Say it like this:** "The input updates immediately and the heavy list update happens as a transition, so typing never lags."

---

**Q56. What does `useDeferredValue` do?**

**Short answer:** It gives a lagging copy of a value, so expensive children re-render with the old value first and catch up when there's time.

**Explanation:** Use it when you don't control the code that sets the state, for example when the value arrives as a prop.

**Example:**

```tsx
const deferredQuery = useDeferredValue(query);
const results = useMemo(() => filterCalls(calls, deferredQuery), [calls, deferredQuery]);
```

**Say it like this:** "`useDeferredValue` is the transition tool when I only receive the value, not the setter."

---

**Q57. What is `useSyncExternalStore`?**

**Short answer:** The official way to subscribe to an external mutable source (stores, browser APIs, SDKs) safely under concurrent rendering.

**Explanation:** It prevents tearing and supports a server snapshot for SSR.

**Example:**

```tsx
function useOnlineStatus() {
  return useSyncExternalStore(
    (cb) => { addEventListener('online', cb); addEventListener('offline', cb); return () => { removeEventListener('online', cb); removeEventListener('offline', cb); }; },
    () => navigator.onLine,
    () => true,
  );
}
```

**Say it like this:** "For anything outside React that changes, like network status or an SDK's state, I subscribe with `useSyncExternalStore`."

---

**Q58. What is tearing?**

**Short answer:** Different components showing different versions of the same external data in one render.

**Explanation:** It can happen when a store changes while a concurrent render is paused. `useSyncExternalStore` prevents it.

**Example:** A header shows "3 participants" while the grid shows 4, because the store updated mid-render.

**Say it like this:** "Tearing is inconsistent UI from mid-render store changes, and `useSyncExternalStore` exists to prevent it."

---

**Q59. What is `useId` for?**

**Short answer:** Generating unique IDs that match on the server and client, for accessibility attributes.

**Explanation:** It avoids hydration mismatches and ID collisions between component instances. Don't use it for list keys.

**Example:**

```tsx
const id = useId();
<label htmlFor={id}>Email</label>
<input id={id} aria-describedby={`${id}-hint`} />
```

**Say it like this:** "Every reusable form field uses `useId`, so labels work even with several instances on a page."

---

**Q60. How does Suspense for data work?**

**Short answer:** A component suspends when its data isn't ready; the nearest `<Suspense>` shows a fallback and React retries when the promise resolves.

**Explanation:** `use(promise)` or a Suspense-enabled library triggers it; the framework or library caches promises so they aren't recreated.

**Example:**

```tsx
function CallDetails({ callPromise }: { callPromise: Promise<Call> }) {
  const call = use(callPromise);
  return <h2>{call.agent}</h2>;
}
<Suspense fallback={<Skeleton />}><CallDetails callPromise={promise} /></Suspense>
```

**Say it like this:** "Suspense moves loading states out of components into boundaries, so each part of the page can load independently."

---

**Q61. What is hydration?**

**Short answer:** Client-side React attaching to server-rendered HTML instead of rebuilding it.

**Explanation:** A mismatch happens when the client's first render differs from the server's, often due to dates, random values, `window` checks or locale formatting. React 18 hydrates Suspense boundaries selectively.

**Example:** Rendering `new Date().toLocaleTimeString()` produces different strings on server and client and triggers a hydration error.

**Say it like this:** "Hydration reuses server HTML; I keep the first client render identical to the server's and move time-dependent values into effects."

---

**Q62. Server Components vs Client Components?**

**Short answer:** Server Components run only on the server, can be async, access data directly and ship no JS; Client Components are interactive and hydrated.

**Explanation:** Server Components can render Client Components with serialisable props. Push `'use client'` down to interactive leaves.

**Example:**

```tsx
// page.tsx (server)
export default async function Page() { const calls = await db.calls.findMany(); return <CallTable calls={calls} filters={<FilterBar />} />; }
// FilterBar.tsx
'use client';
```

**Say it like this:** "Data fetching and static UI stay on the server; only interactive pieces like filters are client components, which shrinks the bundle."

---

**Q63. What is streaming SSR?**

**Short answer:** The server sends the page shell immediately and streams each Suspense boundary's HTML as its data resolves.

**Explanation:** Users see content sooner, and slow sections don't block fast ones.

**Example:** A dashboard shell and header appear instantly while the slow analytics chart streams in a second later.

**Say it like this:** "Streaming means the slowest query no longer decides when users see anything."

---

**Q64. What's your performance profiling workflow?**

**Short answer:** Measure with the Profiler, find why components render, fix the biggest cause, and re-measure.

**Explanation:** Common fixes: move state down, split components, memoise with stable props, virtualise, move work out of render, use transitions. Also check long tasks in Chrome's Performance panel.

**Example:** The Profiler showed the QA table re-rendering on every filter keystroke; moving filter state down and virtualising cut interaction time from about 300 ms to under 50 ms. *(Use your real numbers.)*

**Say it like this:** "I never optimise blindly: Profiler first, then the smallest change that removes the wasted renders, then measure again."

---

**Q65. What is state colocation?**

**Short answer:** Keeping state as close as possible to the components that use it.

**Explanation:** State held high in the tree re-renders everything below it on each change.

**Example:** Moving a dropdown's `isOpen` state from the page into the dropdown stopped the whole page re-rendering when it opened.

**Say it like this:** "The cheapest performance fix is often just moving state down to where it's used."

---

**Q66. How do you fix context performance problems?**

**Short answer:** Split the context, memoise its value, or move to a store with selector subscriptions.

**Explanation:** With selectors, a change to `user.name` doesn't re-render components that only read `user.theme`.

**Example:** Splitting `CallContext` into `CallStateContext` and `CallActionsContext` stopped buttons re-rendering on every state change.

**Say it like this:** "Context re-renders all consumers, so I split it or use a store where each component subscribes to its own slice."

---

**Q67. What is virtualisation?**

**Short answer:** Rendering only the visible rows of a long list plus a small buffer.

**Explanation:** 10,000 DOM rows is slow; about 30 visible rows is fast. Libraries: TanStack Virtual, react-window.

**Example:**

```tsx
const v = useVirtualizer({ count: calls.length, getScrollElement: () => ref.current, estimateSize: () => 48 });
```

**Say it like this:** "Call lists and transcripts are virtualised, so they scroll smoothly no matter how long they get."

---

**Q68. How do you avoid re-render storms from high-frequency data like audio levels?**

**Short answer:** Keep high-frequency values out of React state: update a ref or CSS variable inside `requestAnimationFrame`.

**Explanation:** Audio levels change about 60 times a second per participant; putting them in state re-renders the grid constantly.

**Example:**

```tsx
useEffect(() => {
  let raf = 0;
  const loop = () => { ringRef.current?.style.setProperty('--level', String(participant.audioLevel)); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}, [participant]);
```

**Say it like this:** "Speaking indicators read audio levels in a rAF loop and set a CSS variable, so React doesn't re-render at all."

---

**Q69. How do micro-frontends work with React?**

**Short answer:** Separately deployed apps loaded at runtime via Module Federation or import maps, sharing React as a singleton.

**Explanation:** You must solve communication (props, events, URL), style isolation, versioned contracts and performance budgets. Use them only when independent team deploys justify the complexity.

**Example:** A host shell loads the "reports" app from another team's CDN and passes it the current tenant via props.

**Say it like this:** "Micro-frontends solve team-scaling problems; without several blocked teams, a modular monolith is simpler."

---

**Q70. How would you architect a design system in React?**

**Short answer:** Tokens → primitives → composed components → patterns, documented in Storybook with visual and accessibility tests, released with semver.

**Explanation:** Codemods ease breaking changes; adoption metrics show impact.

**Example:** `@org/ui` exports `Button`, `Dialog` and `DataTable` built on Radix and CSS-variable tokens, used by InterpretIQ and BpoBox.

**Say it like this:** "Tokens for theming, headless primitives for accessibility, Storybook and visual regression for safe change."

---

**Q71. What's your error-handling strategy for a large app?**

**Short answer:** Route-level and widget-level error boundaries, query error states with retry, a global `unhandledrejection` handler, and friendly messages.

**Explanation:** Users get recovery actions; developers get full details in Sentry.

**Example:** A failing chart widget shows "Couldn't load chart — Retry" while the rest of the dashboard keeps working.

**Say it like this:** "Errors are contained to the smallest part of the UI, with a retry for users and full context for us."

---

**Q72. Which accessibility details are specific to React?**

**Short answer:** Semantic elements over `div` + `onClick`, focus management on route changes and dialogs, `htmlFor`, `useId`, and live regions for async updates.

**Explanation:** SPAs don't reset focus on navigation, so you must manage it. Test with jest-axe and keyboard-only passes.

**Example:**

```tsx
useEffect(() => { headingRef.current?.focus(); document.title = `${title} – BpoBox`; }, [pathname]);
```

**Say it like this:** "React makes it easy to forget focus management, so route changes and dialogs explicitly move focus."

---

**Q73. How do you handle internationalisation?**

**Short answer:** react-intl or i18next with ICU messages for plurals, `Intl` for dates and numbers, and RTL support with `dir` and logical CSS.

**Explanation:** Never build sentences by concatenating strings; word order changes between languages.

**Example:**

```tsx
<FormattedMessage id="calls.count" defaultMessage="{count, plural, one {# call} other {# calls}}" values={{ count }} />
```

**Say it like this:** "Messages use ICU plurals and placeholders, and formatting goes through `Intl`, so translations stay correct."

---

**Q74. What are the security concerns in React?**

**Short answer:** JSX escapes text, but risks remain: `dangerouslySetInnerHTML`, `javascript:` URLs, unsanitised markdown or LLM output, and secrets in client env vars.

**Explanation:** Sanitise HTML with DOMPurify, validate URL protocols, and keep secrets on the server.

**Example:**

```tsx
<a href={/^https?:/.test(url) ? url : '#'}>{label}</a>
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

**Say it like this:** "React's escaping covers text; I guard the escape hatches. For the AI chat, markdown rendered with HTML disabled and links restricted to http and https."

---

## ⚛️ React 19 Features

**Q75. What are Actions?**

**Short answer:** Async functions passed to transitions or forms (`<form action={fn}>`), with pending, error and optimistic state handled by React.

**Explanation:** They remove manual `isLoading` state and wire nicely into `useActionState` and `useFormStatus`.

**Example:**

```tsx
<form action={async (fd) => { await saveScore(Object.fromEntries(fd)); }}>…</form>
```

**Say it like this:** "Actions let React track the pending and error state of async submissions, so forms need far less boilerplate."

---

**Q76. What is `useActionState`?**

**Short answer:** It wraps an action and returns its latest result, a dispatch function for the form, and a pending flag.

**Explanation:** It's ideal for form submissions that return validation errors.

**Example:**

```tsx
const [state, submitAction, isPending] = useActionState(async (prev: { error?: string }, fd: FormData) => {
  const res = await saveScore(Object.fromEntries(fd));
  return res.ok ? {} : { error: res.error };
}, {});
<form action={submitAction}><button disabled={isPending}>Save</button>{state.error && <p role="alert">{state.error}</p>}</form>
```

**Say it like this:** "`useActionState` gives me result, submit and pending in one hook, replacing three pieces of manual state."

---

**Q77. What is `useFormStatus`?**

**Short answer:** It lets a nested component read its parent form's pending state.

**Explanation:** Reusable submit buttons no longer need a `loading` prop drilled into them.

**Example:**

```tsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}
```

**Say it like this:** "A design-system submit button can show its own spinner without the form passing anything down."

---

**Q78. What is `useOptimistic`?**

**Short answer:** It shows the expected result immediately while an action runs, then replaces it with the real state.

**Explanation:** If the action fails, the optimistic item disappears automatically.

**Example:**

```tsx
const [optimistic, addOptimistic] = useOptimistic(messages, (cur, m: Message) => [...cur, { ...m, sending: true }]);
async function send(fd: FormData) { const m = { id: crypto.randomUUID(), text: String(fd.get('text')) }; addOptimistic(m); await sendMessage(m); }
```

**Say it like this:** "Chat messages appear instantly with a 'sending' state, and React reconciles with the server result automatically."

---

**Q79. What is `use()`?**

**Short answer:** A hook that reads a promise (suspending until resolved) or a context, and can be called conditionally.

**Explanation:** It's the one hook exempt from the top-level rule.

**Example:**

```tsx
if (showDetails) { const theme = use(ThemeContext); }
const call = use(callPromise);
```

**Say it like this:** "`use()` unwraps promises with Suspense and reads context, even inside conditions."

---

**Q80. What changed about `ref` in React 19?**

**Short answer:** Function components receive `ref` as a normal prop, so new code doesn't need `forwardRef`; ref callbacks can return a cleanup.

**Explanation:** It removes boilerplate in component libraries.

**Example:**

```tsx
function Input({ ref, ...props }: React.ComponentProps<'input'>) { return <input ref={ref} {...props} />; }
```

**Say it like this:** "In React 19, `ref` is just a prop, which simplified every input wrapper in our component library."

---

**Q81. How do you provide context in React 19?**

**Short answer:** Render the context itself as the provider: `<ThemeContext value={theme}>`.

**Explanation:** `<Context.Provider>` still works but is no longer needed.

**Example:**

```tsx
<TenantContext value={tenant}><App /></TenantContext>
```

**Say it like this:** "It's a small syntax cleanup: the context is the provider now."

---

**Q82. What are the document metadata and resource APIs?**

**Short answer:** `<title>`, `<meta>` and `<link>` inside components are hoisted into `<head>`; `preload`, `preinit`, `prefetchDNS` and `preconnect` hint resources.

**Explanation:** Pages can set their own title without a helmet library, and components can declare resources they need.

**Example:**

```tsx
function CallPage({ call }: { call: Call }) { return (<><title>{`Call with ${call.agent} – BpoBox`}</title>…</>); }
```

**Say it like this:** "Each page sets its own title and meta tags directly, which helps both SEO and screen-reader users."

---

**Q83. What else improved in React 19?**

**Short answer:** Clearer hydration error messages with diffs, full custom element support, and root options like `onCaughtError` and `onUncaughtError`.

**Explanation:** The new root error callbacks make it easy to report errors to Sentry centrally.

**Example:**

```tsx
createRoot(el, { onUncaughtError: (e) => Sentry.captureException(e) }).render(<App />);
```

**Say it like this:** "Better hydration diffs and root-level error hooks make debugging and monitoring easier."

---

## 🧪 Testing React

**Q84. What does the testing pyramid look like for the frontend?**

**Short answer:** Static checks at the base, many integration-style component tests, fewer end-to-end tests, plus visual regression for the design system.

**Explanation:** Component tests with RTL and MSW give the best confidence per minute of CI time; E2E covers the few critical flows.

**Example:** InterpretIQ: TypeScript + ESLint, ~hundreds of RTL tests, a handful of Playwright flows (login, join call, end call).

**Say it like this:** "I invest most in integration-style component tests; E2E covers the five or so flows that would be a disaster if broken."

---

**Q85. What is the React Testing Library philosophy?**

**Short answer:** Test what the user sees and does, not implementation details.

**Explanation:** Query priority: `getByRole` → `getByLabelText` → `getByText` → `getByTestId`. Role-based queries also verify accessibility.

**Example:**

```tsx
await user.click(screen.getByRole('button', { name: 'Save score' }));
```

**Say it like this:** "If `getByRole('button', { name: 'Save' })` can't find it, a screen reader can't either, so these tests double as accessibility checks."

---

**Q86. `getBy` vs `queryBy` vs `findBy`?**

**Short answer:** `getBy` throws if missing, `queryBy` returns null for asserting absence, and `findBy` waits asynchronously.

**Explanation:** Using the right one makes failures clear and avoids flaky timing.

**Example:**

```tsx
expect(screen.queryByText('Error')).not.toBeInTheDocument();
expect(await screen.findByText('Saved')).toBeVisible();
```

**Say it like this:** "`getBy` for what's there now, `queryBy` for what shouldn't be, `findBy` for what will appear."

---

**Q87. `userEvent` vs `fireEvent`?**

**Short answer:** `userEvent` simulates realistic interactions with the full event sequence; `fireEvent` dispatches a single event.

**Explanation:** `userEvent` catches bugs that depend on focus, keydown or input order.

**Example:**

```tsx
const user = userEvent.setup();
await user.type(screen.getByLabelText('Search'), 'maria');
```

**Say it like this:** "I use `userEvent` because it types and clicks like a real user, including focus changes."

---

**Q88. How do you mock the network with MSW?**

**Short answer:** Define request handlers with Mock Service Worker so components use their real fetch code against mocked responses.

**Explanation:** Tests are realistic, and the same handlers can power Storybook and local development.

**Example:**

```ts
const server = setupServer(http.get('/api/calls', () => HttpResponse.json([{ id: '1', agent: 'Asha' }])));
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Say it like this:** "MSW mocks at the network level, so my tests exercise the real data-fetching code."

---

**Q89. How do you test a component that needs providers?**

**Short answer:** A custom `render` wrapper that creates fresh providers per test, with query retries disabled.

**Explanation:** Fresh instances stop cached state leaking between tests.

**Example:**

```tsx
function renderWithProviders(ui: React.ReactElement, { route = '/' } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter></QueryClientProvider>);
}
```

**Say it like this:** "One helper wires up router, query client and store, fresh for each test."

---

**Q90. How do you test custom hooks?**

**Short answer:** With `renderHook`, plus fake timers for time-based hooks.

**Explanation:** Wrap timer advances in `act` so React processes the updates.

**Example:**

```ts
vi.useFakeTimers();
const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: 'a' } });
rerender({ v: 'ab' });
act(() => { vi.advanceTimersByTime(300); });
expect(result.current).toBe('ab');
```

**Say it like this:** "`renderHook` with fake timers tests debounce logic deterministically, without real waiting."

---

**Q91. How do you test loading and error states?**

**Short answer:** Override the MSW handler for one test to return an error or delay, then assert the UI.

**Explanation:** Test the full recovery: error message, retry button, then success.

**Example:**

```tsx
server.use(http.get('/api/calls', () => new HttpResponse(null, { status: 500 })));
expect(await screen.findByRole('alert')).toHaveTextContent('Could not load calls');
```

**Say it like this:** "Every data component has tests for loading, error with retry, empty and success."

---

**Q92. Are snapshot tests good or bad?**

**Short answer:** Large snapshots are brittle and rarely reviewed; small inline snapshots are fine; use visual regression for appearance.

**Explanation:** Big snapshot diffs get blindly updated, so they stop catching anything.

**Example:** Instead of snapshotting a whole table, assert `getAllByRole('row')` has 3 entries and the first has the right agent.

**Say it like this:** "I prefer explicit assertions; for visual correctness, Chromatic or Playwright screenshots are more reliable than DOM snapshots."

---

**Q93. What should you test end to end with Playwright?**

**Short answer:** The critical flows: login, permissions, joining a call with fake media devices, submitting a scorecard, and logout clearing data.

**Explanation:** E2E tests are slower and costlier, so they cover journeys where failure is unacceptable.

**Example:**

```ts
use: { launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] } }
```

**Say it like this:** "E2E covers the few flows that must never break, including joining a call with fake camera and mic."

---

**Q94. How do you test accessibility in unit tests?**

**Short answer:** Run axe on rendered components with jest-axe or vitest-axe.

**Explanation:** It catches missing labels, invalid ARIA and some contrast issues automatically.

**Example:**

```ts
const { container } = render(<ScoreForm />);
expect(await axe(container)).toHaveNoViolations();
```

**Say it like this:** "axe in unit tests makes accessibility regressions fail CI like any other bug."

---

**Q95. What makes tests flaky, and how do you fix it?**

**Short answer:** Arbitrary timeouts, real network, shared state, time dependence, animations and order dependence.

**Explanation:** Fix them with `findBy`/`waitFor`, MSW, per-test resets, fake timers, disabled animations and isolated setup.

**Example:** Replacing `await sleep(500)` with `await screen.findByText('Saved')` removed a test that failed one run in ten.

**Say it like this:** "Flaky tests usually depend on time or shared state; I make them deterministic instead of adding retries."

---

## 🧩 Level 4 — Scenario-Based

**Q96. Typing in a search box lags because a 5,000-row table re-filters on every keystroke.**

**Short answer:** Make the filter non-urgent with `useDeferredValue` or a transition, memoise filtering, virtualise the table, or filter on the server.

**Explanation:** The input and table were tied to one urgent update; separating them keeps typing instant.

**Example:**

```tsx
const deferred = useDeferredValue(query);
const rows = useMemo(() => filterRows(all, deferred), [all, deferred]);
```

**Say it like this:** "I made the table update deferred and virtualised it; typing became instant and the table caught up milliseconds later."

---

**Q97. A dashboard re-renders entirely when one widget's data updates.**

**Short answer:** State is too high or a context is too broad; colocate state, split context, use selector subscriptions and memoise widgets.

**Explanation:** Confirm with the Profiler's "why did this render".

**Example:** Moving each widget's query into the widget meant one widget's refetch re-rendered only that widget.

**Say it like this:** "I'd let each widget own its data and subscribe narrowly, then verify with the Profiler."

---

**Q98. An effect causes an infinite loop.**

**Short answer:** The effect sets state it depends on, or depends on an object recreated every render.

**Explanation:** Depend on primitives, memoise objects, derive instead of syncing, or move the logic to a handler.

**Example:**

```tsx
const options = { tenantId };                                        // new object each render
useEffect(() => { fetchCalls(options).then(setCalls); }, [options]); // loop
useEffect(() => { fetchCalls({ tenantId }).then(setCalls); }, [tenantId]); // fixed
```

**Say it like this:** "Unstable object dependencies are the usual cause; I depend on primitive values instead."

---

**Q99. A modal loses focus management and screen readers read the background.**

**Short answer:** Use `<dialog>` with `showModal()` or Radix Dialog for focus trapping, `aria-modal`, an inert background and focus restore.

**Explanation:** Hand-rolled modals usually miss one of these behaviours.

**Example:** Replacing a custom `div` modal with Radix Dialog fixed focus escaping to the page behind.

**Say it like this:** "I wouldn't hand-roll it; native dialog or Radix gets focus trap, inert background and focus return right."

---

**Q100. After logging out and in as another tenant, the old tenant's data briefly shows.**

**Short answer:** Clear the query cache and store on logout, include `tenantId` in every query key, and remount the shell with `key={tenantId}`.

**Explanation:** In a multi-tenant app this is a data-leak bug, not just a visual glitch.

**Example:**

```tsx
function logout() { queryClient.clear(); store.dispatch(resetAll()); navigate('/login'); }
```

**Say it like this:** "We fixed it at three levels: clearing caches on logout, tenant-scoped query keys, and remounting the shell on tenant change."

---

**Q101. The video tile flickers black when participants join or leave.**

**Short answer:** Tiles are remounting; key them by participant SID, keep `<video>` mounted, and attach tracks imperatively.

**Explanation:** Index keys or changing parent element types between layouts remount every tile.

**Example:**

```tsx
{participants.map((p) => <VideoTile key={p.sid} participant={p} />)}
```

**Say it like this:** "Stable keys by participant SID stopped tiles remounting, so video no longer flashed black."

---

**Q102. A form with 60 fields is slow.**

**Short answer:** Use uncontrolled inputs (React Hook Form), split into sections, avoid watching every field, and memoise heavy sections.

**Explanation:** Controlled state at the form level re-renders all 60 fields on every keystroke.

**Example:** Switching a scorecard from `useState` per field to React Hook Form cut keystroke re-renders from the whole form to zero.

**Say it like this:** "Large forms should be uncontrolled; React Hook Form only re-renders what needs to show an error."

---

**Q103. Several components need to share one WebSocket connection.**

**Short answer:** Create it once outside rendering (a module singleton or a provider ref) and expose a subscription hook with `useSyncExternalStore`.

**Explanation:** Creating sockets inside components duplicates connections; a single owner with cleanup on unmount avoids that.

**Example:**

```tsx
const socket = createSocket(url);                  // once
export const useChannel = (ch: string) => useSyncExternalStore((cb) => socket.subscribe(ch, cb), () => socket.latest(ch));
```

**Say it like this:** "One connection, many subscribers, with the connection's lifecycle owned by a single provider."

---

**Q104. You get a hydration mismatch on a page showing "5 minutes ago".**

**Short answer:** Render a stable value on the server, then switch to relative time on the client after mount, or format with a fixed time zone on both sides.

**Explanation:** Time passes between server and client renders and time zones may differ. `suppressHydrationWarning` is only for intentional single-element differences.

**Example:**

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
return <time dateTime={iso}>{mounted ? timeAgo(iso) : formatAbsolute(iso)}</time>;
```

**Say it like this:** "The first client render matches the server; relative time appears after mount."

---

**Q105. Junior developers keep writing buggy data fetching in `useEffect`.**

**Short answer:** Adopt a query library as the standard, write a short guideline, enforce the hooks lint rule, add it to the review checklist, and pair on the first migration.

**Explanation:** Fix the system rather than individual bugs, so the easy path is the correct one.

**Example:** After moving to TanStack Query, stale-data and race-condition bugs in the backlog dropped to near zero.

**Say it like this:** "When the same bug keeps appearing, it's a tooling problem; I make the right way the easy way."

---

## 🎯 From Your Resume

**Q106. "How did you integrate LiveKit with React efficiently?"**

**Short answer:** One Room per call held in a ref inside a provider, per-tile subscriptions, memoised tiles keyed by SID, audio levels outside React state, and a lazily loaded SDK.

**Explanation:** Keeping the Room out of state means re-renders can't recreate the connection; per-tile subscriptions limit re-renders to the affected tile.

**Example:**

```tsx
function useRoom(url: string, token: string | null) {
  const roomRef = useRef<Room | null>(null);
  const [state, setState] = useState<ConnectionState>(ConnectionState.Disconnected);
  useEffect(() => {
    if (!token) return;
    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;
    room.on(RoomEvent.ConnectionStateChanged, setState);
    room.connect(url, token).catch(() => setState(ConnectionState.Disconnected));
    return () => { room.removeAllListeners(); room.disconnect(); roomRef.current = null; };
  }, [url, token]);
  return { room: roomRef, state };
}
```

**Say it like this:** "The Room lived in a ref inside a provider, each tile subscribed only to its own tracks, tiles were keyed by SID, and audio levels never touched React state."

---

**Q107. "How did you build the streaming SSE compliance chat UI without janky renders?"**

**Short answer:** Buffer tokens in a ref and flush once per animation frame, render sanitised markdown, auto-scroll only near the bottom, abort on unmount, and announce only the final message.

**Explanation:** Setting state per token would cause hundreds of renders per second.

**Example:**

```tsx
const buffer = useRef('');
const onToken = (t: string) => {
  buffer.current += t;
  requestAnimationFrame(() => setText(buffer.current));
};
```

**Say it like this:** "Tokens went into a buffer flushed once per frame, so streaming stayed smooth, and screen readers heard one announcement at the end."

---

**Q108. "What were your testing standards, and how did they reduce production bugs by 30%?"**

**Short answer:** RTL with MSW, Playwright for critical flows, regression tests with every bug fix, coverage gates on critical modules and a PR template.

**Explanation:** The 30% was measured as production bug tickets or new Sentry issues per release, quarter over quarter, acknowledging other contributing factors.

**Example:** A reconnect bug fix shipped with a test simulating a network drop, which later caught a regression in a refactor.

**Say it like this:** "We measured bugs per release before and after; the 'every fix ships with a test' rule made the biggest difference."

---

**Q109. "How did you build role-based portals in BpoBox?"**

**Short answer:** A role-based route tree, `RequirePermission` guards, permission-filtered navigation and a `can()` helper, all mirrored by server checks.

**Explanation:** Frontend checks are UX; every endpoint enforced the same permissions, verified by an authorisation test matrix.

**Example:**

```tsx
<Route path="/admin" element={<RequirePermission perm="users:manage"><AdminPage /></RequirePermission>} />
```

**Say it like this:** "Navigation and routes followed permissions for UX, and the server enforced them on every request."

---

**Q110. "Why React 19 for InterpretIQ? What did you actually use from it?"**

**Short answer:** Answer with the features you really used, such as Actions and `useActionState` for forms, `ref` as a prop, and document metadata.

**Explanation:** Interviewers follow up on every feature you mention, so only claim what you used and the benefit you saw.

**Example:** "`useActionState` removed manual loading and error state from our forms; `ref` as a prop removed `forwardRef` from our input components." *(Adjust to what you actually used.)*

**Say it like this:** "We adopted React 19 mainly for Actions, which simplified forms, and ref-as-prop in our component library. I'd rather describe what we actually used than list every new feature."
