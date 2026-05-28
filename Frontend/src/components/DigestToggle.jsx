import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // adjust path to match your project

export default function DigestToggle({ companyId }) {
  const [enabled, setEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSent, setLastSent] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from("company_settings")
        .select("digest_enabled, digest_admin_email, digest_last_sent")
        .eq("company_id", companyId)
        .single();
      if (data) {
        setEnabled(data.digest_enabled || false);
        setEmail(data.digest_admin_email || "");
        setLastSent(data.digest_last_sent);
      }
    }
    if (companyId) fetchSettings();
  }, [companyId]);

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    await supabase
      .from("company_settings")
      .upsert({
        company_id: companyId,
        digest_enabled: enabled,
        digest_admin_email: email,
      });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleSendNow() {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/digest/send-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          admin_email: email,
          company_name: "Your Company",
        }),
      });
      const data = await res.json();
      if (data.success) alert(`✅ Digest sent to ${email}!`);
      else alert("❌ Failed to send digest.");
    } catch (e) {
      alert("❌ Error: " + e.message);
    }
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            📊 Weekly Digest Email
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Receive an AI-generated performance report every Monday at 8AM
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            enabled ? "bg-indigo-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Digest recipient email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {lastSent && (
            <p className="text-xs text-gray-400">
              Last digest sent: {" "}
              {new Date(lastSent).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : success ? "✅ Saved!" : "Save Preference"}
            </button>
            <button
              onClick={handleSendNow}
              disabled={saving || !email}
              className="flex-1 border border-indigo-200 text-indigo-600 text-sm font-medium py-2 px-4 rounded-lg hover:bg-indigo-50 disabled:opacity-50 transition-colors"
            >
              Send Now (Test)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
