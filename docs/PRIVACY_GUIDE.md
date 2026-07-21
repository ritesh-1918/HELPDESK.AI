# GDPR / CCPA Compliance & Privacy Guide

HelpDesk.AI is fully committed to protecting user privacy and ensuring compliance with global data protection regulations such as the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). This document outlines the system's privacy controls for users, administrators, and legal compliance.

---

## 👤 1. User Documentation

Users can exercise their data privacy rights directly from their profile page under the **Privacy Preference Center**.

### How to Manage Consent Preferences
1. Navigate to your **Profile** and click on **Privacy Settings**.
2. Under the **Consent Settings Ledger**, you can choose to opt-in or opt-out of the following categories:
   - **Communications**: Marketing & promotional emails, product updates, system news.
   - **Analytics & Tracking**: Usage activity analytics, performance telemetry, behavior flow tracking.
   - **Optional/Experimental**: Experimental AI diagnostics, springboard research.
3. Click **Synchronize Consent Settings** to save your preferences.

> [!NOTE]
> **Browser Privacy Signals (DNT / GPC)**: If your browser sends a `DNT: 1` (Do Not Track) header or Global Privacy Control signal, HelpDesk.AI will automatically disable all non-essential analytics and behavioral tracking, overriding any manual opt-in preferences.

### How to Export Your Data (Data Portability)
1. In the **Privacy Settings** page, navigate to the **Data Rights Portal**.
2. Under **Right to Access & Portability**, select your preferred format:
   - **Download JSON Export**: Returns a complete raw data package of your profile metadata, tickets, comments, and consent history.
   - **Download CSV Summary**: Returns a simplified, spreadsheet-ready summary of your account activity.
3. Your browser will instantly download the file.

### How to Request Account Deletion (Right to Erasure)
1. Under the **Right to Erasure** section, click **Request Permanent Account Deletion**.
2. A confirmation modal will appear. Review the warnings and click confirm.
3. Your account will enter a **30-day grace period** (Pending Deletion status).
4. You can cancel this request at any time during the 30-day window by clicking **Cancel Erasure** on the warning banner in your privacy dashboard.
5. After 30 days, the automated scheduler will execute the permanent erasure sequence.

---

## 🏢 2. Administrator Documentation

IT administrators and system compliance officers can manage organizational privacy settings and view compliance logs.

### Retention Policy Configurations
Organizational data retention rules are enforced automatically:
- **Expired Attachments**: Wiped from resolved/closed tickets older than 90 days.
- **Ticket Archival**: Resolved/closed tickets older than 1 year are moved to archived status.
- **Inactive Accounts**: Accounts inactive for 2 years are automatically flagged for deletion.

### Processing Deletions & Anonymization
When a user erasure request is completed:
- **Personal Identifying Information (PII)**: The user profile row, email address, preferences, and authentication records are permanently deleted.
- **Tickets**: Preservation of tickets for business analytics. The `user_id` field is set to `NULL`, and a unique randomized anonymous alias is generated.
- **Messages**: The `sender_id` is set to `NULL` and the sender's name is anonymized to `"Deleted User"`.

### Audit Log Reviews
All privacy actions generate compliance records stored in `privacy_audit_logs`. Admins can inspect:
- Export logs (`data_portability_export`)
- Deletion submissions and executions (`submit_deletion_request`, `erasure_request_completed`)
- Consent changes (`update_consent_preferences`)

---

## ⚖️ 3. Legal Disclosures & Privacy Policy

Under Article 13 of the GDPR and California Civil Code Section 1798.100, the platform discloses the following parameters:

### Data Retention Disclosures

| Data Category | PII Fields Collected | Retention Period | Purpose |
| :--- | :--- | :--- | :--- |
| **Identity Info** | Name, Email, Phone, Title, Avatar | Active account + 30 days grace period | Authentication, user communications |
| **Support Logs** | Ticket description, custom metadata, attachments | 1 year resolved (archived) then anonymized | Automated triage & support workflows |
| **Communications** | Messages, comments, call logs | Linked to ticket lifecycle | Support correspondence history |
| **Consent Ledger** | Consent preferences log, audit timestamps | Wiped upon account deletion | Regulatory compliance proof (GDPR/CCPA) |

For further inquiries, contact the Data Protection Officer (DPO) at `privacy@helpdesk.ai`.
