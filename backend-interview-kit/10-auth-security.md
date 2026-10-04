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

## 🟢 More Basics

**Q16. What is the difference between encoding, encryption and hashing?**

**Short answer:** Encoding changes format and is reversible by anyone (Base64); encryption is reversible only with a key; hashing is one-way.

**Explanation:** JWT payloads are encoded, not encrypted. Passwords are hashed. PHI at rest is encrypted.

**Example:** `base64("abc")` anyone can decode; AES-GCM needs the key; Argon2 can't be reversed.

**Say it like this:** "Encoding is for transport, encryption is for secrecy, hashing is for verification. Mixing them up causes real breaches."

---

**Q17. What is MFA, and which factors are strongest?**

**Short answer:** Multi-factor authentication combines something you know, have or are; phishing-resistant factors like passkeys (WebAuthn) and hardware keys are strongest, SMS is weakest.

**Explanation:** TOTP apps are a good middle ground.

**Example:** Admins required to use passkeys or TOTP; SMS only as recovery.

**Say it like this:** "MFA blocks most account takeovers; passkeys are best because they can't be phished."

---

**Q18. What are HTTPS and TLS, briefly?**

**Short answer:** TLS encrypts and authenticates the connection using certificates; HTTPS is HTTP over TLS.

**Explanation:** Use TLS 1.2+, HSTS, and terminate at the load balancer or end-to-end for sensitive data.

**Example:** ALB terminates TLS with an ACM certificate; internal traffic re-encrypted for PHI services.

**Say it like this:** "TLS everywhere, HSTS on, and for health data I keep it encrypted inside the network too."

---

**Q19. What is CORS, and does it protect your API?**

**Short answer:** A browser mechanism that lets servers allow other origins to read responses; it doesn't protect against non-browser clients.

**Explanation:** Authentication and authorisation are the real protection.

**Example:** `curl` ignores CORS completely.

**Say it like this:** "CORS controls which websites can read our responses in a browser; it's not access control."

---

**Q20. What is the principle of least privilege?**

**Short answer:** Give every user, service and key only the access it needs, for only as long as it needs it.

**Explanation:** Limits the blast radius of a compromise.

**Example:** The reporting service has a read-only database user on reporting views only.

**Say it like this:** "If something is compromised, least privilege decides how bad it gets."

---

**Q21. What should an audit log contain?**

**Short answer:** Who did what, to which resource, when, from where, and the outcome; append-only and tamper-evident.

**Explanation:** Required for PHI access and admin actions.

**Example:** `{ actor: u_42, action: 'view_session', resource: s_9, tenant: t_1, ip, at, result: 'allowed' }`.

**Say it like this:** "Audit logs answer 'who accessed this patient's data and when', so they're append-only and kept separate from app logs."

---

## 🟡 More Intermediate

**Q22. Session cookies vs JWTs for a web app: what do you recommend?**

**Short answer:** For a first-party web app, server sessions in HttpOnly cookies (or a BFF) are simpler and revocable; JWTs fit service-to-service and multiple APIs.

**Explanation:** Many teams combine them: a session for the browser, short-lived JWTs between services.

**Example:** Browser ↔ BFF with a session cookie; BFF ↔ APIs with signed JWTs.

**Say it like this:** "For browsers I prefer sessions, which are easy to revoke; JWTs shine between services."

---

**Q23. What are JWKS and key rotation?**

**Short answer:** A JSON Web Key Set is a published list of public keys; tokens name their key with `kid`, so you can rotate keys by adding a new one and retiring the old.

**Explanation:** Verifiers cache JWKS and refetch on unknown `kid`.

**Example:** `https://auth.example.com/.well-known/jwks.json` with two keys during rotation.

**Say it like this:** "With JWKS, key rotation is just publishing a new key and retiring the old one later."

---

**Q24. What is the difference between OAuth scopes and application permissions?**

**Short answer:** Scopes limit what a token can be used for on behalf of a user; application permissions decide what that user can do inside your system.

**Explanation:** Check both: the token has the scope and the user has the permission.

**Example:** Token scope `scorecards:read` plus user role QA reviewer in tenant 1.

**Say it like this:** "Scopes limit the token, permissions limit the user, and the API checks both."

---

**Q25. How do you implement "log out everywhere"?**

**Short answer:** Revoke all refresh tokens or sessions for the user and increment a token version so outstanding access tokens fail on the next check.

**Explanation:** Short access-token lifetimes bound the remaining exposure.

**Example:** `UPDATE users SET token_version = token_version + 1`; delete their sessions in Redis.

**Say it like this:** "Revoking refresh tokens plus a token version ends every session within minutes."

---

**Q26. How do you validate and sanitise input?**

**Short answer:** Validate types, ranges and formats with schemas at the boundary; sanitise only where output contexts need it (HTML), and encode on output.

**Explanation:** Validation rejects bad data; output encoding prevents injection in each context.

**Example:** Zod/Pydantic for input; DOMPurify for user HTML displayed later.

**Say it like this:** "Validate on the way in, encode on the way out, for the specific context."

---

**Q27. What is SSRF, and how do you prevent it?**

**Short answer:** Server-Side Request Forgery: tricking your server into calling internal URLs (like cloud metadata). Prevent with allowlists, blocking private IP ranges, and IMDSv2.

**Explanation:** Any feature that fetches user-supplied URLs (webhooks, link previews) is at risk.

**Example:** Reject URLs resolving to `169.254.169.254` or `10.0.0.0/8`.

**Say it like this:** "If the server fetches URLs users give it, I allowlist destinations and block internal addresses."

---

**Q28. How do you protect against excessive data exposure?**

**Short answer:** Return only fields the client needs, using response schemas, and never rely on the frontend to hide fields.

**Explanation:** This is OWASP API3 (broken object property-level authorisation).

**Example:** Agent list returns name and ID, not email and phone.

**Say it like this:** "If the frontend hides it, the API shouldn't send it."

---

**Q29. How do you prevent function-level authorisation bugs (admin endpoints)?**

**Short answer:** Deny by default, require explicit permissions on every route, separate admin routes, and test every route with non-admin users.

**Explanation:** Automated checks that every route declares a permission.

**Example:** A test enumerates all routes and fails if one lacks a permission dependency.

**Say it like this:** "Secure by default: a route without an explicit permission fails CI."

---

**Q30. What is encryption at rest vs field-level encryption?**

**Short answer:** At-rest encryption protects disks and backups; field-level encryption protects specific columns even from people with database access.

**Explanation:** Field-level encryption with a KMS key for highly sensitive fields like notes or IDs.

**Example:** `patient_notes` encrypted with an AWS KMS data key; database admins see ciphertext.

**Say it like this:** "Disk encryption protects stolen drives; field encryption protects sensitive values even from insiders."

---

## 🔴 More Advanced

**Q31. How do you design secure password reset?**

**Short answer:** Random single-use tokens with short expiry, stored hashed, sent to the verified email, generic responses, and invalidating sessions after reset.

**Explanation:** Never reveal whether the email exists.

**Example:** Token valid 15 minutes; after use, all refresh tokens revoked.

**Say it like this:** "Reset tokens are single-use, short-lived and hashed, and a reset logs the user out everywhere."

---

**Q32. How do you implement tenant isolation for security, not just correctness?**

**Short answer:** Tenant from the verified token only, enforced in queries and with database RLS, tenant-aware caches and queues, per-tenant encryption keys if required, and isolation tests.

**Explanation:** Defence in depth because one missed filter is a breach.

**Example:** RLS policies plus an integration test suite that attempts cross-tenant reads on every endpoint.

**Say it like this:** "Isolation is enforced in several independent layers, so one mistake isn't enough to leak data."

---

**Q33. How do you secure webhooks you receive?**

**Short answer:** Verify the HMAC signature on the raw body in constant time, check timestamps to block replays, deduplicate event IDs, and use HTTPS.

**Explanation:** Treat the payload as untrusted even after verification.

**Example:** Twilio signature validation using the full URL and parameters.

**Say it like this:** "Signature, timestamp and event ID: verified, fresh and processed once."

---

**Q34. What is threat modelling, and how do you do it?**

**Short answer:** Systematically listing assets, entry points, trust boundaries and threats (STRIDE), then mitigations, before or during design.

**Explanation:** Lightweight versions work in a one-hour session per feature.

**Example:** For the compliance chat: assets (transcripts), threats (prompt injection, cross-tenant retrieval), mitigations (query filtering, output validation).

**Say it like this:** "I ask what we're protecting, who could attack it and how, then design mitigations before writing code."

---

**Q35. How do you handle dependency vulnerabilities?**

**Short answer:** Lockfiles, automated scanning (Dependabot, Snyk, npm audit, pip-audit), triage by exploitability, and regular updates.

**Explanation:** Not every CVE is reachable; prioritise ones in your code paths.

**Example:** Weekly dependency PRs auto-merged when tests pass for patch versions.

**Say it like this:** "Dependencies are scanned continuously and updated often, so patching is routine rather than an emergency."

---

## 🧩 More Scenarios

**Q36. A developer committed an AWS key to GitHub. What do you do?**

**Short answer:** Revoke and rotate the key immediately, check CloudTrail for misuse, remove it from history, and add secret scanning to prevent recurrence.

**Explanation:** Assume it was found within minutes; bots scan public repos constantly.

**Example:** Deactivate the IAM key, then rotate dependent services to role-based credentials.

**Say it like this:** "Rotate first, investigate second, and then make it impossible with secret scanning and role-based credentials."

---

**Q37. A user reports they can see a deleted colleague's data. What's wrong?**

**Short answer:** Access wasn't revoked: cached permissions, long-lived tokens, or data scoped by role but not by active membership.

**Explanation:** Offboarding must revoke sessions and permissions immediately.

**Example:** Deactivated users kept valid refresh tokens; offboarding now revokes them.

**Say it like this:** "Offboarding must end access instantly: sessions, tokens and cached permissions all get revoked."

---

**Q38. Your login endpoint is under a credential-stuffing attack. What do you do right now?**

**Short answer:** Tighten rate limits per IP and account, add a CAPTCHA or proof-of-work challenge, block abusive ranges at the WAF, force resets for compromised accounts, and alert users.

**Explanation:** Monitor success rates of logins to detect compromised accounts.

**Example:** AWS WAF rate-based rule plus bot control on `/auth/login`.

**Say it like this:** "Slow the attacker down at the edge, protect affected accounts, and add MFA to make stolen passwords useless."

---

## 🏥 Level 4 — Healthcare and PHI

**Q39. What is PHI, and how must a backend protect it?**

**Short answer:** Protected Health Information. Encrypt it in transit and at rest, restrict access by role, audit every access, minimise collection, and keep it out of logs and third parties without agreements.

**Explanation:** HIPAA in the US requires safeguards and Business Associate Agreements with vendors that handle PHI.

**Example:** Audit table rows: who accessed which patient session, when, and from where.

**Say it like this:** "PHI is encrypted everywhere, accessed on a need-to-know basis, every access is audited, and it never leaks into logs, analytics or vendors without an agreement."

---

**Q40. How do you keep PHI out of logs?**

**Short answer:** Structured logging with allowlisted fields, redaction middleware, no request bodies by default, and scrubbing in error trackers.

**Explanation:** Test redaction so it doesn't regress.

**Example:** A pino `redact` config for `req.body.patient*`, `*.ssn` and `authorization` headers.

**Say it like this:** "Logs only contain allowlisted fields. Bodies aren't logged by default, and a test fails if a known PHI field appears in a log line."

---

## 🧩 Level 5 — Scenario-Based

**Q41. You discover an API where changing an ID in the URL returns another tenant's data. What do you do?**

**Short answer:** Treat it as an incident: fix the query scope, check logs for exploitation, notify per policy, add tests for every similar endpoint, and add database-level protection like RLS.

**Explanation:** Also audit all endpoints systematically, because one IDOR rarely comes alone.

**Example:** Add a role × tenant × endpoint test matrix to CI.

**Say it like this:** "Fix it immediately, check whether it was exploited, then make the whole class of bug impossible with scoped queries, RLS and an authorisation test matrix."

---

**Q42. A JWT signing key may have leaked. What do you do?**

**Short answer:** Rotate the key immediately (publish the new key in JWKS, stop accepting the old one), force re-login by revoking refresh tokens, investigate the leak, and review access logs.

**Explanation:** Key IDs (`kid`) make rotation smooth.

**Example:** Remove the compromised `kid` from the JWKS; all tokens signed with it fail verification.

**Say it like this:** "Rotate the key, invalidate every session it signed, then find out how it leaked. kid-based JWKS makes rotation a config change, not a deploy."

---

## 🎯 From Your Resume

**Q43. "Walk me through the backend side of your security audit."**

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

**Q44. "How were JWT and OAuth tokens handled after your fixes?"**

**Short answer:** Describe your real setup: [short-lived access tokens, rotated refresh tokens in HttpOnly cookies, pinned algorithms, audience checks, revocation on logout].

**Explanation:** Explain what was wrong before and why the new design is safer.

**Example:** "Before: long-lived tokens in localStorage. After: 15-minute access tokens and rotating refresh tokens in HttpOnly cookies."

**Say it like this:** "We moved to short-lived access tokens and rotating refresh tokens in HttpOnly cookies, with the algorithm and audience pinned on verification, so a stolen token is short-lived and can't be replayed elsewhere."
