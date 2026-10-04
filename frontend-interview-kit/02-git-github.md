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

Every answer below has four parts: **Short answer** (say this first), **Explanation** (add if asked for more), **Example** (a command, code or real situation) and **Say it like this** (a sample spoken answer).

## 🟢 Level 1 — Basics

**Q1. What is Git? How is it different from GitHub?**

**Short answer:** Git is a distributed version control system that runs on your machine and tracks changes to files. GitHub is a cloud platform that hosts Git repositories and adds collaboration tools such as pull requests, issues, Actions and permissions.

**Explanation:** You can use Git without GitHub, for example locally or with GitLab or Bitbucket. GitHub can't work without Git, because every repository on GitHub is a Git repository. Git is the engine; GitHub is a service built around it.

**Example:**

```bash
git init                     # Git only — works offline, no GitHub needed
git remote add origin https://github.com/me/app.git
git push -u origin main      # now GitHub hosts a copy
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

**Explanation:** After `init` there's no remote and no history; you add a remote yourself. After `clone` you have every commit and branch reference, and the remote is already configured, so `git pull` and `git push` work immediately.

**Example:**

```bash
git init my-app                              # new project
git clone git@github.com:company/web-app.git  # join an existing project
```

**Say it like this:** "I use `git init` when I start something new and `git clone` when I join an existing project. `clone` also configures the remote as `origin` for me."

---

**Q5. What does `git status` show?**

**Short answer:** The current branch, staged changes, unstaged changes, untracked files, and whether you're ahead of or behind the remote branch.

**Explanation:** It's a read-only command, so it's always safe. It also suggests the next commands (how to unstage or discard), and it tells you if you're mid-merge or mid-rebase.

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

**Explanation:** `-p` (patch mode) is the senior habit. It lets you review each change before staging it, which catches leftover `console.log` lines and lets you split unrelated changes into separate commits.

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

**Q8. What are the useful forms of `git log`?**

**Short answer:** `git log --oneline --graph --decorate -20` for a compact visual history, `git log -p file` for one file's changes, `git log --author="Name"` to filter by author, and `git log -S "text"` to find when a string was added or removed.

**Explanation:** `-S` is called the "pickaxe". It searches the *content* of changes, not the commit messages, so it finds the exact commit that introduced or deleted a piece of code even if the message doesn't mention it.

**Example:**

```bash
git log --oneline --graph -20
git log -S "validateToken" --oneline   # when was validateToken() added/removed?
```

**Say it like this:** "Day to day I use `git log --oneline --graph`. When I'm debugging I use `git log -S` to find the exact commit that added or removed a piece of code, then read that commit's PR for context."

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

**Explanation:** Because `checkout` does two very different things, a typo could overwrite your file changes when you meant to switch branch. The newer commands make intent explicit and are harder to misuse.

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

**Example:**

```bash
cat .git/HEAD            # ref: refs/heads/main
git reset --soft HEAD~1  # move back one commit
git show HEAD~2          # inspect the commit two before HEAD
```

**Say it like this:** "HEAD is 'where I am'. Normally it follows my current branch, and I use `HEAD~n` to refer to earlier commits, for example `git reset --soft HEAD~1`."

---

**Q12. What is `origin`? What is `upstream`?**

**Short answer:** `origin` is the default name for the remote you cloned from. `upstream` is a common name for the original repository when you work on a fork.

**Explanation:** Remote names are just nicknames for URLs; Git doesn't treat them specially. With a fork, `origin` is your copy (where you push) and `upstream` is the original project (where you pull updates from).

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

**Explanation:** Tracking links your local branch to `origin/feat/x`. Git then also shows "ahead by 2 commits" or "behind by 1" in `git status`, because it knows which remote branch to compare against.

**Example:**

```bash
git switch -c feat/x
git push -u origin feat/x   # first push: set tracking
git push                    # every later push: no arguments needed
```

**Say it like this:** "The `-u` flag links my local branch to the remote one. After the first push I just type `git push`, and `git status` tells me if I'm ahead or behind."

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

**Explanation:** It keeps generated files, dependencies, secrets and OS junk out of the repository. Patterns support wildcards, folders (trailing `/`) and exceptions (a leading `!`). It only affects files that aren't already tracked (see Q16).

**Example:** a typical frontend `.gitignore`:

```gitignore
node_modules/
dist/
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

**Explanation:** Once a file is tracked, Git keeps tracking it regardless of ignore rules. `--cached` removes it from Git's index but leaves it on your disk. If the file held secrets, they still exist in history, so treat them as leaked.

**Example:**

```bash
echo ".env" >> .gitignore
git rm --cached .env
git commit -m "chore: stop tracking .env"
```

**Say it like this:** "Ignore rules don't affect files Git already tracks. I run `git rm --cached` so the file stays on disk but leaves the repo. If it held secrets, I rotate them, because they're still in the history."

---

**Q17. What are the `git diff` variants?**

**Short answer:** `git diff` shows unstaged changes, `git diff --staged` shows staged changes against the last commit, and `git diff main...feat` (three dots) shows what `feat` changed since it branched from `main`.

**Explanation:** The three-dot form compares against the *merge base*, so it ignores changes that landed on `main` after you branched. That's exactly what a pull request shows.

**Example:**

```bash
git diff                     # what I haven't staged yet
git diff --staged            # what my next commit contains
git diff main...feat/login   # what my PR will show
```

**Say it like this:** "Before committing I run `git diff --staged` to review exactly what's going in. To see a branch's changes the way a PR shows them, I use the three-dot diff against main."

---

**Q18. How do you discard local changes to a file?**

**Short answer:** Run `git restore file`. If the file is staged, first run `git restore --staged file` to unstage it, then `git restore file`.

**Explanation:** This replaces your working copy with the last committed version. It can't be undone for uncommitted changes, because Git never saved them. If you might want them later, stash instead.

**Example:**

```bash
git restore --staged src/App.tsx   # unstage
git restore src/App.tsx            # discard edits (permanent)
git stash push src/App.tsx         # safer: keep a copy
```

**Say it like this:** "`git restore` throws away my edits to a file. Since that's permanent for uncommitted work, if I'm not sure, I stash instead."

---

**Q19. What is a merge conflict?**

**Short answer:** Two branches changed the same lines of a file (or one deleted a file the other edited), so Git can't decide automatically and asks you to resolve it.

**Explanation:** Git marks the conflicting region with `<<<<<<<`, `=======` and `>>>>>>>`. You edit the file to the correct final content, delete the markers, `git add` it, and continue the merge or rebase.

**Example:**

```text
<<<<<<< HEAD
const TIMEOUT = 5000;
=======
const TIMEOUT = 10000;
>>>>>>> feat/slow-network
```

**Say it like this:** "A conflict means both sides edited the same region. I don't just pick a side blindly. I check what each change intended, sometimes with the other developer, then run the tests after resolving."

---

**Q20. What is a pull request?**

**Short answer:** A request to merge one branch into another, with a place for code review, discussion, automated CI checks and approvals before merging.

**Explanation:** A good PR is small, has a clear description (what, why, how to test, screenshots for UI) and links the ticket. GitLab calls the same thing a merge request.

**Example:** A PR titled "feat: add reconnecting banner to call screen" with a description, a GIF of the banner, a test plan ("toggle network offline in DevTools"), green CI and one approval before "Squash and merge".

**Say it like this:** "A PR is our quality gate. CI must pass and at least one reviewer approves. I keep PRs small, ideally under about 400 lines, because large PRs get rubber-stamped instead of reviewed."

---

**Q21. Fork vs clone?**

**Short answer:** A fork is a server-side copy of a repo under your own GitHub account, used when you don't have write access. A clone is a local copy on your machine.

**Explanation:** You usually do both: fork on GitHub to get a copy you can push to, then clone your fork to work locally. The PR goes from your fork back to the original repository.

**Example:** For an open-source contribution to LiveKit's React components: fork it, clone your fork, push a branch to it, then open a PR to the original repo.

**Say it like this:** "A fork is my own copy on GitHub; a clone is a copy on my laptop. For open source I fork, clone my fork, and open a PR back to the original."

---

**Q22. What are tags?**

**Short answer:** Named, fixed pointers to specific commits, usually marking releases such as `v1.4.0`.

**Explanation:** Unlike branches, tags don't move. Annotated tags store the author, date and message and are recommended for releases; lightweight tags are just names. Tags aren't pushed by default.

**Example:**

```bash
git tag -a v1.4.0 -m "Release 1.4.0"
git push origin v1.4.0
git switch -c hotfix/1.4.1 v1.4.0   # branch from an exact release
```

**Say it like this:** "We tag every production release with a semantic version. This makes it easy to diff releases, roll back, or create a hotfix branch from an exact version."

---

## 🟡 Level 2 — Intermediate

**Q23. Merge vs rebase?**

**Short answer:** Merge combines two histories with a new merge commit and preserves exactly what happened. Rebase replays your commits on top of another branch to create a straight, linear history.

**Explanation:** Rebase creates *new* commits with new IDs. If someone else had the old ones, their history diverges. **Golden rule:** never rebase commits that others have already pulled.

**Example:**

```text
Before:       A---B---C  main
                   \
                    D---E  feature

After merge:  A---B---C-------M  main
                   \         /
                    D-------E

After rebase: A---B---C---D'---E'  feature (new commit IDs)
```

**Say it like this:** "I rebase my own feature branch onto main to keep it current and the history clean. I merge into shared branches, and I never rebase anything other people are working on, because rebase rewrites commit IDs."

---

**Q24. What is a fast-forward merge?**

**Short answer:** If the target branch hasn't moved since you branched, Git just moves its pointer forward to your latest commit, with no merge commit.

**Explanation:** There's nothing to combine, so no new commit is needed. `--no-ff` forces a merge commit anyway, which keeps the feature visible as a group in history.

**Example:**

```bash
git switch main
git merge feat/login          # fast-forward if main hasn't moved
git merge --no-ff feat/login  # always create a merge commit
```

**Say it like this:** "A fast-forward just slides the branch pointer forward. Some teams prefer `--no-ff` so each feature shows up as one merge in history; with squash merges it doesn't matter."

---

**Q25. `git reset --soft` vs `--mixed` vs `--hard`?**

**Short answer:** All three move the branch pointer. Soft keeps your changes staged, mixed (the default) keeps them as unstaged edits, and hard throws them away.

**Explanation:**

| Mode | Branch pointer | Staging area | Working files |
|---|---|---|---|
| `--soft` | moved | kept | kept |
| `--mixed` | moved | reset | kept |
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

**Short answer:** `reset` moves the branch backwards and rewrites history, so use it only on unshared commits. `revert` creates a *new* commit that undoes an earlier one, so it's safe on shared branches like `main`.

**Explanation:** Rewriting a shared branch breaks everyone who already pulled it, and needs a force push. Revert just adds history, so nobody's local copy is affected.

**Example:**

```bash
git revert a1b2c3d     # creates "Revert 'feat: new checkout flow'"
git push               # no force needed, history preserved
```

**Say it like this:** "On shared branches I always revert, because it adds an undo commit without rewriting anyone's history. Reset is for cleaning up my own local commits."

---

**Q27. How do you undo the last commit but keep the changes?**

**Short answer:** `git reset --soft HEAD~1`. The commit disappears and the changes stay staged.

**Explanation:** This is useful when you committed too early, with the wrong message, or on the wrong branch. If the commit was already pushed, you'd need a force push afterwards, so do it only on your own branch.

**Example:**

```bash
git reset --soft HEAD~1
git switch -c feat/right-branch   # optionally move the work elsewhere
git commit -m "feat: correct message"
```

**Say it like this:** "`git reset --soft HEAD~1` un-commits but keeps everything staged, so I can fix the message, split the commit or move it to another branch."

---

**Q28. How do you fix the last commit message or add a forgotten file?**

**Short answer:** Stage the file and run `git commit --amend`. Add `--no-edit` to keep the message.

**Explanation:** Amend replaces the last commit with a new one. If you've already pushed it, you need `git push --force-with-lease`, so only amend on your own branch.

**Example:**

```bash
git add src/forgotten.ts
git commit --amend --no-edit
git commit --amend -m "fix: correct typo in message"
```

**Say it like this:** "For a forgotten file or a typo in the message I amend the last commit. If it's already pushed to my own branch, I follow up with `--force-with-lease`."

---

**Q29. How do you use `git stash`?**

**Short answer:** Stash temporarily shelves uncommitted changes so you can switch context, then reapplies them later.

**Explanation:** `pop` applies and removes the stash; `apply` keeps it in the list. `-u` includes untracked files, and `-m` adds a message so you can find it later. Stashes are easy to forget, so for long interruptions a WIP commit or a worktree is safer.

**Example:**

```bash
git stash push -u -m "wip: login validation"
git switch main                 # fix something urgent
git switch feat/login
git stash list
git stash pop
```

**Say it like this:** "When I'm pulled onto an urgent bug mid-feature, I stash with a message, fix the bug, then pop the stash. For longer interruptions I prefer a WIP commit or a `git worktree`."

---

**Q30. What is cherry-pick?**

**Short answer:** It applies the changes from one specific commit onto your current branch, creating a new commit.

**Explanation:** It's mainly used to backport a fix to a release branch without bringing along unrelated commits. The `-x` flag records the original commit ID in the message for traceability.

**Example:**

```bash
git switch release/2.3
git cherry-pick -x 9f8e7d6
git push
```

**Say it like this:** "I use cherry-pick to backport a hotfix to a release branch without the rest of develop. The `-x` flag records where the commit came from."

---

**Q31. What is interactive rebase used for?**

**Short answer:** Rewriting your recent commits before review: squashing, rewording, reordering, editing or dropping them.

**Explanation:** `pick` keeps a commit, `squash` merges it into the previous one and combines messages, `fixup` merges it and discards the message, `reword` changes the message, and `drop` removes it. Only do this on commits nobody else has.

**Example:**

```text
git rebase -i HEAD~4

pick   a1 feat: add search input
fixup  b2 fix typo
squash c3 add debounce to search
reword d4 add tests
```

**Say it like this:** "Before opening a PR I run an interactive rebase to squash 'fix typo' and 'wip' commits into logical commits, so reviewers read a clean story."

---

**Q32. How do `--fixup` and `--autosquash` work?**

**Short answer:** `git commit --fixup <sha>` creates a commit marked as a fix for an earlier one. `git rebase -i --autosquash` then moves it into place and squashes it automatically.

**Explanation:** It saves you from manually reordering lines in the rebase editor. It's ideal for review feedback: push fixup commits so reviewers see exactly what changed, then autosquash before merging.

**Example:**

```bash
git commit --fixup a1b2c3d
git rebase -i --autosquash origin/main
```

**Say it like this:** "When a reviewer finds an issue in an earlier commit, I push a fixup commit so the change is easy to re-review, then autosquash it before merge."

---

**Q33. How do you resolve a conflict step by step?**

**Short answer:** List the conflicted files, edit each to the correct final code, `git add` them, continue the merge or rebase, then run the tests.

**Explanation:**

1. `git status` lists the conflicted files.
2. Decide the correct final code and remove the markers.
3. `git add <file>` marks it resolved.
4. `git merge --continue` or `git rebase --continue`.
5. Run tests and lint, because a clean merge can still be logically broken.

You can always back out with `git merge --abort` or `git rebase --abort`.

**Example:** Both branches changed `TIMEOUT`. You check with the other developer that their 10 s value was for slow hospital Wi-Fi, keep 10 s, remove the markers, add, continue, and run the call tests.

**Say it like this:** "I resolve each file intentionally. If I don't understand the other change, I ask its author. After resolving I always run the tests, because a conflict-free merge can still be logically broken."

---

**Q34. What do "ours" and "theirs" mean, and why do they flip during a rebase?**

**Short answer:** In a merge, *ours* is your current branch and *theirs* is the branch being merged in. In a rebase, *ours* is the base branch and *theirs* is your commit.

**Explanation:** During a rebase, Git checks out the base branch and replays your commits onto it, so from Git's point of view the base is "ours". Mixing this up with `--ours`/`--theirs` in bulk can silently discard your own work.

**Example:** During `git rebase main` on `feature`, `git checkout --theirs file.ts` keeps *your feature's* version of the file.

**Say it like this:** "During a rebase the meanings flip, because Git is replaying my commits onto main. So 'ours' is main. I double-check before using `--ours` or `--theirs` in bulk."

---

**Q35. What is a detached HEAD, and how do you save work made there?**

**Short answer:** HEAD points directly to a commit instead of a branch. Commits made there aren't on any branch and can be lost when you switch away. Save them with `git switch -c rescue-branch`.

**Explanation:** It happens when you check out a tag or a commit ID, for example to test an old release. It's fine for looking around; just create a branch before making commits you want to keep.

**Example:**

```bash
git switch --detach v1.2.0   # inspect an old release
# ...made a fix here...
git switch -c hotfix/1.2.1   # now the commits are safe on a branch
```

**Say it like this:** "Detached HEAD just means I'm on a commit, not a branch. If I make commits there, I immediately create a branch so they're not lost."

---

**Q36. What is `git reflog`?**

**Short answer:** A local log of every position HEAD and your branches have pointed to, kept for about 90 days. It's your undo history for Git itself.

**Explanation:** Even after a bad reset or rebase, the old commits still exist for a while; the reflog shows their IDs so you can get back to them.

**Example:**

```bash
git reset --hard HEAD~3        # oops, lost 3 commits
git reflog
# a1b2c3d HEAD@{1}: commit: feat: add filters
git reset --hard a1b2c3d       # or: git branch recovered a1b2c3d
```

**Say it like this:** "Committed work is almost never truly lost in Git. The reflog records every move of HEAD, so I can find the old commit ID and restore it."

---

**Q37. What is `git bisect`?**

**Short answer:** A binary search through history to find the exact commit that introduced a bug.

**Explanation:** You mark one known good and one known bad commit, and Git checks out the middle each time. With 1,000 commits it needs only about 10 steps. `git bisect run` automates it with a script that exits 0 for good and non-zero for bad.

**Example:**

```bash
git bisect start
git bisect bad                 # current commit is broken
git bisect good v1.4.0         # this release was fine
git bisect run npm test -- src/cart.test.ts
git bisect reset
```

**Say it like this:** "When something broke and nobody knows when, I use `git bisect run` with a failing test. It finds the bad commit among hundreds in a few minutes."

---

**Q38. Useful `git blame` flags?**

**Short answer:** `git blame -w -C -C file`. `-w` ignores whitespace changes and `-C` follows lines moved or copied from other files.

**Explanation:** Without these, a formatting commit or a file move makes blame point at the wrong person. A `.git-blame-ignore-revs` file lists formatting-only commits for blame to skip.

**Example:**

```bash
git blame -w -C -C src/hooks/useRoom.ts
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

**Say it like this:** "I use blame to find *why* a line exists, not *who* to blame. It leads me to the commit message and PR discussion."

---

**Q39. Compare the main branching strategies.**

**Short answer:** Git Flow uses long-lived develop and release branches. GitHub Flow uses short feature branches merged to main. Trunk-based development uses very short branches plus feature flags and continuous deployment.

**Explanation:**

| Strategy | How it works | Best for |
|---|---|---|
| Git Flow | `main`, `develop`, `feature/*`, `release/*`, `hotfix/*` | versioned releases (mobile apps, packages) |
| GitHub Flow | `main` + short-lived branches + PRs; deploy from main | most web apps |
| Trunk-based | branches live hours or days; flags hide unfinished work | teams with strong CI/CD |

**Example:** A web dashboard like BpoBox deploys from `main` several times a week (GitHub Flow), while an npm component library cuts versioned releases.

**Say it like this:** "For web products I prefer GitHub Flow or trunk-based development with feature flags. Short-lived branches mean fewer conflicts and faster feedback. Git Flow makes sense for versioned releases, like a mobile app."

---

**Q40. Merge commit vs squash merge vs rebase merge on GitHub?**

**Short answer:** A merge commit keeps every commit plus a merge commit. Squash turns the whole PR into one commit on `main`. Rebase-and-merge replays each commit onto `main` linearly.

**Explanation:** Squash gives a clean, revertable history (one PR = one commit) but loses the granular commits. Merge commits keep everything but get noisy. Rebase merge is linear but keeps every small commit.

**Example:** With squash merging, reverting the "reconnect banner" feature is a single `git revert` of one commit.

**Say it like this:** "We used squash merges. One PR becomes one commit on main, which made reverts and changelogs simple."

---

**Q41. What are branch protection rules?**

**Short answer:** Settings that stop bad changes reaching important branches: required reviews, passing status checks, up-to-date branches, and blocking force pushes and deletion.

**Explanation:** They can also require CODEOWNERS approval, linear history and signed commits. Newer GitHub "rulesets" apply the same rules across many repos.

**Example:** `main` requires one approval, green lint/typecheck/test/build checks, and no force pushes; admins are included.

**Say it like this:** "On main we required one approval, green CI and no force pushes. Even admins went through the same rules, so nothing reached production unreviewed."

---

**Q42. What is CODEOWNERS?**

**Short answer:** A file (`.github/CODEOWNERS`) that maps paths to the people or teams automatically requested for review. With branch protection, their approval becomes mandatory.

**Explanation:** It routes reviews to the experts for sensitive areas like auth or the design system, without anyone having to remember to add them.

**Example:**

```text
/src/auth/            @company/security-team
/src/components/ui/   @hrushi @design-system-team
*.yml                 @company/devops
```

**Say it like this:** "CODEOWNERS made sure any change to auth or our shared components was reviewed by someone who knew that area."

---

**Q43. What is semantic versioning?**

**Short answer:** Versions use `MAJOR.MINOR.PATCH`: MAJOR for breaking changes, MINOR for new backwards-compatible features, PATCH for bug fixes.

**Explanation:** It's a promise to consumers: upgrading a minor or patch version shouldn't break them. Pre-releases look like `2.0.0-beta.1`. In `package.json`, `^1.4.2` accepts any 1.x.x at or above 1.4.2.

**Example:** `1.4.2 → 1.4.3` (bug fix), `1.4.3 → 1.5.0` (new feature), `1.5.0 → 2.0.0` (breaking API change).

**Say it like this:** "Semver tells consumers how risky an upgrade is. For our shared component library, a major bump meant breaking changes with migration notes."

---

**Q44. What are Conventional Commits?**

**Short answer:** A commit message convention: `type(scope): description`, with types like `feat`, `fix`, `docs`, `refactor`, `test` and `chore`. A `!` marks a breaking change.

**Explanation:** Because the type is machine-readable, tools like semantic-release and Changesets can bump versions and generate changelogs automatically. commitlint enforces the format.

**Example:** `feat(call): show reconnecting banner`, `fix!: change token response shape`.

**Say it like this:** "We used Conventional Commits so the changelog and version bumps were automatic. `feat` means a minor bump, `fix` a patch, and `!` a major."

---

**Q45. What are Husky and lint-staged?**

**Short answer:** Husky manages Git hooks inside the repo so every developer gets them. lint-staged runs linters only on staged files, which keeps hooks fast.

**Explanation:** A pre-commit hook runs ESLint and Prettier on changed files; a commit-msg hook runs commitlint. Hooks can be skipped with `--no-verify`, so CI must run the same checks.

**Example:**

```json
{
  "scripts": { "prepare": "husky" },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
```

**Say it like this:** "Hooks give fast local feedback, but they can be skipped with `--no-verify`, so CI runs the same checks as the real gate."

---

**Q46. What does `git clean` do?**

**Short answer:** It deletes untracked files. Dry-run first with `git clean -nd`, then delete with `git clean -fd`; `-x` also removes ignored files.

**Explanation:** It's useful when build artefacts or generated files pile up, or to get a pristine checkout. Because deleted untracked files can't be recovered from Git, always preview first.

**Example:**

```bash
git clean -nd     # preview what would be deleted
git clean -fdx    # delete untracked + ignored (node_modules, dist)
```

**Say it like this:** "I use `git clean` to reset to a pristine checkout, always with `-n` first, because there's no undo for untracked files."

---

## 🔴 Level 3 — Advanced

**Q47. How does Git store data internally?**

**Short answer:** Git is a content-addressed object database of blobs (file contents), trees (directories), commits (snapshot + parents + metadata) and tags, each named by the hash of its content.

**Explanation:** Identical content is stored once, and changing anything changes the hash, so history can't be silently altered. Branches are small files in `.git/refs/heads/` that contain a commit hash.

**Example:**

```bash
git cat-file -p HEAD          # tree, parent, author, message
git cat-file -p HEAD^{tree}   # directory listing
cat .git/refs/heads/main      # a branch is literally a hash
```

**Say it like this:** "Git is a key-value store where the key is a hash of the content. Identical files are stored once, history is tamper-evident, and a branch is just a file holding a commit hash."

---

**Q48. Why are branches cheap in Git?**

**Short answer:** A branch is a tiny file containing a 40-character commit hash. Creating one copies no files.

**Explanation:** Older systems copied the whole directory to branch, which was slow. In Git, switching branches only updates the files that differ between the two snapshots.

**Example:** `git switch -c feat/x` finishes instantly even in a large monorepo; `.git/refs/heads/feat/x` is a 41-byte file.

**Say it like this:** "Since a branch is just a pointer, I create one for every small task. There's no cost, so there's no reason to work directly on main."

---

**Q49. What is a three-way merge?**

**Short answer:** Git compares three versions: your branch tip, the other branch tip and their common ancestor (merge base).

**Explanation:** If only one side changed a region compared with the base, Git takes that side. If both changed it differently, that's a conflict. The base is what lets Git tell "I changed it" from "you changed it".

**Example:** Base has `timeout = 5`, you changed it to `10`, the other branch didn't touch it → result is `10`. If the other branch changed it to `7` → conflict.

**Say it like this:** "Git doesn't just diff the two branches; it compares both to their common ancestor. That's how it knows which side made each change."

---

**Q50. What merge strategies exist?**

**Short answer:** `ort` is the default since Git 2.34; `recursive` is the older default; `octopus` merges many branches; `ours` keeps your tree entirely. Options like `-X ours` and `-X theirs` resolve only conflicting hunks.

**Explanation:** `-s ours` (strategy) ignores the other branch completely, while `-X ours` (option) still merges non-conflicting changes and only prefers your side in conflicts. Confusing the two is a classic mistake.

**Example:**

```bash
git merge -X theirs feature/config   # prefer their side in conflicts only
```

**Say it like this:** "Normally the default `ort` strategy is right. I'd use `-X theirs` carefully, for something like regenerated files, and never confuse it with `-s ours`."

---

**Q51. What does `git rebase --onto` do?**

**Short answer:** It moves a range of commits onto a new base.

**Explanation:** The form `git rebase --onto newBase oldBase branch` takes the commits that are on `branch` but not on `oldBase`, and replays them onto `newBase`. It's useful when your branch was started from another feature branch that's been abandoned or squash-merged.

**Example:**

```bash
# feature was branched from old-feature; move only feature's commits onto main
git rebase --onto main old-feature feature
```

**Say it like this:** "When my branch was stacked on a teammate's branch that got squash-merged, I use `rebase --onto` to move just my commits onto main."

---

**Q52. `git push --force` vs `--force-with-lease`?**

**Short answer:** `--force` overwrites the remote branch no matter what. `--force-with-lease` refuses if someone else pushed since your last fetch.

**Explanation:** With plain force, you can silently delete a teammate's commits. The lease checks that the remote is still where you last saw it.

**Example:**

```bash
git rebase -i origin/main
git push --force-with-lease
```

**Say it like this:** "I never use plain `--force`. After rebasing my own branch I use `--force-with-lease`, and on main force pushes are blocked by branch protection anyway."

---

**Q53. What is `git rerere`?**

**Short answer:** "Reuse recorded resolution": Git remembers how you resolved a conflict and reapplies it automatically if the same conflict appears again.

**Explanation:** It's valuable for long-running branches that you rebase repeatedly, where the same conflict would otherwise come back each time.

**Example:**

```bash
git config --global rerere.enabled true
```

**Say it like this:** "On a long refactor branch I enable rerere, so I resolve each conflict once instead of every time I rebase."

---

**Q54. Submodules vs subtrees vs monorepo?**

**Short answer:** A submodule is a pointer to a commit in another repo; a subtree copies another repo's code into a folder with history; a monorepo keeps all apps and packages in one repo.

**Explanation:** Submodules give explicit versions but clunky workflows (`git submodule update`). Subtrees are simpler for consumers. Monorepos (pnpm workspaces, Turborepo, Nx) allow atomic cross-package changes and affected-only builds.

**Example:**

```text
repo/
  apps/interpretiq
  apps/bpobox
  packages/ui        ← shared component library
```

**Say it like this:** "For two products sharing a UI library, I'd choose a monorepo with pnpm workspaces and Turborepo. One PR can update the library and both apps, and CI rebuilds only what changed."

---

**Q55. What are sparse checkout and partial clone?**

**Short answer:** Tools for huge repos. A partial clone downloads file contents only when needed; a sparse checkout puts only selected folders in your working directory.

**Explanation:** Together they make a giant monorepo feel small: you download history metadata, and only the folders you work on.

**Example:**

```bash
git clone --filter=blob:none https://github.com/org/monorepo.git
git sparse-checkout set apps/web packages/ui
```

**Say it like this:** "In a very large monorepo I'd use a partial clone plus sparse checkout, so I only download and see the apps I work on."

---

**Q56. What is Git LFS?**

**Short answer:** Large File Storage: big binaries live on a separate server and Git stores only small pointer files.

**Explanation:** Git stores every version of every file, so committing videos or design files bloats the repo forever. LFS keeps clones fast.

**Example:**

```bash
git lfs install
git lfs track "*.mp4"
git add .gitattributes demo.mp4
```

**Say it like this:** "Binary assets like demo videos go through Git LFS, so cloning the repo stays fast."

---

**Q57. What's the catch with shallow clones in CI?**

**Short answer:** `--depth 1` makes checkout fast, but tools that need history break, such as changelog generation, `nx affected` and `git describe`.

**Explanation:** `actions/checkout` defaults to depth 1. Jobs that compare against main or read tags need more history.

**Example:**

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0   # full history for affected/changelog
```

**Say it like this:** "Shallow clones speed up CI, but for affected-only builds or release notes I set `fetch-depth: 0`, otherwise the tool can't find the base commit."

---

**Q58. What are signed commits?**

**Short answer:** Commits signed with a GPG or SSH key prove who made them, and GitHub shows a "Verified" badge.

**Explanation:** Anyone can set any name and email in Git config, so unsigned authorship can be faked. Branch protection can require signed commits.

**Example:**

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

**Say it like this:** "Signing proves a commit really came from me. For regulated projects, requiring signed commits on main is a cheap integrity control."

---

**Q59. How do you remove a secret from Git history properly?**

**Short answer:** Rotate the secret first, then rewrite history with `git filter-repo` or BFG, force-push, ask collaborators to re-clone, and enable secret scanning.

**Explanation:** Once pushed, assume the secret is already scraped; deleting it doesn't make it safe. Rewriting history only stops future exposure.

**Example:**

```bash
git filter-repo --path .env --invert-paths
git push --force --all && git push --force --tags
```

**Say it like this:** "The first step isn't Git, it's rotating the key, because once it's pushed it may already be scraped. Then I purge it from history and add push protection."

---

**Q60. What is `git worktree`?**

**Short answer:** It lets you check out multiple branches of the same repo into different folders at the same time.

**Explanation:** Unlike stashing, your current work stays exactly as it is, including running dev servers. Worktrees share the same `.git` data, so they're cheap.

**Example:**

```bash
git worktree add ../app-hotfix main
cd ../app-hotfix   # fix, commit, push
git worktree remove ../app-hotfix
```

**Say it like this:** "When a production bug comes in during a big refactor, I open a worktree on main instead of stashing. My refactor stays exactly as it was."

---

**Q61. How does `git pull --rebase` change a team's workflow?**

**Short answer:** It avoids noisy "Merge branch 'main' of origin" commits by replaying your local commits on top of what you pulled.

**Explanation:** History stays linear and easier to read. Since only your unpushed local commits are rebased, it's safe.

**Example:**

```bash
git config --global pull.rebase true
git pull   # now rebases instead of merging
```

**Say it like this:** "I set `pull.rebase true` globally. My unpushed commits go on top of the latest main, with no pointless merge commits."

---

**Q62. Client-side vs server-side hooks?**

**Short answer:** Client hooks (`pre-commit`, `commit-msg`, `pre-push`) run locally and can be skipped. Server hooks (`pre-receive`, `update`) are enforced on the server.

**Explanation:** GitHub doesn't allow custom server hooks, so enforcement comes from branch protection, rulesets and required Actions checks instead.

**Example:** Locally, Husky runs lint-staged on pre-commit. On GitHub, the same lint runs as a required status check, so skipping the hook doesn't help.

**Say it like this:** "Client hooks are convenience; the real gate is server-side. On GitHub that means required status checks and branch protection."

---

## 🔴 GitHub Actions and CI/CD

**Q63. Describe the anatomy of a workflow.**

**Short answer:** A YAML file in `.github/workflows/` with triggers (`on`), jobs (which run on fresh machines) and steps (actions or shell commands).

**Explanation:** Jobs run in parallel unless you add `needs:`. `uses` runs a reusable action and `run` runs a command. `--frozen-lockfile` makes CI fail if the lockfile doesn't match `package.json`.

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
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint && pnpm typecheck
      - run: pnpm test -- --coverage
      - run: pnpm build
```

**Say it like this:** "Every PR runs lint, typecheck, tests with coverage and a production build. Branch protection requires all of them to pass before merge."

---

**Q64. How do you cache dependencies?**

**Short answer:** Use `actions/setup-node` with `cache: npm|pnpm|yarn`, or `actions/cache` keyed by the lockfile hash.

**Explanation:** When the lockfile changes, the key changes and the cache is rebuilt; otherwise installs reuse downloaded packages, often saving minutes per run.

**Example:**

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

**Say it like this:** "I cache the package store keyed by the lockfile hash, so installs are fast but always correct when dependencies change."

---

**Q65. What are matrix builds?**

**Short answer:** They run the same job across several configurations, such as Node versions or operating systems.

**Explanation:** GitHub creates one job per combination and runs them in parallel. It's useful for libraries that support several runtimes.

**Example:**

```yaml
strategy:
  matrix:
    node: [18, 20, 22]
    os: [ubuntu-latest, windows-latest]
```

**Say it like this:** "For a shared library I'd test on every Node version we support with a matrix. An app usually only needs the version it deploys on."

---

**Q66. How do you handle secrets and environments?**

**Short answer:** Store secrets in repo or org settings and reference them as `${{ secrets.NAME }}`. Environments such as `production` add required approvers and environment-specific secrets.

**Explanation:** GitHub masks secrets in logs, but never `echo` them. Workflows triggered by pull requests from forks don't receive secrets, which protects them from malicious PRs.

**Example:**

```yaml
jobs:
  deploy:
    environment: production   # requires approval, uses prod secrets
    steps:
      - run: ./deploy.sh
        env:
          API_KEY: ${{ secrets.API_KEY }}
```

**Say it like this:** "Production deploys use a protected environment with required approval and its own secrets, so a normal PR can never touch production credentials."

---

**Q67. Why use OIDC to AWS instead of long-lived keys?**

**Short answer:** With OpenID Connect the workflow gets short-lived AWS credentials by assuming an IAM role, so no permanent keys are stored in GitHub.

**Explanation:** Static access keys can leak and rarely get rotated. With OIDC, AWS trusts tokens issued for a specific repo and branch, and credentials expire after the job.

**Example:**

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

**Say it like this:** "Our deploys used OIDC, so there were no AWS keys in GitHub at all. The role could only be assumed from our repo's main branch."

---

**Q68. How do preview deployments work?**

**Short answer:** Every PR is deployed to its own URL, and the link is posted on the PR so others can test before merging.

**Explanation:** Designers, PMs and QA see the real change in a browser without running it locally. The preview is torn down when the PR closes. Vercel and Netlify do it automatically; on AWS you can deploy to an S3 prefix behind CloudFront.

**Example:** PR #123 gets `https://pr-123.preview.bpobox.com`, and a bot comments the link.

**Say it like this:** "Preview deployments let the PM review UI changes on a real URL before merge, which caught design issues much earlier."

---

**Q69. What are reusable workflows and composite actions?**

**Short answer:** A reusable workflow (`on: workflow_call`) is a whole pipeline other repos can call. A composite action bundles repeated steps into one `uses:` step.

**Explanation:** They remove copy-pasted CI across repos, so a fix to the pipeline is made once.

**Example:**

```yaml
jobs:
  ci:
    uses: company/ci-templates/.github/workflows/frontend.yml@v2
```

**Say it like this:** "With several frontend repos, a shared reusable workflow keeps CI consistent, and improvements roll out to every repo at once."

---

**Q70. What does the `concurrency` key do?**

**Short answer:** It cancels outdated runs: when you push again to a PR, the previous run for that branch stops.

**Explanation:** It saves CI minutes and gives faster feedback on the latest commit. For deploys, it prevents two deployments running at once.

**Example:**

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Say it like this:** "I add a concurrency group so only the newest commit's CI runs, and deploys to the same environment never overlap."

---

**Q71. What are Dependabot and Renovate?**

**Short answer:** Bots that open PRs to update dependencies.

**Explanation:** They keep you off old, vulnerable versions. Good practice is to group minor updates, auto-merge patch updates when CI passes, and review major updates manually with their changelogs.

**Example:**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    groups:
      minor-and-patch: { update-types: [minor, patch] }
```

**Say it like this:** "Automated dependency PRs keep us current. Patches auto-merge on green CI, and majors get a human review with the changelog."

---

## 🧩 Level 4 — Scenario-Based

**Q72. You pushed a commit with a bug to `main` and others have already pulled. What do you do?**

**Short answer:** Revert it, don't reset it.

**Explanation:** `git revert` creates an undo commit, so main is healthy again without rewriting history. Resetting and force-pushing main would break everyone's local copy. Then fix the bug properly in a new PR with a test.

**Example:**

```bash
git revert <bad-sha>
git push origin main
```

**Say it like this:** "I'd revert immediately to get main healthy, tell the team, then ship the real fix with a regression test in a follow-up PR."

---

**Q73. You accidentally committed to `main` locally instead of a feature branch.**

**Short answer:** Create a branch where you are (keeping the commits), then reset local `main` back to `origin/main`.

**Explanation:** The new branch keeps the commits safe, and since `main` was never pushed, resetting it is harmless.

**Example:**

```bash
git switch -c feat/x
git switch main
git reset --hard origin/main
```

**Say it like this:** "No harm done as long as I haven't pushed. I branch off to save the commits, then reset local main to match the remote."

---

**Q74. You ran `git reset --hard` and lost work.**

**Short answer:** If it was committed, find it in `git reflog` and reset back to it. If it was only staged, `git fsck --lost-found` can recover the file contents. If it was never staged, Git never saved it.

**Explanation:** Git only stores what you committed or staged. For never-staged changes, check the editor's local history (VS Code Timeline, JetBrains Local History).

**Example:**

```bash
git reflog
git reset --hard HEAD@{2}
```

**Say it like this:** "First I check the reflog, because committed work is recoverable. If it was only in my editor, I check the editor's local history."

---

**Q75. Your PR has 23 messy commits and the reviewer wants a clean history.**

**Short answer:** Interactive-rebase onto `origin/main`, squash into a few logical commits, and force-push with lease.

**Explanation:** Group commits by meaning ("add search API", "add search UI", "add tests"). Since it's your own branch, rewriting is fine.

**Example:**

```bash
git fetch origin
git rebase -i origin/main
git push --force-with-lease
```

**Say it like this:** "I'd squash it into two to four logical commits with interactive rebase. Each commit tells one part of the story, which makes the review easier."

---

**Q76. A long-running feature branch constantly conflicts with `main`.**

**Short answer:** Fix the process: integrate main daily, split the work into smaller PRs, and merge unfinished UI behind a feature flag.

**Explanation:** Conflicts grow with the branch's age. Small, frequent merges are almost conflict-free. `rerere` avoids resolving the same conflict twice.

**Example:** Instead of one "new scorecard editor" branch for six weeks, merge the data model, then the read-only view, then the editor, each behind a `newScorecard` flag.

**Say it like this:** "Constant conflicts are a sign the branch lives too long. I'd split the work and merge behind a feature flag."

---

**Q77. A release needs one fix from `develop`, but not the other 10 commits.**

**Short answer:** Cherry-pick that one commit onto the release branch, tag a patch release, and make sure the fix is also on main.

**Explanation:** `-x` records where it came from. Forgetting to merge the fix forward is a classic way to reintroduce the bug in the next release.

**Example:**

```bash
git switch release/2.3
git cherry-pick -x 4f5e6d7
git tag -a v2.3.1 -m "Hotfix"
```

**Say it like this:** "I cherry-pick just that fix, ship a patch version, and confirm the fix exists on main so it doesn't come back."

---

**Q78. CI passes locally but fails in GitHub Actions. How do you debug it?**

**Short answer:** Check the environment differences: Node version, a clean install from the lockfile, missing env vars or secrets, case-sensitive paths, time zone, test order and unmocked network calls.

**Explanation:** Your machine has cached `node_modules`, a case-insensitive file system (macOS) and local env files; CI has none of these.

**Example:** `import Button from './button'` works on a Mac even though the file is `Button.tsx`, but fails on Linux CI.

**Say it like this:** "The classic one I've hit is case sensitivity: an import worked on Mac but failed on Linux CI. I go through the environment differences one by one, starting with the Node version and a clean install."

---

**Q79. Two developers need to work on the same feature branch.**

**Short answer:** Agree on `git pull --rebase`, small commits and frequent pushes, or have each developer work on a sub-branch and open PRs into the shared branch.

**Explanation:** The risk is overwriting each other's work. Nobody force-pushes the shared branch, and sub-branch PRs give each change a review.

**Example:** `feat/scorecards` is shared; Asha works on `feat/scorecards-api` and Ravi on `feat/scorecards-ui`, each merging into `feat/scorecards`.

**Say it like this:** "We'd agree on rebase-on-pull and no force pushes, or use sub-branches with PRs into the shared branch, which also gives each piece a review."

---

**Q80. A teammate force-pushed and overwrote your commits on a shared branch.**

**Short answer:** Your local reflog still has your commits; restore them on a branch, push it, then merge. Afterwards, protect the branch against force pushes.

**Explanation:** Git doesn't delete your local objects when the remote changes. Find your last commit in the reflog, branch from it, and coordinate with your teammate.

**Example:**

```bash
git reflog
git branch recover/my-work a1b2c3d
git push origin recover/my-work
```

**Say it like this:** "I'd recover my commits from the reflog, push them to a branch and merge them back in with my teammate. Then I'd turn on branch protection so it can't happen again."

---

**Q81. Which commit made the bundle size jump from 300 KB to 900 KB?**

**Short answer:** Automate `git bisect` with a script that builds and fails if the bundle is over a threshold.

**Explanation:** `bisect run` treats exit code 0 as good and non-zero as bad, so the script can encode any measurable condition, not just failing tests.

**Example:**

```bash
# check-size.sh
npm run build >/dev/null && [ $(du -k dist/assets/index-*.js | cut -f1) -lt 400 ]
```

```bash
git bisect start HEAD v2.0.0
git bisect run ./check-size.sh
```

**Say it like this:** "Bisect isn't only for failing tests. I give it a script that checks the bundle size, and it finds the commit that added the heavy dependency."

---

**Q82. You need to make a hotfix while in the middle of a large refactor.**

**Short answer:** Use `git worktree add ../app-hotfix main` (or stash), fix the bug there, open a PR, then return to your untouched refactor.

**Explanation:** A worktree avoids stashing half-finished work and keeps your dev server and editor state on the refactor.

**Example:**

```bash
git worktree add ../app-hotfix main
cd ../app-hotfix && git switch -c hotfix/login-crash
```

**Say it like this:** "I'd open a worktree on main for the hotfix. My refactor stays exactly as it was, and I don't risk losing a stash."

---

**Q83. How would you enforce consistent commit messages and formatting across 15 developers?**

**Short answer:** Husky + lint-staged + commitlint locally, the same checks in CI, branch protection requiring them, and a PR template and CONTRIBUTING guide.

**Explanation:** Local hooks give fast feedback but can be skipped; CI is the real gate. Explaining the benefit (automatic changelogs, fewer review nits) gets buy-in.

**Example:** A PR with the message "fixed stuff" fails the commitlint check in CI, and the PR can't merge until it's renamed `fix(scorecard): handle missing weights`.

**Say it like this:** "Hooks for fast feedback, CI as the gate, and documentation for the why. Once people saw the auto-generated changelog, nobody argued about the format."

---

## 🎯 From Your Resume

**Q84. "Walk me through the CI/CD for your self-hosted LiveKit infrastructure."**

**Short answer:** Each merge builds and scans a Docker image, pushes it to Amazon ECR, deploys it with health checks and automatic rollback, and authenticates to AWS with OIDC.

**Explanation:** The pipeline is: GitHub Actions build → image scan (e.g. Trivy) → push to ECR → deploy to EC2/ECS → health check → rollback on failure. For a media server, nodes are drained of active rooms before replacement so live calls aren't cut. *Describe only what you actually built, and say "we" for the parts DevOps owned.*

**Example:**

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with: { role-to-assume: ${{ vars.DEPLOY_ROLE }}, aws-region: ap-south-1 }
- run: docker build -t $ECR/livekit:${{ github.sha }} . && docker push $ECR/livekit:${{ github.sha }}
- run: ./deploy.sh ${{ github.sha }}   # drains rooms, then rolls nodes
```

**Say it like this:** "Every merge to main builds and scans a Docker image, pushes it to ECR, and deploys with a health check. AWS auth uses OIDC, so no keys live in GitHub. Because it's a media server, we drained rooms before replacing a node, so live calls weren't cut."

---

**Q85. "How did you enforce testing standards for the frontend team?"**

**Short answer:** Required CI checks (lint, typecheck, tests, build), coverage thresholds on critical modules, a PR template with a testing checkbox, and CODEOWNERS for shared code.

**Explanation:** Rules alone don't stick, so enforcement was introduced gradually alongside templates and pairing. Coverage targeted critical areas like auth and the call flow instead of chasing a global percentage.

**Example:**

```json
"coverageThreshold": {
  "./src/features/auth/": { "lines": 80 },
  "./src/features/call/": { "lines": 80 }
}
```

**Say it like this:** "I made lint, typecheck, tests and build required checks on main, with coverage thresholds on critical modules like auth and the call flow. The PR template had a 'tests added' checkbox, and CODEOWNERS ensured shared components were reviewed by someone who knew them."

---

**Q86. "How do you handle releases across two products that share a component library?"**

**Short answer:** A monorepo (or versioned package) with Changesets: every library change declares its version bump, releases follow semver, and each product upgrades deliberately.

**Explanation:** Breaking changes get a major version and migration notes. CI builds both products against the library before merging, so a library change can't silently break one product.

**Example:**

```bash
pnpm changeset          # "minor: add size prop to Button"
pnpm changeset version  # bumps @org/ui to 1.5.0 and writes CHANGELOG.md
```

**Say it like this:** "I'd use a monorepo with pnpm workspaces and Changesets. Library changes are semver-versioned, breaking changes ship with migration notes, and CI builds both InterpretIQ and BpoBox against the library before merge."
