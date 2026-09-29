import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Sliders,
  BookOpen,
  ArrowRightLeft,
  Smartphone,
  Info,
  Shield,
  Layers,
  Copy,
  Languages,
} from 'lucide-react';
import { MessagingApp, TranslationTone, ChatContact } from './types';
import { INITIAL_CONTACTS } from './data/presetChats';
import { SUPPORTED_LANGUAGES, getLanguageName, getLanguageSimpleName } from './data/languages';
import { PhoneFrame } from './components/PhoneFrame';
import { ChatView } from './components/ChatView';
import { FloatingBridgeBall } from './components/FloatingBridgeBall';
import { QuickTranslateStudio } from './components/QuickTranslateStudio';
import { PhrasesLibrary } from './components/PhrasesLibrary';
import { SettingsDrawer } from './components/SettingsDrawer';
import { ScreenTranslatorModal } from './components/ScreenTranslatorModal';

type NavTab = 'chat' | 'studio' | 'phrasebook' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('chat');
  const [activeApp, setActiveApp] = useState<MessagingApp>('whatsapp');
  const [contacts, setContacts] = useState<ChatContact[]>(INITIAL_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string>('c1');

  // Language Preferences (Bengali and Hindi are key focus languages from user request)
  const [myLang, setMyLang] = useState<string>('bn'); // Bengali by default
  const [targetLang, setTargetLang] = useState<string>('en'); // English by default
  const [tone, setTone] = useState<TranslationTone>('natural');

  // Floating Ball & Screen Overlay
  const [showFloatingBall, setShowFloatingBall] = useState<boolean>(true);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState<boolean>(false);
  const [showScreenTranslator, setShowScreenTranslator] = useState<boolean>(false);
  const [isExpandedFrame, setIsExpandedFrame] = useState<boolean>(false);

  // Active contact
  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  const handleSwapLanguages = () => {
    const temp = myLang;
    setMyLang(targetLang);
    setTargetLang(temp);
  };

  const handleSendPhraseToChat = (text: string) => {
    setActiveTab('chat');
    // Prepend or add to active chat
    const updatedMessages = [
      ...activeContact.messages,
      {
        id: `msg-${Date.now()}`,
        sender: 'user' as const,
        senderName: 'You',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        originalText: text,
        originalLang: targetLang,
        translatedText: text,
        targetLang: targetLang,
        isTranslated: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read' as const,
        app: activeApp,
      },
    ];

    setContacts((prev) =>
      prev.map((c) => (c.id === activeContact.id ? { ...c, messages: updatedMessages } : c))
    );
  };

  const handleApplyTranslationsToAll = () => {
    // Mark all other messages in active contact as translated
    const updated = activeContact.messages.map((m) => ({
      ...m,
      isTranslated: true,
      translatedText: m.translatedText || `[${getLanguageSimpleName(myLang)}]: ${m.originalText}`,
      targetLang: myLang,
    }));

    setContacts((prev) =>
      prev.map((c) => (c.id === activeContact.id ? { ...c, messages: updated } : c))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Global Navigation Header */}
      <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Languages className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold tracking-tight text-white">
                TalkBridge AI
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                Live Chat Translator
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Instant in-app translation for WhatsApp, Instagram, Telegram & Messenger
            </p>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'studio'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('phrasebook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'phrasebook'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phrasebook</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </nav>

        {/* Right Language Quick Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl text-slate-300">
            <span className="font-semibold text-slate-200">{getLanguageSimpleName(myLang)}</span>
            <ArrowRightLeft className="w-3 h-3 text-indigo-400" />
            <span className="font-semibold text-indigo-400">{getLanguageSimpleName(targetLang)}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        {activeTab === 'chat' && (
          <div className="w-full flex flex-col items-center">
            {/* Contact Switcher Bar */}
            <div className="w-full max-w-4xl px-4 pt-3 pb-1 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <span className="text-slate-500 font-medium text-[11px] whitespace-nowrap">
                  Simulated Contacts:
                </span>
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setActiveContactId(contact.id);
                      setActiveApp(contact.app);
                      setTargetLang(contact.primaryLang);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs whitespace-nowrap transition-all border ${
                      activeContact.id === contact.id
                        ? 'bg-slate-800 text-white border-indigo-500/60 shadow-xs'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
                    }`}
                  >
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>{contact.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      ({contact.primaryLang.toUpperCase()})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Smartphone Frame View */}
            <PhoneFrame
              activeApp={activeApp}
              onAppChange={(newApp) => setActiveApp(newApp)}
              isExpanded={isExpandedFrame}
              onToggleExpand={() => setIsExpandedFrame(!isExpandedFrame)}
            >
              {/* Chat Interface */}
              <ChatView
                contact={activeContact}
                app={activeApp}
                myLang={myLang}
                onMyLangChange={setMyLang}
                targetLang={targetLang}
                onTargetLangChange={setTargetLang}
                onSwapLanguages={handleSwapLanguages}
                tone={tone}
                onToneChange={setTone}
                autoTranslateIncoming={autoTranslateEnabled}
                onOpenPhrasebook={() => setActiveTab('phrasebook')}
              />

              {/* Floating TalkBridge Sphere */}
              {showFloatingBall && (
                <FloatingBridgeBall
                  myLang={myLang}
                  targetLang={targetLang}
                  onSwapLanguages={handleSwapLanguages}
                  onTranslateScreen={() => setShowScreenTranslator(true)}
                  onOpenClipboardTranslate={() => setActiveTab('studio')}
                  onOpenSettings={() => setActiveTab('settings')}
                  autoTranslateEnabled={autoTranslateEnabled}
                  onToggleAutoTranslate={() => setAutoTranslateEnabled(!autoTranslateEnabled)}
                />
              )}

              {/* Full-Screen Visual Scan Translator Modal */}
              {showScreenTranslator && (
                <ScreenTranslatorModal
                  contact={activeContact}
                  myLang={myLang}
                  targetLang={targetLang}
                  onClose={() => setShowScreenTranslator(false)}
                  onApplyTranslationsToChat={handleApplyTranslationsToAll}
                />
              )}
            </PhoneFrame>
          </div>
        )}

        {activeTab === 'studio' && (
          <QuickTranslateStudio
            defaultMyLang={myLang}
            defaultTargetLang={targetLang}
            onSendToChat={handleSendPhraseToChat}
          />
        )}

        {activeTab === 'phrasebook' && (
          <PhrasesLibrary
            myLang={myLang}
            targetLang={targetLang}
            onSendPhrase={handleSendPhraseToChat}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsDrawer
            myLang={myLang}
            onMyLangChange={setMyLang}
            targetLang={targetLang}
            onTargetLangChange={setTargetLang}
            tone={tone}
            onToneChange={setTone}
            showFloatingBall={showFloatingBall}
            onToggleFloatingBall={() => setShowFloatingBall(!showFloatingBall)}
            autoTranslateEnabled={autoTranslateEnabled}
            onToggleAutoTranslate={() => setAutoTranslateEnabled(!autoTranslateEnabled)}
          />
        )}
      </main>

      {/* Subtle, clean bottom status */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-500 z-10">
        <div className="flex items-center gap-2">
          <span>TalkBridge AI · Real-time bidirectional chat bridge</span>
          <span aria-hidden="true">·</span>
          <span>WhatsApp, Messenger, Instagram & Telegram</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">English · हिन्दी · বাংলা · Español · 40+ Languages</span>
        </div>
      </footer>
    </div>
  );
}
