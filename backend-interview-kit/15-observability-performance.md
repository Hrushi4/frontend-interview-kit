# 15 — Observability and Backend Performance

Sentry, Grafana and Prometheus are on your resume, and your numbers (99% reconnect success, 45 s pipeline latency, 30% fewer production bugs) only mean something if you can explain how they were measured. Expect questions on logs, metrics, traces, SLOs and finding bottlenecks.

**How this file is organised**

- **Part A — Understand the topic:** the three pillars of observability, key metrics, SLOs and how to approach performance problems, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### Monitoring vs observability

**Monitoring** tells you *that* something is wrong (an alert fires). **Observability** lets you find out *why*, by asking new questions of your system's data without shipping new code.

### The three pillars

| Pillar | What it is | Tools |
|---|---|---|
| **Logs** | timestamped events with context | pino, structlog, CloudWatch, Loki, ELK |
| **Metrics** | numbers over time (rates, latencies, counts) | Prometheus, CloudWatch, Grafana |
| **Traces** | the path of one request across services, with timings | OpenTelemetry, Jaeger, Tempo, Datadog |

Plus **error tracking** (Sentry): grouped exceptions with stack traces and release info.

### What to measure: RED and USE

- **RED** for services: **R**ate (requests per second), **E**rrors (failure rate), **D**uration (latency percentiles).
- **USE** for resources: **U**tilisation, **S**aturation (queueing), **E**rrors.

Always use **percentiles** (p50, p95, p99), not averages. An average hides the slow requests users complain about.

### SLIs, SLOs and error budgets

- **SLI:** a measurement, e.g. "% of API requests under 300 ms".
- **SLO:** a target, e.g. "99.9% of requests succeed over 30 days".
- **Error budget:** the allowed failure (0.1%). If it's spent, slow down releases and fix reliability.

### Performance work, in order

1. **Measure** under realistic load.
2. **Find** the bottleneck (profiles, traces, database plans).
3. **Fix** the biggest one.
4. **Measure again.** Repeat.

### Why interviewers ask about it

Seniors own production. Interviewers want to hear how you know a system is healthy, how you'd debug an incident, and how you prove a performance improvement.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. Logs vs metrics vs traces?**

**Short answer:** Logs are detailed events, metrics are cheap numbers over time for dashboards and alerts, and traces show one request's path and timings across services.

**Explanation:** Metrics tell you something's wrong; traces tell you where; logs tell you exactly what happened.

**Example:** A latency alert (metric) → the trace shows the transcription span is slow → logs show 429 errors from the provider.

**Say it like this:** "Metrics alert me, traces point me to the slow part, logs explain it. I want all three linked by a request ID."

---

**Q2. What makes a good log line?**

**Short answer:** Structured JSON with a level, message, timestamp, request ID, user or tenant ID and relevant fields, and no secrets or PHI.

**Explanation:** Structured logs are searchable; free-text logs aren't.

**Example:**

```json
{ "level": "info", "msg": "call scored", "requestId": "req_8f2a", "tenantId": "t_1", "callId": "c_42", "durationMs": 41200, "promptVersion": "v13" }
```

**Say it like this:** "Logs are structured events with IDs I can search by, never free text with sensitive data in it."

---

**Q3. Why percentiles instead of averages?**

**Short answer:** Averages hide outliers; p95 and p99 show what the slowest users experience.

**Explanation:** A 100 ms average can hide 5% of requests taking 5 seconds.

**Example:** Dashboard p50 120 ms, p99 2.4 s → the slow 1% were large tenants with unindexed filters.

**Say it like this:** "Users remember the slow requests, so I track p95 and p99, not the average."

---

**Q4. What is Sentry used for on the backend?**

**Short answer:** Capturing exceptions with stack traces, request context, release versions and breadcrumbs, grouped into issues with alerts.

**Explanation:** Upload source maps or include release info; scrub sensitive data in `before_send`.

**Example:** A new release shows a spike in `KeyError: 'transcript'` issues → linked to the deploy that changed the payload shape.

**Say it like this:** "Sentry tells me which release introduced an error and exactly where, and I scrub PHI before anything leaves our servers."

---

**Q5. What is Prometheus, and how does it work?**

**Short answer:** A time-series database that scrapes metrics from your services' `/metrics` endpoints and evaluates alert rules; Grafana visualises it.

**Explanation:** Metric types: counters, gauges, histograms, summaries. Avoid high-cardinality labels like user ID.

**Example:**

```text
http_requests_total{route="/calls/:id",status="200"} 10432
http_request_duration_seconds_bucket{route="/calls/:id",le="0.3"} 9811
```

**Say it like this:** "Services expose metrics, Prometheus scrapes them, Grafana shows them, and alert rules page us. Labels stay low-cardinality so it stays fast."

---

## 🟡 Level 2 — Intermediate

**Q6. What should you alert on?**

**Short answer:** Symptoms users feel (error rate, latency SLO burn, queue age), not every cause; every alert must be actionable.

**Explanation:** Alert fatigue makes people ignore pages. Use dashboards for causes.

**Example:** Page if the 5xx rate is above 2% for 5 minutes or the scoring queue's oldest job is older than 10 minutes; CPU at 80% is a dashboard, not a page.

**Say it like this:** "I page on what users feel and what someone can act on. Everything else goes on a dashboard."

---

**Q7. What is distributed tracing?**

**Short answer:** Following a request across services with a trace ID propagated in headers; each operation is a span with timing and attributes.

**Explanation:** OpenTelemetry is the standard; it auto-instruments HTTP, database and queue clients.

**Example:** One trace: webhook → enqueue → worker → transcription API → LLM → database write, showing the LLM took 80% of the time.

**Say it like this:** "A trace shows exactly where one request spent its time across every service, which turns 'it's slow' into 'this call is slow'."

---

**Q8. What are SLOs and error budgets?**

**Short answer:** An SLO is a reliability target for a user-facing measure; the error budget is the allowed failure, used to balance new features against reliability work.

**Explanation:** When the budget is burned, prioritise reliability.

**Example:** SLO: 99.5% of calls connect within 5 seconds over 28 days.

**Say it like this:** "SLOs turn reliability into a number the whole team agrees on, and the error budget tells us when to stop shipping features and fix things."

---

**Q9. How do you find a backend performance bottleneck?**

**Short answer:** Reproduce or observe under load, use traces to find the slow span, then profile CPU, inspect database query plans, or check downstream latency and pool waits.

**Explanation:** Don't guess; measure each layer.

**Example:** A trace shows 600 ms in one SQL query → `EXPLAIN ANALYZE` shows a sequential scan → add an index → 12 ms.

**Say it like this:** "Trace first to find where time goes, then use the right tool for that layer: a profiler for CPU, EXPLAIN for SQL."

---

**Q10. How do you load test?**

**Short answer:** Script realistic user flows with k6, Locust, Artillery or JMeter, ramp up load, and watch latency percentiles, errors and resource saturation to find the breaking point.

**Explanation:** Test against production-like data and infrastructure; include warm-up.

**Example:**

```js
// k6
export const options = { stages: [{ duration: '2m', target: 200 }, { duration: '5m', target: 200 }] };
export default function () { http.get(`${BASE}/api/calls?status=flagged`, { headers }); sleep(1); }
```

**Say it like this:** "I load test real flows, ramp until something breaks, and note what broke first. That's the capacity number I trust."

---

**Q11. What are common causes of slow APIs?**

**Short answer:** Missing indexes, N+1 queries, too much data returned, chatty calls to other services, no caching, connection pool exhaustion, and blocking work on the request path.

**Explanation:** The database is the usual suspect.

**Example:** An endpoint returned full transcripts for 100 calls in a list; returning summaries cut response size by 95%.

**Say it like this:** "Nine times out of ten it's the database or doing too much work per request, so that's where I look first."

---

## 🔴 Level 3 — Advanced

**Q12. How do you avoid high-cardinality problems in metrics?**

**Short answer:** Keep labels bounded (route templates, status classes, tenant only if few), and put unbounded values like user ID or call ID in logs or traces.

**Explanation:** Each label combination is a separate time series; millions of them crash Prometheus.

**Example:** Label `route="/calls/:id"`, not `path="/calls/42"`.

**Say it like this:** "Metrics get bounded labels; anything unique per request belongs in traces and logs."

---

**Q13. How do you measure a claim like "99% reconnect success"?**

**Short answer:** Define numerator, denominator and window precisely, collect events from clients and servers, and compute it in a dashboard.

**Explanation:** Without a clear definition, the number can't be trusted or compared.

**Example:** Numerator: reconnect attempts that reached `Reconnected` within 15 s; denominator: all `Reconnecting` events; window: last 30 days.

**Say it like this:** "Every metric I quote has a definition: what counts, what's the total, and over what period."

---

**Q14. What's the difference between latency and throughput, and how do they interact?**

**Short answer:** Latency is how long one request takes; throughput is how many complete per second. Near saturation, queueing makes latency rise sharply.

**Explanation:** Little's Law: concurrency = throughput × latency.

**Example:** Workers at 100% utilisation: throughput flat, queue age and latency climb.

**Say it like this:** "As utilisation approaches 100%, latency explodes because of queueing, so I scale before we get there."

---

## 🧩 Level 4 — Scenario-Based

**Q15. Users report the app is slow, but dashboards look fine. What do you do?**

**Short answer:** Check percentiles per tenant and endpoint, look at client-side timing, and look for a segment the averages hide (one region, one tenant, one feature).

**Explanation:** Aggregates hide localised problems.

**Example:** p99 for one large tenant was 8 s because of a missing composite index on their biggest filter.

**Say it like this:** "When dashboards disagree with users, the averages are hiding a segment. I break the data down until the slow group shows up."

---

**Q16. You're paged at 2 a.m. for high error rates. Walk through your response.**

**Short answer:** Acknowledge, check recent deploys and dependencies, mitigate (roll back, disable a feature flag, scale up), communicate status, then investigate the root cause and write a blameless postmortem.

**Explanation:** Mitigation comes before root cause.

**Example:** Errors started with a deploy 10 minutes earlier → roll back → errors stop → investigate in the morning.

**Say it like this:** "Stop the bleeding first, usually a rollback or flag. Then communicate, then find the real cause, then make sure it can't happen again."

---

## 🟢 More Basics

**Q17. What are log levels, and how do you use them?**

**Short answer:** `debug` for development detail, `info` for normal business events, `warn` for unexpected but handled situations, `error` for failures needing attention, `fatal` for crashes.

**Explanation:** Production usually runs at `info`; too much logging costs money and hides signal.

**Example:** `warn` for a retried LLM call; `error` when it finally fails to human review.

**Say it like this:** "Levels are a contract: errors mean someone should look, info tells the story, debug stays off in production."

---

**Q18. What is a correlation ID?**

**Short answer:** An ID attached to a request and propagated to every log, downstream call and queued job, so you can follow one action end to end.

**Explanation:** Often the trace ID from OpenTelemetry.

**Example:** `x-request-id` copied into job metadata so worker logs link back to the webhook request.

**Say it like this:** "One ID links the request, its jobs and its logs, which turns debugging into a search."

---

**Q19. What are counters, gauges and histograms?**

**Short answer:** Counters only go up (requests total), gauges go up and down (queue depth), histograms record distributions (latency buckets) for percentiles.

**Explanation:** Compute rates from counters with `rate()` in PromQL.

**Example:** `rate(http_requests_total{status=~"5.."}[5m])` for error rate.

**Say it like this:** "Counters for things that happen, gauges for current levels, histograms for latency."

---

**Q20. What is a dashboard for, and what makes a good one?**

**Short answer:** Answering one question at a glance, like "is the API healthy?"; good dashboards show RED metrics, recent deploys and links to logs and traces.

**Explanation:** Avoid walls of unrelated graphs.

**Example:** API dashboard: request rate, error rate, p95/p99 latency per route, deploy markers.

**Say it like this:** "A good dashboard answers one question fast and points to the next place to look."

---

**Q21. What is uptime monitoring?**

**Short answer:** External checks that call your endpoints from outside (synthetic monitoring) and alert if they fail or are slow.

**Explanation:** Catches DNS, certificate and edge failures internal metrics miss.

**Example:** A synthetic check logs in and loads the dashboard every 5 minutes.

**Say it like this:** "Synthetic checks see what users see from outside, including DNS and certificate problems."

---

**Q22. What is the difference between monitoring infrastructure and monitoring the application?**

**Short answer:** Infrastructure monitoring covers CPU, memory, disk and network; application monitoring covers requests, errors, latency and business metrics.

**Explanation:** Users feel application symptoms; infrastructure explains causes.

**Example:** CPU at 90% (infra) explains p99 latency doubling (app).

**Say it like this:** "Application metrics tell me users are hurting; infrastructure metrics often tell me why."

---

## 🟡 More Intermediate

**Q23. What are business metrics, and why monitor them?**

**Short answer:** Metrics of real outcomes (calls scored per hour, sessions started, payments) that catch problems technical metrics miss.

**Explanation:** A silent failure can leave every technical metric green.

**Example:** "Calls scored per hour" dropping to zero while error rate is 0% revealed a stuck webhook.

**Say it like this:** "If business metrics drop while technical ones look fine, something is silently broken."

---

**Q24. How do you instrument a service with OpenTelemetry?**

**Short answer:** Add the SDK with auto-instrumentation for HTTP, database and queue libraries, add custom spans for key steps, and export to a collector.

**Explanation:** Propagate context across queues by putting trace context in message headers.

**Example:** Custom span `llm.score_chunk` with attributes `prompt_version` and `tokens`.

**Say it like this:** "Auto-instrumentation covers the plumbing; I add spans for the business steps that matter."

---

**Q25. How do you do capacity planning?**

**Short answer:** Measure current usage per unit of load, project growth, load test to find limits, and plan headroom (often 30–50%).

**Explanation:** Revisit after big launches.

**Example:** Each API instance handles 400 req/s at p95 < 200 ms; peak projected at 2,000 req/s → 6 instances plus headroom.

**Say it like this:** "I know what one instance can handle from load tests, then plan for expected peak plus headroom."

---

**Q26. How do you profile a Python service?**

**Short answer:** `py-spy` for sampling profiles in production without code changes, `cProfile` locally, and memory tools like `tracemalloc` or `memray`.

**Explanation:** Flame graphs show where CPU goes.

**Example:** `py-spy record -o profile.svg --pid 1234`.

**Say it like this:** "py-spy gives a flame graph from a live process safely, which is my first step for Python CPU issues."

---

**Q27. How do you reduce database load in a slow system?**

**Short answer:** Fix slow queries and indexes, cache hot reads, use read replicas, batch writes, and move reports off the primary.

**Explanation:** Measure which queries cost the most total time first.

**Example:** Caching tenant config removed 30% of all queries.

**Say it like this:** "Find the queries that cost the most in total, then fix, cache or move them."

---

**Q28. What is tail latency, and why does it matter more in microservices?**

**Short answer:** The slowest percent of requests (p99); when a request fans out to many services, one slow dependency makes the whole request slow.

**Explanation:** With 10 parallel calls each with 1% slow, about 10% of requests are slow.

**Example:** Hedged requests or timeouts with fallbacks reduce tail impact.

**Say it like this:** "Fan-out multiplies tail latency, so I watch p99 of every dependency and set tight timeouts."

---

**Q29. How do you track errors across releases?**

**Short answer:** Tag errors and metrics with the release version, mark deploys on dashboards, and compare error rates before and after.

**Explanation:** Sentry's release health shows crash-free sessions per release.

**Example:** Release `api@1.42.0` introduced 3 new issues within an hour.

**Say it like this:** "Every error is tagged with the release, so a bad deploy is obvious within minutes."

---

**Q30. What is log sampling, and when do you use it?**

**Short answer:** Keeping only a fraction of high-volume, low-value logs (or traces) to control cost, while keeping all errors.

**Explanation:** Tail-based sampling keeps slow or failed traces automatically.

**Example:** 1% of successful health-check logs, 100% of errors.

**Say it like this:** "Sample the boring, keep everything that went wrong."

---

## 🔴 More Advanced

**Q31. How do you run a blameless postmortem?**

**Short answer:** Timeline, impact, root causes (often several), what went well, what went badly, and action items with owners, focusing on systems, not individuals.

**Explanation:** Track action items to completion.

**Example:** Root cause: no alert on queue age. Action: add alert and runbook, owner and due date.

**Say it like this:** "Postmortems fix systems, not blame people, and they only matter if the action items get done."

---

**Q32. What is chaos engineering?**

**Short answer:** Deliberately injecting failures (killing instances, adding latency, failing dependencies) to verify the system degrades gracefully.

**Explanation:** Start small in staging, with clear hypotheses.

**Example:** Block the LLM provider in staging and verify jobs queue and the UI shows "pending".

**Say it like this:** "We break things on purpose in controlled ways, so real failures hold no surprises."

---

**Q33. How do you optimise cost and performance together?**

**Short answer:** Measure cost per unit of work (per request, per call scored), right-size resources, cache, batch, and remove waste.

**Explanation:** Performance improvements often reduce cost too.

**Example:** Cost per scored call dropped when we cut prompt tokens and parallelised I/O.

**Say it like this:** "Cost per unit of work is the metric that ties performance and spend together."

---

**Q34. How do you detect and handle memory leaks in production?**

**Short answer:** Watch memory over time per instance; if it only grows, capture heap snapshots (or `memray`), compare, and fix the retaining code; meanwhile, restart before OOM.

**Explanation:** Correlate with deploys to find the change.

**Example:** Heap grew after a release that added per-request listeners.

**Say it like this:** "A sawtooth is normal GC; a steady climb is a leak. Snapshots show what's being retained."

---

## 🧩 More Scenarios

**Q35. Latency doubled right after a deploy, but there are no errors. What do you do?**

**Short answer:** Compare traces before and after, check for new queries, N+1s, missing indexes or extra outbound calls, and roll back if the impact is significant.

**Explanation:** Deploy markers on dashboards make the correlation obvious.

**Example:** A new feature added a permission check that queried the database per item in a list.

**Say it like this:** "Correlate with the deploy, diff the traces, and roll back if users are hurting while I find the cause."

---

**Q36. An alert fires every night at 2 a.m. and resolves itself. What do you do?**

**Short answer:** Investigate the pattern (a batch job, backup, cron), fix the cause or adjust the alert, because noisy alerts train people to ignore pages.

**Explanation:** Every alert should be actionable.

**Example:** Nightly aggregation saturated the database; moved it to a replica.

**Say it like this:** "A recurring self-resolving alert is a real problem or a bad alert, and both need fixing."

---

**Q37. Logs are too expensive. How do you cut costs without losing visibility?**

**Short answer:** Drop or sample noisy logs, lower retention for debug data, move old logs to cheap storage, and use metrics instead of logs for counts.

**Explanation:** Measure which sources produce the most volume.

**Example:** Health-check and successful request logs were 60% of volume.

**Say it like this:** "Count with metrics, investigate with logs, and keep only the logs that answer real questions."

---

## 🎯 From Your Resume

**Q38. "Which Grafana dashboards and alerts did you set up?"**

**Short answer:** Name real ones: for LiveKit, CPU, bandwidth and participants per node, packet loss and room counts; for the pipeline, queue age, job failure rate and per-stage latency. [Use your real ones.]

**Explanation:** Explain what each alert triggers and what someone does when it fires.

**Example:** "Alert: LiveKit node CPU above 80% for 5 minutes → scale out; queue age above 10 minutes → page."

**Say it like this:** "Each dashboard answered one question, like 'are calls healthy?' or 'is scoring keeping up?', and every alert had a runbook step attached."

---

**Q39. "How did you measure the 45-second average latency of the scoring pipeline?"**

**Short answer:** From the recording-ready webhook timestamp to the score saved timestamp, averaged over [period], broken down per stage. [Use your real method.]

**Explanation:** Also report p95, which is more honest than the average.

**Example:** Stage timestamps stored on each job row, aggregated in a dashboard.

**Say it like this:** "We timestamped each stage of every job, so the 45 seconds breaks down into queue wait, transcription, scoring and saving, and we could see which stage to improve."
