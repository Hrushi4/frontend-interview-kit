# 20 — 10 Portfolio Projects That Extend Your Story

Replace "Blood Bank" and "Quiz App" with **one** of these, done properly: public repo, README with architecture diagram, live demo, tests, Lighthouse score, and a short write-up. Depth beats count. Use fake/synthetic data only — never client data.

| # | Project | What it proves | Upgrade path |
|---|---|---|---|
| 1 | **Open-source video room kit** — React + LiveKit (self-hosted via Docker Compose), pre-join device check, reconnect state machine, a11y controls | Your real-time expertise, publicly verifiable | Captions, recording-consent flow, network-quality UI, Playwright tests with fake media |
| 2 | **Streaming AI chat starter** — Next.js BFF + SSE/fetch stream, abort, retry, sanitized markdown, citations | AI UX + security | RAG over your docs, eval dashboard, prompt-injection test suite |
| 3 | **Accessible headless component library** — Radix-style primitives, tokens, Storybook, axe tests, visual regression, npm publish | Design-system leadership | Per-"tenant" theming, codemods for breaking changes, docs site |
| 4 | **Multi-tenant SaaS dashboard template** — tenant via subdomain, RBAC route guards, tenant-scoped query cache, CSV export job | Your BpoBox architecture, generalized | Audit log, feature flags per tenant, usage metering |
| 5 | **Call QA scorecard + transcript player** — audio player with transcript sync, AI-flagged moments (mock), scorecard form builder | Domain depth + tricky UI | Waveform view, keyboard-first reviewer mode, reviewer agreement stats |
| 6 | **Frontend security playground** — vulnerable mini-app + fixed version (XSS, CSRF, token storage, IDOR, CSP) | Security credibility | CSP report collector, automated authz matrix tests |
| 7 | **Web performance lab** — same page in CSR/SSR/RSC/ISR with a RUM (web-vitals) dashboard | Perf + Next.js depth | INP stress tests, before/after case studies |
| 8 | **Offline-first PWA** — tasks with IndexedDB, background sync, conflict resolution | PWA expertise | CRDT (Yjs) multi-device sync |
| 9 | **Real-time collaborative whiteboard** — canvas + Yjs + WebSocket, presence cursors, undo/redo | System-design favourite | Persistence, permissions, export |
| 10 | **Micro-frontend demo** — host + 2 remotes via Module Federation, shared design system, independent deploys | Architecture breadth | Versioned contracts, error isolation, perf budget per remote |

## README checklist (what interviewers actually open)
- One-line problem statement + GIF
- Architecture diagram + key decisions and trade-offs
- One-command run, tests, CI badge
- Lighthouse / a11y results
- "What I'd do next"

**Best pick for you:** #1 or #2 — they let you show your real-time and AI depth publicly without exposing any client code or data.

---

## Build levels for any project

| Level | What to include | Shows |
|---|---|---|
| 🟢 Basic (1 weekend) | Core feature working, TypeScript, responsive, README with screenshots | You can ship |
| 🟡 Intermediate (1–2 weeks) | Tests (RTL + Playwright), CI on GitHub Actions, accessibility pass (axe + keyboard), error/loading states, deployed demo | Professional habits |
| 🔴 Advanced (3–4 weeks) | Architecture write-up with trade-offs, performance numbers (Lighthouse/RUM), security (CSP, auth), observability (Sentry), feature flags or real-time, load testing where relevant | Senior-level ownership |

## Questions interviewers ask about portfolio projects

**🟢 Basic**
1. Why did you build this? What problem does it solve?
2. Walk me through the tech stack and why you chose each piece.
3. What was the hardest bug and how did you find it?

**🟡 Intermediate**
4. How is state managed? Why that approach?
5. How did you test it? What isn't tested and why?
6. How did you handle loading, errors and empty states?
7. How did you make it accessible? How did you verify?
8. How is it deployed? What happens on a bad deploy?

**🔴 Advanced**
9. What would break first at 100x users? How would you fix it?
10. What trade-offs did you make, and which would you revisit?
11. How did you measure performance? What did you optimize and by how much?
12. What are the security risks and how did you mitigate them?
13. If a team of five took this over, what would you document or refactor first?

Tip: write the answers to these in the project README — it doubles as interview preparation.
