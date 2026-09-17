/* ============================================================================
   GrowMO AUTH DATA — accounts, sessions, passkeys, workspaces, tasks.
   Demo content shaped like real Kenyan farmer accounts.
   ========================================================================== */
import {
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  ScanFace,
  ShieldCheck,
  ShieldHalf,
  UserPlus,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface AuthNavItem {
  to: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  kind: "split" | "console";
}

export const AUTH_NAV: AuthNavItem[] = [
  { to: "/auth/login", label: "Sign in", desc: "5 ways to access your farm", icon: KeyRound, kind: "split" },
  { to: "/auth/register", label: "Create account", desc: "4-step guided setup", icon: UserPlus, kind: "split" },
  { to: "/auth/recovery", label: "Recover access", desc: "Reset PIN or password", icon: LifeBuoy, kind: "split" },
  { to: "/auth/mfa", label: "Two-step verify", desc: "6 second factors", icon: ShieldHalf, kind: "split" },
  { to: "/auth/identity", label: "Verify identity", desc: "KYC unlocks full limits", icon: ScanFace, kind: "split" },
  { to: "/auth/passkeys", label: "Passkeys", desc: "Passwordless devices", icon: Fingerprint, kind: "console" },
  { to: "/auth/security", label: "Security centre", desc: "Sessions, alerts, apps", icon: ShieldCheck, kind: "console" },
  { to: "/auth/account-status", label: "Account status", desc: "Restoration task board", icon: Wrench, kind: "console" },
  { to: "/auth/hub", label: "Workspace hub", desc: "Pick farm, enter app", icon: LayoutDashboard, kind: "console" },
];

/* ------------------------------ Accounts ------------------------------ */
export interface SavedAccount {
  id: string;
  name: string;
  phone: string;
  initials: string;
  hue: string;
  lastActive: string;
  current?: boolean;
}

export const SAVED_ACCOUNTS: SavedAccount[] = [
  { id: "mary", name: "Mary Wanjiku", phone: "0712 ••• 678", initials: "MW", hue: "linear-gradient(135deg,#166534,#4cc38a)", lastActive: "Active now", current: true },
  { id: "john", name: "John Kamau", phone: "0733 ••• 901", initials: "JK", hue: "linear-gradient(135deg,#b45309,#fbbf24)", lastActive: "2 days ago" },
];

/* ------------------------------ Security centre ------------------------------ */
export interface Session {
  id: string;
  device: string;
  meta: string;
  location: string;
  lastActive: string;
  current?: boolean;
  risk: "low" | "medium";
}

export const SESSIONS: Session[] = [
  { id: "s1", device: "Samsung Galaxy A15", meta: "Android 14 · App v3.2", location: "Githunguri, Kiambu", lastActive: "Now", current: true, risk: "low" },
  { id: "s2", device: "Tecno Spark 20", meta: "Android 13 · App v3.1", location: "Nairobi CBD", lastActive: "2 hours ago", risk: "medium" },
  { id: "s3", device: "Chrome · Windows", meta: "Browser session", location: "Kiambu", lastActive: "Yesterday", risk: "low" },
];

export const LOGIN_HISTORY = [
  { when: "Today 06:42", event: "Sign in — passkey", device: "Galaxy A15", ip: "196.201.••.••", risk: "low" as const },
  { when: "Yesterday 21:15", event: "Wrong PIN (2 attempts)", device: "Tecno Spark 20", ip: "41.215.••.••", risk: "medium" as const },
  { when: "Yesterday 14:02", event: "M-Pesa payout KES 12,400", device: "Galaxy A15", ip: "196.201.••.••", risk: "low" as const },
  { when: "Mon 09:30", event: "New device paired", device: "Tecno Spark 20", ip: "41.215.••.••", risk: "medium" as const },
  { when: "Sun 18:11", event: "Password changed", device: "Galaxy A15", ip: "196.201.••.••", risk: "low" as const },
];

export interface Passkey {
  id: string;
  name: string;
  device: string;
  created: string;
  lastUsed: string;
  hue: string;
}

export const PASSKEYS: Passkey[] = [
  { id: "p1", name: "Galaxy A15 — this phone", device: "Android · fingerprint", created: "12 Aug 2026", lastUsed: "Today 06:42", hue: "linear-gradient(135deg,#166534,#22a355)" },
  { id: "p2", name: "Tecno Spark 20", device: "Android · face unlock", created: "03 Sep 2026", lastUsed: "Yesterday", hue: "linear-gradient(135deg,#1e3a8a,#3b82f6)" },
  { id: "p3", name: "YubiKey 5 — backup", device: "Hardware key · USB/NFC", created: "20 Jul 2026", lastUsed: "2 weeks ago", hue: "linear-gradient(135deg,#581c87,#a855f7)" },
];

export const PASSKEY_COMPARE = [
  { feature: "Phishing resistant", passkey: true, password: false, sms: false },
  { feature: "Works offline", passkey: true, password: true, sms: false },
  { feature: "Nothing to remember", passkey: true, password: false, sms: true },
  { feature: "SIM-swap proof", passkey: true, password: true, sms: false },
  { feature: "Sign-in under 3 seconds", passkey: true, password: false, sms: false },
];

export interface ConnectedApp {
  id: string;
  name: string;
  desc: string;
  access: string[];
  connected: string;
  hue: string;
}

export const CONNECTED_APPS: ConnectedApp[] = [
  { id: "a1", name: "M-Pesa Daraja", desc: "Payments in & out", access: ["Send money", "Receive till payments", "Read balances"], connected: "Jan 2026", hue: "linear-gradient(135deg,#065f46,#10b981)" },
  { id: "a2", name: "Twiga Vendor", desc: "Buyer ordering", access: ["Read harvest listings", "Place orders"], connected: "Mar 2026", hue: "linear-gradient(135deg,#9a3412,#ea580c)" },
  { id: "a3", name: "Agrovet POS — Githunguri", desc: "Input pickup point", access: ["Verify pickup codes"], connected: "Jun 2026", hue: "linear-gradient(135deg,#0c4a6e,#0284c7)" },
];

/* ------------------------------ Restoration board ------------------------------ */
export type TaskState = "todo" | "review" | "done";

export interface RestoreTask {
  id: string;
  title: string;
  desc: string;
  state: TaskState;
  eta: string;
  wizard: string;
}

export const RESTORE_TASKS: RestoreTask[] = [
  { id: "t1", title: "Verify your identity", desc: "National ID + selfie unlocks full M-Pesa limits.", state: "todo", eta: "5 min", wizard: "identity" },
  { id: "t2", title: "Confirm M-Pesa number", desc: "OTP check on 0712 ••• 678 for payouts.", state: "todo", eta: "2 min", wizard: "phone" },
  { id: "t3", title: "Map your plots", desc: "Pin boundaries so plans match your soil.", state: "todo", eta: "10 min", wizard: "farm" },
  { id: "t4", title: "Add payout method", desc: "M-Pesa till or bank for buyer payments.", state: "review", eta: "In review", wizard: "payout" },
  { id: "t5", title: "Join Chama Yetu group", desc: "Accept the cooperative invite from Meru.", state: "review", eta: "Waiting", wizard: "coop" },
  { id: "t6", title: "Loan readiness check", desc: "6-month records review for input financing.", state: "done", eta: "Done", wizard: "loan" },
];

export const TRACKER_STAGES = [
  { label: "Application received", detail: "Input loan · KES 45,000", at: "Mon 09:14", state: "done" as const },
  { label: "Records verified", detail: "6-month P&L + diary checked", at: "Tue 11:02", state: "done" as const },
  { label: "Field officer visit", detail: "Agrovet agent confirms plots", at: "Thu 10:30", state: "current" as const },
  { label: "Credit decision", detail: "SMS + in-app notification", at: "Pending", state: "todo" as const },
  { label: "Disbursement to wallet", detail: "Straight to GrowMO wallet", at: "Pending", state: "todo" as const },
];

/* ------------------------------ Hub ------------------------------ */
export interface Workspace {
  id: string;
  name: string;
  meta: string;
  role: string;
  hue: string;
  initials: string;
  stats: { label: string; value: string }[];
}

export const WORKSPACES: Workspace[] = [
  {
    id: "w1", name: "Mary's Farm", meta: "Kiambu · 3 plots · 2.5 acres", role: "Owner",
    hue: "linear-gradient(135deg,#166534,#22a355)", initials: "MF",
    stats: [{ label: "Active crops", value: "3" }, { label: "Wallet", value: "KES 35K" }, { label: "Tasks today", value: "5" }],
  },
  {
    id: "w2", name: "Family Plots — Nyeri", meta: "Nyeri · 2 plots · 1.2 acres", role: "Manager",
    hue: "linear-gradient(135deg,#b45309,#fbbf24)", initials: "FP",
    stats: [{ label: "Active crops", value: "2" }, { label: "Wallet", value: "KES 12K" }, { label: "Tasks today", value: "2" }],
  },
  {
    id: "w3", name: "Chama Yetu Coop", meta: "Meru · 84 members", role: "Chair",
    hue: "linear-gradient(135deg,#1e3a8a,#3b82f6)", initials: "CY",
    stats: [{ label: "Members", value: "84" }, { label: "Bulk order", value: "Open" }, { label: "Approvals", value: "3" }],
  },
  {
    id: "w4", name: "Buyer View — Twiga", meta: "Shared portfolio access", role: "Viewer",
    hue: "linear-gradient(135deg,#9a3412,#ea580c)", initials: "BV",
    stats: [{ label: "Listings", value: "4" }, { label: "Orders", value: "2" }, { label: "Rating", value: "4.9★" }],
  },
];

export interface HubNote {
  id: string;
  title: string;
  desc: string;
  at: string;
  unread: boolean;
  kind: "alert" | "money" | "task";
}

export const HUB_NOTIFICATIONS: HubNote[] = [
  { id: "n1", title: "Black-rot risk 82% on Plot 1", desc: "AI suggests Mancozeb within 48 hours.", at: "12 min ago", unread: true, kind: "alert" },
  { id: "n2", title: "Buyer paid KES 12,400", desc: "Twiga order #8841 settled to wallet.", at: "1 hr ago", unread: true, kind: "money" },
  { id: "n3", title: "Top-dress CAN due Thursday", desc: "0.5 acre cabbage · 25kg required.", at: "3 hrs ago", unread: false, kind: "task" },
  { id: "n4", title: "Storm warning — Kiambu", desc: "Heavy rain tonight. Hold foliar sprays.", at: "Yesterday", unread: false, kind: "alert" },
];

export const HUB_WIDGETS = [
  { id: "weather", label: "Weather now", desc: "Temp, rain chance, advisory" },
  { id: "wallet", label: "Wallet balance", desc: "M-Pesa + pending payouts" },
  { id: "tasks", label: "Today's tasks", desc: "Top 5 prioritized jobs" },
  { id: "market", label: "Market ticker", desc: "Your crops, live prices" },
  { id: "crops", label: "Crop progress", desc: "Growth stages + day counts" },
  { id: "ai", label: "AI insight", desc: "One daily recommendation" },
];
