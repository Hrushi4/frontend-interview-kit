# 18 — Backend Coding Round (Build It Live)

Backend and full-stack loops often include a 45–90 minute practical round: build a small API, a rate limiter, a cache or a job processor. This file gives you the common tasks with working TypeScript code and what to say while you build.

**How this file is organised**

- **Part A — Understand the topic:** what the round tests and a step-by-step approach.
- **Part B — Builds with explanations and code:** Basic → Intermediate → Advanced.

Each build has a **Short answer** (the approach in one breath), an **Explanation** (requirements and key points), an **Example** (the code) and **Say it like this** (what to say while you build).

---

## Part A — Understand the Topic

### What the round tests

- Can you turn a vague task into a working, correct piece of backend code?
- Do you handle edge cases: invalid input, concurrency, failures, limits?
- Is the code clean: small functions, clear names, separation of concerns?
- Do you talk through trade-offs and testing?

### A 5-step approach

1. **Clarify** inputs, outputs, limits and error cases (2–3 minutes).
2. **Design** the data structures and API shape out loud.
3. **Build** the simplest correct version first.
4. **Harden:** validation, edge cases, concurrency, errors.
5. **Test and discuss:** run examples, then say what you'd add for production (persistence, metrics, scaling).

**Say it like this (opening):** "Let me confirm the requirements and limits first, then I'll build a simple correct version and harden it from there."

---

## Part B — Builds with Explanations and Code

## 🟢 Basic Builds

### Q1. In-memory LRU cache with TTL

**Short answer:** A `Map` keeps insertion order; on `get`, delete and re-insert to mark as recently used; on `set`, evict the oldest key when over capacity; store an expiry time per entry.

**Explanation:** Requirements: `get`, `set` with optional TTL, max size, O(1) operations. Expired entries are removed lazily on access.

**Example:**

```ts
class LruCache<V> {
  private map = new Map<string, { value: V; expiresAt: number }>();
  constructor(private max: number, private defaultTtlMs = 60_000) {}

  get(key: string): V | undefined {
    const e = this.map.get(key);
    if (!e) return undefined;
    if (e.expiresAt < Date.now()) { this.map.delete(key); return undefined; }
    this.map.delete(key); this.map.set(key, e);          // mark as most recent
    return e.value;
  }

  set(key: string, value: V, ttlMs = this.defaultTtlMs) {
    this.map.delete(key);
    this.map.set(key, { value, expiresAt: Date.now() + ttlMs });
    if (this.map.size > this.max) this.map.delete(this.map.keys().next().value!); // evict oldest
  }
}
```

**Say it like this:** "Map remembers insertion order, so re-inserting on access makes it an O(1) LRU. Expiry is checked lazily, which keeps writes cheap."

---

### Q2. Express CRUD API with validation

**Short answer:** Routes for list, get, create, update and delete; a Zod schema validates input; a repository hides storage; a central error handler maps errors to status codes.

**Explanation:** Requirements: correct status codes (201, 204, 404, 400), validation, no unknown fields, pagination on list.

**Example:**

```ts
const NoteIn = z.object({ title: z.string().min(1).max(200), body: z.string().max(5000).default('') }).strict();
const notes = new Map<string, { id: string; title: string; body: string }>();

app.post('/notes', (req, res) => {
  const data = NoteIn.parse(req.body);
  const note = { id: crypto.randomUUID(), ...data };
  notes.set(note.id, note);
  res.status(201).location(`/notes/${note.id}`).json(note);
});
app.get('/notes/:id', (req, res) => {
  const n = notes.get(req.params.id);
  n ? res.json(n) : res.status(404).json({ error: 'not_found' });
});
app.patch('/notes/:id', (req, res) => {
  const n = notes.get(req.params.id);
  if (!n) return res.status(404).json({ error: 'not_found' });
  Object.assign(n, NoteIn.partial().parse(req.body));
  res.json(n);
});
app.delete('/notes/:id', (req, res) => { notes.delete(req.params.id); res.status(204).end(); });
app.use((err, _req, res, _next) =>
  err instanceof z.ZodError ? res.status(400).json({ errors: err.flatten() }) : res.status(500).json({ error: 'internal' }));
```

**Say it like this:** "Strict schemas reject unknown fields, status codes follow REST conventions, and errors go through one handler. In production the Map becomes a repository over Postgres."

---

### Q3. Retry with exponential backoff

**Short answer:** Loop up to N attempts; on a retryable error, wait `base × 2^attempt` plus random jitter; rethrow non-retryable errors immediately.

**Explanation:** Respect `Retry-After` if the error carries it; cap the maximum delay.

**Example:**

```ts
async function retry<T>(fn: () => Promise<T>, { attempts = 5, baseMs = 200, maxMs = 10_000, isRetryable = (_e: unknown) => true } = {}) {
  for (let i = 0; ; i++) {
    try { return await fn(); }
    catch (e) {
      if (i >= attempts - 1 || !isRetryable(e)) throw e;
      const delay = Math.min(maxMs, baseMs * 2 ** i) * (0.5 + Math.random() / 2);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}
```

**Say it like this:** "Exponential backoff with jitter spreads retries out, so many clients don't hammer a recovering service at the same moment."

---

## 🟡 Intermediate Builds

### Q4. Rate limiter middleware (token bucket)

**Short answer:** Each key has a bucket with tokens that refill at a fixed rate; a request takes a token or gets 429 with `Retry-After`.

**Explanation:** In-memory for the interview; mention Redis plus Lua for multiple instances.

**Example:**

```ts
function rateLimit({ capacity = 10, refillPerSec = 5, key = (req: Request) => req.ip }) {
  const buckets = new Map<string, { tokens: number; last: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const k = key(req), now = Date.now();
    const b = buckets.get(k) ?? { tokens: capacity, last: now };
    b.tokens = Math.min(capacity, b.tokens + ((now - b.last) / 1000) * refillPerSec);
    b.last = now;
    if (b.tokens < 1) {
      buckets.set(k, b);
      return res.status(429).set('Retry-After', String(Math.ceil((1 - b.tokens) / refillPerSec))).end();
    }
    b.tokens -= 1; buckets.set(k, b); next();
  };
}
```

**Say it like this:** "A token bucket allows short bursts but enforces an average rate. Across several servers I'd move the same logic into a Redis Lua script so it's shared and atomic."

---

### Q5. Job queue with workers, retries and concurrency

**Short answer:** An in-memory queue, N workers pulling jobs, retries with backoff on failure, and a dead-letter list after max attempts.

**Explanation:** Show idempotency awareness and graceful shutdown.

**Example:**

```ts
type Job = { id: string; payload: unknown; attempts: number };

class JobQueue {
  private queue: Job[] = []; private dead: Job[] = []; private running = true;
  constructor(private handler: (p: unknown) => Promise<void>, private concurrency = 3, private maxAttempts = 3) {}

  add(payload: unknown) { this.queue.push({ id: crypto.randomUUID(), payload, attempts: 0 }); }

  start() { for (let i = 0; i < this.concurrency; i++) this.worker(); }
  stop() { this.running = false; }

  private async worker() {
    while (this.running) {
      const job = this.queue.shift();
      if (!job) { await sleep(50); continue; }
      try { await this.handler(job.payload); }
      catch {
        job.attempts++;
        if (job.attempts >= this.maxAttempts) this.dead.push(job);
        else setTimeout(() => this.queue.push(job), 100 * 2 ** job.attempts);
      }
    }
  }
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
```

**Say it like this:** "Workers pull jobs, failures retry with backoff, and jobs that keep failing go to a dead-letter list. In production this is BullMQ or Celery with persistence, but the logic is the same."

---

### Q6. URL shortener API

**Short answer:** `POST /links` creates a short code from a counter in base62; `GET /:code` redirects with 302 or returns 404; validate URLs and optionally support expiry.

**Explanation:** Base62 of an incrementing ID avoids collisions; in production use a distributed ID generator.

**Example:**

```ts
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const toBase62 = (n: number) => { let s = ''; do { s = ALPHABET[n % 62] + s; n = Math.floor(n / 62); } while (n > 0); return s; };

let counter = 100_000;
const links = new Map<string, { url: string; expiresAt?: number }>();

app.post('/links', (req, res) => {
  const { url, ttlSec } = z.object({ url: z.string().url(), ttlSec: z.number().int().positive().optional() }).parse(req.body);
  const code = toBase62(counter++);
  links.set(code, { url, expiresAt: ttlSec ? Date.now() + ttlSec * 1000 : undefined });
  res.status(201).json({ code, shortUrl: `${req.protocol}://${req.get('host')}/${code}` });
});
app.get('/:code', (req, res) => {
  const l = links.get(req.params.code);
  if (!l || (l.expiresAt && l.expiresAt < Date.now())) return res.status(404).end();
  res.redirect(302, l.url);
});
```

**Say it like this:** "Codes come from a counter in base62, so they're short and never collide. Redirects are a cache-friendly lookup, and I'd record clicks asynchronously."

---

### Q7. Idempotency-key middleware

**Short answer:** Store the first response for each `Idempotency-Key` (per user); repeat requests with the same key return the stored response; concurrent duplicates wait or get 409.

**Explanation:** Keys expire after 24 hours; in production store them in Redis or a table with a unique constraint.

**Example:**

```ts
const store = new Map<string, { status: number; body: unknown } | 'in_progress'>();

function idempotent(req: Request, res: Response, next: NextFunction) {
  const key = req.get('Idempotency-Key');
  if (!key) return next();
  const k = `${req.user.id}:${key}`, saved = store.get(k);
  if (saved === 'in_progress') return res.status(409).json({ error: 'request_in_progress' });
  if (saved) return res.status(saved.status).json(saved.body);
  store.set(k, 'in_progress');
  const json = res.json.bind(res);
  res.json = (body) => { store.set(k, { status: res.statusCode, body }); return json(body); };
  next();
}
```

**Say it like this:** "The first request does the work and its response is saved; a retry with the same key just gets the saved response, so timeouts never cause double charges."

---

## 🔴 Advanced Builds

### Q8. Webhook receiver with signature verification

**Short answer:** Read the raw body, compute an HMAC with the shared secret, compare in constant time, check the timestamp to block replays, dedupe by event ID, enqueue and return 200 quickly.

**Explanation:** Signature must be computed on the raw bytes, not the parsed JSON.

**Example:**

```ts
app.post('/webhooks/provider', express.raw({ type: 'application/json' }), async (req, res) => {
  const ts = Number(req.get('X-Timestamp')), sig = req.get('X-Signature') ?? '';
  if (Math.abs(Date.now() / 1000 - ts) > 300) return res.status(400).end();          // replay window
  const expected = crypto.createHmac('sha256', env.WEBHOOK_SECRET).update(`${ts}.${req.body}`).digest('hex');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
    return res.status(401).end();
  const event = JSON.parse(req.body.toString());
  if (await processedEvents.has(event.id)) return res.status(200).end();               // dedupe
  await queue.add('webhook', event); await processedEvents.add(event.id);
  res.status(200).end();
});
```

**Say it like this:** "Verify the signature on the raw body in constant time, reject old timestamps, dedupe by event ID, and hand off to a queue so the sender gets a fast 200."

---

### Q9. Paginated, filtered list endpoint over PostgreSQL

**Short answer:** Validate query params, allowlist sort fields, use keyset (cursor) pagination with a unique tiebreaker, scope by tenant, and return `nextCursor`.

**Explanation:** The cursor encodes the last row's sort key and ID.

**Example:**

```ts
app.get('/calls', async (req, res) => {
  const q = z.object({ status: z.enum(['open', 'flagged', 'done']).optional(),
                       limit: z.coerce.number().int().min(1).max(100).default(50),
                       cursor: z.string().optional() }).parse(req.query);
  const after = q.cursor ? JSON.parse(Buffer.from(q.cursor, 'base64url').toString()) : null;
  const rows = await db.query(
    `SELECT id, started_at, status FROM calls
     WHERE tenant_id = $1 AND ($2::text IS NULL OR status = $2)
       AND ($3::timestamptz IS NULL OR (started_at, id) < ($3, $4))
     ORDER BY started_at DESC, id DESC LIMIT $5`,
    [req.user.tenantId, q.status ?? null, after?.t ?? null, after?.id ?? null, q.limit + 1]);
  const page = rows.slice(0, q.limit), last = page.at(-1);
  res.json({ items: page,
             nextCursor: rows.length > q.limit ? Buffer.from(JSON.stringify({ t: last.started_at, id: last.id })).toString('base64url') : null });
});
```

**Say it like this:** "Keyset pagination stays fast at any depth and never repeats rows, the tenant filter is always in the query, and fetching limit plus one tells me if there's a next page."

---

### Q10. Graceful shutdown for an API with a worker

**Short answer:** On SIGTERM, stop accepting connections, mark the service not ready, let in-flight requests and the current jobs finish, close pools, and exit with a timeout.

**Explanation:** Readiness should fail first so the load balancer stops routing new traffic.

**Example:**

```ts
let ready = true;
app.get('/readyz', (_req, res) => res.status(ready ? 200 : 503).end());

process.on('SIGTERM', async () => {
  ready = false;                                  // load balancer stops sending traffic
  await new Promise((r) => setTimeout(r, 5_000)); // let the LB notice
  server.close();
  jobQueue.stop();
  await Promise.allSettled([db.end(), redis.quit()]);
  process.exit(0);
});
setTimeout(() => process.exit(1), 30_000).unref?.();
```

**Say it like this:** "Fail readiness first, wait for the load balancer to notice, finish what's in flight, close connections, then exit, with a hard timeout as a safety net."

---

## 🟡 More Intermediate Builds

### Q11. Debounced batch writer (collect events, flush in batches)

**Short answer:** Buffer events in memory and flush when the buffer reaches N items or T milliseconds pass, whichever comes first; flush on shutdown too.

**Explanation:** Reduces database or API calls for high-volume events like analytics or audit logs. Handle flush failures by retrying or re-queueing.

**Example:**

```ts
class BatchWriter<T> {
  private buf: T[] = []; private timer?: NodeJS.Timeout;
  constructor(private flushFn: (items: T[]) => Promise<void>, private max = 100, private waitMs = 1000) {}
  add(item: T) {
    this.buf.push(item);
    if (this.buf.length >= this.max) void this.flush();
    else this.timer ??= setTimeout(() => void this.flush(), this.waitMs);
  }
  async flush() {
    clearTimeout(this.timer); this.timer = undefined;
    const items = this.buf.splice(0);
    if (items.length) await this.flushFn(items).catch((e) => { this.buf.unshift(...items); throw e; });
  }
}
```

**Say it like this:** "Flush by size or time, whichever comes first, and put items back if the flush fails, so nothing is lost."

---

### Q12. Pub/sub event bus in memory

**Short answer:** A map from topic to a set of handlers; `subscribe` returns an unsubscribe function; `publish` calls handlers and isolates their errors.

**Explanation:** One failing handler must not stop others. Mention moving to Redis or a broker across processes.

**Example:**

```ts
class EventBus {
  private handlers = new Map<string, Set<(p: unknown) => void | Promise<void>>>();
  subscribe(topic: string, fn: (p: unknown) => void | Promise<void>) {
    if (!this.handlers.has(topic)) this.handlers.set(topic, new Set());
    this.handlers.get(topic)!.add(fn);
    return () => this.handlers.get(topic)!.delete(fn);
  }
  async publish(topic: string, payload: unknown) {
    const results = await Promise.allSettled([...(this.handlers.get(topic) ?? [])].map((h) => h(payload)));
    results.filter((r) => r.status === 'rejected').forEach((r) => logger.error((r as PromiseRejectedResult).reason));
  }
}
```

**Say it like this:** "Handlers are isolated with allSettled, so one failing subscriber doesn't block the rest."

---

### Q13. Circuit breaker

**Short answer:** Track failures; after N failures, open the circuit and fail fast for a cool-down period; then allow a trial request (half-open) and close on success.

**Explanation:** Protects the system from a failing dependency and gives it time to recover.

**Example:**

```ts
class CircuitBreaker {
  private failures = 0; private openedAt = 0; private state: 'closed' | 'open' | 'half' = 'closed';
  constructor(private threshold = 5, private coolDownMs = 30_000) {}
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.openedAt < this.coolDownMs) throw new Error('circuit_open');
      this.state = 'half';
    }
    try { const r = await fn(); this.failures = 0; this.state = 'closed'; return r; }
    catch (e) {
      if (this.state === 'half' || ++this.failures >= this.threshold) { this.state = 'open'; this.openedAt = Date.now(); }
      throw e;
    }
  }
}
```

**Say it like this:** "Closed, open, half-open: after repeated failures we stop calling for a while, then test with one request before trusting it again."

---

### Q14. Simple in-memory key-value store with transactions

**Short answer:** A map plus a stack of transaction layers; `begin` pushes a layer, writes go to the top layer, `rollback` pops it, `commit` merges layers down.

**Explanation:** A common interview problem testing data structure design.

**Example:**

```ts
class TxStore {
  private base = new Map<string, string | null>(); private tx: Map<string, string | null>[] = [];
  get(k: string) { for (let i = this.tx.length - 1; i >= 0; i--) if (this.tx[i].has(k)) return this.tx[i].get(k) ?? null; return this.base.get(k) ?? null; }
  set(k: string, v: string | null) { (this.tx.at(-1) ?? this.base).set(k, v); }
  begin() { this.tx.push(new Map()); }
  rollback() { if (!this.tx.pop()) throw new Error('no transaction'); }
  commit() { const top = this.tx.pop(); if (!top) throw new Error('no transaction'); for (const [k, v] of top) this.set(k, v); }
}
```

**Say it like this:** "Each transaction is a layer on top; reads look from the top down, rollback drops a layer, commit folds it into the one below."

---

## 🔴 More Advanced Builds

### Q15. Job scheduler that runs tasks at specific times

**Short answer:** A min-heap ordered by run time; a loop sleeps until the next task is due, runs it, and reschedules recurring tasks.

**Explanation:** Mention persistence and leader election for production.

**Example:**

```ts
type Task = { at: number; run: () => Promise<void>; everyMs?: number };
class Scheduler {
  private tasks: Task[] = []; private timer?: NodeJS.Timeout;
  schedule(t: Task) { this.tasks.push(t); this.tasks.sort((a, b) => a.at - b.at); this.arm(); }
  private arm() {
    clearTimeout(this.timer);
    const next = this.tasks[0]; if (!next) return;
    this.timer = setTimeout(async () => {
      const t = this.tasks.shift()!;
      try { await t.run(); } catch (e) { logger.error(e); }
      if (t.everyMs) this.schedule({ ...t, at: Date.now() + t.everyMs }); else this.arm();
    }, Math.max(0, next.at - Date.now()));
  }
}
```

**Say it like this:** "Tasks are ordered by due time and one timer always points at the next one. In production I'd swap the array for a heap and persist tasks."

---

### Q16. Paginated export to CSV with streaming

**Short answer:** Stream rows from the database with a cursor, convert to CSV lines with escaping, and pipe to the response with backpressure.

**Explanation:** Memory stays flat regardless of export size.

**Example:**

```ts
app.get('/exports/calls.csv', async (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="calls.csv"');
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = db.stream('SELECT id, started_at, score FROM calls WHERE tenant_id = $1 ORDER BY started_at', [req.user.tenantId]);
  const toCsv = new Transform({ objectMode: true, transform(r, _e, cb) { cb(null, [r.id, r.started_at.toISOString(), r.score].map(esc).join(',') + '\n'); } });
  res.write('id,started_at,score\n');
  await pipeline(rows, toCsv, res);
});
```

**Say it like this:** "Rows stream from the database through a CSV transform to the client, so a million-row export uses the same memory as ten rows."

---

### Q17. Request coalescing (single-flight)

**Short answer:** If a request for the same key is already in flight, return the same promise instead of starting another.

**Explanation:** Prevents cache stampedes and duplicate downstream calls.

**Example:**

```ts
const inflight = new Map<string, Promise<unknown>>();
function singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
```

**Say it like this:** "Concurrent requests for the same thing share one call, which stops stampedes when a hot cache key expires."

---

### Q18. Simple permission checker (RBAC with ownership)

**Short answer:** A permission map per role plus ownership rules evaluated in one `can(user, action, resource)` function, used by every endpoint.

**Explanation:** Centralising rules makes them testable as a matrix.

**Example:**

```ts
const ROLE_PERMS: Record<Role, string[]> = {
  admin: ['*'], qa: ['calls:read', 'scorecards:write'], agent: ['calls:read:own'],
};
function can(user: User, action: string, resource?: { tenantId: string; agentId?: string }) {
  if (resource && resource.tenantId !== user.tenantId) return false;
  const perms = ROLE_PERMS[user.role];
  if (perms.includes('*') || perms.includes(action)) return true;
  return perms.includes(`${action}:own`) && resource?.agentId === user.id;
}
```

**Say it like this:** "One function answers every permission question: tenant first, then role, then ownership, and it's tested as a full matrix."

---

## ✅ Self-Review Checklist (Say These Out Loud at the End)

- Input is validated and unknown fields are rejected.
- Errors return correct status codes in one consistent format.
- Edge cases: empty input, huge input, duplicates, concurrency, timeouts.
- No secrets in code; config from the environment.
- What changes for production: persistence, Redis for shared state, metrics, logs, tests.

**Say it like this (closing):** "The core works end to end with validation and clear errors. For production I'd move state to Postgres and Redis, add structured logging and metrics, and cover the edge cases with integration tests."
