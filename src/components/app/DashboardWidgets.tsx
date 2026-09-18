import { ChevronLeft, ChevronRight, type LucideIcon, X } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { lockScroll, unlockScroll } from "../../store/scroll-lock";

export function DashboardSectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="gm-dash-section-title">
      <div>
        {eyebrow ? <span className="gm-eyebrow">{eyebrow}</span> : null}
        <h2 className="gm-h-section">{title}</h2>
        {subtitle ? <p className="gm-lead mb-0">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatusChip({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "low" | "medium" | "high" | "neutral";
}) {
  const riskClass = tone === "neutral" ? "" : `gm-risk gm-risk-${tone}`;
  return <span className={`gm-chip ${riskClass}`}>{label}</span>;
}

export function ProgressLine({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="gm-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function DashboardMetric({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="gm-stat">
      <span className="gm-mega-icon">
        <Icon />
      </span>
      <strong className="gm-stat-value font-display">{value}</strong>
      <span className="gm-stat-label">{label}</span>
      <small className="gm-stat-sub">{note}</small>
    </div>
  );
}

export function WizardActions({
  step,
  last,
  onBack,
  onNext,
  nextLabel = "Continue",
  finishLabel = "Finish",
  nextDisabled = false,
}: {
  step: number;
  last: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  finishLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="d-flex justify-content-between gap-2 mt-3">
      <button
        type="button"
        className="gm-btn gm-btn-outline"
        disabled={step === 0}
        onClick={onBack}
      >
        <ChevronLeft /> Back
      </button>
      <button
        type="button"
        className="gm-btn gm-btn-lime"
        disabled={nextDisabled}
        onClick={onNext}
      >
        {step === last ? finishLabel : nextLabel}
        {step < last ? <ChevronRight /> : null}
      </button>
    </div>
  );
}

export function DashboardDrawer({
  open,
  title,
  children,
  footer,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return () => unlockScroll();
  }, [open]);

  if (!open) return null;
  return (
    <>
      <button
        type="button"
        className="gm-scrim is-visible"
        aria-label={`Close ${title}`}
        onClick={onClose}
      />
      <aside
        className="gm-drawer wide is-visible"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="gm-drawer-head">
          <strong className="font-display">{title}</strong>
          <button
            type="button"
            className="gm-icon-btn on-dark"
            aria-label={`Close ${title}`}
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <div className="gm-drawer-body">{children}</div>
        {footer ? <div className="gm-drawer-foot">{footer}</div> : null}
      </aside>
    </>
  );
}
