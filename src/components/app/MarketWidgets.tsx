/* ============================================================================
   PAGE 10 — Market & Sales widgets (reusable across the page)
   ========================================================================== */
import {
  ArrowRight,
  Check,
  Copy,
  Eye,
  Globe,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  type Buyer,
  type CropListing,
  type MarketRecommendation,
  type MarketTrend,
  type PriceTrendPoint,
  formatPrice,
} from "../../data/app/market";
import { StatusChip } from "./DashboardWidgets";

/* ── Mini sparkline chart for price trends ───────────────────────────────── */
export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "var(--gm-leaf-500)",
}: {
  data: PriceTrendPoint[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return null;
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const padding = 2;
  const w = width - padding * 2;
  const h = height - padding * 2;
  const points = data
    .map((d, i) => {
      const x = padding + (i / (data.length - 1)) * w;
      const y = padding + h - ((d.price - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Bar chart for market comparison ─────────────────────────────────────── */
export function MarketBarChart({
  rows,
  formatValue,
}: {
  rows: { label: string; value: number; sub?: string; highlight?: boolean }[];
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="gm-bar-chart">
      {rows.map((row) => (
        <div key={row.label} className="gm-bar-row">
          <div className="gm-bar-label">
            <strong>{row.label}</strong>
            {row.sub && <small>{row.sub}</small>}
          </div>
          <div className="gm-bar-track">
            <i
              className={`gm-bar-fill ${row.highlight ? "highlight" : ""}`}
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
          <span className="gm-bar-value font-display">
            {formatValue ? formatValue(row.value) : formatPrice(row.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Trend badge ─────────────────────────────────────────────────────────── */
export function TrendBadge({ trend }: { trend: MarketTrend }) {
  if (trend === "up") {
    return (
      <span className="gm-chip" style={{ background: "var(--gm-mint-100)", color: "var(--gm-leaf-700)" }}>
        <TrendingUp width={12} height={12} /> Rising
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="gm-chip" style={{ background: "rgba(198, 91, 59, 0.12)", color: "var(--gm-clay-500)" }}>
        <TrendingDown width={12} height={12} /> Falling
      </span>
    );
  }
  return (
    <span className="gm-chip">
      <TrendingUp width={12} height={12} style={{ opacity: 0.5 }} /> Stable
    </span>
  );
}

/* ── Buyer card ──────────────────────────────────────────────────────────── */
export function BuyerCard({
  buyer,
  onView,
  onContact,
}: {
  buyer: Buyer;
  onView: () => void;
  onContact: () => void;
}) {
  const Icon = buyer.icon;
  return (
    <div className="gm-card gm-buyer-card">
      <div className="gm-buyer-header">
        <span className="gm-mega-icon" style={{ background: buyer.hue, color: "#fff" }}>
          <Icon />
        </span>
        <div>
          <strong>{buyer.name}</strong>
          <small>{buyer.type} · {buyer.location}</small>
        </div>
        <span className="gm-buyer-rating">
          <Star width={14} height={14} fill="var(--gm-gold-500)" color="var(--gm-gold-500)" />
          {buyer.rating}
        </span>
      </div>
      <div className="gm-buyer-crops">
        {buyer.crops.slice(0, 3).map((c) => (
          <span key={c} className="gm-chip">{c}</span>
        ))}
        {buyer.crops.length > 3 && <span className="gm-chip">+{buyer.crops.length - 3}</span>}
      </div>
      <div className="gm-buyer-meta">
        <span><strong>Payment:</strong> {buyer.paymentTerms}</span>
        <span><strong>Orders:</strong> {buyer.totalOrders}</span>
      </div>
      <div className="gm-buyer-actions">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onView}>
          <Eye width={14} height={14} /> Profile
        </button>
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onContact}>
          <Phone width={14} height={14} /> Contact
        </button>
      </div>
    </div>
  );
}

/* ── Market Recommendation Row ───────────────────────────────────────────── */
export function RecommendationRow({
  rec,
  onOpen,
}: {
  rec: MarketRecommendation;
  onOpen: () => void;
}) {
  const Icon = rec.icon;
  return (
    <button type="button" className="gm-check-row" onClick={onOpen}>
      <span className="gm-mega-icon">
        <Icon />
      </span>
      <span style={{ flex: 1 }}>
        <strong>
          #{rec.rank} {rec.market}
          {rec.rank === 1 && (
            <span className="gm-chip gm-chip-lime" style={{ marginLeft: 8, fontSize: "0.68rem" }}>
              Best pick
            </span>
          )}
        </strong>
        <small>
          {rec.distanceKm} km · Net {formatPrice(rec.netPricePerHead)}/head · {rec.volumeDemand}
        </small>
      </span>
      <StatusChip
        label={formatPrice(rec.netPricePerHead)}
        tone={rec.rank === 1 ? "low" : rec.rank === 2 ? "medium" : "neutral"}
      />
    </button>
  );
}

/* ── Crop Listing Card (Portfolio) ───────────────────────────────────────── */
export function ListingCard({
  listing,
  onShare,
  onView,
}: {
  listing: CropListing;
  onShare: () => void;
  onView: () => void;
}) {
  return (
    <div className="gm-card p-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <strong style={{ fontSize: "1rem" }}>{listing.crop} — {listing.variety}</strong>
          <small className="d-block" style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>
            {listing.plot} · {listing.acreage}
          </small>
        </div>
        <StatusChip
          label={listing.status}
          tone={listing.status === "Active" ? "low" : listing.status === "Sold Out" ? "high" : "neutral"}
        />
      </div>
      <div className="gm-listing-stats">
        <div>
          <small>Expected</small>
          <strong>{listing.expectedHarvest}</strong>
        </div>
        <div>
          <small>Quantity</small>
          <strong>{listing.estimatedQuantity.toLocaleString("en-KE")} {listing.unit}</strong>
        </div>
        <div>
          <small>Ask price</small>
          <strong className="font-display">{formatPrice(listing.priceAsk)}/{listing.unit.split("/")[0]}</strong>
        </div>
        <div>
          <small>Views</small>
          <strong>{listing.views}</strong>
        </div>
      </div>
      <div className="d-flex gap-2 mt-2">
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onShare}>
          <Share2 width={14} height={14} /> Share link
        </button>
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onView}>
          <Eye width={14} height={14} /> Details
        </button>
      </div>
    </div>
  );
}

/* ── Scenario comparison row ─────────────────────────────────────────────── */
export function ScenarioRow({
  scenario,
  onOpen,
}: {
  scenario: { id: string; label: string; netRevenue: number; recommended: boolean; note: string };
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className={`gm-check-row ${scenario.recommended ? "gm-scenario-rec" : ""}`}
      onClick={onOpen}
    >
      <span className="gm-mega-icon" style={scenario.recommended ? { background: "var(--gm-grad-primary)", color: "#fff" } : undefined}>
        {scenario.recommended ? <Star /> : <MapPin />}
      </span>
      <span style={{ flex: 1 }}>
        <strong>
          {scenario.label}
          {scenario.recommended && (
            <span className="gm-chip gm-chip-lime" style={{ marginLeft: 8, fontSize: "0.68rem" }}>
              AI recommended
            </span>
          )}
        </strong>
        <small>{scenario.note}</small>
      </span>
      <span className="font-display" style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--gm-leaf-700)" }}>
        {formatPrice(scenario.netRevenue)}
      </span>
    </button>
  );
}