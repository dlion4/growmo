/* ============================================================================
   PAGE 20 — MACHINERY & EQUIPMENT MANAGEMENT  (/app/machinery)

   Blueprint sections
   20.1 Equipment registry       20.4 Hire in / hire out
   20.2 Maintenance scheduler    20.5 Fuel & energy tracking
   20.3 Usage log + analytics    20.6 Depreciation & asset valuation

   Farm: Mary's Farm, Githunguri, Kiambu. Today: Tue 17/11/2026.
   Diesel at the Githunguri filling station: KES 195/L.
   ========================================================================== */

export const MACH_CONTEXT = {
  farm: "Mary's Farm",
  farmer: "Mary Wanjiku",
  village: "Githunguri",
  county: "Kiambu",
  today: "Tue 17/11/2026",
  dieselPrice: 195,
  standardFuelLph: 5, // MF 35 rated consumption
  operator: "James Mwangi (hired operator · 0722 314 882)",
};

export const CATEGORIES = [
  "Tractor",
  "Implement",
  "Irrigation",
  "Processing",
  "Transport",
  "Tool",
  "Structure",
  "Storage",
] as const;

export const SUBCATEGORIES: Record<string, string[]> = {
  Tractor: ["2WD Tractor", "4WD Tractor", "Walking Tractor"],
  Implement: ["Disc Plough", "Tine Harrow", "Rotavator", "Seeder", "Bulldozer Blade"],
  Irrigation: ["Drip Kit", "Solar Pump", "Borehole Pump", "Sprinkler"],
  Processing: ["Sheller", "Thresher", "Milling Unit", "Grader"],
  Transport: ["Flatbed Trailer", "Wheelbarrow", "Boda-boda", "Pickup"],
  Tool: ["Knapsack Sprayer", "Hand Hoe", "Panga", "Spring Balance", "Moisture Meter"],
  Structure: ["Greenhouse", "Store", "Shade Net", "Drying Shed"],
  Storage: ["Water Tank", "Silo", "Grain Bin"],
};

export const CONDITIONS = ["New", "Good", "Fair", "Poor", "Under repair"] as const;
export const OWNERSHIP = ["Own", "Hired", "Shared", "Cooperative"] as const;
export const FUEL_TYPES = ["Diesel", "Petrol", "Electric", "Manual"] as const;
export const DEPR_METHODS = ["Straight line", "Declining balance"] as const;
export const EQUIP_STATUS = [
  "Operational",
  "Partially deployed",
  "Needs servicing",
  "Under repair",
  "In storage",
] as const;

export interface InsuranceInfo {
  insured: boolean;
  policyNo: string;
  expiry: string;
  insurer: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  make: string;
  year: number; // year of manufacture
  regNo: string;
  engineNo: string;
  condition: string;
  ownership: string;
  purchaseDate: string;
  purchasePrice: number;
  valueListed: number; // registry "Value (KES)" column
  marketValue: number;
  bookValue: number;
  deprMethod: string;
  usefulLife: number; // years
  fuelType: string;
  fuelLph: number; // litres per hour
  hp: number;
  attachments: string[];
  storage: string;
  insurance: InsuranceInfo;
  photo: string;
  notes: string;
  status: string;
  hoursMeter?: number;
}

export const EQUIPMENT: Equipment[] = [
  {
    id: "EQ-001", name: "Massey Ferguson 35", category: "Tractor", subCategory: "2WD Tractor",
    make: "Massey Ferguson MF 35", year: 1985, regNo: "KAB 123X", engineNo: "MF35-789012",
    condition: "Fair", ownership: "Own", purchaseDate: "Mar 2020", purchasePrice: 450000,
    valueListed: 350000, marketValue: 350000, bookValue: 255000,
    deprMethod: "Straight line", usefulLife: 15, fuelType: "Diesel", fuelLph: 5, hp: 35,
    attachments: ["Plough", "Harrow", "Trailer", "Rotavator (hired)"],
    storage: "Garage at home compound",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "MF 35 in the garage, Nov 2026",
    notes: "Good condition, needs new battery. Strong for ploughing.",
    status: "Operational", hoursMeter: 1806,
  },
  {
    id: "EQ-002", name: "Disc plough (3-disc)", category: "Implement", subCategory: "Disc Plough",
    make: "Massey Ferguson 1273 (3-disc)", year: 2019, regNo: "—", engineNo: "—",
    condition: "Good", ownership: "Own", purchaseDate: "Mar 2020", purchasePrice: 60000,
    valueListed: 45000, marketValue: 45000, bookValue: 21000,
    deprMethod: "Straight line", usefulLife: 10, fuelType: "Manual", fuelLph: 0, hp: 0,
    attachments: [],
    storage: "On the MF 35, in the garage",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "3-disc after the Plot 2 ploughing",
    notes: "Heavy — cuts deep in the clay. Bearings need greasing (overdue).",
    status: "Operational",
  },
  {
    id: "EQ-003", name: "Harrow (tine)", category: "Implement", subCategory: "Tine Harrow",
    make: "Local fabrication (12-tine)", year: 2021, regNo: "—", engineNo: "—",
    condition: "Fair", ownership: "Own", purchaseDate: "Jun 2021", purchasePrice: 30000,
    valueListed: 25000, marketValue: 25000, bookValue: 11250,
    deprMethod: "Straight line", usefulLife: 8, fuelType: "Manual", fuelLph: 0, hp: 0,
    attachments: [],
    storage: "Hanging in the implement store",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "12-tine harrow by the store",
    notes: "Smashes clods nicely after ploughing; two tines bent from a rock.",
    status: "Operational",
  },
  {
    id: "EQ-004", name: "Trailer 2-tonne", category: "Transport", subCategory: "Flatbed Trailer",
    make: "Local fabrication (steel flatbed)", year: 2018, regNo: "—", engineNo: "—",
    condition: "Good", ownership: "Own", purchaseDate: "Jan 2018", purchasePrice: 95000,
    valueListed: 80000, marketValue: 80000, bookValue: 38000,
    deprMethod: "Straight line", usefulLife: 10, fuelType: "Manual", fuelLph: 0, hp: 0,
    attachments: ["Tarpaulin", "Chains"],
    storage: "Back of the MF 35",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "Trailer loaded with manure, 22/10",
    notes: "Takes 3 trips of manure from the dairy farm. Axle greased Aug 2026.",
    status: "Operational",
  },
  {
    id: "EQ-005", name: "Drip irrigation kit (1 acre)", category: "Irrigation", subCategory: "Drip Kit",
    make: "Netafim 1-acre kit (16 mm mainline)", year: 2025, regNo: "—", engineNo: "—",
    condition: "Good", ownership: "Own", purchaseDate: "Mar 2025", purchasePrice: 48000,
    valueListed: 35000, marketValue: 35000, bookValue: 33600,
    deprMethod: "Straight line", usefulLife: 10, fuelType: "Manual", fuelLph: 0, hp: 0,
    attachments: ["4 × 400 m drip tape", "Filter", "Valve manifold"],
    storage: "Deployed on Plot 2 (beds 1–4)",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "Drip line on bed 2 after refill",
    notes: "4 of 5 beds laid; bed 5 goes in after the maize harvest. Flush monthly.",
    status: "Partially deployed",
  },
  {
    id: "EQ-006", name: "Knapsack sprayer × 2", category: "Tool", subCategory: "Knapsack Sprayer",
    make: "Fuyi 16 L (battery)", year: 2023, regNo: "—", engineNo: "—",
    condition: "Good", ownership: "Own", purchaseDate: "Apr 2023", purchasePrice: 9000,
    valueListed: 6000, marketValue: 6000, bookValue: 2700,
    deprMethod: "Straight line", usefulLife: 5, fuelType: "Electric", fuelLph: 0, hp: 0,
    attachments: ["Nozzles (3 sets)"],
    storage: "Wall rack in the store",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "Both sprayers on the wall rack",
    notes: "Wash after every use. #1 pump worn — seals due Dec 2026.",
    status: "Operational",
  },
  {
    id: "EQ-007", name: "Hand hoe × 8", category: "Tool", subCategory: "Hand Hoe",
    make: "Local (steel)", year: 2019, regNo: "—", engineNo: "—",
    condition: "Fair", ownership: "Own", purchaseDate: "Jan 2019", purchasePrice: 6000,
    valueListed: 4000, marketValue: 4000, bookValue: 1500,
    deprMethod: "Straight line", usefulLife: 8, fuelType: "Manual", fuelLph: 0, hp: 0,
    attachments: [],
    storage: "Tool shed",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "Hoes lined up in the shed",
    notes: "Two handles re-shod 2025. Sharp with the panga stone weekly.",
    status: "Operational",
  },
  {
    id: "EQ-008", name: "Panga (machete) × 4", category: "Tool", subCategory: "Panga",
    make: "Local (forged)", year: 2020, regNo: "—", engineNo: "—",
    condition: "Good", ownership: "Own", purchaseDate: "Feb 2020", purchasePrice: 4000,
    valueListed: 2000, marketValue: 2000, bookValue: 1200,
    deprMethod: "Straight line", usefulLife: 10, fuelType: "Manual", fuelLph: 0, hp: 0,
    attachments: [],
    storage: "Tool shed",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "Pangas on the shed wall",
    notes: "One per crew member. Keep dry — rust spots in the rainy season.",
    status: "Operational",
  },
  {
    id: "EQ-009", name: "Wheelbarrow × 2", category: "Transport", subCategory: "Wheelbarrow",
    make: "Local (steel, rubber tyre)", year: 2022, regNo: "—", engineNo: "—",
    condition: "Fair", ownership: "Own", purchaseDate: "May 2022", purchasePrice: 9000,
    valueListed: 6000, marketValue: 6000, bookValue: 3000,
    deprMethod: "Straight line", usefulLife: 8, fuelType: "Manual", fuelLph: 0, hp: 0,
    attachments: [],
    storage: "Tool shed",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "Wheelbarrows by the compost pit",
    notes: "One tyre needs replacing; used mostly for compost moves.",
    status: "Operational",
  },
  {
    id: "EQ-010", name: "Greenhouse 8m × 30m", category: "Structure", subCategory: "Greenhouse",
    make: "KenGrid 8m × 30m (polythene)", year: 2023, regNo: "—", engineNo: "—",
    condition: "Good", ownership: "Own", purchaseDate: "Jun 2023", purchasePrice: 250000,
    valueListed: 250000, marketValue: 200000, bookValue: 146875,
    deprMethod: "Straight line", usefulLife: 8, fuelType: "Manual", fuelLph: 0, hp: 0,
    attachments: ["Shade cloth (30%)", "Irrigation line", "Insect net door"],
    storage: "East of the nursery, permanent",
    insurance: { insured: true, policyNo: "AFRL/GH/2281", expiry: "05/2027", insurer: "Africlaim" },
    photo: "Seedling trays inside, 14/11",
    notes: "Seedlings + early cabbage. Polythene re-tensioned after the October winds.",
    status: "Operational",
  },
  {
    id: "EQ-011", name: "Water tank 5,000L", category: "Storage", subCategory: "Water Tank",
    make: "Poly 5,000 L (elevated)", year: 2024, regNo: "—", engineNo: "—",
    condition: "Good", ownership: "Own", purchaseDate: "Jan 2024", purchasePrice: 22000,
    valueListed: 15000, marketValue: 15000, bookValue: 13200,
    deprMethod: "Straight line", usefulLife: 10, fuelType: "Manual", fuelLph: 0, hp: 0,
    attachments: ["Tap + overflow", "Fly screen"],
    storage: "On the brick stand, 90 m south of Plot 2",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "Tank at half, 16/11",
    notes: "Fills from the solar pump + roof. Keeps drip running on dry days.",
    status: "Operational",
  },
  {
    id: "EQ-012", name: "Solar water pump", category: "Irrigation", subCategory: "Solar Pump",
    make: "Wema 1.5 kW (submersible)", year: 2024, regNo: "—", engineNo: "SP15-4471",
    condition: "Good", ownership: "Own", purchaseDate: "Jan 2024", purchasePrice: 45000,
    valueListed: 45000, marketValue: 40000, bookValue: 32400,
    deprMethod: "Straight line", usefulLife: 10, fuelType: "Electric", fuelLph: 0, hp: 2,
    attachments: ["6 × 450 W panels", "Inverter box"],
    storage: "Borehole 90 m south of Plot 2",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "Panel array in the morning sun",
    notes: "Pumps 2,000 L/hr at noon. Connections check overdue since Jul 2026.",
    status: "Operational",
  },
  {
    id: "EQ-013", name: "Maize sheller", category: "Processing", subCategory: "Sheller",
    make: "Maizepro 4HP (electric)", year: 2021, regNo: "—", engineNo: "—",
    condition: "Good", ownership: "Own", purchaseDate: "Sep 2021", purchasePrice: 35000,
    valueListed: 25000, marketValue: 25000, bookValue: 8750,
    deprMethod: "Straight line", usefulLife: 10, fuelType: "Electric", fuelLph: 0, hp: 4,
    attachments: ["Collection tray"],
    storage: "Store, east corner",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "Sheller by the grain sacks",
    notes: "Feed roller worn — service before the December maize harvest.",
    status: "Needs servicing",
  },
  {
    id: "EQ-014", name: "Spring balance 100kg", category: "Tool", subCategory: "Spring Balance",
    make: "Local (100 kg hook)", year: 2020, regNo: "—", engineNo: "—",
    condition: "Good", ownership: "Own", purchaseDate: "Aug 2020", purchasePrice: 4000,
    valueListed: 3000, marketValue: 3000, bookValue: 1500,
    deprMethod: "Straight line", usefulLife: 8, fuelType: "Manual", fuelLph: 0, hp: 0,
    attachments: [],
    storage: "Store — weighing corner",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "On the wall by the scale plate",
    notes: "Calibrated against 20 kg bags in June 2026.",
    status: "Operational",
  },
  {
    id: "EQ-015", name: "Moisture meter", category: "Tool", subCategory: "Moisture Meter",
    make: "Wosx 5-in-1 (grain)", year: 2022, regNo: "—", engineNo: "—",
    condition: "Good", ownership: "Own", purchaseDate: "Oct 2022", purchasePrice: 4500,
    valueListed: 2500, marketValue: 2500, bookValue: 1125,
    deprMethod: "Straight line", usefulLife: 6, fuelType: "Electric", fuelLph: 0, hp: 0,
    attachments: [],
    storage: "Pocket kit, drying shed",
    insurance: { insured: false, policyNo: "—", expiry: "—", insurer: "—" },
    photo: "In the drying-shed kit box",
    notes: "Sell maize at 13.5% moisture — the co-op dock is 1% per point above.",
    status: "Operational",
  },
];

export const EQUIPMENT_TOTAL_VALUE = EQUIPMENT.reduce((s, e) => s + e.valueListed, 0); // 893,500

/* ---------- 20.2 maintenance scheduler ---------- */

export type MaintStatus = "Overdue" | "Upcoming" | "OK" | "Future" | "Every use";

export interface MaintRow {
  id: string;
  equipmentId: string;
  service: string;
  frequency: string;
  lastDone: string;
  nextDue: string;
  cost: number; // 0 = Free
  assigned: string;
  status: MaintStatus;
}

export const MAINTENANCE: MaintRow[] = [
  { id: "m1", equipmentId: "EQ-001", service: "Engine oil change", frequency: "Every 200 hrs", lastDone: "Aug 2026 (1,800 hrs)", nextDue: "Oct 2026 (2,000 hrs)", cost: 8000, assigned: "Local mechanic", status: "Overdue" },
  { id: "m2", equipmentId: "EQ-001", service: "Air filter clean", frequency: "Every 100 hrs", lastDone: "Sep 2026", nextDue: "Nov 2026", cost: 500, assigned: "Self", status: "Upcoming" },
  { id: "m3", equipmentId: "EQ-001", service: "Tire pressure check", frequency: "Weekly", lastDone: "Oct 24", nextDue: "Oct 31", cost: 0, assigned: "Self", status: "OK" },
  { id: "m4", equipmentId: "EQ-001", service: "Full service", frequency: "Annually", lastDone: "Mar 2026", nextDue: "Mar 2027", cost: 25000, assigned: "Dealer", status: "Future" },
  { id: "m5", equipmentId: "EQ-002", service: "Grease bearings", frequency: "Every season", lastDone: "Mar 2026", nextDue: "Oct 2026", cost: 500, assigned: "Self", status: "Overdue" },
  { id: "m6", equipmentId: "EQ-005", service: "Flush lines", frequency: "Monthly", lastDone: "Oct 1", nextDue: "Nov 1", cost: 0, assigned: "Self", status: "Upcoming" },
  { id: "m7", equipmentId: "EQ-005", service: "Check for leaks", frequency: "Weekly", lastDone: "Oct 24", nextDue: "Oct 31", cost: 0, assigned: "Self", status: "OK" },
  { id: "m8", equipmentId: "EQ-006", service: "Wash after use", frequency: "Every use", lastDone: "Last use Oct 20", nextDue: "Next use", cost: 0, assigned: "Self", status: "Every use" },
  { id: "m9", equipmentId: "EQ-006", service: "Replace seals", frequency: "Every 6 months", lastDone: "Jun 2026", nextDue: "Dec 2026", cost: 500, assigned: "Self", status: "Future" },
  { id: "m10", equipmentId: "EQ-012", service: "Clean panels", frequency: "Monthly", lastDone: "Oct 1", nextDue: "Nov 1", cost: 0, assigned: "Self", status: "Upcoming" },
  { id: "m11", equipmentId: "EQ-012", service: "Check connections", frequency: "Quarterly", lastDone: "Jul 2026", nextDue: "Oct 2026", cost: 0, assigned: "Self", status: "Overdue" },
  { id: "m12", equipmentId: "EQ-013", service: "General service", frequency: "Before harvest season", lastDone: "—", nextDue: "Dec 2026", cost: 3000, assigned: "Mechanic", status: "Future" },
];

export const MAINT_STATUS_TONE: Record<MaintStatus, "high" | "medium" | "low" | "neutral"> = {
  Overdue: "high",
  Upcoming: "medium",
  OK: "low",
  Future: "neutral",
  "Every use": "neutral",
};

/* ---------- 20.3 usage log + analytics ---------- */

export interface UsageRow {
  id: string;
  date: string;
  equipmentId: string;
  activity: string;
  hours: number;
  fuelL: number; // 0 = none
  operator: string;
  plot: string;
  notes: string;
}

export const USAGE_LOG: UsageRow[] = [
  { id: "u1", date: "Oct 20", equipmentId: "EQ-001", activity: "Ploughing Plot 2 (MF 35 + Disc plough)", hours: 3, fuelL: 15, operator: "James (hired operator)", plot: "Plot 2", notes: "2 passes" },
  { id: "u2", date: "Oct 21", equipmentId: "EQ-001", activity: "Harrowing Plot 2 (MF 35 + Harrow)", hours: 2, fuelL: 10, operator: "James (hired operator)", plot: "Plot 2", notes: "1 pass" },
  { id: "u3", date: "Oct 22", equipmentId: "EQ-001", activity: "Transport manure (MF 35 + Trailer)", hours: 1, fuelL: 5, operator: "James (hired operator)", plot: "Plot 1", notes: "3 trips from dairy farm" },
  { id: "u4", date: "Oct 24", equipmentId: "EQ-006", activity: "Spray Mancozeb on cabbage (Knapsack sprayer #1)", hours: 2, fuelL: 0, operator: "John Mwangi", plot: "Plot 1", notes: "Mixed 100L" },
  { id: "u5", date: "Oct 25", equipmentId: "EQ-007", activity: "Weeding cabbage (Hand hoes ×4)", hours: 8, fuelL: 0, operator: "Workers", plot: "Plot 1", notes: "—" },
];

export interface UsageAnalyticsRow {
  equipmentId: string;
  label: string;
  hoursMonth: string;
  hoursYear: string;
  fuelCost: number;
  fuelNote: string;
  maintCost: number;
  costHour: number;
  revenue: string;
}

export const USAGE_ANALYTICS: UsageAnalyticsRow[] = [
  { equipmentId: "EQ-001", label: "MF 35 Tractor", hoursMonth: "12", hoursYear: "85", fuelCost: 51000, fuelNote: "510 L × KES 100", maintCost: 15000, costHour: 776, revenue: "Ploughing services: KES 120,000" },
  { equipmentId: "EQ-005", label: "Drip kit", hoursMonth: "40 (irrigation)", hoursYear: "200", fuelCost: 0, fuelNote: "solar", maintCost: 2000, costHour: 10, revenue: "Irrigated crops: KES 400,000" },
  { equipmentId: "EQ-006", label: "Knapsack sprayers", hoursMonth: "15", hoursYear: "80", fuelCost: 0, fuelNote: "—", maintCost: 1000, costHour: 13, revenue: "— (support function)" },
];

/* ---------- 20.4 hire in / hire out ---------- */

export interface HireInRow {
  id: string;
  date: string;
  equipment: string;
  owner: string;
  ownerPhone: string;
  rate: string;
  duration: string;
  totalCost: number;
  purpose: string;
  paid: "M-Pesa" | "Pending" | "Cash";
}

export const HIRE_IN: HireInRow[] = [
  { id: "hi1", date: "Oct 15", equipment: "Tractor + rotavator", owner: "Kariuki Farms", ownerPhone: "0722 508 441", rate: "KES 4,500/acre", duration: "1 acre, 3 hrs", totalCost: 4500, purpose: "Land prep Plot 1", paid: "M-Pesa" },
  { id: "hi2", date: "Nov 5", equipment: "Sprayer boom (tractor-mounted)", owner: "AgriHire Kiambu", ownerPhone: "0711 260 903", rate: "KES 3,000/day", duration: "1 day", totalCost: 3000, purpose: "Spray cabbage", paid: "Pending" },
];

export interface HireOutRow {
  id: string;
  date: string;
  equipmentId: string;
  hirer: string;
  hirerPhone: string;
  rate: string;
  duration: string;
  income: number;
  paid: "M-Pesa" | "Cash" | "Family, no charge";
  status: "Completed" | "Pending" | "In progress";
}

export const HIRE_OUT: HireOutRow[] = [
  { id: "ho1", date: "Sep 10", equipmentId: "EQ-001", hirer: "Neighbor: Kamau", hirerPhone: "0733 902 118", rate: "KES 3,500/acre", duration: "2 acres, 5 hrs", income: 7000, paid: "Cash", status: "Completed" },
  { id: "ho2", date: "Sep 15", equipmentId: "EQ-004", hirer: "Githunguri School", hirerPhone: "0709 144 260", rate: "KES 2,000/hr", duration: "3 hrs", income: 6000, paid: "M-Pesa", status: "Completed" },
  { id: "ho3", date: "Oct 5", equipmentId: "EQ-004", hirer: "Mary's sister (Lucy)", hirerPhone: "0728 331 507", rate: "KES 1,500/trip", duration: "2 trips", income: 3000, paid: "Family, no charge", status: "Completed" },
];

export interface RateCardRow {
  id: string;
  equipmentId: string;
  label: string;
  rateType: string;
  rate: number;
  minHire: string;
  includes: string;
  location: string;
}

export const RATE_CARD: RateCardRow[] = [
  { id: "rc1", equipmentId: "EQ-001", label: "MF 35 Tractor", rateType: "Per hour", rate: 2000, minHire: "2 hours", includes: "Operator + fuel", location: "My farm or within 10 km" },
  { id: "rc2", equipmentId: "EQ-001", label: "MF 35 + Plough", rateType: "Per acre", rate: 3500, minHire: "0.5 acre", includes: "Operator + fuel", location: "Within 10 km" },
  { id: "rc3", equipmentId: "EQ-001", label: "MF 35 + Trailer", rateType: "Per trip", rate: 1500, minHire: "1 trip", includes: "Operator + fuel", location: "Within 10 km" },
  { id: "rc4", equipmentId: "EQ-004", label: "Trailer only", rateType: "Per day", rate: 1000, minHire: "1 day", includes: "—", location: "Self-collect" },
  { id: "rc5", equipmentId: "EQ-006", label: "Knapsack sprayer", rateType: "Per day", rate: 200, minHire: "1 day", includes: "—", location: "Self-collect" },
  { id: "rc6", equipmentId: "EQ-005", label: "Drip kit (1 acre)", rateType: "Per season", rate: 5000, minHire: "1 season", includes: "Installation + removal", location: "My farm only" },
];

/* ---------- 20.5 fuel & energy ---------- */

export interface FuelRow {
  id: string;
  date: string;
  fuelType: string;
  litres: number;
  pricePerL: number;
  total: number;
  equipmentId: string;
  receipt: string;
}

export const FUEL_LOG: FuelRow[] = [
  { id: "f1", date: "Oct 20", fuelType: "Diesel", litres: 20, pricePerL: 195, total: 3900, equipmentId: "EQ-001", receipt: "Receipt photographed" },
  { id: "f2", date: "Oct 21", fuelType: "Diesel", litres: 10, pricePerL: 195, total: 1950, equipmentId: "EQ-001", receipt: "—" },
  { id: "f3", date: "Oct 22", fuelType: "Diesel", litres: 5, pricePerL: 195, total: 975, equipmentId: "EQ-001", receipt: "—" },
];

export const FUEL_MONTH_TOTAL = { litres: 35, total: 6825, month: "October" };

export interface FuelEffRow {
  period: string;
  litres: number;
  hours: number;
  lph: string;
  costPerHour: number;
  vsStd: string;
  tone: "high" | "medium" | "low";
}

export const FUEL_EFFICIENCY: FuelEffRow[] = [
  { period: "September", litres: 48, hours: 9, lph: "5.33", costPerHour: 1064, vsStd: "7% above — within tolerance", tone: "medium" },
  { period: "October", litres: 35, hours: 6, lph: "5.83", costPerHour: 1138, vsStd: "17% above normal — check engine", tone: "high" },
];

/* ---------- 20.6 depreciation & asset valuation ---------- */

export interface DepRow {
  equipmentId: string;
  name: string;
  purchasePrice: number;
  purchaseDate: string;
  usefulLife: number;
  annualDep: number;
  ageYears: string;
  marketValue: number;
  bookValue: number;
}

export const DEPRECIATION: DepRow[] = [
  { equipmentId: "EQ-001", name: "MF 35 Tractor", purchasePrice: 450000, purchaseDate: "Mar 2020", usefulLife: 15, annualDep: 30000, ageYears: "6.5", marketValue: 350000, bookValue: 255000 },
  { equipmentId: "EQ-002", name: "Disc plough", purchasePrice: 60000, purchaseDate: "Mar 2020", usefulLife: 10, annualDep: 6000, ageYears: "6.5", marketValue: 45000, bookValue: 21000 },
  { equipmentId: "EQ-010", name: "Greenhouse", purchasePrice: 250000, purchaseDate: "Jun 2023", usefulLife: 8, annualDep: 31250, ageYears: "3.3", marketValue: 200000, bookValue: 146875 },
  { equipmentId: "EQ-012", name: "Solar pump", purchasePrice: 45000, purchaseDate: "Jan 2024", usefulLife: 10, annualDep: 4500, ageYears: "2.8", marketValue: 40000, bookValue: 32400 },
];

/* ---------- marketplace listings (20.4 publish) ---------- */

export interface MarketListing {
  id: string;
  equipmentId: string;
  title: string;
  rate: string;
  listed: string;
  status: "Active" | "Paused";
  views: number;
  bookings: number;
  photo: string;
}

export const MARKET_LISTINGS: MarketListing[] = [
  {
    id: "ML-01", equipmentId: "EQ-001", title: "MF 35 + 3-disc plough — ploughing by the acre",
    rate: "KES 3,500/acre · operator + fuel", listed: "02/10/2026", status: "Active",
    views: 14, bookings: 2, photo: "MF 35 with plough, Kariuki road",
  },
];

/* ---------- page alerts ---------- */

export const MACH_ALERTS = [
  { id: "ma1", tone: "warn" as const, text: "3 maintenance tasks overdue — MF 35 oil change (2,000 hrs), disc plough bearings, solar pump connections. Do them before the December ploughing." },
  { id: "ma2", tone: "warn" as const, text: "October fuel running 17% above the 5 L/hr standard (5.83 L/hr, KES 1,138/hr) — have the engine checked at the local mechanic." },
  { id: "ma3", tone: "info" as const, text: "Sprayer boom hire-out (AgriHire Kiambu, 05/11) — KES 3,000 still pending. Call 0711 260 903 to collect." },
  { id: "ma4", tone: "success" as const, text: "MF 35 + plough listed on the GrowMO marketplace since 02/10 — 14 views, 2 bookings this season (KES 13,000 earned)." },
];
