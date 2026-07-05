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
