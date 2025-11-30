import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Language } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../services/audioUtils';
import { 
  PhoneIcon, 
  PhoneXMarkIcon, 
  SparklesIcon, 
  PencilSquareIcon, 
  XMarkIcon 
} from '@heroicons/react/24/solid';

interface LiveSessionProps {
  language: Language;
}

const LiveSession: React.FC<LiveSessionProps> = ({ language }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [boardContent, setBoardContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<Promise<any> | null>(null);

  const startSession = async () => {
    setError(null);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Define Tool
      const displayBoardTool: FunctionDeclaration = {
        name: "display_board",
        description: "Display text, equations, or lists on a visual board for the user to see while you speak.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                content: {
                    type: Type.STRING,
                    description: "The content to display. Can be markdown, math equations, or bullet points."
                }
            },
            required: ["content"]
        }
      };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            setIsConnected(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Tool Calls
            if (message.toolCall) {
                console.log("Tool Call Received:", message.toolCall);
                const calls = message.toolCall.functionCalls;
                if (calls && calls.length > 0) {
                    const call = calls[0];
                    if (call.name === 'display_board') {
                        const content = (call.args as any).content;
                        setBoardContent(content);
                        
                        // Send confirmation back to model
                        sessionPromise.then(session => {
                            session.sendToolResponse({
                                functionResponses: [{
                                    id: call.id,
                                    name: call.name,
                                    response: { result: "Content displayed on board" }
                                }]
                            });
                        });
                    }
                }
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setIsSpeaking(true);
              const ctx = audioContextRef.current;
              if (!ctx) return;

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                 sourcesRef.current.delete(source);
                 if (sourcesRef.current.size === 0) setIsSpeaking(false);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(src => { try { src.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onclose: () => {
            console.log("Live Session Closed");
            setIsConnected(false);
          },
          onerror: (err) => {
            console.error(err);
            setError("Connection severed. The spirits are quiet.");
            endSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION(language),
          tools: [{ functionDeclarations: [displayBoardTool] }],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          }
        }
      });
      sessionRef.current = sessionPromise;
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to start ritual");
    }
  };

  const endSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Fix: Check state before closing to avoid "Cannot close a closed AudioContext" error
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
    }
    
    if (sessionRef.current) {
        sessionRef.current.then(session => session.close());
        sessionRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
    setBoardContent(null);
  };

  useEffect(() => {
    return () => endSession();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-emerald-50 relative overflow-hidden">
        
        {/* Animated Background Aura */}
        {isConnected && (
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                 <div className={`w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px] transition-all duration-300 ${isSpeaking ? 'scale-125 opacity-40' : 'scale-100 opacity-20'}`}></div>
                 <div className={`absolute w-64 h-64 rounded-full bg-amber-500/10 blur-[80px] transition-all duration-500 ${isSpeaking ? 'scale-110 opacity-30' : 'scale-90 opacity-10'}`}></div>
            </div>
        )}

      {/* Visual Board Overlay (Dialog Box) */}
      {boardContent && (
        <div className="absolute top-2 left-2 right-2 md:top-6 md:left-6 md:right-6 z-30 animate-[slideDown_0.5s_ease-out]">
            <div className="bg-stone-900/95 border-2 border-emerald-500/50 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-xl relative max-w-2xl mx-auto ring-1 ring-white/10">
                <button 
                    onClick={() => setBoardContent(null)}
                    className="absolute top-2 right-2 p-2 text-emerald-500/50 hover:text-red-400 bg-stone-800/50 rounded-full transition-colors"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
                <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                    <PencilSquareIcon className="w-4 h-4" />
                    Oracle's Slate
                </h3>
                <div className="prose prose-invert prose-lg text-emerald-50 font-medium leading-relaxed max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-700">
                    <ReactMarkdown>{boardContent}</ReactMarkdown>
                </div>
            </div>
        </div>
      )}

      <div className="z-10 flex flex-col items-center space-y-10 max-w-md w-full">
        
        <div className="relative">
             {/* Central Visual */}
             <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-700 relative ${
                 isConnected 
                 ? 'bg-stone-900 border-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]' 
                 : 'bg-stone-900 border-4 border-stone-700 shadow-none'
             }`}>
                {/* Rings */}
                {isConnected && (
                    <>
                    <div className={`absolute inset-0 rounded-full border border-emerald-400/30 ${isSpeaking ? 'animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]' : 'scale-105'}`}></div>
                    <div className={`absolute inset-0 rounded-full border border-emerald-400/20 ${isSpeaking ? 'animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] delay-150' : 'scale-110'}`}></div>
                    </>
                )}
                
                <div className="text-6xl transition-transform duration-300">
                    {isConnected ? (isSpeaking ? '🗣️' : '👂') : '💤'}
                </div>
             </div>
             
             {/* Status Badge */}
             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-stone-900 px-4 py-1 rounded-full border border-emerald-500/30 text-xs font-bold uppercase tracking-wider text-emerald-300 shadow-lg whitespace-nowrap">
                 {isConnected ? (isSpeaking ? "Oracle Speaking" : "Listening") : "Dormant"}
             </div>
        </div>

        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-amber-200">
                Voice Communion
            </h2>
            <p className="text-emerald-400/60 text-sm">
                Speak naturally. The Oracle will adapt to your tongue in <span className="text-emerald-300 font-bold">{language}</span>, Hausa, Igbo, Yoruba or Pidgin.
            </p>
        </div>

        {error && (
            <div className="px-4 py-2 bg-red-900/50 border border-red-500/30 rounded-lg text-red-200 text-sm backdrop-blur-sm animate-pulse">
                {error}
            </div>
        )}

        <button
          onClick={isConnected ? endSession : startSession}
          className={`w-full max-w-xs py-4 px-6 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 border ${
            isConnected
              ? 'bg-gradient-to-r from-red-900/80 to-red-800/80 border-red-500/50 text-red-100 hover:bg-red-900'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/50 text-white hover:shadow-emerald-900/50'
          }`}
        >
          {isConnected ? (
              <>
                <PhoneXMarkIcon className="w-6 h-6" /> End Session
              </>
          ) : (
              <>
                <PhoneIcon className="w-6 h-6" /> Begin Session
              </>
          )}
        </button>
      </div>
      
      <div className="absolute bottom-6 flex items-center gap-2 text-emerald-500/20 text-xs font-mono">
          <SparklesIcon className="w-4 h-4" />
          <span>Real-time Audio Latency: Ultra Low</span>
      </div>
    </div>
  );
};

export default LiveSession;