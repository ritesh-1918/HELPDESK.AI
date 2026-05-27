/**
 * translationService.js
 * Uses the free MyMemory Translation API (https://mymemory.translated.net)
 * - No API key required for basic usage (5000 word/day limit)
 * - Supports 60+ language pairs
 */

// Supported language codes
export const SUPPORTED_LANGUAGES = [
    { code: 'en', label: '🇬🇧 English', nativeName: 'English' },
    { code: 'hi', label: '🇮🇳 Hindi', nativeName: 'हिन्दी' },
    { code: 'te', label: '🇮🇳 Telugu', nativeName: 'తెలుగు' },
    { code: 'ta', label: '🇮🇳 Tamil', nativeName: 'தமிழ்' },
    { code: 'kn', label: '🇮🇳 Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', label: '🇮🇳 Malayalam', nativeName: 'മലയാളം' },
    { code: 'mr', label: '🇮🇳 Marathi', nativeName: 'मराठी' },
    { code: 'bn', label: '🇮🇳 Bengali', nativeName: 'বাংলা' },
    { code: 'fr', label: '🇫🇷 French', nativeName: 'Français' },
    { code: 'de', label: '🇩🇪 German', nativeName: 'Deutsch' },
    { code: 'es', label: '🇪🇸 Spanish', nativeName: 'Español' },
    { code: 'ar', label: '🇸🇦 Arabic', nativeName: 'العربية' },
];

/**
 * Translates text using the MyMemory API.
 * @param {string} text - The text to translate
 * @param {string} fromLang - Source language code (e.g., 'hi')
 * @param {string} toLang   - Target language code (e.g., 'en')
 * @returns {Promise<string>} - Translated text
 */
export async function translateText(text, fromLang = 'en', toLang = 'en') {
    if (!text?.trim() || fromLang === toLang) return text;

    try {
        const langPair = `${fromLang}|${toLang}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Translation API error: ${response.status}`);

        const data = await response.json();

        if (data.responseStatus === 200) {
            return data.responseData.translatedText;
        }
        throw new Error(data.responseDetails || 'Translation failed');
    } catch (err) {
        console.error('[translationService] Translation error:', err);
        // Graceful degradation — return original text on failure
        return text;
    }
}

/**
 * Client-side language detection using Unicode script heuristics
 */
export function detectLanguageClient(text) {
    if (!text || text.trim().length < 3) return null;
    
    const scripts = [
        { lang: 'hi', name: 'Hindi', pattern: /[\u0900-\u097F]/ },
        { lang: 'te', name: 'Telugu', pattern: /[\u0C00-\u0C7F]/ },
        { lang: 'ta', name: 'Tamil', pattern: /[\u0B80-\u0BFF]/ },
        { lang: 'kn', name: 'Kannada', pattern: /[\u0C80-\u0CFF]/ },
        { lang: 'ml', name: 'Malayalam', pattern: /[\u0D00-\u0D7F]/ },
        { lang: 'bn', name: 'Bengali', pattern: /[\u0980-\u09FF]/ },
        { lang: 'ar', name: 'Arabic', pattern: /[\u0600-\u06FF]/ },
        { lang: 'zh', name: 'Chinese', pattern: /[\u4E00-\u9FFF]/ },
        { lang: 'ja', name: 'Japanese', pattern: /[\u3040-\u309F\u30A0-\u30FF]/ },
        { lang: 'ko', name: 'Korean', pattern: /[\uAC00-\uD7AF\u1100-\u11FF]/ },
        { lang: 'th', name: 'Thai', pattern: /[\u0E00-\u0E7F]/ },
        { lang: 'ru', name: 'Russian', pattern: /[\u0400-\u04FF]/ },
    ];
    
    for (const { lang, name, pattern } of scripts) {
        const matches = text.match(new RegExp(pattern.source, 'g'));
        if (matches && matches.length > text.length * 0.2) {
            return { code: lang, name, confidence: 0.85 };
        }
    }
    
    return { code: 'en', name: 'English', confidence: 0.5 };
}

export function getLanguageName(code) {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? lang.nativeName : code;
}

export function getLanguageFlag(code) {
    const flags = { en: '🇬🇧', hi: '🇮🇳', te: '🇮🇳', ta: '🇮🇳', kn: '🇮🇳', ml: '🇮🇳', mr: '🇮🇳', bn: '🇮🇳', fr: '🇫🇷', de: '🇩🇪', es: '🇪🇸', pt: '🇧🇷', it: '🇮🇹', ru: '🇷🇺', zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷', th: '🇹🇭', vi: '🇻🇳', tr: '🇹🇷', nl: '🇳🇱', pl: '🇵🇱', sv: '🇸🇪', ar: '🇸🇦' };
    return flags[code] || '🌐';
}
