import React, { useState, useRef, useEffect } from 'react';
import { Languages, Sparkles, Clipboard, Volume2, ArrowRightLeft, Eye, X, Settings2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageName } from '../data/languages';

interface FloatingBridgeBallProps {
  myLang: string;
  targetLang: string;
  onSwapLanguages: () => void;
  onTranslateScreen: () => void;
  onOpenClipboardTranslate: () => void;
  onOpenSettings: () => void;
  autoTranslateEnabled: boolean;
  onToggleAutoTranslate: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const FloatingBridgeBall: React.FC<FloatingBridgeBallProps> = ({
  myLang,
  targetLang,
  onSwapLanguages,
  onTranslateScreen,
  onOpenClipboardTranslate,
  onOpenSettings,
  autoTranslateEnabled,
  onToggleAutoTranslate,
  containerRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 16, y: 160 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 16,
    posY: 160,
  });
  const hasMovedRef = useRef(false);

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from the main trigger ball
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
    }

    setPosition({
      x: Math.max(8, dragStartRef.current.posX - deltaX), // positioning from right
      y: Math.max(60, Math.min(600, dragStartRef.current.posY + deltaY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }

    // If it was just a tap (not a drag), toggle menu
    if (!hasMovedRef.current) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div
      style={{
        top: `${position.y}px`,
        right: `${position.x}px`,
      }}
      className="absolute z-40 select-none touch-none transition-transform"
    >
      {/* Floating Action Menu Popover */}
      {isOpen && (
        <div className="absolute right-14 top-0 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-white text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-semibold text-slate-100">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white">
                TB
              </div>
              <span>TalkBridge AI Lens</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Bridge Pair */}
          <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">My Language</span>
              <span className="font-semibold text-slate-200">{getLanguageName(myLang)}</span>
            </div>
            <button
              onClick={onSwapLanguages}
              className="p-1.5 bg-slate-800 hover:bg-indigo-600 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Swap Languages"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400">Target Chat</span>
              <span className="font-semibold text-slate-200">{getLanguageName(targetLang)}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onTranslateScreen();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 font-medium transition-colors"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Translate All Chat Messages</span>
            </button>

            <button
              onClick={() => {
                onOpenClipboardTranslate();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-slate-800/80 text-slate-300 transition-colors"
            >
              <Clipboard className="w-4 h-4 text-slate-400" />
              <span>Translate Clipboard Text</span>
            </button>

            <button
              onClick={() => {
                onToggleAutoTranslate();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-800/80 text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Auto-Translate Incoming</span>
              </div>
              <div
                className={`w-7 h-4 rounded-full transition-colors relative flex items-center ${
                  autoTranslateEnabled ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    autoTranslateEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              <span>Bridge Settings & Permissions</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-800/60">
            Drag ball anywhere · Tap to trigger lens
          </div>
        </div>
      )}

      {/* Floating Ball Sphere */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-12 h-12 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center shadow-lg transition-transform ${
          isDragging ? 'scale-110 shadow-indigo-500/40 ring-4 ring-indigo-500/40' : 'hover:scale-105'
        } bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white relative group`}
        title="TalkBridge AI - Tap for instant translate options or drag over text"
      >
        <Languages className="w-5 h-5 pointer-events-none drop-shadow" />
        {/* Subtle pulsing badge ring */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full flex items-center justify-center pointer-events-none">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75" />
        </span>
      </div>
    </div>
  );
};
