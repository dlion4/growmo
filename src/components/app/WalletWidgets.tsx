/* ============================================================================
   PAGE 14 — WALLET & PAYMENTS WIDGETS
   Reusable widget components for the wallet page.
   ========================================================================== */
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { StatusChip } from "../../components/app/DashboardWidgets";
import { kes } from "../../data/site";
import type { SpendCategory, Transaction } from "../../data/app/wallet";

/* ── Mini spend bar chart ────────────────────────────────────────────────── */
export function SpendBarChart({ categories }: { categories: SpendCategory[] }) {
  const max = Math.max(...categories.map((c) => c.amount), 1);
  return (
    <div className="gm-bar-chart">
      {categories.map((cat) => (
        <div key={cat.id} className="gm-bar-row">
          <span className="gm-bar-label">
            <strong>{cat.category}</strong>
            <small>{cat.percent}%</small>
          </span>
          <div className="gm-bar-track">
            <span
              className="gm-bar-fill"
              style={{
                width: `${(cat.amount / max) * 100}%`,
                background: cat.color,
              }}
            />
          </div>
          <span className="gm-bar-value font-display">{kes(cat.amount)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Stacked spend bar ───────────────────────────────────────────────────── */
export function StackedSpendBar({
  categories,
  total,
}: {
  categories: SpendCategory[];
  total: number;
}) {
  return (
    <div className="gm-stacked-bar-wrap">
      <div className="gm-stacked-bar">
        {categories.map((c) => (
          <span
            key={c.id}
            className="gm-stacked-segment"
            style={{
              width: `${(c.amount / Math.max(total, 1)) * 100}%`,
              background: c.color,
            }}
            title={`${c.category}: ${kes(c.amount)}`}
          />
        ))}
      </div>
      <div className="d-flex flex-wrap gap-3 mt-2">
        {categories.map((c) => (
          <span key={c.id} className="d-flex align-items-center gap-1">
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: c.color,
                display: "inline-block",
              }}
            />
            <small>
              {c.category}: {kes(c.amount)} ({c.percent}%)
            </small>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Mini transaction list ───────────────────────────────────────────────── */
export function TransactionMiniList({
  txns,
  onSelect,
}: {
  txns: Transaction[];
  onSelect: (txn: Transaction) => void;
}) {
  return (
    <div className="gm-wallet-activity-mini">
      {txns.slice(0, 5).map((txn) => (
        <button
          key={txn.id}
          type="button"
          className="gm-check-row"
          onClick={() => onSelect(txn)}
        >
          <span
            className={`gm-finance-activity-icon ${txn.type === "In" ? "is-in" : "is-out"}`}
            style={{ width: 32, height: 32 }}
          >
            {txn.type === "In" ? (
              <ArrowDownLeft width={16} height={16} />
            ) : (
              <ArrowUpRight width={16} height={16} />
            )}
          </span>
          <span style={{ flex: 1 }}>
            <strong style={{ fontSize: ".84rem" }}>{txn.description}</strong>
            <small className="d-block text-muted">
              {txn.date} · {txn.time}
            </small>
          </span>
          <strong
            className={`font-display ${txn.type === "In" ? "text-success" : ""}`}
            style={{ fontSize: ".88rem" }}
          >
            {txn.type === "In" ? "+" : "−"}
            {kes(txn.amount)}
          </strong>
        </button>
      ))}
    </div>
  );
}

/* ── Wallet balance ring ─────────────────────────────────────────────────── */
export function WalletRing({
  balance,
  allocated,
  pending,
}: {
  balance: number;
  allocated: number;
  pending: number;
}) {
  const free = balance - allocated - pending;
  const total = Math.max(balance, 1);
  return (
    <div className="gm-wallet-ring-wrap">
      <svg viewBox="0 0 100 100" width="120" height="120">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="var(--gm-line-soft)"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="var(--gm-leaf-500)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(free / total) * 264} 264`}
          transform="rotate(-90 50 50)"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="var(--gm-gold-500)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(allocated / total) * 264} 264`}
          strokeDashoffset={`${-(free / total) * 264}`}
          transform="rotate(-90 50 50)"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="var(--gm-clay-500)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(pending / total) * 264} 264`}
          strokeDashoffset={`${-((free + allocated) / total) * 264}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="gm-wallet-ring-center">
        <strong className="font-display">{kes(balance)}</strong>
        <small>Total</small>
      </div>
    </div>
  );
}

/* ── Wallet card header (big balance) ────────────────────────────────────── */
export function WalletBalanceCard({
  balance,
  effective,
  pending,
}: {
  balance: number;
  effective: number;
  pending: number;
}) {
  return (
    <div className="gm-wallet-balance-card">
      <span className="gm-eyebrow on-dark">Available balance</span>
      <h2 className="font-display gm-wallet-balance-value">
        {kes(balance)}
      </h2>
      <div className="d-flex flex-wrap gap-3 mt-2">
        <span className="gm-wallet-balance-meta">
          <small>Effective available</small>
          <strong>{kes(effective)}</strong>
        </span>
        <span className="gm-wallet-balance-meta">
          <small>Pending outflows</small>
          <strong>{kes(pending)}</strong>
        </span>
      </div>
    </div>
  );
}