/* ============================================================================
   PAGE 4 DATA — Crop Management & Growth Tracker for Kenyan farms.
   ========================================================================== */

export type CropEnterprise =
  | "vegetable"
  | "grain"
  | "industrial"
  | "fruit"
  | "root"
  | "legume"
  | "fodder";

export type HealthTone = "low" | "medium" | "high";
export type TaskPriority = "High" | "Medium" | "Low";
export type TaskStatus = "Completed" | "Upcoming" | "Planned" | "Skipped";
export type StageState = "done" | "current" | "upcoming";

export interface ActiveCropRecord {
  id: string;
  crop: string;
  swahili: string;
  variety: string;
  enterprise: CropEnterprise;
  plot: string;
  acres: number;
  plantingDate: string;
  harvestDate: string;
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  progress: number;
  healthScore: number;
  healthLabel: string;
  healthTone: HealthTone;
  currentStage: string;
  stageStarted: string;
  stageEnds: string;
  stageDay: number;
  stageDuration: number;
  nextStage: string;
  zone: string;
  water: string;
  budget: number;
  spent: number;
  predictedYield: string;
  predictedRevenue: number;
  manager: string;
}

export interface CropForecastMonth {
  id: string;
  month: string;
  rainfall: string;
  temperature: string;
  outlook: string;
  tone: HealthTone;
}

export interface GrowthStage {
  id: string;
  name: string;
  shortName: string;
  dates: string;
  duration: string;
  state: StageState;
  progress: number;
  description: string;
  activities: string[];
  inputs: string[];
  weather: string;
  problems: string[];
}

export interface CropTask {
  id: string;
  cropId: string;
  date: string;
  task: string;
  input: string;
  labour: string;
  cost: number;
  priority: TaskPriority;
  status: TaskStatus;
  doneBy: string;
  notes: string;
  stage: string;
}

export interface CropWidgetDefinition {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
  availability: "available" | "hidden" | "sensor";
  category:
    | "Establishment"
    | "Nutrition"
    | "Protection"
    | "Water"
    | "Evidence"
    | "Harvest"
    | "Performance"
    | "Specialist";
  summary: string;
}

export interface FertilizerScheduleRow {
  id: string;
  cropId: string;
  number: number;
  date: string;
  stage: string;
  fertilizer: string;
  rate: string;
  method: string;
  purpose: string;
  actualDate: string;
  actualCost: number | null;
  status: "Applied" | "Due" | "Upcoming";
}

export interface PestRiskRow {
  id: string;
  pest: string;
  risk: string;
  tone: HealthTone;
  identification: string;
  damage: string;
  treatment: string;
  cost: number;
}

export interface DiseaseRiskRow {
  id: string;
  disease: string;
  risk: string;
  tone: HealthTone;
  symptoms: string;
  prevention: string;
  treatment: string;
  phi: string;
}

export interface ScoutingRecord {
  id: string;
  date: string;
  found: string;
  severity: number;
  areaAffected: string;
  action: string;
  photoRef: string;
  scout: string;
}

export interface WeatherOverlayRow {
  id: string;
  period: string;
  needed: number;
  received: number | null;
  forecast: number | null;
  variance: number | null;
  impact: string;
  tone: HealthTone;
}

export interface GrowthPhoto {
  id: string;
  date: string;
  stage: string;
  note: string;
  status: "Logged" | "Scheduled";
  plantsVisible: string;
  capturedBy: string;
  reference: string;
}

export interface YieldFactor {
  id: string;
  factor: string;
  status: string;
  impact: number | null;
  note: string;
  tone: HealthTone;
}

export interface CostLedgerRow {
  id: string;
  date: string;
  category: string;
  description: string;
  supplier: string;
  method: string;
  reference: string;
  budget: number;
  actual: number;
}

export interface BenchmarkRow {
  id: string;
  metric: string;
  mary: string;
  kiambuMedian: string;
  topQuartile: string;
  position: string;
  tone: HealthTone;
}

export interface CropActivityRow {
  id: string;
  at: string;
  event: string;
  detail: string;
  by: string;
  type: "task" | "input" | "photo" | "weather" | "health";
}

export interface InputSupplierRow {
  id: string;
  supplier: string;
  town: string;
  phone: string;
  item: string;
  pack: string;
  price: number;
  stock: number;
  verified: boolean;
}

export const ACTIVE_CROPS: ActiveCropRecord[] = [
  {
    id: "crop-cabbage",
    crop: "Cabbage",
    swahili: "Kabichi",
    variety: "Gloria F1",
    enterprise: "vegetable",
    plot: "Plot 1: Shamba ya nyumba",
    acres: 0.5,
    plantingDate: "20 Oct 2026",
    harvestDate: "18 Jan 2027",
    totalDays: 90,
    daysElapsed: 24,
    daysRemaining: 66,
    progress: 27,
    healthScore: 85,
    healthLabel: "Good",
    healthTone: "low",
    currentStage: "Vegetative Growth",
    stageStarted: "20 Oct 2026",
    stageEnds: "20 Nov 2026",
    stageDay: 4,
    stageDuration: 30,
    nextStage: "Heading · 20 Nov",
    zone: "UM1 · 1,800 m",
    water: "Short rains + drip backup",
    budget: 50850,
    spent: 25950,
    predictedYield: "14,500 heads · 0.5 acre",
    predictedRevenue: 435000,
    manager: "Mary Wanjiku",
  },
  {
    id: "crop-maize",
    crop: "Maize",
    swahili: "Mahindi",
    variety: "H6213",
    enterprise: "grain",
    plot: "Plot 2 · Shamba ya chini",
    acres: 1.2,
    plantingDate: "12 Oct 2026",
    harvestDate: "18 Mar 2027",
    totalDays: 157,
    daysElapsed: 32,
    daysRemaining: 125,
    progress: 20,
    healthScore: 79,
    healthLabel: "Watch",
    healthTone: "medium",
    currentStage: "Vegetative Growth",
    stageStarted: "24 Oct 2026",
    stageEnds: "18 Dec 2026",
    stageDay: 20,
    stageDuration: 55,
    nextStage: "Tasseling · 19 Dec",
    zone: "UM1 · 1,760 m",
    water: "Rain-fed",
    budget: 62400,
    spent: 28600,
    predictedYield: "31 bags · 1.2 acres",
    predictedRevenue: 139500,
    manager: "John Mwangi",
  },
  {
    id: "crop-beans",
    crop: "Dry Beans",
    swahili: "Maharagwe",
    variety: "Rosecoco",
    enterprise: "legume",
    plot: "Plot 3 · Kwa mto",
    acres: 0.4,
    plantingDate: "18 Oct 2026",
    harvestDate: "16 Jan 2027",
    totalDays: 90,
    daysElapsed: 26,
    daysRemaining: 64,
    progress: 29,
    healthScore: 91,
    healthLabel: "Strong",
    healthTone: "low",
    currentStage: "Branching",
    stageStarted: "05 Nov 2026",
    stageEnds: "25 Nov 2026",
    stageDay: 8,
    stageDuration: 20,
    nextStage: "Flowering · 26 Nov",
    zone: "UM1 · riverside",
    water: "Rain-fed + hose",
    budget: 18800,
    spent: 10400,
    predictedYield: "4.1 bags · 0.4 acre",
    predictedRevenue: 45100,
    manager: "Mary Wanjiku",
  },
  {
    id: "crop-tomato",
    crop: "Tomato",
    swahili: "Nyanya",
    variety: "Anna F1",
    enterprise: "vegetable",
    plot: "Greenhouse 1",
    acres: 0.2,
    plantingDate: "05 Oct 2026",
    harvestDate: "22 Jan 2027",
    totalDays: 109,
    daysElapsed: 39,
    daysRemaining: 70,
    progress: 36,
    healthScore: 74,
    healthLabel: "Attention",
    healthTone: "medium",
    currentStage: "Flowering",
    stageStarted: "08 Nov 2026",
    stageEnds: "03 Dec 2026",
    stageDay: 5,
    stageDuration: 25,
    nextStage: "Fruit set · 04 Dec",
    zone: "Protected · UM1",
    water: "Drip fertigation",
    budget: 46000,
    spent: 31200,
    predictedYield: "56 crates · 0.2 acre",
    predictedRevenue: 184800,
    manager: "Lucy Njeri",
  },
  {
    id: "crop-potato",
    crop: "Potato",
    swahili: "Viazi",
    variety: "Shangi",
    enterprise: "root",
    plot: "Githiga lease",
    acres: 0.6,
    plantingDate: "28 Sep 2026",
    harvestDate: "12 Jan 2027",
    totalDays: 106,
    daysElapsed: 46,
    daysRemaining: 60,
    progress: 43,
    healthScore: 82,
    healthLabel: "Good",
    healthTone: "low",
    currentStage: "Tuber Initiation",
    stageStarted: "31 Oct 2026",
    stageEnds: "25 Nov 2026",
    stageDay: 13,
    stageDuration: 25,
    nextStage: "Bulking · 26 Nov",
    zone: "LH2 · 2,020 m",
    water: "Rain-fed",
    budget: 72000,
    spent: 47800,
    predictedYield: "69 bags · 0.6 acre",
    predictedRevenue: 193200,
    manager: "Peter Kamau",
  },
  {
    id: "crop-onion",
    crop: "Onion",
    swahili: "Kitunguu",
    variety: "Red Creole",
    enterprise: "vegetable",
    plot: "Ngewa block",
    acres: 0.3,
    plantingDate: "08 Oct 2026",
    harvestDate: "20 Feb 2027",
    totalDays: 135,
    daysElapsed: 36,
    daysRemaining: 99,
    progress: 27,
    healthScore: 88,
    healthLabel: "Good",
    healthTone: "low",
    currentStage: "Leaf Development",
    stageStarted: "26 Oct 2026",
    stageEnds: "05 Dec 2026",
    stageDay: 18,
    stageDuration: 40,
    nextStage: "Bulb initiation · 06 Dec",
    zone: "UM1 · sandy loam",
    water: "Drip",
    budget: 40500,
    spent: 19100,
    predictedYield: "4.2 tonnes · 0.3 acre",
    predictedRevenue: 126000,
    manager: "Mary Wanjiku",
  },
  {
    id: "crop-avocado",
    crop: "Avocado",
    swahili: "Parachichi",
    variety: "Hass",
    enterprise: "fruit",
    plot: "Upper ridge",
    acres: 0.4,
    plantingDate: "25 Oct 2026",
    harvestDate: "May 2029",
    totalDays: 940,
    daysElapsed: 19,
    daysRemaining: 921,
    progress: 2,
    healthScore: 93,
    healthLabel: "Strong",
    healthTone: "low",
    currentStage: "Establishment",
    stageStarted: "25 Oct 2026",
    stageEnds: "31 Jan 2027",
    stageDay: 19,
    stageDuration: 98,
    nextStage: "Canopy training · Feb 2027",
    zone: "UM1 · protected ridge",
    water: "Basin irrigation",
    budget: 58000,
    spent: 42200,
    predictedYield: "Year 3 · 4,600 fruits",
    predictedRevenue: 165600,
    manager: "Mary Wanjiku",
  },
  {
    id: "crop-coffee",
    crop: "Coffee",
    swahili: "Kahawa",
    variety: "Ruiru 11",
    enterprise: "industrial",
    plot: "Coffee block",
    acres: 0.1,
    plantingDate: "02 Nov 2026",
    harvestDate: "Nov 2029",
    totalDays: 1095,
    daysElapsed: 11,
    daysRemaining: 1084,
    progress: 1,
    healthScore: 86,
    healthLabel: "Good",
    healthTone: "low",
    currentStage: "Seedling Establishment",
    stageStarted: "02 Nov 2026",
    stageEnds: "28 Feb 2027",
    stageDay: 11,
    stageDuration: 118,
    nextStage: "Frame training · Mar 2027",
    zone: "UM1 · red volcanic soil",
    water: "Rain-fed + mulch",
    budget: 22000,
    spent: 14800,
    predictedYield: "Year 3 · 420 kg cherry",
    predictedRevenue: 50400,
    manager: "Mary Wanjiku",
  },
  {
    id: "crop-kale",
    crop: "Kale",
    swahili: "Sukuma wiki",
    variety: "Thousand Headed",
    enterprise: "vegetable",
    plot: "Kitchen garden",
    acres: 0.1,
    plantingDate: "26 Sep 2026",
    harvestDate: "22 Nov 2026",
    totalDays: 57,
    daysElapsed: 48,
    daysRemaining: 9,
    progress: 84,
    healthScore: 77,
    healthLabel: "Watch",
    healthTone: "medium",
    currentStage: "First Harvest",
    stageStarted: "10 Nov 2026",
    stageEnds: "22 Nov 2026",
    stageDay: 3,
    stageDuration: 12,
    nextStage: "Repeated picking · weekly",
    zone: "UM1 · homestead",
    water: "Hose irrigation",
    budget: 6200,
    spent: 5400,
    predictedYield: "1,100 bunches · first month",
    predictedRevenue: 27500,
    manager: "Lucy Njeri",
  },
  {
    id: "crop-napier",
    crop: "Napier Grass",
    swahili: "Nyasi ya Napier",
    variety: "Pakchong 1",
    enterprise: "fodder",
    plot: "Dairy strip",
    acres: 0.2,
    plantingDate: "10 Oct 2026",
    harvestDate: "20 Jan 2027",
    totalDays: 102,
    daysElapsed: 34,
    daysRemaining: 68,
    progress: 33,
    healthScore: 95,
    healthLabel: "Strong",
    healthTone: "low",
    currentStage: "Tillering",
    stageStarted: "01 Nov 2026",
    stageEnds: "15 Dec 2026",
    stageDay: 12,
    stageDuration: 44,
    nextStage: "Rapid biomass · 16 Dec",
    zone: "UM1 · dairy unit",
    water: "Rain-fed",
    budget: 9800,
    spent: 6100,
    predictedYield: "6.8 tonnes · first cut",
    predictedRevenue: 34000,
    manager: "John Mwangi",
  },
];

export const CABBAGE_FORECAST: CropForecastMonth[] = [
  {
    id: "forecast-nov",
    month: "November",
    rainfall: "102–128 mm",
    temperature: "16–24°C",
    outlook: "Wet · black-rot pressure",
    tone: "high",
  },
  {
    id: "forecast-dec",
    month: "December",
    rainfall: "52–74 mm",
    temperature: "17–26°C",
    outlook: "Good heading moisture",
    tone: "low",
  },
  {
    id: "forecast-jan",
    month: "January",
    rainfall: "24–41 mm",
    temperature: "18–27°C",
    outlook: "Drier harvest window",
    tone: "medium",
  },
];

export const CABBAGE_STAGES: GrowthStage[] = [
  {
    id: "stage-nursery",
    name: "Nursery Establishment",
    shortName: "Nursery",
    dates: "20 Sep–20 Oct",
    duration: "30 days",
    state: "done",
    progress: 100,
    description:
      "Seed sowing, germination, seedling care and hardening before field transfer.",
    activities: [
      "Prepare sterile nursery media",
      "Sow Gloria F1 seed at 5 cm spacing",
      "Water in the morning",
      "Harden seedlings for seven days",
    ],
    inputs: [
      "Gloria F1 seed · 200 g",
      "Shade net",
      "Watering can",
      "Nursery media",
    ],
    weather:
      "Protect from heavy rain and maintain even moisture without waterlogging.",
    problems: ["Damping-off", "Leggy seedlings", "Flea beetles", "Heat stress"],
  },
  {
    id: "stage-transplant",
    name: "Field Transplanting",
    shortName: "Transplanting",
    dates: "20 Oct",
    duration: "1 day + 7-day establishment",
    state: "done",
    progress: 100,
    description:
      "Move hardened seedlings to prepared beds at the target plant population.",
    activities: [
      "Water nursery before lifting",
      "Transplant late afternoon",
      "Set 45 × 45 cm spacing",
      "Replace gaps within seven days",
    ],
    inputs: [
      "2.5 tonnes manure",
      "25 kg DAP",
      "17,000 seedlings/acre equivalent",
      "Planting line",
    ],
    weather:
      "Prefer a cool afternoon followed by light rain; avoid hot windy conditions.",
    problems: [
      "Transplant shock",
      "Cutworms",
      "Poor root-soil contact",
      "Uneven spacing",
    ],
  },
  {
    id: "stage-vegetative",
    name: "Vegetative Growth",
    shortName: "Vegetative",
    dates: "20 Oct–20 Nov",
    duration: "30 days",
    state: "current",
    progress: 13,
    description:
      "Rapid leaf and root growth builds the canopy required for strong cabbage heads.",
    activities: [
      "First and second weeding",
      "Top-dress CAN",
      "Scout Diamondback moth",
      "Maintain even irrigation",
    ],
    inputs: [
      "25 kg CAN",
      "Mancozeb if wet",
      "Duduthrin only above threshold",
      "3 worker-days for weeding",
    ],
    weather:
      "Target 15–25°C with adequate moisture. Wet leaves raise black-rot risk.",
    problems: [
      "Diamondback moth",
      "Black rot",
      "Nitrogen deficiency",
      "Moisture stress",
    ],
  },
  {
    id: "stage-heading",
    name: "Head Formation",
    shortName: "Heading",
    dates: "20 Nov–20 Dec",
    duration: "30 days",
    state: "upcoming",
    progress: 0,
    description:
      "Inner leaves tighten into marketable heads; nutrition and moisture consistency are critical.",
    activities: [
      "Second CAN top-dress",
      "Apply potassium foliar feed",
      "Maintain pest scouting",
      "Remove diseased plants",
    ],
    inputs: [
      "12.5 kg CAN",
      "0.5 litre potassium foliar",
      "Mancozeb",
      "Irrigation water",
    ],
    weather:
      "Avoid alternating severe dryness and heavy irrigation, which can split heads.",
    problems: ["Head splitting", "Aphids", "Black rot", "Small loose heads"],
  },
  {
    id: "stage-maturity",
    name: "Maturity & Quality",
    shortName: "Maturity",
    dates: "20 Dec–10 Jan",
    duration: "21 days",
    state: "upcoming",
    progress: 0,
    description:
      "Heads reach target firmness, weight and market grade before harvest scheduling.",
    activities: [
      "Check firmness and weight",
      "Confirm buyer and crates",
      "Observe PHI",
      "Reduce irrigation near harvest",
    ],
    inputs: [
      "Field scale",
      "Harvest crates",
      "Buyer grade sheet",
      "Clean knives",
    ],
    weather:
      "Cool dry mornings protect quality; persistent rain increases splitting and disease.",
    problems: [
      "Splitting",
      "Oversize heads",
      "Soft rot",
      "Delayed buyer collection",
    ],
  },
  {
    id: "stage-harvest",
    name: "Harvest & Dispatch",
    shortName: "Harvest",
    dates: "15–18 Jan",
    duration: "3 days",
    state: "upcoming",
    progress: 0,
    description:
      "Cut, grade, pack and dispatch heads within the selected buyer window.",
    activities: [
      "Harvest in cool hours",
      "Grade by head weight",
      "Pack without compression",
      "Record dispatch and rejected heads",
    ],
    inputs: [
      "400 crates equivalent",
      "6 harvest workers",
      "Clean knives",
      "Truck or pickup",
    ],
    weather:
      "Avoid harvesting during heavy rain and shade packed produce before transport.",
    problems: [
      "Bruising",
      "Heat buildup",
      "Rejection at market",
      "Transport delays",
    ],
  },
];

export const GRAIN_STAGES: GrowthStage[] = [
  {
    id: "grain-land",
    name: "Land Preparation",
    shortName: "Land prep",
    dates: "Sep–early Oct",
    duration: "2 weeks",
    state: "done",
    progress: 100,
    description: "Prepare a fine, well-drained seedbed before reliable rain.",
    activities: ["Plough", "Harrow", "Mark rows"],
    inputs: ["Tractor", "Planting line"],
    weather: "Work soil before sustained rain.",
    problems: ["Compaction", "Erosion"],
  },
  {
    id: "grain-plant",
    name: "Planting",
    shortName: "Planting",
    dates: "12 Oct",
    duration: "1 day",
    state: "done",
    progress: 100,
    description:
      "Place certified seed and basal fertilizer at correct spacing.",
    activities: ["Calibrate seed", "Apply basal fertilizer", "Cover seed"],
    inputs: ["Certified seed", "DAP/NPK"],
    weather: "Plant into moist soil after effective rain.",
    problems: ["Poor depth", "Seed rot"],
  },
  {
    id: "grain-germ",
    name: "Germination",
    shortName: "Germination",
    dates: "13–24 Oct",
    duration: "12 days",
    state: "done",
    progress: 100,
    description: "Establish an even, vigorous crop stand.",
    activities: ["Count emergence", "Gap-fill", "Inspect cutworms"],
    inputs: ["Replacement seed"],
    weather: "Moist topsoil is critical.",
    problems: ["Low emergence", "Cutworms"],
  },
  {
    id: "grain-veg",
    name: "Vegetative Growth",
    shortName: "Vegetative",
    dates: "24 Oct–18 Dec",
    duration: "55 days",
    state: "current",
    progress: 36,
    description: "Build leaf area and stem strength before reproduction.",
    activities: ["Top-dress CAN", "Weed", "Scout fall armyworm"],
    inputs: ["CAN", "Herbicide if selected"],
    weather: "Consistent rainfall supports biomass.",
    problems: ["Fall armyworm", "Nitrogen stress"],
  },
  {
    id: "grain-repro",
    name: "Tasseling & Grain Fill",
    shortName: "Reproductive",
    dates: "19 Dec–20 Feb",
    duration: "63 days",
    state: "upcoming",
    progress: 0,
    description: "Protect pollination and grain filling from moisture stress.",
    activities: ["Scout tassels", "Monitor silking", "Protect moisture"],
    inputs: ["Scouting sheet"],
    weather: "Water deficit at silking sharply reduces yield.",
    problems: ["Poor pollination", "Stalk borer"],
  },
  {
    id: "grain-harvest",
    name: "Harvest & Storage",
    shortName: "Harvest",
    dates: "Mar 2027",
    duration: "3 weeks",
    state: "upcoming",
    progress: 0,
    description: "Harvest at safe maturity, dry and store grain hygienically.",
    activities: ["Check moisture", "Harvest", "Dry", "Treat storage"],
    inputs: ["Moisture meter", "Hermetic bags"],
    weather: "Dry weather protects grain quality.",
    problems: ["Aflatoxin", "Weevils"],
  },
];

export const INDUSTRIAL_STAGES: GrowthStage[] = [
  {
    id: "industrial-site",
    name: "Site & Soil Preparation",
    shortName: "Site prep",
    dates: "Before planting",
    duration: "2–4 weeks",
    state: "done",
    progress: 100,
    description: "Prepare perennial crop rows, drainage and amendments.",
    activities: ["Soil test", "Prepare holes or ridges", "Apply manure"],
    inputs: ["Manure", "Lime if required"],
    weather: "Finish before dependable rain.",
    problems: ["Poor drainage", "Incorrect spacing"],
  },
  {
    id: "industrial-plant",
    name: "Planting Material",
    shortName: "Planting",
    dates: "Planting week",
    duration: "1 week",
    state: "done",
    progress: 100,
    description: "Plant certified seedlings, setts or clonal material.",
    activities: ["Verify material", "Plant", "Label rows"],
    inputs: ["Certified planting material"],
    weather: "Mild wet conditions reduce shock.",
    problems: ["Diseased planting stock"],
  },
  {
    id: "industrial-est",
    name: "Establishment",
    shortName: "Establishment",
    dates: "Months 1–4",
    duration: "4 months",
    state: "current",
    progress: 18,
    description: "Build roots and an even initial stand.",
    activities: ["Gap-fill", "Mulch", "Control weeds"],
    inputs: ["Mulch", "Starter nutrition"],
    weather: "Avoid prolonged moisture stress.",
    problems: ["Termites", "Drought stress"],
  },
  {
    id: "industrial-canopy",
    name: "Canopy Development",
    shortName: "Canopy",
    dates: "Months 5–18",
    duration: "14 months",
    state: "upcoming",
    progress: 0,
    description: "Train productive structure and manage crop nutrition.",
    activities: ["Training", "Pruning", "Nutrition"],
    inputs: ["Fertilizer", "Pruning tools"],
    weather: "Seasonal moisture supports flushes.",
    problems: ["Stem pests", "Nutrient stress"],
  },
  {
    id: "industrial-bearing",
    name: "Bearing & Maturity",
    shortName: "Maturity",
    dates: "Year 2 onward",
    duration: "Seasonal",
    state: "upcoming",
    progress: 0,
    description: "Manage flowering, fruiting or industrial maturity.",
    activities: ["Scout", "Quality monitor", "Buyer planning"],
    inputs: ["Crop protection", "Records"],
    weather: "Critical windows vary by enterprise.",
    problems: ["Quality loss", "Delayed maturity"],
  },
  {
    id: "industrial-harvest",
    name: "Harvest Cycle",
    shortName: "Harvest",
    dates: "Enterprise-specific",
    duration: "Cycle",
    state: "upcoming",
    progress: 0,
    description:
      "Harvest, transport and reconcile factory or cooperative delivery.",
    activities: ["Harvest", "Grade", "Transport", "Reconcile payment"],
    inputs: ["Harvest labour", "Transport"],
    weather: "Schedule for quality and access.",
    problems: ["Transport delay", "Payment variance"],
  },
];

export const CABBAGE_TASKS: CropTask[] = [
  {
    id: "task-001",
    cropId: "crop-cabbage",
    date: "20 Sep",
    task: "Prepare nursery bed",
    input: "None",
    labour: "Self",
    cost: 0,
    priority: "High",
    status: "Completed",
    doneBy: "Mary",
    notes: "Used shade net",
    stage: "Nursery",
  },
  {
    id: "task-002",
    cropId: "crop-cabbage",
    date: "20 Sep",
    task: "Sow Gloria F1 seeds",
    input: "4 sachets · 200 g",
    labour: "Self",
    cost: 3200,
    priority: "High",
    status: "Completed",
    doneBy: "Mary",
    notes: "Spacing 5 cm",
    stage: "Nursery",
  },
  {
    id: "task-003",
    cropId: "crop-cabbage",
    date: "01–19 Oct",
    task: "Water nursery daily",
    input: "Clean water",
    labour: "Self",
    cost: 0,
    priority: "Medium",
    status: "Completed",
    doneBy: "Mary",
    notes: "Morning only",
    stage: "Nursery",
  },
  {
    id: "task-004",
    cropId: "crop-cabbage",
    date: "20 Oct",
    task: "Prepare field · plough, harrow, beds",
    input: "Tractor and hand tools",
    labour: "2 workers × 1 day",
    cost: 1000,
    priority: "High",
    status: "Completed",
    doneBy: "John + Peter",
    notes: "Beds 1 m wide",
    stage: "Transplanting",
  },
  {
    id: "task-005",
    cropId: "crop-cabbage",
    date: "20 Oct",
    task: "Apply manure to beds",
    input: "2.5 tonnes manure",
    labour: "2 workers × 1 day",
    cost: 16000,
    priority: "High",
    status: "Completed",
    doneBy: "John + Peter",
    notes: "Well-rotted manure",
    stage: "Transplanting",
  },
  {
    id: "task-006",
    cropId: "crop-cabbage",
    date: "20 Oct",
    task: "Apply DAP basal",
    input: "25 kg DAP",
    labour: "Self",
    cost: 3250,
    priority: "High",
    status: "Completed",
    doneBy: "Mary",
    notes: "Mixed into soil",
    stage: "Transplanting",
  },
  {
    id: "task-007",
    cropId: "crop-cabbage",
    date: "20 Oct",
    task: "Transplant seedlings",
    input: "Hardened seedlings",
    labour: "5 workers × 1 day",
    cost: 2500,
    priority: "High",
    status: "Completed",
    doneBy: "John + 4 others",
    notes: "Spacing 45 × 45 cm",
    stage: "Transplanting",
  },
  {
    id: "task-008",
    cropId: "crop-cabbage",
    date: "25 Oct",
    task: "First weeding",
    input: "Hand hoes",
    labour: "3 workers × 1 day",
    cost: 1500,
    priority: "High",
    status: "Upcoming",
    doneBy: "Unassigned",
    notes: "Weed between beds without root damage",
    stage: "Vegetative",
  },
  {
    id: "task-009",
    cropId: "crop-cabbage",
    date: "03 Nov",
    task: "Top dress CAN · first",
    input: "25 kg CAN",
    labour: "1 worker",
    cost: 2750,
    priority: "High",
    status: "Planned",
    doneBy: "Mary",
    notes: "Side-dress along rows after weeding",
    stage: "Vegetative",
  },
  {
    id: "task-010",
    cropId: "crop-cabbage",
    date: "05 Nov",
    task: "Scout for Diamondback moth",
    input: "Scouting sheet",
    labour: "Self",
    cost: 0,
    priority: "High",
    status: "Planned",
    doneBy: "Mary",
    notes: "Inspect 20 plants in a W pattern",
    stage: "Vegetative",
  },
  {
    id: "task-011",
    cropId: "crop-cabbage",
    date: "10 Nov",
    task: "Second weeding",
    input: "Hand hoes",
    labour: "2 workers × 1 day",
    cost: 1000,
    priority: "Medium",
    status: "Planned",
    doneBy: "John + Peter",
    notes: "Remove weeds before canopy closes",
    stage: "Vegetative",
  },
  {
    id: "task-012",
    cropId: "crop-cabbage",
    date: "15 Nov",
    task: "Spray Mancozeb · black rot prevention",
    input: "500 g Mancozeb",
    labour: "1 trained worker",
    cost: 1000,
    priority: "High",
    status: "Planned",
    doneBy: "Peter",
    notes: "50 g per 20 L · observe PPE",
    stage: "Vegetative",
  },
  {
    id: "task-013",
    cropId: "crop-cabbage",
    date: "20 Nov",
    task: "Top dress CAN · second",
    input: "12.5 kg CAN",
    labour: "Self",
    cost: 1250,
    priority: "Medium",
    status: "Planned",
    doneBy: "Mary",
    notes: "Apply to moist soil",
    stage: "Heading",
  },
  {
    id: "task-014",
    cropId: "crop-cabbage",
    date: "01 Dec",
    task: "Spray Mancozeb · second application",
    input: "500 g Mancozeb",
    labour: "1 trained worker",
    cost: 1000,
    priority: "Medium",
    status: "Planned",
    doneBy: "Peter",
    notes: "Only if wet-season risk remains",
    stage: "Heading",
  },
  {
    id: "task-015",
    cropId: "crop-cabbage",
    date: "10 Dec",
    task: "Apply potassium foliar feed",
    input: "1 litre foliar feed",
    labour: "Self",
    cost: 1200,
    priority: "Medium",
    status: "Planned",
    doneBy: "Mary",
    notes: "Support firm head formation",
    stage: "Heading",
  },
  {
    id: "task-016",
    cropId: "crop-cabbage",
    date: "15 Dec",
    task: "Scout for aphids",
    input: "Scouting sheet",
    labour: "Self",
    cost: 0,
    priority: "Low",
    status: "Planned",
    doneBy: "Mary",
    notes: "Inspect leaf undersides",
    stage: "Heading",
  },
  {
    id: "task-017",
    cropId: "crop-cabbage",
    date: "10 Jan",
    task: "Stop irrigation · pre-harvest",
    input: "None",
    labour: "Self",
    cost: 0,
    priority: "Medium",
    status: "Planned",
    doneBy: "Mary",
    notes: "Reduce splitting and field mud",
    stage: "Maturity",
  },
  {
    id: "task-018",
    cropId: "crop-cabbage",
    date: "15 Jan",
    task: "Harvest and grade cabbage",
    input: "Crates and clean knives",
    labour: "6 workers × 1 day",
    cost: 13600,
    priority: "High",
    status: "Planned",
    doneBy: "Harvest crew",
    notes: "Grade by firmness and head weight",
    stage: "Harvest",
  },
  {
    id: "task-019",
    cropId: "crop-cabbage",
    date: "15 Jan",
    task: "Transport crop to market",
    input: "Pickup truck",
    labour: "1 driver",
    cost: 2500,
    priority: "High",
    status: "Planned",
    doneBy: "Kamau Transport",
    notes: "Dispatch to Marikiti before 05:00",
    stage: "Harvest",
  },
];

export const OTHER_CROP_TASKS: CropTask[] = ACTIVE_CROPS.filter(
  (crop) => crop.id !== "crop-cabbage",
).flatMap((crop, index) => [
  {
    id: `task-other-${index + 1}-a`,
    cropId: crop.id,
    date: "14 Nov",
    task: `Inspect ${crop.crop.toLowerCase()} at ${crop.currentStage.toLowerCase()}`,
    input: "Field sheet and phone camera",
    labour: "Self",
    cost: 0,
    priority: crop.healthTone === "medium" ? "High" : "Medium",
    status: "Upcoming",
    doneBy: crop.manager,
    notes: `Record stand, moisture and visible pest pressure in ${crop.plot}.`,
    stage: crop.currentStage,
  },
  {
    id: `task-other-${index + 1}-b`,
    cropId: crop.id,
    date: "18 Nov",
    task: `Review ${crop.crop.toLowerCase()} nutrition and water plan`,
    input: crop.water,
    labour: "Self",
    cost: Math.round(700 + index * 125),
    priority: "Medium",
    status: "Planned",
    doneBy: crop.manager,
    notes: `Confirm the next input before ${crop.nextStage}.`,
    stage: crop.currentStage,
  },
]);

export const ALL_CROP_TASKS: CropTask[] = [
  ...CABBAGE_TASKS,
  ...OTHER_CROP_TASKS,
];

export const VEGETABLE_WIDGETS: CropWidgetDefinition[] = [
  {
    id: "nursery",
    label: "Nursery Tracker",
    description: "Seed sowing, germination rate and seedling health",
    defaultOn: true,
    availability: "available",
    category: "Establishment",
    summary: "94% germination · hardening complete",
  },
  {
    id: "transplant",
    label: "Transplanting Log",
    description: "Date, survival rate and spacing",
    defaultOn: true,
    availability: "available",
    category: "Establishment",
    summary: "20 Oct · 96% survival · 45 × 45 cm",
  },
  {
    id: "fertilizer",
    label: "Fertilizer Schedule",
    description: "Application dates, rates, products and actual cost",
    defaultOn: true,
    availability: "available",
    category: "Nutrition",
    summary: "1 of 4 applications complete",
  },
  {
    id: "pest",
    label: "Pest & Disease Monitor",
    description: "Scouting, identification, threshold and treatment",
    defaultOn: true,
    availability: "available",
    category: "Protection",
    summary: "Black rot high · DBM medium",
  },
  {
    id: "weed",
    label: "Weed Management",
    description: "Weeding schedule and hand or herbicide method",
    defaultOn: true,
    availability: "available",
    category: "Protection",
    summary: "First weeding due 25 Oct",
  },
  {
    id: "irrigation",
    label: "Irrigation Log",
    description: "Amount, frequency, source and crop stage",
    defaultOn: true,
    availability: "available",
    category: "Water",
    summary: "Rain-fed · drip backup available",
  },
  {
    id: "staking",
    label: "Staking / Trellising",
    description: "For tomato and climbing vegetable enterprises",
    defaultOn: false,
    availability: "hidden",
    category: "Specialist",
    summary: "Hidden for cabbage",
  },
  {
    id: "pruning",
    label: "Pruning",
    description: "For tomato, fruit and trained vegetable crops",
    defaultOn: false,
    availability: "hidden",
    category: "Specialist",
    summary: "Hidden for cabbage",
  },
  {
    id: "spraying",
    label: "Spraying Records",
    description: "Product, batch, rate, operator and PHI",
    defaultOn: true,
    availability: "available",
    category: "Protection",
    summary: "Next Mancozeb · 15 Nov · 14-day PHI",
  },
  {
    id: "harvest",
    label: "Harvest Tracker",
    description: "Expected date, actual quantity, grade and buyer",
    defaultOn: true,
    availability: "available",
    category: "Harvest",
    summary: "14,500 heads predicted · 15–18 Jan",
  },
  {
    id: "postharvest",
    label: "Post-Harvest Handling",
    description: "Grading, packing, storage and transport plan",
    defaultOn: true,
    availability: "available",
    category: "Harvest",
    summary: "Marikiti route · 400-crate equivalent",
  },
  {
    id: "moisture",
    label: "Soil Moisture",
    description: "Live sensor or manual soil-moisture observations",
    defaultOn: false,
    availability: "sensor",
    category: "Water",
    summary: "Sensor not connected · manual mode available",
  },
  {
    id: "photos",
    label: "Growth Photos",
    description: "Weekly field-photo timeline and notes",
    defaultOn: true,
    availability: "available",
    category: "Evidence",
    summary: "3 logged · 6 scheduled",
  },
  {
    id: "costs",
    label: "Cost Tracker",
    description: "Running spend against the crop budget",
    defaultOn: true,
    availability: "available",
    category: "Performance",
    summary: "KES 25,950 of KES 50,850 spent",
  },
  {
    id: "weather",
    label: "Weather Overlay",
    description: "Rain received, crop need and weekly impact",
    defaultOn: true,
    availability: "available",
    category: "Water",
    summary: "30 mm received · 40 mm month deficit",
  },
  {
    id: "yield",
    label: "Yield Prediction",
    description: "AI-updated yield, revenue and confidence",
    defaultOn: true,
    availability: "available",
    category: "Performance",
    summary: "14,500 heads · KES 435,000 · 72%",
  },
  {
    id: "benchmark",
    label: "Compare to Benchmark",
    description: "Compare with Kiambu cabbage farms",
    defaultOn: true,
    availability: "available",
    category: "Performance",
    summary: "Top 32% on plant survival",
  },
];

export const GRAIN_WIDGETS: CropWidgetDefinition[] = [
  {
    id: "land-prep",
    label: "Land Preparation",
    description: "Ploughing, harrowing and row setup",
    defaultOn: true,
    availability: "available",
    category: "Establishment",
    summary: "Completed before planting",
  },
  {
    id: "planting-log",
    label: "Planting Log",
    description: "Seed, spacing, depth and basal fertilizer",
    defaultOn: true,
    availability: "available",
    category: "Establishment",
    summary: "H6213 · 75 × 25 cm",
  },
  {
    id: "germination",
    label: "Germination Rate",
    description: "Stand counts and gap-filling",
    defaultOn: true,
    availability: "available",
    category: "Evidence",
    summary: "92% stand established",
  },
  {
    id: "fertilizer",
    label: "Fertilizer Schedule · DAP + CAN",
    description: "Basal and top-dress nutrition",
    defaultOn: true,
    availability: "available",
    category: "Nutrition",
    summary: "Top dress 1 due",
  },
  {
    id: "weed",
    label: "Weed Control",
    description: "Hand and herbicide weed rounds",
    defaultOn: true,
    availability: "available",
    category: "Protection",
    summary: "Second weed round planned",
  },
  {
    id: "armyworm",
    label: "Fall Armyworm Monitor",
    description: "Scouting and action threshold",
    defaultOn: true,
    availability: "available",
    category: "Protection",
    summary: "Low pressure · 5% plants",
  },
  {
    id: "tasseling",
    label: "Tasseling & Silking Tracker",
    description: "Pollination-window monitoring",
    defaultOn: true,
    availability: "available",
    category: "Evidence",
    summary: "Starts 19 Dec",
  },
  {
    id: "grain-fill",
    label: "Grain Filling Monitor",
    description: "Kernel set and crop stress",
    defaultOn: true,
    availability: "available",
    category: "Evidence",
    summary: "Upcoming",
  },
  {
    id: "moisture",
    label: "Moisture Content Tracker",
    description: "Field and stored grain moisture",
    defaultOn: true,
    availability: "available",
    category: "Harvest",
    summary: "Target 13.5% at storage",
  },
  {
    id: "harvest",
    label: "Harvest & Threshing",
    description: "Harvest crew and shelling records",
    defaultOn: true,
    availability: "available",
    category: "Harvest",
    summary: "March 2027",
  },
  {
    id: "storage",
    label: "Drying & Storage",
    description: "Drying floor, bags and aflatoxin controls",
    defaultOn: true,
    availability: "available",
    category: "Harvest",
    summary: "Hermetic bags required",
  },
  {
    id: "staking",
    label: "Staking / Trellising",
    description: "Never used for maize",
    defaultOn: false,
    availability: "hidden",
    category: "Specialist",
    summary: "Not applicable",
  },
  {
    id: "nursery",
    label: "Nursery Tracker",
    description: "Never used for direct-seeded maize",
    defaultOn: false,
    availability: "hidden",
    category: "Specialist",
    summary: "Not applicable",
  },
];

export const INDUSTRIAL_WIDGETS: CropWidgetDefinition[] = [
  {
    id: "ridges",
    label: "Land Preparation & Ridges",
    description: "Long-season field setup",
    defaultOn: true,
    availability: "available",
    category: "Establishment",
    summary: "Drainage and rows prepared",
  },
  {
    id: "setts",
    label: "Planting · Setts / Seedlings",
    description: "Certified planting material log",
    defaultOn: true,
    availability: "available",
    category: "Establishment",
    summary: "Material batch verified",
  },
  {
    id: "tillering",
    label: "Germination & Tillering",
    description: "Stand and tiller counts",
    defaultOn: true,
    availability: "available",
    category: "Evidence",
    summary: "Establishment monitoring",
  },
  {
    id: "fertilizer",
    label: "Multi-Year Fertilizer Schedule",
    description: "Long-cycle nutrition dates",
    defaultOn: true,
    availability: "available",
    category: "Nutrition",
    summary: "Current-year plan loaded",
  },
  {
    id: "weed",
    label: "Weed & Ratoon Management",
    description: "Weeding and ratoon-cycle controls",
    defaultOn: true,
    availability: "available",
    category: "Protection",
    summary: "Next round scheduled",
  },
  {
    id: "irrigation",
    label: "Irrigation / Rainfall Log",
    description: "Long-season water balance",
    defaultOn: true,
    availability: "available",
    category: "Water",
    summary: "Rain-fed with mulch",
  },
  {
    id: "pest",
    label: "Stem Borer & Disease Monitor",
    description: "Industrial crop protection",
    defaultOn: true,
    availability: "available",
    category: "Protection",
    summary: "No active outbreak",
  },
  {
    id: "ratoon",
    label: "Ratoon Cycle Tracker",
    description: "Cycle age and productivity",
    defaultOn: true,
    availability: "available",
    category: "Specialist",
    summary: "Plant crop cycle",
  },
  {
    id: "trashing",
    label: "Trashing",
    description: "Leaf and field sanitation rounds",
    defaultOn: true,
    availability: "available",
    category: "Protection",
    summary: "Upcoming by cycle",
  },
  {
    id: "harvest",
    label: "Harvest Cycle",
    description: "Maturity and harvest scheduling",
    defaultOn: true,
    availability: "available",
    category: "Harvest",
    summary: "Enterprise maturity profile",
  },
  {
    id: "factory",
    label: "Transport to Factory",
    description: "Haulage, weighbridge and delivery",
    defaultOn: true,
    availability: "available",
    category: "Harvest",
    summary: "Factory route to confirm",
  },
  {
    id: "payment",
    label: "Factory Payment Tracking",
    description: "Delivery statement and settlement",
    defaultOn: true,
    availability: "available",
    category: "Performance",
    summary: "No settlement due",
  },
];

export const CABBAGE_FERTILIZER_SCHEDULE: FertilizerScheduleRow[] = [
  {
    id: "fert-01",
    cropId: "crop-cabbage",
    number: 1,
    date: "20 Oct",
    stage: "Planting",
    fertilizer: "DAP",
    rate: "50 kg/acre → 25 kg for 0.5 ac",
    method: "Basal in planting hole",
    purpose: "Root development",
    actualDate: "20 Oct",
    actualCost: 3250,
    status: "Applied",
  },
  {
    id: "fert-02",
    cropId: "crop-cabbage",
    number: 2,
    date: "03 Nov",
    stage: "Vegetative · 2 weeks",
    fertilizer: "CAN",
    rate: "50 kg/acre → 25 kg",
    method: "Side dress along rows",
    purpose: "Leaf growth",
    actualDate: "Not applied",
    actualCost: null,
    status: "Due",
  },
  {
    id: "fert-03",
    cropId: "crop-cabbage",
    number: 3,
    date: "20 Nov",
    stage: "Late vegetative",
    fertilizer: "CAN",
    rate: "25 kg/acre → 12.5 kg",
    method: "Side dress",
    purpose: "Sustained growth",
    actualDate: "Not applied",
    actualCost: null,
    status: "Upcoming",
  },
  {
    id: "fert-04",
    cropId: "crop-cabbage",
    number: 4,
    date: "10 Dec",
    stage: "Pre-heading",
    fertilizer: "Potassium foliar",
    rate: "1 L/acre → 0.5 L",
    method: "Foliar spray",
    purpose: "Head formation",
    actualDate: "Not applied",
    actualCost: null,
    status: "Upcoming",
  },
];

export const FERTILIZER_HISTORY: FertilizerScheduleRow[] = [
  ...CABBAGE_FERTILIZER_SCHEDULE,
  {
    id: "fert-05",
    cropId: "crop-maize",
    number: 1,
    date: "12 Oct",
    stage: "Planting",
    fertilizer: "DAP",
    rate: "50 kg/acre",
    method: "Band placement",
    purpose: "Root establishment",
    actualDate: "12 Oct",
    actualCost: 7800,
    status: "Applied",
  },
  {
    id: "fert-06",
    cropId: "crop-maize",
    number: 2,
    date: "18 Nov",
    stage: "Vegetative",
    fertilizer: "CAN",
    rate: "50 kg/acre",
    method: "Side dress",
    purpose: "Leaf and stem growth",
    actualDate: "Not applied",
    actualCost: null,
    status: "Due",
  },
  {
    id: "fert-07",
    cropId: "crop-tomato",
    number: 1,
    date: "05 Oct",
    stage: "Transplanting",
    fertilizer: "NPK 17:17:17",
    rate: "12 kg for 0.2 ac",
    method: "Basal",
    purpose: "Establishment",
    actualDate: "05 Oct",
    actualCost: 2400,
    status: "Applied",
  },
  {
    id: "fert-08",
    cropId: "crop-potato",
    number: 1,
    date: "28 Sep",
    stage: "Planting",
    fertilizer: "NPK 17:17:17",
    rate: "60 kg for 0.6 ac",
    method: "Band placement",
    purpose: "Tuber establishment",
    actualDate: "28 Sep",
    actualCost: 8100,
    status: "Applied",
  },
  {
    id: "fert-09",
    cropId: "crop-onion",
    number: 1,
    date: "29 Oct",
    stage: "Leaf development",
    fertilizer: "CAN",
    rate: "10 kg for 0.3 ac",
    method: "Side dress",
    purpose: "Leaf growth",
    actualDate: "29 Oct",
    actualCost: 1050,
    status: "Applied",
  },
  {
    id: "fert-10",
    cropId: "crop-kale",
    number: 2,
    date: "06 Nov",
    stage: "Vegetative",
    fertilizer: "CAN",
    rate: "5 kg for 0.1 ac",
    method: "Side dress",
    purpose: "Leaf harvest",
    actualDate: "06 Nov",
    actualCost: 550,
    status: "Applied",
  },
];

export const PEST_RISKS: PestRiskRow[] = [
  {
    id: "pest-dbm",
    pest: "Diamondback moth",
    risk: "Medium",
    tone: "medium",
    identification: "Small green caterpillars and windowed leaves",
    damage: "Holes in leaves and stunting",
    treatment: "Duduthrin 1.5 ml/20 L · evening",
    cost: 1500,
  },
  {
    id: "pest-aphid",
    pest: "Aphids",
    risk: "Low",
    tone: "low",
    identification: "Green clusters on leaf undersides",
    damage: "Curling, honeydew and sooty mold",
    treatment: "Imidacloprid 10 ml/20 L",
    cost: 800,
  },
  {
    id: "pest-cutworm",
    pest: "Cutworms",
    risk: "Low · past risk",
    tone: "low",
    identification: "Seedlings cut at soil level",
    damage: "Seedling death and gaps",
    treatment: "Targeted dust at planting base",
    cost: 500,
  },
  {
    id: "pest-bagrada",
    pest: "Bagrada bug",
    risk: "Medium",
    tone: "medium",
    identification: "Small black and orange bugs",
    damage: "Wilting and dead hearts",
    treatment: "Lambda-cyhalothrin at label rate",
    cost: 1200,
  },
];

export const DISEASE_RISKS: DiseaseRiskRow[] = [
  {
    id: "disease-blackrot",
    disease: "Black rot · Xanthomonas",
    risk: "High · wet season",
    tone: "high",
    symptoms: "V-shaped yellow lesions from leaf margins",
    prevention: "Copper-based protection and no overhead watering",
    treatment: "Mancozeb 50 g/20 L",
    phi: "14 days",
  },
  {
    id: "disease-clubroot",
    disease: "Clubroot",
    risk: "Low",
    tone: "low",
    symptoms: "Swollen roots and daytime wilting",
    prevention: "Lime application and Brassica rotation",
    treatment: "No curative treatment",
    phi: "Not applicable",
  },
  {
    id: "disease-downy",
    disease: "Downy mildew",
    risk: "Medium",
    tone: "medium",
    symptoms: "Yellow upper patches and grey fuzz below",
    prevention: "Adequate spacing and leaf dryness",
    treatment: "Metalaxyl + Mancozeb",
    phi: "14 days",
  },
  {
    id: "disease-alternaria",
    disease: "Alternaria leaf spot",
    risk: "Medium",
    tone: "medium",
    symptoms: "Dark spots with concentric rings",
    prevention: "Remove infected outer leaves",
    treatment: "Mancozeb at label rate",
    phi: "14 days",
  },
];

export const SCOUTING_LOG: ScoutingRecord[] = [
  {
    id: "scout-01",
    date: "25 Oct",
    found: "2 Diamondback moth larvae",
    severity: 2,
    areaAffected: "10%",
    action: "Monitored · no spray",
    photoRef: "GM-PH-1025-A",
    scout: "Mary",
  },
  {
    id: "scout-02",
    date: "08 Nov",
    found: "Black rot on 5 plants",
    severity: 4,
    areaAffected: "5%",
    action: "Removed plants + Mancozeb",
    photoRef: "GM-PH-1108-B",
    scout: "Mary",
  },
  {
    id: "scout-03",
    date: "15 Nov",
    found: "Aphids on 3 plants",
    severity: 3,
    areaAffected: "2%",
    action: "Imidacloprid applied",
    photoRef: "GM-PH-1115-C",
    scout: "Peter",
  },
  {
    id: "scout-04",
    date: "22 Nov",
    found: "No new black-rot lesions",
    severity: 1,
    areaAffected: "Below 1%",
    action: "Continued monitoring",
    photoRef: "GM-PH-1122-D",
    scout: "Mary",
  },
  {
    id: "scout-05",
    date: "29 Nov",
    found: "1 Bagrada bug cluster",
    severity: 2,
    areaAffected: "1%",
    action: "Hand removed",
    photoRef: "GM-PH-1129-E",
    scout: "Lucy",
  },
  {
    id: "scout-06",
    date: "06 Dec",
    found: "Diamondback moth feeding",
    severity: 3,
    areaAffected: "6%",
    action: "Threshold review",
    photoRef: "GM-PH-1206-F",
    scout: "Mary",
  },
  {
    id: "scout-07",
    date: "13 Dec",
    found: "Aphid colonies on outer row",
    severity: 4,
    areaAffected: "4%",
    action: "Spot treatment",
    photoRef: "GM-PH-1213-G",
    scout: "Peter",
  },
  {
    id: "scout-08",
    date: "20 Dec",
    found: "Alternaria spots · 4 leaves",
    severity: 2,
    areaAffected: "1%",
    action: "Leaves removed",
    photoRef: "GM-PH-1220-H",
    scout: "Mary",
  },
  {
    id: "scout-09",
    date: "03 Jan",
    found: "No economic pest pressure",
    severity: 1,
    areaAffected: "Below 1%",
    action: "No treatment",
    photoRef: "GM-PH-0103-I",
    scout: "Lucy",
  },
  {
    id: "scout-10",
    date: "10 Jan",
    found: "Firm heads · no fresh lesions",
    severity: 1,
    areaAffected: "None",
    action: "Cleared for PHI review",
    photoRef: "GM-PH-0110-J",
    scout: "Mary",
  },
];

export const WEATHER_OVERLAY: WeatherOverlayRow[] = [
  {
    id: "weather-01",
    period: "Week 1 · 20–26 Oct",
    needed: 15,
    received: 18,
    forecast: null,
    variance: 3,
    impact: "Good establishment",
    tone: "low",
  },
  {
    id: "weather-02",
    period: "Week 2 · 27 Oct–02 Nov",
    needed: 15,
    received: 12,
    forecast: null,
    variance: -3,
    impact: "Slight stress · irrigate if possible",
    tone: "medium",
  },
  {
    id: "weather-03",
    period: "Week 3 · 03–09 Nov",
    needed: 20,
    received: null,
    forecast: 25,
    variance: 5,
    impact: "Forecast meets need",
    tone: "low",
  },
  {
    id: "weather-04",
    period: "Week 4 · 10–16 Nov",
    needed: 20,
    received: null,
    forecast: 30,
    variance: 10,
    impact: "Wet · black-rot pressure",
    tone: "high",
  },
  {
    id: "weather-05",
    period: "Month 1 total",
    needed: 70,
    received: 30,
    forecast: 55,
    variance: -40,
    impact: "Below normal so far · monitor",
    tone: "medium",
  },
  {
    id: "weather-06",
    period: "Week 5 · 17–23 Nov",
    needed: 22,
    received: null,
    forecast: 19,
    variance: -3,
    impact: "Heading begins · protect moisture",
    tone: "medium",
  },
  {
    id: "weather-07",
    period: "Week 6 · 24–30 Nov",
    needed: 22,
    received: null,
    forecast: 23,
    variance: 1,
    impact: "Balanced heading moisture",
    tone: "low",
  },
  {
    id: "weather-08",
    period: "Week 7 · 01–07 Dec",
    needed: 20,
    received: null,
    forecast: 17,
    variance: -3,
    impact: "Drip backup may be needed",
    tone: "medium",
  },
  {
    id: "weather-09",
    period: "Week 8 · 08–14 Dec",
    needed: 18,
    received: null,
    forecast: 16,
    variance: -2,
    impact: "Monitor head firmness",
    tone: "medium",
  },
  {
    id: "weather-10",
    period: "Pre-harvest · 08–14 Jan",
    needed: 8,
    received: null,
    forecast: 5,
    variance: -3,
    impact: "Drier conditions favour harvest",
    tone: "low",
  },
];

export const GROWTH_PHOTOS: GrowthPhoto[] = [
  {
    id: "photo-01",
    date: "20 Oct",
    stage: "Transplanting",
    note: "Seedlings 10 cm tall with a good root system",
    status: "Logged",
    plantsVisible: "42 seedlings",
    capturedBy: "Mary",
    reference: "GM-CAB-1020-A",
  },
  {
    id: "photo-02",
    date: "27 Oct",
    stage: "Vegetative · Day 7",
    note: "New leaves forming with no visible stress",
    status: "Logged",
    plantsVisible: "36 plants",
    capturedBy: "Mary",
    reference: "GM-CAB-1027-B",
  },
  {
    id: "photo-03",
    date: "03 Nov",
    stage: "Vegetative · Day 14",
    note: "Five to six leaves and healthy green colour",
    status: "Logged",
    plantsVisible: "31 plants",
    capturedBy: "John",
    reference: "GM-CAB-1103-C",
  },
  {
    id: "photo-04",
    date: "10 Nov",
    stage: "Vegetative · Day 21",
    note: "Capture canopy spread after second weeding",
    status: "Scheduled",
    plantsVisible: "Target 30 plants",
    capturedBy: "Mary",
    reference: "GM-CAB-1110-D",
  },
  {
    id: "photo-05",
    date: "17 Nov",
    stage: "Vegetative · Day 28",
    note: "Capture final vegetative stand and nutrition colour",
    status: "Scheduled",
    plantsVisible: "Target 30 plants",
    capturedBy: "Mary",
    reference: "GM-CAB-1117-E",
  },
  {
    id: "photo-06",
    date: "24 Nov",
    stage: "Heading · Day 5",
    note: "First signs of head formation",
    status: "Scheduled",
    plantsVisible: "Target 25 plants",
    capturedBy: "Lucy",
    reference: "GM-CAB-1124-F",
  },
  {
    id: "photo-07",
    date: "08 Dec",
    stage: "Heading · Day 19",
    note: "Heads filling and outer leaves protecting well",
    status: "Scheduled",
    plantsVisible: "Target 25 plants",
    capturedBy: "Mary",
    reference: "GM-CAB-1208-G",
  },
  {
    id: "photo-08",
    date: "22 Dec",
    stage: "Heading · Day 33",
    note: "Firm heads approaching maturity",
    status: "Scheduled",
    plantsVisible: "Target 20 plants",
    capturedBy: "Mary",
    reference: "GM-CAB-1222-H",
  },
  {
    id: "photo-09",
    date: "15 Jan",
    stage: "Harvest",
    note: "Document market-ready heads and grading",
    status: "Scheduled",
    plantsVisible: "Full harvest sample",
    capturedBy: "John",
    reference: "GM-CAB-0115-I",
  },
];

export const YIELD_FACTORS: YieldFactor[] = [
  {
    id: "yield-weather",
    factor: "Weather",
    status: "Slightly below rainfall",
    impact: -5,
    note: "30 mm received against 70 mm month need so far",
    tone: "medium",
  },
  {
    id: "yield-pests",
    factor: "Pest pressure",
    status: "Low to moderate",
    impact: -2,
    note: "Diamondback moth remains below spray threshold",
    tone: "medium",
  },
  {
    id: "yield-disease",
    factor: "Disease pressure",
    status: "Moderate · black rot",
    impact: -8,
    note: "Wet-season risk and five affected plants",
    tone: "high",
  },
  {
    id: "yield-fertilizer",
    factor: "Fertilizer timing",
    status: "On schedule",
    impact: 0,
    note: "DAP applied; first CAN due 03 Nov",
    tone: "low",
  },
  {
    id: "yield-weeds",
    factor: "Weed management",
    status: "Good",
    impact: 0,
    note: "Two manual weed rounds planned",
    tone: "low",
  },
  {
    id: "yield-variety",
    factor: "Variety potential",
    status: "Gloria F1 · 17,000 heads/acre",
    impact: null,
    note: "Certified-seed baseline",
    tone: "low",
  },
];

export const COST_LEDGER: CostLedgerRow[] = [
  {
    id: "cost-01",
    date: "18 Sep",
    category: "Seed",
    description: "Gloria F1 · four 50 g sachets",
    supplier: "Githunguri Farmers Agrovet",
    method: "M-Pesa",
    reference: "RIT4M2N8QP",
    budget: 3200,
    actual: 3200,
  },
  {
    id: "cost-02",
    date: "19 Sep",
    category: "Nursery",
    description: "Shade net and nursery media",
    supplier: "Limuru Farm Inputs",
    method: "M-Pesa",
    reference: "RIT8K1A4CW",
    budget: 2800,
    actual: 2650,
  },
  {
    id: "cost-03",
    date: "18 Oct",
    category: "Land",
    description: "Ploughing and harrowing · 0.5 acre",
    supplier: "Kamau Tractor Services",
    method: "Cash",
    reference: "CASH-1810",
    budget: 3000,
    actual: 3000,
  },
  {
    id: "cost-04",
    date: "19 Oct",
    category: "Manure",
    description: "2.5 tonnes well-rotted manure",
    supplier: "Githunguri Dairy Group",
    method: "M-Pesa",
    reference: "RJT2B6D9KM",
    budget: 15000,
    actual: 15000,
  },
  {
    id: "cost-05",
    date: "20 Oct",
    category: "Fertilizer",
    description: "25 kg DAP basal",
    supplier: "Kiambu Seed Centre",
    method: "M-Pesa",
    reference: "RJT6P3L7NE",
    budget: 3250,
    actual: 3250,
  },
  {
    id: "cost-06",
    date: "20 Oct",
    category: "Labour",
    description: "Field preparation · two workers",
    supplier: "John + Peter",
    method: "M-Pesa",
    reference: "RJT9H4Q2SX",
    budget: 1000,
    actual: 1000,
  },
  {
    id: "cost-07",
    date: "20 Oct",
    category: "Labour",
    description: "Transplanting · five workers",
    supplier: "Field crew",
    method: "M-Pesa",
    reference: "RJK3D8V5TY",
    budget: 2500,
    actual: 2500,
  },
  {
    id: "cost-08",
    date: "25 Oct",
    category: "Labour",
    description: "First weeding · planned",
    supplier: "Local field crew",
    method: "Scheduled",
    reference: "GM-SCH-1025",
    budget: 1500,
    actual: 0,
  },
  {
    id: "cost-09",
    date: "03 Nov",
    category: "Fertilizer",
    description: "25 kg CAN · planned",
    supplier: "Githunguri Farmers Agrovet",
    method: "Scheduled",
    reference: "GM-SCH-1103",
    budget: 2750,
    actual: 0,
  },
  {
    id: "cost-10",
    date: "15 Nov",
    category: "Protection",
    description: "Mancozeb + applicator · planned",
    supplier: "Ngewa Farm Supplies",
    method: "Scheduled",
    reference: "GM-SCH-1115",
    budget: 1000,
    actual: 0,
  },
];

export const BENCHMARK_ROWS: BenchmarkRow[] = [
  {
    id: "bench-01",
    metric: "Seedling survival",
    mary: "96%",
    kiambuMedian: "91%",
    topQuartile: "95%",
    position: "Top quartile",
    tone: "low",
  },
  {
    id: "bench-02",
    metric: "Plant population · 0.5 ac",
    mary: "8,420",
    kiambuMedian: "8,100",
    topQuartile: "8,500",
    position: "Strong",
    tone: "low",
  },
  {
    id: "bench-03",
    metric: "Cost / live plant",
    mary: "KES 3.08",
    kiambuMedian: "KES 3.34",
    topQuartile: "KES 2.95",
    position: "Above median",
    tone: "low",
  },
  {
    id: "bench-04",
    metric: "Black-rot affected plants",
    mary: "0.6%",
    kiambuMedian: "1.8%",
    topQuartile: "0.5%",
    position: "Near top quartile",
    tone: "low",
  },
  {
    id: "bench-05",
    metric: "Weed-control timing",
    mary: "On time",
    kiambuMedian: "+2 days",
    topQuartile: "On time",
    position: "On target",
    tone: "low",
  },
  {
    id: "bench-06",
    metric: "Fertilizer timing",
    mary: "On schedule",
    kiambuMedian: "+3 days",
    topQuartile: "On schedule",
    position: "On target",
    tone: "low",
  },
  {
    id: "bench-07",
    metric: "Water balance · month 1",
    mary: "−40 mm",
    kiambuMedian: "−28 mm",
    topQuartile: "−10 mm",
    position: "Needs attention",
    tone: "medium",
  },
  {
    id: "bench-08",
    metric: "Predicted heads · 0.5 ac",
    mary: "14,500",
    kiambuMedian: "13,800",
    topQuartile: "15,100",
    position: "Above median",
    tone: "low",
  },
  {
    id: "bench-09",
    metric: "Predicted rejection",
    mary: "8%",
    kiambuMedian: "12%",
    topQuartile: "7%",
    position: "Strong",
    tone: "low",
  },
  {
    id: "bench-10",
    metric: "Record completeness",
    mary: "92%",
    kiambuMedian: "68%",
    topQuartile: "90%",
    position: "Top quartile",
    tone: "low",
  },
];

export const CROP_ACTIVITY: CropActivityRow[] = [
  {
    id: "activity-01",
    at: "13 Nov · 16:40",
    event: "Weather risk recalculated",
    detail: "Wet November raised black-rot risk to high",
    by: "GrowMO Weather",
    type: "weather",
  },
  {
    id: "activity-02",
    at: "13 Nov · 09:10",
    event: "Crop health reviewed",
    detail: "Health remains 85/100 after field check",
    by: "Mary",
    type: "health",
  },
  {
    id: "activity-03",
    at: "12 Nov · 17:25",
    event: "Growth photo reviewed",
    detail: "Vegetative canopy developing evenly",
    by: "Lucy",
    type: "photo",
  },
  {
    id: "activity-04",
    at: "10 Nov · 11:20",
    event: "Second weeding scheduled",
    detail: "Two workers assigned for one day",
    by: "Mary",
    type: "task",
  },
  {
    id: "activity-05",
    at: "08 Nov · 15:45",
    event: "Scouting record added",
    detail: "Five black-rot plants removed",
    by: "Mary",
    type: "health",
  },
  {
    id: "activity-06",
    at: "06 Nov · 10:05",
    event: "Mancozeb stock checked",
    detail: "One kilogram available in farm store",
    by: "Peter",
    type: "input",
  },
  {
    id: "activity-07",
    at: "05 Nov · 08:30",
    event: "Diamondback moth scout complete",
    detail: "Below spray threshold",
    by: "Mary",
    type: "task",
  },
  {
    id: "activity-08",
    at: "03 Nov · 07:50",
    event: "Growth photo logged",
    detail: "Five to six leaves, healthy green colour",
    by: "John",
    type: "photo",
  },
  {
    id: "activity-09",
    at: "25 Oct · 13:15",
    event: "First weeding prepared",
    detail: "Three-worker crew cost confirmed",
    by: "John",
    type: "task",
  },
  {
    id: "activity-10",
    at: "20 Oct · 18:20",
    event: "Transplanting completed",
    detail: "96% survival estimate at 45 × 45 cm",
    by: "Mary",
    type: "task",
  },
];

export const INPUT_SUPPLIERS: InputSupplierRow[] = [
  {
    id: "input-01",
    supplier: "Githunguri Farmers Agrovet",
    town: "Githunguri",
    phone: "0722 115 480",
    item: "Mancozeb 80% WP",
    pack: "1 kg",
    price: 1450,
    stock: 12,
    verified: true,
  },
  {
    id: "input-02",
    supplier: "Limuru Mbegu & Inputs",
    town: "Limuru",
    phone: "0716 308 244",
    item: "Mancozeb 80% WP",
    pack: "500 g",
    price: 780,
    stock: 18,
    verified: true,
  },
  {
    id: "input-03",
    supplier: "Kiambu Seed Centre",
    town: "Kiambu",
    phone: "0799 410 882",
    item: "CAN fertilizer",
    pack: "25 kg",
    price: 2750,
    stock: 34,
    verified: true,
  },
  {
    id: "input-04",
    supplier: "Thika Road Agrochem",
    town: "Ruiru",
    phone: "0708 221 957",
    item: "Duduthrin",
    pack: "1 litre",
    price: 1500,
    stock: 8,
    verified: true,
  },
  {
    id: "input-05",
    supplier: "Ngewa Farm Supplies",
    town: "Ngewa",
    phone: "0112 480 765",
    item: "Imidacloprid",
    pack: "250 ml",
    price: 820,
    stock: 11,
    verified: true,
  },
  {
    id: "input-06",
    supplier: "Wakulima Digital Agrovet",
    town: "Nairobi",
    phone: "0740 335 901",
    item: "Potassium foliar",
    pack: "1 litre",
    price: 1200,
    stock: 21,
    verified: true,
  },
  {
    id: "input-07",
    supplier: "Karatina Certified Inputs",
    town: "Karatina",
    phone: "0728 944 118",
    item: "Copper oxychloride",
    pack: "1 kg",
    price: 1650,
    stock: 7,
    verified: true,
  },
  {
    id: "input-08",
    supplier: "Murang'a Green Inputs",
    town: "Murang'a",
    phone: "0755 602 440",
    item: "Metalaxyl + Mancozeb",
    pack: "500 g",
    price: 1350,
    stock: 5,
    verified: true,
  },
  {
    id: "input-09",
    supplier: "Nyeri Highlands Agrovet",
    town: "Nyeri",
    phone: "0711 843 620",
    item: "Agricultural lime",
    pack: "50 kg",
    price: 750,
    stock: 43,
    verified: false,
  },
  {
    id: "input-10",
    supplier: "Gatundu Farmcare",
    town: "Gatundu",
    phone: "0788 117 302",
    item: "Nitrile PPE kit",
    pack: "1 operator kit",
    price: 950,
    stock: 16,
    verified: true,
  },
];

export const CURRENT_STAGE_FACTS = [
  { id: "stage-name", label: "Stage name", value: "Vegetative Growth" },
  { id: "stage-start", label: "Started", value: "20 Oct 2026" },
  { id: "stage-end", label: "Estimated end", value: "20 Nov 2026" },
  { id: "stage-duration", label: "Duration", value: "30 days" },
  { id: "stage-day", label: "Days in stage", value: "4 of 30" },
  { id: "stage-next", label: "Next stage", value: "Heading · 20 Nov" },
] as const;

export const CURRENT_STAGE_ACTIVITIES = [
  "First and second weeding",
  "Top dressing with CAN",
  "Diamondback moth and aphid scouting",
  "Black-rot prevention in wet periods",
  "Consistent irrigation and drainage checks",
] as const;

export const CURRENT_STAGE_CONDITIONS =
  "15–25°C, adequate and even moisture, available nitrogen for leaf growth, dry foliage before spray work, and free drainage after heavy rain.";

export const FERTILIZER_AI_RECOMMENDATION =
  "Based on your soil test (pH 5.8, low calcium), consider adding 50 kg/acre of agricultural lime during land preparation next season. Your manure application is adequate — no additional organic matter is needed this season.";
