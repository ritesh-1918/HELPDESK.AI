<div align="center">

# 🚀 HELPDESK.AI

**The Next Generation of Intelligent IT Support**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Models-orange)](https://huggingface.co/)

[Live Application (Frontend)](https://helpdeskaiv1.vercel.app/) | [Master Admin Portal](https://helpdeskaiv1.vercel.app/master-admin-login) | [AI Backend API](https://ritesh19180-ai-helpdesk-api.hf.space/docs)

</div>

---

## 🎯 The "Why" - Reimagining IT Support

Traditional IT Helpdesks are plagued by a massive bottleneck: **Manual Triage**. 

When an employee submits a ticket (e.g., "My email won't sync"), a human agent typically has to read the ticket, figure out what category it belongs to (Software, External, Auth?), decide how critical it is, and then assign it to the correct team. This manual routing is slow, error-prone, and frustrating for users who just want their problems fixed. Furthermore, users often submit duplicate tickets for ongoing outages, overwhelming the support queue.

**HELPDESK.AI solves this.** 

By leveraging advanced Artificial Intelligence, HELPDESK.AI instantly analyzes incoming user issues, extracts key technical information, and automatically categorizes, prioritizes, and routes the ticket in milliseconds. It turns a manual, slow process into an instantaneous, intelligent workflow.

<br/>

## ✨ Core AI Features (Version 1 Architecture)

Our intelligent engine is powered by a fine-tuned, multi-faceted AI pipeline:

### 1. 🧠 Smart Categorization & Routing
At the heart of HELPDESK.AI is a custom-trained **DistilBERT** classification model. When a user submits a description, the model predicts:
- **Category & Sub-Category:** (e.g., `Software` -> `Application Support`, `Hardware` -> `Peripheral Issue`).
- **Priority Level:** Accurately gauges the urgency (`Low`, `Medium`, `High`, `Critical`) based on the context and sentiment of the request.
- **Assigned Team:** Instantly determines the optimal resolution group (e.g., `Network Support`, `IAM Support`).

### 2. 🔍 Entity Extraction (NER)
A dedicated Named Entity Recognition (NER) model scans every ticket to pull out vital metadata automatically.
- **Software Elements:** Identifies specific applications mentioned (e.g., "Outlook", "Slack", "Oracle DB").
- **Hardware/Locations:** Extracts device types or physical locations to give agents immediate context.

### 3. 🛡️ Intelligent Duplicate Detection
Before a ticket is even created, our **Semantic Similarity Engine** (using `sentence-transformers/all-MiniLM-L6-v2`) compares the user's issue against active tickets.
- If a user reports "The main server is down" and someone else just reported "Main server outage", the AI flags it as a duplicate in real-time, preventing ticket floods during major incidents.

<br/>

## 🏢 3-Layer User Architecture

HELPDESK.AI isn't just a simple client/server app; it's designed to support a multi-tenant business environment with robust Role-Based Access Control (RBAC):

1. **👑 Master Admin**
   - The global overseer. Has a God's-eye view of the entire platform.
   - Responsible for registering new enterprise companies, approving new Company Admins, and monitoring system-wide analytics.
   
2. **🏢 Company Admin (Admin)**
   - The IT Manager for a specific organization/company.
   - Manages all standard users under their domain, views all tickets specific to their company, configures settings, and reviews AI analytics.
   
3. **👤 Standard User**
   - The employees experiencing issues.
   - They submit tickets, track resolution status, and interact with the AI-driven triage system. They only see their own tickets.

<br/>

## 🏗️ How It Works (Architecture)

HELPDESK.AI utilizes a modern, decoupled architecture designed for speed and scalability.

```mermaid
graph LR
    A[User (React/Vite Frontend)] -->|Submits Issue| B(FastAPI Backend)
    B -->|Text Processing| C{AI Inference Engine}
    C -->|DistilBERT| D[Categorization & Routing]
    C -->|NER Model| E[Entity Extraction]
    C -->|Cosine Similarity| F[Duplicate Detection]
    D --> G[(Supabase DB)]
    E --> G
    F --> G
    G -->|Real-time Sync| A
    G -->|Dashboard Data| H[Admin/Agent Portal]
```

### The Stack
*   **Frontend**: React 19, Vite, TailwindCSS (for rapid, beautiful UI styling), Zustand (State Management), Framer Motion (Animations).
*   **Backend Interface**: FastAPI (Python) - Chosen for its incredible speed and native async support.
*   **AI/ML Core**: PyTorch, Hugging Face `transformers`, `scikit-learn`, `pandas`.
*   **Database & Auth**: Supabase (PostgreSQL) - Providing real-time subscriptions and robust authentication.

<br/>

## 🚀 Live Links & APIs

*   **Live User/Admin Portal**: [https://helpdeskaiv1.vercel.app/](https://helpdeskaiv1.vercel.app/)
*   **Live Master Admin Portal**: [https://helpdeskaiv1.vercel.app/master-admin-login](https://helpdeskaiv1.vercel.app/master-admin-login)
*   **Production AI API (Hugging Face Space)**: [https://ritesh19180-ai-helpdesk-api.hf.space](https://ritesh19180-ai-helpdesk-api.hf.space)
*   **Interactive API Docs (Swagger UI)**: [https://ritesh19180-ai-helpdesk-api.hf.space/docs](https://ritesh19180-ai-helpdesk-api.hf.space/docs)

<br/>

## 🛠️ Local Setup & Installation

Want to run HELPDESK.AI locally? Follow these steps:

### Prerequisites
- Node.js (v18 or higher)
- Python (3.9 to 3.12)
- A Supabase account and project

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-helpdesk.git
cd ai-helpdesk
```

### 2. Backend Setup (AI & API)
Navigate to the backend directory and install the Python dependencies.

```bash
cd backend
python -m venv venv
# Activate virtual environment (Windows):
.\venv\Scripts\activate
# Activate virtual environment (Mac/Linux):
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

**Run the Backend Server:**
```bash
uvicorn main:app --reload
```
*The API will start on `http://localhost:8000`.*

### 3. Frontend Setup (React App)
Open a new terminal window, navigate to the frontend directory, and install the Node dependencies.

```bash
cd Frontend
npm install
```

**Environment Variables:**
Create a `.env` file in the `Frontend` directory and add your Supabase credentials and backend URL:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_BACKEND_URL=http://localhost:8000
```

**Run the Frontend Development Server:**
```bash
npm run dev
```
*The React app will start on `http://localhost:5173`.*

<br/>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
