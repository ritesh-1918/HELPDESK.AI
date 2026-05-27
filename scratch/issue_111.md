## 🏆 Intermediate Security Bounty Description

To support secure multi-tenant hosting, database records must be completely isolated between companies. 

We need to add strict Row-Level Security (RLS) policies inside Supabase migrations for our newly added SLA-related tables (`sla_policies`, `escalation_logs`).

---

## 🛠️ Requirements

1. **Enable RLS**:
   * Create a Supabase SQL migration enabling row-level security on `sla_policies` and `escalation_logs`.
2. **RLS Scoping Policy**:
   * Implement SELECT, INSERT, UPDATE, and DELETE policies that restrict queries strictly by company.
   * Ensure standard users can only read their own company's SLA policy, while Company Admins can edit policies matching their authenticated company reference.
3. **Migration Integrity**: Ensure the migration runs cleanly against a local docker / live Supabase instance.
4. **Target Branch**: Please target the `gssoc` branch, NOT `main`.
