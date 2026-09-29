import React, { useState } from 'react';
import { BookOpen, Search, Copy, Check, Send, Volume2 } from 'lucide-react';
import { PRESET_PHRASES } from '../data/presetPhrases';
import { QuickPhrase } from '../types';
import { speakText } from '../services/translationService';
import { getLanguageSimpleName } from '../data/languages';

interface PhrasesLibraryProps {
  myLang: string;
  targetLang: string;
  onSendPhrase: (phrase: string) => void;
}

export const PhrasesLibrary: React.FC<PhrasesLibraryProps> = ({
  myLang,
  targetLang,
  onSendPhrase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['all', 'Daily Greetings', 'Work & Business', 'Social & Meetups', 'Shopping & Bargaining', 'Travel & Dining'];

  const filtered = PRESET_PHRASES.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.english.toLowerCase().includes(q) ||
      p.bengali.toLowerCase().includes(q) ||
      p.hindi.toLowerCase().includes(q) ||
      p.spanish.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const getPhraseForLang = (phrase: QuickPhrase, langCode: string): string => {
    switch (langCode) {
      case 'bn':
        return phrase.bengali;
      case 'hi':
        return phrase.hindi;
      case 'es':
        return phrase.spanish;
      case 'en':
      default:
        return phrase.english;
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-2xl mx-auto w-full">
      {/* Title */}
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Smart Chat Phrasebook
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Curated instant phrases ready to send in Bengali, Hindi, English, and Spanish
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search phrases by keyword, greeting, or meaning..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white font-medium shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat === 'all' ? 'All Phrases' : cat}
          </button>
        ))}
      </div>

      {/* Phrases List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const myText = getPhraseForLang(item, myLang);
          const targetText = getPhraseForLang(item, targetLang);

          return (
            <div
              key={item.id}
              className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                  {item.category} · {item.tag}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => speakText(targetText, targetLang)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                    title="Pronounce"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(item.id, targetText)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                    title="Copy phrase"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onSendPhrase(targetText)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium ml-1 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send</span>
                  </button>
                </div>
              </div>

              {/* Native Language Meaning */}
              <div>
                <span className="text-[10px] text-slate-400 block">
                  In {getLanguageSimpleName(myLang)}:
                </span>
                <p className="text-xs text-slate-300 font-medium">{myText}</p>
              </div>

              {/* Target Language Ready Translation */}
              <div className="pt-1 border-t border-slate-800/80">
                <span className="text-[10px] text-indigo-400 block font-semibold">
                  In {getLanguageSimpleName(targetLang)}:
                </span>
                <p className="text-sm text-slate-100 font-semibold">{targetText}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
