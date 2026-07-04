# Contributing to HELPDESK.AI 馃殌

First off, thank you for considering contributing to **HELPDESK.AI**! It's contributors like you who help transform IT support from "Chaos to Clarity."

## Introduction

HELPDESK.AI is an intelligent ticket triage system that uses deep learning to categorize and resolve IT issues in milliseconds. We welcome contributions from developers, designers, and documentation writers who want to help transform IT support from "Chaos to Clarity."

## Getting Started

### Forking the Repository

1. Navigate to the [HELPDESK.AI repository](https://github.com/ritesh-1918/HELPDESK.AI)
2. Click the "Fork" button in the top-right corner
3. This creates a copy of the repository in your GitHub account

### Cloning

Clone your forked repository to your local machine:

```bash
git clone https://github.com/YOUR_USERNAME/HELPDESK.AI.git
cd HELPDESK.AI
```

### Installing Dependencies

For detailed local development setup instructions, please refer to [README.md](README.md).

The repository includes multiple components:
- **Frontend**: React-based user interface
- **Backend**: FastAPI Python backend
- **MobileApp**: React Native mobile application

Install dependencies for each component you plan to work with:

```bash
# Frontend
cd Frontend
npm install

# Backend
cd ../backend
pip install -r requirements.txt

# Mobile App
cd ../MobileApp
npm install
```

### Local Development Setup

For comprehensive local setup instructions including environment configuration, database setup, and running the application locally, please refer to the [README.md](README.md) deployment section.

## Development Workflow

### Creating Feature Branches

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

### Keeping Branches Updated

Keep your branch up-to-date with the latest changes:

```bash
git fetch upstream
git rebase upstream/gssoc
```

### Syncing with Upstream

Add the upstream repository if you haven't already:

```bash
git remote add upstream https://github.com/ritesh-1918/HELPDESK.AI.git
```

### Commit Best Practices

- Write clear, descriptive commit messages
- Use the present tense ("Add feature" not "Added feature")
- Limit each commit to a single logical change
- Reference issue numbers when applicable: `Fixes #123`

## Branch Strategy

### Target Branch

**All Pull Requests MUST target the `gssoc` branch.** The `main` branch is protected and reserved for production releases.

### Branch Naming Examples

Use these prefixes for your branches:

- `feature/` - New features or functionality
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring without functional changes
- `test/` - Test additions or updates

Examples:
- `feature/ticket-priority-sorting`
- `fix/login-auth-error`
- `docs/update-readme`
- `refactor/backend-api-structure`

## Code Style Guidelines

### Formatting

- **Python**: Follow PEP 8 style guidelines
- **JavaScript/React**: Use ESLint configuration provided
- **Markdown**: Use consistent formatting with proper heading levels

### Naming Conventions

- **Variables**: Use camelCase for JavaScript, snake_case for Python
- **Components**: Use PascalCase for React components
- **Files**: Use kebab-case for file names
- **Constants**: Use UPPER_SNAKE_CASE

### Linting

Run linting before committing:

```bash
# Frontend
cd Frontend
npm run lint

# Backend
cd ../backend
ruff check .
```

### Documentation Expectations

- Add JSDoc comments for complex functions
- Update inline comments for non-obvious logic
- Document new API endpoints
- Update relevant documentation files when adding features

## Testing Requirements

### Running Lint

Always run linting before submitting a PR:

```bash
# Frontend linting
cd Frontend
npm run lint

# Backend linting
cd ../backend
ruff check .
```

### Running Tests

Run the test suite to ensure your changes don't break existing functionality:

```bash
# Frontend tests
cd Frontend
npm test

# Backend tests
cd ../backend
pytest
```

### Build Verification

Build the project to ensure there are no build errors:

```bash
# Frontend build
cd Frontend
npm run build
```

## Pull Request Process

### Creating a Focused PR

- Keep PRs small and focused on a single issue
- Large PRs should be split into smaller, manageable pieces
- Each PR should address one specific feature or bug fix

### Writing Meaningful Commit Messages

Use the conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(ticket): add priority sorting to ticket list

Add ability to sort tickets by priority level (High, Medium, Low).
This improves ticket management for support agents.

Closes #123
```

### Adding Screenshots When Needed

For UI changes, include screenshots or screen recordings:
- Before and after comparisons
- Mobile and desktop views if responsive
- Different states (loading, error, success)

### Linking Issues

Always link your PR to the relevant issue:
- In commit messages: `Fixes #123` or `Closes #123`
- In the PR description: `This PR fixes #123`

### Updating Documentation

- Update relevant documentation files
- Add new pages to `PLATFORM_MAP.md` if adding new UI pages
- Update API documentation for backend changes
- Add examples for new features

### Passing CI

Ensure all CI checks pass before submitting:
- Linting checks
- Test suites
- Build verification
- Security scans

### DCO Sign-Off

This project requires Developer Certificate of Origin (DCO) sign-off. Use the `-s` flag when committing:

```bash
git commit -s -m "feat: add new feature"
```

This adds the `Signed-off-by` line automatically.

## Example Pull Request Description

```markdown
## Summary
Brief description of what this PR does (2-3 sentences).

## Changes
- List of major changes
- Bullet points for clarity

## Testing
- Describe how you tested this change
- List any manual testing performed
- Mention automated tests added

## Screenshots
(If applicable)
![Screenshot](link-to-screenshot)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Linting passes
- [ ] Tests pass
- [ ] Documentation updated
- [ ] DCO sign-off included
- [ ] Linked to relevant issue

## Related Issues
Closes #123
```

## Issue Workflow

### Finding an Issue

1. Browse the [Issues tab](https://github.com/ritesh-1918/HELPDESK.AI/issues)
2. Use labels to filter by type: `good first issue`, `enhancement`, `bug`
3. Comment on the issue to express interest
4. Wait for assignment before starting work

### Getting Assigned

- Request assignment in the issue comments
- Wait for a maintainer to assign you
- Only work on assigned issues to avoid duplication

### Working on a Separate Branch

Always create a new branch for each issue:

```bash
git checkout -b feature/issue-123-ticket-priority
```

### Referencing Issue Numbers

Include the issue number in:
- Branch names: `feature/issue-123-description`
- Commit messages: `Fixes #123`
- PR descriptions: `This PR fixes #123`

## Mentorship

For guidance and support during your contribution journey:

- Refer to project maintainers for code review feedback
- Ask questions in issue comments for clarification
- Join community discussions for broader topics
- Review existing PRs to understand contribution patterns

## Additional Resources

- [README.md](README.md) - Project overview and quick start
- [PLATFORM_MAP.md](PLATFORM_MAP.md) - Complete application structure
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community guidelines
- [SECURITY.md](SECURITY.md) - Security policies and reporting

---

## 🏛️ Founding Team (Infosys Springboard - Group 2)

HELPDESK.AI was conceived and built during the **Infosys Springboard Virtual Internship 6.0**. We acknowledge the foundational work of the following team members:

### 馃憫 Leadership & Coordination
*   **Duniya Vasa** (Group Lead)
*   **Sowjanya N**

### 馃 AI & Modeling
*   **Pragati Tiwari** (Lead)
*   **Shaik Eshak**
*   **Ippili Raju**
*   **Vinitha Giri**
*   **Asna Abdul Kareem**
*   **Ritesh Bonthalakoti**

### 鈿欙笍 Backend Engineering
*   **Asmeet Kaur Makkad** (Lead)
*   **Vijayalakshmi S R**
*   **Dinesh Reddy Vasampelli**
*   **Manya Sahasra**

### 馃帹 Frontend Engineering
*   **Satla Prayukthika** (Lead)
*   **Bandi Keerthi Krishna**
*   **Shubha G D**
*   **Phani Kotha**

### 馃搳 Data Engineering
*   **Praneetha Baru** (Lead)
*   **Kavin Sarvesh**
*   **Utukuri Naga Sri Hari Chandana**
*   **Akash Kumar Paswan**
*   **Ganesh Goud Tekmul**

---

## 馃摑 How to Contribute

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

## 馃専 GirlScript Summer of Code (GSSoC 2026)

We are proudly participating in **GSSoC 2026**! If you are a contributor from GSSoC, please ensure you follow these steps so your PR is scored correctly:
1. **Target Branch Requirement (CRITICAL) 🚨**: You MUST target and submit all of your Pull Requests to the `gssoc` branch, **NOT** to the `main` branch. The `main` branch is our production-ready release branch and is strictly protected. Any Pull Request opened directly against `main` will be automatically rejected.
2. **Approval Label**: Once your PR is reviewed and approved, we will add the `gssoc:approved` label. 
3. **Difficulty Level**: We will assign a difficulty label (`level:beginner`, `level:intermediate`, `level:advanced`, `level:critical`).
4. **Mentor Assignment**: We will add the `mentor:ritesh-1918` label to track review points.
5. Make sure your PR resolves an assigned issue and is linked properly in the PR description (e.g. `Fixes #28`).

---

## 馃捇 Pull Request Process

We follow a strict "Production Ready" workflow. All PRs must meet the following criteria:

1.  **Branching Strategy (CRITICAL):**
    *   **All Pull Requests MUST target the `gssoc` branch.** Do not submit PRs directly to the `main` branch.
    *   For your local work, branch from `gssoc` using these naming conventions:
        *   `feature/` 鈥?New features or logic.
        *   `fix/` 鈥?Bug fixes.
        *   `docs/` 鈥?Documentation updates.
        *   `refactor/` 鈥?Code cleanup without functional changes.
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

## 鈿栵笍 Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). We expect a professional, inclusive, and collaborative environment.

---

*Happy coding, and let's drive the future of Intelligent Enterprise Support together!*
