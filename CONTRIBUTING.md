# Contributing to HELPDESK.AI

Thank you for contributing to HELPDESK.AI. This guide covers the local setup,
Docker workflow, validation commands, and pull request expectations for new
contributors.

## Target Branch

All contributor pull requests must target the `gssoc` branch.

```bash
git clone --branch gssoc --single-branch https://github.com/ritesh-1918/HELPDESK.AI.git
cd HELPDESK.AI
git checkout -b docs/your-change-name
```

Before opening a pull request, confirm that your branch is based on `gssoc`:

```bash
git branch --show-current
git status
```

## Prerequisites

Install these tools before starting:

| Tool | Recommended version | Used for |
| --- | --- | --- |
| Git | Latest stable | Clone, branch, and submit changes |
| Python | 3.10+ | FastAPI backend and tests |
| Node.js | 18+ | Frontend build and Supabase CLI |
| npm | Comes with Node.js | Frontend dependencies |
| Docker Desktop | Latest stable | Full-stack Docker Compose workflow |
| Supabase CLI | Latest stable | Local database and auth services |

Install the Supabase CLI if it is not already available:

```bash
npm install -g supabase
supabase --version
```

## Local Backend Setup

Create and activate a virtual environment from the project root:

```bash
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate
```

Install backend dependencies:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

For local development, set these values in `backend/.env`:

```env
ALLOW_DEGRADED_STARTUP=true
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<value from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<value from supabase start>
```

Start Supabase locally:

```bash
supabase init
supabase start
supabase migration up
supabase status
```

Run the backend:

```bash
uvicorn backend.main:app --reload
```

Then verify the health endpoint:

```bash
curl http://127.0.0.1:8000/health
```

## Local Frontend Setup

Install and run the Vite frontend:

```bash
cd Frontend
npm install
npm run dev
```

The frontend starts on the URL printed by Vite, usually
`http://localhost:5173`.

For production build validation:

```bash
npm run build
```

## Docker Compose Setup

Use Docker Compose when you want the backend, frontend, and Redis stack to run
together.

From the project root:

```bash
docker compose up --build
```

Default exposed services:

| Service | Local URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend | http://localhost:7860 |
| Redis | localhost:6379 |

Useful Docker commands:

```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
docker compose down
```

If containers fail to boot, check that Docker Desktop is running and that the
required environment values are present.

## Validation Checklist

Run the commands that match the files you changed.

Backend changes:

```bash
python -m pytest
python -m py_compile backend/main.py
```

Frontend changes:

```bash
cd Frontend
npm run lint
npm run build
```

Docker changes:

```bash
docker compose config
docker compose up --build
```

Documentation-only changes:

```bash
git diff --check
```

## Pull Request Checklist

Before opening a pull request:

- Target the `gssoc` branch.
- Link the issue in the PR body, for example `Fixes #2963`.
- Keep the change focused on the issue scope.
- Include the validation commands you ran.
- Add screenshots for UI changes.
- Do not commit secrets, generated caches, virtual environments, or local
  database files.

## Troubleshooting

If Python packages install globally, reactivate the virtual environment and run
`python -m pip --version` to confirm the install path points inside `venv`.

If Supabase commands fail, make sure Docker Desktop is running before retrying
`supabase start`.

If frontend dependencies fail to install, delete `Frontend/node_modules` and
rerun `npm install`.

If Docker Compose cannot bind a port, stop the process already using that port
or adjust the host port mapping in `docker-compose.yml`.
