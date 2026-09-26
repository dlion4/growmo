/* ============================================================================
   PAGE 14 — PAYMENTS, WALLET & MOBILE MONEY  (/app/wallet)  data layer

   Blueprint sections
   14.1 Wallet dashboard   14.2 Deposit money         14.3 Send money / pay
   14.3c Bulk payouts      14.4 Auto-pay              14.5 Transaction history
   14.6 Budget allocation  14.7 Security & controls

   All money is Kenyan shillings. Receipts follow GrowMO conventions:
   QK… quick share · PL… payment · DEP… deposit · WDR… withdrawal ·
   BATCH… bulk batch · INV… cash invoice.
   ========================================================================== */

export const WALLET_CONTEXT = {
  farm: "Mary's Farm",
  farmer: "Mary Wanjiku",
  phone: "0712 345 678",
  mpesaName: "MARY WANJIKU K",
  paybill: "247247",
  accountNumber: "0712345678",
  accountNo: "GM-1024-7781",
  availableBalance: 35000,
  inBudgets: 20000,
  freeBalance: 15000,
  pendingOutflows: 4500,
  effectiveAvailable: 10500,
  monthlyDeposits: 60000,
  monthlySpend: 35500,
  dailyLimit: 50000,
  monthlyLimit: 500000,
  todaySpent: 3500,
  monthSpent: 38500,
  tier: "Premium",
  settlement: "Safaricom Daraja · production key",
  trustAccount: "KCB Bank Kenya · Trust A/C 1284 556 001",
};

/* ---------- 14.2 Deposit money ---------- */
export interface DepositMethod {
  id: string;
  name: string;
  swahili: string;
  icon: string;
  min: number;
  max: number;
  fee: string;
  feeRate: number; // 0.015 = 1.5%
  flatFee: number;
  speed: string;
  steps: string[];
  needsOtp: boolean;
}

export const DEPOSIT_METHODS: DepositMethod[] = [
  {
    id: "stk",
    name: "M-Pesa STK Push",
    swahili: "Omba pesa kwa simu",
    icon: "📱",
    min: 100,
    max: 150000,
    fee: "Free",
    feeRate: 0,
    flatFee: 0,
    speed: "Instant",
    needsOtp: true,
    steps: [
      "Enter amount",
      "STK push lands on 0712 345 678",
      "Enter your M-Pesa PIN on the handset",
      "Wallet credited in under 20 seconds",
    ],
  },
  {
    id: "paybill",
    name: "M-Pesa Paybill",
    swahili: "Lipa kwa Paybill",
    icon: "🏧",
    min: 100,
    max: 150000,
    fee: "Free",
    feeRate: 0,
    flatFee: 0,
    speed: "5–10 min",
    needsOtp: true,
    steps: [
      "M-Pesa → Lipa na M-Pesa → Paybill",
      `Business number ${247247}`,
      "Account: 0712345678 (your phone)",
      "Amount, then your M-Pesa PIN",
    ],
  },
  {
    id: "bank",
    name: "Bank transfer",
    swahili: "Benki (KCB, Equity, Co-op, NCBA)",
    icon: "🏦",
    min: 500,
    max: 1000000,
    fee: "KES 50",
    feeRate: 0,
    flatFee: 50,
    speed: "1–4 hours",
    needsOtp: true,
    steps: [
      "Pick your bank and pay to A/C 1284 556 001",
      "Use account ref GM-1024-7781",
      "Confirm on your banking app",
    ],
  },
  {
    id: "agent",
    name: "GrowMO agent deposit",
    swahili: "Wakala wa GrowMO",
    icon: "🧑🏾‍🌾",
    min: 100,
    max: 50000,
    fee: "KES 20",
    feeRate: 0,
    flatFee: 20,
    speed: "Instant",
    needsOtp: true,
    steps: [
      "Visit Githunguri Agrovet or the M-Pesa agent at Kamau shop",
      "Hand the agent cash and your phone number",
      "Agent credits the wallet — you get an SMS receipt",
    ],
  },
  {
    id: "card",
    name: "Card (Visa / Mastercard)",
    swahili: "Kadi ya benki",
    icon: "💳",
    min: 100,
    max: 100000,
    fee: "1.5%",
    feeRate: 0.015,
    flatFee: 0,
    speed: "Instant",
    needsOtp: true,
    steps: ["Enter card details", "3-D Secure OTP from the bank", "Wallet credited"],
  },
];

/* ---------- 14.3 Send money / pay ---------- */
export interface PayType {
  id: string;
  label: string;
  swahili: string;
  icon: string;
  recipientLabel: string;
  hint: string;
}

export const PAY_TYPES: PayType[] = [
  { id: "b2c", label: "Pay worker (M-Pesa B2C)", swahili: "Mfanyikazi", icon: "👷", recipientLabel: "Worker phone number", hint: "Payday, piece rate or advance — logged against the worker and the task." },
  { id: "b2b", label: "Pay supplier (Till / Paybill)", swahili: "Muuzaji wa pembejeo", icon: "🏪", recipientLabel: "Till or Paybill number", hint: "Agrovet, seed shop, transporter. Writes itself into input records." },
  { id: "bank", label: "Transfer to bank", swahili: "Benki", icon: "🏦", recipientLabel: "Bank account number", hint: "KCB, Equity, Co-op, NCBA. Settles by 9am next working day." },
  { id: "p2p", label: "Send to another GrowMO user", swahili: "Mtumiaji mwingine", icon: "🔁", recipientLabel: "GrowMO phone number", hint: "Instant and free between GrowMO wallets." },
  { id: "bill", label: "Pay a utility bill", swahili: "KPLC, maji, fibre", icon: "💡", recipientLabel: "Account number", hint: "KPLC token, Kiambu Water, Safaricom postpaid." },
];

export interface Recipient {
  id: string;
  name: string;
  phone: string;
  role: string;
  avatar: string;
  recent: number;
  bank?: string;
}

export const QUICK_RECIPIENTS: Recipient[] = [
  { id: "r1", name: "John Mwangi", phone: "0712 555 123", role: "Foreman", avatar: "JM", recent: 2500 },
  { id: "r2", name: "Grace Wanjiku", phone: "0733 666 777", role: "Harvester", avatar: "GW", recent: 1800 },
  { id: "r3", name: "Githunguri Agrovet", phone: "Till 452198", role: "Supplier", avatar: "GA", recent: 6500 },
  { id: "r4", name: "Peter Kamau", phone: "0723 456 789", role: "Farm manager", avatar: "PK", recent: 500 },
  { id: "r5", name: "KPLC Prepaid", phone: "Acc 22884455", role: "Utility", avatar: "KP", recent: 2000 },
  { id: "r6", name: "Kiambu Farmers Co-op", phone: "Paybill 889922", role: "Co-op", avatar: "KC", recent: 4350 },
];

export const BANK_OPTIONS = ["KCB Bank", "Equity Bank", "Co-operative Bank", "NCBA Bank", "Absa Kenya"];

export const BILLERS = [
  { id: "kplc", name: "KPLC Prepaid", account: "22884455", icon: "⚡" },
  { id: "water", name: "Kiambu Water & Sewerage", account: "KW-88213", icon: "🚰" },
  { id: "saf", name: "Safaricom Postpaid", account: "0712345678", icon: "📶" },
];

/* ---------- 14.3c Bulk payouts (multi-recipient wizard) ---------- */
export type PayoutChannelId = "mpesa" | "bank" | "growmo" | "cash";

export interface PayoutChannelOption {
  id: PayoutChannelId;
  label: string;
  swahili: string;
  icon: string;
  idLabel: string;
  idPlaceholder: string;
  hint: string;
  feeNote: string;
}

export const PAYOUT_CHANNELS: PayoutChannelOption[] = [
  {
    id: "mpesa",
    label: "M-Pesa phone",
    swahili: "Namba ya M-Pesa",
    icon: "📱",
    idLabel: "M-Pesa phone number",
    idPlaceholder: "07XX XXX XXX",
    hint: "Business-to-person send to any Safaricom line — workers, helpers, suppliers.",
    feeNote: "Standard B2C tariff",
  },
  {
    id: "bank",
    label: "Bank account",
    swahili: "Akaunti ya benki",
    icon: "🏦",
    idLabel: "Bank + account number",
    idPlaceholder: "KCB · 1122 3344 55",
    hint: "KCB, Equity, Co-op, NCBA — settles by 9am the next working day.",
    feeNote: "KES 50 per transfer",
  },
  {
    id: "growmo",
    label: "GrowMO wallet",
    swahili: "Purse ya GrowMO",
    icon: "🔁",
    idLabel: "GrowMO phone or wallet ID",
    idPlaceholder: "07XX XXX XXX · GM-1024-7781",
    hint: "Instant and free between GrowMO wallets — co-op members, share buyers.",
    feeNote: "Free",
  },
  {
    id: "cash",
    label: "Cash — record only",
    swahili: "Rekodi ya fedha",
    icon: "💵",
    idLabel: "ID number / phone (optional)",
    idPlaceholder: "e.g. N-1234567 (2001)",
    hint: "Money already left your pocket — GrowMO writes the invoice & payslip.",
    feeNote: "No fee · no wallet movement",
  },
];

export interface PayoutLine {
  id: string;
  name: string;
  channel: PayoutChannelId;
  identifier: string;
  amount: number;
  memo: string;
  savedId?: string;
}

export const PAYOUT_PURPOSES = [
  { id: "Labour payout", icon: "👷", sub: "Wages, piece rates & day labour" },
  { id: "Supplier invoices", icon: "🏪", sub: "Agrovet, seed, transport & fuel invoices" },
  { id: "Advances", icon: "⏳", sub: "School fees, medical, emergency top-ups" },
  { id: "Co-op shares", icon: "🌾", sub: "Dues, share buy-backs & levies" },
  { id: "Custom batch", icon: "✏️", sub: "Any other group of payees" },
];

export const SCHEDULE_PRESETS = [
  { id: "fri", label: "Next Friday · 5:00 PM", detail: "Standard payday run" },
  { id: "mon", label: "Monday · 9:00 AM", detail: "First bank clearing of the week" },
  { id: "month", label: "1st of month · 6:00 AM", detail: "Before dues & subscriptions run" },
];

export const CASH_RECEIPT_MODES = ["SMS to each payee", "WhatsApp receipt", "Print for the paper file"];

/* ---------- 14.4 Auto-pay management ---------- */
export interface AutoPayRule {
  id: string;
  label: string;
  trigger: string;
  recipients: string;
  amount: string;
  amountCap: number;
  status: "Active" | "Paused";
  lastTriggered: string;
  nextRun: string;
  note: string;
}

export const AUTOPAY_RULES: AutoPayRule[] = [
  { id: "ap1", label: "Pay on task complete", trigger: "Task marked Complete", recipients: "Assigned workers", amount: "Per task rate", amountCap: 12000, status: "Active", lastTriggered: "Oct 25", nextRun: "On task close", note: "Uses the piece rate on the task card; agent verifies before release." },
  { id: "ap2", label: "Weekly labour payout", trigger: "Every Friday 5 PM", recipients: "All unpaid workers", amount: "Sum of week", amountCap: 45000, status: "Paused", lastTriggered: "—", nextRun: "When resumed", note: "Paused on 18 Oct while NSSF deduction schedule is corrected." },
  { id: "ap3", label: "Input purchase auto-pay", trigger: "Budget category + approved supplier", recipients: "Supplier Till", amount: "Invoice amount", amountCap: 25000, status: "Active", lastTriggered: "Oct 18", nextRun: "On approval", note: "Only suppliers on the Kiambu approved list qualify." },
  { id: "ap4", label: "GrowMO subscription", trigger: "Monthly, 1st", recipients: "GrowMO", amount: "KES 299", amountCap: 299, status: "Active", lastTriggered: "Oct 1", nextRun: "Nov 1", note: "Premium plan renewal — cancel any time before the 28th." },
];

/* ---------- 14.5 Transaction history ---------- */
export interface Txn {
  id: string;
  date: string;
  iso: string;
  type: "In" | "Out";
  description: string;
  amount: number;
  balanceAfter: number;
  method: string;
  refNo: string;
  status: "Success" | "Pending" | "Failed";
  category: string;
  crop?: string;
  budget?: string;
}

export const TRANSACTIONS: Txn[] = [
  { id: "t1", date: "Oct 25, 10:30", iso: "2026-10-25T10:30", type: "Out", description: "Labour: John Mwangi (weeding)", amount: -500, balanceAfter: 35000, method: "M-Pesa B2C", refNo: "QJK3L5X7YZ", status: "Success", category: "Labour", crop: "Cabbage", budget: "Cabbage SR 2026" },
  { id: "t2", date: "Oct 25, 10:30", iso: "2026-10-25T10:30", type: "Out", description: "Labour: Peter Kamau (weeding)", amount: -500, balanceAfter: 35500, method: "M-Pesa B2C", refNo: "PLM8NR2KQW", status: "Success", category: "Labour", crop: "Cabbage", budget: "Cabbage SR 2026" },
  { id: "t3", date: "Oct 25, 10:30", iso: "2026-10-25T10:30", type: "Out", description: "Labour: Grace Wanjiku (weeding)", amount: -500, balanceAfter: 36000, method: "M-Pesa B2C", refNo: "RTY9PV3NXM", status: "Success", category: "Labour", crop: "Cabbage", budget: "Cabbage SR 2026" },
  { id: "t4", date: "Oct 25, 09:00", iso: "2026-10-25T09:00", type: "In", description: "Deposit from M-Pesa", amount: 10000, balanceAfter: 36500, method: "M-Pesa C2B", refNo: "SHK4RT9AB", status: "Success", category: "Deposit" },
  { id: "t5", date: "Oct 24, 18:10", iso: "2026-10-24T18:10", type: "Out", description: "Transport: Kamau Brokers (Marikiti run)", amount: -1500, balanceAfter: 26500, method: "M-Pesa B2C", refNo: "XBR2KV9QLM", status: "Success", category: "Transport", crop: "Cabbage", budget: "Cabbage SR 2026" },
  { id: "t6", date: "Oct 23, 14:22", iso: "2026-10-23T14:22", type: "Out", description: "KPLC prepaid token", amount: -2000, balanceAfter: 28000, method: "Bill pay", refNo: "KPLC-PT-4491", status: "Success", category: "Utilities" },
  { id: "t7", date: "Oct 22, 07:30", iso: "2026-10-22T07:30", type: "Out", description: "Kiambu Farmers Co-op dues", amount: -500, balanceAfter: 30000, method: "M-Pesa B2B", refNo: "COP-882A", status: "Success", category: "Co-op" },
  { id: "t8", date: "Oct 20, 16:05", iso: "2026-10-20T16:05", type: "Out", description: "Advance: John Mwangi (school fees)", amount: -1000, balanceAfter: 30500, method: "M-Pesa B2C", refNo: "ADV-001", status: "Success", category: "Advance" },
  { id: "t9", date: "Oct 18, 15:00", iso: "2026-10-18T15:00", type: "Out", description: "Githunguri Agrovet (DAP 50kg ×2)", amount: -6500, balanceAfter: 31500, method: "M-Pesa B2B", refNo: "TLL5MN8PQR", status: "Success", category: "Inputs", crop: "Maize", budget: "Maize LR 2027" },
  { id: "t10", date: "Oct 18, 14:00", iso: "2026-10-18T14:00", type: "In", description: "Deposit from M-Pesa", amount: 50000, balanceAfter: 38000, method: "M-Pesa C2B", refNo: "NMP7QW3ERT", status: "Success", category: "Deposit" },
  { id: "t11", date: "Oct 15, 10:00", iso: "2026-10-15T10:00", type: "Out", description: "Advance: Grace Wanjiku (medical)", amount: -2000, balanceAfter: 38299, method: "M-Pesa B2C", refNo: "ADV-002", status: "Success", category: "Advance" },
  { id: "t12", date: "Oct 10, 19:20", iso: "2026-10-10T19:20", type: "Out", description: "Repair: irrigation pump seal", amount: -3500, balanceAfter: 40299, method: "M-Pesa B2C", refNo: "REP-IR-02", status: "Success", category: "Equipment" },
  { id: "t13", date: "Oct 5, 12:00", iso: "2026-10-05T12:00", type: "In", description: "Sale: Karen Greens Restaurant", amount: 2700, balanceAfter: 43799, method: "M-Pesa C2B", refNo: "QGR4MK9VX", status: "Success", category: "Sales", crop: "Kale" },
  { id: "t14", date: "Oct 1, 06:00", iso: "2026-10-01T06:00", type: "Out", description: "GrowMO Premium (monthly)", amount: -299, balanceAfter: 41099, method: "Internal", refNo: "SUB-2026-10", status: "Success", category: "Subscription" },
];

export const TXN_TYPES = ["All", "In", "Out"] as const;
export const TXN_METHODS = ["All", "M-Pesa B2C", "M-Pesa B2B", "M-Pesa C2B", "Bill pay", "Internal", "Bank", "Cash record"] as const;
export const TXN_CATEGORIES = ["All", "Deposit", "Labour", "Inputs", "Advance", "Transport", "Utilities", "Sales", "Co-op", "Equipment", "Subscription", "Invoice", "General"] as const;
export const TXN_STATUSES = ["All", "Success", "Pending", "Failed"] as const;

/* ---------- 14.6 Budget allocation ---------- */
export interface WalletBudget {
  id: string;
  name: string;
  emoji: string;
  allocated: number;
  spent: number;
  crop?: string;
}

export const WALLET_BUDGETS: WalletBudget[] = [
  { id: "b1", name: "Cabbage SR 2026", emoji: "🥬", allocated: 20000, spent: 15000, crop: "Cabbage" },
  { id: "b2", name: "Maize LR 2027", emoji: "🌽", allocated: 0, spent: 0, crop: "Maize" },
  { id: "b3", name: "General farm", emoji: "🏡", allocated: 0, spent: 0 },
];

/* ---------- 14.7 Security & controls ---------- */
export interface SecurityControl {
  id: string;
  k: string;
  v: string;
  enabled: boolean;
  lockable: boolean;
}

export const SECURITY_CONTROLS: SecurityControl[] = [
  { id: "s1", k: "Wallet PIN", v: "4-digit, required for every transaction", enabled: true, lockable: false },
  { id: "s2", k: "Biometric login", v: "Fingerprint / face to open the app", enabled: true, lockable: true },
  { id: "s3", k: "Daily limit", v: "KES 50,000 per day", enabled: true, lockable: true },
  { id: "s4", k: "Monthly limit", v: "KES 500,000 per month", enabled: true, lockable: true },
  { id: "s5", k: "Approval above KES 5,000", v: "Second PIN entry required", enabled: true, lockable: true },
  { id: "s6", k: "Recipient whitelist", v: "Only saved workers and suppliers", enabled: false, lockable: true },
  { id: "s7", k: "Freeze wallet", v: "Instant lock from app or SMS FREEZE to 20550", enabled: false, lockable: true },
  { id: "s8", k: "Fraud alerts", v: "SMS for every transaction plus unusual activity", enabled: true, lockable: true },
  { id: "s9", k: "Session timeout", v: "Auto-logout after 5 minutes idle", enabled: true, lockable: true },
];

export const WALLET_FAQ = [
  { q: "How long do M-Pesa deposits take to reflect?", a: "STK Push is instant. Paybill normally lands in 5–10 minutes. If nothing shows after 30 minutes, open the transaction and tap Report — GrowMO reconciles with Safaricom Daraja and threads the result to you by SMS." },
  { q: "What is the difference between free balance and budget money?", a: "Money allocated to a crop budget (for example Cabbage SR 2026) is ring-fenced for that crop. Free balance is what you can send anywhere. Both live in the same wallet and you can re-allocate at any time." },
  { q: "Can I reverse a payment?", a: "Within 2 hours you can raise a reversal from the transaction detail. M-Pesa B2C reversals need the recipient to accept, so pay workers only after the task is verified." },
  { q: "What are the fees?", a: "Wallet-to-wallet sends are free. M-Pesa B2C/B2B attracts the standard Safaricom tariff, card deposits 1.5%, bank transfers KES 50, agent deposits KES 20. GrowMO adds nothing on top." },
  { q: "Who holds my money?", a: "Wallets are held in a regulated trust account at KCB Bank Kenya (A/C 1284 556 001) and settle through Safaricom Daraja. GrowMO never lends or invests wallet float." },
  { q: "What happens if I lose my phone?", a: "SMS FREEZE to 20550 freezes the wallet instantly, and the PIN plus the 5-minute session timeout stop anyone using the app on a new device." },
];

export const WALLET_GLOSSARY = [
  { term: "STK Push", def: "The M-Pesa prompt that appears on your handset asking for your PIN." },
  { term: "B2C", def: "Business-to-customer send — used for worker payouts from the GrowMO wallet." },
  { term: "B2B", def: "Business-to-business send — used to pay Tills, Paybills and suppliers." },
  { term: "Paybill", def: "Short code for paying a business: GrowMO is 247247, account is your phone number." },
  { term: "Till (Buy Goods)", def: "Merchant number printed on an agrovet or shop till, e.g. 452198." },
  { term: "Float", def: "Cash an agent holds so they can deposit or withdraw on your behalf." },
  { term: "Reversal", def: "A request to move money back to the sender; M-Pesa requires the recipient's consent." },
  { term: "Trust account", def: "A ring-fenced bank account where customer wallet money is held, separate from company funds." },
];

export const WALLET_ALERTS = [
  { id: "al1", tone: "warn" as const, text: "Pending outflow of KES 4,500 — 3 labour paysheets awaiting approval for Nov 1." },
  { id: "al2", tone: "info" as const, text: "Daily limit KES 50,000: KES 3,500 used today across 3 transactions." },
  { id: "al3", tone: "success" as const, text: "October deposits KES 60,000 against spend KES 35,500 — net savings KES 24,500." },
];

export const WALLET_SETTINGS_ROWS = [
  { k: "Wallet PIN", v: "4-digit · changed 12 Aug 2026" },
  { k: "Biometric", v: "Fingerprint on Infinix Hot 40" },
  { k: "Settlement account", v: "KCB Trust A/C 1284 556 001" },
  { k: "Payout schedule", v: "Friday 5 PM auto-run (paused)" },
  { k: "Receipt delivery", v: "SMS to 0712 345 678 + in-app" },
  { k: "Statement sharing", v: "Time-limited links, read-only" },
  { k: "Support line", v: "0700 000 000 · 24/7 toll-free" },
];

export function walletTotals() {
  const inflow = TRANSACTIONS.filter((t) => t.type === "In").reduce((sum, t) => sum + t.amount, 0);
  const outflow = TRANSACTIONS.filter((t) => t.type === "Out").reduce((sum, t) => sum + Math.abs(t.amount), 0);
  return {
    inflow,
    outflow,
    net: inflow - outflow,
    count: TRANSACTIONS.length,
    deposits: TRANSACTIONS.filter((t) => t.category === "Deposit").length,
    budgeted: WALLET_BUDGETS.reduce((sum, b) => sum + b.allocated, 0),
    budgetedSpent: WALLET_BUDGETS.reduce((sum, b) => sum + b.spent, 0),
    activeRules: AUTOPAY_RULES.filter((r) => r.status === "Active").length,
  };
}
