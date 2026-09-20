/* ============================================================================
   PAGE 7 — FINANCIAL MANAGEMENT & BUDGETING
   Financial demo data for Mary's Wanjiku Mixed Farm, Githunguri, Kiambu.
   All amounts are Kenyan shillings and all payment references are simulations.
   ========================================================================== */

export type WalletActivityKind = "In" | "Out";
export type MoneyStatus =
  | "Paid"
  | "Pending"
  | "Scheduled"
  | "Received"
  | "Future";
export type BudgetStatus =
  | "On track"
  | "Over budget"
  | "Not started"
  | "Future"
  | "Complete";
export type ExpenseMethod = "Cash" | "Manual M-Pesa" | "GrowMO wallet";
export type IncomeMethod = "M-Pesa" | "Cash" | "Bank";
export type AutoPayStatus = "Active" | "Paused";
export type FinancialView =
  | "wallet"
  | "budgets"
  | "expenses"
  | "income"
  | "cashflow"
  | "pnl"
  | "autopay"
  | "portfolio";

export const FINANCE_CONTEXT = {
  farmer: "Mary Wanjiku",
  farm: "Wanjiku Mixed Farm",
  location: "Githunguri, Kiambu County",
  phone: "0712 345 678",
  walletBalance: 35000,
  allocated: 20000,
  unallocated: 15000,
  pendingDeductions: 4500,
  effectiveAvailable: 10500,
  today: "13 Nov 2026",
  season: "Short Rains 2026",
};

export interface WalletActivity {
  id: string;
  time: string;
  kind: WalletActivityKind;
  description: string;
  amount: number;
  balanceAfter: number;
  category: string;
  receipt: string | null;
  status: MoneyStatus;
}

export const WALLET_ACTIVITY: WalletActivity[] = [
  {
    id: "wa-001",
    time: "Today · 10:30 AM",
    kind: "Out",
    description: "Paid John Mwangi — cabbage weeding",
    amount: 500,
    balanceAfter: 35000,
    category: "Labour",
    receipt: "QJK3L5X7YZ",
    status: "Paid",
  },
  {
    id: "wa-002",
    time: "Today · 9:00 AM",
    kind: "In",
    description: "Deposit from M-Pesa",
    amount: 10000,
    balanceAfter: 35500,
    category: "Deposit",
    receipt: "RBX7Q2K91M",
    status: "Received",
  },
  {
    id: "wa-003",
    time: "Yesterday · 3:15 PM",
    kind: "Out",
    description: "Paid Githunguri Agro-vet — DAP",
    amount: 6500,
    balanceAfter: 25500,
    category: "Fertilizer",
    receipt: "SHK4RT9P2A",
    status: "Paid",
  },
  {
    id: "wa-004",
    time: "20 Oct · 6:10 PM",
    kind: "Out",
    description: "Workers — cabbage transplanting × 5",
    amount: 2500,
    balanceAfter: 32000,
    category: "Labour",
    receipt: "QJK3L5X7YZ",
    status: "Paid",
  },
  {
    id: "wa-005",
    time: "18 Oct · 8:45 AM",
    kind: "In",
    description: "Deposit from M-Pesa",
    amount: 50000,
    balanceAfter: 34500,
    category: "Deposit",
    receipt: "LPA9C4H12S",
    status: "Received",
  },
  {
    id: "wa-006",
    time: "17 Oct · 2:40 PM",
    kind: "Out",
    description: "Manure — Mary's Dairy Farm",
    amount: 15000,
    balanceAfter: 29500,
    category: "Manure",
    receipt: null,
    status: "Paid",
  },
  {
    id: "wa-007",
    time: "15 Oct · 11:05 AM",
    kind: "Out",
    description: "Cabbage Gloria F1 seed × 4",
    amount: 3200,
    balanceAfter: 44500,
    category: "Seeds",
    receipt: "CASH-1510",
    status: "Paid",
  },
  {
    id: "wa-008",
    time: "12 Oct · 4:20 PM",
    kind: "In",
    description: "Cabbage pre-order deposit — Marikiti broker",
    amount: 20000,
    balanceAfter: 47700,
    category: "Buyer deposit",
    receipt: "MPESA-8821",
    status: "Received",
  },
  {
    id: "wa-009",
    time: "10 Oct · 8:00 AM",
    kind: "Out",
    description: "Drip tape repair and fittings",
    amount: 1800,
    balanceAfter: 27700,
    category: "Irrigation",
    receipt: "KIA8P0N2",
    status: "Paid",
  },
  {
    id: "wa-010",
    time: "08 Oct · 7:35 AM",
    kind: "In",
    description: "Deposit from M-Pesa",
    amount: 30000,
    balanceAfter: 29500,
    category: "Deposit",
    receipt: "TUV2P7D11",
    status: "Received",
  },
];

export interface BudgetCategory {
  id: string;
  budgetId: string;
  category: string;
  allocated: number;
  spent: number;
  note: string;
  status: BudgetStatus;
}

export interface FinancialBudget {
  id: string;
  name: string;
  crop: string;
  plot: string;
  season: string;
  total: number;
  spent: number;
  startDate: string;
  endDate: string;
  status: BudgetStatus;
  alertAt: number;
  note: string;
}

export const BUDGETS: FinancialBudget[] = [
  {
    id: "bud-cabbage",
    name: "Cabbage Season SR 2026 — Plot 1",
    crop: "Cabbage Gloria F1",
    plot: "Plot 1 · 0.5 acre",
    season: "Short Rains 2026",
    total: 56000,
    spent: 35950,
    startDate: "01 Oct 2026",
    endDate: "31 Jan 2027",
    status: "On track",
    alertAt: 90,
    note: "Manure is fully paid; reserve cash for harvest and transport.",
  },
  {
    id: "bud-maize",
    name: "Maize H6213 — Shamba ya chini",
    crop: "Maize H6213",
    plot: "Plot 2 · 2 acres",
    season: "Short Rains 2026",
    total: 80000,
    spent: 72000,
    startDate: "15 Oct 2026",
    endDate: "15 Mar 2027",
    status: "Over budget",
    alertAt: 90,
    note: "Fall Armyworm scouting and extra land preparation lifted spend.",
  },
  {
    id: "bud-tomato",
    name: "Greenhouse Tomatoes — Cycle 4",
    crop: "Tomato Anna F1",
    plot: "Greenhouse 1 · 0.08 acre",
    season: "Cycle 4 2026",
    total: 115000,
    spent: 68400,
    startDate: "01 Sep 2026",
    endDate: "15 Feb 2027",
    status: "On track",
    alertAt: 85,
    note: "Harvest income is expected weekly from 18 Nov.",
  },
  {
    id: "bud-beans",
    name: "Beans Rosecoco — Kwa mto",
    crop: "Dry Beans Rosecoco",
    plot: "Plot 3 · 1 acre",
    season: "Short Rains 2026",
    total: 42000,
    spent: 0,
    startDate: "20 Nov 2026",
    endDate: "28 Feb 2027",
    status: "Future",
    alertAt: 90,
    note: "Seed and basal fertilizer are not yet released from the wallet.",
  },
];

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: "bc-01",
    budgetId: "bud-cabbage",
    category: "Land preparation",
    allocated: 5000,
    spent: 4000,
    note: "Ox-plough and bed shaping",
    status: "On track",
  },
  {
    id: "bc-02",
    budgetId: "bud-cabbage",
    category: "Seeds & nursery",
    allocated: 3000,
    spent: 3200,
    note: "Seed price was higher than estimated",
    status: "Over budget",
  },
  {
    id: "bc-03",
    budgetId: "bud-cabbage",
    category: "Fertilizers",
    allocated: 12000,
    spent: 6250,
    note: "CAN purchase due in one week",
    status: "On track",
  },
  {
    id: "bc-04",
    budgetId: "bud-cabbage",
    category: "Pesticides & chemicals",
    allocated: 5000,
    spent: 1500,
    note: "Mancozeb and scouting only",
    status: "On track",
  },
  {
    id: "bc-05",
    budgetId: "bud-cabbage",
    category: "Manure",
    allocated: 15000,
    spent: 15000,
    note: "Two and a half tonnes received",
    status: "Complete",
  },
  {
    id: "bc-06",
    budgetId: "bud-cabbage",
    category: "Labour",
    allocated: 14000,
    spent: 6000,
    note: "Six workers required for harvest",
    status: "On track",
  },
  {
    id: "bc-07",
    budgetId: "bud-cabbage",
    category: "Irrigation",
    allocated: 2000,
    spent: 0,
    note: "Standby water and drip repairs",
    status: "Not started",
  },
  {
    id: "bc-08",
    budgetId: "bud-cabbage",
    category: "Harvest & post-harvest",
    allocated: 0,
    spent: 0,
    note: "Future commitment in labour forecast",
    status: "Future",
  },
  {
    id: "bc-09",
    budgetId: "bud-cabbage",
    category: "Transport",
    allocated: 0,
    spent: 0,
    note: "Add once buyer confirms route",
    status: "Future",
  },
  {
    id: "bm-01",
    budgetId: "bud-maize",
    category: "Land preparation",
    allocated: 15000,
    spent: 14000,
    note: "Two acres prepared",
    status: "On track",
  },
  {
    id: "bm-02",
    budgetId: "bud-maize",
    category: "Seeds",
    allocated: 7000,
    spent: 7600,
    note: "Certified H6213 seed",
    status: "Over budget",
  },
  {
    id: "bm-03",
    budgetId: "bud-maize",
    category: "Fertilizers",
    allocated: 28000,
    spent: 25500,
    note: "DAP and CAN",
    status: "On track",
  },
  {
    id: "bm-04",
    budgetId: "bud-maize",
    category: "Crop protection",
    allocated: 7000,
    spent: 9900,
    note: "Armyworm response",
    status: "Over budget",
  },
  {
    id: "bm-05",
    budgetId: "bud-maize",
    category: "Labour",
    allocated: 13000,
    spent: 11000,
    note: "Planting and first weeding",
    status: "On track",
  },
  {
    id: "bm-06",
    budgetId: "bud-maize",
    category: "Harvest & transport",
    allocated: 10000,
    spent: 4000,
    note: "March harvest reserve",
    status: "Future",
  },
  {
    id: "bt-01",
    budgetId: "bud-tomato",
    category: "Seedlings & nursery",
    allocated: 15000,
    spent: 12500,
    note: "Anna F1 seedlings",
    status: "On track",
  },
  {
    id: "bt-02",
    budgetId: "bud-tomato",
    category: "Fertilizers & fertigation",
    allocated: 24000,
    spent: 18200,
    note: "Calcium and soluble feed",
    status: "On track",
  },
  {
    id: "bt-03",
    budgetId: "bud-tomato",
    category: "Crop protection",
    allocated: 18000,
    spent: 15000,
    note: "Whitefly and blight program",
    status: "On track",
  },
  {
    id: "bt-04",
    budgetId: "bud-tomato",
    category: "Labour",
    allocated: 26000,
    spent: 14500,
    note: "Pruning, tying and harvest",
    status: "On track",
  },
  {
    id: "bt-05",
    budgetId: "bud-tomato",
    category: "Water & power",
    allocated: 18000,
    spent: 8200,
    note: "Pump and drip",
    status: "On track",
  },
  {
    id: "bt-06",
    budgetId: "bud-tomato",
    category: "Packaging",
    allocated: 14000,
    spent: 0,
    note: "Crates due before first buyer pickup",
    status: "Future",
  },
  {
    id: "bb-01",
    budgetId: "bud-beans",
    category: "Seeds",
    allocated: 9000,
    spent: 0,
    note: "Rosecoco seed",
    status: "Future",
  },
  {
    id: "bb-02",
    budgetId: "bud-beans",
    category: "Fertilizers",
    allocated: 12000,
    spent: 0,
    note: "DAP and CAN",
    status: "Future",
  },
  {
    id: "bb-03",
    budgetId: "bud-beans",
    category: "Labour",
    allocated: 10000,
    spent: 0,
    note: "Planting and weeding",
    status: "Future",
  },
  {
    id: "bb-04",
    budgetId: "bud-beans",
    category: "Crop protection",
    allocated: 6000,
    spent: 0,
    note: "Foliar feed and scouting",
    status: "Future",
  },
  {
    id: "bb-05",
    budgetId: "bud-beans",
    category: "Harvest & transport",
    allocated: 5000,
    spent: 0,
    note: "February harvest",
    status: "Future",
  },
];

export interface ExpenseRecord {
  id: string;
  date: string;
  description: string;
  category: string;
  subCategory: string;
  crop: string;
  budgetId: string | null;
  amount: number;
  method: ExpenseMethod;
  payee: string;
  receipt: string | null;
  status: MoneyStatus;
  receiptPhoto: boolean;
  notes: string;
}

export const EXPENSES: ExpenseRecord[] = [
  {
    id: "exp-001",
    date: "20 Oct 2026",
    description: "DAP 50kg — 1 bag",
    category: "Inputs",
    subCategory: "Fertilizer",
    crop: "Cabbage Gloria F1",
    budgetId: "bud-cabbage",
    amount: 6500,
    method: "Manual M-Pesa",
    payee: "Githunguri Agro-vet",
    receipt: "SHK4RT9",
    status: "Paid",
    receiptPhoto: true,
    notes: "Applied as basal fertilizer.",
  },
  {
    id: "exp-002",
    date: "20 Oct 2026",
    description: "Cabbage seed Gloria F1 × 4",
    category: "Inputs",
    subCategory: "Seed",
    crop: "Cabbage Gloria F1",
    budgetId: "bud-cabbage",
    amount: 3200,
    method: "Cash",
    payee: "Kenya Seed Depot",
    receipt: null,
    status: "Paid",
    receiptPhoto: false,
    notes: "Four 25g sachets.",
  },
  {
    id: "exp-003",
    date: "20 Oct 2026",
    description: "Manure 2.5 tonnes",
    category: "Inputs",
    subCategory: "Manure",
    crop: "Cabbage Gloria F1",
    budgetId: "bud-cabbage",
    amount: 15000,
    method: "Cash",
    payee: "Mary's Dairy Farm",
    receipt: null,
    status: "Paid",
    receiptPhoto: false,
    notes: "Delivered to Plot 1.",
  },
  {
    id: "exp-004",
    date: "20 Oct 2026",
    description: "Workers: transplanting × 5",
    category: "Labour",
    subCategory: "Transplanting",
    crop: "Cabbage Gloria F1",
    budgetId: "bud-cabbage",
    amount: 2500,
    method: "GrowMO wallet",
    payee: "John + Grace + team",
    receipt: "QJK3L5X7YZ",
    status: "Paid",
    receiptPhoto: false,
    notes: "Five workers, full day.",
  },
  {
    id: "exp-005",
    date: "25 Oct 2026",
    description: "Workers: weeding × 3",
    category: "Labour",
    subCategory: "Weeding",
    crop: "Cabbage Gloria F1",
    budgetId: "bud-cabbage",
    amount: 1500,
    method: "GrowMO wallet",
    payee: "John + Peter + Lucy",
    receipt: "PLM8NR2KQW",
    status: "Paid",
    receiptPhoto: false,
    notes: "First pass completed.",
  },
  {
    id: "exp-006",
    date: "25 Oct 2026",
    description: "Lunch for workers",
    category: "Other",
    subCategory: "Worker welfare",
    crop: "None",
    budgetId: null,
    amount: 300,
    method: "Cash",
    payee: "Githunguri market",
    receipt: null,
    status: "Paid",
    receiptPhoto: false,
    notes: "Tea and lunch.",
  },
  {
    id: "exp-007",
    date: "03 Nov 2026",
    description: "CAN 50kg — half bag",
    category: "Inputs",
    subCategory: "Fertilizer",
    crop: "Cabbage Gloria F1",
    budgetId: "bud-cabbage",
    amount: 6250,
    method: "Manual M-Pesa",
    payee: "Githunguri Agro-vet",
    receipt: "AGV8KD22",
    status: "Paid",
    receiptPhoto: true,
    notes: "Top dressing.",
  },
  {
    id: "exp-008",
    date: "09 Nov 2026",
    description: "Greenhouse drip repair",
    category: "Equipment",
    subCategory: "Irrigation",
    crop: "Tomato Anna F1",
    budgetId: "bud-tomato",
    amount: 1800,
    method: "Cash",
    payee: "Tigoni Irrigation Works",
    receipt: null,
    status: "Paid",
    receiptPhoto: false,
    notes: "Bed 3 emitter line.",
  },
  {
    id: "exp-009",
    date: "10 Nov 2026",
    description: "Mancozeb 80 WP — 1kg",
    category: "Inputs",
    subCategory: "Pesticide",
    crop: "Cabbage Gloria F1",
    budgetId: "bud-cabbage",
    amount: 1500,
    method: "GrowMO wallet",
    payee: "Kiambu Farmers Centre",
    receipt: "MNC4L2P8",
    status: "Paid",
    receiptPhoto: true,
    notes: "Preventive spray stock.",
  },
  {
    id: "exp-010",
    date: "11 Nov 2026",
    description: "Armyworm scouting and spray",
    category: "Crop protection",
    subCategory: "Pesticide",
    crop: "Maize H6213",
    budgetId: "bud-maize",
    amount: 4900,
    method: "GrowMO wallet",
    payee: "Kiambu Farmers Centre",
    receipt: "ARM7T3A1",
    status: "Paid",
    receiptPhoto: true,
    notes: "Two-acre emergency response.",
  },
  {
    id: "exp-011",
    date: "12 Nov 2026",
    description: "Tomato fertigation feed",
    category: "Inputs",
    subCategory: "Fertilizer",
    crop: "Tomato Anna F1",
    budgetId: "bud-tomato",
    amount: 4200,
    method: "Manual M-Pesa",
    payee: "Yara Distributor",
    receipt: "YAR2G6M0",
    status: "Paid",
    receiptPhoto: false,
    notes: "Calcium nitrate and MAP.",
  },
  {
    id: "exp-012",
    date: "13 Nov 2026",
    description: "Worker transport advance",
    category: "Labour",
    subCategory: "Advance",
    crop: "Maize H6213",
    budgetId: "bud-maize",
    amount: 1000,
    method: "GrowMO wallet",
    payee: "Peter Kamau",
    receipt: null,
    status: "Pending",
    receiptPhoto: false,
    notes: "Awaiting OTP + PIN settlement.",
  },
  {
    id: "exp-013",
    date: "15 Nov 2026",
    description: "CAN 50kg — next purchase",
    category: "Inputs",
    subCategory: "Fertilizer",
    crop: "Cabbage Gloria F1",
    budgetId: "bud-cabbage",
    amount: 5000,
    method: "GrowMO wallet",
    payee: "Githunguri Agro-vet",
    receipt: null,
    status: "Scheduled",
    receiptPhoto: false,
    notes: "Needed before top dressing.",
  },
  {
    id: "exp-014",
    date: "18 Nov 2026",
    description: "Tomato crates — first harvest",
    category: "Harvest & post-harvest",
    subCategory: "Crates",
    crop: "Tomato Anna F1",
    budgetId: "bud-tomato",
    amount: 6000,
    method: "GrowMO wallet",
    payee: "Ruiru Plastics",
    receipt: null,
    status: "Future",
    receiptPhoto: false,
    notes: "Reserve against first buyer pickup.",
  },
  {
    id: "exp-015",
    date: "01 Dec 2026",
    description: "Cabbage second spray",
    category: "Crop protection",
    subCategory: "Pesticide",
    crop: "Cabbage Gloria F1",
    budgetId: "bud-cabbage",
    amount: 1500,
    method: "GrowMO wallet",
    payee: "Githunguri Agro-vet",
    receipt: null,
    status: "Future",
    receiptPhoto: false,
    notes: "Only release if scouting threshold is met.",
  },
];

export interface IncomeRecord {
  id: string;
  date: string;
  source: string;
  crop: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  method: IncomeMethod;
  buyer: string;
  status: MoneyStatus;
  receipt: string | null;
  note: string;
}

export const INCOME: IncomeRecord[] = [
  {
    id: "inc-001",
    date: "12 Oct 2026",
    source: "Cabbage pre-order deposit",
    crop: "Cabbage Gloria F1",
    quantity: 1,
    unit: "deposit",
    unitPrice: 20000,
    total: 20000,
    method: "M-Pesa",
    buyer: "Marikiti broker",
    status: "Received",
    receipt: "MPESA-8821",
    note: "Buyer deposit for January harvest.",
  },
  {
    id: "inc-002",
    date: "15 Jan 2027",
    source: "Cabbage sale — Marikiti",
    crop: "Cabbage Gloria F1",
    quantity: 5000,
    unit: "heads",
    unitPrice: 30,
    total: 150000,
    method: "M-Pesa",
    buyer: "Marikiti broker",
    status: "Future",
    receipt: null,
    note: "Expected after delivery confirmation.",
  },
  {
    id: "inc-003",
    date: "16 Jan 2027",
    source: "Cabbage sale — direct",
    crop: "Cabbage Gloria F1",
    quantity: 3000,
    unit: "heads",
    unitPrice: 28,
    total: 84000,
    method: "Cash",
    buyer: "Walk-in buyer",
    status: "Future",
    receipt: null,
    note: "Direct sale, paid on collection.",
  },
  {
    id: "inc-004",
    date: "20 Jan 2027",
    source: "Cabbage restaurant order",
    crop: "Cabbage Gloria F1",
    quantity: 2000,
    unit: "heads",
    unitPrice: 25,
    total: 50000,
    method: "M-Pesa",
    buyer: "Kiambu Green Bistro",
    status: "Pending",
    receipt: null,
    note: "Invoice due on delivery.",
  },
  {
    id: "inc-005",
    date: "18 Nov 2026",
    source: "Tomato harvest — grade A",
    crop: "Tomato Anna F1",
    quantity: 18,
    unit: "crates",
    unitPrice: 1800,
    total: 32400,
    method: "M-Pesa",
    buyer: "Wakulima market trader",
    status: "Future",
    receipt: null,
    note: "First greenhouse picking forecast.",
  },
  {
    id: "inc-006",
    date: "28 Feb 2027",
    source: "Beans sale",
    crop: "Dry Beans Rosecoco",
    quantity: 6,
    unit: "bags",
    unitPrice: 7200,
    total: 43200,
    method: "Bank",
    buyer: "Kiambu Cereal Union",
    status: "Future",
    receipt: null,
    note: "Conservative yield estimate.",
  },
  {
    id: "inc-007",
    date: "15 Mar 2027",
    source: "Maize harvest — H6213",
    crop: "Maize H6213",
    quantity: 31,
    unit: "bags",
    unitPrice: 4100,
    total: 127100,
    method: "M-Pesa",
    buyer: "Githunguri miller",
    status: "Future",
    receipt: null,
    note: "Forecast at 31 bags from 1.2 acres.",
  },
  {
    id: "inc-008",
    date: "30 Sep 2026",
    source: "Milk sales",
    crop: "Dairy",
    quantity: 340,
    unit: "litres",
    unitPrice: 52,
    total: 17680,
    method: "M-Pesa",
    buyer: "Githunguri Dairy Co-op",
    status: "Received",
    receipt: "DAIRY-9302",
    note: "Monthly side-income included in farm wallet.",
  },
  {
    id: "inc-009",
    date: "05 Oct 2026",
    source: "Avocado collection",
    crop: "Avocado",
    quantity: 120,
    unit: "kg",
    unitPrice: 85,
    total: 10200,
    method: "M-Pesa",
    buyer: "Kiambu Fresh Traders",
    status: "Received",
    receipt: "AVO5N8T1",
    note: "Grade two fruit sold from the boundary trees.",
  },
  {
    id: "inc-010",
    date: "08 Oct 2026",
    source: "Egg sales",
    crop: "Poultry",
    quantity: 6,
    unit: "trays",
    unitPrice: 450,
    total: 2700,
    method: "Cash",
    buyer: "Githunguri market",
    status: "Received",
    receipt: "CASH-EGG8",
    note: "Small enterprise income kept separate from crop budgets.",
  },
];

export interface CashFlowMonth {
  id: string;
  month: string;
  inflows: number;
  outflows: number;
  net: number;
  cumulative: number;
  note: string;
}

export const CASH_FLOW: CashFlowMonth[] = [
  {
    id: "cf-oct",
    month: "October",
    inflows: 70000,
    outflows: 27700,
    net: 42300,
    cumulative: 42300,
    note: "Deposits and cabbage buyer advance funded establishment.",
  },
  {
    id: "cf-nov",
    month: "November",
    inflows: 0,
    outflows: 8250,
    net: -8250,
    cumulative: 34050,
    note: "Protection, CAN and greenhouse cycle costs.",
  },
  {
    id: "cf-dec",
    month: "December",
    inflows: 0,
    outflows: 3450,
    net: -3450,
    cumulative: 30600,
    note: "Cabbage scouting and scheduled labour reserve.",
  },
  {
    id: "cf-jan",
    month: "January",
    inflows: 284000,
    outflows: 21100,
    net: 262900,
    cumulative: 293500,
    note: "Cabbage harvest and buyer settlements.",
  },
  {
    id: "cf-feb",
    month: "February",
    inflows: 43200,
    outflows: 16000,
    net: 27200,
    cumulative: 320700,
    note: "Beans sale and greenhouse packaging.",
  },
  {
    id: "cf-mar",
    month: "March",
    inflows: 127100,
    outflows: 26800,
    net: 100300,
    cumulative: 421000,
    note: "Maize harvest and final transport.",
  },
];

export type PnlGroup = "Revenue" | "Cost of production" | "Profit";
export interface PnlLine {
  id: string;
  group: PnlGroup;
  label: string;
  budgeted: number;
  actual: number;
  variance: number;
  note: string;
}

export const PNL_CABBAGE: PnlLine[] = [
  {
    id: "pnl-01",
    group: "Revenue",
    label: "Cabbage sales — Marikiti",
    budgeted: 240000,
    actual: 234000,
    variance: -6000,
    note: "Price softened to KES 28–30/head.",
  },
  {
    id: "pnl-02",
    group: "Revenue",
    label: "Cabbage sales — direct",
    budgeted: 0,
    actual: 84000,
    variance: 84000,
    note: "Direct restaurant and walk-in orders.",
  },
  {
    id: "pnl-03",
    group: "Cost of production",
    label: "Land preparation",
    budgeted: 5000,
    actual: 4000,
    variance: -1000,
    note: "Ox-plough rate negotiated locally.",
  },
  {
    id: "pnl-04",
    group: "Cost of production",
    label: "Seeds & nursery",
    budgeted: 3000,
    actual: 3200,
    variance: 200,
    note: "Seed price higher than estimate.",
  },
  {
    id: "pnl-05",
    group: "Cost of production",
    label: "Fertilizers",
    budgeted: 12000,
    actual: 9500,
    variance: -2500,
    note: "Used manure to reduce purchased feed.",
  },
  {
    id: "pnl-06",
    group: "Cost of production",
    label: "Pesticides",
    budgeted: 5000,
    actual: 3500,
    variance: -1500,
    note: "Scouting avoided one blanket spray.",
  },
  {
    id: "pnl-07",
    group: "Cost of production",
    label: "Manure",
    budgeted: 15000,
    actual: 15000,
    variance: 0,
    note: "Two and a half tonnes delivered.",
  },
  {
    id: "pnl-08",
    group: "Cost of production",
    label: "Labour",
    budgeted: 14000,
    actual: 14600,
    variance: 600,
    note: "Harvest lead premium included.",
  },
  {
    id: "pnl-09",
    group: "Cost of production",
    label: "Irrigation",
    budgeted: 2000,
    actual: 1500,
    variance: -500,
    note: "Drip repair only.",
  },
  {
    id: "pnl-10",
    group: "Cost of production",
    label: "Harvest & post-harvest",
    budgeted: 15000,
    actual: 16000,
    variance: 1000,
    note: "Extra crates during wet morning.",
  },
  {
    id: "pnl-11",
    group: "Cost of production",
    label: "Transport",
    budgeted: 3000,
    actual: 2500,
    variance: -500,
    note: "Shared buyer route.",
  },
  {
    id: "pnl-12",
    group: "Profit",
    label: "Total Revenue",
    budgeted: 240000,
    actual: 318000,
    variance: 78000,
    note: "Marikiti plus direct channels.",
  },
  {
    id: "pnl-13",
    group: "Profit",
    label: "Total cost of production",
    budgeted: 74000,
    actual: 69800,
    variance: -4200,
    note: "Under full production budget.",
  },
  {
    id: "pnl-14",
    group: "Profit",
    label: "Gross profit",
    budgeted: 166000,
    actual: 248200,
    variance: 82200,
    note: "Before contingency.",
  },
  {
    id: "pnl-15",
    group: "Profit",
    label: "Contingency / unexpected",
    budgeted: 0,
    actual: 2000,
    variance: 2000,
    note: "One repair and extra worker lunch.",
  },
  {
    id: "pnl-16",
    group: "Profit",
    label: "Net profit",
    budgeted: 166000,
    actual: 246200,
    variance: 80200,
    note: "353% ROI on production cost.",
  },
];

export interface AutoPayRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  amount: string;
  status: AutoPayStatus;
  lastRun: string;
  note: string;
}

export const AUTO_PAY_RULES: AutoPayRule[] = [
  {
    id: "rule-01",
    name: "Pay workers on task completion",
    trigger: "Task marked Complete",
    action: "Send M-Pesa to assigned workers",
    amount: "Per task rate",
    status: "Active",
    lastRun: "Today · 10:30 AM",
    note: "Requires attendance and quality confirmation.",
  },
  {
    id: "rule-02",
    name: "Weekly labour settlement",
    trigger: "Every Friday · 5:00 PM",
    action: "Pay all unpaid tasks for the week",
    amount: "Sum of tasks",
    status: "Paused",
    lastRun: "18 Oct 2026",
    note: "Paused while reviewing cash flow.",
  },
  {
    id: "rule-03",
    name: "Input purchase approval",
    trigger: "Expense above KES 5,000",
    action: "Require PIN before wallet payment",
    amount: "Per expense",
    status: "Active",
    lastRun: "Yesterday · DAP",
    note: "Protects allocated crop funds.",
  },
  {
    id: "rule-04",
    name: "Budget limit alert",
    trigger: "Category spend above 90%",
    action: "Send push and SMS notification",
    amount: "—",
    status: "Active",
    lastRun: "03 Nov 2026",
    note: "One alert per category per week.",
  },
  {
    id: "rule-05",
    name: "Budget hard stop",
    trigger: "Category spend above 100%",
    action: "Block wallet payment; manual only",
    amount: "—",
    status: "Paused",
    lastRun: "Never",
    note: "Turn on after the family review.",
  },
  {
    id: "rule-06",
    name: "Buyer payment sweep",
    trigger: "Income received in wallet",
    action: "Reserve 20% for next-season inputs",
    amount: "20%",
    status: "Active",
    lastRun: "12 Oct 2026",
    note: "Keeps the next season funded.",
  },
];

export interface CropFinancialOverview {
  id: string;
  crop: string;
  acreage: string;
  budget: number;
  spent: number;
  revenue: number;
  profit: number;
  roi: number;
  status: string;
}

export const CROP_FINANCIALS: CropFinancialOverview[] = [
  {
    id: "crop-fin-01",
    crop: "Cabbage Gloria F1",
    acreage: "0.5 acre",
    budget: 74000,
    spent: 69800,
    revenue: 318000,
    profit: 246200,
    roi: 353,
    status: "Profit plan",
  },
  {
    id: "crop-fin-02",
    crop: "Maize H6213",
    acreage: "2 acres",
    budget: 80000,
    spent: 72000,
    revenue: 70000,
    profit: -2000,
    roi: -3,
    status: "Watch",
  },
  {
    id: "crop-fin-03",
    crop: "Tomato Anna F1",
    acreage: "0.08 acre",
    budget: 115000,
    spent: 68400,
    revenue: 210000,
    profit: 141600,
    roi: 207,
    status: "On track",
  },
  {
    id: "crop-fin-04",
    crop: "Dry Beans Rosecoco",
    acreage: "1 acre",
    budget: 42000,
    spent: 0,
    revenue: 43200,
    profit: 1200,
    roi: 3,
    status: "Future",
  },
];

export interface FinancialPayee {
  id: string;
  name: string;
  type: string;
  phone: string;
  lastPaid: string;
  category: string;
}

export const FINANCIAL_PAYEES: FinancialPayee[] = [
  {
    id: "payee-01",
    name: "Githunguri Agro-vet",
    type: "Agro-vet",
    phone: "0712 880 114",
    lastPaid: "Yesterday",
    category: "Inputs",
  },
  {
    id: "payee-02",
    name: "Kiambu Farmers Centre",
    type: "Agro-vet",
    phone: "0722 441 600",
    lastPaid: "11 Nov 2026",
    category: "Inputs",
  },
  {
    id: "payee-03",
    name: "Yara Distributor",
    type: "Fertilizer specialist",
    phone: "0733 809 114",
    lastPaid: "12 Nov 2026",
    category: "Inputs",
  },
  {
    id: "payee-04",
    name: "Mary's Dairy Farm",
    type: "Manure supplier",
    phone: "0755 210 765",
    lastPaid: "17 Oct 2026",
    category: "Inputs",
  },
  {
    id: "payee-05",
    name: "John Mwangi Kamau",
    type: "Worker",
    phone: "0712 345 678",
    lastPaid: "Today",
    category: "Labour",
  },
  {
    id: "payee-06",
    name: "Peter Kamau Njoroge",
    type: "Worker",
    phone: "0733 901 221",
    lastPaid: "25 Oct 2026",
    category: "Labour",
  },
  {
    id: "payee-07",
    name: "Tigoni Irrigation Works",
    type: "Equipment repair",
    phone: "0788 610 204",
    lastPaid: "09 Nov 2026",
    category: "Equipment",
  },
  {
    id: "payee-08",
    name: "Ruiru Plastics",
    type: "Packaging supplier",
    phone: "0791 203 555",
    lastPaid: "Never",
    category: "Harvest",
  },
  {
    id: "payee-09",
    name: "Marikiti broker",
    type: "Buyer",
    phone: "0708 440 221",
    lastPaid: "12 Oct 2026",
    category: "Income",
  },
  {
    id: "payee-10",
    name: "Kiambu Green Bistro",
    type: "Buyer",
    phone: "0720 881 460",
    lastPaid: "Never",
    category: "Income",
  },
];

export interface FinancialSettings {
  lowBalanceAlert: boolean;
  budgetAlerts: boolean;
  smsReceipts: boolean;
  reservePercentage: number;
  requirePinAbove: number;
  defaultCurrency: string;
}

export const FINANCIAL_SETTINGS: FinancialSettings = {
  lowBalanceAlert: true,
  budgetAlerts: true,
  smsReceipts: true,
  reservePercentage: 20,
  requirePinAbove: 5000,
  defaultCurrency: "KES",
};

export const BUDGET_TEMPLATES = [
  {
    id: "template-cabbage",
    name: "Cabbage 0.5 acre",
    crop: "Cabbage Gloria F1",
    total: 56000,
    note: "Kiambu short-rains starter budget.",
  },
  {
    id: "template-maize",
    name: "Maize 2 acres",
    crop: "Maize H6213",
    total: 80000,
    note: "Seed, fertilizer, labour and harvest reserve.",
  },
  {
    id: "template-tomato",
    name: "Greenhouse tomato cycle",
    crop: "Tomato Anna F1",
    total: 115000,
    note: "Fertigation, crop protection and packaging.",
  },
  {
    id: "template-beans",
    name: "Beans 1 acre",
    crop: "Dry Beans Rosecoco",
    total: 42000,
    note: "Short-rains beans plan with a February sale.",
  },
];

export const EXPENSE_CATEGORIES = [
  "Inputs",
  "Labour",
  "Transport",
  "Equipment",
  "Fees",
  "Harvest & post-harvest",
  "Crop protection",
  "Other",
];
export const EXPENSE_SUBCATEGORIES = [
  "Fertilizer",
  "Pesticide",
  "Seed",
  "Manure",
  "Weeding",
  "Transplanting",
  "Advance",
  "Irrigation",
  "Crates",
  "Worker welfare",
  "Fuel",
  "Other",
];
export const FINANCE_CROPS = [
  "Cabbage Gloria F1",
  "Maize H6213",
  "Tomato Anna F1",
  "Dry Beans Rosecoco",
  "Dairy",
  "None",
];

export function budgetById(id: string | null): FinancialBudget | undefined {
  return BUDGETS.find((budget) => budget.id === id);
}

export function budgetProgress(budget: FinancialBudget) {
  return Math.min(
    100,
    Math.round((budget.spent / Math.max(budget.total, 1)) * 100),
  );
}

export function moneyStatusTone(
  status: MoneyStatus,
): "low" | "medium" | "high" | "neutral" {
  if (status === "Paid" || status === "Received") return "low";
  if (status === "Pending") return "high";
  if (status === "Scheduled") return "medium";
  return "neutral";
}

export function budgetStatusTone(
  status: BudgetStatus,
): "low" | "medium" | "high" | "neutral" {
  if (status === "On track" || status === "Complete") return "low";
  if (status === "Over budget") return "high";
  if (status === "Not started" || status === "Future") return "neutral";
  return "medium";
}
