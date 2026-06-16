import React, { useState, useEffect, useMemo } from 'react';
import {
  HeartPulse,
  Activity,
  Brain,
  Wind,
  Droplets,
  Flame,
  AlertTriangle,
  Skull,
  Zap,
  Sun,
  Shield,
  Eye,
  Baby,
  Heart,
  Plus,
  Search,
  CheckCircle2,
  Check,
  RotateCcw,
  Stethoscope,
  BookOpen,
  Award,
  Info,
  Clock,
  Menu,
  X,
  PhoneCall,
  MapPin,
  Compass
} from 'lucide-react';

import { EMERGENCIES_DATA } from './data/emergencies';
import { QUIZ_QUESTIONS, FIRST_AID_BOX_ITEMS, SurvivalItem, QuizQuestion } from './data/training';
import { EmergencyCategory, PAKISTAN_NUMBERS } from './types';
import VoiceInput from './components/VoiceInput';
import GuidelinesPanel from './components/GuidelinesPanel';
import MapView from './components/MapView';

// Icon mapping handler to safely render Lucide-React items
const iconMap: { [key: string]: React.ComponentType<any> } = {
  HeartPulse,
  Activity,
  Brain,
  Wind,
  Droplet: Droplets,
  Flame,
  Scissors: AlertTriangle,
  Skull,
  Zap,
  Waves: Droplets,
  Sun,
  AlertTriangle,
  ShieldAlert: AlertTriangle,
  Shield,
  Eye,
  Baby,
  Plus,
  Heart
};

export default function App() {
  // Navigation tabs and layout states
  const [activeTab, setActiveTab] = useState<'emergencies' | 'quiz' | 'box'>('emergencies');
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyCategory['guideline'] | null>(null);
  
  // Search and AI Query states
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Quiz Module states
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Geolocation permission tracking state
  const [geoPermission, setGeoPermission] = useState<'prompt' | 'granted' | 'denied' | 'loading'>('loading');

  // Online/offline tracking state
  const [isOnline, setIsOnline] = useState(() => typeof window !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!navigator.permissions) {
      setGeoPermission('prompt');
      return;
    }

    let permissionStatus: PermissionStatus | null = null;
    
    const updatePermission = () => {
      if (permissionStatus) {
        setGeoPermission(permissionStatus.state);
      }
    };

    navigator.permissions.query({ name: 'geolocation' })
      .then((status) => {
        permissionStatus = status;
        setGeoPermission(status.state);
        try {
          status.addEventListener('change', updatePermission);
        } catch (e) {
          try {
            status.onchange = updatePermission;
          } catch (err) {
            console.warn("Could not attach listener to PermissionStatus state", err);
          }
        }
      })
      .catch((err) => {
        console.warn("Error querying geolocation permissions", err);
        setGeoPermission('prompt');
      });

    return () => {
      if (permissionStatus) {
        try {
          permissionStatus.removeEventListener('change', updatePermission);
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Household checklist state
  const [checkedItems, setCheckedItems] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('first_aid_box_checked');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Track ticking of boxes
  const toggleCheckItem = (itemName: string) => {
    setCheckedItems((prev) => {
      const updated = prev.includes(itemName)
        ? prev.filter((i) => i !== itemName)
        : [...prev, itemName];
      localStorage.setItem('first_aid_box_checked', JSON.stringify(updated));
      return updated;
    });
  };

  // Real-time local filtering of the 19 Emergency situations
  const filteredEmergencies = useMemo(() => {
    if (!searchQuery.trim()) return EMERGENCIES_DATA;
    const query = searchQuery.toLowerCase().trim();
    return EMERGENCIES_DATA.filter(
      (item) =>
        item.nameEng.toLowerCase().includes(query) ||
        item.nameUrdu.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Handle click on preset emergency card
  const handleSelectPreset = (category: EmergencyCategory) => {
    setSelectedEmergency(category.guideline);
    // Smooth scroll to top of details
    setTimeout(() => {
      document.getElementById('guidelines-result-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle receiving voice recognition transcript
  const handleVoiceTranscript = (transcript: string) => {
    setSearchQuery(transcript);
    // If the transcript sounds like a direct symptom question, populate AI prompt:
    setAiMessage(transcript);
    triggerAiQuery(transcript);
  };

  // Query AI using backend proxy
  const triggerAiQuery = async (queryText?: string) => {
    const promptToSubmit = queryText || aiMessage;
    if (!promptToSubmit.trim()) return;

    setIsAiLoading(true);
    setAiError(null);
    setSelectedEmergency(null); // Clear previous to load fresh AI

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: promptToSubmit }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Server error occurred.');
      }

      const resultJson = await response.json();
      
      // Map resultJson back to guideline schema format
      setSelectedEmergency({
        emergencyNameUrdu: resultJson.emergencyName || 'CUSTOM AI GUIDELINE',
        calls: resultJson.calls || ['1122', '115'],
        steps: resultJson.steps || [],
        khabardar: resultJson.khabardar || [],
        tip: resultJson.tip || 'Apne aas pas ke hudoor saaf rakhye.',
        hospitalWhen: resultJson.hospitalWhen || 'Agar halat kharab ho tou fawran hospital bahein.'
      });

      // Clear query bar
      setAiMessage('');

      setTimeout(() => {
        document.getElementById('guidelines-result-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (e: any) {
      console.error('AI fetching failed:', e);
      setAiError(e.message || 'Kuch error agaya hai. Emergency numbers call karein ya neche list se select karein.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Quiz helper functions
  const handleSelectOption = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedOptionIndex(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null || quizSubmitted) return;
    
    const correctIdx = QUIZ_QUESTIONS[currentQuizIndex].correctIndex;
    if (selectedOptionIndex === correctIdx) {
      setQuizScore((prev) => prev + 10);
    }
    setQuizSubmitted(true);
  };

  const handleNextQuestion = () => {
    setQuizSubmitted(false);
    setSelectedOptionIndex(null);
    
    if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setQuizScore(0);
    setCurrentQuizIndex(0);
    setSelectedOptionIndex(null);
    setQuizSubmitted(false);
    setQuizFinished(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans selection:bg-red-650 selection:text-white">
      
      {/* 1. TOP DANGER FLOATING NOTICE BAR */}
      <div className={`py-2 text-center text-xs md:text-sm font-bold flex flex-wrap items-center justify-center gap-2 px-4 relative z-50 transition-all ${
        isOnline 
          ? 'bg-red-650 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
          : 'bg-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
      }`}>
        {!isOnline ? (
          <>
            <span className="bg-black text-amber-500 px-1.5 py-0.5 rounded text-[9px] uppercase font-black shadow-sm tracking-wider animate-pulse">OFFLINE SECURE MODE</span>
            <span>Apka internet bacha ya band hai, par Service Worker ne tamam First Aid Guides ko offline-ready (cached) mehfooz kiya hai!</span>
          </>
        ) : (
          <>
            <span className="animate-pulse bg-white text-red-650 px-1.5 py-0.5 rounded text-[10px] uppercase font-black shadow-sm">ACTIVE HELPLINE</span>
            <span>Achanak Maslay Mein Call Karein:</span>
            <a href="tel:1122" className="underline hover:no-underline font-black bg-red-700 hover:bg-red-800 px-2 py-0.5 rounded transition-colors text-white">RESCUE 1122</a>
            <span>|</span>
            <a href="tel:115" className="underline hover:no-underline font-black bg-red-700 hover:bg-red-800 px-2 py-0.5 rounded transition-colors text-white">EDHI 115</a>
          </>
        )}
      </div>

      {/* 2. NAVIGATION HEADER */}
      <header className="bg-[#1a1a1a] border-b border-red-900/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedEmergency(null); setActiveTab('emergencies'); }}>
            <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.8)]">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight uppercase text-white flex items-center gap-1.5 leading-none">
                Emergency Aid Assistant
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-none">
                  Pakistan First-Aid Helper (Roman Urdu)
                </p>
                {/* Responsive inline indicator for mobile screen */}
                <div className="md:hidden flex items-center gap-1 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold leading-none">
                  {geoPermission === 'granted' ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block animate-pulse"></span> GPS: ON
                    </span>
                  ) : geoPermission === 'denied' ? (
                    <span className="text-red-400 flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span> GPS: BLOCKED
                    </span>
                  ) : geoPermission === 'loading' ? (
                    <span className="text-amber-500">GPS...</span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-amber-500 inline-block animate-pulse"></span> GPS: ASK
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status glow indication with geolocation monitor */}
          <div className="hidden md:flex items-center gap-3.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-650 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
              <span className="text-[10px] font-mono text-gray-300 font-bold uppercase tracking-widest">Paramedic Active</span>
            </div>

            <div className="w-px h-3.5 bg-white/10"></div>

            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1" title="Connected to server. Live AI queries operational.">
                    AI Online
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                  <span className="text-[10px] font-mono text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1" title="Offline mode active. All 19 categories saved locally in Service Worker Cache.">
                     Offline Ready 💾
                  </span>
                </>
              )}
            </div>
            
            <div className="w-px h-3.5 bg-white/10"></div>

            <div className="flex items-center gap-2">
              {geoPermission === 'granted' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5" title="GPS is granted and active. Nearby Pakistani emergency hospital markers loaded.">
                    <MapPin className="w-3 h-3 text-emerald-400" /> GPS Map Active
                  </span>
                </>
              ) : geoPermission === 'denied' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  <span className="text-[10px] font-mono text-red-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5" title="GPS permission is denied. Re-enable location permissions to detect Pakistani hospitals.">
                    <MapPin className="w-3 h-3 text-red-500 animate-pulse" /> GPS Map Blocked
                  </span>
                </>
              ) : geoPermission === 'loading' ? (
                <>
                  <div className="w-2 h-2 border border-amber-500 border-t-transparent animate-spin rounded-full"></div>
                  <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    Checking GPS...
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                  <span className="text-[10px] font-mono text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5" title="Browser permission prompted. Please select allow so we can locate nearest hospitals.">
                    <MapPin className="w-3 h-3 text-amber-400 animate-bounce" /> GPS: Click Allow
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Nav pills */}
          <nav className="flex bg-[#0f0f0f] border border-white/5 p-1 rounded-xl block">
            <button
              onClick={() => { setActiveTab('emergencies'); }}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'emergencies'
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🛠️ First Aid Madad
            </button>
            <button
              onClick={() => { setActiveTab('quiz'); }}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🧠 Practice Quiz ({quizScore} pts)
            </button>
            <button
              onClick={() => { setActiveTab('box'); }}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'box'
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              📦 Ghar Ka Dabba ({checkedItems.length}/{FIRST_AID_BOX_ITEMS.length})
            </button>
          </nav>
        </div>
      </header>

      {/* 3. MAIN APP LAYOUT */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-6 space-y-6">
        
        {/* TAB 1: EMERGENCIES INTERACTIVE FLOW */}
        {activeTab === 'emergencies' && (
          <div className="space-y-6">
            
            {/* INSTRUCTIONS / SEARCH AND VOICE AREA */}
            <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6">
                
                {/* Search & Suggestions filtering */}
                <div className="flex-1 space-y-2">
                  <label htmlFor="search-input" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                    🔍 19 categories search karein ya direct filter karein:
                  </label>
                  <div className="relative">
                    <input
                      id="search-input"
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 hover:bg-white/10 focus:bg-white/10 rounded-xl border border-white/10 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-900/35 text-sm md:text-base font-medium text-white placeholder-gray-500 transition-all"
                      placeholder="Masla likhein (jaise burns, heart attack, saanp katna)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-gray-550 absolute left-3 top-3.5" />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-3.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-gray-500 font-bold self-center">Try:</span>
                    {["Dil", "Accident", "Asthma", "Tezab", "Saanp"].map(word => (
                      <button
                        key={word}
                        onClick={() => setSearchQuery(word)}
                        className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 font-bold px-2.5 py-0.5 rounded cursor-pointer transition-all"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Microphone Voice Assistant block */}
                <div className="lg:w-px bg-white/5 self-stretch my-2"></div>

                <div className="flex flex-col items-center justify-center p-2 shrink-0 md:px-6">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">
                    🗣️ Bol kar batayein (Voice Assistant):
                  </label>
                  <VoiceInput onTranscript={handleVoiceTranscript} />
                </div>

                {/* Smart Chat Prompt block */}
                <div className="lg:w-px bg-white/5 self-stretch my-2"></div>

                <div className="flex-1 space-y-2">
                  <label htmlFor="ai-prompt-input" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="text-red-500 animate-pulse">●</span>
                    <span>Symptom Pucho (Smart AI Assistant):</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="ai-prompt-input"
                      type="text"
                      className="flex-grow pl-4 pr-3 py-3 bg-white/5 hover:bg-white/10 focus:bg-white/10 rounded-xl border border-white/10 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-900/35 text-sm font-medium text-white placeholder-gray-500 transition-all"
                      placeholder="Mera bacha siri se gir gaya hai aur behosh hai..."
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                    />
                    <button
                      onClick={() => triggerAiQuery()}
                      disabled={isAiLoading || !aiMessage.trim()}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-white/5 active:bg-red-800 text-white disabled:text-gray-600 font-bold text-xs md:text-sm rounded-xl flex items-center gap-1 transition-all shadow-[0_0_12px_rgba(220,38,38,0.4)] disabled:shadow-none cursor-pointer"
                    >
                      {isAiLoading ? 'Sunte hain...' : 'Pucho AI ⚡'}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    AI se pucho agar custom symptoms hain jinka neche lists mein jawab na ho. (Powered by Gemini)
                  </p>
                </div>

              </div>

              {/* API error state */}
              {aiError && (
                <div className="p-3 bg-red-955/20 border border-red-900/50 rounded-xl text-red-400 text-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>{aiError}</span>
                  </div>
                  <button 
                    onClick={() => setAiError(null)}
                    className="text-red-400 font-bold hover:underline cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              )}

              {/* AI Loading state */}
              {isAiLoading && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 bg-red-955/10 rounded-xl border border-dashed border-red-900/30">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-20"></span>
                    <div className="w-8 h-8 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm uppercase tracking-wider">Gemini AI First-Aid Tayar kar raha hai...</h4>
                    <p className="text-xs text-gray-400 font-medium">Kuch hi second mein customized Roman Urdu instructions bahaal hon gi.</p>
                  </div>
                </div>
              )}
            </div>

            {/* 4. ACTIVE SELECTED EMERGENCY VIEW */}
            {selectedEmergency && (
              <GuidelinesPanel 
                guideline={selectedEmergency} 
                onBackToGrid={() => setSelectedEmergency(null)} 
              />
            )}

            {/* 4b. LIVE MAP GEOLOCATION GRANTED 5 NEAREST HOSPITALS VIEW */}
            {geoPermission === 'granted' && !selectedEmergency && (
              <div className="mb-6">
                <MapView />
              </div>
            )}

            {/* 5. 19 MAIN EMERGENCY TILES */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-[10px] tracking-widest uppercase flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-red-650 animate-pulse" />
                  <span>19 EMERGENCY CATEGORIES:</span>
                </h3>
                <span className="text-xs bg-white/5 border border-white/5 text-gray-400 font-bold py-1 px-2.5 rounded-full">
                  Total {filteredEmergencies.length} Milin
                </span>
              </div>

              {filteredEmergencies.length === 0 ? (
                <div className="bg-[#0f0f0f] rounded-2xl p-12 text-center border border-white/5 space-y-3">
                  <Info className="w-12 h-12 text-gray-600 mx-auto" />
                  <h4 className="text-white font-bold text-base uppercase">Humein ye medical emergency koshish karke nahi mili.</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Upar <strong>Symptom Pucho (Smart AI Assistant)</strong> mein likhein, ya koshish karein doosra aasan lafz search karne ka.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); }}
                    className="text-xs bg-red-650 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-[0_0_12px_rgba(220,38,38,0.4)] cursor-pointer"
                  >
                    Poori list bahaal karein
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmergencies.map((item) => {
                    const CardIcon = iconMap[item.icon] || AlertTriangle;
                    return (
                      <button
                        key={item.id}
                        id={`category-card-${item.id}`}
                        onClick={() => handleSelectPreset(item)}
                        className="bg-[#0f0f0f] hover:bg-[#151515] p-5 rounded-2xl border border-white/5 hover:border-red-900/50 text-left transition-all duration-300 hover:shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] flex gap-4 w-full relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-red-900/35 cursor-pointer"
                      >
                        {/* Red visual tag for instant scanning */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>

                        {/* Category icon */}
                        <div className="w-11 h-11 bg-white/5 text-red-500 border border-white/5 rounded-xl shrink-0 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[0_0_12px_rgba(220,38,38,0.5)]">
                          <CardIcon className="w-5.5 h-5.5" />
                        </div>

                        {/* Category details */}
                        <div className="space-y-1 relative pr-4">
                          <h4 className="text-white font-bold text-sm md:text-base tracking-tight leading-snug group-hover:text-red-400 transition-colors">
                            {item.nameUrdu}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider font-mono">
                            {item.nameEng}
                          </span>
                          <p className="text-xs text-gray-400 leading-normal line-clamp-2 pt-0.5 group-hover:text-gray-300 transition-colors">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick-dial list footer section */}
            <div className="bg-[#0f0f0f] border border-red-900/40 p-6 rounded-2xl shadow-lg mt-8">
              <h3 className="text-[10px] font-bold tracking-widest text-red-500 uppercase flex items-center gap-2 mb-4">
                <PhoneCall className="w-5 h-5 shrink-0" />
                <span>PAKISTAN SE SEEDHA CALL KAREIN:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-2">
                {PAKISTAN_NUMBERS.map((info, idx) => (
                  <div key={idx} className="bg-[#151515] p-4 rounded-xl border border-white/5 flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 bg-red-955/50 text-red-400 rounded-full font-bold text-xs shrink-0">
                      ☎️
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-white">{info.name}:</span>
                        <a href={`tel:${info.number}`} className="text-red-450 hover:text-red-300 hover:underline font-black text-sm block">
                          {info.number}
                        </a>
                      </div>
                      <p className="text-[11px] text-gray-400">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INTERACTIVE FIRST AID QUIZ */}
        {activeTab === 'quiz' && (
          <div className="max-w-2xl mx-auto bg-[#0f0f0f] rounded-2xl shadow-xl border border-white/5 overflow-hidden transform transition-all duration-300">
            
            {/* Header */}
            <div className="bg-[#1a1a1a] text-white p-6 border-b border-white/5 flex items-center gap-3">
              <div className="p-2.5 bg-white/5 text-red-500 border border-white/5 rounded-xl">
                <Award className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold tracking-tight uppercase">First Aid Practice Training</h3>
                <p className="text-xs text-gray-400">Pakistan ke common scenario aur raste mein ghalatiyon se bachiye.</p>
              </div>
            </div>

            {/* Main content */}
            <div className="p-6">
              
              {!quizFinished ? (
                <div className="space-y-6">
                  {/* Score & Index Tracker */}
                  <div className="space-y-2 pb-3 border-b border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Sawal {currentQuizIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                      <span className="text-red-450 font-bold">Points Earned: {quizScore} pts</span>
                    </div>
                    {/* Visual mini progress track */}
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-650 h-full transition-all duration-500 shadow-[0_0_8px_rgba(220,38,38,0.5)]" 
                        style={{ width: `${((currentQuizIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Scenario Question */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest font-mono block">SCENARIO:</span>
                    <h4 className="text-white font-bold text-base md:text-lg leading-relaxed">
                      {QUIZ_QUESTIONS[currentQuizIndex].scenario}
                    </h4>
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="space-y-3 pt-2">
                    {QUIZ_QUESTIONS[currentQuizIndex].options.map((option, idx) => {
                      const isSelected = selectedOptionIndex === idx;
                      const isCorrect = QUIZ_QUESTIONS[currentQuizIndex].correctIndex === idx;
                      
                      let optionStyle = "bg-white/5 hover:bg-white/10 border-white/5 text-gray-300";
                      if (isSelected) {
                        optionStyle = "bg-red-955/20 border-red-650 text-white ring-2 ring-red-900/30";
                      }
                      if (quizSubmitted) {
                        if (isCorrect) {
                          optionStyle = "bg-green-955/35 border-green-600 text-green-300 ring-2 ring-green-900/30";
                        } else if (isSelected) {
                          optionStyle = "bg-red-955/35 border-red-600 text-red-300 ring-2 ring-red-900/30";
                        } else {
                          optionStyle = "opacity-50 bg-[#0f0f0f]/30 border-white/5 text-gray-550";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          id={`quiz-option-${currentQuizIndex}-${idx}`}
                          onClick={() => handleSelectOption(idx)}
                          disabled={quizSubmitted}
                          className={`w-full p-4 rounded-xl border text-left font-semibold text-xs md:text-sm transition-all duration-200 flex items-start gap-4 cursor-pointer ${optionStyle}`}
                        >
                          <div className={`w-5.5 h-5.5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold border ${
                            isSelected ? 'bg-red-600 border-red-600 text-white shadow-[0_0_6px_rgba(220,38,38,0.5)]' : 'border-white/10 bg-[#151515] text-gray-400'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback explainer */}
                  {quizSubmitted && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4.5 space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        {selectedOptionIndex === QUIZ_QUESTIONS[currentQuizIndex].correctIndex ? (
                          <span className="text-green-400 font-extrabold text-sm flex items-center gap-1">
                            ✔ Bilkul Theek! (+10 points)
                          </span>
                        ) : (
                          <span className="text-red-500 font-extrabold text-sm flex items-center gap-1">
                            ✘ Wrong Answer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">
                        <strong>Kyun?:</strong> {QUIZ_QUESTIONS[currentQuizIndex].explanation}
                      </p>
                    </div>
                  )}

                  {/* Nav controls */}
                  <div className="pt-4 flex justify-end">
                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={selectedOptionIndex === null}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-white/5 text-white disabled:text-gray-500 font-bold text-sm tracking-wide rounded-xl shadow-[0_0_12px_rgba(220,38,38,0.4)] transition-all active:scale-95 cursor-pointer"
                      >
                        Answer Submit Karein
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide rounded-xl shadow-[0_0_12px_rgba(220,38,38,0.5)] transition-all active:scale-95 cursor-pointer"
                      >
                        {currentQuizIndex === QUIZ_QUESTIONS.length - 1 ? 'Quiz Finish' : 'Agla Sawal →'}
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                // Finish view
                <div className="text-center py-8 space-y-5">
                  <div className="w-16 h-16 bg-white/5 text-red-500 border border-white/5 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-bold tracking-tight uppercase text-white">Mubarak Ho! Quiz Mukammal Hua!</h4>
                    <p className="text-xs text-gray-400">Aap ne total {quizScore} points haasil kiye.</p>
                  </div>
                  
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl max-w-sm mx-auto">
                    <h5 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider mb-1">YOUR LEVEL:</h5>
                    <p className="text-base font-bold text-red-400 uppercase tracking-widest">
                      {quizScore === 50 ? '👑 PARAMEDIC EXPERT' : quizScore >= 30 ? '🩹 EMERGENCY RESPONDER' : '🌱 BEGINNER LEARNER'}
                    </p>
                  </div>

                  <button
                    onClick={restartQuiz}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide rounded-xl shadow-[0_0_12px_rgba(220,38,38,0.5)] transition-all active:scale-95 flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Dobara Koshish Karein</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 3: FIRST AID BOX CHECKLIST */}
        {activeTab === 'box' && (
          <div className="max-w-2xl mx-auto bg-[#0f0f0f] rounded-2xl shadow-xl border border-white/5 overflow-hidden transform transition-all duration-300">
            
            {/* Header */}
            <div className="bg-[#1a1a1a] border-b border-white/5 text-white p-6 flex items-center gap-3">
              <div className="p-2.5 bg-white/5 text-red-500 border border-white/5 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold tracking-tight uppercase">Ghar Ka First-Aid Dabba (Checklist)</h3>
                <p className="text-xs text-gray-400">Yeh 8 cheezein har Pakistani ghar mein honi chahiye taake emergency mein mushkil na ho.</p>
              </div>
            </div>

            {/* Main items panel */}
            <div className="p-6 space-y-6">
              
              {/* VISUAL PROGRESS METER */}
              {(() => {
                const progressPercent = Math.round((checkedItems.length / FIRST_AID_BOX_ITEMS.length) * 100);
                return (
                  <div className="bg-[#151515] p-5 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">🏠 Ghar Ki Emergency Tayyari:</span>
                      <span className={`font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase border ${
                        progressPercent === 100 
                          ? 'bg-green-950/40 text-green-400 border-green-500/30' 
                          : progressPercent >= 60 
                          ? 'bg-[#2a1b0a] text-amber-400 border-amber-500/30' 
                          : 'bg-[#2d0a0a] text-red-400 border-red-500/30'
                      }`}>
                        {progressPercent}% Safe (Mehfooz)
                      </span>
                    </div>
                    
                    {/* Progress bar container */}
                    <div className="w-full bg-[#0a0a0a] rounded-full h-3 border border-white/5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          progressPercent === 100 
                            ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' 
                            : progressPercent >= 60 
                            ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]' 
                            : 'bg-red-650 shadow-[0_0_12px_rgba(220,38,38,0.6)]'
                        }`} 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>

                    {/* Friendly tips depending on score */}
                    <p className="text-[11px] text-gray-400 leading-normal font-medium">
                      {progressPercent === 0 && (
                        <span>🚨 Aapka dabba bilkul khali hai! Koshish karein ke critical cheezein pehlay collect karein.</span>
                      )}
                      {progressPercent > 0 && progressPercent < 60 && (
                        <span>🩹 Boht achay! Aap ne tayyari shuru kardi hai lakin abhi critical cheezein stock karni hain.</span>
                      )}
                      {progressPercent >= 60 && progressPercent < 100 && (
                        <span>⭐ Behtar tayyari! Aapka ghar kafi had tak safe hai. Baki cheezein bhi jald shamil karein.</span>
                      )}
                      {progressPercent === 100 && (
                        <span>👑 Mashallah! Aapka First-Aid dabba 100% mukammal hai. Aap achanak emergency ke liye mukammal tayyar hain!</span>
                      )}
                    </p>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest pb-3 border-b border-white/5">
                <span>Dabba Stock List:</span>
                <span className="text-red-450 font-extrabold">{checkedItems.length} of {FIRST_AID_BOX_ITEMS.length} stocked</span>
              </div>

              <div className="space-y-3.5">
                {FIRST_AID_BOX_ITEMS.map((item, idx) => {
                  const isChecked = checkedItems.includes(item.name);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheckItem(item.name)}
                      className={`p-4 rounded-xl border flex items-start gap-4 cursor-pointer transition-all duration-200 select-none ${
                        isChecked 
                          ? 'bg-red-955/10 border-red-900/50' 
                          : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <button className={`w-5.5 h-5.5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        isChecked ? 'bg-red-600 border-red-600 text-white shadow-[0_0_6px_rgba(220,38,38,0.5)]' : 'border-white/20 bg-white/5'
                      }`}>
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-white font-extrabold text-sm md:text-base leading-none">
                            {item.name}
                          </h4>
                          <span className="text-xs text-gray-405 font-arabic italic">
                            ({item.urduName})
                          </span>
                          
                          {/* Importance Badge */}
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            item.importance === 'Critical' 
                              ? 'bg-red-950/40 text-red-400 border-red-900/40' 
                              : item.importance === 'Important' 
                              ? 'bg-amber-950/40 text-amber-400 border-amber-900/40' 
                              : 'bg-blue-950/40 text-blue-400 border-blue-900/40'
                          }`}>
                            {item.importance}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 leading-normal pt-1 font-medium">
                          <strong>Wajah:</strong> {item.usage}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Box completely stocked congratulatory notice */}
              {checkedItems.length === FIRST_AID_BOX_ITEMS.length && (
                <div className="bg-green-950/20 border border-green-900/50 rounded-xl p-4 text-center space-y-1.5 animate-bounce">
                  <h4 className="text-green-400 font-extrabold text-sm flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>👑 Mubarak Ho! Aapka First-Aid Box Tayyar Hai!</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
                    Aapka ghar ab achanak pesh aane wali choti ya badi emergency se nipatne ke liye tayyar hai. Ise hamesha safe aur aasan pohanch mein rakhein.
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* 4. SOLID TRUST FOOTER */}
      <footer className="bg-[#1a1a1a] border-t border-white/5 py-6 mt-12 text-center text-xs text-gray-500 font-medium space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="font-extrabold text-gray-400">📌 Emergency Aid Assistant Pakistan</span>
          <span>© 2026. All rights prepared.</span>
        </div>
        <p className="max-w-lg mx-auto px-4 leading-relaxed text-[10px] text-gray-500">
          <strong>Disclaimer:</strong> Yeh system medical science aur first aid parameters par trained AI par mabni hai. Yeh temporary help hai lakin <strong>Asal emergency mein fawran doctor ya hospital se rabta zaroor karein.</strong>
        </p>
      </footer>

    </div>
  );
}
