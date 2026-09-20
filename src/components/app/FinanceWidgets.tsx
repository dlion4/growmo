/* ============================================================================
   PAGE 7 WIDGETS — Financial Management & Budgeting
   Shared visual pieces for the wallet, budget health, cash flow and P&L views.
   All colour decisions use the master theme tokens; no page-specific palette.
   ========================================================================== */
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CircleDollarSign,
  Landmark,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  CashFlowMonth,
  FinancialBudget,
  WalletActivity,
} from "../../data/app/finance";
import { kes } from "../../data/site";
import { ProgressLine, StatusChip } from "./DashboardWidgets";
import { BarChart, DonutChart, type DonutSlice } from "./InventoryWidgets";

export interface FinanceKpi {
  label: string;
  value: string;
  note: string;
  tone?: "positive" | "warning" | "neutral";
}

export function FinanceHeaderCard({
  kpis,
  actions,
}: {
  kpis: FinanceKpi[];
  actions: ReactNode;
}) {
  return (
    <header className="gm-card gm-plan-head">
      <div className="d-flex flex-wrap align-items-start gap-4">
        <div style={{ flex: "1 1 430px" }}>
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Page 7 · Financial command centre
          </span>
          <h1 className="font-display mt-2">
            Know where every shilling is going
          </h1>
          <p className="gm-lead on-dark mb-0">
            Pesa ya shamba kwa uwazi — track the wallet, protect crop budgets,
            record income, and see the profit before the season ends.
          </p>
        </div>
        <div className="gm-plan-hero-actions">{actions}</div>
      </div>
      <div className="gm-plan-kpi-row mt-4">
        {kpis.map((kpi) => (
          <div className="gm-card p-3" key={kpi.label}>
            <small>{kpi.label}</small>
            <strong className="font-display">{kpi.value}</strong>
            <span>{kpi.note}</span>
          </div>
        ))}
      </div>
    </header>
  );
}

export function WalletSplit({
  balance,
  allocated,
  unallocated,
  pending,
}: {
  balance: number;
  allocated: number;
  unallocated: number;
  pending: number;
}) {
  const slices: DonutSlice[] = [
    {
      id: "allocated",
      label: "Allocated to budgets",
      value: allocated,
      color: "var(--gm-leaf-600)",
      note: "Locked for crop plans",
    },
    {
      id: "free",
      label: "Unallocated",
      value: unallocated,
      color: "var(--gm-gold-500)",
      note: "Freely available",
    },
    {
      id: "pending",
      label: "Pending deductions",
      value: pending,
      color: "var(--gm-clay-500)",
      note: "Scheduled payments",
    },
  ];
  return (
    <div className="gm-card p-4 h-100">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
        <div>
          <span className="gm-eyebrow">Wallet allocation</span>
          <h3 className="font-display mb-1">Where is the balance held?</h3>
          <p className="text-muted mb-0">Ulinzi wa pesa ya shamba</p>
        </div>
        <span className="gm-mega-icon">
          <WalletCards />
        </span>
      </div>
      <DonutChart
        slices={slices}
        centerLabel="wallet"
        centerValue={kes(balance)}
      />
      <div className="gm-check-row mt-3">
        <ShieldCheck />
        <span>
          <strong>Effective available</strong>
          <small>
            {kes(Math.max(0, balance - allocated - pending))} after locked
            commitments
          </small>
        </span>
        <StatusChip label="Protected" tone="low" />
      </div>
    </div>
  );
}

export function WalletActivityMini({
  activity,
  onSelect,
}: {
  activity: WalletActivity[];
  onSelect: (item: WalletActivity) => void;
}) {
  return (
    <div className="gm-card p-4 h-100">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
        <div>
          <span className="gm-eyebrow">Latest movement</span>
          <h3 className="font-display mb-1">Wallet activity</h3>
          <p className="text-muted mb-0">Miamala ya hivi karibuni</p>
        </div>
        <span className="gm-mega-icon">
          <Banknote />
        </span>
      </div>
      <div className="gm-finance-activity-list">
        {activity.slice(0, 5).map((item) => (
          <button
            className="gm-finance-activity"
            type="button"
            key={item.id}
            onClick={() => onSelect(item)}
          >
            <span
              className={`gm-finance-activity-icon ${item.kind === "In" ? "is-in" : "is-out"}`}
            >
              {item.kind === "In" ? <ArrowDownLeft /> : <ArrowUpRight />}
            </span>
            <span className="gm-finance-activity-main">
              <strong>{item.description}</strong>
              <small>
                {item.time} · {item.receipt ?? "No receipt"}
              </small>
            </span>
            <span
              className={`gm-finance-activity-amount ${item.kind === "In" ? "is-in" : "is-out"}`}
            >
              {item.kind === "In" ? "+" : "−"}
              {kes(item.amount)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function BudgetHealthCard({
  budget,
  onOpen,
  onEdit,
}: {
  budget: FinancialBudget;
  onOpen: () => void;
  onEdit: () => void;
}) {
  const progress = Math.min(
    100,
    Math.round((budget.spent / Math.max(budget.total, 1)) * 100),
  );
  const remaining = budget.total - budget.spent;
  const tone =
    budget.status === "Over budget"
      ? "high"
      : budget.status === "Future"
        ? "neutral"
        : "low";
  return (
    <article className="gm-card p-3 h-100 d-flex flex-column">
      <div className="d-flex align-items-start gap-3">
        <span className="gm-mega-icon">
          <Landmark />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="gm-eyebrow">{budget.season}</span>
            <StatusChip label={budget.status} tone={tone} />
          </div>
          <h3 className="font-display mb-1">{budget.name}</h3>
          <p className="text-muted mb-0">
            {budget.crop} · {budget.plot}
          </p>
        </div>
      </div>
      <div className="d-flex align-items-end justify-content-between gap-2 mt-3 mb-1">
        <span>
          <small className="text-muted d-block">Spent</small>
          <strong className="font-display">{kes(budget.spent)}</strong>
        </span>
        <span className="text-end">
          <small className="text-muted d-block">Plan</small>
          <strong>{kes(budget.total)}</strong>
        </span>
      </div>
      <ProgressLine
        value={progress}
        label={`${progress}% of ${budget.name} budget spent`}
      />
      <div className="d-flex justify-content-between gap-2 mt-2">
        <small className="text-muted">{progress}% committed</small>
        <small className={remaining < 0 ? "text-danger" : "text-muted"}>
          {remaining >= 0
            ? `${kes(remaining)} remaining`
            : `${kes(Math.abs(remaining))} over`}
        </small>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-auto pt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onOpen}
        >
          View categories
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onEdit}
        >
          Adjust plan
        </button>
      </div>
    </article>
  );
}

export function CashFlowBars({
  months,
  onOpen,
}: {
  months: CashFlowMonth[];
  onOpen: () => void;
}) {
  return (
    <div className="gm-card p-4">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
        <div>
          <span className="gm-eyebrow">Section 7.5 · Forecast</span>
          <h3 className="font-display mb-1">Cash flow runway</h3>
          <p className="text-muted mb-0">
            Mapato na matumizi — monthly projection
          </p>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onOpen}
        >
          Edit assumptions
        </button>
      </div>
      <BarChart
        rows={months.map((month) => ({
          id: month.id,
          label: month.month.slice(0, 3),
          sub: month.net >= 0 ? `+${kes(month.net)}` : kes(month.net),
          value: Math.max(month.inflows, month.outflows),
          highlight: month.inflows > 0,
        }))}
        unitLabel="Green bars show months with income; compare the runway before releasing a new payment."
        formatValue={(value) =>
          value >= 1000 ? `${Math.round(value / 1000)}K` : `${value}`
        }
      />
      <div className="d-flex flex-wrap gap-3 mt-3">
        <span className="gm-check-row flex-grow-1">
          <TrendingUp />
          <span>
            <strong>Projected season net</strong>
            <small>
              {kes(months.reduce((sum, month) => sum + month.net, 0))}
            </small>
          </span>
        </span>
        <span className="gm-check-row flex-grow-1">
          <TrendingDown />
          <span>
            <strong>Lowest runway point</strong>
            <small>
              {months
                .reduce(
                  (lowest, month) => Math.min(lowest, month.cumulative),
                  Infinity,
                )
                .toLocaleString("en-KE")}{" "}
              KES
            </small>
          </span>
        </span>
      </div>
    </div>
  );
}

export function FinanceInsight({
  title,
  children,
  tone = "ai",
}: {
  title: string;
  children: ReactNode;
  tone?: "ai" | "warning" | "success";
}) {
  return (
    <aside className={`gm-insight gm-insight-${tone}`}>
      <span className="gm-insight-icon">
        <Sparkles />
      </span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </aside>
  );
}

export function PnlSummary({
  revenue,
  costs,
  profit,
  roi,
  onOpen,
}: {
  revenue: number;
  costs: number;
  profit: number;
  roi: number;
  onOpen: () => void;
}) {
  return (
    <div className="gm-card p-4 h-100">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
        <div>
          <span className="gm-eyebrow">Section 7.6 · Per crop</span>
          <h3 className="font-display mb-1">Cabbage is carrying the farm</h3>
          <p className="text-muted mb-0">
            Short Rains 2026 · Plot 1 · 0.5 acre
          </p>
        </div>
        <span className="gm-mega-icon">
          <CircleDollarSign />
        </span>
      </div>
      <div className="row g-2">
        <div className="col-6">
          <div className="gm-kpi-soft">
            <small>Revenue</small>
            <strong className="font-display">{kes(revenue)}</strong>
            <span className="text-success">+78K vs plan</span>
          </div>
        </div>
        <div className="col-6">
          <div className="gm-kpi-soft">
            <small>Production cost</small>
            <strong className="font-display">{kes(costs)}</strong>
            <span>−4.2K vs plan</span>
          </div>
        </div>
        <div className="col-6">
          <div className="gm-kpi-soft">
            <small>Net profit</small>
            <strong className="font-display">{kes(profit)}</strong>
            <span className="text-success">Mavuno mazuri</span>
          </div>
        </div>
        <div className="col-6">
          <div className="gm-kpi-soft">
            <small>ROI</small>
            <strong className="font-display">{roi}%</strong>
            <span>per production cost</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="gm-btn gm-btn-lime w-100 mt-3"
        onClick={onOpen}
      >
        Export full P&amp;L statement
      </button>
    </div>
  );
}
