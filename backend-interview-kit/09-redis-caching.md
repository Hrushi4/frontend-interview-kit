# 09 — Redis and Caching

Redis is on your resume and sits behind several of your systems: the Celery broker for AI scoring, room routing for self-hosted LiveKit, and caching in the AWS design. Expect data structures, caching strategies, and how caches fail.

**How this file is organised**

- **Part A — Understand the topic:** what Redis is, its data structures, caching patterns and invalidation, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is Redis?

Redis is an **in-memory data store**. Because data lives in RAM, reads and writes take well under a millisecond. It's used as a cache, session store, rate limiter, queue broker, pub/sub bus and leaderboard. It can persist to disk (RDB snapshots, AOF logs), but it's usually not your main database.

### Data structures

| Type | Use it for |
|---|---|
| String | cached values, counters (`INCR`), locks |
| Hash | an object's fields (`user:42` → name, role) |
| List | simple queues |
| Set | unique members (online users) |
| Sorted set | leaderboards, rate-limit windows, scheduled jobs |
| Stream | durable event logs with consumer groups |

### Caching patterns

- **Cache-aside (lazy loading):** read from cache; on a miss, read the database and store the result. Most common.
- **Write-through:** write to the cache and database together.
- **Write-behind:** write to the cache, and flush to the database later (risky).

### The hard part: invalidation and failure modes

A cache is a copy, so it can be **stale**. You need a strategy: TTLs, deleting keys on writes, or versioned keys. Caches also fail in specific ways: a **stampede** (many requests miss at once), **penetration** (repeated requests for keys that don't exist), and **avalanche** (many keys expiring together).

### Why interviewers ask about it

Caching is the fastest way to scale reads, and also a common source of subtle bugs. Interviewers want to hear about invalidation, TTLs, failure modes and what must never be cached (like other tenants' data under a shared key).

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. What is Redis, and why is it fast?**

**Short answer:** An in-memory key-value store with rich data structures; it's fast because data is in RAM and commands run on a simple, mostly single-threaded event loop.

**Explanation:** No disk seeks on reads and no locks between commands. Network round trips usually dominate, so pipelining helps.

**Example:** A cached dashboard query returns in under 1 ms instead of 300 ms from PostgreSQL.

**Say it like this:** "Redis keeps data in memory and runs commands one at a time, so each is atomic and extremely fast."

---

**Q2. What is cache-aside?**

**Short answer:** The app checks the cache, falls back to the database on a miss, then stores the result with a TTL.

**Explanation:** On writes, delete the cache key so the next read refreshes it.

**Example:**

```ts
async function getTenantConfig(id: string) {
  const hit = await redis.get(`tenant:${id}:config`);
  if (hit) return JSON.parse(hit);
  const cfg = await db.tenantConfig.findUnique({ where: { tenantId: id } });
  await redis.set(`tenant:${id}:config`, JSON.stringify(cfg), 'EX', 300);
  return cfg;
}
```

**Say it like this:** "Cache-aside is my default: read through the cache, fill it on a miss, and delete the key whenever the data changes."

---

**Q3. What is a TTL, and how do you choose one?**

**Short answer:** Time-to-live: how long a key exists before Redis removes it. Choose it by how stale the data can safely be.

**Explanation:** Add random jitter to TTLs so keys don't all expire together.

**Example:** Tenant theme: 1 hour. Agent leaderboard: 60 seconds. Permissions: short, or invalidated on change.

**Say it like this:** "The TTL is a business decision: how stale is acceptable? I add jitter so a whole batch doesn't expire at once."

---

**Q4. How do you use Redis for sessions?**

**Short answer:** Store session data under a random session ID key with a TTL; the browser holds only the ID in an HttpOnly cookie.

**Explanation:** Logging out deletes the key, which revokes the session immediately, unlike a stateless JWT.

**Example:** `SET session:9f2c... '{"userId":42,"tenantId":"t1"}' EX 3600`.

**Say it like this:** "Redis sessions are revocable instantly, which matters for healthcare apps where access must end the moment it's removed."

---

**Q5. What are Redis persistence options?**

**Short answer:** RDB snapshots (periodic, compact) and AOF (append-only log of writes, more durable); you can use both or neither.

**Explanation:** For a pure cache, persistence is optional. For queues or sessions, enable AOF.

**Example:** Celery broker Redis with AOF `everysec` so a restart loses at most a second of jobs.

**Say it like this:** "A cache can lose everything safely. A queue broker can't, so it gets AOF persistence."

---

## 🟡 Level 2 — Intermediate

**Q6. How do you invalidate a cache correctly?**

**Short answer:** Delete (not update) the key after the database write commits, use TTLs as a safety net, and use versioned keys for bulk invalidation.

**Explanation:** Updating the cache can race with other writers; deleting is safer.

**Example:** On scorecard update: commit, then `DEL agent:12:stats`. For a template change: bump `tenant:1:tplver` so all keys built with the old version are ignored.

**Say it like this:** "Write to the database, then delete the cache key. TTLs catch anything I miss."

---

**Q7. What is a cache stampede, and how do you prevent it?**

**Short answer:** When a popular key expires and many requests hit the database at once. Prevent it with a lock so one request refreshes, early refresh, or stale-while-revalidate.

**Explanation:** Also use TTL jitter.

**Example:**

```ts
const lock = await redis.set(`lock:${key}`, '1', 'NX', 'PX', 5000);
if (lock) { const v = await loadFromDb(); await redis.set(key, v, 'EX', 300); await redis.del(`lock:${key}`); }
else { await sleep(50); return redis.get(key); }
```

**Say it like this:** "When a hot key expires, only one request should rebuild it while the others wait or get the stale value."

---

**Q8. How do you build a rate limiter with Redis?**

**Short answer:** Fixed window with `INCR` and `EXPIRE`, sliding window with sorted sets, or a token bucket with a Lua script for atomicity.

**Explanation:** Redis makes the limit shared across all API instances.

**Example:**

```ts
const key = `rl:${userId}:${Math.floor(Date.now() / 60000)}`;
const n = await redis.incr(key);
if (n === 1) await redis.expire(key, 60);
if (n > 100) throw new TooManyRequests();
```

**Say it like this:** "A counter per user per minute in Redis, shared by all instances. For smoother limits I'd use a sliding window or token bucket in Lua."

---

**Q9. How do you implement a distributed lock?**

**Short answer:** `SET key token NX PX ttl`, and release only if the token matches (with a Lua script). Use fencing tokens for correctness-critical work.

**Explanation:** Locks can expire while work is still running (GC pause), so make the work idempotent too.

**Example:** Lock `lock:scoring:call:42` so two workers don't score the same call at once.

**Say it like this:** "Redis locks are fine for efficiency, so two workers don't do the same work. For correctness I also make the work idempotent."

---

**Q10. What is Redis pub/sub, and what are its limits?**

**Short answer:** Fire-and-forget messaging to subscribers on a channel; messages are lost if no one's listening. Use Streams when you need durability.

**Explanation:** Pub/sub is great for broadcasting WebSocket messages across instances.

**Example:** Each API instance subscribes to `tenant:1:events` and forwards messages to its connected clients.

**Say it like this:** "Pub/sub fans messages out across servers but doesn't keep them. If a message must not be lost, I use Streams or a real queue."

---

**Q11. What eviction policies exist?**

**Short answer:** When memory is full, Redis evicts by policy: `allkeys-lru`, `allkeys-lfu`, `volatile-lru` (only keys with TTL), `noeviction`, and others.

**Explanation:** Cache instances use `allkeys-lru` or `lfu`; brokers and session stores use `noeviction` and alert on memory.

**Example:** A shared Redis for cache and Celery lost jobs to eviction; splitting them fixed it.

**Say it like this:** "Caches can evict; queues must not. I keep them on separate Redis instances with different policies."

---

## 🔴 Level 3 — Advanced

**Q12. What should never be cached, or cached carefully?**

**Short answer:** Per-user or per-tenant data under shared keys, sensitive data like PHI without encryption and short TTLs, and permission data without invalidation.

**Explanation:** Cache keys must include every dimension that changes the result (tenant, user, role, locale).

**Example:** A bug cached `/api/dashboard` by URL only; tenant B saw tenant A's numbers. The fix was to include `tenantId` in the key.

**Say it like this:** "A cache key must include everything that changes the answer, especially tenant and user. Getting that wrong is a data leak, not just a bug."

---

**Q13. Redis Cluster vs Sentinel?**

**Short answer:** Sentinel gives high availability (automatic failover) for one primary; Cluster shards data across multiple primaries for scale plus failover.

**Explanation:** In Cluster, multi-key operations must use keys in the same hash slot (hash tags `{tenant1}:x`).

**Example:** AWS ElastiCache handles either mode for you.

**Say it like this:** "Sentinel when one node's memory is enough and I just need failover; Cluster when I need to shard."

---

**Q14. Why use Lua scripts or transactions in Redis?**

**Short answer:** To make several commands atomic; Lua scripts run without interleaving, which suits rate limiters and safe lock release.

**Explanation:** `MULTI`/`EXEC` batches commands but can't branch on intermediate results; Lua can.

**Example:** Release a lock only if `GET key == token`, then `DEL`, in one script.

**Say it like this:** "When a check-then-act must be atomic in Redis, I put it in a Lua script."

---

## 🧩 Level 4 — Scenario-Based

**Q15. After a deploy, users see old data for 10 minutes. What happened?**

**Short answer:** Cache keys weren't invalidated on the change, or the key format stayed the same while the data shape changed.

**Explanation:** Version cache keys with the schema version and invalidate on write.

**Example:** Prefix keys with `v3:` when the cached shape changes.

**Say it like this:** "Stale data after a deploy means the cache didn't know something changed. Versioned keys and delete-on-write fix that."

---

**Q16. Redis CPU hits 100% and latency spikes. What do you check?**

**Short answer:** Slow commands (`SLOWLOG`), `KEYS *` or big `SMEMBERS`/`HGETALL` on huge keys, hot keys, and too many connections.

**Explanation:** Replace `KEYS` with `SCAN`, split big keys, and add a local in-process cache for very hot keys.

**Example:** A cron job ran `KEYS session:*` on millions of keys and blocked Redis.

**Say it like this:** "Redis is single-threaded per command, so one slow command blocks everyone. SLOWLOG usually points straight to it."

---

## 🟢 More Basics

**Q17. What are the most common Redis commands?**

**Short answer:** `GET/SET` (with `EX`, `NX`), `DEL`, `EXPIRE/TTL`, `INCR`, `HSET/HGETALL`, `LPUSH/RPOP`, `SADD/SMEMBERS`, `ZADD/ZRANGE`, `SCAN`.

**Explanation:** `SET key value NX EX 60` sets only if missing, with a TTL, in one atomic step.

**Example:** `SET otp:user:42 739201 EX 300`.

**Say it like this:** "SET with NX and EX in one command covers locks, OTPs and one-time keys."

---

**Q18. When would you use a hash instead of a JSON string?**

**Short answer:** When you read or update individual fields; a JSON string is simpler when you always read the whole object.

**Explanation:** Hashes let you `HINCRBY` a single field atomically.

**Example:** `HINCRBY agent:12:today calls 1`.

**Say it like this:** "Hashes for objects I update field by field, JSON strings for objects I always read whole."

---

**Q19. How do you build a leaderboard with Redis?**

**Short answer:** A sorted set: `ZINCRBY` to update scores, `ZREVRANGE` with scores for the top N, `ZREVRANK` for a user's position.

**Explanation:** All operations are O(log n).

**Example:** `ZADD tenant:1:leaderboard 92 agent:12`; `ZREVRANGE tenant:1:leaderboard 0 9 WITHSCORES`.

**Say it like this:** "Sorted sets are built for leaderboards: updates and top-N reads are both fast."

---

**Q20. How do you avoid `KEYS *` in production?**

**Short answer:** Use `SCAN` with a cursor and `MATCH`, which iterates in small batches without blocking Redis.

**Explanation:** `KEYS` scans everything in one blocking command.

**Example:** `SCAN 0 MATCH session:* COUNT 1000`.

**Say it like this:** "KEYS blocks Redis; SCAN does the same job in safe, small steps."

---

**Q21. What is pipelining?**

**Short answer:** Sending many commands without waiting for each reply, cutting network round trips.

**Explanation:** Not atomic; use `MULTI` or Lua for atomicity.

**Example:** Loading 500 cache keys in one pipeline instead of 500 round trips.

**Say it like this:** "Pipelining batches round trips, which is often the biggest Redis latency win."

---

**Q22. Redis vs Memcached?**

**Short answer:** Memcached is a simple, multithreaded key-value cache; Redis adds data structures, persistence, replication, pub/sub, scripting and streams.

**Explanation:** Redis is the default choice today unless you only need a plain cache.

**Example:** Rate limiting and leaderboards need Redis data structures.

**Say it like this:** "Memcached is a plain cache; Redis is a toolbox, which is why it's usually chosen."

---

## 🟡 More Intermediate

**Q23. What is read-through and write-through caching?**

**Short answer:** Read-through: the cache layer loads from the database on a miss itself. Write-through: writes go to the cache and database together, keeping the cache fresh.

**Explanation:** Write-through adds write latency but avoids stale reads.

**Example:** A caching library wraps the repository so services just call `getConfig()`.

**Say it like this:** "Read-through hides cache logic from callers; write-through keeps the cache fresh at the cost of slower writes."

---

**Q24. What is cache penetration, and how do you stop it?**

**Short answer:** Repeated requests for keys that don't exist bypass the cache and hit the database every time; cache "not found" results briefly, or use a Bloom filter.

**Explanation:** Attackers can use random IDs to overload the database.

**Example:** Cache `null` for a missing short code for 60 seconds.

**Say it like this:** "Missing data should be cached too, briefly, so repeated misses don't all hit the database."

---

**Q25. What is a cache avalanche?**

**Short answer:** Many keys expiring at the same time (or the cache going down), sending a flood of requests to the database.

**Explanation:** Add TTL jitter, keep hot keys warm, and have the database protected by rate limits or circuit breakers.

**Example:** Keys all set at deploy time with TTL 3600 expired together an hour later.

**Say it like this:** "Jittered TTLs stop keys expiring together, and fallbacks protect the database if the cache disappears."

---

**Q26. What is a local (in-process) cache, and when do you add one?**

**Short answer:** A small LRU cache in each app instance for very hot, rarely changing data, in front of Redis.

**Explanation:** Saves network round trips; invalidate with short TTLs or pub/sub messages.

**Example:** Tenant feature flags cached in memory for 30 seconds.

**Say it like this:** "For tiny, hot data, an in-process cache avoids even the Redis round trip."

---

**Q27. How do you store sessions or tokens safely in Redis?**

**Short answer:** Random, unguessable keys, TTLs matching session lifetime, minimal data, network isolation, and AUTH/TLS enabled.

**Explanation:** Index sessions per user (a set) so you can revoke all of a user's sessions.

**Example:** `SADD user:42:sessions s_9f2c`; on password change, delete all listed sessions.

**Say it like this:** "Sessions expire on their own, and a per-user index lets us log someone out everywhere instantly."

---

**Q28. What are Redis Streams?**

**Short answer:** An append-only log with consumer groups, acknowledgements and pending entries, giving durable, at-least-once messaging.

**Explanation:** A lighter alternative to Kafka for moderate workloads.

**Example:** `XADD events * type call.scored id c_42`; workers `XREADGROUP` and `XACK`.

**Say it like this:** "Streams give Redis durable queues with consumer groups, unlike fire-and-forget pub/sub."

---

**Q29. How do you use Redis for distributed rate limiting with a sliding window?**

**Short answer:** A sorted set per key with timestamps as scores: remove entries older than the window, count the rest, add the new one, all in a Lua script.

**Explanation:** More accurate than fixed windows, costs more memory.

**Example:** `ZREMRANGEBYSCORE key 0 now-60000; ZCARD key; ZADD key now now`.

**Say it like this:** "A sliding window counts exactly the last 60 seconds, which avoids burst loopholes at window edges."

---

## 🔴 More Advanced

**Q30. What is the Redlock algorithm, and is it safe?**

**Short answer:** Acquiring a lock on a majority of independent Redis nodes; it's debated for correctness because of clock and pause issues.

**Explanation:** For correctness-critical locks, use fencing tokens or a consensus system (etcd, ZooKeeper, database locks).

**Example:** Use Postgres advisory locks for "only one billing run".

**Say it like this:** "Redis locks are fine for efficiency; when correctness depends on the lock, I use fencing tokens or a stronger system."

---

**Q31. How do you handle Redis failover in your application?**

**Short answer:** Use a client that understands Sentinel or Cluster topology, set connection and command timeouts, retry briefly, and degrade gracefully when the cache is unavailable.

**Explanation:** Cache misses should fall back to the database, with limits.

**Example:** `ioredis` with Sentinel config and `maxRetriesPerRequest: 2`.

**Say it like this:** "The app treats the cache as optional: short timeouts, quick retries, then fall back."

---

**Q32. How do you find hot keys and big keys?**

**Short answer:** `redis-cli --hotkeys` (with LFU policy), `--bigkeys`, `MEMORY USAGE key`, and monitoring per-command latency.

**Explanation:** Big keys slow commands; hot keys overload one shard.

**Example:** A 50 MB hash of all agents' stats split into one hash per agent.

**Say it like this:** "Big and hot keys cause most Redis performance problems, and Redis has built-in tools to find them."

---

**Q33. How do you secure Redis?**

**Short answer:** Private network only, AUTH with ACL users, TLS, disabled dangerous commands (`FLUSHALL`, `CONFIG`), and no public exposure.

**Explanation:** Unprotected Redis instances are regularly exploited.

**Example:** ElastiCache in private subnets with in-transit encryption and AUTH.

**Say it like this:** "Redis is never reachable from the internet, and access uses ACL users over TLS."

---

## 🧩 More Scenarios

**Q34. Redis memory usage keeps growing. What do you check?**

**Short answer:** Keys without TTLs, growing collections, eviction policy, fragmentation, and big keys.

**Explanation:** Every cache key should have a TTL.

**Example:** A bug wrote rate-limit keys without `EXPIRE`, so they lived forever.

**Say it like this:** "Unbounded growth usually means keys without TTLs. Every cache and counter key gets one."

---

**Q35. After Redis restarts, the database is overwhelmed. How do you prevent this?**

**Short answer:** Warm critical keys gradually, use request coalescing, rate limit cache rebuilds, and keep replicas so the cache isn't empty after failover.

**Explanation:** A cold cache is a predictable incident; plan for it.

**Example:** A startup job pre-loads tenant configs and permissions.

**Say it like this:** "A cold cache can take down the database, so critical data is pre-warmed and rebuilds are throttled."

---

**Q36. Users sometimes see permissions that were already revoked. Why?**

**Short answer:** Permissions are cached and not invalidated on change, or a JWT still carries old roles.

**Explanation:** Invalidate permission cache keys on role changes and keep token lifetimes short.

**Example:** On role change: `DEL perms:user:42` and bump the user's token version.

**Say it like this:** "Revoked access must take effect quickly, so permission caches are invalidated on change and tokens are short-lived."

---

## 🎯 From Your Resume

**Q37. "Where did Redis fit in your systems?"**

**Short answer:** As the Celery broker for AI scoring jobs, for room routing across self-hosted LiveKit nodes, and for caching in the AWS design. [Adjust to your real uses.]

**Explanation:** Be precise about which you built and which you configured.

**Example:** "LiveKit uses Redis to know which node hosts which room, so a participant joining room X reaches the right server."

**Say it like this:** "Redis showed up in three roles: the Celery job broker for call scoring, LiveKit's routing store across nodes, and a cache layer in the AWS design. Each needed different settings: the broker must never evict, the cache can."
