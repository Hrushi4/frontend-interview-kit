# 02 — Node.js

Your resume lists Node.js, Express.js and NestJS as backend skills, and you built the Blood Bank and Quiz App backends on Express. Expect the event loop, async patterns, streams and scaling.

**How this file is organised**

- **Part A — Understand the topic:** what Node.js is, the event loop, non-blocking I/O, modules and how Node scales, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is Node.js?

Node.js is a **JavaScript runtime** that runs outside the browser. It uses Google's V8 engine to execute JavaScript and a C library called **libuv** to talk to the operating system (files, network, timers). It is not a framework and not a language; Express and NestJS are frameworks that run on top of it.

### Single thread, non-blocking I/O

Your JavaScript runs on **one main thread**. Node stays fast because it never waits for slow work like a database query or an HTTP call. It hands that work to the operating system (or libuv's thread pool), keeps running other code, and runs your callback when the result is ready.

```text
Request A ──▶ start DB query ──▶ (free to handle B, C, D…) ──▶ DB done ──▶ send response A
```

This makes Node excellent for **I/O-heavy** services (APIs, real-time, proxies) and poor for **CPU-heavy** work (image processing, big calculations) unless you move that work off the main thread.

### The event loop, in phases

```text
   ┌──────────── timers (setTimeout, setInterval)
   │  pending callbacks (some system errors)
   │  poll (new I/O events: sockets, files)
   │  check (setImmediate)
   └──────────── close callbacks (socket.on('close'))
Between every callback: process.nextTick queue, then the Promise microtask queue.
```

`process.nextTick` runs before Promises, and both run before the loop moves to the next phase. Starving the loop (a long `while` loop or synchronous JSON parse of a huge file) blocks **every** request.

### The libuv thread pool

File system calls, DNS lookups, `crypto.pbkdf2` and `zlib` run on a small thread pool (4 threads by default, `UV_THREADPOOL_SIZE`). Network sockets don't use it; they use the OS's async mechanisms (epoll, kqueue).

### Modules

Node supports **CommonJS** (`require`, `module.exports`) and **ES Modules** (`import`, `export`, `"type": "module"`). ESM is the standard going forward; CommonJS is still everywhere in older packages.

### How Node scales

1. **Vertically on one machine:** run one process per CPU core (the `cluster` module, PM2, or one container per core).
2. **Horizontally:** run many instances behind a load balancer. Keep them **stateless**: sessions in Redis, files in S3.
3. **CPU work:** move it to `worker_threads` or a separate job queue.

### Why interviewers ask about it

Node questions test whether you understand *why* an API is slow or stuck. A senior backend engineer should explain the event loop, spot code that blocks it, handle errors without crashing the process, and scale it safely.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. What is Node.js, and why use it for backends?**

**Short answer:** A JavaScript runtime built on V8 and libuv, with non-blocking I/O. It's great for I/O-heavy APIs and real-time services, and lets one team use one language across frontend and backend.

**Explanation:** Node handles thousands of concurrent connections on one thread because it doesn't block while waiting for I/O. The npm ecosystem is huge, and sharing TypeScript types between React and the API reduces bugs.

**Example:** An API that mostly reads from PostgreSQL and Redis spends its time waiting on the network, which Node handles efficiently.

**Say it like this:** "Node is a JavaScript runtime with non-blocking I/O, so it's strong for APIs that mostly wait on databases and other services. I like that the team can share TypeScript types between the React app and the API."

---

**Q2. Is Node.js single-threaded?**

**Short answer:** Your JavaScript runs on one main thread, but Node itself uses extra threads: libuv's thread pool for file system, DNS and crypto, plus V8's own background threads.

**Explanation:** "Single-threaded" means you don't manage locks for your JavaScript code. For CPU-heavy work you can still use `worker_threads` or multiple processes.

**Example:** `fs.readFile` runs on the thread pool; a `while (true)` loop in a route handler blocks everything because it's on the main thread.

**Say it like this:** "JavaScript execution is single-threaded, but I/O happens in parallel underneath. So the rule is: never do heavy CPU work on the main thread."

---

**Q3. What is the event loop?**

**Short answer:** The mechanism that runs callbacks when their work is ready, cycling through phases: timers, pending callbacks, poll, check and close.

**Explanation:** Between callbacks, Node drains `process.nextTick` and then the Promise microtask queue. The loop keeps the process alive while there's pending work.

**Example:**

```js
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
// nextTick, promise, then timeout/immediate (order of the last two can vary in the main module)
```

**Say it like this:** "The event loop picks up completed work and runs its callback. Microtasks like nextTick and Promises run between every callback, which is why they always come first."

---

**Q4. `process.nextTick` vs `setImmediate` vs `setTimeout(fn, 0)`?**

**Short answer:** `nextTick` runs right after the current operation, before Promises; `setImmediate` runs in the check phase after I/O; `setTimeout(0)` runs in the next timers phase.

**Explanation:** Recursive `nextTick` can starve I/O. Inside an I/O callback, `setImmediate` always runs before `setTimeout(0)`.

**Example:** Use `setImmediate` to split a long loop into chunks so other requests can run in between.

**Say it like this:** "nextTick is 'before anything else', setImmediate is 'after this round of I/O'. I use setImmediate when I want to yield to other requests."

---

**Q5. CommonJS vs ES Modules?**

**Short answer:** CommonJS uses `require` and loads synchronously; ESM uses `import`, is statically analysable, supports top-level `await`, and is the standard.

**Explanation:** ESM enables tree shaking and is required by many new packages. Mixing them needs care: ESM can import CommonJS, but CommonJS needs dynamic `import()` for ESM.

**Example:**

```js
// CommonJS
const express = require('express');
module.exports = app;
// ESM ("type": "module" in package.json)
import express from 'express';
export default app;
```

**Say it like this:** "New services use ES Modules. I still read plenty of CommonJS, and I know the interop rules for when the two meet."

---

**Q6. What is npm, and what is `package-lock.json` for?**

**Short answer:** npm installs packages; the lockfile pins exact versions of every dependency, so every install is identical.

**Explanation:** Use `npm ci` in CI: it installs exactly from the lockfile and fails if it doesn't match `package.json`. Semantic version ranges (`^1.2.0`) only apply when there's no lockfile.

**Example:** A build broke because a transitive dependency released a bad minor version; committing the lockfile and using `npm ci` prevents that.

**Say it like this:** "The lockfile makes builds reproducible. CI always uses npm ci, never npm install."

---

**Q7. How do you handle errors in Node?**

**Short answer:** `try/catch` around `await`, `.catch()` on promises, error-first callbacks in old APIs, and process-level handlers only for logging and a clean shutdown.

**Explanation:** An unhandled promise rejection crashes modern Node. After an `uncaughtException`, the process is in an unknown state, so log it and exit; let the orchestrator restart it.

**Example:**

```js
process.on('unhandledRejection', (err) => { logger.fatal(err); process.exit(1); });
```

**Say it like this:** "Errors are handled where they happen. The global handlers are a safety net that logs and restarts, not a way to keep a broken process running."

---

**Q8. What are environment variables, and how do you manage config?**

**Short answer:** Config that changes per environment (ports, URLs, secrets) comes from environment variables, validated at startup.

**Explanation:** Never commit secrets. Validate config with a schema (Zod, Joi) so a missing variable fails fast at boot, not at 2 a.m. on the first request that needs it.

**Example:**

```ts
const Env = z.object({ DATABASE_URL: z.string().url(), PORT: z.coerce.number().default(3000) });
export const env = Env.parse(process.env);
```

**Say it like this:** "Config comes from the environment and is validated on startup, so a typo in a variable name fails the deploy instead of a customer request."

---

## 🟡 Level 2 — Intermediate

**Q9. What are streams, and why use them?**

**Short answer:** Streams process data in chunks instead of loading it all into memory. There are readable, writable, duplex and transform streams.

**Explanation:** Use `pipeline()`, which handles errors and backpressure. Streaming a 2 GB file uses a few MB of memory.

**Example:**

```js
import { pipeline } from 'node:stream/promises';
await pipeline(fs.createReadStream('calls.csv'), zlib.createGzip(), res);
```

**Say it like this:** "For big files or exports, I stream instead of buffering, so memory stays flat no matter how big the data is."

---

**Q10. What is backpressure?**

**Short answer:** When a writable stream can't keep up, `write()` returns `false`; the producer should pause until the `drain` event.

**Explanation:** Ignoring backpressure fills memory until the process crashes. `pipeline()` and `pipe()` handle it for you.

**Example:** Exporting 1 million rows to a slow client: without backpressure, all rows pile up in memory.

**Say it like this:** "Backpressure is the slow consumer telling the fast producer to wait. Using pipeline gets it right automatically."

---

**Q11. `cluster` vs `worker_threads`?**

**Short answer:** `cluster` forks separate processes that share a port to use all CPU cores; `worker_threads` runs CPU-heavy JavaScript in threads inside one process.

**Explanation:** In containers, the usual approach is one process per container and scale containers instead of using `cluster`. Use `worker_threads` for CPU tasks like image resizing or PDF generation.

**Example:**

```js
const worker = new Worker('./resize.js', { workerData: { path } });
worker.on('message', (result) => res.json(result));
```

**Say it like this:** "For scaling HTTP I run more containers. For CPU-heavy work inside a request, I use worker threads or, better, a background job."

---

**Q12. How do you find and fix event loop blocking?**

**Short answer:** Measure event loop lag (`perf_hooks.monitorEventLoopDelay`), profile with `--inspect` or clinic.js, then move the hot code off the main thread or make it async.

**Explanation:** Common culprits: synchronous `JSON.parse` on huge payloads, `bcrypt` sync calls, regexes with catastrophic backtracking, `fs.*Sync` in request paths.

**Example:**

```js
const h = monitorEventLoopDelay(); h.enable();
setInterval(() => metrics.gauge('event_loop_p99_ms', h.percentile(99) / 1e6), 10_000);
```

**Say it like this:** "I export event loop lag as a metric. When p99 latency rises with low CPU on the database, a blocked loop is my first suspect."

---

**Q13. What is the libuv thread pool, and when does it matter?**

**Short answer:** A pool of 4 threads (by default) for file system, DNS lookup, crypto and zlib work; if it's saturated, those calls queue.

**Explanation:** Heavy `bcrypt` hashing or many file reads can exhaust it. Increase `UV_THREADPOOL_SIZE` or move the work elsewhere.

**Example:** Login latency spiked under load because `bcrypt.hash` (async, on the pool) queued behind file operations.

**Say it like this:** "Network I/O doesn't use the pool, but crypto and file system calls do, so under load they can queue up unexpectedly."

---

**Q14. How do you handle graceful shutdown?**

**Short answer:** On `SIGTERM`, stop accepting new connections, finish in-flight requests, close DB pools and queues, then exit, with a timeout.

**Explanation:** Kubernetes and ECS send `SIGTERM` before killing a container. Without graceful shutdown, deploys drop requests.

**Example:**

```js
process.on('SIGTERM', async () => {
  server.close();                       // stop new connections
  await Promise.all([db.end(), redis.quit()]);
  process.exit(0);
});
setTimeout(() => process.exit(1), 10_000).unref();
```

**Say it like this:** "Every service handles SIGTERM, so deploys and autoscaling never cut off a request halfway."

---

**Q15. How does Node handle memory, and how do you find a leak?**

**Short answer:** V8 manages a garbage-collected heap; leaks happen when something keeps references alive. Take heap snapshots, compare them, and look at what grows.

**Explanation:** Common leaks: growing in-memory caches or maps, event listeners never removed, closures holding big objects, timers never cleared.

**Example:** A `Map` caching user data by request ID without eviction grew forever; replacing it with an LRU cache with a max size fixed it.

**Say it like this:** "I watch heap usage over time. If it only goes up, I compare two heap snapshots, and it's usually an unbounded cache or an unremoved listener."

---

**Q16. EventEmitter: what is it and what are the pitfalls?**

**Short answer:** The pub/sub class behind streams, servers and sockets. Pitfalls: forgetting to remove listeners, and unhandled `'error'` events crashing the process.

**Explanation:** An `'error'` event with no listener throws. The "MaxListenersExceededWarning" usually signals a leak.

**Example:**

```js
emitter.on('error', (err) => logger.error(err));
const onData = () => {}; emitter.on('data', onData); /* later */ emitter.off('data', onData);
```

**Say it like this:** "Always attach an error listener, and remove listeners you add per request, or you'll leak memory."

---

**Q17. How do you run async tasks in parallel safely?**

**Short answer:** `Promise.all` for all-or-nothing, `Promise.allSettled` when some may fail, and a concurrency limit when there are many tasks.

**Explanation:** Firing 10,000 requests at once can exhaust sockets or get you rate-limited. Use `p-limit` or a small pool.

**Example:**

```js
import pLimit from 'p-limit';
const limit = pLimit(10);
const results = await Promise.all(callIds.map((id) => limit(() => fetchRecording(id))));
```

**Say it like this:** "I parallelise I/O, but always with a concurrency limit so we don't overwhelm the downstream service."

---

**Q18. How do you secure a Node service at the runtime level?**

**Short answer:** Keep Node and dependencies updated, run as a non-root user, audit dependencies, validate input, set timeouts, and never use `eval` or unsanitised `child_process` input.

**Explanation:** Supply-chain risk is real: lockfiles, `npm audit`, Dependabot, and minimal dependencies help.

**Example:** `child_process.execFile('ffmpeg', [inputPath])` instead of `exec(\`ffmpeg ${inputPath}\`)`, which allows command injection.

**Say it like this:** "Most Node security issues are input handling and dependencies, so I validate everything and keep the dependency tree small and patched."

---

## 🔴 Level 3 — Advanced

**Q19. How would you design a Node service to handle 10x traffic?**

**Short answer:** Stateless instances behind a load balancer, autoscaling, connection pooling, caching, async jobs for slow work, and load tests to find the real bottleneck.

**Explanation:** Usually the database breaks first, not Node. Add read replicas, caching and indexes before adding more Node instances.

**Example:** Move PDF report generation to a queue so API latency stays flat during month-end spikes.

**Say it like this:** "I'd load test first. Node usually scales horizontally easily; the database and downstream APIs are where 10x actually hurts."

---

**Q20. How do you profile CPU usage in production?**

**Short answer:** Capture a CPU profile with `--cpu-prof` or the inspector, or use continuous profiling (Pyroscope, Datadog), then read flame graphs.

**Explanation:** Wide bars at the top of a flame graph are where time goes. Profile under realistic load.

**Example:** A flame graph showed 40% of CPU in a validation library compiling schemas per request; compiling once at startup fixed it.

**Say it like this:** "I don't guess at performance. A flame graph under real load shows where the time goes, and it's often something surprising."

---

**Q21. What's `AsyncLocalStorage` used for?**

**Short answer:** Keeping per-request context (request ID, user, tenant) available across async calls without passing it through every function.

**Explanation:** It powers request-scoped logging and tracing. NestJS's `nestjs-cls` and OpenTelemetry use it.

**Example:**

```js
const als = new AsyncLocalStorage();
app.use((req, _res, next) => als.run({ requestId: req.id, tenantId: req.tenant }, next));
logger.info('scored', als.getStore());   // anywhere downstream
```

**Say it like this:** "AsyncLocalStorage gives me a request ID and tenant ID in every log line without threading them through every function call."

---

**Q22. How do you avoid crashing on bad input to `JSON.parse` or large payloads?**

**Short answer:** Limit body size, wrap parsing in try/catch, and validate the parsed data with a schema.

**Explanation:** Body parser limits stop memory exhaustion; schema validation stops unexpected shapes from reaching business logic.

**Example:** `app.use(express.json({ limit: '1mb' }))` plus Zod validation on every route.

**Say it like this:** "Every payload has a size limit and a schema. Anything else is rejected with a 400 before it reaches the business logic."

---

## 🧩 Level 4 — Scenario-Based

**Q23. API p99 latency jumped, but the database looks healthy. What do you check?**

**Short answer:** Event loop lag, CPU and GC on the Node instances, the thread pool, outbound calls to other services, and connection pool waits.

**Explanation:** Correlate with recent deploys. Distributed tracing shows which span grew.

**Example:** A new feature logged full request bodies synchronously to disk; moving logging to an async transport fixed the latency.

**Say it like this:** "If the database is fine, I look at the Node process itself, the event loop and GC, and at any slow downstream calls. Traces usually point to the culprit quickly."

---

**Q24. A Node process memory keeps growing until it's OOM-killed. What do you do?**

**Short answer:** Reproduce under load, take heap snapshots over time, compare retained objects, find the growing structure and fix its lifecycle.

**Explanation:** Short-term, add memory limits and restarts; long-term, fix the leak.

**Example:** A WebSocket handler added a listener per message and never removed it.

**Say it like this:** "I restart to stop the bleeding, then compare heap snapshots. The fix is always making something that grows have a limit or a cleanup."

---

## 🎯 From Your Resume

**Q25. "Tell me about the Express backends in your Blood Bank and Quiz projects."**

**Short answer:** Express REST APIs with Mongoose and MongoDB, role-based routes for donors, hospitals and organisations (Blood Bank) or teachers and students (Quiz), with JWT authentication.

**Explanation:** Be ready to explain the routes, how roles were enforced in middleware, and the data model. Also say what you'd change now (validation, tests, TypeScript).

**Example:** `POST /donations` allowed only for donors; `GET /inventory` only for organisations, checked in an `authorize('organisation')` middleware.

**Say it like this:** "Both were Express APIs on MongoDB with JWT auth and role middleware. Today I'd add schema validation on every route, integration tests, and TypeScript, which I use on all my current work."

---

**Q26. "Your resume says full-stack. What backend work do you own day to day?"**

**Short answer:** Describe your real backend ownership: FastAPI RBAC and security fixes, the Celery scoring pipeline, AWS infrastructure for LiveKit, and Node/NestJS services.

**Explanation:** Be precise about what you built versus contributed to. Interviewers check consistency between rounds.

**Example:** "I designed the self-hosted LiveKit infrastructure and implemented the permission dependencies in FastAPI; the core Celery workers were [shared with a backend colleague]."

**Say it like this:** "My strength is frontend architecture, but I own real backend work: the FastAPI permission layer from the security audit, the AI scoring pipeline with Celery, and the AWS design for self-hosted LiveKit."
