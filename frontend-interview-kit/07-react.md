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

## 🟢 Level 1 — Basics

**Q1. What is React?**

**Short answer:** A JavaScript library for building UIs from components. You describe the UI as a function of state, and React efficiently updates the DOM to match.

**Say it like this:** "React lets me describe what the UI should look like for any given state, and it figures out the minimal DOM changes. Thinking in components and one-way data flow makes large UIs predictable."

---

**Q2. Declarative vs imperative?**

**Short answer:** Declarative means you describe *what* the UI should be for a given state. Imperative means you write step-by-step instructions for *how* to change the DOM.

```tsx
// Declarative (React)
{isMuted ? <MicOffIcon /> : <MicIcon />}

// Imperative (vanilla JS)
if (isMuted) { icon.src = 'mic-off.svg'; button.setAttribute('aria-pressed', 'true'); }
else { icon.src = 'mic.svg'; button.setAttribute('aria-pressed', 'false'); }
```

**Explanation:** Declarative code is easier to reason about, because you never have to track what the DOM *currently* looks like.

---

**Q3. What is JSX?**

**Short answer:** A syntax extension that looks like HTML but compiles to JavaScript function calls (`jsx()`, or `React.createElement` in older setups). Those calls produce plain objects describing the UI.

```tsx
<button className="btn" onClick={join}>Join</button>
// compiles to roughly:
jsx('button', { className: 'btn', onClick: join, children: 'Join' })
```

**Key differences from HTML:** `className` instead of `class`, `htmlFor` instead of `for`, camelCase events (`onClick`), JavaScript expressions in `{}`, and every element must be closed.

---

**Q4. Element vs component vs instance?**

**Short answer:**

- An **element** is a plain object describing UI: `{ type: 'button', props: {…} }`.
- A **component** is a function (or class) that returns elements.
- An **instance**, or "fiber", is React's internal record for a *mounted* component. It holds that component's state and hooks.

---

**Q5. Function components vs class components?**

**Short answer:** Function components with hooks are the standard today. Class components remain only in legacy code and for error boundaries, which still need a class (or a library like `react-error-boundary`).

---

**Q6. Props vs state?**

**Short answer:** Props are inputs from the parent and are read-only. State is data the component owns and changes over time. Updating state triggers a re-render.

```tsx
function Counter({ step }: { step: number }) {     // step = prop
  const [count, setCount] = useState(0);            // count = state
  return <button onClick={() => setCount((c) => c + step)}>{count}</button>;
}
```

**Say it like this:** "Props are like function arguments: the parent controls them. State is like a component's private memory. If two components need the same state, I lift it to their common parent and pass it down as props."

---

**Q7. Why must props be treated as immutable?**

**Short answer:** React and memoization compare props *by reference* to detect changes. Mutating a prop object keeps the same reference, so React may skip the update and show stale UI. It's also a side effect on the parent's data.

---

**Q8. What are the basics of `useState`?**

```tsx
const [count, setCount] = useState(0);
setCount(5);                  // set a new value
setCount((c) => c + 1);       // functional update — based on the latest value
```

**Short answer:** It returns the current value and a setter. Use the functional form whenever the new value depends on the previous one. It avoids stale values when updates are batched.

```tsx
// Bug: both read the same snapshot, so count increases by 1, not 2
setCount(count + 1); setCount(count + 1);
// Correct: increases by 2
setCount((c) => c + 1); setCount((c) => c + 1);
```

---

**Q9. What is lazy initial state?**

```tsx
const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('settings') ?? '{}'));
```

**Short answer:** Pass a function, and React runs it only on the first render. Without the function wrapper, the expensive parse would run on every render, and its result would be thrown away.

---

**Q10. What are the conditional rendering patterns?**

```tsx
{isLoading && <Spinner />}                         // && — watch out for 0
{error ? <ErrorMessage /> : <CallList />}          // ternary
if (!user) return <Login />;                       // early return
const views = { grid: GridView, list: ListView };  // object map
const View = views[mode]; return <View />;
```

**Gotcha:** `{count && <Badge />}` renders the text **"0"** when count is 0. Write `{count > 0 && <Badge />}`.

---

**Q11. How do you render lists, and why do keys matter?**

```tsx
{calls.map((call) => <CallRow key={call.id} call={call} />)}
```

**Short answer:** Keys tell React which item is which between renders. They must be **stable and unique among siblings**, typically a database ID. Don't use the array index if the list can reorder, insert or delete. React would then attach the wrong state, such as input text or focus, to the wrong row.

**Example of the index-key bug:** In a list of editable rows keyed by index, deleting row 1 makes row 2 take key 1, so it inherits row 1's typed text.

**Say it like this:** "Keys are identity. With a stable ID, React moves the existing DOM node and its state along with the item. With an index, deleting the first item shifts every key and state ends up on the wrong rows."

---

**Q12. How does React handle events?**

**Short answer:** You pass functions as props: `onClick={() => join(roomId)}`. React uses *synthetic events*, a cross-browser wrapper, and attaches listeners at the root container rather than on each element (event delegation). Call `e.preventDefault()` to stop a form from submitting.

---

**Q13. What are controlled inputs?**

```tsx
const [email, setEmail] = useState('');
<input value={email} onChange={(e) => setEmail(e.target.value)} />
```

**Short answer:** React state is the single source of truth for the input's value. That makes instant validation, formatting and conditional UI easy, but every keystroke re-renders the component.

---

**Q14. What are uncontrolled inputs?**

```tsx
function Form() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
  };
  return <form onSubmit={onSubmit}><input name="email" defaultValue="" /></form>;
}
```

**Short answer:** The DOM holds the value, and you read it on submit with `FormData` or a ref. There are fewer re-renders, which is why React Hook Form uses this approach for big forms.

---

**Q15. What are fragments?**

**Short answer:** `<>…</>` (or `<Fragment key={id}>…</Fragment>` when you need a key) groups children without adding an extra DOM element. That matters for tables (`<tr>` children) and for flex or grid layouts.

---

**Q16. What is the `children` prop?**

**Short answer:** Whatever you put between a component's opening and closing tags. It enables composition: `<Card><CardBody /></Card>`.

```tsx
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}
```

---

**Q17. What is lifting state up?**

**Short answer:** When two sibling components need the same data, move the state to their closest common parent. Pass the data down as props and pass callbacks down so children can request changes.

```tsx
function CallPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <>
      <CallList onSelect={setSelectedId} selectedId={selectedId} />
      <CallDetail id={selectedId} />
    </>
  );
}
```

---

**Q18. What is prop drilling, and how do you solve it?**

**Short answer:** Passing props through many layers of components that don't use them, just to reach a deep child. There are three solutions:

1. **Composition:** pass components as `children` or "slots", so the middle layers don't need the data.
2. **Context:** for widely needed, rarely changing values (theme, current user, tenant).
3. **A store** (Zustand, Redux): for frequently updated shared state.

**Say it like this:** "Before reaching for context, I try composition. Often the middle components can just accept `children`, and the drilling disappears."

---

**Q19. What are the basics of `useEffect`?**

```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);   // set up
  return () => clearInterval(id);       // clean up
}, [tick]);                             // re-run when tick changes
```

**Short answer:** `useEffect` synchronises a component with something *outside* React: subscriptions, timers, network, browser APIs. It runs after the screen is painted. The cleanup function runs before the next effect run and when the component unmounts.

**Say it like this:** "I think of an effect as 'keep this external thing in sync with my props and state'. If there's nothing external involved, I usually don't need an effect at all."

---

**Q20. What do the dependency array options mean?**

**Short answer:**

- No array: the effect runs after **every** render.
- `[]`: it runs once after mount (and its cleanup runs on unmount).
- `[a, b]`: it runs after mount and whenever `a` or `b` changes. React compares with `Object.is`, so a new object or function each render counts as a change.

---

**Q21. What are the basics of `useRef`?**

```tsx
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />
inputRef.current?.focus();

const renderCount = useRef(0);
renderCount.current++;        // changes without causing a re-render
```

**Short answer:** A ref is a mutable box (`.current`) that survives re-renders and **doesn't trigger a re-render** when changed. Use it for DOM access and for values like timer IDs, previous values or SDK instances.

---

**Q22. What are the styling options in React?**

**Short answer:** Plain CSS files, CSS Modules (scoped), Tailwind (utility classes), CSS-in-JS (styled-components, Emotion), and inline style objects (`style={{ marginTop: 8 }}`, written in camelCase). For new apps I'd choose Tailwind or CSS Modules with design tokens, because they have no runtime cost and work with Server Components.

---

**Q23. What are React DevTools used for?**

**Short answer:** Inspecting the component tree and each component's props, state and hooks, highlighting components when they re-render, and the **Profiler**, which records an interaction and shows which components rendered, how long each took and why.

---

## 🟡 Level 2 — Intermediate

**Q24. What triggers a re-render?**

**Short answer:** Three things:

1. The component's **own state** changes.
2. Its **parent re-renders**. By default all children re-render too, even if their props didn't change.
3. A **context** it consumes changes value.

**Explanation:** "Props changed" isn't a separate trigger. Props can only change because the parent re-rendered.

**Say it like this:** "A component re-renders when its state changes, its parent re-renders, or a context it reads changes. A common misconception is that it re-renders only when its props change. In fact, a parent re-render re-renders every child unless it's memoized."

---

**Q25. What's the difference between rendering and committing?**

**Short answer:** In the **render phase**, React calls your components and computes what changed. This must be pure, and React may pause, restart or discard it. In the **commit phase**, React applies the DOM changes, then runs layout effects, then (after paint) passive effects (`useEffect`).

---

**Q26. What are the reconciliation rules?**

**Short answer:**

- If the element **type** at a position changes (for example, `<div>` becomes `<section>`, or `<LoginForm>` becomes `<SignupForm>`), React unmounts the old subtree and mounts a new one, and the state is lost.
- If the type stays the same, React keeps the component instance and updates its props.
- In lists, **keys** identify children across renders.

**Example of a hidden bug:**

```tsx
// Defining a component INSIDE another creates a new type every render → remount every render
function Parent() {
  const Row = () => <input />;   // ❌ new function each render — input loses focus on each keystroke
  return <Row />;
}
```

---

**Q27. How do you use `key` to reset state?**

```tsx
<ProfileForm key={userId} userId={userId} />
```

**Short answer:** Changing the key makes React treat the component as brand new: it unmounts the old one and mounts a fresh one with fresh state. That's cleaner than an effect that tries to reset state whenever a prop changes.

---

**Q28. What is batching?**

**Short answer:** React 18+ groups all state updates made in the same tick (in event handlers, promises, timeouts) into **one** re-render. `flushSync()` forces an immediate render, but you rarely need it.

```tsx
async function onSave() {
  await save();
  setSaving(false);
  setToast('Saved');   // both updates → one render (automatic batching in React 18)
}
```

---

**Q29. Why doesn't state update immediately after calling `setState`?**

**Short answer:** `setState` *schedules* an update. Inside the current render, the state variable is a fixed **snapshot**, and the new value appears only in the next render.

```tsx
const [count, setCount] = useState(0);
function onClick() {
  setCount(count + 1);
  console.log(count);   // still 0 — snapshot of this render
}
```

**Fix:** compute the next value in a local variable and use it, or read it in the next render.

---

**Q30. What is the stale closure bug?**

```tsx
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);   // count is always 0 here
  return () => clearInterval(id);
}, []);   // count stuck at 1
```

**Short answer:** The interval callback closed over `count` from the first render, so it always sees `0`.

**Fixes:**

- A functional update: `setCount((c) => c + 1)`.
- Add `count` to the dependency array (this restarts the interval).
- Keep the latest value in a ref.

**Say it like this:** "Each render has its own props and state, and callbacks capture the values from the render where they were created. Functional updates or refs avoid reading stale values."

---

**Q31. `useEffect` vs `useLayoutEffect` vs `useInsertionEffect`?**

**Short answer:**

- `useEffect`: runs **after paint**. Use it for most side effects.
- `useLayoutEffect`: runs after the DOM is updated but **before paint**. Use it to measure layout and adjust synchronously without a visible flicker, for example positioning a tooltip.
- `useInsertionEffect`: runs before layout effects. It's for CSS-in-JS libraries that inject styles.

---

**Q32. "You might not need an effect": what are the common cases?**

**Short answer:**

| Situation | Instead of an effect… |
|---|---|
| Derived data (filtered list, full name) | compute it during render (or `useMemo`) |
| Reset state when a prop changes | use `key` |
| React to a user action | do it in the event handler |
| Tell the parent something changed | call the callback in the handler |
| Fetch data | TanStack Query or RTK Query, or the framework's loader |
| Subscribe to an external store | `useSyncExternalStore` |

```tsx
// ❌ unnecessary effect + extra render
const [fullName, setFullName] = useState('');
useEffect(() => setFullName(`${first} ${last}`), [first, last]);

// ✅ derive during render
const fullName = `${first} ${last}`;
```

---

**Q33. Why do effects run twice in development?**

**Short answer:** In development, `<StrictMode>` mounts, unmounts and remounts every component to expose missing cleanup, such as a socket that connects twice and never disconnects. Production runs effects once. The fix is correct cleanup (abort the fetch, disconnect the socket), not removing StrictMode.

---

**Q34. How do you fetch data in an effect correctly?**

```tsx
useEffect(() => {
  const ctrl = new AbortController();
  setStatus('loading');
  fetch(`/api/calls?tenant=${tenantId}`, { signal: ctrl.signal })
    .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then((data) => { setCalls(data); setStatus('success'); })
    .catch((e) => { if (e.name !== 'AbortError') setStatus('error'); });
  return () => ctrl.abort();   // cancel if tenantId changes or component unmounts
}, [tenantId]);
```

**Explanation:** Without the abort, switching tenants quickly can let an old response arrive last and overwrite the new data (a race condition). In real apps, prefer a query library, which adds caching, deduplication, retries and background refetching.

---

**Q35. `useMemo` vs `useCallback` vs `React.memo`?**

**Short answer:**

- `useMemo(fn, deps)` caches a **computed value**.
- `useCallback(fn, deps)` caches a **function reference**. It's equivalent to `useMemo(() => fn, deps)`.
- `memo(Component)` skips re-rendering the component if its props are shallowly equal.

They work **together**: a memoized child only skips re-rendering if the parent passes stable props, meaning memoized objects and callbacks.

```tsx
const VideoTile = memo(function VideoTile({ participant, onPin }: Props) { … });

function Grid({ participants }) {
  const onPin = useCallback((id: string) => setPinned(id), []);
  return participants.map((p) => <VideoTile key={p.sid} participant={p} onPin={onPin} />);
}
```

**Say it like this:** "`memo` on a child is useless if the parent creates a new callback every render, so I pair it with `useCallback`. But I don't wrap everything. I profile first and memoize where the Profiler shows real waste."

---

**Q36. When is `useMemo` worth it?**

**Short answer:**

- Expensive computations, such as sorting or filtering thousands of rows.
- Keeping a reference stable when it's a dependency of another hook or a prop of a memoized child.
- Context provider values, so consumers don't all re-render.

It isn't worth it for cheap calculations: the memo bookkeeping can cost more than it saves.

---

**Q37. What is the React Compiler?**

**Short answer:** A build-time tool that automatically memoizes components and hooks, so you rarely need manual `useMemo`, `useCallback` or `memo`. It requires code that follows the Rules of React: pure render, and no mutation of props or state during render.

---

**Q38. When do you use `useReducer` instead of `useState`?**

**Short answer:** When several pieces of state change together, or when transitions are complex, such as a call lifecycle or a multi-step wizard. The reducer is a pure function, so it's easy to test, and all the transition logic lives in one place.

```tsx
type State = { status: 'idle' | 'joining' | 'live' | 'error'; error?: string };
type Action = { type: 'JOIN' } | { type: 'JOINED' } | { type: 'FAIL'; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'JOIN': return { status: 'joining' };
    case 'JOINED': return { status: 'live' };
    case 'FAIL': return { status: 'error', error: action.error };
  }
}
const [state, dispatch] = useReducer(reducer, { status: 'idle' });
```

---

**Q39. How does the Context API work, and what are its pitfalls?**

```tsx
const TenantContext = createContext<Tenant | null>(null);

function App() {
  const value = useMemo(() => ({ tenant, setTenant }), [tenant]); // stable reference
  return <TenantContext value={value}>{children}</TenantContext>; // React 19 syntax
}
```

**Short answer:** Context passes data deeply without prop drilling. **Every consumer re-renders when the value changes by reference.**

**Pitfalls:**

- Creating a new object every render, so all consumers re-render every time.
- Putting fast-changing data (like mouse position) into context.

**Fixes:**

- Memoize the value.
- Split contexts (one for state, one for dispatch or actions).
- Use a store with selectors for frequently changing data.

---

**Q40. What are custom hooks?**

**Short answer:** Functions whose names start with `use` and that call other hooks. They share *logic*, not state: each component that uses one gets its own state.

```tsx
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
```

**Examples from real apps:** `usePermission`, `useParticipants`, `useMediaDevices`, `useOnlineStatus`.

---

**Q41. What are the Rules of Hooks, and why do they exist?**

**Short answer:** Call hooks only at the **top level** of components or custom hooks, never inside conditions, loops or nested functions. React identifies each hook by its **call order**. If a condition skips one hook, every hook after it reads the wrong state. React 19's `use()` is the exception: it can be called conditionally. The ESLint plugin `eslint-plugin-react-hooks` enforces these rules.

---

**Q42. How do you use refs for the DOM and for imperative APIs?**

```tsx
// React 19: `ref` is a normal prop, so no forwardRef wrapper is needed
function ChatLog({ ref }: { ref: React.Ref<{ scrollToBottom(): void }> }) {
  const listRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }),
  }));
  return <div ref={listRef}>…</div>;
}
```

**Short answer:** A ref gives direct DOM access, for focus, media playback and measuring. `useImperativeHandle` exposes a small, controlled API from a child, instead of the whole DOM node.

---

**Q43. What are portals?**

**Short answer:** `createPortal(children, document.body)` renders children into a different DOM node, outside the parent's DOM hierarchy. That avoids `overflow: hidden` clipping and z-index stacking problems for modals, toasts and tooltips. Events still bubble through the *React* tree as if the portal were in place.

---

**Q44. What are error boundaries?**

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<p>Video failed to load. <button onClick={retry}>Retry</button></p>}>
  <VideoGrid />
</ErrorBoundary>
```

**Short answer:** Components that catch errors thrown while rendering their children, and show a fallback UI instead of a blank white screen. They must be classes (`getDerivedStateFromError`, `componentDidCatch`), or you use `react-error-boundary`. They **don't** catch errors in event handlers, async code, or the boundary itself.

**Say it like this:** "I place boundaries at the route level and around risky widgets like the video grid and charts. If a chart crashes, the rest of the dashboard keeps working, and the error is reported to Sentry from `componentDidCatch`."

---

**Q45. How do you code-split with `lazy` and `Suspense`?**

```tsx
const CallRoom = lazy(() => import('./CallRoom'));

<Suspense fallback={<Spinner label="Loading call…" />}>
  <CallRoom />
</Suspense>
```

**Short answer:** `lazy` loads a component's code only when it's first rendered, and `Suspense` shows a fallback while it loads. Split by route and by heavy features (the video SDK, charts, rich-text editors).

---

**Q46. How do you handle forms at scale?**

**Short answer:** React Hook Form, which uses uncontrolled inputs and gives minimal re-renders, plus a Zod schema for validation. Use field arrays for dynamic lists (scorecard questions), and make errors accessible (`aria-invalid`, `aria-describedby`).

---

**Q47. What are the routing basics with React Router?**

**Short answer:** Nested routes with layout components that render an `<Outlet>`. Data routers add loaders and actions. Hooks include `useNavigate`, `useParams` and `useSearchParams`. You can split code per route and build protected routes that check auth and permissions.

---

**Q48. What is the compound components pattern?**

```tsx
<Tabs defaultValue="calls">
  <Tabs.List>
    <Tabs.Trigger value="calls">Calls</Tabs.Trigger>
    <Tabs.Trigger value="agents">Agents</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="calls"><CallList /></Tabs.Content>
  <Tabs.Content value="agents"><AgentList /></Tabs.Content>
</Tabs>
```

**Short answer:** The parent holds the shared state in context, and the child components read it. Users get flexible markup with a clear, readable API. Radix uses this pattern.

---

**Q49. Render props vs HOCs vs hooks?**

**Short answer:** With *render props* you pass a function as a child to share logic (`<MouseTracker>{(pos) => …}</MouseTracker>`). An *HOC* (higher-order component) wraps a component to inject behaviour (`withAuth(Page)`). **Hooks** replaced most uses of both. HOCs are still handy for cross-cutting wrappers like permission gates.

---

**Q50. What is the container/presentational split?**

**Short answer:** Containers fetch data and handle logic. Presentational components just render props. Hooks blur the line, but the separation still helps testing and Storybook, because presentational components are easy to show in every state.

---

**Q51. What is "headless UI"?**

**Short answer:** Components that provide **behaviour and accessibility, but no styles**: Radix, React Aria, Headless UI, TanStack Table. You get keyboard handling, focus management and ARIA for free, and you own the visuals completely.

---

## 🔴 Level 3 — Advanced

**Q52. What is the Fiber architecture?**

**Short answer:** Every element becomes a **fiber**, a unit of work linked to its child, sibling and parent (return). Because work is split into small units, React can **pause, resume, prioritise or throw away** rendering work, and that's what makes concurrent rendering possible. React keeps two trees, the *current* tree (on screen) and the *work-in-progress* tree, and swaps them at commit.

**Say it like this:** "Before Fiber, rendering was one uninterruptible recursive call. A big update could freeze typing. Fiber breaks rendering into small units, so React can stop to handle a keystroke and then continue."

---

**Q53. What are lanes and priorities?**

**Short answer:** Every update is assigned a *lane*, which is its priority. From highest to lowest: discrete input (a click or keypress), continuous input (dragging), default updates, transitions, then idle work. A high-priority update can interrupt a transition that's already rendering.

---

**Q54. What does concurrent rendering change for you as a developer?**

**Short answer:** A render can be interrupted and restarted, so render functions **must be pure**: no API calls, no subscriptions, no mutations during render. Side effects belong in effects or event handlers, which run only after a commit.

---

**Q55. What does `useTransition` do?**

```tsx
const [isPending, startTransition] = useTransition();

function onChange(e: React.ChangeEvent<HTMLInputElement>) {
  setQuery(e.target.value);                         // urgent: input updates instantly
  startTransition(() => setFilter(e.target.value)); // non-urgent: big list can lag
}

{isPending && <Spinner size="sm" />}
```

**Short answer:** It marks a state update as **non-urgent**, so urgent updates like typing stay responsive while React renders the expensive part in the background. If the user types again, React can interrupt and restart the transition.

---

**Q56. What does `useDeferredValue` do?**

```tsx
const deferredQuery = useDeferredValue(query);
const results = useMemo(() => filterCalls(calls, deferredQuery), [calls, deferredQuery]);
```

**Short answer:** It gives you a "lagging" copy of a value. Expensive children render with the old value first, then update when React has time. Use it when you don't control the code that sets the state, for example when the value comes in as a prop.

---

**Q57. What is `useSyncExternalStore`?**

```tsx
function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,   // client snapshot
    () => true,               // server snapshot
  );
}
```

**Short answer:** The official way to subscribe to an external, mutable data source (Redux, Zustand, browser APIs, an SDK) safely under concurrent rendering. It prevents "tearing".

---

**Q58. What is tearing?**

**Short answer:** Different components showing *different versions* of the same external data during one render. This can happen when the store changes while a concurrent render is paused. `useSyncExternalStore` prevents it.

---

**Q59. What is `useId` for?**

```tsx
const id = useId();
<label htmlFor={id}>Email</label>
<input id={id} aria-describedby={`${id}-hint`} />
<p id={`${id}-hint`}>We'll never share it.</p>
```

**Short answer:** It generates unique IDs that are stable and identical on the server and the client, which avoids hydration mismatches. Use it for accessibility attributes, **not** for list keys.

---

**Q60. How does Suspense for data work?**

**Short answer:** A component "suspends" when its data isn't ready, through `use(promise)` or a Suspense-enabled library. The nearest `<Suspense>` boundary shows its fallback, and React retries the render when the promise resolves. Frameworks and libraries handle caching the promises so they aren't recreated on every render.

```tsx
function CallDetails({ callPromise }: { callPromise: Promise<Call> }) {
  const call = use(callPromise);    // suspends until resolved
  return <h2>{call.agent}</h2>;
}

<Suspense fallback={<Skeleton />}><CallDetails callPromise={promise} /></Suspense>
```

---

**Q61. What is hydration?**

**Short answer:** With server rendering, the HTML arrives already built. Hydration is client-side React *attaching* to that existing HTML (adding event listeners and state) instead of rebuilding it.

**Hydration mismatch:** the client's first render produces different output from the server's. Common causes are `Date.now()`, `Math.random()`, `typeof window` checks, locale or time-zone formatting, and browser extensions modifying the DOM. React 18+ supports *selective hydration*: parts wrapped in Suspense hydrate independently, and interacted-with parts first.

---

**Q62. Server Components vs Client Components?**

| | Server Components | Client Components (`'use client'`) |
|---|---|---|
| Where they run | server only | server (SSR) + browser |
| JavaScript sent to browser | **none** | yes |
| Can be `async` / fetch data directly | yes | no (use hooks/libraries) |
| State, effects, event handlers | no | yes |
| Browser APIs | no | yes |
| Can access secrets/DB | yes | no |

**Short answer:** Server Components render on the server, can be `async` and query data directly, and ship zero JavaScript. Client Components are hydrated and interactive. A Server Component can render a Client Component and pass it serialisable props.

**Say it like this:** "I keep components on the server by default, for data fetching and static UI, and make only interactive leaves client components, like a filter dropdown or a video player. That shrinks the JavaScript bundle a lot."

---

**Q63. What is streaming SSR?**

**Short answer:** `renderToPipeableStream` (Node) and `renderToReadableStream` (web streams) send the page *shell* immediately, then stream each Suspense boundary's HTML as its data resolves. Users see content sooner, and slow sections don't block fast ones.

---

**Q64. What's your performance profiling workflow?**

**Short answer:**

1. **Measure:** record the slow interaction in the React Profiler. Find components with long render times or too many renders.
2. **Understand why:** turn on "record why each component rendered".
3. **Fix:** move state closer to where it's used, split components, memoize with stable props, virtualise long lists, move expensive work out of render, use transitions.
4. **Re-measure.** Also check Chrome's Performance panel for long tasks over 50 ms.

**Say it like this:** "I never optimise blindly. On the QA dashboard, the Profiler showed the whole table re-rendering on every filter keystroke. Moving filter state down and virtualising the table took interaction time from about 300 ms to under 50 ms." *(Use your own real numbers.)*

---

**Q65. What is state colocation?**

**Short answer:** Keep state as close as possible to the components that use it. State held high up in the tree re-renders everything below it when it changes.

---

**Q66. How do you fix context performance problems?**

**Short answer:** Split the context, memoize its value, or move to a store where each component subscribes to just its own slice through a selector (Zustand, Redux, or `use-context-selector`). Then a change to `user.name` doesn't re-render components that only read `user.theme`.

---

**Q67. What is virtualisation?**

**Short answer:** Rendering only the rows visible in the viewport, plus a small buffer, instead of all of them. 10,000 calls in the DOM is slow, while about 30 visible rows is fast. Libraries: TanStack Virtual and react-window. Use it for long lists of calls, chat messages and transcript lines.

---

**Q68. How do you avoid re-render storms from high-frequency data like audio levels or cursor positions?**

**Short answer:** Keep high-frequency values **out of React state**. Update a ref, or the DOM directly, inside `requestAnimationFrame`. Subscribe per component, so only the affected tile updates. Throttle updates, or set a CSS variable from JavaScript.

```tsx
function SpeakingRing({ participant }: { participant: Participant }) {
  const ringRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      ringRef.current?.style.setProperty('--level', String(participant.audioLevel));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [participant]);
  return <div ref={ringRef} className="ring" />;   // CSS uses var(--level) for scale
}
```

**Say it like this:** "Audio levels change around 60 times per second per participant. Putting them in Redux would re-render the grid constantly. I read them in a rAF loop and set a CSS variable, so React doesn't re-render at all."

---

**Q69. How do micro-frontends work with React?**

**Short answer:** Module Federation (or import maps) loads separately deployed apps at runtime. Share React as a singleton, communicate through props, custom events or the URL, isolate styles, and version the contracts between apps. Use micro-frontends **only** when independent team deployment justifies the complexity.

---

**Q70. How would you architect a design system in React?**

**Short answer:** Build it in layers: **tokens** (colours, spacing) → **primitives** (Radix-based Button, Dialog) → **composed components** (DataTable, DatePicker) → **patterns** (page layouts). Document everything in Storybook with visual regression and accessibility tests, publish semantic-versioned releases, and provide codemods for breaking changes.

---

**Q71. What's your error-handling strategy for a large app?**

**Short answer:**

- Route-level error boundaries.
- Component-level boundaries around risky widgets.
- Error states in queries, with retry buttons.
- A global `unhandledrejection` handler that reports to Sentry.
- Friendly messages for users and full technical detail in the logs.

---

**Q72. Which accessibility details are specific to React?**

**Short answer:**

- Use semantic elements rather than `div` + `onClick`.
- Manage focus on route changes and when dialogs open or close.
- `aria-*` attributes pass straight through, and use `htmlFor`, not `for`.
- `useId` creates stable ID references.
- Live regions announce async updates.
- Test with jest-axe and keyboard-only checks.

---

**Q73. How do you handle internationalisation?**

**Short answer:** Use react-intl or i18next with the ICU message format, which handles plurals ("1 call" vs "5 calls"). Use `Intl` for dates and numbers. Support RTL with the `dir` attribute and CSS logical properties.

---

**Q74. What are the security concerns in React?**

**Short answer:** JSX escapes text by default, which protects against most XSS. The remaining risks:

- `dangerouslySetInnerHTML` with unsanitised content.
- `javascript:` URLs built from user input in an `href`.
- Rendering markdown or LLM output without sanitising it.
- Leaking secrets through environment variables bundled into client code (`NEXT_PUBLIC_…`, `VITE_…`).

**Say it like this:** "React escapes by default, so XSS usually comes in through `dangerouslySetInnerHTML` or links. For the AI chat, every model response went through a markdown renderer with HTML disabled, and links were restricted to http and https."

---

## ⚛️ React 19 Features

**Q75. What are Actions?**

**Short answer:** Async functions passed to transitions or forms (`<form action={fn}>`). React tracks the pending state, handles errors, and supports optimistic updates automatically. You don't need manual `isLoading` state.

---

**Q76. What is `useActionState`?**

```tsx
const [state, submitAction, isPending] = useActionState(
  async (prev: { ok: boolean; error?: string }, formData: FormData) => {
    const res = await saveScore(Object.fromEntries(formData));
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  },
  { ok: false },
);

<form action={submitAction}>
  <input name="score" type="number" />
  <button disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
  {state.error && <p role="alert">{state.error}</p>}
</form>
```

**Short answer:** It wraps an action and gives you its latest result, a dispatch function to put on the form, and a pending flag. It's ideal for form submissions.

---

**Q77. What is `useFormStatus`?**

```tsx
function SubmitButton() {
  const { pending } = useFormStatus();   // reads the parent <form>'s status
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}
```

**Short answer:** It lets a nested component read its parent form's pending state without prop drilling, which is great for reusable submit buttons.

---

**Q78. What is `useOptimistic`?**

```tsx
const [optimisticMessages, addOptimistic] = useOptimistic(
  messages,
  (current, newMsg: Message) => [...current, { ...newMsg, sending: true }],
);

async function send(formData: FormData) {
  const msg = { id: crypto.randomUUID(), text: String(formData.get('text')) };
  addOptimistic(msg);        // appears instantly
  await sendMessage(msg);    // when this settles, real state replaces optimistic state
}
```

**Short answer:** It shows the expected result immediately while the action runs. When the action finishes, React replaces the optimistic state with the real state. If the action fails, the optimistic item disappears.

---

**Q79. What is `use()`?**

**Short answer:** It reads a **promise** (suspending until it resolves) or a **context**. Unlike other hooks, it can be called inside conditions and loops.

```tsx
if (showDetails) {
  const theme = use(ThemeContext);   // allowed conditionally
}
```

---

**Q80. What changed about `ref` in React 19?**

**Short answer:** Function components receive `ref` as a normal prop, so new code doesn't need `forwardRef`. Ref callbacks can also return a cleanup function.

```tsx
function Input({ ref, ...props }: React.ComponentProps<'input'>) {
  return <input ref={ref} {...props} />;
}
```

---

**Q81. How do you provide context in React 19?**

**Short answer:** Write `<ThemeContext value={theme}>` instead of `<ThemeContext.Provider value={theme}>`.

---

**Q82. What are the document metadata and resource APIs?**

**Short answer:** `<title>`, `<meta>` and `<link>` rendered inside any component are hoisted into `<head>` automatically. New APIs (`preload`, `preinit`, `prefetchDNS`, `preconnect`) let components hint at resources they'll need, and stylesheets get precedence ordering.

```tsx
function CallPage({ call }) {
  return (<><title>{`Call with ${call.agent} – BpoBox`}</title>…</>);
}
```

---

**Q83. What else improved in React 19?**

**Short answer:** Much clearer hydration error messages (showing a diff), full support for custom elements (Web Components), and better error reporting through the `onCaughtError` and `onUncaughtError` root options.

---

## 🧪 Testing React

**Q84. What does the testing pyramid look like for the frontend?**

**Short answer:** From bottom to top:

- **Static analysis:** TypeScript and ESLint, which are cheapest and catch the most typos.
- **Many unit and integration tests:** components tested with React Testing Library.
- **Fewer end-to-end tests:** Playwright, for critical user flows.
- **Visual regression:** for the design system.

**Say it like this:** "I invest most in integration-style component tests with RTL and MSW, which test a feature the way a user uses it. E2E covers the five or so flows that would be a disaster if broken: login, join call, submit scorecard."

---

**Q85. What is the React Testing Library philosophy?**

**Short answer:** "Test what the user sees and does, not implementation details." Query priority: `getByRole` → `getByLabelText` → `getByText` → `getByTestId` (last resort). Tests written this way also check accessibility, because if `getByRole('button', { name: 'Save' })` can't find the button, a screen reader can't either.

---

**Q86. `getBy` vs `queryBy` vs `findBy`?**

**Short answer:**

- `getBy` throws if the element isn't found. Use it for things that should be there now.
- `queryBy` returns `null`. Use it to assert that something is **absent**.
- `findBy` is async: it waits up to about 1 s. Use it for elements that appear later.

```ts
expect(screen.queryByText('Error')).not.toBeInTheDocument();
expect(await screen.findByText('Saved')).toBeVisible();
```

---

**Q87. `userEvent` vs `fireEvent`?**

**Short answer:** `userEvent` simulates real interactions, including the full sequence of focus, keydown, input and keyup events. `fireEvent` dispatches a single event. Prefer `userEvent`.

```ts
const user = userEvent.setup();
await user.type(screen.getByLabelText('Search'), 'maria');
await user.click(screen.getByRole('button', { name: 'Apply' }));
```

---

**Q88. How do you mock the network with MSW?**

```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/calls', () => HttpResponse.json([{ id: '1', agent: 'Asha' }])),
);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Short answer:** Mock Service Worker intercepts requests at the network level, so components use their real `fetch` or query code. Tests are realistic, and the same handlers can power Storybook and local development.

---

**Q89. How do you test a component that needs providers?**

```tsx
function renderWithProviders(ui: React.ReactElement, { route = '/' } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}
```

**Short answer:** Write a custom `render` wrapper that creates a *fresh* QueryClient and store for each test, with retries disabled, so tests don't share cached state.

---

**Q90. How do you test custom hooks?**

```ts
vi.useFakeTimers();
const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: 'a' } });
rerender({ v: 'ab' });
expect(result.current).toBe('a');
act(() => { vi.advanceTimersByTime(300); });
expect(result.current).toBe('ab');
```

---

**Q91. How do you test loading and error states?**

**Short answer:** Override the MSW handler for one test to return a 500 or to delay. Assert that the spinner appears, then the error message and retry button. Then click retry, with a success handler in place, and assert the data appears.

```ts
server.use(http.get('/api/calls', () => new HttpResponse(null, { status: 500 })));
expect(await screen.findByRole('alert')).toHaveTextContent('Could not load calls');
```

---

**Q92. Are snapshot tests good or bad?**

**Short answer:** Large snapshots are brittle, and reviewers rarely read the diffs, so they just get updated. Small inline snapshots of specific output are fine. For visual correctness, use visual regression tools such as Chromatic or Playwright screenshots.

---

**Q93. What should you test end to end with Playwright?**

**Short answer:** The flows that would be disastrous if broken:

- Login.
- Permissions (an agent can't open admin pages).
- Joining a call with fake media devices (`--use-fake-device-for-media-stream`).
- Submitting a QA scorecard.
- Logout clearing data.

---

**Q94. How do you test accessibility in unit tests?**

```ts
import { axe } from 'vitest-axe';
const { container } = render(<ScoreForm />);
expect(await axe(container)).toHaveNoViolations();
```

---

**Q95. What makes tests flaky, and how do you fix it?**

**Short answer:**

| Cause | Fix |
|---|---|
| Arbitrary timeouts (`sleep(500)`) | `findBy` and `waitFor` |
| Real network | MSW |
| Shared state between tests | reset stores and query clients per test |
| Time and date dependence | fake timers, fixed dates |
| Animations | disable them in the test environment |
| Test order dependence | isolate setup in `beforeEach` |

---

## 🧩 Level 4 — Scenario-Based

**Q96. Typing in a search box lags because a 5,000-row table re-filters on every keystroke.**

**Answer:** Several layers, from cheapest to most effective:

1. Keep the input responsive with `useDeferredValue(query)` or `startTransition` for the filter update.
2. Memoize the filtered rows with `useMemo`.
3. Virtualise the table so only about 30 rows render.
4. For really large data, filter on the server.

**Say it like this:** "The input and the table were tied to the same urgent update. I made the table update a transition and virtualised it. Typing became instant, and the table caught up a few milliseconds later."

---

**Q97. A dashboard re-renders entirely when one widget's data updates.**

**Answer:** State is held too high, or a context is too broad. Move state into the widgets that use it, split the context, use selector-based subscriptions (a Zustand or Redux slice), and memoize widgets. Confirm with the Profiler.

---

**Q98. An effect causes an infinite loop.**

**Answer:** Usually the effect sets state that's in its own dependency list, or it depends on an object or function that's recreated every render.

```tsx
// ❌ options is a new object every render → effect runs every render → sets state → re-render…
const options = { tenantId };
useEffect(() => { fetchCalls(options).then(setCalls); }, [options]);
```

**Fixes:** depend on primitives (`[tenantId]`), memoize the object, derive the value instead of using an effect, or move the logic into an event handler.

---

**Q99. A modal loses focus management and screen readers read the background.**

**Answer:** Use `<dialog>` with `showModal()`, or Radix Dialog. You get a focus trap, `aria-modal`, an inert background, and focus returns to the trigger button on close.

---

**Q100. After logging out and in as another tenant, the old tenant's data briefly shows.**

**Answer:** Cached data is leaking between sessions. On logout, clear the query cache (`queryClient.clear()`) and reset the store. Include `tenantId` in every query key. Put `key={tenantId}` on the app shell so the whole tree remounts.

**Say it like this:** "In a multi-tenant app this is a data-leak bug, not just a visual glitch. We fixed it at three levels: clearing caches on logout, tenant-scoped query keys, and remounting the shell on tenant change."

---

**Q101. The video tile flickers black when participants join or leave.**

**Answer:** The tiles are remounting, either because of unstable keys (such as the index) or because the parent element type changes between layouts. Key by participant SID, keep the `<video>` element mounted, and attach or detach tracks imperatively instead of recreating elements.

---

**Q102. A form with 60 fields is slow.**

**Answer:** Use uncontrolled inputs (React Hook Form), split the form into sections or steps, avoid `watch()`-ing every field, and memoize heavy sections.

---

**Q103. Several components need to share one WebSocket connection.**

**Answer:** Create the connection once, *outside* the render cycle, as a module singleton or a provider holding it in a ref. Expose a subscription hook built on `useSyncExternalStore`, and disconnect when the provider unmounts.

---

**Q104. You get a hydration mismatch on a page showing "5 minutes ago".**

**Answer:** The server and client compute different strings, because time has moved on and the time zones may differ. Render a stable value on the server (the absolute time), then switch to the relative time on the client after mount. Alternatively, format with a fixed time zone and locale on both sides. Use `suppressHydrationWarning` only for intentional single-element differences.

---

**Q105. Junior developers keep writing buggy data fetching in `useEffect`.**

**Answer:** Fix the system, not just the bugs:

1. Adopt TanStack Query or RTK Query as the standard way to fetch.
2. Write a short guideline with examples.
3. Enforce `react-hooks/exhaustive-deps` in ESLint.
4. Add the guideline to the PR review checklist.
5. Pair with each developer on their first migration.

---

## 🎯 From Your Resume

**Q106. "How did you integrate LiveKit with React efficiently?"**

**Say it like this:** "Five things. First, the Room instance was created once per call and held in a ref inside a provider, never in React state. Second, each participant tile subscribed only to its own track events. Third, tiles were memoized and keyed by participant SID, so joins and leaves didn't remount the others. Fourth, audio levels and speaking indicators were updated locally, not through app-wide state. Fifth, the SDK was lazy-loaded with the call route."

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
    return () => {
      room.removeAllListeners();
      room.disconnect();
      roomRef.current = null;
    };
  }, [url, token]);

  return { room: roomRef, state };
}
```

---

**Q107. "How did you build the streaming SSE compliance chat UI without janky renders?"**

**Say it like this:** "Tokens arrive very fast, and setting state for each one would cause hundreds of renders per second. So I appended tokens to a ref buffer and flushed it into state once per animation frame. The markdown was rendered with HTML disabled. Auto-scroll happened only if the user was already near the bottom, so we didn't yank them while they were reading. The stream was aborted on unmount or when they pressed Stop. The *final* message was announced through a polite live region, not each token, which would overwhelm a screen reader."

---

**Q108. "What were your testing standards, and how did they reduce production bugs by 30%?"**

**Say it like this:** "React Testing Library with MSW for components, Playwright for the critical flows, and a rule that every bug fix ships with a regression test. We had a coverage gate on critical modules like auth and the call flow, and a PR template with a tests checkbox. We measured the 30% as production bug tickets and new Sentry issues per release, comparing the quarter before with the quarter after. I'd also mention that other factors contributed, like more code review."

---

**Q109. "How did you build role-based portals in BpoBox?"**

**Say it like this:** "The route tree was generated from the user's role. A `RequirePermission` guard wrapped sensitive routes, navigation was filtered by permissions, and action buttons used a `can()` helper. All of that is UX only. Every endpoint enforced the same permissions on the server, and we had tests for each role and endpoint combination."

---

**Q110. "Why React 19 for InterpretIQ? What did you actually use from it?"**

**Answer guidance:** Answer honestly with the features you actually used and the benefit you saw. For example: "Actions and `useActionState` simplified our forms by removing manual loading and error state. `ref` as a prop removed the `forwardRef` boilerplate in our component library, and document metadata let each page set its own title." **Don't claim features you didn't use.** Interviewers will follow up.
