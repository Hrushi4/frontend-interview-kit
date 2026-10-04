# Frontend Interview Kit (2026): Tailored to Hrushikesh's Resume

An original question bank built around **your** profile: Senior Software Engineer with 4+ years, React 19, TypeScript, Redux and Next.js, plus NestJS and FastAPI exposure, LiveKit real-time video, RBAC/JWT security, SSE, and LangChain AI scoring.

## What's in each file

Every topic file has the same two-part structure:

1. **Part A — Understand the topic:** a plain-English explanation of the topic: what it is, how it works, the key terms and diagrams, and why interviewers ask about it. Read this first.
2. **Part B — Interview questions and answers**, from basic to advanced. Each answer has:
   - **Short answer:** the one or two lines to say first.
   - **Explanation:** the detail to add if the interviewer wants more.
   - **Example:** code, a command or a real situation.
   - **Say it like this:** a sample spoken answer you can use or adapt, often tied to your own projects.

Question levels:

- **🟢 Basic:** fundamentals asked in screening rounds. Never miss these.
- **🟡 Intermediate:** the bulk of senior frontend rounds.
- **🔴 Advanced:** product companies, senior and staff loops, deep follow-ups.
- **🧩 Scenario:** "What would you do if…" questions that test judgement.
- **🎯 From Your Resume:** questions an interviewer will ask *because of what you wrote*. Practise these out loud.

**How to study a file:** read Part A once. Then cover the answers and try each question out loud before reading the answer. Write the advanced code yourself before looking. Use the scenario questions as mock-interview prompts.

**Anything in [square brackets]** in a sample answer is a placeholder for your real detail. Replace it with the true fact, or remove it. Never say a number you can't explain.

## Priority order for you (senior, 4+ years)

| Week | Files | Why |
|---|---|---|
| 1 | 01 Resume Deep-Dive, 18 Behavioural | Senior loops are decided on the depth of your own work |
| 1 | 05 JavaScript, 07 React | Never skipped, even for seniors |
| 2 | 14 Frontend System Design, 12 Performance, 13 Security | Your resume claims architecture and security, so you'll be pushed hard here |
| 2 | 06 TypeScript, 08 Redux/State, 09 Next.js | Listed as core skills |
| 3 | 15 DSA, 16 Machine Coding | Live-coding rounds |
| 3 | 02 Git, 03 HTML, 04 CSS, 10 Tailwind, 17 AI-Assisted Dev | Quick revision |
| Daily | 19 Quick Memory Sheet | 10-minute refresh before any interview |
| Day 1 | 22 Resume Template | Fix the resume before you apply |
| Anytime | 21 Code Snippets | Reference while building or before machine-coding rounds |

## Files

| # | File | Topic |
|---|---|---|
| 00 | README | This guide |
| 01 | resume-deep-dive | Resume grilling questions, sample answers, resume fixes, ATS |
| 02 | git-github | Git, GitHub and GitHub Actions |
| 03 | html | HTML, semantics, accessibility, PWA basics |
| 04 | css | CSS, layout, specificity, responsive design |
| 05 | javascript | Core JS, async, the event loop, closures, polyfills |
| 06 | typescript | Types, generics, utility types, TS with React |
| 07 | react | React 18/19, hooks, rendering, testing |
| 08 | redux-state | Redux Toolkit, RTK Query, TanStack Query, Zustand |
| 09 | nextjs | App Router, Server Components, caching, rendering modes |
| 10 | tailwind | Tailwind CSS |
| 12 | performance | Web Vitals, bundles, rendering and video performance |
| 13 | web-security | XSS, CSRF, CSP, JWT, OAuth, RBAC, PHI |
| 14 | frontend-system-design | The RADIO framework + 12 worked designs |
| 15 | dsa | Patterns and JavaScript solutions, with explanations |
| 16 | machine-coding | Classic UI builds with code |
| 17 | ai-assisted-dev | LLM features in the frontend, AI tooling |
| 18 | behavioral-leadership | STAR stories mapped to your resume, with sample answers |
| 19 | quick-memory-sheet | One cheat sheet per topic |
| 20 | project-ideas | 10 portfolio projects that extend your story |
| 21 | code-snippets | Copy-paste hooks, fetch, testing, CSS and Git snippets |
| 22 | resume-template | Your resume restructured with the fixes applied |

(There is no file 11: the Angular file was removed on request.)

## Google Docs versions

**Everything in one file:** `google-docs/Frontend-Interview-Kit-ALL.docx` contains all the files in order, each starting on a new page with its own top-level heading. Upload it once, open it with Google Docs, and use **View → Show outline** to jump between files.

Every file is also available as its own Word document (`.docx`) in the `google-docs/` folder at the root of the repo. To use one in Google Docs:

1. Open Google Drive → **New → File upload** → choose a `.docx` file from `google-docs/`.
2. Right-click the uploaded file → **Open with → Google Docs**.
3. (Optional) **File → Save as Google Docs** to keep an editable Google Docs copy.

To regenerate the `.docx` files after editing the Markdown, run `python3 build_docx.py` from the repo root (requires `pip install python-docx markdown-it-py`).

> Answers are kept interview-length: say the short answer first, then expand only if asked.
