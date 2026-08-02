import test from 'node:test';
import assert from 'node:assert/strict';

import {
    DEFAULT_ADMIN_SETTINGS,
    resolveCompanyId,
    settingsFromSystemSettingsRow,
    settingsToSystemSettingsRow,
} from './adminSettingsPersistence.js';

test('maps a system_settings row into admin UI settings', () => {
    const settings = settingsFromSystemSettingsRow({
        ai_confidence_threshold: 0.7,
        duplicate_sensitivity: 0.9,
        enable_auto_resolve: true,
        auto_close_days: 14,
        email_notifications: true,
        admin_alerts: false,
    });

    assert.deepEqual(settings, {
        aiConfidenceThreshold: 0.7,
        duplicateSensitivity: 0.9,
        enableAutoResolve: true,
        autoCloseDays: 14,
        emailNotifications: true,
        adminAlerts: false,
    });
});

test('preserves fallback values when database columns are absent', () => {
    const settings = settingsFromSystemSettingsRow({}, DEFAULT_ADMIN_SETTINGS);

    assert.deepEqual(settings, DEFAULT_ADMIN_SETTINGS);
});

test('maps admin UI settings into an upsert payload', () => {
    const row = settingsToSystemSettingsRow({
        aiConfidenceThreshold: '0.75',
        duplicateSensitivity: 0.8,
        enableAutoResolve: 1,
        autoCloseDays: '3',
        emailNotifications: false,
        adminAlerts: true,
    }, 'company-123');

    assert.deepEqual(row, {
        company_id: 'company-123',
        ai_confidence_threshold: 0.75,
        duplicate_sensitivity: 0.8,
        enable_auto_resolve: true,
        auto_close_days: 3,
        email_notifications: false,
        admin_alerts: true,
    });
});

test('resolves company id from profile before auth metadata', () => {
    const companyId = resolveCompanyId(
        { company_id: 'profile-company' },
        { user_metadata: { company_id: 'metadata-company' } },
    );

    assert.equal(companyId, 'profile-company');
});
