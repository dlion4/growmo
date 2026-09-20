/* ============================================================================
   PAGE 15 — SETTINGS, TEAM & PERMISSIONS
   Account management, team collaboration, and data control.
   ========================================================================== */

export type SettingsView =
  | "profile"
  | "farm"
  | "team"
  | "notifications"
  | "privacy"
  | "subscription";

/* ── 15.1 Profile Settings ───────────────────────────────────────────────── */
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  nationalId: string;
  county: string;
  subCounty: string;
  ward: string;
  village: string;
  gender: string;
  dateOfBirth: string;
  language: string;
  avatar: string;
}

export const USER_PROFILE: UserProfile = {
  id: "usr-001",
  firstName: "Mary",
  lastName: "Wanjiku",
  phone: "0712 345 678",
  email: "mary@wanjiku.ke",
  nationalId: "12345678",
  county: "Kiambu",
  subCounty: "Githunguri",
  ward: "Ikinu",
  village: "Kiamworia",
  gender: "Female",
  dateOfBirth: "15 Mar 1985",
  language: "English / Kiswahili",
  avatar: "MW",
};

/* ── 15.2 Farm Settings ──────────────────────────────────────────────────── */
export interface FarmPlot {
  id: string;
  name: string;
  size: string;
  soilType: string;
  waterSource: string;
  gps: string;
  lastSoilTest: string;
  crops: string[];
  status: "Active" | "Fallow" | "Planned";
}

export interface FarmSettings {
  farmName: string;
  farmType: string;
  totalAcreage: string;
  registrationNumber: string;
  plots: FarmPlot[];
}

export const FARM_SETTINGS: FarmSettings = {
  farmName: "Wanjiku Mixed Farm",
  farmType: "Mixed (crops + dairy)",
  totalAcreage: "2.5 acres",
  registrationNumber: "AGR-KIA-2024-08712",
  plots: [
    { id: "plot-1", name: "Plot 1", size: "0.5 acre", soilType: "Clay loam", waterSource: "Rain + drip irrigation", gps: "-1.0534, 36.8712", lastSoilTest: "Sep 2026", crops: ["Cabbage Gloria F1"], status: "Active" },
    { id: "plot-2", name: "Plot 2", size: "2 acres", soilType: "Red volcanic", waterSource: "Rain-fed", gps: "-1.0541, 36.8725", lastSoilTest: "Mar 2025", crops: ["Maize H6213"], status: "Active" },
    { id: "plot-3", name: "Plot 3", size: "1 acre", soilType: "Sandy loam", waterSource: "River pump", gps: "-1.0528, 36.8718", lastSoilTest: "Sep 2025", crops: ["Dry Beans Rosecoco"], status: "Planned" },
    { id: "gh-1", name: "Greenhouse 1", size: "0.08 acre", soilType: "Enriched media", waterSource: "Drip + fertigation", gps: "-1.0530, 36.8715", lastSoilTest: "Jun 2026", crops: ["Tomato Anna F1"], status: "Active" },
  ],
};

/* ── 15.3 Team Management ────────────────────────────────────────────────── */
export type TeamRole = "Owner" | "Farm Manager" | "Agronomist" | "Accountant" | "Worker" | "Viewer";
export type TeamStatus = "Active" | "Invited" | "Inactive";

export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: TeamRole;
  plotsAccessible: string;
  cropsAccessible: string;
  financialAccess: "Full" | "View only" | "None";
  paymentAuthority: "Can initiate" | "Can approve" | "None";
  validFrom: string;
  validUntil: string;
  status: TeamStatus;
  lastActive: string;
  avatar: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "tm-1", name: "Mary Wanjiku", phone: "0712 345 678", email: "mary@wanjiku.ke", role: "Owner", plotsAccessible: "All", cropsAccessible: "All", financialAccess: "Full", paymentAuthority: "Can approve", validFrom: "01 Jan 2024", validUntil: "Indefinite", status: "Active", lastActive: "Today", avatar: "MW" },
  { id: "tm-2", name: "Peter Kamau Njoroge", phone: "0733 901 221", email: "peter.kamau@gmail.com", role: "Farm Manager", plotsAccessible: "All", cropsAccessible: "All", financialAccess: "View only", paymentAuthority: "Can initiate", validFrom: "01 Oct 2026", validUntil: "Indefinite", status: "Active", lastActive: "Today", avatar: "PK" },
  { id: "tm-3", name: "Grace Wanjiku Muthoni", phone: "0722 111 333", email: null, role: "Worker", plotsAccessible: "Plot 1, Greenhouse 1", cropsAccessible: "Cabbage, Tomato", financialAccess: "None", paymentAuthority: "None", validFrom: "15 Sep 2026", validUntil: "Indefinite", status: "Active", lastActive: "Yesterday", avatar: "GW" },
  { id: "tm-4", name: "John Mwangi Kamau", phone: "0712 345 678", email: null, role: "Worker", plotsAccessible: "Plot 1, Plot 2", cropsAccessible: "Cabbage, Maize", financialAccess: "None", paymentAuthority: "None", validFrom: "01 Aug 2026", validUntil: "Indefinite", status: "Active", lastActive: "Today", avatar: "JM" },
  { id: "tm-5", name: "Lucy Njeri Mwangi", phone: "0700 222 444", email: "lucy.njeri@yahoo.com", role: "Accountant", plotsAccessible: "All", cropsAccessible: "All", financialAccess: "Full", paymentAuthority: "Can initiate", validFrom: "01 Nov 2026", validUntil: "Indefinite", status: "Invited", lastActive: "Never", avatar: "LN" },
  { id: "tm-6", name: "Dr. James Kariuki", phone: "0720 555 777", email: "j.kariuki@kalro.org", role: "Agronomist", plotsAccessible: "All", cropsAccessible: "All", financialAccess: "None", paymentAuthority: "None", validFrom: "01 Sep 2026", validUntil: "31 Mar 2027", status: "Active", lastActive: "3 days ago", avatar: "JK" },
  { id: "tm-7", name: "Samuel Mburu Kinyanjui", phone: "0733 666 888", email: null, role: "Worker", plotsAccessible: "Plot 2", cropsAccessible: "Maize", financialAccess: "None", paymentAuthority: "None", validFrom: "01 Oct 2026", validUntil: "31 Dec 2026", status: "Active", lastActive: "2 days ago", avatar: "SM" },
  { id: "tm-8", name: "Esther Wairimu Njenga", phone: "0711 999 000", email: "esther.w@outlook.com", role: "Viewer", plotsAccessible: "All", cropsAccessible: "All", financialAccess: "View only", paymentAuthority: "None", validFrom: "01 Oct 2026", validUntil: "Indefinite", status: "Active", lastActive: "1 week ago", avatar: "EW" },
];

/* ── Role permission matrix ──────────────────────────────────────────────── */
export const PERMISSION_FEATURES = [
  "Dashboard",
  "Crop management",
  "Input management",
  "Labour scheduling",
  "Labour payment",
  "Financial management",
  "Wallet",
  "Pay workers",
  "Market & sales",
  "Analytics",
  "Records & compliance",
  "Settings",
  "Add/remove team",
] as const;

export type PermissionLevel = "Full" | "View + record" | "View + recommend" | "View only" | "Initiate" | "Tasks only" | "Own tasks" | "—";

export const PERMISSION_MATRIX: Record<string, Record<(typeof PERMISSION_FEATURES)[number], PermissionLevel>> = {
  Owner: { Dashboard: "Full", "Crop management": "Full", "Input management": "Full", "Labour scheduling": "Full", "Labour payment": "Full", "Financial management": "Full", Wallet: "Full", "Pay workers": "Full", "Market & sales": "Full", Analytics: "Full", "Records & compliance": "Full", Settings: "Full", "Add/remove team": "Full" },
  "Farm Manager": { Dashboard: "Full", "Crop management": "Full", "Input management": "Full", "Labour scheduling": "Full", "Labour payment": "Initiate", "Financial management": "View + record", Wallet: "View only", "Pay workers": "Initiate", "Market & sales": "Full", Analytics: "Full", "Records & compliance": "Full", Settings: "—", "Add/remove team": "—" },
  Agronomist: { Dashboard: "Full", "Crop management": "Full", "Input management": "View + recommend", "Labour scheduling": "View only", "Labour payment": "—", "Financial management": "—", Wallet: "—", "Pay workers": "—", "Market & sales": "—", Analytics: "View only", "Records & compliance": "Full", Settings: "—", "Add/remove team": "—" },
  Accountant: { Dashboard: "View only", "Crop management": "View only", "Input management": "View only", "Labour scheduling": "View only", "Labour payment": "Full", "Financial management": "Full", Wallet: "View only", "Pay workers": "Initiate", "Market & sales": "Full", Analytics: "Full", "Records & compliance": "Full", Settings: "—", "Add/remove team": "—" },
  Worker: { Dashboard: "Tasks only", "Crop management": "—", "Input management": "—", "Labour scheduling": "Own tasks", "Labour payment": "—", "Financial management": "—", Wallet: "—", "Pay workers": "—", "Market & sales": "—", Analytics: "—", "Records & compliance": "—", Settings: "—", "Add/remove team": "—" },
  Viewer: { Dashboard: "View only", "Crop management": "View only", "Input management": "View only", "Labour scheduling": "View only", "Labour payment": "—", "Financial management": "—", Wallet: "—", "Pay workers": "—", "Market & sales": "View only", Analytics: "View only", "Records & compliance": "View only", Settings: "—", "Add/remove team": "—" },
};

/* ── 15.4 Notification Preferences ───────────────────────────────────────── */
export interface NotificationPref {
  id: string;
  channel: "Push" | "SMS" | "WhatsApp" | "Email";
  type: string;
  enabled: boolean;
  note: string;
}

export const NOTIFICATION_PREFS: NotificationPref[] = [
  { id: "np-1", channel: "Push", type: "Task reminders", enabled: true, note: "Daily task notifications" },
  { id: "np-2", channel: "Push", type: "Weather alerts", enabled: true, note: "Extreme weather warnings" },
  { id: "np-3", channel: "Push", type: "Payment confirmations", enabled: true, note: "M-Pesa send/receive" },
  { id: "np-4", channel: "Push", type: "Market price changes", enabled: false, note: "When prices shift 10%+" },
  { id: "np-5", channel: "Push", type: "AI tips", enabled: true, note: "Contextual farming advice" },
  { id: "np-6", channel: "SMS", type: "Weather warnings (extreme only)", enabled: true, note: "Storm, frost, drought" },
  { id: "np-7", channel: "SMS", type: "Payment sent/received", enabled: true, note: "Every transaction" },
  { id: "np-8", channel: "SMS", type: "Task reminders (no internet)", enabled: true, note: "If offline for 2+ hrs" },
  { id: "np-9", channel: "WhatsApp", type: "Weekly summary", enabled: false, note: "Monday morning digest" },
  { id: "np-10", channel: "WhatsApp", type: "Market price update", enabled: true, note: "Daily crop prices" },
  { id: "np-11", channel: "Email", type: "Monthly report", enabled: true, note: "Full farm performance" },
  { id: "np-12", channel: "Email", type: "Loan/grant opportunities", enabled: true, note: "Matching finance offers" },
];

/* ── 15.5 Data & Privacy ─────────────────────────────────────────────────── */
export interface PrivacySetting {
  id: string;
  setting: string;
  description: string;
  value: string;
  enabled: boolean;
}

export const PRIVACY_SETTINGS: PrivacySetting[] = [
  { id: "ps-1", setting: "Share data with county extension", description: "Allow county agricultural officers to view your farm data", value: "Yes", enabled: true },
  { id: "ps-2", setting: "Share anonymized data for benchmarks", description: "Your data (without identity) helps improve county averages", value: "Yes", enabled: true },
  { id: "ps-3", setting: "Share data with buyers", description: "Allow verified buyers to see your crop portfolio and traceability", value: "Yes — selected buyers", enabled: true },
  { id: "ps-4", setting: "Data retention", description: "How long to keep your historical farm data", value: "Keep all", enabled: true },
  { id: "ps-5", setting: "Export all data", description: "Download a ZIP file with all your farm data, photos and records", value: "Available", enabled: true },
  { id: "ps-6", setting: "Delete account", description: "Full deletion after 30-day grace period. This cannot be undone.", value: "Available", enabled: false },
];

/* ── 15.6 Subscription Plans ──────────────────────────────────────────────── */
export interface PlanFeature {
  feature: string;
  free: string;
  premium: string;
  enterprise: string;
}

export const PLAN_FEATURES: PlanFeature[] = [
  { feature: "Crops managed", free: "2", premium: "Unlimited", enterprise: "Unlimited" },
  { feature: "Plots", free: "2", premium: "10", enterprise: "Unlimited" },
  { feature: "AI advisor (chats/month)", free: "5", premium: "50", enterprise: "Unlimited" },
  { feature: "Weather forecasts", free: "3-day", premium: "7-day + seasonal", enterprise: "7-day + seasonal + custom" },
  { feature: "Market prices", free: "1 market", premium: "5 markets", enterprise: "All markets" },
  { feature: "Analytics", free: "Basic", premium: "Advanced", enterprise: "Advanced + custom" },
  { feature: "Reports", free: "2/month", premium: "Unlimited", enterprise: "Unlimited + branded" },
  { feature: "Team members", free: "1 (self)", premium: "3", enterprise: "10" },
  { feature: "Agronomist chat", free: "—", premium: "2/month", enterprise: "10/month" },
  { feature: "Auto-pay", free: "—", premium: "✅", enterprise: "✅" },
  { feature: "API access", free: "—", premium: "—", enterprise: "✅" },
  { feature: "Priority support", free: "—", premium: "✅", enterprise: "✅" },
  { feature: "White-label", free: "—", premium: "—", enterprise: "✅" },
];

export const CURRENT_PLAN = "Premium";
export const PLAN_PRICE = { free: 0, premium: 299, enterprise: 999 };

/* ── Activity log (for settings audit) ───────────────────────────────────── */
export interface ActivityLog {
  id: string;
  date: string;
  user: string;
  action: string;
  details: string;
  ip: string;
}

export const ACTIVITY_LOGS: ActivityLog[] = [
  { id: "al-1", date: "Today · 10:30 AM", user: "Mary Wanjiku", action: "Login", details: "Successful login from Android app", ip: "102.214.xx.xx" },
  { id: "al-2", date: "Today · 9:00 AM", user: "Peter Kamau", action: "Task completed", details: "Marked weeding task as complete (Plot 1)", ip: "102.214.xx.xx" },
  { id: "al-3", date: "Yesterday · 3:15 PM", user: "Mary Wanjiku", action: "Payment sent", details: "KES 6,500 to Githunguri Agro-vet (DAP)", ip: "102.214.xx.xx" },
  { id: "al-4", date: "Yesterday · 11:00 AM", user: "Dr. James Kariuki", action: "Report viewed", details: "Viewed spray records for Cabbage (Plot 1)", ip: "197.232.xx.xx" },
  { id: "al-5", date: "25 Oct · 10:30 AM", user: "Mary Wanjiku", action: "Bulk payment", details: "Paid 3 workers KES 1,500 total (weeding)", ip: "102.214.xx.xx" },
  { id: "al-6", date: "20 Oct · 8:00 AM", user: "Peter Kamau", action: "Inventory update", details: "Recorded DAP 50kg received (1 bag)", ip: "102.214.xx.xx" },
  { id: "al-7", date: "18 Oct · 2:00 PM", user: "Mary Wanjiku", action: "Deposit", details: "M-Pesa deposit KES 50,000 to wallet", ip: "102.214.xx.xx" },
  { id: "al-8", date: "15 Oct · 9:20 AM", user: "Mary Wanjiku", action: "Team change", details: "Added Samuel Mburu as Worker (Plot 2)", ip: "102.214.xx.xx" },
  { id: "al-9", date: "10 Oct · 4:30 PM", user: "Grace Wanjiku", action: "Photo uploaded", details: "Uploaded crop photo (cabbage growth stage)", ip: "102.214.xx.xx" },
  { id: "al-10", date: "01 Oct · 12:00 AM", user: "System", action: "Subscription", details: "Premium plan renewed — KES 299", ip: "—" },
];