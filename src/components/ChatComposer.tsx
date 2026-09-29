import React, { useState, useEffect } from 'react';
import {
  Send,
  Sparkles,
  ArrowRight,
  Mic,
  MicOff,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
  Check,
  CheckCheck,
} from 'lucide-react';
import { TranslationTone, MessagingApp } from '../types';
import { translateText, speakText } from '../services/translationService';
import { SUPPORTED_LANGUAGES, getLanguageName, getLanguageSimpleName } from '../data/languages';

interface ChatComposerProps {
  app: MessagingApp;
  myLang: string;
  recipientLang: string;
  onSendMessage: (originalText: string, translatedText: string, pronunciation?: string) => void;
  tone: TranslationTone;
  onToneChange: (tone: TranslationTone) => void;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  app,
  myLang,
  recipientLang,
  onSendMessage,
  tone,
  onToneChange,
}) => {
  const [inputText, setInputText] = useState('');
  const [translatedPreview, setTranslatedPreview] = useState<string | null>(null);
  const [pronunciationPreview, setPronunciationPreview] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [sendBilingual, setSendBilingual] = useState(false);

  // Debounced translation preview
  useEffect(() => {
    if (!inputText.trim()) {
      setTranslatedPreview(null);
      setPronunciationPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsTranslating(true);
      try {
        const result = await translateText(
          inputText.trim(),
          myLang,
          recipientLang,
          tone,
          app
        );
        setTranslatedPreview(result.translatedText);
        setPronunciationPreview(result.pronunciation || null);
      } catch (e) {
        console.error('Translation error in composer:', e);
      } finally {
        setIsTranslating(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [inputText, myLang, recipientLang, tone, app]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const finalTranslated = translatedPreview || inputText.trim();
    const finalOriginal = inputText.trim();

    onSendMessage(
      finalOriginal,
      sendBilingual ? `${finalOriginal}\n(${finalTranslated})` : finalTranslated,
      pronunciationPreview || undefined
    );

    setInputText('');
    setTranslatedPreview(null);
    setPronunciationPreview(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Browser speech recognition for dictation
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback sample Bengali/Hindi sentence for simulation
      if (myLang === 'bn') {
        setInputText('আমি আজকের প্রজেক্টের কাজ শেষ করেছি।');
      } else if (myLang === 'hi') {
        setInputText('मैं आज शाम को मिलने आ रहा हूँ।');
      } else {
        setInputText('Hello! I will be joining the call in 5 minutes.');
      }
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = myLang === 'bn' ? 'bn-BD' : myLang === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition failed:', err);
      setIsListening(false);
    }
  };

  const tones: { id: TranslationTone; label: string; icon: string }[] = [
    { id: 'natural', label: 'Natural Chat', icon: '💬' },
    { id: 'casual', label: 'Casual / Friendly', icon: '😊' },
    { id: 'polite', label: 'Polite / Respectful', icon: '🙏' },
    { id: 'slang', label: 'Youth Slang', icon: '⚡' },
    { id: 'business', label: 'Professional', icon: '💼' },
  ];

  return (
    <div className="bg-slate-950 border-t border-slate-800/80 p-2.5 z-20 flex flex-col gap-2">
      {/* Live Bridge Indicator & Translation Preview */}
      <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-slate-300">{getLanguageSimpleName(myLang)}</span>
          <ArrowRight className="w-3 h-3 text-indigo-400" />
          <span className="text-indigo-400 font-semibold">{getLanguageSimpleName(recipientLang)}</span>
          {isTranslating && (
            <span className="text-[10px] text-amber-400 animate-pulse ml-1">Translating...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Tone Selector Trigger */}
          <button
            onClick={() => setShowToneSelector(!showToneSelector)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3 text-indigo-400" />
            <span className="capitalize">{tone}</span>
          </button>

          {/* Bilingual Toggle */}
          <button
            onClick={() => setSendBilingual(!sendBilingual)}
            className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
              sendBilingual
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Send both your native language and the translated language"
          >
            {sendBilingual ? 'Bilingual On' : 'Bilingual Off'}
          </button>
        </div>
      </div>

      {/* Tone Selection Popover Bar */}
      {showToneSelector && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {tones.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onToneChange(t.id);
                setShowToneSelector(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                tone === t.id
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Instant Translation Live Card (appears as user types in Bengali, Hindi, etc.) */}
      {translatedPreview && inputText.trim() && (
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-2.5 text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-150 relative">
          <div className="flex items-center justify-between text-[10px] text-indigo-400 mb-1">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Instant Translation to {getLanguageSimpleName(recipientLang)}
            </span>
            <button
              onClick={() => speakText(translatedPreview, recipientLang)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              title="Listen"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[13px] font-medium text-slate-100">{translatedPreview}</p>
          {pronunciationPreview && (
            <p className="mt-1 text-[11px] text-slate-400 font-mono italic">
              🗣️ {pronunciationPreview}
            </p>
          )}
        </div>
      )}

      {/* Input Field and Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Voice dictation */}
        <button
          onClick={toggleSpeechRecognition}
          className={`p-2.5 rounded-full transition-colors ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
          title={isListening ? 'Listening... click to stop' : `Speak in ${getLanguageSimpleName(myLang)}`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type in ${getLanguageSimpleName(myLang)} (e.g. বাংলা, हिन्दी, English)...`}
            className="w-full bg-slate-900 border border-slate-800 rounded-full px-4 py-2.5 text-[13.5px] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Send / Translate Button */}
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className={`p-2.5 rounded-full transition-all ${
            inputText.trim()
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
          title="Send instant translation"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
