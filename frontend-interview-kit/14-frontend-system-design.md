# 14 — Frontend System Design

At 4+ years this round often decides your level. Use a fixed framework so you never freeze, state numbers, and name trade-offs.

Sections: **Framework → 🟢 Basic concepts → 🟡 Intermediate → 🔴 Advanced → 📐 12 Worked Designs → 🎯 From Your Resume**

---

## The RADIO framework (45–60 minute round)

| Step | Time | What to cover |
|---|---|---|
| **R**equirements | 5–8 min | Functional (3–5 core features), non-functional (users/scale, latency targets, devices, offline, a11y, i18n, security/compliance, SEO). Ask clarifying questions; write assumptions. |
| **A**rchitecture | 10 min | Box diagram: client app (shell, routing, state, data layer, real-time channel), CDN, BFF/API gateway, services. Rendering strategy. |
| **D**ata model | 5–8 min | Client entities and normalized store, server vs client state, cache keys, what lives in URL. |
| **I**nterface (API) | 5–8 min | Endpoints/events with payloads, pagination (cursor), real-time protocol, error shapes, auth. |
| **O**ptimizations | 15 min | Performance, network, rendering, a11y, security, observability, testing, rollout, failure modes. |
Close with: trade-offs chosen vs rejected, and what you'd do with more time.

**Talking tips**
- Draw a component tree and a state machine for anything real-time.
- Give numbers: debounce 250 ms, page size 50, LCP target 2.5 s, reconnect backoff 1 → 2 → 4 → 8 s capped at 30 s.
- Mention failure modes (offline, slow network, partial data, permission denied).

---

## 🟢 Level 1 — Basic concepts

**1. CSR vs SSR vs SSG vs ISR — how to choose?**
Public, SEO-critical, mostly static → SSG/ISR. Public + personalized/fresh → SSR/streaming. Authenticated, highly interactive → CSR/SPA (maybe SSR shell). Mix per route.

**2. SPA vs MPA?**
SPA: client-side routing, app-like transitions, heavier initial JS. MPA: full page loads, simpler, better default performance; modern MPAs use view transitions and prefetching.

**3. Component architecture basics?**
Pages → layouts → feature containers → presentational components → design-system primitives. Keep data fetching at feature boundaries.

**4. What is a BFF (Backend for Frontend)?**
A server layer tailored to a frontend: aggregates APIs, shapes payloads, holds tokens (security), handles auth cookies, caching and rate limits.

**5. Pagination types?**
Offset (`?page=3&limit=50`) — simple, jumps to page N, unstable when data changes. Cursor (`?after=abc&limit=50`) — stable for feeds/infinite scroll, no page jumping. Keyset for DB efficiency.

**6. Client caching layers?**
HTTP cache (Cache-Control/ETag), service worker cache, in-memory query cache (TanStack/RTK Query), normalized entity store, browser storage for non-sensitive data.

**7. Real-time delivery options?**
Polling (simple, wasteful), long polling, SSE, WebSocket, WebRTC. Choose by direction, frequency, latency and infrastructure.

**8. Accessibility as a requirement?**
Keyboard support, focus management, semantic structure, ARIA where needed, contrast, reduced motion, screen reader announcements for live updates.

**9. Internationalization?**
Message catalogs, ICU plurals, date/number formatting via Intl, RTL support with logical CSS, locale in URL, translatable strings not concatenated.

**10. Error handling layers?**
Field-level validation, request-level retry/backoff, component error boundaries, route-level error pages, global error reporting, user-friendly messages with recovery actions.

---

## 🟡 Level 2 — Intermediate concepts

**11. State management design?**
Server state → query cache. URL state → router. Form state → form library. Local UI → component state. Shared client state → store. Complex flows → state machine.

**12. Normalization?**
Store entities by id; lists hold ids; one update fixes everywhere (e.g., a call's score shown in list, detail and dashboard).

**13. Optimistic updates?**
Apply change immediately, send request, reconcile on response, rollback on error with a toast. Use client-generated temp IDs for creates; idempotency keys to avoid duplicates.

**14. Handling race conditions?**
Abort stale requests, ignore out-of-order responses (request id), version numbers/ETags for concurrent edits (409 Conflict → merge UI).

**15. Offline-first?**
Cache app shell, store data/drafts in IndexedDB, queue mutations (outbox) with retry when online, conflict resolution (last-write-wins, server merge, CRDTs), clear UI indicating offline status.

**16. Reconnection strategy for sockets/SSE?**
Exponential backoff with jitter, cap, heartbeat/ping to detect dead connections, resume from last event id/cursor, refetch snapshot after reconnect to fix missed events, visible connection state.

**17. Feature flags?**
Ship code dark, enable per tenant/user/percentage, kill switches for risky features, clean up stale flags. Evaluate flags at boot (and server-side for SSR).

**18. Observability for frontend?**
RUM (Web Vitals, custom timings), error tracking (Sentry) with release tags and source maps, structured logs for key actions, analytics events, session-level correlation ids passed to backend, dashboards and alerts.

**19. Testing strategy?**
Static (TS, ESLint), unit/integration (RTL + MSW), contract tests against API schemas, E2E (Playwright) for critical journeys, visual regression for design system, a11y automation, performance budgets in CI.

**20. Deployment and rollout?**
Immutable hashed assets on CDN, atomic HTML switch, canary/percentage rollout, version check prompting reload, rollback plan, backwards-compatible API changes during rollout.

**21. Security requirements to always mention?**
Auth flow and token storage, server-side authorization, CSP, input sanitization (especially rich text/LLM), rate limits, PII/PHI handling, audit logs.

---

## 🔴 Level 3 — Advanced concepts

**22. Micro-frontends — when and how?**
When multiple teams need independent deploys on one product surface. Approaches: build-time packages (simplest, coupled deploys), runtime Module Federation, iframes (strong isolation, UX cost), Web Components. Must solve: shared dependencies (single React), design consistency, routing ownership, cross-app communication (events/URL), performance budget per remote, error isolation. Often a modular monolith is enough.

**23. Design system at scale?**
Tokens (Figma variables → code), primitives, components, patterns; versioning (semver, changesets), Storybook docs, visual regression, a11y tests, codemods for breaking changes, adoption metrics, contribution model, multi-brand theming via token sets.

**24. Monorepo architecture?**
pnpm workspaces + Turborepo/Nx; apps and shared packages (ui, utils, api-client, config); affected-only CI; enforced module boundaries; shared tsconfig/eslint.

**25. Real-time collaborative editing?**
OT (central server transforms operations — Google Docs history) vs CRDTs (Yjs/Automerge — merge without central transform, good for offline/peer). Presence (cursors), awareness, persistence of snapshots + updates, permission checks per document.

**26. Large data rendering?**
Server-side aggregation, pagination, virtualization (rows and columns), canvas/WebGL for huge charts, Web Workers for computation, incremental rendering.

**27. Multi-tenancy in the frontend?**
Tenant resolution (subdomain/path/token claim), tenant config & feature flags, theming via tokens, tenant-scoped cache keys, isolation on logout/switch, per-tenant rate limits and analytics.

**28. Security architecture for sensitive data (healthcare/fintech)?**
BFF holding tokens, httpOnly cookies, strict CSP, no sensitive data in browser storage/URLs/logs, session timeouts, audit trails, field-level permissions, encryption at rest/in transit, vendor review for third-party scripts.

**29. Scaling the frontend organization?**
Clear ownership (CODEOWNERS), architecture decision records, shared lint/test standards, golden-path templates, platform team for tooling, performance and a11y budgets.

**30. Edge computing for frontend?**
Edge middleware for auth redirects, geolocation, A/B; edge caching of HTML; personalization with cache keys; latency gains vs runtime limitations.

---

## 📐 12 Worked Designs

### Design 1 — Autocomplete / Typeahead
- **Requirements:** suggestions as user types, keyboard navigation, highlight match, recent searches, < 100 ms perceived response, mobile friendly.
- **Architecture:** `SearchInput` → `useDebounce(250ms)` → cache lookup (LRU by query) → fetch with AbortController → `SuggestionList`.
- **Data:** `{ query, results: Suggestion[], status, activeIndex }`; cache `Map<string, Suggestion[]>` with size cap.
- **API:** `GET /search/suggest?q=…&limit=8` → `[{ id, label, type }]`.
- **Optimizations:** min 2 chars; cancel stale requests and ignore out-of-order responses; cache prefixes; prefetch popular queries; server returns top-N already ranked.
- **A11y:** combobox pattern — `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, listbox/option roles, Escape closes, announce result count.
- **Edge cases:** IME composition (`compositionstart/end`), empty/error states, very fast typists, offline.

### Design 2 — Infinite-scroll News Feed
- **Requirements:** feed of posts with images, likes/comments, new posts indicator, smooth scroll for thousands of items.
- **Architecture:** cursor-paginated `useInfiniteQuery`; IntersectionObserver sentinel; virtualized list with dynamic heights; post cards lazy-load media.
- **Data:** normalized posts and users; feed holds ids.
- **API:** `GET /feed?cursor=…&limit=20` → `{ items, nextCursor }`; `POST /posts/:id/like`.
- **Optimizations:** optimistic likes; "N new posts" banner instead of inserting at top (avoids CLS); image placeholders with aspect-ratio; scroll restoration on back navigation; prefetch next page early.
- **Failure modes:** duplicate items across pages (dedupe by id), deleted posts, offline.

### Design 3 — Chat Application (WhatsApp/Slack web)
- **Requirements:** 1:1 and group chats, real-time delivery, typing indicators, read receipts, history, attachments, offline send.
- **Architecture:** WebSocket connection manager (singleton, shared across tabs via leader election), REST for history, IndexedDB for offline cache and outbox.
- **Data:** `Conversation { id, members, lastMessage, unread }`, `Message { id, clientId, convId, senderId, body, status: 'sending'|'sent'|'delivered'|'read'|'failed', createdAt }`.
- **API/events:** `message.send {clientId,…}` → ack `{clientId, id, createdAt}`; `message.new`, `typing`, `receipt`; history `GET /conversations/:id/messages?before=cursor`.
- **Optimizations:** optimistic send with clientId; reverse virtualized list; batch receipts; throttle typing events; reconnect + fetch missed since last message id; message ordering by server timestamp/sequence.
- **Security:** sanitize rich text, attachment scanning, authorization per conversation.

### Design 4 — AI Chat with Streaming Responses (← your SSE compliance chat)
- **Requirements:** streaming answers, stop/regenerate, conversation history, citations to source calls/transcripts, markdown + code rendering, feedback buttons, tenant/role aware, no sensitive data leakage.
- **Architecture:** Client → BFF (auth, rate limit, holds LLM key, audit) → retrieval service (RAG over tenant data) → LLM; streaming via SSE or fetch ReadableStream.
- **Data:** `Conversation { id, title, messages[] }`, `Message { id, role, content, status: 'streaming'|'done'|'error'|'stopped', citations: {callId, ts}[] }`.
- **API:** `POST /conversations/:id/messages` → `text/event-stream` events `token`, `citation`, `done`, `error`.
- **Client details:** token buffer flushed per animation frame; AbortController for stop; retry with same prompt; auto-scroll only when near bottom; sanitized markdown; `aria-live` announcement on completion only.
- **Optimizations/quality:** time-to-first-token metric, tokens/sec, error rate; prompt-injection awareness (retrieved content is data, not instructions); per-tenant quotas; cache common answers when safe.

### Design 5 — Video Consultation / Interpretation UI (← InterpretIQ)
- **Requirements:** patient, provider and interpreter join a room; waiting room; mute/camera/screen share; reconnect gracefully; captions; works on hospital Wi-Fi and tablets; WCAG AA; no PHI leakage.
- **Architecture:** PWA shell → auth → pre-join (device check, permissions, network test) → API issues short-lived room token with role-scoped grants → LiveKit SFU over WebRTC; signalling over WSS; TURN/TLS on 443 fallback; SDK lazy-loaded.
- **State machine:**
```
idle → checkingDevices → (denied) permissionError
checkingDevices → (ok) connecting → connected
connected → (network drop) reconnecting → connected | failed
connected → (leave/end) ended
```
- **Data:** participants keyed by identity with role, track publications, connection quality; device preferences (non-sensitive) persisted.
- **Optimizations:** prefetch token on page load; preconnect to media hosts; adaptive stream/simulcast/dynacast; pause off-screen video; active-speaker layout; audio-only fallback under poor quality; speaking indicators updated outside React state.
- **Reliability:** non-blocking reconnect banner; rejoin with backoff + fresh token; heartbeat; telemetry for join time, reconnect count/success, call drops.
- **Security & compliance:** opaque room names, short token TTL, recording consent UI, no PHI in logs/analytics, session timeout.
- **A11y:** labelled toggle buttons with `aria-pressed`, keyboard shortcuts, live-region announcements, captions, focus management on join/leave.

### Design 6 — Multi-tenant Analytics / QA Dashboard (← BpoBox)
- **Requirements:** per-tenant branding; roles (admin, QA, agent); call list with filters; call detail with audio player, transcript, AI scores and scorecard; charts; export.
- **Architecture:** tenant resolution at boot → config/theme/flags → role-based route tree → feature modules (calls, scoring, reports, admin) → query layer with tenant-scoped keys.
- **Data:** normalized calls, agents, scorecards; filters in URL (shareable); scoring drafts local until submitted.
- **API:** `GET /tenants/:t/calls?cursor&filters`, `GET /calls/:id` (transcript, AI scores, evidence timestamps), `POST /calls/:id/scorecards`, `GET /reports/agent-performance?range`.
- **Optimizations:** server-side filtering/aggregation, virtualized tables, lazy chart bundle, prefetch call detail on row hover, keyboard-first reviewer mode, export as background job with notification.
- **Security:** server RBAC + tenant isolation, audit log of recording access, signed URLs for audio.

### Design 7 — Component Library / Design System (← shared component library)
- **Requirements:** consistent UI across two products, theming per product/tenant, accessible components, easy adoption, safe upgrades.
- **Architecture:** tokens (CSS variables) → Radix-based primitives → composed components → patterns; Storybook; package published as ESM with per-component entry points; changesets for versions.
- **Quality:** visual regression, axe tests, interaction tests, bundle-size checks per component, docs with do/don't.
- **Governance:** RFC process for new components, deprecation policy, codemods, adoption dashboard.

### Design 8 — Real-time Notification System
- One connection per user (SSE/WebSocket) shared across tabs (BroadcastChannel leader election or SharedWorker); notifications stored server-side with read state; client shows toasts for urgent, inbox for the rest; dedupe by id; unread count badge; resync on reconnect via `GET /notifications?since=cursor`; push notifications via service worker (no sensitive content in payload).

### Design 9 — Large File Upload (call recordings, documents)
- Multipart upload to pre-signed URLs (S3) in chunks (e.g., 8 MB) with limited concurrency (3–4), retries per chunk, resumable via uploaded-parts list, progress per file, pause/cancel (AbortController), checksum validation, server completes multipart, processing status via SSE; validate type/size before upload; upload continues in background tab.

### Design 10 — Kanban Board (Jira/Trello-like)
- Columns and cards normalized; drag-and-drop with dnd-kit (keyboard accessible); fractional indexing for ordering (`rank` strings) to avoid reindexing all cards; optimistic moves with rollback; real-time updates from other users merged by version; filters in URL; virtualization for big columns.

### Design 11 — Collaborative Document Editor (Google Docs-like)
- Rich-text engine (ProseMirror/Lexical/Slate); CRDT (Yjs) for concurrent edits; WebSocket provider; presence cursors; offline edits merged on reconnect; snapshots + incremental updates persisted; comments anchored to positions that survive edits; permissions (view/comment/edit); version history.

### Design 12 — Video Streaming Player (YouTube-like)
- Adaptive bitrate streaming (HLS/DASH) with Media Source Extensions (hls.js/shaka); buffer management; quality selector + auto; preload metadata; thumbnails sprite for scrubbing; captions (WebVTT); keyboard shortcuts; analytics (startup time, rebuffer ratio); DRM (EME) when needed; picture-in-picture.

---

## 🧩 Rapid-fire design questions (practise 5-minute answers)

**31. Design an image carousel.** Accessible controls, lazy-load neighbours, swipe, autoplay pause on hover/focus, `aria-roledescription`.
**32. Design a poll widget embeddable on other sites.** Iframe or Web Component, Shadow DOM styles, postMessage resize, rate limiting, results via SSE.
**33. Design a form builder.** JSON schema → renderer registry → validation (Zod from schema) → conditional logic → versioned schemas → preview.
**34. Design a spreadsheet.** Virtualized grid (rows + columns), cell dependency graph for formulas (topological recalculation), Web Worker for compute, copy/paste, undo/redo.
**35. Design an e-commerce product page.** SSR/ISR for SEO, image gallery optimization, variant selection in URL, cart optimistic updates, inventory freshness.
**36. Design a calendar.** Month/week/day views, time zones, recurring events (RRULE), drag to reschedule, overlapping event layout algorithm.
**37. Design a dashboard with 20 widgets.** Independent data fetching and error boundaries per widget, lazy-load below-the-fold widgets, shared filters in URL, layout persistence.

---

## 🎯 From Your Resume

**38. "Design InterpretIQ from scratch."**
Use Design 5; add scheduling and interpreter matching flow, language selection, waiting room with estimated wait, post-call summary, and admin monitoring of live sessions. Highlight decisions you made in reality and what you'd change.

**39. "Design the self-hosted LiveKit infrastructure."**
SFU nodes on EC2 with host networking and UDP port range; Redis for multi-node room routing; load balancer for signalling (WSS); TURN/TLS on 443; autoscaling on CPU/participant count; Prometheus metrics + Grafana dashboards + alerts; Docker images via CI; rolling deploys draining rooms; cost model vs managed service. State that the 40% savings and 10x scale were projections and how you'd validate them (load tests).

**40. "Design the AI call-scoring pipeline and its UI."**
Twilio recording webhook → queue → transcription → chunking → LLM scoring with rubric and structured output → validation → persist scores + evidence timestamps → notify UI (SSE/polling) → reviewer UI highlights evidence in transcript → reviewer overrides stored for evaluation. Metrics: throughput, latency, cost per call, agreement with human QA.

**41. "How would you evolve BpoBox and InterpretIQ to share a component library?"**
Design 7 + monorepo or versioned package, token sets per product, migration plan component by component, visual regression to avoid regressions.
