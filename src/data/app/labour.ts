/* ============================================================================
   PAGE 6 — LABOUR MANAGEMENT & PAYROLL
   Demo data for Mary's Wanjiku Mixed Farm, Githunguri, Kiambu County.
   Rates, workers, tasks and M-Pesa receipts are intentionally realistic
   Kenyan examples and are shared by /app/labour.
   ========================================================================== */

export type WorkerStatus = "active" | "on-leave" | "inactive";
export type PaymentFrequency = "Daily" | "Weekly" | "End of task";
export type RateType = "Daily rate" | "Piece rate";
export type TaskType =
  | "Weeding"
  | "Planting"
  | "Transplanting"
  | "Spraying"
  | "Harvesting"
  | "Land prep"
  | "Irrigation"
  | "Transport"
  | "Other";
export type TaskStatus =
  | "Completed"
  | "Today"
  | "Overdue"
  | "Upcoming"
  | "Scheduled"
  | "Future";
export type PaymentStatus = "Paid" | "Scheduled" | "Pending" | "Future";
export type AttendanceStatus = "Present" | "Absent" | "Late" | "Pending";

export const FARM_LABOUR_CONTEXT = {
  farmer: "Mary Wanjiku",
  farm: "Wanjiku Mixed Farm",
  location: "Githunguri, Kiambu County",
  phone: "0712 345 678",
  today: "13 Nov 2026",
  season: "2026 short rains",
  walletBalance: 35000,
};

export const TASK_TYPES: TaskType[] = [
  "Weeding",
  "Planting",
  "Transplanting",
  "Spraying",
  "Harvesting",
  "Land prep",
  "Irrigation",
  "Transport",
  "Other",
];

export const PAYMENT_FREQUENCIES: PaymentFrequency[] = [
  "Daily",
  "Weekly",
  "End of task",
];

export const REQUIRED_TOOLS = [
  "Jembe",
  "Panga",
  "Knapsack sprayer",
  "Crates",
  "Sacks",
  "Gloves",
  "Gumboots",
  "Wheelbarrow",
];

export interface PieceRate {
  task: string;
  amount: number;
  unit: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  mpesaName: string;
  nationalId: string;
  village: string;
  county: string;
  skills: string[];
  dailyRate: number;
  pieceRates: PieceRate[];
  preferredPayment: string;
  frequency: PaymentFrequency;
  rating: number;
  tasksCompleted: number;
  totalEarned: number;
  status: WorkerStatus;
  joined: string;
  notes: string;
  initials: string;
  emergencyContact: string;
}

export const WORKERS: Worker[] = [
  {
    id: "W-001",
    name: "John Mwangi Kamau",
    phone: "0712 345 678",
    mpesaName: "John Mwangi",
    nationalId: "12345678",
    village: "Githunguri",
    county: "Kiambu",
    skills: ["Weeding", "Transplanting", "Spraying", "Harvesting"],
    dailyRate: 500,
    pieceRates: [
      { task: "Weeding", amount: 1500, unit: "acre" },
      { task: "Cabbage harvesting", amount: 2, unit: "head" },
    ],
    preferredPayment: "M-Pesa · 0712 345 678",
    frequency: "Weekly",
    rating: 4.6,
    tasksCompleted: 24,
    totalEarned: 14200,
    status: "active",
    joined: "04 Jan 2025",
    notes:
      "Reliable, comes early. Good at transplanting and sprayer calibration.",
    initials: "JM",
    emergencyContact: "Jane Mwangi · 0721 504 119",
  },
  {
    id: "W-002",
    name: "Peter Kamau Njoroge",
    phone: "0733 901 221",
    mpesaName: "Peter Kamau",
    nationalId: "23456789",
    village: "Kanjuku",
    county: "Kiambu",
    skills: ["Weeding", "Land prep", "Irrigation", "Transport"],
    dailyRate: 550,
    pieceRates: [{ task: "Maize weeding", amount: 1700, unit: "acre" }],
    preferredPayment: "M-Pesa · 0733 901 221",
    frequency: "Daily",
    rating: 4.2,
    tasksCompleted: 19,
    totalEarned: 11100,
    status: "active",
    joined: "16 Mar 2025",
    notes: "Strong with the jembe and can operate the farm wheelbarrow.",
    initials: "PK",
    emergencyContact: "Lucy Njoroge · 0708 881 024",
  },
  {
    id: "W-003",
    name: "Grace Wanjiku Mburu",
    phone: "0799 410 882",
    mpesaName: "Grace Wanjiku",
    nationalId: "34567890",
    village: "Ikinu",
    county: "Kiambu",
    skills: ["Transplanting", "Nursery care", "Harvesting", "Sorting"],
    dailyRate: 500,
    pieceRates: [{ task: "Tomato harvesting", amount: 450, unit: "crate" }],
    preferredPayment: "M-Pesa · 0799 410 882",
    frequency: "End of task",
    rating: 4.8,
    tasksCompleted: 21,
    totalEarned: 12600,
    status: "active",
    joined: "21 Feb 2025",
    notes: "Careful with seedlings and excellent at produce grading.",
    initials: "GW",
    emergencyContact: "James Mburu · 0740 219 705",
  },
  {
    id: "W-004",
    name: "Samuel Njoroge Karanja",
    phone: "0706 553 914",
    mpesaName: "Samuel Njoroge",
    nationalId: "45678901",
    village: "Rware",
    county: "Kiambu",
    skills: ["Spraying", "Fertilizer application", "Irrigation"],
    dailyRate: 600,
    pieceRates: [{ task: "Spraying", amount: 700, unit: "acre" }],
    preferredPayment: "M-Pesa · 0706 553 914",
    frequency: "Weekly",
    rating: 4.4,
    tasksCompleted: 17,
    totalEarned: 10200,
    status: "active",
    joined: "11 May 2025",
    notes: "PCPB safety briefing completed. Brings his own gumboots.",
    initials: "SN",
    emergencyContact: "Esther Karanja · 0718 430 215",
  },
  {
    id: "W-005",
    name: "Lucy Wambui Gichuru",
    phone: "0724 618 330",
    mpesaName: "Lucy Wambui",
    nationalId: "56789012",
    village: "Kigumo-ini",
    county: "Kiambu",
    skills: ["Weeding", "Harvesting", "Sorting", "Nursery care"],
    dailyRate: 500,
    pieceRates: [{ task: "Cabbage harvesting", amount: 2, unit: "head" }],
    preferredPayment: "M-Pesa · 0724 618 330",
    frequency: "Weekly",
    rating: 4.9,
    tasksCompleted: 29,
    totalEarned: 16400,
    status: "active",
    joined: "06 Nov 2024",
    notes: "Team lead for harvest days. Keeps the sorting table organised.",
    initials: "LW",
    emergencyContact: "David Gichuru · 0751 110 944",
  },
  {
    id: "W-006",
    name: "David Maina Kariuki",
    phone: "0741 882 504",
    mpesaName: "David Maina",
    nationalId: "67890123",
    village: "Kiaibabu",
    county: "Kiambu",
    skills: ["Land prep", "Planting", "Transport"],
    dailyRate: 650,
    pieceRates: [{ task: "Maize planting", amount: 900, unit: "acre" }],
    preferredPayment: "M-Pesa · 0741 882 504",
    frequency: "End of task",
    rating: 4.1,
    tasksCompleted: 12,
    totalEarned: 8300,
    status: "active",
    joined: "08 Jul 2025",
    notes: "Available for tractor loading and ox-plough support.",
    initials: "DM",
    emergencyContact: "Mary Kariuki · 0702 333 118",
  },
  {
    id: "W-007",
    name: "Esther Nyambura Wanjohi",
    phone: "0718 430 215",
    mpesaName: "Esther Nyambura",
    nationalId: "78901234",
    village: "Githiga",
    county: "Kiambu",
    skills: ["Greenhouse", "Irrigation", "Transplanting", "Harvesting"],
    dailyRate: 550,
    pieceRates: [{ task: "Tomato harvesting", amount: 450, unit: "crate" }],
    preferredPayment: "M-Pesa · 0718 430 215",
    frequency: "Weekly",
    rating: 4.7,
    tasksCompleted: 23,
    totalEarned: 13750,
    status: "on-leave",
    joined: "13 Sep 2024",
    notes: "On leave until 18 Nov for a family ceremony in Nyeri.",
    initials: "EN",
    emergencyContact: "Joseph Wanjohi · 0730 208 704",
  },
  {
    id: "W-008",
    name: "Patrick Ochieng Otieno",
    phone: "0755 203 710",
    mpesaName: "Patrick Ochieng",
    nationalId: "89012345",
    village: "Kahawa",
    county: "Kiambu",
    skills: ["Transport", "Harvesting", "Loading"],
    dailyRate: 700,
    pieceRates: [{ task: "Crate loading", amount: 80, unit: "crate" }],
    preferredPayment: "M-Pesa · 0755 203 710",
    frequency: "End of task",
    rating: 4.0,
    tasksCompleted: 9,
    totalEarned: 5800,
    status: "active",
    joined: "03 Aug 2025",
    notes: "Has access to a handcart and knows the Githunguri market route.",
    initials: "PO",
    emergencyContact: "Akinyi Otieno · 0790 808 110",
  },
  {
    id: "W-009",
    name: "Ruth Wairimu Kibe",
    phone: "0780 616 491",
    mpesaName: "Ruth Wairimu",
    nationalId: "90123456",
    village: "Ngewa",
    county: "Kiambu",
    skills: ["Weeding", "Nursery care", "Sorting"],
    dailyRate: 480,
    pieceRates: [{ task: "Seedling transplanting", amount: 1, unit: "tray" }],
    preferredPayment: "M-Pesa · 0780 616 491",
    frequency: "Weekly",
    rating: 4.5,
    tasksCompleted: 16,
    totalEarned: 7600,
    status: "active",
    joined: "15 Apr 2025",
    notes: "Good with fine nursery work; prefers early morning shifts.",
    initials: "RW",
    emergencyContact: "Simon Kibe · 0720 441 827",
  },
  {
    id: "W-010",
    name: "Joseph Mbugua Njenga",
    phone: "0768 112 609",
    mpesaName: "Joseph Mbugua",
    nationalId: "01234567",
    village: "Tigoni",
    county: "Kiambu",
    skills: ["Ploughing", "Land prep", "Fertilizer application"],
    dailyRate: 600,
    pieceRates: [{ task: "Manure spreading", amount: 1000, unit: "acre" }],
    preferredPayment: "M-Pesa · 0768 112 609",
    frequency: "Daily",
    rating: 3.9,
    tasksCompleted: 8,
    totalEarned: 5100,
    status: "inactive",
    joined: "27 Jan 2024",
    notes: "Inactive this season; keep historical payroll records for audit.",
    initials: "JM",
    emergencyContact: "Ann Njenga · 0710 504 692",
  },
];

export interface TaskAttendance {
  workerId: string;
  status: AttendanceStatus;
  hours: number;
  confirmed: boolean;
  note: string;
}

export interface LabourTask {
  id: string;
  title: string;
  type: TaskType;
  crop: string;
  plot: string;
  date: string;
  startTime: string;
  duration: string;
  workerIds: string[];
  rateType: RateType;
  rateAmount: number;
  estimatedTotal: number;
  budgetCategory: string;
  paymentMethod: string;
  paymentTiming: string;
  instructions: string;
  tools: string[];
  status: TaskStatus;
  attendance: TaskAttendance[];
  actualHours: number;
  quality: number | null;
  notes: string;
}

const attendance = (
  rows: [string, AttendanceStatus, number, boolean, string][],
): TaskAttendance[] =>
  rows.map(([workerId, status, hours, confirmed, note]) => ({
    workerId,
    status,
    hours,
    confirmed,
    note,
  }));

export const LABOUR_TASKS: LabourTask[] = [
  {
    id: "task-001",
    title: "Weeding cabbage — first pass",
    type: "Weeding",
    crop: "Cabbage Gloria F1",
    plot: "Plot 1 · Shamba ya nyumba",
    date: "25 Oct 2026",
    startTime: "08:00",
    duration: "Full day",
    workerIds: ["W-001", "W-002", "W-005"],
    rateType: "Daily rate",
    rateAmount: 500,
    estimatedTotal: 1500,
    budgetCategory: "Cabbage labour",
    paymentMethod: "GrowMO wallet · M-Pesa",
    paymentTiming: "On completion",
    instructions:
      "Keep soil around the cabbage crown; remove weeds from the row centre.",
    tools: ["Jembe", "Gumboots"],
    status: "Completed",
    attendance: attendance([
      ["W-001", "Present", 8, true, "Completed rows 1–4"],
      ["W-002", "Present", 8, true, "Completed rows 5–7"],
      ["W-005", "Present", 7.5, true, "Team lead and quality check"],
    ]),
    actualHours: 23.5,
    quality: 5,
    notes: "Clean rows; no cabbage stems damaged.",
  },
  {
    id: "task-002",
    title: "Cabbage transplanting",
    type: "Transplanting",
    crop: "Cabbage Gloria F1",
    plot: "Plot 1 · Shamba ya nyumba",
    date: "20 Oct 2026",
    startTime: "07:30",
    duration: "Full day",
    workerIds: ["W-001", "W-003", "W-005", "W-009", "W-002"],
    rateType: "Daily rate",
    rateAmount: 500,
    estimatedTotal: 2500,
    budgetCategory: "Cabbage labour",
    paymentMethod: "GrowMO wallet · M-Pesa",
    paymentTiming: "On completion",
    instructions:
      "Plant on the 60 × 45 cm string line; water each seedling after planting.",
    tools: ["Jembe", "Wheelbarrow", "Gumboots"],
    status: "Completed",
    attendance: attendance([
      ["W-001", "Present", 8, true, ""],
      ["W-003", "Present", 8, true, ""],
      ["W-005", "Present", 8, true, ""],
      ["W-009", "Present", 8, true, ""],
      ["W-002", "Present", 8, true, ""],
    ]),
    actualHours: 40,
    quality: 5,
    notes: "14,500 plants established; 96% survival at first count.",
  },
  {
    id: "task-003",
    title: "Cabbage blight spray",
    type: "Spraying",
    crop: "Cabbage Gloria F1",
    plot: "Plot 1 · Shamba ya nyumba",
    date: "15 Nov 2026",
    startTime: "16:30",
    duration: "2 hrs",
    workerIds: ["W-004"],
    rateType: "Daily rate",
    rateAmount: 600,
    estimatedTotal: 300,
    budgetCategory: "Crop protection labour",
    paymentMethod: "GrowMO wallet · M-Pesa",
    paymentTiming: "On completion",
    instructions:
      "Apply Mancozeb 80 WP at 500 g/acre; hold spray if wind rises.",
    tools: ["Knapsack sprayer", "Gloves", "Gumboots"],
    status: "Upcoming",
    attendance: attendance([
      ["W-004", "Pending", 0, false, "SMS not yet confirmed"],
    ]),
    actualHours: 0,
    quality: null,
    notes: "Weather window: dry after 16:00, no rain expected for six hours.",
  },
  {
    id: "task-004",
    title: "Weeding maize — first pass",
    type: "Weeding",
    crop: "Maize H6213",
    plot: "Plot 2 · Shamba ya chini",
    date: "13 Nov 2026",
    startTime: "08:00",
    duration: "Full day",
    workerIds: ["W-002", "W-006", "W-009"],
    rateType: "Daily rate",
    rateAmount: 550,
    estimatedTotal: 1650,
    budgetCategory: "Maize labour",
    paymentMethod: "GrowMO wallet · M-Pesa",
    paymentTiming: "On completion",
    instructions:
      "Keep 10 cm clear around maize stems; do not disturb shallow roots.",
    tools: ["Jembe", "Gumboots"],
    status: "Today",
    attendance: attendance([
      ["W-002", "Present", 4, true, "Morning shift"],
      ["W-006", "Late", 3, true, "Arrived 09:15"],
      ["W-009", "Present", 4, true, "Morning shift"],
    ]),
    actualHours: 11,
    quality: null,
    notes: "Mark completion after the afternoon field check.",
  },
  {
    id: "task-005",
    title: "Maize top-dress application support",
    type: "Other",
    crop: "Maize H6213",
    plot: "Plot 2 · Shamba ya chini",
    date: "16 Nov 2026",
    startTime: "08:00",
    duration: "Half day",
    workerIds: ["W-001", "W-002"],
    rateType: "Daily rate",
    rateAmount: 500,
    estimatedTotal: 1000,
    budgetCategory: "Maize labour",
    paymentMethod: "Manual (I'll pay offline)",
    paymentTiming: "On scheduled date",
    instructions:
      "Place Urea 8 cm from the plant, cover immediately and keep bags dry.",
    tools: ["Jembe", "Gloves"],
    status: "Upcoming",
    attendance: attendance([
      ["W-001", "Pending", 0, false, ""],
      ["W-002", "Pending", 0, false, ""],
    ]),
    actualHours: 0,
    quality: null,
    notes: "Requires the Urea bag already allocated in the store.",
  },
  {
    id: "task-006",
    title: "Greenhouse tomato irrigation check",
    type: "Irrigation",
    crop: "Tomato Anna F1",
    plot: "Greenhouse 1",
    date: "13 Nov 2026",
    startTime: "06:30",
    duration: "2 hrs",
    workerIds: ["W-007"],
    rateType: "Daily rate",
    rateAmount: 550,
    estimatedTotal: 275,
    budgetCategory: "Tomato labour",
    paymentMethod: "GrowMO wallet · M-Pesa",
    paymentTiming: "Pay on completion",
    instructions:
      "Flush the blocked bed 3 emitters and check the tank float valve.",
    tools: ["Gloves", "Spanner"],
    status: "Today",
    attendance: attendance([
      ["W-007", "Absent", 0, true, "On leave until 18 Nov"],
    ]),
    actualHours: 0,
    quality: null,
    notes: "Reassign to Mary if the greenhouse drops below 70% moisture.",
  },
  {
    id: "task-007",
    title: "Potato ridge weeding",
    type: "Weeding",
    crop: "Potato Shangi",
    plot: "Githiga lease",
    date: "11 Nov 2026",
    startTime: "08:00",
    duration: "Full day",
    workerIds: ["W-002", "W-006"],
    rateType: "Daily rate",
    rateAmount: 550,
    estimatedTotal: 1100,
    budgetCategory: "Potato labour",
    paymentMethod: "GrowMO wallet · M-Pesa",
    paymentTiming: "On completion",
    instructions:
      "Earth up ridges without exposing the seed tubers; remove volunteer weeds.",
    tools: ["Jembe", "Gumboots"],
    status: "Overdue",
    attendance: attendance([
      ["W-002", "Pending", 0, false, "No attendance submitted"],
      ["W-006", "Pending", 0, false, "No attendance submitted"],
    ]),
    actualHours: 0,
    quality: null,
    notes: "Overdue after rain delayed the field visit.",
  },
  {
    id: "task-008",
    title: "Cabbage harvest and grading",
    type: "Harvesting",
    crop: "Cabbage Gloria F1",
    plot: "Plot 1 · Shamba ya nyumba",
    date: "15 Jan 2027",
    startTime: "06:00",
    duration: "Full day",
    workerIds: ["W-001", "W-002", "W-003", "W-005", "W-008", "W-009"],
    rateType: "Piece rate",
    rateAmount: 600,
    estimatedTotal: 3600,
    budgetCategory: "Harvest labour",
    paymentMethod: "GrowMO wallet · M-Pesa",
    paymentTiming: "On completion",
    instructions:
      "Harvest firm heads, trim three wrapper leaves and grade into buyer crates.",
    tools: ["Panga", "Crates", "Gloves", "Wheelbarrow"],
    status: "Scheduled",
    attendance: attendance([
      ["W-001", "Pending", 0, false, ""],
      ["W-002", "Pending", 0, false, ""],
      ["W-003", "Pending", 0, false, ""],
      ["W-005", "Pending", 0, false, "Team lead"],
      ["W-008", "Pending", 0, false, "Loading support"],
      ["W-009", "Pending", 0, false, ""],
    ]),
    actualHours: 0,
    quality: null,
    notes: "Buyer order needs 200 clean crates by 10 Jan.",
  },
  {
    id: "task-009",
    title: "Tomato harvesting and packhouse",
    type: "Harvesting",
    crop: "Tomato Anna F1",
    plot: "Greenhouse 1",
    date: "18 Nov 2026",
    startTime: "07:00",
    duration: "Half day",
    workerIds: ["W-003", "W-007"],
    rateType: "Piece rate",
    rateAmount: 450,
    estimatedTotal: 900,
    budgetCategory: "Tomato labour",
    paymentMethod: "GrowMO wallet · M-Pesa",
    paymentTiming: "End of task",
    instructions:
      "Pick blush-stage fruit only; record crate grade A and B separately.",
    tools: ["Crates", "Gloves"],
    status: "Upcoming",
    attendance: attendance([
      ["W-003", "Pending", 0, false, ""],
      ["W-007", "Pending", 0, false, "On leave — confirm replacement"],
    ]),
    actualHours: 0,
    quality: null,
    notes: "If Esther remains away, assign Lucy for packhouse support.",
  },
  {
    id: "task-010",
    title: "Maize harvest and loading",
    type: "Harvesting",
    crop: "Maize H6213",
    plot: "Plot 2 · Shamba ya chini",
    date: "15 Mar 2027",
    startTime: "07:00",
    duration: "Multi-day",
    workerIds: ["W-001", "W-002", "W-005", "W-006"],
    rateType: "Daily rate",
    rateAmount: 600,
    estimatedTotal: 4800,
    budgetCategory: "Harvest labour",
    paymentMethod: "GrowMO wallet · M-Pesa",
    paymentTiming: "Pay on completion",
    instructions:
      "Harvest at safe moisture, bag and stack on pallets under the field shed.",
    tools: ["Panga", "Sacks", "Wheelbarrow"],
    status: "Future",
    attendance: attendance([
      ["W-001", "Pending", 0, false, ""],
      ["W-002", "Pending", 0, false, ""],
      ["W-005", "Pending", 0, false, ""],
      ["W-006", "Pending", 0, false, ""],
    ]),
    actualHours: 0,
    quality: null,
    notes: "Forecast: 31 bags from 1.2 acres.",
  },
  {
    id: "task-011",
    title: "Manure spreading before potato planting",
    type: "Land prep",
    crop: "Potato Shangi",
    plot: "Githiga lease",
    date: "22 Nov 2026",
    startTime: "08:00",
    duration: "Full day",
    workerIds: ["W-002", "W-006", "W-010"],
    rateType: "Daily rate",
    rateAmount: 550,
    estimatedTotal: 1650,
    budgetCategory: "Potato labour",
    paymentMethod: "Manual (I'll pay offline)",
    paymentTiming: "On scheduled date",
    instructions:
      "Spread well-rotted manure evenly before ridging; keep the drainage channel open.",
    tools: ["Wheelbarrow", "Jembe", "Gumboots"],
    status: "Scheduled",
    attendance: attendance([
      ["W-002", "Pending", 0, false, ""],
      ["W-006", "Pending", 0, false, ""],
      ["W-010", "Pending", 0, false, "Historical worker — confirm status"],
    ]),
    actualHours: 0,
    quality: null,
    notes: "Confirm Joseph's return before assigning the work.",
  },
  {
    id: "task-012",
    title: "Beans foliar feed",
    type: "Spraying",
    crop: "Dry Beans Rosecoco",
    plot: "Plot 3 · Kwa mto",
    date: "20 Nov 2026",
    startTime: "16:00",
    duration: "2 hrs",
    workerIds: ["W-004"],
    rateType: "Piece rate",
    rateAmount: 700,
    estimatedTotal: 350,
    budgetCategory: "Beans labour",
    paymentMethod: "GrowMO wallet · M-Pesa",
    paymentTiming: "On completion",
    instructions: "Spray after 16:00; wear gloves and observe the 14-day PHI.",
    tools: ["Knapsack sprayer", "Gloves", "Gumboots"],
    status: "Upcoming",
    attendance: attendance([["W-004", "Pending", 0, false, ""]]),
    actualHours: 0,
    quality: null,
    notes: "Use the same worker who recorded the 08 Nov Mancozeb spray.",
  },
  {
    id: "task-013",
    title: "Greenhouse bed 3 repairs",
    type: "Irrigation",
    crop: "Tomato Anna F1",
    plot: "Greenhouse 1",
    date: "09 Nov 2026",
    startTime: "09:00",
    duration: "Half day",
    workerIds: ["W-007"],
    rateType: "Daily rate",
    rateAmount: 550,
    estimatedTotal: 275,
    budgetCategory: "Tomato labour",
    paymentMethod: "GrowMO wallet · M-Pesa",
    paymentTiming: "On completion",
    instructions: "Replace blocked emitters and flush the 16 mm drip line.",
    tools: ["Spanner", "Gloves"],
    status: "Completed",
    attendance: attendance([["W-007", "Present", 4, true, "Bed 3 restored"]]),
    actualHours: 4,
    quality: 4,
    notes: "Water pressure restored to 1.1 bar.",
  },
  {
    id: "task-014",
    title: "Cabbage top-dress support",
    type: "Other",
    crop: "Cabbage Gloria F1",
    plot: "Plot 1 · Shamba ya nyumba",
    date: "03 Nov 2026",
    startTime: "08:00",
    duration: "Half day",
    workerIds: ["W-001", "W-005", "W-009"],
    rateType: "Daily rate",
    rateAmount: 500,
    estimatedTotal: 750,
    budgetCategory: "Cabbage labour",
    paymentMethod: "GrowMO wallet · M-Pesa",
    paymentTiming: "On completion",
    instructions:
      "Place CAN 10 cm from the stem and cover; weed the line at the same time.",
    tools: ["Jembe", "Gloves"],
    status: "Completed",
    attendance: attendance([
      ["W-001", "Present", 4, true, ""],
      ["W-005", "Present", 4, true, ""],
      ["W-009", "Present", 4, true, ""],
    ]),
    actualHours: 12,
    quality: 5,
    notes: "25 kg CAN applied and covered before light rain.",
  },
];

export interface AttendanceRecord {
  id: string;
  taskId: string;
  taskTitle: string;
  date: string;
  crop: string;
  workerId: string;
  workerName: string;
  status: AttendanceStatus;
  confirmed: boolean;
  actualHours: number;
  quality: number | null;
  note: string;
}

export const ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: "att-001",
    taskId: "task-004",
    taskTitle: "Weeding maize — first pass",
    date: "13 Nov 2026",
    crop: "Maize H6213",
    workerId: "W-002",
    workerName: "Peter Kamau Njoroge",
    status: "Present",
    confirmed: true,
    actualHours: 4,
    quality: null,
    note: "Morning shift",
  },
  {
    id: "att-002",
    taskId: "task-004",
    taskTitle: "Weeding maize — first pass",
    date: "13 Nov 2026",
    crop: "Maize H6213",
    workerId: "W-006",
    workerName: "David Maina Kariuki",
    status: "Late",
    confirmed: true,
    actualHours: 3,
    quality: null,
    note: "Arrived 09:15",
  },
  {
    id: "att-003",
    taskId: "task-004",
    taskTitle: "Weeding maize — first pass",
    date: "13 Nov 2026",
    crop: "Maize H6213",
    workerId: "W-009",
    workerName: "Ruth Wairimu Kibe",
    status: "Present",
    confirmed: true,
    actualHours: 4,
    quality: null,
    note: "Morning shift",
  },
  {
    id: "att-004",
    taskId: "task-006",
    taskTitle: "Greenhouse tomato irrigation check",
    date: "13 Nov 2026",
    crop: "Tomato Anna F1",
    workerId: "W-007",
    workerName: "Esther Nyambura Wanjohi",
    status: "Absent",
    confirmed: true,
    actualHours: 0,
    quality: null,
    note: "On leave until 18 Nov",
  },
  {
    id: "att-005",
    taskId: "task-001",
    taskTitle: "Weeding cabbage — first pass",
    date: "25 Oct 2026",
    crop: "Cabbage Gloria F1",
    workerId: "W-001",
    workerName: "John Mwangi Kamau",
    status: "Present",
    confirmed: true,
    actualHours: 8,
    quality: 5,
    note: "Completed rows 1–4",
  },
  {
    id: "att-006",
    taskId: "task-001",
    taskTitle: "Weeding cabbage — first pass",
    date: "25 Oct 2026",
    crop: "Cabbage Gloria F1",
    workerId: "W-002",
    workerName: "Peter Kamau Njoroge",
    status: "Present",
    confirmed: true,
    actualHours: 8,
    quality: 5,
    note: "Completed rows 5–7",
  },
  {
    id: "att-007",
    taskId: "task-001",
    taskTitle: "Weeding cabbage — first pass",
    date: "25 Oct 2026",
    crop: "Cabbage Gloria F1",
    workerId: "W-005",
    workerName: "Lucy Wambui Gichuru",
    status: "Present",
    confirmed: true,
    actualHours: 7.5,
    quality: 5,
    note: "Team lead",
  },
  {
    id: "att-008",
    taskId: "task-013",
    taskTitle: "Greenhouse bed 3 repairs",
    date: "09 Nov 2026",
    crop: "Tomato Anna F1",
    workerId: "W-007",
    workerName: "Esther Nyambura Wanjohi",
    status: "Present",
    confirmed: true,
    actualHours: 4,
    quality: 4,
    note: "Bed 3 restored",
  },
  {
    id: "att-009",
    taskId: "task-007",
    taskTitle: "Potato ridge weeding",
    date: "11 Nov 2026",
    crop: "Potato Shangi",
    workerId: "W-002",
    workerName: "Peter Kamau Njoroge",
    status: "Pending",
    confirmed: false,
    actualHours: 0,
    quality: null,
    note: "No attendance submitted",
  },
  {
    id: "att-010",
    taskId: "task-007",
    taskTitle: "Potato ridge weeding",
    date: "11 Nov 2026",
    crop: "Potato Shangi",
    workerId: "W-006",
    workerName: "David Maina Kariuki",
    status: "Pending",
    confirmed: false,
    actualHours: 0,
    quality: null,
    note: "No attendance submitted",
  },
];

export interface PayrollPayment {
  id: string;
  workerId: string;
  workerName: string;
  taskId: string;
  task: string;
  crop: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  method: string;
  receipt: string | null;
  scheduledDate: string | null;
  note: string;
}

export const PAYROLL_PAYMENTS: PayrollPayment[] = [
  {
    id: "pay-001",
    workerId: "W-001",
    workerName: "John Mwangi Kamau",
    taskId: "task-001",
    task: "Weeding cabbage",
    crop: "Cabbage Gloria F1",
    amount: 500,
    dueDate: "25 Oct 2026",
    status: "Paid",
    method: "M-Pesa",
    receipt: "QJK3L5X7YZ",
    scheduledDate: null,
    note: "Weekly payroll · confirmed",
  },
  {
    id: "pay-002",
    workerId: "W-002",
    workerName: "Peter Kamau Njoroge",
    taskId: "task-001",
    task: "Weeding cabbage",
    crop: "Cabbage Gloria F1",
    amount: 500,
    dueDate: "25 Oct 2026",
    status: "Scheduled",
    method: "M-Pesa auto-pay",
    receipt: null,
    scheduledDate: "01 Nov 2026",
    note: "Scheduled after weekly review",
  },
  {
    id: "pay-003",
    workerId: "W-003",
    workerName: "Grace Wanjiku Mburu",
    taskId: "task-002",
    task: "Transplanting cabbage",
    crop: "Cabbage Gloria F1",
    amount: 500,
    dueDate: "20 Oct 2026",
    status: "Paid",
    method: "Manual M-Pesa",
    receipt: "SHK4RT9P2A",
    scheduledDate: null,
    note: "Paid from personal M-Pesa",
  },
  {
    id: "pay-004",
    workerId: "W-004",
    workerName: "Samuel Njoroge Karanja",
    taskId: "task-003",
    task: "Spraying cabbage",
    crop: "Cabbage Gloria F1",
    amount: 300,
    dueDate: "15 Nov 2026",
    status: "Pending",
    method: "GrowMO wallet",
    receipt: null,
    scheduledDate: null,
    note: "Pay after task completion",
  },
  {
    id: "pay-005",
    workerId: "W-004",
    workerName: "Samuel Njoroge Karanja",
    taskId: "task-012",
    task: "Beans foliar feed",
    crop: "Dry Beans Rosecoco",
    amount: 350,
    dueDate: "20 Nov 2026",
    status: "Future",
    method: "GrowMO wallet",
    receipt: null,
    scheduledDate: "20 Nov 2026",
    note: "Piece rate · 0.5 acre",
  },
  {
    id: "pay-006",
    workerId: "W-005",
    workerName: "Lucy Wambui Gichuru",
    taskId: "task-014",
    task: "Cabbage top dress support",
    crop: "Cabbage Gloria F1",
    amount: 500,
    dueDate: "03 Nov 2026",
    status: "Paid",
    method: "M-Pesa",
    receipt: "NQK2L8M4RX",
    scheduledDate: null,
    note: "Quality rating 5/5",
  },
  {
    id: "pay-007",
    workerId: "W-006",
    workerName: "David Maina Kariuki",
    taskId: "task-007",
    task: "Potato ridge weeding",
    crop: "Potato Shangi",
    amount: 550,
    dueDate: "11 Nov 2026",
    status: "Pending",
    method: "GrowMO wallet",
    receipt: null,
    scheduledDate: null,
    note: "Attendance still pending",
  },
  {
    id: "pay-008",
    workerId: "W-007",
    workerName: "Esther Nyambura Wanjohi",
    taskId: "task-013",
    task: "Greenhouse bed 3 repairs",
    crop: "Tomato Anna F1",
    amount: 275,
    dueDate: "09 Nov 2026",
    status: "Paid",
    method: "M-Pesa",
    receipt: "TLA9KQ2P4Z",
    scheduledDate: null,
    note: "Paid after completion",
  },
  {
    id: "pay-009",
    workerId: "W-001",
    workerName: "John Mwangi Kamau",
    taskId: "task-008",
    task: "Cabbage harvest",
    crop: "Cabbage Gloria F1",
    amount: 3600,
    dueDate: "15 Jan 2027",
    status: "Future",
    method: "GrowMO wallet",
    receipt: null,
    scheduledDate: "15 Jan 2027",
    note: "Six workers · piece-rate harvest",
  },
  {
    id: "pay-010",
    workerId: "W-002",
    workerName: "Peter Kamau Njoroge",
    taskId: "task-008",
    task: "Cabbage harvest",
    crop: "Cabbage Gloria F1",
    amount: 3600,
    dueDate: "15 Jan 2027",
    status: "Future",
    method: "GrowMO wallet",
    receipt: null,
    scheduledDate: "15 Jan 2027",
    note: "Shared harvest pool",
  },
  {
    id: "pay-011",
    workerId: "W-003",
    workerName: "Grace Wanjiku Mburu",
    taskId: "task-008",
    task: "Cabbage harvest",
    crop: "Cabbage Gloria F1",
    amount: 3600,
    dueDate: "15 Jan 2027",
    status: "Future",
    method: "GrowMO wallet",
    receipt: null,
    scheduledDate: "15 Jan 2027",
    note: "Shared harvest pool",
  },
  {
    id: "pay-012",
    workerId: "W-005",
    workerName: "Lucy Wambui Gichuru",
    taskId: "task-008",
    task: "Cabbage harvest",
    crop: "Cabbage Gloria F1",
    amount: 3600,
    dueDate: "15 Jan 2027",
    status: "Future",
    method: "GrowMO wallet",
    receipt: null,
    scheduledDate: "15 Jan 2027",
    note: "Team lead premium included",
  },
  {
    id: "pay-013",
    workerId: "W-008",
    workerName: "Patrick Ochieng Otieno",
    taskId: "task-008",
    task: "Cabbage harvest loading",
    crop: "Cabbage Gloria F1",
    amount: 1600,
    dueDate: "15 Jan 2027",
    status: "Future",
    method: "GrowMO wallet",
    receipt: null,
    scheduledDate: "15 Jan 2027",
    note: "Crate loading · piece rate",
  },
  {
    id: "pay-014",
    workerId: "W-009",
    workerName: "Ruth Wairimu Kibe",
    taskId: "task-008",
    task: "Cabbage harvest",
    crop: "Cabbage Gloria F1",
    amount: 3600,
    dueDate: "15 Jan 2027",
    status: "Future",
    method: "GrowMO wallet",
    receipt: null,
    scheduledDate: "15 Jan 2027",
    note: "Shared harvest pool",
  },
];

export interface LabourForecastRow {
  id: string;
  crop: string;
  plot: string;
  task: string;
  workers: number | string;
  days: number | string;
  ratePerDay: number;
  total: number;
  when: string;
  status: "Done" | "Planned" | "Self";
}

export const LABOUR_FORECAST: LabourForecastRow[] = [
  {
    id: "fc-01",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Nursery preparation",
    workers: 1,
    days: 1,
    ratePerDay: 500,
    total: 500,
    when: "20 Sep",
    status: "Done",
  },
  {
    id: "fc-02",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Nursery watering",
    workers: "Self",
    days: 30,
    ratePerDay: 0,
    total: 0,
    when: "20 Sep–20 Oct",
    status: "Self",
  },
  {
    id: "fc-03",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Land preparation",
    workers: 2,
    days: 1,
    ratePerDay: 500,
    total: 1000,
    when: "20 Oct",
    status: "Done",
  },
  {
    id: "fc-04",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Manure spreading",
    workers: 2,
    days: 1,
    ratePerDay: 500,
    total: 1000,
    when: "20 Oct",
    status: "Done",
  },
  {
    id: "fc-05",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Transplanting",
    workers: 5,
    days: 1,
    ratePerDay: 500,
    total: 2500,
    when: "20 Oct",
    status: "Done",
  },
  {
    id: "fc-06",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Weeding 1",
    workers: 3,
    days: 1,
    ratePerDay: 500,
    total: 1500,
    when: "25 Oct",
    status: "Done",
  },
  {
    id: "fc-07",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Top dressing + weeding 2",
    workers: 3,
    days: 1,
    ratePerDay: 500,
    total: 1500,
    when: "03 Nov",
    status: "Done",
  },
  {
    id: "fc-08",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Spraying 1",
    workers: 1,
    days: 0.5,
    ratePerDay: 500,
    total: 250,
    when: "15 Nov",
    status: "Planned",
  },
  {
    id: "fc-09",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Weeding 3",
    workers: 2,
    days: 1,
    ratePerDay: 500,
    total: 1000,
    when: "20 Nov",
    status: "Planned",
  },
  {
    id: "fc-10",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Spraying 2",
    workers: 1,
    days: 0.5,
    ratePerDay: 500,
    total: 250,
    when: "01 Dec",
    status: "Planned",
  },
  {
    id: "fc-11",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Foliar application",
    workers: "Self",
    days: 0.5,
    ratePerDay: 0,
    total: 0,
    when: "10 Dec",
    status: "Self",
  },
  {
    id: "fc-12",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Harvest",
    workers: 6,
    days: 1,
    ratePerDay: 600,
    total: 3600,
    when: "15 Jan",
    status: "Planned",
  },
  {
    id: "fc-13",
    crop: "Cabbage",
    plot: "Plot 1 · 0.5 acre",
    task: "Loading & transport",
    workers: 2,
    days: 0.5,
    ratePerDay: 500,
    total: 500,
    when: "15 Jan",
    status: "Planned",
  },
];

export interface LabourBenchmark {
  county: string;
  weeding: string;
  planting: string;
  harvesting: string;
  spraying: string;
  ploughing: string;
  insight: string;
}

export const LABOUR_BENCHMARKS: LabourBenchmark[] = [
  {
    county: "Kiambu",
    weeding: "500–700",
    planting: "500–700",
    harvesting: "600–800",
    spraying: "600–800",
    ploughing: "3,500–4,500",
    insight:
      "Your KES 500 weeding rate is competitive and helps retain reliable workers.",
  },
  {
    county: "Uasin Gishu",
    weeding: "400–600",
    planting: "400–600",
    harvesting: "500–700",
    spraying: "500–700",
    ploughing: "3,000–4,000",
    insight:
      "Maize harvest crews often prefer a per-bag bonus over a flat day rate.",
  },
  {
    county: "Nakuru",
    weeding: "450–650",
    planting: "450–650",
    harvesting: "550–750",
    spraying: "550–750",
    ploughing: "3,000–4,000",
    insight: "Greenhouse workers in Naivasha attract a 10–15% skill premium.",
  },
  {
    county: "Kakamega",
    weeding: "400–550",
    planting: "400–550",
    harvesting: "450–600",
    spraying: "500–650",
    ploughing: "2,500–3,500",
    insight:
      "Teams are usually available for full-day rates during the long rains.",
  },
  {
    county: "Machakos",
    weeding: "400–500",
    planting: "400–500",
    harvesting: "450–550",
    spraying: "450–550",
    ploughing: "2,500–3,500",
    insight:
      "Offer transport on far plots to improve attendance in dry-season work.",
  },
  {
    county: "Kisumu",
    weeding: "400–600",
    planting: "400–600",
    harvesting: "500–700",
    spraying: "500–700",
    ploughing: "3,000–4,000",
    insight:
      "Rice and vegetables benefit from team rates tied to a completed bed.",
  },
  {
    county: "Mombasa",
    weeding: "500–700",
    planting: "500–700",
    harvesting: "600–800",
    spraying: "600–800",
    ploughing: "3,500–5,000",
    insight:
      "Heat makes early starts and a short midday break part of a fair rate.",
  },
  {
    county: "Nairobi",
    weeding: "600–800",
    planting: "600–800",
    harvesting: "700–1,000",
    spraying: "700–1,000",
    ploughing: "4,000–5,000",
    insight:
      "Urban-edge farms should budget for transport and higher opportunity cost.",
  },
];

export interface TaskTemplate {
  id: string;
  name: string;
  type: TaskType;
  defaultWorkers: number;
  defaultDuration: string;
  defaultRate: number;
  rateType: RateType;
  note: string;
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "tpl-01",
    name: "Weeding vegetables · per acre",
    type: "Weeding",
    defaultWorkers: 4,
    defaultDuration: "Full day",
    defaultRate: 500,
    rateType: "Daily rate",
    note: "Keep crop rows clean without damaging stems.",
  },
  {
    id: "tpl-02",
    name: "Weeding maize · per acre",
    type: "Weeding",
    defaultWorkers: 3,
    defaultDuration: "Full day",
    defaultRate: 500,
    rateType: "Daily rate",
    note: "Best before weeds set seed.",
  },
  {
    id: "tpl-03",
    name: "Cabbage transplanting",
    type: "Transplanting",
    defaultWorkers: 6,
    defaultDuration: "Full day",
    defaultRate: 500,
    rateType: "Daily rate",
    note: "Pair with a watering task and seedling count.",
  },
  {
    id: "tpl-04",
    name: "Planting maize · per acre",
    type: "Planting",
    defaultWorkers: 2,
    defaultDuration: "Full day",
    defaultRate: 500,
    rateType: "Daily rate",
    note: "Use a string line for 75 × 30 cm spacing.",
  },
  {
    id: "tpl-05",
    name: "Spraying · per acre",
    type: "Spraying",
    defaultWorkers: 1,
    defaultDuration: "2 hrs",
    defaultRate: 600,
    rateType: "Daily rate",
    note: "Only a trained, PPE-equipped worker.",
  },
  {
    id: "tpl-06",
    name: "Cabbage harvest · per acre",
    type: "Harvesting",
    defaultWorkers: 8,
    defaultDuration: "Full day",
    defaultRate: 600,
    rateType: "Piece rate",
    note: "Grade heads and record crates before loading.",
  },
  {
    id: "tpl-07",
    name: "Maize harvest · per acre",
    type: "Harvesting",
    defaultWorkers: 6,
    defaultDuration: "Multi-day",
    defaultRate: 600,
    rateType: "Daily rate",
    note: "Plan a drying and bagging team.",
  },
  {
    id: "tpl-08",
    name: "Ploughing · tractor",
    type: "Land prep",
    defaultWorkers: 1,
    defaultDuration: "2 hrs",
    defaultRate: 4000,
    rateType: "Piece rate",
    note: "Rate is per acre and includes operator.",
  },
  {
    id: "tpl-09",
    name: "Land prep · ox plough",
    type: "Land prep",
    defaultWorkers: 1,
    defaultDuration: "Full day",
    defaultRate: 600,
    rateType: "Daily rate",
    note: "Book early around the first rains.",
  },
];

export const WORKER_SKILLS = [
  "Weeding",
  "Planting",
  "Transplanting",
  "Spraying",
  "Harvesting",
  "Nursery care",
  "Greenhouse",
  "Irrigation",
  "Land prep",
  "Transport",
  "Sorting",
  "Loading",
];

export const PAYROLL_ACTIVITY = [
  {
    id: "act-01",
    at: "Today 08:12",
    event: "Attendance reminder sent",
    detail: "3 workers · maize weeding",
    kind: "task" as const,
  },
  {
    id: "act-02",
    at: "Yesterday 17:44",
    event: "M-Pesa payment received",
    detail: "Esther Nyambura · KES 275 · TLA9KQ2P4Z",
    kind: "money" as const,
  },
  {
    id: "act-03",
    at: "10 Nov 12:06",
    event: "Worker added",
    detail: "Patrick Ochieng · W-008",
    kind: "worker" as const,
  },
  {
    id: "act-04",
    at: "03 Nov 18:15",
    event: "Payroll run completed",
    detail: "3 workers · KES 1,500",
    kind: "money" as const,
  },
  {
    id: "act-05",
    at: "25 Oct 18:02",
    event: "Task quality recorded",
    detail: "Cabbage weeding · 5/5",
    kind: "task" as const,
  },
];

export interface LabourSettings {
  autoPay: boolean;
  smsReminders: boolean;
  attendanceCutoff: string;
  defaultRate: number;
  requirePhoto: boolean;
  sendPayslip: boolean;
}

export const LABOUR_SETTINGS: LabourSettings = {
  autoPay: true,
  smsReminders: true,
  attendanceCutoff: "18:00",
  defaultRate: 500,
  requirePhoto: false,
  sendPayslip: true,
};

export function workerById(id: string): Worker | undefined {
  return WORKERS.find((worker) => worker.id === id);
}

export function workersForTask(task: LabourTask): Worker[] {
  return task.workerIds
    .map((id) => workerById(id))
    .filter((worker): worker is Worker => Boolean(worker));
}

export function taskStatusTone(
  status: TaskStatus,
): "low" | "medium" | "high" | "neutral" {
  if (status === "Completed") return "low";
  if (status === "Overdue") return "high";
  if (status === "Today" || status === "Upcoming") return "medium";
  return "neutral";
}

export function paymentStatusTone(
  status: PaymentStatus,
): "low" | "medium" | "high" | "neutral" {
  if (status === "Paid") return "low";
  if (status === "Pending") return "high";
  if (status === "Scheduled") return "medium";
  return "neutral";
}

export function attendanceTone(
  status: AttendanceStatus,
): "low" | "medium" | "high" | "neutral" {
  if (status === "Present") return "low";
  if (status === "Absent") return "high";
  if (status === "Late") return "medium";
  return "neutral";
}
