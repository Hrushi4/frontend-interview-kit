# 14 — Frontend System Design

For 4+ years of experience, this round often decides your level. Use a fixed framework so you never freeze, give numbers, and name your trade-offs.

**How this file is organised**

- **Part A — Understand the topic:** what a frontend system design round is, what interviewers grade, and the RADIO framework, explained step by step.
- **Part B — Concept questions:** Basic → Intermediate → Advanced.
- **Part C — 12 worked designs:** a complete example answer for each.
- **Part D — Rapid-fire designs and From Your Resume.**

---

## Part A — Understand the Topic

### What is a frontend system design round?

You get an open-ended prompt like "Design a chat app" or "Design a news feed" and 45–60 minutes. There's no single correct answer. The interviewer wants to see **how you think** as the person who'd own the frontend architecture:

- Do you clarify requirements before jumping in?
- Can you break the app into clear parts (components, state, data layer, real-time)?
- Do you design sensible APIs and data models?
- Do you think about performance, accessibility, security, failures and testing?
- Do you **explain trade-offs** ("I chose X over Y because…")?

### How it differs from backend system design

Backend design focuses on databases, sharding and queues. Frontend design focuses on the **client**:

- component architecture
- state management
- the data-fetching and caching layer
- real-time updates
- rendering strategy
- performance, accessibility, offline behaviour and security in the browser

### The RADIO framework (for a 45–60 minute round)

| Step | Time | What to cover |
|---|---|---|
| **R**equirements | 5–8 min | **Functional:** 3–5 core features. **Non-functional:** number of users, latency targets, devices, offline, accessibility, i18n, security and compliance, SEO. Ask clarifying questions and write down assumptions. |
| **A**rchitecture | 10 min | A box diagram: the client app (shell, routing, state, data layer, real-time channel), CDN, BFF or API gateway, services. The rendering strategy. |
| **D**ata model | 5–8 min | Client entities and the normalised store; server vs client state; cache keys; what lives in the URL. |
| **I**nterface (API) | 5–8 min | Endpoints and events with payloads, pagination (cursor), the real-time protocol, error shapes, auth. |
| **O**ptimisations | 15 min | Performance, network, rendering, accessibility, security, observability, testing, rollout, failure modes. |

**Close** with the trade-offs you chose and rejected, and what you'd do with more time.

### Talking tips

- **Draw** a component tree and, for anything real-time, a state machine.
- **Give numbers:** debounce 250 ms, page size 50, LCP target 2.5 s, reconnect backoff 1 → 2 → 4 → 8 s capped at 30 s.
- **Mention failure modes:** offline, slow network, partial data, permission denied.
- **Think aloud.** Silence is the worst signal in this round.
- **Use your experience:** "In InterpretIQ we handled this by…" is very strong evidence.

### A sample opening (use it for any prompt)

"Before designing, I'd like to clarify requirements. Who are the users and roughly how many? Which devices do they use? What are the must-have features for v1? Are there real-time, offline, accessibility or compliance needs? Then I'll sketch the high-level architecture, define the data model and APIs, and spend most of the time on performance, reliability and trade-offs."

---

## Part B — Concept Questions

Every answer below has four parts: **Short answer** (say this first), **Explanation** (add if asked for more), **Example** (a diagram, code or real situation) and **Say it like this** (a sample spoken answer). The worked designs in Part C use the same four parts.

## 🟢 Level 1 — Basic Concepts

**Q1. CSR vs SSR vs SSG vs ISR: how do you choose?**

**Short answer:** Per route: static or ISR for public, mostly static pages; SSR or streaming for public personalised pages; CSR for authenticated, highly interactive apps.

**Explanation:** The decision depends on SEO needs, freshness and personalisation. Mixing strategies in one app is normal.

**Example:** Marketing pages SSG, product catalogue ISR, logged-in dashboard CSR with an SSR shell.

**Say it like this:** "I don't pick one strategy for the whole app; each route gets the cheapest strategy that meets its freshness and SEO needs."

---

**Q2. SPA vs MPA?**

**Short answer:** A SPA routes on the client with app-like transitions but heavier initial JS; an MPA does full page loads, is simpler and performs better by default.

**Explanation:** Modern MPAs use view transitions and prefetching to feel smooth.

**Example:** A real-time call app is a natural SPA; a documentation site is a natural MPA.

**Say it like this:** "SPAs fit long-lived interactive sessions; MPAs fit content sites, and modern tooling narrows the gap."

---

**Q3. What are the basics of component architecture?**

**Short answer:** Pages → layouts → feature containers → presentational components → design-system primitives, with data fetching at feature boundaries.

**Explanation:** Presentational components stay reusable and testable when they only receive props.

**Example:**

```text
CallsPage → CallsLayout → CallFilters (owns URL state) + CallTable (fetches) → Table, Badge, Avatar
```

**Say it like this:** "Features own data, presentational components own visuals, and primitives come from the design system."

---

**Q4. What is a BFF (Backend for Frontend)?**

**Short answer:** A server layer built for one frontend that aggregates APIs, shapes payloads, holds tokens and handles auth cookies, caching and rate limits.

**Explanation:** It reduces client round trips and keeps secrets off the browser.

**Example:** `GET /bff/dashboard` combines user, calls summary and alerts from three services into one response.

**Say it like this:** "A BFF turns five backend calls into one page-shaped endpoint and keeps OAuth tokens off the browser."

---

**Q5. What pagination types are there?**

**Short answer:** Offset (jump to page N, unstable when data changes), cursor (stable for feeds), and keyset (efficient cursor in the database).

**Explanation:** Cursor pagination doesn't skip or duplicate items when new data arrives.

**Example:** `?page=3&limit=50` vs `?after=c_9f2&limit=50`.

**Say it like this:** "Cursor pagination for feeds and infinite scroll; offset only where users need page numbers."

---

**Q6. What client caching layers are there?**

**Short answer:** The HTTP cache, the service worker cache, the in-memory query cache, a normalised store and browser storage for non-sensitive data.

**Explanation:** Each has different lifetimes and invalidation rules; use the right one per data type.

**Example:** Hashed JS in the HTTP cache, app shell in the service worker, calls in TanStack Query, theme in localStorage.

**Say it like this:** "I layer caches deliberately and never put sensitive data in persistent ones."

---

**Q7. What are the real-time delivery options?**

**Short answer:** Polling, long polling, SSE, WebSocket and WebRTC.

**Explanation:** Choose by direction, frequency, latency and infrastructure.

**Example:** Job status → polling; notifications → SSE; chat → WebSocket; video → WebRTC.

**Say it like this:** "I pick the simplest transport that meets the latency and direction the feature needs."

---

**Q8. What does accessibility as a requirement include?**

**Short answer:** Keyboard support, focus management, semantic structure, ARIA where needed, contrast, reduced motion and announcements for live updates.

**Explanation:** Stating it in requirements ensures it's designed in, not patched later.

**Example:** For a chat design: messages in a list, new messages announced politely, Enter to send, focus stays in the input.

**Say it like this:** "I list accessibility as a non-functional requirement up front, so it shapes the design."

---

**Q9. What does internationalisation involve?**

**Short answer:** Message catalogues, ICU plurals, `Intl` formatting, RTL support, locale in the URL and no concatenated sentences.

**Explanation:** Word order and plural rules differ by language, so strings must be whole messages with placeholders.

**Example:** `"{count, plural, one {# call} other {# calls}}"` instead of `count + ' calls'`.

**Say it like this:** "I design for i18n from day one: full messages, Intl formatting and logical CSS for RTL."

---

**Q10. What are the layers of error handling?**

**Short answer:** Field validation, request retry with backoff, component error boundaries, route error pages, global reporting, and friendly messages with recovery actions.

**Explanation:** Each layer contains failures at the smallest possible scope.

**Example:** A failing chart shows "Couldn't load — Retry" while the rest of the dashboard works, and Sentry gets the details.

**Say it like this:** "Errors are contained close to where they happen, with a recovery path for users and full context for us."

---

## 🟡 Level 2 — Intermediate Concepts

**Q11. How do you design state management?**

**Short answer:** Server state → query cache; URL state → router; forms → form library; local UI → component state; shared client state → store; complex flows → state machine.

**Explanation:** Classifying state first keeps the global store small.

**Example:** For the QA dashboard: calls in TanStack Query, filters in the URL, scorecard in React Hook Form, sidebar open in `useState`.

**Say it like this:** "I classify each piece of state and give it the right home before choosing any library."

---

**Q12. What is normalisation, and why does it matter?**

**Short answer:** Storing entities by ID, with lists holding only IDs, so one update fixes the value everywhere.

**Explanation:** It removes duplicate copies that drift apart.

**Example:**

```ts
{ calls: { byId: { c1: { id: 'c1', score: 82 } }, ids: ['c1'] }, agents: { byId: { a1: { name: 'Asha' } } } }
```

**Say it like this:** "A call's score shown in the list, detail and dashboard comes from one record, so it can't disagree."

---

**Q13. How do optimistic updates work?**

**Short answer:** Apply the change immediately, send the request, reconcile, and roll back with a message on failure.

**Explanation:** Use temporary client IDs for creates and idempotency keys for retries.

**Example:** A sent chat message appears instantly with a "sending" state and turns into "failed — retry" if the request fails.

**Say it like this:** "Optimistic UI hides latency for actions that almost always succeed, with a clear rollback when they don't."

---

**Q14. How do you handle race conditions?**

**Short answer:** Abort stale requests, ignore out-of-order responses, and use versions or ETags for concurrent edits.

**Explanation:** The server returns 409 on a stale version and the UI offers merge or overwrite.

**Example:** Two reviewers edit one scorecard; the second save gets 409 and sees a comparison.

**Say it like this:** "The latest request wins on the client, and versioning protects concurrent edits on the server."

---

**Q15. How do you design offline-first?**

**Short answer:** Cache the shell, store data and drafts in IndexedDB, queue mutations in an outbox, resolve conflicts and show offline state.

**Explanation:** Conflict strategy depends on the data: last-write-wins, server merge or CRDTs.

**Example:** Scorecard drafts save locally while offline and sync with version checks when back online.

**Say it like this:** "Writes go to a local outbox first and sync later, with explicit conflict handling."

---

**Q16. What's a good reconnection strategy for sockets and SSE?**

**Short answer:** Exponential backoff with jitter and a cap, heartbeats, resume from the last event ID, refetch a snapshot, and show connection state.

**Explanation:** The snapshot fills any events missed while disconnected.

**Example:**

```ts
const backoff = (attempt: number) => { const base = Math.min(30_000, 1000 * 2 ** attempt); return base / 2 + Math.random() * (base / 2); };
```

**Say it like this:** "Reconnect with jittered backoff, then resync, so nothing is lost and servers aren't stampeded."

---

**Q17. How do you use feature flags?**

**Short answer:** Ship code dark, enable it per tenant, user or percentage, keep kill switches, and clean up stale flags.

**Explanation:** Evaluate flags at boot or on the server to avoid flicker.

**Example:** The new scorecard editor is enabled for one tenant first, then 25%, then everyone.

**Say it like this:** "Flags separate deploying from releasing, which makes rollouts gradual and reversible."

---

**Q18. What does frontend observability involve?**

**Short answer:** RUM, error tracking with releases and source maps, structured logs, analytics, correlation IDs and dashboards with alerts.

**Explanation:** Correlation IDs connect a frontend error to backend logs.

**Example:** Each request carries `x-request-id`; a Sentry error shows the same ID found in the API logs.

**Say it like this:** "I want to see what users experience, and trace any error from the browser through the backend."

---

**Q19. What testing strategy would you use?**

**Short answer:** Static checks, unit and integration tests with RTL and MSW, contract tests, E2E for critical journeys, visual regression, accessibility automation and performance budgets.

**Explanation:** Most confidence comes from integration tests; E2E covers only critical flows.

**Example:** For the chat design: unit tests for the stream parser, RTL tests for stop and retry, one Playwright E2E for sending a message.

**Say it like this:** "Integration tests carry most of the confidence; E2E guards the journeys that can never break."

---

**Q20. How do you deploy and roll out safely?**

**Short answer:** Immutable hashed assets on a CDN, atomic HTML switch, canary rollouts, a version check prompting reload, a rollback plan, and backward-compatible APIs.

**Explanation:** Old clients may run for hours, so APIs must support both versions during rollout.

**Example:** A banner says "New version available — Reload" when `/version.json` changes.

**Say it like this:** "Deploys are atomic and reversible, and the API stays compatible with clients still running the old version."

---

**Q21. Which security requirements should you always mention?**

**Short answer:** Auth flow and token storage, server-side authorisation, CSP, sanitising rich text and LLM output, rate limits, PII/PHI handling and audit logs.

**Explanation:** Mentioning them shows you design security in, not bolt it on.

**Example:** For the AI chat: BFF holds keys, tenant-filtered retrieval, sanitised markdown, per-tenant quotas.

**Say it like this:** "Every design I present has a security section, even if it's short."

---

## 🔴 Level 3 — Advanced Concepts

**Q22. Micro-frontends: when and how?**

**Short answer:** When several teams need independent deploys on one product; implemented with build-time packages, Module Federation, iframes or Web Components.

**Explanation:** You must solve shared dependencies, design consistency, routing ownership, communication, performance budgets and error isolation.

**Example:** A host shell loads a separately deployed "reports" remote from another team via Module Federation.

**Say it like this:** "Micro-frontends solve an organisational problem; without blocked teams, a modular monolith is simpler and faster."

---

**Q23. How do you build a design system at scale?**

**Short answer:** Tokens → primitives → components → patterns, with semver, Storybook, visual and accessibility tests, codemods and a contribution model.

**Explanation:** Governance and adoption metrics matter as much as the components.

**Example:** `@org/ui` with Changesets releases, Chromatic visual tests and an adoption dashboard per product.

**Say it like this:** "A design system is a product: tokens and primitives, plus versioning, docs and governance."

---

**Q24. How would you architect a monorepo?**

**Short answer:** pnpm workspaces with Turborepo or Nx, apps plus shared packages, affected-only CI and enforced boundaries.

**Explanation:** Atomic cross-package changes and shared configs reduce drift.

**Example:**

```text
apps/interpretiq  apps/bpobox  packages/ui  packages/api-client  packages/config
```

**Say it like this:** "A monorepo lets one PR change the library and both apps, with CI building only what changed."

---

**Q25. How does real-time collaborative editing work?**

**Short answer:** Operational Transformation with a central server, or CRDTs (Yjs, Automerge) that merge without one, plus presence, persistence and permissions.

**Explanation:** CRDTs handle offline edits naturally.

**Example:** Yjs documents synced over a WebSocket provider, with cursors via the awareness protocol.

**Say it like this:** "For new collaborative features I'd use a CRDT like Yjs, which handles concurrency and offline merging."

---

**Q26. How do you render large amounts of data?**

**Short answer:** Aggregate on the server, paginate, virtualise rows and columns, use canvas or WebGL for huge charts, and use workers for computation.

**Explanation:** The browser should only receive and render what's visible.

**Example:** A chart of 1 million points renders server-side aggregates of 2,000 points, drawn on canvas.

**Say it like this:** "Big data is shrunk on the server and virtualised on the client."

---

**Q27. How do you handle multi-tenancy in the frontend?**

**Short answer:** Resolve the tenant, load config and flags, theme with tokens, scope cache keys, isolate on switch and logout, and apply per-tenant limits.

**Explanation:** The server enforces isolation; the client prevents visual leaks.

**Example:** `acme.bpobox.com` → tenant config → CSS variables → `['tenant', 'acme', …]` query keys.

**Say it like this:** "Tenant is part of every key, theme and request, and the server enforces it."

---

**Q28. What's the security architecture for sensitive data (healthcare, fintech)?**

**Short answer:** A BFF with HttpOnly cookies, strict CSP, no sensitive data in storage, URLs or logs, timeouts, audit trails, field-level permissions, encryption and vendor review.

**Explanation:** The browser is treated as untrusted and shared.

**Example:** InterpretIQ: no PHI in storage or analytics, idle logout, signed URLs for recordings.

**Say it like this:** "Sensitive data stays on the server as much as possible, and what reaches the browser leaves no trace."

---

**Q29. How do you scale the frontend organisation?**

**Short answer:** CODEOWNERS, ADRs, shared standards, golden-path templates, a platform team, and performance and accessibility budgets.

**Explanation:** Consistency comes from tooling and templates rather than meetings.

**Example:** A `create-feature` generator scaffolds a feature folder with tests and Storybook stories.

**Say it like this:** "I scale teams by making the right way the default way, through templates and automated checks."

---

**Q30. How can edge computing help the frontend?**

**Short answer:** Edge middleware for redirects, geolocation and A/B tests, edge-cached HTML and personalisation via cache keys.

**Explanation:** It lowers latency but has runtime limitations.

**Example:** Edge middleware routes users to the nearest LiveKit region based on geolocation.

**Say it like this:** "The edge is great for small, latency-sensitive decisions close to the user."

---

## Part C — 12 Worked Designs

**How to use these:** practise each one out loud in 20–30 minutes, following RADIO. The **Short answer** is your 30-second summary; the **Explanation** walks through Requirements, Architecture, Data, Interface and Optimisations; the **Example** shows a diagram or code; **Say it like this** is your closing statement.

### Design 1 — Autocomplete / Typeahead

**Short answer:** A debounced input with an LRU cache, aborted stale requests, a ranked suggestions API, and the ARIA combobox pattern.

**Explanation:**

- **Requirements:** suggestions as you type, keyboard navigation, highlighted matches, recent searches, under 100 ms perceived response, mobile-friendly.
- **Architecture:** input → `useDebounce(250ms)` → cache lookup → fetch with AbortController → suggestion list.
- **Data:** `{ query, results, status, activeIndex }` plus a size-capped `Map` cache.
- **API:** `GET /search/suggest?q=…&limit=8` → `[{ id, label, type }]`.
- **Optimisations:** minimum 2 characters, abort stale requests, cache prefixes, prefetch popular queries, server-ranked results.
- **Accessibility:** `role="combobox"`, `aria-expanded`, `aria-activedescendant`, listbox/option roles, Escape to close, result-count announcement.
- **Edge cases:** IME composition, empty and error states, fast typists, offline.

**Example:**

```text
<SearchInput> → useDebounce(250ms) → LRU cache → fetch (AbortController) → <SuggestionList role="listbox">
```

**Say it like this:** "Debounce plus abort plus cache means few requests, no stale results and instant repeat queries, with the WAI-ARIA combobox pattern for accessibility."

---

### Design 2 — Infinite-Scroll News Feed

**Short answer:** Cursor-paginated infinite query, an IntersectionObserver sentinel, a virtualised list with dynamic heights, and a "new posts" banner.

**Explanation:**

- **Requirements:** posts with images, likes and comments, a new-posts indicator, smooth scrolling through thousands of items.
- **Architecture:** `useInfiniteQuery` + sentinel + virtualised list; lazy-loaded media.
- **Data:** normalised posts and users; the feed holds IDs.
- **API:** `GET /feed?cursor=…&limit=20` → `{ items, nextCursor }`; `POST /posts/:id/like`.
- **Optimisations:** optimistic likes, banner instead of inserting at the top (no CLS), aspect-ratio placeholders, scroll restoration, early prefetch of the next page.
- **Failure modes:** duplicates across pages (dedupe by ID), deleted posts, offline.

**Example:**

```ts
const q = useInfiniteQuery({ queryKey: ['feed'], queryFn: ({ pageParam }) => getFeed(pageParam), getNextPageParam: (p) => p.nextCursor });
```

**Say it like this:** "Cursor pagination keeps the feed stable while new posts arrive, virtualisation keeps the DOM small, and the banner avoids pushing content while people read."

---

### Design 3 — Chat Application (WhatsApp or Slack Web)

**Short answer:** A shared WebSocket manager, REST for history, IndexedDB for offline cache and outbox, client IDs for optimistic sends, and resync by sequence after reconnect.

**Explanation:**

- **Requirements:** 1:1 and group chats, real-time delivery, typing indicators, read receipts, history, attachments, offline sending.
- **Architecture:** one WebSocket per user (leader tab), REST history, IndexedDB.
- **Data:** `Message { clientId, id?, convId, senderId, body, status, createdAt }`.
- **API/events:** `message.send` → ack `{ clientId, id }`; `message.new`, `typing`, `receipt`; `GET /conversations/:id/messages?before=cursor`.
- **Optimisations:** optimistic sends, reverse virtualised list, batched receipts, throttled typing events, ordering by server sequence.
- **Security:** sanitised rich text, attachment scanning, per-conversation authorisation.

**Example:**

```ts
type Message = { clientId: string; id?: string; convId: string; body: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'; createdAt: string };
```

**Say it like this:** "Every message gets a client ID, so it appears instantly and retries never duplicate it; after reconnecting we fetch everything since the last sequence number."

---

### Design 4 — AI Chat with Streaming Responses (← Your SSE Compliance Chat)

**Short answer:** Client → BFF (auth, rate limits, keys, audit) → tenant-filtered retrieval → LLM, streamed back over SSE, with frame-buffered rendering, stop and safe markdown.

**Explanation:**

- **Requirements:** streaming, stop and regenerate, history, citations, markdown, feedback, tenant- and role-aware, no data leakage.
- **Architecture:** BFF holds the LLM key; retrieval filters by tenant in the query.
- **Data:** `Message { id, role, content, status, citations: { callId, ts }[] }`.
- **API:** `POST /conversations/:id/messages` → `text/event-stream` with `token`, `citation`, `done`, `error` events.
- **Client:** token buffer flushed per frame, AbortController for Stop, auto-scroll only near the bottom, sanitised markdown, one `aria-live` announcement on completion.
- **Quality:** time to first token, tokens per second, error rate, prompt-injection awareness, per-tenant quotas.

**Example:**

```text
Client ──POST──► BFF (auth, rate limit, key, audit) ──► Retrieval (tenant-filtered) ──► LLM
   ◄────────────── SSE tokens ◄──────────────────────────────────────────────────────┘
```

**Say it like this:** "Security lives at the BFF and the retrieval layer; on the client it's about a smooth, cancellable, safely rendered stream."

---

### Design 5 — Video Consultation and Interpretation UI (← InterpretIQ)

**Short answer:** A PWA with a pre-join device check, server-issued role-scoped LiveKit tokens, an explicit call state machine, adaptive streaming, resume-first reconnects, and strict PHI and accessibility rules.

**Explanation:**

- **Requirements:** patient, provider and interpreter; waiting room; mute, camera, screen share; graceful reconnects; captions; hospital Wi-Fi and tablets; WCAG AA; no PHI leakage.
- **Architecture:** PWA shell → auth → pre-join → token API → LiveKit SFU over WebRTC, WSS signalling, TURN/TLS fallback, lazy SDK.
- **Data:** participants by identity with role, tracks and connection quality; non-sensitive device preferences.
- **Optimisations:** token prefetch, preconnect, adaptive stream and dynacast, paused off-screen video, active-speaker layout, audio-only fallback, speaking indicators outside React state.
- **Reliability:** non-blocking reconnect banner, backoff rejoin with fresh token, telemetry for join time and reconnect success.
- **Security and accessibility:** opaque room names, short token TTL, consent UI, no PHI in telemetry, `aria-pressed` controls, live announcements, captions, focus management.

**Example:**

```text
idle → checkingDevices → (denied) permissionError
checkingDevices → (ok) connecting → connected
connected → (network drop) reconnecting → connected | failed
connected → (leave/end) ended
```

**Say it like this:** "The call is an explicit state machine, performance comes from adaptive streaming, reliability from resume-first reconnects, and PHI never touches storage or telemetry."

---

### Design 6 — Multi-Tenant Analytics and QA Dashboard (← BpoBox)

**Short answer:** Tenant resolution at boot, a role-based route tree, feature modules over a tenant-scoped query layer, URL filters, and reviewer-focused optimisations.

**Explanation:**

- **Requirements:** tenant branding, admin/QA/agent roles, filterable call list, call detail with audio, transcript, AI scores and scorecard, charts, export.
- **Architecture:** tenant config, theme and flags at boot → role-based routes → feature modules (calls, scoring, reports, admin).
- **Data:** normalised calls, agents and scorecards; filters in the URL; local scorecard drafts.
- **API:** `GET /tenants/:t/calls?cursor&filters`, `GET /calls/:id`, `POST /calls/:id/scorecards`, `GET /reports/agent-performance`.
- **Optimisations:** server-side filtering, virtualised tables, lazy charts, prefetch on hover, keyboard-first review, background export jobs.
- **Security:** server-side RBAC and tenant isolation, audited recording access, signed audio URLs.

**Example:**

```text
login → tenant config (theme, flags) → routes for role → CallList (URL filters) → CallDetail (audio + transcript + AI evidence)
```

**Say it like this:** "Reviewer time is the key metric, so AI evidence timestamps, shortcuts and prefetching drive the design, on top of strict tenant isolation."

---

### Design 7 — Component Library / Design System (← Shared Component Library)

**Short answer:** CSS-variable tokens, Radix-based primitives, composed components and patterns, published as tree-shakable ESM with Storybook, tests and semver releases.

**Explanation:**

- **Requirements:** consistent UI across two products, per-product and per-tenant theming, accessibility, easy adoption, safe upgrades.
- **Architecture:** tokens → primitives → components → patterns; per-component entry points; Changesets.
- **Quality:** visual regression, axe and interaction tests, bundle-size checks, do and don't docs.
- **Governance:** RFCs for new components, deprecation policy, codemods, adoption dashboard.

**Example:**

```ts
import { Button } from '@org/ui/button';   // per-component entry point, tree-shakable
```

**Say it like this:** "Tokens make it themeable, Radix makes it accessible, visual regression makes it safe to change, and governance makes people adopt it."

---

### Design 8 — Real-Time Notification System

**Short answer:** One SSE or WebSocket connection per user shared across tabs, server-stored notifications with read state, toasts plus an inbox, and resync on reconnect.

**Explanation:**

- Leader election (BroadcastChannel) or a SharedWorker keeps one connection per user.
- Urgent items show as toasts; others go to the inbox with an unread badge.
- Deduplicate by ID; resync with `GET /notifications?since=cursor` after reconnecting.
- Push notifications via a service worker contain no sensitive content.

**Example:**

```ts
channel.onmessage = (e) => { if (e.data.type === 'notification') addNotification(e.data.payload); };
```

**Say it like this:** "One connection per user, shared across tabs, with server-side state so nothing is lost while offline."

---

### Design 9 — Large File Upload (Call Recordings, Documents)

**Short answer:** Validated, chunked multipart uploads to pre-signed URLs with limited concurrency, per-chunk retries, resumability and progress.

**Explanation:**

- Validate type and size before starting.
- Upload ~8 MB chunks, 3–4 at a time, retrying failed chunks.
- Resume using the list of already-uploaded parts.
- Pause and cancel with AbortController, checksum validation, and server completion; processing status via SSE.

**Example:**

```ts
await runWithLimit(chunks.map((c, i) => () => retry(() => put(signedUrls[i], c))), 4);
await api('/uploads/complete', { method: 'POST', body: JSON.stringify({ uploadId, parts }) });
```

**Say it like this:** "Chunked, parallel and resumable uploads mean a dropped connection only costs one chunk, not the whole file."

---

### Design 10 — Kanban Board (Jira- or Trello-Like)

**Short answer:** Normalised columns and cards, accessible drag and drop, fractional indexing for order, optimistic moves and versioned real-time merges.

**Explanation:**

- dnd-kit provides keyboard-accessible drag and drop.
- Fractional ranks ("a" < "an" < "b") avoid renumbering every card.
- Moves are optimistic with rollback; other users' changes merge by version.
- Filters live in the URL; long columns are virtualised.

**Example:**

```ts
const newRank = between(prev?.rank, next?.rank); // e.g. between('a', 'b') → 'an'
```

**Say it like this:** "Fractional ranks make reordering a single-card update, which keeps moves cheap and conflict-free."

---

### Design 11 — Collaborative Document Editor (Google Docs-Like)

**Short answer:** A rich-text engine on a CRDT (Yjs) synced over WebSocket, with presence, offline merging, snapshots, anchored comments, permissions and history.

**Explanation:**

- ProseMirror, Lexical or Slate as the editor.
- Yjs merges concurrent and offline edits without conflicts.
- Snapshots plus incremental updates are persisted.
- Comments anchor to positions that survive edits; view/comment/edit permissions are checked server-side.

**Example:**

```ts
const doc = new Y.Doc();
const provider = new WebsocketProvider(url, docId, doc);
const yText = doc.getText('content');
```

**Say it like this:** "A CRDT handles the hard part, concurrent edits, so I focus on presence, permissions and persistence."

---

### Design 12 — Video Streaming Player (YouTube-Like)

**Short answer:** Adaptive bitrate streaming (HLS/DASH via MSE), buffer management, quality selection, captions, keyboard shortcuts and playback analytics.

**Explanation:**

- hls.js or Shaka handles adaptive bitrate through Media Source Extensions.
- Thumbnail sprites power scrubbing previews.
- WebVTT captions, keyboard shortcuts, picture-in-picture.
- Analytics: startup time and rebuffer ratio; DRM via EME when needed.

**Example:**

```ts
const hls = new Hls();
hls.loadSource('/video/master.m3u8');
hls.attachMedia(videoEl);
```

**Say it like this:** "Adaptive streaming keeps playback smooth across networks, and I'd measure startup time and rebuffering as the key metrics."

---

## Part D — Rapid-Fire Designs and From Your Resume

## 🧩 Rapid-Fire Design Questions (Practise 5-Minute Answers)

**Q31. Design an image carousel.**

**Short answer:** Accessible prev/next and dot buttons, lazy-loaded neighbours, swipe via scroll-snap, autoplay that pauses on hover and focus with a pause button.

**Explanation:** WCAG requires a way to pause moving content; `aria-roledescription="carousel"` and "3 of 8" labels orient screen-reader users.

**Example:**

```css
.track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
.slide { flex: 0 0 100%; scroll-snap-align: center; }
```

**Say it like this:** "Scroll snap for native swiping, real buttons for controls, and autoplay that users can always pause."

---

**Q32. Design a poll widget that can be embedded on other sites.**

**Short answer:** An iframe or Web Component with Shadow DOM, `postMessage` for resizing, vote rate limiting and results via SSE.

**Explanation:** Isolation protects both the host page and the widget; rate limits stop vote stuffing.

**Example:** `<script src="https://polls.app/embed.js" data-poll="p_42"></script>` mounts a Shadow DOM widget.

**Say it like this:** "Isolation first, so the widget can't break host pages or be broken by them."

---

**Q33. Design a form builder.**

**Short answer:** A JSON schema rendered through a field registry, with Zod validation generated from the schema, conditional logic, versioned schemas and a live preview.

**Explanation:** Versioning ensures old submissions still render with the schema they were created with.

**Example:**

```ts
const registry = { text: TextField, number: NumberField, select: SelectField };
schema.fields.map((f) => createElement(registry[f.type], { key: f.id, field: f }));
```

**Say it like this:** "The schema drives rendering and validation, which is exactly how configurable scorecards worked in BpoBox."

---

**Q34. Design a spreadsheet.**

**Short answer:** A virtualised grid, a dependency graph recalculated in topological order, computation in a worker, copy/paste and undo/redo.

**Explanation:** Only dependents of a changed cell are recalculated; cycles show `#CYCLE`.

**Example:** Changing A1 recalculates B1 (`=A1*2`) and C1 (`=B1+1`) in that order.

**Say it like this:** "A dependency graph keeps recalculation minimal, and virtualisation keeps rendering fast."

---

**Q35. Design an e-commerce product page.**

**Short answer:** SSR or ISR for SEO, optimised gallery images, variant selection in the URL, optimistic cart updates and fresh inventory on the client.

**Explanation:** Static parts cache well; price and stock must be fresh.

**Example:** `/products/shoe?color=red&size=9` renders statically, with stock fetched client-side.

**Say it like this:** "Cache what's static for SEO and speed, fetch what changes, and keep variant state shareable in the URL."

---

**Q36. Design a calendar.**

**Short answer:** Month, week and day views, time-zone-aware rendering, recurring events with RRULE, drag to reschedule, and an overlap layout algorithm.

**Explanation:** Overlapping events are grouped and split into columns.

**Example:** Three overlapping meetings each get one third of the day column's width.

**Say it like this:** "Time zones and overlaps are the hard parts, so I store UTC with RRULEs and lay out overlaps in columns."

---

**Q37. Design a dashboard with 20 widgets.**

**Short answer:** Independent data fetching and error boundaries per widget, lazy-loading below the fold, shared filters in the URL, and saved layouts.

**Explanation:** One slow or failing widget never blocks the others.

**Example:** Each widget is `<Suspense><ErrorBoundary><Widget /></ErrorBoundary></Suspense>` with its own query.

**Say it like this:** "Every widget loads and fails independently, so the dashboard degrades gracefully."

---

## 🎯 From Your Resume

**Q38. "Design InterpretIQ from scratch."**

**Short answer:** Use Design 5, adding scheduling and interpreter matching, language selection, a waiting room with estimated wait, a post-call summary and admin monitoring.

**Explanation:** Highlight decisions you made in reality (Redux for session state, LiveKit, PWA) and one improvement, such as XState for the call lifecycle or a BFF for tokens.

**Example:**

```text
Request (language, urgency) → match interpreter → waiting room → pre-join → call → summary → admin live monitor
```

**Say it like this:** "I'll design it the way we built it and point out what I'd change, like formalising the call lifecycle and moving tokens behind a BFF."

---

**Q39. "Design the self-hosted LiveKit infrastructure."**

**Short answer:** SFU nodes on EC2 with host networking and a UDP range, Redis routing, a load balancer for WSS, TURN/TLS on 443, autoscaling, Prometheus and Grafana, Dockerised CI deploys draining rooms.

**Explanation:** Compare the cost model to the managed service and state that 40% savings and 10x scale were projections to validate with load tests.

**Example:**

```text
Clients ─WSS─► LB ─► SFU nodes (EC2, UDP 50000-60000) ◄─► Redis (room routing)
       └─TURN/TLS 443─► TURN servers          Prometheus → Grafana alerts
```

**Say it like this:** "Horizontally scalable SFUs with Redis routing, TURN for hospital networks, and monitoring from day one; the savings and scale figures are projections I'd prove with load tests."

---

**Q40. "Design the AI call-scoring pipeline and its UI."**

**Short answer:** Twilio webhook → queue → Celery transcription and chunking → LLM scoring with a rubric and structured output → validation → persistence with evidence timestamps → UI notification → reviewer UI with evidence and overrides.

**Explanation:** Track throughput, latency, cost per call and agreement with human QA; overrides feed prompt improvements.

**Example:**

```text
Twilio → webhook → queue → transcribe → chunk → LLM (rubric, JSON) → Zod/Pydantic validate → DB → SSE → reviewer UI
```

**Say it like this:** "A deterministic pipeline with validated structured output, where every AI finding links to evidence a reviewer can check and override."

---

**Q41. "How would you evolve BpoBox and InterpretIQ to share a component library?"**

**Short answer:** Use Design 7 in a monorepo (or versioned package), with a token set per product, migrating the most duplicated components first, protected by visual regression tests.

**Explanation:** Incremental migration avoids a risky rewrite and shows value early.

**Example:** Migrate Button, Dialog and Table first, then forms; each step behind visual regression checks in both apps.

**Say it like this:** "Start with the components duplicated most, share tokens per product, and let visual tests guarantee neither app breaks."
