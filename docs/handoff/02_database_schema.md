# Helpdesk.ai — Project Handoff Sheet: 02. Database Schema & Supabase Configuration

This sheet provides a complete overview of the Supabase PostgreSQL database schema, including the logical tables, structural constraints, RLS security policies, trigger functions, and critical migration details.

---

## 🗄️ 1. Core Tables & Field Definitions

### 🏢 `companies`
Represents the tenants on the multi-tenant platform.
*   `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
*   `name` (TEXT, Not Null) — Name of the company.
*   `domain` (TEXT, Unique) — E.g., `riteshpvtltd.com` (used for automated user routing).
*   `status` (TEXT) — `active`, `suspended`, `pending_verification`.
*   `created_at` (TIMESTAMPTZ, Default: `now()`)

### 👤 `profiles`
Integrates with `auth.users` to implement Role-Based Access Control (RBAC).
*   `id` (UUID, Primary Key, References `auth.users.id` ON DELETE CASCADE)
*   `full_name` (TEXT) — Display name of the user.
*   `company_id` (UUID, References `companies.id` ON DELETE SET NULL)
*   `company` (TEXT) — Company name string fallback.
*   `role` (TEXT, Default: `'user'`) — ENUM check: `'user'`, `'admin'`, `'master_admin'`.
*   `status` (TEXT, Default: `'active'`) — `'active'`, `'pending_approval'`, `'rejected'`.
*   `updated_at` (TIMESTAMPTZ)
*   `created_at` (TIMESTAMPTZ, Default: `now()`)

### 🎫 `tickets`
The central ticket store with embedded machine learning extraction columns and RAG vector indexes.
*   `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
*   `title` (TEXT, Not Null)
*   `description` (TEXT, Not Null)
*   `status` (TEXT, Default: `'open'`) — `'open'`, `'in_progress'`, `'resolved'`, `'closed'`.
*   `priority` (TEXT, Default: `'medium'`) — `'low'`, `'medium'`, `'high'`, `'urgent'`.
*   `category` (TEXT) — E.g., `'IT Support'`, `'HR'`, `'Billing'`.
*   `sub_category` (TEXT) — E.g., `'Network Issue'`, `'Payroll'`, `'Refund'`.
*   `created_by` (UUID, References `profiles.id`)
*   `company_id` (UUID, References `companies.id` ON DELETE CASCADE)
*   `assigned_to` (UUID, References `profiles.id`)
*   `ai_confidence` (FLOAT) — Confidence rating of the automatic classification.
*   `ai_metadata` (JSONB) — Raw extraction results (NER fields, duplicate scoring log).
*   `sla_deadline` (TIMESTAMPTZ) — Calculated timestamp based on ticket priority.
*   `sla_status` (TEXT, Default: `'active'`) — `'active'`, `'warning'`, `'breached'`, `'resolved'`.
*   `sla_breached` (BOOLEAN, Default: `false`)
*   `parent_id` (UUID, References `tickets.id` ON DELETE SET NULL) — Parent ticket pointer for duplicates.
*   `vector_embedding` (vector(384)) — pgvector cosine representation of ticket description (used for duplicate search).
*   `created_at` (TIMESTAMPTZ, Default: `now()`)

### 💬 `ticket_messages`
Stores the dialog threads for active tickets.
*   `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
*   `ticket_id` (UUID, References `tickets.id` ON DELETE CASCADE)
*   `sender_id` (UUID, References `profiles.id` ON DELETE CASCADE)
*   `message` (TEXT, Not Null)
*   `is_system` (BOOLEAN, Default: `false`) — Identifies system prompts or AI audit responses.
*   `attachments` (TEXT[]) — File storage links.
*   `created_at` (TIMESTAMPTZ, Default: `now()`)

### 🛠️ `system_settings`
Configures tenant-specific SLA tolerances and AI trigger boundaries.
*   `company_id` (UUID, Primary Key, References `companies.id` ON DELETE CASCADE)
*   `ai_confidence_threshold` (FLOAT, Default: `0.80`) — Minimum score to accept automated actions.
*   `duplicate_sensitivity` (FLOAT, Default: `0.85`) — Cosine similarity cut-off.
*   `enable_auto_resolve` (BOOLEAN, Default: `false`)
*   `auto_close_enabled` (BOOLEAN, Default: `true`)
*   `auto_close_days` (INTEGER, Default: `7`)
*   `email_notifications` (BOOLEAN, Default: `true`)
*   `admin_alerts` (BOOLEAN, Default: `true`)
*   `digest_frequency` (TEXT, Default: `'daily'`) — `'daily'`, `'weekly'`.
*   `updated_at` (TIMESTAMPTZ, Default: `now()`)

---

## 🔒 2. Row Level Security (RLS) Design

Supabase RLS secures the multi-tenant data layer. Below are the key security definitions:

### Profiles Table
*   **Read access:** Members can view other profiles sharing their `company_id`.
    ```sql
    CREATE POLICY "Members see company profiles" ON profiles
    FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));
    ```
*   **Write access:** Users can update their own profile metadata.
    ```sql
    CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());
    ```

### Tickets Table
*   **Standard Users:** Can read and write only their own records.
    ```sql
    CREATE POLICY "Users read own tickets" ON tickets
    FOR SELECT USING (created_by = auth.uid());
    
    CREATE POLICY "Users create own tickets" ON tickets
    FOR INSERT WITH CHECK (created_by = auth.uid());
    ```
*   **Admins:** Can read, update, and manage all tickets belonging to their tenant.
    ```sql
    CREATE POLICY "Admins manage company tickets" ON tickets
    FOR ALL USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
    );
    ```

### System Settings Table
*   Restricts select and modifications strictly to organization administrators.
    ```sql
    CREATE POLICY "Company members can manage own settings" ON system_settings
    FOR ALL
    USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
    ```

---

## ⚡ 3. SQL Trigger Actions

### Profile Generation Trigger
An automatic database trigger maps new signups from Supabase Auth (`auth.users`) to the public `profiles` table to maintain RBAC coherence.
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, company, role, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Employee'),
    COALESCE(new.raw_user_meta_data->>'company', 'Default Org'),
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    COALESCE(new.raw_user_meta_data->>'status', 'active')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## ⚠️ 4. Pending Database Actions

> [!IMPORTANT]  
> The new `system_settings` table and configuration RLS structure must be run manually on the live database.
> The migration script is fully completed and stored locally in [20260531_add_company_settings.sql](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/supabase/migrations/20260531_add_company_settings.sql).

### Execution Plan:
1. Open the [Supabase Dashboard](https://supabase.com).
2. Navigate to your project `aejuenhqciagpntcqoir`.
3. Open the **SQL Editor** tab.
4. Copy the complete SQL script located in the local migration file:
   [supabase/migrations/20260531_add_company_settings.sql](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/supabase/migrations/20260531_add_company_settings.sql)
5. Execute the script to create the table, set up its triggers, and authorize permissions.
