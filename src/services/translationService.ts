import { TranslationResult, SmartReply, TranslationTone, MessagingApp } from '../types';

export async function translateText(
  text: string,
  sourceLang: string = 'auto',
  targetLang: string = 'en',
  tone: TranslationTone = 'natural',
  contextApp: MessagingApp = 'whatsapp'
): Promise<TranslationResult> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
        tone,
        contextApp,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to translate`);
    }

    const data = await res.json();
    return {
      translatedText: data.translatedText || text,
      detectedSourceLang: data.detectedSourceLang || sourceLang,
      sourceLangName: data.sourceLangName || 'Source',
      targetLangName: data.targetLangName || targetLang,
      pronunciation: data.pronunciation,
      toneNotes: data.toneNotes,
      alternativePhrasings: data.alternativePhrasings,
      originalText: text,
      fallbackUsed: data.fallbackUsed,
    };
  } catch (error: any) {
    console.warn('Network translate error, using client-side fallback:', error);
    return {
      translatedText: text,
      detectedSourceLang: sourceLang,
      sourceLangName: sourceLang,
      targetLangName: targetLang,
      originalText: text,
      toneNotes: 'Offline instant mode',
      fallbackUsed: true,
    };
  }
}

export async function fetchSmartReplies(message: string, targetLang: string = 'en'): Promise<SmartReply[]> {
  try {
    const res = await fetch('/api/smart-replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, targetLang }),
    });
    if (!res.ok) throw new Error('Failed to fetch replies');
    const data = await res.json();
    return data.replies || [];
  } catch (error) {
    console.warn('Smart replies error:', error);
    return [
      { text: 'Yes, absolutely!', meaning: 'Agreement', tone: 'friendly' },
      { text: 'Let me check and tell you.', meaning: 'Review', tone: 'polite' },
      { text: 'Sounds good!', meaning: 'Enthusiastic agreement', tone: 'casual' },
    ];
  }
}

export async function refineTone(text: string, tone: TranslationTone, language: string): Promise<string> {
  try {
    const res = await fetch('/api/refine-tone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetTone: tone, language }),
    });
    if (!res.ok) throw new Error('Refine failed');
    const data = await res.json();
    return data.refinedText || text;
  } catch (err) {
    return text;
  }
}

// Text to speech helper with language matching
export function speakText(text: string, langCode: string = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // cancel any active speech

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Map our language code to BCP 47 language tag
  const langMap: Record<string, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    bn: 'bn-IN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ar: 'ar-SA',
    ja: 'ja-JP',
    ru: 'ru-RU',
    pt: 'pt-BR',
    ur: 'ur-PK',
  };

  const bcpTag = langMap[langCode] || langCode;
  utterance.lang = bcpTag;
  utterance.rate = 0.95;

  // Try to pick an authentic native voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find((v) => v.lang.startsWith(langCode));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  window.speechSynthesis.speak(utterance);
}
