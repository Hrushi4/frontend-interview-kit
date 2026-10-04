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

## 🟢 Level 1 — Basics

**Q1. What is state in a frontend app, and what types are there?**

**Short answer:** State is data that changes over time and affects the UI. There are five types:

- **Local UI state:** whether a modal is open, an input's text. Lives in `useState`.
- **Shared client state:** the current user, theme, call controls. Lives in context or a store.
- **Server state:** backend data cached on the client (calls, scores).
- **URL state:** filters, page, selected tab. Lives in search params.
- **Form state:** values, errors, dirty and touched flags.

**Say it like this:** "The first question I ask is what *kind* of state something is. Server data goes in a query cache, filters go in the URL, form data in a form library, and only truly shared client state goes in a store. Choosing the right home removes most state bugs before they happen."

---

**Q2. What is Redux?**

**Short answer:** A predictable state container. There's one store, the state changes only when you dispatch actions, and pure reducer functions compute the new state.

---

**Q3. What are the three principles of Redux?**

**Short answer:** A single source of truth (one store). State is read-only, so you change it only by dispatching actions. Changes are made with pure functions (reducers).

---

**Q4. What are actions, reducers, the store, dispatch and selectors?**

**Short answer:**

- **Action:** a plain object describing *what happened*: `{ type: 'call/muted', payload: true }`.
- **Reducer:** `(state, action) => newState`. A pure function that computes the next state.
- **Store:** holds the state and exposes `dispatch`, `getState` and `subscribe`.
- **Dispatch:** sends an action to the store.
- **Selector:** a function that reads a piece of state: `(state) => state.call.muted`.

---

**Q5. Describe the Redux data flow.**

**Short answer:** A UI event calls `dispatch(action)`. The action passes through middleware to the reducer, which produces a new state. Subscribed components re-render, but only if *their selected data* changed.

**Say it like this:** "It's one-way and predictable. Every change is an action I can see in DevTools, so when something goes wrong I can replay exactly what happened."

---

**Q6. Why must reducers be pure?**

**Short answer:** For predictability, time-travel debugging and easy testing, and because Redux detects changes *by reference*. Reducers must not make API calls, generate random values or IDs, or mutate state (except through Immer's draft).

---

**Q7. What is Redux Toolkit, and why is it recommended?**

**Short answer:** The official, modern way to write Redux. It removes most of the boilerplate:

- `configureStore`: good defaults, DevTools, thunk, and checks for mutation and serializability in development.
- `createSlice`: generates action creators and the reducer together.
- `createAsyncThunk`: standard async action handling.
- `createEntityAdapter`: normalised collections.
- **RTK Query:** data fetching and caching.

It uses **Immer**, so you can write `state.muted = true` safely.

**Say it like this:** "Classic Redux needed action-type constants, action creators, switch statements and immutable spread updates. RTK's `createSlice` does all of that in about ten lines, so there's no reason to write classic Redux today."

---

**Q8. Show a `createSlice` example.**

```ts
type CallControls = { muted: boolean; cameraOn: boolean; layout: 'grid' | 'speaker' };
const initialState: CallControls = { muted: false, cameraOn: true, layout: 'grid' };

const callSlice = createSlice({
  name: 'callControls',
  initialState,
  reducers: {
    toggleMute: (state) => { state.muted = !state.muted; },          // Immer makes this safe
    setLayout: (state, action: PayloadAction<CallControls['layout']>) => {
      state.layout = action.payload;
    },
    reset: () => initialState,                                          // return a new value
  },
});

export const { toggleMute, setLayout, reset } = callSlice.actions;
export default callSlice.reducer;
```

**Explanation:** The action types are generated automatically (`callControls/toggleMute`), and the action creators are exported for components to dispatch.

---

**Q9. What does `configureStore` look like?**

```ts
export const store = configureStore({
  reducer: {
    callControls: callSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
```

---

**Q10. How do you connect React with `useSelector` and `useDispatch`?**

```tsx
function MuteButton() {
  const muted = useAppSelector((s) => s.callControls.muted);
  const dispatch = useAppDispatch();
  return (
    <button aria-pressed={muted} onClick={() => dispatch(toggleMute())}>
      {muted ? 'Unmute' : 'Mute'}
    </button>
  );
}
```

**Short answer:** `useSelector` reads a slice of state and re-renders the component only when *that value* changes. `useDispatch` returns the dispatch function.

---

**Q11. How does Immer let you "mutate" state?**

**Short answer:** Immer gives your reducer a **draft**, a Proxy. Immer records the changes you make to it, then produces a brand-new immutable object. Unchanged parts keep their old references (*structural sharing*), so change detection stays cheap.

**Rule:** either mutate the draft **or** return a new value. Never both.

```ts
// ✅ mutate
addCall: (state, a) => { state.items.push(a.payload); }
// ✅ return new
clear: () => ({ items: [] })
// ❌ both
bad: (state, a) => { state.items.push(a.payload); return { ...state }; }
```

---

**Q12. Context API vs Redux?**

**Short answer:** Context is *dependency injection*: it passes a value down the tree. It has no selectors, so **every consumer re-renders when the value changes**. Redux and Zustand let components subscribe to *specific slices*, and they add middleware, DevTools and patterns for complex logic.

| | Context | Redux Toolkit / Zustand |
|---|---|---|
| Purpose | pass values down the tree | manage shared state |
| Re-render granularity | all consumers | only components whose selected slice changed |
| DevTools / time travel | no | yes (Redux) |
| Middleware | no | yes |
| Best for | theme, auth user, tenant config (rarely changing) | frequently updated shared state |

**Say it like this:** "I use context for things that rarely change, like the theme or tenant config. For frequently changing shared state, I use a store with selectors, so a change to one field doesn't re-render half the app."

---

**Q13. When don't you need Redux?**

**Short answer:** In small apps, in apps where most data is server data (use a query library), or when state is used only by one subtree (`useState` or `useReducer` plus context).

---

## 🟡 Level 2 — Intermediate

**Q14. What is middleware, and what's it used for?**

**Short answer:** Functions that wrap `dispatch` and can see every action before it reaches the reducer:

```ts
const logger: Middleware = (store) => (next) => (action) => {
  console.log('dispatching', action);
  const result = next(action);       // pass to next middleware / reducer
  console.log('next state', store.getState());
  return result;
};
```

**Uses:** async logic (thunk), logging, analytics, crash reporting, handling expired auth globally, and WebSocket bridges.

---

**Q15. What are thunks?**

**Short answer:** Functions you dispatch instead of plain objects. They receive `dispatch` and `getState`, so they can run async logic and dispatch actions when it finishes.

```ts
export const leaveCall = (): AppThunk => async (dispatch, getState) => {
  await api.leave(getState().session.roomId);
  dispatch(reset());
};
```

---

**Q16. How does `createAsyncThunk` work?**

```ts
export const fetchTenant = createAsyncThunk(
  'tenant/fetch',
  async (id: string, { rejectWithValue, signal }) => {
    const res = await fetch(`/api/tenants/${id}`, { signal });
    if (!res.ok) return rejectWithValue(await res.json());
    return (await res.json()) as Tenant;
  },
);

// in the slice:
extraReducers: (builder) => {
  builder
    .addCase(fetchTenant.pending, (s) => { s.status = 'loading'; })
    .addCase(fetchTenant.fulfilled, (s, a) => { s.status = 'idle'; s.data = a.payload; })
    .addCase(fetchTenant.rejected, (s, a) => { s.status = 'error'; s.error = a.payload; });
}
```

**Short answer:** It generates `pending`, `fulfilled` and `rejected` actions for an async function automatically. For plain data fetching, though, RTK Query is usually better, because it adds caching on top.

---

**Q17. Thunk vs saga vs listener middleware?**

| | Thunk | Redux-Saga | Listener middleware (RTK) |
|---|---|---|---|
| Style | async functions | generator functions and effects | callbacks that react to actions |
| Complexity | low | high | low–medium |
| Good for | simple async | complex orchestration, cancellation, races | side effects such as syncing storage, analytics, cross-slice logic |

**Say it like this:** "For side effects that react to actions, like clearing caches and broadcasting to other tabs on logout, I use RTK's listener middleware. It's lightweight. Sagas are powerful but add a whole generator-based paradigm that most teams don't need."

---

**Q18. Give a listener middleware example.**

```ts
const listener = createListenerMiddleware();

listener.startListening({
  actionCreator: logout,
  effect: async (_action, api) => {
    api.dispatch(apiSlice.util.resetApiState());   // clear all cached server data
    broadcast.postMessage('logout');               // log out other tabs
  },
});
```

---

**Q19. What are selectors, and how does `createSelector` memoize them?**

```ts
const selectCalls = (s: RootState) => s.calls.items;
const selectFilter = (s: RootState) => s.calls.filter;

export const selectFlaggedCalls = createSelector(
  [selectCalls, selectFilter],
  (calls, filter) => calls.filter((c) => c.flagged && c.agent.includes(filter)),
);
```

**Short answer:** `createSelector` (from Reselect) recomputes only when its inputs change. Otherwise it returns the **same reference** as last time. That avoids both repeated expensive work and unnecessary re-renders.

---

**Q20. Why does `useSelector((s) => s.list.filter(...))` re-render every time?**

**Short answer:** `useSelector` compares the result with `===`, and `filter` returns a **new array** on every call. So the component re-renders after *every* dispatch, even unrelated ones. Fix it with a memoized selector (`createSelector`), or pass `shallowEqual` as the comparison function.

---

**Q21. What is normalised state, and what does `createEntityAdapter` do?**

```ts
const callsAdapter = createEntityAdapter<Call>();
// state shape: { ids: ['1', '2'], entities: { '1': {...}, '2': {...} } }

const callsSlice = createSlice({
  name: 'calls',
  initialState: callsAdapter.getInitialState(),
  reducers: { callsReceived: callsAdapter.upsertMany, callUpdated: callsAdapter.updateOne },
});

export const { selectAll, selectById } = callsAdapter.getSelectors((s: RootState) => s.calls);
```

**Short answer:** Normalising means storing items in a lookup table keyed by ID, like a database table, instead of nested arrays. You get O(1) lookups and updates, and the same item is never duplicated in several lists.

---

**Q22. Why separate server state from client state?**

**Short answer:** Server state is a **cache** of data the backend owns. It can be stale, and it needs fetching, deduplication, background refresh, invalidation, pagination and retries. Client state is synchronous and owned by the UI. Putting server data into hand-written reducers means re-implementing a cache, badly.

**Say it like this:** "Most of the Redux code I've seen in older projects was hand-written caching: `isLoading` flags, `lastFetched` timestamps, manual refetching. Moving server data to RTK Query or TanStack Query deleted that code and fixed a whole class of stale-data bugs."

---

**Q23. What are the fundamentals of RTK Query?**

```ts
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api', credentials: 'include' }),
  tagTypes: ['Call', 'Score'],
  endpoints: (build) => ({
    getCalls: build.query<Call[], { tenantId: string; page: number }>({
      query: ({ tenantId, page }) => `tenants/${tenantId}/calls?page=${page}`,
      providesTags: (res, _err, { tenantId }) => [
        ...(res ?? []).map((c) => ({ type: 'Call' as const, id: c.id })),
        { type: 'Call', id: `LIST-${tenantId}` },
      ],
    }),
    submitScore: build.mutation<Score, ScoreInput>({
      query: (body) => ({ url: 'scores', method: 'POST', body }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'Call', id: arg.callId }],
    }),
  }),
});

export const { useGetCallsQuery, useSubmitScoreMutation } = api;

// In a component:
const { data, isLoading, error } = useGetCallsQuery({ tenantId, page });
```

**Short answer:** You define endpoints once and get generated hooks with caching, request deduplication, polling, loading and error flags, and **tag-based invalidation**. When a mutation invalidates a tag, every query that provides that tag refetches automatically.

---

**Q24. Which RTK Query options are useful?**

**Short answer:**

- `pollingInterval`: refetch every N ms.
- `skip`: don't run the query yet (for example, while there's no ID).
- `refetchOnFocus` and `refetchOnReconnect`.
- `keepUnusedDataFor`: how long to keep the cache after the last subscriber goes away.
- `selectFromResult`: subscribe to only part of the result.
- `transformResponse`: reshape the data.

---

**Q25. What are the fundamentals of TanStack Query?**

```tsx
const { data, isPending, error } = useQuery({
  queryKey: ['tenant', tenantId, 'calls', { page, status }],
  queryFn: () => getCalls({ tenantId, page, status }),
  staleTime: 30_000,
  placeholderData: keepPreviousData,   // smooth pagination
});
```

**Short answer:**

- `queryKey` identifies the cached data.
- `staleTime` is how long data counts as fresh. While it's fresh, there's no refetch. The default is 0.
- `gcTime` is how long unused data stays in memory.
- Stale data is refetched automatically on mount, on window focus and on reconnect.
- After a mutation, call `invalidateQueries`.
- `useInfiniteQuery` handles infinite scrolling and cursor pagination.

---

**Q26. How should you design query keys?**

**Short answer:** Use hierarchical arrays from general to specific: `['tenant', tenantId, 'calls', { page, filters }]`. Then you can invalidate broadly (`['tenant', tenantId, 'calls']` refreshes every calls page) or precisely. **Always include the tenant or user scope** so caches never mix between accounts.

---

**Q27. How do you do optimistic updates with rollback in TanStack Query?**

```ts
const qc = useQueryClient();

useMutation({
  mutationFn: updateScore,
  onMutate: async (next: Score) => {
    await qc.cancelQueries({ queryKey: ['score', next.id] });   // stop in-flight refetches
    const previous = qc.getQueryData<Score>(['score', next.id]); // snapshot
    qc.setQueryData(['score', next.id], next);                   // update UI immediately
    return { previous };
  },
  onError: (_err, next, ctx) => {
    if (ctx?.previous) qc.setQueryData(['score', next.id], ctx.previous); // roll back
  },
  onSettled: (_data, _err, next) => qc.invalidateQueries({ queryKey: ['score', next.id] }), // sync
});
```

**Explanation:** The UI updates instantly. If the server rejects the change, it rolls back, and either way you refetch to sync with the truth.

---

**Q28. RTK Query vs TanStack Query?**

**Short answer:** RTK Query is integrated with the Redux store and DevTools, defines endpoints in one central place, and uses tag invalidation. TanStack Query is framework-agnostic, has very flexible keys and excellent devtools, and doesn't need Redux. Both solve server state well, so pick one per app.

**Say it like this:** "If the app already uses Redux, RTK Query fits naturally. If there's no Redux, I'd pick TanStack Query rather than adding Redux just for fetching."

---

**Q29. What is Zustand, and why use it?**

```ts
type CallUI = { muted: boolean; toggleMute: () => void };

export const useCallUI = create<CallUI>()((set) => ({
  muted: false,
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}));

const muted = useCallUI((s) => s.muted);   // subscribes ONLY to `muted`
```

**Short answer:** A tiny store (about 1 KB) with no provider. Selector subscriptions give fine-grained re-renders, and middleware covers `persist`, `devtools` and `immer`. It has less ceremony than Redux, but also less enforced structure, which matters for big teams.

---

**Q30. What are Jotai and Recoil (atoms)?**

**Short answer:** Bottom-up state: you create small *atoms* and combine them into derived atoms. That suits fine-grained, graph-like state, such as a design editor where each element's properties are independent atoms.

---

**Q31. What are signals?**

**Short answer:** Fine-grained reactive values (Preact Signals, Solid, Angular signals). When a signal changes, only the exact DOM nodes or computations that read it update, without re-running whole components.

---

**Q32. Why use the URL as state?**

**Short answer:** Filters, sorting, pagination and the selected item belong in the URL. Users can share and bookmark the view, it survives a refresh, and the back button works. Sync it with `useSearchParams` or a helper library like nuqs.

**Example:** `/calls?status=flagged&agent=asha&page=3`. A QA lead can send this exact view to a colleague.

---

**Q33. Which libraries handle form state?**

**Short answer:** React Hook Form, Formik or TanStack Form. Transient form state (each keystroke) should stay out of global stores.

---

**Q34. How do you persist state?**

**Short answer:** Use redux-persist or Zustand's `persist` middleware for *non-sensitive preferences* like layout or theme. **Never** persist tokens, PHI or tenant data to localStorage, because any XSS can read it and it stays on shared devices.

---

**Q35. How do you reset state on logout?**

```ts
const rootReducer = (state: RootState | undefined, action: Action) => {
  if (logout.match(action)) state = undefined;   // every slice returns its initial state
  return appReducer(state, action);
};
```

**Short answer:** Reset the store (a root reducer that returns `undefined` on logout), reset the API caches (`api.util.resetApiState()` or `queryClient.clear()`), and broadcast the logout to other tabs.

---

**Q36. Should Redux DevTools be enabled in production?**

**Short answer:** Time travel and the action log are great for debugging, but in production either disable them or sanitise actions and state (`actionSanitizer`, `stateSanitizer`). Otherwise anyone who opens DevTools can see sensitive data.

---

## 🔴 Level 3 — Advanced

**Q37. How does `useSelector` work internally?**

**Short answer:** It's built on `useSyncExternalStore`. After every dispatch it runs your selector and compares the result with the previous one using `===` by default. The component re-renders only if the result changed.

---

**Q38. How would you design the store for a large app?**

**Short answer:**

- Feature-based slices (`features/calls`, `features/scoring`).
- Normalised entities.
- Server data in RTK Query; UI state kept local.
- Selectors co-located with their slices.
- Typed hooks (`useAppSelector`).
- Lazy-loaded reducers for code-split features.

---

**Q39. How do you code-split reducers?**

```ts
const rootReducer = combineSlices(authSlice, api).withLazyLoadedSlices<LazySlices>();

// inside the lazily loaded scoring feature:
const injectedReducer = scoringSlice.injectInto(rootReducer);
```

**Short answer:** The scoring feature's reducer is added only when that feature's code chunk loads, so the initial bundle stays small.

---

**Q40. What are the serializability rules, and why do they exist?**

**Short answer:** Actions and state should be plain, serializable data (objects, arrays, strings, numbers). This keeps DevTools, persistence and time travel working, and keeps the state predictable. Don't store class instances (a LiveKit `Room`, a `MediaStream`) or `Date` objects. Store IDs and ISO strings, and keep the instances in refs or service modules.

---

**Q41. Where do you keep non-serializable objects like a WebSocket, a Room or a MediaStream?**

**Short answer:** In a service module, a React ref or a context. Middleware or listeners turn their events into **serializable actions**:

```ts
room.on(RoomEvent.ParticipantConnected, (p) =>
  store.dispatch(participantJoined({ id: p.sid, name: p.name ?? 'Guest' })),
);
```

**Say it like this:** "The Room object lives outside Redux. Only plain facts about it go into the store, like who joined or the connection state. That keeps DevTools working and avoids serialization warnings."

---

**Q42. How do you handle WebSocket or SSE data with Redux?**

```ts
getCallEvents: build.query<CallEvent[], string>({
  queryFn: () => ({ data: [] }),
  async onCacheEntryAdded(callId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
    await cacheDataLoaded;
    const es = new EventSource(`/api/calls/${callId}/events`, { withCredentials: true });
    es.onmessage = (e) => updateCachedData((draft) => { draft.push(JSON.parse(e.data)); });
    await cacheEntryRemoved;   // last subscriber unmounted
    es.close();
  },
}),
```

**Short answer:** Use RTK Query's `onCacheEntryAdded` lifecycle, or custom middleware. The stream opens when the first component subscribes and closes when the last one unsubscribes.

---

**Q43. How do you do optimistic updates in RTK Query?**

```ts
updateScore: build.mutation<Score, Score>({
  query: (s) => ({ url: `scores/${s.id}`, method: 'PUT', body: s }),
  async onQueryStarted(score, { dispatch, queryFulfilled }) {
    const patch = dispatch(api.util.updateQueryData('getScore', score.id, (draft) => {
      Object.assign(draft, score);
    }));
    try { await queryFulfilled; } catch { patch.undo(); }
  },
}),
```

---

**Q44. How do you handle a 401 globally in RTK Query?**

**Short answer:** Wrap `baseQuery` with re-authentication logic and a **mutex**, so only one token refresh happens even if ten requests fail at once. Then retry the original request. If the refresh fails, log out.

```ts
const mutex = new Mutex();
const baseQueryWithReauth: BaseQueryFn = async (args, api, extra) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extra);
  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refresh = await baseQuery('/auth/refresh', api, extra);
        if (refresh.error) api.dispatch(logout());
      } finally { release(); }
    } else {
      await mutex.waitForUnlock();
    }
    result = await baseQuery(args, api, extra);
  }
  return result;
};
```

---

**Q45. What cache invalidation strategies are there?**

**Short answer:**

- Tag or key invalidation after mutations.
- Time-based staleness (`staleTime`).
- Server push events (WebSocket or SSE) that invalidate specific keys.
- Optimistic updates followed by reconciliation.

Choose the staleness per data type. A user profile can be cached for minutes, but live call status needs real-time updates.

---

**Q46. Should derived state be stored or computed?**

**Short answer:** Computed, with selectors or `useMemo`. Storing derived data, like "total flagged calls", duplicates the truth, and it goes stale when you forget to update it.

---

**Q47. When do you use state machines (XState)?**

**Short answer:** For complex flows with many states and illegal transitions: a call lifecycle, a multi-step onboarding, an upload with retries. Impossible states can't happen, the logic can be visualised as a diagram, and every transition is testable.

```text
idle → checkingDevices ──(granted)──► connecting → connected ⇄ reconnecting → disconnected
            │                              │                         │
         (denied)                    (max retries)              (max retries)
            ▼                              ▼                         ▼
     permissionError                    failed ◄─────────────────────┘
```

**Say it like this:** "With booleans like `isConnecting`, `isConnected` and `isReconnecting`, you can end up with two true at once. A state machine says the call is in exactly one state and lists which events can move it where. It also becomes great documentation."

---

**Q48. How do you keep state consistent across browser tabs?**

**Short answer:** Use BroadcastChannel to sync logout and critical preferences, use leader election so only one tab owns a socket, and refetch server state on focus.

---

**Q49. What are the common performance pitfalls in Redux apps?**

**Short answer:**

- Selectors that return new references every time.
- Huge, non-normalised lists.
- High-frequency actions (mouse movement, audio levels) going through Redux.
- List items that select the whole list instead of their own item by ID.

---

**Q50. How do you test state logic?**

**Short answer:** Reducers and selectors are pure, so unit-test them directly. Test thunks and listeners as integration tests with a real store and MSW. Test components by rendering them with a real store created from `preloadedState`.

```ts
expect(callSlice.reducer({ muted: false } as CallControls, toggleMute()).muted).toBe(true);
```

---

**Q51. How do you migrate legacy Redux (switch reducers, the `connect` HOC) to RTK?**

**Short answer:** Incrementally:

1. Switch to `configureStore`. It works with your old reducers.
2. Convert one reducer at a time to `createSlice`.
3. Replace `connect` with hooks as you touch components.
4. Move data fetching to RTK Query.
5. Delete the action-type constants.

---

**Q52. How do you choose a state approach for a new app?**

**Short answer:** Go through the kinds of state in order:

1. Server state → a query library.
2. URL state → the router.
3. Form state → a form library.
4. Local UI state → `useState`.
5. Small shared client state → context or Zustand.
6. Large shared client state with complex flows or big teams → Redux Toolkit, plus state machines for the flows.

**Say it like this:** "I don't start by picking a library. I list the kinds of state the app has, and the library choice usually falls out of that. Often the 'global state' left after removing server data is small enough for Zustand."

---

## 🧩 Level 4 — Scenario-Based

**Q53. Switching tenants shows the previous tenant's calls for a moment.**

**Answer:** The tenant is missing from the cache keys or tags. Include `tenantId` in every key, clear or reset the caches when the tenant switches, and remount the tenant-scoped shell with `key={tenantId}`.

---

**Q54. A list of 2,000 calls re-renders when one call's score updates.**

**Answer:** Normalise the data. Each row selects *its own* entity by ID (`useAppSelector((s) => selectCallById(s, id))`). Memoize the row components, and virtualise the list.

---

**Q55. Two components show different versions of the same user.**

**Answer:** The server data was copied into several slices. Have a single source of truth, one query cache entry, and derive everything else from it.

---

**Q56. After a mutation, the list doesn't update.**

**Answer:** Either the invalidation tag is missing, or the keys don't match. For example, the optimistic patch was applied to `getCalls({ page: 1 })` while the screen shows `getCalls({ page: 1, status: 'all' })`. Align the keys and invalidate the list tag.

---

**Q57. Redux DevTools shows thousands of `audioLevelChanged` actions.**

**Answer:** High-frequency data doesn't belong in Redux. Handle it locally in the tile component with refs and `requestAnimationFrame`.

---

**Q58. You need offline drafts for QA scorecards.**

**Answer:**

- Persist drafts per call ID. Store only non-PHI fields, or encrypt them and clear them on logout.
- Queue submissions while offline and sync on reconnect.
- Handle conflicts with server version numbers: if the server version changed, show a merge or overwrite prompt.

---

**Q59. The team argues: "Let's put everything in Redux."**

**Answer:** Explain the kinds of state and point to real bugs caused by hand-written caching. Propose RTK Query for server data and local state for UI, keeping Redux for truly shared client state. Run a small pilot on one feature to show how much code it deletes.

---

**Q60. A stale token causes a burst of 401s and several refresh calls.**

**Answer:** Make the refresh single-flight with a mutex (Q44). Queue requests while the refresh is in progress, retry each request once, and log out if the refresh fails.

---

## 🎯 From Your Resume

**Q61. "Why Redux in InterpretIQ?"**

**Say it like this:** "The session and call state was shared across many screens: the waiting room, the live call and the post-call summary. It had complex, predictable transitions. Redux gave us one place for that state and DevTools to debug complex session flows by replaying actions. Server data like history and profiles went through a query layer, not hand-written reducers. The non-serializable LiveKit objects stayed outside the store, and only plain facts went in."

---

**Q62. "How did you keep multi-tenant data isolated in the BpoBox client cache?"**

**Say it like this:** "Four layers. The tenant ID was in every query key and tag. The API client was tenant-scoped. The cache was reset on tenant switch and on logout. And most importantly, the server enforced isolation on every request regardless of what the client did. The client-side measures prevented visual leaks, but security lived on the server."

---

**Q63. "How would you model the interpretation session lifecycle?"**

**Say it like this:** "As a state machine: scheduled → waiting room → interpreter matched → connecting → live, which can go back and forth with reconnecting, and finally ended or failed. Guards check permissions and token validity before transitions. LiveKit events are mapped to serializable actions that drive the transitions."

---

**Q64. "Where did the AI scores live on the client, and how did they update?"**

**Say it like this:** "Scores were server state, cached per call in the query layer. When the Celery pipeline finished scoring, the UI learned about it through polling or SSE and refetched that call's score. When a QA reviewer overrode a score, we updated the UI optimistically and rolled back if the save failed. Then we invalidated the call so the audit trail was fresh."
