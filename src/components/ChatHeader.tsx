import React from 'react';
import {
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Languages,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import { ChatContact, MessagingApp } from '../types';
import {
  SUPPORTED_LANGUAGES,
  SOURCE_LANGUAGES_WITH_AUTO,
  getLanguageName,
  getLanguageSimpleName,
} from '../data/languages';

interface ChatHeaderProps {
  contact: ChatContact;
  app: MessagingApp;
  myLang: string;
  onMyLangChange: (lang: string) => void;
  targetLang: string;
  onTargetLangChange: (lang: string) => void;
  onSwapLanguages: () => void;
  detectedIncomingLang?: { code: string; name: string; flag: string; confidence: number } | null;
  onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  contact,
  app,
  myLang,
  onMyLangChange,
  targetLang,
  onTargetLangChange,
  onSwapLanguages,
  detectedIncomingLang,
  onBack,
}) => {
  const getHeaderStyle = () => {
    switch (app) {
      case 'whatsapp':
        return 'bg-[#1f2c34] text-white border-b border-slate-700/50';
      case 'instagram':
        return 'bg-slate-900/90 backdrop-blur-md text-white border-b border-slate-800';
      case 'telegram':
        return 'bg-[#212d3b] text-white border-b border-slate-700/50';
      case 'messenger':
      default:
        return 'bg-slate-900 text-white border-b border-slate-800';
    }
  };

  return (
    <div className={`w-full px-3 py-2.5 flex flex-col gap-1.5 shrink-0 z-20 ${getHeaderStyle()}`}>
      <div className="flex items-center justify-between">
        {/* Contact Profile info */}
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30"
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                contact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
              }`}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[13.5px] font-semibold tracking-tight leading-none text-slate-100">
                {contact.name}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 capitalize mt-0.5">
              {contact.status === 'online' ? 'Online' : contact.lastSeen || 'Offline'}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-slate-300">
          <button
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
            title="Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
            title="Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TalkBridge AI Active Translation Bar */}
      <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
            Bridge
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* User's Preferred Native Language */}
          <select
            value={myLang}
            onChange={(e) => onMyLangChange(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                My: {l.flag} {l.name}
              </option>
            ))}
          </select>

          {/* Swap Button */}
          <button
            onClick={onSwapLanguages}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded transition-colors"
            title="Swap translation direction"
          >
            <ArrowRightLeft className="w-3 h-3" />
          </button>

          {/* Partner's Language with Auto-Detect */}
          <select
            value={targetLang}
            onChange={(e) => onTargetLangChange(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {SOURCE_LANGUAGES_WITH_AUTO.map((l) => (
              <option key={l.code} value={l.code}>
                Chat: {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Auto-detect badge bar if Auto-detect is active */}
      {targetLang === 'auto' && (
        <div className="w-full bg-indigo-950/40 border border-indigo-500/30 rounded-lg px-2.5 py-1 flex items-center justify-between text-[10px] text-indigo-300">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span className="font-medium">
              {detectedIncomingLang
                ? `Auto-detected message language: ${detectedIncomingLang.flag} ${detectedIncomingLang.name} (${Math.round(detectedIncomingLang.confidence * 100)}% match)`
                : 'Auto-detect active: incoming chat messages will be detected on arrival'}
            </span>
          </div>
          <span className="text-[9px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-300 uppercase font-mono">
            Smart Lens
          </span>
        </div>
      )}
    </div>
  );
};
