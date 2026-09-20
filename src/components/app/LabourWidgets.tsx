/* ============================================================================
   PAGE 6 WIDGETS — Labour Management & Payroll (/app/labour)
   ========================================================================== */
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  HandCoins,
  Leaf,
  MapPin,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import type { LabourTask, TaskStatus } from "../../data/app/labour";
import { kes } from "../../data/site";
import { ProgressLine, StatusChip } from "./DashboardWidgets";
import { PlannerFact } from "./PlannerWidgets";

export interface LabourKpi {
  label: string;
  value: string;
  note: string;
}

export function LabourHeaderCard({
  kpis,
  actions,
}: {
  kpis: LabourKpi[];
  actions: ReactNode;
}) {
  return (
    <header className="gm-card gm-plan-head">
      <div className="d-flex flex-wrap align-items-start gap-4">
        <div style={{ flex: "1 1 420px" }}>
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Page 6 · Labour management & payroll
          </span>
          <h1 className="font-display mt-2">
            Turn every pair of hands into a clear plan
          </h1>
          <p className="gm-lead on-dark mb-0">
            Watu, kazi, malipo — find trusted workers around Githunguri, plan
            crop work, confirm attendance, and move a completed task into a
            transparent M-Pesa payment without losing the paper trail.
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

export function LabourStatusPill({ status }: { status: TaskStatus }) {
  const tone =
    status === "Completed"
      ? "low"
      : status === "Overdue"
        ? "high"
        : status === "Today" || status === "Upcoming"
          ? "medium"
          : "neutral";
  return <StatusChip label={status} tone={tone} />;
}

export function LabourBudgetBar({
  label,
  value,
  total,
  note,
}: {
  label: string;
  value: number;
  total: number;
  note: string;
}) {
  const percentage = Math.min(
    100,
    Math.round((value / Math.max(total, 1)) * 100),
  );
  return (
    <div className="gm-card p-3">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div>
          <span className="gm-eyebrow">{label}</span>
          <strong
            className="font-display d-block mt-1"
            style={{ fontSize: "1.35rem" }}
          >
            {kes(value)}
          </strong>
        </div>
        <span className="gm-mega-icon">
          <HandCoins />
        </span>
      </div>
      <ProgressLine
        value={percentage}
        label={`${percentage}% of ${kes(total)} budget`}
      />
      <small className="text-muted d-block mt-2">{note}</small>
    </div>
  );
}

export function LabourTaskSummary({
  task,
  workers,
}: {
  task: LabourTask;
  workers: string;
}) {
  return (
    <div
      className={`gm-calendar-task text-start status-${task.status.toLowerCase()}`}
    >
      <span className="d-flex align-items-center gap-1">
        <CalendarDays /> {task.startTime}
      </span>
      <strong>{task.title}</strong>
      <small>
        {workers} · {kes(task.estimatedTotal)}
      </small>
    </div>
  );
}

export interface CalendarDay {
  day: number;
  date: string;
  outside?: boolean;
  tasks: LabourTask[];
}

export function LabourCalendar({
  days,
  monthLabel,
  onPrevious,
  onNext,
  onToday,
  onOpenDay,
}: {
  days: CalendarDay[];
  monthLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenDay: (day: CalendarDay) => void;
}) {
  return (
    <div className="gm-card p-3 p-lg-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
          <span className="gm-eyebrow">Planner calendar</span>
          <h2 className="font-display mb-0">{monthLabel}</h2>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={onPrevious}
          >
            Previous
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-soft gm-btn-sm"
            onClick={onToday}
          >
            Today
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={onNext}
          >
            Next
          </button>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <span className="gm-chip">
          <span className="gm-calendar-dot completed" /> Completed
        </span>
        <span className="gm-chip">
          <span className="gm-calendar-dot today" /> Today
        </span>
        <span className="gm-chip">
          <span className="gm-calendar-dot overdue" /> Overdue
        </span>
        <span className="gm-chip">
          <span className="gm-calendar-dot upcoming" /> Upcoming
        </span>
      </div>
      <div
        className="gm-calendar-grid gm-calendar-grid-head"
        aria-hidden="true"
      >
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="gm-calendar-grid">
        {days.map((day) => (
          <button
            type="button"
            key={day.date}
            className={`gm-calendar-day ${day.outside ? "is-outside" : ""} ${day.tasks.length ? "has-tasks" : ""}`}
            aria-label={`Open labour details for ${day.date}`}
            onClick={() => onOpenDay(day)}
          >
            <div className="d-flex align-items-center justify-content-between gap-2">
              <strong>{day.day}</strong>
              {day.tasks.length > 0 ? (
                <small>
                  {day.tasks.length} task{day.tasks.length > 1 ? "s" : ""}
                </small>
              ) : null}
            </div>
            <div className="gm-calendar-task-list">
              {day.tasks.slice(0, 2).map((task) => (
                <LabourTaskSummary
                  key={task.id}
                  task={task}
                  workers={`${task.workerIds.length} worker${task.workerIds.length === 1 ? "" : "s"}`}
                />
              ))}
              {day.tasks.length > 2 ? (
                <small className="text-muted">
                  +{day.tasks.length - 2} more
                </small>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PayrollBarChart({
  rows,
}: {
  rows: { label: string; value: number; note: string; highlight?: boolean }[];
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div>
      <div className="d-flex align-items-end gap-2" style={{ height: 190 }}>
        {rows.map((row) => (
          <div
            key={row.label}
            className="d-flex flex-column align-items-center h-100"
            style={{ flex: 1, minWidth: 0 }}
          >
            <small
              className="font-display mb-1"
              style={{ fontSize: "0.73rem" }}
            >
              {kes(row.value).replace("KES ", "")}
            </small>
            <div className="d-flex align-items-end w-100 flex-grow-1">
              <div
                title={`${row.label}: ${kes(row.value)}`}
                style={{
                  height: `${Math.max(8, (row.value / max) * 140)}px`,
                  width: "min(54px, 100%)",
                  margin: "0 auto",
                  borderRadius: "10px 10px 4px 4px",
                  background: row.highlight
                    ? "var(--gm-grad-primary)"
                    : "var(--gm-mint-200)",
                }}
              />
            </div>
            <small
              className="text-center mt-2"
              style={{ fontSize: "0.7rem", fontWeight: 800 }}
            >
              {row.label}
            </small>
            <small
              className="text-muted text-center"
              style={{ fontSize: "0.66rem" }}
            >
              {row.note}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LabourInsight({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <aside className="gm-ai-callout">
      <div className="d-flex align-items-start gap-3">
        <span className="gm-mega-icon">
          <Leaf />
        </span>
        <div style={{ flex: 1 }}>
          <span className="gm-eyebrow">{eyebrow}</span>
          <h3 className="font-display mt-1 mb-2">{title}</h3>
          <p className="mb-0">{body}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </aside>
  );
}

export function WorkerMiniStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="gm-check-row">
      <span className="gm-icon-box">{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

export function LabourQuickMetric({
  icon,
  value,
  label,
  tone = "leaf",
}: {
  icon: ReactNode;
  value: string;
  label: string;
  tone?: "leaf" | "amber" | "sky";
}) {
  return (
    <div className={`gm-card gm-metric-card ${tone}`}>
      <span className="gm-mega-icon">{icon}</span>
      <strong className="font-display">{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function LabourLocationLine({ children }: { children: ReactNode }) {
  return (
    <span className="gm-inline-meta">
      <MapPin /> {children}
    </span>
  );
}

export function LabourTimeLine({ children }: { children: ReactNode }) {
  return (
    <span className="gm-inline-meta">
      <Clock3 /> {children}
    </span>
  );
}

export function LabourWorkerLine({ children }: { children: ReactNode }) {
  return (
    <span className="gm-inline-meta">
      <Users /> {children}
    </span>
  );
}

export function LabourCheckLine({ children }: { children: ReactNode }) {
  return (
    <span className="gm-inline-meta">
      <CheckCircle2 /> {children}
    </span>
  );
}
