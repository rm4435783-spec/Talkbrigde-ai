import React, { useState, useEffect } from 'react';
import { Sparkles, X, Send, ArrowRight, Loader2 } from 'lucide-react';
import { ChatMessage, SmartReply } from '../types';
import { fetchSmartReplies } from '../services/translationService';
import { getLanguageSimpleName } from '../data/languages';

interface SmartRepliesModalProps {
  message: ChatMessage | null;
  targetLang: string;
  onSelectReply: (text: string) => void;
  onClose: () => void;
}

export const SmartRepliesModal: React.FC<SmartRepliesModalProps> = ({
  message,
  targetLang,
  onSelectReply,
  onClose,
}) => {
  const [replies, setReplies] = useState<SmartReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!message) return;

    let mounted = true;
    setIsLoading(true);

    fetchSmartReplies(message.originalText, targetLang).then((res) => {
      if (mounted) {
        setReplies(res);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [message, targetLang]);

  if (!message) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 rounded-t-3xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-100">AI Instant Smart Replies</h4>
            <p className="text-[10px] text-slate-400">
              Generating responses in {getLanguageSimpleName(targetLang)}
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

      {/* Target Message context */}
      <div className="my-2.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-300">
        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Replying to:</span>
        <p className="truncate italic">"{message.originalText}"</p>
      </div>

      {/* Smart Replies options */}
      <div className="space-y-2 mt-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Thinking in {getLanguageSimpleName(targetLang)}...</span>
          </div>
        ) : (
          replies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectReply(reply.text);
                onClose();
              }}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/60 hover:border-indigo-500/50 transition-all group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-slate-100 group-hover:text-white">
                  {reply.text}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{reply.meaning}</p>
              </div>
              <Send className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};
