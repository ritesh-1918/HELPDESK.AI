import copy
import json
import secrets
import uuid
from datetime import datetime, timezone
from pathlib import Path


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


DEFAULT_PROVIDERS = [
    {
        "id": "google-workspace",
        "name": "Google Workspace",
        "protocol": "oauth2",
        "providerType": "oidc",
        "enabled": False,
        "clientId": "",
        "clientSecretConfigured": False,
        "discoveryUrl": "",
        "metadataUrl": "",
        "domainHint": "",
        "buttonLabel": "Continue with Google Workspace",
        "supabaseProvider": "google",
    },
    {
        "id": "microsoft-entra",
        "name": "Microsoft Entra ID",
        "protocol": "oidc",
        "providerType": "oidc",
        "enabled": False,
        "clientId": "",
        "clientSecretConfigured": False,
        "discoveryUrl": "",
        "metadataUrl": "",
        "domainHint": "",
        "buttonLabel": "Continue with Microsoft",
        "supabaseProvider": "azure",
    },
    {
        "id": "okta-saml",
        "name": "Okta (SAML)",
        "protocol": "saml2",
        "providerType": "saml",
        "enabled": False,
        "clientId": "",
        "clientSecretConfigured": False,
        "discoveryUrl": "",
        "metadataUrl": "",
        "domainHint": "",
        "buttonLabel": "Continue with Okta",
        "supabaseProvider": None,
    },
    {
        "id": "generic-saml",
        "name": "Generic SAML 2.0",
        "protocol": "saml2",
        "providerType": "saml",
        "enabled": False,
        "clientId": "",
        "clientSecretConfigured": False,
        "discoveryUrl": "",
        "metadataUrl": "",
        "domainHint": "",
        "buttonLabel": "Continue with SSO",
        "supabaseProvider": None,
    },
]


DEFAULT_CONFIG = {
    "enabled": False,
    "allowEmailPasswordFallback": True,
    "allowMagicLinkFallback": True,
    "jitProvisioning": True,
    "groupSyncEnabled": True,
    "nestedGroupsEnabled": False,
    "defaultRole": "user",
    "sessionTimeoutMinutes": 480,
    "provisioningWebhookSecret": "",
    "providers": DEFAULT_PROVIDERS,
    "roleMappings": [
        {
            "id": "default-agent",
            "externalGroup": "Support Engineers",
            "role": "admin",
            "scope": "ticket_management",
        },
        {
            "id": "default-requester",
            "externalGroup": "Employees",
            "role": "user",
            "scope": "requester_access",
        },
    ],
}


class EnterpriseAuthService:
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self.state_path = Path(__file__).resolve().parent.parent / "data" / "enterprise_auth_state.json"

    def get_config(self, company_id: str | None) -> dict:
        normalized_company_id = self._normalize_company_id(company_id)
        payload = self._load_company_state(normalized_company_id)
        config = payload.get("config") or copy.deepcopy(DEFAULT_CONFIG)
        config = self._normalize_config(config)
        audit_events = payload.get("auditEvents") or self._default_audit_events(config)
        return {
            "companyId": normalized_company_id,
            "config": config,
            "auditEvents": audit_events[:20],
            "updatedAt": payload.get("updatedAt"),
            "updatedBy": payload.get("updatedBy"),
        }

    def save_config(self, company_id: str | None, config: dict, actor: str = "system") -> dict:
        normalized_company_id = self._normalize_company_id(company_id)
        payload = self._load_company_state(normalized_company_id)
        existing_audits = payload.get("auditEvents") or self._default_audit_events()
        normalized_config = self._normalize_config(config)

        if normalized_config.get("jitProvisioning") and not normalized_config.get("provisioningWebhookSecret"):
            normalized_config["provisioningWebhookSecret"] = self.generate_webhook_secret()

        updated_payload = {
            "config": normalized_config,
            "updatedAt": utc_now_iso(),
            "updatedBy": actor,
            "auditEvents": existing_audits,
        }
        self._persist_company_state(normalized_company_id, updated_payload)
        self.append_audit_event(
            normalized_company_id,
            {
                "event": "config.updated",
                "level": "info",
                "message": "Enterprise authentication settings updated.",
                "actor": actor,
            },
        )
        return self.get_config(normalized_company_id)

    def test_provider(self, company_id: str | None, provider_id: str) -> dict:
        current = self.get_config(company_id)
        provider = next((item for item in current["config"]["providers"] if item["id"] == provider_id), None)
        if not provider:
            return {
                "status": "error",
                "providerId": provider_id,
                "checks": ["Provider not found in configuration."],
                "message": "Unknown provider.",
            }

        checks = []
        missing = []
        protocol = provider.get("protocol")

        if protocol in {"oauth2", "oidc"}:
            if not provider.get("clientId"):
                missing.append("clientId")
            if not provider.get("clientSecretConfigured"):
                missing.append("clientSecret")
            if not provider.get("discoveryUrl") and protocol == "oidc":
                checks.append("Discovery URL is optional but recommended for OIDC metadata refresh.")
        elif protocol == "saml2":
            if not provider.get("metadataUrl"):
                missing.append("metadataUrl")

        if provider.get("enabled"):
            checks.append("Provider is enabled for end-user sign-in.")
        else:
            checks.append("Provider is currently disabled for end-user sign-in.")

        if current["config"].get("jitProvisioning"):
            checks.append("Just-in-time provisioning is enabled.")
        else:
            checks.append("Just-in-time provisioning is disabled.")

        status = "success" if not missing else "warning"
        message = (
            "Provider configuration looks ready for the next integration step."
            if not missing
            else f"Missing required fields: {', '.join(missing)}."
        )

        self.append_audit_event(
            current["companyId"],
            {
                "event": "provider.tested",
                "providerId": provider_id,
                "level": "success" if status == "success" else "warning",
                "message": message,
                "actor": "admin",
            },
        )

        return {
            "status": status,
            "providerId": provider_id,
            "checks": checks,
            "missingFields": missing,
            "message": message,
        }

    def get_login_providers(self, company_id: str | None) -> list[dict]:
        current = self.get_config(company_id)
        if not current["config"].get("enabled"):
            return []
        providers = []
        for provider in current["config"]["providers"]:
            if provider.get("enabled") and provider.get("supabaseProvider"):
                providers.append(
                    {
                        "id": provider["id"],
                        "name": provider["name"],
                        "buttonLabel": provider.get("buttonLabel") or f"Continue with {provider['name']}",
                        "protocol": provider.get("protocol"),
                        "supabaseProvider": provider.get("supabaseProvider"),
                        "domainHint": provider.get("domainHint") or "",
                    }
                )
        return providers

    def generate_webhook_secret(self) -> str:
        return secrets.token_urlsafe(24)

    def append_audit_event(self, company_id: str | None, event: dict) -> None:
        normalized_company_id = self._normalize_company_id(company_id)
        payload = self._load_company_state(normalized_company_id)
        audit_events = payload.get("auditEvents") or self._default_audit_events()
        audit_entry = {
            "id": str(uuid.uuid4()),
            "event": event.get("event", "audit.event"),
            "providerId": event.get("providerId"),
            "level": event.get("level", "info"),
            "message": event.get("message", ""),
            "actor": event.get("actor", "system"),
            "createdAt": utc_now_iso(),
        }
        audit_events.insert(0, audit_entry)
        payload["auditEvents"] = audit_events[:50]
        payload["updatedAt"] = payload.get("updatedAt") or utc_now_iso()
        self._persist_company_state(normalized_company_id, payload)

    def _normalize_company_id(self, company_id: str | None) -> str:
        return company_id or "default-company"

    def _normalize_config(self, config: dict | None) -> dict:
        merged = copy.deepcopy(DEFAULT_CONFIG)
        source = config or {}

        for key, value in source.items():
            if key not in {"providers", "roleMappings"}:
                merged[key] = value

        provider_map = {provider["id"]: copy.deepcopy(provider) for provider in DEFAULT_PROVIDERS}
        for incoming in source.get("providers", []):
            provider_id = incoming.get("id")
            if not provider_id:
                continue
            base = provider_map.get(
                provider_id,
                {
                    "id": provider_id,
                    "name": incoming.get("name", provider_id),
                    "protocol": incoming.get("protocol", "oauth2"),
                    "providerType": incoming.get("providerType", "oidc"),
                    "supabaseProvider": incoming.get("supabaseProvider"),
                },
            )
            base.update(incoming)
            provider_map[provider_id] = base

        merged["providers"] = list(provider_map.values())
        merged["roleMappings"] = [
            {
                "id": mapping.get("id") or str(uuid.uuid4()),
                "externalGroup": mapping.get("externalGroup", ""),
                "role": mapping.get("role", "user"),
                "scope": mapping.get("scope", "requester_access"),
            }
            for mapping in (source.get("roleMappings") or DEFAULT_CONFIG["roleMappings"])
        ]

        if not merged.get("provisioningWebhookSecret") and merged.get("jitProvisioning"):
            merged["provisioningWebhookSecret"] = self.generate_webhook_secret()

        return merged

    def _load_company_state(self, company_id: str) -> dict:
        if self.supabase:
            try:
                config_row = (
                    self.supabase.table("enterprise_sso_configs")
                    .select("config, updated_at, updated_by")
                    .eq("company_id", company_id)
                    .maybe_single()
                    .execute()
                )
                audit_rows = (
                    self.supabase.table("enterprise_sso_audit_logs")
                    .select("id, event, provider_id, level, message, actor, created_at")
                    .eq("company_id", company_id)
                    .order("created_at", desc=True)
                    .limit(20)
                    .execute()
                )
                if config_row.data:
                    return {
                        "config": config_row.data.get("config"),
                        "updatedAt": config_row.data.get("updated_at"),
                        "updatedBy": config_row.data.get("updated_by"),
                        "auditEvents": [
                            {
                                "id": row.get("id"),
                                "event": row.get("event"),
                                "providerId": row.get("provider_id"),
                                "level": row.get("level"),
                                "message": row.get("message"),
                                "actor": row.get("actor"),
                                "createdAt": row.get("created_at"),
                            }
                            for row in (audit_rows.data or [])
                        ],
                    }
            except Exception:
                pass

        state = self._read_state_file()
        return state.get(company_id, {})

    def _persist_company_state(self, company_id: str, payload: dict) -> None:
        if self.supabase:
            try:
                self.supabase.table("enterprise_sso_configs").upsert(
                    {
                        "company_id": company_id,
                        "config": payload.get("config"),
                        "updated_at": payload.get("updatedAt") or utc_now_iso(),
                        "updated_by": payload.get("updatedBy"),
                    },
                    on_conflict="company_id",
                ).execute()
                audit_events = payload.get("auditEvents") or []
                if audit_events:
                    latest = audit_events[0]
                    self.supabase.table("enterprise_sso_audit_logs").upsert(
                        {
                            "id": latest.get("id"),
                            "company_id": company_id,
                            "event": latest.get("event"),
                            "provider_id": latest.get("providerId"),
                            "level": latest.get("level"),
                            "message": latest.get("message"),
                            "actor": latest.get("actor"),
                            "created_at": latest.get("createdAt"),
                        }
                    ).execute()
                    return
            except Exception:
                pass

        state = self._read_state_file()
        state[company_id] = payload
        self.state_path.parent.mkdir(parents=True, exist_ok=True)
        self.state_path.write_text(json.dumps(state, indent=2), encoding="utf-8")

    def _read_state_file(self) -> dict:
        if not self.state_path.exists():
            return {}
        try:
            return json.loads(self.state_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}

    def _default_audit_events(self, config: dict | None = None) -> list[dict]:
        current_config = config or self._normalize_config(DEFAULT_CONFIG)
        ready_count = len([provider for provider in current_config["providers"] if provider.get("enabled")])
        return [
            {
                "id": str(uuid.uuid4()),
                "event": "suite.initialized",
                "providerId": None,
                "level": "info",
                "message": f"Enterprise auth workspace initialized with {ready_count} enabled provider(s).",
                "actor": "system",
                "createdAt": utc_now_iso(),
            }
        ]
