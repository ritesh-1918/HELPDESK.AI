import { supabase } from "../lib/supabaseClient";

// ============================================================
// MULTI-API FAILOVER CONFIGURATION
// Priority: Gemini Keys (1-4) → OpenRouter Keys (1-4) → Groq Keys (1-3)
// If a provider hits a 429 / quota / error, it tries the next automatically.
// ============================================================

const buildConfigList = () => {
    const configs = [];

    // Priority 1: Native Gemini — try modern flash models
    configs.push(
        { provider: 'gemini', model: 'gemini-2.5-flash' },
        { provider: 'gemini', model: 'gemini-2.5-flash-lite' },
        { provider: 'gemini', model: 'gemini-2.0-flash' }
    );

    // Priority 2: OpenRouter — updated model slugs (verified working as of 2025)
    const openrouterModels = [
        'meta-llama/llama-3.2-3b-instruct:free',
        'microsoft/phi-3-mini-128k-instruct:free',
        'mistralai/mistral-7b-instruct:free',
        'google/gemma-2-9b-it:free',
    ];
    openrouterModels.forEach((model) => {
        configs.push({ provider: 'openrouter', model });
    });

    // Priority 3: Groq — use stable, currently-available models
    const groqModels = ['llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    groqModels.forEach((model) => {
        configs.push({ provider: 'groq', model });
    });

    return configs;
};


// ============================================================
// PROVIDER HANDLERS
// ============================================================

const buildGeminiMessages = (promptText, history, image) => {
    const formattedHistory = history.map(msg => {
        const parts = [{ text: msg.text || "" }];
        if (msg.image) {
            const [mime, data] = msg.image.split(';base64,');
            parts.push({ inlineData: { mimeType: mime.split(':')[1] || 'image/png', data } });
        }
        return { role: msg.role === 'bot' ? 'model' : 'user', parts };
    });

    const messageParts = [{ text: promptText }];
    if (image) {
        const [mime, data] = image.split(';base64,');
        messageParts.push({ inlineData: { mimeType: mime.split(':')[1] || 'image/png', data } });
    }

    return formattedHistory.length > 0
        ? [...formattedHistory, { role: 'user', parts: messageParts }]
        : [{ role: 'user', parts: messageParts }];
};

const buildOpenAICompatMessages = (promptText, history, image) => {
    const messages = history.map(msg => {
        const content = msg.image
            ? [
                { type: 'text', text: msg.text || '' },
                { type: 'image_url', image_url: { url: msg.image } }
            ]
            : msg.text || '';

        return {
            role: msg.role === 'bot' ? 'assistant' : 'user',
            content,
        };
    });

    const userContent = image
        ? [{ type: "text", text: promptText }, { type: "image_url", image_url: { url: image } }]
        : promptText;

    messages.push({ role: "user", content: userContent });
    return messages;
};

const extractResponseText = (data) => {
    if (typeof data === 'string') return data;
    if (!data || typeof data !== 'object') return '';

    const openAiContent = data.choices?.[0]?.message?.content;
    if (typeof openAiContent === 'string') return openAiContent;
    if (Array.isArray(openAiContent)) {
        return openAiContent
            .map(part => part?.text || part?.content || '')
            .filter(Boolean)
            .join('');
    }

    const geminiParts = data.candidates?.[0]?.content?.parts;
    if (Array.isArray(geminiParts)) {
        return geminiParts
            .map(part => part?.text || '')
            .filter(Boolean)
            .join('');
    }

    if (typeof data.candidates?.[0]?.content === 'string') {
        return data.candidates[0].content;
    }

    if (typeof data.text === 'string') return data.text;

    return '';
};

const callProxy = async (config, promptText, history, image) => {
    const body = config.provider === 'gemini'
        ? {
            provider: config.provider,
            model: config.model,
            messages: buildGeminiMessages(promptText, history, image),
        }
        : {
            provider: config.provider,
            model: config.model,
            messages: buildOpenAICompatMessages(promptText, history, config.provider === 'groq' ? null : image),
        };

    const { data, error } = await supabase.functions.invoke('ai-proxy', { body });

    if (error) {
        const invokeError = new Error(error.message || 'AI proxy request failed');
        invokeError.status = error.status || error?.context?.status;
        throw invokeError;
    }

    const responseText = extractResponseText(data);
    if (!responseText) {
        throw new Error(`No response received from ${config.provider}`);
    }

    return responseText;
};

// Core failover runner — shared by both exported functions
const runWithFailover = async (promptText, history, image) => {
    const configList = buildConfigList();
    if (configList.length === 0) throw new Error("No AI providers configured");

    for (let i = 0; i < configList.length; i++) {
        const config = configList[i];
        console.log(`[AI Failover] Trying ${i + 1}/${configList.length}: ${config.provider} (${config.model})`);

        try {
            return await callProxy(config, promptText, history, image);
        } catch (error) {
            const isRateLimit = error.status === 429
                || error.message?.includes('429')
                || error.message?.includes('quota')
                || error.message?.includes('RESOURCE_EXHAUSTED')
                || error.message?.includes('rate_limit');

            console.warn(`[AI Failover] ❌ ${config.provider} key ${i + 1}: ${isRateLimit ? 'Quota exceeded' : error.message}`);
        }
    }

    throw new Error("QUOTA_EXCEEDED: All AI API keys exhausted. Please wait a few minutes and try again.");
};

// ─── Smart offline fallback (used when ALL providers fail) ───────────────────
// Generates a reasonable ticket summary locally so the flow never fully breaks.
const localFallbackSummary = (issueText) => {
    const text = issueText.trim();
    // Capitalise first letter, truncate at 100 chars
    const summary = (text.charAt(0).toUpperCase() + text.slice(1)).substring(0, 100) + (text.length > 100 ? '…' : '');
    return { summary, image_description: '' };
};

const getSlaBreachAt = (priority = 'Medium') => {
    const hoursMap = { Critical: 2, High: 8, Medium: 24, Low: 72 };
    const slaHours = hoursMap[priority] || 24;
    return new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
};


// ============================================================
// EXPORT 1: askAI — Used by the chat troubleshooting assistant
// ============================================================
export const askAI = async (prompt, ticketContext, history = [], image = null) => {
    const systemPrompt = `You are an expert enterprise IT troubleshooting assistant.
Your goal is to guide the user to a resolution with extreme clarity and professionalism.

STRICT FORMATTING RULES:
1. Use **markdown** for all responses.
2. Use **bold headers** for main steps.
3. Use - bulleted lists for options or details within a step.
4. Use \`code blocks\` or \`inline code\` for all terminal commands, paths, or specific UI elements.
5. Keep the tone helpful, concise, and structured. Avoid long blocks of text.
6. If you need to ask multiple questions, use a bulleted list.

Context:
- Summary: ${ticketContext?.summary || 'N/A'}
- Category: ${ticketContext?.category || 'N/A'}
- Subcategory: ${ticketContext?.subcategory || 'N/A'}
- Entities: ${JSON.stringify(ticketContext?.entities || [])}
- OCR Text: ${ticketContext?.ocr_text || 'None'}`;

    const effectivePrompt = history.length === 0
        ? `${systemPrompt}\n\nUSER REQUEST: ${prompt}`
        : `${prompt}\n\n(Reminder: Follow all system formatting and context rules)`;

    return runWithFailover(effectivePrompt, history, image);
};

// ============================================================
// EXPORT 2: analyzeTicketWithAI — Used in AIProcessing.jsx
// Generates a smart AI summary and optional image description.
// ============================================================
export const analyzeTicketWithAI = async (issueText, ocrText = '', image = null) => {
    const imageNote = ocrText ? `\nExtracted text from uploaded screenshot: "${ocrText}"` : '';
    const imageInstruction = image
        ? '\nAn image has also been provided. Analyze it and describe the visible error or issue.'
        : '';

    const prompt = `You are an enterprise IT analyst. Given the following user-reported issue, do three things:
1. Write a concise one-line summary (max 100 chars) of the core technical problem.
2. If an image is provided, describe the visible error/UI state in one sentence.
3. Classify the ticket accurately, regardless of the language it is written in (translate internally if needed).

Respond in this EXACT JSON format (no markdown, just raw JSON):
{
  "summary": "...",
  "image_description": "...",
  "category": "...",
  "subcategory": "...",
  "priority": "...",
  "assigned_team": "...",
  "confidence": 0.95
}

User Issue: "${issueText}"${imageNote}${imageInstruction}`;

    try {
        const raw = await runWithFailover(prompt, [], image);

        // Strip any markdown code fences the model might add
        const cleaned = raw.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
            summary: parsed.summary || issueText.substring(0, 100),
            image_description: parsed.image_description || '',
            category: parsed.category,
            subcategory: parsed.subcategory,
            priority: parsed.priority,
            assigned_team: parsed.assigned_team,
            confidence: parsed.confidence || 0.9,
            sla_breach_at: getSlaBreachAt(parsed.priority)
        };
    } catch (err) {
        // All providers failed — use smart local fallback so ticket flow never breaks
        console.warn('[analyzeTicketWithAI] All providers exhausted, using local fallback:', err.message);
        return {
            ...localFallbackSummary(issueText),
            sla_breach_at: getSlaBreachAt()
        };
    }
};
