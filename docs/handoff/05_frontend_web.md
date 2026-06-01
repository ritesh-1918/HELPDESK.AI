# Helpdesk.ai — Project Handoff Sheet: 05. Frontend Web Application (React + Vite)

This handoff sheet covers the React 19 web front-end application built with Vite and TailwindCSS. It outlines routing layouts, state stores, environment requirements, and Vercel hosting details.

---

## 💻 1. Technical Stack

*   **Framework:** React 19
*   **Build Bundler:** Vite 7
*   **State Management:** Zustand 5 (hardened with persistent local storage caching)
*   **Routing Architecture:** React Router DOM (v7 SPA client-side routing)
*   **Styling:** TailwindCSS 3 + Custom CSS animations and transitions
*   **Chart Visuals:** Recharts (used for admin resolution and volume dashboard metrics)
*   **Deployment:** Vercel Hosting (automatic CI/CD linked to GitHub main branch)
*   **Production URL:** [helpdeskaiv1.vercel.app](https://helpdeskaiv1.vercel.app)

---

## 📂 2. Directory Structure

The frontend files live in the [Frontend/](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/Frontend) directory:

```
Frontend/
├── index.html              # HTML shell (configured with SEO OpenGraph)
├── tailwind.config.js      # Tailwind style tokens
├── vite.config.js          # Vite config
├── vercel.json             # Vercel rewrite configuration for routing
├── src/
│   ├── main.jsx            # React root mount
│   ├── App.jsx             # React Router layout and paths
│   ├── index.css           # Global CSS variables and glassmorphism rules
│   ├── stores/             # Zustand state persistence stores
│   │   ├── authStore.js    # Auth JWT sessions
│   │   └── ticketStore.js  # User tickets queue state
│   ├── public/             # Public landing, sales, terms, pricing
│   ├── user/               # Standard employee dashboard and creation screens
│   ├── admin/              # Management queues, custom sliders, analytics charts
│   └── master-admin/       # God-mode company approvals and error logs
```

---

## 🧭 3. Routing Map & Protection

The frontend uses `react-router-dom` to partition public, user, admin, and master_admin layers:

### 🌐 Public Paths (No Auth)
*   `/`: Interactive landing page.
*   `/login` & `/signup`: User entry points.
*   `/admin-signup`: Business onboarding forms.
*   `/contact-sales`: Persistence form for custom business tier inquiries.

### 👤 Standard User Paths (Protected via Auth Guard)
*   `/dashboard`: Dashboard, SLA alerts.
*   `/create-ticket`: Structured ticket forms. Includes AI loading simulators.
*   `/my-tickets` & `/ticket/:id`: Ticket tracking and support chat threads.
*   `/ai-understanding`: Visualization of DistilBERT predictions and duplicate detections.
*   `/profile`: Personal identity configurations.

### 🏢 IT Admin Paths (Protected via Role Guard)
*   `/admin/dashboard`: Metrics queue.
*   `/admin/tickets`: Operations tables. Includes overrides and technician routing.
*   `/admin/users`: User management tables.
*   `/admin/settings`: SLA deadlines and HSL styling palettes.
*   `/admin/analytics`: Volume graphs, category heatmaps, and sentiment charts.

---

## 💾 4. Client State Store (Zustand)

State is managed by Zustand stores inside `src/stores/`.
*   **`authStore.js`:** Handles Supabase authentication state and session resolution. Persistent caching is protected by try-catch blocks to prevent crashes under `QuotaExceededError` or JSON parse errors in localized storage.
*   **`ticketStore.js`:** Caches active ticket datasets to avoid redundant Supabase fetch overhead.

---

## 🚀 5. Local Running & Build Instructions

If you need to load the frontend web application under Claude Code:

1.  Navigate to the directory:
    ```bash
    cd Frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your `.env` file based on the active Supabase variables.
4.  Run in development mode:
    ```bash
    npm run dev
    ```
    *Open the app at:* `http://localhost:5173`
5.  To build for production locally:
    ```bash
    npm run build
    ```
    *Result goes to:* `Frontend/dist/`
