export type MessagingApp = 'whatsapp' | 'instagram' | 'telegram' | 'messenger';

export type TranslationTone = 'natural' | 'casual' | 'polite' | 'slang' | 'business';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  samplePhrases?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'other' | 'user';
  senderName: string;
  avatar: string;
  originalText: string;
  originalLang: string; // e.g. 'en', 'hi', 'bn'
  translatedText?: string;
  targetLang?: string;
  isTranslated: boolean;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  pronunciation?: string;
  toneNotes?: string;
  app: MessagingApp;
  tone?: TranslationTone;
  detectedLang?: {
    code: string;
    name: string;
    flag: string;
    confidence: number;
  };
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  primaryLang: string;
  app: MessagingApp;
  status: 'online' | 'offline' | 'typing...';
  lastSeen?: string;
  messages: ChatMessage[];
}

export interface TranslationResult {
  translatedText: string;
  detectedSourceLang: string;
  sourceLangName: string;
  targetLangName: string;
  pronunciation?: string;
  toneNotes?: string;
  alternativePhrasings?: string[];
  originalText: string;
  fallbackUsed?: boolean;
}

export interface SmartReply {
  text: string;
  meaning: string;
  tone: string;
}

export interface QuickPhrase {
  id: string;
  category: string;
  english: string;
  bengali: string;
  hindi: string;
  spanish: string;
  tag: string;
}
