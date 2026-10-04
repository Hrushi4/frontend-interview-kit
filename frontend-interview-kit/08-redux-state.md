# 08 — Redux & State Management

Redux Toolkit · RTK Query · TanStack Query · Zustand · Context · state machines

Levels: **🟢 Basic → 🟡 Intermediate → 🔴 Advanced → 🧩 Scenario → 🎯 From Your Resume**

---

## 🟢 Level 1 — Basics

**1. What is "state" in a frontend app? Types of state?**
- **Local UI state** — modal open, input text (useState).
- **Shared client state** — current user, theme, call controls (context/store).
- **Server state** — data owned by the backend and cached on the client (calls, scores).
- **URL state** — filters, page, selected tab (search params).
- **Form state** — values, errors, dirty/touched.
Picking the right home for each type is the main skill.

**2. What is Redux?**
A predictable state container: one store, state changed only by dispatching actions, new state computed by pure reducers.

**3. Three principles of Redux?**
Single source of truth, state is read-only (change via actions), changes are made with pure functions (reducers).

**4. Action, reducer, store, dispatch, selector?**
Action: `{ type: 'call/muted', payload: true }`. Reducer: `(state, action) => newState`. Store: holds state, `dispatch`, `getState`, `subscribe`. Selector: function reading a piece of state.

**5. Redux data flow?**
UI event → `dispatch(action)` → middleware → reducer → new state → subscribed components re-render if their selected data changed.

**6. Why must reducers be pure?**
Predictability, time-travel debugging, testability, and change detection by reference. No API calls, no random values, no mutation (outside Immer).

**7. What is Redux Toolkit (RTK)? Why is it recommended?**
Official toolset that removes boilerplate: `configureStore` (good defaults, DevTools, thunk, serializability/immutability checks in dev), `createSlice` (actions + reducer), `createAsyncThunk`, `createEntityAdapter`, RTK Query. Uses Immer for "mutating" syntax.

**8. `createSlice` example?**
```ts
type CallControls = { muted: boolean; cameraOn: boolean; layout: 'grid' | 'speaker' };
const initialState: CallControls = { muted: false, cameraOn: true, layout: 'grid' };
const callSlice = createSlice({
  name: 'callControls',
  initialState,
  reducers: {
    toggleMute: s => { s.muted = !s.muted; },
    setLayout: (s, a: PayloadAction<CallControls['layout']>) => { s.layout = a.payload; },
    reset: () => initialState,
  },
});
export const { toggleMute, setLayout, reset } = callSlice.actions;
```

**9. `configureStore`?**
```ts
export const store = configureStore({ reducer: { callControls: callSlice.reducer, [api.reducerPath]: api.reducer },
  middleware: gDM => gDM().concat(api.middleware) });
```

**10. Connecting React: `useSelector` and `useDispatch`?**
```tsx
const muted = useAppSelector(s => s.callControls.muted);
const dispatch = useAppDispatch();
<button aria-pressed={muted} onClick={() => dispatch(toggleMute())}>Mute</button>
```

**11. How does Immer let you "mutate"?**
You modify a draft Proxy; Immer records changes and produces a new immutable object with structural sharing (unchanged parts keep the same reference). Either mutate the draft or return a new value — not both.

**12. Context API vs Redux?**
Context passes a value down the tree (dependency injection). It has no selectors — all consumers re-render on change. Redux/Zustand let components subscribe to specific slices and offer middleware, DevTools and patterns for complex logic.

**13. When don't you need Redux?**
Small apps, mostly server data (use a query library), state used by one subtree (useState/useReducer + context).

---

## 🟡 Level 2 — Intermediate

**14. Middleware — what and examples?**
Functions wrapping dispatch: `store => next => action => { ...; return next(action); }`. Used for async (thunk), logging, analytics, crash reporting, handling auth expiry, websockets.

**15. Thunks?**
Functions dispatched instead of objects; receive `dispatch` and `getState`.
```ts
export const leaveCall = (): AppThunk => async (dispatch, getState) => {
  await api.leave(getState().session.roomId);
  dispatch(reset());
};
```

**16. `createAsyncThunk`?**
```ts
export const fetchTenant = createAsyncThunk('tenant/fetch', async (id: string, { rejectWithValue, signal }) => {
  const res = await fetch(`/api/tenants/${id}`, { signal });
  if (!res.ok) return rejectWithValue(await res.json());
  return (await res.json()) as Tenant;
});
// extraReducers: builder.addCase(fetchTenant.pending, ...).addCase(fetchTenant.fulfilled, ...).addCase(fetchTenant.rejected, ...)
```

**17. Thunk vs Saga vs Listener middleware?**
| | Thunk | Saga | Listener middleware |
|---|---|---|---|
| Style | async functions | generators, effects | reactive callbacks on actions |
| Complexity | low | high | low–medium |
| Good for | simple async | complex orchestration, cancellation, races | side effects reacting to actions (sync to storage, analytics, cross-slice logic) |
RTK's listener middleware is the modern lightweight default for side effects.

**18. Listener middleware example?**
```ts
listener.startListening({
  actionCreator: logout,
  effect: async (_action, api) => { api.dispatch(apiSlice.util.resetApiState()); broadcast.postMessage('logout'); },
});
```

**19. Selectors and memoization with `createSelector`?**
```ts
const selectCalls = (s: RootState) => s.calls.items;
const selectFilter = (s: RootState) => s.calls.filter;
export const selectFlaggedCalls = createSelector([selectCalls, selectFilter],
  (calls, filter) => calls.filter(c => c.flagged && c.agent.includes(filter)));
```
Recomputes only when inputs change and returns the same reference otherwise.

**20. Why does `useSelector(s => s.list.filter(...))` cause re-renders every time?**
`useSelector` compares results by reference; `filter` returns a new array each time. Use memoized selectors or `shallowEqual`.

**21. Normalized state & `createEntityAdapter`?**
```ts
const callsAdapter = createEntityAdapter<Call>();
// state shape: { ids: ['1','2'], entities: { '1': {...}, '2': {...} } }
callsAdapter.upsertMany(state, action.payload);
export const { selectAll, selectById } = callsAdapter.getSelectors((s: RootState) => s.calls);
```
O(1) lookups/updates, no duplication across lists.

**22. Server state vs client state — why separate?**
Server state is a cache: may be stale, needs fetching, deduping, background refresh, invalidation, pagination, retries. Client state is synchronous and owned by the UI. Mixing them into reducers leads to hand-written caching bugs.

**23. RTK Query fundamentals?**
```ts
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api', credentials: 'include' }),
  tagTypes: ['Call', 'Score'],
  endpoints: build => ({
    getCalls: build.query<Call[], { tenantId: string; page: number }>({
      query: ({ tenantId, page }) => `tenants/${tenantId}/calls?page=${page}`,
      providesTags: (res, _e, { tenantId }) => [...(res ?? []).map(c => ({ type: 'Call' as const, id: c.id })), { type: 'Call', id: `LIST-${tenantId}` }],
    }),
    submitScore: build.mutation<Score, ScoreInput>({
      query: body => ({ url: 'scores', method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Call', id: arg.callId }],
    }),
  }),
});
export const { useGetCallsQuery, useSubmitScoreMutation } = api;
```
Provides caching, dedupe, polling, invalidation via tags, generated hooks, loading/error flags.

**24. RTK Query options?**
`pollingInterval`, `skip`, `refetchOnFocus`, `refetchOnReconnect`, `keepUnusedDataFor`, `selectFromResult` (subscribe to a subset), `transformResponse`.

**25. TanStack Query fundamentals?**
- `useQuery({ queryKey, queryFn })` — key identifies cached data.
- `staleTime` — how long data is fresh (no refetch); default 0.
- `gcTime` — how long unused cache stays in memory.
- Refetch on mount/window focus/reconnect when stale.
- `invalidateQueries` after mutations.
- `useInfiniteQuery` for cursor pagination; `placeholderData: keepPreviousData` for smooth paging.

**26. Query key design?**
Hierarchical arrays: `['tenant', tenantId, 'calls', { page, filters }]` → invalidate broadly (`['tenant', tenantId, 'calls']`) or precisely. Always include tenant/user scope.

**27. Optimistic updates with rollback (TanStack Query)?**
```ts
const qc = useQueryClient();
useMutation({
  mutationFn: updateScore,
  onMutate: async (next: Score) => {
    await qc.cancelQueries({ queryKey: ['score', next.id] });
    const prev = qc.getQueryData<Score>(['score', next.id]);
    qc.setQueryData(['score', next.id], next);
    return { prev };
  },
  onError: (_e, next, ctx) => ctx?.prev && qc.setQueryData(['score', next.id], ctx.prev),
  onSettled: (_d, _e, next) => qc.invalidateQueries({ queryKey: ['score', next.id] }),
});
```

**28. RTK Query vs TanStack Query?**
RTK Query: integrated with Redux store/DevTools, endpoint definitions centralised, tag invalidation. TanStack Query: framework-agnostic, very flexible keys, rich devtools, no Redux needed. Both solve server state; pick one per app.

**29. Zustand — basics and why?**
```ts
type CallUI = { muted: boolean; toggleMute: () => void };
export const useCallUI = create<CallUI>()(set => ({ muted: false, toggleMute: () => set(s => ({ muted: !s.muted })) }));
const muted = useCallUI(s => s.muted); // subscribes only to `muted`
```
Tiny, no provider, selector subscriptions, middleware (persist, devtools, immer). Less ceremony than Redux; less structure for big teams.

**30. Jotai / Recoil (atoms)?**
Bottom-up state: small atoms composed with derived atoms; good for fine-grained, graph-like state.

**31. Signals?**
Fine-grained reactive primitives (Preact signals, Solid, Angular signals) that update only dependent DOM/computations without re-rendering whole components.

**32. URL as state?**
Filters, sort, pagination and selected item belong in the URL: shareable, survives refresh, back button works. Sync via `useSearchParams` or nuqs-style helpers.

**33. Form state libraries?**
React Hook Form / Formik / TanStack Form — keep transient form state out of global stores.

**34. Persisting state?**
redux-persist / Zustand `persist` for non-sensitive preferences (layout, theme). Never persist tokens, PHI, or tenant data to localStorage.

**35. Resetting state on logout?**
Root reducer that returns `undefined` state on `logout` action (resets slices), reset API caches (`api.util.resetApiState()` / `queryClient.clear()`), broadcast to other tabs.

**36. Redux DevTools and production?**
Time travel and action log are great for debugging; disable or sanitize in production (`actionSanitizer`, `stateSanitizer`) to avoid exposing sensitive data.

---

## 🔴 Level 3 — Advanced

**37. How does `useSelector` work internally?**
Uses `useSyncExternalStore` subscribed to the store; after each dispatch it runs your selector and compares the result with the previous (=== by default); re-renders only on change.

**38. Store design for a large app?**
Feature-based slices (`features/calls`, `features/scoring`), normalized entities, server state in RTK Query, UI state local, selectors co-located with slices, typed hooks, lazy-loaded reducers (`combineSlices` / `injectInto`) for code-split features.

**39. Code-splitting reducers?**
```ts
const rootReducer = combineSlices(authSlice, api).withLazyLoadedSlices<LazySlices>();
// in the feature chunk:
const injected = scoringSlice.injectInto(rootReducer);
```

**40. Serializability rules — why?**
Actions and state should be plain serializable data for DevTools, persistence and predictability. Don't store class instances (LiveKit `Room`, `MediaStream`, Dates as objects) — store IDs/ISO strings and keep instances in refs/services.

**41. Where to keep non-serializable objects (WebSocket, Room, MediaStream)?**
In a service module or React ref/context; middleware or listeners bridge events into serializable actions (`participantJoined({ id, name })`).

**42. WebSocket/SSE with Redux?**
Custom middleware or RTK Query `onCacheEntryAdded`:
```ts
getCallEvents: build.query<CallEvent[], string>({
  queryFn: () => ({ data: [] }),
  async onCacheEntryAdded(callId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
    await cacheDataLoaded;
    const es = new EventSource(`/api/calls/${callId}/events`, { withCredentials: true });
    es.onmessage = e => updateCachedData(d => { d.push(JSON.parse(e.data)); });
    await cacheEntryRemoved; es.close();
  },
}),
```

**43. Optimistic updates in RTK Query?**
`onQueryStarted` with `api.util.updateQueryData(...)` returning a patch; `patch.undo()` on failure.

**44. Handling 401 globally in RTK Query?**
Wrap `baseQuery` with re-auth logic using a mutex so only one refresh happens; retry the original request; logout on refresh failure.

**45. Cache invalidation strategies?**
Tag/keys invalidation after mutations, time-based staleness, server push events invalidating specific keys, optimistic updates + reconcile. Choose staleness per data type (user profile long, live call status short/real-time).

**46. Derived state — store or compute?**
Compute with selectors/useMemo; storing derived data duplicates truth and goes stale.

**47. State machines (XState) — when?**
Complex flows with many states and illegal transitions: call lifecycle, multi-step onboarding, upload with retries. Benefits: impossible states eliminated, visualizable, testable.
```ts
// call lifecycle (conceptual)
idle → checkingDevices → (granted) connecting → connected ⇄ reconnecting → disconnected
checkingDevices → (denied) permissionError
connecting/reconnecting → (max retries) failed
```

**48. Multi-tab state consistency?**
BroadcastChannel to sync auth/logout and critical preferences; leader election for single socket; refetch on focus for server state.

**49. Performance pitfalls in Redux apps?**
Selectors returning new references, huge non-normalized lists, frequent high-frequency actions (mousemove/audio levels) — keep those out of Redux, connect many list items to whole lists instead of by id.

**50. Testing state logic?**
Reducers and selectors: pure unit tests. Thunks/listeners: integration tests with a real store and MSW. Components: render with a real store preloaded via `preloadedState`.

**51. Migrating legacy Redux (switch reducers, connect HOC) to RTK?**
Introduce `configureStore`, convert one reducer at a time to `createSlice`, replace `connect` with hooks incrementally, move fetching to RTK Query, delete action-type constants.

**52. Choosing a state approach for a new app — answer framework?**
Server state → query library. URL state → router. Form state → form library. Local UI → useState. Small shared client state → context or Zustand. Large shared client state with complex flows/teams → Redux Toolkit (+ state machines for flows).

---

## 🧩 Level 4 — Scenario-based

**53. Switching tenants shows the previous tenant's calls for a moment.**
Tenant missing from cache keys/tags. Include tenantId in every key; clear/reset caches on switch; remount the tenant-scoped shell with `key={tenantId}`.

**54. A list of 2,000 calls re-renders when one call's score updates.**
Normalize; each row selects its own entity by id (`useSelector(s => selectCallById(s, id))`), memoized row components, virtualization.

**55. Two components show different versions of the same user.**
Duplicated copies of server data in multiple slices. Single source: one query cache entry; derive everything else.

**56. After a mutation the list doesn't update.**
Missing invalidation tag/key mismatch, or optimistic patch applied to a different cache key (different args). Align keys; invalidate the list tag.

**57. Redux DevTools shows thousands of `audioLevelChanged` actions.**
High-frequency data doesn't belong in Redux; handle locally in the tile component with refs/rAF.

**58. You need offline drafts for QA scorecards.**
Persist drafts (non-PHI fields only, or encrypt and clear on logout) with a draft key per call; queue submissions; sync on reconnect; conflict handling with server version numbers.

**59. Team argues: "Let's put everything in Redux".**
Explain the state categories; show bugs from manual caching; propose RTK Query for server data and local state for UI; keep Redux for truly shared client state.

**60. A stale token causes a burst of 401s and multiple refresh calls.**
Single-flight refresh (mutex), queue requests during refresh, retry once, logout on failure.

---

## 🎯 From Your Resume

**61. "Why Redux in InterpretIQ?"**
Shared session/call state used across many screens (waiting room, call, post-call), predictable transitions, DevTools to debug complex session flows. Server data handled with a query layer; non-serializable LiveKit objects kept outside the store.

**62. "How did you keep multi-tenant data isolated in the BpoBox client cache?"**
Tenant in every query key/tag, tenant-scoped API client, cache reset on tenant switch/logout, server enforces isolation regardless.

**63. "How would you model the interpretation session lifecycle?"**
State machine: scheduled → waiting room → interpreter matched → connecting → live ⇄ reconnecting → ended / failed; guards for permissions and token validity; events from LiveKit mapped to serializable actions.

**64. "Where did the AI scores live on the client and how did they update?"**
Server state cached per call; updated via polling/SSE when Celery finished scoring; invalidated after reviewer overrides; reviewer overrides optimistic with rollback.
