/* ============================================================================
   PAGE 17 — SOIL HEALTH & TESTING MANAGEMENT  (/app/soil)
   Kenyan demo soil data for Mary's Farm, Githunguri (Kiambu), LR 2026 season.

   Blueprint sections covered by this dataset:
   17.1 soil test scheduler · 17.2 results dashboard (15 parameters) ·
   17.3 AI fertilizer recommendation + skipped inputs · 17.4 test history and
   trend analysis with soil health score · 17.5 soil sampling instructions
   (EN/SW) · 17.6 lab directory · 17.7 long-term soil health improvement plan ·
   17.8 soil moisture monitoring (methods + weekly balance).
   Labs, prices, references and M-Pesa receipts are realistic but fictional.
   ========================================================================== */

export const SOIL_CONTEXT = {
  farm: "Mary's Farm",
  farmer: "Mary Wanjiku",
  county: "Kiambu",
  subCounty: "Githunguri",
  village: "Kagwe Road",
  phone: "0712 345 678",
  idNumber: "12345678",
  season: "LR 2026 · Long rains",
  walletBalance: 35000,
  mpesaName: "MARY WANJIKU K",
  soilHealthScore: 58,
  soilHealthScoreYearAgo: 51,
  score2023: 35,
  projectedScore: 70,
  lastTest: "16 Sep 2026",
  nextTest: "Sep 2027",
  lab: "KALRO Soil Laboratory, Kabete",
  labRef: "KAL-2026-4471",
  agronomist: "Peter Otieno",
  acreage: 2,
  zones: 3,
  activePlot: "Plot 1",
};

/* ------------------------------------------------------------ 17.1 plots */

export interface SoilPlot {
  id: string;
  name: string;
  area: string;
  crop: string;
  variety: string;
  texture: string;
  ph: number;
  organicMatter: number;
  lastTest: string;
  lastTestIso: string;
  nextTest: string;
  nextTestIso: string;
  lab: string;
  status: "Due soon" | "Current" | "Overdue" | "Sampled";
  zone: string;
  note: string;
}

export const SOIL_PLOTS: SoilPlot[] = [
  {
    id: "plot-1",
    name: "Plot 1",
    area: "0.5 acre",
    crop: "Cabbage",
    variety: "Gloria F1",
    texture: "Clay loam",
    ph: 5.8,
    organicMatter: 3.2,
    lastTest: "16 Sep 2026",
    lastTestIso: "2026-09-16",
    nextTest: "16 Sep 2027",
    nextTestIso: "2027-09-16",
    lab: "KALRO Soil Laboratory, Kabete",
    status: "Current",
    zone: "Zone A · lower block, near the furrow",
    note: "Annual test done. Lime programme starts 2 weeks before transplanting.",
  },
  {
    id: "plot-2",
    name: "Plot 2",
    area: "0.5 acre",
    crop: "Tomato",
    variety: "Roma VF",
    texture: "Clay loam",
    ph: 6.2,
    organicMatter: 3.8,
    lastTest: "16 Sep 2026",
    lastTestIso: "2026-09-16",
    nextTest: "16 Sep 2027",
    nextTestIso: "2027-09-16",
    lab: "KALRO Soil Laboratory, Kabete",
    status: "Current",
    zone: "Zone A · mid block",
    note: "pH close to optimal — maintain with manure, no lime needed this season.",
  },
  {
    id: "plot-3",
    name: "Plot 3",
    area: "0.4 acre",
    crop: "Kale",
    variety: "Thousand Headed",
    texture: "Loam",
    ph: 6.1,
    organicMatter: 3.6,
    lastTest: "16 Sep 2026",
    lastTestIso: "2026-09-16",
    nextTest: "16 Sep 2027",
    nextTestIso: "2027-09-16",
    lab: "KALRO Soil Laboratory, Kabete",
    status: "Current",
    zone: "Zone B · upper terrace",
    note: "One CAN split after every picking cycle keeps the leaf colour right.",
  },
  {
    id: "plot-4",
    name: "Plot 4",
    area: "0.3 acre",
    crop: "Potato",
    variety: "Shangi",
    texture: "Sandy clay loam",
    ph: 5.5,
    organicMatter: 2.8,
    lastTest: "04 Mar 2026",
    lastTestIso: "2026-03-04",
    nextTest: "04 Mar 2027",
    nextTestIso: "2027-03-04",
    lab: "Crop Nutrition Laboratory, Nairobi",
    status: "Due soon",
    zone: "Zone B · steep corner, watch erosion",
    note: "Test before the SR 2027 planting. Potato needs pH 5.2 – 6.0 to limit scab.",
  },
  {
    id: "plot-5",
    name: "Plot 5 (new lease)",
    area: "0.3 acre",
    crop: "Maize",
    variety: "H6213",
    texture: "Clay loam",
    ph: 5.2,
    organicMatter: 2.4,
    lastTest: "Never tested",
    lastTestIso: "2026-09-20",
    nextTest: "Book now",
    nextTestIso: "2026-09-25",
    lab: "Not sampled yet",
    status: "Overdue",
    zone: "Zone C · newly leased land",
    note: "Two seasons of continuous maize on the neighbour's side — test before spending on fertilizer.",
  },
  {
    id: "plot-6",
    name: "Plot 6 (kitchen garden)",
    area: "0.1 acre",
    crop: "Spinach & managu",
    variety: "Mixed",
    texture: "Loam",
    ph: 6.4,
    organicMatter: 4.6,
    lastTest: "21 Jan 2026",
    lastTestIso: "2026-01-21",
    nextTest: "21 Jan 2027",
    nextTestIso: "2027-01-21",
    lab: "County Government Lab, Kiambu",
    status: "Current",
    zone: "Zone A · house block, compost applied",
    note: "Highest organic matter on the farm because of continuous composting.",
  },
  {
    id: "plot-7",
    name: "Plot 7 (nursery bed)",
    area: "0.05 acre",
    crop: "Nursery seedlings",
    variety: "Cabbage + tomato",
    texture: "Loam (raised beds)",
    ph: 6.0,
    organicMatter: 5.2,
    lastTest: "12 Aug 2026",
    lastTestIso: "2026-08-12",
    nextTest: "12 Aug 2027",
    nextTestIso: "2027-08-12",
    lab: "Crop Nutrition Laboratory, Nairobi",
    status: "Current",
    zone: "Zone A · shade net area",
    note: "Sterilised seed-bed mix, so pH and OM stay high — no field recommendations apply.",
  },
  {
    id: "plot-8",
    name: "Plot 8 (lower terrace)",
    area: "0.4 acre",
    crop: "Beans",
    variety: "Rosecoco",
    texture: "Clay",
    ph: 5.6,
    organicMatter: 2.9,
    lastTest: "11 Jan 2026",
    lastTestIso: "2026-01-11",
    nextTest: "11 Jan 2027",
    nextTestIso: "2027-01-11",
    lab: "MEA Ltd, Nairobi",
    status: "Due soon",
    zone: "Zone C · waterlogged in long rains",
    note: "Drainage is the limiting factor here more than nutrients — add a cut-off furrow.",
  },
  {
    id: "plot-9",
    name: "Plot 9 (woodlot edge)",
    area: "0.2 acre",
    crop: "Avocado",
    variety: "Hass",
    texture: "Sandy loam",
    ph: 5.9,
    organicMatter: 3.1,
    lastTest: "07 Feb 2026",
    lastTestIso: "2026-02-07",
    nextTest: "07 Feb 2027",
    nextTestIso: "2027-02-07",
    lab: "Soil Cares Laboratory, Nairobi",
    status: "Current",
    zone: "Zone C · shallow soil over murram",
    note: "Sample at 0 – 20 cm plus a second deeper sample if the trees keep yellowing.",
  },
  {
    id: "plot-10",
    name: "Plot 10 (compost yard)",
    area: "0.05 acre",
    crop: "Compost & manure storage",
    variety: "—",
    texture: "Silt loam",
    ph: 7.4,
    organicMatter: 6.8,
    lastTest: "30 Jun 2026",
    lastTestIso: "2026-06-30",
    nextTest: "30 Jun 2027",
    nextTestIso: "2027-06-30",
    lab: "University of Nairobi, Land Resource Lab",
    status: "Current",
    zone: "Zone A · never used for cash crops",
    note: "Never take crop samples here — the ash and manure heaps distort the result.",
  },
];

/* ------------------------------------------------- 17.1 test types + labs */

export interface SoilTestType {
  id: string;
  label: string;
  parameters: string;
  turnaround: string;
  costBasic: number;
  costComprehensive: number;
  bestFor: string;
  swahili: string;
}

export const SOIL_TEST_TYPES: SoilTestType[] = [
  {
    id: "type-basic",
    label: "Basic",
    parameters: "pH, N, P, K, organic matter",
    turnaround: "7 – 14 days",
    costBasic: 2000,
    costComprehensive: 0,
    bestFor: "Routine annual check on plots already under a correction programme",
    swahili: "Upimaji wa kawaida — pH, N, P, K na viini vya udongo",
  },
  {
    id: "type-comprehensive",
    label: "Comprehensive",
    parameters: "pH, N, P, K, Ca, Mg, S, Zn, B, Cu, Fe, Mn, CEC, texture",
    turnaround: "10 – 14 days",
    costBasic: 0,
    costComprehensive: 5000,
    bestFor: "New land, certification evidence and micronutrient troubleshooting",
    swahili: "Upimaji kamili — unaongeza Ca, Mg, S na madini ya viini",
  },
  {
    id: "type-specialized",
    label: "Specialized",
    parameters: "Heavy metals, salinity, pathogens, pesticide residues",
    turnaround: "21 – 28 days",
    costBasic: 0,
    costComprehensive: 12000,
    bestFor: "Export buyers, greenhouse media and plots with a suspect history",
    swahili: "Upimaji maalum — metali nzito, chumvi na vimelea vya magonjwa",
  },
];

export interface SoilLab {
  id: string;
  name: string;
  location: string;
  tests: string;
  turnaround: string;
  costBasic: number;
  costComprehensive: number;
  phone: string;
  email: string;
  accreditation: string;
  courier: string;
  counties: string;
  note: string;
  rating: number;
}

export const SOIL_LABS: SoilLab[] = [
  {
    id: "lab-1",
    name: "KALRO Soil Laboratory",
    location: "Kabete, Nairobi · plus Kisumu, Mombasa, Embu, Kitale",
    tests: "Full range (basic → specialized)",
    turnaround: "7 – 14 days",
    costBasic: 2000,
    costComprehensive: 5000,
    phone: "020 444 3805",
    email: "soillab@kalro.org",
    accreditation: "ISO/IEC 17025 (KENAS)",
    courier: "Pick-up at KALRO Kabete gate, samples accepted to 4 pm",
    counties: "All 47 counties via county extension office",
    note: "Reference lab used for KS1758 and GlobalG.A.P. audit evidence.",
    rating: 4.8,
  },
  {
    id: "lab-2",
    name: "Crop Nutrition Laboratory",
    location: "Industrial Area, Nairobi",
    tests: "NPK, pH, organic matter, micronutrients",
    turnaround: "5 – 7 days",
    costBasic: 1500,
    costComprehensive: 4500,
    phone: "0722 604 118",
    email: "service@cropnutrition.co.ke",
    accreditation: "KEPHIS registered, private lab",
    courier: "Boda pick-up Githunguri – Nairobi, KES 350",
    counties: "Kiambu, Nairobi, Murang'a, Nakuru",
    note: "Fastest turnaround; gives a fertilizer programme on the report.",
    rating: 4.5,
  },
  {
    id: "lab-3",
    name: "University of Nairobi — Land Resource Lab",
    location: "Kabete Campus, Nairobi",
    tests: "Full range including CEC and texture",
    turnaround: "10 – 21 days",
    costBasic: 1000,
    costComprehensive: 3500,
    phone: "020 359 3142",
    email: "lrm.lab@uonbi.ac.ke",
    accreditation: "University research laboratory",
    courier: "Drop off at the department, 8 am – 3 pm weekdays",
    counties: "National — students also explain results on request",
    note: "Cheapest full-range option; ideal for certification evidence on a budget.",
    rating: 4.3,
  },
  {
    id: "lab-4",
    name: "MEA Ltd (Fertilizer quality control)",
    location: "Nairobi and Eldoret",
    tests: "NPK, pH, organic matter",
    turnaround: "5 days",
    costBasic: 1800,
    costComprehensive: 4000,
    phone: "0733 777 612",
    email: "lab@mea.co.ke",
    accreditation: "ISO 9001:2015",
    courier: "Courier account, samples arrive next day",
    counties: "Nairobi, Uasin Gishu, Trans Nzoia, Nandi",
    note: "Good for bulk buyers who also want to verify delivered fertilizer quality.",
    rating: 4.4,
  },
  {
    id: "lab-5",
    name: "County Government Soil Lab — Kiambu",
    location: "Kiambu town, Agriculture offices",
    tests: "Basic (pH, N, P, K)",
    turnaround: "14 – 28 days",
    costBasic: 500,
    costComprehensive: 0,
    phone: "0709 875 210",
    email: "agri@kiambu.go.ke",
    accreditation: "County government service",
    courier: "Drop at the sub-county agriculture office, Githunguri",
    counties: "Kiambu only, free for registered farmer groups",
    note: "Cheapest, but slow — book early if you need results before planting.",
    rating: 3.9,
  },
  {
    id: "lab-6",
    name: "Soil Cares Laboratory",
    location: "Westlands, Nairobi (mobile scanner service)",
    tests: "pH, NPK, organic matter, soil type",
    turnaround: "48 hours",
    costBasic: 2500,
    costComprehensive: 6000,
    phone: "0715 880 342",
    email: "info@soilcares.co.ke",
    accreditation: "Private, handheld spectrometer service",
    courier: "Technician comes to the farm with the scanner",
    counties: "Kiambu, Nairobi, Machakos, Kajiado, Nakuru",
    note: "Good for rapid checks between full lab tests; not accepted for certification.",
    rating: 4.1,
  },
  {
    id: "lab-7",
    name: "Kenya Agricultural Livestock Research — Embu",
    location: "Embu Centre",
    tests: "Full range (basic and comprehensive)",
    turnaround: "10 – 14 days",
    costBasic: 2000,
    costComprehensive: 5000,
    phone: "068 223 1345",
    email: "embu@kalro.org",
    accreditation: "ISO/IEC 17025 (KENAS)",
    courier: "Regional drop-off for Mt Kenya counties",
    counties: "Embu, Kirinyaga, Meru, Tharaka Nithi",
    note: "Nearest KALRO option for farmers east of Kiambu.",
    rating: 4.6,
  },
  {
    id: "lab-8",
    name: "AgroCares Africa Ltd",
    location: "Nakuru and Kisumu hubs",
    tests: "Comprehensive plus fertilizer advice report",
    turnaround: "6 – 8 days",
    costBasic: 1600,
    costComprehensive: 4200,
    phone: "0741 226 909",
    email: "hello@agrocares.africa",
    accreditation: "Private, KEPHIS registered",
    courier: "Collection points in 12 sub-counties",
    counties: "Nakuru, Kisumu, Kakamega, Bungoma, Siaya",
    note: "Popular with co-operatives buying tests in bulk for members.",
    rating: 4.2,
  },
  {
    id: "lab-9",
    name: "Equity Agribusiness Soil Desk",
    location: "Thika branch, partnership lab",
    tests: "Basic and comprehensive",
    turnaround: "7 – 10 days",
    costBasic: 1200,
    costComprehensive: 3800,
    phone: "0700 456 220",
    email: "agri.thika@equitybank.co.ke",
    accreditation: "Bank-partnered lab, KEPHIS registered",
    courier: "Drop at any Equity branch with an agri desk",
    counties: "Kiambu, Murang'a, Kirinyaga, Nairobi",
    note: "Discounted for farmers financing inputs through the agri-loan product.",
    rating: 4.0,
  },
  {
    id: "lab-10",
    name: "SGS Kenya — Export Compliance Lab",
    location: "Mombasa and Nairobi",
    tests: "Specialized: heavy metals, pesticide residues, microbiology",
    turnaround: "21 – 28 days",
    costBasic: 0,
    costComprehensive: 12000,
    phone: "020 691 4000",
    email: "ke.info@sgs.com",
    accreditation: "ISO/IEC 17025 (KENAS) and GLOBALG.A.P. approved",
    note: "Required for some EU buyers; book the schedule 3 weeks before export.",
    courier: "Courier with chain-of-custody paperwork",
    counties: "National, export-focused",
    rating: 4.7,
  },
];

/* ------------------------------------------- 17.2 latest test parameters */

export type SoilParamStatus = "Low" | "Slightly low" | "Optimal" | "High" | "Adequate" | "Medium";

export interface SoilParameter {
  id: string;
  parameter: string;
  symbol: string;
  value: number;
  unit: string;
  display: string;
  status: SoilParamStatus;
  optimalLow: number;
  optimalHigh: number;
  optimalLabel: string;
  recommendation: string;
  method: string;
  actionTarget: "lime" | "manure" | "dap" | "can" | "sulphur" | "zinc" | "boron" | "none";
  actionCost: number;
}

export const SOIL_PARAMETERS: SoilParameter[] = [
  {
    id: "sp-ph",
    parameter: "pH (acidity)",
    symbol: "pH",
    value: 5.8,
    unit: "",
    display: "5.8",
    status: "Slightly low",
    optimalLow: 6,
    optimalHigh: 7,
    optimalLabel: "6.0 – 7.0",
    recommendation: "Apply 2 tonnes/acre agricultural lime 2 – 3 weeks before planting",
    method: "1:2.5 soil : water suspension, pH meter",
    actionTarget: "lime",
    actionCost: 8000,
  },
  {
    id: "sp-om",
    parameter: "Organic matter",
    symbol: "OM",
    value: 3.2,
    unit: "%",
    display: "3.2%",
    status: "Medium",
    optimalLow: 4,
    optimalHigh: 6,
    optimalLabel: "4 – 6 %",
    recommendation: "Increase manure to 5 tonnes/acre and add compost at land preparation",
    method: "Walkley-Black wet oxidation",
    actionTarget: "manure",
    actionCost: 30000,
  },
  {
    id: "sp-n",
    parameter: "Nitrogen",
    symbol: "N",
    value: 15,
    unit: "ppm",
    display: "15 ppm",
    status: "Low",
    optimalLow: 20,
    optimalHigh: 40,
    optimalLabel: "20 – 40 ppm",
    recommendation: "Apply DAP at planting plus two CAN top-dressings",
    method: "Kjeldahl digestion",
    actionTarget: "dap",
    actionCost: 6500,
  },
  {
    id: "sp-p",
    parameter: "Phosphorus",
    symbol: "P",
    value: 25,
    unit: "ppm",
    display: "25 ppm",
    status: "Medium",
    optimalLow: 15,
    optimalHigh: 30,
    optimalLabel: "15 – 30 ppm",
    recommendation: "Maintain with DAP at planting — no extra P needed this season",
    method: "Olsen bicarbonate extraction",
    actionTarget: "dap",
    actionCost: 6500,
  },
  {
    id: "sp-k",
    parameter: "Potassium",
    symbol: "K",
    value: 180,
    unit: "ppm",
    display: "180 ppm",
    status: "High",
    optimalLow: 100,
    optimalHigh: 200,
    optimalLabel: "100 – 200 ppm",
    recommendation: "No K fertilizer needed — skip MOP and save KES 6,000",
    method: "Ammonium acetate extraction",
    actionTarget: "none",
    actionCost: 0,
  },
  {
    id: "sp-ca",
    parameter: "Calcium",
    symbol: "Ca",
    value: 1200,
    unit: "ppm",
    display: "1,200 ppm",
    status: "Medium",
    optimalLow: 1500,
    optimalHigh: 3000,
    optimalLabel: "1,500 – 3,000 ppm",
    recommendation: "The planned lime application also supplies calcium — no gypsum needed",
    method: "Ammonium acetate extraction",
    actionTarget: "lime",
    actionCost: 0,
  },
  {
    id: "sp-mg",
    parameter: "Magnesium",
    symbol: "Mg",
    value: 200,
    unit: "ppm",
    display: "200 ppm",
    status: "Adequate",
    optimalLow: 80,
    optimalHigh: 200,
    optimalLabel: "80 – 200 ppm",
    recommendation: "Adequate for cabbage and tomato — no correction needed",
    method: "Ammonium acetate extraction",
    actionTarget: "none",
    actionCost: 0,
  },
  {
    id: "sp-s",
    parameter: "Sulphur",
    symbol: "S",
    value: 12,
    unit: "ppm",
    display: "12 ppm",
    status: "Low",
    optimalLow: 15,
    optimalHigh: 25,
    optimalLabel: "15 – 25 ppm",
    recommendation: "Apply a sulphur-containing fertilizer — sulphate of ammonia or gypsum 50 kg/acre",
    method: "Calcium phosphate extraction",
    actionTarget: "sulphur",
    actionCost: 3200,
  },
  {
    id: "sp-zn",
    parameter: "Zinc",
    symbol: "Zn",
    value: 1.8,
    unit: "ppm",
    display: "1.8 ppm",
    status: "Low",
    optimalLow: 2,
    optimalHigh: 5,
    optimalLabel: "2 – 5 ppm",
    recommendation: "Zinc sulphate 10 kg/acre at land prep or Zincrex foliar at 4-leaf stage",
    method: "DTPA extraction, atomic absorption",
    actionTarget: "zinc",
    actionCost: 2200,
  },
  {
    id: "sp-b",
    parameter: "Boron",
    symbol: "B",
    value: 0.4,
    unit: "ppm",
    display: "0.4 ppm",
    status: "Low",
    optimalLow: 0.5,
    optimalHigh: 1,
    optimalLabel: "0.5 – 1.0 ppm",
    recommendation: "Solubor 2 kg/acre at land prep, or boron foliar at heading to stop hollow heart",
    method: "Hot water extraction",
    actionTarget: "boron",
    actionCost: 1400,
  },
  {
    id: "sp-cu",
    parameter: "Copper",
    symbol: "Cu",
    value: 1.2,
    unit: "ppm",
    display: "1.2 ppm",
    status: "Adequate",
    optimalLow: 0.5,
    optimalHigh: 3,
    optimalLabel: "0.5 – 3.0 ppm",
    recommendation: "No action — skip the copper foliar and save KES 800",
    method: "DTPA extraction, atomic absorption",
    actionTarget: "none",
    actionCost: 0,
  },
  {
    id: "sp-fe",
    parameter: "Iron",
    symbol: "Fe",
    value: 45,
    unit: "ppm",
    display: "45 ppm",
    status: "Adequate",
    optimalLow: 10,
    optimalHigh: 50,
    optimalLabel: "10 – 50 ppm",
    recommendation: "No action — plenty of iron for a clay loam",
    method: "DTPA extraction, atomic absorption",
    actionTarget: "none",
    actionCost: 0,
  },
  {
    id: "sp-mn",
    parameter: "Manganese",
    symbol: "Mn",
    value: 8,
    unit: "ppm",
    display: "8 ppm",
    status: "Adequate",
    optimalLow: 2,
    optimalHigh: 20,
    optimalLabel: "2 – 20 ppm",
    recommendation: "No action — note that liming to pH 6.5 may reduce Mn slightly; keep monitoring",
    method: "DTPA extraction, atomic absorption",
    actionTarget: "none",
    actionCost: 0,
  },
  {
    id: "sp-cec",
    parameter: "Cation exchange capacity",
    symbol: "CEC",
    value: 12,
    unit: "meq/100g",
    display: "12 meq/100g",
    status: "Medium",
    optimalLow: 10,
    optimalHigh: 20,
    optimalLabel: "10 – 20 meq/100g",
    recommendation: "Moderate nutrient holding — split CAN into two applications instead of one",
    method: "Ammonium acetate saturation",
    actionTarget: "manure",
    actionCost: 0,
  },
  {
    id: "sp-texture",
    parameter: "Soil texture",
    symbol: "Texture",
    value: 0,
    unit: "",
    display: "Clay loam",
    status: "Optimal",
    optimalLow: 0,
    optimalHigh: 0,
    optimalLabel: "Loam ideal",
    recommendation: "Good water retention; watch drainage in the long rains and keep off the beds when wet",
    method: "Hydrometer / feel method cross-check",
    actionTarget: "manure",
    actionCost: 0,
  },
];

/* --------------------------------------------------- 17.3 fertilizer plan */

export interface FertilizerStep {
  id: string;
  application: string;
  timing: string;
  product: string;
  ratePerAcre: string;
  purpose: string;
  cost: number;
  applied: boolean;
  swahili: string;
}

export const FERTILIZER_PROGRAM: FertilizerStep[] = [
  {
    id: "fp-1",
    application: "Lime",
    timing: "2 – 3 weeks before planting",
    product: "Agricultural lime (CaCO₃)",
    ratePerAcre: "2,000 kg",
    purpose: "Raise pH from 5.8 to about 6.3 so P and Ca become available",
    cost: 8000,
    applied: false,
    swahili: "Chokaa cha kilimo — kiweke wiki 2 hadi 3 kabla ya kupanda",
  },
  {
    id: "fp-2",
    application: "Basal",
    timing: "At planting",
    product: "DAP 18:46:0",
    ratePerAcre: "50 kg",
    purpose: "Phosphorus for root growth and a little nitrogen for establishment",
    cost: 6500,
    applied: false,
    swahili: "DAP wakati wa kupanda — mizizi imara",
  },
  {
    id: "fp-3",
    application: "Top dress 1",
    timing: "3 weeks after transplanting",
    product: "CAN 26:0:0",
    ratePerAcre: "50 kg",
    purpose: "Nitrogen for vegetative growth and leaf size",
    cost: 5000,
    applied: false,
    swahili: "CAN ya kwanza wiki 3 baada ya kupandikiza",
  },
  {
    id: "fp-4",
    application: "Top dress 2",
    timing: "6 weeks after transplanting",
    product: "CAN 26:0:0",
    ratePerAcre: "25 kg",
    purpose: "Sustained nitrogen supply into head formation",
    cost: 2500,
    applied: false,
    swahili: "CAN ya pili wiki 6 — kichwa kikue vizuri",
  },
  {
    id: "fp-5",
    application: "Foliar 1",
    timing: "Heading stage",
    product: "Potassium foliar + Solubor",
    ratePerAcre: "1 L + 200 g",
    purpose: "Head formation and hollow-heart prevention (boron is low at 0.4 ppm)",
    cost: 1400,
    applied: false,
    swahili: "Foliar ya potasiamu na boroni wakati wa kichwa",
  },
  {
    id: "fp-6",
    application: "Foliar 2",
    timing: "2 weeks after foliar 1",
    product: "Zinc + magnesium foliar",
    ratePerAcre: "500 ml",
    purpose: "Correct the low zinc (1.8 ppm) and hold leaf colour",
    cost: 600,
    applied: false,
    swahili: "Foliar ya zinki na magnesiamu",
  },
  {
    id: "fp-7",
    application: "Manure",
    timing: "At land preparation",
    product: "Farmyard manure (well rotted)",
    ratePerAcre: "5 tonnes",
    purpose: "Organic matter, soil structure and slow-release nutrients",
    cost: 30000,
    applied: false,
    swahili: "Samadi iliyooza vizuri wakati wa kutayarisha shamba",
  },
];

export interface SkippedInput {
  id: string;
  input: string;
  reason: string;
  saved: number;
  evidence: string;
}

export const SKIPPED_INPUTS: SkippedInput[] = [
  {
    id: "skip-1",
    input: "MOP (muriate of potash)",
    reason: "Soil potassium is already high at 180 ppm (optimal 100 – 200)",
    saved: 6000,
    evidence: "KALRO ref KAL-2026-4471, ammonium acetate extraction",
  },
  {
    id: "skip-2",
    input: "TSP (extra phosphorus)",
    reason: "Soil phosphorus is adequate at 25 ppm and DAP already covers the basal need",
    saved: 6500,
    evidence: "Olsen P result, same reference",
  },
  {
    id: "skip-3",
    input: "Copper foliar",
    reason: "Copper is adequate at 1.2 ppm — no deficiency symptoms recorded in the diary",
    saved: 800,
    evidence: "DTPA extraction plus scouting notes DR-0142",
  },
];

/* ------------------------------------------------- 17.4 history + trends */

export interface SoilHistoryRow {
  id: string;
  year: string;
  date: string;
  lab: string;
  labRef: string;
  ph: number;
  organicMatter: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  calcium: number;
  zinc: number;
  boron: number;
  cec: number;
  score: number;
  cost: number;
  trend: string;
  tone: "low" | "medium" | "high";
}

export const SOIL_HISTORY: SoilHistoryRow[] = [
  {
    id: "hist-2023",
    year: "Sep 2023",
    date: "14 Sep 2023",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2023-1188",
    ph: 5.3,
    organicMatter: 2.1,
    nitrogen: 10,
    phosphorus: 18,
    potassium: 150,
    calcium: 900,
    zinc: 1.2,
    boron: 0.3,
    cec: 9,
    score: 35,
    cost: 2000,
    trend: "Very acidic, low organic matter, low N and low micronutrients",
    tone: "high",
  },
  {
    id: "hist-2024",
    year: "Sep 2024",
    date: "11 Sep 2024",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2024-2204",
    ph: 5.5,
    organicMatter: 2.8,
    nitrogen: 12,
    phosphorus: 22,
    potassium: 165,
    calcium: 1010,
    zinc: 1.5,
    boron: 0.35,
    cec: 10,
    score: 44,
    cost: 2000,
    trend: "Improving after the first lime and manure programme",
    tone: "medium",
  },
  {
    id: "hist-2025",
    year: "Sep 2025",
    date: "18 Sep 2025",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2025-3317",
    ph: 5.6,
    organicMatter: 3,
    nitrogen: 14,
    phosphorus: 24,
    potassium: 175,
    calcium: 1100,
    zinc: 1.7,
    boron: 0.38,
    cec: 11,
    score: 51,
    cost: 2000,
    trend: "Continued improvement — lime holding, manure building organic matter",
    tone: "medium",
  },
  {
    id: "hist-2026",
    year: "Sep 2026",
    date: "16 Sep 2026",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2026-4471",
    ph: 5.8,
    organicMatter: 3.2,
    nitrogen: 15,
    phosphorus: 25,
    potassium: 180,
    calcium: 1200,
    zinc: 1.8,
    boron: 0.4,
    cec: 12,
    score: 58,
    cost: 3200,
    trend: "Good trajectory — maintain the programme, target pH 6.5 in two seasons",
    tone: "low",
  },
  {
    id: "hist-plot2",
    year: "Plot 2 · Sep 2026",
    date: "16 Sep 2026",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2026-4472",
    ph: 6.2,
    organicMatter: 3.8,
    nitrogen: 21,
    phosphorus: 27,
    potassium: 195,
    calcium: 1520,
    zinc: 2.1,
    boron: 0.52,
    cec: 13,
    score: 68,
    cost: 3200,
    trend: "Best field balance on the farm — keep the rotation going",
    tone: "low",
  },
  {
    id: "hist-plot3",
    year: "Plot 3 · Sep 2026",
    date: "16 Sep 2026",
    lab: "KALRO Soil Laboratory, Kabete",
    labRef: "KAL-2026-4473",
    ph: 6.1,
    organicMatter: 3.6,
    nitrogen: 19,
    phosphorus: 28,
    potassium: 210,
    calcium: 1450,
    zinc: 2,
    boron: 0.48,
    cec: 12,
    score: 65,
    cost: 1600,
    trend: "Kale block holding well; one CAN split after each picking",
    tone: "low",
  },
  {
    id: "hist-plot4",
    year: "Plot 4 · Mar 2026",
    date: "04 Mar 2026",
    lab: "Crop Nutrition Laboratory, Nairobi",
    labRef: "CNL-2026-0912",
    ph: 5.5,
    organicMatter: 2.8,
    nitrogen: 18,
    phosphorus: 23,
    potassium: 168,
    calcium: 1080,
    zinc: 1.6,
    boron: 0.36,
    cec: 11,
    score: 52,
    cost: 4500,
    trend: "Potato block needs lime before the short-rains planting",
    tone: "medium",
  },
  {
    id: "hist-plot6",
    year: "Plot 6 · Jan 2026",
    date: "21 Jan 2026",
    lab: "County Government Soil Lab — Kiambu",
    labRef: "KMB-2026-0219",
    ph: 6.4,
    organicMatter: 4.6,
    nitrogen: 26,
    phosphorus: 31,
    potassium: 214,
    calcium: 1680,
    zinc: 2.4,
    boron: 0.58,
    cec: 14,
    score: 74,
    cost: 500,
    trend: "Compost block — proof that continuous composting lifts organic matter fast",
    tone: "low",
  },
  {
    id: "hist-plot8",
    year: "Plot 8 · Jan 2026",
    date: "11 Jan 2026",
    lab: "MEA Ltd, Nairobi",
    labRef: "MEA-2026-0338",
    ph: 5.6,
    organicMatter: 2.9,
    nitrogen: 16,
    phosphorus: 21,
    potassium: 160,
    calcium: 1000,
    zinc: 1.4,
    boron: 0.34,
    cec: 10,
    score: 47,
    cost: 1800,
    trend: "Waterlogging is limiting more than nutrients — fix drainage first",
    tone: "high",
  },
  {
    id: "hist-plot9",
    year: "Plot 9 · Feb 2026",
    date: "07 Feb 2026",
    lab: "Soil Cares Laboratory, Nairobi",
    labRef: "SC-2026-0455",
    ph: 5.9,
    organicMatter: 3.1,
    nitrogen: 17,
    phosphorus: 20,
    potassium: 172,
    calcium: 1150,
    zinc: 1.9,
    boron: 0.42,
    cec: 11,
    score: 56,
    cost: 2500,
    trend: "Avocado block stable — deep sample recommended if yellowing continues",
    tone: "medium",
  },
];

export interface ScoreComponent {
  id: string;
  label: string;
  score: number;
  max: number;
  note: string;
  nextStep: string;
}

export const SOIL_SCORE_COMPONENTS: ScoreComponent[] = [
  {
    id: "sc-ph",
    label: "pH & acidity",
    score: 12,
    max: 20,
    note: "5.8 against a 6.5 target for cabbage",
    nextStep: "Lime 2 tonnes/acre, retest after harvest",
  },
  {
    id: "sc-om",
    label: "Organic matter",
    score: 10,
    max: 20,
    note: "3.2% — up from 2.1% in 2023 but short of the 5% target",
    nextStep: "Manure 5 tonnes/acre plus compost from the yard",
  },
  {
    id: "sc-npk",
    label: "NPK balance",
    score: 14,
    max: 20,
    note: "N low, P medium, K high — the ratio matters more than the total",
    nextStep: "DAP basal plus two CAN splits, skip MOP entirely",
  },
  {
    id: "sc-micro",
    label: "Micronutrients",
    score: 10,
    max: 20,
    note: "Zinc 1.8 ppm and boron 0.4 ppm both below optimum",
    nextStep: "Zinc sulphate at land prep and boron foliar at heading",
  },
  {
    id: "sc-structure",
    label: "Texture & structure",
    score: 12,
    max: 20,
    note: "Clay loam holds water well but compacts when worked wet",
    nextStep: "Minimum tillage, mulching and a cut-off furrow on the slope",
  },
];

export interface ScoreHistoryPoint {
  id: string;
  year: string;
  score: number;
  note: string;
}

export const SOIL_SCORE_HISTORY: ScoreHistoryPoint[] = [
  { id: "sh-2023", year: "2023", score: 35, note: "Baseline: very acidic, low organic matter" },
  { id: "sh-2024", year: "2024", score: 44, note: "First lime and manure cycle landed" },
  { id: "sh-2025", year: "2025", score: 51, note: "Records and balanced fertilizer use began" },
  { id: "sh-2026", year: "2026", score: 58, note: "Micronutrients now the main gap" },
];

/* ------------------------------------------------------ 17.5 sampling */

export interface SamplingStep {
  id: string;
  step: number;
  action: string;
  details: string;
  swahili: string;
  icon: string;
}

export const SAMPLING_STEPS: SamplingStep[] = [
  {
    id: "ss-1",
    step: 1,
    action: "Gather the tools",
    details:
      "Clean hand trowel or soil auger, clean plastic bucket (never metal), plastic bags, marker pen and a notebook.",
    swahili: "Andaa vyombo: koleo safi, ndoo ya plastiki (sio chuma), mifuko ya plastiki na kalamu.",
    icon: "tools",
  },
  {
    id: "ss-2",
    step: 2,
    action: "Divide the plot into zones",
    details:
      "Uniform plot = one zone. If the slope, colour or crop history changes, split into 2 – 4 zones and sample each separately.",
    swahili: "Gawanya shamba kwa kanda. Kama mteremko au rangi ya udongo inabadilika, tumia kanda 2 – 4.",
    icon: "map",
  },
  {
    id: "ss-3",
    step: 3,
    action: "Walk in a W or Z pattern",
    details: "Cross the whole zone so every corner is represented — never sample only at the gate.",
    swahili: "Tembea kwa mtindo wa W au Z kwenye kanda yote.",
    icon: "route",
  },
  {
    id: "ss-4",
    step: 4,
    action: "Take 15 – 20 sub-samples",
    details: "At 0 – 20 cm depth (topsoil). One trowel-full per stop, emptied into the bucket.",
    swahili: "Chukua sampuli ndogo 15 – 20 kwa kina cha sentimita 0 – 20.",
    icon: "layers",
  },
  {
    id: "ss-5",
    step: 5,
    action: "Mix in the plastic bucket",
    details: "Break the clods, remove stones, roots and debris, then mix thoroughly until the colour is even.",
    swahili: "Changanya vizuri kwenye ndoo, toa mawe na mizizi.",
    icon: "bucket",
  },
  {
    id: "ss-6",
    step: 6,
    action: "Fill the sample bag",
    details: "Take about 500 g from the mixed sample — roughly two handfuls — into a clean labelled bag.",
    swahili: "Weka gramu 500 kwenye mfuko safi ulioandikwa.",
    icon: "bag",
  },
  {
    id: "ss-7",
    step: 7,
    action: "Label clearly",
    details:
      "Plot name, sampling date, depth, crop to be grown, farmer name and phone. Write on the outside and put a paper slip inside.",
    swahili: "Andika jina la shamba, tarehe, kina, zao na namba ya simu.",
    icon: "tag",
  },
  {
    id: "ss-8",
    step: 8,
    action: "Keep it cool",
    details: "Do not leave the bag in the hot sun or inside a parked vehicle. Deliver to the lab within 48 hours.",
    swahili: "Usiache mfuko kwenye jua au gari. Peleka maabara ndani ya saa 48.",
    icon: "sun",
  },
  {
    id: "ss-9",
    step: 9,
    action: "Avoid contamination",
    details:
      "No bare hands, no rusty tools, and stay away from manure heaps, fence posts, anthills and under trees.",
    swahili: "Usigusa udongo kwa mikono mitupu; epuka karibu na rundo la samadi au miti.",
    icon: "shield",
  },
];

export const SAMPLING_KIT = [
  { id: "kit-1", item: "Soil auger or hand trowel", supplied: true, note: "Borrow from the group store, KES 200 deposit" },
  { id: "kit-2", item: "Plastic bucket (10 L)", supplied: true, note: "Never use a metal bucket — it contaminates micronutrient tests" },
  { id: "kit-3", item: "Sample bags (5)", supplied: true, note: "Supplied by the lab on request" },
  { id: "kit-4", item: "Marker pen and paper labels", supplied: false, note: "Buy locally — KES 120 for both" },
  { id: "kit-5", item: "Cool box for transport", supplied: false, note: "Not required if delivered the same day" },
  { id: "kit-6", item: "GPS pin of each sampling point", supplied: true, note: "GrowMO saves coordinates while you walk the W pattern" },
];

/* ------------------------------------------------- 17.7 improvement plan */

export interface SoilPractice {
  id: string;
  practice: string;
  frequency: string;
  impact: string;
  cost: number;
  costLabel: string;
  priority: "High" | "Medium" | "Good practice";
  acres: string;
  firstAction: string;
  started: boolean;
  progress: number;
  howTo: string;
}

export const SOIL_PRACTICES: SoilPractice[] = [
  {
    id: "prac-1",
    practice: "Apply agricultural lime",
    frequency: "Every 2 – 3 years",
    impact: "Raises pH, adds calcium, unlocks phosphorus already in the soil",
    cost: 8000,
    costLabel: "KES 8,000 per acre",
    priority: "High",
    acres: "2 acres",
    firstAction: "Spread 2 tonnes/acre and work it in 2 – 3 weeks before planting",
    started: true,
    progress: 40,
    howTo:
      "Broadcast on the dry surface, then incorporate with the first ploughing. Never mix lime and DAP in the same planting furrow on the same day.",
  },
  {
    id: "prac-2",
    practice: "Apply farmyard manure",
    frequency: "Every season",
    impact: "Increases organic matter, improves structure, feeds biology, holds moisture",
    cost: 30000,
    costLabel: "KES 30,000 per acre",
    priority: "High",
    acres: "2 acres",
    firstAction: "5 tonnes/acre well rotted, spread at land preparation and incorporated",
    started: true,
    progress: 65,
    howTo:
      "Only use manure that has rotted for at least 8 weeks — fresh manure burns seedlings and carries weed seed.",
  },
  {
    id: "prac-3",
    practice: "Crop rotation (cereal → legume)",
    frequency: "Every season",
    impact: "Fixes nitrogen, breaks pest and disease cycles, spreads rooting depth",
    cost: 0,
    costLabel: "Free",
    priority: "High",
    acres: "All plots",
    firstAction: "Follow cabbage with Rosecoco beans on Plot 1 from January",
    started: true,
    progress: 55,
    howTo:
      "Never plant the same family twice in a row. Keep a legume in every rotation so nitrogen is fixed rather than bought.",
  },
  {
    id: "prac-4",
    practice: "Cover cropping (lablab, mucuna)",
    frequency: "Off-season",
    impact: "Prevents erosion, adds organic matter, fixes nitrogen between crops",
    cost: 2000,
    costLabel: "KES 2,000 per acre",
    priority: "Medium",
    acres: "1 acre",
    firstAction: "Sow lablab on Plot 4 after the potato harvest and slash before flowering",
    started: false,
    progress: 0,
    howTo: "Sow immediately after harvest while there is still moisture; incorporate at 50% flowering for maximum nitrogen.",
  },
  {
    id: "prac-5",
    practice: "Minimum tillage / conservation agriculture",
    frequency: "Every season",
    impact: "Reduces erosion, preserves organic matter, saves fuel and labour",
    cost: 0,
    costLabel: "Saves KES 2,000 per acre",
    priority: "Medium",
    acres: "2 acres",
    firstAction: "Rip planting lines instead of full ploughing on Plot 1 and 3",
    started: false,
    progress: 10,
    howTo: "Disturb only the planting line. Keep the residue on the surface and control weeds early while the crop is small.",
  },
  {
    id: "prac-6",
    practice: "Compost making",
    frequency: "Ongoing",
    impact: "Free organic matter source, recycles crop waste and manure",
    cost: 0,
    costLabel: "Labour only",
    priority: "Medium",
    acres: "Compost yard",
    firstAction: "Build two 1.5 m heaps alternating green and brown material, turn every 2 weeks",
    started: true,
    progress: 70,
    howTo: "Layer 3 parts dry material to 1 part green, keep it as damp as a wrung cloth, and turn it every fortnight for 8 weeks.",
  },
  {
    id: "prac-7",
    practice: "Mulching",
    frequency: "Every season",
    impact: "Moisture retention, weed suppression, adds organic matter as it breaks down",
    cost: 1500,
    costLabel: "KES 1,500 per acre",
    priority: "Medium",
    acres: "1.5 acres",
    firstAction: "Mulch the tomato and kale blocks with dry grass after the first weeding",
    started: true,
    progress: 45,
    howTo: "Apply a 5 cm layer, keeping it 10 cm away from the stem to avoid collar rot and termite damage.",
  },
  {
    id: "prac-8",
    practice: "Green manuring (incorporate residue)",
    frequency: "Every season",
    impact: "Returns nutrients to the soil instead of losing them off the field",
    cost: 0,
    costLabel: "Free",
    priority: "Good practice",
    acres: "All plots",
    firstAction: "Chop cabbage and kale stubble into the bed after harvest",
    started: true,
    progress: 60,
    howTo: "Chop residue into 10 cm pieces and incorporate while still green; add a little CAN to speed decomposition.",
  },
  {
    id: "prac-9",
    practice: "Avoid burning crop residue",
    frequency: "Every season",
    impact: "Preserves organic matter and soil life; burning destroys both",
    cost: 0,
    costLabel: "Free",
    priority: "Good practice",
    acres: "All plots",
    firstAction: "Compost or incorporate every residue — no fires on the farm",
    started: true,
    progress: 90,
    howTo: "If residue carries disease, compost it in a hot heap or feed it to livestock rather than burning it in the field.",
  },
  {
    id: "prac-10",
    practice: "Balanced fertilizer use from the soil test",
    frequency: "Every season",
    impact: "Prevents nutrient mining and stops money being spent on nutrients already present",
    cost: 0,
    costLabel: "Per soil test",
    priority: "High",
    acres: "All plots",
    firstAction: "Follow the 17.3 programme: skip MOP, skip TSP, add zinc and boron",
    started: true,
    progress: 35,
    howTo: "Buy only what the test says is short. Split nitrogen applications so they match crop demand instead of feeding the weeds.",
  },
];

/* --------------------------------------------------- 17.8 soil moisture */

export interface MoistureWeek {
  id: string;
  week: string;
  rainfall: number;
  et: number;
  irrigation: number;
  net: number;
  status: "Low" | "Decreasing" | "Recharged" | "Good" | "Excess";
  action: string;
  irrigationCost: number;
  logged: boolean;
}

export const MOISTURE_WEEKS: MoistureWeek[] = [
  {
    id: "mw-1",
    week: "13 – 19 Sep 2026",
    rainfall: 32,
    et: 25,
    irrigation: 0,
    net: 7,
    status: "Good",
    action: "No irrigation needed — check the furrow level after the weekend rain",
    irrigationCost: 0,
    logged: true,
  },
  {
    id: "mw-2",
    week: "20 – 26 Sep 2026",
    rainfall: 18,
    et: 24,
    irrigation: 0,
    net: -6,
    status: "Decreasing",
    action: "Light irrigation if possible — 6 mm over the cabbage block",
    irrigationCost: 450,
    logged: false,
  },
  {
    id: "mw-3",
    week: "27 Sep – 3 Oct 2026",
    rainfall: 12,
    et: 22,
    irrigation: 0,
    net: -10,
    status: "Low",
    action: "Irrigate 10 mm within three days of dry weather",
    irrigationCost: 720,
    logged: false,
  },
  {
    id: "mw-4",
    week: "4 – 10 Oct 2026",
    rainfall: 25,
    et: 23,
    irrigation: 10,
    net: 12,
    status: "Recharged",
    action: "No irrigation needed — hold water in the furrow longer",
    irrigationCost: 720,
    logged: false,
  },
  {
    id: "mw-5",
    week: "11 – 17 Oct 2026",
    rainfall: 30,
    et: 24,
    irrigation: 0,
    net: 6,
    status: "Good",
    action: "No irrigation needed — watch for waterlogging on Plot 8",
    irrigationCost: 0,
    logged: false,
  },
  {
    id: "mw-6",
    week: "18 – 24 Oct 2026",
    rainfall: 8,
    et: 26,
    irrigation: 14,
    net: -4,
    status: "Decreasing",
    action: "Irrigate 14 mm at heading — the critical stage for head size",
    irrigationCost: 980,
    logged: false,
  },
  {
    id: "mw-7",
    week: "25 – 31 Oct 2026",
    rainfall: 44,
    et: 21,
    irrigation: 0,
    net: 23,
    status: "Excess",
    action: "Open the cut-off furrow and hold off spraying — the plot is saturated",
    irrigationCost: 0,
    logged: false,
  },
  {
    id: "mw-8",
    week: "1 – 7 Nov 2026",
    rainfall: 20,
    et: 23,
    irrigation: 0,
    net: -3,
    status: "Good",
    action: "No action — balance recovered after the wet week",
    irrigationCost: 0,
    logged: false,
  },
  {
    id: "mw-9",
    week: "8 – 14 Nov 2026",
    rainfall: 10,
    et: 25,
    irrigation: 15,
    net: 0,
    status: "Good",
    action: "Irrigation brought the profile back to field capacity",
    irrigationCost: 1100,
    logged: false,
  },
  {
    id: "mw-10",
    week: "15 – 21 Nov 2026",
    rainfall: 6,
    et: 27,
    irrigation: 20,
    net: -1,
    status: "Decreasing",
    action: "Irrigate 20 mm before harvest week so heads stay firm",
    irrigationCost: 1450,
    logged: false,
  },
];

export interface MoistureMethod {
  id: string;
  method: string;
  source: string;
  frequency: string;
  display: string;
  cost: number;
  accuracy: string;
  bestFor: string;
  active: boolean;
}

export const MOISTURE_METHODS: MoistureMethod[] = [
  {
    id: "mm-1",
    method: "Rainfall + ET calculation",
    source: "Kenya Met + GrowMO weather",
    frequency: "Daily",
    display: "Soil moisture balance chart",
    cost: 0,
    accuracy: "Field average, ±15%",
    bestFor: "Every plot — the default method with no equipment",
    active: true,
  },
  {
    id: "mm-2",
    method: "Manual feel method",
    source: "Farmer input (you)",
    frequency: "Weekly",
    display: "Dry / moist / wet scale per plot",
    cost: 0,
    accuracy: "±25%, improves with practice",
    bestFor: "Quick checks before irrigation decisions",
    active: true,
  },
  {
    id: "mm-3",
    method: "Soil sensor (IoT)",
    source: "Connected moisture probe",
    frequency: "Hourly",
    display: "Real-time % moisture and temperature",
    cost: 12500,
    accuracy: "±5% after calibration",
    bestFor: "Greenhouse, nursery and high-value blocks",
    active: false,
  },
  {
    id: "mm-4",
    method: "Satellite (NASA SMAP)",
    source: "Remote sensing",
    frequency: "Every 3 days",
    display: "County-level moisture map",
    cost: 0,
    accuracy: "9 km pixel — county scale only",
    bestFor: "Regional context and rainfall outlook confirmation",
    active: true,
  },
];

export interface SoilSensor {
  id: string;
  device: string;
  plot: string;
  depth: string;
  installed: string;
  battery: number;
  lastReading: string;
  moisture: number;
  status: "Online" | "Offline" | "Not installed";
  simCost: number;
}

export const SOIL_SENSORS: SoilSensor[] = [
  {
    id: "sen-1",
    device: "GROWMO-SM-100 probe",
    plot: "Plot 2 (tomato)",
    depth: "20 cm",
    installed: "12 Jun 2026",
    battery: 78,
    lastReading: "20 Sep 2026, 09:00",
    moisture: 34,
    status: "Online",
    simCost: 60,
  },
  {
    id: "sen-2",
    device: "GROWMO-SM-100 probe",
    plot: "Plot 7 (nursery)",
    depth: "10 cm",
    installed: "12 Jun 2026",
    battery: 64,
    lastReading: "20 Sep 2026, 09:00",
    moisture: 41,
    status: "Online",
    simCost: 60,
  },
  {
    id: "sen-3",
    device: "Watermark granular sensor",
    plot: "Plot 1 (cabbage)",
    depth: "20 cm",
    installed: "—",
    battery: 0,
    lastReading: "Not reading",
    moisture: 0,
    status: "Not installed",
    simCost: 60,
  },
  {
    id: "sen-4",
    device: "GROWMO-SM-100 probe",
    plot: "Plot 3 (kale)",
    depth: "20 cm",
    installed: "02 Aug 2026",
    battery: 12,
    lastReading: "20 Sep 2026, 06:00",
    moisture: 29,
    status: "Offline",
    simCost: 60,
  },
  {
    id: "sen-5",
    device: "Rain gauge (tipping bucket)",
    plot: "Farm centre",
    depth: "—",
    installed: "20 Jan 2026",
    battery: 91,
    lastReading: "20 Sep 2026, 08:40",
    moisture: 0,
    status: "Online",
    simCost: 0,
  },
  {
    id: "sen-6",
    device: "GROWMO-SM-100 probe",
    plot: "Plot 8 (beans)",
    depth: "20 cm",
    installed: "—",
    battery: 0,
    lastReading: "Not reading",
    moisture: 0,
    status: "Not installed",
    simCost: 60,
  },
];

export const FEEL_METHOD_SCALE = [
  { id: "feel-1", label: "Dry", detail: "Crumbles, will not form a ball — irrigate now", moisture: "Below 25%" },
  { id: "feel-2", label: "Slightly moist", detail: "Holds together but breaks easily — monitor", moisture: "25 – 40%" },
  { id: "feel-3", label: "Moist", detail: "Forms a ball, leaves a faint mark on the palm — ideal", moisture: "40 – 60%" },
  { id: "feel-4", label: "Wet", detail: "Water squeezes out when squeezed — hold irrigation", moisture: "Above 60%" },
];

/* ------------------------------------------------- compost + lime helper */

export interface CompostBatch {
  id: string;
  batch: string;
  started: string;
  ready: string;
  material: string;
  volume: string;
  stage: string;
  temperature: string;
  turned: string;
  quality: string;
  appliedTo: string;
}

export const COMPOST_BATCHES: CompostBatch[] = [
  {
    id: "cb-1",
    batch: "CB-2026-011",
    started: "18 Aug 2026",
    ready: "13 Oct 2026",
    material: "Cabbage residue, manure, ash",
    volume: "1.8 tonnes",
    stage: "Curing",
    temperature: "38 °C",
    turned: "12 days ago",
    quality: "Good — dark, crumbly, no smell",
    appliedTo: "Not applied yet",
  },
  {
    id: "cb-2",
    batch: "CB-2026-010",
    started: "02 Aug 2026",
    ready: "27 Sep 2026",
    material: "Manure, dry grass, kitchen waste",
    volume: "1.4 tonnes",
    stage: "Turning",
    temperature: "52 °C",
    turned: "3 days ago",
    quality: "Active — hot core",
    appliedTo: "Plot 6 kitchen garden",
  },
  {
    id: "cb-3",
    batch: "CB-2026-009",
    started: "16 Jul 2026",
    ready: "10 Sep 2026",
    material: "Maize stover, manure",
    volume: "2.1 tonnes",
    stage: "Ready",
    temperature: "29 °C",
    turned: "21 days ago",
    quality: "Ready — screened",
    appliedTo: "Plot 3 kale block",
  },
  {
    id: "cb-4",
    batch: "CB-2026-008",
    started: "28 Jun 2026",
    ready: "23 Aug 2026",
    material: "Kale residue, ash, manure",
    volume: "1.6 tonnes",
    stage: "Applied",
    temperature: "—",
    turned: "—",
    quality: "Applied",
    appliedTo: "Plot 1 cabbage bed",
  },
  {
    id: "cb-5",
    batch: "CB-2026-007",
    started: "10 Jun 2026",
    ready: "05 Aug 2026",
    material: "Tomato vines, manure, molasses",
    volume: "1.2 tonnes",
    stage: "Applied",
    temperature: "—",
    turned: "—",
    quality: "Applied",
    appliedTo: "Plot 2 tomato beds",
  },
  {
    id: "cb-6",
    batch: "CB-2026-006",
    started: "22 May 2026",
    ready: "17 Jul 2026",
    material: "Dry grass, manure, wood ash",
    volume: "0.9 tonnes",
    stage: "Applied",
    temperature: "—",
    turned: "—",
    quality: "Applied",
    appliedTo: "Nursery seed-bed mix",
  },
  {
    id: "cb-7",
    batch: "CB-2026-005",
    started: "30 Apr 2026",
    ready: "25 Jun 2026",
    material: "Bean haulm, manure",
    volume: "1.1 tonnes",
    stage: "Applied",
    temperature: "—",
    turned: "—",
    quality: "Applied",
    appliedTo: "Plot 8 bean block",
  },
  {
    id: "cb-8",
    batch: "CB-2026-004",
    started: "12 Apr 2026",
    ready: "07 Jun 2026",
    material: "Potato vines, manure",
    volume: "1.3 tonnes",
    stage: "Applied",
    temperature: "—",
    turned: "—",
    quality: "Applied",
    appliedTo: "Plot 4 potato block",
  },
  {
    id: "cb-9",
    batch: "CB-2026-003",
    started: "20 Mar 2026",
    ready: "15 May 2026",
    material: "Kitchen waste, manure, ash",
    volume: "0.7 tonnes",
    stage: "Applied",
    temperature: "—",
    turned: "—",
    quality: "Applied",
    appliedTo: "Plot 6 kitchen garden",
  },
  {
    id: "cb-10",
    batch: "CB-2026-002",
    started: "05 Mar 2026",
    ready: "30 Apr 2026",
    material: "Crop residue mix",
    volume: "1.0 tonnes",
    stage: "Applied",
    temperature: "—",
    turned: "—",
    quality: "Applied",
    appliedTo: "Plot 9 avocado basin",
  },
];

export interface LimeRateRow {
  id: string;
  texture: string;
  currentPh: string;
  targetPh: string;
  ratePerAcre: string
  cost: number;
  note: string;
}

export const LIME_RATE_TABLE: LimeRateRow[] = [
  { id: "lr-1", texture: "Sand / sandy loam", currentPh: "5.0 – 5.5", targetPh: "6.3", ratePerAcre: "1,000 kg", cost: 4000, note: "Light soil — apply and retest after one season" },
  { id: "lr-2", texture: "Sandy loam", currentPh: "5.5 – 6.0", targetPh: "6.3", ratePerAcre: "800 kg", cost: 3200, note: "Split into two applications if the budget is tight" },
  { id: "lr-3", texture: "Loam", currentPh: "5.0 – 5.5", targetPh: "6.3", ratePerAcre: "1,500 kg", cost: 6000, note: "Standard rate for most Kiambu plots" },
  { id: "lr-4", texture: "Clay loam", currentPh: "5.5 – 6.0", targetPh: "6.3", ratePerAcre: "2,000 kg", cost: 8000, note: "Plot 1 rate — heavier soil needs more lime" },
  { id: "lr-5", texture: "Clay loam", currentPh: "5.0 – 5.5", targetPh: "6.3", ratePerAcre: "2,500 kg", cost: 10000, note: "Spread over two seasons, do not exceed 2.5 t at once" },
  { id: "lr-6", texture: "Clay", currentPh: "5.5 – 6.0", targetPh: "6.3", ratePerAcre: "2,200 kg", cost: 8800, note: "Work in early and keep off the field when wet" },
  { id: "lr-7", texture: "Clay", currentPh: "5.0 – 5.5", targetPh: "6.3", ratePerAcre: "2,800 kg", cost: 11200, note: "Consider gypsum first if drainage is the real problem" },
  { id: "lr-8", texture: "Silt loam", currentPh: "5.5 – 6.0", targetPh: "6.3", ratePerAcre: "1,600 kg", cost: 6400, note: "Watch for crusting after rain" },
  { id: "lr-9", texture: "Any texture", currentPh: "Above 6.5", targetPh: "—", ratePerAcre: "0 kg", cost: 0, note: "Above pH 6.5 lime will not help; correct other limits instead" },
  { id: "lr-10", texture: "Volcanic / Andosol", currentPh: "5.5 – 6.0", targetPh: "6.3", ratePerAcre: "1,800 kg", cost: 7200, note: "High lime requirement even at moderate acidity" },
];

/* --------------------------------------------------------- 17.9 products */

export interface SoilProduct {
  id: string;
  product: string;
  category: string;
  supplier: string;
  packSize: string;
  price: number;
  ratePerAcre: string;
  nutrient: string;
  howToApply: string;
  stock: "In store" | "Order in" | "Not stocked";
}

export const SOIL_PRODUCTS: SoilProduct[] = [
  { id: "prod-1", product: "Agricultural lime (CaCO₃)", category: "Lime", supplier: "Nakuru Lime Works", packSize: "50 kg bag", price: 290, ratePerAcre: "2,000 kg", nutrient: "Ca 32%, neutralising value 95%", howToApply: "Broadcast and incorporate 2 – 3 weeks before planting", stock: "Order in" },
  { id: "prod-2", product: "Dolomitic lime", category: "Lime", supplier: "Nakuru Lime Works", packSize: "50 kg bag", price: 340, ratePerAcre: "1,800 kg", nutrient: "Ca 22%, Mg 11%", howToApply: "Use where magnesium is also low; not needed on Plot 1", stock: "Order in" },
  { id: "prod-3", product: "DAP 18:46:0", category: "Basal fertilizer", supplier: "Githunguri Farmers Co-op", packSize: "50 kg bag", price: 6500, ratePerAcre: "50 kg", nutrient: "N 18%, P₂O₅ 46%", howToApply: "Place in the planting furrow and cover before transplanting", stock: "In store" },
  { id: "prod-4", product: "CAN 26:0:0", category: "Top dress", supplier: "Githunguri Farmers Co-op", packSize: "50 kg bag", price: 5000, ratePerAcre: "50 kg then 25 kg", nutrient: "N 26%", howToApply: "Broadcast 10 cm from the stem, then water if the soil is dry", stock: "In store" },
  { id: "prod-5", product: "Sulphate of ammonia 21:0:0", category: "Top dress", supplier: "Kenya Seed Depot, Thika", packSize: "50 kg bag", price: 4200, ratePerAcre: "40 kg", nutrient: "N 21%, S 24%", howToApply: "Use where sulphur is low (12 ppm) — acidifying, do not overuse", stock: "In store" },
  { id: "prod-6", product: "Gypsum (calcium sulphate)", category: "Soil amendment", supplier: "Jogoo Agro Supplies, Nairobi", packSize: "50 kg bag", price: 780, ratePerAcre: "50 kg", nutrient: "Ca 23%, S 18%", howToApply: "Broadcast at land prep; also improves sodic clay structure", stock: "Order in" },
  { id: "prod-7", product: "Zinc sulphate 21%", category: "Micronutrient", supplier: "Real IPM Kenya, Thika", packSize: "1 kg", price: 520, ratePerAcre: "10 kg", nutrient: "Zn 21%, S 11%", howToApply: "Mix with the basal fertilizer or broadcast and incorporate", stock: "In store" },
  { id: "prod-8", product: "Zincrex foliar", category: "Micronutrient", supplier: "Osho Chemical Industries", packSize: "500 ml", price: 950, ratePerAcre: "500 ml", nutrient: "Chelated Zn 6%", howToApply: "Spray at 4-leaf and repeat 14 days later if deficiency persists", stock: "In store" },
  { id: "prod-9", product: "Solubor (boron 20.5%)", category: "Micronutrient", supplier: "Elgon Kenya Ltd", packSize: "1 kg", price: 700, ratePerAcre: "200 g foliar / 2 kg soil", nutrient: "B 20.5%", howToApply: "Soil at land prep or foliar at heading; never exceed the rate — boron burns", stock: "In store" },
  { id: "prod-10", product: "Farmyard manure (well rotted)", category: "Organic", supplier: "Githunguri dairy farms", packSize: "1 tonne (pick-up load)", price: 6000, ratePerAcre: "5 tonnes", nutrient: "N 0.6%, P 0.3%, K 0.5%, OM 25%", howToApply: "Spread at land preparation and incorporate within 3 days", stock: "Order in" },
  { id: "prod-11", product: "Compost (own yard, screened)", category: "Organic", supplier: "Mary's Farm compost yard", packSize: "1 tonne", price: 0, ratePerAcre: "2 tonnes", nutrient: "OM 35%, N 1.1%", howToApply: "Apply in the planting hole or broadcast on the bed surface", stock: "In store" },
  { id: "prod-12", product: "MOP 0:0:60 (muriate of potash)", category: "Potash fertilizer", supplier: "Githunguri Farmers Co-op", packSize: "50 kg bag", price: 6000, ratePerAcre: "Not recommended", nutrient: "K₂O 60%", howToApply: "Skipped this season — soil K is already high at 180 ppm", stock: "In store" },
];

/* -------------------------------------------------- alerts, activity, faq */

export interface SoilAlert {
  id: string;
  tone: "high" | "medium" | "low";
  title: string;
  body: string;
  action: string;
  actionTarget: string;
}

export const SOIL_ALERTS: SoilAlert[] = [
  {
    id: "sa-1",
    tone: "high",
    title: "Nitrogen is low on Plot 1",
    body: "15 ppm against the 20 – 40 ppm target. DAP basal plus two CAN splits are already in the programme.",
    action: "Open the fertilizer plan",
    actionTarget: "fert-program",
  },
  {
    id: "sa-2",
    tone: "high",
    title: "pH 5.8 — lime window closes 28 Sep",
    body: "Lime needs 2 – 3 weeks before transplanting to react. Book the spread and the group order together.",
    action: "Book lime & spread",
    actionTarget: "lime",
  },
  {
    id: "sa-3",
    tone: "medium",
    title: "Plot 5 has never been tested",
    body: "New lease with two seasons of continuous maize. Test before spending on fertilizer for the short rains.",
    action: "Schedule a test",
    actionTarget: "scheduler",
  },
  {
    id: "sa-4",
    tone: "medium",
    title: "Zinc and boron still below optimum",
    body: "Zinc 1.8 ppm (target 2 – 5) and boron 0.4 ppm (target 0.5 – 1.0). Both foliar corrections are cheap.",
    action: "Add to the programme",
    actionTarget: "fert-program",
  },
  {
    id: "sa-5",
    tone: "medium",
    title: "Moisture deficit forecast for 27 Sep – 3 Oct",
    body: "Net -10 mm on Plot 1. Ten millimetres of irrigation is cheaper than a stressed crop at heading.",
    action: "Plan irrigation",
    actionTarget: "moisture",
  },
  {
    id: "sa-6",
    tone: "low",
    title: "Sensor battery low on Plot 3",
    body: "Battery at 12% and no reading since 06:00. Charge or replace before the sensor drops off completely.",
    action: "Manage sensors",
    actionTarget: "moisture",
  },
];

export interface SoilActivityRow {
  id: string;
  date: string;
  type: string;
  detail: string;
  who: string;
  cost: number;
}

export const SOIL_ACTIVITY: SoilActivityRow[] = [
  { id: "act-1", date: "16 Sep 2026", type: "Lab test", detail: "Comprehensive test submitted for Plot 1, 2 and 3 to KALRO Kabete", who: "Mary Wanjiku", cost: 3200 },
  { id: "act-2", date: "16 Sep 2026", type: "Sampling", detail: "18 sub-samples taken in a W pattern at 0 – 20 cm using the group auger", who: "Mary Wanjiku", cost: 0 },
  { id: "act-3", date: "14 Sep 2026", type: "Payment", detail: "Lab fees paid by M-Pesa to KALRO, receipt QK8064PL3", who: "GrowMO wallet", cost: 3200 },
  { id: "act-4", date: "12 Sep 2026", type: "Advisory", detail: "Agronomist session on the lime programme and basal placement", who: "Peter Otieno", cost: 0 },
  { id: "act-5", date: "05 Sep 2026", type: "Compost", detail: "Batch CB-2026-011 built, 1.8 tonnes, turned after 14 days", who: "Field team", cost: 0 },
  { id: "act-6", date: "28 Aug 2026", type: "Manure", detail: "5 tonnes of manure delivered and stored under cover", who: "Githunguri dairy farms", cost: 30000 },
  { id: "act-7", date: "20 Aug 2026", type: "Sensor", detail: "Plot 3 sensor installed at 20 cm and calibrated", who: "Field team", cost: 12500 },
  { id: "act-8", date: "02 Aug 2026", type: "Practice", detail: "Mulching completed on the tomato and kale blocks", who: "Field team", cost: 2250 },
  { id: "act-9", date: "18 Jul 2026", type: "Training", detail: "Group training on soil sampling and the feel method, 24 members", who: "County extension", cost: 0 },
  { id: "act-10", date: "30 Jun 2026", type: "Lab test", detail: "Compost yard sample tested for pH and organic matter", who: "UoN Land Resource Lab", cost: 3500 },
];

/* ----------------------------------------------------------- 17.10 orders */

export interface SoilOrder {
  id: string;
  date: string;
  item: string;
  plot: string;
  amount: number;
  method: string;
  status: "Paid" | "Pending" | "Refunded" | "In progress";
  receipt: string;
  note: string;
}

export const SOIL_ORDERS: SoilOrder[] = [
  { id: "so-1", date: "16 Sep 2026", item: "Comprehensive soil test · Plot 1 & 2", plot: "Plot 1, Plot 2", amount: 3200, method: "M-Pesa (GrowMO wallet)", status: "Paid", receipt: "QK8064PL3", note: "Results delivered 16 Sep 2026" },
  { id: "so-2", date: "16 Sep 2026", item: "Basic soil test · Plot 3", plot: "Plot 3", amount: 1600, method: "M-Pesa (GrowMO wallet)", status: "Paid", receipt: "QK8067PL8", note: "Results delivered 16 Sep 2026" },
  { id: "so-3", date: "12 Sep 2026", item: "Agricultural lime 2 tonnes", plot: "Plot 1", amount: 11600, method: "Group buying (Co-op)", status: "Pending", receipt: "—", note: "Group order closes 30 Sep 2026" },
  { id: "so-4", date: "28 Aug 2026", item: "Farmyard manure 5 tonnes", plot: "Plot 1 & 2", amount: 30000, method: "M-Pesa (GrowMO wallet)", status: "Paid", receipt: "QK7421PL9", note: "Delivered and covered 28 Aug 2026" },
  { id: "so-5", date: "20 Aug 2026", item: "Soil moisture sensor + SIM (1 year)", plot: "Plot 3", amount: 12500, method: "M-Pesa (GrowMO wallet)", status: "Paid", receipt: "QK6988PL2", note: "Installed and calibrated 20 Aug 2026" },
  { id: "so-6", date: "30 Jun 2026", item: "Comprehensive soil test · compost yard", plot: "Plot 10", amount: 3500, method: "Cash (lab counter)", status: "Paid", receipt: "UON-CASH-3391", note: "UoN Land Resource Lab" },
  { id: "so-7", date: "04 Mar 2026", item: "Comprehensive soil test · Plot 4", plot: "Plot 4", amount: 4500, method: "M-Pesa (Crop Nutrition Lab)", status: "Paid", receipt: "QK2118PL5", note: "Results 09 Mar 2026" },
  { id: "so-8", date: "07 Feb 2026", item: "Basic soil test · Plot 9", plot: "Plot 9", amount: 2500, method: "M-Pesa (Soil Cares)", status: "Paid", receipt: "QK1044PL6", note: "Scanner visit, results within 48 hours" },
  { id: "so-9", date: "21 Jan 2026", item: "Basic soil test · Plot 6", plot: "Plot 6", amount: 500, method: "County lab (subsidy)", status: "Paid", receipt: "KMB-2026-0219", note: "Free for registered farmer groups" },
  { id: "so-10", date: "11 Jan 2026", item: "Basic soil test · Plot 8", plot: "Plot 8", amount: 1800, method: "M-Pesa (MEA Ltd)", status: "Paid", receipt: "QK0792PL4", note: "Results 16 Jan 2026" },
];

/* --------------------------------------------------- settings + FAQ + misc */

export const SOIL_SETTINGS = {
  testReminder: true,
  reminderLeadDays: "60",
  moistureAlerts: true,
  moistureThreshold: "35",
  lowNutrientAlerts: true,
  labResultsNotify: true,
  shareWithAgronomist: true,
  shareWithBuyer: false,
  defaultLab: "KALRO Soil Laboratory, Kabete",
  defaultTestType: "Comprehensive",
  units: "Metric (ppm, meq/100g)",
  language: "English (Kiswahili guide available)",
  digestDay: "Sunday",
};

export const SOIL_FAQ = [
  {
    q: "How often should I test my soil?",
    a: "Once a year for plots under a correction programme, and every two to three years for stable plots. Always test before planting a new crop family or after a season with unusual problems.",
  },
  {
    q: "Can I use one sample for the whole farm?",
    a: "No. If the slope, colour, history or drainage differs, split the farm into zones of not more than 5 acres and sample each zone separately. On this farm, Plot 1, Plot 4 and Plot 8 all behave differently.",
  },
  {
    q: "Is the cheapest lab good enough?",
    a: "For pH, N, P, K and organic matter the cheaper labs are fine. For certification, micronutrients or an export buyer dispute, use a KENAS-accredited lab such as KALRO or SGS.",
  },
  {
    q: "Why does the recommendation skip some fertilizers?",
    a: "Because the test says the nutrient is already there. Skipping MOP and TSP this season saves KES 12,500 and changes nothing in the crop. Fertilizer is only useful for the nutrient that is actually short.",
  },
  {
    q: "How do I know my sample was not contaminated?",
    a: "Use a plastic bucket, a clean trowel and bare-hand-free handling, stay away from manure heaps and fence posts, and deliver to the lab within 48 hours in a cool bag.",
  },
  {
    q: "What is a good soil health score?",
    a: "Above 70 out of 100 means the soil is working for you rather than against you. This farm moved from 35 in 2023 to 58 in 2026 and is projected to reach 70 next season if the plan is followed.",
  },
  {
    q: "Can lime be applied with fertilizer?",
    a: "Not in the same furrow on the same day. Lime and phosphorus fertilizer react with each other and the phosphorus gets locked up. Space them 2 – 3 weeks apart.",
  },
  {
    q: "Do soil sensors replace lab tests?",
    a: "No. Sensors tell you moisture and temperature hour by hour; only a lab can tell you nutrient levels. Sensors decide when to irrigate, labs decide what to buy.",
  },
  {
    q: "Is soil data shared with anyone?",
    a: "Only with the people you choose. By default your agronomist can see it for advice; export buyers and auditors see it only through the time-limited links you create.",
  },
  {
    q: "How do I use the test to plan my budget?",
    a: "Start at section 17.3. The programme total is KES 54,000 per acre including manure, and skipping what the soil already has saves KES 12,500 — a net plan you can compare against the finance page budget.",
  },
];

export const SOIL_GLOSSARY = [
  { id: "gl-1", term: "CEC", meaning: "Cation exchange capacity — how well the soil holds onto nutrients (meq/100g)" },
  { id: "gl-2", term: "ppm", meaning: "Parts per million — the standard unit reported for soil nutrients" },
  { id: "gl-3", term: "meq/100g", meaning: "Milliequivalents per 100 g — used for CEC and exchangeable bases" },
  { id: "gl-4", term: "PHI", meaning: "Pre-harvest interval — days between the last spray and harvest" },
  { id: "gl-5", term: "ET", meaning: "Evapotranspiration — water leaving the soil through the plant and surface" },
  { id: "gl-6", term: "W pattern", meaning: "Sampling walk that crosses the whole zone so every part is represented" },
  { id: "gl-7", term: "Neutralising value", meaning: "How effective a lime is at raising pH compared with pure calcium carbonate" },
  { id: "gl-8", term: "Field capacity", meaning: "The moisture the soil holds after excess water has drained away" },
];

/* ------------------------------------------------------------- helpers */

export function soilStatusTone(
  status: SoilParamStatus,
): "low" | "medium" | "high" | "neutral" {
  if (status === "Optimal" || status === "Adequate") return "low";
  if (status === "High") return "medium";
  if (status === "Medium" || status === "Slightly low") return "medium";
  return "high";
}

export function soilParamTone(
  parameter: SoilParameter,
): "low" | "medium" | "high" | "neutral" {
  return soilStatusTone(parameter.status);
}

export function moistureTone(
  status: MoistureWeek["status"],
): "low" | "medium" | "high" | "neutral" {
  if (status === "Good" || status === "Recharged") return "low";
  if (status === "Decreasing") return "medium";
  if (status === "Low" || status === "Excess") return "high";
  return "neutral";
}

export function practiceTone(priority: SoilPractice["priority"]): "low" | "medium" | "high" {
  if (priority === "High") return "high";
  if (priority === "Medium") return "medium";
  return "low";
}

export function soilTotals() {
  return {
    plots: SOIL_PLOTS.length,
    tests: SOIL_HISTORY.length,
    labs: SOIL_LABS.length,
    parameters: SOIL_PARAMETERS.length,
    programCost: FERTILIZER_PROGRAM.reduce((total, step) => total + step.cost, 0),
    saved: SKIPPED_INPUTS.reduce((total, item) => total + item.saved, 0),
    practices: SOIL_PRACTICES.length,
    outstanding: SOIL_ORDERS.filter((order) => order.status === "Pending").reduce(
      (total, order) => total + order.amount,
      0,
    ),
    spent: SOIL_ORDERS.filter((order) => order.status === "Paid").reduce(
      (total, order) => total + order.amount,
      0,
    ),
    irrigationNeeded: MOISTURE_WEEKS.filter((week) => week.irrigationCost > 0).reduce(
      (total, week) => total + week.irrigationCost,
      0,
    ),
  };
}
