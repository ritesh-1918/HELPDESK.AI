# GSSoC 2026 — Contributor Guide for HELPDESK.AI

Welcome to HELPDESK.AI! This guide supplements `CONTRIBUTING.md` and
`CODE_OF_CONDUCT.md` with GSSoC-specific workflows, point levels,
and expectations.

---

## Quick Start Checklist

Before opening your first PR:

- [ ] Read `README.md` — understand what HELPDESK.AI does and why
- [ ] Read `CONTRIBUTING.md` — understand the branch naming, PR format, and review process
- [ ] Read `CODE_OF_CONDUCT.md` — understand community expectations
- [ ] Run the project locally (see README for setup steps)
- [ ] Find an open issue labeled `gssoc:approved` and ask to be assigned in a comment
- [ ] Wait for assignment confirmation before writing a single line of code

---

## Issue Difficulty Levels and Points

| Label             | Description                                     | Typical Scope                                   |
|-------------------|-------------------------------------------------|-------------------------------------------------|
| `level:beginner`  | Documentation, typo fixes, simple UI tweaks     | 1–50 lines, usually a single file               |
| `level:intermediate` | Feature additions, bug fixes, unit tests    | 50–200 lines, 2–4 files                         |
| `level:advanced`  | Refactors, security fixes, performance work     | 200–500 lines, multiple files with tests        |
| `level:critical`  | Architecture changes, full test suites, infra   | 500+ lines, significant cross-file impact       |

Point values are assigned by the GSSoC program. When in doubt, check the issue's
`[BOUNTY]` tag or ask a maintainer.

---

## How to Get Assigned

1. Find an issue labeled `gssoc:approved` and `status:open` (not already assigned)
2. Read the issue fully — including all comments
3. Post a comment tagging the maintainer: `@ritesh-1918 please assign this to me under GSSoC 2026`
4. Wait for the maintainer to add you as the assignee
5. Only after assignment: fork the repo and create your branch

Do not open a PR for an issue you are not assigned to. Unassigned PRs may be closed
without review.

---

## Branch Naming Convention

```
fix/issue-<number>-<short-description>        # bug fixes
feat/issue-<number>-<short-description>       # new features
perf/issue-<number>-<short-description>       # performance improvements
security/issue-<number>-<short-description>   # security patches
docs/issue-<number>-<short-description>       # documentation
test/issue-<number>-<short-description>       # test-only changes
```

Examples:
- `fix/issue-1393-mock-fallback`
- `feat/issue-1409-keyboard-shortcuts`
- `security/issue-1401-supabase-key`

---

## PR Requirements

Every PR must meet ALL of the following before it will be reviewed:

| Requirement                               | Detail                                              |
|-------------------------------------------|-----------------------------------------------------|
| Fixes a single assigned issue             | One PR per issue — do not bundle unrelated changes  |
| Branch based on latest `main`             | Sync with upstream before coding                    |
| `Fixes #<issue_number>` in PR description | Required for auto-close on merge                    |
| 200+ meaningful lines changed             | Tests, error handling, edge cases count toward this |
| No `console.log` or debug code            | Clean up before opening the PR                      |
| No `Co-Authored-By` or AI attribution    | Own your work                                       |
| Existing tests pass                       | Run the test suite before pushing                   |
| New tests for new behavior                | Untested behavior will not be merged                |

---

## The Review Process

1. Open your PR against `main` in the upstream repo (`ritesh-1918/HELPDESK.AI`)
2. A maintainer will review within 5–7 business days
3. Address all review comments within **72 hours** or the PR may be closed
4. Once approved, a maintainer will merge — do not merge your own PR
5. After merge, GSSoC points are credited by the maintainer

---

## Common Mistakes That Get PRs Rejected

| Mistake                                             | Fix                                                          |
|-----------------------------------------------------|--------------------------------------------------------------|
| PR based on a stale fork (missing upstream commits) | `git fetch upstream && git rebase upstream/main`             |
| Only the happy path is implemented                  | Add error handling, null checks, and edge case tests         |
| PR description is vague ("Fixed the bug")           | Use the template in `CONTRIBUTING.md` — explain root cause   |
| Unrelated files changed                             | Revert unrelated changes before opening the PR               |
| Missing `Fixes #<number>` in description            | Add it — without it the issue stays open after merge         |
| Copying another contributor's PR with changes       | This is plagiarism — grounds for GSSoC disqualification      |

---

## Getting Help

* **Stuck on setup?** Open a Discussion (not an Issue) and describe your problem
* **Unclear on requirements?** Comment on the issue — tag the maintainer
* **Found a bug unrelated to your issue?** Open a new issue before fixing it
* **Merge conflict?** Rebase onto latest `upstream/main` — don't merge main into your branch

---

## Code of Conduct Summary

By contributing to HELPDESK.AI under GSSoC 2026 you agree to:

1. Be respectful to all contributors and maintainers
2. Not claim credit for others' work
3. Use AI tools responsibly — own every line you submit
4. Respond to review feedback within 72 hours
5. Work only on issues assigned to you

Full details: [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)

---

*This guide is maintained by the HELPDESK.AI core team. Last updated: June 2026.*
