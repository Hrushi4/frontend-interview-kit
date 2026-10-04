# 07 — PostgreSQL and SQL

PostgreSQL is listed first under Databases on your resume, and BpoBox's multi-tenant data (tenants, users, calls, scorecards) is a natural relational example. Expect SQL, indexing, transactions and query tuning.

**How this file is organised**

- **Part A — Understand the topic:** relational databases, SQL basics, indexes, transactions and isolation, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is a relational database?

Data lives in **tables** of rows and columns. Tables relate to each other through **keys**: a `calls.agent_id` column points to `users.id`. SQL lets you join, filter and aggregate that data, and the database guarantees consistency with constraints and transactions.

```text
tenants (id, name)
users   (id, tenant_id → tenants, role, email)
calls   (id, tenant_id → tenants, agent_id → users, started_at, duration_s)
scorecards (id, call_id → calls, reviewer_id → users, score, version)
```

### ACID

- **Atomicity:** all of a transaction happens, or none of it.
- **Consistency:** constraints (foreign keys, unique, check) always hold.
- **Isolation:** concurrent transactions don't see each other's half-done work.
- **Durability:** once committed, data survives a crash (via the write-ahead log).

### Indexes

An index is a sorted structure (usually a **B-tree**) that lets the database find rows without scanning the whole table, like a book index. Indexes speed up reads but slow writes and use disk, so you add them for the queries you actually run. `EXPLAIN ANALYZE` shows whether a query uses one.

### Isolation levels in PostgreSQL

| Level | Prevents | Default? |
|---|---|---|
| Read Committed | dirty reads | yes |
| Repeatable Read | non-repeatable reads (a snapshot per transaction) | |
| Serializable | all anomalies, may abort with a retry error | |

PostgreSQL uses **MVCC**: readers don't block writers, because each transaction sees a snapshot of the data.

### Why interviewers ask about it

Most backend performance problems are database problems. Interviewers want to see that you can model data, write correct SQL, choose indexes and reason about concurrency.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. Primary key vs foreign key vs unique constraint?**

**Short answer:** A primary key uniquely identifies a row; a foreign key references another table's key; a unique constraint prevents duplicate values in a column or combination.

**Explanation:** Foreign keys keep data consistent (no scorecard for a deleted call) and define what happens on delete (`CASCADE`, `RESTRICT`, `SET NULL`).

**Example:**

```sql
CREATE TABLE scorecards (
  id uuid PRIMARY KEY,
  call_id uuid NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES users(id),
  UNIQUE (call_id, reviewer_id)
);
```

**Say it like this:** "Constraints are business rules the database enforces for free. One scorecard per reviewer per call is a unique constraint, not just app code."

---

**Q2. Explain the types of JOIN.**

**Short answer:** INNER returns matches in both tables; LEFT returns all left rows plus matches; RIGHT is the mirror; FULL returns everything; CROSS is every combination.

**Explanation:** LEFT JOIN with `WHERE right.id IS NULL` finds rows with no match.

**Example:**

```sql
-- calls that have no scorecard yet
SELECT c.id FROM calls c LEFT JOIN scorecards s ON s.call_id = c.id
WHERE c.tenant_id = $1 AND s.id IS NULL;
```

**Say it like this:** "INNER for matching pairs, LEFT when I need every row from one side. The LEFT JOIN plus IS NULL pattern is how I'd build the 'unreviewed calls' queue."

---

**Q3. WHERE vs HAVING?**

**Short answer:** WHERE filters rows before grouping; HAVING filters groups after aggregation.

**Explanation:** Filter in WHERE when you can; it's cheaper and can use indexes.

**Example:**

```sql
SELECT agent_id, avg(score) FROM scorecards s JOIN calls c ON c.id = s.call_id
WHERE c.started_at >= now() - interval '30 days'
GROUP BY agent_id HAVING count(*) >= 10;
```

**Say it like this:** "WHERE trims rows, HAVING trims groups, like 'agents with at least 10 reviews this month'."

---

**Q4. What is normalisation?**

**Short answer:** Organising tables to remove duplicated data, so each fact lives in one place (usually up to third normal form).

**Explanation:** Denormalise deliberately for read performance (counters, reporting tables), and keep it in sync.

**Example:** Store the agent's name in `users`, not copied into every call row.

**Say it like this:** "I normalise by default and denormalise on purpose, with a plan to keep the copy correct."

---

**Q5. What is an index, and when shouldn't you add one?**

**Short answer:** A sorted lookup structure that speeds up reads on the indexed columns. Avoid it on tiny tables, low-selectivity columns, or write-heavy tables where it isn't needed.

**Explanation:** Every insert and update must also update each index.

**Example:** `CREATE INDEX ON calls (tenant_id, started_at DESC);` for "this tenant's recent calls".

**Say it like this:** "I index for real query patterns, checked with EXPLAIN, not every column just in case."

---

**Q6. What is a transaction?**

**Short answer:** A group of statements that commit together or roll back together.

**Explanation:** Keep transactions short; long ones hold locks and block vacuum.

**Example:**

```sql
BEGIN;
UPDATE scorecards SET status = 'final' WHERE id = $1;
INSERT INTO audit_log (entity_id, action, actor_id) VALUES ($1, 'finalise', $2);
COMMIT;
```

**Say it like this:** "If the scorecard is finalised, the audit entry must exist too. A transaction guarantees both or neither."

---

## 🟡 Level 2 — Intermediate

**Q7. Composite indexes: does column order matter?**

**Short answer:** Yes. A B-tree index on `(a, b)` helps queries filtering on `a`, or `a` and `b`, but not `b` alone. Put equality columns first, then range or sort columns.

**Explanation:** Matching the index to `WHERE` plus `ORDER BY` avoids a separate sort step.

**Example:** `WHERE tenant_id = $1 AND status = 'flagged' ORDER BY started_at DESC` → index `(tenant_id, status, started_at DESC)`.

**Say it like this:** "Equality columns first, then the sort column, so the database reads rows already in order."

---

**Q8. How do you read `EXPLAIN ANALYZE`?**

**Short answer:** It shows the plan tree with estimated and actual rows and timings; look for sequential scans on big tables, big estimate errors, and expensive sorts or nested loops.

**Explanation:** A big gap between estimated and actual rows means stale statistics (`ANALYZE`) or correlated columns.

**Example:** `Seq Scan on calls (rows=2,000,000)` filtering by `agent_id` → add an index on `agent_id`.

**Say it like this:** "I read the plan bottom up, look for the step with the most time, and compare estimated with actual rows."

---

**Q9. What are the isolation levels, and which anomalies do they prevent?**

**Short answer:** Read Committed (PostgreSQL default) prevents dirty reads; Repeatable Read gives a stable snapshot; Serializable prevents all anomalies but may abort transactions that need retrying.

**Explanation:** Lost updates and write skew can happen under Read Committed; use row locks, optimistic versions or Serializable.

**Example:** Two reviewers both see "unassigned" and both claim the same call → fix with `SELECT ... FOR UPDATE SKIP LOCKED` or a conditional update.

**Say it like this:** "Default isolation is fine for most reads. For claim-or-reserve logic I use locking or conditional updates so two people can't take the same thing."

---

**Q10. How do you implement a job or review queue in PostgreSQL?**

**Short answer:** `SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1` inside a transaction, so concurrent workers each grab different rows.

**Explanation:** Works well up to moderate scale; beyond that use a dedicated queue.

**Example:**

```sql
UPDATE calls SET reviewer_id = $1, claimed_at = now()
WHERE id = (SELECT id FROM calls WHERE tenant_id = $2 AND reviewer_id IS NULL
            ORDER BY started_at LIMIT 1 FOR UPDATE SKIP LOCKED)
RETURNING id;
```

**Say it like this:** "SKIP LOCKED lets many reviewers pull from the same queue without ever getting the same call."

---

**Q11. What is connection pooling, and why does it matter?**

**Short answer:** Reusing a limited set of database connections instead of opening one per request; PostgreSQL connections are expensive.

**Explanation:** Size pools so `instances × pool size` stays under `max_connections`; use PgBouncer with many instances or serverless functions.

**Example:** 20 Node instances × 10 connections = 200; with PgBouncer in transaction mode they share 50 real connections.

**Say it like this:** "Every app instance pools its connections, and with lots of instances I put PgBouncer in front so we never exhaust the database."

---

**Q12. How do you run schema migrations safely?**

**Short answer:** Versioned migrations in CI, backward-compatible changes, and expand-and-contract for renames or type changes.

**Explanation:** Adding a NOT NULL column with a default is fast in modern PostgreSQL; building indexes on big tables should use `CREATE INDEX CONCURRENTLY`.

**Example:** Rename a column: add the new column → dual-write → backfill → switch reads → drop the old column later.

**Say it like this:** "Migrations must work with both the old and new app version running, because deploys aren't instant."

---

**Q13. What are window functions?**

**Short answer:** Calculations across related rows without collapsing them, like ranking, running totals and moving averages, using `OVER (PARTITION BY ... ORDER BY ...)`.

**Explanation:** They replace many self-joins and subqueries.

**Example:**

```sql
SELECT agent_id, call_id, score,
       rank() OVER (PARTITION BY agent_id ORDER BY score DESC) AS rank_for_agent
FROM scorecards;
```

**Say it like this:** "Window functions answer 'top N per group' and running totals in one readable query."

---

**Q14. JSONB in PostgreSQL: when do you use it?**

**Short answer:** For flexible, semi-structured data like per-tenant scorecard configs or AI outputs, with GIN indexes for querying inside it.

**Explanation:** Keep fields you filter or join on as real columns; JSONB loses constraints and type safety.

**Example:** `scorecards.ai_output jsonb` stores the model's raw structured result; `score` stays a typed column.

**Say it like this:** "JSONB is great for flexible payloads, but anything I filter, join or constrain on becomes a real column."

---

## 🔴 Level 3 — Advanced

**Q15. How would you implement multi-tenancy?**

**Short answer:** Shared tables with a `tenant_id` column (plus row-level security), schema per tenant, or database per tenant, trading isolation against cost and operations.

**Explanation:** RLS makes the database enforce tenant filters even if the application forgets one.

**Example:**

```sql
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON calls USING (tenant_id = current_setting('app.tenant_id')::uuid);
-- per request: SET LOCAL app.tenant_id = '<tenant>';
```

**Say it like this:** "For a handful of tenants like BpoBox, shared tables with tenant_id plus row-level security give strong isolation without the cost of separate databases."

---

**Q16. How do you scale PostgreSQL reads and writes?**

**Short answer:** Indexes and query fixes first, then caching, read replicas, partitioning large tables, and finally sharding.

**Explanation:** Replicas have replication lag, so read-your-own-writes needs care.

**Example:** Partition `calls` by month; old partitions can be archived cheaply.

**Say it like this:** "Scaling Postgres is a ladder: fix queries, cache, add replicas, partition, and shard only when everything else is exhausted."

---

**Q17. What causes deadlocks, and how do you prevent them?**

**Short answer:** Two transactions each holding a lock the other needs. Prevent them by locking rows in a consistent order and keeping transactions short.

**Explanation:** PostgreSQL detects deadlocks and aborts one transaction; retry it.

**Example:** Always update `calls` before `scorecards` in every code path.

**Say it like this:** "Consistent lock ordering and short transactions prevent most deadlocks, and the code retries the rare ones."

---

**Q18. What is VACUUM, and why does it matter?**

**Short answer:** MVCC leaves dead row versions after updates and deletes; vacuum reclaims them and prevents transaction ID wraparound.

**Explanation:** Autovacuum must keep up on high-churn tables; long-running transactions block it.

**Example:** A table that's updated constantly bloated to 10x its size because a stuck idle transaction blocked vacuum.

**Say it like this:** "Postgres never updates in place, so vacuum is essential housekeeping. I watch bloat and kill long idle transactions."

---

## 🧩 Level 4 — Scenario-Based

**Q19. A dashboard query takes 8 seconds. Walk through how you fix it.**

**Short answer:** `EXPLAIN ANALYZE`, check indexes match filters and sort, reduce data scanned, consider a pre-aggregated table or materialised view, and cache.

**Explanation:** Dashboards often aggregate millions of rows; nightly or incremental aggregates fix that.

**Example:** Average score per agent per day moved into a `daily_agent_scores` table updated by a job; the query dropped to 40 ms.

**Say it like this:** "First the plan, then the index. If it's aggregating millions of rows on every load, I pre-aggregate."

---

**Q20. Two users saving the same scorecard overwrite each other. How do you fix it?**

**Short answer:** Optimistic locking with a version column, returning a conflict when the version doesn't match.

**Explanation:** The UI shows "someone else changed this" and lets the user reload or merge.

**Example:** `UPDATE ... WHERE id = $1 AND version = $2` returns 0 rows → 409.

**Say it like this:** "A version column turns a silent overwrite into a visible conflict the user can resolve."

---

## 🟢 More Basics

**Q21. What is the difference between DELETE, TRUNCATE and DROP?**

**Short answer:** DELETE removes chosen rows (logged, can be filtered and rolled back); TRUNCATE removes all rows quickly; DROP removes the table itself.

**Explanation:** TRUNCATE is transactional in PostgreSQL but takes a strong lock.

**Example:** `DELETE FROM sessions WHERE expires_at < now();` for cleanup.

**Say it like this:** "DELETE for specific rows, TRUNCATE to empty a table, DROP to remove it, and none of them in production without a backup."

---

**Q22. What are the main aggregate functions?**

**Short answer:** `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, plus `string_agg`, `array_agg`, `json_agg` and `percentile_cont` in PostgreSQL.

**Explanation:** `COUNT(*)` counts rows; `COUNT(col)` ignores NULLs.

**Example:** `SELECT percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_s) FROM calls;`.

**Say it like this:** "Beyond the basics, Postgres has percentiles and JSON aggregation, which save a lot of application code."

---

**Q23. How does NULL behave in SQL?**

**Short answer:** NULL means unknown: comparisons with NULL are unknown (not true), so use `IS NULL`; aggregates skip NULLs; `COALESCE` provides defaults.

**Explanation:** `WHERE col != 'x'` silently excludes NULL rows.

**Example:** `WHERE status IS DISTINCT FROM 'done'` includes NULLs.

**Say it like this:** "NULL isn't a value, it's unknown, so I'm careful with comparisons and use COALESCE or IS DISTINCT FROM."

---

**Q24. UNION vs UNION ALL?**

**Short answer:** UNION removes duplicates (extra sort or hash); UNION ALL keeps all rows and is faster.

**Explanation:** Use UNION ALL unless you need deduplication.

**Example:** Combining audit events from two tables with UNION ALL.

**Say it like this:** "UNION ALL by default; UNION only when duplicates are actually possible and unwanted."

---

**Q25. What is a subquery vs a CTE?**

**Short answer:** Both are queries inside queries; a CTE (`WITH`) names it for readability and can be recursive.

**Explanation:** Since PostgreSQL 12, CTEs are inlined unless marked `MATERIALIZED`.

**Example:**

```sql
WITH recent AS (SELECT * FROM calls WHERE started_at > now() - interval '7 days')
SELECT agent_id, count(*) FROM recent GROUP BY agent_id;
```

**Say it like this:** "CTEs make complex queries readable, and modern Postgres optimises them like subqueries."

---

**Q26. What data types should you use for IDs, timestamps and text?**

**Short answer:** `uuid` or `bigint` identity for IDs, `timestamptz` for timestamps, `text` for strings (with check constraints if needed), `numeric` for money or integers in minor units.

**Explanation:** `timestamp` without a time zone causes bugs across regions.

**Example:** `created_at timestamptz NOT NULL DEFAULT now()`.

**Say it like this:** "timestamptz always, text over varchar, and money never as float."

---

**Q27. What is an upsert?**

**Short answer:** Insert or update in one statement: `INSERT ... ON CONFLICT (key) DO UPDATE` or `DO NOTHING`.

**Explanation:** Needs a unique constraint on the conflict target. Great for idempotent writes.

**Example:**

```sql
INSERT INTO agent_daily_stats (agent_id, day, calls) VALUES ($1, $2, 1)
ON CONFLICT (agent_id, day) DO UPDATE SET calls = agent_daily_stats.calls + 1;
```

**Say it like this:** "Upserts make writes idempotent and race-free, backed by a unique constraint."

---

**Q28. What are views and materialised views?**

**Short answer:** A view is a saved query run each time; a materialised view stores the result and must be refreshed.

**Explanation:** `REFRESH MATERIALIZED VIEW CONCURRENTLY` avoids blocking reads (needs a unique index).

**Example:** A materialised view of monthly scores per tenant, refreshed nightly.

**Say it like this:** "Views for reuse, materialised views for expensive reports that can be a little stale."

---

## 🟡 More Intermediate

**Q29. What index types does PostgreSQL offer?**

**Short answer:** B-tree (default, equality and range), Hash, GIN (arrays, JSONB, full-text), GiST (geometric, ranges), BRIN (huge naturally ordered tables).

**Explanation:** Pick by query operator.

**Example:** GIN on `ai_output jsonb` for `@>` queries; BRIN on `events.created_at` for an append-only log.

**Say it like this:** "B-tree covers most cases; GIN for JSONB and search, BRIN for huge time-ordered tables."

---

**Q30. What are partial and covering indexes?**

**Short answer:** A partial index covers only rows matching a condition; a covering index (`INCLUDE`) stores extra columns so queries can be answered from the index alone.

**Explanation:** Partial indexes are small and fast for hot subsets.

**Example:** `CREATE INDEX ON calls (tenant_id, started_at) WHERE status = 'flagged';`.

**Say it like this:** "If queries only touch a small subset, a partial index makes them fast without indexing the whole table."

---

**Q31. Why might PostgreSQL ignore your index?**

**Short answer:** Low selectivity (it's cheaper to scan), functions or casts on the column, leading column not used, stale statistics, or type mismatches.

**Explanation:** Use expression indexes for `lower(email)`, and run `ANALYZE`.

**Example:** `WHERE lower(email) = $1` needs `CREATE INDEX ON users (lower(email));`.

**Say it like this:** "The planner skips indexes when they don't help or can't be used; EXPLAIN tells me which case it is."

---

**Q32. How does full-text search work in PostgreSQL?**

**Short answer:** Convert text to `tsvector`, query with `tsquery`, index with GIN, and rank with `ts_rank`.

**Explanation:** Good enough for many apps before adding OpenSearch.

**Example:**

```sql
ALTER TABLE transcripts ADD COLUMN search tsvector GENERATED ALWAYS AS (to_tsvector('english', body)) STORED;
CREATE INDEX ON transcripts USING gin (search);
SELECT call_id FROM transcripts WHERE search @@ websearch_to_tsquery('english', 'refund policy');
```

**Say it like this:** "Postgres full-text search with a GIN index handles transcript search well before we'd need a separate search engine."

---

**Q33. What is the N+1 query problem with ORMs?**

**Short answer:** Loading a list, then lazily loading a relation per item, producing N extra queries.

**Explanation:** Fix with eager loading (`JOIN` or `IN` queries) or DataLoader.

**Example:** Prisma `include: { agent: true }` or SQLAlchemy `selectinload(Call.agent)`.

**Say it like this:** "I watch query counts per request; N+1 is the most common ORM performance bug."

---

**Q34. How do you paginate efficiently in SQL?**

**Short answer:** Keyset pagination: `WHERE (sort_key, id) < ($1, $2) ORDER BY sort_key DESC, id DESC LIMIT n`, with an index on `(sort_key, id)`.

**Explanation:** `OFFSET` scans and discards rows, so it gets slower with depth.

**Example:** Page 1,000 with OFFSET reads 50,000 rows; keyset reads 50.

**Say it like this:** "Keyset pagination costs the same on page 1 and page 1,000; OFFSET doesn't."

---

**Q35. How do you count rows efficiently on large tables?**

**Short answer:** Exact `count(*)` scans; use estimates (`pg_class.reltuples`), cached counters, or show "1,000+" instead of exact totals.

**Explanation:** Many UIs don't need exact totals.

**Example:** Maintain `tenant_stats.call_count` with a trigger or job.

**Say it like this:** "Exact counts on big tables are expensive, so I use estimates or maintained counters unless exactness matters."

---

**Q36. How do triggers work, and when should you use them?**

**Short answer:** Functions run automatically on insert, update or delete; useful for audit logs, `updated_at` and derived data, but they hide logic.

**Explanation:** Keep them simple and documented.

**Example:** A trigger that sets `updated_at = now()` on every update.

**Say it like this:** "Triggers are great for invariants like timestamps and audit trails; business logic stays in the application."

---

**Q37. How do you store hierarchical data?**

**Short answer:** Adjacency list (`parent_id`) with recursive CTEs, materialised path, nested sets, or the `ltree` extension.

**Explanation:** Adjacency lists are simplest; `ltree` is fast for subtree queries.

**Example:**

```sql
WITH RECURSIVE thread AS (
  SELECT * FROM comments WHERE id = $1
  UNION ALL SELECT c.* FROM comments c JOIN thread t ON c.parent_id = t.id)
SELECT * FROM thread;
```

**Say it like this:** "parent_id plus a recursive CTE covers most trees; ltree when subtree queries are hot."

---

**Q38. How do you back up and restore PostgreSQL?**

**Short answer:** Managed snapshots plus point-in-time recovery (WAL archiving), logical dumps for portability, and regular restore tests.

**Explanation:** A backup you haven't restored is a hope, not a backup.

**Example:** RDS automated backups with 7-day PITR; monthly restore drill to staging.

**Say it like this:** "Point-in-time recovery for disasters, logical dumps for portability, and restore drills to prove they work."

---

## 🔴 More Advanced

**Q39. What is table partitioning, and when do you use it?**

**Short answer:** Splitting a big table into child tables by range, list or hash; queries prune irrelevant partitions, and old data can be dropped instantly.

**Explanation:** Good for time-series data with retention rules.

**Example:** `calls` partitioned by month; dropping last year's partition removes data without a huge DELETE.

**Say it like this:** "Partitioning time-based data makes queries prune old months and makes retention a cheap DROP."

---

**Q40. How does replication work, and what is replication lag?**

**Short answer:** Primary streams WAL changes to replicas; lag is how far behind replicas are. Reads from replicas can return stale data.

**Explanation:** Synchronous replication avoids data loss at the cost of write latency.

**Example:** After a user writes, read their data from the primary for a few seconds.

**Say it like this:** "Replicas scale reads but lag behind, so read-your-writes paths go to the primary."

---

**Q41. What locks does PostgreSQL take on schema changes?**

**Short answer:** Many `ALTER TABLE` operations take an ACCESS EXCLUSIVE lock, blocking all reads and writes; even waiting for that lock blocks queries queued behind it.

**Explanation:** Set `lock_timeout`, use `CONCURRENTLY` for indexes, and split risky changes into steps.

**Example:** `SET lock_timeout = '3s'; ALTER TABLE calls ADD COLUMN …;` and retry if it times out.

**Say it like this:** "A migration waiting for a lock can block the whole table, so I set a lock timeout and design changes to be lock-friendly."

---

**Q42. What is advisory locking?**

**Short answer:** Application-defined locks in PostgreSQL (`pg_advisory_lock`) that coordinate work without locking rows.

**Explanation:** Useful to ensure only one instance runs a job.

**Example:** `SELECT pg_try_advisory_lock(hashtext('nightly-aggregates'));`.

**Say it like this:** "Advisory locks are a simple way to elect one worker for a job, using the database we already trust."

---

**Q43. How do you tune PostgreSQL configuration at a high level?**

**Short answer:** `shared_buffers` (~25% of RAM), `work_mem` for sorts, `effective_cache_size`, `max_connections` with pooling, autovacuum settings for busy tables.

**Explanation:** Managed services set sensible defaults; query and index fixes usually matter more.

**Example:** Raising `work_mem` for a reporting role stopped sorts spilling to disk.

**Say it like this:** "Config tuning helps at the margins; most wins come from queries and indexes."

---

## 🧩 More Scenarios

**Q44. Writes become slow as the table grows. What could cause it?**

**Short answer:** Too many indexes, index bloat, foreign key checks without indexes, triggers, lock contention or long transactions.

**Explanation:** Check each index's usage (`pg_stat_user_indexes`) and drop unused ones.

**Example:** Seven indexes on `calls`, two never used; dropping them cut insert time by 30%.

**Say it like this:** "Every index costs on write, so I check which ones are actually used."

---

**Q45. A migration locked a busy table in production. How do you prevent it next time?**

**Short answer:** Lock timeouts, `CREATE INDEX CONCURRENTLY`, adding constraints as `NOT VALID` then validating, batching backfills, and running risky migrations off-peak.

**Explanation:** Review migrations for lock level in code review.

**Example:** `ALTER TABLE … ADD CONSTRAINT … NOT VALID; ALTER TABLE … VALIDATE CONSTRAINT …;`.

**Say it like this:** "Every migration is reviewed for the lock it takes, and anything heavy is done concurrently or in batches."

---

**Q46. You suspect a slow query only in production. How do you find it?**

**Short answer:** `pg_stat_statements` for total and mean time per query, slow query logs, and `auto_explain` for plans of slow queries.

**Explanation:** Sort by total time, not just mean; a fast query called a million times can dominate.

**Example:** The top query by total time was a 4 ms permission lookup called on every request; caching it saved 20% of database time.

**Say it like this:** "pg_stat_statements shows where database time really goes, and it's often a fast query called too often."

---

**Q47. A report query blocks the production database. What do you do?**

**Short answer:** Move reporting to a read replica or analytics store, add timeouts for heavy queries, and pre-aggregate.

**Explanation:** Separate OLTP (app) and OLAP (reports) workloads.

**Example:** Reports run on a replica with `statement_timeout = 60s`.

**Say it like this:** "Reports and the live app shouldn't compete for the same database, so reporting moves to a replica or warehouse."

---

## 🎯 From Your Resume

**Q48. "How would you model BpoBox's data in PostgreSQL?"**

**Short answer:** Tenants, users with roles, calls, transcripts, scorecard templates (sections and questions), scorecards with answers, and AI scores, all carrying `tenant_id`.

**Explanation:** Templates are versioned so old scorecards keep their original questions. AI output in JSONB, final scores in typed columns.

**Example:**

```text
scorecard_templates(id, tenant_id, version, config jsonb)
scorecards(id, tenant_id, call_id, template_id, reviewer_id, total, status, version)
scorecard_answers(scorecard_id, question_id, score, comment)
```

**Say it like this:** "Everything carries tenant_id with row-level security, templates are versioned so history stays accurate, and the AI's raw output is JSONB next to the reviewer's final, typed score."
