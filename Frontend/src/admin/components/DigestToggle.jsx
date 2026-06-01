/**
 * DigestToggle.jsx
 *
 * Admin component for managing the weekly helpdesk digest email settings.
 *
 * Features:
 *  - Toggle to enable / disable the weekly digest for the company
 *  - Editable admin email input for the digest recipient
 *  - Displays the last digest sent timestamp
 *  - "Send Now" button for immediate manual dispatch
 *  - Persists settings back to Supabase system_settings table
 *  - Tailwind-based, dark-card UI with green accent colour (#10b981)
 *
 * Props:
 *  - companyId {string}  UUID of the current company
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Small icon helpers (inline SVG, no extra deps) ─────────────────────────

function IconMail() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function IconLoader() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none
        focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900
        ${checked ? 'bg-emerald-500' : 'bg-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ type, children }) {
  const colours = {
    success: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
    error:   'bg-red-900/50 text-red-300 border-red-700',
    info:    'bg-blue-900/50 text-blue-300 border-blue-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${colours[type] || colours.info}`}>
      {children}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DigestToggle({ companyId }) {
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [sending, setSending]         = useState(false);
  const [error, setError]             = useState(null);
  const [successMsg, setSuccessMsg]   = useState(null);

  const [digestEnabled, setDigestEnabled]   = useState(false);
  const [adminEmail, setAdminEmail]         = useState('');
  const [lastSentAt, setLastSentAt]         = useState(null);

  // ── Load settings from DB ───────────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('system_settings')
        .select('digest_enabled, digest_admin_email, digest_last_sent')
        .eq('company_id', companyId)
        .single();

      if (dbErr) throw dbErr;

      setDigestEnabled(data?.digest_enabled ?? false);
      setAdminEmail(data?.digest_admin_email ?? '');
      setLastSentAt(data?.digest_last_sent ?? null);
    } catch (_e) {
      setError('Failed to load digest settings. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ── Save settings to DB ─────────────────────────────────────────────────────
  const handleSave = async () => {
    setError(null);
    setSuccessMsg(null);

    if (digestEnabled && !adminEmail.trim()) {
      setError('Please enter an admin email address before enabling the digest.');
      return;
    }

    setSaving(true);
    try {
      const { error: upsertErr } = await supabase
        .from('system_settings')
        .upsert({
          company_id: companyId,
          digest_enabled: digestEnabled,
          digest_admin_email: adminEmail.trim(),
        }, { onConflict: 'company_id' });

      if (upsertErr) throw upsertErr;
      setSuccessMsg('Digest settings saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (_e) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Manual send ────────────────────────────────────────────────────────────
  const handleSendNow = async () => {
    if (!adminEmail.trim()) {
      setError('Enter an admin email address before sending.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setSending(true);
    try {
      const res = await fetch('/api/digest/send-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, email: adminEmail.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      setSuccessMsg(`Digest sent to ${adminEmail}!`);
      setLastSentAt(new Date().toISOString());
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      setError(`Send failed: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="rounded-2xl bg-gray-900 border border-gray-700 p-6 shadow-xl animate-pulse">
        <div className="h-5 w-48 bg-gray-700 rounded mb-4" />
        <div className="h-4 w-32 bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-700 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-700 px-6 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <IconMail />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-white">Weekly Digest Email</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Automated helpdesk performance summary delivered every Monday 8 AM UTC
          </p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Enable / disable toggle row */}
        <div className="flex items-center justify-between rounded-xl bg-gray-800 border border-gray-700 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">Enable Weekly Digest</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Automatically email a digest report to your admin
            </p>
          </div>
          <ToggleSwitch
            checked={digestEnabled}
            onChange={setDigestEnabled}
            disabled={saving || sending}
          />
        </div>

        {/* Admin email input */}
        <div>
          <label htmlFor="digest-email" className="block text-xs font-medium text-gray-300 mb-1.5">
            Recipient Admin Email
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
              <IconMail />
            </span>
            <input
              id="digest-email"
              type="email"
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
              placeholder="admin@yourcompany.com"
              disabled={saving || sending}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 py-2.5 pl-10 pr-4
                text-sm text-white placeholder-gray-500
                focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-150
              "
            />
          </div>
        </div>

        {/* Last sent row */}
        {lastSentAt && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-800/60 border border-gray-700 px-4 py-2.5">
            <span className="text-gray-400"><IconCalendar /></span>
            <span className="text-xs text-gray-400">
              Last sent:{' '}
              <span className="text-gray-200 font-medium">
                {new Date(lastSentAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </span>
          </div>
        )}

        {/* Status messages */}
        {error && (
          <StatusBadge type="error">⚠ {error}</StatusBadge>
        )}
        {successMsg && (
          <StatusBadge type="success">✓ {successMsg}</StatusBadge>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-1">
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || sending}
            className="
              inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500
              active:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150
            "
          >
            {saving ? <IconLoader /> : null}
            {saving ? 'Saving…' : 'Save Settings'}
          </button>

          {/* Send now */}
          <button
            onClick={handleSendNow}
            disabled={saving || sending}
            className="
              inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-800
              hover:bg-gray-700 active:bg-gray-600 px-4 py-2 text-sm font-semibold text-gray-300
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150
            "
          >
            {sending ? <IconLoader /> : <IconSend />}
            {sending ? 'Sending…' : 'Send Now'}
          </button>
        </div>

        {/* Info note */}
        <p className="text-xs text-gray-500 leading-relaxed">
          The digest includes ticket counts, resolution rates, SLA breaches, and an AI-generated
          performance summary. It is dispatched automatically on Monday mornings or manually
          via <strong className="text-gray-400">Send Now</strong>.
        </p>
      </div>
    </div>
  );
}
