export interface DetectedLanguageResult {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  confidence: number; // e.g. 0.98 for 98%
  sampleDetectedGlyph?: string;
  method: 'unicode_script' | 'lexical_ngram' | 'fallback';
}

/**
 * Mock Language Detection Service for TalkBridge AI.
 * Simulates on-device neural language identification (similar to Google ML Kit Language ID
 * and W3C Chrome Translation API) to instantly classify chat messages.
 */
export function detectLanguage(text: string): DetectedLanguageResult {
  if (!text || !text.trim()) {
    return {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      confidence: 0.5,
      method: 'fallback',
    };
  }

  const clean = text.trim();

  // 1. Unicode Script Analyzers for distinct non-Latin alphabets
  // Bengali: U+0980 to U+09FF
  if (/[\u0980-\u09FF]/.test(clean)) {
    const bengaliChars = (clean.match(/[\u0980-\u09FF]/g) || []).length;
    const confidence = Math.min(0.99, 0.85 + (bengaliChars / clean.length) * 0.15);
    return {
      code: 'bn',
      name: 'Bengali',
      nativeName: 'বাংলা',
      flag: '🇧🇩',
      confidence: parseFloat(confidence.toFixed(2)),
      sampleDetectedGlyph: 'বাংলা লিপি',
      method: 'unicode_script',
    };
  }

  // Devanagari (Hindi, Marathi): U+0900 to U+097F
  if (/[\u0900-\u097F]/.test(clean)) {
    const devanagariChars = (clean.match(/[\u0900-\u097F]/g) || []).length;
    const confidence = Math.min(0.99, 0.85 + (devanagariChars / clean.length) * 0.15);
    return {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      confidence: parseFloat(confidence.toFixed(2)),
      sampleDetectedGlyph: 'देवनागरी',
      method: 'unicode_script',
    };
  }

  // Arabic / Urdu: U+0600 to U+06FF
  if (/[\u0600-\u06FF]/.test(clean)) {
    const isUrduSpecific = /[\u067E\u0686\u0698\u06AF\u06D2]/.test(clean);
    return {
      code: isUrduSpecific ? 'ur' : 'ar',
      name: isUrduSpecific ? 'Urdu' : 'Arabic',
      nativeName: isUrduSpecific ? 'اردو' : 'العربية',
      flag: isUrduSpecific ? '🇵🇰' : '🇸🇦',
      confidence: 0.97,
      method: 'unicode_script',
    };
  }

  // Japanese: Hiragana / Katakana / Kanji
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(clean)) {
    return {
      code: 'ja',
      name: 'Japanese',
      nativeName: '日本語',
      flag: '🇯🇵',
      confidence: 0.99,
      method: 'unicode_script',
    };
  }

  // Korean Hangul: U+AC00 to U+D7AF
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(clean)) {
    return {
      code: 'ko',
      name: 'Korean',
      nativeName: '한국어',
      flag: '🇰🇷',
      confidence: 0.99,
      method: 'unicode_script',
    };
  }

  // Chinese: U+4E00 to U+9FFF
  if (/[\u4E00-\u9FFF]/.test(clean)) {
    return {
      code: 'zh',
      name: 'Chinese',
      nativeName: '中文',
      flag: '🇨🇳',
      confidence: 0.96,
      method: 'unicode_script',
    };
  }

  // Cyrillic (Russian): U+0400 to U+04FF
  if (/[\u0400-\u04FF]/.test(clean)) {
    return {
      code: 'ru',
      name: 'Russian',
      nativeName: 'Русский',
      flag: '🇷🇺',
      confidence: 0.98,
      method: 'unicode_script',
    };
  }

  // Tamil: U+0B80 to U+0BFF
  if (/[\u0B80-\u0BFF]/.test(clean)) {
    return {
      code: 'ta',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      flag: '🇮🇳',
      confidence: 0.98,
      method: 'unicode_script',
    };
  }

  // Telugu: U+0C00 to U+0C7F
  if (/[\u0C00-\u0C7F]/.test(clean)) {
    return {
      code: 'te',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      flag: '🇮🇳',
      confidence: 0.98,
      method: 'unicode_script',
    };
  }

  // 2. Lexical & Token Analysis for Latin-script languages
  const lower = clean.toLowerCase();

  // Spanish detection heuristics
  const spanishMarkers = /[¿¡áéíóúñ]/;
  const spanishWords = ['hola', 'amigo', 'gracias', 'por', 'favor', 'como', 'estas', 'bueno', 'buenos', 'dias', 'tarde', 'noche', 'revisado', 'aplicacion', 'mensaje', 'que', 'para', 'con', 'muy'];
  const hasSpanishWords = spanishWords.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower));
  if (spanishMarkers.test(lower) || hasSpanishWords) {
    return {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸',
      confidence: 0.94,
      method: 'lexical_ngram',
    };
  }

  // French heuristics
  const frenchWords = ['bonjour', 'salut', 'merci', 'avec', 'vous', 'dans', 'pour', 'bien', 'tres', 'oui', 'non', 'cette', 'faire'];
  if (/[éèêëàâôûç]/.test(lower) || frenchWords.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower))) {
    return {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
      confidence: 0.92,
      method: 'lexical_ngram',
    };
  }

  // German heuristics
  const germanWords = ['hallo', 'danke', 'bitte', 'guten', 'morgen', 'abend', 'nicht', 'sehr', 'auch', 'oder', 'nach'];
  if (/[äöüß]/.test(lower) || germanWords.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower))) {
    return {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      confidence: 0.93,
      method: 'lexical_ngram',
    };
  }

  // Portuguese heuristics
  const ptWords = ['ola', 'obrigado', 'tudo', 'bem', 'voce', 'vamos', 'fazer', 'bom', 'dia', 'boa', 'noite'];
  if (/[ãõ]/.test(lower) || ptWords.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower))) {
    return {
      code: 'pt',
      name: 'Portuguese',
      nativeName: 'Português',
      flag: '🇧🇷',
      confidence: 0.91,
      method: 'lexical_ngram',
    };
  }

  // Default to English
  return {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    confidence: 0.95,
    method: 'lexical_ngram',
  };
}

/**
 * Asynchronous simulated language detection service with realistic latency (120ms).
 */
export async function detectLanguageAsync(text: string): Promise<DetectedLanguageResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(detectLanguage(text));
    }, 120);
  });
}
