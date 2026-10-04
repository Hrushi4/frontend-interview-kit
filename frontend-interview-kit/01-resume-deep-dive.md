# 01 — Resume Deep-Dive: What They'll Ask You

Senior interviews spend 30–50% of the time on *your* bullets. Every number you wrote is a question waiting to happen.

**How this file is organised**

- **Part A — Understand the topic:** why resume grilling happens, what interviewers look for, and a method to prepare each bullet.
- **Part B — Questions with sample answers:** Opening → InterpretIQ → Security audit → Self-hosted LiveKit → BpoBox → AI scoring and SSE → Testing and mentoring → Earlier roles → Skills probes.
- **Part C — Resume fixes, ATS tips and how to stand out.**

The sample answers use the facts on your resume. Anything in **[square brackets]** must be replaced with your real detail, or removed. **Never say a number you can't explain.**

---

## Part A — Understand the Topic

### Why interviewers grill your resume

For a senior role, *what you've already done* is the strongest evidence of what you'll do next. Interviewers pick a bullet and go deeper and deeper ("the follow-up chain") to find out:

1. **Did you really do it, or did your team?** They want your personal contribution.
2. **Do you understand it deeply?** Can you draw the architecture and explain the trade-offs?
3. **Are your numbers real?** How was "99% reconnect success" measured, and against what baseline?
4. **Do you reflect?** What would you do differently now?

A candidate who explains three bullets in real depth beats one who lists ten impressive bullets but stays vague.

### The 5-question preparation method for every bullet

For every bullet, prepare answers to these five questions:

1. **What** was the problem, and who was affected?
2. **What exactly did I do**, as opposed to the team?
3. **How did it work** technically? (Practise drawing it.)
4. **How was the number measured?** The baseline, the method and the time window.
5. **What would I do differently** now?

Then prepare three lengths: a **60-second version**, a **5-minute version**, and answers to the likely follow-up chain below.

**Rule:** If a number was projected, estimated or came from a load test, *say so*. Precision builds trust, and inflated numbers lose offers.

### A full example of the follow-up chain

> **Interviewer:** "You mention 99% reconnect success. What does that mean?"
> **You:** "Of all the times a call entered a reconnecting state, 99% recovered within [10] seconds without the user doing anything, measured over [the last quarter] from our client telemetry."
> **Interviewer:** "How does reconnection work?"
> **You:** "When the network changes, WebRTC needs an ICE restart. LiveKit first tries to resume the session. If that fails, it does a full reconnect. On the frontend, I kept the Room object outside React state, showed a non-blocking banner, and didn't unmount the video elements."
> **Interviewer:** "What about the other 1%?"
> **You:** "Mostly restrictive hospital networks blocking UDP. We added TURN over TLS on port 443, and after N failed attempts we show a clear Rejoin button."
> **Interviewer:** "What would you change?"
> **You:** "I'd formalise the call lifecycle as an XState machine. Our reducer worked, but edge cases were hard to see."

That's the depth to aim for on every bullet.

---

## Part B — Questions with Sample Answers

Each question has four parts: **Short answer** (the key message to say first), **Explanation** (what the interviewer is checking and what to cover), **Example** (the detail, metric or diagram to use) and **Say it like this** (a full sample answer). Replace anything in **[square brackets]** with your real details.

## 🟢 Opening Questions

**Q1. Walk me through your resume.**

**Short answer:** Two minutes, reverse chronological, focused on the last two years, ending with why you're interviewing.

**Explanation:** They're checking communication and whether your story fits the role. Spend most of the time on your current role, give one or two numbers per role, and finish with a forward-looking reason.

**Example:** Current role (InterpretIQ, BpoBox, the audit, mentoring) → Arcitech 2023–2025 (AI products) → LTIMindtree (airline widgets) → Slaylink (full stack) → what you want next.

**Say it like this:** "I'm currently a Senior Software Engineer at Arcitech in Mumbai. I own the frontend architecture for two products. InterpretIQ is a WCAG-compliant medical interpretation PWA with real-time LiveKit video. I brought join time under 5 seconds and reconnect success to 99% for up to 150 concurrent sessions. BpoBox is a multi-tenant AI QA platform for call centres, with 5 tenants and 1,500 users. Our role-based portals and AI scoring cut QA review time by 60%. I also led a security audit that found 8 critical issues, and I set testing standards across 15 developers.

Before that, from 2023 to 2025, I was a Software Engineer at Arcitech building AI products: an interview platform, a Revit design-compliance checker where I was frontend lead, and an education platform. Earlier, at LTIMindtree, I built booking and profile features and embeddable widgets for a major North American airline, using React, Redux and GraphQL. I started at Slaylink as a full-stack developer with Next.js and NestJS.

I'm now looking for a role where I can [own frontend architecture at a larger scale / the JD's core problem]."

---

**Q2. What's the most complex thing you've built?**

**Short answer:** The real-time video layer of InterpretIQ, where reliability on hospital networks was the hard part.

**Explanation:** Pick one system, say why it was hard (constraints and stakes), what you specifically did, and the measurable result.

**Example:** Three-way video on hospital Wi-Fi and tablets; a state machine for the call lifecycle; resume-first reconnects; the Room object kept outside React state.

**Say it like this:** "The real-time video layer of InterpretIQ. It's three-way video (patient, provider, interpreter), often on hospital Wi-Fi and tablets, and a dropped call delays care. The hardest part was reliability: modelling the call lifecycle as a state machine, a resume-first reconnect strategy, and keeping the LiveKit Room object outside React state so re-renders could never break the connection. The result was 99% reconnect success and joins under 5 seconds."

---

**Q3. Which of your two products do you spend more time on, and why?**

**Short answer:** The one with the highest risk, while keeping the other moving through delegation.

**Explanation:** This tests prioritisation and ownership across products. Give a clear principle, not "both equally".

**Example:** InterpretIQ, because real-time reliability and healthcare compliance carry the highest risk; BpoBox features are delegated with architecture reviews.

**Say it like this:** "Currently [InterpretIQ], because [real-time reliability and healthcare compliance carry the highest risk]. I keep BpoBox moving by delegating well-defined features and focusing my time there on architecture and reviews."

---

**Q4. You were promoted from Software Engineer to Senior within Arcitech. What changed in your responsibilities?**

**Short answer:** From building features to owning architecture, cross-cutting reliability and security, and mentoring.

**Explanation:** They want evidence that the title reflects real scope. Name three concrete changes.

**Example:** Architecture decisions (Redux, LiveKit, PWA), the security audit, and testing standards for 15 developers.

**Say it like this:** "Three things. First, I went from building features to owning architecture: decisions like Redux for session state, LiveKit, and the PWA approach. Second, I took on cross-cutting responsibility for security and reliability, which led to the audit. Third, mentoring: I set the testing standards and supported 15 developers."

---

**Q5. Your title says Senior Software Engineer, but most of your work is frontend. Are you frontend or full-stack?**

**Short answer:** Frontend-focused, with full-stack ownership where reliability needed it. Adjust the emphasis to the job description.

**Explanation:** Be honest and specific about your backend work rather than claiming to be equally strong everywhere.

**Example:** FastAPI permission checks, the AWS design for self-hosted LiveKit, NestJS features at Slaylink.

**Say it like this:** "Frontend-focused, with full-stack ownership where reliability needed it. I own the React architecture end to end, and I've worked in FastAPI on permission checks, designed the AWS infrastructure for self-hosted LiveKit, and built backend features with NestJS earlier in my career."

---

## 🎯 InterpretIQ (React 19, TypeScript, Redux, WCAG PWA, LiveKit)

**Q6. Walk me through the InterpretIQ frontend architecture.**

**Short answer:** Roles → PWA shell with role-gated routes → Redux for session and call state, a query layer for server data → a LiveKit provider holding the Room in a ref → accessibility built in → Sentry with PHI scrubbing.

**Explanation:** Go from users to shell to state to the real-time layer to cross-cutting concerns, and end with one trade-off you'd revisit. That shows you think critically about your own work.

**Example:**

```text
Users: patient · provider · interpreter · admin
PWA shell (offline app shell, role-gated routes; server enforces permissions)
 ├─ Redux: session + call state        ├─ Query layer: history, profiles
 └─ LiveKitProvider (Room in a ref) → ParticipantTile (own tracks only)
Cross-cutting: WCAG 2.1 AA · live regions · Sentry (PHI scrubbed)
```

**Say it like this:** "There are three main roles: patient, provider and interpreter, plus admins. The app is a PWA, installable on clinic tablets, with an offline app shell. Routes are gated by role, with the server enforcing every permission. Shared session and call state lives in Redux, while server data like history and profiles goes through a query layer. The real-time layer wraps the LiveKit client in a provider that holds the Room in a ref, and each participant tile subscribes only to its own tracks. Accessibility is built in at the component level: WCAG 2.1 AA, keyboard controls, and live-region announcements. Sentry handles errors with PHI scrubbing. If I did it again, I'd model the call lifecycle with XState and add a BFF so tokens never touch the browser."

---

**Q7. Who are the users, and what is the core flow?**

**Short answer:** Providers or patients request an interpreter, the system matches one, and all three join a video call after a device check.

**Explanation:** Describe the real flow in a few steps; interviewers use it to anchor later questions.

**Example:** Request → match → pre-join device check → three-way call → summary.

**Say it like this:** "[A provider or patient requests interpretation in a language → the system matches an available interpreter → everyone joins a three-way video call after a device check → the session ends with a summary.]" *(Describe the real flow.)*

---

**Q8. What does "access-gated" mean in your app, and how is it enforced?**

**Short answer:** The UI gates routes by role for usability, but real enforcement is on the server, including role-scoped LiveKit tokens.

**Explanation:** The interviewer is checking that you know frontend checks are not security.

**Example:** An interpreter's LiveKit token allows publishing; an observer's allows subscribing only.

**Say it like this:** "On the frontend: route guards, role-aware UI, and handling token refresh. But the real enforcement is on the server. Every API checks the role and the resource access, and LiveKit tokens are generated on the server with role-scoped grants. An interpreter can publish, an observer can only subscribe. The frontend gating is for UX only."

---

**Q9. "150 concurrent sessions": was that a production peak or a load test? How was it measured?**

**Short answer:** State the source honestly: production peak or load test, and which tool measured it.

**Explanation:** Every number on your resume will be probed. Know its source, time window and definition.

**Example:** "LiveKit server metrics in Grafana, peak over [March]" or "a LiveKit load test with [N] simulated participants".

**Say it like this:** "[It was our production peak / a load test], measured from [LiveKit server metrics in Grafana / the load-testing tool] over [a time window]."

---

**Q10. "99% reconnect success": how do you define it?**

**Short answer:** The share of reconnecting events that recovered within N seconds without user action, over a defined period.

**Explanation:** A metric needs a numerator, a denominator and a time window. Saying this clearly signals credibility.

**Example:** Numerator: `Reconnected` within [N] s. Denominator: all `Reconnecting` events in client telemetry over [period].

**Say it like this:** "The percentage of reconnecting events that reached reconnected within [N] seconds, without the user doing anything, over [a period]. The denominator is all reconnecting events recorded in our client telemetry."

---

**Q11. How does reconnection work in WebRTC and LiveKit?**

**Short answer:** A network change breaks ICE; LiveKit tries to resume with an ICE restart, then falls back to a full reconnect, while the UI stays mounted and shows a banner.

**Explanation:** Cover the protocol level (ICE restart, full rejoin, TURN fallback) and the frontend level (state outside components, non-blocking UI, fresh tokens).

**Example:**

```text
Connected → (network drop) → Reconnecting → resume (ICE restart) → Connected
                                      └─ fail → full rejoin (fresh token, backoff) → Connected
```

**Say it like this:** "A network change, like switching from Wi-Fi to 4G, breaks the ICE connection. LiveKit first tries to *resume*: an ICE restart on the same session. If that fails, it does a full reconnect. On the frontend I keep the room state outside components, show a non-blocking 'Reconnecting…' banner, avoid unmounting the video elements, re-subscribe to tracks, fetch a fresh token if needed, and rely on TURN over TLS as a fallback for restrictive networks like hospitals."

---

**Q12. "Join latency under 5 seconds": measured from where to where?**

**Short answer:** From clicking Join to the first remote video frame, measured with User Timing marks.

**Explanation:** Define the start and end points, then explain what you changed and why it helped.

**Example:**

```ts
performance.mark('join-click');
room.once(RoomEvent.TrackSubscribed, () => {
  performance.measure('join-to-first-video', 'join-click');
});
```

**Say it like this:** "From clicking Join to the first remote video frame rendering, measured with User Timing marks. What I optimised: prefetching the token on the pre-join screen, warming up camera permissions there, lazy-loading the SDK before the click, connecting to the nearest region, and removing serial API calls before connecting."

---

**Q13. Why a PWA? What's cached?**

**Short answer:** Shared clinic tablets benefit from installation and an offline shell; only static assets are cached, never PHI.

**Explanation:** Show you made a deliberate caching decision with security in mind, and handled updates safely.

**Example:** A "New version available — reload" prompt instead of a silent update in the middle of a call.

**Say it like this:** "Clinics use shared tablets, so being installable, reloading fast and having an offline app shell matter. The service worker caches only static assets and the app shell, **never** PHI or authenticated API responses. When a new version is deployed, users see a 'New version available — reload' prompt instead of a silent update mid-call."

---

**Q14. WCAG compliance: which level, and how was it verified?**

**Short answer:** WCAG 2.1 AA, verified with axe in CI, Lighthouse, and manual keyboard and screen-reader testing.

**Explanation:** Name the level, what it covered, how you verified it, and a real bug you found. Real bugs make the claim credible.

**Example:** A reconnect banner that wasn't announced because its live region was created at the same time as its text.

**Say it like this:** "WCAG 2.1 AA. That covers keyboard operation, focus management, live regions for call events, captions and transcripts, contrast and reduced motion. We verified it with axe in CI and Lighthouse, plus manual keyboard and screen-reader passes on the critical flows. One real bug I fixed: [the reconnect banner appeared visually but was never announced, because its live region was created at the same moment as the text. Rendering the region on load fixed it]."

---

**Q15. Why Redux here instead of Context or Zustand?**

**Short answer:** Session and call state is shared across many screens with complex transitions; Redux gave selector subscriptions, DevTools and structure for a growing team.

**Explanation:** Show you know the alternatives and chose deliberately, including what stayed out of the store.

**Example:** Non-serializable LiveKit objects stayed outside Redux in a ref.

**Say it like this:** "The session and call state is shared across many screens (the waiting room, the call and the post-call summary) and has complex, predictable transitions. Redux gave us selector-based subscriptions, so components re-render only for their slice, plus DevTools to replay tricky session flows. Non-serializable LiveKit objects stayed outside the store. Zustand would also have worked. Redux's structure suited a growing team."

---

**Q16. How did you avoid re-rendering the whole grid when the speaking indicator changes?**

**Short answer:** Per-tile subscriptions, memoised tiles, and audio levels written to a CSS variable in rAF instead of React state.

**Explanation:** High-frequency values (many times per second) shouldn't go through React state.

**Example:**

```ts
useEffect(() => {
  let id = 0;
  const loop = () => { ref.current?.style.setProperty('--level', String(participant.audioLevel)); id = requestAnimationFrame(loop); };
  loop();
  return () => cancelAnimationFrame(id);
}, [participant]);
```

**Say it like this:** "Each tile subscribes to its own participant's events, tiles are memoized and keyed by participant ID, and audio levels never enter React state. A `requestAnimationFrame` loop reads the level and sets a CSS variable through a ref, so the speaking ring animates without any React re-render."

---

**Q17. What happens when camera or microphone permission is denied?**

**Short answer:** Explain how to fix it, offer audio-only or listen-only, and provide Retry.

**Explanation:** Good error handling keeps users in the flow instead of blocking them.

**Example:** Different messages for `NotAllowedError` (permission denied) and `NotFoundError` (no device).

**Say it like this:** "We show a clear explanation with browser-specific steps to re-enable it, offer to join audio-only or without video, and provide a Retry button. If no device is found at all, the user can still join and listen."

---

**Q18. How do you test a video feature?**

**Short answer:** Unit tests for the state machine and hooks, Playwright with fake media devices, and manual testing on real devices and throttled networks.

**Explanation:** Real-time features need several layers of testing because simulators don't catch everything.

**Example:** `chromium --use-fake-device-for-media-stream --use-fake-ui-for-media-stream` in the Playwright config.

**Say it like this:** "Unit tests for the state machine and hooks. Playwright end-to-end tests with Chrome's fake media devices (`--use-fake-device-for-media-stream`). Manual testing on the actual target tablets and networks, plus network throttling to simulate drops."

---

**Q19. What would you change in InterpretIQ's architecture now?**

**Short answer:** A formal state machine for the call lifecycle, a BFF so tokens stay on the server, and earlier telemetry dashboards.

**Explanation:** Self-critique shows seniority. Give reasons for each change.

**Example:** Some edge cases (reconnecting while ending a call) were implicit in the reducer.

**Say it like this:** "Two things. A formal state machine (XState) for the call lifecycle, because some edge cases were implicit in our reducer. And a BFF, so tokens stay on the server, which is better for PHI security. I'd also invest earlier in telemetry dashboards for join time and reconnects."

---

## 🔐 Security and Reliability Audit (React + FastAPI)

**Q20. Why did you start the audit? Was it assigned?**

**Short answer:** It wasn't assigned; I saw the risk of growing access control in an app handling PHI and proposed a scoped review.

**Explanation:** This is an ownership story. Show that you raised it properly and took responsibility.

**Example:** Raised with [your lead/the CTO] with a short proposal and scope.

**Say it like this:** "It wasn't formally assigned. We were handling PHI, and access control had grown organically as features shipped. I raised it with [my lead/the CTO], proposed a scoped review, and took ownership of it."

---

**Q21. What was your process?**

**Short answer:** Threat model, OWASP-style checklist, testing every endpoint as every role, reviewing tokens, scanning for PHI, then fixes with regression tests and a re-audit.

**Explanation:** A clear, repeatable process is what makes the audit believable.

**Example:** A spreadsheet of endpoint × role × tenant with expected and actual results.

**Say it like this:** "I built a threat model (roles, data flows, where PHI lives), then worked through an OWASP-style checklist. I tested every endpoint as every role and tenant, reviewed the token lifecycle and storage, and scanned logs, browser storage and analytics for PHI. Each finding got a severity rating and a fix with a regression test, and then we re-audited."

---

**Q22. Describe three of the 8 critical issues.**

**Short answer:** For each one: problem → impact → fix → how you prevented a regression. Use only your real findings.

**Explanation:** Typical categories: RBAC enforced only in the UI, missing tenant or ownership checks (IDOR), JWTs in localStorage, long-lived tokens with no rotation, PHI in logs, Sentry or browser storage.

**Example:**

1. **RBAC enforced only in the UI.** Hidden buttons, but the API accepted the request from any role. *Impact:* any logged-in user could call admin endpoints. *Fix:* a permission dependency on every FastAPI route. *Prevention:* a role-by-endpoint test matrix in CI.
2. **Tokens in localStorage.** *Impact:* any XSS could steal sessions. *Fix:* HttpOnly, Secure, SameSite cookies with short-lived access tokens and refresh rotation. *Prevention:* a lint rule and a code-review checklist item.
3. **PHI in error reports.** Sentry breadcrumbs captured form inputs. *Impact:* patient data at a third party. *Fix:* `beforeSend` and `beforeBreadcrumb` scrubbing, and session replay disabled. *Prevention:* scrubbing tests and a vendor review.

**Say it like this:** "The first was RBAC enforced only in the UI: the buttons were hidden, but the API accepted requests from any role, so we added a permission dependency on every route and a role-by-endpoint test matrix. The second was tokens in localStorage, which we moved to HttpOnly cookies with short-lived tokens. The third was PHI in Sentry breadcrumbs, fixed with scrubbing in `beforeSend` and tests to keep it scrubbed."

---

**Q23. "Cut findings by 85%": 85% of what?**

**Short answer:** Open findings in the re-audit compared with the initial audit, with the remaining items owned and lower severity.

**Explanation:** Say whether it was a raw count or weighted by severity, and what remained.

**Example:** [X] findings → [Y] findings; remaining: [security headers through the CDN config].

**Say it like this:** "The number of open findings in the re-audit compared with the initial audit: [X down to Y]. [It was a raw count / weighted by severity.] The remaining items were lower severity, with owners and dates. For example, [adding security headers through the CDN config]."

---

**Q24. Where should tokens be stored in a browser?**

**Short answer:** Ideally not in JavaScript-readable storage: a BFF, or HttpOnly, Secure, SameSite cookies; never localStorage.

**Explanation:** The trade-off is XSS risk against CSRF risk. Cookies need SameSite plus CSRF protection. (See Web Security Q30.)

**Example:** Best to worst: BFF session cookie → HttpOnly cookies → access token in memory plus refresh token in an HttpOnly cookie → localStorage (never).

**Say it like this:** "Ideally not in JavaScript-readable storage at all. Options, from best to worst for a healthcare app: a BFF that holds the tokens, so the browser only has a session cookie; HttpOnly, Secure, SameSite cookies; an access token in memory with a refresh token in an HttpOnly cookie. Never localStorage. The trade-off is XSS risk against CSRF risk, and cookies need SameSite plus CSRF protection."

---

**Q25. How did you implement RBAC across FastAPI and React?**

**Short answer:** A permission dependency on every FastAPI route for real enforcement, the same permission list driving the UI, and an authorisation test matrix.

**Explanation:** Show the separation: server enforces, client reflects, tests prove.

**Example:**

```python
@router.get("/calls/{call_id}")
def get_call(call_id: str, user = Depends(require_permission("calls:read"))):
    call = repo.get(call_id)
    if call.tenant_id != user.tenant_id: raise HTTPException(404)
    return call
```

**Say it like this:** "On the server, a permission dependency on each route checks the role, the tenant and ownership. That's the real enforcement. On the client, the same permission list drives navigation, route guards and button visibility. In tests, an authorisation matrix runs every role against every endpoint."

---

**Q26. How do you keep PHI out of logs and error tracking?**

**Short answer:** Scrub in Sentry's `beforeSend`, keep PHI out of URLs, titles and analytics, mask or disable session replay, and check logging in code review.

**Explanation:** PHI leaks through many side channels, not just the database, so each channel needs a control.

**Example:**

```ts
Sentry.init({
  beforeSend(event) { delete event.request?.data; event.user = { id: event.user?.id }; return event; },
  beforeBreadcrumb: (b) => (b.category === 'ui.input' ? null : b),
});
```

**Say it like this:** "Sentry `beforeSend` scrubbing, no PHI in URLs, page titles or analytics events, session replay disabled or fully masked, and a code-review checklist item for logging."

---

**Q27. Did you work with backend developers on the fixes? How did you get buy-in?**

**Short answer:** Yes. I showed concrete reproductions, explained impact in patient-data terms, and paired on the first fixes.

**Explanation:** This tests influence without authority. A demonstrated exploit beats a ticket.

**Example:** Changing a call ID in a request and receiving another patient's call.

**Say it like this:** "Yes. I didn't just file tickets. I showed each issue with a concrete reproduction (like changing a call ID in a request), explained the impact in patient-data terms, and paired with them on the first fixes. Seeing the exploit made prioritisation easy."

---

**Q28. How do you stop these issues coming back?**

**Short answer:** Automated authorisation tests, lint rules, a security checklist in PRs, periodic re-audits, and dependency and secret scanning.

**Explanation:** One-off audits decay; automation keeps the fixes in place.

**Example:** A CI job that fails if any endpoint returns 200 for a role that shouldn't access it.

**Say it like this:** "Automated authorisation tests in CI, lint rules (for example, banning localStorage for tokens), a security checklist in the PR template, periodic re-audits, and dependency and secret scanning in CI."

---

## ☁️ Self-Hosted LiveKit on AWS

**Q29. Why consider self-hosting instead of LiveKit Cloud?**

**Short answer:** Cost at our usage level, data control for compliance, and customisation, traded against the operational burden.

**Explanation:** Always present both sides; it shows business judgement.

**Example:** Managed pricing grows linearly with minutes; self-hosting is mostly fixed infrastructure plus people's time.

**Say it like this:** "Cost at our usage level, data control for compliance, and the ability to customise. The trade-off is the operational burden: on-call, upgrades, patching and capacity planning."

---

**Q30. How was the "40% cost reduction" projected?**

**Short answer:** A cost model comparing managed pricing with EC2, data transfer and engineering time, based on stated assumptions. It's a projection.

**Explanation:** Never present a projection as an achieved saving.

**Example:** Assumptions: [monthly minutes], [server utilisation %], [hours per month of operations].

**Say it like this:** "With a cost model: managed per-minute and bandwidth pricing compared against EC2, data transfer and the engineering time to operate it. It rests on assumptions about usage growth and server utilisation. It's a projection, and I always present it as one."

---

**Q31. Draw the architecture.**

**Short answer:** SFU nodes on EC2, Redis for routing, a load balancer for signalling, TURN over TLS, autoscaling, and Prometheus and Grafana.

**Explanation:** Draw from the client inwards and mention deployment and monitoring.

**Example:**

```text
Clients ──WSS──▶ Load balancer ──▶ LiveKit SFU nodes (EC2, host networking, UDP range)
   │                                     │
   └──TURN/TLS :443 (restrictive nets)   └── Redis (room routing)
Autoscaling (CPU, participants) · Prometheus + Grafana · CI-built Docker images, drain-then-replace deploys
```

**Say it like this:** "SFU nodes on EC2 with host networking and an open UDP port range. Redis for routing rooms across nodes. A load balancer for WSS signalling. TURN over TLS on port 443 for restrictive networks. Autoscaling on CPU and participant count. Prometheus and Grafana for monitoring and alerts. Docker images built in CI, and rolling deploys that drain rooms before replacing a node."

---

**Q32. What does "support 10x traffic" rest on?**

**Short answer:** Horizontal scaling of SFU nodes, to be validated with load tests.

**Explanation:** Explain what you'd measure to confirm it rather than just asserting it.

**Example:** CPU, bandwidth and packet loss per node at increasing participant counts, to find the saturation point.

**Say it like this:** "Horizontal scaling of the SFU nodes. To validate it, I'd run load tests with LiveKit's load-testing tool and watch CPU, bandwidth and packet loss per node, to find the saturation point and set the autoscaling thresholds."

---

**Q33. What are the operational risks of self-hosting?**

**Short answer:** On-call, upgrades, patching, TURN reliability, cross-region latency and capacity planning.

**Explanation:** Each risk needs an owner and a runbook; naming them shows maturity.

**Example:** A runbook for "TURN server unreachable" with checks and failover steps.

**Say it like this:** "On-call responsibility, upgrades, security patching, TURN reliability, latency across regions, and capacity planning. Each needs an owner and a runbook."

---

**Q34. Was this implemented in production, or only designed?**

**Short answer:** Answer precisely and honestly.

**Explanation:** Overstating this is the most common way candidates lose credibility in a deep dive.

**Example:** "Designed and deployed to staging; production rollout planned for [quarter]."

**Say it like this:** "It was designed and [prototyped / deployed to staging / running in production for X% of traffic]."

---

**Q35. Who owned the DevOps parts?**

**Short answer:** Be clear about what you built and what others owned.

**Explanation:** Clear boundaries show honesty and collaboration.

**Example:** You: architecture, Docker setup, CI pipeline. DevOps engineer: networking, production rollout.

**Say it like this:** "I designed the architecture and [built the Docker setup and CI pipeline]. [Our DevOps engineer] owned [the networking and production rollout]."

---

## 📊 BpoBox (Multi-Tenant AI QA Platform)

**Q36. What is BpoBox, and who uses it?**

**Short answer:** A QA platform for call centres serving 5 tenants and 1,500 users across admin, QA reviewer and agent roles.

**Explanation:** Set the context in two sentences so later questions make sense.

**Example:** Admins configure tenants, reviewers score calls, agents see their own feedback.

**Say it like this:** "A quality-assurance platform for call centres. Admins configure tenants and users, QA reviewers score calls, and agents see their own calls and feedback. It serves 5 tenants and 1,500 users."

---

**Q37. How is multi-tenancy handled on the frontend?**

**Short answer:** The tenant comes from the subdomain or token; the API client, cache keys, theme and config are tenant-scoped, and caches reset on switch or logout.

**Explanation:** The server enforces isolation; the frontend avoids showing stale data from another tenant.

**Example:**

```ts
const callsKey = (tenantId: string, filters: Filters) => ['tenant', tenantId, 'calls', filters] as const;
```

**Say it like this:** "The tenant comes from [the subdomain / a token claim]. The API client and every cache key are tenant-scoped, and the theme and config are per tenant. Caches are reset on tenant switch and logout. The server enforces isolation regardless."

---

**Q38. Why Radix UI?**

**Short answer:** Accessible, unstyled primitives, so we got correct behaviour and our own per-tenant styling.

**Explanation:** Mention the trade-off: more styling work than a fully styled library.

**Example:** Radix Dialog gives focus trapping and Escape handling; tenant themes come from CSS variables.

**Say it like this:** "Radix gives you accessible, unstyled primitives: focus trapping, ARIA and keyboard handling are done correctly, and we style them with our own design system and per-tenant themes. The trade-off is more styling work than a styled library."

---

**Q39. What are the role-based portals?**

**Short answer:** Admin, QA and agent portals, with permission-driven navigation and server-side checks.

**Explanation:** Show how each role's needs shaped the UI.

**Example:** Agents see only their own calls; reviewers have a queue with keyboard shortcuts; admins manage configuration.

**Say it like this:** "The admin portal handles tenant config and users. The QA portal has the review queue and scorecards. The agent portal shows the agent's own calls and feedback. Navigation and guards are permission-driven, with server-side checks."

---

**Q40. "QA review time cut by 60%": how was it measured, and what drove it?**

**Short answer:** Average minutes per reviewed call before and after the release, driven mainly by AI pre-scoring with flagged segments.

**Explanation:** Give the measurement method and the main drivers.

**Example:** Reviewers jump straight to flagged moments instead of listening to the whole call.

**Say it like this:** "Average minutes per reviewed call, from [review start and submit timestamps], before and after [the release]. The drivers were AI pre-scoring with flagged segments (so reviewers jump straight to the evidence), scorecard templates, keyboard shortcuts and better filters."

---

**Q41. How do scorecards work?**

**Short answer:** Tenant-configured sections, questions and weights, with validation rules, drafts, AI overrides and an audit trail.

**Explanation:** Show that the form is configuration-driven and handles real workflow needs.

**Example:** A comment becomes required when a score is below 3.

**Say it like this:** "Each tenant configures sections, questions and weights. There are validation rules (for example, a comment is required for low scores), draft saving, submission, reviewer overrides of AI scores, and an audit trail."

---

**Q42. How do you handle large call lists?**

**Short answer:** Server-side pagination and filtering, a virtualised table, URL-synced filters and cached queries.

**Explanation:** Never load thousands of rows into the browser at once.

**Example:** `?page=3&agent=12&from=2026-01-01` can be bookmarked and shared.

**Say it like this:** "Server-side pagination and filtering, a virtualised table, filters synced to the URL so views can be shared, and cached queries."

---

## 🤖 AI Scoring and the SSE Compliance Chat

**Q43. Explain the pipeline.**

**Short answer:** Twilio recording → webhook → Celery task → transcribe → chunk → score with LangChain and OpenAI → validate → save → notify the UI.

**Explanation:** Asynchronous processing keeps the UI responsive; validation keeps bad output out of the database. (See AI file Q42 for more detail.)

**Example:**

```text
Twilio → webhook → Celery → transcribe → chunk → LLM score (JSON) → validate → DB → notify UI
```

**Say it like this:** "A Twilio recording triggers a webhook, which queues a Celery task. The task transcribes the call, splits it into chunks, and scores it with LangChain and OpenAI using a rubric. We get structured output, validate it against a schema, save it, and notify the UI."

---

**Q44. "40,000+ calls a month": what about cost?**

**Short answer:** Know your cost per call, mainly driven by tokens per transcript, and the optimisations you made.

**Explanation:** If you don't know exact numbers, estimate honestly and explain the drivers.

**Example:** Trimming context, efficient chunking, and a smaller model for first-pass work.

**Say it like this:** "[Cost per call is about X], driven mainly by tokens per transcript. The optimisations were trimming the context, chunking efficiently, and [using a smaller model for first-pass work]."

---

**Q45. "5x throughput": what changed?**

**Short answer:** Concurrency: the work is I/O-bound, so parallel workers with async I/O and batching multiplied throughput.

**Explanation:** Give the measurement (calls per hour on the same workload) and the actual changes.

**Example:** Sequential per-chunk calls → concurrent calls across [N] workers.

**Say it like this:** "Concurrency. The work is I/O-bound, so moving from sequential per-chunk calls to parallel workers with async I/O, plus batching, multiplied throughput. We measured it as calls processed per hour on the same workload."

---

**Q46. "45 seconds average latency": what's the breakdown?**

**Short answer:** Queue wait, transcription, LLM calls and post-processing, with transcription and LLM calls dominating.

**Explanation:** Show you think in stages and target the biggest one.

**Example:** Next steps: streaming transcription and parallel chunk scoring.

**Say it like this:** "Queue wait, transcription, LLM calls and post-processing, with [transcription and the LLM calls] dominating. Next, I'd try streaming transcription and parallel chunk scoring."

---

**Q47. How did you validate AI accuracy?**

**Short answer:** Compare with human QA scores, track agreement per rubric item, record overrides, and improve prompts where they disagree.

**Explanation:** Trust in AI output comes from measurement, not assumption.

**Example:** A monthly agreement report per rubric item.

**Say it like this:** "We compared AI scores with human QA scores on a sample, tracked agreement per rubric item, recorded reviewer overrides, and iterated on the prompts where they disagreed."

---

**Q48. What happens when the LLM returns invalid output?**

**Short answer:** Schema validation catches it, we retry once with the error, and otherwise send it to human review.

**Explanation:** Invalid output must never reach the UI or database.

**Example:**

```python
try:
    card = Scorecard.model_validate_json(output)
except ValidationError as e:
    card = retry_with_error(prompt, e) or mark_for_human_review(call_id)
```

**Say it like this:** "Schema validation catches it. We retry once with the validation error in the prompt, and if it still fails, the call goes to human review. Invalid output never reaches the UI."

---

**Q49. Why SSE for the compliance chat?**

**Short answer:** Tokens flow one way, and SSE is simple, works over HTTP and reconnects automatically.

**Explanation:** Mention the limitation: `EventSource` can't set custom headers.

**Example:** Cookie auth with `EventSource`, or `fetch` streaming where headers were needed.

**Say it like this:** "The tokens only flow one way, from server to client. SSE is simple, runs over normal HTTP, and reconnects automatically. One catch: `EventSource` can't set custom headers, so we used cookie auth, or `fetch` streaming where we needed headers."

---

**Q50. How do you stop the chat leaking another tenant's data?**

**Short answer:** Filter retrieval by tenant and role in the database query, never through prompt instructions.

**Explanation:** The model can only leak what's in its context, so control the context.

**Example:** `WHERE tenant_id = $1` in every retrieval query, with a CI test for cross-tenant access.

**Say it like this:** "Retrieval is filtered by tenant and role at the data layer, in the database query itself, not through prompt instructions. Data from another tenant never reaches the model's context."

---

**Q51. What about prompt injection from transcripts?**

**Short answer:** Treat transcripts as delimited data, validate outputs against evidence, and keep humans on important decisions.

**Explanation:** Assume injection can succeed and limit the damage.

**Example:** A violation citing a timestamp that doesn't exist in the transcript is rejected.

**Say it like this:** "Transcripts are treated as data. They're delimited in the prompt, outputs are validated (every violation must cite a timestamp that exists), and humans review the important decisions."

---

## 🧪 Testing Standards and Mentoring

**Q52. What standards did you establish?**

**Short answer:** RTL with user-centric queries, MSW, Playwright for critical flows, coverage targets on critical modules, regression tests for bug fixes, and a PR checklist.

**Explanation:** Name the tools and the rules, and why each matters.

**Example:**

```ts
test('shows an error when scoring fails', async () => {
  server.use(http.post('/api/score', () => HttpResponse.json({}, { status: 500 })));
  render(<Scorecard callId="c1" />);
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't save/i);
});
```

**Say it like this:** "React Testing Library with user-centric queries, MSW for network mocking, Playwright for critical flows, coverage targets on critical modules, a rule that every bug fix ships with a regression test, and a PR template with a testing checklist."

---

**Q53. "Production bugs down 30%": measured how?**

**Short answer:** Bug tickets or new Sentry issues per release or month, before and after, acknowledging other factors.

**Explanation:** Honest attribution makes the number more credible.

**Example:** [X] bugs per release in Q1 → [Y] in Q3.

**Say it like this:** "Bug tickets or new Sentry issues per release or month, before and after. I also acknowledge other factors, like more code review, that contributed."

---

**Q54. How did you get 15 developers to adopt the standards?**

**Short answer:** Examples from our codebase, templates, pairing, gradual CI enforcement, and showing bugs that tests caught.

**Explanation:** Adoption depends on making the right thing easy.

**Example:** Enforcement started with auth and the call flow before expanding.

**Say it like this:** "Examples and templates from our own codebase, pairing sessions, CI enforcement introduced gradually starting with critical modules, and showing real bugs that the new tests caught."

---

**Q55. Give one concrete mentoring example.**

**Short answer:** One real, anonymised person, the problem, how you helped, and the change.

**Explanation:** Specific stories beat general mentoring philosophy.

**Example:** A developer struggling with async tests who later reviewed others' tests.

**Say it like this:** "[A developer, anonymised] struggled with async testing. We paired on two tests, I shared templates, and within [weeks] they were writing tests confidently and reviewing others' tests."

---

**Q56. How do you review code from 15 people without becoming a bottleneck?**

**Short answer:** CODEOWNERS, written guidelines, delegated reviewers and automation for style.

**Explanation:** Human review time should go on design and correctness.

**Example:**

```text
# .github/CODEOWNERS
/src/features/call/      @call-team-leads
/src/features/scorecard/ @qa-portal-leads
```

**Say it like this:** "CODEOWNERS by area, written review guidelines, trusted delegated reviewers, and automation (lint, format, typecheck) for style, so human reviews focus on design and correctness."

---

## 🕰️ Earlier Roles

**Q57. Arcitech 2023–2025: what did you build on the AI interview platform?**

**Short answer:** Dynamic question rendering from the job description and real-time feedback to candidates.

**Explanation:** State your role and one real challenge.

**Example:** Streaming feedback without blocking the UI.

**Say it like this:** "Dynamic question rendering based on the job description and real-time feedback to candidates. My role was [frontend owner]. One challenge was [streaming feedback without blocking the UI]."

---

**Q58. What did "Frontend Lead" mean on the Revit design-compliance checker?**

**Short answer:** Leading the frontend developers, making architecture decisions, and owning the integration with the AI feedback loop.

**Explanation:** Give the team size and your decisions.

**Example:** React and Redux, with Revit API data shown alongside AI compliance feedback.

**Say it like this:** "I led [team size] frontend developers, made the architecture decisions (React and Redux), and owned the integration between the Revit API data and the AI feedback loop shown to designers."

---

**Q59. What did the AI do on the education platform, and what did you build?**

**Short answer:** The AI generated assignments and exams from course material; you built the teacher-facing parts.

**Explanation:** Describe your specific contribution.

**Example:** An editor where teachers review and edit generated questions before publishing.

**Say it like this:** "The AI generated assignments and exams from course material. I built [the teacher-facing editor and review flow]."

---

**Q60. LTIMindtree: what are "headless and standalone widgets"?**

**Short answer:** Embeddable React widgets mounted into the airline's host pages.

**Explanation:** The challenges were style isolation, versioning, bundle size and host communication.

**Example:**

```ts
window.AirlineWidgets.mount('#booking', { locale: 'en-CA', onBooked: (id) => host.track(id) });
```

**Say it like this:** "Embeddable React widgets mounted into the airline's host pages. The challenges were style isolation (CSS Modules or Shadow DOM, so host styles didn't break them), versioning, keeping the bundle small, and communicating with the host page through props and events."

---

**Q61. Why GraphQL for the airline site, and what problems did it bring?**

**Short answer:** It aggregated many services into the exact shape each widget needed, but brought N+1 queries, caching complexity, partial errors and query cost.

**Explanation:** Show both the benefit and the problems you solved.

**Example:** DataLoader for N+1 and Apollo's normalised cache.

**Say it like this:** "It aggregated data from many backend services into exactly the shape each widget needed. The problems were N+1 queries on the server (solved with DataLoader), caching (we used Apollo's normalised cache), handling partial data with errors, and limiting query complexity."

---

**Q62. What did you learn working with a major client in a large services company?**

**Short answer:** Process discipline and careful stakeholder communication.

**Explanation:** Frame it as a strength you bring to faster-moving teams.

**Example:** Formal code reviews and release cycles that made delivery predictable.

**Say it like this:** "Process discipline: documentation, formal code reviews, release cycles, and communicating carefully with client stakeholders. It made me appreciate predictable delivery."

---

**Q63. Slaylink: what did you own end to end with Next.js, NestJS, GraphQL and MongoDB?**

**Short answer:** Name specific features you built across frontend and backend, plus intern coordination.

**Explanation:** End-to-end ownership early in your career supports your later architecture role.

**Example:** Creator profiles and brand-campaign pages.

**Say it like this:** "[Specific features you built end to end, for example creator profiles and brand-campaign pages]. I also coordinated tasks for interns through ClickUp to keep releases on schedule."

---

## 🧱 Skills Section Probes (Be Ready for 2–3 Questions on Every Skill You List)

**Q64. React Query vs Redux: when do you use each?**

**Short answer:** React Query for server state; Redux for complex shared client state.

**Explanation:** Server state needs caching, refetching and invalidation; client state needs predictable updates. (See 08.)

**Example:** Call history in React Query; the live call session in Redux.

**Say it like this:** "React Query for server state (caching, refetching). Redux for complex shared client state. In InterpretIQ, history came from the query layer and the live session state lived in Redux."

---

**Q65. Zustand: where have you used it?**

**Short answer:** Give a real example, or remove it from your resume.

**Explanation:** Listing a skill you can't discuss hurts more than not listing it.

**Example:** [A small global UI store, e.g. sidebar and theme state in a side project].

**Say it like this:** "I used Zustand for [real example]. I like it for small shared client state because there's no provider and components subscribe to just the slice they need."

---

**Q66. WebSocket vs SSE: where did you use each?**

**Short answer:** SSE for the one-way AI chat stream; WebSocket (or LiveKit signalling) for two-way real-time.

**Explanation:** Choose by direction of data flow and infrastructure needs.

**Example:** Compliance chat tokens over SSE; LiveKit room events over WebSocket signalling.

**Say it like this:** "SSE for the one-way AI chat stream, and WebSocket [or LiveKit's signalling] for bidirectional real-time."

---

**Q67. NestJS: modules, providers, guards, interceptors?**

**Short answer:** Modules group features, providers are injectable services, guards authorise requests, and interceptors transform requests and responses.

**Explanation:** Know where each fits in the request lifecycle.

**Example:**

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('campaigns')
findAll(@Req() req) { return this.campaigns.findForUser(req.user); }
```

**Say it like this:** "Modules group features, providers are injectable services, guards handle auth checks before handlers, and interceptors transform requests and responses (logging, mapping)."

---

**Q68. GraphQL: resolvers, N+1 and DataLoader, caching?**

**Short answer:** Resolvers fetch each field, DataLoader batches N+1 queries, and Apollo Client provides a normalised cache.

**Explanation:** N+1 happens when a list resolver triggers one query per item.

**Example:** Loading 50 bookings' passengers becomes one batched query instead of 50.

**Say it like this:** "Resolvers fetch each field. DataLoader batches the N+1 queries. Apollo Client gives you a normalised cache."

---

**Q69. PostgreSQL vs MongoDB: when do you use each? Indexing basics?**

**Short answer:** Postgres for relational data and transactions, MongoDB for flexible documents; index what you filter and sort on.

**Explanation:** Mention trade-offs: joins and constraints vs schema flexibility.

**Example:** `CREATE INDEX ON calls (tenant_id, created_at DESC);` for a tenant's recent calls.

**Say it like this:** "Postgres for relational data and transactions, MongoDB for flexible documents. Index the columns you filter and sort on."

---

**Q70. Redis: what did you use it for?**

**Short answer:** Name your real uses: cache, pub/sub, LiveKit routing, Celery broker.

**Explanation:** Be specific; interviewers will follow up on each.

**Example:** Celery's broker for the scoring pipeline and LiveKit's multi-node room routing.

**Say it like this:** "[A cache, pub/sub, LiveKit multi-node routing, the Celery broker]. For example, Redis was the broker for our Celery scoring workers."

---

**Q71. Docker: multi-stage builds, image size, layer caching?**

**Short answer:** Build in one stage, copy only the output into a slim runtime image, and order layers so dependencies cache.

**Explanation:** Copy `package.json` and install before copying source, so code changes don't reinstall dependencies.

**Example:**

```dockerfile
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

**Say it like this:** "Build in one stage, copy only the output into a slim runtime image, and order the layers so dependencies are cached."

---

**Q72. GitHub Actions: which pipeline did you build?**

**Short answer:** Describe your real pipeline: install, lint, typecheck, test, build, and deploy, with caching. (See 02.)

**Explanation:** Mention what made it fast and safe, like caching and required checks.

**Example:** PRs run lint, typecheck and tests; merges to main build and deploy to staging.

**Say it like this:** "On every PR we ran lint, typecheck and tests with dependency caching, and merges to main built and deployed to [staging]. The checks were required before merging, so broken code couldn't reach main."

---

**Q73. Sentry: source maps, release tracking, PII scrubbing?**

**Short answer:** Upload source maps privately, tag releases, and scrub PII and PHI in `beforeSend`.

**Explanation:** Release tags connect errors to deploys; private source maps keep code readable for you only.

**Example:** A spike in errors tagged `release: web@1.42.0` points straight at the last deploy.

**Say it like this:** "Source maps uploaded privately, releases tagged, and PII and PHI scrubbed in `beforeSend`."

---

**Q74. Grafana and Prometheus: which dashboards and alerts did you create?**

**Short answer:** Name real ones, such as LiveKit CPU, participants per node and packet loss.

**Explanation:** Explain why each alert existed and its threshold.

**Example:** An alert when a node's CPU is above 80% for five minutes.

**Say it like this:** "We had dashboards for [LiveKit CPU, participants per node and packet loss], and alerts for [high CPU and TURN failures], so we knew about problems before clinics reported them."

---

**Q75. Shell scripting: give an example script you wrote.**

**Short answer:** Describe one real script, what it automated, and how much time it saved.

**Explanation:** Small automation stories show initiative.

**Example:**

```bash
#!/usr/bin/env bash
set -euo pipefail
npm ci && npm run build
aws s3 sync dist/ "s3://$BUCKET" --delete
aws cloudfront create-invalidation --distribution-id "$DIST" --paths "/index.html"
```

**Say it like this:** "I wrote [a deploy script that builds, syncs to S3 and invalidates CloudFront], which replaced a manual checklist and removed a common source of mistakes."

---

**Q76. Webpack and Babel: what configuration have you customised?**

**Short answer:** Name real customisations, such as code splitting, aliases, loaders or browser targets.

**Explanation:** **Rule:** if you can't answer 2–3 questions on a skill, remove it or move it to "familiar with".

**Example:** `splitChunks` for vendor bundles, path aliases, and a `browserslist` target for the airline's supported browsers.

**Say it like this:** "At LTIMindtree I [configured code splitting for the widgets and set Babel targets for the airline's supported browsers]. These days I mostly use Vite, but I understand what the bundler is doing underneath."

---

## Part C — Resume Fixes, ATS and Standing Out

## 🔧 Resume Fixes (Apply Before Applying; See 22 — Resume Template)

1. **The summary is generic.** Replace it with a positioning line: *"Senior Frontend Engineer who owns architecture for real-time and AI-powered healthcare and call-centre products: React 19, TypeScript, LiveKit/WebRTC, secure multi-tenant SaaS."*
2. **Bullets cram 3–4 achievements together.** Use one achievement per bullet, with the metric at the end.
3. **Keep "projected"** on the 40% and 10x claims.
4. **Be clear about ownership.** Be ready to say what you did versus the team.
5. **Delete** "Continuously staying up-to-date with the latest technologies…". It's not an achievement.
6. **The 2023–2025 role lacks metrics.** Add one true number per bullet, or keep it outcome-focused.
7. **The projects (Blood Bank, Quiz App)** read as college-level for a senior engineer. Replace them with one strong project (see 20 — Project Ideas), or remove the section.
8. **Skills:** group them by depth, and remove anything you can't defend.
9. **Headline:** keep two versions, Senior Frontend Engineer and Senior Full-Stack Engineer, matched to the JD.

## 🤖 ATS: What Actually Matters

- The ATS parses your resume and matches keywords, but the recruiter's 10-second skim is the real filter.
- Use a single column, standard headings (Summary, Skills, Experience, Education), real text (no images or tables for content), PDF export, and standard fonts.
- Mirror the JD's exact terms where they're true ("React.js", "Next.js", "micro-frontends", "WCAG 2.1 AA", "Jest/RTL").
- Put your strongest metric in the first bullet of your current role.
- Name the file `Firstname_Lastname_Role.pdf`.

## 🏁 Standing Out

- **A link that proves depth:** a public write-up or demo (for example, "Self-hosting LiveKit: lessons learned" or "Streaming AI chat with auth"), without client code or data.
- **Referrals** convert far better than cold applications.
- **Tailor the top 3 bullets** to each JD. It takes about 10 minutes per application.
- Keep your **LinkedIn** headline, About section and experience consistent with your resume.
