/* ============================================================================
   PAGE 12 — RECORDS, TRACEABILITY & COMPLIANCE  (/app/records)
   Kenyan demo record-keeping for Mary's Farm, Githunguri (Kiambu).

   Blueprint sections covered by this dataset:
   12.1 farm diary · 12.2 compliance-grade spray record · 12.3 input purchase
   records · 12.4 harvest & batch traceability · 12.5 certification tracker ·
   12.6 soil test records. Money, batch, invoice and M-Pesa references are
   realistic but fictional. Season: LR 2026 (long rains) harvest window.
   ========================================================================== */

export const RECORD_CONTEXT = {
  farm: "Mary's Farm",
  farmer: "Mary Wanjiku",
  idNumber: "12345678",
  county: "Kiambu",
  subCounty: "Githunguri",
  ward: "Githunguri",
  village: "Kagwe Road",
  phone: "0712 345 678",
  season: "LR 2026 · Long rains",
  batchPrefix: "GRM-KMB-2026",
  complianceScore: 78,
  auditWindow: "02 – 20 Nov 2026",
  countyReg: "KMB/GTH/FARM/2026/0417",
  walletBalance: 35000,
  kephisDealer: "KEPHIS-SC-5678",
  pcpbCert: "PCPB-8765",
  lastBackup: "Today, 06:40 · offline sync complete",
  mpesaName: "MARY WANJIKU K",
  mpesaPhone: "0712 345 678",
};

/* ---------------------------------------------------------------- 12.1 diary */

export type DiaryEntryType =
  | "Activity"
  | "Observation"
  | "Weather event"
  | "Decision"
  | "Market observation"
  | "Problem"
  | "Input use"
  | "Harvest";

export interface DiaryEntry {
  id: string;
  date: string;
  iso: string;
  type: DiaryEntryType;
  content: string;
  crop: string;
  variety: string;
  plot: string;
  location: string;
  weather: string;
  author: string;
  photos: string[];
  tags: string[];
  linked: string;
  severity?: "low" | "medium" | "high";
}

export const DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: "d-014",
    date: "18 Sep 2026",
    iso: "2026-09-18",
    type: "Observation",
    content:
      "Kukagua cabbage baada ya mvua ya jana. Heads forming well, only 6 plants show cutworm nicks at the lower leaves of Plot 1 NW corner.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1 · NW corner",
    weather: "Cloudy, 21°C, 4.1 mm rain",
    author: "Mary Wanjiku",
    photos: ["cutworm-nicks-18sep.jpg", "plot1-heads-18sep.jpg"],
    tags: ["scouting", "cutworm"],
    linked: "SR-004",
    severity: "low",
  },
  {
    id: "d-013",
    date: "15 Sep 2026",
    iso: "2026-09-15",
    type: "Input use",
    content:
      "Top-dressed 12 kg CAN over 0.5 acre of cabbage, hand-broadcast then watered in. Kamau helped; paid KES 400 via M-Pesa (SFK4T2L8MD).",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1",
    weather: "Sunny morning, 24°C",
    author: "Mary Wanjiku",
    photos: ["can-sacks-15sep.jpg"],
    tags: ["fertilizer", "labour"],
    linked: "PUR-011",
  },
  {
    id: "d-012",
    date: "12 Sep 2026",
    iso: "2026-09-12",
    type: "Problem",
    content:
      "Black rot kuonekana kwa mimea 4 karibu na mfereji wa maji — V-shaped yellow lesions with black veins. Uprooted and burned all four outside the shamba.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1 · near drainage furrow",
    weather: "Humid after 3 days of rain",
    author: "Mary Wanjiku",
    photos: ["blackrot-lesion-12sep.jpg"],
    tags: ["black rot", "sanitation"],
    linked: "SR-004",
    severity: "high",
  },
  {
    id: "d-011",
    date: "09 Sep 2026",
    iso: "2026-09-09",
    type: "Decision",
    content:
      "Decided to skip the third weeding — weeds are minimal and the canopy has closed. Saved roughly KES 1,500 in casual labour.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1",
    weather: "Dry, 26°C",
    author: "Mary Wanjiku",
    photos: [],
    tags: ["decision", "cost saving"],
    linked: "",
  },
  {
    id: "d-010",
    date: "05 Sep 2026",
    iso: "2026-09-05",
    type: "Weather event",
    content:
      "Heavy overnight rain, 38 mm recorded at the Githunguri station. Slight waterlogging in the low strip of Plot 1 — opened a shallow cut-off drain.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1 · low strip",
    weather: "Storm, 38 mm",
    author: "Mary Wanjiku",
    photos: ["waterlogging-05sep.jpg"],
    tags: ["rain", "drainage"],
    linked: "",
    severity: "medium",
  },
  {
    id: "d-009",
    date: "01 Sep 2026",
    iso: "2026-09-01",
    type: "Market observation",
    content:
      "Cabbage prices at Marikiti dropped to KES 22 per head, but Grade A heads are still moving at KES 30 with Twiga Foods. Holding harvest for two more weeks.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "—",
    location: "Marikiti Market, Nairobi",
    weather: "—",
    author: "Mary Wanjiku",
    photos: [],
    tags: ["market", "pricing"],
    linked: "BATCH-018",
  },
  {
    id: "d-008",
    date: "28 Aug 2026",
    iso: "2026-08-28",
    type: "Activity",
    content:
      "Second weeding done by three casuals (Wanjiru, Njeri, Kamau) — 6 hours each at KES 350. Total KES 6,300 released through the GrowMO wallet.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1",
    weather: "Sunny, 25°C",
    author: "Mary Wanjiku",
    photos: ["weeding-crew-28aug.jpg"],
    tags: ["weeding", "payroll"],
    linked: "SR-003",
  },
  {
    id: "d-007",
    date: "24 Aug 2026",
    iso: "2026-08-24",
    type: "Input use",
    content:
      "Sprayed Imidacloprid 200SL 10 ml/20 L for aphids — 100 L over 0.5 acre. Applicator: self, full PPE (gloves, mask, overall, gumboots). Wind 3 km/h SE.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1",
    weather: "Clear, 25°C",
    author: "Mary Wanjiku",
    photos: ["spray-24aug.jpg"],
    tags: ["aphids", "spray"],
    linked: "SR-003",
  },
  {
    id: "d-006",
    date: "20 Aug 2026",
    iso: "2026-08-20",
    type: "Observation",
    content:
      "Aphids (Kiswahili: vidukari) building on the underside of 3 out of every 10 plants after the dry spell. Ladybird numbers are low, so a spray will be needed.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1 · centre rows",
    weather: "Hot and dry, 28°C",
    author: "Mary Wanjiku",
    photos: ["aphids-20aug.jpg"],
    tags: ["aphids", "scouting"],
    linked: "SR-003",
    severity: "medium",
  },
  {
    id: "d-005",
    date: "14 Aug 2026",
    iso: "2026-08-14",
    type: "Activity",
    content:
      "Second top-dress: 25 kg CAN broadcast on Plot 1 and watered in the same evening. Recorded the 50 kg bag into stock as used.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1",
    weather: "Warm, 24°C",
    author: "Mary Wanjiku",
    photos: [],
    tags: ["fertilizer", "CAN"],
    linked: "PUR-009",
  },
  {
    id: "d-004",
    date: "07 Aug 2026",
    iso: "2026-08-07",
    type: "Problem",
    content:
      "Rats damaged 30 heads at the Plot 1 boundary near the store. Placed 4 traps and cleared the grass strip along the fence.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1 · fence line",
    weather: "Dry, 26°C",
    author: "Kamau Mwangi",
    photos: ["rat-damage-07aug.jpg"],
    tags: ["rodents"],
    linked: "",
    severity: "medium",
  },
  {
    id: "d-003",
    date: "01 Aug 2026",
    iso: "2026-08-01",
    type: "Input use",
    content:
      "Preventive Mancozeb 80WP spray at 50 g/20 L — third application of the season, batch MB2026-11. Re-entry observed for 24 hours.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1",
    weather: "Cloudy, 22°C",
    author: "John Mwangi",
    photos: ["mancozeb-01aug.jpg"],
    tags: ["black rot", "spray"],
    linked: "SR-002",
  },
  {
    id: "d-002",
    date: "22 Jul 2026",
    iso: "2026-07-22",
    type: "Activity",
    content:
      "First weeding and 12 kg DAP side-dressing on Plot 1. Germination was even at 92% after the 4,200 transplants from the Kagwe nursery.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1",
    weather: "Light showers, 20°C",
    author: "Mary Wanjiku",
    photos: ["weeding-22jul.jpg"],
    tags: ["weeding", "DAP"],
    linked: "PUR-004",
  },
  {
    id: "d-001",
    date: "12 Jun 2026",
    iso: "2026-06-12",
    type: "Activity",
    content:
      "Transplanted 4,200 cabbage Gloria F1 seedlings to Plot 1 at 60 cm × 45 cm spacing. Plot measured 0.5 acre on the farm map.",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    location: "Plot 1",
    weather: "Overcast, 19°C",
    author: "Mary Wanjiku",
    photos: ["transplant-12jun.jpg", "plot1-map.png"],
    tags: ["transplanting", "spacing"],
    linked: "",
  },
];

export const DIARY_TYPES: DiaryEntryType[] = [
  "Activity",
  "Observation",
  "Weather event",
  "Decision",
  "Market observation",
  "Problem",
  "Input use",
  "Harvest",
];

export interface DiaryTemplate {
  id: string;
  label: string;
  type: DiaryEntryType;
  body: string;
  tags: string[];
}

export const DIARY_TEMPLATES: DiaryTemplate[] = [
  {
    id: "dt-1",
    label: "Scouting round (ukaguzi)",
    type: "Observation",
    body:
      "Scouted row by row. Pest pressure low, no new lesions. Next scouting round in 5 days.",
    tags: ["scouting"],
  },
  {
    id: "dt-2",
    label: "Spray applied",
    type: "Input use",
    body:
      "Applied spray at recommended rate with full PPE. Re-entry interval observed and logged in the spray record.",
    tags: ["spray", "PPE"],
  },
  {
    id: "dt-3",
    label: "Casual labour paid",
    type: "Activity",
    body:
      "Paid casual workers through the GrowMO wallet. M-Pesa reference captured for the payroll record.",
    tags: ["labour", "M-Pesa"],
  },
  {
    id: "dt-4",
    label: "Rain event",
    type: "Weather event",
    body:
      "Rain recorded at the farm. Checked drainage channels and the low strip for standing water.",
    tags: ["rain", "drainage"],
  },
  {
    id: "dt-5",
    label: "Market check",
    type: "Market observation",
    body:
      "Checked prices at the market and compared against the GrowMO market board before deciding on a harvest date.",
    tags: ["market"],
  },
  {
    id: "dt-6",
    label: "Problem found",
    type: "Problem",
    body:
      "Found affected plants in the crop. Isolated, photographed and reported to the community forum for a second opinion.",
    tags: ["problem"],
  },
];

/* ------------------------------------------------- 12.2 spray record (PHI) */

export type SprayStatus =
  | "Complete"
  | "Planned"
  | "Incomplete"
  | "Harvest cleared"
  | "Blocked";

export interface SprayRecord {
  id: string;
  code: string;
  date: string;
  iso: string;
  crop: string;
  variety: string;
  plot: string;
  target: string;
  product: string;
  activeIngredient: string;
  pcpbNo: string;
  batchNo: string;
  rate: string;
  volumeMixed: string;
  areaTreated: string;
  applicator: string;
  ppe: string[];
  wind: string;
  temp: string;
  phiDays: number;
  reiHours: number;
  nextSafeHarvest: string;
  status: SprayStatus;
  cost: number;
  receipt: string;
  notes: string;
}

export const SPRAY_RECORDS: SprayRecord[] = [
  {
    id: "sr-004",
    code: "SR-004",
    date: "08 Sep 2026",
    iso: "2026-09-08",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    target: "Black rot (curative block)",
    product: "Mancozeb 80WP",
    activeIngredient: "Mancozeb 800 g/kg",
    pcpbNo: "PCPB-1047",
    batchNo: "MB2026-11",
    rate: "50 g / 20 L",
    volumeMixed: "100 L",
    areaTreated: "0.5 acre",
    applicator: "Jane Njeri",
    ppe: ["Gloves", "N95 mask", "Overalls", "Gumboots"],
    wind: "4 km/h NE",
    temp: "23°C",
    phiDays: 14,
    reiHours: 24,
    nextSafeHarvest: "22 Sep 2026",
    status: "Complete",
    cost: 640,
    receipt: "MPX7C4K2QD",
    notes:
      "Applied after removing four infected plants. No drift towards the water pan.",
  },
  {
    id: "sr-003",
    code: "SR-003",
    date: "24 Aug 2026",
    iso: "2026-08-24",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    target: "Aphids",
    product: "Imidacloprid 200SL",
    activeIngredient: "Imidacloprid 200 g/L",
    pcpbNo: "PCPB-2211",
    batchNo: "IP2026-08",
    rate: "10 ml / 20 L",
    volumeMixed: "100 L",
    areaTreated: "0.5 acre",
    applicator: "Self",
    ppe: ["Gloves", "Face mask", "Overalls"],
    wind: "3 km/h SE",
    temp: "25°C",
    phiDays: 21,
    reiHours: 24,
    nextSafeHarvest: "14 Sep 2026",
    status: "Complete",
    cost: 480,
    receipt: "MPX4B9T1LM",
    notes:
      "Sprayed undersides of leaves in the cool of the morning. Aphid pressure dropped within three days.",
  },
  {
    id: "sr-002",
    code: "SR-002",
    date: "01 Aug 2026",
    iso: "2026-08-01",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    target: "Black rot (preventive)",
    product: "Mancozeb 80WP",
    activeIngredient: "Mancozeb 800 g/kg",
    pcpbNo: "PCPB-1047",
    batchNo: "MB2026-11",
    rate: "50 g / 20 L",
    volumeMixed: "100 L",
    areaTreated: "0.5 acre",
    applicator: "John Mwangi",
    ppe: ["Gloves", "N95 mask", "Overalls", "Gumboots"],
    wind: "8 km/h E",
    temp: "22°C",
    phiDays: 14,
    reiHours: 24,
    nextSafeHarvest: "15 Aug 2026",
    status: "Complete",
    cost: 640,
    receipt: "MPX1D6R8VK",
    notes: "Preventive programme after the first humid week of August.",
  },
  {
    id: "sr-001",
    code: "SR-001",
    date: "17 Jul 2026",
    iso: "2026-07-17",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    target: "Diamondback moth",
    product: "Bacillus thuringiensis 16000 IU",
    activeIngredient: "Bacillus thuringiensis var. kurstaki",
    pcpbNo: "PCPB-3318",
    batchNo: "BT2026-05",
    rate: "40 g / 20 L",
    volumeMixed: "80 L",
    areaTreated: "0.4 acre",
    applicator: "Self",
    ppe: ["Gloves", "Face mask", "Overalls"],
    wind: "6 km/h W",
    temp: "21°C",
    phiDays: 0,
    reiHours: 4,
    nextSafeHarvest: "17 Jul 2026 (no PHI)",
    status: "Complete",
    cost: 720,
    receipt: "MPX9H3P5QS",
    notes:
      "Bio-pesticide, zero pre-harvest interval. Used early when larvae were still small.",
  },
  {
    id: "sr-005",
    code: "SR-005",
    date: "14 Aug 2026",
    iso: "2026-08-14",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    target: "Cutworm (spotted damage)",
    product: "Lambda-cyhalothrin 5EC",
    activeIngredient: "Lambda-cyhalothrin 50 g/L",
    pcpbNo: "PCPB-1188",
    batchNo: "LC2026-04",
    rate: "15 ml / 20 L",
    volumeMixed: "60 L",
    areaTreated: "0.3 acre",
    applicator: "John Mwangi",
    ppe: ["Gloves", "Face mask", "Overalls"],
    wind: "5 km/h N",
    temp: "22°C",
    phiDays: 7,
    reiHours: 24,
    nextSafeHarvest: "21 Aug 2026",
    status: "Incomplete",
    cost: 390,
    receipt: "MPX2F7N4YT",
    notes:
      "Record missing the sprayer calibration reading and the product expiry photo — flagged by the compliance check.",
  },
  {
    id: "sr-006",
    code: "SR-006",
    date: "26 Sep 2026",
    iso: "2026-09-26",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    target: "Black rot (post-harvest clean-up)",
    product: "Copper hydroxide 50WP",
    activeIngredient: "Copper hydroxide 500 g/kg",
    pcpbNo: "PCPB-2764",
    batchNo: "CH2026-07",
    rate: "30 g / 20 L",
    volumeMixed: "90 L",
    areaTreated: "0.5 acre",
    applicator: "Self",
    ppe: ["Gloves", "N95 mask", "Overalls", "Gumboots"],
    wind: "7 km/h E",
    temp: "23°C",
    phiDays: 14,
    reiHours: 24,
    nextSafeHarvest: "10 Oct 2026",
    status: "Planned",
    cost: 700,
    receipt: "",
    notes:
      "Planned after harvest to clean crop residues before the tomato rotation on Plot 1.",
  },
  {
    id: "sr-007",
    code: "SR-007",
    date: "02 Jul 2026",
    iso: "2026-07-02",
    crop: "Tomato",
    variety: "Roma VF",
    plot: "Plot 2",
    target: "Early blight",
    product: "Mancozeb 80WP",
    activeIngredient: "Mancozeb 800 g/kg",
    pcpbNo: "PCPB-1047",
    batchNo: "MB2026-09",
    rate: "50 g / 20 L",
    volumeMixed: "60 L",
    areaTreated: "0.25 acre",
    applicator: "Self",
    ppe: ["Gloves", "Face mask", "Overalls"],
    wind: "4 km/h SW",
    temp: "24°C",
    phiDays: 14,
    reiHours: 24,
    nextSafeHarvest: "16 Jul 2026",
    status: "Complete",
    cost: 420,
    receipt: "MPX6J2W9ZC",
    notes: "Plot 2 tomato block — previous season residue record kept for rotation history.",
  },
  {
    id: "sr-008",
    code: "SR-008",
    date: "11 Jul 2026",
    iso: "2026-07-11",
    crop: "Tomato",
    variety: "Roma VF",
    plot: "Plot 2",
    target: "Whitefly (vector control)",
    product: "Thiamethoxam 25WG",
    activeIngredient: "Thiamethoxam 250 g/kg",
    pcpbNo: "PCPB-1990",
    batchNo: "TM2026-03",
    rate: "8 g / 20 L",
    volumeMixed: "40 L",
    areaTreated: "0.25 acre",
    applicator: "Self",
    ppe: ["Gloves", "N95 mask", "Overalls", "Gumboots"],
    wind: "2 km/h S",
    temp: "26°C",
    phiDays: 14,
    reiHours: 24,
    nextSafeHarvest: "25 Jul 2026",
    status: "Complete",
    cost: 560,
    receipt: "MPX8L5Q3RN",
    notes: "Systemic; rotated active-ingredient group to avoid resistance.",
  },
  {
    id: "sr-009",
    code: "SR-009",
    date: "05 Aug 2026",
    iso: "2026-08-05",
    crop: "Kale",
    variety: "Sukuma wiki Thousand Headed",
    plot: "Plot 3",
    target: "Aphids",
    product: "Imidacloprid 200SL",
    activeIngredient: "Imidacloprid 200 g/L",
    pcpbNo: "PCPB-2211",
    batchNo: "IP2026-08",
    rate: "10 ml / 20 L",
    volumeMixed: "40 L",
    areaTreated: "0.2 acre",
    applicator: "Jane Njeri",
    ppe: ["Gloves", "Face mask", "Overalls"],
    wind: "6 km/h NE",
    temp: "23°C",
    phiDays: 21,
    reiHours: 24,
    nextSafeHarvest: "26 Aug 2026",
    status: "Complete",
    cost: 260,
    receipt: "MPX3Y8B6HP",
    notes: "Kale is harvested continuously — PHI respected strictly for household sales.",
  },
  {
    id: "sr-010",
    code: "SR-010",
    date: "21 Aug 2026",
    iso: "2026-08-21",
    crop: "Kale",
    variety: "Sukuma wiki Thousand Headed",
    plot: "Plot 3",
    target: "Caterpillars (cross-striped)",
    product: "Bacillus thuringiensis 16000 IU",
    activeIngredient: "Bacillus thuringiensis var. kurstaki",
    pcpbNo: "PCPB-3318",
    batchNo: "BT2026-05",
    rate: "40 g / 20 L",
    volumeMixed: "30 L",
    areaTreated: "0.2 acre",
    applicator: "Self",
    ppe: ["Gloves", "Face mask"],
    wind: "3 km/h W",
    temp: "22°C",
    phiDays: 0,
    reiHours: 4,
    nextSafeHarvest: "21 Aug 2026 (no PHI)",
    status: "Complete",
    cost: 270,
    receipt: "MPX5R1K7DT",
    notes: "Zero-PHI bio-pesticide chosen because kale is picked twice a week.",
  },
  {
    id: "sr-011",
    code: "SR-011",
    date: "13 Jun 2026",
    iso: "2026-06-13",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    target: "Cutworm at transplanting",
    product: "Lambda-cyhalothrin 5EC",
    activeIngredient: "Lambda-cyhalothrin 50 g/L",
    pcpbNo: "PCPB-1188",
    batchNo: "LC2026-02",
    rate: "15 ml / 20 L",
    volumeMixed: "60 L",
    areaTreated: "0.5 acre",
    applicator: "John Mwangi",
    ppe: ["Gloves", "N95 mask", "Overalls", "Gumboots"],
    wind: "5 km/h NW",
    temp: "20°C",
    phiDays: 7,
    reiHours: 24,
    nextSafeHarvest: "20 Jun 2026",
    status: "Complete",
    cost: 390,
    receipt: "MPX7N2V4GB",
    notes: "Applied one day after transplanting as a collar drench around seedlings.",
  },
  {
    id: "sr-012",
    code: "SR-012",
    date: "30 Jun 2026",
    iso: "2026-06-30",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    target: "Grasshoppers (border)",
    product: "Cypermethrin 10EC",
    activeIngredient: "Cypermethrin 100 g/L",
    pcpbNo: "PCPB-1402",
    batchNo: "CP2026-01",
    rate: "20 ml / 20 L",
    volumeMixed: "20 L",
    areaTreated: "0.1 acre",
    applicator: "Self",
    ppe: ["Gloves"],
    wind: "9 km/h SE",
    temp: "27°C",
    phiDays: 7,
    reiHours: 24,
    nextSafeHarvest: "07 Jul 2026",
    status: "Blocked",
    cost: 180,
    receipt: "",
    notes:
      "Sprayed the border strip before the wind rose above the label limit — PPE was incomplete for a full pyrethroid application. Do not repeat this entry pattern.",
  },
];

export interface SprayProduct {
  id: string;
  name: string;
  activeIngredient: string;
  pcpbNo: string;
  target: string;
  rate: string;
  phiDays: number;
  reiHours: number;
  hazardClass: "Low" | "Moderate" | "High";
  stockLeft: string;
  price: number;
  unit: string;
}

export const SPRAY_PRODUCTS: SprayProduct[] = [
  {
    id: "sp-1",
    name: "Mancozeb 80WP",
    activeIngredient: "Mancozeb 800 g/kg",
    pcpbNo: "PCPB-1047",
    target: "Black rot, early blight, downy mildew",
    rate: "50 g / 20 L",
    phiDays: 14,
    reiHours: 24,
    hazardClass: "Moderate",
    stockLeft: "1.4 kg",
    price: 800,
    unit: "kg",
  },
  {
    id: "sp-2",
    name: "Copper hydroxide 50WP",
    activeIngredient: "Copper hydroxide 500 g/kg",
    pcpbNo: "PCPB-2764",
    target: "Bacterial black rot, bacterial spot",
    rate: "30 g / 20 L",
    phiDays: 14,
    reiHours: 24,
    hazardClass: "Moderate",
    stockLeft: "800 g",
    price: 1150,
    unit: "kg",
  },
  {
    id: "sp-3",
    name: "Imidacloprid 200SL",
    activeIngredient: "Imidacloprid 200 g/L",
    pcpbNo: "PCPB-2211",
    target: "Aphids, whitefly, leaf miners",
    rate: "10 ml / 20 L",
    phiDays: 21,
    reiHours: 24,
    hazardClass: "High",
    stockLeft: "150 ml",
    price: 950,
    unit: "litre",
  },
  {
    id: "sp-4",
    name: "Bacillus thuringiensis 16000 IU",
    activeIngredient: "Bacillus thuringiensis var. kurstaki",
    pcpbNo: "PCPB-3318",
    target: "Diamondback moth, caterpillars",
    rate: "40 g / 20 L",
    phiDays: 0,
    reiHours: 4,
    hazardClass: "Low",
    stockLeft: "600 g",
    price: 720,
    unit: "kg",
  },
  {
    id: "sp-5",
    name: "Lambda-cyhalothrin 5EC",
    activeIngredient: "Lambda-cyhalothrin 50 g/L",
    pcpbNo: "PCPB-1188",
    target: "Cutworm, aphids, thrips",
    rate: "15 ml / 20 L",
    phiDays: 7,
    reiHours: 24,
    hazardClass: "High",
    stockLeft: "220 ml",
    price: 780,
    unit: "litre",
  },
  {
    id: "sp-6",
    name: "Cypermethrin 10EC",
    activeIngredient: "Cypermethrin 100 g/L",
    pcpbNo: "PCPB-1402",
    target: "Grasshoppers, caterpillars",
    rate: "20 ml / 20 L",
    phiDays: 7,
    reiHours: 24,
    hazardClass: "High",
    stockLeft: "180 ml",
    price: 620,
    unit: "litre",
  },
  {
    id: "sp-7",
    name: "Thiamethoxam 25WG",
    activeIngredient: "Thiamethoxam 250 g/kg",
    pcpbNo: "PCPB-1990",
    target: "Whitefly, aphids (systemic)",
    rate: "8 g / 20 L",
    phiDays: 14,
    reiHours: 24,
    hazardClass: "High",
    stockLeft: "240 g",
    price: 1450,
    unit: "kg",
  },
  {
    id: "sp-8",
    name: "Metalaxyl 8% + Mancozeb 64% WP",
    activeIngredient: "Metalaxyl 80 g/kg + Mancozeb 640 g/kg",
    pcpbNo: "PCPB-1523",
    target: "Downy mildew, late blight",
    rate: "50 g / 20 L",
    phiDays: 14,
    reiHours: 24,
    hazardClass: "Moderate",
    stockLeft: "1.0 kg",
    price: 1250,
    unit: "kg",
  },
  {
    id: "sp-9",
    name: "Sulphur 80% WDG",
    activeIngredient: "Sulphur 800 g/kg",
    pcpbNo: "PCPB-3045",
    target: "Powdery mildew, mites",
    rate: "40 g / 20 L",
    phiDays: 3,
    reiHours: 12,
    hazardClass: "Low",
    stockLeft: "2.2 kg",
    price: 540,
    unit: "kg",
  },
  {
    id: "sp-10",
    name: "Neem oil 3% EC (biopesticide)",
    activeIngredient: "Azadirachtin 3 g/L",
    pcpbNo: "PCPB-3502",
    target: "Aphids, whitefly, mites (organic)",
    rate: "30 ml / 20 L",
    phiDays: 0,
    reiHours: 4,
    hazardClass: "Low",
    stockLeft: "1.5 litres",
    price: 690,
    unit: "litre",
  },
];

/* --------------------------------------------- 12.3 input purchase records */

export type PurchaseCategory =
  | "Fertilizer"
  | "Crop protection"
  | "Seed"
  | "Soil amendment"
  | "Equipment";

export interface PurchaseRecord {
  id: string;
  date: string;
  iso: string;
  input: string;
  category: PurchaseCategory;
  supplier: string;
  supplierPhone: string;
  supplierCounty: string;
  invoiceNo: string;
  qty: string;
  unitPrice: number;
  total: number;
  batchNo: string;
  expiry: string;
  certNo: string;
  receipt: boolean;
  mpesa: string;
  store: string;
}

export const PURCHASES: PurchaseRecord[] = [
  {
    id: "pur-012",
    date: "15 Sep 2026",
    iso: "2026-09-15",
    input: "CAN 26% N (50 kg)",
    category: "Fertilizer",
    supplier: "Githunguri Agro-vet",
    supplierPhone: "0722 418 390",
    supplierCounty: "Kiambu",
    invoiceNo: "INV-4588",
    qty: "1 bag",
    unitPrice: 4200,
    total: 4200,
    batchNo: "CAN-KEL-2026-08",
    expiry: "Aug 2029",
    certNo: "KEBS-FC-2210",
    receipt: true,
    mpesa: "SFK4T2L8MD",
    store: "Farm store · shelf B",
  },
  {
    id: "pur-011",
    date: "08 Sep 2026",
    iso: "2026-09-08",
    input: "Mancozeb 80WP (1 kg)",
    category: "Crop protection",
    supplier: "Githunguri Agro-vet",
    supplierPhone: "0722 418 390",
    supplierCounty: "Kiambu",
    invoiceNo: "INV-4571",
    qty: "1 kg",
    unitPrice: 800,
    total: 800,
    batchNo: "MB2026-11",
    expiry: "Jun 2028",
    certNo: "PCPB-1047",
    receipt: true,
    mpesa: "MPX7C4K2QD",
    store: "Chemical cupboard · locked",
  },
  {
    id: "pur-010",
    date: "24 Aug 2026",
    iso: "2026-08-24",
    input: "Imidacloprid 200SL (100 ml)",
    category: "Crop protection",
    supplier: "Kenya Seed Depot, Thika",
    supplierPhone: "0733 245 118",
    supplierCounty: "Kiambu",
    invoiceNo: "KS-79140",
    qty: "1 bottle",
    unitPrice: 950,
    total: 950,
    batchNo: "IP2026-08",
    expiry: "Mar 2029",
    certNo: "PCPB-2211",
    receipt: true,
    mpesa: "MPX4B9T1LM",
    store: "Chemical cupboard · locked",
  },
  {
    id: "pur-009",
    date: "14 Aug 2026",
    iso: "2026-08-14",
    input: "CAN 26% N (50 kg)",
    category: "Fertilizer",
    supplier: "Githunguri Farmers Co-op",
    supplierPhone: "0710 552 447",
    supplierCounty: "Kiambu",
    invoiceNo: "COOP-2214",
    qty: "2 bags",
    unitPrice: 4100,
    total: 8200,
    batchNo: "CAN-KEL-2026-05",
    expiry: "May 2029",
    certNo: "KEBS-FC-2210",
    receipt: true,
    mpesa: "MPX2F7N4YT",
    store: "Farm store · shelf B",
  },
  {
    id: "pur-008",
    date: "02 Aug 2026",
    iso: "2026-08-02",
    input: "Mancozeb 80WP (2 kg)",
    category: "Crop protection",
    supplier: "Githunguri Agro-vet",
    supplierPhone: "0722 418 390",
    supplierCounty: "Kiambu",
    invoiceNo: "INV-4521",
    qty: "2 kg",
    unitPrice: 800,
    total: 1600,
    batchNo: "MB2026-11",
    expiry: "Jun 2028",
    certNo: "PCPB-8765",
    receipt: true,
    mpesa: "MPX1D6R8VK",
    store: "Chemical cupboard · locked",
  },
  {
    id: "pur-007",
    date: "17 Jul 2026",
    iso: "2026-07-17",
    input: "Bacillus thuringiensis 16000 IU (1 kg)",
    category: "Crop protection",
    supplier: "Real IPM Kenya, Thika",
    supplierPhone: "0787 330 220",
    supplierCounty: "Kiambu",
    invoiceNo: "RIPM-1180",
    qty: "1 kg",
    unitPrice: 2450,
    total: 2450,
    batchNo: "BT2026-05",
    expiry: "Dec 2027",
    certNo: "PCPB-3318",
    receipt: true,
    mpesa: "MPX9H3P5QS",
    store: "Chemical cupboard · cool shelf",
  },
  {
    id: "pur-006",
    date: "30 Jun 2026",
    iso: "2026-06-30",
    input: "Cypermethrin 10EC (250 ml)",
    category: "Crop protection",
    supplier: "Githunguri Agro-vet",
    supplierPhone: "0722 418 390",
    supplierCounty: "Kiambu",
    invoiceNo: "INV-4477",
    qty: "1 bottle",
    unitPrice: 620,
    total: 620,
    batchNo: "CP2026-01",
    expiry: "Jan 2029",
    certNo: "PCPB-1402",
    receipt: false,
    mpesa: "",
    store: "Chemical cupboard · locked",
  },
  {
    id: "pur-005",
    date: "10 Jun 2026",
    iso: "2026-06-10",
    input: "Cabbage Gloria F1 (4 × 10 g)",
    category: "Seed",
    supplier: "Kenya Seed Depot, Thika",
    supplierPhone: "0733 245 118",
    supplierCounty: "Kiambu",
    invoiceNo: "KS-78912",
    qty: "4 tins",
    unitPrice: 800,
    total: 3200,
    batchNo: "CS-F1-2026-06",
    expiry: "Dec 2027",
    certNo: "KEPHIS-SC-5678",
    receipt: true,
    mpesa: "MPX6J2W9ZC",
    store: "Seed box · dry room",
  },
  {
    id: "pur-004",
    date: "09 Jun 2026",
    iso: "2026-06-09",
    input: "DAP 18-46-0 (50 kg)",
    category: "Fertilizer",
    supplier: "Githunguri Farmers Co-op",
    supplierPhone: "0710 552 447",
    supplierCounty: "Kiambu",
    invoiceNo: "COOP-2088",
    qty: "2 bags",
    unitPrice: 6500,
    total: 13000,
    batchNo: "DAP-KEL-2026-09",
    expiry: "Dec 2028",
    certNo: "KEPHIS-FC-1234",
    receipt: true,
    mpesa: "MPX3Y8B6HP",
    store: "Farm store · shelf A",
  },
  {
    id: "pur-003",
    date: "05 Jun 2026",
    iso: "2026-06-05",
    input: "FYM composted manure (pickup load)",
    category: "Soil amendment",
    supplier: "Kagwe Dairy Self-Help Group",
    supplierPhone: "0724 889 010",
    supplierCounty: "Kiambu",
    invoiceNo: "KDG-221",
    qty: "2.5 tonnes",
    unitPrice: 7000,
    total: 17500,
    batchNo: "",
    expiry: "—",
    certNo: "",
    receipt: true,
    mpesa: "MPX8L5Q3RN",
    store: "Manure shed",
  },
  {
    id: "pur-002",
    date: "28 May 2026",
    iso: "2026-05-28",
    input: "Knapsack sprayer 16 L (repair kit)",
    category: "Equipment",
    supplier: "Jogoo Agro Supplies, Nairobi",
    supplierPhone: "0711 632 705",
    supplierCounty: "Nairobi",
    invoiceNo: "JAS-7741",
    qty: "1 kit",
    unitPrice: 1850,
    total: 1850,
    batchNo: "",
    expiry: "—",
    certNo: "",
    receipt: true,
    mpesa: "MPX5R1K7DT",
    store: "Tool shed",
  },
  {
    id: "pur-001",
    date: "20 May 2026",
    iso: "2026-05-20",
    input: "Agricultural lime (50 kg)",
    category: "Soil amendment",
    supplier: "Nakuru Lime Works",
    supplierPhone: "0768 220 114",
    supplierCounty: "Nakuru",
    invoiceNo: "NLW-3390",
    qty: "8 bags",
    unitPrice: 700,
    total: 5600,
    batchNo: "LIME-2026-04",
    expiry: "—",
    certNo: "KEBS-SAM-1840",
    receipt: true,
    mpesa: "MPX7N2V4GB",
    store: "Farm store · floor pallet",
  },
];

/* -------------------------------------------- 12.4 harvest & traceability */

export interface BatchStep {
  label: string;
  at: string;
  note: string;
  done: boolean;
}

export interface HarvestBatch {
  id: string;
  batchId: string;
  crop: string;
  variety: string;
  plot: string;
  area: string;
  planted: string;
  harvested: string;
  quantity: string;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  inputs: { name: string; qty: string }[];
  sprays: number;
  lastSpray: string;
  phiCleared: string;
  soilTest: string;
  destination: string;
  buyer: string;
  destinationPhone: string;
  qrScans: number;
  status: "Delivered" | "In transit" | "Stored" | "Sold" | "Awaiting QC" | "Planned";
  value: number;
  steps: BatchStep[];
}

export const HARVEST_BATCHES: HarvestBatch[] = [
  {
    id: "b-010",
    batchId: "GRM-KMB-2026-010",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    area: "0.5 acre",
    planted: "12 Jun 2026",
    harvested: "28 Sep 2026 (planned)",
    quantity: "14,500 heads",
    gradeA: 10000,
    gradeB: 3500,
    gradeC: 1000,
    inputs: [
      { name: "DAP 18-46-0", qty: "25 kg" },
      { name: "CAN 26% N", qty: "37.5 kg" },
      { name: "Mancozeb 80WP", qty: "1 kg" },
      { name: "Imidacloprid 200SL", qty: "50 ml" },
      { name: "FYM manure", qty: "2.5 tonnes" },
    ],
    sprays: 4,
    lastSpray: "08 Sep 2026 · Mancozeb 80WP",
    phiCleared: "22 Sep 2026",
    soilTest: "pH 5.8 · Sep 2026 · KALRO",
    destination: "Marikiti Market via Kamau Brokers",
    buyer: "Kamau Brokers",
    destinationPhone: "0722 909 331",
    qrScans: 0,
    status: "Planned",
    value: 348000,
    steps: [
      { label: "Crop planted & geotagged", at: "12 Jun 2026", note: "Plot 1 mapped at 0.5 acre", done: true },
      { label: "Spray records closed", at: "08 Sep 2026", note: "All 4 applications complete", done: true },
      { label: "PHI cleared", at: "22 Sep 2026", note: "Longest PHI 21 days (Imidacloprid)", done: true },
      { label: "Harvest & grading", at: "28 Sep 2026", note: "Grade A/B/C split at the shed", done: false },
      { label: "QR batch label printed", at: "28 Sep 2026", note: "Sticker on each crate", done: false },
      { label: "Transit to Marikiti", at: "29 Sep 2026", note: "Pickup KDD 442T", done: false },
    ],
  },
  {
    id: "b-009",
    batchId: "GRM-KMB-2026-009",
    crop: "Kale",
    variety: "Sukuma wiki Thousand Headed",
    plot: "Plot 3",
    area: "0.2 acre",
    planted: "04 May 2026",
    harvested: "16 Sep 2026",
    quantity: "310 bunches",
    gradeA: 210,
    gradeB: 80,
    gradeC: 20,
    inputs: [
      { name: "DAP 18-46-0", qty: "8 kg" },
      { name: "CAN 26% N", qty: "15 kg" },
      { name: "Bacillus thuringiensis", qty: "120 g" },
    ],
    sprays: 2,
    lastSpray: "21 Aug 2026 · Bacillus thuringiensis",
    phiCleared: "21 Aug 2026",
    soilTest: "pH 6.1 · Sep 2026 · KALRO",
    destination: "Githunguri open market (weekly)",
    buyer: "Githunguri market traders",
    destinationPhone: "0720 664 218",
    qrScans: 21,
    status: "Sold",
    value: 12400,
    steps: [
      { label: "Crop planted", at: "04 May 2026", note: "Plot 3, 0.2 acre", done: true },
      { label: "Zero-PHI spray chosen", at: "21 Aug 2026", note: "Bio-pesticide for weekly picking", done: true },
      { label: "Harvested", at: "16 Sep 2026", note: "310 bunches, 2 crates damaged", done: true },
      { label: "Sold at market", at: "17 Sep 2026", note: "KES 40 per bunch average", done: true },
    ],
  },
  {
    id: "b-008",
    batchId: "GRM-KMB-2026-008",
    crop: "Tomato",
    variety: "Roma VF",
    plot: "Plot 2",
    area: "0.25 acre",
    planted: "14 Mar 2026",
    harvested: "22 Aug 2026",
    quantity: "42 crates",
    gradeA: 24,
    gradeB: 14,
    gradeC: 4,
    inputs: [
      { name: "DAP 18-46-0", qty: "12 kg" },
      { name: "Mancozeb 80WP", qty: "500 g" },
      { name: "Thiamethoxam 25WG", qty: "40 g" },
    ],
    sprays: 2,
    lastSpray: "11 Jul 2026 · Thiamethoxam 25WG",
    phiCleared: "25 Jul 2026",
    soilTest: "pH 5.9 · Mar 2026 · KALRO",
    destination: "Twiga Foods — Nairobi collection point",
    buyer: "Twiga Foods",
    destinationPhone: "0709 800 900",
    qrScans: 56,
    status: "Delivered",
    value: 84000,
    steps: [
      { label: "Crop planted", at: "14 Mar 2026", note: "Plot 2, 0.25 acre", done: true },
      { label: "PHI cleared", at: "25 Jul 2026", note: "14-day PHI respected", done: true },
      { label: "Graded at shed", at: "22 Aug 2026", note: "A 24 · B 14 · C 4 crates", done: true },
      { label: "QC accepted by buyer", at: "23 Aug 2026", note: "Twiga QC pass, moisture fine", done: true },
      { label: "Paid", at: "25 Aug 2026", note: "M-Pesa settlement to wallet", done: true },
    ],
  },
  {
    id: "b-007",
    batchId: "GRM-KMB-2026-007",
    crop: "Maize",
    variety: "H6213",
    plot: "Plot 4",
    area: "1.0 acre",
    planted: "20 Mar 2026",
    harvested: "12 Aug 2026",
    quantity: "32 bags (90 kg)",
    gradeA: 24,
    gradeB: 6,
    gradeC: 2,
    inputs: [
      { name: "DAP 18-46-0", qty: "50 kg" },
      { name: "CAN 26% N", qty: "75 kg" },
      { name: "Mancozeb 80WP", qty: "0 kg" },
    ],
    sprays: 1,
    lastSpray: "18 Apr 2026 · Lambda-cyhalothrin",
    phiCleared: "25 Apr 2026",
    soilTest: "pH 5.6 · Mar 2026 · KALRO",
    destination: "Home store + Githunguri miller",
    buyer: "Kariobangi miller (12 bags)",
    destinationPhone: "0711 240 887",
    qrScans: 9,
    status: "Stored",
    value: 96000,
    steps: [
      { label: "Planted", at: "20 Mar 2026", note: "Plot 4, 1 acre, 75 × 30 cm", done: true },
      { label: "Fall armyworm scouting", at: "10 Apr 2026", note: "18% damage, sprayed once", done: true },
      { label: "Harvested", at: "12 Aug 2026", note: "32 bags at 16% moisture", done: true },
      { label: "Stored with PICS bags", at: "13 Aug 2026", note: "Hermetic bags, 20 in store", done: true },
    ],
  },
  {
    id: "b-006",
    batchId: "GRM-KMB-2026-006",
    crop: "Beans",
    variety: "Rosecoco",
    plot: "Plot 5",
    area: "0.4 acre",
    planted: "08 Apr 2026",
    harvested: "26 Jul 2026",
    quantity: "5 bags (90 kg)",
    gradeA: 4,
    gradeB: 1,
    gradeC: 0,
    inputs: [
      { name: "DAP 18-46-0", qty: "20 kg" },
      { name: "FYM manure", qty: "1 tonne" },
    ],
    sprays: 0,
    lastSpray: "—",
    phiCleared: "—",
    soilTest: "pH 5.7 · Mar 2026 · KALRO",
    destination: "Githunguri Farmers Co-op aggregation",
    buyer: "Githunguri Farmers Co-op",
    destinationPhone: "0710 552 447",
    qrScans: 14,
    status: "Sold",
    value: 42500,
    steps: [
      { label: "Planted", at: "08 Apr 2026", note: "Plot 5, 0.4 acre", done: true },
      { label: "No synthetic spray used", at: "26 Jul 2026", note: "Organic-friendly season", done: true },
      { label: "Delivered to co-op", at: "27 Jul 2026", note: "Aggregated with group buyers", done: true },
      { label: "Paid by co-op", at: "02 Aug 2026", note: "KES 42,500 less 2% levy", done: true },
    ],
  },
  {
    id: "b-005",
    batchId: "GRM-KMB-2026-005",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    area: "0.5 acre",
    planted: "02 Feb 2026",
    harvested: "19 May 2026",
    quantity: "12,800 heads",
    gradeA: 8200,
    gradeB: 3400,
    gradeC: 1200,
    inputs: [
      { name: "DAP 18-46-0", qty: "25 kg" },
      { name: "CAN 26% N", qty: "50 kg" },
      { name: "Mancozeb 80WP", qty: "1.5 kg" },
    ],
    sprays: 3,
    lastSpray: "24 Apr 2026 · Mancozeb 80WP",
    phiCleared: "08 May 2026",
    soilTest: "pH 5.5 · Mar 2026 · KALRO",
    destination: "Marikiti Market via Kamau Brokers",
    buyer: "Kamau Brokers",
    destinationPhone: "0722 909 331",
    qrScans: 63,
    status: "Sold",
    value: 307200,
    steps: [
      { label: "Planted", at: "02 Feb 2026", note: "Plot 1, 0.5 acre", done: true },
      { label: "Spray programme closed", at: "24 Apr 2026", note: "3 Mancozeb applications", done: true },
      { label: "Harvested", at: "19 May 2026", note: "12,800 heads graded", done: true },
      { label: "Delivered", at: "20 May 2026", note: "Marikiti, 2 trips", done: true },
      { label: "Settled", at: "23 May 2026", note: "M-Pesa to wallet", done: true },
    ],
  },
  {
    id: "b-004",
    batchId: "GRM-KMB-2026-004",
    crop: "Potato",
    variety: "Shangi",
    plot: "Plot 4",
    area: "0.5 acre",
    planted: "18 Jan 2026",
    harvested: "06 May 2026",
    quantity: "48 bags (50 kg)",
    gradeA: 30,
    gradeB: 14,
    gradeC: 4,
    inputs: [
      { name: "DAP 18-46-0", qty: "40 kg" },
      { name: "CAN 26% N", qty: "30 kg" },
      { name: "Mancozeb 80WP", qty: "1 kg" },
    ],
    sprays: 2,
    lastSpray: "12 Apr 2026 · Mancozeb 80WP",
    phiCleared: "26 Apr 2026",
    soilTest: "pH 5.5 · Mar 2026 · KALRO",
    destination: "Nyandarua potato traders via co-op",
    buyer: "Engen Potato Traders",
    destinationPhone: "0728 445 019",
    qrScans: 18,
    status: "Sold",
    value: 120000,
    steps: [
      { label: "Planted", at: "18 Jan 2026", note: "Shangi seed from Nyandarua", done: true },
      { label: "Late blight watch", at: "12 Apr 2026", note: "2 preventive sprays", done: true },
      { label: "Harvested & graded", at: "06 May 2026", note: "48 bags at 50 kg", done: true },
      { label: "Sold", at: "08 May 2026", note: "KES 2,500 per bag average", done: true },
    ],
  },
  {
    id: "b-003",
    batchId: "GRM-KMB-2026-003",
    crop: "Kale",
    variety: "Sukuma wiki Thousand Headed",
    plot: "Plot 3",
    area: "0.2 acre",
    planted: "10 Jan 2026",
    harvested: "18 Apr 2026",
    quantity: "265 bunches",
    gradeA: 180,
    gradeB: 65,
    gradeC: 20,
    inputs: [
      { name: "DAP 18-46-0", qty: "8 kg" },
      { name: "Imidacloprid 200SL", qty: "30 ml" },
    ],
    sprays: 1,
    lastSpray: "28 Mar 2026 · Imidacloprid 200SL",
    phiCleared: "18 Apr 2026",
    soilTest: "pH 5.6 · Mar 2026 · KALRO",
    destination: "Githunguri open market",
    buyer: "Githunguri market traders",
    destinationPhone: "0720 664 218",
    qrScans: 12,
    status: "Sold",
    value: 10600,
    steps: [
      { label: "Planted", at: "10 Jan 2026", note: "Plot 3", done: true },
      { label: "PHI respected", at: "18 Apr 2026", note: "21 days after Imidacloprid", done: true },
      { label: "Sold", at: "19 Apr 2026", note: "KES 40 per bunch", done: true },
    ],
  },
  {
    id: "b-002",
    batchId: "GRM-KMB-2026-002",
    crop: "Maize",
    variety: "H6213",
    plot: "Plot 4",
    area: "1.0 acre",
    planted: "24 Oct 2025",
    harvested: "28 Feb 2026",
    quantity: "26 bags (90 kg)",
    gradeA: 18,
    gradeB: 6,
    gradeC: 2,
    inputs: [
      { name: "DAP 18-46-0", qty: "50 kg" },
      { name: "CAN 26% N", qty: "50 kg" },
    ],
    sprays: 1,
    lastSpray: "02 Dec 2025 · Lambda-cyhalothrin",
    phiCleared: "09 Dec 2025",
    soilTest: "pH 5.5 · Sep 2025 · KALRO",
    destination: "Home store (food security) + local sale",
    buyer: "Kagwe residents",
    destinationPhone: "0725 118 004",
    qrScans: 6,
    status: "Sold",
    value: 66000,
    steps: [
      { label: "Planted (SR 2025)", at: "24 Oct 2025", note: "Plot 4, 1 acre", done: true },
      { label: "Harvested", at: "28 Feb 2026", note: "26 bags — below target", done: true },
      { label: "Lesson logged", at: "01 Mar 2026", note: "Late top-dress reduced yield", done: true },
    ],
  },
  {
    id: "b-001",
    batchId: "GRM-KMB-2026-001",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1",
    area: "0.25 acre",
    planted: "12 Sep 2025",
    harvested: "04 Jan 2026",
    quantity: "6,300 heads",
    gradeA: 4100,
    gradeB: 1700,
    gradeC: 500,
    inputs: [
      { name: "DAP 18-46-0", qty: "12 kg" },
      { name: "CAN 26% N", qty: "20 kg" },
      { name: "Mancozeb 80WP", qty: "500 g" },
    ],
    sprays: 2,
    lastSpray: "12 Dec 2025 · Mancozeb 80WP",
    phiCleared: "26 Dec 2025",
    soilTest: "pH 5.5 · Sep 2025 · KALRO",
    destination: "Marikiti Market",
    buyer: "Kamau Brokers",
    destinationPhone: "0722 909 331",
    qrScans: 44,
    status: "Sold",
    value: 157500,
    steps: [
      { label: "Planted", at: "12 Sep 2025", note: "Plot 1, 0.25 acre", done: true },
      { label: "First QR batch on GrowMO", at: "04 Jan 2026", note: "44 scans by buyers", done: true },
      { label: "Sold", at: "05 Jan 2026", note: "KES 25 per head average", done: true },
    ],
  },
];

/* -------------------------------------------------- 12.5 certifications */

export type CertStatus =
  | "In progress"
  | "Not started"
  | "Active"
  | "Certified"
  | "N/A"
  | "Expired";

export interface CertChecklistItem {
  id: string;
  label: string;
  done: boolean;
  owner: string;
  due: string;
  evidence: string;
}

export interface CertDocument {
  name: string;
  status: "Verified" | "Pending" | "Missing";
  updated: string;
}

export interface Certification {
  id: string;
  name: string;
  short: string;
  body: string;
  status: CertStatus;
  progress: number;
  requirements: string;
  dueDate: string;
  fee: number;
  auditor: string;
  scope: string;
  checklist: CertChecklistItem[];
  documents: CertDocument[];
}

export const CERTIFICATIONS: Certification[] = [
  {
    id: "cert-ks1758",
    name: "KS1758-1:2019 (Horticulture)",
    short: "KS1758",
    body: "KEBS via county horticulture office",
    status: "In progress",
    progress: 70,
    requirements:
      "Spray records, hygiene, traceability, worker welfare, water quality",
    dueDate: "18 Mar 2027",
    fee: 9000,
    auditor: "County horticulture officer (Githunguri)",
    scope: "Cabbage, kale and tomato blocks",
    checklist: [
      { id: "ck1", label: "Farm registration with the county", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "KMB/GTH/FARM/2026/0417" },
      { id: "ck2", label: "Spray records maintained (all applications)", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "SR-001 – SR-012" },
      { id: "ck3", label: "Input purchase records with receipts", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "12 purchase entries" },
      { id: "ck4", label: "Pre-harvest intervals respected", done: true, owner: "John Mwangi", due: "Done", evidence: "PHI clearance sheet" },
      { id: "ck5", label: "Harvest hygiene (clean crates, no ground contact)", done: true, owner: "Jane Njeri", due: "Done", evidence: "Shed SOP + crate photos" },
      { id: "ck6", label: "Traceability system (batch IDs, QR codes)", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "10 batches coded" },
      { id: "ck7", label: "Worker health & safety training", done: false, owner: "Mary Wanjiku", due: "10 Oct 2026", evidence: "Attendance register + KEPHIS module" },
      { id: "ck8", label: "Water quality testing (irrigation source)", done: false, owner: "Kamau Mwangi", due: "24 Oct 2026", evidence: "Lab request drafted" },
      { id: "ck9", label: "Post-harvest handling SOPs documented", done: false, owner: "Jane Njeri", due: "31 Oct 2026", evidence: "Draft in progress" },
      { id: "ck10", label: "Internal audit completed", done: false, owner: "Mary Wanjiku", due: "05 Nov 2026", evidence: "Checklist ready" },
      { id: "ck11", label: "External audit scheduled", done: false, owner: "Mary Wanjiku", due: "14 Nov 2026", evidence: "Book with county officer" },
    ],
    documents: [
      { name: "Farm registration certificate", status: "Verified", updated: "12 Feb 2026" },
      { name: "Spray record export (12 entries)", status: "Verified", updated: "18 Sep 2026" },
      { name: "Water test report", status: "Missing", updated: "—" },
      { name: "Worker training register", status: "Pending", updated: "In progress" },
    ],
  },
  {
    id: "cert-ggap",
    name: "GlobalG.A.P. IFA v6",
    short: "GlobalG.A.P.",
    body: "GLOBALG.A.P. approved certification body",
    status: "Not started",
    progress: 24,
    requirements:
      "Full record-keeping, food safety, worker welfare, environmental management, internal audits",
    dueDate: "30 Jun 2027",
    fee: 68000,
    auditor: "AfriCert Kenya",
    scope: "Export-grade vegetable blocks",
    checklist: [
      { id: "g1", label: "Register on the GLOBALG.A.P. database", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "GLN 40 5512 0000 118" },
      { id: "g2", label: "Farm base module self-assessment", done: false, owner: "Mary Wanjiku", due: "20 Oct 2026", evidence: "Self-assessment open" },
      { id: "g3", label: "Record-keeping for 3 months minimum", done: true, owner: "Mary Wanjiku", due: "Jul – Sep 2026", evidence: "Diary + spray + purchases" },
      { id: "g4", label: "Worker hygiene & welfare policy", done: false, owner: "Jane Njeri", due: "15 Nov 2026", evidence: "Template downloaded" },
      { id: "g5", label: "Chemical store & PPE compliance", done: false, owner: "John Mwangi", due: "30 Nov 2026", evidence: "Locked cupboard, spill kit" },
      { id: "g6", label: "Residue testing on 2 samples", done: false, owner: "Mary Wanjiku", due: "15 Dec 2026", evidence: "KALRO lab quote received" },
      { id: "g7", label: "Internal audit + corrective actions", done: false, owner: "Mary Wanjiku", due: "20 Jan 2027", evidence: "Not started" },
      { id: "g8", label: "External inspection booked", done: false, owner: "Mary Wanjiku", due: "30 Jun 2027", evidence: "Not started" },
    ],
    documents: [
      { name: "GLOBALG.A.P. registration", status: "Verified", updated: "01 Aug 2026" },
      { name: "Self-assessment (v6 base)", status: "Pending", updated: "In progress" },
      { name: "Residue analysis report", status: "Missing", updated: "—" },
    ],
  },
  {
    id: "cert-organic",
    name: "Organic (KOAN / KOSHER check)",
    short: "Organic KOA",
    body: "Kenya Organic Agriculture Network",
    status: "Not started",
    progress: 18,
    requirements: "3-year conversion, no synthetic inputs, buffer zones, input audit trail",
    dueDate: "01 Dec 2029",
    fee: 35000,
    auditor: "KOAN inspector",
    scope: "Plot 3 kale block (conversion block 1)",
    checklist: [
      { id: "o1", label: "Mark conversion block on the farm map", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "Plot 3 flagged" },
      { id: "o2", label: "Stop all synthetic inputs on Plot 3", done: true, owner: "Mary Wanjiku", due: "Since Aug 2026", evidence: "BT + neem only" },
      { id: "o3", label: "Organic input audit trail", done: false, owner: "Mary Wanjiku", due: "Rolling", evidence: "2 records so far" },
      { id: "o4", label: "Buffer zone of 10 m recorded", done: false, owner: "Kamau Mwangi", due: "18 Oct 2026", evidence: "Boundary marked" },
      { id: "o5", label: "Year 1 conversion inspection", done: false, owner: "Mary Wanjiku", due: "01 Dec 2027", evidence: "Not started" },
    ],
    documents: [
      { name: "Conversion block plan", status: "Pending", updated: "20 Aug 2026" },
      { name: "Organic input purchase log", status: "Pending", updated: "In progress" },
    ],
  },
  {
    id: "cert-pcpb",
    name: "PCPB User Certificate",
    short: "PCPB user",
    body: "Pest Control Products Board",
    status: "Active",
    progress: 100,
    requirements: "Valid pesticide use training for every applicator",
    dueDate: "14 Oct 2027",
    fee: 2500,
    auditor: "PCPB accredited trainer",
    scope: "Mary Wanjiku, John Mwangi, Jane Njeri",
    checklist: [
      { id: "p1", label: "Trainer-led safe use course", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "Certificate PCPB-8765" },
      { id: "p2", label: "PPE demonstration", done: true, owner: "John Mwangi", due: "Done", evidence: "Signed attendance" },
      { id: "p3", label: "Renewal reminder set", done: true, owner: "Mary Wanjiku", due: "Sep 2027", evidence: "In-app reminder" },
    ],
    documents: [
      { name: "PCPB user certificate", status: "Verified", updated: "14 Oct 2025" },
      { name: "Training attendance register", status: "Verified", updated: "14 Oct 2025" },
    ],
  },
  {
    id: "cert-kephis",
    name: "KEPHIS Seed Dealer Licence",
    short: "KEPHIS dealer",
    body: "Kenya Plant Health Inspectorate Service",
    status: "N/A",
    progress: 0,
    requirements: "Only for seed merchants — the farm does not retail seed",
    dueDate: "—",
    fee: 0,
    auditor: "—",
    scope: "Not applicable to Mary's Farm",
    checklist: [],
    documents: [],
  },
  {
    id: "cert-hcd",
    name: "HCD Horticultural Export Licence",
    short: "HCD export",
    body: "Horticultural Crops Development Authority",
    status: "Not started",
    progress: 10,
    requirements: "Exporter registration, packhouse approval, phytosanitary compliance",
    dueDate: "31 Aug 2027",
    fee: 45000,
    auditor: "HCD licensing office",
    scope: "French beans and snow peas for export",
    checklist: [
      { id: "h1", label: "Decide on the export crop and buyer", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "Twiga export desk enquiry" },
      { id: "h2", label: "Packhouse inspection readiness", done: false, owner: "Mary Wanjiku", due: "20 Feb 2027", evidence: "Not started" },
      { id: "h3", label: "Phytosanitary training", done: false, owner: "John Mwangi", due: "15 Apr 2027", evidence: "Not started" },
      { id: "h4", label: "Apply for the export licence", done: false, owner: "Mary Wanjiku", due: "31 May 2027", evidence: "Not started" },
    ],
    documents: [
      { name: "Buyer enquiry email", status: "Pending", updated: "02 Sep 2026" },
    ],
  },
  {
    id: "cert-county",
    name: "County Farm Registration",
    short: "County reg",
    body: "Kiambu County Agriculture Department",
    status: "Certified",
    progress: 100,
    requirements: "Farmer registration, plot list, acreage declaration",
    dueDate: "12 Feb 2028 (renewal)",
    fee: 0,
    auditor: "Sub-county agriculture officer",
    scope: "All four plots, 2.15 acres",
    checklist: [
      { id: "c1", label: "Farmer details verified", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "ID 12345678" },
      { id: "c2", label: "Plot list submitted", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "4 plots declared" },
      { id: "c3", label: "Subsidy eligibility confirmed", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "Fertilizer subsidy list" },
    ],
    documents: [
      { name: "County registration certificate", status: "Verified", updated: "12 Feb 2026" },
    ],
  },
  {
    id: "cert-kebs",
    name: "KEBS Mark of Conformity (packaged produce)",
    short: "KEBS produce",
    body: "Kenya Bureau of Standards",
    status: "Not started",
    progress: 5,
    requirements: "Packaging standards, labelling, weight verification",
    dueDate: "30 Nov 2027",
    fee: 28000,
    auditor: "KEBS inspector",
    scope: "Pre-packed 5 kg cabbage crates and 1 kg kale bundles",
    checklist: [
      { id: "k1", label: "Label design with weight & origin", done: false, owner: "Mary Wanjiku", due: "15 Mar 2027", evidence: "Not started" },
      { id: "k2", label: "Weighing scale verification", done: false, owner: "Jane Njeri", due: "30 Apr 2027", evidence: "Scale not verified" },
      { id: "k3", label: "Sample submission to KEBS", done: false, owner: "Mary Wanjiku", due: "30 Jun 2027", evidence: "Not started" },
    ],
    documents: [],
  },
  {
    id: "cert-nema",
    name: "NEMA Effluent & Waste Licence",
    short: "NEMA licence",
    body: "National Environment Management Authority",
    status: "In progress",
    progress: 45,
    requirements: "Waste management plan, effluent handling, chemical disposal",
    dueDate: "28 Feb 2027",
    fee: 12000,
    auditor: "NEMA county officer",
    scope: "Pesticide wash-water and packaging disposal",
    checklist: [
      { id: "n1", label: "Chemical disposal pit constructed", done: true, owner: "Kamau Mwangi", due: "Done", evidence: "Photo logged" },
      { id: "n2", label: "Triple-rinse SOP for containers", done: true, owner: "John Mwangi", due: "Done", evidence: "SOP signed" },
      { id: "n3", label: "Waste management plan submitted", done: false, owner: "Mary Wanjiku", due: "10 Oct 2026", evidence: "Draft ready" },
      { id: "n4", label: "Licence fee payment", done: false, owner: "Mary Wanjiku", due: "28 Feb 2027", evidence: "Pay via M-Pesa" },
    ],
    documents: [
      { name: "Disposal pit photo", status: "Verified", updated: "20 Jul 2026" },
      { name: "Waste management plan", status: "Pending", updated: "In progress" },
    ],
  },
  {
    id: "cert-group",
    name: "Group Compliance (Kiambu Vegetable Farmers)",
    short: "Group audit",
    body: "Group internal audit for collective marketing",
    status: "In progress",
    progress: 62,
    requirements:
      "Group-level traceability, common spray rules, member record spot-checks",
    dueDate: "15 Dec 2026",
    fee: 3000,
    auditor: "Group compliance committee",
    scope: "245 member farms, spot-check of 20",
    checklist: [
      { id: "gr1", label: "Member records submitted for spot-check", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "Sep diary export" },
      { id: "gr2", label: "Common PHI rule accepted", done: true, owner: "Mary Wanjiku", due: "Done", evidence: "Signed charter" },
      { id: "gr3", label: "Group audit visit attended", done: false, owner: "Mary Wanjiku", due: "28 Nov 2026", evidence: "Booked" },
      { id: "gr4", label: "Corrective actions closed", done: false, owner: "Jane Njeri", due: "15 Dec 2026", evidence: "1 open item" },
    ],
    documents: [
      { name: "Group spray charter", status: "Verified", updated: "02 Sep 2026" },
      { name: "Spot-check acknowledgment", status: "Verified", updated: "18 Sep 2026" },
    ],
  },
];

export const AUDITORS = [
  {
    id: "aud-1",
    name: "County horticulture officer",
    org: "Kiambu County Agriculture",
    scope: "KS1758 readiness visit",
    phone: "0710 118 220",
    window: "02 – 06 Nov 2026",
    fee: 0,
    note: "Free advisory visit; official audit follows at KES 9,000.",
  },
  {
    id: "aud-2",
    name: "AfriCert Kenya inspector",
    org: "AfriCert (GLOBALG.A.P. approved)",
    scope: "GLOBALG.A.P. IFA v6 inspection",
    phone: "0709 442 118",
    window: "19 – 23 Jan 2027",
    fee: 68000,
    note: "Includes farm visit, document review and residue sampling advice.",
  },
  {
    id: "aud-3",
    name: "KOAN organic inspector",
    org: "Kenya Organic Agriculture Network",
    scope: "Year 1 conversion inspection",
    phone: "0722 661 740",
    window: "01 – 05 Dec 2027",
    fee: 35000,
    note: "Plot 3 kale conversion block only.",
  },
  {
    id: "aud-4",
    name: "Group compliance committee",
    org: "Kiambu Vegetable Farmers",
    scope: "Collective marketing internal audit",
    phone: "0720 664 218",
    window: "28 Nov 2026",
    fee: 3000,
    note: "Covers 20 randomly selected member farms.",
  },
];

/* ----------------------------------------------------- 12.6 soil tests */

export interface SoilSample {
  id: string;
  date: string;
  iso: string;
  lab: string;
  labRef: string;
  plot: string;
  crop: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  organicMatter: number;
  recommendation: string;
  cost: number;
  labPhone: string;
}

export const SOIL_TESTS: SoilSample[] = [
  {
    id: "soil-010",
    date: "16 Sep 2026",
    iso: "2026-09-16",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2026-4471",
    plot: "Plot 1",
    crop: "Cabbage Gloria F1",
    ph: 5.8,
    nitrogen: 15,
    phosphorus: 25,
    potassium: 180,
    calcium: 1200,
    magnesium: 200,
    organicMatter: 3.2,
    recommendation:
      "Lime 2 tonnes per acre, DAP at planting, CAN top-dress in two splits",
    cost: 3200,
    labPhone: "0711 220 118",
  },
  {
    id: "soil-009",
    date: "16 Sep 2026",
    iso: "2026-09-16",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2026-4472",
    plot: "Plot 3",
    crop: "Kale Thousand Headed",
    ph: 6.1,
    nitrogen: 19,
    phosphorus: 28,
    potassium: 210,
    calcium: 1450,
    magnesium: 240,
    organicMatter: 3.6,
    recommendation:
      "Maintain with manure 1.5 tonnes/acre and one CAN split after every picking cycle",
    cost: 1600,
    labPhone: "0711 220 118",
  },
  {
    id: "soil-008",
    date: "18 Mar 2026",
    iso: "2026-03-18",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2026-2210",
    plot: "Plot 1",
    crop: "Cabbage (previous cycle)",
    ph: 5.5,
    nitrogen: 12,
    phosphorus: 20,
    potassium: 160,
    calcium: 1100,
    magnesium: 180,
    organicMatter: 2.8,
    recommendation: "Lime, manure and DAP; re-check after liming",
    cost: 3200,
    labPhone: "0711 220 118",
  },
  {
    id: "soil-007",
    date: "18 Mar 2026",
    iso: "2026-03-18",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2026-2211",
    plot: "Plot 4",
    crop: "Maize H6213",
    ph: 5.6,
    nitrogen: 14,
    phosphorus: 21,
    potassium: 168,
    calcium: 1150,
    magnesium: 190,
    organicMatter: 2.9,
    recommendation: "Lime 1.5 tonnes/acre; band DAP at planting",
    cost: 1600,
    labPhone: "0711 220 118",
  },
  {
    id: "soil-006",
    date: "20 Sep 2025",
    iso: "2025-09-20",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2025-8890",
    plot: "Plot 1",
    crop: "Cabbage (SR 2025)",
    ph: 5.4,
    nitrogen: 11,
    phosphorus: 18,
    potassium: 155,
    calcium: 1050,
    magnesium: 170,
    organicMatter: 2.6,
    recommendation: "Start the liming programme before the short rains",
    cost: 3200,
    labPhone: "0711 220 118",
  },
  {
    id: "soil-005",
    date: "20 Sep 2025",
    iso: "2025-09-20",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2025-8891",
    plot: "Plot 2",
    crop: "Tomato Roma VF",
    ph: 5.9,
    nitrogen: 17,
    phosphorus: 24,
    potassium: 190,
    calcium: 1300,
    magnesium: 210,
    organicMatter: 3.0,
    recommendation: "Maintain; watch calcium for blossom-end rot",
    cost: 3200,
    labPhone: "0711 220 118",
  },
  {
    id: "soil-004",
    date: "22 Mar 2025",
    iso: "2025-03-22",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2025-3320",
    plot: "Plot 1",
    crop: "Cabbage (LR 2025)",
    ph: 5.5,
    nitrogen: 12,
    phosphorus: 20,
    potassium: 160,
    calcium: 1080,
    magnesium: 175,
    organicMatter: 2.7,
    recommendation: "Lime 2 tonnes/acre and add well-rotted manure",
    cost: 3200,
    labPhone: "0711 220 118",
  },
  {
    id: "soil-003",
    date: "22 Mar 2025",
    iso: "2025-03-22",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2025-3321",
    plot: "Plot 3",
    crop: "Kale Thousand Headed",
    ph: 6.0,
    nitrogen: 18,
    phosphorus: 26,
    potassium: 205,
    calcium: 1400,
    magnesium: 230,
    organicMatter: 3.4,
    recommendation: "Hold current programme; organic matter is improving",
    cost: 1600,
    labPhone: "0711 220 118",
  },
  {
    id: "soil-002",
    date: "14 Sep 2024",
    iso: "2024-09-14",
    lab: "Crop Nutrition Laboratory Services (Cropnuts), Nairobi",
    labRef: "CNS-2024-7781",
    plot: "Plot 1",
    crop: "Cabbage (baseline)",
    ph: 5.3,
    nitrogen: 10,
    phosphorus: 16,
    potassium: 150,
    calcium: 1000,
    magnesium: 165,
    organicMatter: 2.4,
    recommendation: "Baseline sampling: lime needed, low nitrogen and organic matter",
    cost: 4500,
    labPhone: "0709 880 112",
  },
  {
    id: "soil-001",
    date: "14 Sep 2024",
    iso: "2024-09-14",
    lab: "Crop Nutrition Laboratory Services (Cropnuts), Nairobi",
    labRef: "CNS-2024-7782",
    plot: "Plot 4",
    crop: "Maize (baseline)",
    ph: 5.2,
    nitrogen: 9,
    phosphorus: 15,
    potassium: 145,
    calcium: 980,
    magnesium: 160,
    organicMatter: 2.2,
    recommendation: "Baseline: liming programme plus manure on Plot 4",
    cost: 4500,
    labPhone: "0709 880 112",
  },
];

/* ------------------------------------------------ compliance centre bits */

export interface ComplianceGap {
  id: string;
  section: string;
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
  owner: string;
  due: string;
  action: string;
  actionTarget: string;
}

export const COMPLIANCE_GAPS: ComplianceGap[] = [
  {
    id: "gap-1",
    section: "12.2 Spray record",
    title: "SR-005 is missing the sprayer calibration reading",
    detail:
      "The cutworm application on 14 Aug 2026 has no calibration value, so the dose cannot be verified during an audit.",
    severity: "medium",
    owner: "John Mwangi",
    due: "26 Sep 2026",
    action: "Complete the record",
    actionTarget: "spray-fix",
  },
  {
    id: "gap-2",
    section: "12.2 Spray record",
    title: "SR-012 was applied with incomplete PPE",
    detail:
      "A high-hazard pyrethroid was sprayed with gloves only, and wind speed was above the label limit.",
    severity: "high",
    owner: "Mary Wanjiku",
    due: "30 Sep 2026",
    action: "Open corrective action",
    actionTarget: "corrective",
  },
  {
    id: "gap-3",
    section: "12.3 Purchases",
    title: "Invoice INV-4477 (Cypermethrin) has no receipt photo",
    detail:
      "The 30 Jun 2026 purchase must carry a receipt image to satisfy traceability back to the supplier.",
    severity: "medium",
    owner: "Mary Wanjiku",
    due: "28 Sep 2026",
    action: "Attach receipt",
    actionTarget: "purchase",
  },
  {
    id: "gap-4",
    section: "12.5 Certification",
    title: "Water quality test missing for KS1758",
    detail:
      "The irrigation source test is the last blocking item for the KS1758 submission.",
    severity: "high",
    owner: "Kamau Mwangi",
    due: "24 Oct 2026",
    action: "Book water test",
    actionTarget: "cert",
  },
  {
    id: "gap-5",
    section: "12.1 Diary",
    title: "Two days in September have no diary entry",
    detail:
      "10 Sep and 11 Sep 2026 are empty. Auditors expect a rolling daily record during harvest months.",
    severity: "low",
    owner: "Mary Wanjiku",
    due: "27 Sep 2026",
    action: "Backfill entries",
    actionTarget: "diary",
  },
  {
    id: "gap-6",
    section: "12.4 Batches",
    title: "Batch GRM-KMB-2026-006 has no QR scans recorded",
    detail:
      "The beans batch was delivered to the co-op, but no buyer scan was captured. Verify delivery.",
    severity: "low",
    owner: "Mary Wanjiku",
    due: "05 Oct 2026",
    action: "Verify delivery",
    actionTarget: "batch",
  },
  {
    id: "gap-7",
    section: "12.6 Soil tests",
    title: "Plot 2 soil test is more than 12 months old",
    detail:
      "The last tomato-block sample was 20 Sep 2025. Re-sample before the next transplant.",
    severity: "medium",
    owner: "Mary Wanjiku",
    due: "20 Oct 2026",
    action: "Book soil test",
    actionTarget: "soil",
  },
  {
    id: "gap-8",
    section: "12.5 Certification",
    title: "GlobalG.A.P. self-assessment not submitted",
    detail:
      "The v6 base module self-assessment has been open since August with 24% completion.",
    severity: "medium",
    owner: "Mary Wanjiku",
    due: "20 Oct 2026",
    action: "Continue self-assessment",
    actionTarget: "cert",
  },
];

export const EVIDENCE_DOCUMENTS = [
  { id: "ev-1", name: "Spray record export (Jan – Sep 2026)", kind: "PDF", size: "486 KB", generated: "18 Sep 2026", sections: "12.2", scans: 4, verified: true },
  { id: "ev-2", name: "Input purchase ledger with receipts", kind: "PDF", size: "1.2 MB", generated: "18 Sep 2026", sections: "12.3", scans: 11, verified: true },
  { id: "ev-3", name: "Farm diary — September 2026", kind: "PDF", size: "318 KB", generated: "18 Sep 2026", sections: "12.1", scans: 2, verified: true },
  { id: "ev-4", name: "Batch traceability sheets (10 batches)", kind: "CSV", size: "84 KB", generated: "18 Sep 2026", sections: "12.4", scans: 0, verified: true },
  { id: "ev-5", name: "KALRO soil analysis report — Sep 2026", kind: "PDF", size: "742 KB", generated: "16 Sep 2026", sections: "12.6", scans: 3, verified: true },
  { id: "ev-6", name: "KS1758 self-assessment checklist", kind: "XLSX", size: "96 KB", generated: "15 Sep 2026", sections: "12.5", scans: 0, verified: false },
  { id: "ev-7", name: "Worker training attendance register", kind: "PDF", size: "212 KB", generated: "12 Sep 2026", sections: "12.5", scans: 1, verified: false },
  { id: "ev-8", name: "Chemical store inspection photos", kind: "JPEG set", size: "3.4 MB", generated: "10 Sep 2026", sections: "12.2", scans: 0, verified: true },
  { id: "ev-9", name: "Group spray charter (signed)", kind: "PDF", size: "148 KB", generated: "02 Sep 2026", sections: "12.5", scans: 1, verified: true },
  { id: "ev-10", name: "Harvest hygiene SOP — shed", kind: "PDF", size: "204 KB", generated: "28 Aug 2026", sections: "12.4", scans: 0, verified: false },
];

export const RECORD_REQUESTS = [
  { id: "rq-1", from: "Twiga Foods — Quality desk", kind: "Batch trace", scope: "GRM-KMB-2026-008", status: "Answered", requested: "20 Aug 2026", channel: "Email + app", contact: "0709 800 900" },
  { id: "rq-2", from: "Kamau Brokers", kind: "Spray history", scope: "Plot 1 cabbage, LR 2026", status: "Answered", requested: "27 Aug 2026", channel: "WhatsApp", contact: "0722 909 331" },
  { id: "rq-3", from: "AfriCert Kenya (pre-audit)", kind: "Full compliance pack", scope: "All records, Jan – Sep 2026", status: "In review", requested: "16 Sep 2026", channel: "Email", contact: "0709 442 118" },
  { id: "rq-4", from: "Kiambu County horticulture office", kind: "KS1758 evidence", scope: "Sections 12.2, 12.3, 12.5", status: "Open", requested: "18 Sep 2026", channel: "App request", contact: "0710 118 220" },
  { id: "rq-5", from: "Githunguri Farmers Co-op", kind: "Group spot-check", scope: "Diary + spray records, Sep 2026", status: "Answered", requested: "12 Sep 2026", channel: "SMS + app", contact: "0710 552 447" },
  { id: "rq-6", from: "KALRO residue study", kind: "Anonymised input data", scope: "Mancozeb + Imidacloprid use", status: "Open", requested: "19 Sep 2026", channel: "Email", contact: "0711 220 118" },
];

export const RECORD_ACTIVITY = [
  { month: "Oct 2025", diary: 9, sprays: 1, purchases: 1, batches: 1 },
  { month: "Nov 2025", diary: 11, sprays: 2, purchases: 1, batches: 0 },
  { month: "Dec 2025", diary: 14, sprays: 2, purchases: 2, batches: 1 },
  { month: "Jan 2026", diary: 16, sprays: 1, purchases: 2, batches: 1 },
  { month: "Feb 2026", diary: 12, sprays: 1, purchases: 1, batches: 1 },
  { month: "Mar 2026", diary: 15, sprays: 2, purchases: 2, batches: 0 },
  { month: "Apr 2026", diary: 13, sprays: 3, purchases: 1, batches: 2 },
  { month: "May 2026", diary: 17, sprays: 1, purchases: 3, batches: 2 },
  { month: "Jun 2026", diary: 21, sprays: 2, purchases: 4, batches: 1 },
  { month: "Jul 2026", diary: 19, sprays: 3, purchases: 2, batches: 1 },
  { month: "Aug 2026", diary: 22, sprays: 4, purchases: 2, batches: 2 },
  { month: "Sep 2026", diary: 18, sprays: 2, purchases: 2, batches: 1 },
];

export const RECORD_SETTINGS = {
  dailyReminder: true,
  reminderTime: "18:30",
  phiAlerts: true,
  smsBackup: true,
  photoMandatory: false,
  autoBatchCode: true,
  retentionYears: 7,
  shareWithCoop: true,
  shareWithBuyer: true,
  witnessSignature: true,
  language: "English (Kiswahili reminders)",
};

export const RETENTION_RULES = [
  { doc: "Farm diary entries", years: "7 years", basis: "KS1758 + GlobalG.A.P. traceability", next: "Delete nothing before Sep 2033" },
  { doc: "Spray records", years: "7 years", basis: "PCPB + buyer residue audits", next: "Keep SR-001 → SR-012" },
  { doc: "Input purchase invoices", years: "5 years", basis: "KRA and KEPHIS traceability", next: "Oldest kept: May 2026" },
  { doc: "Harvest batch sheets", years: "3 years", basis: "Buyer and export requirements", next: "Oldest kept: Jan 2026" },
  { doc: "Soil test reports", years: "10 years", basis: "Agronomic trend analysis", next: "Oldest kept: Sep 2024" },
  { doc: "Certification evidence", years: "Until renewal + 3", basis: "Certification body rules", next: "KS1758 pack due Nov 2026" },
];

export const RECORD_FAQ = [
  {
    q: "Do I have to write a diary entry every day?",
    a: "During the harvest and spray months, yes — auditors look for a rolling record. On quiet weeks two or three entries covering scouting, weather and decisions are accepted.",
  },
  {
    q: "What happens when a spray record is incomplete?",
    a: "The compliance centre flags it with the missing field. Open the record, fill the gap and it clears automatically once the calibration, batch and PPE details are present.",
  },
  {
    q: "How is the pre-harvest interval calculated?",
    a: "GrowMO takes the spray date, adds the label PHI of the product used and returns the safe harvest date. The longest PHI in the plot wins, so one product cannot hide behind another.",
  },
  {
    q: "Can a buyer see my records without asking me?",
    a: "No. Sharing happens through a time-limited data share link with a PIN. You choose the sections, the expiry date and whether the buyer can download scans.",
  },
  {
    q: "What is the QR code on the crate?",
    a: "It opens the batch passport: farm, plot, planting and harvest dates, inputs used, spray history, soil test and destination. A buyer scanning it sees exactly where the produce came from.",
  },
  {
    q: "Will my records work offline?",
    a: "Yes. Entries are written to the phone first and sync when there is network. The cloud-sync badge in the topbar shows the last successful sync.",
  },
];

/* ------------------------------------------------------------- helpers */

export function sprayPhiState(record: SprayRecord) {
  if (record.status === "Planned" || record.status === "Blocked") {
    return {
      safe: false,
      tone: record.status === "Blocked" ? ("high" as const) : ("medium" as const),
      label:
        record.status === "Blocked"
          ? "Corrective action required"
          : "Planned application",
      detail: `Next safe harvest after application: ${record.nextSafeHarvest}`,
    };
  }
  const today = Date.parse("2026-09-20");
  const safeDate = Date.parse(record.iso) + record.phiDays * 86400000;
  const daysLeft = Math.ceil((safeDate - today) / 86400000);
  if (daysLeft <= 0) {
    return {
      safe: true,
      tone: "low" as const,
      label: "PHI cleared",
      detail: `Safe since ${record.nextSafeHarvest} · ${record.phiDays}-day interval respected`,
    };
  }
  return {
    safe: false,
    tone: daysLeft <= 5 ? ("high" as const) : ("medium" as const),
    label: `${daysLeft} day${daysLeft === 1 ? "" : "s"} to safe harvest`,
    detail: `Do not harvest before ${record.nextSafeHarvest}`,
  };
}

export function certTone(status: CertStatus) {
  if (status === "Certified" || status === "Active") return "low" as const;
  if (status === "In progress") return "medium" as const;
  if (status === "Expired") return "high" as const;
  return "neutral" as const;
}

export function diaryTone(entry: DiaryEntry) {
  if (entry.type === "Problem") return "high" as const;
  if (entry.type === "Weather event") return "medium" as const;
  if (entry.type === "Harvest") return "low" as const;
  return "neutral" as const;
}

export function soilLevel(value: number, kind: "ph" | "n" | "p" | "k" | "om") {
  if (kind === "ph") {
    if (value < 5.5) return "Low" as const;
    if (value > 7) return "High" as const;
    return "Optimal" as const;
  }
  const table: Record<string, [number, number]> = {
    n: [20, 40],
    p: [25, 50],
    k: [150, 300],
    om: [3, 6],
  };
  const [low, high] = table[kind] ?? [0, 100];
  if (value < low) return "Low" as const;
  if (value > high) return "High" as const;
  return "Optimal" as const;
}

export function recordTotals() {
  return {
    diary: DIARY_ENTRIES.length,
    sprays: SPRAY_RECORDS.length,
    purchases: PURCHASES.length,
    batches: HARVEST_BATCHES.length,
    certs: CERTIFICATIONS.length,
    soil: SOIL_TESTS.length,
    purchaseValue: PURCHASES.reduce((sum, item) => sum + item.total, 0),
    sprayValue: SPRAY_RECORDS.reduce((sum, item) => sum + item.cost, 0),
    soilValue: SOIL_TESTS.reduce((sum, item) => sum + item.cost, 0),
    qrScans: HARVEST_BATCHES.reduce((sum, item) => sum + item.qrScans, 0),
  };
}
