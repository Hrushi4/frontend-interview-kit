# 18 — Behavioural, Situational and Leadership

Senior candidates are often rejected in this round, not in coding. Prepare stories, not answers.

**How this file is organised**

- **Part A — Understand the topic:** what behavioural interviews test, the STAR(L) method, and how to build a story bank.
- **Part B — Questions with full sample answers:** Basic HR → Situational → Senior/Leadership → Company-style notes → Questions to ask → Red flags.

The sample answers use the facts on your resume. Anything in **[square brackets]** is a detail you must replace with your real one. Never present a detail you can't back up.

---

## Part A — Understand the Topic

### What is a behavioural interview?

A behavioural interview uses your **past behaviour to predict future behaviour**. Questions usually start with "Tell me about a time when…". The interviewer isn't looking for a "correct" answer. They're checking:

- **Ownership:** did *you* drive it, or just take part?
- **Judgement:** how did you make decisions and handle trade-offs?
- **Collaboration:** how do you work with others, handle conflict and influence people?
- **Growth:** do you learn from mistakes and feedback?
- **Impact:** what changed because of you, and can you measure it?

For senior roles, they also assess **leadership without authority**: mentoring, setting standards, and driving decisions across teams.

### The STAR(L) method

| Part | What to say | Share of the answer |
|---|---|---|
| **S**ituation | the context and stakes, in 1–2 lines | 10% |
| **T**ask | what *you* were responsible for | 10% |
| **A**ction | what *you* did: decisions, trade-offs, how you influenced others | **60%** |
| **R**esult | a number plus the business impact | 15% |
| **L**earning | what you learned or would do differently | 5% |

### Rules

- Say "**I**" for your actions and "**we**" for team outcomes, and be honest about who did what.
- Aim for **about 2 minutes** per story, then offer more detail if they want it.
- **Every number must be explainable:** what it measures, how it was measured, the baseline and the period.
- Pick stories with **tension**: conflict, ambiguity, failure, trade-offs. Smooth success stories are forgettable.
- **Never blame** or name colleagues negatively. Describe behaviours and context.

### Why this matters for you

You have strong, measurable stories: the security audit, LiveKit video, testing standards, AI scoring. The risk is telling them as "we did a lot of things". Practise saying exactly what **you** decided and did.

---

## 📚 Your Story Bank (Fill In Each With Real Details Before Interviews)

**Template:**

```text
S: context and stakes (who was affected, why it mattered)
T: what I owned
A: 3–4 concrete actions, decisions, trade-offs, how I influenced others
R: metric + outcome (+ what remained)
L: what I learned / would do differently
```

| # | Story (from your resume) | Use it for |
|---|---|---|
| S1 | Security and reliability audit: 8 critical issues in RBAC, JWT/OAuth and PHI storage; findings down 85% | ownership, quality, influencing without authority, prioritisation, dealing with risk |
| S2 | LiveKit real-time video: 150 concurrent sessions, 99% reconnect success, join under 5 s | hardest technical problem, debugging, customer impact, persistence |
| S3 | Self-hosted LiveKit on AWS: projected 40% cost cut, 10x capacity | business thinking, build vs buy, convincing leadership, decisions with incomplete data |
| S4 | Testing standards and mentoring 15 developers; production bugs down 30% | mentoring, raising the bar, changing team culture, process improvement |
| S5 | AI scoring pipeline (LangChain + OpenAI + Celery) over 40k+ calls a month; 5x throughput | learning fast, cross-team collaboration, technical depth |
| S6 | BpoBox role-based QA portals; review time down 60% | customer focus, product sense, working with PMs and users |
| S7 | A failure: a production incident, missed estimate or wrong decision (choose a real one) | accountability, resilience, learning |
| S8 | A disagreement with a PM, peer or senior about scope or approach (choose a real one) | conflict, communication, disagree-and-commit |
| S9 | An early-career story (LTIMindtree airline widgets or Slaylink) | growth, large client environments, adaptability |
| S10 | An ambiguous requirement you clarified (e.g. the WCAG compliance scope, or tenant needs) | ambiguity, stakeholder management |

### Full example: S1, the security audit (≈2 minutes when spoken)

**Situation:** "InterpretIQ is a healthcare interpretation app, so it handles patient health information. As we added features quickly, access control and token handling had grown organically, and nobody had reviewed them end to end."

**Task:** "It wasn't formally assigned, but I took ownership of a security and reliability review across our React frontend and FastAPI backend."

**Action:** "I started by mapping every role (patient, provider, interpreter, admin) and how data flowed between them. Then I tested every API endpoint as each role and tenant. I reviewed where and how we stored tokens, and searched our logs, browser storage and error tracking for any PHI. I rated each finding by severity and impact, and proposed fixes in priority order. For the server-side permission checks, I paired with the backend developers rather than just filing tickets, which got them fixed faster. Every fix came with a regression test."

**Result:** "We found 8 critical issues. For example, [permissions enforced only in the UI, tokens in localStorage, PHI appearing in error logs]. The re-audit showed 85% fewer findings, measured as [open findings: X before, Y after]. The remaining items were lower severity and tracked with owners."

**Learning:** "A one-off audit isn't enough. Afterwards I pushed for an automated authorisation test matrix in CI, so these issues can't silently return."

### Full example: S2, LiveKit real-time video

**Situation:** "InterpretIQ connects patients, providers and interpreters on live video, often on hospital Wi-Fi and tablets. Calls dropping, or taking too long to join, directly delayed patient care."

**Task:** "I owned the real-time video frontend: joining, reconnection and call stability."

**Action:** "First I instrumented the join flow, measuring from clicking Join to the first remote video frame, so we could see where the time went. I found serial API calls before connecting, the SDK loading only on click, and the permission prompt adding delay. I moved the token fetch and the camera warm-up onto the pre-join screen and lazy-loaded the SDK there. For reliability, I modelled the call as a state machine, kept the Room object outside React state so re-renders couldn't break it, and implemented a resume-first reconnect strategy: an ICE restart first, then a full rejoin with backoff and a fresh token. I added a non-blocking 'Reconnecting…' banner instead of tearing down the video."

**Result:** "Join time came down to under 5 seconds, and reconnect success reached 99%, measured as [reconnect events that recovered within N seconds, over a period]. The system supported 150 concurrent sessions [state the source: production peak or load test]."

**Learning:** "Measure before optimising. The instrumentation showed the bottleneck wasn't where we assumed."

### Full example: S4, testing standards and mentoring 15 developers

**Situation:** "We were shipping fast with 15 developers across two products, but production bugs kept slipping through, and testing was inconsistent from developer to developer."

**Task:** "I wanted to raise the quality bar without slowing the team down."

**Action:** "I wrote a short testing guideline with real examples from our codebase: React Testing Library with user-centric queries, MSW for API mocking, and Playwright for the critical flows. I created templates so writing the first test was easy, ran two short workshops, and paired with developers on their first tests. Instead of enforcing everything at once, I made CI checks stricter gradually, starting with critical modules like auth and the call flow. I also introduced a rule that every bug fix ships with a regression test, and added a testing checkbox to the PR template."

**Result:** "Production bugs dropped by 30%, measured as [bug tickets or new Sentry issues per release, quarter over quarter]. Several developers started reviewing tests in each other's PRs on their own initiative, which told me the culture had shifted."

**Learning:** "Standards stick when they're easy to follow and their value is visible. Showing a bug that a new test caught convinced people more than any rule did."

### Full example: S3, self-hosting LiveKit (a decision with incomplete data)

**Situation:** "Our managed video costs were growing with usage, and leadership asked whether we should self-host."

**Task:** "I evaluated build vs buy and designed the self-hosted architecture."

**Action:** "I built a cost model comparing managed per-minute pricing against EC2, data transfer and the operational time it would cost us. I designed the architecture (SFU nodes, Redis routing, TURN over TLS, autoscaling and monitoring) and listed the operational risks honestly: on-call, upgrades, security patching. To limit risk, I proposed a phased approach: [staging first, then a share of traffic], with a rollback path."

**Result:** "The projection showed about 40% cost savings and capacity for 10x traffic. I always present those as projections, because they rest on assumptions about utilisation and growth that we planned to validate with load testing."

**Learning:** "For build-vs-buy decisions, the hidden cost is operations. Making it explicit is what earned leadership's trust in the recommendation."

---

## Part B — Questions with Sample Answers

## 🟢 Basic HR Questions

**Q1. Tell me about yourself. (60–90 seconds)**

**Structure:** present → highlights → why this role.

**Sample answer:** "I'm a Senior Software Engineer at Arcitech with over four years of experience in React and TypeScript. I own the frontend architecture for two products. InterpretIQ is a WCAG-compliant medical interpretation PWA with real-time LiveKit video, where I brought join time under 5 seconds and reconnect success to 99%. BpoBox is a multi-tenant AI QA platform used by 5 tenants and 1,500 users, where our role-based portals cut QA review time by 60%. Recently I led a security and reliability audit that found 8 critical issues, and I set testing standards across a team of 15 developers. I'm looking for a role where I can [the JD's core problem, e.g. 'own frontend architecture for a product at larger scale'], which is exactly the work I've enjoyed most."

---

**Q2. Why are you looking for a change?**

**Approach:** Keep it positive and forward-looking: scale, scope, domain, learning. Never criticise your employer.

**Sample answer:** "I've grown a lot at Arcitech, from Software Engineer to Senior, owning architecture for two products. I'm now looking for a larger scale and a team where I can go deeper on frontend architecture and platform work, and learn from engineers working on [the company's specific challenge]. It's about the next step, not about leaving something behind."

---

**Q3. Why this company, and why this role?**

**Approach:** Show research (the product, the technical challenges, the engineering blog, the values) and connect it to your experience.

**Sample answer:** "I've used [product] and read your engineering post about [topic]. The challenges you describe, [real-time collaboration / scale / accessibility], are very close to what I've worked on with LiveKit video and multi-tenant dashboards. This role's focus on [JD point] matches where I want to grow."

---

**Q4. What are your strengths?**

**Sample answer:** "Two stand out. First, ownership of reliability. Nobody assigned the security audit, but I saw the risk in a healthcare app handling PHI and drove it to 8 fixed critical issues. Second, making teams faster and better. The testing standards I introduced cut production bugs by 30% without slowing delivery."

---

**Q5. What is your biggest weakness?**

**Approach:** Pick something real but not fatal, and show active improvement.

**Sample answer:** "I used to take too much on myself. When something was urgent, I'd fix it rather than delegate. With 15 developers, that made me a bottleneck. I've learned to write clearer tickets, give ownership of whole features, and review rather than rewrite. It's still something I watch, especially under deadline pressure."

---

**Q6. Where do you see yourself in 3–5 years?**

**Sample answer:** "Growing in both depth and scope: owning frontend architecture or a platform area at staff level, setting technical direction, and mentoring other engineers. I'd like to stay hands-on, because I enjoy building, but with a broader impact on how teams build."

---

**Q7. Why should we hire you?**

**Approach:** Map three JD requirements to three proofs from your work.

**Sample answer:** "You need [React architecture at scale], and I own the architecture for two production products. You need [real-time features], and I built the LiveKit video layer with 99% reconnect success. You need [quality and mentoring], and my testing standards across 15 developers cut production bugs by 30%."

---

**Q8. What are you most proud of?**

**Sample answer:** Use S2 (LiveKit reliability) or S1 (the security audit). Explain why it mattered to patients or customers, not just the technical win.

---

**Q9. Describe your current role and responsibilities.**

**Sample answer:** "I'm a Senior Software Engineer at Arcitech. I own the frontend architecture for InterpretIQ and BpoBox, and I contribute to the backend where reliability needs it, like FastAPI permission checks and the AWS infrastructure design. I work closely with our PM, the backend and DevOps engineers, and [the account manager for client-facing topics]. I set frontend standards and mentor developers across the team."

---

**Q10. How do you handle pressure and deadlines?**

**Sample answer:** "I prioritise by impact, communicate early, and cut scope rather than quality on critical paths. For example, before a [client demo or launch], we were behind. I split the feature into must-haves and nice-to-haves, agreed the cut with the PM, and kept tests on the critical flows. We shipped the core on time and the rest the following sprint."

---

**Q11. How do you keep learning?**

**Sample answer:** "I read release notes for React, Next.js and TypeScript, and try new features in small side projects before using them at work. I read engineering postmortems from other companies, because they teach a lot about failure modes. I also write internal docs. Explaining something forces me to understand it properly."

---

**Q12. What are your notice period, expected compensation and relocation preferences?**

**Approach:** Be honest about your notice period, research market ranges, give a range anchored on the scope of the role, and state your flexibility clearly.

---

**Q13. Can you explain any gaps or short tenures?**

**Sample answer:** "My Slaylink role was about six months. [The factual reason.] I learned a lot there about owning a product end to end with Next.js, NestJS and GraphQL, and that experience helped me take on architecture ownership at Arcitech."

---

## 🟡 Situational Questions (with Sample Answers)

**Q14. Tell me about a time you disagreed with your manager or a senior engineer.** → S8

**Approach:** Show that you disagreed with data, listened, proposed an experiment or compromise, and committed once the decision was made.

**Sample answer:** "Our PM wanted to ship [feature] without [tests / accessibility support] to hit a date. I was concerned, because the feature touched [patient data / the call flow]. Instead of just objecting, I estimated the risk and what it would take: [two extra days for tests on the critical path]. I proposed shipping the core on time behind a feature flag, with the tests landing before we enabled it for all users. The PM agreed. Where we disagree and the decision goes the other way, I commit fully and make sure the risk is documented."

---

**Q15. Tell me about a time you made a mistake in production.** → S7

**Approach:** Own it fast, mitigate, communicate, find the root cause, and prevent it happening again.

**Sample answer:** "I shipped a change to [the reconnect logic / a caching rule] that caused [the symptom] for some users. When the alert came in, I rolled back within [X minutes] and posted an update in our incident channel. The root cause was [an edge case I hadn't tested, e.g. switching networks mid-call]. I added a test for that scenario and a check to our release checklist. I also shared a short write-up so others could learn from it. The lesson for me was that changes on the critical path need a test of the failure mode, not just the happy path."

---

**Q16. Tell me about a time you missed a deadline.**

**Sample answer:** "On [feature], I underestimated [the integration complexity]. The warning sign was [a third-party API behaving differently from its docs] in the first few days. I should have raised it then, but I raised it a few days later. I gave the PM a revised estimate with options. We cut [a secondary feature] and delivered the core [X days] late. Since then, I spike risky integrations first and give ranges instead of single dates."

---

**Q17. Tell me about a time requirements were unclear.** → S10

**Sample answer:** "We were told InterpretIQ had to be 'accessible'. That's very vague. I asked which standard and level the client needed, and it was WCAG 2.1 AA. I listed what that meant for our screens, built a small prototype of the call screen with keyboard support and screen-reader announcements, and got sign-off on it. That turned a vague request into a checklist we could test against."

---

**Q18. Tell me about a time you had to learn something quickly.** → S2 or S5

**Sample answer:** "When we started InterpretIQ, I hadn't worked with WebRTC. I read the LiveKit docs and the WebRTC fundamentals (ICE, TURN, SFU), built a throwaway prototype in [two days] to learn the event model, and then designed the production architecture. Within [a few weeks], we had stable calls in staging."

---

**Q19. Tell me about a time you improved a process.** → S4

Use the testing-standards story, with the before and after metrics.

---

**Q20. Tell me about a time you went beyond your role.** → S1

Use the security audit. Emphasise that it wasn't assigned: you saw the risk and acted.

---

**Q21. Tell me about a time you handled a difficult stakeholder.**

**Sample answer:** "A [client-side stakeholder] kept asking for urgent changes directly to developers, which disrupted the sprint. I set up a short call to understand their goals. Their real worry was [a demo to their leadership]. We agreed on a priority list for the demo and routed new requests through [the account manager and PM]. The demo went well, and the direct requests stopped because they trusted the process."

---

**Q22. Tell me about a time you said no to a request.**

**Sample answer:** "We were asked to store patient details in the browser so the app would load faster offline. I explained the risk: PHI in browser storage on shared clinic tablets. I offered an alternative: cache only the app shell, and keep data loading fast with prefetching. They accepted it, and we hit the performance goal without the compliance risk."

---

**Q23. Tell me about a time you received tough feedback.**

**Sample answer:** "A senior colleague told me my PR reviews were too blunt and some developers felt discouraged. I didn't enjoy hearing it, but they were right. I started explaining *why* in my comments, separating blocking issues from nits, and pointing out things done well. Over the next months, developers started asking me for reviews."

---

**Q24. Tell me about a time you gave tough feedback.**

**Sample answer:** "A developer kept shipping PRs without tests, which caused regressions. I talked to them privately, gave specific examples, and asked what was getting in the way. It turned out they weren't confident writing tests for async code. We paired on two tests, and I shared our templates. Their next PRs included tests, and I made a point of recognising it."

---

**Q25. Tell me about a time a teammate wasn't performing.**

**Sample answer:** "A teammate was missing estimates repeatedly. I first tried to understand the blockers, and they were stuck on unfamiliar parts of the codebase. I clarified expectations, paired with them for a week, and broke work into smaller tasks with daily check-ins. Their delivery became predictable within [a month]. If it hadn't improved, I'd have involved our manager, with documented examples and the support we'd already tried."

---

**Q26. Tell me about competing priorities across two products.**

**Sample answer:** "InterpretIQ had a reconnect bug affecting live calls in the same week as a BpoBox feature deadline. I prioritised by impact and risk: patient calls dropping was more urgent. I told the BpoBox PM about the delay immediately with a new date, delegated a well-defined part of the BpoBox feature to a teammate, and fixed the reconnect bug first. Both shipped within [two days] of the original plan."

---

**Q27. Tell me about a decision you made with incomplete data.** → S3

Use the self-hosting story: what you knew, your assumptions, how you limited risk (reversible steps, pilots), and the outcome.

---

**Q28. Tell me about a time you simplified something complex.**

**Sample answer:** "Data fetching across our app used hand-written `useEffect` code, with loading flags, caching and race-condition bugs scattered everywhere. I introduced a query library, migrated one feature as an example, and wrote a short guide. Each migrated feature lost about [X] lines of code, and a whole class of stale-data bugs disappeared."

---

**Q29. Tell me about handling a production incident under pressure.**

**Sample answer:** "During business hours, calls started failing to connect for [one region or tenant]. I focused on mitigation first. We switched traffic to [a backup region or fallback configuration] within [X minutes]. I posted status updates every 15 minutes so support could inform clinics. Afterwards I led a blameless postmortem. The root cause was [an expired certificate or a TURN configuration issue], and we added monitoring and an alert so it couldn't happen silently again."

---

**Q30. Tell me about working with a remote or cross-functional team.**

**Sample answer:** "Our backend and DevOps engineers were in different locations. I relied on written design docs, clear ownership, and a short overlap window for decisions. For the LiveKit infrastructure, a shared design doc with open questions saved us many meetings."

---

## 🔴 Senior and Leadership Questions

**Q31. How do you mentor developers?** → S4

**Sample answer:** "In four ways. Code reviews that explain *why*, not just what to change. Pairing on hard problems. Involving people in design reviews, so they learn how decisions are made. And giving ownership of whole features, with support. For example, [a developer, anonymised] was hesitant about frontend architecture. I gave them ownership of [the scorecard module], reviewed their design doc with them, and within [a few months] they were reviewing other people's PRs in that area."

---

**Q32. How do you make architecture decisions in a team?**

**Sample answer:** "I start by writing down the problem, then list two or three options with their trade-offs. If something's uncertain, I build a small spike. I write a short RFC or architecture decision record, get feedback from the people affected, decide, and note what would make us revisit the decision. That's how we chose [Redux for session state / RTK Query / self-hosting]."

---

**Q33. How do you balance speed vs quality?**

**Sample answer:** "I classify work by risk. Critical paths (auth, PHI, the call flow) get thorough tests and reviews. Experiments behind feature flags can move faster with lighter testing. I track any shortcuts as explicit tech debt with an owner, so speed today doesn't become a hidden cost."

---

**Q34. How do you handle technical debt?**

**Sample answer:** "I make it visible, as a list with the impact of each item. I tie it to business outcomes like incidents and slower delivery, reserve some capacity every sprint, and fix things opportunistically when we're already touching that code. A debt list that's linked to incidents gets prioritised. 'Code is ugly' doesn't."

---

**Q35. How do you estimate work?**

**Sample answer:** "I break the work into tasks, identify the unknowns, and spike the risky parts first. I give ranges rather than single numbers, and I update estimates early when the scope changes. A late surprise is worse than an honest range."

---

**Q36. How do you onboard new engineers?**

**Sample answer:** "A setup doc that actually works (tested by the last person to join), an architecture overview, starter tasks, and a buddy. The goal is a first merged PR in week one, and a feedback conversation after 30 days."

---

**Q37. How do you introduce a new tool or standard to a reluctant team?** → S4

**Sample answer:** "I show the pain with data, pilot it with volunteers, provide templates and examples, make enforcement automatic gradually, and gather feedback. People adopt what makes their life easier, so I make the new way the easy way."

---

**Q38. How do you handle disagreement within your team on a technical approach?**

**Sample answer:** "First we agree on the criteria: performance, maintainability, time. If it's cheap, we prototype both options. Then we decide, document why, and everyone commits. Separating the criteria from the options takes the ego out of it."

---

**Q39. How do you work with product managers?**

**Sample answer:** "I share their goals and metrics, give early input on feasibility, and discuss trade-offs openly. I'm clear about risks and timelines. I respect role boundaries, so client communication goes through the account owner."

---

**Q40. How do you handle being the single point of knowledge?**

**Sample answer:** "I treat it as a risk to fix: documentation, pairing, rotating ownership and runbooks. For the LiveKit integration, I wrote a runbook and paired with two developers until they could handle incidents without me."

---

**Q41. What does a great code review look like?**

**Sample answer:** "It checks correctness, security, readability, tests and performance. It explains *why*, separates blocking issues from nits, happens quickly, ideally within a day, and calls out good work."

---

**Q42. How do you handle incidents as a lead?**

**Sample answer:** "I assign roles (incident lead, communications, investigators), mitigate before investigating, keep a timeline, and send regular status updates. Afterwards, a blameless postmortem with action items that are actually tracked to completion."

---

**Q43. How do you build trust with leadership, for example when reporting to a CEO or CTO?**

**Sample answer:** "Predictable delivery, early communication of risks, framing technical decisions in business terms (cost, risk, speed), and concise written updates. With the self-hosting proposal, I led with cost and risk, not the technology."

---

**Q44. Build vs buy: how do you decide?** → S3

**Sample answer:** "I look at the total cost (building, maintaining and operating it), whether it differentiates us, time to market, compliance, vendor risk, and the exit strategy. For video, the managed service made sense early. At our scale the cost model changed, so we designed a self-hosting path, while being honest about the operational burden."

---

**Q45. How do you measure your team's success?**

**Sample answer:** "Delivery predictability, production quality (incidents and escaped bugs), user metrics, developer experience (cycle time and review time), and the growth of the people on the team."

---

## 🏢 Company-Style Notes

- **Amazon:** the Leadership Principles: Customer Obsession, Ownership, Dive Deep, Bias for Action, Deliver Results, Earn Trust, Have Backbone; Disagree and Commit, Learn and Be Curious, and others. Prepare two stories per principle. The "bar raiser" probes depth ("What exactly did *you* do?").
- **Google:** structured behavioural questions plus "Googleyness": collaboration, comfort with ambiguity, humility, doing the right thing.
- **Microsoft, Meta, Apple:** collaboration, impact and a growth mindset. Senior loops include a deep dive into a past project.
- **Service MNCs (TCS, Infosys, Wipro, Accenture, Cognizant, Capgemini):** client handling, adaptability, Agile and Scrum experience, flexibility on shifts and locations, process awareness.
- **Consulting and the Big 4 (Deloitte, PwC, EY):** stakeholder communication, structured thinking, documentation.
- **Startups:** speed, end-to-end ownership, wearing multiple hats, comfort with ambiguity.

---

## ❓ Questions You Should Ask (Pick 2–3)

- What does success look like in the first 90 days?
- What's the biggest technical challenge the frontend team faces right now?
- How are architecture decisions made and documented?
- How is production ownership or on-call handled for the frontend?
- How do you measure engineering quality and developer experience?
- What would make someone excel in this role, rather than just do well?

---

## 🚫 Red Flags to Avoid

- Blaming previous teams or managers, or naming colleagues negatively.
- Vague "we did" answers that never say what you contributed.
- Numbers you can't explain, or projected numbers presented as achieved.
- Rambling past 3 minutes, or a story with no result or learning.
- Having no questions for the interviewer.
- Telling inconsistent stories in different rounds.
