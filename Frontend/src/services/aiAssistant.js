import { API_CONFIG } from "../config";

const jsonHeaders = {
    "Content-Type": "application/json"
};

const localFallbackSummary = (issueText) => {
    const text = (issueText || "").trim();
    const normalized = text || "Support request";
    const summary = normalized.substring(0, 100) + (normalized.length > 100 ? "…" : "");

    return {
        summary,
        image_description: ""
    };
};

const handleJsonResponse = async (response, fallbackMessage) => {
    if (!response.ok) {
        const details = await response.text().catch(() => "");
        throw new Error(details || fallbackMessage || `HTTP ${response.status}`);
    }

    return response.json();
};

const formatTroubleshootReply = (payload) => {
    const sections = [payload.step_text?.trim() || "AI Troubleshooting is currently unavailable."];

    if (Array.isArray(payload.options) && payload.options.length > 0) {
        sections.push("**Options**");
        sections.push(payload.options.map((option) => `- ${option}`).join("\n"));
    }

    if (payload.is_final) {
        sections.push("_This is the final suggested step._");
    }

    return sections.filter(Boolean).join("\n\n");
};

const buildTroubleshootHistory = (history = []) =>
    history.map((message) => ({
        role: message.role,
        text: message.text || "",
        image: message.image || null
    }));

export const askAI = async (prompt, ticketContext, history = [], image = null) => {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/ai/troubleshoot`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
            text: prompt,
            category: ticketContext?.category || "General",
            history: buildTroubleshootHistory(
                image ? [...history, { role: "user", text: prompt, image }] : history
            )
        })
    });

    const payload = await handleJsonResponse(
        response,
        "Unable to fetch troubleshooting response."
    );

    return formatTroubleshootReply(payload);
};

export const analyzeTicketWithAI = async (issueText, ocrText = "", image = null) => {
    try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}/ai/analyze`, {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify({
                text: issueText,
                image_text: ocrText,
                image_base64: image || ""
            })
        });

        const payload = await handleJsonResponse(
            response,
            "Unable to analyze ticket."
        );

        return {
            summary: payload.summary || issueText.substring(0, 100),
            image_description: payload.image_description || "",
            category: payload.category,
            subcategory: payload.subcategory,
            priority: payload.priority,
            assigned_team: payload.assigned_team,
            confidence: payload.confidence || 0.9
        };
    } catch (error) {
        console.warn("[analyzeTicketWithAI] Backend analysis unavailable, using local fallback:", error.message);
        return localFallbackSummary(issueText);
    }
};
