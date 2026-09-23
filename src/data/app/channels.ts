/* ============================================================================
   PAGE 16 — MOBILE, OFFLINE, USSD & SMS CHANNELS  (/app/channels)  data layer

   Blueprint sections
   16.1 PWA offline mode   16.2 USSD menu *384#
   16.3 SMS commands       16.4 WhatsApp chatbot   16.5 Agent network
   ========================================================================== */

export const CHANNELS_CONTEXT = {
  farmer: "Mary Wanjiku",
  farm: "Mary's Farm",
  phone: "0712 345 678",
  ussd: "*384#",
  smsShort: "20550",
  waNumber: "0700 000 384",
  appVersion: "GrowMO PWA 2.4.1",
  device: "Infinix Hot 40 · Android 13",
  network: "Safaricom 3G (Githunguri)",
  online: true,
  installed: true,
  offlineHours30d: 11,
  ussdSessions30d: 14,
  smsCommands30d: 38,
  waMessages30d: 62,
  queueDepth: 2,
  lastSync: "22 Sep 2026 · 09:14",
  agentsNearby: 3,
  dataUsed: "126 MB this month",
  language: "English + Kiswahili",
};

/* ---------- 16.1 offline ---------- */
export interface OfflineFeature {
  feature: string;
  icon: string;
  offline: "Full" | "Partial" | "No";
  behaviour: string;
  queue: string;
  conflict: string;
}

export const OFFLINE_FEATURES: OfflineFeature[] = [
  { feature: "View crop plans", icon: "📋", offline: "Full", behaviour: "Season plan and crop calendars cached on install", queue: "—", conflict: "Server wins on refresh" },
  { feature: "View task list", icon: "✅", offline: "Full", behaviour: "Today and the week are pre-fetched each morning", queue: "—", conflict: "Server wins on refresh" },
  { feature: "Mark task complete", icon: "☑️", offline: "Full", behaviour: "Queued with GPS, time and worker", queue: "20 actions", conflict: "Last write wins, both kept in the audit log" },
  { feature: "Record an expense", icon: "💰", offline: "Full", behaviour: "Queued and posted to the ledger on reconnect", queue: "20 actions", conflict: "Cash-tag spends are merged, never dropped" },
  { feature: "Take photos", icon: "📷", offline: "Full", behaviour: "Downscaled to 800px, uploaded later", queue: "15 photos", conflict: "Duplicates detected by hash" },
  { feature: "Log a spray", icon: "🧪", offline: "Full", behaviour: "Written to the compliance book immediately", queue: "20 actions", conflict: "PHI dates recalculated on sync" },
  { feature: "View weather", icon: "⛅", offline: "Partial", behaviour: "Shows the last cached forecast with its timestamp", queue: "—", conflict: "Refresh replaces the cache" },
  { feature: "AI advisor chat", icon: "🤖", offline: "No", behaviour: "Queues the question and answers when online", queue: "5 questions", conflict: "Answer is generated fresh online" },
  { feature: "Market prices", icon: "📊", offline: "Partial", behaviour: "Last cached prices, clearly stamped", queue: "—", conflict: "Refresh replaces the cache" },
  { feature: "Payments", icon: "💳", offline: "No", behaviour: "Never queued — money needs a live Daraja session", queue: "—", conflict: "You are told to retry online" },
];

export const SYNC_QUEUE = [
  { id: "q1", action: "Marked task complete", detail: "Weeding Plot 1 · crew of 3 · 07:52", size: "6 KB", gps: "−1.0421, 36.7163", when: "Today 07:52" },
  { id: "q2", action: "Recorded expense", detail: "Jembe repair KES 350 · cash", size: "4 KB", gps: "−1.0420, 36.7160", when: "Today 08:10" },
];

export const OFFLINE_TIPS = [
  { title: "Install the app", body: "Add GrowMO to your home screen — 2.4 MB shell, works on zero network for tasks, logs and photos." },
  { title: "Photos shrink on their own", body: "Offline photos are downscaled to 800px and upload when Wi-Fi or cheap data returns." },
  { title: "Money never queues", body: "Payments always need a live M-Pesa session. If you are offline, GrowMO tells you instead of failing quietly." },
  { title: "Everything is stamped", body: "Offline actions keep GPS, time and worker so the audit trail has no gaps." },
];

/* ---------- 16.2 USSD ---------- */
export interface UssdScreen {
  id: string;
  title: string;
  lines: string[];
  prompt?: string;
  options: { key: string; label: string; next: string }[];
}

export const USSD_ROOT = "root";

export const USSD_SCREENS: Record<string, UssdScreen> = {
  root: {
    id: "root",
    title: "GrowMO — *384#",
    lines: ["Karibu Mary's Farm"],
    prompt: "Chagua / Select:",
    options: [
      { key: "1", label: "Angalia hali ya hewa (Weather)", next: "weather" },
      { key: "2", label: "Shughuli za leo (Today's tasks)", next: "tasks" },
      { key: "3", label: "Pesa zangu (Wallet balance)", next: "balance" },
      { key: "4", label: "Bei za soko (Market prices)", next: "prices" },
      { key: "5", label: "Uliza GrowMO AI (Ask AI)", next: "ai" },
      { key: "6", label: "Malipo (Payments)", next: "pay" },
      { key: "7", label: "Mmea wangu (My crops)", next: "crops" },
      { key: "8", label: "Saidia / Help", next: "help" },
    ],
  },
  weather: {
    id: "weather",
    title: "Hali ya hewa — *384#",
    lines: [
      "Kiambu: 24°C, mvua 70%",
      "Cabbage: rukia fungicide baada ya mvua",
      "J3 ☁️ 22°C · J4 🌧️ 21°C · J5 ⛅ 23°C",
    ],
    options: [
      { key: "1", label: "SMS ya hali ya hewa (Send by SMS)", next: "weatherSent" },
      { key: "2", label: "Onyo la dawa (Spray window)", next: "spray" },
      { key: "0", label: "Rudi (Back)", next: "root" },
    ],
  },
  weatherSent: {
    id: "weatherSent",
    title: "SMS imetumwa",
    lines: ["Forecast sent to 0712 345 678", "Bure kwa Wateja wa Premium"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
  spray: {
    id: "spray",
    title: "Dirisha la dawa",
    lines: ["Spray window: 06:00–10:00 kesho", "Upepo: 6 km/h · unyevu 68%", "Epuka kunyunyiza mchana"],
    options: [
      { key: "1", label: "Weka kumbukumbu (Set reminder)", next: "spraySet" },
      { key: "0", label: "Rudi (Back)", next: "root" },
    ],
  },
  spraySet: {
    id: "spraySet",
    title: "Kumbukumbu imewekwa",
    lines: ["Reminder set for 06:00", "SMS itatumwa dakika 30 kabla"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
  tasks: {
    id: "tasks",
    title: "Shughuli za leo",
    lines: ["1. Palilia cabbage Plot 1 (watu 3)", "2. Top-dress mahindi Plot 5", "3. Angalia drip Plot 2"],
    options: [
      { key: "1", label: "Weka alama kazi imekamilika", next: "taskDone" },
      { key: "2", label: "Tuma kwa wafanyakazi (SMS)", next: "taskSent" },
      { key: "0", label: "Rudi (Back)", next: "root" },
    ],
  },
  taskDone: {
    id: "taskDone",
    title: "Kazi imekamilika",
    lines: ["Weeding Plot 1 recorded", "Wafanyakazi 3 · masaa 7.5", "Malipo yanasubiri idhini"],
    options: [
      { key: "1", label: "Lipa sasa (Pay now)", next: "pay" },
      { key: "0", label: "Rudi (Back)", next: "root" },
    ],
  },
  taskSent: {
    id: "taskSent",
    title: "SMS imetumwa",
    lines: ["Tasks sent to 6 workers", "Waliopokea: 6 · waliokataa: 0"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
  balance: {
    id: "balance",
    title: "Pesa zangu",
    lines: ["Salio lako: KES 35,000", "Iliyotengwa: KES 20,000", "Salio huru: KES 15,000"],
    options: [
      { key: "1", label: "Historia ya mwisho (Last 3 transactions)", next: "balanceHistory" },
      { key: "2", label: "Tuma pesa (Send money)", next: "pay" },
      { key: "0", label: "Rudi (Back)", next: "root" },
    ],
  },
  balanceHistory: {
    id: "balanceHistory",
    title: "Miamala 3 ya mwisho",
    lines: ["25/10 −500 John Mwangi", "25/10 +10,000 Deposit", "24/10 −1,500 Transport"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
  prices: {
    id: "prices",
    title: "Bei za soko leo",
    lines: ["Cabbage Marikiti: 25–40/head", "Thika (best net): 20–35/head", "Trend: +8% wiki hii"],
    options: [
      { key: "1", label: "Cabbage", next: "priceCabbage" },
      { key: "2", label: "Tomato", next: "priceTomato" },
      { key: "3", label: "Maize", next: "priceMaize" },
      { key: "0", label: "Rudi (Back)", next: "root" },
    ],
  },
  priceCabbage: {
    id: "priceCabbage",
    title: "Bei — Cabbage",
    lines: ["Marikiti 25–40 · Kangemi 25–40", "Thika 20–35 (bei bora)", "Ushauri: subiri wiki 2"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
  priceTomato: {
    id: "priceTomato",
    title: "Bei — Tomato",
    lines: ["Marikiti 2,500–5,000/64kg", "Kangemi 2,800–5,500", "Mahitaji: juu (hotels)"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
  priceMaize: {
    id: "priceMaize",
    title: "Bei — Maize",
    lines: ["Marikiti 3,000–4,500/90kg", "Nakuru 2,900–4,200", "Msimu: mavuno Jan–Feb"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
  ai: {
    id: "ai",
    title: "Uliza GrowMO AI",
    lines: ["Andika ujumbe wako:", "Mfano: 'Mahindi yangu ina wadudu wenye mabaka mekundu, nifanye nini?'"],
    options: [
      { key: "1", label: "Fall armyworm (FAW)", next: "aiFaw" },
      { key: "2", label: "Nyanya — madoa meusi", next: "aiBlight" },
      { key: "0", label: "Rudi (Back)", next: "root" },
    ],
  },
  aiFaw: {
    id: "aiFaw",
    title: "GrowMO AI",
    lines: [
      "Hiyo ni Fall Armyworm.",
      "1. Rukia Alpha Super 5EC, 15ml/20L",
      "2. Rukia asubuhi au jioni",
      "3. Piga dawa kwenye kitovu cha mmea",
      "4. Kama ni wengi, pata agronomist",
    ],
    options: [
      { key: "1", label: "Tuma kwa SMS (Send by SMS)", next: "aiSent" },
      { key: "0", label: "Rudi (Back)", next: "root" },
    ],
  },
  aiBlight: {
    id: "aiBlight",
    title: "GrowMO AI",
    lines: ["Hiyo ni Early Blight (Alternaria solani).", "1. Ondoa majani yaliyoathirika", "2. Ridomil Gold MZ 68WG 50g/20L", "3. Badilisha na Mancozeb kila siku 7"],
    options: [
      { key: "1", label: "Tuma kwa SMS", next: "aiSent" },
      { key: "0", label: "Rudi (Back)", next: "root" },
    ],
  },
  aiSent: {
    id: "aiSent",
    title: "SMS imetumwa",
    lines: ["Majibu yametumwa kwa 0712 345 678", "Bei: KES 0.80"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
  pay: {
    id: "pay",
    title: "Malipo — *384#",
    lines: ["Lipa mfanyakazi kwa SMS:", "PAY <nambari> <kiasi> → 20550", "Mfano: PAY 0712345678 500"],
    options: [
      { key: "1", label: "Lipa mfanyakazi wa mwisho (Repeat last pay)", next: "payRepeat" },
      { key: "2", label: "Angalia wanaosubiri malipo", next: "payPending" },
      { key: "0", label: "Rudi (Back)", next: "root" },
    ],
  },
  payRepeat: {
    id: "payRepeat",
    title: "Lipa tena",
    lines: ["John Mwangi · KES 500", "Thibitisha: Reply YES", "Utapokea SMS ya risiti"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
  payPending: {
    id: "payPending",
    title: "Malipo yanayosubiri",
    lines: ["Wafanyakazi 4 · KES 9,312.50", "Wiki ya 20–26 Oktoba", "Idhini: wewe au mhasibu"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
  crops: {
    id: "crops",
    title: "Mimea yangu",
    lines: ["Cabbage Plot 1: Siku 24/90, Vegetative", "Tomato Plot 2: Siku 11/120, Nursery", "Inayofuata: Top-dress CAN (siku 3)"],
    options: [
      { key: "1", label: "Cabbage detail", next: "cropCabbage" },
      { key: "2", label: "Mahindi detail", next: "cropMaize" },
      { key: "0", label: "Rudi (Back)", next: "root" },
    ],
  },
  cropCabbage: {
    id: "cropCabbage",
    title: "Cabbage · Plot 1",
    lines: ["Siku 24/90 · Gloria F1", "Kazi iliyofanyika: palizi, mbolea ya kwanza", "Inayofuata: top-dress CAN 50kg/ac"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
  cropMaize: {
    id: "cropMaize",
    title: "Mahindi · Plot 5",
    lines: ["Siku 4/120 · H6213", "Scout FAW kila siku 4", "Mbegu: 10 kg/acre, DAP 50kg/acre"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
  help: {
    id: "help",
    title: "Saidia — *384#",
    lines: ["GrowMO *384# ni bure", "Simu: 0700 000 000 (24/7)", "SMS: 20550 · WhatsApp: 0700 000 384"],
    options: [
      { key: "1", label: "SMS commands zote", next: "helpSms" },
      { key: "0", label: "Ondoka (Exit)", next: "root" },
    ],
  },
  helpSms: {
    id: "helpSms",
    title: "SMS commands",
    lines: ["WEATHER · TASKS · BALANCE", "PRICE <crop> · PAY <no> <amount>", "CROP <name> · HELP"],
    options: [{ key: "0", label: "Rudi (Back)", next: "root" }],
  },
};

export const USSD_SESSION_COST = "KES 2–5 per session, charged by Safaricom like any USSD service";

/* ---------- 16.3 SMS ---------- */
export interface SmsCommand {
  code: string;
  label: string;
  example: string;
  returns: string;
  reply: string;
}

export const SMS_COMMANDS: SmsCommand[] = [
  { code: "WEATHER", label: "Current weather", example: "WEATHER", returns: "Today's forecast plus a spray note", reply: "Kiambu/Githunguri: 20°C, showers after 16:00. Tomorrow 22°C clear. Spray window 06:00–10:00. Dial *384# for the full menu." },
  { code: "TASKS", label: "Today's pending tasks", example: "TASKS", returns: "Numbered list with plot names", reply: "Today: 1. Spray tomato GH-A (Alpha Super 15ml/20L) 2. Harvest cabbage 20 crates 3. Deliver Marigiti 14:00. Reply DONE 1 to close a task." },
  { code: "BALANCE", label: "Wallet balance", example: "BALANCE", returns: "Balance, budgets and free balance", reply: "Wallet KES 35,000 · pending KES 4,500 · budgets KES 20,000 (75% used). Free balance KES 15,000." },
  { code: "PRICE <crop>", label: "Market price", example: "PRICE CABBAGE", returns: "Three markets plus the trend", reply: "Cabbage: Marikiti 1,800–2,400/bale · Thika 1,500–2,000 (best net) · Kongowea 1,600–2,100 · trend +8% this week." },
  { code: "PAY <no> <amt>", label: "Send money", example: "PAY 0712345678 500", returns: "Confirmation request before the send", reply: "Confirm: Pay KES 500 to 0712***5678? Reply YES. You will get an M-Pesa receipt SMS." },
  { code: "CROP <name>", label: "Crop status", example: "CROP CABBAGE", returns: "Day count, stage and next action", reply: "Cabbage Plot 1: Day 24/90, Vegetative. Next: top-dress CAN 50kg/acre in 3 days. Scout for aphids after the rain." },
  { code: "DONE <n>", label: "Close a task", example: "DONE 2", returns: "Confirmation plus the labour note", reply: "Task 2 closed (harvest cabbage, 20 crates). Attendance logged for 3 workers. Payroll updates this Friday." },
  { code: "HELP", label: "Command list", example: "HELP", returns: "All commands in one SMS", reply: "Commands: WEATHER, TASKS, BALANCE, PRICE <crop>, PAY <no> <amt>, CROP <name>, DONE <n>, HELP. Full menu: *384#." },
];

export const SMS_FACTS = [
  { k: "Short code", v: "20550 (Safaricom, Airtel, Telkom)" },
  { k: "Cost", v: "Normal SMS rate — KES 1–2 depending on your bundle" },
  { k: "Works without", v: "Data, WhatsApp or a smartphone" },
  { k: "Language", v: "English or Kiswahili — GrowMO replies in the language you write" },
  { k: "Fallback", v: "If the app has no data for 2 hours, task reminders are SMSed automatically" },
  { k: "Security", v: "Pays always need a YES reply plus your wallet PIN in the app" },
];

/* ---------- 16.4 WhatsApp ---------- */
export const WA_EXAMPLES = [
  {
    id: "fall",
    label: "Fall armyworm",
    symptoms: "Pinhole damage and moist sawdust-like frass in the whorl of young maize",
    diagnosis: "Fall Armyworm (Spodoptera frugiperda)",
    confidence: "94%",
    remedy: "Alpha Super 5EC at 15ml/20L, sprayed into the whorl early morning or evening; rotate with Belt after 7 days",
    cost: 1450,
    verdict: "Picha imeonyesha Fall Armyworm (Spodoptera frugiperda) kwenye kitovu cha mmea.",
  },
  {
    id: "blight",
    label: "Early blight (tomato)",
    symptoms: "Dark concentric spots on lower leaves spreading upward after the rains",
    diagnosis: "Early Blight (Alternaria solani)",
    confidence: "91%",
    remedy: "Remove affected leaves, spray Ridomil Gold MZ 68WG at 50g/20L, alternate with Mancozeb every 7 days",
    cost: 2200,
    verdict: "Madoa meusi yenye mizunguko kwenye majani ya chini — hii ni Early Blight (Alternaria solani).",
  },
  {
    id: "deficiency",
    label: "Nitrogen deficiency",
    symptoms: "Whole-leaf yellowing from the bottom of the plant upward, stunted growth",
    diagnosis: "Nitrogen deficiency",
    confidence: "88%",
    remedy: "Top-dress CAN at 50kg/acre and water it in; re-check in a week",
    cost: 3200,
    verdict: "Majani yanageuka njano kuanzia chini — upungufu wa nitrogen.",
  },
];

export const WA_FEATURES = [
  { feature: "Photo diagnosis", how: "Send a photo of the pest, disease or leaf" },
  { feature: "Voice notes", how: "Speak Kiswahili or English — it is transcribed and answered" },
  { feature: "Market prices", how: "Ask 'bei ya kabichi leo?' for live quotes" },
  { feature: "Weather", how: "Ask for the forecast or a spray window" },
  { feature: "Tasks", how: "Get today's list and close items by replying DONE" },
  { feature: "Payments", how: "Start a payout from chat; it finishes in the app" },
  { feature: "Order inputs", how: "Diagnosis can be ordered from the nearest agrovet" },
  { feature: "Language", how: "Auto-detects English, Kiswahili and Sheng" },
];

export const WA_TRANSCRIPT = [
  { from: "bot" as const, text: "Habari Mary! 🌱 Tuma picha ya shamba, sauti, au swali — nitakujibu chini ya dakika moja." },
  { from: "me" as const, text: "Photo: maize whorl with frass" },
  { from: "me" as const, text: "Mahindi yangu yana wadudu wadogo kwenye kitovu, nifanye nini?" },
];

/* ---------- 16.5 agents ---------- */
export interface Agent {
  id: string;
  name: string;
  type: string;
  town: string;
  address: string;
  phone: string;
  distance: string;
  hours: string;
  services: string[];
  float: number;
  rating: number;
}

export const AGENTS: Agent[] = [
  { id: "a1", name: "Githunguri Agrovet", type: "Agro-vet agent", town: "Githunguri", address: "Githunguri–Ikinu road, opposite the KCB agent", phone: "0720 111 222", distance: "1.8 km", hours: "Mon–Sat 7am–7pm", services: ["Cash-in", "Cash-out", "Buy inputs", "Onboarding help"], float: 42000, rating: 4.7 },
  { id: "a2", name: "Kamau M-Pesa shop", type: "M-Pesa agent", town: "Ikinu", address: "Ikinu market, next to the butcher", phone: "0712 555 888", distance: "0.8 km", hours: "Daily 6am–9pm", services: ["Cash-in", "Cash-out"], float: 26000, rating: 4.3 },
  { id: "a3", name: "Mama Njeri (community agent)", type: "Community agent", town: "Ikinu", address: "Ikinu chief's camp, Saturdays and by appointment", phone: "0733 444 999", distance: "1.2 km", hours: "By appointment", services: ["Farmer onboarding", "Training", "Help with the app"], float: 9000, rating: 4.9 },
];

export const AGENT_PROGRAMME = [
  { k: "Who can become an agent", v: "Agro-vet shops, M-Pesa agents, community leaders, church and co-op groups" },
  { k: "What GrowMO provides", v: "KYC, three-day training, a smartphone and the agent app" },
  { k: "Commission", v: "KES 10–50 per transaction plus KES 20 on every cash deposit" },
  { k: "Float support", v: "Same-day M-Pesa float top-up and a monthly settlement statement" },
  { k: "Training", v: "Agronomy basics, fraud prevention, customer care, USSD walkthroughs" },
  { k: "Agent locator", v: "Find the nearest agent by dialling *384*9# or opening the app" },
];

/* ---------- FAQ + glossary ---------- */
export const CHANNELS_FAQ = [
  { q: "Do I need a smartphone to use GrowMO?", a: "No. Dial *384# for the USSD menu or send SMS commands to 20550 from any phone. WhatsApp works on any handset that supports it, and an agent can act for you in person." },
  { q: "Does the app work without internet?", a: "Yes. Crop plans, tasks, expense logging, spray records and photos all work offline; they sync automatically when you get a connection. Payments never queue — they need a live M-Pesa session." },
  { q: "How much does USSD cost?", a: "USSD sessions cost KES 2–5 depending on your network, exactly like any other USSD service. SMS commands cost one normal SMS. Premium members get weather SMS alerts free." },
  { q: "Can I use the chatbot in Kiswahili?", a: "Yes — write or speak in Kiswahili and the bot answers in Kiswahili. It also understands Sheng and will switch back to English if you do." },
  { q: "What happens to my offline data if the phone dies?", a: "The queue is written to the device's encrypted storage, so a restart or a flat battery does not lose it. Nothing leaves the phone until the sync completes." },
  { q: "What do agents charge me?", a: "Cash deposits at an agent cost KES 20 flat and cash-outs 0.8% (minimum KES 15). The agent's commission is paid by GrowMO, not by you." },
];

export const CHANNELS_GLOSSARY = [
  { term: "USSD", def: "Dial-a-menu service — *384# — that works on any phone with no data." },
  { term: "Short code", def: "20550, the number you text commands to." },
  { term: "PWA", def: "Progressive Web App: installable, works offline, no Play Store needed." },
  { term: "Sync queue", def: "Actions saved on the phone and replayed when the network returns." },
  { term: "PHI", def: "Pre-harvest interval — the waiting days between the last spray and harvest." },
  { term: "Agent float", def: "Cash an agent keeps so they can deposit on your behalf." },
  { term: "Data saver", def: "A mode that uses about 0.3 MB a day by syncing only what changed." },
];

export const DATA_SAVERS = [
  { label: "Low-data mode", detail: "Text-only task lists, thumbnails instead of photos", saving: "Saves about 82% of data" },
  { label: "Wi-Fi sync windows", detail: "Upload photos only on Wi-Fi or off-peak bundles", saving: "Saves about 40 MB a month" },
  { label: "SMS fallback", detail: "Task reminders by SMS when there is no data for 2 hours", saving: "No data needed" },
  { label: "Nightly cache", detail: "Plans, tasks and prices pre-fetched at 5am on the cheapest bundle", saving: "Works all day offline" },
];
