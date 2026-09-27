/* ============================================================================
   PAGE 15.3 — TEAM MANAGEMENT & HUMAN RESOURCES (ADVANCED)  (/app/team)

   Blueprint sections
   15.3.1 Worker directory (expanded)   15.3.2 Recruitment & onboarding
   15.3.3 Attendance management         15.3.4 Performance management
   15.3.5 Payroll processing (full)     15.3.6 Advances & deductions
   15.3.7 Labour compliance (Kenya law) 15.3.8 Labour analytics

   Dates follow the Oct 2026 Kenya calendar used by pages 1–18.
   Payroll week: Oct 20–26, 2026 · payday Friday Oct 23 · receipts QJK…/PLM…
   References: JOB… · APP… · ADV… · DED… · PAY… · CMP… · W-0xx
   ========================================================================== */

export const TEAM_CONTEXT = {
  farm: "Mary's Farm",
  farmer: "Mary Wanjiku",
  county: "Kiambu",
  village: "Githunguri",
  week: "Oct 20 – 26, 2026",
  payday: "Fri, Oct 23, 2026",
  minWageMonth: 3564,
  minWageNote: "2026 gazette — unskilled agriculture",
  walletBalance: 25687.5,
};

/* ---------- 15.3.1 worker directory ---------- */

export type EmpType = "Permanent" | "Seasonal" | "Casual" | "Contract";
export type WorkerStatus =
  | "Active"
  | "Inactive"
  | "Suspended"
  | "Terminated"
  | "On leave";
export type PayFreq =
  | "Daily"
  | "Weekly"
  | "Bi-weekly"
  | "Monthly"
  | "End of task";
export type PayMethod =
  | "GrowMO wallet M-Pesa"
  | "Manual M-Pesa"
  | "Cash"
  | "Bank transfer";

export interface Worker {
  id: string;
  name: string;
  idNo: string;
  phone: string;
  mpesaName: string;
  mpesaNo: string;
  altPhone?: string;
  dob: string;
  gender: "Male" | "Female";
  nationality: string;
  village: string;
  distanceKm: number;
  joinDate: string;
  empType: EmpType;
  contractEnd?: string;
  skills: string[];
  skillLevel: "New" | "Trained" | "Experienced";
  certifications: string[];
  dailyRate: number;
  pieceRates: { task: string; rate: string }[];
  overtimeMultiplier: number;
  payFreq: PayFreq;
  payMethod: PayMethod;
  bankAccount?: string;
  nssf?: string;
  nhif?: string;
  emergency: { name: string; phone: string };
  nextOfKin: { name: string; rel: string; phone: string };
  healthNotes: string;
  rating: number;
  totalEarned: number;
  seasonEarned: number;
  tasksDone: number;
  attendancePct: number;
  absentsMonth: number;
  latesMonth: number;
  status: WorkerStatus;
  statusNote?: string;
  notes: string;
}

export const WORKERS: Worker[] = [
  {
    id: "W-001",
    name: "John Mwangi Kamau",
    idNo: "12345678",
    phone: "0712 345 678",
    mpesaName: "John Mwangi",
    mpesaNo: "0712345678",
    altPhone: "0755 987 654",
    dob: "15/03/1990",
    gender: "Male",
    nationality: "Kenyan",
    village: "Githunguri, Kiambu",
    distanceKm: 2.5,
    joinDate: "01/06/2025",
    empType: "Seasonal",
    contractEnd: "28/02/2027",
    skills: ["Weeding", "Transplanting", "Spraying", "Harvesting"],
    skillLevel: "Experienced",
    certifications: ["Safe use of pesticides (PCPB)"],
    dailyRate: 500,
    pieceRates: [
      { task: "Weeding", rate: "KES 1,500/acre" },
      { task: "Cabbage harvest", rate: "KES 2/head" },
    ],
    overtimeMultiplier: 1.5,
    payFreq: "Weekly",
    payMethod: "GrowMO wallet M-Pesa",
    emergency: { name: "Mary Wanjiku", phone: "0711 555 444" },
    nextOfKin: { name: "Peter Kamau", rel: "Brother", phone: "0722 999 888" },
    healthNotes: "Allergic to dust — wears mask when spraying.",
    rating: 4.2,
    totalEarned: 145000,
    seasonEarned: 38500,
    tasksDone: 87,
    attendancePct: 94,
    absentsMonth: 1,
    latesMonth: 0,
    status: "Active",
    notes: "Reliable worker. Good at transplanting. Comes early.",
  },
  {
    id: "W-002",
    name: "Peter Kamau Njoroge",
    idNo: "23456789",
    phone: "0723 456 789",
    mpesaName: "Peter Kamau",
    mpesaNo: "0723456789",
    dob: "22/07/1995",
    gender: "Male",
    nationality: "Kenyan",
    village: "Karuri, Kiambu",
    distanceKm: 6.5,
    joinDate: "12/03/2025",
    empType: "Casual",
    skills: ["Weeding", "Fencing", "Irrigation"],
    skillLevel: "Trained",
    certifications: [],
    dailyRate: 500,
    pieceRates: [{ task: "Fence line", rate: "KES 800/100 m" }],
    overtimeMultiplier: 1.5,
    payFreq: "Weekly",
    payMethod: "GrowMO wallet M-Pesa",
    emergency: { name: "Ruth Njoroge", phone: "0733 222 111" },
    nextOfKin: { name: "Ruth Njoroge", rel: "Mother", phone: "0733 222 111" },
    healthNotes: "None recorded.",
    rating: 3.6,
    totalEarned: 62300,
    seasonEarned: 18400,
    tasksDone: 41,
    attendancePct: 87,
    absentsMonth: 2,
    latesMonth: 4,
    status: "Active",
    notes: "Good fence work. Watch punctuality — 4 lates this month.",
  },
  {
    id: "W-003",
    name: "Grace Wanjiku Mburu",
    idNo: "34567890",
    phone: "0734 567 890",
    mpesaName: "Grace Wanjiku",
    mpesaNo: "0734567890",
    dob: "09/11/1992",
    gender: "Female",
    nationality: "Kenyan",
    village: "Githunguri, Kiambu",
    distanceKm: 1.8,
    joinDate: "01/01/2026",
    empType: "Casual",
    skills: ["Harvesting", "Packing", "Nursery care"],
    skillLevel: "Trained",
    certifications: ["Food handling (county)"],
    dailyRate: 500,
    pieceRates: [{ task: "Tomato packing", rate: "KES 3/crate" }],
    overtimeMultiplier: 1.5,
    payFreq: "Weekly",
    payMethod: "GrowMO wallet M-Pesa",
    emergency: { name: "David Mburu", phone: "0722 444 333" },
    nextOfKin: { name: "David Mburu", rel: "Father", phone: "0722 444 333" },
    healthNotes: "None recorded.",
    rating: 3.9,
    totalEarned: 28900,
    seasonEarned: 28900,
    tasksDone: 26,
    attendancePct: 91,
    absentsMonth: 2,
    latesMonth: 1,
    status: "Active",
    notes: "Careful packer — lowest rejection rate on the team.",
  },
  {
    id: "W-004",
    name: "Samuel Njoroge Karanja",
    idNo: "45678901",
    phone: "0745 678 901",
    mpesaName: "Samuel Njoroge",
    mpesaNo: "0745678901",
    altPhone: "0111 234 567",
    dob: "30/01/1988",
    gender: "Male",
    nationality: "Kenyan",
    village: "Nyeri Rd, Githunguri",
    distanceKm: 3.2,
    joinDate: "15/09/2024",
    empType: "Seasonal",
    contractEnd: "30/11/2026",
    skills: ["Spraying", "Irrigation", "Fence repair"],
    skillLevel: "Experienced",
    certifications: ["Safe use of pesticides (PCPB)", "Dropper calibration"],
    dailyRate: 500,
    pieceRates: [{ task: "Spraying", rate: "KES 500/acre" }],
    overtimeMultiplier: 1.5,
    payFreq: "Weekly",
    payMethod: "GrowMO wallet M-Pesa",
    emergency: { name: "Jane Karanja", phone: "0799 888 777" },
    nextOfKin: { name: "Jane Karanja", rel: "Sister", phone: "0799 888 777" },
    healthNotes: "Asthmatic — no carbaryl, no early-morning fog spraying.",
    rating: 4.5,
    totalEarned: 201400,
    seasonEarned: 52100,
    tasksDone: 112,
    attendancePct: 100,
    absentsMonth: 0,
    latesMonth: 0,
    status: "Active",
    notes: "Our sprayer. Calibrated every tank; zero drift complaints.",
  },
  {
    id: "W-005",
    name: "Joseph Muthoni Wafula",
    idNo: "56789012",
    phone: "0798 765 432",
    mpesaName: "Joseph Muthoni",
    mpesaNo: "0798765432",
    dob: "12/03/2009",
    gender: "Male",
    nationality: "Kenyan",
    village: "Githunguri, Kiambu",
    distanceKm: 0.9,
    joinDate: "01/10/2026",
    empType: "Casual",
    skills: ["Weeding", "Watering"],
    skillLevel: "New",
    certifications: [],
    dailyRate: 450,
    pieceRates: [],
    overtimeMultiplier: 1.5,
    payFreq: "End of task",
    payMethod: "Cash",
    emergency: { name: "Mercy Wafula", phone: "0700 123 987" },
    nextOfKin: { name: "Mercy Wafula", rel: "Mother", phone: "0700 123 987" },
    healthNotes: "School schedule — available mornings and after 4 pm only.",
    rating: 3.5,
    totalEarned: 2700,
    seasonEarned: 2700,
    tasksDone: 6,
    attendancePct: 100,
    absentsMonth: 0,
    latesMonth: 0,
    status: "Active",
    statusNote: "17 — non-hazardous tasks only (under-18 rule).",
    notes: "Neighbour's son, student. Good effort on the nursery.",
  },
  {
    id: "W-006",
    name: "Lucy Wambui Gichuru",
    idNo: "67890123",
    phone: "0722 678 111",
    mpesaName: "Lucy Wambui",
    mpesaNo: "0722678111",
    dob: "02/02/1985",
    gender: "Female",
    nationality: "Kenyan",
    village: "Kikuyu, Kiambu",
    distanceKm: 9.4,
    joinDate: "01/04/2022",
    empType: "Permanent",
    skills: ["Bookkeeping", "Nursery", "Irrigation"],
    skillLevel: "Experienced",
    certifications: ["Crop production certificate (EPA)"],
    dailyRate: 120,
    pieceRates: [],
    overtimeMultiplier: 1.5,
    payFreq: "Monthly",
    payMethod: "Bank transfer",
    bankAccount: "KCB, A/C 1234 5678 90, Lucy Wambui",
    nssf: "NSSF-123456",
    nhif: "NHIF-789012",
    emergency: { name: "David Gichuru", phone: "0731 555 222" },
    nextOfKin: { name: "David Gichuru", rel: "Husband", phone: "0731 555 222" },
    healthNotes: "None recorded.",
    rating: 4.7,
    totalEarned: 812000,
    seasonEarned: 43200,
    tasksDone: 134,
    attendancePct: 98,
    absentsMonth: 0,
    latesMonth: 0,
    status: "Active",
    notes: "Farm bookkeeper & nursery lead. 21 days annual leave — 3 used.",
  },
  {
    id: "W-007",
    name: "David Maina Kariuki",
    idNo: "78901234",
    phone: "0709 888 222",
    mpesaName: "David Maina",
    mpesaNo: "0709888222",
    dob: "11/08/1993",
    gender: "Male",
    nationality: "Kenyan",
    village: "Ruiru, Kiambu",
    distanceKm: 11.2,
    joinDate: "01/09/2026",
    empType: "Seasonal",
    contractEnd: "28/02/2027",
    skills: ["Harvesting", "Tractor helper", "Loading"],
    skillLevel: "Trained",
    certifications: ["Safe use of pesticides (PCPB)"],
    dailyRate: 550,
    pieceRates: [{ task: "Onion loading", rate: "KES 250/trip" }],
    overtimeMultiplier: 1.5,
    payFreq: "Weekly",
    payMethod: "Manual M-Pesa",
    emergency: { name: "Cecilia Kariuki", phone: "0720 333 444" },
    nextOfKin: {
      name: "Cecilia Kariuki",
      rel: "Mother",
      phone: "0720 333 444",
    },
    healthNotes: "None recorded.",
    rating: 4.0,
    totalEarned: 9600,
    seasonEarned: 9600,
    tasksDone: 18,
    attendancePct: 95,
    absentsMonth: 1,
    latesMonth: 1,
    status: "Active",
    notes:
      "Strong loader. Season contract ends 28/02/2027 — written contract filed.",
  },
  {
    id: "W-008",
    name: "Esther Nyambura Wanjohi",
    idNo: "89012345",
    phone: "0733 111 777",
    mpesaName: "Esther Nyambura",
    mpesaNo: "0733111777",
    dob: "27/06/1991",
    gender: "Female",
    nationality: "Kenyan",
    village: "Githunguri, Kiambu",
    distanceKm: 2.1,
    joinDate: "01/08/2021",
    empType: "Permanent",
    skills: ["Packaging", "Quality control"],
    skillLevel: "Experienced",
    certifications: ["Food handling (county)"],
    dailyRate: 120,
    pieceRates: [],
    overtimeMultiplier: 1.5,
    payFreq: "Monthly",
    payMethod: "Bank transfer",
    bankAccount: "Equity, A/C 9876 5432 10, Esther Nyambura",
    nssf: "NSSF-654321",
    nhif: "NHIF-234567",
    emergency: { name: "James Wanjohi", phone: "0712 000 555" },
    nextOfKin: { name: "James Wanjohi", rel: "Husband", phone: "0712 000 555" },
    healthNotes: "Third trimester — light duties only until delivery.",
    rating: 4.4,
    totalEarned: 498000,
    seasonEarned: 14400,
    tasksDone: 58,
    attendancePct: 88,
    absentsMonth: 0,
    latesMonth: 0,
    status: "On leave",
    statusNote: "Maternity leave from 01/11/2026 — 90 days (Labour Act).",
    notes: "QC lead. Return date ~30/01/2027.",
  },
  {
    id: "W-009",
    name: "Ruth Wairimu Kibe",
    idNo: "90123456",
    phone: "0711 444 909",
    mpesaName: "Ruth Wairimu",
    mpesaNo: "0711444909",
    dob: "14/12/1997",
    gender: "Female",
    nationality: "Kenyan",
    village: "Kikuyu, Kiambu",
    distanceKm: 8.8,
    joinDate: "01/05/2026",
    empType: "Casual",
    skills: ["Weeding"],
    skillLevel: "New",
    certifications: [],
    dailyRate: 450,
    pieceRates: [],
    overtimeMultiplier: 1.5,
    payFreq: "Daily",
    payMethod: "Cash",
    emergency: { name: "Sam Kibe", phone: "0726 777 888" },
    nextOfKin: { name: "Sam Kibe", rel: "Father", phone: "0726 777 888" },
    healthNotes: "None recorded.",
    rating: 2.8,
    totalEarned: 7200,
    seasonEarned: 7200,
    tasksDone: 16,
    attendancePct: 71,
    absentsMonth: 3,
    latesMonth: 5,
    status: "Suspended",
    statusNote:
      "Suspended 18/10 — 3 unexcused absences. Review with support on 30/10.",
    notes: "Fair weeding, but reliability has slipped since September.",
  },
];

export const WORKER_SKILLS = [
  "Weeding",
  "Transplanting",
  "Spraying",
  "Harvesting",
  "Irrigation",
  "Fencing",
  "Packing",
  "Nursery care",
  "Bookkeeping",
  "Tractor helper",
  "Loading",
  "Quality control",
  "Watering",
  "Fence repair",
];

export const EMP_TYPES: EmpType[] = [
  "Permanent",
  "Seasonal",
  "Casual",
  "Contract",
];
export const WORKER_STATUSES: WorkerStatus[] = [
  "Active",
  "Inactive",
  "Suspended",
  "Terminated",
  "On leave",
];
export const PAY_FREQS: PayFreq[] = [
  "Daily",
  "Weekly",
  "Bi-weekly",
  "Monthly",
  "End of task",
];
export const PAY_METHODS: PayMethod[] = [
  "GrowMO wallet M-Pesa",
  "Manual M-Pesa",
  "Cash",
  "Bank transfer",
];

/* ---------- 15.3.2 recruitment & onboarding ---------- */

export interface JobPost {
  id: string;
  title: string;
  skills: string[];
  duration: string;
  rate: string;
  needed: number;
  hired: number;
  location: string;
  accommodation: "Not provided" | "Provided";
  meals: "Not provided" | "Lunch provided";
  requirements: string;
  howToApply: string;
  posted: string;
  closes: string;
  channels: string[];
  status: "Open" | "Filling" | "Closed";
}

export const JOB_POSTS: JobPost[] = [
  {
    id: "JOB-014",
    title: "Casual farm worker — vegetable weeding",
    skills: ["Weeding", "Able to work outdoors"],
    duration: "2 weeks (Oct 20 – Nov 3)",
    rate: "KES 500/day",
    needed: 4,
    hired: 2,
    location: "Githunguri, Kiambu",
    accommodation: "Not provided",
    meals: "Lunch provided",
    requirements: "Own jembe preferred",
    howToApply: "Call 0712 345 678 or visit farm",
    posted: "12/10/2026",
    closes: "18/10/2026",
    channels: [
      "GrowMO community board",
      "WhatsApp group",
      "SMS to 14 nearby workers",
    ],
    status: "Filling",
  },
  {
    id: "JOB-015",
    title: "Seasonal sprayer — kale & cabbage (2 seasons)",
    skills: ["Spraying", "PCPB certification"],
    duration: "Sep 2026 – Feb 2027",
    rate: "KES 550/day + KES 500/acre piece rate",
    needed: 1,
    hired: 1,
    location: "Githunguri, Kiambu",
    accommodation: "Not provided",
    meals: "Lunch provided",
    requirements: "PCPB certificate, own knapsack preferred",
    howToApply: "Called 6 certified sprayers from the community board",
    posted: "28/08/2026",
    closes: "10/09/2026",
    channels: ["GrowMO community board", "Chief's office notice"],
    status: "Closed",
  },
  {
    id: "JOB-016",
    title: "Nursery assistant — seedling production",
    skills: ["Nursery care", "Watering", "Packing"],
    duration: "4 months (Nov 2026 – Feb 2027)",
    rate: "KES 450/day",
    needed: 2,
    hired: 0,
    location: "Githunguri, Kiambu",
    accommodation: "Not provided",
    meals: "Not provided",
    requirements: "Mornings only OK — seedlings watered 6–10 am",
    howToApply: "Draft — not yet posted",
    posted: "—",
    closes: "—",
    channels: [],
    status: "Open",
  },
];

export interface Applicant {
  id: string;
  name: string;
  phone: string;
  job: string;
  village: string;
  skills: string[];
  lastWorked: string;
  applied: string;
  stage: "Applied" | "Shortlisted" | "Onboarding" | "Hired" | "Declined";
  note: string;
}

export const APPLICANTS: Applicant[] = [
  {
    id: "APP-201",
    name: "Kevin Kariuki Mũrũri",
    phone: "0728 456 711",
    job: "JOB-014 · Weeding (2 wks)",
    village: "Githunguri",
    skills: ["Weeding", "Harvesting"],
    lastWorked: "Kikuyu kitchen garden, Aug 2026",
    applied: "13/10/2026",
    stage: "Hired",
    note: "Started 20/10 — in the directory as W-010.",
  },
  {
    id: "APP-202",
    name: "Faith Kiprotich Chepkoech",
    phone: "0719 222 640",
    job: "JOB-014 · Weeding (2 wks)",
    village: "Kieni, Nyeri",
    skills: ["Weeding"],
    lastWorked: "Tea smallholder, Oct 2026",
    applied: "13/10/2026",
    stage: "Hired",
    note: "Started 20/10 — in the directory as W-011.",
  },
  {
    id: "APP-203",
    name: "Brian Otieno Achieng",
    phone: "0735 666 012",
    job: "JOB-014 · Weeding (2 wks)",
    village: "Karura, Kiambu",
    skills: ["Weeding", "Fencing"],
    lastWorked: "Garden, Aug 2026",
    applied: "14/10/2026",
    stage: "Onboarding",
    note: "M-Pesa name verified 22/10. Safety briefing pending (slot 23/10 3 pm).",
  },
  {
    id: "APP-204",
    name: "Cynthia Mwangi Njeri",
    phone: "0706 888 345",
    job: "JOB-014 · Weeding (2 wks)",
    village: "Ruiru, Kiambu",
    skills: ["Weeding"],
    lastWorked: "First farm job",
    applied: "14/10/2026",
    stage: "Shortlisted",
    note: "Available from 27/10 — offered the remaining slot from next week.",
  },
  {
    id: "APP-205",
    name: "Alex Njoroge Mwangi",
    phone: "0799 010 456",
    job: "JOB-016 · Nursery assistant (draft)",
    village: "Githunguri",
    skills: ["Nursery care"],
    lastWorked: "Seed company nursery, 2025",
    applied: "17/10/2026",
    stage: "Applied",
    note: "Applied before the post went live — strong candidate, call after 19/10.",
  },
  {
    id: "APP-206",
    name: "Wanja Mũturi Kariuki",
    phone: "0722 555 789",
    job: "JOB-015 · Seasonal sprayer",
    village: "Nyeri Rd",
    skills: ["Spraying"],
    lastWorked: "Maize farm, Sep 2026",
    applied: "02/09/2026",
    stage: "Declined",
    note: "No PCPB certificate — advised on the PCPB course in Kikuyu.",
  },
];

export const ONBOARDING_STEPS = [
  "Collect ID copy (photo)",
  "Record phone number",
  "Verify M-Pesa name matches ID",
  "Explain payment terms and rate",
  "Safety briefing (tools, chemicals, PPE)",
  "Show farm boundaries, toilets, water point",
  "Add to worker directory in GrowMO",
  "Assign to first task",
];

/* ---------- 15.3.3 attendance ---------- */

export interface AttendanceMethod {
  id: string;
  method: string;
  how: string;
  bestFor: string;
  available: boolean;
  active: boolean;
}

export const ATTENDANCE_METHODS: AttendanceMethod[] = [
  {
    id: "am1",
    method: "Farmer marks manually",
    how: "Farmer opens the app, ticks present/absent per worker per task",
    bestFor: "Small teams (<10)",
    available: true,
    active: true,
  },
  {
    id: "am2",
    method: "Worker SMS check-in",
    how: 'Worker texts "IN" to 20550 → logged with a timestamp',
    bestFor: "Larger teams, no smartphones",
    available: true,
    active: true,
  },
  {
    id: "am3",
    method: "Worker USSD check-in",
    how: "Worker dials *384*3*1# → confirmed on screen",
    bestFor: "No-smartphone workers",
    available: true,
    active: true,
  },
  {
    id: "am4",
    method: "Geofenced check-in",
    how: "Worker opens the app at the farm → GPS auto-detect → checked in",
    bestFor: "Teams with smartphones",
    available: true,
    active: false,
  },
  {
    id: "am5",
    method: "Biometric (future)",
    how: "Fingerprint scanner at the farm gate",
    bestFor: "Large commercial farms",
    available: false,
    active: false,
  },
];

export type AttStatus = "Present" | "Absent" | "Half day" | "Late" | "Leave";

export interface AttendanceRow {
  worker: string;
  workerId: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: AttStatus;
  task: string;
  notes: string;
}

export const ATTENDANCE_TODAY: AttendanceRow[] = [
  {
    worker: "John Mwangi",
    workerId: "W-001",
    checkIn: "7:45 AM",
    checkOut: "—",
    hours: "so far 3.5",
    status: "Present",
    task: "Weeding Plot 1",
    notes: "—",
  },
  {
    worker: "Peter Kamau",
    workerId: "W-002",
    checkIn: "8:10 AM",
    checkOut: "—",
    hours: "so far 3.2",
    status: "Late",
    task: "Weeding Plot 1",
    notes: "25 min late — 4th this month",
  },
  {
    worker: "Grace Wanjiku",
    workerId: "W-003",
    checkIn: "—",
    checkOut: "—",
    hours: "0",
    status: "Absent",
    task: "—",
    notes: "Called, said sick — half-day leave noted",
  },
  {
    worker: "Samuel Njoroge",
    workerId: "W-004",
    checkIn: "7:50 AM",
    checkOut: "—",
    hours: "so far 3.4",
    status: "Present",
    task: "Spraying Plot 2",
    notes: "Mask on — dust allergy noted",
  },
  {
    worker: "Joseph Muthoni",
    workerId: "W-005",
    checkIn: "8:30 AM",
    checkOut: "12:00 PM",
    hours: "3.5",
    status: "Half day",
    task: "Watering nursery",
    notes: "Left early for school, permission granted",
  },
  {
    worker: "Lucy Wambui",
    workerId: "W-006",
    checkIn: "7:30 AM",
    checkOut: "—",
    hours: "so far 3.6",
    status: "Present",
    task: "Nursery + bookkeeping",
    notes: "—",
  },
  {
    worker: "David Maina",
    workerId: "W-007",
    checkIn: "7:55 AM",
    checkOut: "—",
    hours: "so far 3.4",
    status: "Present",
    task: "Loading out tomatoes",
    notes: "—",
  },
  {
    worker: "Ruth Wairimu",
    workerId: "W-009",
    checkIn: "—",
    checkOut: "—",
    hours: "0",
    status: "Absent",
    task: "—",
    notes: "Suspended — no entry until 30/10 review",
  },
];

export interface MonthlyAttRow {
  worker: string;
  workerId: string;
  present: number;
  absent: number;
  late: number;
  half: number;
  pct: number;
  overtime: number;
}

export const ATTENDANCE_MONTH: MonthlyAttRow[] = [
  {
    worker: "John Mwangi",
    workerId: "W-001",
    present: 22,
    absent: 1,
    late: 0,
    half: 0,
    pct: 96,
    overtime: 5,
  },
  {
    worker: "Peter Kamau",
    workerId: "W-002",
    present: 20,
    absent: 2,
    late: 4,
    half: 1,
    pct: 87,
    overtime: 0,
  },
  {
    worker: "Grace Wanjiku",
    workerId: "W-003",
    present: 21,
    absent: 2,
    late: 1,
    half: 0,
    pct: 91,
    overtime: 2,
  },
  {
    worker: "Samuel Njoroge",
    workerId: "W-004",
    present: 23,
    absent: 0,
    late: 0,
    half: 0,
    pct: 100,
    overtime: 8,
  },
  {
    worker: "Joseph Muthoni",
    workerId: "W-005",
    present: 20,
    absent: 0,
    late: 0,
    half: 10,
    pct: 100,
    overtime: 0,
  },
  {
    worker: "Lucy Wambui",
    workerId: "W-006",
    present: 23,
    absent: 0,
    late: 0,
    half: 0,
    pct: 100,
    overtime: 0,
  },
  {
    worker: "David Maina",
    workerId: "W-007",
    present: 22,
    absent: 1,
    late: 1,
    half: 0,
    pct: 95,
    overtime: 4,
  },
  {
    worker: "Ruth Wairimu",
    workerId: "W-009",
    present: 16,
    absent: 3,
    late: 5,
    half: 1,
    pct: 71,
    overtime: 0,
  },
];

export const ATTENDANCE_LOGS = [
  {
    id: "cl1",
    ts: "23/10 07:30",
    who: "Lucy Wambui",
    method: "Farmer marked",
    note: "Present — nursery + bookkeeping",
  },
  {
    id: "cl2",
    ts: "23/10 07:45",
    who: "John Mwangi",
    method: "SMS 'IN' → 20550",
    note: "Check-in logged 07:45:12",
  },
  {
    id: "cl3",
    ts: "23/10 07:50",
    who: "Samuel Njoroge",
    method: "USSD *384*3*1#",
    note: "Confirmed — assigned Plot 2 spraying",
  },
  {
    id: "cl4",
    ts: "23/10 07:55",
    who: "David Maina",
    method: "SMS 'IN' → 20550",
    note: "Check-in logged 07:55:40",
  },
  {
    id: "cl5",
    ts: "23/10 08:10",
    who: "Peter Kamau",
    method: "SMS 'IN' → 20550",
    note: "25 min late — reminder SMS sent",
  },
  {
    id: "cl6",
    ts: "23/10 08:30",
    who: "Joseph Muthoni",
    method: "Farmer marked",
    note: "Present (mornings only — school schedule)",
  },
  {
    id: "cl7",
    ts: "23/10 09:12",
    who: "Grace Wanjiku",
    method: "Phone call",
    note: "Absent — sick, half-day leave noted",
  },
  {
    id: "cl8",
    ts: "22/10 18:05",
    who: "John Mwangi",
    method: "SMS 'OUT' → 20550",
    note: "Check-out logged — 9.5 hrs",
  },
];

/* ---------- 15.3.4 performance ---------- */

export const RATING_SCALE = [
  {
    stars: 5,
    label: "Excellent",
    desc: "Exceeded expectations, no rework needed",
  },
  { stars: 4, label: "Good", desc: "Met all expectations, minor issues" },
  { stars: 3, label: "Satisfactory", desc: "Done adequately, some rework" },
  { stars: 2, label: "Below average", desc: "Significant rework needed" },
  { stars: 1, label: "Poor", desc: "Work unacceptable, must redo" },
];

export interface PerfHistory {
  month: string;
  rating: number;
  tasks: number;
  farmAvg: number;
}

export const PERF_HISTORY: PerfHistory[] = [
  { month: "Nov 25", rating: 3.9, tasks: 6, farmAvg: 3.6 },
  { month: "Dec 25", rating: 4.0, tasks: 7, farmAvg: 3.7 },
  { month: "Jan 26", rating: 4.1, tasks: 8, farmAvg: 3.7 },
  { month: "Feb 26", rating: 3.8, tasks: 5, farmAvg: 3.5 },
  { month: "Mar 26", rating: 4.2, tasks: 9, farmAvg: 3.8 },
  { month: "Apr 26", rating: 4.3, tasks: 10, farmAvg: 3.9 },
  { month: "May 26", rating: 4.1, tasks: 8, farmAvg: 3.8 },
  { month: "Jun 26", rating: 4.4, tasks: 11, farmAvg: 3.9 },
  { month: "Jul 26", rating: 4.5, tasks: 12, farmAvg: 4.0 },
  { month: "Aug 26", rating: 4.3, tasks: 9, farmAvg: 3.9 },
  { month: "Sep 26", rating: 4.2, tasks: 7, farmAvg: 3.8 },
  { month: "Oct 26", rating: 4.2, tasks: 4, farmAvg: 4.0 },
];

export interface TaskRating {
  id: string;
  worker: string;
  task: string;
  plot: string;
  date: string;
  stars: number;
  note: string;
  rework: boolean;
}

export const TASK_RATINGS: TaskRating[] = [
  {
    id: "rt1",
    worker: "John Mwangi",
    task: "Weeding",
    plot: "Plot 1 — cabbage",
    date: "21/10/2026",
    stars: 5,
    note: "Clean rows, missed nothing near the base.",
    rework: false,
  },
  {
    id: "rt2",
    worker: "Samuel Njoroge",
    task: "Spraying",
    plot: "Plot 2 — kale",
    date: "22/10/2026",
    stars: 5,
    note: "Calibrated, even coverage, no drift.",
    rework: false,
  },
  {
    id: "rt3",
    worker: "Peter Kamau",
    task: "Weeding",
    plot: "Plot 1 — cabbage",
    date: "21/10/2026",
    stars: 4,
    note: "Good work; left a band by the fence post.",
    rework: false,
  },
  {
    id: "rt4",
    worker: "Grace Wanjiku",
    task: "Packing",
    plot: "Store — tomatoes",
    date: "22/10/2026",
    stars: 4,
    note: "Lowest rejection rate again (0.4%).",
    rework: false,
  },
  {
    id: "rt5",
    worker: "David Maina",
    task: "Loading",
    plot: "Bore store",
    date: "23/10/2026",
    stars: 5,
    note: "42 crates, zero breakage — best on record.",
    rework: false,
  },
  {
    id: "rt6",
    worker: "Joseph Muthoni",
    task: "Watering",
    plot: "Nursery",
    date: "23/10/2026",
    stars: 4,
    note: "Even watering, right amount per tray.",
    rework: false,
  },
  {
    id: "rt7",
    worker: "Ruth Wairimu",
    task: "Weeding",
    plot: "Plot 3 — kale",
    date: "17/10/2026",
    stars: 2,
    note: "Rushed; 20% of rows needed a second pass.",
    rework: true,
  },
  {
    id: "rt8",
    worker: "John Mwangi",
    task: "Transplanting",
    plot: "Plot 4 — kale",
    date: "15/10/2026",
    stars: 5,
    note: "Minimal seedling damage — his signature work.",
    rework: false,
  },
  {
    id: "rt9",
    worker: "Lucy Wambui",
    task: "Nursery batch",
    plot: "Nursery — tomato F1",
    date: "12/10/2026",
    stars: 5,
    note: "Batch graded A — 96% viability.",
    rework: false,
  },
  {
    id: "rt10",
    worker: "Peter Kamau",
    task: "Fencing",
    plot: "East boundary",
    date: "08/10/2026",
    stars: 3,
    note: "Solid but tension uneven on two stays.",
    rework: true,
  },
];

export const PERFORMANCE_CARDS: Record<
  string,
  {
    avg: number;
    dist: [number, number, number, number, number]; // 5★ .. 1★
    rework: number;
    noShow: number;
    lates: number;
    speedVs: string;
    qualityVs: string;
    strengths: string;
    improve: string;
  }
> = {
  "John Mwangi": {
    avg: 4.2,
    dist: [35, 38, 12, 2, 0],
    rework: 5,
    noShow: 0,
    lates: 3,
    speedVs: "+15% (faster than average)",
    qualityVs: "+8% (fewer reworks)",
    strengths: "Excellent transplanting technique, minimal seedling damage.",
    improve: "Sometimes rushes weeding, misses roots near the crop base.",
  },
  "Peter Kamau": {
    avg: 3.6,
    dist: [8, 31, 41, 15, 5],
    rework: 9,
    noShow: 2,
    lates: 7,
    speedVs: "−4% (slower than average)",
    qualityVs: "+1%",
    strengths: "Strong fence and boundary work; good with tools.",
    improve: "Punctuality and second-pass care on weeding bands.",
  },
  "Grace Wanjiku": {
    avg: 3.9,
    dist: [14, 46, 30, 8, 2],
    rework: 3,
    noShow: 1,
    lates: 2,
    speedVs: "+3%",
    qualityVs: "+11% (lowest rejection rate)",
    strengths: "Quality control instinct — catches faults before they ship.",
    improve: "Pace on big packing days; build stamina for rush weeks.",
  },
  "Samuel Njoroge": {
    avg: 4.5,
    dist: [48, 41, 9, 2, 0],
    rework: 2,
    noShow: 0,
    lates: 0,
    speedVs: "+9%",
    qualityVs: "+14% (zero drift complaints)",
    strengths: "Precision spraying; documents every tank batch.",
    improve: "Willingness to cross-train on harvesting to cover leaves.",
  },
  "Joseph Muthoni": {
    avg: 3.5,
    dist: [3, 22, 62, 10, 3],
    rework: 2,
    noShow: 0,
    lates: 0,
    speedVs: "— (student hours)",
    qualityVs: "+2%",
    strengths: "Gentle with seedlings; consistent in the nursery.",
    improve: "Confidence to take a full weeding row solo.",
  },
  "Lucy Wambui": {
    avg: 4.7,
    dist: [58, 34, 7, 1, 0],
    rework: 1,
    noShow: 0,
    lates: 0,
    speedVs: "+6%",
    qualityVs: "+16% (batch A grades)",
    strengths: "Nursery batches grade A; keeps books audit-ready.",
    improve: "Delegate seedling-counting to free time for records review.",
  },
  "David Maina": {
    avg: 4.0,
    dist: [19, 50, 26, 4, 1],
    rework: 2,
    noShow: 1,
    lates: 1,
    speedVs: "+7%",
    qualityVs: "+4% (zero breakage on loading)",
    strengths: "Fastest loader on the farm; careful crate handling.",
    improve: "Show-up rate on market mornings (4:30 am calls).",
  },
  "Ruth Wairimu": {
    avg: 2.8,
    dist: [2, 12, 37, 34, 15],
    rework: 6,
    noShow: 3,
    lates: 5,
    speedVs: "−12%",
    qualityVs: "−18%",
    strengths: "Fine on short tasks when supervised.",
    improve: "Reliability, pace, and second-pass care — review 30/10.",
  },
};

/* ---------- 15.3.5 payroll ---------- */

export interface PayslipLine {
  worker: string;
  workerId: string;
  daysWorked: number;
  dailyRate: number;
  basic: number;
  otHours: number;
  otRate: number;
  otPay: number;
  piece: number;
  pieceNote?: string;
  absenceDed: number;
  absenceNote?: string;
  advanceDed: number;
  otherDed: number;
  otherNote?: string;
  bonus: number;
  bonusNote?: string;
}

export const PAYROLL_LINES: PayslipLine[] = [
  {
    worker: "John Mwangi",
    workerId: "W-001",
    daysWorked: 5,
    dailyRate: 500,
    basic: 2500,
    otHours: 2,
    otRate: 93.75,
    otPay: 187.5,
    piece: 0,
    absenceDed: 0,
    advanceDed: 1000,
    otherDed: 0,
    bonus: 0,
  },
  {
    worker: "Peter Kamau",
    workerId: "W-002",
    daysWorked: 4.5,
    dailyRate: 500,
    basic: 2250,
    otHours: 0,
    otRate: 93.75,
    otPay: 0,
    piece: 0,
    absenceDed: 500,
    absenceNote: "1 day absent without notice",
    advanceDed: 0,
    otherDed: 0,
    bonus: 0,
  },
  {
    worker: "Grace Wanjiku",
    workerId: "W-003",
    daysWorked: 5,
    dailyRate: 500,
    basic: 2500,
    otHours: 1,
    otRate: 93.75,
    otPay: 93.75,
    piece: 0,
    absenceDed: 0,
    advanceDed: 500,
    otherDed: 0,
    bonus: 0,
  },
  {
    worker: "Samuel Njoroge",
    workerId: "W-004",
    daysWorked: 5,
    dailyRate: 500,
    basic: 2500,
    otHours: 3,
    otRate: 93.75,
    otPay: 281.25,
    piece: 500,
    pieceNote: "Spraying bonus — Plot 2 kale",
    absenceDed: 0,
    advanceDed: 0,
    otherDed: 300,
    otherNote: "Damage: sprayer nozzle (DED-002)",
    bonus: 0,
  },
];

export function payslipNet(l: PayslipLine): number {
  return (
    Math.round(
      (l.basic +
        l.otPay +
        l.piece +
        l.bonus -
        l.absenceDed -
        l.advanceDed -
        l.otherDed) *
        100,
    ) / 100
  );
}

export const BATCH_RECEIPTS: Record<string, string> = {
  "W-001": "QJK3L5X7YZ",
  "W-002": "PLM8NR2KQW",
  "W-003": "RTY9PV3NXM",
  "W-004": "NMP7QW3ERT",
};

export const PAYROLL_SMS = (name: string, amount: string, ref: string) =>
  `Umelipwa KES ${amount} kwa GrowMO (Mary's Farm). Wiki ya Oct 20–26. Receipt: ${ref} — ${name}`;

/* ---------- 15.3.6 advances & deductions ---------- */

export interface AdvanceRec {
  id: string;
  worker: string;
  workerId: string;
  type: "Advance" | "Deduction";
  amount: number;
  date: string;
  reason: string;
  plan: string;
  remaining: number;
  status: "Repaying" | "Settled" | "Deducted";
}

export const ADVANCES: AdvanceRec[] = [
  {
    id: "ADV-001",
    worker: "John Mwangi",
    workerId: "W-001",
    type: "Advance",
    amount: 1000,
    date: "20/10/2026",
    reason: "School fees",
    plan: "Deduct KES 200/week for 5 weeks",
    remaining: 1000,
    status: "Repaying",
  },
  {
    id: "ADV-002",
    worker: "Grace Wanjiku",
    workerId: "W-003",
    type: "Advance",
    amount: 2000,
    date: "15/10/2026",
    reason: "Medical",
    plan: "Deduct KES 500/week for 4 weeks",
    remaining: 2000,
    status: "Repaying",
  },
  {
    id: "ADV-003",
    worker: "David Maina",
    workerId: "W-007",
    type: "Advance",
    amount: 800,
    date: "02/10/2026",
    reason: "Transport home for harvest weekend",
    plan: "Deduct KES 267/week for 3 weeks",
    remaining: 267,
    status: "Repaying",
  },
  {
    id: "ADV-004",
    worker: "Peter Kamau",
    workerId: "W-002",
    type: "Advance",
    amount: 1500,
    date: "20/09/2026",
    reason: "Funeral expenses",
    plan: "Deduct KES 300/week for 5 weeks",
    remaining: 0,
    status: "Settled",
  },
  {
    id: "DED-001",
    worker: "Peter Kamau",
    workerId: "W-002",
    type: "Deduction",
    amount: 500,
    date: "24/10/2026",
    reason: "1 day absent without notice",
    plan: "Applied this payroll",
    remaining: 0,
    status: "Deducted",
  },
  {
    id: "DED-002",
    worker: "Samuel Njoroge",
    workerId: "W-004",
    type: "Deduction",
    amount: 300,
    date: "22/10/2026",
    reason: "Broke sprayer nozzle",
    plan: "One-time",
    remaining: 0,
    status: "Deducted",
  },
];

/* ---------- 15.3.7 compliance ---------- */

export interface ComplianceRow {
  id: string;
  requirement: string;
  details: string;
  tracking: string;
  status: "Met" | "Warning" | "Action needed";
  note: string;
}

export const COMPLIANCE: ComplianceRow[] = [
  {
    id: "cmp1",
    requirement: "Minimum wage (agriculture)",
    details:
      "KES 3,564/month (2026 gazette) for unskilled; KES 500+/day common market rate",
    tracking: "Alert if a worker's rate falls below minimum",
    status: "Met",
    note: "Permanent staff (Lucy, Esther) gross KES 3,600/month — above the floor. Casual day rates run KES 450–550.",
  },
  {
    id: "cmp2",
    requirement: "NSSF contribution",
    details: "6% employee + 6% employer of gross pay (permanent employees)",
    tracking: "Auto-calculated for permanent workers",
    status: "Met",
    note: "Lucy & Esther: KES 216 each side, deducted at source, remitted by the 10th.",
  },
  {
    id: "cmp3",
    requirement: "NHIF / SHA contribution",
    details: "KES 170–1,700/month sliding scale",
    tracking: "Auto-calculated",
    status: "Met",
    note: "Both permanent staff on the KES 300 tier; statements filed.",
  },
  {
    id: "cmp4",
    requirement: "Housing levy",
    details: "1.5% of gross pay (2024+)",
    tracking: "Auto-calculated",
    status: "Met",
    note: "KES 54 each, included in the monthly bank run.",
  },
  {
    id: "cmp5",
    requirement: "Work injury benefit",
    details: "Covered via NHIF/SHA for registered employees",
    tracking: "Tracked",
    status: "Met",
    note: "No injury claims this season. PPE log kept per chemical task.",
  },
  {
    id: "cmp6",
    requirement: "Annual leave",
    details: "21 days/year for permanent employees",
    tracking: "Tracked, alerts the farmer",
    status: "Met",
    note: "Lucy: 3 of 21 used. Esther: leave will count as maternity.",
  },
  {
    id: "cmp7",
    requirement: "Sick leave",
    details: "7 days with pay, 7 without (first year)",
    tracking: "Tracked",
    status: "Met",
    note: "Grace's 23/10 half-day noted as sick (called in) — day 1 of 7.",
  },
  {
    id: "cmp8",
    requirement: "Maternity leave",
    details: "90 days (female permanent employees)",
    tracking: "Tracked",
    status: "Action needed",
    note: "Esther starts 01/11/2026 — 90 days, returns ~30/01/2027. Cover plan: rehire Ruth after 30/10 review.",
  },
  {
    id: "cmp9",
    requirement: "PPE provision",
    details: "Gloves, masks, overalls for chemical handling",
    tracking: "Checklist in task creation",
    status: "Warning",
    note: "2 of 12 chemical sprayer overalls worn thin — order raised 21/10 (Githunguri Agrovet).",
  },
  {
    id: "cmp10",
    requirement: "Child labour",
    details: "No worker under 18 for hazardous work",
    tracking: "Age verification at onboarding",
    status: "Met",
    note: "Joseph Muthoni is 17 (DOB 12/03/2009 — verified at onboarding): nursery and watering only, no spraying.",
  },
  {
    id: "cmp11",
    requirement: "Contract for seasonal",
    details: "Written contract if engagement > 1 month",
    tracking: "Template provided & filed",
    status: "Met",
    note: "Signed contracts on file: John, Samuel, David + the 2 new weeding hires.",
  },
  {
    id: "cmp12",
    requirement: "Payslip",
    details: "Written payslip must be provided",
    tracking: "Auto-generated PDF + SMS receipt",
    status: "Met",
    note: "Every M-Pesa batch sends a line-item SMS; PDF in Records → Payroll.",
  },
];

export const PPE_CHECKLIST = [
  { id: "ppe1", item: "Gloves (nitrile) — 12 pairs", ok: true },
  { id: "ppe2", item: "Masks (P2) — 12", ok: true },
  { id: "ppe3", item: "Chemical overalls — 12", ok: false },
  { id: "ppe4", item: "Closed boots — 10 of 12", ok: false },
  { id: "ppe5", item: "Eye protection for mixing — 6", ok: true },
  { id: "ppe6", item: "First-aid kit at spray point", ok: true },
];

/* ---------- 15.3.8 analytics ---------- */

export interface AnalyticRow {
  metric: string;
  thisMonth: string;
  lastMonth: string;
  change: string;
  changeGood: boolean | null;
  countyAvg: string;
}

export const ANALYTICS: AnalyticRow[] = [
  {
    metric: "Total workers",
    thisMonth: "6",
    lastMonth: "5",
    change: "+1",
    changeGood: true,
    countyAvg: "—",
  },
  {
    metric: "Total labour cost",
    thisMonth: "KES 38,500",
    lastMonth: "KES 32,000",
    change: "+20%",
    changeGood: null,
    countyAvg: "—",
  },
  {
    metric: "Cost per labour day",
    thisMonth: "KES 512",
    lastMonth: "KES 508",
    change: "+1%",
    changeGood: null,
    countyAvg: "KES 550",
  },
  {
    metric: "Revenue per labour day",
    thisMonth: "KES 6,905",
    lastMonth: "KES 5,200",
    change: "+33%",
    changeGood: true,
    countyAvg: "KES 4,500",
  },
  {
    metric: "Attendance rate",
    thisMonth: "93%",
    lastMonth: "90%",
    change: "+3pp",
    changeGood: true,
    countyAvg: "85%",
  },
  {
    metric: "Turnover rate",
    thisMonth: "8%",
    lastMonth: "0%",
    change: "+8pp",
    changeGood: false,
    countyAvg: "15%",
  },
  {
    metric: "Average task rating",
    thisMonth: "4.0★",
    lastMonth: "3.8★",
    change: "+0.2",
    changeGood: true,
    countyAvg: "3.5★",
  },
  {
    metric: "Overtime hours",
    thisMonth: "15",
    lastMonth: "8",
    change: "+88%",
    changeGood: null,
    countyAvg: "—",
  },
  {
    metric: "Advances outstanding",
    thisMonth: "KES 1,600",
    lastMonth: "KES 800",
    change: "+100%",
    changeGood: false,
    countyAvg: "—",
  },
];

export const COST_BREAKDOWN = [
  { label: "Weekly wage workers (4)", amount: 21400, pct: 56 },
  {
    label: "Permanent monthly (2, this month's share)",
    amount: 14300,
    pct: 37,
  },
  { label: "Casual & end-of-task (1)", amount: 2800, pct: 7 },
];

/* ---------- FAQ + glossary ---------- */

export const TEAM_FAQ = [
  {
    q: "What's the legal minimum I must pay?",
    a: "For unskilled agriculture the 2026 gazette sets KES 3,564/month. The common market rate for casual farm work in Kiambu is KES 450–550/day. GrowMO alerts you if any rate dips below the floor.",
  },
  {
    q: "Do casual workers get NSSF and NHIF?",
    a: "No — NSSF (6% + 6%) and the NHIF/SHA sliding scale apply to permanent employees. Casual and seasonal workers still get the written payslip, overtime at 1.5×, and leave rules pro-rated by contract.",
  },
  {
    q: "Can I deduct an advance from pay?",
    a: "Yes, if you agree a repayment plan with the worker — the advance record stores the plan and every weekly deduction, and the payslip shows it as a named line, never a mystery number.",
  },
  {
    q: "What happens if a worker is injured on the farm?",
    a: "For registered employees, work-injury benefit runs through NHIF/SHA. Record the incident in the worker's file, keep the PPE log for that task, and call the 0800 line — the desk walks you through the claim within 24 hours.",
  },
  {
    q: "How does the SMS check-in work for workers without phones?",
    a: "They dial *384*3*1# from any handset — USSD, no data, no app. The confirmation lands in the attendance register with a timestamp. 'IN' to 20550 does the same by SMS.",
  },
  {
    q: "Esther is due in November. What happens to her job?",
    a: "Maternity leave is 90 days for permanent employees (Labour Act). Her file already tracks start 01/11 and return ~30/01, her NSSF/NHIF stays active, and the cover plan (re-hire after the 30/10 review) is noted in Compliance.",
  },
  {
    q: "Is Joseph (the student) allowed to work?",
    a: "He's 17 (DOB 12/03/2009) — verified at onboarding with his ID. Under-18s may not do hazardous work, so his tasks are nursery and watering only, and the directory flags it automatically. No spraying, no heavy loads.",
  },
  {
    q: "Do I need a written contract for a 2-week casual?",
    a: "No — the written-contract rule kicks in above one month. The 2-week weeding hire gets the rate, dates and safety terms in writing via the onboarding checklist instead.",
  },
];

export const TEAM_GLOSSARY = [
  {
    term: "Piece rate",
    def: "Pay per unit of output — KES 2/cabbage head, KES 500/acre sprayed.",
  },
  {
    term: "Overtime (1.5×)",
    def: "Hours beyond the agreed day paid at a 1.5× multiplier of the hourly rate.",
  },
  {
    term: "NSSF",
    def: "National Social Security Fund — 6% employee + 6% employer, permanent staff only.",
  },
  {
    term: "NHIF / SHA",
    def: "Health insurance sliding scale (KES 170–1,700); covers work-injury benefit.",
  },
  {
    term: "Housing levy",
    def: "1.5% of gross pay, deducted at source (2024+).",
  },
  {
    term: "Payroll week",
    def: "Your cycle: Oct 20 – 26, payday Friday Oct 23, 2026.",
  },
  {
    term: "Advance",
    def: "Money paid early, repaid by named weekly deductions — always itemised on the payslip.",
  },
  {
    term: "PPE",
    def: "Personal protective equipment — gloves, masks, overalls for chemical work. Employer-provided by law.",
  },
];

export const TEAM_ALERTS = [
  {
    id: "ta1",
    tone: "warn" as const,
    text: "Esther's maternity leave starts 01/11 (90 days). Cover plan: re-hire after the 30/10 review.",
  },
  {
    id: "ta2",
    tone: "warn" as const,
    text: "2 chemical overalls worn thin — PPE order raised 21/10. Spraying continues with the spare pair.",
  },
  {
    id: "ta3",
    tone: "success" as const,
    text: "Payroll week Oct 20–26 ready to run: 4 workers, KES 9,312.50 total. Payday is today, Friday.",
  },
];
