/* ============================================================================
   PAGE 14 — PAYMENTS, WALLET & MOBILE MONEY (ENHANCED)  (/app/wallet)

   Complete financial transactions hub with M-Pesa Daraja integration.
   Implements all 7 blueprint sections:
   14.1 Wallet Dashboard    14.2 Deposit Money     14.3 Send Money / Pay
   14.4 Auto-Pay Management 14.5 Transaction History 14.6 Budget Allocation
   14.7 Security & Controls
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileDown,
  FileText,
  Landmark,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Smartphone,
  Store,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  SpendBarChart,
  StackedSpendBar,
  TransactionMiniList,
  WalletBalanceCard,
} from "../../components/app/WalletWidgets";
import {
  AutoPayRuleWizard,
  BudgetAllocationDialog,
  ConfirmWalletDialog,
  DepositWizard,
  ExportTransactionsDialog,
  FreezeWalletDialog,
  MonthlySummaryDialog,
  PaybillInfoDialog,
  PinChangeDialog,
  QuickActionsDialog,
  RecipientsDrawer,
  SecuritySettingsDialog,
  SendMoneyWizard,
  SpendingDrawer,
  TransactionDrawer,
  WalletLimitsDialog,
} from "../../components/app/WalletModals";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  AUTO_PAY_RULES,
  BILLERS,
  DEPOSIT_METHODS,
  SAVED_RECIPIENTS,
  SECURITY_SETTINGS,
  SEND_METHODS,
  SPEND_CATEGORIES,
  TRANSACTIONS,
  WALLET_BUDGET_ALLOCATIONS,
  WALLET_CONTEXT,
  type AutoPayRule,
  type SecuritySetting,
  type Transaction,
  type WalletBudgetAllocation,
  type WalletView,
} from "../../data/app/wallet";
import { kes } from "../../data/site";

export const Route = createFileRoute("/app/wallet")({
  component: WalletPage,
});

type ModalId =
  | "deposit"
  | "send-worker"
  | "send-supplier"
  | "send-bank"
  | "send-growmo"
  | "send-bill"
  | "autopay-create"
  | "autopay-edit"
  | "autopay-toggle"
  | "budget-allocate"
  | "security"
  | "freeze"
  | "pin-change"
  | "limits"
  | "export"
  | "paybill-info"
  | "monthly-summary"
  | "quick-actions"
  | "delete-rule"
  | null;

function WalletPage() {
  const [view, setView] = useState<WalletView>("dashboard");
  const [modal, setModal] = useState<ModalId>(null);
  const [menu, setMenu] = useState(false);

  /* State */
  const [balance, setBalance] = useState(WALLET_CONTEXT.availableBalance);
  const [txns, setTxns] = useState<Transaction[]>(TRANSACTIONS);
  const [rules, setRules] = useState<AutoPayRule[]>(AUTO_PAY_RULES);
  const [allocations, setAllocations] =
    useState<WalletBudgetAllocation[]>(WALLET_BUDGET_ALLOCATIONS);
  const [secSettings, setSecSettings] =
    useState<SecuritySetting[]>(SECURITY_SETTINGS);
  const [frozen, setFrozen] = useState(false);

  /* Selection state */
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [txnDrawerOpen, setTxnDrawerOpen] = useState(false);
  const [spendingDrawerOpen, setSpendingDrawerOpen] = useState(false);
  const [recipientsDrawerOpen, setRecipientsDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoPayRule | null>(null);

  const openModal = (next: Exclude<ModalId, null>) => setModal(next);
  const closeModal = () => setModal(null);

  /* Transaction filter state */
  const [txnQuery, setTxnQuery] = useState("");
  const [txnType, setTxnType] = useState<"all" | "In" | "Out">("all");
  const [txnMethod, setTxnMethod] = useState("all");
  const [txnPage, setTxnPage] = useState(1);

  const filteredTxns = txns.filter(
    (txn) =>
      `${txn.description} ${txn.refNo} ${txn.recipient ?? ""}`
        .toLowerCase()
        .includes(txnQuery.toLowerCase()) &&
      (txnType === "all" || txn.type === txnType) &&
      (txnMethod === "all" || txn.method === txnMethod),
  );
  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredTxns.length / perPage));
  const txnRows = filteredTxns.slice(
    (txnPage - 1) * perPage,
    txnPage * perPage,
  );

  const totalIn = txns
    .filter((t) => t.type === "In")
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = txns
    .filter((t) => t.type === "Out")
    .reduce((s, t) => s + t.amount, 0);

  const handleDeposit = (
    amount: number,
    _method: string,
    _ref: string,
  ) => {
    setBalance((b) => b + amount);
    const newTxn: Transaction = {
      id: `tx-new-${Date.now()}`,
      date: "Today",
      time: new Date().toLocaleTimeString("en-KE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "In",
      description: "Deposit from M-Pesa",
      amount,
      balanceAfter: balance + amount,
      method: "M-Pesa C2B",
      refNo: _ref,
      status: "Success",
      linkedCrop: null,
      linkedBudget: null,
      recipient: null,
      phone: null,
    };
    setTxns((t) => [newTxn, ...t]);
  };

  const handleSend = (
    amount: number,
    recipient: string,
    _ref: string,
  ) => {
    setBalance((b) => b - amount);
    const newTxn: Transaction = {
      id: `tx-new-${Date.now()}`,
      date: "Today",
      time: new Date().toLocaleTimeString("en-KE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "Out",
      description: `Payment to ${recipient}`,
      amount,
      balanceAfter: balance - amount,
      method: "M-Pesa B2C",
      refNo: _ref,
      status: "Success",
      linkedCrop: null,
      linkedBudget: null,
      recipient,
      phone: null,
    };
    setTxns((t) => [newTxn, ...t]);
  };

  const handleSaveRule = (rule: AutoPayRule) => {
    setRules((r) =>
      r.some((x) => x.id === rule.id)
        ? r.map((x) => (x.id === rule.id ? rule : x))
        : [rule, ...r],
    );
  };

  const handleToggleRule = () => {
    if (!editingRule) return;
    setRules((r) =>
      r.map((x) =>
        x.id === editingRule.id
          ? { ...x, status: x.status === "Active" ? "Paused" : "Active" }
          : x,
      ),
    );
  };

  const handleDeleteRule = () => {
    if (!editingRule) return;
    setRules((r) => r.filter((x) => x.id !== editingRule.id));
  };

  const handleAllocate = (id: string, amount: number) => {
    setAllocations((a) =>
      a.map((x) =>
        x.id === id
          ? {
              ...x,
              allocated: amount,
              remaining: amount - x.spent,
              available: amount > 0,
            }
          : x,
      ),
    );
  };

  const handleExportTxns = () => {
    const header = "Date,Time,Type,Description,Amount,Balance After,Method,Ref No,Status";
    const rows = filteredTxns.map((txn) =>
      [
        txn.date,
        txn.time,
        txn.type,
        `"${txn.description}"`,
        txn.amount,
        txn.balanceAfter,
        txn.method,
        txn.refNo,
        txn.status,
      ].join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "growmo-wallet-transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const navItems = [
    {
      id: "dashboard" as const,
      label: "Dashboard",
      icon: <Wallet />,
      count: undefined,
    },
    {
      id: "deposit" as const,
      label: "Deposit",
      icon: <ArrowDownLeft />,
      count: undefined,
    },
    {
      id: "send" as const,
      label: "Send / Pay",
      icon: <Send />,
      count: undefined,
    },
    {
      id: "autopay" as const,
      label: "Auto-pay",
      icon: <Zap />,
      count: rules.filter((r) => r.status === "Active").length,
    },
    {
      id: "history" as const,
      label: "History",
      icon: <Clock />,
      count: txns.length,
    },
    {
      id: "budgets" as const,
      label: "Budgets",
      icon: <CircleDollarSign />,
      count: allocations.filter((a) => a.available).length,
    },
    {
      id: "security" as const,
      label: "Security",
      icon: <ShieldCheck />,
      count: undefined,
    },
  ];

  /* Wallet icon as a function for nav */
  function Wallet(props: any) {
    return <Banknote {...props} />;
  }

  return (
    <main className="gm-app-page gm-wallet-page">
      <div className="gm-container py-4">
        {/* Breadcrumb */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Link to="/app/dashboard" className="gm-back-link">
              <ArrowRight className="rotate-180" /> Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">System</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Wallet</strong>
          </div>
          <div className="gm-menu-wrap">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setMenu((current) => !current)}
              aria-expanded={menu}
            >
              <MoreHorizontal /> More wallet tools
            </button>
            {menu ? (
              <div className="gm-dropdown gm-wallet-menu">
                <button
                  type="button"
                  onClick={() => {
                    openModal("quick-actions");
                    setMenu(false);
                  }}
                >
                  <Zap /> Quick actions
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("export");
                    setMenu(false);
                  }}
                >
                  <Download /> Export transactions
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecipientsDrawerOpen(true);
                    setMenu(false);
                  }}
                >
                  <Users /> Saved recipients
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("limits");
                    setMenu(false);
                  }}
                >
                  <BarChart3 /> Transaction limits
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("paybill-info");
                    setMenu(false);
                  }}
                >
                  <FileText /> Paybill info
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Balance card */}
        <div className="gm-card p-3 mb-3" style={{ background: frozen ? "var(--gm-clay-500)" : undefined }}>
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
              <span className={frozen ? "gm-eyebrow" : "gm-eyebrow"}>
                {frozen ? "⚠️ Wallet Frozen" : "GrowMO Wallet"}
              </span>
              <h2 className={`font-display mb-1 ${frozen ? "text-white" : ""}`}>
                {frozen ? "Wallet is frozen" : kes(balance)}
              </h2>
              <p className={`mb-0 ${frozen ? "text-white" : "text-muted"}`}>
                {frozen
                  ? "All transactions are blocked. Unfreeze to restore access."
                  : `Effective available: ${kes(WALLET_CONTEXT.effectiveAvailable)} · Last updated: ${WALLET_CONTEXT.lastUpdated}`}
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => setSpendingDrawerOpen(true)}
              >
                <BarChart3 /> Spending
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-mpesa gm-btn-sm"
                disabled={frozen}
                onClick={() => openModal("deposit")}
              >
                <ArrowDownLeft /> Deposit
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                disabled={frozen}
                onClick={() => openModal("quick-actions")}
              >
                <Send /> Send / Pay
              </button>
            </div>
          </div>
          <div className="gm-stat-grid mt-3">
            <DashboardMetric
              icon={Banknote}
              label="Available balance"
              value={kes(balance)}
              note="Current GrowMO wallet"
            />
            <DashboardMetric
              icon={Lock}
              label="In allocated budgets"
              value={kes(WALLET_CONTEXT.allocatedToBudgets)}
              note="Protected for crops"
            />
            <DashboardMetric
              icon={CircleDollarSign}
              label="Free balance"
              value={kes(WALLET_CONTEXT.freeBalance)}
              note="Freely available"
            />
            <DashboardMetric
              icon={Clock}
              label="Pending outflows"
              value={kes(WALLET_CONTEXT.pendingOutflows)}
              note="Scheduled payments"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="gm-card p-2">
          <PlannerSubtabs
            value={view}
            items={navItems}
            onChange={setView}
            label="Wallet sections"
          />
        </div>

        <Reveal className="mt-4">
          {view === "dashboard" ? (
            <DashboardView
              balance={balance}
              ctx={WALLET_CONTEXT}
              txns={txns}
              categories={SPEND_CATEGORIES}
              totalIn={totalIn}
              totalOut={totalOut}
              onTxn={(txn) => {
                setSelectedTxn(txn);
                setTxnDrawerOpen(true);
              }}
              onDeposit={() => openModal("deposit")}
              onPayWorker={() => openModal("send-worker")}
              onSummary={() => openModal("monthly-summary")}
            />
          ) : null}
          {view === "deposit" ? (
            <DepositView
              methods={DEPOSIT_METHODS}
              onDeposit={() => openModal("deposit")}
              onPaybill={() => openModal("paybill-info")}
            />
          ) : null}
          {view === "send" ? (
            <SendView
              methods={SEND_METHODS}
              frozen={frozen}
              onPayWorker={() => openModal("send-worker")}
              onPaySupplier={() => openModal("send-supplier")}
              onBank={() => openModal("send-bank")}
              onGrowmo={() => openModal("send-growmo")}
              onBill={() => openModal("send-bill")}
              onRecipients={() => setRecipientsDrawerOpen(true)}
            />
          ) : null}
          {view === "autopay" ? (
            <AutoPayView
              rules={rules}
              onCreate={() => {
                setEditingRule(null);
                openModal("autopay-create");
              }}
              onEdit={(rule) => {
                setEditingRule(rule);
                openModal("autopay-edit");
              }}
              onToggle={(rule) => {
                setEditingRule(rule);
                openModal("autopay-toggle");
              }}
              onDelete={(rule) => {
                setEditingRule(rule);
                openModal("delete-rule");
              }}
            />
          ) : null}
          {view === "history" ? (
            <HistoryView
              txns={txnRows}
              totalFiltered={filteredTxns.length}
              query={txnQuery}
              typeFilter={txnType}
              methodFilter={txnMethod}
              page={txnPage}
              totalPages={totalPages}
              perPage={perPage}
              onQuery={(q) => {
                setTxnQuery(q);
                setTxnPage(1);
              }}
              onType={(t) => {
                setTxnType(t);
                setTxnPage(1);
              }}
              onMethod={(m) => {
                setTxnMethod(m);
                setTxnPage(1);
              }}
              onPage={setTxnPage}
              onReset={() => {
                setTxnQuery("");
                setTxnType("all");
                setTxnMethod("all");
                setTxnPage(1);
              }}
              onTxn={(txn) => {
                setSelectedTxn(txn);
                setTxnDrawerOpen(true);
              }}
              onExport={() => openModal("export")}
            />
          ) : null}
          {view === "budgets" ? (
            <BudgetsView
              allocations={allocations}
              onEdit={() => openModal("budget-allocate")}
              onFinance={() => {}}
            />
          ) : null}
          {view === "security" ? (
            <SecurityView
              settings={secSettings}
              frozen={frozen}
              onSettings={() => openModal("security")}
              onFreeze={() => openModal("freeze")}
              onPinChange={() => openModal("pin-change")}
              onLimits={() => openModal("limits")}
            />
          ) : null}
        </Reveal>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      <DepositWizard
        open={modal === "deposit"}
        onClose={closeModal}
        onComplete={handleDeposit}
      />
      <SendMoneyWizard
        open={modal === "send-worker"}
        mode="worker"
        recipients={SAVED_RECIPIENTS}
        billers={BILLERS}
        onClose={closeModal}
        onComplete={handleSend}
      />
      <SendMoneyWizard
        open={modal === "send-supplier"}
        mode="supplier"
        recipients={SAVED_RECIPIENTS}
        billers={BILLERS}
        onClose={closeModal}
        onComplete={handleSend}
      />
      <SendMoneyWizard
        open={modal === "send-bank"}
        mode="bank"
        recipients={SAVED_RECIPIENTS}
        billers={BILLERS}
        onClose={closeModal}
        onComplete={handleSend}
      />
      <SendMoneyWizard
        open={modal === "send-growmo"}
        mode="growmo-user"
        recipients={SAVED_RECIPIENTS}
        billers={BILLERS}
        onClose={closeModal}
        onComplete={handleSend}
      />
      <SendMoneyWizard
        open={modal === "send-bill"}
        mode="bill"
        recipients={SAVED_RECIPIENTS}
        billers={BILLERS}
        onClose={closeModal}
        onComplete={handleSend}
      />
      <AutoPayRuleWizard
        open={modal === "autopay-create" || modal === "autopay-edit"}
        editing={editingRule}
        onClose={closeModal}
        onSave={handleSaveRule}
      />
      <ConfirmWalletDialog
        open={modal === "autopay-toggle"}
        title={
          editingRule?.status === "Active"
            ? "Pause this rule?"
            : "Activate this rule?"
        }
        body={
          editingRule
            ? `"${editingRule.name}" is currently ${editingRule.status.toLowerCase()}. The change affects future triggers only.`
            : "Review this rule before changing it."
        }
        confirmLabel={
          editingRule?.status === "Active" ? "Pause rule" : "Activate rule"
        }
        onClose={closeModal}
        onConfirm={handleToggleRule}
      />
      <ConfirmWalletDialog
        open={modal === "delete-rule"}
        title="Delete this rule?"
        body={
          editingRule
            ? `"${editingRule.name}" will be permanently removed. This cannot be undone.`
            : "This rule will be removed."
        }
        confirmLabel="Delete rule"
        destructive
        onClose={closeModal}
        onConfirm={handleDeleteRule}
      />
      <BudgetAllocationDialog
        open={modal === "budget-allocate"}
        allocations={allocations}
        onClose={closeModal}
        onSave={handleAllocate}
      />
      <SecuritySettingsDialog
        open={modal === "security"}
        settings={secSettings}
        onClose={closeModal}
        onSave={setSecSettings}
      />
      <FreezeWalletDialog
        open={modal === "freeze"}
        frozen={frozen}
        onClose={closeModal}
        onToggle={() => setFrozen((f) => !f)}
      />
      <PinChangeDialog
        open={modal === "pin-change"}
        onClose={closeModal}
        onSave={() => {}}
      />
      <WalletLimitsDialog open={modal === "limits"} onClose={closeModal} />
      <ExportTransactionsDialog
        open={modal === "export"}
        onClose={closeModal}
      />
      <PaybillInfoDialog
        open={modal === "paybill-info"}
        onClose={closeModal}
      />
      <MonthlySummaryDialog
        open={modal === "monthly-summary"}
        onClose={closeModal}
      />
      <QuickActionsDialog
        open={modal === "quick-actions"}
        onClose={closeModal}
        onDeposit={() => openModal("deposit")}
        onSend={() => openModal("send-bank")}
        onPayWorker={() => openModal("send-worker")}
        onPaySupplier={() => openModal("send-supplier")}
        onPayBill={() => openModal("send-bill")}
        onViewStatements={() => openModal("export")}
      />

      {/* Drawers */}
      <TransactionDrawer
        open={txnDrawerOpen}
        txn={selectedTxn}
        onClose={() => setTxnDrawerOpen(false)}
      />
      <SpendingDrawer
        open={spendingDrawerOpen}
        onClose={() => setSpendingDrawerOpen(false)}
      />
      <RecipientsDrawer
        open={recipientsDrawerOpen}
        recipients={SAVED_RECIPIENTS}
        onClose={() => setRecipientsDrawerOpen(false)}
      />
    </main>
  );
}

/* ========================================================================
   SUB-VIEWS
   ======================================================================== */

/* ── 14.1 Dashboard ─────────────────────────────────────────────────────── */
function DashboardView({
  balance,
  ctx,
  txns,
  categories,
  totalIn,
  totalOut,
  onTxn,
  onDeposit,
  onPayWorker,
  onSummary,
}: {
  balance: number;
  ctx: typeof WALLET_CONTEXT;
  txns: Transaction[];
  categories: typeof SPEND_CATEGORIES;
  totalIn: number;
  totalOut: number;
  onTxn: (txn: Transaction) => void;
  onDeposit: () => void;
  onPayWorker: () => void;
  onSummary: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="14.1 · Wallet dashboard"
        title="Your farm's financial heartbeat"
        subtitle="M-Pesa in, protected crop envelopes out — see exactly what is free before you commit."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={onSummary}
            >
              <FileText /> Monthly summary
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={onDeposit}
            >
              <ArrowDownLeft /> Deposit
            </button>
          </div>
        }
      />
      <div className="row g-3 mt-3">
        <div className="col-xl-8">
          <div className="gm-card p-4 h-100">
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
              <div>
                <span className="gm-eyebrow">This month</span>
                <h3 className="font-display mb-1">Money flow</h3>
              </div>
              <StatusChip
                label={`Net ${totalIn > totalOut ? "+" : ""}${kes(totalIn - totalOut)}`}
                tone={totalIn > totalOut ? "low" : "high"}
              />
            </div>
            <div className="row g-3 mt-2">
              <div className="col-md-6">
                <div className="gm-kpi-soft">
                  <small>Deposits in</small>
                  <strong className="font-display text-success">
                    +{kes(totalIn)}
                  </strong>
                  <span>{txns.filter((t) => t.type === "In").length} transactions</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="gm-kpi-soft">
                  <small>Spend out</small>
                  <strong className="font-display">−{kes(totalOut)}</strong>
                  <span>{txns.filter((t) => t.type === "Out").length} transactions</span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <StackedSpendBar categories={categories} total={categories.reduce((s, c) => s + c.amount, 0)} />
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Quick actions</span>
            <h3 className="font-display mb-2">Do the next safe thing</h3>
            <p className="text-muted mb-3">
              Chagua hatua — each action ends in a receipt or an updated ledger.
            </p>
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="gm-action-card"
                onClick={onDeposit}
              >
                <span className="gm-action-icon is-positive">
                  <ArrowDownLeft />
                </span>
                <span>
                  <strong>Deposit money</strong>
                  <small>via M-Pesa, bank or agent</small>
                </span>
                <ArrowRight />
              </button>
              <button
                type="button"
                className="gm-action-card"
                onClick={onPayWorker}
              >
                <span className="gm-action-icon">
                  <Users />
                </span>
                <span>
                  <strong>Pay worker</strong>
                  <small>Send M-Pesa B2C</small>
                </span>
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2">
          <div>
            <span className="gm-eyebrow">Recent activity</span>
            <h3 className="font-display mb-1">Latest transactions</h3>
          </div>
          <Link to="/app/finance" className="gm-btn gm-btn-outline gm-btn-sm">
            <ArrowRight /> Full finance page
          </Link>
        </div>
        <TransactionMiniList txns={txns} onSelect={onTxn} />
      </div>
    </>
  );
}

/* ── 14.2 Deposit ────────────────────────────────────────────────────────── */
function DepositView({
  methods,
  onDeposit,
  onPaybill,
}: {
  methods: typeof DEPOSIT_METHODS;
  onDeposit: () => void;
  onPaybill: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="14.2 · Deposit money"
        title="Fund your GrowMO wallet"
        subtitle="Choose your preferred deposit method. M-Pesa is instant and free."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-mpesa gm-btn-sm"
            onClick={onDeposit}
          >
            <ArrowDownLeft /> Quick deposit
          </button>
        }
      />
      <div className="row g-3 mt-3">
        {methods.map((m) => (
          <div className="col-xl-4 col-md-6" key={m.id}>
            <div className="gm-card p-3 h-100">
              <div className="d-flex align-items-start gap-3">
                <span className="gm-mega-icon">
                  {m.icon === "Smartphone" ? (
                    <Smartphone />
                  ) : m.icon === "Landmark" ? (
                    <Landmark />
                  ) : m.icon === "Store" ? (
                    <Store />
                  ) : (
                    <CreditCard />
                  )}
                </span>
                <div style={{ flex: 1 }}>
                  <h4 className="font-display mb-1">{m.name}</h4>
                  <p className="text-muted mb-2" style={{ fontSize: ".85rem" }}>
                    {m.description}
                  </p>
                </div>
              </div>
              <div className="gm-review-card mt-2">
                <div className="gm-review-row">
                  <span>Min / Max</span>
                  <strong>
                    {kes(m.min)} – {kes(m.max)}
                  </strong>
                </div>
                <div className="gm-review-row">
                  <span>Fee</span>
                  <strong>{m.fee}</strong>
                </div>
                <div className="gm-review-row">
                  <span>Speed</span>
                  <strong>{m.speed}</strong>
                </div>
              </div>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm w-100 mt-2"
                onClick={onDeposit}
              >
                Deposit now <ArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="gm-card p-4 mt-3">
        <span className="gm-eyebrow">M-Pesa Paybill</span>
        <h3 className="font-display mb-2">
          Deposit without opening the app
        </h3>
        <p className="text-muted">
          Use Lipa na M-Pesa → Pay Bill → Business No: 174379 → Account: your
          phone number. Deposits reflect in 5–10 minutes.
        </p>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onPaybill}
        >
          <FileText /> View paybill details
        </button>
      </div>
    </>
  );
}

/* ── 14.3 Send Money / Pay ───────────────────────────────────────────────── */
function SendView({
  methods,
  frozen,
  onPayWorker,
  onPaySupplier,
  onBank,
  onGrowmo,
  onBill,
  onRecipients,
}: {
  methods: typeof SEND_METHODS;
  frozen: boolean;
  onPayWorker: () => void;
  onPaySupplier: () => void;
  onBank: () => void;
  onGrowmo: () => void;
  onBill: () => void;
  onRecipients: () => void;
}) {
  const actions = [
    { id: "sm-1", fn: onPayWorker, icon: Users, color: "is-positive" },
    { id: "sm-2", fn: onPaySupplier, icon: Store, color: "" },
    { id: "sm-3", fn: onBank, icon: Landmark, color: "" },
    { id: "sm-4", fn: onGrowmo, icon: Smartphone, color: "is-positive" },
    { id: "sm-5", fn: onBill, icon: Zap, color: "" },
  ];
  return (
    <>
      <DashboardSectionHeader
        eyebrow="14.3 · Send money / Pay"
        title="Pay anyone, anywhere"
        subtitle="Workers, suppliers, banks, other GrowMO users, or utility bills — all from your wallet."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={onRecipients}
          >
            <Users /> Saved recipients
          </button>
        }
      />
      {frozen ? (
        <div className="gm-alert-box is-danger mt-3">
          <Lock />
          <p>
            <strong>Wallet is frozen</strong>
            <br />
            Unfreeze your wallet in the Security tab to make payments.
          </p>
        </div>
      ) : null}
      <div className="row g-3 mt-3">
        {methods.map((m, i) => (
          <div className="col-xl-4 col-md-6" key={m.id}>
            <button
              type="button"
              className="gm-card p-3 h-100 w-100 text-start"
              style={{ cursor: frozen ? "not-allowed" : "pointer", opacity: frozen ? 0.6 : 1 }}
              disabled={frozen}
              onClick={actions[i]?.fn}
            >
              <div className="d-flex align-items-start gap-3">
                <span className={`gm-action-icon ${actions[i]?.color ?? ""}`}>
                  {(() => {
                    const Icon = actions[i]?.icon;
                    return Icon ? <Icon /> : <Send />;
                  })()}
                </span>
                <div style={{ flex: 1 }}>
                  <h4 className="font-display mb-1">{m.type}</h4>
                  <p className="text-muted mb-0" style={{ fontSize: ".85rem" }}>
                    {m.flow}
                  </p>
                </div>
                <ArrowRight className="text-muted" />
              </div>
            </button>
          </div>
        ))}
      </div>
      <div className="row g-3 mt-1">
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">M-Pesa B2C</span>
            <h3 className="font-display mb-2">Pay your farm workers</h3>
            <p className="text-muted">
              Enter the worker's phone number, amount, and confirm with your
              wallet PIN. The worker receives M-Pesa instantly.
            </p>
            <div className="gm-check-row">
              <CheckCircle2 />
              <span>
                <strong>Instant delivery</strong>
                <small>Workers receive M-Pesa within seconds</small>
              </span>
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">M-Pesa B2B</span>
            <h3 className="font-display mb-2">Pay suppliers and agrovets</h3>
            <p className="text-muted">
              Enter the supplier's Till or Paybill number, amount, and account
              reference. Payment is confirmed with your PIN.
            </p>
            <div className="gm-check-row">
              <ShieldCheck />
              <span>
                <strong>Secure payments</strong>
                <small>All transactions require PIN verification</small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 14.4 Auto-Pay ───────────────────────────────────────────────────────── */
function AutoPayView({
  rules,
  onCreate,
  onEdit,
  onToggle,
  onDelete,
}: {
  rules: AutoPayRule[];
  onCreate: () => void;
  onEdit: (rule: AutoPayRule) => void;
  onToggle: (rule: AutoPayRule) => void;
  onDelete: (rule: AutoPayRule) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "Active" | "Paused">("all");
  const filtered = rules.filter(
    (r) =>
      `${r.name} ${r.trigger} ${r.recipients}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" || r.status === filter),
  );
  return (
    <>
      <DashboardSectionHeader
        eyebrow="14.4 · Auto-pay management"
        title="Automate the repeatable"
        subtitle="Rules can pay workers, suppliers or subscriptions automatically when triggered."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={onCreate}
          >
            <Plus /> New rule
          </button>
        }
      />
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div className="gm-search-wrap" style={{ flex: "1 1 280px" }}>
            <Search />
            <input
              className="gm-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rules, triggers or actions"
            />
          </div>
          <select
            className="gm-select"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "Active" | "Paused")
            }
          >
            <option value="all">All rules</option>
            <option>Active</option>
            <option>Paused</option>
          </select>
          <span className="gm-filter-chip on">
            {rules.filter((r) => r.status === "Active").length} active
          </span>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Rule</th>
                <th>Trigger</th>
                <th>Recipients</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Last run</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((rule) => (
                <tr key={rule.id}>
                  <td>
                    <strong>{rule.name}</strong>
                    <small className="d-block text-muted">{rule.note}</small>
                  </td>
                  <td>
                    <small>{rule.trigger}</small>
                  </td>
                  <td>
                    <small>{rule.recipients}</small>
                  </td>
                  <td>
                    <strong className="font-display">{rule.amount}</strong>
                  </td>
                  <td>
                    <StatusChip
                      label={rule.status}
                      tone={rule.status === "Active" ? "low" : "neutral"}
                    />
                  </td>
                  <td>
                    <small>{rule.lastTriggered}</small>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`Edit ${rule.name}`}
                        onClick={() => onEdit(rule)}
                      >
                        <Pencil />
                      </button>
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`${rule.status === "Active" ? "Pause" : "Activate"} ${rule.name}`}
                        onClick={() => onToggle(rule)}
                      >
                        {rule.status === "Active" ? <X /> : <CheckCircle2 />}
                      </button>
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`Delete ${rule.name}`}
                        onClick={() => onDelete(rule)}
                      >
                        <X />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">No rule matches.</p>
        ) : null}
      </div>
      <div className="row g-3 mt-1">
        <div className="col-md-4">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">1 · Trigger</span>
            <h3 className="font-display mb-1">Something happens</h3>
            <p className="text-muted mb-0">
              Task complete, Friday at 5 PM, or spend above 90%.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">2 · Safeguard</span>
            <h3 className="font-display mb-1">GrowMO checks</h3>
            <p className="text-muted mb-0">
              Budget, wallet balance and PIN threshold are checked first.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">3 · Receipt</span>
            <h3 className="font-display mb-1">You can audit it</h3>
            <p className="text-muted mb-0">
              A reference lands in the wallet activity and expense ledger.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 14.5 Transaction History ────────────────────────────────────────────── */
function HistoryView({
  txns,
  totalFiltered,
  query,
  typeFilter,
  methodFilter,
  page,
  totalPages,
  perPage,
  onQuery,
  onType,
  onMethod,
  onPage,
  onReset,
  onTxn,
  onExport,
}: {
  txns: Transaction[];
  totalFiltered: number;
  query: string;
  typeFilter: "all" | "In" | "Out";
  methodFilter: string;
  page: number;
  totalPages: number;
  perPage: number;
  onQuery: (q: string) => void;
  onType: (t: "all" | "In" | "Out") => void;
  onMethod: (m: string) => void;
  onPage: (p: number) => void;
  onReset: () => void;
  onTxn: (txn: Transaction) => void;
  onExport: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="14.5 · Transaction history"
        title="Every movement, searchable"
        subtitle={`${totalFiltered} matching transaction${totalFiltered === 1 ? "" : "s"} · latest first`}
        action={
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={onExport}
          >
            <Download /> Export CSV
          </button>
        }
      />
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div className="gm-search-wrap" style={{ flex: "1 1 280px" }}>
            <Search />
            <input
              className="gm-input"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search description, reference or recipient"
            />
          </div>
          <select
            className="gm-select"
            value={typeFilter}
            onChange={(e) => onType(e.target.value as "all" | "In" | "Out")}
          >
            <option value="all">In and out</option>
            <option value="In">Money in</option>
            <option value="Out">Money out</option>
          </select>
          <select
            className="gm-select"
            value={methodFilter}
            onChange={(e) => onMethod(e.target.value)}
          >
            <option value="all">All methods</option>
            <option>M-Pesa B2C</option>
            <option>M-Pesa B2B</option>
            <option>M-Pesa C2B</option>
            <option>Internal</option>
            <option>Bank Transfer</option>
            <option>Card</option>
            <option>Agent</option>
          </select>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={onReset}
          >
            <RefreshCw /> Reset
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Method</th>
                <th>Ref No</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {txns.map((txn) => (
                <tr key={txn.id}>
                  <td>
                    <small>{txn.date}</small>
                    <small className="d-block text-muted">{txn.time}</small>
                  </td>
                  <td>
                    <strong>{txn.description}</strong>
                    {txn.linkedCrop ? (
                      <small className="d-block text-muted">
                        {txn.linkedCrop}
                      </small>
                    ) : null}
                  </td>
                  <td>
                    <StatusChip
                      label={txn.type === "In" ? "Money in" : "Money out"}
                      tone={txn.type === "In" ? "low" : "neutral"}
                    />
                  </td>
                  <td>
                    <strong
                      className={`font-display ${txn.type === "In" ? "text-success" : ""}`}
                    >
                      {txn.type === "In" ? "+" : "−"}
                      {kes(txn.amount)}
                    </strong>
                  </td>
                  <td>{kes(txn.balanceAfter)}</td>
                  <td>
                    <small>{txn.method}</small>
                  </td>
                  <td>
                    <code className="gm-code-chip">{txn.refNo}</code>
                  </td>
                  <td>
                    <StatusChip
                      label={txn.status}
                      tone={
                        txn.status === "Success"
                          ? "low"
                          : txn.status === "Pending"
                            ? "medium"
                            : "high"
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`View ${txn.description}`}
                      onClick={() => onTxn(txn)}
                    >
                      <Eye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {txns.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">
            No transactions match these filters.
          </p>
        ) : null}
        <Pagination
          page={Math.min(page, totalPages)}
          total={totalPages}
          onChange={onPage}
          perPage={perPage}
          totalItems={totalFiltered}
        />
      </div>
    </>
  );
}

/* ── 14.6 Budget Allocations ─────────────────────────────────────────────── */
function BudgetsView({
  allocations,
  onEdit,
  onFinance,
}: {
  allocations: WalletBudgetAllocation[];
  onEdit: () => void;
  onFinance: () => void;
}) {
  const totalAllocated = allocations.reduce((s, a) => s + a.allocated, 0);
  const totalSpent = allocations.reduce((s, a) => s + a.spent, 0);
  return (
    <>
      <DashboardSectionHeader
        eyebrow="14.6 · Budget allocation"
        title="Protect funds for each crop"
        subtitle="Allocate wallet money to crop budgets. Allocated funds are ring-fenced for that crop."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={onEdit}
          >
            <Pencil /> Edit allocations
          </button>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={CircleDollarSign}
          label="Total allocated"
          value={kes(totalAllocated)}
          note="Across all budgets"
        />
        <DashboardMetric
          icon={TrendingDown}
          label="Total spent"
          value={kes(totalSpent)}
          note="From allocations"
        />
        <DashboardMetric
          icon={CheckCircle2}
          label="Remaining"
          value={kes(totalAllocated - totalSpent)}
          note="Available in budgets"
        />
        <DashboardMetric
          icon={Banknote}
          label="Unallocated"
          value={kes(WALLET_CONTEXT.freeBalance)}
          note="Free wallet balance"
        />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Budget</th>
                <th>Crop</th>
                <th>Allocated</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Available</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.budget}</strong>
                  </td>
                  <td>
                    <small>{a.crop}</small>
                  </td>
                  <td>
                    <strong className="font-display">
                      {a.allocated > 0 ? kes(a.allocated) : "—"}
                    </strong>
                  </td>
                  <td>{a.spent > 0 ? kes(a.spent) : "—"}</td>
                  <td
                    className={
                      a.remaining > 0
                        ? "text-success"
                        : a.remaining < 0
                          ? "text-danger"
                          : ""
                    }
                  >
                    {a.allocated > 0 ? kes(a.remaining) : "—"}
                  </td>
                  <td>
                    <StatusChip
                      label={a.available ? "Yes" : "No"}
                      tone={a.available ? "low" : "neutral"}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`Edit ${a.budget}`}
                      onClick={onEdit}
                    >
                      <Pencil />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="gm-card p-4 mt-3">
        <span className="gm-eyebrow">How allocation works</span>
        <h3 className="font-display mb-2">
          Ring-fence money for specific crops
        </h3>
        <p className="text-muted">
          When you allocate KES 20,000 to "Cabbage SR 2026", that amount is
          reserved from your free balance. Any input purchase or labour payment
          linked to that budget draws from the allocation first. This prevents
          accidentally spending crop money on other things.
        </p>
        <Link to="/app/finance" className="gm-btn gm-btn-outline">
          <ArrowRight /> Open full finance page
        </Link>
      </div>
    </>
  );
}

/* ── 14.7 Security & Controls ────────────────────────────────────────────── */
function SecurityView({
  settings,
  frozen,
  onSettings,
  onFreeze,
  onPinChange,
  onLimits,
}: {
  settings: SecuritySetting[];
  frozen: boolean;
  onSettings: () => void;
  onFreeze: () => void;
  onPinChange: () => void;
  onLimits: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="14.7 · Security & controls"
        title="Protect your farm's money"
        subtitle="PIN, biometrics, limits, whitelists and freeze — multiple layers of protection."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={onSettings}
          >
            <Settings2 /> Edit settings
          </button>
        }
      />
      <div className="row g-3 mt-3">
        <div className="col-xl-4 col-md-6">
          <div className="gm-card p-3 h-100">
            <div className="d-flex align-items-start gap-3">
              <span className="gm-mega-icon">
                <Lock />
              </span>
              <div>
                <h4 className="font-display mb-1">Wallet PIN</h4>
                <p className="text-muted mb-2" style={{ fontSize: ".85rem" }}>
                  4-digit PIN required for all transactions
                </p>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onPinChange}
                >
                  <Pencil /> Change PIN
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-md-6">
          <div className="gm-card p-3 h-100">
            <div className="d-flex align-items-start gap-3">
              <span className="gm-mega-icon">
                <BarChart3 />
              </span>
              <div>
                <h4 className="font-display mb-1">Transaction limits</h4>
                <p className="text-muted mb-2" style={{ fontSize: ".85rem" }}>
                  Daily: KES 50,000 · Monthly: KES 500,000
                </p>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onLimits}
                >
                  <Eye /> View limits
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-md-6">
          <div className="gm-card p-3 h-100">
            <div className="d-flex align-items-start gap-3">
              <span
                className="gm-mega-icon"
                style={{
                  color: frozen
                    ? "var(--gm-clay-500)"
                    : "var(--gm-leaf-500)",
                }}
              >
                <ShieldCheck />
              </span>
              <div>
                <h4 className="font-display mb-1">
                  {frozen ? "Wallet Frozen" : "Freeze Wallet"}
                </h4>
                <p className="text-muted mb-2" style={{ fontSize: ".85rem" }}>
                  {frozen
                    ? "All transactions are blocked"
                    : "Instantly block all transactions"}
                </p>
                <button
                  type="button"
                  className={`gm-btn gm-btn-sm ${frozen ? "gm-btn-lime" : "gm-btn-danger-soft"}`}
                  onClick={onFreeze}
                >
                  {frozen ? "Unfreeze" : "Freeze"} wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
          <div>
            <span className="gm-eyebrow">All security features</span>
            <h3 className="font-display mb-1">Protection overview</h3>
          </div>
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Details</th>
                <th>Current value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.feature}</strong>
                  </td>
                  <td>
                    <small>{s.details}</small>
                  </td>
                  <td>
                    <strong>{s.value}</strong>
                  </td>
                  <td>
                    <StatusChip
                      label={s.enabled ? "On" : "Off"}
                      tone={s.enabled ? "low" : "neutral"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}