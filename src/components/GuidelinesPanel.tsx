import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Sparkles,
  CheckCircle,
  AlertOctagon,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import HospitalMap from './HospitalMap';

interface GuidelinesPanelProps {
  guideline: {
    emergencyNameUrdu: string;
    calls: string[];
    steps: string[];
    khabardar: string[];
    tip: string;
    hospitalWhen: string;
  };
  onBackToGrid?: () => void;
}

export default function GuidelinesPanel({ guideline, onBackToGrid }: GuidelinesPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  
  // Font scale preference (normal, large, extra large)
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'huge'>('normal');
  const [copied, setCopied] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
    // Cleanup synthesis on change or unmount
    return () => {
      stopSpeaking();
    };
  }, [guideline]);

  const speakText = () => {
    if (!synthRef.current) return;

    // If currently paused, resume instead of starting new
    if (isPaused) {
      synthRef.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    // Stop anything playing
    synthRef.current.cancel();

    // Compile everything into a spoken guide
    // Clean Roman Urdu text reads best when written cleanly
    const nameIntro = `${guideline.emergencyNameUrdu} ki medical emergency. `;
    const callIntro = `Sab se pehle fow-ran ${guideline.calls.join(' ya ')} par kahle kareni. `;
    
    let stepsText = "Keya Karein. ";
    guideline.steps.forEach((step, idx) => {
      stepsText += `Kadam number ${idx + 1}: ${step}. `;
    });

    const khabardarText = `Khabardat, yeh kaam mat karein: ${guideline.khabardar.join('. ')}. `;
    const tipText = `Zaroori tip: ${guideline.tip}. `;
    const hospitalText = `Hospital fow-ran kab jana hai: ${guideline.hospitalWhen}`;

    const completeSpokenGuide = nameIntro + callIntro + stepsText + khabardarText + tipText + hospitalText;

    const utterance = new SpeechSynthesisUtterance(completeSpokenGuide);
    
    // Choose voice - look for Hindi or Urdu phonetic voice if possible, otherwise use default
    const voices = synthRef.current.getVoices();
    const urduOrHindiVoice = voices.find(v => 
      v.lang.toLowerCase().includes('hi') || 
      v.lang.toLowerCase().includes('ur') || 
      v.lang.toLowerCase().includes('in')
    );
    
    if (urduOrHindiVoice) {
      utterance.voice = urduOrHindiVoice;
    }
    
    utterance.rate = playbackRate;
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveStepIndex(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveStepIndex(null);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pauseSpeaking = () => {
    if (!synthRef.current) return;
    synthRef.current.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const stopSpeaking = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveStepIndex(null);
  };

  const adjustSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlaying) {
      // Restart with new rate to apply changes instantly
      stopSpeaking();
      setTimeout(() => {
        speakText();
      }, 50);
    }
  };

  const getShareText = () => {
    let text = `🚨 *EMERGENCY AID ASSISTANT (Pak First Aid Helper)* 🚨\n\n`;
    text += `*Masla:* ${guideline.emergencyNameUrdu.toUpperCase()}\n\n`;
    
    text += `*✅ KYA KARNA HAI (First Aid Steps):*\n`;
    guideline.steps.forEach((step, idx) => {
      text += `👉 *Step ${idx + 1}:* ${step}\n`;
    });
    
    text += `\n*❌ KHABARDAR (Yeh Galatiyan Mat Karein):*\n`;
    guideline.khabardar.forEach((item) => {
      text += `🚫 ${item}\n`;
    });
    
    text += `\n*💡 MADADGAR TIP:*\n"${guideline.tip}"\n\n`;
    text += `_Helpline Numbers:_ Rescue 1122 ya Edhi 115 fawran dial karein.\n`;
    text += `_Yeh temporary help hai, fawran Doctor/Hospital se rabta karein._`;
    return text;
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Clipboard copy failed: ", e);
    }
  };

  const handleWhatsAppShare = async () => {
    const text = getShareText();
    const appUrl = typeof window !== 'undefined' ? `\n\n💻 Open App: ${window.location.href}` : '';
    const fullText = text + appUrl;

    // Use Web Share API if supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Emergency Aid: ${guideline.emergencyNameUrdu}`,
          text: fullText,
          url: typeof window !== 'undefined' ? window.location.href : ''
        });
        console.log('Shared successfully via Web Share API');
        return;
      } catch (error: any) {
        // Only run fallback if it wasn't aborted by the user
        if (error.name === 'AbortError') {
          console.log('Share canceled by user.');
          return;
        }
        console.warn('Web Share API error, using direct WhatsApp fallback:', error);
      }
    }

    // Fallback: Direct WhatsApp Web / App share Link
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;
    window.open(url, '_blank', 'noreferrer,noopener');
  };

  return (
    <div id="guidelines-result-card" className="bg-[#0f0f0f] rounded-2xl shadow-xl border border-white/5 overflow-hidden transform transition-all duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-900 via-[#1a1a1a] to-red-950 text-white p-6 relative border-b border-red-900/40">
        <div className="absolute top-4 right-4 flex gap-2">
          {onBackToGrid && (
            <button
              onClick={onBackToGrid}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white font-medium text-xs rounded-lg transition-colors border border-white/10"
            >
              ← Sab list dekhein
            </button>
          )}
        </div>
        
        <p className="text-[10px] tracking-widest font-mono uppercase text-red-500 font-bold mb-1">
          🚨 ACTIVE EMERGENCY PROTOCOL (ROMAN URDU)
        </p>
        <h2 id="guideline-title" className="text-xl md:text-2xl font-bold tracking-tight uppercase">
          {guideline.emergencyNameUrdu}
        </h2>
      </div>

      {/* CALL BANNER */}
      <div className="bg-red-950/20 border-b border-red-900/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-600 text-white rounded-full animate-bounce shadow-[0_0_12px_rgba(220,38,38,0.8)]">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-red-400 font-extrabold text-sm uppercase">PEHLA KAAM: FAURAN AMBULANCE KO CALL KAREIN</h4>
            <p className="text-xs text-gray-400">Ghabrayein mat, call lagane ke baad ye steps follow karein.</p>
          </div>
        </div>
        
        <div className="flex gap-2.5 shrink-0 flex-wrap">
          {guideline.calls.map((num) => (
            <a
              key={num}
              href={`tel:${num}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm tracking-widest rounded-xl shadow-[0_0_12px_rgba(220,38,38,0.5)] transition-all active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>CALL {num}</span>
            </a>
          ))}
          <a
            href="tel:1122"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#111] hover:bg-white/5 active:bg-white/10 text-white font-bold text-sm tracking-widest rounded-xl shadow-md border border-white/10 transition-all active:scale-95"
          >
            <span>RESCUE 1122</span>
          </a>
        </div>
      </div>

      {/* VOICE ASSISTANT TTS PLAYER CONTROL */}
      <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white font-medium text-xs">
          <Volume2 className="w-4 h-4 text-red-500" />
          <span className="uppercase tracking-wider font-bold">Aawaz Se Sunein (Voice Guide):</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Controls */}
          <div className="flex items-center bg-[#151515] rounded-full p-1 border border-white/10 shadow-sm">
            {!isPlaying ? (
              <button
                onClick={speakText}
                className="p-1.5 text-gray-400 hover:text-white rounded-full transition-colors"
                title="Sunein (Play)"
              >
                <Play className="w-4 h-4 fill-gray-400 hover:fill-white" />
              </button>
            ) : (
              <button
                onClick={pauseSpeaking}
                className="p-1.5 text-orange-400 hover:text-orange-300 rounded-full transition-colors"
                title="Rokein (Pause)"
              >
                <Pause className="w-4 h-4 fill-orange-400" />
              </button>
            )}
            
            {(isPlaying || isPaused) && (
              <button
                onClick={stopSpeaking}
                className="p-1.5 text-red-500 hover:text-red-400 rounded-full transition-colors"
                title="Band karein (Stop)"
              >
                <Square className="w-4 h-4 fill-red-500" />
              </button>
            )}
          </div>

          {/* Speed settings */}
          <div className="flex rounded-md border border-white/10 overflow-hidden bg-[#151515] text-[10px] font-semibold text-gray-400">
            <button
              onClick={() => adjustSpeed(0.8)}
              className={`px-2 py-1 border-r border-white/5 ${playbackRate === 0.8 ? 'bg-red-650 text-white font-bold' : 'hover:bg-white/5'}`}
            >
              Aahista
            </button>
            <button
              onClick={() => adjustSpeed(1.0)}
              className={`px-2 py-1 border-r border-white/5 ${playbackRate === 1.0 ? 'bg-red-650 text-white font-bold' : 'hover:bg-white/5'}`}
            >
              Normal
            </button>
            <button
              onClick={() => adjustSpeed(1.25)}
              className={`px-2 py-1 ${playbackRate === 1.25 ? 'bg-red-650 text-white font-bold' : 'hover:bg-white/5'}`}
            >
              Tez
            </button>
          </div>
        </div>
      </div>

      {/* HANDY TOOLS (TEXT SCALER, COPY, WHATSAPP SHARE) */}
      <div className="px-6 py-3.5 bg-white/5 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Font scale buttons */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">🔡 Likhawat Size:</span>
          <div className="flex rounded-lg border border-white/10 overflow-hidden bg-[#151515] font-semibold">
            <button
              onClick={() => setFontScale('normal')}
              className={`px-3 py-1 cursor-pointer transition-colors text-[10px] uppercase border-r border-white/5 ${fontScale === 'normal' ? 'bg-red-650 text-white font-bold' : 'hover:bg-white/5 text-gray-400'}`}
            >
              Normal
            </button>
            <button
              onClick={() => setFontScale('large')}
              className={`px-3 py-1 cursor-pointer transition-colors text-[10px] uppercase border-r border-white/5 ${fontScale === 'large' ? 'bg-red-650 text-white font-bold' : 'hover:bg-white/5 text-gray-400'}`}
            >
              Bari (Large)
            </button>
            <button
              onClick={() => setFontScale('huge')}
              className={`px-3 py-1 cursor-pointer transition-colors text-[10px] uppercase ${fontScale === 'huge' ? 'bg-red-650 text-white font-bold shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'hover:bg-white/5 text-gray-400'}`}
            >
              Boht Bari (A++)
            </button>
          </div>
        </div>

        {/* Sharing / Copying actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151515] hover:bg-white/5 border border-white/10 rounded-lg text-gray-300 font-bold text-[11px] cursor-pointer transition-all active:scale-95"
            title="Sare nuskhe clipboard par copy karein"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 font-bold">Copy Hogaya!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                <span>Nuskha Copy Karein</span>
              </>
            )}
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-650/10 hover:bg-green-600/20 active:bg-green-600/30 border border-green-600/40 rounded-lg text-green-400 font-bold text-[11px] cursor-pointer transition-all active:scale-95 shadow-[0_0_8px_rgba(34,197,94,0.1)]"
            title="Web Share API ya direct WhatsApp messenger ke zariye first-aid steps share karein"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Steps (Web / WhatsApp)</span>
          </button>
        </div>
      </div>

      {/* MAIN GUIDELINES LAYOUT */}
      <div className="p-6 space-y-6">
        
        {/* HOSPITALS MAP REGION */}
        <HospitalMap emergencyName={guideline.emergencyNameUrdu} />

        {/* STEPS TO DO (Numbered Sequence) */}
        <div>
          <h3 className="text-white font-bold text-[10px] tracking-widest uppercase flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-500">✅ KYA KARO (STEP-BY-STEP KHULASA):</span>
          </h3>
          
          <div className="space-y-3.5">
            {guideline.steps.map((step, idx) => {
              const isCurrentlyActive = activeStepIndex === idx;
              
              // Dynamic text scale class mapping
              let textSizingClass = "text-gray-200 text-sm md:text-base leading-relaxed font-sans font-medium";
              if (fontScale === 'large') {
                textSizingClass = "text-white text-base md:text-lg leading-relaxed font-sans font-semibold";
              } else if (fontScale === 'huge') {
                textSizingClass = "text-white text-lg md:text-xl lg:text-2xl leading-relaxed font-sans font-extrabold tracking-wide";
              }

              return (
                <div
                  key={idx}
                  className={`flex gap-3.5 p-4 rounded-xl border transition-all duration-300 ${
                    isCurrentlyActive
                      ? 'bg-green-950/20 border-green-600 shadow-[0_0_15px_rgba(34,197,94,0.15)] translate-x-1'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 text-green-400 font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <p className={textSizingClass}>
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* KHABARDAR - DO NOT DO (Red Callout Box) */}
        <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl">
          <h4 className="text-red-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
            <AlertOctagon className="w-5 h-5 text-red-500" />
            <span>❌ KHABARDAR — YEH GHALTIYAN MAT KAREIN:</span>
          </h4>
          <ul className="space-y-3">
            {guideline.khabardar.map((item, idx) => (
              <li key={idx} className="flex items-center space-x-3 text-sm text-gray-300">
                <span className="text-red-500">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* EXTRA USEFUL EXPERT TIP (Amber Callout Box) */}
        <div className="bg-blue-950/20 border border-blue-900/50 p-6 rounded-2xl flex gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl shrink-0 h-fit">
            <Sparkles className="w-4 h-4 fill-blue-500/10" />
          </div>
          <div>
            <h5 className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">
              💡 ZAROORI PRACTICAL TIP:
            </h5>
            <p className="text-blue-100/80 text-sm leading-snug font-medium italic">
              "{guideline.tip}"
            </p>
          </div>
        </div>

        {/* WHEN TO GO TO HOSPITAL DEEP CALLOUT */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
          <h4 className="text-yellow-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-2">
            <Clock className="w-4.5 h-4.5 text-yellow-400" />
            <span>⏰ FAURAN HOSPITAL JAO AGAR INMEIN SE KUCH BHI HO:</span>
          </h4>
          <p className="text-yellow-105/80 text-xs md:text-sm leading-relaxed">
            {guideline.hospitalWhen}
          </p>
        </div>

        {/* Emergency Disclaimer & Standard Instruction */}
        <div className="text-center pt-4 border-t border-white/5">
          <p className="text-[10px] text-yellow-200/60 leading-tight uppercase font-bold max-w-lg mx-auto">
            ⚠️ Yeh temporary help hai. Main doctor nahi hoon. Hospital pohanchna sab se zaroori hai.
          </p>
        </div>

      </div>
    </div>
  );
}
