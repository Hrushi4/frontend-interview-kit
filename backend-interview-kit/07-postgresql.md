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

## 🎯 From Your Resume

**Q21. "How would you model BpoBox's data in PostgreSQL?"**

**Short answer:** Tenants, users with roles, calls, transcripts, scorecard templates (sections and questions), scorecards with answers, and AI scores, all carrying `tenant_id`.

**Explanation:** Templates are versioned so old scorecards keep their original questions. AI output in JSONB, final scores in typed columns.

**Example:**

```text
scorecard_templates(id, tenant_id, version, config jsonb)
scorecards(id, tenant_id, call_id, template_id, reviewer_id, total, status, version)
scorecard_answers(scorecard_id, question_id, score, comment)
```

**Say it like this:** "Everything carries tenant_id with row-level security, templates are versioned so history stays accurate, and the AI's raw output is JSONB next to the reviewer's final, typed score."
