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

## 🟢 More Basics

**Q16. What are test doubles: mocks, stubs, fakes and spies?**

**Short answer:** Stubs return canned answers, mocks also verify calls, fakes are working lightweight implementations (in-memory repository), spies record calls on real objects.

**Explanation:** Fakes often give the most realistic, least brittle tests.

**Example:** An in-memory `FakeEmailSender` that stores sent messages for assertions.

**Say it like this:** "I prefer fakes over heavy mocking, because they behave like the real thing and don't break on refactors."

---

**Q17. What is TDD, and do you use it?**

**Short answer:** Test-driven development: write a failing test, make it pass, refactor. It's especially useful for business rules and bug fixes.

**Explanation:** At minimum, write the regression test first for bugs.

**Example:** A failing test for "score above 100 is rejected" before adding validation.

**Say it like this:** "I use TDD for logic and always for bug fixes: reproduce with a test first, then fix."

---

**Q18. What is the Arrange-Act-Assert pattern?**

**Short answer:** Set up data, perform one action, check the outcome, keeping each test focused and readable.

**Explanation:** One behaviour per test.

**Example:** Arrange a draft scorecard → act: finalise → assert status is final and audit entry exists.

**Say it like this:** "Every test reads as setup, action, check, so failures are easy to understand."

---

**Q19. How do you test time-dependent code?**

**Short answer:** Inject a clock or use fake timers and time-freezing libraries (`vi.useFakeTimers`, `freezegun`).

**Explanation:** Never rely on real time or sleeps in tests.

**Example:** `@freeze_time("2026-03-01")` to test monthly report boundaries.

**Say it like this:** "Time is a dependency, so tests control it instead of waiting for it."

---

**Q20. What makes a test suite trustworthy?**

**Short answer:** Tests are deterministic, fast enough to run often, test real behaviour, fail for real bugs, and are maintained like production code.

**Explanation:** Flaky or slow suites get ignored.

**Example:** CI is required, green on main, and under 10 minutes.

**Say it like this:** "A suite people trust is fast, deterministic and catches real bugs; anything else gets skipped."

---

## 🟡 More Intermediate

**Q21. How do you test database transactions and rollbacks?**

**Short answer:** Trigger a failure mid-operation (fake dependency that throws) and assert nothing was partially saved.

**Explanation:** Proves atomicity of multi-step operations.

**Example:** Audit insert fails → assert scorecard status is still draft.

**Say it like this:** "I force a failure in the middle and check that the database shows no half-finished state."

---

**Q22. How do you test concurrency and race conditions?**

**Short answer:** Run the operation concurrently (e.g. 20 parallel requests) against a real database and assert invariants hold.

**Explanation:** Races rarely show up in single-threaded tests.

**Example:** 20 reviewers claim the same call concurrently → exactly one succeeds.

**Say it like this:** "For claim or stock logic, I hammer it in parallel in a test and check the invariant."

---

**Q23. What is snapshot testing, and when is it useful on the backend?**

**Short answer:** Comparing output to a saved snapshot; useful for API response shapes, generated SQL or schema outputs, but risky if snapshots are approved blindly.

**Explanation:** Keep snapshots small and reviewed.

**Example:** Snapshot of the GraphQL schema to catch unintended changes.

**Say it like this:** "Snapshots are good for detecting change, as long as reviewers actually read the diff."

---

**Q24. How do you test API error handling?**

**Short answer:** Assert status codes and error format for invalid input, missing auth, forbidden access, not found, conflicts and downstream failures.

**Explanation:** Error paths are where users and attackers spend time.

**Example:** Downstream timeout → API returns 503 with `retryable: true`.

**Say it like this:** "Every endpoint is tested for how it fails, not just how it succeeds."

---

**Q25. What is mutation testing?**

**Short answer:** Tools make small changes to your code (mutants) and check that tests fail; surviving mutants reveal weak tests.

**Explanation:** Expensive; use on critical modules.

**Example:** Stryker on the scoring module found tests that didn't check rounding.

**Say it like this:** "Mutation testing measures whether tests actually catch bugs, which coverage alone can't tell you."

---

**Q26. How do you test with realistic data safely?**

**Short answer:** Generate synthetic data or anonymise production data (masking PHI), never copy real sensitive data into test environments.

**Explanation:** Healthcare data in test systems is a compliance risk.

**Example:** Faker-generated patients and transcripts with realistic distributions.

**Say it like this:** "Test data is synthetic or properly anonymised; real patient data never leaves production."

---

**Q27. What is property-based testing?**

**Short answer:** Generating many random inputs to check that properties always hold (Hypothesis, fast-check).

**Explanation:** Finds edge cases humans miss.

**Example:** For any set of scores and weights, the weighted total stays between 0 and 100.

**Say it like this:** "Instead of a few examples, I state a rule and let the tool try thousands of inputs to break it."

---

## 🔴 More Advanced

**Q28. How do you test a system with many services end to end?**

**Short answer:** Contract tests between services, a small set of E2E tests in a production-like environment, and synthetic monitoring in production.

**Explanation:** Full E2E suites across many services are slow and flaky.

**Example:** Three critical journeys tested E2E nightly; everything else covered by contract tests.

**Say it like this:** "Contracts catch most integration bugs cheaply; a few E2E journeys guard the critical paths."

---

**Q29. How do you test performance regressions in CI?**

**Short answer:** Benchmarks or short load tests on key endpoints with thresholds, compared against a baseline.

**Explanation:** Run in a stable environment to reduce noise.

**Example:** k6 thresholds: p95 < 300 ms on `/api/calls` or the job fails.

**Say it like this:** "Performance is tested like behaviour: a threshold that fails the build when crossed."

---

**Q30. How do you test infrastructure and deployments?**

**Short answer:** Validate infrastructure as code (plan reviews, policy checks), smoke tests after deploy, and canary metrics with automatic rollback.

**Explanation:** Deploy-time checks catch configuration bugs tests can't.

**Example:** After deploy, a smoke test creates and deletes a test scorecard in a test tenant.

**Say it like this:** "Infrastructure is validated before applying, and every deploy runs a smoke test before taking full traffic."

---

## 🧩 More Scenarios

**Q31. A test passes locally but fails in CI. How do you debug it?**

**Short answer:** Look for environment differences: time zone, locale, missing env vars, test order, parallelism, database state, or network access.

**Explanation:** Reproduce with the CI container locally.

**Example:** CI runs in UTC; the test assumed IST.

**Say it like this:** "Local-only passes usually mean a hidden environment assumption like time zone or test order."

---

**Q32. Mocks made a test pass while production broke. How do you prevent it?**

**Short answer:** Replace mocks of internal components with real ones, verify mocks against contracts, and add integration tests for that path.

**Explanation:** Mocks drift from reality.

**Example:** A mocked repository returned data the real query couldn't.

**Say it like this:** "When a mock lies, I replace it with the real thing or a contract-checked fake."

---

## 🎯 From Your Resume

**Q33. "What backend testing standards did you introduce?"**

**Short answer:** Describe your real standards: [integration tests against a real database, an authorisation test matrix from the security audit, regression tests for every bug fix, mocked external APIs, CI gates].

**Explanation:** Connect them to the 30% reduction in production bugs, with how it was measured.

**Example:** "Every bug fix needed a failing test first; every endpoint appeared in the permission matrix."

**Say it like this:** "The two rules that mattered most were: every bug fix ships with a regression test, and every endpoint is in the permission test matrix. Together with CI gates, that's a big part of how production bugs dropped by 30%."
