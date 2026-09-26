/* ============================================================================
   PAGE 21 WIDGETS — crop portfolios, buyer records and negotiation summaries.
   All presentation composes existing GrowMO dashboard and planner primitives.
   ========================================================================== */
import {
  BadgeCheck,
  CalendarDays,
  Eye,
  type LucideIcon,
  MapPin,
  PackageCheck,
  Share2,
  Sprout,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Buyer, Portfolio } from "../../data/app/orders";
import { kes } from "../../data/site";
import { StatusChip } from "./DashboardWidgets";

export function OrdersHero({
  metrics,
  actions,
}: {
  metrics: { icon: LucideIcon; label: string; value: string; note: string }[];
  actions: ReactNode;
}) {
  return (
    <header className="gm-card gm-plan-head">
      <div className="d-flex flex-wrap align-items-start gap-4">
        <div style={{ flex: "1 1 440px" }}>
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Page 21 · sell with confidence
          </span>
          <h1 className="font-display mt-2">
            A crop portfolio buyers can trust before harvest
          </h1>
          <p className="gm-lead on-dark mb-0">
            Show the record behind your crop, talk through a fair offer, and
            carry every order from inquiry to M-Pesa settlement. Soko iko wazi.
          </p>
        </div>
        <div className="gm-plan-hero-actions">{actions}</div>
      </div>
      <div className="gm-plan-kpi-row mt-4">
        {metrics.map((metric) => (
          <div
            className="gm-plan-facts"
            key={metric.label}
            style={{ minWidth: 168 }}
          >
            <span>
              <metric.icon />
              <small>{metric.label}</small>
              <strong className="font-display" style={{ fontSize: "1.15rem" }}>
                {metric.value}
              </strong>
              <small>{metric.note}</small>
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}

export function PortfolioCard({
  portfolio,
  onOpen,
  onEdit,
  onShare,
}: {
  portfolio: Portfolio;
  onOpen: () => void;
  onEdit: () => void;
  onShare: () => void;
}) {
  const tone =
    portfolio.state === "Live"
      ? "low"
      : portfolio.state === "Draft" || portfolio.state === "Paused"
        ? "medium"
        : "neutral";
  return (
    <article className="gm-card p-3 h-100 d-flex flex-column">
      <div className="d-flex align-items-start gap-3">
        <span className="gm-mega-icon">
          <Sprout />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="d-flex flex-wrap justify-content-between gap-2">
            <span className="gm-eyebrow">{portfolio.id}</span>
            <StatusChip label={portfolio.state} tone={tone} />
          </div>
          <h3 className="font-display mb-1">
            {portfolio.crop} · {portfolio.variety}
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: "0.82rem" }}>
            {portfolio.plot} · {portfolio.acreage}
          </p>
        </div>
      </div>
      <div className="gm-plan-facts mt-3">
        <span>
          <CalendarDays />
          <small>Harvest</small>
          <strong>{portfolio.harvest}</strong>
        </span>
        <span>
          <PackageCheck />
          <small>Available</small>
          <strong className="font-display">
            {portfolio.available.toLocaleString()} {portfolio.unit}
          </strong>
        </span>
        <span>
          <BadgeCheck />
          <small>Grade A</small>
          <strong>{portfolio.gradeA}% expected</strong>
        </span>
        <span>
          <Eye />
          <small>Link views</small>
          <strong>{portfolio.linkViews}</strong>
        </span>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-auto pt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onOpen}
        >
          Open portfolio
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onEdit}
        >
          Edit
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime gm-btn-sm"
          onClick={onShare}
        >
          <Share2 /> Share
        </button>
      </div>
    </article>
  );
}

export function OrderMetric({
  icon: Icon,
  label,
  value,
  note,
  action,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  action?: ReactNode;
}) {
  return (
    <div className="gm-card p-3 h-100">
      <div className="d-flex gap-3 align-items-start">
        <span className="gm-mega-icon">
          <Icon />
        </span>
        <div style={{ flex: 1 }}>
          <small className="text-muted d-block">{label}</small>
          <strong
            className="font-display d-block"
            style={{ fontSize: "1.25rem" }}
          >
            {value}
          </strong>
          <small className="text-muted d-block mt-1">{note}</small>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function BuyerSummaryRow({
  buyer,
  onOpen,
  onRate,
}: {
  buyer: Buyer;
  onOpen: () => void;
  onRate: () => void;
}) {
  return (
    <div className="gm-check-row">
      <span className="gm-mega-icon">
        <MapPin />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <strong>{buyer.name}</strong>
        <small>
          {buyer.company} · {buyer.location} · {buyer.phone}
        </small>
      </span>
      <span className="text-end">
        <strong className="font-display d-block">
          {kes(buyer.totalSpent)}
        </strong>
        <small>
          {buyer.rating} · {buyer.orders} orders
        </small>
      </span>
      <span className="d-flex gap-2">
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onOpen}
        >
          Profile
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onRate}
        >
          Rate
        </button>
      </span>
    </div>
  );
}

export function PhotoTile({
  caption,
  date,
  kind,
  onOpen,
}: {
  caption: string;
  date: string;
  kind: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="gm-card p-3 text-start w-100 h-100"
      onClick={onOpen}
    >
      <div className="d-flex align-items-start gap-3">
        <span className="gm-mega-icon">
          <Eye />
        </span>
        <span style={{ flex: 1 }}>
          <small className="text-muted d-block">{kind}</small>
          <strong className="d-block">{caption}</strong>
          <small className="text-muted d-block mt-1">{date}</small>
        </span>
      </div>
    </button>
  );
}
