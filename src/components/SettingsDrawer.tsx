import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Layers,
  Sparkles,
  Smartphone,
  Eye,
  CheckCircle2,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  SOURCE_LANGUAGES_WITH_AUTO,
  getLanguageName,
} from '../data/languages';
import { TranslationTone } from '../types';

interface SettingsDrawerProps {
  myLang: string;
  onMyLangChange: (lang: string) => void;
  targetLang: string;
  onTargetLangChange: (lang: string) => void;
  tone: TranslationTone;
  onToneChange: (tone: TranslationTone) => void;
  showFloatingBall: boolean;
  onToggleFloatingBall: () => void;
  autoTranslateEnabled: boolean;
  onToggleAutoTranslate: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  myLang,
  onMyLangChange,
  targetLang,
  onTargetLangChange,
  tone,
  onToneChange,
  showFloatingBall,
  onToggleFloatingBall,
  autoTranslateEnabled,
  onToggleAutoTranslate,
}) => {
  const [permOverlay, setPermOverlay] = useState(true);
  const [permAccessibility, setPermAccessibility] = useState(true);
  const [permClipboard, setPermClipboard] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-2xl mx-auto w-full">
      {/* Title */}
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          TalkBridge AI Settings & System Hub
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure language preferences, floating translate ball, and messaging overlay permissions
        </p>
      </div>

      {/* Language Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4" />
          Language & Tone Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Your Preferred Language (Native)
            </label>
            <select
              value={myLang}
              onChange={(e) => onMyLangChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              All foreign incoming messages translate to this language.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Default Foreign Language (Chat Partner)
            </label>
            <select
              value={targetLang}
              onChange={(e) => onTargetLangChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SOURCE_LANGUAGES_WITH_AUTO.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} {l.code === 'auto' ? '(Auto-detect on incoming)' : `(${l.nativeName})`}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              When set to Auto-detect, TalkBridge AI analyzes incoming messages to identify language.
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Translation Tone for Chatting
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                { id: 'natural', label: 'Natural Chat' },
                { id: 'casual', label: 'Casual / Friendly' },
                { id: 'polite', label: 'Polite / Respectful' },
                { id: 'slang', label: 'Youth Slang' },
                { id: 'business', label: 'Professional' },
              ] as { id: TranslationTone; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => onToneChange(t.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors ${
                  tone === t.id
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Ball Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Floating Ball & In-App Overlay
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <p className="text-xs font-medium text-slate-200">Show Floating Bridge Ball</p>
            <p className="text-[10px] text-slate-400">
              Draggable floating bubble over WhatsApp, Instagram, Telegram, Messenger
            </p>
          </div>
          <button
            onClick={onToggleFloatingBall}
            className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              showFloatingBall ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                showFloatingBall ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-xs font-medium text-slate-200">Auto-Translate Incoming Messages</p>
            <p className="text-[10px] text-slate-400">
              Instantly converts new messages upon arrival without needing to tap
            </p>
          </div>
          <button
            onClick={onToggleAutoTranslate}
            className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              autoTranslateEnabled ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                autoTranslateEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Accessibility & System Integration Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Mobile Operating System Permissions
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          How TalkBridge AI operates seamlessly over WhatsApp, Instagram, Telegram, Messenger, and Facebook on Android & iOS devices:
        </p>

        <div className="space-y-2.5">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 mt-0.5 ${
                  permOverlay ? 'text-emerald-400' : 'text-slate-600'
                }`}
              />
              <div>
                <p className="text-xs font-medium text-slate-200">
                  Display Over Other Apps (Overlay)
                </p>
                <p className="text-[10px] text-slate-400">
                  Enables the floating ball to float above WhatsApp and Instagram chat screens.
                </p>
              </div>
            </div>
            <button
              onClick={() => setPermOverlay(!permOverlay)}
              className={`px-2 py-1 rounded text-[10px] font-semibold ${
                permOverlay ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {permOverlay ? 'Granted' : 'Off'}
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 mt-0.5 ${
                  permAccessibility ? 'text-emerald-400' : 'text-slate-600'
                }`}
              />
              <div>
                <p className="text-xs font-medium text-slate-200">
                  TalkBridge Accessibility Service
                </p>
                <p className="text-[10px] text-slate-400">
                  Detects incoming chat text in Hindi, English, Bengali, etc., to translate in-place.
                </p>
              </div>
            </div>
            <button
              onClick={() => setPermAccessibility(!permAccessibility)}
              className={`px-2 py-1 rounded text-[10px] font-semibold ${
                permAccessibility ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {permAccessibility ? 'Active' : 'Off'}
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 mt-0.5 ${
                  permClipboard ? 'text-emerald-400' : 'text-slate-600'
                }`}
              />
              <div>
                <p className="text-xs font-medium text-slate-200">
                  Smart Clipboard Fast Bridge
                </p>
                <p className="text-[10px] text-slate-400">
                  Copying any foreign text instantly triggers a TalkBridge notification bubble.
                </p>
              </div>
            </div>
            <button
              onClick={() => setPermClipboard(!permClipboard)}
              className={`px-2 py-1 rounded text-[10px] font-semibold ${
                permClipboard ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {permClipboard ? 'Active' : 'Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
