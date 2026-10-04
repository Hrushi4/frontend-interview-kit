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

## 🎯 From Your Resume

**Q16. "What did you change in the FastAPI backend during the security audit?"**

**Short answer:** Permission dependencies on every route, tenant-scoped queries, token verification fixes, separate input and output models to stop data leaks, and PHI scrubbing in logs and Sentry.

**Explanation:** Mention the regression tests: the role × endpoint matrix.

**Example:** `Depends(require("sessions:read"))` added to all routes; a CI check that fails if a router has a route without a permission dependency.

**Say it like this:** "We made permissions impossible to forget: every route declares one, a CI check enforces it, and every query is scoped to the tenant."

---

**Q17. "How does LangChain fit into your Celery pipeline?"**

**Short answer:** Celery tasks call a LangChain chain (prompt with rubric and examples → model → structured output parser) per chunk, then validate the result with Pydantic before saving.

**Explanation:** Mention concurrency, retries on rate limits, and prompt versioning.

**Example:** `chain = prompt | llm.with_structured_output(ChunkScore)` called inside `score_chunk.delay(call_id, chunk_id)`.

**Say it like this:** "Each Celery task runs one chunk through a LangChain chain with structured output, validates it with Pydantic, and stores it with the prompt version so results are traceable."
