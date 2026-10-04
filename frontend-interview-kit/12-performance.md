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

Every answer below has four parts: **Short answer** (say this first), **Explanation** (add if asked for more), **Example** (code or a real situation) and **Say it like this** (a sample spoken answer).

## 🟢 Level 1 — Basics

**Q1. Why does frontend performance matter?**

**Short answer:** It drives conversions and engagement, affects SEO through Core Web Vitals, and decides whether the app works on cheap phones and slow networks.

**Explanation:** In healthcare and call centres, performance is directly user time: a slow join delays a patient, a slow dashboard costs reviewers minutes.

**Example:** Cutting InterpretIQ's join time to under 5 seconds meant patients reached an interpreter faster.

**Say it like this:** "Performance is a feature. For InterpretIQ a slow join means a patient waiting; for BpoBox a slow dashboard wastes reviewers' minutes on every call."

---

**Q2. What are Core Web Vitals?**

**Short answer:** LCP (loading, ≤ 2.5 s), INP (responsiveness, ≤ 200 ms) and CLS (visual stability, ≤ 0.1), judged at the 75th percentile of real users.

**Explanation:** INP replaced FID in 2024 and covers every interaction, not just the first.

**Example:** A dashboard with LCP 3.8 s, INP 450 ms and CLS 0.02 has a loading and responsiveness problem but stable layout.

**Say it like this:** "LCP is 'is it loading?', INP is 'does it respond?', CLS is 'does it jump?' I track all three at p75 from real users."

---

**Q3. What other metrics are important?**

**Short answer:** TTFB, FCP, TBT, Speed Index and long tasks.

**Explanation:** TTFB isolates server and network time; TBT is a lab proxy for INP; long tasks (> 50 ms) explain poor responsiveness.

**Example:** High TTFB with fine render times points to the server or CDN, not the frontend code.

**Say it like this:** "Supporting metrics tell me where in the pipeline the time goes, so I fix the right layer."

---

**Q4. Lab data vs field data?**

**Short answer:** Lab data (Lighthouse, DevTools) is reproducible for debugging; field data (CrUX, `web-vitals`) is what real users experience.

**Explanation:** Decide with field data, debug with lab data.

**Example:** Lighthouse on a MacBook shows LCP 1.2 s; field data shows 4.8 s for Android users on 3G.

**Say it like this:** "Lighthouse is my microscope; real-user data is the truth I'm accountable to."

---

**Q5. What are the basic tools?**

**Short answer:** Chrome DevTools (Performance, Network, Coverage, Memory, Lighthouse), PageSpeed Insights, WebPageTest, the React Profiler and bundle analysers.

**Explanation:** Each answers a different question: what's slow, what's big, what's unused, what's leaking.

**Example:** Coverage showed 70% unused JS; the bundle analyser showed which library it came from.

**Say it like this:** "I pick the tool by question: Performance panel for slowness, Coverage and analysers for size, Memory for leaks."

---

**Q6. What's on a quick-wins checklist?**

**Short answer:** Compression, caching, image optimisation, lazy loading, route code splitting, deferred JS, preconnect and removing unused dependencies.

**Explanation:** These are cheap, low-risk changes that often give large improvements.

**Example:** Enabling Brotli and immutable caching for hashed assets cut repeat-visit load time in half.

**Say it like this:** "Before deep work I check the basics: compression, caching, image sizes and code splitting."

---

**Q7. What is a long task?**

**Short answer:** Any main-thread task over 50 ms; during it the page can't respond to input.

**Explanation:** Long tasks are the main cause of poor INP.

**Example:** Filtering 5,000 rows synchronously in a click handler creates a 300 ms long task.

**Say it like this:** "Long tasks block input, so I break them up or move them off the main thread."

---

**Q8. Why are images so often the biggest problem?**

**Short answer:** They're usually the heaviest bytes and often the LCP element.

**Explanation:** Wrong formats, oversized dimensions and late discovery (like CSS backgrounds) all hurt LCP and bandwidth.

**Example:** A 2 MB PNG hero image re-encoded as a 120 KB AVIF at the right size improved LCP by over a second on mobile.

**Say it like this:** "Images are usually the cheapest big win: right format, right size, discovered early."

---

**Q9. What is lazy loading?**

**Short answer:** Loading resources only when needed: `loading="lazy"` for media, `React.lazy`/`import()` for code, IntersectionObserver for custom cases.

**Explanation:** It reduces initial work but must never apply to above-the-fold or LCP content.

**Example:** Charts on the analytics tab load only when the tab opens.

**Say it like this:** "Anything not needed for the first screen loads later, except the LCP element."

---

**Q10. What is a CDN, and why use one?**

**Short answer:** A network of servers that cache assets close to users.

**Explanation:** Lower latency and less load on your origin; some CDNs also cache HTML at the edge.

**Example:** Serving JS from CloudFront in Mumbai instead of an origin in the US cut asset latency dramatically for Indian users.

**Say it like this:** "A CDN puts static files physically closer to users, which cuts latency for free."

---

## 🟡 Level 2 — Intermediate: Loading Performance

**Q11. How do you improve LCP?**

**Short answer:** Break LCP into TTFB, resource load delay, load time and render delay, and fix the largest part.

**Explanation:** TTFB → CDN/SSR caching; load delay → put the resource in HTML, preload, `fetchpriority`; load time → smaller formats; render delay → less render-blocking JS/CSS.

**Example:** The hero was a CSS background discovered late; switching to `<img fetchpriority="high">` removed most of the load delay.

**Say it like this:** "I never just say 'optimise images'; I find which of the four LCP parts dominates and fix that one."

---

**Q12. How do you fix CLS?**

**Short answer:** Reserve space for late content, don't insert above existing content, match font metrics, and animate with transform.

**Explanation:** CLS comes from content of unknown size appearing after layout.

**Example:**

```html
<img src="thumb.jpg" width="320" height="180" alt="">
```

**Say it like this:** "Most CLS fixes are just giving the browser dimensions before the content arrives."

---

**Q13. How do you improve INP?**

**Short answer:** Break up long tasks, do less in handlers, reduce re-render scope, move heavy work to workers, and ship less JavaScript.

**Explanation:** INP = input delay + processing time + presentation delay; the Performance panel shows which dominates.

**Example:** Wrapping a table filter update in `startTransition` and virtualising the table cut INP from 600 ms to under 150 ms.

**Say it like this:** "I measure which part of INP dominates, then either free the main thread or reduce the work done per interaction."

---

**Q14. What are the code-splitting strategies?**

**Short answer:** Route-based, component-based for heavy widgets, vendor splitting, and conditional loading by permission or flag.

**Explanation:** Prefetch likely next chunks on hover or idle to hide the cost.

**Example:**

```tsx
const AnalyticsPage = lazy(() => import('./AnalyticsPage'));
```

**Say it like this:** "Each route and heavy widget is its own chunk, so users download only what they use."

---

**Q15. How does tree shaking work, and why does it fail?**

**Short answer:** Bundlers remove unused ESM exports; it fails with CommonJS, side-effectful imports, barrel files and `import *`.

**Explanation:** Use ESM libraries, `"sideEffects": false`, and direct imports.

**Example:**

```ts
import _ from 'lodash';                    // whole library
import debounce from 'lodash-es/debounce'; // only debounce
```

**Say it like this:** "Tree shaking needs static ESM imports; one CommonJS import can pull in a whole library."

---

**Q16. How do you analyse bundles?**

**Short answer:** Use a bundle visualiser (rollup-plugin-visualizer, webpack-bundle-analyzer, `@next/bundle-analyzer`) and look for duplicates and heavy libraries.

**Explanation:** Common findings: moment.js, full icon sets, duplicate React versions, unnecessary polyfills.

**Example:** The treemap showed a 300 KB icon library used for 12 icons; per-icon imports removed it.

**Say it like this:** "The treemap makes heavy dependencies obvious, and that's usually where the big wins are."

---

**Q17. What are performance budgets?**

**Short answer:** Limits enforced in CI, like "main route JS ≤ 200 KB gzipped" or "LCP ≤ 2.5 s".

**Explanation:** Regressions fail the build or warn on the PR, so performance doesn't degrade silently.

**Example:** `size-limit` in CI fails a PR that adds 80 KB to the main chunk.

**Say it like this:** "Budgets catch regressions in the PR that causes them, when they're cheap to fix."

---

**Q18. What's a good caching strategy for static assets?**

**Short answer:** Hashed filenames with `Cache-Control: public, max-age=31536000, immutable`, and HTML with `no-cache`.

**Explanation:** Changed files get new names, so they can be cached forever; HTML always revalidates so new deploys appear immediately.

**Example:** `app.3f2a1c.js` cached for a year; `index.html` revalidated every visit.

**Say it like this:** "Hashed files cache forever; HTML never caches long, because it points to the new hashed files."

---

**Q19. How should you compress?**

**Short answer:** Brotli for text assets, pre-compressed at build time; don't re-compress images or video.

**Explanation:** Brotli is about 15–20% smaller than gzip for JS and CSS.

**Example:** A 600 KB JS bundle becomes ~150 KB with Brotli.

**Say it like this:** "Text gets Brotli; media is already compressed."

---

**Q20. What do HTTP/2 and HTTP/3 change?**

**Short answer:** HTTP/2 multiplexes many requests over one connection; HTTP/3 uses QUIC over UDP to avoid head-of-line blocking.

**Explanation:** Concatenating everything into one file matters less now; HTTP/3 helps most on lossy networks.

**Example:** On hospital Wi-Fi with packet loss, HTTP/3 keeps other requests flowing when one packet is lost.

**Say it like this:** "With HTTP/2 I split code freely; HTTP/3 helps users on unreliable networks."

---

**Q21. Which resource hints matter?**

**Short answer:** `preconnect`, `dns-prefetch`, `preload`, `prefetch` and `modulepreload`.

**Explanation:** Overusing preload competes with critical resources, so use it for one or two items.

**Example:**

```html
<link rel="preconnect" href="https://livekit.interpretiq.com">
<link rel="preload" as="image" href="/hero.avif" fetchpriority="high">
```

**Say it like this:** "I preconnect to media servers and preload only the LCP image and main font."

---

**Q22. What's on the image optimisation checklist?**

**Short answer:** AVIF/WebP with fallback, `srcset`/`sizes`, intrinsic dimensions, lazy-loading below the fold, `decoding="async"`, CDN resizing and SVG icons.

**Explanation:** Each item reduces bytes or prevents layout shift.

**Example:** `<img srcset="a-400.avif 400w, a-800.avif 800w" sizes="50vw" width="800" height="450" loading="lazy" decoding="async" alt="">`.

**Say it like this:** "Right format, right size, reserved space, and lazy unless it's the hero."

---

**Q23. How do you optimise fonts?**

**Short answer:** Self-host WOFF2, subset, preload the critical font, use `font-display`, limit weights, and use metric-matched fallbacks.

**Explanation:** Fonts block text rendering and can cause layout shift on swap.

**Example:** Reducing from 6 font files to one variable font and subsetting to Latin cut font bytes by 70%.

**Say it like this:** "Fewer, smaller, self-hosted fonts with matched fallbacks: faster text and no layout shift."

---

**Q24. How do you handle third-party scripts?**

**Short answer:** Audit them, load async or deferred, delay until interaction, use facades, move to workers, and remove unused tags.

**Explanation:** They're often the biggest main-thread cost on a page.

**Example:** A chat widget replaced by a static "Chat with us" button that loads the real widget on click saved 400 ms of main-thread time.

**Say it like this:** "Third parties load as late as possible, and every tag has to justify its cost."

---

**Q25. What are the performance trade-offs of the rendering strategies?**

**Short answer:** CSR: slow first paint, heavy JS. SSR: fast first paint, server and hydration cost. SSG/ISR: fastest, staleness risk. Streaming/RSC: quick shell, less client JS.

**Explanation:** Choose per route based on freshness and interactivity.

**Example:** Marketing pages SSG; dashboard SSR shell with streamed widgets.

**Say it like this:** "Rendering strategy is a performance decision per route, not one choice for the whole app."

---

**Q26. How do you reduce hydration cost?**

**Short answer:** Ship less client JS with Server Components, lazy-hydrate below the fold, use islands, and avoid giant root providers.

**Explanation:** Hydration runs every client component's code before the page becomes interactive.

**Example:** Moving a static FAQ section to a Server Component removed its JS and hydration entirely.

**Say it like this:** "The cheapest hydration is no hydration, so static parts stay on the server."

---

**Q27. How do service workers help performance?**

**Short answer:** Precache the app shell and static assets for instant repeat visits, with stale-while-revalidate for semi-static data.

**Explanation:** Never cache authenticated or sensitive responses.

**Example:** InterpretIQ's shell opened instantly from cache on clinic tablets.

**Say it like this:** "The service worker makes repeat visits instant by serving the shell from cache."

---

## 🟡 Intermediate: Runtime Performance

**Q28. What is the browser rendering pipeline, and what does each step cost?**

**Short answer:** JavaScript → Style → Layout → Paint → Composite; layout is the most expensive, and transform/opacity can skip to composite.

**Explanation:** Knowing which step a change triggers tells you how expensive it is.

**Example:** Animating `left` triggers layout every frame; animating `transform` only composites.

**Say it like this:** "I keep hot paths on compositor-only properties to skip layout and paint."

---

**Q29. What is layout thrashing?**

**Short answer:** Interleaving layout reads and style writes, forcing repeated synchronous layouts.

**Explanation:** Batch reads, then writes.

**Example:**

```js
const widths = items.map((el) => el.offsetWidth);
items.forEach((el, i) => { el.style.height = widths[i] + 'px'; });
```

**Say it like this:** "Read everything first, then write everything, so layout runs once."

---

**Q30. Why use `requestAnimationFrame` for visual updates?**

**Short answer:** It runs right before the next paint, letting you batch many updates into one per frame.

**Explanation:** Streaming tokens or audio levels can update far more often than the screen refreshes.

**Example:** 100 token updates per second become 60 paints with one batched flush per frame.

**Say it like this:** "rAF matches updates to the display's refresh, so nothing renders more often than it can be seen."

---

**Q31. How do you handle frequent events?**

**Short answer:** Throttle scroll, resize and mousemove; debounce search and autosave; use passive listeners for touch and wheel.

**Explanation:** Passive listeners promise not to call `preventDefault`, so scrolling isn't blocked.

**Example:** `addEventListener('scroll', throttle(onScroll, 100), { passive: true })`.

**Say it like this:** "High-frequency events are throttled or debounced, and scroll listeners are passive."

---

**Q32. What is virtualisation?**

**Short answer:** Rendering only visible rows of a long list.

**Explanation:** It keeps DOM size and render time constant regardless of data length.

**Example:** A transcript with 5,000 lines renders about 40 DOM nodes at a time with TanStack Virtual.

**Say it like this:** "Long lists are virtualised, so they scroll smoothly no matter how big they get."

---

**Q33. What does `content-visibility: auto` do?**

**Short answer:** The browser skips rendering off-screen sections until they're near the viewport.

**Explanation:** Pair it with `contain-intrinsic-size` to keep the scrollbar stable.

**Example:**

```css
.history-section { content-visibility: auto; contain-intrinsic-size: auto 800px; }
```

**Say it like this:** "For long pages, `content-visibility` skips work on sections nobody is looking at yet."

---

**Q34. What React-specific optimisations are there?**

**Short answer:** Profile first, then colocate state, split context, memoise with stable props, defer non-urgent updates, virtualise and lazy-load.

**Explanation:** Avoid components defined inside components, and keep keys stable; the React Compiler automates much memoisation.

**Example:** Moving filter state into the filter bar stopped the whole dashboard re-rendering on each keystroke.

**Say it like this:** "In React, most wins come from rendering less: colocated state, narrow subscriptions and memoisation where measured."

---

**Q35. When do you use Web Workers for performance?**

**Short answer:** To move CPU-heavy work like parsing, analytics, diffing and encryption off the main thread.

**Explanation:** Transfer `ArrayBuffer`s instead of copying them.

**Example:** Parsing a large CSV export in a worker kept the UI responsive while a progress bar updated.

**Say it like this:** "If a computation would block input, it goes to a worker."

---

**Q36. How does memory affect performance?**

**Short answer:** Leaks cause longer GC pauses and eventually crash tabs, especially on tablets.

**Explanation:** Use heap snapshots, allocation timelines and detached-node checks, and cap caches.

**Example:** An hour-long call slowed down because audio-level listeners accumulated; cleaning them up kept memory flat.

**Say it like this:** "Memory leaks show up as slowness over time, so long sessions get heap-snapshot testing."

---

**Q37. How do you optimise network requests?**

**Short answer:** Avoid waterfalls, deduplicate and cache, paginate, request only needed fields, compress, use HTTP caching and batch where sensible.

**Explanation:** Fewer, smaller, parallel requests beat many sequential ones.

**Example:** Replacing five sequential dashboard calls with one BFF endpoint cut load time from 2.1 s to 0.6 s.

**Say it like this:** "I look for waterfalls first; parallelising or aggregating requests is often the biggest win."

---

**Q38. What is optimistic UI?**

**Short answer:** Updating the UI immediately on user action and reconciling with the server response.

**Explanation:** It makes the app feel instant; roll back with a message if the server rejects the change.

**Example:** A "like" or a scorecard status toggle updates instantly and reverts if the save fails.

**Say it like this:** "Optimistic updates hide network latency for actions that almost always succeed."

---

**Q39. What techniques improve perceived performance?**

**Short answer:** Skeletons with real dimensions, progressive rendering, instant feedback, delayed spinners, prefetch on hover, and keeping previous data while loading.

**Explanation:** Users judge speed by feedback, not only by total load time.

**Example:** Showing the previous page of results while the next loads feels faster than a blank table with a spinner.

**Say it like this:** "Perceived speed is about immediate feedback and never showing an empty screen."

---

## 🔴 Level 3 — Advanced

**Q40. How do you measure performance in production?**

**Short answer:** Send `web-vitals` data (with attribution) to an analytics endpoint, segment it, and build p75 dashboards with alerts.

**Explanation:** Attribution tells you which element or interaction was slow; segmentation by route, device and tenant shows who's affected.

**Example:**

```ts
import { onLCP, onINP, onCLS, type Metric } from 'web-vitals/attribution';
const send = (m: Metric) => navigator.sendBeacon('/rum', JSON.stringify({ name: m.name, value: m.value, attribution: m.attribution, route: location.pathname }));
onLCP(send); onINP(send); onCLS(send);
```

**Say it like this:** "Real-user metrics per route and device, with alerts on regressions, are how I know performance is actually good."

---

**Q41. How do you create custom metrics with User Timing?**

**Short answer:** Mark business-critical moments with `performance.mark` and measure between them.

**Explanation:** Collect with `PerformanceObserver` and send to RUM; this is how you measure things like join latency honestly.

**Example:**

```ts
performance.mark('join-click');
// …first remote frame rendered:
performance.mark('first-remote-frame');
performance.measure('join-latency', 'join-click', 'first-remote-frame');
```

**Say it like this:** "Our join-time number came from User Timing marks, from clicking Join to the first remote frame."

---

**Q42. What is the Long Animation Frames (LoAF) API?**

**Short answer:** An API that attributes slow frames to specific scripts and functions.

**Explanation:** It makes INP debugging much easier than the plain long-tasks API. Check support.

**Example:** LoAF data showed a third-party analytics function caused most slow frames after clicks.

**Say it like this:** "LoAF tells me which script made a frame slow, which turns INP debugging from guessing into data."

---

**Q43. How do you debug INP in DevTools?**

**Short answer:** Record the interaction in the Performance panel and split the time into input delay, processing time and presentation delay.

**Explanation:** Fix whichever part is largest: free the main thread, reduce handler and render work, or reduce layout and paint.

**Example:** Processing time dominated because a click re-rendered a 2,000-row table; virtualisation fixed it.

**Say it like this:** "I break INP into its three parts and fix the biggest one."

---

**Q44. What is the islands architecture, or partial hydration?**

**Short answer:** Static HTML with small interactive islands hydrated independently.

**Explanation:** Far less JavaScript runs than in full SPA hydration (Astro, and conceptually RSC).

**Example:** A content page is static HTML with only the search box and newsletter form hydrated.

**Say it like this:** "Islands hydrate only what's interactive, which keeps content pages light."

---

**Q45. How do you render or cache HTML at the edge?**

**Short answer:** Render or cache pages at CDN locations close to users, with careful cache keys and stale-while-revalidate headers.

**Explanation:** Personalised content needs per-user or per-tenant keys, or it must not be cached.

**Example:** `Cache-Control: s-maxage=60, stale-while-revalidate=300` for a public pricing page.

**Say it like this:** "Edge caching is great for public pages; personalised pages need very careful cache keys or none at all."

---

**Q46. What is the back/forward cache (bfcache)?**

**Short answer:** The browser keeps pages in memory so Back is instant.

**Explanation:** `unload` handlers and some open connections block it; use `pagehide` and `pageshow` instead.

**Example:** Replacing an `unload` analytics handler with `pagehide` made Back navigation instant again.

**Say it like this:** "Avoiding `unload` keeps pages eligible for instant back navigation."

---

**Q47. What are Speculation Rules?**

**Short answer:** Declarative rules telling supporting browsers to prefetch or prerender likely next pages.

**Explanation:** Prerendered navigations feel instant; use moderate eagerness to avoid wasting bandwidth.

**Example:**

```html
<script type="speculationrules">{ "prerender": [{ "where": { "href_matches": "/calls/*" }, "eagerness": "moderate" }] }</script>
```

**Say it like this:** "Speculation rules prerender the page a user is likely to open next, so navigation is instant."

---

**Q48. Why is JavaScript expensive on low-end devices?**

**Short answer:** JavaScript must be parsed, compiled and executed on the main thread, so it costs far more per byte than images.

**Explanation:** A 1 MB bundle can take seconds of CPU on a budget phone.

**Example:** The same dashboard took 0.8 s of scripting on a laptop and 4 s on a mid-range Android phone.

**Say it like this:** "JS bytes are the most expensive bytes, so shipping less JavaScript is the biggest mobile win."

---

**Q49. What's a sensible polyfill strategy?**

**Short answer:** Target modern browsers with `browserslist` and avoid polyfilling everything by default.

**Explanation:** Add differential loading only if old browsers really matter to your users.

**Example:** Dropping IE-era polyfills removed 40 KB from every page.

**Say it like this:** "I polyfill for the browsers our users actually have, not every browser ever made."

---

**Q50. How do you optimise a design system for performance?**

**Short answer:** Tree-shakable ESM with per-component entry points, no runtime CSS-in-JS, individual icon imports and measured component costs.

**Explanation:** A heavy design system slows every product that uses it.

**Example:** `import { Button } from '@org/ui/button'` pulls only the button, not the whole library.

**Say it like this:** "A design system must be tree-shakable, or every app pays for every component."

---

**Q51. How do you build a performance culture in a team?**

**Short answer:** CI budgets, RUM dashboards per release, a performance section in the PR template, regular audits and clear ownership.

**Explanation:** Performance regresses one innocent PR at a time.

**Example:** A weekly dashboard review caught a 20% INP regression the day after release.

**Say it like this:** "Budgets and dashboards catch regressions early, while they're still easy to fix."

---

## 🎥 Real-Time and Video Performance (Your Domain)

**Background:** In a video call each participant publishes camera and mic tracks and subscribes to others'. An SFU (like the LiveKit server) forwards streams without re-encoding. Performance means fast joins, low bandwidth and CPU, and a smooth UI.

**Q52. What are the main performance concerns in a video app?**

**Short answer:** Join time, bandwidth, CPU and battery, memory from many video elements, main-thread jank, and reconnection speed.

**Explanation:** Video decoding and encoding are expensive, so the UI must stay light around them.

**Example:** On clinic tablets, CPU from encoding plus a heavy React re-render caused dropped frames until re-renders were reduced.

**Say it like this:** "In a video app the media pipeline already uses most of the CPU, so the UI has to be very efficient."

---

**Q53. What is simulcast?**

**Short answer:** The publisher sends several encodings (e.g. 720p, 360p, 180p) and the SFU forwards the right one to each subscriber.

**Explanation:** Subscribers with poor bandwidth or small tiles get a lower layer.

**Example:** A thumbnail tile receives 180p while the active speaker tile receives 720p.

**Say it like this:** "Simulcast lets each viewer get the quality their screen and network can handle."

---

**Q54. What are adaptive stream and dynacast in LiveKit?**

**Short answer:** Adaptive stream requests resolution based on rendered tile size and pauses hidden tiles; dynacast stops encoding layers nobody consumes.

**Explanation:** Together they save download bandwidth for subscribers and CPU and upload for publishers.

**Example:**

```ts
new Room({ adaptiveStream: true, dynacast: true });
```

**Say it like this:** "With both on, a small tile gets a small stream, and if nobody needs 720p, the publisher stops encoding it."

---

**Q55. What are SVC codecs (VP9, AV1)?**

**Short answer:** Scalable Video Coding sends one stream with built-in layers the SFU can drop per subscriber.

**Explanation:** It's more efficient than simulcast but device support and CPU cost vary.

**Example:** With VP9 SVC, a subscriber on a weak network receives only the base spatial layer.

**Say it like this:** "SVC gives simulcast-like flexibility in one stream; I'd enable it where devices support it well."

---

**Q56. How do you reduce join latency?**

**Short answer:** Prefetch the token, preconnect to media hosts, warm up the camera on pre-join, lazy-load the SDK early, pick the nearest region, and avoid serial calls.

**Explanation:** Most join time is network round trips and waiting for permissions, not rendering.

**Example:** Moving the token fetch and SDK load to the pre-join screen removed two round trips after clicking Join.

**Say it like this:** "Everything that can happen before the user clicks Join happens on the pre-join screen."

---

**Q57. How do you render many participants efficiently?**

**Short answer:** Paginate tiles, render video only for visible participants, use an active-speaker layout, and keep stable keys.

**Explanation:** Each `<video>` costs decode CPU and memory, so off-screen participants are audio-only.

**Example:** A 12-person call shows 6 tiles per page; others are audio-only until paged in.

**Say it like this:** "Only visible participants get video; everyone else is audio-only until they're on screen."

---

**Q58. How do you show speaking indicators without re-render storms?**

**Short answer:** Keep audio levels out of React state and update a CSS variable or class via a ref in `requestAnimationFrame`.

**Explanation:** Levels change many times a second for every participant.

**Example:** `ringRef.current.style.setProperty('--level', level)` inside a rAF loop.

**Say it like this:** "Speaking rings animate from a CSS variable, so React never re-renders for audio levels."

---

**Q59. What optimisations help low-end tablets?**

**Short answer:** Lower publish resolution and frame rate, disable background effects, limit tiles, reduce animations, monitor memory, and fall back to audio-only.

**Explanation:** Thermal throttling makes things worse over long calls.

**Example:** Publishing at 540p/24fps instead of 720p/30fps on older tablets eliminated stuttering.

**Say it like this:** "On weak devices we trade video quality for stability, because a smooth call matters more than resolution."

---

**Q60. How do you show network quality?**

**Short answer:** Use the SDK's connection-quality events to show a simple badge, downgrade video automatically, and explain why.

**Explanation:** Users tolerate lower quality when they understand the cause.

**Example:**

```ts
room.on(RoomEvent.ConnectionQualityChanged, (q, p) => setQuality(p.identity, q));
```

**Say it like this:** "A simple good/fair/poor badge plus automatic downgrade keeps calls going and users informed."

---

## 🧩 Level 4 — Scenario-Based

**Q61. "Our dashboard LCP is 5 s on mobile." Walk me through it.**

**Short answer:** Confirm with field data, trace to find the LCP element, break LCP into its four parts, fix the largest, and re-measure p75.

**Explanation:** Common fixes: server-render the first view, preload the hero data or image, reduce render-blocking JS, use a CDN.

**Example:** The LCP element was a client-rendered table waiting on a big bundle and an API call; server-rendering the first page halved LCP.

**Say it like this:** "Data first, then the trace, then fix the biggest part of LCP and verify in the field."

---

**Q62. Typing into a filter input feels laggy (INP is 600 ms).**

**Short answer:** Profile the interaction; usually a big table re-renders per keystroke. Use `useDeferredValue`, virtualise, memoise rows, or filter on the server.

**Explanation:** Separate the urgent input update from the expensive list update.

**Example:** After deferring the filter and virtualising, INP dropped to about 120 ms.

**Say it like this:** "I'd show the before and after INP: the input stays urgent and the table becomes non-urgent and virtualised."

---

**Q63. The bundle grew from 250 KB to 900 KB after adding a feature.**

**Short answer:** Run the bundle analyser, remove or split the heavy dependencies, and add a CI budget.

**Explanation:** Usual suspects: full icon sets, charting libraries in the main chunk, moment.js.

**Example:** Per-icon imports, lazy-loaded charts and `Intl` instead of moment brought it back to 270 KB.

**Say it like this:** "The analyser shows the culprit in minutes; a budget stops it happening again."

---

**Q64. CLS is 0.3 on the call list page.**

**Short answer:** Reserve image space, show the "new calls" banner as an overlay, and use a metric-matched fallback font.

**Explanation:** Three typical culprits: unsized images, inserted banners and font swaps.

**Example:** After the fixes, CLS dropped to 0.02.

**Say it like this:** "I find what moves with the Layout Shift track and reserve space or overlay it."

---

**Q65. The app becomes sluggish after an hour-long call.**

**Short answer:** Look for a memory leak or unbounded arrays with heap snapshots, then cap buffers, virtualise and clean up listeners.

**Explanation:** Slowness that grows with time is almost always accumulation.

**Example:** Chat history was capped at 500 messages and virtualised; duplicate SDK subscriptions were removed.

**Say it like this:** "Gradual slowdown means something accumulates; heap snapshots tell me what."

---

**Q66. A third-party analytics script blocks the main thread on load.**

**Short answer:** Load it after interaction or idle, use `sendBeacon`, move it to a worker, or use server-side analytics.

**Explanation:** Analytics shouldn't compete with the user's first interaction.

**Example:** Deferring the script with `requestIdleCallback` removed a 300 ms long task at startup.

**Say it like this:** "Analytics waits until the user can already use the page."

---

**Q67. API responses are slow and the page waits on five sequential calls.**

**Short answer:** Parallelise independent calls, add a BFF to aggregate, cache, and render progressively with Suspense.

**Explanation:** Sequential calls add their latencies together.

**Example:** Five 300 ms calls in sequence (1.5 s) became one 400 ms aggregated call.

**Say it like this:** "Waterfalls multiply latency; parallelising or aggregating fixes it."

---

**Q68. Users on hospital Wi-Fi have long join times.**

**Short answer:** Add TURN over TLS on 443, reduce pre-join steps, prefetch the token, use a regional SFU, and measure ICE connection time separately.

**Explanation:** Hospital networks often block UDP, so connections fall back slowly or fail.

**Example:** Telemetry showed ICE taking 8 s at one hospital; adding TURN/TLS on 443 cut it to under 2 s.

**Say it like this:** "I'd measure ICE time per network, and TURN over TLS fixes most restrictive hospital networks."

---

## 🎯 From Your Resume

**Q69. "How did you achieve a join latency under 5 seconds?"**

**Short answer:** We measured click-to-first-remote-frame, found serial API calls, late SDK loading and the permission prompt, and moved them to the pre-join screen.

**Explanation:** User Timing marks sent to monitoring defined the metric; the fixes removed round trips after the click. Don't invent numbers you don't remember.

**Example:** Token prefetch, camera warm-up and SDK lazy-loading on pre-join, plus connecting to the nearest region.

**Say it like this:** "We defined join latency as click to first remote frame, measured it, and moved everything possible before the click."

---

**Q70. "Your SSE chat streams tokens. How did you keep rendering smooth?"**

**Short answer:** Buffer tokens and flush once per frame, render markdown incrementally on completed blocks, virtualise history, and re-render only the streaming message.

**Explanation:** Re-rendering the whole list per token causes jank.

**Example:** The streaming message is its own memoised component fed from a buffered state; older messages don't re-render.

**Say it like this:** "Only the message being streamed re-renders, at most once per frame."

---

**Q71. "BpoBox dashboards serve 1,500 users. What did you optimise?"**

**Short answer:** Server-side aggregation and pagination, virtualised tables, cached queries, lazy-loaded charts, prefetch on hover and URL-driven filters.

**Explanation:** The browser never received raw data, only what it displayed.

**Example:** Hovering a call row prefetched its details, so opening it felt instant. *(Add RUM numbers if you have them.)*

**Say it like this:** "The server does the heavy lifting, the client renders only what's visible, and likely next views are prefetched."

---

**Q72. "How did self-hosting LiveKit support 10x traffic?"**

**Short answer:** It's a projection: horizontally scalable SFU nodes with Redis routing, autoscaling, a CDN and monitoring; I'd validate it with load tests.

**Explanation:** Be precise that 10x is a design capacity, and describe how you'd measure per-node saturation.

**Example:** LiveKit's load-testing tool simulating rooms while watching CPU, bandwidth and packet loss per node.

**Say it like this:** "That's a design projection. The architecture scales horizontally, and I'd prove the number with load tests before claiming it."
