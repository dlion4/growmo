/* ============================================================================
   PAGE 7 — FINANCIAL MANAGEMENT & BUDGETING (ENHANCED)  (/app/finance)

   Blueprint sections implemented:
   7.1 Farm wallet             7.2 Per-crop / season budget planner
   7.3 Expense recording       7.4 Income recording
   7.5 Cash-flow forecast      7.6 Profit & loss by crop
   7.7 Auto-pay rules engine   7.8 Multi-crop financial overview

   The page keeps an honest, connected demo ledger in local state. Deposits,
   withdrawals, wallet expenses, budgets, receipts, exports and rule changes
   all produce visible state changes without pretending that real M-Pesa has
   been connected.
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  BellRing,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Download,
  Eye,
  FileDown,
  HandCoins,
  Landmark,
  ListFilter,
  MoreHorizontal,
  Pencil,
  PiggyBank,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  AutoPayRuleWizard,
  BudgetAlertDialog,
  BudgetCategoryDialog,
  BudgetWizard,
  CashFlowAssumptionsDialog,
  ConfirmFinanceDialog,
  ExpenseWizard,
  FinancialSettingsDialog,
  IncomeWizard,
  MpesaMoneyWizard,
  PayeePickerDialog,
  PnlExportDialog,
  PortfolioDialog,
  ReceiptDialog,
} from "../../components/app/FinanceModals";
import {
  BudgetHealthCard,
  CashFlowBars,
  FinanceHeaderCard,
  FinanceInsight,
  PnlSummary,
  WalletActivityMini,
  WalletSplit,
} from "../../components/app/FinanceWidgets";
import { BarChart } from "../../components/app/InventoryWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  AUTO_PAY_RULES,
  type AutoPayRule,
  BUDGET_CATEGORIES,
  BUDGETS,
  type BudgetCategory,
  type BudgetStatus,
  budgetProgress,
  budgetStatusTone,
  CASH_FLOW,
  type CashFlowMonth,
  CROP_FINANCIALS,
  type CropFinancialOverview,
  EXPENSES,
  type ExpenseRecord,
  FINANCE_CONTEXT,
  FINANCIAL_PAYEES,
  FINANCIAL_SETTINGS,
  type FinancialBudget,
  type FinancialSettings,
  type FinancialView,
  INCOME,
  type IncomeRecord,
  type MoneyStatus,
  moneyStatusTone,
  PNL_CABBAGE,
  WALLET_ACTIVITY,
  type WalletActivity,
} from "../../data/app/finance";
import { kes } from "../../data/site";

export const Route = createFileRoute("/app/finance")({
  component: FinanceManagementPage,
});

type ModalId =
  | "deposit"
  | "withdraw"
  | "expense-payment"
  | "budget-create"
  | "budget-edit"
  | "category-edit"
  | "expense-create"
  | "expense-delete"
  | "income-create"
  | "cashflow-assumptions"
  | "pnl-export"
  | "rule-create"
  | "rule-edit"
  | "rule-toggle"
  | "portfolio"
  | "settings"
  | "payee"
  | "budget-alerts"
  | "receipt"
  | null;

type MoneyModal = "deposit" | "withdraw" | "expense";
type ExpenseFilter = "all" | "Paid" | "Pending" | "Scheduled" | "Future";
type IncomeFilter = "all" | "Received" | "Pending" | "Future";

function money(value: number) {
  return kes(Math.round(value));
}

function downloadText(filename: string, body: string, type = "text/csv") {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function statusTone(status: MoneyStatus) {
  return moneyStatusTone(status);
}

function expenseCategoryTone(category: string) {
  if (category === "Labour") return "medium" as const;
  if (category === "Crop protection") return "high" as const;
  return "neutral" as const;
}

function FinanceManagementPage() {
  const [view, setView] = useState<FinancialView>("wallet");
  const [walletBalance, setWalletBalance] = useState(
    FINANCE_CONTEXT.walletBalance,
  );
  const [walletActivity, setWalletActivity] =
    useState<WalletActivity[]>(WALLET_ACTIVITY);
  const [budgets, setBudgets] = useState<FinancialBudget[]>(BUDGETS);
  const [categories, setCategories] =
    useState<BudgetCategory[]>(BUDGET_CATEGORIES);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(EXPENSES);
  const [income, setIncome] = useState<IncomeRecord[]>(INCOME);
  const [cashFlow, setCashFlow] = useState<CashFlowMonth[]>(CASH_FLOW);
  const [rules, setRules] = useState<AutoPayRule[]>(AUTO_PAY_RULES);
  const [settings, setSettings] =
    useState<FinancialSettings>(FINANCIAL_SETTINGS);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<ModalId>(null);
  const [moneyModal, setMoneyModal] = useState<MoneyModal>("deposit");
  const [pendingExpenseId, setPendingExpenseId] = useState<string | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState("bud-cabbage");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null,
  );
  const [selectedIncomeId, setSelectedIncomeId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] =
    useState<WalletActivity | null>(null);
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] =
    useState<CropFinancialOverview | null>(null);
  const [editingBudget, setEditingBudget] = useState<FinancialBudget | null>(
    null,
  );
  const [editingRule, setEditingRule] = useState<AutoPayRule | null>(null);
  const [selectedPayee, setSelectedPayee] = useState(
    FINANCIAL_PAYEES[0]?.name ?? "",
  );
  const [cashFlowAssumptions, setCashFlowAssumptions] = useState({
    reserve: 20,
    price: 30,
    costs: 5,
  });

  const openModal = (next: Exclude<ModalId, null>) => setModal(next);
  const closeModal = () => setModal(null);
  const selectedBudget =
    budgets.find((budget) => budget.id === selectedBudgetId) ?? budgets[0];
  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null;
  const selectedExpense =
    expenses.find((expense) => expense.id === selectedExpenseId) ?? null;
  const selectedIncome =
    income.find((record) => record.id === selectedIncomeId) ?? null;
  const pendingExpense =
    expenses.find((expense) => expense.id === pendingExpenseId) ?? null;

  const addWalletActivity = (
    activity: Omit<WalletActivity, "id" | "balanceAfter" | "time">,
    nextBalance: number,
  ) => {
    setWalletActivity((current) => [
      {
        ...activity,
        id: `wa-new-${Date.now()}`,
        time: "Just now",
        balanceAfter: nextBalance,
      },
      ...current,
    ]);
  };

  const updateBudgetSpend = (
    budgetId: string | null,
    amount: number,
    categoryName: string,
  ) => {
    if (!budgetId || amount <= 0) return;
    setBudgets((current) =>
      current.map((budget) =>
        budget.id === budgetId
          ? {
              ...budget,
              spent: budget.spent + amount,
              status:
                budget.spent + amount > budget.total
                  ? "Over budget"
                  : budget.status,
            }
          : budget,
      ),
    );
    setCategories((current) => {
      const candidates = current.filter(
        (category) => category.budgetId === budgetId,
      );
      const match =
        candidates.find((category) =>
          category.category.toLowerCase().includes(categoryName.toLowerCase()),
        ) ??
        candidates.find((category) => category.status !== "Future") ??
        candidates[0];
      if (!match) return current;
      return current.map((category) =>
        category.id === match.id
          ? {
              ...category,
              spent: category.spent + amount,
              status:
                category.spent + amount > category.allocated
                  ? "Over budget"
                  : category.status,
            }
          : category,
      );
    });
  };

  const handleMoneyComplete = (amount: number, receipt: string) => {
    const mode = moneyModal;
    const nextBalance =
      mode === "deposit" ? walletBalance + amount : walletBalance - amount;
    setWalletBalance(nextBalance);
    if (mode === "expense" && pendingExpense) {
      setExpenses((current) =>
        current.map((expense) =>
          expense.id === pendingExpense.id
            ? { ...expense, status: "Paid", receipt }
            : expense,
        ),
      );
      updateBudgetSpend(
        pendingExpense.budgetId,
        amount,
        pendingExpense.subCategory,
      );
      addWalletActivity(
        {
          kind: "Out",
          description: `Paid ${pendingExpense.payee} — ${pendingExpense.description}`,
          amount,
          category: pendingExpense.category,
          receipt,
          status: "Paid",
        },
        nextBalance,
      );
      setPendingExpenseId(null);
    } else if (mode === "deposit") {
      addWalletActivity(
        {
          kind: "In",
          description: "Deposit from M-Pesa",
          amount,
          category: "Deposit",
          receipt,
          status: "Received",
        },
        nextBalance,
      );
    } else {
      addWalletActivity(
        {
          kind: "Out",
          description: "Withdrawal to 0712 345 678",
          amount,
          category: "Withdrawal",
          receipt,
          status: "Paid",
        },
        nextBalance,
      );
    }
    setView("wallet");
  };

  const handleBudgetSave = (budget: FinancialBudget) => {
    const existing = budgets.some((item) => item.id === budget.id);
    setBudgets((current) =>
      existing
        ? current.map((item) => (item.id === budget.id ? budget : item))
        : [budget, ...current],
    );
    if (!existing) {
      setCategories((current) => [
        {
          id: `${budget.id}-land`,
          budgetId: budget.id,
          category: "Land preparation",
          allocated: Math.round(budget.total * 0.1),
          spent: 0,
          note: "Add local land preparation estimate.",
          status: "Future",
        },
        {
          id: `${budget.id}-inputs`,
          budgetId: budget.id,
          category: "Inputs",
          allocated: Math.round(budget.total * 0.4),
          spent: 0,
          note: "Seed, fertilizer and protection.",
          status: "Future",
        },
        {
          id: `${budget.id}-labour`,
          budgetId: budget.id,
          category: "Labour",
          allocated: Math.round(budget.total * 0.25),
          spent: 0,
          note: "Link to scheduled tasks.",
          status: "Future",
        },
        {
          id: `${budget.id}-harvest`,
          budgetId: budget.id,
          category: "Harvest & transport",
          allocated: Math.round(budget.total * 0.25),
          spent: 0,
          note: "Reserve for the buyer route.",
          status: "Future",
        },
        ...current,
      ]);
    }
    setSelectedBudgetId(budget.id);
  };

  const handleCategorySave = (category: {
    id: string;
    category: string;
    allocated: number;
    spent: number;
    note: string;
    status: BudgetStatus;
  }) => {
    setCategories((current) =>
      current.map((item) =>
        item.id === category.id ? { ...item, ...category } : item,
      ),
    );
  };

  const handleExpenseSave = (expense: ExpenseRecord) => {
    setExpenses((current) => [expense, ...current]);
    if (expense.method === "GrowMO wallet") {
      setPendingExpenseId(expense.id);
      setMoneyModal("expense");
      openModal("expense-payment");
    } else {
      updateBudgetSpend(expense.budgetId, expense.amount, expense.subCategory);
    }
    setView("expenses");
  };

  const deleteExpense = () => {
    if (!selectedExpense) return;
    setExpenses((current) =>
      current.filter((expense) => expense.id !== selectedExpense.id),
    );
    setSelectedExpenseId(null);
  };

  const handleIncomeSave = (record: IncomeRecord) => {
    setIncome((current) => [record, ...current]);
    setView("income");
  };

  const markIncomeReceived = (id: string) => {
    setIncome((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              status: "Received",
              receipt: record.receipt ?? `INC${id.slice(-3).toUpperCase()}7K`,
            }
          : record,
      ),
    );
  };

  const handleCashFlowAssumptions = (next: {
    reserve: number;
    price: number;
    costs: number;
  }) => {
    setCashFlowAssumptions(next);
    const ratio = next.price / 30;
    setCashFlow((current) =>
      current
        .map((month) => {
          const adjustedIn =
            month.inflows > 0
              ? Math.round(month.inflows * ratio * (1 - next.reserve / 100))
              : 0;
          const adjustedOut = Math.round(
            month.outflows * (1 + next.costs / 100),
          );
          return {
            ...month,
            inflows: adjustedIn,
            outflows: adjustedOut,
            net: adjustedIn - adjustedOut,
          };
        })
        .map((month, index, all) => ({
          ...month,
          cumulative: all
            .slice(0, index + 1)
            .reduce((sum, item) => sum + item.net, 0),
        })),
    );
  };

  const handleRuleSave = (rule: AutoPayRule) => {
    setRules((current) =>
      current.some((item) => item.id === rule.id)
        ? current.map((item) => (item.id === rule.id ? rule : item))
        : [rule, ...current],
    );
  };

  const toggleRule = () => {
    if (!editingRule) return;
    setRules((current) =>
      current.map((rule) =>
        rule.id === editingRule.id
          ? { ...rule, status: rule.status === "Active" ? "Paused" : "Active" }
          : rule,
      ),
    );
  };

  const exportExpenses = () =>
    downloadText(
      "growmo-expenses.csv",
      [
        "Date,Description,Category,Crop,Amount,Method,Payee,Receipt,Status",
        ...expenses.map((expense) =>
          [
            expense.date,
            expense.description,
            expense.category,
            expense.crop,
            expense.amount,
            expense.method,
            expense.payee,
            expense.receipt ?? "",
            expense.status,
          ]
            .map(csvCell)
            .join(","),
        ),
      ].join("\n"),
    );
  const exportFinanceReport = () => {
    const reportRows: (string | number)[][] = [
      ["Wallet", "Available balance", walletBalance],
      ["Wallet", "Allocated", FINANCE_CONTEXT.allocated],
      [
        "Budgets",
        "Total planned",
        budgets.reduce((sum, budget) => sum + budget.total, 0),
      ],
      [
        "Budgets",
        "Total spent",
        budgets.reduce((sum, budget) => sum + budget.spent, 0),
      ],
      [
        "Income",
        "Recorded / forecast",
        income.reduce((sum, record) => sum + record.total, 0),
      ],
      [
        "Cash flow",
        "Projected net",
        cashFlow.reduce((sum, month) => sum + month.net, 0),
      ],
    ];
    downloadText(
      "growmo-finance-summary.csv",
      [
        "Section,Metric,Value",
        ...reportRows.map((row) => row.map(csvCell).join(",")),
      ].join("\n"),
    );
  };
  const exportIncome = () =>
    downloadText(
      "growmo-income.csv",
      [
        "Date,Source,Crop,Quantity,Unit price,Total,Method,Buyer,Status",
        ...income.map((record) =>
          [
            record.date,
            record.source,
            record.crop,
            `${record.quantity} ${record.unit}`,
            record.unitPrice,
            record.total,
            record.method,
            record.buyer,
            record.status,
          ]
            .map(csvCell)
            .join(","),
        ),
      ].join("\n"),
    );
  const exportCashFlow = () =>
    downloadText(
      "growmo-cash-flow.csv",
      [
        "Month,Inflows,Outflows,Net,Cumulative",
        ...cashFlow.map((month) =>
          [
            month.month,
            month.inflows,
            month.outflows,
            month.net,
            month.cumulative,
          ]
            .map(csvCell)
            .join(","),
        ),
      ].join("\n"),
    );

  const navItems = [
    {
      id: "wallet" as const,
      label: "Wallet",
      icon: <WalletCards />,
      count: walletActivity.length,
    },
    {
      id: "budgets" as const,
      label: "Budgets",
      icon: <Landmark />,
      count: budgets.length,
    },
    {
      id: "expenses" as const,
      label: "Expenses",
      icon: <ReceiptText />,
      count: expenses.length,
    },
    {
      id: "income" as const,
      label: "Income",
      icon: <TrendingUp />,
      count: income.length,
    },
    { id: "cashflow" as const, label: "Cash flow", icon: <Activity /> },
    { id: "pnl" as const, label: "P&L", icon: <CircleDollarSign /> },
    {
      id: "autopay" as const,
      label: "Auto-pay",
      icon: <ShieldCheck />,
      count: rules.filter((rule) => rule.status === "Active").length,
    },
    {
      id: "portfolio" as const,
      label: "Portfolio",
      icon: <BarChart3 />,
      count: CROP_FINANCIALS.length,
    },
  ];

  const totalPlanned = budgets.reduce((sum, budget) => sum + budget.total, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalIncome = income.reduce((sum, record) => sum + record.total, 0);
  const activeRules = rules.filter((rule) => rule.status === "Active").length;
  const headerKpis = [
    {
      label: "Available balance",
      value: money(walletBalance),
      note: `${money(FINANCE_CONTEXT.effectiveAvailable)} effective after holds`,
    },
    {
      label: "Budgets in flight",
      value: money(totalPlanned),
      note: `${money(totalSpent)} spent across ${budgets.length} plans`,
    },
    {
      label: "Income recorded",
      value: money(totalIncome),
      note: `${income.filter((record) => record.status === "Received").length} received · rest forecast`,
    },
    {
      label: "Active safeguards",
      value: `${activeRules} rules`,
      note: `${settings.requirePinAbove > 0 ? `PIN above ${money(settings.requirePinAbove)}` : "PIN guard disabled"}`,
    },
  ];

  return (
    <main className="gm-app-page gm-finance-page">
      <div className="gm-container py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Link to="/app/dashboard" className="gm-back-link">
              <ArrowRight className="rotate-180" /> Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">Manage</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Finance</strong>
          </div>
          <div className="gm-menu-wrap">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setMenu((current) => !current)}
              aria-expanded={menu}
            >
              <MoreHorizontal /> More finance tools
            </button>
            {menu ? (
              <div className="gm-dropdown gm-finance-menu">
                <button
                  type="button"
                  onClick={() => {
                    exportFinanceReport();
                    setMenu(false);
                  }}
                >
                  <Download /> Download finance summary
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("settings");
                    setMenu(false);
                  }}
                >
                  <Settings2 /> Finance settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("budget-alerts");
                    setMenu(false);
                  }}
                >
                  <BellRing /> Review budget alerts
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <FinanceHeaderCard
          kpis={headerKpis}
          actions={
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => {
                  setMoneyModal("deposit");
                  openModal("deposit");
                }}
              >
                <Plus /> Add money
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-soft"
                onClick={() => {
                  setMoneyModal("withdraw");
                  openModal("withdraw");
                }}
              >
                <ArrowUpRight /> Send to M-Pesa
              </button>
            </div>
          }
        />

        <div className="gm-card p-2 mt-3">
          <PlannerSubtabs
            value={view}
            items={navItems}
            onChange={setView}
            label="Financial management sections"
          />
        </div>

        <Reveal className="mt-4">
          {view === "wallet" ? (
            <WalletView
              walletBalance={walletBalance}
              allocated={FINANCE_CONTEXT.allocated}
              unallocated={Math.max(
                0,
                walletBalance - FINANCE_CONTEXT.allocated,
              )}
              pending={FINANCE_CONTEXT.pendingDeductions}
              activity={walletActivity}
              onActivity={(item) => {
                setSelectedActivity(item);
                setActivityDrawerOpen(true);
              }}
              onDeposit={() => {
                setMoneyModal("deposit");
                openModal("deposit");
              }}
              onWithdraw={() => {
                setMoneyModal("withdraw");
                openModal("withdraw");
              }}
              onExpense={() => openModal("expense-create")}
              onBudgetAlerts={() => openModal("budget-alerts")}
              onExport={exportFinanceReport}
            />
          ) : null}
          {view === "budgets" ? (
            <BudgetsView
              budgets={budgets}
              categories={categories}
              selectedBudgetId={selectedBudgetId}
              selectedBudget={selectedBudget}
              onSelectBudget={setSelectedBudgetId}
              onCreate={() => {
                setEditingBudget(null);
                openModal("budget-create");
              }}
              onEdit={(budget) => {
                setEditingBudget(budget);
                openModal("budget-edit");
              }}
              onCategoryEdit={(category) => {
                setSelectedCategoryId(category.id);
                openModal("category-edit");
              }}
              onAlerts={() => openModal("budget-alerts")}
            />
          ) : null}
          {view === "expenses" ? (
            <ExpensesView
              expenses={expenses}
              onCreate={() => openModal("expense-create")}
              onPayee={() => openModal("payee")}
              onDelete={(id) => {
                setSelectedExpenseId(id);
                openModal("expense-delete");
              }}
              onReceipt={(expense) => {
                setSelectedExpenseId(expense.id);
                openModal("receipt");
              }}
              onExport={exportExpenses}
              onFilterBudget={(id) => {
                setSelectedBudgetId(id);
                setView("budgets");
              }}
            />
          ) : null}
          {view === "income" ? (
            <IncomeView
              income={income}
              onCreate={() => openModal("income-create")}
              onExport={exportIncome}
              onMarkReceived={markIncomeReceived}
              onReceipt={(record) => {
                setSelectedIncomeId(record.id);
                openModal("receipt");
              }}
            />
          ) : null}
          {view === "cashflow" ? (
            <CashFlowView
              months={cashFlow}
              assumptions={cashFlowAssumptions}
              onAssumptions={() => openModal("cashflow-assumptions")}
              onExport={exportCashFlow}
            />
          ) : null}
          {view === "pnl" ? (
            <PnlView onExport={() => openModal("pnl-export")} />
          ) : null}
          {view === "autopay" ? (
            <AutoPayView
              rules={rules}
              onCreate={() => {
                setEditingRule(null);
                openModal("rule-create");
              }}
              onEdit={(rule) => {
                setEditingRule(rule);
                openModal("rule-edit");
              }}
              onToggle={(rule) => {
                setEditingRule(rule);
                openModal("rule-toggle");
              }}
            />
          ) : null}
          {view === "portfolio" ? (
            <PortfolioView
              onOpen={(crop) => {
                setSelectedCrop(crop);
                openModal("portfolio");
              }}
            />
          ) : null}
        </Reveal>
      </div>

      <MpesaMoneyWizard
        open={
          modal === "deposit" ||
          modal === "withdraw" ||
          modal === "expense-payment"
        }
        mode={moneyModal}
        initialAmount={pendingExpense?.amount ?? 0}
        purpose={
          pendingExpense
            ? `${pendingExpense.payee} — ${pendingExpense.description}`
            : "Wanjiku Mixed Farm wallet"
        }
        onClose={closeModal}
        onComplete={handleMoneyComplete}
      />
      <BudgetWizard
        open={modal === "budget-create" || modal === "budget-edit"}
        editing={editingBudget}
        onClose={closeModal}
        onSave={handleBudgetSave}
      />
      <BudgetCategoryDialog
        open={modal === "category-edit"}
        category={selectedCategory}
        onClose={closeModal}
        onSave={handleCategorySave}
      />
      <ExpenseWizard
        open={modal === "expense-create"}
        defaultBudgetId={view === "budgets" ? selectedBudgetId : "bud-cabbage"}
        selectedPayee={selectedPayee}
        onClose={closeModal}
        onSave={handleExpenseSave}
      />
      <ConfirmFinanceDialog
        open={modal === "expense-delete"}
        title="Delete this expense?"
        body={
          selectedExpense
            ? `${selectedExpense.description} · ${money(selectedExpense.amount)} will be removed from this demo ledger. This cannot be undone.`
            : "This expense will be removed."
        }
        confirmLabel="Delete expense"
        destructive
        onClose={closeModal}
        onConfirm={deleteExpense}
      />
      <IncomeWizard
        open={modal === "income-create"}
        onClose={closeModal}
        onSave={handleIncomeSave}
      />
      <CashFlowAssumptionsDialog
        open={modal === "cashflow-assumptions"}
        onClose={closeModal}
        onSave={handleCashFlowAssumptions}
      />
      <PnlExportDialog
        open={modal === "pnl-export"}
        crop="Cabbage Gloria F1 · Short Rains 2026"
        onClose={closeModal}
        onExport={(format) => {
          const rows = PNL_CABBAGE.map((line) =>
            [
              line.group,
              line.label,
              line.budgeted,
              line.actual,
              line.variance,
              line.note,
            ]
              .map(csvCell)
              .join(","),
          );
          downloadText(
            `growmo-cabbage-pnl.${format}`,
            format === "csv"
              ? ["Group,Line,Budgeted,Actual,Variance,Note", ...rows].join("\n")
              : ["GrowMO P&L — Cabbage Gloria F1", ...rows].join("\n"),
            format === "csv" ? "text/csv" : "text/plain",
          );
        }}
      />
      <AutoPayRuleWizard
        open={modal === "rule-create" || modal === "rule-edit"}
        editing={editingRule}
        onClose={closeModal}
        onSave={handleRuleSave}
      />
      <ConfirmFinanceDialog
        open={modal === "rule-toggle"}
        title={
          editingRule?.status === "Active"
            ? "Pause this auto-pay rule?"
            : "Activate this auto-pay rule?"
        }
        body={
          editingRule
            ? `${editingRule.name} is currently ${editingRule.status.toLowerCase()}. The change affects future triggers only; it does not reverse paid transactions.`
            : "Review this rule before changing it."
        }
        confirmLabel={
          editingRule?.status === "Active" ? "Pause rule" : "Activate rule"
        }
        onClose={closeModal}
        onConfirm={toggleRule}
      />
      <FinancialSettingsDialog
        open={modal === "settings"}
        settings={settings}
        onClose={closeModal}
        onSave={setSettings}
      />
      <PayeePickerDialog
        open={modal === "payee"}
        selected={selectedPayee}
        onClose={closeModal}
        onSelect={(payee) => setSelectedPayee(payee.name)}
      />
      <BudgetAlertDialog
        open={modal === "budget-alerts"}
        onClose={closeModal}
      />
      <DashboardDrawer
        open={activityDrawerOpen}
        title="Wallet transaction detail"
        onClose={() => setActivityDrawerOpen(false)}
        footer={
          selectedActivity ? (
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => {
                  if (selectedActivity) {
                    downloadText(
                      `growmo-${selectedActivity.id}-receipt.txt`,
                      `GrowMO wallet receipt\n${selectedActivity.description}\nAmount: ${money(selectedActivity.amount)}\nReference: ${selectedActivity.receipt ?? "Manual entry"}\nBalance after: ${money(selectedActivity.balanceAfter)}`,
                      "text/plain",
                    );
                  }
                }}
              >
                Download receipt
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => setActivityDrawerOpen(false)}
              >
                Close
              </button>
            </div>
          ) : null
        }
      >
        {selectedActivity ? (
          <div className="gm-wizard-stack">
            <div className="gm-plan-detail-hero">
              <span
                className={`gm-finance-activity-icon ${selectedActivity.kind === "In" ? "is-in" : "is-out"}`}
              >
                {selectedActivity.kind === "In" ? (
                  <ArrowDownLeft />
                ) : (
                  <ArrowUpRight />
                )}
              </span>
              <div>
                <span className="gm-eyebrow">{selectedActivity.time}</span>
                <h3 className="font-display mb-1">
                  {selectedActivity.description}
                </h3>
                <StatusChip
                  label={selectedActivity.status}
                  tone={statusTone(selectedActivity.status)}
                />
              </div>
            </div>
            <div className="gm-review-card">
              <div className="gm-review-row">
                <span>Amount</span>
                <strong>
                  {selectedActivity.kind === "In" ? "+" : "−"}
                  {money(selectedActivity.amount)}
                </strong>
              </div>
              <div className="gm-review-row">
                <span>Category</span>
                <strong>{selectedActivity.category}</strong>
              </div>
              <div className="gm-review-row">
                <span>Balance after</span>
                <strong>{money(selectedActivity.balanceAfter)}</strong>
              </div>
              <div className="gm-review-row">
                <span>M-Pesa reference</span>
                <strong>
                  {selectedActivity.receipt ?? "Manual / no code"}
                </strong>
              </div>
            </div>
            <div className="gm-check-row">
              <ShieldCheck />
              <span>
                <strong>Ledger is up to date</strong>
                <small>
                  This activity is part of the current local demo state and can
                  be exported from the Wallet tab.
                </small>
              </span>
            </div>
          </div>
        ) : (
          <p className="text-muted">Select a wallet activity to inspect it.</p>
        )}
      </DashboardDrawer>
      <ReceiptDialog
        open={modal === "receipt"}
        receipt={
          selectedExpense
            ? {
                reference:
                  selectedExpense.receipt ??
                  `CASH-${selectedExpense.id.slice(-3)}`,
                amount: selectedExpense.amount,
                recipient: selectedExpense.payee,
                date: selectedExpense.date,
              }
            : selectedIncome
              ? {
                  reference:
                    selectedIncome.receipt ??
                    `INC-${selectedIncome.id.slice(-3)}`,
                  amount: selectedIncome.total,
                  recipient: selectedIncome.buyer,
                  date: selectedIncome.date,
                }
              : null
        }
        title={selectedExpense ? "Expense receipt" : "Income receipt"}
        onClose={closeModal}
      />
      <PortfolioDialog
        open={modal === "portfolio"}
        crop={selectedCrop}
        onClose={closeModal}
      />
    </main>
  );
}

function WalletView({
  walletBalance,
  allocated,
  unallocated,
  pending,
  activity,
  onActivity,
  onDeposit,
  onWithdraw,
  onExpense,
  onBudgetAlerts,
  onExport,
}: {
  walletBalance: number;
  allocated: number;
  unallocated: number;
  pending: number;
  activity: WalletActivity[];
  onActivity: (item: WalletActivity) => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onExpense: () => void;
  onBudgetAlerts: () => void;
  onExport: () => void;
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "In" | "Out">("all");
  const [page, setPage] = useState(1);
  const filtered = activity.filter(
    (item) =>
      `${item.description} ${item.category} ${item.receipt ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (kind === "all" || item.kind === kind),
  );
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  return (
    <>
      <DashboardSectionHeader
        eyebrow="7.1 · Farm wallet"
        title="The wallet is your farm's heartbeat"
        subtitle="M-Pesa in, protected crop envelopes out — see exactly what is free before you commit."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onExport}
            >
              <Download /> Export ledger
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onExpense}
            >
              <ReceiptText /> Record expense
            </button>
          </div>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={WalletCards}
          label="Available balance"
          value={money(walletBalance)}
          note="Current GrowMO wallet"
        />
        <DashboardMetric
          icon={Landmark}
          label="Allocated to budgets"
          value={money(allocated)}
          note="Locked for specific crops"
        />
        <DashboardMetric
          icon={PiggyBank}
          label="Unallocated"
          value={money(unallocated)}
          note="Freely available today"
        />
        <DashboardMetric
          icon={CalendarClock}
          label="Pending deductions"
          value={money(pending)}
          note="Scheduled payments"
        />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-xl-6">
          <WalletSplit
            balance={walletBalance}
            allocated={allocated}
            unallocated={unallocated}
            pending={pending}
          />
        </div>
        <div className="col-xl-6">
          <WalletActivityMini activity={activity} onSelect={onActivity} />
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
          <div>
            <span className="gm-eyebrow">Actions that move money</span>
            <h3 className="font-display mb-1">Do the next safe thing</h3>
            <p className="text-muted mb-0">
              Chagua hatua — each action ends in a receipt or an updated ledger.
            </p>
          </div>
          <button
            type="button"
            className="gm-btn gm-btn-soft gm-btn-sm"
            onClick={onBudgetAlerts}
          >
            <BellRing /> Budget alerts
          </button>
        </div>
        <div className="row g-2 mt-2">
          <div className="col-md-4">
            <button
              type="button"
              className="gm-action-card"
              onClick={onDeposit}
            >
              <span className="gm-action-icon is-positive">
                <ArrowDownLeft />
              </span>
              <span>
                <strong>Add money via M-Pesa</strong>
                <small>Deposit into the protected farm wallet.</small>
              </span>
              <ArrowRight />
            </button>
          </div>
          <div className="col-md-4">
            <button
              type="button"
              className="gm-action-card"
              onClick={onWithdraw}
            >
              <span className="gm-action-icon">
                <ArrowUpRight />
              </span>
              <span>
                <strong>Send to M-Pesa</strong>
                <small>Withdraw money with OTP + PIN.</small>
              </span>
              <ArrowRight />
            </button>
          </div>
          <div className="col-md-4">
            <Link className="gm-action-card" to="/app/labour">
              <span className="gm-action-icon">
                <HandCoins />
              </span>
              <span>
                <strong>Review payroll</strong>
                <small>See labour payments before they leave.</small>
              </span>
              <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
          <div>
            <span className="gm-eyebrow">Wallet ledger</span>
            <h3 className="font-display mb-1">Every movement, searchable</h3>
            <p className="text-muted mb-0">
              {filtered.length} matching transaction
              {filtered.length === 1 ? "" : "s"} · latest first
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <div className="gm-search-wrap">
              <Search />
              <input
                className="gm-input"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search wallet activity"
              />
            </div>
            <select
              className="gm-select"
              value={kind}
              onChange={(event) => {
                setKind(event.target.value as "all" | "In" | "Out");
                setPage(1);
              }}
            >
              <option value="all">In and out</option>
              <option value="In">Money in</option>
              <option value="Out">Money out</option>
            </select>
          </div>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance after</th>
                <th>Receipt</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>
                    <small>{item.time}</small>
                  </td>
                  <td>
                    <strong>{item.description}</strong>
                    <small className="d-block text-muted">
                      {item.category}
                    </small>
                  </td>
                  <td>
                    <StatusChip
                      label={item.kind === "In" ? "Money in" : "Money out"}
                      tone={item.kind === "In" ? "low" : "neutral"}
                    />
                  </td>
                  <td>
                    <strong
                      className={`font-display ${item.kind === "In" ? "text-success" : ""}`}
                    >
                      {item.kind === "In" ? "+" : "−"}
                      {money(item.amount)}
                    </strong>
                  </td>
                  <td>{money(item.balanceAfter)}</td>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link"
                      onClick={() => onActivity(item)}
                    >
                      {item.receipt ?? "View entry"}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`View ${item.description}`}
                      onClick={() => onActivity(item)}
                    >
                      <Eye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">
            No wallet movement matches that search.
          </p>
        ) : null}
        <Pagination
          page={Math.min(page, totalPages)}
          total={totalPages}
          onChange={setPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
    </>
  );
}

function BudgetsView({
  budgets,
  categories,
  selectedBudgetId,
  selectedBudget,
  onSelectBudget,
  onCreate,
  onEdit,
  onCategoryEdit,
  onAlerts,
}: {
  budgets: FinancialBudget[];
  categories: BudgetCategory[];
  selectedBudgetId: string;
  selectedBudget: FinancialBudget;
  onSelectBudget: (id: string) => void;
  onCreate: () => void;
  onEdit: (budget: FinancialBudget) => void;
  onCategoryEdit: (category: BudgetCategory) => void;
  onAlerts: () => void;
}) {
  const [query, setQuery] = useState("");
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | "all">("all");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);
  const budgetRows = budgets.filter(
    (budget) =>
      `${budget.name} ${budget.crop} ${budget.plot}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (budgetStatus === "all" || budget.status === budgetStatus),
  );
  const categoryRows = categories.filter(
    (category) =>
      category.budgetId === selectedBudgetId &&
      `${category.category} ${category.note}`
        .toLowerCase()
        .includes(categoryQuery.toLowerCase()),
  );
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(categoryRows.length / perPage));
  const visibleCategories = categoryRows.slice(
    (categoryPage - 1) * perPage,
    categoryPage * perPage,
  );
  const selectedSpent = categories
    .filter((category) => category.budgetId === selectedBudgetId)
    .reduce((sum, category) => sum + category.spent, 0);
  return (
    <>
      <DashboardSectionHeader
        eyebrow="7.2 · Budget planner"
        title="Give every crop a spending envelope"
        subtitle="Create a plan per crop and season, then compare planned allocation with the actual ledger."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-soft"
              onClick={onAlerts}
            >
              <BellRing /> Review alerts
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onCreate}
            >
              <Plus /> Create budget
            </button>
          </div>
        }
      />
      <div className="gm-filter-bar gm-card p-3 mt-3">
        <div className="gm-search-wrap">
          <Search />
          <input
            className="gm-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search crop, plot or budget"
          />
        </div>
        <select
          className="gm-select"
          value={budgetStatus}
          onChange={(event) =>
            setBudgetStatus(event.target.value as BudgetStatus | "all")
          }
        >
          <option value="all">All budget states</option>
          <option>On track</option>
          <option>Over budget</option>
          <option>Future</option>
          <option>Complete</option>
        </select>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={() => {
            setQuery("");
            setBudgetStatus("all");
          }}
        >
          <RefreshCw /> Reset
        </button>
      </div>
      <div className="row g-3 mt-1">
        {budgetRows.map((budget) => (
          <div className="col-xl-6" key={budget.id}>
            <BudgetHealthCard
              budget={budget}
              onOpen={() => onSelectBudget(budget.id)}
              onEdit={() => onEdit(budget)}
            />
          </div>
        ))}
      </div>
      {budgetRows.length === 0 ? (
        <div className="gm-card p-4 mt-3 text-center">
          <p className="text-muted mb-0">
            No budget matches. Try another crop or state.
          </p>
        </div>
      ) : null}
      <div className="row g-3 mt-1">
        <div className="col-xl-8">
          <div className="gm-card p-3 h-100">
            <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
              <div>
                <span className="gm-eyebrow">
                  Category allocation · {selectedBudget.crop}
                </span>
                <h3 className="font-display mb-1">Where the budget is going</h3>
                <p className="text-muted mb-0">
                  {money(selectedSpent)} actual spend against{" "}
                  {money(selectedBudget.total)} plan
                </p>
              </div>
              <select
                className="gm-select"
                value={selectedBudgetId}
                onChange={(event) => {
                  onSelectBudget(event.target.value);
                  setCategoryPage(1);
                }}
                aria-label="Choose budget"
              >
                {budgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.crop} · {budget.plot}
                  </option>
                ))}
              </select>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <div className="gm-search-wrap">
                <Search />
                <input
                  className="gm-input"
                  value={categoryQuery}
                  onChange={(event) => {
                    setCategoryQuery(event.target.value);
                    setCategoryPage(1);
                  }}
                  placeholder="Search categories"
                />
              </div>
              <StatusChip
                label={`${budgetProgress(selectedBudget)}% of plan spent`}
                tone={selectedBudget.status === "Over budget" ? "high" : "low"}
              />
            </div>
            <div className="gm-table-wrap mt-3">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Allocated</th>
                    <th>Spent</th>
                    <th>Remaining</th>
                    <th>State</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visibleCategories.map((category) => {
                    const remaining = category.allocated - category.spent;
                    return (
                      <tr key={category.id}>
                        <td>
                          <strong>{category.category}</strong>
                          <small className="d-block text-muted">
                            {category.note}
                          </small>
                        </td>
                        <td>{money(category.allocated)}</td>
                        <td>{money(category.spent)}</td>
                        <td className={remaining < 0 ? "text-danger" : ""}>
                          {remaining < 0
                            ? `−${money(Math.abs(remaining))}`
                            : money(remaining)}
                        </td>
                        <td>
                          <StatusChip
                            label={category.status}
                            tone={budgetStatusTone(category.status)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="gm-icon-btn"
                            aria-label={`Adjust ${category.category}`}
                            onClick={() => onCategoryEdit(category)}
                          >
                            <Pencil />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {visibleCategories.length === 0 ? (
              <p className="text-muted text-center py-4 mb-0">
                No category matches.
              </p>
            ) : null}
            <Pagination
              page={Math.min(categoryPage, totalPages)}
              total={totalPages}
              onChange={setCategoryPage}
              perPage={perPage}
              totalItems={categoryRows.length}
            />
          </div>
        </div>
        <div className="col-xl-4">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Budget alerts</span>
            <h3 className="font-display mb-2">Small warnings, early action</h3>
            <div className="gm-alert-box is-danger">
              <AlertTriangle />
              <p>
                <strong>Seeds &amp; nursery</strong>
                <br />
                {selectedBudget.id === "bud-cabbage"
                  ? "KES 200 over the original estimate."
                  : "Check price movement before buying."}
              </p>
            </div>
            <div className="gm-alert-box">
              <Sparkles />
              <p>
                <strong>Fertilizer pace</strong>
                <br />
                CAN purchase due in one week; protect the envelope.
              </p>
            </div>
            <div className="gm-alert-box is-success">
              <CheckCircle2 />
              <p>
                <strong>Labour is healthy</strong>
                <br />
                Keep scheduled harvest wages visible.
              </p>
            </div>
            <button
              type="button"
              className="gm-btn gm-btn-outline w-100 mt-2"
              onClick={onAlerts}
            >
              Open all alerts
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ExpensesView({
  expenses,
  onCreate,
  onPayee,
  onDelete,
  onReceipt,
  onExport,
  onFilterBudget,
}: {
  expenses: ExpenseRecord[];
  onCreate: () => void;
  onPayee: () => void;
  onDelete: (id: string) => void;
  onReceipt: (expense: ExpenseRecord) => void;
  onExport: () => void;
  onFilterBudget: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ExpenseFilter>("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = expenses.filter(
    (expense) =>
      `${expense.description} ${expense.payee} ${expense.crop} ${expense.receipt ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "all" || expense.status === status) &&
      (category === "all" || expense.category === category),
  );
  const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);
  const walletSpend = expenses
    .filter((expense) => expense.method === "GrowMO wallet")
    .reduce((sum, expense) => sum + expense.amount, 0);
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  return (
    <>
      <DashboardSectionHeader
        eyebrow="7.3 · Expense recording"
        title="Turn receipts into decisions"
        subtitle="Record a quick expense, link it to a crop budget, and use the ledger to explain every variance."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onPayee}
            >
              <ListFilter /> Payee directory
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-soft"
              onClick={onExport}
            >
              <Download /> Export CSV
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onCreate}
            >
              <Plus /> Quick expense
            </button>
          </div>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={ReceiptText}
          label="Ledger total"
          value={money(total)}
          note={`${filtered.length} matching records`}
        />
        <DashboardMetric
          icon={WalletCards}
          label="GrowMO wallet spend"
          value={money(walletSpend)}
          note="OTP + PIN protected"
        />
        <DashboardMetric
          icon={AlertTriangle}
          label="Pending / scheduled"
          value={`${expenses.filter((expense) => expense.status === "Pending" || expense.status === "Scheduled").length}`}
          note="Need a review"
        />
        <DashboardMetric
          icon={ShieldCheck}
          label="Receipts attached"
          value={`${expenses.filter((expense) => expense.receipt || expense.receiptPhoto).length}/${expenses.length}`}
          note="Codes or receipt photos"
        />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div className="gm-search-wrap" style={{ flex: "1 1 260px" }}>
            <Search />
            <input
              className="gm-input"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search description, payee, crop or receipt"
            />
          </div>
          <select
            className="gm-select"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All categories</option>
            {[...new Set(expenses.map((expense) => expense.category))].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
          <select
            className="gm-select"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ExpenseFilter);
              setPage(1);
            }}
          >
            <option value="all">All payment states</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Scheduled</option>
            <option>Future</option>
          </select>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setStatus("all");
              setPage(1);
            }}
          >
            <RefreshCw /> Reset
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Date / description</th>
                <th>Category / crop</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Payee</th>
                <th>Receipt</th>
                <th>Budget</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((expense) => (
                <tr key={expense.id}>
                  <td>
                    <strong>{expense.description}</strong>
                    <small className="d-block text-muted">{expense.date}</small>
                  </td>
                  <td>
                    <StatusChip
                      label={expense.category}
                      tone={expenseCategoryTone(expense.category)}
                    />
                    <small className="d-block text-muted">{expense.crop}</small>
                  </td>
                  <td>
                    <strong className="font-display">
                      {money(expense.amount)}
                    </strong>
                    <small className="d-block text-muted">
                      {expense.status}
                    </small>
                  </td>
                  <td>
                    <small>{expense.method}</small>
                  </td>
                  <td>
                    <strong>{expense.payee}</strong>
                    <small className="d-block text-muted">
                      {expense.notes}
                    </small>
                  </td>
                  <td>
                    {expense.receipt || expense.receiptPhoto ? (
                      <button
                        type="button"
                        className="gm-table-link"
                        onClick={() => onReceipt(expense)}
                      >
                        {expense.receipt ?? "Photo"}
                      </button>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    {expense.budgetId ? (
                      <button
                        type="button"
                        className="gm-table-link"
                        onClick={() =>
                          onFilterBudget(expense.budgetId ?? "bud-cabbage")
                        }
                      >
                        Linked
                      </button>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`View ${expense.description}`}
                        onClick={() => onReceipt(expense)}
                      >
                        <Eye />
                      </button>
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`Delete ${expense.description}`}
                        onClick={() => onDelete(expense.id)}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">
            No expense matches these filters.
          </p>
        ) : null}
        <Pagination
          page={Math.min(page, totalPages)}
          total={totalPages}
          onChange={setPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
      <FinanceInsight title="Mwelekeo wa matumizi">
        {walletSpend > 0
          ? `GrowMO wallet payments make up ${Math.round((walletSpend / Math.max(total, 1)) * 100)}% of the filtered ledger. Keep receipt codes with every input purchase.`
          : "Start recording expenses to see your payment mix."}
      </FinanceInsight>
    </>
  );
}

function IncomeView({
  income,
  onCreate,
  onExport,
  onMarkReceived,
  onReceipt,
}: {
  income: IncomeRecord[];
  onCreate: () => void;
  onExport: () => void;
  onMarkReceived: (id: string) => void;
  onReceipt: (record: IncomeRecord) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<IncomeFilter>("all");
  const [page, setPage] = useState(1);
  const filtered = income.filter(
    (record) =>
      `${record.source} ${record.crop} ${record.buyer} ${record.receipt ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "all" || record.status === status),
  );
  const received = income
    .filter((record) => record.status === "Received")
    .reduce((sum, record) => sum + record.total, 0);
  const pending = income
    .filter((record) => record.status === "Pending")
    .reduce((sum, record) => sum + record.total, 0);
  const forecast = income
    .filter((record) => record.status === "Future")
    .reduce((sum, record) => sum + record.total, 0);
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  return (
    <>
      <DashboardSectionHeader
        eyebrow="7.4 · Income recording"
        title="See what each crop will bring home"
        subtitle="Sales, deposits, milk and buyer commitments in one income trail — received today or expected later."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onExport}
            >
              <Download /> Export income
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onCreate}
            >
              <Plus /> Record income
            </button>
          </div>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={CheckCircle2}
          label="Received"
          value={money(received)}
          note="Cleared income"
        />
        <DashboardMetric
          icon={CalendarClock}
          label="Pending"
          value={money(pending)}
          note="Follow up with buyers"
        />
        <DashboardMetric
          icon={TrendingUp}
          label="Forecast"
          value={money(forecast)}
          note="Future harvest value"
        />
        <DashboardMetric
          icon={CircleDollarSign}
          label="Income records"
          value={`${income.length}`}
          note="Across crops and dairy"
        />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div className="gm-search-wrap" style={{ flex: "1 1 280px" }}>
            <Search />
            <input
              className="gm-input"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search source, crop, buyer or receipt"
            />
          </div>
          <select
            className="gm-select"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as IncomeFilter);
              setPage(1);
            }}
          >
            <option value="all">All income states</option>
            <option>Received</option>
            <option>Pending</option>
            <option>Future</option>
          </select>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => {
              setQuery("");
              setStatus("all");
              setPage(1);
            }}
          >
            <RefreshCw /> Reset
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Date / source</th>
                <th>Crop & quantity</th>
                <th>Unit price</th>
                <th>Total</th>
                <th>Method / buyer</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.source}</strong>
                    <small className="d-block text-muted">{record.date}</small>
                  </td>
                  <td>
                    <strong>{record.crop}</strong>
                    <small className="d-block text-muted">
                      {record.quantity.toLocaleString("en-KE")} {record.unit}
                    </small>
                  </td>
                  <td>{money(record.unitPrice)}</td>
                  <td>
                    <strong className="font-display">
                      {money(record.total)}
                    </strong>
                  </td>
                  <td>
                    <small>{record.method}</small>
                    <small className="d-block text-muted">{record.buyer}</small>
                  </td>
                  <td>
                    <StatusChip
                      label={record.status}
                      tone={statusTone(record.status)}
                    />
                    {record.status === "Pending" ? (
                      <button
                        type="button"
                        className="gm-table-link d-block mt-1"
                        onClick={() => onMarkReceived(record.id)}
                      >
                        Mark received
                      </button>
                    ) : null}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`View ${record.source}`}
                      onClick={() => onReceipt(record)}
                    >
                      <Eye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">
            No income matches these filters.
          </p>
        ) : null}
        <Pagination
          page={Math.min(page, totalPages)}
          total={totalPages}
          onChange={setPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
      <FinanceInsight title="Mauzo yenye mchanganyiko">{`The forecast includes ${money(forecast)} from future harvests. Keep the Marikiti broker deposit separate from the January sale so the P&L does not count it twice.`}</FinanceInsight>
    </>
  );
}

function CashFlowView({
  months,
  assumptions,
  onAssumptions,
  onExport,
}: {
  months: CashFlowMonth[];
  assumptions: { reserve: number; price: number; costs: number };
  onAssumptions: () => void;
  onExport: () => void;
}) {
  const net = months.reduce((sum, month) => sum + month.net, 0);
  const lowest = months.reduce(
    (lowestValue, month) => Math.min(lowestValue, month.cumulative),
    Infinity,
  );
  return (
    <>
      <DashboardSectionHeader
        eyebrow="7.5 · Cash flow forecast"
        title="Know the month your cash gets tight"
        subtitle="Green income bars and red outflow commitments help you plan before the harvest cheque arrives."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onExport}
            >
              <Download /> Export forecast
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onAssumptions}
            >
              <Settings2 /> Edit assumptions
            </button>
          </div>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={TrendingUp}
          label="Projected season net"
          value={money(net)}
          note="All six planning months"
        />
        <DashboardMetric
          icon={TrendingDown}
          label="Lowest runway"
          value={money(lowest)}
          note="Cash cumulative low point"
        />
        <DashboardMetric
          icon={PiggyBank}
          label="Reserve assumption"
          value={`${assumptions.reserve}%`}
          note="Held for next season"
        />
        <DashboardMetric
          icon={CircleDollarSign}
          label="Cabbage price"
          value={money(assumptions.price)}
          note="Per head assumption"
        />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-xl-8">
          <CashFlowBars months={months} onOpen={onAssumptions} />
        </div>
        <div className="col-xl-4">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Cash discipline</span>
            <h3 className="font-display mb-2">
              Do not spend January in October
            </h3>
            <p className="text-muted">
              October deposits fund establishment. November and December are
              negative by design; keep the wallet buffer until cabbage and
              tomato sales clear.
            </p>
            <div className="gm-check-row">
              <ShieldCheck />
              <span>
                <strong>Current runway</strong>
                <small>
                  {lowest >= 0
                    ? "Positive in every projected month"
                    : "A shortfall appears before harvest — review payments"}
                </small>
              </span>
              <StatusChip
                label={lowest >= 0 ? "Healthy" : "Watch"}
                tone={lowest >= 0 ? "low" : "high"}
              />
            </div>
            <div className="gm-check-row mt-2">
              <Banknote />
              <span>
                <strong>Outflow buffer</strong>
                <small>
                  {money(
                    months.reduce((sum, month) => sum + month.outflows, 0),
                  )}{" "}
                  projected outflows
                </small>
              </span>
            </div>
            <button
              type="button"
              className="gm-btn gm-btn-soft w-100 mt-3"
              onClick={onAssumptions}
            >
              Test a different price
            </button>
          </div>
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-2">
          <div>
            <span className="gm-eyebrow">Monthly projection</span>
            <h3 className="font-display mb-1">
              Inflows, outflows and cumulative balance
            </h3>
          </div>
          <span className="text-muted">Planning view · KES</span>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Inflows</th>
                <th>Outflows</th>
                <th>Net</th>
                <th>Cumulative</th>
                <th>Decision note</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month) => (
                <tr key={month.id}>
                  <td>
                    <strong>{month.month}</strong>
                  </td>
                  <td className="text-success">+{money(month.inflows)}</td>
                  <td>−{money(month.outflows)}</td>
                  <td>
                    <strong
                      className={
                        month.net >= 0 ? "text-success" : "text-danger"
                      }
                    >
                      {month.net >= 0 ? "+" : "−"}
                      {money(Math.abs(month.net))}
                    </strong>
                  </td>
                  <td>
                    <strong className="font-display">
                      {money(month.cumulative)}
                    </strong>
                  </td>
                  <td>
                    <small>{month.note}</small>
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

function PnlView({ onExport }: { onExport: () => void }) {
  const [crop, setCrop] = useState("Cabbage Gloria F1");
  const [miniTab, setMiniTab] = useState<"statement" | "comparison">(
    "statement",
  );
  const cabbageRevenue = PNL_CABBAGE.filter(
    (line) => line.group === "Revenue" && line.label !== "Total Revenue",
  ).reduce((sum, line) => sum + line.actual, 0);
  const cabbageCosts = PNL_CABBAGE.filter(
    (line) => line.group === "Cost of production",
  ).reduce((sum, line) => sum + line.actual, 0);
  return (
    <>
      <DashboardSectionHeader
        eyebrow="7.6 · Profit & loss"
        title="Profit is a crop decision, not a guess"
        subtitle="Compare budgeted and actual revenue, production costs, net profit and ROI for each season."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onExport}
            >
              <FileDown /> Export statement
            </button>
            <Link className="gm-btn gm-btn-lime" to="/app/crops">
              <ArrowRight /> Open crop tracker
            </Link>
          </div>
        }
      />
      <div className="gm-card p-2 mt-3">
        <div
          className="gm-tabs"
          role="tablist"
          aria-label="Profit and loss crop selector"
        >
          <button
            type="button"
            className={`gm-tab ${crop === "Cabbage Gloria F1" ? "on" : ""}`}
            role="tab"
            aria-selected={crop === "Cabbage Gloria F1"}
            onClick={() => setCrop("Cabbage Gloria F1")}
          >
            Cabbage · Plot 1
          </button>
          <button
            type="button"
            className={`gm-tab ${crop === "Maize H6213" ? "on" : ""}`}
            role="tab"
            aria-selected={crop === "Maize H6213"}
            onClick={() => setCrop("Maize H6213")}
          >
            Maize · Plot 2
          </button>
          <button
            type="button"
            className={`gm-tab ${crop === "Tomato Anna F1" ? "on" : ""}`}
            role="tab"
            aria-selected={crop === "Tomato Anna F1"}
            onClick={() => setCrop("Tomato Anna F1")}
          >
            Tomato · Greenhouse
          </button>
        </div>
      </div>
      {crop === "Cabbage Gloria F1" ? (
        <>
          <div className="row g-3 mt-1">
            <div className="col-xl-7">
              <PnlSummary
                revenue={318000}
                costs={69800}
                profit={246200}
                roi={353}
                onOpen={onExport}
              />
            </div>
            <div className="col-xl-5">
              <div className="gm-card p-4 h-100">
                <span className="gm-eyebrow">Decision lens</span>
                <h3 className="font-display mb-2">
                  Direct sales changed the picture
                </h3>
                <p className="text-muted">
                  Marikiti revenue softened by KES 6,000, but direct buyers
                  contributed KES 84,000 that was not in the original budget.
                </p>
                <div className="gm-check-row">
                  <TrendingUp />
                  <span>
                    <strong>Gross profit</strong>
                    <small>Budget KES 166,000 · actual KES 248,200</small>
                  </span>
                  <StatusChip label="+KES 82,200" tone="low" />
                </div>
                <div className="gm-check-row mt-2">
                  <AlertTriangle />
                  <span>
                    <strong>Variance to watch</strong>
                    <small>
                      Seeds +KES 200 · labour +KES 600 · harvest +KES 1,000
                    </small>
                  </span>
                  <StatusChip label="Review" tone="medium" />
                </div>
              </div>
            </div>
          </div>
          <div className="gm-card p-3 mt-3">
            <div className="d-flex flex-wrap align-items-end justify-content-between gap-2">
              <div>
                <span className="gm-eyebrow">
                  Cabbage · 0.5 acre · Short Rains 2026
                </span>
                <h3 className="font-display mb-1">
                  Budgeted versus actual statement
                </h3>
              </div>
              <div
                className="gm-tabs gm-tabs-mini"
                role="tablist"
                aria-label="P and L table view"
              >
                <button
                  type="button"
                  className={`gm-tab ${miniTab === "statement" ? "on" : ""}`}
                  onClick={() => setMiniTab("statement")}
                >
                  Statement
                </button>
                <button
                  type="button"
                  className={`gm-tab ${miniTab === "comparison" ? "on" : ""}`}
                  onClick={() => setMiniTab("comparison")}
                >
                  Variance guide
                </button>
              </div>
            </div>
            {miniTab === "statement" ? (
              <div className="gm-table-wrap mt-3">
                <table className="gm-table">
                  <thead>
                    <tr>
                      <th>Line item</th>
                      <th>Budgeted</th>
                      <th>Actual</th>
                      <th>Variance</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PNL_CABBAGE.map((line) => (
                      <tr
                        key={line.id}
                        className={
                          line.group === "Profit" ? "gm-table-total" : ""
                        }
                      >
                        <td>
                          <strong>{line.label}</strong>
                          <small className="d-block text-muted">
                            {line.group}
                          </small>
                        </td>
                        <td>{money(line.budgeted)}</td>
                        <td>
                          <strong>{money(line.actual)}</strong>
                        </td>
                        <td
                          className={
                            line.variance > 0
                              ? "text-success"
                              : line.variance < 0
                                ? "text-danger"
                                : ""
                          }
                        >
                          {line.variance > 0
                            ? "+"
                            : line.variance < 0
                              ? "−"
                              : ""}
                          {money(Math.abs(line.variance))}
                        </td>
                        <td>
                          <small>{line.note}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="row g-3 mt-2">
                <div className="col-md-4">
                  <div className="gm-kpi-soft">
                    <small>Revenue variance</small>
                    <strong className="font-display text-success">
                      +{money(78000)}
                    </strong>
                    <span>Direct buyer channel added upside.</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="gm-kpi-soft">
                    <small>Cost variance</small>
                    <strong className="font-display text-success">
                      −{money(4200)}
                    </strong>
                    <span>Actual cost below production budget.</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="gm-kpi-soft">
                    <small>Profit per head</small>
                    <strong className="font-display">KES 30.78</strong>
                    <span>Cost per head KES 8.73.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="gm-card p-4 mt-3">
          <h3 className="font-display">{crop} P&amp;L</h3>
          <p className="text-muted">
            This demo view is ready for the same full statement once the next
            crop has a completed harvest ledger.
          </p>
          <div className="gm-check-row">
            <CircleDollarSign />
            <span>
              <strong>
                Use the Portfolio tab for the current crop forecast
              </strong>
              <small>
                Maize is currently at KES 2,000 projected loss; tomatoes are on
                track.
              </small>
            </span>
            <Link to="/app/finance" className="gm-btn gm-btn-outline gm-btn-sm">
              View portfolio
            </Link>
          </div>
        </div>
      )}
      <FinanceInsight title="Faida halisi">{`Cabbage revenue is ${money(cabbageRevenue)} against ${money(cabbageCosts)} production cost. That is a ${Math.round(((cabbageRevenue - cabbageCosts) / Math.max(cabbageCosts, 1)) * 100)}% return before contingency.`}</FinanceInsight>
    </>
  );
}

function AutoPayView({
  rules,
  onCreate,
  onEdit,
  onToggle,
}: {
  rules: AutoPayRule[];
  onCreate: () => void;
  onEdit: (rule: AutoPayRule) => void;
  onToggle: (rule: AutoPayRule) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "Active" | "Paused">("all");
  const filtered = rules.filter(
    (rule) =>
      `${rule.name} ${rule.trigger} ${rule.action}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" || rule.status === filter),
  );
  return (
    <>
      <DashboardSectionHeader
        eyebrow="7.7 · Auto-pay rules engine"
        title="Automate the repeatable, protect the important"
        subtitle="Rules can pay workers, request PIN approval, or alert you at the budget limit. Pause anything before it runs."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime"
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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search rules, triggers or actions"
            />
          </div>
          <select
            className="gm-select"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as "all" | "Active" | "Paused")
            }
          >
            <option value="all">All rules</option>
            <option>Active</option>
            <option>Paused</option>
          </select>
          <span className="gm-filter-chip on">
            {rules.filter((rule) => rule.status === "Active").length} active
          </span>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Rule</th>
                <th>Trigger</th>
                <th>Action</th>
                <th>Amount</th>
                <th>Last run</th>
                <th>Status</th>
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
                  <td>{rule.trigger}</td>
                  <td>{rule.action}</td>
                  <td>{rule.amount}</td>
                  <td>{rule.lastRun}</td>
                  <td>
                    <StatusChip
                      label={rule.status}
                      tone={rule.status === "Active" ? "low" : "neutral"}
                    />
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
                        {rule.status === "Active" ? <X /> : <Check />}
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
      <FinanceInsight title="Usalama kwanza">
        Only turn on auto-pay for predictable commitments. Keep the budget hard
        stop paused until the household has reviewed the category envelopes.
      </FinanceInsight>
    </>
  );
}

function PortfolioView({
  onOpen,
}: {
  onOpen: (crop: CropFinancialOverview) => void;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const rows = CROP_FINANCIALS.filter((crop) =>
    `${crop.crop} ${crop.acreage} ${crop.status}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const perPage = 4;
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  const totalBudget = CROP_FINANCIALS.reduce(
    (sum, crop) => sum + crop.budget,
    0,
  );
  const totalSpent = CROP_FINANCIALS.reduce((sum, crop) => sum + crop.spent, 0);
  const totalRevenue = CROP_FINANCIALS.reduce(
    (sum, crop) => sum + crop.revenue,
    0,
  );
  const totalProfit = CROP_FINANCIALS.reduce(
    (sum, crop) => sum + crop.profit,
    0,
  );
  return (
    <>
      <DashboardSectionHeader
        eyebrow="7.8 · Multi-crop financial overview"
        title="See the farm as a portfolio"
        subtitle="Cabbage, maize, tomatoes and beans each tell a different story. Protect the winners and fix the weak assumptions early."
        action={
          <Link to="/app/planner" className="gm-btn gm-btn-lime">
            <ArrowRight /> Open crop planner
          </Link>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={Landmark}
          label="Farm budget"
          value={money(totalBudget)}
          note="All crop plans"
        />
        <DashboardMetric
          icon={ReceiptText}
          label="Farm spent"
          value={money(totalSpent)}
          note="Across current ledgers"
        />
        <DashboardMetric
          icon={TrendingUp}
          label="Revenue"
          value={money(totalRevenue)}
          note="Received and forecast"
        />
        <DashboardMetric
          icon={CircleDollarSign}
          label="Portfolio profit"
          value={money(totalProfit)}
          note="Before new season reserve"
        />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-xl-7">
          <div className="gm-card p-4 h-100">
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
              <div>
                <span className="gm-eyebrow">Profit by enterprise</span>
                <h3 className="font-display mb-1">
                  Let margin guide the next acre
                </h3>
                <p className="text-muted mb-0">Projected net profit per crop</p>
              </div>
              <StatusChip label="4 enterprises" tone="low" />
            </div>
            <div className="mt-3">
              <BarChart
                rows={CROP_FINANCIALS.map((crop) => ({
                  id: crop.id,
                  label: crop.crop.split(" ")[0],
                  sub: `${crop.roi}% ROI`,
                  value: Math.max(0, crop.profit),
                  highlight: crop.profit > 100000,
                }))}
                unitLabel="Maize is shown as zero-height in this comparison because its projected profit is negative."
                formatValue={(value) =>
                  value >= 1000 ? `${Math.round(value / 1000)}K` : `${value}`
                }
              />
            </div>
          </div>
        </div>
        <div className="col-xl-5">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Portfolio decision</span>
            <h3 className="font-display mb-2">Cabbage funds the next move</h3>
            <p className="text-muted">
              Cabbage and tomatoes create the strongest margin. Maize is a watch
              item at a projected KES 2,000 loss; do not expand it before
              checking input rates and buyer price.
            </p>
            <div className="gm-check-row">
              <TrendingUp />
              <span>
                <strong>Best ROI</strong>
                <small>Cabbage Gloria F1 · 353%</small>
              </span>
              <StatusChip label="Lead" tone="low" />
            </div>
            <div className="gm-check-row mt-2">
              <AlertTriangle />
              <span>
                <strong>Needs review</strong>
                <small>Maize H6213 · −3% ROI</small>
              </span>
              <StatusChip label="Watch" tone="high" />
            </div>
          </div>
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2">
          <div>
            <span className="gm-eyebrow">Enterprise comparison</span>
            <h3 className="font-display mb-1">
              Budget, spend, revenue and profit
            </h3>
            <p className="text-muted mb-0">
              Click a row for the crop financial detail.
            </p>
          </div>
          <div className="gm-search-wrap">
            <Search />
            <input
              className="gm-input"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search crop or status"
            />
          </div>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Crop / acreage</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Revenue</th>
                <th>Profit</th>
                <th>ROI</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((crop) => (
                <tr key={crop.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link text-start"
                      onClick={() => onOpen(crop)}
                    >
                      <strong>{crop.crop}</strong>
                      <small className="d-block text-muted">
                        {crop.acreage} · {crop.status}
                      </small>
                    </button>
                  </td>
                  <td>{money(crop.budget)}</td>
                  <td>{money(crop.spent)}</td>
                  <td>{money(crop.revenue)}</td>
                  <td>
                    <strong
                      className={
                        crop.profit >= 0 ? "text-success" : "text-danger"
                      }
                    >
                      {crop.profit >= 0 ? "" : "−"}
                      {money(Math.abs(crop.profit))}
                    </strong>
                  </td>
                  <td>
                    <StatusChip
                      label={`${crop.roi}%`}
                      tone={
                        crop.roi >= 100
                          ? "low"
                          : crop.roi < 0
                            ? "high"
                            : "medium"
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`Open ${crop.crop} detail`}
                      onClick={() => onOpen(crop)}
                    >
                      <Eye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visible.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">No crop matches.</p>
        ) : null}
        <Pagination
          page={Math.min(page, totalPages)}
          total={totalPages}
          onChange={setPage}
          perPage={perPage}
          totalItems={rows.length}
        />
      </div>
    </>
  );
}
