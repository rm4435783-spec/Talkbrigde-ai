import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChatContact, ChatMessage, MessagingApp, TranslationTone } from '../types';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { ChatComposer } from './ChatComposer';
import { SmartRepliesModal } from './SmartRepliesModal';
import { translateText } from '../services/translationService';
import { detectLanguage } from '../services/languageDetector';
import { PlusCircle, Sparkles, MessageSquarePlus } from 'lucide-react';
import { getLanguageSimpleName } from '../data/languages';

interface ChatViewProps {
  contact: ChatContact;
  app: MessagingApp;
  myLang: string;
  onMyLangChange: (lang: string) => void;
  targetLang: string;
  onTargetLangChange: (lang: string) => void;
  onSwapLanguages: () => void;
  tone: TranslationTone;
  onToneChange: (tone: TranslationTone) => void;
  autoTranslateIncoming: boolean;
  onOpenPhrasebook?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  contact,
  app,
  myLang,
  onMyLangChange,
  targetLang,
  onTargetLangChange,
  onSwapLanguages,
  tone,
  onToneChange,
  autoTranslateIncoming,
  onOpenPhrasebook,
}) => {
  // Initialize messages with auto-detected language metadata
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    contact.messages.map((m) => ({
      ...m,
      detectedLang: m.sender === 'other' ? detectLanguage(m.originalText) : undefined,
    }))
  );
  const [activeReplyMessage, setActiveReplyMessage] = useState<ChatMessage | null>(null);
  const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update messages when contact changes and run detection
  useEffect(() => {
    setMessages(
      contact.messages.map((m) => ({
        ...m,
        detectedLang: m.sender === 'other' ? detectLanguage(m.originalText) : undefined,
      }))
    );
  }, [contact]);

  // Detected language for the latest incoming message
  const latestIncomingDetectedLang = useMemo(() => {
    const lastOtherMsg = [...messages].reverse().find((m) => m.sender === 'other');
    if (!lastOtherMsg) return null;
    return lastOtherMsg.detectedLang || detectLanguage(lastOtherMsg.originalText);
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-translate incoming messages if enabled
  useEffect(() => {
    if (!autoTranslateIncoming) return;

    messages.forEach((msg) => {
      if (msg.sender === 'other' && !msg.isTranslated && !translatingIds[msg.id]) {
        handleTranslateMessage(msg.id);
      }
    });
  }, [autoTranslateIncoming, messages]);

  // Translate specific message with mock auto-detection
  const handleTranslateMessage = async (messageId: string) => {
    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg) return;

    setTranslatingIds((prev) => ({ ...prev, [messageId]: true }));

    // Auto-detect language of incoming text using mock service
    const detected = targetMsg.detectedLang || detectLanguage(targetMsg.originalText);
    const effectiveSourceLang =
      targetLang === 'auto' || targetMsg.originalLang === 'auto'
        ? detected.code
        : targetMsg.originalLang;

    try {
      const result = await translateText(
        targetMsg.originalText,
        effectiveSourceLang,
        myLang,
        tone,
        app
      );

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                isTranslated: true,
                translatedText: result.translatedText,
                targetLang: myLang,
                pronunciation: result.pronunciation,
                toneNotes: result.toneNotes,
                detectedLang: detected,
              }
            : m
        )
      );
    } catch (e) {
      console.error('Failed to translate message:', e);
    } finally {
      setTranslatingIds((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  // Translate ALL messages currently in chat
  const handleTranslateAll = async () => {
    const untranslated = messages.filter((m) => !m.isTranslated);
    for (const msg of untranslated) {
      await handleTranslateMessage(msg.id);
    }
  };

  // Send message
  const handleSendMessage = (original: string, translated: string, pronunciation?: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: 'You',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      originalText: original,
      originalLang: myLang,
      translatedText: translated,
      targetLang: targetLang,
      isTranslated: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      pronunciation,
      app,
      tone,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Simulate double ticks / delivered / read
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m))
      );
    }, 600);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
      );
    }, 1400);
  };

  // Trigger quick reply insert
  const handleSelectQuickReply = (text: string) => {
    handleSendMessage(text, text);
    setActiveReplyMessage(null);
  };

  // Simulate an incoming message in foreign language to demonstrate live translation
  const simulateIncoming = async (lang: 'hi' | 'bn' | 'en' | 'es') => {
    const incomingSamples: Record<'hi' | 'bn' | 'en' | 'es', string[]> = {
      hi: [
        'भाई, कल शाम को क्या प्लान है? क्या हम सब साथ में डिनर कर रहे हैं?',
        'मैंने वह फ़ाइल चेक कर ली है, सब कुछ एकदम सही है!',
        'अरे सुनो, क्या तुम्हें इस नए प्रोजेक्ट के बारे में जानकारी मिली?',
      ],
      bn: [
        'তুমি কি কালকে ঢাকায় আসছো? আমাদের সাথে অবশ্যই দেখা করবে!',
        'আমি ফাইলগুলো সব রেডি করে দিয়েছি, একটু দেখে নিও।',
        'আজকের আবহাওয়াটা বেশ সুন্দর, চল বিকেলে চা খেতে যাই।',
      ],
      en: [
        'Hey! Are we still meeting for lunch today at 1 PM?',
        'Could you review the proposal slides and let me know your thoughts?',
        'The client loved our draft! Amazing work on the designs.',
      ],
      es: [
        '¡Hola! ¿Estás libre para una llamada rápida de 5 minutos?',
        'Te envié los detalles por correo. ¡Avísame cuando los revises!',
      ],
    };

    const pool = incomingSamples[lang] || incomingSamples.en;
    const randomText = pool[Math.floor(Math.random() * pool.length)];
    const detected = detectLanguage(randomText);

    const incomingMsg: ChatMessage = {
      id: `incoming-${Date.now()}`,
      sender: 'other',
      senderName: contact.name,
      avatar: contact.avatar,
      originalText: randomText,
      originalLang: lang,
      detectedLang: detected,
      isTranslated: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
      app,
    };

    setMessages((prev) => [...prev, incomingMsg]);

    if (autoTranslateIncoming) {
      setTimeout(() => {
        handleTranslateMessage(incomingMsg.id);
      }, 300);
    }
  };

  // Background pattern per app
  const getChatBg = () => {
    switch (app) {
      case 'whatsapp':
        return 'bg-[#0b141a] bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]';
      case 'instagram':
        return 'bg-slate-950';
      case 'telegram':
        return 'bg-[#0e1621] bg-[radial-gradient(#182533_1px,transparent_1px)] [background-size:20px_20px]';
      case 'messenger':
      default:
        return 'bg-slate-950';
    }
  };

  return (
    <div className={`relative flex flex-col flex-1 h-full w-full ${getChatBg()} overflow-hidden`}>
      {/* Top Header */}
      <ChatHeader
        contact={contact}
        app={app}
        myLang={myLang}
        onMyLangChange={onMyLangChange}
        targetLang={targetLang}
        onTargetLangChange={onTargetLangChange}
        onSwapLanguages={onSwapLanguages}
        detectedIncomingLang={latestIncomingDetectedLang}
      />

      {/* Quick Test Simulator Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 px-3 py-1 flex items-center justify-between text-[11px] text-slate-400 z-10 shrink-0">
        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
          <MessageSquarePlus className="w-3 h-3 text-indigo-400" />
          Simulate incoming:
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => simulateIncoming('en')}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[10px]"
            title="Receive English message"
          >
            + English
          </button>
          <button
            onClick={() => simulateIncoming('hi')}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[10px]"
            title="Receive Hindi message"
          >
            + Hindi
          </button>
          <button
            onClick={() => simulateIncoming('bn')}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[10px]"
            title="Receive Bengali message"
          >
            + Bengali
          </button>
          <button
            onClick={() => simulateIncoming('es')}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[10px]"
            title="Receive Spanish message"
          >
            + Spanish
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 relative">
        {/* Date Divider */}
        <div className="flex items-center justify-center my-3">
          <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-medium text-slate-400 shadow-xs">
            Today · TalkBridge AI Active
          </span>
        </div>

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            app={app}
            myPreferredLang={myLang}
            onTranslate={handleTranslateMessage}
            onQuickReply={(msg) => setActiveReplyMessage(msg)}
            isTranslating={Boolean(translatingIds[message.id])}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Outgoing Chat Composer */}
      <ChatComposer
        app={app}
        myLang={myLang}
        recipientLang={targetLang}
        onSendMessage={handleSendMessage}
        tone={tone}
        onToneChange={onToneChange}
      />

      {/* Smart Replies Overlay Modal */}
      {activeReplyMessage && (
        <SmartRepliesModal
          message={activeReplyMessage}
          targetLang={activeReplyMessage.originalLang}
          onSelectReply={handleSelectQuickReply}
          onClose={() => setActiveReplyMessage(null)}
        />
      )}
    </div>
  );
};
