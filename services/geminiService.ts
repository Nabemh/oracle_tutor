import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";
import { base64ToUint8Array, decodeAudioData } from "./audioUtils";

// Initialize Gemini API
// Note: In a real app, ensure process.env.API_KEY is available.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateTextResponse = async (
  prompt: string,
  language: Language,
  history: { role: string; parts: { text: string }[] }[] = []
): Promise<{ text: string; detectedLanguage?: Language }> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION(language),
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      })),
    });

    // We append a hidden instruction to detect language
    const detectionPrompt = `${prompt}\n\n[SYSTEM: Detect the language of this message. If it is Hausa, Igbo, Yoruba, or Nigerian Pidgin, reply in that language. Start your response with a tag like [LANG:HAUSA], [LANG:IGBO], [LANG:YORUBA], [LANG:PIDGIN] or [LANG:ENGLISH]. Default to the current language if unsure.]`;

    const result = await chat.sendMessage({ message: detectionPrompt });
    let responseText = result.text || "";
    let detectedLanguage: Language | undefined;

    // Parse the tag
    const langMatch = responseText.match(/^\[LANG:([A-Z\s]+)\]/i);
    if (langMatch) {
      const code = langMatch[1].toUpperCase();
      responseText = responseText.replace(/^\[LANG:[^\]]+\]\s*/, ''); // Remove tag from display text
      
      switch (code) {
        case 'HAUSA': detectedLanguage = Language.HAUSA; break;
        case 'IGBO': detectedLanguage = Language.IGBO; break;
        case 'YORUBA': detectedLanguage = Language.YORUBA; break;
        case 'PIDGIN': 
        case 'NIGERIAN PIDGIN': detectedLanguage = Language.PIDGIN; break;
        case 'ENGLISH': detectedLanguage = Language.ENGLISH; break;
      }
    }

    return { text: responseText, detectedLanguage };
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

export const transcribeAudio = async (
  audioBlob: globalThis.Blob,
  language: Language
): Promise<string> => {
  try {
    // Convert Blob to Base64
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: audioBlob.type,
                    data: base64data
                  }
                },
                {
                  text: `Transcribe this audio exactly. The language is likely ${language}, but if it sounds like Hausa, Igbo, Yoruba or Pidgin, transcribe it in that language.`
                }
              ]
            }
          });
          resolve(response.text || "");
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  } catch (error) {
    console.error("Transcribe error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string, language: Language) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }, // Puck is generally clear
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const audioBuffer = await decodeAudioData(
      base64ToUint8Array(base64Audio),
      audioContext,
      24000,
      1
    );

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    
    return true;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};