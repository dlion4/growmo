/* ============================================================================
   GrowMO APP NAV — the 25 dashboard modules (+ setup hub), grouped for the
   AppShell sidebar. Flip `ready:true` as each /app/* page ships. Unbuilt
   routes render disabled with "Soon" — never a dead link.
   ========================================================================== */
import {
  Banknote,
  BarChart3,
  Bot,
  CalendarRange,
  ClipboardList,
  CloudRain,
  CloudSun,
  FlaskConical,
  Handshake,
  LayoutDashboard,
  Leaf,
  type LucideIcon,
  Map as MapIcon,
  MessagesSquare,
  Package,
  Rocket,
  Settings,
  ShieldCheck,
  Smartphone,
  Sprout,
  Store,
  Tractor,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Warehouse,
  Wheat,
} from "lucide-react";

export interface AppNavItem {
  to: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  badge?: string;
  count?: number;
  ready: boolean;
  page?: number;
}

export interface AppNavGroup {
  id: string;
  label: string;
  items: AppNavItem[];
}

export const APP_NAV: AppNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        to: "/app",
        label: "Getting started",
        desc: "Setup hub",
        icon: Rocket,
        ready: true,
      },
      {
        to: "/app/dashboard",
        label: "Dashboard",
        desc: "Command center",
        icon: LayoutDashboard,
        ready: true,
        page: 2,
      },
      {
        to: "/app/advisor",
        label: "AI Advisor",
        desc: "Ask anything",
        icon: Bot,
        badge: "AI",
        ready: true,
        page: 9,
      },
      {
        to: "/app/analytics",
        label: "Analytics",
        desc: "Reports & KPIs",
        icon: BarChart3,
        ready: true,
        page: 11,
      },
    ],
  },
  {
    id: "grow",
    label: "Grow",
    items: [
      {
        to: "/app/planner",
        label: "Crop Planner",
        desc: "Season plans",
        icon: Sprout,
        ready: true,
        page: 3,
      },
      {
        to: "/app/crops",
        label: "Crops",
        desc: "Growth tracker",
        icon: Wheat,
        ready: true,
        page: 4,
      },
      {
        to: "/app/soil",
        label: "Soil Health",
        desc: "Tests & recipes",
        icon: FlaskConical,
        ready: true,
        page: 17,
      },
      {
        to: "/app/map",
        label: "Farm Map",
        desc: "Plots & GPS",
        icon: MapIcon,
        ready: false,
        page: 19,
      },
      {
        to: "/app/seasons",
        label: "Seasons",
        desc: "Rotation plans",
        icon: CalendarRange,
        ready: false,
        page: 23,
      },
      {
        to: "/app/nursery",
        label: "Nursery",
        desc: "Seeds & seedlings",
        icon: Leaf,
        ready: false,
        page: 25,
      },
      {
        to: "/app/weather",
        label: "Weather",
        desc: "Forecasts & alerts",
        icon: CloudSun,
        ready: true,
        page: 8,
      },
      {
        to: "/app/weather-pro",
        label: "Weather Pro",
        desc: "Spray windows & irrigation",
        icon: CloudRain,
        badge: "Live",
        ready: true,
        page: 8,
      },
    ],
  },
  {
    id: "manage",
    label: "Manage",
    items: [
      {
        to: "/app/inventory",
        label: "Inventory",
        desc: "Inputs & stock",
        icon: Package,
        ready: true,
        page: 5,
      },
      {
        to: "/app/labour",
        label: "Labour",
        desc: "Team & payroll",
        icon: Users,
        ready: true,
        page: 6,
      },
      {
        to: "/app/finance",
        label: "Finance",
        desc: "Budgets & P&L",
        icon: Wallet,
        ready: true,
        page: 7,
      },
      {
        to: "/app/machinery",
        label: "Machinery",
        desc: "Equipment log",
        icon: Tractor,
        ready: true,
        page: 20,
      },
      {
        to: "/app/records",
        label: "Records",
        desc: "Diary & certificates",
        icon: ClipboardList,
        ready: true,
        page: 12,
      },
      {
        to: "/app/settings",
        label: "Settings",
        desc: "Farm & team",
        icon: Settings,
        ready: true,
        page: 15,
      },
    ],
  },
  {
    id: "sell",
    label: "Sell",
    items: [
      {
        to: "/app/market",
        label: "Market",
        desc: "Live prices",
        icon: TrendingUp,
        badge: "Live",
        ready: true,
        page: 10,
      },
      {
        to: "/app/orders",
        label: "Orders",
        desc: "Buyers & contracts",
        icon: Store,
        count: 2,
        ready: true,
        page: 21,
      },
      {
        to: "/app/harvest",
        label: "Harvest",
        desc: "Grading & storage",
        icon: Warehouse,
        ready: false,
        page: 24,
      },
      {
        to: "/app/cooperative",
        label: "Cooperative",
        desc: "Group workspace",
        icon: Handshake,
        count: 5,
        ready: true,
        page: 22,
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        to: "/app/wallet",
        label: "Wallet",
        desc: "M-Pesa & payouts",
        icon: Banknote,
        ready: true,
        page: 14,
      },
      {
        to: "/app/community",
        label: "Community",
        desc: "Learn & compare",
        icon: MessagesSquare,
        ready: true,
        page: 13,
      },
      {
        to: "/app/channels",
        label: "Channels",
        desc: "USSD & SMS",
        icon: Smartphone,
        ready: true,
        page: 16,
      },
      {
        to: "/app/logs",
        label: "Logs",
        desc: "Activity & logs",
        icon: ShieldCheck,
        ready: false,
        page: 18,
      },
      {
        to: "/app/onboarding",
        label: "Farm Profile",
        desc: "Setup & details",
        icon: UserPlus,
        ready: true,
        page: 1,
      },
    ],
  },
];

export function findNavItem(
  path: string,
): { item: AppNavItem; group: AppNavGroup } | null {
  for (const group of APP_NAV) {
    const item = group.items.find((i) => i.to === path);
    if (item) return { item, group };
  }
  return null;
}
