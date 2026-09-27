/* ============================================================================
   PAGE 18 — SECURITY, LOGS, BACKUPS & ACCOUNT PROTECTION  (/app/logs)  data

   Blueprint sections
   18.1 Authentication methods   18.2 PIN management    18.3 Session management
   18.4 Activity & security logs 18.5 Data backup & recovery  18.6 Fraud protection
   18.7 Account recovery         18.8 Privacy (KDP Act 2019) 18.9 Security health check

   Dates follow the Sep–Oct 2026 Kenya calendar used by pages 1–17.
   Receipts: BK… backup · RST… restore · EXP… export · DTR… data transfer ·
   SEC… security action · HCK… health check · DEL… deletion reference.
   ========================================================================== */

export const SEC_CONTEXT = {
  farm: "Mary's Farm",
  farmer: "Mary Wanjiku",
  phone: "0712 345 678",
  email: "mary.wanjiku@growmo.co.ke",
  idNo: "21XXXXXXX (4)",
  county: "Kiambu",
  tier: "Premium",
  score: 7,
  scoreHint: "Enable 2FA to reach 9/10",
  encryption: "AES-256 at rest · TLS 1.3 in transit",
  dpo: "contact@dpo.growmo.co.ke",
  support: "0800 100 200 (toll-free, 24/7)",
  pinAge: 84,
  lastLogin: "Oct 25, 10:30",
  failed7d: 2,
  logins7d: 9,
};

/* ---------- 18.1 Authentication methods ---------- */
export type SecLevel = "Medium" | "High" | "Very High";

export interface AuthMethod {
  id: string;
  name: string;
  swahili: string;
  how: string;
  level: SecLevel;
  setup: string;
  enabled: boolean;
  detail: string;
}

export const AUTH_METHODS: AuthMethod[] = [
  {
    id: "phone-otp",
    name: "Phone number + OTP",
    swahili: "Simu na OTP",
    how: "Login with phone, receive 6-digit OTP via SMS",
    level: "Medium",
    setup: "Default for all users",
    enabled: true,
    detail:
      "The baseline. Safaricom delivers the code to 0712 345 678 in under 10 seconds. A new SIM on this number triggers a SIM-swap alert before the code is sent.",
  },
  {
    id: "pin",
    name: "PIN",
    swahili: "Nambari ya PIN",
    how: "4–6 digit PIN entered in app",
    level: "Medium",
    setup: "Set during onboarding",
    enabled: true,
    detail:
      "Your daily key. 3 wrong attempts lock the PIN for 5 minutes; 5 lock it for an hour; 10 locks the account and pages support. Changed 84 days ago — a strong, non-sequential PIN is in place.",
  },
  {
    id: "bio-finger",
    name: "Biometric (fingerprint)",
    swahili: "Alama ya vidole",
    how: "Phone fingerprint scanner",
    level: "High",
    setup: "Enable in settings",
    enabled: true,
    detail:
      "Unlocks the app on the Infinix Hot 40 where it was enrolled. Biometrics never leave the device — GrowMO only ever sees a signed unlock token.",
  },
  {
    id: "bio-face",
    name: "Biometric (face ID)",
    swahili: "Utambuzi wa uso",
    how: "Phone face recognition",
    level: "High",
    setup: "Enable in settings",
    enabled: false,
    detail:
      "Not enrolled on this device (the Infinix Hot 40 has no front sensor). Available on phones with face unlock — you can add it from a new device during setup.",
  },
  {
    id: "2fa-app",
    name: "2FA with authenticator app",
    swahili: "2FA kwa programu",
    how: "Google Authenticator / Authy 6-digit code",
    level: "Very High",
    setup: "Scan QR code to link",
    enabled: false,
    detail:
      "Codes rotate every 30 seconds offline — they work even in the 1AM low-signal hours at the farm. This is the single biggest score upgrade available to your account.",
  },
  {
    id: "2fa-sms",
    name: "2FA with SMS OTP",
    swahili: "2FA kwa SMS",
    how: "Additional SMS code after PIN",
    level: "High",
    setup: "Enable in settings",
    enabled: true,
    detail:
      "A second code lands by SMS for logins from new devices and for every wallet withdrawal. Recommended minimum for Premium accounts — yours is on.",
  },
  {
    id: "hw-key",
    name: "Hardware key (future)",
    swahili: "Ufunguo wa kimakuu",
    how: "USB security key (YubiKey-style)",
    level: "Very High",
    setup: "For enterprise accounts",
    enabled: false,
    detail:
      "Coming to co-op and enterprise accounts in Q2 2027. A physical key you tap — impossible to phish. Free tier and Premium cannot enroll yet.",
  },
];

export interface TierSetup {
  tier: "Free" | "Premium" | "Enterprise";
  swahili: string;
  minimum: string;
  recommended: string;
  note: string;
  active?: boolean;
}

export const TIER_SETUPS: TierSetup[] = [
  {
    tier: "Free",
    swahili: "Bure",
    minimum: "Phone + PIN",
    recommended: "Phone + PIN + Biometric",
    note: "Covers the 90% of daily use. Add biometric on any phone with a sensor.",
  },
  {
    tier: "Premium",
    swahili: "Hali ya hali",
    minimum: "Phone + PIN + Biometric",
    recommended: "Phone + PIN + Biometric + SMS 2FA",
    note: "Your current plan. All four active and the account sits at 9/10.",
    active: true,
  },
  {
    tier: "Enterprise",
    swahili: "Biashara",
    minimum: "All methods + 2FA app",
    recommended: "All methods active + hardware key at launch",
    note: "For co-ops and aggregators — per-member review and hardware keys at launch.",
  },
];

/* ---------- 18.2 PIN management ---------- */
export interface PinRule {
  id: string;
  feature: string;
  details: string;
}

export const PIN_RULES: PinRule[] = [
  {
    id: "pr1",
    feature: "Set PIN",
    details:
      "4–6 digits. Cannot be 1111, 1234, 0000 or the last 4 of your phone number.",
  },
  {
    id: "pr2",
    feature: "Change PIN",
    details:
      "Enter old PIN → enter new PIN → confirm. Takes under a minute, works offline then syncs.",
  },
  {
    id: "pr3",
    feature: "Reset PIN",
    details: "“Forgot PIN” → verify via OTP to 0712 345 678 → set a new PIN.",
  },
  {
    id: "pr4",
    feature: "Transaction PIN",
    details:
      "Separate PIN for payments (optional, recommended). Kept distinct so the login PIN alone never pays out money.",
  },
  {
    id: "pr5",
    feature: "PIN lockout",
    details:
      "3 wrong → 5 min. 5 wrong → 1 hour. 10 wrong → account locked, contact support.",
  },
  {
    id: "pr6",
    feature: "PIN timeout",
    details:
      "Re-entry required after 5 minutes of inactivity — the app locks while it waits.",
  },
];

export const PIN_LOCKOUT_STEPS = [
  {
    attempts: "3 wrong attempts",
    lock: "PIN locked 5 minutes",
    tone: "medium" as const,
  },
  {
    attempts: "5 wrong attempts",
    lock: "PIN locked 1 hour",
    tone: "high" as const,
  },
  {
    attempts: "10 wrong attempts",
    lock: "Account locked — call support",
    tone: "high" as const,
  },
];

/* ---------- 18.3 Session management ---------- */
export interface Session {
  id: string;
  device: string;
  model: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  trusted: boolean;
  current?: boolean;
  note?: string;
}

export const SESSIONS: Session[] = [
  {
    id: "s1",
    device: "Infinix Hot 40",
    model: "X6821",
    os: "Android 14",
    location: "Kiambu, KE",
    ip: "196.201.44.12",
    lastActive: "Now",
    trusted: true,
    current: true,
    note: "This device — fingerprint enrolled",
  },
  {
    id: "s2",
    device: "Tecno Spark 20",
    model: "TG9",
    os: "Android 13",
    location: "Nairobi, KE",
    ip: "41.215.88.3",
    lastActive: "2 hours ago",
    trusted: false,
    note: "Peter Kamau's phone — used for morning harvest checks",
  },
  {
    id: "s3",
    device: "Chrome · Windows",
    model: "Windows 11",
    os: "Web app",
    location: "Kiambu, KE",
    ip: "196.201.44.12",
    lastActive: "Yesterday, 21:40",
    trusted: false,
    note: "Home laptop — co-op records review",
  },
  {
    id: "s4",
    device: "Safari · iPhone",
    model: "iPhone 13",
    os: "iOS 17",
    location: "Kikuyu, KE",
    ip: "105.112.6.77",
    lastActive: "Oct 21, 08:12",
    trusted: true,
    note: "Mary (old iPhone) — sold Oct 20, session kept until logout",
  },
  {
    id: "s5",
    device: "USSD *384#",
    model: "Any handset",
    os: "USSD session",
    location: "Kiambu, KE",
    ip: "—",
    lastActive: "Oct 24, 17:05",
    trusted: true,
    note: "Offline menu — weather & task check",
  },
];

export const AUTO_LOGOUT_OPTIONS = [
  { value: "5 min", rec: true, note: "Recommended — tightest session window" },
  { value: "15 min", rec: false, note: "Good balance for farm work" },
  { value: "30 min", rec: false, note: "OK if the phone stays on your person" },
  { value: "1 hour", rec: false, note: "Long — keep the phone close" },
  {
    value: "Never",
    rec: false,
    note: "Not recommended — the app stays unlocked",
  },
];

/* ---------- 18.4 Activity & security logs ---------- */
export type LogRisk = "Low" | "Medium" | "High";
export type LogType =
  | "Login"
  | "Login attempt"
  | "Payment"
  | "PIN"
  | "Device"
  | "Data"
  | "Alert"
  | "Backup"
  | "Settings";

export interface LogEvent {
  id: string;
  ts: string; // display
  iso: string; // sort key
  type: LogType;
  event: string;
  details: string;
  ip: string;
  location: string;
  device: string;
  risk: LogRisk;
}

export const LOG_EVENTS: LogEvent[] = [
  {
    id: "l01",
    ts: "Oct 25 10:30:12",
    iso: "2026-10-25T10:30",
    type: "Login",
    event: "Login",
    details: "Phone + PIN + Biometric (fingerprint)",
    ip: "196.201.44.12",
    location: "Kiambu",
    device: "Infinix Hot 40",
    risk: "Low",
  },
  {
    id: "l02",
    ts: "Oct 25 10:30:15",
    iso: "2026-10-25T10:30",
    type: "Settings",
    event: "Dashboard viewed",
    details: "Section: Wallet & payments",
    ip: "—",
    location: "Kiambu",
    device: "Infinix Hot 40",
    risk: "Low",
  },
  {
    id: "l03",
    ts: "Oct 25 10:31:02",
    iso: "2026-10-25T10:31",
    type: "Payment",
    event: "Payment initiated",
    details: "KES 500 to 0712 555 123 (John Mwangi) — weeding",
    ip: "—",
    location: "—",
    device: "Infinix Hot 40",
    risk: "Medium",
  },
  {
    id: "l04",
    ts: "Oct 25 10:31:15",
    iso: "2026-10-25T10:31",
    type: "PIN",
    event: "Payment PIN entered",
    details: "Correct — first attempt",
    ip: "—",
    location: "—",
    device: "Infinix Hot 40",
    risk: "Low",
  },
  {
    id: "l05",
    ts: "Oct 25 10:31:18",
    iso: "2026-10-25T10:31",
    type: "Payment",
    event: "Payment completed",
    details: "M-Pesa B2C success · Ref QJK3L5X7YZ",
    ip: "—",
    location: "—",
    device: "—",
    risk: "Medium",
  },
  {
    id: "l06",
    ts: "Oct 25 10:32:00",
    iso: "2026-10-25T10:32",
    type: "Settings",
    event: "Task marked complete",
    details: "“Weeding cabbage” — Plot 1, verified by John",
    ip: "—",
    location: "—",
    device: "Infinix Hot 40",
    risk: "Low",
  },
  {
    id: "l07",
    ts: "Oct 25 06:00:00",
    iso: "2026-10-25T06:00",
    type: "Backup",
    event: "Automatic backup completed",
    details: "248 MB · 41,930 objects · encrypted, Nairobi region",
    ip: "—",
    location: "—",
    device: "GrowMO service",
    risk: "Low",
  },
  {
    id: "l08",
    ts: "Oct 24 22:15:00",
    iso: "2026-10-24T22:15",
    type: "Login attempt",
    event: "Login attempt",
    details: "Wrong PIN (attempt 1/3)",
    ip: "41.215.88.3",
    location: "Nairobi",
    device: "Chrome · Windows",
    risk: "Medium",
  },
  {
    id: "l09",
    ts: "Oct 24 22:15:30",
    iso: "2026-10-24T22:15",
    type: "Login attempt",
    event: "Login attempt",
    details: "Wrong PIN (attempt 2/3)",
    ip: "41.215.88.3",
    location: "Nairobi",
    device: "Chrome · Windows",
    risk: "High",
  },
  {
    id: "l10",
    ts: "Oct 24 22:15:45",
    iso: "2026-10-24T22:15",
    type: "PIN",
    event: "Account temporarily locked",
    details: "3 wrong PIN attempts — 5-min cooldown started",
    ip: "41.215.88.3",
    location: "Nairobi",
    device: "—",
    risk: "High",
  },
  {
    id: "l11",
    ts: "Oct 24 22:16:00",
    iso: "2026-10-24T22:16",
    type: "Alert",
    event: "Alert sent",
    details: "SMS: “3 failed login attempts on your GrowMO account”",
    ip: "—",
    location: "—",
    device: "—",
    risk: "High",
  },
  {
    id: "l12",
    ts: "Oct 24 22:21:04",
    iso: "2026-10-24T22:21",
    type: "Login",
    event: "Login",
    details: "Phone + PIN — after cooldown, correct PIN",
    ip: "41.215.88.3",
    location: "Nairobi",
    device: "Chrome · Windows",
    risk: "Medium",
  },
  {
    id: "l13",
    ts: "Oct 24 17:05:00",
    iso: "2026-10-24T17:05",
    type: "Login",
    event: "USSD session",
    details: "*384# — weather + tasks menu, 2 min 10 s",
    ip: "—",
    location: "Kiambu",
    device: "Infinix Hot 40",
    risk: "Low",
  },
  {
    id: "l14",
    ts: "Oct 24 12:00:00",
    iso: "2026-10-24T12:00",
    type: "Backup",
    event: "Automatic backup completed",
    details: "244 MB · encrypted snapshot",
    ip: "—",
    location: "—",
    device: "GrowMO service",
    risk: "Low",
  },
  {
    id: "l15",
    ts: "Oct 23 15:30:00",
    iso: "2026-10-23T15:30",
    type: "Backup",
    event: "Manual backup completed",
    details: "243 MB · user triggered before laptop migration",
    ip: "196.201.44.12",
    location: "Kiambu",
    device: "Chrome · Windows",
    risk: "Low",
  },
  {
    id: "l16",
    ts: "Oct 23 14:00:00",
    iso: "2026-10-23T14:00",
    type: "PIN",
    event: "PIN changed",
    details: "Login PIN rotated — old ****44, new verified",
    ip: "196.201.44.12",
    location: "Kiambu",
    device: "Infinix Hot 40",
    risk: "Medium",
  },
  {
    id: "l17",
    ts: "Oct 22 09:14:00",
    iso: "2026-10-22T09:14",
    type: "Device",
    event: "New device login",
    details: "Safari · iPhone (iPhone 13) from Kikuyu — 2FA SMS code verified",
    ip: "105.112.6.77",
    location: "Kikuyu",
    device: "Safari · iPhone",
    risk: "Medium",
  },
  {
    id: "l18",
    ts: "Oct 22 09:15:00",
    iso: "2026-10-22T09:15",
    type: "Alert",
    event: "Alert sent",
    details: "SMS: “New login from Safari · iPhone in Kikuyu. Was this you?”",
    ip: "—",
    location: "—",
    device: "—",
    risk: "Medium",
  },
  {
    id: "l19",
    ts: "Oct 21 16:40:00",
    iso: "2026-10-21T16:40",
    type: "Payment",
    event: "Payment completed",
    details: "KES 6,500 to Till 452198 (Githunguri Agrovet) — DAP 50kg ×2",
    ip: "—",
    location: "—",
    device: "Infinix Hot 40",
    risk: "Medium",
  },
  {
    id: "l20",
    ts: "Oct 21 16:39:22",
    iso: "2026-10-21T16:39",
    type: "Alert",
    event: "Duplicate-payment check",
    details:
      "Amount within 1 h to same till — flagged, farmer confirmed as second bag",
    ip: "—",
    location: "—",
    device: "Infinix Hot 40",
    risk: "Medium",
  },
  {
    id: "l21",
    ts: "Oct 20 09:00:00",
    iso: "2026-10-20T09:00",
    type: "Data",
    event: "Data export",
    details: "Downloaded all records as ZIP (CSV + photos), 231 MB",
    ip: "196.201.44.12",
    location: "Kiambu",
    device: "Chrome · Windows",
    risk: "Medium",
  },
  {
    id: "l22",
    ts: "Oct 19 07:55:00",
    iso: "2026-10-19T07:55",
    type: "Settings",
    event: "Auto-logout changed",
    details: "Timer set to 5 minutes",
    ip: "196.201.44.12",
    location: "Kiambu",
    device: "Infinix Hot 40",
    risk: "Low",
  },
  {
    id: "l23",
    ts: "Oct 18 12:00:00",
    iso: "2026-10-18T12:00",
    type: "Backup",
    event: "Automatic backup completed",
    details: "243 MB · encrypted snapshot",
    ip: "—",
    location: "—",
    device: "GrowMO service",
    risk: "Low",
  },
  {
    id: "l24",
    ts: "Oct 17 20:12:00",
    iso: "2026-10-17T20:12",
    type: "Login attempt",
    event: "Login attempt",
    details: "Wrong phone number (0712 345 680) — 0 s session",
    ip: "154.121.33.9",
    location: "Nakuru",
    device: "Unknown",
    risk: "High",
  },
  {
    id: "l25",
    ts: "Oct 17 20:12:05",
    iso: "2026-10-17T20:12",
    type: "Alert",
    event: "Alert sent",
    details: "SMS: “Login attempt with a different number was blocked”",
    ip: "—",
    location: "—",
    device: "—",
    risk: "High",
  },
  {
    id: "l26",
    ts: "Oct 16 10:20:00",
    iso: "2026-10-16T10:20",
    type: "Device",
    event: "Device trusted",
    details: "Infinix Hot 40 marked trusted — 2FA skipped on this device",
    ip: "196.201.44.12",
    location: "Kiambu",
    device: "Infinix Hot 40",
    risk: "Low",
  },
  {
    id: "l27",
    ts: "Oct 15 06:00:00",
    iso: "2026-10-15T06:00",
    type: "Backup",
    event: "Automatic backup completed",
    details: "240 MB · encrypted snapshot",
    ip: "—",
    location: "—",
    device: "GrowMO service",
    risk: "Low",
  },
  {
    id: "l28",
    ts: "Oct 14 18:30:00",
    iso: "2026-10-14T18:30",
    type: "Settings",
    event: "Notification preference saved",
    details: "Login alerts: SMS + push",
    ip: "196.201.44.12",
    location: "Kiambu",
    device: "Infinix Hot 40",
    risk: "Low",
  },
  {
    id: "l29",
    ts: "Oct 13 11:05:00",
    iso: "2026-10-13T11:05",
    type: "Payment",
    event: "Payment completed",
    details: "KES 2,000 to 0733 666 777 (Grace Wanjiku) — medical advance",
    ip: "—",
    location: "—",
    device: "Infinix Hot 40",
    risk: "Medium",
  },
  {
    id: "l30",
    ts: "Oct 12 09:45:00",
    iso: "2026-10-12T09:45",
    type: "Data",
    event: "Privacy restriction saved",
    details: "AI training on farm data turned off",
    ip: "196.201.44.12",
    location: "Kiambu",
    device: "Infinix Hot 40",
    risk: "Low",
  },
];

export const LOG_EVENT_TYPES: LogType[] = [
  "Login",
  "Login attempt",
  "Payment",
  "PIN",
  "Device",
  "Data",
  "Alert",
  "Backup",
  "Settings",
];
export const LOG_RISKS: LogRisk[] = ["Low", "Medium", "High"];
export const LOG_DATES = [
  "Last 24 h",
  "Last 7 days",
  "Last 30 days",
  "October 2026",
];
export const LOG_LOCATIONS = ["Kiambu", "Nairobi", "Kikuyu", "Nakuru"];

/* ---------- 18.5 Data backup & recovery ---------- */
export interface BackupRow {
  id: string;
  date: string;
  iso: string;
  type: "Auto" | "Manual";
  size: string;
  status: "Complete" | "Running" | "Failed";
  trigger: string;
  objects: number;
}

export const BACKUP_HISTORY: BackupRow[] = [
  {
    id: "b1",
    date: "Oct 25 06:00",
    iso: "2026-10-25T06:00",
    type: "Auto",
    size: "248 MB",
    status: "Complete",
    trigger: "Scheduled (6-hourly)",
    objects: 41930,
  },
  {
    id: "b2",
    date: "Oct 24 18:00",
    iso: "2026-10-24T18:00",
    type: "Auto",
    size: "245 MB",
    status: "Complete",
    trigger: "Scheduled (6-hourly)",
    objects: 41712,
  },
  {
    id: "b3",
    date: "Oct 24 12:00",
    iso: "2026-10-24T12:00",
    type: "Auto",
    size: "244 MB",
    status: "Complete",
    trigger: "Scheduled (6-hourly)",
    objects: 41698,
  },
  {
    id: "b4",
    date: "Oct 24 06:00",
    iso: "2026-10-24T06:00",
    type: "Auto",
    size: "243 MB",
    status: "Complete",
    trigger: "Scheduled (6-hourly)",
    objects: 41640,
  },
  {
    id: "b5",
    date: "Oct 23 15:30",
    iso: "2026-10-23T15:30",
    type: "Manual",
    size: "243 MB",
    status: "Complete",
    trigger: "User triggered (laptop migration)",
    objects: 41601,
  },
  {
    id: "b6",
    date: "Oct 23 06:00",
    iso: "2026-10-23T06:00",
    type: "Auto",
    size: "240 MB",
    status: "Complete",
    trigger: "Scheduled (6-hourly)",
    objects: 41522,
  },
  {
    id: "b7",
    date: "Oct 22 18:00",
    iso: "2026-10-22T18:00",
    type: "Auto",
    size: "240 MB",
    status: "Complete",
    trigger: "Scheduled (6-hourly)",
    objects: 41487,
  },
  {
    id: "b8",
    date: "Oct 22 12:00",
    iso: "2026-10-22T12:00",
    type: "Auto",
    size: "239 MB",
    status: "Failed",
    trigger: "Scheduled — network dropped mid-run",
    objects: 0,
  },
];

export const BACKUP_CONTENTS = [
  {
    id: "bc1",
    label: "Farm data & plots",
    size: "42 MB",
    objects: "312 records",
    emoji: "🏡",
  },
  {
    id: "bc2",
    label: "Photos",
    size: "181 MB",
    objects: "2,148 photos",
    emoji: "📷",
  },
  {
    id: "bc3",
    label: "Transactions & receipts",
    size: "14 MB",
    objects: "8,904 entries",
    emoji: "💳",
  },
  {
    id: "bc4",
    label: "Crop & task records",
    size: "7.8 MB",
    objects: "1,266 tasks",
    emoji: "🌱",
  },
  {
    id: "bc5",
    label: "Settings & team",
    size: "0.4 MB",
    objects: "6 members · 25 settings",
    emoji: "⚙️",
  },
  {
    id: "bc6",
    label: "Documents & certificates",
    size: "4.6 MB",
    objects: "83 files",
    emoji: "📄",
  },
];

export const RESTORE_SCOPES = [
  {
    id: "all",
    label: "Everything",
    swahili: "Kila kitu",
    note: "Full snapshot — replaces current data with the selected backup",
  },
  {
    id: "crops",
    label: "Crops & tasks only",
    swahili: "Vyakula na kazi",
    note: "Season plans, tasks and growth logs — farm data and finance stay",
  },
  {
    id: "finances",
    label: "Finances only",
    swahili: "Fedha pekee",
    note: "Transactions, budgets and receipts — crops and photos stay",
  },
  {
    id: "photos",
    label: "Photos only",
    swahili: "Picha pekee",
    note: "Restores the photo library from the snapshot",
  },
];

export const EXPORT_FORMATS = [
  {
    id: "csv",
    label: "CSV",
    note: "Tables — ledger, tasks, plots, labour. Opens in Excel & the co-op office",
  },
  {
    id: "json",
    label: "JSON",
    note: "Structured — everything the app knows, machine-readable",
  },
  {
    id: "pdf",
    label: "PDF",
    note: "Reports — season summary, P&L, certificates, readable by anyone",
  },
  {
    id: "jpg",
    label: "JPG photos",
    note: "Full photo library, contact-sheet ordered by plot",
  },
];

/* ---------- 18.6 Fraud protection ---------- */
export interface FraudFeature {
  id: string;
  name: string;
  swahili: string;
  how: string;
  enabled: boolean;
  locked?: boolean;
}

export const FRAUD_FEATURES: FraudFeature[] = [
  {
    id: "f1",
    name: "Unusual location login",
    swahili: "Anza kutoka mahali pya",
    how: "Login from a new city/county → requires 2FA + SMS alert to 0712 345 678.",
    enabled: true,
    locked: true,
  },
  {
    id: "f2",
    name: "Unusual transaction pattern",
    swahili: "Malipo ya kawaida",
    how: "Any payment above 3× your 30-day average asks for an additional PIN entry.",
    enabled: true,
  },
  {
    id: "f3",
    name: "Velocity limit",
    swahili: "Kiwango cha mwendo",
    how: "Max 10 transactions/hour and KES 50,000/day. You can tune both below.",
    enabled: true,
    locked: true,
  },
  {
    id: "f4",
    name: "Duplicate payment detection",
    swahili: "Malipo mara mbili",
    how: "Same amount to the same recipient within an hour → warning before release.",
    enabled: true,
  },
  {
    id: "f5",
    name: "Account takeover detection",
    swahili: "Uchujio wa udanganyifu",
    how: "Multiple failed logins plus a password change → auto-lock the account + SMS you.",
    enabled: true,
    locked: true,
  },
  {
    id: "f6",
    name: "Beneficiary verification",
    swahili: "Uthibitisho wa mpokeaji",
    how: "First payment to a new number → the registered name is shown so you can spot mismatches.",
    enabled: true,
  },
  {
    id: "f7",
    name: "SIM swap detection",
    swahili: "Ubadilishaji wa SIM",
    how: "Safaricom partnership flags a SIM change and freezes M-Pesa payments until you confirm.",
    enabled: true,
    locked: true,
  },
  {
    id: "f8",
    name: "Spending pattern AI",
    swahili: "AI ya matumizi",
    how: "Learns your normal spending (payday Fridays, agrovet Tuesdays) and flags anomalies.",
    enabled: true,
  },
  {
    id: "f9",
    name: "Withdrawal SMS mirror",
    swahili: "Sms ya kupaka",
    how: "Every withdrawal is mirrored by SMS in plain language within 30 seconds.",
    enabled: false,
  },
];

export const VELOCITY_LIMITS = {
  perHour: 10,
  perDay: 50000,
  multiplier: 3,
  avgPayout30d: 1850,
};

/* ---------- 18.7 Account recovery ---------- */
export interface RecoveryScenario {
  id: string;
  scenario: string;
  swahili: string;
  method: string;
  steps: string[];
  eta: string;
  cta: string;
}

export const RECOVERY_SCENARIOS: RecoveryScenario[] = [
  {
    id: "rc1",
    scenario: "Forgot PIN",
    swahili: "Nimeangalia PIN",
    method: "OTP to registered phone → new PIN",
    steps: [
      "Tap “Forgot PIN”",
      "Receive OTP on 0712 345 678",
      "Enter OTP (123456 in demo)",
      "Set a new 4–6 digit PIN",
    ],
    eta: "Under 2 minutes",
    cta: "Start reset",
  },
  {
    id: "rc2",
    scenario: "Lost phone",
    swahili: "Simu imedondewa",
    method:
      "Call support → verify ID + farm details → freeze device → activate new phone",
    steps: [
      "Call 0800 100 200 (toll-free)",
      "Give national ID + farm name + plot count",
      "Support freezes the old session",
      "Activate GrowMO on the new phone with OTP",
    ],
    eta: "10–20 minutes by phone",
    cta: "Call support",
  },
  {
    id: "rc3",
    scenario: "Phone + SIM lost",
    swahili: "Simu na SIM zimedondeka",
    method:
      "Visit nearest GrowMO agent with national ID → identity verification → account reset",
    steps: [
      "Report the SIM to Safaricom first",
      "Go to Githunguri Agrovet or any GrowMO agent",
      "Show national ID 21XXXXXXX (4)",
      "Agent verifies against farm records and resets the account",
    ],
    eta: "Same day at the agent",
    cta: "Find an agent",
  },
  {
    id: "rc4",
    scenario: "Account locked (too many attempts)",
    swahili: "Akaunti imefungwa",
    method: "Wait out the cooldown, or call support, or visit an agent",
    steps: [
      "Check the lockout timer in PIN management",
      "Cooldowns lift automatically (5 min / 1 h)",
      "Urgent? Call support with your ID for manual unlock",
      "After 10 wrong attempts an agent visit is required",
    ],
    eta: "5 min – same day",
    cta: "Check lockout",
  },
  {
    id: "rc5",
    scenario: "Suspected fraud",
    swahili: "Nahisi udanganyifu",
    method: "“Secure my account” → instant freeze → call support",
    steps: [
      "Tap “Secure my account” — freezes sends & withdrawals instantly",
      "Review the last 24 h of security logs",
      "Call 0800 100 200 to report what happened",
      "Support walks the ledger with you line by line",
    ],
    eta: "Freeze is instant",
    cta: "Secure my account",
  },
  {
    id: "rc6",
    scenario: "Deceased account",
    swahili: "Akaunti ya mfu",
    method:
      "Next of kin: death certificate + ID + court letter → data export + wallet balance transfer",
    steps: [
      "Next of kin contacts the DPO or calls support",
      "Death certificate, their ID and the court letter are checked",
      "Full data export is provided (KDP Act)",
      "Wallet balance is transferred to the family's verified account",
    ],
    eta: "5–10 working days",
    cta: "How it works",
  },
];

/* ---------- 18.8 Privacy & data protection (Kenya Data Protection Act 2019) ---------- */
export interface PrivacyRight {
  id: string;
  right: string;
  swahili: string;
  impl: string;
  status: "Active" | "Opted out" | "On request";
  actionable: boolean;
}

export const PRIVACY_RIGHTS: PrivacyRight[] = [
  {
    id: "pv1",
    right: "Right to be informed",
    swahili: "Haki ya kujulishwa",
    impl: "Privacy policy at signup, plain language — Kiswahili version available.",
    status: "Active",
    actionable: false,
  },
  {
    id: "pv2",
    right: "Right of access",
    swahili: "Haki ya kupata",
    impl: "View every record GrowMO holds about you — farm, money, activity, logs.",
    status: "On request",
    actionable: true,
  },
  {
    id: "pv3",
    right: "Right to rectification",
    swahili: "Haki ya kurekebisha",
    impl: "Edit any personal data in Settings & team — changes are logged.",
    status: "Active",
    actionable: false,
  },
  {
    id: "pv4",
    right: "Right to erasure",
    swahili: "Haki ya kufutwa",
    impl: "“Delete my account” → 30-day grace period → permanent deletion.",
    status: "On request",
    actionable: true,
  },
  {
    id: "pv5",
    right: "Right to restrict processing",
    swahili: "Kuzuia matumizi",
    impl: "Toggle off data sharing, benchmarking and AI training — yours is already off for AI.",
    status: "Active",
    actionable: true,
  },
  {
    id: "pv6",
    right: "Right to data portability",
    swahili: "Kusogeza data",
    impl: "Export all data in machine-readable format (CSV/JSON) any time.",
    status: "On request",
    actionable: true,
  },
  {
    id: "pv7",
    right: "Right to object",
    swahili: "Kulikanua",
    impl: "Opt out of marketing, benchmarking or any data use — one tap, no reason needed.",
    status: "Opted out",
    actionable: true,
  },
  {
    id: "pv8",
    right: "Data minimization",
    swahili: "Data ndogo ndogo",
    impl: "Only what the service needs is collected — no contact scraping, no ad IDs.",
    status: "Active",
    actionable: false,
  },
  {
    id: "pv9",
    right: "Storage limitation",
    swahili: "Kuhifadhi kwa muda",
    impl: "Auto-delete after 3 years of inactivity, with a 90-day notice by SMS and email.",
    status: "Active",
    actionable: false,
  },
  {
    id: "pv10",
    right: "Security measures",
    swahili: "Usalama",
    impl: "Encryption at rest (AES-256), in transit (TLS 1.3), role-based access controls.",
    status: "Active",
    actionable: false,
  },
  {
    id: "pv11",
    right: "Breach notification",
    swahili: "Taarifa ya uvunjaji",
    impl: "You are notified within 72 hours of any breach, as the Act requires.",
    status: "Active",
    actionable: false,
  },
];

export const DATA_SHARING_PREFS = [
  {
    id: "d1",
    label: "Co-op benchmarking",
    note: "Anonymous yield & price comparison with the Kiambu Farmers Co-op group",
    enabled: true,
  },
  {
    id: "d2",
    label: "AI model training",
    note: "Your farm data is used to train GrowMO's advisory models",
    enabled: false,
  },
  {
    id: "d3",
    label: "Partner offers (agrovet, insurance)",
    note: "Verified partners may contact you about input and cover deals",
    enabled: false,
  },
  {
    id: "d4",
    label: "Marketing & campaigns",
    note: "Seasonal tips and GrowMO feature announcements by SMS/WhatsApp",
    enabled: true,
  },
];

/* ---------- 18.9 Security health check ---------- */
export type CheckStatus = "Pass" | "Fail" | "Warn";

export interface HealthCheck {
  id: string;
  check: string;
  status: CheckStatus;
  detail: string;
  actionLabel?: string;
  fixScore: number; // score added if fixed
}

export const HEALTH_CHECKS: HealthCheck[] = [
  {
    id: "h1",
    check: "Strong PIN set",
    status: "Pass",
    detail:
      "6 digits, non-sequential, not the phone's last 4. Changed 84 days ago.",
    fixScore: 0,
  },
  {
    id: "h2",
    check: "Biometric enabled",
    status: "Pass",
    detail: "Fingerprint enrolled on the Infinix Hot 40.",
    fixScore: 0,
  },
  {
    id: "h3",
    check: "2FA enabled",
    status: "Fail",
    detail:
      "SMS 2FA is on, but the authenticator-app layer (very high) is missing.",
    actionLabel: "Enable 2FA",
    fixScore: 2,
  },
  {
    id: "h4",
    check: "Trusted devices reviewed",
    status: "Warn",
    detail: "1 device unrecognised in 7 days — Safari · iPhone from Kikuyu.",
    actionLabel: "Review devices",
    fixScore: 0,
  },
  {
    id: "h5",
    check: "Backup recent (within 24 h)",
    status: "Pass",
    detail: "Last backup Oct 25, 06:00 — 4 hours ago, 248 MB verified.",
    fixScore: 0,
  },
  {
    id: "h6",
    check: "No suspicious logins (7 days)",
    status: "Pass",
    detail:
      "2 failed attempts on Oct 24, both from your known Nairobi laptop IP.",
    fixScore: 0,
  },
  {
    id: "h7",
    check: "Transaction limits set",
    status: "Pass",
    detail: "KES 50,000/day and 10 tx/hour — matching your Premium tier.",
    fixScore: 0,
  },
  {
    id: "h8",
    check: "Emergency contact set",
    status: "Fail",
    detail:
      "No second adult is registered to be called if the account is frozen.",
    actionLabel: "Add emergency contact",
    fixScore: 1,
  },
  {
    id: "h9",
    check: "Recovery phone set",
    status: "Pass",
    detail: "OTP recovery is bound to 0712 345 678.",
    fixScore: 0,
  },
  {
    id: "h10",
    check: "Auto-logout within 15 min",
    status: "Pass",
    detail: "Timer is 5 minutes — the strictest setting.",
    fixScore: 0,
  },
];

export const HEALTH_SCORE_BASE = 4; // points from passing checks at load

/* ---------- FAQ + glossary ---------- */
export const SEC_FAQ = [
  {
    q: "Where is my money actually held?",
    a: "Wallet balances sit in a ring-fenced KCB trust account (A/C 1284 556 001) and settle through Safaricom Daraja. GrowMO never lends or invests wallet float — the security page shows the same reference the bank does.",
  },
  {
    q: "What exactly does “Secure my account” freeze?",
    a: "Everything that moves money out: sends, withdrawals, auto-pay and scheduled batches. Deposits still land, and you (or support) unfreeze it with the wallet PIN. A freeze is instant and reversible.",
  },
  {
    q: "Why did a payment ask for a second PIN?",
    a: "Any payout above 3× your 30-day average (your average is KES 1,850) or above KES 5,000 triggers the extra check. It's the fraud layer doing its job — turn it off in Protection if you run very different payday patterns.",
  },
  {
    q: "Can someone at GrowMO read my farm data?",
    a: "Data is encrypted with AES-256 at rest and TLS 1.3 in transit, and support staff see only what their role needs. Every support access to your records is itself written to the security log you can read here.",
  },
  {
    q: "What happens if my SIM is swapped?",
    a: "Safaricom flags the change through our partnership, M-Pesa payments freeze automatically, and you get an SMS to the new SIM asking you to confirm. You re-confirm in the app with your PIN — no money moves in between.",
  },
  {
    q: "How long are backups kept?",
    a: "Daily snapshots for 30 days, weekly for a year, monthly for the life of the account. Restores can target any snapshot, and selective restores let you bring back crops, finances or photos separately.",
  },
  {
    q: "I want my data deleted. Really deleted?",
    a: "“Delete my account” starts a 30-day grace window (you can cancel any time), then all farm data, photos and records are permanently deleted. The wallet balance must be withdrawn first — support helps with that.",
  },
  {
    q: "Who do I talk to about data protection questions?",
    a: "The Data Protection Officer at contact@dpo.growmo.co.ke — 72-hour breach notification is a legal commitment under the Kenya Data Protection Act 2019, and DPO contact details are on every statement.",
  },
];

export const SEC_GLOSSARY = [
  {
    term: "AES-256",
    def: "The encryption standard for data at rest — 256-bit keys, the same as banks use.",
  },
  {
    term: "TLS 1.3",
    def: "Encryption in transit between your phone and GrowMO's servers.",
  },
  {
    term: "2FA",
    def: "Two-factor authentication — something you know (PIN) plus something you have (phone/code).",
  },
  {
    term: "Authenticator app",
    def: "Google Authenticator or Authy — generates 30-second codes that work offline.",
  },
  {
    term: "SIM swap",
    def: "Moving a phone number to a new SIM card — the top fraud vector for M-Pesa, watched continuously.",
  },
  {
    term: "Trusted device",
    def: "A device you mark as yours — it skips 2FA so your daily logins stay one-tap.",
  },
  {
    term: "Snapshot",
    def: "A point-in-time copy of your farm data — the restore point.",
  },
  {
    term: "KDP Act 2019",
    def: "Kenya's data protection law — the eleven rights on the Privacy tab come from it.",
  },
];

export const SEC_ALERTS = [
  {
    id: "sa1",
    tone: "warn" as const,
    text: "1 unrecognised device in 7 days — Safari · iPhone, Kikuyu. Review it in Sessions.",
  },
  {
    id: "sa2",
    tone: "info" as const,
    text: "3 failed PIN attempts on Oct 24 from your Nairobi laptop. The 5-minute lockout worked as designed.",
  },
  {
    id: "sa3",
    tone: "success" as const,
    text: "Last backup 4 hours ago (248 MB). Next automatic run: today 12:00 noon.",
  },
];

export function riskTone(risk: LogRisk): "low" | "medium" | "high" {
  return risk === "Low" ? "low" : risk === "Medium" ? "medium" : "high";
}
