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

Every answer below has four parts: **Short answer** (say this first), **Explanation** (add if asked for more), **Example** (code or a real situation) and **Say it like this** (a sample spoken answer).

## 🟢 Level 1 — Basics

**Q1. What is Next.js?**

**Short answer:** A React framework that adds file-based routing, server rendering, static generation, data fetching, API routes, image and font optimisation, and build tooling.

**Explanation:** React is a UI library; Next.js provides the application framework around it with sensible defaults.

**Example:** `app/calls/page.tsx` becomes the `/calls` page, rendered on the server with data fetched directly in the component.

**Say it like this:** "React gives me components; Next.js gives me routing, server rendering, API endpoints and performance optimisations around them."

---

**Q2. Why use Next.js instead of plain React (a Vite SPA)?**

**Short answer:** Server rendering for SEO and fast first paint, built-in routing and layouts, a backend-for-frontend, and optimisations out of the box.

**Explanation:** A SPA is still fine for authenticated, highly interactive apps where SEO doesn't matter.

**Example:** InterpretIQ's marketing site benefits from Next.js SEO; its authenticated real-time call app works fine as a Vite SPA.

**Say it like this:** "For public pages, Next.js is clearly better. For a real-time dashboard behind a login, a SPA is simpler and valid. I choose by product, not hype."

---

**Q3. What rendering strategies does Next.js support?**

**Short answer:** CSR, SSR, SSG, ISR, streaming and partial prerendering.

**Explanation:** Pick per route based on freshness, personalisation and SEO needs.

**Example:** Marketing homepage → SSG; product page → ISR (`revalidate: 3600`); dashboard → SSR or CSR; report with a slow chart → streaming.

**Say it like this:** "I choose the rendering strategy per route: static where possible, server-rendered where personalised, streamed where parts are slow."

---

**Q4. App Router vs Pages Router?**

**Short answer:** The App Router uses Server Components, nested layouts, streaming and Server Actions; the Pages Router uses `getServerSideProps`, `getStaticProps` and `pages/api`.

**Explanation:** Both can coexist during migration.

**Example:**

| | App Router | Pages Router |
|---|---|---|
| Data fetching | async components | `getServerSideProps` |
| Layouts | nested `layout.tsx` | `_app.tsx` |
| Mutations | Server Actions | API routes |

**Say it like this:** "New projects use the App Router for Server Components and layouts; the Pages Router is still supported for existing apps."

---

**Q5. How does file-based routing work in the App Router?**

**Short answer:** Folders become URL segments, and a `page.tsx` makes a segment publicly reachable.

**Explanation:** Files like `layout.tsx` and `loading.tsx` in the same folder add shared UI and loading states.

**Example:**

```text
app/page.tsx              → /
app/calls/page.tsx        → /calls
app/calls/[id]/page.tsx   → /calls/123
```

**Say it like this:** "The folder structure is the route structure, which makes it easy to find any page's code."

---

**Q6. What are the special files?**

**Short answer:** `layout`, `page`, `loading`, `error`, `not-found`, `template`, `route`, `default` and `middleware`.

**Explanation:** Layouts persist across navigation; templates remount; `error.tsx` must be a client component; `route.ts` defines API endpoints.

**Example:** `app/calls/loading.tsx` shows a skeleton while `app/calls/page.tsx` fetches data.

**Say it like this:** "Special files give each route segment its own layout, loading and error handling by convention."

---

**Q7. How do dynamic routes work?**

**Short answer:** `[id]` matches one segment, `[...slug]` matches the rest, and `[[...slug]]` is optional; `params` is a promise in recent versions.

**Explanation:** Await `params` before reading values.

**Example:**

```tsx
export default async function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CallDetail call={await getCall(id)} />;
}
```

**Say it like this:** "Brackets in folder names define params, and in current Next.js I await `params` before using them."

---

**Q8. What are route groups?**

**Short answer:** Folders in parentheses that organise routes and share layouts without adding a URL segment.

**Explanation:** They let different sections use different layouts.

**Example:** `app/(marketing)/about/page.tsx` → `/about`; `(marketing)` and `(dashboard)` groups have different layouts.

**Say it like this:** "Route groups separate the marketing site and the app shell without changing URLs."

---

**Q9. How do linking and navigation work?**

**Short answer:** `<Link>` navigates on the client and prefetches in production; `useRouter().push()` in client components; `redirect()` on the server.

**Explanation:** Client navigation avoids full reloads and keeps layouts mounted.

**Example:**

```tsx
<Link href="/calls">Calls</Link>
redirect('/login'); // in a Server Component or Action
```

**Say it like this:** "`Link` gives instant navigation with prefetching; on the server I use `redirect`."

---

**Q10. What does `next/image` give you?**

**Short answer:** Responsive sizes, modern formats, lazy loading by default, no layout shift, and `priority` for the LCP image.

**Explanation:** It requires `width`/`height` or `fill`, which prevents CLS.

**Example:**

```tsx
<Image src="/hero.jpg" alt="Interpreter on a call" width={1200} height={600} sizes="(max-width: 768px) 100vw, 50vw" priority />
```

**Say it like this:** "`next/image` handles formats, sizes and lazy loading for me; I mark the hero with `priority`."

---

**Q11. What does `next/font` do?**

**Short answer:** It self-hosts fonts at build time and generates size-adjusted fallbacks for zero layout shift.

**Explanation:** No request to Google at runtime, which helps privacy and performance.

**Example:**

```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });
<html className={inter.className}>
```

**Say it like this:** "`next/font` removes font-related layout shift and third-party requests automatically."

---

**Q12. How do environment variables work?**

**Short answer:** Variables are server-only by default; `NEXT_PUBLIC_` variables are inlined into the client bundle at build time.

**Explanation:** Anyone can read `NEXT_PUBLIC_` values, so never put secrets there.

**Example:** `NEXT_PUBLIC_LIVEKIT_URL` is fine; `LIVEKIT_API_SECRET` must stay server-only.

**Say it like this:** "The `NEXT_PUBLIC_` prefix means 'shipped to every browser', so secrets never get it."

---

**Q13. How do you set page metadata?**

**Short answer:** Export a `metadata` object or a `generateMetadata` function from a page or layout.

**Explanation:** `generateMetadata` can fetch data for dynamic titles; results are deduped with the page's fetches.

**Example:**

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Call with ${(await getCall(id)).agent}` };
}
```

**Say it like this:** "Each route exports its metadata, so titles and social previews are correct and server-rendered."

---

**Q14. Where do static assets go?**

**Short answer:** In `public/`, served from the root.

**Explanation:** Use it for icons, `robots.txt` and files that need fixed URLs; images in components should go through `next/image`.

**Example:** `public/logo.svg` → `/logo.svg`.

**Say it like this:** "`public` is for files with fixed URLs, like favicons and the manifest."

---

## 🟡 Level 2 — Intermediate

**Q15. Server Components vs Client Components?**

**Short answer:** Server Components run only on the server, ship no JS and can access data directly; Client Components (`'use client'`) are interactive and hydrated.

**Explanation:** Default to Server Components and add `'use client'` only on interactive leaves.

**Example:** The calls page and table render on the server; the filter dropdown is a client component.

**Say it like this:** "I push `'use client'` as far down as possible, so less JavaScript ships and secrets never leave the server."

---

**Q16. What does `'use client'` really mean?**

**Short answer:** It marks a boundary: that module and everything it imports join the client bundle.

**Explanation:** It doesn't mean "render only in the browser"; client components are still server-rendered to HTML and then hydrated.

**Example:** Adding `'use client'` to a layout accidentally pulls every imported component into the bundle.

**Say it like this:** "`'use client'` is a bundle boundary, so I put it on small interactive files, not on layouts."

---

**Q17. How do you compose Server and Client Components?**

**Short answer:** Client Components can't import Server Components, but can receive them as `children` or props.

**Explanation:** Props crossing the boundary must be serialisable.

**Example:**

```tsx
export default function Page() {
  return <ClientTabs><ServerCallTable /></ClientTabs>;
}
```

**Say it like this:** "I pass server-rendered content into client wrappers as children, so interactivity doesn't drag data code into the browser."

---

**Q18. What are the `server-only` and `client-only` packages for?**

**Short answer:** Importing `server-only` makes the build fail if that module is ever imported into client code.

**Explanation:** It's a guard against leaking secrets or database code into the browser bundle.

**Example:**

```ts
import 'server-only';
export async function getCalls(tenantId: string) { return db.call.findMany({ where: { tenantId } }); }
```

**Say it like this:** "Data-access modules import `server-only`, so a mistaken client import fails the build instead of leaking."

---

**Q19. How do you fetch data in Server Components?**

**Short answer:** Make the component `async` and await data directly, running independent fetches in parallel.

**Explanation:** Avoid waterfalls and put slow parts behind Suspense.

**Example:**

```tsx
export default async function CallsPage() {
  const [calls, stats] = await Promise.all([getCalls(), getStats()]);
  return <CallsView calls={calls} stats={stats} />;
}
```

**Say it like this:** "Server Components fetch directly, and I start independent requests together to avoid waterfalls."

---

**Q20. What are the caching and revalidation concepts?**

**Short answer:** Request memoisation, the data cache, the full route cache and the client router cache, controlled with `revalidate`, `no-store`, tags, `revalidatePath` and `revalidateTag`.

**Explanation:** Defaults changed across versions, and newer versions add `'use cache'`; anything personalised must never land in a shared cache.

**Example:**

```ts
fetch(url, { cache: 'no-store' });
fetch(url, { next: { revalidate: 60, tags: ['calls'] } });
revalidateTag('calls');
```

**Say it like this:** "I decide caching per data type: how fresh must it be, and is it user-specific?"

---

**Q21. What makes a route static or dynamic?**

**Short answer:** Reading `cookies()`, `headers()`, `searchParams`, uncached fetches or `connection()` makes it dynamic; otherwise it may be static.

**Explanation:** Static routes are rendered at build time and served from cache.

**Example:** A page reading the session cookie is dynamic; the pricing page with no request data is static.

**Say it like this:** "Anything that reads the request makes a route dynamic, which is exactly what personalised pages need."

---

**Q22. What does `generateStaticParams` do?**

**Short answer:** It pre-builds dynamic routes at build time.

**Explanation:** Combine with `dynamicParams` to build popular pages up front and the rest on demand.

**Example:**

```ts
export async function generateStaticParams() {
  return (await getPopularPosts()).map((p) => ({ slug: p.slug }));
}
```

**Say it like this:** "Build the pages people actually visit, generate the long tail on demand."

---

**Q23. How do loading UI and streaming work?**

**Short answer:** `loading.tsx` wraps the page in Suspense; for finer control, wrap slow widgets in `<Suspense>` inside the page.

**Explanation:** The shell renders first and slow parts stream in.

**Example:**

```tsx
<Header />
<Suspense fallback={<ChartSkeleton />}><SlowAnalyticsChart /></Suspense>
```

**Say it like this:** "Slow widgets get their own Suspense boundary, so the rest of the page appears immediately."

---

**Q24. How do you handle errors?**

**Short answer:** `error.tsx` boundaries with `reset()`, `global-error.tsx` for the root, and `notFound()` for 404s.

**Explanation:** Production hides error details; a `digest` links the user-facing error to server logs.

**Example:**

```tsx
'use client';
export default function Error({ reset }: { reset: () => void }) {
  return <div role="alert">Couldn't load calls. <button onClick={reset}>Retry</button></div>;
}
```

**Say it like this:** "Each segment can have its own error boundary with a retry, and the digest connects it to our logs."

---

**Q25. What are Route Handlers?**

**Short answer:** API endpoints in `route.ts` files exporting HTTP method functions.

**Explanation:** Use them for webhooks, BFF endpoints, callbacks and streaming; always authenticate and validate.

**Example:**

```ts
export async function GET() {
  const session = await auth();
  if (!session) return new Response('Unauthorized', { status: 401 });
  return Response.json(await listCalls(session.tenantId));
}
```

**Say it like this:** "Route handlers are my BFF endpoints and webhook receivers, with auth checks on each."

---

**Q26. What are Server Actions?**

**Short answer:** Server functions callable from forms or client code without writing an API route.

**Explanation:** Each action is a public HTTP endpoint, so always check auth, permissions and validate input inside it.

**Example:**

```tsx
'use server';
export async function submitScore(formData: FormData) {
  const session = await auth();
  if (!session?.permissions.includes('calls:score')) throw new Error('Forbidden');
  const data = ScoreSchema.parse(Object.fromEntries(formData));
  await db.score.create({ data: { ...data, reviewerId: session.userId } });
  revalidateTag(`call-${data.callId}`);
}
```

**Say it like this:** "Server Actions feel like function calls but are POST endpoints anyone can hit, so each starts with auth, permissions and Zod."

---

**Q27. What is middleware used for?**

**Short answer:** Code that runs before routing, for auth redirects, locale detection, tenant rewrites, A/B cookies and headers.

**Explanation:** Keep it fast, and still authorise in pages and actions, because a misconfigured matcher can skip it.

**Example:**

```ts
export function middleware(req: NextRequest) {
  if (!req.cookies.get('session')) return NextResponse.redirect(new URL('/login', req.url));
}
export const config = { matcher: ['/dashboard/:path*'] };
```

**Say it like this:** "Middleware handles redirects and rewrites, but real authorisation still happens where data is accessed."

---

**Q28. Rewrites vs redirects?**

**Short answer:** A redirect changes the browser URL; a rewrite serves a different path while keeping the URL.

**Explanation:** Rewrites suit API proxies and tenant subdomains; redirects suit moved pages and auth flows.

**Example:** `acme.app.com/calls` rewrites internally to `/tenants/acme/calls`.

**Say it like this:** "Redirects change what users see in the address bar; rewrites change what the server serves behind it."

---

**Q29. Which client-side navigation hooks are there?**

**Short answer:** `useRouter`, `usePathname`, `useSearchParams`, `useParams` and `useSelectedLayoutSegment`.

**Explanation:** `useSearchParams` needs a Suspense boundary in statically rendered routes.

**Example:**

```tsx
const pathname = usePathname();
<Link className={pathname.startsWith('/calls') ? 'active' : ''} href="/calls">Calls</Link>
```

**Say it like this:** "Navigation hooks are client-only, so active-link highlighting lives in a small client component."

---

**Q30. What persists in a layout?**

**Short answer:** A layout's state and DOM persist across navigation between its children, and it doesn't re-render.

**Explanation:** So a server layout can't know the current path; use a client component with `usePathname()` for active nav.

**Example:** The sidebar's collapsed state survives moving between `/calls` and `/calls/123`.

**Say it like this:** "Layouts are persistent shells, which is great for sidebars and players that shouldn't reset."

---

**Q31. What are the authentication patterns?**

**Short answer:** A server-issued HttpOnly session cookie, read with `cookies()`, middleware for redirects, and authorisation in every action, handler and data function.

**Explanation:** Libraries include Auth.js, Clerk or custom OIDC.

**Example:** `const session = await auth()` at the top of every Server Action and data function.

**Say it like this:** "Auth is checked where data is touched, not just in middleware."

---

**Q32. How do you configure image optimisation?**

**Short answer:** Allow remote hosts with `images.remotePatterns`, set `sizes`, and use a custom loader for your own CDN.

**Explanation:** Without allowlisting, external images aren't optimised, which also prevents abuse of your optimiser.

**Example:**

```ts
images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.bpobox.com' }] }
```

**Say it like this:** "Remote images are allowlisted, and responsive `sizes` stop phones downloading desktop images."

---

**Q33. How do you load third-party scripts efficiently?**

**Short answer:** `next/script` with a strategy: `beforeInteractive`, `afterInteractive` or `lazyOnload`.

**Explanation:** Most third-party scripts should load after interaction or lazily to protect INP and LCP.

**Example:**

```tsx
<Script src="https://analytics.example.com/a.js" strategy="lazyOnload" />
```

**Say it like this:** "Third-party scripts load as late as their purpose allows."

---

## 🔴 Level 3 — Advanced

**Q34. What is the RSC payload?**

**Short answer:** A compact serialised description of the rendered Server Component tree, with references to client chunks and their props.

**Explanation:** It streams to the browser and is how client navigation updates the page without full HTML reloads.

**Example:** Navigating from `/calls` to `/calls/123` fetches an RSC payload for the changed segment only.

**Say it like this:** "The RSC payload is the server's rendered output in a form React can merge into the existing page."

---

**Q35. How do Server Components reduce bundle size?**

**Short answer:** Their code and dependencies never ship to the browser; only their output does.

**Explanation:** Heavy libraries like markdown parsers and date utilities used only for rendering cost the client nothing.

**Example:** Rendering transcripts with a 60 KB markdown library in a Server Component ships 0 KB of it.

**Say it like this:** "Anything that only renders static output belongs on the server, where its dependencies are free."

---

**Q36. What are parallel routes?**

**Short answer:** `@`-prefixed folders render simultaneously as named slots in a layout, each with its own loading and error states.

**Explanation:** Useful for dashboards with independent panels.

**Example:**

```tsx
export default function Layout({ children, analytics, team }) {
  return <>{children}<aside>{analytics}</aside><section>{team}</section></>;
}
```

**Say it like this:** "Parallel routes let dashboard panels load and fail independently."

---

**Q37. What are intercepting routes?**

**Short answer:** Routes like `(.)photo/[id]` that show a modal over the current page while the URL updates; visiting directly shows the full page.

**Explanation:** It gives shareable modal URLs, like Instagram's photo modal.

**Example:** Clicking a call row opens `/calls/123` as a modal over the list; refreshing shows the full call page.

**Say it like this:** "Intercepting routes make modals linkable without losing the page behind them."

---

**Q38. What is Partial Prerendering (PPR)?**

**Short answer:** A static shell served instantly, with dynamic Suspense sections streamed in the same response.

**Explanation:** You get static speed and dynamic freshness on one page.

**Example:** A product page's layout and description are static; price and stock stream in per request.

**Say it like this:** "PPR stops the most dynamic bit of a page from making the whole page dynamic."

---

**Q39. Edge runtime vs Node.js runtime?**

**Short answer:** Edge has fast cold starts near users but limited APIs; Node.js has the full ecosystem.

**Explanation:** Many npm packages and native modules don't run on the edge. Choose per route.

**Example:** Middleware and geolocation run on the edge; a route using the Prisma client runs on Node.

**Say it like this:** "Edge for lightweight, latency-sensitive logic; Node for anything that needs the full ecosystem."

---

**Q40. How do you stream responses, such as AI tokens, from a route handler?**

**Short answer:** Return a `Response` wrapping a `ReadableStream` with `Content-Type: text/event-stream`.

**Explanation:** Enqueue SSE-formatted chunks as tokens arrive and close at the end.

**Example:**

```ts
export async function POST(req: Request) {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(c) {
      for await (const t of llm(await req.json())) c.enqueue(enc.encode(`data: ${JSON.stringify(t)}\n\n`));
      c.enqueue(enc.encode('data: [DONE]\n\n')); c.close();
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
}
```

**Say it like this:** "A route handler streams tokens as SSE, so the browser shows the answer as it's generated."

---

**Q41. How do you build a multi-tenant app with Next.js?**

**Short answer:** Resolve the tenant from the hostname in middleware, rewrite to a `[tenant]` segment, load tenant config in the layout, and scope caches and data by tenant.

**Explanation:** Theming uses CSS variables; every data function filters by tenant on the server.

**Example:**

```ts
const tenant = req.headers.get('host')!.split('.')[0];
return NextResponse.rewrite(new URL(`/${tenant}${req.nextUrl.pathname}`, req.url));
```

**Say it like this:** "The hostname decides the tenant, and every cache key and query includes it."

---

**Q42. How do you set security headers and a CSP with nonces?**

**Short answer:** Generate a per-request nonce in middleware, set it in the `Content-Security-Policy` header, and Next.js applies it to its scripts.

**Explanation:** Add HSTS, `frame-ancestors` and `Permissions-Policy` via config headers or middleware.

**Example:**

```ts
const nonce = btoa(crypto.randomUUID());
res.headers.set('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; frame-ancestors 'none'`);
```

**Say it like this:** "A nonce-based CSP means only our scripts run, even if something gets injected."

---

**Q43. What should you know about Server Action security?**

**Short answer:** Next.js mitigates CSRF by checking Origin and Host, but authorisation and validation are always your job.

**Explanation:** Don't capture sensitive values in inline actions, and return minimal data.

**Example:** An action closing over a `userId` from the page can be replayed by another user if it doesn't re-check the session.

**Say it like this:** "The framework handles CSRF; I handle who's allowed to do what, inside every action."

---

**Q44. How can data leak to the client?**

**Short answer:** Passing whole database objects as props to client components serialises every field into the page.

**Explanation:** Map to DTOs, use `server-only`, and consider React's taint APIs.

**Example:**

```tsx
<AgentCard agent={{ id: a.id, name: a.name }} />   // not the full record with internal notes
```

**Say it like this:** "Anything passed to a client component is in the page source, so I pass small DTOs."

---

**Q45. How do you avoid request waterfalls?**

**Short answer:** Parallel `Promise.all`, the preload pattern, sibling Suspense boundaries, and fetching only what each layout needs.

**Explanation:** Sequential awaits in nested components multiply latency.

**Example:**

```ts
export const preloadCall = (id: string) => void getCall(id); // start early, await later
```

**Say it like this:** "I start fetches as early as possible and let independent sections load side by side."

---

**Q46. Why is data stale after a mutation, and how do you fix it?**

**Short answer:** The cache wasn't invalidated; call `revalidatePath` or `revalidateTag` in the action, and `router.refresh()` if needed.

**Explanation:** Both the server cache and the client router cache can hold old data.

**Example:** After `submitScore`, `revalidateTag('call-123')` refreshes the call page's data.

**Say it like this:** "Every mutation explicitly invalidates the data it changed."

---

**Q47. How do you add instrumentation and observability?**

**Short answer:** `instrumentation.ts` to register OpenTelemetry or Sentry, `onRequestError` for server errors, and `useReportWebVitals` for Core Web Vitals.

**Explanation:** This connects server traces, errors and real-user metrics.

**Example:**

```ts
export function register() { if (process.env.NEXT_RUNTIME === 'nodejs') initSentry(); }
```

**Say it like this:** "Server errors, traces and Web Vitals are wired in from the start, not after the first incident."

---

**Q48. How do you deploy outside Vercel?**

**Short answer:** `output: 'standalone'` for a minimal Docker image, a shared cache handler for multiple instances, a CDN in front, and an image optimisation service.

**Explanation:** Without a shared cache, ISR pages differ between instances.

**Example:** Docker on ECS with a Redis cache handler and CloudFront in front.

**Say it like this:** "Standalone output plus a shared cache makes Next.js run consistently on any container platform."

---

**Q49. How do you analyse bundles and improve performance?**

**Short answer:** `@next/bundle-analyzer`, `next/dynamic` with `ssr: false` for browser-only widgets, small `'use client'` boundaries, and fewer root providers.

**Explanation:** Root-level client providers pull large amounts of code into every page.

**Example:**

```ts
const CallRoom = dynamic(() => import('./CallRoom'), { ssr: false });
```

**Say it like this:** "I analyse bundles, lazy-load heavy browser-only code and keep client boundaries small."

---

**Q50. How do you handle internationalisation?**

**Short answer:** A `[locale]` segment, locale detection in middleware, dictionaries loaded in Server Components, and `hreflang` alternates.

**Explanation:** Loading dictionaries on the server means translations don't ship as JavaScript.

**Example:** `/es/calls` loads `dictionaries/es.json` in the layout.

**Say it like this:** "Locale is part of the URL, and translations render on the server."

---

**Q51. How do you test a Next.js app?**

**Short answer:** Vitest or Jest with RTL for client components, E2E (Playwright) for Server Components and flows, and unit tests for data functions.

**Explanation:** Mock `next/navigation` in unit tests.

**Example:**

```ts
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/calls' }));
```

**Say it like this:** "Client components get unit tests, server-rendered flows get Playwright, and data functions are tested directly."

---

**Q52. How do you migrate from the Pages Router to the App Router?**

**Short answer:** Incrementally: move layouts, convert `getServerSideProps` to async Server Components, API routes to route handlers, `next/router` to `next/navigation`, and push providers down.

**Explanation:** Both routers coexist, so pages can move one at a time.

**Example:** Start with `/about` and `/pricing`, then the dashboard once patterns are proven.

**Say it like this:** "Migrate page by page, starting with simple static pages, while both routers run side by side."

---

## 🧩 Level 4 — Scenario-Based

**Q53. The marketing site is fast, but the dashboard behind login feels slow after migrating to Next.js.**

**Short answer:** Profile; usually too much client JS in the root layout, waterfalls, or everything uncached. Move providers down, parallelise fetches, stream slow widgets, and cache tenant config.

**Explanation:** Authenticated pages are dynamic, so slow data and heavy client bundles show directly.

**Example:** Moving a charting provider from the root layout to the analytics route cut the dashboard's JS by 40%.

**Say it like this:** "I'd measure first; usually heavy root providers and sequential fetches are the culprits."

---

**Q54. After a deploy, a page shows another user's data.**

**Short answer:** Personalised data was cached as static; it's a security incident. Purge the cache, mark the route dynamic, scope caches per user or tenant, and audit caching.

**Explanation:** A fetch cached across users or a route treated as static serves one user's render to everyone.

**Example:** Adding `cache: 'no-store'` and reading the session cookie made the route dynamic and per-user.

**Say it like this:** "First contain it by purging the cache, then fix the caching config and add a test so it can't recur."

---

**Q55. A dashboard showing local times throws hydration mismatch errors.**

**Short answer:** Server and client format times in different time zones; format on the client after mount or pass an explicit time zone to both.

**Explanation:** Servers often run in UTC while users are elsewhere.

**Example:**

```ts
new Intl.DateTimeFormat('en-IN', { timeStyle: 'short', timeZone: user.timeZone }).format(date);
```

**Say it like this:** "Use the same explicit time zone on server and client, or render times after mount."

---

**Q56. A heavy video SDK breaks server rendering with `window is not defined`.**

**Short answer:** Load it only in the browser with `next/dynamic` and `ssr: false`, inside a client-only boundary.

**Explanation:** The SDK touches `window` at import time, which fails on the server.

**Example:**

```tsx
const CallRoom = dynamic(() => import('./CallRoom'), { ssr: false, loading: () => <Spinner /> });
```

**Say it like this:** "Browser-only SDKs load dynamically on the client, which also keeps them out of other pages' bundles."

---

**Q57. A user without permission manages to call a Server Action.**

**Short answer:** Add session and permission checks inside every action; hiding a button isn't security.

**Explanation:** Actions are endpoints and can be called directly.

**Example:** `if (!session?.permissions.includes('calls:score')) throw new Error('Forbidden');` at the top of `submitScore`.

**Say it like this:** "Every action checks permissions itself, because the UI can be bypassed."

---

**Q58. You need Twilio webhooks to trigger processing.**

**Short answer:** A route handler verifies the Twilio signature, enqueues the work, returns 200 quickly, and processing is idempotent.

**Explanation:** Webhooks retry and can arrive twice, so deduplicate by the recording ID.

**Example:**

```ts
if (!twilio.validateRequest(token, sig, url, params)) return new Response('Forbidden', { status: 403 });
await queue.add('score-call', { recordingSid: params.RecordingSid }, { jobId: params.RecordingSid });
return new Response('OK');
```

**Say it like this:** "Verify, enqueue, return fast, and make processing idempotent by job ID."

---

**Q59. The SEO team complains that pages aren't indexed well.**

**Short answer:** Server-render public pages, add metadata and canonicals, a sitemap and robots file, structured data, crawlable links and fast LCP.

**Explanation:** Client-only rendering and JS-only links are the usual problems.

**Example:** `app/sitemap.ts` lists every public page; product pages use ISR.

**Say it like this:** "Public pages must be server-rendered with real links and proper metadata."

---

**Q60. Build times are long because of thousands of static pages.**

**Short answer:** Pre-build only popular pages and generate the rest on demand with ISR; cache builds in CI.

**Explanation:** Most traffic hits a small fraction of pages.

**Example:** Build the top 500 pages; the other 20,000 render on first request and are cached.

**Say it like this:** "Build what's popular, generate the long tail on demand."

---

## 🎯 From Your Resume

**Q61. "Slaylink used Next.js with NestJS. How did you split responsibilities?"**

**Short answer:** Next.js handled presentation, SEO pages, routing and BFF concerns; NestJS handled domain logic, auth, the GraphQL API and the database.

**Explanation:** Keeping business rules in one backend made them reusable by other clients. Then describe exactly what you built.

**Example:** A creator profile page in Next.js fetched one GraphQL query from NestJS that combined profile, posts and brand campaigns.

**Say it like this:** "Next.js owned the presentation and BFF layer; NestJS owned the business logic and data, so rules lived in one place."

---

**Q62. "Would you build InterpretIQ on Next.js? Why or why not?"**

**Short answer:** Most of InterpretIQ is authenticated and real-time, so a SPA/PWA works; Next.js would add a BFF for token security, server-rendered dashboards and public pages.

**Explanation:** The trade-off is more server infrastructure and framework complexity.

**Example:** A v2 could use Next.js route handlers to hold OAuth tokens server-side, with the call room still a client-only component.

**Say it like this:** "The call experience doesn't need SSR, but a BFF that keeps tokens off the browser is a strong security reason to consider Next.js for v2."

---

**Q63. "How would you implement the SSE compliance chat in Next.js?"**

**Short answer:** A route handler streams LLM tokens as `text/event-stream`, authenticated by the session cookie, read on the client with fetch streaming, rate-limited per user and tenant.

**Explanation:** Tenant isolation happens in the retrieval query before anything reaches the model; usage is logged without PHI.

**Example:** `POST /api/compliance-chat` → auth → tenant-filtered retrieval → LLM stream → SSE response.

**Say it like this:** "A streaming route handler with cookie auth, tenant-filtered retrieval and rate limits, consumed with fetch streaming on the client."
