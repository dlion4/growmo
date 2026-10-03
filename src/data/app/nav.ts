/* ============================================================================
   GrowMO APP NAV — the 25 dashboard modules (+ setup hub), grouped for the
   AppShell sidebar. Flip `ready:true` as each /dashboard/* page ships. Unbuilt
   routes render disabled with "Soon" — never a dead link.
   
   NOTE: AppShell is now located at components/dashboard/layout/AppShell.tsx
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
    id: "setup",
    label: "Setup & Access",
    items: [
      {
        to: "/dashboard",
        label: "Farm Profile",
        desc: "Onboarding & setup",
        icon: Rocket,
        ready: true,
        page: 1,
      },
      {
        to: "/dashboard/dashboard",
        label: "Dashboard",
        desc: "Command center",
        icon: LayoutDashboard,
        ready: true,
        page: 2,
      },
      {
        to: "/dashboard/settings",
        label: "Settings",
        desc: "Profile, notifications, privacy",
        icon: Settings,
        ready: true,
        page: 15,
      },
      {
        to: "/dashboard/channels",
        label: "Channels",
        desc: "Mobile, USSD & SMS",
        icon: Smartphone,
        ready: true,
        page: 16,
      },
    ],
  },
  {
    id: "hr-labour",
    label: "HR & Labour",
    items: [
      {
        to: "/dashboard/labour",
        label: "Labour",
        desc: "Team & payroll",
        icon: Users,
        ready: true,
        page: 6,
      },
      {
        to: "/dashboard/team",
        label: "Team & HR",
        desc: "Directory, permissions, compliance",
        icon: UserPlus,
        ready: true,
        page: 15.3,
      },
    ],
  },
  {
    id: "finance-wallet",
    label: "Finance & Wallet",
    items: [
      {
        to: "/dashboard/finance",
        label: "Finance",
        desc: "Budgets & P&L",
        icon: Wallet,
        ready: true,
        page: 7,
      },
      {
        to: "/dashboard/wallet",
        label: "Wallet",
        desc: "M-Pesa & payouts",
        icon: Banknote,
        ready: true,
        page: 14,
      },
    ],
  },
  {
    id: "crops-planning",
    label: "Crops & Planning",
    items: [
      {
        to: "/dashboard/planner",
        label: "Crop Planner",
        desc: "Season plans",
        icon: Sprout,
        ready: true,
        page: 3,
      },
      {
        to: "/dashboard/crops",
        label: "Crops",
        desc: "Growth tracker",
        icon: Wheat,
        ready: true,
        page: 4,
      },
      {
        to: "/dashboard/nursery",
        label: "Nursery",
        desc: "Seeds & seedlings",
        icon: Leaf,
        ready: true,
        page: 25,
      },
      {
        to: "/dashboard/seasons",
        label: "Seasons",
        desc: "Rotation plans",
        icon: CalendarRange,
        ready: true,
        page: 23,
      },
    ],
  },
  {
    id: "weather-climate",
    label: "Weather & Climate",
    items: [
      {
        to: "/dashboard/weather",
        label: "Weather",
        desc: "Forecasts & alerts",
        icon: CloudSun,
        ready: true,
        page: 8,
      },
      {
        to: "/dashboard/weather-pro",
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
    id: "inputs-soil",
    label: "Inputs & Soil",
    items: [
      {
        to: "/dashboard/inventory",
        label: "Inventory",
        desc: "Inputs & stock",
        icon: Package,
        ready: true,
        page: 5,
      },
      {
        to: "/dashboard/soil",
        label: "Soil Health",
        desc: "Tests & recipes",
        icon: FlaskConical,
        ready: true,
        page: 17,
      },
    ],
  },
  {
    id: "ai-intelligence",
    label: "AI & Intelligence",
    items: [
      {
        to: "/dashboard/advisor",
        label: "AI Advisor",
        desc: "Ask anything",
        icon: Bot,
        badge: "AI",
        ready: true,
        page: 9,
      },
    ],
  },
  {
    id: "market-sales",
    label: "Market & Sales",
    items: [
      {
        to: "/dashboard/market",
        label: "Market",
        desc: "Live prices",
        icon: TrendingUp,
        badge: "Live",
        ready: true,
        page: 10,
      },
      {
        to: "/dashboard/orders",
        label: "Orders",
        desc: "Buyers & contracts",
        icon: Store,
        count: 2,
        ready: true,
        page: 21,
      },
      {
        to: "/dashboard/harvest",
        label: "Harvest",
        desc: "Grading & storage",
        icon: Warehouse,
        ready: true,
        page: 24,
      },
      {
        to: "/dashboard/cooperative",
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
    id: "analytics-reporting",
    label: "Analytics & Reporting",
    items: [
      {
        to: "/dashboard/analytics",
        label: "Analytics",
        desc: "Reports & KPIs",
        icon: BarChart3,
        ready: true,
        page: 11,
      },
    ],
  },
  {
    id: "records-compliance",
    label: "Records & Compliance",
    items: [
      {
        to: "/dashboard/records",
        label: "Records",
        desc: "Diary & certificates",
        icon: ClipboardList,
        ready: true,
        page: 12,
      },
      {
        to: "/dashboard/logs",
        label: "Logs",
        desc: "Activity & security",
        icon: ShieldCheck,
        ready: true,
        page: 18,
      },
    ],
  },
  {
    id: "community-learning",
    label: "Community & Learning",
    items: [
      {
        to: "/dashboard/community",
        label: "Community",
        desc: "Learn & compare",
        icon: MessagesSquare,
        ready: true,
        page: 13,
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        to: "/dashboard/machinery",
        label: "Machinery",
        desc: "Equipment log",
        icon: Tractor,
        ready: true,
        page: 20,
      },
      {
        to: "/dashboard/map",
        label: "Farm Map",
        desc: "Plots & GPS",
        icon: MapIcon,
        ready: true,
        page: 19,
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
