# 09 — Next.js (App Router, with Pages Router Notes)

> Next.js changes quickly, and caching defaults and APIs have changed across versions. Before an interview, check which version the company uses and skim its release notes.

**How this file is organised**

- **Part A — Understand the topic:** what Next.js adds on top of React, the rendering strategies, the App Router and Server Components, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is Next.js?

React on its own is just a UI library. To build a full app you also need routing, server rendering, data fetching, bundling, image optimisation and API endpoints. **Next.js** is a React *framework* that bundles all of these together with sensible defaults.

### The big idea: where and when is the HTML made?

A plain React single-page app (SPA) sends an almost empty HTML file, downloads JavaScript, and builds the page *in the browser*. That's slow on the first visit and bad for SEO. Next.js can produce the HTML *on the server*, either ahead of time or per request:

| Strategy | HTML generated | Example use |
|---|---|---|
| **CSR** (client-side rendering) | in the browser | a dashboard behind login |
| **SSR** (server-side rendering) | on the server, per request | a personalised page that needs fresh data |
| **SSG** (static site generation) | at build time | marketing pages, docs, blogs |
| **ISR** (incremental static regeneration) | at build time, then regenerated periodically or on demand | a product catalogue |
| **Streaming** | sent in pieces as data becomes ready | a page with one slow widget |
| **PPR** (partial prerendering) | static shell instantly + dynamic parts streamed in | mixed static/dynamic pages |

### App Router (modern) vs Pages Router (older)

- **App Router (`app/` folder):** introduced in Next.js 13. It uses **React Server Components** by default, plus nested layouts, streaming, Server Actions, and special files like `loading.tsx` and `error.tsx`.
- **Pages Router (`pages/` folder):** the original system. It uses `getServerSideProps` and `getStaticProps`, `_app.tsx` and `pages/api`. It's still supported, and both routers can coexist during a migration.

### Server Components in one picture

```text
app/calls/page.tsx  (Server Component — runs on server, can query DB, ships 0 JS)
   ├── <CallStats />          Server Component
   ├── <CallTable rows={…} /> Server Component
   └── <FilterBar />          'use client' — interactive, ships JS, hydrated in browser
```

By default, every component in `app/` is a **Server Component**. You add `'use client'` at the top of a file only for the interactive parts. Less JavaScript reaches the browser, so pages load faster.

### Caching (the trickiest part)

Next.js caches at several levels:

- **Request memoisation:** the same `fetch` is deduplicated within one render.
- **Data cache:** `fetch` results are reused across requests.
- **Full route cache:** rendered pages are stored.
- **Client router cache:** pages you've visited are kept in the browser.

You control freshness with `revalidate`, `no-store` and tags, and invalidate with `revalidatePath` and `revalidateTag`. Most real-world Next.js bugs are caching bugs, such as stale data or, worse, one user's data cached for another.

### Why interviewers ask about Next.js

Next.js is the default choice for new React apps. Interviewers check whether you understand rendering trade-offs, the boundary between Server and Client Components, caching, and the security of Server Actions. Since your resume lists Next.js (Slaylink), expect "why Next.js" and architecture questions.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. What is Next.js?**

**Short answer:** A React framework. It adds file-based routing, server rendering, static generation, data-fetching patterns, API routes, image and font optimisation, and build tooling.

**Say it like this:** "React gives me components. Next.js gives me a full application framework around them: routing, server rendering for SEO and speed, API endpoints, and performance optimisations out of the box."

---

**Q2. Why use Next.js instead of plain React (a Vite SPA)?**

**Short answer:** You get SEO and a fast first paint from server rendering, built-in routing and layouts, a backend-for-frontend (route handlers and Server Actions), and optimisations out of the box. A SPA is still a fine choice for authenticated, highly interactive apps where SEO doesn't matter.

**Say it like this:** "For public pages where SEO and first load matter, Next.js is clearly better. For an internal real-time dashboard behind a login, a Vite SPA is simpler and perfectly valid. I choose based on the product, not hype."

---

**Q3. What rendering strategies does Next.js support?**

**Short answer:** CSR, SSR, SSG, ISR, streaming and partial prerendering (see the table in Part A).

**Example:**

- Marketing homepage → SSG (built once, served from a CDN).
- Product page → ISR with `revalidate: 3600` (rebuilt at most once an hour).
- Logged-in dashboard → SSR or CSR (personalised).
- Report page with one slow chart → streaming, with the chart inside `<Suspense>`.

---

**Q4. App Router vs Pages Router?**

**Short answer:**

| | App Router (`app/`) | Pages Router (`pages/`) |
|---|---|---|
| Components | Server Components by default | Client components |
| Data fetching | `async` components, `fetch` | `getServerSideProps`, `getStaticProps` |
| Layouts | nested `layout.tsx` | `_app.tsx` |
| Loading and errors | `loading.tsx`, `error.tsx` | manual |
| Mutations | Server Actions | API routes |
| API endpoints | `route.ts` | `pages/api/*` |

Both can coexist during a migration.

---

**Q5. How does file-based routing work in the App Router?**

**Short answer:** Folders become URL segments, and a `page.tsx` file makes a segment publicly reachable.

```text
app/
  page.tsx                → /
  calls/
    page.tsx              → /calls
    [id]/
      page.tsx            → /calls/123
```

---

**Q6. What are the special files?**

**Short answer:**

| File | Purpose |
|---|---|
| `layout.tsx` | shared UI that **persists** across child navigations |
| `page.tsx` | the route's UI |
| `loading.tsx` | Suspense fallback while the page loads |
| `error.tsx` | error boundary (must be a client component) |
| `not-found.tsx` | 404 UI |
| `template.tsx` | like a layout, but **remounts** on every navigation |
| `route.ts` | API endpoint (GET, POST, …) |
| `default.tsx` | fallback for parallel routes |
| `middleware.ts` | runs before requests (at the project root) |

---

**Q7. How do dynamic routes work?**

**Short answer:** `[id]` matches one segment, `[...slug]` matches everything after (catch-all), and `[[...slug]]` is an optional catch-all. In recent versions, `params` is a promise:

```tsx
export default async function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const call = await getCall(id);
  return <CallDetail call={call} />;
}
```

---

**Q8. What are route groups?**

**Short answer:** Folders in parentheses, like `(marketing)/about/page.tsx`, organise files and share layouts *without* adding a URL segment. The URL is just `/about`.

**Example:** `(marketing)` and `(dashboard)` groups can have completely different layouts.

---

**Q9. How do linking and navigation work?**

**Short answer:** `<Link href="/calls">` navigates on the client without a full reload, and in production it prefetches the route when the link scrolls into view. In client components use `useRouter().push()`, and in server code use `redirect()`.

---

**Q10. What does `next/image` give you?**

**Short answer:** Automatic responsive sizes, modern formats (WebP and AVIF), lazy loading by default, no layout shift (it requires `width`/`height` or `fill`), and `priority` for the LCP image.

```tsx
<Image src="/hero.jpg" alt="Interpreter on a call" width={1200} height={600}
       sizes="(max-width: 768px) 100vw, 50vw" priority />
```

---

**Q11. What does `next/font` do?**

**Short answer:** It self-hosts Google or local fonts at build time, so there's no extra request to Google. It also generates size-adjusted fallback fonts, which gives zero layout shift when the font loads.

```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });
<html className={inter.className}>
```

---

**Q12. How do environment variables work?**

**Short answer:** Variables in `.env.local` and similar files are **server-only** by default. Variables prefixed with `NEXT_PUBLIC_` are *inlined into the client bundle at build time*, so anyone can read them. Never put secrets in `NEXT_PUBLIC_` variables.

---

**Q13. How do you set page metadata?**

```ts
export const metadata: Metadata = { title: 'Calls', description: 'Review call quality' };

export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = await params;
  const call = await getCall(id);
  return { title: `Call with ${call.agent}` };
}
```

---

**Q14. Where do static assets go?**

**Short answer:** In the `public/` folder, served from the root. `public/logo.svg` becomes `/logo.svg`.

---

## 🟡 Level 2 — Intermediate

**Q15. Server Components vs Client Components?**

| | Server Component (default) | Client Component (`'use client'`) |
|---|---|---|
| Runs | on the server only | on the server (SSR) and in the browser |
| JavaScript sent to browser | none | yes |
| Data access | direct (database, secrets) | through APIs |
| Hooks, state, effects | no | yes |
| Event handlers | no | yes |
| Browser APIs | no | yes |

**Short answer:** Default to Server Components, and add `'use client'` only on interactive leaf components.

**Say it like this:** "I push `'use client'` as far down the tree as possible. The page and data tables are Server Components, and only the filter dropdown or the play button is a Client Component. Less JavaScript ships, and secrets never leave the server."

---

**Q16. What does `'use client'` really mean?**

**Short answer:** It marks a **boundary**: this module, and everything it imports, becomes part of the client bundle. It does **not** mean "render only in the browser". Client components are still server-rendered to HTML first, then hydrated.

---

**Q17. How do you compose Server and Client Components?**

**Short answer:** A Client Component can't *import* a Server Component, but it can *receive* one as `children` or props from a Server parent:

```tsx
// app/calls/page.tsx (server)
export default function Page() {
  return (
    <ClientTabs>                 {/* client: handles tab switching */}
      <ServerCallTable />        {/* server: rendered on server, passed as children */}
    </ClientTabs>
  );
}
```

Props passed to Client Components must be **serialisable**: plain objects, not functions or class instances (Server Actions are the exception).

---

**Q18. What are the `server-only` and `client-only` packages for?**

**Short answer:** Add `import 'server-only'` at the top of modules that use secrets or the database. If anyone imports that module into a Client Component, the **build fails**, so secrets can't accidentally leak into the browser bundle.

---

**Q19. How do you fetch data in Server Components?**

```tsx
export default async function CallsPage() {
  const [calls, stats] = await Promise.all([getCalls(), getStats()]);   // parallel, not sequential
  return <CallsView calls={calls} stats={stats} />;
}
```

**Short answer:** Server Components can be `async` and await data directly. Avoid sequential "waterfalls", start independent fetches together, and put slow parts in their own Suspense boundaries.

---

**Q20. What are the caching and revalidation concepts?**

**Short answer:** There are four layers:

1. **Request memoisation:** the same `fetch` is deduplicated within one render pass.
2. **Data cache:** `fetch` results are persisted across requests.
3. **Full route cache:** the rendered HTML and RSC payload are stored for static routes.
4. **Client router cache:** visited routes are kept in browser memory.

**Controls:**

```ts
fetch(url, { cache: 'no-store' });                       // always fresh
fetch(url, { next: { revalidate: 60, tags: ['calls'] } }); // fresh for 60s, taggable
export const revalidate = 60;                            // segment config
revalidateTag('calls'); revalidatePath('/calls');        // on-demand invalidation
```

Newer versions add explicit caching directives (`'use cache'`, `cacheLife`, `cacheTag`) and changed the defaults, so check the version.

**Say it like this:** "I treat caching as a per-data decision: how fresh does this need to be, and is it user-specific? Anything personalised must never land in a shared cache."

---

**Q21. What makes a route static or dynamic?**

**Short answer:** Using `cookies()`, `headers()`, `searchParams`, uncached fetches or `connection()` makes a route **dynamic** (rendered per request). Otherwise Next.js may render it **statically** at build time.

---

**Q22. What does `generateStaticParams` do?**

```ts
export async function generateStaticParams() {
  const posts = await getPopularPosts();
  return posts.map((p) => ({ slug: p.slug }));   // pre-build these pages
}
export const dynamicParams = true;               // others are built on demand
```

**Short answer:** It pre-builds dynamic routes at build time, which is SSG for `[slug]` pages.

---

**Q23. How do loading UI and streaming work?**

**Short answer:** `loading.tsx` automatically wraps the page in Suspense. For finer control, wrap slow widgets inside the page so the shell renders first:

```tsx
export default function Dashboard() {
  return (
    <>
      <Header />                                           {/* instant */}
      <Suspense fallback={<ChartSkeleton />}>
        <SlowAnalyticsChart />                             {/* streams in later */}
      </Suspense>
    </>
  );
}
```

---

**Q24. How do you handle errors?**

**Short answer:** `error.tsx` is a client-component error boundary with a `reset()` function to retry. `global-error.tsx` covers the root layout, and calling `notFound()` renders `not-found.tsx`. In production, error details are hidden from users. A `digest` ID lets you match the error to the server logs.

---

**Q25. What are Route Handlers?**

```ts
// app/api/calls/route.ts
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return new Response('Unauthorized', { status: 401 });
  return Response.json(await listCalls(session.tenantId));
}

export async function POST(req: Request) {
  const body = CallSchema.parse(await req.json());     // validate
  // authorize + create
}
```

**Short answer:** API endpoints inside the app. Use them for webhooks, backend-for-frontend endpoints, third-party callbacks and streaming responses.

---

**Q26. What are Server Actions?**

```tsx
'use server';
export async function submitScore(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  if (!session.permissions.includes('calls:score')) throw new Error('Forbidden');
  const data = ScoreSchema.parse(Object.fromEntries(formData));
  await db.score.create({ data: { ...data, reviewerId: session.userId } });
  revalidateTag(`call-${data.callId}`);
}

// usage in a component:
<form action={submitScore}>…</form>
```

**Short answer:** Server-side functions you can call directly from forms or client code, with no API route to write.

**Critical point:** each Server Action is a **public HTTP endpoint**. Always validate the input and check authorisation *inside* the action.

**Say it like this:** "Server Actions feel like calling a function, but under the hood they're POST endpoints anyone can call. Every action starts with an auth check, a permission check and Zod validation."

---

**Q27. What is middleware used for?**

**Short answer:** Code that runs **before** a request is routed. Use it for auth redirects, locale detection, tenant rewrites by hostname, A/B test cookies and headers. Keep it fast and don't fetch heavy data there. Still authorise inside pages and actions, because a misconfigured matcher can let requests skip middleware.

```ts
export function middleware(req: NextRequest) {
  if (!req.cookies.get('session')) return NextResponse.redirect(new URL('/login', req.url));
}
export const config = { matcher: ['/dashboard/:path*'] };
```

---

**Q28. Rewrites vs redirects?**

**Short answer:** A **redirect** changes the URL in the browser (301/308 permanent, 302/307 temporary). A **rewrite** serves a different path while keeping the URL the user sees. Use rewrites to proxy APIs or to map `acme.app.com` to `/tenants/acme`.

---

**Q29. Which client-side navigation hooks are there?**

**Short answer:** `useRouter`, `usePathname`, `useSearchParams` (wrap it in a Suspense boundary for static rendering), `useParams` and `useSelectedLayoutSegment`.

---

**Q30. What persists in a layout?**

**Short answer:** A layout's state and DOM **persist** when you navigate between its child routes, and the layout doesn't re-render. So a server layout can't know the current pathname. To highlight the active nav item, use a small client component with `usePathname()`.

---

**Q31. What are the authentication patterns?**

**Short answer:** The server or identity provider issues a session cookie (HttpOnly, Secure, SameSite). Read it in Server Components with `cookies()`, use middleware for redirects, and check authorisation in every Server Action, route handler and data function. Libraries include Auth.js, Clerk, or a custom OIDC setup.

---

**Q32. How do you configure image optimisation?**

**Short answer:** List allowed remote hosts in `images.remotePatterns`, set `sizes` for responsive images, and use a custom loader if images come from your own CDN.

---

**Q33. How do you load third-party scripts efficiently?**

```tsx
<Script src="https://analytics.example.com/a.js" strategy="lazyOnload" />
```

**Short answer:** `next/script` takes a `strategy`: `beforeInteractive` (critical), `afterInteractive` (the default, e.g. tag managers) or `lazyOnload` (low-priority widgets like chat).

---

## 🔴 Level 3 — Advanced

**Q34. What is the RSC payload?**

**Short answer:** A compact, serialised description of the rendered Server Component tree. It contains the rendered output, references to the Client Component chunks, and their props. It streams to the browser, and React uses it to update the page without a full HTML reload, which is how client-side navigation works with Server Components.

---

**Q35. How do Server Components reduce bundle size?**

**Short answer:** Their code and dependencies (markdown parsers, date libraries, database clients) never ship to the browser. Only their rendered output does.

**Example:** Rendering markdown with a 60 KB library in a Server Component sends 0 KB of that library to users.

---

**Q36. What are parallel routes?**

**Short answer:** Folders starting with `@` (`@analytics`, `@team`) render **at the same time** as named slots in a layout. Each slot has its own loading and error states, which suits dashboards.

```tsx
export default function Layout({ children, analytics, team }) {
  return <>{children}<aside>{analytics}</aside><section>{team}</section></>;
}
```

---

**Q37. What are intercepting routes?**

**Short answer:** `(.)photo/[id]` intercepts a navigation so a modal opens over the current page, while the URL still updates and can be shared. Visiting that URL directly renders the full page. Instagram's photo modal is the classic example.

---

**Q38. What is Partial Prerendering (PPR)?**

**Short answer:** The static shell of a page is served instantly from the edge or CDN, and the dynamic parts (inside Suspense) stream in through the same response. You get static speed and dynamic freshness on one page.

---

**Q39. Edge runtime vs Node.js runtime?**

**Short answer:** The **Edge** runtime has fast cold starts and runs close to users, but its APIs are limited: no native Node modules and many npm packages won't work. **Node.js** gives you the full ecosystem. You can choose per route.

---

**Q40. How do you stream responses, such as AI tokens, from a route handler?**

```ts
export async function POST(req: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const token of llm(await req.json())) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(token)}\n\n`));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
```

---

**Q41. How do you build a multi-tenant app with Next.js?**

**Short answer:**

1. Middleware reads the hostname (`acme.app.com`) and rewrites to `/[tenant]/...`.
2. The layout fetches the tenant config (branding, features).
3. Cache tags are tenant-scoped (`tenant-${id}`).
4. Per-tenant theming uses CSS variables.
5. Every data function filters by tenant on the server.

---

**Q42. How do you set security headers and a CSP with nonces?**

**Short answer:** Generate a random nonce in middleware for each request and set `Content-Security-Policy: script-src 'self' 'nonce-abc123'`. Next.js applies the nonce to its own scripts. Add HSTS, `frame-ancestors` and `Permissions-Policy` through `next.config` headers or middleware.

---

**Q43. What should you know about Server Action security?**

**Short answer:** Next.js mitigates CSRF by comparing the Origin and Host headers, and action IDs are hard to guess. But **authorisation and input validation are always your job**. Don't capture sensitive values in inline actions, and return only minimal data.

---

**Q44. How can data leak to the client?**

**Short answer:** Passing a whole database object as a prop to a Client Component serialises *every field*, including password hashes and internal notes, into the page. Map data to DTOs (only the fields the UI needs), use `server-only`, and consider React's experimental taint APIs.

**Say it like this:** "Anything passed to a client component is visible in the page source. I map database records to small DTOs before they cross the server/client boundary."

---

**Q45. How do you avoid request waterfalls?**

**Short answer:**

- Run independent fetches together with `Promise.all`.
- Use the preload pattern: call `getX()` early without awaiting it.
- Put independent sections in sibling Suspense boundaries.
- Fetch only what the layout needs in the layout.

---

**Q46. Why is data stale after a mutation, and how do you fix it?**

**Short answer:** The cached data wasn't invalidated. Call `revalidatePath` or `revalidateTag` inside the Server Action, and if the client router cache is still stale, call `router.refresh()`.

---

**Q47. How do you add instrumentation and observability?**

**Short answer:** Use `instrumentation.ts` to register OpenTelemetry or Sentry, the `onRequestError` hook for server errors, and `useReportWebVitals` to send Core Web Vitals to analytics.

---

**Q48. How do you deploy outside Vercel?**

**Short answer:** Build with `output: 'standalone'` to get a minimal Docker image. If you run several instances, configure a shared cache handler (Redis or S3) so ISR stays consistent. Put a CDN in front and set up an image optimisation service.

---

**Q49. How do you analyse bundles and improve performance?**

**Short answer:**

- `@next/bundle-analyzer` shows what's in each bundle.
- `next/dynamic` with `ssr: false` for browser-only widgets like a video SDK.
- Avoid big client providers in the root layout.
- Keep `'use client'` boundaries small.

---

**Q50. How do you handle internationalisation?**

**Short answer:** Use a `[locale]` route segment, detect the locale in middleware, load dictionaries in Server Components (so they don't ship as JavaScript), and add `hreflang` alternates through metadata.

---

**Q51. How do you test a Next.js app?**

**Short answer:** Test client components with Vitest or Jest and RTL. Cover Server Components with E2E tests (Playwright), or by unit-testing their data functions separately. Mock `next/navigation` in unit tests.

---

**Q52. How do you migrate from the Pages Router to the App Router?**

**Short answer:** Incrementally, since both directories coexist:

1. Move layouts first.
2. Convert `getServerSideProps` into async Server Components.
3. Convert API routes into route handlers.
4. Replace `next/router` with `next/navigation`.
5. Review context providers. Push them down, and mark them `'use client'`.

---

## 🧩 Level 4 — Scenario-Based

**Q53. The marketing site is fast, but the dashboard behind login feels slow after migrating to Next.js.**

**Answer:** Likely causes:

- Too much client JavaScript in the root layout (many providers).
- Waterfalls in Server Components.
- Everything made dynamic and uncached.

Profile first. Then move providers lower, parallelise fetches, stream slow widgets with Suspense, and cache the tenant config.

---

**Q54. After a deploy, a page shows another user's data.**

**Answer:** Personalised data was cached as static: either Next.js treated the route as static, or a `fetch` was cached across users. This is a **security incident**. Mark the route dynamic (read cookies or headers, use `no-store`), scope cache keys by user or tenant, and audit the caching config. Purge the cache immediately.

---

**Q55. A dashboard showing local times throws hydration mismatch errors.**

**Answer:** The server formats times in *its* time zone (often UTC) and the client formats them in the user's. Format on the client after mount, or pass an explicit time zone to both sides.

---

**Q56. A heavy video SDK breaks server rendering with `window is not defined`.**

```tsx
const CallRoom = dynamic(() => import('./CallRoom'), { ssr: false, loading: () => <Spinner /> });
```

**Answer:** Load it only in the browser with `next/dynamic` and `ssr: false`, or import it inside `useEffect`, and keep it inside a client-only boundary.

---

**Q57. A user without permission manages to call a Server Action.**

**Answer:** Every action must check the session and permissions on the server. Hiding a button isn't security, because the action endpoint can be called directly.

---

**Q58. You need Twilio webhooks to trigger processing.**

**Answer:** A route handler verifies the **Twilio signature**, so it rejects fake requests. It enqueues the work (to Celery or a queue) instead of processing synchronously, and returns 200 quickly. Make processing **idempotent**, because webhooks are retried and can arrive twice.

---

**Q59. The SEO team complains that pages aren't indexed well.**

**Answer:**

- SSR or SSG for public pages.
- Proper metadata and canonical URLs.
- A sitemap (`app/sitemap.ts`) and `app/robots.ts`.
- Structured data.
- Crawlable `<a href>` links.
- A fast LCP.

---

**Q60. Build times are long because of thousands of static pages.**

**Answer:** Pre-build only the popular pages with `generateStaticParams`, generate the rest on demand with ISR, and cache builds in CI.

---

## 🎯 From Your Resume

**Q61. "Slaylink used Next.js with NestJS. How did you split responsibilities?"**

**Say it like this:** "Next.js owned the presentation layer: server-rendered pages for SEO, routing, and backend-for-frontend concerns like reading session cookies and combining several API calls for a page. NestJS owned the domain logic, authentication, the GraphQL API and database access. That kept business rules in one backend, reusable by other clients." *(Then describe exactly what you built.)*

---

**Q62. "Would you build InterpretIQ on Next.js? Why or why not?"**

**Say it like this:** "Most InterpretIQ screens are authenticated and real-time, built around LiveKit, so a SPA or PWA is a valid choice. SEO doesn't matter there. Next.js would add value in three ways: a backend-for-frontend that keeps tokens on the server, which is better for PHI security; server-rendered dashboards; and public marketing pages. The trade-off is more server infrastructure and framework complexity. I'd consider it for a v2, mainly for the BFF security benefit."

---

**Q63. "How would you implement the SSE compliance chat in Next.js?"**

**Say it like this:** "A route handler streams LLM tokens as `text/event-stream`. Auth uses the session cookie, so the client doesn't handle tokens. The client reads the stream with `fetch` and a stream reader. I'd rate-limit per user and per tenant, and log usage metrics without any PHI. Tenant isolation is enforced in the retrieval layer before anything reaches the model."
