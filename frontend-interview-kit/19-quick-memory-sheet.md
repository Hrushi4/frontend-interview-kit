# 19 — Quick Memory Sheet (Read in 10–15 Minutes Before Any Interview)

## What this sheet is and how to use it

This is a **revision sheet**, not a learning resource. Each topic has already been explained in detail in its own file (02–18). Here you get only the "engine" lines: the key facts that unlock everything else you know about the topic.

**How to use it:**

1. Read it on the morning of the interview, or 30 minutes before.
2. For each bullet, say the full explanation out loud in one or two sentences. If you can't, go back to that topic's file.
3. Finish with your 30-second pitch at the bottom, said out loud twice.

---

## Git
- fetch = download; pull = fetch + merge/rebase.
- revert (shared, safe) vs reset (local, rewrites). `--force-with-lease`, never plain force.
- reset: soft (keep staged) · mixed (keep files) · hard (discard).
- rebase = linear history; never rebase shared branches. In rebase "ours" = the base.
- reflog recovers lost commits; bisect finds the bad commit; cherry-pick backports fixes.
- Strategies: Git Flow (releases) · GitHub Flow · Trunk-based + feature flags.
- Leaked secret → rotate first, then purge history.

## HTML & Accessibility
- Native element first, ARIA second. `<button>` not clickable div.
- Scripts: default blocks · async (any order) · defer (in order, after parse) · module (deferred).
- Hints: preconnect · preload (now) · prefetch (next) · fetchpriority="high" for LCP image.
- Images: alt, width/height, srcset/sizes, lazy except LCP.
- WCAG POUR, AA: text 4.5:1, large text/UI 3:1.
- Live regions: status = polite, alert = assertive; container must exist before content.
- Focus: visible, logical order, trap in modals, restore on close, move to h1 on route change.
- Storage: cookie (4 KB, sent) · localStorage (persist) · sessionStorage (tab) · IndexedDB (big, async). No tokens/PHI in JS storage.

## CSS
- Specificity: inline > id > class/attr/pseudo-class > element. `:where()` = 0.
- Cascade: importance → layers → specificity → order.
- Flex = 1D, Grid = 2D. Center: `display:grid; place-items:center`.
- `min-width: 0` fixes flex overflow. `auto-fit` stretches, `auto-fill` keeps tracks.
- z-index only within stacking context (transform/opacity/isolation create one).
- Animate transform/opacity only. `will-change` sparingly.
- Modern: `dvh`, `clamp()`, container queries, `:has()`, nesting, `@layer`, logical properties, `aspect-ratio`.
- Dark mode: tokens as CSS variables + prefers-color-scheme + data-theme.

## JavaScript
- Types: 7 primitives + object. `typeof null === 'object'`.
- var (function, undefined) · let/const (block, TDZ).
- Closure = function + remembered scope. Loop + `let` = new binding.
- `this`: new > call/apply/bind > obj.method() > default. Arrows inherit.
- Event loop: sync → ALL microtasks → render → ONE macrotask.
- Promise: all (fail fast) · allSettled · race · any (AggregateError).
- `await` in forEach doesn't wait → for...of or Promise.all.
- fetch doesn't reject on 4xx/5xx → check `res.ok`. Cancel with AbortController.
- Debounce = wait for quiet; Throttle = once per interval.
- Deep copy: structuredClone. Equality: Object.is for NaN.
- Leaks: listeners, intervals, detached DOM, unbounded caches, unclosed sockets/streams.
- Polyfills to practise: map, filter, reduce, bind, Promise.all, debounce, throttle, deepClone, flat, EventEmitter, memoize, pool.

## TypeScript
- unknown > any. never = exhaustive check.
- Discriminated unions model states; `switch` + `never` default.
- Generics + constraints: `<T, K extends keyof T>`.
- Utilities: Partial · Required · Pick · Omit · Record · Exclude · Extract · ReturnType · Parameters · Awaited · NonNullable.
- `as const` + `typeof X[number]`. `satisfies` checks without widening.
- Mapped + conditional + infer + template literal types for advanced questions.
- Branded types for IDs (TenantId vs UserId).
- Types vanish at runtime → validate API/LLM data with Zod.

## React
- UI = f(state). Re-render: own state, parent, context.
- Render (pure) → commit → layout effects → effects.
- Keys = identity; `key` change remounts (reset state).
- Effects sync with external systems; derive data in render; events in handlers.
- StrictMode double-invokes effects in dev → write proper cleanup.
- memo + useCallback/useMemo work together; React Compiler automates.
- Context re-renders all consumers → split / store with selectors.
- Concurrent: useTransition, useDeferredValue. External stores: useSyncExternalStore.
- React 19: Actions, useActionState, useFormStatus, useOptimistic, `use()`, ref as prop, `<Context value>`.
- Testing: RTL getByRole · findBy for async · userEvent · MSW for network.

## State management
- Server state → RTK Query / TanStack Query. URL state → router. Forms → RHF. Local → useState. Shared client → Redux/Zustand. Flows → state machines.
- RTK: createSlice, configureStore, createAsyncThunk, entity adapter, listener middleware.
- Memoized selectors (createSelector); normalize entities.
- Query keys/tags include tenant. Reset caches on logout/tenant switch.
- Optimistic: onMutate snapshot → set → rollback onError → invalidate onSettled.

## Next.js
- Server Components default; `'use client'` at leaves; pass server components as children.
- CSR / SSR / SSG / ISR / streaming / PPR — choose per route.
- Special files: layout, page, loading, error, not-found, route, middleware.
- Server Actions = public endpoints → validate + authorize.
- Caching: request memo · data cache · route cache · router cache; revalidatePath/Tag. Check version defaults.
- `NEXT_PUBLIC_` ships to browser. `server-only` guards secrets.
- Browser-only SDK → `next/dynamic` with `ssr: false`.

## Tailwind
- Utility-first; only scanned class names generated → no dynamic `bg-${x}`.
- v4 `@theme` tokens in CSS; v3 `tailwind.config.js`.
- Mobile-first prefixes; state variants; `data-[state=open]:` for Radix; `aria-*` variants.
- `cn()` = clsx + tailwind-merge; `cva` for variants.
- Tenant theming: semantic tokens → CSS variables.

## Performance
- LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1 at p75 (field data).
- LCP = TTFB + load delay + load time + render delay.
- INP: break long tasks (> 50 ms), less JS, transitions, workers, virtualize.
- CLS: reserve space, no inserts above content, font metrics.
- Split code by route/feature; tree-shake; hashed assets + immutable cache; Brotli; CDN.
- Video: simulcast, adaptive stream, dynacast, pause off-screen tiles, audio levels outside React state.
- Always: measure → change → re-measure → number.

## Web & Security
- 401 who are you · 403 not allowed. GET safe; PUT/DELETE idempotent.
- CORS = server opt-in for browser reads; not API protection.
- XSS → escape, sanitize (DOMPurify), CSP (nonce), Trusted Types, httpOnly.
- CSRF → SameSite, tokens, Origin check, no GET mutations.
- IDOR → server-side authorization on every request by user + tenant + ownership.
- JWT signed not encrypted; validate alg/exp/iss/aud; short-lived + rotating refresh.
- OAuth for SPAs: Authorization Code + PKCE. OIDC adds ID token.
- PHI: no browser storage, URLs, logs, analytics; scrub Sentry; idle logout; audit access.

## Frontend System Design (RADIO)
- Requirements → Architecture → Data model → Interface → Optimizations.
- Always: state machine for real-time, cursor pagination, reconnect with backoff + resync, numbers, trade-offs, a11y, security, observability.
- Know cold: autocomplete, feed, chat, AI streaming chat, video call UI, multi-tenant dashboard, design system, notifications, file upload, kanban, collaborative editor, video player.

## DSA
- Patterns: hash map · two pointers · sliding window · prefix sum · stack · binary search · BFS/DFS · intervals · heap · topo sort · DP · trie.
- Frontend-flavoured: flatten/unflatten object, list → tree, DOM traversal, pagination window, promise pool, highlight matches.
- Say complexity out loud; dry-run with an example.

## Machine Coding
- Restate → must-haves → component tree + state → happy path → edge cases → a11y → polish.
- Always: loading/empty/error, cleanup, stale request handling, stable keys.
- Practise: autocomplete, infinite scroll, modal, tabs, accordion, OTP, toast, carousel, kanban, wizard, virtual list, undo/redo, transcript sync, call control bar.

## AI-Assisted Development
- Stream via BFF; keys never in browser.
- Structured output + schema validation + retry/human review.
- RAG: chunk → embed → retrieve (tenant-filtered) → generate with citations.
- Prompt injection: data ≠ instructions; output untrusted; least privilege.
- Evals vs human labels; track overrides; cost/latency per feature.

## Behavioral
- STAR(L), "I" for actions, 2 minutes, end with number + learning.
- Story bank: audit · reconnect reliability · self-host LiveKit · testing standards/mentoring · AI pipeline · QA review time · failure · disagreement.
- Never blame; projected numbers stay projected.

## Your 30-second pitch
"I'm a Senior Software Engineer at Arcitech with 4+ years in React and TypeScript. I own frontend architecture for two products: InterpretIQ, a WCAG-compliant medical interpretation PWA with real-time LiveKit video, and BpoBox, a multi-tenant AI QA platform. I led a security and reliability audit across React and FastAPI, built AI call-scoring with LangChain, and set testing standards across the frontend team. I'm looking for a role where I can own [the JD's core problem] at larger scale."
