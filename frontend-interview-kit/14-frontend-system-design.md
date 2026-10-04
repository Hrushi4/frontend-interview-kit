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

## 🟢 Level 1 — Basic Concepts

**Q1. CSR vs SSR vs SSG vs ISR: how do you choose?**

**Short answer:** Choose per route:

- Public, SEO-critical, mostly static pages → SSG or ISR.
- Public but personalised or fresh pages → SSR or streaming.
- Authenticated, highly interactive apps → CSR or a SPA, possibly with an SSR shell.

**Say it like this:** "I don't pick one strategy for the whole app. Marketing pages are static, the product catalogue uses ISR, and the logged-in dashboard is client-rendered with a server-rendered shell."

---

**Q2. SPA vs MPA?**

**Short answer:** A **SPA** routes on the client, so transitions feel app-like, but the initial JavaScript is heavier. An **MPA** does full page loads; it's simpler and performs better by default. Modern MPAs use view transitions and prefetching to feel smooth.

---

**Q3. What are the basics of component architecture?**

**Short answer:** Pages → layouts → feature containers → presentational components → design-system primitives. Keep data fetching at feature boundaries, so presentational components stay reusable and testable.

```text
CallsPage (route)
 └─ CallsLayout
     ├─ CallFilters (feature: owns filter state → URL)
     └─ CallTable (feature: fetches data)
          └─ Table, Badge, Avatar (design-system primitives)
```

---

**Q4. What is a BFF (Backend for Frontend)?**

**Short answer:** A server layer built specifically for one frontend. It aggregates several APIs into the shape the UI needs, holds tokens securely (the browser only gets a cookie), and handles auth cookies, caching and rate limits.

**Say it like this:** "A BFF turns five backend calls into one endpoint shaped for the page, and it keeps OAuth tokens off the browser, which matters a lot for healthcare."

---

**Q5. What pagination types are there?**

**Short answer:**

- **Offset** (`?page=3&limit=50`): simple, and you can jump to page N, but it's unstable when data changes (items shift between pages).
- **Cursor** (`?after=abc&limit=50`): stable for feeds and infinite scroll, but you can't jump to a page.
- **Keyset:** the database-efficient form of cursor pagination (`WHERE id < last_id`).

---

**Q6. What client caching layers are there?**

**Short answer:** The HTTP cache (`Cache-Control`, `ETag`), the service worker cache, the in-memory query cache (TanStack or RTK Query), a normalised entity store, and browser storage for non-sensitive data.

---

**Q7. What are the real-time delivery options?**

**Short answer:** Polling (simple but wasteful), long polling, SSE, WebSocket and WebRTC. Choose by direction (one-way or two-way), frequency, latency needs and infrastructure.

---

**Q8. What does accessibility as a requirement include?**

**Short answer:** Keyboard support, focus management, semantic structure, ARIA where needed, colour contrast, reduced motion, and screen-reader announcements for live updates.

---

**Q9. What does internationalisation involve?**

**Short answer:** Message catalogues, ICU plurals, date and number formatting with `Intl`, RTL support with logical CSS, the locale in the URL, and never building sentences by concatenating strings.

---

**Q10. What are the layers of error handling?**

**Short answer:** Field-level validation, request-level retry with backoff, component error boundaries, route-level error pages, global error reporting, and friendly messages with a recovery action ("Retry", "Go back").

---

## 🟡 Level 2 — Intermediate Concepts

**Q11. How do you design state management?**

**Short answer:**

- Server state → a query cache.
- URL state → the router.
- Form state → a form library.
- Local UI state → component state.
- Shared client state → a store.
- Complex flows → a state machine.

---

**Q12. What is normalisation, and why does it matter?**

**Short answer:** Store entities by ID, and have lists hold only IDs. A single update then fixes the value everywhere. For example, a call's score shown in the list, the detail panel and the dashboard updates in one place.

```ts
{ calls: { byId: { c1: { id: 'c1', score: 82 } }, ids: ['c1'] },
  agents: { byId: { a1: { id: 'a1', name: 'Asha' } } } }
```

---

**Q13. How do optimistic updates work?**

**Short answer:** Apply the change immediately, send the request, reconcile with the response, and roll back with a toast if it fails. For creates, use client-generated temporary IDs, and use idempotency keys to avoid duplicates on retry.

---

**Q14. How do you handle race conditions?**

**Short answer:**

- Abort stale requests.
- Ignore out-of-order responses by tagging requests with an ID.
- For concurrent edits, use version numbers or ETags. The server returns 409 Conflict on a stale version, and the UI shows a merge or overwrite choice.

---

**Q15. How do you design offline-first?**

**Short answer:**

- Cache the app shell with a service worker.
- Store data and drafts in IndexedDB.
- Queue mutations in an **outbox** and retry them when back online.
- Resolve conflicts: last-write-wins, a server-side merge, or CRDTs.
- Show the offline state clearly in the UI.

---

**Q16. What's a good reconnection strategy for sockets and SSE?**

**Short answer:**

- Exponential backoff with jitter, capped (1 s, 2 s, 4 s, 8 s… up to 30 s).
- A heartbeat or ping to detect dead connections.
- Resume from the last event ID or cursor.
- Refetch a snapshot after reconnecting, to fill any gap.
- Show the connection state to the user.

```ts
function backoff(attempt: number) {
  const base = Math.min(30_000, 1000 * 2 ** attempt);
  return base / 2 + Math.random() * (base / 2);   // jitter
}
```

---

**Q17. How do you use feature flags?**

**Short answer:** Ship code "dark" and enable it per tenant, per user or for a percentage of users. Keep kill switches for risky features, and clean up stale flags. Evaluate flags at boot, and on the server for SSR, to avoid flicker.

---

**Q18. What does frontend observability involve?**

**Short answer:**

- RUM: Web Vitals and custom timings.
- Error tracking (Sentry) with release tags and source maps.
- Structured logs for key actions, and analytics events.
- Correlation IDs passed to the backend, so a frontend error can be traced through the backend logs.
- Dashboards and alerts.

---

**Q19. What testing strategy would you use?**

**Short answer:**

- Static checks (TypeScript, ESLint).
- Unit and integration tests (RTL + MSW).
- Contract tests against the API schemas.
- E2E tests (Playwright) for critical journeys.
- Visual regression for the design system.
- Accessibility automation.
- Performance budgets in CI.

---

**Q20. How do you deploy and roll out safely?**

**Short answer:**

- Immutable, hashed assets on a CDN, with an atomic switch of the HTML.
- Canary or percentage rollouts.
- A version check that prompts users to reload.
- A rollback plan.
- Backwards-compatible API changes during the rollout window.

---

**Q21. Which security requirements should you always mention?**

**Short answer:**

- The auth flow and token storage.
- Server-side authorisation.
- CSP.
- Sanitising rich text and LLM output.
- Rate limits.
- PII and PHI handling.
- Audit logs.

---

## 🔴 Level 3 — Advanced Concepts

**Q22. Micro-frontends: when and how?**

**Short answer:** When several teams need **independent deploys** on one product surface. The approaches:

- Build-time packages: the simplest, but deploys are coupled.
- Runtime Module Federation.
- iframes: strong isolation, but a UX cost.
- Web Components.

**What you must solve:** shared dependencies (a single React instance), design consistency, routing ownership, cross-app communication (events or the URL), a performance budget per remote, and error isolation.

**Say it like this:** "Micro-frontends solve an organisational problem, not a technical one. If we don't have several teams blocked on each other's deploys, a well-structured modular monolith is simpler and faster."

---

**Q23. How do you build a design system at scale?**

**Short answer:**

- Tokens (Figma variables → code), then primitives, components and patterns.
- Semantic versioning with Changesets, and Storybook docs.
- Visual regression and accessibility tests.
- Codemods for breaking changes.
- Adoption metrics, a contribution model, and multi-brand theming through token sets.

---

**Q24. How would you architect a monorepo?**

**Short answer:** pnpm workspaces with Turborepo or Nx. Apps and shared packages (ui, utils, api-client, config), affected-only CI, enforced module boundaries, and shared tsconfig and ESLint configs.

---

**Q25. How does real-time collaborative editing work?**

**Short answer:** Two approaches:

- **OT** (Operational Transformation): a central server transforms concurrent operations. This is Google Docs' approach.
- **CRDTs** (Yjs, Automerge): data structures that merge without a central transformer. Good for offline and peer-to-peer.

You also need presence (cursors), persistence (snapshots plus updates) and per-document permission checks.

---

**Q26. How do you render large amounts of data?**

**Short answer:** Aggregate on the server, paginate, virtualise rows *and* columns, use canvas or WebGL for huge charts, move computation to Web Workers, and render incrementally.

---

**Q27. How do you handle multi-tenancy in the frontend?**

**Short answer:**

- Resolve the tenant (from the subdomain, path or a token claim).
- Load tenant config and feature flags.
- Theme with tokens.
- Use tenant-scoped cache keys.
- Isolate data on logout and tenant switch.
- Apply per-tenant rate limits and analytics.

---

**Q28. What's the security architecture for sensitive data (healthcare, fintech)?**

**Short answer:**

- A BFF holding the tokens, with HttpOnly cookies.
- A strict CSP.
- No sensitive data in browser storage, URLs or logs.
- Session timeouts and audit trails.
- Field-level permissions.
- Encryption at rest and in transit.
- Vendor review for third-party scripts.

---

**Q29. How do you scale the frontend organisation?**

**Short answer:** Clear ownership (CODEOWNERS), architecture decision records (ADRs), shared lint and test standards, golden-path templates for new features, a platform team for tooling, and performance and accessibility budgets.

---

**Q30. How can edge computing help the frontend?**

**Short answer:** Edge middleware handles auth redirects, geolocation and A/B tests; HTML can be cached at the edge; and personalisation can use cache keys. You trade lower latency for runtime limitations.

---

## Part C — 12 Worked Designs

**How to use these:** practise each one out loud in 20–30 minutes, following RADIO. Each design ends with a "Say it like this" summary you can use as a closing statement.

### Design 1 — Autocomplete / Typeahead

**Requirements:** suggestions as the user types, keyboard navigation, highlighted matches, recent searches, under 100 ms perceived response, mobile-friendly.

**Architecture:**

```text
<SearchInput> → useDebounce(250ms) → LRU cache lookup → fetch (AbortController) → <SuggestionList>
```

**Data model:** `{ query, results: Suggestion[], status, activeIndex }`, plus a cache `Map<string, Suggestion[]>` with a size cap.

**API:** `GET /search/suggest?q=…&limit=8` → `[{ id, label, type }]`

**Optimisations:**

- Search only after 2 characters.
- Cancel stale requests and ignore out-of-order responses.
- Cache prefixes, and prefetch popular queries.
- The server returns the top N already ranked.

**Accessibility (the combobox pattern):** `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `listbox`/`option` roles, Escape to close, and an announcement of the result count ("5 suggestions available").

**Edge cases:** IME composition for Chinese and Japanese input (`compositionstart`/`compositionend`), empty and error states, very fast typists, offline.

**Say it like this:** "The core is debounce plus abort plus cache, so we send few requests, never show stale results, and repeat queries are instant. Accessibility follows the WAI-ARIA combobox pattern, and I'd measure the time from keystroke to suggestions in RUM."

---

### Design 2 — Infinite-Scroll News Feed

**Requirements:** a feed of posts with images, likes and comments, a "new posts" indicator, and smooth scrolling through thousands of items.

**Architecture:** cursor-paginated `useInfiniteQuery`, an IntersectionObserver sentinel near the bottom, a virtualised list with dynamic heights, and lazily loaded media in post cards.

**Data model:** normalised posts and users; the feed holds only IDs.

**API:** `GET /feed?cursor=…&limit=20` → `{ items, nextCursor }`, and `POST /posts/:id/like`.

**Optimisations:**

- Optimistic likes.
- A "N new posts" banner instead of inserting at the top, which would cause layout shift.
- Image placeholders with `aspect-ratio`.
- Scroll restoration on back navigation.
- Prefetching the next page early.

**Failure modes:** duplicate items across pages (deduplicate by ID), deleted posts, offline.

**Say it like this:** "Cursor pagination keeps the feed stable while new posts arrive, virtualisation keeps the DOM small, and the new-posts banner avoids pushing content while people read."

---

### Design 3 — Chat Application (WhatsApp or Slack Web)

**Requirements:** one-to-one and group chats, real-time delivery, typing indicators, read receipts, history, attachments, and sending while offline.

**Architecture:** a WebSocket connection manager (a singleton shared across tabs through leader election), REST for history, and IndexedDB for the offline cache and the outbox.

**Data model:**

```ts
type Conversation = { id: string; members: string[]; lastMessage?: Message; unread: number };
type Message = {
  id?: string; clientId: string; convId: string; senderId: string; body: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'; createdAt: string;
};
```

**API and events:**

- Client sends `message.send { clientId, … }`, and the server acks with `{ clientId, id, createdAt }`.
- The server pushes `message.new`, `typing` and `receipt` events.
- History: `GET /conversations/:id/messages?before=cursor`.

**Optimisations:**

- Optimistic sending using the `clientId`.
- A reverse virtualised list.
- Batched read receipts, and throttled typing events.
- On reconnect, fetch everything missed since the last message ID.
- Order messages by the server's sequence number.

**Security:** sanitise rich text, scan attachments, and authorise per conversation.

**Say it like this:** "Every message gets a client ID, so it appears instantly and the server ack just confirms it, and retries never duplicate it. After a reconnect we fetch everything since the last sequence number, so nothing is lost."

---

### Design 4 — AI Chat with Streaming Responses (← Your SSE Compliance Chat)

**Requirements:** streaming answers, stop and regenerate, conversation history, citations back to source calls and transcripts, markdown and code rendering, feedback buttons, tenant- and role-aware, no sensitive data leakage.

**Architecture:**

```text
Client ──POST──► BFF (auth, rate limit, holds LLM key, audit log)
                  └─► Retrieval service (RAG over THIS tenant's data only)
                        └─► LLM ──tokens──► BFF ──SSE──► Client
```

**Data model:** `Conversation { id, title, messages[] }` and `Message { id, role, content, status: 'streaming' | 'done' | 'error' | 'stopped', citations: { callId, ts }[] }`.

**API:** `POST /conversations/:id/messages` returns a `text/event-stream` with `token`, `citation`, `done` and `error` events.

**Client details:**

- A token buffer flushed once per animation frame.
- An AbortController for Stop.
- Regenerate resends the same prompt.
- Auto-scroll only when the user is near the bottom.
- Sanitised markdown.
- A single `aria-live` announcement when the answer completes.

**Quality and metrics:** time to first token, tokens per second, error rate. Awareness of prompt injection: retrieved content is *data*, not instructions. Per-tenant quotas.

**Say it like this:** "Security sits at the BFF and the retrieval layer: tenant filtering happens before anything reaches the model, never through prompt instructions. On the client, the key is a smooth stream (buffered per frame), reliable cancellation and safe rendering."

---

### Design 5 — Video Consultation and Interpretation UI (← InterpretIQ)

**Requirements:** a patient, a provider and an interpreter join a room. A waiting room, mute, camera and screen share, graceful reconnection, captions. It must work on hospital Wi-Fi and tablets, meet WCAG AA, and never leak PHI.

**Architecture:**

```text
PWA shell → auth → pre-join (device check, permissions, network test)
   → API issues short-lived room token (role-scoped grants)
   → LiveKit SFU over WebRTC (signalling over WSS, TURN/TLS on 443 fallback)
   SDK lazy-loaded on the pre-join screen
```

**State machine:**

```text
idle → checkingDevices → (denied) permissionError
checkingDevices → (ok) connecting → connected
connected → (network drop) reconnecting → connected | failed
connected → (leave/end) ended
```

**Data model:** participants keyed by identity, with their role, track publications and connection quality. Device preferences (non-sensitive) are persisted.

**Optimisations:**

- Prefetch the token on page load, and preconnect to the media hosts.
- Adaptive stream, simulcast and dynacast.
- Pause video for off-screen tiles, and use an active-speaker layout.
- Fall back to audio-only when quality is poor.
- Update speaking indicators outside React state.

**Reliability:**

- A non-blocking reconnect banner.
- Rejoin with backoff and a fresh token.
- A heartbeat.
- Telemetry for join time, reconnect count and success, and call drops.

**Security and compliance:** opaque room names, a short token lifetime, a recording-consent UI, no PHI in logs or analytics, and a session timeout.

**Accessibility:** labelled toggle buttons with `aria-pressed`, keyboard shortcuts, live-region announcements, captions, and focus management on join and leave.

**Say it like this:** "I'd model the call as an explicit state machine, so every screen handles reconnecting and failure consistently. Performance comes from LiveKit's adaptive stream and dynacast. Reliability comes from a resume-first reconnect strategy. And PHI never touches the browser's storage or our telemetry."

---

### Design 6 — Multi-Tenant Analytics and QA Dashboard (← BpoBox)

**Requirements:** per-tenant branding; roles (admin, QA, agent); a call list with filters; call detail with an audio player, transcript, AI scores and scorecard; charts; export.

**Architecture:** resolve the tenant at boot → load config, theme and flags → build a role-based route tree → feature modules (calls, scoring, reports, admin) → a query layer with tenant-scoped keys.

**Data model:** normalised calls, agents and scorecards. Filters live in the URL so views are shareable, and scoring drafts stay local until submitted.

**API:**

- `GET /tenants/:t/calls?cursor&filters`
- `GET /calls/:id`: transcript, AI scores and evidence timestamps.
- `POST /calls/:id/scorecards`
- `GET /reports/agent-performance?range`

**Optimisations:**

- Server-side filtering and aggregation.
- Virtualised tables, and a lazily loaded chart bundle.
- Prefetching call details when hovering a row.
- A keyboard-first reviewer mode.
- Export as a background job with a notification when it's ready.

**Security:** server-side RBAC and tenant isolation, an audit log of recording access, and signed URLs for audio.

**Say it like this:** "The reviewer's time is the key metric. AI pre-scoring with clickable evidence timestamps, keyboard shortcuts and prefetched call details are what cut review time, all on top of strict tenant isolation."

---

### Design 7 — Component Library / Design System (← Shared Component Library)

**Requirements:** a consistent UI across two products, theming per product and tenant, accessible components, easy adoption and safe upgrades.

**Architecture:** tokens (CSS variables) → Radix-based primitives → composed components → patterns. Documented in Storybook, published as ESM with per-component entry points, and versioned with Changesets.

**Quality:** visual regression, axe tests, interaction tests, bundle-size checks per component, and docs with do and don't examples.

**Governance:** an RFC process for new components, a deprecation policy, codemods, and an adoption dashboard.

**Say it like this:** "Tokens make it themeable, Radix makes it accessible, and Storybook with visual regression makes it safe to change. Governance is what makes people actually adopt it."

---

### Design 8 — Real-Time Notification System

**Answer:**

- One connection per user (SSE or WebSocket), shared across tabs through BroadcastChannel leader election or a SharedWorker.
- Notifications are stored on the server with their read state.
- The client shows toasts for urgent items and an inbox for the rest.
- Deduplicate by ID, and show an unread-count badge.
- Resync on reconnect with `GET /notifications?since=cursor`.
- Push notifications go through a service worker, with **no sensitive content** in the payload.

---

### Design 9 — Large File Upload (Call Recordings, Documents)

**Answer:**

- Validate the type and size before starting.
- Multipart upload to pre-signed S3 URLs in chunks of about 8 MB, with limited concurrency (3–4 chunks at a time) and retries per chunk.
- Resumable, using the list of parts already uploaded.
- Per-file progress, plus pause and cancel (AbortController).
- Checksum validation, then the server completes the multipart upload.
- Processing status comes back through SSE.

---

### Design 10 — Kanban Board (Jira- or Trello-Like)

**Answer:**

- Normalised columns and cards.
- Drag and drop with dnd-kit, which is keyboard accessible.
- **Fractional indexing** for ordering: a card dropped between ranks "a" and "b" gets rank "an", so the other cards never need renumbering.
- Optimistic moves with rollback.
- Real-time updates from other users, merged by version.
- Filters in the URL, and virtualisation for big columns.

---

### Design 11 — Collaborative Document Editor (Google Docs-Like)

**Answer:**

- A rich-text engine (ProseMirror, Lexical or Slate).
- A CRDT (Yjs) for concurrent edits, synced through a WebSocket provider.
- Presence cursors.
- Offline edits merged on reconnect.
- Snapshots plus incremental updates persisted.
- Comments anchored to positions that survive edits.
- View, comment and edit permissions, and version history.

---

### Design 12 — Video Streaming Player (YouTube-Like)

**Answer:**

- Adaptive bitrate streaming (HLS or DASH) through Media Source Extensions, using hls.js or Shaka.
- Buffer management, a quality selector plus auto mode, and preloading metadata.
- A thumbnail sprite for previews while scrubbing.
- Captions (WebVTT) and keyboard shortcuts.
- Analytics: startup time and rebuffer ratio.
- DRM (EME) when needed, and picture-in-picture.

---

## Part D — Rapid-Fire Designs and From Your Resume

## 🧩 Rapid-Fire Design Questions (Practise 5-Minute Answers)

**Q31. Design an image carousel.**

**Answer:** Accessible previous and next buttons, lazy-loaded neighbouring slides, swipe gestures (scroll-snap), autoplay that pauses on hover and focus, and `aria-roledescription="carousel"` with slide labels ("3 of 8").

---

**Q32. Design a poll widget that can be embedded on other sites.**

**Answer:** Build it as an iframe or a Web Component with Shadow DOM for style isolation. Resize through `postMessage`, rate-limit votes, and stream results through SSE.

---

**Q33. Design a form builder.**

**Answer:** A JSON schema feeds a renderer registry, which maps field types to components. Validation is a Zod schema generated from the JSON schema. Add conditional logic (show field X if Y), versioned schemas and a live preview.

---

**Q34. Design a spreadsheet.**

**Answer:** A virtualised grid (rows and columns). A cell dependency graph for formulas, recalculated in topological order. Computation in a Web Worker, plus copy and paste, and undo and redo with a command stack.

---

**Q35. Design an e-commerce product page.**

**Answer:** SSR or ISR for SEO, an optimised image gallery, the selected variant in the URL, optimistic cart updates, and fresh inventory data fetched on the client.

---

**Q36. Design a calendar.**

**Answer:** Month, week and day views, time zones, recurring events (RRULE), drag to reschedule, and a layout algorithm for overlapping events (columns per overlap group).

---

**Q37. Design a dashboard with 20 widgets.**

**Answer:** Each widget fetches its own data and has its own error boundary. Lazy-load widgets below the fold, keep shared filters in the URL, and persist the layout per user.

---

## 🎯 From Your Resume

**Q38. "Design InterpretIQ from scratch."**

**Answer:** Use Design 5, and add the interpreter scheduling and matching flow, language selection, a waiting room with an estimated wait, a post-call summary, and admin monitoring of live sessions.

**Say it like this:** "I'll design it the way we built it, and point out what I'd change." Then highlight real decisions (Redux for session state, LiveKit, the PWA) and one improvement, such as a formal state machine for the call lifecycle or a BFF for token handling.

---

**Q39. "Design the self-hosted LiveKit infrastructure."**

**Say it like this:** "SFU nodes on EC2 with host networking and an open UDP port range. Redis routes rooms across nodes. A load balancer handles WSS signalling, with TURN over TLS on port 443 for restrictive networks. Autoscaling is based on CPU and participant count. Prometheus metrics feed Grafana dashboards and alerts. Docker images are built in CI, and rolling deploys drain rooms before replacing a node. I compared this cost model with the managed service. The 40% savings and 10x scale were projections, and I'd validate them with load tests."

---

**Q40. "Design the AI call-scoring pipeline and its UI."**

**Say it like this:** "A Twilio recording webhook puts a job on a queue. A Celery worker transcribes the call, splits it into chunks, and scores it with an LLM against a rubric, using structured output. The output is validated with a schema, and the scores are saved with evidence timestamps. The UI is notified through SSE or polling. In the reviewer UI, clicking a score jumps to the evidence in the transcript and audio, and reviewer overrides are stored to evaluate the model. We tracked throughput, latency, cost per call and agreement with human QA."

---

**Q41. "How would you evolve BpoBox and InterpretIQ to share a component library?"**

**Say it like this:** "Use Design 7. I'd set up a monorepo, or a versioned package if the repos must stay separate, with a token set per product. I'd migrate component by component, starting with the most duplicated ones like Button, Dialog and Table, and use visual regression tests so the migration doesn't break either product."
