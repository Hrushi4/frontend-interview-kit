# 07 — React (18 / 19)

Levels: **🟢 Basic → 🟡 Intermediate → 🔴 Advanced → ⚛️ React 19 → 🧪 Testing → 🧩 Scenario → 🎯 From Your Resume**

---

## 🟢 Level 1 — Basics

**1. What is React?**
A library for building UIs from components. You describe UI as a function of state; React updates the DOM to match.

**2. Declarative vs imperative?**
Declarative: describe *what* the UI should look like for a state (`{isMuted ? <MicOff/> : <Mic/>}`). Imperative: manually manipulate DOM step by step.

**3. What is JSX?**
Syntax that compiles to `jsx()` calls (React.createElement in older setups), producing plain objects (elements). Expressions go in `{}`; `className`, `htmlFor`, camelCase events.

**4. Element vs component vs instance?**
Element = plain object describing UI (`{ type, props }`). Component = function returning elements. Instance/fiber = React's internal record with state for a mounted component.

**5. Function vs class components?**
Function components + hooks are the standard. Class components remain only for legacy code and error boundaries.

**6. Props vs state?**
Props: inputs from the parent, read-only. State: data owned by the component that changes over time and triggers re-render.

**7. Why must props be treated as immutable?**
React compares references to detect changes; mutating props breaks rendering and memoization and causes hard bugs.

**8. `useState` basics?**
```tsx
const [count, setCount] = useState(0);
setCount(c => c + 1); // functional update when based on previous value
```

**9. Lazy initial state?**
`useState(() => expensiveParse(raw))` — runs the initializer only on first render.

**10. Conditional rendering patterns?**
`&&` (beware `0 && <X/>` renders "0"), ternary, early return, mapping objects to components.

**11. Rendering lists and keys?**
```tsx
{calls.map(c => <CallRow key={c.id} call={c} />)}
```
Keys must be stable and unique among siblings. Don't use index for lists that reorder/insert/delete.

**12. Handling events?**
`onClick={() => join(roomId)}`; React uses synthetic events attached at the root; `e.preventDefault()` for forms.

**13. Controlled inputs?**
```tsx
const [email, setEmail] = useState('');
<input value={email} onChange={e => setEmail(e.target.value)} />
```

**14. Uncontrolled inputs?**
DOM holds the value; read via ref or FormData on submit. Less re-rendering — React Hook Form leverages this.

**15. Fragments?**
`<>...</>` or `<Fragment key=...>` — group without extra DOM nodes.

**16. `children` prop?**
Whatever is nested between tags; enables composition (`<Card><Body/></Card>`).

**17. Lifting state up?**
Move shared state to the closest common parent; pass data down and callbacks up.

**18. Prop drilling and solutions?**
Passing props through many layers. Solutions: composition (pass components as children/slots), context, or a store.

**19. `useEffect` basics?**
```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup
}, [tick]);
```
Runs after paint. Dependencies control re-runs. Cleanup runs before the next run and on unmount.

**20. Dependency array cases?**
No array → every render. `[]` → once after mount. `[a, b]` → when a or b change (Object.is comparison).

**21. `useRef` basics?**
`ref.current` persists across renders without causing re-renders. For DOM access and mutable values (timers, previous values, SDK instances).

**22. Styling options in React?**
CSS files/Modules, Tailwind, CSS-in-JS, inline styles (objects, camelCase).

**23. What are React DevTools used for?**
Inspect component tree, props/state/hooks, highlight re-renders, Profiler for performance.

---

## 🟡 Level 2 — Intermediate

**24. What triggers a re-render?**
1) its state changes, 2) its parent re-renders, 3) a context it consumes changes. Prop changes only matter because the parent re-rendered.

**25. Rendering vs committing?**
Render phase calls components and computes the diff (should be pure). Commit phase applies DOM changes, then runs layout effects, then passive effects.

**26. Reconciliation rules?**
Different element type at the same position → unmount old subtree, mount new (state lost). Same type → keep instance, update props. Keys identify children across renders.

**27. Using `key` to reset state?**
`<ProfileForm key={userId} />` — changing the key remounts the component with fresh state. Cleaner than syncing state with effects.

**28. Batching?**
React 18+ batches all state updates in the same tick (event handlers, promises, timeouts) into one render. `flushSync` forces immediate update (rarely needed).

**29. Why doesn't state update immediately after `setState`?**
Updates are scheduled; the current render's variable is a snapshot. Read the new value in the next render or compute the next value locally.

**30. Stale closure bug?**
```tsx
useEffect(() => { const id = setInterval(() => setCount(count + 1), 1000); return () => clearInterval(id); }, []); // stuck at 1
```
Fix: `setCount(c => c + 1)` or include deps; or keep latest value in a ref.

**31. `useEffect` vs `useLayoutEffect` vs `useInsertionEffect`?**
- `useEffect` — after paint; most side effects.
- `useLayoutEffect` — after DOM mutation, before paint; measure layout to avoid flicker (tooltips positioning).
- `useInsertionEffect` — before layout effects; for CSS-in-JS libraries injecting styles.

**32. "You might not need an effect" — cases?**
- Derived data → compute during render (or `useMemo`).
- Reset state on prop change → `key`.
- Responding to user events → do it in the handler.
- Notifying parent → call callback in the handler.
- Fetching → data library (TanStack Query/RTK Query) or framework loader.
- Subscribing to external store → `useSyncExternalStore`.

**33. Effects running twice in development?**
StrictMode mounts, unmounts and remounts to surface missing cleanup. Production runs once. Fix the cleanup (abort fetch, disconnect socket).

**34. Data fetching in an effect done correctly?**
```tsx
useEffect(() => {
  const ctrl = new AbortController();
  setStatus('loading');
  fetch(`/api/calls?tenant=${tenantId}`, { signal: ctrl.signal })
    .then(r => r.json()).then(d => { setCalls(d); setStatus('success'); })
    .catch(e => { if (e.name !== 'AbortError') setStatus('error'); });
  return () => ctrl.abort();
}, [tenantId]);
```
In real apps prefer a query library (caching, dedupe, retries).

**35. `useMemo`, `useCallback`, `React.memo`?**
- `useMemo(fn, deps)` caches a computed value.
- `useCallback(fn, deps)` caches a function reference (= `useMemo(() => fn)`).
- `memo(Component)` skips re-render if props are shallow-equal.
They matter together: memoized child + stable props. Don't wrap everything — measure first.

**36. When is `useMemo` worth it?**
Expensive computations (sorting/filtering thousands of rows), referential stability for deps of other hooks or memoized children, context values.

**37. React Compiler?**
Build-time tool that auto-memoizes components and hooks, reducing manual `useMemo`/`useCallback`/`memo`. Requires code that follows the Rules of React (pure render, no mutation of props/state).

**38. `useReducer` — when over `useState`?**
Multiple related values, complex transitions, next state depends on previous in many ways — e.g., call lifecycle or wizard forms. Reducer is pure and testable.

**39. Context API — how and pitfalls?**
```tsx
const TenantCtx = createContext<Tenant | null>(null);
<TenantCtx.Provider value={tenant}>{children}</TenantCtx.Provider> // React 19: <TenantCtx value={tenant}>
```
Every consumer re-renders when the value changes (by reference). Pitfalls: new object each render, putting fast-changing data in context. Fixes: memoize value, split contexts (state vs dispatch), use store with selectors.

**40. Custom hooks?**
Functions starting with `use` that compose hooks to share logic (not state). E.g. `useDebounce`, `usePermission`, `useParticipants`, `useMediaDevices`.

**41. Rules of Hooks — and why?**
Call hooks only at the top level of components/custom hooks, never conditionally or in loops. React identifies hooks by call order. (React 19's `use` is the exception — callable conditionally.)

**42. Refs to DOM and imperative APIs?**
```tsx
const videoRef = useRef<HTMLVideoElement>(null);
useEffect(() => { videoRef.current?.play(); }, []);
```
`useImperativeHandle` exposes a limited API (`focus()`, `scrollToBottom()`) from a child.

**43. Portals?**
`createPortal(children, document.body)` renders outside the parent DOM (modals, toasts, tooltips) while events still bubble through the React tree.

**44. Error boundaries?**
Catch render/lifecycle errors in children and show fallback UI. Implemented as class components (`getDerivedStateFromError`, `componentDidCatch`) or with `react-error-boundary`. Don't catch errors in event handlers, async code or the boundary itself.

**45. Code splitting with `lazy` and `Suspense`?**
```tsx
const CallRoom = lazy(() => import('./CallRoom'));
<Suspense fallback={<Spinner />}><CallRoom /></Suspense>
```
Split by route and by heavy features (video SDK, charts, editors).

**46. Forms at scale?**
React Hook Form (uncontrolled, minimal re-renders) + Zod schema validation; field arrays for dynamic scorecards; accessible errors.

**47. Routing basics (React Router)?**
Nested routes, layouts with `<Outlet>`, loaders/actions (data router), `useNavigate`, `useParams`, `useSearchParams`, route-level code splitting, protected routes.

**48. Compound components pattern?**
```tsx
<Tabs defaultValue="calls">
  <Tabs.List><Tabs.Trigger value="calls">Calls</Tabs.Trigger></Tabs.List>
  <Tabs.Content value="calls">...</Tabs.Content>
</Tabs>
```
Parent holds state in context; children read it. Flexible markup, clear API (Radix style).

**49. Render props, HOCs, hooks?**
Render props: pass a function as child to share logic. HOCs: wrap a component to inject behaviour (`withAuth`). Hooks replaced most use cases; HOCs still useful for cross-cutting wrappers.

**50. Container/presentational split?**
Containers fetch data and handle logic; presentational components render props. Hooks blur the line, but separation still helps testing and Storybook.

**51. Headless UI?**
Components providing behaviour + accessibility without styles (Radix, React Aria, Headless UI, TanStack Table). You own the visuals.

---

## 🔴 Level 3 — Advanced

**52. Fiber architecture?**
Each element becomes a fiber node (unit of work) with links (child, sibling, return). React can pause, resume, prioritise and abandon work — enabling concurrent rendering. Two trees: current and work-in-progress; commit swaps them.

**53. Lanes and priorities?**
Updates get lanes (priorities): discrete input (click) > continuous (drag) > default > transition > idle. Urgent updates can interrupt transitions.

**54. Concurrent rendering — what changes for you?**
Rendering may be interrupted and restarted, so render must be pure (no side effects). Effects only run after commit.

**55. `useTransition`?**
Mark state updates as non-urgent so input stays responsive:
```tsx
const [isPending, startTransition] = useTransition();
onChange={e => { setQuery(e.target.value); startTransition(() => setFilter(e.target.value)); }}
```

**56. `useDeferredValue`?**
Defer re-rendering expensive children with a lagging copy of a value: `const deferred = useDeferredValue(query);`.

**57. `useSyncExternalStore`?**
Subscribe to external mutable sources (Redux, Zustand, browser APIs) without tearing in concurrent rendering.
```tsx
const online = useSyncExternalStore(
  cb => { addEventListener('online', cb); addEventListener('offline', cb); return () => { removeEventListener('online', cb); removeEventListener('offline', cb); }; },
  () => navigator.onLine, () => true);
```

**58. Tearing?**
Different components showing different versions of the same external data in one render — prevented by `useSyncExternalStore`.

**59. `useId`?**
Stable unique IDs consistent between server and client — for `htmlFor`/`aria-describedby`. Not for list keys.

**60. Suspense for data — how does it work?**
A component "suspends" by throwing a promise (internally) / using `use(promise)`; nearest Suspense boundary shows fallback; React retries render when the promise resolves. Frameworks and libraries manage caching of promises.

**61. Hydration?**
Client React attaches to server-rendered HTML instead of recreating it. Mismatch occurs when client render differs (Date.now(), random, `window` checks, locale formatting). React 18+ supports selective hydration with Suspense.

**62. Server Components vs Client Components (conceptually)?**
Server Components run only on the server, can be async, access data directly, ship zero JS, can't use state/effects/browser APIs. Client Components (`'use client'`) are hydrated and interactive. Server Components can render Client Components and pass serializable props.

**63. Streaming SSR?**
`renderToPipeableStream`/`renderToReadableStream` send the shell immediately and stream Suspense boundaries as data resolves.

**64. Performance profiling workflow?**
1) React Profiler: record interaction, find components with long render or frequent renders. 2) "Why did this render?" 3) Fix: colocate state, split components, memoize, virtualize, move work out of render, transitions. 4) Re-measure. Also Chrome Performance panel for long tasks.

**65. State colocation?**
Keep state as close as possible to where it's used; global state causes broad re-renders.

**66. Context performance fix — selector pattern?**
Context with a store and selector hook (`use-context-selector`) or switch to Zustand/Redux where components subscribe to slices.

**67. Virtualization?**
Render only visible rows: TanStack Virtual / react-window. Needed for thousands of calls, chat messages, transcript lines.

**68. Avoiding re-render storms from high-frequency data (audio levels, cursor positions)?**
Keep high-frequency values out of React state: update refs/DOM directly or via rAF, subscribe per component, throttle updates, or use CSS variables set from JS.

**69. Micro-frontends with React?**
Module Federation to load remote apps at runtime; share React as a singleton; communicate via props/events/URL; isolate styles; version contracts. Use only when team/deploy independence justifies the complexity.

**70. Design system architecture in React?**
Tokens → primitives (Radix-based) → composed components → patterns. Storybook docs, visual regression, a11y tests, semver releases, codemods for breaking changes.

**71. Error handling strategy for a large app?**
Route-level error boundaries, component-level boundaries around risky widgets (video, charts), query error states, global `unhandledrejection` → Sentry, user-friendly retry UI.

**72. Accessibility in React specifics?**
Use semantic elements; manage focus on route change and dialog open/close; `aria-*` attributes pass through as-is; `htmlFor`; live regions for async updates; test with jest-axe and keyboard.

**73. Internationalization?**
react-intl / i18next; ICU message format for plurals; `Intl` for dates/numbers; RTL support via `dir` and logical CSS properties.

**74. Security in React?**
JSX escapes by default; risks: `dangerouslySetInnerHTML`, `javascript:` URLs from user input, rendering markdown/LLM output without sanitizing, leaking secrets via env vars bundled into client code.

---

## ⚛️ React 19 Features

**75. Actions?**
Async functions used in transitions/forms; React handles pending state, errors and optimistic updates.

**76. `useActionState`?**
```tsx
const [state, submitAction, isPending] = useActionState(async (prev: State, formData: FormData) => {
  const res = await saveScore(Object.fromEntries(formData));
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}, { ok: false });
<form action={submitAction}>...<button disabled={isPending}>Save</button></form>
```

**77. `useFormStatus`?**
Read the pending status of the parent `<form>` from a nested component (submit button) without prop drilling.

**78. `useOptimistic`?**
```tsx
const [optimisticMessages, addOptimistic] = useOptimistic(messages, (cur, msg: Msg) => [...cur, { ...msg, sending: true }]);
```
Shows optimistic UI during an action; reverts when the action settles with real state.

**79. `use()`?**
Reads a promise (suspends until resolved) or a context; can be called in conditionals/loops.

**80. `ref` as a prop?**
Function components receive `ref` as a normal prop — `forwardRef` unnecessary for new code. Ref callbacks can return a cleanup function.

**81. Context as provider?**
`<ThemeContext value={theme}>` instead of `<ThemeContext.Provider>`.

**82. Document metadata & resource APIs?**
`<title>`, `<meta>`, `<link>` inside components hoist to `<head>`; `preload`, `preinit`, `prefetchDNS` APIs; stylesheet precedence.

**83. Better hydration error messages and custom element support.**

---

## 🧪 Testing React

**84. Testing pyramid for frontend?**
Many unit/integration tests (components with RTL), fewer E2E (Playwright) for critical flows, visual regression for design system, static analysis (TS, ESLint) at the base.

**85. React Testing Library philosophy?**
Test what the user sees and does. Query priority: `getByRole` → `getByLabelText` → `getByText` → `getByTestId` (last resort).

**86. `getBy` vs `queryBy` vs `findBy`?**
getBy throws if missing; queryBy returns null (for asserting absence); findBy is async (waits) for elements that appear later.

**87. `userEvent` vs `fireEvent`?**
userEvent simulates real interactions (focus, keydown, input, click sequence). Prefer it: `const user = userEvent.setup(); await user.type(input, 'abc');`.

**88. Mocking network with MSW?**
```ts
const server = setupServer(
  http.get('/api/calls', () => HttpResponse.json([{ id: '1', agent: 'Asha' }])),
);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**89. Testing a component with providers?**
Custom `renderWithProviders(ui, { store, route, queryClient })` wrapper — fresh QueryClient per test with retries disabled.

**90. Testing hooks?**
`renderHook(() => useDebounce(value, 300))` with fake timers (`vi.useFakeTimers()`), `act` around timer advances.

**91. Testing async errors and loading states?**
Override MSW handler to return 500 → assert error UI and retry button.

**92. Snapshot tests — good or bad?**
Large snapshots are brittle and rarely reviewed. Small, focused inline snapshots or visual regression tools are better.

**93. What to E2E test with Playwright?**
Login, permissions (agent can't access admin), join call with fake media devices, submit QA scorecard, logout clears data.

**94. Accessibility testing in unit tests?**
`jest-axe` / `vitest-axe`: `expect(await axe(container)).toHaveNoViolations()`.

**95. Flaky tests — causes and fixes?**
Arbitrary timeouts, shared state between tests, real network, animations, time/date dependence. Fix: `findBy`, MSW, fake timers, reset stores, deterministic data, disable animations in test env.

---

## 🧩 Level 4 — Scenario-based

**96. Typing in a search box lags because a 5,000-row table re-filters on every keystroke.**
Debounce or `useDeferredValue`/`useTransition` for the filter; memoize filtered rows; virtualize the table; move filtering server-side for large data.

**97. A dashboard re-renders entirely when one widget's data updates.**
State is too high or context too broad. Colocate state, split context, use selector-based store subscriptions, memoize widgets.

**98. Effect causes an infinite loop.**
Effect sets state that's in its own dependencies, or depends on an object/function recreated every render. Derive instead, memoize the dependency, or move logic to the event handler.

**99. Modal loses focus management and screen readers read the background.**
Use `<dialog>` or Radix Dialog: focus trap, `aria-modal`, inert background, restore focus to the trigger on close.

**100. After logout and login as another tenant, old data briefly shows.**
Clear query caches and store on logout; include tenantId in query keys; `key={tenantId}` on the app shell to remount.

**101. The video tile flickers black when participants join/leave.**
Tiles remount due to unstable keys or parent type changes. Key by participant SID, keep `<video>` element mounted, attach/detach tracks imperatively.

**102. Form with 60 fields is slow.**
Uncontrolled inputs (React Hook Form), split into sections, avoid watching all fields, memoize heavy sections.

**103. Need to share a WebSocket connection across components.**
Create it once outside React (module singleton or context provider holding a ref), expose subscription hook with `useSyncExternalStore`, clean up when the provider unmounts.

**104. Hydration mismatch error on a page showing "time ago".**
Render a stable server value and update on the client after mount, or format with a fixed time zone/locale on both sides; `suppressHydrationWarning` only for intentional single-element differences.

**105. Junior devs keep putting fetch logic in `useEffect` with bugs.**
Introduce TanStack Query/RTK Query, write a team guideline, provide examples and lint rules (`react-hooks/exhaustive-deps`), review checklist.

---

## 🎯 From Your Resume

**106. "How did you integrate LiveKit with React efficiently?"**
Room instance created once per call and held in a ref/provider; per-participant tiles subscribe to their own track events; tiles memoized and keyed by participant SID; audio-level/speaking indicators updated locally (not app-wide state); SDK lazy-loaded with the call route.
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

**107. "How did you build the streaming SSE compliance chat UI without janky renders?"**
Append tokens into a ref buffer; flush to state once per animation frame; render markdown sanitized; only auto-scroll if the user is near the bottom; abort the stream on unmount/stop; announce final message via `aria-live="polite"` (not per token).

**108. "What were your testing standards and how did they reduce production bugs by 30%?"**
RTL + MSW for components, Playwright for critical flows, "every bug fix ships with a regression test", coverage gate on critical modules, PR template; measured via production bug tickets/Sentry issues per release before vs after.

**109. "How did you build role-based portals in BpoBox?"**
Route tree generated from role → permission guards (`RequirePermission`), navigation filtered by permissions, components using `can()` for actions; all mirrored by server-side checks.

**110. "Why React 19 for InterpretIQ — what did you actually use from it?"**
Answer honestly with the features you used (Actions/useActionState for forms, ref as prop, document metadata) and what benefit you saw. Don't claim features you didn't use.
