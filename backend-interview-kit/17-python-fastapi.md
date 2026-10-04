# 17 — Python and FastAPI (with Celery)

Your current work runs on React plus FastAPI, and the AI scoring pipeline uses Celery and LangChain in Python. Even though your resume lists Node first, a full-stack interviewer may ask about the Python side, so be ready on FastAPI, async Python, Pydantic and Celery.

**How this file is organised**

- **Part A — Understand the topic:** what FastAPI is, how dependencies and Pydantic work, async in Python, and where Celery fits, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is FastAPI?

A modern Python web framework built on **Starlette** (the ASGI web layer) and **Pydantic** (data validation). You declare request and response types with Python type hints, and FastAPI validates input, serialises output, and generates **OpenAPI** documentation automatically.

```python
class ScoreIn(BaseModel):
    call_id: UUID
    score: int = Field(ge=0, le=100)

@app.post("/scorecards", status_code=201)
async def create(body: ScoreIn, user: User = Depends(require("scorecards:write"))) -> ScorecardOut:
    return await scorecards.create(body, user)
```

### Dependencies

`Depends()` is FastAPI's dependency injection: functions that provide things like the database session, the current user, or a permission check. They can depend on other dependencies and clean up after the request (`yield`).

### Async in Python

- `async def` endpoints run on the event loop; use them with async libraries (asyncpg, httpx).
- Plain `def` endpoints run in a thread pool, so blocking libraries don't freeze the loop.
- Calling blocking code (like `requests` or a sync database driver) inside `async def` blocks every request.

### The GIL

CPython's Global Interpreter Lock allows only one thread to run Python bytecode at a time. I/O-bound work still benefits from threads and async; CPU-bound work needs multiple **processes** (Celery workers, multiprocessing).

### Celery

A distributed task queue for Python: the API enqueues tasks to a broker (Redis or RabbitMQ), and worker processes execute them with retries, scheduling (Celery Beat) and rate limits.

### Why interviewers ask about it

They want to see that you understand the Python backend you work in: validation, dependencies, async pitfalls and background processing.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. Why FastAPI over Flask or Django?**

**Short answer:** Type-hint-based validation with Pydantic, automatic OpenAPI docs, native async support, and high performance; Django suits full-featured apps with an ORM and admin, Flask suits small simple services.

**Explanation:** FastAPI's OpenAPI generation makes frontend type generation easy.

**Example:** InterpretIQ's API documented itself at `/docs`, and the React team generated TypeScript types from it [if you did].

**Say it like this:** "FastAPI gives validation and API docs for free from type hints, which suits an API consumed by a TypeScript frontend."

---

**Q2. What is Pydantic?**

**Short answer:** A library that validates and parses data into typed models using Python type hints, with clear error messages.

**Explanation:** Use separate models for input and output so internal fields (password hashes, tenant IDs) never leak.

**Example:**

```python
class UserOut(BaseModel):
    id: UUID
    name: str
    role: Role
    model_config = ConfigDict(from_attributes=True)
```

**Say it like this:** "Pydantic models are the contract: separate input and output models mean we can't accidentally return internal fields."

---

**Q3. How does dependency injection work in FastAPI?**

**Short answer:** Endpoints declare dependencies with `Depends()`; FastAPI resolves them per request, caches them within that request, and runs cleanup after `yield`.

**Explanation:** Dependencies are easy to override in tests with `app.dependency_overrides`.

**Example:**

```python
async def get_db():
    async with SessionLocal() as session:
        yield session

@app.get("/calls/{cid}")
async def get_call(cid: UUID, db: AsyncSession = Depends(get_db), user = Depends(current_user)): ...
```

**Say it like this:** "Dependencies give each request its database session and current user, and in tests I override them with fakes in one line."

---

**Q4. `async def` vs `def` endpoints?**

**Short answer:** `async def` runs on the event loop and must only use non-blocking I/O; `def` runs in a thread pool and can use blocking libraries safely.

**Explanation:** The worst case is blocking calls inside `async def`, which freezes all requests.

**Example:** `requests.get()` inside `async def` → use `httpx.AsyncClient` instead, or make the endpoint `def`.

**Say it like this:** "async def is only faster if everything inside is async. Otherwise a plain def is safer, because FastAPI runs it in a thread."

---

## 🟡 Level 2 — Intermediate

**Q5. How did you implement permission checks as dependencies?**

**Short answer:** A dependency factory `require(permission)` that gets the current user and raises 403 if the permission is missing, used on every route.

**Explanation:** Object-level checks (tenant, ownership) still happen in the query.

**Example:**

```python
def require(perm: str):
    async def checker(user: User = Depends(current_user)) -> User:
        if perm not in user.permissions:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return checker

@router.patch("/scorecards/{sid}")
async def update(sid: UUID, body: ScoreUpdate, user = Depends(require("scorecards:write")), db = Depends(get_db)):
    sc = await repo.get_scoped(db, sid, tenant_id=user.tenant_id)
    if not sc: raise HTTPException(404)
```

**Say it like this:** "Every route declares its permission through a dependency, so a missing check is visible in code review, and the query itself is scoped to the tenant."

---

**Q6. How do you handle errors consistently?**

**Short answer:** Raise domain exceptions in services and register exception handlers that map them to HTTP responses with a consistent shape.

**Explanation:** Customise the validation error handler too, so 422 responses match your format.

**Example:**

```python
@app.exception_handler(NotFound)
async def not_found(_req, exc): return JSONResponse({"error": "not_found", "message": str(exc)}, status_code=404)
```

**Say it like this:** "Services raise domain errors; one place translates them into HTTP, so every endpoint fails the same way."

---

**Q7. How do you use SQLAlchemy with FastAPI?**

**Short answer:** An async engine and session per request through a dependency, repositories for queries, Alembic for migrations.

**Explanation:** Watch lazy loading in async code (it raises errors); use `selectinload` to load relationships explicitly and avoid N+1.

**Example:** `select(Call).options(selectinload(Call.scorecards)).where(Call.tenant_id == tid)`.

**Say it like this:** "One session per request, explicit eager loading to avoid N+1, and Alembic migrations in CI."

---

**Q8. What are background tasks in FastAPI, and when do you use Celery instead?**

**Short answer:** `BackgroundTasks` run after the response in the same process, fine for small fire-and-forget work; Celery is for heavy, retryable or long work in separate workers.

**Explanation:** Background tasks are lost if the process restarts and have no retries.

**Example:** Sending an audit event: `BackgroundTasks`. Scoring a call: Celery.

**Say it like this:** "If losing the task on a restart is acceptable, BackgroundTasks; if it must be retried and survive deploys, Celery."

---

**Q9. How do you configure Celery for reliability?**

**Short answer:** Late acknowledgements, reject on worker loss, retries with backoff and jitter, time limits, idempotent tasks, separate queues by priority, and monitoring (Flower, metrics).

**Explanation:** Prefetch multiplier 1 for long tasks, so one worker doesn't hoard jobs.

**Example:**

```python
app.conf.update(task_acks_late=True, task_reject_on_worker_lost=True, worker_prefetch_multiplier=1,
                task_time_limit=300, task_soft_time_limit=240)
```

**Say it like this:** "Late acks plus idempotent tasks mean a crash causes a retry, not a lost job, and time limits stop a stuck task from blocking a worker forever."

---

**Q10. How do you stream responses (SSE) in FastAPI?**

**Short answer:** Return a `StreamingResponse` with `media_type="text/event-stream"` from an async generator, checking for client disconnects.

**Explanation:** Send heartbeats and disable proxy buffering (`X-Accel-Buffering: no`).

**Example:**

```python
@router.get("/compliance-chat/stream")
async def chat(q: str, request: Request, user = Depends(current_user)):
    async def events():
        async for token in answer_stream(q, tenant_id=user.tenant_id):
            if await request.is_disconnected(): break
            yield f"data: {json.dumps({'t': token})}\n\n"
    return StreamingResponse(events(), media_type="text/event-stream", headers={"X-Accel-Buffering": "no"})
```

**Say it like this:** "SSE in FastAPI is an async generator wrapped in a StreamingResponse. I stop when the client disconnects and disable proxy buffering so tokens arrive immediately."

---

## 🔴 Level 3 — Advanced

**Q11. What is the GIL, and how does it affect your design?**

**Short answer:** The Global Interpreter Lock lets only one thread run Python bytecode at a time, so CPU-bound work needs processes; I/O-bound work is fine with async or threads.

**Explanation:** Python 3.13 has an experimental free-threaded build, but most production code still assumes the GIL.

**Example:** Transcription and LLM calls are I/O-bound (async or high Celery concurrency); audio processing is CPU-bound (separate processes).

**Say it like this:** "The GIL means I scale CPU work with processes and I/O work with async. Our scoring pipeline was I/O-bound, which is why concurrency gave us 5x."

---

**Q12. How do you scale a FastAPI service?**

**Short answer:** Multiple Uvicorn workers per container (or one per container with more containers), async database drivers with pooling, caching, and moving heavy work to Celery.

**Explanation:** Gunicorn with Uvicorn workers is common; size pools so total connections stay under the database limit.

**Example:** 4 containers × 2 workers × pool of 5 = 40 database connections.

**Say it like this:** "Scale out stateless workers, keep database connections bounded, and push anything slow into the queue."

---

**Q13. How do you test FastAPI apps?**

**Short answer:** `TestClient` or `httpx.AsyncClient` against the app, dependency overrides for auth and external services, and a real database for integration tests.

**Explanation:** Override `current_user` to test each role without real tokens.

**Example:**

```python
app.dependency_overrides[current_user] = lambda: make_user(role="agent", tenant_id=t1)
assert client.get(f"/scorecards/{other_tenant_scorecard}").status_code == 404
```

**Say it like this:** "Dependency overrides let me test every role and tenant combination quickly, against a real database."

---

## 🧩 Level 4 — Scenario-Based

**Q14. The FastAPI service becomes unresponsive under load, but CPU is low. Why?**

**Short answer:** Blocking calls inside `async def` endpoints freeze the event loop, or the database pool or thread pool is exhausted.

**Explanation:** Find sync libraries in async paths; check pool wait metrics.

**Example:** A sync S3 client in an async endpoint blocked the loop; switching to `aioboto3` or running it in a thread fixed it.

**Say it like this:** "Low CPU but frozen requests means something is blocking the event loop or waiting for a pool. I look for sync calls inside async endpoints first."

---

**Q15. Celery tasks sometimes run twice. Is that a bug?**

**Short answer:** It's expected with at-least-once delivery (late acks, visibility timeouts, worker restarts); the fix is idempotent tasks, not trying to prevent all duplicates.

**Explanation:** Also check the visibility timeout is longer than the longest task, or tasks will be redelivered while still running.

**Example:** A 10-minute task with a 5-minute Redis visibility timeout was redelivered while still running.

**Say it like this:** "Duplicates are part of the contract, so tasks are idempotent. If they happen a lot, I check the visibility timeout against the task duration."

---

## 🟢 More Basics

**Q16. What are Python's main data structures and their costs?**

**Short answer:** list (dynamic array: O(1) append, O(n) search), dict (hash map: O(1) lookup), set (hash set: O(1) membership), tuple (immutable sequence).

**Explanation:** Use `collections.deque` for queues and `defaultdict`/`Counter` for grouping and counting.

**Example:** `Counter(c.agent_id for c in calls).most_common(5)`.

**Say it like this:** "dict and set give constant-time lookups, which fixes most accidental O(n²) code."

---

**Q17. What are type hints, and do they affect runtime?**

**Short answer:** Annotations that tools (mypy, pyright) check statically; Python ignores them at runtime, except libraries like Pydantic and FastAPI that read them.

**Explanation:** Run a type checker in CI.

**Example:** `def score(chunks: list[Chunk]) -> ChunkScore: ...`.

**Say it like this:** "Type hints catch bugs in CI, and FastAPI uses them to validate requests at runtime too."

---

**Q18. What are decorators?**

**Short answer:** Functions that wrap other functions to add behaviour (logging, retries, caching, routing).

**Explanation:** Use `functools.wraps` to preserve metadata.

**Example:** `@app.get("/calls")`, `@retry(stop=stop_after_attempt(3))`.

**Say it like this:** "Decorators add behaviour around functions; FastAPI routes and Celery tasks are both decorators."

---

**Q19. What are context managers?**

**Short answer:** Objects used with `with` that set up and clean up resources reliably (files, sessions, locks).

**Explanation:** `async with` for async resources; `contextlib.contextmanager` to write your own.

**Example:** `async with httpx.AsyncClient(timeout=10) as client: ...`.

**Say it like this:** "with guarantees cleanup, even when an exception happens."

---

**Q20. What are generators, and why use them?**

**Short answer:** Functions that `yield` values lazily, one at a time, using little memory.

**Explanation:** Great for streaming large data and SSE responses.

**Example:** `def chunks(transcript, size): for i in range(0, len(transcript), size): yield transcript[i:i+size]`.

**Say it like this:** "Generators process data piece by piece, which keeps memory flat on large inputs."

---

**Q21. How do you manage Python dependencies and environments?**

**Short answer:** Virtual environments with a lockfile, using tools like uv, Poetry or pip-tools, and pinned versions in production images.

**Explanation:** Never install into the system Python.

**Example:** `uv sync --frozen` in the Dockerfile.

**Say it like this:** "Every project has an isolated environment and a lockfile, so installs are reproducible."

---

## 🟡 More Intermediate

**Q22. How does FastAPI handle validation errors?**

**Short answer:** It returns 422 with details of which field failed and why, generated from Pydantic errors.

**Explanation:** Override the handler to match your API's error format.

**Example:** `@app.exception_handler(RequestValidationError)` returning `{ "error": "validation_error", "fields": … }`.

**Say it like this:** "FastAPI validates automatically, and I reshape its 422 to match our standard error format."

---

**Q23. What is the difference between Pydantic v1 and v2?**

**Short answer:** v2 has a Rust core (much faster), `model_validate`/`model_dump` instead of `parse_obj`/`dict`, `ConfigDict`, and stricter behaviour.

**Explanation:** Migration needs code changes but brings big performance gains.

**Example:** `UserOut.model_validate(orm_user)` with `from_attributes=True`.

**Say it like this:** "Pydantic v2 is far faster with a cleaner API; most FastAPI projects should be on it."

---

**Q24. How do you run startup and shutdown logic in FastAPI?**

**Short answer:** A `lifespan` async context manager that creates resources (pools, clients) on startup and closes them on shutdown.

**Explanation:** Replaces the older `on_event` handlers.

**Example:**

```python
@asynccontextmanager
async def lifespan(app):
    app.state.http = httpx.AsyncClient(timeout=10)
    yield
    await app.state.http.aclose()
app = FastAPI(lifespan=lifespan)
```

**Say it like this:** "Lifespan creates shared clients once and closes them cleanly, so connections aren't leaked."

---

**Q25. What is middleware in FastAPI and Starlette?**

**Short answer:** Code that wraps every request and response: CORS, GZip, request IDs, timing and security headers.

**Explanation:** Pure ASGI middleware is faster than `BaseHTTPMiddleware` for streaming responses.

**Example:** A middleware that adds `x-request-id` and logs request duration.

**Say it like this:** "Middleware handles cross-cutting concerns once, for every route."

---

**Q26. How do you handle authentication with OAuth2 in FastAPI?**

**Short answer:** `OAuth2PasswordBearer` or a custom `HTTPBearer`/cookie dependency extracts the token; a `current_user` dependency verifies it and loads the user.

**Explanation:** Verify signature, expiry, issuer and audience; return 401 with `WWW-Authenticate`.

**Example:** `async def current_user(token: str = Depends(oauth2_scheme)) -> User: ...`.

**Say it like this:** "Auth is a dependency chain: extract the token, verify it, load the user, then check permissions."

---

**Q27. What are Alembic migrations?**

**Short answer:** Versioned database schema changes for SQLAlchemy projects, autogenerated from model changes and reviewed before applying.

**Explanation:** Always review autogenerated migrations; they miss renames and data changes.

**Example:** `alembic revision --autogenerate -m "add version to scorecards"` then `alembic upgrade head` in CI and deploy.

**Say it like this:** "Alembic tracks schema versions; autogenerate is a starting point that I always review."

---

**Q28. What is the difference between `asyncio.gather` and `TaskGroup`?**

**Short answer:** Both run coroutines concurrently; `TaskGroup` (Python 3.11+) cancels the remaining tasks if one fails and raises an `ExceptionGroup`, which is safer.

**Explanation:** Add a semaphore to limit concurrency.

**Example:**

```python
sem = asyncio.Semaphore(10)
async def limited(c):
    async with sem: return await score_chunk(c)
async with asyncio.TaskGroup() as tg:
    tasks = [tg.create_task(limited(c)) for c in chunks]
```

**Say it like this:** "TaskGroup gives structured concurrency, and a semaphore keeps us within the provider's rate limit."

---

**Q29. How do you call blocking code from async code?**

**Short answer:** `await asyncio.to_thread(fn, ...)` or `run_in_threadpool`, so the event loop isn't blocked.

**Explanation:** For CPU-heavy work, use a process pool or Celery.

**Example:** `await asyncio.to_thread(boto3_client.upload_file, path, bucket, key)`.

**Say it like this:** "Blocking calls go to a thread, CPU-heavy work goes to processes, and the event loop stays free."

---

**Q30. What is Celery Beat?**

**Short answer:** Celery's scheduler that sends periodic tasks to the queue on a schedule.

**Explanation:** Run exactly one Beat instance (or use a distributed lock-based scheduler).

**Example:** `"nightly-aggregates": {"task": "reports.aggregate", "schedule": crontab(hour=2, minute=0)}`.

**Say it like this:** "Beat schedules, workers execute, and only one Beat runs so jobs aren't duplicated."

---

## 🔴 More Advanced

**Q31. How do you structure a large FastAPI project?**

**Short answer:** Routers per feature, a service layer for business logic, repositories for data access, Pydantic schemas per feature, and dependencies for shared concerns.

**Explanation:** Keep routes thin, like controllers.

**Example:** `app/features/scorecards/{router.py, service.py, repo.py, schemas.py}`.

**Say it like this:** "Feature folders with thin routers keep the logic testable and the codebase navigable."

---

**Q32. How do you make Celery tasks observable?**

**Short answer:** Structured logs with task ID and correlation ID, metrics (duration, success, retries) via signals or exporters, Flower for live inspection, and traces propagated through headers.

**Explanation:** Alert on failure rate and queue age.

**Example:** `task_prerun`/`task_postrun` signals record durations to Prometheus.

**Say it like this:** "Every task reports duration, outcome and retries, and carries the request's trace ID."

---

**Q33. How do you deploy FastAPI in production?**

**Short answer:** Uvicorn workers (or Gunicorn with Uvicorn workers) in a container behind a load balancer, with health checks, graceful shutdown, structured logs and tuned worker counts.

**Explanation:** Don't use `--reload` in production.

**Example:** `gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 4 --timeout 60`.

**Say it like this:** "Containers running a few Uvicorn workers each, scaled horizontally behind a load balancer."

---

**Q34. How do you protect a LangChain or LLM call path in Python?**

**Short answer:** Timeouts, retries with backoff for rate limits, structured output validated with Pydantic, token limits, prompt versioning, and logging without sensitive content.

**Explanation:** Treat model output as untrusted input.

**Example:** `llm.with_structured_output(ChunkScore).with_retry(stop_after_attempt=3)`.

**Say it like this:** "The LLM is an unreliable external dependency, so it gets timeouts, retries and strict output validation."

---

## 🧩 More Scenarios

**Q35. Celery workers use more and more memory over time. What do you do?**

**Short answer:** Set `worker_max_tasks_per_child` to recycle processes, find the leak with memory profiling, and avoid global caches in tasks.

**Explanation:** Recycling is a safety net, not a fix.

**Example:** Loading a large model per task without releasing it; moved to a module-level singleton.

**Say it like this:** "Recycle workers to stay stable, then profile to find what's holding memory."

---

**Q36. An endpoint is slow only under concurrent load. What could it be in FastAPI?**

**Short answer:** Sync code in async endpoints, a small database pool, thread pool exhaustion for sync endpoints, or lock contention.

**Explanation:** Check pool wait times and event loop lag.

**Example:** Database pool of 5 with 50 concurrent requests → most requests waited for a connection.

**Say it like this:** "Slow only under load means something is shared and saturated: the loop, the pool, or a lock."

---

## 🎯 From Your Resume

**Q37. "What did you change in the FastAPI backend during the security audit?"**

**Short answer:** Permission dependencies on every route, tenant-scoped queries, token verification fixes, separate input and output models to stop data leaks, and PHI scrubbing in logs and Sentry.

**Explanation:** Mention the regression tests: the role × endpoint matrix.

**Example:** `Depends(require("sessions:read"))` added to all routes; a CI check that fails if a router has a route without a permission dependency.

**Say it like this:** "We made permissions impossible to forget: every route declares one, a CI check enforces it, and every query is scoped to the tenant."

---

**Q38. "How does LangChain fit into your Celery pipeline?"**

**Short answer:** Celery tasks call a LangChain chain (prompt with rubric and examples → model → structured output parser) per chunk, then validate the result with Pydantic before saving.

**Explanation:** Mention concurrency, retries on rate limits, and prompt versioning.

**Example:** `chain = prompt | llm.with_structured_output(ChunkScore)` called inside `score_chunk.delay(call_id, chunk_id)`.

**Say it like this:** "Each Celery task runs one chunk through a LangChain chain with structured output, validates it with Pydantic, and stores it with the prompt version so results are traceable."
