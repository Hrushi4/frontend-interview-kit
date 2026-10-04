# 19 — Backend Quick Memory Sheet (Read in 10–15 Minutes Before Any Interview)

## What this sheet is for

A **revision sheet**, not a lesson. Each line is a fact or phrase worth having ready. If a line doesn't make sense, go back to the full topic file.

**How to use it:**

1. Read it the morning of an interview.
2. Say the bolded phrases out loud once.
3. Re-read your resume's backend numbers and how each was measured.

---

## Node.js

- One main JavaScript thread; I/O is non-blocking via libuv. **Never block the event loop.**
- Order: sync code → `process.nextTick` → Promise microtasks → timers / poll / check phases.
- Thread pool (4 by default): fs, DNS, crypto, zlib. Network I/O doesn't use it.
- Streams + `pipeline()` for big data; backpressure prevents memory blow-ups.
- Scale: stateless instances behind a load balancer; `worker_threads` or queues for CPU work.
- Graceful shutdown on SIGTERM: fail readiness → stop accepting → finish in-flight → close pools → exit.

## Express and NestJS

- Express: middleware pipeline in registration order; 4-argument error middleware last.
- Express 4 needs async error wrappers; Express 5 handles rejected promises.
- Baseline: helmet, strict CORS allowlist, body size limit, rate limits, validation (Zod).
- Nest lifecycle: **middleware → guards → interceptors → pipes → handler → interceptors → filters.**
- Nest: guards for access, pipes for input, interceptors for wrapping behaviour, filters for errors.
- `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` blocks mass assignment.

## REST and GraphQL

- 201 + Location on create, 204 on delete, 401 vs 403, **404 for other tenants' data**.
- Idempotent: GET, PUT, DELETE. POST needs an **Idempotency-Key**.
- Cursor pagination with a unique tiebreaker (`created_at, id`) beats offset on live data.
- Long work: **202 Accepted + job resource**, then poll or push.
- Version by adding; breaking changes use expand-and-contract and a new version.
- GraphQL: **DataLoader per request** fixes N+1; limit depth and cost; persisted queries.

## PostgreSQL

- ACID; MVCC means readers don't block writers.
- Composite index: **equality columns first, then sort/range.** Verify with `EXPLAIN ANALYZE`.
- Isolation default Read Committed; use `FOR UPDATE SKIP LOCKED` for work queues.
- Optimistic locking: `WHERE id = $1 AND version = $2`.
- Multi-tenant: `tenant_id` everywhere + **row-level security**.
- Migrations: backward compatible; `CREATE INDEX CONCURRENTLY`; expand-and-contract.
- Pool connections; PgBouncer when instances × pool size gets close to `max_connections`.

## MongoDB

- Model for your queries: **embed bounded data read together; reference growing or shared data.**
- 16 MB document limit; unbounded arrays are a design bug.
- Compound index order (equality, sort, range); `explain('executionStats')`.
- Atomic single-document updates (`$inc` with a condition) before multi-document transactions.
- Page by `_id`/date range, not deep `skip()`.

## Redis and Caching

- Cache-aside: read cache → miss → DB → set with TTL. **Delete the key on write.**
- TTL + jitter; prevent stampedes with a rebuild lock or stale-while-revalidate.
- **Cache keys include tenant and user** when the result depends on them.
- Broker/sessions: `noeviction` + AOF. Cache: `allkeys-lru`. Keep them separate.
- Rate limiting: INCR per window, or token bucket in Lua. Locks: `SET NX PX` + token check.

## Auth and Security

- AuthN = who (401); AuthZ = what (403/404). **Server enforces both on every request.**
- Passwords: Argon2id or bcrypt. JWT: pin algorithm, check exp, iss, aud; no PHI in payload.
- Short access tokens + **rotating refresh tokens** in HttpOnly cookies; reuse → revoke family.
- OAuth for apps: Authorization Code + PKCE, validate `state`.
- Top API risk: **broken object-level authorisation (IDOR)**. Scope every query.
- Secrets in a secret manager; CI uses OIDC, not stored keys.
- PHI: encrypt, least privilege, audit access, keep out of logs and vendors.

## Queues and Async

- At-least-once delivery → **consumers must be idempotent**.
- Retries: exponential backoff + jitter for transient errors only; **dead-letter queue** after max attempts.
- Late acks so crashes cause redelivery, not loss.
- Scale workers on **queue age**; I/O-bound work → high concurrency.
- Transactional outbox for "save and publish" atomically; sagas for multi-service workflows.

## Real-Time

- SSE: one-way, HTTP, auto-reconnect, `Last-Event-ID`. WebSocket: two-way.
- Scale sockets with a **pub/sub backplane** (Redis); authorise every subscription.
- Reconnect with backoff + jitter; drain on deploy.
- WebRTC: SFU forwards streams; **TURN/TLS on 443** for hospital networks; Redis routes rooms across nodes.

## Docker, AWS, CI/CD

- Dockerfile: multi-stage, deps before source, non-root user, no secrets.
- Only the load balancer is public; app and DB in private subnets; security groups chain layers.
- IAM roles with least privilege; S3 private + presigned URLs.
- Two AZs for HA; RDS Multi-AZ; backups you've restored.
- CI: lint, types, tests with a real DB, build, scan. CD: rolling or canary with auto-rollback.

## Observability and Performance

- Logs (what happened), metrics (is it OK), traces (where time went), Sentry (which error, which release).
- **RED:** rate, errors, duration. Track **p95/p99**, not averages.
- Alert on user-facing symptoms; dashboards for causes.
- Performance loop: **measure → find bottleneck → fix the biggest → measure again.**
- Every metric you quote has a numerator, denominator and time window.

## Testing

- Integration tests against a **real Postgres**; mock only external services.
- Role × endpoint × tenant permission matrix in CI.
- Run tasks twice to prove idempotency; every bug fix ships with a regression test.

## Python / FastAPI / Celery

- Pydantic input and output models; `Depends()` for DB session, current user, permissions.
- No blocking calls in `async def`; use plain `def` for sync libraries.
- GIL: processes for CPU, async/threads for I/O.
- Celery: late acks, reject on worker lost, prefetch 1, time limits, idempotent tasks.

## Your 30-Second Backend Pitch

"I'm a full-stack engineer with a frontend-architecture core and real backend ownership: I secured a healthcare API in FastAPI, scoping every query by tenant and adding a permission test matrix, which cut audit findings by 85%; I built an AI scoring pipeline on Celery that processes over 40,000 calls a month at 5x the original throughput; and I designed self-hosted LiveKit video infrastructure on AWS. Earlier I built Node, NestJS and Express APIs with GraphQL, MongoDB and PostgreSQL."
