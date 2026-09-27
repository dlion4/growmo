/* ============================================================================
   PAGE 22 — COOPERATIVE MANAGEMENT
   Kenyan demo data for Delion Farmers Cooperative Society Ltd, Githunguri.
   ========================================================================== */

export type MemberStatus = "Active" | "Pending" | "Suspended";
export type InputOrderStatus =
  | "Collecting needs"
  | "Quotes received"
  | "Approved"
  | "Delivery due"
  | "Distributed";
export type ContractStatus =
  | "Active"
  | "Negotiating"
  | "Renewal due"
  | "Completed";

export const COOPERATIVE_PROFILE = {
  name: "Delion Farmers Cooperative Society Ltd",
  registration: "CS/KBU/0864/2024",
  status: "Registered",
  registeredOn: "15 Mar 2024",
  county: "Kiambu",
  authority: "Commissioner for Cooperative Development",
  address: "P.O. Box 123, Githunguri 00216",
  office: "Githunguri Town, next to Chief's camp",
  type: "Marketing + Production",
  crops: "Cabbage, tomato, potato, sukuma wiki, maize",
  members: 45,
  acreage: 120,
  bank: "KCB Githunguri · 1234567890",
  paybill: "522901",
  logo: "Delion Farmers Cooperative crest · verified on file",
  annualMeeting: "15 Mar 2027",
  constitution: "Delion-Coop-Constitution-2024.pdf",
  signatories: [
    {
      id: "SIG-001",
      name: "Mary Wanjiku",
      role: "Chairperson",
      idNumber: "12345678",
      phone: "0712 345 678",
    },
    {
      id: "SIG-002",
      name: "Peter Kamau",
      role: "Secretary",
      idNumber: "23456789",
      phone: "0723 456 789",
    },
    {
      id: "SIG-003",
      name: "Grace Wanjiku",
      role: "Treasurer",
      idNumber: "34567890",
      phone: "0734 567 890",
    },
  ],
};

export interface CooperativeMember {
  id: string;
  name: string;
  idNumber: string;
  phone: string;
  farm: string;
  acreage: number;
  crops: string;
  shares: number;
  status: MemberStatus;
  joined: string;
  ward: string;
  balance: number;
}

export const COOPERATIVE_MEMBERS: CooperativeMember[] = [
  {
    id: "MBR-001",
    name: "Mary Wanjiku",
    idNumber: "12345678",
    phone: "0712 345 678",
    farm: "Delion Farm",
    acreage: 2.92,
    crops: "Cabbage, maize, sukuma",
    shares: 50,
    status: "Active",
    joined: "Mar 2024",
    ward: "Githunguri",
    balance: 115000,
  },
  {
    id: "MBR-002",
    name: "Peter Kamau",
    idNumber: "23456789",
    phone: "0723 456 789",
    farm: "Kamau Farm",
    acreage: 5,
    crops: "Potato, cabbage",
    shares: 100,
    status: "Active",
    joined: "Mar 2024",
    ward: "Githunguri",
    balance: 188000,
  },
  {
    id: "MBR-003",
    name: "Grace Wanjiku",
    idNumber: "34567890",
    phone: "0734 567 890",
    farm: "Grace Gardens",
    acreage: 1.5,
    crops: "Tomato, kale",
    shares: 30,
    status: "Active",
    joined: "Jun 2024",
    ward: "Kiganjo",
    balance: 84500,
  },
  {
    id: "MBR-004",
    name: "Joseph Muthoni",
    idNumber: "45678901",
    phone: "0745 678 901",
    farm: "Muthoni Farm",
    acreage: 3.2,
    crops: "Maize, beans",
    shares: 60,
    status: "Active",
    joined: "Jun 2024",
    ward: "Ngewa",
    balance: 72800,
  },
  {
    id: "MBR-005",
    name: "Samuel Njoroge",
    idNumber: "56789012",
    phone: "0756 789 012",
    farm: "Njoroge Acres",
    acreage: 8,
    crops: "Potato, cabbage, pea",
    shares: 150,
    status: "Active",
    joined: "Mar 2024",
    ward: "Githunguri",
    balance: 241000,
  },
  {
    id: "MBR-006",
    name: "Beatrice Wanjiru",
    idNumber: "67890123",
    phone: "0708 112 445",
    farm: "Wanjiru Greens",
    acreage: 2.4,
    crops: "Kale, spinach, coriander",
    shares: 45,
    status: "Active",
    joined: "Aug 2024",
    ward: "Komothai",
    balance: 63600,
  },
  {
    id: "MBR-007",
    name: "David Mwangi",
    idNumber: "78901234",
    phone: "0716 813 251",
    farm: "Mwangi Plot",
    acreage: 4.6,
    crops: "Tomato, maize",
    shares: 80,
    status: "Active",
    joined: "Sep 2024",
    ward: "Kiganjo",
    balance: 91750,
  },
  {
    id: "MBR-008",
    name: "Lilian Njeri",
    idNumber: "89012345",
    phone: "0791 624 300",
    farm: "Njeri Fresh Farm",
    acreage: 1.8,
    crops: "Cabbage, potato",
    shares: 35,
    status: "Pending",
    joined: "Jan 2027",
    ward: "Ngewa",
    balance: 12000,
  },
  {
    id: "MBR-009",
    name: "John Karanja",
    idNumber: "90123456",
    phone: "0704 610 322",
    farm: "Karanja Farm",
    acreage: 6.5,
    crops: "Potato, French beans",
    shares: 120,
    status: "Active",
    joined: "Nov 2024",
    ward: "Komothai",
    balance: 154000,
  },
  {
    id: "MBR-010",
    name: "Esther Wangari",
    idNumber: "01234567",
    phone: "0788 802 277",
    farm: "Wangari Home Farm",
    acreage: 2.1,
    crops: "Sukuma, cabbage",
    shares: 40,
    status: "Suspended",
    joined: "May 2024",
    ward: "Githunguri",
    balance: 26500,
  },
];

export const CROP_DASHBOARD = [
  {
    id: "crop-01",
    crop: "Cabbage",
    members: 18,
    acreage: 35,
    yield: "16,000 heads/acre",
    output: "560,000 heads",
    marketValue: 16800000,
  },
  {
    id: "crop-02",
    crop: "Potato",
    members: 12,
    acreage: 40,
    yield: "100 bags (50 kg)/acre",
    output: "4,000 bags",
    marketValue: 8000000,
  },
  {
    id: "crop-03",
    crop: "Tomato",
    members: 8,
    acreage: 15,
    yield: "20 tonnes/acre",
    output: "300 tonnes",
    marketValue: 90000000,
  },
  {
    id: "crop-04",
    crop: "Sukuma Wiki",
    members: 25,
    acreage: 20,
    yield: "Perennial harvest",
    output: "Ongoing",
    marketValue: 3600000,
  },
  {
    id: "crop-05",
    crop: "Maize",
    members: 15,
    acreage: 30,
    yield: "25 bags/acre",
    output: "750 bags",
    marketValue: 2625000,
  },
];

export interface InputLine {
  id: string;
  input: string;
  members: number;
  quantity: string;
  individual: number;
  bulk: number;
  saving: number;
  totalSaving: number;
  supplier: string;
  state: "Confirmed" | "Awaiting member" | "Quoted";
}

export const BULK_INPUT_LINES: InputLine[] = [
  {
    id: "INP-001",
    input: "DAP 50 kg",
    members: 30,
    quantity: "75 bags",
    individual: 6800,
    bulk: 6200,
    saving: 600,
    totalSaving: 45000,
    supplier: "Yara Kenya",
    state: "Confirmed",
  },
  {
    id: "INP-002",
    input: "CAN 50 kg",
    members: 28,
    quantity: "60 bags",
    individual: 5200,
    bulk: 4700,
    saving: 500,
    totalSaving: 30000,
    supplier: "Yara Kenya",
    state: "Confirmed",
  },
  {
    id: "INP-003",
    input: "Cabbage Gloria F1 10 g",
    members: 18,
    quantity: "90 sachets",
    individual: 850,
    bulk: 700,
    saving: 150,
    totalSaving: 13500,
    supplier: "Simlaw Seeds",
    state: "Quoted",
  },
  {
    id: "INP-004",
    input: "Mancozeb 80WP 1 kg",
    members: 25,
    quantity: "50 kg",
    individual: 1000,
    bulk: 850,
    saving: 150,
    totalSaving: 7500,
    supplier: "Osho Chemical",
    state: "Awaiting member",
  },
  {
    id: "INP-005",
    input: "Well-rotted manure",
    members: 35,
    quantity: "100 tonnes",
    individual: 7000,
    bulk: 5500,
    saving: 1500,
    totalSaving: 150000,
    supplier: "Githunguri Dairy Farms",
    state: "Confirmed",
  },
];

export const INPUT_WORKFLOW = [
  "Members send needs by 30 Sep",
  "GrowMO aggregates quantities",
  "Chair and treasurer approve",
  "Three supplier quotes compared",
  "Best quote selected and ordered",
  "Delivery arrives at collection point",
  "Members collect after M-Pesa payment",
  "Receipts and stock records update",
];

export interface SaleContribution {
  id: string;
  member: string;
  contributed: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  value: number;
  payment: "Paid" | "Pending" | "Ready";
  receipt: string;
}

export const SALE_CONTRIBUTIONS: SaleContribution[] = [
  {
    id: "SAL-001",
    member: "Mary Wanjiku",
    contributed: 14500,
    gradeA: 10000,
    gradeB: 3500,
    gradeC: 1000,
    value: 435000,
    payment: "Paid",
    receipt: "QLJ8N3HX",
  },
  {
    id: "SAL-002",
    member: "Peter Kamau",
    contributed: 25000,
    gradeA: 18000,
    gradeB: 5000,
    gradeC: 2000,
    value: 755000,
    payment: "Paid",
    receipt: "QLJ8N3HY",
  },
  {
    id: "SAL-003",
    member: "Grace Wanjiku",
    contributed: 8000,
    gradeA: 6000,
    gradeB: 1500,
    gradeC: 500,
    value: 247500,
    payment: "Paid",
    receipt: "QLJ8N3HZ",
  },
  {
    id: "SAL-004",
    member: "Beatrice Wanjiru",
    contributed: 4200,
    gradeA: 2800,
    gradeB: 1000,
    gradeC: 400,
    value: 122000,
    payment: "Paid",
    receipt: "QLJ8N4AA",
  },
  {
    id: "SAL-005",
    member: "Samuel Njoroge",
    contributed: 5100,
    gradeA: 3600,
    gradeB: 1100,
    gradeC: 400,
    value: 151500,
    payment: "Paid",
    receipt: "QLJ8N4AB",
  },
  {
    id: "SAL-006",
    member: "David Mwangi",
    contributed: 3100,
    gradeA: 2200,
    gradeB: 700,
    gradeC: 200,
    value: 92500,
    payment: "Ready",
    receipt: "Awaiting PIN",
  },
  {
    id: "SAL-007",
    member: "Lilian Njeri",
    contributed: 2200,
    gradeA: 1500,
    gradeB: 500,
    gradeC: 200,
    value: 64000,
    payment: "Pending",
    receipt: "KYC review",
  },
  {
    id: "SAL-008",
    member: "John Karanja",
    contributed: 3600,
    gradeA: 2500,
    gradeB: 800,
    gradeC: 300,
    value: 105000,
    payment: "Ready",
    receipt: "Awaiting PIN",
  },
  {
    id: "SAL-009",
    member: "Esther Wangari",
    contributed: 1800,
    gradeA: 1200,
    gradeB: 450,
    gradeC: 150,
    value: 52500,
    payment: "Pending",
    receipt: "Member suspended",
  },
  {
    id: "SAL-010",
    member: "Joseph Muthoni",
    contributed: 1500,
    gradeA: 1000,
    gradeB: 350,
    gradeC: 150,
    value: 42500,
    payment: "Paid",
    receipt: "QLJ8N4AC",
  },
];

export const COLLECTIVE_SALE = {
  buyer: "Fresh Produce Kenya Ltd",
  crop: "Cabbage · January pooled harvest",
  heads: 47500,
  value: 1437500,
  collectivePrice: "KES 30.27/head",
  individualPrice: "KES 25/head",
  premium: 250000,
  delivery: "Cooperative collection centre → Mombasa Rd, Nairobi",
};

export const COOP_ACCOUNTS = [
  {
    id: "ACC-001",
    account: "Cooperative bank account",
    balance: 2450000,
    type: "Operating",
    note: "KCB Githunguri · signatory approval required",
  },
  {
    id: "ACC-002",
    account: "M-Pesa Paybill float",
    balance: 150000,
    type: "Daily transactions",
    note: "Paybill 522901 · collection point payments",
  },
  {
    id: "ACC-003",
    account: "Input purchase fund",
    balance: 800000,
    type: "Ring-fenced",
    note: "Bulk DAP, CAN, seed and crop protection",
  },
  {
    id: "ACC-004",
    account: "Emergency fund",
    balance: 200000,
    type: "Reserved",
    note: "Board approval required before release",
  },
  {
    id: "ACC-005",
    account: "Member deposits / share capital",
    balance: 5000000,
    type: "Equity",
    note: "45 members · 2,500 total shares",
  },
];

export const FINANCIAL_REPORTS = [
  {
    id: "REP-001",
    name: "Income & expenditure",
    period: "December 2026",
    status: "Ready",
    note: "Monthly operating report",
  },
  {
    id: "REP-002",
    name: "Balance sheet",
    period: "Q4 2026",
    status: "Ready",
    note: "Quarterly board report",
  },
  {
    id: "REP-003",
    name: "Member statements",
    period: "January 2027",
    status: "Preparing",
    note: "Shares, input credits and sales proceeds",
  },
  {
    id: "REP-004",
    name: "Annual audit pack",
    period: "2026/27",
    status: "Scheduled",
    note: "Approved auditor visit · 18 Mar 2027",
  },
];

export interface CoopContract {
  id: string;
  contract: string;
  partner: string;
  crop: string;
  duration: string;
  value: string;
  memberCount: number;
  status: ContractStatus;
  contact: string;
}

export const COOP_CONTRACTS: CoopContract[] = [
  {
    id: "CON-001",
    contract: "Vegetable supply",
    partner: "Tuskys Supermarket",
    crop: "Cabbage, tomato, sukuma",
    duration: "12 months",
    value: "KES 15M",
    memberCount: 20,
    status: "Active",
    contact: "0722 615 400",
  },
  {
    id: "CON-002",
    contract: "Potato supply",
    partner: "Java House",
    crop: "Crisping potato",
    duration: "6 months",
    value: "KES 8M",
    memberCount: 8,
    status: "Active",
    contact: "0718 270 650",
  },
  {
    id: "CON-003",
    contract: "French beans export",
    partner: "Vegpro Ltd",
    crop: "French beans",
    duration: "12 months",
    value: "KES 25M",
    memberCount: 10,
    status: "Negotiating",
    contact: "0700 221 907",
  },
  {
    id: "CON-004",
    contract: "Input supply agreement",
    partner: "Yara Kenya",
    crop: "All fertilizers",
    duration: "24 months",
    value: "12% discount",
    memberCount: 45,
    status: "Active",
    contact: "0711 900 410",
  },
  {
    id: "CON-005",
    contract: "Crate hire agreement",
    partner: "PackHouse Kenya",
    crop: "Vegetable crates",
    duration: "12 months",
    value: "KES 480K",
    memberCount: 30,
    status: "Renewal due",
    contact: "0738 114 222",
  },
  {
    id: "CON-006",
    contract: "Seedling programme",
    partner: "Simlaw Seeds",
    crop: "Cabbage, tomato",
    duration: "6 months",
    value: "KES 1.2M",
    memberCount: 18,
    status: "Completed",
    contact: "0724 680 122",
  },
];

export const COMMUNICATIONS = [
  {
    id: "COM-001",
    channel: "Broadcast SMS",
    audience: "All 45 members",
    message:
      "Cooperative meeting Sat 5 Dec, 2 PM, Githunguri Hall. Attendance mandatory.",
    status: "Sent",
    at: "Today · 08:15",
  },
  {
    id: "COM-002",
    channel: "WhatsApp group",
    audience: "Cabbage cluster",
    message:
      "Picha za grading checklist are in the group. Tuma update before 5 PM.",
    status: "Sent",
    at: "Yesterday · 16:30",
  },
  {
    id: "COM-003",
    channel: "Push notification",
    audience: "Cabbage contributors",
    message:
      "Cabbage collection is scheduled for 15 Jan at cooperative centre.",
    status: "Scheduled",
    at: "14 Jan · 18:00",
  },
  {
    id: "COM-004",
    channel: "Individual SMS",
    audience: "Mary Wanjiku",
    message: "Your DAP share is ready. Collect by Friday. Amount: KES 12,400.",
    status: "Delivered",
    at: "Today · 09:00",
  },
  {
    id: "COM-005",
    channel: "Individual SMS",
    audience: "Lilian Njeri",
    message:
      "Karibu. Please complete ID verification to activate cooperative benefits.",
    status: "Delivered",
    at: "Today · 09:03",
  },
  {
    id: "COM-006",
    channel: "Broadcast SMS",
    audience: "Input order members",
    message:
      "Bulk DAP payment deadline is Thursday 4 PM. Lipia kwa Paybill 522901.",
    status: "Draft",
    at: "Not sent",
  },
  {
    id: "COM-007",
    channel: "WhatsApp group",
    audience: "Potato cluster",
    message:
      "Java House quality visit is Wednesday at 10 AM. Prepare sample bags.",
    status: "Sent",
    at: "Mon · 12:05",
  },
  {
    id: "COM-008",
    channel: "Push notification",
    audience: "Board signatories",
    message: "Three supplier quotes are ready for approval.",
    status: "Delivered",
    at: "Mon · 10:10",
  },
  {
    id: "COM-009",
    channel: "Individual SMS",
    audience: "David Mwangi",
    message:
      "Your collective sale payout KES 92,500 is ready for M-Pesa approval.",
    status: "Delivered",
    at: "Sun · 15:42",
  },
  {
    id: "COM-010",
    channel: "Broadcast SMS",
    audience: "All 45 members",
    message: "Annual General Meeting is 15 Mar 2027. Save the date, wanachama.",
    status: "Scheduled",
    at: "01 Mar · 08:00",
  },
];

export const COOP_CONTEXT = {
  savings: BULK_INPUT_LINES.reduce((sum, line) => sum + line.totalSaving, 0),
  totalValue: CROP_DASHBOARD.reduce((sum, crop) => sum + crop.marketValue, 0),
  activeMembers: 43,
  pendingPayout: SALE_CONTRIBUTIONS.filter(
    (line) => line.payment !== "Paid",
  ).reduce((sum, line) => sum + line.value, 0),
};

export function memberTone(status: MemberStatus): "low" | "medium" | "high" {
  if (status === "Active") return "low";
  if (status === "Pending") return "medium";
  return "high";
}

export function contractTone(
  status: ContractStatus,
): "low" | "medium" | "neutral" {
  if (status === "Active") return "low";
  if (status === "Negotiating" || status === "Renewal due") return "medium";
  return "neutral";
}
