# 20 — 10 Portfolio Projects That Extend Your Story

**How this file is organised**

- **Part A — Understand the topic:** why a portfolio project matters for a senior engineer and what makes one impressive.
- **Part B — The 10 projects:** what each one is, what it proves, and how to build it.
- **Part C — Interview questions about your project, with sample answers.**

---

## Part A — Understand the Topic

### Why a portfolio project matters

Your professional work is under NDA. Interviewers can't see InterpretIQ's code or BpoBox's dashboards. A **public project** lets them verify your skills directly, and it gives you a story you can show, not just tell.

Right now, "Blood Bank" and "Quiz App" read as college projects next to a senior title. Replace them with **one** strong project that's done properly:

- a public repo
- a README with an architecture diagram
- a live demo
- tests
- a Lighthouse score
- a short write-up

**Depth beats count.** One excellent project is worth more than five toy apps.

**Important:** use fake or synthetic data only. Never use client code or data.

### What makes a portfolio project impressive

1. **It solves a real problem**, ideally one from your domain (real-time, AI, multi-tenant, accessibility).
2. **It shows senior habits:** tests, CI, accessibility, error states, performance numbers, security.
3. **It explains its decisions:** the README covers trade-offs, not just setup steps.
4. **It's easy to try:** a one-command run, a live demo and a GIF at the top.

---

## Part B — The 10 Projects

| # | Project | What it proves | Upgrade path |
|---|---|---|---|
| 1 | **Open-source video room kit**: React + LiveKit (self-hosted with Docker Compose), pre-join device check, reconnect state machine, accessible controls | your real-time expertise, publicly verifiable | captions, a recording-consent flow, a network-quality UI, Playwright tests with fake media |
| 2 | **Streaming AI chat starter**: Next.js BFF + SSE/fetch streaming, abort, retry, sanitised markdown, citations | AI UX + security | RAG over your docs, an eval dashboard, a prompt-injection test suite |
| 3 | **Accessible headless component library**: Radix-style primitives, tokens, Storybook, axe tests, visual regression, published to npm | design-system leadership | per-"tenant" theming, codemods for breaking changes, a docs site |
| 4 | **Multi-tenant SaaS dashboard template**: tenant via subdomain, RBAC route guards, tenant-scoped query cache, CSV export job | your BpoBox architecture, generalised | an audit log, per-tenant feature flags, usage metering |
| 5 | **Call QA scorecard + transcript player**: an audio player with transcript sync, AI-flagged moments (mocked), a scorecard form builder | domain depth + tricky UI | a waveform view, a keyboard-first reviewer mode, reviewer agreement stats |
| 6 | **Frontend security playground**: a vulnerable mini-app plus a fixed version (XSS, CSRF, token storage, IDOR, CSP) | security credibility | a CSP report collector, automated authorisation matrix tests |
| 7 | **Web performance lab**: the same page built with CSR, SSR, RSC and ISR, plus a RUM (web-vitals) dashboard | performance + Next.js depth | INP stress tests, before-and-after case studies |
| 8 | **Offline-first PWA**: tasks stored in IndexedDB, background sync, conflict resolution | PWA expertise | CRDT (Yjs) sync across devices |
| 9 | **Real-time collaborative whiteboard**: canvas + Yjs + WebSocket, presence cursors, undo and redo | a system-design favourite | persistence, permissions, export |
| 10 | **Micro-frontend demo**: a host plus two remotes via Module Federation, a shared design system, independent deploys | architecture breadth | versioned contracts, error isolation, a performance budget per remote |

**Best pick for you:** #1 or #2. Both show your real-time and AI depth publicly, without exposing any client code or data.

### Project 1 in more detail: video room kit

**What it is:** A small open-source starter that anyone can clone to get a working, accessible video call app on their own LiveKit server.

**Features to build, in order:**

1. Docker Compose with a LiveKit server and a tiny token server (Node or FastAPI).
2. A pre-join screen: camera preview, mic level meter, device selectors, permission error handling.
3. The call screen: a responsive video grid, a control bar (mute, camera, screen share, leave), an active-speaker highlight.
4. A connection state machine with a non-blocking "Reconnecting…" banner.
5. Accessibility: `aria-pressed` toggles, keyboard shortcuts, live-region announcements.
6. Playwright tests that use Chrome's fake media devices.
7. A README with an architecture diagram, join-time measurements and trade-offs.

**What you can say in interviews:** "I open-sourced a video room kit that captures what I learned building InterpretIQ: the pre-join flow, the reconnect state machine and accessible controls. It's public, so you can see how I structure real-time code."

### Project 2 in more detail: streaming AI chat starter

**What it is:** A Next.js template for an AI chat done properly.

**Features to build, in order:**

1. A route handler that streams from an LLM provider (the key stays on the server).
2. A client that reads the stream with `fetch`, has a Stop button (AbortController), retry and regenerate.
3. Tokens buffered per animation frame, and sanitised markdown rendering.
4. Rate limiting per user.
5. RAG over a few public documents, with citations.
6. A small eval suite and a prompt-injection test set.

**What you can say in interviews:** "It's a public version of the patterns from our compliance chat: streaming through a BFF, safe rendering, cancellation, and evals. It shows how I'd build AI features responsibly."

---

## README Checklist (What Interviewers Actually Open)

- A one-line problem statement and a GIF.
- An architecture diagram, plus the key decisions and trade-offs.
- A one-command run, tests, and a CI badge.
- Lighthouse and accessibility results.
- A "What I'd do next" section.

---

## Build Levels for Any Project

| Level | What to include | What it shows |
|---|---|---|
| 🟢 Basic (1 weekend) | core feature working, TypeScript, responsive, README with screenshots | you can ship |
| 🟡 Intermediate (1–2 weeks) | tests (RTL + Playwright), CI on GitHub Actions, an accessibility pass (axe + keyboard), error and loading states, a deployed demo | professional habits |
| 🔴 Advanced (3–4 weeks) | an architecture write-up with trade-offs, performance numbers (Lighthouse/RUM), security (CSP, auth), observability (Sentry), feature flags or real-time, load testing where relevant | senior-level ownership |

---

## Part C — Questions Interviewers Ask About Portfolio Projects (with Sample Answers)

The sample answers use **Project 1 (video room kit)**. Adapt them to whichever project you build.

### 🟢 Basic

**Q1. Why did you build this? What problem does it solve?**

**Sample answer:** "Most WebRTC examples stop at 'two people see each other'. Production needs a pre-join device check, graceful reconnection and accessibility, and those are exactly the hard parts I solved at work. I built an open version so other developers have a solid starting point, and so I can show that work publicly without exposing client code."

---

**Q2. Walk me through the tech stack and why you chose each piece.**

**Sample answer:** "React with TypeScript for the UI, and LiveKit as the SFU, because it's open source and can be self-hosted with Docker. A tiny Node server issues short-lived room tokens, so keys never reach the browser. I used Vite rather than Next.js, because it's a fully authenticated, real-time app with no SEO needs. Playwright, because it supports fake media devices for testing calls."

---

**Q3. What was the hardest bug, and how did you find it?**

**Sample answer:** "Video tiles flickered black whenever someone joined. Using React DevTools' highlight-updates feature, I saw that every tile was remounting. I was keying tiles by array index, so a new participant shifted the keys. Switching to the participant's SID as the key fixed it. Now I always check key stability when something remounts unexpectedly."

---

### 🟡 Intermediate

**Q4. How is state managed? Why that approach?**

**Sample answer:** "The call lifecycle is a reducer-based state machine (idle, checking devices, connecting, connected, reconnecting, failed), because the transitions are complex and impossible states must be impossible. The LiveKit Room object lives in a ref inside a provider, not in state, because it's not serialisable and must never be recreated by a re-render. Audio levels bypass React state entirely and go through a CSS variable updated in requestAnimationFrame."

---

**Q5. How did you test it? What isn't tested, and why?**

**Sample answer:** "The reducer has unit tests for every transition. Components are tested with React Testing Library, and Playwright runs end-to-end tests with fake camera and mic devices, covering join, mute, leave, and simulated network loss. What isn't automated is real network conditions across different devices. I tested those manually with network throttling and documented the results."

---

**Q6. How did you handle loading, error and empty states?**

**Sample answer:** "Every state in the machine has a UI. Permission denied shows browser-specific steps to fix it. No camera found offers to join audio-only. Connecting shows a spinner after 300 ms. Reconnecting shows a banner without tearing down the video. Failed shows a clear Rejoin button. A room with nobody else in it shows 'Waiting for others to join' instead of an empty grid."

---

**Q7. How did you make it accessible, and how did you verify it?**

**Sample answer:** "Real buttons with `aria-pressed` for the toggles, labels that change with state ('Unmute microphone'), keyboard shortcuts declared with `aria-keyshortcuts`, and a polite live region announcing joins, leaves and reconnects. I verified it with axe in the Playwright tests, a keyboard-only pass, and NVDA and VoiceOver on the main flows."

---

**Q8. How is it deployed? What happens on a bad deploy?**

**Sample answer:** "The frontend is static on a CDN with hashed assets, so a rollback just means pointing back to the previous build. The token server and LiveKit run as Docker containers. CI runs lint, typecheck, tests and the Playwright suite before deploying, and a smoke test after deploying checks that a test room can be joined."

---

### 🔴 Advanced

**Q9. What would break first at 100x users, and how would you fix it?**

**Sample answer:** "A single LiveKit node's CPU and bandwidth. I'd scale horizontally with multiple SFU nodes and Redis for room routing, autoscale on CPU and participant count, and add TURN servers in more regions. On the client, I'd make sure adaptive stream and dynacast are on, and limit the number of visible video tiles."

---

**Q10. What trade-offs did you make, and which would you revisit?**

**Sample answer:** "I chose a reducer over XState to keep dependencies small. As the number of states grows, I'd revisit that, because XState's visualiser and guards would help. I also skipped end-to-end encryption to keep it simple. For a healthcare use case, I'd add it."

---

**Q11. How did you measure performance? What did you optimise, and by how much?**

**Sample answer:** "I measured join time with User Timing marks, from clicking Join to the first remote frame. Moving the token fetch and SDK loading onto the pre-join screen took it from [X seconds] to [Y seconds] on a throttled connection. Lighthouse covers the static parts, and the README has the numbers."

---

**Q12. What are the security risks, and how did you mitigate them?**

**Sample answer:** "Token handling is the main risk. Tokens are created on the server with a short expiry and minimal grants, and room names are random IDs. The app sets a CSP that only allows connections to the API and the LiveKit host. Chat messages render as text only, never as HTML, so XSS through chat isn't possible."

---

**Q13. If a team of five took this over, what would you document or refactor first?**

**Sample answer:** "I'd document the state machine with a diagram and a short architecture decision record explaining why the Room object lives outside React state, because that's the non-obvious part. I'd add a runbook for the LiveKit server. Then I'd split the call screen into feature folders so several people can work on it without conflicts."

---

**Tip:** Write the answers to these questions into the project README. It doubles as interview preparation.
