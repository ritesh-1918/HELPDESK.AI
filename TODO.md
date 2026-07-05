# TODO

- [x] Audit backend/main.py for runtime/critical bugs affecting prod stability.
- [x] Identify at least one critical bug with clear reproduction path (malformed base64 to OCR, request context leakage risk).
- [x] Patch the bug with minimal, safe changes (base64 validation + request-scoped context var).
- [ ] Add/adjust lightweight tests or a quick runtime check.
- [ ] Run backend lint/format or unit tests (if available).
- [ ] Create a PR with a descriptive title and summary.


