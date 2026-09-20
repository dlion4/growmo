import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Image as ImageIcon,
  type LucideIcon,
  Minus,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import { type ReactNode, useId } from "react";
import type {
  AiInsight,
  ChatAction,
  ChatBlock,
  ChatMessage,
  FertilizerProgram,
  MarketForecast,
  PestRisk,
  PlanScenario,
  SavedPlan,
} from "../../data/app/advisor";
import { kes } from "../../data/site";
import { StatusChip } from "./DashboardWidgets";

/* ============================ helpers ============================ */

export function riskTone(risk: PestRisk["risk"]): "low" | "medium" | "high" {
  return risk === "high" ? "high" : risk === "medium" ? "medium" : "low";
}

export function verdictTone(
  verdict: FertilizerProgram["verdict"],
): "low" | "medium" | "high" | "neutral" {
  return verdict === "recommended"
    ? "low"
    : verdict === "ok"
      ? "medium"
      : verdict === "suboptimal"
        ? "high"
        : "neutral";
}

export function TrendIcon({ trend }: { trend: MarketForecast["trend"] }) {
  const Icon: LucideIcon =
    trend === "rising"
      ? TrendingUp
      : trend === "falling"
        ? TrendingDown
        : Minus;
  const color =
    trend === "rising"
      ? "var(--gm-leaf-600)"
      : trend === "falling"
        ? "var(--gm-clay-500)"
        : "var(--gm-ink-400)";
  return <Icon width={15} height={15} style={{ color }} aria-hidden="true" />;
}

/* ============================ form + shared bits ============================ */

export function AiField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="gm-field">
      <label htmlFor={id}>{label}</label>
      <div id={id}>{children}</div>
      {hint ? <small className="text-muted">{hint}</small> : null}
    </div>
  );
}

export function AiModalFooter({
  children,
  align = "between",
}: {
  children: ReactNode;
  align?: "between" | "end";
}) {
  return (
    <div
      className={`d-flex flex-wrap gap-2 mt-3 ${
        align === "end" ? "justify-content-end" : "justify-content-between"
      }`}
    >
      {children}
    </div>
  );
}

export function AiNote({
  tone = "ok",
  title,
  children,
}: {
  tone?: "ok" | "warn" | "danger";
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`gm-ai-note ${tone === "warn" ? "warn" : tone === "danger" ? "danger" : ""}`}
    >
      {title ? (
        <strong className="d-block mb-1 font-display">{title}</strong>
      ) : null}
      <p>{children}</p>
    </div>
  );
}

export function AiFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="gm-ai-fact">
      <small>{label}</small>
      <strong className="font-display">{value}</strong>
    </div>
  );
}

export function AiFactGrid({ children }: { children: ReactNode }) {
  return <div className="gm-ai-fact-grid">{children}</div>;
}

export function AiSummary({
  title,
  note,
  chips,
  actions,
}: {
  title: string;
  note: string;
  chips?: string[];
  actions?: ReactNode;
}) {
  return (
    <div className="gm-ai-summary">
      <div style={{ flex: "1 1 260px" }}>
        <strong className="d-block">{title}</strong>
        <p className="mb-0">{note}</p>
        {chips?.length ? (
          <div className="d-flex flex-wrap gap-2 mt-2">
            {chips.map((chip) => (
              <span key={chip} className="gm-chip">
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {actions ? <div className="gm-ai-hero-actions">{actions}</div> : null}
    </div>
  );
}

export function AiKv({ label, value }: { label: string; value: string }) {
  return (
    <div className="gm-ai-kv">
      <span>{label}</span>
      <strong className="font-display">{value}</strong>
    </div>
  );
}

export function AiEmpty({ children }: { children: ReactNode }) {
  return <div className="gm-ai-empty">{children}</div>;
}

export function AiUploadDrop({
  picked,
  options,
  onPick,
}: {
  picked: string | null;
  options: { id: string; label: string; detail: string }[];
  onPick: (id: string) => void;
}) {
  return (
    <div>
      <div className="gm-ai-upload">
        <ImageIcon
          width={26}
          height={26}
          style={{ color: "var(--gm-leaf-600)" }}
        />
        <strong className="font-display">Piga picha ya jani</strong>
        <small className="text-muted">
          Pick the sample photo your field team uploaded — Leaf Vision analyses
          48,000 Kenyan leaf images.
        </small>
      </div>
      <div className="gm-ai-scan-preview mt-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={picked === option.id ? "is-picked" : ""}
            onClick={() => onPick(option.id)}
            aria-pressed={picked === option.id}
          >
            <ImageIcon width={20} height={20} />
            <span>{option.label}</span>
            <small>{option.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================ chat (9.1) ============================ */

export function AiTyping({ label }: { label: string }) {
  return (
    <div className="gm-ai-msg">
      <span className="gm-ai-ava">
        <Bot width={18} height={18} />
      </span>
      <div className="gm-ai-bubble">
        <span className="gm-ai-typing">
          <span className="gm-ai-dot" />
          <span className="gm-ai-dot" />
          <span className="gm-ai-dot" />
          {label}
        </span>
      </div>
    </div>
  );
}

function BlockTable({
  title,
  head,
  rows,
}: {
  title: string;
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="gm-ai-block">
      <h5>{title}</h5>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              {head.map((cell) => (
                <th key={cell} scope="col">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join(" | ")}>
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th key={`${head[cellIndex]}-${cell}`} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={`${head[cellIndex]}-${cell}`}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AiChatBlock({
  block,
  onAction,
}: {
  block: ChatBlock;
  onAction: (action: ChatAction) => void;
}) {
  if (block.kind === "options") {
    return (
      <div className="gm-ai-block">
        <h5>{block.title}</h5>
        {block.items.map((item) => (
          <div key={item.name} className="gm-ai-option">
            <div style={{ flex: "1 1 200px" }}>
              <strong className="font-display">{item.name}</strong>{" "}
              <small className="text-muted">· {item.supplier}</small>
              <small>{item.detail}</small>
              <small>{item.fit}</small>
            </div>
            <div className="d-flex flex-column align-items-end gap-1">
              <span className="font-display" style={{ fontWeight: 700 }}>
                {item.price}
              </span>
              <StatusChip label={item.fit} tone={item.tone} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (block.kind === "budget") {
    return (
      <div className="gm-ai-block">
        <h5>{block.title}</h5>
        {block.rows.map((row) => (
          <div key={row.label} className="gm-ai-budget-row">
            <span>{row.label}</span>
            <strong className="font-display">{kes(row.amount)}</strong>
          </div>
        ))}
        <div className="gm-ai-budget-total">
          <span className="fw-bold">Jumla · Total</span>
          <strong className="font-display">{kes(block.total)}</strong>
        </div>
        {block.caption ? (
          <small className="text-muted d-block mt-2">{block.caption}</small>
        ) : null}
      </div>
    );
  }

  if (block.kind === "steps") {
    return (
      <div className="gm-ai-block">
        <h5>{block.title}</h5>
        <ol className="gm-ai-steps">
          {block.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    );
  }

  if (block.kind === "payment") {
    return (
      <div className="gm-ai-block">
        <h5>{block.title}</h5>
        {block.rows.map((row) => (
          <div key={row.phone} className="gm-ai-pay-row">
            <div>
              <strong className="d-block">{row.name}</strong>
              <small className="text-muted">
                {row.masked} · {row.work}
              </small>
            </div>
            <span className="font-display" style={{ fontWeight: 700 }}>
              {kes(row.amount)}
            </span>
          </div>
        ))}
        <div className="gm-ai-budget-total">
          <span className="fw-bold">Jumla</span>
          <strong className="font-display">{kes(block.total)}</strong>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-mpesa gm-btn-block mt-3"
          onClick={() => onAction("pay")}
        >
          <CheckCircle2 /> {block.actionLabel} — weka PIN yako
        </button>
      </div>
    );
  }

  if (block.kind === "table") {
    return (
      <BlockTable title={block.title} head={block.head} rows={block.rows} />
    );
  }

  return (
    <div className="gm-ai-block">
      <h5>{block.title}</h5>
      <div className="gm-ai-chips">
        {block.chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            className="gm-btn gm-btn-soft gm-btn-sm"
            onClick={() => onAction(chip.action)}
          >
            {chip.label} <ArrowRight width={13} height={13} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function AiChatBubble({
  message,
  onAction,
  onFeedback,
}: {
  message: ChatMessage;
  onAction: (action: ChatAction) => void;
  onFeedback: (messageId: string, value: "up" | "down") => void;
}) {
  const mine = message.role === "farmer";
  return (
    <div className={`gm-ai-msg ${mine ? "is-me" : ""}`}>
      <span className="gm-ai-ava" aria-hidden="true">
        {mine ? (
          <User width={18} height={18} />
        ) : (
          <Bot width={18} height={18} />
        )}
      </span>
      <div className="gm-ai-bubble">
        <p>{message.text}</p>
        {message.blocks?.length ? (
          <div className="gm-ai-blocks">
            {message.blocks.map((block) => (
              <AiChatBlock
                key={`${message.id}-${block.kind}-${block.title}`}
                block={block}
                onAction={onAction}
              />
            ))}
          </div>
        ) : null}
        <div className="gm-ai-meta">
          <span>{message.at}</span>
          {message.lang ? <span>· {message.lang}</span> : null}
          {typeof message.confidence === "number" ? (
            <span>· {message.confidence}% confident</span>
          ) : null}
          {message.sources?.map((source) => (
            <span key={source} className="gm-ai-src">
              {source}
            </span>
          ))}
          {!mine ? (
            <span className="d-inline-flex gap-1 ms-auto">
              <button
                type="button"
                className="gm-icon-btn gm-btn-sm"
                aria-label="Mark this answer helpful"
                title="Helpful"
                onClick={() => onFeedback(message.id, "up")}
              >
                <ThumbsUp width={13} height={13} />
              </button>
              <button
                type="button"
                className="gm-icon-btn gm-btn-sm"
                aria-label="Flag this answer"
                title="Not helpful"
                onClick={() => onFeedback(message.id, "down")}
              >
                <ThumbsDown width={13} height={13} />
              </button>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ============================ insight feed ============================ */

export function AiInsightCard({
  insight,
  onOpen,
}: {
  insight: AiInsight;
  onOpen: (insight: AiInsight) => void;
}) {
  return (
    <button
      type="button"
      className={`gm-ai-insight tone-${insight.tone}`}
      onClick={() => onOpen(insight)}
    >
      <div className="d-flex align-items-center gap-2">
        <StatusChip label={insight.crop} tone={insight.tone} />
        <small className="text-muted">{insight.at}</small>
      </div>
      <h4>{insight.title}</h4>
      <p>{insight.detail}</p>
      <div className="gm-ai-insight-foot">
        <small className="text-muted">{insight.source}</small>
        <span className="gm-btn gm-btn-soft gm-btn-sm">
          {insight.actionLabel} <ArrowRight width={13} height={13} />
        </span>
      </div>
    </button>
  );
}

/* ============================ 9.2 plans ============================ */

export function AiPlanCard({
  plan,
  onOpen,
}: {
  plan: SavedPlan;
  onOpen: (plan: SavedPlan) => void;
}) {
  const pct = plan.budget ? Math.round((plan.spent / plan.budget) * 100) : 0;
  return (
    <div className="gm-ai-plan">
      <div className="d-flex align-items-start justify-content-between gap-2">
        <h4>{plan.name}</h4>
        <StatusChip
          label={plan.status}
          tone={
            plan.status === "Completed"
              ? "low"
              : plan.status === "Active"
                ? "medium"
                : "neutral"
          }
        />
      </div>
      <div className="gm-ai-plan-meta">
        <span>{plan.county}</span>
        <span>{plan.acres} acres</span>
        <span>{plan.activities} activities</span>
        <span>{plan.created}</span>
      </div>
      <div className="d-flex align-items-center gap-2">
        <div className="gm-progress" style={{ flex: "1 1 auto" }}>
          <i style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        <small className="text-muted">{pct}% spent</small>
      </div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <small className="text-muted">
          {kes(plan.spent)} of {kes(plan.budget)}
        </small>
        <span className="font-display" style={{ fontWeight: 700 }}>
          +{kes(plan.expectedProfit)}
        </span>
      </div>
      <button
        type="button"
        className="gm-btn gm-btn-outline gm-btn-sm gm-btn-block"
        onClick={() => onOpen(plan)}
      >
        Open plan <ArrowRight width={13} height={13} />
      </button>
    </div>
  );
}

export function AiScenarioCard({
  scenario,
  best,
}: {
  scenario: PlanScenario;
  best?: boolean;
}) {
  return (
    <div className={`gm-ai-scenario ${best ? "is-best" : ""}`}>
      <div className="d-flex align-items-center justify-content-between gap-2">
        <span className="gm-eyebrow">{scenario.name} case</span>
        <StatusChip label={scenario.tone} tone={scenario.tone} />
      </div>
      <strong className="font-display d-block mt-1">
        {kes(scenario.profit)}
      </strong>
      <small className="text-muted">profit · ROI {scenario.roi}%</small>
      <div className="gm-ai-fact-grid mt-2">
        <div className="gm-ai-fact">
          <small>Yield/acre</small>
          <strong className="font-display">{scenario.yieldPerAcre}</strong>
        </div>
        <div className="gm-ai-fact">
          <small>Revenue</small>
          <strong className="font-display">{kes(scenario.revenue)}</strong>
        </div>
      </div>
      <p className="mt-2 mb-0" style={{ fontSize: "0.82rem" }}>
        {scenario.note}
      </p>
    </div>
  );
}

/* ============================ 9.3 risk ============================ */

export function AiRiskCard({
  risk,
  onOpen,
}: {
  risk: PestRisk;
  onOpen: (risk: PestRisk) => void;
}) {
  const tone = riskTone(risk.risk);
  return (
    <button
      type="button"
      className={`gm-ai-risk sev-${risk.risk}`}
      onClick={() => onOpen(risk)}
    >
      <div className="gm-ai-risk-head">
        <div style={{ flex: "1 1 190px" }}>
          <h4>{risk.pest}</h4>
          <small className="text-muted">
            {risk.crop} · {risk.variety} · {risk.county}
          </small>
        </div>
        <span
          className="gm-ai-score"
          role="img"
          aria-label={`Risk score ${risk.score} of 100`}
        >
          {risk.score}
        </span>
      </div>
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <StatusChip label={`${risk.kind} · ${risk.risk} risk`} tone={tone} />
        <span className="gm-chip">{risk.confidence}% model confidence</span>
      </div>
      <p className="gm-ai-risk-msg">{risk.forecast}</p>
      <p
        className="gm-ai-risk-msg fw-bold"
        style={{ color: "var(--gm-ink-950)" }}
      >
        {risk.action}
      </p>
      <div className="gm-ai-risk-meta">
        <span>Next scout: {risk.nextScout}</span>
        <span>PHI: {risk.phi}</span>
        <span>Window: {risk.window}</span>
      </div>
    </button>
  );
}

/* ============================ 9.4 market ============================ */

export const SPARK_MONTHS = [
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
];

export function AiSparkline({
  series,
  label,
}: {
  series: number[];
  label: string;
}) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = Math.max(1, max - min);
  const points = series.map((value, index) => ({
    month: SPARK_MONTHS[index] ?? `M${index + 1}`,
    value,
  }));
  return (
    <div className="gm-ai-spark" role="img" aria-label={label}>
      {points.map((point) => (
        <i
          key={`${point.month}-${point.value}`}
          style={{
            height: `${Math.round(22 + ((point.value - min) / span) * 78)}%`,
          }}
        />
      ))}
    </div>
  );
}

export function AiMarketCard({
  market,
  onOpen,
}: {
  market: MarketForecast;
  onOpen: (market: MarketForecast) => void;
}) {
  const low = Math.min(market.month3Low, market.month1Low);
  const high = Math.max(market.month3High, market.month1High);
  const span = Math.max(1, high - low);
  const left = Math.round(((market.month1Low - low) / span) * 100);
  const width = Math.max(
    6,
    Math.round(((market.month1High - market.month1Low) / span) * 100),
  );
  return (
    <button
      type="button"
      className="gm-ai-market"
      onClick={() => onOpen(market)}
    >
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div>
          <strong className="d-block font-display">{market.crop}</strong>
          <small className="text-muted">
            {market.market} · per {market.unit}
          </small>
        </div>
        <StatusChip
          label={market.trendLabel}
          tone={
            market.trend === "rising"
              ? "low"
              : market.trend === "falling"
                ? "high"
                : "neutral"
          }
        />
      </div>
      <div className="d-flex align-items-center gap-2">
        <strong className="font-display">{kes(market.current)}</strong>
        <TrendIcon trend={market.trend} />
        <small className="text-muted">today</small>
      </div>
      <AiSparkline
        series={market.series}
        label={`${market.crop} 12-month price history at ${market.market}`}
      />
      <div className="gm-ai-range">
        <small>1M</small>
        <span className="gm-ai-range-track">
          <i style={{ left: `${left}%`, width: `${width}%` }} />
        </span>
        <small className="font-display">
          {market.month1Low}–{market.month1High}
        </small>
      </div>
      <p className="mb-0" style={{ fontSize: "0.82rem" }}>
        {market.advice}
      </p>
    </button>
  );
}

/* ============================ 9.5 benchmarking ============================ */

export function AiBenchBar({
  metric,
  onOpen,
}: {
  metric: {
    id: string;
    metric: string;
    yours: string;
    countyAvg: string;
    top10: string;
    diffPct: number;
    better: boolean;
    yoursValue: number;
    countyValue: number;
    topValue: number;
    lowerIsBetter: boolean;
    unit: string;
    tip: string;
  };
  onOpen: () => void;
}) {
  const max = Math.max(metric.yoursValue, metric.countyValue, metric.topValue);
  const pct = (value: number) => Math.max(4, Math.round((value / max) * 100));
  return (
    <div className="gm-ai-bench">
      <div className="gm-ai-bench-head">
        <strong>{metric.metric}</strong>
        <StatusChip
          label={`${metric.diffPct > 0 ? "+" : ""}${metric.diffPct}% vs average`}
          tone={metric.better ? "low" : "high"}
        />
      </div>
      <div
        className="gm-ai-bench-bar"
        role="img"
        aria-label={`${metric.metric}: you ${metric.yours}, county average ${metric.countyAvg}, top 10% ${metric.top10}`}
      >
        <i style={{ width: `${pct(metric.yoursValue)}%` }} />
        <span
          className="mark"
          style={{ left: `${pct(metric.countyValue)}%` }}
        />
        <span
          className="mark top"
          style={{ left: `${pct(metric.topValue)}%` }}
        />
      </div>
      <div className="gm-ai-bench-legend">
        <span>
          You <b>{metric.yours}</b>
        </span>
        <span>
          County avg <b>{metric.countyAvg}</b>
        </span>
        <span>
          Top 10% <b>{metric.top10}</b>
        </span>
      </div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
        <small className="text-muted">{metric.tip}</small>
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onOpen}
        >
          How measured
        </button>
      </div>
    </div>
  );
}

/* ============================ 9.6 fertilizer ============================ */

export function AiProgramCard({
  program,
  acres,
  onOpen,
}: {
  program: FertilizerProgram;
  acres: number;
  onOpen: (program: FertilizerProgram) => void;
}) {
  const total = Math.round(program.costPerAcre * acres);
  return (
    <div
      className={`gm-ai-program ${program.verdict === "recommended" ? "is-pick" : ""}`}
    >
      <div className="d-flex align-items-start justify-content-between gap-2">
        <h4>{program.approach}</h4>
        <StatusChip
          label={program.verdictLabel}
          tone={verdictTone(program.verdict)}
        />
      </div>
      <small className="text-muted">{program.program}</small>
      <span className="gm-ai-program-price">{kes(program.costPerAcre)}</span>
      <small className="text-muted">
        per acre · {kes(total)} for {acres} acres
      </small>
      <ul>
        <li>Rate: {program.rate}</li>
        <li>Yield: {program.yieldImpact}</li>
        <li>{program.applications.length} applications</li>
      </ul>
      <p className="mb-0" style={{ fontSize: "0.82rem" }}>
        {program.note}
      </p>
      <button
        type="button"
        className="gm-btn gm-btn-outline gm-btn-sm gm-btn-block"
        onClick={() => onOpen(program)}
      >
        View schedule <ArrowRight width={13} height={13} />
      </button>
    </div>
  );
}
