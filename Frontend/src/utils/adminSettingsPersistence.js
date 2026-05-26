export const DEFAULT_ADMIN_SETTINGS = {
    aiConfidenceThreshold: 0.8,
    duplicateSensitivity: 0.85,
    enableAutoResolve: false,
    autoCloseDays: 7,
    emailNotifications: false,
    adminAlerts: false,
};

export const resolveCompanyId = (profile, user) => {
    return (
        profile?.company_id ||
        profile?.companyId ||
        user?.user_metadata?.company_id ||
        user?.user_metadata?.companyId ||
        null
    );
};

export const settingsFromSystemSettingsRow = (row, fallback = DEFAULT_ADMIN_SETTINGS) => {
    if (!row) return fallback;

    return {
        aiConfidenceThreshold: row.ai_confidence_threshold ?? fallback.aiConfidenceThreshold,
        duplicateSensitivity: row.duplicate_sensitivity ?? fallback.duplicateSensitivity,
        enableAutoResolve: row.enable_auto_resolve ?? fallback.enableAutoResolve,
        autoCloseDays: row.auto_close_days ?? fallback.autoCloseDays,
        emailNotifications: row.email_notifications ?? fallback.emailNotifications,
        adminAlerts: row.admin_alerts ?? fallback.adminAlerts,
    };
};

export const settingsToSystemSettingsRow = (settings, companyId) => ({
    company_id: companyId,
    ai_confidence_threshold: Number(settings.aiConfidenceThreshold),
    duplicate_sensitivity: Number(settings.duplicateSensitivity),
    enable_auto_resolve: Boolean(settings.enableAutoResolve),
    auto_close_days: Number(settings.autoCloseDays),
    email_notifications: Boolean(settings.emailNotifications),
    admin_alerts: Boolean(settings.adminAlerts),
});
