/**
 * TranslationBadge Component
 * 
 * Displays a language indicator badge when a ticket was translated from another language.
 * Shows the original language and provides a visual cue for multilingual tickets.
 */

import React from 'react';
import { Languages } from 'lucide-react';

const LANGUAGE_NAMES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'nl': 'Dutch',
  'pl': 'Polish',
  'tr': 'Turkish',
  'mr': 'Marathi',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
};

/**
 * TranslationBadge component
 * @param {Object} props
 * @param {string} props.detectedLanguage - ISO 639-1 language code (e.g., 'es', 'fr', 'hi')
 * @param {number} props.confidence - Translation confidence score (0-1)
 * @param {string} props.size - Badge size: 'small', 'medium', 'large'
 * @param {boolean} props.showIcon - Whether to show the translation icon
 */
export default function TranslationBadge({ 
  detectedLanguage, 
  confidence = null,
  size = 'medium',
  showIcon = true 
}) {
  // Don't show badge for English or if no language detected
  if (!detectedLanguage || detectedLanguage === 'en') {
    return null;
  }

  const languageName = LANGUAGE_NAMES[detectedLanguage] || detectedLanguage.toUpperCase();
  
  // Size variants
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full font-medium
        bg-blue-50 text-blue-700 border border-blue-200
        ${sizeClasses[size]}
      `}
      title={`Original language: ${languageName}${confidence ? ` (${Math.round(confidence * 100)}% confidence)` : ''}`}
    >
      {showIcon && <Languages className={iconSizes[size]} />}
      <span>Translated from {languageName}</span>
    </div>
  );
}

/**
 * TranslationIndicator - Compact version for ticket lists
 */
export function TranslationIndicator({ detectedLanguage }) {
  if (!detectedLanguage || detectedLanguage === 'en') {
    return null;
  }

  const languageName = LANGUAGE_NAMES[detectedLanguage] || detectedLanguage.toUpperCase();

  return (
    <div
      className="inline-flex items-center gap-1 text-xs text-gray-600"
      title={`Translated from ${languageName}`}
    >
      <Languages className="w-3 h-3" />
      <span>{languageName}</span>
    </div>
  );
}

/**
 * TranslationDetails - Detailed view showing original and translated text
 */
export function TranslationDetails({ 
  detectedLanguage, 
  originalText, 
  translatedText,
  confidence 
}) {
  if (!detectedLanguage || detectedLanguage === 'en' || !originalText) {
    return null;
  }

  const [showOriginal, setShowOriginal] = React.useState(false);
  const languageName = LANGUAGE_NAMES[detectedLanguage] || detectedLanguage.toUpperCase();

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-semibold text-blue-900">
            Multilingual Ticket
          </h4>
        </div>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showOriginal ? 'Show Translation' : 'Show Original'}
        </button>
      </div>
      
      <div className="text-sm text-blue-800 mb-2">
        <span className="font-medium">Original Language:</span> {languageName}
        {confidence && (
          <span className="ml-2 text-blue-600">
            ({Math.round(confidence * 100)}% confidence)
          </span>
        )}
      </div>

      {showOriginal ? (
        <div className="mt-3 p-3 bg-white rounded border border-blue-100">
          <div className="text-xs font-semibold text-gray-600 mb-2">
            Original Text ({languageName}):
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{originalText}</p>
        </div>
      ) : (
        translatedText && (
          <div className="mt-3 p-3 bg-white rounded border border-blue-100">
            <div className="text-xs font-semibold text-gray-600 mb-2">
              Translated to English:
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{translatedText}</p>
          </div>
        )
      )}
    </div>
  );
}
