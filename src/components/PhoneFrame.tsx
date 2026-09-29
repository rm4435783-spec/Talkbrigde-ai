import React, { ReactNode } from 'react';
import { Wifi, Battery, Signal, Smartphone, Maximize2, Minimize2 } from 'lucide-react';
import { MessagingApp } from '../types';

interface PhoneFrameProps {
  children: ReactNode;
  activeApp: MessagingApp;
  onAppChange: (app: MessagingApp) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  currentTime?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  activeApp,
  onAppChange,
  isExpanded,
  onToggleExpand,
  currentTime = '10:14',
}) => {
  const appThemes: Record<MessagingApp, { name: string; bg: string; text: string; icon: string }> = {
    whatsapp: {
      name: 'WhatsApp',
      bg: 'bg-emerald-600',
      text: 'text-white',
      icon: '💬',
    },
    instagram: {
      name: 'Instagram',
      bg: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500',
      text: 'text-white',
      icon: '📸',
    },
    telegram: {
      name: 'Telegram',
      bg: 'bg-sky-600',
      text: 'text-white',
      icon: '✈️',
    },
    messenger: {
      name: 'Messenger',
      bg: 'bg-blue-600',
      text: 'text-white',
      icon: '⚡',
    },
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-4rem)] p-2 md:p-6 transition-all">
      {/* Top Controller Bar: App Switcher & Frame Mode */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {(['whatsapp', 'instagram', 'telegram', 'messenger'] as MessagingApp[]).map((appKey) => {
              const info = appThemes[appKey];
              const isSelected = activeApp === appKey;
              return (
                <button
                  key={appKey}
                  onClick={() => onAppChange(appKey)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                  title={`Switch to ${info.name}`}
                >
                  <span>{info.icon}</span>
                  <span className="hidden sm:inline">{info.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 transition-colors"
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Phone Frame</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Expanded View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`transition-all duration-300 w-full ${
          isExpanded
            ? 'max-w-5xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden'
            : 'max-w-[420px] rounded-[44px] bg-slate-950 border-[10px] border-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-slate-800 relative'
        }`}
      >
        {/* Realistic Mobile Status Bar (Visible in phone frame mode) */}
        {!isExpanded && (
          <div className="w-full bg-slate-950 text-white px-7 pt-3.5 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-tight select-none z-30">
            <span>{currentTime}</span>
            {/* Dynamic Island Pill */}
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-1.5 px-2 border border-slate-900 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] text-slate-300 font-mono tracking-wider">TALKBRIDGE</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className={`relative ${isExpanded ? 'min-h-[700px]' : 'h-[740px]'} flex flex-col overflow-hidden`}>
          {children}
        </div>

        {/* Home Bar Indicator (Phone mode) */}
        {!isExpanded && (
          <div className="w-full bg-slate-950 py-2 flex items-center justify-center">
            <div className="w-32 h-1 bg-slate-700/60 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
