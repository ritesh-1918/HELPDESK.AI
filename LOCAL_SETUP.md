# Local Backend Setup & Schema Verification Guide
### HELPDESK.AI · GSSoC 2026 Contributor Reference

> **Who this is for:** First-time contributors setting up HELPDESK.AI locally after the centralized notification system, automated ticket auto-close loops, and backend startup health validations. The environment requirements have grown, this guide reflects that.

---

## Before You Begin - Preflight Checklist

Don't skip this. Missing any one of these will cause a hard failure later.

| Tool | Minimum Version | Why It's Needed | Quick Check |
|---|---|---|---|
| Python | 3.10+ | Backend runtime | `python --version` |
| Git | Any recent | Cloning & branching | `git --version` |
| Docker Desktop | Latest stable | Supabase runs inside containers | Must be **running**, not just installed |
| Node.js + npm | v18+ | Supabase CLI is an npm package | `node --version` |

> ⚠️ **Windows users:** During Python installation, check **"Add Python to PATH"** before hitting Install. If you miss this, every `python` command will fail with a "not recognized" error.

---

## Step 1: Fork, Clone, and Land on the Right Branch

HELPDESK.AI uses a dedicated `gssoc` tracking branch for all contributor PRs. **Do not work off `main`.**

```bash
# Clone directly onto the gssoc branch, no manual switching needed
git clone --branch gssoc --single-branch https://github.com/ritesh-1918/HELPDESK.AI.git

cd HELPDESK.AI
```

Verify you're on the correct branch before touching anything:

```bash
git branch --show-current
# Expected output: gssoc
```

> 🔁 **Creating your working branch:** Branch off `gssoc` for your changes, and make sure your PR targets `gssoc` — not `main`.
> ```bash
> git checkout -b feature/your-feature-name
> ```

---

## Step 2: Isolate Your Python Environment

Python's global environment is fragile. One conflicting package across projects can silently break things. Always use a virtual environment.

**Create the environment (run once per clone):**

```bash
# Windows
python -m venv venv

# macOS / Linux
python3 -m venv venv
```

**Activate it (run every time you open a new terminal):**

```bash
# Windows — Command Prompt
.\venv\Scripts\activate

# Windows — PowerShell
.\venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate
```

Your prompt should now show `(venv)` as a prefix. If it doesn't, the environment is not active and your installs will go to the wrong place.

**Install all backend dependencies:**

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

This pulls in `fastapi`, `uvicorn`, and all required AI framework libraries in one shot. If `requirements.txt` throws a conflict error, make sure you're inside the venv first.

**Sanity check- confirm key packages landed correctly:**

```bash
pip show fastapi uvicorn
# Both should return Name, Version, Location — no "not found" errors
```

---

## Step 3- Spin Up the Local Database (Supabase via Docker)

HELPDESK.AI uses Supabase for auth, real-time triggers, and the database layer powering the ticket auto-close system and company-level settings introduced in PR #44.

### 3a. Install the Supabase CLI

Make sure Docker Desktop is **actively running** (check your taskbar/menu bar), then:

```bash
npm install -g supabase

# Verify the install
supabase --version
```

### 3b. Initialize and Start the Local Stack

From the **project root** (not inside `backend/`):

```bash
supabase init
supabase start
```

The first run pulls Docker images — this takes a few minutes. When it completes, your terminal prints a credentials block like this:

```
API URL: http://localhost:54321
DB URL:  postgresql://postgres:postgres@localhost:54322/postgres
anon key: eyJhbGc...
service_role key: eyJhbGc...
```

**Copy these values now.** You'll need them in Step 4.

### 3c. Apply Schema Migrations

The recent schema changes for automated ticket auto-close loops and company settings management are tracked as migration files. Apply them to your local instance:

```bash
supabase migration up
```

**Verify migrations ran cleanly:**

```bash
supabase status
```

Look for no error lines. All services should show as `running`. If you see schema drift warnings, jump to the [Troubleshooting](#troubleshooting) section.

---

## Step 4: Configure Environment Variables

The backend reads secrets from a `.env` file at startup. It will refuse to boot without them.

```bash
# From the project root
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in the values using this reference:

| Variable | Value for Local Dev | Notes |
|---|---|---|
| `SUPABASE_URL` | `http://localhost:54321` | Always this for local Supabase |
| `SUPABASE_ANON_KEY` | *(from `supabase start` output)* | Safe for client-side use; respects RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | *(from `supabase start` output)* | Bypasses RLS — never expose this publicly |
| `ALLOW_DEGRADED_STARTUP` | `true` | **Required for local dev** — see note below |

> **Why `ALLOW_DEGRADED_STARTUP=true`?**
> PR #44 introduced strict startup health checks that assert full availability of external AI pipelines and database triggers. Those external services don't exist in your local environment. Setting this flag to `true` tells the backend to boot in a degraded-but-functional state, skipping checks that would otherwise hard-crash the process before you can test anything.

---

## Step 5: Boot the Backend Server

With your venv active and `.env` configured:

```bash
cd backend
uvicorn main:app --reload
```

The `--reload` flag watches for file changes and restarts automatically which is essential for development.

**Confirm the server is healthy:**

```bash
# In a second terminal (with venv active)
curl http://127.0.0.1:8000/health
```

Expected response:
```json
{"status": "ok"}
```

Then open your browser at **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** - this is the live Swagger UI where you can inspect and test every API endpoint interactively.

---

## Step 6: Verify Schema Integrity

Before testing any auto-close or company settings features, confirm your local DB schema actually reflects the latest migrations:

```bash
# Check for any drift between migration files and your running DB
supabase db diff

# If diff output is empty — you're perfectly in sync
# If diff shows changes — re-run migrations:
supabase migration up
```

If your schema is still out of sync after `migration up`, do a clean reset:

```bash
supabase db reset
# This drops and rebuilds your local DB from all migration files
# Safe to run — your local data only, nothing remote
```

---

## Troubleshooting

<a name="troubleshooting"></a>

| Symptom | Root Cause | Fix |
|---|---|---|
| `uvicorn: command not found` | venv not active | Run `source venv/bin/activate` (or Windows equivalent) first |
| FastAPI crashes on boot with service errors | Strict health checks failing on missing AI pipelines | Set `ALLOW_DEGRADED_STARTUP=true` in `backend/.env` |
| `supabase start` hangs or fails | Docker Desktop not running | Open Docker Desktop and wait for it to fully start before retrying |
| Schema mismatch / missing columns for company settings | Stale local DB schema | Run `supabase db reset` then `supabase migration up` |
| `pip install` installs to wrong location | venv not activated | Check for `(venv)` prefix in terminal; re-activate if missing |
| PowerShell blocks `Activate.ps1` | Execution policy restriction | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once |
| Port 8000 already in use | Another process occupies the port | Run `uvicorn main:app --reload --port 8001` as a workaround |
| `anon key` / `service_role key` are empty in `.env` | `supabase start` output not captured | Re-run `supabase start` and copy the printed credentials |

---
