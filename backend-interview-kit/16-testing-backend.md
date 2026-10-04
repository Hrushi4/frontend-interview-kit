# 16 — Backend Testing

You established testing standards for 15 developers and cut production bugs by 30%. On the backend, interviewers expect you to know unit, integration, contract and end-to-end tests, how to test against real databases, and how to test async and external dependencies.

**How this file is organised**

- **Part A — Understand the topic:** the testing pyramid for backends, what to mock and what not to, and test data strategies, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### The testing pyramid (backend version)

```text
          /  E2E  \        few: full system through HTTP, real dependencies
        / Contract  \      between services or frontend and backend
      / Integration   \    API + real database, queues mocked or real in containers
    /      Unit         \  many: pure business logic, fast
```

- **Unit tests:** business rules in isolation (scoring maths, permission rules).
- **Integration tests:** your API with a **real database** (in Docker or Testcontainers). These catch the most real bugs in backends.
- **Contract tests:** verify that a provider still matches what consumers expect.
- **E2E tests:** a few critical flows across the whole system.

### What to mock

- **Mock:** things you don't own and that are slow, costly or flaky: payment providers, OpenAI, Twilio, email.
- **Don't mock:** your own database. Mocked SQL tests pass while real queries fail.

### Test data

Each test creates the data it needs (factories), and tests are isolated: wrap each in a transaction that rolls back, or truncate tables between tests.

### Why interviewers ask about it

They want to know you ship code that stays correct as the team grows, and that your tests catch real bugs rather than just raising a coverage number.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. Unit vs integration vs end-to-end tests?**

**Short answer:** Unit tests check one piece in isolation; integration tests check pieces working together (API plus database); end-to-end tests check a full user flow through the whole system.

**Explanation:** For APIs, integration tests give the most confidence per test.

**Example:** Unit: weighted score calculation. Integration: `POST /scorecards` writes the right rows. E2E: login → score a call → see it in reports.

**Say it like this:** "Unit tests for logic, integration tests for the API and database together, and a few end-to-end tests for the flows that must never break."

---

**Q2. What should a good test look like?**

**Short answer:** Arrange, act, assert; one behaviour per test; a descriptive name; independent of other tests and of order.

**Explanation:** Test behaviour (inputs and outputs), not implementation details.

**Example:**

```ts
it('rejects a score above 100 with 400', async () => {
  const res = await request(app).post('/api/scorecards').set(auth(qaUser)).send({ callId, score: 120 });
  expect(res.status).toBe(400);
});
```

**Say it like this:** "Each test reads like a sentence about behaviour, sets up its own data, and doesn't care what ran before it."

---

**Q3. When should you mock?**

**Short answer:** For external services you don't control (payments, LLMs, SMS), time and randomness; not for your own database or internal modules you're actually testing.

**Explanation:** Over-mocking produces tests that pass while the real system fails.

**Example:** Mock the OpenAI client to return a fixed JSON score; use a real PostgreSQL container for the repository.

**Say it like this:** "I mock the outside world, not my own database. Mocked SQL proves nothing about real SQL."

---

**Q4. What is test coverage, and is 100% the goal?**

**Short answer:** The percentage of code executed by tests. It's useful for finding untested areas, but high coverage doesn't mean good tests.

**Explanation:** Focus coverage on critical modules (auth, permissions, billing, scoring).

**Example:** Require 80%+ on `auth/` and `scoring/` modules rather than 100% everywhere.

**Say it like this:** "Coverage shows gaps, it doesn't prove quality. I set targets where bugs are expensive."

---

## 🟡 Level 2 — Intermediate

**Q5. How do you test against a real database?**

**Short answer:** Run PostgreSQL in Docker (Testcontainers or a CI service), apply migrations once, and isolate tests with transactions or truncation.

**Explanation:** Transactions per test are fast; truncation is needed if code under test manages its own transactions.

**Example:**

```python
@pytest.fixture
def db_session(engine):
    conn = engine.connect(); tx = conn.begin()
    session = Session(bind=conn)
    yield session
    session.close(); tx.rollback(); conn.close()
```

**Say it like this:** "Integration tests hit a real Postgres in a container, and each test rolls back, so they're realistic and independent."

---

**Q6. How do you test authentication and authorisation?**

**Short answer:** A test matrix of role × endpoint × tenant that asserts the expected status codes, including cross-tenant access returning 404.

**Explanation:** Generated from a table so new endpoints get covered automatically.

**Example:**

```python
@pytest.mark.parametrize("role,method,path,status", MATRIX)
def test_access(client, role, method, path, status):
    assert client.request(method, path, headers=token_for(role)).status_code == status
```

**Say it like this:** "Permissions are tested as a matrix, every role against every endpoint, so a forgotten check fails CI instead of becoming a breach."

---

**Q7. How do you test background jobs and queues?**

**Short answer:** Unit test the task function directly; integration test that the API enqueues correctly; run workers eagerly (Celery `task_always_eager`) or against a real broker in a container for end-to-end checks.

**Explanation:** Also test idempotency: run the task twice and assert one result.

**Example:** `score_call(call_id); score_call(call_id); assert AiScore.count(call_id) == 1`.

**Say it like this:** "Tasks are just functions, so I test them directly, including running them twice to prove they're idempotent."

---

**Q8. How do you test code that calls external APIs?**

**Short answer:** Mock at the HTTP boundary (nock, respx, MSW, WireMock), test success, error and timeout cases, and keep a few contract checks against sandboxes.

**Explanation:** Test your retry and timeout behaviour, not just the happy path.

**Example:** respx returns 429 twice, then 200 → assert the client retried with backoff and succeeded.

**Say it like this:** "I fake the external API at the HTTP layer and test the unhappy paths, timeouts and rate limits, because that's where integrations break."

---

**Q9. What are contract tests?**

**Short answer:** Tests that verify a provider API still satisfies what its consumers expect (Pact), or that responses match the OpenAPI schema.

**Explanation:** They catch breaking changes between teams without full end-to-end environments.

**Example:** CI validates every API response in integration tests against the OpenAPI spec the frontend types are generated from.

**Say it like this:** "Contract tests catch the frontend-backend mismatches that unit tests on each side can't see."

---

**Q10. How do you keep test data manageable?**

**Short answer:** Factories with sensible defaults (factory_boy, fishery), creating only what each test needs, with builders for complex graphs.

**Explanation:** Shared fixtures that many tests modify become fragile.

**Example:** `ScorecardFactory(call=CallFactory(tenant=tenant), score=85)`.

**Say it like this:** "Factories let each test build exactly the data it needs in one line, so tests stay readable and independent."

---

## 🔴 Level 3 — Advanced

**Q11. How do you deal with flaky tests?**

**Short answer:** Treat them as bugs: find the cause (shared state, time, ordering, async waits, network), fix it, and quarantine only briefly with an owner.

**Explanation:** Common fixes: fixed clocks, no sleeps (wait for conditions), isolated data, deterministic randomness.

**Example:** A test failed at midnight UTC because it used `date.today()`; freezing time fixed it.

**Say it like this:** "A flaky test erodes trust in the whole suite, so it gets fixed like a production bug, not retried until green."

---

**Q12. How do you test database migrations?**

**Short answer:** Run all migrations from scratch in CI, run them against a copy of production-like data for big changes, and test that the app works with both old and new schema during rollout.

**Explanation:** Test rollback scripts if you rely on them.

**Example:** CI job: create empty DB → migrate up → run integration tests.

**Say it like this:** "Every migration runs in CI from zero, and big ones get rehearsed on realistic data before production."

---

**Q13. How do you test LLM-based features?**

**Short answer:** Mock the model in unit tests; validate output parsing and error handling; and run an evaluation set against the real model when prompts change.

**Explanation:** Evals measure quality; unit tests measure code correctness.

**Example:** A fixture returns malformed JSON → assert the job retries once and then routes to human review.

**Say it like this:** "Code paths are tested with a fake model; quality is tested with an eval set of human-scored calls whenever the prompt changes."

---

## 🧩 Level 4 — Scenario-Based

**Q14. A bug reached production even though all tests passed. What do you do?**

**Short answer:** Fix it, add a regression test that fails without the fix, and ask why existing tests missed it (mocked too much, missing case, untested path).

**Explanation:** The process fix matters more than the single test.

**Example:** Tests mocked the database, so a real unique-constraint error was never exercised; switched to a real Postgres in CI.

**Say it like this:** "Every escaped bug gets a regression test, and I ask what kind of test would have caught it, because that's usually a gap in the whole suite."

---

**Q15. The test suite takes 30 minutes. How do you speed it up?**

**Short answer:** Measure the slowest tests, run in parallel (separate databases per worker), share expensive setup, use transactions instead of recreating databases, and move pure logic to unit tests.

**Explanation:** Fast suites get run; slow ones get skipped.

**Example:** pytest-xdist with one database per worker cut the suite from 30 to 7 minutes.

**Say it like this:** "I profile the suite, parallelise with isolated databases, and push logic down to fast unit tests."

---

## 🎯 From Your Resume

**Q16. "What backend testing standards did you introduce?"**

**Short answer:** Describe your real standards: [integration tests against a real database, an authorisation test matrix from the security audit, regression tests for every bug fix, mocked external APIs, CI gates].

**Explanation:** Connect them to the 30% reduction in production bugs, with how it was measured.

**Example:** "Every bug fix needed a failing test first; every endpoint appeared in the permission matrix."

**Say it like this:** "The two rules that mattered most were: every bug fix ships with a regression test, and every endpoint is in the permission test matrix. Together with CI gates, that's a big part of how production bugs dropped by 30%."
