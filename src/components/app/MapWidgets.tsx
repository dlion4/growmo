/* ============================================================================
   PAGE 19 — FARM MAPPING & PLOT MANAGEMENT  (shared widgets)

   FarmMap is a crafted SVG of Mary's Farm (Githunguri, Kiambu):
   800×520 viewBox, ~420 m wide, 7 toggleable layers, clickable plots,
   pins, soil points, structures, trees, roads, stream, irrigation lines.
   Satellite/terrain = two CSS background treatments of the same geometry.
   ========================================================================== */

import {
  Compass,
  Crosshair,
  Droplets,
  FileDown,
  Footprints,
  Home,
  Layers,
  Map as MapIcon,
  MapPin,
  Mountain,
  Ruler,
  Satellite,
  ScanLine,
  Sun,
  TreePine,
  Triangle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DISTANCE_PRESETS,
  FARM_BOUNDARY,
  IRRIGATION_LINES,
  type MapLayer,
  type MapView,
  PINS,
  ROAD_PATH,
  SOIL_POINTS,
  STREAM_PATH,
  STRUCTURES,
  type Plot,
  type PhotoRow,
  PLOTS,
  type CompareRow,
  type MeasureTool,
  TREES,
} from "../../data/app/map";
import { kes } from "../../data/site";
import { ProgressLine, StatusChip } from "./DashboardWidgets";

/* ---------- helpers ---------- */

export function plotFillClass(p: Plot): string {
  return `gm-plot-shape gm-plot-${p.color}`;
}

const px2m = 1 / (800 / 420); // meters per SVG px

export function svgDistM(ax: number, ay: number, bx: number, by: number): number {
  return Math.round(Math.hypot(bx - ax, by - ay) * px2m);
}

/* hexagon loop used by the "walk the boundary" simulation */
export const WALK_LOOP: [number, number][] = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return [Math.round(660 + Math.cos(a) * 58), Math.round(402 + Math.sin(a) * 46)] as [
    number,
    number,
  ];
});
export const WALK_PERIMETER_M = Math.round(WALK_LOOP.length * 34);

/* ---------- 19.1 FarmMap (SVG centerpiece) ---------- */

export function FarmMap({
  view,
  layers,
  selectedId,
  onPlotOpen,
  onPinOpen,
  onSoilOpen,
  onMapTap,
}: {
  view: MapView;
  layers: string[];
  selectedId: string | null;
  onPlotOpen: (id: string) => void;
  onPinOpen: (id: string) => void;
  onSoilOpen: (id: string) => void;
  onMapTap: (x: number, y: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tap = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 800);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 520);
    onMapTap(x, y);
  };
  return (
    <div className={`gm-map-frame gm-view-${view}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 800 520"
        className="gm-map-svg"
        role="img"
        aria-label="Map of Mary's Farm, Githunguri — 4 plots, water, trees and structures"
        onClick={tap}
      >
        <rect x="0" y="0" width="800" height="520" className="gm-map-bg" />
        {/* elevation contour hints (terrain flavour) */}
        <g className="gm-map-contours" aria-hidden="true">
          <path d="M60,300 C220,250 420,255 760,300" fill="none" />
          <path d="M55,380 C230,330 460,335 765,375" fill="none" />
          <path d="M70,200 C260,150 520,155 755,195" fill="none" />
        </g>

        <polygon
          points={FARM_BOUNDARY}
          className="gm-farm-boundary"
          aria-label="Farm boundary"
        />

        {/* plots */}
        {layers.includes("plots") && (
          <g>
            {PLOTS.map((p) => (
              <g
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={`${p.id} ${p.name} — open plot dashboard`}
                className={`gm-plot-g ${selectedId === p.id ? "is-selected" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlotOpen(p.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPlotOpen(p.id);
                  }
                }}
              >
                <polygon points={p.poly} className={plotFillClass(p)} />
                <text x={p.label[0]} y={p.label[1] - 4} className="gm-plot-label">
                  {p.id}
                </text>
                <text x={p.label[0]} y={p.label[1] + 12} className="gm-plot-sub">
                  {p.areaAc} ac · {p.crop.split(" (")[0]}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* roads */}
        {layers.includes("roads") && (
          <g aria-hidden="true">
            <path d={ROAD_PATH} className="gm-road" fill="none" />
            <path d={ROAD_PATH} className="gm-road-dash" fill="none" />
          </g>
        )}

        {/* stream + irrigation (water layer) */}
        {layers.includes("water") && (
          <g aria-hidden="true">
            <path d={STREAM_PATH} className="gm-stream" fill="none" />
            {IRRIGATION_LINES.map((d, i) => (
              <path key={i} d={d} className="gm-irrigation" fill="none" />
            ))}
          </g>
        )}

        {/* trees + structures */}
        {layers.includes("trees") && (
          <g aria-hidden="true">
            {TREES.map((t, i) => (
              <circle key={i} cx={t.x} cy={t.y} r={t.r} className="gm-tree" />
            ))}
            {STRUCTURES.map((s) => (
              <g key={s.id}>
                <rect
                  x={s.x}
                  y={s.y}
                  width={s.w}
                  height={s.h}
                  className="gm-structure"
                />
                <text x={s.x + s.w / 2} y={s.y - 4} className="gm-structure-label" textAnchor="middle">
                  {s.label}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* soil sample points */}
        {layers.includes("soil") && (
          <g>
            {SOIL_POINTS.map((sp) => (
              <g
                key={sp.id}
                role="button"
                tabIndex={0}
                aria-label={`Soil point ${sp.id} — pH ${sp.ph}`}
                className="gm-soil-g"
                onClick={(e) => {
                  e.stopPropagation();
                  onSoilOpen(sp.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSoilOpen(sp.id);
                  }
                }}
              >
                <circle cx={sp.x} cy={sp.y} r="9" className="gm-soil-ring" />
                <circle cx={sp.x} cy={sp.y} r="4" className="gm-soil-dot" />
              </g>
            ))}
          </g>
        )}

        {/* measurements layer */}
        {layers.includes("measure") && (
          <g aria-hidden="true">
            {DISTANCE_PRESETS.map((d) => (
              <g key={d.id}>
                <line x1={d.a[0]} y1={d.a[1]} x2={d.b[0]} y2={d.b[1]} className="gm-measure-line" />
                <circle cx={d.a[0]} cy={d.a[1]} r="3" className="gm-measure-dot" />
                <circle cx={d.b[0]} cy={d.b[1]} r="3" className="gm-measure-dot" />
                <text
                  x={(d.a[0] + d.b[0]) / 2 + 6}
                  y={(d.a[1] + d.b[1]) / 2 - 6}
                  className="gm-measure-label"
                >
                  {d.m} m
                </text>
              </g>
            ))}
          </g>
        )}

        {/* problem pins */}
        {layers.includes("problems") && (
          <g>
            {PINS.map((pin) => (
              <g
                key={pin.id}
                role="button"
                tabIndex={0}
                aria-label={`Problem pin ${pin.id} — ${pin.severity}, ${pin.status}`}
                className="gm-pin-g"
                onClick={(e) => {
                  e.stopPropagation();
                  onPinOpen(pin.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPinOpen(pin.id);
                  }
                }}
              >
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r="13"
                  className={`gm-pin-halo gm-pin-${pin.severity.toLowerCase()}`}
                />
                <path
                  d={`M${pin.x - 8},${pin.y + 8} L${pin.x},${pin.y - 9} L${pin.x + 8},${pin.y + 8} Z`}
                  className={`gm-pin-tri gm-pin-${pin.severity.toLowerCase()}`}
                />
                <circle cx={pin.x} cy={pin.y + 1} r="2.6" className="gm-pin-hole" />
              </g>
            ))}
          </g>
        )}

        {/* compass + scale bar */}
        <g className="gm-map-compass" aria-hidden="true">
          <circle cx="756" cy="48" r="18" className="gm-compass-ring" />
          <path d="M756,34 L761,52 L756,47 L751,52 Z" className="gm-compass-needle" />
          <text x="756" y="30" className="gm-compass-n" textAnchor="middle">
            N
          </text>
        </g>
        <g className="gm-scalebar" aria-hidden="true">
          <line x1="620" y1="498" x2="715" y2="498" className="gm-scale-line" />
          <line x1="620" y1="493" x2="620" y2="503" className="gm-scale-line" />
          <line x1="715" y1="493" x2="715" y2="503" className="gm-scale-line" />
          <text x="667" y="490" className="gm-scale-text" textAnchor="middle">
            50 m
          </text>
        </g>
      </svg>
      <div className="gm-map-view-badge">
        {view === "satellite" ? <Satellite /> : <Mountain />}
        <span>{view === "satellite" ? "Satellite · Sep 2026" : "Terrain · contours"}</span>
      </div>
    </div>
  );
}

/* ---------- 19.1 map controls ---------- */

export function LayerToggles({
  layers,
  onToggle,
}: {
  layers: MapLayer[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="gm-layer-list" aria-label="Map layers">
      <div className="gm-layer-head">
        <Layers size={15} />
        <span>Layers</span>
      </div>
      {layers.map((l) => (
        <button
          key={l.id}
          type="button"
          className={`gm-layer-item ${l.on ? "on" : ""}`}
          aria-pressed={l.on}
          onClick={() => onToggle(l.id)}
        >
          <span className={`gm-layer-dot ${l.on ? "is-on" : ""}`} />
          <span className="gm-layer-name">{l.name}</span>
          <small>{l.desc}</small>
        </button>
      ))}
    </div>
  );
}

export function ViewModeToggle({
  view,
  onChange,
}: {
  view: MapView;
  onChange: (v: MapView) => void;
}) {
  return (
    <div className="gm-view-toggle" role="group" aria-label="Map view mode">
      <button
        type="button"
        className={view === "satellite" ? "on" : ""}
        aria-pressed={view === "satellite"}
        onClick={() => onChange("satellite")}
      >
        <Satellite size={14} /> Satellite
      </button>
      <button
        type="button"
        className={view === "terrain" ? "on" : ""}
        aria-pressed={view === "terrain"}
        onClick={() => onChange("terrain")}
      >
        <Mountain size={14} /> Terrain
      </button>
    </div>
  );
}

/* ---------- mini-tabs (19.3 plot dashboard) ---------- */

export type PlotTabId =
  | "overview"
  | "weather"
  | "soil"
  | "tasks"
  | "labour"
  | "inputs"
  | "finance"
  | "photos"
  | "history"
  | "notes";

export const PLOT_TABS: { id: PlotTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "weather", label: "Weather" },
  { id: "soil", label: "Soil" },
  { id: "tasks", label: "Tasks" },
  { id: "labour", label: "Labour" },
  { id: "inputs", label: "Inputs" },
  { id: "finance", label: "Finance" },
  { id: "photos", label: "Photos" },
  { id: "history", label: "History" },
  { id: "notes", label: "Notes" },
];

export function MiniTabs<T extends string>({
  value,
  items,
  onChange,
  label,
}: {
  value: T;
  items: { id: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="gm-minitabs" role="tablist" aria-label={label}>
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          className={value === t.id ? "on" : ""}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- 19.2 creation method card + walk simulation ---------- */

export function MethodCard({
  name,
  how,
  accuracy,
  bestFor,
  icon,
  active,
  onPick,
}: {
  name: string;
  how: string;
  accuracy: string;
  bestFor: string;
  icon: React.ReactNode;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      className={`gm-method-card ${active ? "on" : ""}`}
      aria-pressed={active}
      onClick={onPick}
    >
      <span className="gm-method-icon">{icon}</span>
      <span className="gm-method-main">
        <strong>{name}</strong>
        <small>{how}</small>
      </span>
      <span className="gm-method-meta">
        <StatusChip label={accuracy} tone="neutral" />
        <small>{bestFor}</small>
      </span>
    </button>
  );
}

export function WalkSimBox({
  onDone,
  onAbort,
}: {
  onDone: (summary: string) => void;
  onAbort: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "fixing" | "walking" | "done">("idle");
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (phase === "fixing") {
      const t = setTimeout(() => setPhase("walking"), 1800);
      return () => clearTimeout(t);
    }
    if (phase === "walking") {
      const total = WALK_LOOP.length * 8; // 8 ticks per side
      const t = setInterval(() => {
        setStep((s) => {
          const n = s + 1;
          if (n >= total) {
            clearInterval(t);
            setPct(100);
            setPhase("done");
            return total;
          }
          setPct(Math.round((n / total) * 100));
          return n;
        });
      }, 110);
      return () => clearInterval(t);
    }
    return;
  }, [phase]);

  const seg = Math.floor((step % WALK_LOOP.length) * 8 / 8);
  const dot = WALK_LOOP[seg % WALK_LOOP.length];

  return (
    <div className="gm-walksim">
      <div className="gm-walksim-stage">
        <svg viewBox="540 330 260 150" className="gm-walksim-svg" aria-hidden="true">
          <rect x="540" y="330" width="260" height="150" className="gm-map-bg" />
          <polygon
            points={WALK_LOOP.map((p) => p.join(",")).join(" ")}
            className={`gm-walk-path ${phase === "done" ? "is-done" : ""}`}
          />
          {phase !== "idle" && (
            <circle cx={dot[0]} cy={dot[1]} r="7" className="gm-walk-dot" />
          )}
        </svg>
        {phase === "idle" && (
          <div className="gm-walksim-idle">
            <Footprints size={22} />
            <span>Stand at the NW corner, face east, and start.</span>
          </div>
        )}
      </div>
      <div className="gm-walksim-status">
        {phase === "idle" && (
          <>
            <p>
              Walk the full perimeter with the map open and your phone's GPS on. GrowMO
              records every step; the polygon closes automatically.
            </p>
            <div className="gm-walksim-actions">
              <button type="button" className="gm-btn gm-btn-lime" onClick={() => setPhase("fixing")}>
                <Footprints size={15} /> Start walking
              </button>
            </div>
          </>
        )}
        {phase === "fixing" && (
          <>
            <p className="gm-walk-fx">Fixing GPS… keep the phone upright, 3 satellite lock in a
            moment.</p>
            <ProgressLine value={45} label="GPS fixing" />
          </>
        )}
        {phase === "walking" && (
          <>
            <p className="gm-walk-fx">
              Recording boundary… {pct}% · {Math.round((WALK_PERIMETER_M * pct) / 100)} m walked
            </p>
            <ProgressLine value={pct} label="Walk progress" />
            <div className="gm-walksim-actions">
              <button type="button" className="gm-btn gm-btn-ghost" onClick={onAbort}>
                Abort walk
              </button>
            </div>
          </>
        )}
        {phase === "done" && (
          <>
            <p className="gm-walk-done">
              Boundary recorded — 12 points, {WALK_PERIMETER_M} m perimeter, 0.21 ac. Polygon
              closed automatically.
            </p>
            <div className="gm-walksim-actions">
              <button type="button" className="gm-btn gm-btn-lime" onClick={() => onDone(`Walk boundary: 12 points, ${WALK_PERIMETER_M} m, 0.21 ac`)}>
                Accept boundary
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- 19.7 elevation profile chart ---------- */

export function ElevationChart({
  points,
  label,
  note,
}: {
  points: number[];
  label: string;
  note: string;
}) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const W = 300;
  const H = 96;
  const pad = 8;
  const coords = points.map((v, i) => {
    const x = pad + (i / (points.length - 1)) * (W - pad * 2);
    const y = pad + (1 - (v - min) / (max - min || 1)) * (H - pad * 2);
    return [Math.round(x), Math.round(y)] as const;
  });
  const path = coords.map((c) => c.join(",")).join(" ");
  return (
    <figure className="gm-elev-chart">
      <figcaption>
        <Mountain size={14} />
        <span>{label}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="gm-elev-svg" aria-label={`Elevation profile ${label}`}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} className="gm-elev-axis" />
        <polyline points={path} className="gm-elev-line" fill="none" />
        {coords.map((c, i) => (
          <circle key={i} cx={c[0]} cy={c[1]} r="2.4" className="gm-elev-pt" />
        ))}
        <text x={pad} y={12} className="gm-elev-val">
          {max.toLocaleString()} m
        </text>
        <text x={W - pad} y={H - 16} className="gm-elev-val" textAnchor="end">
          {min.toLocaleString()} m
        </text>
      </svg>
      <p>{note}</p>
    </figure>
  );
}

/* ---------- 19.7 sun exposure chart ---------- */

export function SunChart({ rows }: { rows: { plot: string; dec: string; jun: string; note: string }[] }) {
  const hours = (s: string) => parseFloat(s);
  return (
    <div className="gm-sun-chart">
      <div className="gm-sun-legend">
        <Sun size={14} />
        <span>Full-sun hours by plot · Dec vs Jun</span>
      </div>
      {rows.map((r) => (
        <div key={r.plot} className="gm-sun-row">
          <span className="gm-sun-plot">{r.plot}</span>
          <div className="gm-sun-bars">
            <div className="gm-sun-bar-line">
              <i style={{ width: `${(hours(r.dec) / 8) * 100}%` }} className="gm-sun-dec" />
              <em>{r.dec}</em>
            </div>
            <div className="gm-sun-bar-line">
              <i style={{ width: `${(hours(r.jun) / 8) * 100}%` }} className="gm-sun-jun" />
              <em>{r.jun}</em>
            </div>
          </div>
          <small className="gm-sun-note">{r.note}</small>
        </div>
      ))}
    </div>
  );
}

/* ---------- 19.3 photo grid ---------- */

export function PhotoGrid({ photos }: { photos: PhotoRow[] }) {
  const iconFor = (k: PhotoRow["kind"]) =>
    k === "crop" ? <TreePine size={18} /> : k === "problem" ? <MapPin size={18} /> : <Home size={18} />;
  return (
    <div className="gm-photo-grid">
      {photos.map((p) => (
        <figure key={p.id} className={`gm-photo-card gm-photo-${p.kind}`}>
          <span className="gm-photo-thumb">{iconFor(p.kind)}</span>
          <figcaption>
            <strong>{p.caption}</strong>
            <small>{p.date}</small>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ---------- 19.5 pin row ---------- */

export function PinRow({
  pin,
  onOpen,
  onResolve,
}: {
  pin: import("../../data/app/map").ProblemPin;
  onOpen: () => void;
  onResolve?: () => void;
}) {
  return (
    <div className={`gm-pin-row sev-${pin.severity.toLowerCase()}`}>
      <span className="gm-pin-row-ic">
        <MapPin size={16} />
      </span>
      <div className="gm-pin-row-main">
        <strong>
          {pin.id} · {pin.issue}
        </strong>
        <small>
          {pin.plotId} — {pin.location} · pinned {pin.date}
        </small>
      </div>
      <div className="gm-pin-row-meta">
        <StatusChip
          label={pin.severity}
          tone={pin.severity === "High" ? "high" : pin.severity === "Medium" ? "medium" : "low"}
        />
        <StatusChip label={pin.status} tone={pin.status === "Resolved" ? "low" : "medium"} />
      </div>
      <div className="gm-pin-row-actions">
        <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={onOpen}>
          Open
        </button>
        {onResolve && pin.status !== "Resolved" ? (
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onResolve}>
            Resolve
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- 19.7 tool cards ---------- */

export function ToolCard({ tool, onUse }: { tool: MeasureTool; onUse: () => void }) {
  const icon =
    tool.kind === "distance" ? (
      <Ruler />
    ) : tool.kind === "area" ? (
      <Crosshair />
    ) : tool.kind === "elevation" ? (
      <ScanLine />
    ) : tool.kind === "slope" ? (
      <Triangle />
    ) : (
      <Sun />
    );
  return (
    <div className="gm-tool-card">
      <span className="gm-tool-icon">{icon}</span>
      <div className="gm-tool-main">
        <strong>{tool.name}</strong>
        <small>{tool.how}</small>
        <em>{tool.use}</em>
      </div>
      <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onUse}>
        Open tool
      </button>
    </div>
  );
}

/* ---------- 19.4 plot overview table ---------- */

export function PlotTable({
  onOpen,
  onCompare,
  onEdit,
}: {
  onOpen: (id: string) => void;
  onCompare: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const totals = useMemo(
    () => ({
      ac: PLOTS.reduce((s, p) => s + p.areaAc, 0),
      budget: PLOTS.reduce((s, p) => s + p.budget, 0),
      spent: PLOTS.reduce((s, p) => s + p.spent, 0),
      tasks: PLOTS.reduce((s, p) => s + p.tasksToday, 0),
    }),
    [],
  );
  return (
    <div className="gm-table-wrap">
      <table className="gm-table">
        <caption className="gm-table-caption">
          All 4 plots · {MAP_TOTALS.ac} ac under management · SR 2026
        </caption>
        <thead>
          <tr>
            <th>Plot</th>
            <th>Crop & stage</th>
            <th>Area</th>
            <th>Health</th>
            <th>Budget → spent</th>
            <th>Tasks today</th>
            <th>Soil pH</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {PLOTS.map((p) => (
            <tr key={p.id} className="gm-row-link" onClick={() => onOpen(p.id)}>
              <td>
                <span className={`gm-dot gm-dot-${p.color}`} />
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.id}</small>
                </span>
              </td>
              <td>
                {p.crop}
                <small>{p.stage} · {p.daysLeft}</small>
              </td>
              <td>
                {p.areaAc} ac
                <small>{p.areaHa} ha</small>
              </td>
              <td className="gm-td-bar">
                <ProgressLine value={p.health} label={`${p.id} health`} />
                <small>{p.health}/100</small>
              </td>
              <td>
                {kes(p.budget)}
                <small>{kes(p.spent)} spent</small>
              </td>
              <td>{p.tasksToday > 0 ? `${p.tasksToday} open` : "—"}</td>
              <td>{p.soilPh.toFixed(1)}</td>
              <td>
                <span className="gm-row-actions">
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={(e) => { e.stopPropagation(); onOpen(p.id); }}>
                    Open
                  </button>
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={(e) => { e.stopPropagation(); onEdit(p.id); }}>
                    Edit
                  </button>
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={(e) => { e.stopPropagation(); onCompare(p.id); }}>
                    Compare
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>
              <strong>Farm total</strong>
            </td>
            <td>
              <strong>{totals.ac} ac</strong>
            </td>
            <td aria-label="Health total">—</td>
            <td>
              <strong>{kes(totals.budget)}</strong>
              <small>{kes(totals.spent)} spent</small>
            </td>
            <td>
              <strong>{totals.tasks} open</strong>
            </td>
            <td aria-label="pH total">—</td>
            <td aria-label="Actions" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const MAP_TOTALS = { ac: "2.92" };

/* ---------- 19.6 comparison table ---------- */

export function CompareTable({
  rows,
  avg,
  onOpen,
}: {
  rows: CompareRow[];
  avg: { costAc: number; revAc: number; roi: string; soilScore: number };
  onOpen: (id: string) => void;
}) {
  return (
    <div className="gm-table-wrap">
      <table className="gm-table">
        <caption className="gm-table-caption">
          Same season, side by side · cost & revenue per acre · ROI
        </caption>
        <thead>
          <tr>
            <th>Plot</th>
            <th>Cost / acre</th>
            <th>Est. revenue / acre</th>
            <th>ROI</th>
            <th>Soil score</th>
            <th>Labour efficiency</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.plotId} className="gm-row-link" onClick={() => onOpen(r.plotId)}>
              <td>
                <strong>{r.plotName}</strong>
                <small>{r.plotId}</small>
              </td>
              <td>{kes(r.costAc)}</td>
              <td>{kes(r.revAc)}</td>
              <td>
                <span className="gm-roi">{r.roi}</span>
              </td>
              <td className="gm-td-bar">
                <ProgressLine value={r.soilScore} label={`${r.plotId} soil score`} />
                <small>{r.soilScore}/100</small>
              </td>
              <td>{r.efficiency}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="gm-avg-row">
            <td>
              <strong>Farm average</strong>
            </td>
            <td>{kes(avg.costAc)}</td>
            <td>{kes(avg.revAc)}</td>
            <td>
              <span className="gm-roi">{avg.roi}</span>
            </td>
            <td>{avg.soilScore}/100</td>
            <td>weighted by plot size</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ---------- hero / context band ---------- */

export function MapHero({ onExport }: { onExport: () => void }) {
  return (
    <header className="gm-map-hero">
      <div className="gm-map-hero-main">
        <span className="gm-eyebrow">
          <MapIcon size={13} />
          {MAP_HERO.eyebrow}
        </span>
        <h1 className="font-display gm-map-hero-title">{MAP_HERO.title}</h1>
        <p className="gm-lead mb-0">{MAP_HERO.sub}</p>
      </div>
      <div className="gm-map-hero-stats">
        <span className="gm-hero-chip">
          <Mountain size={14} />
          {MAP_HERO.elevation}
        </span>
        <span className="gm-hero-chip">
          <Droplets size={14} />
          Borehole + stream + tank
        </span>
        <span className="gm-hero-chip">
          <Compass size={14} />
          Mostly south-facing
        </span>
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onExport}>
          <FileDown size={14} />
          Export farm report
        </button>
      </div>
    </header>
  );
}

const MAP_HERO = {
  eyebrow: "Farm map · Githunguri, Kiambu · title deed GTH/1234",
  title: "Mary's Farm — 2.92 ac, four plots",
  sub: "Digital survey 2024 · short-rains season (SR 2026) · today Tue 17/11/2026",
  elevation: "1,785 – 1,800 m",
};

