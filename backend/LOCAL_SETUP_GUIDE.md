# Local Backend Setup & Schema Verification Guide

This guide provides step-by-step instructions for setting up the HelpDesk.ai Python backend on your local machine for development and testing.

## Prerequisites

- **Python 3.10+**: Ensure you have Python installed. Check with `python --version`.
- **Git**: For version control.
- **Supabase Account**: You'll need a project on Supabase for the database and authentication.

## 1. Environment Setup

### 1.1 Create a Virtual Environment

Navigate to the `backend` directory and create a virtual environment to keep dependencies isolated.

```bash
cd backend
python -m venv venv
```

### 1.2 Activate the Virtual Environment

- **Windows**:
  ```powershell
  .\venv\Scripts\activate
  ```
- **macOS/Linux**:
  ```bash
  source venv/bin/activate
  ```

### 1.3 Install Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

## 2. Configuration

### 2.1 Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your Supabase credentials:
   - `SUPABASE_URL`: Your Supabase Project URL.
   - `SUPABASE_ANON_KEY`: Your Supabase Anon/Public Key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (for admin operations).

## 3. Database Schema Verification

To ensure your Supabase instance is ready, verify that the following tables exist in your `public` schema:

- `profiles`: Stores user information and roles.
- `tickets`: Stores support ticket data.
- `companies`: Stores organization data.
- `audit_logs`: Tracks system and user actions.
- `sla_policies`: Stores Service Level Agreement rules.

Refer to the `supabase/migrations` folder (if available) for the exact SQL definitions.

## 4. Running the Backend

Start the FastAPI server using `uvicorn`:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. You can access the interactive documentation at `http://localhost:8000/docs`.

## 5. Verification

Run the health check endpoint to confirm everything is working:

```bash
curl http://localhost:8000/health
```

A successful response should look like:
```json
{
  "status": "healthy",
  "models_loaded": true
}
```

## Troubleshooting

- **ModuleNotFoundError**: Ensure your virtual environment is activated and you've run `pip install`.
- **Supabase Connection Error**: Double-check your `.env` values and ensure your Supabase project is active.
- **Port Conflict**: If port 8000 is in use, change it using the `--port` flag in the uvicorn command.
