# 01 — Resume Deep-Dive: What They'll Ask You

Senior interviews spend 30–50% of the time on *your* bullets. Every number you wrote is a question waiting to happen. For each bullet, prepare a 60-second version, a 5-minute version, and answers to the follow-up chain below.

Sections: **🧭 How to prepare → 🟢 Opening questions → 🎯 InterpretIQ → 🔐 Security audit → ☁️ Self-hosted LiveKit → 📊 BpoBox → 🤖 AI scoring & SSE → 🧪 Testing & mentoring → 🕰️ Earlier roles → 🧱 Skills section probes → 🔧 Resume fixes → 🤖 ATS → 🏁 Standing out**

---

## 🧭 How to prepare each bullet

For every bullet answer these five:
1. **What** was the problem and who was affected?
2. **What exactly did I do** (vs the team)?
3. **How did it work** technically (draw it)?
4. **How was the number measured** (baseline, method, time window)?
5. **What would I do differently** now?

Rule: if a number was projected, estimated or from a load test, say so. Precision builds trust; inflated numbers lose offers.

---

## 🟢 Opening questions

**1. Walk me through your resume.**
2 minutes, reverse chronological, emphasize the last 2 years, end with why you're interviewing.

**2. What's the most complex thing you've built?**
Pick InterpretIQ real-time video or the AI scoring pipeline. Describe architecture, hardest problem, result.

**3. Which of your two products do you spend more time on and why?**
Shows prioritisation and ownership.

**4. You were promoted from Software Engineer to Senior within Arcitech — what changed in your responsibilities?**
Ownership of architecture, cross-team decisions, mentoring, security/reliability scope.

**5. Your title says Senior Software Engineer but most work is frontend. Are you frontend or full-stack?**
Answer consistently with the JD: e.g., "Frontend-focused with full-stack ownership where reliability needed it — FastAPI permission checks, AWS infrastructure design."

---

## 🎯 InterpretIQ (React 19, TypeScript, Redux, WCAG PWA, LiveKit)

**6. Walk me through the InterpretIQ frontend architecture.**
Users & roles → app shell (PWA, routing, access gating) → state (Redux for session/call state, query layer for server data) → real-time layer (LiveKit client, room/track lifecycle) → accessibility → observability (Sentry) → build/deploy. End with one trade-off you'd revisit.

**7. Who are the users and what is the core flow?**
e.g., provider/patient requests interpretation → interpreter joins → three-way video call → session ends with summary. Describe the real flow.

**8. What does "access-gated" mean in your app? How is it enforced?**
Frontend: route guards, role-aware UI, token refresh handling. Real enforcement: server-side API checks and role-scoped LiveKit tokens.

**9. "150 concurrent sessions" — production peak or load test? How measured?**
State the source (LiveKit server metrics, dashboards, load test tool) and time window.

**10. "99% reconnect success" — definition?**
e.g., percentage of `Reconnecting` events followed by `Reconnected` within N seconds without user action, over a defined period. Know the denominator.

**11. How does reconnection work in WebRTC/LiveKit?**
Network change → ICE restart; LiveKit tries resume first, then full reconnect. Frontend: keep room state outside components, non-blocking banner, don't unmount video elements, re-subscribe tracks, fresh token if needed, TURN/TLS fallback for restrictive networks (hospitals).

**12. "< 5 s join latency" — measured from where to where?**
Click Join → first remote frame rendered (or → connected). What you optimized: token prefetch, permission warm-up, lazy SDK, region, fewer serial API calls.

**13. Why a PWA? What's cached?**
Installable on clinic tablets, fast reloads, offline shell. Only static assets and app shell cached; never PHI or authenticated API responses; update strategy with "new version available".

**14. WCAG compliance — which level and how verified?**
State level (likely 2.1 AA). Keyboard operation, focus management, live regions, captions/transcripts, contrast, reduced motion; verified with axe/Lighthouse + manual keyboard and screen-reader testing. Have one specific bug you fixed.

**15. Why Redux here instead of Context or Zustand?**
Shared, complex session state across screens; predictable transitions; DevTools. Non-serializable LiveKit objects kept outside the store.

**16. How did you avoid re-rendering the whole grid on speaking indicator changes?**
Per-tile subscriptions, memoized tiles keyed by participant id, audio levels handled locally with refs/rAF.

**17. What happens when camera/mic permission is denied?**
Clear explanation, browser-specific steps, audio-only or join-without-video options, retry.

**18. How do you test a video feature?**
Unit tests for state machine/hooks, Playwright with fake media devices (`--use-fake-device-for-media-stream`), manual testing on target tablets/networks, network throttling.

**19. What would you change in InterpretIQ's architecture now?**
Prepare one honest improvement (e.g., formal state machine for call lifecycle, BFF for token handling, better telemetry).

---

## 🔐 Security & reliability audit (React + FastAPI)

**20. Why did you start the audit? Was it assigned?**
Context and motivation — ownership story.

**21. What was your process?**
Threat model (roles, data flows, PHI locations) → checklist (OWASP-style) → test endpoints per role/tenant → token lifecycle review → logs/storage scan for PHI → severity rating → fixes with tests → re-audit.

**22. Describe three of the 8 critical issues.**
For each: problem → impact → fix → how you prevented regression. Typical categories (use only your real ones): UI-only RBAC, missing tenant/ownership checks (IDOR), JWT in localStorage, long-lived tokens/no rotation, PHI in logs/Sentry/browser storage.

**23. "Cut findings by 85%" — of what?**
Count (or severity-weighted count) of open findings between audit and re-audit. Which remain and why?

**24. Where should tokens be stored in a browser?**
httpOnly Secure SameSite cookies or in-memory access + httpOnly refresh cookie, or BFF holding tokens. Explain trade-offs (XSS vs CSRF).

**25. How did you implement RBAC across FastAPI and React?**
Server: permission dependency on each route (role + tenant + ownership). Client: same permission list drives nav/guards/buttons. Tests: role × endpoint matrix.

**26. How do you keep PHI out of logs and error tracking?**
Sentry `beforeSend` scrubbing, no PHI in URLs/titles/analytics, replay disabled/masked, code review checklist.

**27. Did you work with backend developers on fixes? How did you get buy-in?**
Collaboration and influence story.

**28. How do you prevent these issues from coming back?**
Automated authorization tests, lint rules, security checklist in PR template, periodic audits, dependency/secret scanning in CI.

---

## ☁️ Self-hosted LiveKit on AWS

**29. Why consider self-hosting instead of LiveKit Cloud?**
Cost at scale, data control/compliance, customization — vs operational burden.

**30. How was "40% cost reduction" projected?**
Cost model: managed per-minute/bandwidth pricing vs EC2 + data transfer + ops time; assumptions (usage growth, utilization). It's a projection — say so.

**31. Draw the architecture.**
SFU nodes (EC2, host networking, UDP range), Redis for multi-node routing, load balancer for WSS signalling, TURN/TLS on 443, autoscaling, Prometheus/Grafana monitoring, Docker images built in CI, rolling deploys draining rooms.

**32. What does "support 10x traffic" rest on?**
Horizontal scaling of SFU nodes; how you'd validate (load testing tools, metrics to watch: CPU, bandwidth, packet loss).

**33. What are the operational risks of self-hosting?**
On-call, upgrades, security patching, TURN reliability, regional latency, capacity planning.

**34. Was this implemented in production or designed?**
Answer precisely ("designed and [prototyped/deployed to staging/production]").

**35. Who owned DevOps parts?**
Be clear about collaboration and boundaries.

---

## 📊 BpoBox (multi-tenant AI QA platform)

**36. What is BpoBox and who uses it?**
Call-centre QA: admins, QA reviewers, agents; 5 tenants, 1,500 users.

**37. How is multi-tenancy handled on the frontend?**
Tenant from subdomain/token claim, tenant-scoped API client and cache keys, per-tenant theme/config, cache reset on tenant switch/logout. Server enforces isolation.

**38. Why Radix UI?**
Accessible unstyled primitives (focus trap, ARIA, keyboard) styled to your design system; trade-off: more styling effort.

**39. What are the role-based portals?**
Admin (tenant config, users), QA (review queue, scorecards), agent (own calls/feedback). Permission-driven navigation and guards.

**40. "QA review time cut by 60%" — how measured and what drove it?**
Baseline vs after (e.g., average minutes per reviewed call from timestamps). Drivers: AI pre-scoring with flagged segments, scorecard templates, keyboard shortcuts, better filters.

**41. How do scorecards work?**
Configurable sections/questions/weights per tenant, validation rules, drafts, submission, overrides of AI scores, audit trail.

**42. How do you handle large call lists?**
Server-side pagination/filtering, virtualization, URL-synced filters, cached queries.

---

## 🤖 AI scoring & SSE compliance chat

**43. Explain the pipeline.**
Twilio recording → webhook → Celery task → transcription → chunking → LangChain + OpenAI scoring with rubric → structured output → validation → persist → UI notification.

**44. "40,000+ calls/month" — what about cost?**
Know (or estimate honestly) cost per call and what drives it (tokens per transcript), and optimizations.

**45. "5x throughput" — what changed?**
Concurrency/parallelism, async I/O, batching — with how it was measured.

**46. "45 s average latency" — breakdown?**
Queue, transcription, LLM, post-processing; next optimization.

**47. How did you validate AI accuracy?**
Human QA comparison, agreement metrics, reviewer overrides, prompt iteration.

**48. What happens when the LLM returns invalid output?**
Schema validation → retry with error feedback → fallback to human review.

**49. Why SSE for the compliance chat?**
One-way token streaming, simple over HTTP, auto-reconnect; `EventSource` lacks custom headers → cookies or fetch streaming.

**50. How do you prevent the chat from leaking another tenant's data?**
Retrieval filtered by tenant/role at the data layer, not via prompt instructions.

**51. Prompt injection risk from transcripts?**
Transcripts are data; delimit them; validate outputs (evidence timestamps); humans in loop.

---

## 🧪 Testing standards & mentoring

**52. What standards did you establish?**
RTL with user-centric queries, MSW, Playwright for critical flows, coverage on critical modules, "bug fix ships with regression test", PR template.

**53. "Production bugs down 30%" — measured how?**
Bug tickets or Sentry issues per release/month before vs after; acknowledge other factors.

**54. How did you get 15 developers to adopt the standards?**
Examples and templates, pairing, gradual CI enforcement, showing caught bugs.

**55. Mentoring — give one concrete example.**
A developer you helped grow (anonymised), what you did, outcome.

**56. How do you review code from 15 people without becoming a bottleneck?**
CODEOWNERS by area, review guidelines, delegated reviewers, automation for style.

---

## 🕰️ Earlier roles

**57. Arcitech 2023–2025: AI interview platform — what did you build?**
Dynamic question rendering, real-time feedback; your role; one technical challenge.

**58. Revit design compliance checker — what was "Frontend Lead" there?**
Team size, decisions, integration with Revit API and AI feedback loop.

**59. Smart education platform — what did the AI do and what did you build?**

**60. LTIMindtree — what are "headless and standalone widgets"?**
Embeddable React widgets mounted into host pages; style isolation (CSS Modules/Shadow DOM), versioning, bundle size, communication with host page.

**61. Why GraphQL for the airline site? Problems?**
Aggregation across services; N+1 queries, caching (Apollo normalized cache), error handling with partial data, query complexity.

**62. Working with a major client in a large services company — what did you learn?**
Process, documentation, reviews, release cycles.

**63. Slaylink — what did you own end to end with Next.js, NestJS, GraphQL, MongoDB?**

---

## 🧱 Skills section probes (be ready for 2–3 questions on each item you list)

**64. React Query vs Redux — when each?** (see 08)
**65. Zustand — where have you used it?**
**66. WebSocket vs SSE — where did you use each?**
**67. NestJS — modules, providers, guards, interceptors?**
**68. GraphQL — resolvers, N+1 and DataLoader, caching?**
**69. PostgreSQL vs MongoDB — when each? Indexing basics?**
**70. Redis — what did you use it for (cache, pub/sub, LiveKit routing, Celery broker)?**
**71. Docker — multi-stage builds, image size, layer caching?**
**72. GitHub Actions — pipeline you built?** (see 02)
**73. Sentry — source maps, release tracking, PII scrubbing?**
**74. Grafana/Prometheus — which dashboards/alerts did you create?**
**75. Shell scripting — example script you wrote?**
**76. Webpack/Babel — configuration you've customized?**
If you can't answer 2–3 questions on a skill, remove it or move it to "familiar with".

---

## 🔧 Resume fixes (apply before applying — see 22-resume-template)

1. **Summary is generic.** Replace with a positioning line: *"Senior Frontend Engineer who owns architecture for real-time and AI-powered healthcare and call-centre products — React 19, TypeScript, LiveKit/WebRTC, secure multi-tenant SaaS."*
2. **Bullets cram 3–4 achievements.** One achievement per bullet, metric at the end.
3. **Keep "projected"** on the 40% and 10x claims.
4. **Ownership clarity.** Be ready to say what you did vs the team.
5. **Delete** "Continuously staying up-to-date with the latest technologies…" — not an achievement.
6. **2023–2025 role lacks metrics.** Add one true number per bullet or keep it outcome-focused.
7. **Projects (Blood Bank, Quiz App)** read as college-level for a senior; replace with one strong project (20-project-ideas) or remove.
8. **Skills:** group by depth; remove what you can't defend.
9. **Headline:** keep two versions — Senior Frontend Engineer / Senior Full-Stack Engineer — matched to the JD.

## 🤖 ATS — what actually matters
- ATS parses and keyword-matches; the recruiter's 10-second skim is the real filter.
- Single column, standard headings (Summary, Skills, Experience, Education), real text (no images/tables for content), PDF export, standard fonts.
- Mirror the JD's exact terms where true ("React.js", "Next.js", "micro-frontends", "WCAG 2.1 AA", "Jest/RTL").
- Strongest metric in the first bullet of the current role.
- File name: `Firstname_Lastname_Role.pdf`.

## 🏁 Standing out
- A link proving depth: a public write-up or demo (e.g., "Self-hosting LiveKit: lessons" or "Streaming AI chat with auth") without client code or data.
- Referrals convert far better than cold applications.
- Tailor the top 3 bullets to each JD — 10 minutes per application.
- Keep LinkedIn headline, About and experience consistent with the resume.
