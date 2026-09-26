/* ============================================================================
   PAGE 19 — FARM MAPPING & PLOT MANAGEMENT  (29 modal kinds)

   plot · create · walk · tap · dims · coords · upload · registry ·
   edit-plot · add-pin · pin · resolve-pin · weather · soil · soil-point ·
   soil-test · tasks · labour · inputs · finance · photos · history · notes ·
   distance · area · elevation · slope · sun · export
   ========================================================================== */

import {
  Banknote,
  Camera,
  Check,
  CircleCheck,
  Cloud,
  CloudRain,
  CloudSun,
  Crosshair,
  FileDown,
  FileJson,
  FileSpreadsheet,
  Footprints,
  Globe,
  Landmark,
  MapPin,
  Mountain,
  NotebookPen,
  Package,
  PenLine,
  Pencil,
  Plus,
  Ruler,
  ScanSearch,
  Search,
  ShieldCheck,
  Sprout,
  Sun,
  Thermometer,
  Trash2,
  Upload,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog, PinPad, ScoreRing, Stepper } from "../auth/controls";
import {
  DashboardDrawer,
  ProgressLine,
  StatusChip,
  WizardActions,
} from "./DashboardWidgets";
import {
  CREATE_METHODS,
  type CreateMethod,
  DISTANCE_PRESETS,
  ELEVATION_PROFILES,
  FARM_BOUNDARY,
  PINS,
  PLOT_COLORS,
  PLOT_FINANCE,
  PLOT_HISTORY,
  PLOT_INPUTS,
  PLOT_LABOUR,
  PLOT_NOTES,
  PLOT_PHOTOS,
  PLOT_TASKS,
  type Plot,
  type PlotColor,
  type ProblemPin,
  PLOTS,
  ROAD_PATH,
  SOIL_POINTS,
  type SoilPoint,
  SOIL_TRENDS,
  SLOPE_PRESETS,
  STREAM_PATH,
  SUN_EXPOSURE,
  TREES,
  WEATHER,
  type ForecastDay,
} from "../../data/app/map";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";
import {
  ElevationChart,
  MethodCard,
  MiniTabs,
  PhotoGrid,
  PLOT_TABS,
  type PlotTabId,
  SunChart,
  WalkSimBox,
  svgDistM,
} from "./MapWidgets";

/* ---------- shared state type (29 kinds) ---------- */

export type ModalKind =
  | "plot"
  | "create"
  | "walk"
  | "tap"
  | "dims"
  | "coords"
  | "upload"
  | "registry"
  | "edit-plot"
  | "add-pin"
  | "pin"
  | "resolve-pin"
  | "weather"
  | "soil"
  | "soil-point"
  | "soil-test"
  | "tasks"
  | "labour"
  | "inputs"
  | "finance"
  | "photos"
  | "history"
  | "notes"
  | "distance"
  | "area"
  | "elevation"
  | "slope"
  | "sun"
  | "export";

export interface ModalState {
  kind: ModalKind;
  plotId?: string;
  pinId?: string;
  soilId?: string;
  methodId?: string;
  presetId?: string;
  boundary?: string;
  startStep?: number;
}

export const MODAL_TITLES: Record<ModalKind, string> = {
  plot: "Plot dashboard",
  create: "New plot",
  walk: "Walk the boundary",
  tap: "Tap points on the map",
  dims: "Enter dimensions",
  coords: "GPS coordinate entry",
  upload: "Upload survey file",
  registry: "Import from land registry",
  "edit-plot": "Edit plot",
  "add-pin": "Pin a problem area",
  pin: "Problem pin",
  "resolve-pin": "Mark pin as resolved",
  weather: "7-day weather",
  soil: "Soil report",
  "soil-point": "Soil sample point",
  "soil-test": "Request a soil test",
  tasks: "Plot tasks",
  labour: "Labour on plot",
  inputs: "Inputs & materials",
  finance: "Plot finance",
  photos: "Plot photos",
  history: "Crop history",
  notes: "Field notes",
  distance: "Distance measure",
  area: "Area measure",
  elevation: "Elevation profile",
  slope: "Slope calculator",
  sun: "Sun exposure",
  export: "Export farm report",
};

const plotOf = (id?: string): Plot => PLOTS.find((p) => p.id === id) ?? PLOTS[0];
const pinOf = (id?: string): ProblemPin => PINS.find((p) => p.id === id) ?? PINS[0];
const soilOf = (id?: string): SoilPoint =>
  SOIL_POINTS.find((s) => s.id === id) ?? SOIL_POINTS[0];
const methodOf = (id?: string): CreateMethod =>
  CREATE_METHODS.find((m) => m.id === id) ?? CREATE_METHODS[0];

/* ---------- tiny shared UI ---------- */

export function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="gm-field">
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

export function SimWork({ label, ms, onDone }: { label: string; ms: number; onDone: () => void }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const step = Math.max(120, ms / 14);
    const iv = setInterval(() => setT((x) => Math.min(ms, x + step)), 120);
    const end = setTimeout(onDone, ms);
    return () => {
      clearInterval(iv);
      clearTimeout(end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="gm-simwork">
      <span className="gm-simwork-spin" aria-hidden="true" />
      <div>
        <p className="mb-1">{label}</p>
        <ProgressLine value={Math.round((t / ms) * 100)} label={label} />
      </div>
    </div>
  );
}

/* ---------- M-Pesa PIN confirm (demo PIN 123456) ---------- */

export function MpesaConfirm({
  amount,
  detail,
  phone = "0712 345 678",
  onPaid,
}: {
  amount: number;
  detail: string;
  phone?: string;
  onPaid: (ref: string) => void;
}) {
  const [reset, setReset] = useState(0);
  const [stage, setStage] = useState<"pin" | "process" | "fail">("pin");
  useEffect(() => {
    if (stage !== "process") return;
    const t = setTimeout(() => {
      const ref = `QF${Math.floor(100000 + Math.random() * 899999)}`;
      setStage("pin");
      onPaid(ref);
    }, 2200);
    return () => clearTimeout(t);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="gm-mpesa">
      <div className="gm-mpesa-head">
        <Wallet size={18} />
        <strong>M-Pesa · Pay bill</strong>
        <small>Farmer's Growth Fund Ltd</small>
      </div>
      <div className="gm-mpesa-row">
        <span>{detail}</span>
        <strong>{kes(amount)}</strong>
      </div>
      <div className="gm-mpesa-row">
        <span>Phone</span>
        <strong>{phone}</strong>
      </div>
      {stage === "pin" && (
        <>
          {reset > 0 && <p className="gm-mpesa-err">Incorrect PIN — try again (demo PIN 123456).</p>}
          <PinPad
            length={6}
            resetKey={reset}
            actionLabel={`Authorise ${kes(amount)}`}
            onComplete={(pin) => {
              if (pin === "123456") setStage("process");
              else setReset((r) => r + 1);
            }}
          />
        </>
      )}
      {stage === "process" && (
        <div className="gm-mpesa-process">
          <span className="gm-simwork-spin" aria-hidden="true" />
          <p className="mb-0">
            Waiting for the PIN prompt on <strong>{phone}</strong>…
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- tap-to-select mini map ---------- */

export function MiniMap({
  onTap,
  pts,
  closed = false,
}: {
  onTap: (x: number, y: number) => void;
  pts: [number, number][];
  closed?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  return (
    <div className="gm-minimap-frame">
      <svg
        ref={ref}
        viewBox="0 0 800 520"
        className="gm-minimap"
        role="img"
        aria-label="Farm mini-map — tap to add points"
        onClick={(e) => {
          const svg = ref.current;
          if (!svg) return;
          const r = svg.getBoundingClientRect();
          onTap(Math.round(((e.clientX - r.left) / r.width) * 800), Math.round(((e.clientY - r.top) / r.height) * 520));
        }}
      >
        <rect x="0" y="0" width="800" height="520" className="gm-map-bg" />
        <polygon points={FARM_BOUNDARY} className="gm-farm-boundary" />
        {PLOTS.map((p) => (
          <polygon key={p.id} points={p.poly} className={`gm-plot-shape gm-plot-${p.color} gm-minimap-plot`} />
        ))}
        <path d={ROAD_PATH} className="gm-road" fill="none" />
        <path d={STREAM_PATH} className="gm-stream" fill="none" />
        {TREES.map((t, i) => (
          <circle key={i} cx={t.x} cy={t.y} r={t.r} className="gm-tree" />
        ))}
        {pts.length > 0 && (
          <polygon
            points={pts.map((p) => p.join(",")).join(" ")}
            className={`gm-tap-poly ${closed ? "is-closed" : ""}`}
          />
        )}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="6" className="gm-tap-pt-ring" />
            <circle cx={p[0]} cy={p[1]} r="2.6" className="gm-tap-pt" />
          </g>
        ))}
      </svg>
      <span className="gm-minimap-hint">
        <Crosshair size={12} /> Tap the map to add corner points
      </span>
    </div>
  );
}

/* shoelace area from SVG px points, in m² (1 px ≈ 0.525 m) */
export function pxAreaM2(pts: [number, number][]): number {
  if (pts.length < 3) return 0;
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    s += x1 * y2 - x2 * y1;
  }
  const px2 = Math.abs(s) / 2;
  const mPerPx = 420 / 800;
  return Math.round(px2 * mPerPx * mPerPx);
}

/* ============================================================================
   19.3 PLOT DASHBOARD DRAWER — 10 mini-tabs
   ========================================================================== */

function WeatherIcon({ icon }: { icon: ForecastDay["icon"] }) {
  if (icon === "sun") return <Sun size={16} />;
  if (icon === "rain") return <CloudRain size={16} />;
  if (icon === "showers") return <CloudSun size={16} />;
  return <Cloud size={16} />;
}

function WeatherStrip({ plotId, full, onFull }: { plotId: string; full: boolean; onFull?: () => void }) {
  const w = WEATHER[plotId];
  return (
    <div className={`gm-weather ${full ? "gm-weather-full" : ""}`}>
      <div className="gm-weather-now">
        <Thermometer size={18} />
        <div>
          <strong>{w.current}</strong>
          <small>{w.note}</small>
        </div>
      </div>
      <div className="gm-weather-days" role="list" aria-label="7-day forecast">
        {w.days.map((d) => (
          <div key={d.day} className="gm-weather-day" role="listitem">
            <span className="gm-weather-day-name">{d.day}</span>
            <span className="gm-weather-ic">
              <WeatherIcon icon={d.icon} />
            </span>
            <strong>
              {d.hi}° <small>{d.lo}°</small>
            </strong>
            <small>{d.mm > 0 ? `${d.mm} mm` : "dry"}</small>
            {full && <em>{d.note}</em>}
          </div>
        ))}
      </div>
      {!full && onFull && (
        <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={onFull}>
          Full forecast + spray windows
        </button>
      )}
    </div>
  );
}

function SoilBlock({ plotId, compact, onFull, onTest }: {
  plotId: string;
  compact: boolean;
  onFull?: () => void;
  onTest?: () => void;
}) {
  const s = SOIL_TRENDS[plotId];
  const latest = s.tests[0];
  return (
    <div className={`gm-soil ${compact ? "gm-soil-compact" : ""}`}>
      <div className="gm-soil-top">
        <ScoreRing score={s.score} size={compact ? 110 : 140} />
        <div className="gm-soil-latest">
          <strong>Soil health {s.score}/100</strong>
          <small>Latest test {latest.date} · pH {latest.ph} · organic {latest.organic}</small>
          <p className="gm-soil-rec">{s.rec}</p>
        </div>
      </div>
      <table className="gm-table gm-table-sm">
        <thead>
          <tr>
            <th>Test date</th>
            <th>pH</th>
            <th>N</th>
            <th>P</th>
            <th>K</th>
            <th>Organic</th>
          </tr>
        </thead>
        <tbody>
          {s.tests.map((t) => (
            <tr key={t.date}>
              <td>{t.date}</td>
              <td>{t.ph}</td>
              <td>{t.n}</td>
              <td>{t.p}</td>
              <td>{t.k}</td>
              <td>{t.organic}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!compact && (
        <div className="gm-soil-actions">
          {onFull && (
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onFull}>
              Full soil report
            </button>
          )}
          {onTest && (
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onTest}>
              Request new test
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function PlotDashboardDrawer({
  open,
  state,
  onClose,
  onOpen,
  onCompare,
}: {
  open: boolean;
  state: ModalState;
  onClose: () => void;
  onOpen: (s: ModalState) => void;
  onCompare: (id: string) => void;
}) {
  const toast = useToast();
  const [tab, setTab] = useState<PlotTabId>("overview");
  const [newTask, setNewTask] = useState({ time: "1:00 PM", task: "", worker: "John Mwangi" });
  const [taskList, setTaskList] = useState<Record<string, typeof PLOT_TASKS[string]>>({});
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<Record<string, typeof PLOT_NOTES[string]>>({});
  const [newInput, setNewInput] = useState("");
  const [inputs, setInputs] = useState<Record<string, typeof PLOT_INPUTS[string]>>({});
  const [newPhoto, setNewPhoto] = useState("");
  const [photos, setPhotos] = useState<Record<string, typeof PLOT_PHOTOS[string]>>({});
  const [topUp, setTopUp] = useState(false);
  const [paidRef, setPaidRef] = useState("");

  const p = plotOf(state.plotId);
  const tasks = taskList[p.id] ?? PLOT_TASKS[p.id];
  const noteList = notes[p.id] ?? PLOT_NOTES[p.id];
  const inputList = inputs[p.id] ?? PLOT_INPUTS[p.id];
  const photoList = photos[p.id] ?? PLOT_PHOTOS[p.id];
  const pinsHere = PINS.filter((x) => x.plotId === p.id);

  useEffect(() => {
    if (open) {
      setTab("overview");
      setTopUp(false);
      setPaidRef("");
    }
  }, [open, state.plotId]);

  return (
    <DashboardDrawer
      open={open}
      title={`${p.id} · ${p.name}`}
      onClose={onClose}
      footer={
        <div className="gm-drawer-foot">
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onOpen({ kind: "add-pin", plotId: p.id })}>
            <MapPin size={14} /> Pin a problem
          </button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onOpen({ kind: "edit-plot", plotId: p.id })}>
            <Pencil size={14} /> Edit plot
          </button>
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onCompare(p.id)}>
            Compare plots
          </button>
        </div>
      }
    >
      <div className="gm-plot-head">
        <span className={`gm-dot gm-dot-${p.color}`} />
        <div>
          <strong>{p.crop}</strong>
          <small>
            {p.stage} · {p.daysLeft} · {p.areaAc} ac
          </small>
        </div>
        <div className="gm-plot-head-health">
          <ProgressLine value={p.health} label={`${p.id} health`} />
          <small>Health {p.health}/100</small>
        </div>
      </div>

      <MiniTabs value={tab} items={PLOT_TABS} onChange={setTab} label="Plot dashboard sections" />

      {tab === "overview" && (
        <div className="gm-tabpane">
          <dl className="gm-facts">
            <Field k="Area" v={`${p.areaAc} ac (${p.areaHa} ha)`} />
            <Field k="Perimeter" v={`${p.perimeterM} m · ${p.points} points`} />
            <Field k="Elevation" v={p.elevation} />
            <Field k="Slope" v={p.slope} />
            <Field k="Aspect" v={p.aspect} />
            <Field k="Drainage" v={p.drainage} />
            <Field k="Soil" v={`${p.soilType} · pH ${p.soilPh} (tested ${p.soilTestDate})`} />
            <Field k="Water" v={p.waterSource} />
            <Field k="Irrigation" v={p.irrigation} />
            <Field k="Previous crop" v={p.prevCrop} />
            <Field k="Next crop" v={p.nextCrop} />
            <Field k="Fencing" v={p.fencing} />
            <Field k="Access" v={p.access} />
            <Field k="Budget" v={`${kes(p.budget)} budget · ${kes(p.spent)} spent`} />
          </dl>
          <p className="gm-note-callout">
            <NotebookPen size={14} /> {p.notes}
          </p>
          <h4 className="gm-subhead">Pins on this plot ({pinsHere.length})</h4>
          {pinsHere.length === 0 ? (
            <p className="gm-muted">No problem pins — this plot is clear.</p>
          ) : (
            pinsHere.map((pin) => (
              <button key={pin.id} type="button" className="gm-pin-inline" onClick={() => onOpen({ kind: "pin", pinId: pin.id })}>
                <MapPin size={13} />
                <span>
                  <strong>{pin.id} · {pin.issue}</strong>
                  <small>
                    {pin.location} · {pin.date}
                  </small>
                </span>
                <StatusChip
                  label={pin.status}
                  tone={pin.status === "Resolved" ? "low" : "medium"}
                />
              </button>
            ))
          )}
          <div className="gm-quickrow">
            <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={() => setTab("weather")}>
              7-day weather
            </button>
            <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={() => setTab("soil")}>
              Soil trend
            </button>
            <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={() => setTab("tasks")}>
              {tasks.filter((t) => t.status !== "Done").length} open tasks
            </button>
          </div>
        </div>
      )}

      {tab === "weather" && (
        <div className="gm-tabpane">
          <WeatherStrip plotId={p.id} full={false} onFull={() => onOpen({ kind: "weather", plotId: p.id })} />
        </div>
      )}

      {tab === "soil" && (
        <div className="gm-tabpane">
          <SoilBlock
            plotId={p.id}
            compact
            onFull={() => onOpen({ kind: "soil", plotId: p.id })}
            onTest={() => onOpen({ kind: "soil-test", plotId: p.id })}
          />
        </div>
      )}

      {tab === "tasks" && (
        <div className="gm-tabpane">
          {tasks.length === 0 ? (
            <p className="gm-muted">No tasks on {p.id} today.</p>
          ) : (
            <ul className="gm-task-list">
              {tasks.map((t) => (
                <li key={t.id} className={`gm-task-${t.status.toLowerCase().replace(" ", "-")}`}>
                  <span className="gm-task-time">{t.time}</span>
                  <span className="gm-task-body">
                    <strong>{t.task}</strong>
                    <small>{t.worker}</small>
                  </span>
                  <StatusChip
                    label={t.status}
                    tone={t.status === "Done" ? "low" : t.status === "In progress" ? "medium" : "neutral"}
                  />
                </li>
              ))}
            </ul>
          )}
          <div className="gm-addform">
            <h5>Add a task for today</h5>
            <div className="gm-addform-row">
              <input
                className="gm-input"
                value={newTask.time}
                onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                aria-label="Time"
              />
              <input
                className="gm-input"
                placeholder="e.g. Stake the new row with bamboo"
                value={newTask.task}
                onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                aria-label="Task"
              />
            </div>
            <div className="gm-addform-row">
              <select
                className="gm-input"
                value={newTask.worker}
                onChange={(e) => setNewTask({ ...newTask, worker: e.target.value })}
                aria-label="Worker"
              >
                {["John Mwangi", "Peter Kamau", "Grace Wanjiku", "Samuel Njoroge", "David Maina"].map((wkr) => (
                  <option key={wkr}>{wkr}</option>
                ))}
              </select>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                disabled={!newTask.task.trim()}
                onClick={() => {
                  setTaskList({
                    ...taskList,
                    [p.id]: [
                      { id: `nt${Date.now()}`, time: newTask.time, task: newTask.task.trim(), worker: newTask.worker, status: "Scheduled" as const },
                      ...tasks,
                    ],
                  });
                  setNewTask({ ...newTask, task: "" });
                  toast.notify(`Task added to ${p.id} — ${newTask.time}`);
                }}
              >
                <Plus size={14} /> Add task
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "labour" && (
        <div className="gm-tabpane">
          {PLOT_LABOUR[p.id].length === 0 ? (
            <p className="gm-muted">No one logged on {p.id} this morning.</p>
          ) : (
            <ul className="gm-labour-list">
              {PLOT_LABOUR[p.id].map((l) => (
                <li key={l.name}>
                  <span className="gm-labour-ic">
                    <UserCheck size={15} />
                  </span>
                  <span>
                    <strong>{l.name}</strong>
                    <small>{l.role}</small>
                  </span>
                  <small className="gm-labour-since">{l.since}</small>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => toast.notify(`Attendance logged for ${p.id} — synced to the team page`)}
          >
            <Users size={14} /> Log attendance
          </button>
        </div>
      )}

      {tab === "inputs" && (
        <div className="gm-tabpane">
          <div className="gm-table-wrap">
            <table className="gm-table gm-table-sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Allocated</th>
                  <th>Used</th>
                  <th>Left</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {inputList.map((r) => (
                  <tr key={r.item}>
                    <td>{r.item}</td>
                    <td>{r.allocated}</td>
                    <td>{r.used}</td>
                    <td>{r.left}</td>
                    <td>{r.from}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="gm-addform">
            <h5>Log a new input</h5>
            <div className="gm-addform-row">
              <input
                className="gm-input"
                placeholder="e.g. 10 kg CAN from the store"
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                aria-label="New input"
              />
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                disabled={!newInput.trim()}
                onClick={() => {
                  const [qty, ...rest] = newInput.trim().split(" ");
                  setInputs({
                    ...inputs,
                    [p.id]: [
                      ...inputList,
                      { item: rest.join(" ") || "New input", allocated: qty || "—", used: "0", left: qty || "—", from: "Logged on map" },
                    ],
                  });
                  setNewInput("");
                  toast.notify(`Input logged for ${p.id}`);
                }}
              >
                <Package size={14} /> Log input
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "finance" && (
        <div className="gm-tabpane">
          <div className="gm-table-wrap">
            <table className="gm-table gm-table-sm">
              <thead>
                <tr>
                  <th>Line</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Used</th>
                </tr>
              </thead>
              <tbody>
                {PLOT_FINANCE[p.id].map((r) => (
                  <tr key={r.line}>
                    <td>{r.line}</td>
                    <td>{kes(r.budget)}</td>
                    <td>{kes(r.spent)}</td>
                    <td className="gm-td-bar">
                      <ProgressLine value={r.budget ? Math.round((r.spent / r.budget) * 100) : 0} label={r.line} />
                      <small>{r.budget ? Math.round((r.spent / r.budget) * 100) : 0}%</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!topUp && (
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setTopUp(true)}>
              <Banknote size={14} /> Top up plot budget by {kes(5000)}
            </button>
          )}
          {topUp && paidRef === "" && (
            <MpesaConfirm
              amount={5000}
              detail={`Budget top-up · ${p.id} ${p.name}`}
              onPaid={(ref) => setPaidRef(ref)}
            />
          )}
          {paidRef && (
            <p className="gm-success-line">
              <CircleCheck size={15} /> Paid {kes(5000)} — M-Pesa ref {paidRef}. Plot budget updated.
            </p>
          )}
        </div>
      )}

      {tab === "photos" && (
        <div className="gm-tabpane">
          <PhotoGrid photos={photoList} />
          <div className="gm-addform">
            <h5>Add a photo note</h5>
            <div className="gm-addform-row">
              <input
                className="gm-input"
                placeholder="Caption — e.g. Row 2 after today's weeding"
                value={newPhoto}
                onChange={(e) => setNewPhoto(e.target.value)}
                aria-label="Photo caption"
              />
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                disabled={!newPhoto.trim()}
                onClick={() => {
                  setPhotos({
                    ...photos,
                    [p.id]: [
                      { id: `ph${Date.now()}`, caption: newPhoto.trim(), date: "17/11/2026", kind: "crop" as const },
                      ...photoList,
                    ],
                  });
                  setNewPhoto("");
                  toast.notify(`Photo note saved on ${p.id}`);
                }}
              >
                <Camera size={14} /> Save note
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="gm-tabpane">
          <div className="gm-table-wrap">
            <table className="gm-table gm-table-sm">
              <thead>
                <tr>
                  <th>Season</th>
                  <th>Crop</th>
                  <th>Yield note</th>
                  <th>Problem</th>
                </tr>
              </thead>
              <tbody>
                {PLOT_HISTORY[p.id].map((h) => (
                  <tr key={h.season}>
                    <td>{h.season}</td>
                    <td>{h.crop}</td>
                    <td>{h.yieldNote}</td>
                    <td>{h.problem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div className="gm-tabpane">
          <ul className="gm-note-list">
            {noteList.map((n) => (
              <li key={n.id}>
                <small>{n.date}</small>
                <p className="mb-0">{n.text}</p>
              </li>
            ))}
          </ul>
          <div className="gm-addform">
            <h5>New field note · 17/11/2026</h5>
            <textarea
              className="gm-input gm-textarea"
              rows={3}
              placeholder="What did you see on the plot today?"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              aria-label="New note"
            />
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              disabled={!newNote.trim()}
              onClick={() => {
                setNotes({
                  ...notes,
                  [p.id]: [
                    { id: `n${Date.now()}`, date: "17/11/2026", text: newNote.trim() },
                    ...noteList,
                  ],
                });
                setNewNote("");
                toast.notify(`Note saved on ${p.id}`);
              }}
            >
              <NotebookPen size={14} /> Save note
            </button>
          </div>
        </div>
      )}
    </DashboardDrawer>
  );
}

/* ============================================================================
   19.2 PLOT CREATION — 6 methods + 3-step wizard + edit
   ========================================================================== */

function MethodBody({
  method,
  carried,
  onResult,
}: {
  method: CreateMethod;
  carried?: string;
  onResult: (summary: string) => void;
}) {
  const toast = useToast();
  const [pts, setPts] = useState<[number, number][]>([]);
  const [dims, setDims] = useState({ l: "28", w: "22" });
  const [coords, setCoords] = useState([
    "-1.0198, 36.8831",
    "-1.0198, 36.8845",
    "-1.0211, 36.8845",
    "-1.0211, 36.8831",
  ]);
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [title, setTitle] = useState("GTH/1234");
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(false);

  const tapArea = pxAreaM2(pts);
  const dimsArea = (Number(dims.l) * Number(dims.w) * 0.525 * 0.525) / 4046.86;
  const coordArea =
    Math.abs((36.8845 - 36.8831) * (-1.0211 - -1.0198)) * 40075000 * 0.016114 / 4046.86;

  if (carried) {
    return (
      <div className="gm-method-done">
        <CircleCheck size={20} />
        <div>
          <strong>Boundary carried over</strong>
          <p className="mb-0">{carried}</p>
        </div>
      </div>
    );
  }

  switch (method.kind) {
    case "walk":
      return (
        <WalkSimBox onDone={onResult} onAbort={() => toast.notify("Walk aborted — no boundary saved")} />
      );
    case "tap":
      return (
        <div>
          <MiniMap
            onTap={(x, y) => setPts((p) => (p.length >= 8 ? p : [...p, [x, y]]))}
            pts={pts}
            closed={pts.length >= 3}
          />
          <div className="gm-method-result">
            {pts.length >= 3 ? (
              <>
                {pts.length} points · ~{tapArea.toLocaleString()} m² · ~{dimsArea === 0 ? "—" : (tapArea / 4046.86).toFixed(2)} ac
              </>
            ) : (
              <>Tap at least 3 corners — 8 max. Points connect automatically.</>
            )}
            {pts.length > 0 && (
              <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={() => setPts([])}>
                <Trash2 size={13} /> Clear points
              </button>
            )}
          </div>
          {pts.length >= 3 && (
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onResult(`Tapped ${pts.length} corner points — ${tapArea.toLocaleString()} m² (${(tapArea / 4046.86).toFixed(2)} ac) boundary`)}>
              Accept boundary
            </button>
          )}
        </div>
      );
    case "dims":
      return (
        <div>
          <div className="gm-dims-row">
            <label className="gm-label">
              Length (m)
              <input className="gm-input" value={dims.l} onChange={(e) => setDims({ ...dims, l: e.target.value })} inputMode="decimal" />
            </label>
            <label className="gm-label">
              Width (m)
              <input className="gm-input" value={dims.w} onChange={(e) => setDims({ ...dims, w: e.target.value })} inputMode="decimal" />
            </label>
          </div>
          <div className="gm-method-result">
            {Number(dims.l) > 0 && Number(dims.w) > 0
              ? <>Rectangle drawn at the SE corner — {Math.round(Number(dims.l) * Number(dims.w)).toLocaleString()} m² · {dimsArea.toFixed(2)} ac</>
              : <>Enter length and width — the rectangle is placed where you put it.</>}
          </div>
          {Number(dims.l) > 0 && Number(dims.w) > 0 && (
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onResult(`Rectangle ${dims.l} × ${dims.w} m — ${Math.round(Number(dims.l) * Number(dims.w)).toLocaleString()} m² (${dimsArea.toFixed(2)} ac)`)}>
              Accept boundary
            </button>
          )}
        </div>
      );
    case "coords":
      return (
        <div>
          <div className="gm-coords-grid">
            {["NW corner", "NE corner", "SE corner", "SW corner"].map((lbl, i) => (
              <label key={lbl} className="gm-label">
                {lbl} · lat, long
                <input
                  className="gm-input"
                  value={coords[i]}
                  onChange={(e) => setCoords(coords.map((c, j) => (j === i ? e.target.value : c)))}
                />
              </label>
            ))}
          </div>
          <div className="gm-method-result">
            {coords.every((c) => c.includes(","))
              ? <>4 corners parsed — parcel ≈ {coordArea.toFixed(2)} ac (WGS-84, Githunguri grid)</>
              : <>Enter each corner as “-1.0198, 36.8831”.</>}
          </div>
          {coords.every((c) => c.includes(",")) && (
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onResult(`4 GPS corners — ${coordArea.toFixed(2)} ac parcel, ±5 m accuracy`)}>
              Accept boundary
            </button>
          )}
        </div>
      );
    case "upload":
      return (
        <div>
          <label className="gm-upload-box">
            <Upload size={20} />
            <span>
              <strong>Choose a .geojson or .kml file</strong>
              <small>From your surveyor — boundary imported as-is (±0.1 m)</small>
            </span>
            <input
              type="file"
              accept=".geojson,.json,.kml,.xml"
              aria-label="Survey file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setFileName(f.name);
                setParsing(true);
              }}
            />
          </label>
          {parsing && fileName && (
            <SimWork
              label={`Reading ${fileName}…`}
              ms={1600}
              onDone={() => {
                setParsing(false);
                onResult(`Survey file imported — 14-vertex polygon, ${fileName}, ${Math.round(8300)} m² (2.05 ac) as surveyed`);
              }}
            />
          )}
        </div>
      );
    case "registry":
      return (
        <div>
          <div className="gm-registry-row">
            <label className="gm-label">
              Title number
              <input className="gm-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              disabled={searching || !title.trim()}
              onClick={() => {
                setSearching(true);
                setFound(false);
              }}
            >
              <Search size={14} /> Search registry
            </button>
          </div>
          {searching && <SimWork label={`Querying the digitized land registry for ${title}…`} ms={1500} onDone={() => { setSearching(false); setFound(true); }} />}
          {found && !searching && (
            <div className="gm-registry-result">
              <Landmark size={18} />
              <div>
                <strong>Title {title} · Githunguri Sub-County</strong>
                <p className="mb-1">
                  Mary Wanjiku M. — 2.92 ac freehold. Digitized boundary available (2024 survey),
                  sub-divisible. No encumbrances.
                </p>
                <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onResult(`Registry boundary linked — title ${title}, exact surveyed geometry`)}>
                  Use registry boundary
                </button>
              </div>
            </div>
          )}
        </div>
      );
  }
}

export function MethodModal({
  state,
  onClose,
  onOpen,
}: {
  state: ModalState;
  onClose: () => void;
  onOpen: (s: ModalState) => void;
}) {
  const method = methodOf(state.methodId ?? CREATE_METHODS.find((m) => m.kind === state.kind)?.id);
  const [result, setResult] = useState("");
  return (
    <Dialog
      open
      onClose={onClose}
      title={MODAL_TITLES[state.kind as "tap"]}
      desc={method.name}
      wide={state.kind !== "dims"}
    >
      <MethodBody
        method={method}
        onResult={(s) => setResult(s)}
      />
      {result && (
        <div className="gm-method-done">
          <CircleCheck size={20} />
          <div>
            <strong>Boundary captured</strong>
            <p className="mb-0">{result}</p>
          </div>
        </div>
      )}
      <div className="gm-method-cta">
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!result}
          onClick={() => onOpen({ kind: "create", methodId: method.id, boundary: result, startStep: 1 })}
        >
          Continue to plot details
        </button>
      </div>
    </Dialog>
  );
}

export function CreatePlotWizard({
  state,
  onClose,
}: {
  state: ModalState;
  onClose: () => void;
}) {
  const toast = useToast();
  const [step, setStep] = useState(state.startStep ?? 0);
  const [methodId, setMethodId] = useState(state.methodId ?? "");
  const [boundary, setBoundary] = useState(state.boundary ?? "");
  const [form, setForm] = useState({
    name: "Shamba la kupanua",
    color: "clay" as PlotColor,
    crop: "Maize H614 (SR 2026)",
    nextCrop: "Beans (LR 2027)",
    stage: "Planned",
    days: "0",
    budget: "35000",
    notes: "Southeast corner — new boundary, planting week of 24/11.",
  });
  const [saved, setSaved] = useState(false);
  const method = CREATE_METHODS.find((m) => m.id === methodId);

  if (saved) {
    return (
      <Dialog open onClose={onClose} title="Plot saved">
        <div className="gm-method-done gm-saved-box">
          <CircleCheck size={26} />
          <div>
            <strong>PL-05 · {form.name} is on the farm map</strong>
            <p>
              {boundary || "Boundary recorded"} · {form.crop} · budget {kes(Number(form.budget) || 0)}
            </p>
            <p className="mb-0">The multi-plot overview and comparison now include the new plot.</p>
          </div>
        </div>
        <WizardActions step={0} last={0} onBack={onClose} onNext={onClose} finishLabel="Done" />
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={onClose} title="New plot" desc="GrowMO keeps the boundary, the crop plan and the money together." wide>
      <Stepper steps={["Method", "Details", "Review"]} current={step} onStep={setStep} />
      {step === 0 && (
        <div className="gm-method-grid">
          {CREATE_METHODS.map((m) => (
            <MethodCard
              key={m.id}
              name={m.name}
              how={m.how}
              accuracy={m.accuracy}
              bestFor={m.bestFor}
              icon={methodIcon(m.kind)}
              active={methodId === m.id}
              onPick={() => setMethodId(m.id)}
            />
          ))}
        </div>
      )}
      {step === 1 && method && (
        <MethodBody method={method} carried={boundary || undefined} onResult={setBoundary} />
      )}
      {step === 2 && (
        <div>
          <div className="gm-coords-grid">
            <label className="gm-label">
              Plot name
              <input className="gm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="gm-label">
              Map color
              <div className="gm-swatches">
                {PLOT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`gm-swatch gm-swatch-${c.id} ${form.color === c.id ? "on" : ""}`}
                    aria-label={c.label}
                    aria-pressed={form.color === c.id}
                    onClick={() => setForm({ ...form, color: c.id })}
                  />
                ))}
              </div>
            </label>
            <label className="gm-label">
              First crop
              <input className="gm-input" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} />
            </label>
            <label className="gm-label">
              Next crop
              <input className="gm-input" value={form.nextCrop} onChange={(e) => setForm({ ...form, nextCrop: e.target.value })} />
            </label>
            <label className="gm-label">
              Stage
              <input className="gm-input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} />
            </label>
            <label className="gm-label">
              Season day
              <input className="gm-input" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} inputMode="numeric" />
            </label>
            <label className="gm-label">
              Budget (KES)
              <input className="gm-input" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} inputMode="numeric" />
            </label>
          </div>
          <label className="gm-label">
            Notes
            <textarea className="gm-input gm-textarea" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <div className="gm-review-box">
            <h5>Review</h5>
            <ul className="mb-0">
              <li>Boundary: {boundary || "not captured yet"}</li>
              <li>
                {form.name} · {form.crop} · {form.stage} (D{form.days})
              </li>
              <li>Budget {kes(Number(form.budget) || 0)} · color {PLOT_COLORS.find((c) => c.id === form.color)?.label}</li>
            </ul>
          </div>
        </div>
      )}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => {
          if (step === 2) {
            setSaved(true);
            toast.notify("Plot PL-05 saved to the farm map");
          } else setStep((s) => s + 1);
        }}
        nextDisabled={step === 0 ? !methodId : step === 1 ? !boundary : !form.name.trim()}
        finishLabel="Save plot"
      />
    </Dialog>
  );
}

function methodIcon(kind: CreateMethod["kind"]) {
  if (kind === "walk") return <Footprints size={17} />;
  if (kind === "tap") return <Crosshair size={17} />;
  if (kind === "dims") return <Ruler size={17} />;
  if (kind === "coords") return <Globe size={17} />;
  if (kind === "upload") return <FileJson size={17} />;
  return <Landmark size={17} />;
}

export function EditPlotModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const p = plotOf(state.plotId);
  const [form, setForm] = useState({
    name: p.name,
    color: p.color,
    crop: p.crop,
    nextCrop: p.nextCrop,
    stage: p.stage,
    days: String(p.days),
    budget: String(p.budget),
    notes: p.notes,
  });
  return (
    <Dialog open onClose={onClose} title={`Edit ${p.id} · ${p.name}`} desc="Boundary and measurements stay untouched — planning fields only." wide>
      <div className="gm-coords-grid">
        <label className="gm-label">
          Plot name
          <input className="gm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="gm-label">
          Map color
          <div className="gm-swatches">
            {PLOT_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`gm-swatch gm-swatch-${c.id} ${form.color === c.id ? "on" : ""}`}
                aria-label={c.label}
                aria-pressed={form.color === c.id}
                onClick={() => setForm({ ...form, color: c.id })}
              />
            ))}
          </div>
        </label>
        <label className="gm-label">
          Current crop
          <input className="gm-input" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} />
        </label>
        <label className="gm-label">
          Next crop
          <input className="gm-input" value={form.nextCrop} onChange={(e) => setForm({ ...form, nextCrop: e.target.value })} />
        </label>
        <label className="gm-label">
          Stage
          <input className="gm-input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} />
        </label>
        <label className="gm-label">
          Season day
          <input className="gm-input" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} inputMode="numeric" />
        </label>
        <label className="gm-label">
          Budget (KES)
          <input className="gm-input" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} inputMode="numeric" />
        </label>
      </div>
      <label className="gm-label">
        Notes
        <textarea className="gm-input gm-textarea" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </label>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!form.name.trim()}
          onClick={() => {
            toast.notify(`${p.id} updated — changes shown on the farm map`);
            onClose();
          }}
        >
          <PenLine size={14} /> Save changes
        </button>
      </div>
    </Dialog>
  );
}

/* ============================================================================
   19.5 PROBLEM PINS — add, detail, resolve
   ========================================================================== */

export function AddPinModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const [pt, setPt] = useState<[number, number] | null>(null);
  const [plotId, setPlotId] = useState(state.plotId ?? "PL-01");
  const [form, setForm] = useState({
    location: "North-east corner",
    issue: "",
    severity: "Medium" as ProblemPin["severity"],
    status: "Monitoring" as ProblemPin["status"],
    photo: "",
  });
  return (
    <Dialog open onClose={onClose} title="Pin a problem area" desc="Mark exactly where the problem is — the pin appears on the map and in the plot dashboard." wide>
      <MiniMap onTap={(x, y) => setPt([x, y])} pts={pt ? [pt] : []} />
      <div className="gm-coords-grid">
        <label className="gm-label">
          Plot
          <select className="gm-input" value={plotId} onChange={(e) => setPlotId(e.target.value)}>
            {PLOTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} · {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="gm-label">
          Location in plot
          <input className="gm-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </label>
        <label className="gm-label">
          What is wrong?
          <input className="gm-input" placeholder="e.g. Aphids on the outer rows" value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} />
        </label>
        <label className="gm-label">
          Severity
          <select className="gm-input" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as ProblemPin["severity"] })}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
        <label className="gm-label">
          Status
          <select className="gm-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProblemPin["status"] })}>
            <option>Monitoring</option>
            <option>Action pending</option>
            <option>Resolved</option>
          </select>
        </label>
        <label className="gm-label">
          Photo caption
          <input className="gm-input" placeholder="e.g. Close-up of the damaged leaves" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
        </label>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!pt || !form.issue.trim()}
          onClick={() => {
            toast.notify(`PIN-04 pinned on ${plotId} — ${form.severity} severity`);
            onClose();
          }}
        >
          <MapPin size={14} /> Place pin
        </button>
      </div>
    </Dialog>
  );
}

export function PinDetailModal({
  state,
  onClose,
  onOpen,
}: {
  state: ModalState;
  onClose: () => void;
  onOpen: (s: ModalState) => void;
}) {
  const pin = pinOf(state.pinId);
  const [removing, setRemoving] = useState(false);
  return (
    <Dialog open onClose={onClose} title={`${pin.id} · ${pin.issue}`}>
      <div className="gm-pin-detail">
        <div className="gm-pin-detail-head">
          <span className={`gm-pin-badge sev-${pin.severity.toLowerCase()}`}>
            <MapPin size={14} /> {pin.severity}
          </span>
          <StatusChip label={pin.status} tone={pin.status === "Resolved" ? "low" : "medium"} />
        </div>
        <dl className="gm-facts">
          <Field k="Plot" v={`${pin.plotId} — ${PLOTS.find((p) => p.id === pin.plotId)?.name ?? ""}`} />
          <Field k="Location" v={pin.location} />
          <Field k="Pinned" v={pin.date} />
          <Field k="Photo" v={pin.photo} />
        </dl>
        {pin.action ? (
          <p className="gm-note-callout">
            <ShieldCheck size={14} /> {pin.action}
          </p>
        ) : (
          <p className="gm-muted">No action recorded yet.</p>
        )}
      </div>
      <div className="gm-method-cta gm-rowwrap">
        {pin.status !== "Resolved" && (
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onOpen({ kind: "resolve-pin", pinId: pin.id })}>
            <CircleCheck size={14} /> Mark resolved
          </button>
        )}
        {pin.status === "Resolved" && (
          <button type="button" className="gm-btn gm-btn-outline" onClick={() => setRemoving(true)}>
            <Trash2 size={14} /> Remove resolved pin
          </button>
        )}
      </div>
      {removing && (
        <div className="gm-confirm-row">
          <span>Remove {pin.id} from the map? The record stays in history.</span>
          <div className="gm-rowwrap">
            <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={() => setRemoving(false)}>
              Keep
            </button>
            <button type="button" className="gm-btn gm-btn-danger gm-btn-sm" onClick={onClose}>
              Remove pin
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export function ResolvePinModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const pin = pinOf(state.pinId);
  const [action, setAction] = useState("");
  return (
    <Dialog open onClose={onClose} title={`Resolve ${pin.id}`} desc={`${pin.issue} — record what fixed it before closing the pin.`}>
      <label className="gm-label">
        Action taken
        <textarea
          className="gm-input gm-textarea"
          rows={3}
          placeholder="e.g. Affected plants removed, 1 m radius sprayed with copper fungicide"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
      </label>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!action.trim()}
          onClick={() => {
            toast.notify(`${pin.id} marked resolved — logged on the pin and the plot`);
            onClose();
          }}
        >
          <ShieldCheck size={14} /> Mark resolved
        </button>
      </div>
    </Dialog>
  );
}

/* ============================================================================
   WEATHER + SOIL MODALS
   ========================================================================== */

export function WeatherModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const p = plotOf(state.plotId);
  const w = WEATHER[p.id];
  const dryDay = w.days.find((d) => d.mm === 0 && (d.icon === "sun" || d.icon === "cloud"));
  return (
    <Dialog open onClose={onClose} title={`7-day weather · ${p.id} ${p.name}`} desc={w.note} wide>
      <WeatherStrip plotId={p.id} full />
      <p className="gm-weather-spray">
        <Sprout size={15} />
        Best spray window: <strong>{dryDay ? `${dryDay.day} (${dryDay.note.toLowerCase()})` : "none this week"}</strong> —
        next rain {w.days.find((d) => d.mm >= 8)?.day ?? "not in the window"}.
      </p>
    </Dialog>
  );
}

export function SoilModal({ state, onClose, onOpen }: { state: ModalState; onClose: () => void; onOpen: (s: ModalState) => void }) {
  const p = plotOf(state.plotId);
  return (
    <Dialog open onClose={onClose} title={`Soil report · ${p.id} ${p.name}`} desc={`${p.soilType} · tested ${p.soilTestDate} · lab: Kenya Agricultural and Livestock Research Organization`} wide>
      <SoilBlock
        plotId={p.id}
        compact={false}
        onTest={() => onOpen({ kind: "soil-test", plotId: p.id })}
      />
    </Dialog>
  );
}

export function SoilPointModal({ state, onClose, onOpen }: { state: ModalState; onClose: () => void; onOpen: (s: ModalState) => void }) {
  const sp = soilOf(state.soilId);
  const p = PLOTS.find((x) => x.id === sp.plotId) ?? PLOTS[0];
  return (
    <Dialog open onClose={onClose} title={`${sp.id} · soil sample point`}>
      <dl className="gm-facts">
        <Field k="Plot" v={`${sp.plotId} — ${p.name}`} />
        <Field k="pH (latest)" v={String(sp.ph)} />
        <Field k="N · P · K" v={sp.nk} />
        <Field k="Last tested" v={sp.last} />
        <Field k="Sampling" v="Composite of 4 sub-samples, 15 cm depth" />
      </dl>
      <div className="gm-method-cta gm-rowwrap">
        <button type="button" className="gm-btn gm-btn-outline" onClick={() => onOpen({ kind: "soil", plotId: p.id })}>
          Full plot trend
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={() => onOpen({ kind: "soil-test", plotId: p.id })}>
          New sample
        </button>
      </div>
    </Dialog>
  );
}

export function SoilTestModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const p = plotOf(state.plotId);
  const [plotId, setPlotId] = useState(p.id);
  const [paidRef, setPaidRef] = useState("");
  return (
    <Dialog open onClose={onClose} title="Request a soil test" desc="KAL lab · full panel (pH, N, P, K, organic matter) · result in 7–10 working days">
      <div className="gm-soiltest-row">
        <label className="gm-label">
          Sample from plot
          <select className="gm-input" value={plotId} onChange={(e) => setPlotId(e.target.value)}>
            {PLOTS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.id} · {x.name}
              </option>
            ))}
          </select>
        </label>
        <div className="gm-mpesa-row">
          <span>Lab fee (incl. pickup at Githunguri)</span>
          <strong>{kes(1850)}</strong>
        </div>
      </div>
      {paidRef === "" ? (
        <MpesaConfirm amount={1850} detail={`Soil test · ${plotId}`} onPaid={setPaidRef} />
      ) : (
        <div className="gm-method-done">
          <CircleCheck size={20} />
          <div>
            <strong>Test booked — M-Pesa ref {paidRef}</strong>
            <p className="mb-0">
              A collector picks the composite sample at {plotId} on Wed 18/11. Result expected
              26/11/2026 into the plot's soil trend.
            </p>
          </div>
        </div>
      )}
      {paidRef && (
        <div className="gm-method-cta">
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              toast.notify(`Soil test booked for ${plotId} — ref ${paidRef}`);
              onClose();
            }}
          >
            Done
          </button>
        </div>
      )}
    </Dialog>
  );
}

/* ============================================================================
   STANDALONE PLOT-DATA MODALS (opened from KPIs & map tab)
   ========================================================================== */

function dataTitle(p: Plot, what: string) {
  return `${what} · ${p.id} ${p.name}`;
}

export function TasksModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const p = plotOf(state.plotId);
  const tasks = PLOT_TASKS[p.id];
  return (
    <Dialog open onClose={onClose} title={dataTitle(p, "Today's tasks")} desc={`Tue 17/11/2026 · ${tasks.filter((t) => t.status !== "Done").length} still open`}>
      <ul className="gm-task-list">
        {tasks.map((t) => (
          <li key={t.id} className={`gm-task-${t.status.toLowerCase().replace(" ", "-")}`}>
            <span className="gm-task-time">{t.time}</span>
            <span className="gm-task-body">
              <strong>{t.task}</strong>
              <small>{t.worker}</small>
            </span>
            <StatusChip label={t.status} tone={t.status === "Done" ? "low" : t.status === "In progress" ? "medium" : "neutral"} />
          </li>
        ))}
      </ul>
    </Dialog>
  );
}

export function LabourModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const p = plotOf(state.plotId);
  const rows = PLOT_LABOUR[p.id];
  return (
    <Dialog open onClose={onClose} title={dataTitle(p, "Labour on plot")} desc="Who is on the ground this morning">
      {rows.length === 0 ? (
        <p className="gm-muted">No one logged on {p.id} this morning — the kitchen garden runs on household labour.</p>
      ) : (
        <ul className="gm-labour-list">
          {rows.map((l) => (
            <li key={l.name}>
              <span className="gm-labour-ic">
                <UserCheck size={15} />
              </span>
              <span>
                <strong>{l.name}</strong>
                <small>{l.role}</small>
              </span>
              <small className="gm-labour-since">{l.since}</small>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}

export function InputsModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const p = plotOf(state.plotId);
  const rows = PLOT_INPUTS[p.id];
  return (
    <Dialog open onClose={onClose} title={dataTitle(p, "Inputs & materials")} desc="What was allocated, what is used, what is left" wide>
      <div className="gm-table-wrap">
        <table className="gm-table gm-table-sm">
          <thead>
            <tr>
              <th>Item</th>
              <th>Allocated</th>
              <th>Used</th>
              <th>Left</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.item}>
                <td>{r.item}</td>
                <td>{r.allocated}</td>
                <td>{r.used}</td>
                <td>{r.left}</td>
                <td>{r.from}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}

export function FinanceModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const p = plotOf(state.plotId);
  const rows = PLOT_FINANCE[p.id];
  const budget = rows.reduce((s, r) => s + r.budget, 0);
  const spent = rows.reduce((s, r) => s + r.spent, 0);
  return (
    <Dialog open onClose={onClose} title={dataTitle(p, "Plot finance")} desc={`Budget ${kes(budget)} · spent ${kes(spent)} · ${kes(budget - spent)} to go`} wide>
      <div className="gm-table-wrap">
        <table className="gm-table gm-table-sm">
          <thead>
            <tr>
              <th>Line</th>
              <th>Budget</th>
              <th>Spent</th>
              <th>Used</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.line}>
                <td>{r.line}</td>
                <td>{kes(r.budget)}</td>
                <td>{kes(r.spent)}</td>
                <td className="gm-td-bar">
                  <ProgressLine value={r.budget ? Math.round((r.spent / r.budget) * 100) : 0} label={r.line} />
                  <small>{r.budget ? Math.round((r.spent / r.budget) * 100) : 0}%</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}

export function PhotosModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const p = plotOf(state.plotId);
  return (
    <Dialog open onClose={onClose} title={dataTitle(p, "Plot photos")} desc="Crop, problem and structure shots — newest first" wide>
      <PhotoGrid photos={PLOT_PHOTOS[p.id]} />
    </Dialog>
  );
}

export function HistoryModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const p = plotOf(state.plotId);
  return (
    <Dialog open onClose={onClose} title={dataTitle(p, "Crop history")} desc="Season by season — yield and problems" wide>
      <div className="gm-table-wrap">
        <table className="gm-table gm-table-sm">
          <thead>
            <tr>
              <th>Season</th>
              <th>Crop</th>
              <th>Yield note</th>
              <th>Problem</th>
            </tr>
          </thead>
          <tbody>
            {PLOT_HISTORY[p.id].map((h) => (
              <tr key={h.season}>
                <td>{h.season}</td>
                <td>{h.crop}</td>
                <td>{h.yieldNote}</td>
                <td>{h.problem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}

export function NotesModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const p = plotOf(state.plotId);
  return (
    <Dialog open onClose={onClose} title={dataTitle(p, "Field notes")} desc="What was written down while walking the plot">
      <ul className="gm-note-list">
        {PLOT_NOTES[p.id].map((n) => (
          <li key={n.id}>
            <small>{n.date}</small>
            <p className="mb-0">{n.text}</p>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}

/* ============================================================================
   19.7 MEASUREMENT TOOLS
   ========================================================================== */

export function DistanceModal({ onClose }: { state: ModalState; onClose: () => void }) {
  const [a, setA] = useState<[number, number] | null>(null);
  const [b, setB] = useState<[number, number] | null>(null);
  const [preset, setPreset] = useState(DISTANCE_PRESETS[0].id);
  const live = a && b ? svgDistM(a[0], a[1], b[0], b[1]) : null;
  const chosen = DISTANCE_PRESETS.find((d) => d.id === preset) ?? DISTANCE_PRESETS[0];
  return (
    <Dialog open onClose={onClose} title="Distance measure" desc="Pick a preset, or tap two points on the map" wide>
      <div className="gm-preset-list" role="listbox" aria-label="Distance presets">
        {DISTANCE_PRESETS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="option"
            aria-selected={preset === d.id}
            className={`gm-preset ${preset === d.id ? "on" : ""}`}
            onClick={() => {
              setPreset(d.id);
              setA(d.a);
              setB(d.b);
            }}
          >
            <span>
              <strong>{d.label}</strong>
              <small>
                {d.m} m ({(d.m / 1000).toFixed(2)} km)
              </small>
            </span>
            <Ruler size={15} />
          </button>
        ))}
      </div>
      <MiniMap
        onTap={(x, y) => {
          if (!a || (a && b)) {
            setA([x, y]);
            setB(null);
          } else setB([x, y]);
        }}
        pts={a ? [a, ...(b ? [b] : [])] : []}
      />
      <div className="gm-method-result">
        {live !== null ? (
          <>
            Tapped distance: <strong>{live} m</strong> ({(live / 1000).toFixed(2)} km)
          </>
        ) : (
          <>Preset: <strong>{chosen.label}</strong> — {chosen.m} m</>
        )}
        <span className="gm-muted">Scale 1 px ≈ 0.525 m · Githunguri, 1,785–1,800 m</span>
      </div>
    </Dialog>
  );
}

export function AreaModal({ onClose }: { state: ModalState; onClose: () => void }) {
  const [pts, setPts] = useState<[number, number][]>([]);
  const m2 = pxAreaM2(pts);
  return (
    <Dialog open onClose={onClose} title="Area measure" desc="Tap around any shape — sub-sections, new plots, drainage lines" wide>
      <MiniMap
        onTap={(x, y) => setPts((p) => (p.length >= 10 ? p : [...p, [x, y]]))}
        pts={pts}
        closed={pts.length >= 3}
      />
      <div className="gm-method-result gm-arearead">
        {pts.length >= 3 ? (
          <>
            <strong>{m2.toLocaleString()} m²</strong> · {(m2 / 4046.86).toFixed(2)} ac ·{" "}
            {(m2 / 10000).toFixed(2)} ha — {pts.length} vertices
          </>
        ) : (
          <>Tap at least 3 points to close the shape.</>
        )}
        {pts.length > 0 && (
          <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={() => setPts([])}>
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>
    </Dialog>
  );
}

export function ElevationModal({ onClose }: { state: ModalState; onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} title="Elevation profile" desc="Draw a line on the map and this shows the ground change along it — three saved lines below" wide>
      {ELEVATION_PROFILES.map((e) => (
        <ElevationChart key={e.id} points={e.points} label={e.label} note={e.note} />
      ))}
    </Dialog>
  );
}

export function SlopeModal({ onClose }: { state: ModalState; onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} title="Slope calculator" desc="% grade along a line — what it means for erosion and irrigation">
      <div className="gm-slope-list">
        {SLOPE_PRESETS.map((s) => (
          <div key={s.id} className={`gm-slope-row ${s.pct >= 5 ? "steep" : ""}`}>
            <Mountain size={16} />
            <span>
              <strong>{s.label}</strong>
              <small>{s.verdict}</small>
            </span>
            <span className="gm-slope-pct">{s.pct}%</span>
          </div>
        ))}
      </div>
      <p className="gm-muted">
        Rule of thumb: under 5% cultivates freely; 5–10% needs mulch or grass strips; above 10%
        terraces only.
      </p>
    </Dialog>
  );
}

export function SunModal({ onClose }: { state: ModalState; onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} title="Sun exposure" desc="Full-sun hours per plot — December (high sun) vs June (low sun)" wide>
      <SunChart rows={SUN_EXPOSURE} />
    </Dialog>
  );
}

/* ============================================================================
   EXPORT FARM REPORT
   ========================================================================== */

export function ExportModal({ onClose }: { state: ModalState; onClose: () => void }) {
  const [fmt, setFmt] = useState<"pdf" | "csv" | "kml">("pdf");
  const [stage, setStage] = useState<"pick" | "work" | "done">("pick");
  const names = {
    pdf: "growmo-farm-report-17-11-2026.pdf",
    csv: "growmo-plots-17-11-2026.csv",
    kml: "marys-farm-boundaries.kml",
  };
  return (
    <Dialog open onClose={onClose} title="Export farm report" desc="Bundle the map, the plots, pins and money into one file">
      {stage === "pick" && (
        <div>
          <div className="gm-export-list">
            <button type="button" className={`gm-export-card ${fmt === "pdf" ? "on" : ""}`} aria-pressed={fmt === "pdf"} onClick={() => setFmt("pdf")}>
              <FileDown size={18} />
              <span>
                <strong>Farm report (PDF)</strong>
                <small>Map sheet + 4 plot dashboards + pin log + finance. A4, 6 pages.</small>
              </span>
            </button>
            <button type="button" className={`gm-export-card ${fmt === "csv" ? "on" : ""}`} aria-pressed={fmt === "csv"} onClick={() => setFmt("csv")}>
              <FileSpreadsheet size={18} />
              <span>
                <strong>Plots (CSV)</strong>
                <small>All 20 fields per plot — open in Excel or Sheets.</small>
              </span>
            </button>
            <button type="button" className={`gm-export-card ${fmt === "kml" ? "on" : ""}`} aria-pressed={fmt === "kml"} onClick={() => setFmt("kml")}>
              <Globe size={18} />
              <span>
                <strong>Boundaries (KML)</strong>
                <small>Plot polygons for Google Earth — surveyor format.</small>
              </span>
            </button>
          </div>
          <div className="gm-method-cta">
            <button type="button" className="gm-btn gm-btn-lime" onClick={() => setStage("work")}>
              <ScanSearch size={14} /> Generate {fmt.toUpperCase()}
            </button>
          </div>
        </div>
      )}
      {stage === "work" && <SimWork label={`Assembling ${names[fmt]}…`} ms={1700} onDone={() => setStage("done")} />}
      {stage === "done" && (
        <div className="gm-method-done">
          <Check size={22} />
          <div>
            <strong>{names[fmt]} is ready</strong>
            <p className="mb-0">
              Saved to your GrowMO files · {fmt === "pdf" ? "0.8 MB · includes the satellite map sheet" : fmt === "csv" ? "4 rows × 20 columns" : "4 polygons + farm boundary, WGS-84"}.
            </p>
          </div>
        </div>
      )}
    </Dialog>
  );
}
