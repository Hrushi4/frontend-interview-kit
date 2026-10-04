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

## 🟢 Opening Questions

**Q1. Walk me through your resume.**

**Approach:** 2 minutes, reverse chronological, focused on the last 2 years, ending with why you're interviewing.

**Sample answer:** "I'm currently a Senior Software Engineer at Arcitech in Mumbai. I own the frontend architecture for two products. InterpretIQ is a WCAG-compliant medical interpretation PWA with real-time LiveKit video. I brought join time under 5 seconds and reconnect success to 99% for up to 150 concurrent sessions. BpoBox is a multi-tenant AI QA platform for call centres, with 5 tenants and 1,500 users. Our role-based portals and AI scoring cut QA review time by 60%. I also led a security audit that found 8 critical issues, and I set testing standards across 15 developers.

Before that, from 2023 to 2025, I was a Software Engineer at Arcitech building AI products: an interview platform, a Revit design-compliance checker where I was frontend lead, and an education platform. Earlier, at LTIMindtree, I built booking and profile features and embeddable widgets for a major North American airline, using React, Redux and GraphQL. I started at Slaylink as a full-stack developer with Next.js and NestJS.

I'm now looking for a role where I can [own frontend architecture at a larger scale / the JD's core problem]."

---

**Q2. What's the most complex thing you've built?**

**Sample answer:** "The real-time video layer of InterpretIQ. It's three-way video (patient, provider, interpreter), often on hospital Wi-Fi and tablets, and a dropped call delays care. The hardest part was reliability: modelling the call lifecycle as a state machine, a resume-first reconnect strategy, and keeping the LiveKit Room object outside React state so re-renders could never break the connection. The result was 99% reconnect success and joins under 5 seconds."

---

**Q3. Which of your two products do you spend more time on, and why?**

**Sample answer:** "Currently [InterpretIQ], because [real-time reliability and healthcare compliance carry the highest risk]. I keep BpoBox moving by delegating well-defined features and focusing my time there on architecture and reviews." This shows prioritisation and ownership.

---

**Q4. You were promoted from Software Engineer to Senior within Arcitech. What changed in your responsibilities?**

**Sample answer:** "Three things. First, I went from building features to owning architecture: decisions like Redux for session state, LiveKit, and the PWA approach. Second, I took on cross-cutting responsibility for security and reliability, which led to the audit. Third, mentoring: I set the testing standards and supported 15 developers."

---

**Q5. Your title says Senior Software Engineer, but most of your work is frontend. Are you frontend or full-stack?**

**Sample answer (adjust it to the JD):** "Frontend-focused, with full-stack ownership where reliability needed it. I own the React architecture end to end, and I've worked in FastAPI on permission checks, designed the AWS infrastructure for self-hosted LiveKit, and built backend features with NestJS earlier in my career."

---

## 🎯 InterpretIQ (React 19, TypeScript, Redux, WCAG PWA, LiveKit)

**Q6. Walk me through the InterpretIQ frontend architecture.**

**Approach:** Users and roles → app shell (PWA, routing, access gating) → state (Redux for session and call state, a query layer for server data) → the real-time layer (LiveKit client, room and track lifecycle) → accessibility → observability (Sentry) → build and deploy. End with one trade-off you'd revisit.

**Sample answer:** "There are three main roles: patient, provider and interpreter, plus admins. The app is a PWA, installable on clinic tablets, with an offline app shell. Routes are gated by role, with the server enforcing every permission. Shared session and call state lives in Redux, while server data like history and profiles goes through a query layer. The real-time layer wraps the LiveKit client in a provider that holds the Room in a ref, and each participant tile subscribes only to its own tracks. Accessibility is built in at the component level: WCAG 2.1 AA, keyboard controls, and live-region announcements. Sentry handles errors with PHI scrubbing. If I did it again, I'd model the call lifecycle with XState and add a BFF so tokens never touch the browser."

---

**Q7. Who are the users, and what is the core flow?**

**Sample answer:** "[A provider or patient requests interpretation in a language → the system matches an available interpreter → everyone joins a three-way video call after a device check → the session ends with a summary.]" *(Describe the real flow.)*

---

**Q8. What does "access-gated" mean in your app, and how is it enforced?**

**Sample answer:** "On the frontend: route guards, role-aware UI, and handling token refresh. But the real enforcement is on the server. Every API checks the role and the resource access, and LiveKit tokens are generated on the server with role-scoped grants. An interpreter can publish, an observer can only subscribe. The frontend gating is for UX only."

---

**Q9. "150 concurrent sessions": was that a production peak or a load test? How was it measured?**

**Sample answer:** "[It was our production peak / a load test], measured from [LiveKit server metrics in Grafana / the load-testing tool] over [a time window]." *State the source honestly.*

---

**Q10. "99% reconnect success": how do you define it?**

**Sample answer:** "The percentage of reconnecting events that reached reconnected within [N] seconds, without the user doing anything, over [a period]. The denominator is all reconnecting events recorded in our client telemetry."

---

**Q11. How does reconnection work in WebRTC and LiveKit?**

**Sample answer:** "A network change, like switching from Wi-Fi to 4G, breaks the ICE connection. LiveKit first tries to *resume*: an ICE restart on the same session. If that fails, it does a full reconnect. On the frontend I keep the room state outside components, show a non-blocking 'Reconnecting…' banner, avoid unmounting the video elements, re-subscribe to tracks, fetch a fresh token if needed, and rely on TURN over TLS as a fallback for restrictive networks like hospitals."

---

**Q12. "Join latency under 5 seconds": measured from where to where?**

**Sample answer:** "From clicking Join to the first remote video frame rendering, measured with User Timing marks. What I optimised: prefetching the token on the pre-join screen, warming up camera permissions there, lazy-loading the SDK before the click, connecting to the nearest region, and removing serial API calls before connecting."

---

**Q13. Why a PWA? What's cached?**

**Sample answer:** "Clinics use shared tablets, so being installable, reloading fast and having an offline app shell matter. The service worker caches only static assets and the app shell, **never** PHI or authenticated API responses. When a new version is deployed, users see a 'New version available — reload' prompt instead of a silent update mid-call."

---

**Q14. WCAG compliance: which level, and how was it verified?**

**Sample answer:** "WCAG 2.1 AA. That covers keyboard operation, focus management, live regions for call events, captions and transcripts, contrast and reduced motion. We verified it with axe in CI and Lighthouse, plus manual keyboard and screen-reader passes on the critical flows. One real bug I fixed: [the reconnect banner appeared visually but was never announced, because its live region was created at the same moment as the text. Rendering the region on load fixed it]."

---

**Q15. Why Redux here instead of Context or Zustand?**

**Sample answer:** "The session and call state is shared across many screens (the waiting room, the call and the post-call summary) and has complex, predictable transitions. Redux gave us selector-based subscriptions, so components re-render only for their slice, plus DevTools to replay tricky session flows. Non-serializable LiveKit objects stayed outside the store. Zustand would also have worked. Redux's structure suited a growing team."

---

**Q16. How did you avoid re-rendering the whole grid when the speaking indicator changes?**

**Sample answer:** "Each tile subscribes to its own participant's events, tiles are memoized and keyed by participant ID, and audio levels never enter React state. A `requestAnimationFrame` loop reads the level and sets a CSS variable through a ref, so the speaking ring animates without any React re-render."

---

**Q17. What happens when camera or microphone permission is denied?**

**Sample answer:** "We show a clear explanation with browser-specific steps to re-enable it, offer to join audio-only or without video, and provide a Retry button. If no device is found at all, the user can still join and listen."

---

**Q18. How do you test a video feature?**

**Sample answer:** "Unit tests for the state machine and hooks. Playwright end-to-end tests with Chrome's fake media devices (`--use-fake-device-for-media-stream`). Manual testing on the actual target tablets and networks, plus network throttling to simulate drops."

---

**Q19. What would you change in InterpretIQ's architecture now?**

**Sample answer:** "Two things. A formal state machine (XState) for the call lifecycle, because some edge cases were implicit in our reducer. And a BFF, so tokens stay on the server, which is better for PHI security. I'd also invest earlier in telemetry dashboards for join time and reconnects."

---

## 🔐 Security and Reliability Audit (React + FastAPI)

**Q20. Why did you start the audit? Was it assigned?**

**Sample answer:** "It wasn't formally assigned. We were handling PHI, and access control had grown organically as features shipped. I raised it with [my lead/the CTO], proposed a scoped review, and took ownership of it."

---

**Q21. What was your process?**

**Sample answer:** "I built a threat model (roles, data flows, where PHI lives), then worked through an OWASP-style checklist. I tested every endpoint as every role and tenant, reviewed the token lifecycle and storage, and scanned logs, browser storage and analytics for PHI. Each finding got a severity rating and a fix with a regression test, and then we re-audited."

---

**Q22. Describe three of the 8 critical issues.**

**Approach:** For each one: problem → impact → fix → how you prevented a regression. Typical categories (use only your real ones): RBAC enforced only in the UI, missing tenant or ownership checks (IDOR), JWTs in localStorage, long-lived tokens with no rotation, PHI in logs, Sentry or browser storage.

**Sample answer (example format):**

1. "**RBAC enforced only in the UI.** Hidden buttons, but the API accepted the request from any role. *Impact:* any logged-in user could call admin endpoints. *Fix:* a permission dependency on every FastAPI route. *Prevention:* a role-by-endpoint test matrix in CI."
2. "**Tokens in localStorage.** *Impact:* any XSS could steal sessions. *Fix:* moved to HttpOnly, Secure, SameSite cookies with short-lived access tokens and refresh rotation. *Prevention:* a lint rule and a code-review checklist item."
3. "**PHI in error reports.** Sentry breadcrumbs captured form inputs. *Impact:* patient data at a third party. *Fix:* `beforeSend` and `beforeBreadcrumb` scrubbing, and session replay disabled. *Prevention:* scrubbing tests and a vendor review."

---

**Q23. "Cut findings by 85%": 85% of what?**

**Sample answer:** "The number of open findings in the re-audit compared with the initial audit: [X down to Y]. [It was a raw count / weighted by severity.] The remaining items were lower severity, with owners and dates. For example, [adding security headers through the CDN config]."

---

**Q24. Where should tokens be stored in a browser?**

**Sample answer:** "Ideally not in JavaScript-readable storage at all. Options, from best to worst for a healthcare app: a BFF that holds the tokens, so the browser only has a session cookie; HttpOnly, Secure, SameSite cookies; an access token in memory with a refresh token in an HttpOnly cookie. Never localStorage. The trade-off is XSS risk against CSRF risk, and cookies need SameSite plus CSRF protection." (See Web Security Q30.)

---

**Q25. How did you implement RBAC across FastAPI and React?**

**Sample answer:** "On the server, a permission dependency on each route checks the role, the tenant and ownership. That's the real enforcement. On the client, the same permission list drives navigation, route guards and button visibility. In tests, an authorisation matrix runs every role against every endpoint."

---

**Q26. How do you keep PHI out of logs and error tracking?**

**Sample answer:** "Sentry `beforeSend` scrubbing, no PHI in URLs, page titles or analytics events, session replay disabled or fully masked, and a code-review checklist item for logging."

---

**Q27. Did you work with backend developers on the fixes? How did you get buy-in?**

**Sample answer:** "Yes. I didn't just file tickets. I showed each issue with a concrete reproduction (like changing a call ID in a request), explained the impact in patient-data terms, and paired with them on the first fixes. Seeing the exploit made prioritisation easy."

---

**Q28. How do you stop these issues coming back?**

**Sample answer:** "Automated authorisation tests in CI, lint rules (for example, banning localStorage for tokens), a security checklist in the PR template, periodic re-audits, and dependency and secret scanning in CI."

---

## ☁️ Self-Hosted LiveKit on AWS

**Q29. Why consider self-hosting instead of LiveKit Cloud?**

**Sample answer:** "Cost at our usage level, data control for compliance, and the ability to customise. The trade-off is the operational burden: on-call, upgrades, patching and capacity planning."

---

**Q30. How was the "40% cost reduction" projected?**

**Sample answer:** "With a cost model: managed per-minute and bandwidth pricing compared against EC2, data transfer and the engineering time to operate it. It rests on assumptions about usage growth and server utilisation. It's a projection, and I always present it as one."

---

**Q31. Draw the architecture.**

**Sample answer:** "SFU nodes on EC2 with host networking and an open UDP port range. Redis for routing rooms across nodes. A load balancer for WSS signalling. TURN over TLS on port 443 for restrictive networks. Autoscaling on CPU and participant count. Prometheus and Grafana for monitoring and alerts. Docker images built in CI, and rolling deploys that drain rooms before replacing a node."

---

**Q32. What does "support 10x traffic" rest on?**

**Sample answer:** "Horizontal scaling of the SFU nodes. To validate it, I'd run load tests with LiveKit's load-testing tool and watch CPU, bandwidth and packet loss per node, to find the saturation point and set the autoscaling thresholds."

---

**Q33. What are the operational risks of self-hosting?**

**Sample answer:** "On-call responsibility, upgrades, security patching, TURN reliability, latency across regions, and capacity planning. Each needs an owner and a runbook."

---

**Q34. Was this implemented in production, or only designed?**

**Sample answer:** Answer precisely: "It was designed and [prototyped / deployed to staging / running in production for X% of traffic]."

---

**Q35. Who owned the DevOps parts?**

**Sample answer:** "I designed the architecture and [built the Docker setup and CI pipeline]. [Our DevOps engineer] owned [the networking and production rollout]." Be clear about the collaboration and its boundaries.

---

## 📊 BpoBox (Multi-Tenant AI QA Platform)

**Q36. What is BpoBox, and who uses it?**

**Sample answer:** "A quality-assurance platform for call centres. Admins configure tenants and users, QA reviewers score calls, and agents see their own calls and feedback. It serves 5 tenants and 1,500 users."

---

**Q37. How is multi-tenancy handled on the frontend?**

**Sample answer:** "The tenant comes from [the subdomain / a token claim]. The API client and every cache key are tenant-scoped, and the theme and config are per tenant. Caches are reset on tenant switch and logout. The server enforces isolation regardless."

---

**Q38. Why Radix UI?**

**Sample answer:** "Radix gives you accessible, unstyled primitives: focus trapping, ARIA and keyboard handling are done correctly, and we style them with our own design system and per-tenant themes. The trade-off is more styling work than a styled library."

---

**Q39. What are the role-based portals?**

**Sample answer:** "The admin portal handles tenant config and users. The QA portal has the review queue and scorecards. The agent portal shows the agent's own calls and feedback. Navigation and guards are permission-driven, with server-side checks."

---

**Q40. "QA review time cut by 60%": how was it measured, and what drove it?**

**Sample answer:** "Average minutes per reviewed call, from [review start and submit timestamps], before and after [the release]. The drivers were AI pre-scoring with flagged segments (so reviewers jump straight to the evidence), scorecard templates, keyboard shortcuts and better filters."

---

**Q41. How do scorecards work?**

**Sample answer:** "Each tenant configures sections, questions and weights. There are validation rules (for example, a comment is required for low scores), draft saving, submission, reviewer overrides of AI scores, and an audit trail."

---

**Q42. How do you handle large call lists?**

**Sample answer:** "Server-side pagination and filtering, a virtualised table, filters synced to the URL so views can be shared, and cached queries."

---

## 🤖 AI Scoring and the SSE Compliance Chat

**Q43. Explain the pipeline.**

**Sample answer:** "A Twilio recording triggers a webhook, which queues a Celery task. The task transcribes the call, splits it into chunks, and scores it with LangChain and OpenAI using a rubric. We get structured output, validate it against a schema, save it, and notify the UI."

---

**Q44. "40,000+ calls a month": what about cost?**

**Sample answer:** "[Cost per call is about X], driven mainly by tokens per transcript. The optimisations were trimming the context, chunking efficiently, and [using a smaller model for first-pass work]." Know your numbers, or estimate honestly.

---

**Q45. "5x throughput": what changed?**

**Sample answer:** "Concurrency. The work is I/O-bound, so moving from sequential per-chunk calls to parallel workers with async I/O, plus batching, multiplied throughput. We measured it as calls processed per hour on the same workload."

---

**Q46. "45 seconds average latency": what's the breakdown?**

**Sample answer:** "Queue wait, transcription, LLM calls and post-processing, with [transcription and the LLM calls] dominating. Next, I'd try streaming transcription and parallel chunk scoring."

---

**Q47. How did you validate AI accuracy?**

**Sample answer:** "We compared AI scores with human QA scores on a sample, tracked agreement per rubric item, recorded reviewer overrides, and iterated on the prompts where they disagreed."

---

**Q48. What happens when the LLM returns invalid output?**

**Sample answer:** "Schema validation catches it. We retry once with the validation error in the prompt, and if it still fails, the call goes to human review. Invalid output never reaches the UI."

---

**Q49. Why SSE for the compliance chat?**

**Sample answer:** "The tokens only flow one way, from server to client. SSE is simple, runs over normal HTTP, and reconnects automatically. One catch: `EventSource` can't set custom headers, so we used cookie auth, or `fetch` streaming where we needed headers."

---

**Q50. How do you stop the chat leaking another tenant's data?**

**Sample answer:** "Retrieval is filtered by tenant and role at the data layer, in the database query itself, not through prompt instructions. Data from another tenant never reaches the model's context."

---

**Q51. What about prompt injection from transcripts?**

**Sample answer:** "Transcripts are treated as data. They're delimited in the prompt, outputs are validated (every violation must cite a timestamp that exists), and humans review the important decisions."

---

## 🧪 Testing Standards and Mentoring

**Q52. What standards did you establish?**

**Sample answer:** "React Testing Library with user-centric queries, MSW for network mocking, Playwright for critical flows, coverage targets on critical modules, a rule that every bug fix ships with a regression test, and a PR template with a testing checklist."

---

**Q53. "Production bugs down 30%": measured how?**

**Sample answer:** "Bug tickets or new Sentry issues per release or month, before and after. I also acknowledge other factors, like more code review, that contributed."

---

**Q54. How did you get 15 developers to adopt the standards?**

**Sample answer:** "Examples and templates from our own codebase, pairing sessions, CI enforcement introduced gradually starting with critical modules, and showing real bugs that the new tests caught."

---

**Q55. Give one concrete mentoring example.**

**Sample answer:** "[A developer, anonymised] struggled with async testing. We paired on two tests, I shared templates, and within [weeks] they were writing tests confidently and reviewing others' tests." Use a real story.

---

**Q56. How do you review code from 15 people without becoming a bottleneck?**

**Sample answer:** "CODEOWNERS by area, written review guidelines, trusted delegated reviewers, and automation (lint, format, typecheck) for style, so human reviews focus on design and correctness."

---

## 🕰️ Earlier Roles

**Q57. Arcitech 2023–2025: what did you build on the AI interview platform?**

**Sample answer:** "Dynamic question rendering based on the job description and real-time feedback to candidates. My role was [frontend owner]. One challenge was [streaming feedback without blocking the UI]."

---

**Q58. What did "Frontend Lead" mean on the Revit design-compliance checker?**

**Sample answer:** "I led [team size] frontend developers, made the architecture decisions (React and Redux), and owned the integration between the Revit API data and the AI feedback loop shown to designers."

---

**Q59. What did the AI do on the education platform, and what did you build?**

**Sample answer:** "The AI generated assignments and exams from course material. I built [the teacher-facing editor and review flow]."

---

**Q60. LTIMindtree: what are "headless and standalone widgets"?**

**Sample answer:** "Embeddable React widgets mounted into the airline's host pages. The challenges were style isolation (CSS Modules or Shadow DOM, so host styles didn't break them), versioning, keeping the bundle small, and communicating with the host page through props and events."

---

**Q61. Why GraphQL for the airline site, and what problems did it bring?**

**Sample answer:** "It aggregated data from many backend services into exactly the shape each widget needed. The problems were N+1 queries on the server (solved with DataLoader), caching (we used Apollo's normalised cache), handling partial data with errors, and limiting query complexity."

---

**Q62. What did you learn working with a major client in a large services company?**

**Sample answer:** "Process discipline: documentation, formal code reviews, release cycles, and communicating carefully with client stakeholders. It made me appreciate predictable delivery."

---

**Q63. Slaylink: what did you own end to end with Next.js, NestJS, GraphQL and MongoDB?**

**Sample answer:** "[Specific features you built end to end, for example creator profiles and brand-campaign pages]. I also coordinated tasks for interns through ClickUp to keep releases on schedule."

---

## 🧱 Skills Section Probes (Be Ready for 2–3 Questions on Every Skill You List)

**Q64. React Query vs Redux: when do you use each?**
"React Query for server state (caching, refetching). Redux for complex shared client state." (See 08.)

**Q65. Zustand: where have you used it?**
Give a real example, or remove it from your resume.

**Q66. WebSocket vs SSE: where did you use each?**
"SSE for the one-way AI chat stream, and WebSocket [or LiveKit's signalling] for bidirectional real-time."

**Q67. NestJS: modules, providers, guards, interceptors?**
"Modules group features, providers are injectable services, guards handle auth checks before handlers, and interceptors transform requests and responses (logging, mapping)."

**Q68. GraphQL: resolvers, N+1 and DataLoader, caching?**
"Resolvers fetch each field. DataLoader batches the N+1 queries. Apollo Client gives you a normalised cache."

**Q69. PostgreSQL vs MongoDB: when do you use each? Indexing basics?**
"Postgres for relational data and transactions, MongoDB for flexible documents. Index the columns you filter and sort on."

**Q70. Redis: what did you use it for?**
"[A cache, pub/sub, LiveKit multi-node routing, the Celery broker]." Name your real uses.

**Q71. Docker: multi-stage builds, image size, layer caching?**
"Build in one stage, copy only the output into a slim runtime image, and order the layers so dependencies are cached."

**Q72. GitHub Actions: which pipeline did you build?** (See 02.)

**Q73. Sentry: source maps, release tracking, PII scrubbing?**
"Source maps uploaded privately, releases tagged, and PII and PHI scrubbed in `beforeSend`."

**Q74. Grafana and Prometheus: which dashboards and alerts did you create?**
Name real ones, for example LiveKit CPU, participants per node and packet loss.

**Q75. Shell scripting: give an example script you wrote.**

**Q76. Webpack and Babel: what configuration have you customised?**

**Rule:** If you can't answer 2–3 questions on a skill, remove it or move it to "familiar with".

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
