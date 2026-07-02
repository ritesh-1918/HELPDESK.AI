/**
 * AI assistant service — all provider calls go through the Supabase `ai-proxy`
 * edge function. API keys live exclusively in Supabase Secrets and are never
 * shipped to the browser bundle.
 */
import { supabase } from '../lib/supabaseClient';

// Ordered provider/model attempts. The proxy handles key-level failover internally.
const PROVIDER_SEQUENCE = [
  { provider: 'gemini',      model: 'gemini-2.0-flash' },
  { provider: 'gemini',      model: 'gemini-2.5-flash-lite' },
  { provider: 'openrouter',  model: 'meta-llama/llama-3.2-3b-instruct:free' },
  { provider: 'openrouter',  model: 'mistralai/mistral-7b-instruct:free' },
  { provider: 'groq',        model: 'llama-3.1-8b-instant' },
  { provider: 'groq',        model: 'gemma2-9b-it' },
];

/**
 * Call the ai-proxy edge function for a single provider/model combination.
 * Returns the text response string, or throws on failure.
 */
const callProxy = async ({ provider, model, messages }) => {
  const { data, error } = await supabase.functions.invoke('ai-proxy', {
    body: { provider, model, messages },
  });

  if (error) throw new Error(error.message || 'Proxy invocation failed');

  // Normalise Gemini and OpenAI-compatible response shapes
  if (provider === 'gemini') {
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty Gemini response');
    return text;
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from provider');
  return text;
};

/**
 * Try each provider in sequence until one succeeds.
 * Falls through on any error so transient failures don't abort the flow.
 */
const runWithFailover = async (messages) => {
  let lastError;

  for (const config of PROVIDER_SEQUENCE) {
    try {
      return await callProxy({ ...config, messages });
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error('All AI providers exhausted');
};

// Local text-only fallback used when every provider fails
const localFallbackSummary = (issueText) => {
  const text = issueText.trim();
  const summary =
    (text.charAt(0).toUpperCase() + text.slice(1)).substring(0, 100) +
    (text.length > 100 ? '…' : '');
  return { summary, image_description: '' };
};

// ─── Build messages ──────────────────────────────────────────────────────────

const buildChatMessages = (promptText, history, image) => {
  const msgs = history.map((msg) => ({
    role: msg.role === 'bot' ? 'assistant' : 'user',
    content: msg.text || '',
  }));

  const userContent = image
    ? [
        { type: 'text', text: promptText },
        { type: 'image_url', image_url: { url: image } },
      ]
    : promptText;

  msgs.push({ role: 'user', content: userContent });
  return msgs;
};

const buildAnalysisMessages = (issueText, ocrText, image) => {
  const imageNote = ocrText
    ? `\nExtracted text from uploaded screenshot: "${ocrText}"`
    : '';
  const imageInstruction = image
    ? '\nAn image has also been provided. Analyse it and describe the visible error or issue.'
    : '';

  const prompt = `You are an enterprise IT analyst. Given the following user-reported issue, do three things:
1. Write a concise one-line summary (max 100 chars) of the core technical problem.
2. If an image is provided, describe the visible error/UI state in one sentence.
3. Classify the ticket accurately, regardless of the language it is written in.

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

  const userContent = image
    ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: image } }]
    : prompt;

  return [{ role: 'user', content: userContent }];
};

// ─── Exports ─────────────────────────────────────────────────────────────────

/**
 * Chat-mode assistant — used by the ticket troubleshooting chat widget.
 */
export const askAI = async (prompt, ticketContext, history = [], image = null) => {
  const systemContent = `You are an expert enterprise IT troubleshooting assistant.
Your goal is to guide the user to a resolution with extreme clarity and professionalism.

STRICT FORMATTING RULES:
1. Use **markdown** for all responses.
2. Use **bold headers** for main steps.
3. Use - bulleted lists for options or details within a step.
4. Use \`code blocks\` for terminal commands, paths, or specific UI elements.
5. Keep the tone helpful, concise, and structured.
6. If you need to ask multiple questions, use a bulleted list.

Context:
- Summary: ${ticketContext?.summary || 'N/A'}
- Category: ${ticketContext?.category || 'N/A'}
- Subcategory: ${ticketContext?.subcategory || 'N/A'}
- Entities: ${JSON.stringify(ticketContext?.entities || [])}
- OCR Text: ${ticketContext?.ocr_text || 'None'}`;

  const effectivePrompt =
    history.length === 0
      ? `${systemContent}\n\nUSER REQUEST: ${prompt}`
      : `${prompt}\n\n(Reminder: Follow all system formatting and context rules)`;

  const messages = buildChatMessages(effectivePrompt, history, image);
  return runWithFailover(messages);
};

/**
 * Ticket analysis — used by AIProcessing to generate summary and classification.
 */
export const analyzeTicketWithAI = async (issueText, ocrText = '', image = null) => {
  try {
    const messages = buildAnalysisMessages(issueText, ocrText, image);
    const raw = await runWithFailover(messages);

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
    };
  } catch (err) {
    console.warn('[analyzeTicketWithAI] All providers exhausted, using local fallback:', err?.message);
    return localFallbackSummary(issueText);
  }
};
