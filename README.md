<div align="center">



# `H E L P D E S K . A I`
**The Intelligent Standard for Enterprise IT Service Management**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Vercel Deployment](https://img.shields.io/badge/Production-Live-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://helpdeskaiv1.vercel.app/)
[![Interactive Slides](https://img.shields.io/badge/Presentation-Interactive-10B981?style=for-the-badge&logo=googleslides&logoColor=white)](https://ritesh-1918.github.io/HELPDESK.AI/HELPDESK.AI%20Presentation.html)

<br/>

---

### ⚡ Eliminating the Manual Triage Bottleneck.
*Helpdesk.ai uses deep-learning neural networks and 4-layer enterprise architecture to categorize, prioritize, and resolve IT issues in milliseconds.*

<div align="center">
  <br/>
  <a href="https://helpdeskaiv1.vercel.app/">
    <img src="https://img.shields.io/badge/🚀_LAUNCH_APPLICATION-111827?style=for-the-badge&logo=vercel&logoColor=white&labelColor=6366f1" height="42" alt="Launch Application" />
  </a>
  &nbsp;&nbsp;
  <a href="https://helpdeskaiv1.vercel.app/contact-sales">
    <img src="https://img.shields.io/badge/✉️_CONTACT_ENTERPRISE-111827?style=for-the-badge&logo=minutemailer&logoColor=white&labelColor=10b981" height="42" alt="Contact Enterprise" />
  </a>
  &nbsp;&nbsp;
  <a href="https://ritesh19180-ai-helpdesk-api.hf.space/docs">
    <img src="https://img.shields.io/badge/📚_API_DOCUMENTATION-111827?style=for-the-badge&logo=swagger&logoColor=white&labelColor=f59e0b" height="42" alt="API Documentation" />
  </a>
  <br/><br/>
</div>
</div>

<br/>

## 📖 Navigation Hub

<div align="center">

| 🧩 **Platform Vision** | 🏗️ **Under the Hood** | 🚀 **Next Steps** |
| :--- | :--- | :--- |
| ➧ [Why Helpdesk.AI?](#-why-helpdeskai)<br>➧ [The Enterprise Evolution](#-the-enterprise-evolution) | ➧ [System Architecture](#-system-architecture)<br>➧ [The AI Neural Pipeline](#-the-ai-neural-pipeline) | ➧ [Deployment / Setup](#-deployment--local-orchestration)<br>➧ [Future Roadmap](#-roadmap) |
| ➧ [Feature Ecosystem](#-feature-ecosystem) | ➧ [Technology Ecosystem](#-technology-ecosystem) | |

</div>

---

## 🎯 Why Helpdesk.AI?

Helpdesk.AI is more than just a ticketing tool; it is a **Neural Service Orchestrator** designed for modern enterprises. It provides value in three primary ways:

1.  **Eliminating the Triage Bottleneck**: By using context-aware AI (DistilBERT), it categorizes 100% of tickets in milliseconds, allowing IT staff to focus on resolution rather than manual assignment.
2.  **Proactive Resolution**: Integrated LLMs (GitHub Models/Gemini) analyze issues during creation to suggest "Instant Fixes," potentially reducing ticket volume by up to 30%.
3.  **Tiered Multi-Tenancy**: Built for SaaS, it supports hundreds of companies on a single instance with secure data isolation (Supabase RLS).

---

## 💎 The Enterprise Evolution

Helpdesk.ai isn't just a ticketing tool; it's a **Neural IT Orchestrator**. Built to handle the complex requirements of modern organizations, it scales support without scaling headcount.

### 🏛️ 4-Layer Permission Matrix
Our architecture is meticulously designed for multi-tenant, zero-trust security. 
> [Explore the full 30+ Page Map in [PLATFORM_MAP.md](./PLATFORM_MAP.md)]

| Layer | Audience | Primary Capabilities |
| :--- | :--- | :--- |
| **👑 Master Admin** | Global Overseers | Tenant Registration, Company Onboarding, Global Health Monitoring, Bug Oversight. |
| **🏢 Company Admin** | IT Management | Org-specific Dashboard, User Auditing, Sentiment Analytics, SLA Performance Tracking. |
| **👤 Standard User** | Employees | AI-Powered Ticket Creation, Semantic Search, Real-time Status tracking, Auto-Resolution. |
| **🌐 Public Layer** | Prospects | Premium "Chaos to Clarity" journey, Sales Engineering contact, Live Pricing tiers. |

---

## 🏗️ System Architecture

Helpdesk.ai utilizes a clean, decoupled architecture built for production SaaS environments. 

```mermaid
graph TD
    A["User (Frontend)"] -->|"Submits Issue"| B("FastAPI Backend")
    B -->|"Text Processing"| C{"AI Inference Engine"}
    C -->|"DistilBERT v3"| D["Categorization & Routing"]
    C -->|"NER Engine"| E["Entity Extraction"]
    C -->|"Cosine Similarity"| F["Duplicate Detection"]
    D --> G[("Supabase DB")]
    E --> G
    F --> G
    G -->|"Real-time Sync"| A
    G -->|"Dashboard Data"| H["Admin/Agent Portal"]
```

---

## 🧠 The AI Neural Pipeline

Under the hood, Helpdesk.ai leverages a custom-orchestrated suite of transformer models and heuristics.

### 1. High-Precision Classification
Driven by **DistilBERT v3**, our classifier doesn't just predict categories—it understands technical context and user sentiment to assign accurate **Impact Scores** and **Priority Levels** (`Low`, `Medium`, `High`, `Critical`).

### 2. NER Metadata Harvesting
Our **Named Entity Recognition (NER)** engine automatically extracts vital technical identifiers:
- **Assets**: Hostnames, Serial Numbers, IP Addresses.
- **Environment**: Software versions, Browser types, OS identifiers.
- **Physicality**: Office locations, Lab IDs, Workstations.

### 3. Proactive Duplicate Prevention
Using `sentence-transformers` and **Cosine Similarity**, the system prevents "Ticket Floods" during incidents. If two users report the same outage, the AI semantically links them in real-world time.

### 4. Visionary OCR & Reasoning
- **Intelligent OCR**: Built-in screenshot analysis to pull error codes from user-uploaded images via Tesseract.
- **Gemini Reasoning**: Advanced LLM integration for generating human-like auto-resolutions and knowledge base summaries.

### 🚀 Team Quick Start (Interns)
If you are part of the development team, run the following command in PowerShell to set up your environment automatically:
```powershell
.\setup_workspace.ps1
```
This script will:
1. Verify Node.js and Python installations.
2. Install all Frontend dependencies (`npm install`).
3. Create a Python virtual environment for the Backend and install all AI dependencies.
4. Verify your `.env` configuration.

---

## ✨ Feature Ecosystem

The Helpdesk.ai platform is composed of 30+ specialized page-modules for a complete enterprise experience.
> [Read the full Feature Deep-Dive Document here](./PLATFORM_MAP.md)

### 🌓 User Experience
- **Chaos-to-Clarity UI**: A premium, responsive interface that guides users through ticket creation.
- **AI Processing Simulator**: Visual feedback showcasing the neural network's analysis in real-time.
- **Auto-Resolve Chat**: An interactive interface where the AI attempts to fix issues before they reach a human.
- **Smart Knowledge Check**: Proactive suggestion of relevant documentation during the "Help" journey.

### 📊 Administrative Suite
- **Insight Analytics**: Real-time ticket trends, team performance metrics, and sentiment heatmaps.
- **Identity Orchestration**: Role-based access control (RBAC) with secure invite-only onboarding for whole companies.
- **Audit Logging**: Full traceability for security compliance.
- **Shadow IT Monitoring**: Analytics to identify recurring non-standard software issues.

### ⚡ Technical Infrastructure
- **Stripe Subscriptions**: Seamless transition between `Starter` and `Growth` tiers with custom loading redirections.
- **Enterprise Leads Hub**: Dedicated B2B capture system for custom infra and SLA configurations.
- **Supabase Integrity**: Row-Level Security (RLS) ensures data isolation across hundreds of companies.

---

## 🛠️ Technology Ecosystem

| Category | Premium Stack |
| :--- | :--- |
| **Core** | ![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react) ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css) |
| **Intelligence** | ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi) ![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python) ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch) |
| **Logic** | ![HuggingFace](https://img.shields.io/badge/Hugging_Face-FFD21E?style=flat-square&logo=huggingface) ![Gemini](https://img.shields.io/badge/Gemini_AI-1E88E5?style=flat-square&logo=google-gemini) |
| **Security** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql) |
| **Ops** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel) ![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=flat-square&logo=stripe) ![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git) |

---

## 🚀 Deployment & Local Orchestration

### 1. Environment Configuration
Create a `.env` file in the `/Frontend` directory:
```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
VITE_STRIPE_GROWTH_LINK=your_stripe_link
VITE_BACKEND_URL=http://localhost:8000
```

### 2. Local Installation
```bash
# Clone the repository
git clone https://github.com/ritesh-1918/HELPDESK.AI.git

# Initialize Frontend
cd HELPDESK.AI/Frontend
npm install
npm run dev
```

### 3. Backend Setup
Navigate to `/backend` and refer to internal documentation for Python environment (`venv`) activation and `uvicorn` startup.


---

## 🗺️ Roadmap

- [x] **Phase 1**: Core Ticketing & DistilBERT Categorization.
- [x] **Phase 2**: Multi-tenant SaaS Architecture (Supabase RLS).
- [ ] **Phase 3**: GitHub Models integration for generative knowledge-base articles.
- [ ] **Phase 4**: SAP / ServiceNow direct bidirectional sync.
- [ ] **Phase 5**: AI Voice Support Agent via Twilio.

---

<div align="center">

Built with ❤️ by the **HELPDESK.AI Professional** Team. 
*Driving the future of Intelligent Enterprise Support*
</div>
