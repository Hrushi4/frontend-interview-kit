# 03 — Express.js

Express is the most common Node web framework, and it's what you used for the Blood Bank and Quiz App backends. Interviews focus on middleware, routing, error handling and production hardening.

**How this file is organised**

- **Part A — Understand the topic:** how Express handles a request, middleware, routers and error handling, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is Express?

Express is a small, unopinionated web framework for Node. It gives you routing, a middleware pipeline and helpers for requests and responses. Everything else (validation, auth, database access, structure) is up to you.

### The request pipeline

Every request passes through a chain of **middleware** functions in the order you registered them. Each one can read or change `req` and `res`, end the response, or call `next()` to pass control on.

```text
request → logger → cors → json parser → auth → route handler → response
                                         ↘ error? → error middleware → response
```

### Middleware types

- **Application middleware:** `app.use(fn)`, runs for every request.
- **Router middleware:** attached to an `express.Router()`, runs for that group of routes.
- **Route handlers:** `app.get('/calls/:id', handler)`.
- **Error middleware:** has **four** arguments `(err, req, res, next)` and runs when something calls `next(err)` or throws.

### Structure for a real app

Express doesn't impose structure, so teams usually adopt layers:

```text
routes/      → URL + method → controller
controllers/ → parse request, call service, shape response
services/    → business logic
repositories/→ database access
middleware/  → auth, validation, rate limiting, error handling
```

### Why interviewers ask about it

Express questions reveal whether you can build a production-ready API: correct middleware order, central error handling, validation, security headers and clean structure, not just "hello world".

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. What is middleware in Express?**

**Short answer:** A function `(req, res, next)` that runs during the request pipeline; it can modify the request, end the response, or call `next()`.

**Explanation:** Order matters: middleware runs in the order it's registered. Forgetting `next()` (without sending a response) leaves the request hanging.

**Example:**

```js
app.use((req, res, next) => { req.startedAt = Date.now(); next(); });
```

**Say it like this:** "Middleware is a pipeline. Each step either handles the request or passes it on, and the order I register them in is the order they run."

---

**Q2. How does routing work?**

**Short answer:** You map an HTTP method and path to handlers, with route parameters (`:id`), query strings and routers to group related routes.

**Explanation:** `express.Router()` lets you mount a group at a prefix, like `/api/calls`, keeping files small.

**Example:**

```js
const calls = express.Router();
calls.get('/:id', getCall);
calls.post('/', authorize('qa'), createCall);
app.use('/api/calls', calls);
```

**Say it like this:** "I group routes by resource with routers, mount them under a versioned prefix, and attach auth middleware at the router or route level."

---

**Q3. `req.params` vs `req.query` vs `req.body`?**

**Short answer:** `params` are path segments (`/calls/:id`), `query` is the query string (`?status=open`), and `body` is the parsed request body.

**Explanation:** All three are user input, so all must be validated. `req.body` needs a parser like `express.json()`.

**Example:** `GET /calls/42?status=flagged` → `req.params.id === '42'`, `req.query.status === 'flagged'`.

**Say it like this:** "Params identify the resource, query filters it, body carries the data, and I validate all three because they're all untrusted."

---

**Q4. How do you handle errors centrally?**

**Short answer:** Throw or call `next(err)` anywhere, and handle everything in one error middleware with four arguments, registered last.

**Explanation:** Map known errors to status codes (validation → 400, not found → 404), log unknown ones, and never leak stack traces to clients.

**Example:**

```js
app.use((err, req, res, _next) => {
  const status = err.status ?? 500;
  if (status >= 500) logger.error({ err, requestId: req.id });
  res.status(status).json({ error: status >= 500 ? 'Internal error' : err.message, requestId: req.id });
});
```

**Say it like this:** "One error handler at the end owns the response format. Clients get a clean message and a request ID; the logs get the stack."

---

**Q5. How are async errors handled in Express?**

**Short answer:** Express 5 forwards rejected promises from handlers to the error middleware automatically; in Express 4 you need a wrapper or `express-async-errors`.

**Explanation:** In Express 4, an unhandled rejection in an async handler never reaches the error middleware and the request hangs.

**Example:**

```js
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
app.get('/calls/:id', asyncHandler(async (req, res) => res.json(await svc.get(req.params.id))));
```

**Say it like this:** "In Express 4 I wrap async handlers so rejections reach the error middleware. Express 5 does that natively."

---

**Q6. How do you serve JSON and set status codes properly?**

**Short answer:** `res.status(201).json(data)` for creates, 200 for reads and updates, 204 with no body for deletes, and correct 4xx and 5xx codes for errors.

**Explanation:** Consistent status codes let clients and monitoring behave correctly.

**Example:** `res.status(201).location(\`/api/calls/${call.id}\`).json(call)`.

**Say it like this:** "Status codes are part of the API contract, so I use them deliberately: 201 with a Location header on create, 204 on delete."

---

## 🟡 Level 2 — Intermediate

**Q7. How do you validate requests?**

**Short answer:** A validation middleware with a schema library (Zod, Joi, express-validator) that rejects invalid input with a 400 before the handler runs.

**Explanation:** Validation also strips unknown fields, preventing mass assignment (a user sending `role: "admin"`).

**Example:**

```js
const validate = (schema) => (req, res, next) => {
  const r = schema.safeParse(req.body);
  if (!r.success) return res.status(400).json({ errors: r.error.flatten() });
  req.body = r.data; next();
};
app.post('/api/scores', validate(ScoreInput), createScore);
```

**Say it like this:** "Every route has a schema. Invalid input never reaches business logic, and unknown fields are stripped so nobody can set their own role."

---

**Q8. How do you implement authentication middleware?**

**Short answer:** Read the token from a cookie or `Authorization` header, verify it, attach the user to `req`, or respond 401.

**Explanation:** Authorisation is a separate middleware that checks roles or permissions and responds 403.

**Example:**

```js
const authenticate = (req, res, next) => {
  try { req.user = jwt.verify(req.cookies.access, env.JWT_PUBLIC_KEY, { algorithms: ['RS256'] }); next(); }
  catch { res.status(401).json({ error: 'Unauthenticated' }); }
};
const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden' });
```

**Say it like this:** "Authentication proves who you are and returns 401 if it fails; authorisation decides what you can do and returns 403. They're separate middleware."

---

**Q9. Which security middleware do you add?**

**Short answer:** `helmet` for security headers, strict `cors`, body size limits, rate limiting, and `cookie-parser` with secure cookie flags.

**Explanation:** Also disable `x-powered-by`, set `trust proxy` correctly behind a load balancer so IPs and secure cookies work.

**Example:**

```js
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: ['https://app.example.com'], credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 60_000, max: 10 }));
```

**Say it like this:** "Helmet, a strict CORS allowlist, body limits and rate limits on auth routes are my baseline before any feature code."

---

**Q10. How do you configure CORS correctly?**

**Short answer:** Allow only known origins, enable credentials only if you use cookies, and never combine `*` with credentials.

**Explanation:** CORS is enforced by browsers; it doesn't protect against server-to-server calls, so authorisation still matters.

**Example:** `cors({ origin: (o, cb) => cb(null, allowed.includes(o)), credentials: true })`.

**Say it like this:** "CORS is an allowlist of who can read responses from a browser, not a security wall. Real protection is auth on every endpoint."

---

**Q11. How do you structure a large Express app?**

**Short answer:** Layers (routes, controllers, services, repositories) or feature folders, with dependency injection by passing dependencies in rather than importing singletons.

**Explanation:** Thin controllers make services easy to unit test. Feature folders scale better than one giant `controllers/` folder.

**Example:**

```text
src/features/calls/{calls.routes.ts, calls.controller.ts, calls.service.ts, calls.repo.ts, calls.schema.ts}
```

**Say it like this:** "Controllers only translate HTTP; services hold business rules; repositories hold SQL. That keeps the logic testable without spinning up a server."

---

**Q12. How do you handle file uploads?**

**Short answer:** Prefer direct-to-S3 uploads with presigned URLs; if uploads go through the server, use `multer` with size and type limits and stream to storage.

**Explanation:** Never trust the file extension; check content type and scan if needed. Store files outside the web root with random names.

**Example:** `POST /uploads` returns a presigned PUT URL valid for 5 minutes; the client uploads straight to S3.

**Say it like this:** "Big files shouldn't pass through the API. Presigned URLs keep the server out of the data path and still control who can upload what."

---

**Q13. How do you add request logging and correlation IDs?**

**Short answer:** Assign each request an ID (or reuse the incoming `x-request-id`), log with a structured logger like `pino`, and include the ID in every log line and error response.

**Explanation:** Structured JSON logs are searchable; correlation IDs let you follow a request across services.

**Example:**

```js
app.use(pinoHttp({ genReqId: (req) => req.headers['x-request-id'] ?? crypto.randomUUID() }));
```

**Say it like this:** "Every request gets an ID that appears in every log line and in the error response, so a support ticket leads straight to the logs."

---

**Q14. How do you implement pagination, filtering and sorting?**

**Short answer:** Validate query parameters, allowlist sortable fields, cap page size, and prefer cursor pagination for large or changing data.

**Explanation:** Never pass a user-supplied sort field directly into SQL. Return `nextCursor` and total only if it's cheap.

**Example:** `GET /api/calls?status=flagged&sort=-createdAt&limit=50&cursor=eyJpZCI6...`.

**Say it like this:** "Query parameters are validated and allowlisted, page size is capped, and big lists use cursors so pages don't shift as data changes."

---

## 🔴 Level 3 — Advanced

**Q15. Express vs NestJS vs Fastify: when would you choose each?**

**Short answer:** Express for small services and maximum flexibility, Fastify for raw performance with schema-based validation, NestJS for large teams that want structure, DI and conventions.

**Explanation:** NestJS can run on Express or Fastify underneath. Team size and long-term maintenance usually decide more than benchmarks.

**Example:** A small webhook receiver in Express; a multi-module SaaS backend in NestJS.

**Say it like this:** "Express for small, simple services; NestJS when many developers work on one codebase and consistency matters more than freedom."

---

**Q16. How do you make an Express API production-ready?**

**Short answer:** Validation, central errors, structured logs, health checks, graceful shutdown, security headers, rate limits, timeouts, metrics and tests.

**Explanation:** Add `/healthz` (process alive) and `/readyz` (dependencies reachable) for the orchestrator.

**Example:** `/readyz` pings PostgreSQL and Redis; the load balancer stops sending traffic if it fails.

**Say it like this:** "Production-ready means it fails loudly, logs clearly, shuts down cleanly and can be observed, not just that the happy path works."

---

**Q17. How do you version an Express API?**

**Short answer:** Usually a URL prefix (`/api/v1`) with separate routers per version, deprecating old versions with headers and a timeline.

**Explanation:** Avoid breaking changes inside a version: add fields, don't remove or rename them.

**Example:** `app.use('/api/v1', v1Router); app.use('/api/v2', v2Router);` plus a `Deprecation` header on v1.

**Say it like this:** "Additive changes stay in the same version; breaking changes get a new version and a published deprecation date."

---

## 🧩 Level 4 — Scenario-Based

**Q18. Some requests hang forever and never respond. How do you debug it?**

**Short answer:** Look for middleware that neither calls `next()` nor responds, unhandled async errors in Express 4, and downstream calls without timeouts.

**Explanation:** Add server and outbound timeouts so nothing waits forever, then trace which handler never finished.

**Example:** An auth middleware returned early on a missing header without sending a response.

**Say it like this:** "A hanging request means some code path forgot to respond or call next, or is waiting on something with no timeout. I add timeouts first, then find that path."

---

**Q19. A security review found that users can update other users' records. How do you fix it?**

**Short answer:** Enforce ownership and tenant checks in the service or query for every write, not just authentication, and add tests for it.

**Explanation:** This is IDOR (broken object-level authorisation), the top API security risk.

**Example:**

```sql
UPDATE scorecards SET ... WHERE id = $1 AND tenant_id = $2 AND reviewer_id = $3
```

**Say it like this:** "Being logged in isn't enough. Every query includes the tenant and ownership condition, and a test proves another user gets a 404."

---

## 🟢 More Basics

**Q20. What is `app.use` vs `app.get` vs `app.all`?**

**Short answer:** `app.use` mounts middleware for a path prefix and every method; `app.get` handles GET on an exact route; `app.all` handles every method on an exact route.

**Explanation:** `app.use('/api', fn)` runs for `/api`, `/api/calls` and so on.

**Example:** `app.use('/api', authenticate)` protects every API route.

**Say it like this:** "use is for middleware on a prefix, get/post are for exact routes."

---

**Q21. How do you serve static files in Express?**

**Short answer:** `express.static('public')`, ideally behind a CDN, with cache headers for hashed assets.

**Explanation:** In production, static assets usually live on S3 and CloudFront, not the API.

**Example:** `app.use('/assets', express.static('dist/assets', { immutable: true, maxAge: '1y' }))`.

**Say it like this:** "Express can serve static files, but in production I put them on a CDN and keep the API for data."

---

**Q22. What does `res.send` vs `res.json` vs `res.end` do?**

**Short answer:** `send` sends a body with an inferred content type, `json` serialises an object with `application/json`, `end` ends the response with no body.

**Explanation:** Use `res.status(204).end()` for empty responses.

**Example:** `res.json({ id })` vs `res.status(204).end()`.

**Say it like this:** "json for API responses, end for empty ones, and status codes set explicitly."

---

**Q23. How do you read headers and cookies?**

**Short answer:** `req.get('Header-Name')` for headers, `req.cookies` after `cookie-parser`, `req.signedCookies` for signed ones.

**Explanation:** Header names are case-insensitive.

**Example:** `const requestId = req.get('x-request-id') ?? crypto.randomUUID()`.

**Say it like this:** "Headers through req.get, cookies through cookie-parser, and both treated as untrusted input."

---

**Q24. How do you set cookies securely in Express?**

**Short answer:** `res.cookie(name, value, { httpOnly: true, secure: true, sameSite: 'lax' or 'strict', maxAge, path })`.

**Explanation:** Behind a proxy, set `trust proxy` so `secure` cookies work.

**Example:** `res.cookie('refresh', token, { httpOnly: true, secure: true, sameSite: 'strict', path: '/auth/refresh', maxAge: 7 * 864e5 })`.

**Say it like this:** "Session cookies are HttpOnly, Secure and SameSite, and scoped to the path that needs them."

---

**Q25. What is `next('route')` and `next(err)`?**

**Short answer:** `next()` continues to the next middleware; `next('route')` skips remaining handlers for this route; `next(err)` jumps to error middleware.

**Explanation:** Any non-`'route'` argument to `next` is treated as an error.

**Example:** `if (!valid) return next(new BadRequest('Invalid'))`.

**Say it like this:** "Calling next with an error skips everything to the error handler, which is how I keep error handling in one place."

---

**Q26. How do you handle 404s for unknown routes?**

**Short answer:** Add a catch-all middleware after all routes that responds 404 in your standard error format.

**Explanation:** It must come after routes but before the error handler.

**Example:** `app.use((req, res) => res.status(404).json({ error: 'not_found', path: req.path }))`.

**Say it like this:** "A final catch-all returns a consistent 404, so unknown routes don't fall through to HTML error pages."

---

**Q27. What is `express.Router` mergeParams?**

**Short answer:** It lets a nested router access params from its parent route, such as `:callId` in `/calls/:callId/scorecards`.

**Explanation:** Without it, `req.params.callId` is undefined in the child router.

**Example:** `const scorecards = express.Router({ mergeParams: true }); calls.use('/:callId/scorecards', scorecards)`.

**Say it like this:** "Nested resources need mergeParams so the child router sees the parent's IDs."

---

## 🟡 More Intermediate

**Q28. How do you add request timeouts in Express?**

**Short answer:** Set `server.requestTimeout` and `headersTimeout`, add a timeout middleware for slow handlers, and put timeouts on every outbound call.

**Explanation:** Without timeouts, slow dependencies tie up connections indefinitely.

**Example:** `server.requestTimeout = 30_000; server.keepAliveTimeout = 65_000;` (longer than the ALB idle timeout).

**Say it like this:** "Every layer has a timeout, and keep-alive is set longer than the load balancer's so connections don't get cut unexpectedly."

---

**Q29. How do you compress responses?**

**Short answer:** The `compression` middleware (gzip or Brotli) for text responses, or let the proxy or CDN do it.

**Explanation:** Skip compression for already-compressed content and tiny responses.

**Example:** `app.use(compression({ threshold: 1024 }))`.

**Say it like this:** "Compression is cheap and saves bandwidth, but usually the CDN or proxy handles it better than Node."

---

**Q30. How do you implement health and readiness endpoints?**

**Short answer:** `/healthz` returns 200 if the process is alive; `/readyz` checks dependencies and returns 503 when the instance shouldn't get traffic.

**Explanation:** Don't let liveness depend on the database, or a database blip restarts every container.

**Example:** `/readyz` runs `SELECT 1` and `PING` with short timeouts.

**Say it like this:** "Liveness says 'restart me', readiness says 'don't send me traffic'. Mixing them causes cascading restarts."

---

**Q31. How do you handle multipart form data?**

**Short answer:** `multer` or `busboy`, with limits on file size, count and types, streaming to storage.

**Explanation:** Validate the actual content type, not just the extension.

**Example:** `multer({ limits: { fileSize: 10 * 1024 * 1024, files: 1 } })`.

**Say it like this:** "Uploads get strict limits and are streamed to storage; anything big uses presigned URLs instead."

---

**Q32. How do you prevent CSRF in an Express app that uses cookies?**

**Short answer:** SameSite cookies, CSRF tokens (double-submit or synchroniser), and checking the `Origin` header on state-changing requests.

**Explanation:** Pure bearer-token APIs (no cookies) aren't vulnerable to CSRF.

**Example:** Reject POST requests whose `Origin` isn't in the allowlist.

**Say it like this:** "With cookie auth, SameSite plus an Origin check stops CSRF; a token adds defence in depth."

---

**Q33. How do you structure dependency injection without a framework?**

**Short answer:** Build dependencies in one composition root and pass them into route factories, instead of importing singletons everywhere.

**Explanation:** This makes testing easy: pass fakes into the factory.

**Example:**

```ts
export const callsRouter = ({ callsService }: { callsService: CallsService }) =>
  express.Router().get('/:id', async (req, res) => res.json(await callsService.get(req.params.id, req.user)));
app.use('/api/calls', callsRouter({ callsService: new CallsService(repo, queue) }));
```

**Say it like this:** "Route factories receive their dependencies, so tests can inject fakes without any mocking library."

---

**Q34. How do you write integration tests for an Express app?**

**Short answer:** Export the app without calling `listen`, use Supertest to send requests, and run against a test database.

**Explanation:** Test status codes, response shape, auth and side effects.

**Example:**

```ts
const res = await request(app).get('/api/calls/123').set('Cookie', sessionCookie(agent));
expect(res.status).toBe(404);
```

**Say it like this:** "Supertest drives the real app in-process, so tests cover middleware, routing and the database together."

---

**Q35. How do you secure an Express app's error output?**

**Short answer:** Never return stack traces or internal messages in production; log them with a request ID and return a generic message.

**Explanation:** `NODE_ENV=production` also disables Express's verbose default error pages.

**Example:** Return `{ error: 'internal', requestId }` for 500s.

**Say it like this:** "Clients get a request ID, not a stack trace. The details stay in our logs."

---

**Q36. How do you implement API key authentication for partners?**

**Short answer:** Issue random keys, store only their hashes, look them up by a prefix, scope them to permissions, rate limit per key, and support rotation.

**Explanation:** Send keys in a header, never in URLs (they leak into logs).

**Example:** Key `pk_live_8f2a…`; store `sha256(key)`; header `Authorization: Bearer pk_live_…`.

**Say it like this:** "API keys are treated like passwords: hashed at rest, scoped, rate limited and rotatable."

---

## 🔴 More Advanced

**Q37. How do you run Express behind a reverse proxy correctly?**

**Short answer:** Set `trust proxy` to the number of proxies so `req.ip`, `req.protocol` and secure cookies use the forwarded headers.

**Explanation:** Trusting all proxies lets clients spoof `X-Forwarded-For` and bypass IP rate limits.

**Example:** `app.set('trust proxy', 1)` behind a single ALB.

**Say it like this:** "trust proxy should match the real number of proxies, otherwise rate limiting by IP can be bypassed."

---

**Q38. How would you migrate from Express 4 to Express 5?**

**Short answer:** Update the dependency, fix removed APIs (`req.param`, `res.send(status)`), update path syntax for wildcards, and drop async wrappers since rejections are handled.

**Explanation:** Run the full test suite; path-to-regexp changes can silently change route matching.

**Example:** `app.get('/*', …)` becomes `app.get('/*splat', …)`.

**Say it like this:** "The main wins are native async error handling and stricter routing; the risk is route-matching changes, so tests matter."

---

**Q39. How do you stream large responses from Express?**

**Short answer:** Write chunks with `res.write` or pipe a stream into `res`, set the right headers, handle client disconnects, and respect backpressure.

**Explanation:** Use `pipeline` so errors and disconnects clean up properly.

**Example:** CSV export: database cursor → CSV transform → `res`.

**Say it like this:** "Large responses are streamed with pipeline, so memory stays flat and a disconnected client stops the work."

---

**Q40. How do you implement multi-tenancy in Express?**

**Short answer:** Resolve the tenant from the verified token in auth middleware, store it on `req` or in AsyncLocalStorage, and enforce it in every query.

**Explanation:** Never trust a tenant ID from the body, query or header.

**Example:** `req.tenantId = req.user.tid;` repositories require `tenantId` as an argument.

**Say it like this:** "The tenant comes only from the verified token, and the data layer requires it, so it can't be forgotten."

---

## 🧩 More Scenarios

**Q41. Users behind the same office IP keep getting rate-limited. Why?**

**Short answer:** Limits are keyed only by IP, and many users share one NAT address.

**Explanation:** Key authenticated routes by user or API key; use IP only for unauthenticated endpoints, with higher limits.

**Example:** Login limited per IP and per account; API limited per user.

**Say it like this:** "IP is a bad identity behind NAT, so authenticated traffic is limited per user instead."

---

**Q42. Memory grows steadily in an Express app. Where do you look first?**

**Short answer:** In-memory caches or maps without limits, listeners added per request, and session stores kept in memory.

**Explanation:** The default `express-session` MemoryStore leaks and isn't for production.

**Example:** Switching sessions to Redis stopped the growth.

**Say it like this:** "Anything stored in process memory per user or per request is the first suspect, especially the default session store."

---

**Q43. A route works locally but returns 413 in production. Why?**

**Short answer:** The body exceeds a size limit somewhere: Express's `json({ limit })`, Nginx `client_max_body_size`, or the load balancer.

**Explanation:** Raise the limit deliberately or switch large payloads to uploads.

**Example:** Nginx defaults to 1 MB; the import file was 3 MB.

**Say it like this:** "413 means some layer's body limit was hit, so I check each hop, not just Express."

---

## 🎯 From Your Resume

**Q44. "How did the Blood Bank app enforce different roles?"**

**Short answer:** JWT authentication plus role middleware per route group: donors, hospitals and organisations each had their own allowed routes and data scope.

**Explanation:** Also mention data scoping: a hospital only sees its own consumption records, enforced in the query.

**Example:** `router.get('/consumption', authenticate, authorize('hospital'), listOwnConsumption)` where the query filters by `req.user.hospitalId`.

**Say it like this:** "Each role had its own route group behind an authorize middleware, and queries were scoped to the logged-in organisation, so roles couldn't see each other's data."
