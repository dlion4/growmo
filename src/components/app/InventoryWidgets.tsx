/* ============================================================================
   PAGE 5 WIDGETS — Inputs & Inventory (/app/inventory)
   Reusable pieces shared by the inventory route: hero card, catalog card,
   stock meter and the three token-only charts (donut, bars, trend line).
   Styling comes from the master theme + dashboard.css + planner.css; the
   charts are inline SVG coloured with var(--gm-*) tokens only.
   ========================================================================== */
import {
  ArrowRight,
  Boxes,
  Leaf,
  MapPin,
  Package,
  ShoppingBasket,
  Store,
} from "lucide-react";
import type { ReactNode } from "react";
import type { CatalogItem } from "../../data/app/inventory";
import { CATEGORY_LABEL } from "../../data/app/inventory";
import { kes } from "../../data/site";
import { ProgressLine, StatusChip } from "./DashboardWidgets";
import { PlannerFact } from "./PlannerWidgets";

/* ---------------- hero ---------------- */

export interface InventoryKpi {
  label: string;
  value: string;
  note: string;
}

export function InventoryHeaderCard({
  kpis,
  actions,
}: {
  kpis: InventoryKpi[];
  actions: ReactNode;
}) {
  return (
    <header className="gm-card gm-plan-head">
      <div className="d-flex flex-wrap align-items-start gap-4">
        <div style={{ flex: "1 1 420px" }}>
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Page 5 · Input supply chain control
          </span>
          <h1 className="font-display mt-2">
            Know what to buy, what you hold, and what went into the soil
          </h1>
          <p className="gm-lead on-dark mb-0">
            Vifaa vyote shambani — catalog prices from Kiambu agro-vets, live
            stock levels, the AI purchase list for the next 14 days, and a
            spray-by-spray application record for every crop.
          </p>
        </div>
        <div className="gm-plan-hero-actions">{actions}</div>
      </div>

      <div className="gm-plan-kpi-row mt-4">
        {kpis.map((kpi) => (
          <PlannerFact
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            note={kpi.note}
          />
        ))}
      </div>
    </header>
  );
}

/* ---------------- catalog card ---------------- */

export function CatalogCard({
  item,
  unitPrice,
  onDetails,
  onCompare,
  onAdd,
}: {
  item: CatalogItem;
  unitPrice: number | null;
  onDetails: () => void;
  onCompare: () => void;
  onAdd: () => void;
}) {
  const headline = item.maturity
    ? `${item.maturity} · ${item.zones ?? "Nationwide"}`
    : item.target
      ? `${item.target} · PHI ${item.phi}`
      : item.use
        ? item.use
        : item.spec;

  return (
    <article className="gm-card p-3 h-100 d-flex flex-column">
      <div className="d-flex align-items-start gap-3">
        <span className="gm-mega-icon">
          <Package />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="gm-eyebrow">{CATEGORY_LABEL[item.category]}</span>
          <h3 className="font-display mb-1">{item.name}</h3>
          <p className="text-muted mb-0" style={{ fontSize: "0.84rem" }}>
            {item.spec} · {item.company}
          </p>
        </div>
      </div>

      <div className="gm-check-row mt-3">
        <Leaf />
        <span style={{ flex: 1 }}>
          <small>Best for</small>
          <strong>{headline}</strong>
        </span>
      </div>

      <div className="gm-plan-facts mt-2">
        <span>
          <Boxes />
          <small>Pack</small>
          <strong>{item.pack}</strong>
        </span>
        <span>
          <Store />
          <small>Agro-vets with stock</small>
          <strong>{item.suppliersWithStock}</strong>
        </span>
      </div>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
        <div>
          <small className="text-muted d-block">Market price</small>
          <strong className="font-display" style={{ fontSize: "1.1rem" }}>
            {item.priceMin === item.priceMax
              ? kes(item.priceMin)
              : `${kes(item.priceMin)}–${kes(item.priceMax).replace("KES ", "")}`}
          </strong>
        </div>
        <div className="d-flex flex-wrap gap-1">
          {item.organic ? <StatusChip label="Organic" tone="low" /> : null}
          {item.certified ? <StatusChip label="Certified" tone="low" /> : null}
          {item.phi ? (
            <StatusChip label={`PHI ${item.phi}`} tone="medium" />
          ) : null}
          {unitPrice ? (
            <StatusChip
              label={`Cheapest ${kes(unitPrice)}`}
              tone={unitPrice <= item.priceMin ? "low" : "neutral"}
            />
          ) : (
            <StatusChip label="Quote on request" tone="neutral" />
          )}
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mt-auto pt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onDetails}
        >
          Full spec <ArrowRight />
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onCompare}
        >
          Compare prices
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime gm-btn-sm"
          onClick={onAdd}
        >
          <ShoppingBasket /> Add to list
        </button>
      </div>
    </article>
  );
}

/* ---------------- stock meter ---------------- */

export function StockMeter({
  onHand,
  reorder,
  unit,
}: {
  onHand: number;
  reorder: number;
  unit: string;
}) {
  const target = Math.max(reorder, 1);
  const pct = Math.min(100, Math.round((onHand / (target * 2)) * 100));
  return (
    <div>
      <div className="d-flex justify-content-between align-items-baseline gap-2 mb-1">
        <strong className="font-display">
          {onHand} {unit}
        </strong>
        <small className="text-muted">
          reorder at {reorder} {unit}
        </small>
      </div>
      <ProgressLine value={pct} label={`${onHand} ${unit} on hand`} />
    </div>
  );
}

/* ---------------- donut chart ---------------- */

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
  note: string;
}

export function DonutChart({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: DonutSlice[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="d-flex flex-wrap align-items-center gap-4">
      <div
        className="gm-score-ring"
        style={{ width: 190, height: 190, flex: "0 0 190px" }}
      >
        <svg
          viewBox="0 0 140 140"
          width={190}
          height={190}
          role="img"
          aria-label={`Cost split: ${slices
            .map(
              (slice) =>
                `${slice.label} ${Math.round((slice.value / total) * 100)}%`,
            )
            .join(", ")}`}
        >
          {slices.map((slice) => {
            const length = (slice.value / total) * circumference;
            const dash = `${length} ${circumference - length}`;
            const current = offset;
            offset += length;
            return (
              <circle
                key={slice.id}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="16"
                strokeDasharray={dash}
                strokeDashoffset={-current}
                transform="rotate(-90 70 70)"
                style={{ transition: "stroke-dasharray .6s var(--gm-ease)" }}
              />
            );
          })}
        </svg>
        <div className="gm-score-center">
          <strong className="font-display">{centerValue}</strong>
          <small>{centerLabel}</small>
        </div>
      </div>

      <div style={{ flex: "1 1 260px" }}>
        {slices.map((slice) => (
          <div key={slice.id} className="gm-check-row">
            <span
              aria-hidden="true"
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: slice.color,
                marginTop: 4,
                flex: "0 0 14px",
              }}
            />
            <span style={{ flex: 1 }}>
              <strong>{slice.label}</strong>
              <small>{slice.note}</small>
            </span>
            <span className="text-end">
              <strong className="font-display d-block">
                {kes(slice.value)}
              </strong>
              <small className="text-muted">
                {Math.round((slice.value / total) * 100)}%
              </small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- bar chart ---------------- */

export interface BarRow {
  id: string;
  label: string;
  sub: string;
  value: number;
  highlight?: boolean;
}

export function BarChart({
  rows,
  unitLabel,
  formatValue,
}: {
  rows: BarRow[];
  unitLabel: string;
  formatValue: (value: number) => string;
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div>
      <div
        className="d-flex align-items-end gap-3"
        style={{ minHeight: 210, paddingTop: 8 }}
      >
        {rows.map((row) => (
          <div
            key={row.id}
            className="d-flex flex-column align-items-center"
            style={{ flex: "1 1 0", minWidth: 0 }}
          >
            <strong
              className="font-display mb-2"
              style={{ fontSize: "0.95rem" }}
            >
              {formatValue(row.value)}
            </strong>
            <div
              style={{
                width: "100%",
                maxWidth: 78,
                height: `${Math.max(8, Math.round((row.value / max) * 150))}px`,
                borderRadius: "12px 12px 4px 4px",
                background: row.highlight
                  ? "var(--gm-grad-primary)"
                  : "var(--gm-mint-200)",
                transition: "height .6s var(--gm-ease)",
              }}
            />
            <small
              className="d-block text-center mt-2"
              style={{ fontSize: "0.74rem", fontWeight: 800 }}
            >
              {row.label}
            </small>
            <small
              className="d-block text-center text-muted"
              style={{ fontSize: "0.7rem" }}
            >
              {row.sub}
            </small>
          </div>
        ))}
      </div>
      <p className="text-muted mb-0 mt-2" style={{ fontSize: "0.78rem" }}>
        {unitLabel}
      </p>
    </div>
  );
}

/* ---------------- trend line ---------------- */

export interface TrendPoint {
  label: string;
  value: number;
}

export function TrendChart({
  points,
  color = "var(--gm-leaf-600)",
  formatValue,
}: {
  points: TrendPoint[];
  color?: string;
  formatValue: (value: number) => string;
}) {
  const width = 560;
  const height = 210;
  const padX = 54;
  const padTop = 18;
  const padBottom = 34;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = (width - padX - 18) / Math.max(1, points.length - 1);
  const y = (value: number) =>
    padTop + (1 - (value - min) / span) * (height - padTop - padBottom);
  const coords = points.map((point, index) => ({
    x: padX + index * stepX,
    y: y(point.value),
    point,
  }));
  const line = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ display: "block" }}
        role="img"
        aria-label={`Price trend from ${points[0]?.label ?? ""} to ${points[points.length - 1]?.label ?? ""}`}
      >
        {gridLines.map((ratio) => {
          const gy = padTop + ratio * (height - padTop - padBottom);
          const value = Math.round(max - ratio * span);
          return (
            <g key={ratio}>
              <line
                x1={padX}
                x2={width - 12}
                y1={gy}
                y2={gy}
                stroke="var(--gm-line-soft)"
                strokeWidth="1"
              />
              <text
                x={padX - 8}
                y={gy + 4}
                textAnchor="end"
                fontSize="11"
                fontWeight="700"
                fill="var(--gm-ink-400)"
              >
                {value.toLocaleString("en-KE")}
              </text>
            </g>
          );
        })}
        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((coord) => (
          <g key={coord.point.label}>
            <circle
              cx={coord.x}
              cy={coord.y}
              r="5"
              fill="var(--gm-card)"
              stroke={color}
              strokeWidth="3"
            />
            <text
              x={coord.x}
              y={height - 12}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill="var(--gm-ink-400)"
            >
              {coord.point.label.replace(" 2026", "").replace(" 2027", "")}
            </text>
          </g>
        ))}
      </svg>
      <div className="d-flex flex-wrap gap-2 mt-2">
        {points.slice(-3).map((point) => (
          <span key={point.label} className="gm-chip">
            <MapPin /> {point.label}: {formatValue(point.value)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- sparkline ---------------- */

export function Sparkline({
  values,
  color = "var(--gm-leaf-600)",
}: {
  values: number[];
  color?: string;
}) {
  const width = 132;
  const height = 40;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = width / Math.max(1, values.length - 1);
  const coords = values.map((value, index) => ({
    x: index * stepX,
    y: 4 + (1 - (value - min) / span) * (height - 10),
  }));
  const line = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const area = `${line} ${width},${height} 0,${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Six month price trend"
    >
      <polygon points={area} fill="var(--gm-mint-100)" />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
