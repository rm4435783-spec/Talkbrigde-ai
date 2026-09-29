import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client with standard User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Supported language name mapping helper
const LANGUAGE_NAMES: Record<string, string> = {
  auto: 'Auto Detect',
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  bn: 'Bengali (বাংলা)',
  es: 'Spanish (Español)',
  ar: 'Arabic (العربية)',
  fr: 'French (Français)',
  de: 'German (Deutsch)',
  ur: 'Urdu (اردو)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  mr: 'Marathi (मराठी)',
  gu: 'Gujarati (ગુજરાતી)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  ml: 'Malayalam (മലയാളം)',
  kn: 'Kannada (ಕನ್ನಡ)',
  id: 'Indonesian (Bahasa Indonesia)',
  ja: 'Japanese (日本語)',
  ko: 'Korean (한국어)',
  zh: 'Chinese (Simplified)',
  ru: 'Russian (Русский)',
  pt: 'Portuguese (Português)',
  it: 'Italian (Italiano)',
  tr: 'Turkish (Türkçe)',
  vi: 'Vietnamese (Tiếng Việt)',
  th: 'Thai (ไทย)',
  fil: 'Filipino (Tagalog)',
};

// Fallback smart offline translation for common chat phrases if API key is missing or ratelimited
const FALLBACK_DICTIONARY: Record<string, Record<string, string>> = {
  'hi': {
    'hello': 'नमस्ते (Namaste)',
    'how are you': 'आप कैसे हैं? (Aap kaise hain?)',
    'what are you doing': 'आप क्या कर रहे हैं?',
    'i am good': 'मैं ठीक हूँ (Main theek hoon)',
    'thank you': 'धन्यवाद (Dhanyawad)',
    'where are you': 'आप कहाँ हैं?',
    'see you soon': 'जल्द ही मिलेंगे',
    'good morning': 'शुभ प्रभात',
    'good night': 'शुभ रात्रि',
    'yes': 'हाँ (Haan)',
    'no': 'नहीं (Nahi)',
  },
  'bn': {
    'hello': 'হ্যালো / নমস্কার (Nomoshkar)',
    'how are you': 'আপনি কেমন আছেন? (Apni kemon achhen?)',
    'what are you doing': 'তুমি কি করছো? (Tumi ki korchho?)',
    'i am good': 'আমি ভালো আছি (Ami bhalo achhi)',
    'thank you': 'ধন্যবাদ (Dhonnobad)',
    'where are you': 'তুমি কোথায়? (Tumi kothay?)',
    'see you soon': 'আবার দেখা হবে (Abar dekha hobe)',
    'good morning': 'সুপ্রভাত (Suprobhat)',
    'good night': 'শুভ রাত্রি (Shubho ratri)',
    'yes': 'হ্যাঁ (Hyan)',
    'no': 'না (Na)',
  },
  'en': {
    'नमस्ते': 'Hello / Greetings',
    'आप कैसे हैं?': 'How are you?',
    'আমি ভালো আছি': 'I am fine / good',
    'আপনি কেমন আছেন?': 'How are you doing?',
    'ধন্যবাদ': 'Thank you very much',
    'धन्यवाद': 'Thank you very much',
  }
};

// Translate endpoint
app.post('/api/translate', async (req: Request, res: Response) => {
  try {
    const {
      text,
      sourceLang = 'auto',
      targetLang = 'en',
      tone = 'natural',
      contextApp = 'whatsapp',
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text to translate is required' });
      return;
    }

    const trimmedText = text.trim();

    // Check if we have Gemini API Key
    if (apiKey) {
      try {
        const prompt = `You are TalkBridge AI, a mobile instant chat translation engine embedded in messaging apps (${contextApp} like WhatsApp, Messenger, Instagram, Telegram).
Translate the following chat message accurately, preserving natural human chat phrasing, emotion, emojis, idioms, and colloquialisms.

Message to translate: "${trimmedText}"
Source Language requested: ${sourceLang === 'auto' ? 'Auto-detect' : LANGUAGE_NAMES[sourceLang] || sourceLang}
Target Language: ${LANGUAGE_NAMES[targetLang] || targetLang}
Requested Tone: ${tone} (e.g., natural chat, casual/friendly, polite/formal, youth slang, professional business)

Return a pure JSON response strictly matching this JSON schema:
{
  "translatedText": "the natural translated text for the chat message",
  "detectedSourceLang": "language code e.g. en, hi, bn, es",
  "sourceLangName": "full name of detected language",
  "targetLangName": "full name of target language",
  "pronunciation": "romanized phonetic pronunciation guide (especially for Bengali, Hindi, Japanese, Arabic, etc.), or null if latin script",
  "toneNotes": "brief 1-phrase cultural or tone insight (e.g. 'Warm informal greeting', 'Polite honorific used')",
  "alternativePhrasings": ["casual alternative", "more formal alternative"]
}`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                translatedText: { type: Type.STRING },
                detectedSourceLang: { type: Type.STRING },
                sourceLangName: { type: Type.STRING },
                targetLangName: { type: Type.STRING },
                pronunciation: { type: Type.STRING },
                toneNotes: { type: Type.STRING },
                alternativePhrasings: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['translatedText', 'detectedSourceLang', 'sourceLangName', 'targetLangName'],
            },
          },
        });

        const rawText = geminiRes.text?.trim() || '{}';
        const parsed = JSON.parse(rawText);
        res.json({
          success: true,
          ...parsed,
          sourceApp: contextApp,
          originalText: trimmedText,
        });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini API translation error, falling back to smart translator:', geminiError?.message);
      }
    }

    // Fallback translation when API key is not ready or failed
    const lower = trimmedText.toLowerCase();
    const targetMap = FALLBACK_DICTIONARY[targetLang];
    let translated = targetMap?.[lower] || '';

    // Smart heuristic if not in dictionary
    if (!translated) {
      if (targetLang === 'bn') {
        translated = `[অনুবাদ]: ${trimmedText} (বাংলায়)`;
      } else if (targetLang === 'hi') {
        translated = `[अनुवाद]: ${trimmedText} (हिन्दी में)`;
      } else if (targetLang === 'es') {
        translated = `[Traducción]: ${trimmedText}`;
      } else {
        translated = `${trimmedText} (Translated to ${LANGUAGE_NAMES[targetLang] || targetLang})`;
      }
    }

    res.json({
      success: true,
      translatedText: translated,
      detectedSourceLang: sourceLang === 'auto' ? 'en' : sourceLang,
      sourceLangName: LANGUAGE_NAMES[sourceLang] || 'English',
      targetLangName: LANGUAGE_NAMES[targetLang] || targetLang,
      pronunciation: targetLang === 'bn' ? 'Bangla uccharon' : targetLang === 'hi' ? 'Hindi uccharan' : undefined,
      toneNotes: 'Instant chat translation',
      alternativePhrasings: ['Alternative phrasing available online'],
      originalText: trimmedText,
      fallbackUsed: true,
    });
  } catch (err: any) {
    console.error('Server error in /api/translate:', err);
    res.status(500).json({ error: 'Failed to translate message: ' + (err?.message || 'Unknown error') });
  }
});

// Smart Quick Replies generation for fast chatting
app.post('/api/smart-replies', async (req: Request, res: Response) => {
  try {
    const { message, targetLang = 'en', count = 3 } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message context is required' });
      return;
    }

    if (apiKey) {
      try {
        const prompt = `Given this incoming message in a chat: "${message}"
Generate ${count} short, natural, realistic quick-reply options in ${LANGUAGE_NAMES[targetLang] || targetLang}.
Also provide the English meaning for each so the user knows what they are sending.
Format as JSON:
{
  "replies": [
    {
      "text": "Reply text in ${LANGUAGE_NAMES[targetLang] || targetLang}",
      "meaning": "English meaning",
      "tone": "enthusiastic / polite / casual"
    }
  ]
}`;

        const result = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                replies: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      meaning: { type: Type.STRING },
                      tone: { type: Type.STRING },
                    },
                    required: ['text', 'meaning'],
                  },
                },
              },
              required: ['replies'],
            },
          },
        });

        const parsed = JSON.parse(result.text?.trim() || '{}');
        res.json({ success: true, replies: parsed.replies || [] });
        return;
      } catch (err) {
        console.warn('Gemini smart replies fallback:', err);
      }
    }

    // Default fast replies fallback
    const defaultReplies = [
      { text: targetLang === 'bn' ? 'হ্যাঁ, আমি বুঝতে পেরেছি!' : targetLang === 'hi' ? 'हाँ, मैं समझ गया!' : 'Got it, thank you!', meaning: 'Got it, thank you!', tone: 'friendly' },
      { text: targetLang === 'bn' ? 'আমি একটু পর জানাচ্ছি।' : targetLang === 'hi' ? 'मैं थोड़ी देर में बताता हूँ।' : 'Let me get back to you shortly.', meaning: 'Let me get back to you shortly.', tone: 'polite' },
      { text: targetLang === 'bn' ? 'দারুণ! চমৎকার!' : targetLang === 'hi' ? 'बहुत बढ़िया!' : 'Sounds wonderful!', meaning: 'Sounds wonderful!', tone: 'enthusiastic' },
    ];
    res.json({ success: true, replies: defaultReplies });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error generating replies' });
  }
});

// Tone Refiner / Paraphrase
app.post('/api/refine-tone', async (req: Request, res: Response) => {
  try {
    const { text, targetTone = 'casual', language = 'en' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text required' });
      return;
    }

    if (apiKey) {
      try {
        const prompt = `Rewrite this chat message into a "${targetTone}" tone in ${LANGUAGE_NAMES[language] || language}:
Message: "${text}"
Keep it natural for instant messaging apps.
Return JSON:
{
  "refinedText": "the rewritten message",
  "explanation": "brief note on changes made"
}`;
        const result = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                refinedText: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['refinedText'],
            },
          },
        });
        res.json({ success: true, ...JSON.parse(result.text?.trim() || '{}') });
        return;
      } catch (e) {
        console.warn('Refine tone fallback:', e);
      }
    }

    res.json({ success: true, refinedText: text, explanation: 'Original preserved' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'TalkBridge AI',
    geminiEnabled: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`TalkBridge AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
