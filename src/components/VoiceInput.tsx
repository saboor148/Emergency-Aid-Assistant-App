import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  lang?: string;
  placeholderText?: string;
}

export default function VoiceInput({ onTranscript, lang = 'ur-PK', placeholderText = 'Bol kar btaiye...' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for standard Web Speech API recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser doesn't support speech recognition natively (or inside an iframe)
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang; // Set default language (Roman Urdu/Hindi/English map nicely to ur-PK or hi-IN/en-US)

    rec.onstart = () => {
      setIsListening(true);
      setErrorMsg(null);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        setErrorMsg('Microphone ki permission chahiye. Settings mein check karein.');
      } else if (event.error === 'no-speech') {
        setErrorMsg('Aawaz nahi aayi. Dobara try karein.');
      } else {
        setErrorMsg('Voice input failed. Kuch der baad koshish karein.');
      }
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim() !== '') {
        onTranscript(transcript);
      }
    };

    recognitionRef.current = rec;
  }, [lang, onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setErrorMsg(null);
      if (!recognitionRef.current) {
        // Redefine if missing
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          setErrorMsg('Aapka browser voice recording support nahi karta. Type karein.');
          return;
        }
      }
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Start error:', err);
        setErrorMsg('Microphone start nahi ho saka.');
      }
    }
  };

  const isSupported = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        id="btn-voice-recognize"
        onClick={toggleListening}
        className={`relative flex items-center justify-center p-4 rounded-full transition-all duration-300 ${
          isListening
            ? 'bg-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.8)] scale-110 ring-4 ring-red-900/50'
            : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
        }`}
        title={isListening ? 'Sunte hain... Stop krne k lye click kren' : 'Aawaz se pucho (Speak Now)'}
      >
        {isListening ? (
          <>
            <Mic className="w-6 h-6 z-10" />
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
          </>
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      {isListening && (
        <span className="mt-2 text-xs font-medium text-red-600 animate-pulse tracking-wide font-mono">
          🚨 SUNTE HAIN... (SPEAK NOW)
        </span>
      )}

      {errorMsg && (
        <div className="mt-2 text-red-600 text-xs flex items-center gap-1 bg-red-50 border border-red-100 rounded-md py-1 px-3 max-w-xs text-center">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!isSupported && (
        <span className="mt-1 text-[10px] text-gray-400 text-center max-w-xs leading-relaxed">
          Upar click kar k bolen. Agar support na ho to standard keypad se type karein.
        </span>
      )}
    </div>
  );
}
