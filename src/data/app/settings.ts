/* ============================================================================
   PAGE 15 — SETTINGS, TEAM & PERMISSIONS  (/app/settings)  data layer

   Blueprint sections
   15.1 Profile settings      15.2 Farm settings
   15.3 Team management (roles, permission matrix, HR: directory, recruitment,
        attendance, performance, payroll, advances/deductions, compliance,
        labour analytics)
   15.4 Notification preferences   15.5 Data & privacy   15.6 Subscription plans
   ========================================================================== */

export const SETTINGS_CONTEXT = {
  farmer: "Mary Wanjiku",
  role: "Owner",
  farmName: "Mary's Farm",
  idNumber: "12345678",
  email: "mary@growmo.app",
  phone: "0712 345 678",
  language: "English + Kiswahili",
  currency: "KES — Kenya Shilling",
  timezone: "EAT (UTC+3)",
  county: "Kiambu",
  subCounty: "Githunguri",
  ward: "Ikinu",
  plan: "premium",
  planPrice: 299,
  members: 6,
  plots: 6,
  acres: 2.5,
  lastLogin: "22 Sep 2026 · 09:14 · Nairobi",
  nextReview: "1 Nov 2026",
  pinLast4: "26",
  twoFactor: true,
  biometric: true,
  onboardingComplete: 92,
};

/* ---------- 15.1 profile fields (mirrors onboarding, now editable) ---------- */
export const PROFILE_FIELDS = [
  { k: "Full name", v: "Mary Wanjiku", group: "Identity" },
  { k: "National ID", v: "12••••78", group: "Identity" },
  { k: "Phone (M-Pesa)", v: "0712 345 678", group: "Identity" },
  { k: "Email", v: "mary@growmo.app", group: "Identity" },
  { k: "Date of birth", v: "15 Mar 1990", group: "Identity" },
  { k: "Gender", v: "Female", group: "Identity" },
  { k: "Preferred language", v: "English + Kiswahili", group: "Preferences" },
  { k: "Currency", v: "KES — Kenya Shilling", group: "Preferences" },
  { k: "Timezone", v: "EAT (UTC+3)", group: "Preferences" },
  { k: "Units", v: "Acres · heads · 90kg bags", group: "Preferences" },
  { k: "County", v: "Kiambu", group: "Location" },
  { k: "Sub-county", v: "Githunguri", group: "Location" },
  { k: "Ward", v: "Ikinu", group: "Location" },
  { k: "Farm size", v: "2.5 acres (6 plots)", group: "Location" },
  { k: "Two-factor login", v: "On · SMS to 0712 345 678", group: "Security" },
  { k: "Biometric unlock", v: "On · Infinix Hot 40", group: "Security" },
  { k: "Wallet PIN", v: "Set · last changed 12 Aug 2026", group: "Security" },
];

/* ---------- 15.2 farm settings ---------- */
export interface FarmPlot {
  id: string;
  name: string;
  icon: string;
  size: string;
  location: string;
  crop: string;
  soil: string;
  ph: number;
  planted: string;
  harvest: string;
  status: "Active" | "Fallow" | "Preparing";
}

export const FARM_PLOTS: FarmPlot[] = [
  { id: "p1", name: "Plot 1 — Lower kikuyu grass", icon: "🥬", size: "0.5 ac", location: "Ikinu, near the river", crop: "Cabbage (Gloria F1)", soil: "Clay loam", ph: 5.8, planted: "1 Sep 2026", harvest: "30 Nov 2026", status: "Active" },
  { id: "p2", name: "Plot 2 — Greenhouse belt", icon: "🍅", size: "0.5 ac", location: "Beside the packhouse", crop: "Tomato (Roma VF)", soil: "Clay loam", ph: 6.2, planted: "11 Sep 2026", harvest: "9 Jan 2027", status: "Active" },
  { id: "p3", name: "Plot 3 — Upper terrace", icon: "🥬", size: "0.4 ac", location: "Above the water tank", crop: "Kale (Thousand Head)", soil: "Loam", ph: 6.1, planted: "20 Aug 2026", harvest: "15 Dec 2026", status: "Active" },
  { id: "p4", name: "Plot 4 — Sandy strip", icon: "🥔", size: "0.3 ac", location: "Next to Kamau's boundary", crop: "Potato (Shangi)", soil: "Sandy clay loam", ph: 5.5, planted: "5 Sep 2026", harvest: "20 Dec 2026", status: "Active" },
  { id: "p5", name: "Plot 5 — Old maize field", icon: "🌽", size: "0.3 ac", location: "Top of the farm", crop: "Maize (H6213)", soil: "Clay loam", ph: 5.2, planted: "18 Sep 2026", harvest: "24 Feb 2027", status: "Active" },
  { id: "p6", name: "Plot 6 — Kitchen garden", icon: "🥬", size: "0.1 ac", location: "Behind the house", crop: "Spinach & managu", soil: "Loam", ph: 6.4, planted: "1 Sep 2026", harvest: "Rolling harvest", status: "Active" },
];

export const FARM_DEFAULTS = [
  { k: "Farm name", v: "Mary's Farm" },
  { k: "Season in progress", v: "SR 2026 (short rains) · LR 2027 next" },
  { k: "Rain gauge", v: "Manual, read each morning at 7am" },
  { k: "Irrigation", v: "Drip on Plot 2, furrow elsewhere" },
  { k: "Soil tests on file", v: "2 (Apr 2026, Aug 2026)" },
  { k: "Default labour rate", v: "KES 500 per day · piece rates per crop" },
  { k: "Record retention", v: "Keep all seasons" },
  { k: "Measurement units", v: "Acres, heads, 90kg bags, crates" },
];

/* ---------- 15.3 team ---------- */
export type RoleKey = "owner" | "manager" | "agronomist" | "accountant" | "worker" | "viewer";

export const ROLES: { key: RoleKey; label: string; desc: string }[] = [
  { key: "owner", label: "Owner", desc: "Full control, billing and team management" },
  { key: "manager", label: "Farm manager", desc: "Runs day-to-day work, initiates but cannot approve money" },
  { key: "agronomist", label: "Agronomist", desc: "Crop, input and spray advice; no money access" },
  { key: "accountant", label: "Accountant", desc: "Full finance, wallet visibility and payout initiation" },
  { key: "worker", label: "Worker", desc: "Sees only the tasks assigned to them" },
  { key: "viewer", label: "Viewer", desc: "Read-only across the farm for partners or extension staff" },
];

export type CellValue = "y" | "l" | "n";

export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: RoleKey;
  avatar: string;
  status: "Active" | "Invited" | "Suspended";
  joined: string;
  lastLogin: string;
  mfa: boolean;
  plots: string;
  crops: string;
  financial: "Full" | "View only" | "None";
  paymentAuthority: "Initiate" | "Approve" | "None";
  validFrom: string;
  validUntil: string;
  tasksThisMonth: number;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "tm1", name: "Mary Wanjiku", phone: "0712 345 678", email: "mary@growmo.app", role: "owner", avatar: "MW", status: "Active", joined: "1 Mar 2026", lastLogin: "Just now", mfa: true, plots: "All", crops: "All", financial: "Full", paymentAuthority: "Approve", validFrom: "1 Mar 2026", validUntil: "Indefinite", tasksThisMonth: 4 },
  { id: "tm2", name: "Peter Kamau", phone: "0723 456 789", email: "peter.kamau@example.co.ke", role: "manager", avatar: "PK", status: "Active", joined: "15 Sep 2026", lastLogin: "2 hours ago", mfa: true, plots: "All", crops: "All", financial: "View only", paymentAuthority: "Initiate", validFrom: "1 Oct 2026", validUntil: "Indefinite", tasksThisMonth: 12 },
  { id: "tm3", name: "Grace Wanjiru", phone: "0734 567 890", email: "grace@growmo.app", role: "accountant", avatar: "GW", status: "Active", joined: "1 Oct 2026", lastLogin: "Yesterday", mfa: true, plots: "All", crops: "All", financial: "Full", paymentAuthority: "Initiate", validFrom: "1 Oct 2026", validUntil: "31 Dec 2027", tasksThisMonth: 0 },
  { id: "tm4", name: "Samuel Njoroge", phone: "0745 678 901", email: "sam.njoroge@example.co.ke", role: "agronomist", avatar: "SN", status: "Active", joined: "28 Aug 2026", lastLogin: "3 days ago", mfa: false, plots: "Plots 1, 2", crops: "Cabbage, Tomato", financial: "None", paymentAuthority: "None", validFrom: "1 Sep 2026", validUntil: "31 Aug 2027", tasksThisMonth: 24 },
  { id: "tm5", name: "John Mwangi", phone: "0712 555 123", email: "—", role: "worker", avatar: "JM", status: "Active", joined: "1 Jun 2025", lastLogin: "Today, 06:41", mfa: false, plots: "Assigned only", crops: "Assigned only", financial: "None", paymentAuthority: "None", validFrom: "1 Mar 2026", validUntil: "28 Feb 2027", tasksThisMonth: 22 },
  { id: "tm6", name: "Agnes Nekesa", phone: "0755 666 777", email: "agnes.kiambu.extension@example.go.ke", role: "viewer", avatar: "AN", status: "Invited", joined: "Pending", lastLogin: "—", mfa: false, plots: "All", crops: "All", financial: "View only", paymentAuthority: "None", validFrom: "1 Nov 2026", validUntil: "31 Jan 2027", tasksThisMonth: 0 },
];

export const PERM_MATRIX: { feature: string; cells: Record<RoleKey, CellValue> }[] = [
  { feature: "Dashboard", cells: { owner: "y", manager: "y", agronomist: "y", accountant: "y", worker: "l", viewer: "y" } },
  { feature: "Crop management", cells: { owner: "y", manager: "y", agronomist: "y", accountant: "l", worker: "n", viewer: "l" } },
  { feature: "Input management", cells: { owner: "y", manager: "y", agronomist: "l", accountant: "l", worker: "n", viewer: "l" } },
  { feature: "Labour scheduling", cells: { owner: "y", manager: "y", agronomist: "l", accountant: "l", worker: "l", viewer: "l" } },
  { feature: "Labour payment", cells: { owner: "y", manager: "l", agronomist: "n", accountant: "y", worker: "n", viewer: "n" } },
  { feature: "Financial management", cells: { owner: "y", manager: "l", agronomist: "n", accountant: "y", worker: "n", viewer: "n" } },
  { feature: "Wallet", cells: { owner: "y", manager: "l", agronomist: "n", accountant: "l", worker: "n", viewer: "n" } },
  { feature: "Pay workers", cells: { owner: "y", manager: "l", agronomist: "n", accountant: "l", worker: "n", viewer: "n" } },
  { feature: "Market & sales", cells: { owner: "y", manager: "y", agronomist: "n", accountant: "y", worker: "n", viewer: "l" } },
  { feature: "Analytics", cells: { owner: "y", manager: "y", agronomist: "l", accountant: "y", worker: "n", viewer: "l" } },
  { feature: "Records & compliance", cells: { owner: "y", manager: "y", agronomist: "y", accountant: "y", worker: "n", viewer: "l" } },
  { feature: "Settings", cells: { owner: "y", manager: "n", agronomist: "n", accountant: "n", worker: "n", viewer: "n" } },
  { feature: "Add / remove team", cells: { owner: "y", manager: "n", agronomist: "n", accountant: "n", worker: "n", viewer: "n" } },
];

export const PERM_MATRIX_KEYS: RoleKey[] = ["owner", "manager", "agronomist", "accountant", "worker", "viewer"];

export const CELL_LABEL: Record<CellValue, string> = { y: "✓", l: "◐", n: "—" };

/* ---------- 15.3 HR: worker directory ---------- */
export interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  mpesaName: string;
  nin: string;
  village: string;
  distance: string;
  employment: "Permanent" | "Seasonal" | "Casual" | "Contract";
  joined: string;
  contractEnd: string;
  skills: string[];
  dailyRate: number;
  pieceRate: string;
  payment: string;
  nssf: string;
  nhif: string;
  nextOfKin: string;
  rating: number;
  earnedAllTime: number;
  earnedSeason: number;
  tasks: number;
  attendance: number;
  status: "Active" | "Inactive" | "Suspended";
  note: string;
}

export const WORKERS: Worker[] = [
  { id: "W-001", name: "John Mwangi Kamau", role: "Harvester & foreman", phone: "0712 555 123", mpesaName: "John Mwangi", nin: "12••••78", village: "Githunguri, Kiambu", distance: "2.5 km", employment: "Seasonal", joined: "1 Jun 2025", contractEnd: "28 Feb 2027", skills: ["Weeding", "Transplanting", "Harvesting", "Packing"], dailyRate: 500, pieceRate: "Cabbage harvest KES 2/head", payment: "GrowMO wallet", nssf: "NSSF-123456", nhif: "NHIF-789012", nextOfKin: "Mary Wanjiku, spouse, 0711 555 444", rating: 4.2, earnedAllTime: 145000, earnedSeason: 38500, tasks: 87, attendance: 94, status: "Active", note: "Reliable. Excellent transplanting technique, minimal seedling damage. Comes early." },
  { id: "W-002", name: "Peter Kamau", role: "Weeding crew", phone: "0723 456 789", mpesaName: "Peter Kamau", nin: "23••••89", village: "Ikinu, Kiambu", distance: "1.2 km", employment: "Casual", joined: "12 Jul 2026", contractEnd: "—", skills: ["Weeding", "Spraying"], dailyRate: 500, pieceRate: "Weeding KES 1,500/acre", payment: "M-Pesa manual", nssf: "—", nhif: "NHIF-556677", nextOfKin: "Jane Kamau, sister, 0722 999 888", rating: 3.6, earnedAllTime: 42000, earnedSeason: 21000, tasks: 31, attendance: 87, status: "Active", note: "25 min late twice this month; faster than average on weeding." },
  { id: "W-003", name: "Grace Wanjiku", role: "Sprayer (PCPB certified)", phone: "0733 666 777", mpesaName: "Grace Wanjiku", nin: "34••••90", village: "Githunguri, Kiambu", distance: "3.0 km", employment: "Seasonal", joined: "3 Aug 2026", contractEnd: "28 Feb 2027", skills: ["Spraying", "Scouting", "Harvesting"], dailyRate: 500, pieceRate: "Spraying bonus KES 500/round", payment: "GrowMO wallet", nssf: "NSSF-334455", nhif: "NHIF-112233", nextOfKin: "David Njenga, brother, 0733 111 222", rating: 4.8, earnedAllTime: 38500, earnedSeason: 24500, tasks: 42, attendance: 91, status: "Active", note: "Holds PCPB safe-use certificate. Owns a calibrated knapsack sprayer." },
  { id: "W-004", name: "Samuel Njoroge", role: "Irrigation & tractor", phone: "0745 678 901", mpesaName: "Samuel Njoroge", nin: "45••••01", village: "Gathiru, Kiambu", distance: "5.4 km", employment: "Contract", joined: "10 Jun 2026", contractEnd: "31 Dec 2026", skills: ["Irrigation", "Tractor", "Fencing"], dailyRate: 650, pieceRate: "Irrigation repair KES 800/visit", payment: "Bank transfer", nssf: "NSSF-445566", nhif: "NHIF-778899", nextOfKin: "Esther Njoroge, spouse, 0745 222 333", rating: 4.4, earnedAllTime: 61000, earnedSeason: 29800, tasks: 26, attendance: 100, status: "Active", note: "Handles the drip lines on Plot 2 and the pump. Never misses a scheduled day." },
  { id: "W-005", name: "Joseph Muthoni", role: "General labour", phone: "0756 789 012", mpesaName: "Joseph Muthoni", nin: "56••••12", village: "Ikinu, Kiambu", distance: "0.8 km", employment: "Casual", joined: "20 Aug 2026", contractEnd: "—", skills: ["Weeding", "Loading", "Manure"], dailyRate: 450, pieceRate: "Manure spreading KES 1,200/acre", payment: "Cash", nssf: "—", nhif: "—", nextOfKin: "Alice Muthoni, mother, 0756 333 444", rating: 3.8, earnedAllTime: 21000, earnedSeason: 12600, tasks: 18, attendance: 89, status: "Active", note: "Left early once with permission. Good with heavy loads." },
  { id: "W-006", name: "Alice Wambui", role: "Packhouse & grading", phone: "0798 901 234", mpesaName: "Alice Wambui", nin: "67••••23", village: "Githunguri, Kiambu", distance: "2.1 km", employment: "Seasonal", joined: "5 Sep 2026", contractEnd: "30 Apr 2027", skills: ["Grading", "Packing", "Records"], dailyRate: 520, pieceRate: "Packing KES 12/crate", payment: "GrowMO wallet", nssf: "NSSF-556677", nhif: "NHIF-990011", nextOfKin: "Peter Wambui, brother, 0798 444 555", rating: 4.6, earnedAllTime: 18000, earnedSeason: 18000, tasks: 21, attendance: 96, status: "Active", note: "Keeps the packhouse tally sheets accurate; good with buyers at collection." },
];

/* ---------- 15.3 recruitment & onboarding ---------- */
export const JOB_POST = {
  title: "Casual farm worker — vegetable weeding",
  skills: "Weeding, able to work outdoors",
  duration: "2 weeks (20 Oct – 3 Nov 2026)",
  rate: "KES 500 per day, paid weekly via M-Pesa",
  workers: 4,
  location: "Githunguri, Kiambu",
  accommodation: "Not provided",
  meals: "Lunch provided on site",
  requirements: "Own jembe preferred, no under-18s",
  apply: "Call 0712 345 678 or report to the farm gate at 7am",
};

export const JOB_CHANNELS = [
  { channel: "GrowMO community job board (page 13)", reach: "1,240 growers in Kiambu", status: "Posted 21 Oct" },
  { channel: "WhatsApp group — Githunguri growers", reach: "86 members", status: "Shared 21 Oct" },
  { channel: "SMS to registered workers within 10 km", reach: "47 workers", status: "Sent 21 Oct" },
  { channel: "Chief's office notice board, Ikinu", reach: "Walk-ins", status: "Notice pinned 22 Oct" },
];

export const ONBOARDING_CHECKLIST = [
  { step: "Collect ID copy (photo)", owner: "Mary" },
  { step: "Record phone and M-Pesa name", owner: "Mary" },
  { step: "Verify M-Pesa name matches the ID", owner: "Mary" },
  { step: "Explain payment terms and the rate", owner: "Peter" },
  { step: "Safety briefing — tools, chemicals, PPE", owner: "Grace" },
  { step: "Show farm boundaries, toilets, water point", owner: "Peter" },
  { step: "Add to the worker directory in GrowMO", owner: "Mary" },
  { step: "Assign the first task and a buddy", owner: "Peter" },
];

/* ---------- 15.3 attendance ---------- */
export const ATTENDANCE_METHODS = [
  { method: "Farmer marks manually", how: "Tick present / absent per worker per task", best: "Teams under 10", adoption: "62%" },
  { method: "Worker SMS check-in", how: 'Worker sends "IN" to 20550 → timestamped', best: "Larger teams, no smartphones", adoption: "18%" },
  { method: "Worker USSD check-in", how: "Dial *384*3*1# → confirmed with a code", best: "Kabambe phones", adoption: "9%" },
  { method: "Geofenced check-in", how: "App detects GPS inside the plot polygon", best: "Smartphone crews", adoption: "11%" },
  { method: "Biometric at the gate (future)", how: "Fingerprint scanner at the packhouse", best: "Commercial farms", adoption: "0%" },
];

export const ATTENDANCE_TODAY = [
  { worker: "John Mwangi", checkIn: "07:45", checkOut: "17:15", hours: 9.5, status: "Present", task: "Weeding Plot 1", note: "—" },
  { worker: "Peter Kamau", checkIn: "08:10", checkOut: "17:00", hours: 8.8, status: "Present", task: "Weeding Plot 1", note: "25 min late" },
  { worker: "Grace Wanjiku", checkIn: "—", checkOut: "—", hours: 0, status: "Absent", task: "—", note: "Called in sick, will spray tomorrow" },
  { worker: "Samuel Njoroge", checkIn: "07:50", checkOut: "17:05", hours: 9.25, status: "Present", task: "Spraying Plot 2", note: "—" },
  { worker: "Joseph Muthoni", checkIn: "08:30", checkOut: "12:00", hours: 3.5, status: "Half day", task: "Weeding Plot 1", note: "Left early, permission granted" },
];

export const ATTENDANCE_MONTH = [
  { worker: "John Mwangi", present: 22, absent: 1, late: 0, half: 0, pct: 96, overtime: 5 },
  { worker: "Peter Kamau", present: 20, absent: 2, late: 4, half: 1, pct: 87, overtime: 0 },
  { worker: "Grace Wanjiku", present: 21, absent: 2, late: 1, half: 0, pct: 91, overtime: 2 },
  { worker: "Samuel Njoroge", present: 23, absent: 0, late: 0, half: 0, pct: 100, overtime: 8 },
  { worker: "Alice Wambui", present: 22, absent: 1, late: 0, half: 0, pct: 96, overtime: 3 },
];

/* ---------- 15.3 performance ---------- */
export const PERFORMANCE_RATINGS = [
  { stars: "5 — Excellent", desc: "Exceeded expectations, no rework needed", emoji: "⭐⭐⭐⭐⭐" },
  { stars: "4 — Good", desc: "Met expectations, minor issues", emoji: "⭐⭐⭐⭐" },
  { stars: "3 — Satisfactory", desc: "Done adequately, some rework", emoji: "⭐⭐⭐" },
  { stars: "2 — Below average", desc: "Significant rework needed", emoji: "⭐⭐" },
  { stars: "1 — Poor", desc: "Unacceptable, must redo", emoji: "⭐" },
];

export const PERFORMANCE_CARD = {
  worker: "John Mwangi",
  totalTasks: 87,
  average: 4.2,
  breakdown: [
    { stars: "5★", count: 35, pct: 40 },
    { stars: "4★", count: 38, pct: 44 },
    { stars: "3★", count: 12, pct: 14 },
    { stars: "2★", count: 2, pct: 2 },
    { stars: "1★", count: 0, pct: 0 },
  ],
  rework: "5 tasks (6%)",
  absentWithoutNotice: 0,
  lateArrivals: 3,
  speed: "+15% faster than crew average",
  quality: "+8% fewer reworks",
  strength: "Excellent transplanting technique, minimal seedling damage",
  improve: "Sometimes rushes weeding and misses roots near the crop base",
  history: [
    { month: "Apr", rating: 3.6, tasks: 6 },
    { month: "May", rating: 3.8, tasks: 8 },
    { month: "Jun", rating: 4.0, tasks: 9 },
    { month: "Jul", rating: 3.9, tasks: 7 },
    { month: "Aug", rating: 4.1, tasks: 10 },
    { month: "Sep", rating: 4.3, tasks: 11 },
    { month: "Oct", rating: 4.2, tasks: 12 },
  ],
  farmAverage: 4.0,
};

/* ---------- 15.3 payroll ---------- */
export const PAYROLL_CYCLE = "Weekly · Friday 5 PM · M-Pesa B2C to the worker's own number";

export const PAYSLIPS = [
  { worker: "John Mwangi", days: 5, rate: 500, basic: 2500, otHours: 2, otRate: 93.75, otPay: 187.5, piece: 0, absence: 0, advance: -1000, net: 1687.5, phone: "0712 555 123", status: "Pending", receipt: "" },
  { worker: "Peter Kamau", days: 4.5, rate: 500, basic: 2250, otHours: 0, otRate: 93.75, otPay: 0, piece: 0, absence: -500, advance: 0, net: 1750, phone: "0723 456 789", status: "Pending", receipt: "" },
  { worker: "Grace Wanjiku", days: 5, rate: 500, basic: 2500, otHours: 1, otRate: 93.75, otPay: 93.75, piece: 0, absence: 0, advance: 0, net: 2593.75, phone: "0733 666 777", status: "Pending", receipt: "" },
  { worker: "Samuel Njoroge", days: 5, rate: 500, basic: 2500, otHours: 3, otRate: 93.75, otPay: 281.25, piece: 500, absence: 0, advance: 0, net: 3281.25, phone: "0745 678 901", status: "Pending", receipt: "" },
  { worker: "Joseph Muthoni", days: 3.5, rate: 450, basic: 1575, otHours: 0, otRate: 84.38, otPay: 0, piece: 0, absence: 0, advance: 0, net: 1575, phone: "0756 789 012", status: "Pending", receipt: "" },
  { worker: "Alice Wambui", days: 5, rate: 520, basic: 2600, otHours: 2, otRate: 97.5, otPay: 195, piece: 240, absence: 0, advance: 0, net: 3035, phone: "0798 901 234", status: "Pending", receipt: "" },
];

export const ADVANCES = [
  { id: "ADV-001", worker: "John Mwangi", type: "Advance", amount: 1000, date: "20 Oct 2026", reason: "School fees", plan: "Deduct KES 200/week for 5 weeks", status: "Repaying · KES 600 remaining" },
  { id: "ADV-002", worker: "Grace Wanjiku", type: "Advance", amount: 2000, date: "15 Oct 2026", reason: "Medical", plan: "Deduct KES 500/week for 4 weeks", status: "Repaying · KES 1,000 remaining" },
  { id: "DED-001", worker: "Peter Kamau", type: "Deduction", amount: -500, date: "24 Oct 2026", reason: "Absent without notice (1 day)", plan: "Applied this payroll", status: "Deducted" },
  { id: "DED-002", worker: "Samuel Njoroge", type: "Deduction", amount: -300, date: "22 Oct 2026", reason: "Broke a sprayer nozzle", plan: "One-off", status: "Deducted" },
];

/* ---------- 15.3 compliance ---------- */
export const COMPLIANCE_ITEMS = [
  { requirement: "Agricultural minimum wage", detail: "KES 3,564/month for unskilled labour (2026 gazette); KES 500+/day is the common market rate in Kiambu", tracking: "Alert fires if a rate is set below the gazetted floor", tone: "good" as const },
  { requirement: "NSSF contribution", detail: "6% employee + 6% employer of gross pay for permanent staff", tracking: "Auto-calculated on every payslip", tone: "good" as const },
  { requirement: "NHIF / SHIF contribution", detail: "KES 170–1,700 per month sliding scale", tracking: "Auto-calculated, filed with the monthly return", tone: "good" as const },
  { requirement: "Housing levy", detail: "1.5% of gross pay (2024 Finance Act)", tracking: "Auto-calculated for permanent staff", tone: "good" as const },
  { requirement: "WIBA work-injury cover", detail: "Insurance for registered employees", tracking: "Policy expires 14 Mar 2027", tone: "info" as const },
  { requirement: "Annual leave", detail: "21 days per year for permanent employees", tracking: "Tracker alerts you 30 days before the balance expires", tone: "good" as const },
  { requirement: "Sick leave", detail: "7 days paid and 7 unpaid in the first year", tracking: "Logged against the attendance register", tone: "good" as const },
  { requirement: "Maternity leave", detail: "90 days for female permanent employees", tracking: "Tracked, with cover planning", tone: "info" as const },
  { requirement: "PPE provision", detail: "Gloves, masks and overalls for anyone handling chemicals", tracking: "Checklist appears on every spray task", tone: "good" as const },
  { requirement: "Child labour", detail: "Nobody under 18 in hazardous work", tracking: "Age verified at onboarding, ID photo stored", tone: "good" as const },
  { requirement: "Written contract for seasonal work", detail: "Required for engagements over one month", tracking: "Template generated and signed in-app", tone: "good" as const },
  { requirement: "Payslip", detail: "A written payslip must be issued", tracking: "PDF payslip is sent by SMS + WhatsApp on payday", tone: "good" as const },
];

export const LABOUR_ANALYTICS = [
  { metric: "Total workers", now: "6", before: "5", change: "+1", county: "—" },
  { metric: "Total labour cost", now: "KES 38,500", before: "KES 32,000", change: "+20%", county: "—" },
  { metric: "Cost per labour day", now: "KES 512", before: "KES 508", change: "+1%", county: "KES 550" },
  { metric: "Revenue per labour day", now: "KES 6,905", before: "KES 5,200", change: "+33%", county: "KES 4,500" },
  { metric: "Attendance rate", now: "93%", before: "90%", change: "+3 pp", county: "85%" },
  { metric: "Turnover rate", now: "8%", before: "0%", change: "+8 pp", county: "15%" },
  { metric: "Average task rating", now: "4.0★", before: "3.8★", change: "+0.2", county: "3.5★" },
  { metric: "Overtime hours", now: "15", before: "8", change: "+88%", county: "—" },
  { metric: "Advance balance outstanding", now: "KES 1,600", before: "KES 800", change: "+100%", county: "—" },
];

/* ---------- 15.4 notifications ---------- */
export type NotifChannelKey = "push" | "sms" | "wa" | "email";

export const NOTIF_CHANNELS: { key: NotifChannelKey; label: string; cost: string }[] = [
  { key: "push", label: "Push", cost: "Free · instant" },
  { key: "sms", label: "SMS", cost: "KES 0.80 each" },
  { key: "wa", label: "WhatsApp", cost: "Free · data only" },
  { key: "email", label: "Email", cost: "Free" },
];

export const NOTIF_PREFS: {
  id: string;
  label: string;
  desc: string;
  channels: Record<NotifChannelKey, boolean>;
}[] = [
  { id: "n1", label: "Task reminders", desc: "Morning list plus a nudge before each block", channels: { push: true, sms: true, wa: false, email: false } },
  { id: "n2", label: "Weather alerts", desc: "Rain, wind and spray-window warnings", channels: { push: true, sms: true, wa: true, email: false } },
  { id: "n3", label: "Payment confirmations", desc: "Every send, deposit and payout receipt", channels: { push: true, sms: true, wa: false, email: true } },
  { id: "n4", label: "Market price changes", desc: "Only when a crop moves more than 10%", channels: { push: false, sms: false, wa: true, email: false } },
  { id: "n5", label: "AI advisor tips", desc: "Scouting prompts and treatment reminders", channels: { push: true, sms: false, wa: true, email: false } },
  { id: "n6", label: "Extreme weather warnings", desc: "Storms, floods and frost — always on", channels: { push: true, sms: true, wa: true, email: true } },
  { id: "n7", label: "Weekly summary", desc: "What was spent, spent on and harvested", channels: { push: false, sms: false, wa: true, email: true } },
  { id: "n8", label: "Monthly report", desc: "Analytics pack in PDF", channels: { push: false, sms: false, wa: false, email: true } },
  { id: "n9", label: "Loan and grant opportunities", desc: "Matched to your season and county", channels: { push: false, sms: true, wa: false, email: true } },
  { id: "n10", label: "Team activity", desc: "When a manager records a task or a spray", channels: { push: true, sms: false, wa: false, email: false } },
];

/* ---------- 15.5 data & privacy ---------- */
export const DATA_SETTINGS = [
  { id: "d1", label: "Share data with county extension officers", desc: "Kiambu extension sees soil tests and spray records so the advice you get is informed", action: "Review sharing", tone: "info" as const },
  { id: "d2", label: "Share anonymised data for benchmarks", desc: "Feeds the 'compare with your county' charts; no names, phones or farm locations leave the farm", action: "See what is shared", tone: "info" as const },
  { id: "d3", label: "Share traceability data with buyers", desc: "Buyers you pick can scan a batch QR and see plot, spray history and harvest date", action: "Choose buyers", tone: "info" as const },
  { id: "d4", label: "Data retention", desc: "Keep everything, auto-delete after 3 years, or set a custom window", action: "Change retention", tone: "info" as const },
  { id: "d5", label: "Export all data", desc: "Download a ZIP of CSV files plus photos — records, money, labour and market", action: "Prepare export", tone: "good" as const },
  { id: "d6", label: "Delete account", desc: "Full deletion after a 30-day grace period; wallet funds must be withdrawn first", action: "Start deletion", tone: "warn" as const },
];

export const DATA_SHARING_DETAIL = [
  { k: "Bulk data location", v: "Nairobi DC · Kenya (no cross-border transfer)" },
  { k: "Encryption", v: "TLS 1.3 in transit, AES-256 at rest" },
  { k: "Backups", v: "Nightly, 30-day retention, encrypted" },
  { k: "Who can see my data", v: "You, your team by role, and only the officers or buyers you enable" },
  { k: "Benchmark pool", v: "De-identified and opt-in; you can leave at any time" },
  { k: "Marketing", v: "GrowMO never sells farmer data or lists your phone" },
];

/* ---------- 15.6 subscription ---------- */
export interface Plan {
  id: string;
  name: string;
  icon: string;
  desc: string;
  price: number;
  billing: string;
  features: string[];
  limits: { crops: string; plots: string; ai: string; weather: string; markets: string; analytics: string; reports: string; team: string; agronomist: string; autopay: boolean; api: boolean; support: boolean; whiteLabel: boolean };
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    icon: "🌱",
    desc: "Everything a smallholder needs to start recording.",
    price: 0,
    billing: "forever",
    features: ["2 crops managed", "2 plots", "5 AI chats a month", "3-day weather forecast", "1 market price", "Basic analytics", "2 reports a month", "1 team member (you)"],
    limits: { crops: "2", plots: "2", ai: "5 / month", weather: "3-day", markets: "1 market", analytics: "Basic", reports: "2 / month", team: "1 (self)", agronomist: "—", autopay: false, api: false, support: false, whiteLabel: false },
  },
  {
    id: "premium",
    name: "Premium",
    icon: "🥬",
    desc: "The working farm plan — pricing, payroll and season analytics.",
    price: 299,
    billing: "per month · pay by M-Pesa",
    features: ["Unlimited crops", "10 plots", "50 AI chats a month", "7-day + seasonal weather", "5 market prices", "Advanced analytics", "Unlimited reports", "3 team members", "2 agronomist chats a month", "Auto-pay", "Priority support"],
    limits: { crops: "Unlimited", plots: "10", ai: "50 / month", weather: "7-day + seasonal", markets: "5 markets", analytics: "Advanced", reports: "Unlimited", team: "3", agronomist: "2 / month", autopay: true, api: false, support: true, whiteLabel: false },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: "🏆",
    desc: "For commercial farms, co-ops and outgrower schemes.",
    price: 999,
    billing: "per month · invoice available",
    features: ["Unlimited crops and plots", "Unlimited AI chats", "Custom weather alerts", "All markets", "Custom analytics with your branding", "Unlimited reports", "10 team members", "10 agronomist chats a month", "Auto-pay", "API access", "White-label buyer portals", "Dedicated support"],
    limits: { crops: "Unlimited", plots: "Unlimited", ai: "Unlimited", weather: "7-day + seasonal + custom", markets: "All markets", analytics: "Advanced + custom", reports: "Unlimited + branded", team: "10", agronomist: "10 / month", autopay: true, api: true, support: true, whiteLabel: true },
  },
];

export const PLAN_COMPARISON_ROWS: { feature: string; free: string; premium: string; enterprise: string }[] = [
  { feature: "Crops managed", free: "2", premium: "Unlimited", enterprise: "Unlimited" },
  { feature: "Plots", free: "2", premium: "10", enterprise: "Unlimited" },
  { feature: "AI advisor chats", free: "5 / month", premium: "50 / month", enterprise: "Unlimited" },
  { feature: "Weather forecasts", free: "3-day", premium: "7-day + seasonal", enterprise: "7-day + seasonal + custom" },
  { feature: "Market prices", free: "1 market", premium: "5 markets", enterprise: "All markets" },
  { feature: "Analytics", free: "Basic", premium: "Advanced", enterprise: "Advanced + custom" },
  { feature: "Reports", free: "2 / month", premium: "Unlimited", enterprise: "Unlimited + branded" },
  { feature: "Team members", free: "1 (self)", premium: "3", enterprise: "10" },
  { feature: "Agronomist chat", free: "—", premium: "2 / month", enterprise: "10 / month" },
  { feature: "Auto-pay", free: "—", premium: "✓", enterprise: "✓" },
  { feature: "API access", free: "—", premium: "—", enterprise: "✓" },
  { feature: "Priority support", free: "—", premium: "✓", enterprise: "✓" },
  { feature: "White-label", free: "—", premium: "—", enterprise: "✓" },
];

/* ---------- FAQ ---------- */
export const SETTINGS_FAQ = [
  { q: "How do I invite a team member?", a: "Team → Invite member. Enter their phone and pick a role; they get an SMS with a one-time code to set their own PIN. No email needed, and you can cap the invitation to a date range." },
  { q: "Can a worker see my finances?", a: "No. Workers see only the tasks assigned to them. Financial access is per role, and only the owner can change roles or remove people." },
  { q: "What happens when I remove someone?", a: "Their access stops immediately, pending payments are reallocated and their audit trail stays for compliance. You can suspend first and delete later." },
  { q: "How is my data shared with extension officers?", a: "Only if you enable it. When on, your Kiambu extension officer sees soil tests and spray records — never money, never team logins." },
  { q: "What happens if I downgrade from Premium?", a: "Nothing is deleted. Extra plots and team members become read-only at the next renewal until you are back within the Free limits." },
  { q: "Can I pay for Premium with M-Pesa?", a: "Yes — Premium and Enterprise are billed monthly to the GrowMO wallet, which you top up by M-Pesa STK push, Paybill, bank or an agent." },
];

export const SETTINGS_GLOSSARY = [
  { term: "Role", def: "A bundle of permissions — owner, manager, agronomist, accountant, worker or viewer." },
  { term: "Permission", def: "A single capability, e.g. 'initiate a payment' or 'edit crop records'." },
  { term: "Envelope", def: "A ring-fenced pot of wallet money tied to one crop or purpose." },
  { term: "Retention", def: "How long GrowMO keeps your records before they are deleted." },
  { term: "Audit trail", def: "The unbroken log of who did what, when and from which device." },
];
