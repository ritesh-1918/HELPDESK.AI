# GSSoC Troubleshooting Guide

This guide helps GSSoC contributors resolve common issues when setting up and developing HELPDESK.AI locally.

## Table of Contents

- [Environment Setup Issues](#environment-setup-issues)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Database Issues](#database-issues)
- [Model Issues](#model-issues)
- [Git and PR Issues](#git-and-pr-issues)

---

## Environment Setup Issues

### Missing Python Dependencies

**Symptom:** `ModuleNotFoundError` when starting the backend.

**Fix:**
```bash
cd backend
pip install -r requirements.txt
```

If using a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### Node.js Version Mismatch

**Symptom:** `npm install` fails with peer dependency errors.

**Fix:** Use Node.js 18+ (LTS recommended):
```bash
nvm install 18
nvm use 18
cd Frontend && npm install
```

### Missing Environment Variables

**Symptom:** `supabase` or API calls fail with connection errors.

**Fix:** Ensure `.env` files are configured in both `backend/` and `Frontend/` directories. See `.env.example` files for required variables.

---

## Backend Issues

### Port Already in Use

**Symptom:** `OSError: [Errno 48] Address already in use`

**Fix:**
```bash
lsof -i :8000
kill -9 <PID>
```

### Model Files Not Found

**Symptom:** `FileNotFoundError: Classifier model not found`

**Fix:** Ensure model files exist in `backend/models/classifier/`. If missing, check the `models/` directory in the repository or download from the releases.

### Supabase Connection Timeout

**Symptom:** Backend hangs on startup or queries time out.

**Fix:** Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`. Ensure the Supabase project is active and not paused.

---

## Frontend Issues

### Blank Page After Login

**Symptom:** White screen after successful authentication.

**Fix:** Clear localStorage and refresh:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Vite Hot Reload Not Working

**Symptom:** Changes not reflected in the browser.

**Fix:**
```bash
cd Frontend
rm -rf node_modules/.vite
npm run dev
```

### Build Fails with Memory Error

**Symptom:** `JavaScript heap out of memory` during build.

**Fix:**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## Database Issues

### RLS Policy Errors

**Symptom:** `403 Forbidden` or empty results from Supabase queries.

**Fix:** Check Row Level Security policies in the Supabase dashboard. Ensure the authenticated user's role matches the policy conditions.

### Migration Conflicts

**Symptom:** Database schema mismatch after pulling new changes.

**Fix:** Run the latest migrations:
```bash
cd supabase
supabase db reset
```

---

## Model Issues

### Slow Inference

**Symptom:** Ticket classification takes > 5 seconds.

**Fix:** Ensure GPU is available if configured:
```python
import torch
print(torch.cuda.is_available())  # Should be True for GPU
```

For CPU-only environments, expect ~1-2 second inference times.

### Low Confidence Scores

**Symptom:** Most tickets classified with confidence < 0.5.

**Fix:** This is expected for ambiguous text. The keyword override layer in `classifier_service.py` handles common technical terms. Check if your test input contains recognizable keywords.

---

## Git and PR Issues

### Branch Divergence from Main

**Symptom:** Merge conflicts when creating PR.

**Fix:**
```bash
git checkout main
git pull upstream main
git checkout your-branch
git rebase main
# Resolve conflicts
git push --force-with-lease origin your-branch
```

### PR Target Branch

**Important:** All PR branches must target the `gssoc` branch, NOT `main`.

```bash
gh pr create --repo ritesh-1918/HELPDESK.AI \
  --head "YourUsername:your-branch" \
  --base "gssoc"
```

### Commit Message Convention

Follow conventional commits:
```
docs: add troubleshooting guide
fix: resolve null pointer in classifier
feat: add dark mode toggle
test: add unit tests for duplicate service
```

---

## Getting Help

1. Check existing [GitHub Issues](https://github.com/ritesh-1918/HELPDESK.AI/issues)
2. Review the [CONTRIBUTING.md](../CONTRIBUTING.md) guide
3. Ask in the GSSoC Discord channel
4. Tag a project maintainer in your issue
