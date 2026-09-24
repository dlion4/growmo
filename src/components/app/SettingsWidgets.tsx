/* ============================================================================
   PAGE 15 — SETTINGS / TEAM widgets
   ========================================================================== */
import { BadgeCheck, Building2, Lock, Star, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { FarmPlot, Plan, TeamMember, Worker } from "../../data/app/settings";
import {
  ADVANCES,
  ATTENDANCE_METHODS,
  ATTENDANCE_MONTH,
  ATTENDANCE_TODAY,
  CELL_LABEL,
  COMPLIANCE_ITEMS,
  FARM_DEFAULTS,
  JOB_CHANNELS,
  JOB_POST,
  LABOUR_ANALYTICS,
  NOTIF_CHANNELS,
  ONBOARDING_CHECKLIST,
  PAYROLL_CYCLE,
  PAYSLIPS,
  PERFORMANCE_CARD,
  PERFORMANCE_RATINGS,
  PERM_MATRIX,
  PERM_MATRIX_KEYS,
  PROFILE_FIELDS,
  ROLES,
  type SETTINGS_CONTEXT,
  WORKERS,
} from "../../data/app/settings";
import { kes } from "../../data/site";
import { ProgressLine, StatusChip } from "./DashboardWidgets";

/* ---------------- hero ---------------- */
export function SettingsHero({ ctx, onInvite, onUpgrade }: { ctx: typeof SETTINGS_CONTEXT; onInvite: () => void; onUpgrade: () => void }) {
  return (
    <section className="gm-st-hero">
      <div className="gm-st-hero-top">
        <div className="gm-st-hero-copy">
          <span className="gm-chip gm-chip-live">
            <span className="gm-dot-live" /> {ctx.plan === "premium" ? "Premium account" : "Free account"}
          </span>
          <h1 className="font-display">Settings, team & permissions</h1>
          <p>
            Your profile, farm plots, who can see and do what, payment authority, notifications, data sharing and the
            subscription that keeps it all running.
          </p>
        </div>
        <div className="gm-st-hero-actions">
          <button type="button" className="gm-btn gm-btn-lime" onClick={onInvite}>
            <Users /> Invite member
          </button>
          <button type="button" className="gm-btn gm-btn-outline" onClick={onUpgrade}>
            Compare plans
          </button>
        </div>
      </div>
      <div className="gm-st-hero-stats">
        <div className="gm-st-stat">
          <strong>{ctx.members}</strong>
          <small>Team members</small>
        </div>
        <div className="gm-st-stat">
          <strong>{ROLES.length}</strong>
          <small>Roles defined</small>
        </div>
        <div className="gm-st-stat">
          <strong>{ctx.plots}</strong>
          <small>Plots · {ctx.acres} acres</small>
        </div>
        <div className="gm-st-stat">
          <strong>{kes(ctx.planPrice)}</strong>
          <small>Premium per month</small>
        </div>
        <div className="gm-st-stat">
          <strong>{ctx.onboardingComplete}%</strong>
          <small>Profile complete</small>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 15.1 profile ---------------- */
export function ProfileCard({ ctx, onEdit }: { ctx: typeof SETTINGS_CONTEXT; onEdit: () => void }) {
  return (
    <div className="gm-st-profile">
      <span className="gm-st-avatar">{ctx.farmer.charAt(0)}</span>
      <div className="gm-st-profile-copy">
        <strong className="font-display">{ctx.farmer}</strong>
        <small>
          {ctx.role} · {ctx.farmName} · {ctx.ward}, {ctx.subCounty}
        </small>
        <small>
          {ctx.phone} · {ctx.email} · ID {ctx.idNumber}
        </small>
        <div className="gm-st-profile-chips">
          <span className="gm-chip gm-chip-dark">Last login {ctx.lastLogin}</span>
          <span className="gm-chip gm-chip-dark">Next review {ctx.nextReview}</span>
          <span className="gm-chip gm-chip-dark">{ctx.twoFactor ? "2FA on" : "2FA off"}</span>
          <span className="gm-chip gm-chip-dark">{ctx.biometric ? "Biometric on" : "Biometric off"}</span>
        </div>
      </div>
      <button type="button" className="gm-btn gm-btn-outline" onClick={onEdit}>
        Edit profile
      </button>
    </div>
  );
}

export function ProfileFieldGroups() {
  const groups = ["Identity", "Preferences", "Location", "Security"];
  return (
    <div className="gm-st-groups">
      {groups.map((group) => (
        <div key={group} className="gm-st-group">
          <h3 className="gm-h-section">{group}</h3>
          <dl className="gm-st-kv">
            {PROFILE_FIELDS.filter((field) => field.group === group).map((field) => (
              <div key={field.k} className="gm-st-kv-row">
                <dt>{field.k}</dt>
                <dd>{field.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

/* ---------------- 15.2 farm ---------------- */
export function FarmPlotCard({ p, onEdit }: { p: FarmPlot; onEdit: (plot: FarmPlot) => void }) {
  return (
    <button type="button" className="gm-st-plot" onClick={() => onEdit(p)}>
      <div className="gm-st-plot-head">
        <span className="gm-st-plot-icon">{p.icon}</span>
        <div>
          <strong>{p.name}</strong>
          <small>
            {p.size} · {p.location}
          </small>
        </div>
        <StatusChip label={p.status} tone={p.status === "Active" ? "low" : p.status === "Fallow" ? "medium" : "neutral"} />
      </div>
      <dl className="gm-st-kv is-tight">
        <div className="gm-st-kv-row">
          <dt>Crop</dt>
          <dd>{p.crop}</dd>
        </div>
        <div className="gm-st-kv-row">
          <dt>Soil · pH</dt>
          <dd>
            {p.soil} · {p.ph}
          </dd>
        </div>
        <div className="gm-st-kv-row">
          <dt>Planted</dt>
          <dd>{p.planted}</dd>
        </div>
        <div className="gm-st-kv-row">
          <dt>Harvest</dt>
          <dd>{p.harvest}</dd>
        </div>
      </dl>
      <span className="gm-st-plot-cta">Edit plot details →</span>
    </button>
  );
}

export function FarmDefaults() {
  return (
    <dl className="gm-st-kv">
      {FARM_DEFAULTS.map((row) => (
        <div key={row.k} className="gm-st-kv-row">
          <dt>{row.k}</dt>
          <dd>{row.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------------- 15.3 team ---------------- */
export function TeamMemberCard({ m, onOpen }: { m: TeamMember; onOpen: (member: TeamMember) => void }) {
  const role = ROLES.find((r) => r.key === m.role);
  return (
    <button type="button" className="gm-st-member" onClick={() => onOpen(m)}>
      <div className="gm-st-member-head">
        <span className={`gm-st-member-ava ${m.role === "owner" ? "is-owner" : ""}`}>{m.avatar}</span>
        <div>
          <strong>{m.name}</strong>
          <small>{role?.label}</small>
        </div>
        <StatusChip label={m.status} tone={m.status === "Active" ? "low" : m.status === "Invited" ? "medium" : "high"} />
      </div>
      <small className="gm-st-member-line">{m.phone}</small>
      <small className="gm-st-member-line">{m.email}</small>
      <dl className="gm-st-kv is-tight">
        <div className="gm-st-kv-row">
          <dt>Financial</dt>
          <dd>{m.financial}</dd>
        </div>
        <div className="gm-st-kv-row">
          <dt>Payments</dt>
          <dd>{m.paymentAuthority}</dd>
        </div>
        <div className="gm-st-kv-row">
          <dt>Plots</dt>
          <dd>{m.plots}</dd>
        </div>
        <div className="gm-st-kv-row">
          <dt>Valid</dt>
          <dd>
            {m.validFrom} → {m.validUntil}
          </dd>
        </div>
      </dl>
      <div className="gm-st-member-foot">
        <span className={`gm-chip ${m.mfa ? "gm-chip-lime" : "gm-chip-ghost"}`}>{m.mfa ? "MFA on" : "MFA not set"}</span>
        <span className="gm-st-member-tasks">{m.tasksThisMonth} tasks this month</span>
      </div>
    </button>
  );
}

export function PermissionMatrix() {
  return (
    <div className="gm-st-matrix-wrap">
      <table className="gm-st-matrix">
        <thead>
          <tr>
            <th scope="col">Feature</th>
            {ROLES.map((role) => (
              <th key={role.key} scope="col">
                {role.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERM_MATRIX.map((row) => (
            <tr key={row.feature}>
              <th scope="row">{row.feature}</th>
              {PERM_MATRIX_KEYS.map((key) => (
                <td key={key} className={`is-${row.cells[key]}`} title={`${row.feature} · ${ROLES.find((r) => r.key === key)?.label}`}>
                  {CELL_LABEL[row.cells[key]]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="gm-st-matrix-note">✓ full · ◐ limited, own records or view-only · — no access. Only the owner can change this matrix.</p>
    </div>
  );
}

export function RoleLegend() {
  return (
    <div className="gm-st-roles">
      {ROLES.map((role) => (
        <div key={role.key} className="gm-st-role">
          <span className="gm-st-role-ic">
            {role.key === "owner" ? <BadgeCheck /> : role.key === "manager" ? <Building2 /> : role.key === "agronomist" ? <Star /> : <Lock />}
          </span>
          <div>
            <strong>{role.label}</strong>
            <small>{role.desc}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkerRow({ w, onOpen, onPay }: { w: Worker; onOpen: (worker: Worker) => void; onPay: (worker: Worker) => void }) {
  return (
    <tr>
      <td>
        <strong>{w.name}</strong>
        <small className="d-block text-muted">
          {w.id} · {w.role}
        </small>
      </td>
      <td>{w.phone}</td>
      <td>{kes(w.dailyRate)}</td>
      <td>{w.attendance}%</td>
      <td>
        {w.rating.toFixed(1)}★
      </td>
      <td>
        <StatusChip label={w.status} tone={w.status === "Active" ? "low" : w.status === "Inactive" ? "medium" : "high"} />
      </td>
      <td className="gm-st-row-actions">
        <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => onOpen(w)}>
          Open
        </button>
        <button type="button" className="gm-btn gm-btn-sm gm-btn-lime" onClick={() => onPay(w)}>
          Pay week
        </button>
      </td>
    </tr>
  );
}

/* ---------------- HR panel (15.3.1 – 15.3.8) ---------------- */
export function HrPanel({
  onWorker,
  onPayWorker,
  onPayroll,
  onJob,
  onOnboard,
}: {
  onWorker: (worker: Worker) => void;
  onPayWorker: (worker: Worker) => void;
  onPayroll: () => void;
  onJob: () => void;
  onOnboard: () => void;
}) {
  const [tab, setTab] = useState<"directory" | "recruit" | "attendance" | "performance" | "payroll" | "advances" | "compliance" | "analytics">("directory");
  const payrollTotal = PAYSLIPS.reduce((sum, slip) => sum + slip.net, 0);

  return (
    <div className="gm-st-hr">
      <div className="gm-tabs" role="tablist" aria-label="HR sections">
        {[
          ["directory", "Worker directory"],
          ["recruit", "Recruitment"],
          ["attendance", "Attendance"],
          ["performance", "Performance"],
          ["payroll", "Payroll"],
          ["advances", "Advances"],
          ["compliance", "Compliance"],
          ["analytics", "Labour analytics"],
        ].map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={`gm-tab ${tab === key ? "on" : ""}`} onClick={() => setTab(key as typeof tab)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "directory" ? (
        <div>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Phone</th>
                  <th>Daily rate</th>
                  <th>Attendance</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {WORKERS.map((worker) => (
                  <WorkerRow key={worker.id} w={worker} onOpen={onWorker} onPay={onPayWorker} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted mt-2">
            38 fields per worker: M-Pesa name, NIN, NSSF and NHIF numbers, next of kin, PPE sizes, training and the
            disciplinary log — open a worker to see them all.
          </p>
        </div>
      ) : null}

      {tab === "recruit" ? (
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="gm-card p-3">
              <h3 className="gm-h-section">Open job post</h3>
              <dl className="gm-st-kv">
                {Object.entries(JOB_POST).map(([key, value]) => (
                  <div key={key} className="gm-st-kv-row">
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" className="gm-btn gm-btn-lime gm-btn-block mt-2" onClick={onJob}>
                Edit and re-post
              </button>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="gm-card p-3">
              <h3 className="gm-h-section">Where it was posted</h3>
              <ul className="gm-st-list">
                {JOB_CHANNELS.map((channel) => (
                  <li key={channel.channel}>
                    <strong>{channel.channel}</strong>
                    <small>
                      {channel.reach} · {channel.status}
                    </small>
                  </li>
                ))}
              </ul>
              <h3 className="gm-h-section mt-3">Onboarding checklist</h3>
              <ol className="gm-st-checklist">
                {ONBOARDING_CHECKLIST.map((item) => (
                  <li key={item.step}>
                    <span>{item.step}</span>
                    <small>{item.owner}</small>
                  </li>
                ))}
              </ol>
              <button type="button" className="gm-btn gm-btn-outline gm-btn-block mt-2" onClick={onOnboard}>
                Run the checklist for a new hire
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "attendance" ? (
        <div>
          <div className="row g-3">
            <div className="col-lg-7">
              <h3 className="gm-h-section">Today, 22 Sep 2026</h3>
              <div className="gm-table-wrap">
                <table className="gm-table">
                  <thead>
                    <tr>
                      <th>Worker</th>
                      <th>In</th>
                      <th>Out</th>
                      <th>Hours</th>
                      <th>Task</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ATTENDANCE_TODAY.map((row) => (
                      <tr key={row.worker}>
                        <td>
                          <strong>{row.worker}</strong>
                          <small className="d-block text-muted">{row.note}</small>
                        </td>
                        <td>{row.checkIn}</td>
                        <td>{row.checkOut}</td>
                        <td>{row.hours}</td>
                        <td>{row.task}</td>
                        <td>
                          <StatusChip label={row.status} tone={row.status === "Present" ? "low" : row.status === "Half day" ? "medium" : "high"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-lg-5">
              <h3 className="gm-h-section">How the crew checks in</h3>
              <ul className="gm-st-list">
                {ATTENDANCE_METHODS.map((method) => (
                  <li key={method.method}>
                    <strong>
                      {method.method} · {method.adoption}
                    </strong>
                    <small>
                      {method.how} — best for {method.best.toLowerCase()}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <h3 className="gm-h-section mt-3">Monthly summary</h3>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Half days</th>
                  <th>Attendance</th>
                  <th>Overtime hours</th>
                </tr>
              </thead>
              <tbody>
                {ATTENDANCE_MONTH.map((row) => (
                  <tr key={row.worker}>
                    <td>{row.worker}</td>
                    <td>{row.present}</td>
                    <td>{row.absent}</td>
                    <td>{row.late}</td>
                    <td>{row.half}</td>
                    <td className={row.pct >= 95 ? "gm-st-good" : ""}>{row.pct}%</td>
                    <td>{row.overtime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "performance" ? (
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="gm-card p-3">
              <h3 className="gm-h-section">
                {PERFORMANCE_CARD.worker} · {PERFORMANCE_CARD.average}★ average
              </h3>
              <dl className="gm-st-kv">
                <div className="gm-st-kv-row">
                  <dt>Tasks completed</dt>
                  <dd>{PERFORMANCE_CARD.totalTasks}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Rework</dt>
                  <dd>{PERFORMANCE_CARD.rework}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Absent without notice</dt>
                  <dd>{PERFORMANCE_CARD.absentWithoutNotice}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Late arrivals</dt>
                  <dd>{PERFORMANCE_CARD.lateArrivals}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Speed</dt>
                  <dd className="gm-st-good">{PERFORMANCE_CARD.speed}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Quality</dt>
                  <dd className="gm-st-good">{PERFORMANCE_CARD.quality}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Noted strength</dt>
                  <dd>{PERFORMANCE_CARD.strength}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Improve</dt>
                  <dd>{PERFORMANCE_CARD.improve}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="gm-card p-3">
              <h3 className="gm-h-section">Rating mix</h3>
              {PERFORMANCE_CARD.breakdown.map((row) => (
                <div key={row.stars} className="gm-st-rating">
                  <span>{row.stars}</span>
                  <ProgressLine value={row.pct} label={`${row.stars} ${row.pct}%`} />
                  <b>
                    {row.count} · {row.pct}%
                  </b>
                </div>
              ))}
              <h3 className="gm-h-section mt-3">Monthly rating history</h3>
              <div className="gm-st-bars">
                {PERFORMANCE_CARD.history.map((point) => (
                  <div key={point.month} className="gm-st-bar">
                    <i style={{ height: `${(point.rating / 5) * 100}%` }} />
                    <span>{point.month}</span>
                    <small>{point.tasks}</small>
                  </div>
                ))}
              </div>
              <p className="text-muted mt-2">Farm average {PERFORMANCE_CARD.farmAverage}★ — the dashed line on the chart in a full build.</p>
            </div>
          </div>
          <div className="col-12">
            <h3 className="gm-h-section">How each task is rated</h3>
            <ul className="gm-st-list is-grid">
              {PERFORMANCE_RATINGS.map((rating) => (
                <li key={rating.stars}>
                  <strong>
                    {rating.emoji} {rating.stars}
                  </strong>
                  <small>{rating.desc}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {tab === "payroll" ? (
        <div>
          <div className="gm-st-payroll-head">
            <div>
              <h3 className="gm-h-section">Payroll cycle</h3>
              <p className="text-muted mb-0">{PAYROLL_CYCLE}</p>
            </div>
            <button type="button" className="gm-btn gm-btn-lime" onClick={onPayroll}>
              Review & approve {kes(payrollTotal)}
            </button>
          </div>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Days</th>
                  <th>Basic</th>
                  <th>Overtime</th>
                  <th>Piece rate</th>
                  <th>Deductions</th>
                  <th>Net pay</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {PAYSLIPS.map((slip) => (
                  <tr key={slip.worker}>
                    <td>
                      <strong>{slip.worker}</strong>
                      <small className="d-block text-muted">{slip.phone}</small>
                    </td>
                    <td>{slip.days}</td>
                    <td>{kes(slip.basic)}</td>
                    <td>
                      {slip.otHours} h · {kes(slip.otPay)}
                    </td>
                    <td>{slip.piece ? kes(slip.piece) : "—"}</td>
                    <td>{slip.absence + slip.advance === 0 ? "—" : kes(slip.absence + slip.advance)}</td>
                    <td>
                      <strong>{kes(slip.net)}</strong>
                    </td>
                    <td>M-Pesa</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "advances" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Record</th>
                <th>Worker</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Repayment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ADVANCES.map((row) => (
                <tr key={row.id}>
                  <td>
                    <code>{row.id}</code>
                  </td>
                  <td>{row.worker}</td>
                  <td>{row.type}</td>
                  <td className={row.amount < 0 ? "gm-st-warn" : ""}>{kes(Math.abs(row.amount))}</td>
                  <td>{row.date}</td>
                  <td>{row.reason}</td>
                  <td>{row.plan}</td>
                  <td>
                    <StatusChip label={row.status} tone={row.status === "Deducted" ? "low" : "medium"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "compliance" ? (
        <div className="gm-st-compliance">
          {COMPLIANCE_ITEMS.map((item) => (
            <div key={item.requirement} className="gm-st-compliance-row">
              <div>
                <strong>{item.requirement}</strong>
                <small>{item.detail}</small>
              </div>
              <div className="gm-st-compliance-track">{item.tracking}</div>
              <StatusChip label={item.tone === "good" ? "Compliant" : "Track"} tone={item.tone === "good" ? "low" : "medium"} />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "analytics" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>This month</th>
                <th>Last month</th>
                <th>Change</th>
                <th>County average</th>
              </tr>
            </thead>
            <tbody>
              {LABOUR_ANALYTICS.map((row) => (
                <tr key={row.metric}>
                  <td>{row.metric}</td>
                  <td>
                    <strong>{row.now}</strong>
                  </td>
                  <td>{row.before}</td>
                  <td className={row.change.startsWith("+") ? "gm-st-good" : ""}>{row.change}</td>
                  <td>{row.county}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- 15.4 notifications ---------------- */
export function NotifRow({ row, onToggle }: { row: { id: string; label: string; desc: string; channels: Record<string, boolean> }; onToggle: (id: string, channel: string) => void }) {
  return (
    <div className="gm-st-notif">
      <div className="gm-st-notif-copy">
        <strong>{row.label}</strong>
        <small>{row.desc}</small>
      </div>
      <div className="gm-st-notif-channels">
        {NOTIF_CHANNELS.map((channel) => (
          <button
            key={channel.key}
            type="button"
            className={`gm-st-toggle ${row.channels[channel.key] ? "is-on" : ""}`}
            title={`${channel.label} — ${channel.cost}`}
            aria-label={`${channel.label} ${row.channels[channel.key] ? "on" : "off"} for ${row.label}`}
            onClick={() => onToggle(row.id, channel.key)}
          >
            {channel.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 15.6 plans ---------------- */
export function PlanCard({ p, isCurrent, onPick }: { p: Plan; isCurrent: boolean; onPick: (id: string) => void }) {
  return (
    <div className={`gm-st-plan ${isCurrent ? "is-current" : ""} ${p.id === "premium" ? "is-featured" : ""}`}>
      <div className="gm-st-plan-head">
        <span className="gm-st-plan-icon">{p.icon}</span>
        <div>
          <strong className="font-display">{p.name}</strong>
          <small>{p.desc}</small>
        </div>
      </div>
      <div className="gm-st-plan-price">
        <strong className="font-display">{p.price === 0 ? "Free" : kes(p.price)}</strong>
        <small>{p.billing}</small>
      </div>
      <ul className="gm-st-plan-features">
        {p.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button type="button" className={`gm-btn gm-btn-block ${isCurrent ? "gm-btn-outline" : "gm-btn-lime"}`} onClick={() => onPick(p.id)}>
        {isCurrent ? "Manage this plan" : p.price > 299 ? "Talk to sales" : "Choose plan"}
      </button>
      {isCurrent ? <span className="gm-st-plan-badge">Current plan</span> : null}
    </div>
  );
}

export function PlanComparison({ rows }: { rows: { feature: string; free: string; premium: string; enterprise: string }[] }) {
  return (
    <div className="gm-st-matrix-wrap">
      <table className="gm-st-matrix is-plans">
        <thead>
          <tr>
            <th scope="col">Feature</th>
            <th scope="col">Free</th>
            <th scope="col">Premium</th>
            <th scope="col">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature}>
              <th scope="row">{row.feature}</th>
              <td>{row.free}</td>
              <td>{row.premium}</td>
              <td>{row.enterprise}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- FAQ / glossary / data ---------------- */
export function SettingsFaqList({ items, open, onOpen }: { items: { q: string; a: string }[]; open: number | null; onOpen: (index: number | null) => void }) {
  return (
    <div className="gm-st-faq">
      {items.map((item, index) => (
        <div key={item.q} className={`gm-st-faq-row ${open === index ? "is-open" : ""}`}>
          <button type="button" onClick={() => onOpen(open === index ? null : index)}>
            {item.q}
          </button>
          {open === index ? <p>{item.a}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function SettingsGlossary({ items }: { items: { term: string; def: string }[] }) {
  return (
    <div className="gm-st-glossary">
      {items.map((item) => (
        <div key={item.term}>
          <strong>{item.term}</strong>
          <span>{item.def}</span>
        </div>
      ))}
    </div>
  );
}

export function DataRow({ d, onAction }: { d: { id: string; label: string; desc: string; action: string; tone: "info" | "good" | "warn" }; onAction: (id: string) => void }) {
  return (
    <div className={`gm-st-data is-${d.tone}`}>
      <div>
        <strong>{d.label}</strong>
        <small>{d.desc}</small>
      </div>
      <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => onAction(d.id)}>
        {d.action}
      </button>
    </div>
  );
}

export function KvList({ items }: { items: { k: string; v: ReactNode }[] }) {
  return (
    <dl className="gm-st-kv">
      {items.map((item) => (
        <div key={item.k} className="gm-st-kv-row">
          <dt>{item.k}</dt>
          <dd>{item.v}</dd>
        </div>
      ))}
    </dl>
  );
}
