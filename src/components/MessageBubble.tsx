import React, { useState } from 'react';
import {
  Languages,
  Volume2,
  Check,
  CheckCheck,
  Copy,
  Sparkles,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  MessageSquareReply,
} from 'lucide-react';
import { ChatMessage, MessagingApp } from '../types';
import { speakText } from '../services/translationService';
import { getLanguageSimpleName } from '../data/languages';

interface MessageBubbleProps {
  message: ChatMessage;
  app: MessagingApp;
  myPreferredLang: string;
  onTranslate: (messageId: string) => void;
  onQuickReply: (message: ChatMessage) => void;
  isTranslating?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  app,
  myPreferredLang,
  onTranslate,
  onQuickReply,
  isTranslating = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const isMe = message.sender === 'user';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handlePlayVoice = (text: string, langCode: string) => {
    speakText(text, langCode);
  };

  // Visual app-specific styling
  const getBubbleTheme = () => {
    switch (app) {
      case 'whatsapp':
        return {
          userBg: 'bg-[#005c4b] text-slate-100 rounded-2xl rounded-tr-xs shadow-sm',
          otherBg: 'bg-[#202c33] text-slate-100 rounded-2xl rounded-tl-xs shadow-sm border border-slate-700/30',
          timeColor: 'text-slate-400',
        };
      case 'instagram':
        return {
          userBg: 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white rounded-3xl rounded-br-md shadow-sm',
          otherBg: 'bg-slate-800 text-slate-100 rounded-3xl rounded-bl-md border border-slate-700/40 shadow-sm',
          timeColor: 'text-slate-400',
        };
      case 'telegram':
        return {
          userBg: 'bg-[#2b5278] text-white rounded-2xl rounded-br-sm shadow',
          otherBg: 'bg-[#182533] text-slate-100 rounded-2xl rounded-bl-sm border border-slate-700/40 shadow',
          timeColor: 'text-sky-300/80',
        };
      case 'messenger':
      default:
        return {
          userBg: 'bg-blue-600 text-white rounded-3xl rounded-br-sm shadow-sm',
          otherBg: 'bg-slate-800 text-slate-100 rounded-3xl rounded-bl-sm border border-slate-700/40 shadow-sm',
          timeColor: 'text-slate-400',
        };
    }
  };

  const theme = getBubbleTheme();

  // Determine what to display:
  // If translated, we can show translatedText or originalText based on showOriginal toggle
  const displayText = message.isTranslated
    ? showOriginal
      ? message.originalText
      : message.translatedText || message.originalText
    : message.originalText;

  const currentDisplayLang = message.isTranslated
    ? showOriginal
      ? message.originalLang
      : message.targetLang || myPreferredLang
    : message.originalLang;

  return (
    <div className={`flex flex-col my-1.5 ${isMe ? 'items-end' : 'items-start'} group max-w-full px-2`}>
      {/* Sender Header for other participants & Auto-detect indicator */}
      {!isMe && (
        <div className="flex items-center gap-2 mb-1 ml-1 text-[11px] text-slate-400">
          <span className="font-medium text-slate-300">
            {message.senderName}
          </span>
          {message.detectedLang && (
            <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-medium">
              <Sparkles className="w-2.5 h-2.5" />
              <span>
                {message.detectedLang.flag} {message.detectedLang.name}
              </span>
              <span className="text-slate-500 font-mono text-[9px]">
                ({Math.round(message.detectedLang.confidence * 100)}%)
              </span>
            </span>
          )}
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`relative max-w-[85%] md:max-w-[75%] p-3.5 transition-all duration-200 ${
          isMe ? theme.userBg : theme.otherBg
        }`}
      >
        {/* Main message text */}
        <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words font-normal">
          {displayText}
        </p>

        {/* Pronunciation phonetics if available for non-Latin script */}
        {message.pronunciation && !showOriginal && (
          <p className="mt-1 text-[11px] italic text-slate-300/80 font-mono tracking-wide">
            🗣️ {message.pronunciation}
          </p>
        )}

        {/* Translation metadata badge */}
        {message.isTranslated && (
          <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-300">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-indigo-300" />
              {showOriginal ? (
                <span>Original ({getLanguageSimpleName(message.originalLang)})</span>
              ) : (
                <span>
                  Translated to {getLanguageSimpleName(message.targetLang || myPreferredLang)}
                </span>
              )}
            </span>

            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="hover:underline text-[10px] text-slate-300 ml-2"
            >
              {showOriginal ? 'View Translation' : 'View Original'}
            </button>
          </div>
        )}

        {/* Footer info: time, read ticks, and action buttons */}
        <div className="mt-2 flex items-center justify-between gap-3 text-[10px]">
          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-1.5 opacity-90 transition-opacity">
            {/* Audio Listen Button */}
            <button
              onClick={() => handlePlayVoice(displayText, currentDisplayLang)}
              className="p-1 hover:bg-white/15 rounded-md text-slate-300 hover:text-white transition-colors"
              title="Listen to pronunciation"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            {/* Copy button */}
            <button
              onClick={() => handleCopy(displayText)}
              className="p-1 hover:bg-white/15 rounded-md text-slate-300 hover:text-white transition-colors"
              title="Copy text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Smart Reply Trigger for incoming messages */}
            {!isMe && (
              <button
                onClick={() => onQuickReply(message)}
                className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-white/15 rounded-md text-indigo-200 hover:text-white transition-colors"
                title="AI Smart Replies in their language"
              >
                <MessageSquareReply className="w-3 h-3 text-indigo-300" />
                <span className="text-[10px]">Reply</span>
              </button>
            )}
          </div>

          {/* Time & Read Receipts */}
          <div className={`flex items-center gap-1 ${theme.timeColor} shrink-0`}>
            <span>{message.timestamp}</span>
            {isMe && (
              <span className="text-emerald-400">
                {message.status === 'read' ? (
                  <CheckCheck className="w-3.5 h-3.5" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* The Instant Translate Action Bar below bubble */}
      {!message.isTranslated && (
        <div className="mt-1 flex items-center gap-1.5">
          <button
            onClick={() => onTranslate(message.id)}
            disabled={isTranslating}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700/60 shadow-xs text-[11px] font-medium transition-all group-hover:border-indigo-500"
          >
            <Languages className="w-3 h-3 text-indigo-400 group-hover:text-white" />
            {isTranslating ? (
              <span className="animate-pulse">Translating...</span>
            ) : (
              <span>
                {message.detectedLang
                  ? `Translate ${message.detectedLang.flag} to ${getLanguageSimpleName(myPreferredLang)}`
                  : `Translate to ${getLanguageSimpleName(myPreferredLang)}`}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
