# Multi-Language Ticket Support with Auto-Detection and Translation Pipeline

## Overview

This feature adds comprehensive multilingual support to the HELPDESK.AI system, enabling users to submit tickets in their native language while maintaining high-quality AI classification through automatic translation.

## Features

### 1. **Automatic Language Detection**
- Detects the language of incoming ticket text
- Uses `langdetect` library for robust detection
- Supports 15+ languages including:
  - English (en), Spanish (es), French (fr), German (de), Italian (it)
  - Portuguese (pt), Russian (ru), Chinese (zh), Japanese (ja), Korean (ko)
  - Arabic (ar), Hindi (hi), Dutch (nl), Polish (pl), Turkish (tr)
  - Marathi (mr), Bengali (bn), Tamil (ta), Telugu (te)

### 2. **Automatic Translation Pipeline**
- Non-English tickets are automatically translated to English
- Translation happens before AI classification to ensure high accuracy
- Uses MyMemory Translation API and HuggingFace MarianMT models
- Preserves both original and translated text

### 3. **Enhanced Ticket Response**
- Returns detected language code
- Includes original text (for non-English tickets)
- Includes translated English text
- Provides translation confidence score

### 4. **Configurable Per-Company**
- Translation can be enabled/disabled per company via `system_settings`
- Enabled by default
- Allows companies to opt-out if not needed

### 5. **Frontend Translation Indicators**
- `TranslationBadge`: Shows "Translated from [Language]" badge
- `TranslationIndicator`: Compact language indicator for lists
- `TranslationDetails`: Expandable view showing original and translated text

## Database Schema

### system_settings Table
```sql
ALTER TABLE system_settings ADD COLUMN enable_translation boolean NOT NULL DEFAULT true;
```

### tickets Table
```sql
ALTER TABLE tickets ADD COLUMN detected_language text;
ALTER TABLE tickets ADD COLUMN original_text text;
ALTER TABLE tickets ADD COLUMN translated_from text;

CREATE INDEX idx_tickets_detected_language
    ON tickets(detected_language)
    WHERE detected_language IS NOT NULL AND detected_language != 'en';
```

## API Changes

### TicketResponse Model (backend/schemas.py)
```python
class TicketResponse(BaseModel):
    # ... existing fields ...
    
    # Translation fields
    detected_language: str | None = None
    original_text: str | None = None
    translated_text: str | None = None
    translation_confidence: float | None = None
```

### System Settings (backend/dependencies.py)
```python
def get_system_settings(company_id: str) -> dict:
    defaults = {
        #... existing settings ...
        "enable_translation": True  # New field
    }
```

## Implementation Details

### Backend Flow

1. **Ticket Submission** (`/ai/analyze` endpoint)
   - Check if `enable_translation` is True in system settings
   - Detect language using `detect_language(text)`
   - If language is not 'en':
     - Call `translate_text(text, target_lang='en', source_lang=detected_lang)`
     - Store original text
     - Use translated text for classification
   - If language is 'en' or translation disabled:
     - Proceed with original text

2. **Language Detection** (backend/services/translation_service.py)
   - Uses `langdetect` library
   - Returns ISO 639-1 language code (e.g., 'es', 'fr', 'hi')
   - Falls back to 'en' on error

3. **Translation** (backend/services/translation_service.py)
   - Supports MyMemory API and HuggingFace MarianMT
   - Caches translations to avoid repeated API calls
   - Returns dict with:
     - `translated`: Translated text
     - `source_lang`: Original language
     - `target_lang`: Target language
     - `confidence`: Translation confidence (0-1)
     - `detected_locale`: Detected language code

4. **Classification**
   - Always performed on English text (original or translated)
   - Maintains high accuracy regardless of input language
   - Confidence scores reflect classification accuracy, not translation

### Frontend Components

#### TranslationBadge
```jsx
import { TranslationBadge } from '@/components/shared/TranslationBadge';

<TranslationBadge 
  detectedLanguage="es"
  confidence={0.95}
  size="medium"
  showIcon={true}
/>
```

#### TranslationIndicator (for lists)
```jsx
import { TranslationIndicator } from '@/components/shared/TranslationBadge';

<TranslationIndicator detectedLanguage="hi" />
```

#### TranslationDetails (expanded view)
```jsx
import { TranslationDetails } from '@/components/shared/TranslationBadge';

<TranslationDetails
  detectedLanguage="fr"
  originalText="Mon ordinateur ne démarre pas"
  translatedText="My computer won't start"
  confidence={0.92}
/>
```

## Usage Examples

### Example 1: Spanish Ticket Submission
```javascript
// User submits: "Mi computadora no enciende"
POST /ai/analyze
{
  "text": "Mi computadora no enciende",
  "company": "company-1"
}

// Response includes:
{
  "category": "Hardware",
  "subcategory": "Power Issues",
  "priority": "High",
  "confidence": 0.88,
  "detected_language": "es",
  "original_text": "Mi computadora no enciende",
  "translated_text": "My computer won't start",
  "translation_confidence": 0.95,
  ...
}
```

### Example 2: Hindi Ticket Submission
```javascript
// User submits: "मेरा कंप्यूटर चालू नहीं हो रहा है"
POST /ai/analyze
{
  "text": "मेरा कंप्यूटर चालू नहीं हो रहा है",
  "company": "company-1"
}

// Response includes:
{
  "category": "Hardware",
  "subcategory": "Power Issues",
  "priority": "High",
  "confidence": 0.85,
  "detected_language": "hi",
  "original_text": "मेरा कंप्यूटर चालू नहीं हो रहा है",
  "translated_text": "My computer is not turning on",
  "translation_confidence": 0.92,
  ...
}
```

### Example 3: Disable Translation for Company
```sql
-- In system_settings table
UPDATE system_settings
SET enable_translation = false
WHERE company_id = 'company-xyz';
```

Now all tickets from company-xyz will skip translation step.

## Performance Considerations

- **Translation Caching**: Translations are cached to avoid repeated API calls for identical text
- **Fast Detection**: Language detection is lightweight (~10ms)
- **Async Translation**: Translation doesn't block other analysis steps
- **Fallback**: If translation fails, original text is used (prevents complete failure)

## Error Handling

1. **Translation API Unavailable**
   - Falls back to original text
   - Classification proceeds with potentially lower confidence
   - Error logged but doesn't break ticket submission

2. **Language Detection Failure**
   - Assumes English ('en')
   - Proceeds without translation
   - No user-facing error

3. **Invalid Language Code**
   - Falls back to original text
   - Logs warning
   - Ticket processing continues

## Testing

Comprehensive test suite in `backend/tests/test_multi_language_integration.py`:
- Language detection for English, Spanish, Hindi
- Translation pipeline integration
- Translation can be disabled
- Error handling and fallbacks
- Response model includes translation fields

Run tests:
```bash
python -m pytest backend/tests/test_multi_language_integration.py -v
```

## Configuration

### Enable/Disable Translation
```python
# In backend/dependencies.py
defaults = {
    "enable_translation": True  # Set to False to disable globally
}
```

### Supported Languages
Defined in `backend/services/translation_service.py`:
```python
SUPPORTED_LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "ar": "Arabic",
    "hi": "Hindi",
    "nl": "Dutch",
    "pl": "Polish",
    "tr": "Turkish",
}
```

## Future Enhancements

Potential improvements:
- **Real-time Translation Toggle**: Allow users to switch between original and translated views
- **Response Translation**: Translate agent responses back to user's language
- **Language Preference**: Store user's preferred language in profile
- **Translation Quality Feedback**: Allow users to report translation issues
- **More Languages**: Add support for additional languages based on demand
- **Multilingual Training**: Train classification models on multilingual data

## Related Issues

- Issue #3198: [FEATURE] Add Multi-Language Ticket Support with Auto-Detection and Translation Pipeline

## Files Changed

1. `backend/routers/ai.py` - Added language detection and translation to analyze_only
2. `backend/schemas.py` - Added translation fields to TicketResponse
3. `backend/dependencies.py` - Added enable_translation to system settings
4. `supabase/migrations/20260708000000_add_multi_language_support.sql` - Database migration
5. `Frontend/src/components/shared/TranslationBadge.jsx` - Frontend translation indicators
6. `backend/tests/test_multi_language_integration.py` - Comprehensive test suite
7. `docs/MULTI_LANGUAGE_SUPPORT.md` - This documentation file

## Dependencies

- `langdetect`: Language detection library (already in requirements.txt)
- `backend.services.translation_service`: Existing translation service (no new dependencies)

## Security Considerations

- Original text stored in database for audit purposes
- Translation API calls don't expose sensitive user data beyond ticket content
- Language detection happens server-side (no client-side manipulation)
- RLS policies apply equally to original and translated text
