# Contributing to HELPDESK.AI 🚀

First off, thank you for considering contributing to **HELPDESK.AI**! It's contributors like you who help transform IT support from "Chaos to Clarity."

This guide outlines the professional standards and workflows required to maintain the integrity of our AI-powered ecosystem.

---

## 🏛️ Founding Team (Infosys Springboard - Group 2)

HELPDESK.AI was conceived and built during the **Infosys Springboard Virtual Internship 6.0**. We acknowledge the foundational work of the following team members:

### 👑 Leadership & Coordination
*   **Duniya Vasa** (Group Lead)
*   **Sowjanya N**

### 🧠 AI & Modeling
*   **Pragati Tiwari** (Lead)
*   **Shaik Eshak**
*   **Ippili Raju**
*   **Vinitha Giri**
*   **Asna Abdul Kareem**
*   **Ritesh Bonthalakoti**

### ⚙️ Backend Engineering
*   **Asmeet Kaur Makkad** (Lead)
*   **Vijayalakshmi S R**
*   **Dinesh Reddy Vasampelli**
*   **Manya Sahasra**

### 🎨 Frontend Engineering
*   **Satla Prayukthika** (Lead)
*   **Bandi Keerthi Krishna**
*   **Shubha G D**
*   **Phani Kotha**

### 📊 Data Engineering
*   **Praneetha Baru** (Lead)
*   **Kavin Sarvesh**
*   **Utukuri Naga Sri Hari Chandana**
*   **Akash Kumar Paswan**
*   **Ganesh Goud Tekmul**

---

## 📝 How to Contribute

### 1. Reporting Issues
Before opening a new issue, please search the [Existing Issues](https://github.com/ritesh-1918/HELPDESK.AI/issues) to ensure it hasn't been reported.

**When reporting a bug, please include:**
*   **Summary:** A clear and concise description of the bug.
*   **Steps to Reproduce:** Numbered list of steps.
*   **Expected vs. Actual Behavior:** What you expected to happen vs. what actually happened.
*   **Environment:** OS, Browser/Version, and Python version (if applicable).
*   **Screenshots:** Highly recommended for UI-related issues.

### 2. Suggesting Enhancements
We welcome ideas that improve the AI's precision or user experience.
*   Clearly explain the **Value Proposition**: How does this feature help the end-user?
*   Provide a brief technical overview of the proposed implementation.

---

## 🌟 GirlScript Summer of Code (GSSoC 2026)

We are proudly participating in **GSSoC 2026**! If you are a contributor from GSSoC, please ensure you follow these steps so your PR is scored correctly:
1. **Target Branch Requirement (CRITICAL) 🚨**: You MUST target and submit all of your Pull Requests to the `gssoc` branch, **NOT** to the `main` branch. The `main` branch is our production-ready release branch and is strictly protected. Any Pull Request opened directly against `main` will be automatically rejected.
2. **Approval Label**: Once your PR is reviewed and approved, we will add the `gssoc:approved` label. 
3. **Difficulty Level**: We will assign a difficulty label (`level:beginner`, `level:intermediate`, `level:advanced`, `level:critical`).
4. **Mentor Assignment**: We will add the `mentor:ritesh-1918` label to track review points.
5. Make sure your PR resolves an assigned issue and is linked properly in the PR description (e.g. `Fixes #28`).

---

## 💻 Pull Request Process

We follow a strict "Production Ready" workflow. All PRs must meet the following criteria:

1.  **Branching Strategy (CRITICAL):**
    *   **All Pull Requests MUST target the `gssoc` branch.** Do not submit PRs directly to the `main` branch.
    *   For your local work, branch from `gssoc` using these naming conventions:
        *   `feature/` — New features or logic.
        *   `fix/` — Bug fixes.
        *   `docs/` — Documentation updates.
        *   `refactor/` — Code cleanup without functional changes.
2.  **Atomic Commits:** Each commit should be a small, logical unit of work with a descriptive message.
3.  **Performance Check:** Any changes to the backend must be tested to ensure inference times remain **strictly under 500ms**.
4.  **UI Consistency:** Frontend changes must strictly adhere to our "Chaos to Clarity" design system (Tailwind CSS + Framer Motion).
5.  **Documentation:** If you add a new feature, you must update `PLATFORM_MAP.md`.

---

## 🐳 Local Setup with Docker (Recommended)

Docker is the fastest way to get HELPDESK.AI running locally. The included `docker-compose.yml` orchestrates the backend, frontend, PostgreSQL (with pgvector), Redis, and PostgREST.

### Prerequisites

| Tool | Minimum Version | Quick Check |
|------|-----------------|-------------|
| Docker Desktop | Latest stable | `docker --version` |
| Docker Compose | v2+ | `docker compose version` |
| Git | Any recent | `git --version` |

### Step-by-Step

1. **Fork and clone the repository:**

   ```bash
   git clone --branch gssoc https://github.com/<your-username>/HELPDESK.AI.git
   cd HELPDESK.AI
   ```

2. **Create your environment file:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in the required values:
   - `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` — Supabase project credentials
   - `GEMINI_API_KEY` — Google Gemini API key for AI classification
   - `REDIS_PASSWORD` — Set a password for Redis (or leave empty for dev)
   - `ALLOWED_ORIGINS` — Comma-separated CORS origins

3. **Start all services:**

   ```bash
   docker compose up --build
   ```

   This will start:
   - **Backend** (FastAPI) on port `7860`
   - **Frontend** (Vite + nginx) on port `3000`
   - **PostgreSQL** (pgvector) on port `5432`
   - **Redis** on port `6379`
   - **PostgREST** on port `3001`

4. **Verify the setup:**

   ```bash
   # Backend health check
   curl http://localhost:7860/health
   # Expected: {"status":"ok"}

   # Frontend
   open http://localhost:3000
   ```

5. **Stop services:**

   ```bash
   docker compose down
   # To remove volumes (database data, model cache):
   docker compose down -v
   ```

### Docker Configuration Details

| Service | Container | Port | Dockerfile | Notes |
|---------|-----------|------|------------|-------|
| Backend | `helpdesk_backend` | 7860 | `backend/Dockerfile` | Multi-stage build, non-root user, tesseract OCR |
| Frontend | `helpdesk_frontend` | 3000 | `Frontend/Dockerfile` | Vite build served via nginx:alpine |
| Database | `helpdesk_db` | 5432 | `pgvector/pgvector:pg15` | Auto-loads `schema.sql` on first run |
| Redis | `helpdesk_redis` | 6379 | `redis:7-alpine` | Password-protected, AOF persistence |
| API | `helpdesk_api` | 3001 | `postgrest/postgrest:latest` | Direct DB REST API |

### Troubleshooting Docker

- **Port conflicts:** If ports 5432, 6379, 3000, or 7860 are in use, stop the conflicting service or modify port mappings in `docker-compose.yml`.
- **Database not initializing:** Ensure `schema.sql` exists at the repo root. The `db` service mounts it as `/docker-entrypoint-initdb.d/01-schema.sql`.
- **Backend health check failing:** The backend has a 120-second start period (model loading). Wait at least 2 minutes before investigating.
- **Model download issues:** Set `ALLOW_DEGRADED_STARTUP=1` in `.env` to start without ML models for API-only development.

---

## 🔧 Local Setup Without Docker (Manual)

### Prerequisites

| Tool | Minimum Version | Quick Check |
|------|-----------------|-------------|
| Python | 3.10+ | `python --version` |
| Node.js | v18+ | `node --version` |
| PostgreSQL | 14+ (with pgvector) | `psql --version` |
| Redis | 6+ | `redis-cli --version` |
| Git | Any recent | `git --version` |

### Backend Setup

```bash
# Clone onto the gssoc branch
git clone --branch gssoc https://github.com/<your-username>/HELPDESK.AI.git
cd HELPDESK.AI

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase, Gemini, and Redis credentials

# Run the backend
uvicorn main:app --host 0.0.0.0 --port 7860 --reload
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
# Frontend available at http://localhost:5173
```

### Database Setup

```bash
# Create database and enable extensions
createdb helpdesk
psql -d helpdesk -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
psql -d helpdesk -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Load schema
psql -d helpdesk -f schema.sql
```

---

## 🛠️ Technical Standards

### Python (Backend)
*   Follow **PEP 8** style guidelines.
*   Use type hints for all function signatures.
*   Ensure all new endpoints are documented via FastAPI's automatic Swagger/Redoc UI.
*   Backend inference must complete in **under 500ms**.

### JavaScript/React (Frontend)
*   Use functional components and hooks.
*   Maintain central state management via **Zustand**.
*   Ensure components are responsive across mobile, tablet, and desktop.
*   Follow the "Chaos to Clarity" design system (Tailwind CSS + Framer Motion).

### AI & Data
*   Never commit raw datasets to the repository.
*   Ensure any model changes include a summary of evaluation metrics (F1-score, Accuracy).

### Testing
*   Run backend tests: `pytest backend/tests/ -v`
*   Run frontend tests: `cd Frontend && npm test`
*   Ensure all existing tests pass before submitting a PR.

---

## 📂 Project Structure

```
HELPDESK.AI/
├── backend/           # FastAPI backend (Python)
│   ├── routers/       # API route handlers
│   ├── services/      # Business logic (classifier, NER, RAG, etc.)
│   ├── models/        # ML model definitions
│   ├── middleware/    # Custom middleware
│   └── tests/         # Backend test suite
├── Frontend/          # Vite + React frontend
├── MobileApp/         # React Native mobile app
├── docs/              # Project documentation
├── schema.sql         # PostgreSQL schema (14 tables)
├── docker-compose.yml # Full-stack Docker orchestration
└── .env.example       # Environment variable template
```

---

## ⚖️ Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). We expect a professional, inclusive, and collaborative environment.

---

*Happy coding, and let's drive the future of Intelligent Enterprise Support together!*
