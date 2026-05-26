# Helpdesk.ai — Project Handoff Sheet: 03. FastAPI Backend & AI Pipeline

This handoff sheet outlines the Python FastAPI backend ecosystem deployed on Hugging Face Spaces. It includes the API endpoint reference, the machine learning models, individual service functions, and local deployment guidance.

---

## 🐍 1. Technology Stack & Deployment

*   **API Framework:** FastAPI (Asynchronous Python ASGI)
*   **Production Server:** Uvicorn / Gunicorn
*   **Deployment platform:** Hugging Face Spaces (Docker-based space running containerized FastAPI)
*   **Live Base URL:** `https://ritesh19180-ai-helpdesk-api.hf.space`
*   **Configuration Files:** [backend/Dockerfile](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/backend/Dockerfile), [backend/requirements.txt](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/backend/requirements.txt)

---

## 🧭 2. Primary Endpoints Reference

### `GET /health` & `GET /ready`
Liveness and readiness checks used by Hugging Face to evaluate deployment health.
*   **Response:** `{"status": "ok", "uptime": ...}`

### `POST /ai/analyze_ticket`
The central cognitive entry-point. Receives ticket text and files, runs them through the ML pipeline, and outputs metadata.
*   **Payload:**
    ```json
    {
      "text": "My laptop screen keeps flickering when connected to external monitor",
      "company_id": "8f3869ad-...",
      "image_url": null
    }
    ```
*   **Processing Pipeline:**
    1.  **OCR Processing:** If an `image_url` is provided, `ocr_service.py` extracts text via EasyOCR and appends it to the issue description.
    2.  **Category Classification:** `classifier_service.py` runs fine-tuned `DistilBERT` to predict the department (`IT`, `HR`, `Billing`, `Facilities`) and its confidence score.
    3.  **Entity Extraction:** `ner_service.py` runs token extraction for system tags, error codes, hardware names, and emails.
    4.  **Semantic Duplicate Check:** `duplicate_service.py` encodes the text using `sentence-transformers/all-MiniLM-L6-v2` and runs a cosine similarity query against other tickets in the database.
*   **Response:**
    ```json
    {
      "category": "IT Support",
      "sub_category": "Hardware / Laptop",
      "confidence": 0.94,
      "entities": ["laptop", "monitor"],
      "duplicates": [
        {
          "ticket_id": "...",
          "similarity_score": 0.88,
          "title": "Flickering screen on Dell laptops"
        }
      ]
    }
    ```

### `POST /ai/troubleshoot`
Connects the user to Gemini to receive structured debugging advice before submitting a ticket.
*   **Payload:** `{"text": "My office wifi is slow", "chat_history": [...]}`
*   **Response:** `{"response": "1. Reset your network adapter...\n2. Check proxy configuration...", "can_resolve": true}`

### `POST /ai/log_correction`
Logs manual admin ticket overrides to retrain the classifiers and prevent future misclassifications.
*   **Payload:** `{"ticket_id": "...", "original_category": "HR", "corrected_category": "IT Support", "admin_id": "..."}`
*   **Response:** `{"status": "logged_for_retraining"}`

---

## 🛠️ 3. Core Backend Services Directory

All services live in the [backend/services/](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/backend/services) directory:

### 1. `classifier_service.py`
Loads fine-tuned DistilBERT weights from `backend/models/distilbert/` and processes text tokenization via PyTorch.

### 2. `duplicate_service.py`
Computes 384-dimension semantic vector representation using `sentence-transformers/all-MiniLM-L6-v2`. Computes cosine similarity values against active company ticket vectors in real-time.

### 3. `ner_service.py`
Extracts key technical nouns and systems utilizing regex heuristics combined with Named Entity Recognition algorithms.

### 4. `gemini_service.py`
Uses the Google Generative AI Python SDK (`gemini-1.5-pro` / `gemini-1.5-flash`) to generate structured user troubleshooting instructions and parse raw terminal/application crash bug reports.

### 5. `ocr_service.py`
Initializes EasyOCR reader models in the container to extract log text and error descriptions from PNG or JPEG attachments.

### 6. `sla_service.py`
Monitors ticket response margins and pushes warnings/escalation triggers when tickets exceed their SLA boundaries (e.g. 4 hours for Urgent, 24 hours for Low).

### 7. `auto_close_service.py`
A background worker that checks Supabase every hour for resolved tickets and updates their state to "closed" if they have gone un-objected for longer than the specified `auto_close_days` (default 7 days).

---

## 🚀 4. How to Run Locally

If you need to execute the backend locally under Claude Code:

1.  Make sure you have Python 3.9+ and pip installed.
2.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
3.  Create a virtual environment:
    ```bash
    python -m venv .venv
    .venv\Scripts\activate     # Windows
    source .venv/bin/activate  # macOS / Linux
    ```
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Configure your environment variables in `.env` (copy from `.env.example` or use active keys listed in the handoff secrets sheet).
6.  Launch the development server:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
7.  Verify local swagger docs at: `http://localhost:8000/docs`
