# 20 — SQL Practice (Write the Query)

Many backend and full-stack interviews include a live SQL round: "write a query that…". This file gives you common problems on a schema close to BpoBox, with the query and what to say while you write it.

**How this file is organised**

- **Part A — Understand the topic:** the practice schema and a method for writing queries under pressure.
- **Part B — Query problems with answers:** Basic → Intermediate → Advanced.

Each problem has a **Short answer** (the approach), an **Explanation** (why it works and edge cases), an **Example** (the SQL) and **Say it like this** (what to say while you write it).

---

## Part A — Understand the Topic

### The practice schema

```sql
tenants    (id, name, created_at)
users      (id, tenant_id, name, email, role, active, created_at)        -- role: admin | qa | agent
calls      (id, tenant_id, agent_id → users, started_at, duration_s, status) -- status: open | flagged | done
scorecards (id, call_id → calls, reviewer_id → users, score, status, created_at) -- status: draft | final
ai_scores  (id, call_id → calls, prompt_version, score, sentiment, created_at)
```

### A method for live SQL

1. **Restate the output:** "one row per agent, with their average score this month".
2. **Find the tables and joins** needed.
3. **Filter** (WHERE), **group** (GROUP BY), **filter groups** (HAVING), **sort and limit**.
4. **Think about edge cases:** NULLs, ties, missing rows (LEFT JOIN), duplicates, time zones.
5. **Mention indexes** that would make it fast.

**Say it like this (opening):** "Let me restate what one output row represents, then I'll build the joins and filters step by step."

---

## Part B — Query Problems with Answers

## 🟢 Basic

**Q1. List all active QA reviewers in tenant 1, sorted by name.**

**Short answer:** Filter `users` by tenant, role and active, then order by name.

**Explanation:** Simple filtering; an index on `(tenant_id, role)` helps.

**Example:**

```sql
SELECT id, name, email FROM users
WHERE tenant_id = 1 AND role = 'qa' AND active
ORDER BY name;
```

**Say it like this:** "Filter on tenant, role and active, then sort. In production every query starts with the tenant."

---

**Q2. Count calls per status for a tenant.**

**Short answer:** Group by status and count.

**Explanation:** Statuses with zero calls won't appear; use a list of statuses with a LEFT JOIN if they must.

**Example:**

```sql
SELECT status, count(*) AS calls FROM calls
WHERE tenant_id = 1 GROUP BY status ORDER BY calls DESC;
```

**Say it like this:** "GROUP BY status with COUNT; if zero-count statuses must show, I'd LEFT JOIN from a status list."

---

**Q3. Find calls longer than 10 minutes in the last 7 days.**

**Short answer:** Filter by duration and a time window on `started_at`.

**Explanation:** Use `timestamptz` and `now() - interval`.

**Example:**

```sql
SELECT id, agent_id, duration_s FROM calls
WHERE tenant_id = 1 AND duration_s > 600 AND started_at >= now() - interval '7 days'
ORDER BY duration_s DESC;
```

**Say it like this:** "Duration over 600 seconds within the last 7 days, newest window computed by the database."

---

**Q4. Show each call with its agent's name.**

**Short answer:** Inner join `calls` to `users` on `agent_id`.

**Explanation:** Use LEFT JOIN if agents can be deleted and calls must still appear.

**Example:**

```sql
SELECT c.id, c.started_at, u.name AS agent
FROM calls c JOIN users u ON u.id = c.agent_id
WHERE c.tenant_id = 1;
```

**Say it like this:** "A simple join on agent_id. If users can be removed, I'd switch to LEFT JOIN so calls don't disappear."

---

**Q5. Find calls that have no scorecard.**

**Short answer:** LEFT JOIN scorecards and keep rows where the scorecard is NULL, or use NOT EXISTS.

**Explanation:** `NOT EXISTS` is clear and handles NULLs safely (`NOT IN` with NULLs returns nothing).

**Example:**

```sql
SELECT c.id FROM calls c
WHERE c.tenant_id = 1
  AND NOT EXISTS (SELECT 1 FROM scorecards s WHERE s.call_id = c.id);
```

**Say it like this:** "NOT EXISTS reads well and avoids the NOT IN with NULL trap."

---

**Q6. Average score per reviewer for final scorecards.**

**Short answer:** Filter final scorecards, group by reviewer, average the score.

**Explanation:** Round for display; join users for names.

**Example:**

```sql
SELECT u.name, round(avg(s.score), 1) AS avg_score, count(*) AS reviews
FROM scorecards s JOIN users u ON u.id = s.reviewer_id
WHERE s.status = 'final' AND u.tenant_id = 1
GROUP BY u.name ORDER BY avg_score DESC;
```

**Say it like this:** "Group by reviewer, average and count, so we see both the score and how many reviews it's based on."

---

**Q7. Agents with more than 50 calls this month.**

**Short answer:** Group calls by agent for the current month and use HAVING.

**Explanation:** `date_trunc('month', now())` gives the month start; mind time zones.

**Example:**

```sql
SELECT agent_id, count(*) AS calls FROM calls
WHERE tenant_id = 1 AND started_at >= date_trunc('month', now())
GROUP BY agent_id HAVING count(*) > 50;
```

**Say it like this:** "WHERE limits rows to this month, HAVING filters the grouped counts."

---

**Q8. The 10 most recent flagged calls.**

**Short answer:** Filter by status, order by `started_at DESC`, limit 10.

**Explanation:** Index `(tenant_id, status, started_at DESC)` makes this instant.

**Example:**

```sql
SELECT id, agent_id, started_at FROM calls
WHERE tenant_id = 1 AND status = 'flagged'
ORDER BY started_at DESC LIMIT 10;
```

**Say it like this:** "Filter, sort newest first, limit, and a composite index on tenant, status and time keeps it fast."

---

## 🟡 Intermediate

**Q9. Calls per day for the last 30 days, including days with zero calls.**

**Short answer:** Generate a series of days and LEFT JOIN aggregated calls onto it.

**Explanation:** Without the generated series, empty days are missing from charts.

**Example:**

```sql
SELECT d::date AS day, count(c.id) AS calls
FROM generate_series(current_date - 29, current_date, interval '1 day') d
LEFT JOIN calls c ON c.tenant_id = 1 AND c.started_at >= d AND c.started_at < d + interval '1 day'
GROUP BY d ORDER BY d;
```

**Say it like this:** "generate_series gives every day, and the LEFT JOIN keeps days with no calls as zero."

---

**Q10. Top 3 calls by score for each agent.**

**Short answer:** Rank scores within each agent using a window function, then keep rank ≤ 3.

**Explanation:** `row_number` gives exactly 3; `rank` or `dense_rank` keeps ties.

**Example:**

```sql
SELECT * FROM (
  SELECT c.agent_id, s.call_id, s.score,
         row_number() OVER (PARTITION BY c.agent_id ORDER BY s.score DESC) AS rn
  FROM scorecards s JOIN calls c ON c.id = s.call_id
  WHERE c.tenant_id = 1 AND s.status = 'final') t
WHERE rn <= 3;
```

**Say it like this:** "Top N per group is a window function: number rows per agent by score and keep the first three."

---

**Q11. Compare AI score with human score per call, and show the difference.**

**Short answer:** Join `ai_scores` and final `scorecards` on `call_id`, compute the absolute difference.

**Explanation:** Pick one AI score per call (latest prompt version) to avoid duplicates.

**Example:**

```sql
WITH latest_ai AS (
  SELECT DISTINCT ON (call_id) call_id, score FROM ai_scores ORDER BY call_id, created_at DESC)
SELECT s.call_id, s.score AS human, a.score AS ai, abs(s.score - a.score) AS diff
FROM scorecards s JOIN latest_ai a ON a.call_id = s.call_id
WHERE s.status = 'final'
ORDER BY diff DESC;
```

**Say it like this:** "DISTINCT ON picks the latest AI score per call, then I compare it with the final human score. This is exactly the query behind our AI-vs-human agreement checks."

---

**Q12. Percentage of calls flagged per agent.**

**Short answer:** Group by agent and use a conditional aggregate: `count(*) FILTER (WHERE status = 'flagged')` divided by total.

**Explanation:** Multiply by 100.0 to avoid integer division.

**Example:**

```sql
SELECT agent_id,
       round(100.0 * count(*) FILTER (WHERE status = 'flagged') / count(*), 1) AS flagged_pct
FROM calls WHERE tenant_id = 1
GROUP BY agent_id ORDER BY flagged_pct DESC;
```

**Say it like this:** "FILTER inside the aggregate gives the flagged count, and 100.0 avoids integer division."

---

**Q13. Find duplicate users (same email within a tenant).**

**Short answer:** Group by tenant and lower-cased email, keep groups with count > 1.

**Explanation:** Then fix with a unique index on `(tenant_id, lower(email))`.

**Example:**

```sql
SELECT tenant_id, lower(email) AS email, count(*) FROM users
GROUP BY tenant_id, lower(email) HAVING count(*) > 1;
```

**Say it like this:** "Group by the normalised email to find duplicates, then prevent them with a unique index on the same expression."

---

**Q14. Running total of calls per day this month.**

**Short answer:** Aggregate per day, then a window `sum(...) OVER (ORDER BY day)`.

**Explanation:** Window functions run after GROUP BY.

**Example:**

```sql
SELECT day, calls, sum(calls) OVER (ORDER BY day) AS running_total FROM (
  SELECT date_trunc('day', started_at)::date AS day, count(*) AS calls FROM calls
  WHERE tenant_id = 1 AND started_at >= date_trunc('month', now()) GROUP BY 1) d
ORDER BY day;
```

**Say it like this:** "Daily counts first, then a running sum window over them."

---

**Q15. Each agent's score compared to their team average.**

**Short answer:** Compute each agent's average and the tenant average with a window function over all agents.

**Explanation:** `avg(...) OVER ()` gives the overall average on every row.

**Example:**

```sql
SELECT agent_id, avg_score, round(avg(avg_score) OVER (), 1) AS team_avg,
       round(avg_score - avg(avg_score) OVER (), 1) AS vs_team
FROM (SELECT c.agent_id, avg(s.score) AS avg_score FROM scorecards s JOIN calls c ON c.id = s.call_id
      WHERE c.tenant_id = 1 AND s.status = 'final' GROUP BY c.agent_id) a;
```

**Say it like this:** "An empty OVER clause puts the team average on every row, so the difference is one subtraction."

---

**Q16. Day-over-day change in call volume.**

**Short answer:** Daily counts, then `lag()` to get the previous day's count.

**Explanation:** Handle the first day's NULL.

**Example:**

```sql
SELECT day, calls, calls - lag(calls) OVER (ORDER BY day) AS change FROM (
  SELECT started_at::date AS day, count(*) AS calls FROM calls WHERE tenant_id = 1 GROUP BY 1) d;
```

**Say it like this:** "lag reads the previous row's value, which makes period-over-period changes easy."

---

**Q17. Reviewers who haven't reviewed anything in 14 days.**

**Short answer:** LEFT JOIN recent scorecards to QA users and keep those with none.

**Explanation:** Put the date condition in the JOIN, not WHERE, or the LEFT JOIN becomes an inner join.

**Example:**

```sql
SELECT u.id, u.name FROM users u
LEFT JOIN scorecards s ON s.reviewer_id = u.id AND s.created_at >= now() - interval '14 days'
WHERE u.tenant_id = 1 AND u.role = 'qa' AND u.active AND s.id IS NULL;
```

**Say it like this:** "The date filter lives in the ON clause; putting it in WHERE would silently remove the reviewers I'm looking for."

---

**Q18. Median call duration per agent.**

**Short answer:** `percentile_cont(0.5) WITHIN GROUP (ORDER BY duration_s)` grouped by agent.

**Explanation:** Median is more robust to outliers than average.

**Example:**

```sql
SELECT agent_id, percentile_cont(0.5) WITHIN GROUP (ORDER BY duration_s) AS median_s
FROM calls WHERE tenant_id = 1 GROUP BY agent_id;
```

**Say it like this:** "Median with percentile_cont, because a few very long calls would distort the average."

---

## 🔴 Advanced

**Q19. Claim the next unreviewed call for a reviewer, safely under concurrency.**

**Short answer:** Select one unassigned call `FOR UPDATE SKIP LOCKED` and update it in the same statement.

**Explanation:** Concurrent reviewers each get a different call.

**Example:**

```sql
UPDATE calls SET reviewer_id = $1, claimed_at = now()
WHERE id = (SELECT id FROM calls
            WHERE tenant_id = $2 AND status = 'flagged' AND reviewer_id IS NULL
            ORDER BY started_at LIMIT 1 FOR UPDATE SKIP LOCKED)
RETURNING id;
```

**Say it like this:** "SKIP LOCKED makes this a safe work queue: two reviewers clicking at once get different calls."

---

**Q20. Find sessions: group an agent's calls into "shifts" where gaps are under 30 minutes.**

**Short answer:** Gaps-and-islands: use `lag()` to detect gaps over 30 minutes, a running sum to number shifts, then group.

**Explanation:** Classic pattern for sessions and streaks.

**Example:**

```sql
WITH marked AS (
  SELECT agent_id, started_at,
         CASE WHEN started_at - lag(started_at) OVER w > interval '30 minutes' OR lag(started_at) OVER w IS NULL THEN 1 ELSE 0 END AS new_shift
  FROM calls WHERE tenant_id = 1 WINDOW w AS (PARTITION BY agent_id ORDER BY started_at)),
numbered AS (
  SELECT *, sum(new_shift) OVER (PARTITION BY agent_id ORDER BY started_at) AS shift_no FROM marked)
SELECT agent_id, shift_no, min(started_at) AS shift_start, max(started_at) AS shift_end, count(*) AS calls
FROM numbered GROUP BY agent_id, shift_no ORDER BY agent_id, shift_start;
```

**Say it like this:** "Mark where a new shift starts, turn the marks into shift numbers with a running sum, then group. That's the gaps-and-islands pattern."

---

**Q21. Upsert daily stats from new scorecards.**

**Short answer:** `INSERT ... SELECT ... GROUP BY ... ON CONFLICT DO UPDATE` to add or refresh aggregates.

**Explanation:** Idempotent if you recompute the day fully rather than incrementing.

**Example:**

```sql
INSERT INTO agent_daily_stats (agent_id, day, reviews, avg_score)
SELECT c.agent_id, s.created_at::date, count(*), avg(s.score)
FROM scorecards s JOIN calls c ON c.id = s.call_id
WHERE s.status = 'final' AND s.created_at::date = current_date - 1
GROUP BY 1, 2
ON CONFLICT (agent_id, day) DO UPDATE SET reviews = EXCLUDED.reviews, avg_score = EXCLUDED.avg_score;
```

**Say it like this:** "Recomputing the whole day and upserting makes the job safe to rerun."

---

**Q22. Write a recursive query to get a manager's full reporting tree.**

**Short answer:** A recursive CTE starting from the manager and repeatedly joining direct reports.

**Explanation:** Add a depth column and a cycle guard for safety.

**Example:**

```sql
WITH RECURSIVE tree AS (
  SELECT id, name, manager_id, 0 AS depth FROM users WHERE id = $1
  UNION ALL
  SELECT u.id, u.name, u.manager_id, t.depth + 1 FROM users u JOIN tree t ON u.manager_id = t.id
  WHERE t.depth < 10)
SELECT * FROM tree;
```

**Say it like this:** "A recursive CTE walks the hierarchy level by level, with a depth limit as a guard against bad data."

---

**Q23. Delete old data in batches without locking the table for long.**

**Short answer:** Delete in small batches using a CTE with LIMIT, repeated until no rows remain.

**Explanation:** Better still, partition by time and drop old partitions.

**Example:**

```sql
WITH batch AS (SELECT id FROM ai_scores WHERE created_at < now() - interval '2 years' LIMIT 5000)
DELETE FROM ai_scores WHERE id IN (SELECT id FROM batch);
-- repeat until 0 rows deleted
```

**Say it like this:** "Small batches keep locks and WAL spikes small. For time-series data, partition drops are even better."

---

**Q24. Detect scorecards where the reviewer reviewed their own calls.**

**Short answer:** Join scorecards to calls and compare `reviewer_id` with `agent_id`.

**Explanation:** Then prevent it with an application rule or a check via trigger.

**Example:**

```sql
SELECT s.id, s.call_id, s.reviewer_id FROM scorecards s
JOIN calls c ON c.id = s.call_id WHERE s.reviewer_id = c.agent_id;
```

**Say it like this:** "A join comparing reviewer and agent finds conflicts of interest; then I'd block it in the service layer."

---

**Q25. How would you speed up the "top 3 per agent" query on millions of rows?**

**Short answer:** Index on `(agent_id, score DESC)` for the window partition and order, limit to a date range, or use a `LATERAL` join with `LIMIT 3` per agent.

**Explanation:** LATERAL lets the database use the index for each agent's top 3.

**Example:**

```sql
SELECT a.id AS agent_id, t.* FROM users a
CROSS JOIN LATERAL (
  SELECT s.call_id, s.score FROM scorecards s JOIN calls c ON c.id = s.call_id
  WHERE c.agent_id = a.id AND s.status = 'final' ORDER BY s.score DESC LIMIT 3) t
WHERE a.tenant_id = 1 AND a.role = 'agent';
```

**Say it like this:** "LATERAL with LIMIT 3 per agent lets each lookup use an index instead of ranking every row."

---

## ✅ SQL Round Checklist (Say These Out Loud)

- Every query is scoped by tenant.
- LEFT JOIN conditions for optional data go in `ON`, not `WHERE`.
- `NOT EXISTS` instead of `NOT IN` when NULLs are possible.
- Integer division avoided (`100.0 *`).
- Time zones and date boundaries are explicit.
- I'd mention the index that makes it fast.
