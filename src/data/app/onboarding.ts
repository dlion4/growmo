/* ============================================================================
   PAGE 1 DATA — Onboarding & Farm Profile. 15+ realistic Kenyan datasets.
   ========================================================================== */

/* ---------------- Counties, subs & wards (12 detailed + all 47 names) -------- */
export interface CountyDetail {
  name: string;
  subs: { name: string; wards: string[] }[];
}

export const COUNTIES_DETAILED: CountyDetail[] = [
  { name: "Kiambu", subs: [
    { name: "Githunguri", wards: ["Githunguri", "Githiga", "Ikinu", "Ngewa", "Komothai"] },
    { name: "Limuru", wards: ["Limuru Central", "Ndeiya", "Ndarugu", "Njoroi"] },
    { name: "Thika", wards: ["Thika Township", "Kamenu", "Hospital", "Gatuanyaga"] },
  ]},
  { name: "Nakuru", subs: [
    { name: "Nakuru Town East", wards: ["Biashara", "Kivumbini", "Flamingo", "Menengai"] },
    { name: "Naivasha", wards: ["Biashara-Naivasha", "Hells Gate", "Lakeview", "Mai Mahiu"] },
    { name: "Molo", wards: ["Mariashoni", "Elburgon", "Turi", "Molo"] },
  ]},
  { name: "Meru", subs: [
    { name: "Imenti North", wards: ["Municipality", "Ntima", "Nyaki East", "Nyaki West"] },
    { name: "Tigania East", wards: ["Thangatha", "Mikinduri", "Kiguchwa", "Muthara"] },
  ]},
  { name: "Kakamega", subs: [
    { name: "Lurambi", wards: ["Butsotso East", "Butsotso South", "Sheywe", "Mahiakalo"] },
    { name: "Malava", wards: ["West Kabras", "Chemuche", "Butali", "Manda"] },
  ]},
  { name: "Uasin Gishu", subs: [
    { name: "Kapseret", wards: ["Simat", "Kipkenyo", "Ngeria", "Megun", "Langas"] },
    { name: "Moiben", wards: ["Tembelio", "Sergoit", "Moiben", "Karuna"] },
  ]},
  { name: "Kisumu", subs: [
    { name: "Kisumu Central", wards: ["Railways", "Migosi", "Shauri Moyo", "Market Milimani"] },
    { name: "Seme", wards: ["West Seme", "Central Seme", "East Seme", "North Seme"] },
  ]},
  { name: "Makueni", subs: [
    { name: "Makueni", wards: ["Wote", "Muvau", "Mavindini", "Kitise"] },
    { name: "Mbooni", wards: ["Tulimani", "Mbooni", "Kithungo", "Kiteta"] },
  ]},
  { name: "Kilifi", subs: [
    { name: "Kilifi North", wards: ["Tezo", "Sokoni", "Kibarani", "Matsangoni"] },
    { name: "Malindi", wards: ["Jilore", "Kakuyuni", "Ganda", "Malimo"] },
  ]},
  { name: "Nyeri", subs: [
    { name: "Nyeri Town", wards: ["Kamakwa", "Mukaro", "Gatitu", "Rware"] },
    { name: "Othaya", wards: ["Karima", "Mahiga", "Iria-Ini", "Chinga"] },
  ]},
  { name: "Kericho", subs: [
    { name: "Ainamoi", wards: ["Kapsoit", "Ainamoi", "Kapkugerwet", "Kipchebor"] },
    { name: "Bureti", wards: ["Kisiara", "Tebesonik", "Cheboin", "Litein"] },
  ]},
  { name: "Machakos", subs: [
    { name: "Machakos Town", wards: ["Biashara-Machakos", "Kola", "Mumbuni North", "Muvuti"] },
    { name: "Kathiani", wards: ["Mitaboni", "Kathiani Central", "Upper Kaewa", "Lower Kaewa"] },
  ]},
  { name: "Trans Nzoia", subs: [
    { name: "Saboti", wards: ["Kinyoro", "Matisi", "Tuwan", "Saboti"] },
    { name: "Kwanza", wards: ["Kwanza", "Keiyo", "Bidii", "Namanjalala"] },
  ]},
];

export const ALL_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu",
  "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa",
  "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
  "Nyeri", "Samburu", "Siaya", "Taita Taveta", "Tana River", "Tharaka Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
];

/* ---------------- Identity lookups ---------------- */
export const LANGUAGES = ["English", "Kiswahili", "Kikuyu", "Luo", "Luhya", "Kalenjin", "Kamba", "Somali"];
export const LITERACY_LEVELS = ["High", "Medium", "Low"];
export const GENDERS = ["Female", "Male", "Non-binary"];

/* ---------------- Plot lookups ---------------- */
export const SOIL_TYPES = ["Loam", "Clay", "Sandy", "Red volcanic", "Black cotton", "Sandy loam", "Clay loam"];
export const SLOPES = ["Flat", "Gentle", "Moderate", "Steep"];
export const WATER_SOURCES = ["Rain-fed", "River", "Stream", "Borehole", "Dam", "Water pan", "Irrigation scheme", "Piped", "None"];
export const IRRIGATION_TYPES = ["None", "Drip", "Sprinkler", "Furrow", "Flooding"];
export const LAND_USES = ["Cropland", "Fallow", "Pasture", "Forest"];
export const ROAD_ACCESS = ["All-weather", "Seasonal", "No road"];
export const CONDITIONS = ["New", "Good", "Fair", "Poor"];

/* ---------------- AEZ zones (blueprint §1.3, full table) ---------------- */
export interface AEZZone {
  code: string;
  name: string;
  altitude: string;
  rainfall: string;
  temp: string;
  counties: string;
  blurb: string;
}

export const AEZ_ZONES: AEZZone[] = [
  { code: "LH1", name: "Upper Highland", altitude: ">2200m", rainfall: ">1400mm/yr", temp: "10–18°C", counties: "Uasin Gishu (Timboroa), Nyandarua (Kipipiri)", blurb: "Cool and wet — wheat, potatoes, dairy pasture and pyrethrum thrive." },
  { code: "LH2", name: "Lower Highland", altitude: "1900–2200m", rainfall: "1000–1400mm/yr", temp: "14–20°C", counties: "Kericho, Nandi, parts of Nakuru", blurb: "Tea country. Maize H6213, beans and dairy do very well." },
  { code: "UM1", name: "Upper Midland", altitude: "1500–1900m", rainfall: "900–1200mm/yr", temp: "16–22°C", counties: "Kiambu, Nyeri, Murang'a, Meru", blurb: "Kenya's vegetable basket — cabbage, kale, tomato and dairy." },
  { code: "UM2", name: "Lower Midland", altitude: "1200–1500m", rainfall: "700–1000mm/yr", temp: "18–24°C", counties: "Kakamega, Bungoma, Vihiga, Kisii", blurb: "Sugar, maize and bananas with reliable bimodal rain." },
  { code: "UM3", name: "Lower Midland Dry", altitude: "1200–1500m", rainfall: "500–700mm/yr", temp: "20–25°C", counties: "Machakos, Kitui, Makueni", blurb: "Dryland farming — mangoes, green grams, sorghum, water harvesting." },
  { code: "LM1", name: "Low Midland", altitude: "900–1200m", rainfall: "600–900mm/yr", temp: "22–26°C", counties: "Kisumu, Siaya, Homa Bay", blurb: "Lakeside mixed farming — rice in paddies, cotton, groundnuts." },
  { code: "LM2", name: "Low Midland Dry", altitude: "600–900m", rainfall: "400–600mm/yr", temp: "24–28°C", counties: "Mbeere, Mwingi, parts of Tana River", blurb: "Drought-escaping crops, goats and beekeeping win here." },
  { code: "LM3", name: "Low Midland Arid", altitude: "600–900m", rainfall: "250–400mm/yr", temp: "25–30°C", counties: "Garissa, Wajir (riverine)", blurb: "Pastoral + irrigated riverine plots. Fodder is gold." },
  { code: "LM4", name: "Low Midland Very Arid", altitude: "<600m", rainfall: "<250mm/yr", temp: "28–35°C", counties: "Turkana, Mandera, Marsabit", blurb: "Pastoralism first; kitchen gardens only with harvested water." },
  { code: "CL1", name: "Coastal Lowland", altitude: "0–400m", rainfall: "800–1200mm/yr", temp: "25–32°C", counties: "Kilifi, Kwale, Lamu", blurb: "Coconut, cashew, cassava, Bixa and dairy goats." },
  { code: "CL2", name: "Coastal Lowland Dry", altitude: "0–400m", rainfall: "400–800mm/yr", temp: "26–34°C", counties: "Taita Taveta (low), parts of Kwale", blurb: "Sisal, green grams and ranching under low rainfall." },
];

export const COUNTY_AEZ: Record<string, string> = {
  Kiambu: "UM1", Nyeri: "UM1", "Murang'a": "UM1", Meru: "UM1", Kirinyaga: "UM1",
  Kericho: "LH2", Nandi: "LH2", Nakuru: "LH2", "Uasin Gishu": "LH1", Nyandarua: "LH1",
  Kakamega: "UM2", Bungoma: "UM2", Vihiga: "UM2", Kisii: "UM2", Nyamira: "UM2",
  Machakos: "UM3", Kitui: "UM3", Makueni: "UM3", "Tharaka Nithi": "UM3", Embu: "UM2",
  Kisumu: "LM1", Siaya: "LM1", "Homa Bay": "LM1", Migori: "LM1", Busia: "LM1",
  Kilifi: "CL1", Kwale: "CL1", Lamu: "CL1", Mombasa: "CL1",
  "Taita Taveta": "CL2", Kajiado: "LM2", Turkana: "LM4", Marsabit: "LM4", Mandera: "LM4",
};

export function classifyAEZ(county: string): AEZZone | null {
  const code = COUNTY_AEZ[county];
  if (!code) return null;
  return AEZ_ZONES.find((z) => z.code === code) ?? null;
}

export const AEZ_CROPS: Record<string, string[]> = {
  LH1: ["Potato (Shangi)", "Wheat", "Dairy pasture", "Pyrethrum"],
  LH2: ["Tea", "Maize H6213", "Beans (Nyota)", "Dairy fodder"],
  UM1: ["Cabbage (Gloria F1)", "Kale", "Tomato (Anna F1)", "Maize H614D"],
  UM2: ["Maize (DK777)", "Bananas", "Beans (Rosecoco)", "Groundnuts"],
  UM3: ["Mango", "Green grams", "Sorghum", "Pigeon peas"],
  LM1: ["Rice (Basmati 370)", "Cotton", "Groundnuts", "Sorghum"],
  LM2: ["Green grams", "Cowpeas", "Sorghum", "Goats + bees"],
  LM3: ["Fodder (Boma Rhodes)", "Date palm", "Goats", "Irrigated kale"],
  LM4: ["Pasture reseeding", "Goats", "Camels", "Kitchen garden"],
  CL1: ["Coconut", "Cashew", "Cassava", "Dairy goats"],
  CL2: ["Sisal", "Green grams", "Beef ranching", "Mangoes"],
};

/* ---------------- Asset catalog (blueprint §1.4) ---------------- */
export interface AssetCat {
  id: string;
  label: string;
  items: string[];
}

export const ASSET_CATALOG: AssetCat[] = [
  { id: "power", label: "Power & Tillage", items: ["Tractor", "Ox-plough", "Hand hoe", "Rototiller"] },
  { id: "irrigation", label: "Irrigation", items: ["Drip kit", "Sprinkler set", "Diesel pump", "Solar pump", "Water tank", "Pipes & fittings"] },
  { id: "structures", label: "Structures", items: ["Greenhouse", "Shade net", "Store / granary", "Poultry house", "Cow shed"] },
  { id: "transport", label: "Transport", items: ["Pickup", "Motorcycle (boda)", "Wheelbarrow", "Animal-drawn cart"] },
  { id: "processing", label: "Processing", items: ["Maize mill", "Thresher", "Dryer", "Grader", "Crates", "Sacks"] },
  { id: "livestock", label: "Livestock", items: ["Dairy cattle", "Beef cattle", "Goats", "Sheep", "Poultry", "Pigs", "Bees (hives)"] },
  { id: "tech", label: "Technology", items: ["Smartphone", "Feature phone", "Solar panel", "Radio"] },
];

export const LIVESTOCK_BREEDS: Record<string, string[]> = {
  "Dairy cattle": ["Friesian", "Ayrshire", "Jersey", "Guernsey", "Cross"],
  "Beef cattle": ["Boran", "Sahiwal", "Hereford", "Cross"],
  Goats: ["Galla", "Toggenburg", "Saanen", "Small East African"],
  Sheep: ["Dorper", "Red Maasai", "Merino", "Corriedale"],
  Poultry: ["Kienyeji", "Layers (ISA Brown)", "Broilers (Cobb)", "Improved Kienyeji"],
  Pigs: ["Large White", "Landrace", "Duroc"],
  "Bees (hives)": ["Langstroth", "Kenya Top Bar", "Log hive"],
};

/* ---------------- Crop library ---------------- */
export interface CropVar {
  crop: string;
  varieties: string[];
  unit: string;
}

export const CROP_LIBRARY: CropVar[] = [
  { crop: "Cabbage", varieties: ["Gloria F1", "Copenhagen Market", "Riana F1", "Queen F1"], unit: "heads" },
  { crop: "Maize", varieties: ["H6213", "H614D", "DK777", "Pioneer 30G19"], unit: "bags (90kg)" },
  { crop: "Beans", varieties: ["Rosecoco", "Nyota", "Mwitemania", "Mwezi Moja"], unit: "bags (90kg)" },
  { crop: "Potato", varieties: ["Shangi", "Unica", "Dutch Robjin", "Markies"], unit: "bags (50kg)" },
  { crop: "Tomato", varieties: ["Anna F1", "Chonto F1", "Rambo F1", "Rio Grande"], unit: "crates (64kg)" },
  { crop: "Onion", varieties: ["Red Creole", "Texas Grano", "Bombay Red", "Jambar F1"], unit: "nets (14kg)" },
  { crop: "Kale", varieties: ["Sukuma Wiki Collards", "Thousand Headed", "Marrow Stem"], unit: "bunches" },
  { crop: "Avocado", varieties: ["Hass", "Fuerte", "Pinkerton"], unit: "fruits" },
  { crop: "Coffee", varieties: ["Ruiru 11", "SL28", "SL34", "Batian"], unit: "bags cherry" },
  { crop: "Banana", varieties: ["FHIA 17", "Williams", "Grand Nain", "Kienyeji"], unit: "bunches" },
  { crop: "Rice", varieties: ["Basmati 370", "BW 196", "IR 2793"], unit: "bags (75kg)" },
  { crop: "Green grams", varieties: ["N26", "Biashara", "Karembo"], unit: "bags (90kg)" },
];

export const CROP_SEASONS = ["LR 2026", "SR 2025", "LR 2025", "SR 2024", "LR 2024", "SR 2023", "LR 2023", "SR 2022"];
export const CHALLENGES = ["Black rot", "Fall Armyworm", "Low prices", "Poor germination", "Drought", "Flooding", "Late blight", "Diamondback moth", "Cutworms", "Birds", "None"];

/* ---------------- Farmer groups ---------------- */
export interface FarmerGroup {
  id: string;
  name: string;
  ward: string;
  members: number;
  focus: string;
  distKm: number;
}

export const FARMER_GROUPS: FarmerGroup[] = [
  { id: "g1", name: "Githunguri Veg Growers", ward: "Githunguri", members: 42, focus: "Cabbage & kale bulk sales", distKm: 1.2 },
  { id: "g2", name: "Ikinu Dairy Self-Help", ward: "Ikinu", members: 65, focus: "Milk cooling & transport", distKm: 2.8 },
  { id: "g3", name: "Komothai Youth in Agribiz", ward: "Komothai", members: 28, focus: "Tomato greenhouses", distKm: 3.5 },
  { id: "g4", name: "Ngewa Women Farmers", ward: "Ngewa", members: 51, focus: "Beans & poultry", distKm: 4.1 },
  { id: "g5", name: "Githiga Potato Union", ward: "Githiga", members: 37, focus: "Certified seed potato", distKm: 5.0 },
  { id: "g6", name: "Riabai Organic Circle", ward: "Ruiru", members: 19, focus: "Organic certification", distKm: 6.4 },
  { id: "g7", name: "Limuru Mbegu Sacco", ward: "Limuru Central", members: 88, focus: "Input bulk buying", distKm: 7.9 },
  { id: "g8", name: "Ndarugu Water Users", ward: "Ndarugu", members: 54, focus: "Irrigation scheduling", distKm: 9.3 },
];

/* ---------------- Finance lookups ---------------- */
export const BANKS = ["Equity Bank", "KCB Bank", "Co-operative Bank", "Absa Bank Kenya", "Stanbic Bank", "Family Bank", "DTB Bank", "I&M Bank"];

export const GOALS = [
  { id: "subsistence", label: "Subsistence", desc: "Feed the family first" },
  { id: "commercial", label: "Commercial", desc: "Maximize market sales" },
  { id: "export", label: "Export", desc: "Premium foreign buyers" },
  { id: "contract", label: "Contract farming", desc: "Locked prices, sure buyer" },
  { id: "mixed", label: "Mixed", desc: "Home use + sales" },
];

export const ORGANIC_OPTS = ["Conventional", "Transitioning to organic", "Certified organic"];
export const CERTS = ["GlobalG.A.P", "KS1758", "Kenya Organic", "None"];
export const LABOUR_MODELS = [
  { id: "family", label: "Family only", desc: "No hired hands" },
  { id: "mixed", label: "Family + casuals", desc: "Hire at peak times" },
  { id: "hired", label: "Full hired labour", desc: "Permanent + casual team" },
];
export const MARKET_PREFS = ["Local market", "Broker", "Cooperative", "Direct to supermarket", "Export", "Online"];
export const RISKS = [
  { id: "low", label: "Low", desc: "Safe, proven varieties" },
  { id: "medium", label: "Medium", desc: "Some new varieties" },
  { id: "high", label: "High", desc: "New varieties, high input" },
];

/* ---------------- Profile types + demo draft ---------------- */
export interface Plot {
  id: string;
  name: string;
  size: number;
  soil: string;
  ph: string;
  slope: string;
  water: string;
  irrigation: string;
  use: string;
  road: string;
  marketKm: string;
  roadKm: string;
  gps?: { lat: string; lng: string; acc: string };
}

export interface AssetRow {
  id: string;
  category: string;
  item: string;
  qty: number;
  condition: string;
  value: number;
}

export interface LivestockRow {
  id: string;
  type: string;
  breed: string;
  count: number;
  value: number;
}

export interface SeasonRow {
  id: string;
  season: string;
  crop: string;
  variety: string;
  acreage: number;
  yieldQty: string;
  price: string;
  challenges: string[];
  satisfaction: number;
}

export interface FarmProfile {
  phone: string;
  phoneVerified: boolean;
  name: string;
  idNumber: string;
  altPhone: string;
  email: string;
  dob: string;
  gender: string;
  language: string;
  literacy: string;
  photo: string | null;
  farmName: string;
  county: string;
  sub: string;
  ward: string;
  village: string;
  gps: { lat: string; lng: string; acc: string } | null;
  plots: Plot[];
  assets: AssetRow[];
  livestock: LivestockRow[];
  seasons: SeasonRow[];
  historySkipped: boolean;
  goal: string;
  targetIncome: string;
  prefCrops: string[];
  organic: string;
  certs: string[];
  labour: string;
  marketPref: string;
  risk: string;
  joinGroup: string;
  groupId: string | null;
  mpesa: string;
  mpesaName: string;
  mpesaVerified: boolean;
  bankName: string;
  bankBranch: string;
  bankAccount: string;
  bankVerified: boolean;
  walletPinSet: boolean;
  autopay: boolean;
  autopayLimit: string;
  soilKit: { ordered: boolean; code: string };
}

export const DRAFT_PROFILE: FarmProfile = {
  phone: "0712345678",
  phoneVerified: true,
  name: "Mary Wanjiku",
  idNumber: "12345678",
  altPhone: "0733111222",
  email: "mary.wanjiku@gmail.com",
  dob: "1988-04-17",
  gender: "Female",
  language: "Kiswahili",
  literacy: "Medium",
  photo: null,
  farmName: "Mary's Farm",
  county: "Kiambu",
  sub: "Githunguri",
  ward: "Githunguri",
  village: "Kwa Kibaki",
  gps: { lat: "-1.0584", lng: "36.7831", acc: "±6m" },
  plots: [
    { id: "pl1", name: "Shamba ya nyumba", size: 0.5, soil: "Red volcanic", ph: "6.2", slope: "Gentle", water: "Borehole", irrigation: "Drip", use: "Cropland", road: "All-weather", marketKm: "4", roadKm: "0.5", gps: { lat: "-1.0584", lng: "36.7831", acc: "±6m" } },
    { id: "pl2", name: "Shamba ya chini", size: 2, soil: "", ph: "", slope: "", water: "", irrigation: "", use: "", road: "", marketKm: "", roadKm: "" },
  ],
  assets: [
    { id: "a1", category: "Power & Tillage", item: "Hand hoe", qty: 4, condition: "Good", value: 1200 },
    { id: "a2", category: "Irrigation", item: "Drip kit", qty: 1, condition: "Good", value: 14500 },
    { id: "a3", category: "Transport", item: "Wheelbarrow", qty: 1, condition: "Fair", value: 4500 },
    { id: "a4", category: "Technology", item: "Smartphone", qty: 1, condition: "Good", value: 18000 },
  ],
  livestock: [
    { id: "l1", type: "Dairy cattle", breed: "Friesian", count: 2, value: 140000 },
    { id: "l2", type: "Poultry", breed: "Kienyeji", count: 25, value: 18750 },
  ],
  seasons: [
    { id: "s1", season: "SR 2024", crop: "Cabbage", variety: "Gloria F1", acreage: 0.5, yieldQty: "7,000 heads", price: "KES 25/head", challenges: ["Black rot", "Low prices"], satisfaction: 3 },
    { id: "s2", season: "LR 2024", crop: "Maize", variety: "H6213", acreage: 2, yieldQty: "18 bags", price: "KES 3,200/bag", challenges: ["Fall Armyworm"], satisfaction: 2 },
    { id: "s3", season: "SR 2023", crop: "Beans", variety: "Rosecoco", acreage: 1, yieldQty: "6 bags", price: "KES 7,000/bag", challenges: ["Poor germination"], satisfaction: 2 },
  ],
  historySkipped: false,
  goal: "commercial",
  targetIncome: "250000",
  prefCrops: ["Cabbage", "Maize", "Beans"],
  organic: "Conventional",
  certs: ["KS1758"],
  labour: "mixed",
  marketPref: "Local market",
  risk: "medium",
  joinGroup: "",
  groupId: null,
  mpesa: "0712345678",
  mpesaName: "MARY WANJIKU",
  mpesaVerified: false,
  bankName: "",
  bankBranch: "",
  bankAccount: "",
  bankVerified: false,
  walletPinSet: false,
  autopay: false,
  autopayLimit: "5000",
  soilKit: { ordered: false, code: "" },
};

export const BLANK_PROFILE: FarmProfile = {
  ...DRAFT_PROFILE,
  phone: "",
  phoneVerified: false,
  name: "",
  idNumber: "",
  altPhone: "",
  email: "",
  dob: "",
  gender: "",
  language: "",
  literacy: "",
  photo: null,
  farmName: "",
  county: "",
  sub: "",
  ward: "",
  village: "",
  gps: null,
  plots: [],
  assets: [],
  livestock: [],
  seasons: [],
  goal: "",
  targetIncome: "",
  prefCrops: [],
  organic: "",
  certs: [],
  labour: "",
  marketPref: "",
  risk: "",
  joinGroup: "",
  groupId: null,
  mpesa: "",
  mpesaName: "",
  mpesaVerified: false,
  bankName: "",
  bankBranch: "",
  bankAccount: "",
  bankVerified: false,
  walletPinSet: false,
  autopay: false,
  autopayLimit: "5000",
  soilKit: { ordered: false, code: "" },
};
