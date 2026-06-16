import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { EMERGENCIES_DATA } from "./src/data/emergencies";

// Load environment variables for development
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI on the server cleanly
// Check if GEMINI_API_KEY exists before trying to query
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Keyword scorer to map user searches onto our 19 core public/offline guidelines
const matchOfflineEmergency = (message: string) => {
  const norm = message.toLowerCase().trim();
  
  if (!norm) return null;

  // Custom synonym mapping to cross-reference English and Roman Urdu keywords
  const mapping: { [key: string]: string[] } = {
    "heart-attack": ["heart", "cardiac", "cpr", "dil", "attack", "dorah", "seena", "dard", "chest", "disprin", "aspirin", "dharkan"],
    "road-accident": ["accident", "collision", "sarak", "haadsa", "bleed", "fracture", "chot", "blood", "injury", "shara-i-", "gardan"],
    "stroke": ["stroke", "faleej", "paralysis", "face", "bazu", "speech", "slur", "fast", "sunn", "dimag"],
    "breathing-problems": ["breath", "saans", "asthma", "choking", "dama", "gale", "dum", "cough", "inhaler", "ventolin", "throat"],
    "severe-bleeding": ["bleed", "khoon", "wound", "blood", "bahna", "katna", "zakham", "pressure", "patti"],
    "burns": ["burn", "aag", "fire", "acid", "chemical", "jalna", "current", "skin jali", "burnt", "teezab"],
    "fractures": ["fracture", "bone", "haddi", "tootna", "splint", "crooked", "sar ki chot", "head injury", "fall", "head"],
    "poisoning": ["poison", "zeher", "drug", "overdose", "chemical", "phenyl", "acid", "dawayi", "bottle"],
    "seizures": ["seizure", "epilepsy", "mirghee", "jhatka", "shake", "fit", "daura", "fits", "seisures"],
    "drowning": ["drown", "doobna", "water", "sea", "pool", "river", "paani", "swim"],
    "heatstroke": ["heat", "stroke", "sun", "loo", "garmi", "fever", "temperature", "dehydration"],
    "allergic-reaction": ["allergy", "anaphylaxis", "bee sting", "swelling", "itch", "redness", "epipen", "reaction"],
    "snake-animal-bites": ["snake", "animal", "bite", "dog", "saanp", "katna", "venom", "rabies"],
    "diabetic-emergency": ["diabetes", "sugar", "insulin", "glucometer", "low sugar", "high sugar", "sweet", "confuse", "cheeni"],
    "eye-injuries": ["eye", "aankh", "vision", "dust", "glass in eye", "splash", "blind", "red eye"],
    "child-emergencies": ["child", "baby", "bacha", "pediatric", "fall", "fever bacha", "febrile", "kids"],
    "emergency-delivery": ["delivery", "birth", "pregnancy", "baby born", "labor", "pregnant", "bacha paida", "shadi"],
    "electric-shock": ["electric", "shock", "current", "wire", "tar", "switch", "breaker", "current laga", "bijli"],
    "mental-health-crisis": ["mental", "depressed", "depression", "panic", "suicide", "harm", "helpline", "zehni", "koshish", "dabao", "umang", "self-harm"]
  };

  let bestMatch: any = null;
  let highestScore = 0;

  for (const item of EMERGENCIES_DATA) {
    let score = 0;
    
    // Check direct ID or name match
    if (norm.includes(item.id)) score += 5;
    if (norm.includes(item.nameEng.toLowerCase())) score += 5;
    if (norm.includes(item.nameUrdu.toLowerCase())) score += 5;
    
    // Check mapping synonyms
    const synonyms = mapping[item.id] || [];
    for (const syn of synonyms) {
      if (norm.includes(syn)) {
        score += 2;
      }
    }
    
    // Check description
    if (item.description && norm.includes(item.description.toLowerCase())) {
      score += 2;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return highestScore >= 2 ? bestMatch : null;
};

// API Endpoint for processing first aid queries dynamically using Gemini 3.5 Flash
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const systemPrompt = `
Aap ek Medical Emergency First Aid Assistant hain jo Pakistan mein logon ki jaan bachane ke liye banaye gaye hain.
Aapka kaam hai: Kisi bhi medical emergency ya symptoms mein hospital pohanchne tak TURANT aur CLEAR guidance dena, Roman Urdu (Hinglish allowed) mein.

AAPKI IDENTITY & TONE:
- Naam: Emergency Aid Assistant
- Zabaan: Hamesha Roman Urdu mein jawab do (Hinglish/Latin script allowed)
- Tone: Calm, clear, fast — ghabranay ki jagah ek expert paramedic/doctor ki tarah seedha kaam ki baat karo.
- Voice Compatibility: Steps ko chota aur simple rakhein taake voice readers (Synthesizers) aasaani se padh sakein.

RULES FOR INPUTS:
- User voice se bolega ya type karega. Dono ko handle karo.
- User ki baat mein spelling errors ya unclear words ho sakte hain (speech-to-text input ki wajah se). 'dard' = dard, 'chest' = seena, 'baby' = bacha. Context se baat samjhoi.
- Agar incomplete input jaise "accident", "behosh", "khoon" mile toh sabse dangerous situation assume karo aur us hisab se guide karo.
- Agar user aam khair-afiyat pooche (jaise greeting, "hello", "Assalam o Alaikum"), toh generic first-aid welcome do aur guide karo ke wo koi bhi emergency pooch sakte hain.

RESPONSE SCHEMA CONTRAINTS:
Aapko hamesha niche diye dawat/JSON format ke mutabik reply dena hai. Kisi aur format mein text mat likhein.

SCHEMA DEFINITION:
{
  "emergencyName": "Emergency ka naam (Urdu default and English in brackets, e.g. 'DIL KA DORAH (HEART ATTACK)')",
  "calls": ["1122", "115"], // numbers to call, start with 1122 and 115
  "steps": [
    "Step 1: Pehla clear rule/action Roman Urdu mein.",
    "Step 2: Doosra action...",
    "Step 3: Teesra action..."
  ], // Short, bullet-sized 1-line actions. Numbered sequence index implicitly tracked. Maximum 5 steps.
  "khabardar": [
    "Mistake 1: Kya hargiz nahi karna.",
    "Mistake 2: Doosri ghalti jo log karte hain..."
  ], // Things to avoid doing in this specific situation. Max 2-3 items.
  "tip": "Ek important practical tip jo aam log nahi jaante.",
  "hospitalWhen": "Clear signs jab hospital le jaana farz/zaroori ho."
}
`;

  const ai = getGeminiClient();
  if (!ai) {
    console.warn("Gemini API key missing of not defined. Using local offline guidelines matching fallback...");
    return handleLocalFallback(message, res);
  }

  // Attempt the query with automatic retries for transient 503 errors (high demand)
  let response;
  let attempts = 0;
  const maxAttempts = 3;
  let lastError: any = null;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              emergencyName: {
                type: Type.STRING,
                description: "The identified medical emergency category name in Urdu with English summary.",
              },
              calls: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Required Pakistan ambulance and rescue numbers suitable for the crisis (always direct 1122, 115, etc.)",
              },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 3 to 5 key, numbered first-aid steps in Roman Urdu. Maximum 1 line each. Avoid technical words.",
              },
              khabardar: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Severe negative constraints (things to absolutely NOT do) to prevent harm in Roman Urdu.",
              },
              tip: {
                type: Type.STRING,
                description: "One highly actionable and lesser-known medical/practical tip in Roman Urdu.",
              },
              hospitalWhen: {
                type: Type.STRING,
                description: "Specific triggers or red flags representing when immediate hospitalization is necessary in Roman Urdu.",
              },
            },
            required: ["emergencyName", "calls", "steps", "khabardar", "tip", "hospitalWhen"],
          },
        },
      });

      if (response && response.text) {
        break; // Success! Break the loop
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini client call attempt ${attempts} of ${maxAttempts} failed:`, err.message || err);
      if (attempts < maxAttempts) {
        // Wait 600ms before retrying to let spike pass
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }
  }

  // If we succeeded, process and return the JSON response
  if (response && response.text) {
    try {
      let textOutput = response.text.trim();
      // Handle potential markdown encapsulation
      if (textOutput.startsWith("```")) {
        textOutput = textOutput.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      const parsedJson = JSON.parse(textOutput);
      return res.json(parsedJson);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON output, falling back to local database:", parseErr);
      return handleLocalFallback(message, res);
    }
  } else {
    console.error("Gemini call fell through or failed completely on all attempts. Error:", lastError);
    return handleLocalFallback(message, res);
  }
});

// Resonates beautiful response using highly safe locally stored guidelines database
function handleLocalFallback(message: string, res: express.Response) {
  const fallback = matchOfflineEmergency(message);
  if (fallback) {
    return res.json({
      emergencyName: `${fallback.guideline.emergencyNameUrdu} (STANDBY SECURE MODE)`,
      calls: fallback.guideline.calls,
      steps: fallback.guideline.steps,
      khabardar: fallback.guideline.khabardar,
      tip: `${fallback.guideline.tip} (Standby info: Loaded from offline pre-verified guide.)`,
      hospitalWhen: fallback.guideline.hospitalWhen
    });
  } else {
    // Elegant system standby greeting if user message did not match any of the 19 guidelines closely
    return res.json({
      emergencyName: "EMERGENCY STANDBY MODE (HIGH TRAFFIC)",
      calls: ["1122", "115"],
      steps: [
        "Step 1: Ghabrayein mat. Patient ko comfortable, seedhi ya saaye-daar jagah par letayein.",
        "Step 2: Hamara server is waqt high traffic ki wajah se standby model par chal raha hai.",
        "Step 3: Fauran screen ke bilkul niche diye gaye 19 main categories mein se mutalqa situation choose karein.",
        "Step 4: Emergency haalat mein directly Rescue 1122 ya Edhi 115 se madad lijiye."
      ],
      khabardar: [
        "Desi totkay ya bina sifarish dawayi dena nuksaandeh hosakta hai.",
        "Saans rukne ya dil ke dard ko aam gas samajh kar bilkul dair na karein."
      ],
      tip: "Aap screen par pehle se load shuda guides ko baghair internet ya server delay ke 100% chalte dekh saktay hain.",
      hospitalWhen: "Agar patient behosh hai, nakhun neele par rahe hon, ya extreme bleeding ho rahi ho."
    });
  }
}

// Configure Vite middleware in development, or serve built bundle in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Express server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting Express server in production mode serving static resources...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
