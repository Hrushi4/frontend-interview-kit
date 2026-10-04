# 09 — Next.js (App Router, with Pages Router notes)

> Next.js evolves quickly (caching defaults and APIs changed across versions). Before an interview, check which version the company uses and skim its release notes.

Levels: **🟢 Basic → 🟡 Intermediate → 🔴 Advanced → 🧩 Scenario → 🎯 From Your Resume**

---

## 🟢 Level 1 — Basics

**1. What is Next.js?**
A React framework adding file-based routing, server rendering, static generation, data fetching patterns, API routes, image/font optimization and build tooling.

**2. Why use Next.js over plain React (Vite SPA)?**
SEO and fast first paint via server rendering, built-in routing and layouts, backend-for-frontend (route handlers, Server Actions), optimizations out of the box. A SPA is still fine for authenticated, highly interactive apps.

**3. Rendering strategies?**
| Strategy | When HTML is generated | Use for |
|---|---|---|
| CSR | in the browser | dashboards behind login |
| SSR | per request on server | personalized, fresh data, SEO |
| SSG | at build time | marketing, docs, blogs |
| ISR | build + periodic/on-demand regeneration | catalogs, content that changes sometimes |
| Streaming | progressively per Suspense boundary | pages with slow parts |
| PPR | static shell + streamed dynamic holes | mixed static/dynamic pages |

**4. App Router vs Pages Router?**
App Router (`app/`): layouts, Server Components by default, streaming, Server Actions, colocated loading/error files. Pages Router (`pages/`): `getServerSideProps`, `getStaticProps`, `_app`, `_document`, API routes in `pages/api`. Both can coexist during migration.

**5. File-based routing in App Router?**
`app/calls/page.tsx` → `/calls`. Folders = route segments; `page.tsx` makes a segment publicly routable.

**6. Special files?**
`layout.tsx` (shared UI, persists), `page.tsx`, `loading.tsx` (Suspense fallback), `error.tsx` (error boundary, client component), `not-found.tsx`, `template.tsx` (like layout but remounts), `route.ts` (API handler), `default.tsx` (parallel routes fallback), `middleware.ts` at root.

**7. Dynamic routes?**
`[id]` → single param; `[...slug]` catch-all; `[[...slug]]` optional catch-all. In recent versions `params` is async: `const { id } = await params;`.

**8. Route groups?**
`(marketing)/about/page.tsx` — parentheses organize files and layouts without affecting the URL.

**9. Linking and navigation?**
`<Link href="/calls">` prefetches in viewport (production) and does client-side navigation. `useRouter().push()` in client components; `redirect()` in server code.

**10. `next/image` benefits?**
Automatic responsive sizes (`sizes`), modern formats, lazy loading by default, prevents CLS via width/height or `fill`, `priority` for LCP images.

**11. `next/font`?**
Self-hosts Google/local fonts at build time, zero layout shift via size-adjusted fallbacks, no extra network request to Google.

**12. Environment variables?**
`.env.local` etc. Server-only by default. `NEXT_PUBLIC_*` is inlined into the client bundle at build time — never put secrets there.

**13. Metadata?**
```ts
export const metadata: Metadata = { title: 'Calls', description: '...' };
export async function generateMetadata({ params }) { /* dynamic */ }
```

**14. Static assets?**
`public/` folder served at root (`/logo.svg`).

---

## 🟡 Level 2 — Intermediate

**15. Server Components vs Client Components?**
| | Server | Client (`'use client'`) |
|---|---|---|
| Runs | server only | server (SSR) + browser |
| JS sent | none | yes |
| Data access | direct (DB, secrets) | via APIs |
| Hooks/state/effects | no | yes |
| Browser APIs | no | yes |
Default to Server; add `'use client'` only at interactive leaves.

**16. What does `'use client'` really mean?**
Marks a boundary: this module and everything it imports become part of the client bundle. It doesn't mean "client-only rendering" — client components are still SSR'd.

**17. Composing Server and Client Components?**
Client components can't import Server Components, but they can receive them as `children` or props from a Server parent:
```tsx
// server
<ClientTabs><ServerCallTable /></ClientTabs>
```
Props passed to client components must be serializable.

**18. `server-only` / `client-only` packages?**
`import 'server-only'` in modules with secrets/DB access → build error if imported into a client component.

**19. Data fetching in Server Components?**
```tsx
export default async function CallsPage() {
  const [calls, stats] = await Promise.all([getCalls(), getStats()]); // parallel
  return <CallsView calls={calls} stats={stats} />;
}
```
Avoid sequential waterfalls; start fetches early; push slow parts into Suspense boundaries.

**20. Caching and revalidation concepts?**
Know the layers: request memoization (dedupe same fetch in one render), data cache (fetch results across requests), full route cache (rendered HTML/RSC payload), client router cache. Controls: `fetch(url, { cache: 'no-store' })`, `next: { revalidate: 60, tags: ['calls'] }`, segment config (`export const revalidate`, `dynamic`), `revalidatePath`, `revalidateTag`. Newer versions add explicit caching directives (`'use cache'`, `cacheLife`, `cacheTag`) and changed defaults — verify per version.

**21. Static vs dynamic rendering triggers?**
Using `cookies()`, `headers()`, `searchParams`, uncached fetches or `connection()` makes a route dynamic. Otherwise it may be statically rendered at build.

**22. `generateStaticParams`?**
Pre-builds dynamic routes at build time (SSG for `[slug]`). Combine with `dynamicParams` to allow/deny unknown params.

**23. Loading UI and streaming?**
`loading.tsx` wraps the page in Suspense. Finer control: `<Suspense fallback={<Skeleton/>}><SlowWidget/></Suspense>` inside the page so the shell renders first.

**24. Error handling?**
`error.tsx` (client component with `reset()`), `global-error.tsx` for the root layout, `notFound()` → `not-found.tsx`. Throwing in a Server Component triggers the nearest error boundary; production hides details (use a digest to correlate logs).

**25. Route Handlers?**
```ts
// app/api/calls/route.ts
export async function GET(req: Request) { return Response.json(await listCalls()); }
export async function POST(req: Request) { const body = await req.json(); /* validate + authorize */ }
```
Use for webhooks, BFF endpoints, third-party callbacks, streaming responses.

**26. Server Actions?**
```tsx
'use server';
export async function submitScore(formData: FormData) {
  const session = await auth(); if (!session) throw new Error('Unauthorized');
  const data = ScoreSchema.parse(Object.fromEntries(formData));
  await db.score.create({ data: { ...data, reviewerId: session.userId } });
  revalidateTag(`call-${data.callId}`);
}
```
They're public HTTP endpoints — always validate input and check authorization inside the action.

**27. Middleware?**
Runs before a request is routed (edge/node runtime depending on version). Use for auth redirects, locale detection, tenant rewrites by hostname, A/B cookies, headers. Keep it fast; don't do heavy data fetching; still authorize in the page/action because middleware can be bypassed via misconfiguration.

**28. Rewrites vs redirects?**
Redirect changes the URL in the browser (301/302/307/308). Rewrite serves a different path while keeping the URL (proxy APIs, multi-tenant subdomains).

**29. Client-side hooks?**
`useRouter`, `usePathname`, `useSearchParams` (needs Suspense boundary for static rendering), `useParams`, `useSelectedLayoutSegment`.

**30. Layouts — what persists?**
Layout state and DOM persist across navigations between child routes; layouts don't re-render on navigation (can't read current pathname on the server — use a client component for active nav).

**31. Authentication patterns?**
Session cookie (httpOnly, Secure, SameSite) issued by the server/IdP; read in Server Components via `cookies()`; middleware for redirects; authorization checks in every Server Action/route handler/data function. Libraries: Auth.js, Clerk, custom OIDC.

**32. Image optimization configuration?**
`images.remotePatterns` to allow remote hosts, `sizes` for responsive, custom loader for a CDN.

**33. Script optimization?**
`next/script` with `strategy="afterInteractive" | "lazyOnload" | "beforeInteractive"` for third-party scripts.

---

## 🔴 Level 3 — Advanced

**34. What is the RSC payload?**
A serialized description of the Server Component tree (rendered output + references to client component chunks + their props) streamed to the client and used to update the UI without full HTML reloads.

**35. How do Server Components reduce bundle size?**
Their code and dependencies (markdown parsers, date libs, DB clients) never ship to the browser; only their output does.

**36. Parallel routes?**
Folders `@analytics`, `@team` render simultaneously in a layout as named slots — dashboards with independent loading/error states.

**37. Intercepting routes?**
`(.)photo/[id]` intercepts navigation to show a modal on the current page while the URL is shareable; direct visit renders the full page.

**38. Partial Prerendering (PPR)?**
Static shell served instantly from the edge, dynamic parts (inside Suspense) streamed in the same response.

**39. Edge vs Node.js runtime?**
Edge: fast cold starts close to users, limited APIs (no native Node modules, restricted packages). Node: full ecosystem. Choose per route.

**40. Streaming responses (e.g., AI) from route handlers?**
```ts
export async function POST(req: Request) {
  const stream = new ReadableStream({ async start(c) { for await (const t of llm(req)) c.enqueue(new TextEncoder().encode(`data: ${t}\n\n`)); c.close(); } });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
}
```

**41. Multi-tenant Next.js?**
Resolve tenant from hostname in middleware → rewrite to `/[tenant]/...` → fetch tenant config in layout → tenant-scoped cache tags (`tenant-${id}`) → per-tenant theming via CSS variables.

**42. Security headers and CSP with nonces?**
Generate a nonce in middleware, set `Content-Security-Policy` header with `'nonce-xyz'`, Next applies it to its scripts. Add HSTS, frame-ancestors, Permissions-Policy in `next.config` headers or middleware.

**43. Server Action security details?**
Built-in protections compare Origin/Host to mitigate CSRF, and action IDs are unguessable — but **authorization and validation are your job**. Don't close over sensitive values in inline actions; return minimal data.

**44. Data leaks to the client — risks?**
Passing whole DB objects as props to client components serializes everything (including sensitive fields). Map to DTOs; consider the experimental taint APIs; use `server-only`.

**45. Avoiding request waterfalls?**
Parallel `Promise.all`, preload pattern (call `getX()` early without await), move independent fetches into sibling Suspense boundaries, fetch in layout only what layout needs.

**46. Caching gotcha: stale data after mutation?**
Call `revalidatePath`/`revalidateTag` (or newer cache-invalidation APIs) inside the Server Action; client router cache may also need `router.refresh()`.

**47. Instrumentation and observability?**
`instrumentation.ts` to register OpenTelemetry/Sentry; `onRequestError` hook; Web Vitals reporting via `useReportWebVitals`.

**48. Deployment outside Vercel?**
`output: 'standalone'` → Docker image with minimal node_modules; configure cache handler for ISR across multiple instances (shared Redis/S3); CDN in front; image optimization service.

**49. Bundle analysis and performance?**
`@next/bundle-analyzer`, dynamic imports (`next/dynamic` with `ssr: false` for browser-only widgets like a video SDK), avoid large client providers in the root layout, keep `'use client'` boundaries small.

**50. Internationalization?**
`[locale]` segment + middleware locale detection + dictionaries loaded in Server Components; `hreflang` alternates via metadata.

**51. Testing a Next.js app?**
Unit/component tests with Vitest/Jest + RTL (client components); Server Components via E2E (Playwright) or by testing data functions separately; mock Next APIs (`next/navigation`).

**52. Migration from Pages Router to App Router?**
Incremental: both directories coexist; move layouts first; convert `getServerSideProps` to async Server Components; convert API routes to route handlers; replace `next/router` with `next/navigation`; review client-side state and context providers.

---

## 🧩 Level 4 — Scenario-based

**53. The marketing site is fast but the dashboard (behind login) feels slow after migration to Next.js.**
Too much client JS in the root layout (providers), waterfalls in Server Components, or everything made dynamic and uncached. Profile; move providers lower; parallelize fetches; stream slow widgets; cache tenant config.

**54. A page shows another user's data after deploy.**
Personalized data was statically cached (route considered static, or fetch cached across users). Mark dynamic (use cookies/headers, `no-store`), scope cache keys by user/tenant, review caching config.

**55. Hydration mismatch errors on a dashboard showing local times.**
Server formats in server timezone, client in user's timezone. Format on the client after mount, or pass an explicit timezone to both.

**56. A heavy video SDK breaks server rendering (`window is not defined`).**
`next/dynamic(() => import('./CallRoom'), { ssr: false })` or import inside `useEffect`; keep it in a client-only boundary.

**57. Server Action is called by a user without permission.**
Every action must check the session and permission server-side; never rely on hiding the button.

**58. You need webhooks from Twilio to trigger processing.**
Route handler verifies Twilio signature, enqueues work (don't process synchronously), returns quickly; idempotency on webhook retries.

**59. SEO team complains pages aren't indexed well.**
Ensure SSR/SSG for public pages, metadata, canonical, sitemap (`app/sitemap.ts`), robots (`app/robots.ts`), structured data, crawlable links, fast LCP.

**60. Build times are long due to thousands of static pages.**
Generate only popular pages at build (`generateStaticParams` subset), ISR the rest on demand, parallelize, cache builds in CI.

---

## 🎯 From Your Resume

**61. "Slaylink used Next.js with NestJS — how did you split responsibilities?"**
Next.js: SSR/SEO pages, routing, BFF concerns (session cookies, aggregating calls). NestJS: domain logic, auth, GraphQL API, database access. Describe what you specifically built.

**62. "Would you build InterpretIQ on Next.js? Why/why not?"**
Most screens are authenticated and real-time (LiveKit), so a SPA/PWA is a valid choice. Next.js would add value for a BFF holding tokens server-side (better security for PHI), server-rendered dashboards, and public pages. Trade-off: more server infrastructure and framework complexity.

**63. "How would you implement the SSE compliance chat in Next.js?"**
Route handler streams LLM tokens as `text/event-stream`; auth via session cookie; client uses `fetch` streaming or `EventSource`; rate limit per user/tenant; log usage without PHI.
