# 02 — Git & GitHub

Levels: **🟢 Basic → 🟡 Intermediate → 🔴 Advanced → 🧩 Scenario → 🎯 From Your Resume**

---

## 🟢 Level 1 — Basics

**1. What is Git? How is it different from GitHub?**
Git is a distributed version control system that tracks changes locally. GitHub is a hosting platform for Git repos that adds PRs, issues, Actions, code review and permissions.

**2. What does "distributed" mean?**
Every clone has the full history. You can commit, branch and view logs offline; a central server is a convention, not a requirement.

**3. The three areas in Git?**
Working directory (your files) → staging area/index (`git add`) → repository (`git commit`).

**4. `git init` vs `git clone`?**
`init` creates a new empty repo in the current folder. `clone` copies an existing remote repo including history and sets `origin`.

**5. What does `git status` show?**
Current branch, staged changes, unstaged changes, untracked files, and ahead/behind relative to upstream.

**6. `git add .` vs `git add -A` vs `git add -p`?**
`.` stages changes in the current directory and below; `-A` stages everything in the repo including deletions; `-p` lets you pick hunks interactively — the best habit for clean commits.

**7. What makes a good commit message?**
Short imperative subject (≤ 50 chars) like `fix: prevent double join on reconnect`, blank line, body explaining *why*.

**8. `git log` useful forms?**
`git log --oneline --graph --decorate -20`, `git log -p file` (patches for a file), `git log --author=name`, `git log -S "functionName"` (when a string was added/removed).

**9. What is a branch?**
A movable pointer to a commit. Creating one is cheap: `git switch -c feat/login`.

**10. `git checkout` vs `git switch` vs `git restore`?**
`checkout` is overloaded. Modern split: `switch` changes branches, `restore` discards file changes or unstages.

**11. What is `HEAD`?**
A pointer to the commit you currently have checked out, usually via a branch name.

**12. What is `origin`?**
Default name of the remote you cloned from. `upstream` is commonly used for the original repo when you work on a fork.

**13. `git push -u origin feat/x`?**
Pushes the branch and sets upstream tracking so later `git push`/`git pull` need no arguments.

**14. `git fetch` vs `git pull`?**
Fetch downloads remote commits without changing your branch; pull = fetch + merge (or rebase with `--rebase`).

**15. What is `.gitignore`?**
Patterns of files Git should not track. Frontend: `node_modules/`, `dist/`, `.next/`, `coverage/`, `.env*` (keep `.env.example`), `.DS_Store`.

**16. A file is already committed — `.gitignore` doesn't stop tracking it. Why and fix?**
Ignore only affects untracked files. Run `git rm --cached file`, then commit.

**17. `git diff` variants?**
`git diff` (unstaged), `git diff --staged` (staged vs last commit), `git diff main...feat` (changes on feat since it branched).

**18. How to discard local changes to a file?**
`git restore file`. Staged? `git restore --staged file` then `git restore file`.

**19. What is a merge conflict?**
Two branches changed the same lines (or one deleted what the other edited); Git can't decide and marks the file with `<<<<<<<`, `=======`, `>>>>>>>`.

**20. What is a Pull Request?**
A request to merge one branch into another, with review, discussion, CI checks and approvals.

**21. Fork vs clone?**
Fork = server-side copy under your account (for contributing without write access). Clone = local copy.

**22. What are tags?**
Named pointers to specific commits, usually releases. Annotated (`git tag -a v1.0 -m ""`) store author/date/message; lightweight are just names.

---

## 🟡 Level 2 — Intermediate

**23. Merge vs rebase?**
Merge combines histories with a merge commit (preserves context). Rebase replays your commits on top of another base for linear history. **Golden rule:** don't rebase commits others have already pulled.

**24. Fast-forward merge?**
If the target hasn't moved since you branched, Git just moves its pointer forward. `--no-ff` forces a merge commit to keep feature grouping visible.

**25. `git reset --soft | --mixed | --hard`?**
| Mode | HEAD | Index | Working tree |
|---|---|---|---|
| soft | moved | kept | kept |
| mixed (default) | moved | reset | kept |
| hard | moved | reset | reset (changes lost) |

**26. `reset` vs `revert`?**
Reset moves the branch pointer (rewrites history — local only). Revert creates a new commit that undoes a previous one — safe for shared branches.

**27. Undo the last commit but keep changes?**
`git reset --soft HEAD~1`.

**28. Fix the last commit message or add a forgotten file?**
`git add file && git commit --amend` (`--no-edit` to keep message). Only before pushing, or force-push your own branch.

**29. `git stash` workflow?**
`git stash push -u -m "wip login"` → `git stash list` → `git stash pop` (apply + drop) or `git stash apply stash@{1}` (keep). `git stash show -p` to inspect.

**30. Cherry-pick?**
Apply a specific commit onto your current branch: `git cherry-pick <sha>`. Used to backport hotfixes to a release branch. `-x` adds "cherry picked from" note.

**31. Interactive rebase uses?**
`git rebase -i HEAD~5` → `pick`, `reword`, `edit`, `squash`, `fixup`, `drop`, reorder lines. Clean up WIP commits before review.

**32. `--autosquash` with fixup commits?**
`git commit --fixup <sha>` then `git rebase -i --autosquash main` — fixups land in the right place automatically.

**33. Resolve a conflict step by step?**
1) `git status` to list files. 2) Open each, decide final content, remove markers. 3) `git add file`. 4) `git merge --continue` / `git rebase --continue`. 5) Run tests and lint. Abort anytime with `--abort`.

**34. `ours` vs `theirs` — and why it flips in rebase?**
In merge: ours = current branch, theirs = incoming. In rebase you're replaying your commits onto the other branch, so **ours = the base you're rebasing onto**, theirs = your commit.

**35. Detached HEAD — what and how to save work?**
HEAD points directly to a commit. Commits made here are orphaned when you switch away. Save: `git switch -c rescue-branch`.

**36. `git reflog`?**
Local log of every move of HEAD and branch tips (~90 days). Recover a "lost" commit after a bad reset: find the sha in reflog → `git reset --hard <sha>` or `git branch recover <sha>`.

**37. `git bisect`?**
Binary search for the commit that introduced a bug:
```bash
git bisect start
git bisect bad            # current is broken
git bisect good v1.4.0    # known good
# test, then mark good/bad until Git names the commit
git bisect run npm test   # or automate
git bisect reset
```

**38. `git blame` — useful flags?**
`git blame -w -C -C file` ignores whitespace and tracks moved/copied lines. Combine with `.git-blame-ignore-revs` to skip formatting commits.

**39. Branching strategies compared?**
- **Git Flow:** main, develop, feature, release, hotfix branches. Good for versioned releases; heavy for web apps.
- **GitHub Flow:** main + short-lived feature branches + PRs + deploy from main.
- **Trunk-based:** very short branches (hours/days), feature flags hide unfinished work, continuous deploy. Best for CI/CD maturity.

**40. Merge commit vs squash merge vs rebase merge on GitHub?**
Merge commit: all commits + merge commit. Squash: one commit per PR (clean main, loses granular history). Rebase: linear, keeps each commit.

**41. Branch protection rules?**
Required reviews (and CODEOWNERS), required status checks, up-to-date branch, linear history, signed commits, no force pushes, no deletions.

**42. CODEOWNERS?**
`.github/CODEOWNERS` maps paths to required reviewers: `/src/auth/ @security-team`.

**43. Semantic versioning?**
MAJOR.MINOR.PATCH — breaking / feature / fix. Pre-releases `1.2.0-beta.1`.

**44. Conventional Commits?**
`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `feat!:` (breaking). Enables auto changelog and version bumps.

**45. Husky + lint-staged?**
Git hooks managed in the repo: pre-commit runs ESLint/Prettier on staged files only; commit-msg runs commitlint.

**46. `git clean`?**
Removes untracked files: `git clean -nd` (dry run) then `git clean -fd`. `-x` also removes ignored files (like `node_modules`).

---

## 🔴 Level 3 — Advanced

**47. How does Git store data internally?**
Content-addressed object database: **blobs** (file contents), **trees** (directories), **commits** (tree + parents + metadata), **tags**. Each identified by hash. Branches are files containing a commit hash.

**48. Why are branches cheap in Git?**
A branch is a 41-byte file pointing to a commit; no files are copied.

**49. What is a three-way merge?**
Git compares both branch tips with their merge base (common ancestor) to decide which side changed each region.

**50. Merge strategies?**
`ort` (default since Git 2.34), `recursive` (older), `octopus` (many branches), `ours` (keep ours entirely). Strategy options: `-X ours` / `-X theirs` resolve conflicting hunks automatically.

**51. `git rebase --onto`?**
Move a range of commits to a new base:
```bash
# feature was branched from old-feature; move it onto main
git rebase --onto main old-feature feature
```

**52. `git push --force` vs `--force-with-lease`?**
`--force` overwrites remote unconditionally. `--force-with-lease` refuses if someone else pushed since your last fetch — always prefer it.

**53. `git rerere`?**
"Reuse recorded resolution" — remembers how you resolved a conflict and reapplies it automatically. Useful on long-running rebases.

**54. Submodules vs subtrees vs monorepo?**
Submodule: pointer to a commit in another repo (explicit versions, but clunky workflows). Subtree: copies code in with history (simpler for consumers). Monorepo: everything in one repo with workspace tooling (Nx, Turborepo, pnpm workspaces) — atomic cross-package changes, affected-only builds.

**55. Sparse checkout & partial clone?**
For huge monorepos: `git clone --filter=blob:none` (fetch blobs on demand) + `git sparse-checkout set apps/web packages/ui`.

**56. Git LFS?**
Stores large binaries (videos, design files) outside the repo, keeping pointers in Git.

**57. Shallow clone in CI?**
`git clone --depth 1` speeds CI; but tools needing history (changelog, `affected` detection, `git describe`) need `fetch-depth: 0` or enough depth.

**58. Signed commits?**
Sign with GPG or SSH key (`git config commit.gpgsign true`); GitHub shows "Verified". Enforce via branch protection.

**59. Remove a secret from history properly?**
1) **Rotate the secret immediately** (assume compromised). 2) Rewrite history with `git filter-repo --path .env --invert-paths` or BFG. 3) Force-push all branches/tags. 4) Ask collaborators to re-clone. 5) Enable secret scanning + push protection.

**60. `git worktree`?**
Multiple working directories from one repo: `git worktree add ../hotfix main` — fix production without stashing your feature work.

**61. How does `git pull --rebase` change team workflow?**
Avoids noise merge commits like "Merge branch 'main' of origin". Set default: `git config --global pull.rebase true`.

**62. Hooks: client vs server?**
Client: pre-commit, commit-msg, pre-push (local, bypassable with `--no-verify`). Server: pre-receive, update (enforced). On GitHub, enforcement is done via branch protection/rulesets and Actions instead.

---

## 🔴 GitHub Actions & CI/CD

**63. Anatomy of a workflow?**
```yaml
name: ci
on:
  pull_request:
  push: { branches: [main] }
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint && pnpm typecheck && pnpm test -- --coverage
      - run: pnpm build
```

**64. Caching dependencies?**
`setup-node` with `cache:` or `actions/cache` keyed by lockfile hash.

**65. Matrix builds?**
`strategy.matrix.node: [18, 20, 22]` runs the job per version/OS.

**66. Secrets & environments?**
Repo/org secrets via `${{ secrets.X }}`; environments add required approvers and scoped secrets for production. Never echo secrets.

**67. OIDC to AWS instead of long-lived keys?**
Workflow requests a short-lived token from AWS via `aws-actions/configure-aws-credentials` with `role-to-assume` — no static access keys stored in GitHub.

**68. Preview deployments per PR?**
Deploy each PR to a unique URL (Vercel/Netlify/S3 + CloudFront prefix), post link as a PR comment, tear down on close.

**69. Reusable workflows & composite actions?**
`workflow_call` for shared pipelines across repos; composite actions bundle repeated steps.

**70. `concurrency` key?**
Cancel superseded runs: `concurrency: { group: ${{ github.ref }}, cancel-in-progress: true }`.

**71. Dependabot / Renovate?**
Automated dependency update PRs; group minor updates; auto-merge patch updates when CI passes.

---

## 🧩 Level 4 — Scenario-based

**72. You pushed a commit with a bug to `main` and others have pulled. What do you do?**
`git revert <sha>` → push → open a follow-up fix PR. Never reset/force-push shared main.

**73. You accidentally committed to `main` locally instead of a feature branch.**
```bash
git switch -c feat/x        # new branch keeps the commits
git switch main
git reset --hard origin/main
```

**74. You ran `git reset --hard` and lost work.**
If committed: `git reflog` → find sha → `git reset --hard <sha>`. If only staged: `git fsck --lost-found` can recover dangling blobs. If never staged: gone (check editor local history).

**75. Your PR has 23 messy commits; reviewer asks for a clean history.**
`git rebase -i origin/main`, squash/fixup into logical commits, `git push --force-with-lease`.

**76. A long-running feature branch conflicts constantly with main.**
Rebase/merge main frequently, split into smaller PRs, hide incomplete work behind feature flags, enable `rerere`.

**77. A release needs one fix from `develop` but not the other 10 commits.**
Cherry-pick that commit onto the release branch (`-x`), tag a patch release, ensure the fix is also on main.

**78. CI is green locally but red in GitHub Actions.**
Check Node version, lockfile install (`--frozen-lockfile`), env vars/secrets, OS/case-sensitive paths, timezone, test order dependence, missing build cache.

**79. Two developers need to work on the same feature branch.**
Agree on `pull --rebase`, small commits, push often; or each works on sub-branches merged into the feature branch via PRs.

**80. A teammate force-pushed and overwrote your commits on a shared branch.**
Your local reflog still has them: find sha → create branch → push → set up branch protection to block force pushes.

**81. Which commit made the bundle size jump from 300 KB to 900 KB?**
`git bisect run` with a script that builds and fails if the bundle is over a threshold.

**82. You need to work on a hotfix while in the middle of a large refactor.**
`git worktree add ../app-hotfix main` (or stash), fix, PR, return.

**83. How would you enforce consistent commit messages and formatting across 15 developers?**
Husky + lint-staged + commitlint locally; CI checks the same (hooks can be skipped); PR template; branch protection requiring checks.

---

## 🎯 From Your Resume

**84. "Walk me through the CI/CD for your self-hosted LiveKit infrastructure."**
GitHub Actions: build Docker image → scan (Trivy) → push to ECR → deploy via ECS/EC2 (SSM or Terraform apply) → health check → automatic rollback on failure. AWS auth via OIDC. Config changes reviewed via PR. *(Describe only what you actually built; say "we" for parts DevOps owned.)*

**85. "How did you enforce testing standards for the frontend team?"**
Required status checks (lint, typecheck, tests, build), coverage threshold on critical modules, PR template with a "tests added" checkbox, CODEOWNERS for shared components.

**86. "How do you handle releases across two products sharing a component library?"**
Monorepo or a versioned package with Changesets → semver releases → each product upgrades deliberately; breaking changes with migration notes.
