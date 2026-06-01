# Helpdesk.ai — Project Handoff Sheet: 06. Technical Debt & Outstanding Issues

This handoff sheet outlines the identified technical debt, known structural risks, hardcoded configurations, and critical unresolved bugs that should be addressed immediately upon transition.

---

## 🛠️ 1. Resolved and Cleaned Tech Debt (Sprint 5)

*   **LogRocket Native App Warnings:**
    *   *Issue:* `@logrocket/react-native` was causing severe build warnings and blocking remote EAS cloud builds.
    *   *Action:* Removed all LogRocket initialization, import syntax, and session tracker commands from `MobileApp/App.js` and removed the dependency from `MobileApp/package.json`.
*   **Supabase Query Syntax Repairs:**
    *   *Issue:* Older screens were chaining `.catch()` statements directly onto Supabase promises, which is unsupported in Supabase JS v2 and resulted in app crashes.
    *   *Action:* Refactored all data query handlers inside `AdminTicketDetailScreen.js` and `AdminUsersScreen.js` to utilize standard `try-catch` async/await wraps.

---

## ⚠️ 2. Active Technical Debt (Requires Attention)

### 1. Hardcoded Supabase URL & Key in Mobile App
*   *Location:* [MobileApp/src/lib/supabase.js](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/MobileApp/src/lib/supabase.js)
*   *Risk:* Anon key and database URL are exposed in plain text in version control.
*   *Resolution Plan:* Refactor the connection script to read credentials from an environment variable via `expo-constants` and supply these variables during local development via `.env` or during EAS builds using Expo Secret Manager.

### 2. Live Database Missing the `system_settings` Table
*   *Status:* **Pushed but Not Executed.**
*   *Location:* [supabase/migrations/20260531_add_company_settings.sql](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/supabase/migrations/20260531_add_company_settings.sql)
*   *Impact:* The IT Admin Settings page will error out or crash when trying to save configurations (such as auto-close days, AI threshold rates, and custom color options) because the target relation `system_settings` does not exist in the live database schema.
*   *Resolution Plan:* Run the SQL script manually in the Supabase SQL editor (see Sheet 02 for detailed execution instructions).

### 3. Backend CORS Policies
*   *Location:* `backend/main.py`
*   *Detail:* The API restricts CORS inputs to specific origins (`helpdeskaiv1.vercel.app`, `localhost:5173`, `localhost:3000`).
*   *Impact:* Currently, the mobile app avoids CORS constraints by communicating directly with Supabase's API. If future features require the mobile client to talk directly to the FastAPI backend, the mobile domain/origins must be added to the whitelist.

### 4. "AI Understanding" Screen Naming Confusion
*   *User Feedback:* The "stages page / neural processing page / AI Understanding" page name was confusing to users when ticket creation took longer.
*   *Recommendation:* Rename this screen to something more user-friendly like **"Ticket Analyzer"**, **"AI Diagnostics Screen"**, or **"Smart Triage"**.
*   *Location:* [MobileApp/src/screens/user/AIProcessingScreen.js](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/MobileApp/src/screens/user/AIProcessingScreen.js)

---

## 🧹 3. Repository Hygiene & Cleanup Rules

To keep the `main` branch secure and clean for GSSoC and production development:

1.  **Exclude Temporary Scratch Files:** Never check in python tests or playground files. Always add scratch scripts to the [scratch/](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/scratch) folder and keep it listed in the root `.gitignore`.
2.  **Environment Files:** Ensure `.env` is never committed to GitHub. Maintain template structures in `.env.example`.
