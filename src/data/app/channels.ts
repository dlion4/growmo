/* ============================================================================
   PAGE 16 — MOBILE, OFFLINE, USSD & SMS CHANNELS
   Multi-channel access hub: PWA offline, USSD, SMS, WhatsApp, Agent network.
   ========================================================================== */

export type ChannelsView =
  | "offline"
  | "ussd"
  | "sms"
  | "whatsapp"
  | "agents";

/* ── 16.1 PWA Offline Mode ───────────────────────────────────────────────── */
export interface OfflineFeature {
  id: string;
  feature: string;
  offlineCapability: "Full" | "Cached" | "Partial" | "None";
  syncBehavior: string;
  lastSynced: string;
  storageUsed: string;
  category: "Core" | "Financial" | "Intelligence";
}

export const OFFLINE_FEATURES: OfflineFeature[] = [
  { id: "of-1", feature: "View crop plans", offlineCapability: "Full", syncBehavior: "—", lastSynced: "2 min ago", storageUsed: "1.2 MB", category: "Core" },
  { id: "of-2", feature: "View task list", offlineCapability: "Full", syncBehavior: "—", lastSynced: "2 min ago", storageUsed: "0.8 MB", category: "Core" },
  { id: "of-3", feature: "Mark task complete", offlineCapability: "Cached", syncBehavior: "Syncs when online", lastSynced: "2 min ago", storageUsed: "0.1 MB", category: "Core" },
  { id: "of-4", feature: "Record expense", offlineCapability: "Cached", syncBehavior: "Syncs when online", lastSynced: "5 min ago", storageUsed: "0.3 MB", category: "Financial" },
  { id: "of-5", feature: "Take photos", offlineCapability: "Full", syncBehavior: "Uploads when online", lastSynced: "—", storageUsed: "12.4 MB", category: "Core" },
  { id: "of-6", feature: "View weather", offlineCapability: "Partial", syncBehavior: "Shows last cached forecast", lastSynced: "1 hour ago", storageUsed: "0.05 MB", category: "Intelligence" },
  { id: "of-7", feature: "AI chat", offlineCapability: "None", syncBehavior: "Queues when online", lastSynced: "—", storageUsed: "—", category: "Intelligence" },
  { id: "of-8", feature: "Payments", offlineCapability: "None", syncBehavior: "Queues when online", lastSynced: "—", storageUsed: "—", category: "Financial" },
  { id: "of-9", feature: "Market prices", offlineCapability: "Partial", syncBehavior: "Shows last cached prices", lastSynced: "3 hours ago", storageUsed: "0.2 MB", category: "Intelligence" },
  { id: "of-10", feature: "Farm diary entries", offlineCapability: "Cached", syncBehavior: "Syncs when online", lastSynced: "5 min ago", storageUsed: "2.1 MB", category: "Core" },
  { id: "of-11", feature: "Input inventory", offlineCapability: "Full", syncBehavior: "—", lastSynced: "2 min ago", storageUsed: "0.4 MB", category: "Core" },
  { id: "of-12", feature: "Worker directory", offlineCapability: "Full", syncBehavior: "—", lastSynced: "2 min ago", storageUsed: "0.1 MB", category: "Core" },
];

export const OFFLINE_STORAGE = {
  totalUsed: "17.6 MB",
  totalAvailable: "50 MB",
  photosSize: "12.4 MB",
  dataSize: "5.2 MB",
  cacheSize: "0.0 MB",
  lastFullSync: "Today · 10:32 AM",
  pendingChanges: 3,
  syncStatus: "Synced" as "Synced" | "Pending" | "Error",
};

/* ── 16.2 USSD Menu ──────────────────────────────────────────────────────── */
export interface UssdMenuItem {
  id: string;
  code: string;
  label: string;
  labelSw: string;
  description: string;
  parentCode: string | null;
  response: string;
  level: number;
}

export const USSD_MENU: UssdMenuItem[] = [
  { id: "ussd-1", code: "1", label: "Weather", labelSw: "Angalia hali ya hewa", description: "Current weather for your registered location", parentCode: null, response: "Kiambu: 24°C, Mvua 70%.\nCabbage: Rukia fungicide baada ya mvua.\nJengo la siku 3: J3 ☁️22°C, J4 🌧️21°C, J5 ⛅23°C", level: 1 },
  { id: "ussd-2", code: "2", label: "Today's tasks", labelSw: "Shughuli za leo", description: "Pending tasks for today", parentCode: null, response: "Shughuli za leo:\n1. Weka mbolea CAN — Plot 1 (Cabbage)\n2. Chunguza wadudu — Greenhouse 1\n3. Lipa John Mwangi — KES 500\n\n0. Rudi | 00. Ondoka", level: 1 },
  { id: "ussd-3", code: "3", label: "Wallet balance", labelSw: "Pesa zangu", description: "Check GrowMO wallet balance", parentCode: null, response: "Salio lako: KES 35,000\nSalio huru: KES 15,000\n\nMwisho: Deposit KES 10,000 (25 Oct)\n\n0. Rudi | 00. Ondoka", level: 1 },
  { id: "ussd-4", code: "4", label: "Market prices", labelSw: "Bei za soko", description: "Current market prices for your crops", parentCode: null, response: "Bei za soko leo:\nCabbage — KES 30/head (Marikiti)\nMaize — KES 4,100/bag (Githunguri)\nTomato — KES 5,800/crate (Wakulima)\n\n0. Rudi | 00. Ondoka", level: 1 },
  { id: "ussd-5", code: "5", label: "Ask GrowMO AI", labelSw: "Uliza GrowMO AI", description: "Ask a farming question in Kiswahili", parentCode: null, response: "Uliza GrowMO AI:\nAndika ujumbe wako:\n> Mahindi yangu ina wadudu wadogo wenye mabaka mekundu, nifanye nini?\n\nGrowMO: Hiyo ni Fall Armyworm. Fanya hivi:\n1. Rukia Alpha Super 5EC, 15ml/20L\n2. Rukia asubuhi au jioni\n3. Piga dawa kwenye kitovu cha mmea", level: 1 },
  { id: "ussd-6", code: "6", label: "Payments", labelSw: "Malipo", description: "Send money or check payment status", parentCode: null, response: "Malipo:\n1. Lipa mfanyakazi\n2. Lipa msambazaji\n3. Angalia malipo\n4. Salio\n\n0. Rudi | 00. Ondoka", level: 1 },
  { id: "ussd-7", code: "7", label: "My crops", labelSw: "Mmea wangu", description: "Check crop status and progress", parentCode: null, response: "Mmea wangu:\n1. Cabbage (Plot 1) — Siku 24/90\n   Hatua: Vegetative\n   Ifuatayo: Top dress CAN siku 3\n2. Maize (Plot 2) — Siku 45/120\n   Hatua: Tasseling\n\n0. Rudi | 00. Ondoka", level: 1 },
  { id: "ussd-8", code: "8", label: "Help", labelSw: "Saidia", description: "Get help and support", parentCode: null, response: "Saidia:\nSimu: 0800 723 456 (Bure)\nWhatsApp: 0712 345 678\nBarua: help@growmo.ke\n\n0. Rudi | 00. Ondoka", level: 1 },
];

export const USSD_CONFIG = {
  shortcode: "*384#",
  carrier: "Safaricom, Airtel, Telkom",
  sessionTimeout: 120,
  maxMenuDepth: 3,
  languages: ["English", "Kiswahili"],
  monthlyUsers: 12400,
  avgSessionDuration: "45 sec",
  completionRate: 78,
};

/* ── 16.3 SMS Commands ───────────────────────────────────────────────────── */
export interface SmsCommand {
  id: string;
  command: string;
  shortcode: string;
  action: string;
  response: string;
  example: string;
  active: boolean;
}

export const SMS_COMMANDS: SmsCommand[] = [
  { id: "sms-1", command: "WEATHER", shortcode: "20550", action: "Get current weather for registered location", response: "Kiambu: 24°C, 70% rain. Cabbage: Rukia fungicide baada ya mvua.", example: "SMS WEATHER to 20550", active: true },
  { id: "sms-2", command: "TASKS", shortcode: "20550", action: "Get today's pending tasks", response: "1. Weed cabbage (Plot 1)\n2. Top dress CAN (Plot 1)\n3. Scout greenhouse", example: "SMS TASKS to 20550", active: true },
  { id: "sms-3", command: "BALANCE", shortcode: "20550", action: "Get wallet balance", response: "Salio lako: KES 35,000. Salio huru: KES 15,000.", example: "SMS BALANCE to 20550", active: true },
  { id: "sms-4", command: "PRICE <crop>", shortcode: "20550", action: "Get current crop price at nearest market", response: "Cabbage Marikiti: KES 30/head (+2% vs yesterday)", example: "SMS PRICE cabbage to 20550", active: true },
  { id: "sms-5", command: "PAY <phone> <amount>", shortcode: "20550", action: "Initiate M-Pesa payment", response: "Confirm: Pay KES 500 to 0712***5678? Reply YES to confirm.", example: "SMS PAY 0712345678 500 to 20550", active: true },
  { id: "sms-6", command: "CROP <name>", shortcode: "20550", action: "Get crop status and next action", response: "Cabbage: Day 24/90, Vegetative. Next: Top dress CAN in 3 days.", example: "SMS CROP cabbage to 20550", active: true },
  { id: "sms-7", command: "HELP", shortcode: "20550", action: "Get list of available commands", response: "GrowMO SMS: WEATHER, TASKS, BALANCE, PRICE, PAY, CROP, HELP. Send any command to 20550.", example: "SMS HELP to 20550", active: true },
  { id: "sms-8", command: "STOP", shortcode: "20550", action: "Unsubscribe from SMS alerts", response: "You have been unsubscribed. Send START to 20550 to re-enable.", example: "SMS STOP to 20550", active: true },
];

export const SMS_STATS = {
  gateway: "Africa's Talking",
  shortcode: "20550",
  costPerSms: "KES 1",
  monthlySmsSent: 45200,
  monthlySmsReceived: 18700,
  deliveryRate: 97.5,
  avgResponseTime: "3 sec",
  activeSubscribers: 8200,
};

/* ── 16.4 WhatsApp Chatbot ───────────────────────────────────────────────── */
export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: "Utility" | "Marketing" | "Alert" | "Support";
  language: string;
  status: "Approved" | "Pending" | "Rejected";
  content: string;
  lastUsed: string;
  timesUsed: number;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  { id: "wa-1", name: "Welcome message", category: "Utility", language: "EN/SW", status: "Approved", content: "Karibu GrowMO! 🌱 I'm your farm assistant. Send me a photo, voice note, or text message to get started.", lastUsed: "Today", timesUsed: 3420 },
  { id: "wa-2", name: "Weather alert", category: "Alert", language: "EN/SW", status: "Approved", content: "🌧️ Weather alert for {location}: Heavy rain expected {date}. Protect your {crop} — cover seedlings and check drainage.", lastUsed: "Yesterday", timesUsed: 12800 },
  { id: "wa-3", name: "Task reminder", category: "Utility", language: "EN/SW", status: "Approved", content: "📋 Task reminder: {task_name} for {crop} ({plot}). Due: {date}. Reply DONE when complete.", lastUsed: "Today", timesUsed: 8900 },
  { id: "wa-4", name: "Payment confirmation", category: "Utility", language: "EN/SW", status: "Approved", content: "✅ Payment confirmed: KES {amount} to {recipient}. Ref: {ref}. Balance: KES {balance}.", lastUsed: "Today", timesUsed: 5600 },
  { id: "wa-5", name: "Price alert", category: "Alert", language: "EN/SW", status: "Approved", content: "📈 Price alert: {crop} at {market} is now KES {price}/{unit} ({change}% vs yesterday). Consider selling.", lastUsed: "3 days ago", timesUsed: 4200 },
  { id: "wa-6", name: "Photo diagnosis result", category: "Support", language: "EN/SW", status: "Approved", content: "🔍 Diagnosis: {disease_name} detected on {crop}. Treatment: {product} at {rate}. Apply {frequency}. PHI: {phi} days.", lastUsed: "Today", timesUsed: 2100 },
  { id: "wa-7", name: "Weekly summary", category: "Marketing", language: "EN/SW", status: "Pending", content: "📊 Weekly summary: {tasks_completed} tasks done, KES {income} earned, KES {expense} spent. Next week: {upcoming_tasks}.", lastUsed: "—", timesUsed: 0 },
  { id: "wa-8", name: "Crop portfolio link", category: "Marketing", language: "EN", status: "Approved", content: "🌾 My farm portfolio: {link}. Crops: {crops}. Harvest dates: {dates}. Contact me to order!", lastUsed: "1 week ago", timesUsed: 890 },
];

export const WHATSAPP_CONFIG = {
  businessNumber: "+254 712 345 678",
  provider: "Meta Cloud API",
  monthlyMessagesSent: 28400,
  monthlyMessagesReceived: 34100,
  photoDiagnosesThisMonth: 156,
  voiceNotesProcessed: 89,
  avgResponseTime: "8 sec",
  languages: ["English", "Kiswahili", "Kikuyu"],
  activeChats: 4200,
};

/* ── 16.5 Agent Network ──────────────────────────────────────────────────── */
export interface Agent {
  id: string;
  name: string;
  phone: string;
  type: "Agro-vet" | "M-Pesa Agent" | "Community Leader" | "Church Group" | "Cooperative";
  location: string;
  county: string;
  services: string[];
  commission: string;
  status: "Active" | "Training" | "Inactive";
  farmersServed: number;
  transactionsThisMonth: number;
  rating: number;
  joinedDate: string;
}

export const AGENTS: Agent[] = [
  { id: "ag-1", name: "Githunguri Agro-vet", phone: "0712 880 114", type: "Agro-vet", location: "Githunguri Town", county: "Kiambu", services: ["Onboarding", "Cash deposit", "Input sales", "Soil kit collection"], commission: "KES 20–50/txn", status: "Active", farmersServed: 342, transactionsThisMonth: 1280, rating: 4.8, joinedDate: "Jan 2025" },
  { id: "ag-2", name: "Mama Njeri M-Pesa", phone: "0733 222 111", type: "M-Pesa Agent", location: "Ikinu Market", county: "Kiambu", services: ["Cash deposit", "Cash withdrawal", "Onboarding"], commission: "KES 10–30/txn", status: "Active", farmersServed: 189, transactionsThisMonth: 890, rating: 4.6, joinedDate: "Mar 2025" },
  { id: "ag-3", name: "Pastor David Kamau", phone: "0722 555 444", type: "Church Group", location: "Kiamworia Church", county: "Kiambu", services: ["Onboarding", "Training", "Group coordination"], commission: "KES 15/txn", status: "Active", farmersServed: 124, transactionsThisMonth: 340, rating: 4.9, joinedDate: "Jun 2025" },
  { id: "ag-4", name: "Kiambu Farmers SACCO", phone: "0720 333 222", type: "Cooperative", location: "Kiambu Town", county: "Kiambu", services: ["Bulk input purchase", "Collective marketing", "Onboarding", "Training"], commission: "KES 25/txn", status: "Active", farmersServed: 567, transactionsThisMonth: 2100, rating: 4.7, joinedDate: "Feb 2025" },
  { id: "ag-5", name: "Mama Grace Wanjiku", phone: "0711 777 888", type: "Community Leader", location: "Ngoliba", county: "Kiambu", services: ["Onboarding", "Training", "Cash deposit"], commission: "KES 15/txn", status: "Training", farmersServed: 45, transactionsThisMonth: 120, rating: 4.5, joinedDate: "Sep 2026" },
  { id: "ag-6", name: "Nakuru Agro Centre", phone: "0733 444 555", type: "Agro-vet", location: "Nakuru Town", county: "Nakuru", services: ["Onboarding", "Cash deposit", "Input sales", "Agronomist referral"], commission: "KES 20–50/txn", status: "Active", farmersServed: 278, transactionsThisMonth: 950, rating: 4.7, joinedDate: "Apr 2025" },
  { id: "ag-7", name: "Eldoret Digital Hub", phone: "0720 666 777", type: "M-Pesa Agent", location: "Eldoret CBD", county: "Uasin Gishu", services: ["Cash deposit", "Cash withdrawal", "Onboarding", "Smartphone training"], commission: "KES 10–30/txn", status: "Active", farmersServed: 201, transactionsThisMonth: 780, rating: 4.4, joinedDate: "May 2025" },
  { id: "ag-8", name: "Kakamega Cooperative", phone: "0733 888 999", type: "Cooperative", location: "Kakamega Town", county: "Kakamega", services: ["Bulk input purchase", "Collective marketing", "Onboarding"], commission: "KES 25/txn", status: "Active", farmersServed: 412, transactionsThisMonth: 1560, rating: 4.6, joinedDate: "Mar 2025" },
  { id: "ag-9", name: "Mombasa Fresh Link", phone: "0711 222 333", type: "Agro-vet", location: "Mombasa CBD", county: "Mombasa", services: ["Onboarding", "Export buyer connection", "Certification support"], commission: "KES 30–50/txn", status: "Active", farmersServed: 156, transactionsThisMonth: 420, rating: 4.3, joinedDate: "Jul 2025" },
  { id: "ag-10", name: "Mama Amina Hassan", phone: "0722 999 000", type: "Community Leader", location: "Kilifi", county: "Kilifi", services: ["Onboarding", "Training", "Women's group coordination"], commission: "KES 15/txn", status: "Training", farmersServed: 67, transactionsThisMonth: 180, rating: 4.8, joinedDate: "Oct 2026" },
];

export const AGENT_NETWORK_STATS = {
  totalAgents: 2100,
  activeAgents: 1890,
  counties: 42,
  farmersServed: 128000,
  monthlyTransactions: 89000,
  totalCommissionPaid: "KES 12.4M",
  avgFarmersPerAgent: 61,
  satisfactionRate: 4.6,
};

/* ── Sync queue (pending offline changes) ─────────────────────────────────── */
export interface SyncQueueItem {
  id: string;
  type: "Task" | "Expense" | "Photo" | "Diary" | "Payment";
  description: string;
  createdAt: string;
  size: string;
  status: "Pending" | "Syncing" | "Failed";
}

export const SYNC_QUEUE: SyncQueueItem[] = [
  { id: "sq-1", type: "Task", description: "Marked weeding task complete (Plot 1)", createdAt: "10 min ago", size: "0.1 KB", status: "Pending" },
  { id: "sq-2", type: "Expense", description: "Recorded CAN purchase — KES 6,250", createdAt: "15 min ago", size: "0.3 KB", status: "Pending" },
  { id: "sq-3", type: "Photo", description: "Cabbage growth stage photo (Plot 1)", createdAt: "20 min ago", size: "2.4 MB", status: "Pending" },
];