# 12 — Performance Optimisation

**The rule for every performance answer:** measure → find the bottleneck → change one thing → re-measure → state the number.

**How this file is organised**

- **Part A — Understand the topic:** what "fast" means, Core Web Vitals, how the browser loads and renders, and where time goes, explained simply.
- **Part B — Interview questions and answers:** Basics → Loading → Runtime → Advanced → Real-time/Video → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What does "performance" mean?

Users experience performance in three ways:

1. **Loading:** how quickly the main content appears.
2. **Interactivity:** how quickly the page responds when they click or type.
3. **Visual stability:** whether things jump around while they're reading.

Google measures exactly these three with **Core Web Vitals**:

| Metric | Question it answers | Good (75th percentile of users) |
|---|---|---|
| **LCP**: Largest Contentful Paint | "When did the main content appear?" | ≤ 2.5 s |
| **INP**: Interaction to Next Paint | "When I click, how long until the screen responds?" | ≤ 200 ms |
| **CLS**: Cumulative Layout Shift | "Did the page jump around?" | ≤ 0.1 |

INP replaced FID (First Input Delay) in 2024. INP measures *all* interactions during a visit, not just the first.

### Where the time goes

```text
Request → [TTFB: server + network] → HTML arrives → parse → discover CSS/JS/images
       → download → execute JS (main thread!) → render → LCP
User clicks → [wait for busy main thread] → run handlers + React render → style/layout/paint → next frame (INP)
```

The **main thread** is the bottleneck in most modern apps. It runs your JavaScript, React rendering, layout and paint, and it can only do one thing at a time. Any task longer than 50 ms is a **long task**, and while it runs the page can't respond to the user.

### The two kinds of data

- **Lab data** (Lighthouse, WebPageTest, DevTools): a controlled, repeatable test. Use it for **debugging**.
- **Field data / RUM** (Real User Monitoring: CrUX, the `web-vitals` library): what real users on real devices experience. Use it for **decisions**.

### The main levers

| Problem | Typical levers |
|---|---|
| Slow loading (LCP) | CDN, server rendering, smaller images, preload, less render-blocking JS/CSS |
| Slow interaction (INP) | less JavaScript, breaking up long tasks, fewer React re-renders, Web Workers |
| Layout jumps (CLS) | reserve space for images, ads and banners; font metric matching |
| Big bundles | code splitting, tree shaking, removing heavy dependencies |

### Why interviewers ask about performance

Your resume claims concrete wins ("< 5 s join latency", "150 concurrent sessions", "10x traffic"). Senior interviews test whether you can **diagnose systematically** and **prove results with numbers**. They aren't looking for a list of tricks.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. Why does frontend performance matter?**

**Short answer:** It drives conversions and engagement, Core Web Vitals are an SEO ranking signal, and the app has to work for users on cheap phones and slow networks. In your domain, performance directly affects call quality and clinicians' time.

**Say it like this:** "Performance is a feature. For InterpretIQ, a slow join means a patient waiting for an interpreter. For BpoBox, a slow dashboard means QA reviewers waste minutes on every call."

---

**Q2. What are Core Web Vitals?**

**Short answer:** Three user-centred metrics. **LCP** measures loading and should be at most 2.5 s. **INP** measures responsiveness and should be at most 200 ms. **CLS** measures visual stability and should be at most 0.1. All three are judged at the 75th percentile of real users.

**Say it like this:** "LCP is 'is it loading?', INP is 'does it respond when I click?', and CLS is 'does it jump around?'. I track all three at p75 from real-user data, not just Lighthouse scores."

---

**Q3. What other metrics are important?**

**Short answer:**

- **TTFB** (Time to First Byte): server and network speed.
- **FCP** (First Contentful Paint): the first text or image.
- **TBT** (Total Blocking Time): a lab proxy for INP.
- **Speed Index.**
- **Long tasks:** any task over 50 ms.

---

**Q4. Lab data vs field data?**

**Short answer:** Lab data comes from Lighthouse and DevTools. It's reproducible, which makes it good for debugging. Field data comes from real users (CrUX or the `web-vitals` library) and is what actually matters. **Decide with field data, debug with lab data.**

**Example:** Lighthouse on your MacBook might show LCP at 1.2 s, while field data shows 4.8 s for Android users on 3G. The field number is the truth.

---

**Q5. What are the basic tools?**

**Short answer:**

- Chrome DevTools: the Performance, Network, Coverage, Memory and Lighthouse panels.
- PageSpeed Insights, which shows lab and field data together.
- WebPageTest.
- The React Profiler.
- Bundle analysers.

---

**Q6. What's on a quick-wins checklist?**

**Short answer:**

- Compress with Brotli or gzip.
- Cache static assets.
- Optimise images.
- Lazy-load content below the fold.
- Code-split by route.
- Defer non-critical JavaScript.
- Preconnect to critical origins.
- Remove unused dependencies.

---

**Q7. What is a long task?**

**Short answer:** Any main-thread task over 50 ms. While it runs, the page can't respond to input, so long tasks are the main cause of poor INP.

---

**Q8. Why are images so often the biggest problem?**

**Short answer:** They're usually the heaviest bytes on a page and often the LCP element. Wrong formats, oversized dimensions, and late discovery (for example, a CSS background image) all hurt LCP and waste bandwidth.

---

**Q9. What is lazy loading?**

**Short answer:** Loading resources only when they're needed: `loading="lazy"` for images and iframes, `React.lazy` or dynamic `import()` for code, and `IntersectionObserver` for custom cases.

---

**Q10. What is a CDN, and why use one?**

**Short answer:** A Content Delivery Network: servers around the world that cache your static assets, and sometimes HTML, close to users. It means lower latency and less load on your origin server.

---

## 🟡 Level 2 — Intermediate: Loading Performance

**Q11. How do you improve LCP?**

**Short answer:** Break LCP into four parts and fix the biggest one:

**LCP = TTFB + resource load delay + resource load time + element render delay**

| Part | Meaning | Fixes |
|---|---|---|
| TTFB | server and network | CDN, cached HTML, faster SSR, edge rendering |
| Load delay | time before the LCP resource *starts* downloading | put it in the HTML (not a CSS background or JS-injected), `preload`, `fetchpriority="high"`, never lazy-load it |
| Load time | download duration | AVIF/WebP, right size (`srcset`), CDN |
| Render delay | downloaded but not yet painted | less render-blocking CSS/JS, inline critical CSS, server-render above-the-fold content |

**Say it like this:** "I never just say 'optimise images'. I break LCP into its four parts in the DevTools trace. Usually one dominates. On one page it was load delay: the hero image was a CSS background, discovered only after the CSS loaded. Switching to an `<img>` with `fetchpriority="high"` fixed most of it."

---

**Q12. How do you fix CLS?**

**Short answer:** Reserve space for everything that loads late:

- `width` and `height` (or `aspect-ratio`) on images, video and embeds.
- Skeletons with the real final dimensions.
- Never insert banners *above* existing content; use overlays instead.
- Font metric overrides (`size-adjust`) or `font-display: optional`.
- Animate with `transform`, not layout properties.

---

**Q13. How do you improve INP?**

**Short answer:**

- **Break up long tasks:** yield to the main thread with `scheduler.yield()` or by chunking work with `setTimeout`.
- **Do less in event handlers:** defer non-urgent updates with `startTransition`.
- **Reduce React re-render scope:** colocate state, `memo`, virtualise.
- **Move heavy computation to Web Workers.**
- **Ship less JavaScript and less hydration:** Server Components, islands.
- **Avoid layout thrashing** inside handlers.

**Say it like this:** "INP has three parts: input delay (the main thread was already busy), processing time (my handlers plus React rendering), and presentation delay (layout and paint). The Performance panel shows which one dominates, and I fix that part."

---

**Q14. What are the code-splitting strategies?**

**Short answer:**

- **Route-based:** each page is its own chunk.
- **Component-based:** heavy widgets like the video SDK, charts, rich-text editors and PDF viewers.
- **Vendor splitting.**
- **Conditional features:** load admin-only code only for admins.

Prefetch likely next chunks on hover or when the browser is idle.

```tsx
const AnalyticsPage = lazy(() => import('./AnalyticsPage'));   // charts only load here
```

---

**Q15. How does tree shaking work, and why does it fail?**

**Short answer:** Bundlers remove unused ES module exports. It fails with CommonJS modules, side-effectful imports, "barrel" files that re-export everything, and `import * as`. Fix it by using ESM libraries (`lodash-es`), setting `"sideEffects": false` in `package.json`, and importing directly.

```ts
import _ from 'lodash';                    // ❌ whole library (~70 KB)
import debounce from 'lodash-es/debounce'; // ✅ only what you use
```

---

**Q16. How do you analyse bundles?**

**Short answer:** Use `rollup-plugin-visualizer` (Vite), `webpack-bundle-analyzer`, `@next/bundle-analyzer` or `source-map-explorer`. Look for duplicate packages, huge libraries (moment.js, full icon sets) and polyfills you don't need.

---

**Q17. What are performance budgets?**

**Short answer:** Limits enforced in CI, for example "main route JS ≤ 200 KB gzipped" or "Lighthouse LCP ≤ 2.5 s". A regression fails the build or posts a warning on the PR, so performance doesn't silently degrade.

---

**Q18. What's a good caching strategy for static assets?**

**Short answer:** Use content-hashed filenames (`app.3f2a1c.js`) with `Cache-Control: public, max-age=31536000, immutable`, so they're cached for a year. Serve HTML with `no-cache` (revalidate on every visit), so new deploys are picked up immediately. Use `ETag` or `Last-Modified` for revalidation.

**Say it like this:** "Hashed files can be cached forever, because a changed file gets a new name. The HTML is never cached long, because it's what points to the new hashed files."

---

**Q19. How should you compress?**

**Short answer:** Brotli for text assets (about 15–20% smaller than gzip), pre-compressed at build time. Don't re-compress images or video, since they're already compressed.

---

**Q20. What do HTTP/2 and HTTP/3 change?**

**Short answer:** HTTP/2 sends many requests in parallel over one connection (multiplexing), so concatenating everything into one file is less important. HTTP/3 runs over QUIC (UDP) and avoids TCP head-of-line blocking, so one lost packet doesn't stall everything. That's a real gain on lossy mobile or hospital Wi-Fi.

---

**Q21. Which resource hints matter?**

**Short answer:** `preconnect` (API, CDN, the LiveKit signalling host), `dns-prefetch`, `preload` (LCP image, critical font), `prefetch` (the next route) and `modulepreload`. **Overusing preload backfires**, because it competes with genuinely critical resources.

---

**Q22. What's on the image optimisation checklist?**

**Short answer:**

- AVIF or WebP with a fallback.
- Responsive `srcset` and `sizes`.
- Correct intrinsic dimensions.
- Lazy-load below the fold.
- `decoding="async"`.
- CDN resizing.
- SVG for icons.
- Compressed thumbnails.

---

**Q23. How do you optimise fonts?**

**Short answer:**

- Self-host WOFF2 files.
- Subset them to the characters you use.
- Preload the critical font.
- Use `font-display: swap` or `optional`.
- Limit the number of weights and families, or use variable fonts.
- Use metric-matched fallbacks to avoid layout shift.

---

**Q24. How do you handle third-party scripts?**

**Short answer:** They're often the single biggest cost on a page.

- Audit them, and remove unused tags.
- Load them with `async` or `defer`.
- Delay them until interaction or idle time.
- Use the **facade pattern**: a static placeholder for chat widgets or YouTube embeds that loads the real thing on click.
- Move them to a worker with Partytown.

---

**Q25. What are the performance trade-offs of the rendering strategies?**

**Short answer:**

- **CSR:** slow first paint and heavy JavaScript.
- **SSR:** fast first paint, but server cost and hydration cost.
- **SSG and ISR:** the fastest, with a risk of stale data.
- **Streaming and RSC:** the shell arrives quickly and less client JavaScript ships.

---

**Q26. How do you reduce hydration cost?**

**Short answer:** Ship less client JavaScript (Server Components), lazy-hydrate components below the fold, use an islands architecture, and avoid giant client-side providers wrapping the whole app.

---

**Q27. How do service workers help performance?**

**Short answer:** Precache the app shell and static assets so repeat visits are instant, and use stale-while-revalidate for semi-static data. Never cache authenticated or sensitive API responses.

---

## 🟡 Intermediate: Runtime Performance

**Q28. What is the browser rendering pipeline, and what does each step cost?**

**Short answer:** JavaScript → Style → Layout → Paint → Composite. Layout changes are the most expensive, and `transform` and `opacity` changes can skip straight to compositing.

---

**Q29. What is layout thrashing?**

```js
// ❌ Bad: read → write → read → write… forces layout every iteration
items.forEach((el) => { el.style.height = el.offsetWidth + 'px'; });

// ✅ Good: all reads first, then all writes
const widths = items.map((el) => el.offsetWidth);
items.forEach((el, i) => { el.style.height = widths[i] + 'px'; });
```

**Short answer:** Interleaving layout *reads* (`offsetHeight`, `getBoundingClientRect`) with style *writes* forces the browser to recalculate layout repeatedly. Batch the reads, then the writes.

---

**Q30. Why use `requestAnimationFrame` for visual updates?**

**Short answer:** It schedules DOM writes just before the next paint and lets you merge many updates into one per frame. Streaming tokens and audio levels are good examples: 100 updates per second become 60 paints, done in batches.

---

**Q31. How do you handle frequent events?**

**Short answer:** Throttle scroll, resize and mousemove, and debounce search and autosave. Use **passive** listeners (`{ passive: true }`) for touch and wheel events, so scrolling isn't blocked.

---

**Q32. What is virtualisation?**

**Short answer:** Rendering only the rows visible on screen (TanStack Virtual, react-window). It's essential for thousands of calls, chat messages or transcript lines. 10,000 DOM rows is slow, while about 30 visible rows is fast.

---

**Q33. What does `content-visibility: auto` do?**

**Short answer:** The browser skips rendering sections that are off screen. Pair it with `contain-intrinsic-size` so the scrollbar doesn't jump.

---

**Q34. What React-specific optimisations are there?**

**Short answer:** Profile first. Then:

- Colocate state and split contexts.
- Use `memo` with stable props.
- Use `useMemo` for expensive derived data.
- Use `useTransition` or `useDeferredValue` for non-urgent updates.
- Virtualise long lists and lazy-load heavy components.
- Don't define components inside other components.
- Keep keys stable.
- Use the React Compiler.

---

**Q35. When do you use Web Workers for performance?**

**Short answer:** To move CPU-heavy work off the main thread: parsing large JSON or CSV files, computing analytics, diffing transcripts, encryption. Transfer `ArrayBuffer`s instead of copying them.

---

**Q36. How does memory affect performance?**

**Short answer:** Leaks cause longer garbage-collection pauses and eventually crash tabs, especially on tablets. Use heap snapshots and allocation timelines, look for detached DOM nodes, and cap in-memory caches.

---

**Q37. How do you optimise network requests?**

**Short answer:**

- Avoid waterfalls by running requests in parallel.
- Deduplicate and cache them with a query library.
- Paginate, and request only the fields you need.
- Compress responses.
- Use HTTP caching for GETs.
- Batch requests where it makes sense.

---

**Q38. What is optimistic UI?**

**Short answer:** Update the UI immediately when the user acts, then reconcile with the server's response (rolling back if it fails). It makes the app *feel* instant.

---

**Q39. What techniques improve perceived performance?**

**Short answer:**

- Skeleton screens with the real dimensions.
- Progressive rendering.
- Instant feedback on click (a pressed state). Show a spinner only after about 300 ms, to avoid flicker.
- Prefetch on hover.
- Keep the previous data visible while the next page loads.

---

## 🔴 Level 3 — Advanced

**Q40. How do you measure performance in production?**

```ts
import { onLCP, onINP, onCLS, type Metric } from 'web-vitals/attribution';

const send = (m: Metric) =>
  navigator.sendBeacon('/rum', JSON.stringify({
    name: m.name,
    value: m.value,
    id: m.id,
    attribution: m.attribution,   // which element / which interaction
    route: location.pathname,
  }));

onLCP(send); onINP(send); onCLS(send);
```

**Short answer:** The `web-vitals` library (the attribution build tells you *which* element or interaction was slow) sends data to an analytics endpoint. Segment it by route, device, network and tenant, build p75 dashboards (Grafana, Datadog), and alert on regressions.

---

**Q41. How do you create custom metrics with User Timing?**

```ts
performance.mark('join-click');
// …later, when the first remote video frame renders:
performance.mark('first-remote-frame');
performance.measure('join-latency', 'join-click', 'first-remote-frame');
```

**Short answer:** Mark the business-critical moments, measure between them, collect the results with `PerformanceObserver`, and send them to your RUM pipeline. That's how you measure something like "join latency" honestly.

---

**Q42. What is the Long Animation Frames (LoAF) API?**

**Short answer:** It attributes slow frames to specific scripts (which file, which function), which makes INP debugging much easier than the plain long-tasks API. Check browser support.

---

**Q43. How do you debug INP in DevTools?**

**Short answer:** Record the interaction in the Performance panel and look at the Interactions track. Break the time into **input delay** (the main thread was busy), **processing time** (your handlers plus React rendering) and **presentation delay** (style, layout and paint). Then fix the largest part.

---

**Q44. What is the islands architecture, or partial hydration?**

**Short answer:** The page is static HTML with small, isolated interactive "islands" that hydrate independently (Astro, and conceptually React Server Components). Far less JavaScript runs than with full SPA hydration.

---

**Q45. How do you render or cache HTML at the edge?**

**Short answer:** Render or cache pages at CDN edge locations close to users. Vary the cache by cookie or tenant *very carefully*, and use stale-while-revalidate headers:

`Cache-Control: s-maxage=60, stale-while-revalidate=300`

---

**Q46. What is the back/forward cache (bfcache)?**

**Short answer:** The browser keeps a page in memory, so pressing Back is instant. `unload` handlers and some open connections block it. Use `pagehide` and `pageshow` instead, and close or reopen sockets in those events.

---

**Q47. What are Speculation Rules?**

```html
<script type="speculationrules">
{ "prerender": [{ "where": { "href_matches": "/calls/*" }, "eagerness": "moderate" }] }
</script>
```

**Short answer:** They tell supporting browsers to prefetch or fully prerender likely next pages, which makes navigation near-instant.

---

**Q48. Why is JavaScript expensive on low-end devices?**

**Short answer:** Byte for byte, JavaScript costs more than images, because it must be parsed, compiled *and* executed on the main thread. A 1 MB bundle might take 2–4 seconds of CPU on a budget Android phone. Ship less JavaScript, and don't ship unnecessary polyfills to modern browsers.

---

**Q49. What's a sensible polyfill strategy?**

**Short answer:** Target modern browsers with `browserslist`, add differential loading only if old browsers really matter, and don't polyfill everything by default.

---

**Q50. How do you optimise a design system for performance?**

**Short answer:** Make it tree-shakable ESM with per-component entry points, avoid a global CSS-in-JS runtime, import icons individually, avoid huge dependencies, and measure each component's bundle cost.

---

**Q51. How do you build a performance culture in a team?**

**Short answer:** Budgets in CI, RUM dashboards per release, a performance section in the PR template for heavy features, regular audits, and clear ownership of the key metrics.

**Say it like this:** "Performance regresses one innocent PR at a time. Budgets in CI and a dashboard per release catch it early, while it's still easy to fix."

---

## 🎥 Real-Time and Video Performance (Your Domain)

**Background:** In a video call, each participant **publishes** their camera and microphone and **subscribes** to others' tracks. An **SFU** (Selective Forwarding Unit, such as the LiveKit server) receives every published stream and forwards it to subscribers without re-encoding. Performance means fast joins, low bandwidth and CPU use, and a smooth UI.

**Q52. What are the main performance concerns in a video app?**

**Short answer:** Join time, bandwidth, CPU and battery (encoding and decoding video), memory (many video elements), main-thread jank from UI updates, and reconnection speed.

---

**Q53. What is simulcast?**

**Short answer:** The publisher sends several encodings of the same video, for example high (720p), medium (360p) and low (180p). The SFU forwards the right layer to each subscriber based on their bandwidth and how big the tile is on their screen.

---

**Q54. What are adaptive stream and dynacast in LiveKit?**

**Short answer:** **Adaptive stream:** each subscriber asks for a resolution that matches the rendered size of the video element, and video is paused for hidden tiles. **Dynacast:** the publisher *stops encoding* layers that nobody is consuming, which saves CPU and upload bandwidth.

**Say it like this:** "With both on, a small thumbnail tile receives a 180p stream, and if nobody needs the 720p layer, the publisher stops encoding it. That made a big difference on hospital tablets."

---

**Q55. What are SVC codecs (VP9, AV1)?**

**Short answer:** Scalable Video Coding sends one stream with built-in spatial and temporal layers, and the SFU can drop layers per subscriber. It gives similar benefits to simulcast with better efficiency, but device support and CPU cost vary.

---

**Q56. How do you reduce join latency?**

**Short answer:**

- Prefetch the room token on page load or on hover.
- Preconnect to the signalling and TURN hosts.
- Warm up `getUserMedia` on the pre-join screen.
- Lazy-load the SDK *before* the user clicks Join.
- Pick the nearest region or SFU.
- Avoid serial API calls before connecting.

---

**Q57. How do you render many participants efficiently?**

**Short answer:** Paginate the tiles and render video only for visible participants (off-screen participants are audio-only). Use an active-speaker layout, and key tiles stably so `<video>` elements aren't remounted.

---

**Q58. How do you show speaking indicators without re-render storms?**

**Short answer:** Audio levels change many times per second. Keep them out of React state: update a CSS variable or class directly through a ref inside `requestAnimationFrame`, and throttle.

---

**Q59. What optimisations help low-end tablets?**

**Short answer:**

- Lower the publish resolution and frame rate.
- Disable background blur and effects.
- Limit the number of visible tiles.
- Reduce animations.
- Monitor memory.
- Fall back to audio-only on a poor network.

---

**Q60. How do you show network quality?**

**Short answer:** Use the SDK's connection-quality events to show a simple good/fair/poor badge. Downgrade video automatically and tell the user why.

---

## 🧩 Level 4 — Scenario-Based

**Q61. "Our dashboard LCP is 5 s on mobile." Walk me through it.**

**Answer:**

1. **Check field data** per route and device to confirm it and see who's affected.
2. **Trace it** in Lighthouse or WebPageTest to find *which element* is the LCP.
3. **Break LCP into its four parts** (TTFB, load delay, load time, render delay).
4. **Fix the biggest part.** Typical fixes: server-render above-the-fold content, preload the hero data or image, reduce render-blocking JavaScript, use a CDN.
5. **Re-measure p75** in the field after the release.

**Say it like this:** "I start with data, not guesses. Most often the LCP element was rendered client-side after a big JS bundle and an API call. Server-rendering the first view, or at least showing a skeleton with the real content first, usually halves it."

---

**Q62. Typing into a filter input feels laggy (INP is 600 ms).**

**Answer:** Profile the interaction. The usual finding is that React re-renders a 5,000-row table on every keystroke. Fixes: `useDeferredValue` or debouncing, virtualisation, memoised rows, server-side filtering. Then show the before and after INP.

---

**Q63. The bundle grew from 250 KB to 900 KB after adding a feature.**

**Answer:** The bundle analyser found the full icon library, a charting library and moment.js. Fixes: per-icon imports, lazy-loading charts on the analytics route only, and replacing moment with `Intl` or date-fns. Then add a budget in CI so it can't happen again.

---

**Q64. CLS is 0.3 on the call list page.**

**Answer:** Three culprits: images without dimensions, a late-loading "new calls" banner pushing content down, and a font swap. Reserve space, show the banner as an overlay, and use a size-adjusted fallback font.

---

**Q65. The app becomes sluggish after an hour-long call.**

**Answer:** A memory leak or unbounded arrays (chat, events, transcript). Compare heap snapshots, cap buffers, virtualise lists, clean up listeners, and check for SDK event subscriptions created on every render.

---

**Q66. A third-party analytics script blocks the main thread on load.**

**Answer:** Load it after interaction or idle, send events with `sendBeacon`, move it to a worker (Partytown), or switch to server-side analytics.

---

**Q67. API responses are slow and the page waits on five sequential calls.**

**Answer:** Run independent calls in parallel, add a BFF endpoint that aggregates them, cache, and render progressively with Suspense or skeletons.

---

**Q68. Users on hospital Wi-Fi have long join times.**

**Answer:** Hospital networks often block UDP. Add TURN over TLS on port 443 as a fallback, reduce pre-join steps, prefetch the token, use a regional SFU, and measure ICE connection time separately to find the real bottleneck.

---

## 🎯 From Your Resume

**Q69. "How did you achieve a join latency under 5 seconds?"**

**Answer guidance:** Explain what you measured (click Join → connected → first remote frame), the main contributors you found, and the concrete changes you made.

**Say it like this:** "We defined join latency as the time from clicking Join to the first remote video frame rendering, measured with User Timing marks sent to our monitoring. The biggest contributors were serial API calls before connecting, the SDK loading only on click, and the camera permission prompt. We prefetched the token on the pre-join screen, warmed up the camera there, lazy-loaded the SDK while the user was on that screen, and connected to the nearest region."

*If you don't remember exact before-and-after numbers, say what you'd measure. Don't invent numbers.*

---

**Q70. "Your SSE chat streams tokens. How did you keep rendering smooth?"**

**Say it like this:** "Tokens were buffered in a ref and flushed to the screen once per animation frame instead of once per token. Markdown was rendered incrementally on completed blocks, long histories were virtualised, and only the streaming message re-rendered, never the whole list."

---

**Q71. "BpoBox dashboards serve 1,500 users. What did you optimise?"**

**Say it like this:** "Server-side aggregation and pagination, so the browser never received raw data. Virtualised tables, cached queries with a sensible `staleTime`, charts lazy-loaded on the analytics tab, prefetching on hover, and URL-driven filters so a refresh didn't lose state." *(Mention RUM numbers if you have them.)*

---

**Q72. "How did self-hosting LiveKit support 10x traffic?"**

**Say it like this:** "That's a design projection, and I'll be precise about it. The architecture scales horizontally: SFU nodes behind Redis-based routing, autoscaling policies, a CDN for static assets, and Prometheus and Grafana dashboards to watch CPU, bandwidth and packet loss. To validate the 10x claim, I'd run load tests with LiveKit's load-testing tool and find where each node saturates."
