/* ============================================================================
   PAGE 24 — POST-HARVEST HANDLING & STORAGE
   Kenyan crop-specific harvest, grading, packing and storage demo records.
   ========================================================================== */

export type HarvestStatus = "Recorded" | "Ready to grade" | "Stored" | "Sold";
export type StorageStatus = "Available" | "Full" | "Unavailable";
export type ConditionStatus = "Good" | "Watch" | "Urgent";

export const HARVEST_CONTEXT = {
  farm: "Mary's Farm",
  county: "Kiambu",
  ward: "Githunguri",
  activeHarvest: "Cabbage Gloria F1",
  totalHarvested: 14500,
  gradeA: 10000,
  storedValue: 338700,
  lossRate: 8,
  lossValue: 28740,
};

export interface CropUnit {
  id: string;
  crop: string;
  primary: string;
  secondary: string;
  tertiary: string;
  pack: string;
}

export const CROP_UNITS: CropUnit[] = [
  {
    id: "UNT-001",
    crop: "Maize",
    primary: "90 kg bag",
    secondary: "50 kg bag",
    tertiary: "Kilogram",
    pack: "90 kg or 50 kg bag",
  },
  {
    id: "UNT-002",
    crop: "Rosecoco beans",
    primary: "90 kg bag",
    secondary: "50 kg bag",
    tertiary: "Kilogram",
    pack: "90 kg bag or 2 kg packet",
  },
  {
    id: "UNT-003",
    crop: "Cabbage Gloria F1",
    primary: "Head",
    secondary: "Crate · 30 heads",
    tertiary: "Kilogram",
    pack: "Crate of 30 or loose",
  },
  {
    id: "UNT-004",
    crop: "Tomato Anna F1",
    primary: "64 kg crate",
    secondary: "Kilogram",
    tertiary: "5 kg box",
    pack: "64 kg wooden crate / 5 kg box",
  },
  {
    id: "UNT-005",
    crop: "Potato Shangi",
    primary: "50 kg bag",
    secondary: "Kilogram",
    tertiary: "Crate",
    pack: "50 kg bag / 10 kg pocket",
  },
  {
    id: "UNT-006",
    crop: "Sukuma Wiki",
    primary: "Bundle",
    secondary: "Crate · 50 bundles",
    tertiary: "Kilogram",
    pack: "50-bundle crate",
  },
  {
    id: "UNT-007",
    crop: "Red Creole onion",
    primary: "50 kg bag",
    secondary: "Kilogram",
    tertiary: "Crate",
    pack: "50 kg bag / 13 kg pocket",
  },
  {
    id: "UNT-008",
    crop: "Sugarcane",
    primary: "Tonne",
    secondary: "Kilogram",
    tertiary: "10 kg bundle",
    pack: "10–30 tonne truckload",
  },
  {
    id: "UNT-009",
    crop: "Hass avocado",
    primary: "Piece",
    secondary: "4 kg box",
    tertiary: "Kilogram",
    pack: "4 kg export box / 10 kg crate",
  },
  {
    id: "UNT-010",
    crop: "French beans",
    primary: "Kilogram",
    secondary: "3 kg box",
    tertiary: "Tonne",
    pack: "3 kg export carton",
  },
  {
    id: "UNT-011",
    crop: "Watermelon",
    primary: "Piece",
    secondary: "Kilogram",
    tertiary: "30 kg crate",
    pack: "Loose / 30 kg crate",
  },
  {
    id: "UNT-012",
    crop: "Carrot",
    primary: "50 kg bag",
    secondary: "Kilogram",
    tertiary: "Crate",
    pack: "50 kg bag / 10 kg pocket",
  },
  {
    id: "UNT-013",
    crop: "Rice paddy",
    primary: "50 kg bag",
    secondary: "90 kg bag",
    tertiary: "Kilogram",
    pack: "50 kg bag",
  },
  {
    id: "UNT-014",
    crop: "Coffee cherry",
    primary: "Kilogram",
    secondary: "Tonne",
    tertiary: "Bag",
    pack: "50 kg bag",
  },
  {
    id: "UNT-015",
    crop: "Tea green leaf",
    primary: "Kilogram",
    secondary: "Tonne",
    tertiary: "Bag",
    pack: "As plucked · kilogram",
  },
];

export interface HarvestRecord {
  id: string;
  date: string;
  crop: string;
  plot: string;
  quantity: string;
  weight: string;
  gradeA: string;
  yield: string;
  crew: string;
  status: HarvestStatus;
  value: number;
}

export const HARVEST_RECORDS: HarvestRecord[] = [
  {
    id: "HRV-001",
    date: "15 Jan 2027",
    crop: "Cabbage Gloria F1",
    plot: "Plot 1 · 0.52 acres",
    quantity: "14,500 heads",
    weight: "24.9 tonnes",
    gradeA: "10,000 heads",
    yield: "27,885 heads/acre",
    crew: "6 workers",
    status: "Stored",
    value: 435000,
  },
  {
    id: "HRV-002",
    date: "12 Jan 2027",
    crop: "Sukuma Wiki",
    plot: "Plot 3 · 0.30 acres",
    quantity: "1,800 bundles",
    weight: "1.1 tonnes",
    gradeA: "1,420 bundles",
    yield: "6,000 bundles/acre",
    crew: "3 workers",
    status: "Sold",
    value: 64800,
  },
  {
    id: "HRV-003",
    date: "08 Jan 2027",
    crop: "Tomato Anna F1",
    plot: "Leased tunnel · 0.20 acres",
    quantity: "42 crates",
    weight: "1.9 tonnes",
    gradeA: "27 crates",
    yield: "9.5 tonnes/acre",
    crew: "4 workers",
    status: "Sold",
    value: 171000,
  },
  {
    id: "HRV-004",
    date: "22 Dec 2026",
    crop: "H6213 maize",
    plot: "Plot 2 · 2.0 acres",
    quantity: "49 bags",
    weight: "4.41 tonnes",
    gradeA: "44 bags",
    yield: "24.5 bags/acre",
    crew: "5 workers",
    status: "Stored",
    value: 220500,
  },
  {
    id: "HRV-005",
    date: "18 Dec 2026",
    crop: "Rosecoco beans",
    plot: "Plot 1 · 0.52 acres",
    quantity: "8 bags",
    weight: "720 kg",
    gradeA: "6 bags",
    yield: "1,385 kg/acre",
    crew: "3 workers",
    status: "Stored",
    value: 93600,
  },
  {
    id: "HRV-006",
    date: "10 Dec 2026",
    crop: "Potato Shangi",
    plot: "Kiganjo lease · 0.75 acres",
    quantity: "56 bags",
    weight: "2.8 tonnes",
    gradeA: "39 bags",
    yield: "74.7 bags/acre",
    crew: "7 workers",
    status: "Sold",
    value: 196000,
  },
  {
    id: "HRV-007",
    date: "28 Nov 2026",
    crop: "Red Creole onion",
    plot: "Kitchen edge · 0.15 acres",
    quantity: "9 bags",
    weight: "450 kg",
    gradeA: "7 bags",
    yield: "3 tonnes/acre",
    crew: "3 workers",
    status: "Sold",
    value: 54000,
  },
  {
    id: "HRV-008",
    date: "19 Nov 2026",
    crop: "French beans",
    plot: "Plot 3 · 0.12 acres",
    quantity: "680 kg",
    weight: "680 kg",
    gradeA: "520 kg",
    yield: "5.7 tonnes/acre",
    crew: "5 workers",
    status: "Ready to grade",
    value: 102000,
  },
  {
    id: "HRV-009",
    date: "04 Nov 2026",
    crop: "Hass avocado",
    plot: "Homestead trees",
    quantity: "1,200 fruits",
    weight: "2.1 tonnes",
    gradeA: "860 fruits",
    yield: "Tree record",
    crew: "4 workers",
    status: "Sold",
    value: 144000,
  },
  {
    id: "HRV-010",
    date: "22 Oct 2026",
    crop: "Carrot Nantes",
    plot: "Kitchen edge · 0.08 acres",
    quantity: "10 bags",
    weight: "500 kg",
    gradeA: "7 bags",
    yield: "6.25 tonnes/acre",
    crew: "2 workers",
    status: "Sold",
    value: 37500,
  },
];

export const CABBAGE_HARVEST_DETAIL = {
  method: "Hand cutting with knife",
  crew: "6 workers × 1 day",
  duration: "7:00 AM – 1:00 PM · 6 hours",
  predicted: "16,000 heads",
  actual: "14,500 heads · 10% below prediction",
  conditions: "Dry, sunny, 24°C · ideal for harvest",
  handling: "Immediately shaded and crated within one hour",
  storage: "Main shade structure at farm",
  notes:
    "Smaller heads in the south-west waterlogging corner. Exclude the corner from the next cabbage bed.",
  grades: [
    {
      grade: "Grade A",
      quantity: "10,000 heads",
      average: "2.0 kg",
      weight: "20,000 kg",
      note: "Firm, clean, premium market",
    },
    {
      grade: "Grade B",
      quantity: "3,500 heads",
      average: "1.2 kg",
      weight: "4,200 kg",
      note: "Minor outer-leaf spots",
    },
    {
      grade: "Grade C",
      quantity: "1,000 heads",
      average: "0.7 kg",
      weight: "700 kg",
      note: "Local market / processing",
    },
  ],
};

export const GRADING_STANDARDS = {
  cabbage: [
    {
      grade: "Grade A · Premium",
      size: "1.5–2.5 kg",
      quality: "Very firm · clean wrapper leaves",
      defects: "None",
      market: "Supermarkets, exporters, premium restaurants",
    },
    {
      grade: "Grade B · Standard",
      size: "1.0–1.5 kg",
      quality: "Firm · some outer-leaf spots",
      defects: "Minor · below 5%",
      market: "General market, restaurants, institutions",
    },
    {
      grade: "Grade C · Sub-standard",
      size: "Below 1.0 kg",
      quality: "Soft or loose · many damaged leaves",
      defects: "Moderate",
      market: "Low-price market, processing, feed",
    },
    {
      grade: "Reject",
      size: "Any",
      quality: "Rotting or diseased",
      defects: "Severe",
      market: "Compost or safe disposal",
    },
  ],
  tomato: [
    {
      grade: "Extra Class",
      size: "Uniform, large",
      quality: "Full red · very firm",
      defects: "None",
      market: "Premium retail",
    },
    {
      grade: "Class I",
      size: "Fairly uniform",
      quality: "At least two-thirds red · firm",
      defects: "Very slight",
      market: "Supermarkets and hotels",
    },
    {
      grade: "Class II",
      size: "Variable",
      quality: "At least half red · moderately firm",
      defects: "Cracks and spots allowed",
      market: "General market",
    },
  ],
  potato: [
    {
      grade: "Class 1",
      size: "35–75 mm",
      quality: "Regular shape",
      defects: "None",
      market: "Crisping and retail",
    },
    {
      grade: "Class 2",
      size: "25–120 mm",
      quality: "Fairly regular",
      defects: "Secondary growth or cracking allowed",
      market: "Local cooking market",
    },
  ],
};

export interface PackingOption {
  id: string;
  crop: string;
  package: string;
  quantity: string;
  cost: number;
  stack: string;
  shelfLife: string;
}

export const PACKING_OPTIONS: PackingOption[] = [
  {
    id: "PKG-001",
    crop: "Cabbage",
    package: "Wooden open crate",
    quantity: "30 heads",
    cost: 50,
    stack: "4 high",
    shelfLife: "7–10 days cool",
  },
  {
    id: "PKG-002",
    crop: "Cabbage",
    package: "Plastic crate",
    quantity: "25 heads",
    cost: 80,
    stack: "5 high",
    shelfLife: "10–14 days cool",
  },
  {
    id: "PKG-003",
    crop: "Tomato",
    package: "64 kg wooden crate",
    quantity: "40–50 kg",
    cost: 100,
    stack: "3 high",
    shelfLife: "5–7 days",
  },
  {
    id: "PKG-004",
    crop: "Tomato",
    package: "5 kg plastic box",
    quantity: "5 kg",
    cost: 30,
    stack: "6 high",
    shelfLife: "7–10 days cool",
  },
  {
    id: "PKG-005",
    crop: "Potato",
    package: "50 kg mesh bag",
    quantity: "50 kg",
    cost: 30,
    stack: "8 high",
    shelfLife: "2–3 months cool, dark",
  },
  {
    id: "PKG-006",
    crop: "Maize",
    package: "90 kg sisal bag",
    quantity: "90 kg",
    cost: 80,
    stack: "6 high",
    shelfLife: "6–12 months below 13% moisture",
  },
  {
    id: "PKG-007",
    crop: "Rosecoco beans",
    package: "90 kg sisal bag",
    quantity: "90 kg",
    cost: 80,
    stack: "6 high",
    shelfLife: "6–12 months dry",
  },
  {
    id: "PKG-008",
    crop: "Onion",
    package: "50 kg mesh bag",
    quantity: "50 kg",
    cost: 25,
    stack: "6 high",
    shelfLife: "2–4 months dry, ventilated",
  },
  {
    id: "PKG-009",
    crop: "French beans",
    package: "3 kg export carton",
    quantity: "3 kg",
    cost: 40,
    stack: "8 high",
    shelfLife: "7–10 days cooled to 7°C",
  },
];

export interface StorageFacility {
  id: string;
  name: string;
  type: string;
  capacity: string;
  temperature: string;
  humidity: string;
  crops: string;
  status: StorageStatus;
  note: string;
}

export const STORAGE_FACILITIES: StorageFacility[] = [
  {
    id: "STO-001",
    name: "Main shade",
    type: "Open shade structure · no walls",
    capacity: "5 tonnes",
    temperature: "Ambient",
    humidity: "Ambient",
    crops: "Cabbage, tomato short-term",
    status: "Available",
    note: "Use a fast sell-through plan; no overnight rain exposure.",
  },
  {
    id: "STO-002",
    name: "Farm store",
    type: "Brick room · ventilated",
    capacity: "10 tonnes",
    temperature: "Ambient",
    humidity: "60–70%",
    crops: "Maize, beans, onion, potato",
    status: "Available",
    note: "Raised pallets and rodent checks required.",
  },
  {
    id: "STO-003",
    name: "Cold room",
    type: "Walk-in cooler",
    capacity: "2 tonnes",
    temperature: "4–8°C",
    humidity: "85–90%",
    crops: "Premium tomato, french beans, cabbage",
    status: "Unavailable",
    note: "Hire option available at Githunguri Fresh Hub.",
  },
  {
    id: "STO-004",
    name: "Drying yard",
    type: "Concrete slab · open",
    capacity: "5 tonnes",
    temperature: "Sun temperature",
    humidity: "Low",
    crops: "Maize and beans drying",
    status: "Available",
    note: "Cover before rain and monitor moisture.",
  },
];

export interface StorageLog {
  id: string;
  date: string;
  crop: string;
  grade: string;
  quantity: string;
  package: string;
  location: string;
  condition: string;
  duration: string;
  state: "In storage" | "Released" | "Sold";
}

export const STORAGE_LOGS: StorageLog[] = [
  {
    id: "LOG-001",
    date: "15 Jan",
    crop: "Cabbage Gloria F1",
    grade: "A",
    quantity: "10,000 heads",
    package: "334 crates",
    location: "Main shade",
    condition: "Firm, clean, no damage",
    duration: "5 days · sell immediately",
    state: "In storage",
  },
  {
    id: "LOG-002",
    date: "15 Jan",
    crop: "Cabbage Gloria F1",
    grade: "B",
    quantity: "3,500 heads",
    package: "117 crates",
    location: "Main shade",
    condition: "Firm, outer-leaf spots",
    duration: "5 days",
    state: "In storage",
  },
  {
    id: "LOG-003",
    date: "15 Jan",
    crop: "Cabbage Gloria F1",
    grade: "C",
    quantity: "1,000 heads",
    package: "34 crates",
    location: "Main shade",
    condition: "Soft, some damage",
    duration: "Sell same day",
    state: "Sold",
  },
  {
    id: "LOG-004",
    date: "16 Jan",
    crop: "Cabbage Gloria F1",
    grade: "A",
    quantity: "2,000 heads",
    package: "Sold",
    location: "Fresh Produce Kenya",
    condition: "Buyer receipt FPK-118",
    duration: "Released",
    state: "Sold",
  },
  {
    id: "LOG-005",
    date: "17 Jan",
    crop: "Cabbage Gloria F1",
    grade: "A",
    quantity: "3,000 heads",
    package: "Sold",
    location: "Fresh Produce Kenya",
    condition: "Buyer receipt FPK-119",
    duration: "Released",
    state: "Sold",
  },
  {
    id: "LOG-006",
    date: "22 Dec",
    crop: "H6213 maize",
    grade: "A",
    quantity: "44 bags",
    package: "90 kg sisal",
    location: "Farm store",
    condition: "Dry, 12.7% moisture",
    duration: "6–12 months",
    state: "In storage",
  },
  {
    id: "LOG-007",
    date: "18 Dec",
    crop: "Rosecoco beans",
    grade: "A",
    quantity: "6 bags",
    package: "90 kg sisal",
    location: "Farm store",
    condition: "Cleaned, dry",
    duration: "6 months",
    state: "In storage",
  },
  {
    id: "LOG-008",
    date: "10 Dec",
    crop: "Potato Shangi",
    grade: "Class 1",
    quantity: "17 bags",
    package: "50 kg mesh",
    location: "Farm store",
    condition: "Cured, ventilated",
    duration: "8 weeks",
    state: "Released",
  },
  {
    id: "LOG-009",
    date: "08 Jan",
    crop: "Tomato Anna F1",
    grade: "Extra",
    quantity: "11 crates",
    package: "5 kg boxes",
    location: "Githunguri Fresh Hub",
    condition: "Cooled to 7°C",
    duration: "48 hours",
    state: "Released",
  },
  {
    id: "LOG-010",
    date: "28 Nov",
    crop: "French beans",
    grade: "Export",
    quantity: "520 kg",
    package: "3 kg cartons",
    location: "Githunguri Fresh Hub",
    condition: "Pre-cooled",
    duration: "24 hours",
    state: "Sold",
  },
];

export const CONDITION_MONITORS = [
  {
    id: "MON-001",
    parameter: "Temperature",
    method: "Sensor or manual thermometer",
    target: "4–8°C cold room / ambient shade",
    alert: "Above 10°C in cold room",
    current: "Ambient 23°C · shade",
    status: "Good" as ConditionStatus,
  },
  {
    id: "MON-002",
    parameter: "Humidity",
    method: "Sensor or manual check",
    target: "85–90% vegetables / below 70% grains",
    alert: "Above 95% mold / below 50% shrivel",
    current: "68% · farm store",
    status: "Good" as ConditionStatus,
  },
  {
    id: "MON-003",
    parameter: "Ventilation",
    method: "Manual airflow check",
    target: "Airflow present",
    alert: "Stale air or mold smell",
    current: "Open shade sides clear",
    status: "Good" as ConditionStatus,
  },
  {
    id: "MON-004",
    parameter: "Pest activity",
    method: "Visual inspection",
    target: "None",
    alert: "Any insects, rodents or mold",
    current: "Two rodent droppings near store door",
    status: "Watch" as ConditionStatus,
  },
  {
    id: "MON-005",
    parameter: "Spoilage",
    method: "Visual batch inspection",
    target: "Below 2%",
    alert: "Above 5% · urgent sale or disposal",
    current: "2.5% Grade B cabbage",
    status: "Watch" as ConditionStatus,
  },
];

export const LOSS_TRACKING = [
  {
    id: "LOS-001",
    type: "Physical damage",
    before: "2% · 295 heads",
    storage: "1% · 100 heads",
    transport: "1% · 120 heads",
    market: "0.5% · 65 heads",
    total: "4.5% · 580 heads",
    value: 17400,
  },
  {
    id: "LOS-002",
    type: "Weight loss · shrinkage",
    before: "—",
    storage: "3% · 750 kg",
    transport: "1% · 250 kg",
    market: "—",
    total: "4% · 1,000 kg",
    value: 0,
  },
  {
    id: "LOS-003",
    type: "Spoilage / rot",
    before: "0.5% · 73 heads",
    storage: "1.5% · 150 heads",
    transport: "0.5% · 55 heads",
    market: "1% · 100 heads",
    total: "3.5% · 378 heads",
    value: 11340,
  },
];

export const LOSS_RECOMMENDATIONS = [
  {
    id: "REC-001",
    recommendation: "Use a cold room for Grade A at 4–8°C",
    reduction: "50% less storage loss",
    saving: 5700,
    priority: "High",
  },
  {
    id: "REC-002",
    recommendation: "Use improved packing; do not over-pack crates",
    reduction: "30% less transport damage",
    saving: 3600,
    priority: "High",
  },
  {
    id: "REC-003",
    recommendation: "Sell high-grade cabbage within 48 hours",
    reduction: "80% less storage loss",
    saving: 9120,
    priority: "Urgent",
  },
  {
    id: "REC-004",
    recommendation: "Use padded transport; stack no more than four high",
    reduction: "40% less transport damage",
    saving: 4800,
    priority: "Medium",
  },
];

export interface ValueAddition {
  id: string;
  activity: string;
  input: string;
  output: string;
  addedValue: string;
  equipment: string;
  cost: number;
  state: "Ready" | "Planned" | "Needs equipment";
}

export const VALUE_ADDITION: ValueAddition[] = [
  {
    id: "VAL-001",
    activity: "Cabbage trim, leaf removal and wax",
    input: "Fresh cabbage",
    output: "Market-ready cabbage",
    addedValue: "+KES 5/head",
    equipment: "Knives, wax, grading table",
    cost: 500,
    state: "Ready",
  },
  {
    id: "VAL-002",
    activity: "Tomato grade + 5 kg box packing",
    input: "Bulk tomato",
    output: "Retail-ready boxes",
    addedValue: "+KES 2/kg",
    equipment: "Boxes, grading table",
    cost: 2000,
    state: "Ready",
  },
  {
    id: "VAL-003",
    activity: "Potato wash, grade + 10 kg pockets",
    input: "Dirty potato",
    output: "Clean packaged potato",
    addedValue: "+KES 3/kg",
    equipment: "Wash basin, pockets",
    cost: 1500,
    state: "Planned",
  },
  {
    id: "VAL-004",
    activity: "Maize shell, dry to 13% + bag",
    input: "Cobs",
    output: "Shelled maize bags",
    addedValue: "+KES 200/bag",
    equipment: "Sheller, moisture meter",
    cost: 0,
    state: "Ready",
  },
  {
    id: "VAL-005",
    activity: "Beans clean, grade + 2 kg packets",
    input: "Bulk beans",
    output: "Retail packets",
    addedValue: "+KES 15/packet",
    equipment: "Sieve, scale, packets",
    cost: 2000,
    state: "Planned",
  },
  {
    id: "VAL-006",
    activity: "Sukuma bundle + sprinkle",
    input: "Loose sukuma",
    output: "Market bundles",
    addedValue: "+KES 3/bundle",
    equipment: "String, water",
    cost: 100,
    state: "Ready",
  },
  {
    id: "VAL-007",
    activity: "Mango peel + solar dry",
    input: "Fresh mango",
    output: "Dried mango slices",
    addedValue: "+KES 500/kg",
    equipment: "Solar dryer",
    cost: 15000,
    state: "Needs equipment",
  },
];

export function harvestTone(
  status: HarvestStatus,
): "low" | "medium" | "neutral" {
  if (status === "Stored" || status === "Sold") return "low";
  if (status === "Ready to grade") return "medium";
  return "neutral";
}

export function storageTone(status: StorageStatus): "low" | "medium" | "high" {
  if (status === "Available") return "low";
  if (status === "Full") return "medium";
  return "high";
}

export function conditionTone(
  status: ConditionStatus,
): "low" | "medium" | "high" {
  if (status === "Good") return "low";
  if (status === "Watch") return "medium";
  return "high";
}
