/* ============================================================================
   PAGE 25 — SEEDS & SEEDLING NURSERY MANAGEMENT
   Kenyan seed, nursery, germination and direct-planting demo records.
   ========================================================================== */

export type StockStatus =
  | "Good"
  | "Check germination"
  | "Plant urgently"
  | "Low stock";
export type NurseryStatus =
  | "Sowing"
  | "Germinating"
  | "Growing"
  | "Hardening"
  | "Ready"
  | "Transplanted";
export type HealthLevel = "Good" | "Watch" | "Action needed";

export const NURSERY_CONTEXT = {
  farm: "Mary's Farm",
  county: "Kiambu",
  ward: "Githunguri",
  activeNursery: "NUR-2026-003",
  crop: "Cabbage Gloria F1",
  seedlingsReady: 3200,
  readiness: 100,
  nextTransplant: "20 Oct 2026",
  germination: 85,
};

export interface PropagationMethod {
  id: string;
  crop: string;
  method: string;
  material: string;
  detail: string;
}

export const PROPAGATION_METHODS: PropagationMethod[] = [
  {
    id: "PRO-001",
    crop: "H6213 maize",
    method: "Direct seed",
    material: "Certified seed",
    detail: "Plant directly in field at onset of rains.",
  },
  {
    id: "PRO-002",
    crop: "Rosecoco beans",
    method: "Direct seed",
    material: "Certified seed",
    detail: "Plant directly in field; no nursery needed.",
  },
  {
    id: "PRO-003",
    crop: "Sorghum / millet",
    method: "Direct seed",
    material: "Certified seed",
    detail: "Direct sowing works well in drier zones.",
  },
  {
    id: "PRO-004",
    crop: "Cabbage Gloria F1",
    method: "Nursery → transplant",
    material: "Seed → seedling",
    detail: "Raise for four to five weeks, then transplant.",
  },
  {
    id: "PRO-005",
    crop: "Tomato Kilele F1",
    method: "Nursery → transplant",
    material: "Seed → seedling",
    detail: "Five to six-week nursery; can also buy certified seedlings.",
  },
  {
    id: "PRO-006",
    crop: "Red Creole onion",
    method: "Nursery → transplant",
    material: "Seed → seedling",
    detail: "Six to eight-week nursery before field establishment.",
  },
  {
    id: "PRO-007",
    crop: "Capsicum California Wonder",
    method: "Nursery → transplant",
    material: "Seed → seedling",
    detail: "Six to seven-week nursery under good pest protection.",
  },
  {
    id: "PRO-008",
    crop: "Potato Shangi",
    method: "Seed tuber",
    material: "Tuber piece",
    detail: "Plant tuber pieces with two to three healthy eyes.",
  },
  {
    id: "PRO-009",
    crop: "Sweet potato Kembu 10",
    method: "Vine cutting / slips",
    material: "30 cm vine cutting",
    detail: "Cut from a clean mother plot and plant directly.",
  },
  {
    id: "PRO-010",
    crop: "Cassava MM96/4271",
    method: "Stem cutting",
    material: "Mature 20–30 cm stem",
    detail: "Plant directly at the start of rains.",
  },
  {
    id: "PRO-011",
    crop: "Sugarcane",
    method: "Sett",
    material: "Three-bud stem sett",
    detail: "Set directly in furrows.",
  },
  {
    id: "PRO-012",
    crop: "Banana Williams",
    method: "Sucker",
    material: "Sword or maiden sucker",
    detail: "Transplant from a clean mother plant.",
  },
  {
    id: "PRO-013",
    crop: "Hass avocado",
    method: "Grafted seedling",
    material: "Certified grafted seedling",
    detail: "Buy from a registered nursery.",
  },
  {
    id: "PRO-014",
    crop: "Apple mango",
    method: "Grafted seedling",
    material: "Certified grafted seedling",
    detail: "Buy disease-free grafted stock.",
  },
  {
    id: "PRO-015",
    crop: "Napier grass",
    method: "Root split / cane cutting",
    material: "Root split or stem",
    detail: "Plant directly with reliable moisture.",
  },
  {
    id: "PRO-016",
    crop: "Pineapple",
    method: "Sucker / slip / crown",
    material: "Vegetative material",
    detail: "Direct planting after curing material.",
  },
  {
    id: "PRO-017",
    crop: "Coffee Ruiru 11",
    method: "Nursery seedling",
    material: "Seed → seedling",
    detail: "Eight to twelve-month nursery; usually bought.",
  },
  {
    id: "PRO-018",
    crop: "Tea TRFK 31/8",
    method: "Seedling / cutting",
    material: "Seed or cutting",
    detail: "Ten to twelve-month nursery period.",
  },
  {
    id: "PRO-019",
    crop: "Tree tomato",
    method: "Seedling",
    material: "Seed → seedling",
    detail: "Six to eight-week nursery before transplanting.",
  },
];

export interface SeedStock {
  id: string;
  seed: string;
  variety: string;
  company: string;
  lot: string;
  quantity: string;
  bought: string;
  germination: string;
  expiry: string;
  storage: string;
  status: StockStatus;
  value: number;
}

export const SEED_STOCK: SeedStock[] = [
  {
    id: "SED-001",
    seed: "Cabbage",
    variety: "Gloria F1",
    company: "Simlaw",
    lot: "SF-2026-06",
    quantity: "100 g",
    bought: "Sep 2026",
    germination: "92% tested",
    expiry: "Dec 2027",
    storage: "Cool, dry, airtight",
    status: "Good",
    value: 6800,
  },
  {
    id: "SED-002",
    seed: "Tomato",
    variety: "Kilele F1",
    company: "Simlaw",
    lot: "SF-2026-08",
    quantity: "20 g",
    bought: "Oct 2026",
    germination: "Not tested",
    expiry: "Mar 2028",
    storage: "Cool, dry, airtight",
    status: "Good",
    value: 4200,
  },
  {
    id: "SED-003",
    seed: "Maize",
    variety: "H6213",
    company: "Kenya Seed",
    lot: "KS-2026-03",
    quantity: "5 kg",
    bought: "Feb 2026",
    germination: "90% certified",
    expiry: "Feb 2028",
    storage: "Dry, above ground",
    status: "Good",
    value: 1800,
  },
  {
    id: "SED-004",
    seed: "Bean",
    variety: "Rosecoco",
    company: "Kenya Seed",
    lot: "KS-2025-09",
    quantity: "3 kg",
    bought: "Sep 2025",
    germination: "85% estimated",
    expiry: "Sep 2027",
    storage: "Dry, above ground",
    status: "Check germination",
    value: 750,
  },
  {
    id: "SED-005",
    seed: "Sukuma Wiki",
    variety: "Thousand Headed",
    company: "Local seed supplier",
    lot: "—",
    quantity: "200 g",
    bought: "Aug 2026",
    germination: "Not tested",
    expiry: "Aug 2028",
    storage: "Room temperature",
    status: "Good",
    value: 900,
  },
  {
    id: "SED-006",
    seed: "Onion",
    variety: "Red Creole",
    company: "Simlaw",
    lot: "SF-2026-04",
    quantity: "50 g",
    bought: "Jun 2026",
    germination: "88% tested",
    expiry: "Jun 2028",
    storage: "Cool, dry",
    status: "Good",
    value: 1600,
  },
  {
    id: "SED-007",
    seed: "Potato seed",
    variety: "Shangi",
    company: "Local farmer",
    lot: "—",
    quantity: "200 kg",
    bought: "Sep 2026",
    germination: "Check sprouting",
    expiry: "Plant seasonally",
    storage: "Cool, dark, ventilated",
    status: "Check germination",
    value: 10000,
  },
  {
    id: "SED-008",
    seed: "Sweet potato vine",
    variety: "Kembu 10",
    company: "KALRO",
    lot: "—",
    quantity: "2,000 cuttings",
    bought: "Oct 2026",
    germination: "Plant within 3 days",
    expiry: "48–72 hours",
    storage: "Shade and moist",
    status: "Plant urgently",
    value: 6000,
  },
  {
    id: "SED-009",
    seed: "Capsicum",
    variety: "California Wonder",
    company: "Simlaw",
    lot: "SF-2026-11",
    quantity: "15 g",
    bought: "Nov 2026",
    germination: "91% certified",
    expiry: "Nov 2028",
    storage: "Cool, dry, airtight",
    status: "Good",
    value: 2700,
  },
  {
    id: "SED-010",
    seed: "French beans",
    variety: "Amy",
    company: "Amiran",
    lot: "AM-2026-17",
    quantity: "1 kg",
    bought: "Jul 2026",
    germination: "87% tested",
    expiry: "Jul 2027",
    storage: "Hermetic bag",
    status: "Low stock",
    value: 3200,
  },
];

export const SEED_STORAGE_GUIDES = [
  {
    id: "SG-001",
    crop: "Vegetable seeds",
    temperature: "10–15°C",
    humidity: "30–40%",
    container: "Airtight jar with desiccant",
    life: "2–3 years",
  },
  {
    id: "SG-002",
    crop: "Maize seed",
    temperature: "10–15°C",
    humidity: "Below 40%",
    container: "Hermetic or airtight bag",
    life: "1–2 years",
  },
  {
    id: "SG-003",
    crop: "Bean seed",
    temperature: "10–15°C",
    humidity: "Below 40%",
    container: "Hermetic bag",
    life: "1–2 years",
  },
  {
    id: "SG-004",
    crop: "Potato tubers",
    temperature: "3–5°C",
    humidity: "85–90%",
    container: "Dark, ventilated stack",
    life: "4–6 months",
  },
  {
    id: "SG-005",
    crop: "Sweet potato vines",
    temperature: "Not storable",
    humidity: "Keep moist",
    container: "Shade; plant fast",
    life: "48–72 hours",
  },
];

export interface NurseryRecord {
  id: string;
  crop: string;
  variety: string;
  seedLot: string;
  sown: string;
  target: number;
  ready: number;
  sowingDate: string;
  transplantDate: string;
  location: string;
  type: string;
  status: NurseryStatus;
  assigned: string;
}

export const NURSERY_RECORDS: NurseryRecord[] = [
  {
    id: "NUR-2026-003",
    crop: "Cabbage",
    variety: "Gloria F1",
    seedLot: "SF-2026-06",
    sown: "8 g",
    target: 3500,
    ready: 3200,
    sowingDate: "20 Sep 2026",
    transplantDate: "20 Oct 2026",
    location: "Near house · partial shade",
    type: "Raised bed",
    status: "Ready",
    assigned: "Mary Wanjiku",
  },
  {
    id: "NUR-2026-004",
    crop: "Tomato",
    variety: "Kilele F1",
    seedLot: "SF-2026-08",
    sown: "5 g",
    target: 2200,
    ready: 1810,
    sowingDate: "05 Oct 2026",
    transplantDate: "10 Nov 2026",
    location: "Net house",
    type: "Seedling tray",
    status: "Growing",
    assigned: "Peter Kamau",
  },
  {
    id: "NUR-2026-005",
    crop: "Onion",
    variety: "Red Creole",
    seedLot: "SF-2026-04",
    sown: "12 g",
    target: 4500,
    ready: 0,
    sowingDate: "12 Oct 2026",
    transplantDate: "05 Dec 2026",
    location: "Near house · partial shade",
    type: "Raised bed",
    status: "Germinating",
    assigned: "Mary Wanjiku",
  },
  {
    id: "NUR-2026-006",
    crop: "Capsicum",
    variety: "California Wonder",
    seedLot: "SF-2026-11",
    sown: "4 g",
    target: 1200,
    ready: 0,
    sowingDate: "18 Oct 2026",
    transplantDate: "01 Dec 2026",
    location: "Net house",
    type: "Seedling tray",
    status: "Sowing",
    assigned: "Grace Wanjiku",
  },
];

export const CABBAGE_NURSERY_SETUP = [
  ["Crop & variety", "Cabbage · Gloria F1"],
  ["Seed lot", "SF-2026-06 · 8 g sown"],
  ["Target seedlings", "3,500 for 0.52 acres at about 6,700 plants/acre"],
  ["Expected germination", "25–27 Sep · 5–7 days"],
  ["Expected transplant", "20–22 Oct · 30 days"],
  ["Nursery location", "Near house, partial shade"],
  ["Bed / mix", "4 m × 1 m × 15 cm; loam : compost : sand 1:1:1"],
  ["Nutrition", "DAP 50 g mixed into bed"],
  ["Water and shade", "Light mist twice daily; 50% shade net"],
  ["Pest protection", "Fine net to exclude diamondback moth"],
];

export interface GerminationObservation {
  id: string;
  day: string;
  date: string;
  activity: string;
  observation: string;
  photo: string;
  action: string;
  status: "Done" | "Current" | "Upcoming";
}

export const GERMINATION_LOG: GerminationObservation[] = [
  {
    id: "GER-001",
    day: "Day 0",
    date: "20 Sep",
    activity: "Sowing",
    observation:
      "8 g seed in drills, 5 cm apart, 1 cm deep and lightly covered",
    photo: "Sowing bed",
    action: "Watered well",
    status: "Done",
  },
  {
    id: "GER-002",
    day: "Day 1–4",
    date: "21–24 Sep",
    activity: "Watering",
    observation: "Kept moist; no emergence yet",
    photo: "—",
    action: "Continue light watering",
    status: "Done",
  },
  {
    id: "GER-003",
    day: "Day 5",
    date: "25 Sep",
    activity: "First emergence",
    observation: "About 30% germinated; small green loops visible",
    photo: "Emergence check",
    action: "Remove shade briefly for light",
    status: "Done",
  },
  {
    id: "GER-004",
    day: "Day 7",
    date: "27 Sep",
    activity: "Germination assessment",
    observation: "About 85%; estimated 3,400 seedlings",
    photo: "Germination count",
    action: "Above 80% threshold",
    status: "Done",
  },
  {
    id: "GER-005",
    day: "Day 10",
    date: "30 Sep",
    activity: "Thinning",
    observation: "Weak and double seedlings removed; about 3,200 remain",
    photo: "—",
    action: "Set spacing to 5 cm × 5 cm",
    status: "Done",
  },
  {
    id: "GER-006",
    day: "Day 14",
    date: "04 Oct",
    activity: "First true leaves",
    observation: "Two true leaves; seedlings 3–4 cm tall",
    photo: "Leaf stage",
    action: "Start light DAP solution",
    status: "Done",
  },
  {
    id: "GER-007",
    day: "Day 21",
    date: "11 Oct",
    activity: "Three to four true leaves",
    observation: "Seedlings 6–8 cm with sturdy stems",
    photo: "Canopy check",
    action: "Reduce shade to 30%",
    status: "Done",
  },
  {
    id: "GER-008",
    day: "Day 28",
    date: "18 Oct",
    activity: "Hardening off",
    observation: "Remove shade entirely and reduce water",
    photo: "Hardening bed",
    action: "Prepare for transplant stress",
    status: "Current",
  },
  {
    id: "GER-009",
    day: "Day 30",
    date: "20 Oct",
    activity: "Transplanting ready",
    observation: "10–12 cm; four to five true leaves and thick stems",
    photo: "Ready seedlings",
    action: "Ready to transplant",
    status: "Upcoming",
  },
];

export const GERMINATION_METRICS = [
  {
    label: "Seeds sown",
    value: "~1,600",
    note: "8 g × about 200 cabbage seeds per gram",
  },
  {
    label: "Seeds germinated",
    value: "~1,360",
    note: "85% observed germination",
  },
  {
    label: "Seedlings after thinning",
    value: "3,200",
    note: "Two trays / bed groups combined",
  },
  {
    label: "Industry standard",
    value: "80%+",
    note: "Certified seed threshold",
  },
];

export const SEEDLING_HEALTH = [
  {
    id: "HLT-001",
    issue: "Damping off",
    symptoms: "Seedlings collapse at the base, water-soaked",
    cause: "Pythium or Rhizoctonia fungus",
    treatment: "Remove affected; apply labelled copper fungicide",
    prevention: "Sterilise mix, drain well, avoid overwatering",
    level: "Good" as HealthLevel,
  },
  {
    id: "HLT-002",
    issue: "Curling / yellowing",
    symptoms: "Leaves curl and turn yellow",
    cause: "Nutrient deficiency or overwatering",
    treatment: "Reduce water; apply dilute liquid fertilizer",
    prevention: "Balanced watering",
    level: "Good" as HealthLevel,
  },
  {
    id: "HLT-003",
    issue: "Leggy seedlings",
    symptoms: "Tall, thin, weak stems",
    cause: "Low light or crowding",
    treatment: "Increase light and reduce shade",
    prevention: "Proper spacing and adequate light",
    level: "Watch" as HealthLevel,
  },
  {
    id: "HLT-004",
    issue: "Cutworm damage",
    symptoms: "Seedlings cut at base",
    cause: "Cutworm caterpillars",
    treatment: "Dust ash/sand around stems; use approved control",
    prevention: "Clean bed and remove debris",
    level: "Good" as HealthLevel,
  },
  {
    id: "HLT-005",
    issue: "Aphids",
    symptoms: "Green insects under leaves",
    cause: "Aphid infestation",
    treatment: "Soap spray or labelled Imidacloprid",
    prevention: "Netting and regular inspection",
    level: "Good" as HealthLevel,
  },
  {
    id: "HLT-006",
    issue: "Fungal spots",
    symptoms: "White or grey spots on leaves",
    cause: "Fungal infection",
    treatment: "Remove leaves; apply labelled Mancozeb",
    prevention: "Airflow, no overhead watering",
    level: "Watch" as HealthLevel,
  },
];

export const TRANSPLANT_READINESS = [
  {
    id: "RDY-001",
    criteria: "Seedling height",
    required: "10–15 cm",
    actual: "12 cm",
    pass: "Pass",
  },
  {
    id: "RDY-002",
    criteria: "True leaves",
    required: "4–5",
    actual: "5",
    pass: "Pass",
  },
  {
    id: "RDY-003",
    criteria: "Stem thickness",
    required: "Pencil-thick and sturdy",
    actual: "Sturdy",
    pass: "Pass",
  },
  {
    id: "RDY-004",
    criteria: "Root system",
    required: "Well developed, not root-bound",
    actual: "Good",
    pass: "Pass",
  },
  {
    id: "RDY-005",
    criteria: "Colour",
    required: "Dark green and healthy",
    actual: "Dark green",
    pass: "Pass",
  },
  {
    id: "RDY-006",
    criteria: "Hardening off",
    required: "3–5 days without shade",
    actual: "3 days done",
    pass: "Pass",
  },
  {
    id: "RDY-007",
    criteria: "Field readiness",
    required: "Beds, manure and DAP ready",
    actual: "Ready",
    pass: "Pass",
  },
  {
    id: "RDY-008",
    criteria: "Weather",
    required: "No extreme heat; rain within 2 days",
    actual: "Light rain forecast",
    pass: "Pass",
  },
  {
    id: "RDY-009",
    criteria: "Labour arranged",
    required: "Five workers confirmed",
    actual: "Confirmed",
    pass: "Pass",
  },
];

export interface SeedlingPurchase {
  id: string;
  date: string;
  nursery: string;
  crop: string;
  quantity: string;
  unitPrice: number;
  total: number;
  verified: boolean;
  quality: string;
  status: "Received" | "Planned" | "Paid";
}

export const SEEDLING_PURCHASES: SeedlingPurchase[] = [
  {
    id: "PUR-001",
    date: "05 Oct 2026",
    nursery: "Githunguri Nurseries",
    crop: "Tomato Kilele F1",
    quantity: "2,000 seedlings",
    unitPrice: 5,
    total: 10000,
    verified: true,
    quality: "Healthy, 15 cm tall",
    status: "Paid",
  },
  {
    id: "PUR-002",
    date: "10 Mar 2027",
    nursery: "KALRO Tigoni",
    crop: "Potato seed Shangi",
    quantity: "200 kg",
    unitPrice: 50,
    total: 10000,
    verified: true,
    quality: "Good sprouting, no disease",
    status: "Planned",
  },
  {
    id: "PUR-003",
    date: "12 Nov 2026",
    nursery: "Thika Seedlings Centre",
    crop: "Capsicum California Wonder",
    quantity: "1,200 seedlings",
    unitPrice: 8,
    total: 9600,
    verified: true,
    quality: "Uniform, hardened seedlings",
    status: "Received",
  },
  {
    id: "PUR-004",
    date: "06 Feb 2027",
    nursery: "KALRO Muguga",
    crop: "Hass avocado",
    quantity: "40 grafted seedlings",
    unitPrice: 350,
    total: 14000,
    verified: true,
    quality: "Grafted, labelled and pest free",
    status: "Planned",
  },
  {
    id: "PUR-005",
    date: "18 Sep 2026",
    nursery: "Kiambu Horticulture Hub",
    crop: "Red Creole onion",
    quantity: "4,500 seedlings",
    unitPrice: 2,
    total: 9000,
    verified: true,
    quality: "Firm, 12 cm tall",
    status: "Paid",
  },
  {
    id: "PUR-006",
    date: "16 Oct 2026",
    nursery: "Githunguri Nurseries",
    crop: "Tree tomato",
    quantity: "80 seedlings",
    unitPrice: 65,
    total: 5200,
    verified: false,
    quality: "Verification requested",
    status: "Planned",
  },
  {
    id: "PUR-007",
    date: "22 Oct 2026",
    nursery: "KALRO Tigoni",
    crop: "Sweet potato Kembu 10",
    quantity: "2,000 cuttings",
    unitPrice: 3,
    total: 6000,
    verified: true,
    quality: "Fresh vines, moist bundles",
    status: "Paid",
  },
  {
    id: "PUR-008",
    date: "03 Nov 2026",
    nursery: "Murang'a Fruit Trees",
    crop: "Apple mango",
    quantity: "25 grafted seedlings",
    unitPrice: 280,
    total: 7000,
    verified: true,
    quality: "Certified graft union",
    status: "Received",
  },
  {
    id: "PUR-009",
    date: "15 Jan 2027",
    nursery: "Limuru Coffee Growers",
    crop: "Coffee Ruiru 11",
    quantity: "150 seedlings",
    unitPrice: 45,
    total: 6750,
    verified: true,
    quality: "Robust rooted seedlings",
    status: "Planned",
  },
  {
    id: "PUR-010",
    date: "28 Sep 2026",
    nursery: "Kikuyu Agro Nursery",
    crop: "Napier grass",
    quantity: "500 root splits",
    unitPrice: 8,
    total: 4000,
    verified: true,
    quality: "Fresh clean root splits",
    status: "Received",
  },
];

export const DIRECT_PLANTING = {
  crop: "H6213 maize",
  plot: "Plot 2 · 2 acres",
  method: "Direct seed",
  seedRate: "25 kg/acre · 50 kg total",
  depth: "5 cm",
  spacing: "75 cm between rows × 25 cm within row",
  seedsPerHole: "2; thin to 1 after germination",
  target: "53,333 plants/acre",
  fertilizer: "DAP 50 kg/acre in planting hole",
  date: "15 Oct 2026",
  expected: "22–24 Oct · 7 days",
  thinning: "01 Nov 2026",
  assessment: "Count plants in three 10 m sample rows",
};

export const EMERGENCE_SAMPLES = [
  {
    id: "EMR-001",
    row: "Row 1",
    length: "10 m",
    expected: 133,
    actual: 120,
    rate: "90%",
  },
  {
    id: "EMR-002",
    row: "Row 2",
    length: "10 m",
    expected: 133,
    actual: 128,
    rate: "96%",
  },
  {
    id: "EMR-003",
    row: "Row 3",
    length: "10 m",
    expected: 133,
    actual: 115,
    rate: "86%",
  },
];

export const SEED_PERFORMANCE = [
  {
    id: "PER-001",
    seed: "Cabbage",
    variety: "Gloria F1",
    season: "SR 2026",
    germination: "85%",
    emergence: "92%",
    yield: "14,500 heads/acre",
    rating: 4,
  },
  {
    id: "PER-002",
    seed: "Cabbage",
    variety: "Gloria F1",
    season: "SR 2025",
    germination: "88%",
    emergence: "90%",
    yield: "15,200 heads/acre",
    rating: 4,
  },
  {
    id: "PER-003",
    seed: "Cabbage",
    variety: "Copenhagen OP",
    season: "SR 2024",
    germination: "75%",
    emergence: "80%",
    yield: "11,000 heads/acre",
    rating: 2,
  },
  {
    id: "PER-004",
    seed: "Maize",
    variety: "H6213",
    season: "SR 2026",
    germination: "90% certified",
    emergence: "91%",
    yield: "22 bags/acre",
    rating: 4,
  },
  {
    id: "PER-005",
    seed: "Maize",
    variety: "SC Duma 43",
    season: "LR 2025",
    germination: "92% certified",
    emergence: "88%",
    yield: "18 bags/acre",
    rating: 3,
  },
  {
    id: "PER-006",
    seed: "Tomato",
    variety: "Kilele F1",
    season: "SR 2026",
    germination: "95% purchased",
    emergence: "—",
    yield: "18 tonnes/acre",
    rating: 5,
  },
];

export function stockTone(
  status: StockStatus,
): "low" | "medium" | "high" | "neutral" {
  if (status === "Good") return "low";
  if (status === "Plant urgently") return "high";
  if (status === "Check germination") return "medium";
  return "neutral";
}

export function nurseryTone(
  status: NurseryStatus,
): "low" | "medium" | "neutral" {
  if (status === "Ready" || status === "Transplanted") return "low";
  if (status === "Hardening" || status === "Growing") return "medium";
  return "neutral";
}

export function healthTone(level: HealthLevel): "low" | "medium" | "high" {
  if (level === "Good") return "low";
  if (level === "Watch") return "medium";
  return "high";
}
