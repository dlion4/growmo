/* ============================================================================
   PAGE 10 — MARKET & SALES (/app/market)  — reusable widgets
   ========================================================================== */
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  Car,
  Clock,
  Download,
  ExternalLink,
  Eye,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";
import type { ReactNode } from "react";
import { kes } from "../../data/site";
import type {
  Buyer,
  Contract,
  CropPriceRow,
  MarketRecommendation,
  SaleRecord,
  SalesScenario,
  TrendPoint,
} from "../../data/app/market";
import { ProgressLine, StatusChip } from "./DashboardWidgets";

/* ---------- Hero ---------- */

export function MarketHero({
  score,
  ytd,
  target,
  topMarket,
  children,
}: {
  score: number;
  ytd: number;
  target: number;
  topMarket: string;
  children?: ReactNode;
}) {
  const pct = Math.min(100, Math.round((ytd / target) * 100));
  return (
    <div className="gm-mk-hero">
      <div className="gm-mk-hero-head">
        <div className="gm-mk-hero-copy">
          <span className="gm-chip gm-chip-live">
            <span className="gm-dot-live" /> LIVE · KAMIS feed 09:14
          </span>
          <h1 className="font-display">Market &amp; Sales</h1>
          <p className="gm-lead mb-0">
            Live wholesale prices across 8 Kenyan markets, AI-ranked net returns
            after transport and cess, a verified buyer directory and
            contract-farming opportunities — so you harvest into the best price.
          </p>
          <div className="gm-mk-hero-chips">
            <span className="gm-chip">
              <MapPin width={13} height={13} /> Based: Githunguri, Kiambu
            </span>
            <span className="gm-chip">
              <Clock width={13} height={13} /> Next harvest: 15 Jan
            </span>
            <span className="gm-chip">
              <ShieldCheck width={13} height={13} /> 12 KES-verified buyers
            </span>
          </div>
        </div>
        <div className="gm-mk-hero-score">
          <div className="gm-mk-hero-score-num">
            <strong>{score}</strong>
            <small>/ 100</small>
          </div>
          <div className="gm-mk-hero-score-label">
            <strong>Market readiness</strong>
            <small>{topMarket} top net market · 4 alerts live</small>
            <span className="gm-mk-hero-score-link">See scoring factors →</span>
          </div>
        </div>
      </div>
      <div className="gm-mk-hero-grid">
        <div className="gm-stat">
          <span className="gm-mega-icon">
            <TrendingUp />
          </span>
          <strong className="gm-stat-value font-display">{kes(ytd)}</strong>
          <span className="gm-stat-label">Net sales YTD</span>
          <div className="gm-stat-progress">
            <ProgressLine value={pct} label="Sales vs target" />
            <small>{pct}% of {kes(target)} target</small>
          </div>
        </div>
        <div className="gm-stat">
          <span className="gm-mega-icon">
            <Building2 />
          </span>
          <strong className="gm-stat-value font-display">10</strong>
          <span className="gm-stat-label">Verified buyers contacted</span>
          <small>3 with active orders · 1 overdue invoice</small>
        </div>
        <div className="gm-stat">
          <span className="gm-mega-icon">
            <Award />
          </span>
          <strong className="gm-stat-value font-display">2</strong>
          <span className="gm-stat-label">Open contracts</span>
          <small>Kakuzi applied · 4 more match your crops</small>
        </div>
        <div className="gm-stat">
          <span className="gm-mega-icon">
            <Truck />
          </span>
          <strong className="gm-stat-value font-display">{kes(0.5)}</strong>
          <span className="gm-stat-label">Transport / head (Thika)</span>
          <small>Best net · 15 km · co-op lorries Tue/Fri</small>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ---------- 10.1 price grid row ---------- */

export function PriceRow({
  crop,
  markets,
  onCropClick,
  onMarketClick,
}: {
  crop: CropPriceRow;
  markets: { market: string; marketShort: string }[];
  onCropClick: (crop: CropPriceRow) => void;
  onMarketClick: (crop: CropPriceRow, market: string) => void;
}) {
  return (
    <tr className="gm-mk-price-row">
      <td className="gm-mk-crop-cell">
        <button type="button" className="gm-mk-crop-btn" onClick={() => onCropClick(crop)}>
          <span className="gm-mk-crop-icon">{crop.icon}</span>
          <span className="gm-mk-crop-name">
            <strong>{crop.crop}</strong>
            <small>{crop.swahili} · per {crop.unit}</small>
          </span>
        </button>
      </td>
      {markets.map((m) => {
        const [low, high] = crop.prices[m.market] ?? [0, 0];
        const isBest = high === Math.max(...markets.map((mm) => (crop.prices[mm.market] ?? [0, 0])[1]));
        return (
          <td key={m.market} className="gm-mk-price-cell">
            <button
              type="button"
              className={`gm-mk-price-link ${isBest ? "is-best" : ""}`}
              onClick={() => onMarketClick(crop, m.market)}
              title={`${low}–${high} KES · click for detail`}
            >
              <span className="gm-mk-price-range">
                {typeof low === "number" && low >= 100 ? `${low.toLocaleString("en-KE")}–${high.toLocaleString("en-KE")}` : `${low}–${high}`}
              </span>
              {isBest ? <small className="gm-mk-best-tag">Best</small> : null}
            </button>
          </td>
        );
      })}
      <td className="gm-mk-trend-cell">
        <span className={`gm-mk-trend gm-mk-trend-${crop.trend}`}>
          {crop.trend === "up" ? <TrendingUp width={14} height={14} /> : crop.trend === "down" ? <TrendingDown width={14} height={14} /> : "↔"}
          {crop.changePct > 0 ? "+" : ""}
          {crop.changePct}%
        </span>
      </td>
    </tr>
  );
}

/* ---------- Trend chart (ASCII but stylised) ---------- */

export function PriceTrendChart({
  points,
  highlight,
  onPointClick,
}: {
  points: TrendPoint[];
  highlight?: string;
  onPointClick: (p: TrendPoint) => void;
}) {
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices) - 3;
  const max = Math.max(...prices) + 3;
  const rows = 8;
  return (
    <div className="gm-mk-chart">
      <div className="gm-mk-chart-body">
        {Array.from({ length: rows }).map((_, ri) => {
          const v = max - ((max - min) * ri) / (rows - 1);
          return (
            <div key={ri} className="gm-mk-chart-row">
              <span className="gm-mk-chart-y">{Math.round(v)}</span>
              <div className="gm-mk-chart-track">
                {points.map((p) => {
                  const h = ((p.price - min) / (max - min)) * 100;
                  const isHi = highlight === p.month;
                  return (
                    <button
                      key={p.month}
                      type="button"
                      className={`gm-mk-chart-bar ${isHi ? "is-on" : ""}`}
                      style={{ height: `${h}%` }}
                      onClick={() => onPointClick(p)}
                      aria-label={`${p.month}: KES ${p.price}`}
                    >
                      <span className="gm-mk-chart-tip">
                        {p.month} · KES {p.price}
                        {p.note ? ` · ${p.note}` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="gm-mk-chart-x">
          {points.map((p) => (
            <span key={p.month}>{p.monthShort}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Best-market recommendation row ---------- */

export function RecommendationRow({
  rec,
  onOpen,
}: {
  rec: MarketRecommendation;
  onOpen: (rec: MarketRecommendation) => void;
}) {
  const pct = Math.round((rec.netPricePerHead / 33) * 100);
  return (
    <button type="button" className={`gm-mk-rec gm-mk-rec-${rec.verdict}`} onClick={() => onOpen(rec)}>
      <div className="gm-mk-rec-rank">#{rec.rank}</div>
      <div className="gm-mk-rec-main">
        <div className="gm-mk-rec-head">
          <strong>{rec.market}</strong>
          {rec.verdict === "best" ? (
            <span className="gm-chip gm-chip-lime">AI pick</span>
          ) : rec.verdict === "higher" ? (
            <span className="gm-chip gm-chip-gold">Higher price</span>
          ) : rec.verdict === "far" ? (
            <span className="gm-chip gm-risk gm-risk-low">Too far</span>
          ) : (
            <span className="gm-chip">Similar</span>
          )}
        </div>
        <div className="gm-mk-rec-meta">
          <span><Car width={12} height={12} /> {rec.distanceKm} km</span>
          <span>Reliability {rec.reliabilityScore}★</span>
          <span>Volume {rec.volumeScore}/10</span>
        </div>
        <div className="gm-mk-rec-note">{rec.note}</div>
        <div className="gm-mk-rec-bar">
          <ProgressLine value={Math.min(100, pct)} label={`Net KES ${rec.netPricePerHead}`} />
        </div>
      </div>
      <div className="gm-mk-rec-net">
        <small>Net / head</small>
        <strong>KES {rec.netPricePerHead.toFixed(2)}</strong>
        <ArrowRight />
      </div>
    </button>
  );
}

/* ---------- Buyer card ---------- */

export function BuyerCard({
  buyer,
  onOpen,
  onContact,
}: {
  buyer: Buyer;
  onOpen: (b: Buyer) => void;
  onContact: (b: Buyer) => void;
}) {
  return (
    <div className="gm-mk-buyer">
      <div className="gm-mk-buyer-head">
        <div className={`gm-mk-buyer-ava gm-mk-buyer-${buyer.type.toLowerCase().replace(/\s/g, "-")}`}>
          {buyer.name.charAt(0)}
        </div>
        <div className="gm-mk-buyer-ident">
          <strong>{buyer.name}</strong>
          <small>
            {buyer.type} · <MapPin width={11} height={11} /> {buyer.location}
            {buyer.verified ? <BadgeCheck width={12} height={12} className="gm-mk-v" /> : null}
          </small>
        </div>
        <span className="gm-mk-buyer-rating">
          <Star width={12} height={12} fill="currentColor" /> {buyer.rating}
        </span>
      </div>
      <div className="gm-mk-buyer-body">
        <div className="gm-mk-buyer-crops">{buyer.cropsWanted.slice(0, 3).map((c) => (
          <span key={c} className="gm-chip gm-chip-ghost">{c}</span>
        ))}{buyer.cropsWanted.length > 3 ? <span className="gm-chip gm-chip-ghost">+{buyer.cropsWanted.length - 3}</span> : null}</div>
        <div className="gm-mk-buyer-kv">
          <span><strong>Min qty:</strong> {buyer.minQuantity}</span>
          <span><strong>Terms:</strong> {buyer.paymentTerms}</span>
        </div>
        {buyer.lastOrder ? (
          <small className="gm-mk-buyer-last">Last order {buyer.lastOrder}{buyer.totalSpent ? ` · ${kes(buyer.totalSpent)} YTD` : ""}</small>
        ) : null}
      </div>
      <div className="gm-mk-buyer-foot">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onOpen(buyer)}>
          <Eye width={14} height={14} /> View
        </button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onContact(buyer)}>
          <Phone width={14} height={14} /> Contact
        </button>
      </div>
    </div>
  );
}

/* ---------- Sales scenario card ---------- */

export function ScenarioCard({
  s,
  onOpen,
}: {
  s: SalesScenario;
  onOpen: (s: SalesScenario) => void;
}) {
  return (
    <button
      type="button"
      className={`gm-mk-scenario ${s.aiPick ? "is-pick" : ""}`}
      onClick={() => onOpen(s)}
    >
      <div className="gm-mk-scenario-head">
        <strong>{s.label}</strong>
        {s.aiPick ? <span className="gm-chip gm-chip-lime"><Award width={12} height={12} /> AI pick</span> : <StatusChip label={s.risk} tone={s.risk === "low" ? "high" : s.risk === "high" ? "low" : "medium"} />}
      </div>
      <small className="gm-mk-scenario-sw">{s.swahili}</small>
      <div className="gm-mk-scenario-figures">
        <div><span className="gm-mk-fig-label">Net revenue</span><strong>{kes(s.netRevenue)}</strong></div>
        <div><span className="gm-mk-fig-label">vs baseline</span>
          <strong className={s.vsBaseline >= 0 ? "up" : "down"}>{s.vsBaseline > 0 ? "+" : ""}{kes(s.vsBaseline)}</strong>
        </div>
        <div><span className="gm-mk-fig-label">Price/head</span><strong>{kes(s.pricePerHead)}</strong></div>
      </div>
      <div className="gm-mk-scenario-note">{s.note}</div>
      <div className="gm-mk-scenario-foot">
        <Download width={14} height={14} /> Open breakdown <ArrowRight />
      </div>
    </button>
  );
}

/* ---------- Sales record row ---------- */

export function SaleRow({
  sale,
  onOpen,
}: {
  sale: SaleRecord;
  onOpen: (s: SaleRecord) => void;
}) {
  const tone = sale.paymentStatus === "Received" ? "high" : sale.paymentStatus === "Overdue" ? "low" : sale.paymentStatus === "Partial" ? "medium" : "neutral";
  return (
    <tr className="gm-mk-sale-row" onClick={() => onOpen(sale)}>
      <td>
        <div className="gm-mk-sale-date">
          <strong>{sale.date.split(" ")[0]}</strong>
          <small>{sale.date.split(" ").slice(1).join(" ")}</small>
        </div>
      </td>
      <td>
        <strong>{sale.crop}</strong>
        <small>{sale.variety} · {sale.plot}</small>
      </td>
      <td>{sale.quantity.toLocaleString("en-KE")} {sale.unit}{sale.quantity > 1 ? "s" : ""}</td>
      <td>{kes(sale.pricePerUnit)}</td>
      <td><strong>{kes(sale.totalAmount)}</strong></td>
      <td>{sale.buyer.split(",")[0]}</td>
      <td>
        <span className="gm-mk-pay">
          {sale.paymentMethod}{sale.mpesaReceipt ? ` · ${sale.mpesaReceipt.slice(0, 6)}…` : ""}
        </span>
      </td>
      <td><StatusChip label={sale.paymentStatus} tone={tone} /></td>
      <td><strong>{kes(sale.netIncome)}</strong></td>
      <td><span className="gm-chip gm-grade">{sale.qualityGrade}</span></td>
      <td><button type="button" className="gm-icon-btn" onClick={(e) => { e.stopPropagation(); onOpen(sale); }}><ExternalLink width={15} height={15} /></button></td>
    </tr>
  );
}

/* ---------- Contract card ---------- */

export function ContractCard({
  c,
  onApply,
  onView,
}: {
  c: Contract;
  onApply: (c: Contract) => void;
  onView: (c: Contract) => void;
}) {
  return (
    <div className="gm-mk-contract">
      <div className="gm-mk-contract-head">
        <div className="gm-mk-contract-co">{c.company.charAt(0)}</div>
        <div>
          <strong>{c.title}</strong>
          <small>{c.company} · {c.duration} · <MapPin width={11} height={11} /> {c.countyMatch ? "Kiambu match" : "Out of county"}</small>
        </div>
        {c.status === "applied" ? <span className="gm-chip gm-chip-gold">Applied</span> : c.status === "awarded" ? <span className="gm-chip gm-chip-lime">Awarded</span> : c.status === "rejected" ? <span className="gm-chip gm-risk gm-risk-low">Rejected</span> : <span className="gm-chip gm-chip-lime">Open</span>}
      </div>
      <div className="gm-mk-contract-body">
        <div className="gm-mk-contract-row">
          <span className="gm-mk-contract-k">Crop</span><span>{c.crop} ({c.variety})</span>
        </div>
        <div className="gm-mk-contract-row">
          <span className="gm-mk-contract-k">Acreage</span><span>{c.acreage}</span>
        </div>
        <div className="gm-mk-contract-row">
          <span className="gm-mk-contract-k">Price</span>
          <strong className="gm-mk-price-k">{c.priceGuarantee}</strong>
        </div>
        <div className="gm-mk-contract-row">
          <span className="gm-mk-contract-k">Deadline</span><span>{c.applicationDeadline}</span>
        </div>
        <div className="gm-mk-reqs">
          {c.requirements.slice(0, 3).map((r) => (
            <span key={r} className="gm-chip gm-chip-ghost">{r}</span>
          ))}
          {c.requirements.length > 3 ? <span className="gm-chip gm-chip-ghost">+{c.requirements.length - 3}</span> : null}
        </div>
      </div>
      <div className="gm-mk-contract-foot">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onView(c)}>
          <Eye width={14} height={14} /> Details
        </button>
        {c.status === "open" ? (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onApply(c)}>
            Apply <ArrowRight />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- KV list ---------- */

export function MarketKv({ items, columns = 1 }: { items: { k: string; v: ReactNode; tone?: "good" | "warn" | "bad" }[]; columns?: 1 | 2 }) {
  return (
    <div className={`gm-mk-kv ${columns === 2 ? "is-2" : ""}`}>
      {items.map((it) => (
        <div key={it.k} className={`gm-mk-kv-row ${it.tone ? `is-${it.tone}` : ""}`}>
          <span className="gm-mk-kv-k">{it.k}</span>
          <span className="gm-mk-kv-v">{it.v}</span>
        </div>
      ))}
    </div>
  );
}

export function MarketCallout({ tone = "info", children }: { tone?: "info" | "warn" | "good"; children: ReactNode }) {
  return <div className={`gm-mk-callout tone-${tone}`}>{children}</div>;
}

export function MarketEmpty({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="gm-empty">
      <div className="gm-empty-art">🥬</div>
      <h4>{title}</h4>
      {sub ? <p>{sub}</p> : null}
      {action}
    </div>
  );
}
