# Changes Made

This file summarizes the code changes made to address issues reported in the backend.

## Added: AES-256-GCM Encryption for PII Fields (Issue #166)

### What changed
- Created `backend/auth/crypto.py` — a cryptographic helper module using AES-256 in GCM mode (via the `cryptography` library).
- The module reads `DB_ENCRYPTION_SECRET_KEY` from the environment (expects a 64-character hex-encoded 256-bit key).
- Provides `encrypt_field()` / `decrypt_field()` functions with a `crypto_available` flag for graceful degradation.
- Integrated encryption hooks in `backend/main.py`:
  - On `POST /tickets/save`: `description`, `contact_email`, and `raw_text` fields are encrypted before being inserted into Supabase.
  - On `GET /tickets` and `GET /tickets/{ticket_id}`: PII fields are automatically decrypted after fetch via a `_decrypt_ticket_pii()` helper.
- Added `contact_email` and `raw_text` fields to `TicketSaveRequest` model and `VALID_TICKET_COLUMNS`.
- Added `cryptography>=44.0.0` to `backend/requirements.txt`.
- Added `DB_ENCRYPTION_SECRET_KEY` reference to `backend/.env.example`.
- Created `backend/tests/test_crypto.py` with 14 unit tests covering encrypt/decrypt round-trip, key validation, degraded mode, and edge cases.

### Why this was needed
To meet enterprise-grade compliance (GDPR/HIPAA), sensitive PII fields (email addresses, ticket descriptions, raw text) must be encrypted at rest in the database. Previously these fields were stored in plaintext, making the database a liability in case of a breach.

### Result
- PII fields are transparently encrypted with AES-256-GCM before persisting to Supabase and decrypted on read.
- Each encryption produces a unique ciphertext (random nonce per GCM operation) — same plaintext never looks the same.
- If `DB_ENCRYPTION_SECRET_KEY` is unset, the server starts gracefully with a warning log and stores fields in plaintext (safe for local dev).
- Invalid keys or tampered ciphertexts raise clear errors.

### Validation
- `python -m unittest backend.tests.test_crypto -v` — all 14 tests pass (5 round-trip/edge-case tests, 3 degraded-mode tests, 3 key-validation tests, 3 error-handling tests).


## Fixed: Duplicate detection now learns from saved tickets

### What changed
- Updated the `POST /tickets/save` endpoint in `backend/main.py`.
- After a ticket is successfully inserted into Supabase, the backend now calls `duplicate_service.add_ticket(...)`.
- The duplicate index uses the saved ticket text, preferring `description` and falling back to `subject` if needed.
- If indexing fails, the ticket still saves successfully, but the API now returns a non-breaking warning so the failure is visible.

### Why this was needed
Previously, tickets created through the normal save flow were stored in Supabase but were not added to the duplicate-detection cache. That meant future similar tickets could be missed unless the original ticket already existed in the in-memory index.

### Result
- Newly saved tickets are now available for future duplicate checks immediately after persistence.
- The save flow remains resilient even if duplicate indexing fails.

### Validation
- Ran a backend error check on the modified file.
- No errors were reported for `backend/main.py`.
