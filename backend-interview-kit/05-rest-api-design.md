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

## 🎯 From Your Resume

**Q20. "How did the frontend and backend agree on API contracts at BpoBox?"**

**Short answer:** Describe your real process: [OpenAPI from FastAPI, shared types, or documented endpoints], with consistent error formats and pagination.

**Explanation:** FastAPI generates OpenAPI automatically; mention generating TypeScript types from it if you did.

**Example:** "FastAPI's OpenAPI schema generated TypeScript types for the React app, so a renamed field broke the build, not production."

**Say it like this:** "We treated the API as a contract: [FastAPI's OpenAPI spec generated our frontend types], so mismatches were caught at build time."
