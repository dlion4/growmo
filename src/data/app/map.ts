/* ============================================================================
   PAGE 19 — FARM MAPPING & PLOT MANAGEMENT  (/app/map)

   Blueprint sections
   19.1 Interactive farm map      19.2 Plot creation & mapping
   19.3 Plot dashboard (per plot) 19.4 Multi-plot overview
   19.5 Plot problem pinning      19.6 Plot comparison analytics
   19.7 Measurement tools

   The "map" is a crafted SVG of Mary's Farm (Githunguri, Kiambu) —
   satellite/terrain views, 7 toggleable layers, clickable plots.
   Scale: 800px ≈ 420m (1px ≈ 0.525m). Elevation band 1,785–1,800m.
   Today: Tue 17/11/2026 · short rains (SR 2026).
   ========================================================================== */

export const MAP_CONTEXT = {
  farm: "Mary's Farm",
  farmer: "Mary Wanjiku",
  village: "Githunguri",
  county: "Kiambu",
  today: "Tue 17/11/2026",
  farmAreaAc: 2.92,
  farmAreaHa: 1.18,
  elevationBand: "1,785 – 1,800 m",
  survey: "Digital survey 2024 · title deed GTH/1234",
  pxPerMeter: 800 / 420, // ≈ 1.905 px per m
};

/* ---------- 19.1 map layers ---------- */

export interface MapLayer {
  id: string;
  name: string;
  desc: string;
  on: boolean;
}

export const MAP_LAYERS: MapLayer[] = [
  { id: "plots", name: "Plot boundaries", desc: "Colored by current crop", on: true },
  { id: "soil", name: "Soil sample points", desc: "6 points · last tests Sep 2026", on: true },
  { id: "water", name: "Water & irrigation", desc: "Stream, borehole, tank, lines", on: true },
  { id: "trees", name: "Trees & structures", desc: "House, store, nursery, shade trees", on: true },
  { id: "roads", name: "Access roads", desc: "Gravel road, all-weather", on: true },
  { id: "measure", name: "Measurements", desc: "Distances & boundaries shown on map", on: false },
  { id: "problems", name: "Problem areas", desc: "Pinned hotspots & drainage", on: true },
];

export type MapView = "satellite" | "terrain";

/* ---------- 19.2 creation methods ---------- */

export interface CreateMethod {
  id: string;
  name: string;
  how: string;
  accuracy: string;
  bestFor: string;
  kind: "walk" | "tap" | "dims" | "coords" | "upload" | "registry";
}

export const CREATE_METHODS: CreateMethod[] = [
  { id: "m1", name: "Walk the boundary", how: 'Open map → tap "Start" → walk the perimeter with your phone → tap "Stop" — the polygon closes automatically', accuracy: "±2 m", bestFor: "Small to medium plots", kind: "walk" },
  { id: "m2", name: "Tap points on map", how: "Tap the corners of the plot on the satellite image — points connect automatically", accuracy: "±3 m", bestFor: "Boundaries visible from satellite", kind: "tap" },
  { id: "m3", name: "Enter dimensions", how: "Enter length × width — GrowMO draws the rectangle where you place it", accuracy: "±1 m", bestFor: "Rectangular plots", kind: "dims" },
  { id: "m4", name: "GPS coordinate entry", how: "Enter lat/long corner points from your phone or a surveyor's note", accuracy: "±5 m", bestFor: "When coordinates are already known", kind: "coords" },
  { id: "m5", name: "Upload GeoJSON / KML", how: "Upload the file from your surveyor — boundary imported as-is", accuracy: "±0.1 m", bestFor: "Professionally surveyed farms", kind: "upload" },
  { id: "m6", name: "Import from land registry", how: "Link the digitized land registry by title number (where available)", accuracy: "Exact", bestFor: "Title-deeded land", kind: "registry" },
];

/* ---------- plots (19.2 form + 19.4 table) ---------- */

export type PlotColor = "leaf" | "gold" | "sprout" | "clay" | "berry" | "ink";

export interface Plot {
  id: string;
  name: string;
  color: PlotColor;
  points: number; // boundary vertices
  perimeterM: number;
  areaAc: number;
  areaHa: number;
  elevation: string;
  slope: string;
  aspect: string;
  drainage: string;
  soilType: string;
  soilPh: number;
  soilTestDate: string;
  waterSource: string;
  irrigation: string;
  prevCrop: string;
  crop: string;
  nextCrop: string;
  fencing: string;
  access: string;
  notes: string;
  stage: string;
  days: number;
  daysLeft: string;
  health: number;
  budget: number;
  spent: number;
  tasksToday: number;
  /* geometry for the SVG map */
  poly: string;
  label: [number, number];
}

export const PLOTS: Plot[] = [
  {
    id: "PL-01", name: "Shamba ya nyumba", color: "leaf",
    points: 6, perimeterM: 320, areaAc: 0.52, areaHa: 0.21,
    elevation: "1,788 – 1,800 m", slope: "2% (gentle, south-facing)", aspect: "South-facing",
    drainage: "Water flows south toward the seasonal stream",
    soilType: "Clay loam", soilPh: 5.8, soilTestDate: "Sep 2026",
    waterSource: "Rain-fed + seasonal stream 50 m south", irrigation: "Hose from borehole on dry days",
    prevCrop: "Maize (LR 2026)", crop: "Cabbage (SR 2026)", nextCrop: "Beans (LR 2027)",
    fencing: "Chain link on 3 sides, natural boundary (stream) on south",
    access: "Gravel road on north side, all-weather",
    notes: "Low-lying corner (SW) gets waterlogged in heavy rain. Consider drainage channel.",
    stage: "Vegetative (D24)", days: 24, daysLeft: "~41 days to harvest",
    health: 85, budget: 56000, spent: 22000, tasksToday: 3,
    poly: "200,150 420,140 440,300 380,380 230,360 180,260",
    label: [310, 255],
  },
  {
    id: "PL-02", name: "Shamba ya bondeni", color: "gold",
    points: 6, perimeterM: 560, areaAc: 2.0, areaHa: 0.81,
    elevation: "1,790 – 1,798 m", slope: "1% (flat)", aspect: "East-facing",
    drainage: "Free-draining; slight dip toward NE corner",
    soilType: "Silty clay loam", soilPh: 6.1, soilTestDate: "Sep 2026",
    waterSource: "Borehole 90 m south + tank", irrigation: "Drip line on 4 beds (maize row spacing)",
    prevCrop: "Cabbage (LR 2026)", crop: "Maize H614 (SR 2026)", nextCrop: "Beans (LR 2027)",
    fencing: "Post & wire all around; gate from the north track",
    access: "Farm track from the gravel road, 80 m",
    notes: "Largest plot. NE corner dries fastest — drip emitter check every week.",
    stage: "Germination (D10)", days: 10, daysLeft: "~85 days to harvest",
    health: 90, budget: 80000, spent: 25000, tasksToday: 1,
    poly: "470,120 700,140 720,330 620,430 470,400 450,250",
    label: [580, 265],
  },
  {
    id: "PL-03", name: "Nyuma ya boma", color: "sprout",
    points: 4, perimeterM: 180, areaAc: 0.3, areaHa: 0.12,
    elevation: "1,786 – 1,790 m", slope: "3% (SW dip)", aspect: "Southwest-facing",
    drainage: "Runs off toward the stream in the SW corner",
    soilType: "Sandy loam", soilPh: 6.4, soilTestDate: "Aug 2026",
    waterSource: "Stream within 30 m — bucket watering in dry spells",
    irrigation: "None currently",
    prevCrop: "Sukuma wiki (continuing)", crop: "Sukuma wiki (SR 2026)", nextCrop: "Sukuma wiki (continuing)",
    fencing: "Thorn hedge, informal",
    access: "Path from the house, 40 m",
    notes: "Center strip grows slowly — soil appears sandy, test requested 12/11.",
    stage: "Established (harvest 3 of 4)", days: 42, daysLeft: "continuous harvest",
    health: 75, budget: 8000, spent: 3000, tasksToday: 1,
    poly: "120,380 260,390 270,470 130,470",
    label: [195, 428],
  },
  {
    id: "PL-04", name: "Chini ya mti", color: "berry",
    points: 4, perimeterM: 70, areaAc: 0.1, areaHa: 0.04,
    elevation: "1,798 – 1,800 m", slope: "0% (level)", aspect: "Shaded west after 2 pm",
    drainage: "Level; clay pan holds water 1–2 days after rain",
    soilType: "Clay", soilPh: 6.8, soilTestDate: "Jun 2026",
    waterSource: "House tap + rain barrel", irrigation: "Can + rain barrel",
    prevCrop: "Mixed kitchen crops", crop: "Kitchen garden (mixed)", nextCrop: "Mixed (succession)",
    fencing: "None — behind the house wall",
    access: "Steps from the back door",
    notes: "Spinach, korosho (kale) and tomatoes in succession. Mulched well after the October heat.",
    stage: "Mixed (succession)", days: 18, daysLeft: "rolling harvest",
    health: 80, budget: 2000, spent: 800, tasksToday: 0,
    poly: "120,90 200,85 210,140 125,145",
    label: [165, 118],
  },
];

export const PLOT_COLORS: { id: PlotColor; label: string }[] = [
  { id: "leaf", label: "Green" },
  { id: "gold", label: "Gold" },
  { id: "sprout", label: "Teal" },
  { id: "clay", label: "Clay" },
  { id: "berry", label: "Berry" },
  { id: "ink", label: "Slate" },
];

/* ---------- map furniture (SVG coords) ---------- */

export const FARM_BOUNDARY = "60,80 300,40 620,55 760,140 770,330 700,470 420,505 150,480 55,300";
export const ROAD_PATH = "M40,60 C240,42 520,48 770,92";
export const STREAM_PATH = "M95,505 C260,492 520,488 745,468";

export interface SoilPoint {
  id: string;
  x: number;
  y: number;
  plotId: string;
  ph: number;
  nk: string;
  last: string;
}

export const SOIL_POINTS: SoilPoint[] = [
  { id: "SP-01", x: 250, y: 220, plotId: "PL-01", ph: 5.8, nk: "N 82 · P 9 · K 118", last: "Sep 2026" },
  { id: "SP-02", x: 355, y: 300, plotId: "PL-01", ph: 5.9, nk: "N 78 · P 11 · K 122", last: "Sep 2026" },
  { id: "SP-03", x: 550, y: 220, plotId: "PL-02", ph: 6.1, nk: "N 95 · P 14 · K 130", last: "Sep 2026" },
  { id: "SP-04", x: 640, y: 330, plotId: "PL-02", ph: 6.0, nk: "N 88 · P 12 · K 126", last: "Sep 2026" },
  { id: "SP-05", x: 190, y: 430, plotId: "PL-03", ph: 6.4, nk: "N 60 · P 8 · K 140", last: "Aug 2026" },
  { id: "SP-06", x: 163, y: 115, plotId: "PL-04", ph: 6.8, nk: "N 74 · P 16 · K 96", last: "Jun 2026" },
];

export const STRUCTURES = [
  { id: "st1", x: 245, y: 100, w: 44, h: 28, label: "House" },
  { id: "st2", x: 250, y: 168, w: 26, h: 18, label: "Store" },
  { id: "st3", x: 300, y: 425, w: 64, h: 26, label: "Nursery shade" },
  { id: "st4", x: 500, y: 448, w: 14, h: 14, label: "Borehole" },
  { id: "st5", x: 528, y: 440, w: 12, h: 12, label: "Tank 5,000 L" },
];

export const IRRIGATION_LINES = [
  "M507,448 L560,410",
  "M507,448 L430,392",
];

export const TREES = [
  { x: 150, y: 200, r: 8 }, { x: 92, y: 252, r: 7 }, { x: 452, y: 108, r: 6 },
  { x: 680, y: 178, r: 8 }, { x: 742, y: 300, r: 9 }, { x: 655, y: 452, r: 7 },
  { x: 300, y: 468, r: 8 }, { x: 178, y: 442, r: 6 }, { x: 410, y: 432, r: 7 },
  { x: 560, y: 152, r: 6 }, { x: 240, y: 30, r: 6 }, { x: 700, y: 60, r: 7 },
];

/* ---------- 19.5 problem pins ---------- */

export interface ProblemPin {
  id: string;
  x: number;
  y: number;
  plotId: string;
  location: string;
  issue: string;
  date: string;
  severity: "Low" | "Medium" | "High";
  status: "Monitoring" | "Resolved" | "Action pending";
  photo: string;
  action?: string;
}

export const PINS: ProblemPin[] = [
  {
    id: "PIN-01", x: 230, y: 355, plotId: "PL-01", location: "SW corner",
    issue: "Waterlogging after rain", date: "28/10/2026", severity: "Medium",
    status: "Monitoring", photo: "Pooled water in the low corner, 13/11",
  },
  {
    id: "PIN-02", x: 430, y: 170, plotId: "PL-01", location: "East edge, 20 m from north",
    issue: "Black rot found on 5 plants", date: "08/11/2026", severity: "High",
    status: "Resolved", photo: "Affected plants marked, then removed",
    action: "Plants removed and bagged; copper fungicide sprayed on the 1 m radius.",
  },
  {
    id: "PIN-03", x: 195, y: 428, plotId: "PL-03", location: "Center",
    issue: "Soil appears sandy, poor growth", date: "12/11/2026", severity: "Medium",
    status: "Action pending", photo: "Thin, pale stand along the center strip",
    action: "Soil test requested — sample picked up 12/11, result expected 26/11.",
  },
];

/* ---------- 19.3 plot dashboard data ---------- */

export interface ForecastDay {
  day: string;
  icon: "sun" | "rain" | "showers" | "cloud";
  hi: number;
  lo: number;
  mm: number;
  note: string;
}

export const WEATHER: Record<string, { current: string; note: string; days: ForecastDay[] }> = {
  "PL-01": {
    current: "18°C · light rain · humidity 86%",
    note: "South-facing — 1–2°C warmer at midday than the farm average",
    days: [
      { day: "Wed 18", icon: "rain", hi: 19, lo: 13, mm: 8, note: "Evening showers" },
      { day: "Thu 19", icon: "showers", hi: 21, lo: 14, mm: 3, note: "Dry by 10 am" },
      { day: "Fri 20", icon: "cloud", hi: 22, lo: 14, mm: 0, note: "Good spray window" },
      { day: "Sat 21", icon: "cloud", hi: 23, lo: 15, mm: 0, note: "Overcast, dry" },
      { day: "Sun 22", icon: "showers", hi: 21, lo: 14, mm: 4, note: "Afternoon cell" },
      { day: "Mon 23", icon: "rain", hi: 19, lo: 13, mm: 11, note: "Check SW drainage" },
      { day: "Tue 24", icon: "sun", hi: 22, lo: 13, mm: 0, note: "Clear" },
    ],
  },
  "PL-02": {
    current: "18°C · light rain · humidity 85%",
    note: "Level ground — seedbed must not crust; walk softly until D14",
    days: [
      { day: "Wed 18", icon: "rain", hi: 19, lo: 12, mm: 9, note: "Drip paused" },
      { day: "Thu 19", icon: "showers", hi: 21, lo: 13, mm: 3, note: "Emergence watch" },
      { day: "Fri 20", icon: "sun", hi: 23, lo: 14, mm: 0, note: "Germination count" },
      { day: "Sat 21", icon: "sun", hi: 24, lo: 14, mm: 0, note: "Dry, calm" },
      { day: "Sun 22", icon: "showers", hi: 22, lo: 14, mm: 5, note: "Night cell" },
      { day: "Mon 23", icon: "rain", hi: 19, lo: 13, mm: 12, note: "NE corner drains fast" },
      { day: "Tue 24", icon: "cloud", hi: 21, lo: 13, mm: 1, note: "Mostly dry" },
    ],
  },
  "PL-03": {
    current: "17°C · light rain · humidity 88%",
    note: "SW dip holds a film of water after heavy rain — harvest on dry feet",
    days: [
      { day: "Wed 18", icon: "showers", hi: 18, lo: 12, mm: 6, note: "Morning only" },
      { day: "Thu 19", icon: "cloud", hi: 20, lo: 13, mm: 0, note: "Harvest day" },
      { day: "Fri 20", icon: "cloud", hi: 21, lo: 13, mm: 0, note: "Dry" },
      { day: "Sat 21", icon: "sun", hi: 22, lo: 14, mm: 0, note: "Clear" },
      { day: "Sun 22", icon: "showers", hi: 20, lo: 13, mm: 5, note: "Evening" },
      { day: "Mon 23", icon: "rain", hi: 18, lo: 12, mm: 10, note: "SW corner watch" },
      { day: "Tue 24", icon: "cloud", hi: 20, lo: 13, mm: 1, note: "Drying" },
    ],
  },
  "PL-04": {
    current: "18°C · light rain · humidity 87%",
    note: "Afternoon shade from the mukuyu tree — clay pan dries 1–2 days after rain",
    days: [
      { day: "Wed 18", icon: "rain", hi: 18, lo: 13, mm: 7, note: "Evening" },
      { day: "Thu 19", icon: "cloud", hi: 20, lo: 13, mm: 0, note: "Shaded PM" },
      { day: "Fri 20", icon: "sun", hi: 22, lo: 14, mm: 0, note: "AM sun only" },
      { day: "Sat 21", icon: "sun", hi: 23, lo: 14, mm: 0, note: "Dry" },
      { day: "Sun 22", icon: "showers", hi: 21, lo: 13, mm: 4, note: "Night" },
      { day: "Mon 23", icon: "rain", hi: 18, lo: 13, mm: 9, note: "Clay pan watch" },
      { day: "Tue 24", icon: "cloud", hi: 21, lo: 13, mm: 1, note: "Drying" },
    ],
  },
};

export interface SoilTestRow {
  date: string;
  ph: number;
  n: number;
  p: number;
  k: number;
  organic: string;
}

export const SOIL_TRENDS: Record<string, { score: number; tests: SoilTestRow[]; rec: string }> = {
  "PL-01": {
    score: 58,
    tests: [
      { date: "Sep 2026", ph: 5.8, n: 82, p: 9, k: 118, organic: "2.1%" },
      { date: "Mar 2026", ph: 5.9, n: 76, p: 12, k: 121, organic: "2.3%" },
      { date: "Nov 2025", ph: 6.0, n: 71, p: 14, k: 119, organic: "2.4%" },
      { date: "May 2025", ph: 6.1, n: 68, p: 15, k: 117, organic: "2.6%" },
    ],
    rec: "pH trending down — apply 1 t/acre ag lime at the beans (LR 2027). P is low: reserve 25 kg DAP for seedling top-dress.",
  },
  "PL-02": {
    score: 65,
    tests: [
      { date: "Sep 2026", ph: 6.1, n: 95, p: 14, k: 130, organic: "2.8%" },
      { date: "Mar 2026", ph: 6.0, n: 90, p: 15, k: 128, organic: "2.9%" },
      { date: "Nov 2025", ph: 5.9, n: 85, p: 16, k: 125, organic: "3.0%" },
      { date: "May 2025", ph: 5.8, n: 80, p: 17, k: 122, organic: "3.1%" },
    ],
    rec: "Healthiest soil on the farm. N holding up after the maize — compost 5 t after harvest to keep organic matter above 3%.",
  },
  "PL-03": {
    score: 62,
    tests: [
      { date: "Aug 2026", ph: 6.4, n: 60, p: 8, k: 140, organic: "1.8%" },
      { date: "Feb 2026", ph: 6.5, n: 64, p: 9, k: 138, organic: "1.9%" },
      { date: "Oct 2025", ph: 6.6, n: 66, p: 10, k: 135, organic: "2.0%" },
    ],
    rec: "Sandy center strip (Pin 3) — add compost + 20 kg CAN/plot if the 26/11 test confirms low N. Mulch the strip 10 cm.",
  },
  "PL-04": {
    score: 70,
    tests: [
      { date: "Jun 2026", ph: 6.8, n: 74, p: 16, k: 96, organic: "3.4%" },
      { date: "Dec 2025", ph: 6.7, n: 70, p: 18, k: 92, organic: "3.5%" },
    ],
    rec: "Kitchen clay is rich — rotate a legume bed (dolicho) each season to hold K up.",
  },
};

export interface PlotTaskRow {
  id: string;
  time: string;
  task: string;
  worker: string;
  status: "Done" | "In progress" | "Scheduled";
}

export const PLOT_TASKS: Record<string, PlotTaskRow[]> = {
  "PL-01": [
    { id: "pt1", time: "7:30 AM", task: "Top-dress row 4–6 with CAN (3 kg)", worker: "Peter Kamau", status: "In progress" },
    { id: "pt2", time: "8:00 AM", task: "Black rot follow-up — treat 1 m radius (Pin 2)", worker: "John Mwangi", status: "Done" },
    { id: "pt3", time: "2:00 PM", task: "Hose-water SW corner after drainage check", worker: "Grace Wanjiku", status: "Scheduled" },
  ],
  "PL-02": [
    { id: "pt4", time: "9:00 AM", task: "Germination check D10 — count 5 rows", worker: "Samuel Njoroge", status: "In progress" },
  ],
  "PL-03": [
    { id: "pt5", time: "7:00 AM", task: "Harvest sukuma — bundle #3 for Gikomba", worker: "David Maina", status: "Done" },
  ],
  "PL-04": [],
};

export const PLOT_LABOUR: Record<string, { name: string; role: string; since: string }[]> = {
  "PL-01": [
    { name: "John Mwangi", role: "Rot treatment + weeding", since: "7:45 AM" },
    { name: "Peter Kamau", role: "Fertilizer top-dress", since: "8:10 AM" },
    { name: "Grace Wanjiku", role: "Watering (afternoon)", since: "arrives 1:30 PM" },
  ],
  "PL-02": [{ name: "Samuel Njoroge", role: "Emergence check", since: "8:30 AM" }],
  "PL-03": [{ name: "David Maina", role: "Harvest + tying bundles", since: "7:00 AM" }],
  "PL-04": [],
};

export interface InputRow {
  item: string;
  allocated: string;
  used: string;
  left: string;
  from: string;
}

export const PLOT_INPUTS: Record<string, InputRow[]> = {
  "PL-01": [
    { item: "Cabbage seedlings (F1)", allocated: "2,800", used: "2,800", left: "0", from: "On-farm nursery, Oct 24" },
    { item: "CAN (26-12-2)", allocated: "50 kg", used: "3 kg", left: "47 kg", from: "Store — Githunguri Agrovet" },
    { item: "DAP", allocated: "25 kg", used: "25 kg", left: "0", from: "Store — baseline dress" },
    { item: "Compost", allocated: "2 t", used: "2 t", left: "0", from: "Farm compost pit" },
    { item: "Copper fungicide (500 mL)", allocated: "1 L", used: "350 mL", left: "650 mL", from: "Store — Pin 2 spray" },
  ],
  "PL-02": [
    { item: "Maize seed H614", allocated: "45 kg", used: "45 kg", left: "0", from: "KenGen Seed, planted Nov 7" },
    { item: "DAP", allocated: "100 kg", used: "100 kg", left: "0", from: "Store — planting dress" },
    { item: "NPK 23-10-5", allocated: "50 kg", used: "0", left: "50 kg", from: "Store — side-dress at D30" },
    { item: "Drip tape", allocated: "400 m", used: "400 m", left: "0", from: "Laid 2025, re-used" },
  ],
  "PL-03": [
    { item: "Sukuma cuttings", allocated: "600", used: "600", left: "0", from: "On-farm, 2024 stand" },
    { item: "Compost", allocated: "1 t", used: "600 kg", left: "400 kg", from: "Compost pit" },
  ],
  "PL-04": [
    { item: "Spinach / korosho seed", allocated: "200 g", used: "120 g", left: "80 g", from: "Kitchen stash" },
    { item: "Compost + manure mix", allocated: "1.5 t", used: "1.5 t", left: "0", from: "Household pit" },
  ],
};

export interface FinanceRow {
  line: string;
  budget: number;
  spent: number;
}

export const PLOT_FINANCE: Record<string, FinanceRow[]> = {
  "PL-01": [
    { line: "Seedlings (nursery)", budget: 9600, spent: 9600 },
    { line: "Fertilizer (DAP + CAN)", budget: 18500, spent: 6100 },
    { line: "Fungicide (Pin 2)", budget: 3200, spent: 1400 },
    { line: "Labour", budget: 20000, spent: 4900 },
    { line: "Drainage channel (planned)", budget: 4700, spent: 0 },
  ],
  "PL-02": [
    { line: "Maize seed H614", budget: 14400, spent: 14400 },
    { line: "Fertilizer (DAP + NPK)", budget: 32000, spent: 10600 },
    { line: "Labour", budget: 28000, spent: 0 },
    { line: "Drip check + spare emitters", budget: 5600, spent: 0 },
  ],
  "PL-03": [
    { line: "Compost + mulch", budget: 3500, spent: 1800 },
    { line: "Labour (harvest)", budget: 4500, spent: 1200 },
  ],
  "PL-04": [
    { line: "Seed + seedlings", budget: 900, spent: 400 },
    { line: "Compost", budget: 1100, spent: 400 },
  ],
};

export interface PhotoRow {
  id: string;
  caption: string;
  date: string;
  kind: "crop" | "problem" | "structure";
}

export const PLOT_PHOTOS: Record<string, PhotoRow[]> = {
  "PL-01": [
    { id: "ph1", caption: "Cabbage rows D24 — uniform canopy", date: "15/11/2026", kind: "crop" },
    { id: "ph2", caption: "SW corner after the 13/11 rain — water pooled", date: "13/11/2026", kind: "problem" },
    { id: "ph3", caption: "Black rot plants removed (Pin 2)", date: "08/11/2026", kind: "problem" },
  ],
  "PL-02": [
    { id: "ph4", caption: "Emergence D10 — 92% in row 1–3", date: "17/11/2026", kind: "crop" },
    { id: "ph5", caption: "Drip line on beds 1–4 after refill", date: "09/11/2026", kind: "structure" },
    { id: "ph6", caption: "NE corner after the first dry spell", date: "02/11/2026", kind: "crop" },
  ],
  "PL-03": [
    { id: "ph7", caption: "Bundle #3 tied for Gikomba", date: "17/11/2026", kind: "crop" },
    { id: "ph8", caption: "Center strip — pale, thin stand (Pin 3)", date: "12/11/2026", kind: "problem" },
  ],
  "PL-04": [
    { id: "ph9", caption: "Tomatoes setting after the heat break", date: "14/11/2026", kind: "crop" },
    { id: "ph10", caption: "Rain barrel refilled from the house gutter", date: "10/11/2026", kind: "structure" },
  ],
};

export interface HistoryRow {
  season: string;
  crop: string;
  yieldNote: string;
  problem: string;
}

export const PLOT_HISTORY: Record<string, HistoryRow[]> = {
  "PL-01": [
    { season: "SR 2026", crop: "Cabbage (current)", yieldNote: "on track — 3.1 t/acre expected", problem: "Black rot (5 plants, removed 08/11)" },
    { season: "LR 2026", crop: "Maize H614", yieldNote: "820 kg/acre", problem: "Fall armyworm in June — 2 sprays" },
    { season: "SR 2025", crop: "Kale", yieldNote: "1,900 bundles/week at peak", problem: "None" },
    { season: "LR 2025", crop: "Maize", yieldNote: "760 kg/acre", problem: "Waterlogging in SW (noted since)" },
  ],
  "PL-02": [
    { season: "SR 2026", crop: "Maize H614 (current)", yieldNote: "900+ kg/acre expected at this vigour", problem: "None so far" },
    { season: "LR 2026", crop: "Cabbage", yieldNote: "2.8 t/acre", problem: " Aphid pressure in April" },
    { season: "SR 2025", crop: "Maize", yieldNote: "740 kg/acre", problem: "Late drought stress in Nov" },
  ],
  "PL-03": [
    { season: "Ongoing (2024–)", crop: "Sukuma wiki", yieldNote: "250–350 bundles/week", problem: "Center strip slow since 2025" },
  ],
  "PL-04": [
    { season: "Ongoing (2022–)", crop: "Kitchen mix", yieldNote: "household + 10–20 bundles/week surplus", problem: "Clay pan waterlogging in wet spells" },
  ],
};

export interface NoteRow {
  id: string;
  date: string;
  text: string;
}

export const PLOT_NOTES: Record<string, NoteRow[]> = {
  "PL-01": [
    { id: "n1", date: "13/11/2026", text: "Low-lying corner (SW) gets waterlogged in heavy rain. Consider drainage channel — 3 m toward the stream, ~KES 4,700." },
    { id: "n2", date: "08/11/2026", text: "Black rot confirmed on 5 plants at the east edge. Removed + sprayed. Watch the same rows at D30." },
    { id: "n3", date: "24/10/2026", text: "Transplanted 2,800 F1 seedlings in 4 m rows. Dressed with 25 kg DAP at planting." },
  ],
  "PL-02": [
    { id: "n4", date: "07/11/2026", text: "Planted H614 — 45 kg seed, 4 m rows, 75 cm spacing. DAP banded at 5 cm." },
    { id: "n5", date: "02/11/2026", text: "NE corner dries fastest — moved 2 drip emitters closer to the tank side." },
  ],
  "PL-03": [
    { id: "n6", date: "12/11/2026", text: "Center strip growing poorly, soil looks sandy. Test requested — pick up result 26/11." },
    { id: "n7", date: "20/10/2026", text: "Harvest pattern: 3 mornings/week, ~90 bundles each. Gikomba stall takes #2 and #4." },
  ],
  "PL-04": [
    { id: "n8", date: "10/11/2026", text: "Mulched all beds with straw after the October heat — soil temp finally back to normal." },
  ],
};

/* ---------- 19.6 comparison ---------- */

export interface CompareRow {
  plotId: string;
  plotName: string;
  costAc: number;
  revAc: number;
  roi: string;
  soilScore: number;
  efficiency: string;
}

export const COMPARE: CompareRow[] = [
  { plotId: "PL-01", plotName: "Plot 1 · Cabbage", costAc: 107692, revAc: 830769, roi: "672%", soilScore: 58, efficiency: "85 heads/worker-day" },
  { plotId: "PL-02", plotName: "Plot 2 · Maize", costAc: 40000, revAc: 201000, roi: "402%", soilScore: 65, efficiency: "— (D10)" },
  { plotId: "PL-03", plotName: "Plot 3 · Sukuma", costAc: 26667, revAc: 100000, roi: "275%", soilScore: 62, efficiency: "120 bundles/worker-day" },
  { plotId: "PL-04", plotName: "Plot 4 · Kitchen", costAc: 20000, revAc: 25000, roi: "25%", soilScore: 70, efficiency: "—" },
];

export const FARM_AVG_COMPARE = {
  costAc: 50000,
  revAc: 316438,
  roi: "533%",
  soilScore: 62,
};

/* ---------- 19.7 measurement tools ---------- */

export interface MeasureTool {
  id: string;
  name: string;
  how: string;
  use: string;
  kind: "distance" | "area" | "elevation" | "slope" | "sun";
}

export const MEASURE_TOOLS: MeasureTool[] = [
  { id: "t1", name: "Distance measure", how: "Tap 2 points on the map → distance in m/km", use: "Fence length, road distance, stream gap", kind: "distance" },
  { id: "t2", name: "Area measure", how: "Draw a polygon → area in m² / acres / ha", use: "New plot shape, sub-sections", kind: "area" },
  { id: "t3", name: "Elevation profile", how: "Draw a line → elevation change along it", use: "Drainage planning, irrigation routing", kind: "elevation" },
  { id: "t4", name: "Slope calculator", how: "Draw a line → % slope along it", use: "Erosion risk, terracing needs", kind: "slope" },
  { id: "t5", name: "Sun exposure", how: "Sun path over the plot across seasons", use: "Crop layout, shade management", kind: "sun" },
];

export const DISTANCE_PRESETS: { id: string; label: string; a: [number, number]; b: [number, number]; m: number }[] = [
  { id: "d1", label: "House → borehole", a: [267, 114], b: [507, 455], m: 152 },
  { id: "d2", label: "Gravel road → Plot 2 gate", a: [470, 52], b: [470, 120], m: 36 },
  { id: "d3", label: "Stream → Plot 1 SW corner", a: [230, 496], b: [230, 355], m: 74 },
  { id: "d4", label: "Plot 1 → Plot 2 (center to center)", a: [310, 255], b: [580, 265], m: 142 },
];

export const ELEVATION_PROFILES = [
  {
    id: "e1",
    label: "North → south across Plot 1",
    points: [1800, 1799, 1797, 1794, 1791, 1788, 1786, 1785],
    note: "Steady 2% fall — the SW corner (1,785 m) is the pooling point. A 3 m channel to the stream fixes it.",
  },
  {
    id: "e2",
    label: "West → east across Plot 2",
    points: [1793, 1794, 1795, 1796, 1797, 1797, 1796, 1795],
    note: "Nearly flat with a slight NE dip — drainage is free; watch the NE corner for dry-out, not pooling.",
  },
  {
    id: "e3",
    label: "House → stream (south)",
    points: [1800, 1798, 1795, 1791, 1787, 1785, 1783, 1781],
    note: "The steepest line on the farm (6% near the stream) — never terrace across it without a bund.",
  },
];

export const SLOPE_PRESETS = [
  { id: "s1", label: "Plot 1 main slope", pct: 2, verdict: "Gentle — no erosion risk, standard cultivation" },
  { id: "s2", label: "Plot 2 (whole)", pct: 1, verdict: "Flat — ideal for the drip layout" },
  { id: "s3", label: "Stream edge (S edge of Plot 1)", pct: 6, verdict: "Above 5% — mulch + grass strip before the stream" },
  { id: "s4", label: "Plot 3 SW dip", pct: 3, verdict: "Mild — bund the bottom 2 m if waterlogging continues" },
];

export const SUN_EXPOSURE = [
  { plot: "Plot 1 · Cabbage", dec: "7.5 h full", jun: "5.0 h full", note: "South-facing — strongest light on the farm; watch tip burn in December" },
  { plot: "Plot 2 · Maize", dec: "6.5 h full", jun: "5.5 h full", note: "East-facing — morning sun, dries after lunch" },
  { plot: "Plot 3 · Sukuma", dec: "5.5 h full", jun: "3.5 h full", note: "SW — afternoon sun only; cool mornings suit the succulent" },
  { plot: "Plot 4 · Kitchen", dec: "4.0 h full", jun: "2.5 h full", note: "Mukuyu tree shades the west after 2 pm all year" },
];

export const MAP_ALERTS = [
  { id: "ma1", tone: "warn" as const, text: "PIN-01 (Plot 1, SW corner) still monitoring — Mon 23/11 rain expected (11 mm). Drainage channel quote ready: KES 4,700." },
  { id: "ma2", tone: "info" as const, text: "Soil test for PIN-03 (Plot 3 center) in the lab — result expected 26/11." },
  { id: "ma3", tone: "success" as const, text: "PIN-02 black rot resolved 08/11 — 5 plants removed, radius sprayed. No new lesions since." },
];
