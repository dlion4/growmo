/* ============================================================================
   PAGE 8 — WEATHER & CLIMATE INTELLIGENCE
   Demo data for /app/weather: hyper-local conditions, 7-day and seasonal
   outlooks, crop-stage prediction engine, planting windows, extreme alerts
   and the historical archive used for planning.

   Everything is Kenyan demo data (KES, 07XX phones, real counties, crops and
   varieties, Kiswahili microcopy). No live API calls — the page simulates
   refreshes with timeouts, exactly like the other dashboard pages.
   ========================================================================== */

export type WxTone = "low" | "medium" | "high" | "neutral";
export type WxCondition =
  | "rain"
  | "showers"
  | "storm"
  | "cloud"
  | "sun"
  | "fog"
  | "wind";
export type WxSeverity = "Advisory" | "Watch" | "Warning" | "Extreme";

/* ============================ 8.0 Profile ============================ */

export interface WeatherProfile {
  farm: string;
  place: string;
  subCounty: string;
  county: string;
  aez: string;
  altitude: string;
  coords: string;
  station: string;
  stationKind: string;
  grid: string;
  updated: string;
  season: string;
  lastRain: string;
  nextEvent: string;
  confidence: number;
  soil: string;
  swahili: string;
}

export const WEATHER_PROFILE: WeatherProfile = {
  farm: "Mary's Farm",
  place: "Githunguri, Kiambu County",
  subCounty: "Githunguri",
  county: "Kiambu",
  aez: "UM1 · Upper Midlands 1 (coffee–dairy zone)",
  altitude: "1,830 m ASL",
  coords: "1.0642° S, 36.7819° E",
  station: "KMD Githunguri AWS 034",
  stationKind: "Kenya Met automatic station + GrowMO rain gauge",
  grid: "NASA POWER 0.5° grid · IBM Weather 1 km nowcast",
  updated: "Updated 07:40 EAT · Short rains week 3",
  season: "Short rains 2026 (Oct–Dec)",
  lastRain: "5.2 mm overnight (21:00–04:30)",
  nextEvent: "Heavy shower window 15:00–18:00 today",
  confidence: 82,
  soil: "Humic nitisol (red volcanic) · clay-loam in low plot",
  swahili: "Hali ya hewa · Githunguri, Kiambu",
};

/* ===================== 8.1 Current conditions (live) ===================== */

export interface CurrentDatum {
  id: string;
  label: string;
  swahili: string;
  value: number;
  display: string;
  unit: string;
  change: string;
  tone: WxTone;
  note: string;
  icon:
    | "temp"
    | "feels"
    | "humidity"
    | "wind"
    | "compass"
    | "rain"
    | "rain-week"
    | "soil-temp"
    | "soil-moist"
    | "uv"
    | "et"
    | "dew"
    | "eye"
    | "gauge";
  field: string;
}

export const CURRENT_CONDITIONS: CurrentDatum[] = [
  {
    id: "cc-temp",
    label: "Temperature",
    swahili: "Joto",
    value: 24,
    display: "24",
    unit: "°C",
    change: "+1°C",
    tone: "neutral",
    note: "Warm for the highlands; ideal for cabbage leaf expansion.",
    icon: "temp",
    field: "Spray tank water stays warm — no cold-shock risk",
  },
  {
    id: "cc-feels",
    label: "Feels like",
    swahili: "Inahisiwa kama",
    value: 22,
    display: "22",
    unit: "°C",
    change: "—",
    tone: "neutral",
    note: "Light breeze keeps the field comfortable for a full workday.",
    icon: "feels",
    field: "Casuals can work to 16:00 without heat breaks",
  },
  {
    id: "cc-humidity",
    label: "Humidity",
    swahili: "Unyevu hewani",
    value: 78,
    display: "78",
    unit: "%",
    change: "+5%",
    tone: "high",
    note: "Above 75% for 6+ hours — black rot and downy mildew window.",
    icon: "humidity",
    field: "Black rot risk 82% on cabbage · spray within 48 hrs",
  },
  {
    id: "cc-wind",
    label: "Wind speed",
    swahili: "Kasi ya upepo",
    value: 12,
    display: "12",
    unit: "km/h",
    change: "−3",
    tone: "low",
    note: "Under 15 km/h — safe for knapsack spraying.",
    icon: "wind",
    field: "Spray drift low · knapsack OK before 10:00",
  },
  {
    id: "cc-winddir",
    label: "Wind direction",
    swahili: "Mwelekeo wa upepo",
    value: 0,
    display: "NE",
    unit: "",
    change: "—",
    tone: "neutral",
    note: "Northeasterly — drifting away from the river and Plot 4 tunnel.",
    icon: "compass",
    field: "Spray from the east edge so drift leaves the farm",
  },
  {
    id: "cc-rain24",
    label: "Rainfall (24hr)",
    swahili: "Mvua · saa 24",
    value: 5.2,
    display: "5.2",
    unit: "mm",
    change: "—",
    tone: "medium",
    note: "Light rain overnight washed the canopy — re-apply fungicide.",
    icon: "rain",
    field: "Wash-off: foliar feed lost, fungicide needs a repeat",
  },
  {
    id: "cc-rain7",
    label: "Rainfall (7 days)",
    swahili: "Mvua · siku 7",
    value: 28,
    display: "28",
    unit: "mm",
    change: "+12 mm",
    tone: "medium",
    note: "Slightly above the 22 mm weekly norm for this week of the season.",
    icon: "rain-week",
    field: "Skip irrigation this week · drainage only",
  },
  {
    id: "cc-soiltemp",
    label: "Soil temperature",
    swahili: "Joto la udongo",
    value: 20,
    display: "20",
    unit: "°C",
    change: "—",
    tone: "low",
    note: "10 cm depth — above the 15°C floor for root uptake.",
    icon: "soil-temp",
    field: "CAN top-dress will move fast into the roots",
  },
  {
    id: "cc-soilmoist",
    label: "Soil moisture",
    swahili: "Unyevu wa udongo",
    value: 65,
    display: "65",
    unit: "%",
    change: "+8%",
    tone: "low",
    note: "Field capacity reached on the low plot; watch for waterlogging.",
    icon: "soil-moist",
    field: "Open drainage furrows on Plot 1 low corner",
  },
  {
    id: "cc-uv",
    label: "UV index",
    swahili: "Kiwango cha UV",
    value: 6,
    display: "6",
    unit: "Moderate",
    change: "—",
    tone: "medium",
    note: "Peak 12:00–14:00 — shade seedlings and wear a hat.",
    icon: "uv",
    field: "Hardening-off trays: shade net 12:00–14:00",
  },
  {
    id: "cc-et",
    label: "Evapotranspiration",
    swahili: "UVUKIZI (ET₀)",
    value: 3.5,
    display: "3.5",
    unit: "mm/day",
    change: "+0.4",
    tone: "neutral",
    note: "FAO-56 reference ET₀ from the AWS energy balance.",
    icon: "et",
    field: "0.5 acre cabbage uses ~8.4 m³ today if it were dry",
  },
  {
    id: "cc-dew",
    label: "Dew point",
    swahili: "Kiwango cha umande",
    value: 19,
    display: "19",
    unit: "°C",
    change: "+1°C",
    tone: "medium",
    note: "Leaf wetness likely until 09:30 — hold copper sprays.",
    icon: "dew",
    field: "Wait until leaves dry (after 09:30) before any spray",
  },
  {
    id: "cc-vis",
    label: "Visibility",
    swahili: "Uwezo wa kuona",
    value: 8,
    display: "8",
    unit: "km",
    change: "—",
    tone: "neutral",
    note: "Morning mist over the Githurai river valley, clearing by 10:00.",
    icon: "eye",
    field: "Tractor work fine after 10:00",
  },
  {
    id: "cc-pressure",
    label: "Atmospheric pressure",
    swahili: "Shinikizo la hewa",
    value: 1015,
    display: "1015",
    unit: "hPa",
    change: "−2 hPa",
    tone: "medium",
    note: "Falling — consistent with the 15:00 convective shower forecast.",
    icon: "gauge",
    field: "Falling pressure = finish field work by 14:00",
  },
];

export const HOURLY_TODAY: {
  hour: string;
  temp: number;
  rainPct: number;
  wind: number;
  condition: WxCondition;
  label: string;
}[] = [
  {
    hour: "06:00",
    temp: 16,
    rainPct: 20,
    wind: 6,
    condition: "fog",
    label: "Mist over the valley",
  },
  {
    hour: "07:00",
    temp: 17,
    rainPct: 20,
    wind: 7,
    condition: "fog",
    label: "Leaves wet · no spraying",
  },
  {
    hour: "08:00",
    temp: 18,
    rainPct: 15,
    wind: 8,
    condition: "cloud",
    label: "Scouting window opens",
  },
  {
    hour: "09:00",
    temp: 20,
    rainPct: 15,
    wind: 9,
    condition: "cloud",
    label: "Canopy drying",
  },
  {
    hour: "10:00",
    temp: 21,
    rainPct: 10,
    wind: 11,
    condition: "cloud",
    label: "Best spray window · wind 11 km/h",
  },
  {
    hour: "11:00",
    temp: 23,
    rainPct: 10,
    wind: 12,
    condition: "sun",
    label: "Good spray window · UV rising",
  },
  {
    hour: "12:00",
    temp: 24,
    rainPct: 15,
    wind: 12,
    condition: "sun",
    label: "UV 6 — shade seedlings",
  },
  {
    hour: "13:00",
    temp: 24,
    rainPct: 25,
    wind: 12,
    condition: "cloud",
    label: "Cloud building to the west",
  },
  {
    hour: "14:00",
    temp: 23,
    rainPct: 45,
    wind: 13,
    condition: "cloud",
    label: "Pack up sprayers",
  },
  {
    hour: "15:00",
    temp: 21,
    rainPct: 70,
    wind: 15,
    condition: "rain",
    label: "Shower starts · 4–8 mm",
  },
  {
    hour: "16:00",
    temp: 19,
    rainPct: 75,
    wind: 16,
    condition: "rain",
    label: "Heaviest cell · 6–10 mm",
  },
  {
    hour: "17:00",
    temp: 19,
    rainPct: 60,
    wind: 14,
    condition: "storm",
    label: "Thunder over Limuru",
  },
  {
    hour: "18:00",
    temp: 18,
    rainPct: 45,
    wind: 11,
    condition: "showers",
    label: "Easing to showers",
  },
  {
    hour: "19:00",
    temp: 17,
    rainPct: 30,
    wind: 9,
    condition: "cloud",
    label: "Cloudy, drains well",
  },
  {
    hour: "20:00",
    temp: 17,
    rainPct: 25,
    wind: 8,
    condition: "cloud",
    label: "Leaf wetness returns",
  },
];

/* ===================== 8.2 Seven-day forecast ===================== */

export interface ForecastDay {
  id: string;
  label: string;
  date: string;
  condition: WxCondition;
  conditionText: string;
  min: number;
  max: number;
  rainPct: number;
  rainMin: number;
  rainMax: number;
  wind: number;
  windDir: string;
  humidity: number;
  uv: number;
  et: number;
  impact: string;
  spray: "Good window" | "Limited" | "Do not spray";
  tone: WxTone;
  workHours: string;
  swahili: string;
}

export const SEVEN_DAY_FORECAST: ForecastDay[] = [
  {
    id: "fd-1",
    label: "Today",
    date: "Sat",
    condition: "rain",
    conditionText: "Rain · 15:00–18:00",
    min: 16,
    max: 24,
    rainPct: 70,
    rainMin: 8,
    rainMax: 15,
    wind: 12,
    windDir: "NE",
    humidity: 78,
    uv: 6,
    et: 3.5,
    impact: "Good for cabbage, spray after rain if leaves dry",
    spray: "Limited",
    tone: "medium",
    workHours: "06:00–14:00",
    swahili: "Mvua jioni · fanya kazi asubuhi",
  },
  {
    id: "fd-2",
    label: "Tomorrow",
    date: "Sun",
    condition: "rain",
    conditionText: "Rain · on and off",
    min: 15,
    max: 22,
    rainPct: 80,
    rainMin: 10,
    rainMax: 20,
    wind: 15,
    windDir: "NE",
    humidity: 82,
    uv: 4,
    et: 2.8,
    impact: "Black rot risk — monitor cabbage and spray Mancozeb when dry",
    spray: "Do not spray",
    tone: "high",
    workHours: "06:00–10:00",
    swahili: "Hatari ya kuoza · angalia kabichi",
  },
  {
    id: "fd-3",
    label: "Day 3",
    date: "Mon",
    condition: "showers",
    conditionText: "Cloud with showers",
    min: 14,
    max: 23,
    rainPct: 40,
    rainMin: 0,
    rainMax: 5,
    wind: 10,
    windDir: "E",
    humidity: 70,
    uv: 6,
    et: 3.4,
    impact: "Good spraying window for black rot and diamondback moth",
    spray: "Good window",
    tone: "low",
    workHours: "07:00–16:00",
    swahili: "Nafasi nzuri ya kupulizia",
  },
  {
    id: "fd-4",
    label: "Day 4",
    date: "Tue",
    condition: "sun",
    conditionText: "Sunny",
    min: 15,
    max: 25,
    rainPct: 10,
    rainMin: 0,
    rainMax: 0,
    wind: 8,
    windDir: "SE",
    humidity: 60,
    uv: 8,
    et: 4.2,
    impact: "Irrigate if soil moisture drops below 50%; weeding ideal",
    spray: "Good window",
    tone: "low",
    workHours: "06:30–17:00",
    swahili: "Jua · piga maji kama inahitajika",
  },
  {
    id: "fd-5",
    label: "Day 5",
    date: "Wed",
    condition: "sun",
    conditionText: "Sunny and dry",
    min: 16,
    max: 26,
    rainPct: 5,
    rainMin: 0,
    rainMax: 0,
    wind: 10,
    windDir: "SE",
    humidity: 55,
    uv: 8,
    et: 4.5,
    impact: "Dry — monitor soil moisture, top-dress CAN before the next rain",
    spray: "Good window",
    tone: "low",
    workHours: "06:30–17:00",
    swahili: "Kavu · angalia unyevu wa udongo",
  },
  {
    id: "fd-6",
    label: "Day 6",
    date: "Thu",
    condition: "cloud",
    conditionText: "Cloudy, mostly dry",
    min: 15,
    max: 24,
    rainPct: 30,
    rainMin: 0,
    rainMax: 3,
    wind: 12,
    windDir: "E",
    humidity: 65,
    uv: 6,
    et: 3.8,
    impact: "No action needed — good day for harvesting kale and weeding",
    spray: "Good window",
    tone: "low",
    workHours: "07:00–16:30",
    swahili: "Hakuna hatari · siku ya kuvuna sukuma",
  },
  {
    id: "fd-7",
    label: "Day 7",
    date: "Fri",
    condition: "rain",
    conditionText: "Rain returning",
    min: 14,
    max: 22,
    rainPct: 60,
    rainMin: 5,
    rainMax: 10,
    wind: 18,
    windDir: "NE",
    humidity: 75,
    uv: 4,
    et: 2.9,
    impact: "Rain returning — finish sprays today, secure the nursery covers",
    spray: "Limited",
    tone: "medium",
    workHours: "07:00–13:00",
    swahili: "Mvua inarudi · maliza kupulizia",
  },
];

/* ===================== 8.3 Seasonal outlook ===================== */

export interface SeasonMonth {
  id: string;
  month: string;
  rainfall: string;
  rainMid: number;
  vsAverage: string;
  tone: WxTone;
  temp: string;
  onset: string;
  cessation: string;
  drySpell: string;
  dryTone: WxTone;
  flood: string;
  floodTone: WxTone;
  rainyDays: string;
  dekadal: { label: string; rain: number; note: string }[];
  headline: string;
}

export const SEASONAL_OUTLOOK: SeasonMonth[] = [
  {
    id: "sm-oct",
    month: "October 2026",
    rainfall: "100–150 mm",
    rainMid: 125,
    vsAverage: "Near normal",
    tone: "low",
    temp: "18–26°C",
    onset: "Week 1 October ✅",
    cessation: "—",
    drySpell: "Low",
    dryTone: "low",
    flood: "Low",
    floodTone: "low",
    rainyDays: "12–15",
    dekadal: [
      {
        label: "Oct 1–10",
        rain: 48,
        note: "Onset confirmed Oct 4 · land prep closed",
      },
      {
        label: "Oct 11–20",
        rain: 41,
        note: "Transplanting window · soil at field capacity",
      },
      {
        label: "Oct 21–31",
        rain: 36,
        note: "Steady rains · no irrigation needed",
      },
    ],
    headline:
      "Reliable onset gave a clean transplanting window for the cabbage.",
  },
  {
    id: "sm-nov",
    month: "November 2026",
    rainfall: "150–250 mm",
    rainMid: 200,
    vsAverage: "Above normal (+22%)",
    tone: "high",
    temp: "17–25°C",
    onset: "—",
    cessation: "—",
    drySpell: "Low",
    dryTone: "low",
    flood: "Moderate",
    floodTone: "medium",
    rainyDays: "15–20",
    dekadal: [
      {
        label: "Nov 1–10",
        rain: 74,
        note: "Wettest ten days · 19 mm on Nov 6",
      },
      {
        label: "Nov 11–20",
        rain: 82,
        note: "Black rot pressure peaks · keep drains open",
      },
      {
        label: "Nov 21–30",
        rain: 58,
        note: "Easing slightly · good heading conditions",
      },
    ],
    headline:
      "Above-normal rain = high humidity, so fungicide discipline decides the crop.",
  },
  {
    id: "sm-dec",
    month: "December 2026",
    rainfall: "80–140 mm",
    rainMid: 110,
    vsAverage: "Near normal",
    tone: "medium",
    temp: "18–26°C",
    onset: "—",
    cessation: "Mid-December",
    drySpell: "Moderate (mid-Dec)",
    dryTone: "medium",
    flood: "Low",
    floodTone: "low",
    rainyDays: "8–12",
    dekadal: [
      {
        label: "Dec 1–10",
        rain: 52,
        note: "Rains tapering · irrigation standby",
      },
      {
        label: "Dec 11–20",
        rain: 24,
        note: "Dry spell 14 days · cabbage heading needs water",
      },
      {
        label: "Dec 21–31",
        rain: 34,
        note: "Scattered showers · harvest prep",
      },
    ],
    headline:
      "A 14-day dry spell at heading is the season's single biggest risk.",
  },
];

export interface SeasonRisk {
  id: string;
  risk: string;
  swahili: string;
  level: WxTone;
  advisory: string;
  action: string;
  actionModal:
    | "spray"
    | "drainage"
    | "irrigation"
    | "scout"
    | "harvest-plan"
    | "cover";
  crop: string;
  window: string;
  cost: number;
}

export const SEASONAL_ADVISORY: SeasonRisk[] = [
  {
    id: "sr-blackrot",
    risk: "Black rot",
    swahili: "Kuoza kwa kabichi",
    level: "high",
    advisory:
      "Above-normal rain in November keeps humidity over 80%. Spray Mancozeb every 14 days and hold plant spacing at 45 cm × 45 cm for airflow.",
    action: "Book a fungicide spray",
    actionModal: "spray",
    crop: "Cabbage · Plot 1",
    window: "Now → 30 Nov",
    cost: 1450,
  },
  {
    id: "sr-waterlog",
    risk: "Waterlogging",
    swahili: "Kujaa maji",
    level: "medium",
    advisory:
      "The low corner of Plot 1 sits on clay. Cut drainage channels and keep raised beds at 20 cm — 19 mm fell on 6 Nov alone.",
    action: "Schedule drainage work",
    actionModal: "drainage",
    crop: "Cabbage · Plot 1 low corner",
    window: "Next 7 days",
    cost: 2400,
  },
  {
    id: "sr-dbm",
    risk: "Diamondback moth",
    swahili: "Nondo wa kabichi",
    level: "medium",
    advisory:
      "Wet weather favours caterpillars. Scout twice weekly from week 3 and rotate Emamectin with Bt to stop resistance.",
    action: "Add scouting task",
    actionModal: "scout",
    crop: "Cabbage · Plot 1 + Plot 3",
    window: "Weekly from week 3",
    cost: 1900,
  },
  {
    id: "sr-cutworm",
    risk: "Cutworm",
    swahili: "Rere",
    level: "low",
    advisory:
      "Past transplanting stage, so risk is reduced. Keep the plot edges weeded — cutworms hide in volunteer weeds.",
    action: "Edge weeding task",
    actionModal: "scout",
    crop: "Cabbage · Plot 1 edges",
    window: "Fortnightly",
    cost: 800,
  },
  {
    id: "sr-dryspell",
    risk: "Dry spell (Dec)",
    swahili: "Ukavu wa Desemba",
    level: "medium",
    advisory:
      "No significant rain from 15 Dec for ~14 days, right at heading. Plan supplementary drip irrigation for 0.5 acre.",
    action: "Plan irrigation",
    actionModal: "irrigation",
    crop: "Cabbage · Plot 1",
    window: "15–28 Dec",
    cost: 3600,
  },
  {
    id: "sr-harvest",
    risk: "Harvest rain damage",
    swahili: "Mvua wakati wa mavuno",
    level: "low",
    advisory:
      "January forecast is dry (10–20 mm), which is ideal. Harvest heads in the morning and grade before transport.",
    action: "Draft harvest plan",
    actionModal: "harvest-plan",
    crop: "Cabbage · Plot 1",
    window: "12–18 Jan 2027",
    cost: 0,
  },
];

export interface WeatherScenario {
  id: string;
  name: string;
  driver: string;
  onset: string;
  rainfall: string;
  yieldImpact: string;
  advisory: string;
  tone: WxTone;
  probability: number;
}

export const WEATHER_SCENARIOS: WeatherScenario[] = [
  {
    id: "sc-base",
    name: "Baseline (KMD ensemble median)",
    driver: "Neutral ENSO · weak positive IOD",
    onset: "Already started 4 Oct",
    rainfall: "340–420 mm for the season",
    yieldImpact: "Cabbage on plan · 9.5–10.5 t per 0.5 acre",
    advisory: "Follow the standard calendar. No change to planting dates.",
    tone: "low",
    probability: 55,
  },
  {
    id: "sc-nino",
    name: "El Niño wet (2023 replay)",
    driver: "Strong positive IOD · warm Indian Ocean",
    onset: "Early onset, late cessation",
    rainfall: "550–680 mm for the season",
    yieldImpact:
      "Yield −15% from waterlogging and black rot unless drains hold",
    advisory:
      "Dig main drains now, raise beds, budget KES 5,200 extra fungicide.",
    tone: "high",
    probability: 20,
  },
  {
    id: "sc-nina",
    name: "La Niña dry (2021 replay)",
    driver: "Negative IOD · cold Pacific",
    onset: "Normal onset, early cessation mid-Nov",
    rainfall: "180–240 mm for the season",
    yieldImpact: "Yield −25% without irrigation · heading failure likely",
    advisory: "Pre-book water bowsers and mulch cabbage rows immediately.",
    tone: "high",
    probability: 15,
  },
  {
    id: "sc-late",
    name: "Late-cessation mild wet",
    driver: "Neutral ENSO · persistent easterlies",
    onset: "Normal",
    rainfall: "420–480 mm, rains into January",
    yieldImpact:
      "Yield flat, but harvest grading drops 10% from head splitting",
    advisory:
      "Harvest early in the day, cut at firm head stage, avoid over-irrigating.",
    tone: "medium",
    probability: 10,
  },
];

/* ============ 8.4 Crop-specific weather prediction engine ============ */

export interface CropPeriod {
  id: string;
  period: string;
  days: string;
  stage: string;
  rain: string;
  rainMid: number;
  temp: string;
  need: string;
  match: string;
  tone: WxTone;
  advisory: string;
  waterBalance: number;
}

export interface CropWeatherPlan {
  id: string;
  crop: string;
  swahili: string;
  variety: string;
  county: string;
  plot: string;
  acres: number;
  planted: string;
  duration: string;
  totalRain: number;
  totalNeed: number;
  matchScore: number;
  verdict: string;
  symbol: string;
  periods: CropPeriod[];
}

export const CROP_WEATHER_PLANS: CropWeatherPlan[] = [
  {
    id: "cw-cabbage",
    crop: "Cabbage",
    swahili: "Kabichi",
    variety: "Gloria F1",
    county: "Kiambu",
    plot: "Plot 1: Shamba ya nyumba",
    acres: 0.5,
    planted: "20 Oct 2026",
    duration: "90 days (short-season)",
    totalRain: 235,
    totalNeed: 250,
    matchScore: 84,
    verdict:
      "Rain covers 94% of the season's water need — one irrigation top-up in mid-December.",
    symbol: "🥬",
    periods: [
      {
        id: "cb-1",
        period: "Oct 20 – Nov 2",
        days: "1–14",
        stage: "Establishment",
        rain: "30–50 mm",
        rainMid: 40,
        temp: "18–24°C",
        need: "Moist soil for root growth",
        match: "Good",
        tone: "low",
        advisory: "No irrigation needed. Keep seedling trays shaded at midday.",
        waterBalance: 6,
      },
      {
        id: "cb-2",
        period: "Nov 3 – Nov 16",
        days: "15–28",
        stage: "Vegetative",
        rain: "50–80 mm",
        rainMid: 65,
        temp: "17–24°C",
        need: "Adequate moisture, nitrogen",
        match: "Good",
        tone: "low",
        advisory: "Apply CAN top-dress and run weed control between rains.",
        waterBalance: 9,
      },
      {
        id: "cb-3",
        period: "Nov 17 – Nov 30",
        days: "29–42",
        stage: "Late vegetative",
        rain: "60–100 mm",
        rainMid: 80,
        temp: "17–25°C",
        need: "Continued moisture",
        match: "Good",
        tone: "medium",
        advisory: "Watch for black rot — wettest fortnight of the season.",
        waterBalance: 18,
      },
      {
        id: "cb-4",
        period: "Dec 1 – Dec 14",
        days: "43–56",
        stage: "Early heading",
        rain: "40–70 mm",
        rainMid: 55,
        temp: "18–26°C",
        need: "Moderate moisture",
        match: "Decreasing",
        tone: "medium",
        advisory: "May need irrigation. Test the drip lines and the pump now.",
        waterBalance: -3,
      },
      {
        id: "cb-5",
        period: "Dec 15 – Dec 28",
        days: "57–70",
        stage: "Heading",
        rain: "15–30 mm",
        rainMid: 22,
        temp: "18–27°C",
        need: "Moderate moisture",
        match: "Low",
        tone: "high",
        advisory:
          "Irrigate! A 14-day dry spell is likely at the most sensitive stage.",
        waterBalance: -22,
      },
      {
        id: "cb-6",
        period: "Dec 29 – Jan 11",
        days: "71–84",
        stage: "Maturity",
        rain: "10–20 mm",
        rainMid: 15,
        temp: "17–27°C",
        need: "Low water OK",
        match: "Good",
        tone: "low",
        advisory: "Reduce irrigation — too much water now splits heads.",
        waterBalance: -2,
      },
      {
        id: "cb-7",
        period: "Jan 12 – Jan 18",
        days: "85–90",
        stage: "Harvest",
        rain: "5–10 mm",
        rainMid: 7,
        temp: "17–28°C",
        need: "Dry weather ideal",
        match: "Perfect",
        tone: "low",
        advisory: "Harvest in dry conditions; grade and move within 24 hours.",
        waterBalance: 0,
      },
    ],
  },
  {
    id: "cw-maize",
    crop: "Maize",
    swahili: "Mahindi",
    variety: "H6213",
    county: "Uasin Gishu",
    plot: "Plot 2: Eldoret ridge block",
    acres: 2,
    planted: "15 Oct 2026",
    duration: "120 days (medium-season)",
    totalRain: 250,
    totalNeed: 300,
    matchScore: 78,
    verdict:
      "Grain fill lands on a drying trend — protect tasselling moisture and stop irrigation at maturity.",
    symbol: "🌽",
    periods: [
      {
        id: "mz-1",
        period: "Oct 15 – Oct 28",
        days: "1–14",
        stage: "Germination",
        rain: "25–40 mm",
        rainMid: 32,
        temp: "15–22°C",
        need: "Even moisture to 10 cm",
        match: "Good",
        tone: "low",
        advisory: "Good moisture for germination. Replant gaps by day 12.",
        waterBalance: 5,
      },
      {
        id: "mz-2",
        period: "Oct 29 – Nov 25",
        days: "15–42",
        stage: "Vegetative",
        rain: "80–130 mm",
        rainMid: 105,
        temp: "14–22°C",
        need: "High nitrogen, steady moisture",
        match: "Good",
        tone: "low",
        advisory: "Top dress CAN at week 5–6 while the soil is still moist.",
        waterBalance: 20,
      },
      {
        id: "mz-3",
        period: "Nov 26 – Dec 16",
        days: "43–63",
        stage: "Tasselling",
        rain: "50–80 mm",
        rainMid: 65,
        temp: "14–24°C",
        need: "Critical — water stress cuts grain fill",
        match: "Decreasing",
        tone: "medium",
        advisory:
          "Critical window. A 10-day dry break here costs up to 3 bags per acre.",
        waterBalance: -8,
      },
      {
        id: "mz-4",
        period: "Dec 17 – Jan 8",
        days: "64–85",
        stage: "Silking & grain fill",
        rain: "30–60 mm",
        rainMid: 45,
        temp: "15–25°C",
        need: "Moisture critical for grain filling",
        match: "Low",
        tone: "high",
        advisory:
          "Moisture critical. Scout for fall armyworm on the cobs weekly.",
        waterBalance: -18,
      },
      {
        id: "mz-5",
        period: "Jan 9 – Feb 12",
        days: "86–120",
        stage: "Maturity & dry-down",
        rain: "20–40 mm",
        rainMid: 30,
        temp: "15–26°C",
        need: "Dry-down for harvest",
        match: "Good",
        tone: "low",
        advisory:
          "Stop irrigation and let the crop dry. Shell at 13.5% moisture.",
        waterBalance: 2,
      },
    ],
  },
  {
    id: "cw-cane",
    crop: "Sugarcane",
    swahili: "Miwa",
    variety: "Co 421",
    county: "Kakamega",
    plot: "Plot 7: Mumias outgrower block",
    acres: 1.2,
    planted: "Oct 2026",
    duration: "18 months (long-season)",
    totalRain: 1450,
    totalNeed: 1500,
    matchScore: 88,
    verdict:
      "Two long-rains seasons carry the crop; the Jan–Feb dry phase needs weed control, not water.",
    symbol: "🎋",
    periods: [
      {
        id: "sc-1",
        period: "Oct – Dec 2026",
        days: "Months 0–3",
        stage: "Germination",
        rain: "Short rains: 300–500 mm",
        rainMid: 400,
        temp: "20–29°C",
        need: "Warm, moist sett bed",
        match: "Good",
        tone: "low",
        advisory: "Good establishment. Gap-fill with reserve setts in week 6.",
        waterBalance: 40,
      },
      {
        id: "sc-2",
        period: "Jan – Feb 2027",
        days: "Months 3–5",
        stage: "Tillering",
        rain: "Hot dry: 50–100 mm",
        rainMid: 75,
        temp: "19–31°C",
        need: "Weed-free, moderate water",
        match: "Decreasing",
        tone: "medium",
        advisory:
          "Irrigate if possible — weed control is critical in this phase.",
        waterBalance: -35,
      },
      {
        id: "sc-3",
        period: "Mar – May 2027",
        days: "Months 5–8",
        stage: "Grand growth",
        rain: "Long rains: 400–700 mm",
        rainMid: 550,
        temp: "19–29°C",
        need: "Peak water and nitrogen",
        match: "Good",
        tone: "low",
        advisory:
          "Peak growth. Apply nitrogen fertilizer early in the long rains.",
        waterBalance: 120,
      },
      {
        id: "sc-4",
        period: "Jun – Aug 2027",
        days: "Months 8–11",
        stage: "Grand growth (cool)",
        rain: "Cool dry: 100–200 mm",
        rainMid: 150,
        temp: "15–25°C",
        need: "Sustained moisture",
        match: "Decreasing",
        tone: "medium",
        advisory:
          "Irrigate for sustained growth; trash the crop to conserve moisture.",
        waterBalance: -60,
      },
      {
        id: "sc-5",
        period: "Sep – Oct 2027",
        days: "Months 11–13",
        stage: "Maturation",
        rain: "Short rains: 200–350 mm",
        rainMid: 275,
        temp: "18–28°C",
        need: "Less nitrogen, more potassium",
        match: "Good",
        tone: "low",
        advisory:
          "Reduce nitrogen and increase potassium for sucrose build-up.",
        waterBalance: 60,
      },
      {
        id: "sc-6",
        period: "Nov 2027 – Jan 2028",
        days: "Months 13–15",
        stage: "Ripening",
        rain: "Short rains taper: 100–200 mm",
        rainMid: 150,
        temp: "18–29°C",
        need: "Drying for sugar",
        match: "Good",
        tone: "low",
        advisory: "Stop irrigation so the cane concentrates sugar.",
        waterBalance: -20,
      },
      {
        id: "sc-7",
        period: "Feb – Mar 2028",
        days: "Months 15–18",
        stage: "Harvest ready",
        rain: "Hot dry: 50–100 mm",
        rainMid: 75,
        temp: "20–32°C",
        need: "Dry harvest weather",
        match: "Perfect",
        tone: "low",
        advisory:
          "Harvest in dry weather for better sucrose; book the mill slot early.",
        waterBalance: 0,
      },
    ],
  },
];

export interface EngineCropOption {
  id: string;
  crop: string;
  swahili: string;
  variety: string;
  county: string;
  duration: number;
  waterNeed: string;
  symbol: string;
}

export const ENGINE_CROP_LIBRARY: EngineCropOption[] = [
  {
    id: "ec-tomato",
    crop: "Tomato",
    swahili: "Nyanya",
    variety: "Kilele F1",
    county: "Kiambu",
    duration: 95,
    waterNeed: "High · drip",
    symbol: "🍅",
  },
  {
    id: "ec-potato",
    crop: "Potato",
    swahili: "Waru",
    variety: "Shangi",
    county: "Nyandarua",
    duration: 100,
    waterNeed: "Moderate",
    symbol: "🥔",
  },
  {
    id: "ec-bean",
    crop: "French bean",
    swahili: "Maharagwe ya kijani",
    variety: "Samantha",
    county: "Meru",
    duration: 60,
    waterNeed: "Moderate",
    symbol: "🫘",
  },
  {
    id: "ec-rice",
    crop: "Rice (irrigated)",
    swahili: "Mchele",
    variety: "Basmati 370",
    county: "Kisumu (NIB)",
    duration: 130,
    waterNeed: "Very high",
    symbol: "🌾",
  },
  {
    id: "ec-gram",
    crop: "Green gram",
    swahili: "Ndengu",
    variety: "KSG 20",
    county: "Makueni",
    duration: 70,
    waterNeed: "Low",
    symbol: "🫛",
  },
  {
    id: "ec-onion",
    crop: "Onion",
    swahili: "Vitunguu",
    variety: "Red Passion F1",
    county: "Kieni West",
    duration: 120,
    waterNeed: "Moderate",
    symbol: "🧅",
  },
  {
    id: "ec-sorghum",
    crop: "Sorghum",
    swahili: "Mtama",
    variety: "Seredo",
    county: "Machakos",
    duration: 110,
    waterNeed: "Low",
    symbol: "🌾",
  },
  {
    id: "ec-avocado",
    crop: "Avocado",
    swahili: "Parachichi",
    variety: "Hass",
    county: "Murang'a",
    duration: 365,
    waterNeed: "Moderate · young trees",
    symbol: "🥑",
  },
];

/* ==================== 8.5 Planting window advisor ==================== */

export interface PlantingWindow {
  id: string;
  county: string;
  aez: string;
  crop: string;
  swahili: string;
  variety: string;
  group: "Vegetable" | "Cereal" | "Legume" | "Industrial" | "Fruit" | "Root";
  best: string;
  good: string;
  risky: string;
  avoid: string;
  note: string;
  confidence: number;
  /* month index 0=Jan … 11=Dec; 3=best, 2=good, 1=risky, 0=avoid, -1 blank */
  track: number[];
}

export const PLANTING_WINDOWS: PlantingWindow[] = [
  {
    id: "pw-01",
    county: "Kiambu",
    aez: "UM1",
    crop: "Cabbage",
    swahili: "Kabichi",
    variety: "Gloria F1",
    group: "Vegetable",
    best: "Oct 1 – Nov 15",
    good: "Mar 1 – Apr 15",
    risky: "Jun – Aug (irrigated only)",
    avoid: "Jan – Feb (too hot, aphids)",
    note: "Short-rains cabbage escapes the January heat that drives aphid and diamondback pressure.",
    confidence: 91,
    track: [0, 0, 2, 3, 1, 1, 1, 1, 3, 3, 3, 2],
  },
  {
    id: "pw-02",
    county: "Kiambu",
    aez: "UM1",
    crop: "Maize",
    swahili: "Mahindi",
    variety: "H6213",
    group: "Cereal",
    best: "Mar 15 – Apr 15",
    good: "Oct 15 – Nov 15",
    risky: "—",
    avoid: "May – Sep (wrong season)",
    note: "Long rains are the main crop; short-rains maize is a bonus on well-drained slopes.",
    confidence: 88,
    track: [0, 0, 3, 3, 0, 0, 0, 0, 0, 2, 2, 0],
  },
  {
    id: "pw-03",
    county: "Uasin Gishu",
    aez: "UM2/UM3",
    crop: "Maize",
    swahili: "Mahindi",
    variety: "H6213",
    group: "Cereal",
    best: "Mar 1 – Apr 15",
    good: "Oct 15 – Nov 15",
    risky: "—",
    avoid: "May – Sep",
    note: "2,100 m altitude means cool nights — never plant after 15 April or grain will not fill.",
    confidence: 93,
    track: [0, 0, 3, 3, 0, 0, 0, 0, 0, 2, 2, 0],
  },
  {
    id: "pw-04",
    county: "Kakamega",
    aez: "LH1/LM1",
    crop: "Sugarcane",
    swahili: "Miwa",
    variety: "Co 421",
    group: "Industrial",
    best: "Oct – Nov",
    good: "Mar – May",
    risky: "Jan – Feb (dry)",
    avoid: "—",
    note: "Planting at short-rains onset gives 18-month cane a full second rainy season before harvest.",
    confidence: 86,
    track: [1, 1, 2, 2, 2, 0, 0, 0, 0, 3, 3, 0],
  },
  {
    id: "pw-05",
    county: "Machakos",
    aez: "LM4/LM5",
    crop: "Sorghum",
    swahili: "Mtama",
    variety: "Seredo",
    group: "Cereal",
    best: "Oct 15 – Nov 30",
    good: "Mar 1 – Apr 15",
    risky: "—",
    avoid: "May – Sep (too dry without irrigation)",
    note: "Drought-tolerant, but even Seredo needs the 300 mm that short rains reliably deliver.",
    confidence: 84,
    track: [0, 0, 2, 3, 0, 0, 0, 0, 0, 2, 3, 3],
  },
  {
    id: "pw-06",
    county: "Kilifi",
    aez: "LM3/CL1",
    crop: "Cashew",
    swahili: "Korosho",
    variety: "Local selections (Kazima, Bimbi)",
    group: "Fruit",
    best: "—",
    good: "—",
    risky: "—",
    avoid: "Perennial, rainfall dependent",
    note: "Perennial tree crop — plan around flowering (Jun–Aug) and harvest (Oct–Jan) instead of planting windows.",
    confidence: 78,
    track: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  },
  {
    id: "pw-07",
    county: "Nyandarua",
    aez: "UM1/UM2",
    crop: "Potato",
    swahili: "Waru",
    variety: "Shangi",
    group: "Root",
    best: "Mar 1 – Apr 30",
    good: "Oct 1 – Nov 30",
    risky: "—",
    avoid: "May – Sep (too cold/wet for some varieties)",
    note: "Frost risk on the moorland edge — plant after the last frost and ridge high.",
    confidence: 89,
    track: [0, 0, 3, 3, 0, 0, 0, 0, 0, 3, 2, 2],
  },
  {
    id: "pw-08",
    county: "Kisumu",
    aez: "LH2/LM2",
    crop: "Rice (NIB scheme)",
    swahili: "Mchele",
    variety: "Basmati 370",
    group: "Cereal",
    best: "Aug – Sep",
    good: "Jan – Feb",
    risky: "—",
    avoid: "Dry periods",
    note: "Scheme water allocation, not rainfall, sets the calendar — book the NIB nursery slot early.",
    confidence: 90,
    track: [2, 2, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0],
  },
  {
    id: "pw-09",
    county: "Nakuru",
    aez: "UM3",
    crop: "Wheat",
    swahili: "Ngano",
    variety: "Eagle 10",
    group: "Cereal",
    best: "Apr – May",
    good: "Oct – Nov",
    risky: "—",
    avoid: "Jun – Sep (harvest, not planting)",
    note: "Long-rains wheat on the Mau escarpment needs rust-tolerant seed and a clean seedbed.",
    confidence: 85,
    track: [0, 0, 0, 3, 3, 0, 0, 0, 0, 2, 2, 0],
  },
  {
    id: "pw-10",
    county: "Meru",
    aez: "UM2",
    crop: "French bean",
    swahili: "Maharagwe ya kijani",
    variety: "Samantha",
    group: "Legume",
    best: "Mar – Apr",
    good: "Sep – Oct",
    risky: "Nov – Dec (export prices drop)",
    avoid: "—",
    note: "Export grades need dry harvest weather — target the Sep window for the best Euro prices.",
    confidence: 87,
    track: [0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 1, 1],
  },
  {
    id: "pw-11",
    county: "Makueni",
    aez: "LM4",
    crop: "Green gram",
    swahili: "Ndengu",
    variety: "KSG 20",
    group: "Legume",
    best: "Oct 10 – Nov 20",
    good: "Mar 5 – Apr 10",
    risky: "—",
    avoid: "Dry spells without a follow-up shower",
    note: "Plant on the first rains and thin to 15 cm — KSG 20 matures in 65–70 days.",
    confidence: 83,
    track: [0, 0, 2, 3, 0, 0, 0, 0, 0, 3, 3, 0],
  },
  {
    id: "pw-12",
    county: "Murang'a",
    aez: "UM2",
    crop: "Avocado",
    swahili: "Parachichi",
    variety: "Hass",
    group: "Fruit",
    best: "Mar – Apr",
    good: "Oct – Nov",
    risky: "Jan – Feb (dry, needs irrigation)",
    avoid: "—",
    note: "Young Hass trees need 3 dry-season irrigations in year one — budget KES 400 per tree.",
    confidence: 82,
    track: [1, 1, 2, 3, 3, 0, 0, 0, 0, 2, 3, 0],
  },
];

export const WINDOW_LEGEND = [
  { value: 3, label: "Best window", tone: "low" as WxTone },
  { value: 2, label: "Good window", tone: "medium" as WxTone },
  { value: 1, label: "Risky", tone: "high" as WxTone },
  { value: 0, label: "Avoid", tone: "neutral" as WxTone },
];

/* ===================== 8.6 Extreme weather alerts ===================== */

export interface ExtremeAlert {
  id: string;
  type: string;
  swahili: string;
  severity: WxSeverity;
  tone: WxTone;
  message: string;
  action: string;
  actionModal: "drainage" | "cover" | "irrigation" | "sms" | "shelter";
  issued: string;
  valid: string;
  counties: string;
  affected: string;
  source: string;
  ack: boolean;
}

export const EXTREME_ALERTS: ExtremeAlert[] = [
  {
    id: "al-01",
    type: "Heavy rain",
    swahili: "Mvua kubwa",
    severity: "Watch",
    tone: "medium",
    message:
      "20–30 mm expected in the next 6 hours in Kiambu. Check drainage in the cabbage field before 15:00.",
    action: "Check drainage",
    actionModal: "drainage",
    issued: "12 min ago",
    valid: "Today 15:00 – 21:00",
    counties: "Kiambu · Githunguri, Limuru",
    affected: "Plot 1 cabbage · Plot 3 beans",
    source: "KMD nowcast + IBM 1 km",
    ack: false,
  },
  {
    id: "al-02",
    type: "Flood warning",
    swahili: "Onyo la mafuriko",
    severity: "Warning",
    tone: "high",
    message:
      "River Githurai rising. Low-lying farms in Githunguri sub-county are at risk of surface flooding overnight.",
    action: "Move livestock, secure inputs",
    actionModal: "shelter",
    issued: "48 min ago",
    valid: "Tonight 20:00 – 06:00",
    counties: "Kiambu · Githunguri river belt",
    affected: "Store · 6 dairy cattle · 40 bags of seed",
    source: "Kenya Met + WRMA gauges",
    ack: false,
  },
  {
    id: "al-03",
    type: "Dry spell",
    swahili: "Ukavu",
    severity: "Advisory",
    tone: "medium",
    message:
      "No significant rain expected for 14 days from 15 Dec. Cabbage in heading stage needs supplementary irrigation.",
    action: "Plan irrigation",
    actionModal: "irrigation",
    issued: "3 hrs ago",
    valid: "15 Dec – 28 Dec",
    counties: "Kiambu · central highlands",
    affected: "Plot 1 cabbage (heading)",
    source: "KMD seasonal + NASA POWER",
    ack: true,
  },
  {
    id: "al-04",
    type: "Frost alert",
    swahili: "Baridi kali (ganda)",
    severity: "Warning",
    tone: "high",
    message:
      "Temperatures may drop to 2°C in Nyandarua tonight. Frost risk for potatoes and beans on the moorland edge.",
    action: "Cover crops, delay planting",
    actionModal: "cover",
    issued: "5 hrs ago",
    valid: "Tonight 02:00 – 06:00",
    counties: "Nyandarua · Ol Kalou, Engineer",
    affected: "Seed potato nursery · 0.4 acre beans",
    source: "KMD Ol Kalou AWS 052",
    ack: false,
  },
  {
    id: "al-05",
    type: "Wind warning",
    swahili: "Upepo mkali",
    severity: "Watch",
    tone: "medium",
    message:
      "Strong winds (40 km/h gusts) expected between 14:00 and 17:00. Secure greenhouse structures and shade nets.",
    action: "Secure structures",
    actionModal: "cover",
    issued: "6 hrs ago",
    valid: "Today 14:00 – 17:00",
    counties: "Kiambu · Limuru, Kikuyu",
    affected: "Plot 4 tomato tunnel · nursery shade net",
    source: "IBM Weather nowcast",
    ack: true,
  },
  {
    id: "al-06",
    type: "Hail",
    swahili: "Ganduarobaini",
    severity: "Extreme",
    tone: "high",
    message:
      "Hail possible in the Kericho highlands this afternoon. Protect tea nurseries and vegetable seedbeds.",
    action: "Cover if possible",
    actionModal: "cover",
    issued: "Yesterday",
    valid: "Today 13:00 – 17:00",
    counties: "Kericho · Bomet",
    affected: "Outgrower nurseries (co-op members)",
    source: "KMD radar inference + WISER mast",
    ack: true,
  },
  {
    id: "al-07",
    type: "Thunderstorm",
    swahili: "Radi",
    severity: "Warning",
    tone: "high",
    message:
      "Thunderstorms between 15:00 and 18:00. Stop field work, put down knapsack sprayers and leave open ground.",
    action: "Notify workers to stop",
    actionModal: "sms",
    issued: "1 hr ago",
    valid: "Today 15:00 – 18:00",
    counties: "Kiambu · Murang'a",
    affected: "6 casual workers in the field",
    source: "IBM Weather lightning grid",
    ack: false,
  },
  {
    id: "al-08",
    type: "Heat wave",
    swahili: "Joto kali",
    severity: "Watch",
    tone: "medium",
    message:
      "Three consecutive days above 32°C in Machakos. Irrigate before 09:00 and mulch the green gram rows.",
    action: "Schedule early irrigation",
    actionModal: "irrigation",
    issued: "Yesterday",
    valid: "Next 3 days",
    counties: "Machakos · Makueni",
    affected: "Outgrower green gram blocks",
    source: "NASA POWER + KMD",
    ack: true,
  },
  {
    id: "al-09",
    type: "Locust movement",
    swahili: "Nzige",
    severity: "Advisory",
    tone: "medium",
    message:
      "A small desert locust swarm was reported in Baringo. Wind trajectory does not reach Kiambu this week — keep scouting.",
    action: "Add scouting task",
    actionModal: "sms",
    issued: "2 days ago",
    valid: "This week",
    counties: "Baringo · Laikipia",
    affected: "Monitoring only",
    source: "FAO DLIS + DLCO-EA",
    ack: true,
  },
  {
    id: "al-10",
    type: "Dense fog",
    swahili: "Ukungu mzito",
    severity: "Advisory",
    tone: "low",
    message:
      "Dense morning fog with visibility under 200 m until 09:30. Delay foliar sprays and slow tractor work.",
    action: "Delay foliar spray",
    actionModal: "sms",
    issued: "Today 05:40",
    valid: "Today until 09:30",
    counties: "Nyandarua · Kiambu highlands",
    affected: "All field operations",
    source: "GrowMO gauge GTH-11",
    ack: false,
  },
];

export interface AlertArchiveRow {
  id: string;
  date: string;
  type: string;
  severity: WxSeverity;
  tone: WxTone;
  detail: string;
  outcome: string;
  loss: number;
}

export const ALERT_ARCHIVE: AlertArchiveRow[] = [
  {
    id: "ar-01",
    date: "28 Oct 2026",
    type: "Heavy rain",
    severity: "Warning",
    tone: "medium",
    detail: "34 mm in 5 hours · Githunguri",
    outcome: "Drains held · no lodging",
    loss: 0,
  },
  {
    id: "ar-02",
    date: "21 Oct 2026",
    type: "Wind",
    severity: "Watch",
    tone: "medium",
    detail: "38 km/h gusts · nursery shade net torn",
    outcome: "Net replaced KES 3,200",
    loss: 3200,
  },
  {
    id: "ar-03",
    date: "14 Oct 2026",
    type: "Dry spell",
    severity: "Advisory",
    tone: "medium",
    detail: "9 rain-free days before onset",
    outcome: "Transplanting delayed 6 days",
    loss: 0,
  },
  {
    id: "ar-04",
    date: "06 Nov 2026",
    type: "Heavy rain",
    severity: "Warning",
    tone: "high",
    detail: "19 mm overnight · low corner waterlogged",
    outcome: "42 cabbage seedlings lost",
    loss: 1680,
  },
  {
    id: "ar-05",
    date: "02 Sep 2026",
    type: "Frost",
    severity: "Watch",
    tone: "high",
    detail: "3.1°C at Nyandarua partner farm",
    outcome: "Potato leaf scorch on 0.1 acre",
    loss: 4500,
  },
  {
    id: "ar-06",
    date: "18 Aug 2026",
    type: "Hail",
    severity: "Extreme",
    tone: "high",
    detail: "Kericho · 8-minute hail burst",
    outcome: "Co-op nursery loss, insured",
    loss: 12000,
  },
  {
    id: "ar-07",
    date: "04 Oct 2026",
    type: "Onset confirmed",
    severity: "Advisory",
    tone: "low",
    detail: "Season onset 4 Oct · 22 mm in 3 days",
    outcome: "Land prep closed on time",
    loss: 0,
  },
  {
    id: "ar-08",
    date: "12 Jul 2026",
    type: "Cold spell",
    severity: "Advisory",
    tone: "medium",
    detail: "10 days below 12°C minimum",
    outcome: "Kale growth slowed 2 weeks",
    loss: 0,
  },
];

/* ===================== 8.7 Historical data ===================== */

export interface HistoryMonth {
  id: string;
  month: string;
  rain: number;
  minT: number;
  maxT: number;
  rainyDays: number;
  drySpell: number;
  note: string;
}

export const HISTORICAL_MONTHLY: HistoryMonth[] = [
  {
    id: "hm-01",
    month: "Jan",
    rain: 40,
    minT: 12,
    maxT: 25,
    rainyDays: 5,
    drySpell: 60,
    note: "Harvest month — dry weather is a friend here.",
  },
  {
    id: "hm-02",
    month: "Feb",
    rain: 30,
    minT: 13,
    maxT: 27,
    rainyDays: 3,
    drySpell: 75,
    note: "Hottest, driest month. Aphid and thrips pressure peaks.",
  },
  {
    id: "hm-03",
    month: "Mar",
    rain: 80,
    minT: 14,
    maxT: 26,
    rainyDays: 10,
    drySpell: 20,
    note: "Long-rains onset — land prep must be finished by 15 Mar.",
  },
  {
    id: "hm-04",
    month: "Apr",
    rain: 200,
    minT: 14,
    maxT: 24,
    rainyDays: 18,
    drySpell: 5,
    note: "Wettest month. Nitrogen leaches — split applications.",
  },
  {
    id: "hm-05",
    month: "May",
    rain: 180,
    minT: 13,
    maxT: 23,
    rainyDays: 16,
    drySpell: 10,
    note: "Blight and rust pressure on potatoes and wheat.",
  },
  {
    id: "hm-06",
    month: "Jun",
    rain: 50,
    minT: 11,
    maxT: 22,
    rainyDays: 5,
    drySpell: 40,
    note: "Cool and dry — best harvest window for cereals.",
  },
  {
    id: "hm-07",
    month: "Jul",
    rain: 30,
    minT: 10,
    maxT: 21,
    rainyDays: 3,
    drySpell: 60,
    note: "Coldest month. Frost risk above 2,200 m.",
  },
  {
    id: "hm-08",
    month: "Aug",
    rain: 30,
    minT: 10,
    maxT: 22,
    rainyDays: 3,
    drySpell: 55,
    note: "Dry and windy — good for drying maize and beans.",
  },
  {
    id: "hm-09",
    month: "Sep",
    rain: 40,
    minT: 11,
    maxT: 24,
    rainyDays: 5,
    drySpell: 45,
    note: "Land prep for short rains. Watch for early onset.",
  },
  {
    id: "hm-10",
    month: "Oct",
    rain: 120,
    minT: 13,
    maxT: 24,
    rainyDays: 12,
    drySpell: 15,
    note: "Short-rains onset. Prime transplanting month.",
  },
  {
    id: "hm-11",
    month: "Nov",
    rain: 180,
    minT: 13,
    maxT: 23,
    rainyDays: 16,
    drySpell: 10,
    note: "Peak of the short rains. Fungicide discipline decides the crop.",
  },
  {
    id: "hm-12",
    month: "Dec",
    rain: 90,
    minT: 12,
    maxT: 24,
    rainyDays: 9,
    drySpell: 25,
    note: "Rains taper mid-month — irrigation standby from 10 Dec.",
  },
];

export interface HistoryYear {
  id: string;
  year: number;
  rain: number;
  anomaly: number;
  onset: string;
  cessation: string;
  rainyDays: number;
  event: string;
  tone: WxTone;
  yieldNote: string;
}

export const HISTORICAL_YEARS: HistoryYear[] = [
  {
    id: "hy-2025",
    year: 2025,
    rain: 340,
    anomaly: 6,
    onset: "9 Oct",
    cessation: "22 Dec",
    rainyDays: 34,
    event: "Near-normal short rains",
    tone: "low",
    yieldNote: "Cabbage 10.2 t/0.5 acre · on plan",
  },
  {
    id: "hy-2024",
    year: 2024,
    rain: 295,
    anomaly: -8,
    onset: "14 Oct",
    cessation: "12 Dec",
    rainyDays: 31,
    event: "Slightly dry, early cessation",
    tone: "medium",
    yieldNote: "One irrigation round saved the heading stage",
  },
  {
    id: "hy-2023",
    year: 2023,
    rain: 620,
    anomaly: 94,
    onset: "26 Sep",
    cessation: "18 Jan",
    rainyDays: 52,
    event: "El Niño floods",
    tone: "high",
    yieldNote: "Waterlogging cost ~22% of the cabbage block",
  },
  {
    id: "hy-2022",
    year: 2022,
    rain: 260,
    anomaly: -19,
    onset: "18 Oct",
    cessation: "30 Nov",
    rainyDays: 27,
    event: "Third-season La Niña drought",
    tone: "high",
    yieldNote: "Maize 14 bags/acre vs 26 normal",
  },
  {
    id: "hy-2021",
    year: 2021,
    rain: 180,
    anomaly: -44,
    onset: "2 Nov",
    cessation: "26 Nov",
    rainyDays: 19,
    event: "Severe La Niña drought",
    tone: "high",
    yieldNote: "Cabbage failed without irrigation",
  },
  {
    id: "hy-2020",
    year: 2020,
    rain: 355,
    anomaly: 11,
    onset: "7 Oct",
    cessation: "28 Dec",
    rainyDays: 36,
    event: "La Niña, but reliable short rains",
    tone: "low",
    yieldNote: "Strong season · black rot managed well",
  },
  {
    id: "hy-2019",
    year: 2019,
    rain: 205,
    anomaly: -36,
    onset: "22 Oct",
    cessation: "5 Dec",
    rainyDays: 22,
    event: "Delayed onset, short season",
    tone: "high",
    yieldNote: "Late planting cut the cabbage cycle by 12 days",
  },
  {
    id: "hy-2018",
    year: 2018,
    rain: 285,
    anomaly: -11,
    onset: "11 Oct",
    cessation: "20 Dec",
    rainyDays: 30,
    event: "Near-normal",
    tone: "medium",
    yieldNote: "Average season · prices were good",
  },
  {
    id: "hy-2017",
    year: 2017,
    rain: 310,
    anomaly: -3,
    onset: "6 Oct",
    cessation: "24 Dec",
    rainyDays: 33,
    event: "Normal short rains",
    tone: "low",
    yieldNote: "Baseline season for budgeting",
  },
  {
    id: "hy-2016",
    year: 2016,
    rain: 240,
    anomaly: -25,
    onset: "16 Oct",
    cessation: "10 Dec",
    rainyDays: 25,
    event: "Below-normal, early stop",
    tone: "medium",
    yieldNote: "Beans did better than cabbage that year",
  },
];

export const LONG_TERM_AVG = {
  seasonRain: 320,
  seasonDays: 30,
  onset: "8 Oct",
  cessation: "20 Dec",
};

/* ===================== Stations, observations, people ===================== */

export interface WeatherStation {
  id: string;
  name: string;
  county: string;
  subCounty: string;
  kind: string;
  altitude: string;
  distance: number;
  status: "online" | "degraded" | "offline";
  uptime: number;
  lastPing: string;
  sensors: string;
  custodian: string;
  phone: string;
  accuracy: number;
}

export const WEATHER_STATIONS: WeatherStation[] = [
  {
    id: "st-01",
    name: "KMD Githunguri AWS 034",
    county: "Kiambu",
    subCounty: "Githunguri",
    kind: "Kenya Met automatic",
    altitude: "1,830 m",
    distance: 2.4,
    status: "online",
    uptime: 99.2,
    lastPing: "4 min ago",
    sensors: "Temp · RH · rain · wind · pressure · soil",
    custodian: "KMD Kiambu office",
    phone: "0722 415 908",
    accuracy: 94,
  },
  {
    id: "st-02",
    name: "GrowMO Gauge GTH-11",
    county: "Kiambu",
    subCounty: "Githunguri",
    kind: "GrowMO community gauge",
    altitude: "1,845 m",
    distance: 0.8,
    status: "online",
    uptime: 96.4,
    lastPing: "9 min ago",
    sensors: "Rain · soil moisture · leaf wetness",
    custodian: "Mary Wanjiku",
    phone: "0712 345 678",
    accuracy: 90,
  },
  {
    id: "st-03",
    name: "Tegus Farm Station",
    county: "Kiambu",
    subCounty: "Githunguri",
    kind: "Private automatic",
    altitude: "1,815 m",
    distance: 1.9,
    status: "online",
    uptime: 97.8,
    lastPing: "22 min ago",
    sensors: "Temp · RH · rain · wind",
    custodian: "Tegus Farm Ltd",
    phone: "0733 220 118",
    accuracy: 91,
  },
  {
    id: "st-04",
    name: "KMD Kiambu Town AWS 021",
    county: "Kiambu",
    subCounty: "Kiambu Town",
    kind: "Kenya Met automatic",
    altitude: "1,720 m",
    distance: 6.1,
    status: "online",
    uptime: 98.6,
    lastPing: "11 min ago",
    sensors: "Full synoptic set",
    custodian: "KMD Kiambu office",
    phone: "0722 415 908",
    accuracy: 93,
  },
  {
    id: "st-05",
    name: "KMD Limuru AWS 018",
    county: "Kiambu",
    subCounty: "Limuru",
    kind: "Kenya Met automatic",
    altitude: "2,050 m",
    distance: 11.3,
    status: "online",
    uptime: 95.1,
    lastPing: "38 min ago",
    sensors: "Temp · RH · rain · wind",
    custodian: "KMD Kiambu office",
    phone: "0722 415 908",
    accuracy: 92,
  },
  {
    id: "st-06",
    name: "CoRI Ruiru Met Plot",
    county: "Kiambu",
    subCounty: "Ruiru",
    kind: "Research station",
    altitude: "1,560 m",
    distance: 14.7,
    status: "online",
    uptime: 99.0,
    lastPing: "1 hr ago",
    sensors: "Full + evaporation pan",
    custodian: "Coffee Research Institute",
    phone: "0720 664 331",
    accuracy: 95,
  },
  {
    id: "st-07",
    name: "NASA POWER grid cell",
    county: "Kiambu",
    subCounty: "0.5° cell 1.0S 36.5E",
    kind: "Satellite reanalysis",
    altitude: "1,780 m (model)",
    distance: 0,
    status: "online",
    uptime: 100,
    lastPing: "Daily 05:00",
    sensors: "Radiation · ET₀ · rain · temp",
    custodian: "NASA GES DISC",
    phone: "—",
    accuracy: 86,
  },
  {
    id: "st-08",
    name: "IBM Weather nowcast",
    county: "National",
    subCounty: "1 km grid",
    kind: "Commercial nowcast",
    altitude: "—",
    distance: 0,
    status: "online",
    uptime: 99.9,
    lastPing: "Every 10 min",
    sensors: "Radar-blended rain · lightning",
    custodian: "The Weather Company",
    phone: "—",
    accuracy: 88,
  },
  {
    id: "st-09",
    name: "GrowMO Gauge GTH-24",
    county: "Kiambu",
    subCounty: "Githiga",
    kind: "GrowMO community gauge",
    altitude: "1,880 m",
    distance: 3.6,
    status: "degraded",
    uptime: 71.5,
    lastPing: "2 days ago",
    sensors: "Rain only",
    custodian: "James Gichuru",
    phone: "0741 556 677",
    accuracy: 74,
  },
  {
    id: "st-10",
    name: "WISER Kabete Met Mast",
    county: "Kiambu",
    subCounty: "Kabete",
    kind: "University research mast",
    altitude: "1,940 m",
    distance: 17.2,
    status: "online",
    uptime: 98.2,
    lastPing: "16 min ago",
    sensors: "Boundary layer · rain · wind profile",
    custodian: "University of Nairobi",
    phone: "0726 778 402",
    accuracy: 96,
  },
  {
    id: "st-11",
    name: "KMD Nyandarua Ol Kalou AWS 052",
    county: "Nyandarua",
    subCounty: "Ol Kalou",
    kind: "Kenya Met automatic",
    altitude: "2,340 m",
    distance: 38.4,
    status: "online",
    uptime: 97.1,
    lastPing: "26 min ago",
    sensors: "Temp · RH · rain · soil",
    custodian: "KMD Nyandarua",
    phone: "0735 990 214",
    accuracy: 92,
  },
  {
    id: "st-12",
    name: "KMD Thika AWS 041",
    county: "Kiambu",
    subCounty: "Thika",
    kind: "Kenya Met automatic",
    altitude: "1,520 m",
    distance: 24.6,
    status: "offline",
    uptime: 0,
    lastPing: "18 days ago",
    sensors: "Temp · RH · rain",
    custodian: "KMD Kiambu office",
    phone: "0722 415 908",
    accuracy: 0,
  },
];

export interface GaugeObservation {
  id: string;
  date: string;
  time: string;
  plot: string;
  gaugeMm: number;
  stationMm: number;
  by: string;
  note: string;
  tone: WxTone;
  photo: boolean;
}

export const GAUGE_OBSERVATIONS: GaugeObservation[] = [
  {
    id: "go-01",
    date: "13 Nov 2026",
    time: "07:05",
    plot: "Plot 1 low corner",
    gaugeMm: 5.2,
    stationMm: 5.0,
    by: "Mary Wanjiku",
    note: "Overnight shower · puddles in the low corner",
    tone: "medium",
    photo: true,
  },
  {
    id: "go-02",
    date: "12 Nov 2026",
    time: "07:10",
    plot: "Plot 1",
    gaugeMm: 8.4,
    stationMm: 8.0,
    by: "Joseph Kamau",
    note: "Steady rain from 21:00",
    tone: "medium",
    photo: false,
  },
  {
    id: "go-03",
    date: "10 Nov 2026",
    time: "06:55",
    plot: "Plot 3",
    gaugeMm: 1.6,
    stationMm: 2.0,
    by: "Grace Njeri",
    note: "Light drizzle, leaves wet till 09:00",
    tone: "low",
    photo: false,
  },
  {
    id: "go-04",
    date: "06 Nov 2026",
    time: "07:20",
    plot: "Plot 1 low corner",
    gaugeMm: 19.4,
    stationMm: 18.8,
    by: "Mary Wanjiku",
    note: "Heaviest fall of the season · 42 seedlings lost",
    tone: "high",
    photo: true,
  },
  {
    id: "go-05",
    date: "04 Nov 2026",
    time: "07:00",
    plot: "Plot 2",
    gaugeMm: 6.8,
    stationMm: 6.5,
    by: "Samuel Mwangi",
    note: "Good soaking for the maize block",
    tone: "low",
    photo: false,
  },
  {
    id: "go-06",
    date: "01 Nov 2026",
    time: "07:15",
    plot: "Plot 1",
    gaugeMm: 12.0,
    stationMm: 11.4,
    by: "Joseph Kamau",
    note: "Drains ran full for two hours",
    tone: "medium",
    photo: true,
  },
  {
    id: "go-07",
    date: "29 Oct 2026",
    time: "06:50",
    plot: "Plot 4 tunnel",
    gaugeMm: 0.0,
    stationMm: 9.2,
    by: "Peter Otieno",
    note: "Tunnel roof — no rain reached the bed",
    tone: "neutral",
    photo: false,
  },
  {
    id: "go-08",
    date: "28 Oct 2026",
    time: "07:30",
    plot: "Plot 1",
    gaugeMm: 34.2,
    stationMm: 33.6,
    by: "Mary Wanjiku",
    note: "34 mm in 5 hours · surface runoff on the slope",
    tone: "high",
    photo: true,
  },
  {
    id: "go-09",
    date: "24 Oct 2026",
    time: "07:00",
    plot: "Plot 1",
    gaugeMm: 7.6,
    stationMm: 7.2,
    by: "Alice Wambui",
    note: "Transplanting day · soil worked perfectly",
    tone: "low",
    photo: true,
  },
  {
    id: "go-10",
    date: "20 Oct 2026",
    time: "07:05",
    plot: "Plot 1",
    gaugeMm: 4.4,
    stationMm: 4.6,
    by: "Mary Wanjiku",
    note: "Planting day — cabbage seedlings went in",
    tone: "low",
    photo: true,
  },
];

export interface AlertContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  channels: string[];
  language: "EN" | "SW";
  active: boolean;
}

export const ALERT_CONTACTS: AlertContact[] = [
  {
    id: "ac-01",
    name: "Mary Wanjiku",
    role: "Farm owner",
    phone: "0712 345 678",
    channels: ["SMS", "Push", "WhatsApp"],
    language: "SW",
    active: true,
  },
  {
    id: "ac-02",
    name: "Joseph Kamau",
    role: "Farm manager",
    phone: "0723 456 789",
    channels: ["SMS", "Push"],
    language: "EN",
    active: true,
  },
  {
    id: "ac-03",
    name: "Grace Njeri",
    role: "Sprayer",
    phone: "0733 987 654",
    channels: ["SMS"],
    language: "SW",
    active: true,
  },
  {
    id: "ac-04",
    name: "Peter Otieno",
    role: "Irrigation",
    phone: "0700 112 233",
    channels: ["SMS", "WhatsApp"],
    language: "EN",
    active: true,
  },
  {
    id: "ac-05",
    name: "Samuel Mwangi",
    role: "Casual · Plot 1",
    phone: "0741 556 677",
    channels: ["SMS"],
    language: "SW",
    active: true,
  },
  {
    id: "ac-06",
    name: "Alice Wambui",
    role: "Casual · Plot 2",
    phone: "0756 223 344",
    channels: ["SMS"],
    language: "SW",
    active: true,
  },
  {
    id: "ac-07",
    name: "David Kiptoo",
    role: "Tractor operator",
    phone: "0768 445 566",
    channels: ["SMS", "Push"],
    language: "SW",
    active: true,
  },
  {
    id: "ac-08",
    name: "Fatuma Hassan",
    role: "Nursery",
    phone: "0715 778 899",
    channels: ["SMS"],
    language: "SW",
    active: false,
  },
  {
    id: "ac-09",
    name: "Charles Omondi",
    role: "Watchman",
    phone: "0729 334 455",
    channels: ["SMS"],
    language: "SW",
    active: true,
  },
  {
    id: "ac-10",
    name: "Jane Nyambura",
    role: "Githunguri FCS secretary",
    phone: "0740 667 788",
    channels: ["WhatsApp"],
    language: "EN",
    active: false,
  },
];

/* ===================== Inputs, sprays, irrigation ===================== */

export interface SprayProduct {
  id: string;
  name: string;
  active: string;
  target: string;
  phi: number;
  rainfast: number;
  rate: string;
  pack: string;
  price: number;
  supplier: string;
  windLimit: number;
  humidityLimit: number;
}

export const SPRAY_PRODUCTS: SprayProduct[] = [
  {
    id: "sp-01",
    name: "Mancozeb 80% WP",
    active: "Mancozeb",
    target: "Black rot, downy mildew",
    phi: 7,
    rainfast: 4,
    rate: "2 kg/acre",
    pack: "1 kg",
    price: 1450,
    supplier: "Farmers Choice Agrovet, Githunguri",
    windLimit: 15,
    humidityLimit: 85,
  },
  {
    id: "sp-02",
    name: "Metalaxyl-M + Mancozeb",
    active: "Metalaxyl-M 4% + Mancozeb 64%",
    target: "Downy mildew, blight",
    phi: 14,
    rainfast: 2,
    rate: "2.5 kg/acre",
    pack: "1 kg",
    price: 2750,
    supplier: "Syngenta dealer, Ruiru",
    windLimit: 15,
    humidityLimit: 85,
  },
  {
    id: "sp-03",
    name: "Copper oxychloride 50% WP",
    active: "Copper oxychloride",
    target: "Bacterial soft rot, blight",
    phi: 3,
    rainfast: 3,
    rate: "1.5 kg/acre",
    pack: "1 kg",
    price: 1200,
    supplier: "Githunguri Agrovet",
    windLimit: 12,
    humidityLimit: 80,
  },
  {
    id: "sp-04",
    name: "Chlorothalonil 75% WP",
    active: "Chlorothalonil",
    target: "Black rot, leaf spots",
    phi: 7,
    rainfast: 2,
    rate: "1.8 kg/acre",
    pack: "1 kg",
    price: 2100,
    supplier: "Kenya Agro, Thika",
    windLimit: 15,
    humidityLimit: 85,
  },
  {
    id: "sp-05",
    name: "Emamectin benzoate 5% WG",
    active: "Emamectin benzoate",
    target: "Diamondback moth, caterpillars",
    phi: 7,
    rainfast: 2,
    rate: "60 g/acre",
    pack: "100 g",
    price: 1900,
    supplier: "Twiga Agrovet, Kiambu town",
    windLimit: 12,
    humidityLimit: 90,
  },
  {
    id: "sp-06",
    name: "Bacillus thuringiensis (Dipel DF)",
    active: "Bt kurstaki",
    target: "Caterpillars (organic)",
    phi: 0,
    rainfast: 4,
    rate: "500 g/acre",
    pack: "500 g",
    price: 2400,
    supplier: "Organic Kenya, Ruiru",
    windLimit: 12,
    humidityLimit: 90,
  },
  {
    id: "sp-07",
    name: "Lambda-cyhalothrin 5% EC",
    active: "Lambda-cyhalothrin",
    target: "Aphids, cutworm",
    phi: 7,
    rainfast: 1,
    rate: "250 ml/acre",
    pack: "250 ml",
    price: 850,
    supplier: "Githunguri Agrovet",
    windLimit: 10,
    humidityLimit: 90,
  },
  {
    id: "sp-08",
    name: "Azoxystrobin 250 SC",
    active: "Azoxystrobin",
    target: "Rust, leaf spots, black rot",
    phi: 7,
    rainfast: 1,
    rate: "800 ml/acre",
    pack: "1 L",
    price: 3300,
    supplier: "Syngenta dealer, Ruiru",
    windLimit: 15,
    humidityLimit: 85,
  },
];

export interface IrrigationPlot {
  id: string;
  plot: string;
  crop: string;
  acres: number;
  soil: string;
  source: string;
  moisture: number;
  deficitMm: number;
  costPerRound: number;
  method: string;
}

export const IRRIGATION_PLOTS: IrrigationPlot[] = [
  {
    id: "ip-01",
    plot: "Plot 1: Shamba ya nyumba",
    crop: "Cabbage Gloria F1",
    acres: 0.5,
    soil: "Humic nitisol · clay-loam low corner",
    source: "Borehole + 5,000 L tank",
    moisture: 65,
    deficitMm: 22,
    costPerRound: 1800,
    method: "Drip lines",
  },
  {
    id: "ip-02",
    plot: "Plot 2: Ridge block",
    crop: "Maize H6213",
    acres: 2.0,
    soil: "Red volcanic loam",
    source: "River Githurai pump",
    moisture: 52,
    deficitMm: 34,
    costPerRound: 5200,
    method: "Rain gun",
  },
  {
    id: "ip-03",
    plot: "Plot 3: Lower shamba",
    crop: "Beans Rosecoco",
    acres: 0.75,
    soil: "Sandy loam",
    source: "Borehole + 5,000 L tank",
    moisture: 48,
    deficitMm: 28,
    costPerRound: 2600,
    method: "Furrow",
  },
  {
    id: "ip-04",
    plot: "Plot 4: Tunnel",
    crop: "Tomato Kilele F1",
    acres: 0.25,
    soil: "Potting mix in beds",
    source: "Tank + gravity drip",
    moisture: 58,
    deficitMm: 12,
    costPerRound: 900,
    method: "Drip lines",
  },
  {
    id: "ip-05",
    plot: "Plot 5: Kitchen garden",
    crop: "Kale & sukuma",
    acres: 0.3,
    soil: "Clay loam",
    source: "Rainwater tank",
    moisture: 70,
    deficitMm: 8,
    costPerRound: 700,
    method: "Watering can",
  },
];

export interface PlanInputLine {
  id: string;
  item: string;
  detail: string;
  unit: string;
  price: number;
}

export const PLAN_INPUTS: PlanInputLine[] = [
  {
    id: "pi-01",
    item: "Certified seed",
    detail: "Gloria F1 cabbage · 100 g tin",
    unit: "tin",
    price: 3200,
  },
  {
    id: "pi-02",
    item: "Seedling trays",
    detail: "72-cell trays + cocopeat",
    unit: "tray",
    price: 450,
  },
  {
    id: "pi-03",
    item: "Basal fertilizer",
    detail: "DAP 50 kg bag",
    unit: "bag",
    price: 4300,
  },
  {
    id: "pi-04",
    item: "Top dressing",
    detail: "CAN 50 kg bag",
    unit: "bag",
    price: 3600,
  },
  {
    id: "pi-05",
    item: "Fungicide",
    detail: "Mancozeb 80% WP · 1 kg",
    unit: "kg",
    price: 1450,
  },
  {
    id: "pi-06",
    item: "Insecticide",
    detail: "Emamectin benzoate · 100 g",
    unit: "pack",
    price: 1900,
  },
  {
    id: "pi-07",
    item: "Labour — land prep",
    detail: "2 casuals × 1 day",
    unit: "day",
    price: 1200,
  },
  {
    id: "pi-08",
    item: "Labour — transplanting",
    detail: "4 casuals × 1 day",
    unit: "day",
    price: 2400,
  },
  {
    id: "pi-09",
    item: "Drip tape",
    detail: "16 mm · 300 m roll",
    unit: "roll",
    price: 5800,
  },
  {
    id: "pi-10",
    item: "Water bowser",
    detail: "5,000 L delivered",
    unit: "load",
    price: 2500,
  },
];

/* ===================== Data sources, rules, faults ===================== */

export interface DataSource {
  id: string;
  name: string;
  provider: string;
  resolution: string;
  refresh: string;
  accuracy: number;
  use: string;
  cost: string;
}

export const DATA_SOURCES: DataSource[] = [
  {
    id: "ds-01",
    name: "Kenya Met Department AWS network",
    provider: "KMD",
    resolution: "Station point",
    refresh: "Every 10 min",
    accuracy: 94,
    use: "Ground truth for temperature, rain and wind",
    cost: "Public · free",
  },
  {
    id: "ds-02",
    name: "IBM Weather (The Weather Company)",
    provider: "IBM",
    resolution: "1 km nowcast",
    refresh: "Every 10 min",
    accuracy: 88,
    use: "Short-range rain cells and lightning",
    cost: "GrowMO enterprise licence",
  },
  {
    id: "ds-03",
    name: "NASA POWER",
    provider: "NASA GES DISC",
    resolution: "0.5° daily",
    refresh: "Daily 05:00",
    accuracy: 86,
    use: "Radiation, ET₀ and 30-year climate normals",
    cost: "Public · free",
  },
  {
    id: "ds-04",
    name: "Copernicus C3S seasonal",
    provider: "ECMWF",
    resolution: "1° monthly",
    refresh: "Weekly",
    accuracy: 79,
    use: "3-month seasonal outlook and ENSO drivers",
    cost: "Public · free",
  },
  {
    id: "ds-05",
    name: "WISER Kabete met mast",
    provider: "University of Nairobi",
    resolution: "Mast profile",
    refresh: "Every 15 min",
    accuracy: 96,
    use: "Boundary-layer wind and hail inference",
    cost: "Research partnership",
  },
  {
    id: "ds-06",
    name: "GrowMO community gauges",
    provider: "GrowMO farmers",
    resolution: "Farm point",
    refresh: "Every 30 min",
    accuracy: 90,
    use: "Plot-level rain, soil moisture, leaf wetness",
    cost: "Included in GrowMO",
  },
];

export interface AlertRule {
  id: string;
  label: string;
  swahili: string;
  desc: string;
  metric: string;
  threshold: number;
  unit: string;
  defaultOn: boolean;
  channels: string[];
}

export const ALERT_RULES: AlertRule[] = [
  {
    id: "ru-01",
    label: "Heavy rain",
    swahili: "Mvua kubwa",
    desc: "Warn me before a big fall so I can open drains.",
    metric: "Rain in 6 hours",
    threshold: 20,
    unit: "mm",
    defaultOn: true,
    channels: ["SMS", "Push"],
  },
  {
    id: "ru-02",
    label: "Dry spell",
    swahili: "Ukavu",
    desc: "Alert when no rain is forecast for this many days.",
    metric: "Rain-free days",
    threshold: 7,
    unit: "days",
    defaultOn: true,
    channels: ["SMS", "Push"],
  },
  {
    id: "ru-03",
    label: "Frost risk",
    swahili: "Ganda",
    desc: "Warn when the minimum temperature drops this low.",
    metric: "Minimum temperature",
    threshold: 5,
    unit: "°C",
    defaultOn: true,
    channels: ["SMS", "Push", "WhatsApp"],
  },
  {
    id: "ru-04",
    label: "Spray-block humidity",
    swahili: "Unyevu wa kupulizia",
    desc: "Hold foliar sprays above this humidity.",
    metric: "Humidity",
    threshold: 85,
    unit: "%",
    defaultOn: false,
    channels: ["Push"],
  },
  {
    id: "ru-05",
    label: "Wind limit",
    swahili: "Kikomo cha upepo",
    desc: "Stop knapsack spraying above this wind speed.",
    metric: "Wind speed",
    threshold: 15,
    unit: "km/h",
    defaultOn: true,
    channels: ["SMS"],
  },
  {
    id: "ru-06",
    label: "Heat stress",
    swahili: "Joto kali",
    desc: "Warn when the maximum temperature passes this.",
    metric: "Maximum temperature",
    threshold: 30,
    unit: "°C",
    defaultOn: false,
    channels: ["SMS"],
  },
  {
    id: "ru-07",
    label: "Flood risk",
    swahili: "Mafuriko",
    desc: "River level or forecast rain above the flood trigger.",
    metric: "Rain in 24 hours",
    threshold: 50,
    unit: "mm",
    defaultOn: true,
    channels: ["SMS", "Push", "WhatsApp"],
  },
  {
    id: "ru-08",
    label: "Pest migration",
    swahili: "Uhamaji wa wadudu",
    desc: "Locust or armyworm movement within 150 km.",
    metric: "Distance",
    threshold: 150,
    unit: "km",
    defaultOn: true,
    channels: ["SMS"],
  },
];

export interface StationFault {
  id: string;
  station: string;
  date: string;
  issue: string;
  status: "Open" | "In progress" | "Resolved";
  tone: WxTone;
  technician: string;
  eta: string;
}

export const STATION_FAULTS: StationFault[] = [
  {
    id: "sf-01",
    station: "GrowMO Gauge GTH-24",
    date: "11 Nov 2026",
    issue: "Solar panel soiled · battery flat",
    status: "Open",
    tone: "high",
    technician: "Unassigned",
    eta: "—",
  },
  {
    id: "sf-02",
    station: "KMD Thika AWS 041",
    date: "26 Oct 2026",
    issue: "Telemetry SIM expired",
    status: "In progress",
    tone: "medium",
    technician: "KMD Kiambu office",
    eta: "20 Nov 2026",
  },
  {
    id: "sf-03",
    station: "GrowMO Gauge GTH-11",
    date: "02 Nov 2026",
    issue: "Gauge orifice blocked by leaf litter",
    status: "Resolved",
    tone: "low",
    technician: "Mary Wanjiku",
    eta: "Cleaned same day",
  },
  {
    id: "sf-04",
    station: "KMD Limuru AWS 018",
    date: "18 Sep 2026",
    issue: "Anemometer reading 12% low",
    status: "Resolved",
    tone: "low",
    technician: "KMD calibration van",
    eta: "Recalibrated",
  },
  {
    id: "sf-05",
    station: "Tegus Farm Station",
    date: "07 Nov 2026",
    issue: "Soil probe cable nicked by hoe",
    status: "Resolved",
    tone: "low",
    technician: "Tegus Farm Ltd",
    eta: "Replaced 08 Nov",
  },
  {
    id: "sf-06",
    station: "GrowMO Gauge GTH-24",
    date: "23 Aug 2026",
    issue: "Tipping bucket stuck after storm",
    status: "Resolved",
    tone: "low",
    technician: "James Gichuru",
    eta: "Fixed 24 Aug",
  },
];

export const SMS_BUNDLE = {
  name: "GrowMO Weather SMS bundle",
  price: 150,
  credits: 100,
  validFor: "30 days",
  perSms: 1.5,
  shortcode: "38466",
  note: "Bulk SMS to workers and co-op members. Charged to the GrowMO wallet, topped up by M-Pesa.",
};

export const WEATHER_FAQS = [
  {
    q: "How local is my forecast?",
    a: "Your grid point is 0.5° from NASA POWER, refined with the KMD Githunguri AWS 2.4 km away and your own GrowMO gauge 0.8 km away. Plot-level rain can differ from the station by 20–30% in convective storms, which is why your own gauge reading always wins.",
  },
  {
    q: 'Why does the spray window say "do not spray"?',
    a: "Three rules must pass: wind under the product limit, humidity under its limit, and no rain forecast inside the rainfast period. Today the 15:00 shower fails the rainfast test for Mancozeb, so the window closes at 14:00.",
  },
  {
    q: "How is the seasonal outlook produced?",
    a: "Kenya Met Department's seasonal forecast is combined with Copernicus C3S and NASA POWER climate normals, then interpreted per crop by GrowMO. Skill for Kiambu short rains is about 70% at a one-month lead — treat it as a plan, not a promise.",
  },
  {
    q: "What does the prediction engine actually change?",
    a: "It compares predicted rainfall against the crop's water need at every growth stage, then writes the resulting tasks (irrigation, fungicide, scouting) into your crop plan with dates.",
  },
  {
    q: "Can I trust the historical table for budgeting?",
    a: "Use the 10-year table, not a single year. Kiambu short rains have ranged from 180 mm (2021 drought) to 620 mm (2023 El Niño). Budget on the 320 mm long-term average and keep an irrigation contingency.",
  },
];
