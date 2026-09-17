/* ============================================================================
   GrowMO SITE DATA — single content source for Home / Services / Shop.
   Drawn from growmo.md + growmo-p2.md (28-page platform blueprint).
   ========================================================================== */
import {
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  Bot,
  CloudSun,
  Cpu,
  Droplets,
  FlaskConical,
  HandCoins,
  Leaf,
  MapPin,
  Recycle,
  Satellite,
  ShieldCheck,
  ShoppingBasket,
  Smartphone,
  Sprout,
  Store,
  Tractor,
  TrendingUp,
  Users,
  Wallet,
  Warehouse,
  Wheat,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Types ------------------------------ */
export interface Service {
  slug: string;
  name: string;
  tagline: string;
  category: "Grow" | "Intelligence" | "Sell" | "Money" | "Manage";
  icon: LucideIcon;
  hue: string; // gradient for art tiles
  description: string;
  longDescription: string[];
  features: { title: string; desc: string }[];
  stats: { value: string; label: string }[];
  blueprint: string; // which blueprint page it maps to
  priceHint: string;
}

export interface Product {
  slug: string;
  name: string;
  swahili: string;
  category: "Seeds" | "Fertilizer" | "Crop Protection" | "Irrigation" | "Tools & Equipment" | "Storage";
  price: number;
  oldPrice?: number;
  unit: string;
  rating: number;
  reviews: number;
  badge?: string;
  sale?: boolean;
  stock: number;
  icon: LucideIcon;
  hue: string;
  blurb: string;
  features: string[];
}

export const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

/* ------------------------------ Services (8) ------------------------------ */
export const SERVICES: Service[] = [
  {
    slug: "crop-planning",
    name: "Crop Planning & Variety Intelligence",
    tagline: "Right crop, right variety, right plot — every season.",
    category: "Grow",
    icon: Sprout,
    hue: "linear-gradient(135deg,#166534,#22a355 55%,#7bd88f)",
    description:
      "Match your soil, altitude and rainfall to the most profitable varieties — from Gloria F1 cabbage to H6213 maize — with season-long plans generated in minutes.",
    longDescription: [
      "GrowMO reads your farm profile — county, altitude, rainfall band and soil type — and classifies your agro-ecological zone automatically. It then recommends crops and certified varieties ranked by expected profit per acre, not guesswork.",
      "Every plan ships with a full-season calendar: planting dates, spacing, fertilizer schedule, spray program, labour needs and a budget — all tuned to the Long and Short rains.",
    ],
    features: [
      { title: "AEZ auto-classification", desc: "11 Kenyan zones from LH1 highlands to CL2 coast, detected from your GPS." },
      { title: "Variety library", desc: "Certified varieties with maturity days, yield potential and seed rates." },
      { title: "Rotation planner", desc: "Multi-season rotations that rebuild soil and break pest cycles." },
      { title: "Budget per acre", desc: "Full input + labour budgets with M-Pesa-ready purchase lists." },
    ],
    stats: [
      { value: "40+", label: "Crops in library" },
      { value: "11", label: "AEZ zones mapped" },
      { value: "2×", label: "Avg. yield lift" },
    ],
    blueprint: "Pages 3, 4, 23 — Planner, Growth Tracker, Rotation",
    priceHint: "Free to plan · Premium from KES 99/mo",
  },
  {
    slug: "ai-advisor",
    name: "AI Farm Advisor",
    tagline: "A agronomist in your pocket, 24/7, in your language.",
    category: "Intelligence",
    icon: Bot,
    hue: "linear-gradient(135deg,#3b0764,#7c3aed 55%,#22d3ee)",
    description:
      "Chat with GrowMO AI in English or Kiswahili — diagnose pests from a photo, get spray recipes, market forecasts and input optimization instantly.",
    longDescription: [
      "The AI Advisor fuses your farm records, soil tests, weather feed and market prices into one conversational brain. Ask anything — 'My cabbage leaves have holes, what do I spray?' — and get a precise, safe answer with rates per knapsack.",
      "It also predicts: pest outbreaks 7 days ahead, price movements per market, and your expected harvest income — so you act before problems cost you.",
    ],
    features: [
      { title: "Photo diagnosis", desc: "Snap a leaf — AI identifies pests, diseases and deficiencies." },
      { title: "Spray recipes", desc: "Exact chemical, rate per 20L, PHI and safety gear per crop." },
      { title: "Price forecasting", desc: "7–30 day price outlooks for 30+ markets across Kenya." },
      { title: "Voice + SMS mode", desc: "Works for low-literacy and feature-phone farmers via USSD." },
    ],
    stats: [
      { value: "93%", label: "Diagnosis accuracy" },
      { value: "7-day", label: "Pest early warning" },
      { value: "24/7", label: "Always available" },
    ],
    blueprint: "Page 9 — AI Advisor & Predictive Engine",
    priceHint: "5 free chats/day · Unlimited on Premium",
  },
  {
    slug: "weather-intelligence",
    name: "Weather & Climate Intelligence",
    tagline: "Plant with the rains, not against them.",
    category: "Intelligence",
    icon: CloudSun,
    hue: "linear-gradient(135deg,#0c4a6e,#0284c7 55%,#7dd3fc)",
    description:
      "Hyper-local forecasts, planting windows and extreme-weather alerts tuned to your crop stage — from germination to harvest.",
    longDescription: [
      "GrowMO blends satellite data with county stations to forecast your exact ward — not 'Central Kenya'. You get 7-day field-action forecasts, 3-month seasonal outlooks and alerts that translate weather into farm tasks.",
      "'High humidity + rain = black rot risk. Apply Mancozeb within 48hrs.' That is the difference between data and decisions.",
    ],
    features: [
      { title: "Ward-level forecasts", desc: "7-day outlook with rain probability per 3-hour block." },
      { title: "Planting window advisor", desc: "Tells you the exact week to plant per crop and zone." },
      { title: "Crop-risk engine", desc: "Links humidity, temp and leaf-wetness to disease outbreaks." },
      { title: "SMS alerts", desc: "Storm, frost and dry-spell warnings even without internet." },
    ],
    stats: [
      { value: "47", label: "Counties covered" },
      { value: "3-hr", label: "Forecast granularity" },
      { value: "85%", label: "Alert accuracy" },
    ],
    blueprint: "Page 8 — Weather & Climate Intelligence",
    priceHint: "Free basic · Pro alerts on Premium",
  },
  {
    slug: "soil-health",
    name: "Soil Health & Lab Testing",
    tagline: "Stop guessing. Test, then feed your soil precisely.",
    category: "Grow",
    icon: FlaskConical,
    hue: "linear-gradient(135deg,#713f12,#b45309 55%,#fbbf24)",
    description:
      "Doorstep soil sampling, accredited lab results and AI fertilizer recipes calibrated to your exact pH, NPK and organic matter.",
    longDescription: [
      "Most Kenyan farms over-apply DAP and starve on lime and manure. GrowMO's sampling kits and lab partners (KALRO, SoilCares, county labs) reveal exactly what your soil needs.",
      "Results flow straight into fertilizer schedules — basal, top-dress and foliar — with quantities per plot and cost comparisons across suppliers.",
    ],
    features: [
      { title: "Sampling kits", desc: "Delivered to your agrovet or farm with Swahili video guides." },
      { title: "Accredited labs", desc: "KALRO, SoilCares and county labs with 5–7 day turnaround." },
      { title: "AI fertilizer recipes", desc: "Lime + NPK + manure blends matched to target yield." },
      { title: "pH & moisture tracking", desc: "Season trends with long-term soil rebuilding plans." },
    ],
    stats: [
      { value: "30%", label: "Avg. fertilizer savings" },
      { value: "12+", label: "Partner labs" },
      { value: "5-day", label: "Result turnaround" },
    ],
    blueprint: "Page 17 — Soil Health & Testing Management",
    priceHint: "From KES 1,200/test incl. interpretation",
  },
  {
    slug: "market-linkage",
    name: "Market Linkage & Buyer Orders",
    tagline: "Sell at the best price — before you harvest.",
    category: "Sell",
    icon: Store,
    hue: "linear-gradient(135deg,#9a3412,#ea580c 55%,#fdba74)",
    description:
      "Live prices from 30+ markets, verified buyers, shareable crop portfolios and contract farming boards — no more broker exploitation.",
    longDescription: [
      "GrowMO streams daily prices from Wakulima, Kongowea, Kisumu Jubilee and 27 more markets, then recommends where to sell after transport costs. List your standing crop with photos and harvest dates — buyers order straight from your portfolio link.",
      "Negotiate in-app, sign digital contracts, and get paid to your GrowMO wallet or M-Pesa on delivery confirmation.",
    ],
    features: [
      { title: "Live price ticker", desc: "30+ markets, per crop, grade and unit — updated daily." },
      { title: "Crop portfolio links", desc: "Shareable harvest pages buyers can order from directly." },
      { title: "Verified buyers", desc: "Supermarkets, processors and exporters with ratings." },
      { title: "Contract board", desc: "Bid for contract farming slots with transparent terms." },
    ],
    stats: [
      { value: "30+", label: "Markets tracked" },
      { value: "2,400+", label: "Verified buyers" },
      { value: "+18%", label: "Avg. price uplift" },
    ],
    blueprint: "Pages 10, 21 — Market, Orders & Portfolio",
    priceHint: "Free listings · 2% success fee on orders",
  },
  {
    slug: "farm-finance",
    name: "Farm Finance & M-Pesa Wallet",
    tagline: "Every shilling tracked, from seed to sale.",
    category: "Money",
    icon: Wallet,
    hue: "linear-gradient(135deg,#065f46,#10b981 55%,#6ee7b7)",
    description:
      "Budgets per crop, expense capture via M-Pesa auto-sync, payroll auto-pay and profit/loss statements that banks actually accept.",
    longDescription: [
      "Your GrowMO wallet links to M-Pesa for one-tap input purchases, worker payments and buyer receipts. Every transaction auto-categorizes into per-crop budgets with cash-flow forecasts that warn you before money runs dry.",
      "Generate bank-grade P&L statements and build a financial identity that unlocks input loans and asset financing.",
    ],
    features: [
      { title: "M-Pesa auto-sync", desc: "STK push payments logged and categorized automatically." },
      { title: "Per-crop budgets", desc: "Planned vs actual spend with overspend alerts." },
      { title: "Auto-pay workers", desc: "Scheduled payroll with digital payslips and records." },
      { title: "Loan readiness", desc: "P&L + cash-flow reports formatted for lenders." },
    ],
    stats: [
      { value: "100%", label: "M-Pesa integrated" },
      { value: "KES 2.1B", label: "Tracked farm spend" },
      { value: "4.9★", label: "Farmer rating" },
    ],
    blueprint: "Pages 7, 14 — Finance, Wallet & Mobile Money",
    priceHint: "Free wallet · Premium analytics KES 99/mo",
  },
  {
    slug: "labour-management",
    name: "Labour & Team Management",
    tagline: "Hire, schedule and pay your team without the chaos.",
    category: "Manage",
    icon: Users,
    hue: "linear-gradient(135deg,#1e3a8a,#3b82f6 55%,#93c5fd)",
    description:
      "Worker directory, task scheduling, attendance via PIN, M-Pesa payroll and county wage benchmarks — full HR for your shamba.",
    longDescription: [
      "Assign weeding, spraying or harvest tasks with quantities and deadlines. Workers confirm by PIN or SMS; you verify with photos. Payday runs itself — M-Pesa bulk pay with deductions, advances and NSSF/NHIF-ready records.",
      "County wage benchmarks keep you fair and competitive, while performance scores spotlight your star workers.",
    ],
    features: [
      { title: "Task scheduler", desc: "Plot-linked tasks with inputs, rates and deadlines." },
      { title: "PIN attendance", desc: "Clock-in by phone PIN, SMS or supervisor check." },
      { title: "Bulk M-Pesa payroll", desc: "One tap pays the whole team with digital receipts." },
      { title: "Compliance records", desc: "Contracts, advances and statutory-ready reports." },
    ],
    stats: [
      { value: "60k+", label: "Workers managed" },
      { value: "3 min", label: "To run payroll" },
      { value: "47", label: "Wage benchmarks" },
    ],
    blueprint: "Pages 6, 15.3 — Labour, Team & HR",
    priceHint: "Free up to 5 workers · KES 149/mo unlimited",
  },
  {
    slug: "traceability",
    name: "Traceability & Certification",
    tagline: "Export-grade records that open premium markets.",
    category: "Sell",
    icon: BadgeCheck,
    hue: "linear-gradient(135deg,#581c87,#a855f7 55%,#e9d5ff)",
    description:
      "Spray diaries, batch QR codes, GlobalG.A.P and KS1758 checklists — prove your quality from seed to shelf.",
    longDescription: [
      "Supermarkets and exporters pay more for traceable produce. GrowMO auto-builds your farm diary from tasks — every spray, fertilizer and harvest logged with dates, rates and photos.",
      "Each batch gets a QR code buyers can scan. Certification trackers walk you step-by-step to KS1758, GlobalG.A.P or Organic status with auditor-ready exports.",
    ],
    features: [
      { title: "Auto farm diary", desc: "Every task becomes a compliance-grade record." },
      { title: "Batch QR codes", desc: "Scan-to-trace from your plot to the buyer's shelf." },
      { title: "KS1758 & GlobalG.A.P", desc: "Guided checklists with gap analysis and timelines." },
      { title: "Residue safety", desc: "Pre-harvest interval guards block early harvest sales." },
    ],
    stats: [
      { value: "+25%", label: "Certified price premium" },
      { value: "3", label: "Standards supported" },
      { value: "1-tap", label: "Auditor export" },
    ],
    blueprint: "Page 12 — Records, Traceability & Compliance",
    priceHint: "Free diary · Certification packs from KES 499",
  },
];

export const SERVICE_CATEGORIES = ["All", "Grow", "Intelligence", "Sell", "Money", "Manage"] as const;

/* ------------------------------ Shop products (12) ------------------------------ */
export const PRODUCTS: Product[] = [
  {
    slug: "gloria-f1-cabbage-seeds",
    name: "Gloria F1 Cabbage Seeds — 50g",
    swahili: "Mbegu za Kabichi",
    category: "Seeds",
    price: 1850,
    oldPrice: 2200,
    unit: "per 50g tin",
    rating: 4.9,
    reviews: 2314,
    badge: "Best Seller",
    sale: true,
    stock: 140,
    icon: Sprout,
    hue: "linear-gradient(135deg,#166534,#22a355 55%,#7bd88f)",
    blurb: "Kenya's favourite hybrid — 5–7kg heads in 90 days, superb black-rot tolerance.",
    features: ["90-day maturity", "5–7 kg uniform heads", "Black-rot tolerant", "KEPHIS certified"],
  },
  {
    slug: "h6213-maize-seed",
    name: "H6213 Maize Seed — 10kg",
    swahili: "Mbegu za Mahindi",
    category: "Seeds",
    price: 3400,
    unit: "per 10kg bag",
    rating: 4.8,
    reviews: 1876,
    badge: "Highlands Pick",
    stock: 220,
    icon: Wheat,
    hue: "linear-gradient(135deg,#a16207,#ca8a04 55%,#fde047)",
    blurb: "High-altitude champion yielding 30–35 bags/acre with dense, lodge-resistant stalks.",
    features: ["30–35 bags/acre", "Gives flour-quality grain", "Tolerant to GLS & rust", "For 1500–2200m zones"],
  },
  {
    slug: "rose-coco-beans",
    name: "Rosecoco Beans — 5kg",
    swahili: "Maharagwe Rosecoco",
    category: "Seeds",
    price: 1450,
    unit: "per 5kg bag",
    rating: 4.7,
    reviews: 942,
    stock: 180,
    icon: Leaf,
    hue: "linear-gradient(135deg,#9a3412,#c2410c 55%,#fdba74)",
    blurb: "Fast-cooking, market-loved red beans. Matures in 75 days, superb for rotation.",
    features: ["75-day maturity", "High market demand", "Fixes soil nitrogen", "Drought-escaping"],
  },
  {
    slug: "can-fertilizer-50kg",
    name: "CAN Fertilizer 26% — 50kg",
    swahili: "Mbolea ya CAN",
    category: "Fertilizer",
    price: 3950,
    oldPrice: 4300,
    unit: "per 50kg bag",
    rating: 4.8,
    reviews: 3102,
    badge: "Deal",
    sale: true,
    stock: 320,
    icon: ShoppingBasket,
    hue: "linear-gradient(135deg,#1e3a8a,#3b82f6 55%,#93c5fd)",
    blurb: "Top-dressing essential for maize, cabbage and wheat during rapid vegetative growth.",
    features: ["26% nitrogen", "Fast-acting nitrate", "Low scorch risk", "KEBS certified"],
  },
  {
    slug: "dap-fertilizer-50kg",
    name: "DAP Fertilizer 18:46 — 50kg",
    swahili: "Mbolea ya DAP",
    category: "Fertilizer",
    price: 5200,
    unit: "per 50kg bag",
    rating: 4.9,
    reviews: 2871,
    stock: 260,
    icon: ShoppingBasket,
    hue: "linear-gradient(135deg,#0c4a6e,#0284c7 55%,#7dd3fc)",
    blurb: "Planting-time phosphorus powerhouse for strong roots and vigorous establishment.",
    features: ["18% N + 46% P₂O₅", "Strong rooting", "Blended with zinc options", "KEBS certified"],
  },
  {
    slug: "organic-compost-70l",
    name: "Black Gold Compost — 70L",
    swahili: "Mboji Asilia",
    category: "Fertilizer",
    price: 950,
    unit: "per 70L bag",
    rating: 4.6,
    reviews: 654,
    badge: "Organic",
    stock: 400,
    icon: Recycle,
    hue: "linear-gradient(135deg,#3f6212,#65a30d 55%,#bef264)",
    blurb: "Fully matured organic compost — rebuilds soil life, structure and water retention.",
    features: ["Weed-seed free", "pH balanced 6.5–7", "Boosts microbes", "Ideal for nurseries"],
  },
  {
    slug: "mancozeb-1kg",
    name: "Mancozeb 80% WP — 1kg",
    swahili: "Dawa ya Ukungu",
    category: "Crop Protection",
    price: 1250,
    unit: "per 1kg pack",
    rating: 4.7,
    reviews: 1533,
    stock: 190,
    icon: ShieldCheck,
    hue: "linear-gradient(135deg,#581c87,#7c3aed 55%,#c4b5fd)",
    blurb: "Broad-spectrum shield against blight, black rot and rust across vegetables.",
    features: ["80% WP formulation", "50g per 20L rate", "14-day PHI", "PCPB registered"],
  },
  {
    slug: "neem-oil-1l",
    name: "Cold-Pressed Neem Oil — 1L",
    swahili: "Mafuta ya Mwarobaini",
    category: "Crop Protection",
    price: 1650,
    unit: "per 1L bottle",
    rating: 4.8,
    reviews: 821,
    badge: "Organic",
    stock: 150,
    icon: Droplets,
    hue: "linear-gradient(135deg,#065f46,#10b981 55%,#6ee7b7)",
    blurb: "Organic pest + fungal control safe for beneficials — perfect for export crops.",
    features: ["10,000 ppm azadirachtin", "Zero-day PHI", "Bee-safe when dry", "Export compliant"],
  },
  {
    slug: "drip-kit-eighth",
    name: "Drip Irrigation Kit — 1/8 Acre",
    swahili: "Seti ya Matone",
    category: "Irrigation",
    price: 14500,
    oldPrice: 16900,
    unit: "complete kit",
    rating: 4.9,
    reviews: 1104,
    badge: "Save KES 2,400",
    sale: true,
    stock: 45,
    icon: Droplets,
    hue: "linear-gradient(135deg,#0e7490,#06b6d4 55%,#a5f3fc)",
    blurb: "Complete gravity drip system — tank connector, filters, 500m tape + fittings.",
    features: ["Saves 60% water", "500m drip tape", "Install guide + video", "Free agronomist call"],
  },
  {
    slug: "solar-pump-1hp",
    name: "Solar Water Pump — 1HP",
    swahili: "Pampu ya Sola",
    category: "Irrigation",
    price: 48500,
    unit: "pump + panels",
    rating: 4.9,
    reviews: 386,
    badge: "Premium",
    stock: 18,
    icon: Cpu,
    hue: "linear-gradient(135deg,#713f12,#d97706 55%,#fde68a)",
    blurb: "Pump 25,000L/day free from the sun — borehole, river or dam ready.",
    features: ["25,000 L/day", "2× 550W panels incl.", "60m head", "2-year warranty"],
  },
  {
    slug: "knapsack-sprayer-20l",
    name: "Knapsack Sprayer — 20L",
    swahili: "Bomba la Kunyunyizia",
    category: "Tools & Equipment",
    price: 3200,
    oldPrice: 3800,
    unit: "per unit",
    rating: 4.6,
    reviews: 1290,
    sale: true,
    stock: 210,
    icon: Tractor,
    hue: "linear-gradient(135deg,#334155,#64748b 55%,#cbd5e1)",
    blurb: "Heavy-duty 20L sprayer with brass trigger, 4 nozzles and padded straps.",
    features: ["Brass adjustable nozzle", "4 nozzle set", "Chemical-resistant seals", "Spare kit included"],
  },
  {
    slug: "hermetic-bags-10pc",
    name: "Hermetic Storage Bags — 10pcs",
    swahili: "Magunia ya Kuhifadhia",
    category: "Storage",
    price: 2400,
    unit: "10 × 90kg bags",
    rating: 4.8,
    reviews: 976,
    badge: "Zero Loss",
    stock: 300,
    icon: Warehouse,
    hue: "linear-gradient(135deg,#7c2d12,#c2410c 55%,#fed7aa)",
    blurb: "Zero-chemical grain storage — locks out weevils and moisture for 12+ months.",
    features: ["No chemicals needed", "12-month protection", "Reusable 3 seasons", "90kg capacity each"],
  },
];

export const PRODUCT_CATEGORIES = [
  "All",
  "Seeds",
  "Fertilizer",
  "Crop Protection",
  "Irrigation",
  "Tools & Equipment",
  "Storage",
] as const;

/* ------------------------------ Testimonials ------------------------------ */
export interface Testimonial {
  name: string;
  role: string;
  county: string;
  quote: string;
  rating: number;
  initials: string;
  hue: string;
  result: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Mary Wanjiku",
    role: "Cabbage & Dairy Farmer",
    county: "Kiambu",
    quote:
      "GrowMO told me black rot was coming three days before I saw it. One spray saved my whole half-acre — 7,000 heads sold at KES 32 each.",
    rating: 5,
    initials: "MW",
    hue: "linear-gradient(135deg,#166534,#4cc38a)",
    result: "+KES 224,000 season income",
  },
  {
    name: "Kiprono Bett",
    role: "Maize Farmer, 4 Acres",
    county: "Uasin Gishu",
    quote:
      "The soil test showed I was wasting DAP every year. New recipe cut my fertilizer bill by a third and I still got 31 bags per acre.",
    rating: 5,
    initials: "KB",
    hue: "linear-gradient(135deg,#b45309,#fbbf24)",
    result: "−32% input costs",
  },
  {
    name: "Amina Odhiambo",
    role: "Tomato Greenhouse Farmer",
    county: "Kajiado",
    quote:
      "My buyer found me through my GrowMO portfolio link. No broker, no games — contract price locked before transplanting.",
    rating: 5,
    initials: "AO",
    hue: "linear-gradient(135deg,#9a3412,#fdba74)",
    result: "+18% better prices",
  },
  {
    name: "Peter Mwangi",
    role: "Cooperative Chairman",
    county: "Meru",
    quote:
      "We run 84 members on GrowMO — bulk input orders, one payroll run, and our potatoes now carry QR traceability to the supermarket.",
    rating: 5,
    initials: "PM",
    hue: "linear-gradient(135deg,#1e3a8a,#60a5fa)",
    result: "84 members digitized",
  },
  {
    name: "Grace Achieng",
    role: "Rice & Beans Farmer",
    county: "Kisumu",
    quote:
      "I use the SMS version on my kabambe. Planting alerts, prices in Jubilee market, and worker pay — all without internet.",
    rating: 5,
    initials: "GA",
    hue: "linear-gradient(135deg,#0e7490,#67e8f9)",
    result: "100% offline capable",
  },
  {
    name: "Daniel Mutua",
    role: "Mango Exporter",
    county: "Makueni",
    quote:
      "KS1758 certification used to terrify me. GrowMO's checklist + spray diary got us audit-ready in one season. Now we export.",
    rating: 5,
    initials: "DM",
    hue: "linear-gradient(135deg,#581c87,#c4b5fd)",
    result: "Export certified",
  },
];

/* ------------------------------ FAQs ------------------------------ */
export const FAQS = [
  {
    q: "Is GrowMO free for smallholder farmers?",
    a: "Yes. The core platform — crop planning, weather, market prices, farm diary and M-Pesa wallet — is free forever. Premium (KES 99/month) unlocks unlimited AI chats, pest forecasting and advanced analytics. Most farmers earn back a year's Premium from a single better-timed spray.",
  },
  {
    q: "I don't have a smartphone. Can I still use GrowMO?",
    a: "Absolutely. Dial *384*MO (*384*66) from any phone for USSD access to prices, weather and tasks. SMS alerts work on kabambe phones, and our 2,000+ agrovet agents can register and serve you in person.",
  },
  {
    q: "How does the M-Pesa integration work?",
    a: "Link your M-Pesa number once. Pay for inputs with STK push, pay workers in bulk on payday, and receive buyer payments straight to your GrowMO wallet. Every transaction auto-records into your per-crop budget — no manual entry.",
  },
  {
    q: "Which counties and crops are supported?",
    a: "All 47 counties with ward-level weather, and 40+ crops from maize, beans and potatoes to French beans, macadamia and dairy fodder. Each crop ships with certified variety data, spacing, fertilizer and spray programs for Kenyan conditions.",
  },
  {
    q: "How do soil tests work?",
    a: "Order a KES 1,200 kit from the Shop or any partner agrovet, follow the Swahili video to sample each plot, and drop it at a collection point. Accredited lab results land in your app within 5–7 days with an AI fertilizer recipe per plot.",
  },
  {
    q: "Can buyers really order from my farm directly?",
    a: "Yes. Your crop portfolio page shows your standing crops with photos, expected harvest dates and grades. Share the link on WhatsApp — buyers place orders, you confirm, sign a digital contract, and get paid on delivery confirmation.",
  },
  {
    q: "Is my farm data safe?",
    a: "GrowMO complies with Kenya's Data Protection Act 2019. Data is encrypted (AES-256 at rest, TLS 1.3 in transit), backed up every 6 hours, and never sold. You can export or delete everything at any time.",
  },
  {
    q: "Do you work with cooperatives and agrovets?",
    a: "Yes — 300+ cooperatives manage members, bulk buying and collective sales on GrowMO, and 2,000+ agrovets serve as input pickup points, soil-kit agents and M-Pesa cash-in partners. Contact us for partnership onboarding.",
  },
];

/* ------------------------------ Pricing ------------------------------ */
export const PRICING = [
  {
    name: "Mbegu (Seed)",
    price: "Free",
    period: "forever",
    desc: "Everything a starting farmer needs to plan and track one season.",
    cta: "Start free",
    features: [
      "Crop planner + 1 active crop",
      "Ward weather + SMS alerts",
      "Live market prices",
      "M-Pesa wallet + budgets",
      "Farm diary + records",
      "5 AI chats / day",
    ],
  },
  {
    name: "Mavuno (Harvest)",
    price: "KES 99",
    period: "/month",
    desc: "For serious commercial farmers who want predictions, not surprises.",
    cta: "Go Mavuno",
    popular: true,
    features: [
      "Unlimited crops + plots",
      "Unlimited AI advisor + photo diagnosis",
      "7-day pest & price forecasts",
      "Soil-test interpretation + recipes",
      "Buyer portfolio + contracts",
      "Payroll for unlimited workers",
    ],
  },
  {
    name: "Chama / Cooperative",
    price: "KES 2,499",
    period: "/month",
    desc: "Run your whole group — bulk buying, collective sales, one dashboard.",
    cta: "Talk to us",
    features: [
      "Up to 200 member accounts",
      "Collective input procurement",
      "Aggregated marketing + traceability",
      "Group wallet + statements",
      "Extension officer dashboard",
      "Priority phone support",
    ],
  },
];

/* ------------------------------ Misc ------------------------------ */
export const MARKET_TICKER = [
  { crop: "Cabbage (Gloria F1)", price: "KES 32/head", market: "Wakulima", trend: "up" },
  { crop: "Maize (90kg)", price: "KES 4,100/bag", market: "Eldoret", trend: "up" },
  { crop: "Beans Rosecoco", price: "KES 7,200/bag", market: "Nyamakima", trend: "down" },
  { crop: "Tomatoes (64kg)", price: "KES 5,800/crate", market: "Mombasa", trend: "up" },
  { crop: "Potatoes (50kg)", price: "KES 2,900/bag", market: "Wakulima", trend: "up" },
  { crop: "Avocado (Hass)", price: "KES 18/pc", market: "Export", trend: "up" },
  { crop: "Onions (14kg)", price: "KES 1,650/net", market: "Kongowea", trend: "down" },
  { crop: "Milk", price: "KES 52/litre", market: "Githunguri", trend: "up" },
];

export const PLATFORM_TABS = [
  {
    id: "planner",
    label: "Crop Planner",
    icon: Sprout,
    title: "A full-season plan in 3 minutes",
    desc: "Pick your plot, pick your crop — GrowMO builds planting dates, spacing, fertilizer, spray and labour schedules tuned to your AEZ and the coming rains.",
    points: ["AEZ-tuned variety ranking", "Auto fertilizer + spray calendar", "Per-acre budget with M-Pesa list"],
    hue: "linear-gradient(135deg,#166534,#22a355 60%,#a7f3d0)",
    stat: "3 min",
    statLabel: "plan generation",
  },
  {
    id: "ai",
    label: "AI Advisor",
    icon: Bot,
    title: "Ask anything. Get agronomist-grade answers.",
    desc: "Snap a sick leaf or ask in Kiswahili — the AI diagnoses, prescribes exact rates per 20L knapsack, and warns you about outbreaks a week early.",
    points: ["Photo pest diagnosis", "Exact spray recipes + PHI", "7-day outbreak prediction"],
    hue: "linear-gradient(135deg,#3b0764,#7c3aed 60%,#67e8f9)",
    stat: "93%",
    statLabel: "diagnosis accuracy",
  },
  {
    id: "market",
    label: "Markets",
    icon: TrendingUp,
    title: "Sell where the price is highest",
    desc: "Live prices from 30+ markets with transport-adjusted recommendations, verified buyers and shareable harvest portfolios.",
    points: ["30+ live market feeds", "Transport-adjusted advice", "Direct buyer ordering"],
    hue: "linear-gradient(135deg,#9a3412,#ea580c 60%,#fdba74)",
    stat: "+18%",
    statLabel: "avg. price uplift",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    title: "M-Pesa-native farm banking",
    desc: "One wallet for inputs, payroll and buyer payments. Every shilling auto-categorized into per-crop budgets with cash-flow guards.",
    points: ["STK push + bulk payroll", "Auto budget categorization", "Bank-grade P&L reports"],
    hue: "linear-gradient(135deg,#065f46,#10b981 60%,#a7f3fc)",
    stat: "2.1B",
    statLabel: "KES tracked spend",
  },
];

export const STATS = [
  { value: 128000, suffix: "+", label: "Farmers growing with GrowMO", display: "128K+" },
  { value: 47, suffix: "", label: "Counties with ward-level data", display: "47" },
  { value: 30, suffix: "+", label: "Live produce markets tracked", display: "30+" },
  { value: 94, suffix: "%", label: "Farmers reporting higher income", display: "94%" },
];

export const COUNTIES_SAMPLE = ["Kiambu", "Nakuru", "Meru", "Kakamega", "Uasin Gishu", "Kisumu", "Makueni", "Kilifi"];

export { Banknote, BarChart3, Bell, HandCoins, MapPin, Satellite, ShieldCheck, Smartphone, Tractor };
export type { LucideIcon };
export const ICONS = { Leaf, Droplets, Store, Users, Wheat, Warehouse, FlaskConical, CloudSun, Bot, Sprout, MapPin, Tractor, ShieldCheck, Smartphone, Satellite, Bell, BarChart3, HandCoins, Banknote };
