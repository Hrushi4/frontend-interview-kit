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

For behavioural questions, the four parts work like this: **Short answer** is the key message you want the interviewer to remember, **Explanation** is what they're testing and how to structure your answer, **Example** is the story or detail to use, and **Say it like this** is a full sample answer.

## 🟢 Basic HR Questions

**Q1. Tell me about yourself. (60–90 seconds)**

**Short answer:** A senior React and TypeScript engineer who owns frontend architecture for two products, with measurable wins in real-time video, multi-tenant dashboards, security and team quality.

**Explanation:** They're testing whether you can summarise yourself clearly and whether you fit the role. Structure: present → two or three highlights with numbers → why this role. Don't recite your CV from college onwards.

**Example:** Highlights to choose from: LiveKit join under 5 s and 99% reconnect success; BpoBox serving 5 tenants and 1,500 users with QA review time down 60%; the security audit (8 critical issues); testing standards for 15 developers (bugs down 30%).

**Say it like this:** "I'm a Senior Software Engineer at Arcitech with over four years of experience in React and TypeScript. I own the frontend architecture for two products. InterpretIQ is a WCAG-compliant medical interpretation PWA with real-time LiveKit video, where I brought join time under 5 seconds and reconnect success to 99%. BpoBox is a multi-tenant AI QA platform used by 5 tenants and 1,500 users, where our role-based portals cut QA review time by 60%. Recently I led a security and reliability audit that found 8 critical issues, and I set testing standards across a team of 15 developers. I'm looking for a role where I can [the JD's core problem, e.g. 'own frontend architecture for a product at larger scale'], which is exactly the work I've enjoyed most."

---

**Q2. Why are you looking for a change?**

**Short answer:** For the next step in scale and scope, not to escape something.

**Explanation:** They're checking for red flags such as conflict or job-hopping. Keep it positive and forward-looking: scale, scope, domain, learning. Never criticise your employer.

**Example:** Growth at Arcitech from Software Engineer to Senior, owning architecture for two products, and now wanting larger scale and deeper platform work.

**Say it like this:** "I've grown a lot at Arcitech, from Software Engineer to Senior, owning architecture for two products. I'm now looking for a larger scale and a team where I can go deeper on frontend architecture and platform work, and learn from engineers working on [the company's specific challenge]. It's about the next step, not about leaving something behind."

---

**Q3. Why this company, and why this role?**

**Short answer:** Show specific research and connect their challenges to your experience.

**Explanation:** Generic praise ("great culture") is a weak answer. Mention the product, a technical challenge, an engineering blog post or a value, and link it to work you've done.

**Example:** "Your post on real-time collaboration" → your LiveKit work; "multi-tenant enterprise customers" → BpoBox.

**Say it like this:** "I've used [product] and read your engineering post about [topic]. The challenges you describe, [real-time collaboration / scale / accessibility], are very close to what I've worked on with LiveKit video and multi-tenant dashboards. This role's focus on [JD point] matches where I want to grow."

---

**Q4. What are your strengths?**

**Short answer:** Two strengths, each backed by a result: ownership of reliability, and making teams faster and better.

**Explanation:** Claims without proof are forgettable. Pick strengths that match the job description and prove each with one story.

**Example:** The unassigned security audit (S1), and the testing standards that cut bugs by 30% (S4).

**Say it like this:** "Two stand out. First, ownership of reliability. Nobody assigned the security audit, but I saw the risk in a healthcare app handling PHI and drove it to 8 fixed critical issues. Second, making teams faster and better. The testing standards I introduced cut production bugs by 30% without slowing delivery."

---

**Q5. What is your biggest weakness?**

**Short answer:** Something real but not fatal, with evidence that you're actively improving.

**Explanation:** They're testing self-awareness and honesty. Avoid fake weaknesses ("I'm a perfectionist") and anything core to the role.

**Example:** Taking too much on yourself under pressure, which made you a bottleneck with 15 developers.

**Say it like this:** "I used to take too much on myself. When something was urgent, I'd fix it rather than delegate. With 15 developers, that made me a bottleneck. I've learned to write clearer tickets, give ownership of whole features, and review rather than rewrite. It's still something I watch, especially under deadline pressure."

---

**Q6. Where do you see yourself in 3–5 years?**

**Short answer:** Growing in depth and scope towards staff-level architecture ownership while staying hands-on.

**Explanation:** They want ambition that fits the role and suggests you'll stay. Don't say "in your job" or "running my own startup".

**Example:** Owning a platform area, setting technical direction, and mentoring engineers.

**Say it like this:** "Growing in both depth and scope: owning frontend architecture or a platform area at staff level, setting technical direction, and mentoring other engineers. I'd like to stay hands-on, because I enjoy building, but with a broader impact on how teams build."

---

**Q7. Why should we hire you?**

**Short answer:** Map three of their requirements to three proofs from your work.

**Explanation:** Read the job description beforehand and pick the three things they care about most. This is a closing pitch, so keep it to about 30 seconds.

**Example:** React architecture at scale → two products; real-time → LiveKit; quality and mentoring → testing standards.

**Say it like this:** "You need [React architecture at scale], and I own the architecture for two production products. You need [real-time features], and I built the LiveKit video layer with 99% reconnect success. You need [quality and mentoring], and my testing standards across 15 developers cut production bugs by 30%."

---

**Q8. What are you most proud of?**

**Short answer:** One story where the impact on real people is clear, such as LiveKit reliability (S2) or the security audit (S1).

**Explanation:** Explain why it mattered to patients or customers, not just the technical win. Your pride shows your values.

**Example:** Calls dropping on hospital Wi-Fi delayed patient care; after your work, join took under 5 s and 99% of reconnects recovered.

**Say it like this:** "I'm most proud of the InterpretIQ video reliability work. When a call drops in a hospital, a patient is waiting for an interpreter. I instrumented the join flow, rebuilt reconnection as a state machine, and we got join time under 5 seconds and 99% reconnect success. It's the work where I could most clearly see the impact on real people."

---

**Q9. Describe your current role and responsibilities.**

**Short answer:** Frontend architecture owner for InterpretIQ and BpoBox, contributing to the backend where reliability needs it, and setting standards for the team.

**Explanation:** Show scope (products, team size), collaboration (who you work with) and leadership (standards, mentoring).

**Example:** FastAPI permission checks, AWS infrastructure design, working with the PM, backend and DevOps engineers.

**Say it like this:** "I'm a Senior Software Engineer at Arcitech. I own the frontend architecture for InterpretIQ and BpoBox, and I contribute to the backend where reliability needs it, like FastAPI permission checks and the AWS infrastructure design. I work closely with our PM, the backend and DevOps engineers, and [the account manager for client-facing topics]. I set frontend standards and mentor developers across the team."

---

**Q10. How do you handle pressure and deadlines?**

**Short answer:** Prioritise by impact, communicate early, and cut scope rather than quality on critical paths.

**Explanation:** They want a method, not "I work well under pressure". Give one concrete example.

**Example:** Behind schedule before a client demo, you split must-haves from nice-to-haves and agreed the cut with the PM.

**Say it like this:** "I prioritise by impact, communicate early, and cut scope rather than quality on critical paths. For example, before a [client demo or launch], we were behind. I split the feature into must-haves and nice-to-haves, agreed the cut with the PM, and kept tests on the critical flows. We shipped the core on time and the rest the following sprint."

---

**Q11. How do you keep learning?**

**Short answer:** Release notes, small experiments before production use, reading postmortems, and writing internal docs.

**Explanation:** Show a habit, not a list of courses, and ideally a recent example of something you learned and applied.

**Example:** Trying React 19 Actions in a side project before proposing them at work.

**Say it like this:** "I read release notes for React, Next.js and TypeScript, and try new features in small side projects before using them at work. I read engineering postmortems from other companies, because they teach a lot about failure modes. I also write internal docs. Explaining something forces me to understand it properly."

---

**Q12. What are your notice period, expected compensation and relocation preferences?**

**Short answer:** Be honest about your notice period, give a researched range based on the role's scope, and state your flexibility clearly.

**Explanation:** Research market ranges for the level and city beforehand. Giving a range anchored on scope avoids underselling, and being clear about flexibility avoids surprises later.

**Example:** "My notice period is [X] days, [negotiable / with buyout possible]. Based on the scope of this role, I'm looking at [range]. I'm open to [relocation / hybrid]."

**Say it like this:** "My notice period is [X days]. For compensation, based on the scope of the role and market research, I'm looking at [range], and I'm flexible depending on the overall package. I'm open to [relocation / hybrid work]."

---

**Q13. Can you explain any gaps or short tenures?**

**Short answer:** Give the factual reason briefly, then focus on what you learned and how it helped later.

**Explanation:** Don't be defensive or over-explain. A short, honest answer followed by learning shows maturity.

**Example:** The roughly six-month Slaylink role, where you owned a product end to end with Next.js, NestJS and GraphQL.

**Say it like this:** "My Slaylink role was about six months. [The factual reason.] I learned a lot there about owning a product end to end with Next.js, NestJS and GraphQL, and that experience helped me take on architecture ownership at Arcitech."

---

## 🟡 Situational Questions (with Sample Answers)

**Q14. Tell me about a time you disagreed with your manager or a senior engineer.** → S8

**Short answer:** I disagreed with data, proposed a compromise, and committed once the decision was made.

**Explanation:** They're testing whether you can push back respectfully and then commit. Show that you listened, quantified the risk, offered options, and didn't make it personal.

**Example:** A PM wanted to ship without tests or accessibility support; you proposed shipping behind a feature flag with tests before full rollout.

**Say it like this:** "Our PM wanted to ship [feature] without [tests / accessibility support] to hit a date. I was concerned, because the feature touched [patient data / the call flow]. Instead of just objecting, I estimated the risk and what it would take: [two extra days for tests on the critical path]. I proposed shipping the core on time behind a feature flag, with the tests landing before we enabled it for all users. The PM agreed. Where we disagree and the decision goes the other way, I commit fully and make sure the risk is documented."

---

**Q15. Tell me about a time you made a mistake in production.** → S7

**Short answer:** I owned it immediately, mitigated, communicated, fixed the root cause and prevented a repeat.

**Explanation:** They're testing accountability. Spend little time on the mistake and most on the response and the lasting fix. Never blame others.

**Example:** A change to reconnect logic or caching that affected some users, rolled back within minutes.

**Say it like this:** "I shipped a change to [the reconnect logic / a caching rule] that caused [the symptom] for some users. When the alert came in, I rolled back within [X minutes] and posted an update in our incident channel. The root cause was [an edge case I hadn't tested, e.g. switching networks mid-call]. I added a test for that scenario and a check to our release checklist. I also shared a short write-up so others could learn from it. The lesson for me was that changes on the critical path need a test of the failure mode, not just the happy path."

---

**Q16. Tell me about a time you missed a deadline.**

**Short answer:** I underestimated a risk, raised it later than I should have, offered options, and changed how I estimate.

**Explanation:** Honesty about your part, plus a concrete change in behaviour, is what they want to hear.

**Example:** A third-party API that behaved differently from its documentation.

**Say it like this:** "On [feature], I underestimated [the integration complexity]. The warning sign was [a third-party API behaving differently from its docs] in the first few days. I should have raised it then, but I raised it a few days later. I gave the PM a revised estimate with options. We cut [a secondary feature] and delivered the core [X days] late. Since then, I spike risky integrations first and give ranges instead of single dates."

---

**Q17. Tell me about a time requirements were unclear.** → S10

**Short answer:** I turned a vague requirement into a testable checklist by asking the right question and prototyping.

**Explanation:** They're testing how you handle ambiguity: clarify the goal, make it concrete, and get agreement early.

**Example:** "Make it accessible" became WCAG 2.1 AA, a prototype, and sign-off.

**Say it like this:** "We were told InterpretIQ had to be 'accessible'. That's very vague. I asked which standard and level the client needed, and it was WCAG 2.1 AA. I listed what that meant for our screens, built a small prototype of the call screen with keyboard support and screen-reader announcements, and got sign-off on it. That turned a vague request into a checklist we could test against."

---

**Q18. Tell me about a time you had to learn something quickly.** → S2 or S5

**Short answer:** Learn the fundamentals, build a throwaway prototype, then design the real thing.

**Explanation:** Show a learning method and a result within a timeframe.

**Example:** WebRTC and LiveKit for InterpretIQ.

**Say it like this:** "When we started InterpretIQ, I hadn't worked with WebRTC. I read the LiveKit docs and the WebRTC fundamentals (ICE, TURN, SFU), built a throwaway prototype in [two days] to learn the event model, and then designed the production architecture. Within [a few weeks], we had stable calls in staging."

---

**Q19. Tell me about a time you improved a process.** → S4

**Short answer:** Introducing testing standards across 15 developers, which cut production bugs by 30%.

**Explanation:** Use the before and after metrics, and show how you got people to adopt the change rather than just announcing it.

**Example:** Guidelines with real examples, templates, workshops, pairing, gradually stricter CI checks, and a regression-test rule for bug fixes.

**Say it like this:** "Production bugs kept slipping through and testing varied a lot between developers. I wrote a short guide with examples from our own code, added templates, ran two workshops and paired on first tests. Then I tightened CI gradually, starting with auth and the call flow. Production bugs dropped by 30%, and people started reviewing each other's tests on their own."

---

**Q20. Tell me about a time you went beyond your role.** → S1

**Short answer:** The security audit: nobody assigned it, but I saw the risk and drove it to completion.

**Explanation:** Emphasise that it wasn't assigned, why it mattered (PHI in a healthcare app), and that you followed through, not just raised concerns.

**Example:** 8 critical issues found, an 85% reduction in findings on re-audit, and authorisation tests added to CI.

**Say it like this:** "Nobody asked me to audit security, but InterpretIQ handles patient data and our access control had grown without review. I mapped every role, tested every endpoint as each role, and checked where tokens and PHI ended up. We found 8 critical issues, fixed them in priority order with the backend developers, and the re-audit showed 85% fewer findings. I then added authorisation tests to CI so they couldn't return."

---

**Q21. Tell me about a time you handled a difficult stakeholder.**

**Short answer:** I found the real worry behind the behaviour and agreed a process that addressed it.

**Explanation:** Show empathy (understand their goal), then structure (priorities and a clear channel), and the outcome.

**Example:** A client stakeholder sending urgent requests directly to developers before a leadership demo.

**Say it like this:** "A [client-side stakeholder] kept asking for urgent changes directly to developers, which disrupted the sprint. I set up a short call to understand their goals. Their real worry was [a demo to their leadership]. We agreed on a priority list for the demo and routed new requests through [the account manager and PM]. The demo went well, and the direct requests stopped because they trusted the process."

---

**Q22. Tell me about a time you said no to a request.**

**Short answer:** I said no to the risky solution, but yes to the goal, by offering a safer alternative.

**Explanation:** A good "no" explains the risk clearly and still solves the underlying problem.

**Example:** A request to store patient details in the browser for faster offline loading.

**Say it like this:** "We were asked to store patient details in the browser so the app would load faster offline. I explained the risk: PHI in browser storage on shared clinic tablets. I offered an alternative: cache only the app shell, and keep data loading fast with prefetching. They accepted it, and we hit the performance goal without the compliance risk."

---

**Q23. Tell me about a time you received tough feedback.**

**Short answer:** I accepted it, changed my behaviour, and the result was visible.

**Explanation:** They're testing coachability. Don't be defensive in the story, and show a specific change.

**Example:** Feedback that your PR reviews were too blunt.

**Say it like this:** "A senior colleague told me my PR reviews were too blunt and some developers felt discouraged. I didn't enjoy hearing it, but they were right. I started explaining *why* in my comments, separating blocking issues from nits, and pointing out things done well. Over the next months, developers started asking me for reviews."

---

**Q24. Tell me about a time you gave tough feedback.**

**Short answer:** Privately, specifically, with curiosity about the cause, and with support to improve.

**Explanation:** Show that you looked for the root cause rather than just criticising, and that you followed up.

**Example:** A developer repeatedly shipping PRs without tests.

**Say it like this:** "A developer kept shipping PRs without tests, which caused regressions. I talked to them privately, gave specific examples, and asked what was getting in the way. It turned out they weren't confident writing tests for async code. We paired on two tests, and I shared our templates. Their next PRs included tests, and I made a point of recognising it."

---

**Q25. Tell me about a time a teammate wasn't performing.**

**Short answer:** Understand the blockers first, support with clear expectations, and escalate with evidence only if that fails.

**Explanation:** Show fairness and structure: diagnosis, support, measurable expectations, and a clear next step.

**Example:** A teammate repeatedly missing estimates because they were stuck on unfamiliar code.

**Say it like this:** "A teammate was missing estimates repeatedly. I first tried to understand the blockers, and they were stuck on unfamiliar parts of the codebase. I clarified expectations, paired with them for a week, and broke work into smaller tasks with daily check-ins. Their delivery became predictable within [a month]. If it hadn't improved, I'd have involved our manager, with documented examples and the support we'd already tried."

---

**Q26. Tell me about competing priorities across two products.**

**Short answer:** Prioritise by impact and risk, tell affected people immediately, and delegate well-defined work.

**Explanation:** Show a clear prioritisation principle and proactive communication.

**Example:** A live-call reconnect bug in InterpretIQ in the same week as a BpoBox deadline.

**Say it like this:** "InterpretIQ had a reconnect bug affecting live calls in the same week as a BpoBox feature deadline. I prioritised by impact and risk: patient calls dropping was more urgent. I told the BpoBox PM about the delay immediately with a new date, delegated a well-defined part of the BpoBox feature to a teammate, and fixed the reconnect bug first. Both shipped within [two days] of the original plan."

---

**Q27. Tell me about a decision you made with incomplete data.** → S3

**Short answer:** The self-hosting decision: state assumptions explicitly, and make the decision reversible through phases.

**Explanation:** Cover what you knew, what you assumed, how you limited the risk (pilots, rollback) and the outcome. Present projections as projections.

**Example:** A cost model of managed vs self-hosted LiveKit, with a phased rollout and rollback path.

**Say it like this:** "Leadership asked whether we should self-host video. I built a cost model including the operational time, not just servers, and wrote down the assumptions about usage and growth. Because the data was incomplete, I proposed a phased rollout, [staging first, then a share of traffic], with a rollback path. The projection showed about 40% savings, and we planned load tests to validate the assumptions before committing fully."

---

**Q28. Tell me about a time you simplified something complex.**

**Short answer:** I replaced scattered hand-written data fetching with a query library, starting with one example migration.

**Explanation:** Show the before (complexity and bugs), the approach (example plus guide), and the after (less code, fewer bugs).

**Example:** `useEffect` fetching with loading flags and race conditions replaced by a query library.

**Say it like this:** "Data fetching across our app used hand-written `useEffect` code, with loading flags, caching and race-condition bugs scattered everywhere. I introduced a query library, migrated one feature as an example, and wrote a short guide. Each migrated feature lost about [X] lines of code, and a whole class of stale-data bugs disappeared."

---

**Q29. Tell me about handling a production incident under pressure.**

**Short answer:** Mitigate first, communicate regularly, then run a blameless postmortem with tracked actions.

**Explanation:** They're testing calm prioritisation: restore service before investigating, and keep stakeholders informed.

**Example:** Calls failing to connect for one region or tenant during business hours.

**Say it like this:** "During business hours, calls started failing to connect for [one region or tenant]. I focused on mitigation first. We switched traffic to [a backup region or fallback configuration] within [X minutes]. I posted status updates every 15 minutes so support could inform clinics. Afterwards I led a blameless postmortem. The root cause was [an expired certificate or a TURN configuration issue], and we added monitoring and an alert so it couldn't happen silently again."

---

**Q30. Tell me about working with a remote or cross-functional team.**

**Short answer:** Written design docs, clear ownership, and a short overlap window for decisions.

**Explanation:** Show habits that make distributed work smooth: writing things down, explicit owners, and fewer but better meetings.

**Example:** A shared design doc for the LiveKit infrastructure with backend and DevOps engineers in different locations.

**Say it like this:** "Our backend and DevOps engineers were in different locations. I relied on written design docs, clear ownership, and a short overlap window for decisions. For the LiveKit infrastructure, a shared design doc with open questions saved us many meetings."

---

## 🔴 Senior and Leadership Questions

**Q31. How do you mentor developers?** → S4

**Short answer:** Reviews that explain why, pairing on hard problems, involvement in design reviews, and ownership of whole features with support.

**Explanation:** Senior interviews look for multiplying impact. Describe your methods and one person's growth (anonymised).

**Example:** A hesitant developer given ownership of the scorecard module, who later reviewed others' PRs in that area.

**Say it like this:** "In four ways. Code reviews that explain *why*, not just what to change. Pairing on hard problems. Involving people in design reviews, so they learn how decisions are made. And giving ownership of whole features, with support. For example, [a developer, anonymised] was hesitant about frontend architecture. I gave them ownership of [the scorecard module], reviewed their design doc with them, and within [a few months] they were reviewing other people's PRs in that area."

---

**Q32. How do you make architecture decisions in a team?**

**Short answer:** Define the problem, compare options with trade-offs, spike unknowns, write an RFC or ADR, gather feedback, decide, and record when to revisit.

**Explanation:** They want a repeatable, inclusive process that still reaches a decision.

**Example:** Choosing Redux for session state, RTK Query for data, or self-hosting LiveKit.

**Say it like this:** "I start by writing down the problem, then list two or three options with their trade-offs. If something's uncertain, I build a small spike. I write a short RFC or architecture decision record, get feedback from the people affected, decide, and note what would make us revisit the decision. That's how we chose [Redux for session state / RTK Query / self-hosting]."

---

**Q33. How do you balance speed vs quality?**

**Short answer:** Classify work by risk: critical paths get full rigour, flagged experiments move faster, and shortcuts are tracked as debt.

**Explanation:** "Always quality" or "always speed" are both weak answers. Show a risk-based framework.

**Example:** Auth, PHI and the call flow get thorough tests; a feature-flagged dashboard experiment gets lighter testing.

**Say it like this:** "I classify work by risk. Critical paths (auth, PHI, the call flow) get thorough tests and reviews. Experiments behind feature flags can move faster with lighter testing. I track any shortcuts as explicit tech debt with an owner, so speed today doesn't become a hidden cost."

---

**Q34. How do you handle technical debt?**

**Short answer:** Make it visible, tie it to business impact, reserve capacity, and fix opportunistically.

**Explanation:** Debt gets prioritised when it's linked to incidents or slower delivery, not when it's described as ugly code.

**Example:** A debt list where each item notes the incidents or delays it caused.

**Say it like this:** "I make it visible, as a list with the impact of each item. I tie it to business outcomes like incidents and slower delivery, reserve some capacity every sprint, and fix things opportunistically when we're already touching that code. A debt list that's linked to incidents gets prioritised. 'Code is ugly' doesn't."

---

**Q35. How do you estimate work?**

**Short answer:** Break it down, spike the unknowns, give ranges, and update early when scope changes.

**Explanation:** Good estimation is about managing uncertainty and communicating it, not guessing perfectly.

**Example:** "3–5 days, with the risk in the payment provider's sandbox; I'll confirm after a one-day spike."

**Say it like this:** "I break the work into tasks, identify the unknowns, and spike the risky parts first. I give ranges rather than single numbers, and I update estimates early when the scope changes. A late surprise is worse than an honest range."

---

**Q36. How do you onboard new engineers?**

**Short answer:** A working setup doc, an architecture overview, starter tasks and a buddy, aiming for a merged PR in week one.

**Explanation:** Good onboarding is a system that improves each time someone joins.

**Example:** Each new joiner fixes anything wrong in the setup doc as their first PR.

**Say it like this:** "A setup doc that actually works (tested by the last person to join), an architecture overview, starter tasks, and a buddy. The goal is a first merged PR in week one, and a feedback conversation after 30 days."

---

**Q37. How do you introduce a new tool or standard to a reluctant team?** → S4

**Short answer:** Show the pain with data, pilot with volunteers, make it easy, and automate enforcement gradually.

**Explanation:** Adoption comes from making the new way the easy way, not from mandates.

**Example:** The testing standards rollout: templates, workshops, and CI checks introduced module by module.

**Say it like this:** "I show the pain with data, pilot it with volunteers, provide templates and examples, make enforcement automatic gradually, and gather feedback. People adopt what makes their life easier, so I make the new way the easy way."

---

**Q38. How do you handle disagreement within your team on a technical approach?**

**Short answer:** Agree on the criteria first, prototype if it's cheap, decide, document why, and commit.

**Explanation:** Separating criteria from options takes ego out of the discussion.

**Example:** Two developers disagree on Zustand vs Context; the team agrees the criteria are re-render performance and learning curve, then compares.

**Say it like this:** "First we agree on the criteria: performance, maintainability, time. If it's cheap, we prototype both options. Then we decide, document why, and everyone commits. Separating the criteria from the options takes the ego out of it."

---

**Q39. How do you work with product managers?**

**Short answer:** Understand their goals, give early feasibility input, discuss trade-offs openly, and respect role boundaries.

**Explanation:** They want a partner, not an order-taker or a blocker.

**Example:** Suggesting a smaller first version that delivers 80% of the value in half the time.

**Say it like this:** "I share their goals and metrics, give early input on feasibility, and discuss trade-offs openly. I'm clear about risks and timelines. I respect role boundaries, so client communication goes through the account owner."

---

**Q40. How do you handle being the single point of knowledge?**

**Short answer:** Treat it as a risk: documentation, pairing, rotating ownership and runbooks.

**Explanation:** Seniors reduce the bus factor rather than enjoying being indispensable.

**Example:** A LiveKit runbook plus pairing until two developers could handle incidents alone.

**Say it like this:** "I treat it as a risk to fix: documentation, pairing, rotating ownership and runbooks. For the LiveKit integration, I wrote a runbook and paired with two developers until they could handle incidents without me."

---

**Q41. What does a great code review look like?**

**Short answer:** It checks correctness, security, readability, tests and performance, explains why, separates blockers from nits, and happens quickly.

**Explanation:** Reviews are for quality and for teaching, so tone and speed matter as much as findings.

**Example:** "Blocking: this endpoint doesn't check the tenant ID. Nit: consider renaming `data` to `scorecard`. Nice: the test for the empty state."

**Say it like this:** "It checks correctness, security, readability, tests and performance. It explains *why*, separates blocking issues from nits, happens quickly, ideally within a day, and calls out good work."

---

**Q42. How do you handle incidents as a lead?**

**Short answer:** Assign roles, mitigate before investigating, communicate regularly, and run a blameless postmortem with tracked actions.

**Explanation:** Structure reduces chaos; postmortem actions that never get done mean the incident will happen again.

**Example:** Incident lead, communications person and investigators, with 15-minute status updates.

**Say it like this:** "I assign roles (incident lead, communications, investigators), mitigate before investigating, keep a timeline, and send regular status updates. Afterwards, a blameless postmortem with action items that are actually tracked to completion."

---

**Q43. How do you build trust with leadership, for example when reporting to a CEO or CTO?**

**Short answer:** Predictable delivery, early risk communication, business framing and concise written updates.

**Explanation:** Leaders trust people whose updates are short, honest and framed in cost, risk and speed.

**Example:** The self-hosting proposal led with cost and risk, not technology.

**Say it like this:** "Predictable delivery, early communication of risks, framing technical decisions in business terms (cost, risk, speed), and concise written updates. With the self-hosting proposal, I led with cost and risk, not the technology."

---

**Q44. Build vs buy: how do you decide?** → S3

**Short answer:** Total cost of ownership, differentiation, time to market, compliance, vendor risk and an exit strategy.

**Explanation:** The hidden cost of building is operating it. The right answer can change as you scale.

**Example:** Managed video early on; a self-hosting path once the cost model changed at scale.

**Say it like this:** "I look at the total cost (building, maintaining and operating it), whether it differentiates us, time to market, compliance, vendor risk, and the exit strategy. For video, the managed service made sense early. At our scale the cost model changed, so we designed a self-hosting path, while being honest about the operational burden."

---

**Q45. How do you measure your team's success?**

**Short answer:** Predictability, production quality, user outcomes, developer experience, and people's growth.

**Explanation:** A balanced set prevents optimising one metric at the expense of others.

**Example:** Escaped bugs per release, PR cycle time, a user metric like QA review time, and promotions or new responsibilities.

**Say it like this:** "Delivery predictability, production quality (incidents and escaped bugs), user metrics, developer experience (cycle time and review time), and the growth of the people on the team."

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
