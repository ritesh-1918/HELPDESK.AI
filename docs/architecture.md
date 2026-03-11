# HELPDESK.AI - As-Built Architecture

## 1. System Overview
HELPDESK.AI is a multi-tenant SaaS ticketing platform driven by an AI processing pipeline to automate triage.

## 2. Component Architecture

### 2.1 Frontend (React + Vite)
- **Framework:** React 19 mapped through Vite.
- **State Management:** Zustand (`useAuthStore`, `useTicketStore`) with `zustand/middleware/persist` bound to `localStorage` (hardened against QuotaExceeded errors).
- **Styling:** TailwindCSS + Vanilla CSS for animations and layout.
- **Routing:** React Router DOM (v6+), facilitating public routes (`/`), protected user routes (`/dashboard`), and admin flows (`/master-admin`).

### 2.2 Backend (FastAPI + Python)
- **Framework:** FastAPI providing high-concurrency async endpoints.
- **Core Endpoints:**
  - `POST /ai/analyze_ticket`: Synchronous pipeline handling Text Classification (DistilBERT), NER, and Semantic Duplicate detection.
  - `POST /ai/log_correction`: Feedback loop endpoint for adversarial retraining.
- **Deployment:** Containerized and hosted on Hugging Face Spaces.

### 2.3 AI Inference Pipeline (Hugging Face / PyTorch)
- **Categorization & Routing:** Fine-tuned `DistilBERT`.
- **Duplicate Detection:** `sentence-transformers/all-MiniLM-L6-v2` for cosine similarity on cached ticket embeddings.
- **Performance:** End-to-end inference executes in <400ms under standard load.

### 2.4 Database & Auth Layer (Supabase / PostgreSQL)
- **Auth:** Supabase Auth (Email/Password & Magic Links). User state synchronized instantly via metadata and asynchronously via `profiles` table.
- **Database:** PostgreSQL.
  - Table: `profiles` (User RBAC and metadata)
  - Table: `tickets` (Core ticket data with JSONB for AI metadata)
- **Row Level Security (RLS):** Strict RLS policies ensure Company Admins only see their tenant's data, and users only see their own tickets.

## 3. Storage and Scaling Strategy
- **Client-Side:** Critical UI state cached in `localStorage` via Zustand persist. Direct `localStorage` access wrapped in `try-catch` blocks for adversarial resilience.
- **API Rate Limiting:** Expected at the API Gateway level (or via Hugging Face limits).

## 4. Production Hardening (BMAD Phase 1 & 2)
As part of the BMAD End-Game:
- **SEO & Metadata:** Implemented OpenGraph, Twitter Cards, and canonical meta boundaries in `index.html`.
- **Browser Storage Hardening:** Error boundaries established defensively against JSON Parse failures and Quota Limit Exceeded exceptions on clients.
- **Retrospective Log:** Documented in project artifacts repository.
