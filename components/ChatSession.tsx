
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Language, Message } from '../types';
import { generateTextResponse, transcribeAudio, generateSpeech } from '../services/geminiService';
import { generateOfflineResponse, getOfflineIntro } from '../services/offlineService';
import { 
  MicrophoneIcon, 
  PaperAirplaneIcon, 
  SpeakerWaveIcon, 
  StopIcon, 
  UserIcon, 
  SparklesIcon,
  TrashIcon,
  LanguageIcon
} from '@heroicons/react/24/solid';

interface ChatSessionProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  isOnline: boolean;
}

const STORAGE_KEY = 'oracle_chat_history_v1';

const ChatSession: React.FC<ChatSessionProps> = ({ language, setLanguage, isOnline }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hydrated = parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
        setMessages(hydrated);
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    } else {
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: `Sannu! I am Oracle, your digital elder.\n\nI can help you learn in ${language}. How can I assist you today?`,
        timestamp: new Date(),
      }]);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, initialized]);

  useEffect(() => {
    if (!initialized) return;
    if (!isOnline) {
       const offlineIntro = getOfflineIntro(language);
       const lastMsg = messages[messages.length - 1];
       if (lastMsg && lastMsg.text !== offlineIntro && lastMsg.role === 'model') {
           // Silent handling
       }
    }
  }, [language, isOnline, initialized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let responseText = "";
      let detectedLang: Language | undefined;

      if (isOnline) {
          const history = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }));
          const result = await generateTextResponse(inputText, language, history);
          responseText = result.text;
          detectedLang = result.detectedLanguage;
      } else {
          await new Promise(r => setTimeout(r, 600));
          const result = generateOfflineResponse(inputText, language);
          responseText = result.text;
          detectedLang = result.detectedLanguage;
      }

      if (detectedLang && detectedLang !== language) {
          setLanguage(detectedLang);
          const switchMsg: Message = {
              id: (Date.now() + 2).toString(),
              role: 'model',
              text: `[Switching to ${detectedLang}]`,
              timestamp: new Date()
          };
          // Optional: Insert a small notification message about the switch
          // setMessages((prev) => [...prev, switchMsg]);
      }

      if (responseText) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
         id: Date.now().toString(),
         role: 'model',
         text: isOnline ? "I'm having trouble connecting to the spirits (server)." : "Offline mode error.",
         timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    if (!isOnline) {
        alert("Voice input requires internet connection.");
        return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); 
        setIsLoading(true);
        try {
          const transcription = await transcribeAudio(audioBlob, language);
          setInputText(transcription);
          // Auto-send could be enabled here, but let's let user review
        } catch (err) {
            console.error(err);
            alert("Failed to hear you properly.");
        } finally {
            setIsLoading(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone error:", error);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTTS = async (text: string) => {
    if (!isOnline) {
        alert("Speech synthesis requires internet connection.");
        return;
    }
    try {
      await generateSpeech(text, language);
    } catch (error) {
      alert("Unable to speak right now.");
    }
  };

  const clearHistory = () => {
      if(confirm("Clear this conversation?")) {
          setMessages([]);
          localStorage.removeItem(STORAGE_KEY);
      }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border shadow-lg ${
                msg.role === 'model' 
                ? 'bg-gradient-to-br from-emerald-500 to-amber-500 border-emerald-300' 
                : 'bg-stone-700 border-stone-500'
            }`}>
                {msg.role === 'model' ? <SparklesIcon className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-stone-300" />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                className={`px-5 py-3.5 rounded-2xl shadow-md border backdrop-blur-sm ${
                    msg.role === 'user'
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-500/50 rounded-tr-none'
                    : 'bg-gradient-to-br from-stone-800/90 to-stone-900/90 text-emerald-50 border-emerald-500/20 rounded-tl-none'
                }`}
                >
                    {msg.role === 'model' ? (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-emerald-300 prose-strong:text-emerald-200">
                             <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                    )}
                </div>
                
                {/* Meta */}
                <div className="flex items-center gap-2 mt-1.5 px-1">
                    <span className="text-[10px] text-emerald-500/60 font-medium tracking-wide">
                        {formatTime(msg.timestamp)}
                    </span>
                    {msg.role === 'model' && (
                         <button
                         onClick={() => handleTTS(msg.text)}
                         disabled={!isOnline}
                         className={`p-1 rounded-full transition-colors ${!isOnline ? 'text-stone-600' : 'text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-500/10'}`}
                         title="Listen"
                         >
                         <SpeakerWaveIcon className="w-3 h-3" />
                         </button>
                    )}
                </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center border border-emerald-300 shadow-lg">
                <SparklesIcon className="w-5 h-5 text-white animate-pulse" />
             </div>
             <div className="bg-stone-800/80 px-4 py-3 rounded-2xl rounded-tl-none border border-emerald-500/20 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
                {/* Visual feedback for auto-language detection */}
                <LanguageIcon className="w-3 h-3 text-emerald-500/50 animate-pulse ml-2" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gradient-to-t from-stone-950/90 to-stone-900/50 backdrop-blur-md border-t border-emerald-500/20">
        <div className="relative max-w-4xl mx-auto flex items-center gap-3">
          
          {/* Clear History (Hidden but accessible) */}
          {messages.length > 1 && (
            <button onClick={clearHistory} className="absolute -top-10 right-0 p-1.5 text-red-400/50 hover:text-red-300 bg-stone-900/80 rounded-full border border-red-500/20 backdrop-blur transition-all text-xs flex items-center gap-1">
                <TrashIcon className="w-3 h-3" /> Clear
            </button>
          )}

          <div className="flex-1 relative flex items-center bg-stone-900/60 border border-emerald-500/30 rounded-xl hover:border-emerald-400/50 transition-colors shadow-inner">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={!isOnline ? "Message Oracle (Offline)..." : isRecording ? "Listening..." : "Seek wisdom (Auto-Language Detection)..."}
              className="w-full pl-4 pr-12 py-3.5 bg-transparent border-none text-emerald-50 placeholder-emerald-700/50 focus:ring-0 text-sm font-medium"
              disabled={isRecording}
            />
            
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isOnline}
                className={`absolute right-2 p-2 rounded-lg transition-all ${
                !isOnline 
                    ? 'text-stone-700 cursor-not-allowed'
                    : isRecording
                        ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/50'
                        : 'text-emerald-500/50 hover:text-emerald-300 hover:bg-emerald-500/10'
                }`}
            >
                {isRecording ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`p-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center border ${
                !inputText.trim() || isLoading 
                ? 'bg-stone-800 text-stone-600 border-stone-700 cursor-not-allowed' 
                : isOnline 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400/50 hover:shadow-emerald-900/50 hover:scale-105' 
                    : 'bg-amber-700 text-amber-100 border-amber-500/50 hover:bg-amber-600'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2 text-[10px] text-emerald-500/30 font-mono uppercase tracking-widest flex items-center justify-center gap-1">
             {isOnline ? (
               <>
                <span>Connected to Gemini Spirit</span>
                <span className="mx-1">•</span>
                <span>Language Detection Active</span>
               </>
             ) : 'Local Knowledge Base'}
        </div>
      </div>
    </div>
  );
};

export default ChatSession;
