import { EmergencyCategory } from '../types';

export const EMERGENCIES_DATA: EmergencyCategory[] = [
  {
    id: "heart-attack",
    nameEng: "Heart Attack / Cardiac Arrest / CPR",
    nameUrdu: "Dil Ka Dorah aur CPR",
    icon: "HeartPulse",
    description: "Seene ka shadeed dard, saans rukna, aur dil ki dharkan ka band hona.",
    guideline: {
      emergencyNameUrdu: "DIL KA DORAH / CARDIAC ARREST",
      calls: ["1122", "115"],
      steps: [
        "Patient ko hila kar check karein: 'Kya aap theek hain?' Agar jawab na de toh nabz (pulse) aur saans check karein.",
        "FAURAN 1122 par call kar ke batayein ke CPR ki zaroorat hai.",
        "Mera bacha ya bada agar behosh hai aur saans nahi le raha, toh CPR shuru karein: Seene ke beech mein dono haath rakh kar 2 inch tak 30 dafa zoor se dabayein (1 minute mein 100-120 dafa ki speed).",
        "Har 30 compressions ke baad 2 dafa mooh se saans (rescue breaths) dein (agar trained hain).",
        "Agar hosh mein hai par seene mein dard hai, toh 1 goli Aspirin (Disprin) chabane ko dein (agar allergy na ho)."
      ],
      khabardar: [
        "Behosh ya suth patient ko pani, chai, ya koi liquid pilaane ki koshish hargiz mat karein.",
        "Dard ko aam gas ya maiday ka dard samajh kar hospital le jaane mein dair na karein."
      ],
      tip: "CPR karte hue seene ko 'Stayin' Alive' gaane ki beat par dabayein, is se speed bilkul theek rehti hai.",
      hospitalWhen: "Seene mein ghutan, baayen (left) baazu, gardan ya jabray mein dard, thanda paseena aana, ya ultra-quick behoshi aana."
    }
  },
  {
    id: "road-accident",
    nameEng: "Road Accidents (minor to critical)",
    nameUrdu: "Sarak Haadsa / Accident",
    icon: "Activity",
    description: "Khoon behna, haddi tootna, behoshi, aur dimaaghi chot.",
    guideline: {
      emergencyNameUrdu: "SARAK HAADSA (ROAD ACCIDENT)",
      calls: ["1122", "115", "1020"],
      steps: [
        "Sabse pehle khud ko aur victim ko safe jagah par le jayen taake munasib jagah mil sake.",
        "Agar gardan ya peeth (spine) par chot hai, toh mareez ko hargiz na hilayein jab tak bohot zaroori na ho.",
        "Khoon behne wali jagah par saaf kapray se zoor se dabaav (direct pressure) dalein taake khoon ruk sake.",
        "Agar saans band hai toh thori (chin) ko upar uthayein aur saans bahaal karne ki koshish karein.",
        "Ghabraye hue mareez ko hosla dein aur garam rakhne ke liye chadar ya blanket se dhanp dein."
      ],
      khabardar: [
        "Tooti hui haddi ko khud seedha karne ki koshish mat karein, is se mazeed nuksaan ho sakta hai.",
        "Gardan ki chot mein helmet ko zor se mat khenchein, gardan bilkul seedhi rakhni hai."
      ],
      tip: "Khoon rokne ke liye hamesha direct pressure lagayein. Kapra ganda ho jaye toh usey hatayein nahi, balke uske upar mazeed kapra rakh kar dabayein.",
      hospitalWhen: "Khoon bilkul na ruk raha ho, mareez behosh ho, sir se pani ya khoon nikal raha ho, ya saans lene mein shadeed takleef ho."
    }
  },
  {
    id: "stroke",
    nameEng: "Stroke (Faleej)",
    nameUrdu: "Faleej ka Dorah / Stroke",
    icon: "Brain",
    description: "Chehre ka terha hona, bolne mein takleef, aur jism ke ek hissay ka kamzor hona.",
    guideline: {
      emergencyNameUrdu: "STROKE (FALEEJ KA DORAH)",
      calls: ["1122", "115"],
      steps: [
        "F.A.S.T rule yaad rakhein: Chehra check karein ke kya ek side se dhalak (droop) gaya hai?",
        "Dono baazu uthane ko kahein, kya ek baazu neeche gir raha hai?",
        "Koi aasan jumla bulwayein: Kya bolne mein larzish (slurred speech) hai?",
        "Agar yeh sab signs hain, toh fauran time note karein aur ambulance ko call karein.",
        "Mareez ko comfortable position mein letayein (karwat dila kar taake thook ya ulti halaq mein na phansay)."
      ],
      khabardar: [
        "Mareez ko ghalati se bhi Aspirin ya koi aur dard ki dawa mat dein jab tak doctor CT scan na kar le (kuch stroke khoon behne se hote hain, aspirin usey badha sakti hai).",
        "Ghar par betha kar 'theek ho jayega' ka intezar hargiz na karein."
      ],
      tip: "Stroke mein 'Time is Brain'. Har minute late hone se dimaag ke hazaron cells marte hain, isliye seedha emergency bhaagein.",
      hospitalWhen: "Chehre par behisi, achanak ek side ka sunn ho jana, baazu uthane mein nakami, ya bolne mein larzish."
    }
  },
  {
    id: "breathing-problems",
    nameEng: "Breathing Problems / Asthma / Choking",
    nameUrdu: "Saans ki Tangi aur Choking (Dum Ghutna)",
    icon: "Wind",
    description: "Gale mein khana phansna, asthma ka attack, ya achanak dum ghutna.",
    guideline: {
      emergencyNameUrdu: "SAANS KI TANGI / ASTHMA / CHOKING",
      calls: ["1122", "115"],
      steps: [
        "Agar mareez chalte-chalte gale par haath rakh le (Choking symbol), toh pucho 'Kya aapka dum ghut raha hai?'",
        "Choking adult ke liye Heimlich Maneuver karein: Mareez ke peechay khaday ho kar usey apnay baazuon mein ghairein, aur naaf (belly button) ke thora upar muthi rakh kar andar aur upar ki taraf zor se push karein (5-5 abdominal thrusts).",
        "Bachay ke liye: Apne guthnay par leta kar peeth par dono shoulders ke beech 5 dafa zor se hathaili ka thapa dein (back blows).",
        "Asthma ke mareez ko seedha bitha kar unka apna inhaler (Ventolin) lene mein madad karein.",
        "Kamray ki khidkiyan khol dein taake taaza hawa aa sakay."
      ],
      khabardar: [
        "Choking victim ke mooh mein ungli daal kar andha-dhund cheez dhoondhne ki koshish mat karein, is se cheez mazeed andar phans sakti hai.",
        "Asthma attack mein mareez ko letne par majboor na karein, bitha kar rakhne se saans lena aasan hota hai."
      ],
      tip: "Choking mein agar victim khans raha hai, toh usey khansne dein. Heimlich maneuver sirf tab karein jab aawaz band ho jaye aur wo bol na sake.",
      hospitalWhen: "Hont ya nakhun neele par rahe hon, chehra peela ho, hosh kho raha ho, ya saans bilkul na aa rahi ho."
    }
  },
  {
    id: "severe-bleeding",
    nameEng: "Severe Bleeding / Wounds",
    nameUrdu: "Tez Khoon ka Behna / Zakham",
    icon: "Droplet",
    description: "Khoon ka dhar dhar bahna, gehra zakham, aur jorhon ka katna.",
    guideline: {
      emergencyNameUrdu: "TEZ KHOON KA BEHNA (SEVERE BLEEDING)",
      calls: ["1122", "115"],
      steps: [
        "Saaf kapra ya gauze zakham par rakh kar haath se tez pressure lagayen.",
        "Khoon bahne wali jagah (agar hath ya paon hai) ko dil se upar (elevate) uthayein taake pressure kam ho.",
        "Kapra khoon se bhar jaye toh usey hatayein nahi, uske upar mazeed saaf kapra rakh kar dabaayein.",
        "Mareez ko letayein taake dimaag tak blood circulation baqi rahe aur wo shock mein na jaye.",
        "Agar khoon kisi surakh se dhar beh raha hai, toh wahan kapra thons dein (wound packing) aur daba kar rakhein."
      ],
      khabardar: [
        "Zakham mein phansi hui bardi churi, sheesha, ya koi aur nukili cheez khud mat nikalein, wo khoon ko rokay hue hain. Fauran doctor ke paas le jayein.",
        "Mitti, deemak ya gobar zakham par lagane ke desi totkay hargiz mat karein (is se Tetanus aur shadeed infection hota hai)."
      ],
      tip: "Tez bleeding mein tourniquet (sakt patti) ka istemal bohot zaroor jaan bachata hai, lekin ise zakham se 2-3 inch upar haddi ke upar bandha jata hai.",
      hospitalWhen: "Khoon ka fowarah nikal raha ho (arterial bleed), 10 minute lagatar dabane ke baad bhi khoon na ruke, ya mareez thanda par raha ho."
    }
  },
  {
    id: "burns",
    nameEng: "Burns (Fire, Chemical, Electric)",
    nameUrdu: "Jalna (Aag, Chemical, Bijli)",
    icon: "Flame",
    description: "Aag se jism ka jalna, tezab (acid) girna, ya bijli ka jhatka lagna.",
    guideline: {
      emergencyNameUrdu: "BURNS / JALNA",
      calls: ["1122", "115"],
      steps: [
        "Sabse pehle jalte hue hissay par kam se kam 15-20 minute tak behra hua aam nalkay ka thanda pani dalein (baraf ka pani nahi).",
        "Jalne wali jagah se chorrhiyan, ring, ya tight kapray fauran utaar dein kyunke soojan (swelling) aayegi.",
        "Agar acid/chemical gira hai toh pani mazeed 30 minute tak thandak ke liye behne dein.",
        "Zakham ko halkay saaf aur geelay kapray se dheela dhanp dein taake hawa na lagay aur dard kam ho.",
        "Bijli ke case mein pehle main switch band karein, phir mariiz ko hath lagayein."
      ],
      khabardar: [
        "Baraf ka pani ya baraf direct jalay hue zakham par hargiz mat lagayen, yeh tissue ko mazeed damage karta hai.",
        "Colgate/Toothpaste, makkhan, tail, ya desi ghee zakham par mat lagayein. Is se doctor ko treatment mein masla hota hai aur infection phailta hai.",
        "Jalay hue chhalas (blisters) ko khud hargiz mat phorhein."
      ],
      tip: "Chemical aur acid burns mein kapron ko kaat kar fauran alag karein taake chemical jism par mazeed na phail sakay."
      ,
      hospitalWhen: "Chehra, haath, gupt-ang (groin) jala ho, jism ka 10% se zaroori hissa jala ho, ya jali hui skin kaali ya safed par gayi ho."
    }
  },
  {
    id: "fractures",
    nameEng: "Fractures / Head Injury",
    nameUrdu: "Haddi ka Tootna / Sar ki Chot",
    icon: "Scissors",
    description: "Haddi ka apni jagah se hilna ya bahar nikalna, sar par chot aana duran behoshi.",
    guideline: {
      emergencyNameUrdu: "FRACTURES / SAR KI CHOT",
      calls: ["1122", "115"],
      steps: [
        "Tooti hui haddi ko hilne se rokne ke liye ek 'splint' (lakri ki patti ya cardboard) baandh dein.",
        "Splint ko haddi ke dono tarf naram kapray se dheela bandhein taake blood supply band na ho.",
        "Sar ki chot mein agar khoon beh raha hai toh dawayien, par agar gardan ka jhatka laga hai toh gardan hilayein bagair letaye rakhein.",
        "Agar sar ki chot ke baad ultee (vomit) aaye, toh mareez ko karwat dila kar letayein taake wo dum na ghutay.",
        "Chot wali jagah par soojan kam karne ke liye baraf ko kapray mein lapet kar lagayein."
      ],
      khabardar: [
        "Tooti haddi ko jhatkay se khud seedha karne ya jorne ki koshish mat karein.",
        "Mera bacha ya bada agar sar par chot ke baad behosh ho gaya ho, toh usey akele letaye mat chrein, fauran hila kar check karein aur soone na dein."
      ],
      tip: "Haddi tooti hai ke nahi, iska aam ishara yeh hai ke mareez us haddi par bilkul wazan nahi daal sakega aur wahan achanak soojan gol ho jayegi.",
      hospitalWhen: "Haddi chamra phaar kar bahar aa gayi ho (open fracture), sar ki chot ke baad achanak behoshi, ultiyan aana, ya kaan aur naak se saaf pani/khoon nikalna."
    }
  },
  {
    id: "poisoning",
    nameEng: "Poisoning / Drug Overdose",
    nameUrdu: "Zeherkhori / Overdose",
    icon: "Skull",
    description: "Zehrili cheez, ghalat dawai, phenyl, ya drugs peena/khana.",
    guideline: {
      emergencyNameUrdu: "ZEHERKHORI / DRUG OVERDOSE",
      calls: ["1122", "02199215749"],
      steps: [
        "Fauran Poison Control Center (021-99215749) ya 1122 ko call karein.",
        "Check karein mareez kya khaa chuka hai (us dabbe ya dawayi ko sambhal kar rakhhein jo unhone khai).",
        "Mareez ki saans aur nabz par nazar rakhein. Agar behosh hai par saans le raha hai, recovery position (karwat) mein letayein.",
        "Agar zeher jism ya aankh par gira hai toh fauran dher saare paani se usey dho dhalein.",
        "Mera bacha agar ghalati se dawai pee le toh fauran hospital ruju karein."
      ],
      khabardar: [
        "Mareez ko khud se ulti (vomit) karwane ki koshish hargiz na karein, khas tor par agar usne petrol, acid ya phenyl piya ho. Ulti karte hue acid dubara gala aur saans ki nali ko jala dega.",
        "Pani ya dhoodh khule aam pilaane se gurez karein jab tak poison specialist na kahe."
      ],
      tip: "Koshish karein zeher ki bottle ya khali dawayi ka patta hospital zaroor le jayein, is se doctor ko fauran anti-dote ka pata chalta hai.",
      hospitalWhen: "Saans rukne lagay, munh se jhaag aaye, daure (seizures) parhein, ya mareez behosh ho jaye."
    }
  },
  {
    id: "seizures",
    nameEng: "Seizures / Epilepsy (Daure)",
    nameUrdu: "Mirghee aur Jhatkay (Daure)",
    icon: "Zap",
    description: "Achanak jism ka akad jana, jhatkay lagna, aur munh se jhaag aana.",
    guideline: {
      emergencyNameUrdu: "SEIZURES / EPLEPSY (DAURE)",
      calls: ["1122", "115"],
      steps: [
        "Mareez ko zameen par letayein aur aas paas ki sakt ya nukili cheezein (tables, chairs) hata dein taake chot na lagay.",
        "Sar ke neeche koi naram kapra ya takiya rakh dein.",
        "Fauran time note karein ke daura kab shuru hua (aksar daure 2-3 minute mein khud ruk jaate hain).",
        "Jab jhatkay ruk jayein, toh mareez ko ek side par karwat (recovery position) dila kar letayein taake saans aasan ho.",
        "Mareez ke aas paas se hudoor aur ghutan door karein, fresh hawa aane dein."
      ],
      khabardar: [
        "Daure ke doran mareez ke munha mein chachay, chamach ya koi sakt cheez hargiz mat thonsein. Wo apni zubaan khud kaat sakte hain, par chamach danto ko tod sakta hai.",
        "Mareez ko jor se pakad kar jhatkay rokne ki koshish bilkul mat karein.",
        "Desi tareeqon jaise joota sunghana ya pani daalna se gurez karein, inki koi medical haqeeqat nahi hai."
      ],
      tip: "Aksar daure 5 minute se kam mein ruk jaate hain. Fauran hospital tabhi le kar jayen agar daura 5 minute se lamba ho ya ek ke baad doosra attack bina hosh aaye shuru ho."
      ,
      hospitalWhen: "Daura 5 minute se lamba ho, pehle kabhi daura na para ho, ya daura rukne ke baad saans na aa rahi ho."
    }
  },
  {
    id: "drowning",
    nameEng: "Drowning (Doobna)",
    nameUrdu: "Paani Mein Doobna",
    icon: "Waves",
    description: "Paani mein doobne ke baad saans ka rukna aur behoshi.",
    guideline: {
      emergencyNameUrdu: "PAANI MEIN DOOBNA (DROWNING)",
      calls: ["1122", "115"],
      steps: [
        "Pehle apne aap ko khatre mein dale bagair victim ko paani se bahar nikaalein.",
        "Usey sakt aur khushk zameen par letayein aur check karein ke kya wo saans le raha hai.",
        "Agar saans nahi le raha toh fauran CPR shuru karein (30 compressions aur 2 rescue breaths). Doobne ke cases mein pehli rescue breath bohot zaroori hoti hai.",
        "Geelay kapray utaar kar usey garam blanket ya khushk chadar mein lapet dein taake hyperthermia na ho.",
        "Agar mareez khans raha hai ya thora hosh mein hai, toh karwat dila kar chest se pani nikalne mein madad karein."
      ],
      khabardar: [
        "Mareez ke pait par zor se daba kar pani nikalne ki koshish mein time waste mat karein (ultiyan ho sakti hain jo lungs mein ja sakti hain).",
        "Agar thik lagay bhi, mareez ko akela chor kar ghar mat bhejein."
      ],
      tip: "Paani se nikalne ke baad bhi fepron (lungs) mein bacha pani 24 ghante tak 'Dry Drowning' karwa sakta hai, isliye doctor se fauran checkup zaroor karwayein.",
      hospitalWhen: "Behoshi, peela pan, khansi ke sath jhaag wala khoon aana, ya saans mein sarsarahat (wheezing)."
    }
  },
  {
    id: "heatstroke",
    nameEng: "Heatstroke (Loo Lagna)",
    nameUrdu: "Heatstroke aur Loo Lagna",
    icon: "Sun",
    description: "Shadeed garmi mein jism ka tapman barhna, thandi skin par achanak khushki, behoshi.",
    guideline: {
      emergencyNameUrdu: "HEATSTROKE (LOO LAGNA)",
      calls: ["1122", "115"],
      steps: [
        "Mareez ko fauran dhoop se nikaal kar thandi ya saaye wali jagah (AC ya cooler ke paas) bitha ya leta dein.",
        "Sary ya poore jism par saaf thanda pani chirkein ya geeli chadaar mein jism ko lapet dein.",
        "Gardan, baghli (axilla) aur groin area par baraf ke pack ya thanday paani lekar lagayein.",
        "Mareez agar poora hosh mein hai toh thanda pani ya ORS (nimkol) thora thora pilaayein.",
        "Pankha chalayein taake hawa se jism thanda ho."
      ],
      khabardar: [
        "Behosh ya thora drowzy (neend mein) mareez ko pani hargiz mat pilaayein, wo fairan lungs mein ja kar choking karega.",
        "Jism ka temperature achanak down karne ke liye direct baraf ki baalti mein mat dalain."
      ],
      tip: "Heatstroke aam garmi se alag hota hai. Agar skin bohot garam, laal aur KHUSHK ho (yani paseena aana band ho gaya ho), toh yeh heatstroke ka confirm sign hai.",
      hospitalWhen: "Achanak behoshi, temperature 104°F se upar chala jaye, ya daure (seizures) shuru ho jayein."
    }
  },
  {
    id: "allergic-reaction",
    nameEng: "Allergic Reaction / Anaphylaxis",
    nameUrdu: "Shadeed Allergy (Anaphylaxis)",
    icon: "AlertTriangle",
    description: "Dawayi, khorak ya keeday ke kaatne se achanak soojan, saans tangi aur neela pan.",
    guideline: {
      emergencyNameUrdu: "SHADEED ALLERGY (ANAPHYLAXIS)",
      calls: ["1122", "115"],
      steps: [
        "Mareez ka check karein ke kya unke paas 'EpiPen' (Adrenaline auto-injector) hai, agar hai toh fauran baayen thig (thigh) par lga dein.",
        "Fauran 1122 call karein kyunke throat soojhne se saans ka rasta band ho sakta hai.",
        "Mareez ko seedha bitha kar rakhein taake saans lena aasan ho.",
        "Agar halaq soojh raha ho aur bolne mein takleef ho, toh bolne par majboor na karein.",
        "Allergy karne wali cheez (khorak ya keeda) ko fauran door karein."
      ],
      khabardar: [
        "Ghar ki aam anti-allergy (jaise Avil) par poora inhasar mat karein agar saans lene mein takleef ho rahi ho. Anaphylaxis ka ilaaj sirf Adrenaline (epinephrine) hai.",
        "Symptom shuru hote hi pani peene ko na dein agar halaq se pani swallow karna mushkil ho."
      ],
      tip: "Allergy achanak barh sakti hai. Kisi bhi aam khujli ke sath agar hont, ankhein ya zubaan soojhne lagein toh fauran doctor se milein.",
      hospitalWhen: "Hont ya zubaan sooj jayein, saans lete hue seetiyan bajein (wheezing), ya pulse bohot kamzor lagay."
    }
  },
  {
    id: "snake-animal-bites",
    nameEng: "Snake / Animal Bites",
    nameUrdu: "Saanp ya Janwar ka Katna",
    icon: "Skull",
    description: "Zehreeli saanp ka katna, pagal kutte ka katna, shadeed jalan aur nishan.",
    guideline: {
      emergencyNameUrdu: "SAANP YA JANWAR KA KATNA",
      calls: ["1122", "115"],
      steps: [
        "Mareez ko calm rakhein — ghabranay se zehar jism mein tezi se phailta hai.",
        "Saanp ne jahan kata hai, us jism ko bilkul mat hilayein. Usey dil ke level se NEECHE rakhein.",
        "Zakham ko saaf paani aur sabun se aahista se dholein.",
        "Jahan kata hai uske upar ki paron ki rings, watches ya tight kapray utaar dein kyuke soojan aayegi.",
        "Saanp ka hulya, rang aur size yaad rakhne ki koshish karein taake doctor ko anti-venom choose karne mein help mile."
      ],
      khabardar: [
        "Zakham par cut lagana ya munh laga kar zehar choosna (sucking) filmo tak mahdood hai, yeh bilkul mat karein. Is se zehar choose wale ko bhi phailta hai.",
        "Kala dhaga ya sakt rassi bohot tight mat bandhein. Is se blood flow bilkul ruk jata hai aur wo jism ka hissa kaatna par sakta hai.",
        "Saanp ko pakadne ya maarne ke chakkar mein mazeed log apni jaan khatre mein na dalein."
      ],
      tip: "Pakistan mein aksar saanp zehreeli nahi hote, isliye ghabrahat se bachna aadha ilaaj hai. Hospital chalte hue anti-venom ka check karein.",
      hospitalWhen: "Zakham gol laal par jaye, achanak jism neela ho, drowziness ho ya saanp ke katne ke baad bolne/dekhne mein masla ho."
    }
  },
  {
    id: "diabetic-emergency",
    nameEng: "Diabetic Emergency (Low/High Sugar)",
    nameUrdu: "Sugar Levels ka Up / Down Hona",
    icon: "Shield",
    description: "Achanak sugar kam hona (hypoglycemia) ya garmi ke sath behoshi.",
    guideline: {
      emergencyNameUrdu: "DIABETIC EMERGENCY (LOW/HIGH SUGAR)",
      calls: ["1122", "115"],
      steps: [
        "Agar mareez ko paseena aa raha ho, larzish ho, aur wo confuse lage, toh ho sakta hai uski sugar kam (Low Sugar) ho gayi ho.",
        "Ghar mein sugar check karne wali machine (Glucometer) se fauran check karein.",
        "Agar sugar 70 mg/dL se kam hai aur mareez hosh mein hai, toh fauran 3 chach sugar wala paani, aam juice, ya meethi toffee dein (Rule of 15-15: 15g sugar dein aur 15 minute baad check karein).",
        "Agar sugar bohot zyada high (High Sugar) hai par mareez conscious hai, toh fauran unki regular insulin/dawa dein aur paani pilaayein.",
        "Mareez ko comfortable position mein letayein aur hospital ruju karein."
      ],
      khabardar: [
        "Agar mareez neem-behosh (semi-conscious) ya behosh ho, toh uske munha mein cheeni, pani ya liquid hargiz mat daalein. Yeh saans ki nali mein ja kar choke kar dega.",
        "Insulin ka high dose bina sugar test kiye ghalti se mat lagayein."
      ],
      tip: "Low sugar, high sugar se zyada khatarnak aur fast asar karti hai. Agar shuk shuba ho aur machine na ho toh hosh mein mareez ko cheeni dena behtar hai."
      ,
      hospitalWhen: "Mareez behosh ho jaye, sugar test 50 se kam aa rahi ho ya cheeni lene ke baad bhi hosh bahaal na ho."
    }
  },
  {
    id: "eye-injuries",
    nameEng: "Eye Injuries",
    nameUrdu: "Aankh ki Chot / Kachra",
    icon: "Eye",
    description: "Aankh mein sheesha, kachra, tezab, ya chot lagna.",
    guideline: {
      emergencyNameUrdu: "AANKH KI CHOT / INJURY",
      calls: ["1122", "115"],
      steps: [
        "Agar aankh mein chemical ya tezab gaya hai, toh fauran behte hue saaf pani se aankh ko kam se kam 15-20 minute dholein.",
        "Dhoti baar aankh khuli rakhne ki koshish karein.",
        "Chot ki soorat mein aankh ko halkay saaf kapray se cover kar dein par zor se dabayein mat.",
        "Sheesha ya koi nukili cheez ander ghus gayi ho toh aankh ke ooper ek kaghaz ka cup rakh kar tape se chipka dein taake hilay na.",
        "Dono ankhein band rakhne ko kahein kyunke ek aankh hilti hai toh doosri bhi automatically hilti hai."
      ],
      khabardar: [
        "Aankh ko hargiz malien (rub mat karein) is se damage double ho sakta hai.",
        "Aankh mein phansi hui suyi, kachra, ya sheesha khud nikalne ki koshish bilkul mat karein.",
        "Aam gulab ka arak ya desi drop aankh ki severe injury mein mat daalein."
      ],
      tip: "Aankh mein kachra jane par achanak blink (palkein jhapkayein) karne se kachra ansoo ke zariye khud hi nikal jata hai.",
      hospitalWhen: "Achanak nazar ka chala jana, aankh se khoon ya pani musalsal behna, ya extreme pain ho."
    }
  },
  {
    id: "child-emergencies",
    nameEng: "Child Emergencies (Falls, High Fever)",
    nameUrdu: "Bachon ki Emergency (Girna, Tez Bukhar)",
    icon: "Baby",
    description: "Bacha bed ya siri se gir jaye, ya achanak tez bukhar se jhatkay lagein.",
    guideline: {
      emergencyNameUrdu: "BACHON KI EMERGENCY (FALL / HIGH FEVER)",
      calls: ["1122", "115"],
      steps: [
        "Bacha siri ya unchi jagah se gire toh pehle sary aur gardan ko seedha rakh kar check karein ke kya wo ro raha hai.",
        "Agar bacha fauran roya hai aur hosh mein hai toh usey goad mein lekar dilasa dein.",
        "Tez bukhar (high fever) mein agar bacha taptapaye, toh aam nalkay ke pani se poore jism par patti (tepid sponging) karein (forehead aur baghli area main).",
        "Tez bukhar ke jhatkay (febrile seizures) mein bacha agar achanak akad jaye, toh ghabrayein mat, usey karwat letayein aur 2-3 minute mein jhatkay rukne ka wait karein.",
        "Bukhar kam karne ke liye unka wazan ke mutabiq Paracetamol syrup dein."
      ],
      khabardar: [
        "Bukhar kam karne ke liye unhe baraf ke paani se hargiz mat nahlaiye, is se shivering (kapkapi) hoti hai aur temperature mazeed high hota hai.",
        "Girtay hi agar bacha ulti kare ya thak kar soye toh usay be-tashasha sone na dein, jagah dein."
      ],
      tip: "Bukhar ke doran bache ko extra kapron ya garam blanketon mein mat lapetien, halkay kapray pehnayein taake heat jism se nikal sakay.",
      hospitalWhen: "Girne ke baad bacha behosh ho, ultiyan kare, unka sir ka narm hissa (fontanelle) fula hua lagay, ya bukhar 103°F se upar ho."
    }
  },
  {
    id: "emergency-delivery",
    nameEng: "Emergency Delivery (Birth at Home)",
    nameUrdu: "Ghar par Emergency Delivery",
    icon: "Activity",
    description: "Hospital pohanchne se pehle achanak bacha paidah hona.",
    guideline: {
      emergencyNameUrdu: "GHAR PAR EMERGENCY DELIVERY",
      calls: ["1122", "115"],
      steps: [
        "Fauran 1122 call karein aur batayein emergency delivery ho rahi hai.",
        "Maa ko saaf khushk bed ya chattai par karwat ya seedha letayein, unke ghutno ko morlein.",
        "Gar saaf haath dho kar delivery area ko bilkul saaf kapray se dholein.",
        "Bacha jab paidah ho jaye toh usey pehle saaf khushk naram kapray se zor se ragrein taake wo roye aur saans shuru ho.",
        "Bache ko maa ki chest par (skin-to-skin) letayein aur kambal se dhanp dein taake bacha thanda na ho."
      ],
      khabardar: [
        "Baby ki umbilical cord (naaf ki nali) ko kisi ghas, aam purani kainchi ya gandi dori se mat kaatein, is se maa aur bache dono ko tetanus ho sakta hai.",
        "Maa ki placenta (anwal) ko zor se baahar mat khenchein, usey khud nikalne dein."
      ],
      tip: "Cord ko agar ambulance aane tak na kata jaye toh koi masla nahi hai, bacha maa se attach reh kar bilkul safe rehta hai jab tak doctor na aa jaye.",
      hospitalWhen: "Bacha rone nahi lagay, maa se hadd se zyada khoon beh raha ho (postpartum hemorrhage), ya delivery achanak ruk jaye."
    }
  },
  {
    id: "electric-shock",
    nameEng: "Electric Shock (Bijli ka Jhatka)",
    nameUrdu: "Bijli ka Jhatka Lagna",
    icon: "ShieldAlert",
    description: "Tar se chipakna, short circuit se behoshi aur skin jalna.",
    guideline: {
      emergencyNameUrdu: "BIJLI KA JHATKA (ELECTRIC SHOCK)",
      calls: ["1122", "115"],
      steps: [
        "Mareez ko haath lagane se pehle MAIN SWITCH (breaker) fauran band karein.",
        "Agar main switch door hai, toh kisi khushk lakri, PVC pipe, ya dry akhbar se mareez ko tar se alag karein.",
        "Mareez tar se alag ho jaye toh unki breathing check karein. Agar saans band hai toh fauran CPR shuru karein.",
        "Agar mazeed thik hain toh unki burns wali skin ko thanday saaf paani se dholein.",
        "Mareez ko letaye rakhein kyunke electric shock se dil ki dharkan abnormal ho sakti hai."
      ],
      khabardar: [
        "Gila kapra, lohay ki rod ya geeli lakri se mareez ko alag karne ki koshish har giz mat karein, aap ko bhi current lag jayega.",
        "Zameen par pani khara ho toh nange paon mareez ke paas mat jayein."
      ],
      tip: "Electric shock jaffi ki tarah jism ke andarouno hissay ko jalta hai, isliye upar se jala hua kam lage toh bhi andar heart aour kidneys par asar ho sakta hai.",
      hospitalWhen: "Dhakran achanak ajeeb ho, behoshi ho, pishab ka rang dark ho jaye, ya saans mein takleef ho."
    }
  },
  {
    id: "mental-health-crisis",
    nameEng: "Mental Health Crisis / Self Harm",
    nameUrdu: "Zehni Dabao aur Khudkushi ki Koshish",
    icon: "Heart",
    description: "Extreme zehni dabao, khud ko nuksaan pohanchane ka achanak jazba.",
    guideline: {
      emergencyNameUrdu: "ZEHNI DABAO / KHUDKUSHIKI KOSHISH",
      calls: ["03174288665", "0512890505"],
      steps: [
        "Mareez ke paas rahein aur unhe akela bilkul mat chorein. Har khatarnak cheez (dawaein, churi) unse door kar dein.",
        "Bina kisi judgement ke unki baat ko sunein. Unhe yeh ehsaas dilayein ke aap unki fikar karte hain.",
        "Fauran Pakistan ki Mental Health Helpline Umang (0317-4288665) ya Rozan (051-2890505) par rabta karein.",
        "Uney lambi gehri saansein lene mein madad karein (4 second saans andar lein, 4 second rokein, 4 second baahar nikalein).",
        "Agar unhone ghalat dawai khaa li hai toh fauran Poison Control ya 1122 call karein."
      ],
      khabardar: [
        "Unke jazbaat ka mazaq mat urayein ya 'tum bohot kamzor ho' jaise alfaaz bilkul mat bolein.",
        "Unhe akele kamray mein band mat karein."
      ],
      tip: "Aksar panic attack mein log samajhte hain ke unhe heart attack ho raha hai, lambi geheri saans unhe 10-15 minute mein normal kar sakti hai.",
      hospitalWhen: "Agar unhone khud ko nuksaan pohancha liya ho, behosh hon, ya dawai ka poora dabba khaa liya ho."
    }
  }
];
