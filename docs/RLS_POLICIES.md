# Row-Level Security (RLS) Policies

## Overview

Row-Level Security (RLS) policies provide multi-tenant data isolation in the HELPDESK.AI platform. RLS ensures that users can only access data belonging to their company, preventing data leaks across tenant boundaries.

**Issue**: #3204  
**Status**: Implemented  
**Category**: Security Enhancement

## Architecture

### What is Row-Level Security?

Row-Level Security is a database feature that restricts which rows a user can access in a table based on security policies. Instead of implementing access control in application code, RLS enforces isolation at the database layer, providing defense-in-depth.

### Benefits

1. **Defense in Depth**: Security enforced at database level, even if application logic is bypassed
2. **Compliance**: Meets multi-tenant isolation requirements for SOC 2, GDPR, HIPAA
3. **Simplified Code**: Less application-level access control logic
4. **Audit Trail**: Policy enforcement logged for compliance
5. **Performance**: Policies compiled into query plans for efficient execution

## Implemented Policies

### Tables with RLS Enabled

1. **tickets** - Core ticket data
2. **profiles** - User profiles and company membership
3. **ticket_comments** - Ticket conversation threads
4. **ticket_attachments** - File attachments
5. **system_settings** - Company configuration

### Policy Structure

#### Tickets Table

**SELECT Policy** (`tickets_select_policy`):
```sql
CREATE POLICY tickets_select_policy ON tickets
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );
```
- Users can only see tickets from their company
- Joins user's company_id from profiles table
- Uses Supabase `auth.uid()` for authenticated user ID

**INSERT Policy** (`tickets_insert_policy`):
```sql
CREATE POLICY tickets_insert_policy ON tickets
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );
```
- Users can only create tickets in their own company
- Prevents cross-tenant ticket injection

**UPDATE Policy** (`tickets_update_policy`):
```sql
CREATE POLICY tickets_update_policy ON tickets
    FOR UPDATE USING (...) WITH CHECK (...);
```
- Users can only update tickets from their company
- Both USING (for selecting rows to update) and WITH CHECK (for validating new values)

#### Profiles Table

**SELECT Policy** (`profiles_select_policy`):
```sql
CREATE POLICY profiles_select_policy ON profiles
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
        OR id = auth.uid()
    );
```
- Users can see profiles from their company
- Users can always see their own profile
- Supports team member directories and @ mentions

**UPDATE Policy** (`profiles_update_policy`):
```sql
CREATE POLICY profiles_update_policy ON profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
```
- Users can only update their own profile
- Prevents privilege escalation

#### Ticket Comments Table

**SELECT Policy**:
```sql
CREATE POLICY ticket_comments_select_policy ON ticket_comments
    FOR SELECT USING (
        ticket_id IN (
            SELECT id FROM tickets WHERE company_id IN (
                SELECT company_id FROM profiles WHERE id = auth.uid()
            )
        )
    );
```
- Users can see comments on tickets from their company
- Nested subquery ensures ticket belongs to user's company

**INSERT Policy**:
- Users can add comments to tickets in their company
- Prevents commenting on other companies' tickets

#### Ticket Attachments Table

**SELECT Policy**:
```sql
CREATE POLICY ticket_attachments_select_policy ON ticket_attachments
    FOR SELECT USING (
        ticket_id IN (
            SELECT id FROM tickets WHERE company_id IN (
                SELECT company_id FROM profiles WHERE id = auth.uid()
            )
        )
    );
```
- Users can only access attachments for their company's tickets
- Critical for preventing sensitive file access across tenants

#### System Settings Table

**SELECT Policy**:
```sql
CREATE POLICY system_settings_select_policy ON system_settings
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
        OR company_id IS NULL  -- Global settings
    );
```
- Company-specific settings visible to company members
- Global settings (company_id IS NULL) visible to all

**UPDATE Policy**:
```sql
CREATE POLICY system_settings_update_policy ON system_settings
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
        AND (
            SELECT role FROM profiles 
            WHERE id = auth.uid() AND company_id = system_settings.company_id
        ) IN ('admin', 'master_admin')
    );
```
- Only admins can update their company's settings
- Combines company membership + role check

## Helper Functions

### user_has_company_access(company_id)

Checks if the authenticated user has access to a company:

```sql
CREATE OR REPLACE FUNCTION user_has_company_access(company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND profiles.company_id = user_has_company_access.company_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage**:
```sql
SELECT * FROM tickets WHERE user_has_company_access(company_id);
```

### user_is_company_admin()

Checks if the authenticated user is an admin:

```sql
CREATE OR REPLACE FUNCTION user_is_company_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage**:
```sql
-- Only allow admins to delete
DELETE FROM system_settings WHERE user_is_company_admin();
```

### user_owns_ticket(ticket_id)

Checks if the authenticated user belongs to the ticket's company:

```sql
CREATE OR REPLACE FUNCTION user_owns_ticket(ticket_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM tickets t
        JOIN profiles p ON t.company_id = p.company_id
        WHERE t.id = ticket_id AND p.id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage**:
```sql
-- Verify access before sensitive operations
SELECT * FROM ticket_attachments WHERE user_owns_ticket(ticket_id);
```

## Audit Logging

### rls_audit_log Table

Tracks policy enforcement for compliance:

```sql
CREATE TABLE rls_audit_log (
    id UUID PRIMARY KEY,
    user_id UUID,
    table_name TEXT,
    operation TEXT,  -- SELECT, INSERT, UPDATE, DELETE
    allowed BOOLEAN,
    created_at TIMESTAMP
);
```

**Querying Audit Logs**:
```sql
-- Find failed access attempts
SELECT * FROM rls_audit_log 
WHERE allowed = FALSE 
ORDER BY created_at DESC 
LIMIT 100;

-- Audit by user
SELECT COUNT(*) as attempts, allowed
FROM rls_audit_log
WHERE user_id = 'user-123'
GROUP BY allowed;
```

## Service Role Bypass

### When to Use Service Role

The service role client bypasses RLS for legitimate system operations:

- **Background jobs**: Automated escalations, digest emails
- **Cross-tenant operations**: Analytics aggregation, reporting
- **Admin tools**: Data migrations, bulk operations
- **System maintenance**: Cleanup, archival

### Implementation

```python
from backend.database import supabase  # Standard client (RLS enforced)
from backend.database import get_service_role_client  # Bypass RLS

# Regular query - RLS enforced
user_tickets = supabase.table("tickets").select("*").execute()

# Service role - bypasses RLS
service_client = get_service_role_client()
all_tickets = service_client.table("tickets").select("*").execute()
```

**Security Note**: Never expose service role credentials to frontend or user-facing APIs.

## Testing RLS Policies

### Manual Testing

1. **Create test users in different companies**:
```sql
INSERT INTO profiles (id, company_id, email) VALUES
('user-a', 'company-1', 'a@test.com'),
('user-b', 'company-2', 'b@test.com');
```

2. **Create test tickets**:
```sql
INSERT INTO tickets (id, company_id, subject) VALUES
('ticket-1', 'company-1', 'Test ticket 1'),
('ticket-2', 'company-2', 'Test ticket 2');
```

3. **Test isolation**:
```sql
-- As user-a (company-1)
SET request.jwt.claim.sub = 'user-a';
SELECT * FROM tickets;  -- Should only see ticket-1

-- As user-b (company-2)
SET request.jwt.claim.sub = 'user-b';
SELECT * FROM tickets;  -- Should only see ticket-2
```

### Automated Testing

```python
def test_rls_ticket_isolation():
    """Test users cannot access other companies' tickets."""
    # Authenticate as user from company-1
    client_1 = create_auth_client(company_1_user_token)
    
    # Try to access company-2's ticket
    response = client_1.table("tickets").select("*").eq("id", company_2_ticket_id).execute()
    
    # Should return empty (filtered by RLS)
    assert len(response.data) == 0
```

## Performance Considerations

### Query Planning

RLS policies are compiled into the query execution plan:

```sql
EXPLAIN ANALYZE
SELECT * FROM tickets WHERE company_id = 'company-123';
```

Postgres optimizer combines application WHERE clause with RLS policy.

### Indexing

Ensure indexes support RLS policy filters:

```sql
-- Critical indexes for RLS performance
CREATE INDEX idx_tickets_company_id ON tickets(company_id);
CREATE INDEX idx_profiles_user_company ON profiles(id, company_id);
CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id);
```

### Caching

- RLS policies evaluated per-query
- Use application-level caching to reduce database hits
- Consider materialized views for analytics

## Migration Guide

The comprehensive RLS migration is located at:
```
supabase/migrations/20260712000000_add_comprehensive_rls_policies.sql
```

### Applying the Migration

```bash
# Using Supabase CLI
supabase db push

# Using psql
psql -h <host> -U <user> -d <database> -f supabase/migrations/20260712000000_add_comprehensive_rls_policies.sql
```

### Rollback

To disable RLS (not recommended for production):

```sql
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ... repeat for other tables
```

## Compliance

### SOC 2

- **CC6.1**: Logical access controls restrict access to data
- **CC6.3**: Access to data is restricted to authorized users
- RLS provides technical control for multi-tenant isolation

### GDPR

- **Article 32**: Appropriate technical measures for security
- **Article 25**: Data protection by design and by default
- RLS ensures data minimization (users see only their data)

### HIPAA

- **§164.312(a)(1)**: Access control
- **§164.308(a)(3)**: Workforce security
- RLS provides technical safeguards for PHI

## Troubleshooting

### Issue: User cannot see any data

**Diagnosis**:
```sql
-- Check user's company membership
SELECT * FROM profiles WHERE id = auth.uid();

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'tickets';
```

**Solution**: Ensure user has valid company_id in profiles table.

### Issue: Service role operations failing

**Diagnosis**: Check if using service_role client or anon key.

**Solution**: Use service role client for system operations:
```python
from backend.database import get_service_role_client
service_client = get_service_role_client()
```

### Issue: Performance degradation

**Diagnosis**:
```sql
EXPLAIN ANALYZE SELECT * FROM tickets;
```

**Solution**: Ensure indexes exist on company_id columns.

## References

- PostgreSQL RLS Documentation: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Supabase RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
- Migration: `supabase/migrations/20260712000000_add_comprehensive_rls_policies.sql`
- Issue: https://github.com/ritesh-1918/HELPDESK.AI/issues/3204
