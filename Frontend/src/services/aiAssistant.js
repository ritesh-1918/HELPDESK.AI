import { GoogleGenerativeAI } from "@google/generative-ai";
import { API_CONFIG } from "../config";

// ============================================================
// MULTI-API FAILOVER CONFIGURATION
// Priority: Gemini Keys (1-4) → OpenRouter Keys (1-4) → Groq Keys (1-3)
// If a provider hits a 429 / quota / error, it tries the next automatically.
// ============================================================

const buildConfigList = () => {
    const env = import.meta.env;
    const configs = [];

    // Priority 1: Native Gemini — try modern flash models
    const geminiKeys = [
        env.VITE_GEMINI_API_KEY_1, env.VITE_GEMINI_API_KEY_2,
        env.VITE_GEMINI_API_KEY_3, env.VITE_GEMINI_API_KEY_4
    ].filter(Boolean);
    // Dynamically retrieve configured model slugs or fallback to stable defaults
    const geminiModels = (env.VITE_AI_GEMINI_MODELS || 'gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash').split(',');
    
    geminiKeys.forEach(key => {
        geminiModels.forEach(model => {
            configs.push({ provider: 'gemini', key, model: model.trim() });
        });
    });

    // Priority 2: OpenRouter — updated model slugs
    const openrouterKeys = [
        env.VITE_OPENROUTER_API_KEY_1, env.VITE_OPENROUTER_API_KEY_2,
        env.VITE_OPENROUTER_API_KEY_3, env.VITE_OPENROUTER_API_KEY_4,
    ].filter(Boolean);
    const openrouterModels = (env.VITE_AI_OPENROUTER_MODELS || 'meta-llama/llama-3.2-3b-instruct:free,microsoft/phi-3-mini-128k-instruct:free,mistralai/mistral-7b-instruct:free,google/gemma-2-9b-it:free').split(',');
    
    openrouterKeys.forEach((key, idx) => {
        const primaryModel = openrouterModels[idx % openrouterModels.length].trim();
        const secondaryModel = openrouterModels[(idx + 1) % openrouterModels.length].trim();
        configs.push({ provider: 'openrouter', key, model: primaryModel });
        configs.push({ provider: 'openrouter', key, model: secondaryModel });
    });

    // Priority 3: Groq — use stable models
    const groqKeys = [
        env.VITE_GROQ_API_KEY_1, env.VITE_GROQ_API_KEY_2, env.VITE_GROQ_API_KEY_3
    ].filter(Boolean);
    const groqModels = (env.VITE_AI_GROQ_MODELS || 'llama-3.1-8b-instant,mixtral-8x7b-32768,gemma2-9b-it').split(',');
    
    groqKeys.forEach((key, idx) => {
        configs.push({ provider: 'groq', key, model: groqModels[idx % groqModels.length].trim() });
    });

    return configs;
};


// ============================================================
// PROVIDER HANDLERS
// ============================================================

const callGemini = async (config, promptText, history, image) => {
    const genAI = new GoogleGenerativeAI(config.key);
    const model = genAI.getGenerativeModel({ model: config.model });

    let formattedHistory = history.map(msg => {
        const parts = [{ text: msg.text || "" }];
        if (msg.image) {
            const [mime, data] = msg.image.split(';base64,');
            parts.push({ inlineData: { mimeType: mime.split(':')[1] || 'image/png', data } });
        }
        return { role: msg.role === 'bot' ? 'model' : 'user', parts };
    });

    // Gemini requires history to start with 'user' role
    const firstUserIdx = formattedHistory.findIndex(h => h.role === 'user');
    if (firstUserIdx > 0) formattedHistory = formattedHistory.slice(firstUserIdx);
    else if (firstUserIdx === -1) formattedHistory = [];

    const chat = model.startChat({ history: formattedHistory, generationConfig: { maxOutputTokens: 2048 } });

    const messageParts = [{ text: promptText }];
    if (image) {
        const [mime, data] = image.split(';base64,');
        messageParts.push({ inlineData: { mimeType: mime.split(':')[1] || 'image/png', data } });
    }

    const result = await chat.sendMessage(messageParts);
    return result.response.text();
};

const callOpenAICompat = async (config, promptText, history, image, baseUrl, extraHeaders = {}) => {
    const messages = history.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.text || ""
    }));

    const userContent = image
        ? [{ type: "text", text: promptText }, { type: "image_url", image_url: { url: image } }]
        : promptText;

    messages.push({ role: "user", content: userContent });

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.key}`, ...extraHeaders },
        body: JSON.stringify({ model: config.model, messages, max_tokens: 2048 })
    });

    if (!response.ok) {
        const err = new Error(`HTTP ${response.status}`);
        err.status = response.status;
        throw err;
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response received.";
};

// Core failover runner — shared by both exported functions
const runWithFailover = async (promptText, history, image) => {
    const configList = buildConfigList();
    if (configList.length === 0) throw new Error("No AI API keys configured in .env");

    const blacklistedKeys = new Set();

    for (let i = 0; i < configList.length; i++) {
        const config = configList[i];
        if (blacklistedKeys.has(config.key)) {
            console.log(`[AI Failover] Skipping blacklisted key for ${config.provider} (${config.model})`);
            continue;
        }

        console.log(`[AI Failover] Trying ${i + 1}/${configList.length}: ${config.provider} (${config.model})`);

        try {
            if (config.provider === 'gemini') {
                return await callGemini(config, promptText, history, image);
            } else if (config.provider === 'openrouter') {
                return await callOpenAICompat(config, promptText, history, image,
                    'https://openrouter.ai/api/v1',
                    { 'HTTP-Referer': API_CONFIG.FRONTEND_URL, 'X-Title': 'AI Helpdesk' }
                );
            } else if (config.provider === 'groq') {
                return await callOpenAICompat(config, promptText, history, null, // Groq = text only
                    'https://api.groq.com/openai/v1'
                );
            }
        } catch (error) {
            const isRateLimit = error.status === 429
                || error.message?.includes('429')
                || error.message?.includes('quota')
                || error.message?.includes('RESOURCE_EXHAUSTED')
                || error.message?.includes('rate_limit');

            const isExpiredOrInvalid = error.message?.includes('API_KEY_INVALID')
                || error.message?.includes('API key expired')
                || error.message?.includes('invalid')
                || error.message?.includes('expired')
                || error.status === 401
                || error.status === 403;

            if (isExpiredOrInvalid) {
                blacklistedKeys.add(config.key);
                console.warn(`[AI Failover] Blacklisted invalid/expired key for ${config.provider}`);
            }

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
            confidence: parsed.confidence || 0.9
        };
    } catch (err) {
        // All providers failed — use smart local fallback so ticket flow never breaks
        console.warn('[analyzeTicketWithAI] All providers exhausted, using local fallback:', err.message);
        return localFallbackSummary(issueText);
    }
};
