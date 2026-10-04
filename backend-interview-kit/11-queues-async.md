# 11 — Queues, Background Jobs and Event-Driven Systems

Your AI scoring pipeline processes 40,000+ Twilio calls a month through Celery, with 5x throughput and 45-second average latency. That makes queues one of your strongest backend topics, so expect deep questions on retries, idempotency and scaling workers.

**How this file is organised**

- **Part A — Understand the topic:** why queues exist, producers and consumers, delivery guarantees, retries and event-driven design, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### Why use a queue?

Some work is too slow or unreliable to do inside an HTTP request: transcribing a call, calling an LLM, sending emails, generating reports. A **queue** lets the API record "this needs doing" and respond immediately, while **workers** do the work in the background.

```text
Twilio webhook → API (validate, save, enqueue) → 200 OK in < 100 ms
                                ↓
                       Queue (Redis / RabbitMQ / SQS)
                                ↓
             Workers (Celery / BullMQ) → transcribe → score → save → notify UI
```

### Benefits

- **Fast responses:** the user (or webhook sender) doesn't wait.
- **Smoothing spikes:** a burst of 5,000 calls queues up instead of crashing the API.
- **Retries:** failed jobs retry automatically with backoff.
- **Independent scaling:** add workers without touching the API.

### Delivery guarantees

| Guarantee | Meaning | Reality |
|---|---|---|
| At most once | may be lost, never duplicated | rarely acceptable |
| At least once | never lost, may be duplicated | the common default |
| Exactly once | neither | only achievable *effectively*, via idempotent processing |

Because duplicates happen, **consumers must be idempotent**: processing the same job twice must have the same result as once.

### Queues vs event streams

- **Queue** (RabbitMQ, SQS, Celery, BullMQ): each job is handled by one worker, then removed.
- **Event stream** (Kafka, Redis Streams, Kinesis): an ordered log; many consumer groups read independently and can replay.

### Why interviewers ask about it

Async systems fail in subtle ways: duplicates, poison messages, lost jobs, and backlogs nobody notices. Interviewers want to see that you design for those failures, not just the happy path.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. When should work go into a background job?**

**Short answer:** When it's slow, unreliable, CPU-heavy, or doesn't need to finish before responding: third-party calls, AI processing, emails, reports.

**Explanation:** Keep request handlers fast and predictable; move variable-latency work to workers.

**Example:** Scoring a call takes ~45 seconds; the webhook returns in milliseconds and a worker does the scoring.

**Say it like this:** "If the user doesn't need the result in this response, or it depends on a slow external service, it goes to a queue."

---

**Q2. What are producers, consumers, brokers and workers?**

**Short answer:** Producers enqueue jobs, the broker stores them, consumers (workers) take and process them.

**Explanation:** With Celery, the broker is often Redis or RabbitMQ, and a result backend can store outcomes.

**Example:** FastAPI is the producer, Redis is the broker, Celery workers are the consumers.

**Say it like this:** "The API produces, the broker holds, workers consume. Each part scales on its own."

---

**Q3. What is idempotency, and why do consumers need it?**

**Short answer:** Processing the same message twice has the same effect as once. Consumers need it because at-least-once delivery means duplicates will happen.

**Explanation:** Use natural keys, upserts, unique constraints or a "processed messages" table.

**Example:** `INSERT INTO ai_scores (call_id, prompt_version, ...) ON CONFLICT (call_id, prompt_version) DO NOTHING`.

**Say it like this:** "I assume every job can run twice, so the result is keyed by call and prompt version. A duplicate run just does nothing."

---

**Q4. How do retries with exponential backoff work?**

**Short answer:** Failed jobs are retried after increasing delays (1 s, 2 s, 4 s, 8 s…) with random jitter, up to a maximum number of attempts.

**Explanation:** Retry only transient errors (timeouts, 429, 503); fail fast on permanent ones (invalid input).

**Example:**

```python
@app.task(bind=True, autoretry_for=(TimeoutError, RateLimitError), retry_backoff=True,
          retry_jitter=True, max_retries=5)
def score_call(self, call_id): ...
```

**Say it like this:** "Transient errors retry with exponential backoff and jitter; permanent errors fail immediately, so we don't hammer a service that's already struggling."

---

**Q5. What is a dead-letter queue?**

**Short answer:** Where messages go after they've failed too many times, so they don't block the queue and someone can inspect and replay them.

**Explanation:** Alert on DLQ growth; a "poison message" should never retry forever.

**Example:** A call with a corrupted recording fails 5 times and moves to the DLQ, with an alert to the on-call channel.

**Say it like this:** "Jobs that keep failing go to a dead-letter queue with an alert, so one bad message can't jam the pipeline."

---

## 🟡 Level 2 — Intermediate

**Q6. How do you scale workers?**

**Short answer:** Add worker processes or containers and tune concurrency for the workload: high concurrency for I/O-bound jobs, about one per core for CPU-bound jobs.

**Explanation:** Autoscale on queue depth or age of the oldest message, not CPU.

**Example:** Scoring is I/O-bound (waiting on transcription and LLM APIs), so each worker runs many concurrent tasks (gevent or async), and workers scale with queue depth.

**Say it like this:** "I scale on queue age. For I/O-bound jobs like ours, raising concurrency per worker gave more throughput than adding machines."

---

**Q7. How do you avoid losing jobs if a worker crashes mid-task?**

**Short answer:** Acknowledge messages only after the work completes (late acks), with a visibility timeout so unacknowledged jobs are redelivered.

**Explanation:** In Celery, `acks_late=True` plus `task_reject_on_worker_lost=True`; the job must then be idempotent.

**Example:** A worker is killed during a deploy; its in-progress job is redelivered to another worker.

**Say it like this:** "A job is acknowledged only when it's done, so a crash means redelivery, not loss, and idempotency makes the redelivery safe."

---

**Q8. How do you handle rate limits from downstream APIs (like OpenAI)?**

**Short answer:** Limit concurrency per worker pool, use a shared token bucket in Redis, respect `Retry-After`, and back off on 429s.

**Explanation:** Separate queues for different providers let one slow provider not block others.

**Example:** Celery `rate_limit='100/m'` on the scoring task plus a global Redis limiter across all workers.

**Say it like this:** "The queue absorbs bursts, and a shared limiter keeps us under the provider's rate limit, so we slow down instead of failing."

---

**Q9. How does the API tell the user when a background job finishes?**

**Short answer:** Store job status in the database and let the client poll, or push updates over SSE or WebSocket, or send a webhook or notification.

**Explanation:** Push is better UX; polling is simpler and works everywhere.

**Example:** When scoring finishes, the worker publishes to Redis pub/sub; the API pushes an SSE event to that tenant's open dashboards.

**Say it like this:** "The job writes its status to the database and publishes an event, and the UI updates in real time, with polling as a fallback."

---

**Q10. How do you keep job ordering when it matters?**

**Short answer:** Use a single partition or queue per ordering key (Kafka partitions, SQS FIFO message groups), or design so order doesn't matter.

**Explanation:** Global ordering kills parallelism; order per entity is usually enough.

**Example:** Events for the same call go to the same partition (keyed by `call_id`); different calls run in parallel.

**Say it like this:** "I only guarantee order where it matters, per call or per user, by partitioning on that key."

---

**Q11. What is the transactional outbox pattern?**

**Short answer:** Write the business change and an "event to publish" row in the same database transaction; a separate process publishes outbox rows to the queue.

**Explanation:** It avoids the dual-write problem: saving to the database succeeds but publishing fails (or the reverse).

**Example:**

```sql
BEGIN;
INSERT INTO scorecards (...) VALUES (...);
INSERT INTO outbox (topic, payload) VALUES ('scorecard.finalised', '{...}');
COMMIT;
-- relay: SELECT ... FROM outbox WHERE published_at IS NULL → publish → mark published
```

**Say it like this:** "The outbox makes 'save and publish' atomic: if the transaction commits, the event will be published eventually, guaranteed."

---

## 🔴 Level 3 — Advanced

**Q12. Celery vs BullMQ vs SQS vs Kafka?**

**Short answer:** Celery for Python workers, BullMQ for Node with Redis, SQS for a managed, simple AWS queue, Kafka for high-throughput event streams with replay and many consumers.

**Explanation:** Choose by language, operational burden, need for replay, and throughput.

**Example:** Python AI pipeline → Celery; Node notification service → BullMQ; analytics events consumed by several teams → Kafka.

**Say it like this:** "Task queues for jobs, Kafka for event streams. Within task queues I pick what matches the language and how much ops work the team can take on."

---

**Q13. How would you design a pipeline that processes 40,000+ calls a month reliably?**

**Short answer:** Webhook → validate and persist → enqueue; staged workers (transcribe, chunk, score, validate, save) with retries, idempotency, DLQs, rate limiting, and metrics on queue age and failure rate.

**Explanation:** Staging lets each step scale and retry independently; you don't re-transcribe because scoring failed.

**Example:**

```text
recording.ready → transcribe queue → transcript saved → score queue (chunks in parallel) → validate → save → notify
```

**Say it like this:** "Each stage is its own queue with its own retries, so a scoring failure doesn't redo transcription, and every stage is idempotent and monitored."

---

**Q14. What is a saga?**

**Short answer:** A sequence of local transactions across services, where each step has a compensating action if a later step fails.

**Explanation:** Used instead of distributed transactions. Orchestrated (a coordinator) or choreographed (events).

**Example:** Book interpreter → create session → charge; if charging fails, cancel the session and release the interpreter.

**Say it like this:** "Instead of one big distributed transaction, each step can be undone, and the saga runs the undo steps on failure."

---

## 🧩 Level 4 — Scenario-Based

**Q15. The queue backlog keeps growing. What do you do?**

**Short answer:** Check whether producers spiked or consumers slowed (errors, downstream latency, rate limits), then scale workers, raise concurrency, or shed or deprioritise work.

**Explanation:** Alert on age of the oldest message, not just count.

**Example:** The LLM provider slowed down, so jobs took 3x longer; we raised concurrency and moved low-priority re-scores to a separate queue.

**Say it like this:** "A growing backlog means consumers are slower than producers. I find out why before throwing more workers at it, because sometimes the downstream service is the real limit."

---

**Q16. Users got duplicate notifications. Why, and how do you fix it?**

**Short answer:** At-least-once delivery or retries after a timeout re-ran a non-idempotent job; dedupe with a unique key per notification.

**Explanation:** Store `notification_id` with a unique constraint and skip if it exists.

**Example:** `INSERT INTO sent_notifications (event_id) ... ON CONFLICT DO NOTHING RETURNING id` → send only if a row was inserted.

**Say it like this:** "Duplicates are expected in queues, so the side effect itself must be deduplicated, keyed by the event."

---

## 🟢 More Basics

**Q17. What is the difference between a queue and pub/sub?**

**Short answer:** In a queue, each message is processed by one consumer; in pub/sub, each message is delivered to every subscriber.

**Explanation:** Many systems combine them: an SNS topic fans out to several SQS queues.

**Example:** "Call scored" goes to a topic; notifications and analytics each have their own queue.

**Say it like this:** "Queues share work among workers; pub/sub broadcasts events to every interested service."

---

**Q18. What is a message broker?**

**Short answer:** Middleware that receives, stores and delivers messages between producers and consumers: RabbitMQ, Redis, SQS, Kafka.

**Explanation:** Brokers provide buffering, routing, retries and persistence.

**Example:** RabbitMQ routes messages by exchange and routing key to queues.

**Say it like this:** "The broker decouples producers from consumers, so either side can slow down or scale independently."

---

**Q19. What is a cron job, and how is it different from a queue job?**

**Short answer:** A cron job runs on a schedule; a queue job runs when something enqueues it. Often a cron enqueues jobs.

**Explanation:** Schedulers must avoid running twice across instances.

**Example:** Celery Beat at 02:00 enqueues "aggregate yesterday's scores" for each tenant.

**Say it like this:** "Cron decides when, the queue decides who does it and handles retries."

---

**Q20. What is a poison message?**

**Short answer:** A message that always fails (bad data, bug), which would retry forever without a limit.

**Explanation:** Cap retries and move it to a dead-letter queue.

**Example:** A transcript with invalid encoding crashes the parser every time.

**Say it like this:** "Poison messages are why every queue needs a retry limit and a dead-letter queue."

---

**Q21. What is the visibility timeout in SQS?**

**Short answer:** After a consumer receives a message, it's hidden for that period; if not deleted in time, it becomes visible again for another consumer.

**Explanation:** Set it longer than the maximum processing time, or extend it while working.

**Example:** Processing takes up to 3 minutes → visibility timeout 5 minutes.

**Say it like this:** "If the timeout is shorter than the job, the same job runs twice, so I size it to the slowest case."

---

**Q22. What does "eventual consistency" mean in async systems?**

**Short answer:** After a change, other parts of the system catch up shortly, not instantly.

**Explanation:** The UI must handle in-between states ("processing").

**Example:** A scorecard is saved, but the leaderboard updates a few seconds later.

**Say it like this:** "Async systems are eventually consistent, so the UI shows pending states instead of pretending things are instant."

---

## 🟡 More Intermediate

**Q23. How do you prioritise jobs?**

**Short answer:** Separate queues per priority with dedicated or weighted workers, or priority queues where supported.

**Explanation:** Prevent low-priority floods from delaying urgent work.

**Example:** `score-live` for new calls, `score-backfill` for re-scoring history, with more workers on `score-live`.

**Say it like this:** "Urgent and bulk work never share a queue, so a backfill can't delay new calls."

---

**Q24. How do you schedule a job for the future?**

**Short answer:** Delayed messages (SQS delay, BullMQ `delay`, Celery `eta`/`countdown`), or a scheduled-jobs table polled by a worker for long delays.

**Explanation:** Very long delays are better in a database than in the broker.

**Example:** Send a reminder 24 hours before a session: store `remind_at` and let a poller enqueue it.

**Say it like this:** "Short delays use the queue; anything far in the future lives in a table that a scheduler checks."

---

**Q25. How do you chain or fan out jobs?**

**Short answer:** Chains run steps in sequence; fan-out runs many in parallel and a final step aggregates results (Celery `chain`, `group`, `chord`; BullMQ flows).

**Explanation:** Store intermediate results durably so a failed step can resume.

**Example:** `chord([score_chunk.s(c) for c in chunks], combine_scores.s(call_id))`.

**Say it like this:** "Chunks are scored in parallel and a final step combines them, which is exactly a fan-out and fan-in."

---

**Q26. How do you monitor queues?**

**Short answer:** Queue depth, age of the oldest message, processing rate, failure and retry rate, DLQ size, and per-job duration.

**Explanation:** Age is the best alert: it reflects user impact.

**Example:** Alert if the oldest message in `score-live` is older than 10 minutes.

**Say it like this:** "I alert on how old the oldest job is, because that's how late users get their results."

---

**Q27. How do you handle very large job payloads?**

**Short answer:** Store the data in S3 or the database and put only a reference (ID or key) in the message.

**Explanation:** Brokers have size limits (SQS 256 KB) and large messages slow everything.

**Example:** Message `{ callId: "c_42" }`; the worker loads the transcript from storage.

**Say it like this:** "Messages carry IDs, not data. The data lives in storage."

---

**Q28. What is backpressure in queue-based systems?**

**Short answer:** Slowing producers when consumers can't keep up, by rejecting or delaying new work, or limiting in-flight jobs.

**Explanation:** Without it, queues grow until timeouts and costs explode.

**Example:** The API returns 429 for bulk re-score requests when the backlog exceeds a threshold.

**Say it like this:** "When the system is full, it should say so early rather than accept work it can't finish in time."

---

**Q29. How do you make a consumer idempotent when the side effect is external (like sending an email)?**

**Short answer:** Record the intent with a unique key before or atomically with sending, check it before sending, and use provider idempotency keys if available.

**Explanation:** Perfect exactly-once to external systems isn't possible; minimise duplicates.

**Example:** `INSERT INTO sent_emails (event_id) ON CONFLICT DO NOTHING RETURNING id` → send only if inserted.

**Say it like this:** "A unique record per event decides whether to send, so retries don't spam users."

---

**Q30. Kafka basics: topics, partitions, consumer groups and offsets?**

**Short answer:** Topics are split into partitions (ordered logs); consumers in a group share partitions; each group tracks its offset (position) per partition.

**Explanation:** Ordering is per partition; parallelism is limited by the number of partitions.

**Example:** `call-events` with 12 partitions keyed by `call_id`; analytics and notifications are separate groups.

**Say it like this:** "Partitions give order and parallelism, consumer groups let several services read the same events independently."

---

## 🔴 More Advanced

**Q31. What is event sourcing?**

**Short answer:** Storing every change as an immutable event and deriving current state by replaying them.

**Explanation:** Great audit trail and time travel; complex to build and query (needs projections).

**Example:** Scorecard events: created, answered, overridden, finalised.

**Say it like this:** "Event sourcing keeps a perfect history, but it's a big complexity cost. I'd use it only where history is central."

---

**Q32. What is CQRS?**

**Short answer:** Command Query Responsibility Segregation: separate models (and sometimes stores) for writes and reads.

**Explanation:** Reads can be denormalised projections updated from events.

**Example:** Writes go to normalised scorecard tables; a read model powers the dashboard.

**Say it like this:** "CQRS lets the read side be shaped for screens while the write side protects the rules."

---

**Q33. How do you replay or reprocess events safely?**

**Short answer:** Idempotent consumers, versioned processing (store which version produced a result), and running replays on separate consumer groups or queues.

**Explanation:** Re-scoring with a new prompt version should create new results, not overwrite old ones blindly.

**Example:** Results keyed by `(call_id, prompt_version)`.

**Say it like this:** "Reprocessing is safe when results are keyed by version and consumers are idempotent."

---

**Q34. How do you guarantee ordering and exactly-once effects in Kafka?**

**Short answer:** Key messages so related events share a partition; use idempotent producers and transactions for Kafka-to-Kafka; idempotent sinks for external systems.

**Explanation:** End-to-end exactly-once needs idempotent writes at the destination.

**Example:** Consumer writes with upserts keyed by event ID.

**Say it like this:** "Kafka gives ordering per key, and exactly-once really comes from idempotent writes at the end."

---

## 🧩 More Scenarios

**Q35. A worker deploy caused half-finished jobs. How do you make deploys safe?**

**Short answer:** Graceful worker shutdown (finish current jobs, stop fetching new ones), late acks for redelivery, and idempotent jobs.

**Explanation:** Celery handles SIGTERM with a warm shutdown.

**Example:** ECS stop timeout set longer than the longest job.

**Say it like this:** "Workers finish what they started before exiting, and anything interrupted is safely retried."

---

**Q36. The dead-letter queue has 2,000 messages after a provider outage. What do you do?**

**Short answer:** Fix or confirm the root cause, inspect a sample, then redrive them in controlled batches with rate limits.

**Explanation:** Redriving everything at once can cause a second outage.

**Example:** Redrive 100 messages a minute while watching error rates.

**Say it like this:** "Understand why they failed, then replay gradually, so recovery doesn't become a new incident."

---

**Q37. Jobs are processed but users never see results. How do you debug it?**

**Short answer:** Trace one job end to end: was the result saved, was the event published, did the API receive it, and did the client get the push?

**Explanation:** Correlation IDs across the pipeline make this quick.

**Example:** Results were saved, but the notification publish failed silently; the outbox pattern fixed it.

**Say it like this:** "Follow one job ID through every stage; the gap is usually between saving and notifying."

---

## 🎯 From Your Resume

**Q38. "How did you get 5x throughput in the scoring pipeline?"**

**Short answer:** The work was I/O-bound, so we moved from processing chunks one at a time to concurrent processing across tuned workers, with batching and rate-limit-aware concurrency. [Use your real changes.]

**Explanation:** Give the measurement: calls processed per hour, same workload, before and after.

**Example:** "Sequential chunk scoring → parallel chunks with a concurrency limit; worker concurrency raised from [X] to [Y]."

**Say it like this:** "Most of the time was waiting on transcription and the LLM, not CPU. Running chunks concurrently, within the provider's rate limits, multiplied throughput by about 5x on the same workload."

---

**Q39. "What happens when the OpenAI call fails in your pipeline?"**

**Short answer:** Transient errors retry with backoff and jitter; invalid output is validated and retried once with the error, then sent to human review; repeated failures go to a dead-letter queue with an alert.

**Explanation:** The UI shows "AI analysis pending" rather than failing.

**Example:** A 429 retries after the `Retry-After` delay; a schema failure triggers one retry and then human review.

**Say it like this:** "Failures are expected, so each type has a path: retries for transient errors, human review for bad output, and a dead-letter queue with an alert for anything persistent. Users just see 'pending'."

---

**Q40. "Why 45 seconds average latency, and how would you reduce it?"**

**Short answer:** Transcription and LLM calls dominated; I'd stream transcription, score chunks in parallel, and use a smaller model for first-pass triage.

**Explanation:** Break latency into queue wait, transcription, scoring and post-processing, and attack the biggest part.

**Example:** "Queue wait [x s], transcription [y s], scoring [z s]." [Use your real breakdown.]

**Say it like this:** "I'd break the 45 seconds into stages and go after the largest. Streaming transcription and parallel chunk scoring would cut the biggest pieces."
