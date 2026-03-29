# Contributing to HELPDESK.AI 🚀

First off, thank you for considering contributing to **HELPDESK.AI**! It’s contributors like you who help transform IT support from "Chaos to Clarity."

This guide outlines the professional standards and workflows required to maintain the integrity of our AI-powered ecosystem.

---

## 🏗️ Founding Team (Infosys Springboard - Group 2)

HELPDESK.AI was conceived and built during the **Infosys Springboard Virtual Internship 6.0**. We acknowledge the foundational work of the following team members:

### 👑 Leadership & Coordination
*   **Duniya Vasa** (Group Lead)
*   **Sowjanya N**

### 🧠 AI & Modeling
*   **Pragati Tiwari** (Lead)
*   **Shaik Eshak**
*   **Ippili Raju**
*   **Vinitha Giri**
*   **Asna Abdul Kareem**
*   **Ritesh Bonthalakoti**

### ⚙️ Backend Engineering
*   **Asmeet Kaur Makkad** (Lead)
*   **Vijayalakshmi S R**
*   **Dinesh Reddy Vasampelli**
*   **Manya Sahasra**

### 🎨 Frontend Engineering
*   **Satla Prayukthika** (Lead)
*   **Bandi Keerthi Krishna**
*   **Shubha G D**
*   **Phani Kotha**

### 📊 Data Engineering
*   **Praneetha Baru** (Lead)
*   **Kavin Sarvesh**
*   **Utukuri Naga Sri Hari Chandana**
*   **Akash Kumar Paswan**
*   **Ganesh Goud Tekmul**

---

## 📝 How to Contribute

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

## 💻 Pull Request Process

We follow a strict "Production Ready" workflow. All PRs must meet the following criteria:

1.  **Branching Strategy:**
    *   `feature/` — New features or logic.
    *   `fix/` — Bug fixes.
    *   `docs/` — Documentation updates.
    *   `refactor/` — Code cleanup without functional changes.
2.  **Atomic Commits:** Each commit should be a small, logical unit of work with a descriptive message.
3.  **Performance Check:** Any changes to the backend must be tested to ensure inference times remain **strictly under 500ms**.
4.  **UI Consistency:** Frontend changes must strictly adhere to our "Chaos to Clarity" design system (Tailwind CSS + Framer Motion).
5.  **Documentation:** If you add a new feature, you must update `PLATFORM_MAP.md`.

---

## 🛠️ Technical Standards

### Python (Backend)
*   Follow **PEP 8** style guidelines.
*   Use type hints for all function signatures.
*   Ensure all new endpoints are documented via FastAPI's automatic Swagger/Redoc UI.

### JavaScript/React (Frontend)
*   Use functional components and hooks.
*   Maintain central state management via **Zustand**.
*   Ensure components are responsive across mobile, tablet, and desktop.

### AI & Data
*   Never commit raw datasets to the repository.
*   Ensure any model changes include a summary of evaluation metrics (F1-score, Accuracy).

---

## ⚖️ Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). We expect a professional, inclusive, and collaborative environment.

---
*Happy coding, and let’s drive the future of Intelligent Enterprise Support together!*
