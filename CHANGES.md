# Changes Made

This file summarizes the code change made to address the duplicate-detection issue reported in the backend.

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
