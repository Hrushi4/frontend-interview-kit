# 08 — Redux and State Management

Redux Toolkit · RTK Query · TanStack Query · Zustand · Context · State Machines

**How this file is organised**

- **Part A — Understand the topic:** what "state" is, the different kinds, how Redux works, and when to use which tool, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is state?

**State** is any data that can change while the app is running and that affects what the user sees: whether a modal is open, the logged-in user, the list of calls, whether the mic is muted.

The most important skill in state management isn't knowing Redux. It's recognising **which kind of state** you're dealing with, because each kind has a best home.

### The five kinds of state

| Kind | Example | Best home |
|---|---|---|
| **Local UI state** | modal open, input text, hover | `useState` / `useReducer` in the component |
| **Shared client state** | current user, theme, call controls | Context, Zustand or Redux |
| **Server state** | calls, scores, tenants (owned by the backend) | TanStack Query or RTK Query (a cache) |
| **URL state** | filters, page number, selected tab | the URL (search params) |
| **Form state** | values, errors, touched fields | React Hook Form |

**Server state is special.** It's a *copy* of data that lives on the server, so it can be stale. It needs fetching, caching, deduplication, refreshing and invalidation. Query libraries solve exactly this. Writing it by hand in Redux reducers is the most common state-management mistake.

### How Redux works

Redux keeps shared client state in **one store** and only allows changes through a strict, predictable flow:

```text
  UI event (click "Mute")
        │
        ▼
  dispatch({ type: 'call/toggleMute' })     ← an ACTION: a plain object describing what happened
        │
        ▼
  middleware (logging, async, analytics)
        │
        ▼
  reducer(state, action) → newState          ← a PURE function computes the next state
        │
        ▼
  store updates → components whose selected data changed re-render
```

Three principles:

1. **Single source of truth:** one store.
2. **State is read-only:** you change it only by dispatching actions.
3. **Changes are made by pure functions:** reducers.

**Redux Toolkit (RTK)** is the modern, official way to write Redux. It removes the boilerplate (`createSlice`, `configureStore`) and lets you write "mutating" code safely with Immer. **RTK Query** is its built-in data-fetching and caching layer.

### Other tools in one line each

- **Context:** passes a value down the tree. It's not a state manager, and every consumer re-renders when the value changes.
- **Zustand:** a tiny store with selector subscriptions and no provider. Less ceremony than Redux.
- **TanStack Query:** the leading server-state cache for any framework.
- **XState (state machines):** models complex flows as explicit states and transitions, so impossible states can't happen.
- **Signals:** fine-grained reactivity that updates only what depends on a value.

### Why interviewers ask about state management

Senior candidates are expected to **architect** state, not just use a library. Expect questions like "Context vs Redux?", "Why not put everything in Redux?", "How do you avoid unnecessary re-renders?", "How do you handle caching and invalidation?", and, for your multi-tenant apps, "How do you make sure one tenant's data never leaks into another's cache?"

---

## Part B — Interview Questions and Answers

Every answer below has four parts: **Short answer** (say this first), **Explanation** (add if asked for more), **Example** (code or a real situation) and **Say it like this** (a sample spoken answer).

## 🟢 Level 1 — Basics

**Q1. What is state in a frontend app, and what types are there?**

**Short answer:** Data that changes over time and affects the UI: local UI state, shared client state, server state, URL state and form state.

**Explanation:** Each type has a best home: `useState`, a store or context, a query cache, the router, and a form library respectively. Choosing the right home removes most state bugs.

**Example:** In BpoBox: a dropdown's `isOpen` (local), the current user (shared client), the call list (server), `?status=flagged` (URL), the scorecard draft (form).

**Say it like this:** "The first question I ask is what kind of state something is. Server data goes in a query cache, filters in the URL, forms in a form library, and only truly shared client state in a store."

---

**Q2. What is Redux?**

**Short answer:** A predictable state container: one store, state changed only by dispatching actions, and pure reducers computing the next state.

**Explanation:** The strict flow makes every change visible and replayable in DevTools, which helps debug complex flows.

**Example:** Clicking Mute dispatches `{ type: 'call/toggleMute' }`, and the reducer flips `muted`.

**Say it like this:** "Redux makes state changes explicit events. That predictability is why I used it for InterpretIQ's call session state."

---

**Q3. What are the three principles of Redux?**

**Short answer:** A single source of truth, state is read-only, and changes are made by pure functions.

**Explanation:** Read-only means you change it only by dispatching actions; pure reducers make changes predictable and testable.

**Example:** You never write `store.getState().call.muted = true`; you dispatch `toggleMute()`.

**Say it like this:** "One store, changes only through actions, computed by pure reducers. That's what gives Redux its debuggability."

---

**Q4. What are actions, reducers, the store, dispatch and selectors?**

**Short answer:** An action describes what happened, a reducer computes the next state, the store holds state, dispatch sends actions, and selectors read state.

**Explanation:** Selectors decouple components from the state's shape, so you can refactor the store without touching components.

**Example:**

```ts
const action = { type: 'call/muted', payload: true };
const reducer = (state, action) => (action.type === 'call/muted' ? { ...state, muted: action.payload } : state);
const selectMuted = (state) => state.call.muted;
```

**Say it like this:** "Actions are facts, reducers are rules, selectors are read access, and dispatch connects UI events to the store."

---

**Q5. Describe the Redux data flow.**

**Short answer:** A UI event dispatches an action, middleware processes it, the reducer produces new state, and components whose selected data changed re-render.

**Explanation:** It's strictly one-way, so you can trace any change back to an action.

**Example:**

```text
click Mute → dispatch(toggleMute()) → middleware (logging) → reducer → new state → MuteButton re-renders
```

**Say it like this:** "It's one-way and predictable: every change is an action I can see and replay in DevTools."

---

**Q6. Why must reducers be pure?**

**Short answer:** For predictability, time-travel debugging and testability, and because Redux detects changes by reference.

**Explanation:** No API calls, random values or mutation (except through Immer). Side effects belong in thunks, listeners or RTK Query.

**Example:**

```ts
// ❌ impure
addCall: (s, a) => { s.items.push({ ...a.payload, id: crypto.randomUUID() }); }
// ✅ generate the ID in the action creator (prepare callback) instead
```

**Say it like this:** "Reducers are pure calculations; anything random or async happens before the action is dispatched."

---

**Q7. What is Redux Toolkit, and why is it recommended?**

**Short answer:** The official modern way to write Redux, with `configureStore`, `createSlice`, `createAsyncThunk`, entity adapters and RTK Query.

**Explanation:** It removes boilerplate, adds dev checks for mutation and serialisability, and uses Immer for safe "mutating" syntax.

**Example:** A slice with three actions is about ten lines with `createSlice`, versus constants, action creators and a switch in classic Redux.

**Say it like this:** "There's no reason to write classic Redux today; RTK gives the same model with a fraction of the code."

---

**Q8. Show a `createSlice` example.**

**Short answer:** `createSlice` takes a name, initial state and reducers, and generates action creators and the reducer.

**Explanation:** Action types are generated (`callControls/toggleMute`), and Immer lets you write mutating code safely.

**Example:**

```ts
type CallControls = { muted: boolean; layout: 'grid' | 'speaker' };
const initialState: CallControls = { muted: false, layout: 'grid' };
const callSlice = createSlice({
  name: 'callControls',
  initialState,
  reducers: {
    toggleMute: (s) => { s.muted = !s.muted; },
    setLayout: (s, a: PayloadAction<CallControls['layout']>) => { s.layout = a.payload; },
    reset: () => initialState,
  },
});
export const { toggleMute, setLayout, reset } = callSlice.actions;
```

**Say it like this:** "A slice bundles state, reducers and generated actions for one feature."

---

**Q9. What does `configureStore` look like?**

**Short answer:** It combines slice reducers and middleware with good defaults, including DevTools and thunk.

**Explanation:** RTK Query needs its reducer and middleware added.

**Example:**

```ts
export const store = configureStore({
  reducer: { callControls: callSlice.reducer, [api.reducerPath]: api.reducer },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
```

**Say it like this:** "`configureStore` sets up DevTools and safety checks for free; I just plug in slices and RTK Query."

---

**Q10. How do you connect React with `useSelector` and `useDispatch`?**

**Short answer:** `useSelector` reads a slice of state and re-renders only when it changes; `useDispatch` returns the dispatch function.

**Explanation:** Use typed versions (`useAppSelector`, `useAppDispatch`) so selectors and actions are type-checked.

**Example:**

```tsx
function MuteButton() {
  const muted = useAppSelector((s) => s.callControls.muted);
  const dispatch = useAppDispatch();
  return <button aria-pressed={muted} onClick={() => dispatch(toggleMute())}>{muted ? 'Unmute' : 'Mute'}</button>;
}
```

**Say it like this:** "Each component selects only what it needs, so a change elsewhere in the store doesn't re-render it."

---

**Q11. How does Immer let you "mutate" state?**

**Short answer:** Your reducer edits a draft proxy; Immer records the changes and produces a new immutable object with structural sharing.

**Explanation:** Unchanged parts keep their references, so change detection stays cheap. Either mutate the draft or return a new value, never both.

**Example:**

```ts
addCall: (s, a) => { s.items.push(a.payload); }   // ✅ mutate draft
clear: () => ({ items: [] })                      // ✅ return new
```

**Say it like this:** "Immer gives readable mutating syntax while still producing immutable updates."

---

**Q12. Context API vs Redux?**

**Short answer:** Context passes values down the tree and re-renders every consumer on change; Redux and Zustand let components subscribe to specific slices and add middleware and DevTools.

**Explanation:**

| | Context | Redux Toolkit / Zustand |
|---|---|---|
| Purpose | pass values | manage shared state |
| Re-renders | all consumers | only changed selections |
| DevTools | no | yes |

**Example:** Theme and tenant config in context; live call state in Redux.

**Say it like this:** "Context for rarely changing values, a store with selectors for frequently changing shared state."

---

**Q13. When don't you need Redux?**

**Short answer:** In small apps, apps whose data is mostly server state, or when state is used by only one subtree.

**Explanation:** A query library plus local state and a little context often covers everything.

**Example:** An internal admin tool with CRUD screens needs TanStack Query and `useState`, not Redux.

**Say it like this:** "Once server data lives in a query cache, many apps have very little global state left, so Redux may not be needed."

---

## 🟡 Level 2 — Intermediate

**Q14. What is middleware, and what's it used for?**

**Short answer:** Functions wrapping `dispatch` that see every action before the reducer.

**Explanation:** Uses include async logic, logging, analytics, crash reporting, global auth handling and WebSocket bridges.

**Example:**

```ts
const logger: Middleware = (store) => (next) => (action) => {
  console.log('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  return result;
};
```

**Say it like this:** "Middleware is the interception point for cross-cutting concerns like logging or handling expired sessions."

---

**Q15. What are thunks?**

**Short answer:** Functions you dispatch instead of plain objects, receiving `dispatch` and `getState` to run async logic.

**Explanation:** They're the simplest way to do side effects in Redux and are included by default in RTK.

**Example:**

```ts
export const leaveCall = (): AppThunk => async (dispatch, getState) => {
  await api.leave(getState().session.roomId);
  dispatch(reset());
};
```

**Say it like this:** "Thunks hold async workflows that end in dispatching plain actions."

---

**Q16. How does `createAsyncThunk` work?**

**Short answer:** It generates `pending`, `fulfilled` and `rejected` actions around an async function.

**Explanation:** Handle them in `extraReducers`. For plain data fetching, RTK Query is usually better because it adds caching.

**Example:**

```ts
export const fetchTenant = createAsyncThunk('tenant/fetch', async (id: string, { rejectWithValue, signal }) => {
  const res = await fetch(`/api/tenants/${id}`, { signal });
  if (!res.ok) return rejectWithValue(await res.json());
  return (await res.json()) as Tenant;
});
```

**Say it like this:** "`createAsyncThunk` standardises loading and error actions, though for fetching I'd normally use RTK Query."

---

**Q17. Thunk vs saga vs listener middleware?**

**Short answer:** Thunks for simple async, sagas for complex orchestration with generators, listener middleware for reacting to actions with lightweight side effects.

**Explanation:** Sagas are powerful (cancellation, races) but add a generator-based paradigm most teams don't need.

**Example:** On logout, a listener clears API caches and broadcasts to other tabs.

**Say it like this:** "For side effects that react to actions, RTK's listener middleware is my default; sagas only for genuinely complex orchestration."

---

**Q18. Give a listener middleware example.**

**Short answer:** `startListening` runs an effect whenever a matching action is dispatched.

**Explanation:** It's ideal for cross-slice logic, syncing storage and analytics, without putting side effects in reducers.

**Example:**

```ts
const listener = createListenerMiddleware();
listener.startListening({
  actionCreator: logout,
  effect: async (_action, api) => {
    api.dispatch(apiSlice.util.resetApiState());
    broadcast.postMessage('logout');
  },
});
```

**Say it like this:** "Logout cleanup lives in one listener: reset caches and log out other tabs."

---

**Q19. What are selectors, and how does `createSelector` memoize them?**

**Short answer:** Selectors read state; `createSelector` recomputes only when its inputs change and otherwise returns the same reference.

**Explanation:** That avoids repeated expensive work and unnecessary re-renders from new arrays.

**Example:**

```ts
export const selectFlaggedCalls = createSelector(
  [(s: RootState) => s.calls.items, (s: RootState) => s.calls.filter],
  (calls, filter) => calls.filter((c) => c.flagged && c.agent.includes(filter)),
);
```

**Say it like this:** "Memoised selectors return the same array until inputs change, so components don't re-render for nothing."

---

**Q20. Why does `useSelector((s) => s.list.filter(...))` re-render every time?**

**Short answer:** `filter` returns a new array each call, and `useSelector` compares with `===`, so it sees a change after every dispatch.

**Explanation:** Use a memoised selector or `shallowEqual`.

**Example:**

```ts
const flagged = useAppSelector(selectFlaggedCalls);           // memoised
const ids = useAppSelector((s) => s.calls.ids, shallowEqual); // shallow compare
```

**Say it like this:** "Deriving arrays inline in `useSelector` re-renders on every action; I move that into `createSelector`."

---

**Q21. What is normalised state, and what does `createEntityAdapter` do?**

**Short answer:** Storing items by ID in a lookup table instead of nested arrays; the entity adapter gives CRUD reducers and selectors for that shape.

**Explanation:** Lookups and updates are O(1), and an item is never duplicated across lists.

**Example:**

```ts
const callsAdapter = createEntityAdapter<Call>();
const callsSlice = createSlice({
  name: 'calls',
  initialState: callsAdapter.getInitialState(),
  reducers: { callsReceived: callsAdapter.upsertMany, callUpdated: callsAdapter.updateOne },
});
export const { selectAll, selectById } = callsAdapter.getSelectors((s: RootState) => s.calls);
```

**Say it like this:** "Normalising means one copy of each call; updating its score fixes it everywhere it's shown."

---

**Q22. Why separate server state from client state?**

**Short answer:** Server state is a cache that can go stale and needs fetching, deduplication, refresh and invalidation; client state is synchronous and owned by the UI.

**Explanation:** Hand-written caching in reducers (loading flags, timestamps, manual refetch) is buggy and verbose.

**Example:** Moving the call list from a Redux slice with `isLoading`/`lastFetched` into RTK Query deleted ~150 lines and fixed stale-data bugs.

**Say it like this:** "Most old Redux code I've seen was hand-written caching; moving server data to a query library deleted it and its bugs."

---

**Q23. What are the fundamentals of RTK Query?**

**Short answer:** Define endpoints once and get generated hooks with caching, deduplication, polling, loading flags and tag-based invalidation.

**Explanation:** When a mutation invalidates a tag, every query providing that tag refetches automatically.

**Example:**

```ts
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api', credentials: 'include' }),
  tagTypes: ['Call'],
  endpoints: (b) => ({
    getCalls: b.query<Call[], { tenantId: string }>({
      query: ({ tenantId }) => `tenants/${tenantId}/calls`,
      providesTags: (r) => (r ?? []).map((c) => ({ type: 'Call' as const, id: c.id })),
    }),
    submitScore: b.mutation<Score, ScoreInput>({
      query: (body) => ({ url: 'scores', method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Call', id: arg.callId }],
    }),
  }),
});
```

**Say it like this:** "Endpoints declare what data they provide and invalidate, and RTK Query keeps the UI in sync automatically."

---

**Q24. Which RTK Query options are useful?**

**Short answer:** `pollingInterval`, `skip`, `refetchOnFocus`, `refetchOnReconnect`, `keepUnusedDataFor`, `selectFromResult` and `transformResponse`.

**Explanation:** `skip` waits for required arguments; `selectFromResult` subscribes to part of the result to limit re-renders.

**Example:**

```ts
const { data } = useGetCallQuery(callId!, { skip: !callId, pollingInterval: 10_000 });
```

**Say it like this:** "I use `skip` until an ID exists and polling for job status, like waiting for AI scoring to finish."

---

**Q25. What are the fundamentals of TanStack Query?**

**Short answer:** `useQuery` caches data by `queryKey`; `staleTime` controls freshness; stale data refetches on mount, focus and reconnect; mutations invalidate keys.

**Explanation:** `gcTime` controls how long unused data stays in memory; `useInfiniteQuery` handles cursor pagination.

**Example:**

```tsx
const { data, isPending } = useQuery({
  queryKey: ['tenant', tenantId, 'calls', { page, status }],
  queryFn: () => getCalls({ tenantId, page, status }),
  staleTime: 30_000,
  placeholderData: keepPreviousData,
});
```

**Say it like this:** "TanStack Query treats server data as a cache with clear freshness rules, so I stop writing loading flags by hand."

---

**Q26. How should you design query keys?**

**Short answer:** Hierarchical arrays from general to specific, always including tenant or user scope.

**Explanation:** You can then invalidate broadly or precisely, and caches never mix between accounts.

**Example:** `['tenant', tenantId, 'calls', { page, filters }]`; invalidating `['tenant', tenantId, 'calls']` refreshes every page.

**Say it like this:** "Keys go general to specific and always start with the tenant, which makes invalidation easy and leaks impossible."

---

**Q27. How do you do optimistic updates with rollback in TanStack Query?**

**Short answer:** In `onMutate`, cancel queries, snapshot, and set the new data; in `onError`, restore the snapshot; in `onSettled`, invalidate.

**Explanation:** The UI updates instantly, rolls back if the server rejects, and resyncs either way.

**Example:**

```ts
useMutation({
  mutationFn: updateScore,
  onMutate: async (next: Score) => {
    await qc.cancelQueries({ queryKey: ['score', next.id] });
    const previous = qc.getQueryData<Score>(['score', next.id]);
    qc.setQueryData(['score', next.id], next);
    return { previous };
  },
  onError: (_e, next, ctx) => ctx?.previous && qc.setQueryData(['score', next.id], ctx.previous),
  onSettled: (_d, _e, next) => qc.invalidateQueries({ queryKey: ['score', next.id] }),
});
```

**Say it like this:** "Snapshot, update, roll back on error, then refetch to sync with the truth."

---

**Q28. RTK Query vs TanStack Query?**

**Short answer:** RTK Query integrates with Redux and centralises endpoints with tags; TanStack Query is framework-agnostic with flexible keys and great devtools.

**Explanation:** Both solve server state well; pick one per app.

**Example:** InterpretIQ already used Redux, so RTK Query fit; a new app without Redux would use TanStack Query.

**Say it like this:** "If Redux is already there, RTK Query; otherwise TanStack Query rather than adding Redux just for fetching."

---

**Q29. What is Zustand, and why use it?**

**Short answer:** A tiny store with no provider and selector-based subscriptions.

**Explanation:** It has middleware for persist, devtools and immer, and less ceremony than Redux, but less enforced structure for large teams.

**Example:**

```ts
export const useCallUI = create<{ muted: boolean; toggleMute: () => void }>()((set) => ({
  muted: false,
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}));
const muted = useCallUI((s) => s.muted);
```

**Say it like this:** "Zustand gives store-style selectors with almost no boilerplate, which suits small amounts of shared UI state."

---

**Q30. What are Jotai and Recoil (atoms)?**

**Short answer:** Bottom-up state built from small atoms combined into derived atoms.

**Explanation:** Components subscribe to individual atoms, which suits fine-grained, graph-like state.

**Example:** In a design editor, each shape's position is an atom, and a derived atom computes the selection bounding box.

**Say it like this:** "Atoms fit apps with many independent pieces of state, like editors; for typical dashboards a store is simpler."

---

**Q31. What are signals?**

**Short answer:** Fine-grained reactive values; when one changes, only the code and DOM that read it update.

**Explanation:** Preact Signals, SolidJS and Vue refs use this model, avoiding re-running whole components.

**Example:**

```ts
const count = signal(0);
effect(() => console.log(count.value)); // reruns only when count changes
```

**Say it like this:** "Signals update exactly what depends on a value, without component re-renders."

---

**Q32. Why use the URL as state?**

**Short answer:** Filters, sorting, pagination and the selected item in the URL are shareable, survive refresh, and work with Back.

**Explanation:** Sync it with `useSearchParams` or a helper like nuqs.

**Example:** `/calls?status=flagged&agent=asha&page=3` lets a QA lead send an exact view to a colleague.

**Say it like this:** "If a user might share or refresh a view, its state belongs in the URL."

---

**Q33. Which libraries handle form state?**

**Short answer:** React Hook Form, Formik or TanStack Form.

**Explanation:** Transient keystroke state should stay out of global stores to avoid needless re-renders.

**Example:** The QA scorecard used React Hook Form with a Zod resolver; only the submitted result reached the server cache.

**Say it like this:** "Form state lives in the form library; only the submitted result touches the server or store."

---

**Q34. How do you persist state?**

**Short answer:** redux-persist or Zustand's `persist`, for non-sensitive preferences only.

**Explanation:** Never persist tokens, PHI or tenant data to localStorage; XSS can read it and it stays on shared devices.

**Example:** Persist `{ layout: 'grid', theme: 'dark' }`, never `{ patientName }`.

**Say it like this:** "I persist preferences like layout and theme, never anything sensitive, especially on shared clinic tablets."

---

**Q35. How do you reset state on logout?**

**Short answer:** A root reducer returning `undefined` state on logout, resetting API caches, and broadcasting to other tabs.

**Explanation:** Returning `undefined` makes every slice fall back to its initial state.

**Example:**

```ts
const rootReducer = (state: RootState | undefined, action: Action) => {
  if (logout.match(action)) state = undefined;
  return appReducer(state, action);
};
```

**Say it like this:** "Logout resets the whole store, clears query caches and notifies other tabs, so no data survives the session."

---

**Q36. Should Redux DevTools be enabled in production?**

**Short answer:** Disable it, or sanitise actions and state, because anyone can open DevTools and read sensitive data.

**Explanation:** `actionSanitizer` and `stateSanitizer` can mask fields if you need production debugging.

**Example:**

```ts
configureStore({ reducer, devTools: process.env.NODE_ENV !== 'production' });
```

**Say it like this:** "DevTools is a dev tool; in production it's off, or at least sanitised for anything sensitive."

---

## 🔴 Level 3 — Advanced

**Q37. How does `useSelector` work internally?**

**Short answer:** It uses `useSyncExternalStore`, runs your selector after each dispatch, and re-renders only if the result changed by `===`.

**Explanation:** That's why stable selector outputs matter so much for performance.

**Example:** A selector returning `s.calls.items` (same reference) never re-renders on unrelated actions; one returning `.filter(...)` always does.

**Say it like this:** "`useSelector` compares results by reference, so returning stable values is the key to performance."

---

**Q38. How would you design the store for a large app?**

**Short answer:** Feature-based slices, normalised entities, server data in RTK Query, local UI state kept local, colocated selectors, typed hooks and lazy-loaded reducers.

**Explanation:** This keeps each feature self-contained and the global store small.

**Example:**

```text
features/calls/{callsSlice.ts, selectors.ts}
features/scoring/{scoringSlice.ts}
app/{store.ts, hooks.ts}  services/api.ts
```

**Say it like this:** "Organise by feature, keep the global store small, and let RTK Query own server data."

---

**Q39. How do you code-split reducers?**

**Short answer:** Use `combineSlices` with lazy-loaded slices and inject a feature's reducer when its chunk loads.

**Explanation:** The initial bundle stays small; admin or scoring code loads only when needed.

**Example:**

```ts
const rootReducer = combineSlices(authSlice, api).withLazyLoadedSlices<LazySlices>();
const injected = scoringSlice.injectInto(rootReducer);
```

**Say it like this:** "Reducers can be code-split like components, so rarely used features don't bloat the initial bundle."

---

**Q40. What are the serializability rules, and why do they exist?**

**Short answer:** Actions and state should be plain, serialisable data, not class instances or Date objects.

**Explanation:** It keeps DevTools, persistence and time travel working. Store IDs and ISO strings; keep instances in refs or services.

**Example:** Store `{ connectedAt: '2026-10-04T10:00:00Z' }`, not `{ room: Room }`.

**Say it like this:** "The store holds plain facts; SDK objects like the LiveKit Room live outside it."

---

**Q41. Where do you keep non-serializable objects like a WebSocket, a Room or a MediaStream?**

**Short answer:** In a service module, a ref or a context, with listeners turning their events into serialisable actions.

**Explanation:** The store learns facts like "participant joined", while the object itself stays outside.

**Example:**

```ts
room.on(RoomEvent.ParticipantConnected, (p) =>
  store.dispatch(participantJoined({ id: p.sid, name: p.name ?? 'Guest' })));
```

**Say it like this:** "The Room stays outside Redux; only plain events about it go in, which keeps DevTools working."

---

**Q42. How do you handle WebSocket or SSE data with Redux?**

**Short answer:** Use RTK Query's `onCacheEntryAdded` (or custom middleware) to open the stream for subscribers and close it when they leave.

**Explanation:** The stream's lifetime follows the cache entry's subscribers automatically.

**Example:**

```ts
getCallEvents: build.query<CallEvent[], string>({
  queryFn: () => ({ data: [] }),
  async onCacheEntryAdded(callId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
    await cacheDataLoaded;
    const es = new EventSource(`/api/calls/${callId}/events`, { withCredentials: true });
    es.onmessage = (e) => updateCachedData((d) => { d.push(JSON.parse(e.data)); });
    await cacheEntryRemoved;
    es.close();
  },
}),
```

**Say it like this:** "Streaming updates go straight into the query cache, and the connection closes when the last component unsubscribes."

---

**Q43. How do you do optimistic updates in RTK Query?**

**Short answer:** In `onQueryStarted`, patch the cache with `updateQueryData`, and call `patch.undo()` if the mutation fails.

**Explanation:** It's the RTK Query equivalent of TanStack's `onMutate`/`onError`.

**Example:**

```ts
async onQueryStarted(score, { dispatch, queryFulfilled }) {
  const patch = dispatch(api.util.updateQueryData('getScore', score.id, (d) => { Object.assign(d, score); }));
  try { await queryFulfilled; } catch { patch.undo(); }
}
```

**Say it like this:** "Patch the cache first, undo if the server says no."

---

**Q44. How do you handle a 401 globally in RTK Query?**

**Short answer:** Wrap `baseQuery` with re-auth logic and a mutex so only one refresh runs; retry the original request; log out if refresh fails.

**Explanation:** Without the mutex, ten failing requests trigger ten refreshes, and refresh-token rotation can invalidate them.

**Example:**

```ts
const baseQueryWithReauth: BaseQueryFn = async (args, api, extra) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extra);
  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try { const r = await baseQuery('/auth/refresh', api, extra); if (r.error) api.dispatch(logout()); }
      finally { release(); }
    } else await mutex.waitForUnlock();
    result = await baseQuery(args, api, extra);
  }
  return result;
};
```

**Say it like this:** "A single-flight refresh behind a mutex, then one retry, then logout if it fails."

---

**Q45. What cache invalidation strategies are there?**

**Short answer:** Tag or key invalidation after mutations, time-based staleness, server push events, and optimistic updates with reconciliation.

**Explanation:** Choose freshness per data type: profiles can be minutes old, live call status needs real-time updates.

**Example:** User profile `staleTime: 5 min`; scoring job status polled every 5 s until done; call list invalidated by an SSE "call.scored" event.

**Say it like this:** "Each kind of data gets its own freshness rule instead of one global refetch policy."

---

**Q46. Should derived state be stored or computed?**

**Short answer:** Computed, with selectors or `useMemo`.

**Explanation:** Stored derived values duplicate the truth and go stale when someone forgets to update them.

**Example:** `flaggedCount` is `selectFlaggedCalls(state).length`, never a separate field updated by hand.

**Say it like this:** "Store the minimum and derive the rest, so totals can never disagree with the data."

---

**Q47. When do you use state machines (XState)?**

**Short answer:** For flows with many states and illegal transitions, like a call lifecycle, onboarding or uploads with retries.

**Explanation:** Machines make impossible states impossible, can be visualised as diagrams, and every transition is testable.

**Example:**

```text
idle → checkingDevices → connecting → connected ⇄ reconnecting → disconnected
checkingDevices → (denied) permissionError ;  connecting/reconnecting → (max retries) failed
```

**Say it like this:** "With booleans you can be 'connecting' and 'connected' at once; a machine says exactly one state and which events move it."

---

**Q48. How do you keep state consistent across browser tabs?**

**Short answer:** BroadcastChannel for logout and preferences, leader election for one socket, and refetch on focus for server data.

**Explanation:** Without it, tabs show conflicting data or keep sessions alive after logout.

**Example:** Logging out in one tab posts `'logout'` to a BroadcastChannel; every other tab clears its caches and redirects.

**Say it like this:** "Tabs sync auth through BroadcastChannel and server data through refetch-on-focus."

---

**Q49. What are the common performance pitfalls in Redux apps?**

**Short answer:** Selectors returning new references, non-normalised lists, high-frequency actions through Redux, and list items selecting the whole list.

**Explanation:** Each causes broad re-renders on every dispatch.

**Example:** Rows selecting `s.calls.items` re-render on any call change; selecting `selectCallById(s, id)` re-renders only that row.

**Say it like this:** "Stable selectors, normalised data and per-item subscriptions keep Redux fast."

---

**Q50. How do you test state logic?**

**Short answer:** Unit-test reducers and selectors directly; test thunks and listeners with a real store and MSW; render components with a preloaded store.

**Explanation:** Pure reducers make tests trivial and fast.

**Example:**

```ts
expect(callSlice.reducer({ muted: false } as CallControls, toggleMute()).muted).toBe(true);
```

**Say it like this:** "Reducers are pure functions, so they're the easiest code in the app to test."

---

**Q51. How do you migrate legacy Redux (switch reducers, the `connect` HOC) to RTK?**

**Short answer:** Switch to `configureStore`, convert one reducer at a time to `createSlice`, replace `connect` with hooks gradually, move fetching to RTK Query, and delete constants.

**Explanation:** It's incremental: old and new reducers coexist.

**Example:** Sprint 1: `configureStore` + one slice. Sprint 2–4: convert remaining slices while touching features, and move fetching to RTK Query.

**Say it like this:** "No big bang: RTK works with old reducers, so we convert as we touch code."

---

**Q52. How do you choose a state approach for a new app?**

**Short answer:** Server state → query library; URL state → router; forms → form library; local → `useState`; small shared state → context or Zustand; large complex shared state → Redux Toolkit plus state machines for flows.

**Explanation:** The library choice falls out of listing the kinds of state the app has.

**Example:** For a new analytics dashboard: TanStack Query, URL filters, Zustand for UI preferences, no Redux needed.

**Say it like this:** "I list the kinds of state first; often what's left after removing server data is small enough for Zustand."

---

## 🧩 Level 4 — Scenario-Based

**Q53. Switching tenants shows the previous tenant's calls for a moment.**

**Short answer:** Include `tenantId` in every key, reset caches on switch, and remount the tenant shell with `key={tenantId}`.

**Explanation:** Without tenant-scoped keys, the old cache entry is shown until the new fetch finishes.

**Example:** `['tenant', tenantId, 'calls']` instead of `['calls']`, plus `queryClient.clear()` on switch.

**Say it like this:** "Tenant-scoped keys plus a reset on switch mean one tenant's data can never flash for another."

---

**Q54. A list of 2,000 calls re-renders when one call's score updates.**

**Short answer:** Normalise, have each row select its own entity by ID, memoise rows, and virtualise.

**Explanation:** Rows selecting the whole list re-render on any change.

**Example:**

```tsx
const CallRow = memo(({ id }: { id: string }) => {
  const call = useAppSelector((s) => selectCallById(s, id));
  return <tr>…</tr>;
});
```

**Say it like this:** "Each row subscribes to its own call, so one score update re-renders one row."

---

**Q55. Two components show different versions of the same user.**

**Short answer:** The server data was copied into several slices; keep one source of truth and derive the rest.

**Explanation:** Copies drift whenever one is updated and the other isn't.

**Example:** Remove `profile.user` and `header.user`; both read `useGetMeQuery().data`.

**Say it like this:** "Duplicated server data always drifts; one cache entry fixes it."

---

**Q56. After a mutation, the list doesn't update.**

**Short answer:** The invalidation tag is missing or the keys don't match.

**Explanation:** For example, the optimistic patch targeted `getCalls({ page: 1 })` while the screen shows `getCalls({ page: 1, status: 'all' })`.

**Example:** Add `invalidatesTags: [{ type: 'Call', id: 'LIST' }]` to the mutation and `providesTags` with `'LIST'` to the list query.

**Say it like this:** "I'd check that the mutation invalidates exactly what the list provides; key mismatches are the usual cause."

---

**Q57. Redux DevTools shows thousands of `audioLevelChanged` actions.**

**Short answer:** High-frequency data doesn't belong in Redux; handle it locally with refs and `requestAnimationFrame`.

**Explanation:** Each action runs every selector and floods DevTools.

**Example:** The tile reads `participant.audioLevel` in a rAF loop and sets a CSS variable.

**Say it like this:** "Audio levels are UI animation data, not app state, so they never go through the store."

---

**Q58. You need offline drafts for QA scorecards.**

**Short answer:** Persist drafts per call (non-PHI or encrypted, cleared on logout), queue submissions offline, sync on reconnect, and handle conflicts with versions.

**Explanation:** Version numbers let the server detect that someone else changed the scorecard, so the UI can offer merge or overwrite.

**Example:** Drafts in IndexedDB keyed by `callId`; an outbox replays on `online`; 409 Conflict opens a compare dialog.

**Say it like this:** "Drafts survive offline, submissions queue, and versioning prevents silently overwriting someone else's review."

---

**Q59. The team argues: "Let's put everything in Redux."**

**Short answer:** Explain the kinds of state, show bugs caused by hand-written caching, and pilot RTK Query plus local state on one feature.

**Explanation:** Data from a pilot convinces better than opinions.

**Example:** Migrating the call list deleted 150 lines of loading-flag code and fixed two stale-data bugs.

**Say it like this:** "I'd propose a small pilot and let the deleted code and fixed bugs make the case."

---

**Q60. A stale token causes a burst of 401s and several refresh calls.**

**Short answer:** Make refresh single-flight with a mutex, queue requests during refresh, retry once, and log out on failure.

**Explanation:** Parallel refreshes can invalidate each other with refresh-token rotation.

**Example:** See Q44's `baseQueryWithReauth`.

**Say it like this:** "One refresh for everyone, then a single retry per request."

---

## 🎯 From Your Resume

**Q61. "Why Redux in InterpretIQ?"**

**Short answer:** Shared session and call state across many screens, predictable transitions, and DevTools for debugging complex flows.

**Explanation:** Server data used a query layer; LiveKit objects stayed outside the store and only plain facts went in.

**Example:** Waiting room, live call and post-call summary all read `session` and `call` slices; DevTools replays showed exactly how a failed reconnect unfolded.

**Say it like this:** "Session state was shared across the whole call journey, and being able to replay actions in DevTools made complex bugs debuggable."

---

**Q62. "How did you keep multi-tenant data isolated in the BpoBox client cache?"**

**Short answer:** Tenant ID in every key and tag, a tenant-scoped API client, cache resets on switch and logout, and server-side isolation regardless.

**Explanation:** Client measures prevent visual leaks; security lives on the server.

**Example:** ``providesTags: [{ type: 'Call', id: `LIST-${tenantId}` }]`` and `api.util.resetApiState()` on tenant switch.

**Say it like this:** "Four layers: tenant-scoped keys, a tenant-scoped client, cache resets, and above all server enforcement."

---

**Q63. "How would you model the interpretation session lifecycle?"**

**Short answer:** As a state machine: scheduled → waiting room → interpreter matched → connecting → live ⇄ reconnecting → ended or failed.

**Explanation:** Guards check permissions and token validity; LiveKit events map to serialisable actions driving transitions.

**Example:** `RoomEvent.Reconnecting` dispatches `connectionLost()`, moving `live → reconnecting`; `Reconnected` moves back.

**Say it like this:** "Explicit states and transitions mean every screen handles reconnecting and failure the same way."

---

**Q64. "Where did the AI scores live on the client, and how did they update?"**

**Short answer:** As server state cached per call, refreshed via polling or SSE when scoring finished, with optimistic reviewer overrides and invalidation afterwards.

**Explanation:** Scores belong to the server, so they live in the query cache, not a slice.

**Example:** The detail page polls the scoring job every 5 s until `status: 'done'`, then invalidates the call's score.

**Say it like this:** "Scores were server state: fetched, cached and invalidated, with overrides updated optimistically and rolled back on failure."
