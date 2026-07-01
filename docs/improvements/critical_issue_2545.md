# Critical Architecture Enhancement: perf: Implement Batch Ticket Update Database Transaction Routing with Chunking

## Overview
Refactor database updates to run in segmented, async batch transactions with configurable chunk sizes. This avoids database lock escalation and pool starvation when bulk-closing thousands of stale tickets, yielding connection control back to the event loop between chunks.

## Verification Plan
- [x] Write architectural design documentation
- [x] Create core service components in `backend/repositories/batch_repository.py`
- [x] Verify verification rules and security bounds

Closes #2545