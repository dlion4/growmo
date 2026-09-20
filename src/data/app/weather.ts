/* ============================================================================
   PAGE 8 — WEATHER & CLIMATE INTELLIGENCE (ENHANCED)
   Demo weather data for Wanjiku Mixed Farm, Githunguri, Kiambu County.
   Forecasts are planning simulations, not live weather guarantees.
   ========================================================================== */

export type WeatherRiskLevel = "Low" | "Moderate" | "High";
export type WeatherAlertSeverity = "Moderate" | "High";
export type WeatherAlertStatus = "Active" | "Acknowledged";
export type WeatherIcon = "rain" | "cloud" | "sun" | "partly" | "wind";

export const WEATHER_CONTEXT = {
  farm: "Wanjiku Mixed Farm",
  phone: "0712 345 678",
  ward: "Githunguri",
  county: "Kiambu",
  season: "Short Rains 2026",
};

export interface CurrentWeatherMetric {
  id: string;
  parameter: string;
  value: string;
  unit: string;
  change: string;
  icon: string;
  tone: "leaf" | "gold" | "clay" | "blue";
}

export const CURRENT_WEATHER_METRICS: CurrentWeatherMetric[] = [
  {
    id: "temperature",
    parameter: "Temperature",
    value: "24",
    unit: "°C",
    change: "+1°C",
    icon: "thermometer",
    tone: "gold",
  },
  {
    id: "feels-like",
    parameter: "Feels like",
    value: "22",
    unit: "°C",
    change: "—",
    icon: "sun",
    tone: "gold",
  },
  {
    id: "humidity",
    parameter: "Humidity",
    value: "78",
    unit: "%",
    change: "+5%",
    icon: "droplets",
    tone: "blue",
  },
  {
    id: "wind-speed",
    parameter: "Wind speed",
    value: "12",
    unit: "km/h",
    change: "−3",
    icon: "wind",
    tone: "leaf",
  },
  {
    id: "wind-direction",
    parameter: "Wind direction",
    value: "NE",
    unit: "",
    change: "—",
    icon: "compass",
    tone: "leaf",
  },
  {
    id: "rain-24h",
    parameter: "Rainfall (24hr)",
    value: "5.2",
    unit: "mm",
    change: "—",
    icon: "cloud-rain",
    tone: "blue",
  },
  {
    id: "rain-7d",
    parameter: "Rainfall (7 days)",
    value: "28",
    unit: "mm",
    change: "—",
    icon: "cloud-rain",
    tone: "blue",
  },
  {
    id: "soil-temp",
    parameter: "Soil temperature",
    value: "20",
    unit: "°C",
    change: "—",
    icon: "sprout",
    tone: "leaf",
  },
  {
    id: "soil-moisture",
    parameter: "Soil moisture",
    value: "65",
    unit: "%",
    change: "+8%",
    icon: "gauge",
    tone: "leaf",
  },
  {
    id: "uv",
    parameter: "UV index",
    value: "6",
    unit: "Moderate",
    change: "—",
    icon: "sun",
    tone: "gold",
  },
  {
    id: "evapotranspiration",
    parameter: "Evapotranspiration",
    value: "3.5",
    unit: "mm/day",
    change: "—",
    icon: "waves",
    tone: "blue",
  },
  {
    id: "dew-point",
    parameter: "Dew point",
    value: "19",
    unit: "°C",
    change: "—",
    icon: "droplets",
    tone: "blue",
  },
  {
    id: "visibility",
    parameter: "Visibility",
    value: "8",
    unit: "km",
    change: "—",
    icon: "eye",
    tone: "leaf",
  },
  {
    id: "pressure",
    parameter: "Atmospheric pressure",
    value: "1015",
    unit: "hPa",
    change: "—",
    icon: "gauge",
    tone: "leaf",
  },
];

export interface WeatherForecastDay {
  id: string;
  day: string;
  date: string;
  icon: WeatherIcon;
  condition: string;
  min: number;
  max: number;
  rainChance: number;
  rainAmount: string;
  wind: string;
  humidity: number;
  cropImpact: string;
  sprayWindow: string;
  irrigation: string;
}

export const FORECAST_7_DAYS: WeatherForecastDay[] = [
  {
    id: "day-1",
    day: "Today",
    date: "13 Nov",
    icon: "rain",
    condition: "Light rain",
    min: 16,
    max: 24,
    rainChance: 70,
    rainAmount: "8–15 mm",
    wind: "12 NE",
    humidity: 78,
    cropImpact: "Good for cabbage; spray after rain dries.",
    sprayWindow: "17:00–18:30",
    irrigation: "Skip irrigation.",
  },
  {
    id: "day-2",
    day: "Tomorrow",
    date: "14 Nov",
    icon: "rain",
    condition: "Rain showers",
    min: 15,
    max: 22,
    rainChance: 80,
    rainAmount: "10–20 mm",
    wind: "15 NE",
    humidity: 82,
    cropImpact: "Black rot risk — inspect lower leaves.",
    sprayWindow: "No safe window",
    irrigation: "Skip irrigation.",
  },
  {
    id: "day-3",
    day: "Day 3",
    date: "15 Nov",
    icon: "partly",
    condition: "Cloud breaks",
    min: 14,
    max: 23,
    rainChance: 40,
    rainAmount: "0–5 mm",
    wind: "10 E",
    humidity: 70,
    cropImpact: "Good spraying window if leaves are dry.",
    sprayWindow: "09:00–11:30",
    irrigation: "Light top-up only.",
  },
  {
    id: "day-4",
    day: "Day 4",
    date: "16 Nov",
    icon: "sun",
    condition: "Sunny",
    min: 15,
    max: 25,
    rainChance: 10,
    rainAmount: "0 mm",
    wind: "8 SE",
    humidity: 60,
    cropImpact: "Irrigate if soil moisture falls below 55%.",
    sprayWindow: "06:30–09:00",
    irrigation: "20 minutes for Plot 1.",
  },
  {
    id: "day-5",
    day: "Day 5",
    date: "17 Nov",
    icon: "sun",
    condition: "Sunny and dry",
    min: 16,
    max: 26,
    rainChance: 5,
    rainAmount: "0 mm",
    wind: "10 SE",
    humidity: 55,
    cropImpact: "Dry; monitor soil moisture and wilting.",
    sprayWindow: "06:30–09:30",
    irrigation: "30 minutes for Plot 1.",
  },
  {
    id: "day-6",
    day: "Day 6",
    date: "18 Nov",
    icon: "partly",
    condition: "Partly cloudy",
    min: 15,
    max: 24,
    rainChance: 30,
    rainAmount: "0–3 mm",
    wind: "12 E",
    humidity: 65,
    cropImpact: "Good harvest preparation weather.",
    sprayWindow: "08:00–10:30",
    irrigation: "Check soil probe first.",
  },
  {
    id: "day-7",
    day: "Day 7",
    date: "19 Nov",
    icon: "rain",
    condition: "Rain returns",
    min: 14,
    max: 22,
    rainChance: 60,
    rainAmount: "5–10 mm",
    wind: "18 NE",
    humidity: 75,
    cropImpact: "Rain returning; secure crates and drainage.",
    sprayWindow: "No safe window",
    irrigation: "Skip irrigation.",
  },
];

export interface SeasonalMonth {
  id: string;
  month: string;
  rainfall: string;
  average: string;
  temperature: string;
  onset: string;
  cessation: string;
  drySpellRisk: WeatherRiskLevel;
  floodRisk: WeatherRiskLevel;
  rainyDays: string;
}

export const SEASONAL_OUTLOOK: SeasonalMonth[] = [
  {
    id: "season-oct",
    month: "October",
    rainfall: "100–150 mm",
    average: "Near normal",
    temperature: "18–26°C",
    onset: "Week 1 October",
    cessation: "—",
    drySpellRisk: "Low",
    floodRisk: "Low",
    rainyDays: "12–15",
  },
  {
    id: "season-nov",
    month: "November",
    rainfall: "150–250 mm",
    average: "Above normal",
    temperature: "17–25°C",
    onset: "—",
    cessation: "—",
    drySpellRisk: "Low",
    floodRisk: "Moderate",
    rainyDays: "15–20",
  },
  {
    id: "season-dec",
    month: "December",
    rainfall: "80–140 mm",
    average: "Near normal",
    temperature: "18–26°C",
    onset: "—",
    cessation: "Mid-December",
    drySpellRisk: "Moderate",
    floodRisk: "Low",
    rainyDays: "8–12",
  },
];

export interface SeasonalRisk {
  id: string;
  risk: string;
  level: WeatherRiskLevel;
  advisory: string;
  crop: string;
  timing: string;
}

export const SEASONAL_RISKS: SeasonalRisk[] = [
  {
    id: "risk-rot",
    risk: "Black rot",
    level: "High",
    advisory:
      "Above-normal November rain means high humidity. Spray Mancozeb every 14 days and maintain airflow.",
    crop: "Cabbage",
    timing: "Vegetative to heading",
  },
  {
    id: "risk-water",
    risk: "Waterlogging",
    level: "Moderate",
    advisory:
      "If the soil is clay, clear drainage channels and keep cabbage on raised beds.",
    crop: "Cabbage",
    timing: "November peak rain",
  },
  {
    id: "risk-moth",
    risk: "Diamondback moth",
    level: "Moderate",
    advisory:
      "Wet weather favours caterpillars. Scout twice weekly from Week 3.",
    crop: "Cabbage",
    timing: "Week 3 onward",
  },
  {
    id: "risk-cutworm",
    risk: "Cutworm",
    level: "Low",
    advisory: "The crop is past transplanting stage, so the risk is reducing.",
    crop: "Cabbage",
    timing: "Current",
  },
  {
    id: "risk-dry",
    risk: "December dry spell",
    level: "Moderate",
    advisory:
      "Plan supplementary irrigation for heading stage when rainfall tapers mid-month.",
    crop: "Cabbage",
    timing: "15–28 December",
  },
  {
    id: "risk-harvest",
    risk: "Harvest rain damage",
    level: "Low",
    advisory:
      "January is expected to be drier; prepare a dry harvest and transport route.",
    crop: "Cabbage",
    timing: "January harvest",
  },
  {
    id: "risk-faw",
    risk: "Fall armyworm",
    level: "Moderate",
    advisory:
      "Warm windows can restart egg laying. Scout maize whorls before spraying.",
    crop: "Maize",
    timing: "Vegetative stage",
  },
  {
    id: "risk-blight",
    risk: "Late blight",
    level: "Moderate",
    advisory:
      "Avoid overhead irrigation and protect tomatoes before rain fronts arrive.",
    crop: "Tomato",
    timing: "Flowering",
  },
];

export interface CropPredictionPeriod {
  id: string;
  period: string;
  daysOrMonths: string;
  stage: string;
  predictedRain: string;
  predictedTemp: string;
  cropNeed: string;
  match: "Good" | "Decreasing" | "Low" | "Perfect";
  advisory: string;
}

export interface CropWeatherPlan {
  id: string;
  crop: string;
  variety: string;
  county: string;
  location: string;
  plantingDate: string;
  duration: string;
  season: string;
  periods: CropPredictionPeriod[];
}

export const CROP_WEATHER_PLANS: CropWeatherPlan[] = [
  {
    id: "plan-cabbage",
    crop: "Cabbage",
    variety: "Gloria F1",
    county: "Kiambu",
    location: "Githunguri",
    plantingDate: "20 Oct 2026",
    duration: "90 days",
    season: "Short Rains 2026",
    periods: [
      {
        id: "cab-1",
        period: "20 Oct–02 Nov",
        daysOrMonths: "Days 1–14",
        stage: "Establishment",
        predictedRain: "30–50 mm",
        predictedTemp: "18–24°C",
        cropNeed: "Moist soil for root growth",
        match: "Good",
        advisory: "No irrigation needed.",
      },
      {
        id: "cab-2",
        period: "03–16 Nov",
        daysOrMonths: "Days 15–28",
        stage: "Vegetative",
        predictedRain: "50–80 mm",
        predictedTemp: "17–24°C",
        cropNeed: "Moisture and nitrogen",
        match: "Good",
        advisory: "Apply CAN and keep weeds down.",
      },
      {
        id: "cab-3",
        period: "17–30 Nov",
        daysOrMonths: "Days 29–42",
        stage: "Late vegetative",
        predictedRain: "60–100 mm",
        predictedTemp: "17–25°C",
        cropNeed: "Continued moisture",
        match: "Good",
        advisory: "Watch for black rot after wet days.",
      },
      {
        id: "cab-4",
        period: "01–14 Dec",
        daysOrMonths: "Days 43–56",
        stage: "Early heading",
        predictedRain: "40–70 mm",
        predictedTemp: "18–26°C",
        cropNeed: "Moderate moisture",
        match: "Decreasing",
        advisory: "Prepare a supplementary irrigation turn.",
      },
      {
        id: "cab-5",
        period: "15–28 Dec",
        daysOrMonths: "Days 57–70",
        stage: "Heading",
        predictedRain: "15–30 mm",
        predictedTemp: "18–27°C",
        cropNeed: "Moderate moisture",
        match: "Low",
        advisory: "Irrigate when the probe falls below 55%.",
      },
      {
        id: "cab-6",
        period: "29 Dec–11 Jan",
        daysOrMonths: "Days 71–84",
        stage: "Maturity",
        predictedRain: "10–20 mm",
        predictedTemp: "17–27°C",
        cropNeed: "Low water is okay",
        match: "Good",
        advisory: "Reduce irrigation to firm heads.",
      },
      {
        id: "cab-7",
        period: "12–18 Jan",
        daysOrMonths: "Days 85–90",
        stage: "Harvest",
        predictedRain: "5–10 mm",
        predictedTemp: "17–28°C",
        cropNeed: "Dry weather ideal",
        match: "Perfect",
        advisory: "Harvest in dry conditions.",
      },
    ],
  },
  {
    id: "plan-maize",
    crop: "Maize",
    variety: "H6213",
    county: "Uasin Gishu",
    location: "Kesses",
    plantingDate: "15 Oct 2026",
    duration: "120 days",
    season: "Short Rains 2026",
    periods: [
      {
        id: "mai-1",
        period: "15–28 Oct",
        daysOrMonths: "Days 1–14",
        stage: "Germination",
        predictedRain: "25–40 mm",
        predictedTemp: "15–22°C",
        cropNeed: "Even moisture",
        match: "Good",
        advisory: "Good moisture for germination.",
      },
      {
        id: "mai-2",
        period: "29 Oct–25 Nov",
        daysOrMonths: "Days 15–42",
        stage: "Vegetative",
        predictedRain: "80–130 mm",
        predictedTemp: "14–22°C",
        cropNeed: "Nitrogen and moisture",
        match: "Good",
        advisory: "Top dress CAN at Week 5–6.",
      },
      {
        id: "mai-3",
        period: "26 Nov–16 Dec",
        daysOrMonths: "Days 43–63",
        stage: "Tasseling",
        predictedRain: "50–80 mm",
        predictedTemp: "14–24°C",
        cropNeed: "Critical moisture",
        match: "Decreasing",
        advisory: "Water stress can reduce grain fill.",
      },
      {
        id: "mai-4",
        period: "17 Dec–08 Jan",
        daysOrMonths: "Days 64–85",
        stage: "Silking & grain fill",
        predictedRain: "30–60 mm",
        predictedTemp: "15–25°C",
        cropNeed: "Reliable moisture",
        match: "Low",
        advisory: "Keep moisture stable through grain filling.",
      },
      {
        id: "mai-5",
        period: "09 Jan–12 Feb",
        daysOrMonths: "Days 86–120",
        stage: "Maturity & dry-down",
        predictedRain: "20–40 mm",
        predictedTemp: "15–26°C",
        cropNeed: "Dry-down",
        match: "Perfect",
        advisory: "Stop irrigation and allow the crop to dry.",
      },
    ],
  },
  {
    id: "plan-sugarcane",
    crop: "Sugarcane",
    variety: "NCo 334",
    county: "Kakamega",
    location: "Lurambi",
    plantingDate: "20 Oct 2026",
    duration: "18 months",
    season: "Long-term forecast",
    periods: [
      {
        id: "sug-1",
        period: "Oct–Dec 2026",
        daysOrMonths: "Months 0–3",
        stage: "Germination",
        predictedRain: "300–500 mm",
        predictedTemp: "20–28°C",
        cropNeed: "Moist establishment",
        match: "Good",
        advisory: "Short rains support establishment.",
      },
      {
        id: "sug-2",
        period: "Jan–Feb 2027",
        daysOrMonths: "Months 3–5",
        stage: "Tillering",
        predictedRain: "50–100 mm",
        predictedTemp: "23–31°C",
        cropNeed: "Supplementary water",
        match: "Low",
        advisory: "Irrigate if possible; weed control is critical.",
      },
      {
        id: "sug-3",
        period: "Mar–May 2027",
        daysOrMonths: "Months 5–8",
        stage: "Grand growth",
        predictedRain: "400–700 mm",
        predictedTemp: "21–28°C",
        cropNeed: "High moisture and nitrogen",
        match: "Perfect",
        advisory: "Peak growth; apply N fertilizer.",
      },
      {
        id: "sug-4",
        period: "Jun–Aug 2027",
        daysOrMonths: "Months 8–11",
        stage: "Grand growth",
        predictedRain: "100–200 mm",
        predictedTemp: "18–25°C",
        cropNeed: "Sustained moisture",
        match: "Decreasing",
        advisory: "Irrigate for sustained growth.",
      },
      {
        id: "sug-5",
        period: "Sep–Oct 2027",
        daysOrMonths: "Months 11–13",
        stage: "Maturation",
        predictedRain: "200–350 mm",
        predictedTemp: "20–27°C",
        cropNeed: "Potassium",
        match: "Good",
        advisory: "Reduce nitrogen and increase potassium.",
      },
      {
        id: "sug-6",
        period: "Nov 2027–Jan 2028",
        daysOrMonths: "Months 13–15",
        stage: "Ripening",
        predictedRain: "100–200 mm",
        predictedTemp: "21–29°C",
        cropNeed: "Drying trend",
        match: "Good",
        advisory: "Stop irrigation for sugar concentration.",
      },
      {
        id: "sug-7",
        period: "Feb–Mar 2028",
        daysOrMonths: "Months 15–18",
        stage: "Harvest ready",
        predictedRain: "50–100 mm",
        predictedTemp: "23–31°C",
        cropNeed: "Dry harvest",
        match: "Perfect",
        advisory: "Harvest during dry weather for better sucrose.",
      },
    ],
  },
];

export interface PlantingWindow {
  id: string;
  county: string;
  crop: string;
  bestWindow: string;
  goodWindow: string;
  riskyWindow: string;
  avoid: string;
  reason: string;
  waterNeed: string;
}

export const PLANTING_WINDOWS: PlantingWindow[] = [
  {
    id: "window-01",
    county: "Kiambu",
    crop: "Cabbage",
    bestWindow: "01 Oct–15 Nov",
    goodWindow: "01 Mar–15 Apr",
    riskyWindow: "Jun–Aug (irrigated only)",
    avoid: "Jan–Feb",
    reason: "Hot, dry conditions favour aphids.",
    waterNeed: "Moderate",
  },
  {
    id: "window-02",
    county: "Kiambu",
    crop: "Maize",
    bestWindow: "15 Mar–15 Apr",
    goodWindow: "15 Oct–15 Nov",
    riskyWindow: "—",
    avoid: "May–Sep",
    reason: "Rainfall is too unreliable for rain-fed maize.",
    waterNeed: "Moderate",
  },
  {
    id: "window-03",
    county: "Uasin Gishu",
    crop: "Maize",
    bestWindow: "01 Mar–15 Apr",
    goodWindow: "15 Oct–15 Nov",
    riskyWindow: "—",
    avoid: "May–Sep",
    reason: "Align tasseling with reliable rain.",
    waterNeed: "High",
  },
  {
    id: "window-04",
    county: "Kakamega",
    crop: "Sugarcane",
    bestWindow: "Oct–Nov",
    goodWindow: "Mar–May",
    riskyWindow: "Jan–Feb",
    avoid: "—",
    reason: "Establish before the dry period.",
    waterNeed: "High",
  },
  {
    id: "window-05",
    county: "Machakos",
    crop: "Sorghum",
    bestWindow: "15 Oct–30 Nov",
    goodWindow: "01 Mar–15 Apr",
    riskyWindow: "—",
    avoid: "May–Sep",
    reason: "Short rains suit the drought-tolerant crop.",
    waterNeed: "Low",
  },
  {
    id: "window-06",
    county: "Kilifi",
    crop: "Cashew",
    bestWindow: "—",
    goodWindow: "—",
    riskyWindow: "—",
    avoid: "—",
    reason:
      "Perennial crop; rainfall and orchard establishment matter more than a single window.",
    waterNeed: "Low",
  },
  {
    id: "window-07",
    county: "Nyandarua",
    crop: "Potato",
    bestWindow: "01 Mar–30 Apr",
    goodWindow: "01 Oct–30 Nov",
    riskyWindow: "—",
    avoid: "May–Sep",
    reason: "Avoid frost and prolonged wet foliage.",
    waterNeed: "Moderate",
  },
  {
    id: "window-08",
    county: "Kisumu",
    crop: "Rice (NIB)",
    bestWindow: "Aug–Sep",
    goodWindow: "Jan–Feb",
    riskyWindow: "—",
    avoid: "Dry periods",
    reason: "Use irrigation schedule and canal release dates.",
    waterNeed: "High",
  },
  {
    id: "window-09",
    county: "Nakuru",
    crop: "Beans Rosecoco",
    bestWindow: "Oct–Nov",
    goodWindow: "Mar–Apr",
    riskyWindow: "Jan–Feb",
    avoid: "Jun–Sep",
    reason: "Flowering needs moisture without waterlogging.",
    waterNeed: "Moderate",
  },
  {
    id: "window-10",
    county: "Kericho",
    crop: "Tomato",
    bestWindow: "Jan–Feb",
    goodWindow: "Jun–Jul",
    riskyWindow: "Apr–May",
    avoid: "Peak rain without cover",
    reason: "Protect flowers from rain-splashed disease.",
    waterNeed: "Moderate",
  },
];

export interface ExtremeWeatherAlert {
  id: string;
  type: string;
  icon: WeatherIcon;
  severity: WeatherAlertSeverity;
  message: string;
  details: string;
  action: string;
  county: string;
  validUntil: string;
  status: WeatherAlertStatus;
}

export const EXTREME_ALERTS: ExtremeWeatherAlert[] = [
  {
    id: "alert-01",
    details:
      "Run-off may block the lower Plot 1 drain; check the outlet before workers enter the field.",
    type: "Heavy rain",
    icon: "rain",
    severity: "Moderate",
    message:
      "20–30 mm expected in the next 6 hours in Kiambu. Check drainage in the cabbage field.",
    action: "Check drainage",
    county: "Kiambu",
    validUntil: "Today · 18:00",
    status: "Active",
  },
  {
    id: "alert-02",
    details:
      "Keep livestock, fertiliser and harvested produce above the river edge until the warning expires.",
    type: "Flood warning",
    icon: "rain",
    severity: "High",
    message:
      "River Githurai is rising. Low-lying farms in Githunguri sub-county are at risk.",
    action: "Move livestock and secure inputs",
    county: "Kiambu",
    validUntil: "Today · 21:00",
    status: "Active",
  },
  {
    id: "alert-03",
    details:
      "Use the soil probe at 06:30 and irrigate cabbage only when moisture is below 55%.",
    type: "Dry spell",
    icon: "sun",
    severity: "Moderate",
    message:
      "No significant rain is expected for 14 days from 15 Dec. Cabbage in heading stage needs irrigation.",
    action: "Plan irrigation",
    county: "Kiambu",
    validUntil: "28 Dec 2026",
    status: "Active",
  },
  {
    id: "alert-04",
    details:
      "Cover potato and bean seedlings with fleece or clean sacks before the overnight temperature drop.",
    type: "Frost alert",
    icon: "cloud",
    severity: "High",
    message:
      "Temperatures may drop to 2°C in Nyandarua tonight. Frost risk for potatoes and beans.",
    action: "Cover crops and delay planting",
    county: "Nyandarua",
    validUntil: "Tomorrow · 07:00",
    status: "Active",
  },
  {
    id: "alert-05",
    details:
      "Inspect greenhouse ties, shade net anchors and loose polythene before 17:00.",
    type: "Wind warning",
    icon: "wind",
    severity: "Moderate",
    message:
      "Strong winds up to 40 km/h are expected. Secure greenhouse structures before the evening.",
    action: "Secure structures",
    county: "Kiambu",
    validUntil: "Tomorrow · 20:00",
    status: "Active",
  },
  {
    id: "alert-06",
    details:
      "Hailstones may bruise leaves and tea shoots; move nursery trays under cover where possible.",
    type: "Hail",
    icon: "rain",
    severity: "High",
    message:
      "Hail is possible in the Kericho highlands this afternoon. Protect tea and vegetables if possible.",
    action: "Cover crops if possible",
    county: "Kericho",
    validUntil: "Today · 17:00",
    status: "Acknowledged",
  },
  {
    id: "alert-07",
    details:
      "Stop field work during thunder and move the team to a vehicle or permanent building.",
    type: "Lightning",
    icon: "cloud",
    severity: "Moderate",
    message:
      "Thunderstorms are likely around Kakamega after 16:00. Keep workers away from isolated trees.",
    action: "Pause field work",
    county: "Kakamega",
    validUntil: "Today · 20:00",
    status: "Active",
  },
  {
    id: "alert-08",
    details:
      "Irrigate early morning, use mulch and provide temporary shade for tomato flowering clusters.",
    type: "Heat stress",
    icon: "sun",
    severity: "Moderate",
    message:
      "Temperatures above 31°C may stress tomatoes in uncovered plots around Machakos.",
    action: "Water early and add shade",
    county: "Machakos",
    validUntil: "17 Nov 2026",
    status: "Active",
  },
];

export interface HistoricalWeatherMonth {
  id: string;
  month: string;
  rainfall: number;
  minTemp: number;
  maxTemp: number;
  rainyDays: number;
  drySpellProbability: number;
  note: string;
}

export const HISTORICAL_WEATHER: HistoricalWeatherMonth[] = [
  {
    id: "hist-jan",
    month: "January",
    rainfall: 40,
    minTemp: 12,
    maxTemp: 25,
    rainyDays: 5,
    drySpellProbability: 60,
    note: "Dry; cabbage harvest window.",
  },
  {
    id: "hist-feb",
    month: "February",
    rainfall: 30,
    minTemp: 13,
    maxTemp: 27,
    rainyDays: 3,
    drySpellProbability: 75,
    note: "Hot and dry; irrigation matters.",
  },
  {
    id: "hist-mar",
    month: "March",
    rainfall: 80,
    minTemp: 14,
    maxTemp: 26,
    rainyDays: 10,
    drySpellProbability: 20,
    note: "Long rains begin.",
  },
  {
    id: "hist-apr",
    month: "April",
    rainfall: 200,
    minTemp: 14,
    maxTemp: 24,
    rainyDays: 18,
    drySpellProbability: 5,
    note: "Wettest month; drainage is key.",
  },
  {
    id: "hist-may",
    month: "May",
    rainfall: 180,
    minTemp: 13,
    maxTemp: 23,
    rainyDays: 16,
    drySpellProbability: 10,
    note: "Rain tapers late in month.",
  },
  {
    id: "hist-jun",
    month: "June",
    rainfall: 50,
    minTemp: 11,
    maxTemp: 22,
    rainyDays: 5,
    drySpellProbability: 40,
    note: "Cool and relatively dry.",
  },
  {
    id: "hist-jul",
    month: "July",
    rainfall: 30,
    minTemp: 10,
    maxTemp: 21,
    rainyDays: 3,
    drySpellProbability: 60,
    note: "Coolest month.",
  },
  {
    id: "hist-aug",
    month: "August",
    rainfall: 30,
    minTemp: 10,
    maxTemp: 22,
    rainyDays: 3,
    drySpellProbability: 55,
    note: "Dry spell probability rises.",
  },
  {
    id: "hist-sep",
    month: "September",
    rainfall: 40,
    minTemp: 11,
    maxTemp: 24,
    rainyDays: 5,
    drySpellProbability: 45,
    note: "Prepare land before short rains.",
  },
  {
    id: "hist-oct",
    month: "October",
    rainfall: 120,
    minTemp: 13,
    maxTemp: 24,
    rainyDays: 12,
    drySpellProbability: 15,
    note: "Short rains usually establish.",
  },
  {
    id: "hist-nov",
    month: "November",
    rainfall: 180,
    minTemp: 13,
    maxTemp: 23,
    rainyDays: 16,
    drySpellProbability: 10,
    note: "High humidity and disease pressure.",
  },
  {
    id: "hist-dec",
    month: "December",
    rainfall: 90,
    minTemp: 12,
    maxTemp: 24,
    rainyDays: 9,
    drySpellProbability: 25,
    note: "Rain tapers toward harvest planning.",
  },
];

export interface WeatherLocation {
  id: string;
  farm: string;
  county: string;
  ward: string;
  elevation: string;
  station: string;
  updated: string;
  distance: string;
  isCurrent?: boolean;
}

export const WEATHER_LOCATIONS: WeatherLocation[] = [
  {
    id: "loc-01",
    farm: "Wanjiku Mixed Farm",
    county: "Kiambu",
    ward: "Githunguri",
    elevation: "1,980 m",
    station: "Githunguri local station",
    updated: "6 minutes ago",
    distance: "0.8 km",
    isCurrent: true,
  },
  {
    id: "loc-02",
    farm: "Shamba ya chini",
    county: "Uasin Gishu",
    ward: "Kesses",
    elevation: "2,100 m",
    station: "Eldoret Met station",
    updated: "12 minutes ago",
    distance: "4.2 km",
  },
  {
    id: "loc-03",
    farm: "Kakamega cane block",
    county: "Kakamega",
    ward: "Lurambi",
    elevation: "1,530 m",
    station: "Kakamega airport station",
    updated: "18 minutes ago",
    distance: "7.8 km",
  },
  {
    id: "loc-04",
    farm: "Green Valley",
    county: "Nakuru",
    ward: "Naivasha East",
    elevation: "1,900 m",
    station: "Naivasha station",
    updated: "21 minutes ago",
    distance: "2.1 km",
  },
  {
    id: "loc-05",
    farm: "Makueni dryland plot",
    county: "Machakos",
    ward: "Kangundo",
    elevation: "1,350 m",
    station: "Kangundo station",
    updated: "24 minutes ago",
    distance: "3.5 km",
  },
  {
    id: "loc-06",
    farm: "Nyandarua potato plot",
    county: "Nyandarua",
    ward: "Ol Kalou",
    elevation: "2,420 m",
    station: "Ol Kalou station",
    updated: "26 minutes ago",
    distance: "1.7 km",
  },
  {
    id: "loc-07",
    farm: "Kisumu rice block",
    county: "Kisumu",
    ward: "Ahero",
    elevation: "1,150 m",
    station: "Ahero irrigation station",
    updated: "31 minutes ago",
    distance: "1.2 km",
  },
  {
    id: "loc-08",
    farm: "Kilifi orchard",
    county: "Kilifi",
    ward: "Mtwapa",
    elevation: "80 m",
    station: "Kilifi coastal station",
    updated: "38 minutes ago",
    distance: "5.6 km",
  },
  {
    id: "loc-09",
    farm: "Kericho highlands",
    county: "Kericho",
    ward: "Ainamoi",
    elevation: "2,050 m",
    station: "Kericho station",
    updated: "42 minutes ago",
    distance: "3.9 km",
  },
  {
    id: "loc-10",
    farm: "Taita smallholding",
    county: "Taita Taveta",
    ward: "Wundanyi",
    elevation: "1,450 m",
    station: "Wundanyi station",
    updated: "51 minutes ago",
    distance: "6.3 km",
  },
];

export interface WeatherSource {
  id: string;
  name: string;
  detail: string;
  update: string;
  url: string;
  trust: string;
}

export const WEATHER_SOURCES: WeatherSource[] = [
  {
    id: "source-kmd",
    name: "Kenya Meteorological Department",
    detail: "Seasonal forecast and county warnings",
    update: "Updated daily",
    url: "https://meteo.go.ke/",
    trust: "Official Kenya forecast",
  },
  {
    id: "source-ibm",
    name: "IBM Weather Company",
    detail: "Hourly and seven-day conditions",
    update: "Updated hourly",
    url: "https://www.weathercompany.com/",
    trust: "Global forecast layer",
  },
  {
    id: "source-nasa",
    name: "NASA POWER",
    detail: "Historical agro-climate data",
    update: "Long-term archive",
    url: "https://power.larc.nasa.gov/",
    trust: "Planning baseline",
  },
  {
    id: "source-local",
    name: "Githunguri local station",
    detail: "On-farm rain gauge and soil probe",
    update: "Every 15 minutes",
    url: "https://meteo.go.ke/",
    trust: "Nearest observation",
  },
];

export interface WeatherPreferences {
  rainAlerts: boolean;
  frostAlerts: boolean;
  sprayWindows: boolean;
  irrigationReminders: boolean;
  alertCounty: string;
  temperatureUnit: "C" | "F";
  rainfallUnit: "mm" | "in";
}

export const WEATHER_PREFERENCES: WeatherPreferences = {
  rainAlerts: true,
  frostAlerts: true,
  sprayWindows: true,
  irrigationReminders: true,
  alertCounty: "Kiambu",
  temperatureUnit: "C",
  rainfallUnit: "mm",
};

export function riskTone(level: WeatherRiskLevel): "low" | "medium" | "high" {
  return level === "High" ? "high" : level === "Moderate" ? "medium" : "low";
}

export function alertTone(level: WeatherAlertSeverity): "medium" | "high" {
  return level === "High" ? "high" : "medium";
}

export function matchTone(
  match: CropPredictionPeriod["match"],
): "low" | "medium" {
  return match === "Low" || match === "Decreasing" ? "medium" : "low";
}
