/* ============================================================================
   PAGE 21 — BUYER NEGOTIATIONS, ORDERS & CROP PORTFOLIO
   Kenyan demo data for Delion Farm, Githunguri, Kiambu County.
   ========================================================================== */

export type PortfolioState = "Draft" | "Live" | "Paused" | "Harvested";
export type InquiryStatus =
  | "New"
  | "Negotiating"
  | "Accepted"
  | "Declined"
  | "Expired";
export type OrderStatus =
  | "Confirmed"
  | "Negotiating"
  | "Preparing"
  | "Delivered"
  | "Cancelled";
export type PaymentStatus =
  | "Deposit received"
  | "Pending delivery"
  | "Cash on pickup"
  | "Paid"
  | "Overdue";

export interface Portfolio {
  id: string;
  crop: string;
  variety: string;
  plot: string;
  acreage: string;
  harvest: string;
  available: number;
  unit: string;
  gradeA: number;
  price: number;
  state: PortfolioState;
  linkViews: number;
}

export const PORTFOLIOS: Portfolio[] = [
  {
    id: "GRM-KMB-2027-001",
    crop: "Cabbage",
    variety: "Gloria F1",
    plot: "Plot 1 · Shamba ya nyumba",
    acreage: "0.52 acres",
    harvest: "15–22 Jan 2027",
    available: 11500,
    unit: "heads",
    gradeA: 69,
    price: 35,
    state: "Live",
    linkViews: 47,
  },
  {
    id: "GRM-KMB-2027-002",
    crop: "Kale",
    variety: "Sukuma Wiki Mfalme F1",
    plot: "Plot 3 · Greenhouse edge",
    acreage: "0.30 acres",
    harvest: "Weekly from 08 Jan",
    available: 2400,
    unit: "bundles",
    gradeA: 82,
    price: 18,
    state: "Live",
    linkViews: 31,
  },
  {
    id: "GRM-KMB-2027-003",
    crop: "Tomato",
    variety: "Anna F1",
    plot: "Greenhouse 1",
    acreage: "0.22 acres",
    harvest: "10–28 Feb 2027",
    available: 3200,
    unit: "kg",
    gradeA: 74,
    price: 95,
    state: "Draft",
    linkViews: 0,
  },
  {
    id: "GRM-KMB-2026-018",
    crop: "French beans",
    variety: "Amy",
    plot: "Plot 2 · Upper field",
    acreage: "0.45 acres",
    harvest: "20 Dec 2026",
    available: 0,
    unit: "kg",
    gradeA: 71,
    price: 120,
    state: "Harvested",
    linkViews: 86,
  },
  {
    id: "GRM-KMB-2027-004",
    crop: "Spinach",
    variety: "Fordhook Giant",
    plot: "Plot 3 · Home shamba",
    acreage: "0.18 acres",
    harvest: "25 Jan 2027",
    available: 800,
    unit: "bundles",
    gradeA: 78,
    price: 20,
    state: "Paused",
    linkViews: 12,
  },
  {
    id: "GRM-KMB-2027-005",
    crop: "Coriander",
    variety: "Local selected",
    plot: "Plot 1 · Kitchen garden",
    acreage: "0.08 acres",
    harvest: "Weekly from 18 Jan",
    available: 1200,
    unit: "bunches",
    gradeA: 88,
    price: 12,
    state: "Draft",
    linkViews: 0,
  },
];

export const FARM_IDENTITY = {
  farm: "Delion Farm",
  farmer: "Mary Wanjiku Kamau",
  county: "Kiambu",
  subCounty: "Githunguri",
  coordinates: "-1.1667, 36.8333",
  size: "2.92 acres",
  farmingYears: "8 years",
  phone: "0712 345 678",
  whatsapp: "0712 345 678",
  rating: "4.7★ · 12 transactions",
  cooperative: "Kiambu Vegetable Farmers Cooperative",
  certifications: "KS1758 · in progress · PCPB trained",
  verified: true,
};

export const PRIMARY_CROP = {
  portfolioId: "GRM-KMB-2027-001",
  crop: "Cabbage",
  variety: "Gloria F1 · F1 hybrid",
  seedCompany: "Simlaw Seeds · certified",
  seedCertificate: "KEPHIS-SC-5678",
  plot: "Plot 1 · Shamba ya nyumba",
  acreage: "0.52 acres",
  planted: "20 Oct 2026",
  expectedMaturity: "15 Jan 2027 · 90 days",
  stage: "Vegetative · Day 45",
  harvestWindow: "15–22 Jan 2027",
  growingMethod: "Rain-fed + supplementary drip irrigation",
  soil: "Clay loam · pH 5.8 · lime amended",
  fertiliser: "DAP basal + 2 × CAN top-dress + K foliar at heading",
  pestPlan: "IPM scouting, Mancozeb fungicide, Duduthrin insecticide",
  lastSpray: "15 Dec 2026 · Imidacloprid",
  phi: "Clear from 05 Jan 2027",
  residue: "Not tested · spray PHIs are clear",
  water: "Rain + seasonal stream + stored tank water",
};

export const GAP_CHECKLIST = [
  {
    id: "gap-01",
    item: "Certified seed used",
    evidence: "KEPHIS certificate number on seed record",
    status: "Ready" as const,
  },
  {
    id: "gap-02",
    item: "Soil test within 12 months",
    evidence: "Sep 2026 · KALRO Lab report",
    status: "Ready" as const,
  },
  {
    id: "gap-03",
    item: "Fertilizer follows recommendation",
    evidence: "Soil-test programme in crop records",
    status: "Ready" as const,
  },
  {
    id: "gap-04",
    item: "PCPB-registered pesticides",
    evidence: "All products checked in spray diary",
    status: "Ready" as const,
  },
  {
    id: "gap-05",
    item: "Pre-harvest intervals respected",
    evidence: "PHI calculator clear from 05 Jan",
    status: "Ready" as const,
  },
  {
    id: "gap-06",
    item: "No banned pesticides",
    evidence: "GrowMO PCPB cross-check",
    status: "Ready" as const,
  },
  {
    id: "gap-07",
    item: "PPE used during spraying",
    evidence: "Sprayer log and worker sign-off",
    status: "Ready" as const,
  },
  {
    id: "gap-08",
    item: "Clean irrigation water documented",
    evidence: "Tank and stream source record",
    status: "Ready" as const,
  },
  {
    id: "gap-09",
    item: "Harvest hygiene planned",
    evidence: "New crates and shaded pack area",
    status: "Ready" as const,
  },
  {
    id: "gap-10",
    item: "Batch traceability active",
    evidence: "GRM-KMB-2027-001 batch record",
    status: "Ready" as const,
  },
  {
    id: "gap-11",
    item: "Worker hygiene training",
    evidence: "Training held 18 Oct 2026",
    status: "Ready" as const,
  },
  {
    id: "gap-12",
    item: "Post-harvest SOPs available",
    evidence: "Shade, clean crates, no ground contact",
    status: "Ready" as const,
  },
];

export const PORTFOLIO_PHOTOS = [
  {
    id: "photo-01",
    caption: "Farm overview · Plot 1 with cabbage",
    date: "25 Oct 2026",
    kind: "Field overview",
  },
  {
    id: "photo-02",
    caption: "Healthy cabbage plants at vegetative stage",
    date: "15 Nov 2026",
    kind: "Crop health",
  },
  {
    id: "photo-03",
    caption: "Cabbage heads forming",
    date: "08 Dec 2026",
    kind: "Crop health",
  },
  {
    id: "photo-04",
    caption: "Mature cabbage heads near harvest",
    date: "10 Jan 2027",
    kind: "Crop health",
  },
  {
    id: "photo-05",
    caption: "Harvested cabbage, graded and crated",
    date: "15 Jan 2027",
    kind: "Harvest",
  },
  {
    id: "photo-06",
    caption: "Farm storage and shade area",
    date: "20 Oct 2026",
    kind: "Facility",
  },
  {
    id: "photo-07",
    caption: "KALRO soil test report",
    date: "Sep 2026",
    kind: "Evidence",
  },
  {
    id: "photo-08",
    caption: "Spray record summary",
    date: "15 Dec 2026",
    kind: "Evidence",
  },
  {
    id: "photo-09",
    caption: "Mary with the first harvest",
    date: "15 Jan 2027",
    kind: "Farmer",
  },
];

export const AVAILABILITY = {
  expected: 14500,
  committed: 3000,
  available: 11500,
  window: "15–22 Jan 2027",
  pickup: "From 15 Jan · any day",
  packing: "New crates · 30 heads per crate, or loose",
  delivery:
    "Farmer delivers Kiambu–Nairobi at KES 50/km · buyer collects · arranged transport",
  minimum: "100 heads",
  grades: [
    {
      grade: "Grade A",
      detail: "Firm · 1.5–2.5 kg",
      count: 10000,
      price: 35,
      crate: 1050,
      tonne: 23333,
    },
    {
      grade: "Grade B",
      detail: "1.0–1.5 kg",
      count: 3500,
      price: 25,
      crate: 750,
      tonne: 16667,
    },
    {
      grade: "Grade C",
      detail: "Under 1 kg",
      count: 1000,
      price: 15,
      crate: 450,
      tonne: 10000,
    },
    {
      grade: "Mixed",
      detail: "All grades",
      count: 14500,
      price: 30,
      crate: 900,
      tonne: 20000,
    },
  ],
  discounts: [">5,000 heads · 5% off", ">10,000 heads · 10% off"],
};

export const PAYMENT_TERMS = [
  {
    id: "pay-01",
    option: "Cash on delivery",
    detail: "Full payment when the buyer receives the consignment.",
  },
  {
    id: "pay-02",
    option: "M-Pesa on delivery",
    detail: "Full M-Pesa transfer on delivery confirmation.",
  },
  {
    id: "pay-03",
    option: "Partial deposit",
    detail: "50% to confirm; balance on delivery.",
  },
  {
    id: "pay-04",
    option: "7-day credit",
    detail: "For trusted buyers with a GrowMO rating above 4★.",
  },
  {
    id: "pay-05",
    option: "14-day credit",
    detail: "Available to cooperative members only.",
  },
  {
    id: "pay-06",
    option: "Contract price",
    detail: "Fixed price when the order is placed before harvest.",
  },
];

export const LINK_ANALYTICS = [
  {
    id: "metric-01",
    label: "Portfolio views",
    value: "47",
    note: "Last 30 days",
  },
  {
    id: "metric-02",
    label: "Unique viewers",
    value: "23",
    note: "Verified sessions",
  },
  {
    id: "metric-03",
    label: "Inquiries",
    value: "8",
    note: "Buyer intent recorded",
  },
  {
    id: "metric-04",
    label: "Orders placed",
    value: "3",
    note: "From this link",
  },
  {
    id: "metric-05",
    label: "Most viewed",
    value: "Gallery",
    note: "38 visits",
  },
  {
    id: "metric-06",
    label: "Top referrer",
    value: "WhatsApp",
    note: "65% of traffic",
  },
];

export interface Buyer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  location: string;
  rating: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  notes: string;
  verified: boolean;
  paymentHistory: string;
  crops: string;
}

export const BUYERS: Buyer[] = [
  {
    id: "BYR-001",
    name: "Karen Greens Restaurant",
    company: "Karen Greens Ltd",
    phone: "0722 410 981",
    email: "orders@karengreens.co.ke",
    location: "Karen, Nairobi",
    rating: "5.0★",
    orders: 24,
    totalSpent: 580000,
    lastOrder: "Oct 2026",
    notes: "Best buyer; pays on time and takes premium grade.",
    verified: true,
    paymentHistory: "100% on time",
    crops: "Cabbage, kale, spinach",
  },
  {
    id: "BYR-002",
    name: "Kamau Brokers",
    company: "Marikiti Fresh Brokers",
    phone: "0718 632 446",
    email: "kamau@marikitifresh.co.ke",
    location: "Wakulima Market, Nairobi",
    rating: "3.5★",
    orders: 45,
    totalSpent: 1200000,
    lastOrder: "Jan 2027",
    notes: "Reliable volume but pushes price down.",
    verified: true,
    paymentHistory: "93% on time",
    crops: "Cabbage, tomato, onions",
  },
  {
    id: "BYR-003",
    name: "James Otieno",
    company: "Fresh Produce Kenya Ltd",
    phone: "0722 345 678",
    email: "james@freshproduce.co.ke",
    location: "Mombasa Rd, Nairobi",
    rating: "4.3★",
    orders: 1,
    totalSpent: 0,
    lastOrder: "Pending",
    notes: "New; possible 8-week cabbage contract.",
    verified: true,
    paymentHistory: "100% on time",
    crops: "Cabbage, tomato, kale",
  },
  {
    id: "BYR-004",
    name: "Muthoni Wairimu",
    company: "Wairimu Grocers",
    phone: "0701 882 119",
    email: "muthoni@wairimugrocers.co.ke",
    location: "Thika, Kiambu",
    rating: "4.8★",
    orders: 12,
    totalSpent: 198000,
    lastOrder: "Nov 2026",
    notes: "Collects herself; consistent small orders.",
    verified: true,
    paymentHistory: "100% on time",
    crops: "Kale, spinach, coriander",
  },
  {
    id: "BYR-005",
    name: "Amina Hassan",
    company: "Amina Mama Mboga",
    phone: "0790 573 812",
    email: "amina@freshmama.co.ke",
    location: "Githunguri, Kiambu",
    rating: "4.6★",
    orders: 18,
    totalSpent: 164000,
    lastOrder: "Dec 2026",
    notes: "Cash buyer; books early around holidays.",
    verified: false,
    paymentHistory: "Cash on collection",
    crops: "Cabbage, kale",
  },
  {
    id: "BYR-006",
    name: "Peter Wekesa",
    company: "Nairobi Family Mart",
    phone: "0716 923 405",
    email: "peter@familymart.co.ke",
    location: "Kilimani, Nairobi",
    rating: "4.5★",
    orders: 9,
    totalSpent: 267000,
    lastOrder: "Aug 2026",
    notes: "Needs invoices and crate count at receiving.",
    verified: true,
    paymentHistory: "100% on time",
    crops: "Tomato, cabbage",
  },
  {
    id: "BYR-007",
    name: "Njeri Mwangi",
    company: "Kikuyu Fresh Hub",
    phone: "0704 610 322",
    email: "njeri@kikuyufresh.co.ke",
    location: "Kikuyu, Kiambu",
    rating: "4.2★",
    orders: 7,
    totalSpent: 92000,
    lastOrder: "Sep 2026",
    notes: "Good for end-of-week surplus.",
    verified: true,
    paymentHistory: "86% on time",
    crops: "Spinach, kale",
  },
  {
    id: "BYR-008",
    name: "Daniel Kiptoo",
    company: "GreenRoute Caterers",
    phone: "0735 091 762",
    email: "orders@greenroute.co.ke",
    location: "Westlands, Nairobi",
    rating: "4.7★",
    orders: 14,
    totalSpent: 338000,
    lastOrder: "Oct 2026",
    notes: "Requests clean traceability packs.",
    verified: true,
    paymentHistory: "100% on time",
    crops: "Cabbage, French beans",
  },
  {
    id: "BYR-009",
    name: "Wanjiku Njoki",
    company: "Ruiru School Kitchen",
    phone: "0710 446 531",
    email: "procurement@ruiruschool.ac.ke",
    location: "Ruiru, Kiambu",
    rating: "4.1★",
    orders: 6,
    totalSpent: 84000,
    lastOrder: "Jul 2026",
    notes: "Term-time bulk demand; purchase order required.",
    verified: true,
    paymentHistory: "100% on time",
    crops: "Cabbage, spinach",
  },
  {
    id: "BYR-010",
    name: "Brian Ouma",
    company: "City Bowl Supplies",
    phone: "0788 802 277",
    email: "brian@citybowl.co.ke",
    location: "Ngara, Nairobi",
    rating: "4.0★",
    orders: 5,
    totalSpent: 76000,
    lastOrder: "Jun 2026",
    notes: "Pickup buyer with flexible grade mix.",
    verified: false,
    paymentHistory: "80% on time",
    crops: "Coriander, kale, cabbage",
  },
];

export interface Inquiry {
  id: string;
  buyerId: string;
  buyer: string;
  company: string;
  phone: string;
  crop: string;
  quantity: number;
  unit: string;
  grade: string;
  proposedPrice: number;
  delivery: string;
  date: string;
  payment: string;
  status: InquiryStatus;
  received: string;
  note: string;
}

export const INQUIRIES: Inquiry[] = [
  {
    id: "INQ-001",
    buyerId: "BYR-003",
    buyer: "James Otieno",
    company: "Fresh Produce Kenya Ltd",
    phone: "0722 345 678",
    crop: "Cabbage",
    quantity: 2000,
    unit: "heads",
    grade: "Grade A",
    proposedPrice: 32,
    delivery: "Deliver · Mombasa Rd",
    date: "18 Jan 2027",
    payment: "M-Pesa on delivery",
    status: "Negotiating",
    received: "Today · 09:14",
    note: "Looking for consistent weekly supply; can we discuss contract?",
  },
  {
    id: "INQ-002",
    buyerId: "BYR-001",
    buyer: "Karen Greens Restaurant",
    company: "Karen Greens Ltd",
    phone: "0722 410 981",
    crop: "Cabbage",
    quantity: 3000,
    unit: "heads",
    grade: "Grade A",
    proposedPrice: 35,
    delivery: "Deliver · Karen",
    date: "15 Jan 2027",
    payment: "50% deposit",
    status: "Accepted",
    received: "Yesterday · 16:20",
    note: "Usual premium-grade order for menu launch.",
  },
  {
    id: "INQ-003",
    buyerId: "BYR-002",
    buyer: "Kamau Brokers",
    company: "Marikiti Fresh Brokers",
    phone: "0718 632 446",
    crop: "Cabbage",
    quantity: 5000,
    unit: "heads",
    grade: "Mixed",
    proposedPrice: 30,
    delivery: "Buyer collects",
    date: "20 Jan 2027",
    payment: "Cash on pickup",
    status: "Negotiating",
    received: "Yesterday · 11:08",
    note: "Can take all grades if collection is at 5 AM.",
  },
  {
    id: "INQ-004",
    buyerId: "BYR-004",
    buyer: "Muthoni Wairimu",
    company: "Wairimu Grocers",
    phone: "0701 882 119",
    crop: "Kale",
    quantity: 500,
    unit: "bundles",
    grade: "Premium",
    proposedPrice: 18,
    delivery: "Buyer collects",
    date: "12 Jan 2027",
    payment: "M-Pesa on delivery",
    status: "New",
    received: "Mon · 14:50",
    note: "Weekly standing order requested.",
  },
  {
    id: "INQ-005",
    buyerId: "BYR-005",
    buyer: "Amina Hassan",
    company: "Amina Mama Mboga",
    phone: "0790 573 812",
    crop: "Cabbage",
    quantity: 200,
    unit: "heads",
    grade: "Grade A",
    proposedPrice: 35,
    delivery: "Buyer collects",
    date: "15 Jan 2027",
    payment: "Cash on pickup",
    status: "Accepted",
    received: "Mon · 10:32",
    note: "Walk-in WhatsApp pickup.",
  },
  {
    id: "INQ-006",
    buyerId: "BYR-006",
    buyer: "Peter Wekesa",
    company: "Nairobi Family Mart",
    phone: "0716 923 405",
    crop: "Cabbage",
    quantity: 1200,
    unit: "heads",
    grade: "Grade A + B",
    proposedPrice: 31,
    delivery: "Deliver · Kilimani",
    date: "19 Jan 2027",
    payment: "7-day credit",
    status: "New",
    received: "Sun · 17:05",
    note: "Please include traceability and crate count.",
  },
  {
    id: "INQ-007",
    buyerId: "BYR-008",
    buyer: "Daniel Kiptoo",
    company: "GreenRoute Caterers",
    phone: "0735 091 762",
    crop: "Cabbage",
    quantity: 800,
    unit: "heads",
    grade: "Grade A",
    proposedPrice: 34,
    delivery: "Deliver · Westlands",
    date: "16 Jan 2027",
    payment: "M-Pesa on delivery",
    status: "New",
    received: "Sun · 09:00",
    note: "Need delivery by 8 AM for catering prep.",
  },
  {
    id: "INQ-008",
    buyerId: "BYR-009",
    buyer: "Wanjiku Njoki",
    company: "Ruiru School Kitchen",
    phone: "0710 446 531",
    crop: "Cabbage",
    quantity: 1500,
    unit: "heads",
    grade: "Mixed",
    proposedPrice: 28,
    delivery: "Deliver · Ruiru",
    date: "22 Jan 2027",
    payment: "Purchase order",
    status: "New",
    received: "Sat · 13:12",
    note: "School reopening order; invoice and PO needed.",
  },
  {
    id: "INQ-009",
    buyerId: "BYR-010",
    buyer: "Brian Ouma",
    company: "City Bowl Supplies",
    phone: "0788 802 277",
    crop: "Coriander",
    quantity: 300,
    unit: "bunches",
    grade: "Any",
    proposedPrice: 10,
    delivery: "Buyer collects",
    date: "20 Jan 2027",
    payment: "M-Pesa on delivery",
    status: "Declined",
    received: "Fri · 18:40",
    note: "Requested quantity exceeds current coriander plan.",
  },
  {
    id: "INQ-010",
    buyerId: "BYR-007",
    buyer: "Njeri Mwangi",
    company: "Kikuyu Fresh Hub",
    phone: "0704 610 322",
    crop: "Spinach",
    quantity: 400,
    unit: "bundles",
    grade: "Premium",
    proposedPrice: 20,
    delivery: "Buyer collects",
    date: "28 Jan 2027",
    payment: "Cash on pickup",
    status: "Expired",
    received: "Thu · 08:25",
    note: "Portfolio was paused while irrigation lines were repaired.",
  },
];

export const NEGOTIATION_THREAD = [
  {
    id: "msg-01",
    from: "Mary",
    at: "Today · 09:24",
    text: "Hi James, thanks for your interest. For 2,000 Grade A heads, my price is KES 35 each. Delivery to Mombasa Rd is KES 5,000 extra.",
  },
  {
    id: "msg-02",
    from: "James",
    at: "Today · 09:31",
    text: "Can you do KES 33? I am buying regularly and looking for a weekly supply of 2,000 heads.",
  },
  {
    id: "msg-03",
    from: "Mary",
    at: "Today · 09:42",
    text: "KES 34 per head if you commit to eight weeks. I will hold that allocation for you.",
  },
  {
    id: "msg-04",
    from: "James",
    at: "Today · 09:49",
    text: "Deal. KES 34 × 2,000 equals KES 68,000 per week. Start on 18 January.",
  },
];

export interface FarmOrder {
  id: string;
  buyerId: string;
  buyer: string;
  crop: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  deliveryDate: string;
  delivery: string;
  status: OrderStatus;
  payment: PaymentStatus;
  paymentDetail: string;
}

export const FARM_ORDERS: FarmOrder[] = [
  {
    id: "ORD-001",
    buyerId: "BYR-001",
    buyer: "Karen Greens Restaurant",
    crop: "Cabbage",
    quantity: 3000,
    unit: "heads",
    price: 35,
    total: 105000,
    deliveryDate: "15 Jan 2027",
    delivery: "Deliver · Karen",
    status: "Confirmed",
    payment: "Deposit received",
    paymentDetail: "50% received · KES 52,500",
  },
  {
    id: "ORD-002",
    buyerId: "BYR-003",
    buyer: "Fresh Produce Kenya Ltd",
    crop: "Cabbage",
    quantity: 2000,
    unit: "heads",
    price: 34,
    total: 68000,
    deliveryDate: "18 Jan 2027",
    delivery: "Deliver · Mombasa Rd",
    status: "Confirmed",
    payment: "Pending delivery",
    paymentDetail: "M-Pesa on delivery",
  },
  {
    id: "ORD-003",
    buyerId: "BYR-002",
    buyer: "Kamau Brokers",
    crop: "Cabbage",
    quantity: 5000,
    unit: "heads",
    price: 30,
    total: 150000,
    deliveryDate: "20 Jan 2027",
    delivery: "Buyer collects",
    status: "Negotiating",
    payment: "Pending delivery",
    paymentDetail: "Terms not agreed",
  },
  {
    id: "ORD-004",
    buyerId: "BYR-005",
    buyer: "Walk-in · Amina",
    crop: "Cabbage",
    quantity: 200,
    unit: "heads",
    price: 35,
    total: 7000,
    deliveryDate: "15 Jan 2027",
    delivery: "Buyer collects",
    status: "Confirmed",
    payment: "Cash on pickup",
    paymentDetail: "Collect at pack shade",
  },
  {
    id: "ORD-005",
    buyerId: "BYR-004",
    buyer: "Wairimu Grocers",
    crop: "Kale",
    quantity: 500,
    unit: "bundles",
    price: 18,
    total: 9000,
    deliveryDate: "12 Jan 2027",
    delivery: "Buyer collects",
    status: "Preparing",
    payment: "Pending delivery",
    paymentDetail: "M-Pesa on collection",
  },
  {
    id: "ORD-006",
    buyerId: "BYR-008",
    buyer: "GreenRoute Caterers",
    crop: "Cabbage",
    quantity: 800,
    unit: "heads",
    price: 34,
    total: 27200,
    deliveryDate: "16 Jan 2027",
    delivery: "Deliver · Westlands",
    status: "Confirmed",
    payment: "Deposit received",
    paymentDetail: "KES 13,600 paid",
  },
  {
    id: "ORD-007",
    buyerId: "BYR-006",
    buyer: "Nairobi Family Mart",
    crop: "Cabbage",
    quantity: 1200,
    unit: "heads",
    price: 32,
    total: 38400,
    deliveryDate: "19 Jan 2027",
    delivery: "Deliver · Kilimani",
    status: "Negotiating",
    payment: "Pending delivery",
    paymentDetail: "Credit review requested",
  },
  {
    id: "ORD-008",
    buyerId: "BYR-009",
    buyer: "Ruiru School Kitchen",
    crop: "Cabbage",
    quantity: 1500,
    unit: "heads",
    price: 29,
    total: 43500,
    deliveryDate: "22 Jan 2027",
    delivery: "Deliver · Ruiru",
    status: "Preparing",
    payment: "Pending delivery",
    paymentDetail: "Purchase order pending",
  },
  {
    id: "ORD-009",
    buyerId: "BYR-007",
    buyer: "Kikuyu Fresh Hub",
    crop: "Spinach",
    quantity: 320,
    unit: "bundles",
    price: 20,
    total: 6400,
    deliveryDate: "10 Jan 2027",
    delivery: "Buyer collects",
    status: "Delivered",
    payment: "Paid",
    paymentDetail: "M-Pesa · QLJ8N3HX",
  },
  {
    id: "ORD-010",
    buyerId: "BYR-010",
    buyer: "City Bowl Supplies",
    crop: "Coriander",
    quantity: 300,
    unit: "bunches",
    price: 12,
    total: 3600,
    deliveryDate: "05 Jan 2027",
    delivery: "Buyer collects",
    status: "Cancelled",
    payment: "Pending delivery",
    paymentDetail: "Buyer cancelled before harvest",
  },
];

export const CONTRACT = {
  id: "CON-2027-001",
  seller: "Mary Wanjiku · Delion Farm · Kiambu · ID 12345678",
  buyer: "Fresh Produce Kenya Ltd · Reg C.218496",
  crop: "Cabbage · Gloria F1 · Grade A",
  quantity: "2,000 heads per week",
  duration: "18 Jan – 11 Mar 2027 · 8 weeks",
  price: "KES 34/head · KES 68,000/week",
  value: 544000,
  delivery: "Warehouse 4, Mombasa Rd · every Monday by 10 AM",
  payment: "M-Pesa on delivery · full amount",
  quality: "1.5–2.5 kg, firm, no damage, no pest, PHI clear",
  dispute: "Report any quality dispute within 4 hours with photos.",
  cancellation: "Two weeks written notice through GrowMO.",
};

export const ORDER_CONTEXT = {
  openOrders: FARM_ORDERS.filter(
    (order) => order.status !== "Delivered" && order.status !== "Cancelled",
  ).length,
  confirmedValue: FARM_ORDERS.filter(
    (order) => order.status === "Confirmed",
  ).reduce((sum, order) => sum + order.total, 0),
  availableHeads: 11500,
  portfolioUrl: "growmo.co.ke/farm/delion-farm/cabbage-2027-001",
};

export function orderTone(
  status: OrderStatus,
): "low" | "medium" | "high" | "neutral" {
  if (status === "Confirmed" || status === "Delivered") return "low";
  if (status === "Negotiating" || status === "Preparing") return "medium";
  if (status === "Cancelled") return "high";
  return "neutral";
}

export function inquiryTone(
  status: InquiryStatus,
): "low" | "medium" | "high" | "neutral" {
  if (status === "Accepted") return "low";
  if (status === "New" || status === "Negotiating") return "medium";
  if (status === "Declined") return "high";
  return "neutral";
}
