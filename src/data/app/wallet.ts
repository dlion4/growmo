/* ============================================================================
   PAGE 14 — PAYMENTS, WALLET & MOBILE MONEY
   Financial transactions hub for Mary Wanjiku's farm, Githunguri, Kiambu.
   All amounts in KES, all phone numbers 07XX/01XX format.
   ========================================================================== */

export type WalletView =
  | "dashboard"
  | "deposit"
  | "send"
  | "autopay"
  | "history"
  | "budgets"
  | "security";

/* ── 14.1 Wallet Dashboard ───────────────────────────────────────────────── */
export interface WalletContext {
  availableBalance: number;
  allocatedToBudgets: number;
  freeBalance: number;
  pendingOutflows: number;
  effectiveAvailable: number;
  monthlyDepositTotal: number;
  monthlySpendTotal: number;
  currency: string;
  lastUpdated: string;
  walletNumber: string;
}

export const WALLET_CONTEXT: WalletContext = {
  availableBalance: 35000,
  allocatedToBudgets: 20000,
  freeBalance: 15000,
  pendingOutflows: 4500,
  effectiveAvailable: 10500,
  monthlyDepositTotal: 60000,
  monthlySpendTotal: 35500,
  currency: "KES",
  lastUpdated: "Today · 10:32 AM",
  walletNumber: "0712 345 678",
};

/* ── 14.2 Deposit Methods ────────────────────────────────────────────────── */
export interface DepositMethod {
  id: string;
  name: string;
  description: string;
  min: number;
  max: number;
  fee: string;
  speed: string;
  icon: string;
}

export const DEPOSIT_METHODS: DepositMethod[] = [
  { id: "dm-1", name: "M-Pesa STK Push", description: "Enter amount → STK push → enter PIN → confirmed", min: 100, max: 150000, fee: "Free", speed: "Instant", icon: "Smartphone" },
  { id: "dm-2", name: "M-Pesa Paybill", description: "Send to Paybill 174379, Acc: 0712345678", min: 100, max: 150000, fee: "Free", speed: "5–10 min", icon: "Smartphone" },
  { id: "dm-3", name: "Bank Transfer", description: "KCB, Equity, Co-op, NCBA — enter details", min: 500, max: 1000000, fee: "KES 50", speed: "1–4 hours", icon: "Landmark" },
  { id: "dm-4", name: "Agent Deposit", description: "Visit GrowMO agent, pay cash", min: 100, max: 50000, fee: "KES 20", speed: "Instant", icon: "Store" },
  { id: "dm-5", name: "Card (Visa/Mastercard)", description: "Enter card details", min: 100, max: 100000, fee: "1.5%", speed: "Instant", icon: "CreditCard" },
];

/* ── 14.3 Send Money / Pay Methods ───────────────────────────────────────── */
export interface SendMethod {
  id: string;
  type: string;
  recipient: string;
  flow: string;
  icon: string;
}

export const SEND_METHODS: SendMethod[] = [
  { id: "sm-1", type: "Pay worker (M-Pesa B2C)", recipient: "Phone number", flow: "Enter number → amount → confirm PIN → M-Pesa sent", icon: "Users" },
  { id: "sm-2", type: "Pay supplier (M-Pesa B2B)", recipient: "Paybill/Till number", flow: "Enter Till → amount → account ref → confirm PIN", icon: "Store" },
  { id: "sm-3", type: "Transfer to bank", recipient: "Bank account", flow: "Select bank → enter details → amount → confirm", icon: "Landmark" },
  { id: "sm-4", type: "Send to GrowMO user", recipient: "Phone number", flow: "Enter number → amount → confirm (instant, free)", icon: "Smartphone" },
  { id: "sm-5", type: "Pay bill (utilities)", recipient: "KPLC, Water, etc.", flow: "Select biller → enter account → amount → pay", icon: "Zap" },
];

/* ── 14.4 Auto-Pay Rules ─────────────────────────────────────────────────── */
export interface AutoPayRule {
  id: string;
  name: string;
  trigger: string;
  recipients: string;
  amount: string;
  status: "Active" | "Paused";
  lastTriggered: string;
  note: string;
}

export const AUTO_PAY_RULES: AutoPayRule[] = [
  { id: "ap-1", name: "Pay on task complete", trigger: 'Task marked "Complete"', recipients: "Assigned workers", amount: "Per task rate", status: "Active", lastTriggered: "25 Oct 2026", note: "Requires attendance and quality confirmation." },
  { id: "ap-2", name: "Weekly labour payout", trigger: "Every Friday 5 PM", recipients: "All unpaid workers", amount: "Sum of week", status: "Paused", lastTriggered: "—", note: "Paused while reviewing cash flow." },
  { id: "ap-3", name: "Input purchase auto-pay", trigger: "Budget category + approved supplier", recipients: "Supplier Till", amount: "Invoice amount", status: "Active", lastTriggered: "18 Oct 2026", note: "Protects allocated crop funds." },
  { id: "ap-4", name: "Subscription renewal", trigger: "Monthly, 1st", recipients: "GrowMO", amount: "KES 299", status: "Active", lastTriggered: "01 Oct 2026", note: "Premium plan auto-renewal." },
];

/* ── 14.5 Transaction History ────────────────────────────────────────────── */
export type TxnType = "In" | "Out";
export type TxnStatus = "Success" | "Pending" | "Failed" | "Reversed";
export type TxnMethod = "M-Pesa B2C" | "M-Pesa B2B" | "M-Pesa C2B" | "Internal" | "Bank Transfer" | "Card" | "Agent";

export interface Transaction {
  id: string;
  date: string;
  time: string;
  type: TxnType;
  description: string;
  amount: number;
  balanceAfter: number;
  method: TxnMethod;
  refNo: string;
  status: TxnStatus;
  linkedCrop: string | null;
  linkedBudget: string | null;
  recipient: string | null;
  phone: string | null;
}

export const TRANSACTIONS: Transaction[] = [
  { id: "tx-001", date: "25 Oct 2026", time: "10:30 AM", type: "Out", description: "Labour: John Mwangi (weeding)", amount: 500, balanceAfter: 35000, method: "M-Pesa B2C", refNo: "QJK3L5X7YZ", status: "Success", linkedCrop: "Cabbage Gloria F1", linkedBudget: "bud-cabbage", recipient: "John Mwangi", phone: "0712 345 678" },
  { id: "tx-002", date: "25 Oct 2026", time: "10:30 AM", type: "Out", description: "Labour: Peter Kamau (weeding)", amount: 500, balanceAfter: 35500, method: "M-Pesa B2C", refNo: "PLM8NR2KQW", status: "Success", linkedCrop: "Cabbage Gloria F1", linkedBudget: "bud-cabbage", recipient: "Peter Kamau", phone: "0733 901 221" },
  { id: "tx-003", date: "25 Oct 2026", time: "10:30 AM", type: "Out", description: "Labour: Grace Wanjiku (weeding)", amount: 500, balanceAfter: 36000, method: "M-Pesa B2C", refNo: "RTY9PV3NXM", status: "Success", linkedCrop: "Cabbage Gloria F1", linkedBudget: "bud-cabbage", recipient: "Grace Wanjiku", phone: "0722 111 333" },
  { id: "tx-004", date: "25 Oct 2026", time: "9:00 AM", type: "In", description: "Deposit from M-Pesa", amount: 10000, balanceAfter: 36500, method: "M-Pesa C2B", refNo: "SHK4RT9AB", status: "Success", linkedCrop: null, linkedBudget: null, recipient: null, phone: null },
  { id: "tx-005", date: "18 Oct 2026", time: "3:00 PM", type: "Out", description: "Input: Githunguri Agro-vet (DAP)", amount: 6500, balanceAfter: 26500, method: "M-Pesa B2B", refNo: "TLL5MN8PQR", status: "Success", linkedCrop: "Cabbage Gloria F1", linkedBudget: "bud-cabbage", recipient: "Githunguri Agro-vet", phone: null },
  { id: "tx-006", date: "18 Oct 2026", time: "2:00 PM", type: "In", description: "Deposit from M-Pesa", amount: 50000, balanceAfter: 33000, method: "M-Pesa C2B", refNo: "NMP7QW3ERT", status: "Success", linkedCrop: null, linkedBudget: null, recipient: null, phone: null },
  { id: "tx-007", date: "01 Oct 2026", time: "12:00 AM", type: "Out", description: "Subscription: GrowMO Premium", amount: 299, balanceAfter: 33299, method: "Internal", refNo: "SUB-2026-10", status: "Success", linkedCrop: null, linkedBudget: null, recipient: "GrowMO", phone: null },
  { id: "tx-008", date: "28 Sep 2026", time: "4:15 PM", type: "In", description: "Buyer deposit — Marikiti broker", amount: 20000, balanceAfter: 33598, method: "M-Pesa C2B", refNo: "BUY4KMT71", status: "Success", linkedCrop: "Cabbage Gloria F1", linkedBudget: null, recipient: null, phone: null },
  { id: "tx-009", date: "25 Sep 2026", time: "11:00 AM", type: "Out", description: "Input: Kiambu Farmers Centre (Mancozeb)", amount: 1500, balanceAfter: 13598, method: "M-Pesa B2B", refNo: "KFC8MNB22", status: "Success", linkedCrop: "Cabbage Gloria F1", linkedBudget: "bud-cabbage", recipient: "Kiambu Farmers Centre", phone: null },
  { id: "tx-010", date: "20 Sep 2026", time: "8:30 AM", type: "Out", description: "Workers: cabbage transplanting × 5", amount: 2500, balanceAfter: 15098, method: "M-Pesa B2C", refNo: "TRN5WK8LM", status: "Success", linkedCrop: "Cabbage Gloria F1", linkedBudget: "bud-cabbage", recipient: "John Mwangi + 4", phone: "0712 345 678" },
  { id: "tx-011", date: "15 Sep 2026", time: "2:45 PM", type: "Out", description: "Manure: Mary's Dairy Farm", amount: 15000, balanceAfter: 17598, method: "Cash", refNo: "CASH-MDF1", status: "Success", linkedCrop: "Cabbage Gloria F1", linkedBudget: "bud-cabbage", recipient: "Mary's Dairy Farm", phone: "0755 210 765" },
  { id: "tx-012", date: "10 Sep 2026", time: "9:20 AM", type: "In", description: "Milk sales — Githunguri Dairy Co-op", amount: 17680, balanceAfter: 32598, method: "M-Pesa C2B", refNo: "GDC9MILK1", status: "Success", linkedCrop: null, linkedBudget: null, recipient: null, phone: null },
];

/* ── 14.6 Budget Allocations ─────────────────────────────────────────────── */
export interface WalletBudgetAllocation {
  id: string;
  budget: string;
  crop: string;
  allocated: number;
  spent: number;
  remaining: number;
  available: boolean;
}

export const WALLET_BUDGET_ALLOCATIONS: WalletBudgetAllocation[] = [
  { id: "wa-1", budget: "Cabbage SR 2026", crop: "Cabbage Gloria F1", allocated: 20000, spent: 15000, remaining: 5000, available: true },
  { id: "wa-2", budget: "Maize LR 2027", crop: "Maize H6213", allocated: 0, spent: 0, remaining: 0, available: false },
  { id: "wa-3", budget: "Tomato Cycle 4", crop: "Tomato Anna F1", allocated: 0, spent: 0, remaining: 0, available: false },
  { id: "wa-4", budget: "General farm", crop: "All crops", allocated: 0, spent: 0, remaining: 0, available: false },
];

/* ── 14.7 Security & Controls ────────────────────────────────────────────── */
export interface SecuritySetting {
  id: string;
  feature: string;
  details: string;
  value: string;
  enabled: boolean;
}

export const SECURITY_SETTINGS: SecuritySetting[] = [
  { id: "ss-1", feature: "Wallet PIN", details: "4-digit, required for all transactions", value: "••••", enabled: true },
  { id: "ss-2", feature: "Biometric login", details: "Fingerprint/face for app login (optional)", value: "Disabled", enabled: false },
  { id: "ss-3", feature: "Daily limit", details: "Maximum daily transaction amount", value: "KES 50,000", enabled: true },
  { id: "ss-4", feature: "Monthly limit", details: "Maximum monthly transaction amount", value: "KES 500,000", enabled: true },
  { id: "ss-5", feature: "Approval threshold", details: "Transactions above this amount require second PIN", value: "KES 5,000", enabled: true },
  { id: "ss-6", feature: "Recipient whitelist", details: "Only pay saved workers/suppliers", value: "Disabled", enabled: false },
  { id: "ss-7", feature: "Freeze wallet", details: "Instant freeze via app or SMS", value: "Active", enabled: false },
  { id: "ss-8", feature: "Fraud alerts", details: "SMS for any transaction, unusual activity detection", value: "Enabled", enabled: true },
  { id: "ss-9", feature: "Session timeout", details: "Auto-logout after inactivity", value: "5 minutes", enabled: true },
];

/* ── Saved Recipients ────────────────────────────────────────────────────── */
export interface SavedRecipient {
  id: string;
  name: string;
  phone: string;
  type: "Worker" | "Supplier" | "Buyer" | "Other";
  lastPaid: string;
  totalPaid: number;
}

export const SAVED_RECIPIENTS: SavedRecipient[] = [
  { id: "sr-1", name: "John Mwangi Kamau", phone: "0712 345 678", type: "Worker", lastPaid: "25 Oct 2026", totalPaid: 12500 },
  { id: "sr-2", name: "Peter Kamau Njoroge", phone: "0733 901 221", type: "Worker", lastPaid: "25 Oct 2026", totalPaid: 8000 },
  { id: "sr-3", name: "Grace Wanjiku Muthoni", phone: "0722 111 333", type: "Worker", lastPaid: "25 Oct 2026", totalPaid: 9500 },
  { id: "sr-4", name: "Githunguri Agro-vet", phone: "0712 880 114", type: "Supplier", lastPaid: "18 Oct 2026", totalPaid: 42000 },
  { id: "sr-5", name: "Kiambu Farmers Centre", phone: "0722 441 600", type: "Supplier", lastPaid: "25 Sep 2026", totalPaid: 18500 },
  { id: "sr-6", name: "Marikiti broker", phone: "0708 440 221", type: "Buyer", lastPaid: "28 Sep 2026", totalPaid: 20000 },
  { id: "sr-7", name: "Mary's Dairy Farm", phone: "0755 210 765", type: "Supplier", lastPaid: "15 Sep 2026", totalPaid: 15000 },
  { id: "sr-8", name: "Yara Distributor", phone: "0733 809 114", type: "Supplier", lastPaid: "12 Nov 2026", totalPaid: 8400 },
];

/* ── Monthly spend breakdown ─────────────────────────────────────────────── */
export interface SpendCategory {
  id: string;
  category: string;
  amount: number;
  percent: number;
  color: string;
}

export const SPEND_CATEGORIES: SpendCategory[] = [
  { id: "sc-1", category: "Labour", amount: 12500, percent: 35, color: "var(--gm-leaf-500)" },
  { id: "sc-2", category: "Inputs", amount: 13000, percent: 37, color: "var(--gm-gold-500)" },
  { id: "sc-3", category: "Transport", amount: 4000, percent: 11, color: "var(--gm-sprout-400)" },
  { id: "sc-4", category: "Subscriptions", amount: 299, percent: 1, color: "var(--gm-clay-500)" },
  { id: "sc-5", category: "Other", amount: 5701, percent: 16, color: "var(--gm-ink-400)" },
];

/* ── Billers ─────────────────────────────────────────────────────────────── */
export interface Biller {
  id: string;
  name: string;
  category: string;
  paybill: string;
}

export const BILLERS: Biller[] = [
  { id: "bl-1", name: "Kenya Power (KPLC)", category: "Electricity", paybill: "247247" },
  { id: "bl-2", name: "Kiambu Water", category: "Water", paybill: "868800" },
  { id: "bl-3", name: "Safaricom Airtime", category: "Airtime", paybill: "100100" },
  { id: "bl-4", name: "DStv", category: "Entertainment", paybill: "200200" },
  { id: "bl-5", name: "NHIF", category: "Insurance", paybill: "200222" },
  { id: "bl-6", name: "KRA iTax", category: "Tax", paybill: "572572" },
];