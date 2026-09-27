/* ============================================================================
   PAGE 20 — MACHINERY & EQUIPMENT MANAGEMENT
   Kenyan demo data for Mary's Farm, Githunguri, Kiambu. Values are kept in
   KES and cover assets, maintenance, usage, hire, energy and depreciation.
   ========================================================================== */

export type EquipmentCategory =
  | "Tractor"
  | "Implement"
  | "Irrigation"
  | "Processing"
  | "Transport"
  | "Tool"
  | "Structure"
  | "Storage";

export type EquipmentCondition =
  | "New"
  | "Good"
  | "Fair"
  | "Poor"
  | "Under repair";
export type EquipmentOwnership = "Own" | "Hired" | "Shared" | "Cooperative";
export type EquipmentStatus =
  | "Operational"
  | "Partially deployed"
  | "Needs servicing"
  | "Under repair";
export type MaintenanceState =
  | "Overdue"
  | "Upcoming"
  | "OK"
  | "Future"
  | "After use";

export interface EquipmentAsset {
  id: string;
  name: string;
  category: EquipmentCategory;
  subcategory: string;
  makeModel: string;
  year: number;
  registration?: string;
  engineNumber?: string;
  condition: EquipmentCondition;
  ownership: EquipmentOwnership;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  depreciationMethod: "Straight line" | "Declining balance";
  usefulLife: number;
  fuel: "Diesel" | "Petrol" | "Electric" | "Solar" | "Manual";
  fuelUse: string;
  horsepower?: number;
  attachments: string[];
  storage: string;
  insurance: string;
  status: EquipmentStatus;
  notes: string;
  hoursYear?: number;
}

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  "Tractor",
  "Implement",
  "Irrigation",
  "Processing",
  "Transport",
  "Tool",
  "Structure",
  "Storage",
];

export const EQUIPMENT_ASSETS: EquipmentAsset[] = [
  {
    id: "EQ-001",
    name: "Massey Ferguson 35",
    category: "Tractor",
    subcategory: "2WD tractor",
    makeModel: "Massey Ferguson MF 35",
    year: 1985,
    registration: "KAB 123X",
    engineNumber: "MF35-789012",
    condition: "Fair",
    ownership: "Own",
    purchaseDate: "Mar 2020",
    purchasePrice: 450000,
    currentValue: 350000,
    depreciationMethod: "Straight line",
    usefulLife: 15,
    fuel: "Diesel",
    fuelUse: "5 L/hr",
    horsepower: 35,
    attachments: ["Disc plough", "Tine harrow", "Trailer"],
    storage: "Garage at home compound",
    insurance: "Not insured",
    status: "Operational",
    notes:
      "Strong for ploughing; battery terminals need cleaning before long rains.",
    hoursYear: 85,
  },
  {
    id: "EQ-002",
    name: "Disc plough (3-disc)",
    category: "Implement",
    subcategory: "Mounted plough",
    makeModel: "Rovic 3-disc",
    year: 2020,
    condition: "Good",
    ownership: "Own",
    purchaseDate: "Mar 2020",
    purchasePrice: 60000,
    currentValue: 45000,
    depreciationMethod: "Straight line",
    usefulLife: 10,
    fuel: "Manual",
    fuelUse: "Tractor-driven",
    attachments: ["MF 35"],
    storage: "Garage implement bay",
    insurance: "Covered with tractor",
    status: "Operational",
    notes: "Grease bearings before next land preparation.",
    hoursYear: 32,
  },
  {
    id: "EQ-003",
    name: "Harrow (tine)",
    category: "Implement",
    subcategory: "Tine harrow",
    makeModel: "Local fabrication · 12 tine",
    year: 2020,
    condition: "Fair",
    ownership: "Own",
    purchaseDate: "Mar 2020",
    purchasePrice: 35000,
    currentValue: 25000,
    depreciationMethod: "Straight line",
    usefulLife: 10,
    fuel: "Manual",
    fuelUse: "Tractor-driven",
    attachments: ["MF 35"],
    storage: "Garage implement bay",
    insurance: "Covered with tractor",
    status: "Operational",
    notes: "Two tines were welded in August; inspect after rocky plots.",
    hoursYear: 22,
  },
  {
    id: "EQ-004",
    name: "Trailer 2-tonne",
    category: "Transport",
    subcategory: "Farm trailer",
    makeModel: "Lusaka 2T tipper",
    year: 2020,
    registration: "T-641",
    condition: "Good",
    ownership: "Own",
    purchaseDate: "Mar 2020",
    purchasePrice: 100000,
    currentValue: 80000,
    depreciationMethod: "Straight line",
    usefulLife: 12,
    fuel: "Manual",
    fuelUse: "Tractor-drawn",
    attachments: ["MF 35"],
    storage: "Garage at home compound",
    insurance: "Covered with tractor",
    status: "Operational",
    notes: "Tyres checked weekly; available for family deliveries on Sundays.",
    hoursYear: 28,
  },
  {
    id: "EQ-005",
    name: "Drip irrigation kit (1 acre)",
    category: "Irrigation",
    subcategory: "Drip lines & filters",
    makeModel: "Amiran 16 mm kit",
    year: 2024,
    condition: "Good",
    ownership: "Own",
    purchaseDate: "Feb 2024",
    purchasePrice: 48000,
    currentValue: 35000,
    depreciationMethod: "Straight line",
    usefulLife: 8,
    fuel: "Solar",
    fuelUse: "Solar-fed",
    attachments: ["5,000 L tank", "Solar pump"],
    storage: "Plot 1 pump shed",
    insurance: "No separate cover",
    status: "Partially deployed",
    notes: "0.5 acre is installed on cabbage; flush lines monthly.",
    hoursYear: 200,
  },
  {
    id: "EQ-006",
    name: "Knapsack sprayer × 2",
    category: "Tool",
    subcategory: "20 L manual sprayer",
    makeModel: "Jacto PJH 20",
    year: 2024,
    condition: "Good",
    ownership: "Own",
    purchaseDate: "Jan 2024",
    purchasePrice: 8000,
    currentValue: 6000,
    depreciationMethod: "Straight line",
    usefulLife: 5,
    fuel: "Manual",
    fuelUse: "Manual",
    attachments: ["Cone nozzle", "Flat fan nozzle"],
    storage: "Locked chemical store",
    insurance: "Not insured",
    status: "Operational",
    notes: "Sprayer 1 assigned to fungicides, Sprayer 2 to insecticides.",
    hoursYear: 80,
  },
  {
    id: "EQ-007",
    name: "Hand hoe × 8",
    category: "Tool",
    subcategory: "Jembe",
    makeModel: "Jua Kali forged hoes",
    year: 2023,
    condition: "Fair",
    ownership: "Own",
    purchaseDate: "Jun 2023",
    purchasePrice: 5600,
    currentValue: 4000,
    depreciationMethod: "Straight line",
    usefulLife: 5,
    fuel: "Manual",
    fuelUse: "Manual",
    attachments: [],
    storage: "Tool rack, home store",
    insurance: "Not insured",
    status: "Operational",
    notes: "Labelled 1–8 for tool issue register.",
    hoursYear: 240,
  },
  {
    id: "EQ-008",
    name: "Panga (machete) × 4",
    category: "Tool",
    subcategory: "Cutting tool",
    makeModel: "Tramontina 18 inch",
    year: 2023,
    condition: "Good",
    ownership: "Own",
    purchaseDate: "Jun 2023",
    purchasePrice: 2800,
    currentValue: 2000,
    depreciationMethod: "Straight line",
    usefulLife: 4,
    fuel: "Manual",
    fuelUse: "Manual",
    attachments: [],
    storage: "Tool rack, home store",
    insurance: "Not insured",
    status: "Operational",
    notes: "Sharpen after clearing napier grass; issue with gloves.",
    hoursYear: 110,
  },
  {
    id: "EQ-009",
    name: "Wheelbarrow × 2",
    category: "Transport",
    subcategory: "One-wheel barrow",
    makeModel: "Builders 80 L",
    year: 2022,
    condition: "Fair",
    ownership: "Own",
    purchaseDate: "Oct 2022",
    purchasePrice: 9000,
    currentValue: 6000,
    depreciationMethod: "Straight line",
    usefulLife: 6,
    fuel: "Manual",
    fuelUse: "Manual",
    attachments: [],
    storage: "Shed beside manure bay",
    insurance: "Not insured",
    status: "Operational",
    notes: "One tyre is due for replacement before manure work.",
    hoursYear: 190,
  },
  {
    id: "EQ-010",
    name: "Greenhouse 8 m × 30 m",
    category: "Structure",
    subcategory: "Protected crop house",
    makeModel: "Amiran tunnel house",
    year: 2023,
    condition: "Good",
    ownership: "Own",
    purchaseDate: "Jun 2023",
    purchasePrice: 250000,
    currentValue: 250000,
    depreciationMethod: "Straight line",
    usefulLife: 8,
    fuel: "Manual",
    fuelUse: "N/A",
    attachments: ["Drip kit", "Shade net"],
    storage: "Plot 3, home shamba",
    insurance: "Structure cover review due",
    status: "Operational",
    notes:
      "Ventilation clips replaced in September; tomato nursery planned for January.",
    hoursYear: 0,
  },
  {
    id: "EQ-011",
    name: "Water tank 5,000 L",
    category: "Storage",
    subcategory: "Plastic water tank",
    makeModel: "Kentank 5,000 L",
    year: 2023,
    condition: "Good",
    ownership: "Own",
    purchaseDate: "Jun 2023",
    purchasePrice: 18000,
    currentValue: 15000,
    depreciationMethod: "Straight line",
    usefulLife: 12,
    fuel: "Manual",
    fuelUse: "Gravity-fed",
    attachments: ["Drip kit", "Solar pump"],
    storage: "Plot 1 tank stand",
    insurance: "Not insured",
    status: "Operational",
    notes: "Tank lid is secure; clean before dry-season storage.",
    hoursYear: 0,
  },
  {
    id: "EQ-012",
    name: "Solar water pump",
    category: "Irrigation",
    subcategory: "DC surface pump",
    makeModel: "Futurepump SF2",
    year: 2024,
    condition: "Good",
    ownership: "Own",
    purchaseDate: "Jan 2024",
    purchasePrice: 52000,
    currentValue: 45000,
    depreciationMethod: "Straight line",
    usefulLife: 10,
    fuel: "Solar",
    fuelUse: "0 L/hr",
    attachments: ["5,000 L tank", "Drip kit"],
    storage: "Plot 1 pump shed",
    insurance: "Warranty until Jan 2027",
    status: "Operational",
    notes: "Clean panels monthly; connection check is overdue.",
    hoursYear: 200,
  },
  {
    id: "EQ-013",
    name: "Maize sheller",
    category: "Processing",
    subcategory: "Electric sheller",
    makeModel: "Rongai MS-1",
    year: 2022,
    condition: "Good",
    ownership: "Shared",
    purchaseDate: "Aug 2022",
    purchasePrice: 30000,
    currentValue: 25000,
    depreciationMethod: "Straight line",
    usefulLife: 8,
    fuel: "Electric",
    fuelUse: "1.5 kWh/hr",
    attachments: ["Extension cable"],
    storage: "Kamau family store",
    insurance: "Shared asset agreement",
    status: "Needs servicing",
    notes: "Book belt inspection before December maize harvest.",
    hoursYear: 42,
  },
  {
    id: "EQ-014",
    name: "Spring balance 100 kg",
    category: "Tool",
    subcategory: "Mechanical weighing scale",
    makeModel: "Salter 100 kg",
    year: 2025,
    condition: "Good",
    ownership: "Own",
    purchaseDate: "Feb 2025",
    purchasePrice: 3800,
    currentValue: 3000,
    depreciationMethod: "Straight line",
    usefulLife: 8,
    fuel: "Manual",
    fuelUse: "Manual",
    attachments: [],
    storage: "Harvest crate store",
    insurance: "Not insured",
    status: "Operational",
    notes: "Calibrate against 50 kg fertiliser bag each quarter.",
    hoursYear: 12,
  },
  {
    id: "EQ-015",
    name: "Moisture meter",
    category: "Tool",
    subcategory: "Grain moisture meter",
    makeModel: "Wile 55",
    year: 2025,
    condition: "Good",
    ownership: "Own",
    purchaseDate: "Feb 2025",
    purchasePrice: 3000,
    currentValue: 2500,
    depreciationMethod: "Straight line",
    usefulLife: 6,
    fuel: "Electric",
    fuelUse: "2 × AA batteries",
    attachments: [],
    storage: "Office lockbox",
    insurance: "Not insured",
    status: "Operational",
    notes: "Check batteries before harvest inspections.",
    hoursYear: 8,
  },
];

export interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipment: string;
  service: string;
  frequency: string;
  lastDone: string;
  nextDue: string;
  estimatedCost: number;
  assignedTo: string;
  status: MaintenanceState;
  checklist: string[];
}

export const MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: "MT-001",
    equipmentId: "EQ-001",
    equipment: "MF 35 Tractor",
    service: "Engine oil change",
    frequency: "Every 200 hrs",
    lastDone: "Aug 2026 · 1,800 hrs",
    nextDue: "Oct 2026 · 2,000 hrs",
    estimatedCost: 8000,
    assignedTo: "Karanja Auto Works",
    status: "Overdue",
    checklist: [
      "Drain hot oil",
      "Replace oil filter",
      "Check leaks",
      "Reset hour meter",
    ],
  },
  {
    id: "MT-002",
    equipmentId: "EQ-001",
    equipment: "MF 35 Tractor",
    service: "Air filter clean",
    frequency: "Every 100 hrs",
    lastDone: "Sep 2026",
    nextDue: "Nov 2026",
    estimatedCost: 500,
    assignedTo: "Mary Wanjiku",
    status: "Upcoming",
    checklist: ["Remove cover", "Tap dust out", "Inspect seal"],
  },
  {
    id: "MT-003",
    equipmentId: "EQ-001",
    equipment: "MF 35 Tractor",
    service: "Tyre pressure check",
    frequency: "Weekly",
    lastDone: "24 Oct 2026",
    nextDue: "31 Oct 2026",
    estimatedCost: 0,
    assignedTo: "Mary Wanjiku",
    status: "OK",
    checklist: ["Front tyres", "Rear tyres", "Check slow punctures"],
  },
  {
    id: "MT-004",
    equipmentId: "EQ-001",
    equipment: "MF 35 Tractor",
    service: "Full service",
    frequency: "Annually",
    lastDone: "Mar 2026",
    nextDue: "Mar 2027",
    estimatedCost: 25000,
    assignedTo: "Massey dealer",
    status: "Future",
    checklist: ["Engine", "Hydraulics", "Brakes", "Electrical"],
  },
  {
    id: "MT-005",
    equipmentId: "EQ-002",
    equipment: "Disc plough",
    service: "Grease bearings",
    frequency: "Every season",
    lastDone: "Mar 2026",
    nextDue: "Oct 2026",
    estimatedCost: 500,
    assignedTo: "Mary Wanjiku",
    status: "Overdue",
    checklist: ["Clean nipples", "Grease bearings", "Inspect discs"],
  },
  {
    id: "MT-006",
    equipmentId: "EQ-005",
    equipment: "Drip kit",
    service: "Flush lines",
    frequency: "Monthly",
    lastDone: "01 Oct 2026",
    nextDue: "01 Nov 2026",
    estimatedCost: 0,
    assignedTo: "John Mwangi",
    status: "Upcoming",
    checklist: ["Open end caps", "Flush mainline", "Clean filter"],
  },
  {
    id: "MT-007",
    equipmentId: "EQ-005",
    equipment: "Drip kit",
    service: "Check for leaks",
    frequency: "Weekly",
    lastDone: "24 Oct 2026",
    nextDue: "31 Oct 2026",
    estimatedCost: 0,
    assignedTo: "John Mwangi",
    status: "OK",
    checklist: ["Walk rows", "Patch leaks", "Record pressure"],
  },
  {
    id: "MT-008",
    equipmentId: "EQ-006",
    equipment: "Knapsack sprayer",
    service: "Wash after use",
    frequency: "Every use",
    lastDone: "Last use · 20 Oct",
    nextDue: "Next spray",
    estimatedCost: 0,
    assignedTo: "John Mwangi",
    status: "After use",
    checklist: ["Triple rinse", "Clean nozzle", "Dry tank"],
  },
  {
    id: "MT-009",
    equipmentId: "EQ-006",
    equipment: "Knapsack sprayer",
    service: "Replace seals",
    frequency: "Every 6 months",
    lastDone: "Jun 2026",
    nextDue: "Dec 2026",
    estimatedCost: 500,
    assignedTo: "Mary Wanjiku",
    status: "Future",
    checklist: ["Pump seal", "Hose seal", "Pressure test"],
  },
  {
    id: "MT-010",
    equipmentId: "EQ-012",
    equipment: "Solar pump",
    service: "Clean panels",
    frequency: "Monthly",
    lastDone: "01 Oct 2026",
    nextDue: "01 Nov 2026",
    estimatedCost: 0,
    assignedTo: "Mary Wanjiku",
    status: "Upcoming",
    checklist: ["Brush dust", "Check shade", "Wipe dry"],
  },
  {
    id: "MT-011",
    equipmentId: "EQ-012",
    equipment: "Solar pump",
    service: "Check connections",
    frequency: "Quarterly",
    lastDone: "Jul 2026",
    nextDue: "Oct 2026",
    estimatedCost: 0,
    assignedTo: "SolarPlus Kiambu",
    status: "Overdue",
    checklist: ["Inspect cable", "Test voltage", "Tighten terminals"],
  },
  {
    id: "MT-012",
    equipmentId: "EQ-013",
    equipment: "Maize sheller",
    service: "General service",
    frequency: "Before harvest season",
    lastDone: "Not yet",
    nextDue: "Dec 2026",
    estimatedCost: 3000,
    assignedTo: "Njoroge Mechanic",
    status: "Future",
    checklist: ["Belt tension", "Guard bolts", "Test shelling"],
  },
];

export interface UsageLog {
  id: string;
  date: string;
  equipment: string;
  equipmentId: string;
  activity: string;
  duration: string;
  hours: number;
  fuelLitres: number;
  operator: string;
  plot: string;
  notes: string;
}

export const USAGE_LOGS: UsageLog[] = [
  {
    id: "UL-001",
    date: "20 Oct 2026",
    equipment: "MF 35 + Disc plough",
    equipmentId: "EQ-001",
    activity: "Ploughing Plot 2",
    duration: "3 hrs",
    hours: 3,
    fuelLitres: 15,
    operator: "James Kariuki",
    plot: "Plot 2 · Upper field",
    notes: "Two passes on 0.8 acre.",
  },
  {
    id: "UL-002",
    date: "21 Oct 2026",
    equipment: "MF 35 + Harrow",
    equipmentId: "EQ-001",
    activity: "Harrowing Plot 2",
    duration: "2 hrs",
    hours: 2,
    fuelLitres: 10,
    operator: "James Kariuki",
    plot: "Plot 2 · Upper field",
    notes: "One pass; soil was moist but workable.",
  },
  {
    id: "UL-003",
    date: "22 Oct 2026",
    equipment: "MF 35 + Trailer",
    equipmentId: "EQ-001",
    activity: "Transport manure",
    duration: "1 hr",
    hours: 1,
    fuelLitres: 5,
    operator: "James Kariuki",
    plot: "Plot 1 · Home shamba",
    notes: "Three trips from Githunguri dairy farm.",
  },
  {
    id: "UL-004",
    date: "24 Oct 2026",
    equipment: "Knapsack sprayer #1",
    equipmentId: "EQ-006",
    activity: "Spray Mancozeb on cabbage",
    duration: "2 hrs",
    hours: 2,
    fuelLitres: 0,
    operator: "John Mwangi",
    plot: "Plot 1 · Cabbage",
    notes: "Mixed 100 L; PPE issued and returned.",
  },
  {
    id: "UL-005",
    date: "25 Oct 2026",
    equipment: "Hand hoes × 4",
    equipmentId: "EQ-007",
    activity: "Weeding cabbage",
    duration: "8 worker-hrs",
    hours: 8,
    fuelLitres: 0,
    operator: "Field team",
    plot: "Plot 1 · Cabbage",
    notes: "Four workers, two hours each.",
  },
  {
    id: "UL-006",
    date: "26 Oct 2026",
    equipment: "Solar pump + drip kit",
    equipmentId: "EQ-012",
    activity: "Supplementary irrigation",
    duration: "4 hrs",
    hours: 4,
    fuelLitres: 0,
    operator: "Mary Wanjiku",
    plot: "Plot 1 · Cabbage",
    notes: "Tank refilled before midday.",
  },
  {
    id: "UL-007",
    date: "27 Oct 2026",
    equipment: "Wheelbarrow #2",
    equipmentId: "EQ-009",
    activity: "Move compost",
    duration: "3 hrs",
    hours: 3,
    fuelLitres: 0,
    operator: "Beatrice Wanjiru",
    plot: "Greenhouse",
    notes: "Six barrows of finished compost.",
  },
  {
    id: "UL-008",
    date: "28 Oct 2026",
    equipment: "MF 35 + Trailer",
    equipmentId: "EQ-001",
    activity: "Deliver cabbage crates",
    duration: "1.5 hrs",
    hours: 1.5,
    fuelLitres: 8,
    operator: "James Kariuki",
    plot: "Market route",
    notes: "Githunguri to Kiambu collection point.",
  },
  {
    id: "UL-009",
    date: "29 Oct 2026",
    equipment: "Spring balance",
    equipmentId: "EQ-014",
    activity: "Weigh graded kale",
    duration: "1 hr",
    hours: 1,
    fuelLitres: 0,
    operator: "Mary Wanjiku",
    plot: "Pack shade",
    notes: "Calibration check passed with 50 kg bag.",
  },
  {
    id: "UL-010",
    date: "30 Oct 2026",
    equipment: "Panga × 2",
    equipmentId: "EQ-008",
    activity: "Clear drainage line",
    duration: "3 worker-hrs",
    hours: 3,
    fuelLitres: 0,
    operator: "Field team",
    plot: "Plot 3 edge",
    notes: "Removed grass to keep water moving.",
  },
];

export const USAGE_ANALYTICS = [
  {
    id: "EQ-001",
    equipment: "MF 35 Tractor",
    monthHours: "12",
    yearHours: "85",
    fuelCost: 51000,
    maintenanceCost: 15000,
    costHour: 776,
    revenue: "Ploughing services · KES 120,000",
  },
  {
    id: "EQ-005",
    equipment: "Drip kit",
    monthHours: "40 irrigation hrs",
    yearHours: "200",
    fuelCost: 0,
    maintenanceCost: 2000,
    costHour: 10,
    revenue: "Irrigated crops · KES 400,000",
  },
  {
    id: "EQ-006",
    equipment: "Knapsack sprayers",
    monthHours: "15",
    yearHours: "80",
    fuelCost: 0,
    maintenanceCost: 1000,
    costHour: 13,
    revenue: "Support function",
  },
];

export interface HireRecord {
  id: string;
  date: string;
  direction: "In" | "Out";
  equipment: string;
  person: string;
  phone: string;
  rate: string;
  duration: string;
  total: number;
  purpose: string;
  payment: string;
  status: "Completed" | "Pending" | "Family";
}

export const HIRE_RECORDS: HireRecord[] = [
  {
    id: "HI-001",
    date: "15 Oct 2026",
    direction: "In",
    equipment: "Tractor + rotavator",
    person: "Kariuki Farms",
    phone: "0722 458 711",
    rate: "KES 4,500/acre",
    duration: "1 acre · 3 hrs",
    total: 4500,
    purpose: "Land prep · Plot 1",
    payment: "M-Pesa",
    status: "Completed",
  },
  {
    id: "HI-002",
    date: "05 Nov 2026",
    direction: "In",
    equipment: "Sprayer boom (tractor-mounted)",
    person: "AgriHire Kiambu",
    phone: "0718 330 221",
    rate: "KES 3,000/day",
    duration: "1 day",
    total: 3000,
    purpose: "Spray cabbage",
    payment: "Pending",
    status: "Pending",
  },
  {
    id: "HO-001",
    date: "10 Sep 2026",
    direction: "Out",
    equipment: "MF 35 + plough",
    person: "Kamau · neighbour",
    phone: "0708 517 094",
    rate: "KES 3,500/acre",
    duration: "2 acres · 5 hrs",
    total: 7000,
    purpose: "Land prep",
    payment: "Cash",
    status: "Completed",
  },
  {
    id: "HO-002",
    date: "15 Sep 2026",
    direction: "Out",
    equipment: "MF 35 + trailer",
    person: "Githunguri School",
    phone: "0791 624 300",
    rate: "KES 2,000/hr",
    duration: "3 hrs",
    total: 6000,
    purpose: "Move desks",
    payment: "M-Pesa",
    status: "Completed",
  },
  {
    id: "HO-003",
    date: "05 Oct 2026",
    direction: "Out",
    equipment: "Trailer",
    person: "Mary's sister",
    phone: "0714 902 118",
    rate: "KES 1,500/trip",
    duration: "2 trips",
    total: 0,
    purpose: "Family delivery",
    payment: "No charge",
    status: "Family",
  },
];

export interface HireRate {
  id: string;
  equipment: string;
  rateType: string;
  rate: number;
  unit: string;
  minimum: string;
  includes: string;
  location: string;
  published: boolean;
}

export const HIRE_RATES: HireRate[] = [
  {
    id: "RC-001",
    equipment: "MF 35 Tractor",
    rateType: "Per hour",
    rate: 2000,
    unit: "/ hour",
    minimum: "2 hours",
    includes: "Operator + fuel",
    location: "Farm or within 10 km",
    published: true,
  },
  {
    id: "RC-002",
    equipment: "MF 35 + Plough",
    rateType: "Per acre",
    rate: 3500,
    unit: "/ acre",
    minimum: "0.5 acre",
    includes: "Operator + fuel",
    location: "Within 10 km",
    published: true,
  },
  {
    id: "RC-003",
    equipment: "MF 35 + Trailer",
    rateType: "Per trip",
    rate: 1500,
    unit: "/ trip",
    minimum: "1 trip",
    includes: "Operator + fuel",
    location: "Within 10 km",
    published: true,
  },
  {
    id: "RC-004",
    equipment: "Trailer only",
    rateType: "Per day",
    rate: 1000,
    unit: "/ day",
    minimum: "1 day",
    includes: "Self-collect",
    location: "Githunguri",
    published: false,
  },
  {
    id: "RC-005",
    equipment: "Knapsack sprayer",
    rateType: "Per day",
    rate: 200,
    unit: "/ day",
    minimum: "1 day",
    includes: "Clean tank",
    location: "Self-collect",
    published: false,
  },
  {
    id: "RC-006",
    equipment: "Drip kit (1 acre)",
    rateType: "Per season",
    rate: 5000,
    unit: "/ season",
    minimum: "1 season",
    includes: "Install + removal",
    location: "Mary's Farm only",
    published: false,
  },
];

export interface FuelEntry {
  id: string;
  date: string;
  fuelType: string;
  quantity: number;
  pricePerLitre: number;
  total: number;
  equipment: string;
  receipt: string;
}

export const FUEL_ENTRIES: FuelEntry[] = [
  {
    id: "FE-001",
    date: "20 Oct 2026",
    fuelType: "Diesel",
    quantity: 20,
    pricePerLitre: 195,
    total: 3900,
    equipment: "MF 35",
    receipt: "RCPT-8931",
  },
  {
    id: "FE-002",
    date: "21 Oct 2026",
    fuelType: "Diesel",
    quantity: 10,
    pricePerLitre: 195,
    total: 1950,
    equipment: "MF 35",
    receipt: "No receipt",
  },
  {
    id: "FE-003",
    date: "22 Oct 2026",
    fuelType: "Diesel",
    quantity: 5,
    pricePerLitre: 195,
    total: 975,
    equipment: "MF 35",
    receipt: "No receipt",
  },
  {
    id: "FE-004",
    date: "28 Oct 2026",
    fuelType: "Diesel",
    quantity: 8,
    pricePerLitre: 195,
    total: 1560,
    equipment: "MF 35",
    receipt: "RCPT-8978",
  },
];

export interface ValuationRow {
  id: string;
  equipment: string;
  purchasePrice: number;
  purchaseDate: string;
  usefulLife: string;
  annualDepreciation: number;
  currentAge: string;
  currentValue: number;
  bookValue: number;
}

export const VALUATION_ROWS: ValuationRow[] = [
  {
    id: "EQ-001",
    equipment: "MF 35 Tractor",
    purchasePrice: 450000,
    purchaseDate: "Mar 2020",
    usefulLife: "15 yrs",
    annualDepreciation: 30000,
    currentAge: "6.5 yrs",
    currentValue: 350000,
    bookValue: 255000,
  },
  {
    id: "EQ-002",
    equipment: "Disc plough",
    purchasePrice: 60000,
    purchaseDate: "Mar 2020",
    usefulLife: "10 yrs",
    annualDepreciation: 6000,
    currentAge: "6.5 yrs",
    currentValue: 45000,
    bookValue: 21000,
  },
  {
    id: "EQ-010",
    equipment: "Greenhouse",
    purchasePrice: 250000,
    purchaseDate: "Jun 2023",
    usefulLife: "8 yrs",
    annualDepreciation: 31250,
    currentAge: "3.3 yrs",
    currentValue: 200000,
    bookValue: 146875,
  },
  {
    id: "EQ-012",
    equipment: "Solar pump",
    purchasePrice: 52000,
    purchaseDate: "Jan 2024",
    usefulLife: "10 yrs",
    annualDepreciation: 5200,
    currentAge: "2.8 yrs",
    currentValue: 45000,
    bookValue: 37440,
  },
];

export const MACHINERY_CONTEXT = {
  farm: "Mary's Farm",
  place: "Githunguri, Kiambu County",
  asOf: "30 Oct 2026",
  totalValue: EQUIPMENT_ASSETS.reduce(
    (sum, asset) => sum + asset.currentValue,
    0,
  ),
  operational: EQUIPMENT_ASSETS.filter(
    (asset) => asset.status === "Operational",
  ).length,
  maintenanceDue: MAINTENANCE_TASKS.filter((task) => task.status === "Overdue")
    .length,
  hireIncome: HIRE_RECORDS.filter((hire) => hire.direction === "Out").reduce(
    (sum, hire) => sum + hire.total,
    0,
  ),
  fuelTotal: FUEL_ENTRIES.reduce((sum, fuel) => sum + fuel.total, 0),
};

export function equipmentTone(
  status: EquipmentStatus,
): "low" | "medium" | "high" {
  if (status === "Operational") return "low";
  if (status === "Needs servicing" || status === "Under repair") return "high";
  return "medium";
}

export function maintenanceTone(
  status: MaintenanceState,
): "low" | "medium" | "high" | "neutral" {
  if (status === "Overdue") return "high";
  if (status === "Upcoming") return "medium";
  if (status === "OK") return "low";
  return "neutral";
}
