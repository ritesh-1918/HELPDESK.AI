# Helpdesk.ai — Project Handoff Sheet: 07. Claude Code Transition Guide

This transition sheet serves as the onboarding manual for **Claude Code** (or any subsequent developer/agent) taking over this repository. It provides step-by-step instructions on initializing, scanning, and resuming development.

---

## 🤖 1. Setting Up Claude Code in the Repository

Claude Code is Anthropic's agentic CLI terminal companion. To transition development of Helpdesk.ai, complete the following setup steps:

1.  **Install Claude Code globally (if not already installed):**
    ```bash
    npm install -g @anthropic-ai/claude-code
    ```
2.  **Navigate to the workspace root directory:**
    ```bash
    cd "c:\Projects\Software Projects\AI-Powered-Ticket-Creation-and-Categorization-from-User-Input"
    ```
3.  **Boot Claude Code:**
    ```bash
    claude
    ```
4.  **Confirm Permissions:** Approve Claude's permission requests to read the workspace directory.

---

## 🔎 2. Recommended Initialization Prompts for Claude

When starting your first session with Claude Code, run the following command queries to quickly align the agent with the repository state:

> 💬 **"Scan the files in `docs/handoff/` to understand the system architecture, database schema, active FastAPI backend endpoints, and EAS mobile build configurations."**

> 💬 **"Run `git status` and check if there are any uncommitted changes, and verify what files are currently in the staging queue."**

> 💬 **"Examine `MobileApp/App.js` and verify that the LogRocket integration has been completely removed to avoid build errors."**

---

## 🚀 3. Quick-Start Terminal Commands

Claude Code can run terminal commands on your behalf. Here are the core development pipelines you can instruct Claude to trigger:

### 🌐 Development of Frontend Web
```bash
cd Frontend
npm install
npm run dev
```

### 🐍 Development of FastAPI Backend
```bash
cd backend
# Activate venv
.venv\Scripts\activate
# Install deps
pip install -r requirements.txt
# Run local uvicorn instance
uvicorn main:app --reload --port 8000
```

### 📱 Development of Mobile App (Expo)
```bash
cd MobileApp
npm install
npx expo start --clear
```

### 📦 Remotely Build Mobile APK (EAS)
```bash
cd MobileApp
# Perform liveness check on EAS CLI
npx eas whoami
# Start Android APK compile
npx eas build --profile preview_apk --platform android --non-interactive
```

---

## 🎯 4. Priority Tasks for Claude Code to Tackle Next

Once Claude is initialized, request it to focus on the following outstanding milestones:

1.  **Verify the ongoing EAS Android APK build:** Check if the background EAS cloud build has completed and retrieve the installable APK download link for the user.
2.  **Remind the user to run the Supabase settings migration:** Guide the user through copying and executing [supabase/migrations/20260531_add_company_settings.sql](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/supabase/migrations/20260531_add_company_settings.sql) inside the Supabase SQL editor to prevent company settings failures.
3.  **Secure Supabase Credentials in the Mobile App:** Refactor the hardcoded anon key and database URL in `MobileApp/src/lib/supabase.js` to draw from a secure environment file using `expo-constants`.
4.  **Rename the "AI Understanding" screen:** Implement the user-friendly name update on `AIProcessingScreen.js` and its navigator imports in `App.js` to simplify standard employee triage.
