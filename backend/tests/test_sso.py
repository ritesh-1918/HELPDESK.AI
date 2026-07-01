import pytest
import base64
import json
from unittest.mock import MagicMock

from backend.auth.saml_provider import generate_authn_request, parse_metadata_xml, verify_saml_response
from backend.auth.oauth_provider import get_authorization_url
from backend.services.idp_sync_service import resolve_role, provision_user, handle_scim_webhook

# Mock XML metadata for Okta
MOCK_METADATA_XML = """<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor entityID="http://www.okta.com/exk1234" xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata">
  <md:IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>MOCK_CERTIFICATE_BASE64_DATA</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://okta.com/sso/saml" />
  </md:IDPSSODescriptor>
</md:EntityDescriptor>"""

# Mock SAML Response Assertion XML
MOCK_SAML_RESPONSE_XML = """<?xml version="1.0" encoding="UTF-8"?>
<samlp:Response ID="id-mock-response" Version="2.0" IssueInstant="2026-06-03T12:00:00Z"
                xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
  <samlp:Status>
    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success" />
  </samlp:Status>
  <saml:Assertion ID="id-mock-assertion" Version="2.0" IssueInstant="2026-06-03T12:00:00Z">
    <saml:Issuer>http://www.okta.com/exk1234</saml:Issuer>
    <saml:Subject>
      <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">john.doe@company.com</saml:NameID>
    </saml:Subject>
    <saml:AttributeStatement>
      <saml:Attribute Name="first_name">
        <saml:AttributeValue>John</saml:AttributeValue>
      </saml:Attribute>
      <saml:Attribute Name="last_name">
        <saml:AttributeValue>Doe</saml:AttributeValue>
      </saml:Attribute>
      <saml:Attribute Name="groups">
        <saml:AttributeValue>HelpDesk_Admins</saml:AttributeValue>
        <saml:AttributeValue>IT_Users</saml:AttributeValue>
      </saml:Attribute>
    </saml:AttributeStatement>
  </saml:Assertion>
</samlp:Response>"""

def test_saml_authn_request_generation():
    sso_url = "https://identity.okta.com/sso"
    entity_id = "https://helpdesk.ai"
    callback_url = "http://localhost:8000/auth/sso/saml/callback"
    
    redirect_url = generate_authn_request(sso_url, entity_id, callback_url)
    assert sso_url in redirect_url
    assert "SAMLRequest=" in redirect_url

def test_saml_metadata_parsing():
    parsed = parse_metadata_xml(MOCK_METADATA_XML)
    assert parsed["status"] == "success"
    assert parsed["entity_id"] == "http://www.okta.com/exk1234"
    assert parsed["sso_url"] == "https://okta.com/sso/saml"
    assert parsed["x509_cert"] == "MOCK_CERTIFICATE_BASE64_DATA"

def test_saml_response_verification():
    assertion_b64 = base64.b64encode(MOCK_SAML_RESPONSE_XML.encode('utf-8')).decode('utf-8')
    res = verify_saml_response(assertion_b64, "https://helpdesk.ai", "MOCK_CERTIFICATE_BASE64_DATA")
    
    assert res["verified"] is True
    assert res["email"] == "john.doe@company.com"
    assert res["full_name"] == "John Doe"
    assert "HelpDesk_Admins" in res["groups"]

def test_oauth_auth_url_generation():
    auth_url = get_authorization_url("google", "client-id-123", "http://localhost:8000/callback", "state-xyz")
    assert "accounts.google.com" in auth_url
    assert "client_id=client-id-123" in auth_url
    
    auth_url_ms = get_authorization_url("microsoft", "client-id-456", "http://localhost:8000/callback", "state-abc")
    assert "login.microsoftonline.com" in auth_url_ms

def test_role_resolution():
    mock_supabase = MagicMock()
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        {"idp_group": "HelpDesk_Admins", "app_role": "super_admin"},
        {"idp_group": "Support_Managers", "app_role": "admin"}
    ]
    
    # 1. Resolve to highest hierarchy
    resolved = resolve_role(mock_supabase, "company-uuid", ["HelpDesk_Admins", "Support_Managers"], default_role="user")
    assert resolved == "super_admin"
    
    # 2. Resolve to default if no match
    resolved_default = resolve_role(mock_supabase, "company-uuid", ["Other_Group"], default_role="user")
    assert resolved_default == "user"

def test_jit_provisioning_flow():
    mock_supabase = MagicMock()
    # Mock settings
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = [
        # sso_provisioning_settings
        MagicMock(data={"enable_jit": True, "default_role": "user", "sync_groups": True}),
        # companies name
        MagicMock(data={"name": "Enterprise Co"})
    ]
    # Mock profiles empty (new user)
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
        # sso_role_mappings
        MagicMock(data=[{"idp_group": "Admins", "app_role": "admin"}]),
        # profiles check (empty)
        MagicMock(data=[])
    ]
    
    # Mock auth create_user
    mock_auth_user = MagicMock()
    mock_auth_user.user.id = "mock-user-id"
    mock_supabase.auth.admin.create_user.return_value = mock_auth_user
    
    res = provision_user(
        mock_supabase,
        email="test@enterprise.com",
        full_name="Test User",
        company_id="company-uuid",
        idp_groups=["Admins"],
        provider_name="saml"
    )
    
    assert res["status"] == "success"
    assert res["user_id"] == "mock-user-id"
    assert res["role"] == "admin"
    assert res["is_new"] is True

def test_scim_webhook_handler():
    mock_supabase = MagicMock()
    # Mock validation of token
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
        # sso_providers check
        MagicMock(data=[{"company_id": "company-uuid", "provider_name": "okta"}]),
        # profiles check (existing profile)
        MagicMock(data=[{"id": "user-uuid"}])
    ]
    
    # Mock settings single fetch
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = [
        # sso_provisioning_settings
        MagicMock(data={"enable_jit": True, "default_role": "user", "sync_groups": True}),
        # companies name
        MagicMock(data={"name": "Enterprise Co"})
    ]
    
    payload = {
        "event": "User",
        "action": "deactivate",
        "email": "user@enterprise.com"
    }
    
    res = handle_scim_webhook(mock_supabase, payload, "bearer-webhook-token")
    assert res["status"] == "success"
    assert "deactivated" in res["message"]
