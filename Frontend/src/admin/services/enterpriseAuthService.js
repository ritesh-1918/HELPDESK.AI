import { API_CONFIG } from "../../config";

const DEFAULT_PROVIDERS = [
    {
        id: "google-workspace",
        name: "Google Workspace",
        protocol: "oauth2",
        providerType: "oidc",
        enabled: false,
        clientId: "",
        clientSecretConfigured: false,
        discoveryUrl: "",
        metadataUrl: "",
        domainHint: "",
        buttonLabel: "Continue with Google Workspace",
        supabaseProvider: "google",
    },
    {
        id: "microsoft-entra",
        name: "Microsoft Entra ID",
        protocol: "oidc",
        providerType: "oidc",
        enabled: false,
        clientId: "",
        clientSecretConfigured: false,
        discoveryUrl: "",
        metadataUrl: "",
        domainHint: "",
        buttonLabel: "Continue with Microsoft",
        supabaseProvider: "azure",
    },
    {
        id: "okta-saml",
        name: "Okta (SAML)",
        protocol: "saml2",
        providerType: "saml",
        enabled: false,
        clientId: "",
        clientSecretConfigured: false,
        discoveryUrl: "",
        metadataUrl: "",
        domainHint: "",
        buttonLabel: "Continue with Okta",
        supabaseProvider: null,
    },
    {
        id: "generic-saml",
        name: "Generic SAML 2.0",
        protocol: "saml2",
        providerType: "saml",
        enabled: false,
        clientId: "",
        clientSecretConfigured: false,
        discoveryUrl: "",
        metadataUrl: "",
        domainHint: "",
        buttonLabel: "Continue with SSO",
        supabaseProvider: null,
    },
];

const DEFAULT_CONFIG = {
    enabled: false,
    allowEmailPasswordFallback: true,
    allowMagicLinkFallback: true,
    jitProvisioning: true,
    groupSyncEnabled: true,
    nestedGroupsEnabled: false,
    defaultRole: "user",
    sessionTimeoutMinutes: 480,
    provisioningWebhookSecret: "",
    providers: DEFAULT_PROVIDERS,
    roleMappings: [
        { id: "default-agent", externalGroup: "Support Engineers", role: "admin", scope: "ticket_management" },
        { id: "default-requester", externalGroup: "Employees", role: "user", scope: "requester_access" },
    ],
};

const defaultAuditEvents = () => ([
    {
        id: "local-seed",
        event: "suite.initialized",
        providerId: null,
        level: "info",
        message: "Enterprise authentication is ready to be configured.",
        actor: "system",
        createdAt: new Date().toISOString(),
    },
]);

const storageKey = (companyId) => `enterprise-auth-config::${companyId || "default-company"}`;

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeConfig = (config = {}) => {
    const merged = { ...clone(DEFAULT_CONFIG), ...config };
    const providersById = new Map(clone(DEFAULT_PROVIDERS).map((provider) => [provider.id, provider]));

    (config.providers || []).forEach((provider) => {
        const base = providersById.get(provider.id) || {};
        providersById.set(provider.id, { ...base, ...provider });
    });

    merged.providers = Array.from(providersById.values());
    merged.roleMappings = (config.roleMappings || DEFAULT_CONFIG.roleMappings).map((mapping, index) => ({
        id: mapping.id || `mapping-${index + 1}`,
        externalGroup: mapping.externalGroup || "",
        role: mapping.role || "user",
        scope: mapping.scope || "requester_access",
    }));

    return merged;
};

const getLocalPayload = (companyId) => {
    try {
        const raw = localStorage.getItem(storageKey(companyId));
        if (!raw) {
            return {
                companyId: companyId || "default-company",
                config: clone(DEFAULT_CONFIG),
                auditEvents: defaultAuditEvents(),
                updatedAt: null,
                updatedBy: null,
            };
        }

        const parsed = JSON.parse(raw);
        return {
            companyId: parsed.companyId || companyId || "default-company",
            config: normalizeConfig(parsed.config),
            auditEvents: parsed.auditEvents || defaultAuditEvents(),
            updatedAt: parsed.updatedAt || null,
            updatedBy: parsed.updatedBy || null,
        };
    } catch {
        return {
            companyId: companyId || "default-company",
            config: clone(DEFAULT_CONFIG),
            auditEvents: defaultAuditEvents(),
            updatedAt: null,
            updatedBy: null,
        };
    }
};

const saveLocalPayload = (companyId, payload) => {
    localStorage.setItem(storageKey(companyId), JSON.stringify(payload));
    return payload;
};

const buildUrl = (path, companyId) => {
    const url = new URL(`${API_CONFIG.BACKEND_URL}${path}`);
    if (companyId) {
        url.searchParams.set("company_id", companyId);
    }
    return url.toString();
};

export const enterpriseAuthService = {
    defaultConfig: clone(DEFAULT_CONFIG),

    async getConfig(companyId) {
        try {
            const response = await fetch(buildUrl("/admin/sso/config", companyId));
            if (!response.ok) {
                throw new Error(`Failed to load enterprise auth config (${response.status})`);
            }

            const data = await response.json();
            const normalized = {
                companyId: data.companyId || companyId || "default-company",
                config: normalizeConfig(data.config),
                auditEvents: data.auditEvents || defaultAuditEvents(),
                updatedAt: data.updatedAt || null,
                updatedBy: data.updatedBy || null,
            };
            saveLocalPayload(companyId, normalized);
            return normalized;
        } catch {
            return getLocalPayload(companyId);
        }
    },

    async saveConfig(companyId, config, actor = "admin") {
        const payload = {
            companyId: companyId || "default-company",
            actor,
            config,
        };

        try {
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/admin/sso/config`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to save enterprise auth config (${response.status})`);
            }

            const data = await response.json();
            const normalized = {
                companyId: data.companyId || payload.companyId,
                config: normalizeConfig(data.config),
                auditEvents: data.auditEvents || defaultAuditEvents(),
                updatedAt: data.updatedAt || new Date().toISOString(),
                updatedBy: data.updatedBy || actor,
            };
            saveLocalPayload(companyId, normalized);
            return normalized;
        } catch {
            const current = getLocalPayload(companyId);
            const updated = {
                companyId: payload.companyId,
                config: normalizeConfig(config),
                auditEvents: [
                    {
                        id: `local-${Date.now()}`,
                        event: "config.updated",
                        providerId: null,
                        level: "info",
                        message: "Enterprise authentication settings updated locally.",
                        actor,
                        createdAt: new Date().toISOString(),
                    },
                    ...(current.auditEvents || []),
                ].slice(0, 20),
                updatedAt: new Date().toISOString(),
                updatedBy: actor,
            };
            return saveLocalPayload(companyId, updated);
        }
    },

    async testProvider(companyId, providerId) {
        try {
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/admin/sso/test`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    companyId: companyId || "default-company",
                    providerId,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to test provider (${response.status})`);
            }

            return response.json();
        } catch {
            const local = getLocalPayload(companyId);
            const provider = local.config.providers.find((item) => item.id === providerId);
            const isSaml = provider?.protocol === "saml2";
            const missingFields = [];

            if (!provider?.enabled) {
                missingFields.push("provider must be enabled");
            }
            if (isSaml && !provider?.metadataUrl) {
                missingFields.push("metadataUrl");
            }
            if (!isSaml && !provider?.clientId) {
                missingFields.push("clientId");
            }

            return {
                status: missingFields.length ? "warning" : "success",
                providerId,
                checks: [
                    provider?.enabled ? "Provider is enabled for SSO sign-in." : "Provider is disabled for end-user sign-in.",
                    local.config.jitProvisioning ? "JIT provisioning is enabled." : "JIT provisioning is disabled.",
                ],
                missingFields,
                message: missingFields.length
                    ? `Local validation found missing items: ${missingFields.join(", ")}.`
                    : "Local validation passed for this provider.",
            };
        }
    },

    async getLoginProviders(companyId) {
        try {
            const response = await fetch(buildUrl("/admin/sso/providers", companyId));
            if (!response.ok) {
                throw new Error(`Failed to load providers (${response.status})`);
            }

            const data = await response.json();
            return data.providers || [];
        } catch {
            const local = getLocalPayload(companyId);
            if (!local.config.enabled) {
                return [];
            }
            return local.config.providers
                .filter((provider) => provider.enabled && provider.supabaseProvider)
                .map((provider) => ({
                    id: provider.id,
                    name: provider.name,
                    buttonLabel: provider.buttonLabel,
                    protocol: provider.protocol,
                    supabaseProvider: provider.supabaseProvider,
                    domainHint: provider.domainHint || "",
                }));
        }
    },
};
