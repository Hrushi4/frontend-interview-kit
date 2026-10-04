# 01 — Backend Resume Deep-Dive: What They'll Ask You

Your updated resume presents you as a **full-stack** engineer: "React, Next.js, Node.js and NestJS", with backend work across FastAPI, Celery, LiveKit infrastructure on AWS, Express and GraphQL. Backend interviewers will test whether that backend depth is real. This file prepares the backend side of every resume line.

**How this file is organised**

- **Part A — Understand the topic:** how backend interviewers probe a frontend-leaning full-stack resume, and how to prepare each bullet.
- **Part B — Questions with sample answers:** Positioning → Security audit (backend) → AI pipeline → LiveKit infrastructure → BpoBox backend → Earlier roles and projects → Skills probes.

Each answer has a **Short answer**, an **Explanation**, an **Example**, and a **Say it like this** sample answer. Anything in **[square brackets]** must be replaced with your real detail, or removed. **Never claim backend ownership you can't defend in detail.**

---

## Part A — Understand the Topic

### How backend interviewers read your resume

Your strongest evidence is frontend architecture. A backend interviewer will look for the backend parts and push on them:

- **"Led full-stack reliability and security across React and FastAPI"** → permission design, token handling, PHI storage, tests.
- **"Designed self-hosted LiveKit AWS infrastructure"** → networking, scaling, deployment, cost model.
- **"AI sentiment/compliance scoring over 40,000+ Twilio calls/month via Celery"** → queues, retries, idempotency, throughput.
- **"SSE compliance chat"** → streaming, tenant-filtered retrieval.
- **Express, NestJS, GraphQL, PostgreSQL, MongoDB, Redis** in skills → 2–3 deep questions each.

### Prepare every backend bullet with five answers

1. **What exactly did *you* build?** (versus the team)
2. **How does it work?** Draw the data flow.
3. **What was hard,** and what trade-offs did you make?
4. **How was the number measured?**
5. **What would you change now?**

### Positioning yourself honestly

A strong full-stack story: "frontend architecture is my core, and I own backend work where reliability, security and real-time demanded it." That's credible and matches your resume. Overclaiming backend depth gets exposed in the first follow-up.

---

## Part B — Questions with Sample Answers

## 🟢 Positioning

**Q1. "Your resume says full-stack. How would you describe your backend experience?"**

**Short answer:** Frontend architecture is my core; on the backend I've owned the FastAPI security layer, the Celery AI scoring pipeline, the self-hosted LiveKit design on AWS, and Node/NestJS/Express services earlier in my career.

**Explanation:** Be specific and proportionate. Interviewers trust candidates who are precise about scope.

**Example:** "In the security audit I implemented the permission dependencies and tenant scoping in FastAPI; the Celery workers I [built / co-built with X]."

**Say it like this:** "I'm full-stack with a frontend-architecture core. On the backend I've owned security and permissions in FastAPI, the AI scoring pipeline on Celery, and the AWS design for self-hosted LiveKit. Earlier, I built Node, NestJS and Express APIs with MongoDB and GraphQL."

---

**Q2. "Walk me through a backend system you built end to end."**

**Short answer:** The AI call-scoring pipeline: Twilio webhook → validate and enqueue → Celery workers transcribe, chunk and score with LangChain and OpenAI → validate structured output → save → notify the UI over SSE.

**Explanation:** Draw it, then cover reliability (retries, idempotency, dead letters), scale (40,000+ calls a month, 5x throughput) and quality (validation, human review).

**Example:**

```text
Twilio → /webhooks/recording (verify, store event id) → Celery: transcribe → chunk → score (parallel)
      → validate (Pydantic + evidence) → Postgres → SSE event → reviewer dashboard
```

**Say it like this:** "When a recording is ready, Twilio calls our webhook; we verify it, store the event and enqueue. Celery workers transcribe, split into chunks, and score each chunk with a rubric prompt, returning structured JSON that we validate before saving. Reviewers get a live update. Every stage is idempotent and retried with backoff, and failures fall back to human review."

---

**Q3. "Why are you interested in backend-heavy roles now?"**

**Short answer:** My most interesting recent problems were backend problems: security, real-time infrastructure and AI pipelines, and I want to go deeper on systems while keeping the frontend strength.

**Explanation:** Frame it as growth, not escape from frontend.

**Example:** The LiveKit infrastructure design pulled me into networking, scaling and cost modelling.

**Say it like this:** "The problems that taught me most recently were on the backend: securing a healthcare API, scaling an AI pipeline, and designing video infrastructure. I want a role where I can go deeper on systems while still owning the user-facing side."

---

## 🔐 Security Audit (Backend Side)

**Q4. "What did the audit find on the backend, and how did you fix it?"**

**Short answer:** Issues like permissions enforced only in the UI, missing tenant scoping (IDOR), weak token handling, and PHI in logs; fixed with permission dependencies on every route, tenant-scoped queries, short-lived rotated tokens and log scrubbing, each with regression tests. [Use your real findings.]

**Explanation:** Explain impact in patient-data terms, and how you prevented regressions (test matrix, CI check).

**Example:**

```python
@router.get("/sessions/{sid}")
async def get_session(sid: UUID, user = Depends(require("sessions:read")), db = Depends(get_db)):
    s = await db.scalar(select(Session).where(Session.id == sid, Session.tenant_id == user.tenant_id))
    if not s: raise HTTPException(404)
    return SessionOut.model_validate(s)
```

**Say it like this:** "The worst issues were authorisation: endpoints that trusted the UI to hide buttons, and queries that didn't check the tenant. We made every route declare its permission, scoped every query by tenant, and added a role-by-endpoint test matrix, so the re-audit showed 85% fewer findings."

---

**Q5. "How were tokens handled before and after?"**

**Short answer:** Before: [long-lived tokens stored in the browser]. After: short-lived access tokens, rotating refresh tokens in HttpOnly cookies, pinned algorithms and audience checks, revocation on logout.

**Explanation:** Explain why each change reduces risk.

**Example:** Refresh token reuse detection revokes the whole session family.

**Say it like this:** "We shortened token lifetimes, moved refresh tokens into HttpOnly cookies with rotation, and pinned the algorithm and audience on verification, so a stolen token is short-lived and can't be replayed elsewhere."

---

**Q6. "How did you handle PHI storage?"**

**Short answer:** Encryption at rest and in transit, access by role with audit logging, minimal collection, and PHI removed from logs, error tracking and analytics. [Describe what was really in place.]

**Explanation:** If something wasn't in place, say how you'd add it. Don't invent controls.

**Example:** Sentry `before_send` scrubbing plus a test asserting that known PHI fields never appear in captured events.

**Say it like this:** "PHI stayed encrypted, access was role-based and audited, and we made sure it never leaked into logs or third-party tools, with tests to keep it that way."

---

## 🤖 AI Pipeline (Celery)

**Q7. "Why Celery, and how is it configured?"**

**Short answer:** The pipeline is Python (LangChain, OpenAI), so Celery fits naturally; configured with late acks, retries with backoff, time limits, prefetch 1, and separate queues per stage. [Adjust to your real settings.]

**Explanation:** Mention the broker (Redis), monitoring, and idempotency.

**Example:** `task_acks_late=True`, `autoretry_for=(RateLimitError, Timeout)`, `retry_backoff=True`.

**Say it like this:** "Celery suits a Python AI pipeline. Late acks with idempotent tasks mean a crashed worker causes a retry, not a lost call."

---

**Q8. "How did you reach 5x throughput?"**

**Short answer:** The work was I/O-bound, so we parallelised chunk scoring and raised worker concurrency within the provider's rate limits. [Use your real changes and numbers.]

**Explanation:** Give the measurement method: calls processed per hour on the same workload, before and after.

**Example:** "Sequential chunks → concurrent chunks with a limit of [N]; worker concurrency [X → Y]."

**Say it like this:** "Most time was spent waiting on APIs, not computing. Overlapping that waiting with concurrent chunk scoring multiplied throughput about 5x on the same workload."

---

**Q9. "What happens when OpenAI returns invalid output or rate-limits you?"**

**Short answer:** Rate limits retry with backoff and jitter, respecting `Retry-After`; invalid output fails Pydantic validation, retries once with the error, then goes to human review; persistent failures go to a dead-letter queue with an alert.

**Explanation:** The UI shows "pending" instead of failing.

**Example:** `ChunkScore.model_validate_json(output)` raises → retry with the validation error in the prompt.

**Say it like this:** "Every failure type has a path: retry for transient errors, human review for bad output, and a dead-letter queue with an alert for anything persistent."

---

**Q10. "How does data get from the pipeline to the reviewer's screen?"**

**Short answer:** Results are saved in PostgreSQL; the worker publishes an event; the API pushes it to connected dashboards over SSE; the dashboard refetches the scorecard.

**Explanation:** Tenant-scoped channels prevent cross-tenant events.

**Example:** Redis pub/sub channel `tenant:{id}:scores` → API SSE stream per open dashboard.

**Say it like this:** "The worker saves, then publishes a tenant-scoped event, and the API streams it to that tenant's open dashboards, so reviewers see new scores without refreshing."

---

## ☁️ LiveKit Infrastructure (AWS)

**Q11. "Walk me through the self-hosted LiveKit architecture."**

**Short answer:** Dockerised LiveKit SFU nodes on EC2 with host networking and a UDP port range, Redis for room routing, an ALB for WSS signalling, TURN/TLS on 443, autoscaling on CPU and participants, Prometheus and Grafana, and CI/CD with draining deploys.

**Explanation:** Say clearly what was designed versus implemented.

**Example:** See 12 — Real-Time Backends, Q16.

**Say it like this:** "Media nodes scale horizontally with Redis routing, hospitals connect through TURN on 443, deploys drain rooms instead of dropping calls, and it's all observable in Grafana."

---

**Q12. "How did you estimate the 40% cost reduction and 10x capacity?"**

**Short answer:** A cost model comparing managed per-minute pricing with EC2, bandwidth and operations time, based on stated usage and utilisation assumptions; capacity from horizontal scaling to be validated by load tests. Both are projections.

**Explanation:** State the assumptions and how you'd validate them.

**Example:** "At [N] participant-minutes a month, managed cost [X] vs self-hosted [Y] including [Z] hours of ops time."

**Say it like this:** "They're projections from a cost model with explicit assumptions, and I always present them that way. The next step was load testing to confirm the capacity per node."

---

**Q13. "Was it built, or only designed?"**

**Short answer:** Answer exactly: "[Designed and prototyped / deployed to staging / running for X% of traffic]."

**Explanation:** Precision here protects your credibility for the rest of the interview.

**Example:** "Designed and validated in staging; production rollout planned in phases."

**Say it like this:** "It was [designed and running in staging], with a phased production rollout planned. I owned the design and [the Docker and CI setup]."

---

## 📊 BpoBox Backend

**Q14. "How is multi-tenancy enforced on BpoBox's backend?"**

**Short answer:** The tenant comes from the verified token, every query filters by tenant, caches include the tenant in the key, and [row-level security adds a database-level guard]. [Describe what was real.]

**Explanation:** Mention the test that proves cross-tenant access returns 404.

**Example:** `WHERE tenant_id = :tenant_id` added by the repository layer, never taken from the request body.

**Say it like this:** "The tenant never comes from user input. It comes from the token and is applied to every query and cache key, and a test proves another tenant's data returns 404."

---

**Q15. "How did role-based portals work on the backend?"**

**Short answer:** Roles map to permissions; every endpoint checks permissions server-side; data is scoped by role (agents see only their own calls).

**Explanation:** The frontend mirrors the same permission list for navigation only.

**Example:** `agent → calls:read:own`; the query adds `agent_id = :user_id` for that permission.

**Say it like this:** "The server decides what each role can do and see; the frontend uses the same permission list only to show the right navigation."

---

## 🕰️ Earlier Roles and Projects

**Q16. "What backend work did you do at Slaylink?"**

**Short answer:** Built features end to end with Next.js, NestJS, GraphQL and MongoDB: [creator profiles, brand campaigns], plus coordinating interns' tasks.

**Explanation:** Be ready to explain a resolver, a module and the data model.

**Example:** `CampaignsModule` with resolver, service and Mongoose model, protected by a JWT guard.

**Say it like this:** "At Slaylink I built [campaign and profile features] across the stack: NestJS GraphQL resolvers on MongoDB, with the Next.js frontend consuming them."

---

**Q17. "Explain the Blood Bank backend."**

**Short answer:** An Express and Mongoose API with JWT auth and role middleware for donors, hospitals and organisations, each with scoped data, and atomic inventory updates.

**Explanation:** Mention what you'd improve: validation, tests, TypeScript, PostgreSQL for inventory and reports.

**Example:** `PATCH /inventory` uses `$inc` with a condition so units can't go negative.

**Say it like this:** "Three roles with their own routes and data scope, and inventory changes were atomic so stock couldn't go negative. Today I'd add schema validation, tests and probably PostgreSQL for the reporting side."

---

**Q18. "Explain the Quiz App backend."**

**Short answer:** Express and MongoDB API with teacher and student roles: teachers create exams and see reports; students take quizzes; results aggregated with MongoDB pipelines.

**Explanation:** Discuss preventing cheating (answers never sent to the client, server-side scoring, time limits).

**Example:** The quiz endpoint returns questions without the `answer` field; scoring happens on submit.

**Say it like this:** "The key backend detail was that answers never left the server: questions were sent without them, and scoring happened on submit."

---

## 🧱 Skills Section Probes

**Q19. "Node.js: what blocks the event loop?"**

**Short answer:** Synchronous CPU-heavy work: big JSON parsing, sync crypto, `fs.*Sync`, catastrophic regexes, long loops. (See 02 — Node.js.)

**Explanation:** Detect with event loop lag metrics and profiling.

**Example:** `bcrypt.hashSync` in a login route blocking all requests.

**Say it like this:** "Anything synchronous and heavy on the main thread blocks every request. I measure event loop lag to catch it."

---

**Q20. "PostgreSQL: how do you speed up a slow query?"**

**Short answer:** `EXPLAIN ANALYZE`, add or fix indexes to match filters and sort, reduce data scanned, and pre-aggregate for dashboards. (See 07 — PostgreSQL.)

**Explanation:** Composite index column order matters.

**Example:** Index `(tenant_id, status, started_at DESC)` for the review queue.

**Say it like this:** "Read the plan, match an index to the filter and sort, and pre-aggregate if it's a dashboard over millions of rows."

---

**Q21. "Redis: what did you use it for?"**

**Short answer:** Celery broker, LiveKit room routing, and caching. [Your real uses.] (See 09 — Redis.)

**Explanation:** Different roles need different settings (no eviction for brokers).

**Example:** Separate Redis instances for cache (`allkeys-lru`) and broker (`noeviction`, AOF).

**Say it like this:** "Broker, routing and cache, each with settings that match: a broker must never evict, a cache can."

---

**Q22. "Docker and AWS: what have you actually run?"**

**Short answer:** Name real services: [EC2 for LiveKit, ECS or Docker Compose for APIs, S3 for recordings, RDS, ElastiCache, CloudFront], with Docker images built in GitHub Actions.

**Explanation:** Be honest about which you configured versus used.

**Example:** "I wrote the Dockerfiles and the GitHub Actions pipeline; DevOps owned the VPC setup."

**Say it like this:** "I've built the Docker images and CI pipelines myself and designed the AWS layout for LiveKit; networking was shared with our DevOps engineer."

---

**Q23. "Grafana and Prometheus: which dashboards and alerts did you create?"**

**Short answer:** Name real ones: LiveKit node CPU, bandwidth, participants, packet loss; pipeline queue age and failure rate. (See 15 — Observability.)

**Explanation:** Mention what each alert means and what action follows.

**Example:** Queue age above 10 minutes → page and scale workers.

**Say it like this:** "Dashboards answered 'are calls healthy?' and 'is scoring keeping up?', and each alert had a clear action."

---

**Rule:** If you can't answer 2–3 questions on a backend skill, move it to "familiar with" on your resume.
