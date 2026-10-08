# Contributing to LoanHer

Welcome to the team! 🎉 This is a 2-day sprint for Hackaholics 7.0, so we
keep things simple, move fast, and help each other.

---

## Workflow

1. **Pick a task** from the ClickUp list and self-assign it.
2. **Create a branch** from `main` using the naming convention below.
3. **Write your code**, keeping the branch focused on one task.
4. **Open a Pull Request** and link it to the ClickUp task in the description.
5. **Get one approval** before merging.

---

## Branch Naming

```
feature/<short-name>    # new functionality
fix/<short-name>        # bug fix
chore/<short-name>      # tooling, config, docs
```

**Examples:**
```
feature/webhook-handler
fix/cors-header
chore/update-readme
```

---

## Commit Messages — Conventional Commits

Use the format: `<type>(<optional scope>): <short description>`

| Type | When to use |
|------|-------------|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `chore` | Tooling, CI, config — no production code change |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |

**Examples:**
```
feat(webhook): parse inbound WhatsApp message body
fix(cors): allow frontend origin in production
chore: add ruff to pre-commit config
docs: add ngrok setup instructions to README
test(health): assert response includes version field
```

Keep the description short (50 chars or less). Add a body below a blank line
if you need to explain the *why*.

---

## Pull Request Rules

- ✅ **Never push directly to `main`.**
- ✅ Keep PRs small — one task, one PR.
- ✅ Link the ClickUp task in the PR description (paste the task URL).
- ✅ Aim to review within **one hour** during the sprint — we're on the clock!
- ✅ Leave at least one comment when you review, even if it's just "LGTM 👍".

---

## Before Opening a PR — Checklist

```bash
# Backend (from backend/ with venv active)
ruff check .        # must be clean (zero errors)
ruff format .       # auto-format your code
pytest              # all tests must pass

# Frontend (from frontend/)
npm run lint        # must be clean
npm run build       # must succeed (catches TypeScript errors)
```

Fix any issues before requesting a review.

---

## Secrets & Data Rules

- 🚫 **Never commit `.env` files.** Use `.env.example` for templates only.
- 🚫 **Never use real personal data** — no real names, phone numbers, account
  numbers, or bank statements. Use the fictional personas in `data/`.
- 🚫 **No interest rates or loan pricing** anywhere in the UI, code, or data.
  The Passport shows a readiness band and an indicative amount range only.

---

## Resolving Merge Conflicts

1. Pull the latest `main` into your branch:
   ```bash
   git fetch origin
   git merge origin/main       # or: git rebase origin/main
   ```
2. Open the conflicted file(s), look for `<<<<<<`, `======`, `>>>>>>` markers,
   and resolve by keeping the correct version (or combining both).
3. Stage the resolved files and continue:
   ```bash
   git add <file>
   git merge --continue        # or: git rebase --continue
   ```
4. **Ask for help early.** If you have been stuck on a conflict for more than
   ~15 minutes, ping the team group.

---

## Getting Unstuck

If you've been blocked for more than **~2 hours** on any problem, post in the
team WhatsApp/Slack group with:
- What you're trying to do
- What you've already tried
- Any error message (paste the full text, don't screenshot)

We have limited time — asking early saves everyone.
