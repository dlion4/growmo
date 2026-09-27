/* ============================================================================
   PAGE 14 — PAYMENTS, WALLET & MOBILE MONEY  (/app/wallet)

   Blueprint sections implemented
   14.1 Wallet dashboard      14.2 Deposit money (5 rails, live STK flow)
   14.3 Send money / pay      14.3c Bulk payout (7-step wizard + 5 modals)
   14.4 Auto-pay management   14.5 Transaction history
   14.6 Budget allocation     14.7 Security & controls

   The page keeps a working ledger in local state: deposits, pays, withdrawals,
   reversals, budget moves, auto-pay edits, bulk batches and freezes all change
   the screen.
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Download,
  FileSpreadsheet,
  HelpCircle,
  LayoutGrid,
  List,
  Lock,
  MoreHorizontal,
  Printer,
  Settings2,
  Share2,
  ShieldCheck,
  Snowflake,
  Users,
  Wallet as WalletIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import {
  AddRecipientDialog,
  AutopayEditDialog,
  BudgetDetailDialog,
  type BulkPayoutResult,
  BulkPayoutWizard,
  ConfirmWalletDialog,
  DepositWizard,
  FreezeConfirmDialog,
  SendMoneyWizard,
  TxnDetailDialog,
  WalletFaqDialog,
  WalletSettingsDialog,
  WalletShareDialog,
  WithdrawWizard,
} from "../../components/app/WalletModals";
import {
  AutopayRuleRow,
  BudgetCard,
  BulkPayoutCard,
  DepositMethodCard,
  LimitMeter,
  PayTypeCard,
  RecipientCard,
  SecurityRow,
  TxnRow,
  WalletCallout,
  WalletFaqList,
  WalletGlossary,
  WalletHero,
  WalletKv,
} from "../../components/app/WalletWidgets";
import { Pagination } from "../../components/ui/primitives";
import type { PayoutLine, Recipient, Txn, WalletBudget } from "../../data/app/wallet";
import {
  AUTOPAY_RULES,
  DEPOSIT_METHODS,
  PAY_TYPES,
  QUICK_RECIPIENTS,
  SECURITY_CONTROLS,
  TRANSACTIONS,
  TXN_CATEGORIES,
  TXN_METHODS,
  TXN_STATUSES,
  TXN_TYPES,
  WALLET_ALERTS,
  WALLET_BUDGETS,
  WALLET_CONTEXT,
  WALLET_FAQ,
  WALLET_GLOSSARY,
  walletTotals,
} from "../../data/app/wallet";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/wallet")({
  component: WalletPage,
  ssr: true,
  head: () => ({ meta: [{ title: "Wallet & M-Pesa — GrowMO" }] }),
});

type WalletView = "overview" | "deposit" | "send" | "autopay" | "history" | "budgets" | "security";

function downloadText(filename: string, body: string, type = "text/csv") {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

/* 14.3c bulk payout — ledger mapping per payee channel & batch purpose. */
const CHANNEL_METHOD: Record<PayoutLine["channel"], string> = {
  mpesa: "M-Pesa B2C",
  bank: "Bank",
  growmo: "Internal",
  cash: "Cash record",
};
const PURPOSE_CATEGORY: Record<string, string> = {
  "Labour payout": "Labour",
  "Supplier invoices": "Inputs",
  Advances: "Advance",
  "Co-op shares": "Co-op",
  "Custom batch": "General",
};

function WalletPage() {
  const toast = useToast();
  const [view, setView] = useState<WalletView>("overview");
  const [ctx, setCtx] = useState(WALLET_CONTEXT);
  const [txns, setTxns] = useState<Txn[]>(TRANSACTIONS);
  const [rules, setRules] = useState(AUTOPAY_RULES);
  const [budgets, setBudgets] = useState<WalletBudget[]>(WALLET_BUDGETS);
  const [recipients, setRecipients] = useState<Recipient[]>(QUICK_RECIPIENTS);
  const [security, setSecurity] = useState(SECURITY_CONTROLS);
  const [frozen, setFrozen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const [depositOpen, setDepositOpen] = useState(false);
  const [depositMethod, setDepositMethod] = useState(DEPOSIT_METHODS[0].id);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendPreset, setSendPreset] = useState<{ type?: string; recipient?: string; amount?: number }>({});
  const [bulkOpen, setBulkOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [payeeOpen, setPayeeOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [activeTxn, setActiveTxn] = useState<Txn | null>(null);
  const [activeRule, setActiveRule] = useState<(typeof AUTOPAY_RULES)[number] | null>(null);
  const [activeBudget, setActiveBudget] = useState<WalletBudget | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; body: string; label: string; run: () => void } | null>(null);
  const [busyFilter, setBusyFilter] = useState({ type: "All", method: "All", status: "All", category: "All" });
  const [page, setPage] = useState(0);

  const totals = walletTotals();

  const filtered = useMemo(
    () =>
      txns.filter(
        (t) =>
          (busyFilter.type === "All" || t.type === busyFilter.type) &&
          (busyFilter.method === "All" || t.method === busyFilter.method) &&
          (busyFilter.status === "All" || t.status === busyFilter.status) &&
          (busyFilter.category === "All" || t.category === busyFilter.category),
      ),
    [txns, busyFilter],
  );
  const perPage = 8;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice(page * perPage, page * perPage + perPage);

  const spendThisMonth = txns
    .filter((t) => t.type === "Out" && t.iso.startsWith("2026-10"))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  function pushTxn(row: Omit<Txn, "id" | "iso" | "date" | "balanceAfter"> & { id: string; noBalance?: boolean }) {
    setTxns((current) => {
      const nextBalance = current[0] ? current[0].balanceAfter : ctx.availableBalance;
      const signed = row.noBalance ? 0 : row.type === "In" ? row.amount : -Math.abs(row.amount);
      const { noBalance: _ignored, ...rest } = row;
      const entry: Txn = {
        ...rest,
        amount: row.type === "Out" ? -Math.abs(row.amount) : row.amount,
        iso: new Date().toISOString().slice(0, 16),
        date: new Date().toLocaleString("en-KE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        balanceAfter: nextBalance + signed,
      };
      return [entry, ...current];
    });
  }

  /* 14.3c bulk payout — one wizard run becomes one ledger line per payee. */
  function handleBulkPayout(result: BulkPayoutResult) {
    if (result.mode === "cash") {
      result.lines.forEach((line, i) => {
        pushTxn({
          id: `${result.invoiceNo}-${i}`,
          type: "Out",
          description: `Cash paid: ${line.name} (${result.purpose})${line.memo ? ` · ${line.memo}` : ""}`,
          amount: line.amount,
          method: "Cash record",
          refNo: result.invoiceNo ?? "INV",
          status: "Success",
          category: "Invoice",
          noBalance: true,
        });
      });
      toast.notify(`Invoice ${result.invoiceNo} issued — ${result.lines.length} payslips created, no wallet movement.`, "success");
      return;
    }
    if (result.mode === "now") {
      setCtx((current) => ({
        ...current,
        availableBalance: Math.max(0, current.availableBalance - result.total),
        monthSpent: current.monthSpent + result.total,
        todaySpent: current.todaySpent + result.total,
      }));
    } else {
      setCtx((current) => ({ ...current, pendingOutflows: current.pendingOutflows + result.total }));
    }
    const category = PURPOSE_CATEGORY[result.purpose] ?? "General";
    result.lines.forEach((line, i) => {
      pushTxn({
        id: `${result.batchRef}-${i}`,
        type: "Out",
        description:
          result.mode === "scheduled"
            ? `Scheduled (${result.scheduleLabel}): ${line.name} — ${result.purpose}`
            : `Batch: ${line.name} — ${result.purpose}${line.memo ? ` · ${line.memo}` : ""}`,
        amount: line.amount,
        method: CHANNEL_METHOD[line.channel],
        refNo: result.lineRefs[i] ?? result.batchRef,
        status: result.mode === "scheduled" ? "Pending" : "Success",
        category,
      });
    });
    toast.notify(
      result.mode === "now"
        ? `Batch released — ${result.lines.length} payees, ${kes(result.total)}. Each got an SMS receipt.`
        : `Batch scheduled for ${result.scheduleLabel} — ${result.lines.length} payees, ${kes(result.total)} held.`,
      "success",
    );
  }

  function goTo(next: WalletView, message: string) {
    setView(next);
    setPage(0);
    toast.notify(message, "info");
  }

  function exportCsv() {
    const rows = [
      ["Date", "Direction", "Description", "Category", "Method", "Reference", "Status", "Amount (KES)"],
      ...filtered.map((t) => [t.date, t.type, t.description, t.category, t.method, t.refNo, t.status, t.amount]),
    ];
    downloadText("growmo-wallet-oct-2026.csv", rows.map((row) => row.map(csvCell).join(",")).join("\n"));
    toast.notify(`Exported ${filtered.length} transactions to CSV.`, "success");
  }

  return (
    <main className="gm-app-page gm-wallet-page">
      <div className="gm-container py-4">
        {/* breadcrumb + tools menu */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Link to="/app/dashboard" className="gm-back-link">
              Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">System</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Wallet & payments</strong>
            {frozen ? <StatusChip label="Wallet frozen" tone="high" /> : <StatusChip label="Live · Daraja" tone="low" />}
          </div>
          <div className="gm-menu-wrap">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setMenu((current) => !current)} aria-expanded={menu}>
              <MoreHorizontal /> Wallet tools
            </button>
            {menu ? (
              <div className="gm-dropdown gm-finance-menu">
                <button type="button" onClick={() => { setSendOpen(true); setSendPreset({}); setMenu(false); }}>
                  <ArrowUpRight /> Send money
                </button>
                <button type="button" onClick={() => { setBulkOpen(true); setMenu(false); }}>
                  <Users /> Bulk payout
                </button>
                <button type="button" onClick={() => { setDepositOpen(true); setDepositMethod("stk"); setMenu(false); }}>
                  <ArrowDownLeft /> Deposit money
                </button>
                <button type="button" onClick={() => { exportCsv(); setMenu(false); }}>
                  <FileSpreadsheet /> Export transactions (CSV)
                </button>
                <button type="button" onClick={() => { setShareOpen(true); setMenu(false); }}>
                  <Share2 /> Share a statement
                </button>
                <button type="button" onClick={() => { setSettingsOpen(true); setMenu(false); }}>
                  <Settings2 /> Wallet settings
                </button>
                <button type="button" onClick={() => { setFaqModalOpen(true); setMenu(false); }}>
                  <HelpCircle /> Wallet help & glossary
                </button>
                <button type="button" onClick={() => { window.print(); setMenu(false); toast.notify("Printing the wallet page as it appears on screen.", "info"); }}>
                  <Printer /> Print statement
                </button>
                <button type="button" onClick={() => { setConfirm({ title: "Run the Friday payout early?", body: "All verified October tasks will be paid to the saved workers now instead of the Friday run.", label: "Run payout", run: () => { pushTxn({ id: "payout", type: "Out", description: "Early Friday payout (4 workers)", amount: 9312, method: "M-Pesa B2C", refNo: "PLPAYOUT", status: "Success", category: "Labour" }); toast.notify("Payout queued — workers get an SMS receipt each.", "success"); } }); setMenu(false); }}>
                  <CalendarClock /> Run payout now
                </button>
                <button type="button" onClick={() => { setFreezeOpen(true); setMenu(false); }}>
                  <Snowflake /> Freeze wallet
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <WalletHero ctx={{ ...ctx, availableBalance: frozen ? 0 : ctx.availableBalance }} totals={totals} onAction={(id) => {
          if (id === "deposit") { setDepositMethod("stk"); setDepositOpen(true); return; }
          if (id === "send") { setSendPreset({}); setSendOpen(true); return; }
          if (id === "withdraw") { setWithdrawOpen(true); return; }
          setFreezeOpen(true);
        }} />

        {frozen ? (
          <WalletCallout tone="warn" title="Wallet frozen">
            Sends, withdrawals and auto-pay are paused. Unfreeze from Security & controls with your PIN when you are ready.
          </WalletCallout>
        ) : null}

        {/* 14.1 KPI band */}
        <div className="row g-3 mt-3">
          <div className="col-6 col-lg-3">
            <DashboardMetric icon={WalletIcon} label="Available balance" value={kes(frozen ? 0 : ctx.availableBalance)} note={`Free ${kes(ctx.freeBalance)} · budgets ${kes(ctx.inBudgets)}`} />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetric icon={ArrowDownLeft} label="Deposits this month" value={kes(ctx.monthlyDeposits)} note={`${txns.filter((t) => t.category === "Deposit").length} deposits logged`} />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetric icon={ArrowUpRight} label="Spend this month" value={kes(spendThisMonth)} note={`Budget of ${kes(ctx.monthlySpend)} · ${Math.round((spendThisMonth / ctx.monthlySpend) * 100)}% used`} />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetric icon={ShieldCheck} label="Auto-pay rules" value={`${rules.filter((r) => r.status === "Active").length} active`} note={`${rules.filter((r) => r.status === "Paused").length} paused · caps applied`} />
          </div>
        </div>

        {/* alerts */}
        <div className="row g-2 mt-3">
          {WALLET_ALERTS.map((alert) => (
            <div className="col-lg-4" key={alert.id}>
              <WalletCallout tone={alert.tone === "success" ? "good" : alert.tone}>{alert.text}</WalletCallout>
            </div>
          ))}
        </div>

        {/* 14.1–14.7 tabs */}
        <div className="mt-4">
          <PlannerSubtabs
            label="Wallet sections"
            value={view}
            onChange={(next) => setView(next)}
            items={[
              { id: "overview", label: "Wallet", icon: <LayoutGrid /> },
              { id: "deposit", label: "Deposit", icon: <ArrowDownLeft /> },
              { id: "send", label: "Send / pay", icon: <ArrowUpRight /> },
              { id: "autopay", label: "Auto-pay", count: rules.filter((r) => r.status === "Active").length },
              { id: "history", label: "History", icon: <List />, count: txns.length },
              { id: "budgets", label: "Budgets" },
              { id: "security", label: "Security", icon: <Lock /> },
            ]}
          />
        </div>

        {/* ---------------- 14.1 wallet dashboard ---------------- */}
        {view === "overview" ? (
          <div className="mt-3">
            <div className="row g-4">
              <div className="col-xl-7">
                <DashboardSectionHeader eyebrow="14.1" title="Today at a glance" subtitle="Balances, limits and the money that moved in the last few days." />
                <div className="gm-card p-3">
                  <LimitMeter label="Daily send limit" used={ctx.todaySpent} limit={ctx.dailyLimit} />
                  <LimitMeter label="Monthly send limit" used={spendThisMonth} limit={ctx.monthlyLimit} />
                  <WalletKv
                    items={[
                      { k: "Pending outflows", v: kes(ctx.pendingOutflows) },
                      { k: "Effective available", v: <strong>{kes(ctx.effectiveAvailable)}</strong> },
                      { k: "Settlement", v: ctx.settlement },
                      { k: "Trust account", v: ctx.trustAccount },
                      { k: "Wallet reference", v: ctx.accountNo },
                    ]}
                  />
                </div>

                <DashboardSectionHeader eyebrow="14.5" title="Latest movements" subtitle="Every line is a real receipt you can reopen." action={<button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => goTo("history", "Showing the full transaction history.")}>Open history</button>} />
                <div className="gm-table-wrap">
                  <table className="gm-table">
                    <thead>
                      <tr>
                        <th>Dir</th>
                        <th>What</th>
                        <th>Amount</th>
                        <th>Balance</th>
                        <th>Method</th>
                        <th>Receipt</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {txns.slice(0, 6).map((t) => (
                        <TxnRow key={t.id} t={t} onOpen={setActiveTxn} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-xl-5">
                <DashboardSectionHeader eyebrow="14.3" title="Pay someone now" subtitle="Saved payees keep the whitelist useful." action={<button type="button" className="gm-btn gm-btn-sm gm-btn-soft" onClick={() => setPayeeOpen(true)}>Add payee</button>} />
                <div className="gm-w-recipient-grid">
                  {recipients.slice(0, 5).map((person) => (
                    <RecipientCard key={person.id} r={person} onPick={(picked) => { setSendPreset({ recipient: picked.name }); setSendOpen(true); }} />
                  ))}
                </div>
                <div className="mt-3">
                  <BulkPayoutCard compact onOpen={() => setBulkOpen(true)} />
                </div>

                <DashboardSectionHeader eyebrow="14.6" title="Budget envelopes" subtitle="Ring-fenced money per crop." />
                <div className="gm-w-budget-grid">
                  {budgets.map((budget) => (
                    <BudgetCard key={budget.id} b={budget} onOpen={setActiveBudget} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 14.2 deposit ---------------- */}
        {view === "deposit" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="14.2"
              title="Five ways to top up the wallet"
              subtitle="M-Pesa STK push, Paybill 247247, bank transfer, a GrowMO agent or a card."
            />
            <div className="gm-w-method-grid">
              {DEPOSIT_METHODS.map((method) => (
                <DepositMethodCard key={method.id} m={method} onPick={(picked) => { setDepositMethod(picked.id); setDepositOpen(true); }} />
              ))}
            </div>
            <div className="row g-3 mt-3">
              <div className="col-lg-7">
                <WalletKv
                  items={[
                    { k: "Paybill", v: `${ctx.paybill} · account ${ctx.accountNumber}` },
                    { k: "Bank details", v: ctx.trustAccount },
                    { k: "Trust reference", v: ctx.accountNo },
                    { k: "Monthly deposits", v: kes(ctx.monthlyDeposits) },
                    { k: "Limit", v: `${kes(ctx.dailyLimit)} per day · ${kes(ctx.monthlyLimit)} per month` },
                  ]}
                />
              </div>
              <div className="col-lg-5">
                <WalletCallout tone="info" title="Deposits are free through M-Pesa">
                  STK push and Paybill cost nothing. Bank transfers cost KES 50, agent deposits KES 20 and cards 1.5%.
                  Airtime-style rounding never applies — you receive the exact amount you send.
                </WalletCallout>
                <WalletCallout tone="good" title="Every deposit matches a purpose">
                  Tag the deposit to a crop budget when it lands so input spending stays traceable to the harvest it funded.
                </WalletCallout>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 14.3 send / pay ---------------- */}
        {view === "send" ? (
          <div className="mt-3">
            <DashboardSectionHeader eyebrow="14.3" title="Pay workers, suppliers, banks and bills" subtitle="Five rails, one ledger. Payouts write themselves into labour and input records." />
            <div className="mb-3">
              <BulkPayoutCard onOpen={() => setBulkOpen(true)} />
            </div>
            <div className="gm-w-paytype-grid">
              {PAY_TYPES.map((type) => (
                <PayTypeCard key={type.id} p={type} onPick={(picked) => { setSendPreset({ type: picked.id }); setSendOpen(true); }} />
              ))}
            </div>
            <div className="row g-4 mt-3">
              <div className="col-xl-6">
                <DashboardSectionHeader eyebrow="Frequent payees" title="One-tap repeat payments" />
                <div className="gm-w-recipient-grid">
                  {recipients.map((person) => (
                    <RecipientCard key={person.id} r={person} onPick={(picked) => { setSendPreset({ recipient: picked.name }); setSendOpen(true); }} />
                  ))}
                </div>
              </div>
              <div className="col-xl-6">
                <DashboardSectionHeader eyebrow="Controls" title="What protects each send" />
                <WalletKv
                  items={[
                    { k: "Wallet PIN", v: "Required on every send" },
                    { k: "Second PIN", v: "Any send above KES 5,000" },
                    { k: "Whitelist", v: security.find((s) => s.id === "s6")?.enabled ? "On — saved payees only" : "Off — anyone can be paid" },
                    { k: "Daily cap", v: `${kes(ctx.dailyLimit)} · ${kes(ctx.todaySpent)} used today` },
                    { k: "Receipt", v: "SMS to both parties, stored against the task" },
                  ]}
                />
                <WalletCallout tone="warn" title="Pay after the work is verified">
                  GrowMO releases labour money against task completion or an approved payslip, so piece-rate disputes are rare.
                </WalletCallout>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 14.4 auto-pay ---------------- */}
        {view === "autopay" ? (
          <div className="mt-3">
            <DashboardSectionHeader eyebrow="14.4" title="Auto-pay management" subtitle="Rules that pay on their own — with a cap, a trigger and an audit trail." />
            <div className="d-flex flex-column gap-3">
              {rules.map((rule) => (
                <AutopayRuleRow
                  key={rule.id}
                  r={rule}
                  onToggle={(id) => {
                    setRules((current) => current.map((item) => (item.id === id ? { ...item, status: item.status === "Active" ? "Paused" : "Active", nextRun: item.status === "Active" ? "When resumed" : "On schedule" } : item)));
                    toast.notify("Auto-pay rule updated.", "info");
                  }}
                  onEdit={setActiveRule}
                />
              ))}
            </div>
            <div className="row g-3 mt-3">
              <div className="col-lg-6">
                <WalletCallout tone="good" title="Safety rules">
                  Rules never exceed their cap, pause themselves after two failed attempts and SMS you 24 hours before a run.
                </WalletCallout>
              </div>
              <div className="col-lg-6">
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-block"
                  onClick={() => {
                    setConfirm({
                      title: "Pay every verified task now?",
                      body: "All tasks marked complete in October will be paid at their piece rate — 4 workers, KES 9,312.50 total.",
                      label: "Pay now",
                      run: () => {
                        pushTxn({ id: "ap-run", type: "Out", description: "Auto-pay: task completion run", amount: 9312, method: "M-Pesa B2C", refNo: "PLAUTO001", status: "Success", category: "Labour" });
                        toast.notify("Task-completion auto-pay executed.", "success");
                      },
                    });
                  }}
                >
                  Run the task-completion rule now
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 14.5 history ---------------- */}
        {view === "history" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="14.5"
              title="Transaction history"
              subtitle="Filter by direction, method, status or category, then export exactly what you filtered."
              action={
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={exportCsv}>
                  <Download /> Export CSV
                </button>
              }
            />
            <div className="gm-w-toolbar">
              <label className="gm-field gm-field-inline">
                <span>Direction</span>
                <select className="gm-select" value={busyFilter.type} onChange={(event) => { setBusyFilter({ ...busyFilter, type: event.target.value }); setPage(0); }}>
                  {TXN_TYPES.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="gm-field gm-field-inline">
                <span>Method</span>
                <select className="gm-select" value={busyFilter.method} onChange={(event) => { setBusyFilter({ ...busyFilter, method: event.target.value }); setPage(0); }}>
                  {TXN_METHODS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="gm-field gm-field-inline">
                <span>Status</span>
                <select className="gm-select" value={busyFilter.status} onChange={(event) => { setBusyFilter({ ...busyFilter, status: event.target.value }); setPage(0); }}>
                  {TXN_STATUSES.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="gm-field gm-field-inline">
                <span>Category</span>
                <select className="gm-select" value={busyFilter.category} onChange={(event) => { setBusyFilter({ ...busyFilter, category: event.target.value }); setPage(0); }}>
                  {TXN_CATEGORIES.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <span className="gm-chip gm-chip-ghost">
                {filtered.length} of {txns.length} rows
              </span>
            </div>
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Dir</th>
                    <th>What</th>
                    <th>Amount</th>
                    <th>Balance</th>
                    <th>Method</th>
                    <th>Receipt</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((t) => (
                    <TxnRow key={t.id} t={t} onOpen={setActiveTxn} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <Pagination page={page + 1} total={pageCount} onChange={(next) => setPage(next - 1)} perPage={perPage} totalItems={filtered.length} />
            </div>
          </div>
        ) : null}

        {/* ---------------- 14.6 budgets ---------------- */}
        {view === "budgets" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="14.6"
              title="Budget allocation"
              subtitle="Move money between free balance and crop envelopes; every spend shows which envelope it came from."
            />
            <div className="gm-w-budget-grid">
              {budgets.map((budget) => (
                <BudgetCard key={budget.id} b={budget} onOpen={setActiveBudget} />
              ))}
            </div>
            <div className="gm-table-wrap mt-3">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Budget</th>
                    <th>Allocated</th>
                    <th>Spent</th>
                    <th>Remaining</th>
                    <th>Available in wallet</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((budget) => {
                    const remaining = budget.allocated - budget.spent;
                    return (
                      <tr key={budget.id}>
                        <td>
                          <strong>
                            {budget.emoji} {budget.name}
                          </strong>
                          <small className="d-block text-muted">{budget.crop ?? "General farm"}</small>
                        </td>
                        <td>{kes(budget.allocated)}</td>
                        <td>{kes(budget.spent)}</td>
                        <td className={remaining > 0 ? "gm-w-up" : ""}>{kes(remaining)}</td>
                        <td>{budget.allocated > 0 ? <StatusChip label="Allocated" tone="low" /> : <StatusChip label="Not allocated" tone="neutral" />}</td>
                        <td>
                          <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => setActiveBudget(budget)}>
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="row g-3 mt-3">
              <div className="col-lg-6">
                <LimitMeter label="Free balance" used={ctx.freeBalance} limit={ctx.availableBalance} />
              </div>
              <div className="col-lg-6">
                <WalletCallout tone="info" title="Why envelopes help">
                  Cabbage SR 2026 has used 75% of its KES 20,000 with 5,000 still available — the ring-fence stops tomato or
                  household spending from eating the cabbage budget.
                </WalletCallout>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 14.7 security ---------------- */}
        {view === "security" ? (
          <div className="mt-3">
            <DashboardSectionHeader eyebrow="14.7" title="Security & controls" subtitle="PIN, biometrics, limits, approvals, whitelist, freeze and fraud alerts." />
            <div className="row g-4">
              <div className="col-xl-7">
                <div className="gm-card p-3">
                  {security.map((control) => (
                    <SecurityRow
                      key={control.id}
                      s={control}
                      onToggle={(id) => {
                        setSecurity((current) => current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
                        toast.notify("Security preference saved.", "info");
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="col-xl-5">
                <WalletKv
                  items={[
                    { k: "Daily limit", v: `${kes(ctx.dailyLimit)} · ${kes(ctx.todaySpent)} used today` },
                    { k: "Monthly limit", v: `${kes(ctx.monthlyLimit)} · ${kes(spendThisMonth)} used` },
                    { k: "Approval threshold", v: "KES 5,000 — second PIN" },
                    { k: "Fraud line", v: "0700 000 999 (24/7)" },
                    { k: "Emergency freeze", v: "SMS FREEZE to 20550" },
                  ]}
                />
                <button
                  type="button"
                  className={`gm-btn gm-btn-block mt-3 ${frozen ? "gm-btn-lime" : "gm-btn-danger-soft"}`}
                  onClick={() => {
                    if (frozen) {
                      setFrozen(false);
                      toast.notify("Wallet unfrozen — sends are live again.", "success");
                      return;
                    }
                    setFreezeOpen(true);
                  }}
                >
                  <Snowflake /> {frozen ? "Unfreeze wallet" : "Freeze wallet"}
                </button>
                <WalletCallout tone="info" title="Session rules">
                  The app locks after five minutes idle, and biometrics are required again after any phone restart.
                </WalletCallout>
              </div>
            </div>
          </div>
        ) : null}

        {/* FAQ + glossary */}
        <div className="gm-card p-4 mt-4">
          <DashboardSectionHeader eyebrow="Help" title="Wallet questions" subtitle="Fees, limits, reversals and how GrowMO holds your money." action={<button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => setFaqModalOpen(true)}>Open in a dialog</button>} />
          <WalletFaqList items={WALLET_FAQ} open={faqOpen} onOpen={setFaqOpen} />
          <h3 className="gm-h-section mt-3">Glossary</h3>
          <WalletGlossary items={WALLET_GLOSSARY} />
        </div>
      </div>

      {/* ---------------- modals ---------------- */}
      <DepositWizard
        open={depositOpen}
        method={depositMethod}
        methods={DEPOSIT_METHODS}
        onClose={() => setDepositOpen(false)}
        onCompleted={(amount, receipt, methodName) => {
          setCtx((current) => ({ ...current, availableBalance: current.availableBalance + amount, monthlyDeposits: current.monthlyDeposits + amount }));
          pushTxn({ id: receipt, type: "In", description: `Deposit via ${methodName}`, amount, method: methodName.includes("M-Pesa") ? "M-Pesa C2B" : "Bill pay", refNo: receipt, status: "Success", category: "Deposit" });
          toast.notify(`${kes(amount)} deposited — receipt ${receipt}.`, "success");
        }}
      />

      <SendMoneyWizard
        open={sendOpen}
        presets={sendPreset}
        payTypes={PAY_TYPES}
        quick={recipients}
        onClose={() => setSendOpen(false)}
        onCompleted={({ amount, receipt, to, type, memo }) => {
          setCtx((current) => ({ ...current, availableBalance: current.availableBalance - amount, monthSpent: current.monthSpent + amount }));
          pushTxn({ id: receipt, type: "Out", description: memo ? `Payment: ${to} (${memo})` : `Payment: ${to}`, amount, method: type === "B2C" ? "M-Pesa B2C" : type === "B2B" ? "M-Pesa B2B" : "M-Pesa B2C", refNo: receipt, status: "Success", category: type === "B2C" ? "Labour" : "Inputs" });
          toast.notify(`Paid ${kes(amount)} to ${to} — receipt ${receipt}.`, "success");
        }}
      />

      <BulkPayoutWizard
        open={bulkOpen}
        saved={recipients}
        budgets={budgets}
        balance={frozen ? 0 : ctx.availableBalance}
        dailyLimit={ctx.dailyLimit}
        todaySpent={ctx.todaySpent}
        onClose={() => setBulkOpen(false)}
        onCompleted={handleBulkPayout}
      />

      <WithdrawWizard
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onCompleted={(amount, receipt) => {
          setCtx((current) => ({ ...current, availableBalance: Math.max(0, current.availableBalance - amount) }));
          pushTxn({ id: receipt, type: "Out", description: "Withdrawal to M-Pesa", amount, method: "M-Pesa B2C", refNo: receipt, status: "Pending", category: "Advance" });
          toast.notify(`Withdrawal of ${kes(amount)} approved — ${receipt}.`, "success");
        }}
      />

      <TxnDetailDialog
        open={Boolean(activeTxn)}
        t={activeTxn}
        onClose={() => setActiveTxn(null)}
        onReversed={(txn) => {
          setTxns((current) => current.map((item) => (item.id === txn.id ? { ...item, status: "Pending" } : item)));
          toast.notify(`Reversal requested for ${txn.refNo}. The recipient must accept.`, "warn");
        }}
      />

      <AutopayEditDialog
        open={Boolean(activeRule)}
        rule={activeRule}
        onClose={() => setActiveRule(null)}
        onSave={(rule) => {
          setRules((current) => current.map((item) => (item.id === rule.id ? rule : item)));
          toast.notify(`${rule.label} saved with a ${kes(rule.amountCap)} cap.`, "success");
        }}
      />

      <BudgetDetailDialog
        open={Boolean(activeBudget)}
        b={activeBudget}
        onClose={() => setActiveBudget(null)}
        onAllocate={(id, amount) => {
          setBudgets((current) => current.map((item) => (item.id === id ? { ...item, allocated: item.allocated + amount } : item)));
          setCtx((current) => ({ ...current, inBudgets: current.inBudgets + amount, freeBalance: Math.max(0, current.freeBalance - amount) }));
          if (activeBudget) setActiveBudget({ ...activeBudget, allocated: activeBudget.allocated + amount });
          toast.notify(`${kes(amount)} moved into the budget envelope.`, "success");
        }}
      />

      <AddRecipientDialog
        open={payeeOpen}
        onClose={() => setPayeeOpen(false)}
        onAdd={(recipient) => {
          setRecipients((current) => [recipient, ...current]);
          toast.notify(`${recipient.name} saved as a payee.`, "success");
        }}
      />

      <WalletShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
      <WalletSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <WalletFaqDialog open={faqModalOpen} onClose={() => setFaqModalOpen(false)} />

      <FreezeConfirmDialog
        open={freezeOpen}
        onClose={() => setFreezeOpen(false)}
        onFrozen={() => {
          setFrozen(true);
          toast.notify("Wallet frozen. Sends and auto-pay are paused.", "warn");
        }}
      />

      <ConfirmWalletDialog
        open={Boolean(confirm)}
        title={confirm?.title ?? ""}
        body={confirm?.body ?? ""}
        confirmLabel={confirm?.label ?? "Confirm"}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm?.run()}
      />
    </main>
  );
}
