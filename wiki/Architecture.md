<p align="center">
  <img src="https://img.shields.io/badge/ORCHESTRATION_ARCHITECTURE-111827?style=for-the-badge&logo=codeigniter&logoColor=white&labelColor=2563eb" width="100%" alt="Architecture Banner">
</p>

> [!NOTE]
> Helpdesk.AI utilizes a clean, decoupled architecture built for production SaaS environments. It is structured into multiple layers to ensure separation of concerns, scalability, and strict security isolation.

<br>

<table width="100%">
  <tr>
    <td width="35%" valign="top">
      <h2>System Architecture</h2>
      <p>The system is split horizontally:</p>
      <ul>
        <li><strong>Frontend</strong>: React for user interactions.</li>
        <li><strong>Backend</strong>: High-speed FastAPI routing.</li>
        <li><strong>Database</strong>: Supabase with strictly controlled Row-Level Security (RLS).</li>
        <li><strong>Intelligence</strong>: The custom AI Inference Engine handles <i>Text Processing</i> and <i>Reasoning</i> as side-effects before database commits.</li>
      </ul>
    </td>
    <td width="65%" valign="top">
      <br>
```mermaid
graph TD
    A["User (React UI)"] -->|"Submits API Req"| B("FastAPI Backend")
    B -->|"Text Payload"| C{"AI Inference Engine"}
    C -->|"DistilBERT v3"| D["Categorization Array"]
    C -->|"NER Engine"| D
    C -->|"GitHub Models / GPT-4o"| E["Auto-Resolution Suggestions"]
    D --> G[("Supabase Storage")]
    E --> G
    G -->|"Real-time WebSocket Sync"| A
    G -->|"Dashboard Aggregation"| H["Admin Portal"]
```
    </td>
  </tr>
</table>

<br><br>

> [!IMPORTANT]
> ### The AI Neural Pipeline
> Helpdesk.AI leverages a custom-orchestrated suite of models, natively augmented with GitHub Models integration to separate logic layers.

<table width="100%">
  <tr>
    <td width="33%" valign="top">
      <h4>High-Precision<br>Classification</h4>
      <p>Driven by <b>DistilBERT v3</b>, our classifier understands deep technical context and user sentiment to assign accurate Priority Impact Scores without hallucinating.</p>
    </td>
    <td width="33%" valign="top">
      <h4>Metadata<br>Harvesting</h4>
      <p>A custom NER pipeline extracts crucial infrastructure identifiers automatically from plain text (e.g., Hostnames, IP Addresses, Browser types) eliminating manual forms.</p>
    </td>
    <td width="34%" valign="top">
      <h4>GitHub Models<br>Integration</h4>
      <p>For complex logic like generating resolution steps or summarizing massive email threads, we pivot to <b>GitHub Models via Azure AI</b> (specifically `gpt-4o`) to ensure conversational accuracy.</p>
    </td>
  </tr>
</table>
