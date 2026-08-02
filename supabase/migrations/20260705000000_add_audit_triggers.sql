-- Migration: Add audit triggers for administrative and tenant management actions

-- 1. Create a generic audit trigger function
CREATE OR REPLACE FUNCTION audit_admin_action()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id uuid;
  v_actor_id text;
  v_event_type text;
  v_message text;
  v_metadata jsonb;
  v_actor_type text;
BEGIN
  v_actor_id := coalesce(auth.uid()::text, 'system');
  v_actor_type := CASE WHEN auth.uid() IS NULL THEN 'system' ELSE 'user' END;
  
  -- Determine company_id based on table
  IF TG_TABLE_NAME = 'companies' THEN
    v_company_id := coalesce(NEW.id, OLD.id);
  ELSIF TG_TABLE_NAME = 'profiles' THEN
    v_company_id := coalesce(NEW.company_id, OLD.company_id);
  ELSIF TG_TABLE_NAME = 'system_settings' THEN
    v_company_id := coalesce(NEW.company_id, OLD.company_id);
  ELSIF TG_TABLE_NAME = 'user_companies' THEN
    v_company_id := coalesce(NEW.company_id, OLD.company_id);
  ELSE
    v_company_id := NULL;
  END IF;

  v_event_type := TG_TABLE_NAME || '_' || lower(TG_OP);
  v_message := 'Admin action: ' || TG_OP || ' on ' || TG_TABLE_NAME;
  
  v_metadata := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'actor_id', v_actor_id,
    'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
  );

  IF TG_OP = 'INSERT' THEN
    v_metadata := v_metadata || jsonb_build_object('new_values', row_to_json(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    v_metadata := v_metadata || jsonb_build_object('old_values', row_to_json(OLD), 'new_values', row_to_json(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    v_metadata := v_metadata || jsonb_build_object('old_values', row_to_json(OLD));
  END IF;

  INSERT INTO audit_logs (
    event_type,
    company_id,
    actor_type,
    message,
    metadata
  ) VALUES (
    v_event_type,
    v_company_id,
    v_actor_type,
    v_message,
    v_metadata
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach trigger to tables

-- Trigger for companies
DROP TRIGGER IF EXISTS audit_companies_trigger ON companies;
CREATE TRIGGER audit_companies_trigger
  AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

-- Trigger for profiles
DROP TRIGGER IF EXISTS audit_profiles_trigger ON profiles;
CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

-- Trigger for system_settings
DROP TRIGGER IF EXISTS audit_system_settings_trigger ON system_settings;
CREATE TRIGGER audit_system_settings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

-- Trigger for user_companies
DROP TRIGGER IF EXISTS audit_user_companies_trigger ON user_companies;
CREATE TRIGGER audit_user_companies_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_companies
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();
