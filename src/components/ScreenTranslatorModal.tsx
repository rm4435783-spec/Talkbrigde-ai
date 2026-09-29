import React, { useState } from 'react';
import { Eye, X, Sparkles, Check, ArrowRight, Copy } from 'lucide-react';
import { ChatContact, MessagingApp } from '../types';
import { getLanguageSimpleName } from '../data/languages';

interface ScreenTranslatorModalProps {
  contact: ChatContact;
  myLang: string;
  targetLang: string;
  onClose: () => void;
  onApplyTranslationsToChat: () => void;
}

export const ScreenTranslatorModal: React.FC<ScreenTranslatorModalProps> = ({
  contact,
  myLang,
  targetLang,
  onClose,
  onApplyTranslationsToChat,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyFullChat = () => {
    const transcript = contact.messages
      .map(
        (m) =>
          `[${m.senderName} (${m.timestamp})]: ${m.translatedText || m.originalText}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 text-white animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">TalkBridge Screen Lens</h3>
            <p className="text-[10px] text-indigo-400">
              Instant Full-Chat Translation to {getLanguageSimpleName(myLang)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scanned Messages List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        <div className="p-2.5 bg-indigo-950/40 border border-indigo-900/60 rounded-xl text-xs text-indigo-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Scanned {contact.messages.length} messages in {contact.name}'s chat
          </span>
          <button
            onClick={handleCopyFullChat}
            className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 rounded text-[11px] font-medium transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy All'}</span>
          </button>
        </div>

        {contact.messages.map((m, idx) => (
          <div
            key={m.id || idx}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-xs"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-semibold text-slate-300">{m.senderName}</span>
              <span>{m.timestamp}</span>
            </div>

            {/* Original message */}
            <p className="text-slate-400 text-[11px] italic">"{m.originalText}"</p>

            {/* Translated message */}
            <div className="pt-1.5 border-t border-slate-800/80 flex items-start gap-1.5 text-indigo-200">
              <ArrowRight className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
              <p className="font-medium text-slate-100">
                {m.translatedText || `(Translated to ${getLanguageSimpleName(myLang)}): ${m.originalText}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={() => {
            onApplyTranslationsToChat();
            onClose();
          }}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors text-center"
        >
          Apply All In Chat View
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
