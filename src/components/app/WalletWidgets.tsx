/* ============================================================================
   PAGE 14 — WALLET widgets
   Small presentational pieces for /app/wallet. Every class is page-scoped
   (.gm-w-*) or a shared master-theme class; styling lives in src/wallet.css.
   ========================================================================== */
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  HandCoins,
  Lock,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Snowflake,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  AutoPayRule,
  DepositMethod,
  PayoutChannelId,
  PayoutLine,
  PayType,
  Recipient,
  SecurityControl,
  Txn,WALLET_CONTEXT, 
  WalletBudget
} from "../../data/app/wallet";
import { PAYOUT_CHANNELS } from "../../data/app/wallet";
import { kes } from "../../data/site";
import { ProgressLine, StatusChip } from "./DashboardWidgets";

/* ---------------- 14.1 hero ---------------- */
export function WalletHero({
  ctx,
  totals,
  onAction,
}: {
  ctx: typeof WALLET_CONTEXT;
  totals: { inflow: number; outflow: number; count: number };
  onAction: (id: "deposit" | "send" | "withdraw" | "freeze") => void;
}) {
  const actions: { id: "deposit" | "send" | "withdraw" | "freeze"; icon: ReactNode; label: string; sub: string }[] = [
    { id: "deposit", icon: <ArrowDownLeft />, label: "Deposit money", sub: "STK, Paybill, bank, agent, card" },
    { id: "send", icon: <ArrowUpRight />, label: "Send / pay", sub: "Workers, suppliers, bills, P2P" },
    { id: "withdraw", icon: <Banknote />, label: "Withdraw", sub: "To M-Pesa or your bank" },
    { id: "freeze", icon: <Snowflake />, label: "Freeze wallet", sub: "One-tap kill switch" },
  ];

  return (
    <section className="gm-w-hero">
      <div className="gm-w-hero-head">
        <div className="gm-w-hero-copy">
          <span className="gm-chip gm-chip-live">
            <span className="gm-dot-live" /> Safaricom Daraja · live
          </span>
          <h1 className="font-display">Wallet, payments & M-Pesa</h1>
          <p>
            GrowMO holds your farm wallet, sends M-Pesa to workers and suppliers, pays bills on schedule and
            keeps every receipt against the crop and budget it belongs to.
          </p>
          <div className="gm-w-hero-chips">
            <span className="gm-chip gm-chip-dark">{ctx.farmer}</span>
            <span className="gm-chip gm-chip-dark">{ctx.phone}</span>
            <span className="gm-chip gm-chip-dark">Paybill {ctx.paybill}</span>
            <span className="gm-chip gm-chip-dark">{ctx.accountNo}</span>
          </div>
        </div>

        <div className="gm-w-balance">
          <small>Available balance</small>
          <strong className="font-display">{kes(ctx.availableBalance)}</strong>
          <div className="gm-w-bal-row">
            <span>Free balance</span>
            <b>{kes(ctx.freeBalance)}</b>
          </div>
          <div className="gm-w-bal-row">
            <span>In budgets</span>
            <b>{kes(ctx.inBudgets)}</b>
          </div>
          <div className="gm-w-bal-row is-warn">
            <span>Pending outflows</span>
            <b>– {kes(ctx.pendingOutflows)}</b>
          </div>
          <div className="gm-w-bal-row is-strong">
            <span>Effective available</span>
            <b>{kes(ctx.effectiveAvailable)}</b>
          </div>
          <div className="gm-w-bal-foot">
            <span>
              <Wallet /> {ctx.tier} wallet
            </span>
            <span>
              <ShieldCheck /> {ctx.trustAccount}
            </span>
          </div>
        </div>
      </div>

      <div className="gm-w-hero-actions">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`gm-w-action ${action.id === "freeze" ? "is-quiet" : ""}`}
            onClick={() => onAction(action.id)}
          >
            <span className="gm-w-action-ic">{action.icon}</span>
            <strong>{action.label}</strong>
            <small>{action.sub}</small>
          </button>
        ))}
      </div>

      <div className="gm-w-hero-strip">
        <div>
          <small>Money in (Oct)</small>
          <b>{kes(totals.inflow)}</b>
        </div>
        <div>
          <small>Money out (Oct)</small>
          <b>{kes(totals.outflow)}</b>
        </div>
        <div>
          <small>Transactions logged</small>
          <b>{totals.count}</b>
        </div>
        <div>
          <small>Monthly deposits budget</small>
          <b>{kes(ctx.monthlyDeposits)}</b>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 14.5 transaction row ---------------- */
export function TxnRow({ t, onOpen }: { t: Txn; onOpen: (t: Txn) => void }) {
  return (
    <tr className="gm-w-txn" onClick={() => onOpen(t)}>
      <td>
        <span className={`gm-w-dir ${t.type === "In" ? "in" : "out"}`}>
          {t.type === "In" ? <ArrowDownLeft /> : <ArrowUpRight />}
        </span>
      </td>
      <td>
        <strong>{t.description}</strong>
        <small>
          {t.date} · {t.category}
          {t.crop ? ` · ${t.crop}` : ""}
        </small>
      </td>
      <td className={t.type === "In" ? "is-up" : "is-down"}>
        {t.type === "In" ? "+" : "–"}
        {kes(Math.abs(t.amount))}
      </td>
      <td className="gm-w-bal">{kes(t.balanceAfter)}</td>
      <td>
        <span className="gm-w-method">{t.method}</span>
      </td>
      <td>
        <span className="gm-w-ref">{t.refNo}</span>
      </td>
      <td>
        <StatusChip
          label={t.status}
          tone={t.status === "Success" ? "low" : t.status === "Pending" ? "medium" : "high"}
        />
      </td>
      <td>
        <button
          type="button"
          className="gm-iconbtn"
          aria-label={`Open ${t.refNo}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen(t);
          }}
        >
          <MoreHorizontal />
        </button>
      </td>
    </tr>
  );
}

/* ---------------- 14.2 deposit method ---------------- */
export function DepositMethodCard({ m, onPick }: { m: DepositMethod; onPick: (m: DepositMethod) => void }) {
  return (
    <button type="button" className="gm-w-method" onClick={() => onPick(m)}>
      <span className="gm-w-method-ic">{m.icon}</span>
      <strong>{m.name}</strong>
      <small>{m.swahili}</small>
      <ul className="gm-w-method-facts">
        <li>
          <span>Speed</span>
          <b>{m.speed}</b>
        </li>
        <li>
          <span>Fee</span>
          <b>{m.fee}</b>
        </li>
        <li>
          <span>Range</span>
          <b>
            {kes(m.min)} – {kes(m.max)}
          </b>
        </li>
      </ul>
      <span className="gm-w-method-cta">Deposit →</span>
    </button>
  );
}

/* ---------------- 14.3 pay type ---------------- */
export function PayTypeCard({ p, onPick }: { p: PayType; onPick: (p: PayType) => void }) {
  return (
    <button type="button" className="gm-w-paytype" onClick={() => onPick(p)}>
      <span className="gm-w-method-ic">{p.icon}</span>
      <strong>{p.label}</strong>
      <small>{p.swahili}</small>
      <p className="gm-w-paytype-hint">{p.hint}</p>
    </button>
  );
}

export function RecipientCard({ r, onPick }: { r: Recipient; onPick: (r: Recipient) => void }) {
  return (
    <button type="button" className="gm-w-recipient" onClick={() => onPick(r)}>
      <span className="gm-ava">{r.avatar}</span>
      <span className="gm-w-recipient-copy">
        <strong>{r.name}</strong>
        <small>
          {r.role} · {r.phone}
        </small>
      </span>
      <span className="gm-w-recipient-last">{kes(r.recent)}</span>
    </button>
  );
}

/* ---------------- 14.4 autopay ---------------- */
export function AutopayRuleRow({
  r,
  onToggle,
  onEdit,
}: {
  r: AutoPayRule;
  onToggle: (id: string) => void;
  onEdit: (r: AutoPayRule) => void;
}) {
  const on = r.status === "Active";
  return (
    <div className={`gm-w-rule ${on ? "is-on" : "is-off"}`}>
      <div className="gm-w-rule-main">
        <div className="gm-w-rule-head">
          <strong>{r.label}</strong>
          <StatusChip label={r.status} tone={on ? "low" : "medium"} />
        </div>
        <small>
          {r.trigger} → {r.recipients}
        </small>
        <small className="gm-w-rule-meta">
          Amount {r.amount} · cap {kes(r.amountCap)} · last {r.lastTriggered} · next {r.nextRun}
        </small>
        <p className="gm-w-rule-note">{r.note}</p>
      </div>
      <div className="gm-w-rule-actions">
        <button type="button" className={`gm-btn gm-btn-sm ${on ? "gm-btn-soft" : "gm-btn-lime"}`} onClick={() => onToggle(r.id)}>
          {on ? "Pause" : "Resume"}
        </button>
        <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => onEdit(r)}>
          Edit rule
        </button>
      </div>
    </div>
  );
}

/* ---------------- 14.6 budgets ---------------- */
export function BudgetCard({ b, onOpen }: { b: WalletBudget; onOpen: (b: WalletBudget) => void }) {
  const pct = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0;
  const remaining = b.allocated - b.spent;
  return (
    <button type="button" className="gm-w-budget" onClick={() => onOpen(b)}>
      <div className="gm-w-budget-head">
        <span className="gm-w-budget-emoji">{b.emoji}</span>
        <div>
          <strong>{b.name}</strong>
          <small>{b.crop ? `${b.crop} budget` : "Unallocated envelope"}</small>
        </div>
      </div>
      <div className="gm-w-budget-figures">
        <span>{kes(b.spent)}</span>
        <small>spent of {kes(b.allocated)}</small>
      </div>
      <ProgressLine value={pct} label={`${b.name} ${pct}% spent`} />
      <small className={remaining > 0 ? "is-good" : "is-quiet"}>
        {b.allocated === 0
          ? "Nothing allocated yet"
          : remaining > 0
            ? `${kes(remaining)} still available for this crop`
            : "Fully spent — top up to keep spending"}
      </small>
    </button>
  );
}

/* ---------------- 14.7 security ---------------- */
export function SecurityRow({ s, onToggle }: { s: SecurityControl; onToggle: (id: string) => void }) {
  return (
    <div className="gm-w-sec">
      <span className={`gm-w-sec-ic ${s.enabled ? "is-on" : ""}`}>
        <Lock />
      </span>
      <div className="gm-w-sec-copy">
        <strong>{s.k}</strong>
        <small>{s.v}</small>
      </div>
      {s.lockable ? (
        <button
          type="button"
          className={`gm-btn gm-btn-sm ${s.enabled ? "gm-btn-soft" : "gm-btn-outline"}`}
          onClick={() => onToggle(s.id)}
        >
          {s.enabled ? "On" : "Off"}
        </button>
      ) : (
        <span className="gm-chip gm-chip-lime">Always on</span>
      )}
    </div>
  );
}

/* ---------------- shared bits ---------------- */
export function WalletKv({ items }: { items: { k: string; v: ReactNode }[] }) {
  return (
    <dl className="gm-w-kv">
      {items.map((item) => (
        <div key={item.k} className="gm-w-kv-row">
          <dt>{item.k}</dt>
          <dd>{item.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function WalletCallout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "good" | "warn";
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={`gm-w-callout is-${tone}`}>
      {title ? <strong>{title}</strong> : null}
      <p>{children}</p>
    </div>
  );
}

export function LimitMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.round((used / limit) * 100);
  return (
    <div className="gm-w-limit">
      <div className="gm-w-limit-head">
        <span>{label}</span>
        <b>
          {kes(used)} of {kes(limit)}
        </b>
      </div>
      <ProgressLine value={pct} label={`${label} ${pct}% used`} />
      <small>{pct}% used · resets on the 1st</small>
    </div>
  );
}

export function WalletFaqList({
  items,
  open,
  onOpen,
}: {
  items: { q: string; a: string }[];
  open: number | null;
  onOpen: (index: number | null) => void;
}) {
  return (
    <div className="gm-w-faq">
      {items.map((item, index) => (
        <div key={item.q} className={`gm-w-faq-row ${open === index ? "is-open" : ""}`}>
          <button type="button" onClick={() => onOpen(open === index ? null : index)}>
            {item.q}
          </button>
          {open === index ? <p>{item.a}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function WalletGlossary({ items }: { items: { term: string; def: string }[] }) {
  return (
    <div className="gm-w-glossary">
      {items.map((item) => (
        <div key={item.term}>
          <strong>{item.term}</strong>
          <span>{item.def}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- 14.3c bulk payout ---------------- */
export function payoutInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const out = parts.length >= 2 ? parts[0].charAt(0) + parts[parts.length - 1].charAt(0) : parts[0].charAt(0);
  return out.toUpperCase() || "?";
}

export function ChannelChip({ channel }: { channel: PayoutChannelId }) {
  const c = PAYOUT_CHANNELS.find((x) => x.id === channel) ?? PAYOUT_CHANNELS[0];
  return <span className={`gm-w-channel is-${channel}`}>{c.icon} {c.label}</span>;
}

/**
 * The page card that opens the 7-step bulk payout wizard.
 * `compact` renders a slim horizontal variant for side columns.
 */
export function BulkPayoutCard({ onOpen, compact = false }: { onOpen: () => void; compact?: boolean }) {
  if (compact) {
    return (
      <button type="button" className="gm-w-bulk is-compact" onClick={onOpen}>
        <span className="gm-w-bulk-ic">
          <HandCoins />
        </span>
        <span className="gm-w-bulk-copy">
          <strong>Bulk payout</strong>
          <small>Many payees, one run — pay, schedule or record cash</small>
        </span>
        <span className="gm-w-bulk-cta">
          Open <ArrowUpRight />
        </span>
      </button>
    );
  }
  return (
    <section className="gm-w-bulk">
      <span className="gm-w-bulk-ic">
        <HandCoins />
      </span>
      <div className="gm-w-bulk-copy">
        <div className="gm-w-bulk-headline">
          <strong className="font-display">Bulk payout wizard</strong>
          <span className="gm-chip gm-chip-lime">7 steps</span>
          <span className="gm-chip gm-chip-ghost">
            <Users /> keep adding payees
          </span>
        </div>
        <p>
          Pay many payees in one run. Add them one by one — M-Pesa phones, bank accounts, GrowMO wallet IDs or cash —
          set each amount, then pay now, schedule the release, or record cash you already handed over with a proper
          invoice & payslip.
        </p>
        <div className="gm-w-bulk-chips">
          {PAYOUT_CHANNELS.map((c) => (
            <span key={c.id}>
              {c.icon} {c.label}
            </span>
          ))}
        </div>
      </div>
      <div className="gm-w-bulk-side">
        <ul>
          <li>Unlimited payees — add as many as you like</li>
          <li>Schedule for payday, Monday or the 1st</li>
          <li>Invoice + payslip when you paid cash</li>
          <li>Split the batch across budget envelopes</li>
        </ul>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onOpen}>
          Open the wizard <ArrowUpRight />
        </button>
      </div>
    </section>
  );
}

export function PayoutLineRow({
  line,
  editable = false,
  onRemove,
  onAmount,
  onMemo,
}: {
  line: PayoutLine;
  editable?: boolean;
  onRemove: (id: string) => void;
  onAmount?: (id: string, value: number) => void;
  onMemo?: (id: string, value: string) => void;
}) {
  return (
    <div className={`gm-w-payout-row ${editable ? "is-edit" : ""}`}>
      <span className="gm-w-payout-ava">{payoutInitials(line.name)}</span>
      <div className="gm-w-payout-copy">
        <strong>{line.name}</strong>
        <small>{line.identifier || "—"}</small>
        <ChannelChip channel={line.channel} />
      </div>
      {editable ? (
        <>
          <input
            className="gm-input gm-w-payout-amt"
            type="number"
            min={100}
            value={line.amount}
            aria-label={`Amount for ${line.name}`}
            onChange={(event) => onAmount?.(line.id, Number(event.target.value))}
          />
          <input
            className="gm-input gm-w-payout-memo"
            type="text"
            placeholder="Note (e.g. 3 days weeding)"
            value={line.memo}
            aria-label={`Note for ${line.name}`}
            onChange={(event) => onMemo?.(line.id, event.target.value)}
          />
        </>
      ) : (
        <>
          {line.memo ? <small className="gm-w-payout-memo-static">{line.memo}</small> : null}
          <b>{kes(line.amount)}</b>
        </>
      )}
      <button type="button" className="gm-iconbtn" aria-label={`Remove ${line.name} from the batch`} onClick={() => onRemove(line.id)}>
        <X />
      </button>
    </div>
  );
}

export function PayoutTotalBar({ lines, fee, funding }: { lines: PayoutLine[]; fee: number; funding: string }) {
  const total = lines.reduce((sum, l) => sum + (l.amount > 0 ? l.amount : 0), 0);
  return (
    <div className="gm-w-batch-total">
      <div>
        <small>Payees</small>
        <b>{lines.length}</b>
      </div>
      <div>
        <small>Batch total</small>
        <b>{kes(total)}</b>
      </div>
      <div>
        <small>Fee estimate</small>
        <b>{fee === 0 ? "Free" : kes(fee)}</b>
      </div>
      <div>
        <small>Funding</small>
        <b>{funding}</b>
      </div>
    </div>
  );
}

/** Quick-add chip for a saved payee inside the wizard. */
export function PayeeChip({
  r,
  added,
  onPick,
}: {
  r: Recipient;
  added: boolean;
  onPick: (r: Recipient) => void;
}) {
  return (
    <button type="button" className={`gm-w-payee-chip ${added ? "is-added" : ""}`} disabled={added} onClick={() => onPick(r)}>
      <span className="gm-ava">{r.avatar}</span>
      <span>{r.name}</span>
      {added ? <span className="gm-w-payee-chip-state">Added</span> : <Plus />}
    </button>
  );
}
