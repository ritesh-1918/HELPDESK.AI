# TODO - Fix critical issues (5 PRs)

- [ ] PR 1: fix-issue-1 — merge duplicate HTTP middlewares (limit_request_size + request id tracking)
- [ ] PR 2: fix-issue-2 — reorder auth helpers so `get_current_user` exists before `/ai/log_correction`
- [ ] PR 3: fix-issue-3 — make strict startup gate respect classifier fallback/availability
- [ ] PR 4: fix-issue-4 — bound DuplicateService in-memory index + prune old entries
- [ ] PR 5: fix-issue-5 — improve auth/session revocation on logout + unify verification logic

