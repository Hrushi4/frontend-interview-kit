# 18 — Behavioral, Situational & Leadership

Senior candidates are often rejected here, not in coding. Prepare stories, not answers.

Sections: **🧭 Method → 📚 Your story bank → 🟢 Basic HR questions → 🟡 Situational questions → 🔴 Senior/leadership questions → 🏢 Company-style notes → ❓ Questions to ask → 🚫 Red flags**

---

## 🧭 Method

**STAR(L):** Situation (1–2 lines) → Task (your responsibility) → Action (60% of the answer: what *you* did, decisions, trade-offs) → Result (number + business impact) → Learning (what you'd do differently).

**Rules**
- Say "I" for your actions and "we" for team outcomes — be honest about who did what.
- 2 minutes per story; offer details if they want more.
- Every number must be explainable: what, how measured, baseline, period.
- Pick stories with tension (conflict, ambiguity, failure, trade-off). Smooth success stories are forgettable.
- Don't name or blame colleagues; describe behaviours and context.

---

## 📚 Your story bank (fill each with real details before interviews)

Template:
```
S: context and stakes (who was affected, why it mattered)
T: what I owned
A: 3–4 concrete actions, decisions, trade-offs, how I influenced others
R: metric + outcome (+ what remained)
L: what I learned / would do differently
```

| # | Story (from your resume) | Use it for |
|---|---|---|
| S1 | Security & reliability audit: 8 critical issues in RBAC, JWT/OAuth, PHI storage; findings down 85% | ownership, quality, influencing without authority, prioritisation, dealing with risk |
| S2 | LiveKit real-time video: 150 concurrent sessions, 99% reconnect success, < 5 s join | hardest technical problem, debugging, customer impact, persistence |
| S3 | Self-hosted LiveKit on AWS: projected 40% cost cut, 10x capacity | business thinking, build vs buy, convincing leadership, decisions with incomplete data |
| S4 | Testing standards + mentoring 15 developers; production bugs down 30% | mentoring, raising the bar, changing team culture, process improvement |
| S5 | AI scoring pipeline (LangChain + OpenAI + Celery) over 40k+ calls/month; 5x throughput | learning fast, cross-team collaboration, technical depth |
| S6 | BpoBox role-based QA portals; review time down 60% | customer focus, product sense, working with PM/users |
| S7 | A failure: a production incident, missed estimate or wrong decision (choose a real one) | accountability, resilience, learning |
| S8 | A disagreement with a PM, peer or senior about scope/approach (choose a real one) | conflict, communication, disagree-and-commit |
| S9 | An early-career story (LTIMindtree airline widgets or Slaylink) | growth, working in large client environments, adaptability |
| S10 | Ambiguous requirement you clarified (e.g., WCAG compliance scope or tenant needs) | ambiguity, stakeholder management |

**Example skeleton for S1 (fill with your real details):**
- S: Healthcare interpretation app handling PHI; access control and token handling had grown organically.
- T: I took ownership of reviewing reliability and security across the React frontend and FastAPI backend.
- A: Mapped roles and data flows; tested every endpoint per role and tenant; reviewed token storage/lifecycle; searched logs and storage for PHI; rated severity; proposed fixes in priority order; paired with backend devs on server-side permission checks; added regression tests.
- R: 8 critical issues found; re-audit showed 85% fewer findings; [state what remained and the plan].
- L: Security checks need to be automated (authorization test matrix in CI), not a one-off audit.

---

## 🟢 Basic HR questions

**1. Tell me about yourself.** (60–90 seconds)
Present → highlights → why this role. Example structure: "I'm a Senior Software Engineer at Arcitech with 4+ years in React and TypeScript. I own frontend architecture for two products — InterpretIQ, a WCAG-compliant medical interpretation PWA with real-time LiveKit video, and BpoBox, a multi-tenant AI QA platform. Recently I led a security and reliability audit and set testing standards across the team. I'm looking for a role where I can [JD's core problem] at a larger scale."

**2. Why are you looking for a change?**
Positive, forward-looking: scale, scope, domain, learning. Never criticise your employer.

**3. Why this company / this role?**
Show research: product, tech challenges, engineering blog, values; connect to your experience.

**4. What are your strengths?**
Two strengths with proof (e.g., "ownership of reliability — the security audit"; "making teams faster — testing standards").

**5. What is your biggest weakness?**
Real, not fatal, with active improvement. E.g., "I used to take on too much myself instead of delegating; with 15 developers I learned to write clearer tickets and review rather than rewrite."

**6. Where do you see yourself in 3–5 years?**
Growing depth and scope (e.g., staff-level frontend/platform ownership or technical leadership) aligned with the role's path.

**7. Why should we hire you?**
Map 3 JD requirements to 3 proofs from your work.

**8. What are you most proud of?**
Pick S2 or S1 with measurable impact.

**9. Describe your current role and responsibilities.**
Products, team size, what you own end to end, who you work with (PM, account manager, backend/DevOps), how decisions are made.

**10. How do you handle pressure and deadlines?**
Prioritise by impact, communicate early, cut scope not quality on critical paths, protect focus time. Give an example.

**11. How do you keep learning?**
Specific: release notes (React, Next.js), building small projects, reading postmortems, conference talks, writing internal docs.

**12. Notice period, expected compensation, relocation.**
Be honest about notice; research market ranges; give a range anchored on role scope; state flexibility clearly.

**13. Any gaps or short tenures?**
Brief, factual, positive (e.g., Slaylink role was 6 months → what you learned and why you moved).

---

## 🟡 Situational questions (with answer angles)

**14. Tell me about a time you disagreed with your manager or a senior engineer.** → S8
Show you disagreed with data, listened, proposed an experiment or compromise, and committed once decided.

**15. A time you made a mistake in production.** → S7
Own it fast, mitigate, communicate, root cause, prevent recurrence (tests, alerts, checklists).

**16. A time you missed a deadline.**
What signals you missed, how you communicated, what you changed in estimation.

**17. A time requirements were unclear.** → S10
Asked targeted questions, wrote assumptions, built a small prototype, got sign-off.

**18. A time you had to learn something quickly.** → S2/S5
LiveKit/WebRTC or LangChain: how you learned (docs, spikes, small prototypes), how fast you delivered.

**19. A time you improved a process.** → S4
Before/after metrics.

**20. A time you went beyond your role.** → S1
Security wasn't assigned; you saw risk and acted.

**21. A time you handled a difficult stakeholder.**
Understand their goal, find shared metrics, communicate trade-offs clearly; route client communication through the right owner.

**22. A time you said no to a request.**
Explain impact, offer alternatives (phased delivery, smaller scope).

**23. A time you received tough feedback.**
What it was, how you reacted, what changed.

**24. A time you gave tough feedback.**
Private, specific, behaviour-focused, with support and follow-up.

**25. A time you worked with a teammate who wasn't performing.**
Understand blockers, clarify expectations, pair, set small goals, escalate with care if no improvement.

**26. A time you had competing priorities across two products.**
How you prioritised (impact, deadlines, risk), communicated with PM/stakeholders, delegated.

**27. A time you made a decision with incomplete data.** → S3
What you knew, assumptions, how you limited risk (reversible steps, pilots), outcome.

**28. A time you simplified something complex.**
E.g., replacing ad-hoc fetch logic with a query library, or a component library reducing duplicated UI.

**29. A time you handled a production incident under pressure.**
Mitigation first, clear communication cadence, blameless postmortem, action items.

**30. A time you worked with a remote/cross-functional team.**
Async docs, overlap hours, clear ownership.

---

## 🔴 Senior / leadership questions

**31. How do you mentor developers?** → S4
Code-review guidelines with explanations, pairing, design reviews, growth plans, giving ownership of features, celebrating progress. Give one person's growth story (anonymised).

**32. How do you make architecture decisions in a team?**
Problem statement → options with trade-offs → small spike if uncertain → written RFC/ADR → review → decide → revisit triggers.

**33. How do you balance speed vs quality?**
Classify work by risk: critical paths (auth, PHI, payments) get tests and reviews; experiments behind flags can move faster; track tech debt explicitly.

**34. How do you handle technical debt?**
Make it visible (list with impact), tie to business outcomes (incidents, velocity), reserve capacity each sprint, fix opportunistically when touching code.

**35. How do you estimate work?**
Break into tasks, identify unknowns, spike risky parts, give ranges, update estimates early when scope changes.

**36. How do you onboard new engineers?**
Setup doc that works, architecture overview, starter tasks, buddy, first PR in week one, feedback after 30 days.

**37. How do you introduce a new tool or standard to a reluctant team?** → S4
Show the pain with data, pilot with volunteers, provide templates and examples, automate enforcement gradually, gather feedback.

**38. How do you handle disagreement within your team on a technical approach?**
Agree on criteria first, prototype if cheap, decide and document, disagree-and-commit.

**39. How do you work with product managers?**
Shared goals and metrics, early technical input on feasibility, trade-off discussions, clear communication of risks and timelines. Respect role boundaries (client communication via the account owner).

**40. How do you handle being the single point of knowledge?**
Documentation, pairing, rotating ownership, runbooks — reduce bus factor.

**41. What does a great code review look like?**
Correctness, security, readability, tests, performance; explain *why*; separate blocking from nits; review quickly; praise good work.

**42. How do you handle incidents as a lead?**
Incident roles (lead, comms, investigator), mitigate first, timeline, status updates, blameless postmortem, tracked action items.

**43. How do you build trust with leadership (e.g., reporting to a CEO/CTO)?**
Predictable delivery, early risk communication, business framing of technical decisions, concise written updates.

**44. Build vs buy — how do you decide?** → S3
Total cost (build + maintain + ops), differentiation, time to market, compliance, vendor risk, exit strategy.

**45. How do you measure your team's success?**
Delivery predictability, production quality (incidents, bugs), user metrics, developer experience (cycle time, review time), growth of people.

---

## 🏢 Company-style notes

- **Amazon:** Leadership Principles (Customer Obsession, Ownership, Dive Deep, Bias for Action, Deliver Results, Earn Trust, Have Backbone; Disagree and Commit, Learn and Be Curious, etc.). Prepare 2 stories per principle; bar raiser probes depth ("what exactly did you do?").
- **Google:** structured behavioural + "Googleyness" (collaboration, comfort with ambiguity, humility, doing the right thing).
- **Microsoft / Meta / Apple:** collaboration, impact, growth mindset; senior loops include a "past project deep dive".
- **Service MNCs (TCS, Infosys, Wipro, Accenture, Cognizant, Capgemini):** client handling, adaptability, Agile/Scrum experience, flexibility on shifts/locations, process awareness.
- **Consulting/Big 4 (Deloitte, PwC, EY):** stakeholder communication, structured thinking, documentation.
- **Startups:** speed, end-to-end ownership, wearing multiple hats, comfort with ambiguity.

---

## ❓ Questions you should ask (pick 2–3)

- What does success look like in the first 90 days?
- What's the biggest technical challenge the frontend team faces right now?
- How are architecture decisions made and documented?
- How is production ownership/on-call handled for frontend?
- How do you measure engineering quality and developer experience?
- What would make someone excel in this role vs just do well?

---

## 🚫 Red flags to avoid

- Blaming previous teams or managers; naming colleagues negatively.
- Vague "we did" answers without your contribution.
- Numbers you can't explain; claiming projected numbers as achieved.
- Rambling past 3 minutes; no result or learning.
- No questions for the interviewer.
- Inconsistent stories between rounds.
