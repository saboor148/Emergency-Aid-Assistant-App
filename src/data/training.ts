export interface QuizQuestion {
  id: number;
  scenario: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SurvivalItem {
  name: string;
  urduName: string;
  usage: string;
  importance: 'Critical' | 'Important' | 'Recommended';
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario: "Kisi shakhs ko achanak seene mein shadeed dard hota hai aur baayen (left) baazu mein khinchao mehsos hota hai. Sabse pehli madad kya hogi?",
    options: [
      "Unhe letakar pani pilayein aur gas ki dawai dein.",
      "1122 call karein aur agar mareez ko allergy na ho toh Aspirin (e.g. Disprin) ki ek goli chabane ko dein.",
      "Thanda dhoodh pilaayein.",
      "Uney tez chalne ko kahein taake khoon bahaal ho."
    ],
    correctIndex: 1,
    explanation: "Seene ka dard aur left arm mein khinchao Heart Attack ke signs hain. 1122 call karna aur Aspirin (Disprin) chabane ko dena sabse behtreen first aid hai."
  },
  {
    id: 2,
    scenario: "Kisi bache ke haath par achanak garam chae (tea) gir gayi hai aur haath kaala/surkh ho raha hai. Aap kya lagaenge?",
    options: [
      "Colgate ya koi bhi aam toothpaste.",
      "desi ghee, butter ya nariyal ka tail.",
      "Nalkay ka thanda behta hua pani kam se kam 15 minute tak.",
      "Baraf se direct sekaayen."
    ],
    correctIndex: 2,
    explanation: "Jalne/Burns ki soorat mein toothpaste ya oily ghee lagana strict mana hai kyunki yeh temperature ko andar rok lete hain aur infection phailate hain. Behta hua saaf pani sabse safe hai."
  },
  {
    id: 3,
    scenario: "Road par accident hua hai aur kangan jaisi haddi toot kar skin se bahar jhaank rahi hai. Aap kya karenge?",
    options: [
      "Haddi ko andar dhakel kar jhatkay se seedha karenge.",
      "Haddi ke dono taraf lakri ya cardboard (splint) laga kar kapray se dheela baandhein ge taake wo hile nahi.",
      "Mitti laga kar raakh se dhank denge.",
      "Fauran garam pani ka towel rakh denge."
    ],
    correctIndex: 1,
    explanation: "Open fracture mein haddi ko khud kabhi seedha karne ki koshish nahi karni chahiye. Haddi ko bilkul un-moved (splinted) rakh kar doctor ke paas jana behtar hai."
  },
  {
    id: 4,
    scenario: "Koi person achanak zameen par gir jata hai, aankhein upar karke jhatkay kha raha hai aur munh se jhaag aa raha hai. Kya karna sabse behtar hai?",
    options: [
      "Unke munh mein metal ka chamach thonsiye taake zubaan na kate.",
      "Ch चमड़ा joota sunghayein.",
      "Unki gardan ke neeche naram kapra rakhein aur unke gird se sakt cheezein hata dein taake chot na lage.",
      "Unhe zor se pakadh kar jhatkay rukne par majboor karein."
    ],
    correctIndex: 2,
    explanation: "Mirghee/Seizures ke attacks mein joota sunghana fazool hai aur zor se pakadne se muscle tear ho sakta hai. Mareez ki hifazat sabse ahem hai."
  },
  {
    id: 5,
    scenario: "Mera bacha khana khate khate achanak bolna band ho gaya hai, uska chehra peela par raha hai aur wo gale par dono haath rakhe khara hai. Yeh kya hai?",
    options: [
      "Asthma ka attack",
      "Severe Choking (Saans dabba phansna)",
      "Mirghee ka daura",
      "Gas ka dawayi"
    ],
    correctIndex: 1,
    explanation: "Gale par dono haath rakhna aur achanak aawaz band ho jana target Choking sign hai. Heimlich Maneuver (pait par pressure) lgana iski first aid hai."
  }
];

export const FIRST_AID_BOX_ITEMS: SurvivalItem[] = [
  {
    name: "Saniplast (Adhesive Bandages)",
    urduName: "سانی پلاس / پٹی",
    usage: "Choti khraash ya cuts par lagana taake infection na ho.",
    importance: "Critical"
  },
  {
    name: "Pyodine (Antiseptic solution)",
    urduName: "پیوڈائن",
    usage: "Zakham dhowne aur germs saaf karne ke liye sabse safe dawa (Lal Dawai).",
    importance: "Critical"
  },
  {
    name: "Disprin / Aspirin 300mg",
    urduName: "ڈسپرین / ایسپرین",
    usage: "Dil ke dore (Heart Attack) mein fauran ek goli chabane ke liye.",
    importance: "Critical"
  },
  {
    name: "ORS / Nimkol",
    urduName: "او آر ایس / نمکول",
    usage: "Ultee, dasti, ya heatstroke mein namkiyat poora karne ke liye.",
    importance: "Critical"
  },
  {
    name: "Sterile Gauze (Saaf Patti)",
    urduName: "جراحی پٹی",
    usage: "Tez bahay hue khoon par pressure se rakhne aur zakham bandhne k liye.",
    importance: "Important"
  },
  {
    name: "Medical Scissors & Tape",
    urduName: "قینچی اور ٹیپ",
    usage: "Patti kaatne aur skin par fix karne ke liye.",
    importance: "Important"
  },
  {
    name: "Paracetamol Syrup / Tablets",
    urduName: "پیراسیٹامول (پیناڈول)",
    usage: "Bukhar aur dard (Fever and Pain) kam karne ke liye safe generic.",
    importance: "Important"
  },
  {
    name: "Digital Thermometer",
    urduName: "تھرمامیٹر",
    usage: "Bukhar (fever) check karne k liye taake temperature pata lag sake.",
    importance: "Recommended"
  }
];
