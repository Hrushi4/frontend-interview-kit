# 02 — Git & GitHub

**How this file is organised**

- **Part A — Understand the topic:** a plain-English explanation of Git and GitHub, the mental model, and key terms. Read this first.
- **Part B — Interview questions and answers:** Basic → Intermediate → Advanced → GitHub Actions → Scenario → From Your Resume.

Each answer follows the same pattern:

- **Short answer:** the one or two lines you say first.
- **Explanation:** the detail you add if the interviewer wants more.
- **Example:** a command, code sample or real situation.
- **Say it like this:** a sample spoken answer you can use or adapt.

---

## Part A — Understand the Topic

### What is version control?

Version control is a system that records every change made to a set of files over time, so you can see who changed what, when and why. You can also go back to any earlier version. Without it, teams email zip files around or overwrite each other's work. With it, ten developers can edit the same codebase at the same time and safely combine their work.

### What is Git?

Git is the most widely used version control system. Linus Torvalds created it in 2005 to manage the Linux kernel. Two ideas make Git different from older tools like SVN:

1. **It is distributed.** Every developer's machine has a full copy of the project and its entire history. You can commit, branch and read history offline. The "central" server (GitHub, GitLab) is just a copy everyone agrees to share.
2. **It stores snapshots, not differences.** Each commit is a snapshot of the whole project at that moment. Unchanged files are not duplicated; Git points at the same stored content. That is why branching and switching are almost instant.

### What is GitHub?

GitHub is a website that hosts Git repositories and adds collaboration features on top:

- Pull requests and code review
- Issues and project boards
- GitHub Actions (CI/CD)
- Permissions, branch protection and security scanning (Dependabot, secret scanning)

**Remember:** Git is the tool. GitHub is a service built around the tool. GitLab and Bitbucket are alternatives to GitHub, not to Git.

### The mental model: the three areas

```text
Working directory  --git add-->  Staging area (index)  --git commit-->  Repository (.git)
   (your files)                  (what goes in the                      (permanent history)
                                  next commit)
```

- **Working directory:** the files you see and edit.
- **Staging area:** a "draft" of your next commit. You choose exactly which changes go into it.
- **Repository:** the `.git` folder holding all commits.

Remote repositories (like `origin` on GitHub) are a fourth place. `git push` sends commits there and `git fetch` or `git pull` brings commits back.

### Commits, branches and HEAD

- A **commit** is a snapshot plus metadata: author, date, message and a pointer to its parent commit(s). Each commit has a unique ID (a SHA hash such as `a1b2c3d`).
- A **branch** is just a movable label pointing to one commit. When you commit on a branch, the label moves forward.
- **HEAD** means "where I am right now". It usually points to a branch.

```text
A---B---C  <- main
         \
          D---E  <- feature   <- HEAD
```

### Combining work: merge vs rebase

- **Merge** joins two branches and creates a "merge commit" with two parents. History shows exactly what happened.
- **Rebase** replays your commits on top of another branch, which gives a straight-line history. It rewrites commit IDs, so never rebase commits that others have already pulled.

### Typical team workflow (GitHub Flow)

1. Pull the latest `main`.
2. Create a branch: `git switch -c feat/login-form`.
3. Commit small, focused changes.
4. Push and open a pull request (PR).
5. CI runs lint, tests and build. Teammates review.
6. Merge the PR (often "squash and merge") and delete the branch.
7. `main` deploys automatically.

### Key terms glossary

| Term | Meaning |
|---|---|
| Repository (repo) | A project folder tracked by Git |
| Clone | Copy a remote repo to your machine |
| Commit | A saved snapshot with a message |
| Branch | A movable pointer to a commit; a line of work |
| Remote / origin | A copy of the repo on a server; `origin` is the default name |
| Push / Fetch / Pull | Upload commits / download commits / download and integrate |
| Merge | Combine branches with a merge commit |
| Rebase | Replay commits onto a new base |
| Conflict | Both sides changed the same lines; you decide the result |
| Pull Request | A request to merge a branch, with review and CI checks |
| Tag | A fixed name for a commit, usually a release (`v1.2.0`) |
| Stash | A temporary shelf for uncommitted changes |
| Reflog | Local history of where HEAD has been; used to recover lost work |

### Why interviewers ask about Git

Senior engineers are expected to keep shared history clean and recover from mistakes calmly. They also design the branching and CI process for the team. Interviewers check three things:

1. Do you understand what commands actually do, beyond memorising them?
2. Can you recover safely from mistakes such as a bad push, lost work or conflicts?
3. Can you set up a workflow for a team (branch protection, CI, releases)?

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. What is Git? How is it different from GitHub?**

**Short answer:** Git is a distributed version control system that runs on your machine and tracks changes to files. GitHub is a cloud platform that hosts Git repositories and adds collaboration tools such as pull requests, issues, Actions and permissions.

**Explanation:** You can use Git without GitHub, for example locally or with GitLab or Bitbucket. GitHub can't work without Git, because every repository on GitHub is a Git repository.

**Example:**

```bash
git init            # Git only — works offline, no GitHub needed
git remote add origin https://github.com/me/app.git
git push -u origin main   # now GitHub hosts a copy
```

**Say it like this:** "Git is the version control engine. It tracks history locally and lets me branch, commit and merge. GitHub is a hosting service on top of Git. It's where our team reviews code through pull requests and runs CI with GitHub Actions."

---

**Q2. What does "distributed" mean in Git?**

**Short answer:** Every clone contains the full repository history, not just the latest files.

**Explanation:** With older centralised systems such as SVN, you needed the server to commit or view history. In Git, commits, branches, logs and diffs all work offline, and only push and fetch need the network. If the server dies, any developer's clone can restore it.

**Example:** On a flight you can run `git log`, create branches and make commits, then push them all when you land.

**Say it like this:** "Distributed means every developer has a complete copy of the repository and its history. Most operations are local, so they're fast and work offline. The remote server is just the copy we agree to share."

---

**Q3. What are the three areas in Git?**

**Short answer:** The working directory, the staging area (index) and the repository.

**Explanation:** `git add` moves changes from the working directory to the staging area. `git commit` saves the staged snapshot into the repository. The staging area lets you build a clean commit from only part of your changes.

**Example:**

```bash
# edited Login.tsx and api.ts, but only want to commit the login fix
git add src/Login.tsx
git commit -m "fix: show error when password is empty"
# api.ts stays modified in the working directory for a later commit
```

**Say it like this:** "Files move from the working directory to the staging area with `git add`, then into the repository with `git commit`. I use the staging area to make focused commits. If I've touched five files but only three belong to this fix, I stage only those three."

---

**Q4. `git init` vs `git clone`?**

**Short answer:** `init` creates a brand-new empty repository. `clone` copies an existing remote repository, including its full history, and sets up `origin`.

**Example:**

```bash
git init my-app                              # new project
git clone git@github.com:company/web-app.git  # join an existing project
```

**Say it like this:** "I use `git init` when I start something new and `git clone` when I join an existing project. `clone` also configures the remote as `origin` for me."

---

**Q5. What does `git status` show?**

**Short answer:** The current branch, staged changes, unstaged changes, untracked files, and whether you're ahead of or behind the remote branch.

**Example:**

```text
On branch feat/login
Your branch is ahead of 'origin/feat/login' by 1 commit.
Changes to be committed:     modified: src/Login.tsx
Changes not staged:          modified: src/api.ts
Untracked files:             src/Login.test.tsx
```

**Say it like this:** "`git status` is my most-used command. It tells me where I am and what's going into the next commit before I commit or push anything."

---

**Q6. `git add .` vs `git add -A` vs `git add -p`?**

**Short answer:** `git add .` stages changes in the current folder and below. `git add -A` stages everything in the repo, including deletions. `git add -p` lets you choose individual "hunks" (chunks of changes) interactively.

**Explanation:** `-p` (patch mode) is the senior habit. It lets you review each change before staging it. That catches leftover `console.log` lines and lets you split unrelated changes into separate commits.

**Example:**

```bash
git add -p src/Dashboard.tsx
# Stage this hunk [y,n,q,a,d,s,e,?]?  y = yes, n = no, s = split into smaller hunks
```

**Say it like this:** "For quick work I use `git add -A`, but before a PR I prefer `git add -p`. It forces me to review every change and keeps debug code and unrelated edits out of the commit."

---

**Q7. What makes a good commit message?**

**Short answer:** A short imperative subject line (about 50 characters), a blank line, then a body explaining *why* the change was made.

**Explanation:** The diff already shows *what* changed, so the message should explain *why*. Many teams use Conventional Commits prefixes (`feat:`, `fix:`, `refactor:`) so changelogs and version numbers can be generated automatically.

**Example:**

```text
fix: prevent double join when reconnecting to a call

The join button stayed enabled during reconnection, so users could
click it twice and create two participants in the same room.
Disable it while the connection state is "reconnecting".

Closes #412
```

**Say it like this:** "I write an imperative subject like 'fix: prevent double join on reconnect', and in the body I explain why, because six months later the reason is what people need. We used Conventional Commits so the changelog was generated automatically."

---

**Q8. Useful forms of `git log`?**

**Short answer:**

- `git log --oneline --graph --decorate -20` shows a compact visual history.
- `git log -p path/to/file` shows the full change history of one file.
- `git log --author="Name"` filters by author.
- `git log -S "functionName"` (the "pickaxe") finds the commits where a string was added or removed.

**Example:** To find when someone removed `validateToken()`, run `git log -S "validateToken" --oneline`.

**Say it like this:** "Day to day I use `git log --oneline --graph`. When I'm debugging I use `git log -S` to find the exact commit that added or removed a piece of code."

---

**Q9. What is a branch?**

**Short answer:** A lightweight, movable pointer to a commit. It represents an independent line of work.

**Explanation:** Creating a branch doesn't copy any files. Git writes a tiny file containing a commit ID, which is why branching is instant and teams create a branch for every feature or fix.

**Example:**

```bash
git switch -c feat/patient-search   # create and switch
git branch                          # list local branches
git branch -d feat/patient-search   # delete after merge
```

**Say it like this:** "A branch is just a pointer to a commit, so it's cheap. I create one for every task, keep it short-lived, and merge it through a PR."

---

**Q10. `git checkout` vs `git switch` vs `git restore`?**

**Short answer:** `checkout` was overloaded: it switched branches *and* restored files. Git 2.23 split it in two. `switch` changes branches, and `restore` discards file changes or unstages them.

**Example:**

```bash
git switch main                  # change branch
git switch -c feat/x             # create + switch
git restore src/App.tsx          # throw away unstaged edits
git restore --staged src/App.tsx # unstage, keep edits
```

**Say it like this:** "I use the newer `switch` and `restore` commands because they're explicit and harder to misuse than `checkout`, which could overwrite files when I meant to change branch."

---

**Q11. What is HEAD?**

**Short answer:** A pointer to the commit you currently have checked out. Usually it points to a branch name, which in turn points to a commit.

**Explanation:** `HEAD~1` means one commit before HEAD and `HEAD~3` means three back. If HEAD points directly to a commit instead of a branch, you're in "detached HEAD" state (see Q35).

**Say it like this:** "HEAD is 'where I am'. Normally it follows my current branch, and I use `HEAD~n` to refer to earlier commits, for example `git reset --soft HEAD~1`."

---

**Q12. What is `origin`? What is `upstream`?**

**Short answer:** `origin` is the default name for the remote you cloned from. `upstream` is a common name for the original repository when you work on a fork.

**Example:**

```bash
git remote -v
git remote add upstream https://github.com/original/project.git
git fetch upstream && git rebase upstream/main   # keep fork updated
```

**Say it like this:** "`origin` is just a nickname for the remote URL I cloned. When I contribute through a fork, I add the original repo as `upstream` and sync from it."

---

**Q13. What does `git push -u origin feat/x` do?**

**Short answer:** It pushes the branch to the remote and sets "upstream tracking", so later `git push` and `git pull` need no arguments.

**Say it like this:** "The `-u` flag links my local branch to the remote one. After the first push I just type `git push`."

---

**Q14. `git fetch` vs `git pull`?**

**Short answer:** `fetch` downloads new commits from the remote but doesn't change your files or branch. `pull` is `fetch` plus `merge` (or `rebase` with `--rebase`).

**Explanation:** `fetch` is always safe because it only updates remote-tracking branches like `origin/main`. You can inspect what changed before integrating it.

**Example:**

```bash
git fetch origin
git log main..origin/main --oneline   # what's new on the remote?
git merge origin/main                 # integrate when ready
```

**Say it like this:** "Fetch is look; pull is look and integrate. When I'm unsure what's coming in, I fetch first and review `main..origin/main`. Day to day I use `git pull --rebase` to avoid unnecessary merge commits."

---

**Q15. What is `.gitignore`?**

**Short answer:** A file listing patterns of files Git should not track.

**Example (typical frontend project):**

```gitignore
node_modules/
dist/
build/
.next/
coverage/
.env
.env.local
!.env.example
.DS_Store
*.log
```

**Say it like this:** "`.gitignore` keeps dependencies, build output, local env files and OS junk out of the repo. I always commit an `.env.example` so new developers know which variables they need."

---

**Q16. A file is already committed, and adding it to `.gitignore` doesn't stop it being tracked. Why, and how do you fix it?**

**Short answer:** `.gitignore` only applies to *untracked* files. Remove the file from the index with `git rm --cached`, then commit.

**Example:**

```bash
echo ".env" >> .gitignore
git rm --cached .env
git commit -m "chore: stop tracking .env"
```

If the file contained secrets, rotate them too (see Q59), because they're still in history.

**Say it like this:** "Ignore rules don't affect files Git already tracks. I run `git rm --cached` so the file stays on disk but leaves the repo. If it held secrets, I treat them as leaked and rotate them."

---

**Q17. `git diff` variants?**

**Short answer:**

- `git diff` shows unstaged changes.
- `git diff --staged` shows staged changes compared with the last commit.
- `git diff main...feat` (three dots) shows what `feat` changed since it branched from `main`. This is what a PR shows.

**Say it like this:** "Before committing I run `git diff --staged` to review exactly what's going in. To see a branch's changes the way a PR shows them, I use the three-dot diff against main."

---

**Q18. How do you discard local changes to a file?**

**Short answer:** Run `git restore file`. If the file is staged, first run `git restore --staged file` to unstage it, then `git restore file`.

**Warning:** You can't undo this for uncommitted changes, because Git never saved them.

---

**Q19. What is a merge conflict?**

**Short answer:** Two branches changed the same lines of a file (or one deleted a file the other edited), so Git can't decide automatically and asks you to resolve it.

**Example of conflict markers:**

```text
<<<<<<< HEAD
const TIMEOUT = 5000;
=======
const TIMEOUT = 10000;
>>>>>>> feat/slow-network
```

You edit the file to the correct final content, delete the markers, then `git add` the file and continue.

**Say it like this:** "A conflict means both sides edited the same region. I don't just pick a side blindly. I check what each change intended, sometimes with the other developer, then run the tests after resolving."

---

**Q20. What is a pull request?**

**Short answer:** A request to merge one branch into another, with a place for code review, discussion, automated CI checks and approvals before merging.

**Explanation:** A good PR is small, has a clear description (what, why, how to test, screenshots for UI) and links the ticket. GitLab calls the same thing a merge request.

**Say it like this:** "A PR is our quality gate. CI must pass and at least one reviewer approves. I keep PRs small, ideally under about 400 lines, because large PRs get rubber-stamped instead of reviewed."

---

**Q21. Fork vs clone?**

**Short answer:** A fork is a server-side copy of a repo under your own GitHub account, used when you don't have write access. A clone is a local copy on your machine.

**Example:** For an open-source contribution, you fork the project, clone your fork, push a branch to it, and then open a PR to the original repo.

---

**Q22. What are tags?**

**Short answer:** Named, fixed pointers to specific commits, usually marking releases such as `v1.4.0`.

**Explanation:** Annotated tags (`git tag -a v1.0 -m "First release"`) store the author, date and message, and are recommended for releases. Lightweight tags are just names. Tags aren't pushed by default, so use `git push origin v1.0` or `git push --tags`.

**Say it like this:** "We tag every production release with a semantic version. This makes it easy to diff releases, roll back, or create a hotfix branch from an exact version."

---

## 🟡 Level 2 — Intermediate

**Q23. Merge vs rebase?**

**Short answer:** Merge combines two histories with a new merge commit and preserves exactly what happened. Rebase replays your commits on top of another branch to create a straight, linear history.

**Explanation:**

```text
Before:       A---B---C  main
                   \
                    D---E  feature

After merge:  A---B---C-------M  main
                   \         /
                    D-------E

After rebase: A---B---C---D'---E'  feature (new commit IDs)
```

Rebase creates *new* commits (D', E'). If someone else had the old D and E, their history diverges. **Golden rule:** never rebase commits that others have already pulled.

**Say it like this:** "I rebase my own feature branch onto main to keep it current and the history clean. I merge into shared branches, and I never rebase anything other people are working on, because rebase rewrites commit IDs."

---

**Q24. What is a fast-forward merge?**

**Short answer:** If the target branch hasn't moved since you branched, Git just moves its pointer forward to your latest commit, with no merge commit.

**Explanation:** Use `--no-ff` to force a merge commit, so the feature stays visible as a group in history.

**Example:** `git merge --no-ff feat/login`

---

**Q25. `git reset --soft` vs `--mixed` vs `--hard`?**

**Short answer:** All three move the branch pointer. They differ in what happens to your staged and working files.

| Mode | Branch pointer | Staging area | Working files |
|---|---|---|---|
| `--soft` | moved | kept (changes stay staged) | kept |
| `--mixed` (default) | moved | reset (changes unstaged) | kept |
| `--hard` | moved | reset | **reset — changes are lost** |

**Example:**

```bash
git reset --soft HEAD~1   # undo commit, keep changes staged (to recommit)
git reset HEAD~1          # undo commit, keep changes as unstaged edits
git reset --hard HEAD~1   # undo commit AND delete the changes
```

**Say it like this:** "Soft keeps everything staged, mixed keeps the files but unstages them, and hard throws everything away. I use soft to redo a commit and avoid hard unless I'm sure, and even then the reflog can save me."

---

**Q26. `reset` vs `revert`?**

**Short answer:** `reset` moves the branch backwards and rewrites history, so use it only on local or unshared commits. `revert` creates a *new* commit that undoes an earlier one. It's safe for shared branches like `main`.

**Example:**

```bash
git revert a1b2c3d     # creates "Revert 'feat: new checkout flow'"
git push               # no force needed, history preserved
```

**Say it like this:** "On shared branches I always revert, because it adds an undo commit without rewriting anyone's history. Reset is for cleaning up my own local commits."

---

**Q27. How do you undo the last commit but keep the changes?**

**Short answer:** `git reset --soft HEAD~1`. The commit disappears and the changes stay staged.

---

**Q28. How do you fix the last commit message or add a forgotten file?**

**Short answer:** Stage the file and run `git commit --amend`. Add `--no-edit` to keep the message.

**Example:**

```bash
git add src/forgotten.ts
git commit --amend --no-edit
```

**Caution:** Amend rewrites the commit. If you've already pushed it, you need `git push --force-with-lease`, so only do this on your own branch.

---

**Q29. How do you use `git stash`?**

**Short answer:** Stash temporarily shelves uncommitted changes so you can switch context, then reapplies them later.

**Example:**

```bash
git stash push -u -m "wip: login validation"   # -u includes untracked files
git switch main                                 # fix something urgent
git switch feat/login
git stash list
git stash pop            # apply the latest stash and remove it
git stash apply stash@{1}  # apply a specific one but keep it in the list
git stash show -p stash@{0} # inspect before applying
```

**Say it like this:** "When I'm pulled onto an urgent bug mid-feature, I stash with a message, fix the bug, then pop the stash. For longer interruptions I prefer a WIP commit or a `git worktree`, because stashes are easy to forget."

---

**Q30. What is cherry-pick?**

**Short answer:** It applies the changes from one specific commit onto your current branch, creating a new commit.

**Example (backport a fix to a release branch):**

```bash
git switch release/2.3
git cherry-pick -x 9f8e7d6   # -x adds "(cherry picked from commit ...)"
git push
```

**Say it like this:** "I use cherry-pick to backport a hotfix to a release branch without bringing along unrelated commits. The `-x` flag records where the commit came from."

---

**Q31. What is interactive rebase used for?**

**Short answer:** Rewriting your recent commits before review: squashing, rewording, reordering, editing or dropping them.

**Example:**

```bash
git rebase -i HEAD~4
```

```text
pick   a1 feat: add search input
fixup  b2 fix typo
squash c3 add debounce to search
reword d4 add tests
```

`pick` keeps the commit, `squash` merges it into the previous one and combines the messages, `fixup` merges it and discards the message, `reword` changes the message, and `drop` removes the commit.

**Say it like this:** "Before opening a PR I run an interactive rebase to squash 'fix typo' and 'wip' commits into logical commits, so reviewers read a clean story."

---

**Q32. How do `--fixup` and `--autosquash` work?**

**Short answer:** `git commit --fixup <sha>` creates a commit marked as a fix for an earlier one. Running `git rebase -i --autosquash main` then moves it into place and squashes it automatically.

**Example:** A reviewer finds a bug in commit `a1b2`. Run `git commit --fixup a1b2`, push, and after approval run `git rebase -i --autosquash origin/main`.

---

**Q33. How do you resolve a conflict step by step?**

**Short answer:**

1. Run `git status` to see the conflicted files.
2. Open each file, decide the correct final code, and remove the `<<<<<<<`, `=======` and `>>>>>>>` markers.
3. Run `git add <file>` to mark it resolved.
4. Run `git merge --continue` (or `git rebase --continue`).
5. Run the tests and lint before pushing.

You can always back out with `git merge --abort` or `git rebase --abort`.

**Say it like this:** "I resolve each file intentionally. If I don't understand the other change, I ask its author. After resolving I always run the tests, because a conflict-free merge can still be logically broken."

---

**Q34. What do "ours" and "theirs" mean, and why do they flip during a rebase?**

**Short answer:** In a merge, *ours* is your current branch and *theirs* is the branch being merged in. In a rebase, Git checks out the base branch and replays your commits onto it, so *ours* is the base branch and *theirs* is your commit.

**Example:** During `git rebase main` on `feature`, `git checkout --theirs file.ts` keeps *your feature's* version.

**Say it like this:** "During a rebase the meanings flip, because Git is replaying my commits onto main. So 'ours' is main. I double-check before using `--ours` or `--theirs` in bulk."

---

**Q35. What is a detached HEAD, and how do you save work made there?**

**Short answer:** HEAD points directly to a commit instead of a branch. This happens when you check out a tag or a commit ID. Any commits you make aren't on a branch and can be lost when you switch away.

**Fix:** `git switch -c rescue-branch` creates a branch at your current position.

---

**Q36. What is `git reflog`?**

**Short answer:** A local log of every position HEAD and your branches have pointed to, kept for about 90 days. It's your undo history for Git itself.

**Example (recover from a bad reset):**

```bash
git reset --hard HEAD~3        # oops, lost 3 commits
git reflog
# a1b2c3d HEAD@{1}: commit: feat: add filters   <- the lost commit
git reset --hard a1b2c3d       # or: git branch recovered a1b2c3d
```

**Say it like this:** "Committed work is almost never truly lost in Git. The reflog records every move of HEAD, so I can find the old commit ID and restore it."

---

**Q37. What is `git bisect`?**

**Short answer:** A binary search through history to find the exact commit that introduced a bug.

**Example:**

```bash
git bisect start
git bisect bad                 # current commit is broken
git bisect good v1.4.0         # this release was fine
# Git checks out a middle commit; test it, then:
git bisect good   # or: git bisect bad
# ...repeat until Git prints "<sha> is the first bad commit"
git bisect reset

# Fully automatic: the script exits 0 for good, non-zero for bad
git bisect run npm test -- src/cart.test.ts
```

With 1,000 commits, bisect needs only about 10 steps (log₂ 1000).

**Say it like this:** "When something broke and nobody knows when, I use `git bisect run` with a failing test. It finds the bad commit among hundreds in a few minutes."

---

**Q38. Useful `git blame` flags?**

**Short answer:** `git blame -w -C -C file`. `-w` ignores whitespace changes and `-C` follows lines moved or copied from other files. Add formatting-only commits to `.git-blame-ignore-revs` so blame skips them.

**Say it like this:** "I use blame to find *why* a line exists, not *who* to blame. It leads me to the commit message and PR discussion."

---

**Q39. Compare the main branching strategies.**

**Short answer:**

| Strategy | How it works | Best for |
|---|---|---|
| Git Flow | `main`, `develop`, `feature/*`, `release/*`, `hotfix/*` | Versioned releases (mobile apps, packages) |
| GitHub Flow | `main` + short-lived feature branches + PRs; deploy from main | Most web apps |
| Trunk-based | Very short branches (hours or days), feature flags hide unfinished work, continuous deploy | Teams with strong CI/CD |

**Say it like this:** "For web products I prefer GitHub Flow or trunk-based development with feature flags. Short-lived branches mean fewer conflicts and faster feedback. Git Flow makes sense when you ship versioned releases, like a mobile app."

---

**Q40. Merge commit vs squash merge vs rebase merge on GitHub?**

**Short answer:**

- **Merge commit:** keeps every commit plus a merge commit. Full history, but noisy.
- **Squash and merge:** the whole PR becomes one commit on `main`. Clean and easy to revert, but you lose the granular commits.
- **Rebase and merge:** each commit is replayed onto `main` in a linear history.

**Say it like this:** "We used squash merges. One PR becomes one commit on main, which made reverts and changelogs simple."

---

**Q41. What are branch protection rules?**

**Short answer:** Settings that stop bad changes from reaching important branches. They can require PR reviews (including CODEOWNERS), passing status checks and an up-to-date branch. They can also require linear history and signed commits, and block force pushes and branch deletion.

**Say it like this:** "On main we required one approval, green CI (lint, typecheck, tests, build) and no force pushes. Even admins went through the same rules."

---

**Q42. What is CODEOWNERS?**

**Short answer:** A file (`.github/CODEOWNERS`) that maps paths to the people or teams automatically requested for review. Combined with branch protection, their approval becomes mandatory.

**Example:**

```text
/src/auth/            @company/security-team
/src/components/ui/   @hrushi @design-system-team
*.yml                 @company/devops
```

---

**Q43. What is semantic versioning?**

**Short answer:** Versions use the format `MAJOR.MINOR.PATCH`. MAJOR means breaking changes, MINOR means new backwards-compatible features, and PATCH means bug fixes. Pre-releases look like `2.0.0-beta.1`.

**Example:** `1.4.2 → 1.4.3` (bug fix), `1.4.3 → 1.5.0` (new feature), `1.5.0 → 2.0.0` (breaking API change).

---

**Q44. What are Conventional Commits?**

**Short answer:** A commit message convention: `type(scope): description`. Types include `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf` and `ci`. A `!` or a `BREAKING CHANGE:` footer marks a major change.

**Example:** `feat(call): show reconnecting banner`, `fix!: change token response shape`.

**Why it matters:** tools like semantic-release and Changesets read the commit types to bump versions and generate changelogs automatically.

---

**Q45. What are Husky and lint-staged?**

**Short answer:** Husky manages Git hooks inside the repo, so every developer gets them. lint-staged runs linters only on staged files, which keeps hooks fast.

**Example (`package.json`):**

```json
{
  "scripts": { "prepare": "husky" },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
```

Add `.husky/pre-commit` containing `npx lint-staged`, and `.husky/commit-msg` running commitlint.

**Say it like this:** "Hooks give fast local feedback, but they can be skipped with `--no-verify`, so CI runs the same checks as the real gate."

---

**Q46. What does `git clean` do?**

**Short answer:** It deletes untracked files. Always dry-run first: `git clean -nd` previews, `git clean -fd` deletes, and `-x` also removes ignored files such as `node_modules`.

---

## 🔴 Level 3 — Advanced

**Q47. How does Git store data internally?**

**Short answer:** Git is a content-addressed object database with four object types:

- **Blob:** a file's contents.
- **Tree:** a directory listing that points to blobs and other trees.
- **Commit:** points to one tree (the snapshot), its parent commit(s), the author and the message.
- **Tag:** an annotated, named pointer to a commit.

Each object is named by the hash of its content. Branches are small files in `.git/refs/heads/` containing a commit hash.

**Example:**

```bash
git cat-file -p HEAD          # see the commit object: tree, parent, author
git cat-file -p HEAD^{tree}   # see the directory listing
cat .git/refs/heads/main      # a branch is literally just a hash
```

**Say it like this:** "Git is a key-value store where the key is a hash of the content. Identical files are stored once, history can't be silently altered, and a branch is just a file holding a commit hash."

---

**Q48. Why are branches cheap in Git?**

**Short answer:** A branch is a tiny file containing a 40-character commit hash. Creating one copies no files.

---

**Q49. What is a three-way merge?**

**Short answer:** Git compares three versions: your branch tip, the other branch tip, and their *merge base* (common ancestor). If only one side changed a region compared with the base, Git takes that side. If both sides changed it differently, that's a conflict.

**Example:** Base has `timeout = 5`, you changed it to `10`, and the other branch didn't touch it, so the result is `10` with no conflict. If the other branch changed it to `7`, you get a conflict.

---

**Q50. What merge strategies exist?**

**Short answer:** `ort` is the default since Git 2.34 and is faster than the older `recursive`. `octopus` merges many branches at once, and `ours` records a merge but keeps your tree entirely. Strategy *options* such as `-X ours` and `-X theirs` automatically resolve only the conflicting hunks in favour of one side.

---

**Q51. What does `git rebase --onto` do?**

**Short answer:** It moves a range of commits onto a new base.

**Example:** `feature` was branched from `old-feature`, which was abandoned, and you want only `feature`'s own commits on `main`:

```bash
git rebase --onto main old-feature feature
# take commits in (old-feature, feature] and replay them onto main
```

---

**Q52. `git push --force` vs `--force-with-lease`?**

**Short answer:** `--force` overwrites the remote branch no matter what. `--force-with-lease` refuses if someone else pushed since your last fetch, so it can't silently delete a teammate's commits.

**Say it like this:** "I never use plain `--force`. After rebasing my own branch I use `--force-with-lease`, and on main force pushes are blocked by branch protection anyway."

---

**Q53. What is `git rerere`?**

**Short answer:** "Reuse recorded resolution". Git remembers how you resolved a conflict and reapplies that resolution automatically if the same conflict appears again. It's useful for long-running branches that you rebase repeatedly. Enable it with `git config --global rerere.enabled true`.

---

**Q54. Submodules vs subtrees vs monorepo?**

**Short answer:**

- **Submodule:** the parent repo stores a pointer to a specific commit of another repo. Versions are explicit, but the workflow is clunky (you have to remember `git submodule update`).
- **Subtree:** copies the other repo's code into a folder, with history. It's simpler for consumers.
- **Monorepo:** all apps and packages live in one repo, managed with Nx, Turborepo or pnpm workspaces. You get atomic cross-package changes, one CI pipeline and "affected-only" builds.

**Say it like this:** "For two products sharing a UI library, I'd choose a monorepo with pnpm workspaces and Turborepo. One PR can update the library and both apps, and CI rebuilds only what changed."

---

**Q55. What are sparse checkout and partial clone?**

**Short answer:** Tools for huge repos. A partial clone (`git clone --filter=blob:none`) downloads file contents only when needed. A sparse checkout (`git sparse-checkout set apps/web packages/ui`) puts only the selected folders in your working directory.

---

**Q56. What is Git LFS?**

**Short answer:** Large File Storage. Big binaries (videos, design files, datasets) live on a separate server, and Git stores only small pointer files. This keeps clones fast.

---

**Q57. What's the catch with shallow clones in CI?**

**Short answer:** `--depth 1` makes checkout fast, but tools that need history break. Changelog generation, `nx affected`, `git describe` and commit-range linting are examples. In GitHub Actions, set `fetch-depth: 0` (or enough depth) for those jobs.

---

**Q58. What are signed commits?**

**Short answer:** Commits signed with a GPG or SSH key prove who made them, and GitHub shows a "Verified" badge. Branch protection can require them. To enable signing, run `git config commit.gpgsign true`.

---

**Q59. How do you remove a secret from Git history properly?**

**Short answer:**

1. **Rotate the secret first.** Once it was pushed, assume it's compromised.
2. Rewrite history with `git filter-repo --path .env --invert-paths` (or BFG Repo-Cleaner).
3. Force-push all branches and tags.
4. Ask collaborators to re-clone, and ask GitHub support to clear cached views if needed.
5. Enable secret scanning and push protection so it can't happen again.

**Say it like this:** "The first step isn't Git, it's rotating the key, because once it's pushed it may already be scraped. Then I purge it from history and add push protection."

---

**Q60. What is `git worktree`?**

**Short answer:** It lets you check out multiple branches of the same repo into different folders at the same time.

**Example:**

```bash
git worktree add ../app-hotfix main   # a second folder on main
cd ../app-hotfix && fix && commit && push
git worktree remove ../app-hotfix
```

**Say it like this:** "When a production bug comes in during a big refactor, I open a worktree on main instead of stashing. My refactor stays exactly as it was."

---

**Q61. How does `git pull --rebase` change a team's workflow?**

**Short answer:** It avoids noisy "Merge branch 'main' of origin" commits by replaying your local commits on top of what you pulled. Set it as the default with `git config --global pull.rebase true`.

---

**Q62. Client-side vs server-side hooks?**

**Short answer:** Client hooks (`pre-commit`, `commit-msg`, `pre-push`) run locally and can be skipped with `--no-verify`. Server hooks (`pre-receive`, `update`) are enforced on the server. GitHub doesn't allow custom server hooks, so enforcement uses branch protection, rulesets and required Actions checks.

---

## 🔴 GitHub Actions and CI/CD

**What is CI/CD?** Continuous Integration (CI) automatically builds and tests every change. Continuous Delivery or Deployment (CD) automatically ships passing changes to staging or production. GitHub Actions is GitHub's built-in CI/CD system: YAML files in `.github/workflows/` define *workflows* made of *jobs* (which run on fresh virtual machines) made of *steps*.

**Q63. Describe the anatomy of a workflow.**

**Example:**

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint && pnpm typecheck
      - run: pnpm test -- --coverage
      - run: pnpm build
```

**Explanation:** `on` sets the triggers. `jobs` run in parallel unless you add `needs:`. `uses` runs a reusable action and `run` runs a shell command. `--frozen-lockfile` makes CI fail if the lockfile doesn't match `package.json`.

**Say it like this:** "Every PR runs lint, typecheck, tests with coverage and a production build. Branch protection requires all of them to pass before merge."

---

**Q64. How do you cache dependencies?**

**Short answer:** Use `actions/setup-node` with `cache: npm|pnpm|yarn`, or `actions/cache` keyed by the lockfile hash (`hashFiles('**/pnpm-lock.yaml')`). When the lockfile changes, the cache key changes too.

---

**Q65. What are matrix builds?**

**Short answer:** They run the same job across several configurations.

```yaml
strategy:
  matrix:
    node: [18, 20, 22]
    os: [ubuntu-latest, windows-latest]
```

---

**Q66. How do you handle secrets and environments?**

**Short answer:** Store secrets in repo or org settings and reference them as `${{ secrets.API_KEY }}`. GitHub masks them in logs. *Environments* such as `production` add required approvers and environment-specific secrets. Never `echo` secrets, and don't expose secrets to workflows triggered by PRs from forks.

---

**Q67. Why use OIDC to AWS instead of long-lived keys?**

**Short answer:** With OpenID Connect, the workflow asks AWS for short-lived credentials by assuming an IAM role. No permanent access keys are stored in GitHub, so there's nothing long-lived to leak.

```yaml
permissions:
  id-token: write
  contents: read
steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/gh-deploy
      aws-region: ap-south-1
```

---

**Q68. How do preview deployments work?**

**Short answer:** Every PR is deployed to its own URL (for example `pr-123.preview.app.com` via Vercel, Netlify, or S3 + CloudFront), and the link is posted on the PR. Designers and QA can test before merge, and the preview is removed when the PR closes.

---

**Q69. What are reusable workflows and composite actions?**

**Short answer:** A *reusable workflow* (`on: workflow_call`) is a whole pipeline other repos can call, for example one standard "frontend CI" for all apps. A *composite action* bundles repeated steps into one `uses:` step.

---

**Q70. What does the `concurrency` key do?**

**Short answer:** It cancels outdated runs. When you push again to a PR, the previous run for that branch stops.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

**Q71. What are Dependabot and Renovate?**

**Short answer:** Bots that open PRs to update dependencies. Good practice is to group minor updates, auto-merge patch updates when CI passes, and review major updates manually.

---

## 🧩 Level 4 — Scenario-Based

**Q72. You pushed a commit with a bug to `main` and others have already pulled. What do you do?**

**Answer:** Revert, don't reset.

```bash
git revert <bad-sha>
git push origin main
```

Then fix the bug properly in a new PR. Resetting and force-pushing `main` would break everyone's local copy.

**Say it like this:** "I'd revert immediately to get main healthy, tell the team, then ship the real fix with a regression test in a follow-up PR."

---

**Q73. You accidentally committed to `main` locally instead of a feature branch.**

```bash
git switch -c feat/x          # new branch keeps your commits
git switch main
git reset --hard origin/main  # put local main back to match the remote
```

---

**Q74. You ran `git reset --hard` and lost work.**

**Answer:** It depends on what state the work was in:

- **It was committed:** run `git reflog`, find the commit ID, then `git reset --hard <sha>`.
- **It was only staged:** `git fsck --lost-found` can recover the dangling blobs (file contents).
- **It was never staged:** Git never saved it. Check your editor's local history (VS Code timeline, JetBrains local history).

---

**Q75. Your PR has 23 messy commits and the reviewer wants a clean history.**

```bash
git fetch origin
git rebase -i origin/main     # squash/fixup into 2-4 logical commits
git push --force-with-lease
```

---

**Q76. A long-running feature branch constantly conflicts with `main`.**

**Answer:** Fix the process, not just the conflicts:

- Integrate `main` into the branch daily (rebase or merge).
- Split the feature into smaller PRs that can merge early.
- Hide unfinished UI behind a **feature flag**, so incomplete code can merge safely.
- Enable `rerere` to avoid resolving the same conflict twice.

**Say it like this:** "Constant conflicts are a sign the branch lives too long. I'd split the work and merge behind a feature flag. Small, frequent merges are almost conflict-free."

---

**Q77. A release needs one fix from `develop`, but not the other 10 commits.**

**Answer:** Cherry-pick the one commit (`git cherry-pick -x <sha>`) onto the release branch, tag a patch release (`v2.3.1`), and make sure the fix also exists on `main` or `develop` so it isn't lost in the next release.

---

**Q78. CI passes locally but fails in GitHub Actions. How do you debug it?**

**Answer:** Check the usual differences between your machine and CI:

- Node version (pin it with `.nvmrc` or `engines`).
- Dependencies (CI uses `--frozen-lockfile`; your local `node_modules` may be stale).
- Missing environment variables or secrets.
- Case-sensitive file paths (macOS ignores case, Linux doesn't: `import './Button'` vs `button.tsx`).
- Timezone or locale differences in date tests.
- Tests that depend on run order or shared state.
- Network calls that aren't mocked.

**Say it like this:** "The classic one I've hit is case sensitivity. An import worked on Mac but failed on Linux CI. I go through the environment differences one by one."

---

**Q79. Two developers need to work on the same feature branch.**

**Answer:** Agree on `git pull --rebase`, small commits and frequent pushes. Alternatively, each developer works on a sub-branch and opens PRs into the shared feature branch.

---

**Q80. A teammate force-pushed and overwrote your commits on a shared branch.**

**Answer:** Your local reflog still has your commits. Find the commit ID, create a branch from it and push it, then coordinate the merge. Afterwards, enable branch protection to block force pushes on shared branches.

---

**Q81. Which commit made the bundle size jump from 300 KB to 900 KB?**

**Answer:** Automate `git bisect` with a script:

```bash
# check-size.sh — exit 1 if the bundle is too big
npm run build >/dev/null && \
[ $(du -k dist/assets/index-*.js | cut -f1) -lt 400 ]
```

```bash
git bisect start HEAD v2.0.0
git bisect run ./check-size.sh
```

---

**Q82. You need to make a hotfix while in the middle of a large refactor.**

**Answer:** Run `git worktree add ../app-hotfix main` (or stash), fix the bug there, open a PR, then return to your untouched refactor.

---

**Q83. How would you enforce consistent commit messages and formatting across 15 developers?**

**Answer:**

1. **Locally:** Husky + lint-staged (ESLint, Prettier) + commitlint, for fast feedback.
2. **In CI:** the same checks run again, because local hooks can be skipped.
3. **On GitHub:** branch protection requires those checks, plus a PR template.
4. **Culture:** document it in CONTRIBUTING.md and show the benefit, such as auto-generated changelogs.

---

## 🎯 From Your Resume

**Q84. "Walk me through the CI/CD for your self-hosted LiveKit infrastructure."**

**Sample answer structure:** GitHub Actions builds a Docker image, scans it (for example with Trivy), and pushes it to Amazon ECR. It then deploys to EC2 or ECS, runs health checks, and rolls back automatically if they fail. AWS access uses OIDC, so there are no stored keys. Infrastructure and config changes go through PR review.

**Say it like this:** "Every merge to main builds and scans a Docker image, pushes it to ECR, and deploys with a health check. Authentication to AWS uses OIDC, so no access keys live in GitHub. For a media server we drained rooms before replacing a node, so live calls weren't cut."

*Describe only what you actually built, and say "we" for the parts DevOps owned.*

---

**Q85. "How did you enforce testing standards for the frontend team?"**

**Say it like this:** "I made lint, typecheck, tests and build required status checks on main. I added a coverage threshold for critical modules like auth and the call flow, rather than chasing a global percentage. Our PR template had a 'tests added or updated' checkbox, and CODEOWNERS ensured shared components got a review from someone who knew them."

---

**Q86. "How do you handle releases across two products that share a component library?"**

**Say it like this:** "I'd use a monorepo with pnpm workspaces and Changesets. Each change to the library includes a changeset describing the version bump. Releases are semantic-versioned, and each product upgrades deliberately. Breaking changes ship with migration notes, and CI builds both products against the library before merge."
