# 10 — Authentication, Authorisation and API Security

Your security and reliability audit (8 critical issues in RBAC, JWT/OAuth handling and PHI storage, findings cut by 85%) is one of your strongest stories. On the backend side, interviewers will dig into how tokens, sessions, permissions and data protection actually work on the server.

**How this file is organised**

- **Part A — Understand the topic:** authentication vs authorisation, sessions vs JWTs, OAuth and OIDC, RBAC, and the OWASP API risks, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Healthcare/PHI → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### Authentication vs authorisation

- **Authentication (AuthN):** who are you? Login, tokens, sessions. Failure → **401**.
- **Authorisation (AuthZ):** what are you allowed to do? Roles, permissions, ownership. Failure → **403** (or 404 to hide existence).

### Sessions vs JWTs

| | Server session | JWT (stateless token) |
|---|---|---|
| Where state lives | server store (Redis/DB) | inside the signed token |
| Revocation | delete the session, instant | hard: wait for expiry, or keep a denylist |
| Scaling | needs a shared store | any server can verify the signature |
| Typical use | web apps with a cookie | service-to-service, mobile, short-lived access tokens |

A common setup: **short-lived access token** (5–15 minutes) plus a **refresh token** stored securely and **rotated** on every use.

### OAuth 2.0 and OpenID Connect

- **OAuth 2.0** lets an app get *delegated access* to an API on a user's behalf (access tokens).
- **OpenID Connect** adds *login* on top: an ID token that says who the user is.
- For web and mobile apps, use the **Authorization Code flow with PKCE**.

### Authorisation models

- **RBAC:** permissions come from roles (admin, QA reviewer, agent).
- **ABAC / policy-based:** rules on attributes ("reviewer can edit a scorecard if same tenant and status is draft").
- **Object-level checks:** "does *this* user own *this* record?" This is where most real breaches happen (IDOR).

### OWASP API Security Top 10 (the ones that matter most)

1. Broken object-level authorisation (IDOR).
2. Broken authentication.
3. Broken object property-level authorisation (mass assignment, excessive data exposure).
4. Unrestricted resource consumption (no rate limits or size limits).
5. Broken function-level authorisation (admin endpoints reachable by users).

### Why interviewers ask about it

Your resume makes a specific security claim. They'll check that you understand the server side deeply: where tokens are verified, how permissions are enforced, how secrets and PHI are protected, and how you'd prevent regressions.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. Authentication vs authorisation?**

**Short answer:** Authentication proves identity (401 on failure); authorisation decides access to an action or resource (403 on failure).

**Explanation:** Both run on the server for every request. UI checks are for usability only.

**Example:** A valid agent token (authenticated) calling `DELETE /tenants/1` (not authorised) → 403.

**Say it like this:** "AuthN is who you are, AuthZ is what you may do, and the server checks both on every request."

---

**Q2. How should passwords be stored?**

**Short answer:** Hashed with a slow, salted algorithm (Argon2id or bcrypt), never encrypted or plain.

**Explanation:** Slow hashing makes brute force expensive; per-password salts defeat rainbow tables. Add rate limiting and breached-password checks.

**Example:** `await argon2.hash(password)`; `await argon2.verify(hash, input)`.

**Say it like this:** "Passwords are hashed with Argon2 or bcrypt. If the database leaks, they still can't be read back."

---

**Q3. What is a JWT, and what's inside it?**

**Short answer:** A signed token with a header, payload (claims like `sub`, `exp`, `role`) and signature; anyone can read it, but only the key holder can create a valid one.

**Explanation:** JWTs are encoded, not encrypted. Never put secrets or PHI in the payload.

**Example:** `{ "sub": "u_42", "tid": "tenant_1", "role": "qa", "exp": 1767225600 }`.

**Say it like this:** "A JWT is a signed claim, readable by anyone, so it carries IDs and roles, never sensitive data."

---

**Q4. How do you verify a JWT safely?**

**Short answer:** Verify the signature with an explicitly allowed algorithm, and check `exp`, `nbf`, `iss` and `aud`.

**Explanation:** Classic bugs: accepting `alg: none`, or confusing HS256 and RS256 keys. Pin the algorithm.

**Example:**

```ts
jwt.verify(token, publicKey, { algorithms: ['RS256'], issuer: 'https://auth.example.com', audience: 'bpobox-api' });
```

**Say it like this:** "I pin the algorithm and check issuer, audience and expiry, so a forged or misused token can't slip through."

---

**Q5. What is RBAC?**

**Short answer:** Role-based access control: users have roles, roles map to permissions, and endpoints check permissions.

**Explanation:** Check permissions (`scorecards:edit`), not role names, so roles can change without code changes.

**Example:** `admin → *`, `qa_reviewer → calls:read, scorecards:edit`, `agent → calls:read:own`.

**Say it like this:** "Endpoints check permissions, and roles are just bundles of permissions, which keeps the code stable as roles evolve."

---

## 🟡 Level 2 — Intermediate

**Q6. Access tokens and refresh tokens: how do they work together?**

**Short answer:** A short-lived access token authorises API calls; a long-lived refresh token gets new access tokens and is rotated on every use.

**Explanation:** Rotation with reuse detection: if an old refresh token is used again, revoke the whole token family, because it was probably stolen.

**Example:** Access token 10 minutes in memory or an HttpOnly cookie; refresh token 7 days in an HttpOnly, Secure, SameSite=Strict cookie scoped to `/auth/refresh`.

**Say it like this:** "Access tokens are short so a leak expires quickly; refresh tokens rotate, and reuse of an old one revokes the session."

---

**Q7. How do you revoke JWTs?**

**Short answer:** Keep access tokens short-lived, revoke refresh tokens in the database, and use a denylist of token IDs (`jti`) in Redis for urgent cases.

**Explanation:** A user-level "token version" checked on refresh logs out all sessions at once.

**Example:** On password change, increment `users.token_version`; refresh tokens with an older version are rejected.

**Say it like this:** "Pure JWTs can't be revoked, so I keep them short and make revocation happen at refresh time, with a denylist for emergencies."

---

**Q8. Explain the OAuth 2.0 Authorization Code flow with PKCE.**

**Short answer:** The app redirects to the authorisation server with a code challenge; the user logs in; the app receives a code and exchanges it, with the code verifier, for tokens.

**Explanation:** PKCE stops a stolen authorisation code from being used. Validate `state` to prevent CSRF.

**Example:**

```text
App → /authorize?code_challenge=…&state=… → user logs in → /callback?code=…&state=…
App → POST /token { code, code_verifier } → { access_token, id_token, refresh_token }
```

**Say it like this:** "Authorization Code with PKCE is the standard for web and mobile. PKCE makes a stolen code useless, and state prevents login CSRF."

---

**Q9. Where should the backend enforce object-level authorisation?**

**Short answer:** In the service or query for every resource access: filter by tenant and ownership, and return 404 if not found within that scope.

**Explanation:** Checking only at the route ("is a QA reviewer") misses "which tenant's scorecard".

**Example:**

```python
call = db.query(Call).filter(Call.id == call_id, Call.tenant_id == user.tenant_id).first()
if not call: raise HTTPException(404)
```

**Say it like this:** "The scope is part of the query itself. If it isn't yours, the database never returns it."

---

**Q10. What is mass assignment, and how do you prevent it?**

**Short answer:** Clients setting fields they shouldn't (like `role` or `tenantId`) because the server copies the request body into the model.

**Explanation:** Use explicit input schemas (DTOs, Pydantic models) that only include editable fields.

**Example:** `UpdateProfile` schema has `name` and `phone` only, so `{"role": "admin"}` is stripped or rejected.

**Say it like this:** "Inputs are allowlisted by schema. The client can never set its own role or tenant."

---

**Q11. How do you store and rotate secrets?**

**Short answer:** In a secret manager (AWS Secrets Manager, SSM Parameter Store), injected at runtime, never in code or images, with rotation and least-privilege access.

**Explanation:** Scan repos for leaked secrets in CI (gitleaks, GitHub secret scanning).

**Example:** ECS task definitions reference Secrets Manager ARNs for `DATABASE_URL` and `LIVEKIT_API_SECRET`.

**Say it like this:** "Secrets live in a secret manager, are injected at runtime and rotated, and CI blocks any commit that contains one."

---

**Q12. How do you prevent SQL and NoSQL injection?**

**Short answer:** Parameterised queries or an ORM, never string-built queries, plus input validation; for NoSQL, reject operator objects in input.

**Explanation:** `{"email": {"$ne": null}}` is a classic MongoDB injection if the body is passed straight into a query.

**Example:** `db.query('SELECT * FROM users WHERE email = $1', [email])`.

**Say it like this:** "Input is always a parameter, never part of the query text, and types are validated so an object can't sneak in where a string is expected."

---

## 🔴 Level 3 — Advanced

**Q13. How do you secure service-to-service communication?**

**Short answer:** Network isolation (private subnets, security groups), mTLS or signed service tokens, and least-privilege IAM roles.

**Explanation:** Don't trust a request just because it's internal (zero trust).

**Example:** The Celery workers assume an IAM role that can only read the recordings bucket, nothing else.

**Say it like this:** "Internal doesn't mean trusted. Services authenticate each other and get only the permissions they need."

---

**Q14. How do you design a permission system that scales beyond simple roles?**

**Short answer:** Centralise policy (a policy function or engine like OPA, Casbin or Cerbos), express rules on attributes, and test them as a matrix.

**Explanation:** Keep enforcement points consistent: every endpoint calls `can(user, action, resource)`.

**Example:** `can(user, 'edit', scorecard)` returns true if same tenant, user is the reviewer or an admin, and status is draft.

**Say it like this:** "One policy function answers every 'can this user do this' question, so rules live in one place and are tested in one place."

---

**Q15. How do you protect against brute force and credential stuffing?**

**Short answer:** Rate limits per IP and account, progressive delays, breached-password checks, MFA, and alerts on unusual login patterns.

**Explanation:** Use generic error messages so attackers can't enumerate accounts.

**Example:** After 5 failures, require a delay; after 10, lock the account temporarily and notify the user.

**Say it like this:** "Login endpoints get the strictest limits, generic errors and MFA, because they're attacked constantly."

---

## 🏥 Level 4 — Healthcare and PHI

**Q16. What is PHI, and how must a backend protect it?**

**Short answer:** Protected Health Information. Encrypt it in transit and at rest, restrict access by role, audit every access, minimise collection, and keep it out of logs and third parties without agreements.

**Explanation:** HIPAA in the US requires safeguards and Business Associate Agreements with vendors that handle PHI.

**Example:** Audit table rows: who accessed which patient session, when, and from where.

**Say it like this:** "PHI is encrypted everywhere, accessed on a need-to-know basis, every access is audited, and it never leaks into logs, analytics or vendors without an agreement."

---

**Q17. How do you keep PHI out of logs?**

**Short answer:** Structured logging with allowlisted fields, redaction middleware, no request bodies by default, and scrubbing in error trackers.

**Explanation:** Test redaction so it doesn't regress.

**Example:** A pino `redact` config for `req.body.patient*`, `*.ssn` and `authorization` headers.

**Say it like this:** "Logs only contain allowlisted fields. Bodies aren't logged by default, and a test fails if a known PHI field appears in a log line."

---

## 🧩 Level 5 — Scenario-Based

**Q18. You discover an API where changing an ID in the URL returns another tenant's data. What do you do?**

**Short answer:** Treat it as an incident: fix the query scope, check logs for exploitation, notify per policy, add tests for every similar endpoint, and add database-level protection like RLS.

**Explanation:** Also audit all endpoints systematically, because one IDOR rarely comes alone.

**Example:** Add a role × tenant × endpoint test matrix to CI.

**Say it like this:** "Fix it immediately, check whether it was exploited, then make the whole class of bug impossible with scoped queries, RLS and an authorisation test matrix."

---

**Q19. A JWT signing key may have leaked. What do you do?**

**Short answer:** Rotate the key immediately (publish the new key in JWKS, stop accepting the old one), force re-login by revoking refresh tokens, investigate the leak, and review access logs.

**Explanation:** Key IDs (`kid`) make rotation smooth.

**Example:** Remove the compromised `kid` from the JWKS; all tokens signed with it fail verification.

**Say it like this:** "Rotate the key, invalidate every session it signed, then find out how it leaked. kid-based JWKS makes rotation a config change, not a deploy."

---

## 🎯 From Your Resume

**Q20. "Walk me through the backend side of your security audit."**

**Short answer:** I mapped roles and data flows, tested every FastAPI endpoint as each role and tenant, reviewed token handling and PHI storage, then fixed issues with permission dependencies, token changes and log scrubbing, each with a regression test.

**Explanation:** Name real findings (only ones you can defend): UI-only RBAC, missing tenant scoping, long-lived tokens without rotation, PHI in logs.

**Example:**

```python
def require(permission: str):
    def dep(user = Depends(current_user)):
        if permission not in user.permissions: raise HTTPException(403)
        return user
    return dep

@router.get("/sessions/{sid}")
def get_session(sid: str, user = Depends(require("sessions:read"))): ...
```

**Say it like this:** "On the backend, the biggest fix was making every FastAPI route declare its permission through a dependency, and scoping every query by tenant. We added a test matrix of role × endpoint so these issues can't come back, and the re-audit showed 85% fewer findings."

---

**Q21. "How were JWT and OAuth tokens handled after your fixes?"**

**Short answer:** Describe your real setup: [short-lived access tokens, rotated refresh tokens in HttpOnly cookies, pinned algorithms, audience checks, revocation on logout].

**Explanation:** Explain what was wrong before and why the new design is safer.

**Example:** "Before: long-lived tokens in localStorage. After: 15-minute access tokens and rotating refresh tokens in HttpOnly cookies."

**Say it like this:** "We moved to short-lived access tokens and rotating refresh tokens in HttpOnly cookies, with the algorithm and audience pinned on verification, so a stolen token is short-lived and can't be replayed elsewhere."
