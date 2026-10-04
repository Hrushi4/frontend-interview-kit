# Backend Interview Kit (2026): Tailored to Hrushikesh's Resume

The backend companion to the Frontend Interview Kit, built around the backend side of your updated full-stack resume: Node.js, Express.js, NestJS, REST and GraphQL, PostgreSQL, MongoDB and Redis, FastAPI and Celery, the AI scoring pipeline (40,000+ calls a month), real-time video infrastructure (LiveKit on AWS), security (RBAC, JWT/OAuth, PHI), Docker, AWS, GitHub Actions, Sentry, Grafana and Prometheus.

## What's in each file

Every topic file has the same two-part structure:

1. **Part A — Understand the topic:** a plain-English explanation of the topic: what it is, how it works, the key terms and diagrams, and why interviewers ask about it. Read this first.
2. **Part B — Interview questions and answers**, from basic to advanced. Each answer has:
   - **Short answer:** the one or two lines to say first.
   - **Explanation:** the detail to add if the interviewer wants more.
   - **Example:** code, a query, a config or a real situation.
   - **Say it like this:** a sample spoken answer you can use or adapt, often tied to your own projects.

Question levels:

- **🟢 Basic:** fundamentals asked in screening rounds.
- **🟡 Intermediate:** the bulk of senior backend rounds.
- **🔴 Advanced:** product companies, senior and staff loops, deep follow-ups.
- **🧩 Scenario:** "What would you do if…" questions that test judgement.
- **🎯 From Your Resume:** questions an interviewer will ask *because of what you wrote*.

**Anything in [square brackets]** in a sample answer is a placeholder for your real detail. Replace it with the true fact, or remove it. Never claim backend ownership or a number you can't explain.

For behavioural questions, DSA and frontend topics, use the Frontend Interview Kit (`frontend-interview-kit/`), which applies to full-stack loops too.

## Priority order for you (full-stack, 4+ years)

| Week | Files | Why |
|---|---|---|
| 1 | 01 Backend Resume Deep-Dive, 10 Auth and Security, 11 Queues | Your strongest backend stories: the audit and the AI pipeline |
| 1 | 02 Node.js, 05 REST API Design, 07 PostgreSQL | Asked in almost every backend round |
| 2 | 13 Backend System Design, 12 Real-Time, 09 Redis | Senior design rounds; your LiveKit and pipeline experience |
| 2 | 04 NestJS, 03 Express, 17 Python/FastAPI | Frameworks on your resume |
| 3 | 18 Backend Coding Round, 16 Testing | Live coding rounds |
| 3 | 06 GraphQL, 08 MongoDB, 14 Docker/AWS/CI-CD, 15 Observability | Skills listed on your resume |
| Daily | 19 Quick Memory Sheet | 10-minute refresh before any interview |

## Files

| # | File | Topic |
|---|---|---|
| 00 | README | This guide |
| 01 | backend-resume-deep-dive | Backend questions about every resume line, with sample answers |
| 02 | nodejs | Event loop, async, streams, scaling, memory |
| 03 | express | Middleware, routing, errors, validation, production hardening |
| 04 | nestjs | Modules, DI, guards, pipes, interceptors, testing |
| 05 | rest-api-design | Methods, status codes, idempotency, pagination, versioning, webhooks |
| 06 | graphql | Schemas, resolvers, N+1 and DataLoader, security, federation |
| 07 | postgresql | SQL, indexes, transactions, isolation, multi-tenancy, scaling |
| 08 | mongodb | Document modelling, indexes, aggregation, sharding |
| 09 | redis-caching | Data structures, caching patterns, invalidation, rate limits, locks |
| 10 | auth-security | Sessions, JWT, OAuth, RBAC, OWASP API risks, PHI |
| 11 | queues-async | Celery, BullMQ, retries, idempotency, outbox, sagas |
| 12 | realtime | SSE, WebSocket, scaling sockets, WebRTC/SFU, LiveKit on AWS |
| 13 | backend-system-design | Framework, concepts and 8 worked designs |
| 14 | docker-aws-cicd | Containers, core AWS services, pipelines, deployments |
| 15 | observability-performance | Logs, metrics, traces, SLOs, load testing, bottlenecks |
| 16 | testing-backend | Unit, integration, contract tests, test data, flaky tests |
| 17 | python-fastapi | FastAPI, Pydantic, async Python, GIL, Celery |
| 18 | backend-coding-round | Live builds: LRU cache, CRUD API, rate limiter, job queue, webhooks |
| 19 | quick-memory-sheet | One cheat sheet per topic |

## Google Docs versions

- **Everything in one file:** `backend-google-docs/Backend-Interview-Kit-ALL.docx` contains all files in order, each starting on a new page with its own top-level heading.
- **One file per topic:** every file is also in `backend-google-docs/` as its own `.docx`.

**Splitting it into tabs in Google Docs:**

1. Upload `Backend-Interview-Kit-ALL.docx` and open it with Google Docs (**File → Save as Google Docs** if it opens in Word mode).
2. **Extensions → Apps Script.** Delete the sample code and paste the whole of `backend-google-docs/split-into-tabs.gs`.
3. In the left sidebar, click **Services (+)**, choose **Google Docs API**, and click **Add**.
4. Choose `splitIntoTabs` in the toolbar, click **Run**, and approve the permissions.
5. Reload the doc. Each file is now its own tab, grouped under section tabs. If the run stops with a time-limit message, click **Run** again; it continues where it stopped.

To regenerate the `.docx` files after editing the Markdown, run `python3 build_docx.py --kit backend` from the repo root.

> Answers are kept interview-length: say the short answer first, then expand only if asked.
