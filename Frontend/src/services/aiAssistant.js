import { supabase } from "../lib/supabaseClient";

const buildConfigList = () => {
    const env = import.meta.env;
    const configs = [];

    const geminiModels = (env.VITE_AI_GEMINI_MODELS || 'gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash').split(',');
    geminiModels.forEach(model => {
        configs.push({ provider: 'gemini', model: model.trim() });
    });

    const openrouterModels = (env.VITE_AI_OPENROUTER_MODELS || 'meta-llama/llama-3.2-3b-instruct:free,microsoft/phi-3-mini-128k-instruct:free,mistralai/mistral-7b-instruct:free,google/gemma-2-9b-it:free').split(',');
    openrouterModels.forEach(model => {
        configs.push({ provider: 'openrouter', model: model.trim() });
    });

    const groqModels = (env.VITE_AI_GROQ_MODELS || 'llama-3.1-8b-instant,mixtral-8x7b-32768,gemma2-9b-it').split(',');
    groqModels.forEach(model => {
        configs.push({ provider: 'groq', model: model.trim() });
    });

    return configs;
};


const callProviderViaProxy = async (config, promptText, history, image) => {
    if (config.provider === 'gemini') {
        let formattedHistory = history.map(msg => {
            const parts = [{ text: msg.text || "" }];
            if (msg.image) {
                const [mime, data] = msg.image.split(';base64,');
                parts.push({ inlineData: { mimeType: mime.split(':')[1] || 'image/png', data } });
            }
            return { role: msg.role === 'bot' ? 'model' : 'user', parts };
        });

        const firstUserIdx = formattedHistory.findIndex(h => h.role === 'user');
        if (firstUserIdx > 0) formattedHistory = formattedHistory.slice(firstUserIdx);
        else if (firstUserIdx === -1) formattedHistory = [];

        const messageParts = [{ text: promptText }];
        if (image) {
            const [mime, data] = image.split(';base64,');
            messageParts.push({ inlineData: { mimeType: mime.split(':')[1] || 'image/png', data } });
        }

        const contents = [
            ...formattedHistory,
            { role: 'user', parts: messageParts }
        ];

        const { data, error } = await supabase.functions.invoke('ai-proxy', {
            body: { provider: 'gemini', model: config.model, messages: contents }
        });

        if (error) throw new Error(error.message || 'Gemini proxy error');
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    }

    const messages = history.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.text || ""
    }));

    const userContent = image
        ? [{ type: "text", text: promptText }, { type: "image_url", image_url: { url: image } }]
        : promptText;

    messages.push({ role: "user", content: userContent });

    const { data, error } = await supabase.functions.invoke('ai-proxy', {
        body: { provider: config.provider, model: config.model, messages }
    });

    if (error) throw new Error(error.message || `${config.provider} proxy error`);
    return data.choices?.[0]?.message?.content || "No response received.";
};

const runWithFailover = async (promptText, history, image) => {
    const configList = buildConfigList();
    if (configList.length === 0) throw new Error("No AI providers configured");

    for (let i = 0; i < configList.length; i++) {
        const config = configList[i];
        console.log(`[AI Failover] Trying ${i + 1}/${configList.length}: ${config.provider} (${config.model})`);

        try {
            return await callProviderViaProxy(config, promptText, history, image);
        } catch (error) {
            const isRateLimit = error.message?.includes('429')
                || error.message?.includes('quota')
                || error.message?.includes('RESOURCE_EXHAUSTED')
                || error.message?.includes('rate_limit');

            const isAuthError = error.message?.includes('401')
                || error.message?.includes('403')
                || error.message?.includes('API_KEY_INVALID')
                || error.message?.includes('API key expired')
                || error.message?.includes('invalid')
                || error.message?.includes('expired');

            if (isAuthError) {
                console.warn(`[AI Failover] Auth error for ${config.provider}, skipping remaining keys for this provider`);
                const nextSameProvider = configList.slice(i + 1).find(c => c.provider === config.provider);
                if (!nextSameProvider) {
                    const rest = configList.slice(i + 1).filter(c => c.provider !== config.provider);
                    i = configList.indexOf(rest[0]) - 1;
                    continue;
                }
            }

            console.warn(`[AI Failover] ${config.provider} (${config.model}): ${isRateLimit ? 'Quota exceeded' : error.message}`);
        }
    }

    throw new Error("QUOTA_EXCEEDED: All AI providers exhausted. Please wait a few minutes and try again.");
};

const localFallbackSummary = (issueText) => {
    const text = issueText.trim();
    const summary = (text.charAt(0).toUpperCase() + text.slice(1)).substring(0, 100) + (text.length > 100 ? '…' : '');
    return { summary, image_description: '' };
};


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
        console.warn('[analyzeTicketWithAI] All providers exhausted, using local fallback:', err.message);
        return localFallbackSummary(issueText);
    }
};
