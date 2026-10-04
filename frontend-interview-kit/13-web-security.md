# 13 — Web Fundamentals & Security

Your resume claims a security audit (RBAC, JWT/OAuth, PHI). Expect depth here.

Levels: **🟢 Basic → 🟡 Intermediate → 🔴 Advanced → 🏥 Healthcare/PHI → 🧩 Scenario → 🎯 From Your Resume**

---

## 🟢 Level 1 — Web Basics

**1. What happens when you type a URL and press Enter?**
1) URL parsing, HSTS check. 2) DNS resolution (browser cache → OS → resolver). 3) TCP handshake (or QUIC for HTTP/3). 4) TLS handshake (certificate validation, key exchange). 5) HTTP request with cookies/headers. 6) Server/CDN responds (maybe redirects). 7) Browser parses HTML, discovers CSS/JS/images (preload scanner), builds DOM/CSSOM, runs scripts, layout, paint, composite. 8) Subsequent requests reuse connections.

**2. HTTP vs HTTPS?**
HTTPS = HTTP over TLS: encryption, integrity, server authentication. Required for service workers, camera/mic, HTTP/2 in browsers, secure cookies.

**3. HTTP methods?**
GET (read, safe, idempotent), POST (create/action, not idempotent), PUT (replace, idempotent), PATCH (partial update), DELETE (idempotent), OPTIONS (CORS preflight), HEAD (headers only).

**4. Important status codes?**
200 OK, 201 Created, 204 No Content, 301/308 permanent redirect, 302/307 temporary, 304 Not Modified, 400 Bad Request, 401 Unauthenticated, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Validation error, 429 Too Many Requests, 500 Server Error, 502 Bad Gateway, 503 Unavailable, 504 Gateway Timeout.

**5. 401 vs 403?**
401: who are you? (missing/invalid credentials). 403: I know who you are, but you're not allowed.

**6. Headers you should know?**
Request: `Authorization`, `Cookie`, `Content-Type`, `Accept`, `Origin`, `If-None-Match`. Response: `Set-Cookie`, `Cache-Control`, `ETag`, `Content-Security-Policy`, `Strict-Transport-Security`, `Access-Control-Allow-Origin`, `Retry-After`.

**7. Cookies — attributes?**
`HttpOnly` (JS can't read), `Secure` (HTTPS only), `SameSite=Strict|Lax|None` (cross-site sending rules), `Domain`, `Path`, `Expires/Max-Age`, `Partitioned`. Prefixes `__Host-` (Secure, no Domain, Path=/) and `__Secure-`.

**8. Same-origin policy?**
A page can read responses only from the same scheme + host + port. Protects data across sites. Cross-origin requests may still be *sent* (forms, images) — the response just can't be read.

**9. CORS?**
A server opt-in that relaxes same-origin reads. Simple requests send `Origin`; the server responds with `Access-Control-Allow-Origin`. Non-simple requests (custom headers, JSON content type, PUT/DELETE) trigger a preflight `OPTIONS`. With credentials, `Allow-Origin` must be an explicit origin and `Allow-Credentials: true`.

**10. Is CORS a security feature for your API?**
It protects users' browsers from other sites reading responses. It does **not** protect your API from non-browser clients — you still need authentication and authorization.

**11. REST principles?**
Resources identified by URLs, standard methods, stateless requests, representations (JSON), proper status codes, cacheability.

**12. REST vs GraphQL vs gRPC?**
REST: simple, HTTP caching, multiple endpoints. GraphQL: client selects fields, one endpoint, avoids over/under-fetching, needs query complexity limits and different caching. gRPC: binary protobuf, fast service-to-service, needs gRPC-Web for browsers.

**13. Real-time options?**
Short polling, long polling, Server-Sent Events (server → client over HTTP, auto-reconnect), WebSocket (bidirectional, persistent), WebRTC (peer/SFU media and data over UDP, lowest latency).

**14. SSE vs WebSocket — when?**
SSE for one-way streams (notifications, LLM tokens, job progress) — simple, works through proxies. WebSocket for bidirectional interactive features (chat with typing indicators, collaborative editing).

**15. Authentication vs authorization?**
AuthN: verifying identity. AuthZ: deciding what an identity can do.

---

## 🟡 Level 2 — Intermediate — Common attacks

**16. XSS — types and impact?**
Injecting script into a trusted page. Stored (saved in DB), reflected (from URL/request), DOM-based (client JS writes untrusted data into dangerous sinks). Impact: steal data visible to the user, act as the user, keylog, read non-httpOnly tokens.

**17. XSS defences?**
- Output encoding by default (React/Angular escape text).
- Avoid dangerous sinks: `innerHTML`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `setTimeout(string)`, `javascript:` URLs.
- Sanitize when HTML is required (DOMPurify).
- Content Security Policy (nonce/hash-based).
- Trusted Types to lock down DOM sinks.
- httpOnly cookies for session tokens.
- Validate URLs (`new URL(x)` and allow `https:` only).

**18. Where can XSS still happen in React?**
`dangerouslySetInnerHTML`, `href={userUrl}` with `javascript:`, rendering markdown/LLM output to HTML without sanitization, `ref.current.innerHTML = ...`, third-party widgets, server-injected JSON in `<script>` without escaping `</script>`.

**19. CSRF?**
A malicious site causes the victim's browser to send an authenticated request (cookies attached automatically) to your app.
Defences: `SameSite=Lax/Strict` cookies, CSRF tokens (synchronizer or double-submit), verify `Origin`/`Referer` on state-changing requests, never mutate on GET, re-auth for sensitive actions.

**20. Does using JWT in an Authorization header prevent CSRF?**
Yes — headers aren't attached automatically cross-site. But the token must then be readable by JS, which increases XSS impact. Trade-offs, not a free win.

**21. Clickjacking?**
Your page framed invisibly by an attacker to trick clicks. Defence: `Content-Security-Policy: frame-ancestors 'none'` (or specific origins), `X-Frame-Options: DENY` as legacy.

**22. Open redirect?**
`/login?next=https://evil.com` redirects users to attackers after login. Allow only relative paths or an allowlist.

**23. IDOR / Broken access control?**
Changing an ID in a request (`/api/calls/124`) returns someone else's data because the server didn't check ownership/tenant. The most common serious web vulnerability category. Defence: authorize every request server-side against user + tenant + resource ownership.

**24. Injection (SQL/NoSQL/command)?**
Untrusted input interpreted as code. Defence: parameterized queries/ORM, input validation, least-privilege DB users. Frontend validation is UX only.

**25. Sensitive data exposure in the frontend?**
Secrets in bundles (API keys in env vars shipped to client), verbose error messages, data in URLs (logged by servers/proxies/analytics), sensitive data in localStorage, source maps exposed publicly with internal code.

**26. Security headers checklist?**
`Content-Security-Policy`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(self), microphone=(self), geolocation=()`, `Cross-Origin-Opener-Policy: same-origin`.

**27. Supply-chain security?**
Lockfiles and `npm ci`, Dependabot/Renovate, `npm audit`/Snyk, review new dependencies (maintainers, size, install scripts), pin versions for critical packages, Subresource Integrity for CDN scripts, minimal third-party scripts on sensitive pages.

---

## 🟡 Intermediate — Authentication & Authorization

**28. Session cookies vs tokens (JWT)?**
Sessions: server stores session, browser holds an opaque id in an httpOnly cookie — easy revocation. JWT: self-contained signed claims — stateless verification, harder revocation, larger. Many systems use short-lived JWT access tokens + server-tracked refresh tokens.

**29. JWT structure and validation?**
`header.payload.signature`, base64url-encoded. Signed (JWS), not encrypted — anyone can read the payload. Validate: signature with expected algorithm (reject `alg: none`, don't let the token choose), `exp`, `nbf`, `iss`, `aud`. Keep payload minimal (no PHI).

**30. Where to store tokens in a browser?**
| Option | XSS impact | CSRF exposure | Notes |
|---|---|---|---|
| localStorage/sessionStorage | token readable & stealable | none | avoid for sensitive apps |
| httpOnly Secure cookie | can't be read (XSS can still send requests while page open) | needs SameSite + CSRF defence | strong default |
| memory (JS variable) + httpOnly refresh cookie | lost on reload, re-fetched via refresh | refresh endpoint needs CSRF protection | common SPA pattern |
| BFF (server keeps tokens) | browser holds session cookie only | SameSite + CSRF | best for high-sensitivity (healthcare) |

**31. Refresh token rotation?**
Every refresh returns a new refresh token and invalidates the old one. If an old token is reused, revoke the whole token family (detects theft).

**32. Handling token expiry with concurrent requests?**
Single-flight refresh: first 401 triggers refresh; others wait on the same promise; retry once; logout on failure.
```ts
let refreshing: Promise<void> | null = null;
export async function authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const run = () => fetch(input, { ...init, credentials: 'include' });
  let res = await run();
  if (res.status !== 401) return res;
  refreshing ??= fetch('/auth/refresh', { method: 'POST', credentials: 'include' })
    .then(r => { if (!r.ok) throw new Error('refresh failed'); })
    .finally(() => { refreshing = null; });
  try { await refreshing; } catch { logout(); throw new Error('Session expired'); }
  return run();
}
```

**33. OAuth 2.0 roles and flows?**
Roles: resource owner (user), client (your app), authorization server (IdP), resource server (API). Flows: Authorization Code + PKCE (SPAs, mobile, server apps), Client Credentials (service-to-service), Device Code (TVs/CLI). Implicit and password grants are deprecated.

**34. PKCE — how does it work?**
Client creates a random `code_verifier`, sends `code_challenge = SHA256(verifier)` with the auth request; when exchanging the code, it sends the verifier. Stolen authorization codes are useless without the verifier.

**35. OIDC vs OAuth?**
OAuth = delegated authorization (access tokens for APIs). OIDC = identity layer on top (ID token with user claims, `/userinfo`, discovery). Validate `state` (CSRF), `nonce` (replay) and ID token claims.

**36. SSO and SAML?**
SSO lets users log in once across apps via an IdP (Okta, Azure AD). SAML is XML-based (enterprise legacy); OIDC is JSON/JWT-based.

**37. RBAC vs ABAC vs ReBAC?**
RBAC: permissions via roles (admin, QA, agent). ABAC: policies on attributes (tenant, department, time, resource owner). ReBAC: relationships (user is member of team that owns call). Real systems combine RBAC with tenant/ownership checks.

**38. Frontend's role in authorization?**
Hide or disable UI the user can't use (UX), route guards, permission-aware components. **Never** the enforcement point — the API checks every request. Third-party tokens (e.g., LiveKit) should carry scoped grants (room, canPublish, canSubscribe).

**39. MFA and passkeys?**
MFA adds a factor (TOTP, push, WebAuthn). Passkeys (WebAuthn) are phishing-resistant public-key credentials bound to the origin.

**40. Session management best practices?**
Short idle timeout for sensitive apps, absolute timeout, re-auth for critical actions, logout invalidates server session/refresh token, clear client caches, sync logout across tabs.

---

## 🔴 Level 3 — Advanced

**41. Designing a strict CSP?**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}' 'strict-dynamic';
  style-src 'self' 'nonce-{random}';
  img-src 'self' data: https://cdn.example.com;
  connect-src 'self' https://api.example.com wss://livekit.example.com;
  media-src 'self' blob:;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'none';
  form-action 'self';
  report-to csp-endpoint;
```
Roll out with `Content-Security-Policy-Report-Only`, fix violations, then enforce. Avoid `'unsafe-inline'` and `'unsafe-eval'`.

**42. Trusted Types?**
`require-trusted-types-for 'script'` makes DOM XSS sinks accept only typed values created by approved policies — eliminates whole classes of DOM XSS.

**43. Subresource Integrity (SRI)?**
`<script src="https://cdn/x.js" integrity="sha384-..." crossorigin="anonymous">` — browser refuses modified files.

**44. COOP/COEP/CORP and cross-origin isolation?**
Cross-Origin-Opener-Policy isolates your window from cross-origin popups; Cross-Origin-Embedder-Policy + CORP enable `crossOriginIsolated` (required for `SharedArrayBuffer`, precise timers). Also mitigates Spectre-style leaks.

**45. postMessage security?**
Validate `event.origin` against an allowlist, validate message schema, never use `'*'` as targetOrigin for sensitive data.

**46. Prototype pollution?**
Merging untrusted JSON (`__proto__`, `constructor.prototype`) into objects modifies all objects. Use safe merge utilities, `Object.create(null)`, schema validation, freeze prototypes in sensitive contexts.

**47. ReDoS?**
Catastrophic backtracking regexes on user input freeze the main thread/server. Avoid nested quantifiers, limit input length, use safe regex libraries.

**48. Securing file uploads?**
Pre-signed URLs with size/type limits, server-side content validation (don't trust extension/MIME), malware scanning, store outside web root, serve with `Content-Disposition: attachment` and correct type, no inline rendering of user HTML/SVG from your main origin.

**49. Rate limiting and abuse prevention?**
Per user/IP/tenant limits, 429 with `Retry-After`, CAPTCHA/bot detection on public forms, cost limits on LLM endpoints.

**50. Security of source maps and error tracking?**
Upload source maps privately to Sentry instead of serving them publicly; scrub PII/PHI before sending events.

**51. Secure LLM integrations?**
Keys only server-side; prompt injection awareness (treat model output as untrusted, restrict tool permissions); sanitize rendered output; don't send unnecessary sensitive data to providers; data retention agreements; per-tenant rate limits and logging without sensitive content.

**52. OWASP Top 10 (know the categories)?**
Broken access control, cryptographic failures, injection, insecure design, security misconfiguration, vulnerable/outdated components, identification & authentication failures, software & data integrity failures, logging & monitoring failures, SSRF. (Category names may shift between editions.)

**53. Threat modelling for a feature?**
Identify assets (PHI, recordings, tokens), actors (patient, provider, interpreter, admin, attacker), entry points (APIs, webhooks, uploads, LiveKit), data flows; STRIDE (Spoofing, Tampering, Repudiation, Information disclosure, DoS, Elevation of privilege); prioritise mitigations.

**54. Security testing in the pipeline?**
SAST (CodeQL, Semgrep), dependency scanning, secret scanning, DAST (OWASP ZAP), authorization test matrix, periodic penetration tests.

---

## 🏥 Healthcare / PHI (your domain)

**55. What is PHI and what regulations apply?**
Protected Health Information — health data linked to an identifiable person (names, DOB, MRNs, appointment details, contents of medical conversations, recordings). In the US, HIPAA governs it; other regions have their own laws (e.g., GDPR treats health data as special category). Know the basics, don't overclaim legal expertise.

**56. Frontend rules for PHI?**
- No PHI in localStorage/sessionStorage/IndexedDB/service-worker caches.
- No PHI in URLs, page titles, analytics events, logs or error reports.
- Session timeout and auto-logout on idle; clear caches on logout.
- Mask sensitive fields where appropriate; avoid PHI in push notifications/lock screens.
- No third-party trackers on PHI screens.
- TLS everywhere; secure cookies.
- Audit logging of access (server-side).

**57. Sentry/monitoring with PHI?**
`sendDefaultPii: false`, `beforeSend`/`beforeBreadcrumb` scrubbing, disable or fully mask session replay, avoid console breadcrumbs with data, vendor data-processing agreements.

**58. Recordings and transcripts?**
Encrypted at rest, access via short-lived signed URLs, role-based access, audit trail of who viewed/downloaded, retention policies, consent captured before recording.

**59. LiveKit/WebRTC security?**
Short-lived access tokens with minimal grants per role, room names without PHI, DTLS-SRTP encryption by default in transit, consider E2EE where required, TURN over TLS, server-side webhooks validated.

---

## 🧩 Level 4 — Scenario-based

**60. A pentest found JWTs in localStorage. What do you change?**
Move to httpOnly Secure SameSite cookies or BFF pattern; short-lived access tokens; refresh rotation; add CSP to reduce XSS risk; migrate users by issuing new cookies on next login; remove old tokens from storage.

**61. Agents can see other teams' calls by changing the URL.**
IDOR — add server-side authorization checks by tenant/team/ownership on every endpoint; write automated authorization tests (role × endpoint × tenant matrix); audit logs to check if it was exploited.

**62. Marketing wants a third-party chat widget on the patient dashboard.**
Assess data the widget can access (same-origin script can read the page). Prefer isolating it in a sandboxed iframe or keep it off PHI pages; CSP allowlist; vendor agreement.

**63. LLM-rendered summaries show raw HTML from transcripts.**
Sanitize model output (DOMPurify), render markdown with a safe renderer, strip links or add `rel="noopener noreferrer"`, test with injection payloads.

**64. A user reports being logged out in one tab but still active in another.**
Broadcast logout via BroadcastChannel/storage event; server invalidates refresh token; other tabs detect 401 and redirect.

**65. You must allow embedding your app in a partner's portal.**
`frame-ancestors https://partner.example`, SameSite=None; Secure cookies (or token handoff), postMessage with origin checks, clickjacking review.

**66. Error tracking captured patient names in breadcrumbs.**
Purge events from vendor, add scrubbing rules, review logging code, add tests/linters to prevent logging PHI, incident documentation.

---

## 🎯 From Your Resume

**67. "Walk me through your security audit."**
Scope (React app, FastAPI APIs, auth, storage) → threat model with roles and data flows → checklist (OWASP ASVS-style) → test each endpoint with each role/tenant → review token lifecycle and storage → search for PHI in logs, storage and analytics → severity rating → fixes with regression tests → re-audit. Have three concrete findings ready with problem → impact → fix.

**68. "What were the 8 critical issues?"**
Only describe real ones you worked on. Typical categories to map them to: UI-only RBAC, missing tenant scoping (IDOR), tokens in localStorage, no refresh rotation/revocation, long-lived tokens, PHI in logs/Sentry, PHI in browser storage, missing security headers.

**69. "What does 'cut findings by 85%' mean exactly?"**
State the measurement: e.g., number of open findings (or severity-weighted) in re-audit vs initial audit. Be ready to say which remain and why.

**70. "How did you handle RBAC in FastAPI and React together?"**
Server: permission dependency/decorator on each route checking role + tenant + ownership. Client: permission map drives navigation/route guards/button visibility, generated from the same permission list. Tests: authorization matrix.

**71. "How are LiveKit tokens secured?"**
Generated server-side per user per room with expiry and minimal grants (interpreter can publish; observer only subscribe), never constructed on the client, room names opaque.
