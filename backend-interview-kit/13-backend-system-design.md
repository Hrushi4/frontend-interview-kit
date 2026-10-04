# 13 — Backend System Design

For a senior full-stack role, expect at least one backend system design round. Your resume gives you real systems to draw on: a multi-tenant SaaS (BpoBox), an AI processing pipeline (40,000+ calls a month), and real-time video infrastructure (LiveKit on AWS).

**How this file is organised**

- **Part A — Understand the topic:** what the round tests, a step-by-step framework, and the core building blocks, explained simply.
- **Part B — Concept questions:** Basics → Intermediate → Advanced.
- **Part C — Worked designs:** full answers to common prompts, each with four parts.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What the round tests

You get a vague prompt ("Design a URL shortener") and 45–60 minutes. There's no single right answer. Interviewers watch how you clarify requirements, estimate scale, choose components, explain trade-offs and handle failures.

### A framework to follow

1. **Requirements (5 min):** functional (what it does) and non-functional (scale, latency, availability, consistency, security).
2. **Estimates (3 min):** users, requests per second, storage per year, read/write ratio. Rough numbers are fine.
3. **API (5 min):** the main endpoints or events.
4. **Data model (5 min):** main entities, keys, which database and why.
5. **High-level design (10 min):** boxes and arrows: clients, load balancer, services, databases, cache, queue.
6. **Deep dives (15 min):** the hardest part: scaling a hot path, consistency, failure handling.
7. **Wrap up (5 min):** bottlenecks, monitoring, what you'd do next.

### Building blocks

| Block | Use it for |
|---|---|
| Load balancer | spread traffic, health checks, TLS |
| Stateless app servers | scale horizontally |
| Relational DB | consistency, relations, transactions |
| Document / key-value DB | flexible data, massive scale by key |
| Cache (Redis, CDN) | fast reads, offload the database |
| Queue / stream | async work, smoothing spikes, decoupling |
| Object storage (S3) | files, recordings, backups |
| Search (OpenSearch) | full-text and faceted search |

### Back-of-envelope numbers

- 1 million requests a day ≈ 12 requests per second on average; peak is often 2–10x average.
- A day has ~86,400 seconds; a month ~2.6 million.
- Reading 1 MB from memory: microseconds; a cross-region network round trip: ~100 ms.

### Why interviewers ask about it

It's the best signal of seniority: can you design something that works at scale, fails gracefully, and that a team can build and run?

---

## Part B — Concept Questions

## 🟢 Level 1 — Basics

**Q1. Horizontal vs vertical scaling?**

**Short answer:** Vertical means a bigger machine; horizontal means more machines. Horizontal scales further and survives failures but needs stateless services.

**Explanation:** Databases are often scaled vertically first, then with replicas and sharding.

**Example:** API servers scale horizontally behind a load balancer; PostgreSQL moves to a larger instance plus read replicas.

**Say it like this:** "App servers scale out because they're stateless; databases scale up first, then out with replicas, because that's harder."

---

**Q2. What is the CAP theorem?**

**Short answer:** During a network partition, a distributed system must choose between consistency (everyone sees the latest data) and availability (every request gets a response).

**Explanation:** Without a partition you can have both; PACELC adds that you also trade latency against consistency in normal operation.

**Example:** Payments choose consistency; a "like" counter can choose availability and catch up later.

**Say it like this:** "CAP is about what you give up during a network split. I decide per feature: money and permissions must be consistent, counters can be eventually consistent."

---

**Q3. What is a CDN, and when do you use one?**

**Short answer:** A network of edge caches close to users that serves static assets and cacheable responses with low latency.

**Explanation:** Also absorbs traffic spikes and DDoS. Cache keys and TTLs matter, especially for personalised responses.

**Example:** React bundles, images and public pages served from CloudFront.

**Say it like this:** "Anything static or cacheable goes through a CDN, which is the cheapest performance and scaling win there is."

---

**Q4. SQL or NoSQL for a new system?**

**Short answer:** Default to a relational database unless the access pattern needs massive scale by key, flexible documents, or special data models.

**Explanation:** Many systems use both: PostgreSQL for core data, Redis for caching, a document or search store for specific features.

**Example:** BpoBox core data in PostgreSQL; transcripts searchable in OpenSearch.

**Say it like this:** "Postgres by default, because consistency and SQL are worth a lot. I add specialised stores only for a clear access pattern."

---

## 🟡 Level 2 — Intermediate

**Q5. How do you design for high availability?**

**Short answer:** No single points of failure: multiple instances across availability zones, health checks, database failover, backups, and graceful degradation.

**Explanation:** Define the target (99.9% ≈ 43 minutes downtime a month) and design to it.

**Example:** API in two AZs behind an ALB, RDS Multi-AZ, Redis with a replica, S3 for recordings.

**Say it like this:** "I start from the availability target, then remove single points of failure until the design meets it."

---

**Q6. What are consistency models you'd mention?**

**Short answer:** Strong consistency, eventual consistency, read-your-writes, and monotonic reads.

**Explanation:** Read replicas break read-your-writes; route a user's reads to the primary briefly after they write.

**Example:** After saving a scorecard, the reviewer's next page load reads from the primary.

**Say it like this:** "Users expect to see their own changes immediately, so I guarantee read-your-writes even when replicas lag."

---

**Q7. How do you handle a hot key or hot partition?**

**Short answer:** Cache it, replicate it, or split it (key salting), and add rate limits for the noisy client.

**Explanation:** Hot keys overload one shard or one cache node.

**Example:** A viral short URL is cached in the CDN and in-process memory, not just Redis.

**Say it like this:** "A single hot key needs to be spread out or cached closer to users so one node doesn't carry all the load."

---

**Q8. What is a circuit breaker?**

**Short answer:** A wrapper that stops calling a failing dependency for a while, failing fast instead of piling up timeouts, then tests it again.

**Explanation:** Combine with timeouts, retries with backoff, and fallbacks.

**Example:** If the transcription API fails 50% of calls in a minute, open the circuit and queue work for later.

**Say it like this:** "Timeouts stop one slow call; a circuit breaker stops a failing dependency from dragging the whole system down."

---

## 🔴 Level 3 — Advanced

**Q9. How do you shard data?**

**Short answer:** Split data across databases by a shard key (tenant ID, user ID, hash), choosing a key that spreads load evenly and keeps common queries on one shard.

**Explanation:** Cross-shard queries and resharding are the hard parts.

**Example:** Shard by `tenant_id` for a multi-tenant SaaS; a huge tenant may need its own shard.

**Say it like this:** "The shard key decides everything, so I pick the key most queries already filter by, which in multi-tenant SaaS is usually the tenant."

---

**Q10. Monolith or microservices?**

**Short answer:** Start with a well-structured modular monolith; split out services when a part has different scaling, deployment or team ownership needs.

**Explanation:** Microservices add network failures, distributed data and operational cost.

**Example:** BpoBox core stays a monolith; the AI scoring workers are separate because they scale with call volume.

**Say it like this:** "I split by real need. The scoring pipeline was separate because it scales with call volume; the rest stayed one deployable app."

---

## Part C — Worked Designs

### Design 1. URL shortener

**Short answer:** A write API that creates a short code, a redirect service that looks up the code and returns a 301/302, with a key-value store, aggressive caching, and analytics recorded asynchronously.

**Explanation:**

- **Requirements:** create short links, redirect fast (<50 ms), custom aliases, expiry, click analytics. Reads far outnumber writes (100:1).
- **Scale:** 100M redirects a day ≈ 1,200/s average, ~10,000/s peak.
- **Short codes:** base62 of a unique ID from a counter or Snowflake-style generator (7 characters ≈ 3.5 trillion codes), avoiding collisions without checks.
- **Storage:** `code → long_url, owner, expires_at` in a key-value store or PostgreSQL with an index.
- **Read path:** CDN → Redis cache → database. Hot links never touch the database.
- **Analytics:** redirect service publishes click events to a stream; consumers aggregate counts.
- **Abuse:** rate limit creation, scan URLs for malware.

**Example:**

```text
POST /links {url} → id=125798 → base62 "wLq" → store → return https://sho.rt/wLq
GET /wLq → CDN/Redis hit → 302 Location: https://… → emit click event
```

**Say it like this:** "It's a read-heavy key lookup. I generate codes from unique IDs so there are no collisions, serve redirects from cache, and record analytics asynchronously so redirects stay fast."

---

### Design 2. Rate limiter service

**Short answer:** A shared limiter in Redis using a token bucket or sliding window, applied at the gateway per user, API key and IP, returning 429 with `Retry-After`.

**Explanation:**

- **Requirements:** different limits per plan and endpoint, low latency (<2 ms overhead), works across many instances.
- **Algorithm:** token bucket (allows short bursts) implemented atomically in a Lua script.
- **Where:** API gateway or middleware; local in-memory pre-checks for very hot paths.
- **Failure mode:** if Redis is down, fail open for normal endpoints and fail closed for login.

**Example:**

```text
key = rl:{apiKey}:{endpoint} → Lua: refill tokens by elapsed time, take 1 if available → allow/deny
```

**Say it like this:** "A token bucket in Redis gives a shared, burst-friendly limit, and I choose fail-open or fail-closed per endpoint for when Redis is down."

---

### Design 3. Notification system (email, SMS, push, in-app)

**Short answer:** Services publish notification events; a notification service applies preferences and templates, then fans out to channel-specific queues with workers, retries, deduplication and tracking.

**Explanation:**

- **Requirements:** multiple channels, user preferences and quiet hours, templates, retries, no duplicates, delivery status.
- **Flow:** event → notification service → per-channel queues → provider workers (SES, Twilio, FCM).
- **Idempotency:** a unique `notification_id` per event and user.
- **Priorities:** separate queues for urgent (security codes) and bulk (digests).

**Example:**

```text
scorecard.finalised → notify(agent) → prefs: email+in-app → email queue + in-app (WebSocket)
```

**Say it like this:** "Events go in, preferences decide channels, each channel has its own queue and retries, and a notification ID makes sure nobody gets the same message twice."

---

### Design 4. Multi-tenant SaaS backend (like BpoBox)

**Short answer:** A modular monolith API with tenant resolved from the token, shared PostgreSQL tables with `tenant_id` and row-level security, per-tenant config and limits, background workers for AI, and S3 for recordings.

**Explanation:**

- **Isolation:** tenant from the verified token only; RLS as a second layer; tenant in every cache key.
- **Noisy neighbours:** per-tenant rate limits and job quotas.
- **Customisation:** per-tenant scorecard templates and branding stored as config.
- **Big tenants:** can be moved to a dedicated database later (tenant routing table).

**Example:**

```text
Request → auth (tenant_id from JWT) → SET app.tenant_id → queries filtered by RLS → response
```

**Say it like this:** "Every layer knows the tenant: the token, the database through RLS, the cache keys and the job quotas. And there's a path to give a big tenant its own database."

---

### Design 5. AI call-scoring pipeline (your 40,000+ calls/month system)

**Short answer:** Webhook ingestion, staged queues (transcribe → chunk → score → validate → save → notify), idempotent workers, rate-limited LLM calls, evaluation and human review.

**Explanation:**

- **Ingestion:** verify Twilio signature, store event ID, enqueue, return 200 fast.
- **Stages:** separate queues so each can retry and scale independently.
- **LLM:** structured JSON output, schema validation, evidence required, retry once, then human review.
- **Scale:** 40,000 calls a month ≈ 1,300 a day; peaks during business hours; scale workers on queue age.
- **Observability:** per-stage latency, failure rate, cost per call, agreement with human reviewers.

**Example:**

```text
Twilio → /webhooks/recording → transcribe Q → chunk → score Q (parallel chunks) → validate → DB → SSE notify
                                                               ↘ invalid → human review
```

**Say it like this:** "Each stage is its own queue, so failures retry locally, and the LLM output is treated as untrusted: validated, evidence-checked, and routed to humans when unsure."

---

### Design 6. Real-time video platform (like InterpretIQ)

**Short answer:** An app API for scheduling, matching and tokens; LiveKit SFU nodes for media with Redis routing; TURN for restrictive networks; recordings to S3; metrics per room and node.

**Explanation:**

- **Join flow:** API checks the user's role and session, issues a short-lived LiveKit token with role-scoped grants.
- **Media:** SFU forwards streams; simulcast adapts quality; TURN/TLS on 443.
- **Scaling:** rooms distributed across nodes; autoscale on CPU and participants; drain on deploy.
- **Compliance:** encryption in transit, access logs, no PHI in metadata.

**Example:**

```text
Client → API (/sessions/:id/token) → LiveKit JWT (room, publish/subscribe grants) → connect WSS → media via SFU/TURN
```

**Say it like this:** "The app server decides who may join and with which rights; the SFU only moves media. That separation keeps permissions in one place and lets the media layer scale on its own."

---

### Design 7. Chat or messaging service

**Short answer:** WebSocket gateways with a pub/sub backplane, messages persisted in a database partitioned by conversation, sequence numbers per conversation, and offline delivery through push notifications.

**Explanation:**

- **Ordering:** a per-conversation sequence number assigned on write.
- **Delivery:** at-least-once with client-side dedupe by message ID; read receipts as separate events.
- **Storage:** messages by `(conversation_id, seq)`; Cassandra or PostgreSQL partitioned tables at large scale.
- **Presence:** Redis keys with TTL refreshed by heartbeats.

**Example:** User A sends → gateway → persist (seq 42) → publish `conv:9` → gateways deliver to B's sockets; if B is offline, push notification.

**Say it like this:** "Persist first, then fan out. Each conversation has its own sequence, so clients can detect gaps and fetch what they missed."

---

### Design 8. File upload and processing service

**Short answer:** Clients upload directly to S3 with presigned URLs; S3 events trigger processing jobs (scan, transcode, extract); metadata and status live in the database.

**Explanation:**

- **Security:** short-lived presigned URLs scoped to one key; validate type and size; malware scan before files are usable.
- **Processing:** queue-driven workers; idempotent by object key.
- **Large files:** multipart uploads, resumable.

**Example:** `POST /uploads` → presigned URL → client PUTs to S3 → `ObjectCreated` → scan → status `ready`.

**Say it like this:** "Files never pass through the API servers. S3 takes the bytes, events drive processing, and the API only manages metadata and permissions."

---

## 🧩 Talking Tips

- Say your assumptions out loud and write numbers down.
- Draw the simple version first, then deepen one area the interviewer cares about.
- For every component, say what happens when it fails.
- Tie decisions to your experience: "In BpoBox we…" is more convincing than theory.
