# 05 — REST API Design

Almost every backend interview asks you to design or critique an API. You've designed APIs consumed by React frontends across InterpretIQ and BpoBox, so you can answer from both sides of the contract.

**How this file is organised**

- **Part A — Understand the topic:** what REST is, resources and methods, status codes, idempotency, versioning and good API habits, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is REST?

REST (Representational State Transfer) is a style for designing APIs around **resources** (nouns like calls, users, scorecards) that you act on with standard **HTTP methods**. It's stateless: each request carries everything the server needs, such as the auth token.

### Methods and their meaning

| Method | Use | Safe? | Idempotent? |
|---|---|---|---|
| GET | read | yes | yes |
| POST | create, or trigger an action | no | no |
| PUT | replace a whole resource | no | yes |
| PATCH | partially update | no | not necessarily |
| DELETE | remove | no | yes |

**Idempotent** means repeating the same request has the same effect as doing it once. That matters because networks retry.

### Status codes that matter

- **2xx:** 200 OK, 201 Created, 202 Accepted (async work started), 204 No Content.
- **4xx (client's fault):** 400 Bad Request, 401 Unauthenticated, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Too Many Requests.
- **5xx (server's fault):** 500, 502 Bad Gateway, 503 Unavailable, 504 Gateway Timeout.

### A good API looks like this

```text
GET    /v1/calls?status=flagged&limit=50&cursor=abc   list, filtered and paginated
GET    /v1/calls/{id}                                  one call
POST   /v1/calls/{id}/scorecards                       create a scorecard for a call
PATCH  /v1/scorecards/{id}                             partial update
DELETE /v1/scorecards/{id}                             delete
```

Plural nouns, nesting only one level deep, consistent error format, and predictable pagination.

### Why interviewers ask about it

An API is a contract that's expensive to change once clients depend on it. Interviewers want to see that you think about clients, errors, retries, versioning and security, not just URLs.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. What makes an API RESTful?**

**Short answer:** Resources identified by URLs, standard HTTP methods for actions, stateless requests, and representations (usually JSON) with correct status codes.

**Explanation:** Strict REST also includes hypermedia links (HATEOAS), which few real APIs use. Most "REST" APIs are pragmatic resource-oriented HTTP APIs.

**Example:** `GET /calls/42` returns the call; `DELETE /calls/42` deletes it.

**Say it like this:** "Resources as nouns, HTTP methods as verbs, stateless requests and honest status codes. That's what I aim for, rather than academic purity."

---

**Q2. PUT vs PATCH?**

**Short answer:** PUT replaces the whole resource and is idempotent; PATCH changes only the fields sent.

**Explanation:** With PUT, missing fields mean "set to empty"; with PATCH they mean "leave unchanged". JSON Merge Patch is the common PATCH format.

**Example:** `PATCH /scorecards/7 { "comment": "Good greeting" }` changes only the comment.

**Say it like this:** "PUT sends the whole thing, PATCH sends the change. Most UI edits are PATCH."

---

**Q3. What does idempotent mean, and why does it matter?**

**Short answer:** Repeating the request gives the same result as doing it once. It matters because clients, proxies and queues retry.

**Explanation:** POST isn't idempotent by default; add an `Idempotency-Key` header for operations like payments or job creation.

**Example:** A retry of `POST /payments` with the same idempotency key returns the original result instead of charging twice.

**Say it like this:** "Networks retry, so anything with side effects either has to be naturally idempotent or accept an idempotency key."

---

**Q4. 401 vs 403 vs 404?**

**Short answer:** 401: not authenticated. 403: authenticated but not allowed. 404: not found, also used to hide that a resource exists.

**Explanation:** For other tenants' data, return 404 rather than 403 so you don't confirm the resource exists.

**Example:** User from tenant A requests tenant B's call → 404.

**Say it like this:** "401 means log in, 403 means you can't, and for another tenant's data I return 404 so we don't leak that it exists."

---

**Q5. How should URLs be named?**

**Short answer:** Plural nouns, lowercase with hyphens, no verbs, nesting at most one level.

**Explanation:** Actions that don't fit CRUD can be sub-resources (`POST /calls/42/rescore`) rather than verbs in the main path.

**Example:** `/v1/call-recordings/42` not `/v1/getCallRecording?id=42`.

**Say it like this:** "URLs name things; methods say what to do with them. For real actions I use a clear sub-resource."

---

**Q6. What should an error response look like?**

**Short answer:** A consistent JSON shape with a machine-readable code, a human message, field errors for validation, and a request ID.

**Explanation:** RFC 9457 (Problem Details) is a standard format. Never leak stack traces or SQL.

**Example:**

```json
{ "type": "validation_error", "message": "Invalid input", "errors": { "score": "must be 0–100" }, "requestId": "req_8f2a" }
```

**Say it like this:** "Every error has the same shape, a code the frontend can switch on, and a request ID for support."

---

## 🟡 Level 2 — Intermediate

**Q7. Offset vs cursor pagination?**

**Short answer:** Offset (`page=3`) is simple but slow on deep pages and skips or repeats rows when data changes; cursor pagination is stable and fast.

**Explanation:** Cursors encode the last seen sort key (for example `createdAt` plus `id`) and use an indexed `WHERE` clause.

**Example:**

```sql
SELECT * FROM calls WHERE tenant_id = $1 AND (created_at, id) < ($2, $3)
ORDER BY created_at DESC, id DESC LIMIT 50;
```

**Say it like this:** "For feeds and big tables I use cursors: constant speed at any depth, and no duplicates when new rows arrive."

---

**Q8. How do you version an API?**

**Short answer:** URL versioning (`/v1`) is most common; header or media-type versioning is cleaner but harder to use. Avoid breaking changes inside a version.

**Explanation:** Additive changes (new fields, new endpoints) are safe. Removing or renaming fields needs a new version and a deprecation period.

**Example:** Send `Deprecation` and `Sunset` headers on v1 for six months before removal.

**Say it like this:** "I add, I don't change. Breaking changes get a new version and a public sunset date."

---

**Q9. How do you design long-running operations?**

**Short answer:** Return 202 Accepted with a job resource, then let clients poll it, or push updates by webhook, SSE or WebSocket.

**Explanation:** Keep request handlers fast; do the heavy work in a queue.

**Example:**

```text
POST /v1/calls/42/score  → 202 { "jobId": "j_9", "status": "queued" }
GET  /v1/jobs/j_9        → { "status": "done", "result": { "scorecardId": "s_3" } }
```

**Say it like this:** "Anything slow becomes a job: 202 immediately, then status by polling or a push. That's how our AI scoring worked."

---

**Q10. How do you handle filtering, sorting and field selection?**

**Short answer:** Query parameters with an allowlist of filterable and sortable fields, a capped page size, and optional sparse fields.

**Explanation:** Never pass raw user input into SQL `ORDER BY`. Validate types and ranges.

**Example:** `GET /v1/calls?status=flagged&agentId=12&sort=-createdAt&fields=id,score`.

**Say it like this:** "Filters and sorts are allowlisted and validated, so the API stays fast and safe from injection."

---

**Q11. How do you handle concurrent updates (lost updates)?**

**Short answer:** Optimistic concurrency with an `ETag` or version number: the client sends `If-Match`, and the server returns 412 if the resource changed.

**Explanation:** This stops two reviewers silently overwriting each other's edits.

**Example:**

```sql
UPDATE scorecards SET score = $1, version = version + 1 WHERE id = $2 AND version = $3;
-- 0 rows updated → 409/412 conflict
```

**Say it like this:** "Each record has a version. If someone saved first, your update fails with a conflict instead of silently overwriting their work."

---

**Q12. How do you rate limit an API?**

**Short answer:** Per user, key or IP limits with a token bucket or sliding window, usually in Redis, returning 429 with `Retry-After`.

**Explanation:** Different limits for auth endpoints, expensive endpoints and tenants. Rate limits also protect downstream services.

**Example:** 100 requests per minute per user; 10 login attempts per minute per IP.

**Say it like this:** "Limits live in Redis so every instance shares them, and clients get a 429 with Retry-After so they can back off."

---

**Q13. How do you design webhooks?**

**Short answer:** POST events to subscriber URLs, signed with HMAC, with retries and exponential backoff; receivers must be idempotent.

**Explanation:** Include an event ID and timestamp so receivers can dedupe and reject replays.

**Example:** Twilio calls our webhook when a recording is ready; we verify the signature, store the event ID, enqueue the job and return 200 quickly.

**Say it like this:** "Webhooks should be verified, acknowledged quickly, processed asynchronously, and safe to receive twice, because senders always retry."

---

**Q14. How do you document an API?**

**Short answer:** OpenAPI generated from code or schemas, with examples, error formats and auth described; generate typed clients from it.

**Explanation:** Contract tests or generated types keep docs and implementation in sync.

**Example:** NestJS `@nestjs/swagger` or Zod-to-OpenAPI, plus `openapi-typescript` for the React client.

**Say it like this:** "The OpenAPI spec is generated from the code, and the frontend's types are generated from the spec, so they can't drift."

---

## 🔴 Level 3 — Advanced

**Q15. How do you make an API backwards compatible?**

**Short answer:** Only add optional fields and endpoints, never change meanings, tolerate unknown fields, and use expand-and-contract for breaking changes.

**Explanation:** Expand-and-contract: add the new field, migrate clients, then remove the old one later.

**Example:** Rename `agentName` to `agent.displayName`: return both for a release cycle, then remove `agentName` in v2.

**Say it like this:** "I evolve APIs with expand-and-contract: add the new shape alongside the old one, migrate clients, and only then remove."

---

**Q16. REST vs GraphQL vs gRPC?**

**Short answer:** REST for public and simple resource APIs, GraphQL when clients need flexible data shapes, gRPC for fast typed service-to-service calls.

**Explanation:** REST caches well over HTTP; GraphQL avoids over-fetching but needs query cost limits; gRPC needs HTTP/2 and isn't browser-native.

**Example:** BFF for the React app in REST, internal scoring service over gRPC [if relevant].

**Say it like this:** "I pick by consumer: REST for most APIs, GraphQL for many varied UIs, gRPC between internal services."

---

**Q17. What is a BFF (backend for frontend)?**

**Short answer:** A thin server layer per client type that aggregates backend services into exactly what that UI needs.

**Explanation:** It also keeps tokens on the server (cookie session in the browser), which is safer for healthcare apps.

**Example:** `GET /bff/call-review/42` returns the call, transcript, AI flags and scorecard in one response.

**Say it like this:** "A BFF shapes data for one UI and keeps secrets server-side. It cut several round trips from our review screen."

---

## 🧩 Level 4 — Scenario-Based

**Q18. A client says your API returned duplicate records across pages. Why?**

**Short answer:** Offset pagination over data that changed between requests, or an unstable sort order without a unique tiebreaker.

**Explanation:** Fix with cursor pagination and `ORDER BY created_at, id`.

**Example:** New calls inserted at the top pushed rows from page 1 onto page 2.

**Say it like this:** "That's classic offset pagination on live data. Cursors with a unique tiebreaker fix it."

---

**Q19. A partner retries a timed-out POST and creates duplicates. How do you fix it?**

**Short answer:** Support an `Idempotency-Key` header: store the key with the result, and return the stored result on retries.

**Explanation:** Store keys in Redis or a table with a unique constraint and an expiry.

**Example:** `INSERT INTO idempotency_keys (key, response) ... ON CONFLICT (key) DO NOTHING`, then return the saved response.

**Say it like this:** "Timeouts don't mean failure, so retries are inevitable. Idempotency keys make retries safe."

---

## 🟢 More Basics

**Q20. What does "stateless" mean in REST?**

**Short answer:** Each request contains everything needed to process it (auth, parameters); the server keeps no client session state between requests.

**Explanation:** Statelessness lets any instance handle any request, which makes scaling easy. Session data lives in tokens or a shared store.

**Example:** Every request carries a session cookie or bearer token, so a load balancer can send it anywhere.

**Say it like this:** "Stateless servers mean any instance can serve any request, which is what makes horizontal scaling simple."

---

**Q21. What are safe methods?**

**Short answer:** Methods that don't change server state: GET, HEAD, OPTIONS.

**Explanation:** Caches and crawlers assume GET is safe, so never change data on GET.

**Example:** A `GET /logout` link can be triggered by prefetching; use POST.

**Say it like this:** "GET must never change anything, because browsers, proxies and crawlers call it freely."

---

**Q22. When should you return 200 vs 201 vs 202 vs 204?**

**Short answer:** 200 for successful reads and updates with a body, 201 for created resources, 202 for accepted async work, 204 for success with no body.

**Explanation:** 201 should include a `Location` header.

**Example:** `POST /calls/42/score` → 202 with a job URL; `DELETE /scorecards/7` → 204.

**Say it like this:** "The status code tells the client what happened before it even reads the body."

---

**Q23. When do you use 400 vs 422?**

**Short answer:** 400 for malformed requests (bad JSON, wrong types); 422 for well-formed requests that fail business validation. Many teams use 400 for both; consistency matters most.

**Explanation:** Document your choice and include field-level errors.

**Example:** Invalid JSON → 400; score of 120 when max is 100 → 422.

**Say it like this:** "I distinguish 'can't parse' from 'parsed but invalid' if the team agrees, but consistency beats purity."

---

**Q24. What is content negotiation?**

**Short answer:** The client states acceptable formats with `Accept` (and sends `Content-Type`); the server responds in a supported format or 406/415.

**Explanation:** Most JSON APIs only support `application/json` but should still reject wrong content types.

**Example:** `Accept: text/csv` on `/reports/monthly` returns a CSV export.

**Say it like this:** "Headers say what format is sent and wanted; I use it for things like CSV exports from the same endpoint."

---

**Q25. How should dates and times be represented in an API?**

**Short answer:** ISO 8601 strings in UTC with a `Z` (or explicit offset), and IANA time zone names when local time matters.

**Explanation:** Never send ambiguous local times; let clients format for display.

**Example:** `"startedAt": "2026-03-14T09:30:00Z"`, `"timeZone": "Asia/Kolkata"`.

**Say it like this:** "UTC ISO timestamps in the API, time zones as IANA names, and formatting happens in the client."

---

**Q26. How do you represent money in an API?**

**Short answer:** Integer minor units (paise, cents) plus a currency code, never floating-point numbers.

**Explanation:** Floats cause rounding errors.

**Example:** `{ "amount": 149900, "currency": "INR" }` for ₹1,499.00.

**Say it like this:** "Money is an integer in minor units with a currency code, because floats lose pennies."

---

**Q27. What makes a good resource ID?**

**Short answer:** Opaque, non-sequential IDs (UUIDv7, ULID or prefixed IDs) that don't leak counts and are safe to expose.

**Explanation:** Sequential IDs make enumeration and IDOR attacks easier, though authorisation is the real defence.

**Example:** `call_01HZX3…` (prefixed ULID).

**Say it like this:** "Opaque IDs avoid leaking business volume and make enumeration harder, but authorisation is still the real protection."

---

## 🟡 More Intermediate

**Q28. How do ETags and conditional requests work?**

**Short answer:** The server sends an `ETag` (a version hash); clients send `If-None-Match` to get 304 Not Modified if unchanged, or `If-Match` to update only if unchanged.

**Explanation:** Saves bandwidth and prevents lost updates.

**Example:** `GET /tenants/1/config` → `ETag: "v42"`; next request with `If-None-Match: "v42"` → 304.

**Say it like this:** "ETags make reads cheaper with 304s and writes safer with If-Match."

---

**Q29. How do you set HTTP caching headers for an API?**

**Short answer:** `Cache-Control: no-store` for sensitive or per-user data; `private, max-age` for per-user cacheable data; `public, max-age, s-maxage` for shared data; plus `ETag`.

**Explanation:** Never let a CDN cache authenticated responses unless keyed correctly.

**Example:** Patient data → `no-store`; public airport list → `public, max-age=3600`.

**Say it like this:** "Sensitive responses are never cached; public reference data is cached aggressively at the CDN."

---

**Q30. How do you design bulk operations?**

**Short answer:** A batch endpoint that accepts many items and returns per-item results, or an async bulk job for large batches.

**Explanation:** Decide whether the batch is atomic (all or nothing) or partial, and document it.

**Example:** `POST /scorecards:batch` → `207`-style response `{ results: [{ id, status: 201 }, { index: 3, error: … }] }`.

**Say it like this:** "Bulk endpoints return a result per item, and anything large becomes an async job."

---

**Q31. How do you design search endpoints?**

**Short answer:** `GET /resources?q=…` with validated filters, or `POST /resources/search` when the query is complex; backed by a search index for full-text.

**Explanation:** Return pagination and total counts carefully (exact counts are expensive).

**Example:** `GET /calls?q=refund&agentId=12&from=2026-01-01`.

**Say it like this:** "Simple filters stay as query parameters; complex search gets a POST endpoint backed by a proper search index."

---

**Q32. How do you return related resources without many round trips?**

**Short answer:** An `include` or `expand` parameter for selected relations, compound documents, or a BFF endpoint shaped for the screen.

**Explanation:** Limit what can be expanded to avoid expensive queries.

**Example:** `GET /calls/42?include=agent,scorecard`.

**Say it like this:** "A controlled include parameter avoids N round trips without turning REST into an unbounded query language."

---

**Q33. What is HATEOAS, and do you use it?**

**Short answer:** Responses include links to related actions and resources so clients can navigate the API; most practical APIs use it lightly, if at all.

**Explanation:** Pagination links (`next`) are the most useful form.

**Example:** `"links": { "next": "/v1/calls?cursor=abc" }`.

**Say it like this:** "I use links where they clearly help, like pagination, without making clients depend on full hypermedia."

---

**Q34. How do you handle partial failures in an endpoint that calls several services?**

**Short answer:** Decide per dependency: fail the request, degrade (return partial data with a flag), or serve cached data; use timeouts so one slow service doesn't block the rest.

**Explanation:** Make degradation visible to clients.

**Example:** Dashboard returns calls and scores, but `"aiInsights": null, "degraded": ["aiInsights"]` when that service is down.

**Say it like this:** "Optional parts degrade gracefully and say so; required parts fail clearly."

---

**Q35. How do you design soft deletes and undo?**

**Short answer:** Mark rows `deleted_at` instead of removing them, exclude them by default, and purge later; restore by clearing the field.

**Explanation:** Unique constraints need care (partial indexes `WHERE deleted_at IS NULL`). Compliance may require real deletion.

**Example:** `DELETE /scorecards/7` sets `deleted_at`; `POST /scorecards/7/restore` undoes it within 30 days.

**Say it like this:** "Soft delete gives undo and auditability, with a scheduled purge for compliance."

---

**Q36. How do you make an API discoverable and easy to use?**

**Short answer:** Consistent naming and errors, OpenAPI docs with examples, SDKs or generated types, a sandbox, and a changelog.

**Explanation:** Developer experience reduces support load.

**Example:** `/docs` with "Try it out", plus a Postman collection.

**Say it like this:** "A predictable API with good docs and examples saves more support time than any feature."

---

## 🔴 More Advanced

**Q37. How do you secure a public REST API?**

**Short answer:** HTTPS only, strong authentication, object-level authorisation, input validation, rate limits, size limits, safe error messages, logging and monitoring.

**Explanation:** Follow the OWASP API Security Top 10.

**Example:** Every list endpoint has a max page size; every object access is scoped to the caller.

**Say it like this:** "I go down the OWASP API list: authorisation per object, limits on everything, and no internals in errors."

---

**Q38. How do you deprecate an endpoint safely?**

**Short answer:** Announce with a timeline, add `Deprecation` and `Sunset` headers, measure who still calls it, contact them, then remove after the date.

**Explanation:** Usage data decides whether you can remove it on schedule.

**Example:** Logs tagged by API key show two partners still on v1 a month before sunset.

**Say it like this:** "Deprecation is communication plus measurement: headers, dates, and usage data per client."

---

**Q39. How do you design a public API for multiple tenants with different limits?**

**Short answer:** Tenant-aware rate limits and quotas, per-plan features checked server-side, and usage metering.

**Explanation:** Return limits in headers (`RateLimit-Limit`, `RateLimit-Remaining`).

**Example:** Enterprise tenants get 1,000 requests a minute; trial tenants 60.

**Say it like this:** "Limits and features are per tenant and enforced server-side, with headers that tell clients where they stand."

---

**Q40. How do you keep APIs fast at scale?**

**Short answer:** Efficient queries with indexes, pagination limits, caching, compression, avoiding chatty calls, and async processing for heavy work.

**Explanation:** Measure p95 and p99 per endpoint.

**Example:** The list endpoint returns summaries; the detail endpoint returns full data.

**Say it like this:** "Small responses, indexed queries, caching and async work keep APIs fast; percentiles tell me where to focus."

---

## 🧩 More Scenarios

**Q41. The frontend team says your API needs 6 calls to render one page. What do you do?**

**Short answer:** Add a BFF or aggregate endpoint for that screen, or `include` parameters, after checking whether the calls can run in parallel.

**Explanation:** Balance generic resource APIs against screen-specific needs.

**Example:** `GET /bff/review/42` returns call, transcript, flags and scorecard together.

**Say it like this:** "If a screen needs six calls, the API isn't serving its client. A BFF endpoint shaped for that screen fixes it."

---

**Q42. A client sends dates in local time and data ends up off by hours. How do you fix it?**

**Short answer:** Require ISO 8601 with an offset or `Z`, reject ambiguous values, and store UTC.

**Explanation:** Convert to the user's time zone only for display.

**Example:** `"2026-03-14T09:30:00"` without offset → 400 with a clear message.

**Say it like this:** "Ambiguous times are rejected at the edge, and everything is stored in UTC."

---

**Q43. An endpoint is accidentally returning internal fields like password hashes. How do you prevent this class of bug?**

**Short answer:** Use explicit response DTOs or serializers (allowlists), never return database entities directly, and add tests on response shape.

**Explanation:** Contract tests against the OpenAPI schema catch extra fields.

**Example:** `UserOut` includes `id`, `name`, `role` only.

**Say it like this:** "Responses are built from allowlisted output models, so internal fields can't leak even when the entity changes."

---

## 🎯 From Your Resume

**Q44. "How did the frontend and backend agree on API contracts at BpoBox?"**

**Short answer:** Describe your real process: [OpenAPI from FastAPI, shared types, or documented endpoints], with consistent error formats and pagination.

**Explanation:** FastAPI generates OpenAPI automatically; mention generating TypeScript types from it if you did.

**Example:** "FastAPI's OpenAPI schema generated TypeScript types for the React app, so a renamed field broke the build, not production."

**Say it like this:** "We treated the API as a contract: [FastAPI's OpenAPI spec generated our frontend types], so mismatches were caught at build time."
