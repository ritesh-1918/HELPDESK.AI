export const DOCS_CATEGORIES = [
  { id: 'getting-started', title: 'Getting Started', icon: 'Rocket' },
  { id: 'ticket-flow', title: 'Ticket Flow & AI', icon: 'Cpu' },
  { id: 'admin-guide', title: 'Admin & Settings', icon: 'Sliders' },
  { id: 'troubleshooting', title: 'Troubleshooting', icon: 'AlertTriangle' }
];

export const DOCS_ARTICLES = [
  {
    id: 'intro',
    categoryId: 'getting-started',
    title: 'Platform Introduction',
    description: 'Overview of the AI-powered IT helpdesk ticket automation system.',
    tags: ['overview', 'architecture'],
    content: `
# Platform Introduction
Welcome to **HELPDESK.AI**—a next-generation automated IT Support Platform powered by custom local machine learning models and robust LLM failover pipelines.

HELPDESK.AI classifies, prioritizes, and routes incoming IT queries instantly without human intervention. If the AI determines that an issue matches a verified fix from our knowledge base, it auto-resolves the ticket dynamically!

### ⚡ Main Pillars of the Platform:
1. **AI Ingestion**: Captures text and screenshot telemetry from user inputs.
2. **NER (Named Entity Recognition)**: Extracts system hostnames, IP addresses, error codes, and library names.
3. **Automated Triage**: Predicts the ticket category, subcategory, priority level, and routes it to the optimal engineering unit.
4. **Auto-Resolution (RAG)**: Scans historically solved cases and knowledge articles, prompting users with step-by-step resolution playbooks.
    `
  },
  {
    id: 'access-roles',
    categoryId: 'getting-started',
    title: 'User Roles & Access Levels',
    description: 'Understand differences between End Users, Support Agents, and Admins.',
    tags: ['auth', 'roles'],
    content: `
# User Roles & Access Levels
HELPDESK.AI enforces tenant-scoped access mapping across three core authorization levels:

### 👥 1. End User
* **Dashboard Access**: Report new issues via voice or text.
* **Timeline Tracking**: Monitor real-time progress of submitted tickets.
* **Interactive Chat**: Directly correspond with assigned agents and support teams.

### 🛠️ 2. Support Agent
* **Divert Protocol**: Forward tickets to other units or claim them to move to an "In Progress" status.
* **Override Labels**: Manually edit categories, subcategories, or priority levels to retrain and log AI corrections.
* **Resolution Action**: Resolve active support incidents cleanly.

### 👑 3. Master Admin
* **System Operations**: Complete company registration directories, clearance directories, and system audit logs.
    `
  },
  {
    id: 'ticket-creation',
    categoryId: 'ticket-flow',
    title: 'Ingestion & Speech-to-Text',
    description: 'How to file tickets, capture details using voice, and extract text from attachments.',
    tags: ['voice', 'ocr', 'tickets'],
    content: `
# Ingestion & Speech-to-Text
Creating a ticket is fully optimized for speed and completeness through advanced frontend features.

### 🎙️ 1. Dictation & Voice Assistant
Click the **Microphone** icon in the **Voice Assistant** panel to dictate your issue.
- The web app dynamically invokes the browser's \`webkitSpeechRecognition\` framework.
- It displays a Siri-style audio visualizer showing live voice amplitude on-screen.
- Clicking **Done** appends the transcribed speech directly to the description textarea.

### 📸 2. Image Upload & OCR
Drag and drop or click to upload a JPEG/PNG screenshot of the system error.
- The frontend triggers **Tesseract.js** to run optical character recognition locally inside the browser.
- All extracted text is captured under \`ocr_text\` and sent to the LLM to understand technical signals.
    `
  },
  {
    id: 'system-settings',
    categoryId: 'admin-guide',
    title: 'Managing System Settings',
    description: 'Configure confidence limits and duplicate sensitivities dynamically.',
    tags: ['settings', 'admin'],
    content: `
# Managing System Settings
Support agents can tweak active settings on the **System Settings** page to align the automated routing behavior with operational guidelines.

### ⚙️ Adjusting AI Thresholds:
* **AI Confidence Threshold**: Controls whether a ticket can be automatically resolved or must be reviewed by a human. If the AI's confidence is below this limit, the ticket defaults to a \`pending_human\` review.
* **Duplicate Sensitivity**: Calibrates the semantic search limits when checking incoming tickets against previous issues. Higher sensitivity matches tickets only with extremely high textual similarity.
* **Auto-Resolve Toggle**: Enables or completely disables automated closing.
    `
  },
  {
    id: 'troubleshooting-connections',
    categoryId: 'troubleshooting',
    title: 'API & Connection Failures',
    description: 'How to troubleshoot Supabase or backend timeout errors.',
    tags: ['database', 'network', 'timeout'],
    content: `
# API & Connection Failures
If you encounter timeout issues or connection alerts, review the diagnostic guide below.

### 🔴 1. Supabase Initialization Failures
**Symptom**: Console logs show \\\`[Supabase] Client is disabled. Set valid VITE_SUPABASE_URL...\\\`
- **Resolution**: Verify that the \\\`.env\\\` file in the \\\`Frontend/\\\` folder contains your valid project URL and anon keys.
- **Vite Cache**: Run \\\`npm run dev\\\` again to make sure the environment changes are rehydrated in your web browser.

### 🔴 2. Backend Model degraded startup
**Symptom**: The AI Ingestion pipeline displays an warning about SentenceTransformer load errors.
- **Resolution**: The backend includes **self-healing fallback modules** that automatically bypass local ML loading on low-RAM servers, utilizing the API Failover module to ensure 100% platform availability.
    `
  }
];
