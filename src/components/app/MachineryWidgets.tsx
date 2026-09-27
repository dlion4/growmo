/* ============================================================================
   PAGE 20 — MACHINERY & EQUIPMENT MANAGEMENT  (shared widgets)
   Tables for the registry, maintenance, usage, hire, fuel and asset data,
   plus the hero band and the fuel-efficiency chart.
   ========================================================================== */

import {
  Car,
  Droplets,
  Fan,
  FileDown,
  Hand,
  Package,
  ShieldCheck,
  Truck,
  Warehouse,
  Wrench,
} from "lucide-react";
import {
  DEPRECIATION,
  type DepRow,
  type Equipment,
  EQUIPMENT,
  EQUIPMENT_TOTAL_VALUE,
  type FuelEffRow,
  FUEL_LOG,
  FUEL_MONTH_TOTAL,
  type FuelRow,
  type HireInRow,
  type HireOutRow,
  type MaintRow,
  MAINT_STATUS_TONE,
  MACH_CONTEXT,
  type MarketListing,
  type RateCardRow,
  type UsageAnalyticsRow,
  type UsageRow,
} from "../../data/app/machinery";
import { kes } from "../../data/site";
import { ProgressLine, StatusChip } from "./DashboardWidgets";

/* ---------- helpers ---------- */

export function eqById(id?: string): Equipment {
  return EQUIPMENT.find((e) => e.id === id) ?? EQUIPMENT[0];
}

export function categoryIcon(category: string) {
  if (category === "Tractor") return <Car size={15} />;
  if (category === "Implement") return <Wrench size={15} />;
  if (category === "Irrigation") return <Droplets size={15} />;
  if (category === "Processing") return <Fan size={15} />;
  if (category === "Transport") return <Truck size={15} />;
  if (category === "Structure") return <Warehouse size={15} />;
  if (category === "Storage") return <Warehouse size={15} />;
  return <Package size={15} />;
}

export function statusTone(status: string): "high" | "medium" | "low" | "neutral" {
  if (status === "Operational") return "low";
  if (status === "Partially deployed") return "neutral";
  if (status === "Needs servicing") return "medium";
  if (status === "Under repair") return "high";
  return "neutral"; // In storage
}

export function conditionTone(c: string): "high" | "medium" | "low" | "neutral" {
  if (c === "New" || c === "Good") return "low";
  if (c === "Fair") return "medium";
  return "high";
}

/* ---------- hero ---------- */

export function MachHero({ onExport }: { onExport: () => void }) {
  return (
    <header className="gm-mach-hero">
      <div>
        <span className="gm-eyebrow">
          <Wrench size={13} />
          Machinery &amp; equipment · {MACH_CONTEXT.village}, {MACH_CONTEXT.county}
        </span>
        <h1 className="font-display gm-mach-hero-title">
          {EQUIPMENT.length} machines &amp; tools — {kes(EQUIPMENT_TOTAL_VALUE)}
        </h1>
        <p className="gm-lead mb-0">
          {MACH_CONTEXT.farm} · diesel {kes(MACH_CONTEXT.dieselPrice)}/L · {MACH_CONTEXT.today}
        </p>
      </div>
      <div className="gm-mach-hero-actions">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onExport}>
          <FileDown size={14} /> Export asset report
        </button>
      </div>
    </header>
  );
}

/* ---------- 20.1 registry table ---------- */

export function EquipTable({
  rows,
  onOpen,
  onEdit,
}: {
  rows: Equipment[];
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  return (
    <div className="gm-table-wrap">
      <table className="gm-table">
        <caption className="gm-table-caption">
          Equipment registry · {rows.length} item{rows.length === 1 ? "" : "s"} shown
        </caption>
        <thead>
          <tr>
            <th>ID</th>
            <th>Equipment</th>
            <th>Category</th>
            <th>Condition</th>
            <th>Value (KES)</th>
            <th>Status</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id} className="gm-row-link" onClick={() => onOpen(e.id)}>
              <td><strong>{e.id}</strong></td>
              <td>
                <span className="gm-mach-eqname">
                  <span className="gm-mach-cat-ic">{categoryIcon(e.category)}</span>
                  <span>
                    <strong>{e.name}</strong>
                    <small>{e.make}</small>
                  </span>
                </span>
              </td>
              <td>
                {e.category}
                <small>{e.subCategory}</small>
              </td>
              <td><StatusChip label={e.condition} tone={conditionTone(e.condition)} /></td>
              <td>{kes(e.valueListed)}</td>
              <td><StatusChip label={e.status} tone={statusTone(e.status)} /></td>
              <td>
                <span className="gm-row-actions">
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={(ev) => { ev.stopPropagation(); onOpen(e.id); }}>
                    Open
                  </button>
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={(ev) => { ev.stopPropagation(); onEdit(e.id); }}>
                    Edit
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="gm-avg-row">
            <td colSpan={4}>
              <strong>Total ({EQUIPMENT.length} items)</strong>
            </td>
            <td colSpan={2}>
              <strong>{kes(EQUIPMENT_TOTAL_VALUE)}</strong>
            </td>
            <td aria-label="Actions" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ---------- 20.2 maintenance table ---------- */

export function MaintTable({
  rows,
  onOpen,
  onDone,
}: {
  rows: MaintRow[];
  onOpen: (m: MaintRow) => void;
  onDone: (m: MaintRow) => void;
}) {
  return (
    <div className="gm-table-wrap">
      <table className="gm-table">
        <caption className="gm-table-caption">
          Maintenance schedule · {rows.length} tasks ·{" "}
          {rows.filter((r) => r.status === "Overdue").length} overdue
        </caption>
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Service</th>
            <th>Frequency</th>
            <th>Last done</th>
            <th>Next due</th>
            <th>Est. cost</th>
            <th>Assigned to</th>
            <th>Status</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id} className="gm-row-link" onClick={() => onOpen(m)}>
              <td>
                <strong>{eqById(m.equipmentId).name}</strong>
                <small>{m.equipmentId}</small>
              </td>
              <td>{m.service}</td>
              <td>{m.frequency}</td>
              <td>{m.lastDone}</td>
              <td>{m.nextDue}</td>
              <td>{m.cost === 0 ? "Free" : kes(m.cost)}</td>
              <td>{m.assigned}</td>
              <td><StatusChip label={m.status} tone={MAINT_STATUS_TONE[m.status]} /></td>
              <td>
                <span className="gm-row-actions">
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={(ev) => { ev.stopPropagation(); onOpen(m); }}>
                    Open
                  </button>
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={(ev) => { ev.stopPropagation(); onDone(m); }}>
                    Mark done
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- 20.3 usage log + analytics ---------- */

export function UsageTable({ rows, onOpen }: { rows: UsageRow[]; onOpen: (u: UsageRow) => void }) {
  return (
    <div className="gm-table-wrap">
      <table className="gm-table">
        <caption className="gm-table-caption">Usage log · newest first</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Equipment</th>
            <th>Activity</th>
            <th>Hours</th>
            <th>Fuel (L)</th>
            <th>Operator</th>
            <th>Plot</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="gm-row-link" onClick={() => onOpen(u)}>
              <td><strong>{u.date}</strong></td>
              <td>{eqById(u.equipmentId).name}</td>
              <td>{u.activity}</td>
              <td>{u.hours} hrs</td>
              <td>{u.fuelL > 0 ? u.fuelL : "—"}</td>
              <td>{u.operator}</td>
              <td>{u.plot}</td>
              <td>{u.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UsageAnalyticsTable({ rows }: { rows: UsageAnalyticsRow[] }) {
  return (
    <div className="gm-table-wrap">
      <table className="gm-table">
        <caption className="gm-table-caption">Usage analytics · October 2026</caption>
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Hours this month</th>
            <th>Hours this year</th>
            <th>Fuel cost (KES)</th>
            <th>Maintenance cost</th>
            <th>Cost / hour</th>
            <th>Revenue attributed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.equipmentId}>
              <td><strong>{r.label}</strong></td>
              <td>{r.hoursMonth}</td>
              <td>{r.hoursYear}</td>
              <td>
                {r.fuelCost > 0 ? kes(r.fuelCost) : r.fuelNote}
                <small>{r.fuelNote !== "—" ? r.fuelNote : ""}</small>
              </td>
              <td>{kes(r.maintCost)}</td>
              <td>
                <strong>{kes(r.costHour)}</strong>
              </td>
              <td>{r.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- 20.4 hire tables + rate card ---------- */

export function HireInTable({ rows, onOpen }: { rows: HireInRow[]; onOpen: (h: HireInRow) => void }) {
  const pending = rows.filter((r) => r.paid === "Pending").reduce((s, r) => s + r.totalCost, 0);
  return (
    <div className="gm-table-wrap">
      <table className="gm-table gm-table-sm">
        <caption className="gm-table-caption">
          Hire in · {rows.reduce((s, r) => s + r.totalCost, 0) > 0 && `total ${kes(rows.reduce((s, r) => s + r.totalCost, 0))}`}
          {pending > 0 ? ` · ${kes(pending)} pending` : ""}
        </caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Equipment</th>
            <th>Owner</th>
            <th>Rate</th>
            <th>Duration</th>
            <th>Total</th>
            <th>Purpose</th>
            <th>Paid</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => (
            <tr key={h.id} className="gm-row-link" onClick={() => onOpen(h)}>
              <td><strong>{h.date}</strong></td>
              <td>{h.equipment}</td>
              <td>
                {h.owner}
                <small>{h.ownerPhone}</small>
              </td>
              <td>{h.rate}</td>
              <td>{h.duration}</td>
              <td>{kes(h.totalCost)}</td>
              <td>{h.purpose}</td>
              <td>
                <StatusChip
                  label={h.paid === "Pending" ? "Pending" : `✅ ${h.paid}`}
                  tone={h.paid === "Pending" ? "medium" : "low"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HireOutTable({
  rows,
  onOpen,
  onCollect,
}: {
  rows: HireOutRow[];
  onOpen: (h: HireOutRow) => void;
  onCollect: (h: HireOutRow) => void;
}) {
  return (
    <div className="gm-table-wrap">
      <table className="gm-table gm-table-sm">
        <caption className="gm-table-caption">
          Hire out · {kes(rows.reduce((s, r) => s + r.income, 0))} earned this season
        </caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Equipment</th>
            <th>Hirer</th>
            <th>Rate</th>
            <th>Duration</th>
            <th>Income</th>
            <th>Paid</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => (
            <tr key={h.id} className="gm-row-link" onClick={() => onOpen(h)}>
              <td><strong>{h.date}</strong></td>
              <td>
                {eqById(h.equipmentId).name}
                <small>{h.equipmentId}</small>
              </td>
              <td>
                {h.hirer}
                <small>{h.hirerPhone}</small>
              </td>
              <td>{h.rate}</td>
              <td>{h.duration}</td>
              <td>
                <strong>{kes(h.income)}</strong>
              </td>
              <td>
                <StatusChip
                  label={h.paid}
                  tone={h.paid === "Family, no charge" ? "neutral" : h.paid === "M-Pesa" ? "low" : "low"}
                />
              </td>
              <td>
                {h.status === "Completed" ? (
                  <StatusChip label="Completed" tone="low" />
                ) : (
                  <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={(ev) => { ev.stopPropagation(); onCollect(h); }}>
                    Collect
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RateCardTable({
  rows,
  onEdit,
  onAdd,
}: {
  rows: RateCardRow[];
  onEdit: (r: RateCardRow) => void;
  onAdd: () => void;
}) {
  return (
    <div className="gm-table-wrap">
      <table className="gm-table gm-table-sm">
        <caption className="gm-table-caption">
          Rate card — set by you · shown on your GrowMO profile
          <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm gm-caption-btn" onClick={onAdd}>
            + Add rate
          </button>
        </caption>
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Rate type</th>
            <th>Rate</th>
            <th>Min hire</th>
            <th>Includes</th>
            <th>Location</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="gm-row-link" onClick={() => onEdit(r)}>
              <td>
                <strong>{r.label}</strong>
                <small>{r.equipmentId}</small>
              </td>
              <td>{r.rateType}</td>
              <td>
                <strong>{kes(r.rate)}</strong>
                <small>/{r.rateType.replace("Per ", "").replace(" hour", "hr")}</small>
              </td>
              <td>{r.minHire}</td>
              <td>{r.includes}</td>
              <td>{r.location}</td>
              <td>
                <span className="gm-row-actions">
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={(ev) => { ev.stopPropagation(); onEdit(r); }}>
                    Edit
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- 20.5 fuel tables ---------- */

export function FuelTable({ rows, onOpen }: { rows: FuelRow[]; onOpen: (f: FuelRow) => void }) {
  return (
    <div className="gm-table-wrap">
      <table className="gm-table gm-table-sm">
        <caption className="gm-table-caption">Fuel log · October 2026 · diesel {kes(MACH_CONTEXT.dieselPrice)}/L at Githunguri</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Fuel type</th>
            <th>Quantity</th>
            <th>Price / L</th>
            <th>Total</th>
            <th>Equipment</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => (
            <tr key={f.id} className="gm-row-link" onClick={() => onOpen(f)}>
              <td><strong>{f.date}</strong></td>
              <td>{f.fuelType}</td>
              <td>{f.litres} L</td>
              <td>{kes(f.pricePerL)}</td>
              <td>{kes(f.total)}</td>
              <td>{eqById(f.equipmentId).name}</td>
              <td>
                <StatusChip label={f.receipt === "—" ? "—" : "📷 Receipt"} tone={f.receipt === "—" ? "neutral" : "low"} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="gm-avg-row">
            <td colSpan={2}>
              <strong>Month total ({FUEL_MONTH_TOTAL.month})</strong>
            </td>
            <td>
              <strong>{FUEL_MONTH_TOTAL.litres} L</strong>
            </td>
            <td aria-label="Price" />
            <td>
              <strong>{kes(FUEL_MONTH_TOTAL.total)}</strong>
            </td>
            <td aria-label="Equipment" />
            <td aria-label="Receipt" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function FuelEffTable({ rows }: { rows: FuelEffRow[] }) {
  return (
    <div className="gm-table-wrap">
      <table className="gm-table gm-table-sm">
        <caption className="gm-table-caption">Fuel efficiency vs standard ({MACH_CONTEXT.standardFuelLph} L/hr for the MF 35)</caption>
        <thead>
          <tr>
            <th>Period</th>
            <th>Total fuel (L)</th>
            <th>Total hours</th>
            <th>L / hour</th>
            <th>Cost / hour</th>
            <th>vs standard</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.period}>
              <td><strong>{r.period}</strong></td>
              <td>{r.litres}</td>
              <td>{r.hours}</td>
              <td>
                <strong>{r.lph}</strong>
              </td>
              <td>{kes(r.costPerHour)}</td>
              <td>
                <StatusChip label={r.vsStd} tone={r.tone} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EffChart({ rows }: { rows: FuelEffRow[] }) {
  const max = Math.max(...rows.map((r) => parseFloat(r.lph)), MACH_CONTEXT.standardFuelLph) * 1.15;
  return (
    <div className="gm-eff-chart" role="img" aria-label="Fuel use per hour by month compared with the 5 litre standard">
      <div className="gm-eff-std" style={{ bottom: `${(MACH_CONTEXT.standardFuelLph / max) * 100}%` }}>
        <span>standard {MACH_CONTEXT.standardFuelLph} L/hr</span>
      </div>
      {rows.map((r) => {
        const v = parseFloat(r.lph);
        return (
          <div key={r.period} className="gm-eff-col">
            <strong className="gm-eff-val">{r.lph}</strong>
            <i
              className={`gm-eff-bar ${r.tone}`}
              style={{ height: `${(v / max) * 100}%` }}
              title={`${r.period}: ${r.lph} L/hr`}
            />
            <span className="gm-eff-label">{r.period}</span>
            <small className="gm-eff-sub">{r.litres} L · {r.hours} hrs</small>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- 20.6 depreciation table ---------- */

export function DepTable({ rows, onOpen }: { rows: DepRow[]; onOpen: (id: string) => void }) {
  const totals = rows.reduce(
    (a, r) => ({ purchase: a.purchase + r.purchasePrice, book: a.book + r.bookValue, market: a.market + r.marketValue }),
    { purchase: 0, book: 0, market: 0 },
  );
  return (
    <div className="gm-table-wrap">
      <table className="gm-table">
        <caption className="gm-table-caption">
          Depreciation &amp; asset valuation · straight line · 4 tracked assets
        </caption>
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Purchase price</th>
            <th>Purchased</th>
            <th>Useful life</th>
            <th>Annual depreciation</th>
            <th>Current age</th>
            <th>Current value (market)</th>
            <th>Book value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.equipmentId} className="gm-row-link" onClick={() => onOpen(r.equipmentId)}>
              <td>
                <strong>{r.name}</strong>
                <small>{r.equipmentId}</small>
              </td>
              <td>{kes(r.purchasePrice)}</td>
              <td>{r.purchaseDate}</td>
              <td>{r.usefulLife} yrs</td>
              <td>{kes(r.annualDep)}</td>
              <td>{r.ageYears} yrs</td>
              <td>
                <strong>{kes(r.marketValue)}</strong>
              </td>
              <td>
                {kes(r.bookValue)}
                <small>
                  <ProgressLine value={Math.round((r.bookValue / r.purchasePrice) * 100)} label={`${r.name} book value kept`} />
                </small>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="gm-avg-row">
            <td>
              <strong>Tracked total</strong>
            </td>
            <td>
              <strong>{kes(totals.purchase)}</strong>
            </td>
            <td colSpan={3} aria-label="Spans" />
            <td aria-label="Age" />
            <td>
              <strong>{kes(totals.market)}</strong>
            </td>
            <td>
              <strong>{kes(totals.book)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ---------- marketplace listing card ---------- */

export function ListingCard({
  l,
  onOpen,
  onPause,
  onDelist,
}: {
  l: MarketListing;
  onOpen: () => void;
  onPause?: () => void;
  onDelist: () => void;
}) {
  const e = eqById(l.equipmentId);
  return (
    <div className={`gm-listing-card ${l.status === "Active" ? "" : "is-paused"}`}>
      <span className="gm-listing-photo">{categoryIcon(e.category)}</span>
      <div className="gm-listing-main">
        <strong>{l.title}</strong>
        <small>
          {l.rate} · listed {l.listed}
        </small>
        <div className="gm-listing-stats">
          <span>
            <ShieldCheck size={12} /> {l.views} views
          </span>
          <span>
            <Hand size={12} /> {l.bookings} bookings
          </span>
          <StatusChip label={l.status} tone={l.status === "Active" ? "low" : "neutral"} />
        </div>
      </div>
      <div className="gm-listing-actions">
        <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={onOpen}>
          Details
        </button>
        {onPause && l.status === "Active" && (
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onPause}>
            Pause
          </button>
        )}
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onDelist}>
          Delist
        </button>
      </div>
    </div>
  );
}

/* re-export data used by the route for totals */
export { DEPRECIATION, FUEL_LOG };
