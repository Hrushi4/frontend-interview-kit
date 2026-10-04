# 12 — Performance Optimization

Rule for every answer: **measure → find the bottleneck → change one thing → re-measure → state the number.**

Levels: **🟢 Basic → 🟡 Intermediate → 🔴 Advanced → 🎥 Real-time/Video → 🧩 Scenario → 🎯 From Your Resume**

---

## 🟢 Level 1 — Basics

**1. Why does frontend performance matter?**
Conversions, engagement, SEO ranking signals (Core Web Vitals), accessibility on low-end devices and slow networks, and in your domain — call quality and clinician time.

**2. What are Core Web Vitals?**
| Metric | Measures | Good (p75) |
|---|---|---|
| **LCP** Largest Contentful Paint | loading — when the main content appears | ≤ 2.5 s |
| **INP** Interaction to Next Paint | responsiveness — delay from input to next frame, across the visit | ≤ 200 ms |
| **CLS** Cumulative Layout Shift | visual stability | ≤ 0.1 |
INP replaced FID as a Core Web Vital in 2024.

**3. Other important metrics?**
TTFB (server response), FCP (first content), TBT (total blocking time — lab proxy for INP), Speed Index, TTI, long tasks (> 50 ms).

**4. Lab data vs field data?**
Lab: Lighthouse, WebPageTest, DevTools — reproducible, for debugging. Field (RUM): real users via CrUX or the `web-vitals` library — what actually matters. Decide with field data, debug with lab data.

**5. Basic tools?**
Chrome DevTools (Performance, Network, Coverage, Memory, Lighthouse panels), PageSpeed Insights, WebPageTest, React Profiler, bundle analyzers.

**6. Quick wins checklist?**
Compress (Brotli/gzip), cache static assets, optimize images, lazy-load below-the-fold, code-split routes, defer non-critical JS, preconnect to critical origins, remove unused dependencies.

**7. What is a "long task"?**
Any main-thread task over 50 ms. During it the page can't respond to input — the main cause of poor INP.

**8. Why are images often the biggest problem?**
They're usually the heaviest bytes and often the LCP element. Wrong formats, oversized dimensions and late discovery hurt LCP and bandwidth.

**9. Lazy loading?**
Load resources only when needed: `loading="lazy"` for images/iframes, `React.lazy`/dynamic `import()` for code, IntersectionObserver for custom cases.

**10. What is a CDN and why use one?**
Geographically distributed caches serving static assets (and sometimes HTML) close to users — lower latency, offloads origin.

---

## 🟡 Level 2 — Intermediate — Loading performance

**11. How do you improve LCP? (break it into parts)**
LCP = TTFB + resource load delay + resource load time + element render delay.
- TTFB: CDN, caching HTML, faster server/SSR, edge rendering.
- Load delay: make the LCP resource discoverable in HTML (not CSS background or JS-injected), `<link rel="preload">`, `fetchpriority="high"`, don't lazy-load it.
- Load time: smaller images (AVIF/WebP, correct size), CDN.
- Render delay: reduce render-blocking CSS/JS, inline critical CSS, avoid client-only rendering for above-the-fold content.

**12. How do you fix CLS?**
Reserve space: `width`/`height` or `aspect-ratio` on images/video/embeds; skeletons with real dimensions; avoid inserting banners above content; font metric overrides (`size-adjust`) or `font-display: optional`; animate with `transform` not layout properties.

**13. How do you improve INP?**
- Break long tasks: yield to main thread (`scheduler.yield()` / `setTimeout` chunking).
- Do less work in handlers; defer non-urgent updates (`startTransition`).
- Reduce re-render scope in React (colocation, memo, virtualization).
- Move heavy computation to Web Workers.
- Reduce JS execution and hydration cost (less JS, Server Components, islands).
- Avoid layout thrashing in handlers.

**14. Code splitting strategies?**
Route-based (each page a chunk), component-based (heavy widgets: video SDK, charts, rich text editor, PDF viewer), vendor splitting, conditional features by permission/flag. Prefetch likely next chunks on hover/idle.

**15. Tree shaking — how and why it fails?**
Bundlers remove unused ESM exports. Fails with CommonJS modules, side-effectful imports, barrel files re-exporting everything, `import * as`. Fix: ESM libraries (`lodash-es`), `"sideEffects": false` in package.json, direct imports.

**16. Bundle analysis?**
`vite-bundle-visualizer`/`rollup-plugin-visualizer`, `webpack-bundle-analyzer`, `@next/bundle-analyzer`, `source-map-explorer`. Look for duplicates, huge libs (moment, full icon sets), polyfills you don't need.

**17. Performance budgets?**
Limits enforced in CI (JS ≤ 200 KB gzip on main route, LCP ≤ 2.5 s in Lighthouse CI). Fail the build or warn on regression.

**18. Caching strategy for static assets?**
Content-hashed filenames + `Cache-Control: public, max-age=31536000, immutable`; HTML with `no-cache` (revalidate) so new deploys are picked up; `ETag`/`Last-Modified` for revalidation.

**19. Compression?**
Brotli for text assets (better ratio than gzip), pre-compress at build; don't compress already-compressed formats (images, video).

**20. HTTP/2 and HTTP/3 impact?**
Multiplexing many requests on one connection — fewer reasons to concatenate everything; header compression. HTTP/3 (QUIC over UDP) avoids TCP head-of-line blocking — better on lossy mobile/hospital Wi-Fi.

**21. Resource hints?**
`preconnect` (API, CDN, LiveKit signalling host), `dns-prefetch`, `preload` (LCP image, critical font), `prefetch` (next route), `modulepreload`. Overusing preload competes with critical resources.

**22. Image optimization checklist?**
Modern formats (AVIF/WebP) with fallback, responsive `srcset`/`sizes`, correct intrinsic dimensions, lazy-load below the fold, `decoding="async"`, CDN resizing, SVG for icons (sprite or inlined), compress thumbnails.

**23. Font optimization?**
Self-host woff2, subset to used characters, preload the critical font, `font-display: swap/optional`, limit weights/families, variable fonts, metric-matched fallbacks.

**24. Third-party scripts?**
Audit them (often the largest cost), load async/defer, delay until interaction or idle, facade pattern (static placeholder for chat widgets/videos until clicked), Partytown for moving to a worker, remove unused tags.

**25. Rendering strategies' performance trade-offs?**
CSR: slow first paint, heavy JS. SSR: fast first paint, server cost, hydration cost. SSG/ISR: fastest, stale data risk. Streaming/RSC: send shell quickly, less client JS.

**26. Hydration cost — how to reduce?**
Ship less client JS (Server Components), lazy-hydrate below-the-fold components, islands architecture, avoid giant client-side providers wrapping the whole app.

**27. Service worker caching for performance?**
Precache app shell and static assets; stale-while-revalidate for semi-static data; never cache authenticated/sensitive API responses.

---

## 🟡 Intermediate — Runtime performance

**28. Browser rendering pipeline and cost?**
JS → Style → Layout → Paint → Composite. Layout changes are most expensive; transform/opacity changes can be composite-only.

**29. Layout thrashing?**
Interleaving reads (offsetHeight, getBoundingClientRect) and writes (style changes) forces repeated synchronous layouts.
```js
// bad: read/write in loop
items.forEach(el => { el.style.height = el.offsetWidth + 'px'; });
// good: batch reads, then writes
const widths = items.map(el => el.offsetWidth);
items.forEach((el, i) => { el.style.height = widths[i] + 'px'; });
```

**30. `requestAnimationFrame` for visual updates?**
Schedule DOM writes right before paint; coalesce many updates (e.g., streaming tokens, audio levels) into one per frame.

**31. Debounce/throttle event handlers?**
Throttle scroll/resize/mousemove; debounce search and autosave; use passive listeners for touch/wheel.

**32. Virtualization?**
Render only visible rows of long lists/tables (TanStack Virtual, react-window). Required for thousands of calls, chat messages or transcript lines.

**33. `content-visibility: auto`?**
Browser skips rendering off-screen sections; pair with `contain-intrinsic-size` to avoid scrollbar jumps.

**34. React-specific optimizations?**
Profile first. Then: colocate state, split context, `memo` + stable props, `useMemo` for expensive derived data, `useTransition`/`useDeferredValue`, virtualization, lazy-loading, avoid creating components inside components, key stability, React Compiler.

**35. Web Workers for performance?**
Parse large JSON/CSV, compute analytics, diff transcripts, encrypt — off the main thread. Transfer `ArrayBuffer`s instead of copying.

**36. Memory performance?**
Leaks increase GC pauses and eventually crash tabs (especially on mobile/tablets). Heap snapshots, allocation timelines, check detached DOM nodes, cap in-memory caches.

**37. Network request optimization?**
Avoid waterfalls (parallelize), dedupe/cache requests (query libraries), paginate, request only needed fields, compress responses, use HTTP caching for GETs, batch where appropriate.

**38. Optimistic UI?**
Update UI immediately on user action, reconcile with server response — improves perceived performance.

**39. Perceived performance techniques?**
Skeleton screens with real dimensions, progressive rendering, instant feedback on click (pressed state, spinner after 300 ms not immediately), prefetch on hover, keep previous data while loading next page.

---

## 🔴 Level 3 — Advanced

**40. How do you measure performance in production?**
`web-vitals` library → analytics endpoint (with attribution build to identify the LCP element/INP interaction), segment by route/device/network/tenant, p75 dashboards (Grafana/Datadog), alerts on regressions.
```ts
import { onLCP, onINP, onCLS } from 'web-vitals/attribution';
const send = (m: Metric) => navigator.sendBeacon('/rum', JSON.stringify({ name: m.name, value: m.value, id: m.id, attribution: m.attribution, route: location.pathname }));
onLCP(send); onINP(send); onCLS(send);
```

**41. Custom metrics with User Timing?**
```ts
performance.mark('join-click');
// ... when first remote video frame renders
performance.mark('first-remote-frame');
performance.measure('join-latency', 'join-click', 'first-remote-frame');
```
Collect via `PerformanceObserver` and send to RUM.

**42. Long Animation Frames (LoAF) API?**
Attributes slow frames to scripts (which function/file) — better debugging of INP than long tasks alone (check browser support).

**43. Debugging INP in DevTools?**
Performance panel → record interaction → look at Interactions track; break down into input delay (main thread busy), processing time (your handlers + React render), presentation delay (style/layout/paint).

**44. Islands architecture / partial hydration?**
Static HTML with isolated interactive "islands" hydrated independently (Astro, RSC conceptually) — far less JS than full SPA hydration.

**45. Edge rendering and caching HTML?**
Render or cache personalized-but-cacheable pages at edge locations; vary by cookie/tenant carefully; stale-while-revalidate headers (`Cache-Control: s-maxage=60, stale-while-revalidate=300`).

**46. Back/forward cache (bfcache)?**
Instant back navigation by keeping the page in memory. Blocked by `unload` handlers and some open connections. Use `pagehide`/`pageshow`; close and reopen sockets appropriately.

**47. Speculation Rules / prerendering?**
`<script type="speculationrules">` to prefetch/prerender likely next pages in supporting browsers — near-instant navigations.

**48. JS parse/compile cost on low-end devices?**
JS is costlier byte-for-byte than images because of parse/compile/execute. Ship less JS, use modern syntax for modern browsers (no unnecessary polyfills), code-cache-friendly chunking.

**49. Polyfills strategy?**
Target modern browsers via browserslist; differential loading/module-nomodule only if old browsers matter; avoid polyfilling everything.

**50. Optimizing a design system for performance?**
Tree-shakable ESM, per-component entry points, no global CSS-in-JS runtime, icons as individual imports, avoid huge dependencies, measure each component's cost.

**51. Performance culture in a team?**
Budgets in CI, RUM dashboards per release, performance section in PR template for heavy features, regular audits, ownership of key metrics.

---

## 🎥 Real-time / Video Performance (your domain)

**52. Main performance concerns in a video app?**
Join time, bandwidth, CPU/battery (encoding/decoding), memory (many video elements), main-thread jank from UI updates, reconnection speed.

**53. Simulcast?**
Publisher sends multiple encodings (e.g., high/medium/low); the SFU forwards the appropriate layer per subscriber's bandwidth and tile size.

**54. Adaptive stream and dynacast (LiveKit)?**
Adaptive stream: subscriber requests resolution based on rendered element size/visibility; pauses video for hidden tiles. Dynacast: publisher stops encoding layers nobody is consuming — saves CPU and upload bandwidth.

**55. SVC codecs (VP9/AV1)?**
Single stream with spatial/temporal layers that the SFU can drop — similar benefits to simulcast with better efficiency; device support and CPU cost vary.

**56. Reducing join latency?**
Prefetch room token on page load/hover, preconnect to signalling/TURN hosts, warm up `getUserMedia` on the pre-join screen, lazy-load the SDK before the user clicks join, nearest region/SFU, avoid serial API calls before connecting.

**57. Rendering many participants efficiently?**
Paginate tiles, render only visible participants' video, audio-only for off-screen, active-speaker layout, stable keys to avoid remounting `<video>` elements.

**58. Speaking indicators without re-render storms?**
Audio levels update many times per second — keep them out of React state; update a CSS variable or class directly via ref inside rAF; throttle.

**59. Low-end tablet optimizations?**
Lower publish resolution/frame rate, disable background blur/effects, limit visible tiles, reduce animation, monitor `performance.memory`/thermal, fallback to audio-only on poor network quality.

**60. Network quality indicators?**
Use SDK connection quality events; show simple good/fair/poor badge; auto-downgrade video and inform user.

---

## 🧩 Level 4 — Scenario-based

**61. "Our dashboard LCP is 5 s on mobile." Walk me through it.**
1) Check field data per route/device. 2) Lighthouse/WebPageTest trace: what is the LCP element? 3) Break LCP into TTFB/load delay/load time/render delay. 4) Typical fixes: SSR or skeleton with content above the fold, preload hero data/image, reduce JS blocking render, CDN. 5) Re-measure p75.

**62. Typing into a filter input feels laggy (INP 600 ms).**
Profile interaction: React re-rendering a 5k-row table each keystroke. Fix: debounce/`useDeferredValue`, virtualization, memoized rows, server-side filtering. Show before/after INP.

**63. Bundle grew from 250 KB to 900 KB after adding a feature.**
Bundle analyzer → found full icon library + charting lib + moment. Fix: per-icon imports, lazy-load charts on the analytics route, replace moment with `Intl`/date-fns. Add budget in CI.

**64. CLS 0.3 on the call list page.**
Images without dimensions, late-loading "new calls" banner pushing content, font swap. Reserve space, show banner as overlay, size-adjusted fallback font.

**65. App becomes sluggish after an hour-long call.**
Memory leak or unbounded arrays (chat/events/transcript). Heap snapshots, cap buffers, virtualize lists, clean listeners, check SDK event subscriptions per re-render.

**66. Third-party analytics script blocks the main thread on load.**
Load after interaction/idle, use `sendBeacon`, move to worker (Partytown), or server-side analytics.

**67. API responses are slow and the page waits on 5 sequential calls.**
Parallelize independent calls, BFF to aggregate, cache, render progressively with Suspense/skeletons.

**68. Users on hospital Wi-Fi have long join times.**
TURN over TLS/443 fallback, reduce pre-join steps, prefetch token, regional SFU, measure ICE connection time separately to find the bottleneck.

---

## 🎯 From Your Resume

**69. "How did you achieve < 5 s join latency?"**
Explain what you measured (click → connected → first remote frame), the main contributors you found, and concrete changes (token prefetch, permission warm-up, lazy SDK load, region). If you don't remember exact before/after numbers, say what you'd measure rather than inventing them.

**70. "Your SSE chat streams tokens — how did you keep rendering smooth?"**
Buffer tokens and flush per animation frame; render markdown incrementally on completed blocks; virtualize long histories; avoid re-rendering the whole message list per token.

**71. "BpoBox dashboards serve 1,500 users — what did you optimize?"**
Server-side aggregation and pagination, virtualized tables, cached queries with sensible `staleTime`, lazy-loaded charts, prefetch on hover, URL-driven filters. Mention RUM numbers if you have them.

**72. "How did self-hosting LiveKit support 10x traffic?"**
Horizontal scaling of SFU nodes with Redis-based routing, autoscaling policies, CDN for static assets, monitoring dashboards (Prometheus/Grafana) to see bottlenecks. Note this is a projection; describe how you'd load-test it.
