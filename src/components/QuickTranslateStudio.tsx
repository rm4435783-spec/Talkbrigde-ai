import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRightLeft,
  Sparkles,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Languages,
  Send,
  SlidersHorizontal,
  FileText,
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  SOURCE_LANGUAGES_WITH_AUTO,
  getLanguageName,
  getLanguageSimpleName,
} from '../data/languages';
import { translateText, speakText, refineTone } from '../services/translationService';
import { detectLanguage } from '../services/languageDetector';
import { TranslationTone } from '../types';

interface QuickTranslateStudioProps {
  initialText?: string;
  defaultMyLang?: string;
  defaultTargetLang?: string;
  onSendToChat?: (text: string) => void;
}

export const QuickTranslateStudio: React.FC<QuickTranslateStudioProps> = ({
  initialText = '',
  defaultMyLang = 'auto',
  defaultTargetLang = 'en',
  onSendToChat,
}) => {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState(defaultTargetLang);
  const [inputText, setInputText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState('');
  const [pronunciation, setPronunciation] = useState<string | null>(null);
  const [toneNotes, setToneNotes] = useState<string | null>(null);
  const [tone, setTone] = useState<TranslationTone>('natural');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live mock detection when typing or pasting text
  const detectedResult = useMemo(() => {
    if (!inputText.trim()) return null;
    return detectLanguage(inputText);
  }, [inputText]);

  const sampleMessages = [
    {
      label: 'Auto-detect Bengali',
      from: 'auto',
      to: 'en',
      text: 'আপনি কেমন আছেন? কালকে কি আমাদের সাথে দেখা হবে?',
    },
    {
      label: 'Auto-detect Hindi',
      from: 'auto',
      to: 'en',
      text: 'अरे दोस्त! क्या तुमने आज का मैच देखा? बहुत ही रोमांचक मुकाबला था।',
    },
    {
      label: 'Auto-detect Spanish',
      from: 'auto',
      to: 'bn',
      text: '¡Hola amigo! ¿A qué hora nos encontramos en la cafetería hoy?',
    },
    {
      label: 'Auto-detect English',
      from: 'auto',
      to: 'bn',
      text: 'I really enjoyed working with you on this project. Let us connect again next week!',
    },
  ];

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    const effectiveSource =
      sourceLang === 'auto'
        ? detectedResult?.code || 'auto'
        : sourceLang;

    try {
      const result = await translateText(inputText.trim(), effectiveSource, targetLang, tone);
      setTranslatedText(result.translatedText);
      setPronunciation(result.pronunciation || null);
      setToneNotes(result.toneNotes || null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    const nextTarget = sourceLang === 'auto' ? (detectedResult?.code || 'en') : sourceLang;
    setSourceLang(targetLang);
    setTargetLang(nextTarget);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToneChange = async (newTone: TranslationTone) => {
    setTone(newTone);
    if (!translatedText) return;
    setIsLoading(true);
    try {
      const refined = await refineTone(translatedText, newTone, targetLang);
      setTranslatedText(refined);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Languages className="w-5 h-5 text-indigo-400" />
            TalkBridge Translation Studio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test any message, tweak tones, and copy directly into your messaging apps
          </p>
        </div>
      </div>

      {/* Language Direction Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-sm">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
        >
          {SOURCE_LANGUAGES_WITH_AUTO.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.name} {l.code === 'auto' ? '(Auto-detect)' : `(${l.nativeName})`}
            </option>
          ))}
        </select>

        <button
          onClick={handleSwap}
          className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-xl text-slate-300 hover:text-white transition-colors shrink-0"
          title="Swap Languages"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.name} ({l.nativeName})
            </option>
          ))}
        </select>
      </div>

      {/* Auto-detected Language Feedback Banner */}
      {sourceLang === 'auto' && detectedResult && inputText.trim() && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-indigo-300 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              Mock Neural Detector identified:{' '}
              <strong className="text-white">
                {detectedResult.flag} {detectedResult.name} ({detectedResult.nativeName})
              </strong>
            </span>
          </div>
          <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/15 px-2 py-0.5 rounded">
            {Math.round(detectedResult.confidence * 100)}% match
          </span>
        </div>
      )}

      {/* Preset Test Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-slate-400 font-medium shrink-0">Try samples:</span>
        {sampleMessages.map((sample, i) => (
          <button
            key={i}
            onClick={() => {
              setSourceLang(sample.from);
              setTargetLang(sample.to);
              setInputText(sample.text);
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-colors"
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">
            Source Text ({getLanguageSimpleName(sourceLang)})
          </span>
          {inputText && (
            <button
              onClick={() => setInputText('')}
              className="text-[11px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Enter or paste message in ${getLanguageSimpleName(sourceLang)}...`}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
        />
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => speakText(inputText, sourceLang)}
            disabled={!inputText.trim()}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
            title="Listen to source"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Translating...' : 'Translate Instantly'}</span>
          </button>
        </div>
      </div>

      {/* Result Output Card */}
      {translatedText && (
        <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 shadow-lg space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              Translated to {getLanguageSimpleName(targetLang)}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => speakText(translatedText, targetLang)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="Listen to pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <p className="text-base font-medium text-slate-100 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            {translatedText}
          </p>

          {pronunciation && (
            <p className="text-xs text-slate-400 font-mono italic">
              🗣️ Pronunciation: {pronunciation}
            </p>
          )}

          {toneNotes && (
            <p className="text-xs text-indigo-300/80 bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-900/50">
              💡 {toneNotes}
            </p>
          )}

          {/* Tone Refinement Switcher */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1.5">
              Change tone for messaging:
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {(['natural', 'casual', 'polite', 'slang', 'business'] as TranslationTone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleToneChange(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${
                    tone === t
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
