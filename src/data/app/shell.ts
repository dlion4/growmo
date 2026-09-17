/* Demo data for the AppShell topbar: notifications, weather, wallet. */

export interface AppNote {
  id: string;
  title: string;
  desc: string;
  at: string;
  unread: boolean;
  kind: "alert" | "money" | "task";
}

export const APP_NOTES: AppNote[] = [
  { id: "n1", title: "Black-rot risk 82% on Plot 1", desc: "AI suggests Mancozeb within 48 hours.", at: "12 min ago", unread: true, kind: "alert" },
  { id: "n2", title: "Buyer paid KES 12,400", desc: "Twiga order #8841 settled to wallet.", at: "1 hr ago", unread: true, kind: "money" },
  { id: "n3", title: "Payroll Friday: 6 workers", desc: "KES 4,200 due. Review hours first.", at: "3 hrs ago", unread: true, kind: "task" },
  { id: "n4", title: "Top-dress CAN due Thursday", desc: "0.5 acre cabbage · 25kg required.", at: "Yesterday", unread: false, kind: "task" },
  { id: "n5", title: "Storm warning — Kiambu", desc: "Heavy rain tonight. Hold foliar sprays.", at: "Yesterday", unread: false, kind: "alert" },
];

export const APP_FORECAST = {
  place: "Githunguri, Kiambu",
  temp: "24°C",
  rain: "70%",
  rows: [
    { d: "Today", t: "22°C · Heavy rain", w: "90%" },
    { d: "Tue", t: "21°C · Showers", w: "65%" },
    { d: "Wed", t: "23°C · Fair", w: "25%" },
  ],
};

export const APP_WALLET = {
  balance: 35000,
  phone: "0712 ••• 678",
  pending: 12400,
};
