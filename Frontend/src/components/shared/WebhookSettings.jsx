import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import useAuthStore from "../../store/authStore";

/**
 * WebhookSettings — Admin component to configure Slack/Teams webhook URL.
 * Stores webhook URL per company tenant in Supabase.
 */
const WebhookSettings = () => {
  const { profile } = useAuthStore();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  const companyId = profile?.company_id;

  useEffect(() => {
    const fetchSettings = async () => {
      if (!companyId) return;
      setFetching(true);
      try {
        const { data } = await supabase
          .from("webhook_settings")
          .select("webhook_url, is_enabled")
          .eq("company_id", companyId)
          .single();

        if (data) {
          setWebhookUrl(data.webhook_url || "");
          setIsEnabled(data.is_enabled || false);
        }
      } catch {
        console.log("No webhook settings found — first time setup");
      } finally {
        setFetching(false);
      }
    };

    fetchSettings();
  }, [companyId]);

  const detectPlatform = (url) => {
    if (url.includes("hooks.slack.com")) return "Slack";
    if (url.includes("webhook.office.com") || url.includes("outlook.office.com"))
      return "Microsoft Teams";
    return null;
  };

  const validateUrl = (url) => {
    if (!url) return false;
    return url.startsWith("https://") && detectPlatform(url) !== null;
  };

  const handleSave = async () => {
    if (!validateUrl(webhookUrl)) {
      setMessage({
        text: "❌ Please enter a valid Slack or Microsoft Teams webhook URL.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const { error } = await supabase.from("webhook_settings").upsert(
        {
          company_id: companyId,
          webhook_url: webhookUrl,
          is_enabled: isEnabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "company_id" }
      );

      if (error) throw error;

      setMessage({
        text: `✅ Webhook saved successfully for ${detectPlatform(webhookUrl)}!`,
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: `❌ Failed to save: ${err.message}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);

    if (webhookUrl) {
      await supabase.from("webhook_settings").upsert(
        {
          company_id: companyId,
          webhook_url: webhookUrl,
          is_enabled: newValue,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "company_id" }
      );
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const platform = detectPlatform(webhookUrl);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">Webhook Notifications</h3>
          <p className="text-gray-400 text-sm">Get critical ticket alerts in Slack or Microsoft Teams</p>
        </div>
      </div>

      {/* Webhook URL Input */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Webhook URL
        </label>
        <input
          type="url"
          value={webhookUrl}
          onChange={(e) => {
            setWebhookUrl(e.target.value);
            setMessage({ text: "", type: "" });
          }}
          placeholder="https://hooks.slack.com/... or https://outlook.office.com/webhook/..."
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        {/* Platform Detection Badge */}
        {platform && (
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              platform === "Slack"
                ? "bg-green-900 text-green-300"
                : "bg-blue-900 text-blue-300"
            }`}>
              ✓ {platform} webhook detected
            </span>
          </div>
        )}
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-800 rounded-lg">
        <div>
          <p className="text-white text-sm font-medium">Enable Notifications</p>
          <p className="text-gray-400 text-xs">
            Send alerts for Critical/High priority tickets
          </p>
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isEnabled ? "bg-blue-600" : "bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === "success"
            ? "bg-green-900/50 text-green-300 border border-green-700"
            : "bg-red-900/50 text-red-300 border border-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading || !webhookUrl}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Saving...
          </span>
        ) : (
          "Save Webhook Settings"
        )}
      </button>

      {/* Info */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-xs leading-relaxed">
          <span className="text-yellow-400 font-medium">ℹ️ How to get webhook URL: </span>
          For Slack: Create an Incoming Webhook in your Slack App settings.
          For Teams: Go to channel → Connectors → Incoming Webhook.
        </p>
      </div>
    </div>
  );
};

export default WebhookSettings;