
import React, { useState, useEffect } from 'react';
import { AppMode, Language } from './types';
import ChatSession from './components/ChatSession';
import LiveSession from './components/LiveSession';
import { 
  ChatBubbleLeftRightIcon, 
  MicrophoneIcon, 
  SignalIcon, 
  SignalSlashIcon, 
  SparklesIcon,
  SunIcon,
  LanguageIcon
} from '@heroicons/react/24/solid';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.TEXT);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiKeySet, setApiKeySet] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (process.env.API_KEY) {
         setApiKeySet(true);
    } else {
         console.warn("API_KEY environment variable is missing.");
         setApiKeySet(true); 
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!apiKeySet) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-950 via-stone-900 to-amber-950 text-emerald-50 font-sans overflow-hidden flex flex-col">
      {/* African Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M30 0l30 30-30 30L0 30zM15 15l15 15-15 15-15-15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Geometric Accents */}
      <div className="absolute top-10 right-10 w-32 h-32 border-2 border-emerald-500/10 rotate-45 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 border-2 border-amber-500/10 rotate-12 pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-50 bg-gradient-to-r from-emerald-900/80 to-stone-900/80 backdrop-blur-xl border-b border-emerald-500/30 shadow-lg transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-amber-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-emerald-300 shadow-lg shadow-emerald-900/50">
                <SunIcon className="w-7 h-7 text-white animate-[spin_12s_linear_infinite]" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-emerald-900 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-amber-200">ORACLE</h1>
              <p className="text-xs text-emerald-400 font-medium tracking-widest uppercase">Digital Elder • Ancient Wisdom</p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
             {/* Connectivity Status */}
             <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                 isOnline 
                 ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' 
                 : 'bg-red-500/20 border-red-500/30 text-red-300'
             }`}>
                {isOnline ? <SignalIcon className="w-3.5 h-3.5" /> : <SignalSlashIcon className="w-3.5 h-3.5" />}
                <span className="uppercase">{isOnline ? 'Online' : 'Offline'}</span>
             </div>

             {/* Language Indicator (Auto-detected) */}
             <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-800/80 border border-emerald-500/30 rounded-lg" title="Language is automatically detected">
                <LanguageIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-100 text-sm font-medium">{language}</span>
             </div>

            <div className="flex bg-stone-900/50 p-1 rounded-lg border border-emerald-500/20">
                <button
                    onClick={() => setMode(AppMode.TEXT)}
                    className={`p-2 rounded-md transition-all duration-300 ${
                    mode === AppMode.TEXT
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg'
                        : 'text-emerald-500/50 hover:text-emerald-300 hover:bg-emerald-500/10'
                    }`}
                    title="Text Chat"
                >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setMode(AppMode.LIVE)}
                    disabled={!isOnline}
                    className={`p-2 rounded-md transition-all duration-300 ${
                    mode === AppMode.LIVE
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg'
                        : isOnline ? 'text-emerald-500/50 hover:text-emerald-300 hover:bg-emerald-500/10' : 'text-stone-700 cursor-not-allowed'
                    }`}
                    title="Live Voice"
                >
                    <MicrophoneIcon className="w-5 h-5" />
                </button>
            </div>
          </div>
        </div>
        
        {/* Offline Banner */}
        {!isOnline && (
            <div className="bg-red-900/90 text-red-100 text-xs text-center py-1 font-semibold backdrop-blur-sm border-b border-red-500/20">
                Offline Mode Active: Limited knowledge base available.
            </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full p-2 sm:p-4 flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden backdrop-blur-sm border border-emerald-500/10 bg-stone-950/30 shadow-2xl">
          {mode === AppMode.TEXT ? (
            <ChatSession language={language} setLanguage={setLanguage} isOnline={isOnline} />
          ) : (
            isOnline ? <LiveSession language={language} /> : (
                <div className="h-full flex flex-col items-center justify-center text-emerald-500/50 p-6 text-center">
                    <div className="w-20 h-20 bg-stone-900/50 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                        <SignalSlashIcon className="w-10 h-10 opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-200 mb-2">Connection Required</h3>
                    <p className="text-emerald-400/60 max-w-xs">The Oracle needs to consult the cloud for voice interaction. Please reconnect or switch to Text Chat.</p>
                    <button onClick={() => setMode(AppMode.TEXT)} className="mt-8 px-6 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 rounded-full text-emerald-200 transition-all">
                        Return to Text Chat
                    </button>
                </div>
            )
          )}
        </div>
        
        {/* Footer */}
        <div className="text-center pt-3 pb-1 shrink-0">
            <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-500/40 uppercase tracking-widest">
                <SparklesIcon className="w-3 h-3" />
                <span>Optimized for Rural Connectivity</span>
                <SparklesIcon className="w-3 h-3" />
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;
