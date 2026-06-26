## 🏆 Intermediate Testing Bounty Description

Our FastAPI backend now uses semantic vector embedding searches (pgvector) to detect duplicates before confirmation. 

To maintain test integrity and ensure tenant separation, we need python integration test coverages for these database similarity searches inside `backend/tests/`.

---

## 🛠️ Requirements

1. **Integration Test Suite**:
   * Create `backend/tests/test_semantic_duplicates.py` targeting the duplicate service.
   * Stub SentenceTransformer embedding calls to prevent live Hugging Face API hits during unit tests.
2. **Tenant Scoping Verification**:
   * Insert mock duplicate tickets belonging to two different companies.
   * Verify that RPC cosine searches strictly filter results by the requester's `company_id`.
3. **Command Verification**:
   * Ensure tests pass cleanly:
     ```bash
     cd backend
     pytest tests/test_semantic_duplicates.py
     ```
4. **Target Branch**: Please target the `gssoc` branch, NOT `main`.
