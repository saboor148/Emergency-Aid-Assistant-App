export interface EmergencyCategory {
  id: string;
  nameUrdu: string;
  nameEng: string;
  icon: string;
  description: string;
  // Pre-configured rules for zero-latency presentation
  guideline: {
    emergencyNameUrdu: string;
    calls: string[];
    steps: string[];
    khabardar: string[];
    tip: string;
    hospitalWhen: string;
  };
}

export interface EmergencyMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  isVoice?: boolean;
  timestamp: Date;
  emergencyType?: string; // e.g. "Heart Attack"
}

export interface PakistanEmergencyNumber {
  name: string;
  number: string;
  provider: string;
  description: string;
}

export const PAKISTAN_NUMBERS: PakistanEmergencyNumber[] = [
  { name: "Rescue Services", number: "1122", provider: "Government of Pakistan", description: "All-purpose ambulance, fire, and disaster recovery." },
  { name: "Edhi Ambulance", number: "115", provider: "Edhi Foundation", description: "Largest volunteer ambulance network in Pakistan." },
  { name: "Chhipa Ambulance", number: "1020", provider: "Chhipa Association", description: "Fast-response healthcare & ambulance service." },
  { name: "Aman Foundation", number: "115", provider: "Aman Health (Karachi)", description: "Life-saving emergency service (mainly Karachi)." },
  { name: "Poison Control Karachi", number: "02199215749", provider: "Jinnah Post Graduate Medical Center", description: "Toxic substance, chemical or medicine overdose helpline." },
  { name: "Umang Suicide Helpline", number: "03174288665", provider: "Umang Pakistan", description: "24/7 Mental Health and Self-harm response helpline." },
  { name: "Rozan Helpline", number: "0512890505", provider: "Rozan Foundation", description: "Emotional support, psychological counselling and crisis help." }
];
